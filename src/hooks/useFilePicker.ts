import { getDocumentAsync } from 'expo-document-picker';
import { useCallback, useMemo, useState } from 'react';
import { AudioSample, FileRules, validateFile } from '@/domain';
import { toUploadAudio } from '@/lib/audioConvert';
import { AppError, toAppError } from '@/lib/errors';

type Options = {
  // Keep only the first this-many seconds of audio (Voice Clone).
  maxSeconds?: number;
  // Reject shorter clips (Voice Clone).
  minSeconds?: number;
};

// Picks one audio or video file from the device, checks its format,
// turns it into upload-ready audio (a video or another audio format
// becomes mp3; lib/audioConvert), then checks that audio against the
// API's size limit in `rules`. `preparing` is
// true while that runs. pick() returns null when the user cancels or the
// file is rejected (see `error`).
export function useFilePicker(
  rules: FileRules,
  { maxSeconds, minSeconds }: Options = {},
) {
  const [sample, setSample] = useState<AudioSample | null>(null);
  const [preparing, setPreparing] = useState(false);
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
    // Format first. The size limit is the API's, so it applies to the
    // audio that is sent, after conversion.
    const wrongType = validateFile({ ...picked, size: null }, rules);
    if (wrongType) {
      setError(new AppError(wrongType));
      return null;
    }
    setError(null);
    setPreparing(true);
    try {
      const audio = await toUploadAudio(picked, { maxSeconds, minSeconds });
      const tooLarge = validateFile(audio, rules);
      if (tooLarge) {
        setError(new AppError(tooLarge));
        return null;
      }
      setSample(audio);
      return audio;
    } catch (e) {
      setError(toAppError(e));
      return null;
    } finally {
      setPreparing(false);
    }
  }, [rules, maxSeconds, minSeconds]);

  const clear = useCallback(() => {
    setSample(null);
    setError(null);
  }, []);

  return useMemo(
    () => ({ sample, preparing, error, pick, clear }),
    [sample, preparing, error, pick, clear],
  );
}
