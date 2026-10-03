import { Keyboard } from 'react-native';

// Use as `onStartShouldSetResponder` on a container. A touch that no
// control inside claims (blank space, labels, headers) puts the keyboard
// away. It answers `false`, so it never takes the touch: lists still
// scroll, buttons still press and inputs still focus. Same on iOS and
// Android.
export function dismissKeyboardOnBlankTouch() {
  Keyboard.dismiss();
  return false;
}
