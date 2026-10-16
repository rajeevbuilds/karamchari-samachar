import Link from 'next/link';
import Image from 'next/image';
import { SECTION_TOOLS, type CalculatorTool } from '@/lib/calculators';

// "Calculators" block for the homepage, built like the section blocks of
// posts: a ruled heading with "More ›" on the right, one large lead (the first
// calculator, with its picture), one smaller entry under it and four on the
// right. Six calculators fill it; with fewer, the right side has fewer rows.
function ToolRow({ tool }: { tool: CalculatorTool }) {
  return (
    <Link href={tool.href} className="group flex items-start gap-3 py-2.5">
      <div className="relative w-28 aspect-[1200/630] shrink-0 overflow-hidden bg-rule/20">
        <Image src={tool.shareImage} alt="" fill className="object-cover" sizes="112px" />
      </div>
      <div className="min-w-0">
        <h3 className="font-serif text-sm font-semibold text-ink leading-snug line-clamp-2 group-hover:text-maroon transition-colors">
          {tool.title}
        </h3>
        <span className="text-xs text-ink/60 mt-1 block line-clamp-2">{tool.short}</span>
      </div>
    </Link>
  );
}

export default function HomeCalculatorsBlock() {
  const tools = SECTION_TOOLS.calculators ?? [];
  if (tools.length === 0) return null;
  const [lead, second, ...rest] = tools;
  const right = rest.slice(0, 4);

  return (
    <section className="pb-10">
      <div className="flex items-center gap-3 mb-5">
        <span className="block w-1.5 h-7 bg-maroon" aria-hidden="true" />
        <h2 className="font-serif text-2xl font-semibold text-ink">Calculators</h2>
        <span className="flex-1 border-t border-maroon/50" aria-hidden="true" />
        <Link href="/section/calculators" className="text-sm font-medium text-maroon hover:underline whitespace-nowrap">
          More ›
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[3fr_2fr] gap-x-8">
        <div>
          <Link href={lead.href} className="group block">
            <div className="relative w-full aspect-[1200/630] overflow-hidden bg-ink">
              <Image
                src={lead.shareImage}
                alt={lead.title}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                sizes="(max-width: 1024px) 100vw, 520px"
              />
            </div>
            <div className="pt-3 pb-1">
              <h3 className="font-serif text-lg font-semibold text-ink leading-snug group-hover:text-maroon transition-colors">
                {lead.title}
              </h3>
              <p className="text-sm text-ink/70 mt-1 line-clamp-2">{lead.short}</p>
              <span className="inline-block mt-2 text-sm font-semibold text-maroon">हिसाब लगाएं →</span>
            </div>
          </Link>
          {second && (
            <div className="border-b border-rule lg:border-b-0">
              <ToolRow tool={second} />
            </div>
          )}
        </div>

        {right.length > 0 && (
          <div className="mt-2 lg:mt-0 lg:border-l border-rule lg:pl-8">
            {right.map((tool) => (
              <div key={tool.href} className="border-b border-rule last:border-b-0">
                <ToolRow tool={tool} />
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
