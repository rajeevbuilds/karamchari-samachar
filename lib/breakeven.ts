// "How long until UPS overtakes NPS?" — pure logic for the UPS tab of
// /calculators/nps.
//
// At retirement NPS pays a large lump sum but a small fixed annuity; UPS pays
// a small lump sum but a larger monthly payout that rises with Dearness
// Relief. So the UPS pensioner starts behind by the lump-sum gap and catches
// up month by month. This walks forward month by month from retirement and
// finds when the UPS pensioner's cumulative advantage turns positive:
//
//  - plain:     advantage = (UPS lump − NPS lump) + Σ (UPS payout − NPS pension)
//  - invested:  the lump-sum gap is treated as money the NPS pensioner
//               invests, so it compounds at `investReturnPercent` a year:
//               V(t) = V(t−1) × (1 + r) + (UPS payout − NPS pension)
//
// The UPS payout is revised like pay: Dearness Relief rises by
// `daRisePerHalfYear` points each Jan and Jul, and at each pay commission
// (1 Jan 2026, 2036, …) the payout + DR is uplifted by the commission
// percentage and DR resets to 0. The NPS annuity is fixed for life.
// Family pension (UPS pays 60% to a spouse) is not counted here.

import { COMMISSION_INTERVAL_YEARS, FIRST_COMMISSION_YEAR } from './nps';

export const BREAK_EVEN_HORIZON_AGE = 90;

export type BreakEvenInput = {
  npsLumpSum: number;
  npsMonthlyPension: number;
  upsLumpSum: number;
  upsAssuredPayout: number; // Basic part of the payout at retirement, before DR
  upsDaPercentAtRetirement: number;
  retirementDate: string; // YYYY-MM-DD
  retirementAge: number;
  daRisePerHalfYear: number;
  commissionUpliftPercent: number;
  investReturnPercent: number;
};

export type BreakEvenPoint = {
  monthsAfter: number; // months since retirement (0 = retirement day)
  plain: number; // UPS cumulative advantage over NPS, ₹ (negative = UPS behind)
  invested: number;
  upsPayout: number; // UPS monthly payout in that month
};

export type BreakEvenResult = {
  lumpSumGap: number; // NPS lump sum − UPS lump sum (positive = NPS ahead on day one)
  startingMonthlyEdge: number; // UPS payout − NPS pension in the first month
  plainMonths: number | null; // null = not within the horizon
  investedMonths: number | null;
  horizonMonths: number;
  points: BreakEvenPoint[];
};

export function computeBreakEven(input: BreakEvenInput): BreakEvenResult {
  const [ry, rm] = input.retirementDate.split('-').map(Number);
  const retireIdx = ry * 12 + (rm - 1);
  const horizonMonths = (BREAK_EVEN_HORIZON_AGE - input.retirementAge) * 12;
  const monthlyInvest = Math.pow(1 + input.investReturnPercent / 100, 1 / 12) - 1;
  const uplift = 1 + input.commissionUpliftPercent / 100;

  let payoutBasic = input.upsAssuredPayout;
  let da = input.upsDaPercentAtRetirement;

  const startGap = input.upsLumpSum - input.npsLumpSum; // negative when NPS is ahead
  let plain = startGap;
  let invested = startGap;
  let plainMonths: number | null = startGap >= 0 ? 0 : null;
  let investedMonths: number | null = startGap >= 0 ? 0 : null;
  let startingMonthlyEdge = 0;

  const points: BreakEvenPoint[] = [
    { monthsAfter: 0, plain, invested, upsPayout: payoutBasic * (1 + da / 100) },
  ];

  for (let m = 1; m <= horizonMonths; m++) {
    const idx = retireIdx + m;
    const year = Math.floor(idx / 12);
    const month = idx % 12;

    if (month === 0 && year >= FIRST_COMMISSION_YEAR && (year - FIRST_COMMISSION_YEAR) % COMMISSION_INTERVAL_YEARS === 0) {
      payoutBasic = payoutBasic * (1 + da / 100) * uplift;
      da = 0;
    } else if (month === 0 || month === 6) {
      da += input.daRisePerHalfYear;
    }

    const payout = payoutBasic * (1 + da / 100);
    const edge = payout - input.npsMonthlyPension;
    if (m === 1) startingMonthlyEdge = edge;

    plain += edge;
    invested = invested * (1 + monthlyInvest) + edge;

    if (plainMonths === null && plain >= 0) plainMonths = m;
    if (investedMonths === null && invested >= 0) investedMonths = m;
    points.push({ monthsAfter: m, plain, invested, upsPayout: payout });
  }

  return {
    lumpSumGap: input.npsLumpSum - input.upsLumpSum,
    startingMonthlyEdge,
    plainMonths,
    investedMonths,
    horizonMonths,
    points,
  };
}
