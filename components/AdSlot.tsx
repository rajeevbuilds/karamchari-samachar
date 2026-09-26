// Placeholder ad unit — swap the inner content for the real AdSense
// script/unit once we're approved. Sized for a standard sticky sidebar
// skyscraper (300x600); stays put while the article scrolls past it.
export default function AdSlot() {
  return (
    <div className="lg:sticky lg:top-6">
      <div className="w-full max-w-[300px] mx-auto lg:mx-0 h-[600px] border border-dashed border-rule flex items-center justify-center bg-rule/10">
        <span className="font-mono text-xs uppercase tracking-wide text-ink/40">Advertisement</span>
      </div>
    </div>
  );
}
