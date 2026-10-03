import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { isLibrarySource, Voice } from '@/domain';
import {
  useDeleteLibraryItem,
  useLibraryItems,
  useRenameLibraryItem,
} from '@/features/library/hooks';
import { fromLibraryItem, fromVoice } from '@/features/results/adapters';
import type { ResultItem, ResultTool } from '@/features/results/types';
import { queryKeys } from '@/lib/queryKeys';
import { OwnVoiceSource, ownVoicesService } from '@/services/ownVoices';

// Same shape for every result source, so one grid renders them all.
export type ResultsQuery = {
  items: ResultItem[];
  isPending: boolean;
  error: unknown;
  refetch: () => void;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  fetchNextPage: () => void;
  rename: (id: string, title: string) => void;
  remove: (id: string) => void;
  mutationError: unknown;
};

const noop = () => {};

// ---- Own voices (clones, designs) -------------------------------------

const useOwnVoices = (source: OwnVoiceSource) =>
  useQuery({
    queryKey: queryKeys.voices.mine(source),
    queryFn: () => ownVoicesService.list(source),
  });

// Applies a change to the list immediately; rolls back on failure and
// refreshes every voice list (picker tabs included) afterwards.
function useOptimisticOwnVoices<Vars>(
  source: OwnVoiceSource,
  mutationFn: (vars: Vars) => Promise<void>,
  apply: (list: Voice[], vars: Vars) => Voice[],
) {
  const client = useQueryClient();
  const key = queryKeys.voices.mine(source);
  return useMutation({
    mutationFn,
    onMutate: async (vars: Vars) => {
      await client.cancelQueries({ queryKey: key });
      const previous = client.getQueryData<Voice[]>(key);
      client.setQueryData<Voice[]>(key, list => list && apply(list, vars));
      return { previous };
    },
    onError: (_error, _vars, context) =>
      client.setQueryData(key, context?.previous),
    onSettled: () => client.invalidateQueries({ queryKey: queryKeys.voices.all }),
  });
}

export function useVoiceResults(source: OwnVoiceSource): ResultsQuery {
  const { t } = useTranslation();
  const query = useOwnVoices(source);
  const rename = useOptimisticOwnVoices(
    source,
    ({ id, name }: { id: string; name: string }) =>
      ownVoicesService.rename(id, name),
    (list, { id, name }) => list.map(v => (v.id === id ? { ...v, name } : v)),
  );
  const remove = useOptimisticOwnVoices(
    source,
    (id: string) => ownVoicesService.remove(id),
    (list, id) => list.filter(v => v.id !== id),
  );
  const items = useMemo(
    () => (query.data ?? []).map(voice => fromVoice(voice, source, t)),
    [query.data, source, t],
  );

  return {
    items,
    isPending: query.isPending,
    error: query.error,
    refetch: query.refetch,
    hasNextPage: false,
    isFetchingNextPage: false,
    fetchNextPage: noop,
    rename: (id, name) => rename.mutate({ id, name }),
    remove: remove.mutate,
    mutationError: rename.error ?? remove.error,
  };
}

// ---- Library files of one tool ---------------------------------------

export function useLibraryResults(tool: ResultTool): ResultsQuery {
  const { t } = useTranslation();
  // Shares the cache with the Library tab's filter for this tool.
  const source = isLibrarySource(tool) ? tool : 'textToSpeech';
  const query = useLibraryItems(
    useMemo(() => ({ filter: source, search: '' }), [source]),
  );
  const rename = useRenameLibraryItem();
  const remove = useDeleteLibraryItem();
  const files = useMemo(
    () => (query.data?.pages ?? []).flatMap(page => page.items),
    [query.data],
  );
  const items = useMemo(
    () => files.map(item => fromLibraryItem(item, t)),
    [files, t],
  );
  const find = (id: string) => files.find(item => item.id === id);

  return {
    items,
    isPending: query.isPending,
    error: query.error,
    refetch: query.refetch,
    hasNextPage: query.hasNextPage,
    isFetchingNextPage: query.isFetchingNextPage,
    fetchNextPage: () => {
      if (query.hasNextPage && !query.isFetchingNextPage) {
        query.fetchNextPage();
      }
    },
    rename: (id, title) => {
      const item = find(id);
      if (item) {
        rename.mutate({ item, title });
      }
    },
    remove: id => {
      const item = find(id);
      if (item) {
        remove.mutate(item);
      }
    },
    mutationError: rename.error ?? remove.error,
  };
}

// ---- Jobs that add a Library file ------------------------------------

// Runs a tool job; the new file shows up in Library, in the tool's
// "Recent ..." section and in the usage meter.
export function useLibraryJob<Vars, Result>(
  mutationFn: (vars: Vars) => Promise<Result>,
) {
  const client = useQueryClient();
  return useMutation({
    mutationFn,
    onSuccess: () =>
      Promise.all([
        client.invalidateQueries({ queryKey: queryKeys.library.all }),
        client.invalidateQueries({ queryKey: queryKeys.account.all }),
      ]),
  });
}
