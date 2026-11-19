import Link from 'next/link';

// TEMPORARY preview-only component — not wired into HomeGrid yet, just used
// to screenshot what a homepage card could look like before deciding on
// placement.
export default function HomeCensusCardPreview() {
  return (
    <section className="pb-10">
      <div className="flex items-center gap-3 mb-5">
        <span className="block w-1.5 h-7 bg-maroon" aria-hidden="true" />
        <h2 className="font-serif text-2xl font-semibold text-ink">Census 2027</h2>
        <span className="flex-1 border-t border-maroon/50" aria-hidden="true" />
        <Link href="/census-2027" className="text-sm font-medium text-maroon hover:underline whitespace-nowrap">
          More ›
        </Link>
      </div>
      <Link href="/census-2027" className="group block border border-rule rounded-lg p-5 hover:border-maroon transition-colors">
        <h3 className="font-serif text-lg font-semibold text-ink leading-snug group-hover:text-maroon transition-colors">
          Census 2027: Enumerator Guide (आसान हिंदी)
        </h3>
        <p className="text-sm text-ink/70 mt-1 max-w-prose">
          जनगणना 2027 में Enumerator की ड्यूटी करने वाले सरकारी कर्मचारियों के लिए checklist, PE app registration guide और FAQ।
        </p>
        <span className="inline-block mt-2 text-sm font-semibold text-maroon">गाइड देखें →</span>
      </Link>
    </section>
  );
}
