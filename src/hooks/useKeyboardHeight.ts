import { useEffect, useState } from 'react';
import { Keyboard, KeyboardEvent, Platform } from 'react-native';

// Height of the on-screen keyboard (0 when hidden). Android draws edge to
// edge, so the window is not resized for the keyboard; layouts that must
// stay above it (BottomSheet) use this on both platforms. iOS also gets
// the keyboard's own slide animation; Android only reports "did" events.
export function useKeyboardHeight() {
  const [height, setHeight] = useState(0);

  useEffect(() => {
    const ios = Platform.OS === 'ios';
    const update = (event: KeyboardEvent, next: number) => {
      if (ios) {
        Keyboard.scheduleLayoutAnimation(event);
      }
      setHeight(next);
    };
    const show = Keyboard.addListener(
      ios ? 'keyboardWillShow' : 'keyboardDidShow',
      event => update(event, event.endCoordinates.height),
    );
    const hide = Keyboard.addListener(
      ios ? 'keyboardWillHide' : 'keyboardDidHide',
      event => update(event, 0),
    );
    return () => {
      show.remove();
      hide.remove();
    };
  }, []);

  return height;
}
