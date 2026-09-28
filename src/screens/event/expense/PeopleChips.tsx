import { useId } from 'react';
import { AvatarChip, type AvatarSize } from '../../../components/Avatar';
import type { Id, Person } from '../../../lib/schema';

/** A horizontally scrolling row of avatar chips. Single-select (Paid by) or multi-select. */
export function PeopleChips({
  label,
  people,
  selected,
  onChange,
  multiple,
  size = 'md',
  showNames = true,
  quickToggles = false,
}: {
  label: string;
  people: Person[];
  selected: Id[];
  onChange: (ids: Id[]) => void;
  multiple: boolean;
  size?: AvatarSize;
  showNames?: boolean;
  quickToggles?: boolean;
}) {
  const labelId = useId();
  const toggle = (id: Id) => {
    if (!multiple) return onChange([id]);
    onChange(selected.includes(id) ? selected.filter((x) => x !== id) : [...selected, id]);
  };
  return (
    <div role="group" aria-labelledby={labelId}>
      <div className="mb-1 flex items-center justify-between">
        <p id={labelId} className="text-label font-bold">
          {label}
        </p>
        {quickToggles && (
          <div className="flex gap-1">
            <button
              type="button"
              className="squish rounded-full px-3 py-1 text-caption font-bold text-blue-strong hover:bg-blue-soft"
              onClick={() => onChange(people.map((p) => p.id))}
            >
              All
            </button>
            <button
              type="button"
              className="squish rounded-full px-3 py-1 text-caption font-bold text-blue-strong hover:bg-blue-soft"
              onClick={() => onChange([])}
            >
              None
            </button>
          </div>
        )}
      </div>
      <div className="-mx-1 flex gap-1 overflow-x-auto px-1 pt-1 pb-1">
        {people.map((p) => (
          <AvatarChip
            key={p.id}
            person={p}
            size={size}
            showName={showNames}
            selected={selected.includes(p.id)}
            onToggle={() => toggle(p.id)}
          />
        ))}
      </div>
    </div>
  );
}
