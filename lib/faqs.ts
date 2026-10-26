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
