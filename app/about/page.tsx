export const metadata = {
  title: 'About — Karamchari Samachar',
};

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <div className="max-w-prose">
        <h1 className="font-serif text-3xl font-semibold text-ink mb-4">About</h1>
        <p className="text-sm text-ink/70 leading-relaxed mb-4">
          Karamchari Samachar tracks Dearness Allowance revisions, Pay
          Commission developments, and department circulars for central and
          state government employees across India. Every notification links
          to its original source document.
        </p>
        <p className="text-sm text-ink/70 leading-relaxed">
          This is an independent information resource and is not an official
          government publication.
        </p>
      </div>
    </div>
  );
}
