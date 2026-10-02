import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { SheetAction } from '@/components';
import {
  useDeleteLibraryItem,
  useRenameLibraryItem,
} from '@/features/library/hooks';
import type { LibraryItem } from '@/features/library/types';
import { confirmDestructive, openLink } from '@/utils';

type Options = {
  // Called before deleting, e.g. to stop playback of that file.
  onBeforeDelete?: (item: LibraryItem) => void;
};

// The ⋮ menu for a file: Details sheet, Rename sheet, Download, Delete.
export function useLibraryItemActions({ onBeforeDelete }: Options = {}) {
  const { t } = useTranslation();
  const rename = useRenameLibraryItem();
  const remove = useDeleteLibraryItem();
  const [menuItem, setMenuItem] = useState<LibraryItem | null>(null);
  const [renameItem, setRenameItem] = useState<LibraryItem | null>(null);

  const closeMenu = () => setMenuItem(null);

  const confirmDelete = (item: LibraryItem) =>
    confirmDestructive({
      title: t('library.delete.title'),
      message: t('library.delete.message', { title: item.title }),
      confirmLabel: t('library.delete.confirm'),
      cancelLabel: t('library.delete.cancel'),
      onConfirm: () => {
        onBeforeDelete?.(item);
        remove.mutate(item.id);
      },
    });

  // Closes the menu, then runs the action for the selected file.
  const action = (run: (item: LibraryItem) => void) => () => {
    const item = menuItem;
    closeMenu();
    if (item) {
      run(item);
    }
  };

  const menuActions: SheetAction[] = [
    {
      key: 'rename',
      label: t('library.actions.rename'),
      icon: 'edit',
      onPress: action(setRenameItem),
    },
    {
      key: 'download',
      label: t('library.actions.download'),
      icon: 'download',
      onPress: action(item => openLink(item.audioUrl)),
    },
    {
      key: 'delete',
      label: t('library.actions.delete'),
      icon: 'trash',
      destructive: true,
      onPress: action(confirmDelete),
    },
  ];

  return {
    openMenu: setMenuItem,
    menu: { visible: !!menuItem, onClose: closeMenu, actions: menuActions },
    // Props for <RenameSheet>.
    renameSheet: {
      visible: !!renameItem,
      initialValue: renameItem?.title ?? '',
      onClose: () => setRenameItem(null),
      onSave: (title: string) => {
        if (renameItem) {
          rename.mutate({ id: renameItem.id, title });
        }
        setRenameItem(null);
      },
    },
    error: rename.error ?? remove.error,
  };
}
