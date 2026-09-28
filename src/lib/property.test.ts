import fc from 'fast-check';
import { computeBalances } from './balances';
import { randomEventArb } from './fixtures/randomEvent';
import { KkbEventSchema } from './schema';
import { settleEvent } from './settle';
import { expenseShares, expenseTotal } from './split';

/** Invariants that must hold for any event, checked on 250 random ones. */
describe('money invariants (property-based)', () => {
  const runs = { numRuns: 250, seed: 20260929 };

  it('generates valid events', () => {
    fc.assert(
      fc.property(randomEventArb, (event) => KkbEventSchema.safeParse(event).success),
      runs,
    );
  });

  it('shares are non-negative and add up to each expense total', () => {
    fc.assert(
      fc.property(randomEventArb, (event) => {
        const order = event.people.map((p) => p.id);
        for (const expense of event.expenses) {
          const shares = [...expenseShares(expense, order).values()];
          expect(shares.every((s) => s >= 0)).toBe(true);
          expect(shares.reduce((a, b) => a + b, 0)).toBe(expenseTotal(expense));
        }
      }),
      runs,
    );
  });

  it('balances always sum to zero', () => {
    fc.assert(
      fc.property(randomEventArb, (event) => {
        expect(computeBalances(event).reduce((s, r) => s + r.balance, 0)).toBe(0);
      }),
      runs,
    );
  });

  it('settle-up zeroes everyone with at most n − 1 positive transfers', () => {
    fc.assert(
      fc.property(randomEventArb, (event) => {
        const transfers = settleEvent(event);
        expect(transfers.length).toBeLessThanOrEqual(event.people.length - 1);
        expect(transfers.every((t) => t.amount > 0 && t.from !== t.to)).toBe(true);

        const paid = {
          ...event,
          payments: [
            ...event.payments,
            ...transfers.map((t, i) => ({ id: `s${i}`, ...t, paidAt: 0 })),
          ],
        };
        expect(computeBalances(paid).every((r) => r.balance === 0)).toBe(true);
        expect(settleEvent(paid)).toEqual([]);
      }),
      runs,
    );
  });
});
