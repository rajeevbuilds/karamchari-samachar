// Commutation of pension under the CCS (Commutation of Pension) Rules, 1981
// (applied to Railway employees through the Railway Services (Pension) Rules).
//
// Table-II: "Commutation value for a pension of Re.1 per annum", by age next
// birthday. Basis: LIC (94-96) Ultimate Tables and 8.00% interest, as issued by
// the Department of Pension & Pensioners' Welfare after the Sixth Pay
// Commission. Transcribed from the published table (ages 20 to 81) and checked:
// strictly falling with age, and age 61 = 8.194 and age 65 = 7.731 agree with
// the figures quoted in official orders and a High Court judgment.
// (The 1971 "Table-1", based on 4.75% interest, is no longer used.)

export const COMMUTATION_FACTORS: Record<number, number> = {
  20: 9.188, 21: 9.187, 22: 9.186, 23: 9.185, 24: 9.184, 25: 9.183, 26: 9.182, 27: 9.18, 28: 9.178, 29: 9.176,
  30: 9.173, 31: 9.169, 32: 9.164, 33: 9.159, 34: 9.152, 35: 9.145, 36: 9.136, 37: 9.126, 38: 9.116, 39: 9.103,
  40: 9.09, 41: 9.075, 42: 9.059, 43: 9.04, 44: 9.019, 45: 8.996, 46: 8.971, 47: 8.943, 48: 8.913, 49: 8.881,
  50: 8.846, 51: 8.808, 52: 8.768, 53: 8.724, 54: 8.678, 55: 8.627, 56: 8.572, 57: 8.512, 58: 8.446, 59: 8.371,
  60: 8.287, 61: 8.194, 62: 8.093, 63: 7.982, 64: 7.862, 65: 7.731, 66: 7.591, 67: 7.431, 68: 7.262, 69: 7.083,
  70: 6.897, 71: 6.703, 72: 6.502, 73: 6.296, 74: 6.085, 75: 5.872, 76: 5.657, 77: 5.443, 78: 5.229, 79: 5.018,
  80: 4.812, 81: 4.611,
};

export const COMMUTATION_MIN_AGE = 20;
export const COMMUTATION_MAX_AGE = 81;
export const MAX_COMMUTABLE_FRACTION = 0.4; // up to 40% of the basic pension
export const RESTORATION_YEARS = 15; // the commuted part is restored after 15 years

export function commutationFactor(ageNextBirthday: number): number | null {
  return COMMUTATION_FACTORS[ageNextBirthday] ?? null;
}

// Age next birthday = completed years + 1, as on `onISO`.
export function ageNextBirthday(dobISO: string, onISO: string): number {
  const [by, bm, bd] = dobISO.split('-').map(Number);
  const [oy, om, od] = onISO.split('-').map(Number);
  let completed = oy - by;
  if (om < bm || (om === bm && od < bd)) completed -= 1;
  return completed + 1;
}

export type Commutation =
  | { ok: true; commutedPension: number; reducedBasicPension: number; factor: number; lumpSum: number }
  | { ok: false; error: string };

// Commuted value = commuted pension x 12 x factor, where the commuted pension
// is the chosen share (up to 40%) of the basic pension.
export function commute(basicPension: number, percent: number, ageNext: number): Commutation {
  if (!(percent > 0)) return { ok: true, commutedPension: 0, reducedBasicPension: basicPension, factor: 0, lumpSum: 0 };
  if (percent > MAX_COMMUTABLE_FRACTION * 100) return { ok: false, error: 'At most 40% of the basic pension can be commuted.' };
  const factor = commutationFactor(ageNext);
  if (factor === null)
    return {
      ok: false,
      error: `The commutation table covers age next birthday ${COMMUTATION_MIN_AGE} to ${COMMUTATION_MAX_AGE}. Check the dates of birth and retirement.`,
    };
  const commutedPension = basicPension * (percent / 100);
  return {
    ok: true,
    commutedPension,
    reducedBasicPension: basicPension - commutedPension,
    factor,
    lumpSum: Math.round(commutedPension * 12 * factor),
  };
}
