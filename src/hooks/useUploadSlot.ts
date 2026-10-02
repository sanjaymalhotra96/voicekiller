import { randomUUID } from 'expo-crypto';
import { useCallback, useEffect, useRef, useState } from 'react';
import { AudioSample, fileExtension, FileRules } from '@/domain';
import { useFilePicker } from '@/hooks/useFilePicker';
import { AppError, toAppError } from '@/lib/errors';
import { supabase } from '@/lib/supabase';
import { removeUploadedFile, UploadTask, uploadFile } from '@/lib/uploadFile';

export type UploadSlotState =
  | { status: 'idle' }
  | { status: 'uploading'; file: AudioSample; percent: number }
  // `path` is the Storage path the tool's Edge Function receives.
  | { status: 'ready'; file: AudioSample; path: string };

// One "Upload Source Audio" slot: pick a file, upload it straight away
// with progress, then hand its Storage path to the job. Changing or
// removing the file cancels the upload and deletes the old object.
export function useUploadSlot(rules: FileRules, bucket: string) {
  const picker = useFilePicker(rules);
  const [state, setState] = useState<UploadSlotState>({ status: 'idle' });
  const [error, setError] = useState<AppError | null>(null);
  const task = useRef<UploadTask | null>(null);
  const uploadedPath = useRef<string | null>(null);

  const discard = useCallback(() => {
    task.current?.abort();
    task.current = null;
    if (uploadedPath.current) {
      removeUploadedFile(bucket, uploadedPath.current).catch(() => {});
      uploadedPath.current = null;
    }
  }, [bucket]);

  const pick = useCallback(async () => {
    const file = await picker.pick();
    if (!file) {
      return;
    }
    discard();
    setError(null);
    try {
      const { data } = await supabase.auth.getUser();
      if (!data.user) {
        throw new AppError('uploadFailed');
      }
      const ext = fileExtension(file.name) || 'bin';
      const path = `${data.user.id}/${randomUUID()}.${ext}`;
      setState({ status: 'uploading', file, percent: 0 });
      // Re-render only when the whole percent changes.
      let lastPercent = 0;
      const current = uploadFile({
        bucket,
        path,
        file,
        onProgress: ratio => {
          const percent = Math.floor(ratio * 100);
          if (percent !== lastPercent) {
            lastPercent = percent;
            setState({ status: 'uploading', file, percent });
          }
        },
      });
      task.current = current;
      await current.promise;
      if (task.current === current) {
        task.current = null;
        uploadedPath.current = path;
        setState({ status: 'ready', file, path });
      }
    } catch (e) {
      setState({ status: 'idle' });
      setError(toAppError(e));
    }
  }, [picker, discard, bucket]);

  const remove = useCallback(() => {
    discard();
    picker.clear();
    setError(null);
    setState({ status: 'idle' });
  }, [discard, picker]);

  // After the job used the file, keep it (the server owns it now) and
  // reset the slot for the next one.
  const reset = useCallback(() => {
    task.current = null;
    uploadedPath.current = null;
    picker.clear();
    setState({ status: 'idle' });
  }, [picker]);

  // Cancel an unfinished upload when the screen closes.
  useEffect(() => () => task.current?.abort(), []);

  return {
    state,
    path: state.status === 'ready' ? state.path : null,
    error: error ?? picker.error,
    pick,
    remove,
    reset,
  };
}
