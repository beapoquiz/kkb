import type { Id } from '../../lib/schema';
import { toast } from '../../store/toast';
import { useKkbStore } from '../../store/useKkbStore';

/** Deletes an expense and offers Undo in a toast for 5 seconds. */
export function useDeleteExpense(eventId: Id) {
  const deleteExpense = useKkbStore((s) => s.deleteExpense);
  const restoreExpense = useKkbStore((s) => s.restoreExpense);
  return (expenseId: Id) => {
    const removed = deleteExpense(eventId, expenseId);
    if (!removed) return;
    toast('Expense deleted', {
      duration: 5000,
      action: {
        label: 'Undo',
        onClick: () => restoreExpense(eventId, removed.expense, removed.index),
      },
    });
  };
}
