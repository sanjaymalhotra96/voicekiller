import {
  InfiniteData,
  keepPreviousData,
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';
import type { Voice, VoiceCursor, VoiceQuery } from '@/domain';
import { queryKeys } from '@/lib/queryKeys';
import { VoicePage, voicesService } from '@/services/voices';

// Alphabetical pages of voices; source, search and filters run on the
// server. The previous results stay on screen while a new search loads.
export const useVoices = (query: VoiceQuery) =>
  useInfiniteQuery({
    queryKey: queryKeys.voices.list(query),
    queryFn: ({ pageParam }) =>
      voicesService.list({ ...query, cursor: pageParam }),
    initialPageParam: null as VoiceCursor | null,
    getNextPageParam: (last: VoicePage) => last.nextCursor,
    placeholderData: keepPreviousData,
  });

type Pages = InfiniteData<VoicePage, VoiceCursor | null>;

// Heart toggles instantly in every cached list; rolls back on failure.
export function useToggleFavorite() {
  const client = useQueryClient();
  const scope = { queryKey: queryKeys.voices.all };

  return useMutation({
    mutationFn: (voice: Voice) =>
      voicesService.setFavorite(voice.id, !voice.isFavorite),
    onMutate: async (voice: Voice) => {
      await client.cancelQueries(scope);
      const previous = client.getQueriesData<Pages>(scope);
      client.setQueriesData<Pages>(scope, data =>
        data
          ? {
              ...data,
              pages: data.pages.map(page => ({
                ...page,
                items: page.items.map(item =>
                  item.id === voice.id
                    ? { ...item, isFavorite: !voice.isFavorite }
                    : item,
                ),
              })),
            }
          : data,
      );
      return { previous };
    },
    onError: (_error, _voice, context) => {
      context?.previous.forEach(([key, data]) => client.setQueryData(key, data));
    },
    onSettled: () => client.invalidateQueries(scope),
  });
}
