import { useCallback } from 'react';
import { usePlayback, useStopOnBlur } from '@/hooks';

// Fixed clips (Before / After demos): tapping a clip plays it from the
// start, tapping the one that is playing stops it. One clip at a time.
export function useClipPlayer() {
  const { activeId, playing, toggle, stop } = usePlayback();
  // Leaving the step (Next, back, swipe) silences it.
  useStopOnBlur(stop);
  // Only what is actually sounding (not a paused or finished clip).
  const playingId = playing ? activeId : null;

  const playOrStop = useCallback(
    (id: string, audioUrl: string) => {
      if (id === playingId) {
        stop();
      } else {
        toggle({ id, audioUrl });
      }
    },
    [playingId, stop, toggle],
  );

  return { playingId, playOrStop, stop };
}
