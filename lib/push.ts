// Browser push notifications ("Get alerts"). Free and self-hosted: readers
// allow notifications once, their browser gives us a private address
// (a "subscription"), and when a post is published we send a short message to
// each address through the browser vendor's push service.
//
// Needs three environment values (see scripts/gen-vapid-keys.js to make them):
//   VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY, VAPID_SUBJECT (a mailto: or https: address).
// Without them the whole feature switches itself off: no button is shown and
// nothing is sent.

import { createHash } from 'crypto';
import webpush from 'web-push';
import type { ResultSetHeader } from 'mysql2';
import { query } from './db';
import { describeDbError } from './data';
import { summaryPreviewText } from './sanitize';
import { SITE_URL } from './site';

export type PushSubscriptionInput = {
  endpoint: string;
  keys: { p256dh: string; auth: string };
};

const MAX_SUBSCRIPTIONS = 100000;

export function pushConfigured(): boolean {
  return Boolean(process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY);
}

export function vapidPublicKey(): string | null {
  return pushConfigured() ? (process.env.VAPID_PUBLIC_KEY as string) : null;
}

let tableReady: Promise<void> | null = null;
function ensureTable(): Promise<void> {
  if (!tableReady) {
    tableReady = query(
      `CREATE TABLE IF NOT EXISTS push_subscriptions (
         id INT AUTO_INCREMENT PRIMARY KEY,
         endpoint_hash CHAR(64) NOT NULL UNIQUE,
         endpoint TEXT NOT NULL,
         p256dh VARCHAR(255) NOT NULL,
         auth VARCHAR(64) NOT NULL,
         created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
       )`
    )
      .then(() => undefined)
      .catch((err) => {
        tableReady = null;
        throw err;
      });
  }
  return tableReady;
}

const hashOf = (endpoint: string) => createHash('sha256').update(endpoint).digest('hex');

// Returns the cleaned subscription, or null if it is not a real browser one.
export function parseSubscription(body: unknown): PushSubscriptionInput | null {
  const b = (body && typeof body === 'object' ? body : {}) as Record<string, unknown>;
  const keys = (b.keys && typeof b.keys === 'object' ? b.keys : {}) as Record<string, unknown>;
  const endpoint = typeof b.endpoint === 'string' ? b.endpoint.trim() : '';
  const p256dh = typeof keys.p256dh === 'string' ? keys.p256dh.trim() : '';
  const auth = typeof keys.auth === 'string' ? keys.auth.trim() : '';
  if (!/^https:\/\/[^\s]{10,1000}$/.test(endpoint)) return null;
  if (!/^[A-Za-z0-9_-]{60,200}$/.test(p256dh) || !/^[A-Za-z0-9_-]{16,64}$/.test(auth)) return null;
  return { endpoint, keys: { p256dh, auth } };
}

export async function saveSubscription(sub: PushSubscriptionInput): Promise<void> {
  await ensureTable();
  const total = await query<{ n: number }[]>('SELECT COUNT(*) AS n FROM push_subscriptions');
  if (Number(total[0]?.n ?? 0) >= MAX_SUBSCRIPTIONS) throw new Error('Too many subscriptions');
  await query(
    `INSERT INTO push_subscriptions (endpoint_hash, endpoint, p256dh, auth) VALUES (?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE p256dh = VALUES(p256dh), auth = VALUES(auth)`,
    [hashOf(sub.endpoint), sub.endpoint, sub.keys.p256dh, sub.keys.auth]
  );
}

export async function removeSubscription(endpoint: string): Promise<void> {
  await ensureTable();
  await query('DELETE FROM push_subscriptions WHERE endpoint_hash = ?', [hashOf(endpoint)]);
}

export async function countSubscriptions(): Promise<number> {
  try {
    await ensureTable();
    const rows = await query<{ n: number }[]>('SELECT COUNT(*) AS n FROM push_subscriptions');
    return Number(rows[0]?.n ?? 0);
  } catch (err) {
    console.error('countSubscriptions failed —', describeDbError(err));
    return 0;
  }
}

type Row = { id: number; endpoint: string; p256dh: string; auth: string };

// Sends one message to every subscriber, a few hundred at a time. Addresses the
// browser says are gone (404/410) are deleted. Returns how many were delivered.
export async function sendToAll(message: {
  title: string;
  body: string;
  url: string;
  image?: string;
  tag?: string;
}): Promise<{ sent: number; failed: number; removed: number }> {
  const result = { sent: 0, failed: 0, removed: 0 };
  if (!pushConfigured()) return result;
  webpush.setVapidDetails(
    process.env.VAPID_SUBJECT || SITE_URL,
    process.env.VAPID_PUBLIC_KEY as string,
    process.env.VAPID_PRIVATE_KEY as string
  );
  await ensureTable();
  const payload = JSON.stringify(message);
  const BATCH = 200;
  let lastId = 0;
  for (;;) {
    const rows = await query<Row[]>(
      'SELECT id, endpoint, p256dh, auth FROM push_subscriptions WHERE id > ? ORDER BY id LIMIT ?',
      [lastId, BATCH]
    );
    if (rows.length === 0) break;
    lastId = rows[rows.length - 1].id;
    await Promise.all(
      rows.map(async (row) => {
        try {
          await webpush.sendNotification(
            { endpoint: row.endpoint, keys: { p256dh: row.p256dh, auth: row.auth } },
            payload,
            { TTL: 60 * 60 * 24, urgency: 'normal' }
          );
          result.sent++;
        } catch (err) {
          const status = (err as { statusCode?: number }).statusCode;
          if (status === 404 || status === 410) {
            await query<ResultSetHeader>('DELETE FROM push_subscriptions WHERE id = ?', [row.id]).catch(() => undefined);
            result.removed++;
          } else {
            result.failed++;
          }
        }
      })
    );
  }
  return result;
}

// Sends the "new post" notification for a published circular.
export async function notifyAboutCircular(id: number): Promise<{ sent: number; failed: number; removed: number } | null> {
  if (!pushConfigured()) return null;
  const rows = await query<{ slug: string; title: string; summary: string; image_url: string | null; status: string }[]>(
    'SELECT slug, title, summary, image_url, status FROM circulars WHERE id = ?',
    [id]
  );
  const c = rows[0];
  if (!c || c.status !== 'published') return null;
  const image = c.image_url ? (c.image_url.startsWith('http') ? c.image_url : `${SITE_URL}${c.image_url}`) : undefined;
  return sendToAll({
    title: c.title.length > 120 ? `${c.title.slice(0, 117)}…` : c.title,
    body: summaryPreviewText(c.summary, 140),
    url: `/circulars/${c.slug}`,
    image,
    tag: `post-${id}`,
  });
}
