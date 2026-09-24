import CircularCard from '@/components/CircularCard';
import { getCircularsByState } from '@/lib/data';
import { STATE_OPTIONS } from '@/lib/constants';

function stateLabel(slug: string) {
  return slug
    .split('-')
    .map((w) => w[0].toUpperCase() + w.slice(1))
    .join(' ');
}

export default async function StatePage({
  params,
}: {
  params: Promise<{ state: string }>;
}) {
  const { state } = await params;
  const circulars = await getCircularsByState(state);
  const label = stateLabel(state);

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="font-serif text-3xl font-semibold text-ink mb-1">{label}</h1>
      <p className="text-sm text-ink/60 mb-8">
        Central circulars plus notifications specific to {label}
      </p>

      <div className="flex flex-wrap gap-2 mb-8 pb-6 border-b border-rule">
        {STATE_OPTIONS.map((s) => (
          <a
            key={s}
            href={`/states/${s}`}
            className={`text-xs font-mono px-2.5 py-1 border ${
              s === state
                ? 'bg-ink text-paper border-ink'
                : 'border-rule text-ink/60 hover:border-maroon hover:text-maroon'
            } transition-colors`}
          >
            {stateLabel(s)}
          </a>
        ))}
      </div>

      {circulars.length === 0 ? (
        <p className="text-sm text-ink/60">No circulars for {label} yet.</p>
      ) : (
        <div className="space-y-8">
          {circulars.map((circular) => (
            <CircularCard key={circular.slug} circular={circular} />
          ))}
        </div>
      )}
    </div>
  );
}
