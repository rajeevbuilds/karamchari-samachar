import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { getAllSettings, getCircularBySlug, getCircularIdBySlug, incrementViewCount } from '@/lib/data';
import { summaryHtml, summaryPreviewText } from '@/lib/sanitize';
import { isAdminAuthenticated } from '@/lib/auth';
import { resolveOgImageUrl } from '@/lib/uploads';
import AdSlot from '@/components/AdSlot';
import JsonLd from '@/components/JsonLd';
import { SECTION_OPTIONS } from '@/lib/constants';
import { SITE_LOGO_URL, SITE_NAME, SITE_URL } from '@/lib/site';

// Render on every request: this page reads from the database, and a
// build-time snapshot would freeze whatever the DB held during `next build`
// (often nothing), so edits would never appear and view counts
// would never increment.
export const dynamic = 'force-dynamic';


// Facebook/WhatsApp/Twitter unfurl a page's own og:image rather than
// inferring one, so each circular needs its own absolute image URL —
// falling back to the site banner only when it truly has no image.
function absoluteImageUrl(imageUrl: string | null): string {
  if (!imageUrl) return `${SITE_URL}/header-banner.png`;
  return /^https?:\/\//i.test(imageUrl) ? imageUrl : `${SITE_URL}${imageUrl}`;
}

// posted_at is stored as IST wall-clock time ("2026-09-28 14:30:00"); search
// engines want a full ISO timestamp with the offset.
function isoDateTime(postedAt: string | undefined, issueDate: string): string {
  return postedAt ? `${postedAt.replace(' ', 'T')}+05:30` : `${issueDate}T00:00:00+05:30`;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const circular = await getCircularBySlug(slug);
  if (!circular) return {};

  const title = circular.title;
  const description = summaryPreviewText(circular.summary, 200);
  // The 1200x630 social-share crop is only used here, for the link-preview
  // image — everywhere else on the site (grid thumbnails, hero, the inline
  // image above) keeps using the original, uncropped upload.
  const ogVariantUrl = await resolveOgImageUrl(circular.imageUrl);
  const image = absoluteImageUrl(ogVariantUrl ?? circular.imageUrl);

  return {
    title,
    description,
    alternates: { canonical: `/circulars/${slug}` },
    openGraph: {
      type: 'article',
      url: `/circulars/${slug}`,
      title,
      description,
      images: [{ url: image }],
      publishedTime: isoDateTime(circular.postedAt, circular.issueDate),
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [image],
    },
  };
}

export default async function CircularDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const circular = await getCircularBySlug(slug);
  if (!circular) notFound();

  const isAdmin = await isAdminAuthenticated();

  // Fire-and-forget: don't hold up rendering the page on this write. Skipped
  // for admins so testing/editing in the admin panel doesn't inflate counts.
  if (!isAdmin) void incrementViewCount(slug);

  const editId = isAdmin ? await getCircularIdBySlug(slug) : null;
  const settings = await getAllSettings();

  // Structured data: tells search engines this is a news article, who
  // published it and when, and where it sits in the site.
  const published = isoDateTime(circular.postedAt, circular.issueDate);
  const articleImage = circular.imageUrl
    ? /^https?:\/\//i.test(circular.imageUrl)
      ? circular.imageUrl
      : `${SITE_URL}${circular.imageUrl}`
    : `${SITE_URL}/header-banner.png`;
  const firstSection = SECTION_OPTIONS.find((s) => circular.sections.includes(s.value));
  const crumbs = [
    { name: 'Home', url: SITE_URL },
    ...(firstSection ? [{ name: firstSection.label, url: `${SITE_URL}/section/${firstSection.value}` }] : []),
    { name: circular.title, url: `${SITE_URL}/circulars/${circular.slug}` },
  ];

  return (
    <div className="mx-auto max-w-[1200px] px-4 py-10 grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_300px] gap-8 items-start">
      <JsonLd
        data={[
          {
            '@context': 'https://schema.org',
            '@type': 'NewsArticle',
            headline: circular.title.slice(0, 110),
            description: summaryPreviewText(circular.summary, 200),
            image: [articleImage],
            datePublished: published,
            dateModified: published,
            mainEntityOfPage: `${SITE_URL}/circulars/${circular.slug}`,
            inLanguage: /[\u0900-\u097F]/.test(circular.title) ? 'hi-IN' : 'en-IN',
            author: { '@type': 'Organization', name: SITE_NAME, url: SITE_URL },
            publisher: {
              '@type': 'Organization',
              name: SITE_NAME,
              logo: { '@type': 'ImageObject', url: SITE_LOGO_URL },
            },
          },
          {
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement: crumbs.map((c, i) => ({
              '@type': 'ListItem',
              position: i + 1,
              name: c.name,
              item: c.url,
            })),
          },
        ]}
      />
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
              href={`/admin/new?edit=${editId}`}
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
          {!circular.states.includes('others') && (
            <div>
              <dt className="text-ink/50">Applies to</dt>
              <dd className="text-ink">
                {circular.states.includes('all') ? 'All states' : circular.states.join(', ')}
              </dd>
            </div>
          )}
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

        <div className="mt-8">
          <AdSlot code={settings.ad_in_article} slot="in_article" />
        </div>
      </div>

      <aside className="lg:sticky lg:top-6 flex flex-col gap-8">
        <AdSlot code={settings.ad_sidebar_1} slot="sidebar_1" />
        <AdSlot code={settings.ad_sidebar_2} slot="sidebar_2" />
      </aside>
    </div>
  );
}
