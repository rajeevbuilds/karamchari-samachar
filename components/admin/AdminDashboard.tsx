'use client';

import { useEffect, useState, type FormEvent } from 'react';
import type { AdminCircular, AdminDaRecord, Circular } from '@/lib/data';
import { STATE_OPTIONS, SECTION_OPTIONS } from '@/lib/constants';

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
  department: '',
  category: 'general' as Circular['category'],
  section: '',
  issueDate: '',
  summary: '',
  pdfUrl: '',
  imageUrl: '',
  isFeatured: false,
  states: [] as string[],
  allStates: false,
};

const EMPTY_DA_FORM = { effectiveFrom: '', percentage: '', ordersIssued: '' };

// Redirects to the login page if the session cookie has expired mid-session,
// instead of leaving the admin stuck looking at a silently failed request.
async function apiFetch(url: string, options?: RequestInit): Promise<Response> {
  const res = await fetch(url, options);
  if (res.status === 401) {
    window.location.href = '/admin/login';
    throw new Error('Unauthorized');
  }
  return res;
}

export default function AdminDashboard({
  initialCirculars,
  initialDaHistory,
}: {
  initialCirculars: AdminCircular[];
  initialDaHistory: AdminDaRecord[];
}) {
  const [circulars, setCirculars] = useState(initialCirculars);
  const [daHistory, setDaHistory] = useState(initialDaHistory);

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

  const [daForm, setDaForm] = useState(EMPTY_DA_FORM);
  const [daEditingId, setDaEditingId] = useState<number | null>(null);
  const [daError, setDaError] = useState<string | null>(null);
  const [daSaving, setDaSaving] = useState(false);

  async function refreshCirculars() {
    const res = await apiFetch('/api/admin/circulars');
    if (res.ok) {
      const data = await res.json();
      setCirculars(data.circulars);
    }
  }

  async function refreshDaHistory() {
    const res = await apiFetch('/api/admin/da-history');
    if (res.ok) {
      const data = await res.json();
      setDaHistory(data.daHistory);
    }
  }

  function startEdit(c: AdminCircular) {
    setEditingId(c.id);
    setForm({
      title: c.title,
      department: c.department,
      category: c.category,
      section: c.section ?? '',
      issueDate: c.issueDate,
      summary: c.summary,
      pdfUrl: c.pdfUrl,
      imageUrl: c.imageUrl ?? '',
      isFeatured: c.isFeatured,
      states: c.states.includes('all') ? [] : c.states,
      allStates: c.states.includes('all'),
    });
    setError(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function resetForm() {
    setEditingId(null);
    setForm(EMPTY_FORM);
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

    const wasEditing = editingId !== null;
    const payload = {
      title: form.title,
      department: form.department,
      category: form.category,
      section: form.section || null,
      issueDate: form.issueDate,
      summary: form.summary,
      pdfUrl: form.pdfUrl,
      imageUrl: form.imageUrl || null,
      isFeatured: form.isFeatured,
      states: form.allStates ? ['all'] : form.states,
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
      setSuccessMessage(wasEditing ? 'Circular updated successfully' : 'Circular added successfully');
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

  function startEditDa(record: AdminDaRecord) {
    setDaEditingId(record.id);
    setDaForm({
      effectiveFrom: record.effectiveFrom,
      percentage: String(record.percentage),
      ordersIssued: record.ordersIssued,
    });
    setDaError(null);
  }

  function resetDaForm() {
    setDaEditingId(null);
    setDaForm(EMPTY_DA_FORM);
    setDaError(null);
  }

  async function submitDa(e: FormEvent) {
    e.preventDefault();
    setDaSaving(true);
    setDaError(null);

    const payload = {
      effectiveFrom: daForm.effectiveFrom,
      percentage: Number(daForm.percentage),
      ordersIssued: daForm.ordersIssued,
    };

    try {
      const res = await apiFetch(
        daEditingId ? `/api/admin/da-history/${daEditingId}` : '/api/admin/da-history',
        {
          method: daEditingId ? 'PUT' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        }
      );
      const data = await res.json();
      if (!res.ok) {
        setDaError(data.error || 'Something went wrong');
        return;
      }
      await refreshDaHistory();
      resetDaForm();
    } catch {
      setDaError('Network error — please try again');
    } finally {
      setDaSaving(false);
    }
  }

  async function deleteDaRow(id: number) {
    if (!confirm('Delete this DA record?')) return;
    const res = await apiFetch(`/api/admin/da-history/${id}`, { method: 'DELETE' });
    if (res.ok) {
      await refreshDaHistory();
      if (daEditingId === id) resetDaForm();
    } else {
      const data = await res.json().catch(() => ({}));
      alert(data.error || 'Failed to delete');
    }
  }

  return (
    <div className="flex flex-col gap-16">
      {/* Circulars */}
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
            <label className="block text-xs font-mono uppercase text-ink/50 mb-1">Department</label>
            <input
              required
              value={form.department}
              onChange={(e) => setForm((f) => ({ ...f, department: e.target.value }))}
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
            <label className="block text-xs font-mono uppercase text-ink/50 mb-1">
              Section (optional)
            </label>
            <select
              value={form.section}
              onChange={(e) => setForm((f) => ({ ...f, section: e.target.value }))}
              className="w-full border border-rule px-3 py-2 text-sm focus:outline-none focus:border-maroon bg-paper"
            >
              <option value="">— None —</option>
              {SECTION_OPTIONS.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
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
            <textarea
              required
              rows={3}
              value={form.summary}
              onChange={(e) => setForm((f) => ({ ...f, summary: e.target.value }))}
              className="w-full border border-rule px-3 py-2 text-sm focus:outline-none focus:border-maroon"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-mono uppercase text-ink/50 mb-1">PDF URL</label>
            <input
              required
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
            <input
              type="url"
              value={form.imageUrl}
              onChange={(e) => setForm((f) => ({ ...f, imageUrl: e.target.value }))}
              className="w-full border border-rule px-3 py-2 text-sm focus:outline-none focus:border-maroon"
            />
            <p className="text-xs text-ink/50 mt-1">
              Upload the image to your WordPress media library first, then paste its URL here.
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
              All states (central circular)
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
                <td className="py-2.5 pr-4">{c.title}</td>
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

      {/* DA history */}
      <section>
        <h2 className="font-serif text-xl font-semibold text-ink mb-4">
          {daEditingId ? 'Edit DA Record' : 'Add DA Record'}
        </h2>
        <form
          onSubmit={submitDa}
          className="grid grid-cols-1 sm:grid-cols-3 gap-4 border border-rule p-5 mb-4"
        >
          <div>
            <label className="block text-xs font-mono uppercase text-ink/50 mb-1">
              Effective From
            </label>
            <input
              required
              type="date"
              value={daForm.effectiveFrom}
              onChange={(e) => setDaForm((f) => ({ ...f, effectiveFrom: e.target.value }))}
              className="w-full border border-rule px-3 py-2 text-sm focus:outline-none focus:border-maroon"
            />
          </div>
          <div>
            <label className="block text-xs font-mono uppercase text-ink/50 mb-1">
              Percentage
            </label>
            <input
              required
              type="number"
              min={0}
              max={200}
              value={daForm.percentage}
              onChange={(e) => setDaForm((f) => ({ ...f, percentage: e.target.value }))}
              className="w-full border border-rule px-3 py-2 text-sm focus:outline-none focus:border-maroon"
            />
          </div>
          <div>
            <label className="block text-xs font-mono uppercase text-ink/50 mb-1">
              Orders Issued
            </label>
            <input
              required
              type="date"
              value={daForm.ordersIssued}
              onChange={(e) => setDaForm((f) => ({ ...f, ordersIssued: e.target.value }))}
              className="w-full border border-rule px-3 py-2 text-sm focus:outline-none focus:border-maroon"
            />
          </div>

          {daError && <p className="sm:col-span-3 text-sm text-red-600">{daError}</p>}

          <div className="sm:col-span-3 flex gap-3">
            <button
              type="submit"
              disabled={daSaving}
              className="bg-ink text-paper px-4 py-2 text-sm font-medium hover:bg-maroon transition-colors disabled:opacity-50"
            >
              {daSaving ? 'Saving…' : daEditingId ? 'Save Changes' : 'Add Record'}
            </button>
            {daEditingId && (
              <button
                type="button"
                onClick={resetDaForm}
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
              <th className="py-2 font-medium">Effective From</th>
              <th className="py-2 font-medium">Percentage</th>
              <th className="py-2 font-medium">Orders Issued</th>
              <th className="py-2 font-medium" />
            </tr>
          </thead>
          <tbody>
            {daHistory.map((d) => (
              <tr key={d.id} className="border-b border-rule/60">
                <td className="py-2.5 pr-4 font-mono text-xs text-ink/60">{d.effectiveFrom}</td>
                <td className="py-2.5 pr-4">{d.percentage}%</td>
                <td className="py-2.5 pr-4 font-mono text-xs text-ink/60">{d.ordersIssued}</td>
                <td className="py-2.5 whitespace-nowrap">
                  <button
                    onClick={() => startEditDa(d)}
                    className="text-maroon hover:underline mr-3"
                  >
                    Edit
                  </button>
                  <button onClick={() => deleteDaRow(d.id)} className="text-ink/50 hover:text-red-600">
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {daHistory.length === 0 && (
              <tr>
                <td colSpan={4} className="py-4 text-ink/50">
                  No DA records yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </section>
    </div>
  );
}
