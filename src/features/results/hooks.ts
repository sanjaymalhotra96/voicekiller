import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { isLibrarySource, LibraryItem, Voice } from '@/domain';
import {
  useDeleteLibraryItem,
  useLibraryItems,
  useRenameLibraryItem,
} from '@/features/library/hooks';
import { fromLibraryItem, fromVoice } from '@/features/results/adapters';
import {
  ResultItem,
  ResultTool,
  unrenamableTools,
  viewableTools,
} from '@/features/results/types';
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
  // Missing when the source cannot be renamed / deleted (the card hides
  // those buttons).
  rename?: (id: string, title: string) => void;
  remove?: (id: string) => void;
  // The Library file behind a card (Library sources only), for "View".
  file?: (id: string) => LibraryItem | undefined;
  mutationError: unknown;
};

const noop = () => {};

// ---- Own voices (clones, designs) -------------------------------------

const useOwnVoices = (source: OwnVoiceSource) =>
  useQuery({
    queryKey: queryKeys.voices.mine(source),
    queryFn: () => ownVoicesService.list(source),
  });

export function useVoiceResults(source: OwnVoiceSource): ResultsQuery {
  const { t } = useTranslation();
  const client = useQueryClient();
  const query = useOwnVoices(source);
  // The picker's Cloned / Design tabs list these too.
  const remove = useMutation({
    mutationFn: (voice: Voice) => ownVoicesService.remove(source, voice),
    onSettled: () =>
      client.invalidateQueries({ queryKey: queryKeys.voices.all }),
  });
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
    // The API cannot rename clones and designs.
    remove: id => {
      const voice = query.data?.find(item => item.id === id);
      if (voice) {
        remove.mutate(voice);
      }
    },
    mutationError: remove.error,
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
    // No Rename on cards that use "View", or that are never renamed.
    rename:
      viewableTools.includes(tool) || unrenamableTools.includes(tool)
        ? undefined
        : (id, title) => {
            const item = find(id);
            if (item) {
              rename.mutate({ item, title });
            }
          },
    file: find,
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
