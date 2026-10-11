'use client';

import { useMemo, useState, type FormEvent } from 'react';
import Link from 'next/link';
import DateInput from '@/components/DateInput';
import { DownloadPdfButton, PrintBrandFooter, PrintMasthead, usePrintSupport } from '@/components/PrintTools';
import type { SharedProps } from '@/components/RetirementBenefits';
import { checkPpo, type PpoCheck } from '@/lib/ppocheck';
import { ageNextBirthday, commutationFactor } from '@/lib/commutation';
import { buildRetirementSummary } from '@/lib/retirement';

const FIELD = 'w-full border border-rule px-3 py-2 text-sm focus:outline-none focus:border-maroon';
const LABEL = 'block text-xs font-mono uppercase text-ink/50 mb-1';
const rupees = (n: number) => `₹${Math.round(n).toLocaleString('en-IN')}`;

function formatDay(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number);
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  return `${d} ${months[m - 1]} ${y}`;
}

const num = (v: string): number | null => (v.trim() !== '' && Number.isFinite(Number(v)) ? Number(v) : null);

type Submitted = {
  check: PpoCheck;
  rows: [string, string][];
};

export default function PpoChecker({
  shared,
  onShared,
  ceiling,
  minFloor,
}: SharedProps & {
  ceiling: number;
  minFloor: number;
}) {
  const printedOn = usePrintSupport();
  const lastDrawnPay = shared.lastDrawnPay;
  const setLastDrawnPay = (v: string) => onShared({ lastDrawnPay: v });
  const avg10 = shared.avg10;
  const setAvg10 = (v: string) => onShared({ avg10: v });
  const years = shared.years;
  const setYears = (v: string) => onShared({ years: v });
  const months = shared.months;
  const setMonths = (v: string) => onShared({ months: v });
  const da = shared.da;
  const setDa = (v: string) => onShared({ da: v });
  const dob = shared.dob;
  const setDob = (v: string) => onShared({ dob: v });
  const retirementDate = shared.retirementDate;
  const setRetirementDate = (v: string) => onShared({ retirementDate: v });
  // From the PPO
  const [basicPension, setBasicPension] = useState('');
  const [commutedPension, setCommutedPension] = useState('');
  const [commutedValue, setCommutedValue] = useState('');
  const [reducedPension, setReducedPension] = useState('');
  const [restorationDate, setRestorationDate] = useState('');
  const [gratuity, setGratuity] = useState('');
  // From the service record

  const [submitted, setSubmitted] = useState<Submitted | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  function edit<T>(setter: (v: T) => void) {
    return (v: T) => {
      setter(v);
      setSubmitted(null);
      setFormError(null);
    };
  }

  // The figures the rules give for the service details, shown as they are filled in.
  const { expected, expectedNote } = useMemo(() => {
    const pay = Number(lastDrawnPay);
    const y = Number(years) || 0;
    const m = Number(months) || 0;
    if (!(pay > 0) || y * 12 + m <= 0) return { expected: null, expectedNote: '' };
    const ageNext = dob && retirementDate ? ageNextBirthday(dob, retirementDate) : null;
    const canCommute = ageNext !== null && commutationFactor(ageNext) !== null;
    const r = buildRetirementSummary({
      lastDrawnPay: pay,
      avgLast10MonthsPay: Number(avg10) > 0 ? Number(avg10) : null,
      qualifyingYears: y,
      qualifyingMonths: m,
      daPercent: Number(da) || 0,
      drPercent: Number(da) || 0,
      lapDays: 0,
      hplDays: 0,
      commutePercent: canCommute ? 40 : 0,
      ageNextBirthday: ageNext ?? 0,
      gpfBalance: 0,
      otherDues: 0,
      gratuityCeiling: ceiling,
      minFloor,
    });
    if (!r.ok) return { expected: null, expectedNote: '' };
    const rows: [string, string][] = [];
    if (r.pension) rows.push(['Basic pension (₹ a month)', rupees(r.pension.basicPension)]);
    else rows.push(['Basic pension', 'Not eligible (under 10 years)']);
    if (r.commutation) {
      rows.push(['Commuted pension, at 40% (₹ a month)', rupees(r.commutation.commutedPension)]);
      rows.push(['Commuted value, the lump sum (₹)', rupees(r.commutation.lumpSum)]);
      rows.push(['Reduced pension (₹ a month)', rupees(r.commutation.reducedBasicPension)]);
      if (/^\d{4}-\d{2}-\d{2}$/.test(retirementDate)) {
        const [yy, mm, dd] = retirementDate.split('-');
        rows.push(['Commuted pension restored on', `${dd}/${mm}/${Number(yy) + r.commutation.restoredAfterYears}`]);
      }
    }
    rows.push(['Retirement gratuity (₹)', r.gratuity !== null ? rupees(r.gratuity) : 'Not eligible (under 5 years)']);
    return {
      expected: rows,
      expectedNote: r.commutation
        ? 'Commutation is shown at the full 40%. If you commuted a smaller share, your PPO figures will differ here; the checks below use the commuted pension printed on your PPO.'
        : 'Add your date of birth and date of retirement to see the commutation figures.',
    };
  }, [lastDrawnPay, avg10, years, months, da, dob, retirementDate, ceiling, minFloor]);

  function run(e: FormEvent) {
    e.preventDefault();
    const ppo = {
      basicPension: num(basicPension),
      commutedPension: num(commutedPension),
      commutedValue: num(commutedValue),
      reducedPension: num(reducedPension),
      restorationDate,
      gratuity: num(gratuity),
    };
    const entered = [ppo.basicPension, ppo.commutedPension, ppo.commutedValue, ppo.reducedPension, ppo.gratuity].some((v) => v !== null) || restorationDate !== '';
    if (!entered) return setFormError('Enter at least one figure from your PPO to compare it with the rules.');

    const facts = {
      lastDrawnPay: num(lastDrawnPay),
      avgLast10MonthsPay: num(avg10) && Number(avg10) > 0 ? Number(avg10) : null,
      qualifyingYears: Number(years) || 0,
      qualifyingMonths: Number(months) || 0,
      daPercent: Number(da) || 0,
      dob,
      retirementDate,
      minFloor,
      gratuityCeiling: ceiling,
    };
    const check = checkPpo(ppo, facts);

    const rows: [string, string][] = [];
    if (dob) rows.push(['Date of birth', formatDay(dob)]);
    if (retirementDate) rows.push(['Date of retirement', formatDay(retirementDate)]);
    if (facts.lastDrawnPay) rows.push(['Last drawn Basic Pay', rupees(facts.lastDrawnPay)]);
    if (facts.qualifyingYears || facts.qualifyingMonths) rows.push(['Qualifying service', `${facts.qualifyingYears} years ${facts.qualifyingMonths} months`]);
    if (facts.lastDrawnPay) rows.push(['DA rate at retirement', `${facts.daPercent}%`]);
    setFormError(null);
    setSubmitted({ check, rows });
  }

  const c = submitted?.check;
  const symbol = { ok: '✓', differs: '⚠', skipped: '–' } as const;
  const word = { ok: 'Matches', differs: 'Check this', skipped: 'Not checked' } as const;
  const tone = { ok: 'text-leaf', differs: 'text-maroon', skipped: 'text-ink/50' } as const;

  return (
    <div>
      <div className="border border-rule bg-rule/10 px-5 py-4 mb-8 text-sm text-ink/80 leading-relaxed print:hidden">
        <strong className="text-ink">Please read:</strong> This tool compares the figures on your Pension Payment Order
        (PPO) with the rules. It is <strong>not</strong> a PPO and cannot replace one, and a difference here is a reason
        to ask your Accounts Office or Pension Cell, not proof of a mistake. It is for employees under the Old Pension
        Scheme. <strong>Do not type your name, PPO number or account number.</strong> They are not needed. Everything is
        worked out in your browser and nothing is stored or sent.
      </div>

      <form onSubmit={run} className="grid grid-cols-1 sm:grid-cols-2 gap-4 border border-rule p-5 mb-8 print:hidden">
        <h2 className="sm:col-span-2 font-serif text-lg font-semibold text-ink">1. Your service details</h2>
        <p className="sm:col-span-2 text-xs text-ink/50 -mt-2">
          Already filled if you used the other tab. As you fill these in, the figures the rules give appear below.
        </p>
        <div>
          <label className={LABEL}>Date of birth</label>
          <DateInput value={dob} onChange={(v) => edit(setDob)(v)} className={FIELD} />
        </div>
        <div>
          <label className={LABEL}>Date of retirement</label>
          <DateInput value={retirementDate} onChange={(v) => edit(setRetirementDate)(v)} className={FIELD} />
          <p className="text-xs text-ink/50 mt-1">Filled from your date of birth (age 60). You can change it.</p>
        </div>
        <div>
          <label className={LABEL}>Last drawn Basic Pay (₹)</label>
          <input type="number" min="0" value={lastDrawnPay} onChange={(e) => edit(setLastDrawnPay)(e.target.value)} className={FIELD} placeholder="e.g. 56900" />
        </div>
        <div>
          <label className={LABEL}>Average Basic Pay, last 10 months (₹, optional)</label>
          <input type="number" min="0" value={avg10} onChange={(e) => edit(setAvg10)(e.target.value)} className={FIELD} />
        </div>
        <div>
          <label className={LABEL}>Qualifying service — years</label>
          <input type="number" min="0" value={years} onChange={(e) => edit(setYears)(e.target.value)} className={FIELD} />
        </div>
        <div>
          <label className={LABEL}>Qualifying service — months</label>
          <input type="number" min="0" max="11" value={months} onChange={(e) => edit(setMonths)(e.target.value)} className={FIELD} />
        </div>
        <div>
          <label className={LABEL}>DA rate at retirement (%)</label>
          <input type="number" min="0" step="0.1" value={da} onChange={(e) => edit(setDa)(e.target.value)} className={FIELD} />
          <p className="text-xs text-ink/50 mt-1">Taken from the DA rates on this site for your date of retirement. You can change it.</p>
        </div>

        {expected && (
          <div className="sm:col-span-2 border border-leaf/40 bg-leaf/10 px-4 py-3 text-sm" aria-live="polite">
            <p className="font-medium text-ink mb-2">What the rules give for these details</p>
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1">
              {expected.map(([k, v]) => (
                <div key={k} className="flex justify-between gap-3 border-b border-rule/40 py-1">
                  <dt className="text-ink/70">{k}</dt>
                  <dd className="font-medium text-ink whitespace-nowrap">{v}</dd>
                </div>
              ))}
            </dl>
            <p className="text-xs text-ink/60 mt-2 leading-snug">{expectedNote}</p>
          </div>
        )}

        <h2 className="sm:col-span-2 font-serif text-lg font-semibold text-ink mt-2">2. Figures printed on your PPO</h2>
        <p className="sm:col-span-2 text-xs text-ink/50 -mt-2">Enter what is printed on your PPO and press &ldquo;Check my PPO&rdquo; to compare it with the figures above.</p>
        <div>
          <label className={LABEL}>Basic pension (₹ a month)</label>
          <input type="number" min="0" value={basicPension} onChange={(e) => edit(setBasicPension)(e.target.value)} className={FIELD} placeholder="e.g. 28450" />
        </div>
        <div>
          <label className={LABEL}>Commuted pension (₹ a month)</label>
          <input type="number" min="0" value={commutedPension} onChange={(e) => edit(setCommutedPension)(e.target.value)} className={FIELD} placeholder="e.g. 11380" />
        </div>
        <div>
          <label className={LABEL}>Commuted value, the lump sum (₹)</label>
          <input type="number" min="0" value={commutedValue} onChange={(e) => edit(setCommutedValue)(e.target.value)} className={FIELD} placeholder="e.g. 1118973" />
        </div>
        <div>
          <label className={LABEL}>Reduced pension after commutation (₹ a month)</label>
          <input type="number" min="0" value={reducedPension} onChange={(e) => edit(setReducedPension)(e.target.value)} className={FIELD} placeholder="e.g. 17070" />
        </div>
        <div>
          <label className={LABEL}>Date the commuted pension is restored</label>
          <DateInput value={restorationDate} onChange={(v) => edit(setRestorationDate)(v)} className={FIELD} />
        </div>
        <div>
          <label className={LABEL}>Retirement gratuity (₹)</label>
          <input type="number" min="0" value={gratuity} onChange={(e) => edit(setGratuity)(e.target.value)} className={FIELD} placeholder="e.g. 1502160" />
        </div>

        <div className="sm:col-span-2 flex items-center gap-4">
          <button type="submit" className="bg-ink text-paper px-5 py-2.5 text-sm font-medium hover:bg-maroon transition-colors">
            Check my PPO
          </button>
          {formError && <span className="text-sm text-red-600">{formError}</span>}
        </div>
      </form>

      {submitted === null && !formError && (
        <p className="text-sm text-ink/50 mb-8 print:hidden">Enter the figures from your PPO and press &ldquo;Check my PPO&rdquo;.</p>
      )}

      {submitted && c && (
        <>
          <DownloadPdfButton fileName="PPO-Verification-Report" />
          <PrintMasthead title="PPO Verification Report — estimate, not an official document" printedOn={printedOn} rows={submitted.rows.length ? submitted.rows : [['Figures', 'As entered from the PPO']]} />

          <div
            className={`px-4 py-3 mb-4 print:mb-2 text-sm leading-relaxed border ${
              c.differs > 0 ? 'border-maroon/40 bg-maroon/5' : 'border-leaf/40 bg-leaf/10'
            }`}
            role="status"
          >
            {c.differs > 0 ? (
              <p className="font-medium text-ink">
                {c.differs} {c.differs === 1 ? 'line needs' : 'lines need'} a check with your Accounts Office or Pension Cell.
              </p>
            ) : c.ok > 0 ? (
              <p className="font-medium text-ink">
                All {c.ok} {c.ok === 1 ? 'line' : 'lines'} checked match the rules.
              </p>
            ) : (
              <p className="font-medium text-ink">Nothing could be checked yet. Fill in more of the boxes below the PPO figures.</p>
            )}
            {c.skipped > 0 && (
              <p className="mt-1 text-ink/70">
                {c.skipped} {c.skipped === 1 ? 'line was' : 'lines were'} not checked, because some details were left out. See the lines marked &ldquo;Not checked&rdquo;.
              </p>
            )}
          </div>

          <div className="border border-rule p-5 mb-4 print:p-3 print:mb-2 print:break-inside-avoid">
            <h2 className="font-serif text-lg font-semibold text-ink mb-3 print:mb-1">What was checked</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm print:text-xs">
                <thead>
                  <tr className="text-left text-xs font-mono uppercase text-ink/50 border-b border-rule">
                    <th className="py-2 print:py-1 pr-3 font-medium w-[30%]">Item</th>
                    <th className="py-2 print:py-1 px-2 font-medium text-right">On your PPO</th>
                    <th className="py-2 print:py-1 px-2 font-medium text-right">By the rules</th>
                    <th className="py-2 print:py-1 pl-3 font-medium">Result</th>
                  </tr>
                </thead>
                <tbody>
                  {c.lines.map((l) => (
                    <tr key={l.key} className="border-b border-rule/60 align-top">
                      <td className="py-2 print:py-1 pr-3 text-ink min-w-[9rem]">{l.label}</td>
                      <td className="py-2 print:py-1 px-2 text-right whitespace-nowrap">{l.ppo || '—'}</td>
                      <td className="py-2 print:py-1 px-2 text-right whitespace-nowrap">{l.expected || '—'}</td>
                      <td className="py-2 print:py-1 pl-3 min-w-[12rem]">
                        <span className={`font-medium ${tone[l.status]}`}>
                          {symbol[l.status]} {word[l.status]}
                        </span>
                        <span className="block text-xs print:text-[10px] text-ink/60 leading-snug">{l.message}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <ul className="list-disc pl-5 space-y-1 print:space-y-0 text-xs print:text-[9px] text-ink/60 leading-relaxed mb-8 print:mb-1">
            <li>
              If a line says &ldquo;Check this&rdquo;, take your PPO and this report to your Accounts Office or Pension Cell and ask them to verify it. They
              can tell you whether a correction is needed.
            </li>
            <li>
              Rules used: basic pension and gratuity as in the CCS (Pension) Rules; commutation of up to 40% with Table-II of the CCS (Commutation of Pension)
              Rules, 1981 (LIC 94-96, 8% interest), the pension being restored after 15 years.
            </li>
            <li className="print:hidden">
              Small rounding differences (₹1 on pension, about ₹100 on the lump sum) are treated as matching.
            </li>
          </ul>

          <PrintBrandFooter
            qrSrc="/qr/retirement-benefits-check.svg"
            disclaimer="This report was made by an online tool and is not a Pension Payment Order or any official document. Verify every figure with your Accounts Office."
          />
        </>
      )}

      <p className="text-xs text-ink/40 mt-8 print:hidden">
        See also:{' '}
        <Link href="/calculators/pension-ops" className="underline hover:text-maroon">
          OPS Pension Calculator
        </Link>
        {' · '}
        <Link href="/calculators/gratuity" className="underline hover:text-maroon">
          Gratuity Calculator
        </Link>
      </p>
    </div>
  );
}
