import { AudioPlayer, useAudioPlayer } from 'expo-audio';
import { useCallback, useEffect, useRef, useState } from 'react';

const FADE_MS = 220;
const FADE_STEPS = 8;
// Re-align the two tracks when they drift further apart than this (s).
const MAX_DRIFT = 0.12;

// Released players throw on access when the screen is closing.
const safely = (fn: () => void) => {
  try {
    fn();
  } catch {
    // Already released.
  }
};

// Two takes of the same recording (e.g. noisy and cleaned) playing in
// lockstep. Only one is audible; `setUseB` crossfades between them
// without a gap, so the listener hears the difference mid-sentence.
export function useCrossfadePair(urlA: string, urlB: string) {
  const a = useAudioPlayer({ uri: urlA });
  const b = useAudioPlayer({ uri: urlB });
  const [playing, setPlaying] = useState(false);
  const [useB, setUseBState] = useState(false);
  const useBRef = useRef(false);
  const fade = useRef<ReturnType<typeof setInterval> | null>(null);

  const setVolumes = useCallback(
    (bLevel: number) => {
      safely(() => {
        a.volume = 1 - bLevel;
        b.volume = bLevel;
      });
    },
    [a, b],
  );

  useEffect(() => {
    setVolumes(0);
  }, [setVolumes]);

  // A ends the pair (both clips are the same length).
  useEffect(() => {
    const subscription = a.addListener('playbackStatusUpdate', status => {
      if (status.didJustFinish) {
        safely(() => b.pause());
        setPlaying(false);
      }
    });
    return () => safely(() => subscription.remove());
  }, [a, b]);

  useEffect(
    () => () => {
      if (fade.current) clearInterval(fade.current);
    },
    [],
  );

  const align = useCallback((from: AudioPlayer, to: AudioPlayer) => {
    if (Math.abs(from.currentTime - to.currentTime) > MAX_DRIFT) {
      to.seekTo(from.currentTime);
    }
  }, []);

  const play = useCallback(() => {
    safely(() => {
      // Finished: start over together.
      if (a.duration > 0 && a.currentTime >= a.duration - 0.05) {
        a.seekTo(0);
        b.seekTo(0);
      } else {
        align(a, b);
      }
      a.play();
      b.play();
    });
    setPlaying(true);
  }, [a, b, align]);

  const pause = useCallback(() => {
    safely(() => {
      a.pause();
      b.pause();
    });
    setPlaying(false);
  }, [a, b]);

  const setUseB = useCallback(
    (next: boolean) => {
      if (next === useBRef.current) return;
      useBRef.current = next;
      setUseBState(next);
      if (fade.current) clearInterval(fade.current);
      safely(() => align(next ? a : b, next ? b : a));
      let step = 0;
      fade.current = setInterval(() => {
        step += 1;
        const ratio = step / FADE_STEPS;
        setVolumes(next ? ratio : 1 - ratio);
        if (step >= FADE_STEPS && fade.current) {
          clearInterval(fade.current);
          fade.current = null;
        }
      }, FADE_MS / FADE_STEPS);
    },
    [a, b, align, setVolumes],
  );

  return { playing, useB, play, pause, setUseB };
}
