import { AVATAR_COLOR_LABELS, AVATAR_EMOJI_LABELS } from '../lib/labels';
import { AVATAR_COLORS, AVATAR_EMOJIS, type AvatarColor, type AvatarEmoji } from '../lib/schema';
import { FieldLabel } from './Field';

/** Emoji + color picker for a person's avatar. */
export function AvatarPicker({
  emoji,
  color,
  onChange,
}: {
  emoji: AvatarEmoji;
  color: AvatarColor;
  onChange: (next: { emoji: AvatarEmoji; color: AvatarColor }) => void;
}) {
  return (
    <div className="space-y-4">
      <div role="group" aria-labelledby="avatar-emoji-label">
        <FieldLabel id="avatar-emoji-label">Animal</FieldLabel>
        <div className="grid grid-cols-6 gap-2">
          {AVATAR_EMOJIS.map((e) => (
            <button
              key={e}
              type="button"
              aria-label={AVATAR_EMOJI_LABELS[e]}
              aria-pressed={e === emoji}
              onClick={() => onChange({ emoji: e, color })}
              className={`squish flex aspect-square items-center justify-center rounded-2xl text-2xl ${e === emoji ? 'ring-[3px] ring-blue-strong' : ''}`}
              style={{ background: color }}
            >
              <span aria-hidden="true">{e}</span>
            </button>
          ))}
        </div>
      </div>
      <div role="group" aria-labelledby="avatar-color-label">
        <FieldLabel id="avatar-color-label">Color</FieldLabel>
        <div className="flex flex-wrap gap-2">
          {AVATAR_COLORS.map((c) => (
            <button
              key={c}
              type="button"
              aria-label={AVATAR_COLOR_LABELS[c]}
              aria-pressed={c === color}
              onClick={() => onChange({ emoji, color: c })}
              className={`squish h-10 w-10 rounded-full border border-line ${c === color ? 'ring-[3px] ring-blue-strong ring-offset-2' : ''}`}
              style={{ background: c }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
