import { Minus, Plus, Trash2 } from 'lucide-react';
import { inputClass } from '../../../components/Field';
import type { ItemDraft } from '../../../lib/expenseDraft';
import { formatMoney, parseAmount } from '../../../lib/money';
import { LIMITS, type CurrencyCode, type Person } from '../../../lib/schema';
import { PeopleChips } from './PeopleChips';

export function ItemRow({
  item,
  index,
  people,
  currency,
  onChange,
  onRemove,
  canRemove,
}: {
  item: ItemDraft;
  index: number;
  people: Person[];
  currency: CurrencyCode;
  onChange: (item: ItemDraft) => void;
  onRemove: () => void;
  canRemove: boolean;
}) {
  const price = parseAmount(item.price, currency);
  const lineTotal = price ? price * item.qty : 0;
  const n = index + 1;
  const setQty = (qty: number) =>
    onChange({ ...item, qty: Math.min(LIMITS.qty, Math.max(1, qty)) });

  return (
    <li className="rounded-2xl border-[1.5px] border-line bg-surface p-3">
      <div className="flex gap-2">
        <label className="sr-only" htmlFor={`item-name-${item.id}`}>
          Item {n} name
        </label>
        <input
          id={`item-name-${item.id}`}
          data-item-name={item.id}
          className={`${inputClass} h-11 min-w-0 flex-1`}
          placeholder="Item"
          maxLength={LIMITS.itemName}
          value={item.name}
          onChange={(e) => onChange({ ...item, name: e.target.value })}
        />
        <label className="sr-only" htmlFor={`item-price-${item.id}`}>
          Item {n} price
        </label>
        <input
          id={`item-price-${item.id}`}
          className={`${inputClass} h-11 w-28 text-right tabular`}
          placeholder="Price"
          inputMode="decimal"
          value={item.price}
          onChange={(e) => onChange({ ...item, price: e.target.value })}
        />
      </div>
      <div className="mt-2 flex items-center justify-between gap-2">
        <div className="flex items-center gap-1" role="group" aria-label={`Item ${n} quantity`}>
          <button
            type="button"
            aria-label={`One less of item ${n}`}
            className="squish flex h-9 w-9 items-center justify-center rounded-full bg-cream disabled:opacity-45"
            disabled={item.qty <= 1}
            onClick={() => setQty(item.qty - 1)}
          >
            <Minus size={16} aria-hidden="true" />
          </button>
          <span className="w-8 text-center font-bold tabular" aria-live="polite">
            ×{item.qty}
          </span>
          <button
            type="button"
            aria-label={`One more of item ${n}`}
            className="squish flex h-9 w-9 items-center justify-center rounded-full bg-cream disabled:opacity-45"
            disabled={item.qty >= LIMITS.qty}
            onClick={() => setQty(item.qty + 1)}
          >
            <Plus size={16} aria-hidden="true" />
          </button>
        </div>
        <span className="font-bold tabular">{formatMoney(lineTotal, currency)}</span>
        {canRemove && (
          <button
            type="button"
            aria-label={`Remove item ${n}`}
            onClick={onRemove}
            className="squish flex h-9 w-9 items-center justify-center rounded-full text-pink-strong hover:bg-pink-soft/60"
          >
            <Trash2 size={17} aria-hidden="true" />
          </button>
        )}
      </div>
      <div className="mt-2">
        <PeopleChips
          label={`Who had ${item.name.trim() || `item ${n}`}?`}
          people={people}
          selected={item.sharedBy}
          onChange={(sharedBy) => onChange({ ...item, sharedBy })}
          multiple
          size="sm"
          showNames={false}
        />
      </div>
    </li>
  );
}
