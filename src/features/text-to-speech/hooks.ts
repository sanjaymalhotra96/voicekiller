import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { useSpeechDraft } from '@/features/text-to-speech/store';
import { queryKeys } from '@/lib/queryKeys';
import { campaignsService } from '@/services/campaigns';
import { speechService } from '@/services/textToSpeech';
import { voicesService } from '@/services/voices';

// TanStack Query wrappers for the editor. Screens never call services.

export const useCampaigns = () =>
  useQuery({
    queryKey: queryKeys.campaigns.all,
    queryFn: campaignsService.list,
  });

export const usePreviewSpeech = () =>
  useMutation({ mutationFn: speechService.preview });

// A new file lands in the Library and uses minutes, so both refresh.
export function useGenerateSpeech() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: speechService.generate,
    onSuccess: () =>
      Promise.all([
        client.invalidateQueries({ queryKey: queryKeys.library.all }),
        client.invalidateQueries({ queryKey: queryKeys.account.all }),
      ]),
  });
}

// First time on Text to Speech: select the first catalog voice. After that
// the draft keeps the last voice the user chose (saved on the device), so
// this does nothing.
export function useDefaultVoice() {
  const hasVoice = useSpeechDraft(state => state.voice !== null);
  const setVoice = useSpeechDraft(state => state.setVoice);
  // The saved draft must be loaded first, or it would be overwritten.
  const [loaded, setLoaded] = useState(useSpeechDraft.persist.hasHydrated);
  useEffect(
    () => useSpeechDraft.persist.onFinishHydration(() => setLoaded(true)),
    [],
  );
  const first = useQuery({
    queryKey: queryKeys.voices.first(),
    queryFn: voicesService.firstVoice,
    enabled: loaded && !hasVoice,
  });

  useEffect(() => {
    // Read again: the user may have picked a voice while this loaded.
    if (first.data && !useSpeechDraft.getState().voice) {
      setVoice(first.data);
    }
  }, [first.data, setVoice]);
}
