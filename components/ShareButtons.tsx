'use client';

import { useEffect, useState } from 'react';

type Props = {
  url: string; // full address of the post
  title: string;
  label?: string;
};

const BUTTON_BASE =
  'inline-flex h-10 w-10 items-center justify-center rounded-full text-white transition-opacity hover:opacity-85 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-maroon';
// Each service in its own brand colour; the generic actions use the site's ink.
const BRAND = {
  WhatsApp: `${BUTTON_BASE} bg-[#25D366]`,
  Facebook: `${BUTTON_BASE} bg-[#1877F2]`,
  X: `${BUTTON_BASE} bg-black`,
  generic: `${BUTTON_BASE} bg-ink`,
} as const;

function Icon({ children }: { children: React.ReactNode }) {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true">
      {children}
    </svg>
  );
}

// Share row for a post: WhatsApp, Facebook, X, copy link, and the phone's own
// share menu where the browser offers one.
export default function ShareButtons({ url, title, label = 'Share this post' }: Props) {
  const [copied, setCopied] = useState(false);
  const [canNativeShare, setCanNativeShare] = useState(false);

  useEffect(() => {
    setCanNativeShare(typeof navigator !== 'undefined' && typeof navigator.share === 'function');
  }, []);

  useEffect(() => {
    if (!copied) return;
    const t = window.setTimeout(() => setCopied(false), 2500);
    return () => window.clearTimeout(t);
  }, [copied]);

  const text = encodeURIComponent(`${title}\n${url}`);
  const links = [
    {
      name: 'WhatsApp' as const,
      href: `https://wa.me/?text=${text}`,
      icon: (
        <Icon>
          <path d="M12.04 2a9.9 9.9 0 0 0-8.5 14.9L2 22l5.25-1.5A9.93 9.93 0 1 0 12.04 2Zm0 18.1a8.2 8.2 0 0 1-4.18-1.14l-.3-.18-3.1.89.9-3.03-.2-.31a8.2 8.2 0 1 1 6.88 3.77Zm4.5-6.14c-.25-.12-1.46-.72-1.69-.8-.23-.09-.39-.13-.56.12-.16.25-.64.8-.79.97-.14.16-.29.18-.54.06a6.7 6.7 0 0 1-1.98-1.22 7.4 7.4 0 0 1-1.37-1.7c-.14-.25 0-.38.1-.5.12-.11.25-.29.37-.43.13-.15.17-.25.25-.42.08-.17.04-.31-.02-.43-.06-.12-.56-1.35-.77-1.85-.2-.48-.4-.42-.56-.42h-.47c-.17 0-.43.06-.66.31-.22.25-.86.84-.86 2.05s.88 2.38 1 2.55c.12.17 1.73 2.64 4.2 3.7.59.26 1.05.41 1.4.52.59.19 1.13.16 1.55.1.47-.07 1.46-.6 1.66-1.17.2-.58.2-1.07.14-1.17-.06-.1-.23-.17-.48-.29Z" />
        </Icon>
      ),
    },
    {
      name: 'Facebook' as const,
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
      icon: (
        <Icon>
          <path d="M13.5 22v-8.2h2.8l.5-3.3h-3.3V8.4c0-.95.47-1.8 1.9-1.8h1.5V3.8S15.6 3.6 14.4 3.6c-2.6 0-4.3 1.6-4.3 4.4v2.5H7.2v3.3h2.9V22h3.4Z" />
        </Icon>
      ),
    },
    {
      name: 'X' as const,
      href: `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`,
      icon: (
        <Icon>
          <path d="M17.75 3h3.1l-6.77 7.74L22 21h-6.25l-4.9-6.4L5.25 21h-3.1l7.24-8.28L2 3h6.4l4.43 5.85L17.75 3Zm-1.09 16.14h1.72L7.4 4.76H5.55l11.11 14.38Z" />
        </Icon>
      ),
    },
  ];

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      // Older browsers: fall back to selecting a throwaway field.
      const field = document.createElement('input');
      field.value = url;
      document.body.appendChild(field);
      field.select();
      document.execCommand('copy');
      field.remove();
    }
    setCopied(true);
  }

  return (
    <div className="flex flex-wrap items-center gap-2 print:hidden" aria-label={label} role="group">
      <span className="mr-1 font-mono text-xs uppercase tracking-wide text-ink/50">Share</span>
      {links.map((l) => (
        <a
          key={l.name}
          href={l.href}
          target="_blank"
          rel="noopener noreferrer"
          className={BRAND[l.name]}
          aria-label={`Share on ${l.name}`}
          title={`Share on ${l.name}`}
        >
          {l.icon}
        </a>
      ))}
      <button type="button" onClick={copyLink} className={BRAND.generic} aria-label="Copy link" title="Copy link">
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M10 13a5 5 0 0 0 7.07 0l3-3a5 5 0 0 0-7.07-7.07l-1.5 1.5" />
          <path d="M14 11a5 5 0 0 0-7.07 0l-3 3a5 5 0 0 0 7.07 7.07l1.5-1.5" />
        </svg>
      </button>
      {canNativeShare && (
        <button
          type="button"
          onClick={() => navigator.share({ title, url }).catch(() => {})}
          className={`${BRAND.generic} sm:hidden`}
          aria-label="More sharing options"
          title="More"
        >
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <circle cx="18" cy="5" r="3" />
            <circle cx="6" cy="12" r="3" />
            <circle cx="18" cy="19" r="3" />
            <path d="m8.6 13.5 6.8 4M15.4 6.5l-6.8 4" />
          </svg>
        </button>
      )}
      <span role="status" aria-live="polite" className="text-sm font-medium text-leaf">
        {copied ? 'Link copied' : ''}
      </span>
    </div>
  );
}
