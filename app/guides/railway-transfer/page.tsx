import Image from 'next/image';
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
const UPDATED = '2026-11-06';
const UPDATED_LABEL = '6 नवंबर 2026';
const IMAGE = '/share/railway-transfer.jpg';

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
    images: [{ url: IMAGE, width: 1200, height: 630, alt: 'रेल कर्मचारियों का ट्रांसफर: कितने तरह के होते हैं और क्या नियम हैं' }],
  },
  twitter: { card: 'summary_large_image', title: TITLE, description: DESCRIPTION, images: [IMAGE] },
};

const TYPES: { kind: string; meaning: string; note: string }[] = [
  { kind: 'रेलवे की जरूरत से (प्रशासनिक)', meaning: 'रेलवे अपनी जरूरत या जनहित में खुद ट्रांसफर करती है', note: 'नई जगह जाने के लिए ज्वाइनिंग टाइम और TA के नियम लागू होते हैं' },
  { kind: 'अपनी मर्जी से (रिक्वेस्ट)', meaning: 'कर्मचारी खुद आवेदन देकर ट्रांसफर मांगता है', note: 'यूनिट बदलने पर सीनियरिटी पर असर पड़ सकता है। 20 साल से अधिक नियमित सेवा वालों के लिए अलग प्राथमिकता सूची है (RBE 61/2026)' },
  { kind: 'आपसी (म्यूचुअल)', meaning: 'दो कर्मचारी आपस में जगह बदल लेते हैं', note: 'RBE 8/2019 (11.01.2019) की नीति लागू होती है' },
  { kind: 'समय-समय पर (पीरियोडिकल)', meaning: 'संवेदनशील पदों पर तय समय बाद ट्रांसफर', note: 'मास्टर सर्कुलर 24 (पैरा 4.3) के अनुसार संवेदनशील पदों पर हर चार साल में' },
  { kind: 'पति-पत्नी के आधार पर', meaning: 'पति या पत्नी की पोस्टिंग वाली जगह पर ट्रांसफर', note: 'RBE 63/2026 (05.08.2026) के अनुसार पति-पत्नी की एक ही जगह पोस्टिंग के निर्देश स्थितियों के अनुसार अलग-अलग हैं' },
];

const SOURCES = [
  'रेलवे बोर्ड, मास्टर सर्कुलर नंबर 24: गैर-राजपत्रित रेलवे कर्मचारियों का ट्रांसफर (हमने इसका वह रूप देखा है जिसमें अंत में 2002 तक के पूरक सर्कुलर सूचीबद्ध हैं; इस गाइड में दी गई पैरा संख्याएँ उसी प्रति की हैं, और 17.08.2023 के रूप में बदल सकती हैं)',
  'RBE 8/2019 (11.01.2019), पत्र E(NG)I-2018/TR/8: क्षेत्रीय रेलों पर अराजपत्रित कर्मचारियों के पारस्परिक स्थानांतरण की व्यापक नीति',
  'RBE 99/2018 और RBE 67/2025: लेवल-1 कर्मचारियों का म्यूचुअल ट्रांसफर',
  'RBE 131/2017 (22.09.2017): पारस्परिक स्थानांतरण की समय-सीमा (RBE 8/2019 के पैरा 10 में उल्लिखित)',
  'RBE 132/2023 (01.12.2023), पत्र E(NG)I/2023/TR/31: पारस्परिक स्थानांतरण की समय-सीमा का सख्ती से पालन',
  'RBE 63/2026 (05.08.2026), पत्र E(NG)I-2009/TR/29: अराजपत्रित रेलवे कर्मचारियों के पति-पत्नी की एक ही जगह पोस्टिंग के समेकित निर्देश (02.02.2010 के निर्देशों का स्थान लेता है)',
  'RBE 53/2026 (पत्र E(NG)-I/2026/TR/2, 01.07.2026, हस्ताक्षर संजय कुमार): मेडिकल विभाग में चीफ हेल्थ इंस्पेक्टर/हेल्थ इंस्पेक्टर को संवेदनशील पदों की सूची में जोड़ना',
  'RBE 61/2026 (22.07.2026): 20 साल से अधिक नियमित सेवा वाले अराजपत्रित कर्मचारियों के अपने अनुरोध पर तबादले की प्राथमिकता',
  'RBE 90/2026 (29.10.2026): SBRT (सर्विस बेस्ड रिक्वेस्ट ट्रांसफर) में तबादला आदेश के बाद मना करने पर नियम',
  'रेलवे बोर्ड का पत्र E/MPP/2025/1/55/MSTT (05.11.2026): पी-वे आर्टिज़न कैडर के विलय के दौरान IRRT/IDRT तबादलों पर अस्थायी रोक और SBRT का अपवाद',
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
            image: `${SITE_URL}${IMAGE}`,
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
        <Image
          src={IMAGE}
          alt="रेल कर्मचारियों का ट्रांसफर: कितने तरह के होते हैं और क्या नियम हैं"
          width={1200}
          height={630}
          priority
          fetchPriority="high"
          sizes="(max-width: 1024px) 100vw, 880px"
          className="w-full h-auto mb-6 border border-rule"
        />
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
          <li>पति-पत्नी की एक जगह पोस्टिंग के निर्देश अब <strong>RBE 63/2026 (05.08.2026)</strong> में समेकित हैं। यह आदेश 02.02.2010 के पुराने निर्देशों का स्थान लेता है और केवल अराजपत्रित कर्मचारियों पर लागू है। पाँच स्थितियाँ बताई गई हैं: (i) दोनों रेलवे कर्मचारी और एक ही सीनियरिटी यूनिट में; (ii) दोनों रेलवे कर्मचारी पर अलग सीनियरिटी यूनिट में; (iii) दूसरा अखिल भारतीय सेवा या अन्य केंद्रीय सेवा में; (iv) दूसरा राज्य सेवा में; (v) दूसरा केंद्रीय/राज्य सार्वजनिक उपक्रम में। पहली स्थिति में, यदि दोनों एक ही विभाग में हों और जरूरी स्तर का पद उपलब्ध हो, तो उन्हें एक साथ पोस्ट किया जाना चाहिए, इस तरह कि एक दूसरे का अधीनस्थ न हो। बाकी स्थितियों में कोशिश और सहानुभूति से विचार का प्रावधान है।</li>
          <li>दूसरी सीनियरिटी यूनिट/डिवीजन/रेलवे में अपने अनुरोध पर तबादले का अनुरोध मास्टर सर्कुलर 24 (पैरा 5.1) के अनुसार केवल उन कर्मचारियों से माना जाता है जो भर्ती के शुरुआती ग्रेड में हैं, या ऐसे बीच के ग्रेड में हैं जिसमें सीधी भर्ती का हिस्सा है। जिन बीच के ग्रेड में सारे पद निचले ग्रेड की पदोन्नति से भरे जाते हैं, वहाँ निजी अनुरोध पर तबादला नहीं होता। स्पोर्ट्स कोटे से भर्ती कर्मचारियों के अंतर-रेलवे तबादले के अनुरोध नहीं माने जाते।</li>
          <li>रिक्वेस्ट ट्रांसफर के बाकी नियम रेलवे बोर्ड के मास्टर सर्कुलर नंबर 24 में दिए गए हैं। आवेदन से पहले उसे पढ़ लें।</li>
        </ul>

        <h3 className="font-serif text-lg font-semibold text-ink mt-5 mb-2">20 साल से अधिक नियमित सेवा वालों के लिए नई व्यवस्था (RBE 61/2026)</h3>
        <ul className="list-disc pl-5 flex flex-col gap-2 text-ink/80 leading-relaxed max-w-prose">
          <li>रेलवे बोर्ड के <strong>RBE 61/2026 (22.07.2026)</strong> के अनुसार जिन अराजपत्रित कर्मचारियों की नियमित सेवा 20 साल से अधिक है, उनके लिए अपने अनुरोध पर तबादले की अलग प्राथमिकता सूची बनती है। प्राथमिकता नियमित सेवा के वर्षों से तय होती है, आवेदन की तारीख से नहीं।</li>
          <li>आवेदन पहले की तरह HRMS पर ही होता है। हर महीने की पहली तारीख को HRMS सूची बनाता है और खाली पदों के अनुसार तबादला आदेश HRMS पर अपने आप जारी होते हैं। इस योजना में स्वीकार करने वाली इकाई का NOC नहीं लगता।</li>
          <li>यह योजना सिर्फ जगह बदलने के लिए है। श्रेणी या विभाग बदलने और खुली लाइन से प्रोडक्शन यूनिट/वर्कशॉप में जाने के लिए नहीं। 20 साल से कम सेवा वालों के लिए पुरानी व्यवस्था जारी है।</li>
          <li>RBE 90/2026 (29.10.2026) में इस योजना को सर्विस बेस्ड रिक्वेस्ट ट्रांसफर (SBRT) कहा गया है। इसके अनुसार तबादला आदेश मिलने के बाद मना करने वाला कर्मचारी HRMS पर बिना अलग मंजूरी के अनिच्छा दर्ज कर सकता है, पर आगे SBRT में आवेदन नहीं कर सकेगा और IRRT/IDRT में भी एक साल तक अपने अनुरोध पर तबादले से वंचित रहेगा। एक साल बाद IRRT/IDRT में प्राथमिकता आवेदन की तारीख के आधार पर बहाल होगी।</li>
          <li>पूरा ब्योरा, रिलीविंग के नियम और जो बातें आदेश में साफ नहीं हैं: <Link href="/circulars/railway-board-changes-transfer-policy-of-its-staff" className="text-maroon hover:underline">RBE 61/2026 पर हमारी पोस्ट</Link>।</li>
          <li>रेलवे बोर्ड के 05.11.2026 के पत्र के अनुसार पी-वे आर्टिज़न कैडर के विलय के दौरान IRRT/IDRT तबादलों की प्रक्रिया अस्थायी रूप से रोकी जा सकती है। यह रोक RBE 61/2026 वाली SBRT योजना के तबादलों पर लागू नहीं होगी। ब्योरा: <Link href="/circulars/technician-track-cadre-pway-artisan-merger-rbe-77-2026-hrms-order-05-11-2026" className="text-maroon hover:underline">टेक्नीशियन (ट्रैक) कैडर वाली पोस्ट</Link>।</li>
        </ul>

        <h2 className={h2}>2. आपसी (म्यूचुअल) ट्रांसफर</h2>
        <ul className="list-disc pl-5 flex flex-col gap-2 text-ink/80 leading-relaxed max-w-prose">
          <li>इसमें दो कर्मचारी आपस में जगह बदलते हैं। नियम रेलवे बोर्ड की नीति <strong>RBE 8/2019 (11.01.2019)</strong> में हैं।</li>
          <li>कोई भी रेलवे कर्मचारी दूसरी रेलवे, डिवीजन या यूनिट के उसी ग्रेड के कर्मचारी के साथ जगह बदलने के लिए आवेदन कर सकता है। अलग ग्रेड के कर्मचारियों के बीच अदला-बदली RBE 8/2019 (पैरा 9) के अनुसार केवल संवर्ग के भर्ती ग्रेड में होगी, बीच के ग्रेड में नहीं, और दोनों कर्मचारियों को लिखित में देना होता है कि वे बिना शर्त पदोन्नति की उम्मीद छोड़कर स्वेच्छा से नई इकाई के भर्ती ग्रेड और निम्नतर वरिष्ठता स्वीकार कर रहे हैं।</li>
          <li>मंजूरी कौन देता है (RBE 8/2019, पैरा 3): मंडल के नियंत्रण वाले पदों के लिए DRM, वर्कशॉप के पदों के लिए CWM, और मुख्यालय के नियंत्रण वाले पदों के लिए GM या उनके द्वारा अधिकृत कोई निचला अधिकारी।</li>
          <li>सीनियरिटी (RBE 8/2019, पैरा 4): दोनों में से वरिष्ठ कर्मचारी को कनिष्ठ द्वारा खाली किया पद मिलता है। कनिष्ठ कर्मचारी को नई इकाई में अपनी पिछली सीनियरिटी रखने की अनुमति है और उसे उसी सीनियरिटी वाले कर्मचारी से नीचे रखा जाता है। कुछ मामलों में दोनों की सीनियरिटी में जो कम हो वह ली जा सकती है; इसलिए अपने मामले का ब्योरा पैरा 4 में देखें। एक बार दोनों पक्ष सहमत हो जाएँ तो अदला-बदली से वापस लौटने का अनुरोध नहीं माना जाएगा।</li>
          <li>रिलीविंग (पैरा 7): दोनों इकाइयों के NOC के बाद दोनों कर्मचारियों को दूसरे के रिलीव होने की प्रतीक्षा किए बिना एक हफ्ते के भीतर कार्यमुक्त किया जाता है।</li>
          <li>आदेश में समय-सीमा भी दी है (पैरा 10), जिसे RBE 132/2023 (01.12.2023) में फिर से सख्ती से पालन के लिए दोहराया गया है, क्योंकि प्रक्रिया में काफी देरी देखी गई थी। RBE 132/2023 यह भी कहता है कि शक में वरिष्ठ व्यक्ति को ही पहले, तबादला आदेश जारी होने के एक हफ्ते के भीतर, कार्यमुक्त किया जाए। समय-सीमा: पर्यवेक्षक द्वारा आवेदन अग्रेषित करना 10 दिन, मंडल कार्मिक विभाग द्वारा 15 दिन, मुख्यालय कार्मिक विभाग द्वारा 15 दिन, काउंटर-पार्ट की स्वीकृति 10 दिन, तबादला आदेश 10 दिन, और एलपीसी तथा सेवा पंजिका भेजना 15 दिन।</li>
          <li><strong>लेवल-1 के कर्मचारी</strong> अलग-अलग कैडर या विभाग में भी आपस में जगह बदल सकते हैं (RBE 99/2018)। RBE 67/2025 में साफ किया गया कि जहां रेलवे या डिवीजन नहीं बदलती, वहां भी ऐसा आवेदन देखा जाएगा।</li>
          <li>आवेदन पर्सनल विभाग के जरिए आगे जाता है। RBE 8/2019 (पैरा 10) के अनुसार मंडल का कार्मिक विभाग आवेदन की जाँच करके संबंधित मंडल को भेजता है।</li>
        </ul>

        <h2 className={h2}>3. संवेदनशील पदों पर समय-समय पर ट्रांसफर</h2>
        <ul className="list-disc pl-5 flex flex-col gap-2 text-ink/80 leading-relaxed max-w-prose">
          <li>जिन पदों पर जनता या ठेकेदारों से ज्यादा संपर्क रहता है, उन्हें संवेदनशील पद कहा जाता है। मास्टर सर्कुलर 24 (पैरा 4.3) के अनुसार जनता या ठेकेदार/सप्लायर से संपर्क वाले संवेदनशील पदों के कर्मचारियों को पद/सीट या स्टेशन से <strong>हर चार साल में</strong> बाहर ट्रांसफर किया जाना चाहिए। उसी पैरा में विभागवार संवेदनशील पदों की सूची भी है। क्लर्कों के लिए एक डेस्क से दूसरे डेस्क पर घुमाना भी आवधिक तबादले की जरूरत पूरी करता है (पैरा 4.4)।</li>
          <li>रेलवे बोर्ड के <strong>RBE 53/2026 (पत्र E(NG)-I/2026/TR/2, दिनांक 01.07.2026)</strong> के अनुसार, मेडिकल विभाग में चीफ हेल्थ इंस्पेक्टर/हेल्थ इंस्पेक्टर (CHI/HI) का पद भी अब संवेदनशील पदों की सूची में जोड़ा गया है (27.09.1989 के पत्र, RBE 244/1989, के अनुबंध में क्रम संख्या 8 के रूप में)। यह सूची 1989 से अब तक 1995, 2002 (दो पत्र), 2005, 2006 और 2020 के पत्रों से समय-समय पर बढ़ाई गई है।</li>
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
