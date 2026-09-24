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

      {uploads === null ? (
        <p className="text-sm text-ink/60">Loading uploads…</p>
      ) : uploads.length === 0 ? (
        <p className="text-sm text-ink/60">No uploads yet.</p>
      ) : (
        <ImageGrid
          items={uploads.map((u) => ({ key: u.name, url: u.url, thumbUrl: u.url, caption: u.name }))}
          onSelect={onSelect}
        />
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

function ImageGrid({ items, onSelect }: { items: GridItem[]; onSelect?: (url: string) => void }) {
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
        <li key={item.key} className="border border-rule bg-white/40">
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
