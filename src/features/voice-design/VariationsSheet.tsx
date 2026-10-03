import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, View } from 'react-native';
import {
  AppText,
  BottomSheet,
  Button,
  FormError,
  GradientPlayButton,
  Radio,
} from '@/components';
import type { VoiceVariation } from '@/domain';
import { usePlayback } from '@/hooks';
import { cn } from '@/utils';

type Props = {
  // Null hides the sheet.
  variations: VoiceVariation[] | null;
  onClose: () => void;
  onSave: (variation: VoiceVariation) => void;
  saving: boolean;
  error: unknown;
};

// "Select Voice": listen to the generated variations and keep one.
export function VariationsSheet({
  variations,
  onClose,
  onSave,
  saving,
  error,
}: Props) {
  const { t } = useTranslation();
  return (
    <BottomSheet
      visible={!!variations}
      onClose={onClose}
      title={t('voiceDesign.variations.title')}
      subtitle={t('voiceDesign.variations.subtitle', {
        count: variations?.length ?? 0,
      })}
    >
      {variations ? (
        <VariationList
          variations={variations}
          onSave={onSave}
          saving={saving}
          error={error}
        />
      ) : null}
    </BottomSheet>
  );
}

// Mounted only while the sheet is open, so its player is released after.
function VariationList({
  variations,
  onSave,
  saving,
  error,
}: Omit<Props, 'onClose' | 'variations'> & { variations: VoiceVariation[] }) {
  const { t } = useTranslation();
  const playback = usePlayback();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = variations.find(v => v.id === selectedId) ?? null;

  return (
    <View className="gap-4">
      <View className="-mx-4">
        {variations.map((variation, index) => {
          const number = index + 1;
          const active = playback.activeId === variation.id;
          const isSelected = variation.id === selectedId;
          return (
            <Pressable
              key={variation.id}
              accessibilityRole="radio"
              accessibilityState={{ selected: isSelected }}
              accessibilityLabel={t('voiceDesign.variations.item', { number })}
              onPress={() => setSelectedId(variation.id)}
              className={cn(
                'flex-row items-center gap-3 border-b border-line-neutral px-4 py-4',
                active && 'bg-primary-wash',
              )}
            >
              <GradientPlayButton
                active={active}
                playing={active && playback.playing}
                player={playback.player}
                disabled={!variation.previewUrl}
                onPress={() =>
                  playback.toggle({
                    id: variation.id,
                    audioUrl: variation.previewUrl,
                  })
                }
                accessibilityLabel={t(
                  active && playback.playing
                    ? 'voiceDesign.variations.pause'
                    : 'voiceDesign.variations.play',
                  { number },
                )}
              />
              <View className="flex-1 gap-1">
                <AppText variant="cardTitle">
                  {t('voiceDesign.variations.item', { number })}
                </AppText>
                <AppText variant="caption" numberOfLines={4}>
                  {variation.text}
                </AppText>
              </View>
              <Radio selected={isSelected} tone="ink" />
            </Pressable>
          );
        })}
      </View>

      <FormError error={error} />

      <Button
        className="mt-4"
        label={t('voiceDesign.variations.save')}
        loading={saving}
        disabled={!selected}
        onPress={() => selected && onSave(selected)}
      />
    </View>
  );
}
