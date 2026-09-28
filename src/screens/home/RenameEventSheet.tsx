import { useState, type FormEvent } from 'react';
import { Button } from '../../components/Button';
import { EmojiPicker } from '../../components/EmojiPicker';
import { TextField } from '../../components/Field';
import { Sheet } from '../../components/Sheet';
import { LIMITS, type EventEmoji, type KkbEvent } from '../../lib/schema';
import { useKkbStore } from '../../store/useKkbStore';

/** Rename an event and change its emoji. Used from Home and from the event top bar. */
export function RenameEventSheet({
  event,
  onClose,
}: {
  event: KkbEvent | undefined;
  onClose: () => void;
}) {
  return (
    <Sheet open={Boolean(event)} onClose={onClose} title="Rename split" size="compact">
      {event && <RenameForm key={event.id} event={event} onDone={onClose} />}
    </Sheet>
  );
}

function RenameForm({ event, onDone }: { event: KkbEvent; onDone: () => void }) {
  const updateEvent = useKkbStore((s) => s.updateEvent);
  const [name, setName] = useState(event.name);
  const [emoji, setEmoji] = useState<EventEmoji>(event.emoji);
  const valid = name.trim().length > 0;

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!valid) return;
    updateEvent(event.id, { name, emoji });
    onDone();
  };

  return (
    <form onSubmit={submit} className="flex flex-col gap-5">
      <TextField
        label="Name"
        value={name}
        maxLength={LIMITS.eventName}
        onChange={(e) => setName(e.target.value)}
        error={valid ? null : 'Give it a name'}
        data-autofocus
      />
      <EmojiPicker value={emoji} onChange={setEmoji} />
      <Button type="submit" block disabled={!valid}>
        Save
      </Button>
    </form>
  );
}
