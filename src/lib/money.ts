import type { CurrencyCode, Minor } from './schema';

export const CURRENCY_DECIMALS: Record<CurrencyCode, number> = {
  PHP: 2,
  USD: 2,
  EUR: 2,
  JPY: 0,
  SGD: 2,
  KRW: 0,
};

/** Largest amount for one expense: 10,000,000 in the currency's major unit. */
export function maxAmount(currency: CurrencyCode): Minor {
  return 10_000_000 * 10 ** CURRENCY_DECIMALS[currency];
}

/**
 * Parses user input like "1,200", "1200.5" or "₱1,200.50" into integer minor units.
 * Works on the string digits directly (never `parseFloat(x) * 100`), so there is no float error.
 * Returns null for negatives, non-numbers, or more decimals than the currency allows.
 */
export function parseAmount(input: string, currency: CurrencyCode): Minor | null {
  const cleaned = input.replace(/[\s,]/g, '').replace(/^[^\d.-]+/, '');
  const match = /^(\d*)(?:\.(\d*))?$/.exec(cleaned);
  if (!match) return null;
  const [, whole = '', fraction = ''] = match;
  if (whole === '' && fraction === '') return null;

  const decimals = CURRENCY_DECIMALS[currency];
  if (fraction.length > decimals) return null;
  if (whole.length > 13) return null;

  const minor =
    Number(whole || '0') * 10 ** decimals + Number(fraction.padEnd(decimals, '0') || '0');
  return Number.isSafeInteger(minor) ? minor : null;
}

const formatters = new Map<CurrencyCode, Intl.NumberFormat>();

function formatter(currency: CurrencyCode): Intl.NumberFormat {
  let f = formatters.get(currency);
  if (!f) {
    f = new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency,
      minimumFractionDigits: CURRENCY_DECIMALS[currency],
      maximumFractionDigits: CURRENCY_DECIMALS[currency],
    });
    formatters.set(currency, f);
  }
  return f;
}

/** Formats minor units for display, e.g. `formatMoney(123450, 'PHP')` → "₱1,234.50". */
export function formatMoney(minor: Minor, currency: CurrencyCode): string {
  return formatter(currency).format(minor / 10 ** CURRENCY_DECIMALS[currency]);
}

/** The currency symbol on its own, e.g. "₱". */
export function currencySymbol(currency: CurrencyCode): string {
  const part = formatter(currency)
    .formatToParts(0)
    .find((p) => p.type === 'currency');
  return part?.value ?? currency;
}

/** Plain editable text for an amount input, e.g. 123450 → "1234.50" (no symbol, no commas). */
export function toInputString(minor: Minor, currency: CurrencyCode): string {
  const decimals = CURRENCY_DECIMALS[currency];
  if (decimals === 0) return String(minor);
  const whole = Math.floor(minor / 10 ** decimals);
  const fraction = String(minor % 10 ** decimals).padStart(decimals, '0');
  return `${whole}.${fraction}`;
}
