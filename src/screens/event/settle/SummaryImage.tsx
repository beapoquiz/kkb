import { ImageDown } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Avatar } from '../../../components/Avatar';
import { Button } from '../../../components/Button';
import { totalSpent } from '../../../lib/balances';
import { formatMoney } from '../../../lib/money';
import type { KkbEvent } from '../../../lib/schema';
import { settleEvent } from '../../../lib/settle';
import { handleText } from '../../../lib/summary';
import { Plutus } from '../../../mascot/Plutus';
import { toast } from '../../../store/toast';

/** The settle-up summary as a cute card, only rendered (off-screen) while it is being saved. */
function SummaryCard({ event }: { event: KkbEvent }) {
  const people = new Map(event.people.map((p) => [p.id, p]));
  const fmt = (m: number) => formatMoney(m, event.currency);
  const transfers = settleEvent(event);
  const count = event.people.length;
  return (
    <div className="w-[400px] bg-cream p-6 font-body text-ink">
      <div className="rounded-card bg-surface p-5 shadow-card">
        <div className="flex items-center gap-3">
          <Plutus
            mood={transfers.length === 0 ? 'celebrating' : 'happy'}
            size={64}
            animated={false}
            decorative
          />
          <div className="min-w-0">
            <p className="font-display text-h2 font-semibold text-blue-strong">KKB</p>
            <p className="font-display text-h1 leading-tight font-semibold">
              {event.emoji} {event.name}
            </p>
          </div>
        </div>
        <p className="mt-3 text-label text-ink-muted">
          Total spent <span className="font-bold text-ink">{fmt(totalSpent(event))}</span> · {count}{' '}
          {count === 1 ? 'person' : 'people'}
        </p>
        <div className="mt-4 border-t border-line pt-4">
          {transfers.length === 0 ? (
            <p className="font-display text-h2 font-semibold">All settled! Bayad na lahat 🎉</p>
          ) : (
            <ul className="flex flex-col gap-3">
              {transfers.map((t) => {
                const from = people.get(t.from);
                const to = people.get(t.to);
                if (!from || !to) return null;
                const handle = handleText(to);
                return (
                  <li key={`${t.from}-${t.to}`}>
                    <div className="flex items-center gap-2">
                      <Avatar person={from} size="xs" />
                      <span className="font-bold">{from.name}</span>
                      <span className="text-ink-muted">→</span>
                      <Avatar person={to} size="xs" />
                      <span className="font-bold">{to.name}</span>
                      <span className="ml-auto font-display text-h2 font-semibold">
                        {fmt(t.amount)}
                      </span>
                    </div>
                    {handle && <p className="pl-8 text-caption text-ink-muted">{handle}</p>}
                  </li>
                );
              })}
            </ul>
          )}
          {event.payments.length > 0 && (
            <ul className="mt-3 flex flex-col gap-1 text-caption text-ink-muted">
              {event.payments.map((p) => (
                <li key={p.id}>
                  ✅ {people.get(p.from)?.name} paid {people.get(p.to)?.name} {fmt(p.amount)}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
      <p className="mt-3 text-center text-caption text-ink-muted">
        Made with KKB · beapoquiz.github.io/kkb
      </p>
    </div>
  );
}

/** "Save as image": renders the card off-screen, turns it into a PNG and downloads it. */
export function SaveSummaryImageButton({ event }: { event: KkbEvent }) {
  const [rendering, setRendering] = useState(false);
  const node = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!rendering || !node.current) return;
    const target = node.current;
    let cancelled = false;
    void (async () => {
      try {
        const [{ toBlob }, { downloadBlob, slugify }] = await Promise.all([
          import('html-to-image'),
          import('../share/qr'),
        ]);
        await document.fonts.ready;
        const blob = await toBlob(target, { pixelRatio: 2, cacheBust: true });
        if (!cancelled && blob) downloadBlob(blob, `kkb-${slugify(event.name)}-summary.png`);
      } catch {
        toast("Couldn't make the image. Try the copy button instead.");
      } finally {
        if (!cancelled) setRendering(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [rendering, event.name]);

  return (
    <>
      <Button
        variant="secondary"
        block
        disabled={rendering}
        icon={<ImageDown size={18} aria-hidden="true" />}
        onClick={() => setRendering(true)}
      >
        {rendering ? 'Making your image…' : 'Save as image'}
      </Button>
      {rendering &&
        createPortal(
          <div aria-hidden="true" className="pointer-events-none fixed top-0 -left-[10000px]">
            <div ref={node}>
              <SummaryCard event={event} />
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}
