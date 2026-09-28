import { ChevronDown } from 'lucide-react';
import { Avatar } from '../../components/Avatar';
import { dateLabel } from '../../lib/dates';
import { describeExpense } from '../../lib/describe';
import { formatMoney } from '../../lib/money';
import { CATEGORY_META, type Expense, type KkbEvent } from '../../lib/schema';
import { expenseShares, expenseTotal, itemizedBreakdown } from '../../lib/split';

/** Read-only expense list. Each row expands to show who owes what (and receipt items). */
export function ExpenseBreakdown({ event }: { event: KkbEvent }) {
  const order = event.people.map((p) => p.id);
  const fmt = (m: number) => formatMoney(m, event.currency);
  const sorted = [...event.expenses].sort(
    (a, b) => b.date.localeCompare(a.date) || b.createdAt - a.createdAt,
  );
  if (sorted.length === 0) return <p className="text-ink-muted">No expenses yet.</p>;

  const details = (expense: Expense) => {
    const shares = expenseShares(expense, order);
    const b = expense.mode === 'itemized' ? itemizedBreakdown(expense, order) : null;
    return (
      <div className="mt-3 space-y-3 border-t border-line pt-3 text-label">
        {expense.mode === 'itemized' && b && (
          <ul className="space-y-1 text-ink-muted">
            {expense.items.map((it) => (
              <li key={it.id} className="flex justify-between gap-2">
                <span className="min-w-0 truncate">
                  {it.name || 'Item'} ×{it.qty}
                </span>
                <span className="tabular">{fmt(it.unitPrice * it.qty)}</span>
              </li>
            ))}
            {b.service > 0 && (
              <li className="flex justify-between">
                <span>Service charge ({expense.serviceChargeBps / 100}%)</span>
                <span className="tabular">{fmt(b.service)}</span>
              </li>
            )}
            {expense.tip > 0 && (
              <li className="flex justify-between">
                <span>Tip</span>
                <span className="tabular">{fmt(expense.tip)}</span>
              </li>
            )}
            {expense.discount > 0 && (
              <li className="flex justify-between">
                <span>Discount</span>
                <span className="tabular">−{fmt(expense.discount)}</span>
              </li>
            )}
          </ul>
        )}
        <ul className="space-y-1">
          {event.people
            .filter((p) => shares.has(p.id))
            .map((p) => (
              <li key={p.id} className="flex items-center gap-2">
                <Avatar person={p} size="xs" />
                <span className="min-w-0 flex-1 truncate">{p.name}</span>
                <span className="font-bold tabular">{fmt(shares.get(p.id) ?? 0)}</span>
              </li>
            ))}
        </ul>
      </div>
    );
  };

  return (
    <ul className="flex flex-col gap-2">
      {sorted.map((e) => (
        <li key={e.id}>
          <details className="group rounded-card bg-surface p-3 shadow-card">
            <summary className="flex cursor-pointer list-none items-center gap-3">
              <span className="text-xl" aria-hidden="true">
                {CATEGORY_META[e.category].emoji}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate font-bold">{e.title}</span>
                <span className="block truncate text-caption text-ink-muted">
                  {dateLabel(e.date)} · {describeExpense(event, e)}
                </span>
              </span>
              <span className="font-bold tabular">{fmt(expenseTotal(e))}</span>
              <ChevronDown
                size={18}
                aria-hidden="true"
                className="shrink-0 text-ink-muted transition-transform group-open:rotate-180"
              />
            </summary>
            {details(e)}
          </details>
        </li>
      ))}
    </ul>
  );
}
