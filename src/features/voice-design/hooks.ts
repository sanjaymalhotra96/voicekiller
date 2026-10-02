import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/queryKeys';
import { voiceDesignService } from '@/services/voiceDesign';

// AI rewrite of the description (the wand button).
export const useEnhanceDescription = () =>
  useMutation({ mutationFn: voiceDesignService.enhance });

// Three candidate voices for a description.
export const useGenerateVariations = () =>
  useMutation({ mutationFn: voiceDesignService.generate });

// Keeps one variation as a voice: My Designs and the picker refresh.
export function useSaveDesign() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: voiceDesignService.save,
    onSuccess: () => client.invalidateQueries({ queryKey: queryKeys.voices.all }),
  });
}
