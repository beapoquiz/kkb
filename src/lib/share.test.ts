import fc from 'fast-check';
import { compressToEncodedURIComponent } from 'lz-string';
import { buildSampleTrip } from './fixtures/sampleTrip';
import { randomEventArb } from './fixtures/randomEvent';
import type { KkbEvent } from './schema';
import {
  MAX_PAYLOAD_LENGTH,
  MAX_QR_URL_LENGTH,
  buildShareUrl,
  decodeShare,
  encodeEvent,
  normalizeForShare,
  toCompact,
} from './share';

const pack = (value: unknown) => compressToEncodedURIComponent(JSON.stringify(value));
const trip = buildSampleTrip({ now: Date.UTC(2026, 8, 29, 4) });

function expectError(payload: string, error: string) {
  expect(decodeShare(payload)).toEqual({ ok: false, error });
}

describe('share round trip', () => {
  it('decodes the sample trip back to the normalized event', () => {
    const result = decodeShare(encodeEvent(trip));
    expect(result).toEqual({ ok: true, event: normalizeForShare(trip) });
  });

  it('only rounds timestamps (everything else is exact)', () => {
    const normalized = normalizeForShare(trip);
    const strip = (e: KkbEvent) => ({
      ...e,
      expenses: e.expenses.map((x) => ({ ...x, createdAt: 0 })),
      payments: e.payments.map((x) => ({ ...x, paidAt: 0 })),
    });
    expect(strip(normalized)).toEqual(strip(trip));
    expect(new Date(normalized.payments[0].paidAt).toISOString().slice(0, 10)).toBe('2026-09-29');
  });

  it('round-trips random events', () => {
    fc.assert(
      fc.property(randomEventArb, (event) => {
        expect(decodeShare(encodeEvent(event))).toEqual({
          ok: true,
          event: normalizeForShare(event),
        });
      }),
      { numRuns: 100, seed: 7 },
    );
  });

  it('keeps the sample trip link short enough for a QR code', () => {
    const url = buildShareUrl(trip, 'https://beapoquiz.github.io/kkb/');
    expect(url.startsWith('https://beapoquiz.github.io/kkb/#/s/')).toBe(true);
    expect(url.length).toBeLessThan(MAX_QR_URL_LENGTH);
  });

  it('drops the payment handle when a person has none', () => {
    const compact = toCompact(trip);
    expect(compact.p[2].slice(4)).toEqual(['', '']);
  });
});

describe('decodeShare rejects bad input', () => {
  const compact = toCompact(trip);

  it('rejects empty and random text', () => {
    expectError('', 'corrupt');
    expectError('hello-this-is-not-a-link', 'corrupt');
  });

  it('rejects valid compression of invalid JSON', () => {
    expectError(compressToEncodedURIComponent('{not json'), 'corrupt');
  });

  it('rejects oversized payloads before decompressing', () => {
    expectError('A'.repeat(MAX_PAYLOAD_LENGTH + 1), 'too_large');
  });

  it('rejects the wrong shape', () => {
    expectError(pack({ hello: 'world' }), 'invalid');
    expectError(pack([1, 2, 3]), 'invalid');
    expectError(pack(null), 'invalid');
  });

  it('rejects newer schema versions with a specific error', () => {
    expectError(pack({ ...compact, v: 2 }), 'newer_version');
  });

  it('rejects more than 30 people', () => {
    const people = Array.from({ length: 31 }, (_, i) => [
      `p${i}`,
      `P${i}`,
      '🐱',
      '#FFC8DD',
      '',
      '',
    ]);
    expectError(pack({ ...compact, p: people, e: [], y: [] }), 'invalid');
  });

  it('rejects negative and fractional amounts', () => {
    const e = structuredClone(compact.e);
    e[0][6] = -100;
    expectError(pack({ ...compact, e }), 'invalid');
    e[0][6] = 10.5;
    expectError(pack({ ...compact, e }), 'invalid');
  });

  it('rejects references to people who do not exist', () => {
    const e = structuredClone(compact.e);
    e[0][3] = 9;
    expectError(pack({ ...compact, e }), 'invalid');
  });

  it('rejects a payment to yourself', () => {
    expectError(pack({ ...compact, y: [['z', 1, 1, 100, 1]] }), 'invalid');
  });

  it('rejects unknown emoji, colors and over-long names', () => {
    const p = structuredClone(compact.p);
    p[0][2] = '💀';
    expectError(pack({ ...compact, p }), 'invalid');
    const q = structuredClone(compact.p);
    q[0][1] = 'x'.repeat(31);
    expectError(pack({ ...compact, p: q }), 'invalid');
  });

  it('rejects a discount larger than the bill', () => {
    const e = structuredClone(compact.e);
    e[2][9] = 99_999_999;
    expectError(pack({ ...compact, e }), 'invalid');
  });

  it('rejects duplicate people ids', () => {
    const p = structuredClone(compact.p);
    p[1][0] = p[0][0];
    expectError(pack({ ...compact, p }), 'invalid');
  });
});
