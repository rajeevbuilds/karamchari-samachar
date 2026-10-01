'use client';

import { useEffect, useRef, useState, type FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { AdminCircular, Circular } from '@/lib/data';
import { STATE_OPTIONS, SECTION_OPTIONS, CATEGORY_OPTIONS } from '@/lib/constants';
import { summaryToEditorHtml } from '@/lib/summary';
import { apiFetch } from './apiFetch';
import MediaLibrary from './MediaLibrary';
import RichTextEditor, { type RichTextEditorHandle } from './RichTextEditor';

// Current date+time in IST ("YYYY-MM-DDTHH:mm", for a datetime-local input),
// computed from the browser's clock — never the server's, since GoDaddy's
// server clock runs on the wrong timezone/hour.
function currentIstDatetimeLocal(): string {
  const now = new Date();
  const IST_OFFSET_MINUTES = 5 * 60 + 30;
  const ist = new Date(now.getTime() + (IST_OFFSET_MINUTES + now.getTimezoneOffset()) * 60 * 1000);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${ist.getFullYear()}-${pad(ist.getMonth() + 1)}-${pad(ist.getDate())}T${pad(ist.getHours())}:${pad(ist.getMinutes())}`;
}

function makeEmptyForm() {
  return {
    title: '',
    category: 'general' as Circular['category'],
    sections: [] as string[],
    postedAt: currentIstDatetimeLocal(),
    summary: '',
    pdfUrl: '',
    imageUrl: '',
    isFeatured: false,
    states: [] as string[],
    allStates: false,
    // "Others": not tied to any state or Central (news reports, analysis, calculators…).
    others: false,
    status: 'published' as Circular['status'],
  };
}

function formFromCircular(c: AdminCircular) {
  return {
    title: c.title,
    category: c.category,
    sections: c.sections,
    // Rows saved before posted_at existed fall back to issueDate at
    // midnight — editable, but left alone unless the admin changes it.
    postedAt: c.postedAt ? c.postedAt.slice(0, 16).replace(' ', 'T') : `${c.issueDate}T00:00`,
    summary: summaryToEditorHtml(c.summary),
    pdfUrl: c.pdfUrl ?? '',
    imageUrl: c.imageUrl ?? '',
    isFeatured: c.isFeatured,
    states: c.states.includes('all') || c.states.includes('others') ? [] : c.states,
    allStates: c.states.includes('all'),
    others: c.states.includes('others'),
    status: c.status,
  };
}

// Add / edit form for a single circular. With no `initialCircular` it is the
// "Add New Post" form; with one it edits that circular and returns to the
// All Posts list after saving.
export default function PostForm({ initialCircular }: { initialCircular?: AdminCircular }) {
  const router = useRouter();
  const editingId = initialCircular?.id ?? null;
  // Bumped whenever the form loads different content, to remount the
  // (uncontrolled) rich-text editor with it.
  const [editorKey, setEditorKey] = useState(0);
  const [pickerOpen, setPickerOpen] = useState(false);
  // What the picker is for: the post's main image, or an image placed inside the text.
  const [pickerMode, setPickerMode] = useState<'cover' | 'inline'>('cover');
  const editorRef = useRef<RichTextEditorHandle>(null);

  const [form, setForm] = useState(() =>
    initialCircular ? formFromCircular(initialCircular) : makeEmptyForm()
  );
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!successMessage) return;
    const timer = window.setTimeout(() => setSuccessMessage(null), 4000);
    return () => window.clearTimeout(timer);
  }, [successMessage]);

  function resetForm() {
    setForm(makeEmptyForm());
    setEditorKey((k) => k + 1);
    setError(null);
  }

  function toggleState(state: string) {
    setForm((f) => ({
      ...f,
      others: false,
      states: f.states.includes(state) ? f.states.filter((s) => s !== state) : [...f.states, state],
    }));
  }

  function toggleSection(section: string) {
    setForm((f) => ({
      ...f,
      sections: f.sections.includes(section)
        ? f.sections.filter((s) => s !== section)
        : [...f.sections, section],
    }));
  }

  function toggleAllSections(checked: boolean) {
    setForm((f) => ({
      ...f,
      sections: checked ? SECTION_OPTIONS.map((s) => s.value) : [],
    }));
  }

  async function submitCircular(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccessMessage(null);

    const isPublished = form.status === 'published';
    const payload = {
      title: form.title,
      category: form.category,
      sections: form.sections,
      postedAt: form.postedAt,
      summary: form.summary,
      pdfUrl: form.pdfUrl,
      imageUrl: form.imageUrl || null,
      isFeatured: form.isFeatured,
      states: form.others ? ['others'] : form.allStates ? ['all'] : form.states,
      status: form.status,
    };

    try {
      const res = await apiFetch(
        editingId ? `/api/admin/circulars/${editingId}` : '/api/admin/circulars',
        {
          method: editingId ? 'PUT' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        }
      );
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Something went wrong');
        return;
      }
      if (editingId) {
        router.push('/admin/posts');
        return;
      }
      resetForm();
      setSuccessMessage(isPublished ? 'Circular published successfully' : 'Saved as draft');
    } catch {
      setError('Network error — please try again');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <section>
        {successMessage && (
          <div className="border border-leaf bg-leaf/10 text-leaf text-sm font-medium px-4 py-3 mb-4">
            {successMessage}
          </div>
        )}
        <form
          onSubmit={submitCircular}
          className="grid grid-cols-1 sm:grid-cols-2 gap-4 border border-rule p-5 mb-4"
        >
          <div className="sm:col-span-2">
            <label className="block text-xs font-mono uppercase text-ink/50 mb-1">Title</label>
            <input
              required
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              className="w-full border border-rule px-3 py-2 text-sm focus:outline-none focus:border-maroon"
            />
          </div>

          <div>
            <label className="block text-xs font-mono uppercase text-ink/50 mb-1">Category</label>
            <select
              value={form.category}
              onChange={(e) =>
                setForm((f) => ({ ...f, category: e.target.value as Circular['category'] }))
              }
              className="w-full border border-rule px-3 py-2 text-sm focus:outline-none focus:border-maroon bg-paper"
            >
              {CATEGORY_OPTIONS.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-mono uppercase text-ink/50 mb-1">Status</label>
            <select
              value={form.status}
              onChange={(e) =>
                setForm((f) => ({ ...f, status: e.target.value as Circular['status'] }))
              }
              className="w-full border border-rule px-3 py-2 text-sm focus:outline-none focus:border-maroon bg-paper"
            >
              <option value="published">Published — visible on the site</option>
              <option value="draft">Draft — admin only</option>
            </select>
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-mono uppercase text-ink/50 mb-2">Sections</label>
            <label className="flex items-center gap-2 text-sm mb-2 font-medium">
              <input
                type="checkbox"
                checked={SECTION_OPTIONS.every((s) => form.sections.includes(s.value))}
                onChange={(e) => toggleAllSections(e.target.checked)}
              />
              All Circulars
            </label>
            <div className="flex flex-wrap gap-x-4 gap-y-1">
              {SECTION_OPTIONS.map((s) => (
                <label key={s.value} className="flex items-center gap-1.5 text-sm">
                  <input
                    type="checkbox"
                    checked={form.sections.includes(s.value)}
                    onChange={() => toggleSection(s.value)}
                  />
                  {s.label}
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono uppercase text-ink/50 mb-1">
              Date of Posting
            </label>
            <input
              required
              type="datetime-local"
              value={form.postedAt}
              onChange={(e) => setForm((f) => ({ ...f, postedAt: e.target.value }))}
              className="w-full border border-rule px-3 py-2 text-sm focus:outline-none focus:border-maroon"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-mono uppercase text-ink/50 mb-1">Summary</label>
            <RichTextEditor
              key={editorKey}
              ref={editorRef}
              initialHtml={form.summary}
              onChange={(html) => setForm((f) => ({ ...f, summary: html }))}
              onPickImage={() => {
                setPickerMode('inline');
                setPickerOpen(true);
              }}
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-mono uppercase text-ink/50 mb-1">
              PDF URL (optional)
            </label>
            <input
              type="url"
              value={form.pdfUrl}
              onChange={(e) => setForm((f) => ({ ...f, pdfUrl: e.target.value }))}
              className="w-full border border-rule px-3 py-2 text-sm focus:outline-none focus:border-maroon"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-mono uppercase text-ink/50 mb-1">
              Image URL (optional)
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={form.imageUrl}
                onChange={(e) => setForm((f) => ({ ...f, imageUrl: e.target.value }))}
                placeholder="/assets/uploads/… or https://www.airfindia.org/…"
                className="flex-1 min-w-0 border border-rule px-3 py-2 text-sm focus:outline-none focus:border-maroon"
              />
              <button
                type="button"
                onClick={() => {
                  setPickerMode('cover');
                  setPickerOpen(true);
                }}
                className="shrink-0 border border-ink px-3 py-2 text-sm text-ink hover:bg-ink hover:text-paper transition-colors"
              >
                Choose image
              </button>
            </div>
            {form.imageUrl && (
              <div className="mt-2 flex items-center gap-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={form.imageUrl} alt="" className="h-16 w-28 object-cover border border-rule" />
                <button
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, imageUrl: '' }))}
                  className="text-xs text-ink/50 hover:text-red-600"
                >
                  Remove image
                </button>
              </div>
            )}
            <p className="text-xs text-ink/50 mt-1">
              Pick from your uploads or AIRF&rsquo;s media library, or upload a new image.
            </p>
          </div>

          <div className="sm:col-span-2">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={form.isFeatured}
                onChange={(e) => setForm((f) => ({ ...f, isFeatured: e.target.checked }))}
              />
              Feature this circular (Must Read)
            </label>
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-mono uppercase text-ink/50 mb-2">
              Applies to
            </label>
            <label className="flex items-center gap-2 text-sm mb-2">
              <input
                type="checkbox"
                checked={form.allStates}
                onChange={(e) =>
                  setForm((f) => ({ ...f, allStates: e.target.checked, others: e.target.checked ? false : f.others }))
                }
              />
              Central Circular
            </label>
            <label className="flex items-center gap-2 text-sm mb-2">
              <input
                type="checkbox"
                checked={form.others}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    others: e.target.checked,
                    allStates: e.target.checked ? false : f.allStates,
                    states: e.target.checked ? [] : f.states,
                  }))
                }
              />
              Others (news report, analysis, calculator — not state-specific)
            </label>
            <div className="flex flex-wrap gap-x-4 gap-y-1">
              {STATE_OPTIONS.map((s) => (
                <label key={s} className="flex items-center gap-1.5 text-sm">
                  <input
                    type="checkbox"
                    checked={form.states.includes(s)}
                    onChange={() => toggleState(s)}
                  />
                  {s}
                </label>
              ))}
            </div>
          </div>

          {error && <p className="sm:col-span-2 text-sm text-red-600">{error}</p>}

          <div className="sm:col-span-2 flex gap-3">
            <button
              type="submit"
              disabled={saving}
              className="bg-ink text-paper px-4 py-2 text-sm font-medium hover:bg-maroon transition-colors disabled:opacity-50"
            >
              {saving ? 'Saving…' : editingId ? 'Save Changes' : 'Add Post'}
            </button>
            {editingId && (
              <Link href="/admin/posts" className="text-sm text-ink/60 hover:text-maroon self-center">
                Cancel
              </Link>
            )}
          </div>
        </form>
      </section>

      {pickerOpen && (
        <div
          className="fixed inset-0 z-50 bg-ink/60 flex items-start justify-center p-4 overflow-y-auto"
          role="dialog"
          aria-modal="true"
          aria-label="Choose image"
          onClick={(e) => e.target === e.currentTarget && setPickerOpen(false)}
        >
          <div className="bg-paper w-full max-w-4xl mt-8 p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-serif text-xl font-semibold text-ink">
                {pickerMode === 'inline' ? 'Insert image into the text' : 'Choose image'}
              </h2>
              <button
                type="button"
                onClick={() => setPickerOpen(false)}
                className="text-sm text-ink/60 hover:text-maroon"
              >
                Close
              </button>
            </div>
            <MediaLibrary
              onSelect={(url) => {
                setPickerOpen(false);
                if (pickerMode === 'inline') {
                  // Placed at the cursor the editor had when "Image" was pressed.
                  const alt = window.prompt('Short description of the image (optional)')?.trim() ?? '';
                  editorRef.current?.insertImage(url, alt);
                } else {
                  setForm((f) => ({ ...f, imageUrl: url }));
                }
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
