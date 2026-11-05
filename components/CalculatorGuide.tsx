import type { CalculatorGuide as Guide } from '@/lib/calculatorGuides';

// The "how this calculator works" text under a calculator: the steps it
// follows, a worked example and what it leaves out. Plain text in the page
// (not hidden behind a click), so readers and search engines can both read it.
export default function CalculatorGuide({ guide }: { guide: Guide }) {
  return (
    <section className="mt-12 print:hidden" aria-labelledby="calc-guide-heading">
      <h2 id="calc-guide-heading" className="font-serif text-xl font-semibold text-ink mb-3">
        {guide.heading}
      </h2>
      <p className="text-sm text-ink/80 leading-relaxed max-w-prose mb-6">{guide.intro}</p>

      {guide.sections.map((section) => (
        <div key={section.heading} className="mb-7">
          <h3 className="font-serif text-lg font-semibold text-ink mb-2">{section.heading}</h3>
          {section.paragraphs?.map((p) => (
            <p key={p} className="text-sm text-ink/80 leading-relaxed max-w-prose mb-3">
              {p}
            </p>
          ))}
          {section.bullets && (
            <ul className="list-disc pl-5 text-sm text-ink/80 leading-relaxed max-w-prose mb-3 space-y-1.5">
              {section.bullets.map((b) => (
                <li key={b}>{b}</li>
              ))}
            </ul>
          )}
          {section.table && (
            <div className="border border-rule overflow-x-auto mb-3">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-rule text-left text-ink/50 font-mono text-xs uppercase">
                    {section.table.head.map((h) => (
                      <th key={h} className="px-3 py-2 font-medium align-bottom">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {section.table.rows.map((row) => (
                    <tr key={row.join('|')} className="border-b border-rule/60 last:border-b-0 align-top">
                      {row.map((cell, i) => (
                        <td key={i} className={`px-3 py-2 ${i === 0 ? 'font-medium text-ink' : 'text-ink/80'}`}>
                          {cell}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {section.after?.map((p) => (
            <p key={p} className="text-sm text-ink/80 leading-relaxed max-w-prose mb-3">
              {p}
            </p>
          ))}
        </div>
      ))}

      {guide.sources && guide.sources.length > 0 && (
        <div className="text-xs text-ink/60 leading-relaxed max-w-prose">
          <p className="font-medium text-ink/70 mb-1">Rules and orders this calculator follows</p>
          <ul className="list-disc pl-5 space-y-0.5">
            {guide.sources.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
