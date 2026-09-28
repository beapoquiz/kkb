import { motion, useReducedMotion } from 'framer-motion';
import { Check } from 'lucide-react';
import type { Person } from '../lib/schema';

type AvatarPerson = Pick<Person, 'emoji' | 'color' | 'name'>;

const SIZE = { xs: 24, sm: 28, md: 40, lg: 56, xl: 72 } as const;
export type AvatarSize = keyof typeof SIZE;

/** The emoji on the person's pastel circle. Decorative: the name is always shown or labelled nearby. */
export function Avatar({
  person,
  size = 'md',
  className = '',
}: {
  person: Pick<Person, 'emoji' | 'color'>;
  size?: AvatarSize;
  className?: string;
}) {
  const px = SIZE[size];
  return (
    <span
      aria-hidden="true"
      className={`inline-flex shrink-0 select-none items-center justify-center rounded-full ${className}`}
      style={{ width: px, height: px, background: person.color, fontSize: px * 0.55 }}
    >
      {person.emoji}
    </span>
  );
}

/** A toggleable avatar with the name under it. Uses aria-pressed for its selected state. */
export function AvatarChip({
  person,
  selected,
  onToggle,
  size = 'md',
  showName = true,
  label,
}: {
  person: AvatarPerson;
  selected: boolean;
  onToggle: () => void;
  size?: AvatarSize;
  showName?: boolean;
  /** Accessible name when the visible name is hidden. */
  label?: string;
}) {
  const reduce = useReducedMotion();
  return (
    <motion.button
      type="button"
      aria-pressed={selected}
      aria-label={label ?? (showName ? undefined : person.name)}
      title={person.name}
      onClick={onToggle}
      initial={reduce ? false : { scale: 0.6, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      className={`squish flex shrink-0 flex-col items-center gap-1 rounded-2xl p-1 ${showName ? 'w-16' : ''}`}
    >
      <span className="relative">
        <Avatar
          person={person}
          size={size}
          className={`transition-[box-shadow,opacity] ${selected ? 'ring-[3px] ring-blue-strong' : 'opacity-60'}`}
        />
        {selected && (
          <span className="absolute -right-1 -bottom-1 flex h-4 w-4 items-center justify-center rounded-full bg-blue-strong text-white">
            <Check size={11} strokeWidth={3} aria-hidden="true" />
          </span>
        )}
      </span>
      {showName && (
        <span
          className={`max-w-full truncate text-caption ${selected ? 'font-bold text-ink' : 'text-ink-muted'}`}
        >
          {person.name}
        </span>
      )}
    </motion.button>
  );
}

/** Overlapping avatars, max 4, then "+2". */
export function AvatarStack({ people, max = 4 }: { people: Person[]; max?: number }) {
  const shown = people.slice(0, max);
  const extra = people.length - shown.length;
  return (
    <span className="flex items-center" aria-label={`${people.length} people`} role="img">
      {shown.map((p) => (
        <Avatar key={p.id} person={p} size="sm" className="-mr-2 ring-2 ring-surface" />
      ))}
      {extra > 0 && (
        <span className="ml-3 text-caption text-ink-muted" aria-hidden="true">
          +{extra}
        </span>
      )}
    </span>
  );
}
