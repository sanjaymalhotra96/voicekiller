import React from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import { MediaPanel, MediaPanelHeader } from '@/components/media/MediaPanel';
import { ProgressRing } from '@/components/media/ProgressRing';
import { AppText } from '@/components/ui/AppText';
import { Button } from '@/components/ui/Button';
import { IconButton } from '@/components/ui/IconButton';
import type { UploadSlotState } from '@/hooks/useUploadSlot';
import { control, palette } from '@/theme';
import { formatBytes } from '@/utils/format';

// Ring size in dp: the `play` bubble token.
const RING = parseFloat(control.play);

type Props = {
  state: UploadSlotState;
  // "Upload Source Audio".
  title: string;
  // Accepted formats and size ("mp3, wav (Max 50MB)").
  hint: string;
  onPick: () => void;
  onRemove: () => void;
};

// File input for tool screens. Empty: Upload. Uploading: % ring.
// Ready: file name, size, delete and Change.
export function UploadSlot({ state, title, hint, onPick, onRemove }: Props) {
  const { t } = useTranslation();

  if (state.status === 'ready') {
    const { file } = state;
    return (
      <MediaPanel>
        <MediaPanelHeader
          icon="fileAudio"
          title={file.name}
          hint={file.size !== null ? formatBytes(file.size) : ''}
          action={
            <View className="flex-row items-center gap-2">
              <IconButton
                variant="ghost"
                icon="trash"
                color={palette.danger.DEFAULT}
                accessibilityLabel={t('upload.remove', { name: file.name })}
                onPress={onRemove}
              />
              <Button
                size="sm"
                variant="soft"
                label={t('upload.change')}
                onPress={onPick}
              />
            </View>
          }
        />
      </MediaPanel>
    );
  }

  const uploading = state.status === 'uploading';
  return (
    <MediaPanel>
      <MediaPanelHeader
        icon="upload"
        leading={
          uploading ? (
            <View
              accessible
              accessibilityLabel={t('upload.uploading', { percent: state.percent })}
              className="items-center justify-center"
            >
              <ProgressRing
                size={RING}
                ratio={state.percent / 100}
                trackColor={palette.night.line}
              />
              <AppText variant="tag" className="absolute text-night-text">
                {`${state.percent}%`}
              </AppText>
            </View>
          ) : undefined
        }
        title={title}
        hint={hint}
        action={
          <Button
            size="sm"
            variant="light"
            label={t('upload.action')}
            disabled={uploading}
            onPress={onPick}
          />
        }
      />
    </MediaPanel>
  );
}
