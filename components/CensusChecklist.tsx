'use client';

import { useEffect, useState } from 'react';

type Section = { heading: string; items: string[] };

const SECTIONS: Section[] = [
  {
    heading: 'शुरू करने से पहले',
    items: [
      'Training पूरी की और Enumerator Manual मिल गया',
      'ID card, छपी हुई AHL (Abridged Houselist) और EB का map मिल गए',
      'अपने EB की सीमा (boundary) map से समझ ली, कोई गड़बड़ी लगी तो Supervisor को बताई',
      'फोन की जाँच: Android 13 या ऊपर / iOS 15 या ऊपर, लगभग 8 GB RAM, storage खाली',
      '"Census 2027 – PE" app सही जगह से install किया',
      'Registration हो गया (User ID → OTP → password → phone PIN)',
      'App की भाषा सोच-समझकर चुनी, बाद में बदली नहीं जा सकती',
      'Password और PIN सुरक्षित रखे हैं, किसी को नहीं बताए',
      'Houseless (बेघर) लोगों वाली जगहों की अपने EB में पहले से list बना ली',
      'Supervisor और Charge Officer का नंबर फोन में save है',
    ],
  },
  {
    heading: 'हर घर पर (हर household के लिए)',
    items: [
      'अपने EB के क्रम से अगला घर चुना (कोई घर छूटे नहीं, दोबारा न आए)',
      'नम्रता से परिचय दिया, ID दिखाई, बताया कि जानकारी गोपनीय रहेगी',
      'पूछा कि परिवार ने Self-Enumeration (SE) की है या नहीं',
      'SE हुआ है तो SE ID (11 अंक, "P" से शुरू) लेकर data खोला और सब verify किया',
      'SE नहीं हुआ तो सभी members की जानकारी 40 questions के हिसाब से पूछकर भरी',
      'Questions सरल भाषा में दोहराए, लेकिन जवाब का सुझाव नहीं दिया और अंदाज़े से नहीं भरा',
      'नाम की spelling respondent से पूछकर लिखी',
      'उम्र और जन्म तारीख का मेल खाया (app खुद check करता है)',
      'सब members की entry के बाद summary respondent को दिखाई और पढ़कर सुनाई',
      'गलती थी तो वहीं ठीक की',
      'Respondent की सहमति और signature लिए',
      'घर पर कोई नहीं था तो अपने note में लिखा और अलग समय पर दोबारा जाने का समय तय किया',
      'हर 5–6 households के बाद Sync किया',
      'जानकारी किसी से share नहीं की, कोई photo या screenshot नहीं लिया',
    ],
  },
  {
    heading: 'दिन के आखिर में',
    items: ['आज का पूरा data Sync किया', 'कल के लिए बचे हुए घरों की list बनाई', 'फोन charge पर लगाया, power bank भरा'],
  },
  {
    heading: 'काम पूरा होने पर',
    items: [
      'अपने EB की हर building, मकान और household तक पहुँच गए',
      'Houseless लोगों की गिनती आखिरी रात reference date के 00:00 से पहले कर ली',
      'सारा data Sync हो गया',
      '"View Summary" से कुल आबादी, आबाद रहने वाले मकान और households की संख्या AHL के खंड 5 में लिखी',
      'App में काम पूरा होने का box tick किया, signature किए और Save किया',
      'AHL के खंड 6 (पूरी coverage का certificate) ध्यान से पढ़कर बड़े अक्षरों में नाम, signature और तारीख भरी',
      'AHL और layout map की दो copies Supervisor को दीं',
      'इस्तेमाल किए और न किए दोनों paper schedules वापस किए (अगर मिले थे)',
      'Paper में data लिया था तो तय तारीख तक web portal पर enter करवाया',
    ],
  },
  {
    heading: 'Supervisor के लिए',
    items: [
      'सभी Enumerators की training पूरी हुई और material मिला',
      'हर EB की boundary Enumerator के साथ जाँची, बदलाव हो तो Charge Officer को बताया',
      'Supervisor module में हर EB के लगभग 20% records random जाँचे',
      'गड़बड़ी मिली तो Enumerator के साथ घर जाकर फिर से verify किया',
      'सुधार "Update Data" से हुआ, respondent के signature दोबारा लिए गए, फिर Supervisor ने signature करके Sync किया',
      'Self-Enumeration वाले records खास तौर पर देखे',
      'कोई इलाका छूटा या दो EB में दोहराया नहीं; Houseless लोगों की पूरी गिनती हुई',
      'Paper में लिया गया data portal पर समय से डाला गया',
      'सभी EB "पूरा" mark हो गए',
    ],
  },
];

const STORAGE_KEY = 'census2027-checklist-v1';

export default function CensusChecklist() {
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
      setChecked(saved);
    } catch {
      // ignore (private browsing, cleared storage, etc.)
    }
    setHydrated(true);
  }, []);

  function toggle(id: string) {
    setChecked((prev) => {
      const next = { ...prev, [id]: !prev[id] };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {
        // ignore
      }
      return next;
    });
  }

  function reset() {
    setChecked({});
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
  }

  return (
    <div>
      <p className="print:hidden flex flex-wrap gap-3 mb-4">
        <button
          type="button"
          onClick={reset}
          className="inline-block bg-maroon text-white px-4 py-2 rounded-lg text-sm font-semibold"
        >
          सब tick हटाएँ
        </button>
        <button
          type="button"
          onClick={() => window.print()}
          className="inline-block bg-maroon text-white px-4 py-2 rounded-lg text-sm font-semibold"
        >
          Print करें
        </button>
      </p>
      {SECTIONS.map((section, si) => (
        <div key={section.heading}>
          <h2 className="font-serif text-xl font-semibold text-ink mt-8 mb-3">{section.heading}</h2>
          <ul className="list-none pl-0">
            {section.items.map((item, ii) => {
              const id = `c${si}-${ii}`;
              const isChecked = hydrated && !!checked[id];
              return (
                <li key={id} className="flex items-start gap-3 py-2 border-b border-dashed border-rule">
                  <input
                    type="checkbox"
                    id={id}
                    checked={isChecked}
                    onChange={() => toggle(id)}
                    className="mt-1.5 w-5 h-5 shrink-0"
                  />
                  <label htmlFor={id} className={isChecked ? 'cursor-pointer text-ink/50 line-through' : 'cursor-pointer text-ink/80'}>
                    {item}
                  </label>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </div>
  );
}
