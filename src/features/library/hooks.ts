import {
  InfiniteData,
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';
import type { LibraryCursor, LibraryFilter, LibraryItem } from '@/domain';
import { queryKeys } from '@/lib/queryKeys';
import { libraryService, LibraryPage } from '@/services/library';

// Pages of files, newest first; filter and search run in the database.
// Each page starts after the last row of the previous one (keyset).
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
    ({ id, title }: { id: string; title: string }) =>
      libraryService.rename(id, title),
    (items, { id, title }) =>
      items.map(item => (item.id === id ? { ...item, title } : item)),
  );

export const useDeleteLibraryItem = () =>
  useOptimisticLibraryUpdate(
    (id: string) => libraryService.remove(id),
    (items, id) => items.filter(item => item.id !== id),
  );
