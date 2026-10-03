import { useEffect, useState } from 'react';
import { Keyboard, KeyboardEvent, Platform } from 'react-native';

// Height of the on-screen keyboard on iOS (0 when hidden), with the
// keyboard's own slide animation applied to whatever layout depends on it.
// Android resizes the window for the keyboard itself, so this stays 0
// there and screens keep the system behaviour.
export function useKeyboardHeight() {
  const [height, setHeight] = useState(0);

  useEffect(() => {
    if (Platform.OS !== 'ios') {
      return;
    }
    const update = (event: KeyboardEvent, next: number) => {
      Keyboard.scheduleLayoutAnimation(event);
      setHeight(next);
    };
    const show = Keyboard.addListener('keyboardWillShow', event =>
      update(event, event.endCoordinates.height),
    );
    const hide = Keyboard.addListener('keyboardWillHide', event =>
      update(event, 0),
    );
    return () => {
      show.remove();
      hide.remove();
    };
  }, []);

  return height;
}
