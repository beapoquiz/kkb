import { computeBalances } from '../lib/balances';
import { SAMPLE_IDS, buildSampleTrip } from '../lib/fixtures/sampleTrip';
import type { EqualExpense } from '../lib/schema';
import { settleEvent } from '../lib/settle';
import { getIdentity, setIdentity } from './identity';
import { migrate, persistStorage, sanitize, STORE_KEY } from './persistence';
import { storageStatus } from './storage';
import { sortedEvents, useKkbStore } from './useKkbStore';

const store = () => useKkbStore.getState();

function createDinner() {
  return store().createEvent({
    name: '  Samgyup Friday ',
    emoji: '🍻',
    currency: 'PHP',
    people: [{ name: 'Bea' }, { name: 'Migs' }, { name: 'Janna' }],
  });
}

function expense(id: string, paidBy: string, participants: string[], amount = 30000): EqualExpense {
  return {
    id,
    mode: 'equal',
    title: 'Meat',
    category: 'food',
    paidBy,
    date: '2026-09-29',
    createdAt: 1,
    amount,
    participants,
  };
}

beforeEach(() => {
  window.localStorage.clear();
  useKkbStore.setState({ events: {}, lastTab: {}, lastPayer: {} });
  storageStatus.recoveredBackupKey = null;
});

describe('events', () => {
  it('creates an event with auto avatars', () => {
    const id = createDinner();
    const event = store().events[id];
    expect(event.name).toBe('Samgyup Friday');
    expect(event.people.map((p) => [p.name, p.emoji, p.color])).toEqual([
      ['Bea', '🐱', '#FFC8DD'],
      ['Migs', '🐶', '#BDF0D8'],
      ['Janna', '🐰', '#D9CCFF'],
    ]);
  });

  it('renames, duplicates and deletes', () => {
    const id = createDinner();
    store().updateEvent(id, { name: 'Samgyup Saturday', emoji: '🎉' });
    expect(store().events[id]).toMatchObject({ name: 'Samgyup Saturday', emoji: '🎉' });

    const copy = store().duplicateEvent(id);
    expect(copy).not.toBeNull();
    expect(store().events[copy ?? '']?.name).toBe('Samgyup Saturday (copy)');
    expect(store().duplicateEvent('missing')).toBeNull();

    store().setLastTab(id, 'settle');
    store().deleteEvent(id);
    expect(store().events[id]).toBeUndefined();
    expect(store().lastTab[id]).toBeUndefined();
    expect(Object.keys(store().events)).toEqual([copy]);
  });

  it('sorts events newest first', () => {
    const a = buildSampleTrip({ eventId: 'a', now: 1_000_000 });
    const b = buildSampleTrip({ eventId: 'b', now: 9_000_000 });
    expect(sortedEvents({ a, b }).map((e) => e.id)).toEqual(['b', 'a']);
  });
});

describe('people', () => {
  it('adds people and blocks duplicate names', () => {
    const id = createDinner();
    expect(store().addPerson(id, { name: 'Carlo' })).toEqual(expect.any(String));
    expect(store().addPerson(id, { name: ' carlo ' })).toBeNull();
    expect(store().events[id].people).toHaveLength(4);
  });

  it('updates a payment handle and can clear it', () => {
    const id = createDinner();
    const bea = store().events[id].people[0].id;
    store().updatePerson(id, bea, { payment: { method: 'GCash', value: '0917' } });
    expect(store().events[id].people[0].payment).toEqual({ method: 'GCash', value: '0917' });
    store().updatePerson(id, bea, { payment: undefined });
    expect(store().events[id].people[0]).not.toHaveProperty('payment');
  });

  it('blocks removing someone who is part of an expense', () => {
    const id = createDinner();
    const [bea, migs, janna] = store().events[id].people.map((p) => p.id);
    store().saveExpense(id, expense('e1', bea, [bea, migs]));
    expect(store().removePerson(id, migs)).toEqual({
      ok: false,
      reason: 'in_use',
      expenses: 1,
      payments: 0,
    });
    expect(store().removePerson(id, janna)).toEqual({ ok: true });
    expect(store().events[id].people).toHaveLength(2);
  });

  it('never removes the last person', () => {
    const id = store().createEvent({
      name: 'Solo',
      emoji: '🎉',
      currency: 'PHP',
      people: [{ name: 'Bea' }],
    });
    const bea = store().events[id].people[0].id;
    expect(store().removePerson(id, bea)).toEqual({ ok: false, reason: 'last_person' });
  });
});

describe('expenses and payments', () => {
  it('adds, edits, deletes and restores an expense in place', () => {
    const id = createDinner();
    const [bea, migs] = store().events[id].people.map((p) => p.id);
    store().saveExpense(id, expense('e1', bea, [bea, migs]));
    store().saveExpense(id, expense('e2', migs, [bea, migs]));
    store().saveExpense(id, { ...expense('e1', bea, [bea, migs]), title: 'Soju' });
    expect(store().events[id].expenses.map((e) => e.title)).toEqual(['Soju', 'Meat']);
    expect(store().lastPayer[id]).toBe(bea);

    const removed = store().deleteExpense(id, 'e1');
    expect(removed?.index).toBe(0);
    expect(store().events[id].expenses.map((e) => e.id)).toEqual(['e2']);
    if (!removed) throw new Error('expected removal');
    store().restoreExpense(id, removed.expense, removed.index);
    store().restoreExpense(id, removed.expense, removed.index); // undo twice is harmless
    expect(store().events[id].expenses.map((e) => e.id)).toEqual(['e1', 'e2']);
    expect(store().deleteExpense(id, 'missing')).toBeNull();
  });

  it('records payments that reduce balances, and can undo them', () => {
    const id = store().loadSample();
    const [first] = settleEvent(store().events[id]);
    const payment = store().addPayment(id, first);
    expect(payment).not.toBeNull();
    expect(settleEvent(store().events[id])).toHaveLength(2);

    store().removePayment(id, payment?.id ?? '');
    expect(settleEvent(store().events[id])).toHaveLength(3);
    expect(store().addPayment(id, { from: 'bea', to: 'bea', amount: 5 })).toBeNull();
    expect(store().addPayment(id, { from: 'bea', to: 'migs', amount: 0 })).toBeNull();
  });

  it('loads the sample trip with a fresh id each time', () => {
    const a = store().loadSample();
    const b = store().loadSample();
    expect(a).not.toBe(b);
    const balances = computeBalances(store().events[a]);
    expect(balances.find((r) => r.personId === SAMPLE_IDS.bea)?.balance).toBe(371891);
  });

  it('imports a shared event, replacing the local copy', () => {
    const shared = buildSampleTrip({ eventId: 'shared' });
    store().importEvent(shared);
    store().importEvent({ ...shared, name: 'Updated' });
    expect(store().events.shared.name).toBe('Updated');
  });
});

describe('persistence', () => {
  it('writes to localStorage and reads it back', () => {
    const id = createDinner();
    const raw = window.localStorage.getItem(STORE_KEY);
    expect(raw).toContain('Samgyup Friday');
    const loaded = persistStorage.getItem(STORE_KEY);
    expect(loaded && 'state' in loaded ? loaded.state.events[id].name : null).toBe(
      'Samgyup Friday',
    );
  });

  it('backs up corrupted JSON instead of losing it', () => {
    window.localStorage.setItem(STORE_KEY, '{oops');
    expect(persistStorage.getItem(STORE_KEY)).toBeNull();
    const backupKey = storageStatus.recoveredBackupKey;
    expect(backupKey).toMatch(/^kkb:backup:\d+$/);
    expect(window.localStorage.getItem(backupKey ?? '')).toBe('{oops');
  });

  it('drops invalid events but keeps valid ones (and backs up the raw data)', () => {
    const good = buildSampleTrip({ eventId: 'good' });
    const state = {
      events: { good, bad: { ...good, id: 'bad', people: [] } },
      lastTab: { good: 1 },
    };
    const result = sanitize('raw', state);
    expect(Object.keys(result.events)).toEqual(['good']);
    expect(result.lastTab).toEqual({});
    expect(storageStatus.recoveredBackupKey).not.toBeNull();
    expect(sanitize('raw', null).events).toEqual({});
  });

  it('has a migration hook that is a no-op for the current version', () => {
    const state = { events: {} };
    expect(migrate(state, 1)).toBe(state);
  });
});

describe('identity', () => {
  it('remembers who you are per event', () => {
    setIdentity('ev1', 'migs');
    expect(getIdentity('ev1')).toBe('migs');
    expect(window.localStorage.getItem('kkb:identity:ev1')).toBe('migs');
    expect(getIdentity('ev2')).toBeNull();
    setIdentity('ev1', null);
    expect(getIdentity('ev1')).toBeNull();
  });
});
