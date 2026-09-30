'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { AdminCircular } from '@/lib/data';
import { CATEGORY_LABEL } from '@/lib/constants';
import { apiFetch } from './apiFetch';


// All Posts section of the admin panel: every circular with Edit / Delete.
export default function PostsList({ initialCirculars }: { initialCirculars: AdminCircular[] }) {
  const [circulars, setCirculars] = useState(initialCirculars);
  const [error, setError] = useState<string | null>(null);

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
              <td className="py-2.5 pr-4 font-mono text-xs text-ink/60">{CATEGORY_LABEL[c.category]}</td>
              <td className="py-2.5 pr-4 font-mono text-xs text-ink/60">{c.issueDate}</td>
              <td className="py-2.5 whitespace-nowrap">
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
              <td colSpan={4} className="py-4 text-ink/50">
                No circulars yet.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </section>
  );
}
