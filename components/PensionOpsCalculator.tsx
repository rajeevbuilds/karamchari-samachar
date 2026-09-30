'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { calculatePensionOps } from '@/lib/pension';

function formatRupees(amount: number): string {
  return `₹${Math.round(amount).toLocaleString('en-IN')}`;
}

export default function PensionOpsCalculator({
  defaultDrPercent,
  minFloor,
}: {
  defaultDrPercent: number;
  minFloor: number;
}) {
  const [lastDrawnPay, setLastDrawnPay] = useState('');
  const [avgLast10Months, setAvgLast10Months] = useState('');
  const [years, setYears] = useState('');
  const [months, setMonths] = useState('');
  const [drPercent, setDrPercent] = useState(String(defaultDrPercent));

  const result = useMemo(() => {
    const lastDrawnPayNum = Number(lastDrawnPay);
    if (!lastDrawnPay || !Number.isFinite(lastDrawnPayNum) || lastDrawnPayNum <= 0) return null;

    const yearsNum = Number(years) || 0;
    const monthsNum = Number(months) || 0;
    const drPercentNum = Number(drPercent) || 0;
    const avgNum = avgLast10Months ? Number(avgLast10Months) : null;

    return calculatePensionOps({
      lastDrawnPay: lastDrawnPayNum,
      avgLast10MonthsPay: avgNum && avgNum > 0 ? avgNum : null,
      qualifyingYears: yearsNum,
      qualifyingMonths: monthsNum,
      drPercent: drPercentNum,
      minFloor,
    });
  }, [lastDrawnPay, avgLast10Months, years, months, drPercent, minFloor]);

  return (
    <div>
      <div className="border border-rule bg-rule/10 px-5 py-4 mb-8 text-sm text-ink/80 leading-relaxed">
        <strong className="text-ink">Disclaimer:</strong> This calculator provides an indicative estimate
        based on the CCS (Pension) Rules, 1972. It does not account for every individual circumstance
        (breaks in service, VRS weightage, pension ceiling caps, etc.). Always verify your actual pension
        with your department&apos;s pension sanctioning authority (PAO/CPAO) before making financial decisions.
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border border-rule p-5 mb-8">
        <div className="sm:col-span-2">
          <label className="block text-xs font-mono uppercase text-ink/50 mb-1">
            Last drawn Basic Pay (₹)
          </label>
          <input
            type="number"
            min="0"
            value={lastDrawnPay}
            onChange={(e) => setLastDrawnPay(e.target.value)}
            placeholder="e.g. 56900"
            className="w-full border border-rule px-3 py-2 text-sm focus:outline-none focus:border-maroon"
          />
        </div>

        <div className="sm:col-span-2">
          <label className="block text-xs font-mono uppercase text-ink/50 mb-1">
            Average Basic Pay — last 10 months (₹, optional)
          </label>
          <input
            type="number"
            min="0"
            value={avgLast10Months}
            onChange={(e) => setAvgLast10Months(e.target.value)}
            placeholder="Leave blank to use last drawn pay only"
            className="w-full border border-rule px-3 py-2 text-sm focus:outline-none focus:border-maroon"
          />
          <p className="text-xs text-ink/50 mt-1">
            If provided, whichever of the two gives a higher pension is used.
          </p>
        </div>

        <div>
          <label className="block text-xs font-mono uppercase text-ink/50 mb-1">
            Qualifying service — years
          </label>
          <input
            type="number"
            min="0"
            value={years}
            onChange={(e) => setYears(e.target.value)}
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
            onChange={(e) => setMonths(e.target.value)}
            className="w-full border border-rule px-3 py-2 text-sm focus:outline-none focus:border-maroon"
          />
        </div>

        <div className="sm:col-span-2">
          <label className="block text-xs font-mono uppercase text-ink/50 mb-1">
            Current DR rate (%)
          </label>
          <input
            type="number"
            min="0"
            step="0.1"
            value={drPercent}
            onChange={(e) => setDrPercent(e.target.value)}
            className="w-full border border-rule px-3 py-2 text-sm focus:outline-none focus:border-maroon"
          />
        </div>
      </div>

      {result === null && (
        <p className="text-sm text-ink/50 mb-8">Enter last drawn Basic Pay to see a result.</p>
      )}

      {result !== null && !result.eligible && (
        <div className="border border-rule px-5 py-4 mb-8 text-sm text-ink/80 leading-relaxed">
          No pension applies under OPS at this qualifying service length ({(result.roundedHalfYears / 2).toFixed(1)}{' '}
          years, rounded) — a minimum of 10 years is required. Only gratuity would be payable; see the{' '}
          <Link href="/calculators/gratuity" className="underline hover:text-maroon">
            gratuity calculator
          </Link>{' '}
          for that estimate.
        </div>
      )}

      {result !== null && result.eligible && (
        <div className="border border-rule p-5 mb-8">
          <h2 className="font-serif text-lg font-semibold text-ink mb-4">Estimated Monthly Pension</h2>
          <dl className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm mb-4">
            <div>
              <dt className="text-ink/50 mb-1">Basic pension</dt>
              <dd className="font-serif text-xl text-ink">{formatRupees(result.basicPension)}</dd>
            </div>
            <div>
              <dt className="text-ink/50 mb-1">DR amount</dt>
              <dd className="font-serif text-xl text-ink">{formatRupees(result.drAmount)}</dd>
            </div>
            <div>
              <dt className="text-ink/50 mb-1">Total monthly pension</dt>
              <dd className="font-serif text-xl text-maroon">{formatRupees(result.totalMonthlyPension)}</dd>
            </div>
          </dl>
          <p className="text-xs text-ink/50">
            Rounded qualifying service: {(result.roundedHalfYears / 2).toFixed(1)} years.{' '}
            {result.roundedHalfYears >= 40
              ? 'Full basic pension applies (20+ years).'
              : `Proportionate pension: ${formatRupees(result.fullBasicPension)} full basic pension × ${result.roundedHalfYears}/40.`}
            {result.floorApplied && ` Minimum pension floor of ${formatRupees(minFloor)} applied.`}
          </p>
        </div>
      )}

      {result !== null && (
        <div className="border-t border-rule pt-6">
          <h2 className="font-serif text-lg font-semibold text-ink mb-1">
            Family Pension (if applicable)
          </h2>
          <p className="text-xs text-ink/50 mb-4">
            Informational only — not part of the pensioner&apos;s own monthly pension above.
          </p>
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div>
              <dt className="text-ink/50 mb-1">Normal Family Pension (30% of last pay)</dt>
              <dd className="font-serif text-lg text-ink">{formatRupees(result.normalFamilyPension)}</dd>
            </div>
            <div>
              <dt className="text-ink/50 mb-1">
                Enhanced Family Pension (50% of last pay, first 7 years or until age 67)
              </dt>
              <dd className="font-serif text-lg text-ink">{formatRupees(result.enhancedFamilyPension)}</dd>
            </div>
          </dl>
        </div>
      )}

      <p className="text-xs text-ink/40 mt-8">
        See also:{' '}
        <Link href="/da-cpc-tracker" className="underline hover:text-maroon">
          DA &amp; Pay Commission Tracker
        </Link>
      </p>
    </div>
  );
}
