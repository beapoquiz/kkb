import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { Share2 } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Button } from '../../../components/Button';
import { ConfirmDialog } from '../../../components/ConfirmDialog';
import { CopyButton } from '../../../components/CopyButton';
import { EmptyState } from '../../../components/EmptyState';
import { computeBalances, isSettled } from '../../../lib/balances';
import { formatMoney } from '../../../lib/money';
import type { KkbEvent } from '../../../lib/schema';
import { settleEvent, type Transfer } from '../../../lib/settle';
import { buildShareUrl } from '../../../lib/share';
import { buildSummary } from '../../../lib/summary';
import { Plutus } from '../../../mascot/Plutus';
import { useIdentity, VIEWER } from '../../../store/identity';
import { toast } from '../../../store/toast';
import { useKkbStore } from '../../../store/useKkbStore';
import { YourHero } from '../../shared/YourHero';
import { BalanceList } from './BalanceList';
import { CategoryBreakdown } from './CategoryBreakdown';
import { celebrate } from './confetti';
import { PaidHistory } from './PaidHistory';
import { SaveSummaryImageButton } from './SummaryImage';
import { TransferCard } from './TransferCard';

export function SettleTab({ event, onShare }: { event: KkbEvent; onShare: () => void }) {
  const reduce = useReducedMotion();
  const addPayment = useKkbStore((s) => s.addPayment);
  const removePayment = useKkbStore((s) => s.removePayment);
  const [identity] = useIdentity(event.id);
  const you = identity && identity !== VIEWER ? identity : null;
  const [confirming, setConfirming] = useState<Transfer | null>(null);

  const settled = isSettled(event);
  const wasSettled = useRef(settled);
  useEffect(() => {
    // Confetti once per transition to "all settled", not every time the tab opens.
    if (settled && !wasSettled.current) void celebrate();
    wasSettled.current = settled;
  }, [settled]);

  if (event.people.length < 2) {
    return <EmptyState mood="sleepy" title="Add at least 2 people to split" />;
  }
  if (event.expenses.length === 0) {
    return (
      <EmptyState mood="thinking" title="Nothing to settle yet" text="Tap + to add an expense." />
    );
  }

  const people = new Map(event.people.map((p) => [p.id, p]));
  const transfers = settleEvent(event);
  const summary = buildSummary(event, buildShareUrl(event));
  const name = (id: string) => people.get(id)?.name ?? '?';

  return (
    <div className="flex flex-col gap-6 pt-2">
      <section className="flex items-center gap-3 rounded-card bg-surface p-4 shadow-card">
        <Plutus mood={settled ? 'celebrating' : 'thinking'} size={84} decorative />
        <div aria-live="polite">
          {settled ? (
            <>
              <p className="font-display text-h2 font-semibold">
                All settled! Bayad na lahat 🎉 {reduce && <span aria-hidden="true">✨</span>}
              </p>
              <p className="text-ink-muted">Everyone's even. Friendship intact.</p>
            </>
          ) : (
            <p className="font-display text-h2 font-medium">
              Just a few payments and everyone's even.
            </p>
          )}
        </div>
      </section>

      {you && !settled && people.has(you) && (
        <YourHero event={event} personId={you} transfers={transfers} />
      )}

      <section aria-labelledby="balances-title">
        <h2 id="balances-title" className="mb-2 text-h2 font-medium">
          Balances
        </h2>
        <BalanceList event={event} balances={computeBalances(event)} you={you} />
      </section>

      {transfers.length > 0 && (
        <section aria-labelledby="transfers-title">
          <h2 id="transfers-title" className="mb-2 text-h2 font-medium">
            Fewest payments to settle up
          </h2>
          <ul className="flex flex-col gap-3">
            <AnimatePresence initial={false}>
              {transfers.map((t) => {
                const from = people.get(t.from);
                const to = people.get(t.to);
                if (!from || !to) return null;
                return (
                  <motion.li
                    key={`${t.from}-${t.to}`}
                    layout={!reduce}
                    exit={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.9, x: 60 }}
                    transition={{ duration: 0.25 }}
                  >
                    <TransferCard
                      transfer={t}
                      from={from}
                      to={to}
                      currency={event.currency}
                      highlight={you === t.from || you === t.to}
                      onMarkPaid={() => setConfirming(t)}
                    />
                  </motion.li>
                );
              })}
            </AnimatePresence>
          </ul>
        </section>
      )}

      <CategoryBreakdown event={event} />

      <PaidHistory event={event} onUndo={(id) => removePayment(event.id, id)} />

      <div className="flex flex-col gap-3">
        <CopyButton text={summary} variant="primary">
          Copy summary for group chat
        </CopyButton>
        <SaveSummaryImageButton event={event} />
        <Button
          variant="secondary"
          block
          icon={<Share2 size={18} aria-hidden="true" />}
          onClick={onShare}
        >
          Share
        </Button>
      </div>

      <ConfirmDialog
        open={Boolean(confirming)}
        title={
          confirming
            ? `${name(confirming.from)} paid ${name(confirming.to)} ${formatMoney(confirming.amount, event.currency)}?`
            : ''
        }
        confirmLabel="Yes, paid"
        onCancel={() => setConfirming(null)}
        onConfirm={() => {
          // Only record it if that exact transfer is still outstanding, so a double tap on a
          // card that is animating away can't record the same payment twice.
          const stillOwed = transfers.some(
            (t) =>
              confirming &&
              t.from === confirming.from &&
              t.to === confirming.to &&
              t.amount === confirming.amount,
          );
          if (confirming && stillOwed) {
            addPayment(event.id, confirming);
            toast(`Nice! ${name(confirming.from)} paid ${name(confirming.to)} 💸`);
          }
          setConfirming(null);
        }}
      />
    </div>
  );
}
