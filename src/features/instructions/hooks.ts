import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { config } from '@/config';
import type { CustomInstruction } from '@/domain';
import { queryKeys } from '@/lib/queryKeys';
import { instructionsService } from '@/services/instructions';

// The shared library: small and rarely changes, so it is cached long and
// filtered on the device.
export const useActingInstructions = () =>
  useQuery({
    queryKey: queryKeys.instructions.library(),
    queryFn: instructionsService.listLibrary,
    staleTime: config.instructions.staleTimeMs,
  });

export const useCustomInstructions = () =>
  useQuery({
    queryKey: queryKeys.instructions.custom(),
    queryFn: instructionsService.listCustom,
  });

export function useGenerateInstruction() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: instructionsService.generateCustom,
    onSuccess: created =>
      client.setQueryData<CustomInstruction[]>(
        queryKeys.instructions.custom(),
        list => [created, ...(list ?? [])],
      ),
  });
}

// Removed from the list immediately; restored if the request fails.
export function useDeleteInstruction() {
  const client = useQueryClient();
  const key = queryKeys.instructions.custom();
  return useMutation({
    mutationFn: instructionsService.removeCustom,
    onMutate: async (id: string) => {
      await client.cancelQueries({ queryKey: key });
      const previous = client.getQueryData<CustomInstruction[]>(key);
      client.setQueryData<CustomInstruction[]>(key, list =>
        list?.filter(item => item.id !== id),
      );
      return { previous };
    },
    onError: (_error, _id, context) =>
      client.setQueryData(key, context?.previous),
    onSettled: () => client.invalidateQueries({ queryKey: key }),
  });
}
