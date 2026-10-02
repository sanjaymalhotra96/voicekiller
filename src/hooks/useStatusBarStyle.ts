import { useFocusEffect } from 'expo-router';
import { useCallback } from 'react';
import { StatusBar, StatusBarStyle } from 'react-native';

// Status bar style while this screen is focused; the previous style comes
// back when it loses focus (e.g. light icons on the dark editor).
export function useStatusBarStyle(style: StatusBarStyle) {
  useFocusEffect(
    useCallback(() => {
      const entry = StatusBar.pushStackEntry({ barStyle: style, animated: true });
      return () => StatusBar.popStackEntry(entry);
    }, [style]),
  );
}
