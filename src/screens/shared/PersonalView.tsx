import { Download } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/Button';
import { ConfirmDialog } from '../../components/ConfirmDialog';
import { CopyButton } from '../../components/CopyButton';
import { computeBalances } from '../../lib/balances';
import type { KkbEvent } from '../../lib/schema';
import { settleEvent } from '../../lib/settle';
import { buildPersonalSummary } from '../../lib/summary';
import { VIEWER } from '../../store/identity';
import { toast } from '../../store/toast';
import { useKkbStore } from '../../store/useKkbStore';
import { BalanceList } from '../event/settle/BalanceList';
import { TransferCard } from '../event/settle/TransferCard';
import { EventPreview } from './EventPreview';
import { ExpenseBreakdown } from './ExpenseBreakdown';
import { YourHero } from './YourHero';

const stamp = (t: number) =>
  new Date(t).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });

/** Read-only view of a shared split, centered on the chosen person. */
export function PersonalView({
  event,
  identity,
  onSwitch,
}: {
  event: KkbEvent;
  identity: string;
  onSwitch: () => void;
}) {
  const navigate = useNavigate();
  const local = useKkbStore((s) => s.events[event.id]);
  const importEvent = useKkbStore((s) => s.importEvent);
  const [askReplace, setAskReplace] = useState(false);
  const me = event.people.find((p) => p.id === identity);
  const transfers = settleEvent(event);
  const people = new Map(event.people.map((p) => [p.id, p]));

  const save = () => {
    importEvent(event);
    toast('Saved to your device');
    navigate(`/e/${event.id}`);
  };

  return (
    <main className="flex flex-1 flex-col gap-6 px-4 pt-6 pb-10">
      <EventPreview event={event} />

      <div className="flex items-center justify-between">
        <h1 className="text-h1 font-semibold">{me ? `Hi, ${me.name}!` : 'Just looking'}</h1>
        <button
          type="button"
          onClick={onSwitch}
          className="squish rounded-full px-3 py-1 text-label font-bold text-blue-strong hover:bg-blue-soft"
        >
          Not you? Switch
        </button>
      </div>

      {me && identity !== VIEWER && (
        <YourHero event={event} personId={me.id} transfers={transfers} />
      )}

      <section aria-labelledby="shared-balances">
        <h2 id="shared-balances" className="mb-2 text-h2 font-medium">
          Balances
        </h2>
        <BalanceList event={event} balances={computeBalances(event)} you={me?.id} />
      </section>

      {transfers.length > 0 && (
        <section aria-labelledby="shared-transfers">
          <h2 id="shared-transfers" className="mb-2 text-h2 font-medium">
            Fewest payments to settle up
          </h2>
          <ul className="flex flex-col gap-3">
            {transfers.map((t) => {
              const from = people.get(t.from);
              const to = people.get(t.to);
              return from && to ? (
                <li key={`${t.from}-${t.to}`}>
                  <TransferCard
                    transfer={t}
                    from={from}
                    to={to}
                    currency={event.currency}
                    highlight={me?.id === t.from || me?.id === t.to}
                  />
                </li>
              ) : null;
            })}
          </ul>
        </section>
      )}

      <section aria-labelledby="shared-expenses">
        <h2 id="shared-expenses" className="mb-2 text-h2 font-medium">
          Expenses
        </h2>
        <ExpenseBreakdown event={event} />
      </section>

      <div className="flex flex-col gap-3">
        <Button
          block
          icon={<Download size={20} aria-hidden="true" />}
          onClick={() => (local ? setAskReplace(true) : save())}
        >
          Save to my device
        </Button>
        {me && <CopyButton text={buildPersonalSummary(event, me.id)}>Copy my summary</CopyButton>}
        <p className="text-center text-caption text-ink-muted">
          This is a snapshot. Save it to mark payments as paid.
        </p>
      </div>

      <ConfirmDialog
        open={askReplace}
        title="You already have this split"
        body={
          <>
            <p>Replace it with the version from this link?</p>
            {local && (
              <p className="mt-2 text-caption">
                Yours: updated {stamp(local.updatedAt)}
                <br />
                This link: updated {stamp(event.updatedAt)}
              </p>
            )}
          </>
        }
        cancelLabel="Keep mine"
        confirmLabel="Replace mine"
        onCancel={() => {
          setAskReplace(false);
          navigate(`/e/${event.id}`);
        }}
        onConfirm={() => {
          setAskReplace(false);
          save();
        }}
      />
    </main>
  );
}
