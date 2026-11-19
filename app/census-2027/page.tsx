import Image from 'next/image';
import Link from 'next/link';
import CensusSubNav from '@/components/CensusSubNav';
import JsonLd from '@/components/JsonLd';
import { incrementPageView } from '@/lib/data';
import { SITE_NAME, SITE_URL } from '@/lib/site';

// Renders on every request so incrementPageView below runs per visit, not once at build time.
export const dynamic = 'force-dynamic';

const PATH = '/census-2027';
const TITLE = 'Census 2027: Enumerator Guide (आसान हिंदी)';
const DESCRIPTION =
  'जनगणना 2027 में Enumerator की ड्यूटी करने वाले सरकारी कर्मचारियों के लिए आसान हिंदी guide: तारीखें, checklist, PE app registration और FAQ।';
// Update this date whenever the page text is changed or re-checked.
const UPDATED = '2026-11-19';
const UPDATED_LABEL = '19 नवंबर 2026';
const IMAGE = '/share/census-2027.jpg';

export const metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: PATH },
  openGraph: {
    type: 'article',
    siteName: SITE_NAME,
    locale: 'hi_IN',
    url: PATH,
    title: TITLE,
    description: DESCRIPTION,
    images: [{ url: IMAGE, width: 1200, height: 630, alt: 'Census 2027: Enumerator Guide' }],
  },
  twitter: { card: 'summary_large_image', title: TITLE, description: DESCRIPTION, images: [IMAGE] },
};

const h2 = 'font-serif text-xl font-semibold text-ink mt-8 mb-3';

export default function CensusHomePage() {
  void incrementPageView(PATH);
  return (
    <div className="mx-auto max-w-[820px] px-4">
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'Article',
          headline: TITLE,
          description: DESCRIPTION,
          inLanguage: 'hi-IN',
          dateModified: UPDATED,
          mainEntityOfPage: `${SITE_URL}${PATH}`,
          image: `${SITE_URL}${IMAGE}`,
          author: { '@type': 'Organization', name: SITE_NAME, url: SITE_URL },
          publisher: { '@type': 'Organization', name: SITE_NAME, url: SITE_URL },
        }}
      />
      <article className="py-10">
        <CensusSubNav active="/census-2027" />
        <Image
          src={IMAGE}
          alt="Census 2027: Enumerator Guide"
          width={1200}
          height={630}
          priority
          fetchPriority="high"
          sizes="(max-width: 1024px) 100vw, 820px"
          className="w-full h-auto mb-6 border border-rule rounded-lg"
        />
        <h1 className="font-serif text-3xl font-semibold text-ink mb-1">Census 2027: Enumerator Guide</h1>
        <p className="font-mono text-xs text-ink/50 mb-6">अंतिम अपडेट: {UPDATED_LABEL}</p>

        <p className="text-ink/80 leading-relaxed max-w-prose">
          जनगणना 2027 के Population Enumeration में ड्यूटी कर रहे सरकारी कर्मचारियों (Enumerators) के लिए आसान हिंदी में गाइड। यह
          Enumerator Instruction Manual के हमारे summary पर आधारित है।
        </p>
        <div className="bg-[#fff7e0] border border-[#e5c76b] rounded-lg px-4 py-3 my-4 text-sm text-ink/80">
          यह पेज सरकारी नहीं है। अंतिम नियम और अपने district की पक्की तारीखें trainer या Charge Officer से confirm करें।
        </div>

        <h2 className={h2}>जरूरी तारीखें और helpline</h2>
        <div className="border border-rule overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-rule text-left text-ink/50 font-mono text-xs uppercase">
                <th className="px-4 py-2 font-medium">काम</th>
                <th className="px-4 py-2 font-medium">तारीख</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-rule/60 align-top">
                <td className="px-4 py-2 text-ink/80">Self-Enumeration (SE), परिवार खुद online भरता है</td>
                <td className="px-4 py-2 font-medium text-ink">16–30 नवंबर 2026</td>
              </tr>
              <tr className="border-b border-rule/60 align-top">
                <td className="px-4 py-2 text-ink/80">घर-घर Enumeration (पंजाब, गोवा, उत्तर प्रदेश, उत्तराखंड)</td>
                <td className="px-4 py-2 font-medium text-ink">1 दिसंबर 2026 से 4 जनवरी 2027</td>
              </tr>
              <tr className="border-b border-rule/60 align-top">
                <td className="px-4 py-2 text-ink/80">Revisional round (छूटे या गलत records ठीक करना)</td>
                <td className="px-4 py-2 font-medium text-ink">5–9 जनवरी 2027</td>
              </tr>
              <tr className="align-top">
                <td className="px-4 py-2 text-ink/80">बाकी राज्यों में Enumeration</td>
                <td className="px-4 py-2 font-medium text-ink">9–28 फरवरी 2027</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="text-ink/80 mt-3"><strong>Helpline (toll-free):</strong> 1855</p>
        <p className="text-sm text-ink/60 mt-1">
          तारीखें और नंबर सार्वजनिक सूचनाओं से लिए गए हैं। अपने district की पक्की तारीखें Charge Officer से जरूर पूछ लें।
        </p>

        <h2 className={h2}>Enumerator के लिए 5 मुख्य बातें</h2>
        <ol className="list-decimal pl-5 flex flex-col gap-2 text-ink/80 leading-relaxed max-w-prose">
          <li><strong>अपना EB ही कवर करें:</strong> कोई घर छूटे नहीं, कोई दोबारा न गिना जाए।</li>
          <li><strong>App के नियम:</strong> एक user के लिए एक phone, app कभी uninstall न करें, clone app न चलाएँ।</li>
          <li><strong>हर 5–6 households के बाद Sync करें</strong>, और दिन के आखिर में भी।</li>
          <li><strong>Respondent को summary दिखाकर पढ़कर सुनाएँ</strong>, फिर signature लें।</li>
          <li><strong>जानकारी गोपनीय है:</strong> किसी को न बताएँ, photo या screenshot न लें।</li>
        </ol>

        <h2 className={h2}>अलग-अलग पेज</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Link href="/census-2027/checklist" className="border border-rule rounded-lg p-4 hover:border-maroon">
            <b className="block text-maroon mb-1">Checklist</b>
            <span className="text-sm text-ink/60">तैयारी से लेकर काम पूरा होने तक की list, tick करते जाएँ</span>
          </Link>
          <Link href="/census-2027/app-guide" className="border border-rule rounded-lg p-4 hover:border-maroon">
            <b className="block text-maroon mb-1">App और Registration Guide</b>
            <span className="text-sm text-ink/60">फोन की तैयारी और registration के steps</span>
          </Link>
          <Link href="/census-2027/faq" className="border border-rule rounded-lg p-4 hover:border-maroon">
            <b className="block text-maroon mb-1">FAQ</b>
            <span className="text-sm text-ink/60">अक्सर पूछे जाने वाले सवालों के जवाब</span>
          </Link>
        </div>

        <p className="text-xs text-ink/50 mt-8 max-w-prose border-t border-rule pt-4">
          यह पेज सरकारी नहीं है। यह Enumerator Instruction Manual के हमारे अपने summary पर आधारित है। अंतिम नियम और तारीखें अपने
          trainer या Charge Officer से पक्की करें।
        </p>
      </article>
    </div>
  );
}
