import { ChevronRight, Plus } from 'lucide-react';
import { Avatar } from '../../components/Avatar';
import { Button } from '../../components/Button';
import { LIMITS, type Id, type KkbEvent } from '../../lib/schema';
import { useIdentity, VIEWER } from '../../store/identity';

export function PeopleTab({
  event,
  onEdit,
  onAdd,
}: {
  event: KkbEvent;
  onEdit: (id: Id) => void;
  onAdd: () => void;
}) {
  const [identity] = useIdentity(event.id);
  return (
    <div className="flex flex-col gap-3 pt-2">
      <ul className="flex flex-col gap-2">
        {event.people.map((p) => (
          <li key={p.id}>
            <button
              type="button"
              onClick={() => onEdit(p.id)}
              className="squish flex w-full items-center gap-3 rounded-card bg-surface p-3 text-left shadow-card"
            >
              <Avatar person={p} size="lg" />
              <span className="min-w-0 flex-1">
                <span className="block truncate font-bold" title={p.name}>
                  {p.name}
                  {identity !== VIEWER && identity === p.id && (
                    <span className="font-semibold text-ink-muted"> (you)</span>
                  )}
                </span>
                {p.payment ? (
                  <span className="block truncate text-caption text-ink-muted">
                    {p.payment.method} · {p.payment.value}
                  </span>
                ) : (
                  <span className="block text-caption font-bold text-blue-strong">
                    + Add GCash / Maya / bank
                  </span>
                )}
              </span>
              <ChevronRight size={20} className="text-ink-muted" aria-hidden="true" />
            </button>
          </li>
        ))}
      </ul>
      <Button
        variant="secondary"
        block
        icon={<Plus size={20} aria-hidden="true" />}
        onClick={onAdd}
        disabled={event.people.length >= LIMITS.people}
      >
        Add person
      </Button>
    </div>
  );
}
