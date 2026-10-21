import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { ChipItem } from '@/components';
import { config } from '@/config';
import { LibrarySource, librarySources } from '@/domain';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';

// Filter chips + search box state. `query` is what the server receives
// (search is debounced so typing doesn't fire a request per key).
export function useLibraryFilters() {
  const { t } = useTranslation();
  const [filter, setFilter] = useState<LibrarySource>('textToSpeech');
  const [search, setSearch] = useState('');
  const debounced = useDebouncedValue(
    search.trim(),
    config.library.searchDebounceMs,
  );

  const chips = useMemo<ChipItem<LibrarySource>[]>(
    () => librarySources.map(id => ({ key: id, label: t(`tools.${id}.tag`) })),
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
  };
}
