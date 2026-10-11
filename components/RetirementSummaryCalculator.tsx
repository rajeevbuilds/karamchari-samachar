'use client';

import { useMemo, useState, type FormEvent } from 'react';
import Link from 'next/link';
import DateInput from '@/components/DateInput';
import { DownloadPdfButton, PrintBrandFooter, PrintMasthead, usePrintSupport } from '@/components/PrintTools';
import { ageNextBirthday, COMMUTATION_MAX_AGE, COMMUTATION_MIN_AGE } from '@/lib/commutation';
import type { SharedProps } from '@/components/RetirementBenefits';
import { buildRetirementSummary, LEAVE_CEILING_DAYS, type RetirementSummary } from '@/lib/retirement';

const rupees = (n: number) => `₹${Math.round(n).toLocaleString('en-IN')}`;

const FIELD = 'w-full border border-rule px-3 py-2 text-sm focus:outline-none focus:border-maroon';
const LABEL = 'block text-xs font-mono uppercase text-ink/50 mb-1';

function formatDay(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number);
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  return `${d} ${months[m - 1]} ${y}`;
}

type Submitted = {
  summary: Extract<RetirementSummary, { ok: true }>;
  lastDrawnPay: number;
  avg: number | null;
  years: number;
  months: number;
  da: number;
  dr: number;
  lap: number;
  hpl: number;
  commutePercent: number;
  ageNext: number | null;
  retirementDate: string;
  gpf: number;
  other: number;
};

export default function RetirementSummaryCalculator({
  shared,
  onShared,
  daOnFile,
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
  const [lap, setLap] = useState('');
  const [hpl, setHpl] = useState('');
  const [ageOverride, setAgeOverride] = useState('');
  const [commutePercent, setCommutePercent] = useState('40');
  const [gpf, setGpf] = useState('');
  const [other, setOther] = useState('');
  const [submitted, setSubmitted] = useState<Submitted | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  function edit<T>(setter: (v: T) => void) {
    return (v: T) => {
      setter(v);
      setSubmitted(null);
      setFormError(null);
    };
  }

  // Age next birthday from the two dates, unless the person types one.
  const computedAge = useMemo(
    () => (dob && retirementDate ? ageNextBirthday(dob, retirementDate) : null),
    [dob, retirementDate]
  );
  const ageNext = ageOverride ? Number(ageOverride) : computedAge;

  function calculate(e: FormEvent) {
    e.preventDefault();
    const pay = Number(lastDrawnPay);
    if (!lastDrawnPay || !Number.isFinite(pay) || pay <= 0) return setFormError('Enter your last drawn Basic Pay.');
    const y = Number(years) || 0;
    const m = Number(months) || 0;
    if (y * 12 + m <= 0) return setFormError('Enter your qualifying service in years and months.');
    const pct = Number(commutePercent) || 0;
    if (pct < 0 || pct > 40) return setFormError('The share of pension commuted must be between 0 and 40.');
    if (pct > 0 && (ageNext === null || !Number.isFinite(ageNext)))
      return setFormError('To commute pension, enter your date of birth and date of retirement (or the age next birthday).');
    if (pct > 0 && ageNext !== null && (ageNext < COMMUTATION_MIN_AGE || ageNext > COMMUTATION_MAX_AGE))
      return setFormError(`The commutation table covers age next birthday ${COMMUTATION_MIN_AGE} to ${COMMUTATION_MAX_AGE}. Check the dates.`);

    const input = {
      lastDrawnPay: pay,
      avgLast10MonthsPay: avg10 && Number(avg10) > 0 ? Number(avg10) : null,
      qualifyingYears: y,
      qualifyingMonths: m,
      daPercent: Number(da) || 0,
      drPercent: Number(da) || 0,
      lapDays: Number(lap) || 0,
      hplDays: Number(hpl) || 0,
      commutePercent: pct,
      ageNextBirthday: ageNext ?? 0,
      gpfBalance: Number(gpf) || 0,
      otherDues: Number(other) || 0,
      gratuityCeiling: ceiling,
      minFloor,
    };
    const summary = buildRetirementSummary(input);
    if (!summary.ok) return setFormError(summary.error);
    setFormError(null);
    setSubmitted({
      summary,
      lastDrawnPay: pay,
      avg: input.avgLast10MonthsPay,
      years: y,
      months: m,
      da: input.daPercent,
      dr: input.drPercent,
      lap: input.lapDays,
      hpl: input.hplDays,
      commutePercent: pct,
      ageNext: pct > 0 ? ageNext : null,
      retirementDate,
      gpf: input.gpfBalance,
      other: input.otherDues,
    });
  }

  const s = submitted?.summary;

  return (
    <div>
      <div className="border border-rule bg-rule/10 px-5 py-4 mb-8 text-sm text-ink/80 leading-relaxed print:hidden">
        <strong className="text-ink">Disclaimer:</strong> This is an indicative estimate for employees under the Old
        Pension Scheme (joined before 1 January 2004), based on the CCS (Pension) Rules, the CCS (Commutation of
        Pension) Rules, 1981 (Table-II), and the leave encashment orders of the Railway Board and the CCS (Leave)
        Rules. It does not cover every case (breaks in service, VRS weightage, recoveries and so on). Your pension
        sanctioning authority makes the actual calculation. NPS and UPS employees should use the{' '}
        <Link href="/calculators/nps" className="underline hover:text-maroon">
          NPS &amp; UPS Calculator
        </Link>
        .
      </div>

      <form onSubmit={calculate} className="grid grid-cols-1 sm:grid-cols-2 gap-4 border border-rule p-5 mb-8 print:hidden">
        <div>
          <label className={LABEL}>Last drawn Basic Pay (₹)</label>
          <input type="number" min="0" value={lastDrawnPay} onChange={(e) => edit(setLastDrawnPay)(e.target.value)} placeholder="e.g. 56900" className={FIELD} />
        </div>
        <div>
          <label className={LABEL}>Average Basic Pay, last 10 months (₹, optional)</label>
          <input type="number" min="0" value={avg10} onChange={(e) => edit(setAvg10)(e.target.value)} placeholder="Leave blank if not needed" className={FIELD} />
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
          <label className={LABEL}>Dearness Allowance / Relief rate (%)</label>
          <input type="number" min="0" step="0.1" value={da} onChange={(e) => edit(setDa)(e.target.value)} className={FIELD} />
          <p className="text-xs text-ink/50 mt-1">
            {daOnFile
              ? 'Taken from the DA rates on this site for your date of retirement. DA and DR are the same rate. Used for gratuity, leave encashment and pension.'
              : 'No DA rate has been added on this site yet. Type the rate in force on your date of retirement. DA and DR are the same rate.'}
          </p>
        </div>

        <div>
          <label className={LABEL}>Leave on average pay at credit (days)</label>
          <input type="number" min="0" value={lap} onChange={(e) => edit(setLap)(e.target.value)} placeholder="e.g. 300" className={FIELD} />
        </div>
        <div>
          <label className={LABEL}>Half pay leave at credit (days)</label>
          <input type="number" min="0" value={hpl} onChange={(e) => edit(setHpl)(e.target.value)} className={FIELD} />
          <p className="text-xs text-ink/50 mt-1">Both together are limited to {LEAVE_CEILING_DAYS} days.</p>
        </div>

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
          <label className={LABEL}>Commute how much of the pension? (% — maximum 40)</label>
          <input type="number" min="0" max="40" value={commutePercent} onChange={(e) => edit(setCommutePercent)(e.target.value)} className={FIELD} />
          <p className="text-xs text-ink/50 mt-1">Enter 0 for no commutation.</p>
        </div>
        <div>
          <label className={LABEL}>Age next birthday (filled in from the dates)</label>
          <input
            type="number"
            min="0"
            value={ageOverride || (computedAge ?? '')}
            onChange={(e) => edit(setAgeOverride)(e.target.value)}
            placeholder="from the two dates"
            className={FIELD}
          />
          <p className="text-xs text-ink/50 mt-1">
            Table-II is read by age next birthday. Change it only if your office uses a different age.
          </p>
        </div>

        <div>
          <label className={LABEL}>GPF balance (₹, optional)</label>
          <input type="number" min="0" value={gpf} onChange={(e) => edit(setGpf)(e.target.value)} className={FIELD} />
        </div>
        <div>
          <label className={LABEL}>Other dues (₹, optional)</label>
          <input type="number" min="0" value={other} onChange={(e) => edit(setOther)(e.target.value)} className={FIELD} />
          <p className="text-xs text-ink/50 mt-1">For example CGEGIS or any other amount you expect.</p>
        </div>

        <div className="sm:col-span-2 flex items-center gap-4">
          <button type="submit" className="bg-ink text-paper px-5 py-2.5 text-sm font-medium hover:bg-maroon transition-colors">
            Calculate Retirement Summary
          </button>
          {formError && <span className="text-sm text-red-600">{formError}</span>}
        </div>
      </form>

      {submitted === null && !formError && (
        <p className="text-sm text-ink/50 mb-8 print:hidden">
          Fill in the details above and press &ldquo;Calculate Retirement Summary&rdquo;.
        </p>
      )}

      {submitted && s && (
        <>
          <DownloadPdfButton fileName="Retirement-Benefits-Summary" />
          <PrintMasthead
            title="Retirement Benefits Summary — Old Pension Scheme"
            printedOn={printedOn}
            rows={[
              ['Last drawn Basic Pay', rupees(submitted.lastDrawnPay)],
              ...(submitted.avg ? ([['Average Basic Pay, last 10 months', rupees(submitted.avg)]] as [string, string][]) : []),
              ['Qualifying service', `${submitted.years} years ${submitted.months} months`],
              ['DA / DR rate', `${submitted.da}% / ${submitted.dr}%`],
              ['Leave at credit', `${submitted.lap} days on average pay, ${submitted.hpl} days half pay`],
              ...(submitted.retirementDate ? ([['Date of retirement', formatDay(submitted.retirementDate)]] as [string, string][]) : []),
            ]}
          />

          {/* Monthly pension */}
          <div className="border border-rule p-5 mb-4 print:p-3 print:mb-2 print:break-inside-avoid">
            <h2 className="font-serif text-lg font-semibold text-ink mb-3 print:mb-1">Monthly pension</h2>
            {s.pension ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-xs font-mono uppercase text-ink/50 border-b border-rule">
                      <th className="py-2 print:py-1 pr-4 font-medium" />
                      <th className="py-2 print:py-1 px-3 font-medium text-right">{s.commutation ? 'Before commutation' : 'Monthly'}</th>
                      {s.commutation && <th className="py-2 print:py-1 px-3 font-medium text-right">After commutation</th>}
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-rule/60">
                      <td className="py-2 print:py-1 pr-4 text-ink/70">Basic pension</td>
                      <td className="px-3 py-2 print:py-1 text-right">{rupees(s.pension.basicPension)}</td>
                      {s.commutation && <td className="px-3 py-2 print:py-1 text-right">{rupees(s.commutation.reducedBasicPension)}</td>}
                    </tr>
                    <tr className="border-b border-rule/60">
                      <td className="py-2 print:py-1 pr-4 text-ink/70">Dearness Relief ({submitted.dr}%)</td>
                      <td className="px-3 py-2 print:py-1 text-right">{rupees(s.pension.drAmount)}</td>
                      {s.commutation && <td className="px-3 py-2 print:py-1 text-right">{rupees(s.commutation.reducedDr)}</td>}
                    </tr>
                    <tr>
                      <td className="py-2 print:py-1 pr-4 font-medium text-ink">Total monthly pension</td>
                      <td className="px-3 py-2 print:py-1 text-right font-serif text-lg font-semibold text-maroon">{rupees(s.pension.totalMonthlyPension)}</td>
                      {s.commutation && (
                        <td className="px-3 py-2 print:py-1 text-right font-serif text-lg font-semibold text-maroon">{rupees(s.commutation.reducedTotal)}</td>
                      )}
                    </tr>
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-sm text-ink/80 leading-relaxed">
                No pension applies under the Old Pension Scheme at {s.pensionShortfallYears?.toFixed(1)} years of qualifying service
                (a minimum of 10 years is needed). Only gratuity and the other amounts below are payable.
              </p>
            )}
            {s.pension && s.commutation && (
              <p className="text-xs text-ink/50 mt-3 print:mt-1">
                {submitted.commutePercent}% of the basic pension ({rupees(s.commutation.commutedPension)} a month) is commuted. The full pension is restored
                after {s.commutation.restoredAfterYears} years
                {submitted.retirementDate ? ` (around ${formatDay(`${Number(submitted.retirementDate.slice(0, 4)) + s.commutation.restoredAfterYears}${submitted.retirementDate.slice(4)}`)})` : ''}.
              </p>
            )}
          </div>

          {/* One-time amounts */}
          <div className="border border-rule p-5 mb-4 print:p-3 print:mb-2 print:break-inside-avoid">
            <h2 className="font-serif text-lg font-semibold text-ink mb-3 print:mb-1">Amounts you receive at retirement</h2>
            <table className="w-full text-sm">
              <tbody>
                <tr className="border-b border-rule/60 align-top">
                  <td className="py-2 print:py-1 pr-4 text-ink/70">
                    Retirement gratuity
                    {s.gratuityNote && <span className="block text-xs text-ink/50">{s.gratuityNote}</span>}
                  </td>
                  <td className="py-2 print:py-1 text-right whitespace-nowrap">{s.gratuity !== null ? rupees(s.gratuity) : '—'}</td>
                </tr>
                <tr className="border-b border-rule/60 align-top">
                  <td className="py-2 print:py-1 pr-4 text-ink/70">
                    Leave encashment
                    <span className="block text-xs text-ink/50">
                      {s.leave.lapDaysUsed} days on average pay
                      {s.leave.hplDaysUsed > 0 ? ` + ${s.leave.hplDaysUsed} days half pay` : ''}
                      {s.leave.ceilingApplied ? ` — ${s.leave.daysLostToCeiling} days above the ${LEAVE_CEILING_DAYS}-day limit are not paid` : ''}
                    </span>
                  </td>
                  <td className="py-2 print:py-1 text-right whitespace-nowrap">{rupees(s.leave.total)}</td>
                </tr>
                {s.commutation && (
                  <tr className="border-b border-rule/60 align-top">
                    <td className="py-2 print:py-1 pr-4 text-ink/70">
                      Commutation of pension
                      <span className="block text-xs text-ink/50">
                        {rupees(s.commutation.commutedPension)} × 12 × {s.commutation.factor} (factor for age next birthday {submitted.ageNext})
                      </span>
                    </td>
                    <td className="py-2 print:py-1 text-right whitespace-nowrap">{rupees(s.commutation.lumpSum)}</td>
                  </tr>
                )}
                {s.gpfBalance > 0 && (
                  <tr className="border-b border-rule/60">
                    <td className="py-2 print:py-1 pr-4 text-ink/70">GPF balance</td>
                    <td className="py-2 print:py-1 text-right whitespace-nowrap">{rupees(s.gpfBalance)}</td>
                  </tr>
                )}
                {s.otherDues > 0 && (
                  <tr className="border-b border-rule/60">
                    <td className="py-2 print:py-1 pr-4 text-ink/70">Other dues</td>
                    <td className="py-2 print:py-1 text-right whitespace-nowrap">{rupees(s.otherDues)}</td>
                  </tr>
                )}
                <tr>
                  <td className="py-2 print:py-1 pr-4 font-medium text-ink">Total at retirement</td>
                  <td className="py-2 print:py-1 text-right font-serif text-xl font-semibold text-maroon whitespace-nowrap">{rupees(s.lumpSumTotal)}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Family pension */}
          {s.pension && (
            <p className="text-xs print:text-[10px] text-ink/60 mb-4 print:mb-1 leading-relaxed">
              Family pension, for information: normal rate (30% of last pay) {rupees(submitted.lastDrawnPay * 0.3)} a month; enhanced rate
              (50% of last pay, for the first 7 years or until the pensioner would have reached age 67)
              {' '}
              {rupees(submitted.lastDrawnPay * 0.5)} a month. Not part of the amounts above.
            </p>
          )}

          <ul className="list-disc pl-5 space-y-1 print:space-y-0 text-xs print:text-[9px] text-ink/60 leading-relaxed mb-8 print:mb-1">
            <li className="print:hidden">Pension is half of the last drawn pay for 20 years of service or more, in proportion below that. DA and DR are shown at the rates entered.</li>
            <li>
              Leave on average pay is paid at (Basic + DA) ÷ 30 a day. Half pay leave is paid at half that rate. Together they are limited to {LEAVE_CEILING_DAYS} days,
              counting leave on average pay first (Railway Board orders RBE 157/97, 147/2008, 148/2008, 130/2009 and 204/2009).
            </li>
            <li>
              Commutation uses Table-II of the CCS (Commutation of Pension) Rules, 1981 (LIC 94-96 Ultimate Tables, 8% interest): commuted value = commuted pension × 12 × factor,
              up to 40% of the basic pension.
            </li>
          </ul>

          <PrintBrandFooter
            qrSrc="/qr/retirement-benefits.svg"
            disclaimer="This is an estimate for planning only, not an official calculation. Your pension sanctioning authority makes the actual calculation."
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
