// Pay fixation on promotion and on MACP, under the 7th CPC Pay Matrix.
//
// Sources: Rule 13 of the CCS (Revised Pay) Rules, 2016 and the same rule of
// the Railway Services (Revised Pay) Rules, 2016; DoPT OM No. 13/02/2017-
// Estt.(Pay-I) dated 27 July 2017 (option to fix pay from the Date of Next
// Increment); Railway Board RBE No. 23/2019 (MACP, and promotion after MACP).
// All reads from lib/paymatrix.ts, so a new matrix needs no change here.

import { PAY_LEVELS, PAY_MATRIX, type PayLevelId } from './paymatrix';

export type FixationOption = 'promotion-date' | 'next-increment';

export type TimelineRow = {
  date: string; // YYYY-MM-DD
  pay: number;
  level: PayLevelId;
  remark: string;
};

export type FixationResult =
  | {
      ok: true;
      level: PayLevelId;
      newPay: number;
      steps: string[];
      timeline: TimelineRow[];
      notes: string[];
    }
  | { ok: false; error: string };

export type PromotionInput = {
  level: PayLevelId; // level the employee is in now
  basicPay: number; // must be a cell of that level
  newLevel: PayLevelId;
  date: string; // date of promotion / MACP upgradation
  option: FixationOption;
  incrementMonth: 1 | 7; // month of the annual increment in the present post
  kind: 'promotion' | 'macp';
};

const rupees = (n: number) => `₹${n.toLocaleString('en-IN')}`;

// ---- Pay Matrix helpers ---------------------------------------------------

export function levelLabel(level: PayLevelId): string {
  return `Level ${level}`;
}

export function cellsOf(level: PayLevelId): number[] {
  return PAY_MATRIX[level];
}

export function levelIndex(level: PayLevelId): number {
  return PAY_LEVELS.indexOf(level);
}

// The level an employee moves to on MACP: the next one up the matrix.
export function nextLevel(level: PayLevelId): PayLevelId | null {
  return PAY_LEVELS[levelIndex(level) + 1] ?? null;
}

// One increment: the next cell in the level. At the top cell, the last
// increment of the level is added again (Rule 13, proviso).
export function oneIncrement(level: PayLevelId, pay: number): { pay: number; atTop: boolean } {
  const cells = cellsOf(level);
  const i = cells.indexOf(pay);
  if (cells.length === 1) return { pay, atTop: true };
  if (i < cells.length - 1) return { pay: cells[i + 1], atTop: false };
  return { pay: pay + (cells[i] - cells[i - 1]), atTop: true };
}

// The cell equal to `figure`, or else the next higher cell.
export function cellAtOrAbove(level: PayLevelId, figure: number): number | null {
  return cellsOf(level).find((c) => c >= figure) ?? null;
}

// The next cell strictly above `figure`.
export function cellAbove(level: PayLevelId, figure: number): number | null {
  return cellsOf(level).find((c) => c > figure) ?? null;
}

// ---- Dates (ISO strings, no time zones) -----------------------------------

function parts(iso: string): [number, number, number] {
  const [y, m, d] = iso.split('-').map(Number);
  return [y, m, d];
}

function iso(y: number, m: number, d: number): string {
  return `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
}

function addMonths(isoDate: string, months: number): string {
  const [y, m, d] = parts(isoDate);
  const total = y * 12 + (m - 1) + months;
  const ny = Math.floor(total / 12);
  const nm = (total % 12) + 1;
  const last = new Date(Date.UTC(ny, nm, 0)).getUTCDate();
  return iso(ny, nm, Math.min(d, last));
}

// Annual increments fall on 1 January and 1 July, for an employee who has
// completed six months in the post by that date.
export function firstIncrementDate(from: string): string {
  const target = addMonths(from, 6);
  const [y] = parts(target);
  for (let year = y; year <= y + 1; year++) {
    for (const m of [1, 7]) {
      const candidate = iso(year, m, 1);
      if (candidate >= target) return candidate;
    }
  }
  return iso(y + 1, 7, 1);
}

// The first 1 January / 1 July (as chosen) after `from`.
export function nextIncrementDateAfter(from: string, month: 1 | 7): string {
  const [y] = parts(from);
  for (let year = y; year <= y + 1; year++) {
    const candidate = iso(year, month, 1);
    if (candidate > from) return candidate;
  }
  return iso(y + 2, month, 1);
}

// ---- Result building ------------------------------------------------------

// Annual increments in the new level, one per year after the first.
function futureIncrements(
  level: PayLevelId,
  startPay: number,
  firstDate: string,
  count: number
): TimelineRow[] {
  const rows: TimelineRow[] = [];
  let pay = startPay;
  let date = firstDate;
  for (let n = 0; n < count; n++) {
    const next = oneIncrement(level, pay);
    if (next.atTop) break;
    pay = next.pay;
    rows.push({ date, pay, level, remark: n === 0 ? 'Next annual increment' : 'Annual increment' });
    date = addMonths(date, 12);
  }
  return rows;
}

function validate(input: PromotionInput): string | null {
  if (!PAY_LEVELS.includes(input.level) || !PAY_LEVELS.includes(input.newLevel)) return 'Choose a valid level.';
  if (!cellsOf(input.level).includes(input.basicPay))
    return `₹${input.basicPay.toLocaleString('en-IN')} is not a cell of ${levelLabel(input.level)} in the Pay Matrix. Choose your pay from the list.`;
  if (levelIndex(input.newLevel) <= levelIndex(input.level))
    return 'The new level must be higher than the present level.';
  if (!/^\d{4}-\d{2}-\d{2}$/.test(input.date)) return 'Enter the date.';
  return null;
}

const COMMON_NOTES = [
  'Based on the 7th CPC Pay Matrix and Rule 13 of the (Revised Pay) Rules, 2016. Pay Level changes and special pay (such as running allowances, special pay or personal pay) are not included.',
  'This is an estimate. The authority sanctioning the promotion or upgradation fixes the pay; check it with your accounts office.',
];

export function fixPayOnPromotion(input: PromotionInput, incrementsToShow = 3): FixationResult {
  const error = validate(input);
  if (error) return { ok: false, error };

  const { level, basicPay, newLevel, date, option, incrementMonth, kind } = input;
  const what = kind === 'macp' ? 'MACP upgradation' : 'promotion';
  const steps: string[] = [];
  const timeline: TimelineRow[] = [];
  const notes = [...COMMON_NOTES];

  // The annual increment due on the very day of the promotion is a special
  // case with differing practice; the calculator does not guess.
  const [, m, d] = parts(date);
  if (d === 1 && m === incrementMonth) {
    return {
      ok: false,
      error: `Your ${what} falls on your annual increment date (1 ${incrementMonth === 1 ? 'January' : 'July'}). How the increment due on that same day is treated needs your accounts office to confirm — this calculator does not cover that case.`,
    };
  }

  if (option === 'promotion-date') {
    const inc = oneIncrement(level, basicPay);
    steps.push(
      inc.atTop
        ? `One increment in ${levelLabel(level)}: you are at the top of the level, so the last increment of the level is added: ${rupees(basicPay)} → ${rupees(inc.pay)}.`
        : `One increment in ${levelLabel(level)}: ${rupees(basicPay)} → ${rupees(inc.pay)}.`
    );
    const placed = cellAtOrAbove(newLevel, inc.pay);
    if (placed === null)
      return { ok: false, error: `${rupees(inc.pay)} is above the highest cell of ${levelLabel(newLevel)}. Check this case with your accounts office.` };
    steps.push(
      placed === inc.pay
        ? `${levelLabel(newLevel)} has a cell equal to ${rupees(inc.pay)}, so pay is fixed at ${rupees(placed)}.`
        : `${levelLabel(newLevel)} has no cell equal to ${rupees(inc.pay)}, so pay is fixed at the next higher cell: ${rupees(placed)}.`
    );
    timeline.push({ date, pay: placed, level: newLevel, remark: `Pay fixed on ${what}` });
    const firstAi = firstIncrementDate(date);
    timeline.push(...futureIncrements(newLevel, placed, firstAi, incrementsToShow));
    notes.push('Your next annual increment falls on 1 January or 1 July after you complete six months in the new level.');
    return { ok: true, level: newLevel, newPay: placed, steps, timeline, notes };
  }

  // Option: fix pay from the date of next increment in the lower post.
  const initial = cellAbove(newLevel, basicPay);
  if (initial === null)
    return { ok: false, error: `${rupees(basicPay)} is above the highest cell of ${levelLabel(newLevel)}. Check this case with your accounts office.` };
  steps.push(
    `From the date of ${what}: placed at the next higher cell in ${levelLabel(newLevel)} above ${rupees(basicPay)}: ${rupees(initial)}.`
  );
  timeline.push({ date, pay: initial, level: newLevel, remark: `Pay on ${what} (till the next increment date)` });

  const dni = nextIncrementDateAfter(date, incrementMonth);
  const first = oneIncrement(level, basicPay);
  const second = oneIncrement(level, first.pay);
  steps.push(
    `On ${formatDay(dni)}, the date of next increment in ${levelLabel(level)}, two increments are granted in ${levelLabel(level)} (one annual, one for the ${what}): ${rupees(basicPay)} → ${rupees(first.pay)} → ${rupees(second.pay)}.`
  );
  const refixed = cellAtOrAbove(newLevel, second.pay);
  if (refixed === null)
    return { ok: false, error: `${rupees(second.pay)} is above the highest cell of ${levelLabel(newLevel)}. Check this case with your accounts office.` };
  steps.push(
    refixed === second.pay
      ? `${levelLabel(newLevel)} has a cell equal to ${rupees(second.pay)}, so pay is re-fixed at ${rupees(refixed)}.`
      : `${levelLabel(newLevel)} has no cell equal to ${rupees(second.pay)}, so pay is re-fixed at the next higher cell: ${rupees(refixed)}.`
  );
  timeline.push({ date: dni, pay: refixed, level: newLevel, remark: 'Re-fixed on next increment date in the lower post' });
  timeline.push(...futureIncrements(newLevel, refixed, firstIncrementDate(dni), incrementsToShow));
  notes.push(
    'On this option the date of next increment is regulated from the date of re-fixation, so your next annual increment in the new level comes after six months from it (DoPT OM 27.07.2017, para 3(iv)).'
  );
  return { ok: true, level: newLevel, newPay: refixed, steps, timeline, notes };
}

// Promotion after the employee has already had pay fixation under MACP at
// their present level (RBE No. 23/2019).
export function fixPayAfterMacp(input: {
  level: PayLevelId;
  basicPay: number;
  newLevel: PayLevelId;
  date: string;
}): FixationResult {
  const { level, basicPay, newLevel, date } = input;
  if (!PAY_LEVELS.includes(level) || !PAY_LEVELS.includes(newLevel)) return { ok: false, error: 'Choose a valid level.' };
  if (!cellsOf(level).includes(basicPay))
    return { ok: false, error: `${rupees(basicPay)} is not a cell of ${levelLabel(level)} in the Pay Matrix. Choose your pay from the list.` };
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return { ok: false, error: 'Enter the date.' };
  const notes = [...COMMON_NOTES];

  if (newLevel === level) {
    return {
      ok: true,
      level,
      newPay: basicPay,
      steps: [
        `You are promoted to ${levelLabel(newLevel)}, the same level you already hold under MACP. There is no further fixation of pay (RBE No. 23/2019, para 1(ii)).`,
      ],
      timeline: [{ date, pay: basicPay, level, remark: 'No change in pay on this promotion' }],
      notes,
    };
  }
  if (levelIndex(newLevel) < levelIndex(level)) return { ok: false, error: 'The promoted level must be higher than your present level.' };

  const placed = cellAtOrAbove(newLevel, basicPay);
  if (placed === null)
    return { ok: false, error: `${rupees(basicPay)} is above the highest cell of ${levelLabel(newLevel)}. Check this case with your accounts office.` };
  const steps = [
    `The pay fixation benefit was already given at MACP, so no further increment is added (RBE No. 23/2019, para 1(iii)). Your present pay is ${rupees(basicPay)}.`,
    placed === basicPay
      ? `${levelLabel(newLevel)} has a cell equal to ${rupees(basicPay)}, so pay is fixed at ${rupees(placed)}.`
      : `${levelLabel(newLevel)} has no cell equal to ${rupees(basicPay)}, so pay is fixed at the next higher cell: ${rupees(placed)}.`,
  ];
  notes.push(
    'The Board order also lets the employee choose to have this fixation made from the date of next increment instead. That option is not calculated here; ask your accounts office if you want it.'
  );
  return {
    ok: true,
    level: newLevel,
    newPay: placed,
    steps,
    timeline: [{ date, pay: placed, level: newLevel, remark: 'Pay fixed on promotion after MACP' }],
    notes,
  };
}

export function formatDay(isoDate: string): string {
  const [y, m, d] = parts(isoDate);
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  return `${d} ${months[m - 1]} ${y}`;
}

// ---- Which option is better? -----------------------------------------------
// Runs both options for the same facts and compares the Basic Pay the
// employee draws over the following years.

export type OptionSummary = {
  option: FixationOption;
  timeline: TimelineRow[];
  payOnDate: number;
  payAfter: { months: number; pay: number }[];
  totals: { months: number; total: number }[];
};

export type Comparison =
  | {
      ok: true;
      options: Record<FixationOption, OptionSummary>;
      horizons: number[];
      // "next increment" minus "date of promotion", per horizon (total Basic Pay)
      diffs: { months: number; diff: number }[];
      better: FixationOption | 'same';
      // the better option pays more every month from this date
      higherPayFrom: string | null;
      // months after which the better option has made up an earlier shortfall
      breakEvenMonths: number | null;
    }
  | { ok: false; error: string };

const HORIZONS = [12, 36, 60];
const SAME_WITHIN = 500; // rupees over three years: treated as no difference

function dayNumber(isoDate: string): number {
  const [y, m, d] = parts(isoDate);
  return Date.UTC(y, m - 1, d) / 86400000;
}

function payOn(rows: TimelineRow[], date: string): number {
  let pay = rows[0].pay;
  for (const row of rows) if (row.date <= date) pay = row.pay;
  return pay;
}

// Basic Pay drawn from `start` for `months` months, each rate counted for the
// days it is in force (a month is taken as 30.4375 days).
function totalBasicPay(rows: TimelineRow[], start: string, months: number): number {
  const end = addMonths(start, months);
  const cuts = [start, ...rows.map((r) => r.date).filter((d) => d > start && d < end), end];
  let total = 0;
  for (let i = 0; i < cuts.length - 1; i++) {
    const days = dayNumber(cuts[i + 1]) - dayNumber(cuts[i]);
    total += payOn(rows, cuts[i]) * (days / 30.4375);
  }
  return total;
}

function summarise(option: FixationOption, result: Extract<FixationResult, { ok: true }>, start: string): OptionSummary {
  return {
    option,
    timeline: result.timeline,
    payOnDate: result.timeline[0].pay,
    payAfter: HORIZONS.map((months) => ({ months, pay: payOn(result.timeline, addMonths(start, months)) })),
    totals: HORIZONS.map((months) => ({ months, total: totalBasicPay(result.timeline, start, months) })),
  };
}

export function compareOptions(input: Omit<PromotionInput, 'option'>): Comparison {
  const a = fixPayOnPromotion({ ...input, option: 'promotion-date' }, 8);
  const b = fixPayOnPromotion({ ...input, option: 'next-increment' }, 8);
  if (!a.ok) return { ok: false, error: a.error };
  if (!b.ok) return { ok: false, error: b.error };

  const start = input.date;
  const options = {
    'promotion-date': summarise('promotion-date', a, start),
    'next-increment': summarise('next-increment', b, start),
  };
  const diffs = HORIZONS.map((months, i) => ({
    months,
    diff: options['next-increment'].totals[i].total - options['promotion-date'].totals[i].total,
  }));
  const main = diffs.find((d) => d.months === 36)!.diff;
  const better: FixationOption | 'same' =
    Math.abs(main) <= SAME_WITHIN ? 'same' : main > 0 ? 'next-increment' : 'promotion-date';

  let higherPayFrom: string | null = null;
  let breakEvenMonths: number | null = null;
  if (better !== 'same') {
    const other: FixationOption = better === 'promotion-date' ? 'next-increment' : 'promotion-date';
    const dates = Array.from(new Set([...a.timeline, ...b.timeline].map((r) => r.date))).sort();
    for (const d of dates) {
      if (payOn(options[better].timeline, d) > payOn(options[other].timeline, d)) {
        higherPayFrom = d;
        break;
      }
    }
    // Was the better option behind in total at first? If so, when did it catch up?
    const sign = better === 'next-increment' ? 1 : -1;
    const lead = (m: number) =>
      sign *
      (totalBasicPay(options['next-increment'].timeline, start, m) - totalBasicPay(options['promotion-date'].timeline, start, m));
    if (lead(1) < 0) {
      for (let m = 2; m <= 60; m++) {
        if (lead(m) >= 0) {
          breakEvenMonths = m;
          break;
        }
      }
    }
  }
  return { ok: true, options, horizons: HORIZONS, diffs, better, higherPayFrom, breakEvenMonths };
}
