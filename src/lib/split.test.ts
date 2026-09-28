import { SAMPLE_IDS, buildSampleTrip } from './fixtures/sampleTrip';
import type { ItemizedExpense } from './schema';
import {
  allocate,
  expenseParticipants,
  expenseShares,
  expenseTotal,
  itemizedBreakdown,
  serviceCharge,
  splitEqual,
} from './split';

const order = ['a', 'b', 'c', 'd'];
const obj = (m: Map<string, number>) => Object.fromEntries(m);
const sum = (m: Map<string, number>) => [...m.values()].reduce((x, y) => x + y, 0);
const weights = (entries: [string, number][]) => new Map(entries);

describe('splitEqual', () => {
  it('divides exactly when possible', () => {
    expect(obj(splitEqual(1200, ['a', 'b', 'c'], order))).toEqual({ a: 400, b: 400, c: 400 });
  });

  it('gives remainders to people first in the list order', () => {
    expect(obj(splitEqual(10000, ['a', 'b', 'c'], order))).toEqual({ a: 3334, b: 3333, c: 3333 });
    expect(obj(splitEqual(1, order, order))).toEqual({ a: 1, b: 0, c: 0, d: 0 });
    expect(obj(splitEqual(2, ['a', 'b', 'c'], order))).toEqual({ a: 1, b: 1, c: 0 });
  });

  it('does not depend on the order of the input array', () => {
    expect(obj(splitEqual(10000, ['c', 'a', 'b'], order))).toEqual({ a: 3334, b: 3333, c: 3333 });
  });

  it('handles one participant and no participants', () => {
    expect(obj(splitEqual(999, ['b'], order))).toEqual({ b: 999 });
    expect(splitEqual(999, [], order).size).toBe(0);
  });

  it('ignores duplicate ids and always sums to the total', () => {
    const shares = splitEqual(1001, ['a', 'a', 'b', 'c'], order);
    expect(shares.size).toBe(3);
    expect(sum(shares)).toBe(1001);
  });
});

describe('allocate', () => {
  it('sums exactly and follows weights', () => {
    const w = weights([
      ['a', 30250],
      ['b', 34250],
      ['c', 51250],
      ['d', 34250],
    ]);
    expect(obj(allocate(15000, w, order))).toEqual({ a: 3025, b: 3425, c: 5125, d: 3425 });
  });

  it('breaks ties by people order', () => {
    const w = weights([
      ['c', 1],
      ['a', 1],
      ['b', 1],
    ]);
    expect(obj(allocate(2, w, order))).toEqual({ a: 1, b: 1, c: 0 });
    expect(obj(allocate(1, w, order))).toEqual({ a: 1, b: 0, c: 0 });
  });

  it('gives the leftover to the largest remainder', () => {
    // 10 split 1:2 is 3.33 / 6.67, so b has the larger fraction.
    const w = weights([
      ['a', 1],
      ['b', 2],
    ]);
    expect(obj(allocate(10, w, order))).toEqual({ a: 3, b: 7 });
  });

  it('handles zero amounts, zero weights and a single person', () => {
    expect(obj(allocate(0, weights([['a', 5]]), order))).toEqual({ a: 0 });
    const zero = weights([
      ['a', 0],
      ['b', 0],
    ]);
    expect(obj(allocate(10, zero, order))).toEqual({ a: 0, b: 0 });
    expect(obj(allocate(777, weights([['a', 3]]), order))).toEqual({ a: 777 });
  });

  it('stays exact when intermediate products exceed 2^53 (BigInt path)', () => {
    const w = weights([
      ['a', 999_999_999],
      ['b', 333_333_333],
      ['c', 1],
    ]);
    expect(1_000_000_000 * 999_999_999).toBeGreaterThan(Number.MAX_SAFE_INTEGER);
    const shares = allocate(1_000_000_000, w, order);
    expect(sum(shares)).toBe(1_000_000_000);
    expect(obj(shares)).toEqual({ a: 749_999_999, b: 250_000_000, c: 1 });
  });
});

describe('serviceCharge', () => {
  it('rounds half up with integer math', () => {
    expect(serviceCharge(150000, 1000)).toBe(15000);
    expect(serviceCharge(5, 1000)).toBe(1); // 0.5 rounds up
    expect(serviceCharge(4, 1000)).toBe(0); // 0.4 rounds down
    expect(serviceCharge(12345, 1250)).toBe(1543); // 1543.125
    expect(serviceCharge(12345, 0)).toBe(0);
  });
});

describe('itemized receipts', () => {
  const trip = buildSampleTrip({ now: Date.UTC(2026, 8, 29) });
  const peopleOrder = trip.people.map((p) => p.id);
  const dinner = trip.expenses.find((e) => e.id === 'e3-dinner') as ItemizedExpense;
  const { bea, migs, janna, carlo } = SAMPLE_IDS;

  it('reproduces the sample dinner from docs/06 exactly', () => {
    const b = itemizedBreakdown(dinner, peopleOrder);
    expect(obj(b.subtotals)).toEqual({
      [bea]: 30250,
      [migs]: 34250,
      [janna]: 51250,
      [carlo]: 34250,
    });
    expect(obj(b.serviceShares)).toEqual({
      [bea]: 3025,
      [migs]: 3425,
      [janna]: 5125,
      [carlo]: 3425,
    });
    expect(obj(b.owed)).toEqual({ [bea]: 33275, [migs]: 37675, [janna]: 56375, [carlo]: 37675 });
    expect(b.subtotal).toBe(150000);
    expect(b.service).toBe(15000);
    expect(b.total).toBe(165000);
    expect(expenseTotal(dinner)).toBe(165000);
  });

  it('allocates tip and discount so everything adds up', () => {
    const b = itemizedBreakdown({ ...dinner, tip: 10001, discount: 33333 }, peopleOrder);
    expect(sum(b.tipShares)).toBe(10001);
    expect(sum(b.discountShares)).toBe(33333);
    expect(sum(b.owed)).toBe(b.total);
    expect(b.total).toBe(150000 + 15000 + 10001 - 33333);
  });

  it('never gives anyone a negative share, even with a 100% discount', () => {
    const gross = itemizedBreakdown({ ...dinner, tip: 7 }, peopleOrder).total;
    const b = itemizedBreakdown({ ...dinner, tip: 7, discount: gross }, peopleOrder);
    expect(b.total).toBe(0);
    for (const v of b.owed.values()) expect(v).toBe(0);
  });

  it('lists everyone who shared an item', () => {
    expect(expenseParticipants(dinner).sort()).toEqual([bea, carlo, janna, migs].sort());
  });
});

describe('expenseShares', () => {
  it('uses the equal split for equal expenses', () => {
    const trip = buildSampleTrip();
    const straw = trip.expenses.find((e) => e.id === 'e4-strawberry');
    if (!straw) throw new Error('fixture changed');
    const { bea, janna, carlo } = SAMPLE_IDS;
    const shares = expenseShares(
      straw,
      trip.people.map((p) => p.id),
    );
    expect(obj(shares)).toEqual({ [bea]: 33334, [janna]: 33333, [carlo]: 33333 });
    expect(expenseParticipants(straw)).toEqual([bea, janna, carlo]);
  });
});
