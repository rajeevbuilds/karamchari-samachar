import Link from 'next/link';
import CensusSubNav from '@/components/CensusSubNav';
import JsonLd from '@/components/JsonLd';
import { incrementPageView } from '@/lib/data';
import { SITE_NAME } from '@/lib/site';

// Renders on every request so incrementPageView below runs per visit, not once at build time.
export const dynamic = 'force-dynamic';

const PATH = '/census-2027/faq';
const TITLE = 'Enumerator FAQ – Census 2027 (आसान हिंदी, Manual Para सहित)';
const DESCRIPTION = 'Census 2027 Enumerators के अक्सर पूछे जाने वाले सवालों के जवाब, आसान हिंदी में, हर जवाब के नीचे Manual का para नंबर।';

export const metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: PATH },
  openGraph: { type: 'article', siteName: SITE_NAME, locale: 'hi_IN', url: PATH, title: TITLE, description: DESCRIPTION },
  twitter: { card: 'summary', title: TITLE, description: DESCRIPTION },
};

type Item = { q: string; a: string; para: string };
type Section = { heading: string; items: Item[] };

// The 40-question Household Schedule, in order, from the Gazette notification
// itself — a different, more authoritative source than the Enumerator
// Instruction Manual summary used for the FAQ sections above.
const SCHEDULE_QUESTIONS: { no: number; q: string }[] = [
  { no: 1, q: 'व्यक्ति का नाम' },
  { no: 2, q: 'परिवार के मुखिया से रिश्ता' },
  { no: 3, q: 'लिंग' },
  { no: 4, q: 'जन्म तारीख और उम्र (पूरे वर्षों में)' },
  { no: 5, q: 'वर्तमान वैवाहिक स्थिति' },
  { no: 6, q: 'विवाह के समय आयु (पूरे वर्षों में)' },
  { no: 7, q: 'पति/पत्नी का नाम' },
  { no: 8, q: 'घोषित राष्ट्रीयता' },
  { no: 9, q: 'धर्म' },
  { no: 10, q: 'अनुसूचित जाति / अनुसूचित जनजाति / अन्य' },
  { no: 11, q: 'पिता का विवरण' },
  { no: 12, q: 'माता का विवरण' },
  { no: 13, q: 'दिव्यांगता (Disability)' },
  { no: 14, q: 'मातृभाषा और अन्य जानी जाने वाली भाषाएँ' },
  { no: 15, q: 'साक्षरता और डिजिटल साक्षरता की स्थिति' },
  { no: 16, q: 'किसी शिक्षण संस्थान में उपस्थिति की स्थिति' },
  { no: 17, q: 'प्राप्त उच्चतम शैक्षणिक योग्यता: स्तर और विषय/स्ट्रीम' },
  { no: 18, q: 'पिछले वर्ष के दौरान कभी काम किया' },
  { no: 19, q: 'आर्थिक गतिविधि की श्रेणी' },
  { no: 20, q: 'व्यवसाय (Occupation)' },
  { no: 21, q: 'उद्योग, व्यापार या सेवा की प्रकृति' },
  { no: 22, q: 'कामगार का वर्ग (Class of worker)' },
  { no: 23, q: 'गैर-आर्थिक गतिविधि (marginal, semi-marginal और non-workers के लिए)' },
  { no: 24, q: 'काम की तलाश या काम के लिए उपलब्धता (marginal, semi-marginal और non-workers के लिए)' },
  { no: 25, q: 'काम की जगह तक यात्रा' },
  { no: 26, q: 'जन्म स्थान' },
  { no: 27, q: 'पिछले निवास का स्थान' },
  { no: 28, q: 'प्रवासन (migration) का कारण' },
  { no: 29, q: 'पिछले प्रवासन के बाद इस गाँव/शहर में रहने की अवधि' },
  { no: 30, q: 'स्थायी निवास पते का विवरण' },
  { no: 31, q: 'अभी जीवित बच्चों की संख्या (सिर्फ वर्तमान में विवाहित, विधवा, तलाकशुदा और अलग रह रही महिलाओं के लिए)' },
  { no: 32, q: 'अब तक जन्मे जीवित बच्चों की कुल संख्या (सिर्फ वर्तमान में विवाहित, विधवा, तलाकशुदा और अलग रह रही महिलाओं के लिए)' },
  { no: 33, q: 'पिछले एक साल के दौरान जन्मे जीवित बच्चों की संख्या (सिर्फ वर्तमान में विवाहित महिलाओं के लिए)' },
  { no: 34, q: 'COVID-19 टीकाकरण की स्थिति' },
  { no: 35, q: 'कुल बैंक खातों की संख्या' },
  { no: 36, q: 'मोबाइल नंबर (अगर उपलब्ध हो)' },
  { no: 37, q: 'आधार नंबर (अगर उपलब्ध हो)' },
  { no: 38, q: 'वोटर ID नंबर (अगर उपलब्ध हो)' },
  { no: 39, q: 'पासपोर्ट नंबर (अगर भारतीय पासपोर्ट धारक हों)' },
  { no: 40, q: 'ड्राइविंग लाइसेंस की उपलब्धता' },
];

// Content and Manual Para references come from a separately-prepared index
// (not independently read against the Manual by us) — see the yellow note on
// the page itself.
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
        q: 'schedule में कितने questions हैं?',
        a: 'कुल 40। ये हर member के लिए पूछे जाते हैं: नाम, रिश्ता, लिंग, उम्र या जन्म तारीख, शादी की स्थिति, पढ़ाई, काम, एक जगह से दूसरी जगह जाना (migration) वगैरह। कुछ questions सिर्फ उन्हीं members के लिए होते हैं जिन पर वे लागू हों। App खुद अगला question दिखाता है। सभी 40 सवालों की पूरी सूची इस पेज के आखिर में दी गई है।',
        para: '6.5 (Q.1 से Q.40)',
      },
      {
        q: 'तारीखें क्या हैं?',
        a: 'Web search के हिसाब से: Self-Enumeration (SE) 16 से 30 नवंबर 2026। पंजाब, गोवा, UP और उत्तराखंड में घर-घर enumeration 1 दिसंबर 2026 से 4 जनवरी 2027। Revisional round 5 से 9 जनवरी 2027। बाकी राज्यों में 9 से 28 फरवरी 2027। अपने district की पक्की तारीखें Charge Officer से जरूर confirm करें।',
        para: '1.3.3 (अवधि राज्य के notification से)। तारीखें manual में नहीं, public announcement/web से',
      },
      {
        q: 'Revisional round क्या होता है?',
        a: 'Enumeration के बाद के 5 दिन, जिनमें छूटे हुए या गलत भरे households को ठीक किया जाता है। इसलिए अपना काम समय पर पूरा रखें।',
        para: '1.3.3, 8.1, 8.2',
      },
      {
        q: 'Self-Enumeration (SE) क्या है?',
        a: 'परिवार खुद online अपनी जानकारी भरता है और उसे 11 अंकों की SE ID मिलती है, जो "P" से शुरू होती है। जब आप जाते हैं तो वह ID लेकर परिवार का भरा हुआ data app में खोलते हैं, verify करते हैं और जरूरत हो तो सुधारते हैं।',
        para: '1.3.6, 6.4.1, 6.4.2, 9.2.4',
      },
      {
        q: 'परिवार जो जानकारी देता है, वह कितनी गोपनीय है?',
        a: 'पूरी तरह गोपनीय। किसी से share न करें, photo या screenshot न लें, और अपने personal WhatsApp या social media में न डालें। जानकारी सिर्फ duty के काम के लिए इस्तेमाल करें।',
        para: '2.1.3, 5.1, 6.1.2 (Important Notice 7–8), Important Instructions 16',
      },
      {
        q: 'मदद या शिकायत के लिए किससे बात करें?',
        a: 'पहले अपने Supervisor से, फिर Charge Officer से। Census helpline का toll-free नंबर 1855 बताया गया है। इसे अपने training material से एक बार मिला लें।',
        para: 'Important Instructions 17 (DCO helpdesk)। 1855 manual में नहीं, public announcement से',
      },
    ],
  },
  {
    heading: '2. फोन और App',
    items: [
      {
        q: 'कौन-सा app download करना है?',
        a: '"Census 2027 – PE" (package name: com.census.peproduction)। कोई दूसरा या नकली app install न करें। Download कहाँ से करना है, यह अपने trainer से पक्का कर लें।',
        para: "6.1.1, Do's (i)। Package name manual में नहीं मिला",
      },
      {
        q: 'फोन कैसा चाहिए?',
        a: 'Manual के हिसाब से Android 13 या उससे ऊपर, या iOS 15 या उससे ऊपर, कम से कम 8 GB RAM और 8 GB storage, और नक्शे (map) देखने के लिए फोन में PDF viewer। Battery full रखें। फोन इन शर्तों पर खरा न उतरे तो पहले ही Supervisor को बता दें।',
        para: '1.3.4, Annexure III (App Requirement)',
      },
      {
        q: 'Registration कैसे होता है?',
        a: 'ये steps हैं: User ID और captcha डालें → Register दबाएँ → OTP आएगा, उसे Verify करें → password बनाएँ (पहली बार login पर बदलना पड़ता है) → फोन का PIN set करें। हर step ध्यान से पढ़कर आगे बढ़ें।',
        para: '6.1.1, Annexure III (Registering as a User, Set Phone PIN)',
      },
      {
        q: 'OTP नहीं आ रहा, क्या करें?',
        a: 'Network और signal देखें। Register किए हुए मोबाइल नंबर वाली SIM फोन में होनी चाहिए। बार-बार तुरंत न दबाएँ, थोड़ी देर रुककर फिर try करें। फिर भी न आए तो Supervisor से बात करें। किसी और का नंबर न डालें।',
        para: "Annexure III (OTP, Resend OTP), Do's (viii)। बाकी सुझाव सामान्य",
      },
      {
        q: 'App की भाषा बाद में बदल सकते हैं?',
        a: 'नहीं। एक बार जो भाषा चुन ली, वह बदली नहीं जा सकती। इसलिए वही भाषा चुनें जिसमें आप आराम से काम कर सकें।',
        para: 'Annexure III (Note: भाषा बदली नहीं जा सकती), Important Instructions 20',
      },
      {
        q: 'Password या PIN भूल गए तो?',
        a: 'Password के लिए app में reset का option है। बाकी दिक्कत के लिए Supervisor से मिलें। Password और PIN किसी को न बताएँ, और फोन के साथ लिखकर न रखें।',
        para: "Annexure III (Reset password, Set Phone PIN), Don'ts (iv), (viii)",
      },
      {
        q: 'एक फोन पर दो लोग काम कर सकते हैं? या app का clone चला सकते हैं?',
        a: 'नहीं। एक user के लिए एक ही device। नए फोन पर login करने से पुराना फोन अपने आप बंद (deregister) हो जाता है। App का clone या दोहरा (dual) app कभी न चलाएँ।',
        para: "Do's (iii), (iv), Don'ts (i), (iii), (v), Important Instructions 19",
      },
      {
        q: 'App uninstall या दोबारा install कर सकते हैं?',
        a: 'नहीं। काम के बीच app uninstall न करें, इससे saved data खो सकता है। App में कोई दिक्कत हो तो पहले Supervisor से पूछें।',
        para: "Don'ts (ii), Important Instructions 18",
      },
      {
        q: 'Internet न हो तो काम हो सकता है?',
        a: 'घर-घर जाकर data भरा जा सकता है, लेकिन Sync के लिए network चाहिए। जहाँ network मिले, वहाँ Sync कर लें।',
        para: "6.4.1 (offline mode), Do's (ix)। इंटरनेट की शर्त के बारे में सीधा para नहीं",
      },
      {
        q: 'Sync कब करना चाहिए?',
        a: 'Manual के हिसाब से लगभग हर 5–6 households के बाद। दिन के आखिर में भी Sync करके ही सोएँ। इससे फोन खो जाए या खराब हो जाए तो भी ज़्यादा data नहीं जाता।',
        para: "Do's (ix), 2.2.2 (ix)",
      },
      {
        q: 'फोन खो गया या खराब हो गया तो?',
        a: 'तुरंत Supervisor और Charge Officer को बताएँ। जो data पहले Sync हो चुका है, वह server पर सुरक्षित रहता है। इसी लिए नियमित Sync जरूरी है। नया फोन कैसे मिलेगा, यह office तय करेगा।',
        para: "Don'ts (iii), Important Instructions 19",
      },
      {
        q: 'Battery और storage के लिए क्या तैयारी करें?',
        a: 'सुबह निकलने से पहले फोन charge करें, power bank साथ रखें, फालतू apps बंद रखें और storage खाली रखें। सर्दियों में ठंड से battery जल्दी उतरती है, इसलिए फोन जेब में रखें।',
        para: "Do's (xi)। बाकी सुझाव सामान्य, manual में नहीं",
      },
    ],
  },
  {
    heading: '3. घर-घर जाना और questions पूछना',
    items: [
      {
        q: 'घर जाने से पहले क्या साथ रखें?',
        a: 'ID card, छपी हुई AHL, EB का map, pen, charge किया फोन और power bank। काम अपने EB के क्रम (order) से करें, ताकि कोई घर छूटे नहीं और कोई दोबारा न गिना जाए।',
        para: '2.2.1 (ii), 2.2.2 (iv), 5.4.3',
      },
      {
        q: 'परिवार से बात कैसे शुरू करें?',
        a: 'अपना परिचय दें, ID दिखाएँ, बताएँ कि यह Census का काम है और पूरी जानकारी गोपनीय रहेगी। परिवार के किसी जानकार adult से बात करें। सब के साथ बैठकर पूछना सबसे अच्छा रहता है।',
        para: '6.1.2 (Important Notice 4, 8, 9), 2.1.3',
      },
      {
        q: 'किसे household का member गिनना है?',
        a: 'जो लोग उस घर में रहते हैं और साथ खाना खाते हैं, वे एक household हैं। अस्थायी रूप से बाहर गए लोग, नए जन्मे बच्चे, बुज़ुर्ग और मेहमानों के नियम अलग हो सकते हैं। इनका नियम training या manual से पक्का करें, अंदाज़े से न भरें।',
        para: '4.2.7, 4.2.8, 5.2.1, 5.3.1',
      },
      {
        q: 'Reference date क्या है और इसका क्या मतलब है?',
        a: 'Public announcement के हिसाब से reference date 1 मार्च 2027 की आधी रात (00:00) है; बर्फीले इलाकों के लिए अलग तारीख है। सारा data इसी समय की स्थिति बताने के लिए होता है। Enumeration के बीच में किसी का जन्म या मृत्यु हो जाए तो क्या लिखना है, यह नियम trainer से पक्का करें।',
        para: '1.3.3। तारीख manual में नहीं, public announcement से',
      },
      {
        q: 'Respondent को question समझने में दिक्कत हो तो?',
        a: 'Question को सरल भाषा में दोबारा बोलें, लेकिन जवाब का सुझाव न दें और खुद अंदाज़ा लगाकर जवाब न भरें।',
        para: '6.1.2 (Important Notice 3, 4)। Manual में सीधा para नहीं',
      },
      {
        q: 'उम्र या जन्म तारीख याद न हो तो?',
        a: 'सबसे अच्छा है कि जन्म तारीख या उम्र respondent से ही पूछें। जरूरत हो तो स्थानीय बड़ी घटनाओं से उम्र का अंदाज़ा पूछकर लिखें। App उम्र और जन्म तारीख का मेल चेक करता है। अगर मेल न खाए तो respondent से दोबारा पूछें।',
        para: '6.5.11 से 6.5.23, खासकर 6.5.14 से 6.5.22',
      },
      {
        q: 'Respondent को data कैसे दिखाएँ और सुनाएँ?',
        a: 'सब members का data भरने के बाद app की screen पर जो summary दिखती है, वह respondent को दिखाएँ और पढ़कर सुनाएँ। गलती हो तो वहीं ठीक करें। फिर उनकी सहमति और signature लें।',
        para: '6.5.213, 6.5.214',
      },
      {
        q: 'कोई question नाज़ुक (sensitive) लगे, जैसे धर्म, जाति/वर्ग या शादी, तो?',
        a: 'शांति से समझाएँ कि सारे questions सरकार ने तय किए हैं, आप कोई question छोड़ या बदल नहीं सकते, और जानकारी गोपनीय है। अपनी राय या टिप्पणी न दें।',
        para: '6.1.2 (Important Notice 4, 8), 2.1.3',
      },
      {
        q: 'क्या परिवार के पास documents होना जरूरी है?',
        a: 'आम तौर पर नहीं। जानकारी respondent के बताए अनुसार ली जाती है। परिवार को documents के लिए परेशान न करें, और यह भी न कहें कि इससे कोई फ़ायदा या नुकसान जुड़ा है।',
        para: '6.1.2 (Important Notice 9)। Documents वाली बात सीधे para में नहीं',
      },
      {
        q: 'घर पर कोई नहीं मिला या घर बंद है?',
        a: 'पड़ोसियों से पूछें कि लोग कब मिलते हैं, अलग समय पर दोबारा जाएँ और अपने note में लिखें। अंतिम तारीख तक काम न हो पाए तो Supervisor को बताएँ, ताकि revisional round में इसे जोड़ा जा सके।',
        para: '6.2.5 (Locked), 8.1 (iii)। बाकी सुझाव सामान्य',
      },
      {
        q: 'भाषा की दिक्कत आए तो?',
        a: 'समझाने के लिए पड़ोस के किसी भरोसेमंद आदमी की मदद ले सकते हैं, लेकिन data respondent के ही शब्दों में लिखें। नाम की spelling respondent से पूछकर सही रखें।',
        para: 'Important Instructions 20, 6.5.3',
      },
    ],
  },
  {
    heading: '4. Special cases',
    items: [
      {
        q: 'Houseless लोग (footpath, station, पुल के नीचे रहने वाले) कब और कैसे गिने जाते हैं?',
        a: 'इनकी गिनती enumeration period की आखिरी रात, reference date के 00:00 बजने से पहले होती है। अपने EB में ऐसी जगहों (footpath, station, मंदिर, पुल) की पहले से list बना लें, ताकि उस रात सब जगह पहुँच सकें। सुरक्षा के लिए अकेले न जाएँ और Supervisor से पहले बात कर लें।',
        para: '5.2.2, 6.3.1, 6.3.2, 6.3.3, 5.4.6, Important Instructions 15',
      },
      {
        q: 'कोई member अभी घर पर नहीं है (नौकरी, पढ़ाई या सफ़र पर)?',
        a: 'यह इस पर निर्भर करता है कि वह कितने समय से और किस घर से जुड़ा है। अंदाज़े से न भरें। Manual के नियम और training के examples देखकर तय करें। शक हो तो Supervisor से पूछें।',
        para: '5.2.1 (ii), (iii), 5.3.1',
      },
      {
        q: 'कोई respondent जानकारी देने से मना कर दे तो?',
        a: 'शांति से समझाएँ कि Census पूरे देश के लिए है और अनिवार्य है। बहस या दबाव न डालें। फिर भी न मानें तो थोड़ी देर बाद दोबारा जाएँ और Supervisor को बताएँ, वह आगे का तरीका बताएँगे। किसी से झगड़ा न करें।',
        para: '6.1.2 (Important Notice 4, 9), 3.1.2। समझाने के तरीके सामान्य सुझाव',
      },
      {
        q: 'किसी परिवार ने Self-Enumeration (SE) कर ली है, तब क्या करना है?',
        a: 'परिवार से उनकी SE ID (11 अंक, "P" से शुरू) लें। App में उससे उनका भरा हुआ data खोलें, respondent को दिखाकर सब verify करें। कमी या गलती हो तो वहीं ठीक करके उनका signature लें। पूरा form तभी दोबारा भरें जब data न मिले।',
        para: '6.4.1, 6.4.2, 9.3, 2.2.2 (vii)',
      },
      {
        q: 'SE ID काम न करे या data न खुले तो?',
        a: 'ID के अंक दोबारा ध्यान से डालें। फिर भी न खुले तो Supervisor से पूछकर परिवार की पूरी जानकारी नए सिरे से भरें। अपनी तरफ़ से नई ID न बनाएँ।',
        para: 'ID गलत तो data lost (6.4.2)। बाकी सुझाव सामान्य',
      },
      {
        q: 'क्या एक ही मकान में कई households हो सकते हैं?',
        a: 'हाँ, एक मकान में कई अलग households रह सकते हैं (अलग रसोई होने पर)। AHL और app में हर household अलग दर्ज होता है, इसलिए छपी list का क्रम ध्यान से मिलाएँ।',
        para: '4.2.7, 4.2.8, 6.1.4 (Situation 9), 6.2.6',
      },
      {
        q: 'छपी AHL में कोई मकान छूटा हुआ या ज़्यादा मिला?',
        a: 'जो मकान, Census House या household AHL में नहीं है, उसे app में NEW BN, NEW CH या NEW HH से जोड़ें। जो AHL में है पर मौके पर नहीं मिला, उसका Present Use "demolished" या "vacant" करें। EB की सीमा खुद न बदलें। सीमा में कोई गड़बड़ी लगे तो Supervisor को बताएँ, वह Charge Officer को सूचित करेंगे।',
        para: '6.2.3, 6.2.4, 6.2.5, 6.1.4 (Situation 7–8), 2.2.2 (iii), 2.3.1 (iii)',
      },
      {
        q: 'Hostel, jail, hospital जैसी जगहों में गिनती कैसे होती है?',
        a: 'ऐसी जगहों के लिए अलग व्यवस्था और नियम होते हैं, कभी-कभी अलग officer भी लगते हैं। आपके EB में ऐसी जगह आती हो तो पहले Supervisor से निर्देश ले लें।',
        para: '4.2.10 से 4.2.13, 6.1.4 (Situation 4), 6.5.6',
      },
      {
        q: 'Paper schedule (paper mode) कब इस्तेमाल होता है?',
        a: 'सिर्फ exception के तौर पर, जैसे app या network की गंभीर समस्या में, और सिर्फ officers की इजाज़त से। ऐसा हो तो बाद में data तय तारीख तक web portal पर डालना होता है, और इस्तेमाल किए और न किए दोनों schedules वापस करने होते हैं।',
        para: '2.2.3 (iii), 2.3.1 (ix), Annexure IV',
      },
    ],
  },
  {
    heading: '5. गलती सुधारना, काम पूरा करना और जाँच',
    items: [
      {
        q: 'किसी household का data गलत भर दिया, अब कैसे ठीक करें?',
        a: 'अभी Sync नहीं किया है तो app में उस record को खोलकर सही जवाब से बदल दें। Sync हो चुका हो तो "Update Data" की मदद से बदलाव करें, respondent को दोबारा दिखाकर उनका signature लें और फिर Sync करें।',
        para: '6.1.3 (Update Data), 6.6.1',
      },
      {
        q: 'Supervisor की जाँच (20% check) क्या है?',
        a: 'Supervisor अपने module में हर EB के लगभग 20% records random तरीके से देखता है। कोई गड़बड़ी दिखे तो वह आपके साथ उस घर जाकर फिर से पूछता है। इसलिए हर household का data साफ़ और सही रखें।',
        para: '6.6.1',
      },
      {
        q: 'काम पूरा होने पर क्या-क्या करना है?',
        a: 'पहले सारा data Sync करें। "View Summary" से कुल आबादी, आबाद रहने वाले मकान और households की संख्या AHL के खंड 5 में लिखें। App में काम पूरा होने का box tick करें, signature करें और Save करें। AHL के खंड 6 में "पूरी coverage का certificate" ध्यान से पढ़कर बड़े अक्षरों में नाम, signature और तारीख भरें। AHL और layout map की दो copies Supervisor को दें।',
        para: "2.2.3, 5.4.7, 5.4.8, Do's (x)",
      },
      {
        q: 'Sync के बाद भी कुछ बदल सकते हैं?',
        a: 'हाँ। Sync के बाद Update Data से बदलाव कर सकते हैं (respondent का signature दोबारा लेना होता है), और Revisional Round में जन्म, मृत्यु, visitor या नए household के हिसाब से सुधार होता है। काम "पूरा" mark करने के बाद बदलाव कैसे होगा, यह manual में साफ नहीं लिखा, इसलिए Mark as Complete से पहले सब कुछ एक बार और जाँच लें।',
        para: '6.1.3 (Revisional Round), 8.1, 8.2, 6.6.1। Mark as Complete के बाद के नियम manual में साफ नहीं',
      },
      {
        q: 'App में कोई problem आए (crash, hang, error message) तो?',
        a: 'अपने आप app बंद या uninstall न करें। Error message का screenshot सिर्फ अपने Supervisor या official contact को भेजें (social media पर नहीं), और उनके निर्देश का इंतज़ार करें। गिनती से पहले app का वह version update करा लें जो trainer बताएँ।',
        para: "Important Instructions 17, Don'ts (ii)। Screenshot वाली सलाह सामान्य",
      },
      {
        q: 'Supervisor की क्या ज़िम्मेदारियाँ हैं?',
        a: 'Enumerators की training और material पक्का करना, EB की boundary जाँचना, 20% records check करना, SE वाले records खास तौर पर देखना, coverage में कमी या दोहराव रोकना, houseless की पूरी गिनती पक्की करना, और सभी EB "पूरा" mark करवाना।',
        para: '2.3.1',
      },
      {
        q: 'Duty में स्वास्थ्य या सुरक्षा की problem हो तो?',
        a: 'तुरंत Supervisor और Charge Officer को बताएँ। अकेले अंधेरे या असुरक्षित इलाके में न जाएँ, और सर्दियों में शाम को देर तक काम न करें। आपकी सुरक्षा काम से पहले है।',
        para: 'Manual में नहीं (सामान्य सुझाव)',
      },
      {
        q: 'इस काम के लिए मानदेय या छुट्टी की क्या व्यवस्था है?',
        a: 'Manual में लिखा है कि यह काम कानूनी जिम्मेदारी है, पर Enumerator और Supervisor को भारत सरकार द्वारा तय उचित मानदेय (honorarium) दिया जाएगा। राशि और छुट्टी का नियम manual में नहीं लिखा। इसके लिए अपने department या Charge Officer के आदेश देखें।',
        para: '2.4.1',
      },
    ],
  },
  {
    heading: '6. App में काम कैसे करें (step by step)',
    items: [
      {
        q: 'App के home screen पर कौन-कौन से buttons हैं और हर एक का क्या काम है?',
        a: 'Manual के हिसाब से 8 buttons हैं। Household Entry: नया household शुरू करने के लिए। Update Data: Sync न हुए record को सुधारने के लिए, और complete (synced) तथा incomplete households की list देखने के लिए (यहाँ Edit और Delete दोनों हैं)। View Summary: भरे हुए households का summary देखने के लिए। Pending Summary: इसका मतलब manual में नहीं समझाया गया, इसलिए trainer से पूछ लें। Sync: सभी पूरे (completed) records को server पर भेजने के लिए। Mark as Complete: EB का काम पूरा mark करने के लिए। Houseless Enumeration: सिर्फ enumeration के आखिरी दिन की रात houseless लोगों के लिए। Revisional Round: 5 दिन के revisional round में बदलाव के लिए।',
        para: '6.1.3',
      },
      {
        q: 'काम शुरू करने से पहले app में क्या-क्या देखना और दबाना चाहिए?',
        a: 'Login के बाद पहले Location Particulars देखें (State, District, EB Number वगैरह) और पक्का करें कि ये आपके EB से मेल खाते हैं। फिर ऊपर दाएँ कोने में REFRESH दबाएँ, इससे आपके EB की सारी SE IDs download या update हो जाती हैं। उसके बाद नीचे "Start Population Enumeration" दबाएँ।',
        para: '6.1.3, 2.2.2 (vii), 9.3.2',
      },
      {
        q: 'शुरू में "Important Notice" वाली screen क्या है?',
        a: 'इसमें Enumerator की ज़िम्मेदारियाँ लिखी हैं: जवाब सच्चाई से लिखना (ठीक से न लिखने पर कानूनी जिम्मेदारी बनती है), बहस न करना, हर household से Self-Enumeration के बारे में पूछना, data किसी को न बताना, और respondent को बताना कि data गोपनीय है और इससे किसी सरकारी योजना की पात्रता पर असर नहीं पड़ता। इसे पढ़कर "I have read and understood" दबाना होता है।',
        para: '6.1.2',
      },
      {
        q: 'Next, Previous और Jump buttons का क्या मतलब है?',
        a: 'Next: जवाब भरकर अगली screen पर जाने के लिए। Previous: पिछली screen पर लौटने के लिए। Jump: किसी खास screen पर सीधे जाने के लिए। आगे बढ़ने से पहले screen पर भरा हुआ जवाब एक बार देख लें।',
        para: '6.1.3 (Some common buttons)',
      },
      {
        q: 'Household Entry में सही household कैसे ढूँढें?',
        a: 'Household Entry दबाने पर तीन तरीके से search हो सकता है: Head of Household (HOH) का नाम (शुरू के कुछ अक्षर डालें), Building Number, या Census House Number। मिलने पर बाकी details (Building No., Census House No., Household No., घर का उपयोग) अपने आप आ जाती हैं। AHL में जो लिखा है उससे मिलाकर देखें। फिर घर का Present Use, घर में अभी कितने members हैं, House Number और Locality/Hamlet भरें। Locality पहले भरी हो तो REPEAT चुनें, नई हो तो NEW।',
        para: '6.2.1, 6.2.2, 6.2.6',
      },
      {
        q: 'AHL वाला घर अब बदला हुआ मिले (खाली, टूटा, नया परिवार, नया head) तो app में क्या करें?',
        a: 'Manual में ऐसी स्थितियाँ दी हैं। परिवार घर छोड़ गया और घर खाली है: Present Use "vacant" करके Save। मकान अब नहीं है: "demolished" करके Save। पुराना परिवार गया और नया आ गया: Present Use "Residence" चुनें और नए head का नाम भरें। सिर्फ head बदला है: नया नाम भरें। घर का उपयोग बदल गया (जैसे residence से non-residential): Present Use बदलकर Save। Institution हो तो उसका छोटा description (जैसे Old-age Home, Hostel) भी लिखें।',
        para: '6.1.4 (Situation 1 से 6)',
      },
      {
        q: 'AHL में जो मकान या घर नहीं है, वह मिल जाए तो क्या करें?',
        a: 'नया Building हो तो NEW BN दबाकर Building Number लिखें। नया Census House हो तो NEW CH दबाएँ। नया Household हो तो NEW HH। नए Census House का नंबर 9001 से अपने आप बनता है। नए Building का नंबर पिछले Building के आधार पर देते हैं, जैसे 13 और 14 के बीच का नया मकान 13/1। यही तरीका HLO (Phase 1) में छूटे हुए मकानों पर भी लागू होता है।',
        para: '6.1.4 (Situation 7, 8), 6.2.3, 6.2.4, 6.2.5, 4.3.4',
      },
      {
        q: 'एक ही मकान में नया household आ गया या परिवार बँट गया हो तो?',
        a: 'पहले उस Census House का Present Use चुनें (Residence आदि), फिर NEW HH दबाकर इस नए household की details भरें। Type of HH अपने आप भर जाता है।',
        para: '6.1.4 (Situation 9), 6.2.6',
      },
      {
        q: 'Members की जानकारी भरने का सही क्रम क्या है?',
        a: 'पहले household में members की संख्या भरें, फिर हर member को Serial Number दें। सबसे पहले Head of Household का नाम आता है। पहले सब members के लिए Q1 से Q6 (नाम, रिश्ता, लिंग, जन्म तारीख और उम्र, शादी की स्थिति, शादी के समय उम्र) भरें। फिर "Enter Member details from Question 7" दबाकर हर member के बाकी सवाल एक-एक करके भरें। यह क्रम app में अपने आप चलता है।',
        para: '6.4.3, 6.5.1, 6.5.2, 6.5.3, 6.5.27',
      },
      {
        q: 'किसी member को गलती से जोड़ दिया या उसकी जानकारी गलत भर गई तो?',
        a: 'हर member के सामने Delete और Edit icon होते हैं। गलती से जुड़ा member Delete icon से हटाएँ, गलत जानकारी Edit icon से ठीक करें। जब सही हो तो Forward दबाकर आगे बढ़ें। Revisional Round में किसी की मृत्यु होने पर भी उसकी details इसी तरह delete की जाती हैं।',
        para: '6.5.1 (Delete icon), 6.5.27, 8.2 (v)',
      },
      {
        q: 'Self-Enumeration (SE ID) app में कैसे डालें?',
        a: 'पूछें: "क्या आपके household ने Self-Enumeration की है?" Yes हो तो SE ID डालें और Next दबाएँ। ID 11 अंकों की होती है और शुरू में "P" लगता है। इसे बहुत ध्यान से डालें, क्योंकि manual के अनुसार गलत ID डालने पर उस household का data खो सकता है। No हो तो Next दबाकर सब members की जानकारी खुद भरें। SE वाले household में data मिलान करके summary देखें, पुष्टि कराएँ और submit करें।',
        para: '6.4.2, 6.4.3',
      },
      {
        q: 'SE ID मेरे app में दिख नहीं रही, क्या करें?',
        a: 'App में sign in करते समय SE IDs अपने आप download हो जाती हैं। न हुई हों तो home screen पर ऊपर दाएँ REFRESH दबाएँ। फिर भी न मिले तो Supervisor से बात करें।',
        para: '2.2.2 (vii), 6.1.3, 9.3.2',
      },
      {
        q: 'Respondent कौन होता है और app में किसे चुनना है?',
        a: 'सब members की जानकारी भरने के बाद app में respondent का नाम चुनें। यह वह मुख्य व्यक्ति होता है जिससे आपने ज्यादातर जानकारी ली है और जो उस household का सामान्य निवासी (normal resident) हो। एक से ज्यादा respondent हों तो उनमें से जो बड़े हों, उनका नाम लें।',
        para: '6.5.213',
      },
      {
        q: 'Signature कब और कैसे लेना है?',
        a: 'सब सवाल भरने के बाद respondent को app पर summary दिखाएँ और उसके बाद हस्ताक्षर करवाएँ। इससे respondent यह मानता है कि आपने उसके परिवार की जानकारी वैसे ही लिखी है जैसी उसने बताई। पढ़ा-लिखा हो तो वही अपने नाम से signature करे। न कर पाए तो उसी household का कोई दूसरा member कर सकता है (उसका नाम भी लिखा जाए)। घर में कोई और न हो तो "nobody available sign" लिखें। respondent मना कर दे तो "refused" लिखें। बहुत ही खास और असामान्य स्थिति में signature लेना ठीक न लगे तो कारण लिखें और Supervisor तथा Charge Officer को तुरंत बताकर special report दें। आखिर में आप एक confirmation box tick करके खुद भी signature करते हैं।',
        para: '6.5.213 से 6.5.217',
      },
      {
        q: 'क्या signature के बिना अगला household नहीं भर सकते? क्या incomplete household बाद में पूरा किया जा सकता है?',
        a: 'Manual में ऐसा कोई नियम नहीं लिखा कि पिछले household का signature हुए बिना नया household शुरू नहीं हो सकता। Manual के मुताबिक Update Data में complete और incomplete दोनों तरह के households की list दिखती है, जहाँ उन्हें edit या delete कर सकते हैं। Manual में "draft" शब्द का इस्तेमाल नहीं है। आपके app version में असल व्यवहार कुछ अलग हो सकता है। इसलिए अपने field trainer से पूछकर या app में आज़माकर पक्का कर लें।',
        para: '6.5.214 से 6.5.217, 6.1.3 (Update Data)। ऐसा कोई नियम manual में नहीं मिला',
      },
      {
        q: '"Pending Summary" क्या दिखाता है?',
        a: 'Manual में इस button का सिर्फ नाम है, इसका काम समझाया नहीं गया है। अंदाज़े से कोई मतलब न निकालें। इसे अपने trainer से पूछकर या training में app चलाकर समझें।',
        para: '6.1.3 (सिर्फ button का नाम, काम नहीं समझाया)',
      },
      {
        q: 'View Summary कब देखें और इसका क्या इस्तेमाल है?',
        a: 'हर household को Sync करने से पहले उसका summary देख लें, ताकि जानकारी सही और पूरी हो। View Summary में कुल आबादी, आबाद रहने वाले मकानों और households की गिनती भी मिलती है। काम पूरा होने पर इन्हीं संख्याओं को AHL के खंड 5 में लिखना होता है।',
        para: '6.1.3, 2.2.2 (viii), 5.4.7',
      },
      {
        q: 'Update Data में क्या-क्या कर सकते हैं?',
        a: 'Sync न हुआ record खोलकर सुधार सकते हैं। यहाँ complete (synced) और incomplete दोनों households की list दिखती है और Edit या Delete का option मिलता है। Sync हो चुके record में बदलाव करने के बाद respondent को दोबारा दिखाकर signature लें और फिर Sync करें।',
        para: '6.1.3 (Update Data), 6.6.1',
      },
      {
        q: 'Sync दबाने पर क्या होता है?',
        a: 'Sync सारे पूरे (completed) records को central server पर भेज देता है। हर household का summary Sync से पहले देख लें। EB का काम पूरा होने पर Sync के बाद confirmation का box tick करें, signature करें और SAVE दबाएँ। Manual सलाह देती है कि हर 5–6 households के बाद Sync करें, ताकि data खोने का डर न रहे।',
        para: "6.1.3 (Sync), Do's (ix), (x), 2.2.2 (viii), (ix)",
      },
      {
        q: 'Sync नहीं हो रहा या app में technical glitch आए तो?',
        a: 'Manual कहता है कि धैर्य और शांति रखें और अपने Supervisor, Field Trainer या Charge Officer से मदद लें। आप अपने district के helpdesk (DCO) से भी बात कर सकते हैं। App uninstall न करें। Network मिलने पर दोबारा Sync करें। Data आपके फोन में रहता है।',
        para: "Important Instructions 17, Do's (viii), Don'ts (ii)",
      },
      {
        q: 'मुझे फोन बदलना पड़े तो unsynced data का क्या होगा?',
        a: 'नए फोन पर register करते ही पुराना फोन अपने आप deregister हो जाता है, और उसके बाद पुराने फोन से Sync नहीं हो सकता। इसलिए फोन बदलने से पहले पूरा data Sync कर लें। Manual की सलाह है कि फोन बिना जरूरत के न बदलें। इससे data loss और Sync की ज्यादातर दिक्कतें बचती हैं।',
        para: "Important Instructions 19, Don'ts (iii)",
      },
      {
        q: 'App uninstall करना ही पड़े तो unsynced data बचाने का क्या तरीका है?',
        a: 'Manual के अनुसार uninstall से पहले जो data Sync नहीं हुआ, उसे कागज़ या writing pad पर लिख लें। बाद में उसे app में दोबारा भर सकते हैं, लेकिन तब आपको उन्हीं घरों में दोबारा जाकर respondent का signature फिर से लेना पड़ेगा। इसलिए uninstall से पहले हमेशा Supervisor से पूछ लें।',
        para: 'Important Instructions 18',
      },
      {
        q: 'Mark as Complete कब दबाना है?',
        a: 'पहले पक्का करें कि आपके EB के हर Building, Census House और Household का काम हो चुका है और सारा data Sync हो गया है। उसके बाद Mark as Complete दबाएँ, फिर confirmation box tick करके signature करें और SAVE दबाएँ। इसके बाद Supervisor को बताएँ। Mark as Complete के बाद बदलाव कैसे होंगे, यह manual में साफ नहीं लिखा, इसलिए जल्दबाज़ी न करें।',
        para: "6.1.3 (Mark as Complete), 2.2.3 (ii), Do's (x), 2.3.1 (vii)",
      },
      {
        q: 'Supervisor को मेरे record में गलती मिली तो क्या होगा?',
        a: 'Supervisor अपने module में लगभग 20% records देखता है और गड़बड़ी लगे तो आपके साथ उस घर जाकर दोबारा पूछता है। Synced record में बदलाव जरूरी हो तो आप Update Data से वही item ठीक करते हैं, respondent की signature दोबारा लेते हैं, और Supervisor सब जाँचकर अपनी signature करके Sync करता है। Manual की सामान्य सलाह यह भी है कि अगर record गलत पाया गया तो पूरा record दोबारा भरना पड़ सकता है। इसलिए पहली बार में ही सही भरें।',
        para: '6.6.1, Important Instructions 21',
      },
      {
        q: 'Revisional Round में app में क्या-क्या करना होता है?',
        a: 'इन 5 दिनों में आपको EB के हर household पर फिर जाना होता है। 00:00 बजे (reference date) से पहले जो नया जन्म हुआ हो, उसे दर्ज करें और माँ के Q31–33 के जवाब भी ठीक करें। जो मृत्यु हुई हो, उस व्यक्ति के Q1 से Q40 वाले जवाब delete करें। नए आए visitor या नए household को enumerate करें। हर बदलाव का कारण drop-down से चुनें, और AHL में कारण तथा दोबारा जाने की तारीख लिखें। इसके लिए home screen पर "Revisional Round" button है।',
        para: '8.1, 8.2, 1.3.3, 6.1.3 (Revisional Round)',
      },
    ],
  },
];

export default function CensusFaqPage() {
  void incrementPageView(PATH);
  return (
    <div className="mx-auto max-w-[820px] px-4">
      <article className="py-10">
        <JsonLd
          data={{
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: SECTIONS.flatMap((s) => s.items).map((item) => ({
              '@type': 'Question',
              name: item.q,
              acceptedAnswer: { '@type': 'Answer', text: item.a },
            })),
          }}
        />
        <CensusSubNav active="/census-2027/faq" />
        <h1 className="font-serif text-3xl font-semibold text-ink mb-1">Enumerator FAQ – Census 2027</h1>
        <p className="text-ink/80 leading-relaxed max-w-prose mt-3">
          कुल {SECTIONS.reduce((n, s) => n + s.items.length, 0)} सवाल, 6 सेक्शन में। हर जवाब के नीचे Enumerator
          Instruction Manual का वह para नंबर है जिससे वह जवाब लिया गया है।
        </p>
        <div className="bg-[#fff7e0] border border-[#e5c76b] rounded-lg px-4 py-3 my-4 text-sm text-ink/80">
          जहाँ para में &ldquo;manual में नहीं&rdquo; या &ldquo;सामान्य सुझाव&rdquo; लिखा है, वह जानकारी manual से नहीं, public
          announcement या सामान्य सलाह से है। पक्की पुष्टि के लिए trainer या Charge Officer से पूछें।
        </div>

        {SECTIONS.map((section) => (
          <div key={section.heading}>
            <h2 className="font-serif text-xl font-semibold text-ink mt-8 mb-3 sticky top-0 bg-paper py-1 border-b border-rule">
              {section.heading}
            </h2>
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
          </div>
        ))}

        <h2 className="font-serif text-xl font-semibold text-ink mt-10 mb-3 border-b border-rule pb-1">
          40 सवालों की पूरी सूची (Household Schedule)
        </h2>
        <p className="text-sm text-ink/70 mb-3 max-w-prose">
          ऊपर के FAQ हमारे Manual-summary पर आधारित हैं। यह सूची अलग और ज़्यादा पुख्ता स्रोत — खुद Household Schedule की Gazette
          अधिसूचना — से ली गई है, और हर member के लिए पूछे जाने वाले सभी 40 सवाल क्रम में देती है।
        </p>
        <div className="border-t border-rule">
          {SCHEDULE_QUESTIONS.map((item) => (
            <div key={item.no} className="border-b border-rule py-2 flex gap-3 text-sm">
              <span className="text-ink/40 font-mono w-8 shrink-0">{item.no}.</span>
              <span className="text-ink/85">{item.q}</span>
            </div>
          ))}
        </div>
        <p className="text-xs text-ink/50 mt-3 max-w-prose">
          स्रोत: Household Schedule, The Gazette of India, Extraordinary, 14 अगस्त 2026। कुछ सवाल (जैसे 23, 24, 31-33) सिर्फ
          उन्हीं members पर लागू होते हैं जिन पर वे सवाल लागू हों; ऐसा app में सवाल भरते समय अपने आप तय हो जाता है।
        </p>

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
