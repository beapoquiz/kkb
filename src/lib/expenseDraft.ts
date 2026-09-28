import { newId } from './id';
import { formatMoney, maxAmount, parseAmount, toInputString } from './money';
import {
  CATEGORY_META,
  LIMITS,
  type Category,
  type CurrencyCode,
  type Expense,
  type Id,
  type ItemizedExpense,
  type KkbEvent,
} from './schema';
import { itemizedBreakdown, splitEqual, type ItemizedBreakdown } from './split';

/** The add/edit expense form as the user types it (strings for amounts). */

export interface ItemDraft {
  id: Id;
  name: string;
  price: string;
  qty: number;
  sharedBy: Id[];
}

export interface ExpenseDraft {
  id: Id;
  mode: 'equal' | 'itemized';
  amount: string;
  title: string;
  category: Category;
  paidBy: Id;
  participants: Id[];
  date: string;
  items: ItemDraft[];
  servicePct: string;
  tip: string;
  discount: string;
  receiptTotal: string;
  createdAt: number | null;
}

export function newItem(sharedBy: Id[]): ItemDraft {
  return { id: newId(8), name: '', price: '', qty: 1, sharedBy };
}

export function emptyDraft(
  event: KkbEvent,
  lastPayer: Id | undefined,
  today: string,
): ExpenseDraft {
  const everyone = event.people.map((p) => p.id);
  const payer = lastPayer && everyone.includes(lastPayer) ? lastPayer : everyone[0];
  return {
    id: newId(),
    mode: 'equal',
    amount: '',
    title: '',
    category: 'food',
    paidBy: payer,
    participants: everyone,
    date: today,
    items: [newItem(everyone)],
    servicePct: '',
    tip: '',
    discount: '',
    receiptTotal: '',
    createdAt: null,
  };
}

export function draftFromExpense(expense: Expense, event: KkbEvent): ExpenseDraft {
  const money = (minor: number) => (minor ? toInputString(minor, event.currency) : '');
  const base = {
    id: expense.id,
    title: expense.title,
    category: expense.category,
    paidBy: expense.paidBy,
    date: expense.date,
    createdAt: expense.createdAt,
    receiptTotal: '',
  };
  if (expense.mode === 'equal') {
    return {
      ...base,
      mode: 'equal',
      amount: toInputString(expense.amount, event.currency),
      participants: expense.participants,
      items: [newItem(expense.participants)],
      servicePct: '',
      tip: '',
      discount: '',
    };
  }
  const participants = event.people
    .map((p) => p.id)
    .filter((id) => expense.items.some((it) => it.sharedBy.includes(id)));
  return {
    ...base,
    mode: 'itemized',
    amount: '',
    participants,
    items: expense.items.map((it) => ({
      id: it.id,
      name: it.name,
      price: toInputString(it.unitPrice, event.currency),
      qty: it.qty,
      sharedBy: it.sharedBy,
    })),
    servicePct: expense.serviceChargeBps ? toInputString(expense.serviceChargeBps, 'USD') : '',
    tip: money(expense.tip),
    discount: money(expense.discount),
  };
}

/** "10" → 1000 bps, "12.5" → 1250 bps. Empty means 0. */
export function parsePercentBps(input: string): number | null {
  if (input.trim() === '') return 0;
  return parseAmount(input.replace('%', ''), 'USD');
}

function optionalMoney(input: string, currency: CurrencyCode): number | null {
  return input.trim() === '' ? 0 : parseAmount(input, currency);
}

export type DraftResult =
  | { ok: true; expense: Expense; breakdown: ItemizedBreakdown | null }
  | { ok: false; error: string; breakdown: ItemizedBreakdown | null };

/** Validates the draft and turns it into an Expense. Messages are the friendly UI copy. */
export function buildExpense(draft: ExpenseDraft, event: KkbEvent, now = Date.now()): DraftResult {
  const currency = event.currency;
  const order = event.people.map((p) => p.id);
  const max = maxAmount(currency);
  const tooMuch = `That's a lot of money! Max is ${formatMoney(max, currency).replace(/\.00$/, '')}.`;
  const participants = order.filter((id) => draft.participants.includes(id));
  const base = {
    id: draft.id,
    title: draft.title.trim().slice(0, LIMITS.expenseTitle) || CATEGORY_META[draft.category].label,
    category: draft.category,
    paidBy: draft.paidBy,
    date: draft.date,
    createdAt: draft.createdAt ?? now,
  };
  const fail = (error: string, breakdown: ItemizedBreakdown | null = null): DraftResult => ({
    ok: false,
    error,
    breakdown,
  });

  if (!order.includes(draft.paidBy)) return fail('Pick who paid');

  if (draft.mode === 'equal') {
    const amount = parseAmount(draft.amount, currency);
    if (amount === null && draft.amount.trim() !== '')
      return fail("That doesn't look like an amount");
    if (!amount) return fail('How much was it?');
    if (amount > max) return fail(tooMuch);
    if (participants.length === 0) return fail('Pick at least one person to split with');
    return {
      ok: true,
      expense: { ...base, mode: 'equal', amount, participants },
      breakdown: null,
    };
  }

  if (participants.length === 0) return fail('Pick at least one person to split with');
  if (draft.items.length === 0) return fail('Add at least one item');
  const items: ItemizedExpense['items'] = [];
  for (const it of draft.items) {
    const price = parseAmount(it.price, currency);
    if (!price) return fail('Each item needs a price');
    if (price > max) return fail(tooMuch);
    const sharedBy = order.filter((id) => it.sharedBy.includes(id));
    if (sharedBy.length === 0) return fail('Each item needs at least one person');
    items.push({
      id: it.id,
      name: it.name.trim().slice(0, LIMITS.itemName),
      unitPrice: price,
      qty: Math.min(LIMITS.qty, Math.max(1, Math.round(it.qty))),
      sharedBy,
    });
  }
  const bps = parsePercentBps(draft.servicePct);
  if (bps === null || bps > LIMITS.maxServiceBps) return fail('Service charge must be 0–50%');
  const tip = optionalMoney(draft.tip, currency);
  if (tip === null) return fail("The tip doesn't look like an amount");
  const discount = optionalMoney(draft.discount, currency);
  if (discount === null) return fail("The discount doesn't look like an amount");

  const expense: ItemizedExpense = {
    ...base,
    mode: 'itemized',
    items,
    serviceChargeBps: bps,
    tip,
    discount: 0,
  };
  const gross = itemizedBreakdown(expense, order);
  if (discount > gross.total) return fail("The discount can't be more than the bill", gross);
  const withDiscount = { ...expense, discount };
  const breakdown = itemizedBreakdown(withDiscount, order);
  if (breakdown.total > max) return fail(tooMuch, breakdown);
  if (breakdown.total <= 0) return fail('The total has to be more than zero', breakdown);
  return { ok: true, expense: withDiscount, breakdown };
}

/** Live preview for the equal split, e.g. "₱740.00 each" or "₱333.34 / ₱333.33 each". */
export function equalPreview(draft: ExpenseDraft, event: KkbEvent): string | null {
  const amount = parseAmount(draft.amount, event.currency);
  const order = event.people.map((p) => p.id);
  const participants = order.filter((id) => draft.participants.includes(id));
  if (!amount || participants.length === 0) return null;
  if (participants.length === 1) {
    const name = event.people.find((p) => p.id === participants[0])?.name ?? '';
    return participants[0] === draft.paidBy
      ? 'Personal expense (affects nobody)'
      : `${name} owes it all`;
  }
  const shares = [...splitEqual(amount, participants, order).values()];
  const high = Math.max(...shares);
  const low = Math.min(...shares);
  const fmt = (m: number) => formatMoney(m, event.currency);
  return high === low ? `${fmt(high)} each` : `${fmt(high)} / ${fmt(low)} each`;
}

/** "✓ Matches the receipt" or "Off by ₱12.00. Check your items?" (null when there's nothing to compare). */
export function receiptCheck(
  receiptInput: string,
  total: number,
  currency: CurrencyCode,
): { ok: boolean; message: string } | null {
  if (receiptInput.trim() === '') return null;
  const receipt = parseAmount(receiptInput, currency);
  if (receipt === null) return { ok: false, message: "That doesn't look like an amount" };
  if (receipt === total) return { ok: true, message: 'Matches the receipt' };
  return {
    ok: false,
    message: `Off by ${formatMoney(Math.abs(receipt - total), currency)}. Check your items?`,
  };
}
