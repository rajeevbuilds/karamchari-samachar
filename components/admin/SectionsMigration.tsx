'use client';

import { useState } from 'react';
import { apiFetch } from './apiFetch';

type MigrationResult = {
  ok?: boolean;
  columnAlreadyExisted?: boolean;
  columnTypeBefore?: string | null;
  columnTypeAfter?: string;
  backfilled?: number;
  error?: string;
};

// Settings section of the admin panel: runs the one-off
// /api/admin/migrate-circulars-sections route (checks the circulars.sections
// column and widens it to TEXT if needed) and shows the result inline.
export default function SectionsMigration() {
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<MigrationResult | null>(null);
  const [networkError, setNetworkError] = useState(false);

  async function run() {
    if (!confirm('This will check and fix the sections column. Continue?')) return;
    setRunning(true);
    setResult(null);
    setNetworkError(false);
    try {
      const res = await apiFetch('/api/admin/migrate-circulars-sections', { method: 'POST' });
      const data: MigrationResult = await res.json().catch(() => ({ error: `HTTP ${res.status}` }));
      setResult(res.ok ? data : { ...data, ok: false, error: data.error || `HTTP ${res.status}` });
    } catch {
      setNetworkError(true);
    } finally {
      setRunning(false);
    }
  }

  const success = result?.ok === true;

  return (
    <section>
      <h2 className="font-serif text-xl font-semibold text-ink mb-1">Database Maintenance</h2>
      <p className="text-sm text-ink/60 mb-4">
        Checks the circulars &ldquo;sections&rdquo; column and converts it to TEXT if it is anything
        narrower, so a circular can be filed under several sections. Safe to run more than once.
      </p>
      <button
        type="button"
        onClick={run}
        disabled={running}
        className="bg-ink text-paper px-4 py-2 text-sm font-medium hover:bg-maroon transition-colors disabled:opacity-50"
      >
        {running ? 'Running…' : 'Run Sections Migration'}
      </button>

      {networkError && (
        <p className="mt-4 text-sm text-red-600">Network error — please try again</p>
      )}

      {result && (
        <div
          className={`mt-4 border p-4 text-sm ${success ? 'border-leaf' : 'border-red-600'}`}
          role="status"
        >
          <p className={`font-medium mb-2 ${success ? 'text-leaf' : 'text-red-600'}`}>
            {success ? 'Migration succeeded' : 'Migration failed'}
          </p>
          {success ? (
            <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 font-mono text-xs">
              <dt className="text-ink/50">columnTypeBefore</dt>
              <dd>{result.columnTypeBefore ?? 'null (column did not exist)'}</dd>
              <dt className="text-ink/50">columnTypeAfter</dt>
              <dd>{result.columnTypeAfter}</dd>
              <dt className="text-ink/50">columnAlreadyExisted</dt>
              <dd>{String(result.columnAlreadyExisted)}</dd>
              <dt className="text-ink/50">backfilled</dt>
              <dd>{result.backfilled} row(s)</dd>
            </dl>
          ) : (
            <p className="font-mono text-xs break-words">{result.error}</p>
          )}
        </div>
      )}
    </section>
  );
}
