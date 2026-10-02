import { useNetInfo } from '@react-native-community/netinfo';
import { isOffline } from '@/lib/network';

// True while the device has no usable internet connection. Updates by
// itself when the connection drops or comes back.
export function useIsOffline() {
  return isOffline(useNetInfo());
}
