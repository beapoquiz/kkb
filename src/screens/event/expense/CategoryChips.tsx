import { CATEGORIES, CATEGORY_META, type Category } from '../../../lib/schema';

export function CategoryChips({
  value,
  onChange,
}: {
  value: Category;
  onChange: (c: Category) => void;
}) {
  return (
    <div role="group" aria-label="Category" className="flex flex-wrap gap-2">
      {CATEGORIES.map((c) => {
        const selected = c === value;
        return (
          <button
            key={c}
            type="button"
            aria-pressed={selected}
            onClick={() => onChange(c)}
            className={`squish h-10 rounded-full px-3 text-label font-bold ${selected ? 'bg-blue-soft text-ink ring-2 ring-blue-strong' : 'bg-cream text-ink-muted'}`}
          >
            <span aria-hidden="true">{CATEGORY_META[c].emoji}</span> {CATEGORY_META[c].label}
          </button>
        );
      })}
    </div>
  );
}
