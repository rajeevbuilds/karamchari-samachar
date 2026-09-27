// Pure calculation logic for /calculators/pension-ops (OPS / CCS Pension
// Rules, 1972). Kept separate from the page/component so the math can be
// tested and reasoned about independent of the UI.

export type PensionOpsInput = {
  lastDrawnPay: number;
  avgLast10MonthsPay: number | null;
  qualifyingYears: number;
  qualifyingMonths: number;
  drPercent: number;
  minFloor: number;
};

export type PensionOpsResult =
  | {
      eligible: false;
      roundedHalfYears: number;
      normalFamilyPension: number;
      enhancedFamilyPension: number;
    }
  | {
      eligible: true;
      roundedHalfYears: number;
      roundedYears: number;
      pensionableBase: number;
      fullBasicPension: number;
      computedBasicPension: number;
      basicPension: number;
      floorApplied: boolean;
      drAmount: number;
      totalMonthlyPension: number;
      normalFamilyPension: number;
      enhancedFamilyPension: number;
    };

// Rounds qualifying service to the nearest completed 6-month period: below
// 3 months into the current half-year is dropped, 3 months or more rounds
// up to the next half-year. Returns the count of half-year (6-month) units.
export function roundQualifyingServiceToHalfYears(years: number, months: number): number {
  const totalMonths = Math.max(0, Math.round(years) * 12 + Math.round(months));
  const remainder = totalMonths % 6;
  const roundedMonths = remainder < 3 ? totalMonths - remainder : totalMonths - remainder + 6;
  return roundedMonths / 6;
}

const FULL_PENSION_HALF_YEARS = 40; // 20 years
const MIN_PENSION_HALF_YEARS = 20; // 10 years

export function calculatePensionOps(input: PensionOpsInput): PensionOpsResult {
  const roundedHalfYears = roundQualifyingServiceToHalfYears(input.qualifyingYears, input.qualifyingMonths);
  const normalFamilyPension = input.lastDrawnPay * 0.3;
  const enhancedFamilyPension = input.lastDrawnPay * 0.5;

  if (roundedHalfYears < MIN_PENSION_HALF_YEARS) {
    return { eligible: false, roundedHalfYears, normalFamilyPension, enhancedFamilyPension };
  }

  const pensionableBase =
    input.avgLast10MonthsPay != null
      ? Math.max(input.lastDrawnPay, input.avgLast10MonthsPay)
      : input.lastDrawnPay;
  const fullBasicPension = pensionableBase * 0.5;
  const computedBasicPension =
    roundedHalfYears >= FULL_PENSION_HALF_YEARS
      ? fullBasicPension
      : fullBasicPension * (roundedHalfYears / FULL_PENSION_HALF_YEARS);
  const basicPension = Math.max(computedBasicPension, input.minFloor);
  const drAmount = basicPension * (input.drPercent / 100);

  return {
    eligible: true,
    roundedHalfYears,
    roundedYears: roundedHalfYears / 2,
    pensionableBase,
    fullBasicPension,
    computedBasicPension,
    basicPension,
    floorApplied: basicPension > computedBasicPension,
    drAmount,
    totalMonthlyPension: basicPension + drAmount,
    normalFamilyPension,
    enhancedFamilyPension,
  };
}
