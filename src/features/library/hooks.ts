import {
  InfiniteData,
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';
import type { LibraryCursor, LibraryFilter, LibraryItem } from '@/domain';
import { queryKeys } from '@/lib/queryKeys';
import { libraryService, LibraryPage } from '@/services/library';

// Pages of files, newest first, from the selected tool's table (or all
// of them merged); search runs in the database.
export const useLibraryItems = (params: {
  filter: LibraryFilter;
  search: string;
}) =>
  useInfiniteQuery({
    queryKey: queryKeys.library.list(params),
    queryFn: ({ pageParam }) =>
      libraryService.list({ cursor: pageParam, ...params }),
    initialPageParam: null as LibraryCursor | null,
    getNextPageParam: (last: LibraryPage) => last.nextCursor,
  });

type Pages = InfiniteData<LibraryPage, LibraryCursor | null>;
type Snapshot = [readonly unknown[], Pages | undefined][];

// Applies a change to every cached Library list (all filters/searches)
// immediately; rolls back if the request fails.
function useOptimisticLibraryUpdate<Vars>(
  mutationFn: (vars: Vars) => Promise<void>,
  apply: (items: LibraryItem[], vars: Vars) => LibraryItem[],
) {
  const client = useQueryClient();
  const scope = { queryKey: queryKeys.library.all };

  return useMutation({
    mutationFn,
    onMutate: async (vars: Vars) => {
      await client.cancelQueries(scope);
      const previous: Snapshot = client.getQueriesData<Pages>(scope);
      client.setQueriesData<Pages>(scope, data =>
        data
          ? {
              ...data,
              pages: data.pages.map(page => ({
                ...page,
                items: apply(page.items, vars),
              })),
            }
          : data,
      );
      return { previous };
    },
    onError: (_error, _vars, context) => {
      context?.previous.forEach(([key, data]) =>
        client.setQueryData(key, data),
      );
    },
    onSettled: () => client.invalidateQueries(scope),
  });
}

export const useRenameLibraryItem = () =>
  useOptimisticLibraryUpdate(
    ({ item, title }: { item: LibraryItem; title: string }) =>
      libraryService.rename(item, title),
    (items, { item: renamed, title }) =>
      items.map(item => (item.id === renamed.id ? { ...item, title } : item)),
  );

export const useDeleteLibraryItem = () =>
  useOptimisticLibraryUpdate(
    (item: LibraryItem) => libraryService.remove(item),
    (items, removed) => items.filter(item => item.id !== removed.id),
  );
