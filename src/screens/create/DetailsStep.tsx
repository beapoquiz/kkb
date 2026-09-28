import { ChevronDown } from 'lucide-react';
import type { FormEvent } from 'react';
import { Button } from '../../components/Button';
import { EmojiPicker } from '../../components/EmojiPicker';
import { inputClass, TextField } from '../../components/Field';
import { CURRENCY_LABELS } from '../../lib/labels';
import { CURRENCIES, LIMITS, type CurrencyCode } from '../../lib/schema';
import type { EventDetails } from '../CreateEventScreen';

export function DetailsStep({
  value,
  onChange,
  onNext,
}: {
  value: EventDetails;
  onChange: (next: EventDetails) => void;
  onNext: () => void;
}) {
  const valid = value.name.trim().length > 0;
  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (valid) onNext();
  };

  return (
    <form onSubmit={submit} className="flex flex-1 flex-col gap-6">
      <h1 className="text-h1 font-semibold">What are we splitting?</h1>
      <TextField
        label="Name"
        placeholder="e.g. Baguio Trip, Samgyup Friday"
        value={value.name}
        maxLength={LIMITS.eventName}
        onChange={(e) => onChange({ ...value, name: e.target.value })}
        autoFocus
        autoComplete="off"
      />
      <EmojiPicker value={value.emoji} onChange={(emoji) => onChange({ ...value, emoji })} />
      <details className="group rounded-input">
        <summary className="flex cursor-pointer list-none items-center gap-1 text-label font-bold text-blue-strong">
          More options
          <ChevronDown
            size={18}
            aria-hidden="true"
            className="transition-transform group-open:rotate-180"
          />
        </summary>
        <label htmlFor="currency" className="mt-3 mb-1.5 block text-label font-bold">
          Currency
        </label>
        <select
          id="currency"
          className={`${inputClass} w-full`}
          value={value.currency}
          onChange={(e) => onChange({ ...value, currency: e.target.value as CurrencyCode })}
        >
          {CURRENCIES.map((c) => (
            <option key={c} value={c}>
              {CURRENCY_LABELS[c]}
            </option>
          ))}
        </select>
      </details>
      <div className="mt-auto">
        <Button type="submit" block disabled={!valid}>
          Next
        </Button>
      </div>
    </form>
  );
}
