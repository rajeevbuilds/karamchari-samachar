import Image from 'next/image';
import Link from 'next/link';

export default function HomeCensusCard() {
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
      <Link href="/census-2027" className="group flex items-start gap-4 border border-rule rounded-lg p-4 hover:border-maroon transition-colors">
        <div className="relative w-40 sm:w-56 aspect-[1200/630] shrink-0 overflow-hidden rounded bg-rule/20">
          <Image src="/share/census-2027.jpg" alt="" fill className="object-cover" sizes="(max-width: 640px) 160px, 224px" />
        </div>
        <div className="min-w-0">
          <h3 className="font-serif text-lg font-semibold text-ink leading-snug group-hover:text-maroon transition-colors">
            Census 2027: Enumerator Guide (आसान हिंदी)
          </h3>
          <p className="text-sm text-ink/70 mt-1 max-w-prose line-clamp-2">
            जनगणना 2027 में Enumerator की ड्यूटी करने वाले सरकारी कर्मचारियों के लिए checklist, PE app registration guide और FAQ।
          </p>
          <span className="inline-block mt-2 text-sm font-semibold text-maroon">गाइड देखें →</span>
        </div>
      </Link>
    </section>
  );
}
