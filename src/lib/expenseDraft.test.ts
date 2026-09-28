import {
  buildExpense,
  draftFromExpense,
  emptyDraft,
  equalPreview,
  parsePercentBps,
  receiptCheck,
  type ExpenseDraft,
} from './expenseDraft';
import { SAMPLE_IDS, buildSampleTrip } from './fixtures/sampleTrip';

const trip = buildSampleTrip({ now: Date.UTC(2026, 8, 29, 4) });
const { bea, migs, janna, carlo } = SAMPLE_IDS;
const draft = (patch: Partial<ExpenseDraft>): ExpenseDraft => ({
  ...emptyDraft(trip, undefined, '2026-09-29'),
  ...patch,
});

describe('emptyDraft', () => {
  it('defaults to everyone, food, and the last payer', () => {
    const d = emptyDraft(trip, carlo, '2026-09-29');
    expect(d).toMatchObject({ mode: 'equal', category: 'food', paidBy: carlo });
    expect(d.participants).toEqual([bea, migs, janna, carlo]);
    expect(emptyDraft(trip, 'gone', '2026-09-29').paidBy).toBe(bea);
  });
});

describe('buildExpense (equal)', () => {
  it('builds an equal expense and defaults the title to the category', () => {
    const r = buildExpense(draft({ amount: '2,960', category: 'transport' }), trip, 5);
    expect(r.ok && r.expense).toMatchObject({
      mode: 'equal',
      title: 'Transport',
      amount: 296000,
      createdAt: 5,
    });
  });

  it('shows the friendly validation messages', () => {
    const msg = (d: ExpenseDraft) => {
      const r = buildExpense(d, trip);
      return r.ok ? null : r.error;
    };
    expect(msg(draft({ amount: '' }))).toBe('How much was it?');
    expect(msg(draft({ amount: '0' }))).toBe('How much was it?');
    expect(msg(draft({ amount: '-5' }))).toBe("That doesn't look like an amount");
    expect(msg(draft({ amount: '100', participants: [] }))).toBe(
      'Pick at least one person to split with',
    );
    expect(msg(draft({ amount: '10000000.01' }))).toBe(
      "That's a lot of money! Max is ₱10,000,000.",
    );
    expect(msg(draft({ amount: '10000000' }))).toBeNull();
  });

  it('previews equal shares with remainders', () => {
    expect(equalPreview(draft({ amount: '2960' }), trip)).toBe('₱740.00 each');
    expect(equalPreview(draft({ amount: '1000', participants: [bea, janna, carlo] }), trip)).toBe(
      '₱333.34 / ₱333.33 each',
    );
    expect(equalPreview(draft({ amount: '50', participants: [bea], paidBy: bea }), trip)).toBe(
      'Personal expense (affects nobody)',
    );
    expect(equalPreview(draft({ amount: '50', participants: [migs] }), trip)).toBe(
      'Migs owes it all',
    );
    expect(equalPreview(draft({ amount: '' }), trip)).toBeNull();
  });
});

describe('buildExpense (itemized)', () => {
  const dinner = trip.expenses[2];

  it('round-trips the sample dinner through the form', () => {
    const d = draftFromExpense(dinner, trip);
    expect(d.servicePct).toBe('10.00');
    expect(d.participants).toEqual([bea, migs, janna, carlo]);
    const r = buildExpense(d, trip);
    expect(r.ok && r.expense).toEqual(dinner);
    expect(r.breakdown?.total).toBe(165000);
  });

  it('round-trips an equal expense through the form', () => {
    const bus = trip.expenses[0];
    const r = buildExpense(draftFromExpense(bus, trip), trip);
    expect(r.ok && r.expense).toEqual(bus);
  });

  it('validates items, service, tip and discount', () => {
    const base = draftFromExpense(dinner, trip);
    const msg = (patch: Partial<ExpenseDraft>) => {
      const r = buildExpense({ ...base, ...patch }, trip);
      return r.ok ? null : r.error;
    };
    expect(msg({ items: [] })).toBe('Add at least one item');
    expect(msg({ items: [{ ...base.items[0], price: '' }] })).toBe('Each item needs a price');
    expect(msg({ items: [{ ...base.items[0], sharedBy: [] }] })).toBe(
      'Each item needs at least one person',
    );
    expect(msg({ servicePct: '51' })).toBe('Service charge must be 0–50%');
    expect(msg({ tip: 'abc' })).toBe("The tip doesn't look like an amount");
    expect(msg({ discount: '1650.01' })).toBe("The discount can't be more than the bill");
    expect(msg({ discount: '1650' })).toBe('The total has to be more than zero');
    expect(msg({ discount: '100', tip: '50' })).toBeNull();
  });

  it('parses percentages into basis points', () => {
    expect(parsePercentBps('10')).toBe(1000);
    expect(parsePercentBps('12.5%')).toBe(1250);
    expect(parsePercentBps('')).toBe(0);
    expect(parsePercentBps('x')).toBeNull();
  });
});

describe('receiptCheck', () => {
  it('compares the typed receipt total', () => {
    expect(receiptCheck('', 165000, 'PHP')).toBeNull();
    expect(receiptCheck('1,650', 165000, 'PHP')).toEqual({
      ok: true,
      message: 'Matches the receipt',
    });
    expect(receiptCheck('1662', 165000, 'PHP')).toEqual({
      ok: false,
      message: 'Off by ₱12.00. Check your items?',
    });
    expect(receiptCheck('abc', 165000, 'PHP')?.ok).toBe(false);
  });
});
