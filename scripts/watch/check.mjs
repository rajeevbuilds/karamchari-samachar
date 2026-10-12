// Watches official circular pages and sends a Telegram message when a page
// lists something new. It does not depend on a page's layout: it reads every
// link on the page and remembers which ones it has seen.
//
//   node scripts/watch/check.mjs
//
// Environment:
//   TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID  where to send alerts (log only if unset)
//   WATCH_STATE      path of the state file   (default .watch/state.json)
//   WATCH_SOURCES    path of the sources file (default scripts/watch/sources.json)
//   TELEGRAM_API_BASE  override for tests

import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import https from 'node:https';
import zlib from 'node:zlib';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const STATE_FILE = process.env.WATCH_STATE || '.watch/state.json';
const SOURCES_FILE = process.env.WATCH_SOURCES || path.join(here, 'sources.json');
const TG_BASE = process.env.TELEGRAM_API_BASE || 'https://api.telegram.org';
const MAX_KEYS = 3000; // links remembered per page
const MAX_LISTED = 10; // new items shown in one message
const UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36';

// ---- fetching ---------------------------------------------------------

function get(url, { insecure = false, redirects = 5 } = {}) {
  return new Promise((resolve, reject) => {
    const u = new URL(url);
    const lib = u.protocol === 'http:' ? http : https;
    const req = lib.get(
      u,
      {
        headers: { 'User-Agent': UA, Accept: 'text/html,application/xhtml+xml,*/*;q=0.8', 'Accept-Language': 'en-IN,en;q=0.9,hi;q=0.8', 'Accept-Encoding': 'gzip, deflate' },
        timeout: 30000,
        ...(u.protocol === 'https:' ? { rejectUnauthorized: !insecure } : {}),
      },
      (res) => {
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          res.resume();
          if (redirects <= 0) return reject(new Error('too many redirects'));
          return resolve(get(new URL(res.headers.location, u).toString(), { insecure, redirects: redirects - 1 }));
        }
        if (res.statusCode !== 200) {
          res.resume();
          return reject(new Error(`HTTP ${res.statusCode}`));
        }
        const enc = res.headers['content-encoding'];
        const stream = enc === 'gzip' ? res.pipe(zlib.createGunzip()) : enc === 'deflate' ? res.pipe(zlib.createInflate()) : res;
        const chunks = [];
        stream.on('data', (c) => chunks.push(c));
        stream.on('end', () => {
          const buf = Buffer.concat(chunks);
          const cs = /charset=([\w-]+)/i.exec(res.headers['content-type'] || '')?.[1] || /<meta[^>]+charset=["']?([\w-]+)/i.exec(buf.subarray(0, 2048).toString('latin1'))?.[1] || 'utf-8';
          let text;
          try {
            text = new TextDecoder(cs).decode(buf);
          } catch {
            text = buf.toString('utf8');
          }
          resolve(text);
        });
        stream.on('error', reject);
      }
    );
    req.on('timeout', () => req.destroy(new Error('timed out')));
    req.on('error', reject);
  });
}

// Some government sites send an incomplete certificate chain. We only read
// public pages and send nothing secret, so on a certificate error we retry
// without verification, and say so in the log.
async function fetchPage(url) {
  let lastErr;
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      return await get(url);
    } catch (err) {
      lastErr = err;
      if (/CERT|certificate|SELF_SIGNED|UNABLE_TO_VERIFY/i.test(`${err.code} ${err.message}`)) {
        console.log(`  certificate problem (${err.code || err.message}); retrying without verification`);
        try {
          return await get(url, { insecure: true });
        } catch (e2) {
          lastErr = e2;
        }
      }
      await new Promise((r) => setTimeout(r, 3000));
    }
  }
  throw lastErr;
}

// ---- parsing ----------------------------------------------------------

const ENTITIES = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ' };
function decode(s) {
  return s
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(Number(d)))
    .replace(/&([a-z]+);/gi, (m, n) => ENTITIES[n.toLowerCase()] ?? m);
}
const clean = (s) => decode(s.replace(/<[^>]*>/g, ' ')).replace(/\s+/g, ' ').trim();

export function extractLinks(html, baseUrl) {
  const out = new Map();
  const re = /<a\b[^>]*?href\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))[^>]*>([\s\S]*?)<\/a>/gi;
  let m;
  while ((m = re.exec(html))) {
    const href = decode((m[1] ?? m[2] ?? m[3] ?? '').trim());
    if (!href || /^(javascript:|mailto:|tel:|#)/i.test(href)) continue;
    let abs;
    try {
      abs = new URL(href, baseUrl);
    } catch {
      continue;
    }
    abs.hash = '';
    // A link's title: its text, else its title attribute, else the file name.
    let title = clean(m[4]);
    if (!title) title = clean((/title\s*=\s*["']([^"']*)["']/i.exec(m[0]) || [])[1] || '');
    if (title.length < 8) {
      if (!/\.(pdf|docx?|xlsx?|zip)(\?|$)/i.test(abs.pathname + abs.search)) continue;
      title = title || decodeURIComponent(abs.pathname.split('/').pop() || abs.toString());
    }
    const key = `${abs.toString()}|${title.toLowerCase().slice(0, 160)}`;
    if (!out.has(key)) out.set(key, { title: title.slice(0, 300), url: abs.toString() });
  }
  return out;
}

export function pageTitle(html) {
  return clean((/<title[^>]*>([\s\S]*?)<\/title>/i.exec(html) || [])[1] || '');
}

// ---- Telegram ---------------------------------------------------------

const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

async function send(text) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chat = process.env.TELEGRAM_CHAT_ID;
  console.log('--- message ---\n' + text.replace(/<[^>]+>/g, '') + '\n---------------');
  if (!token || !chat) return false;
  const res = await fetch(`${TG_BASE}/bot${token}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chat, text, parse_mode: 'HTML', disable_web_page_preview: true }),
  });
  if (!res.ok) throw new Error(`Telegram said HTTP ${res.status}: ${(await res.text()).slice(0, 200)}`);
  return true;
}

// ---- main -------------------------------------------------------------

async function main() {
  const sources = JSON.parse(fs.readFileSync(SOURCES_FILE, 'utf8'));
  let state = {};
  try {
    state = JSON.parse(fs.readFileSync(STATE_FILE, 'utf8'));
  } catch {
    /* first run */
  }
  const before = JSON.stringify(state);
  const problems = [];

  for (const src of sources) {
    console.log(`Checking ${src.id}`);
    const prev = state[src.id];
    try {
      const html = await fetchPage(src.url);
      const links = extractLinks(html, src.url);
      if (links.size === 0) throw new Error('the page loaded but no links could be read from it');
      const keys = [...links.keys()];

      if (!prev || !Array.isArray(prev.keys)) {
        state[src.id] = { keys: keys.slice(0, MAX_KEYS), failures: 0 };
        await send(`👀 Now watching <b>${esc(src.label)}</b>\nPage: ${esc(pageTitle(html) || src.url)}\n${links.size} links noted. You will be told when something new appears.`);
        continue;
      }

      const seen = new Set(prev.keys);
      const fresh = keys.filter((k) => !seen.has(k)).map((k) => links.get(k));
      const wasDown = (prev.failures || 0) >= 3;
      state[src.id] = { keys: [...new Set([...keys, ...prev.keys])].slice(0, MAX_KEYS), failures: 0 };

      if (fresh.length) {
        const shown = fresh.slice(0, MAX_LISTED).map((f) => `• ${esc(f.title)}\n${esc(f.url)}`).join('\n\n');
        const more = fresh.length > MAX_LISTED ? `\n\n…and ${fresh.length - MAX_LISTED} more on the page.` : '';
        await send(`🔔 <b>${esc(src.label)}</b>\n${fresh.length} new ${fresh.length === 1 ? 'item' : 'items'}:\n\n${shown}${more}\n\nPage: ${esc(src.url)}`);
      }
      if (wasDown) await send(`✅ <b>${esc(src.label)}</b> can be read again.`);
    } catch (err) {
      const failures = (prev?.failures || 0) + 1;
      state[src.id] = { ...(prev || { keys: [] }), failures };
      problems.push(`${src.id}: ${err.message}`);
      console.log(`  failed (${failures} in a row): ${err.message}`);
      // Say so after 3 failed checks in a row, then once a day.
      if (failures === 3 || (failures > 3 && failures % 24 === 0)) {
        await send(`⚠️ <b>${esc(src.label)}</b> could not be read ${failures} times in a row.\nReason: ${esc(err.message)}\nNew circulars on this page will not be reported until it works again.\n${esc(src.url)}`);
      }
    }
  }

  fs.mkdirSync(path.dirname(STATE_FILE), { recursive: true });
  fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 1));
  if (JSON.stringify(state) !== before) fs.writeFileSync(path.join(path.dirname(STATE_FILE), 'changed'), '1');
  if (problems.length) console.log(`\n${problems.length} source(s) had problems:\n  ${problems.join('\n  ')}`);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
