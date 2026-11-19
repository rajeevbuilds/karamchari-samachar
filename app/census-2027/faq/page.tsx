import Link from 'next/link';
import CensusSubNav from '@/components/CensusSubNav';
import FaqSection from '@/components/FaqSection';
import { incrementPageView } from '@/lib/data';
import { CENSUS_FAQS } from '@/lib/faqs';
import { SITE_NAME } from '@/lib/site';

// Renders on every request so incrementPageView below runs per visit, not once at build time.
export const dynamic = 'force-dynamic';

const PATH = '/census-2027/faq';
const TITLE = 'Enumerator FAQ – Census 2027 (आसान हिंदी)';
const DESCRIPTION = 'जनगणना 2027 Enumerators के अक्सर पूछे जाने वाले सवालों के जवाब, आसान हिंदी में।';

export const metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: PATH },
  openGraph: { type: 'article', siteName: SITE_NAME, locale: 'hi_IN', url: PATH, title: TITLE, description: DESCRIPTION },
  twitter: { card: 'summary', title: TITLE, description: DESCRIPTION },
};

export default function CensusFaqPage() {
  void incrementPageView(PATH);
  return (
    <div className="mx-auto max-w-[820px] px-4">
      <article className="py-10">
        <CensusSubNav active="/census-2027/faq" />
        <h1 className="font-serif text-3xl font-semibold text-ink mb-1">Enumerator FAQ – Census 2027</h1>
        <p className="text-ink/80 leading-relaxed max-w-prose mt-3">
          जनगणना 2027 के Enumerators के अक्सर पूछे जाने वाले सवालों के जवाब, आसान हिंदी में।
        </p>
        <div className="bg-[#fff7e0] border border-[#e5c76b] rounded-lg px-4 py-3 my-4 text-sm text-ink/80">
          यह guide Enumerator Instruction Manual के हमारे summary पर आधारित है। अंतिम नियम के लिए अपने trainer या Charge Officer से
          पूछें।
        </div>

        <FaqSection faqs={CENSUS_FAQS} heading="अक्सर पूछे जाने वाले सवाल" />

        <div className="flex justify-between gap-3 flex-wrap mt-6 print:hidden">
          <Link href="/census-2027/app-guide" className="text-maroon hover:underline">← App Guide</Link>
          <Link href="/census-2027" className="text-maroon hover:underline">मुख्य पेज →</Link>
        </div>

        <p className="text-xs text-ink/50 mt-8 max-w-prose border-t border-rule pt-4">
          यह पेज सरकारी नहीं है। यह Enumerator Instruction Manual के हमारे अपने summary पर आधारित है। अंतिम नियम और तारीखें अपने
          trainer या Charge Officer से पक्की करें।
        </p>
      </article>
    </div>
  );
}
