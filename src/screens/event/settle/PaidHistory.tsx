import { ChevronDown } from 'lucide-react';
import { shortDate } from '../../../lib/dates';
import { formatMoney } from '../../../lib/money';
import type { Id, KkbEvent } from '../../../lib/schema';

/** Collapsible "✅ Janna paid Bea ₱500.00 · Sep 28" list, with Undo on each. */
export function PaidHistory({
  event,
  onUndo,
}: {
  event: KkbEvent;
  onUndo?: (paymentId: Id) => void;
}) {
  if (event.payments.length === 0) return null;
  const name = (id: Id) => event.people.find((p) => p.id === id)?.name ?? '?';
  const payments = [...event.payments].sort((a, b) => b.paidAt - a.paidAt);
  return (
    <details className="group rounded-card bg-surface p-4 shadow-card">
      <summary className="flex cursor-pointer list-none items-center justify-between font-bold">
        Paid history ({payments.length})
        <ChevronDown
          size={18}
          aria-hidden="true"
          className="transition-transform group-open:rotate-180"
        />
      </summary>
      <ul className="mt-3 flex flex-col gap-2">
        {payments.map((p) => (
          <li key={p.id} className="flex items-center gap-2 text-label">
            <span className="min-w-0 flex-1">
              <span aria-hidden="true">✅ </span>
              {name(p.from)} paid {name(p.to)}{' '}
              <span className="font-bold tabular">{formatMoney(p.amount, event.currency)}</span>
              <span className="text-ink-muted"> · {shortDate(p.paidAt)}</span>
            </span>
            {onUndo && (
              <button
                type="button"
                onClick={() => onUndo(p.id)}
                className="squish shrink-0 rounded-full px-3 py-1 font-bold text-blue-strong hover:bg-blue-soft"
                aria-label={`Undo: ${name(p.from)} paid ${name(p.to)} ${formatMoney(p.amount, event.currency)}`}
              >
                Undo
              </button>
            )}
          </li>
        ))}
      </ul>
    </details>
  );
}
