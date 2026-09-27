// Interactive tools filed under /section/[slug] (currently just
// "calculators"), shown above that section's circular listing so visitors
// browsing find the actual tool, not just articles about it. Each tool's
// description is the single source of truth for both its card on the
// section page and its subtitle on the tool's own page, so search visitors
// landing directly on the tool see the same copy as those browsing there.

export type CalculatorTool = {
  href: string;
  title: string;
  description: string;
};

export const PENSION_OPS_TOOL: CalculatorTool = {
  href: '/calculators/pension-ops',
  title: 'OPS Pension Calculator',
  description:
    'Estimate your monthly pension under the Old Pension Scheme (CCS Pension Rules, 1972). Enter your last drawn Basic Pay and qualifying service to get an instant estimate.',
};

// Add future calculators (Gratuity, Commutation, ...) here as they ship.
export const SECTION_TOOLS: Record<string, CalculatorTool[]> = {
  calculators: [PENSION_OPS_TOOL],
};
