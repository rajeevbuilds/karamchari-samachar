'use client';

import { useEffect, useMemo, useState, type FormEvent } from 'react';
import Link from 'next/link';
import DateInput from '@/components/DateInput';
import { DownloadPdfButton, PrintBrandFooter } from '@/components/PrintTools';
import {
  cellsOf,
  fixPayAfterMacp,
  fixPayOnPromotion,
  formatDay,
  levelIndex,
  levelLabel,
  nextLevel,
  type FixationOption,
  type FixationResult,
} from '@/lib/payfix';
import { PAY_LEVELS, type PayLevelId } from '@/lib/paymatrix';

type Tab = 'promotion' | 'macp' | 'after-macp';

const TAB_LABEL: Record<Tab, string> = {
  promotion: 'Promotion',
  macp: 'MACP upgradation',
  'after-macp': 'Promotion after MACP',
};

const rupees = (n: number) => `₹${n.toLocaleString('en-IN')}`;

type Submitted = {
  tab: Tab;
  level: PayLevelId;
  basicPay: number;
  newLevel: PayLevelId;
  date: string;
  option: FixationOption;
  incrementMonth: 1 | 7;
  result: FixationResult;
};

const FIELD =
  'w-full border border-rule px-3 py-2 text-sm bg-paper focus:outline-none focus:border-maroon';
const LABEL = 'block text-xs font-mono uppercase text-ink/50 mb-1';

export default function PayFixationCalculator() {
  const [tab, setTab] = useState<Tab>('promotion');
  const [level, setLevel] = useState<PayLevelId | ''>('');
  const [basicPay, setBasicPay] = useState('');
  const [newLevel, setNewLevel] = useState<PayLevelId | ''>('');
  const [date, setDate] = useState('');
  const [option, setOption] = useState<FixationOption>('promotion-date');
  const [incrementMonth, setIncrementMonth] = useState<'1' | '7'>('7');
  const [submitted, setSubmitted] = useState<Submitted | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [printedOn, setPrintedOn] = useState('');

  // Print support, as on the other calculators: hide the site chrome while
  // printing and stamp the printout with the date it was made.
  useEffect(() => {
    document.body.classList.add('calc-print');
    const before = () =>
      setPrintedOn(
        new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
      );
    window.addEventListener('beforeprint', before);
    return () => {
      document.body.classList.remove('calc-print');
      window.removeEventListener('beforeprint', before);
    };
  }, []);

  function edit<T>(setter: (v: T) => void) {
    return (v: T) => {
      setter(v);
      setSubmitted(null);
      setFormError(null);
    };
  }

  function chooseTab(next: Tab) {
    setTab(next);
    setLevel('');
    setBasicPay('');
    setNewLevel('');
    setSubmitted(null);
    setFormError(null);
  }

  function chooseLevel(next: PayLevelId | '') {
    setLevel(next);
    setBasicPay('');
    // On MACP the upgraded level is the next one up the matrix.
    setNewLevel(tab === 'macp' && next ? nextLevel(next) ?? '' : '');
    setSubmitted(null);
    setFormError(null);
  }

  const higherLevels = useMemo(
    () => (level ? PAY_LEVELS.filter((l) => levelIndex(l) > levelIndex(level)) : []),
    [level]
  );

  function calculate(e: FormEvent) {
    e.preventDefault();
    if (!level) return setFormError('Choose your present Level.');
    if (!basicPay) return setFormError('Choose your present Basic Pay.');
    if (!newLevel) return setFormError(tab === 'macp' ? 'Choose the Level you are upgraded to.' : 'Choose the Level you are promoted to.');
    if (!date) return setFormError(tab === 'macp' ? 'Enter the date of the MACP upgradation.' : 'Enter the date of promotion.');
    setFormError(null);

    const pay = Number(basicPay);
    const month = Number(incrementMonth) as 1 | 7;
    const result =
      tab === 'after-macp'
        ? fixPayAfterMacp({ level, basicPay: pay, newLevel, date })
        : fixPayOnPromotion({
            level,
            basicPay: pay,
            newLevel,
            date,
            option,
            incrementMonth: month,
            kind: tab === 'macp' ? 'macp' : 'promotion',
          });
    setSubmitted({ tab, level, basicPay: pay, newLevel, date, option, incrementMonth: month, result });
  }

  const tabClass = (active: boolean) =>
    `px-4 py-2 text-sm border ${
      active ? 'bg-ink text-paper border-ink' : 'border-rule text-ink/70 hover:text-maroon'
    }`;

  const noun = tab === 'macp' ? 'MACP upgradation' : 'promotion';
  const r = submitted?.result;
  const good = r && r.ok ? r : null;
  const rise = good && submitted ? good.newPay - submitted.basicPay : 0;
  const risePercent = good && submitted && submitted.basicPay ? (rise / submitted.basicPay) * 100 : 0;

  return (
    <div>
      <div className="border border-rule bg-rule/10 px-5 py-4 mb-8 text-sm text-ink/80 leading-relaxed print:hidden">
        <strong className="text-ink">Disclaimer:</strong> This calculator gives an indicative estimate of pay
        fixation under the 7th CPC Pay Matrix, following Rule 13 of the (Revised Pay) Rules, 2016 (Central
        Government and Railway employees), DoPT OM dated 27 July 2017 and Railway Board RBE No. 23/2019. It does
        not cover running allowances, special pay, personal pay or other special cases. The sanctioning
        authority fixes the actual pay — always verify with your pay and accounts office.
      </div>

      <div className="flex flex-wrap gap-2 mb-4 print:hidden" role="tablist" aria-label="Type of fixation">
        {(Object.keys(TAB_LABEL) as Tab[]).map((t) => (
          <button
            key={t}
            type="button"
            role="tab"
            aria-selected={tab === t}
            className={tabClass(tab === t)}
            onClick={() => chooseTab(t)}
          >
            {TAB_LABEL[t]}
          </button>
        ))}
      </div>

      {tab === 'after-macp' && (
        <p className="text-sm text-ink/70 mb-4 print:hidden">
          For an employee who already received the pay fixation benefit at MACP and is now regularly promoted.
          No second increment is added (Railway Board RBE No. 23/2019).
        </p>
      )}

      <form onSubmit={calculate} className="grid grid-cols-1 sm:grid-cols-2 gap-4 border border-rule p-5 mb-8 print:hidden">
        <div>
          <label htmlFor="pf-level" className={LABEL}>
            {tab === 'after-macp' ? 'Present Level (reached by MACP)' : 'Present Level'}
          </label>
          <select id="pf-level" value={level} onChange={(e) => chooseLevel(e.target.value as PayLevelId | '')} className={FIELD}>
            <option value="">Select Level</option>
            {PAY_LEVELS.map((l) => (
              <option key={l} value={l}>
                {levelLabel(l)}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="pf-pay" className={LABEL}>
            Present Basic Pay (₹)
          </label>
          <select
            id="pf-pay"
            value={basicPay}
            onChange={(e) => edit(setBasicPay)(e.target.value)}
            disabled={!level}
            className={FIELD}
          >
            <option value="">{level ? 'Select Basic Pay' : 'Select Level first'}</option>
            {level &&
              cellsOf(level).map((c) => (
                <option key={c} value={c}>
                  {rupees(c)}
                </option>
              ))}
          </select>
        </div>

        <div>
          <label htmlFor="pf-new" className={LABEL}>
            {tab === 'macp' ? 'Upgraded to Level' : 'Promoted to Level'}
          </label>
          <select
            id="pf-new"
            value={newLevel}
            onChange={(e) => edit(setNewLevel)(e.target.value as PayLevelId | '')}
            disabled={!level}
            className={FIELD}
          >
            <option value="">{level ? 'Select Level' : 'Select present Level first'}</option>
            {tab === 'after-macp' && level && <option value={level}>{levelLabel(level)} (same level)</option>}
            {higherLevels.map((l) => (
              <option key={l} value={l}>
                {levelLabel(l)}
              </option>
            ))}
          </select>
          {tab === 'macp' && (
            <p className="text-xs text-ink/50 mt-1">
              Filled in with the next higher Level in the Pay Matrix. Change it only if your MACP order says
              otherwise.
            </p>
          )}
        </div>

        <div>
          <label htmlFor="pf-date" className={LABEL}>
            {tab === 'macp' ? 'Date of MACP upgradation' : 'Date of promotion'}
          </label>
          <DateInput id="pf-date" value={date} onChange={(v) => edit(setDate)(v)} className={FIELD} />
        </div>

        {tab !== 'after-macp' && (
          <>
            <fieldset className="sm:col-span-2">
              <legend className={LABEL}>Option for fixation of pay</legend>
              <div className="flex flex-col gap-2 text-sm text-ink/80">
                <label className="flex items-start gap-2">
                  <input
                    type="radio"
                    name="pf-option"
                    checked={option === 'promotion-date'}
                    onChange={() => edit(setOption)('promotion-date')}
                    className="mt-1"
                  />
                  From the date of {noun}
                </label>
                <label className="flex items-start gap-2">
                  <input
                    type="radio"
                    name="pf-option"
                    checked={option === 'next-increment'}
                    onChange={() => edit(setOption)('next-increment')}
                    className="mt-1"
                  />
                  <span>
                    From the date of next increment in the lower post
                    <span className="block text-xs text-ink/50">
                      The option has to be given within one month of the {noun} (DoPT OM, 27 July 2017).
                    </span>
                  </span>
                </label>
              </div>
            </fieldset>

            <div>
              <label htmlFor="pf-month" className={LABEL}>
                Month of your annual increment (present post)
              </label>
              <select
                id="pf-month"
                value={incrementMonth}
                onChange={(e) => edit(setIncrementMonth)(e.target.value as '1' | '7')}
                className={FIELD}
              >
                <option value="1">1 January</option>
                <option value="7">1 July</option>
              </select>
              <p className="text-xs text-ink/50 mt-1">Needed for the next-increment option.</p>
            </div>
          </>
        )}

        <div className="sm:col-span-2 flex items-center gap-4">
          <button
            type="submit"
            className="bg-ink text-paper px-5 py-2.5 text-sm font-medium hover:bg-maroon transition-colors"
          >
            Calculate Pay Fixation
          </button>
          {formError && <span className="text-sm text-red-600">{formError}</span>}
        </div>
      </form>

      {submitted === null && !formError && (
        <p className="text-sm text-ink/50 mb-8 print:hidden">
          Choose your Level and Basic Pay, enter the date, and press &ldquo;Calculate Pay Fixation&rdquo;.
        </p>
      )}

      {r && !r.ok && (
        <div className="border border-red-300 bg-red-50 px-5 py-4 mb-8 text-sm text-red-800 leading-relaxed" role="alert">
          {r.error}
        </div>
      )}

      {good && submitted && (
        <>
          <DownloadPdfButton fileName="Pay-Fixation-Estimate" />

          <PrintHeader submitted={submitted} printedOn={printedOn} />

          <div className="border border-rule p-5 mb-6 print:p-3 print:mb-2 print:break-inside-avoid">
            <h2 className="font-serif text-lg font-semibold text-ink mb-4 print:mb-2">
              Pay after {submitted.tab === 'macp' ? 'MACP upgradation' : 'promotion'}
            </h2>
            <dl className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm mb-2">
              <div>
                <dt className="text-ink/50 mb-1">Present pay</dt>
                <dd className="font-serif text-xl text-ink">
                  {rupees(submitted.basicPay)} <span className="text-sm text-ink/50">{levelLabel(submitted.level)}</span>
                </dd>
              </div>
              <div>
                <dt className="text-ink/50 mb-1">New Basic Pay</dt>
                <dd className="font-serif text-xl text-maroon">
                  {rupees(good.newPay)} <span className="text-sm text-ink/50">{levelLabel(good.level)}</span>
                </dd>
              </div>
              <div>
                <dt className="text-ink/50 mb-1">Increase</dt>
                <dd className="font-serif text-xl text-ink">
                  {rupees(rise)} <span className="text-sm text-ink/50">({risePercent.toFixed(1)}%)</span>
                </dd>
              </div>
            </dl>
            <p className="text-xs text-ink/50">
              The new Basic Pay applies from{' '}
              {submitted.option === 'next-increment' && submitted.tab !== 'after-macp'
                ? `${formatDay(good.timeline[1]?.date ?? submitted.date)} (re-fixed); until then pay is ${rupees(good.timeline[0].pay)}`
                : formatDay(submitted.date)}
              .
            </p>
          </div>

          <div className="border border-rule p-5 mb-6 print:p-3 print:mb-2 print:break-inside-avoid">
            <h2 className="font-serif text-lg font-semibold text-ink mb-3 print:mb-1">How the pay is fixed</h2>
            <ol className="list-decimal pl-5 space-y-2 print:space-y-1 text-sm print:text-xs text-ink/80 leading-relaxed">
              {good.steps.map((s, i) => (
                <li key={i}>{s}</li>
              ))}
            </ol>
          </div>

          <div className="border border-rule p-5 mb-6 print:p-3 print:mb-2 print:break-inside-avoid">
            <h2 className="font-serif text-lg font-semibold text-ink mb-3 print:mb-1">Pay on the way</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs font-mono uppercase text-ink/50 border-b border-rule">
                    <th className="py-2 pr-4 font-medium">From</th>
                    <th className="py-2 pr-4 font-medium">Level</th>
                    <th className="py-2 pr-4 font-medium text-right">Basic Pay</th>
                    <th className="py-2 font-medium pl-4">What happens</th>
                  </tr>
                </thead>
                <tbody>
                  {good.timeline.map((row) => (
                    <tr key={row.date + row.pay} className="border-b border-rule/60">
                      <td className="py-2 print:py-1 pr-4 whitespace-nowrap">{formatDay(row.date)}</td>
                      <td className="py-2 print:py-1 pr-4 whitespace-nowrap">{levelLabel(row.level)}</td>
                      <td className="py-2 print:py-1 pr-4 text-right font-medium whitespace-nowrap">{rupees(row.pay)}</td>
                      <td className="py-2 print:py-1 pl-4 text-ink/70">{row.remark}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <ul className="list-disc pl-5 space-y-1 text-xs print:text-[10px] text-ink/60 leading-relaxed mb-8 print:mb-2">
            {good.notes.map((n, i) => (
              <li key={i}>{n}</li>
            ))}
          </ul>

          <PrintBrandFooter
            qrSrc="/qr/pay-fixation.svg"
            disclaimer="This is an estimate for planning only, not an official pay fixation. Verify it with your department's pay and accounts office."
          />
        </>
      )}

      <p className="text-xs text-ink/40 mt-8 print:hidden">
        See also:{' '}
        <Link href="/calculators/nps" className="underline hover:text-maroon">
          NPS &amp; UPS Calculator
        </Link>
        {' · '}
        <Link href="/section/pay-commission" className="underline hover:text-maroon">
          Pay Commission circulars
        </Link>
      </p>
    </div>
  );
}

// Print-only masthead: site name, what this printout is, when it was made and
// what it was made from. Hidden on screen.
function PrintHeader({ submitted, printedOn }: { submitted: Submitted; printedOn: string }) {
  const s = submitted;
  const isMacp = s.tab === 'macp';
  const rows: [string, string][] = [
    ['Present Level and Basic Pay', `${levelLabel(s.level)} · ${rupees(s.basicPay)}`],
    [isMacp ? 'Upgraded to' : 'Promoted to', levelLabel(s.newLevel)],
    [isMacp ? 'Date of MACP upgradation' : 'Date of promotion', formatDay(s.date)],
  ];
  if (s.tab !== 'after-macp') {
    rows.push(
      ['Option', s.option === 'promotion-date' ? 'Pay fixed from the date of ' + (isMacp ? 'upgradation' : 'promotion') : 'Pay fixed from the date of next increment in the lower post'],
      ['Annual increment month', s.incrementMonth === 1 ? '1 January' : '1 July']
    );
  }

  return (
    <div className="hidden print:block mb-3">
      <div className="flex items-center justify-between gap-6 border-b-4 border-ink pb-2 mb-2">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/brand/logo.webp" alt="SarkariKaramchari.com" className="h-16 w-auto" />
        <div className="text-right">
          <p className="font-sans text-4xl font-extrabold text-ink leading-none tracking-tight">
            sarkarikaramchari.com
          </p>
          <p className="mt-3 text-base text-ink/80">सरकारी कर्मचारी समाचार · DA, Circulars &amp; Pay Updates</p>
        </div>
      </div>
      <div className="flex items-baseline justify-between gap-6 mb-2">
        <p className="font-serif text-xl font-semibold text-ink">Pay Fixation Estimate — {TAB_LABEL[s.tab]}</p>
        {printedOn && <p className="text-xs text-ink/60 whitespace-nowrap">Prepared on {printedOn}</p>}
      </div>
      <table className="w-full text-xs border border-rule">
        <tbody>
          {rows.map(([label, value]) => (
            <tr key={label} className="border-b border-rule/60 align-top">
              <td className="py-0.5 px-2 w-[32%] text-ink/60 bg-rule/20">{label}</td>
              <td className="py-0.5 px-2 text-ink">{value}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
