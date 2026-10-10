import JsonLd from '@/components/JsonLd';
import { SITE_URL } from '@/lib/site';
import { PAY_FIXATION_TOOL } from '@/lib/calculators';
import PayFixationCalculator from '@/components/PayFixationCalculator';

export const metadata = {
  title: PAY_FIXATION_TOOL.title,
  alternates: { canonical: PAY_FIXATION_TOOL.href },
  description: PAY_FIXATION_TOOL.description,
};

export default function PayFixationPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'WebApplication',
          name: PAY_FIXATION_TOOL.title,
          description: PAY_FIXATION_TOOL.description,
          url: `${SITE_URL}${PAY_FIXATION_TOOL.href}`,
          applicationCategory: 'FinanceApplication',
          operatingSystem: 'Any',
          offers: { '@type': 'Offer', price: '0', priceCurrency: 'INR' },
        }}
      />
      <h1 className="font-serif text-3xl font-semibold text-ink mb-2 print:hidden">{PAY_FIXATION_TOOL.title}</h1>
      <p className="text-sm text-ink/60 mb-8 max-w-prose print:hidden">{PAY_FIXATION_TOOL.description}</p>
      <PayFixationCalculator />
    </div>
  );
}
