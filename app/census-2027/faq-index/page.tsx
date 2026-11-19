import CensusSubNav from '@/components/CensusSubNav';
import { SITE_NAME } from '@/lib/site';

const PATH = '/census-2027/faq-index';
const TITLE = 'FAQ Index – Census 2027: सवाल, जवाब और Manual Para';
const DESCRIPTION = 'Census 2027 Enumerator FAQ की पूरी सूची: सवाल, जवाब और Manual का para नंबर, सेक्शन के हिसाब से।';

export const metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: PATH },
  openGraph: { type: 'article', siteName: SITE_NAME, locale: 'hi_IN', url: PATH, title: TITLE, description: DESCRIPTION },
  twitter: { card: 'summary', title: TITLE, description: DESCRIPTION },
};

type Item = { q: string; a: string; para: string };
type Section = { heading: string; items: Item[] };

// PREVIEW ONLY — section 1 filled in fully to judge the stacked design on
// mobile; sections 2-6 left as stubs. Not linked from anywhere yet.
const SECTIONS: Section[] = [
  {
    heading: '1. बेसिक जानकारी',
    items: [
      {
        q: 'Census 2027 का Phase 2 (Population Enumeration) क्या है?',
        a: 'Phase 1 (Houselisting, अप्रैल से सितंबर 2026) में हर building, मकान और household की list बनी थी। Phase 2 में हर household के हर member की जानकारी 40 questions वाले schedule में भरी जाती है। इसी को Population Enumeration (PE) कहते हैं।',
        para: '1.3.1, 1.3.3',
      },
      {
        q: 'Enumerator का मुख्य काम क्या है?',
        a: 'अपने Enumeration Block (EB) के हर household में जाना, सभी members की जानकारी पूछकर mobile app "Census 2027 – PE" में भरना, आखिर में respondent को summary दिखाकर पढ़कर सुनाना, और समय पर data Sync करके काम पूरा करना।',
        para: '2.2.1, 2.2.2, 2.2.3',
      },
      {
        q: 'EB कितना बड़ा होता है?',
        a: 'एक EB में लगभग 800 लोग आते हैं। आपको EB का map और छपी हुई Abridged Houselist (AHL) मिलती है। सिर्फ अपने ही EB में काम करें। दूसरे EB में जाना या अपना कोई इलाका छोड़ देना, दोनों गलत हैं।',
        para: '2.1.4, 5.4.3',
      },
      {
        q: 'तारीखें क्या हैं?',
        a: 'Web search के हिसाब से: Self-Enumeration (SE) 16 से 30 नवंबर 2026। पंजाब, गोवा, UP और उत्तराखंड में घर-घर enumeration 1 दिसंबर 2026 से 4 जनवरी 2027। Revisional round 5 से 9 जनवरी 2027। बाकी राज्यों में 9 से 28 फरवरी 2027। अपने district की पक्की तारीखें Charge Officer से जरूर confirm करें।',
        para: '1.3.3 (अवधि राज्य के notification से)। तारीखें manual में नहीं, public announcement/web से',
      },
      {
        q: 'मदद या शिकायत के लिए किससे बात करें?',
        a: 'पहले अपने Supervisor से, फिर Charge Officer से। Census helpline का toll-free नंबर 1855 बताया गया है।',
        para: 'Important Instructions 17 (DCO helpdesk)। 1855 manual में नहीं, public announcement से',
      },
    ],
  },
  { heading: '2. फोन और App', items: [] },
  { heading: '3. घर-घर जाना और questions पूछना', items: [] },
  { heading: '4. Special cases', items: [] },
  { heading: '5. गलती सुधारना, काम पूरा करना और जाँच', items: [] },
  { heading: '6. App में काम कैसे करें (step by step)', items: [] },
];

export default function CensusFaqIndexPreviewPage() {
  return (
    <div className="mx-auto max-w-[820px] px-4">
      <article className="py-10">
        <CensusSubNav active="/census-2027/faq" />
        <h1 className="font-serif text-3xl font-semibold text-ink mb-1">FAQ Index – Census 2027</h1>
        <p className="text-ink/80 leading-relaxed max-w-prose mt-3">
          कुल 74 सवाल। हर जवाब के नीचे Enumerator Instruction Manual का वह para नंबर है जिससे वह जवाब लिया गया है।
        </p>
        <div className="bg-[#fff7e0] border border-[#e5c76b] rounded-lg px-4 py-3 my-4 text-sm text-ink/80">
          जहाँ para में &ldquo;manual में नहीं&rdquo; या &ldquo;सामान्य सुझाव&rdquo; लिखा है, वह जानकारी manual से नहीं, public
          announcement या सामान्य सलाह से है। पक्की पुष्टि के लिए trainer या Charge Officer से पूछें।
        </div>
        <p className="text-xs font-mono uppercase text-maroon border border-maroon/40 rounded px-2 py-1 inline-block mb-4">
          Preview — सिर्फ सेक्शन 1 भरा है
        </p>

        {SECTIONS.map((section) => (
          <div key={section.heading}>
            <h2 className="font-serif text-xl font-semibold text-ink mt-8 mb-3 sticky top-0 bg-paper py-1 border-b border-rule">
              {section.heading}
            </h2>
            {section.items.length === 0 ? (
              <p className="text-sm text-ink/40 italic">(preview में अभी खाली)</p>
            ) : (
              <div className="border-t border-rule">
                {section.items.map((item) => (
                  <details key={item.q} className="border-b border-rule py-3 group">
                    <summary className="cursor-pointer font-medium text-ink list-none flex items-start justify-between gap-4">
                      <span>{item.q}</span>
                      <span className="text-maroon shrink-0 group-open:rotate-45 transition-transform" aria-hidden="true">
                        +
                      </span>
                    </summary>
                    <p className="mt-2 text-sm text-ink/75 leading-relaxed max-w-prose">{item.a}</p>
                    <p className="mt-2 text-xs font-mono text-ink/40">Manual Para: {item.para}</p>
                  </details>
                ))}
              </div>
            )}
          </div>
        ))}
      </article>
    </div>
  );
}
