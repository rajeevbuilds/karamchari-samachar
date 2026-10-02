import Link from 'next/link';
import InfoPage from '@/components/InfoPage';
import { LEGAL_LAST_UPDATED, SITE_NAME, SITE_DOMAIN } from '@/lib/site';

export const metadata = {
  title: `Terms & Conditions — ${SITE_NAME}`,
  description: `The terms for using ${SITE_DOMAIN}.`,
};

export default function TermsPage() {
  return (
    <InfoPage title="Terms & Conditions" updated={LEGAL_LAST_UPDATED}>
      <p>
        By using {SITE_NAME} ({SITE_DOMAIN}), you agree to these terms. If you do not agree, please do not use the
        site.
      </p>

      <h2>Use of the site</h2>
      <ul>
        <li>The site is provided free of charge for your personal, non-commercial information.</li>
        <li>You agree not to misuse the site: for example by trying to break into it, overload it, scrape it in a way that harms it, or use it for anything unlawful.</li>
      </ul>

      <h2>Information, calculators and reliance</h2>
      <p>
        The information and calculators on the site are for general awareness and give estimates only. They are not an
        official source and not professional advice. Please read our <Link href="/disclaimer">Disclaimer</Link> and
        verify anything important with the official source before relying on it.
      </p>

      <h2>Content and copyright</h2>
      <ul>
        <li>
          The site&apos;s own text, design, logo and calculators belong to us. You may share links to our pages. Please do
          not copy substantial parts of the site without our written permission.
        </li>
        <li>
          Government circulars, orders and notifications are public documents and remain the property of the issuing
          authority. Logos, images and names of other organisations belong to their owners.
        </li>
        <li>
          If you believe something on the site infringes your rights, please tell us through the{' '}
          <Link href="/contact">Contact Us</Link> page and we will look into it promptly.
        </li>
      </ul>

      <h2>Third-party links and advertisements</h2>
      <p>
        The site links to other websites and may show third-party advertisements. We do not control them and are not
        responsible for their content, products or services, or for any dealings you have with them.
      </p>

      <h2>Availability</h2>
      <p>
        We try to keep the site available but do not promise it will always be uninterrupted or error-free. We may
        change, suspend or remove any part of the site at any time.
      </p>

      <h2>Limitation of liability</h2>
      <p>
        To the fullest extent permitted by law, we are not liable for any loss or damage of any kind arising from your
        use of the site or reliance on its content or calculators.
      </p>

      <h2>Changes to these terms</h2>
      <p>
        We may update these terms from time to time. The &ldquo;last updated&rdquo; date above shows when they last
        changed. Continued use of the site means you accept the updated terms.
      </p>

      <h2>Governing law</h2>
      <p>These terms are governed by the laws of India.</p>

      <h2>Contact</h2>
      <p>
        Questions about these terms? Please use our <Link href="/contact">Contact Us</Link> page. See also our{' '}
        <Link href="/privacy-policy">Privacy Policy</Link>.
      </p>
    </InfoPage>
  );
}
