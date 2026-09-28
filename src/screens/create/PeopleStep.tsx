import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { X } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { Avatar } from '../../components/Avatar';
import { AvatarPicker } from '../../components/AvatarPicker';
import { Button } from '../../components/Button';
import { TextField } from '../../components/Field';
import { Sheet } from '../../components/Sheet';
import { newId } from '../../lib/id';
import { nextAvatar, normalizeName } from '../../lib/people';
import { LIMITS, type AvatarColor, type AvatarEmoji } from '../../lib/schema';

export interface DraftPerson {
  key: string;
  name: string;
  emoji: AvatarEmoji;
  color: AvatarColor;
}

export function PeopleStep({
  people,
  onChange,
  onCreate,
}: {
  people: DraftPerson[];
  onChange: (people: DraftPerson[]) => void;
  onCreate: () => void;
}) {
  const reduce = useReducedMotion();
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<number | null>(null);

  const add = (e: FormEvent) => {
    e.preventDefault();
    const clean = normalizeName(name);
    if (!clean) return;
    const dup = people.find((p) => p.name.toLowerCase() === clean.toLowerCase());
    if (dup) {
      setError(`Someone named ${dup.name} is already here`);
      return;
    }
    if (people.length >= LIMITS.people) {
      setError(`That's the max of ${LIMITS.people} people`);
      return;
    }
    onChange([...people, { key: newId(), name: clean, ...nextAvatar(people) }]);
    setName('');
    setError(null);
  };

  const editingPerson = editing === null ? undefined : people[editing];

  return (
    <div className="flex flex-1 flex-col gap-6">
      <h1 className="text-h1 font-semibold">Who's in?</h1>
      <form onSubmit={add}>
        <TextField
          label="Add a person"
          hideLabel
          placeholder="Type a name and press Enter"
          value={name}
          maxLength={LIMITS.personName}
          onChange={(e) => {
            setName(e.target.value);
            setError(null);
          }}
          hint="Add yourself too!"
          error={error}
          enterKeyHint="done"
          autoFocus
          autoComplete="off"
        />
      </form>

      <ul className="flex flex-wrap gap-2" aria-label="People in this split">
        <AnimatePresence initial={false}>
          {people.map((p, i) => (
            <motion.li
              key={p.key}
              layout={!reduce}
              initial={reduce ? false : { scale: 0.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.6, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              className="flex max-w-full items-center gap-1 rounded-full bg-surface py-1 pr-1 pl-1 shadow-card"
            >
              <button
                type="button"
                className="squish rounded-full"
                aria-label={`Change avatar for ${p.name}`}
                onClick={() => setEditing(i)}
              >
                <Avatar person={p} size="md" />
              </button>
              <span className="max-w-[9rem] truncate px-1 font-semibold" title={p.name}>
                {p.name}
              </span>
              <button
                type="button"
                aria-label={`Remove ${p.name}`}
                className="squish flex h-9 w-9 items-center justify-center rounded-full text-ink-muted hover:bg-pink-soft/60"
                onClick={() => onChange(people.filter((_, j) => j !== i))}
              >
                <X size={18} aria-hidden="true" />
              </button>
            </motion.li>
          ))}
        </AnimatePresence>
      </ul>

      <div className="mt-auto">
        {people.length < 2 && (
          <p className="mb-2 text-center text-caption text-ink-muted">
            Add at least 2 people to continue
          </p>
        )}
        <Button block disabled={people.length < 2} onClick={onCreate}>
          Create split
        </Button>
      </div>

      <Sheet
        open={Boolean(editingPerson)}
        onClose={() => setEditing(null)}
        title={`${editingPerson?.name ?? ''}'s avatar`}
        size="compact"
      >
        {editingPerson && editing !== null && (
          <AvatarPicker
            emoji={editingPerson.emoji}
            color={editingPerson.color}
            onChange={(avatar) => {
              const updated = { ...editingPerson, ...avatar };
              onChange(people.map((p, j) => (j === editing ? updated : p)));
            }}
          />
        )}
      </Sheet>
    </div>
  );
}
