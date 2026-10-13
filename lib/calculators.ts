// Interactive tools filed under /section/[slug] (currently just
// "calculators"), shown above that section's circular listing so visitors
// browsing find the actual tool, not just articles about it. Each tool's
// description is the single source of truth for both its card on the
// section page and its subtitle on the tool's own page, so search visitors
// landing directly on the tool see the same copy as those browsing there.

import type { Metadata } from 'next';
import { SITE_NAME } from '@/lib/site';

export type CalculatorTool = {
  href: string;
  title: string;
  description: string;
  // Used on the Calculators listing page only.
  short: string; // one line for the tool's card
  icon: 'wallet' | 'calculator' | 'piggy' | 'scale' | 'clipboard' | 'check' | 'trending';
  // 1200 x 630 picture shown when the link is shared on Facebook, WhatsApp, X.
  shareImage: string;
};

export const PENSION_OPS_TOOL: CalculatorTool = {
  href: '/calculators/pension-ops',
  title: 'OPS Pension Calculator',
  description:
    'Estimate your monthly pension under the Old Pension Scheme (CCS Pension Rules, 1972). Enter your last drawn Basic Pay and qualifying service to get an instant estimate.',
  short: 'Estimate your monthly pension under the Old Pension Scheme.',
  icon: 'wallet',
  shareImage: '/share/pension-ops.jpg',
};

export const GRATUITY_TOOL: CalculatorTool = {
  href: '/calculators/gratuity',
  title: 'Gratuity Calculator',
  description:
    'Estimate your retirement gratuity or death gratuity for central government service (CCS Pension Rules, 2021). Enter Basic Pay, DA and qualifying service to get an instant estimate, including the ₹25 lakh ceiling.',
  short: 'Retirement or death gratuity under the CCS Pension Rules, 2021, with the ₹25 lakh ceiling.',
  icon: 'calculator',
  shareImage: '/share/gratuity.jpg',
};

export const NPS_TOOL: CalculatorTool = {
  href: '/calculators/nps',
  title: 'NPS & UPS Pension Calculator',
  description:
    'Project your NPS corpus and pension at retirement, or your UPS assured payout, and compare the two. Enter your date of birth, date of joining, Basic Pay and present corpus — the estimate builds in yearly increments, DA rises and a pay commission every 10 years.',
  short: 'Project your NPS corpus and pension, and compare it with the UPS assured payout.',
  icon: 'piggy',
  shareImage: '/share/nps.jpg',
};

export const PAY_FIXATION_TOOL: CalculatorTool = {
  href: '/calculators/pay-fixation',
  title: 'Pay Fixation Calculator (Promotion & MACP)',
  description:
    'Work out your new Basic Pay on promotion or MACP upgradation under the 7th CPC Pay Matrix, for Central Government and Railway employees. Choose your Level and pay to see the fixed pay step by step, with your next increments.',
  short: 'Your new Basic Pay on promotion or MACP, under the 7th CPC Pay Matrix.',
  icon: 'scale',
  shareImage: '/share/pay-fixation.jpg',
};

export const RETIREMENT_BENEFITS_TOOL: CalculatorTool = {
  href: '/calculators/retirement-benefits',
  title: 'Retirement Benefits: Employees Appointed Before 01.01.2004 (OPS)',
  description:
    'For employees and pensioners under the Old Pension Scheme: estimate your monthly pension, gratuity, leave encashment and commutation on one printable page, and check the figures on your Pension Payment Order (PPO). Central Government and Railway employees.',
  short: 'Estimate pension, gratuity, leave encashment and commutation, and check your PPO.',
  icon: 'clipboard',
  shareImage: '/share/retirement-benefits.jpg',
};

// Page metadata for a calculator, with its own share picture. A page that sets
// openGraph replaces the site-wide one, so the site fields are repeated here.
export function calculatorMetadata(tool: CalculatorTool): Metadata {
  const image = { url: tool.shareImage, width: 1200, height: 630, alt: tool.title };
  return {
    title: tool.title,
    description: tool.description,
    alternates: { canonical: tool.href },
    openGraph: {
      type: 'website',
      siteName: SITE_NAME,
      locale: 'en_IN',
      url: tool.href,
      title: tool.title,
      description: tool.description,
      images: [image],
    },
    twitter: { card: 'summary_large_image', title: tool.title, description: tool.description, images: [tool.shareImage] },
  };
}

export const EIGHTH_CPC_TOOL: CalculatorTool = {
  href: '/calculators/8th-pay-commission',
  title: '8th Pay Commission Salary Calculator',
  description:
    'See what your salary could look like under the 8th Pay Commission. Enter your present Basic Pay, Pay Level and city, pick a fitment factor from 1.50 to 3.00, compare your present and 8th CPC Basic Pay, DA, HRA and Transport Allowance, and estimate your arrears from 1 January 2026 to the date of notification. An estimate only: the Commission has not reported.',
  short: 'Present salary against 8th CPC salary and arrears, for any fitment factor from 1.50 to 3.00.',
  icon: 'trending',
  shareImage: '/share/8th-pay-commission.jpg',
};

// Add future calculators (Commutation, ...) here as they ship.
export const SECTION_TOOLS: Record<string, CalculatorTool[]> = {
  calculators: [EIGHTH_CPC_TOOL, PENSION_OPS_TOOL, GRATUITY_TOOL, NPS_TOOL, PAY_FIXATION_TOOL, RETIREMENT_BENEFITS_TOOL],
};
