import Link from 'next/link';
import InfoPage from '@/components/InfoPage';
import { SITE_NAME, SITE_DOMAIN } from '@/lib/site';

export const metadata = {
  title: 'Editorial Policy: How We Verify Our Posts',
  alternates: { canonical: '/editorial-policy' },
  description: `How ${SITE_NAME} (${SITE_DOMAIN}) chooses, checks, labels and corrects what it publishes about circulars, DA, pay commission and pension for government employees.`,
};

const UPDATED = '30 October 2026';

export default function EditorialPolicyPage() {
  return (
    <InfoPage title="Editorial Policy" updated={UPDATED}>
      <p>
        Employees and pensioners act on what they read here: they plan transfers, apply for leave, claim arrears and
        file for pension benefits. So we follow a few simple rules before anything is published. This page explains
        them.
      </p>

      <p lang="hi">
        <strong>संक्षेप में:</strong> हम हर पोस्ट में आदेश का नंबर और तारीख देते हैं, आंकड़े सरकारी आदेश से मिलाते हैं,
        जो बात पक्की नहीं होती उसे &ldquo;रिपोर्टों के अनुसार&rdquo; लिखते हैं, उदाहरण और अनुमान को साफ-साफ उदाहरण या
        अनुमान लिखते हैं, और गलती मिलने पर सुधारते हैं।
      </p>

      <h2>What we publish</h2>
      <ul>
        <li>Circulars and orders from the Railway Board, DOPT, the Finance Ministry, Defence and other departments.</li>
        <li>Plain-language explainers on pay, DA, allowances, leave, transfer, pension and retirement rules.</li>
        <li>News on the 8th Pay Commission and on DA revisions.</li>
        <li>Calculators, which give estimates and not official figures.</li>
      </ul>

      <h2>Where our information comes from</h2>
      <p>
        <strong>Official documents come first.</strong> Wherever an order, notification or notice exists, we work from
        it: the Gazette of India, orders of DOPT, the Department of Expenditure, the Department of Pension and
        Pensioners&apos; Welfare, Railway Board (RBE) letters, notices of the Pay Commission, press releases of the
        Press Information Bureau, and replies given in Parliament.
      </p>
      <p>
        <strong>Other sources are used to find leads, not as proof.</strong> News sites and employee-news sites often
        report an order first. We use them to learn that an order exists and then look for the order itself. When we
        cannot see the order and rely on a report, we say so in the post, usually with the words &ldquo;according to
        reports&rdquo;.
      </p>

      <h2>What we check before we publish</h2>
      <ul>
        <li>The order number, date and issuing office are identified and written in the post.</li>
        <li>Figures, percentages, dates, time limits and eligibility conditions are matched against the order.</li>
        <li>Every table and calculation is worked out again before it is published.</li>
        <li>Anything we could not confirm is labelled as unconfirmed. We do not publish rumours as facts.</li>
        <li>Posts that explain an order end with a list of the sources used, and link to the original where we can.</li>
      </ul>

      <h2>How we label estimates and examples</h2>
      <p>
        Calculations that show what <em>could</em> happen, such as pay under a possible fitment factor, are marked as
        illustrative and are not presented as the Pay Commission&apos;s view. Our calculators give indicative figures
        only. Your pay slip, your Pay and Accounts Office and the official order decide the final amount.
      </p>

      <h2>Who writes and checks the posts</h2>
      <p>
        {SITE_NAME} is run by its editor, who is responsible for everything published here. We may use software tools,
        including AI-assisted tools, to help with research and with first drafts. Nothing is published until the editor
        has read it and checked it against the official order as described above.
      </p>

      <h2>Corrections and updates</h2>
      <p>
        If you find a mistake, please tell us through the <Link href="/contact">Contact Us</Link> page and, if you can,
        send the order number or a link to the document. We check the report against the source and correct the post
        promptly. When a matter changes, such as a new DA rate or a new order on the same subject, we update the post or
        publish a new one and say what changed.
      </p>

      <h2>Independence and advertising</h2>
      <p>
        {SITE_NAME} is an independent website and is not connected with any government department. Advertisements, when
        they are shown, are placed by third-party advertising services and do not decide what we write. See our{' '}
        <Link href="/disclaimer">Disclaimer</Link> and <Link href="/privacy-policy">Privacy Policy</Link>.
      </p>

      <h2>Not professional advice</h2>
      <p>
        What we publish is general information. It is not legal, tax or financial advice. For your own case, check the
        original order and speak to your personnel or accounts branch, or to a qualified adviser.
      </p>
    </InfoPage>
  );
}
