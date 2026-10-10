import Link from 'next/link';
import { ArrowRight, Calculator, PiggyBank, Scale, Wallet, type LucideIcon } from 'lucide-react';
import type { CalculatorTool } from '@/lib/calculators';

const ICONS: Record<CalculatorTool['icon'], LucideIcon> = {
  wallet: Wallet,
  calculator: Calculator,
  piggy: PiggyBank,
  scale: Scale,
};

// Cards for the Calculators listing page, grouped under headings in the order
// the groups first appear in the tool list.
export default function CalculatorCards({ tools }: { tools: CalculatorTool[] }) {
  const groups: { name: string; tools: CalculatorTool[] }[] = [];
  for (const tool of tools) {
    const group = groups.find((g) => g.name === tool.group);
    if (group) group.tools.push(tool);
    else groups.push({ name: tool.group, tools: [tool] });
  }

  return (
    <div className="flex flex-col gap-8">
      {groups.map((group) => (
        <section key={group.name} aria-labelledby={`group-${group.name}`}>
          <h2
            id={`group-${group.name}`}
            className="font-serif text-xl font-semibold text-ink mb-3 pl-3 border-l-4 border-maroon"
          >
            {group.name}
          </h2>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {group.tools.map((tool) => {
              const Icon = ICONS[tool.icon];
              return (
                <li key={tool.href}>
                  <Link
                    href={tool.href}
                    className="group flex h-full flex-col border border-rule bg-white/40 p-5 transition-colors hover:border-maroon focus:outline-none focus-visible:ring-2 focus-visible:ring-maroon"
                  >
                    <span className="mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-maroon/10 text-maroon">
                      <Icon size={22} aria-hidden="true" />
                    </span>
                    <span className="font-serif text-lg font-semibold leading-snug text-ink group-hover:text-maroon">
                      {tool.title}
                    </span>
                    <span className="mt-1 text-sm leading-relaxed text-ink/70">{tool.short}</span>
                    <span className="mt-auto pt-4 inline-flex items-center gap-1 text-sm font-medium text-maroon">
                      Open calculator
                      <ArrowRight size={16} aria-hidden="true" className="transition-transform group-hover:translate-x-0.5" />
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>
      ))}
    </div>
  );
}
