import { Calendar } from 'lucide-react';
import { useState, type FormEvent, type ReactNode } from 'react';
import { Button } from '../../../components/Button';
import { ConfirmDialog } from '../../../components/ConfirmDialog';
import { FieldLabel, inputClass } from '../../../components/Field';
import { buildExpense, equalPreview, type ExpenseDraft } from '../../../lib/expenseDraft';
import { LIMITS, type KkbEvent } from '../../../lib/schema';
import { useKkbStore } from '../../../store/useKkbStore';
import { useDeleteExpense } from '../useDeleteExpense';
import { AmountInput } from './AmountInput';
import { CategoryChips } from './CategoryChips';
import { ItemizedEditor } from './ItemizedEditor';
import { PeopleChips } from './PeopleChips';
import { SplitPreview } from './SplitPreview';

/**
 * Field order follows the most common path: amount → title → Save.
 * Save stays disabled until the draft is valid; the first problem is shown right above it.
 */
export function ExpenseForm({
  event,
  draft,
  isEdit,
  onChange,
  onDone,
  modeControl,
}: {
  event: KkbEvent;
  draft: ExpenseDraft;
  isEdit: boolean;
  onChange: (patch: Partial<ExpenseDraft>) => void;
  onDone: () => void;
  modeControl: ReactNode;
}) {
  const saveExpense = useKkbStore((s) => s.saveExpense);
  const remove = useDeleteExpense(event.id);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const result = buildExpense(draft, event);
  const itemized = draft.mode === 'itemized';
  const preview = itemized ? null : equalPreview(draft, event);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!result.ok) return;
    saveExpense(event.id, result.expense);
    onDone();
  };

  const setParticipants = (participants: string[]) =>
    onChange({
      participants,
      // Someone removed from "Split between" can't have shared an item either.
      items: draft.items.map((it) => ({
        ...it,
        sharedBy: it.sharedBy.filter((id) => participants.includes(id)),
      })),
    });

  return (
    <form onSubmit={submit} className="flex flex-col gap-5" noValidate>
      {!itemized && (
        <AmountInput
          value={draft.amount}
          onChange={(amount) => onChange({ amount })}
          currency={event.currency}
          autoFocus={!isEdit}
        />
      )}

      <div>
        <label htmlFor="expense-title" className="sr-only">
          Title
        </label>
        <input
          id="expense-title"
          className={`${inputClass} w-full`}
          placeholder="What was it for?"
          maxLength={LIMITS.expenseTitle}
          value={draft.title}
          onChange={(e) => onChange({ title: e.target.value })}
          data-autofocus={itemized && !isEdit ? true : undefined}
        />
      </div>

      <CategoryChips value={draft.category} onChange={(category) => onChange({ category })} />

      <PeopleChips
        label="Paid by"
        people={event.people}
        selected={[draft.paidBy]}
        onChange={([paidBy]) => onChange({ paidBy })}
        multiple={false}
      />
      <PeopleChips
        label="Split between"
        people={event.people}
        selected={draft.participants}
        onChange={setParticipants}
        multiple
        quickToggles
      />

      <div>
        <FieldLabel>Split method</FieldLabel>
        {modeControl}
        {preview && (
          <p className="mt-2 text-center font-bold text-blue-strong" aria-live="polite">
            {preview}
          </p>
        )}
      </div>

      {itemized && (
        <>
          <ItemizedEditor draft={draft} event={event} onChange={onChange} />
          <SplitPreview
            event={event}
            breakdown={result.breakdown}
            receiptTotal={draft.receiptTotal}
            onReceiptTotal={(receiptTotal) => onChange({ receiptTotal })}
          />
        </>
      )}

      <label className="flex w-fit items-center gap-2 rounded-full bg-cream py-1 pr-2 pl-3 text-label font-bold">
        <Calendar size={16} aria-hidden="true" />
        <span className="sr-only">Date</span>
        <input
          type="date"
          value={draft.date}
          required
          onChange={(e) => e.target.value && onChange({ date: e.target.value })}
          className="bg-transparent text-label focus:outline-none"
        />
      </label>

      <div className="sticky -bottom-5 -mx-5 mt-1 flex flex-col gap-2 border-t border-line bg-surface px-5 pt-3 pb-5">
        {!result.ok && (
          <p className="text-center text-caption font-bold text-pink-strong" aria-live="polite">
            {result.error}
          </p>
        )}
        <Button type="submit" block disabled={!result.ok}>
          Save
        </Button>
        {isEdit && (
          <Button variant="danger" block onClick={() => setConfirmDelete(true)}>
            Delete
          </Button>
        )}
      </div>

      <ConfirmDialog
        open={confirmDelete}
        title="Delete this expense?"
        body="You can undo this for a few seconds."
        confirmLabel="Delete"
        confirmVariant="danger-solid"
        onCancel={() => setConfirmDelete(false)}
        onConfirm={() => {
          setConfirmDelete(false);
          remove(draft.id);
          onDone();
        }}
      />
    </form>
  );
}
