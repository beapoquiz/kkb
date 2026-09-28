import { useRef } from 'react';
import { formatMoney } from '../../lib/money';
import { CATEGORY_META, type Expense, type KkbEvent } from '../../lib/schema';
import { describeExpense } from '../../lib/describe';
import { expenseTotal } from '../../lib/split';

const CATEGORY_BG: Record<Expense['category'], string> = {
  food: 'bg-pink-soft',
  transport: 'bg-blue-soft',
  stay: 'bg-lavender',
  groceries: 'bg-mint-soft',
  fun: 'bg-butter',
  other: 'bg-line',
};

/** One expense in the list. Tap to edit; long-press for a small Edit/Delete menu. */
export function ExpenseRow({
  event,
  expense,
  onOpen,
  onLongPress,
}: {
  event: KkbEvent;
  expense: Expense;
  onOpen: () => void;
  onLongPress: () => void;
}) {
  const timer = useRef<number | null>(null);
  const longPressed = useRef(false);
  const cancel = () => {
    if (timer.current !== null) window.clearTimeout(timer.current);
    timer.current = null;
  };
  const meta = CATEGORY_META[expense.category];
  const amount = formatMoney(expenseTotal(expense), event.currency);

  return (
    <button
      type="button"
      onClick={() => {
        if (longPressed.current) {
          longPressed.current = false;
          return;
        }
        onOpen();
      }}
      onPointerDown={() => {
        longPressed.current = false;
        timer.current = window.setTimeout(() => {
          longPressed.current = true;
          onLongPress();
        }, 550);
      }}
      onPointerUp={cancel}
      onPointerLeave={cancel}
      onPointerCancel={cancel}
      onContextMenu={(e) => {
        e.preventDefault();
        cancel();
        onLongPress();
      }}
      aria-label={`${expense.title}, ${amount}. ${describeExpense(event, expense)}. Edit`}
      className="squish flex w-full items-center gap-3 rounded-card bg-surface p-3 text-left shadow-card"
    >
      <span
        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-xl ${CATEGORY_BG[expense.category]}`}
        aria-hidden="true"
      >
        {meta.emoji}
      </span>
      <span className="min-w-0 flex-1" aria-hidden="true">
        <span className="block truncate font-bold" title={expense.title}>
          {expense.title}
        </span>
        <span className="block truncate text-caption text-ink-muted">
          {describeExpense(event, expense)}
        </span>
      </span>
      <span className="shrink-0 font-display text-h2 font-medium tabular" aria-hidden="true">
        {amount}
      </span>
    </button>
  );
}
