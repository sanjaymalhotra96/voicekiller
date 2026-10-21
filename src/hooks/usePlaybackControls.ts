import type { AudioPlayer } from 'expo-audio';
import { useCallback, useEffect, useRef, useState } from 'react';
import { log } from '@/lib/logger';

// Track the user's Play request separately from native playback: Android can
// report `playing` while buffering, and iOS can report paused while starting.
export function usePlaybackControls(player: AudioPlayer) {
  const phase = useRef<'idle' | 'starting' | 'playing'>('idle');
  const [playing, setPlaying] = useState(false);
  const [loading, setLoading] = useState(false);

  const reset = useCallback(() => {
    phase.current = 'idle';
    setPlaying(false);
    setLoading(false);
  }, []);

  useEffect(() => {
    reset();
    const subscription = player.addListener('playbackStatusUpdate', status => {
      if (status.error || status.didJustFinish) {
        reset();
        return;
      }
      const sounding = status.playing && status.isLoaded && !status.isBuffering;
      if (sounding) {
        phase.current = 'playing';
        setPlaying(true);
        setLoading(false);
        return;
      }
      if (phase.current === 'idle') return;

      const waiting =
        phase.current === 'starting' ||
        !status.isLoaded ||
        status.isBuffering ||
        status.timeControlStatus === 'waitingToPlayAtSpecifiedRate';
      setPlaying(false);
      setLoading(waiting);
      if (!waiting) phase.current = 'idle';
    });
    return () => {
      try {
        subscription.remove();
      } catch {
        // The player may already have been released on unmount.
      }
    };
  }, [player, reset]);

  const play = useCallback(() => {
    phase.current = 'starting';
    setPlaying(false);
    setLoading(true);
    try {
      player.play();
    } catch (error) {
      reset();
      log('audio', 'Cannot start playback', error);
    }
  }, [player, reset]);

  const pause = useCallback(() => {
    reset();
    try {
      player.pause();
    } catch {
      // Already released (screen closing).
    }
  }, [player, reset]);

  return { playing, loading, play, pause };
}
