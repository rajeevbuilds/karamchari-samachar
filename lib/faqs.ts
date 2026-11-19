// Questions and answers shown under each calculator and on the topic pages. Each
// set is also sent to Google as structured data, so the questions can appear
// in search results. Keep the answers short and factual, and in line with what
// the calculators themselves do.

export type Faq = { q: string; a: string };

export const FAQS: Record<string, Faq[]> = {
  '/calculators/pension-ops': [
    {
      q: 'Which pension rules does this calculator follow?',
      a: 'It follows the Old Pension Scheme under the CCS (Pension) Rules, 1972, which applies to central government employees appointed before 1 January 2004.',
    },
    {
      q: 'What do I need to enter to estimate my pension?',
      a: 'Your last drawn Basic Pay and your qualifying service. The calculator then shows an instant estimate of your monthly pension.',
    },
    {
      q: 'Is Dearness Relief included?',
      a: 'Dearness Relief (DR) is revised twice a year and added to the basic pension. The calculator starts with the current DR rate saved on this site, which you can change.',
    },
    {
      q: 'Is the result official?',
      a: 'No. It is an estimate for planning. Your actual pension is fixed in your Pension Payment Order (PPO), so confirm the figures with your accounts office.',
    },
  ],
  '/calculators/gratuity': [
    {
      q: 'What is the maximum gratuity for central government employees?',
      a: 'The ceiling used by this calculator is ₹25 lakh, as set under the CCS Pension Rules, 2021. It is stored in the site settings so it can be updated if the government revises it.',
    },
    {
      q: 'What do I enter in the gratuity calculator?',
      a: 'Your Basic Pay, the DA rate and your qualifying service. It gives an instant estimate for retirement gratuity or death gratuity.',
    },
    {
      q: 'Does it work for both retirement and death gratuity?',
      a: 'Yes. The calculator estimates both, using the CCS Pension Rules, 2021.',
    },
    {
      q: 'Is the result official?',
      a: 'No. It is an estimate. Your department calculates the final amount, so confirm it with your accounts office.',
    },
  ],
  '/calculators/nps': [
    {
      q: 'What does the NPS and UPS calculator do?',
      a: 'It projects your NPS corpus and monthly pension at retirement, works out your UPS assured payout, and compares the two on your own figures.',
    },
    {
      q: 'How is the UPS assured payout worked out?',
      a: 'The calculator uses 50% of the average Basic Pay of the last 12 months of service, for 25 years of qualifying service. It is reduced in proportion for shorter service, has a minimum of ₹10,000 a month, and needs at least 10 years of service.',
    },
    {
      q: 'Are NPS returns guaranteed?',
      a: 'No. NPS returns depend on the market. You can choose the yearly return you expect in the calculator. We suggest 8%, which is a little below the recent 5 and 10-year returns of the Central Government scheme.',
    },
    {
      q: 'Is the result official?',
      a: 'No. It is a projection from the assumptions you choose, meant for planning only.',
    },
  ],
  '/calculators/pay-fixation': [
    {
      q: 'What does the pay fixation calculator work out?',
      a: 'Your new Basic Pay on promotion or on MACP upgradation, under the 7th CPC Pay Matrix, step by step, with your next increments.',
    },
    {
      q: 'Who can use it?',
      a: 'Central Government employees and Railway employees whose pay is in the 7th CPC Pay Matrix.',
    },
    {
      q: 'What is MACP?',
      a: 'The Modified Assured Career Progression scheme gives a financial upgradation at 10, 20 and 30 years of service to employees who have not been promoted.',
    },
    {
      q: 'Is the result official?',
      a: 'No. It is an estimate. Your pay fixation is finalised by your office, so confirm it with your accounts section.',
    },
  ],
  '/calculators/retirement-benefits': [
    {
      q: 'What does this calculator cover?',
      a: 'It estimates your monthly pension, gratuity, leave encashment and commutation on one printable page, and lets you check the figures on your Pension Payment Order (PPO).',
    },
    {
      q: 'Who is it for?',
      a: 'Central Government and Railway employees and pensioners under the Old Pension Scheme, that is, appointed before 1 January 2004.',
    },
    {
      q: 'What is commutation of pension?',
      a: 'Commutation means taking part of your pension as a lump sum at retirement, up to 40% of it. Your monthly pension is reduced by the commuted part.',
    },
    {
      q: 'Is the result official?',
      a: 'No. It is an estimate. Check your final figures with your accounts office and your PPO.',
    },
  ],
  '/calculators/8th-pay-commission': [
    {
      q: 'What is the fitment factor?',
      a: 'The fitment factor is the number by which your present Basic Pay is multiplied to get your new Basic Pay. In the 7th Pay Commission it was 2.57.',
    },
    {
      q: 'What fitment factors can I try in this calculator?',
      a: 'Any value from 1.50 to 3.00. The 8th Pay Commission has not reported, so the figure is your own assumption.',
    },
    {
      q: 'Does it calculate arrears?',
      a: 'Yes. It estimates arrears from 1 January 2026 to the notification date you choose. You can change that date.',
    },
    {
      q: 'Is this the real 8th Pay Commission salary?',
      a: 'No. It is an estimate only. The Commission has not reported, and the government will decide the final pay.',
    },
  ],
};

// Questions for the two topic pages.
export const DA_FAQS: Faq[] = [
  {
    q: 'What is Dearness Allowance (DA)?',
    a: 'Dearness Allowance is an amount paid on top of basic pay to central government employees to offset the rise in the cost of living. For pensioners, the same rate is paid as Dearness Relief (DR).',
  },
  {
    q: 'How is DA calculated?',
    a: 'DA is a percentage of your Basic Pay. For example, at a DA rate of 50%, an employee with a Basic Pay of ₹40,000 gets ₹20,000 as DA.',
  },
  {
    q: 'How often is DA revised?',
    a: 'DA is revised twice a year, with effect from 1 January and 1 July. The government usually announces each revision some weeks after its effective date, and pays the difference as arrears.',
  },
  {
    q: 'Is DA the same for pensioners?',
    a: 'Pensioners receive Dearness Relief (DR) at the same rate as DA, on their basic pension.',
  },
];

export const CPC8_FAQS: Faq[] = [
  {
    q: 'What is the 8th Pay Commission?',
    a: 'It is the Central Pay Commission that reviews the pay, allowances and pensions of central government employees and pensioners. It was notified on 3 November 2025 and has 18 months to give its recommendations, which means about May 2027.',
  },
  {
    q: 'What is the fitment factor?',
    a: 'The fitment factor is the number by which your present Basic Pay is multiplied to get your new Basic Pay. In the 7th Pay Commission it was 2.57. The 8th Pay Commission has not announced its figure.',
  },
  {
    q: 'How can I estimate my salary under the 8th Pay Commission?',
    a: 'Use the 8th Pay Commission Salary Calculator on this site. Enter your Basic Pay, Pay Level and city, choose a fitment factor, and see your estimated new pay and arrears. It is an estimate only.',
  },
  {
    q: 'What happens to DA when a new Pay Commission starts?',
    a: 'With the 7th Pay Commission, DA started again from zero because the earlier DA was absorbed into the new basic pay. Our 8th Pay Commission calculator makes the same assumption. The government will decide the actual treatment.',
  },
];

// Questions for the railway transfer guide (/guides/railway-transfer).
export const TRANSFER_FAQS: Faq[] = [
  {
    q: 'रिक्वेस्ट ट्रांसफर में मेरी सीनियरिटी का क्या होता है?',
    a: 'अगर आप उसी सीनियरिटी यूनिट में ट्रांसफर लेते हैं, तो मास्टर सर्कुलर 24 (पैरा 7.1) के अनुसार आपकी सीनियरिटी नहीं जाती। दूसरी सीनियरिटी यूनिट/रेलवे में अनुरोध पर तबादले के लिए कम से कम 5 साल की सेवा जरूरी है (कुछ छूट के साथ), यह मास्टर सर्कुलर 24 के पैरा 7.3 और 13.2 में है। दूसरी यूनिट में सीनियरिटी किस क्रम में मिलेगी, इसका ब्योरा मास्टर सर्कुलर 24 में हमें साफ-साफ नहीं मिला; इसे अपनी कार्मिक शाखा से पक्का कर लें।',
  },
  {
    q: 'दूसरी रेलवे/डिवीजन में अनुरोध पर तबादले के लिए न्यूनतम सेवा कितनी चाहिए?',
    a: 'मास्टर सर्कुलर 24 (17.08.2023, पैरा 7.3 और 13.2) के अनुसार इंटर-रेलवे/इंटर-डिवीजन अनुरोध तबादले के लिए रेलवे में शामिल होने से कम से कम 5 साल (प्रोबेशन/ट्रेनिंग सहित) पूरे होने जरूरी हैं। म्यूचुअल तबादला, पति-पत्नी के आधार पर तबादला, दिव्यांग बच्चे की देखभाल, खुद दिव्यांग होने, और अनुकंपा नियुक्ति पाई विधवाओं के मामलों में यह शर्त लागू नहीं होती। 15 अगस्त 2022 से ऐसे सभी आवेदन सिर्फ HRMS के ट्रांसफर मॉड्यूल से लिए जाते हैं।',
  },
  {
    q: 'म्यूचुअल (आपसी) ट्रांसफर के लिए किसकी मंजूरी चाहिए?',
    a: 'RBE 8/2019 (11.01.2019) के पैरा 3 के अनुसार मंडल के नियंत्रण वाले पदों के लिए DRM, वर्कशॉप के पदों के लिए CWM, और मुख्यालय के नियंत्रण वाले पदों के लिए GM या उनके द्वारा अधिकृत कोई निचला अधिकारी।',
  },
  {
    q: 'क्या लेवल-1 के कर्मचारी दूसरे कैडर या विभाग के कर्मचारी से जगह बदल सकते हैं?',
    a: 'हाँ। RBE 99/2018 के अनुसार लेवल-1 के कर्मचारी “तदनुरूपी कैडर” की शर्त के बिना अलग-अलग कैडर/विभाग में भी आपस में जगह बदल सकते हैं, बशर्ते मेडिकल स्टैंडर्ड पूरा हो; यह सिर्फ पारस्परिक आदान-प्रदान तबादलों के लिए है। RBE 67/2025 (08.07.2025) के अनुसार इसके लिए मंडल या रेलवे बदलना भी जरूरी नहीं।',
  },
  {
    q: '20 साल से अधिक सेवा वालों के अपने अनुरोध पर तबादले में क्या अलग है?',
    a: 'RBE 61/2026 (22.07.2026) के अनुसार ऐसे अराजपत्रित कर्मचारियों के लिए HRMS हर महीने की पहली तारीख को अलग प्राथमिकता सूची बनाता है, जिसमें नियमित सेवा के वर्ष ज्यादा वाले ऊपर रहते हैं। तबादला आदेश खाली पदों के अनुसार HRMS पर अपने आप जारी होते हैं और स्वीकार करने वाली इकाई का NOC नहीं लगता। यह सिर्फ जगह बदलने के लिए है, श्रेणी या विभाग बदलने के लिए नहीं। 20 साल से कम सेवा वालों के लिए पुरानी व्यवस्था जारी है।',
  },
  {
    q: 'SBRT में तबादला आदेश मिलने के बाद मना करने पर क्या होता है?',
    a: 'RBE 90/2026 (29.10.2026) के अनुसार कर्मचारी HRMS पर बिना अलग मंजूरी के अनिच्छा दर्ज कर सकता है। पर वह आगे SBRT में अपने अनुरोध पर तबादले के लिए आवेदन नहीं कर सकेगा और IRRT/IDRT में भी अनिच्छा की तारीख से एक साल तक अपने अनुरोध पर तबादले से वंचित रहेगा। एक साल बाद IRRT/IDRT में प्राथमिकता तबादला आवेदन की तारीख के आधार पर बहाल होगी।',
  },
  {
    q: 'संवेदनशील पदों पर कितने साल बाद ट्रांसफर होता है?',
    a: 'मास्टर सर्कुलर 24 (17.08.2023, पैरा 6.1) के अनुसार संवेदनशील पदों पर जनता या ठेकेदार/सप्लायर से संपर्क वाले कर्मचारियों को हर चार साल में पद/सीट या स्टेशन से बाहर ट्रांसफर किया जाना चाहिए। RBE 53/2026 (पत्र E(NG)-I/2026/TR/2, 01.07.2026) में मेडिकल विभाग के चीफ हेल्थ इंस्पेक्टर/हेल्थ इंस्पेक्टर (CHI/HI) का पद भी इस सूची में जोड़ा गया है।',
  },
  {
    q: 'क्या रेलवे कर्मचारियों पर सरकारी ज्वाइनिंग टाइम नियम (CCS 1979) लागू होते हैं?',
    a: 'नहीं। रेलवे कर्मचारियों के लिए ज्वाइनिंग टाइम के नियम इंडियन रेलवे एस्टैब्लिशमेंट कोड के अध्याय 11 में हैं। 180 दिन तक के अस्थायी ट्रांसफर में सिर्फ रास्ते का समय मिलता है, ज्वाइनिंग टाइम नहीं।',
  },
];

// Questions for the Census 2027 enumerator guide (/census-2027). This is our own
// summary of the Enumerator Instruction Manual and public announcements, not an
// official document — each page says so and points readers to their trainer or
// Charge Officer for anything that must be exact.
export const CENSUS_FAQS: Faq[] = [
  {
    q: 'Census 2027 का Phase 2 (Population Enumeration) क्या है?',
    a: 'Phase 1 (Houselisting, अप्रैल से सितंबर 2026) में हर building, मकान और household की list बनी थी। Phase 2 में हर household के हर member की जानकारी 40 questions वाले schedule में भरी जाती है। इसी को Population Enumeration (PE) कहते हैं।',
  },
  {
    q: 'Enumerator का मुख्य काम क्या है?',
    a: 'अपने Enumeration Block (EB) के हर household में जाना, सभी members की जानकारी पूछकर mobile app "Census 2027 – PE" में भरना, आखिर में respondent को summary दिखाकर पढ़कर सुनाना, और समय पर data Sync करके काम पूरा करना।',
  },
  {
    q: 'EB कितना बड़ा होता है?',
    a: 'एक EB में लगभग 800 लोग आते हैं। आपको EB का map और छपी हुई Abridged Houselist (AHL) मिलती है। सिर्फ अपने ही EB में काम करें। दूसरे EB में जाना या अपना कोई इलाका छोड़ देना, दोनों गलत हैं।',
  },
  {
    q: 'Schedule में कितने questions हैं?',
    a: 'कुल 40। ये हर member के लिए पूछे जाते हैं: नाम, रिश्ता, लिंग, उम्र या जन्म तारीख, शादी की स्थिति, पढ़ाई, काम, एक जगह से दूसरी जगह जाना (migration) वगैरह। कुछ questions सिर्फ उन्हीं members के लिए होते हैं जिन पर वे लागू हों। App खुद अगला question दिखाता है।',
  },
  {
    q: 'जरूरी तारीखें क्या हैं?',
    a: 'सार्वजनिक सूचनाओं के हिसाब से: Self-Enumeration (SE) 16 से 30 नवंबर 2026। पंजाब, गोवा, उत्तर प्रदेश और उत्तराखंड में घर-घर enumeration 1 दिसंबर 2026 से 4 जनवरी 2027। Revisional round 5 से 9 जनवरी 2027। बाकी राज्यों में 9 से 28 फरवरी 2027। अपने district की पक्की तारीखें Charge Officer से जरूर confirm करें।',
  },
  {
    q: 'Revisional round क्या होता है?',
    a: 'Enumeration के बाद के 5 दिन, जिनमें छूटे हुए या गलत भरे households को ठीक किया जाता है। इसलिए अपना काम समय पर पूरा रखें।',
  },
  {
    q: 'Self-Enumeration (SE) क्या है?',
    a: 'परिवार खुद online अपनी जानकारी भरता है और उसे 11 अंकों की SE ID मिलती है, जो "P" से शुरू होती है। जब आप जाते हैं तो वह ID लेकर परिवार का भरा हुआ data app में खोलते हैं, verify करते हैं और जरूरत हो तो सुधारते हैं।',
  },
  {
    q: 'परिवार जो जानकारी देता है, वह कितनी गोपनीय है?',
    a: 'पूरी तरह गोपनीय। किसी से share न करें, photo या screenshot न लें, और अपने personal WhatsApp या social media में न डालें। जानकारी सिर्फ duty के काम के लिए इस्तेमाल करें।',
  },
  {
    q: 'मदद या शिकायत के लिए किससे बात करें?',
    a: 'पहले अपने Supervisor से, फिर Charge Officer से। Census helpline का toll-free नंबर 1855 बताया गया है। इसे अपने training material से एक बार मिला लें।',
  },
  {
    q: 'कौन-सा app download करना है और फोन कैसा चाहिए?',
    a: '"Census 2027 – PE" (package name: com.census.peproduction)। कोई दूसरा या नकली app install न करें, download कहाँ से करना है यह trainer से पक्का करें। Manual के हिसाब से फोन में Android 13 या ऊपर (या iOS 15 या ऊपर) और लगभग 8 GB RAM चाहिए, स्टोरेज खाली और battery full रखें।',
  },
  {
    q: 'Registration कैसे होता है?',
    a: 'User ID और captcha डालें → Register दबाएँ → पंजीकृत मोबाइल नंबर पर OTP आएगा, उसे Verify करें → password बनाएँ (पहली बार login पर बदलना पड़ता है) → फोन का PIN set करें।',
  },
  {
    q: 'OTP नहीं आ रहा, क्या करें?',
    a: 'Network और signal देखें, वही SIM फोन में हो जो registration में दी थी, बार-बार तुरंत न दबाएँ। फिर भी न आए तो Supervisor से बात करें।',
  },
  {
    q: 'App की भाषा बाद में बदल सकते हैं?',
    a: 'नहीं। एक बार जो भाषा चुन ली, वह बदली नहीं जा सकती। इसलिए वही भाषा चुनें जिसमें आप आराम से काम कर सकें।',
  },
  {
    q: 'एक फोन पर दो लोग काम कर सकते हैं या app का clone चला सकते हैं?',
    a: 'नहीं। एक user के लिए एक ही device। नए फोन पर login करने से पुराना फोन अपने आप बंद (deregister) हो जाता है। App का clone या दोहरा (dual) app कभी न चलाएँ, और काम के बीच app uninstall न करें।',
  },
  {
    q: 'Sync कब करना चाहिए?',
    a: 'Manual के हिसाब से लगभग हर 5–6 households के बाद, और दिन के आखिर में भी। इससे फोन खो जाए या खराब हो जाए तो भी ज्यादा data नहीं जाता।',
  },
  {
    q: 'फोन खो गया या खराब हो गया तो?',
    a: 'तुरंत Supervisor और Charge Officer को बताएँ। जो data पहले Sync हो चुका है, वह server पर सुरक्षित रहता है — इसीलिए नियमित Sync जरूरी है।',
  },
  {
    q: 'घर जाने से पहले क्या साथ रखें, और परिवार से बात कैसे शुरू करें?',
    a: 'ID card, छपी हुई AHL, EB का map, pen, charge किया फोन और power bank साथ रखें। परिचय दें, ID दिखाएँ, बताएँ कि यह Census का काम है और जानकारी गोपनीय रहेगी। अपने EB के क्रम से काम करें ताकि कोई घर छूटे नहीं और कोई दोबारा न गिना जाए।',
  },
  {
    q: 'Reference date क्या है?',
    a: 'सार्वजनिक घोषणा के हिसाब से reference date 1 मार्च 2027 की आधी रात (00:00) है (बर्फीले इलाकों के लिए अलग तारीख है)। सारा data इसी समय की स्थिति बताने के लिए होता है।',
  },
  {
    q: 'Respondent को question समझने में दिक्कत हो या सवाल संवेदनशील लगे तो?',
    a: 'Question को सरल भाषा में दोबारा बोलें, पर जवाब का सुझाव न दें और अंदाज़े से न भरें। धर्म/जाति जैसे सवालों पर शांति से बताएँ कि ये सरकार ने तय किए हैं और जानकारी गोपनीय रहेगी; अपनी राय या टिप्पणी न दें।',
  },
  {
    q: 'घर पर कोई नहीं मिला या respondent जानकारी देने से मना कर दे तो?',
    a: 'घर बंद मिलने पर पड़ोसियों से पूछकर अलग समय पर दोबारा जाएँ और note में लिखें। मना करने पर बहस न करें, शांति से समझाएँ कि census अनिवार्य है, फिर भी न मानें तो Supervisor को बताएँ।',
  },
  {
    q: 'Houseless (बेघर) लोग कब और कैसे गिने जाते हैं?',
    a: 'इनकी गिनती enumeration period की आखिरी रात, reference date के 00:00 बजने से पहले होती है। अपने EB में ऐसी जगहों (footpath, station, मंदिर, पुल) की पहले से list बना लें; सुरक्षा के लिए अकेले न जाएँ।',
  },
  {
    q: 'किसी परिवार ने Self-Enumeration (SE) कर ली है, तो क्या करना है?',
    a: 'परिवार से उनकी SE ID (11 अंक, "P" से शुरू) लें, app में उससे उनका भरा हुआ data खोलें, respondent को दिखाकर सब verify करें, कमी हो तो वहीं ठीक करके signature लें। पूरा form तभी दोबारा भरें जब data न मिले।',
  },
  {
    q: 'एक मकान में कई households हो सकते हैं?',
    a: 'हाँ, अलग रसोई होने पर एक मकान में कई अलग households रह सकते हैं। AHL और app में हर household अलग दर्ज होता है, इसलिए छपी list का क्रम ध्यान से मिलाएँ।',
  },
  {
    q: 'Paper schedule (paper mode) कब इस्तेमाल होता है?',
    a: 'सिर्फ exception के तौर पर, जैसे app या network की गंभीर समस्या में, और सिर्फ officers की इजाज़त से। ऐसा हो तो data तय तारीख तक web portal पर डालना होता है, और इस्तेमाल किए व न किए दोनों schedules वापस करने होते हैं।',
  },
  {
    q: 'किसी household का data गलत भर दिया, अब कैसे ठीक करें?',
    a: 'Sync से पहले record खोलकर सीधे बदल दें। Sync के बाद "Update Data" से बदलाव करें, respondent की signature दोबारा लें, फिर Sync करें।',
  },
  {
    q: 'Supervisor की 20% जाँच क्या है?',
    a: 'Supervisor अपने module में हर EB के लगभग 20% records random तरीके से देखता है। गड़बड़ी मिले तो वह साथ उस घर जाकर फिर से verify करता है।',
  },
  {
    q: 'काम पूरा होने पर क्या-क्या करना है?',
    a: 'सारा data Sync करें। "View Summary" से आबादी, आबाद मकान और households की संख्या देखकर AHL के खंड 5 में लिखें। App में काम पूरा होने का box tick करें, signature करें, Save करें। फिर AHL के खंड 6 (coverage certificate) भरें और AHL व layout map की दो copies Supervisor को दें।',
  },
  {
    q: 'App में कोई problem (crash, hang, error) आए तो?',
    a: 'App uninstall या बंद न करें। Error message का screenshot सिर्फ Supervisor या official contact को भेजें (social media पर नहीं), और निर्देश का इंतज़ार करें।',
  },
  {
    q: 'इस काम के लिए मानदेय या छुट्टी की क्या व्यवस्था है?',
    a: 'Manual में लिखा है कि यह काम कानूनी जिम्मेदारी है, पर Enumerator और Supervisor को भारत सरकार द्वारा तय उचित मानदेय (honorarium) दिया जाएगा। राशि और छुट्टी का नियम manual में नहीं लिखा। इसके लिए अपने department या Charge Officer के आदेश देखें।',
  },
  // Section 6: step-by-step app usage, added from a later, more detailed
  // read of the Enumerator Instruction Manual.
  {
    q: 'App के home screen पर कौन-कौन से buttons हैं और हर एक का क्या काम है?',
    a: 'Manual के हिसाब से 8 buttons हैं। Household Entry: नया household शुरू करने के लिए। Update Data: Sync न हुए record को सुधारने के लिए, और complete (synced) तथा incomplete households की list देखने के लिए (यहाँ Edit और Delete दोनों हैं)। View Summary: भरे हुए households का summary देखने के लिए। Pending Summary: इसका मतलब manual में नहीं समझाया गया, इसलिए trainer से पूछ लें। Sync: सभी पूरे (completed) records को server पर भेजने के लिए। Mark as Complete: EB का काम पूरा mark करने के लिए। Houseless Enumeration: सिर्फ enumeration के आखिरी दिन की रात houseless लोगों के लिए। Revisional Round: 5 दिन के revisional round में बदलाव के लिए।',
  },
  {
    q: 'काम शुरू करने से पहले app में क्या-क्या देखना और दबाना चाहिए?',
    a: 'Login के बाद पहले Location Particulars देखें (State, District, EB Number वगैरह) और पक्का करें कि ये आपके EB से मेल खाते हैं। फिर ऊपर दाएँ कोने में REFRESH दबाएँ, इससे आपके EB की सारी SE IDs download या update हो जाती हैं। उसके बाद नीचे "Start Population Enumeration" दबाएँ।',
  },
  {
    q: 'शुरू में "Important Notice" वाली screen क्या है?',
    a: 'इसमें Enumerator की ज़िम्मेदारियाँ लिखी हैं: जवाब सच्चाई से लिखना (ठीक से न लिखने पर कानूनी जिम्मेदारी बनती है), बहस न करना, हर household से Self-Enumeration के बारे में पूछना, data किसी को न बताना, और respondent को बताना कि data गोपनीय है और इससे किसी सरकारी योजना की पात्रता पर असर नहीं पड़ता। इसे पढ़कर "I have read and understood" दबाना होता है।',
  },
  {
    q: 'Next, Previous और Jump buttons का क्या मतलब है?',
    a: 'Next: जवाब भरकर अगली screen पर जाने के लिए। Previous: पिछली screen पर लौटने के लिए। Jump: किसी खास screen पर सीधे जाने के लिए। आगे बढ़ने से पहले screen पर भरा हुआ जवाब एक बार देख लें।',
  },
  {
    q: 'Household Entry में सही household कैसे ढूँढें?',
    a: 'Household Entry दबाने पर तीन तरीके से search हो सकता है: Head of Household (HOH) का नाम (शुरू के कुछ अक्षर डालें), Building Number, या Census House Number। मिलने पर बाकी details (Building No., Census House No., Household No., घर का उपयोग) अपने आप आ जाती हैं। AHL में जो लिखा है उससे मिलाकर देखें। फिर घर का Present Use, घर में अभी कितने members हैं, House Number और Locality/Hamlet भरें। Locality पहले भरी हो तो REPEAT चुनें, नई हो तो NEW।',
  },
  {
    q: 'AHL वाला घर अब बदला हुआ मिले (खाली, टूटा, नया परिवार, नया head) तो app में क्या करें?',
    a: 'Manual में ऐसी स्थितियाँ दी हैं। परिवार घर छोड़ गया और घर खाली है: Present Use "vacant" करके Save। मकान अब नहीं है: "demolished" करके Save। पुराना परिवार गया और नया आ गया: Present Use "Residence" चुनें और नए head का नाम भरें। सिर्फ head बदला है: नया नाम भरें। घर का उपयोग बदल गया (जैसे residence से non-residential): Present Use बदलकर Save। Institution हो तो उसका छोटा description (जैसे Old-age Home, Hostel) भी लिखें।',
  },
  {
    q: 'AHL में जो मकान या घर नहीं है, वह मिल जाए तो क्या करें?',
    a: 'नया Building हो तो NEW BN दबाकर Building Number लिखें। नया Census House हो तो NEW CH दबाएँ। नया Household हो तो NEW HH। नए Census House का नंबर 9001 से अपने आप बनता है। नए Building का नंबर पिछले Building के आधार पर देते हैं, जैसे 13 और 14 के बीच का नया मकान 13/1। यही तरीका HLO (Phase 1) में छूटे हुए मकानों पर भी लागू होता है।',
  },
  {
    q: 'एक ही मकान में नया household आ गया या परिवार बँट गया हो तो?',
    a: 'पहले उस Census House का Present Use चुनें (Residence आदि), फिर NEW HH दबाकर इस नए household की details भरें। Type of HH अपने आप भर जाता है।',
  },
  {
    q: 'Members की जानकारी भरने का सही क्रम क्या है?',
    a: 'पहले household में members की संख्या भरें, फिर हर member को Serial Number दें। सबसे पहले Head of Household का नाम आता है। पहले सब members के लिए Q1 से Q6 (नाम, रिश्ता, लिंग, जन्म तारीख और उम्र, शादी की स्थिति, शादी के समय उम्र) भरें। फिर "Enter Member details from Question 7" दबाकर हर member के बाकी सवाल एक-एक करके भरें। यह क्रम app में अपने आप चलता है।',
  },
  {
    q: 'किसी member को गलती से जोड़ दिया या उसकी जानकारी गलत भर गई तो?',
    a: 'हर member के सामने Delete और Edit icon होते हैं। गलती से जुड़ा member Delete icon से हटाएँ, गलत जानकारी Edit icon से ठीक करें। जब सही हो तो Forward दबाकर आगे बढ़ें। Revisional Round में किसी की मृत्यु होने पर भी उसकी details इसी तरह delete की जाती हैं।',
  },
  {
    q: 'Self-Enumeration (SE ID) app में कैसे डालें?',
    a: 'पूछें: "क्या आपके household ने Self-Enumeration की है?" Yes हो तो SE ID डालें और Next दबाएँ। ID 11 अंकों की होती है और शुरू में "P" लगता है। इसे बहुत ध्यान से डालें, क्योंकि manual के अनुसार गलत ID डालने पर उस household का data खो सकता है। No हो तो Next दबाकर सब members की जानकारी खुद भरें। SE वाले household में data मिलान करके summary देखें, पुष्टि कराएँ और submit करें।',
  },
  {
    q: 'SE ID मेरे app में दिख नहीं रही, क्या करें?',
    a: 'App में sign in करते समय SE IDs अपने आप download हो जाती हैं। न हुई हों तो home screen पर ऊपर दाएँ REFRESH दबाएँ। फिर भी न मिले तो Supervisor से बात करें।',
  },
  {
    q: 'Respondent कौन होता है और app में किसे चुनना है?',
    a: 'सब members की जानकारी भरने के बाद app में respondent का नाम चुनें। यह वह मुख्य व्यक्ति होता है जिससे आपने ज्यादातर जानकारी ली है और जो उस household का सामान्य निवासी (normal resident) हो। एक से ज्यादा respondent हों तो उनमें से जो बड़े हों, उनका नाम लें।',
  },
  {
    q: 'Signature कब और कैसे लेना है?',
    a: 'सब सवाल भरने के बाद respondent को app पर summary दिखाएँ और उसके बाद हस्ताक्षर करवाएँ। इससे respondent यह मानता है कि आपने उसके परिवार की जानकारी वैसे ही लिखी है जैसी उसने बताई। पढ़ा-लिखा हो तो वही अपने नाम से signature करे। न कर पाए तो उसी household का कोई दूसरा member कर सकता है (उसका नाम भी लिखा जाए)। घर में कोई और न हो तो "nobody available sign" लिखें। respondent मना कर दे तो "refused" लिखें। बहुत ही खास और असामान्य स्थिति में signature लेना ठीक न लगे तो कारण लिखें और Supervisor तथा Charge Officer को तुरंत बताकर special report दें। आखिर में आप एक confirmation box tick करके खुद भी signature करते हैं।',
  },
  {
    q: 'क्या signature के बिना अगला household नहीं भर सकते? क्या incomplete household बाद में पूरा किया जा सकता है?',
    a: 'Manual में ऐसा कोई नियम नहीं लिखा कि पिछले household का signature हुए बिना नया household शुरू नहीं हो सकता। Manual के मुताबिक Update Data में complete और incomplete दोनों तरह के households की list दिखती है, जहाँ उन्हें edit या delete कर सकते हैं। Manual में "draft" शब्द का इस्तेमाल नहीं है। आपके app version में असल व्यवहार कुछ अलग हो सकता है। इसलिए अपने field trainer से पूछकर या app में आज़माकर पक्का कर लें।',
  },
  {
    q: '"Pending Summary" क्या दिखाता है?',
    a: 'Manual में इस button का सिर्फ नाम है, इसका काम समझाया नहीं गया है। अंदाज़े से कोई मतलब न निकालें। इसे अपने trainer से पूछकर या training में app चलाकर समझें।',
  },
  {
    q: 'View Summary कब देखें और इसका क्या इस्तेमाल है?',
    a: 'हर household को Sync करने से पहले उसका summary देख लें, ताकि जानकारी सही और पूरी हो। View Summary में कुल आबादी, आबाद रहने वाले मकानों और households की गिनती भी मिलती है। काम पूरा होने पर इन्हीं संख्याओं को AHL के खंड 5 में लिखना होता है।',
  },
  {
    q: 'Update Data में क्या-क्या कर सकते हैं?',
    a: 'Sync न हुआ record खोलकर सुधार सकते हैं। यहाँ complete (synced) और incomplete दोनों households की list दिखती है और Edit या Delete का option मिलता है। Sync हो चुके record में बदलाव करने के बाद respondent को दोबारा दिखाकर signature लें और फिर Sync करें।',
  },
  {
    q: 'Sync दबाने पर क्या होता है?',
    a: 'Sync सारे पूरे (completed) records को central server पर भेज देता है। भेजने से पहले हर household का summary देख लें। Sync के समय आपसे एक declaration और signature माँगा जाता है कि आपने records जाँच लिए हैं। Manual सलाह देती है कि बार-बार Sync करें, ताकि data खोने का डर न रहे।',
  },
  {
    q: 'Sync नहीं हो रहा या app में technical glitch आए तो?',
    a: 'Manual कहता है कि धैर्य और शांति रखें और अपने Supervisor, Field Trainer या Charge Officer से मदद लें। आप अपने district के helpdesk (DCO) से भी बात कर सकते हैं। App uninstall न करें। Network मिलने पर दोबारा Sync करें। Data आपके फोन में रहता है।',
  },
  {
    q: 'मुझे फोन बदलना पड़े तो unsynced data का क्या होगा?',
    a: 'नए फोन पर register करते ही पुराना फोन अपने आप deregister हो जाता है, और उसके बाद पुराने फोन से Sync नहीं हो सकता। इसलिए फोन बदलने से पहले पूरा data Sync कर लें। Manual की सलाह है कि फोन बिना जरूरत के न बदलें।',
  },
  {
    q: 'App uninstall करना ही पड़े तो unsynced data बचाने का क्या तरीका है?',
    a: 'Manual के अनुसार uninstall से पहले जो data Sync नहीं हुआ, उसे कागज़ या writing pad पर लिख लें। बाद में उसे app में दोबारा भर सकते हैं, लेकिन तब आपको उन्हीं घरों में दोबारा जाकर respondent का signature फिर से लेना पड़ेगा। इसलिए uninstall से पहले हमेशा Supervisor से पूछ लें।',
  },
  {
    q: 'Mark as Complete कब दबाना है?',
    a: 'पहले पक्का करें कि आपके EB के हर Building, Census House और Household का काम हो चुका है और सारा data Sync हो गया है। उसके बाद ही Mark as Complete दबाएँ और Supervisor को बताएँ। जल्दबाज़ी न करें, क्योंकि काम "पूरा" mark होने के बाद बदलाव के नियम सख्त हो जाते हैं।',
  },
  {
    q: 'Supervisor को मेरे record में गलती मिली तो क्या होगा?',
    a: 'Supervisor अपने module में लगभग 20% records देखता है और गड़बड़ी लगे तो आपके साथ उस घर जाकर दोबारा पूछता है। Synced record में बदलाव जरूरी हो तो आप Update Data से वही item ठीक करते हैं, respondent की signature दोबारा लेते हैं, और Supervisor सब जाँचकर अपनी signature करके Sync करता है। Manual की सामान्य सलाह यह भी है कि अगर record गलत पाया गया तो पूरा record दोबारा भरना पड़ सकता है।',
  },
  {
    q: 'Revisional Round में app में क्या-क्या करना होता है?',
    a: 'इन 5 दिनों में आपको EB के हर household पर फिर जाना होता है। 00:00 बजे (reference date) से पहले जो नया जन्म हुआ हो, उसे दर्ज करें और माँ के Q31–33 के जवाब भी ठीक करें। जो मृत्यु हुई हो, उस व्यक्ति के Q1 से Q40 वाले जवाब delete करें। नए आए visitor या नए household को enumerate करें। हर बदलाव का कारण drop-down से चुनें, और AHL में कारण तथा दोबारा जाने की तारीख लिखें। इसके लिए home screen पर "Revisional Round" button है।',
  },
];
