import { getDocumentAsync } from 'expo-document-picker';
import { useCallback, useMemo, useState } from 'react';
import { AudioSample, FileRules, validateFile } from '@/domain';
import { AppError } from '@/lib/errors';

// Picks one audio or video file from the device and checks its format.
// Nothing is converted here: that happens when the user starts the job
// (lib/audioConvert prepareUpload, called by each tool's service), which
// also checks the API's size limit. pick() returns null when the user
// cancels or the file is rejected (see `error`).
export function useFilePicker(rules: FileRules) {
  const [sample, setSample] = useState<AudioSample | null>(null);
  const [error, setError] = useState<AppError | null>(null);

  const pick = useCallback(async () => {
    const result = await getDocumentAsync({
      type: [...rules.mimeTypes],
      copyToCacheDirectory: true,
    });
    const asset = result.canceled ? null : result.assets[0];
    if (!asset) {
      return null;
    }
    const picked: AudioSample = {
      uri: asset.uri,
      name: asset.name,
      mimeType: asset.mimeType ?? null,
      size: asset.size ?? null,
    };
    // Format only: the size limit applies to the converted audio.
    const wrongType = validateFile({ ...picked, size: null }, rules);
    if (wrongType) {
      setError(new AppError(wrongType));
      return null;
    }
    setError(null);
    setSample(picked);
    return picked;
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
