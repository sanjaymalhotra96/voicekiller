// Debug logging, dev builds only. View on device with:
//   adb logcat -s ReactNativeJS
// or in the Metro terminal.
type Scope = 'storage' | 'links';

export const log = (scope: Scope, message: string, data?: unknown) => {
  if (__DEV__) {
    console.log(`[${scope}] ${message}`, data ?? '');
  }
};
