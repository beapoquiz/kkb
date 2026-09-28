import { CopyIconButton } from '../../components/CopyButton';
import { formatMoney } from '../../lib/money';
import type { Id, KkbEvent } from '../../lib/schema';
import type { Transfer } from '../../lib/settle';
import { Plutus } from '../../mascot/Plutus';

/** The big "You owe Bea ₱420" / "You'll get back ₱850" / "You're all square" card. */
export function YourHero({
  event,
  personId,
  transfers,
}: {
  event: KkbEvent;
  personId: Id;
  transfers: Transfer[];
}) {
  const people = new Map(event.people.map((p) => [p.id, p]));
  const fmt = (m: number) => formatMoney(m, event.currency);
  const owes = transfers.filter((t) => t.from === personId);
  const getsBack = transfers.filter((t) => t.to === personId);

  if (owes.length > 0) {
    return (
      <section
        className="rounded-card bg-pink-soft/40 p-5 ring-1 ring-pink-soft shadow-card"
        aria-label="What you owe"
      >
        <p className="font-bold text-pink-strong">You owe</p>
        <ul className="mt-1 flex flex-col gap-3">
          {owes.map((t) => {
            const to = people.get(t.to);
            return (
              <li key={t.to}>
                <p className="font-display text-amount font-semibold tabular">{fmt(t.amount)}</p>
                <p className="font-bold">to {to?.name}</p>
                {to?.payment && (
                  <p className="mt-1 flex items-center gap-1 text-label">
                    <span className="min-w-0 truncate">
                      <span className="font-bold">{to.payment.method}</span> · {to.payment.value}
                    </span>
                    <CopyIconButton
                      text={to.payment.value}
                      label={`Copy ${to.name}'s ${to.payment.method}`}
                    />
                  </p>
                )}
              </li>
            );
          })}
        </ul>
      </section>
    );
  }

  if (getsBack.length > 0) {
    const total = getsBack.reduce((s, t) => s + t.amount, 0);
    return (
      <section
        className="rounded-card bg-mint-soft/40 p-5 ring-1 ring-mint-soft shadow-card"
        aria-label="What you get back"
      >
        <p className="font-bold text-mint-strong">You'll get back</p>
        <p className="font-display text-amount font-semibold tabular">{fmt(total)}</p>
        <ul className="mt-2 flex flex-col gap-1 text-label">
          {getsBack.map((t) => (
            <li key={t.from}>
              {people.get(t.from)?.name} pays you{' '}
              <span className="font-bold tabular">{fmt(t.amount)}</span>
            </li>
          ))}
        </ul>
      </section>
    );
  }

  return (
    <section className="flex items-center gap-3 rounded-card bg-surface p-4 shadow-card">
      <Plutus mood="celebrating" size={80} decorative />
      <p className="font-display text-h2 font-semibold">You're all square! 🎉</p>
    </section>
  );
}
