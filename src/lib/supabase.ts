import 'react-native-url-polyfill/auto';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { AppState } from 'react-native';
import { config } from '@/config';
import type { Database } from '@/lib/database.types';
import { secureStorage } from '@/lib/storage';

const { url, anonKey } = config.supabase;
const missing = [
  !url && 'EXPO_PUBLIC_SUPABASE_URL',
  !anonKey && 'EXPO_PUBLIC_SUPABASE_ANON_KEY',
].filter(Boolean);
if (missing.length > 0) {
  throw new Error(
    `Missing Supabase config: set ${missing.join(' and ')} in .env, ` +
      'then restart Metro with: npx expo start --dev-client --clear',
  );
}

// Supabase persists its session through this adapter (encrypted MMKV).
const sessionStorage = {
  getItem: (key: string) => secureStorage.getString(key) ?? null,
  setItem: (key: string, value: string) => secureStorage.set(key, value),
  removeItem: (key: string) => {
    secureStorage.remove(key);
  },
};

export const supabase = createClient<Database>(url, anonKey, {
  auth: {
    storage: sessionStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// The tool tables (generated_files, speech_text...) are not described in
// database.types.ts, so they are read by name through this untyped view of
// the same client.
export const untypedSupabase = supabase as unknown as SupabaseClient;

// Refresh tokens only while the app is in the foreground.
AppState.addEventListener('change', state => {
  if (state === 'active') {
    supabase.auth.startAutoRefresh();
  } else {
    supabase.auth.stopAutoRefresh();
  }
});
