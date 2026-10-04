import type { Metadata, Viewport } from 'next';
import './globals.css';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import BottomNav from '@/components/mobile/BottomNav';
import SwipeTransition from '@/components/mobile/SwipeTransition';
import RegisterServiceWorker from '@/components/RegisterServiceWorker';
import JsonLd from '@/components/JsonLd';
import Analytics from '@/components/Analytics';
import { SITE_DESCRIPTION, SITE_LOGO_URL, SITE_NAME, SITE_TITLE, SITE_URL } from '@/lib/site';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#7E1F35',
};

export const metadata: Metadata = {
  // Absolute URLs for canonical links and social images are built from this.
  metadataBase: new URL(SITE_URL),
  // Pages set just their own title; the site name is added after it.
  title: { default: SITE_TITLE, template: `%s — ${SITE_NAME}` },
  description: SITE_DESCRIPTION,
  openGraph: {
    type: 'website',
    siteName: SITE_NAME,
    locale: 'en_IN',
    url: SITE_URL,
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    images: [{ url: '/header-banner.png' }],
  },
  twitter: { card: 'summary_large_image' },
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Karamchari Samachar',
  },
  icons: {
    icon: [
      { url: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: '/icons/apple-touch-icon.png',
  },
  other: {
    // Next's appleWebApp.capable only emits the newer `mobile-web-app-capable`
    // tag; older iOS Safari versions still key off this Apple-specific one.
    'apple-mobile-web-app-capable': 'yes',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="font-sans antialiased pb-16 md:pb-0">
        <RegisterServiceWorker />
        <Analytics />
        <JsonLd
          data={[
            {
              '@context': 'https://schema.org',
              '@type': 'Organization',
              name: SITE_NAME,
              url: SITE_URL,
              logo: SITE_LOGO_URL,
            },
            {
              '@context': 'https://schema.org',
              '@type': 'WebSite',
              name: SITE_NAME,
              url: SITE_URL,
              inLanguage: ['en-IN', 'hi-IN'],
            },
          ]}
        />
        <Header />
        <SwipeTransition>{children}</SwipeTransition>
        <Footer />
        <BottomNav />
      </body>
    </html>
  );
}
