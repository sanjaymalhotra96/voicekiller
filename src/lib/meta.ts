import { AppState, Platform } from 'react-native';
import { AppEventsLogger, Settings } from 'react-native-fbsdk-next';
import Purchases from 'react-native-purchases';
import {
  getTrackingPermissionsAsync,
  requestTrackingPermissionsAsync,
} from 'expo-tracking-transparency';
import { config } from '@/config';
import { log } from '@/lib/logger';

let initialization: Promise<void> | undefined;

async function waitUntilActive() {
  if (AppState.currentState === 'active') return;
  await new Promise<void>(resolve => {
    const listener = AppState.addEventListener('change', state => {
      if (state === 'active') {
        listener.remove();
        resolve();
      }
    });
  });
}

// Only explicit signup/sign-in actions request ATT. Background attribution
// and purchase syncs read the existing choice without showing a prompt.
export async function requestMetaTrackingPermission(): Promise<void> {
  if (Platform.OS !== 'ios' || !config.meta.clientToken) return;
  try {
    await waitUntilActive();
    await requestTrackingPermissionsAsync();
  } catch (error) {
    // Permission errors must not prevent authentication either.
    log('tracking', 'could not request tracking permission', error);
  }
}

// Native auto-init and purchase logging stay off. Initializing the SDK
// never requests permission; only an existing ATT grant enables tracking.
export async function initializeMetaTracking(): Promise<boolean> {
  if (!config.meta.clientToken || Platform.OS === 'web') return false;
  try {
    initialization ??= (async () => {
      await waitUntilActive();
      Settings.setAppID(config.meta.appId);
      Settings.setClientToken(config.meta.clientToken);
      Settings.initializeSDK();
    })();
    await initialization;
    const allowed =
      Platform.OS !== 'ios' || (await getTrackingPermissionsAsync()).granted;
    Settings.setAdvertiserIDCollectionEnabled(allowed);
    if (Platform.OS === 'ios') {
      await Settings.setAdvertiserTrackingEnabled(allowed);
    }
    return allowed;
  } catch (error) {
    log('tracking', 'could not initialize Meta tracking', error);
    return false;
  }
}

// Call after RevenueCat identifies the user and before a store purchase.
// RevenueCat uses these identifiers when forwarding subscription events.
export async function syncMetaAttribution(userId: string | null) {
  try {
    const allowed = await initializeMetaTracking();
    if (!config.meta.clientToken || Platform.OS === 'web') return;
    AppEventsLogger.setUserID(allowed ? userId : null);
    await Purchases.setFBAnonymousID(
      allowed ? await AppEventsLogger.getAnonymousID() : null,
    );
    if (allowed) {
      await Purchases.collectDeviceIdentifiers();
    }
  } catch (error) {
    log('tracking', 'could not link Meta attribution to RevenueCat', error);
  }
}

export async function trackSignup(
  userId: string,
  method: 'email' | 'google' | 'apple',
) {
  try {
    if (!(await initializeMetaTracking())) return;
    AppEventsLogger.setUserID(userId);
    AppEventsLogger.logEvent(AppEventsLogger.AppEvents.CompletedRegistration, {
      [AppEventsLogger.AppEventParams.RegistrationMethod]: method,
    });
  } catch (error) {
    log('tracking', 'could not log signup', error);
  }
}
