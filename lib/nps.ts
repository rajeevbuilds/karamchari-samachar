// Pure projection logic for /calculators/nps: what an NPS corpus could grow
// to by the retirement date, for a central government employee. Kept
// separate from the page/component so the maths can be reasoned about on its
// own. Every figure is a projection from assumptions, never a guarantee.
//
// Model (month by month, from the month after `asOf` to the retirement month):
//  - Contributions: 10% employee + 14% government, both on Basic Pay + DA,
//    added at each month-end.
//  - The corpus grows at the assumed annual return (compounded monthly).
//  - Annual increment on 1 July (7th CPC single increment date).
//  - DA is revised on 1 January and 1 July by a fixed number of points.
//  - Pay commissions take effect on 1 Jan 2026 and every 10 years after
//    (2036, 2046, ...): (Basic + DA) is uplifted by a percentage, becomes the
//    new Basic, and DA resets to 0.
//  - The pay commission due from 1 Jan 2026 is applied to the first month if
//    the entered Basic does not already include it, and the contributions
//    that would have been paid on the extra pay since then are added as
//    arrears (without interest).

export const EMPLOYEE_RATE_PERCENT = 10;
export const GOVERNMENT_RATE_PERCENT = 14;
export const FIRST_COMMISSION_YEAR = 2026;
export const COMMISSION_INTERVAL_YEARS = 10;
export const RETIREMENT_AGE = 60;

export type NpsInput = {
  dob: string; // YYYY-MM-DD
  doj: string; // YYYY-MM-DD
  basicPay: number;
  daPercent: number;
  presentCorpus: number;
  annualReturnPercent: number;
  annualIncrementPercent: number;
  daRisePerHalfYear: number; // DA percentage points added each Jan and Jul
  commissionUpliftPercent: number; // rise in (Basic + DA) at each pay commission
  commissionAlreadyReflected: boolean; // does the entered Basic already include the 2026 commission?
  annuityPercent: number; // share of the corpus used to buy an annuity
  annuityRatePercent: number;
};

export type NpsYearRow = {
  year: number;
  age: number;
  basicPay: number;
  daPercent: number;
  corpus: number;
  commissionApplied: boolean;
};

export type NpsResult =
  | { ok: false; error: string }
  | {
      ok: true;
      retirementDate: string; // YYYY-MM-DD (last day of the retirement month)
      monthsToRetirement: number;
      serviceYearsAtRetirement: number;
      corpus: number;
      lumpSum: number;
      annuityCorpus: number;
      monthlyPension: number;
      finalBasic: number;
      finalDaPercent: number;
      finalTotalPay: number;
      replacementRatio: number; // monthly pension / final Basic + DA
      totalContributions: number;
      growth: number;
      commissions: number[]; // years in which a commission was applied
      rows: NpsYearRow[];
    };

function parseYmd(s: string): { y: number; m: number; d: number } | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s);
  if (!match) return null;
  const [y, m, d] = [Number(match[1]), Number(match[2]), Number(match[3])];
  if (m < 1 || m > 12 || d < 1 || d > 31) return null;
  return { y, m, d };
}

// Superannuation is on the last day of the month in which the employee
// turns 60 — or of the previous month if born on the 1st.
function retirementMonthIndex(dob: { y: number; m: number; d: number }): number {
  const idx = (dob.y + RETIREMENT_AGE) * 12 + (dob.m - 1);
  return dob.d === 1 ? idx - 1 : idx;
}

const isCommissionJanuary = (year: number) =>
  year >= FIRST_COMMISSION_YEAR && (year - FIRST_COMMISSION_YEAR) % COMMISSION_INTERVAL_YEARS === 0;

export function projectNps(input: NpsInput, asOf: Date): NpsResult {
  const dob = parseYmd(input.dob);
  const doj = parseYmd(input.doj);
  if (!dob) return { ok: false, error: 'Enter a valid date of birth.' };
  if (!doj) return { ok: false, error: 'Enter a valid date of joining.' };

  const asOfIdx = asOf.getFullYear() * 12 + asOf.getMonth();
  const retireIdx = retirementMonthIndex(dob);
  if (retireIdx <= asOfIdx) {
    return { ok: false, error: 'This date of birth means retirement age (60) has already been reached.' };
  }
  if ((doj.y - dob.y) * 12 + (doj.m - dob.m) < 18 * 12) {
    return { ok: false, error: 'Date of joining must be at least 18 years after the date of birth.' };
  }
  if (doj.y * 12 + (doj.m - 1) > asOfIdx) {
    return { ok: false, error: 'Date of joining cannot be in the future.' };
  }

  const contributionRate = (EMPLOYEE_RATE_PERCENT + GOVERNMENT_RATE_PERCENT) / 100;
  const monthlyGrowth = Math.pow(1 + input.annualReturnPercent / 100, 1 / 12) - 1;
  const uplift = 1 + input.commissionUpliftPercent / 100;

  let basic = input.basicPay;
  let da = input.daPercent;
  let corpus = input.presentCorpus;
  let totalContributions = 0;
  const commissions: number[] = [];

  // The 2026 commission is not in the entered Basic: apply it now, with
  // contribution arrears for the months elapsed since 1 Jan 2026.
  const jan2026Idx = FIRST_COMMISSION_YEAR * 12;
  const nextCommissionIdx = (FIRST_COMMISSION_YEAR + COMMISSION_INTERVAL_YEARS) * 12;
  if (!input.commissionAlreadyReflected && jan2026Idx <= asOfIdx && asOfIdx < nextCommissionIdx) {
    const oldTotal = basic * (1 + da / 100);
    const newBasic = oldTotal * uplift;
    const arrears = (newBasic - oldTotal) * contributionRate * (asOfIdx - jan2026Idx + 1);
    corpus += arrears;
    totalContributions += arrears;
    basic = newBasic;
    da = 0;
    commissions.push(FIRST_COMMISSION_YEAR);
  }

  const rows: NpsYearRow[] = [];
  let yearCommission = false;

  for (let idx = asOfIdx + 1; idx <= retireIdx; idx++) {
    const year = Math.floor(idx / 12);
    const month = idx % 12; // 0 = January

    let commissionThisMonth = false;
    if (month === 0 && isCommissionJanuary(year)) {
      const oldTotal = basic * (1 + da / 100);
      basic = oldTotal * uplift;
      da = 0;
      commissionThisMonth = true;
      yearCommission = true;
      commissions.push(year);
    }
    if (month === 6) basic *= 1 + input.annualIncrementPercent / 100;
    if ((month === 0 || month === 6) && !commissionThisMonth) da += input.daRisePerHalfYear;

    const contribution = basic * (1 + da / 100) * contributionRate;
    corpus = corpus * (1 + monthlyGrowth) + contribution;
    totalContributions += contribution;

    if (month === 11 || idx === retireIdx) {
      rows.push({
        year,
        age: year - dob.y,
        basicPay: basic,
        daPercent: da,
        corpus,
        commissionApplied: yearCommission,
      });
      yearCommission = false;
    }
  }

  const annuityCorpus = corpus * (input.annuityPercent / 100);
  const monthlyPension = (annuityCorpus * (input.annuityRatePercent / 100)) / 12;
  const finalTotalPay = basic * (1 + da / 100);

  const retireYear = Math.floor(retireIdx / 12);
  const retireMonth = retireIdx % 12;
  const lastDay = new Date(Date.UTC(retireYear, retireMonth + 1, 0)).getUTCDate();
  const pad = (n: number) => String(n).padStart(2, '0');

  return {
    ok: true,
    retirementDate: `${retireYear}-${pad(retireMonth + 1)}-${pad(lastDay)}`,
    monthsToRetirement: retireIdx - asOfIdx,
    serviceYearsAtRetirement: (retireIdx - (doj.y * 12 + (doj.m - 1))) / 12,
    corpus,
    lumpSum: corpus - annuityCorpus,
    annuityCorpus,
    monthlyPension,
    finalBasic: basic,
    finalDaPercent: da,
    finalTotalPay,
    replacementRatio: finalTotalPay > 0 ? monthlyPension / finalTotalPay : 0,
    totalContributions,
    growth: corpus - input.presentCorpus - totalContributions,
    commissions,
    rows,
  };
}

// Deflates a future (nominal) amount into today's purchasing power at an
// assumed constant annual inflation rate.
export function toTodaysRupees(amount: number, monthsAway: number, inflationPercent: number): number {
  return amount / Math.pow(1 + inflationPercent / 100, monthsAway / 12);
}
