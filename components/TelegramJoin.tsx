import { TELEGRAM_URL } from '@/lib/site';

const PLANE =
  'M9.78 15.17l-.4 5.6c.58 0 .83-.25 1.13-.55l2.7-2.58 5.6 4.1c1.03.57 1.76.27 2.04-.95l3.7-17.35c.33-1.52-.55-2.12-1.56-1.74L1.3 9.5c-1.48.58-1.46 1.4-.26 1.77l5.55 1.73L19.5 5c.6-.4 1.15-.18.7.22L9.78 15.17Z';

// "Join on Telegram" link. `bar` is the slim version for the dark top bar; the
// default is a button, and `card` adds a short invitation for the end of a post.
export default function TelegramJoin({ variant = 'button' }: { variant?: 'bar' | 'button' | 'card' }) {
  const icon = (size: number) => (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor" aria-hidden="true">
      <path d={PLANE} />
    </svg>
  );
  const link = { href: TELEGRAM_URL, target: '_blank', rel: 'noopener noreferrer' } as const;

  if (variant === 'bar') {
    return (
      <a {...link} className="inline-flex items-center gap-1.5 hover:text-paper hover:underline">
        {icon(14)}
        <span>Join on Telegram</span>
      </a>
    );
  }

  const button = (
    <a
      {...link}
      className="inline-flex items-center gap-2 rounded-full bg-[#229ED9] px-5 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-85 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-maroon"
    >
      {icon(18)}
      Join us on Telegram
    </a>
  );
  if (variant === 'button') return button;

  return (
    <div className="mt-8 border border-rule p-5 flex flex-col sm:flex-row sm:items-center gap-4 print:hidden">
      <div className="flex-1">
        <p className="font-serif text-lg font-semibold text-ink">नई खबरें सीधे अपने फोन पर</p>
        <p className="text-sm text-ink/70">
          DA, वेतन आयोग, पेंशन और नए सर्कुलर की जानकारी पाने के लिए हमारा Telegram चैनल जॉइन करें। Get new circulars and
          updates on your phone.
        </p>
      </div>
      {button}
    </div>
  );
}
