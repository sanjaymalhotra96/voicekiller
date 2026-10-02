import { useNavigation } from 'expo-router';
import {
  NavigationAction,
  usePreventRemove,
} from 'expo-router/react-navigation';
import { useState } from 'react';

type Options = {
  // Throw away the edits (e.g. form.reset()).
  onDiscard: () => void;
  // Save, then call `leave()` once saved.
  onSave: (leave: () => void) => void;
};

// Stops navigation away from a screen with unsaved changes and exposes
// what a "Save changes?" dialog needs. Works for back button, gestures
// and hardware back.
export function useUnsavedChangesGuard(
  isDirty: boolean,
  { onDiscard, onSave }: Options,
) {
  const navigation = useNavigation();
  // The navigation the user attempted, replayed after they choose.
  const [pending, setPending] = useState<NavigationAction | null>(null);

  usePreventRemove(isDirty, ({ data }) => setPending(data.action));

  const leave = (action: NavigationAction) => {
    setPending(null);
    navigation.dispatch(action);
  };

  return {
    visible: pending !== null,
    cancel: () => setPending(null),
    discard: () => {
      if (pending) {
        onDiscard();
        leave(pending);
      }
    },
    save: () => {
      const action = pending;
      if (action) {
        onSave(() => leave(action));
      }
    },
  };
}
