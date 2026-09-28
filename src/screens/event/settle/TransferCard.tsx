import { ArrowRight } from 'lucide-react';
import { Avatar } from '../../../components/Avatar';
import { Button } from '../../../components/Button';
import { CopyIconButton } from '../../../components/CopyButton';
import { formatMoney } from '../../../lib/money';
import type { CurrencyCode, Person } from '../../../lib/schema';
import type { Transfer } from '../../../lib/settle';

/** "Janna → Bea ₱2,012.08", the receiver's payment handle, and an optional "Mark as paid". */
export function TransferCard({
  transfer,
  from,
  to,
  currency,
  onMarkPaid,
  highlight,
}: {
  transfer: Transfer;
  from: Person;
  to: Person;
  currency: CurrencyCode;
  onMarkPaid?: () => void;
  highlight?: boolean;
}) {
  const amount = formatMoney(transfer.amount, currency);
  return (
    <article
      className={`rounded-card bg-surface p-4 shadow-card ${highlight ? 'ring-2 ring-blue-strong' : ''}`}
      aria-label={`${from.name} pays ${to.name} ${amount}`}
    >
      <div className="flex items-center gap-2">
        <Avatar person={from} size="sm" />
        <span className="min-w-0 truncate font-bold" title={from.name}>
          {from.name}
        </span>
        <ArrowRight size={18} className="shrink-0 text-ink-muted" aria-hidden="true" />
        <Avatar person={to} size="sm" />
        <span className="min-w-0 truncate font-bold" title={to.name}>
          {to.name}
        </span>
      </div>
      <p className="mt-2 font-display text-amount font-semibold tabular">{amount}</p>
      {to.payment && (
        <div className="mt-1 flex items-center gap-1 text-label text-ink-muted">
          <span className="min-w-0 truncate">
            <span className="font-bold text-ink">{to.payment.method}</span> · {to.payment.value}
          </span>
          <CopyIconButton
            text={to.payment.value}
            label={`Copy ${to.name}'s ${to.payment.method}`}
          />
        </div>
      )}
      {onMarkPaid && (
        <Button variant="secondary" size="sm" block className="mt-3" onClick={onMarkPaid}>
          Mark as paid
        </Button>
      )}
    </article>
  );
}
