import { useCallback, useRef, useState } from 'react';
import { Platform } from 'react-native';
import { shareRemoteFile } from '@/lib/shareFile';
import { openLink } from '@/utils/openLink';

export function useAudioDownload() {
  const busy = useRef(false);
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<unknown>(null);

  const download = useCallback(async (item: { audioUrl: string | null }) => {
    if (!item.audioUrl || busy.current) return;
    if (Platform.OS !== 'ios') {
      openLink(item.audioUrl);
      return;
    }

    busy.current = true;
    setIsPending(true);
    setError(null);
    try {
      await shareRemoteFile(item.audioUrl);
    } catch (cause) {
      setError(cause);
    } finally {
      busy.current = false;
      setIsPending(false);
    }
  }, []);

  return { download, isPending, error };
}
