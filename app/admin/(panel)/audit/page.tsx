import Link from 'next/link';
import { requireAdmin } from '@/lib/auth';
import { getAllCircularsAdmin, type AdminCircular } from '@/lib/data';
import { summaryPreviewText } from '@/lib/sanitize';

export const metadata = {
  title: 'Content audit — Admin',
};

// Posts under this many words are "very short"; under SHORT are "short".
const VERY_SHORT = 150;
const SHORT = 300;
const SIMILAR = 0.7;

const wordsIn = (text: string) => (text ? text.split(/\s+/).filter(Boolean).length : 0);
const tokens = (title: string) =>
  new Set(
    title
      .toLowerCase()
      .replace(/[^\p{L}\p{N}\s]/gu, ' ')
      .split(/\s+/)
      .filter((t) => t.length > 1)
  );

function similarity(a: Set<string>, b: Set<string>): number {
  if (a.size === 0 || b.size === 0) return 0;
  let shared = 0;
  for (const t of a) if (b.has(t)) shared++;
  return shared / (a.size + b.size - shared);
}

type Row = { post: AdminCircular; words: number; flags: string[]; similarTo: string[] };

// Read-only check of the published posts for the things that read as "low value
// content": very short posts, near-duplicate titles, missing images, no readers.
export default async function AdminAuditPage() {
  await requireAdmin();
  const posts = (await getAllCircularsAdmin()).filter((p) => p.status === 'published');

  const rows: Row[] = posts.map((post) => ({
    post,
    words: wordsIn(summaryPreviewText(post.summary, 1_000_000)),
    flags: [],
    similarTo: [],
  }));

  const titleTokens = rows.map((r) => tokens(r.post.title));
  for (let i = 0; i < rows.length; i++) {
    for (let j = i + 1; j < rows.length; j++) {
      if (similarity(titleTokens[i], titleTokens[j]) >= SIMILAR) {
        rows[i].similarTo.push(rows[j].post.title);
        rows[j].similarTo.push(rows[i].post.title);
      }
    }
  }
  for (const r of rows) {
    if (r.words < VERY_SHORT) r.flags.push('Very short');
    else if (r.words < SHORT) r.flags.push('Short');
    if (r.similarTo.length) r.flags.push('Similar title');
    if (!r.post.imageUrl) r.flags.push('No image');
    if (r.post.viewCount < 20) r.flags.push('Few views');
  }

  const veryShort = rows.filter((r) => r.words < VERY_SHORT).length;
  const short = rows.filter((r) => r.words >= VERY_SHORT && r.words < SHORT).length;
  const similar = rows.filter((r) => r.similarTo.length).length;
  const flagged = rows.filter((r) => r.flags.length).sort((a, b) => a.words - b.words);

  return (
    <>
      <h1 className="font-serif text-3xl font-semibold text-ink mb-2">Content audit</h1>
      <p className="text-sm text-ink/60 mb-6 max-w-prose">
        A read-only check of your published posts. Nothing here changes any post. Fix a flagged post by expanding it,
        merging it into a stronger one, or asking us to hide it from search.
      </p>

      <dl className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8 max-w-2xl text-sm">
        <div className="border border-rule p-3">
          <dt className="text-ink/50 mb-1">Published posts</dt>
          <dd className="font-serif text-2xl text-ink">{rows.length}</dd>
        </div>
        <div className="border border-rule p-3">
          <dt className="text-ink/50 mb-1">Under {VERY_SHORT} words</dt>
          <dd className="font-serif text-2xl text-maroon">{veryShort}</dd>
        </div>
        <div className="border border-rule p-3">
          <dt className="text-ink/50 mb-1">{VERY_SHORT}–{SHORT - 1} words</dt>
          <dd className="font-serif text-2xl text-ink">{short}</dd>
        </div>
        <div className="border border-rule p-3">
          <dt className="text-ink/50 mb-1">Similar titles</dt>
          <dd className="font-serif text-2xl text-ink">{similar}</dd>
        </div>
      </dl>

      {flagged.length === 0 ? (
        <p className="text-sm text-ink/50">No posts flagged.</p>
      ) : (
        <div className="border border-rule overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-rule text-left text-ink/50 font-mono text-xs uppercase">
                <th className="px-3 py-2 font-medium">Post</th>
                <th className="px-3 py-2 font-medium">Words</th>
                <th className="px-3 py-2 font-medium">Views</th>
                <th className="px-3 py-2 font-medium">Flags</th>
              </tr>
            </thead>
            <tbody>
              {flagged.map((r) => (
                <tr key={r.post.slug} className="border-b border-rule/60 last:border-b-0 align-top">
                  <td className="px-3 py-2">
                    <Link href={`/circulars/${r.post.slug}`} target="_blank" className="text-maroon hover:underline">
                      {r.post.title}
                    </Link>
                    <div className="text-xs text-ink/50 mt-0.5">{r.post.issueDate}</div>
                    {r.similarTo.length > 0 && (
                      <div className="text-xs text-ink/60 mt-1">Close to: {r.similarTo.slice(0, 2).join(' | ')}</div>
                    )}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap">{r.words}</td>
                  <td className="px-3 py-2 whitespace-nowrap">{r.post.viewCount}</td>
                  <td className="px-3 py-2">{r.flags.join(', ')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
