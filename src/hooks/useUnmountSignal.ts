import { useCallback, useEffect, useRef } from 'react';

// Returns a getter for an AbortSignal that aborts when the component
// unmounts. Long jobs (polling, big uploads) take it, so they stop waiting
// for a screen that is gone. A getter, because React may mount effects
// twice in development: each mount gets a fresh controller.
export function useUnmountSignal() {
  const controller = useRef(new AbortController());

  useEffect(() => {
    if (controller.current.signal.aborted) {
      controller.current = new AbortController();
    }
    const current = controller.current;
    return () => current.abort();
  }, []);

  return useCallback(() => controller.current.signal, []);
}
