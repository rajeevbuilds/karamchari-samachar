'use client';

import { useState, type FormEvent } from 'react';
import Link from 'next/link';
import { projectNps, toTodaysRupees, type NpsInput, type NpsResult } from '@/lib/nps';

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
};

export default function NpsCalculator({ defaultDaPercent }: { defaultDaPercent: number }) {
  const [dob, setDob] = useState('');
  const [doj, setDoj] = useState('');
  const [basicPay, setBasicPay] = useState('');
  const [daPercent, setDaPercent] = useState(String(defaultDaPercent));
  const [presentCorpus, setPresentCorpus] = useState('');
  const [commissionReflected, setCommissionReflected] = useState(false);

  // Assumptions: sensible defaults, editable.
  const [annualReturn, setAnnualReturn] = useState('8');
  const [inflation, setInflation] = useState('5');
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
    });
  }

  function fail(message: string) {
    setComputed(null);
    setError(message);
  }

  const r = computed?.base;
  const today = (amount: number) =>
    computed && r ? toTodaysRupees(amount, r.monthsToRetirement, computed.inflationPercent) : amount;

  return (
    <div>
      <div className="border border-rule bg-rule/10 px-5 py-4 mb-8 text-sm text-ink/80 leading-relaxed">
        <strong className="text-ink">Disclaimer:</strong> NPS returns are market-linked and not guaranteed.
        This is a projection built from the assumptions below (returns, DA, pay commission outcomes and
        annuity rates are all estimates) and is for planning only. Your actual corpus and pension will
        differ. The main figures are in future (nominal) rupees; a line below each shows roughly what it is worth in today&apos;s purchasing power.
      </div>

      <form onSubmit={calculate} className="grid grid-cols-1 sm:grid-cols-2 gap-4 border border-rule p-5 mb-8">
        <div>
          <label className={labelClass}>Date of birth</label>
          <input type="date" value={dob} onChange={(e) => edit(setDob)(e.target.value)} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Date of joining</label>
          <input type="date" value={doj} onChange={(e) => edit(setDoj)(e.target.value)} className={inputClass} />
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
          <label className={labelClass}>Present NPS corpus (₹) — from your PRAN statement</label>
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
            Calculate NPS Corpus
          </button>
          {error && <span className="text-sm text-red-600">{error}</span>}
        </div>
      </form>

      {!computed && !error && (
        <p className="text-sm text-ink/50 mb-8">
          Fill in the details above and press &ldquo;Calculate NPS Corpus&rdquo; to see the projection.
        </p>
      )}

      {r && computed && (
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

      <p className="text-xs text-ink/40 mt-8">
        See also:{' '}
        <Link href="/calculators/gratuity" className="underline hover:text-maroon">
          Gratuity Calculator
        </Link>
        {' · '}
        <Link href="/da-cpc-tracker" className="underline hover:text-maroon">
          DA &amp; Pay Commission Tracker
        </Link>
      </p>
    </div>
  );
}
