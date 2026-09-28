import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { useState } from 'react';
import { Button } from '../../components/Button';
import { ConfirmDialog } from '../../components/ConfirmDialog';
import { EmptyState } from '../../components/EmptyState';
import { Sheet } from '../../components/Sheet';
import { dateLabel } from '../../lib/dates';
import type { Expense, Id, KkbEvent } from '../../lib/schema';
import { ExpenseRow } from './ExpenseRow';
import { useDeleteExpense } from './useDeleteExpense';

/** Newest date first; within a day, newest first. */
function groupByDate(expenses: Expense[]): [string, Expense[]][] {
  const groups = new Map<string, Expense[]>();
  const sorted = [...expenses].sort(
    (a, b) => b.date.localeCompare(a.date) || b.createdAt - a.createdAt,
  );
  for (const e of sorted) groups.set(e.date, [...(groups.get(e.date) ?? []), e]);
  return [...groups.entries()];
}

export function ExpensesTab({ event, onEdit }: { event: KkbEvent; onEdit: (id: Id) => void }) {
  const reduce = useReducedMotion();
  const remove = useDeleteExpense(event.id);
  const [menuFor, setMenuFor] = useState<Expense | null>(null);
  const [confirmFor, setConfirmFor] = useState<Expense | null>(null);

  if (event.expenses.length === 0) {
    return (
      <EmptyState mood="thinking" title="Nothing here yet" text="Tap + to add the first expense." />
    );
  }

  return (
    <>
      {groupByDate(event.expenses).map(([date, expenses]) => (
        <section key={date} className="mt-3" aria-labelledby={`day-${date}`}>
          <h2 id={`day-${date}`} className="mb-2 px-1 text-caption font-bold text-ink-muted">
            {dateLabel(date)}
          </h2>
          <ul className="flex flex-col gap-2">
            <AnimatePresence initial={false}>
              {expenses.map((expense) => (
                <motion.li
                  key={expense.id}
                  layout={!reduce}
                  exit={reduce ? { opacity: 0 } : { opacity: 0, x: -80 }}
                  transition={{ duration: 0.2 }}
                >
                  <ExpenseRow
                    event={event}
                    expense={expense}
                    onOpen={() => onEdit(expense.id)}
                    onLongPress={() => setMenuFor(expense)}
                  />
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>
        </section>
      ))}

      <Sheet
        open={Boolean(menuFor)}
        onClose={() => setMenuFor(null)}
        title={menuFor?.title ?? ''}
        size="compact"
      >
        <div className="flex flex-col gap-2">
          <Button
            variant="secondary"
            block
            onClick={() => {
              const id = menuFor?.id;
              setMenuFor(null);
              if (id) onEdit(id);
            }}
          >
            Edit
          </Button>
          <Button
            variant="danger"
            block
            onClick={() => {
              setConfirmFor(menuFor);
              setMenuFor(null);
            }}
          >
            Delete
          </Button>
        </div>
      </Sheet>
      <ConfirmDialog
        open={Boolean(confirmFor)}
        title={`Delete “${confirmFor?.title ?? ''}”?`}
        body="You can undo this for a few seconds."
        confirmLabel="Delete"
        confirmVariant="danger-solid"
        onCancel={() => setConfirmFor(null)}
        onConfirm={() => {
          if (confirmFor) remove(confirmFor.id);
          setConfirmFor(null);
        }}
      />
    </>
  );
}
