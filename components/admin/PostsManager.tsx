'use client';

import { useEffect, useState, type FormEvent } from 'react';
import type { AdminCircular, Circular } from '@/lib/data';
import { STATE_OPTIONS, SECTION_OPTIONS } from '@/lib/constants';
import { summaryToEditorHtml } from '@/lib/summary';
import { apiFetch } from './apiFetch';
import MediaLibrary from './MediaLibrary';
import RichTextEditor from './RichTextEditor';

const CATEGORY_OPTIONS: { value: Circular['category']; label: string }[] = [
  { value: 'da', label: 'Dearness Allowance' },
  { value: 'pay', label: 'Pay Commission' },
  { value: 'transfer', label: 'Transfer & Posting' },
  { value: 'recruitment', label: 'Recruitment' },
  { value: 'pension', label: 'Pension & Medical' },
  { value: 'general', label: 'General' },
];

const CATEGORY_LABEL: Record<Circular['category'], string> = Object.fromEntries(
  CATEGORY_OPTIONS.map((c) => [c.value, c.label])
) as Record<Circular['category'], string>;

const EMPTY_FORM = {
  title: '',
  category: 'general' as Circular['category'],
  section: '',
  issueDate: '',
  summary: '',
  pdfUrl: '',
  imageUrl: '',
  isFeatured: false,
  states: [] as string[],
  allStates: false,
  status: 'published' as Circular['status'],
};

// Posts section of the admin panel: add/edit form + list of circulars.
export default function PostsManager({ initialCirculars }: { initialCirculars: AdminCircular[] }) {
  const [circulars, setCirculars] = useState(initialCirculars);
  // Bumped whenever the form loads different content, to remount the
  // (uncontrolled) rich-text editor with it.
  const [editorKey, setEditorKey] = useState(0);
  const [pickerOpen, setPickerOpen] = useState(false);

  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!successMessage) return;
    const timer = window.setTimeout(() => setSuccessMessage(null), 4000);
    return () => window.clearTimeout(timer);
  }, [successMessage]);

  async function refreshCirculars() {
    const res = await apiFetch('/api/admin/circulars');
    if (res.ok) {
      const data = await res.json();
      setCirculars(data.circulars);
    }
  }

  function startEdit(c: AdminCircular) {
    setEditingId(c.id);
    setForm({
      title: c.title,
      category: c.category,
      section: c.section ?? '',
      issueDate: c.issueDate,
      summary: summaryToEditorHtml(c.summary),
      pdfUrl: c.pdfUrl ?? '',
      imageUrl: c.imageUrl ?? '',
      isFeatured: c.isFeatured,
      states: c.states.includes('all') ? [] : c.states,
      allStates: c.states.includes('all'),
      status: c.status,
    });
    setEditorKey((k) => k + 1);
    setError(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function resetForm() {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setEditorKey((k) => k + 1);
    setError(null);
  }

  function toggleState(state: string) {
    setForm((f) => ({
      ...f,
      states: f.states.includes(state) ? f.states.filter((s) => s !== state) : [...f.states, state],
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
      section: form.section,
      issueDate: form.issueDate,
      summary: form.summary,
      pdfUrl: form.pdfUrl,
      imageUrl: form.imageUrl || null,
      isFeatured: form.isFeatured,
      states: form.allStates ? ['all'] : form.states,
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
      await refreshCirculars();
      resetForm();
      setSuccessMessage(isPublished ? 'Circular published successfully' : 'Saved as draft');
    } catch {
      setError('Network error — please try again');
    } finally {
      setSaving(false);
    }
  }

  async function deleteCircularRow(id: number) {
    if (!confirm('Delete this circular? This cannot be undone.')) return;
    const res = await apiFetch(`/api/admin/circulars/${id}`, { method: 'DELETE' });
    if (res.ok) {
      await refreshCirculars();
      if (editingId === id) resetForm();
    } else {
      const data = await res.json().catch(() => ({}));
      alert(data.error || 'Failed to delete');
    }
  }

  return (
    <div>
      <section>
        <h2 className="font-serif text-xl font-semibold text-ink mb-4">
          {editingId ? 'Edit Circular' : 'Add Circular'}
        </h2>
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
            <label className="block text-xs font-mono uppercase text-ink/50 mb-1">Section</label>
            <select
              required
              value={form.section}
              onChange={(e) => setForm((f) => ({ ...f, section: e.target.value }))}
              className="w-full border border-rule px-3 py-2 text-sm focus:outline-none focus:border-maroon bg-paper"
            >
              <option value="" disabled>
                — Select a section —
              </option>
              {SECTION_OPTIONS.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
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

          <div>
            <label className="block text-xs font-mono uppercase text-ink/50 mb-1">
              Date of Posting
            </label>
            <input
              required
              type="date"
              value={form.issueDate}
              onChange={(e) => setForm((f) => ({ ...f, issueDate: e.target.value }))}
              className="w-full border border-rule px-3 py-2 text-sm focus:outline-none focus:border-maroon"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-mono uppercase text-ink/50 mb-1">Summary</label>
            <RichTextEditor
              key={editorKey}
              initialHtml={form.summary}
              onChange={(html) => setForm((f) => ({ ...f, summary: html }))}
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
                onClick={() => setPickerOpen(true)}
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
                onChange={(e) => setForm((f) => ({ ...f, allStates: e.target.checked }))}
              />
              Central Circular
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
              {saving ? 'Saving…' : editingId ? 'Save Changes' : 'Add Circular'}
            </button>
            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                className="text-sm text-ink/60 hover:text-maroon"
              >
                Cancel edit
              </button>
            )}
          </div>
        </form>

        <table className="w-full text-sm border-t border-rule">
          <thead>
            <tr className="border-b border-rule text-left text-ink/50 font-mono text-xs uppercase">
              <th className="py-2 font-medium">Title</th>
              <th className="py-2 font-medium">Category</th>
              <th className="py-2 font-medium">Posted</th>
              <th className="py-2 font-medium" />
            </tr>
          </thead>
          <tbody>
            {circulars.map((c) => (
              <tr key={c.id} className="border-b border-rule/60">
                <td className="py-2.5 pr-4">
                  {c.status === 'draft' && (
                    <span className="mr-2 font-mono text-[10px] uppercase tracking-wide text-brass border border-brass px-1.5 py-0.5 align-middle">
                      Draft
                    </span>
                  )}
                  {c.title}
                </td>
                <td className="py-2.5 pr-4 font-mono text-xs text-ink/60">
                  {CATEGORY_LABEL[c.category]}
                </td>
                <td className="py-2.5 pr-4 font-mono text-xs text-ink/60">{c.issueDate}</td>
                <td className="py-2.5 whitespace-nowrap">
                  <button onClick={() => startEdit(c)} className="text-maroon hover:underline mr-3">
                    Edit
                  </button>
                  <button
                    onClick={() => deleteCircularRow(c.id)}
                    className="text-ink/50 hover:text-red-600"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {circulars.length === 0 && (
              <tr>
                <td colSpan={4} className="py-4 text-ink/50">
                  No circulars yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
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
              <h2 className="font-serif text-xl font-semibold text-ink">Choose image</h2>
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
                setForm((f) => ({ ...f, imageUrl: url }));
                setPickerOpen(false);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
