// 8th Pay Commission estimate: present salary against salary after a chosen
// fitment factor. The Commission has not reported, so the fitment factor, the
// DA reset, the HRA rates and the Transport Allowance are all assumptions the
// employee can change. Present-pay rules are those of the 7th CPC orders:
//   HRA: Dept. of Expenditure OM 2/5/2017-E.II(B) dated 07.07.2017
//        24/16/8% of Basic Pay (X/Y/Z), 27/18/9% once DA crosses 25%,
//        30/20/10% once DA crosses 50%; never below Rs 5,400/3,600/1,800.
//   TA:  Dept. of Expenditure OM 21/5/2017-E.II(B) dated 07.07.2017
//        by Pay Level and city, plus DA thereon.

import type { HraClass } from './hracities';
import { PAY_MATRIX, type PayLevelId } from './paymatrix';

export const HRA_RATES = {
  start: { X: 24, Y: 16, Z: 8 }, // DA below 25%
  mid: { X: 27, Y: 18, Z: 9 }, // DA above 25%
  full: { X: 30, Y: 20, Z: 10 }, // DA above 50%
} as const;
export type HraStage = keyof typeof HRA_RATES;

export const HRA_FLOOR: Record<HraClass, number> = { X: 5400, Y: 3600, Z: 1800 };

export const FITMENT_MIN = 1.5;
export const FITMENT_MAX = 3.0;

export function hraStageForDa(daPercent: number): HraStage {
  return daPercent > 50 ? 'full' : daPercent > 25 ? 'mid' : 'start';
}

// Transport Allowance per month before DA: [higher-rate cities, other places].
export function taBase(level: PayLevelId, tpta: boolean): number {
  const n = level === '13A' ? 13.5 : Number(level);
  const [high, other] = n >= 9 ? [7200, 3600] : n >= 3 ? [3600, 1800] : [1350, 900];
  return tpta ? high : other;
}

export type Salary = {
  basic: number;
  daPercent: number;
  da: number;
  hraPercent: number;
  hra: number;
  ta: number; // before DA
  daOnTa: number;
  gross: number;
};

export type EighthCpcInput = {
  basic: number;
  level: PayLevelId;
  hraClass: HraClass;
  tpta: boolean;
  presentDaPercent: number;
  fitment: number;
  hraStage: HraStage; // HRA rates assumed for the 8th CPC
  includeTa: boolean;
  taRise: number; // factor applied to the present TA (e.g. 2 doubles it)
};

export type EighthCpcResult =
  | { ok: false; error: string }
  | {
      ok: true;
      present: Salary;
      eighth: Salary;
      monthlyRise: number;
      percentRise: number;
      yearlyRise: number;
      levelNote: string | null;
    };

const roundUp = (n: number, to: number) => Math.ceil(n / to - 1e-9) * to;

export function presentSalary(i: Pick<EighthCpcInput, 'basic' | 'hraClass' | 'tpta' | 'level' | 'presentDaPercent' | 'includeTa'>): Salary {
  const rate = HRA_RATES[hraStageForDa(i.presentDaPercent)][i.hraClass];
  const hra = Math.max(Math.round((i.basic * rate) / 100), HRA_FLOOR[i.hraClass]);
  const da = Math.round((i.basic * i.presentDaPercent) / 100);
  const ta = i.includeTa ? taBase(i.level, i.tpta) : 0;
  const daOnTa = Math.round((ta * i.presentDaPercent) / 100);
  return { basic: i.basic, daPercent: i.presentDaPercent, da, hraPercent: rate, hra, ta, daOnTa, gross: i.basic + da + hra + ta + daOnTa };
}

export function calculateEighthCpc(i: EighthCpcInput): EighthCpcResult {
  if (!(i.basic > 0) || !Number.isFinite(i.basic)) return { ok: false, error: 'Enter your present Basic Pay.' };
  if (!(i.fitment >= FITMENT_MIN && i.fitment <= FITMENT_MAX)) return { ok: false, error: `The fitment factor must be between ${FITMENT_MIN} and ${FITMENT_MAX}.` };
  if (!(i.presentDaPercent >= 0)) return { ok: false, error: 'Enter the present DA rate.' };
  if (!(i.taRise > 0)) return { ok: false, error: 'The Transport Allowance rise must be more than zero.' };

  const present = presentSalary(i);

  // New Basic: present Basic x fitment factor, taken up to the next Rs 100.
  const basic = roundUp(i.basic * i.fitment, 100);
  const hraPercent = HRA_RATES[i.hraStage][i.hraClass];
  const hra = Math.round((basic * hraPercent) / 100);
  const ta = i.includeTa ? roundUp(taBase(i.level, i.tpta) * i.taRise, 50) : 0;
  // DA restarts from zero with a new Commission, so there is none on Basic or TA.
  const eighth: Salary = { basic, daPercent: 0, da: 0, hraPercent, hra, ta, daOnTa: 0, gross: basic + hra + ta };

  const monthlyRise = eighth.gross - present.gross;

  const cells = PAY_MATRIX[i.level];
  const levelNote = cells && !cells.includes(i.basic)
    ? `₹${i.basic.toLocaleString('en-IN')} is not a cell in Level ${i.level} of the 7th CPC Pay Matrix. The estimate still works, but check your Level and Basic Pay.`
    : null;

  return { ok: true, present, eighth, monthlyRise, percentRise: (monthlyRise / present.gross) * 100, yearlyRise: monthlyRise * 12, levelNote };
}
