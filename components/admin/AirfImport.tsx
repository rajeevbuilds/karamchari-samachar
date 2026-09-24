'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import type { AirfCategory, AirfPost } from '@/lib/airf';

type ListedPost = AirfPost & { alreadyImported: boolean };

type ImportResult = {
  imported: { wpId: number; id: number; title: string; imageUrl: string | null }[];
  skipped: { wpId: number; title: string }[];
  missing: number[];
};

// Same behaviour as AdminDashboard's helper: bounce to login if the session expired.
async function apiFetch(url: string, options?: RequestInit): Promise<Response> {
  const res = await fetch(url, options);
  if (res.status === 401) {
    window.location.href = '/admin/login';
    throw new Error('Unauthorized');
  }
  return res;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function AirfImport() {
  const [categories, setCategories] = useState<AirfCategory[]>([]);
  const [categoryId, setCategoryId] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [posts, setPosts] = useState<ListedPost[]>([]);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(false);
  const [importing, setImporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ImportResult | null>(null);

  useEffect(() => {
    apiFetch('/api/admin/airf/categories')
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
        setCategories(data.categories);
      })
      .catch((err: Error) => setError(err.message || 'Could not load AIRF categories'));
  }, []);

  async function loadPosts(catId: string, pageNum: number) {
    setLoading(true);
    setError(null);
    setSelected(new Set());
    try {
      const res = await apiFetch(`/api/admin/airf/posts?category=${catId}&page=${pageNum}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setPosts(data.posts);
      setTotalPages(data.totalPages);
      setPage(pageNum);
    } catch (err) {
      setPosts([]);
      setError((err as Error).message || 'Could not load posts');
    } finally {
      setLoading(false);
    }
  }

  function chooseCategory(id: string) {
    setCategoryId(id);
    setResult(null);
    if (id) loadPosts(id, 1);
    else setPosts([]);
  }

  function toggle(wpId: number) {
    setSelected((s) => {
      const next = new Set(s);
      if (next.has(wpId)) next.delete(wpId);
      else next.add(wpId);
      return next;
    });
  }

  const selectable = posts.filter((p) => !p.alreadyImported);
  const allSelected = selectable.length > 0 && selectable.every((p) => selected.has(p.wpId));

  function toggleAll() {
    setSelected(allSelected ? new Set() : new Set(selectable.map((p) => p.wpId)));
  }

  async function importSelected() {
    setImporting(true);
    setError(null);
    setResult(null);
    try {
      const res = await apiFetch('/api/admin/airf/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: [...selected] }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setResult(data);
      await loadPosts(categoryId, page); // refresh "already imported" markers
    } catch (err) {
      setError((err as Error).message || 'Import failed');
    } finally {
      setImporting(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <label className="block text-xs font-mono uppercase text-ink/50 mb-1">AIRF category</label>
        <select
          value={categoryId}
          onChange={(e) => chooseCategory(e.target.value)}
          disabled={categories.length === 0}
          className="w-full sm:w-auto sm:min-w-[420px] border border-rule px-3 py-2 text-sm focus:outline-none focus:border-maroon bg-paper"
        >
          <option value="">{categories.length ? '— Select a category —' : 'Loading categories…'}</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name} ({c.count})
            </option>
          ))}
        </select>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      {result && (
        <div className="border border-leaf bg-leaf/10 text-sm px-4 py-3">
          <p className="font-medium text-leaf">
            Imported {result.imported.length} post{result.imported.length === 1 ? '' : 's'} as draft
            {result.skipped.length > 0 && ` · skipped ${result.skipped.length} already imported`}
            {result.missing.length > 0 && ` · ${result.missing.length} no longer found on AIRF`}
          </p>
          {result.imported.length > 0 && (
            <p className="text-ink/70 mt-1">
              Review them on the{' '}
              <Link href="/admin" className="text-maroon underline">
                dashboard
              </Link>{' '}
              (drafts are listed first), then fill in department, category, section and states, and save as
              Published.
            </p>
          )}
        </div>
      )}

      {categoryId && (
        <section>
          <div className="flex items-center justify-between gap-4 flex-wrap border-b border-rule pb-3">
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={allSelected} onChange={toggleAll} disabled={!selectable.length} />
              Select all on this page
            </label>
            <button
              type="button"
              onClick={importSelected}
              disabled={selected.size === 0 || importing}
              className="bg-ink text-paper px-4 py-2 text-sm font-medium hover:bg-maroon transition-colors disabled:opacity-50"
            >
              {importing ? 'Importing…' : `Import selected (${selected.size})`}
            </button>
          </div>

          {loading ? (
            <p className="text-sm text-ink/60 py-6">Loading posts from airfindia.org…</p>
          ) : posts.length === 0 ? (
            <p className="text-sm text-ink/60 py-6">No posts in this category.</p>
          ) : (
            <ul>
              {posts.map((p) => (
                <li key={p.wpId} className="border-b border-rule/60">
                  <label
                    className={`flex items-start gap-4 py-4 ${p.alreadyImported ? 'opacity-60' : 'cursor-pointer'}`}
                  >
                    <input
                      type="checkbox"
                      className="mt-1"
                      checked={selected.has(p.wpId)}
                      disabled={p.alreadyImported}
                      onChange={() => toggle(p.wpId)}
                    />
                    <div className="w-28 shrink-0 aspect-[16/9] bg-rule/30 overflow-hidden">
                      {p.thumbUrl ? (
                        // Plain <img>: WordPress already serves a small rendition here.
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={p.thumbUrl} alt="" loading="lazy" className="w-full h-full object-cover" />
                      ) : (
                        <span className="flex h-full items-center justify-center text-[10px] font-mono text-ink/40">
                          No image
                        </span>
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="font-serif font-semibold text-ink leading-snug">{p.title}</p>
                      <p className="font-mono text-xs text-ink/50 mt-1">
                        {formatDate(p.date)}
                        {p.alreadyImported && <span className="ml-2 text-leaf">· Already imported</span>}
                        {' · '}
                        <a
                          href={p.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:text-maroon underline"
                          onClick={(e) => e.stopPropagation()}
                        >
                          View on AIRF
                        </a>
                      </p>
                    </div>
                  </label>
                </li>
              ))}
            </ul>
          )}

          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-4 text-sm">
              <button
                type="button"
                disabled={page <= 1 || loading}
                onClick={() => loadPosts(categoryId, page - 1)}
                className="text-maroon disabled:text-ink/30"
              >
                ← Newer
              </button>
              <span className="font-mono text-xs text-ink/50">
                Page {page} of {totalPages}
              </span>
              <button
                type="button"
                disabled={page >= totalPages || loading}
                onClick={() => loadPosts(categoryId, page + 1)}
                className="text-maroon disabled:text-ink/30"
              >
                Older →
              </button>
            </div>
          )}
        </section>
      )}
    </div>
  );
}
