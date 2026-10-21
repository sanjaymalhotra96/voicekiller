import { useMutation, useQueryClient } from '@tanstack/react-query';
import { recordSuccessfulOperation } from '@/features/review/prompt';
import { queryKeys } from '@/lib/queryKeys';
import { clonesService } from '@/services/voiceClone';

// A new clone shows up in My Clones and in the voice picker's Cloned tab.
// Listing / renaming / deleting clones: features/results.
export function useCreateClone() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: clonesService.create,
    onSuccess: () => {
      recordSuccessfulOperation();
      return client.invalidateQueries({ queryKey: queryKeys.voices.all });
    },
  });
}
