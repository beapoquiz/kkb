import { amountToSettle, isSettled } from '../lib/balances';
import { formatMoney } from '../lib/money';
import type { KkbEvent } from '../lib/schema';

const STYLES = {
  settled: 'bg-mint-soft/40 text-mint-strong ring-1 ring-mint-soft',
  owing: 'bg-pink-soft/40 text-pink-strong ring-1 ring-pink-soft',
  empty: 'bg-line text-ink-muted',
};

export function StatusPill({ event }: { event: KkbEvent }) {
  const [kind, text] =
    event.expenses.length === 0
      ? (['empty', 'No expenses yet'] as const)
      : isSettled(event)
        ? (['settled', 'All settled ✓'] as const)
        : (['owing', `${formatMoney(amountToSettle(event), event.currency)} to settle`] as const);
  return (
    <span className={`inline-flex rounded-full px-3 py-1 text-caption font-bold ${STYLES[kind]}`}>
      {text}
    </span>
  );
}
