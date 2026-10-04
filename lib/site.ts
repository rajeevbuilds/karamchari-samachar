// Site-wide constants for the information pages (About, Contact, Privacy
// Policy, Disclaimer, Terms) and the links that point to them.

export const SITE_NAME = 'Sarkari Karamchari Samachar';
export const SITE_DOMAIN = 'sarkarikaramchari.com';
// Google Analytics 4 measurement ID (public by design; it appears in every page's code).
export const GA_MEASUREMENT_ID = 'G-3L3WCSQZEN';

export const SITE_URL = `https://${SITE_DOMAIN}`;
export const SITE_TITLE = `${SITE_NAME} — DA, Circulars & Pay Updates for Government Employees`;
export const SITE_DESCRIPTION =
  'Sarkari Karamchari Samachar tracks Dearness Allowance updates, circulars, pay commission news and transfer orders for central and state government employees across India.';
export const SITE_LOGO_URL = `${SITE_URL}/brand/logo.webp`;

// Shown on the legal pages. Bump when their wording changes.
export const LEGAL_LAST_UPDATED = '2 October 2026';

export const INFO_LINKS = [
  { href: '/about', label: 'About Us' },
  { href: '/contact', label: 'Contact Us' },
  { href: '/privacy-policy', label: 'Privacy Policy' },
  { href: '/disclaimer', label: 'Disclaimer' },
  { href: '/terms', label: 'Terms & Conditions' },
] as const;

// WhatsApp can be stored as a full link or just a phone number.
export function whatsappHref(value: string): string | null {
  const v = value.trim();
  if (!v) return null;
  if (/^https?:\/\//i.test(v)) return v;
  const digits = v.replace(/\D/g, '');
  return digits.length >= 10 ? `https://wa.me/${digits}` : null;
}
