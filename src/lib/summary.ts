import { balanceMap, totalSpent } from './balances';
import { formatMoney } from './money';
import type { Id, KkbEvent, Person } from './schema';
import { settleEvent } from './settle';

function peopleById(event: KkbEvent): Map<Id, Person> {
  return new Map(event.people.map((p) => [p.id, p]));
}

export function handleText(person: Person | undefined): string | null {
  return person?.payment ? `${person.payment.method} ${person.payment.value}` : null;
}

/** The plain-text summary for the group chat (docs/01-product-spec.md §4). */
export function buildSummary(event: KkbEvent, shareUrl: string): string {
  const people = peopleById(event);
  const name = (id: Id) => people.get(id)?.name ?? '?';
  const money = (minor: number) => formatMoney(minor, event.currency);
  const count = event.people.length;
  const transfers = settleEvent(event);

  const lines = [
    `🐟 KKB — ${event.name}`,
    `Total spent: ${money(totalSpent(event))} (${count} ${count === 1 ? 'person' : 'people'})`,
    '',
  ];
  if (transfers.length === 0) {
    lines.push(`Everyone's even! 🎉`);
  } else {
    lines.push('To settle up:');
    for (const t of transfers) {
      const handle = handleText(people.get(t.to));
      lines.push(
        `• ${name(t.from)} → ${name(t.to)}: ${money(t.amount)}${handle ? ` (${handle})` : ''}`,
      );
    }
  }
  for (const p of event.payments) {
    lines.push(`✅ Paid: ${name(p.from)} → ${name(p.to)} ${money(p.amount)}`);
  }
  lines.push('', `Open the full breakdown: ${shareUrl}`);
  return lines.join('\n');
}

/** A short personal line, e.g. "KKB — Baguio Barkada Trip: I owe Bea ₱2,012.08". */
export function buildPersonalSummary(event: KkbEvent, personId: Id): string {
  const people = peopleById(event);
  const money = (minor: number) => formatMoney(minor, event.currency);
  const transfers = settleEvent(event);
  const owes = transfers.filter((t) => t.from === personId);
  const getsBack = transfers.filter((t) => t.to === personId);
  const prefix = `KKB — ${event.name}: `;

  if (owes.length > 0) {
    const parts = owes.map((t) => {
      const handle = handleText(people.get(t.to));
      return `${people.get(t.to)?.name ?? '?'} ${money(t.amount)}${handle ? ` (${handle})` : ''}`;
    });
    return `${prefix}I owe ${parts.join(', ')}`;
  }
  if (getsBack.length > 0) {
    const total = balanceMap(event).get(personId) ?? 0;
    return `${prefix}I get back ${money(total)}`;
  }
  return `${prefix}I'm all square 🎉`;
}
