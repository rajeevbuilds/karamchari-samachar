import Link from 'next/link';
import Image from 'next/image';
import { EIGHTH_CPC_TOOL } from '@/lib/calculators';

// Homepage block for the 8th CPC Salary Calculator: a picture and a button.
// It takes the place of the "8th Pay Commission" block of posts; those posts
// stay one click away through "More" and the 8th Pay Commission tab.
export default function EighthCpcPromo() {
  return (
    <section className="pb-10">
      <div className="flex items-center gap-3 mb-5">
        <span className="block w-1.5 h-7 bg-maroon" aria-hidden="true" />
        <h2 className="font-serif text-2xl font-semibold text-ink">8th Pay Commission</h2>
        <span className="flex-1 border-t border-maroon/50" aria-hidden="true" />
        <Link href="/section/pay-commission" className="text-sm font-medium text-maroon hover:underline whitespace-nowrap">
          News ›
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[1fr_1fr] gap-5 border border-rule bg-white/40">
        <Link href={EIGHTH_CPC_TOOL.href} className="block relative aspect-[1200/630] md:aspect-auto md:min-h-[240px] overflow-hidden bg-ink" aria-label={EIGHTH_CPC_TOOL.title}>
          <Image
            src={EIGHTH_CPC_TOOL.shareImage}
            alt="8वाँ वेतन आयोग Salary Calculator: कितनी बढ़ेगी सैलरी, HRA और TA, Arrears सहित पूरा हिसाब"
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 380px"
          />
        </Link>
        <div className="flex flex-col justify-center gap-3 p-5 md:pl-0">
          <h3 className="font-serif text-xl font-semibold text-ink leading-snug">{EIGHTH_CPC_TOOL.title}</h3>
          <p className="text-sm text-ink/70 leading-relaxed">
            कितनी बढ़ेगी आपकी सैलरी, HRA और TA? Fitment factor 1.50 से 3.00 चुनिए और Arrears सहित पूरा हिसाब देखिए।
          </p>
          <div>
            <Link
              href={EIGHTH_CPC_TOOL.href}
              className="inline-block bg-maroon px-5 py-3 text-sm font-semibold text-white hover:bg-ink transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-maroon focus-visible:ring-offset-2"
            >
              8th CPC Calculator: हिसाब लगाएं →
            </Link>
          </div>
          <p className="text-xs text-ink/50">Estimate only. The 8th Pay Commission has not yet reported.</p>
        </div>
      </div>
    </section>
  );
}
