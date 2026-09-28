import { Copy, Pencil, Trash2 } from 'lucide-react';
import { Button } from '../../components/Button';
import { Sheet } from '../../components/Sheet';
import type { Id, KkbEvent } from '../../lib/schema';

export function EventMenuSheet({
  event,
  onClose,
  onRename,
  onDuplicate,
  onDelete,
}: {
  event: KkbEvent | undefined;
  onClose: () => void;
  onRename: (id: Id) => void;
  onDuplicate: (id: Id) => void;
  onDelete: (id: Id) => void;
}) {
  return (
    <Sheet open={Boolean(event)} onClose={onClose} title={event?.name ?? ''} size="compact">
      {event && (
        <div className="flex flex-col gap-1">
          <Button
            variant="ghost"
            block
            className="justify-start"
            icon={<Pencil size={20} aria-hidden="true" />}
            onClick={() => onRename(event.id)}
          >
            Rename
          </Button>
          <Button
            variant="ghost"
            block
            className="justify-start"
            icon={<Copy size={20} aria-hidden="true" />}
            onClick={() => onDuplicate(event.id)}
          >
            Duplicate
          </Button>
          <Button
            variant="danger"
            block
            className="justify-start"
            icon={<Trash2 size={20} aria-hidden="true" />}
            onClick={() => onDelete(event.id)}
          >
            Delete
          </Button>
        </div>
      )}
    </Sheet>
  );
}
