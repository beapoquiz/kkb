import { useState } from 'react';
import { SegmentedControl } from '../../../components/SegmentedControl';
import { Sheet } from '../../../components/Sheet';
import { todayIso } from '../../../lib/dates';
import { draftFromExpense, emptyDraft, type ExpenseDraft } from '../../../lib/expenseDraft';
import type { Expense, KkbEvent } from '../../../lib/schema';
import { useKkbStore } from '../../../store/useKkbStore';
import { ExpenseForm } from './ExpenseForm';

/** Add / edit expense. The form remounts per expense so its draft starts fresh. */
export function ExpenseSheet({
  event,
  open,
  expense,
  onClose,
}: {
  event: KkbEvent;
  open: boolean;
  expense: Expense | undefined;
  onClose: () => void;
}) {
  return (
    <Sheet open={open} onClose={onClose} title={expense ? 'Edit expense' : 'Add expense'}>
      {open && (
        <ExpenseFormLoader
          key={expense?.id ?? 'new'}
          event={event}
          expense={expense}
          onDone={onClose}
        />
      )}
    </Sheet>
  );
}

function ExpenseFormLoader({
  event,
  expense,
  onDone,
}: {
  event: KkbEvent;
  expense: Expense | undefined;
  onDone: () => void;
}) {
  const lastPayer = useKkbStore((s) => s.lastPayer[event.id]);
  const [draft, setDraft] = useState<ExpenseDraft>(() =>
    expense ? draftFromExpense(expense, event) : emptyDraft(event, lastPayer, todayIso()),
  );
  return (
    <ExpenseForm
      event={event}
      draft={draft}
      isEdit={Boolean(expense)}
      onChange={(patch) => setDraft((d) => ({ ...d, ...patch }))}
      onDone={onDone}
      modeControl={
        <SegmentedControl
          label="Split method"
          segments={[
            { value: 'equal', label: 'Equal' },
            { value: 'itemized', label: 'Itemized' },
          ]}
          value={draft.mode}
          onChange={(mode) => setDraft((d) => ({ ...d, mode }))}
        />
      }
    />
  );
}
