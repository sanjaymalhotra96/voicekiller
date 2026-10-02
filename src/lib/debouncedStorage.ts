import { AppState } from 'react-native';

// Minimal key-value store (MMKV instances match this).
type KeyValueStore = {
  getString(key: string): string | undefined;
  set(key: string, value: string): void;
  remove(key: string): boolean | void;
};

// zustand `StateStorage` that batches writes: a value is saved `delayMs`
// after its last change, so typing a long script does not serialise it on
// every keystroke. Pending writes are flushed when the app goes to the
// background, so nothing is lost if the OS kills it.
export function createDebouncedStorage(store: KeyValueStore, delayMs: number) {
  const pending = new Map<string, string>();
  let timer: ReturnType<typeof setTimeout> | null = null;

  const flush = () => {
    if (timer) {
      clearTimeout(timer);
      timer = null;
    }
    pending.forEach((value, key) => store.set(key, value));
    pending.clear();
  };

  AppState.addEventListener('change', state => {
    if (state !== 'active') {
      flush();
    }
  });

  return {
    getItem: (key: string) => pending.get(key) ?? store.getString(key) ?? null,
    setItem: (key: string, value: string) => {
      pending.set(key, value);
      if (timer) {
        clearTimeout(timer);
      }
      timer = setTimeout(flush, delayMs);
    },
    removeItem: (key: string) => {
      pending.delete(key);
      store.remove(key);
    },
    flush,
  };
}
