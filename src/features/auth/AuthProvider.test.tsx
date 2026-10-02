import { describe, expect, it, jest } from '@jest/globals';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook } from '@testing-library/react-native';
import React, { ReactNode } from 'react';
import { AuthProvider, useSession } from '@/features/auth/AuthProvider';

type Listener = (event: string, session: unknown) => void;
let mockEmit: Listener = () => {};
const mockUnsubscribe = jest.fn();

jest.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      onAuthStateChange: (listener: Listener) => {
        mockEmit = listener;
        return { data: { subscription: { unsubscribe: mockUnsubscribe } } };
      },
    },
  },
}));

const session = (userId: string) => ({ user: { id: userId } });

async function setup() {
  // gcTime Infinity: no garbage-collection timers left running after a test.
  const client = new QueryClient({
    defaultOptions: { queries: { gcTime: Infinity } },
  });
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={client}>
      <AuthProvider>{children}</AuthProvider>
    </QueryClientProvider>
  );
  const hook = await renderHook(() => useSession(), { wrapper });
  return { client, hook };
}

describe('AuthProvider', () => {
  it('is loading until the initial session arrives', async () => {
    const { hook } = await setup();
    expect(hook.result.current.isLoading).toBe(true);

    await act(() => mockEmit('INITIAL_SESSION', session('a')));
    expect(hook.result.current).toMatchObject({
      isLoading: false,
      session: session('a'),
    });
  });

  it('keeps cached data when the same user refreshes a token', async () => {
    const { client } = await setup();
    await act(() => mockEmit('INITIAL_SESSION', session('a')));
    client.setQueryData(['library'], 'a-data');

    await act(() => mockEmit('TOKEN_REFRESHED', session('a')));
    expect(client.getQueryData(['library'])).toBe('a-data');
  });

  it("drops one user's cached data on sign out", async () => {
    const { client } = await setup();
    await act(() => mockEmit('INITIAL_SESSION', session('a')));
    client.setQueryData(['library'], 'a-data');

    await act(() => mockEmit('SIGNED_OUT', null));
    expect(client.getQueryData(['library'])).toBeUndefined();
  });

  it('drops cached data when a different user signs in', async () => {
    const { client } = await setup();
    await act(() => mockEmit('INITIAL_SESSION', session('a')));
    client.setQueryData(['library'], 'a-data');

    await act(() => mockEmit('SIGNED_IN', session('b')));
    expect(client.getQueryData(['library'])).toBeUndefined();
  });

  it('unsubscribes on unmount', async () => {
    const { hook } = await setup();
    await act(() => hook.unmount());
    expect(mockUnsubscribe).toHaveBeenCalled();
  });
});
