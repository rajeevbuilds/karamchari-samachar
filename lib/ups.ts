// Pure calculation logic for the UPS tab of /calculators/nps (Unified Pension
// Scheme, CCS (UPS) Rules 2025). UPS is a defined-benefit promise, so unlike
// NPS there is no corpus to project: the payouts follow from the last 12
// months' Basic Pay, the length of service and the DA at retirement.
//
//  - Assured payout: 50% of the average Basic Pay of the last 12 months for
//    25 years of qualifying service; proportionate below that (in completed
//    six-monthly periods), with a ₹10,000 a month minimum, and none below
//    10 years.
//  - Dearness Relief is added on the payout (revised half-yearly).
//  - Assured family pension: 60% of the payout.
//  - Lump sum at superannuation: 1/10th of monthly emoluments (Basic + DA)
//    for every completed six-monthly period of service, on top of gratuity.

import { roundQualifyingServiceToHalfYears } from './pension';

export const UPS_MIN_HALF_YEARS = 20; // 10 years
export const UPS_FULL_HALF_YEARS = 50; // 25 years
export const UPS_MIN_PAYOUT = 10000;

export type UpsInput = {
  avgBasicLast12: number;
  finalTotalPay: number; // Basic + DA at retirement
  finalDaPercent: number;
  serviceYears: number; // qualifying service at retirement (may be fractional)
};

export type UpsResult =
  | { eligible: false; roundedHalfYears: number }
  | {
      eligible: true;
      roundedHalfYears: number;
      assuredPayout: number; // basic part, before DR
      minimumApplied: boolean;
      drAmount: number;
      payoutWithDr: number;
      familyPension: number;
      lumpSum: number;
    };

export function calculateUps(input: UpsInput): UpsResult {
  const totalMonths = Math.round(input.serviceYears * 12);
  const roundedHalfYears = roundQualifyingServiceToHalfYears(Math.floor(totalMonths / 12), totalMonths % 12);
  if (roundedHalfYears < UPS_MIN_HALF_YEARS) return { eligible: false, roundedHalfYears };

  const fullPayout = input.avgBasicLast12 * 0.5;
  const proportionate = fullPayout * (Math.min(roundedHalfYears, UPS_FULL_HALF_YEARS) / UPS_FULL_HALF_YEARS);
  const assuredPayout = Math.max(proportionate, UPS_MIN_PAYOUT);
  const drAmount = assuredPayout * (input.finalDaPercent / 100);

  return {
    eligible: true,
    roundedHalfYears,
    assuredPayout,
    minimumApplied: assuredPayout > proportionate,
    drAmount,
    payoutWithDr: assuredPayout + drAmount,
    familyPension: (assuredPayout + drAmount) * 0.6,
    lumpSum: (input.finalTotalPay / 10) * roundedHalfYears,
  };
}
