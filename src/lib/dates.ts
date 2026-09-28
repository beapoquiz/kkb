const DAY_MS = 86_400_000;

const pad = (n: number) => String(n).padStart(2, '0');

/** Local calendar date as 'YYYY-MM-DD'. */
export function toIsoDate(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function todayIso(now = Date.now()): string {
  return toIsoDate(new Date(now));
}

/** 'YYYY-MM-DD' shifted by a number of days (local time). */
export function shiftIsoDate(iso: string, days: number): string {
  const [y, m, d] = iso.split('-').map(Number);
  return toIsoDate(new Date(y, m - 1, d + days));
}

function parseIso(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d);
}

/** "Today", "Yesterday", or a short date like "Sep 27" (with the year if it isn't this year). */
export function dateLabel(iso: string, now = Date.now()): string {
  const today = todayIso(now);
  if (iso === today) return 'Today';
  if (iso === shiftIsoDate(today, -1)) return 'Yesterday';
  const date = parseIso(iso);
  const sameYear = date.getFullYear() === new Date(now).getFullYear();
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    ...(sameYear ? {} : { year: 'numeric' }),
  });
}

/** Short date for a timestamp, e.g. "Sep 28". */
export function shortDate(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

/** Whole UTC days since the epoch. Used to store payment times compactly in share links. */
export function toEpochDay(timestamp: number): number {
  return Math.floor(timestamp / DAY_MS);
}

/** Noon UTC of an epoch day, which falls on the same calendar date in most time zones. */
export function fromEpochDay(day: number): number {
  return day * DAY_MS + DAY_MS / 2;
}

/** Midnight UTC of an ISO date. */
export function isoDateToUtc(iso: string): number {
  return Date.parse(`${iso}T00:00:00Z`);
}
