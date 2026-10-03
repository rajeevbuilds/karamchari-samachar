'use client';

import { useCallback, useEffect, useRef, useState, type DragEvent, type FormEvent } from 'react';
import type { UploadedImage } from '@/lib/uploads';
import type { AirfMediaItem } from '@/lib/airf';
import { apiFetch } from './apiFetch';

const ACCEPT = 'image/jpeg,image/png,image/webp';
const MAX_BYTES = 5 * 1024 * 1024; // mirrors MAX_UPLOAD_BYTES in lib/uploads.ts

type Tab = 'uploads' | 'airf';

// Media browser with two sources: our own uploads and AIRF's WordPress media
// library. With `onSelect` it acts as a picker (clicking an image — or
// finishing an upload — hands its URL back); without it, it's the Media
// admin page and offers "Copy URL" instead.
export default function MediaLibrary({ onSelect }: { onSelect?: (url: string) => void }) {
  const [tab, setTab] = useState<Tab>('uploads');

  return (
    <div>
      <div className="flex gap-1 border-b border-rule mb-5" role="tablist">
        {(
          [
            ['uploads', 'My Uploads'],
            ['airf', 'From AIRF'],
          ] as const
        ).map(([key, label]) => (
          <button
            key={key}
            type="button"
            role="tab"
            aria-selected={tab === key}
            onClick={() => setTab(key)}
            className={`px-4 py-2 text-sm -mb-px border-b-2 transition-colors ${
              tab === key ? 'border-maroon text-maroon font-medium' : 'border-transparent text-ink/60 hover:text-maroon'
            }`}
          >
            {label}
          </button>
        ))}
      </div>
      {tab === 'uploads' ? <UploadsTab onSelect={onSelect} /> : <AirfTab onSelect={onSelect} />}
    </div>
  );
}

function UploadsTab({ onSelect }: { onSelect?: (url: string) => void }) {
  const [uploads, setUploads] = useState<UploadedImage[] | null>(null);
  const [uploading, setUploading] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [deleting, setDeleting] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const load = useCallback(async () => {
    try {
      const res = await apiFetch('/api/admin/media');
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setUploads(data.uploads);
    } catch (err) {
      setError((err as Error).message || 'Could not load uploads');
      setUploads([]);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function upload(file: File) {
    setError(null);
    if (!ACCEPT.split(',').includes(file.type)) {
      setError('Only JPG, PNG and WebP images are allowed');
      return;
    }
    if (file.size > MAX_BYTES) {
      setError('Images must be 5 MB or smaller');
      return;
    }
    setUploading(true);
    try {
      const body = new FormData();
      body.append('file', file);
      const res = await apiFetch('/api/admin/media', { method: 'POST', body });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setUploads((u) => [data.upload, ...(u ?? [])]);
      onSelect?.(data.upload.url);
    } catch (err) {
      setError((err as Error).message || 'Upload failed');
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  }

  function toggle(name: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  }

  async function deleteSelected() {
    const names = Array.from(selected);
    if (names.length === 0) return;
    const label = names.length === 1 ? 'this image' : `these ${names.length} images`;
    if (!confirm(`Delete ${label} permanently? This cannot be undone.`)) return;

    setDeleting(true);
    setError(null);
    setNotice(null);
    try {
      const res = await apiFetch('/api/admin/media', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ names }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      const deleted = new Set<string>(data.deleted);
      setUploads((u) => (u ?? []).filter((x) => !deleted.has(x.name)));
      setSelected(new Set());

      const blocked: { name: string; posts: { title: string }[] }[] = data.blocked ?? [];
      const parts: string[] = [];
      if (deleted.size > 0) parts.push(`Deleted ${deleted.size} image${deleted.size === 1 ? '' : 's'}.`);
      if (blocked.length > 0) {
        parts.push(
          `Not deleted — still used by a post: ${blocked
            .map((b) => `${b.name} (${b.posts.map((p) => `“${p.title}”`).join(', ')})`)
            .join('; ')}. Change those posts first, then delete.`
        );
      }
      setNotice(parts.join(' ') || 'Nothing was deleted.');
    } catch (err) {
      setError((err as Error).message || 'Delete failed');
    } finally {
      setDeleting(false);
    }
  }

  function onDrop(e: DragEvent) {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) upload(file);
  }

  return (
    <div>
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        className={`border-2 border-dashed px-4 py-6 mb-5 text-center text-sm transition-colors ${
          dragging ? 'border-maroon bg-maroon/5' : 'border-rule'
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPT}
          className="hidden"
          onChange={(e) => e.target.files?.[0] && upload(e.target.files[0])}
        />
        <button
          type="button"
          disabled={uploading}
          onClick={() => inputRef.current?.click()}
          className="bg-ink text-paper px-4 py-2 text-sm font-medium hover:bg-maroon transition-colors disabled:opacity-50"
        >
          {uploading ? 'Uploading…' : 'Upload image'}
        </button>
        <p className="text-xs text-ink/50 mt-2">or drag an image here · JPG, PNG or WebP · up to 5 MB</p>
      </div>

      {error && <p className="text-sm text-red-600 mb-4">{error}</p>}
      {notice && (
        <p className="text-sm text-ink/80 border border-rule bg-rule/20 px-3 py-2 mb-4" role="status">
          {notice}
        </p>
      )}

      {uploads === null ? (
        <p className="text-sm text-ink/60">Loading uploads…</p>
      ) : uploads.length === 0 ? (
        <p className="text-sm text-ink/60">No uploads yet.</p>
      ) : (
        <>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mb-3 text-sm">
            <label className="flex items-center gap-2 text-ink/80">
              <input
                type="checkbox"
                checked={selected.size === uploads.length}
                onChange={(e) => setSelected(e.target.checked ? new Set(uploads.map((u) => u.name)) : new Set())}
              />
              Select all
            </label>
            {selected.size > 0 && (
              <>
                <span className="text-ink/60">{selected.size} selected</span>
                <button
                  type="button"
                  onClick={deleteSelected}
                  disabled={deleting}
                  className="bg-red-700 text-white px-3 py-1.5 text-sm font-medium hover:bg-red-800 transition-colors disabled:opacity-50"
                >
                  {deleting ? 'Deleting…' : 'Delete selected'}
                </button>
                <button
                  type="button"
                  onClick={() => setSelected(new Set())}
                  className="text-ink/60 hover:text-maroon"
                >
                  Clear
                </button>
              </>
            )}
          </div>
          <ImageGrid
            items={uploads.map((u) => ({ key: u.name, url: u.url, thumbUrl: u.url, caption: u.name }))}
            onSelect={onSelect}
            selection={{ selected, onToggle: toggle }}
          />
        </>
      )}
    </div>
  );
}

function AirfTab({ onSelect }: { onSelect?: (url: string) => void }) {
  const [query, setQuery] = useState('');
  const [items, setItems] = useState<AirfMediaItem[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [searched, setSearched] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function search(term: string, pageNum: number) {
    setLoading(true);
    setError(null);
    try {
      const res = await apiFetch(`/api/admin/airf/media?search=${encodeURIComponent(term)}&page=${pageNum}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setItems((prev) => (pageNum === 1 ? data.items : [...prev, ...data.items]));
      setTotalPages(data.totalPages);
      setPage(pageNum);
      setSearched(term);
    } catch (err) {
      setError((err as Error).message || 'Search failed');
    } finally {
      setLoading(false);
    }
  }

  function submit(e: FormEvent) {
    e.preventDefault();
    search(query, 1);
  }

  return (
    <div>
      <form onSubmit={submit} className="flex gap-2 mb-5">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search airfindia.org images (leave empty for latest)"
          className="flex-1 border border-rule px-3 py-2 text-sm focus:outline-none focus:border-maroon"
        />
        <button
          type="submit"
          disabled={loading}
          className="bg-ink text-paper px-4 py-2 text-sm font-medium hover:bg-maroon transition-colors disabled:opacity-50"
        >
          Search
        </button>
      </form>

      {error && <p className="text-sm text-red-600 mb-4">{error}</p>}

      {searched === null && !loading ? (
        <p className="text-sm text-ink/60">Search AIRF&rsquo;s media library to reuse an image from the union site.</p>
      ) : items.length === 0 && !loading ? (
        <p className="text-sm text-ink/60">No images found{searched ? ` for “${searched}”` : ''}.</p>
      ) : (
        <ImageGrid
          items={items.map((m) => ({ key: String(m.id), url: m.url, thumbUrl: m.thumbUrl, caption: m.title || m.date }))}
          onSelect={onSelect}
        />
      )}

      {loading && <p className="text-sm text-ink/60 mt-4">Searching airfindia.org…</p>}
      {!loading && page < totalPages && searched !== null && (
        <button
          type="button"
          onClick={() => search(searched, page + 1)}
          className="mt-5 w-full border border-ink py-2 text-sm text-ink hover:bg-ink hover:text-paper transition-colors"
        >
          Load more
        </button>
      )}
    </div>
  );
}

type GridItem = { key: string; url: string; thumbUrl: string; caption: string };

function ImageGrid({
  items,
  onSelect,
  selection,
}: {
  items: GridItem[];
  onSelect?: (url: string) => void;
  // When given (My Uploads only), each picture gets a tick box for bulk delete.
  selection?: { selected: Set<string>; onToggle: (key: string) => void };
}) {
  const [copied, setCopied] = useState<string | null>(null);

  async function copy(url: string) {
    const absolute = url.startsWith('/') ? window.location.origin + url : url;
    try {
      await navigator.clipboard.writeText(absolute);
      setCopied(url);
      window.setTimeout(() => setCopied((c) => (c === url ? null : c)), 2000);
    } catch {
      window.prompt('Copy this URL:', absolute);
    }
  }

  return (
    <ul className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
      {items.map((item) => (
        <li
          key={item.key}
          className={`relative border bg-white/40 ${
            selection?.selected.has(item.key) ? 'border-maroon ring-2 ring-maroon' : 'border-rule'
          }`}
        >
          {selection && (
            <label className="absolute left-2 top-2 z-10 flex h-7 w-7 cursor-pointer items-center justify-center bg-white/95 shadow ring-1 ring-ink/30">
              <input
                type="checkbox"
                className="h-4 w-4 cursor-pointer"
                checked={selection.selected.has(item.key)}
                onChange={() => selection.onToggle(item.key)}
                aria-label={`Select ${item.caption}`}
              />
            </label>
          )}
          <button
            type="button"
            onClick={() => (onSelect ? onSelect(item.url) : copy(item.url))}
            title={onSelect ? 'Use this image' : 'Copy URL'}
            className="group block w-full text-left"
          >
            <div className="aspect-[16/10] overflow-hidden bg-rule/30">
              {/* Plain <img>: thumbnails only, admin-side. */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={item.thumbUrl} alt="" loading="lazy" className="w-full h-full object-cover" />
            </div>
            <div className="px-2 py-1.5 flex items-center justify-between gap-2">
              <span className="text-[11px] text-ink/60 truncate">{item.caption}</span>
              <span className="text-[11px] font-medium text-maroon shrink-0 opacity-70 group-hover:opacity-100">
                {onSelect ? 'Use' : copied === item.url ? 'Copied' : 'Copy URL'}
              </span>
            </div>
          </button>
        </li>
      ))}
    </ul>
  );
}
