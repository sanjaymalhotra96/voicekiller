import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { ChipItem } from '@/components';
import { config } from '@/config';
import {
  ActingInstruction,
  countByCategory,
  instructionCategories,
} from '@/domain';
import type { InstructionFilter } from '@/features/instructions/categories';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';

// Pure: the items matching a category and a search term.
export function filterInstructions(
  items: readonly ActingInstruction[],
  filter: InstructionFilter,
  search: string,
) {
  const term = search.trim().toLowerCase();
  return items.filter(
    item =>
      (filter === 'all' || item.category === filter) &&
      (!term || item.name.toLowerCase().includes(term)),
  );
}

// Category chips with counts ("Emotions (22)") and the filtered list.
// Everything runs on the device: the library is a few dozen rows.
export function useInstructionFilters(items: readonly ActingInstruction[]) {
  const { t } = useTranslation();
  const [filter, setFilter] = useState<InstructionFilter>('all');
  const [search, setSearch] = useState('');
  const debounced = useDebouncedValue(search, config.library.searchDebounceMs);

  const chips = useMemo<ChipItem<InstructionFilter>[]>(() => {
    const counts = countByCategory(items);
    return [
      { key: 'all', label: t('instructions.all', { count: items.length }) },
      ...instructionCategories.map(category => ({
        key: category,
        label: t('instructions.categoryCount', {
          label: t(`instructions.categories.${category}`),
          count: counts[category],
        }),
      })),
    ];
  }, [items, t]);

  const visible = useMemo(
    () => filterInstructions(items, filter, debounced),
    [items, filter, debounced],
  );

  return { filter, setFilter, search, setSearch, chips, visible };
}
