import { ChevronDown, Plus } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { Button } from '../../../components/Button';
import { TextField } from '../../../components/Field';
import { newItem, type ExpenseDraft } from '../../../lib/expenseDraft';
import { LIMITS, type KkbEvent } from '../../../lib/schema';
import { ItemRow } from './ItemRow';

/** Receipt items, then service charge / tip / discount in a collapsible "extras" section. */
export function ItemizedEditor({
  draft,
  event,
  onChange,
}: {
  draft: ExpenseDraft;
  event: KkbEvent;
  onChange: (patch: Partial<ExpenseDraft>) => void;
}) {
  const people = event.people.filter((p) => draft.participants.includes(p.id));
  const focusItem = useRef<string | null>(null);

  useEffect(() => {
    if (!focusItem.current) return;
    document.querySelector<HTMLInputElement>(`[data-item-name="${focusItem.current}"]`)?.focus();
    focusItem.current = null;
  });

  const addItem = () => {
    const item = newItem(draft.participants);
    focusItem.current = item.id;
    onChange({ items: [...draft.items, item] });
  };
  const hasExtras = Boolean(draft.servicePct || draft.tip || draft.discount);

  return (
    <div className="flex flex-col gap-3">
      <ul className="flex flex-col gap-2" aria-label="Receipt items">
        {draft.items.map((item, i) => (
          <ItemRow
            key={item.id}
            item={item}
            index={i}
            people={people}
            currency={event.currency}
            canRemove={draft.items.length > 1}
            onChange={(next) =>
              onChange({ items: draft.items.map((x) => (x.id === item.id ? next : x)) })
            }
            onRemove={() => onChange({ items: draft.items.filter((x) => x.id !== item.id) })}
          />
        ))}
      </ul>
      <Button
        variant="secondary"
        size="sm"
        icon={<Plus size={18} aria-hidden="true" />}
        onClick={addItem}
        disabled={draft.items.length >= LIMITS.itemsPerExpense}
      >
        Add item
      </Button>

      <details className="group rounded-2xl bg-cream p-3" open={hasExtras || undefined}>
        <summary className="flex cursor-pointer list-none items-center justify-between text-label font-bold">
          Service charge, tip, discount
          <ChevronDown
            size={18}
            aria-hidden="true"
            className="transition-transform group-open:rotate-180"
          />
        </summary>
        <div className="mt-3 flex flex-col gap-3">
          <div className="flex items-end gap-2">
            <TextField
              className="flex-1"
              label="Service charge %"
              inputMode="decimal"
              placeholder="0"
              value={draft.servicePct}
              onChange={(e) => onChange({ servicePct: e.target.value })}
            />
            <Button
              variant={draft.servicePct === '10' ? 'primary' : 'secondary'}
              size="sm"
              className="mb-1"
              aria-pressed={draft.servicePct === '10'}
              onClick={() => onChange({ servicePct: draft.servicePct === '10' ? '' : '10' })}
            >
              10%
            </Button>
          </div>
          <TextField
            label="Tip"
            inputMode="decimal"
            placeholder="0"
            value={draft.tip}
            onChange={(e) => onChange({ tip: e.target.value })}
          />
          <TextField
            label="Discount"
            inputMode="decimal"
            placeholder="0"
            hint="e.g. senior/PWD discount or promo"
            value={draft.discount}
            onChange={(e) => onChange({ discount: e.target.value })}
          />
        </div>
      </details>
    </div>
  );
}
