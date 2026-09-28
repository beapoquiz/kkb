import { useCallback, useSyncExternalStore } from 'react';
import type { Id } from '../lib/schema';
import { safeStorage } from './storage';

/**
 * "Who are you?" is remembered per event under `kkb:identity:<eventId>`.
 * The special value "viewer" means "I'm just looking".
 */
export const VIEWER = 'viewer';

const key = (eventId: Id) => `kkb:identity:${eventId}`;
const listeners = new Set<() => void>();

export function getIdentity(eventId: Id): string | null {
  return safeStorage.getItem(key(eventId));
}

export function setIdentity(eventId: Id, personId: string | null): void {
  if (personId === null) safeStorage.removeItem(key(eventId));
  else safeStorage.setItem(key(eventId), personId);
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function useIdentity(eventId: Id): [string | null, (personId: string | null) => void] {
  const identity = useSyncExternalStore(subscribe, () => getIdentity(eventId));
  const update = useCallback(
    (personId: string | null) => setIdentity(eventId, personId),
    [eventId],
  );
  return [identity, update];
}
