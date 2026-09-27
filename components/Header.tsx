import Link from 'next/link';
import Image from 'next/image';
import MainNav from './MainNav';

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
      <MainNav />
    </header>
  );
}
