import {
  RecordingInput,
  RecordingPresets,
  requestRecordingPermissionsAsync,
  setAudioModeAsync,
  useAudioRecorder,
  useAudioRecorderState,
} from 'expo-audio';
import { useCallback, useEffect, useRef, useState } from 'react';
import { AppError, toAppError } from '@/lib/errors';

// How often the elapsed time updates while recording.
const STATUS_INTERVAL_MS = 500;

// Records one voice sample from a chosen microphone. Stops on its own
// after `maxSeconds`. The native recorder is released on unmount.
export function useVoiceRecorder(maxSeconds: number) {
  const [uri, setUri] = useState<string | null>(null);
  const [error, setError] = useState<AppError | null>(null);
  const [inputs, setInputs] = useState<RecordingInput[]>([]);
  const [inputId, setInputId] = useState<string | null>(null);
  const prepared = useRef(false);

  // Fires when a recording finishes, including the automatic stop.
  const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY, status => {
    if (status.isFinished && status.url) {
      setUri(status.url);
      prepared.current = false;
      setAudioModeAsync({ allowsRecording: false }).catch(() => {});
    }
    if (status.hasError) {
      setError(new AppError('unknown', status.error));
    }
  });
  const state = useAudioRecorderState(recorder, STATUS_INTERVAL_MS);

  // Asks for the microphone, readies the recorder and lists the inputs.
  // Called when the Record tab opens, so the microphone list can show.
  const prepare = useCallback(async () => {
    if (prepared.current) {
      return true;
    }
    try {
      const permission = await requestRecordingPermissionsAsync();
      if (!permission.granted) {
        setError(new AppError('micPermission'));
        return false;
      }
      await setAudioModeAsync({ allowsRecording: true, playsInSilentMode: true });
      await recorder.prepareToRecordAsync();
      prepared.current = true;
      setInputs(recorder.getAvailableInputs());
      const current = await recorder.getCurrentInput();
      setInputId(current.uid);
      setError(null);
      return true;
    } catch (e) {
      setError(toAppError(e));
      return false;
    }
  }, [recorder]);

  const start = useCallback(async () => {
    setUri(null);
    if (await prepare()) {
      recorder.record({ forDuration: maxSeconds });
    }
  }, [prepare, recorder, maxSeconds]);

  const stop = useCallback(async () => {
    try {
      if (recorder.isRecording) {
        await recorder.stop();
      }
    } catch {
      // Already released (screen closing): nothing left to stop.
    }
  }, [recorder]);

  const selectInput = useCallback(
    (uid: string) => {
      recorder.setInput(uid);
      setInputId(uid);
    },
    [recorder],
  );

  // "Record Again": drop the take, keep the microphone choice.
  const discard = useCallback(() => setUri(null), []);

  // Leaving the screen: useAudioRecorder releases the native recorder
  // (which also stops the microphone). Its cleanup runs before this one,
  // so the recorder must not be touched here; reading it would throw
  // "Cannot use shared object that was already released". Only reset the
  // app-wide audio mode, which is not tied to the recorder.
  useEffect(
    () => () => {
      setAudioModeAsync({ allowsRecording: false }).catch(() => {});
    },
    [],
  );

  return {
    uri,
    error,
    inputs,
    inputId,
    isRecording: state.isRecording,
    elapsedSeconds: Math.floor(state.durationMillis / 1000),
    prepare,
    start,
    stop,
    discard,
    selectInput,
  };
}
