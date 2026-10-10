import Link from 'next/link';
import { ArrowRight, Calculator, PiggyBank, Scale, Wallet, type LucideIcon } from 'lucide-react';
import type { CalculatorTool } from '@/lib/calculators';

const ICONS: Record<CalculatorTool['icon'], LucideIcon> = {
  wallet: Wallet,
  calculator: Calculator,
  piggy: PiggyBank,
  scale: Scale,
};

// Cards for the Calculators listing page: one grid, two across on wider
// screens, in the order of the tool list.
export default function CalculatorCards({ tools }: { tools: CalculatorTool[] }) {
  return (
    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {tools.map((tool) => {
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
  );
}
