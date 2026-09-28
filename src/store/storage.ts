/**
 * localStorage wrapped in try/catch. If storage is unavailable (private mode, blocked cookies),
 * everything keeps working in memory and `storageStatus.available` is false so the UI can say so.
 */

const memory = new Map<string, string>();

export const storageStatus = {
  available: probe(),
  /** Set when stored data could not be read and was backed up under `kkb:backup:<timestamp>`. */
  recoveredBackupKey: null as string | null,
};

function probe(): boolean {
  try {
    const key = 'kkb:probe';
    window.localStorage.setItem(key, '1');
    window.localStorage.removeItem(key);
    return true;
  } catch {
    return false;
  }
}

export const safeStorage = {
  getItem(key: string): string | null {
    if (!storageStatus.available) return memory.get(key) ?? null;
    try {
      return window.localStorage.getItem(key);
    } catch {
      return memory.get(key) ?? null;
    }
  },
  setItem(key: string, value: string): void {
    memory.set(key, value);
    if (!storageStatus.available) return;
    try {
      window.localStorage.setItem(key, value);
    } catch {
      // Quota exceeded or storage revoked: the in-memory copy keeps the app working.
    }
  },
  removeItem(key: string): void {
    memory.delete(key);
    if (!storageStatus.available) return;
    try {
      window.localStorage.removeItem(key);
    } catch {
      // Ignore: nothing else to do.
    }
  },
};

/** Saves an unreadable raw value so it is never lost silently, and returns the backup key. */
export function backupRaw(raw: string, now = Date.now()): string {
  const key = `kkb:backup:${now}`;
  safeStorage.setItem(key, raw);
  storageStatus.recoveredBackupKey = key;
  return key;
}
