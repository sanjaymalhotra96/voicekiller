import { useAudioPlayer } from 'expo-audio';
import { useCallback, useEffect, useRef, useState } from 'react';
import { usePlaybackControls } from '@/hooks/usePlaybackControls';

// Anything with audio: a Library file, a voice sample, a preview. A number
// is a bundled clip (require('...wav')).
export type Playable = { id: string; audioUrl: string | number | null };

// One shared player for a list (one native player, however many rows): tapping another item switches tracks,
// tapping the active item toggles play/pause.
//
// Only active/play/loading state is tracked here, so the list re-renders when
// those change, not on every position tick. The moving position is read by
// <PlaybackProgress> inside the active row alone.
//
// `toggle` and `stop` never change identity (the active id is read from a
// ref), so memoised rows that receive them skip re-rendering when another
// row starts playing.
export function usePlayback() {
  const player = useAudioPlayer(null);
  const [activeId, setActiveIdState] = useState<string | null>(null);
  const { playing, loading, play, pause } = usePlaybackControls(player);
  const activeIdRef = useRef<string | null>(null);

  const setActiveId = useCallback((id: string | null) => {
    activeIdRef.current = id;
    setActiveIdState(id);
  }, []);

  useEffect(() => {
    const subscription = player.addListener('playbackStatusUpdate', status => {
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
          pause();
        } else {
          play();
        }
        return;
      }
      if (item.audioUrl === null || item.audioUrl === '') {
        return;
      }
      player.replace(
        typeof item.audioUrl === 'number'
          ? item.audioUrl
          : { uri: item.audioUrl },
      );
      play();
      setActiveId(item.id);
    },
    [player, setActiveId, play, pause],
  );

  const stop = useCallback(() => {
    pause();
    setActiveId(null);
  }, [pause, setActiveId]);

  return { player, activeId, playing, loading, toggle, stop };
}
