// Pure calculation logic for /calculators/gratuity (CCS Pension Rules, 2021,
// Rules 50 and 51 — same formula for NPS/UPS employees under the CCS
// (Payment of Gratuity under NPS) Rules, 2021). Kept separate from the
// page/component so the math can be reasoned about on its own.

import { roundQualifyingServiceToHalfYears } from './pension';

export type GratuityInput = {
  basicPay: number;
  daPercent: number;
  qualifyingYears: number;
  qualifyingMonths: number;
  ceiling: number;
};

export type RetirementGratuityResult =
  | { eligible: false; roundedHalfYears: number }
  | {
      eligible: true;
      emoluments: number;
      roundedHalfYears: number;
      countedHalfYears: number; // capped at 66 (33 years)
      uncapped: number;
      gratuity: number;
      capApplied: 'ceiling' | 'multiplier' | null;
    };

export type DeathGratuityResult = {
  emoluments: number;
  multiple: number; // times emoluments
  basis: string;
  uncapped: number;
  gratuity: number;
  ceilingApplied: boolean;
};

const MIN_RETIREMENT_HALF_YEARS = 10; // 5 years
const MAX_HALF_YEARS = 66; // 33 years -> 16.5 x emoluments

export function emolumentsOf(basicPay: number, daPercent: number): number {
  return basicPay + Math.round((basicPay * daPercent) / 100);
}

export function calculateRetirementGratuity(input: GratuityInput): RetirementGratuityResult {
  const roundedHalfYears = roundQualifyingServiceToHalfYears(input.qualifyingYears, input.qualifyingMonths);
  if (roundedHalfYears < MIN_RETIREMENT_HALF_YEARS) return { eligible: false, roundedHalfYears };

  const emoluments = emolumentsOf(input.basicPay, input.daPercent);
  const countedHalfYears = Math.min(roundedHalfYears, MAX_HALF_YEARS);
  const uncapped = emoluments * 0.25 * countedHalfYears;
  const gratuity = input.ceiling > 0 ? Math.min(uncapped, input.ceiling) : uncapped;
  return {
    eligible: true,
    emoluments,
    roundedHalfYears,
    countedHalfYears,
    uncapped,
    gratuity,
    capApplied:
      gratuity < uncapped ? 'ceiling' : roundedHalfYears > MAX_HALF_YEARS ? 'multiplier' : null,
  };
}

// Rule 51 slabs, by completed service at the time of death.
export function calculateDeathGratuity(input: GratuityInput): DeathGratuityResult {
  const emoluments = emolumentsOf(input.basicPay, input.daPercent);
  const totalMonths = Math.max(0, Math.round(input.qualifyingYears) * 12 + Math.round(input.qualifyingMonths));

  let multiple: number;
  let basis: string;
  if (totalMonths < 12) {
    multiple = 2;
    basis = 'Less than 1 year of service: 2 × emoluments';
  } else if (totalMonths < 60) {
    multiple = 6;
    basis = '1 year or more but less than 5 years: 6 × emoluments';
  } else if (totalMonths < 132) {
    multiple = 12;
    basis = '5 years or more but less than 11 years: 12 × emoluments';
  } else if (totalMonths < 240) {
    multiple = 20;
    basis = '11 years or more but less than 20 years: 20 × emoluments';
  } else {
    const halfYears = roundQualifyingServiceToHalfYears(input.qualifyingYears, input.qualifyingMonths);
    multiple = Math.min(halfYears * 0.5, 33);
    basis = `20 years or more: ½ × emoluments for each of ${halfYears} six-monthly periods (max 33 ×)`;
  }

  const uncapped = emoluments * multiple;
  const gratuity = input.ceiling > 0 ? Math.min(uncapped, input.ceiling) : uncapped;
  return { emoluments, multiple, basis, uncapped, gratuity, ceilingApplied: gratuity < uncapped };
}
