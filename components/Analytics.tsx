'use client';

import { useEffect, useState } from 'react';
import Script from 'next/script';
import { usePathname } from 'next/navigation';
import { GA_MEASUREMENT_ID, SITE_DOMAIN } from '@/lib/site';

// Set in the browser of anyone who has opened the admin panel (see AdminOptOut),
// so the site owner's own visits are not counted.
export const OPT_OUT_KEY = 'ks_no_track';

// Loads Google Analytics on public pages only: never in /admin, never for a
// browser that has opted out, and only on the real website (not on localhost
// or preview addresses, so test visits do not pollute the numbers).
export default function Analytics() {
  const pathname = usePathname();
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    let optedOut = false;
    try {
      optedOut = localStorage.getItem(OPT_OUT_KEY) === '1';
    } catch {
      // Storage blocked: treat as a normal visitor.
    }
    const host = window.location.hostname.replace(/^www\./, '');
    setEnabled(!optedOut && host === SITE_DOMAIN);
  }, []);

  if (!enabled || pathname.startsWith('/admin')) return null;

  return (
    <>
      <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`} strategy="afterInteractive" />
      <Script id="ga-init" strategy="afterInteractive">
        {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${GA_MEASUREMENT_ID}');`}
      </Script>
    </>
  );
}
