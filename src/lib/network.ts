import NetInfo, { NetInfoState } from '@react-native-community/netinfo';
import { focusManager, onlineManager } from '@tanstack/react-query';
import { AppState } from 'react-native';

// "Offline" = no network, or a network that is known not to reach the
// internet (captive Wi-Fi, no data). `isInternetReachable` is null while
// the check is still running; treat that as online so the app never
// flashes the offline screen on launch.
export const isOffline = (
  state: Pick<NetInfoState, 'isConnected' | 'isInternetReachable'>,
) => state.isConnected === false || state.isInternetReachable === false;

let started = false;

// Wires TanStack Query to the device: queries and mutations pause while
// offline (instead of failing) and resume on reconnect; data refetches
// when the app returns to the foreground. Call once at startup.
export function startNetworkSync() {
  if (started) {
    return;
  }
  started = true;

  onlineManager.setEventListener(setOnline =>
    NetInfo.addEventListener(state => setOnline(!isOffline(state))),
  );

  focusManager.setEventListener(setFocused => {
    const subscription = AppState.addEventListener('change', status =>
      setFocused(status === 'active'),
    );
    return () => subscription.remove();
  });
}

// Re-checks the connection now (the offline screen's Retry button).
export async function recheckConnection() {
  return !isOffline(await NetInfo.refresh());
}
