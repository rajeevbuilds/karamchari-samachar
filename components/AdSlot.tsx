'use client';

import { useEffect, useRef } from 'react';

// Renders an admin-configured AdSense embed (raw script + ins tags, from
// /admin/settings). React's dangerouslySetInnerHTML inserts <script> tags
// as inert markup — the browser only executes a <script> element created
// via the DOM APIs — so we parse the saved HTML ourselves and re-create
// each node, swapping scripts for freshly-created <script> elements that
// actually run.
export default function AdSlot({ code, slot }: { code: string; slot: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = ref.current;
    if (!container || !code.trim()) return;

    container.innerHTML = '';
    const template = document.createElement('template');
    template.innerHTML = code;

    for (const node of Array.from(template.content.childNodes)) {
      if (node instanceof HTMLScriptElement) {
        const script = document.createElement('script');
        for (const { name, value } of Array.from(node.attributes)) {
          script.setAttribute(name, value);
        }
        script.text = node.text;
        container.appendChild(script);
      } else {
        container.appendChild(node.cloneNode(true));
      }
    }
  }, [code, slot]);

  if (!code.trim()) {
    return (
      <div className="w-full max-w-[300px] mx-auto lg:mx-0 h-[600px] border border-dashed border-rule flex items-center justify-center bg-rule/10">
        <span className="font-mono text-xs uppercase tracking-wide text-ink/40">Advertisement</span>
      </div>
    );
  }

  return <div ref={ref} data-ad-slot={slot} />;
}
