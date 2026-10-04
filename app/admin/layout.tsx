import type { ReactNode } from 'react';
import AdminOptOut from '@/components/admin/AdminOptOut';

// Nothing under /admin should ever appear in search results.
export const metadata = { robots: { index: false, follow: false } };

export default function AdminRootLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <AdminOptOut />
      {children}
    </>
  );
}
