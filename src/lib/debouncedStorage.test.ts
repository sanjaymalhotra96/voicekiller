import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals';
import { AppState } from 'react-native';
import { createDebouncedStorage } from '@/lib/debouncedStorage';

const makeStore = () => {
  const data = new Map<string, string>();
  return {
    data,
    set: jest.fn((key: string, value: string) => {
      data.set(key, value);
    }),
    getString: (key: string) => data.get(key),
    remove: (key: string) => data.delete(key),
  };
};

beforeEach(() => {
  jest.useFakeTimers();
});
afterEach(() => {
  jest.useRealTimers();
});

describe('createDebouncedStorage', () => {
  it('writes once after changes settle', () => {
    const store = makeStore();
    const storage = createDebouncedStorage(store, 500);

    storage.setItem('k', 'a');
    storage.setItem('k', 'ab');
    storage.setItem('k', 'abc');
    expect(store.set).not.toHaveBeenCalled();
    // Reads see the pending value straight away.
    expect(storage.getItem('k')).toBe('abc');

    jest.advanceTimersByTime(500);
    expect(store.set).toHaveBeenCalledTimes(1);
    expect(store.data.get('k')).toBe('abc');
  });

  it('flushes pending writes when the app goes to the background', () => {
    const store = makeStore();
    const listeners: ((state: string) => void)[] = [];
    jest
      .spyOn(AppState, 'addEventListener')
      .mockImplementation((_type, listener) => {
        listeners.push(listener as (state: string) => void);
        return { remove: () => {} };
      });
    const storage = createDebouncedStorage(store, 500);

    storage.setItem('k', 'draft');
    listeners.forEach(listener => listener('background'));
    expect(store.data.get('k')).toBe('draft');
  });

  it('removes pending and stored values', () => {
    const store = makeStore();
    store.data.set('k', 'old');
    const storage = createDebouncedStorage(store, 500);

    storage.setItem('k', 'new');
    storage.removeItem('k');
    jest.advanceTimersByTime(500);
    expect(storage.getItem('k')).toBeNull();
  });
});
