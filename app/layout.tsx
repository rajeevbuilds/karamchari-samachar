import type { Metadata, Viewport } from 'next';
import './globals.css';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import BottomNav from '@/components/mobile/BottomNav';
import SwipeTransition from '@/components/mobile/SwipeTransition';
import RegisterServiceWorker from '@/components/RegisterServiceWorker';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#7E1F35',
};

export const metadata: Metadata = {
  title: 'Sarkari Karamchari Samachar — DA, Circulars & Pay Updates for Government Employees',
  description:
    'Sarkari Karamchari Samachar tracks Dearness Allowance updates, circulars, pay commission news and transfer orders for central and state government employees across India.',
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
        <Header />
        <SwipeTransition>{children}</SwipeTransition>
        <Footer />
        <BottomNav />
      </body>
    </html>
  );
}
