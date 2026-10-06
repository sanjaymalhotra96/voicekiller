import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/queryKeys';
import { campaignsService } from '@/services/campaigns';
import { speechService } from '@/services/textToSpeech';

// TanStack Query wrappers for the editor. Screens never call services.

export const useCampaigns = () =>
  useQuery({ queryKey: queryKeys.campaigns.all, queryFn: campaignsService.list });

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
