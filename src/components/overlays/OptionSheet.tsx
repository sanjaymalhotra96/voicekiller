import React from 'react';
import { BottomSheet } from '@/components/overlays/BottomSheet';
import { Option, OptionList } from '@/components/ui/OptionList';

type Props<K extends string> = {
  visible: boolean;
  onClose: () => void;
  title: string;
  options: readonly Option<K>[];
  value: K | null;
  // Called with the choice; the sheet closes itself afterwards.
  onSelect: (key: K) => void;
};

// Bottom sheet with a single-choice list (language, microphone...).
export function OptionSheet<K extends string>({
  visible,
  onClose,
  title,
  options,
  value,
  onSelect,
}: Props<K>) {
  return (
    <BottomSheet visible={visible} onClose={onClose} title={title}>
      <OptionList
        options={options}
        value={value}
        onSelect={key => {
          onSelect(key);
          onClose();
        }}
      />
    </BottomSheet>
  );
}
