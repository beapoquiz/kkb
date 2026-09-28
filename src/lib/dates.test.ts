import {
  dateLabel,
  fromEpochDay,
  isoDateToUtc,
  shiftIsoDate,
  toEpochDay,
  toIsoDate,
  todayIso,
} from './dates';
import { newId } from './id';

describe('dates', () => {
  const now = new Date(2026, 8, 29, 15, 0).getTime();

  it('formats local ISO dates', () => {
    expect(toIsoDate(new Date(2026, 0, 5))).toBe('2026-01-05');
    expect(todayIso(now)).toBe('2026-09-29');
  });

  it('shifts across month boundaries', () => {
    expect(shiftIsoDate('2026-10-01', -1)).toBe('2026-09-30');
    expect(shiftIsoDate('2026-12-31', 1)).toBe('2027-01-01');
  });

  it('labels dates like a chat app', () => {
    expect(dateLabel('2026-09-29', now)).toBe('Today');
    expect(dateLabel('2026-09-28', now)).toBe('Yesterday');
    expect(dateLabel('2026-09-27', now)).toBe('Sep 27');
    expect(dateLabel('2025-12-25', now)).toBe('Dec 25, 2025');
  });

  it('round-trips epoch days', () => {
    const t = Date.UTC(2026, 8, 29, 23, 59);
    expect(new Date(fromEpochDay(toEpochDay(t))).toISOString()).toBe('2026-09-29T12:00:00.000Z');
    expect(isoDateToUtc('2026-09-29')).toBe(Date.UTC(2026, 8, 29));
  });
});

describe('newId', () => {
  it('makes short url-safe ids that do not repeat', () => {
    const ids = new Set(Array.from({ length: 500 }, () => newId()));
    expect(ids.size).toBe(500);
    for (const id of ids) expect(id).toMatch(/^[A-Za-z0-9]{10}$/);
  });
});
