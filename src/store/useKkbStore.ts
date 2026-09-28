import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { buildSampleTrip } from '../lib/fixtures/sampleTrip';
import { newId } from '../lib/id';
import { findDuplicate, nextAvatar, normalizeName, personUsage } from '../lib/people';
import {
  SCHEMA_VERSION,
  type CurrencyCode,
  type EventEmoji,
  type Expense,
  type Id,
  type KkbEvent,
  type Payment,
  type Person,
} from '../lib/schema';
import { persistStorage, STORE_KEY, type PersistedState } from './persistence';

export type NewPerson = Pick<Person, 'name'> & Partial<Pick<Person, 'emoji' | 'color'>>;

export type RemovePersonResult =
  | { ok: true }
  | { ok: false; reason: 'in_use'; expenses: number; payments: number }
  | { ok: false; reason: 'last_person' };

export interface KkbActions {
  createEvent(input: {
    name: string;
    emoji: EventEmoji;
    currency: CurrencyCode;
    people: NewPerson[];
  }): Id;
  updateEvent(eventId: Id, patch: Partial<Pick<KkbEvent, 'name' | 'emoji' | 'currency'>>): void;
  duplicateEvent(eventId: Id): Id | null;
  deleteEvent(eventId: Id): void;

  addPerson(eventId: Id, person: NewPerson): Id | null;
  updatePerson(eventId: Id, personId: Id, patch: Partial<Omit<Person, 'id'>>): void;
  removePerson(eventId: Id, personId: Id): RemovePersonResult;

  saveExpense(eventId: Id, expense: Expense): void;
  deleteExpense(eventId: Id, expenseId: Id): { expense: Expense; index: number } | null;
  restoreExpense(eventId: Id, expense: Expense, index: number): void;

  addPayment(eventId: Id, payment: Omit<Payment, 'id' | 'paidAt'>): Payment | null;
  removePayment(eventId: Id, paymentId: Id): void;

  loadSample(): Id;
  /** Saves an event from a share link, replacing any local copy with the same id. */
  importEvent(event: KkbEvent): void;

  setLastTab(eventId: Id, tab: string): void;
}

export type KkbState = PersistedState & KkbActions;

const now = () => Date.now();

function makePeople(people: NewPerson[]): Person[] {
  const result: Person[] = [];
  for (const p of people) {
    const avatar = nextAvatar(result);
    result.push({
      id: newId(),
      name: normalizeName(p.name),
      emoji: p.emoji ?? avatar.emoji,
      color: p.color ?? avatar.color,
    });
  }
  return result;
}

export const useKkbStore = create<KkbState>()(
  persist(
    (set, get) => {
      /** Applies `fn` to one event and bumps its `updatedAt`. No-op for unknown ids. */
      const patchEvent = (eventId: Id, fn: (e: KkbEvent) => KkbEvent) =>
        set((s) => {
          const event = s.events[eventId];
          if (!event) return s;
          return { events: { ...s.events, [eventId]: { ...fn(event), updatedAt: now() } } };
        });

      return {
        events: {},
        lastTab: {},
        lastPayer: {},

        createEvent({ name, emoji, currency, people }) {
          const id = newId();
          const t = now();
          const event: KkbEvent = {
            v: SCHEMA_VERSION,
            id,
            name: name.trim(),
            emoji,
            currency,
            people: makePeople(people),
            expenses: [],
            payments: [],
            createdAt: t,
            updatedAt: t,
          };
          set((s) => ({ events: { ...s.events, [id]: event } }));
          return id;
        },

        updateEvent(eventId, patch) {
          patchEvent(eventId, (e) => ({ ...e, ...patch, name: (patch.name ?? e.name).trim() }));
        },

        duplicateEvent(eventId) {
          const source = get().events[eventId];
          if (!source) return null;
          const id = newId();
          const t = now();
          const suffix = ' (copy)';
          const name = source.name.slice(0, 40 - suffix.length) + suffix;
          set((s) => ({
            events: { ...s.events, [id]: { ...source, id, name, createdAt: t, updatedAt: t } },
          }));
          return id;
        },

        deleteEvent(eventId) {
          set((s) => {
            const { [eventId]: _removed, ...events } = s.events;
            const { [eventId]: _tab, ...lastTab } = s.lastTab;
            const { [eventId]: _payer, ...lastPayer } = s.lastPayer;
            return { events, lastTab, lastPayer };
          });
        },

        addPerson(eventId, person) {
          const event = get().events[eventId];
          if (!event || findDuplicate(event.people, person.name)) return null;
          const avatar = nextAvatar(event.people);
          const created: Person = {
            id: newId(),
            name: normalizeName(person.name),
            emoji: person.emoji ?? avatar.emoji,
            color: person.color ?? avatar.color,
          };
          patchEvent(eventId, (e) => ({ ...e, people: [...e.people, created] }));
          return created.id;
        },

        updatePerson(eventId, personId, patch) {
          patchEvent(eventId, (e) => ({
            ...e,
            people: e.people.map((p) => {
              if (p.id !== personId) return p;
              const next = { ...p, ...patch };
              if (patch.name !== undefined) next.name = normalizeName(patch.name);
              if ('payment' in patch && !patch.payment) delete next.payment;
              return next;
            }),
          }));
        },

        removePerson(eventId, personId) {
          const event = get().events[eventId];
          if (!event) return { ok: true };
          if (event.people.length <= 1) return { ok: false, reason: 'last_person' };
          const usage = personUsage(event, personId);
          if (usage.expenses > 0 || usage.payments > 0) {
            return { ok: false, reason: 'in_use', ...usage };
          }
          patchEvent(eventId, (e) => ({ ...e, people: e.people.filter((p) => p.id !== personId) }));
          return { ok: true };
        },

        saveExpense(eventId, expense) {
          patchEvent(eventId, (e) => {
            const exists = e.expenses.some((x) => x.id === expense.id);
            const expenses = exists
              ? e.expenses.map((x) => (x.id === expense.id ? expense : x))
              : [...e.expenses, expense];
            return { ...e, expenses };
          });
          set((s) => ({ lastPayer: { ...s.lastPayer, [eventId]: expense.paidBy } }));
        },

        deleteExpense(eventId, expenseId) {
          const event = get().events[eventId];
          const index = event?.expenses.findIndex((x) => x.id === expenseId) ?? -1;
          if (!event || index === -1) return null;
          const expense = event.expenses[index];
          patchEvent(eventId, (e) => ({
            ...e,
            expenses: e.expenses.filter((x) => x.id !== expenseId),
          }));
          return { expense, index };
        },

        restoreExpense(eventId, expense, index) {
          patchEvent(eventId, (e) => {
            if (e.expenses.some((x) => x.id === expense.id)) return e;
            const expenses = [...e.expenses];
            expenses.splice(Math.min(index, expenses.length), 0, expense);
            return { ...e, expenses };
          });
        },

        addPayment(eventId, input) {
          if (!get().events[eventId] || input.amount <= 0 || input.from === input.to) return null;
          const payment: Payment = { ...input, id: newId(), paidAt: now() };
          patchEvent(eventId, (e) => ({ ...e, payments: [...e.payments, payment] }));
          return payment;
        },

        removePayment(eventId, paymentId) {
          patchEvent(eventId, (e) => ({
            ...e,
            payments: e.payments.filter((p) => p.id !== paymentId),
          }));
        },

        loadSample() {
          const id = newId();
          const event = buildSampleTrip({ eventId: id });
          set((s) => ({ events: { ...s.events, [id]: event } }));
          return id;
        },

        importEvent(event) {
          set((s) => ({ events: { ...s.events, [event.id]: event } }));
        },

        setLastTab(eventId, tab) {
          set((s) => ({ lastTab: { ...s.lastTab, [eventId]: tab } }));
        },
      };
    },
    {
      name: STORE_KEY,
      version: SCHEMA_VERSION,
      storage: persistStorage,
      partialize: (s): PersistedState => ({
        events: s.events,
        lastTab: s.lastTab,
        lastPayer: s.lastPayer,
      }),
    },
  ),
);

/** Events newest first. */
export function sortedEvents(events: Record<Id, KkbEvent>): KkbEvent[] {
  return Object.values(events).sort((a, b) => b.createdAt - a.createdAt);
}
