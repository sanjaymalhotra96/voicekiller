import { Platform } from 'react-native';
import Purchases, { LOG_LEVEL } from 'react-native-purchases';
import { config } from '@/config';
import { log } from '@/lib/logger';

// RevenueCat setup. Purchases belong to the Supabase user: the app user id
// is the Supabase user id, so the web API (via RevenueCat's webhook) and
// the app agree on who paid. AuthProvider calls setPurchasesUser whenever
// the signed-in user changes.

const apiKey = Platform.OS === 'ios' ? config.purchases.iosKey : config.purchases.androidKey;

// False until a key is set in .env.
const purchasesEnabled = !!apiKey;

let configured = false;

export async function setPurchasesUser(userId: string | undefined) {
  if (!purchasesEnabled) {
    return;
  }
  try {
    if (!configured) {
      if (__DEV__) {
        await Purchases.setLogLevel(LOG_LEVEL.WARN);
      }
      Purchases.configure({ apiKey, appUserID: userId ?? null });
      configured = true;
      return;
    }
    if (userId) {
      await Purchases.logIn(userId);
    } else if (!(await Purchases.isAnonymous())) {
      await Purchases.logOut();
    }
  } catch (error) {
    // Never block sign-in: purchases retry the next time they are used.
    log('purchases', 'could not set the RevenueCat user', error);
  }
}

// configure() has run (a key is set and AuthProvider reported a user).
export const purchasesReady = () => configured;
