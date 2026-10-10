'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  TrainFront,
  FileText,
  IndianRupee,
  Shield,
  LineChart,
  Newspaper,
  Calculator,
  PiggyBank,
  HeartPulse,
  Landmark,
  PieChart,
  Scale,
  Wallet,
  MapPin,
  type LucideIcon,
} from 'lucide-react';
import { PRIMARY_NAV, MORE_NAV, isActive } from '../MainNav';
import { INFO_LINKS } from '@/lib/site';

const ICONS: Record<string, LucideIcon> = {
  '/': Home,
  '/section/railway-board': TrainFront,
  '/section/dopt': FileText,
  '/section/fin-min': IndianRupee,
  '/section/defence': Shield,
  '/da-cpc-tracker': LineChart,
  '/section/news-paper-reports': Newspaper,
  '/section/calculators': Calculator,
  '/section/nps': PiggyBank,
  '/section/cghs': HeartPulse,
  '/section/ups': Landmark,
  '/section/analysis': PieChart,
  '/section/pay-commission': Scale,
  '/calculators/pension-ops': Wallet,
  '/calculators/gratuity': Calculator,
  '/calculators/nps': PiggyBank,
  '/calculators/pay-fixation': Calculator,
  '/states/punjab': MapPin,
};

const ALL_ITEMS = [...PRIMARY_NAV, ...MORE_NAV];

export default function HamburgerMenu() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // Close the panel on navigation.
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Lock body scroll while the panel is open.
  useEffect(() => {
    if (!open) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Open menu"
        aria-expanded={open}
        className="md:hidden absolute left-4 top-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center text-ink"
      >
        <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true">
          <path d="M2 5.5H20M2 11H20M2 16.5H20" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      </button>

      {open && (
        <div className="md:hidden fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-ink/50"
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />
          <div className="absolute left-0 top-0 h-full w-[82%] max-w-xs overflow-y-auto bg-paper shadow-lg">
            <div className="flex items-center justify-between border-b border-rule px-4 py-4">
              <span className="font-serif text-lg font-semibold text-ink">Menu</span>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close menu"
                className="flex h-8 w-8 items-center justify-center text-ink"
              >
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
                  <path d="M2 2L16 16M16 2L2 16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                </svg>
              </button>
            </div>
            <ul className="py-2">
              {ALL_ITEMS.map((item) => {
                const Icon = ICONS[item.href];
                const active = isActive(pathname, item.href);
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={`flex items-center gap-3 px-4 py-3 text-sm font-bold border-b border-rule/60 ${
                        active ? 'text-maroon' : 'text-ink/80'
                      }`}
                    >
                      {Icon && <Icon size={18} strokeWidth={2} className="shrink-0" aria-hidden="true" />}
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
            <p className="px-4 pt-4 pb-1 font-mono text-[11px] uppercase tracking-wide text-ink/50">More info</p>
            <ul className="pb-4">
              {INFO_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className={`block px-4 py-2.5 text-sm border-b border-rule/60 ${
                      isActive(pathname, link.href) ? 'text-maroon font-bold' : 'text-ink/70'
                    }`}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </>
  );
}
