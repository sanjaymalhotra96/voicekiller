import { describe, expect, it, jest } from '@jest/globals';
import { isOffline } from '@/lib/network';

jest.mock('@react-native-community/netinfo', () =>
  require('@react-native-community/netinfo/jest/netinfo-mock.js'),
);

describe('isOffline', () => {
  it.each([
    [{ isConnected: true, isInternetReachable: true }, false],
    // Reachability still being checked: assume online (no flash on launch).
    [{ isConnected: true, isInternetReachable: null }, false],
    [{ isConnected: null, isInternetReachable: null }, false],
    // Connected to Wi-Fi that does not reach the internet.
    [{ isConnected: true, isInternetReachable: false }, true],
    [{ isConnected: false, isInternetReachable: null }, true],
  ])('%p -> %p', (state, expected) => {
    expect(isOffline(state)).toBe(expected);
  });
});
