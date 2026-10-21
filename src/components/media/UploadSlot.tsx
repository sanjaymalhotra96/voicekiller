import React from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import { MediaPanel, MediaPanelHeader } from '@/components/media/MediaPanel';
import { MediaSourceMenu } from '@/components/media/MediaSourceMenu';
import { ProgressRing } from '@/components/media/ProgressRing';
import { AppText } from '@/components/ui/AppText';
import { IconButton } from '@/components/ui/IconButton';
import type { UploadSlotState } from '@/hooks/useUploadSlot';
import type { MediaSource } from '@/domain';
import { control, useColors } from '@/theme';
import { formatBytes } from '@/utils/format';

// Ring size in dp: the `play` bubble token.
const RING = parseFloat(control.play);

type Props = {
  state: UploadSlotState;
  // "Upload Source Audio".
  title: string;
  // Accepted formats and size ("mp3, wav (Max 50MB)").
  hint: string;
  onPick: (source: MediaSource) => void;
  onRemove: () => void;
};

// File input for tool screens. Empty: Upload. Uploading: % ring.
// Ready: file name, size, delete and Change.
export function UploadSlot({ state, title, hint, onPick, onRemove }: Props) {
  const colors = useColors();
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
                color={colors.danger.DEFAULT}
                accessibilityLabel={t('upload.remove', { name: file.name })}
                onPress={onRemove}
              />
              <MediaSourceMenu
                variant="soft"
                label={t('upload.change')}
                onPick={onPick}
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
                trackColor={colors.night.line}
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
          <MediaSourceMenu
            label={t('upload.action')}
            disabled={uploading}
            onPick={onPick}
          />
        }
      />
    </MediaPanel>
  );
}
