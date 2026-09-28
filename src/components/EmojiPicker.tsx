import { EVENT_EMOJI_LABELS } from '../lib/labels';
import { EVENT_EMOJIS, type EventEmoji } from '../lib/schema';
import { FieldLabel } from './Field';

/** The 12 event emoji as a radio-style grid of labelled buttons. */
export function EmojiPicker({
  value,
  onChange,
}: {
  value: EventEmoji;
  onChange: (emoji: EventEmoji) => void;
}) {
  return (
    <div role="group" aria-label="Emoji">
      <FieldLabel>Emoji</FieldLabel>
      <div className="grid grid-cols-6 gap-2">
        {EVENT_EMOJIS.map((e) => (
          <button
            key={e}
            type="button"
            aria-label={EVENT_EMOJI_LABELS[e]}
            aria-pressed={e === value}
            onClick={() => onChange(e)}
            className={`squish flex aspect-square items-center justify-center rounded-2xl text-2xl ${e === value ? 'bg-blue-soft ring-[3px] ring-blue-strong' : 'bg-surface shadow-card'}`}
          >
            <span aria-hidden="true">{e}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
