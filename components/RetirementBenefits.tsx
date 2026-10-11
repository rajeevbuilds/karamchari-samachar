'use client';

import { useState } from 'react';
import { daOn, retirementDateFromDob, type DaStep } from '@/lib/retirementDates';
import Link from 'next/link';
import PpoChecker from '@/components/PpoChecker';
import RetirementSummaryCalculator from '@/components/RetirementSummaryCalculator';

type Tab = 'estimate' | 'check';

// Details both tabs ask for. They live here so that filling one tab fills the other.
export type SharedFields = {
  dob: string;
  retirementDate: string;
  lastDrawnPay: string;
  avg10: string;
  years: string;
  months: string;
  da: string;
};
export type SharedProps = {
  shared: SharedFields;
  onShared: (patch: Partial<SharedFields>) => void;
};

// One page for employees and pensioners under the Old Pension Scheme: an
// estimate of the benefits before retirement, and a check of the PPO after it.
export default function RetirementBenefits({
  initialTab,
  daHistory,
  defaultDaPercent,
  ceiling,
  minFloor,
}: {
  initialTab: Tab;
  daHistory: DaStep[];
  defaultDaPercent: number;
  ceiling: number;
  minFloor: number;
}) {
  const [tab, setTab] = useState<Tab>(initialTab);
  const [shared, setShared] = useState<SharedFields>({
    dob: '',
    retirementDate: '',
    lastDrawnPay: '',
    avg10: '',
    years: '',
    months: '',
    da: String(defaultDaPercent),
  });
  // Once the person types a DA rate themselves, stop replacing it.
  const [daTyped, setDaTyped] = useState(false);

  function onShared(patch: Partial<SharedFields>) {
    const next = { ...patch };
    if (patch.dob !== undefined) {
      const r = retirementDateFromDob(patch.dob);
      if (r) next.retirementDate = r;
    }
    if (patch.da !== undefined) setDaTyped(true);
    else if (next.retirementDate !== undefined && !daTyped) {
      const rate = daOn(daHistory, next.retirementDate);
      if (rate !== null) next.da = String(rate);
    }
    setShared((prev) => ({ ...prev, ...next }));
  }
  const tabClass = (active: boolean) =>
    `px-4 py-2 text-sm border ${active ? 'bg-ink text-paper border-ink' : 'border-rule text-ink/70 hover:text-maroon'}`;

  return (
    <div>
      <div className="border border-rule bg-white/40 px-5 py-4 mb-6 text-sm text-ink/80 leading-relaxed print:hidden">
        <strong className="text-ink">Who is this for?</strong> Employees and pensioners covered by the{' '}
        <strong>Old Pension Scheme</strong>, generally those appointed before 1 January 2004. If you are under NPS or
        UPS, use the{' '}
        <Link href="/calculators/nps" className="underline hover:text-maroon">
          NPS &amp; UPS Calculator
        </Link>{' '}
        instead.
      </div>

      <div className="flex flex-wrap gap-2 mb-6 print:hidden" role="tablist" aria-label="Retirement benefits">
        <button type="button" role="tab" aria-selected={tab === 'estimate'} className={tabClass(tab === 'estimate')} onClick={() => setTab('estimate')}>
          Estimate my retirement benefits
        </button>
        <button type="button" role="tab" aria-selected={tab === 'check'} className={tabClass(tab === 'check')} onClick={() => setTab('check')}>
          Check my PPO
        </button>
      </div>

      {tab === 'estimate' ? (
        <RetirementSummaryCalculator shared={shared} onShared={onShared} ceiling={ceiling} minFloor={minFloor} />
      ) : (
        <PpoChecker shared={shared} onShared={onShared} ceiling={ceiling} minFloor={minFloor} />
      )}
    </div>
  );
}
