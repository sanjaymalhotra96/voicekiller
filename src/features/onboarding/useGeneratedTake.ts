import { File } from 'expo-file-system';
import { useCallback, useEffect, useRef, useState } from 'react';
import { usePlayback, useStopOnBlur } from '@/hooks';

export type TakePhase = 'idle' | 'loading' | 'playing';

// A generated file uri, or a bundled clip (require('...wav')).
type Source = string | number;

// Onboarding demos: generate a take on the server and play it. Takes are
// kept for the visit by `key`, so asking for one already heard plays at
// once. `presets` are takes bundled with the app. Plain clips (e.g. a real
// voice sample) go through the same player with `playClip`, so only one
// thing ever sounds at a time.
export function useGeneratedTake(presets: Record<string, Source> = {}) {
  const { activeId, playing, toggle, stop } = usePlayback();
  const takes = useRef(new Map<string, Source>(Object.entries(presets)));
  const request = useRef<AbortController | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<unknown>(null);
  // Key of the take last started (clips don't count).
  const [takeKey, setTakeKey] = useState<string | null>(null);

  // Drop a request still running when the screen closes.
  useEffect(() => () => request.current?.abort(), []);

  // Stops playback and any pending generation.
  const reset = useCallback(() => {
    request.current?.abort();
    request.current = null;
    setLoading(false);
    setError(null);
    stop();
  }, [stop]);

  // Leaving the step (Next, back, swipe) silences it.
  useStopOnBlur(reset);

  const start = useCallback(
    (key: string, source: Source) => {
      setTakeKey(key);
      toggle({ id: key, audioUrl: source });
    },
    [toggle],
  );

  const play = useCallback(
    async (key: string, generate: (signal: AbortSignal) => Promise<string>) => {
      reset();
      const saved = takes.current.get(key);
      // Preview files are pruned (lib/audioCache), so check a saved file is
      // still there. Bundled clips and web links always are.
      if (
        saved !== undefined &&
        (typeof saved === 'number' ||
          /^https?:/.test(saved) ||
          new File(saved).exists)
      ) {
        start(key, saved);
        return;
      }
      const controller = new AbortController();
      request.current = controller;
      setLoading(true);
      try {
        const uri = await generate(controller.signal);
        takes.current.set(key, uri);
        if (!controller.signal.aborted) {
          start(key, uri);
        }
      } catch (e) {
        if (!controller.signal.aborted) {
          setError(e);
        }
      } finally {
        if (request.current === controller) {
          request.current = null;
          setLoading(false);
        }
      }
    },
    [reset, start],
  );

  const playClip = useCallback(
    (id: string, source: Source) => {
      reset();
      toggle({ id, audioUrl: source });
    },
    [reset, toggle],
  );

  // What is sounding right now, take or clip.
  const playingId = playing ? activeId : null;
  const phase: TakePhase = loading
    ? 'loading'
    : playingId !== null && playingId === takeKey
    ? 'playing'
    : 'idle';

  return { phase, playingId, error, play, playClip, reset };
}
