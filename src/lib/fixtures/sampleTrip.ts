import { shiftIsoDate, todayIso } from '../dates';
import type { KkbEvent } from '../schema';

/** The "Baguio Barkada Trip" from docs/06-sample-trip.md. Used by the demo and by tests. */

export const SAMPLE_IDS = {
  bea: 'bea',
  migs: 'migs',
  janna: 'janna',
  carlo: 'carlo',
} as const;

const { bea, migs, janna, carlo } = SAMPLE_IDS;
const all = [bea, migs, janna, carlo];

export function buildSampleTrip(options: { now?: number; eventId?: string } = {}): KkbEvent {
  const now = options.now ?? Date.now();
  const today = todayIso(now);
  const day = (offset: number) => shiftIsoDate(today, offset);
  const hour = 3_600_000;

  return {
    v: 1,
    id: options.eventId ?? 'sample-baguio',
    name: 'Baguio Barkada Trip',
    emoji: '🏔️',
    currency: 'PHP',
    people: [
      {
        id: bea,
        name: 'Bea',
        emoji: '🐰',
        color: '#FFC8DD',
        payment: { method: 'GCash', value: '0917 000 0001' },
      },
      {
        id: migs,
        name: 'Migs',
        emoji: '🐻',
        color: '#BDF0D8',
        payment: { method: 'Maya', value: '0918 000 0002' },
      },
      { id: janna, name: 'Janna', emoji: '🦊', color: '#D9CCFF' },
      { id: carlo, name: 'Carlo', emoji: '🐼', color: '#FFF1B8' },
    ],
    expenses: [
      {
        id: 'e1-bus',
        mode: 'equal',
        title: 'Bus to Baguio',
        category: 'transport',
        paidBy: migs,
        date: day(-3),
        createdAt: now - 72 * hour,
        amount: 296000,
        participants: all,
      },
      {
        id: 'e2-airbnb',
        mode: 'equal',
        title: 'Airbnb (2 nights)',
        category: 'stay',
        paidBy: bea,
        date: day(-3),
        createdAt: now - 71 * hour,
        amount: 750000,
        participants: all,
      },
      {
        id: 'e3-dinner',
        mode: 'itemized',
        title: 'Dinner on Session Road',
        category: 'food',
        paidBy: carlo,
        date: day(-2),
        createdAt: now - 48 * hour,
        items: [
          { id: 'i1', name: 'Pinikpikan', unitPrice: 45000, qty: 1, sharedBy: all },
          { id: 'i2', name: 'Strawberry shake', unitPrice: 15000, qty: 2, sharedBy: [bea, janna] },
          { id: 'i3', name: 'Beef salpicao', unitPrice: 38000, qty: 1, sharedBy: [migs, carlo] },
          { id: 'i4', name: 'Plain rice', unitPrice: 4000, qty: 4, sharedBy: all },
          { id: 'i5', name: 'Ube cheesecake', unitPrice: 21000, qty: 1, sharedBy: [janna] },
        ],
        serviceChargeBps: 1000,
        tip: 0,
        discount: 0,
      },
      {
        id: 'e4-strawberry',
        mode: 'equal',
        title: 'Strawberry picking',
        category: 'fun',
        paidBy: janna,
        date: day(-1),
        createdAt: now - 24 * hour,
        amount: 100000,
        participants: [bea, janna, carlo],
      },
    ],
    payments: [{ id: 'p1', from: janna, to: bea, amount: 50000, paidAt: now - 2 * hour }],
    createdAt: now - 72 * hour,
    updatedAt: now - 2 * hour,
  };
}
