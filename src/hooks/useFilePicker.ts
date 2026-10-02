import { getDocumentAsync } from 'expo-document-picker';
import { useCallback, useMemo, useState } from 'react';
import { AudioSample, FileRules, validateFile } from '@/domain';
import { AppError } from '@/lib/errors';

// Picks one file from the device and checks it against `rules` (format,
// size) before anything is uploaded. Returns null from pick() when the
// user cancels or the file is rejected (see `error`).
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
    const problem = validateFile(picked, rules);
    if (problem) {
      setError(new AppError(problem));
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
