import JsonLd from './JsonLd';
import type { Faq } from '@/lib/faqs';

// A short list of questions and answers that readers can open one by one. The
// same questions are sent to Google as FAQ structured data.
export default function FaqSection({ faqs, heading = 'Frequently asked questions' }: { faqs: Faq[]; heading?: string }) {
  if (faqs.length === 0) return null;
  return (
    <section className="mt-12 print:hidden" aria-labelledby="faq-heading">
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: faqs.map((f) => ({
            '@type': 'Question',
            name: f.q,
            acceptedAnswer: { '@type': 'Answer', text: f.a },
          })),
        }}
      />
      <h2 id="faq-heading" className="font-serif text-xl font-semibold text-ink mb-3">
        {heading}
      </h2>
      <div className="border-t border-rule">
        {faqs.map((f) => (
          <details key={f.q} className="border-b border-rule py-3 group">
            <summary className="cursor-pointer font-medium text-ink list-none flex items-start justify-between gap-4">
              <span>{f.q}</span>
              <span className="text-maroon shrink-0 group-open:rotate-45 transition-transform" aria-hidden="true">
                +
              </span>
            </summary>
            <p className="mt-2 text-sm text-ink/75 leading-relaxed max-w-prose">{f.a}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
