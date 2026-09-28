import { Download, Link2, Share } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Button } from '../../../components/Button';
import { copyWithToast } from '../../../components/clipboard';
import { Sheet } from '../../../components/Sheet';
import type { KkbEvent } from '../../../lib/schema';
import { buildShareUrl, MAX_QR_URL_LENGTH } from '../../../lib/share';
import { buildSummary } from '../../../lib/summary';
import { Plutus } from '../../../mascot/Plutus';
import { downloadBlob, qrPngBlob, qrSvgDataUrl, slugify } from './qr';

export function ShareSheet({
  event,
  open,
  onClose,
}: {
  event: KkbEvent;
  open: boolean;
  onClose: () => void;
}) {
  return (
    <Sheet open={open} onClose={onClose} title="Share with the barkada">
      {open && <ShareContent event={event} />}
    </Sheet>
  );
}

function ShareContent({ event }: { event: KkbEvent }) {
  const url = buildShareUrl(event);
  const fitsQr = url.length <= MAX_QR_URL_LENGTH;
  const [qr, setQr] = useState<string | null>(null);
  const canShare = typeof navigator !== 'undefined' && typeof navigator.share === 'function';

  useEffect(() => {
    if (!fitsQr) return;
    let alive = true;
    void qrSvgDataUrl(url).then((dataUrl) => alive && setQr(dataUrl));
    return () => {
      alive = false;
    };
  }, [url, fitsQr]);

  const share = async () => {
    const text = buildSummary(event, url).split('\n').slice(0, 2).join('\n');
    try {
      await navigator.share({ title: `KKB — ${event.name}`, text, url });
    } catch {
      // The user closed the share sheet; nothing to do.
    }
  };

  const download = async () => {
    const blob = await qrPngBlob(url, `${event.emoji} ${event.name}`);
    if (blob) downloadBlob(blob, `kkb-${slugify(event.name)}-qr.png`);
  };

  return (
    <div className="flex flex-col gap-4">
      {fitsQr ? (
        <div className="relative mx-auto mt-4 w-full max-w-64 rounded-card border-4 border-blue-soft bg-surface p-4 shadow-card">
          <Plutus mood="happy" size={56} decorative className="absolute -top-8 -right-6" />
          {qr ? (
            <img
              src={qr}
              alt={`QR code for ${event.name}`}
              className="aspect-square w-full"
              data-testid="share-qr"
            />
          ) : (
            <div className="aspect-square w-full animate-pulse rounded-2xl bg-cream" />
          )}
          <p
            className="mt-2 truncate text-center font-display text-h2 font-medium"
            title={event.name}
          >
            {event.emoji} {event.name}
          </p>
        </div>
      ) : (
        <p className="rounded-card bg-butter p-4 text-center font-semibold">
          This split is too big for a QR code. Share the link instead!
        </p>
      )}

      <Button
        block
        icon={<Link2 size={20} aria-hidden="true" />}
        onClick={() => void copyWithToast(url)}
      >
        Copy link
      </Button>
      {canShare && (
        <Button
          variant="secondary"
          block
          icon={<Share size={20} aria-hidden="true" />}
          onClick={() => void share()}
        >
          Share…
        </Button>
      )}
      {fitsQr && (
        <Button
          variant="secondary"
          block
          icon={<Download size={20} aria-hidden="true" />}
          onClick={() => void download()}
        >
          Download QR
        </Button>
      )}

      <div className="space-y-1.5 text-caption text-ink-muted">
        <p>Links are snapshots: if you add more expenses later, share again.</p>
        <p>
          Anyone with this link can see names, amounts and payment handles. Only share it with your
          group.
        </p>
      </div>
    </div>
  );
}
