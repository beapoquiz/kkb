import { MoreHorizontal } from 'lucide-react';
import { Link } from 'react-router-dom';
import { AvatarStack } from '../../components/Avatar';
import { StatusPill } from '../../components/StatusPill';
import { totalSpent } from '../../lib/balances';
import { formatMoney } from '../../lib/money';
import { eventColor } from '../../lib/people';
import type { KkbEvent } from '../../lib/schema';

export function EventCard({ event, onMenu }: { event: KkbEvent; onMenu: () => void }) {
  return (
    <article className="relative overflow-hidden rounded-card bg-surface shadow-card">
      <span className="block h-1" style={{ background: eventColor(event.id) }} aria-hidden="true" />
      <Link
        to={`/e/${event.id}`}
        className="squish flex items-center gap-3 p-4 pr-14 outline-offset-[-3px]"
      >
        <span
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-cream text-2xl"
          aria-hidden="true"
        >
          {event.emoji}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate font-display text-h2 font-medium" title={event.name}>
            {event.name}
          </span>
          <span className="mt-1 flex items-center gap-2 text-caption text-ink-muted">
            <AvatarStack people={event.people} />
            <span className="ml-1 tabular">{formatMoney(totalSpent(event), event.currency)}</span>
          </span>
          <span className="mt-2 block">
            <StatusPill event={event} />
          </span>
        </span>
      </Link>
      <button
        type="button"
        onClick={onMenu}
        aria-label={`More options for ${event.name}`}
        className="squish absolute top-4 right-2 flex h-11 w-11 items-center justify-center rounded-full text-ink-muted hover:bg-blue-soft"
      >
        <MoreHorizontal size={22} aria-hidden="true" />
      </button>
    </article>
  );
}
