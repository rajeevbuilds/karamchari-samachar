import type { Circular } from './data';
// Shared constants with no dependencies on the database layer, so they can
// be safely imported from client components (e.g. the admin dashboard)
// without pulling mysql2 into the browser bundle.

export const STATE_OPTIONS = [
  'punjab',
  'haryana',
  'uttar-pradesh',
  'maharashtra',
  'rajasthan',
  'gujarat',
  'west-bengal',
  'tamil-nadu',
  'karnataka',
  'kerala',
] as const;

// Top-nav taxonomy for circulars. Each circular optionally belongs to one
// of these sections; `label` is used both for the admin dropdown and as
// the page title/nav text on /section/[slug].
export const SECTION_OPTIONS = [
  { value: 'railway-board', label: 'Railway Board Circulars' },
  { value: 'dopt', label: 'DOPT Circular' },
  { value: 'fin-min', label: 'Fin Min Circular' },
  { value: 'defence', label: 'Defence' },
  { value: 'nps', label: 'NPS' },
  { value: 'cghs', label: 'CGHS' },
  { value: 'ups', label: 'UPS' },
  { value: 'news-paper-reports', label: 'News Paper Reports' },
  { value: 'pay-commission', label: '8th Pay Commission' },
  { value: 'analysis', label: 'Analysis' },
  { value: 'calculators', label: 'Calculators' },
] as const;

export type SectionSlug = (typeof SECTION_OPTIONS)[number]['value'];

export const CATEGORY_OPTIONS: { value: Circular['category']; label: string }[] = [
  { value: 'da', label: 'Dearness Allowance' },
  { value: 'pay', label: 'Pay Commission' },
  { value: 'transfer', label: 'Transfer & Posting' },
  { value: 'recruitment', label: 'Recruitment' },
  { value: 'pension', label: 'Pension & Medical' },
  { value: 'general', label: 'General' },
];

export const CATEGORY_LABEL: Record<Circular['category'], string> = Object.fromEntries(
  CATEGORY_OPTIONS.map((c) => [c.value, c.label])
) as Record<Circular['category'], string>;
