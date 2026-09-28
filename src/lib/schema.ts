import { z } from 'zod';
import { itemizedBreakdown } from './split';

/** Every schema and limit in one place. Types are derived with `z.infer`. */

export const CURRENCIES = ['PHP', 'USD', 'EUR', 'JPY', 'SGD', 'KRW'] as const;
export const CATEGORIES = ['food', 'transport', 'stay', 'groceries', 'fun', 'other'] as const;
export const PAYMENT_METHODS = ['GCash', 'Maya', 'Bank', 'Other'] as const;
export const EVENT_EMOJIS = [
  '🏖️',
  '🍜',
  '🎉',
  '🏔️',
  '✈️',
  '🍻',
  '🎤',
  '🛒',
  '🏠',
  '🎂',
  '🚗',
  '💼',
] as const;
export const AVATAR_EMOJIS = [
  '🐱',
  '🐶',
  '🐰',
  '🐻',
  '🐼',
  '🐨',
  '🦊',
  '🐸',
  '🐧',
  '🐹',
  '🦄',
  '🐙',
] as const;
export const AVATAR_COLORS = [
  '#FFC8DD',
  '#BDF0D8',
  '#D9CCFF',
  '#FFF1B8',
  '#CDE9FF',
  '#FFD6C2',
  '#E3F5B8',
  '#F9D5F5',
] as const;

export const LIMITS = {
  people: 30,
  expenses: 300,
  payments: 300,
  itemsPerExpense: 50,
  eventName: 40,
  personName: 30,
  paymentValue: 40,
  expenseTitle: 50,
  itemName: 40,
  qty: 99,
  maxServiceBps: 5000,
  /** Largest minor-unit amount anywhere (₱10,000,000.00 in centavos). */
  maxMinor: 10_000_000 * 100,
} as const;

export const SCHEMA_VERSION = 1;

const IdSchema = z.string().regex(/^[A-Za-z0-9_-]{1,24}$/, 'Invalid id');
const MinorSchema = z.number().int().min(0).max(LIMITS.maxMinor);
const PositiveMinorSchema = MinorSchema.min(1);
const TimestampSchema = z.number().int().min(0).max(8.64e15);
const IsoDateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Expected YYYY-MM-DD');
const trimmed = (max: number) => z.string().trim().max(max);

export const CurrencySchema = z.enum(CURRENCIES);
export const CategorySchema = z.enum(CATEGORIES);

export const PaymentHandleSchema = z.object({
  method: z.enum(PAYMENT_METHODS),
  value: trimmed(LIMITS.paymentValue).min(1),
});

export const PersonSchema = z.object({
  id: IdSchema,
  name: trimmed(LIMITS.personName).min(1),
  emoji: z.enum(AVATAR_EMOJIS),
  color: z.enum(AVATAR_COLORS),
  payment: PaymentHandleSchema.optional(),
});

export const ItemSchema = z.object({
  id: IdSchema,
  name: trimmed(LIMITS.itemName),
  unitPrice: PositiveMinorSchema,
  qty: z.number().int().min(1).max(LIMITS.qty),
  sharedBy: z.array(IdSchema).min(1).max(LIMITS.people),
});

const ExpenseBaseSchema = z.object({
  id: IdSchema,
  title: trimmed(LIMITS.expenseTitle),
  category: CategorySchema,
  paidBy: IdSchema,
  date: IsoDateSchema,
  createdAt: TimestampSchema,
});

export const EqualExpenseSchema = ExpenseBaseSchema.extend({
  mode: z.literal('equal'),
  amount: PositiveMinorSchema,
  participants: z.array(IdSchema).min(1).max(LIMITS.people),
});

export const ItemizedExpenseSchema = ExpenseBaseSchema.extend({
  mode: z.literal('itemized'),
  items: z.array(ItemSchema).min(1).max(LIMITS.itemsPerExpense),
  serviceChargeBps: z.number().int().min(0).max(LIMITS.maxServiceBps),
  tip: MinorSchema,
  discount: MinorSchema,
});

export const ExpenseSchema = z.discriminatedUnion('mode', [
  EqualExpenseSchema,
  ItemizedExpenseSchema,
]);

export const PaymentSchema = z.object({
  id: IdSchema,
  from: IdSchema,
  to: IdSchema,
  amount: PositiveMinorSchema,
  paidAt: TimestampSchema,
});

const EventShapeSchema = z.object({
  v: z.literal(SCHEMA_VERSION),
  id: IdSchema,
  name: trimmed(LIMITS.eventName).min(1),
  emoji: z.enum(EVENT_EMOJIS),
  currency: CurrencySchema,
  people: z.array(PersonSchema).min(1).max(LIMITS.people),
  expenses: z.array(ExpenseSchema).max(LIMITS.expenses),
  payments: z.array(PaymentSchema).max(LIMITS.payments),
  createdAt: TimestampSchema,
  updatedAt: TimestampSchema,
});

/** The full event schema, including cross-references between people, expenses and payments. */
export const KkbEventSchema = EventShapeSchema.superRefine((event, ctx) => {
  const ids = new Set<string>();
  for (const person of event.people) {
    if (ids.has(person.id))
      ctx.addIssue({ code: 'custom', message: `Duplicate person ${person.id}` });
    ids.add(person.id);
  }
  const known = (id: string, path: (string | number)[]) => {
    if (!ids.has(id)) ctx.addIssue({ code: 'custom', message: `Unknown person ${id}`, path });
  };
  const unique = (list: string[], path: (string | number)[]) => {
    if (new Set(list).size !== list.length)
      ctx.addIssue({ code: 'custom', message: 'Duplicate person in list', path });
  };

  event.expenses.forEach((expense, i) => {
    known(expense.paidBy, ['expenses', i, 'paidBy']);
    if (expense.mode === 'equal') {
      expense.participants.forEach((id) => known(id, ['expenses', i, 'participants']));
      unique(expense.participants, ['expenses', i, 'participants']);
      return;
    }
    expense.items.forEach((item, j) => {
      item.sharedBy.forEach((id) => known(id, ['expenses', i, 'items', j]));
      unique(item.sharedBy, ['expenses', i, 'items', j]);
    });
    const b = itemizedBreakdown(expense, []);
    if (expense.discount > b.subtotal + b.service + expense.tip) {
      ctx.addIssue({ code: 'custom', message: 'Discount exceeds bill', path: ['expenses', i] });
    }
    if (b.total > LIMITS.maxMinor) {
      ctx.addIssue({ code: 'custom', message: 'Expense too large', path: ['expenses', i] });
    }
  });

  event.payments.forEach((payment, i) => {
    known(payment.from, ['payments', i, 'from']);
    known(payment.to, ['payments', i, 'to']);
    if (payment.from === payment.to) {
      ctx.addIssue({ code: 'custom', message: 'Payment to self', path: ['payments', i] });
    }
  });
});

export type Id = string;
export type Minor = number;
export type CurrencyCode = z.infer<typeof CurrencySchema>;
export type Category = z.infer<typeof CategorySchema>;
export type PaymentMethod = (typeof PAYMENT_METHODS)[number];
export type PaymentHandle = z.infer<typeof PaymentHandleSchema>;
export type AvatarEmoji = (typeof AVATAR_EMOJIS)[number];
export type AvatarColor = (typeof AVATAR_COLORS)[number];
export type EventEmoji = (typeof EVENT_EMOJIS)[number];
export type Person = z.infer<typeof PersonSchema>;
export type Item = z.infer<typeof ItemSchema>;
export type EqualExpense = z.infer<typeof EqualExpenseSchema>;
export type ItemizedExpense = z.infer<typeof ItemizedExpenseSchema>;
export type Expense = z.infer<typeof ExpenseSchema>;
export type Payment = z.infer<typeof PaymentSchema>;
export type KkbEvent = z.infer<typeof KkbEventSchema>;

export const CATEGORY_META: Record<Category, { label: string; emoji: string }> = {
  food: { label: 'Food', emoji: '🍜' },
  transport: { label: 'Transport', emoji: '🚕' },
  stay: { label: 'Stay', emoji: '🏠' },
  groceries: { label: 'Groceries', emoji: '🛒' },
  fun: { label: 'Fun', emoji: '🎉' },
  other: { label: 'Other', emoji: '📦' },
};
