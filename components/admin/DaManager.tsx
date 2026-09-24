'use client';

import { useState, type FormEvent } from 'react';
import type { AdminDaRecord } from '@/lib/data';
import { apiFetch } from './apiFetch';

const EMPTY_DA_FORM = { effectiveFrom: '', percentage: '', ordersIssued: '' };

// Settings section of the admin panel: DA history add/edit form + list.
export default function DaManager({ initialDaHistory }: { initialDaHistory: AdminDaRecord[] }) {
  const [daHistory, setDaHistory] = useState(initialDaHistory);
  const [daForm, setDaForm] = useState(EMPTY_DA_FORM);
  const [daEditingId, setDaEditingId] = useState<number | null>(null);
  const [daError, setDaError] = useState<string | null>(null);
  const [daSaving, setDaSaving] = useState(false);

  async function refreshDaHistory() {
    const res = await apiFetch('/api/admin/da-history');
    if (res.ok) {
      const data = await res.json();
      setDaHistory(data.daHistory);
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
  );
}
