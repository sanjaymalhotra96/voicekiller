import React from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, View } from 'react-native';
import { AppText } from '@/components';
import { EqualizerBars } from '@/features/onboarding/EqualizerBars';
import { SamplePlaybackIcon } from '@/features/onboarding/SamplePlaybackIcon';
import { Palette, useColors } from '@/theme';
import { cn } from '@/utils';

const tones = (c: Palette) =>
  ({
    // Before: grey, dark play glyph.
    neutral: {
      box: 'border-line-neutral bg-field',
      circle: 'bg-surface',
      circleOn: 'bg-ink',
      glyphOn: c.surface,
      glyph: c.ink.DEFAULT,
      caption: 'font-sans text-ink-subtle',
      wave: c.ink.inactive,
    },
    // After: orange highlight.
    highlight: {
      box: 'border-line bg-primary-wash',
      circle: 'bg-primary',
      circleOn: 'bg-primary-dark',
      glyphOn: c.contrast,
      glyph: c.contrast,
      caption: 'font-sans-semibold text-primary-deep',
      wave: c.primary.DEFAULT,
    },
  } as const);

type Props = {
  tone: keyof ReturnType<typeof tones>;
  title: string;
  caption?: string;
  wave: readonly number[];
  // Per-bar colours, overriding the tone's wave colour.
  waveColors?: readonly string[];
  playing: boolean;
  loading: boolean;
  disabled?: boolean;
  onPress: () => void;
  className?: string;
};

// Before / After clip on the voice changer and speech editor steps: round play button,
// titles, and a separate waveform that moves while the clip plays.
export function CompareRow({
  tone,
  title,
  caption,
  wave,
  waveColors,
  playing,
  loading,
  disabled = false,
  onPress,
  className,
}: Props) {
  const colors = useColors();
  const { t } = useTranslation();
  const s = tones(colors)[tone];
  const name = caption ? `${title}, ${caption}` : title;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={t(
        playing ? 'onboarding.change.stop' : 'onboarding.change.play',
        { name },
      )}
      accessibilityState={{
        selected: playing,
        disabled: disabled || loading,
        busy: loading,
      }}
      disabled={disabled || loading}
      onPress={onPress}
      className={cn(
        'h-compare-row flex-row items-center gap-3 rounded-panel border-emphasis pl-3 pr-4 active:opacity-80',
        s.box,
        disabled && 'opacity-45',
        className,
      )}
    >
      <View
        className={cn(
          'size-12 items-center justify-center rounded-full',
          playing ? s.circleOn : s.circle,
        )}
      >
        <SamplePlaybackIcon
          playing={playing}
          loading={loading}
          color={playing ? s.glyphOn : s.glyph}
        />
      </View>
      <View className="gap-0.5">
        <AppText className="font-sans-bold text-lg text-ink">{title}</AppText>
        {caption ? (
          <AppText className={cn('text-small', s.caption)}>{caption}</AppText>
        ) : null}
      </View>
      <View className="h-8 flex-1 items-end justify-center overflow-hidden">
        <EqualizerBars
          heights={wave}
          color={s.wave}
          colors={waveColors}
          gap={3}
          animated={playing}
        />
      </View>
    </Pressable>
  );
}
