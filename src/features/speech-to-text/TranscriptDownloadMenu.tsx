import { MenuView } from '@expo/ui/community/menu';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, View } from 'react-native';
import { AppText, Icon } from '@/components';
import { TranscriptFormat, transcriptFormats } from '@/domain';
import { iconSize, useColors } from '@/theme';
import { cn } from '@/utils';

type Props = {
  onSelect: (format: TranscriptFormat) => void;
  formats?: readonly TranscriptFormat[];
  loading?: boolean;
  disabled?: boolean;
  variant?: 'icon' | 'button';
  accessibilityLabel?: string;
};

// One native format menu for saved cards and the editable transcript viewer.
// MenuView owns the gesture, so its label is a View rather than a nested button.
export function TranscriptDownloadMenu({
  onSelect,
  formats = transcriptFormats,
  loading = false,
  disabled = false,
  variant = 'button',
  accessibilityLabel,
}: Props) {
  const { t } = useTranslation();
  const colors = useColors();
  const iconOnly = variant === 'icon';
  const inactive = disabled || loading || formats.length === 0;
  const label = accessibilityLabel ?? t('speechToText.sheet.download');
  const color = iconOnly ? colors.night.muted : colors.ink.subtle;

  return (
    <View
      className={iconOnly ? undefined : 'flex-1'}
      pointerEvents={inactive ? 'none' : 'auto'}
    >
      <MenuView
        title={t('speechToText.sheet.download')}
        actions={formats.map(format => ({
          id: format,
          title: t(`speechToText.sheet.formats.${format}`),
          attributes: { disabled: inactive },
        }))}
        onPressAction={({ nativeEvent }) => {
          const format = formats.find(value => value === nativeEvent.event);
          if (!inactive && format) onSelect(format);
        }}
      >
        <View
          accessible
          accessibilityRole="button"
          accessibilityLabel={label}
          accessibilityState={{ disabled: inactive, busy: loading }}
          className={cn(
            'flex-row items-center justify-center gap-2',
            iconOnly
              ? 'size-icon-btn rounded-lg'
              : 'h-button rounded-xl bg-field',
            inactive && 'opacity-40',
          )}
        >
          {loading ? (
            <ActivityIndicator color={color} />
          ) : (
            <>
              {!iconOnly ? (
                <AppText variant="button" className="text-ink-subtle">
                  {label}
                </AppText>
              ) : null}
              <Icon
                name={iconOnly ? 'download' : 'chevronDown'}
                size={iconSize.md}
                color={color}
              />
            </>
          )}
        </View>
      </MenuView>
    </View>
  );
}
