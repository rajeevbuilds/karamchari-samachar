import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { getCircularBySlug, getCircularIdBySlug, incrementViewCount } from '@/lib/data';
import { summaryHtml } from '@/lib/sanitize';
import { isAdminAuthenticated } from '@/lib/auth';
import AdSlot from '@/components/AdSlot';

// Render on every request: this page reads from the database, and a
// build-time snapshot would freeze whatever the DB held during `next build`
// (often nothing), so edits would never appear and view counts
// would never increment.
export const dynamic = 'force-dynamic';

export default async function CircularDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const circular = await getCircularBySlug(slug);
  if (!circular) notFound();

  // Fire-and-forget: don't hold up rendering the page on this write.
  void incrementViewCount(slug);

  const isAdmin = await isAdminAuthenticated();
  const editId = isAdmin ? await getCircularIdBySlug(slug) : null;

  return (
    <div className="mx-auto max-w-[1200px] px-4 py-10 grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_300px] gap-8 items-start">
      <div className="max-w-prose">
        {circular.imageUrl && (
          <div className="relative w-full aspect-[16/9] mb-6 overflow-hidden bg-rule/20">
            <Image
              src={circular.imageUrl}
              alt={circular.title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 800px"
              priority
            />
          </div>
        )}

        <div className="flex items-center justify-between gap-4 flex-wrap">
          {circular.department && (
            <span className="font-mono text-xs uppercase tracking-wide text-maroon">
              {circular.department}
            </span>
          )}
          {editId && (
            <Link
              href={`/admin/posts?edit=${editId}`}
              className="font-mono text-xs uppercase tracking-wide text-ink/60 border border-rule px-2 py-1 hover:border-maroon hover:text-maroon transition-colors"
            >
              Edit
            </Link>
          )}
        </div>
        <h1 className="font-serif text-3xl font-semibold text-ink mt-2 mb-4">
          {circular.title}
        </h1>

        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 text-sm border-y border-rule py-4 mb-6 font-mono">
          <div>
            <dt className="text-ink/50">Date of Posting</dt>
            <dd className="text-ink">
              {new Date(circular.issueDate).toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
            </dd>
          </div>
          <div>
            <dt className="text-ink/50">Applies to</dt>
            <dd className="text-ink">
              {circular.states.includes('all') ? 'All states' : circular.states.join(', ')}
            </dd>
          </div>
        </dl>

        <div
          className="rich-text text-ink/80 leading-relaxed mb-6"
          dangerouslySetInnerHTML={{ __html: summaryHtml(circular.summary) }}
        />

        {circular.pdfUrl && (
          <a
            href={circular.pdfUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block text-sm font-medium text-paper bg-ink px-4 py-2 hover:bg-maroon transition-colors"
          >
            View original order (PDF) →
          </a>
        )}
      </div>

      <aside>
        <AdSlot />
      </aside>
    </div>
  );
}
