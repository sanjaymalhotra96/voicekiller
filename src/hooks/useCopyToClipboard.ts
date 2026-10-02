import * as Clipboard from 'expo-clipboard';
import { useCallback, useEffect, useRef, useState } from 'react';

// How long `copied` stays true (e.g. to show a checkmark).
const COPIED_VISIBLE_MS = 1500;

// Copies text and reports `copied` briefly for feedback.
export function useCopyToClipboard() {
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (timer.current) {
        clearTimeout(timer.current);
      }
    },
    [],
  );

  const copy = useCallback(async (text: string) => {
    await Clipboard.setStringAsync(text);
    setCopied(true);
    if (timer.current) {
      clearTimeout(timer.current);
    }
    timer.current = setTimeout(() => setCopied(false), COPIED_VISIBLE_MS);
  }, []);

  return { copied, copy };
}
