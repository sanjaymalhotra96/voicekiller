import { useAudioPlayer } from 'expo-audio';
import { useCallback, useEffect, useRef, useState } from 'react';

// Anything with audio: a Library file, a voice sample, a preview.
type Playable = { id: string; audioUrl: string | null };

// One shared player for a list (one native player, however many rows): tapping another item switches tracks,
// tapping the active item toggles play/pause.
//
// Only `activeId` and `playing` are state here, so the list re-renders when
// those change, not on every position tick. The moving position is read by
// <PlaybackProgress> inside the active row alone.
//
// `toggle` and `stop` never change identity (the active id is read from a
// ref), so memoised rows that receive them skip re-rendering when another
// row starts playing.
export function usePlayback() {
  const player = useAudioPlayer(null);
  const [activeId, setActiveIdState] = useState<string | null>(null);
  const [playing, setPlaying] = useState(false);
  const activeIdRef = useRef<string | null>(null);

  const setActiveId = useCallback((id: string | null) => {
    activeIdRef.current = id;
    setActiveIdState(id);
  }, []);

  useEffect(() => {
    const subscription = player.addListener('playbackStatusUpdate', status => {
      // Same value -> React skips the re-render.
      setPlaying(status.playing);
      if (status.didJustFinish) {
        setActiveId(null);
      }
    });
    // useAudioPlayer may already have released the player when this runs
    // on unmount; removing a listener from it then throws harmlessly.
    return () => {
      try {
        subscription.remove();
      } catch {
        // Released with the player.
      }
    };
  }, [player, setActiveId]);

  const toggle = useCallback(
    (item: Playable) => {
      if (item.id === activeIdRef.current) {
        if (player.playing) {
          player.pause();
        } else {
          player.play();
        }
        return;
      }
      if (!item.audioUrl) {
        return;
      }
      player.replace({ uri: item.audioUrl });
      player.play();
      setActiveId(item.id);
    },
    [player, setActiveId],
  );

  const stop = useCallback(() => {
    try {
      player.pause();
    } catch {
      // Already released (screen closing).
    }
    setActiveId(null);
  }, [player, setActiveId]);

  return { player, activeId, playing, toggle, stop };
}
