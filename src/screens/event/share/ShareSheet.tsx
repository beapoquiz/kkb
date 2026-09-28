import { CopyButton } from '../../../components/CopyButton';
import { Sheet } from '../../../components/Sheet';
import type { KkbEvent } from '../../../lib/schema';
import { buildShareUrl } from '../../../lib/share';

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
      {open && <CopyButton text={buildShareUrl(event)}>Copy link</CopyButton>}
    </Sheet>
  );
}
