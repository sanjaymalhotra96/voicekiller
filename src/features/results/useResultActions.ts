import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { ResultsQuery } from '@/features/results/hooks';
import type { ResultItem } from '@/features/results/types';
import { usePlayback } from '@/hooks/usePlayback';
import { confirmDestructive, openLink } from '@/utils';

// Play / rename / download / delete for a grid of results. One shared
// player per grid; callbacks are stable so memoised cards skip re-renders.
export function useResultActions(query: Pick<ResultsQuery, 'rename' | 'remove'>) {
  const { t } = useTranslation();
  const playback = usePlayback();
  const [renaming, setRenaming] = useState<ResultItem | null>(null);
  const { toggle, stop } = playback;
  const { rename, remove } = query;

  const togglePlay = useCallback(
    (item: ResultItem) => toggle({ id: item.id, audioUrl: item.audioUrl }),
    [toggle],
  );

  const download = useCallback((item: ResultItem) => {
    if (item.audioUrl) {
      openLink(item.audioUrl);
    }
  }, []);

  const confirmDelete = useCallback(
    (item: ResultItem) =>
      confirmDestructive({
        title: t('results.removeTitle'),
        message: t('results.removeMessage', { name: item.title }),
        confirmLabel: t('common.delete'),
        cancelLabel: t('common.cancel'),
        onConfirm: () => {
          stop();
          remove(item.id);
        },
      }),
    [t, stop, remove],
  );

  return {
    playback,
    togglePlay,
    download,
    confirmDelete,
    startRename: setRenaming,
    // Props for <RenameSheet>.
    renameSheet: {
      visible: !!renaming,
      initialValue: renaming?.title ?? '',
      onClose: () => setRenaming(null),
      onSave: (title: string) => {
        if (renaming) {
          rename(renaming.id, title);
        }
        setRenaming(null);
      },
    },
  };
}
