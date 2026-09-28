import { balanceMap } from './balances';
import type { Id, KkbEvent, Minor } from './schema';

export interface Transfer {
  from: Id;
  to: Id;
  amount: Minor;
}

/**
 * Greedy settle-up: repeatedly match the largest debtor with the largest creditor.
 * Each round zeroes at least one person, so there are at most n − 1 transfers.
 * Ties are broken by the order of `peopleOrder`, which keeps the result deterministic.
 */
export function settle(balances: Map<Id, Minor>, peopleOrder: Id[]): Transfer[] {
  const remaining = new Map(balances);
  const rank = (id: Id) => {
    const i = peopleOrder.indexOf(id);
    return i === -1 ? Number.MAX_SAFE_INTEGER : i;
  };
  const transfers: Transfer[] = [];

  for (;;) {
    const entries = [...remaining.entries()];
    const creditors = entries
      .filter(([, b]) => b > 0)
      .sort((a, b) => b[1] - a[1] || rank(a[0]) - rank(b[0]));
    const debtors = entries
      .filter(([, b]) => b < 0)
      .sort((a, b) => a[1] - b[1] || rank(a[0]) - rank(b[0]));
    if (creditors.length === 0 || debtors.length === 0) break;

    const [creditor, credit] = creditors[0];
    const [debtor, debt] = debtors[0];
    const amount = Math.min(credit, -debt);
    transfers.push({ from: debtor, to: creditor, amount });
    remaining.set(creditor, credit - amount);
    remaining.set(debtor, debt + amount);
  }
  return transfers;
}

export function settleEvent(event: KkbEvent): Transfer[] {
  return settle(
    balanceMap(event),
    event.people.map((p) => p.id),
  );
}
