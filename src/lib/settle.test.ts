import { balanceMap } from './balances';
import { SAMPLE_IDS, buildSampleTrip } from './fixtures/sampleTrip';
import { settle, settleEvent, type Transfer } from './settle';

const { bea, migs, janna, carlo } = SAMPLE_IDS;

function apply(balances: Map<string, number>, transfers: Transfer[]) {
  const next = new Map(balances);
  for (const t of transfers) {
    next.set(t.from, (next.get(t.from) ?? 0) + t.amount);
    next.set(t.to, (next.get(t.to) ?? 0) - t.amount);
  }
  return next;
}

describe('settle', () => {
  it('reproduces the sample trip transfers in order', () => {
    expect(settleEvent(buildSampleTrip())).toEqual([
      { from: janna, to: bea, amount: 201208 },
      { from: carlo, to: bea, amount: 167508 },
      { from: migs, to: bea, amount: 3175 },
    ]);
  });

  it('zeroes everyone with at most n − 1 transfers', () => {
    const trip = buildSampleTrip();
    const balances = balanceMap(trip);
    const transfers = settleEvent(trip);
    expect(transfers.length).toBeLessThanOrEqual(trip.people.length - 1);
    expect([...apply(balances, transfers).values()].every((b) => b === 0)).toBe(true);
  });

  it('matches the README example (A +50, B +30, C −40, D −40)', () => {
    const balances = new Map([
      ['A', 5000],
      ['B', 3000],
      ['C', -4000],
      ['D', -4000],
    ]);
    expect(settle(balances, ['A', 'B', 'C', 'D'])).toEqual([
      { from: 'C', to: 'A', amount: 4000 },
      { from: 'D', to: 'B', amount: 3000 },
      { from: 'D', to: 'A', amount: 1000 },
    ]);
  });

  it('breaks ties by people order', () => {
    const balances = new Map([
      ['x', -100],
      ['y', -100],
      ['a', 100],
      ['b', 100],
    ]);
    expect(settle(balances, ['a', 'b', 'x', 'y'])).toEqual([
      { from: 'x', to: 'a', amount: 100 },
      { from: 'y', to: 'b', amount: 100 },
    ]);
  });

  it('returns nothing when everyone is even', () => {
    expect(settle(new Map([['a', 0]]), ['a'])).toEqual([]);
    expect(settle(new Map(), [])).toEqual([]);
  });

  it('drops a transfer once it is marked as paid', () => {
    const trip = buildSampleTrip();
    const [first, ...rest] = settleEvent(trip);
    const paid = {
      ...trip,
      payments: [...trip.payments, { id: 'p2', ...first, paidAt: 0 }],
    };
    expect(settleEvent(paid)).toEqual(rest);
  });
});
