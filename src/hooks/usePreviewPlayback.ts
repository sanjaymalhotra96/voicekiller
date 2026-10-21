import { useCallback, useEffect, useRef, useState } from 'react';
import { usePlayback, type Playable } from '@/hooks/usePlayback';
import { log } from '@/lib/logger';

// Start previews after the loading indicator can paint. Callers stop/reset the
// previous clip first; remote URLs stream directly through the shared player.
export function usePreviewPlayback() {
  const {
    activeId,
    playing,
    loading,
    toggle: togglePlayback,
    stop: stopPlayback,
  } = usePlayback();
  const requestId = useRef(0);
  const [pending, setPending] = useState<{
    item: Playable;
    requestId: number;
  } | null>(null);

  useEffect(() => {
    if (!pending) return;

    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | undefined;
    // Yield until the loading indicator has had a chance to paint.
    const frame = requestAnimationFrame(() => {
      timer = setTimeout(() => {
        if (cancelled || pending.requestId !== requestId.current) return;
        try {
          togglePlayback(pending.item);
        } catch (error) {
          stopPlayback();
          log('audio', 'Cannot prepare preview', error);
        } finally {
          if (!cancelled && pending.requestId === requestId.current) {
            setPending(null);
          }
        }
      }, 0);
    });

    return () => {
      cancelled = true;
      cancelAnimationFrame(frame);
      clearTimeout(timer);
    };
  }, [pending, togglePlayback, stopPlayback]);

  const stop = useCallback(() => {
    requestId.current += 1;
    setPending(null);
    stopPlayback();
  }, [stopPlayback]);

  const play = useCallback(
    (item: Playable) => {
      if (item.audioUrl === null || item.audioUrl === '') return;
      requestId.current += 1;
      setPending({ item, requestId: requestId.current });
    },
    [],
  );

  return {
    activeId: pending?.item.id ?? activeId,
    playing: pending === null && playing,
    loading: pending !== null || loading,
    play,
    stop,
  };
}
