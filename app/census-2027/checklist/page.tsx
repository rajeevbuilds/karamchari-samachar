import Link from 'next/link';
import CensusChecklist from '@/components/CensusChecklist';
import CensusSubNav from '@/components/CensusSubNav';
import { SITE_NAME } from '@/lib/site';

const PATH = '/census-2027/checklist';
const TITLE = 'Enumerator Checklist – Census 2027 (आसान हिंदी)';
const DESCRIPTION = 'जनगणना 2027 Enumerator के लिए चेकलिस्ट: शुरू करने से पहले, हर घर पर, काम पूरा होने पर और Supervisor के लिए।';

export const metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: PATH },
  openGraph: { type: 'article', siteName: SITE_NAME, locale: 'hi_IN', url: PATH, title: TITLE, description: DESCRIPTION },
  twitter: { card: 'summary', title: TITLE, description: DESCRIPTION },
};

export default function CensusChecklistPage() {
  return (
    <div className="mx-auto max-w-[820px] px-4">
      <article className="py-10">
        <CensusSubNav active="/census-2027/checklist" />
        <h1 className="font-serif text-3xl font-semibold text-ink mb-1">Enumerator Checklist – Census 2027</h1>
        <p className="text-ink/80 leading-relaxed max-w-prose mt-3">
          इसे print करके या फोन में खोलकर tick करते जाएँ। आपके tick सिर्फ इसी ब्राउज़र में सेव रहते हैं (किसी सर्वर पर नहीं जाते)।
        </p>

        <CensusChecklist />

        <div className="bg-[#fff7e0] border border-[#e5c76b] rounded-lg px-4 py-3 my-4 text-sm text-ink/80">
          अंतिम नियम के लिए trainer या Charge Officer से पूछें।
        </div>
        <div className="flex justify-between gap-3 flex-wrap mt-6 print:hidden">
          <Link href="/census-2027" className="text-maroon hover:underline">← मुख्य पेज</Link>
          <Link href="/census-2027/app-guide" className="text-maroon hover:underline">App Guide →</Link>
        </div>

        <p className="text-xs text-ink/50 mt-8 max-w-prose border-t border-rule pt-4 print:hidden">
          यह पेज सरकारी नहीं है। यह Enumerator Instruction Manual के हमारे अपने summary पर आधारित है। अंतिम नियम और तारीखें अपने
          trainer या Charge Officer से पक्की करें।
        </p>
      </article>
    </div>
  );
}
