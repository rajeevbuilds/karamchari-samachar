// Content of the "8th Pay Commission" page that the admin edits under Settings:
// a short "where things stand" summary and a small milestone table (a handful
// of rows, so the page never grows). Stored as plain settings.

export type MilestoneStatus = 'done' | 'progress' | 'awaited';
export type Milestone = { milestone: string; date: string; status: MilestoneStatus };

export const MILESTONE_STATUS_LABEL: Record<MilestoneStatus, string> = {
  done: 'Done',
  progress: 'In progress',
  awaited: 'Awaited',
};

export const MAX_MILESTONES = 10;
export const MAX_SUMMARY_LENGTH = 800;

export const DEFAULT_CPC8_SUMMARY =
  "Terms of reference were notified in August 2026, with an 18-month window for recommendations. This page tracks milestones as they're announced: panel formation, submission of the report, and cabinet approval.";

export const DEFAULT_CPC8_TIMELINE: Milestone[] = [
  { milestone: 'Terms of reference notified', date: 'August 2026', status: 'done' },
  { milestone: "Commission's recommendations due", date: 'Within 18 months of the terms of reference', status: 'awaited' },
  { milestone: 'Government decision on the report', date: '', status: 'awaited' },
];

const STATUSES: MilestoneStatus[] = ['done', 'progress', 'awaited'];

// Cleans whatever was stored or submitted: at most MAX_MILESTONES rows, short
// trimmed text, a valid status, and no row without a milestone name.
export function sanitizeTimeline(input: unknown): Milestone[] {
  if (!Array.isArray(input)) return [];
  const rows: Milestone[] = [];
  for (const raw of input) {
    if (!raw || typeof raw !== 'object') continue;
    const r = raw as Record<string, unknown>;
    const milestone = String(r.milestone ?? '').trim().slice(0, 120);
    if (!milestone) continue;
    const date = String(r.date ?? '').trim().slice(0, 120);
    const status = STATUSES.includes(r.status as MilestoneStatus) ? (r.status as MilestoneStatus) : 'awaited';
    rows.push({ milestone, date, status });
    if (rows.length >= MAX_MILESTONES) break;
  }
  return rows;
}

export function parseTimeline(json: string): Milestone[] {
  if (!json) return DEFAULT_CPC8_TIMELINE;
  try {
    const rows = sanitizeTimeline(JSON.parse(json));
    return rows.length > 0 ? rows : DEFAULT_CPC8_TIMELINE;
  } catch {
    return DEFAULT_CPC8_TIMELINE;
  }
}
