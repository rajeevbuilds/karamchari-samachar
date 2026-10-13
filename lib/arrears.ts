// Arrears if the 8th Pay Commission is notified some months after it takes
// effect (1 January 2026). For every month from January 2026 up to and
// including the month of notification:
//   arrears = pay due under the 8th CPC - pay actually drawn
// Everything after the present is an assumption the employee can change.
//
//  - Drawn: present Basic, DA at the rates on this site up to today and then
//    rising by `daRisePoints` every January and July, present HRA and TA.
//  - Due: new Basic (fitment factor), DA restarting at 0% and rising by the same
//    number of points every January and July, and the HRA and TA of the 8th CPC
//    only from `allowanceFromMonth`. Until then the allowances stay as they are
//    (for the 7th CPC the pay rules ran from 1.1.2016 but the HRA and TA orders
//    only from 1.7.2017).
//  - Optional 3% increment each July on both scales.

import { daOn, type DaStep } from './retirementDates';
import { HRA_FLOOR, HRA_RATES, hraStageForDa, taBase, type EighthCpcInput } from './eighthcpc';

export const EFFECTIVE_YEAR = 2026; // the 8th CPC is expected to apply from 1 January 2026
export const MAX_MONTHS = 72;

export type YearMonth = { y: number; m: number }; // m = 1..12

export type ArrearsInput = {
  base: EighthCpcInput;
  daHistory: DaStep[];
  todayISO: string; // YYYY-MM-DD
  notifyISO: string; // date of notification
  allowanceFrom: 'jan2026' | 'notify' | string; // or an ISO date
  increments: boolean;
  daRisePoints: number;
};

export type ArrearsMonth = {
  y: number;
  m: number;
  label: string;
  drawn: number;
  due: number;
  arrears: number;
  allowancesRevised: boolean;
};

export type ArrearsResult =
  | { ok: false; error: string }
  | {
      ok: true;
      months: ArrearsMonth[];
      total: number;
      parts: { basic: number; da: number; hra: number; ta: number };
      allowanceFromLabel: string;
      negativeMonths: number;
    };

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const roundUp = (n: number, to: number) => Math.ceil(n / to - 1e-9) * to;
const half = (y: number, m: number) => y * 2 + (m >= 7 ? 1 : 0); // DA changes each January and July
const isoOf = (y: number, m: number) => `${y}-${String(m).padStart(2, '0')}-01`;
const idx = (y: number, m: number) => y * 12 + (m - 1);

function parseISO(iso: string): { y: number; m: number; d: number } | null {
  const x = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  return x ? { y: Number(x[1]), m: Number(x[2]), d: Number(x[3]) } : null;
}

// The first whole month a date applies from: its own month if it is the 1st.
function firstFullMonth(iso: string): YearMonth | null {
  const p = parseISO(iso);
  if (!p) return null;
  return p.d === 1 ? { y: p.y, m: p.m } : p.m === 12 ? { y: p.y + 1, m: 1 } : { y: p.y, m: p.m + 1 };
}

export function calculateArrears(inp: ArrearsInput): ArrearsResult {
  const b = inp.base;
  const notify = parseISO(inp.notifyISO);
  const today = parseISO(inp.todayISO);
  if (!notify || !today) return { ok: false, error: 'Enter the date of notification as DD/MM/YYYY.' };
  if (notify.y < EFFECTIVE_YEAR) return { ok: false, error: 'The date of notification cannot be before 1 January 2026, when the 8th CPC is expected to start.' };
  const count = idx(notify.y, notify.m) - idx(EFFECTIVE_YEAR, 1) + 1;
  if (count > MAX_MONTHS) return { ok: false, error: `Arrears are worked out for up to ${MAX_MONTHS} months. Choose an earlier date of notification.` };
  if (!(inp.daRisePoints >= 0 && inp.daRisePoints <= 10)) return { ok: false, error: 'The DA rise each half-year must be between 0 and 10 points.' };

  const allowFrom: YearMonth =
    inp.allowanceFrom === 'jan2026'
      ? { y: EFFECTIVE_YEAR, m: 1 }
      : inp.allowanceFrom === 'notify'
        ? firstFullMonth(inp.notifyISO)!
        : (firstFullMonth(inp.allowanceFrom) ?? { y: notify.y, m: notify.m });
  const allowanceFromLabel = `${MONTHS[allowFrom.m - 1]} ${allowFrom.y}`;

  const todayStart = isoOf(today.y, today.m);
  const todayHalf = half(today.y, today.m);
  const oldDaAt = (y: number, m: number): number => {
    const start = isoOf(y, m);
    if (start <= todayStart) return (inp.daHistory.length ? daOn(inp.daHistory, start) : null) ?? b.presentDaPercent;
    return b.presentDaPercent + inp.daRisePoints * (half(y, m) - todayHalf);
  };
  const newDaAt = (y: number, m: number): number => inp.daRisePoints * (half(y, m) - half(EFFECTIVE_YEAR, 1));

  const ta0 = b.includeTa ? taBase(b.level, b.tpta) : 0;
  const newTa = b.includeTa ? roundUp(ta0 * b.taRise, 50) : 0;
  const newBasic0 = roundUp(b.basic * b.fitment, 100);

  const months: ArrearsMonth[] = [];
  const parts = { basic: 0, da: 0, hra: 0, ta: 0 };
  let oldBasic = b.basic;
  let newBasic = newBasic0;

  for (let k = 0; k < count; k++) {
    const y = EFFECTIVE_YEAR + Math.floor(k / 12);
    const m = (k % 12) + 1;
    if (inp.increments && m === 7) {
      oldBasic = roundUp(oldBasic * 1.03, 100);
      newBasic = roundUp(newBasic * 1.03, 100);
    }
    const oDa = oldDaAt(y, m);
    const nDa = newDaAt(y, m);
    const revised = idx(y, m) >= idx(allowFrom.y, allowFrom.m);

    // Drawn under the present scale.
    const oRate = HRA_RATES[hraStageForDa(oDa)][b.hraClass];
    const oHra = Math.max(Math.round((oldBasic * oRate) / 100), HRA_FLOOR[b.hraClass]);
    const dDaBasic = Math.round((oldBasic * oDa) / 100);
    const dTa = ta0 + Math.round((ta0 * oDa) / 100);
    const drawn = oldBasic + dDaBasic + oHra + dTa;

    // Due under the 8th CPC.
    const hraNew = revised ? Math.round((newBasic * HRA_RATES[b.hraStage][b.hraClass]) / 100) : oHra;
    const taNew = revised ? newTa : ta0;
    const nDaBasic = Math.round((newBasic * nDa) / 100);
    const nTa = taNew + Math.round((taNew * nDa) / 100);
    const due = newBasic + nDaBasic + hraNew + nTa;

    parts.basic += newBasic - oldBasic;
    parts.da += nDaBasic - dDaBasic;
    parts.hra += hraNew - oHra;
    parts.ta += nTa - dTa;
    months.push({ y, m, label: `${MONTHS[m - 1]} ${y}`, drawn, due, arrears: due - drawn, allowancesRevised: revised });
  }

  return {
    ok: true,
    months,
    total: months.reduce((s, x) => s + x.arrears, 0),
    parts,
    allowanceFromLabel,
    negativeMonths: months.filter((x) => x.arrears < 0).length,
  };
}
