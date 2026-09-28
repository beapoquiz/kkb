import fc from 'fast-check';
import {
  AVATAR_COLORS,
  AVATAR_EMOJIS,
  CATEGORIES,
  CURRENCIES,
  type Expense,
  type Id,
  type KkbEvent,
  type Payment,
} from '../schema';
import { itemizedBreakdown } from '../split';

/** fast-check arbitrary for valid random events (2–8 people, 1–20 mixed expenses, payments). */

const subsetOf = (ids: Id[]) =>
  fc
    .subarray(ids, { minLength: 1 })
    .chain((sub) => fc.shuffledSubarray(sub, { minLength: sub.length }));

function expenseArb(ids: Id[], index: number): fc.Arbitrary<Expense> {
  const base = fc.record({
    title: fc.string({ maxLength: 20 }).map((s) => s.trim()),
    category: fc.constantFrom(...CATEGORIES),
    paidBy: fc.constantFrom(...ids),
  });
  const meta = { id: `x${index}`, date: '2026-09-20', createdAt: 1_000 + index };

  const equal = fc
    .record({
      base,
      amount: fc.integer({ min: 1, max: 1_000_000_000 }),
      participants: subsetOf(ids),
    })
    .map(({ base, amount, participants }): Expense => ({
      ...base,
      ...meta,
      mode: 'equal',
      amount,
      participants,
    }));

  const itemized = fc
    .record({
      base,
      items: fc.array(
        fc.record({
          unitPrice: fc.integer({ min: 1, max: 2_000_000 }),
          qty: fc.integer({ min: 1, max: 5 }),
          sharedBy: subsetOf(ids),
        }),
        { minLength: 1, maxLength: 6 },
      ),
      serviceChargeBps: fc.integer({ min: 0, max: 5000 }),
      tip: fc.integer({ min: 0, max: 100_000 }),
      discountPercent: fc.integer({ min: 0, max: 100 }),
    })
    .map(({ base, items, serviceChargeBps, tip, discountPercent }): Expense => {
      const draft = {
        ...base,
        ...meta,
        mode: 'itemized' as const,
        items: items.map((it, j) => ({ ...it, id: `i${j}`, name: `Item ${j}` })),
        serviceChargeBps,
        tip,
        discount: 0,
      };
      const gross = itemizedBreakdown(draft, ids).total;
      return { ...draft, discount: Math.floor((gross * discountPercent) / 100) };
    });

  return fc.oneof(equal, itemized);
}

function paymentArb(ids: Id[], index: number): fc.Arbitrary<Payment> {
  return fc
    .tuple(fc.constantFrom(...ids), fc.constantFrom(...ids), fc.integer({ min: 1, max: 5_000_000 }))
    .filter(([from, to]) => from !== to)
    .map(([from, to, amount]) => ({
      id: `y${index}`,
      from,
      to,
      amount,
      paidAt: 1_700_000_000_000,
    }));
}

export const randomEventArb: fc.Arbitrary<KkbEvent> = fc
  .record({
    peopleCount: fc.integer({ min: 2, max: 8 }),
    expenseCount: fc.integer({ min: 1, max: 20 }),
    paymentCount: fc.integer({ min: 0, max: 5 }),
    currency: fc.constantFrom(...CURRENCIES),
  })
  .chain(({ peopleCount, expenseCount, paymentCount, currency }) => {
    const ids = Array.from({ length: peopleCount }, (_, i) => `p${i}`);
    return fc
      .record({
        expenses: fc.tuple(...Array.from({ length: expenseCount }, (_, i) => expenseArb(ids, i))),
        payments: fc.tuple(...Array.from({ length: paymentCount }, (_, i) => paymentArb(ids, i))),
      })
      .map(({ expenses, payments }): KkbEvent => ({
        v: 1,
        id: 'random',
        name: 'Random event',
        emoji: '🎉',
        currency,
        people: ids.map((id, i) => ({
          id,
          name: `Person ${i}`,
          emoji: AVATAR_EMOJIS[i % AVATAR_EMOJIS.length],
          color: AVATAR_COLORS[i % AVATAR_COLORS.length],
        })),
        expenses,
        payments,
        createdAt: 1_700_000_000_000,
        updatedAt: 1_700_000_000_000,
      }));
  });
