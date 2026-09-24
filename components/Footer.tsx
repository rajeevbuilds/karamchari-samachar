export default function Footer() {
  return (
    <footer className="border-t border-rule mt-16">
      <div className="mx-auto max-w-[1200px] px-4 py-8 text-sm text-ink/60">
        <p>
          Karamchari Samachar publishes circulars and notifications sourced from
          official government offices. Original documents are linked wherever
          available — always verify against the official gazette before acting
          on any notification.
        </p>
        <p className="mt-3 font-mono text-xs text-ink/40">
          © {new Date().getFullYear()} Karamchari Samachar
        </p>
      </div>
    </footer>
  );
}
