import { useCallback, useState } from 'react';
import type { AudioSample, FileRules } from '@/domain';
import { useFilePicker } from '@/hooks/useFilePicker';

export type UploadSlotState =
  | { status: 'idle' }
  // The picked file is being turned into audio (lib/audioConvert).
  | { status: 'preparing' }
  | { status: 'uploading'; file: AudioSample; percent: number }
  | { status: 'ready'; file: AudioSample };

// What the slot itself tracks; `preparing` comes from the picker.
type SlotState = Exclude<UploadSlotState, { status: 'preparing' }>;

// One "Upload Source Audio" slot: pick an audio or video file (turned into
// upload-ready audio by the picker), then hand the file to the job, which
// uploads it to the API and reports progress through `showProgress`.
export function useUploadSlot(
  rules: FileRules,
  // Keep only the first this-many seconds of audio (Speech Editor).
  { maxSeconds }: { maxSeconds?: number } = {},
) {
  const picker = useFilePicker(rules, { maxSeconds });
  const [state, setState] = useState<SlotState>({ status: 'idle' });

  const pick = useCallback(async () => {
    const file = await picker.pick();
    if (file) {
      setState({ status: 'ready', file });
    }
  }, [picker]);

  // Remove the file, or start again after the job used it.
  const reset = useCallback(() => {
    picker.clear();
    setState({ status: 'idle' });
  }, [picker]);

  // The job's upload progress (0 to 1) as the % ring; null when it ended
  // or failed.
  const showProgress = useCallback((ratio: number | null) => {
    setState(current => {
      if (current.status === 'idle') {
        return current;
      }
      if (ratio === null || ratio >= 1) {
        return { status: 'ready', file: current.file };
      }
      const percent = Math.floor(ratio * 100);
      return current.status === 'uploading' && current.percent === percent
        ? current
        : { status: 'uploading', file: current.file, percent };
    });
  }, []);

  return {
    state: picker.preparing ? ({ status: 'preparing' } as const) : state,
    // The picked file, once it can be sent.
    file: state.status === 'ready' ? state.file : null,
    showProgress,
    error: picker.error,
    pick,
    remove: reset,
    reset,
  };
}
