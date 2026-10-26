import Link from 'next/link';
import CompactCircularRow from '@/components/CompactCircularRow';
import FaqSection from '@/components/FaqSection';
import JsonLd from '@/components/JsonLd';
import SidebarWidgets from '@/components/SidebarWidgets';
import { getAllCirculars, getCircularsBySection } from '@/lib/data';
import { TRANSFER_FAQS } from '@/lib/faqs';
import { summaryPreviewText } from '@/lib/sanitize';
import { SITE_NAME, SITE_URL } from '@/lib/site';

// Reads the latest railway posts from the database on every request.
export const dynamic = 'force-dynamic';

const PATH = '/guides/railway-transfer';
const TITLE = 'Railway Employee Transfer Rules: Request, Mutual, Periodical';
const DESCRIPTION =
  'रेल कर्मचारियों के ट्रांसफर की आसान गाइड: रिक्वेस्ट, म्यूचुअल और पीरियोडिकल ट्रांसफर के नियम, सीनियरिटी, ज्वाइनिंग टाइम और आवेदन के तरीके, रेलवे बोर्ड के सर्कुलरों के हवाले के साथ।';
// Update this date whenever the page text is changed or re-checked.
const UPDATED = '2026-10-26';
const UPDATED_LABEL = '26 अक्टूबर 2026';

export const metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: PATH },
  openGraph: { type: 'article', siteName: SITE_NAME, locale: 'hi_IN', url: PATH, title: TITLE, description: DESCRIPTION },
};

const TYPES: { kind: string; meaning: string; note: string }[] = [
  { kind: 'रेलवे की जरूरत से (प्रशासनिक)', meaning: 'रेलवे अपनी जरूरत या जनहित में खुद ट्रांसफर करती है', note: 'नई जगह जाने के लिए ज्वाइनिंग टाइम और TA के नियम लागू होते हैं' },
  { kind: 'अपनी मर्जी से (रिक्वेस्ट)', meaning: 'कर्मचारी खुद आवेदन देकर ट्रांसफर मांगता है', note: 'यूनिट बदलने पर सीनियरिटी पर असर पड़ सकता है' },
  { kind: 'आपसी (म्यूचुअल)', meaning: 'दो कर्मचारी आपस में जगह बदल लेते हैं', note: 'RBE 08/2019 की नीति लागू होती है' },
  { kind: 'समय-समय पर (पीरियोडिकल)', meaning: 'संवेदनशील पदों पर तय समय बाद ट्रांसफर', note: 'गैर-राजपत्रित स्टाफ के लिए आम तौर पर 4 साल' },
  { kind: 'पति-पत्नी के आधार पर', meaning: 'पति या पत्नी की पोस्टिंग वाली जगह पर ट्रांसफर', note: 'एक ही स्टेशन या उसके पास भेजने की कोशिश की जाती है' },
];

const SOURCES = [
  'रेलवे बोर्ड, मास्टर सर्कुलर नंबर 24: गैर-राजपत्रित रेलवे कर्मचारियों का ट्रांसफर',
  'RBE 08/2019: म्यूचुअल ट्रांसफर की व्यापक नीति',
  'RBE 99/2018 और RBE 67/2025: लेवल-1 कर्मचारियों का म्यूचुअल ट्रांसफर',
  'RBE 131/2017: म्यूचुअल ट्रांसफर के आवेदन',
  'RBE 53/2026 (1 जुलाई 2026): पीरियोडिकल ट्रांसफर के लिए संवेदनशील पदों की सूची',
  'इंडियन रेलवे एस्टैब्लिशमेंट कोड, अध्याय 11 (ज्वाइनिंग टाइम) और अध्याय 16 (TA)',
];

const h2 = 'font-serif text-xl font-semibold text-ink mt-8 mb-3';

export default async function RailwayTransferGuidePage() {
  const [allCirculars, railway] = await Promise.all([getAllCirculars(), getCircularsBySection('railway-board')]);
  const latest = railway.slice(0, 5).map((c) => ({ ...c, summary: summaryPreviewText(c.summary) }));

  return (
    <div className="mx-auto max-w-[1200px] px-4 grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_300px] gap-8 items-start">
      <JsonLd
        data={[
          {
            '@context': 'https://schema.org',
            '@type': 'Article',
            headline: 'रेल कर्मचारियों का ट्रांसफर: कितने तरह के होते हैं और क्या नियम हैं',
            description: DESCRIPTION,
            inLanguage: 'hi-IN',
            dateModified: UPDATED,
            mainEntityOfPage: `${SITE_URL}${PATH}`,
            author: { '@type': 'Organization', name: SITE_NAME, url: SITE_URL },
            publisher: { '@type': 'Organization', name: SITE_NAME, url: SITE_URL },
          },
          {
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement: [
              { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
              { '@type': 'ListItem', position: 2, name: 'Railway Transfer Guide', item: `${SITE_URL}${PATH}` },
            ],
          },
        ]}
      />
      <article className="py-10 min-w-0">
        <h1 className="font-serif text-3xl font-semibold text-ink mb-1">रेल कर्मचारियों का ट्रांसफर: कितने तरह के होते हैं और क्या नियम हैं</h1>
        <p className="text-sm text-ink/60 mb-1">Railway Employee Transfer Rules: आसान भाषा में गाइड</p>
        <p className="font-mono text-xs text-ink/50 mb-6">अंतिम अपडेट: {UPDATED_LABEL}</p>

        <p className="text-ink/80 leading-relaxed max-w-prose">
          रेलवे में काम करने वाले हर कर्मचारी के लिए ट्रांसफर बड़ी बात होती है। कभी रेलवे अपनी जरूरत से ट्रांसफर करती है, और कभी
          कर्मचारी खुद अपनी मर्जी से ट्रांसफर मांगता है। इस गाइड में आसान भाषा में बताया गया है कि ट्रांसफर कितने तरह के होते हैं,
          कौन-से नियम लागू होते हैं और आवेदन करते समय किन बातों का ध्यान रखें।
        </p>

        <h2 className={h2}>ट्रांसफर के मुख्य प्रकार</h2>
        <div className="border border-rule overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-rule text-left text-ink/50 font-mono text-xs uppercase">
                <th className="px-4 py-2 font-medium">प्रकार</th>
                <th className="px-4 py-2 font-medium">मतलब</th>
                <th className="px-4 py-2 font-medium">ध्यान रखें</th>
              </tr>
            </thead>
            <tbody>
              {TYPES.map((t) => (
                <tr key={t.kind} className="border-b border-rule/60 last:border-b-0 align-top">
                  <td className="px-4 py-2 font-medium text-ink">{t.kind}</td>
                  <td className="px-4 py-2 text-ink/80">{t.meaning}</td>
                  <td className="px-4 py-2 text-ink/70">{t.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <h2 className={h2}>1. अपनी मर्जी से ट्रांसफर (रिक्वेस्ट ट्रांसफर)</h2>
        <ul className="list-disc pl-5 flex flex-col gap-2 text-ink/80 leading-relaxed max-w-prose">
          <li>अगर आप उसी सीनियरिटी यूनिट में ही ट्रांसफर लेते हैं, तो आपकी <strong>सीनियरिटी नहीं जाती</strong>।</li>
          <li>अगर आप दूसरी सीनियरिटी यूनिट में जाते हैं, तो आपको नई यूनिट में <strong>सबसे नीचे की सीनियरिटी</strong> मिलती है, चाहे आपकी सर्विस कितनी भी हो।</li>
          <li>पति-पत्नी दोनों रेलवे में हों, तो उन्हें एक ही स्टेशन पर या पास-पास पोस्टिंग देने की कोशिश की जाती है।</li>
          <li>रिक्वेस्ट ट्रांसफर के बाकी नियम और हर चरण की समय-सीमा रेलवे बोर्ड के मास्टर सर्कुलर नंबर 24 में दी गई है। आवेदन से पहले उसे पढ़ लें।</li>
        </ul>

        <h2 className={h2}>2. आपसी (म्यूचुअल) ट्रांसफर</h2>
        <ul className="list-disc pl-5 flex flex-col gap-2 text-ink/80 leading-relaxed max-w-prose">
          <li>इसमें दो कर्मचारी आपस में जगह बदलते हैं। नियम रेलवे बोर्ड की नीति <strong>RBE 08/2019</strong> में हैं।</li>
          <li>कोई भी रेलवे कर्मचारी दूसरी रेलवे, डिवीजन या यूनिट के उसी ग्रेड के कर्मचारी के साथ जगह बदलने के लिए आवेदन कर सकता है। अलग या ऊँचे ग्रेड वाले को अपनी मर्जी से नीचे के पद पर जाना मंजूर करना होता है।</li>
          <li>मंजूरी कौन देता है: डिवीजन के पदों के लिए DRM, वर्कशॉप के पदों के लिए CWM, और हेडक्वार्टर के पदों के लिए GM (या उनका अधिकृत अफसर)।</li>
          <li><strong>लेवल-1 के कर्मचारी</strong> अलग-अलग कैडर या विभाग में भी आपस में जगह बदल सकते हैं (RBE 99/2018)। RBE 67/2025 में साफ किया गया कि जहां रेलवे या डिवीजन नहीं बदलती, वहां भी ऐसा आवेदन देखा जाएगा।</li>
          <li>आवेदन अपने संबंधित पर्सनल ऑफिसर के जरिए दें, सीधे दूसरे डिवीजन को नहीं (RBE 131/2017)।</li>
        </ul>

        <h2 className={h2}>3. संवेदनशील पदों पर समय-समय पर ट्रांसफर</h2>
        <ul className="list-disc pl-5 flex flex-col gap-2 text-ink/80 leading-relaxed max-w-prose">
          <li>जिन पदों पर जनता या ठेकेदारों से ज्यादा संपर्क रहता है, उन्हें संवेदनशील पद कहा जाता है। इन पर गैर-राजपत्रित कर्मचारियों को आम तौर पर <strong>हर 4 साल में</strong> दूसरी जगह भेजा जाता है।</li>
          <li>रेलवे बोर्ड के <strong>RBE 53/2026 (1 जुलाई 2026)</strong> के अनुसार, मेडिकल विभाग में चीफ हेल्थ इंस्पेक्टर और हेल्थ इंस्पेक्टर के पद भी अब संवेदनशील पदों की सूची में जोड़े गए हैं।</li>
        </ul>

        <h2 className={h2}>4. ट्रांसफर के बाद: ज्वाइनिंग टाइम और TA</h2>
        <ul className="list-disc pl-5 flex flex-col gap-2 text-ink/80 leading-relaxed max-w-prose">
          <li>रेलवे कर्मचारियों पर सामान्य सरकारी कर्मचारियों वाले <strong>CCS (ज्वाइनिंग टाइम) नियम 1979 लागू नहीं होते</strong>। इनके नियम इंडियन रेलवे एस्टैब्लिशमेंट कोड के अध्याय 11 में हैं।</li>
          <li>अगर ट्रांसफर अस्थायी है और 180 दिन तक का है, तो ज्वाइनिंग टाइम नहीं मिलता, सिर्फ रास्ते में लगा समय मिलता है।</li>
          <li>ट्रांसफर पर TA के नियम इसी कोड के अध्याय 16 में हैं। कितना पैसा या छुट्टी मिलेगी, यह अपने पर्सनल या अकाउंट्स ब्रांच से जरूर पूछ लें।</li>
        </ul>

        <h2 className={h2}>आवेदन करते समय ये बातें याद रखें</h2>
        <ul className="list-disc pl-5 flex flex-col gap-2 text-ink/80 leading-relaxed max-w-prose">
          <li>आवेदन लिखित में, सही रास्ते (प्रॉपर चैनल) से दें और उसकी रसीद या डायरी नंबर संभालकर रखें।</li>
          <li>कारण के कागज लगाएं: पति या पत्नी का पोस्टिंग लेटर, मेडिकल कागज या बच्चों की पढ़ाई के प्रमाण।</li>
          <li>पहले समझ लें कि नई जगह जाने पर आपकी सीनियरिटी का क्या होगा।</li>
          <li>व्हाट्सऐप की बातों पर भरोसा न करें। हमेशा सर्कुलर का नंबर और तारीख देखें, और जरूरत हो तो यूनियन या वेलफेयर इंस्पेक्टर से मदद लें।</li>
        </ul>

        <h2 className={h2}>इस गाइड में इस्तेमाल हुए सर्कुलर</h2>
        <ul className="list-disc pl-5 flex flex-col gap-1.5 text-sm text-ink/70 leading-relaxed max-w-prose">
          {SOURCES.map((s) => (
            <li key={s}>{s}</li>
          ))}
        </ul>
        <p className="text-sm text-ink/60 mt-3 max-w-prose">
          असली सर्कुलर रेलवे बोर्ड की वेबसाइट (indianrailways.gov.in) पर नंबर डालकर खोजें और खुद पढ़ लें।
        </p>

        <p className="text-xs text-ink/50 mt-6 max-w-prose border-t border-rule pt-4">
          यह जानकारी रेलवे बोर्ड के सर्कुलरों पर आधारित है और केवल जानकारी के लिए है। नियम बदलते रहते हैं और अलग-अलग रेलवे में पालन थोड़ा
          अलग हो सकता है, इसलिए फैसला लेने से पहले अपने पर्सनल ब्रांच या नवीनतम रेलवे बोर्ड सर्कुलर से जरूर पुष्टि करें।
        </p>

        <FaqSection faqs={TRANSFER_FAQS} heading="अक्सर पूछे जाने वाले सवाल" />

        <section className="mt-12 print:hidden">
          <h2 className="font-serif text-xl font-semibold text-ink mb-2">रेलवे बोर्ड के ताज़ा सर्कुलर</h2>
          {latest.length === 0 ? (
            <p className="text-sm text-ink/50 py-2">अभी कोई पोस्ट नहीं है।</p>
          ) : (
            latest.map((circular) => (
              <div key={circular.slug} className="border-b border-rule last:border-b-0">
                <CompactCircularRow circular={circular} />
              </div>
            ))
          )}
          <Link href="/section/railway-board" className="inline-block mt-3 text-sm text-maroon hover:underline">
            सभी रेलवे बोर्ड सर्कुलर देखें →
          </Link>
        </section>
      </article>
      <SidebarWidgets circulars={allCirculars} />
    </div>
  );
}
