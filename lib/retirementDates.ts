// Date of retirement on superannuation (FR 56): a Government servant retires
// on the afternoon of the last day of the month in which they reach 60. One
// born on the 1st of a month retires on the afternoon of the last day of the
// previous month.
export const RETIREMENT_AGE = 60;

const ISO = /^(\d{4})-(\d{2})-(\d{2})$/;

function pad(n: number): string {
  return String(n).padStart(2, '0');
}

export function retirementDateFromDob(dobISO: string): string {
  const m = ISO.exec(dobISO);
  if (!m) return '';
  const year = Number(m[1]);
  const month = Number(m[2]);
  const day = Number(m[3]);
  if (year < 1900 || month < 1 || month > 12 || day < 1 || day > 31) return '';
  // Day 0 of the next month is the last day of this month.
  const lastMonth = day === 1 ? month - 1 : month;
  const d = new Date(Date.UTC(year + RETIREMENT_AGE, lastMonth, 0));
  return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`;
}

export type DaStep = { effectiveFrom: string; percentage: number };

// The DA rate in force on a date, from the rates entered in the admin panel.
// A date before the first rate gets the oldest rate; a date after the latest
// rate (or no date) gets the latest one.
export function daOn(history: DaStep[], dateISO: string): number | null {
  if (history.length === 0) return null;
  const sorted = [...history].sort((a, b) => b.effectiveFrom.localeCompare(a.effectiveFrom));
  if (!ISO.test(dateISO)) return sorted[0].percentage;
  const hit = sorted.find((r) => r.effectiveFrom.slice(0, 10) <= dateISO);
  return (hit ?? sorted[sorted.length - 1]).percentage;
}
