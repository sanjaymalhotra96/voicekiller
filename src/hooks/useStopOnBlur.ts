import { useFocusEffect } from 'expo-router';
import { useCallback, useRef } from 'react';

// Runs `stop` when the screen loses focus: a pushed screen, going back,
// the Android back button. Screens stay mounted under the next one, so
// without this their audio keeps playing over it.
export function useStopOnBlur(stop: () => void) {
  // Latest `stop`, without re-running the focus effect when it changes.
  const stopRef = useRef(stop);
  stopRef.current = stop;
  useFocusEffect(
    useCallback(
      () => () => {
        stopRef.current();
      },
      [],
    ),
  );
}
