import { compressToEncodedURIComponent, decompressFromEncodedURIComponent } from 'lz-string';
import { z } from 'zod';
import { fromEpochDay, isoDateToUtc, toEpochDay } from './dates';
import { KkbEventSchema, SCHEMA_VERSION, type Expense, type KkbEvent } from './schema';

/**
 * Share links carry the whole event: JSON with short keys → lz-string → URL hash.
 *
 * Compact shape (people are referenced by their index in `p`, which keeps links short):
 *   { v, i: id, n: name, m: emoji, c: currency, t: createdAt, u: updatedAt,
 *     p: [[id, name, emoji, color, payMethod | '', payValue | '']],
 *     e: [[id, title, category, payerIdx, date, 0, amount, [participantIdx]]         // equal
 *        | [id, title, category, payerIdx, date, 1, [[itemId, name, unitPrice, qty, [idx]]],
 *           serviceBps, tip, discount]],                                              // itemized
 *     y: [[id, fromIdx, toIdx, amount, epochDay]] }
 *
 * Expense `createdAt` is not stored (it is rebuilt from the date and list position), and payment
 * times are kept as whole days. `normalizeForShare` applies the same rounding to a local event.
 */

export const MAX_PAYLOAD_LENGTH = 20_000;
export const MAX_QR_URL_LENGTH = 2_000;

export type ShareError = 'too_large' | 'corrupt' | 'invalid' | 'newer_version';
export type ShareResult = { ok: true; event: KkbEvent } | { ok: false; error: ShareError };

const str = z.string().max(200);
const int = z.number().int();
const idx = int.min(0).max(1000);

const CompactPersonSchema = z.tuple([str, str, str, str, str, str]);
const CompactItemSchema = z.tuple([str, str, int, int, z.array(idx).max(100)]);
const CompactEqualSchema = z.tuple([
  str,
  str,
  str,
  idx,
  str,
  z.literal(0),
  int,
  z.array(idx).max(100),
]);
const CompactItemizedSchema = z.tuple([
  str,
  str,
  str,
  idx,
  str,
  z.literal(1),
  z.array(CompactItemSchema).max(100),
  int,
  int,
  int,
]);
const CompactPaymentSchema = z.tuple([str, idx, idx, int, int]);

const CompactEventSchema = z.object({
  v: int,
  i: str,
  n: str,
  m: str,
  c: str,
  t: int,
  u: int,
  p: z.array(CompactPersonSchema).max(100),
  e: z.array(z.union([CompactEqualSchema, CompactItemizedSchema])).max(1000),
  y: z.array(CompactPaymentSchema).max(1000),
});

type CompactEvent = z.infer<typeof CompactEventSchema>;
type CompactExpense = CompactEvent['e'][number];

export function toCompact(event: KkbEvent): CompactEvent {
  const index = new Map(event.people.map((p, i) => [p.id, i]));
  const ix = (id: string) => index.get(id) ?? -1;
  const expenses = event.expenses.map((e): CompactExpense => {
    if (e.mode === 'equal') {
      return [e.id, e.title, e.category, ix(e.paidBy), e.date, 0, e.amount, e.participants.map(ix)];
    }
    const items = e.items.map(
      (it) => [it.id, it.name, it.unitPrice, it.qty, it.sharedBy.map(ix)] as const,
    );
    return [
      e.id,
      e.title,
      e.category,
      ix(e.paidBy),
      e.date,
      1,
      items.map((it) => [...it]),
      e.serviceChargeBps,
      e.tip,
      e.discount,
    ];
  });
  return {
    v: event.v,
    i: event.id,
    n: event.name,
    m: event.emoji,
    c: event.currency,
    t: event.createdAt,
    u: event.updatedAt,
    p: event.people.map((p) => [
      p.id,
      p.name,
      p.emoji,
      p.color,
      p.payment?.method ?? '',
      p.payment?.value ?? '',
    ]),
    e: expenses,
    y: event.payments.map((p) => [p.id, ix(p.from), ix(p.to), p.amount, toEpochDay(p.paidAt)]),
  };
}

/** Expands the compact form. The result is still untrusted and must go through the full schema. */
export function fromCompact(c: CompactEvent): unknown {
  const ids = c.p.map((p) => p[0]);
  // An out-of-range index maps to '' which the schema rejects as an invalid id.
  const id = (i: number) => ids[i] ?? '';
  return {
    v: c.v,
    id: c.i,
    name: c.n,
    emoji: c.m,
    currency: c.c,
    createdAt: c.t,
    updatedAt: c.u,
    people: c.p.map(([pid, name, emoji, color, method, value]) => ({
      id: pid,
      name,
      emoji,
      color,
      ...(method || value ? { payment: { method, value } } : {}),
    })),
    expenses: c.e.map((e, position) => {
      const base = {
        id: e[0],
        title: e[1],
        category: e[2],
        paidBy: id(e[3]),
        date: e[4],
        createdAt: expenseCreatedAt(e[4], position),
      };
      if (e[5] === 0) {
        return { ...base, mode: 'equal', amount: e[6], participants: e[7].map(id) };
      }
      return {
        ...base,
        mode: 'itemized',
        items: e[6].map(([iid, name, unitPrice, qty, sharedBy]) => ({
          id: iid,
          name,
          unitPrice,
          qty,
          sharedBy: sharedBy.map(id),
        })),
        serviceChargeBps: e[7],
        tip: e[8],
        discount: e[9],
      };
    }),
    payments: c.y.map(([pid, from, to, amount, day]) => ({
      id: pid,
      from: id(from),
      to: id(to),
      amount,
      paidAt: fromEpochDay(day),
    })),
  };
}

function expenseCreatedAt(date: string, position: number): number {
  const base = isoDateToUtc(date);
  return (Number.isFinite(base) ? base : 0) + position;
}

/** The event exactly as it will look after a share round trip. */
export function normalizeForShare(event: KkbEvent): KkbEvent {
  return {
    ...event,
    expenses: event.expenses.map((e, position): Expense => ({
      ...e,
      createdAt: expenseCreatedAt(e.date, position),
    })),
    payments: event.payments.map((p) => ({ ...p, paidAt: fromEpochDay(toEpochDay(p.paidAt)) })),
  };
}

export function encodeEvent(event: KkbEvent): string {
  return compressToEncodedURIComponent(JSON.stringify(toCompact(event)));
}

/** Decodes and validates an untrusted payload from a share link. */
export function decodeShare(payload: string): ShareResult {
  if (payload.length > MAX_PAYLOAD_LENGTH) return { ok: false, error: 'too_large' };
  let json: string | null;
  try {
    json = decompressFromEncodedURIComponent(payload);
  } catch {
    return { ok: false, error: 'corrupt' };
  }
  if (!json) return { ok: false, error: 'corrupt' };

  let raw: unknown;
  try {
    raw = JSON.parse(json);
  } catch {
    return { ok: false, error: 'corrupt' };
  }

  if (typeof raw === 'object' && raw !== null && 'v' in raw) {
    const v = (raw as { v: unknown }).v;
    if (typeof v === 'number' && v > SCHEMA_VERSION) return { ok: false, error: 'newer_version' };
  }
  const compact = CompactEventSchema.safeParse(raw);
  if (!compact.success) return { ok: false, error: 'invalid' };
  const event = KkbEventSchema.safeParse(fromCompact(compact.data));
  if (!event.success) return { ok: false, error: 'invalid' };
  return { ok: true, event: event.data };
}

/** `https://…/kkb/#/s/<payload>`. `base` defaults to the current origin + Vite base path. */
export function buildShareUrl(event: KkbEvent, base = defaultBase()): string {
  return `${base}#/s/${encodeEvent(event)}`;
}

function defaultBase(): string {
  if (typeof window === 'undefined') return '/';
  return `${window.location.origin}${import.meta.env.BASE_URL}`;
}
