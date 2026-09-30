'use client';

import { useState } from 'react';
import type { BreakEvenPoint } from '@/lib/breakeven';

// Two lines on one axis: the UPS pensioner's running advantage over NPS,
// without interest ("plain") and with the NPS lump-sum gap invested. Colours
// are the validated blue/orange pair; identity is never colour-alone — there
// is a legend, direct end labels and a table view below the chart.
const PLAIN = '#2a78d6';
const INVESTED = '#eb6834';

const W = 640;
const H = 300;
const M = { top: 14, right: 22, bottom: 34, left: 62 };

function crore(v: number): string {
  if (v === 0) return '₹0';
  const c = v / 1e7;
  const abs = Math.abs(c);
  const text = abs >= 10 ? abs.toFixed(0) : abs >= 1 ? abs.toFixed(1) : abs.toFixed(2);
  return `${c < 0 ? '−' : ''}₹${text} cr`;
}

function niceStep(range: number, targetTicks: number): number {
  const raw = range / targetTicks;
  const mag = Math.pow(10, Math.floor(Math.log10(raw)));
  const norm = raw / mag;
  return (norm <= 1 ? 1 : norm <= 2 ? 2 : norm <= 5 ? 5 : 10) * mag;
}

export default function BreakEvenChart({
  points,
  retirementAge,
  retirementYear,
  investReturnPercent,
  plainMonths,
  investedMonths,
}: {
  points: BreakEvenPoint[];
  retirementAge: number;
  retirementYear: number;
  investReturnPercent: number;
  plainMonths: number | null;
  investedMonths: number | null;
}) {
  const [hover, setHover] = useState<number | null>(null);

  const last = points[points.length - 1].monthsAfter;
  const values = points.flatMap((p) => [p.plain, p.invested]);
  const step = niceStep(Math.max(...values, 0) - Math.min(...values, 0), 5);
  const yMin = Math.floor(Math.min(...values, 0) / step) * step;
  const yMax = Math.ceil(Math.max(...values, 0) / step) * step;

  const x = (m: number) => M.left + (m / last) * (W - M.left - M.right);
  const y = (v: number) => M.top + (1 - (v - yMin) / (yMax - yMin)) * (H - M.top - M.bottom);

  const yTicks: number[] = [];
  for (let v = yMin; v <= yMax + step / 2; v += step) yTicks.push(v);
  const xTicks: number[] = [];
  for (let yrs = 0; yrs * 12 <= last; yrs += 5) xTicks.push(yrs);

  const path = (key: 'plain' | 'invested') =>
    points.map((p, i) => `${i === 0 ? 'M' : 'L'}${x(p.monthsAfter).toFixed(1)},${y(p[key]).toFixed(1)}`).join(' ');

  function onMove(e: React.PointerEvent<SVGSVGElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    const px = ((e.clientX - rect.left) / rect.width) * W;
    const m = Math.round(((px - M.left) / (W - M.left - M.right)) * last);
    setHover(Math.max(0, Math.min(last, m)));
  }

  const hp = hover !== null ? points[hover] : null;
  const ageAt = (m: number) => retirementAge + m / 12;

  const marker = (months: number | null, key: 'plain' | 'invested', color: string) =>
    months !== null && months > 0 ? (
      <circle
        cx={x(months)}
        cy={y(points[months][key])}
        r={5}
        fill={color}
        stroke="#F5F1E6"
        strokeWidth={2}
      />
    ) : null;

  return (
    <figure className="mb-2">
      <div className="flex flex-wrap gap-x-5 gap-y-1 text-xs text-ink/80 mb-2">
        <span className="flex items-center gap-2">
          <svg width="22" height="8" aria-hidden="true">
            <line x1="0" y1="4" x2="22" y2="4" stroke={PLAIN} strokeWidth="2" />
          </svg>
          No interest on the lump-sum gap
        </span>
        <span className="flex items-center gap-2">
          <svg width="22" height="8" aria-hidden="true">
            <line x1="0" y1="4" x2="22" y2="4" stroke={INVESTED} strokeWidth="2" />
          </svg>
          NPS lump-sum gap invested at {investReturnPercent}%
        </span>
      </div>

      <div className="relative">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="w-full h-auto"
          role="img"
          aria-label="Line chart of the UPS pensioner's cumulative advantage over an NPS pensioner, by age after retirement. A table of the same values follows."
          onPointerMove={onMove}
          onPointerLeave={() => setHover(null)}
        >
          {yTicks.map((v) => (
            <g key={v}>
              <line
                x1={M.left}
                x2={W - M.right}
                y1={y(v)}
                y2={y(v)}
                stroke={v === 0 ? '#1C2B45' : '#D8D0BC'}
                strokeWidth={v === 0 ? 1.25 : 1}
              />
              <text x={M.left - 8} y={y(v) + 4} textAnchor="end" fontSize="11" fill="#1C2B45" fillOpacity="0.6">
                {crore(v)}
              </text>
            </g>
          ))}
          {xTicks.map((yrs) => (
            <text key={yrs} x={x(yrs * 12)} y={H - 12} textAnchor={yrs * 12 >= last ? 'end' : 'middle'} fontSize="11" fill="#1C2B45" fillOpacity="0.6">
              age {retirementAge + yrs}
            </text>
          ))}

          <path d={path('plain')} fill="none" stroke={PLAIN} strokeWidth={2} strokeLinejoin="round" />
          <path d={path('invested')} fill="none" stroke={INVESTED} strokeWidth={2} strokeLinejoin="round" />
          {marker(plainMonths, 'plain', PLAIN)}
          {marker(investedMonths, 'invested', INVESTED)}

          {hp && hover !== null && (
            <g pointerEvents="none">
              <line x1={x(hover)} x2={x(hover)} y1={M.top} y2={H - M.bottom} stroke="#1C2B45" strokeOpacity="0.4" />
              <circle cx={x(hover)} cy={y(hp.plain)} r={4} fill={PLAIN} stroke="#F5F1E6" strokeWidth={2} />
              <circle cx={x(hover)} cy={y(hp.invested)} r={4} fill={INVESTED} stroke="#F5F1E6" strokeWidth={2} />
            </g>
          )}
        </svg>

        {hp && hover !== null && (
          <div
            className="absolute top-2 pointer-events-none bg-paper border border-rule px-3 py-2 text-xs shadow-sm"
            style={{
              left: `${(x(hover) / W) * 100}%`,
              transform: hover > last / 2 ? 'translateX(calc(-100% - 10px))' : 'translateX(10px)',
            }}
          >
            <div className="text-ink/60 mb-1">
              Age {ageAt(hover).toFixed(1)} · {retirementYear + Math.floor(hover / 12)}
            </div>
            <div className="flex items-center gap-2">
              <svg width="14" height="6" aria-hidden="true">
                <line x1="0" y1="3" x2="14" y2="3" stroke={PLAIN} strokeWidth="2" />
              </svg>
              <strong className="text-ink">{crore(hp.plain)}</strong>
              <span className="text-ink/60">no interest</span>
            </div>
            <div className="flex items-center gap-2">
              <svg width="14" height="6" aria-hidden="true">
                <line x1="0" y1="3" x2="14" y2="3" stroke={INVESTED} strokeWidth="2" />
              </svg>
              <strong className="text-ink">{crore(hp.invested)}</strong>
              <span className="text-ink/60">invested</span>
            </div>
          </div>
        )}
      </div>
      <figcaption className="text-xs text-ink/50 mt-1">
        Above the dark line UPS is ahead; below it NPS is ahead. Dots mark where each line crosses it. Once UPS is ahead, the invested line climbs faster because that surplus earns interest too.
      </figcaption>
    </figure>
  );
}
