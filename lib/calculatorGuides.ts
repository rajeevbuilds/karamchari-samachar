// "How this calculator works" text shown under each calculator, above its
// questions. It describes what the tool's own code does, step by step, with a
// worked example whose figures were produced by running that code. If a
// calculator's rules change, change the matching text here too.

export type GuideTable = { head: string[]; rows: string[][] };

export type GuideSection = {
  heading: string;
  paragraphs?: string[];
  bullets?: string[];
  table?: GuideTable;
  // Shown after the table.
  after?: string[];
};

export type CalculatorGuide = {
  heading: string;
  intro: string;
  sections: GuideSection[];
  sources?: string[];
};

export const CALCULATOR_GUIDES: Record<string, CalculatorGuide> = {
  '/calculators/pay-fixation': {
    heading: 'How this pay fixation calculator works',
    intro:
      'The calculator follows the 7th CPC Pay Matrix and Rule 13 of the Central Civil Services (Revised Pay) Rules, 2016, and the same rule of the Railway Services (Revised Pay) Rules, 2016. It shows each step so you can compare it with your own pay fixation order.',
    sections: [
      {
        heading: 'The two ways pay can be fixed on promotion',
        bullets: [
          'Option 1, from the date of promotion: one increment is given in your present level, and the figure is then placed in the new level at the cell equal to it, or at the next higher cell if there is no equal cell.',
          'Option 2, from the date of next increment: on promotion you are placed at the next higher cell in the new level above your present pay. On the date of your next increment in the lower post, two increments are given in the lower level (one annual, one for the promotion), and pay is re-fixed in the new level at the cell equal to that figure, or the next higher cell. The source is DoPT OM No. 13/02/2017-Estt.(Pay-I) dated 27 July 2017.',
        ],
      },
      {
        heading: 'MACP, and promotion after MACP',
        paragraphs: [
          'For MACP the calculator treats the upgradation as a move to the next level of the Pay Matrix and applies the same fixation steps. For a promotion that comes after you have already had pay fixation under MACP, it follows Railway Board RBE No. 23/2019: no further increment is added, and your present pay is placed at the same or next higher cell of the new level. If you are promoted to the level you already hold under MACP, pay does not change.',
        ],
      },
      {
        heading: 'Annual increments',
        paragraphs: [
          'Increments are taken on 1 January or 1 July, for an employee who has completed six months in the post by that date. The calculator shows your next three increments in the new level.',
        ],
      },
      {
        heading: 'A worked example',
        paragraphs: [
          'A Level 4 employee drawing ₹29,600 is promoted to Level 5 on 15 March 2026. Her annual increment falls on 1 July.',
        ],
        table: {
          head: ['Step', 'Option 1: date of promotion', 'Option 2: date of next increment'],
          rows: [
            ['At promotion', 'One increment in Level 4: ₹29,600 → ₹30,500. Level 5 has no ₹30,500 cell, so pay is fixed at ₹31,000.', 'Next higher Level 5 cell above ₹29,600: ₹30,100.'],
            ['On 1 July 2026', 'No change.', 'Two Level 4 increments: ₹29,600 → ₹30,500 → ₹31,400. Re-fixed at the next higher Level 5 cell: ₹31,900.'],
            ['Compared', '₹31,000 from 15 March 2026.', '₹900 a month less until 30 June 2026, then ₹900 a month more from 1 July 2026.'],
          ],
        },
        after: [
          'Which option is better depends on how close the date of promotion is to your next increment. The calculator compares both options for your own figures.',
        ],
      },
      {
        heading: 'What it does not cover',
        bullets: [
          'Special pay, personal pay and running allowances.',
          'A promotion that falls on the same day as your annual increment (1 January or 1 July). The calculator stops and asks you to confirm it with your accounts office.',
          'Cases where your pay is above the highest cell of the new level.',
        ],
        paragraphs: ['The authority that sanctions your promotion or MACP fixes your pay. Use this page to check the steps, and confirm the figure with your accounts section.'],
      },
    ],
    sources: [
      'Rule 13, CCS (Revised Pay) Rules, 2016 and Railway Services (Revised Pay) Rules, 2016',
      'DoPT OM No. 13/02/2017-Estt.(Pay-I) dated 27 July 2017',
      'Railway Board RBE No. 23/2019',
    ],
  },

  '/calculators/pension-ops': {
    heading: 'How this pension calculator works',
    intro:
      'The calculator works out a monthly pension under the Old Pension Scheme, the CCS (Pension) Rules, 1972. It is for estimating your pension; your Pension Payment Order (PPO) gives the figure that is actually paid.',
    sections: [
      {
        heading: 'The steps it follows',
        bullets: [
          'Qualifying service is rounded to completed six-month periods. If you are less than 3 months into a half-year, that part is dropped. If you are 3 months or more into it, it counts as a full half-year.',
          'A pension needs at least 10 years of qualifying service. With less, the calculator tells you no pension is payable and shows the family pension figures only.',
          'The base is your last drawn Basic Pay. If you enter the average Basic Pay of your last 10 months, the calculator uses whichever is higher.',
          'Full pension is 50% of that base, for 20 years or more of qualifying service. For service between 10 and 20 years it is reduced in proportion (50% × years ÷ 20).',
          'If a minimum pension is saved on this site and your figure is below it, the minimum is used.',
          'Dearness Relief is added at the DR rate on the page, which you can change. The total is your basic pension plus DR.',
          'It also shows family pension at 30% (normal rate) and 50% (enhanced rate) of your last drawn pay.',
        ],
      },
      {
        heading: 'Worked examples',
        paragraphs: ['The examples use a last drawn Basic Pay of ₹56,100 and a DR of 50%, only to show the steps. Use the current DR when you try your own figures.'],
        table: {
          head: ['Qualifying service', 'Basic pension', 'DR at 50%', 'Total monthly pension'],
          rows: [
            ['30 years', '₹28,050 (50% of ₹56,100)', '₹14,025', '₹42,075'],
            ['15 years', '₹21,037.50 (₹28,050 × 15 ÷ 20)', '₹10,518.75', '₹31,556.25'],
          ],
        },
        after: [
          'For the 30-year case the family pension shown is ₹16,830 at the normal rate and ₹28,050 at the enhanced rate. With 8 years of qualifying service the calculator shows no pension, because the 10-year minimum is not met.',
        ],
      },
      {
        heading: 'Who it is for, and what it leaves out',
        bullets: [
          'It is for central government employees appointed before 1 January 2004, who are covered by the CCS (Pension) Rules, 1972.',
          'It does not work out gratuity, leave encashment or commutation. The Retirement Benefits calculator on this site covers those.',
          'It does not include any revision after your PPO is issued.',
        ],
      },
    ],
    sources: ['CCS (Pension) Rules, 1972'],
  },

  '/calculators/retirement-benefits': {
    heading: 'How the retirement benefits calculator works',
    intro:
      'This page brings the main retirement dues of an Old Pension Scheme employee together on one printable sheet. Each part follows the same rules as the separate calculators on this site.',
    sections: [
      {
        heading: 'What each part does',
        bullets: [
          'Pension: the Old Pension Scheme formula, with qualifying service rounded to half-years, a 10-year minimum, 50% of the base for 20 years or more, and Dearness Relief added at the rate you enter.',
          'Gratuity: emoluments are Basic Pay plus DA. Retirement gratuity is one-fourth of emoluments for each completed six-month period of qualifying service, counted up to 33 years (66 half-years), and limited by the gratuity ceiling saved on this site. Retirement gratuity needs at least 5 years of qualifying service.',
          'Leave encashment: leave on average pay is paid at (Basic + DA) ÷ 30 per day and half pay leave at half of that. Together they are limited to 300 days, with leave on average pay counted first.',
          'Commutation: you choose up to 40% of your basic pension to commute. The lump sum is the commuted pension × 12 × a factor that depends on your age next birthday, taken from the commutation table (the 8% interest table). The monthly pension is reduced by the commuted part.',
          'Other dues: you can add your GPF balance and other dues to see everything in one total.',
        ],
      },
      {
        heading: 'A worked example',
        paragraphs: ['A Basic Pay of ₹56,100, DA of 50%, 30 years of qualifying service, 300 days of leave on average pay, and 40% commutation at age next birthday 61.'],
        table: {
          head: ['Item', 'How it is worked out', 'Result'],
          rows: [
            ['Gratuity', 'Emoluments ₹84,150 (₹56,100 + 50% DA) × ¼ × 60 half-years', '₹12,62,250'],
            ['Leave encashment', '(₹56,100 × 1.5) ÷ 30 = ₹2,805 a day × 300 days', '₹8,41,500'],
            ['Commutation', '40% of ₹28,050 basic pension = ₹11,220 a month × 12 × factor 8.194 for age 61', '₹11,03,240 (rounded)'],
            ['Basic pension after commutation', '₹28,050 − ₹11,220', '₹16,830 a month'],
          ],
        },
        after: [
          'The gratuity example is below the ₹25 lakh ceiling used by this calculator, so the ceiling does not apply.',
        ],
      },
      {
        heading: 'Checking your PPO',
        paragraphs: [
          'The page also lets you compare the figures on your Pension Payment Order (PPO) with the estimate. A difference does not mean an error: dates of service, DA and pay fixation can all change a figure. Take any difference to your accounts office.',
        ],
      },
      {
        heading: 'Limits of the estimate',
        bullets: [
          'It is for employees appointed before 1 January 2004. It does not cover the National Pension System or the Unified Pension Scheme.',
          'Leave encashment follows the Railway Board orders on leave encashment at retirement and the CCS (Leave) Rules; your actual leave balance and service history decide the figure.',
          'The commutation factors are those of the commutation table for ages 20 to 81. Outside those ages the calculator cannot work out a lump sum.',
        ],
      },
    ],
    sources: [
      'CCS (Pension) Rules, 1972 (pension) and CCS (Pension) Rules, 2021, rules 50 and 51 (gratuity)',
      'CCS (Commutation of Pension) Rules, 1981',
      'Railway Board orders on leave encashment at retirement (RBE 157/97, 147/2008, 148/2008, 130/2009 and 204/2009)',
    ],
  },

  '/calculators/8th-pay-commission': {
    heading: 'How the 8th Pay Commission salary calculator works',
    intro:
      'The 8th Pay Commission has not reported, so every figure here rests on assumptions that you can change. The calculator shows what your salary would be for a fitment factor you choose, set against your present salary.',
    sections: [
      {
        heading: 'The steps it follows',
        bullets: [
          'Present salary: your Basic Pay, DA at the present rate, HRA at the present 7th CPC rate for your city class (never below the minimum HRA), Transport Allowance for your Pay Level and city, and DA on the Transport Allowance.',
          'New Basic Pay: present Basic Pay × the fitment factor you choose (from 1.50 to 3.00), taken up to the next ₹100.',
          'DA: it restarts from zero with a new Pay Commission, as it did with the 7th CPC, so the 8th CPC salary starts with no DA.',
          'HRA and Transport Allowance: you choose the HRA rate stage and how much the Transport Allowance rises. These are assumptions, not decisions.',
          'The result shows your monthly and yearly difference and the percentage rise.',
        ],
      },
      {
        heading: 'A worked example of the Basic Pay step',
        paragraphs: [
          'Present Basic Pay of ₹56,100 with a fitment factor of 2.57 (the factor used by the 7th Pay Commission): ₹56,100 × 2.57 = ₹1,44,177, taken up to ₹1,44,200. This is only the arithmetic of the step, because the 8th Pay Commission has not fixed any factor.',
        ],
      },
      {
        heading: 'Arrears',
        paragraphs: [
          'The calculator also estimates arrears if the 8th Pay Commission is notified some months after 1 January 2026. For every month up to the month of notification, it compares the pay due under the 8th CPC with the pay actually drawn, and adds up the difference. The pay due uses your new Basic Pay and DA restarting from zero and rising by the number of points you assume each January and July. You choose the notification date and whether HRA and Transport Allowance change from 1 January 2026 or from the date of notification.',
        ],
      },
      {
        heading: 'What to remember',
        bullets: [
          'The Commission has not reported, and the government will decide the final pay structure and the date of effect.',
          'The present-pay rules used are those of the 7th CPC orders on HRA and Transport Allowance.',
          'Use the result for planning and as a rough check, not as a promise of what you will be paid.',
        ],
      },
    ],
    sources: [
      'Department of Expenditure OM 2/5/2017-E.II(B) dated 7 July 2017 (HRA)',
      'Department of Expenditure OM 21/5/2017-E.II(B) dated 7 July 2017 (Transport Allowance)',
    ],
  },

  '/calculators/nps': {
    heading: 'How the NPS and UPS calculator works',
    intro:
      'This calculator projects a corpus and a pension from the assumptions you enter. It does not know what markets will do, so it never promises a figure. It lets you compare the NPS projection with the UPS assured payout on the same facts.',
    sections: [
      {
        heading: 'How the NPS corpus is projected',
        bullets: [
          'Contributions are 10% from the employee and 14% from the government, both on Basic Pay plus DA, added at the end of each month from the month after the date of your present corpus to your retirement month.',
          'The corpus grows at the annual return you assume, compounded monthly.',
          'Basic Pay rises by the annual increment you choose each 1 July, and DA is revised each 1 January and 1 July by the number of points you choose.',
          'A pay commission is assumed from 1 January 2026 and every 10 years after: Basic plus DA rises by the percentage you choose, becomes the new Basic Pay, and DA restarts from zero. If the Basic Pay you entered already includes the 2026 commission, tick the option so it is not counted twice.',
          'At retirement a share of the corpus that you choose buys an annuity at the annuity rate you assume, which gives the monthly pension shown.',
        ],
      },
      {
        heading: 'How the UPS assured payout is worked out',
        paragraphs: [
          'The calculator uses 50% of the average Basic Pay of the last 12 months of service, for 25 years of qualifying service. It is reduced in proportion for shorter service, has a minimum of ₹10,000 a month, and needs at least 10 years of service.',
        ],
        table: {
          head: ['Qualifying service', 'Average Basic Pay of last 12 months', 'Assured payout (before DR)'],
          rows: [
            ['25 years', '₹80,000', '₹40,000 a month (50% of ₹80,000)'],
            ['20 years', '₹80,000', '₹32,000 a month (₹40,000 × 20 ÷ 25)'],
          ],
        },
        after: ['These are only examples of the arithmetic. Your own figures decide your result.'],
      },
      {
        heading: 'Why the result can differ from what you receive',
        bullets: [
          'NPS returns are not guaranteed. A different return, increment or annuity rate changes the answer a lot.',
          'The projection assumes a pay commission every 10 years. The government decides whether and when one takes effect.',
          'It is a projection for planning. Confirm any decision with your DDO, your pension fund statements and the official scheme rules.',
        ],
      },
    ],
    sources: ['The scheme rates and the calculator assumptions are stated on the page'],
  },
};
