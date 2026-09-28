import { amountToSettle, balanceMap, computeBalances, isSettled, totalSpent } from './balances';
import { SAMPLE_IDS, buildSampleTrip } from './fixtures/sampleTrip';
import type { KkbEvent } from './schema';
import { settleEvent } from './settle';

const { bea, migs, janna, carlo } = SAMPLE_IDS;

/** Records every suggested transfer as a payment, like tapping "Mark as paid" on each card. */
function payAll(event: KkbEvent): KkbEvent {
  const payments = settleEvent(event).map((t, i) => ({ id: `paid${i}`, ...t, paidAt: 0 }));
  return { ...event, payments: [...event.payments, ...payments] };
}

describe('computeBalances (sample trip)', () => {
  const trip = buildSampleTrip();

  it('reproduces the table in docs/06', () => {
    const rows = Object.fromEntries(computeBalances(trip).map((r) => [r.personId, r]));
    expect(rows[bea]).toMatchObject({ paid: 750000, share: 328109, sent: 0, received: 50000 });
    expect(rows[migs]).toMatchObject({ paid: 296000, share: 299175, sent: 0, received: 0 });
    expect(rows[janna]).toMatchObject({ paid: 100000, share: 351208, sent: 50000, received: 0 });
    expect(rows[carlo]).toMatchObject({ paid: 165000, share: 332508, sent: 0, received: 0 });
    expect(Object.fromEntries(balanceMap(trip))).toEqual({
      [bea]: 371891,
      [migs]: -3175,
      [janna]: -201208,
      [carlo]: -167508,
    });
  });

  it('sums to exactly zero', () => {
    expect(computeBalances(trip).reduce((s, r) => s + r.balance, 0)).toBe(0);
  });

  it('computes totals', () => {
    expect(totalSpent(trip)).toBe(1_311_000);
    expect(amountToSettle(trip)).toBe(3175 + 201208 + 167508);
    expect(isSettled(trip)).toBe(false);
  });

  it('is settled once every transfer is paid', () => {
    const paid = payAll(trip);
    expect(isSettled(paid)).toBe(true);
    expect(amountToSettle(paid)).toBe(0);
    expect(computeBalances(paid).every((r) => r.balance === 0)).toBe(true);
  });

  it('is not "settled" with no expenses', () => {
    expect(isSettled({ ...trip, expenses: [], payments: [] })).toBe(false);
  });

  it('treats a personal expense (payer is the only participant) as neutral', () => {
    const solo: KkbEvent = {
      ...trip,
      payments: [],
      expenses: [
        {
          id: 'solo',
          mode: 'equal',
          title: 'Pasalubong',
          category: 'other',
          paidBy: migs,
          date: '2026-09-01',
          createdAt: 0,
          amount: 50000,
          participants: [migs],
        },
      ],
    };
    expect([...balanceMap(solo).values()]).toEqual([0, 0, 0, 0]);
  });
});
