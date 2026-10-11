// One-page retirement summary for employees under the Old Pension Scheme:
// pension, gratuity, leave encashment, commutation and other dues, built from
// the same rules as the separate calculators.

import { calculatePensionOps } from './pension';
import { calculateRetirementGratuity } from './gratuity';
import { commute, RESTORATION_YEARS } from './commutation';

// Leave encashment at retirement (Railway Board orders RBE 157/97, 147/2008,
// 148/2008, 130/2009 and 204/2009; CCS (Leave) Rules for other departments):
// leave on average pay (earned leave) and half pay leave together are limited
// to 300 days.
//   leave on average pay: (Basic + DA) / 30 per day
//   half pay leave:       half pay leave salary + DA on it, / 30 per day
export const LEAVE_CEILING_DAYS = 300;

export type LeaveEncashment = {
  lapDaysUsed: number;
  hplDaysUsed: number;
  lapAmount: number;
  hplAmount: number;
  total: number;
  ceilingApplied: boolean;
  daysLostToCeiling: number;
};

export function leaveEncashment(input: {
  basicPay: number;
  daPercent: number;
  lapDays: number;
  hplDays: number;
}): LeaveEncashment {
  const lapAtCredit = Math.max(0, Math.floor(input.lapDays));
  const hplAtCredit = Math.max(0, Math.floor(input.hplDays));
  // Leave on average pay is counted first, as it pays at the higher rate.
  const lapDaysUsed = Math.min(lapAtCredit, LEAVE_CEILING_DAYS);
  const hplDaysUsed = Math.min(hplAtCredit, LEAVE_CEILING_DAYS - lapDaysUsed);
  const perDay = (input.basicPay * (1 + input.daPercent / 100)) / 30;
  const lapAmount = Math.round(perDay * lapDaysUsed);
  const hplAmount = Math.round((perDay / 2) * hplDaysUsed);
  const total = lapAmount + hplAmount;
  const used = lapDaysUsed + hplDaysUsed;
  return {
    lapDaysUsed,
    hplDaysUsed,
    lapAmount,
    hplAmount,
    total,
    ceilingApplied: lapAtCredit + hplAtCredit > used,
    daysLostToCeiling: lapAtCredit + hplAtCredit - used,
  };
}

export type RetirementSummaryInput = {
  lastDrawnPay: number;
  avgLast10MonthsPay: number | null;
  qualifyingYears: number;
  qualifyingMonths: number;
  daPercent: number;
  drPercent: number;
  lapDays: number;
  hplDays: number;
  commutePercent: number; // 0 = no commutation
  ageNextBirthday: number;
  gpfBalance: number;
  otherDues: number;
  gratuityCeiling: number;
  minFloor: number;
};

export type RetirementSummary =
  | {
      ok: true;
      pension: Extract<ReturnType<typeof calculatePensionOps>, { eligible: true }> | null;
      pensionShortfallYears: number | null; // when service is too short for a pension
      commutation: { commutedPension: number; reducedBasicPension: number; reducedDr: number; reducedTotal: number; factor: number; lumpSum: number; restoredAfterYears: number } | null;
      gratuity: number | null;
      gratuityNote: string | null;
      leave: LeaveEncashment;
      gpfBalance: number;
      otherDues: number;
      lumpSumTotal: number;
    }
  | { ok: false; error: string };

export function buildRetirementSummary(input: RetirementSummaryInput): RetirementSummary {
  const pensionResult = calculatePensionOps({
    lastDrawnPay: input.lastDrawnPay,
    avgLast10MonthsPay: input.avgLast10MonthsPay,
    qualifyingYears: input.qualifyingYears,
    qualifyingMonths: input.qualifyingMonths,
    drPercent: input.drPercent,
    minFloor: input.minFloor,
  });
  const pension = pensionResult.eligible ? pensionResult : null;

  let commutation: Extract<RetirementSummary, { ok: true }>['commutation'] = null;
  if (pension && input.commutePercent > 0) {
    const c = commute(pension.basicPension, input.commutePercent, input.ageNextBirthday);
    if (!c.ok) return { ok: false, error: c.error };
    const reducedDr = c.reducedBasicPension * (input.drPercent / 100);
    commutation = {
      commutedPension: c.commutedPension,
      reducedBasicPension: c.reducedBasicPension,
      reducedDr,
      reducedTotal: c.reducedBasicPension + reducedDr,
      factor: c.factor,
      lumpSum: c.lumpSum,
      restoredAfterYears: RESTORATION_YEARS,
    };
  }

  const gr = calculateRetirementGratuity({
    basicPay: input.lastDrawnPay,
    daPercent: input.daPercent,
    qualifyingYears: input.qualifyingYears,
    qualifyingMonths: input.qualifyingMonths,
    ceiling: input.gratuityCeiling,
  });
  const gratuity = gr.eligible ? gr.gratuity : null;
  const gratuityNote = gr.eligible
    ? gr.capApplied === 'ceiling'
      ? 'Limited to the maximum gratuity.'
      : gr.capApplied === 'multiplier'
        ? 'Service beyond 33 years is not counted.'
        : null
    : 'Retirement gratuity needs at least 5 years of qualifying service.';

  const leave = leaveEncashment({
    basicPay: input.lastDrawnPay,
    daPercent: input.daPercent,
    lapDays: input.lapDays,
    hplDays: input.hplDays,
  });

  const lumpSumTotal =
    (gratuity ?? 0) + leave.total + (commutation?.lumpSum ?? 0) + Math.max(0, input.gpfBalance) + Math.max(0, input.otherDues);

  return {
    ok: true,
    pension,
    pensionShortfallYears: pension ? null : pensionResult.roundedHalfYears / 2,
    commutation,
    gratuity,
    gratuityNote,
    leave,
    gpfBalance: Math.max(0, input.gpfBalance),
    otherDues: Math.max(0, input.otherDues),
    lumpSumTotal,
  };
}
