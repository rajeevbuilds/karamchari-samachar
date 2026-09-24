// Shared request-body validation for the admin API routes. Throws a plain
// Error with a user-facing message on bad input; route handlers catch it
// and respond 400 with that message.

import type { Circular, CircularWriteInput, DaWriteInput } from './data';
import { SECTION_OPTIONS } from './constants';

const VALID_CATEGORIES: Circular['category'][] = [
  'da',
  'pay',
  'transfer',
  'recruitment',
  'pension',
  'general',
];

const VALID_SECTIONS: string[] = SECTION_OPTIONS.map((s) => s.value);

function asRecord(body: unknown): Record<string, unknown> {
  if (typeof body !== 'object' || body === null) {
    throw new Error('Invalid request body');
  }
  return body as Record<string, unknown>;
}

export function parseCircularInput(body: unknown): CircularWriteInput {
  const b = asRecord(body);

  const title = String(b.title ?? '').trim();
  const department = String(b.department ?? '').trim();
  const issueDate = String(b.issueDate ?? '').trim();
  const summary = String(b.summary ?? '').trim();
  const pdfUrl = String(b.pdfUrl ?? '').trim();
  const imageUrl = b.imageUrl ? String(b.imageUrl).trim() : null;
  const category = String(b.category ?? '') as Circular['category'];
  const section = b.section ? String(b.section).trim() : null;
  const isFeatured = Boolean(b.isFeatured);
  const states = Array.isArray(b.states) ? b.states.map(String).filter(Boolean) : [];

  if (!title) throw new Error('Title is required');
  if (!department) throw new Error('Department is required');
  if (!issueDate || Number.isNaN(Date.parse(issueDate)))
    throw new Error('A valid date of posting is required');
  if (!summary) throw new Error('Summary is required');
  if (!pdfUrl) throw new Error('PDF URL is required');
  if (!VALID_CATEGORIES.includes(category)) throw new Error('Invalid category');
  if (section && !VALID_SECTIONS.includes(section)) throw new Error('Invalid section');
  if (states.length === 0) throw new Error('Select at least one state (or "all")');

  return { title, department, states, section, issueDate, summary, pdfUrl, imageUrl, isFeatured, category };
}

export function parseDaInput(body: unknown): DaWriteInput {
  const b = asRecord(body);

  const effectiveFrom = String(b.effectiveFrom ?? '').trim();
  const ordersIssued = String(b.ordersIssued ?? '').trim();
  const percentage = Number(b.percentage);

  if (!effectiveFrom || Number.isNaN(Date.parse(effectiveFrom)))
    throw new Error('A valid effective date is required');
  if (!ordersIssued || Number.isNaN(Date.parse(ordersIssued)))
    throw new Error('A valid orders-issued date is required');
  if (!Number.isFinite(percentage) || percentage < 0 || percentage > 200)
    throw new Error('Percentage must be a valid number between 0 and 200');

  return { effectiveFrom, percentage, ordersIssued };
}
