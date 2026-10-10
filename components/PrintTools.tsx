'use client';

import { FileDown } from 'lucide-react';

// "Download PDF" button for the calculators. It opens the browser's save
// dialog (the printout is laid out for A4 and carries the site's branding),
// with a useful file name: the browser takes the PDF's name from the page
// title, so the title is set for the moment of printing.
export function DownloadPdfButton({ fileName }: { fileName: string }) {
  function download() {
    const original = document.title;
    const now = new Date();
    const stamp = [now.getDate(), now.getMonth() + 1, now.getFullYear()]
      .map((n, i) => (i < 2 ? String(n).padStart(2, '0') : String(n)))
      .join('-');
    document.title = `${fileName}-${stamp}`;
    const restore = () => {
      document.title = original;
      window.removeEventListener('afterprint', restore);
    };
    window.addEventListener('afterprint', restore);
    window.print();
  }

  return (
    <div className="flex flex-col items-end gap-1 mb-4 print:hidden">
      <button
        type="button"
        onClick={download}
        className="inline-flex items-center gap-2 bg-ink text-paper px-4 py-2 text-sm font-medium hover:bg-maroon transition-colors"
      >
        <FileDown size={16} aria-hidden="true" />
        Download PDF
      </button>
      <p className="text-xs text-ink/50">
        A save window opens. If it shows a printer, choose &ldquo;Save as PDF&rdquo;.
      </p>
    </div>
  );
}

// Print-only footer: who made this, where to find more, and a QR code that
// opens the same calculator on a phone from paper or from a forwarded PDF.
export function PrintBrandFooter({ qrSrc, disclaimer }: { qrSrc: string; disclaimer: string }) {
  return (
    <div className="hidden print:flex items-center justify-between gap-6 border-t-4 border-ink pt-2 mt-3 break-inside-avoid">
      <div className="text-xs text-ink/80 leading-snug">
        <p className="text-sm font-bold text-ink">Sarkari Karamchari Samachar · sarkarikaramchari.com</p>
        <p>सरकारी कर्मचारी समाचार · DA, Circulars &amp; Pay Updates</p>
        <p>Free calculators for central government and railway employees.</p>
        <p className="mt-1 text-[10px] text-ink/60">{disclaimer}</p>
      </div>
      <div className="shrink-0 text-center">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={qrSrc} alt="QR code to open this calculator" className="h-[72px] w-[72px] border border-ink/20 p-1 bg-white" />
        <p className="mt-0.5 text-[9px] text-ink/70">Scan to open this calculator</p>
      </div>
    </div>
  );
}
