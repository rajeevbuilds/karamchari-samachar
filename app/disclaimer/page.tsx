import Link from 'next/link';
import InfoPage from '@/components/InfoPage';
import { LEGAL_LAST_UPDATED, SITE_NAME, SITE_DOMAIN } from '@/lib/site';

export const metadata = {
  title: 'Disclaimer',
  alternates: { canonical: '/disclaimer' },
  description: `Important notes on the information and calculators published on ${SITE_DOMAIN}.`,
};

export default function DisclaimerPage() {
  return (
    <InfoPage title="Disclaimer" updated={LEGAL_LAST_UPDATED}>
      <h2>Not an official government website</h2>
      <p>
        {SITE_NAME} ({SITE_DOMAIN}) is an independent information website. It is not owned, operated or endorsed by the
        Government of India, any State Government, any ministry or department, or any employee union or federation.
      </p>

      <h2>Information is for general awareness</h2>
      <p>
        We publish circulars, orders, notifications, news and explainers sourced from official offices and other
        sources, and link to the original document wherever it is available. We take care to be accurate, but we do not
        guarantee that everything is complete, current or error-free. A circular may be amended, withdrawn or
        superseded after we publish it.
      </p>
      <p>
        <strong>Always verify against the official gazette or the issuing office before acting on any
        notification.</strong>
      </p>

      <h2>Calculators give estimates only</h2>
      <p>
        The pension, gratuity and NPS / UPS calculators produce indicative estimates from the figures you enter and the
        assumptions shown on the page (for example market returns, Dearness Allowance, pay commission outcomes and
        annuity rates). Real figures depend on your individual service record and on rules and decisions that may change.
        Results are not an official calculation. Please confirm your entitlements with your department, pay and
        accounts office or the relevant authority such as PFRDA before making any decision.
      </p>

      <h2>Not professional advice</h2>
      <p>
        Nothing on this site is legal, financial, tax or investment advice. NPS returns are market-linked and are not
        guaranteed.
      </p>

      <h2>External links and advertisements</h2>
      <p>
        We link to other websites for your convenience and are not responsible for their content or availability. The
        site may display third-party advertisements; their appearance is not an endorsement of any product or service.
      </p>

      <h2>Limitation of liability</h2>
      <p>
        To the fullest extent permitted by law, we are not liable for any loss or damage arising from the use of, or
        reliance on, the information or calculators on this site.
      </p>

      <h2>Corrections</h2>
      <p>
        If you notice an error, please tell us through the <Link href="/contact">Contact Us</Link> page and we will
        review it.
      </p>
    </InfoPage>
  );
}
