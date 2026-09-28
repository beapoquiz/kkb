import { useId } from 'react';
import { currencySymbol } from '../../../lib/money';
import type { CurrencyCode } from '../../../lib/schema';

/** The big centered amount input with the currency symbol. */
export function AmountInput({
  value,
  onChange,
  currency,
  autoFocus,
}: {
  value: string;
  onChange: (v: string) => void;
  currency: CurrencyCode;
  autoFocus?: boolean;
}) {
  const id = useId();
  return (
    <div className="flex flex-col items-center">
      <label htmlFor={id} className="sr-only">
        Amount in {currency}
      </label>
      <div className="flex items-baseline justify-center gap-1 font-display text-amount font-semibold">
        <span className="text-ink-muted" aria-hidden="true">
          {currencySymbol(currency)}
        </span>
        <input
          id={id}
          inputMode="decimal"
          autoComplete="off"
          placeholder="0"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          data-autofocus={autoFocus ? true : undefined}
          className="w-[8ch] min-w-0 border-b-2 border-line bg-transparent text-center text-amount text-ink tabular placeholder:text-ink-muted/60 focus:border-blue-strong focus:outline-none"
          style={{ fontSize: 36 }}
        />
      </div>
    </div>
  );
}
