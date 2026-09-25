// The single seam between the UI and the database. Read functions
// (getAllCirculars, getCircularBySlug, getCircularsByState, getLatestDa,
// getDaHistory) never throw — if the database is unreachable or not yet
// configured, they log a warning and return empty/default data so pages
// still render (and `next build` still succeeds). Write functions used by
// the admin panel are allowed to throw; the API routes that call them turn
// those errors into proper HTTP error responses.

import type { ResultSetHeader } from 'mysql2/promise';
import { query } from './db';

export type Circular = {
  slug: string;
  title: string;
  department: string;
  states: string[]; // ["all"] for pan-India, or specific state slugs
  section: string | null; // one of SECTION_OPTIONS, or null for none
  refNumber: string;
  issueDate: string; // ISO date — "Date of Posting"
  effectiveDate?: string;
  summary: string;
  pdfUrl: string | null;
  imageUrl: string | null;
  isFeatured: boolean; // marks it for the homepage "Must Read" sidebar
  viewCount: number;
  category: 'da' | 'pay' | 'transfer' | 'recruitment' | 'pension' | 'general';
  // Drafts (e.g. fresh AIRF imports) are admin-only until saved as published.
  status: 'draft' | 'published';
};

export type DaRecord = {
  effectiveFrom: string;
  percentage: number;
  ordersIssued: string;
};

export type AdminCircular = Circular & { id: number };
export type AdminDaRecord = DaRecord & { id: number };

type CircularRow = {
  id: number;
  slug: string;
  title: string;
  department: string;
  states: string;
  section: string | null;
  ref_number: string;
  issue_date: string;
  effective_date: string | null;
  summary: string;
  pdf_url: string | null;
  image_url: string | null;
  is_featured: number | boolean;
  view_count: number;
  category: Circular['category'];
  status: Circular['status'];
};

type DaRow = {
  id: number;
  effective_from: string;
  percentage: number;
  orders_issued: string;
};

function mapCircular(row: CircularRow): AdminCircular {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    department: row.department,
    states: row.states
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean),
    section: row.section ?? null,
    refNumber: row.ref_number,
    issueDate: row.issue_date,
    effectiveDate: row.effective_date ?? undefined,
    summary: row.summary,
    pdfUrl: row.pdf_url,
    imageUrl: row.image_url ?? null,
    isFeatured: Boolean(row.is_featured),
    viewCount: Number(row.view_count) || 0,
    category: row.category,
    status: row.status ?? 'published',
  };
}

function mapDa(row: DaRow): AdminDaRecord {
  return {
    id: row.id,
    effectiveFrom: row.effective_from,
    percentage: row.percentage,
    ordersIssued: row.orders_issued,
  };
}

const FALLBACK_DA: DaRecord = { effectiveFrom: '', percentage: 0, ordersIssued: '' };

// mysql2 connection failures (e.g. ECONNREFUSED) often surface as an
// AggregateError with an empty top-level message — pull the useful bits
// (error code, nested errors) out so logs are actually actionable.
function describeDbError(err: unknown): string {
  if (err instanceof Error) {
    const code = (err as NodeJS.ErrnoException).code;
    const nested = (err as { errors?: unknown[] }).errors;
    if (nested?.length) {
      return nested.map((e) => (e instanceof Error ? e.message : String(e))).join('; ');
    }
    return code ? `${err.message || err.name} (${code})` : err.message || err.name;
  }
  return String(err);
}

// ---- Reads (used by public pages — never throw) ----------------------

export async function getAllCirculars(): Promise<Circular[]> {
  try {
    const rows = await query<CircularRow[]>(
      "SELECT * FROM circulars WHERE status = 'published' ORDER BY issue_date DESC"
    );
    return rows.map(mapCircular);
  } catch (err) {
    console.error('getAllCirculars: database query failed —', describeDbError(err));
    return [];
  }
}

export async function getCircularBySlug(slug: string): Promise<Circular | undefined> {
  try {
    const rows = await query<CircularRow[]>(
      "SELECT * FROM circulars WHERE slug = ? AND status = 'published' LIMIT 1",
      [slug]
    );
    return rows[0] ? mapCircular(rows[0]) : undefined;
  } catch (err) {
    console.error('getCircularBySlug: database query failed —', describeDbError(err));
    return undefined;
  }
}

export async function getCircularsByState(state: string): Promise<Circular[]> {
  try {
    const rows =
      state === 'central'
        ? await query<CircularRow[]>(
            "SELECT * FROM circulars WHERE status = 'published' AND FIND_IN_SET('all', states) ORDER BY issue_date DESC"
          )
        : await query<CircularRow[]>(
            "SELECT * FROM circulars WHERE status = 'published' AND (FIND_IN_SET('all', states) OR FIND_IN_SET(?, states)) ORDER BY issue_date DESC",
            [state]
          );
    return rows.map(mapCircular);
  } catch (err) {
    console.error('getCircularsByState: database query failed —', describeDbError(err));
    return [];
  }
}

export async function getCircularsBySection(section: string): Promise<Circular[]> {
  try {
    const rows = await query<CircularRow[]>(
      "SELECT * FROM circulars WHERE status = 'published' AND section = ? ORDER BY issue_date DESC",
      [section]
    );
    return rows.map(mapCircular);
  } catch (err) {
    console.error('getCircularsBySection: database query failed —', describeDbError(err));
    return [];
  }
}

// Fire-and-forget view tracking, called from the circular detail page.
// Swallows its own errors so a slow/unreachable database never breaks the
// page — the caller doesn't need to (and shouldn't) await/catch this.
export async function incrementViewCount(slug: string): Promise<void> {
  try {
    await query('UPDATE circulars SET view_count = view_count + 1 WHERE slug = ?', [slug]);
  } catch (err) {
    console.error('incrementViewCount: database query failed —', describeDbError(err));
  }
}

export async function getDaHistory(): Promise<DaRecord[]> {
  try {
    const rows = await query<DaRow[]>('SELECT * FROM da_history ORDER BY effective_from DESC');
    return rows.map(mapDa);
  } catch (err) {
    console.error('getDaHistory: database query failed —', describeDbError(err));
    return [];
  }
}

export async function getLatestDa(): Promise<DaRecord> {
  const history = await getDaHistory();
  return history[0] ?? FALLBACK_DA;
}

// ---- Admin reads (include id; used only behind the admin auth check) -

export async function getAllCircularsAdmin(): Promise<AdminCircular[]> {
  try {
    // Drafts first, so fresh imports awaiting review sit at the top.
    const rows = await query<CircularRow[]>(
      "SELECT * FROM circulars ORDER BY status = 'draft' DESC, issue_date DESC"
    );
    return rows.map(mapCircular);
  } catch (err) {
    console.error('getAllCircularsAdmin: database query failed —', describeDbError(err));
    return [];
  }
}

export async function getAllDaHistoryAdmin(): Promise<AdminDaRecord[]> {
  try {
    const rows = await query<DaRow[]>('SELECT * FROM da_history ORDER BY effective_from DESC');
    return rows.map(mapDa);
  } catch (err) {
    console.error('getAllDaHistoryAdmin: database query failed —', describeDbError(err));
    return [];
  }
}

// ---- Writes (admin panel only — let errors bubble up to the caller) --

export type CircularWriteInput = {
  title: string;
  states: string[];
  section: string;
  issueDate: string;
  summary: string;
  pdfUrl: string;
  imageUrl: string | null;
  isFeatured: boolean;
  category: Circular['category'];
  status: Circular['status'];
};

function slugify(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-+|-+$)/g, '') || 'circular';
}

// Checks every row, drafts included: getCircularBySlug only sees published
// ones, but slug is UNIQUE across the whole table.
async function uniqueSlug(title: string): Promise<string> {
  const baseSlug = slugify(title);
  let slug = baseSlug;
  let suffix = 2;
  while (
    (await query<{ id: number }[]>('SELECT id FROM circulars WHERE slug = ? LIMIT 1', [slug])).length
  ) {
    slug = `${baseSlug}-${suffix++}`;
  }
  return slug;
}

export async function createCircular(input: CircularWriteInput): Promise<number> {
  const slug = await uniqueSlug(input.title);

  const result = await query<ResultSetHeader>(
    `INSERT INTO circulars
       (slug, title, department, states, section, ref_number, issue_date, effective_date, summary, pdf_url, image_url, is_featured, category, status)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      slug,
      input.title,
      // department is no longer collected from the admin form; the column
      // is kept for existing rows but new ones just get ''.
      '',
      input.states.join(','),
      input.section,
      // ref_number/effective_date are retained in the schema for existing
      // rows but are no longer collected from the admin form.
      '',
      input.issueDate,
      null,
      input.summary,
      input.pdfUrl || null,
      input.imageUrl || null,
      input.isFeatured ? 1 : 0,
      input.category,
      input.status,
    ]
  );
  return result.insertId;
}

export async function updateCircular(id: number, input: CircularWriteInput): Promise<void> {
  // department is deliberately left out of the SET list — the admin form no
  // longer collects it, and leaving it out (rather than writing '') keeps
  // whatever value an existing row already had.
  await query(
    `UPDATE circulars
     SET title = ?, states = ?, section = ?, issue_date = ?,
         summary = ?, pdf_url = ?, image_url = ?, is_featured = ?, category = ?, status = ?
     WHERE id = ?`,
    [
      input.title,
      input.states.join(','),
      input.section,
      input.issueDate,
      input.summary,
      input.pdfUrl || null,
      input.imageUrl || null,
      input.isFeatured ? 1 : 0,
      input.category,
      input.status,
      id,
    ]
  );
}

export async function deleteCircular(id: number): Promise<void> {
  await query('DELETE FROM circulars WHERE id = ?', [id]);
}

// ---- AIRF import (admin only) -----------------------------------------
// Imported posts store their WordPress permalink in pdf_url, which doubles
// as the "already imported?" key.

export async function getExistingPdfUrls(urls: string[]): Promise<Set<string>> {
  if (urls.length === 0) return new Set();
  const rows = await query<{ pdf_url: string }[]>(
    `SELECT pdf_url FROM circulars WHERE pdf_url IN (${urls.map(() => '?').join(', ')})`,
    urls
  );
  return new Set(rows.map((r) => r.pdf_url));
}

export type ImportDraftInput = {
  title: string;
  issueDate: string;
  summary: string;
  sourceUrl: string;
  imageUrl: string | null;
};

// Department, category, section and states are deliberately left blank —
// the admin assigns them (the edit form requires them) before publishing.
export async function createImportedDraft(input: ImportDraftInput): Promise<number> {
  const slug = await uniqueSlug(input.title);
  const result = await query<ResultSetHeader>(
    `INSERT INTO circulars
       (slug, title, department, states, section, ref_number, issue_date, effective_date, summary, pdf_url, image_url, is_featured, category, status)
     VALUES (?, ?, '', '', NULL, '', ?, NULL, ?, ?, ?, 0, 'general', 'draft')`,
    [slug, input.title, input.issueDate, input.summary, input.sourceUrl, input.imageUrl]
  );
  return result.insertId;
}

export type DaWriteInput = {
  effectiveFrom: string;
  percentage: number;
  ordersIssued: string;
};

export async function createDaRecord(input: DaWriteInput): Promise<number> {
  const result = await query<ResultSetHeader>(
    'INSERT INTO da_history (effective_from, percentage, orders_issued) VALUES (?, ?, ?)',
    [input.effectiveFrom, input.percentage, input.ordersIssued]
  );
  return result.insertId;
}

export async function updateDaRecord(id: number, input: DaWriteInput): Promise<void> {
  await query(
    'UPDATE da_history SET effective_from = ?, percentage = ?, orders_issued = ? WHERE id = ?',
    [input.effectiveFrom, input.percentage, input.ordersIssued, id]
  );
}

export async function deleteDaRecord(id: number): Promise<void> {
  await query('DELETE FROM da_history WHERE id = ?', [id]);
}
