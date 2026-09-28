import type { Id, KkbEvent, Minor } from './schema';
import { expenseShares, expenseTotal } from './split';

export interface PersonBalance {
  personId: Id;
  /** Total of the expenses this person paid for the group. */
  paid: Minor;
  /** What this person consumed across all expenses. */
  share: Minor;
  sent: Minor;
  received: Minor;
  /** Positive = gets money back. Negative = owes. */
  balance: Minor;
}

/**
 * balance = paid for the group − own share + payments sent − payments received.
 * The balances always sum to exactly zero.
 */
export function computeBalances(event: KkbEvent): PersonBalance[] {
  const order = event.people.map((p) => p.id);
  const rows = new Map<Id, PersonBalance>(
    order.map((personId) => [
      personId,
      { personId, paid: 0, share: 0, sent: 0, received: 0, balance: 0 },
    ]),
  );
  const row = (id: Id) => rows.get(id);

  for (const expense of event.expenses) {
    const payer = row(expense.paidBy);
    if (payer) payer.paid += expenseTotal(expense);
    for (const [id, share] of expenseShares(expense, order)) {
      const r = row(id);
      if (r) r.share += share;
    }
  }
  for (const payment of event.payments) {
    const from = row(payment.from);
    const to = row(payment.to);
    if (from) from.sent += payment.amount;
    if (to) to.received += payment.amount;
  }

  const result = [...rows.values()].map((r) => ({
    ...r,
    balance: r.paid - r.share + r.sent - r.received,
  }));
  if (import.meta.env.DEV) {
    console.assert(
      result.reduce((sum, r) => sum + r.balance, 0) === 0,
      'KKB: balances must sum to zero',
    );
  }
  return result;
}

export function balanceMap(event: KkbEvent): Map<Id, Minor> {
  return new Map(computeBalances(event).map((r) => [r.personId, r.balance]));
}

export function totalSpent(event: KkbEvent): Minor {
  return event.expenses.reduce((sum, e) => sum + expenseTotal(e), 0);
}

/** True when there is at least one expense and nobody owes anything. */
export function isSettled(event: KkbEvent): boolean {
  return event.expenses.length > 0 && computeBalances(event).every((r) => r.balance === 0);
}

/** How much still has to move for everyone to be even (sum of what debtors owe). */
export function amountToSettle(event: KkbEvent): Minor {
  return computeBalances(event).reduce((sum, r) => sum + Math.max(0, -r.balance), 0);
}
