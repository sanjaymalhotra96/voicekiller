import { getRandomBytes } from 'expo-crypto';
import * as SecureStore from 'expo-secure-store';
import { createMMKV } from 'react-native-mmkv';

// The encryption key is generated on first launch and kept in the system
// keychain (iOS Keychain / Android Keystore), so it never ships in the app.
const KEY_NAME = 'mmkv.secure.key';
const KEY_LENGTH = 32; // AES-256 allows up to 32 characters
const ALPHABET =
  'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';

function encryptionKey() {
  const existing = SecureStore.getItem(KEY_NAME);
  if (existing) {
    return existing;
  }
  const key = Array.from(
    getRandomBytes(KEY_LENGTH),
    b => ALPHABET[b % 64],
  ).join('');
  SecureStore.setItem(KEY_NAME, key);
  return key;
}

// Encrypted store for the Supabase session and the user's drafts.
export const secureStorage = createMMKV({
  id: 'secure',
  encryptionKey: encryptionKey(),
  encryptionType: 'AES-256',
});
