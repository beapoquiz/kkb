import { formatMoney } from './money';
import type { CurrencyCode, Expense, KkbEvent } from './schema';
import { expenseParticipants } from './split';

/** "Migs paid · split 4 ways", "Carlo paid · itemized · 4 people" or "Bea paid · (personal)". */
export function describeExpense(event: KkbEvent, expense: Expense): string {
  const payer = event.people.find((p) => p.id === expense.paidBy)?.name ?? 'Someone';
  const participants = expenseParticipants(expense);
  if (participants.length === 1 && participants[0] === expense.paidBy) {
    return `${payer} paid · (personal)`;
  }
  const n = participants.length;
  if (expense.mode === 'itemized') {
    return `${payer} paid · itemized · ${n} ${n === 1 ? 'person' : 'people'}`;
  }
  return `${payer} paid · split ${n} ${n === 1 ? 'way' : 'ways'}`;
}

/** "gets back ₱3,718.91", "owes ₱31.75" or "all square". */
export function balanceText(balance: number, currency: CurrencyCode): string {
  if (balance > 0) return `gets back ${formatMoney(balance, currency)}`;
  if (balance < 0) return `owes ${formatMoney(-balance, currency)}`;
  return 'all square';
}
