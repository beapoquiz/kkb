import { Avatar } from '../../components/Avatar';
import type { KkbEvent } from '../../lib/schema';
import { Plutus } from '../../mascot/Plutus';
import { VIEWER } from '../../store/identity';
import { EventPreview } from './EventPreview';

/** "Hi! Which one is you?" The choice is remembered for this event. */
export function WhoAreYou({
  event,
  onPick,
}: {
  event: KkbEvent;
  onPick: (personId: string) => void;
}) {
  return (
    <main className="flex flex-1 flex-col gap-5 px-4 pt-6 pb-8">
      <p className="text-center text-caption font-bold text-ink-muted">
        You've been invited to split
      </p>
      <EventPreview event={event} />
      <div className="flex flex-col items-center">
        <Plutus mood="happy" size={120} decorative />
        <h1 className="text-h1 font-semibold">Hi! Which one is you?</h1>
      </div>
      <ul className="grid grid-cols-3 gap-3">
        {event.people.map((p) => (
          <li key={p.id}>
            <button
              type="button"
              aria-label={`I'm ${p.name}`}
              onClick={() => onPick(p.id)}
              className="squish flex w-full flex-col items-center gap-1.5 rounded-card bg-surface p-3 shadow-card"
            >
              <Avatar person={p} size="xl" />
              <span className="max-w-full truncate font-bold" title={p.name}>
                {p.name}
              </span>
            </button>
          </li>
        ))}
      </ul>
      <button
        type="button"
        onClick={() => onPick(VIEWER)}
        className="squish mx-auto rounded-full px-4 py-2 font-bold text-blue-strong hover:bg-blue-soft"
      >
        I'm just looking
      </button>
    </main>
  );
}
