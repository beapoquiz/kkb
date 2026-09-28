import { motion, useReducedMotion } from 'framer-motion';
import { useId, useRef, type KeyboardEvent } from 'react';

export interface Segment<T extends string> {
  value: T;
  label: string;
}

/**
 * A pill track where the selected segment slides. `asTabs` gives it tab semantics
 * (role="tablist" with arrow-key navigation); otherwise it is a radio group.
 */
export function SegmentedControl<T extends string>({
  segments,
  value,
  onChange,
  label,
  asTabs = false,
  idPrefix,
}: {
  segments: Segment<T>[];
  value: T;
  onChange: (value: T) => void;
  label: string;
  asTabs?: boolean;
  /** With asTabs: tabs get id `${idPrefix}-tab-${value}` and control `${idPrefix}-panel-${value}`. */
  idPrefix?: string;
}) {
  const reduce = useReducedMotion();
  const layoutId = useId();
  const refs = useRef<(HTMLButtonElement | null)[]>([]);

  const onKeyDown = (e: KeyboardEvent, index: number) => {
    const delta = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
    if (!delta) return;
    e.preventDefault();
    const next = (index + delta + segments.length) % segments.length;
    onChange(segments[next].value);
    refs.current[next]?.focus();
  };

  return (
    <div
      role={asTabs ? 'tablist' : 'radiogroup'}
      aria-label={label}
      className="flex rounded-full bg-blue-soft p-1"
    >
      {segments.map((s, i) => {
        const selected = s.value === value;
        return (
          <button
            key={s.value}
            ref={(el) => {
              refs.current[i] = el;
            }}
            type="button"
            role={asTabs ? 'tab' : 'radio'}
            {...(asTabs
              ? {
                  'aria-selected': selected,
                  id: idPrefix ? `${idPrefix}-tab-${s.value}` : undefined,
                  'aria-controls': idPrefix ? `${idPrefix}-panel-${s.value}` : undefined,
                }
              : { 'aria-checked': selected })}
            tabIndex={selected ? 0 : -1}
            onClick={() => onChange(s.value)}
            onKeyDown={(e) => onKeyDown(e, i)}
            className="relative h-10 flex-1 rounded-full text-label font-bold text-ink"
          >
            {selected && (
              <motion.span
                layoutId={layoutId}
                transition={
                  reduce ? { duration: 0 } : { type: 'spring', stiffness: 400, damping: 30 }
                }
                className="absolute inset-0 rounded-full bg-surface shadow-card"
              />
            )}
            <span className="relative">{s.label}</span>
          </button>
        );
      })}
    </div>
  );
}
