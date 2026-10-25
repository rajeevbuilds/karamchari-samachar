'use client';

import { useState } from 'react';

const formatRupees = (n: number) => `₹${Math.round(n).toLocaleString('en-IN')}`;

// Tiny "how much DA do I get?" tool for the Dearness Allowance page. Everything is
// worked out in the browser; nothing is sent anywhere.
export default function DaQuickCalc({ defaultRate }: { defaultRate: number }) {
  const [basic, setBasic] = useState('');
  const [rate, setRate] = useState(String(defaultRate || ''));
  const b = Number(basic);
  const r = Number(rate);
  const ready = basic !== '' && Number.isFinite(b) && b > 0 && Number.isFinite(r) && r >= 0;
  const inputClass = 'w-full border border-rule px-3 py-2 text-sm bg-white focus:outline-none focus:border-maroon';
  const labelClass = 'block text-xs font-mono uppercase text-ink/50 mb-1';

  return (
    <div className="border border-rule p-5 mb-8 print:hidden">
      <h2 className="font-serif text-lg font-semibold text-ink mb-1">Quick DA check</h2>
      <p className="text-sm text-ink/60 mb-4">See how much DA you get each month on your Basic Pay.</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-md">
        <div>
          <label className={labelClass} htmlFor="da-basic">
            Basic Pay (₹)
          </label>
          <input
            id="da-basic"
            type="number"
            min="0"
            inputMode="numeric"
            value={basic}
            onChange={(e) => setBasic(e.target.value)}
            placeholder="e.g. 56100"
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass} htmlFor="da-rate">
            DA rate (%)
          </label>
          <input
            id="da-rate"
            type="number"
            min="0"
            step="0.1"
            inputMode="decimal"
            value={rate}
            onChange={(e) => setRate(e.target.value)}
            className={inputClass}
          />
        </div>
      </div>
      {ready && (
        <dl className="grid grid-cols-2 gap-4 mt-5 max-w-md text-sm">
          <div>
            <dt className="text-ink/50 mb-1">DA a month</dt>
            <dd className="font-serif text-xl text-maroon">{formatRupees((b * r) / 100)}</dd>
          </div>
          <div>
            <dt className="text-ink/50 mb-1">Basic Pay + DA</dt>
            <dd className="font-serif text-xl text-ink">{formatRupees(b + (b * r) / 100)}</dd>
          </div>
        </dl>
      )}
    </div>
  );
}
