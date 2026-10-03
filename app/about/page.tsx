import Link from 'next/link';
import InfoPage from '@/components/InfoPage';
import { SITE_NAME, SITE_DOMAIN } from '@/lib/site';

export const metadata = {
  title: 'About Us',
  alternates: { canonical: '/about' },
  description: `About ${SITE_NAME} (${SITE_DOMAIN}): an independent news and information site for central and state government employees and pensioners.`,
};

export default function AboutPage() {
  return (
    <InfoPage title="About Us">
      <p>
        <strong>{SITE_NAME}</strong> ({SITE_DOMAIN}) is an independent news and information website for central and
        state government employees, pensioners and their families. Our aim is simple: <em>Inform, Empower, Serve</em>.
      </p>

      <h2>What you will find here</h2>
      <ul>
        <li>
          <strong>Circulars and orders</strong> — Railway Board, DOPT, Finance Ministry, Defence and other department
          circulars, with a link to the original document wherever it is available.
        </li>
        <li>
          <strong>Dearness Allowance and the 8th Pay Commission</strong> — updates on DA revisions and on the work of the
          Pay Commission as they are announced.
        </li>
        <li>
          <strong>Pension and retirement</strong> — news on NPS, UPS, CGHS and related schemes, with plain-language
          explainers and analysis.
        </li>
        <li>
          <strong>Calculators</strong> — free estimators for the Old Pension Scheme, gratuity, and NPS / UPS. They run in
          your browser and give indicative figures only.
        </li>
        <li>
          <strong>News paper reports and state-wise orders</strong> — coverage that matters to employees, filtered by
          your state where relevant.
        </li>
      </ul>

      <h2>Where our information comes from</h2>
      <p>
        We publish circulars and notifications sourced from official government offices and from organisations that
        represent employees. We link to the original document wherever we can. Please always verify any order against
        the official gazette or the issuing office before acting on it.
      </p>

      <h2>Independent, not official</h2>
      <p>
        {SITE_NAME} is not a government website and is not connected with any government department. Please read our{' '}
        <Link href="/disclaimer">Disclaimer</Link> for details.
      </p>

      <h2>Get in touch</h2>
      <p>
        Found a mistake, or have a circular or suggestion to share? Please use our <Link href="/contact">Contact Us</Link>{' '}
        page.
      </p>
    </InfoPage>
  );
}
