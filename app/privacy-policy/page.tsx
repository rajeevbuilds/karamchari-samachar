import Link from 'next/link';
import InfoPage from '@/components/InfoPage';
import { LEGAL_LAST_UPDATED, SITE_NAME, SITE_DOMAIN } from '@/lib/site';

export const metadata = {
  title: 'Privacy Policy',
  alternates: { canonical: '/privacy-policy' },
  description: `How ${SITE_NAME} handles information when you visit ${SITE_DOMAIN}.`,
};

export default function PrivacyPolicyPage() {
  return (
    <InfoPage title="Privacy Policy" updated={LEGAL_LAST_UPDATED}>
      <p>
        This Privacy Policy explains what information {SITE_NAME} ({SITE_DOMAIN}, &ldquo;we&rdquo;, &ldquo;us&rdquo;)
        handles when you visit the website. We keep it to the minimum needed to run the site, and we do not ask
        visitors to create an account.
      </p>

      <h2>Information we do not collect</h2>
      <ul>
        <li>We do not require you to register, log in or give your name, phone number or email address to read the site.</li>
        <li>
          <strong>Our calculators</strong> (pension, gratuity, NPS / UPS) work inside your browser. The dates, pay and
          other figures you type in are not sent to our servers and are not stored by us.
        </li>
      </ul>

      <h2>Information handled automatically</h2>
      <ul>
        <li>
          <strong>Page-view counts.</strong> We count how many times each post is opened, and the total views of the
          site. These are plain totals and do not identify you.
        </li>
        <li>
          <strong>Server logs.</strong> Like most websites, our hosting provider records technical details of each
          request, such as IP address, browser type, the page requested and the time. This is used to keep the site
          secure and working.
        </li>
        <li>
          <strong>Messages you send us.</strong> If you email or message us, we receive the details you choose to share
          and use them only to respond or to improve the site.
        </li>
      </ul>

      <h2>Analytics</h2>
      <p>
        We use Google Analytics to understand how visitors use the site, for example which pages are read and which
        websites send readers to us. Google Analytics uses cookies and similar technologies to collect information such
        as your approximate location, device and browser type, and the pages you view. It does not tell us your name or
        contact details. You can opt out with the{' '}
        <a href="https://tools.google.com/dlpage/gaoptout" target="_blank" rel="noopener noreferrer">
          Google Analytics opt-out browser add-on
        </a>
        , and learn more in{' '}
        <a href="https://policies.google.com/technologies/partner-sites" target="_blank" rel="noopener noreferrer">
          how Google uses information from sites that use its services
        </a>
        .
      </p>

      <h2>Cookies</h2>
      <p>
        The site itself does not set cookies for visitors. A login cookie is used only for the site&apos;s administrators.
        Third-party services, such as Google Analytics and advertising partners, may set their own cookies.
      </p>

      <h2>Advertising</h2>
      <p>
        We may display advertisements provided by third-party networks, such as Google AdSense. These providers may use
        cookies or similar technologies to show ads based on your visits to this and other websites. You can manage
        personalised advertising through{' '}
        <a href="https://adssettings.google.com" target="_blank" rel="noopener noreferrer">
          Google Ads Settings
        </a>{' '}
        or{' '}
        <a href="https://www.aboutads.info" target="_blank" rel="noopener noreferrer">
          aboutads.info
        </a>
        . We do not control, and are not responsible for, how advertisers handle information.
      </p>
      <p>
        Google, as a third-party vendor, uses cookies to serve ads on this site. Google&apos;s use of advertising cookies
        enables it and its partners to serve ads to you based on your visit to this site and/or other sites on the
        internet. You may opt out of personalised advertising by visiting{' '}
        <a href="https://adssettings.google.com" target="_blank" rel="noopener noreferrer">
          Google Ads Settings
        </a>
        . To learn how Google uses information from sites that use its services, see{' '}
        <a href="https://policies.google.com/technologies/partner-sites" target="_blank" rel="noopener noreferrer">
          How Google uses information from sites or apps that use our services
        </a>
        .
      </p>

      <h2>Links and images from other websites</h2>
      <p>
        The site links to official government websites and other sources, and displays some images hosted elsewhere
        (for example by organisations whose circulars we report). Those sites have their own privacy practices, which we
        do not control.
      </p>

      <h2>Children</h2>
      <p>
        The site is meant for government employees, pensioners and their families. It is not directed at children, and
        we do not knowingly collect information from them.
      </p>

      <h2>How we protect and use information</h2>
      <p>
        We use the limited information described above only to run, secure and improve the site. We do not sell it. We
        aim to handle information in line with applicable Indian law.
      </p>

      <h2>Changes to this policy</h2>
      <p>
        We may update this policy from time to time. The &ldquo;last updated&rdquo; date at the top shows when it last
        changed. Continued use of the site means you accept the updated policy.
      </p>

      <h2>Questions</h2>
      <p>
        If you have a question about this policy, please use our <Link href="/contact">Contact Us</Link> page.
      </p>
    </InfoPage>
  );
}
