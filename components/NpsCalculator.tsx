'use client';

import { useEffect, useState, type FormEvent } from 'react';
import DateInput from '@/components/DateInput';
import { Printer } from 'lucide-react';
import Link from 'next/link';
import {
  projectNps,
  toTodaysRupees,
  findReturnToReachCorpus,
  RETIREMENT_AGE,
  type NpsInput,
  type NpsResult,
} from '@/lib/nps';
import { computeBreakEven, BREAK_EVEN_HORIZON_AGE, type BreakEvenResult } from '@/lib/breakeven';
import BreakEvenChart from './BreakEvenChart';
import { calculateUps, type UpsResult } from '@/lib/ups';

function formatRupees(amount: number): string {
  return `₹${Math.round(amount).toLocaleString('en-IN')}`;
}

// "₹3.94 crore" / "₹23.7 lakh" — a readable companion to the full figure.
function formatShort(amount: number): string {
  if (amount >= 1e7) return `₹${(amount / 1e7).toFixed(2)} crore`;
  if (amount >= 1e5) return `₹${(amount / 1e5).toFixed(2)} lakh`;
  return formatRupees(amount);
}

function formatDate(ymd: string): string {
  const [y, m, d] = ymd.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  });
}

const inputClass =
  'w-full border border-rule px-3 py-2 text-sm focus:outline-none focus:border-maroon';
const labelClass = 'block text-xs font-mono uppercase text-ink/50 mb-1';

type Computed = {
  base: Extract<NpsResult, { ok: true }>;
  scenarios: { label: string; returnPercent: number; corpus: number; pension: number }[];
  input: NpsInput;
  inflationPercent: number;
  // Corpus with the pay commission uplift switched off, and how much of the
  // corpus is just today's corpus compounding — the "what drives this" note.
  corpusWithoutUplift: number;
  presentCorpusShare: number;
  ups: UpsResult;
  breakEven: BreakEvenResult | null;
  investReturnPercent: number;
  // NPS return needed for the whole corpus to buy an annuity as big as the UPS payout.
  matchReturn: number | null;
  matchCorpus: number;
};

type Tab = 'nps' | 'ups';

export default function NpsCalculator({ defaultDaPercent }: { defaultDaPercent: number }) {
  const [tab, setTab] = useState<Tab>('nps');
  const [printedOn, setPrintedOn] = useState('');
  const [host, setHost] = useState('sarkarikaramchari.com');

  // Print support: mark the page so globals.css hides the site header,
  // footer and bottom nav when printing, and open every collapsed
  // <details> (year-by-year tables, etc.) for the printout — whether the
  // user pressed our Print button or Ctrl+P — then put them back.
  useEffect(() => {
    document.body.classList.add('calc-print');
    setHost(window.location.host);
    const reopened: HTMLDetailsElement[] = [];
    const before = () => {
      setPrintedOn(
        new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
      );
      document.querySelectorAll('details').forEach((d) => {
        if (!d.open) {
          d.open = true;
          reopened.push(d);
        }
      });
    };
    const after = () => {
      reopened.splice(0).forEach((d) => (d.open = false));
    };
    window.addEventListener('beforeprint', before);
    window.addEventListener('afterprint', after);
    return () => {
      document.body.classList.remove('calc-print');
      window.removeEventListener('beforeprint', before);
      window.removeEventListener('afterprint', after);
    };
  }, []);
  const [dob, setDob] = useState('');
  const [doj, setDoj] = useState('');
  const [basicPay, setBasicPay] = useState('');
  const [daPercent, setDaPercent] = useState(String(defaultDaPercent));
  const [presentCorpus, setPresentCorpus] = useState('');
  const [commissionReflected, setCommissionReflected] = useState(false);

  // Assumptions: sensible defaults, editable.
  const [annualReturn, setAnnualReturn] = useState('8');
  const [inflation, setInflation] = useState('5');
  const [investReturn, setInvestReturn] = useState('7');
  const [increment, setIncrement] = useState('3');
  const [daRise, setDaRise] = useState('2');
  const [uplift, setUplift] = useState('15');
  const [annuityPercent, setAnnuityPercent] = useState('40');
  const [annuityRate, setAnnuityRate] = useState('6');

  const [computed, setComputed] = useState<Computed | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Results are cleared as soon as any input changes, so a stale figure never
  // sits next to edited values.
  function edit(setter: (v: string) => void) {
    return (v: string) => {
      setter(v);
      setComputed(null);
      setError(null);
    };
  }

  function calculate(e: FormEvent) {
    e.preventDefault();
    const basic = Number(basicPay);
    const corpus = Number(presentCorpus);
    if (!dob || !doj) return fail('Enter your date of birth and date of joining.');
    if (!basicPay || !Number.isFinite(basic) || basic <= 0) return fail('Enter a valid Basic Pay.');
    if (presentCorpus === '' || !Number.isFinite(corpus) || corpus < 0)
      return fail('Enter your present NPS corpus (0 if none yet).');

    const input: NpsInput = {
      dob,
      doj,
      basicPay: basic,
      daPercent: Number(daPercent) || 0,
      presentCorpus: corpus,
      annualReturnPercent: Number(annualReturn) || 0,
      annualIncrementPercent: Number(increment) || 0,
      daRisePerHalfYear: Number(daRise) || 0,
      commissionUpliftPercent: Number(uplift) || 0,
      commissionAlreadyReflected: commissionReflected,
      annuityPercent: Math.min(100, Math.max(0, Number(annuityPercent) || 0)),
      annuityRatePercent: Number(annuityRate) || 0,
    };

    const asOf = new Date();
    const base = projectNps(input, asOf);
    if (!base.ok) return fail(base.error);

    const scenarios = [-2, 0, 2].map((delta) => {
      const returnPercent = Math.max(0, input.annualReturnPercent + delta);
      const r = projectNps({ ...input, annualReturnPercent: returnPercent }, asOf);
      return {
        label: delta === 0 ? 'Your assumption' : delta < 0 ? 'Lower' : 'Higher',
        returnPercent,
        corpus: r.ok ? r.corpus : 0,
        pension: r.ok ? r.monthlyPension : 0,
      };
    });

    const ups = calculateUps({
      avgBasicLast12: base.avgBasicLast12,
      finalTotalPay: base.finalTotalPay,
      finalDaPercent: base.finalDaPercent,
      serviceYears: base.serviceYearsAtRetirement,
    });
    const investReturnPercent = Number(investReturn) || 0;
    const breakEven = ups.eligible
      ? computeBreakEven({
          npsLumpSum: base.lumpSum,
          npsMonthlyPension: base.monthlyPension,
          upsLumpSum: ups.lumpSum,
          upsAssuredPayout: ups.assuredPayout,
          upsDaPercentAtRetirement: base.finalDaPercent,
          retirementDate: base.retirementDate,
          retirementAge: RETIREMENT_AGE,
          daRisePerHalfYear: input.daRisePerHalfYear,
          commissionUpliftPercent: input.commissionUpliftPercent,
          investReturnPercent,
        })
      : null;
    const matchCorpus =
      ups.eligible && input.annuityRatePercent > 0
        ? (ups.payoutWithDr * 12) / (input.annuityRatePercent / 100)
        : 0;
    const matchReturn = matchCorpus > 0 ? findReturnToReachCorpus(input, asOf, matchCorpus) : null;

    const noUplift = projectNps({ ...input, commissionUpliftPercent: 0 }, asOf);
    const presentGrown =
      input.presentCorpus * Math.pow(1 + input.annualReturnPercent / 100, base.monthsToRetirement / 12);

    setError(null);
    setComputed({
      base,
      scenarios,
      input,
      inflationPercent: Number(inflation) || 0,
      corpusWithoutUplift: noUplift.ok ? noUplift.corpus : base.corpus,
      presentCorpusShare: base.corpus > 0 ? presentGrown / base.corpus : 0,
      ups,
      breakEven,
      investReturnPercent,
      matchReturn,
      matchCorpus,
    });
  }

  function fail(message: string) {
    setComputed(null);
    setError(message);
  }

  const tabClass = (active: boolean) =>
    `px-4 py-2 text-sm border ${
      active ? 'bg-ink text-paper border-ink' : 'border-rule text-ink/70 hover:text-maroon'
    }`;

  const r = computed?.base;
  const today = (amount: number) =>
    computed && r ? toTodaysRupees(amount, r.monthsToRetirement, computed.inflationPercent) : amount;

  return (
    <div>
      {computed && (
        <PrintHeader
          title={
            tab === 'nps'
              ? 'NPS Corpus & Pension Projection'
              : 'UPS Pension Projection & UPS vs NPS Comparison'
          }
          host={host}
          printedOn={printedOn}
          computed={computed}
          commissionReflected={commissionReflected}
          retirementDate={computed.base.retirementDate}
        />
      )}
      <div className="border border-rule bg-rule/10 px-5 py-4 mb-8 text-sm text-ink/80 leading-relaxed">
        <strong className="text-ink">Disclaimer:</strong> This is a projection built from the assumptions below
        (returns, DA, pay commission outcomes and annuity rates are all estimates) and is for planning only —
        your actual figures will differ. NPS returns are market-linked and not guaranteed; the UPS payouts
        follow the scheme rules but still depend on the pay path assumed. The main figures are in future
        (nominal) rupees; a line below each shows roughly what it is worth in today&apos;s purchasing power.
      </div>

      <div className="flex gap-2 mb-4 print:hidden" role="tablist" aria-label="Pension scheme">
        <button
          type="button"
          role="tab"
          aria-selected={tab === 'nps'}
          className={tabClass(tab === 'nps')}
          onClick={() => setTab('nps')}
        >
          NPS Calculator
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={tab === 'ups'}
          className={tabClass(tab === 'ups')}
          onClick={() => setTab('ups')}
        >
          UPS Calculator
        </button>
      </div>

      <form onSubmit={calculate} className="grid grid-cols-1 sm:grid-cols-2 gap-4 border border-rule p-5 mb-8 print:hidden">
        <div>
          <label className={labelClass}>Date of birth</label>
          <DateInput value={dob} onChange={(v) => edit(setDob)(v)} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Date of joining</label>
          <DateInput value={doj} onChange={(v) => edit(setDoj)(v)} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Present Basic Pay (₹)</label>
          <input
            type="number"
            min="0"
            value={basicPay}
            onChange={(e) => edit(setBasicPay)(e.target.value)}
            placeholder="e.g. 60000"
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>Current DA rate (%)</label>
          <input
            type="number"
            min="0"
            step="0.1"
            value={daPercent}
            onChange={(e) => edit(setDaPercent)(e.target.value)}
            className={inputClass}
          />
        </div>
        <div className="sm:col-span-2">
          <label className={labelClass}>
            Present NPS corpus (₹) — from your PRAN statement{tab === 'ups' ? ' (used for the NPS comparison)' : ''}
          </label>
          <input
            type="number"
            min="0"
            value={presentCorpus}
            onChange={(e) => edit(setPresentCorpus)(e.target.value)}
            placeholder="e.g. 2000000"
            className={inputClass}
          />
        </div>
        <label className="sm:col-span-2 flex items-start gap-2 text-sm">
          <input
            type="checkbox"
            className="mt-1"
            checked={commissionReflected}
            onChange={(e) => {
              setCommissionReflected(e.target.checked);
              setComputed(null);
              setError(null);
            }}
          />
          <span>
            My Basic Pay above already includes the 8th Pay Commission (w.e.f. 1 Jan 2026). Leave unticked
            if it is still your 7th Pay Commission Basic — the 8th will then be applied to it.
          </span>
        </label>

        <details className="sm:col-span-2 border border-rule p-4">
          <summary className="cursor-pointer text-sm font-medium text-ink">
            Assumptions (editable) — return {annualReturn}%, increment {increment}%, DA +{daRise} pts every
            Jan &amp; Jul, pay commission +{uplift}% every 10 years
          </summary>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
            <div>
              <label className={labelClass}>Expected annual return (%)</label>
              <input type="number" min="0" step="0.1" value={annualReturn} onChange={(e) => edit(setAnnualReturn)(e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Inflation (% a year, for today&apos;s-rupees figures)</label>
              <input type="number" min="0" step="0.1" value={inflation} onChange={(e) => edit(setInflation)(e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Return on an invested lump sum (% a year, UPS vs NPS)</label>
              <input type="number" min="0" step="0.1" value={investReturn} onChange={(e) => edit(setInvestReturn)(e.target.value)} className={inputClass} />
              <p className="text-xs text-ink/50 mt-1">Used only for the &ldquo;when does UPS overtake NPS&rdquo; comparison.</p>
            </div>
            <div>
              <label className={labelClass}>Annual increment (%, each 1 July)</label>
              <input type="number" min="0" step="0.1" value={increment} onChange={(e) => edit(setIncrement)(e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>DA rise each Jan &amp; Jul (% points)</label>
              <input type="number" min="0" step="0.1" value={daRise} onChange={(e) => edit(setDaRise)(e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Pay commission rise in Basic + DA (%)</label>
              <input type="number" min="0" step="0.1" value={uplift} onChange={(e) => edit(setUplift)(e.target.value)} className={inputClass} />
              <p className="text-xs text-ink/50 mt-1">
                Applied on 1 Jan 2026, 2036, 2046… DA resets to 0 at each commission.
              </p>
            </div>
            <div>
              <label className={labelClass}>Corpus used to buy an annuity (%)</label>
              <input type="number" min="0" max="100" step="1" value={annuityPercent} onChange={(e) => edit(setAnnuityPercent)(e.target.value)} className={inputClass} />
              <p className="text-xs text-ink/50 mt-1">Government NPS: at least 40%; the rest is the lump sum.</p>
            </div>
            <div>
              <label className={labelClass}>Annuity rate (% a year)</label>
              <input type="number" min="0" step="0.1" value={annuityRate} onChange={(e) => edit(setAnnuityRate)(e.target.value)} className={inputClass} />
            </div>
          </div>
        </details>

        <div className="sm:col-span-2 flex items-center gap-4">
          <button
            type="submit"
            className="bg-ink text-paper px-5 py-2.5 text-sm font-medium hover:bg-maroon transition-colors"
          >
            {tab === 'nps' ? 'Calculate NPS Corpus' : 'Calculate UPS Pension'}
          </button>
          {error && <span className="text-sm text-red-600">{error}</span>}
        </div>
      </form>

      {!computed && !error && (
        <p className="text-sm text-ink/50 mb-8 print:hidden">
          Fill in the details above and press &ldquo;{tab === 'nps' ? 'Calculate NPS Corpus' : 'Calculate UPS Pension'}&rdquo; to see the projection.
        </p>
      )}

      {r && computed && (
        <>
          <div className="flex justify-end mb-4 print:hidden">
            <button
              type="button"
              onClick={() => window.print()}
              className="inline-flex items-center gap-2 border border-ink text-ink px-4 py-2 text-sm font-medium hover:bg-ink hover:text-paper transition-colors"
            >
              <Printer size={16} aria-hidden="true" />
              Print / Save as PDF
            </button>
          </div>
        </>
      )}

      {r && computed && tab === 'nps' && (
        <>
          <div className="border border-rule p-5 mb-8">
            <h2 className="font-serif text-lg font-semibold text-ink mb-1">Projected NPS at Retirement</h2>
            <p className="text-xs text-ink/50 mb-4">
              Retirement on {formatDate(r.retirementDate)} (age 60), in about{' '}
              {(r.monthsToRetirement / 12).toFixed(1)} years · {r.serviceYearsAtRetirement.toFixed(1)} years of
              service
            </p>
            <dl className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm mb-4">
              <div>
                <dt className="text-ink/50 mb-1">Corpus at retirement</dt>
                <dd className="font-serif text-xl text-maroon">{formatRupees(r.corpus)}</dd>
                <dd className="text-xs text-ink/50">{formatShort(r.corpus)}</dd>
                <dd className="text-xs text-ink/70 mt-1">≈ {formatShort(today(r.corpus))} in today&apos;s rupees</dd>
              </div>
              <div>
                <dt className="text-ink/50 mb-1">Lump sum ({100 - computed.input.annuityPercent}%, tax-free)</dt>
                <dd className="font-serif text-xl text-ink">{formatRupees(r.lumpSum)}</dd>
                <dd className="text-xs text-ink/50">{formatShort(r.lumpSum)}</dd>
                <dd className="text-xs text-ink/70 mt-1">≈ {formatShort(today(r.lumpSum))} in today&apos;s rupees</dd>
              </div>
              <div>
                <dt className="text-ink/50 mb-1">Monthly pension (annuity)</dt>
                <dd className="font-serif text-xl text-ink">{formatRupees(r.monthlyPension)}</dd>
                <dd className="text-xs text-ink/50">
                  {formatShort(r.annuityCorpus)} annuity at {computed.input.annuityRatePercent}%
                </dd>
                <dd className="text-xs text-ink/70 mt-1">≈ {formatRupees(today(r.monthlyPension))} a month in today&apos;s rupees</dd>
              </div>
            </dl>
            <p className="text-xs text-ink/50">
              Estimated last Basic Pay {formatRupees(r.finalBasic)} + DA {r.finalDaPercent.toFixed(0)}% ={' '}
              {formatRupees(r.finalTotalPay)} a month; the annuity pension would be about{' '}
              {(r.replacementRatio * 100).toFixed(0)}% of that. Total put in by you and the government from
              now on: {formatShort(r.totalContributions)}; investment growth: {formatShort(r.growth)}. Pay
              commissions assumed in {r.commissions.join(', ')}.
              {r.upfrontCommission &&
                ` The 8th Pay Commission (w.e.f. 1 Jan 2026) is applied to your entered Basic: ${formatRupees(r.upfrontCommission.before)} → ${formatRupees(r.upfrontCommission.after)}, with DA reset to 0%.`}
            </p>
          </div>

          <div className="border border-rule bg-rule/10 p-5 mb-8 text-sm text-ink/80 leading-relaxed">
            <h2 className="font-serif text-lg font-semibold text-ink mb-2">What drives this number</h2>
            <ol className="list-decimal pl-5 flex flex-col gap-1.5">
              <li>
                <strong className="text-ink">Market return ({computed.input.annualReturnPercent}% a year).</strong>{' '}
                Not guaranteed — a 2-point lower return gives{' '}
                {formatShort(computed.scenarios[0].corpus)} instead (see the{' '}
                <a href="#scenarios" className="underline text-maroon">
                  scenario table
                </a>
                ).
              </li>
              <li>
                <strong className="text-ink">Pay growth.</strong> Increments, DA rises and the pay commissions
                push your pay from{' '}
                {formatRupees(computed.input.basicPay * (1 + computed.input.daPercent / 100))} to about{' '}
                {formatRupees(r.finalTotalPay)} a month. Without the {computed.input.commissionUpliftPercent}%
                pay commission rise the corpus would be {formatShort(computed.corpusWithoutUplift)}.
              </li>
              <li>
                <strong className="text-ink">Your present corpus.</strong> Today&apos;s{' '}
                {formatShort(computed.input.presentCorpus)} growing on its own is about{' '}
                {(computed.presentCorpusShare * 100).toFixed(0)}% of the result; the rest comes from future
                contributions and their growth.
              </li>
            </ol>
          </div>

          <div id="scenarios" className="mb-8 scroll-mt-6">
            <h2 className="font-serif text-lg font-semibold text-ink mb-3">If returns differ</h2>
            <table className="w-full text-sm border-t border-rule">
              <thead>
                <tr className="border-b border-rule text-left text-ink/50 font-mono text-xs uppercase">
                  <th className="py-2 font-medium">Scenario</th>
                  <th className="py-2 font-medium">Return</th>
                  <th className="py-2 font-medium">Corpus</th>
                  <th className="py-2 font-medium">Monthly pension</th>
                </tr>
              </thead>
              <tbody>
                {computed.scenarios.map((s) => (
                  <tr key={s.label} className="border-b border-rule/60">
                    <td className="py-2">{s.label}</td>
                    <td className="py-2 font-mono text-xs">{s.returnPercent}%</td>
                    <td className="py-2">{formatShort(s.corpus)}</td>
                    <td className="py-2">{formatRupees(s.pension)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <details className="mb-8">
            <summary className="cursor-pointer font-serif text-lg font-semibold text-ink mb-3">
              Year-by-year projection
            </summary>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-t border-rule">
                <thead>
                  <tr className="border-b border-rule text-left text-ink/50 font-mono text-xs uppercase">
                    <th className="py-2 pr-3 font-medium">Year</th>
                    <th className="py-2 pr-3 font-medium">Age</th>
                    <th className="py-2 pr-3 font-medium">Basic Pay</th>
                    <th className="py-2 pr-3 font-medium">DA</th>
                    <th className="py-2 font-medium">Corpus (year end)</th>
                  </tr>
                </thead>
                <tbody>
                  {r.rows.map((row) => (
                    <tr key={row.year} className="border-b border-rule/60">
                      <td className="py-2 pr-3">
                        {row.year}
                        {row.commissionApplied && (
                          <span className="ml-2 font-mono text-[10px] uppercase text-brass border border-brass px-1.5 py-0.5">
                            Pay Commission
                          </span>
                        )}
                      </td>
                      <td className="py-2 pr-3">{row.age}</td>
                      <td className="py-2 pr-3">{formatRupees(row.basicPay)}</td>
                      <td className="py-2 pr-3">{row.daPercent.toFixed(0)}%</td>
                      <td className="py-2">{formatShort(row.corpus)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </details>
        </>
      )}


      {r && computed && tab === 'ups' && (
        <>
          {!computed.ups.eligible ? (
            <div className="border border-rule px-5 py-4 mb-8 text-sm text-ink/80 leading-relaxed">
              UPS needs at least 10 years of qualifying service for the assured payout (
              {(computed.ups.roundedHalfYears / 2).toFixed(1)} years at retirement, rounded).
            </div>
          ) : (
            <UpsResultView computed={computed} r={r} today={today} />
          )}
        </>
      )}

      <p className="text-xs text-ink/40 mt-8 print:hidden">
        See also:{' '}
        <Link href="/calculators/gratuity" className="underline hover:text-maroon">
          Gratuity Calculator
        </Link>
        {' · '}
        <Link href="/da-cpc-tracker" className="underline hover:text-maroon">
          DA &amp; Pay Commission Tracker
        </Link>
      </p>

      {r && computed && (
        <div className="hidden print:block border-t border-ink/30 pt-3 mt-8 text-xs text-ink/70 leading-relaxed">
          <strong className="text-ink">Sarkari Karamchari Samachar</strong> · {host} — this is an estimate for
          planning only, not an official calculation. Verify with your department&apos;s accounts office / PFRDA
          before making decisions.
        </div>
      )}
    </div>
  );
}

function UpsResultView({
  computed,
  r,
  today,
}: {
  computed: Computed;
  r: Extract<NpsResult, { ok: true }>;
  today: (amount: number) => number;
}) {
  const ups = computed.ups;
  if (!ups.eligible) return null;
  const annuityRate = computed.input.annuityRatePercent;
  const matchCorpus = computed.matchCorpus;

  return (
    <>
      <div className="border border-rule p-5 mb-8">
        <h2 className="font-serif text-lg font-semibold text-ink mb-1">Projected UPS Benefits at Retirement</h2>
        <p className="text-xs text-ink/50 mb-4">
          Retirement on {formatDate(r.retirementDate)} (age 60), in about {(r.monthsToRetirement / 12).toFixed(1)}{' '}
          years · {(ups.roundedHalfYears / 2).toFixed(1)} years of qualifying service (rounded)
        </p>
        <dl className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm mb-4">
          <div>
            <dt className="text-ink/50 mb-1">Assured monthly payout</dt>
            <dd className="font-serif text-xl text-maroon">{formatRupees(ups.payoutWithDr)}</dd>
            <dd className="text-xs text-ink/50">
              {formatRupees(ups.assuredPayout)} + DR {formatRupees(ups.drAmount)}
            </dd>
            <dd className="text-xs text-ink/70 mt-1">≈ {formatRupees(today(ups.payoutWithDr))} in today&apos;s rupees</dd>
          </div>
          <div>
            <dt className="text-ink/50 mb-1">Assured family pension (60%)</dt>
            <dd className="font-serif text-xl text-ink">{formatRupees(ups.familyPension)}</dd>
            <dd className="text-xs text-ink/50">a month, to the spouse</dd>
          </div>
          <div>
            <dt className="text-ink/50 mb-1">Lump sum at retirement</dt>
            <dd className="font-serif text-xl text-ink">{formatRupees(ups.lumpSum)}</dd>
            <dd className="text-xs text-ink/50">{formatShort(ups.lumpSum)}, over and above gratuity</dd>
            <dd className="text-xs text-ink/70 mt-1">≈ {formatShort(today(ups.lumpSum))} in today&apos;s rupees</dd>
          </div>
        </dl>
        <p className="text-xs text-ink/50">
          Assured payout = 50% of the average Basic Pay of the last 12 months ({formatRupees(r.avgBasicLast12)})
          {ups.roundedHalfYears < 50 && ` × ${ups.roundedHalfYears}/50 (proportionate for under 25 years)`}
          {ups.minimumApplied && ' — the ₹10,000 minimum applied'}. Dearness Relief is shown at the DA rate
          assumed on retirement day ({r.finalDaPercent.toFixed(0)}%) and keeps rising after that. The lump
          sum is 1/10th of monthly emoluments ({formatRupees(r.finalTotalPay)}) × {ups.roundedHalfYears} six-monthly
          periods.
        </p>
      </div>

      <div className="mb-8">
        <h2 className="font-serif text-lg font-semibold text-ink mb-3">UPS vs NPS on your numbers</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-t border-rule">
            <thead>
              <tr className="border-b border-rule text-left text-ink/50 font-mono text-xs uppercase">
                <th className="py-2 pr-3 font-medium" />
                <th className="py-2 pr-3 font-medium">NPS ({computed.input.annualReturnPercent}% return)</th>
                <th className="py-2 font-medium">UPS</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-rule/60">
                <td className="py-2 pr-3 text-ink/60">Monthly pension</td>
                <td className="py-2 pr-3">{formatRupees(r.monthlyPension)}</td>
                <td className="py-2">{formatRupees(ups.payoutWithDr)}</td>
              </tr>
              <tr className="border-b border-rule/60">
                <td className="py-2 pr-3 text-ink/60">…in today&apos;s rupees</td>
                <td className="py-2 pr-3">{formatRupees(today(r.monthlyPension))}</td>
                <td className="py-2">{formatRupees(today(ups.payoutWithDr))}</td>
              </tr>
              <tr className="border-b border-rule/60">
                <td className="py-2 pr-3 text-ink/60">Lump sum</td>
                <td className="py-2 pr-3">{formatShort(r.lumpSum)}</td>
                <td className="py-2">{formatShort(ups.lumpSum)}</td>
              </tr>
              <tr className="border-b border-rule/60">
                <td className="py-2 pr-3 text-ink/60">Family pension</td>
                <td className="py-2 pr-3">Depends on the annuity option bought</td>
                <td className="py-2">{formatRupees(ups.familyPension)} (60%)</td>
              </tr>
              <tr className="border-b border-rule/60">
                <td className="py-2 pr-3 text-ink/60">Rises with inflation?</td>
                <td className="py-2 pr-3">No — fixed annuity, unless a rising plan is bought</td>
                <td className="py-2">Yes — Dearness Relief, revised twice a year</td>
              </tr>
              <tr className="border-b border-rule/60">
                <td className="py-2 pr-3 text-ink/60">Depends on markets?</td>
                <td className="py-2 pr-3">Yes</td>
                <td className="py-2">No — payout is assured by the government</td>
              </tr>
            </tbody>
          </table>
        </div>
        {matchCorpus > 0 && (
          <p className="text-xs text-ink/50 mt-3">
            To match the UPS monthly payout from an annuity at {annuityRate}%, you would need an annuity
            purchase of about {formatShort(matchCorpus)} — your projected NPS corpus is{' '}
            {formatShort(r.corpus)}, of which only {computed.input.annuityPercent}% goes into the annuity.{' '}
            {computed.matchReturn === 0
              ? 'Your corpus already reaches that even with no growth.'
              : computed.matchReturn === null
                ? 'No realistic market return would get the corpus there.'
                : `NPS would need about ${computed.matchReturn.toFixed(1)}% a year (you assumed ${computed.input.annualReturnPercent}%) for the whole corpus to buy an annuity that large.`}
          </p>
        )}
      </div>

      {computed.breakEven && <BreakEvenSection computed={computed} r={r} ups={ups} />}

      <div className="border border-rule bg-rule/10 p-5 mb-8 text-sm text-ink/80 leading-relaxed">
        <h2 className="font-serif text-lg font-semibold text-ink mb-2">Things to keep in mind</h2>
        <ul className="list-disc pl-5 flex flex-col gap-1.5">
          <li>
            Under UPS you and the government each put in 10% of Basic + DA into your individual corpus. At
            retirement that corpus is transferred to a pool that funds the assured payout — you don&apos;t
            receive an NPS-style corpus, only any amount by which it exceeds the notional benchmark corpus
            (not modelled here).
          </li>
          <li>
            UPS is only for employees who opted for it; an employee can make a one-time switch from UPS to
            NPS at least a year before retirement, and cannot switch back.
          </li>
          <li>
            Gratuity is payable separately under both schemes — see the{' '}
            <Link href="/calculators/gratuity" className="underline text-maroon">
              Gratuity Calculator
            </Link>
            .
          </li>
          <li>
            The payout depends on the pay assumptions above (increments, DA and pay commission rises). A
            lower pay path lowers the UPS payout; the NPS figure also depends on the return you assume.
          </li>
        </ul>
      </div>
    </>
  );
}

function durationText(months: number): string {
  const years = Math.floor(months / 12);
  const rest = months % 12;
  const parts = [];
  if (years > 0) parts.push(`${years} year${years === 1 ? '' : 's'}`);
  if (rest > 0) parts.push(`${rest} month${rest === 1 ? '' : 's'}`);
  return parts.join(' ') || 'day one';
}

function BreakEvenSection({
  computed,
  r,
  ups,
}: {
  computed: Computed;
  r: Extract<NpsResult, { ok: true }>;
  ups: Extract<UpsResult, { eligible: true }>;
}) {
  const be = computed.breakEven;
  if (!be) return null;
  const retirementYear = Number(r.retirementDate.slice(0, 4));

  const when = (months: number | null) => {
    if (months === null) return `Not before age ${BREAK_EVEN_HORIZON_AGE}`;
    if (months === 0) return 'From day one';
    return `${durationText(months)} after retiring`;
  };
  const whenSub = (months: number | null) =>
    months === null || months === 0
      ? ''
      : `Age ${(RETIREMENT_AGE + months / 12).toFixed(1)} · ${retirementYear + Math.floor(months / 12)}`;

  const ahead = be.lumpSumGap <= 0;

  return (
    <div className="mb-8">
      <h2 className="font-serif text-lg font-semibold text-ink mb-1">When does UPS overtake NPS?</h2>
      <p className="text-sm text-ink/70 mb-4 max-w-prose">
        {ahead
          ? `On your numbers the UPS lump sum is not smaller than the NPS lump sum, so UPS is ahead from the start.`
          : `NPS pays ${formatShort(be.lumpSumGap)} more as a lump sum on day one, but UPS pays ${formatRupees(be.startingMonthlyEdge)} more every month (and its Dearness Relief keeps rising, while an NPS annuity stays fixed). This is how long the extra monthly payout takes to make up the lump-sum difference.`}
      </p>

      <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm mb-5">
        <div className="border border-rule p-4">
          <dt className="text-ink/50 mb-1">Plain — no interest on the lump sum</dt>
          <dd className="font-serif text-xl text-maroon">{when(be.plainMonths)}</dd>
          <dd className="text-xs text-ink/50">{whenSub(be.plainMonths)}</dd>
        </div>
        <div className="border border-rule p-4">
          <dt className="text-ink/50 mb-1">If the NPS lump-sum gap is invested at {computed.investReturnPercent}%</dt>
          <dd className="font-serif text-xl text-maroon">{when(be.investedMonths)}</dd>
          <dd className="text-xs text-ink/50">{whenSub(be.investedMonths)}</dd>
        </div>
      </dl>

      {!ahead && (
        <BreakEvenChart
          points={be.points}
          retirementAge={RETIREMENT_AGE}
          retirementYear={retirementYear}
          investReturnPercent={computed.investReturnPercent}
          plainMonths={be.plainMonths}
          investedMonths={be.investedMonths}
        />
      )}

      {!ahead && (
        <details className="mt-3">
          <summary className="cursor-pointer text-sm font-medium text-ink">Show the same figures as a table</summary>
          <div className="overflow-x-auto mt-2">
            <table className="w-full text-sm border-t border-rule">
              <thead>
                <tr className="border-b border-rule text-left text-ink/50 font-mono text-xs uppercase">
                  <th className="py-2 pr-3 font-medium">Age</th>
                  <th className="py-2 pr-3 font-medium">Year</th>
                  <th className="py-2 pr-3 font-medium">UPS monthly payout</th>
                  <th className="py-2 pr-3 font-medium">UPS advantage (no interest)</th>
                  <th className="py-2 font-medium">UPS advantage (invested)</th>
                </tr>
              </thead>
              <tbody>
                {be.points
                  .filter((p) => p.monthsAfter % 60 === 0 || p.monthsAfter === be.horizonMonths)
                  .map((p) => (
                    <tr key={p.monthsAfter} className="border-b border-rule/60">
                      <td className="py-2 pr-3">{RETIREMENT_AGE + p.monthsAfter / 12}</td>
                      <td className="py-2 pr-3">{retirementYear + p.monthsAfter / 12}</td>
                      <td className="py-2 pr-3">{formatRupees(p.upsPayout)}</td>
                      <td className="py-2 pr-3">{p.plain < 0 ? '−' : ''}{formatShort(Math.abs(p.plain))}</td>
                      <td className="py-2">{p.invested < 0 ? '−' : ''}{formatShort(Math.abs(p.invested))}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </details>
      )}

      <p className="text-xs text-ink/50 mt-3">
        Assumes the UPS payout is revised at each pay commission (+{computed.input.commissionUpliftPercent}%, with DR
        reset) and Dearness Relief rises {computed.input.daRisePerHalfYear} points every Jan and Jul, through
        age {BREAK_EVEN_HORIZON_AGE}. The NPS annuity is fixed. The 60% family pension UPS pays a spouse is not
        counted, and neither is tax. The UPS lump sum here is {formatShort(ups.lumpSum)}.
      </p>
    </div>
  );
}

// Print-only masthead: site name, what this printout is, when it was made and
// the inputs it was made from. Hidden on screen.
function PrintHeader({
  title,
  host,
  printedOn,
  computed,
  commissionReflected,
  retirementDate,
}: {
  title: string;
  host: string;
  printedOn: string;
  computed: Computed;
  commissionReflected: boolean;
  retirementDate: string;
}) {
  const i = computed.input;
  const rows: [string, string][] = [
    ['Date of birth', formatDate(i.dob)],
    ['Date of joining', formatDate(i.doj)],
    ['Retirement date (age 60)', formatDate(retirementDate)],
    ['Present Basic Pay', formatRupees(i.basicPay)],
    ['Current DA rate', `${i.daPercent}%`],
    ['Present NPS corpus', formatRupees(i.presentCorpus)],
    [
      '8th Pay Commission',
      commissionReflected ? 'Already included in Basic Pay' : 'Applied to Basic Pay from 1 Jan 2026',
    ],
    [
      'Assumptions',
      `return ${i.annualReturnPercent}% · increment ${i.annualIncrementPercent}% · DA +${i.daRisePerHalfYear} pts each Jan & Jul · pay commission +${i.commissionUpliftPercent}% every 10 years · inflation ${computed.inflationPercent}% · annuity ${i.annuityPercent}% at ${i.annuityRatePercent}%`,
    ],
  ];

  return (
    <div className="hidden print:block mb-6">
      {/* Brand header: logo left, domain + tagline right, heavy rule below. */}
      <div className="flex items-center justify-between gap-6 border-b-4 border-ink pb-3 mb-5">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/brand/logo.webp" alt="SarkariKaramchari.com" className="h-24 w-auto" />
        <div className="text-right">
          <p className="font-sans text-4xl font-extrabold text-ink leading-none tracking-tight">
            sarkarikaramchari.com
          </p>
          <p className="mt-3 text-base text-ink/80">सरकारी कर्मचारी समाचार · DA, Circulars &amp; Pay Updates</p>
        </div>
      </div>
      <div className="flex items-baseline justify-between gap-6 mb-3">
        <h1 className="font-serif text-xl font-semibold text-ink">{title}</h1>
        {printedOn && <p className="text-xs text-ink/60 whitespace-nowrap">Prepared on {printedOn}</p>}
      </div>
      <table className="w-full text-xs border border-rule">
        <tbody>
          {rows.map(([label, value]) => (
            <tr key={label} className="border-b border-rule/60 align-top">
              <td className="py-1.5 px-2 w-[32%] text-ink/60 bg-rule/20">{label}</td>
              <td className="py-1.5 px-2 text-ink">{value}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
