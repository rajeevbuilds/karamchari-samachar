import Link from 'next/link';
import CensusSubNav from '@/components/CensusSubNav';
import { SITE_NAME } from '@/lib/site';

const PATH = '/census-2027/app-guide';
const TITLE = 'PE App Guide – Census 2027: Registration और रोज़ का इस्तेमाल';
const DESCRIPTION = 'Census 2027 PE app: फोन की जरूरतें, registration के steps, OTP, sync और काम पूरा करने की आसान हिंदी guide।';

export const metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: PATH },
  openGraph: { type: 'article', siteName: SITE_NAME, locale: 'hi_IN', url: PATH, title: TITLE, description: DESCRIPTION },
  twitter: { card: 'summary', title: TITLE, description: DESCRIPTION },
};

const h2 = 'font-serif text-xl font-semibold text-ink mt-8 mb-3';
const h3 = 'font-serif text-lg font-semibold text-ink mt-5 mb-2';
const ul = 'list-disc pl-5 flex flex-col gap-2 text-ink/80 leading-relaxed max-w-prose';
const ol = 'list-decimal pl-5 flex flex-col gap-2 text-ink/80 leading-relaxed max-w-prose';

export default function CensusAppGuidePage() {
  return (
    <div className="mx-auto max-w-[820px] px-4">
      <article className="py-10">
        <CensusSubNav active="/census-2027/app-guide" />
        <h1 className="font-serif text-3xl font-semibold text-ink mb-1">PE App Guide – Census 2027</h1>
        <p className="text-ink/80 leading-relaxed max-w-prose mt-3">
          फोन पर &ldquo;Census 2027 – PE&rdquo; app चलाने और registration करने की step-by-step guide। Manual में app version
          1.0.17 दिया गया है; आपका version अलग हो सकता है।
        </p>

        <h2 className={h2}>1. फोन की तैयारी</h2>
        <h3 className={h3}>फोन में क्या चाहिए (Manual के अनुसार)</h3>
        <ul className={ul}>
          <li>Android 13 या उससे ऊपर, या iOS 15 या उससे ऊपर</li>
          <li>लगभग 8 GB RAM</li>
          <li>फोन में storage खाली और battery पूरी</li>
          <li>वही SIM और मोबाइल नंबर जो registration में दिया है (OTP इसी पर आएगा)</li>
        </ul>
        <p className="text-ink/80 max-w-prose"><strong>App:</strong> &ldquo;Census 2027 – PE&rdquo; (package name: com.census.peproduction)</p>
        <h3 className={h3}>जरूरी सावधानियाँ</h3>
        <ul className={ul}>
          <li>एक user के लिए एक ही फोन। नए फोन पर login करने से पुराना फोन बंद (deregister) हो जाता है।</li>
          <li>App का clone या dual app न चलाएँ।</li>
          <li>काम के बीच में app uninstall या दोबारा install न करें।</li>
          <li>Download कहाँ से करना है, यह अपने trainer से पक्का करें। नकली apps से बचें।</li>
          <li>अगर फोन इन शर्तों पर खरा नहीं उतरता, तो पहले ही Supervisor को बताएँ।</li>
        </ul>

        <h2 className={h2}>2. Registration के steps</h2>
        <ol className={ol}>
          <li>App खोलें और भाषा चुनें। <strong>ध्यान रखें:</strong> भाषा बाद में बदली नहीं जा सकती।</li>
          <li>अपना <strong>User ID</strong> और स्क्रीन पर दिखने वाला <strong>captcha</strong> डालें।</li>
          <li><strong>Register</strong> दबाएँ।</li>
          <li>आपके पंजीकृत मोबाइल नंबर पर <strong>OTP</strong> आएगा। उसे डालकर <strong>Verify</strong> करें।</li>
          <li>अपना <strong>password</strong> बनाएँ। पहली बार login पर password बदलना पड़ता है।</li>
          <li>फोन का <strong>PIN</strong> set करें।</li>
          <li>पूरा होने पर login करके अपना EB खोलें।</li>
        </ol>
        <h3 className={h3}>OTP नहीं आए तो</h3>
        <ul className={ul}>
          <li>Network और signal देखें।</li>
          <li>सही SIM वाला फोन है या नहीं, देखें।</li>
          <li>बार-बार तुरंत न दबाएँ, थोड़ी देर बाद फिर try करें।</li>
          <li>फिर भी न आए तो Supervisor से बात करें।</li>
        </ul>
        <p className="text-ink/80 max-w-prose">
          <strong>Password या PIN भूल गए तो:</strong> Password के लिए app में reset का option है। बाकी मदद के लिए Supervisor से
          मिलें। Password और PIN किसी को न बताएँ।
        </p>

        <h2 className={h2}>3. रोज़ app कैसे इस्तेमाल करें</h2>
        <h3 className={h3}>सुबह निकलने से पहले</h3>
        <ul className={ul}>
          <li>फोन पूरा charge करें और power bank साथ रखें।</li>
          <li>फालतू apps बंद रखें और storage खाली रखें।</li>
          <li>सर्दियों में फोन जेब में रखें, ठंड से battery जल्दी उतरती है।</li>
        </ul>
        <h3 className={h3}>हर घर पर</h3>
        <ul className={ul}>
          <li>AHL के क्रम से अगला household खोलें।</li>
          <li>
            अगर परिवार ने Self-Enumeration (SE) की है, तो उनकी SE ID (11 अंक, &ldquo;P&rdquo; से शुरू) से उनका भरा हुआ data खोलें,
            सब verify करें और कमी हो तो सुधारें।
          </li>
          <li>परिवार के हर member की जानकारी app में भरें (40 questions)। App खुद अगला सवाल दिखाता है।</li>
          <li>सब भरने के बाद summary respondent को दिखाएँ और पढ़कर सुनाएँ, फिर signature लें।</li>
        </ul>
        <h3 className={h3}>Sync (बहुत जरूरी)</h3>
        <ul className={ul}>
          <li>हर 5–6 households के बाद Sync करें, और दिन के आखिर में भी।</li>
          <li>Network नहीं मिला तो जहाँ मिले वहाँ Sync कर लें।</li>
          <li>इससे फोन खो जाए या खराब हो जाए तो भी data सुरक्षित रहता है।</li>
        </ul>
        <h3 className={h3}>गलती सुधारना</h3>
        <ul className={ul}>
          <li>Sync से पहले: record खोलकर सीधा बदलें।</li>
          <li>Sync के बाद: &ldquo;Update Data&rdquo; से बदलें, respondent की signature दोबारा लें, फिर Sync करें।</li>
        </ul>
        <h3 className={h3}>काम पूरा होने पर</h3>
        <ul className={ul}>
          <li>सारा data Sync करें।</li>
          <li>&ldquo;View Summary&rdquo; से आबादी, आबाद रहने वाले मकान और households की संख्या देखकर AHL के खंड 5 में लिखें।</li>
          <li>Sync के बाद काम पूरा होने का box tick करें, signature करें और Save करें। फिर Supervisor को बताएँ।</li>
        </ul>
        <h3 className={h3}>कोई problem आए (crash, error, hang) तो</h3>
        <ul className={ul}>
          <li>App uninstall या बंद न करें।</li>
          <li>Error message का screenshot सिर्फ Supervisor या official contact को भेजें, social media पर नहीं।</li>
          <li>Helpline: 1855 (toll-free)। यह नंबर अपने training material से भी मिला लें।</li>
        </ul>

        <div className="bg-[#fff7e0] border border-[#e5c76b] rounded-lg px-4 py-3 my-4 text-sm text-ink/80">
          अंतिम नियमों के लिए trainer या Charge Officer की पुष्टि मान्य है।
        </div>
        <div className="flex justify-between gap-3 flex-wrap mt-6">
          <Link href="/census-2027/checklist" className="text-maroon hover:underline">← Checklist</Link>
          <Link href="/census-2027/faq" className="text-maroon hover:underline">FAQ →</Link>
        </div>

        <p className="text-xs text-ink/50 mt-8 max-w-prose border-t border-rule pt-4">
          यह पेज सरकारी नहीं है। यह Enumerator Instruction Manual के हमारे अपने summary पर आधारित है। अंतिम नियम और तारीखें अपने
          trainer या Charge Officer से पक्की करें।
        </p>
      </article>
    </div>
  );
}
