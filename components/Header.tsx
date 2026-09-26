import Link from 'next/link';
import Image from 'next/image';

const NAV = [
  { href: '/', label: 'Home' },
  { href: '/section/railway-board', label: 'Railway Board Circulars' },
  { href: '/section/dopt', label: 'DOPT Circular' },
  { href: '/section/fin-min', label: 'Fin Min Circular' },
  { href: '/section/defence', label: 'Defence' },
  { href: '/da-cpc-tracker', label: '8th Pay Commission' },
  { href: '/section/nps', label: 'NPS' },
  { href: '/section/cghs', label: 'CGHS' },
  { href: '/section/ups', label: 'UPS' },
  { href: '/section/news-paper-reports', label: 'News Paper Reports' },
  { href: '/states/punjab', label: 'By State' },
];

function todayFormatted() {
  return new Date().toLocaleDateString('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export default function Header() {
  return (
    <header className="border-b border-rule bg-paper">
      <div className="bg-ink text-paper/80 text-xs">
        <div className="mx-auto max-w-[1200px] px-4 py-1.5 flex items-center justify-between">
          <span className="font-mono">{todayFormatted()}</span>
          <span className="font-mono hidden sm:inline">Central &amp; State Government Employee News</span>
        </div>
      </div>
      <div className="mx-auto max-w-[1200px] px-4 pt-4">
        <Image
          src="/header-banner.png"
          alt="Karamchari Samachar — Inform, Empower, Serve"
          width={1200}
          height={200}
          priority
          className="w-full h-auto"
          sizes="(max-width: 1200px) 100vw, 1200px"
        />
      </div>
      <div className="mx-auto max-w-[1200px] px-4 py-5">
        <Link href="/" className="block">
          <h1 className="font-serif text-[clamp(28px,5vw,40px)] font-semibold text-ink tracking-tight">
            Sarkari Karamchari Samachar
          </h1>
          <p className="mt-1 text-sm text-ink/60">
            कर्मचारी समाचार — DA, Circulars &amp; Pay Updates
          </p>
        </Link>
      </div>
      <nav className="border-t border-rule">
        <div className="mx-auto max-w-[1200px] px-4">
          <ul className="flex flex-wrap gap-x-6 gap-y-1 text-sm py-2.5">
            {NAV.map((item, i) => (
              <li key={`${item.label}-${i}`}>
                <Link
                  href={item.href}
                  className="text-ink/80 hover:text-maroon transition-colors"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </nav>
    </header>
  );
}
