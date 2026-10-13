'use client';

import { useMemo, useState, type FormEvent } from 'react';
import Link from 'next/link';
import { DownloadPdfButton, PrintBrandFooter, PrintMasthead, usePrintSupport } from '@/components/PrintTools';
import { CITY_NAMES, findCity, type HraClass } from '@/lib/hracities';
import { PAY_LEVELS, type PayLevelId } from '@/lib/paymatrix';
import {
  calculateEighthCpc,
  FITMENT_MAX,
  FITMENT_MIN,
  HRA_RATES,
  type EighthCpcInput,
  type EighthCpcResult,
  type HraStage,
} from '@/lib/eighthcpc';

const rupees = (n: number) => `₹${Math.round(n).toLocaleString('en-IN')}`;
const signed = (n: number) => `${n >= 0 ? '+' : '−'}${rupees(Math.abs(n))}`;

const FIELD = 'w-full border border-rule px-3 py-2 text-sm bg-white focus:outline-none focus:border-maroon';
const LABEL = 'block text-xs font-mono uppercase text-ink/50 mb-1';

const STAGE_LABEL: Record<HraStage, string> = {
  start: 'Starts again at 24% / 16% / 8% (as at the 7th CPC)',
  mid: '27% / 18% / 9%',
  full: '30% / 20% / 10% (as today)',
};

type Submitted = { input: EighthCpcInput; result: Extract<EighthCpcResult, { ok: true }>; cityLabel: string };

export default function EighthCpcCalculator({
  defaultDaPercent,
  daOnFile,
}: {
  defaultDaPercent: number;
  daOnFile: boolean;
}) {
  const printedOn = usePrintSupport();
  const [basic, setBasic] = useState('');
  const [level, setLevel] = useState<PayLevelId | ''>('');
  const [city, setCity] = useState('');
  const [da, setDa] = useState(daOnFile ? String(defaultDaPercent) : '');
  const [fitment, setFitment] = useState('2.00');
  const [hraStage, setHraStage] = useState<HraStage>('start');
  const [includeTa, setIncludeTa] = useState(true);
  const [taRise, setTaRise] = useState(''); // blank: same as the fitment factor
  const [submitted, setSubmitted] = useState<Submitted | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  function edit<T>(setter: (v: T) => void) {
    return (v: T) => {
      setter(v);
      setSubmitted(null);
      setFormError(null);
    };
  }

  const found = useMemo(() => findCity(city), [city]);
  const hraClass: HraClass = found ? found.hra : 'Z';
  const fitmentNumber = Number(fitment);

  function calculate(e: FormEvent) {
    e.preventDefault();
    if (!basic || !(Number(basic) > 0)) return setFormError('Enter your present Basic Pay.');
    if (!level) return setFormError('Choose your Pay Level. It is shown on your pay slip.');
    if (!(fitmentNumber >= FITMENT_MIN && fitmentNumber <= FITMENT_MAX))
      return setFormError(`The fitment factor must be between ${FITMENT_MIN.toFixed(2)} and ${FITMENT_MAX.toFixed(2)}.`);
    if (da === '' || !(Number(da) >= 0)) return setFormError('Enter the present DA rate (%).');
    const rise = taRise === '' ? fitmentNumber : Number(taRise);
    const input: EighthCpcInput = {
      basic: Number(basic),
      level,
      hraClass,
      tpta: found?.tpta ?? false,
      presentDaPercent: Number(da),
      fitment: fitmentNumber,
      hraStage,
      includeTa,
      taRise: rise,
    };
    const result = calculateEighthCpc(input);
    if (!result.ok) return setFormError(result.error);
    setFormError(null);
    setSubmitted({
      input,
      result,
      cityLabel: found ? `${found.name} (class ${found.hra})` : city.trim() ? `${city.trim()} (not in the X or Y list, so class Z)` : 'Other city or town (class Z)',
    });
  }

  const r = submitted?.result;
  const i = submitted?.input;

  const rows: { label: string; note: string; present: number; eighth: number }[] = r && i
    ? [
        { label: 'Basic Pay', note: '', present: r.present.basic, eighth: r.eighth.basic },
        { label: 'Dearness Allowance', note: `${r.present.daPercent}% now; starts again at 0%`, present: r.present.da, eighth: 0 },
        { label: 'House Rent Allowance', note: `${r.present.hraPercent}% now; ${r.eighth.hraPercent}% assumed`, present: r.present.hra, eighth: r.eighth.hra },
        ...(i.includeTa
          ? [
              { label: 'Transport Allowance', note: 'before DA', present: r.present.ta, eighth: r.eighth.ta },
              { label: 'DA on Transport Allowance', note: '', present: r.present.daOnTa, eighth: 0 },
            ]
          : []),
      ]
    : [];

  return (
    <div>
      <div className="border border-rule bg-rule/10 px-5 py-4 mb-8 text-sm text-ink/80 leading-relaxed print:hidden">
        <strong className="text-ink">Estimate only:</strong> The 8th Pay Commission has not yet submitted its report.
        The fitment factor, the DA restart, the House Rent Allowance rates and the Transport Allowance below are
        assumptions you can change, not decisions of the Government. Present HRA and Transport Allowance follow the
        7th CPC orders of the Department of Expenditure dated 7 July 2017. Railway and Defence employees receive the
        same rates under their own orders. Your actual pay will be fixed only by the notified rules.
      </div>

      <form onSubmit={calculate} className="grid grid-cols-1 sm:grid-cols-2 gap-4 border border-rule p-5 mb-8 print:hidden">
        <div>
          <label className={LABEL} htmlFor="e8-basic">Present Basic Pay (₹)</label>
          <input id="e8-basic" type="number" min="0" value={basic} onChange={(e) => edit(setBasic)(e.target.value)} placeholder="e.g. 56900" className={FIELD} />
        </div>
        <div>
          <label className={LABEL} htmlFor="e8-level">Pay Level (7th CPC)</label>
          <select id="e8-level" value={level} onChange={(e) => edit(setLevel)(e.target.value as PayLevelId | '')} className={FIELD}>
            <option value="">Select your Level</option>
            {PAY_LEVELS.map((l) => (
              <option key={l} value={l}>Level {l}</option>
            ))}
          </select>
        </div>

        <div className="sm:col-span-2">
          <label className={LABEL} htmlFor="e8-city">City or town of posting</label>
          <input
            id="e8-city"
            list="e8-cities"
            value={city}
            onChange={(e) => edit(setCity)(e.target.value)}
            placeholder="Start typing, e.g. Lucknow"
            autoComplete="off"
            className={FIELD}
          />
          <datalist id="e8-cities">
            {CITY_NAMES.map((n) => (
              <option key={n} value={n} />
            ))}
          </datalist>
          <p className="text-xs text-ink/60 mt-1" aria-live="polite">
            {found ? (
              <>
                <strong className="text-ink">{found.name}</strong>: HRA class {found.hra}
                {found.tpta ? ', higher Transport Allowance city' : ', ordinary Transport Allowance rate'}.
                {found.note ? ` ${found.note}` : ''}
              </>
            ) : city.trim() ? (
              'Not in the X or Y list of the Finance Ministry, so it is treated as class Z (all other cities and towns).'
            ) : (
              'Leave blank, or type a city not in the X or Y list, for class Z.'
            )}
          </p>
        </div>

        <div>
          <label className={LABEL} htmlFor="e8-da">Present DA rate (%)</label>
          <input id="e8-da" type="number" min="0" step="0.1" value={da} onChange={(e) => edit(setDa)(e.target.value)} className={FIELD} />
          <p className="text-xs text-ink/50 mt-1">
            {daOnFile
              ? 'Latest DA rate on this site. Change it if yours differs.'
              : 'No DA rate has been added on this site yet. Type the present rate.'}
          </p>
        </div>

        <div>
          <label className={LABEL} htmlFor="e8-fitment">Fitment factor: {Number.isFinite(fitmentNumber) ? fitmentNumber.toFixed(2) : '—'}</label>
          <div className="flex items-center gap-3">
            <input
              id="e8-fitment"
              type="range"
              min={FITMENT_MIN}
              max={FITMENT_MAX}
              step="0.01"
              value={Number.isFinite(fitmentNumber) ? fitmentNumber : 2}
              onChange={(e) => edit(setFitment)(Number(e.target.value).toFixed(2))}
              className="flex-1 accent-maroon"
              aria-label="Fitment factor"
            />
            <input
              type="number"
              min={FITMENT_MIN}
              max={FITMENT_MAX}
              step="0.01"
              value={fitment}
              onChange={(e) => edit(setFitment)(e.target.value)}
              className="w-24 border border-rule px-2 py-2 text-sm bg-white focus:outline-none focus:border-maroon"
              aria-label="Fitment factor value"
            />
          </div>
          <p className="text-xs text-ink/50 mt-1">From {FITMENT_MIN.toFixed(2)} to {FITMENT_MAX.toFixed(2)}. The 7th CPC used 2.57.</p>
        </div>

        <div className="sm:col-span-2">
          <label className={LABEL} htmlFor="e8-hra">House Rent Allowance rates assumed for the 8th CPC</label>
          <select id="e8-hra" value={hraStage} onChange={(e) => edit(setHraStage)(e.target.value as HraStage)} className={FIELD}>
            {(Object.keys(HRA_RATES) as HraStage[]).map((s) => (
              <option key={s} value={s}>{STAGE_LABEL[s]}</option>
            ))}
          </select>
          <p className="text-xs text-ink/50 mt-1">
            When the 7th CPC began, HRA restarted at 24%, 16% and 8% of Basic Pay (X, Y, Z). It rose to 27/18/9% when DA crossed 25% and to
            30/20/10% when DA crossed 50%. The same pattern is assumed here.
          </p>
        </div>

        <div className="sm:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4 items-start">
          <label className="flex items-start gap-2 text-sm">
            <input type="checkbox" checked={includeTa} onChange={(e) => edit(setIncludeTa)(e.target.checked)} className="mt-1 accent-maroon" />
            <span>
              Include Transport Allowance
              <span className="block text-xs text-ink/50">Leave unticked if you get a free official vehicle.</span>
            </span>
          </label>
          {includeTa && (
            <div>
              <label className={LABEL} htmlFor="e8-ta">Transport Allowance rise (times)</label>
              <input
                id="e8-ta"
                type="number"
                min="0.5"
                max="4"
                step="0.01"
                value={taRise}
                onChange={(e) => edit(setTaRise)(e.target.value)}
                placeholder={`Same as fitment factor (${Number.isFinite(fitmentNumber) ? fitmentNumber.toFixed(2) : '—'})`}
                className={FIELD}
              />
              <p className="text-xs text-ink/50 mt-1">Today&apos;s Transport Allowance is multiplied by this. Leave blank to use the fitment factor.</p>
            </div>
          )}
        </div>

        <div className="sm:col-span-2 flex items-center gap-4">
          <button type="submit" className="bg-ink text-paper px-5 py-2.5 text-sm font-medium hover:bg-maroon transition-colors">
            Calculate 8th CPC Salary
          </button>
          {formError && <span className="text-sm text-red-600" role="alert">{formError}</span>}
        </div>
      </form>

      {submitted === null && !formError && (
        <p className="text-sm text-ink/50 mb-8 print:hidden">Fill in the details above and press &ldquo;Calculate 8th CPC Salary&rdquo;.</p>
      )}

      {r && i && submitted && (
        <>
          <DownloadPdfButton fileName="8th-CPC-Salary-Estimate" />
          <PrintMasthead
            title="8th Pay Commission Salary Estimate (illustration, not official)"
            printedOn={printedOn}
            rows={[
              ['Present Basic Pay / Level', `${rupees(i.basic)} · Level ${i.level}`],
              ['City of posting', submitted.cityLabel],
              ['Present DA rate', `${i.presentDaPercent}%`],
              ['Fitment factor assumed', i.fitment.toFixed(2)],
              ['HRA rates assumed (8th CPC)', STAGE_LABEL[i.hraStage]],
              ['Transport Allowance', i.includeTa ? `Today's amount × ${i.taRise.toFixed(2)}` : 'Not included'],
            ]}
          />

          {r.levelNote && (
            <p className="border border-brass/60 bg-brass/10 px-4 py-3 mb-4 print:hidden text-sm text-ink/80">{r.levelNote}</p>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4 print:mb-2 print:gap-2 print:grid-cols-3">
            <div className="border border-rule p-4 print:p-2">
              <p className="text-xs font-mono uppercase text-ink/50 mb-1">Present gross pay</p>
              <p className="font-serif text-2xl print:text-lg text-ink">{rupees(r.present.gross)}</p>
              <p className="text-xs text-ink/50">a month</p>
            </div>
            <div className="border border-rule p-4 print:p-2">
              <p className="text-xs font-mono uppercase text-ink/50 mb-1">8th CPC gross pay</p>
              <p className="font-serif text-2xl print:text-lg text-maroon">{rupees(r.eighth.gross)}</p>
              <p className="text-xs text-ink/50">a month, at the start</p>
            </div>
            <div className="border border-rule p-4 print:p-2">
              <p className="text-xs font-mono uppercase text-ink/50 mb-1">Difference</p>
              <p className={`font-serif text-2xl print:text-lg ${r.monthlyRise >= 0 ? 'text-leaf' : 'text-maroon'}`}>{signed(r.monthlyRise)}</p>
              <p className="text-xs text-ink/50">
                {r.percentRise >= 0 ? '+' : '−'}
                {Math.abs(r.percentRise).toFixed(1)}% · {signed(r.yearlyRise)} a year
              </p>
            </div>
          </div>

          <div className="border border-rule p-5 mb-4 print:p-3 print:mb-2 print:break-inside-avoid">
            <h2 className="font-serif text-lg font-semibold text-ink mb-3 print:mb-1">Present salary and 8th CPC salary, a month</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm print:text-xs">
                <thead>
                  <tr className="text-left text-xs font-mono uppercase text-ink/50 border-b border-rule">
                    <th className="py-2 print:py-1 pr-3 font-medium">Item</th>
                    <th className="py-2 print:py-1 px-2 font-medium text-right">Present</th>
                    <th className="py-2 print:py-1 px-2 font-medium text-right">8th CPC</th>
                    <th className="py-2 print:py-1 pl-2 font-medium text-right">Change</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row) => (
                    <tr key={row.label} className="border-b border-rule/60 align-top">
                      <td className="py-2 print:py-0.5 pr-3 text-ink">
                        {row.label}
                        {row.note && <span className="block text-xs print:text-[10px] text-ink/50">{row.note}</span>}
                      </td>
                      <td className="py-2 print:py-0.5 px-2 text-right whitespace-nowrap">{rupees(row.present)}</td>
                      <td className="py-2 print:py-0.5 px-2 text-right whitespace-nowrap">{rupees(row.eighth)}</td>
                      <td className="py-2 print:py-0.5 pl-2 text-right whitespace-nowrap text-ink/70">{signed(row.eighth - row.present)}</td>
                    </tr>
                  ))}
                  <tr className="font-medium">
                    <td className="py-2 print:py-1 pr-3 text-ink">Gross pay</td>
                    <td className="py-2 print:py-1 px-2 text-right whitespace-nowrap">{rupees(r.present.gross)}</td>
                    <td className="py-2 print:py-1 px-2 text-right whitespace-nowrap text-maroon">{rupees(r.eighth.gross)}</td>
                    <td className="py-2 print:py-1 pl-2 text-right whitespace-nowrap">{signed(r.monthlyRise)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <ul className="list-disc pl-5 space-y-1 print:space-y-0 text-xs print:text-[9px] text-ink/60 leading-relaxed mb-8 print:mb-1">
            <li>
              New Basic Pay = {rupees(r.present.basic)} × {i.fitment.toFixed(2)}, taken up to the next ₹100. The notified 8th CPC Pay Matrix will
              fix the real figure.
            </li>
            <li>
              Basic Pay rises by {((r.eighth.basic / r.present.basic - 1) * 100).toFixed(0)}%, but today&apos;s DA of {r.present.daPercent}% is not carried
              over. DA restarts from 0% with a new Commission and then rises twice a year, so gross pay rises by less than Basic Pay does.
            </li>
            <li>
              Not included: arrears, increments, NPA or other special pay, CGHS/CGEGIS and other deductions, and NPS or pension contributions.
            </li>
          </ul>

          <PrintBrandFooter
            qrSrc="/qr/8th-pay-commission.svg"
            disclaimer="This is an illustration based on assumptions, not an official calculation. The 8th Pay Commission has not reported. Pay will be fixed only by the notified rules."
          />
        </>
      )}

      <p className="text-xs text-ink/40 mt-8 print:hidden">
        See also:{' '}
        <Link href="/calculators/pay-fixation" className="underline hover:text-maroon">
          Pay Fixation Calculator
        </Link>
        {' · '}
        <Link href="/calculators/nps" className="underline hover:text-maroon">
          NPS &amp; UPS Calculator
        </Link>
        {' · '}
        <Link href="/da-cpc-tracker" className="underline hover:text-maroon">
          DA &amp; Pay Commission Tracker
        </Link>
      </p>
    </div>
  );
}
