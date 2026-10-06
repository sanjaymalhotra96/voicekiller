import {
  keepPreviousData,
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { useCallback, useMemo } from 'react';
import {
  FavoriteVoice,
  Voice,
  VoiceCursor,
  voiceKey,
  VoiceQuery,
} from '@/domain';
import { queryKeys } from '@/lib/queryKeys';
import { VoicePage, voicesService } from '@/services/voices';

// Pages of voices for one picker tab. The Library tab pages through the
// catalog; Cloned, Design and Favorites come back whole.
export const useVoices = (query: VoiceQuery) =>
  useInfiniteQuery({
    queryKey: queryKeys.voices.list(query),
    queryFn: ({ pageParam }) =>
      voicesService.list({ ...query, cursor: pageParam }),
    initialPageParam: null as VoiceCursor | null,
    getNextPageParam: (last: VoicePage) => last.nextCursor,
    placeholderData: keepPreviousData,
  });

const favoritesKey = queryKeys.voices.favorites();

// The user's favourites, and which voice ids (Voice.id) are in them.
export function useFavoriteVoices() {
  const query = useQuery({
    queryKey: favoritesKey,
    queryFn: voicesService.getFavorites,
  });
  const ids = useMemo(
    () => new Set((query.data ?? []).map(favorite =>
          voiceKey(favorite.provider, favorite.voice),
        )),
    [query.data],
  );
  return { ...query, ids };
}

type Change = { next: FavoriteVoice[]; adding: boolean; isNew: boolean };

// Heart on / off. The API saves the whole list, so the new list is built
// here, shown at once, sent, and rolled back if the request fails.
export function useToggleFavorite() {
  const client = useQueryClient();
  const mutation = useMutation({
    mutationFn: ({ next, adding, isNew }: Change) =>
      adding
        ? voicesService.addFavorite(next, isNew)
        : voicesService.removeFavorite(next),
    onMutate: async ({ next }: Change) => {
      await client.cancelQueries({ queryKey: favoritesKey });
      const previous = client.getQueryData<FavoriteVoice[]>(favoritesKey);
      client.setQueryData<FavoriteVoice[]>(favoritesKey, next);
      return { previous };
    },
    onError: (_error, _change, context) =>
      client.setQueryData(favoritesKey, context?.previous),
    // The Favorites tab lists these too.
    onSettled: () => client.invalidateQueries({ queryKey: queryKeys.voices.all }),
  });

  const { mutate } = mutation;
  const toggle = useCallback(
    (voice: Voice) => {
      const current = client.getQueryData<FavoriteVoice[]>(favoritesKey) ?? [];
      const isThis = (favorite: FavoriteVoice) =>
        voiceKey(favorite.provider, favorite.voice) === voice.id;
      const adding = !current.some(isThis);
      const next = adding
        ? [
            ...current,
            { displayName: voice.name, voice: voice.voice, provider: voice.provider },
          ]
        : current.filter(favorite => !isThis(favorite));
      mutate({ next, adding, isNew: adding && current.length === 0 });
    },
    [client, mutate],
  );

  return { toggle, error: mutation.error };
}
