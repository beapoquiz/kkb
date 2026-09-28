import type { PersistStorage, StorageValue } from 'zustand/middleware';
import { KkbEventSchema, SCHEMA_VERSION, type KkbEvent } from '../lib/schema';
import { backupRaw, safeStorage } from './storage';

export const STORE_KEY = 'kkb:store';

/** The persisted part of the store. */
export interface PersistedState {
  events: Record<string, KkbEvent>;
  lastTab: Record<string, string>;
  lastPayer: Record<string, string>;
}

/**
 * Migrations keyed on the stored version. Version 1 is the first release, so there is nothing to
 * migrate yet; a future v2 adds `2: (state) => …` here and bumps SCHEMA_VERSION.
 */
const migrations: Record<number, (state: unknown) => unknown> = {};

export function migrate(persisted: unknown, fromVersion: number): unknown {
  let state = persisted;
  for (let v = fromVersion + 1; v <= SCHEMA_VERSION; v++) {
    const step = migrations[v];
    if (step) state = step(state);
  }
  return state;
}

/**
 * Validates stored state. Events that fail validation are dropped from the live state, but the
 * raw stored string is backed up first so nothing is lost silently.
 */
export function sanitize(raw: string, value: unknown): PersistedState {
  const empty: PersistedState = { events: {}, lastTab: {}, lastPayer: {} };
  if (typeof value !== 'object' || value === null) {
    backupRaw(raw);
    return empty;
  }
  const v = value as Partial<Record<keyof PersistedState, unknown>>;
  const events: Record<string, KkbEvent> = {};
  let dropped = false;
  if (typeof v.events === 'object' && v.events !== null) {
    for (const candidate of Object.values(v.events)) {
      const parsed = KkbEventSchema.safeParse(candidate);
      if (parsed.success) events[parsed.data.id] = parsed.data;
      else dropped = true;
    }
  } else if (v.events !== undefined) {
    dropped = true;
  }
  if (dropped) backupRaw(raw);
  const strings = (x: unknown): Record<string, string> =>
    typeof x === 'object' && x !== null
      ? Object.fromEntries(
          Object.entries(x).filter((e): e is [string, string] => typeof e[1] === 'string'),
        )
      : {};
  return { events, lastTab: strings(v.lastTab), lastPayer: strings(v.lastPayer) };
}

/** A zustand PersistStorage that never throws and backs up anything it can't read. */
export const persistStorage: PersistStorage<PersistedState> = {
  getItem(name) {
    const raw = safeStorage.getItem(name);
    if (raw === null) return null;
    try {
      const parsed = JSON.parse(raw) as { state?: unknown; version?: unknown };
      const version = typeof parsed.version === 'number' ? parsed.version : 0;
      const state = sanitize(raw, migrate(parsed.state, version));
      return { state, version: SCHEMA_VERSION } satisfies StorageValue<PersistedState>;
    } catch {
      backupRaw(raw);
      return null;
    }
  },
  setItem(name, value) {
    safeStorage.setItem(name, JSON.stringify(value));
  },
  removeItem(name) {
    safeStorage.removeItem(name);
  },
};
