import React from 'react';
import { Pressable, View } from 'react-native';
import { AppText } from '@/components/ui/AppText';
import { Icon, IconName } from '@/components/ui/Icon';
import { iconSize, Palette, useColors } from '@/theme';
import { cn } from '@/utils';

type Segment<K extends string> = {
  key: K;
  label: string;
  icon?: IconName;
};

type Props<K extends string> = {
  segments: readonly Segment<K>[];
  value: K;
  onChange: (key: K) => void;
  // `tabs`: orange pill inside a grey track (Library / My Instructions).
  // `cards`: separate option cards (MP3 / WAV).
  // `night`: brown pill on a dark track (Upload / Record Audio).
  variant?: 'tabs' | 'cards' | 'night';
  className?: string;
};

const styles = (c: Palette) =>
  ({
    tabs: {
      track: 'flex-row rounded-xl border border-line-neutral bg-muted p-1',
      item: 'h-segment flex-1 flex-row items-center justify-center gap-2 rounded-lg',
      on: 'bg-primary',
      off: '',
      textOn: 'text-contrast',
      textOff: 'text-ink-subtle',
      iconOn: c.contrast,
      iconOff: c.ink.subtle,
    },
    cards: {
      track: 'flex-row gap-5',
      item: 'h-option flex-1 flex-row items-center justify-center gap-2 rounded-xl border',
      on: 'border-primary-soft bg-primary-soft',
      off: 'border-muted bg-muted',
      textOn: 'text-primary',
      textOff: 'text-ink',
      iconOn: c.primary.DEFAULT,
      iconOff: c.ink.DEFAULT,
    },
    night: {
      track:
        'flex-row rounded-xl border border-night-line bg-night-surface p-1.5',
      item: 'h-segment flex-1 flex-row items-center justify-center gap-2 rounded-lg',
      on: 'bg-primary-night',
      off: '',
      textOn: 'text-night-text',
      textOff: 'text-night-muted',
      iconOn: c.night.text,
      iconOff: c.night.muted,
    },
  } as const);

// Single choice between a few options shown side by side.
export function SegmentedControl<K extends string>({
  segments,
  value,
  onChange,
  variant = 'tabs',
  className,
}: Props<K>) {
  const colors = useColors();
  const s = styles(colors)[variant];
  return (
    <View accessibilityRole="tablist" className={cn(s.track, className)}>
      {segments.map(segment => {
        const selected = segment.key === value;
        return (
          <Pressable
            key={segment.key}
            accessibilityRole="tab"
            accessibilityState={{ selected }}
            accessibilityLabel={segment.label}
            onPress={() => onChange(segment.key)}
            className={cn(s.item, selected ? s.on : s.off, 'active:opacity-70')}
          >
            {segment.icon ? (
              <Icon
                name={segment.icon}
                size={iconSize.md}
                color={selected ? s.iconOn : s.iconOff}
              />
            ) : null}
            <AppText
              variant="label"
              className={selected ? s.textOn : s.textOff}
            >
              {segment.label}
            </AppText>
          </Pressable>
        );
      })}
    </View>
  );
}
