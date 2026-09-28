import { AvatarStack } from '../../components/Avatar';
import { totalSpent } from '../../lib/balances';
import { formatMoney } from '../../lib/money';
import type { KkbEvent } from '../../lib/schema';

/** Emoji, name, people and total: the card at the top of a shared link. */
export function EventPreview({ event }: { event: KkbEvent }) {
  const count = event.people.length;
  return (
    <div className="flex items-center gap-3 rounded-card bg-surface p-4 shadow-card">
      <span
        className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-cream text-2xl"
        aria-hidden="true"
      >
        {event.emoji}
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate font-display text-h2 font-medium" title={event.name}>
          {event.name}
        </p>
        <p className="flex items-center gap-2 text-caption text-ink-muted">
          <AvatarStack people={event.people} />
          <span className="ml-1">
            {count} {count === 1 ? 'person' : 'people'} ·{' '}
            <span className="tabular">{formatMoney(totalSpent(event), event.currency)}</span>
          </span>
        </p>
      </div>
    </div>
  );
}
