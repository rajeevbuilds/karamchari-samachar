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
] as const;

export type SectionSlug = (typeof SECTION_OPTIONS)[number]['value'];
