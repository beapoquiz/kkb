import type { Expense, Id, ItemizedExpense, Minor } from './schema';

export type Shares = Map<Id, Minor>;

/** Orders ids by their position in `peopleOrder`; unknown ids keep their input order at the end. */
function byPeopleOrder(ids: Id[], peopleOrder: Id[]): Id[] {
  const rank = (id: Id) => {
    const i = peopleOrder.indexOf(id);
    return i === -1 ? Number.MAX_SAFE_INTEGER : i;
  };
  return [...new Set(ids)]
    .map((id, inputIndex) => ({ id, inputIndex }))
    .sort((a, b) => rank(a.id) - rank(b.id) || a.inputIndex - b.inputIndex)
    .map((x) => x.id);
}

/**
 * Splits `total` into integer shares. Leftover minor units go one at a time to the
 * participants who come first in `peopleOrder`, so the shares always add up exactly.
 */
export function splitEqual(total: Minor, participantIds: Id[], peopleOrder: Id[]): Shares {
  const ordered = byPeopleOrder(participantIds, peopleOrder);
  const shares: Shares = new Map();
  if (ordered.length === 0) return shares;
  const base = Math.floor(total / ordered.length);
  const remainder = total - base * ordered.length;
  ordered.forEach((id, i) => shares.set(id, base + (i < remainder ? 1 : 0)));
  return shares;
}

/**
 * Splits `amount` in proportion to `weights` with the largest remainder method.
 * Uses BigInt internally because `amount * weight` can exceed 2^53.
 * Ties go to whoever comes first in `peopleOrder`.
 */
export function allocate(amount: Minor, weights: Shares, peopleOrder: Id[]): Shares {
  const ids = byPeopleOrder([...weights.keys()], peopleOrder);
  const result: Shares = new Map(ids.map((id) => [id, 0]));
  const totalWeight = ids.reduce((sum, id) => sum + BigInt(weights.get(id) ?? 0), 0n);
  if (amount === 0 || totalWeight === 0n) return result;

  const big = BigInt(amount);
  const parts = ids.map((id, order) => {
    const product = big * BigInt(weights.get(id) ?? 0);
    return { id, order, base: product / totalWeight, frac: product % totalWeight };
  });
  let left = big - parts.reduce((sum, p) => sum + p.base, 0n);
  const byFraction = [...parts].sort((a, b) =>
    a.frac === b.frac ? a.order - b.order : a.frac > b.frac ? -1 : 1,
  );
  for (const part of byFraction) {
    if (left === 0n) break;
    part.base += 1n;
    left -= 1n;
  }
  for (const part of parts) result.set(part.id, Number(part.base));
  return result;
}

/** Service charge in minor units, rounded half up with integer math. 1000 bps = 10%. */
export function serviceCharge(subtotal: Minor, bps: number): Minor {
  return Number((BigInt(subtotal) * BigInt(bps) + 5000n) / 10000n);
}

export interface ItemizedBreakdown {
  /** Each person's share of the items before extras. */
  subtotals: Shares;
  serviceShares: Shares;
  tipShares: Shares;
  discountShares: Shares;
  /** What each person owes in total for this receipt. */
  owed: Shares;
  subtotal: Minor;
  service: Minor;
  total: Minor;
}

function addInto(target: Shares, source: Shares, sign = 1) {
  for (const [id, value] of source) target.set(id, (target.get(id) ?? 0) + sign * value);
}

/**
 * Itemized receipt: each item is split equally among the people who shared it, then service
 * charge and tip are allocated in proportion to item subtotals. The discount is allocated in
 * proportion to each person's pre-discount total, which guarantees nobody's share goes negative.
 */
export function itemizedBreakdown(expense: ItemizedExpense, peopleOrder: Id[]): ItemizedBreakdown {
  const subtotals: Shares = new Map();
  for (const item of expense.items) {
    addInto(subtotals, splitEqual(item.unitPrice * item.qty, item.sharedBy, peopleOrder));
  }
  const subtotal = [...subtotals.values()].reduce((a, b) => a + b, 0);
  const service = serviceCharge(subtotal, expense.serviceChargeBps);
  const serviceShares = allocate(service, subtotals, peopleOrder);
  const tipShares = allocate(expense.tip, subtotals, peopleOrder);

  const beforeDiscount: Shares = new Map(subtotals);
  addInto(beforeDiscount, serviceShares);
  addInto(beforeDiscount, tipShares);
  const discountShares = allocate(expense.discount, beforeDiscount, peopleOrder);

  const owed: Shares = new Map(beforeDiscount);
  addInto(owed, discountShares, -1);
  const total = subtotal + service + expense.tip - expense.discount;
  return { subtotals, serviceShares, tipShares, discountShares, owed, subtotal, service, total };
}

/** What each person consumed in one expense. The values always sum to `expenseTotal`. */
export function expenseShares(expense: Expense, peopleOrder: Id[]): Shares {
  if (expense.mode === 'equal')
    return splitEqual(expense.amount, expense.participants, peopleOrder);
  return itemizedBreakdown(expense, peopleOrder).owed;
}

export function expenseTotal(expense: Expense): Minor {
  if (expense.mode === 'equal') return expense.amount;
  return itemizedBreakdown(expense, []).total;
}

/** Everyone who is part of an expense (payer excluded unless they also consumed). */
export function expenseParticipants(expense: Expense): Id[] {
  if (expense.mode === 'equal') return expense.participants;
  return [...new Set(expense.items.flatMap((item) => item.sharedBy))];
}
