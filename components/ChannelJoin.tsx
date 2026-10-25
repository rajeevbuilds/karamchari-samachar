import { TELEGRAM_URL, WHATSAPP_CHANNEL_URL } from '@/lib/site';
import NotifyButton from './NotifyButton';

const TELEGRAM_ICON =
  'M9.78 15.17l-.4 5.6c.58 0 .83-.25 1.13-.55l2.7-2.58 5.6 4.1c1.03.57 1.76.27 2.04-.95l3.7-17.35c.33-1.52-.55-2.12-1.56-1.74L1.3 9.5c-1.48.58-1.46 1.4-.26 1.77l5.55 1.73L19.5 5c.6-.4 1.15-.18.7.22L9.78 15.17Z';
const WHATSAPP_ICON =
  'M12.04 2a9.9 9.9 0 0 0-8.5 14.9L2 22l5.25-1.5A9.93 9.93 0 1 0 12.04 2Zm0 18.1a8.2 8.2 0 0 1-4.18-1.14l-.3-.18-3.1.89.9-3.03-.2-.31a8.2 8.2 0 1 1 6.88 3.77Zm4.5-6.14c-.25-.12-1.46-.72-1.69-.8-.23-.09-.39-.13-.56.12-.16.25-.64.8-.79.97-.14.16-.29.18-.54.06a6.7 6.7 0 0 1-1.98-1.22 7.4 7.4 0 0 1-1.37-1.7c-.14-.25 0-.38.1-.5.12-.11.25-.29.37-.43.13-.15.17-.25.25-.42.08-.17.04-.31-.02-.43-.06-.12-.56-1.35-.77-1.85-.2-.48-.4-.42-.56-.42h-.47c-.17 0-.43.06-.66.31-.22.25-.86.84-.86 2.05s.88 2.38 1 2.55c.12.17 1.73 2.64 4.2 3.7.59.26 1.05.41 1.4.52.59.19 1.13.16 1.55.1.47-.07 1.46-.6 1.66-1.17.2-.58.2-1.07.14-1.17-.06-.1-.23-.17-.48-.29Z';

const CHANNELS = [
  { name: 'Telegram', href: TELEGRAM_URL, icon: TELEGRAM_ICON, colour: 'bg-[#229ED9]' },
  { name: 'WhatsApp', href: WHATSAPP_CHANNEL_URL, icon: WHATSAPP_ICON, colour: 'bg-[#25D366]' },
] as const;

function Icon({ path, size }: { path: string; size: number }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor" aria-hidden="true">
      <path d={path} />
    </svg>
  );
}

// Links to the site's Telegram and WhatsApp channels. `bar` is the slim version
// for the dark top bar, as small coloured buttons; the default is a row of buttons, and `card` adds a short
// invitation for the end of a post.
export default function ChannelJoin({ variant = 'button' }: { variant?: 'bar' | 'button' | 'card' }) {
  const link = { target: '_blank', rel: 'noopener noreferrer' } as const;

  if (variant === 'bar') {
    return (
      <>
        {CHANNELS.map((c) => (
          <a
            key={c.name}
            href={c.href}
            {...link}
            className={`inline-flex items-center gap-1.5 rounded-full ${c.colour} px-3 py-1 font-medium text-white transition-opacity hover:opacity-85 focus:outline-none focus-visible:ring-2 focus-visible:ring-white`}
          >
            <Icon path={c.icon} size={14} />
            <span>
              <span className="hidden sm:inline">Join on </span>
              {c.name}
            </span>
          </a>
        ))}
        <NotifyButton variant="bar" />
      </>
    );
  }

  const buttons = (
    <div className="flex flex-wrap gap-3">
      {CHANNELS.map((c) => (
        <a
          key={c.name}
          href={c.href}
          {...link}
          className={`inline-flex items-center gap-2 rounded-full ${c.colour} px-5 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-85 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-maroon`}
        >
          <Icon path={c.icon} size={18} />
          Join us on {c.name}
        </a>
      ))}
      <NotifyButton variant="button" />
    </div>
  );
  if (variant === 'button') return buttons;

  return (
    <div className="mt-8 border border-rule p-5 flex flex-col sm:flex-row sm:items-center gap-4 print:hidden">
      <div className="flex-1">
        <p className="font-serif text-lg font-semibold text-ink">नई खबरें सीधे अपने फोन पर</p>
        <p className="text-sm text-ink/70">
          DA, वेतन आयोग, पेंशन और नए सर्कुलर की जानकारी पाने के लिए हमारा Telegram या WhatsApp चैनल जॉइन करें, या अलर्ट चालू करें। Get new
          circulars and updates on your phone.
        </p>
      </div>
      {buttons}
    </div>
  );
}
