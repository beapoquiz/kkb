import { Check } from 'lucide-react';
import { Avatar } from '../../../components/Avatar';
import { TextField } from '../../../components/Field';
import { receiptCheck } from '../../../lib/expenseDraft';
import { formatMoney } from '../../../lib/money';
import type { KkbEvent } from '../../../lib/schema';
import type { ItemizedBreakdown } from '../../../lib/split';

/** "Who pays what" for an itemized receipt, plus the optional "Receipt says" check. */
export function SplitPreview({
  event,
  breakdown,
  receiptTotal,
  onReceiptTotal,
}: {
  event: KkbEvent;
  breakdown: ItemizedBreakdown | null;
  receiptTotal: string;
  onReceiptTotal: (v: string) => void;
}) {
  const fmt = (m: number) => formatMoney(m, event.currency);
  const rows = breakdown ? event.people.filter((p) => breakdown.owed.has(p.id)) : [];
  const check = breakdown ? receiptCheck(receiptTotal, breakdown.total, event.currency) : null;

  return (
    <section className="rounded-card bg-blue-soft/50 p-4" aria-labelledby="preview-title">
      <h3 id="preview-title" className="mb-2 font-display text-h2 font-medium">
        Who pays what
      </h3>
      {breakdown ? (
        <ul className="flex flex-col gap-1.5" aria-live="polite">
          {rows.map((p) => (
            <li key={p.id} className="flex items-center gap-2">
              <Avatar person={p} size="xs" />
              <span className="min-w-0 flex-1 truncate" title={p.name}>
                {p.name}
              </span>
              <span className="font-bold tabular">{fmt(breakdown.owed.get(p.id) ?? 0)}</span>
            </li>
          ))}
          <li className="mt-1 flex justify-between border-t border-blue-strong/20 pt-2 font-bold">
            <span>Total</span>
            <span className="tabular">{fmt(breakdown.total)}</span>
          </li>
        </ul>
      ) : (
        <p className="text-caption text-ink-muted">Add item prices to see the split.</p>
      )}
      <TextField
        className="mt-3"
        label="Receipt says (optional)"
        inputMode="decimal"
        placeholder="Total on the receipt"
        value={receiptTotal}
        onChange={(e) => onReceiptTotal(e.target.value)}
      />
      {check && (
        <p
          className={`mt-2 flex items-center gap-1 text-caption font-bold ${check.ok ? 'text-mint-strong' : 'text-pink-strong'}`}
          role="status"
        >
          {check.ok && <Check size={16} aria-hidden="true" />}
          {check.message}
        </p>
      )}
    </section>
  );
}
