import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { ChipItem } from '@/components';
import { config } from '@/config';
import { LibraryFilter, librarySources } from '@/domain';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';

// Filter chips + search box state. `query` is what the server receives
// (search is debounced so typing doesn't fire a request per key).
export function useLibraryFilters() {
  const { t } = useTranslation();
  const [filter, setFilter] = useState<LibraryFilter>('all');
  const [search, setSearch] = useState('');
  const debounced = useDebouncedValue(
    search.trim(),
    config.library.searchDebounceMs,
  );

  const chips = useMemo<ChipItem<LibraryFilter>[]>(
    () => [
      { key: 'all', label: t('library.all') },
      ...librarySources.map(id => ({ key: id, label: t(`tools.${id}.tag`) })),
    ],
    [t],
  );

  const query = useMemo(
    () => ({ filter, search: debounced }),
    [filter, debounced],
  );

  return {
    filter,
    setFilter,
    search,
    setSearch,
    chips,
    query,
    // True while the user is narrowing results (not an empty library).
    isFiltering: filter !== 'all' || debounced !== '',
  };
}
