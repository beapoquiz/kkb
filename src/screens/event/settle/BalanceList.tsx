import { Avatar } from '../../../components/Avatar';
import { BalanceBar } from '../../../components/BalanceBar';
import type { PersonBalance } from '../../../lib/balances';
import { balanceText } from '../../../lib/describe';
import type { Id, KkbEvent } from '../../../lib/schema';

export function BalanceList({
  event,
  balances,
  you,
}: {
  event: KkbEvent;
  balances: PersonBalance[];
  you?: Id | null;
}) {
  const max = Math.max(0, ...balances.map((b) => Math.abs(b.balance)));
  const people = new Map(event.people.map((p) => [p.id, p]));
  return (
    <ul className="flex flex-col gap-3">
      {balances.map((b) => {
        const person = people.get(b.personId);
        if (!person) return null;
        const isYou = b.personId === you;
        return (
          <li
            key={b.personId}
            className={`rounded-2xl px-3 py-2 ${isYou ? 'bg-blue-soft/60 ring-2 ring-blue-strong' : ''}`}
          >
            <div className="flex items-center gap-2">
              <Avatar person={person} size="sm" />
              <span className="min-w-0 flex-1 truncate font-bold" title={person.name}>
                {person.name}
                {isYou && <span className="font-semibold text-ink-muted"> (you)</span>}
              </span>
              <span
                className={`shrink-0 text-label font-bold tabular ${b.balance > 0 ? 'text-mint-strong' : b.balance < 0 ? 'text-pink-strong' : 'text-ink-muted'}`}
              >
                {balanceText(b.balance, event.currency)}
              </span>
            </div>
            <div className="mt-1.5 pl-9">
              <BalanceBar balance={b.balance} max={max} />
            </div>
          </li>
        );
      })}
    </ul>
  );
}
