import * as StoreReview from 'expo-store-review';
import i18n from 'i18next';
import { Alert } from 'react-native';
import { log } from '@/lib/logger';
import { secureStorage } from '@/lib/storage';

const COUNT_KEY = 'review.successCount';
const DONE_KEY = 'review.done';
// Successful operations (speech generated, audio cleaned, ...) at which we
// ask. Saying No waits for the next one; after the last we stop asking.
const askAt = [2, 5, 10];
const lastAsk = askAt[askAt.length - 1];
// Let the result (player, sheet) show before the dialog covers it.
const delayMs = 1500;

// Call after an operation succeeds. At each count in `askAt` the user is
// asked "Do you like Voice Killer?"; Yes opens the native store review and
// never asks again, No does nothing.
export function recordSuccessfulOperation() {
  if (secureStorage.getBoolean(DONE_KEY)) {
    return;
  }
  const count = (secureStorage.getNumber(COUNT_KEY) ?? 0) + 1;
  if (count > lastAsk) {
    return;
  }
  secureStorage.set(COUNT_KEY, count);
  if (askAt.includes(count)) {
    setTimeout(askIfTheyLikeTheApp, delayMs);
  }
}

function askIfTheyLikeTheApp() {
  Alert.alert(
    i18n.t('review.title', { appName: i18n.t('common.appName') }),
    undefined,
    [
      { text: i18n.t('review.no'), style: 'cancel' },
      {
        text: i18n.t('review.yes'),
        onPress: () => {
          secureStorage.set(DONE_KEY, true);
          requestStoreReview();
        },
      },
    ],
  );
}

async function requestStoreReview() {
  try {
    // False when neither the native review sheet nor a store link is available.
    if (await StoreReview.hasAction()) {
      await StoreReview.requestReview();
    }
  } catch (error) {
    log('review', 'store review failed', error);
  }
}
