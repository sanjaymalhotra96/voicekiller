import { MenuView } from '@expo/ui/community/menu';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import { AppText } from '@/components/ui/AppText';
import type { MediaSource } from '@/domain';
import { cn } from '@/utils';

type Props = {
  label: string;
  onPick: (source: MediaSource) => void;
  disabled?: boolean;
  variant?: 'light' | 'soft';
};

// Native Files/Gallery menu shared by Upload and Change controls.
export function MediaSourceMenu({ label, onPick, disabled = false, variant = 'light' }: Props) {
  const { t } = useTranslation();
  return (
    <View pointerEvents={disabled ? 'none' : 'auto'}>
      <MenuView
        colorScheme="light"
        title={t('upload.chooseSource')}
        actions={[
          { id: 'files', title: t('upload.files'), attributes: { disabled } },
          { id: 'gallery', title: t('upload.gallery'), attributes: { disabled } },
        ]}
        onPressAction={({ nativeEvent }) => {
          const source = nativeEvent.event;
          if (!disabled && (source === 'files' || source === 'gallery')) onPick(source);
        }}
      >
        <View
          accessible
          accessibilityRole="button"
          accessibilityLabel={label}
          accessibilityState={{ disabled }}
          className={cn(
            'h-button-sm items-center justify-center rounded-lg px-3.5',
            disabled ? 'bg-line-neutral' : variant === 'soft' ? 'bg-primary-soft' : 'bg-contrast',
          )}
        >
          <AppText
            variant="buttonSm"
            className={disabled ? 'text-ink-subtle' : variant === 'soft' ? 'text-primary' : 'text-night'}
          >
            {label}
          </AppText>
        </View>
      </MenuView>
    </View>
  );
}
