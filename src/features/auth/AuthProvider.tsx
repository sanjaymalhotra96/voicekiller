import type { Session } from '@supabase/supabase-js';
import { useQueryClient } from '@tanstack/react-query';
import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import { setPurchasesUser } from '@/lib/purchases';
import { supabase } from '@/lib/supabase';
import { resetUserScope } from '@/lib/userScope';

type AuthState = {
  session: Session | null;
  // True until the stored session has been read from MMKV.
  isLoading: boolean;
};

const AuthContext = createContext<AuthState>({
  session: null,
  isLoading: true,
});

// Tracks the Supabase session for the whole app. Must sit inside
// QueryClientProvider: when the signed-in user changes (sign out, account
// deleted, another user signs in) every cached query and every
// user-scoped store (lib/userScope) is dropped, so one user's data is
// never shown to the next.
export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const userIdRef = useRef<string | undefined>(undefined);
  const [state, setState] = useState<AuthState>({
    session: null,
    isLoading: true,
  });

  useEffect(() => {
    // Fires INITIAL_SESSION right away with the stored session, then on
    // every change, so no separate getSession() call is needed.
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      const userId = session?.user.id;
      if (userId !== userIdRef.current) {
        if (userIdRef.current !== undefined) {
          queryClient.clear();
          resetUserScope();
        }
        userIdRef.current = userId;
        // Purchases follow the signed-in user (RevenueCat app user id).
        setPurchasesUser(userId);
      }
      setState({ session, isLoading: false });
    });
    return () => data.subscription.unsubscribe();
  }, [queryClient]);

  return <AuthContext.Provider value={state}>{children}</AuthContext.Provider>;
}

export const useSession = () => useContext(AuthContext);
