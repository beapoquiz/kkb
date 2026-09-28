import { AVATAR_COLORS, AVATAR_EMOJIS, type Id, type KkbEvent, type Person } from './schema';
import { expenseParticipants } from './split';

/** The next avatar in the cycle, based on how many people are already in the list. */
export function nextAvatar(people: Pick<Person, 'emoji' | 'color'>[]) {
  const i = people.length;
  return {
    emoji: AVATAR_EMOJIS[i % AVATAR_EMOJIS.length],
    color: AVATAR_COLORS[i % AVATAR_COLORS.length],
  };
}

export function normalizeName(name: string): string {
  return name.trim().replace(/\s+/g, ' ');
}

/** Case-insensitive duplicate check. `exceptId` skips the person being renamed. */
export function findDuplicate(people: Person[], name: string, exceptId?: Id): Person | undefined {
  const wanted = normalizeName(name).toLowerCase();
  return people.find((p) => p.id !== exceptId && p.name.toLowerCase() === wanted);
}

/** How many expenses and payments involve this person (as payer, participant or in a payment). */
export function personUsage(event: KkbEvent, personId: Id): { expenses: number; payments: number } {
  const expenses = event.expenses.filter(
    (e) => e.paidBy === personId || expenseParticipants(e).includes(personId),
  ).length;
  const payments = event.payments.filter((p) => p.from === personId || p.to === personId).length;
  return { expenses, payments };
}

/** A stable pastel for an event card stripe, derived from its id. */
export function eventColor(eventId: Id): string {
  let hash = 0;
  for (const ch of eventId) hash = (hash * 31 + ch.charCodeAt(0)) >>> 0;
  return AVATAR_COLORS[hash % AVATAR_COLORS.length];
}
