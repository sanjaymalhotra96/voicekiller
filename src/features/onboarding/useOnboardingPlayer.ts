import { useCallback } from 'react';
import { useStopOnBlur } from '@/hooks';
import type { Playable } from '@/hooks/usePlayback';
import { usePreviewPlayback } from '@/hooks/usePreviewPlayback';

// One clip at a time: Play starts from the beginning, tapping the sounding
// clip stops it, and leaving the screen cancels pending or active playback.
export function useOnboardingPlayer() {
  const { activeId, playing, loading, play, stop } = usePreviewPlayback();
  const playingId = playing ? activeId : null;
  useStopOnBlur(stop);

  const playOrStop = useCallback(
    (item: Playable) => {
      stop();
      if (item.id !== playingId) play(item);
    },
    [playingId, stop, play],
  );

  return {
    playingId,
    loadingId: loading ? activeId : null,
    playOrStop,
    stop,
  };
}
