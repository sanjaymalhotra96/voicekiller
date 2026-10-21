import { useCallback, useMemo, useRef, useState } from 'react';
import { AudioSample, FileRules, MediaSource, validateFile } from '@/domain';
import { AppError, toAppError } from '@/lib/errors';
import { pickMediaFile } from '@/lib/pickMediaFile';

// Picks one audio or video file from the device and checks its format.
// Nothing is converted here: that happens when the user starts the job
// (lib/audioConvert prepareUpload, called by each tool's service), which
// also checks the API's size limit. pick() returns null when the user
// cancels or the file is rejected (see `error`).
export function useFilePicker(rules: FileRules) {
  const [sample, setSample] = useState<AudioSample | null>(null);
  const [error, setError] = useState<AppError | null>(null);
  const picking = useRef(false);

  const pick = useCallback(async (source: MediaSource = 'files') => {
    if (picking.current) return null;
    picking.current = true;
    setError(null);
    try {
      const picked = await pickMediaFile(source, rules);
      if (!picked) return null;
      // Format only: the size limit applies to the converted audio.
      const wrongType = validateFile({ ...picked, size: null }, rules);
      if (wrongType) {
        setError(new AppError(wrongType));
        return null;
      }
      setSample(picked);
      return picked;
    } catch (cause) {
      setError(toAppError(cause));
      return null;
    } finally {
      picking.current = false;
    }
  }, [rules]);

  const clear = useCallback(() => {
    setSample(null);
    setError(null);
  }, []);

  return useMemo(
    () => ({ sample, error, pick, clear }),
    [sample, error, pick, clear],
  );
}
