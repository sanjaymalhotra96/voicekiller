import React from 'react';
import { Pressable, View } from 'react-native';
import { AppText, Icon } from '@/components';
import { SamplePlaybackIcon } from '@/features/onboarding/SamplePlaybackIcon';
import { useColors } from '@/theme';
import { cn } from '@/utils';

type Props = {
  id: string;
  name: string;
  selected: boolean;
  playing: boolean;
  loading: boolean;
  selectionLabel: string;
  previewLabel: string;
  onSelect: (id: string) => void;
  onPreview: (id: string) => void;
};

// Separate touch targets let a voice be selected without playing its sample.
export function VoiceSampleOption({
  id,
  name,
  selected,
  playing,
  loading,
  selectionLabel,
  previewLabel,
  onSelect,
  onPreview,
}: Props) {
  const colors = useColors();

  return (
    <View
      className={cn(
        'h-pill flex-row items-center rounded-full border-emphasis pl-1',
        selected ? 'border-primary bg-primary-soft' : 'border-line bg-surface',
      )}
    >
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={previewLabel}
        accessibilityState={{ busy: loading, disabled: loading }}
        disabled={loading}
        onPress={() => onPreview(id)}
        className="size-11 items-center justify-center rounded-full bg-surface active:opacity-70"
      >
        <SamplePlaybackIcon
          playing={playing}
          loading={loading}
          color={colors.primary.dark}
        />
      </Pressable>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={selectionLabel}
        accessibilityState={{ selected }}
        onPress={() => onSelect(id)}
        className="h-full flex-row items-center gap-2 rounded-r-full pl-2 pr-4 active:opacity-70"
      >
        <AppText className="font-sans-semibold text-lg text-ink">
          {name}
        </AppText>
        <View
          className={cn(
            'size-4 items-center justify-center rounded-full border',
            selected
              ? 'border-primary bg-primary'
              : 'border-ink-subtle bg-surface',
          )}
        >
          {selected ? (
            <Icon name="check" size={12} color={colors.contrast} />
          ) : null}
        </View>
      </Pressable>
    </View>
  );
}
