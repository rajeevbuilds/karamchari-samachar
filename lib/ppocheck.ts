// "Check your PPO": compares the figures printed on a Pension Payment Order
// with what the rules give. Two layers:
//   1. Consistency of the PPO's own figures (needs only the PPO): commuted
//      share within 40%, reduced pension = basic - commuted, commuted value =
//      commuted pension x 12 x Table-II factor, restoration after 15 years.
//   2. Against the employee's service facts (needs those facts): basic pension
//      and gratuity, worked out with the same rules as the other calculators.
// A difference is a reason to ask the Accounts Office, never a verdict.

import { ageNextBirthday, commutationFactor, MAX_COMMUTABLE_FRACTION, RESTORATION_YEARS } from './commutation';
import { calculatePensionOps } from './pension';
import { calculateRetirementGratuity } from './gratuity';

export type PpoFigures = {
  basicPension: number | null; // per month
  commutedPension: number | null; // per month
  commutedValue: number | null; // lump sum paid
  reducedPension: number | null; // per month, after commutation
  restorationDate: string; // YYYY-MM-DD or ''
  gratuity: number | null;
};

export type PpoFacts = {
  lastDrawnPay: number | null;
  avgLast10MonthsPay: number | null;
  qualifyingYears: number;
  qualifyingMonths: number;
  daPercent: number;
  dob: string;
  retirementDate: string;
  minFloor: number;
  gratuityCeiling: number;
};

export type LineStatus = 'ok' | 'differs' | 'skipped';

export type CheckLine = {
  key: string;
  label: string;
  ppo: string; // as printed on the PPO
  expected: string; // what the rules give ('' when not worked out)
  status: LineStatus;
  message: string;
};

export type PpoCheck = { lines: CheckLine[]; ok: number; differs: number; skipped: number };

const rupees = (n: number) => `₹${Math.round(n).toLocaleString('en-IN')}`;

function dayNumber(iso: string): number {
  const [y, m, d] = iso.split('-').map(Number);
  return Date.UTC(y, m - 1, d) / 86400000;
}

function addYears(iso: string, years: number): string {
  const [y, m, d] = iso.split('-').map(Number);
  const last = new Date(Date.UTC(y + years, m, 0)).getUTCDate();
  return `${y + years}-${String(m).padStart(2, '0')}-${String(Math.min(d, last)).padStart(2, '0')}`;
}

function fmtDay(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number);
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  return `${d} ${months[m - 1]} ${y}`;
}

export function checkPpo(ppo: PpoFigures, facts: PpoFacts): PpoCheck {
  const lines: CheckLine[] = [];
  const add = (l: CheckLine) => lines.push(l);
  const skip = (key: string, label: string, ppoText: string, why: string) =>
    add({ key, label, ppo: ppoText, expected: '', status: 'skipped', message: why });

  // 1. Commuted share within 40%
  if (ppo.basicPension !== null && ppo.commutedPension !== null) {
    const share = ppo.basicPension > 0 ? (ppo.commutedPension / ppo.basicPension) * 100 : 0;
    const limit = ppo.basicPension * MAX_COMMUTABLE_FRACTION;
    if (ppo.commutedPension > limit + 1) {
      add({
        key: 'share',
        label: 'Commuted pension within 40% limit',
        ppo: rupees(ppo.commutedPension),
        expected: `up to ${rupees(limit)}`,
        status: 'differs',
        message: `The commuted pension is ${share.toFixed(1)}% of the basic pension. At most 40% can be commuted.`,
      });
    } else {
      add({
        key: 'share',
        label: 'Commuted pension within 40% limit',
        ppo: rupees(ppo.commutedPension),
        expected: `up to ${rupees(limit)}`,
        status: 'ok',
        message: `${share.toFixed(1)}% of the basic pension (limit 40%).`,
      });
    }
  } else skip('share', 'Commuted pension within 40% limit', '', 'Enter the basic pension and the commuted pension.');

  // 2. Reduced pension = basic - commuted
  if (ppo.basicPension !== null && ppo.commutedPension !== null && ppo.reducedPension !== null) {
    const expected = ppo.basicPension - ppo.commutedPension;
    const diff = ppo.reducedPension - expected;
    add({
      key: 'reduced',
      label: 'Reduced pension (basic − commuted)',
      ppo: rupees(ppo.reducedPension),
      expected: rupees(expected),
      status: Math.abs(diff) <= 1 ? 'ok' : 'differs',
      message:
        Math.abs(diff) <= 1
          ? 'Matches.'
          : `The PPO shows ${rupees(Math.abs(diff))} ${diff > 0 ? 'more' : 'less'} than basic pension minus commuted pension.`,
    });
  } else skip('reduced', 'Reduced pension (basic − commuted)', '', 'Enter the basic, commuted and reduced pension.');

  // 3. Commuted value = commuted pension x 12 x factor
  const retirementOk = /^\d{4}-\d{2}-\d{2}$/.test(facts.retirementDate);
  const dobOk = /^\d{4}-\d{2}-\d{2}$/.test(facts.dob);
  if (ppo.commutedPension !== null && ppo.commutedValue !== null && retirementOk && dobOk) {
    const age = ageNextBirthday(facts.dob, facts.retirementDate);
    const factor = commutationFactor(age);
    if (factor === null) {
      skip('value', 'Commuted value (lump sum)', rupees(ppo.commutedValue), 'The age is outside the commutation table (20 to 81). Check the dates.');
    } else {
      const expected = Math.round(ppo.commutedPension * 12 * factor);
      const tolerance = 12 * factor + 5; // the pension is rounded to a whole rupee
      const diff = ppo.commutedValue - expected;
      if (Math.abs(diff) <= tolerance) {
        add({
          key: 'value',
          label: 'Commuted value (lump sum)',
          ppo: rupees(ppo.commutedValue),
          expected: rupees(expected),
          status: 'ok',
          message: `Matches: ${rupees(ppo.commutedPension)} × 12 × ${factor} (Table-II, age next birthday ${age}).`,
        });
      } else {
        // Does it match the factor for a neighbouring age?
        let hint = '';
        for (const other of [age - 1, age + 1]) {
          const f = commutationFactor(other);
          if (f !== null && Math.abs(ppo.commutedValue - Math.round(ppo.commutedPension * 12 * f)) <= 12 * f + 5) {
            hint = ` It matches the factor for age next birthday ${other} (${f}). Ask your office which age it used and why.`;
          }
        }
        add({
          key: 'value',
          label: 'Commuted value (lump sum)',
          ppo: rupees(ppo.commutedValue),
          expected: rupees(expected),
          status: 'differs',
          message: `The PPO is ${rupees(Math.abs(diff))} ${diff > 0 ? 'higher' : 'lower'} than ${rupees(ppo.commutedPension)} × 12 × ${factor} (Table-II, age next birthday ${age}).${hint}`,
        });
      }
    }
  } else
    skip(
      'value',
      'Commuted value (lump sum)',
      ppo.commutedValue !== null ? rupees(ppo.commutedValue) : '',
      'Enter the commuted pension, the commuted value, the date of birth and the date of retirement.'
    );

  // 4. Restoration date = 15 years after retirement
  if (ppo.restorationDate && retirementOk) {
    const expected = addYears(facts.retirementDate, RESTORATION_YEARS);
    const diffDays = Math.abs(dayNumber(ppo.restorationDate) - dayNumber(expected));
    add({
      key: 'restoration',
      label: 'Commuted pension restored on',
      ppo: fmtDay(ppo.restorationDate),
      expected: `about ${fmtDay(expected)}`,
      status: diffDays <= 2 ? 'ok' : 'differs',
      message:
        diffDays <= 2
          ? `Matches: ${RESTORATION_YEARS} years after retirement.`
          : `The commuted part of the pension is restored after ${RESTORATION_YEARS} years. The PPO date is ${diffDays} days away from ${fmtDay(expected)}.`,
    });
  } else skip('restoration', 'Commuted pension restored on', ppo.restorationDate ? fmtDay(ppo.restorationDate) : '', 'Enter the restoration date and the date of retirement.');

  // 5. Basic pension against the service facts
  const factsOk = facts.lastDrawnPay !== null && facts.lastDrawnPay > 0 && facts.qualifyingYears * 12 + facts.qualifyingMonths > 0;
  if (ppo.basicPension !== null && factsOk) {
    const r = calculatePensionOps({
      lastDrawnPay: facts.lastDrawnPay!,
      avgLast10MonthsPay: facts.avgLast10MonthsPay,
      qualifyingYears: facts.qualifyingYears,
      qualifyingMonths: facts.qualifyingMonths,
      drPercent: 0,
      minFloor: facts.minFloor,
    });
    if (!r.eligible) {
      add({
        key: 'basic',
        label: 'Basic pension',
        ppo: rupees(ppo.basicPension),
        expected: 'no pension',
        status: 'differs',
        message: 'At this qualifying service no pension applies under the Old Pension Scheme (10 years are needed). Check the service entered.',
      });
    } else {
      const diff = ppo.basicPension - r.basicPension;
      add({
        key: 'basic',
        label: 'Basic pension',
        ppo: rupees(ppo.basicPension),
        expected: rupees(r.basicPension),
        status: Math.abs(diff) <= 1 ? 'ok' : 'differs',
        message:
          Math.abs(diff) <= 1
            ? `Matches: ${r.roundedHalfYears >= 40 ? 'half of the pay for 20 years or more of service' : `in proportion to ${r.roundedHalfYears / 2} years of service`}.`
            : `The PPO is ${rupees(Math.abs(diff))} ${diff > 0 ? 'higher' : 'lower'}. Check the pay, the average of the last 10 months and the qualifying service used.`,
      });
    }
  } else
    skip('basic', 'Basic pension', ppo.basicPension !== null ? rupees(ppo.basicPension) : '', 'Enter the last drawn pay and the qualifying service to check this.');

  // 6. Gratuity against the service facts
  if (ppo.gratuity !== null && factsOk) {
    const g = calculateRetirementGratuity({
      basicPay: facts.lastDrawnPay!,
      daPercent: facts.daPercent,
      qualifyingYears: facts.qualifyingYears,
      qualifyingMonths: facts.qualifyingMonths,
      ceiling: facts.gratuityCeiling,
    });
    if (!g.eligible) {
      add({ key: 'gratuity', label: 'Retirement gratuity', ppo: rupees(ppo.gratuity), expected: 'none', status: 'differs', message: 'Retirement gratuity needs at least 5 years of qualifying service.' });
    } else {
      const diff = ppo.gratuity - Math.round(g.gratuity);
      add({
        key: 'gratuity',
        label: 'Retirement gratuity',
        ppo: rupees(ppo.gratuity),
        expected: rupees(g.gratuity),
        status: Math.abs(diff) <= 1 ? 'ok' : 'differs',
        message:
          Math.abs(diff) <= 1
            ? 'Matches.'
            : `The PPO is ${rupees(Math.abs(diff))} ${diff > 0 ? 'higher' : 'lower'}. Check the DA rate at retirement, the service counted and the maximum gratuity.`,
      });
    }
  } else skip('gratuity', 'Retirement gratuity', ppo.gratuity !== null ? rupees(ppo.gratuity) : '', 'Enter the last drawn pay, the service and the DA rate to check this.');

  return {
    lines,
    ok: lines.filter((l) => l.status === 'ok').length,
    differs: lines.filter((l) => l.status === 'differs').length,
    skipped: lines.filter((l) => l.status === 'skipped').length,
  };
}
