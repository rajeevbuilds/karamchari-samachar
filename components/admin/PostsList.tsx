'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { Eye } from 'lucide-react';
import type { AdminCircular } from '@/lib/data';
import { CATEGORY_LABEL } from '@/lib/constants';
import { apiFetch } from './apiFetch';


// All Posts section of the admin panel: every circular with Edit / Delete.
export default function PostsList({ initialCirculars }: { initialCirculars: AdminCircular[] }) {
  const [circulars, setCirculars] = useState(initialCirculars);
  const [error, setError] = useState<string | null>(null);
  // Posts whose view count is showing (opened with the eye button).
  const [shownViews, setShownViews] = useState<Set<number>>(new Set());

  // Post number: the oldest post is 1, so a post keeps its number as new ones
  // are added and the newest post carries the total.
  const serial = useMemo(() => {
    const oldestFirst = [...circulars].sort((a, b) =>
      (a.postedAt || a.issueDate).localeCompare(b.postedAt || b.issueDate) || a.id - b.id
    );
    return new Map(oldestFirst.map((c, i) => [c.id, i + 1]));
  }, [circulars]);

  // Ids are handed out one by one as posts are created, so a number below the
  // highest id that no post carries is a post that was deleted or never saved.
  const missingIds = useMemo(() => {
    const have = new Set(circulars.map((c) => c.id));
    const top = circulars.reduce((m, c) => Math.max(m, c.id), 0);
    const out: number[] = [];
    for (let i = 1; i <= top; i++) if (!have.has(i)) out.push(i);
    return { top, out };
  }, [circulars]);

  const allShown = circulars.length > 0 && circulars.every((c) => shownViews.has(c.id));

  // The eye in the header shows (or hides) the views of every post at once.
  function toggleAllViews() {
    setShownViews(allShown ? new Set() : new Set(circulars.map((c) => c.id)));
  }

  function toggleViews(id: number) {
    setShownViews((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function deleteCircularRow(id: number) {
    if (!confirm('Delete this circular? This cannot be undone.')) return;
    setError(null);
    try {
      const res = await apiFetch(`/api/admin/circulars/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setCirculars((list) => list.filter((c) => c.id !== id));
      } else {
        const data = await res.json().catch(() => ({}));
        setError(data.error || 'Failed to delete');
      }
    } catch {
      setError('Network error — please try again');
    }
  }

  return (
    <section>
      {error && <p className="text-sm text-red-600 mb-3">{error}</p>}
      <p className="text-sm text-ink/70 mb-3">
        <strong className="text-ink">{circulars.length}</strong> {circulars.length === 1 ? 'post' : 'posts'} in all
        {circulars.some((c) => c.status === 'draft') && (
          <> ({circulars.filter((c) => c.status === 'published').length} published, {circulars.filter((c) => c.status === 'draft').length} drafts)</>
        )}
        . Click the eye on a row to see that post&apos;s views, or the eye at the top to see the views of all posts.
      </p>
      {missingIds.out.length > 0 && (
        <p className="text-xs text-ink/60 mb-3 max-w-prose">
          Post ids go up to {missingIds.top}. {missingIds.out.length} {missingIds.out.length === 1 ? 'id has' : 'ids have'} no post: {missingIds.out.join(', ')}.
          Those posts were deleted or never saved. Each row&apos;s id is shown when you hover over its number.
        </p>
      )}
      <table className="w-full text-sm border-t border-rule">
        <thead>
          <tr className="border-b border-rule text-left text-ink/50 font-mono text-xs uppercase">
            <th className="py-2 pr-3 font-medium w-12">#</th>
            <th className="py-2 font-medium">Title</th>
            <th className="py-2 font-medium">Category</th>
            <th className="py-2 font-medium">Posted</th>
            <th className="py-2 font-medium whitespace-nowrap">
              <button
                type="button"
                onClick={toggleAllViews}
                aria-pressed={allShown}
                aria-label={allShown ? 'Hide views of all posts' : 'Show views of all posts'}
                title={allShown ? 'Hide views of all posts' : 'Show views of all posts'}
                className={`inline-flex items-center gap-1 normal-case ${allShown ? 'text-maroon' : 'text-ink/50 hover:text-maroon'}`}
              >
                <Eye size={16} aria-hidden="true" />
                <span className="font-mono text-xs uppercase">{allShown ? 'Hide all views' : 'Show all views'}</span>
              </button>
            </th>
          </tr>
        </thead>
        <tbody>
          {circulars.map((c) => (
            <tr key={c.id} className="border-b border-rule/60">
              <td className="py-2.5 pr-3 font-mono text-xs text-ink/50" title={`Post id ${c.id}`}>{serial.get(c.id)}</td>
              <td className="py-2.5 pr-4">
                {c.status === 'draft' && (
                  <span className="mr-2 font-mono text-[10px] uppercase tracking-wide text-brass border border-brass px-1.5 py-0.5 align-middle">
                    Draft
                  </span>
                )}
                {c.title}
              </td>
              <td className="py-2.5 pr-4 font-mono text-xs text-ink/60">{CATEGORY_LABEL[c.category]}</td>
              <td className="py-2.5 pr-4 font-mono text-xs text-ink/60">{c.issueDate}</td>
              <td className="py-2.5 whitespace-nowrap">
                <button
                  type="button"
                  onClick={() => toggleViews(c.id)}
                  aria-expanded={shownViews.has(c.id)}
                  aria-label={`Show views for post ${serial.get(c.id)}`}
                  title="Show views"
                  className="inline-flex items-center gap-1 align-middle mr-3 text-ink/50 hover:text-maroon"
                >
                  <Eye size={16} aria-hidden="true" />
                  {shownViews.has(c.id) && (
                    <span className="font-mono text-xs text-ink">{c.viewCount.toLocaleString('en-IN')} views</span>
                  )}
                </button>
                <Link href={`/admin/new?edit=${c.id}`} className="text-maroon hover:underline mr-3">
                  Edit
                </Link>
                <button onClick={() => deleteCircularRow(c.id)} className="text-ink/50 hover:text-red-600">
                  Delete
                </button>
              </td>
            </tr>
          ))}
          {circulars.length === 0 && (
            <tr>
              <td colSpan={5} className="py-4 text-ink/50">
                No circulars yet.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </section>
  );
}
