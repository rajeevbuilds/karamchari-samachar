import Link from 'next/link';
import Image from 'next/image';
import MainNav from './MainNav';
import HamburgerMenu from './mobile/HamburgerMenu';

// The two information pages readers look for most; all five are in the footer.
const TOP_BAR_LINKS = [
  { href: '/about', label: 'About Us' },
  { href: '/contact', label: 'Contact Us' },
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
          <span className="font-mono hidden lg:inline">Central &amp; State Government Employee News</span>
          <nav aria-label="About and contact" className="flex items-center gap-4 font-mono">
            {TOP_BAR_LINKS.map((link) => (
              <Link key={link.href} href={link.href} className="hover:text-paper hover:underline">
                {link.label}
              </Link>
            ))}
          </nav>
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
      <div className="relative mx-auto max-w-[1200px] pl-14 pr-4 py-5 md:px-4">
        <HamburgerMenu />
        <Link href="/" className="block">
          <h1 className="font-serif text-[clamp(28px,5vw,40px)] font-semibold text-ink tracking-tight">
            Sarkari Karamchari Samachar
          </h1>
          <p className="mt-1 text-sm text-ink/60">
            कर्मचारी समाचार — DA, Circulars &amp; Pay Updates
          </p>
        </Link>
      </div>
      <MainNav />
    </header>
  );
}
