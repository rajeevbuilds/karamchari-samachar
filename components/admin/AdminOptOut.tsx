'use client';

import { useEffect } from 'react';
import { OPT_OUT_KEY } from '@/components/Analytics';

// Marks this browser as the site owner's, so Google Analytics ignores its visits.
export default function AdminOptOut() {
  useEffect(() => {
    try {
      localStorage.setItem(OPT_OUT_KEY, '1');
    } catch {
      // Storage blocked: nothing to do.
    }
  }, []);
  return null;
}
