'use client';

import { useState } from 'react';

const formatRupees = (n: number) => `₹${Math.round(n).toLocaleString('en-IN')}`;
const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const MAX_MONTHS = 24;

// "YYYY-MM" -> a running month number, or null if it is not a month.
function monthIndex(value: string): number | null {
  const x = /^(\d{4})-(\d{2})$/.exec(value);
  if (!x) return null;
  const m = Number(x[2]);
  return m >= 1 && m <= 12 ? Number(x[1]) * 12 + (m - 1) : null;
}

// DA arrears when a rise is announced after its effective date: the extra DA for
// every month from the effective month up to the month before the new rate is
// paid in the salary. Worked out in the browser; nothing is sent anywhere.
export default function DaArrearsCalc({
  newRate,
  oldRate,
  from,
  to,
}: {
  newRate: number;
  oldRate: number | null;
  from: string; // YYYY-MM
  to: string; // YYYY-MM
}) {
  const [basic, setBasic] = useState('');
  const [oldPct, setOldPct] = useState(oldRate === null ? '' : String(oldRate));
  const [newPct, setNewPct] = useState(newRate ? String(newRate) : '');
  const [fromMonth, setFromMonth] = useState(from);
  const [toMonth, setToMonth] = useState(to);

  const b = Number(basic);
  const o = Number(oldPct);
  const n = Number(newPct);
  const f = monthIndex(fromMonth);
  const t = monthIndex(toMonth);
  const inputsOk = basic !== '' && oldPct !== '' && newPct !== '' && [b, o, n].every(Number.isFinite) && b > 0 && o >= 0 && n >= o;
  const rangeOk = f !== null && t !== null && t >= f && t - f + 1 <= MAX_MONTHS;
  const ready = inputsOk && rangeOk;

  const monthly = ready ? Math.round((b * n) / 100) - Math.round((b * o) / 100) : 0;
  const rows =
    ready && f !== null && t !== null
      ? Array.from({ length: t - f + 1 }, (_, i) => {
          const idx = f + i;
          return `${MONTH_NAMES[idx % 12]} ${Math.floor(idx / 12)}`;
        })
      : [];

  const inputClass = 'w-full border border-rule px-3 py-2 text-sm bg-white focus:outline-none focus:border-maroon';
  const labelClass = 'block text-xs font-mono uppercase text-ink/50 mb-1';

  return (
    <div className="border border-rule p-5 mb-8 print:hidden">
      <h2 className="font-serif text-lg font-semibold text-ink mb-1">DA arrears calculator</h2>
      <p className="text-sm text-ink/60 mb-4">
        When a DA rise is announced late, the extra DA for the earlier months comes as arrears with a later salary.
        Enter your Basic Pay (or Basic Pension) to see yours.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-md">
        <div className="sm:col-span-2">
          <label className={labelClass} htmlFor="arr-basic">
            Basic Pay / Basic Pension (₹)
          </label>
          <input
            id="arr-basic"
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
          <label className={labelClass} htmlFor="arr-old">
            Old DA rate (%)
          </label>
          <input
            id="arr-old"
            type="number"
            min="0"
            step="0.1"
            inputMode="decimal"
            value={oldPct}
            onChange={(e) => setOldPct(e.target.value)}
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass} htmlFor="arr-new">
            New DA rate (%)
          </label>
          <input
            id="arr-new"
            type="number"
            min="0"
            step="0.1"
            inputMode="decimal"
            value={newPct}
            onChange={(e) => setNewPct(e.target.value)}
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass} htmlFor="arr-from">
            Arrears from (month)
          </label>
          <input id="arr-from" type="month" value={fromMonth} onChange={(e) => setFromMonth(e.target.value)} className={inputClass} />
        </div>
        <div>
          <label className={labelClass} htmlFor="arr-to">
            Arrears up to (month)
          </label>
          <input id="arr-to" type="month" value={toMonth} onChange={(e) => setToMonth(e.target.value)} className={inputClass} />
        </div>
      </div>

      {basic !== '' && !rangeOk && (
        <p className="text-sm text-maroon mt-4">
          Choose a start month that is not after the end month, within {MAX_MONTHS} months.
        </p>
      )}
      {basic !== '' && rangeOk && !inputsOk && (
        <p className="text-sm text-maroon mt-4">The new DA rate must not be lower than the old rate.</p>
      )}

      {ready && (
        <>
          <dl className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-5 max-w-lg text-sm">
            <div>
              <dt className="text-ink/50 mb-1">Extra DA a month</dt>
              <dd className="font-serif text-xl text-ink">{formatRupees(monthly)}</dd>
            </div>
            <div>
              <dt className="text-ink/50 mb-1">Months</dt>
              <dd className="font-serif text-xl text-ink">{rows.length}</dd>
            </div>
            <div>
              <dt className="text-ink/50 mb-1">Total arrears</dt>
              <dd className="font-serif text-xl text-maroon">{formatRupees(monthly * rows.length)}</dd>
            </div>
          </dl>
          <p className="text-sm text-ink/70 mt-3">
            {rows.length === 1 ? rows[0] : `${rows[0]} to ${rows[rows.length - 1]}`}: {formatRupees(monthly)} × {rows.length}{' '}
            {rows.length === 1 ? 'month' : 'months'}.
          </p>
        </>
      )}

      <p className="text-xs text-ink/50 mt-4 max-w-prose">
        An estimate on Basic Pay (or Basic Pension) alone. If your Basic Pay changed in these months, for example with the
        1 July increment, work out each stretch separately. DA on Transport Allowance, tax and any recovery are not
        included. Your pay slip and the official order decide the final amount.
      </p>
    </div>
  );
}
