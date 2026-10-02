import Link from 'next/link';
import InfoPage from '@/components/InfoPage';
import { getAllSettings } from '@/lib/data';
import { SITE_NAME, whatsappHref } from '@/lib/site';

// Contact details come from the admin Settings page, so they can be changed
// without a redeploy.
export const dynamic = 'force-dynamic';

export const metadata = {
  title: `Contact Us — ${SITE_NAME}`,
  description: `How to reach ${SITE_NAME} with corrections, circulars, feedback or advertising enquiries.`,
};

export default async function ContactPage() {
  const settings = await getAllSettings();
  const email = settings.contact_email.trim();
  const whatsapp = whatsappHref(settings.contact_whatsapp);
  const hasDetails = Boolean(email || whatsapp);

  return (
    <InfoPage title="Contact Us">
      <p>
        We would like to hear from you. Write to us to report a mistake, share a circular or order, send feedback, or
        ask about advertising.
      </p>

      <h2>Reach us</h2>
      {hasDetails ? (
        <ul>
          {email && (
            <li>
              <strong>Email:</strong> <a href={`mailto:${email}`}>{email}</a>
            </li>
          )}
          {whatsapp && (
            <li>
              <strong>WhatsApp:</strong>{' '}
              <a href={whatsapp} target="_blank" rel="noopener noreferrer">
                Message us on WhatsApp
              </a>
            </li>
          )}
        </ul>
      ) : (
        <p>Our contact details will be published on this page shortly.</p>
      )}

      <h2>When you write to us</h2>
      <ul>
        <li>For a correction, please include the link to the page and, if you can, the official source.</li>
        <li>
          For a circular you would like us to publish, please attach or link the official document. We publish only what
          can be traced to an official source.
        </li>
        <li>
          We read every message but may not be able to reply to all of them. We cannot give individual advice on pay,
          pension or service matters — please contact your department or accounts office for that.
        </li>
      </ul>

      <p>
        Please also read our <Link href="/disclaimer">Disclaimer</Link> and <Link href="/privacy-policy">Privacy Policy</Link>.
      </p>
    </InfoPage>
  );
}
