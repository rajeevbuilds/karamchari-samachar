'use client';

import { useMemo, useState, type FormEvent } from 'react';
import Link from 'next/link';
import { DownloadPdfButton, PrintBrandFooter, PrintMasthead, usePrintSupport } from '@/components/PrintTools';
import {
  calculateDeathGratuity,
  calculateRetirementGratuity,
  type GratuityInput,
} from '@/lib/gratuity';

function formatRupees(amount: number): string {
  return `₹${Math.round(amount).toLocaleString('en-IN')}`;
}

type Mode = 'retirement' | 'death';

export default function GratuityCalculator({
  defaultDaPercent,
  ceiling,
}: {
  defaultDaPercent: number;
  ceiling: number;
}) {
  const printedOn = usePrintSupport();
  const [mode, setMode] = useState<Mode>('retirement');
  const [basicPay, setBasicPay] = useState('');
  const [daPercent, setDaPercent] = useState(String(defaultDaPercent));
  const [years, setYears] = useState('');
  const [months, setMonths] = useState('');

  // The inputs as they were when "Calculate Gratuity" was pressed. Results
  // only appear (and update) on that click, and are cleared as soon as any
  // input changes so a stale figure never sits next to edited values.
  const [submitted, setSubmitted] = useState<{ mode: Mode; input: GratuityInput } | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  function edit<T>(setter: (v: T) => void) {
    return (v: T) => {
      setter(v);
      setSubmitted(null);
      setFormError(null);
    };
  }

  function calculate(e: FormEvent) {
    e.preventDefault();
    const basic = Number(basicPay);
    if (!basicPay || !Number.isFinite(basic) || basic <= 0) {
      setSubmitted(null);
      setFormError('Enter a valid Basic Pay to calculate.');
      return;
    }
    setFormError(null);
    setSubmitted({
      mode,
      input: {
        basicPay: basic,
        daPercent: Number(daPercent) || 0,
        qualifyingYears: Number(years) || 0,
        qualifyingMonths: Number(months) || 0,
        ceiling,
      },
    });
  }

  const retirement = useMemo(
    () => (submitted?.mode === 'retirement' ? calculateRetirementGratuity(submitted.input) : null),
    [submitted]
  );
  const death = useMemo(
    () => (submitted?.mode === 'death' ? calculateDeathGratuity(submitted.input) : null),
    [submitted]
  );

  const tabClass = (active: boolean) =>
    `px-4 py-2 text-sm border ${
      active ? 'bg-ink text-paper border-ink' : 'border-rule text-ink/70 hover:text-maroon'
    }`;

  return (
    <div>
      <div className="border border-rule bg-rule/10 px-5 py-4 mb-8 text-sm text-ink/80 leading-relaxed print:hidden">
        <strong className="text-ink">Disclaimer:</strong> This calculator provides an indicative estimate
        based on Rules 50 and 51 of the CCS (Pension) Rules, 2021 (the same formula applies to NPS/UPS
        employees under the CCS (Payment of Gratuity under NPS) Rules, 2021). It does not account for every
        individual circumstance (breaks in service, pending disciplinary cases, etc.). Always verify your
        actual gratuity with your department&apos;s pay and accounts office before making financial decisions.
      </div>

      <div className="flex gap-2 mb-4 print:hidden" role="tablist" aria-label="Gratuity type">
        <button
          type="button"
          role="tab"
          aria-selected={mode === 'retirement'}
          className={tabClass(mode === 'retirement')}
          onClick={() => edit(setMode)('retirement')}
        >
          Retirement Gratuity
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={mode === 'death'}
          className={tabClass(mode === 'death')}
          onClick={() => edit(setMode)('death')}
        >
          Death Gratuity
        </button>
      </div>

      <form onSubmit={calculate} className="grid grid-cols-1 sm:grid-cols-2 gap-4 border border-rule p-5 mb-8 print:hidden">
        <div>
          <label className="block text-xs font-mono uppercase text-ink/50 mb-1">
            {mode === 'retirement' ? 'Last drawn Basic Pay (₹)' : 'Basic Pay at death (₹)'}
          </label>
          <input
            type="number"
            min="0"
            value={basicPay}
            onChange={(e) => edit(setBasicPay)(e.target.value)}
            placeholder="e.g. 80000"
            className="w-full border border-rule px-3 py-2 text-sm focus:outline-none focus:border-maroon"
          />
        </div>
        <div>
          <label className="block text-xs font-mono uppercase text-ink/50 mb-1">
            Dearness Allowance rate (%)
          </label>
          <input
            type="number"
            min="0"
            step="0.1"
            value={daPercent}
            onChange={(e) => edit(setDaPercent)(e.target.value)}
            className="w-full border border-rule px-3 py-2 text-sm focus:outline-none focus:border-maroon"
          />
        </div>
        <div>
          <label className="block text-xs font-mono uppercase text-ink/50 mb-1">
            Qualifying service — years
          </label>
          <input
            type="number"
            min="0"
            value={years}
            onChange={(e) => edit(setYears)(e.target.value)}
            className="w-full border border-rule px-3 py-2 text-sm focus:outline-none focus:border-maroon"
          />
        </div>
        <div>
          <label className="block text-xs font-mono uppercase text-ink/50 mb-1">
            Qualifying service — months
          </label>
          <input
            type="number"
            min="0"
            max="11"
            value={months}
            onChange={(e) => edit(setMonths)(e.target.value)}
            className="w-full border border-rule px-3 py-2 text-sm focus:outline-none focus:border-maroon"
          />
        </div>

        <div className="sm:col-span-2 flex items-center gap-4">
          <button
            type="submit"
            className="bg-ink text-paper px-5 py-2.5 text-sm font-medium hover:bg-maroon transition-colors"
          >
            Calculate Gratuity
          </button>
          {formError && <span className="text-sm text-red-600">{formError}</span>}
        </div>
      </form>

      {submitted === null && !formError && (
        <p className="text-sm text-ink/50 mb-8 print:hidden">
          Fill in the details above and press &ldquo;Calculate Gratuity&rdquo; to see the result.
        </p>
      )}

      {submitted && ((retirement && retirement.eligible) || death) && (
        <>
          <DownloadPdfButton
            fileName={submitted.mode === 'retirement' ? 'Retirement-Gratuity-Estimate' : 'Death-Gratuity-Estimate'}
          />
          <PrintMasthead
            title={submitted.mode === 'retirement' ? 'Retirement Gratuity Estimate' : 'Death Gratuity Estimate'}
            printedOn={printedOn}
            rows={[
              ['Type', submitted.mode === 'retirement' ? 'Retirement gratuity' : 'Death gratuity'],
              [submitted.mode === 'retirement' ? 'Last drawn Basic Pay' : 'Basic Pay at death', formatRupees(submitted.input.basicPay)],
              ['Dearness Allowance rate', `${submitted.input.daPercent}%`],
              [
                'Qualifying service',
                `${submitted.input.qualifyingYears} years ${submitted.input.qualifyingMonths} months`,
              ],
            ]}
          />
        </>
      )}

      {retirement && !retirement.eligible && (
        <div className="border border-rule px-5 py-4 mb-8 text-sm text-ink/80 leading-relaxed">
          Retirement gratuity needs at least 5 years of qualifying service (
          {(retirement.roundedHalfYears / 2).toFixed(1)} years after rounding). If the employee has less,
          service gratuity or death gratuity rules may apply instead.
        </div>
      )}

      {retirement && retirement.eligible && (
        <div className="border border-rule p-5 mb-8">
          <h2 className="font-serif text-lg font-semibold text-ink mb-4">Estimated Retirement Gratuity</h2>
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm mb-4">
            <div>
              <dt className="text-ink/50 mb-1">Emoluments (Basic Pay + DA)</dt>
              <dd className="font-serif text-xl text-ink">{formatRupees(retirement.emoluments)}</dd>
            </div>
            <div>
              <dt className="text-ink/50 mb-1">Retirement gratuity</dt>
              <dd className="font-serif text-xl text-maroon">{formatRupees(retirement.gratuity)}</dd>
            </div>
          </dl>
          <p className="text-xs text-ink/50">
            ¼ × {formatRupees(retirement.emoluments)} × {retirement.countedHalfYears} six-monthly periods (
            {(retirement.roundedHalfYears / 2).toFixed(1)} years of service, rounded)
            {retirement.capApplied === 'multiplier' &&
              ' — service beyond 33 years is not counted (maximum 16.5 × emoluments)'}
            {retirement.capApplied === 'ceiling' &&
              ` — limited to the maximum of ${formatRupees(ceiling)} (uncapped amount ${formatRupees(retirement.uncapped)})`}
            .
          </p>
        </div>
      )}

      {death && (
        <div className="border border-rule p-5 mb-8">
          <h2 className="font-serif text-lg font-semibold text-ink mb-4">Estimated Death Gratuity</h2>
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm mb-4">
            <div>
              <dt className="text-ink/50 mb-1">Emoluments (Basic Pay + DA)</dt>
              <dd className="font-serif text-xl text-ink">{formatRupees(death.emoluments)}</dd>
            </div>
            <div>
              <dt className="text-ink/50 mb-1">Death gratuity</dt>
              <dd className="font-serif text-xl text-maroon">{formatRupees(death.gratuity)}</dd>
            </div>
          </dl>
          <p className="text-xs text-ink/50">
            {death.basis}.
            {death.ceilingApplied &&
              ` Limited to the maximum of ${formatRupees(ceiling)} (uncapped amount ${formatRupees(death.uncapped)}).`}{' '}
            No minimum service is required for death gratuity.
          </p>
        </div>
      )}

      {submitted && ((retirement && retirement.eligible) || death) && (
        <PrintBrandFooter
          qrSrc="/qr/gratuity.svg"
          disclaimer="This is an estimate for planning only, not an official calculation. Verify it with your department's pay and accounts office."
        />
      )}

      <p className="text-xs text-ink/40 mt-8 print:hidden">
        See also:{' '}
        <Link href="/calculators/pension-ops" className="underline hover:text-maroon">
          OPS Pension Calculator
        </Link>
        {' · '}
        <Link href="/da-cpc-tracker" className="underline hover:text-maroon">
          DA &amp; Pay Commission Tracker
        </Link>
      </p>
    </div>
  );
}
