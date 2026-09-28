import { amountToSettle, isSettled } from '../lib/balances';
import { formatMoney } from '../lib/money';
import type { KkbEvent } from '../lib/schema';

const STYLES = {
  settled: 'bg-mint-soft text-mint-strong',
  owing: 'bg-pink-soft text-pink-strong',
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
