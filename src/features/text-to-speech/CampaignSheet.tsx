import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Pressable, View } from 'react-native';
import {
  BottomSheet,
  FormError,
  Icon,
  OptionList,
  TextField,
} from '@/components';
import { textLimits } from '@/domain';
import { useCampaigns, useCreateCampaign } from '@/features/text-to-speech/hooks';
import { useSpeechDraft } from '@/features/text-to-speech/store';
import type { EditorSheetProps } from '@/features/text-to-speech/types';
import { iconSize, layout, palette } from '@/theme';
import { cn } from '@/utils';

// OptionList keys must be strings; this one stands for "no campaign".
const DEFAULT_KEY = '__default__';

// Pick the campaign for the new file, or create one inline.
export function CampaignSheet({ visible, onClose }: EditorSheetProps) {
  const { t } = useTranslation();
  const campaignId = useSpeechDraft(state => state.campaignId);
  const setCampaign = useSpeechDraft(state => state.setCampaign);
  const campaigns = useCampaigns();
  const create = useCreateCampaign();
  const [name, setName] = useState('');

  const options = useMemo(
    () => [
      { key: DEFAULT_KEY, label: t('textToSpeech.campaignSheet.default') },
      ...(campaigns.data ?? []).map(c => ({ key: c.id, label: c.name })),
    ],
    [campaigns.data, t],
  );

  const choose = (key: string) => {
    setCampaign(key === DEFAULT_KEY ? null : key);
    onClose();
  };

  const trimmed = name.trim();
  const submit = () => {
    if (!trimmed || create.isPending) {
      return;
    }
    create.mutate(trimmed, {
      onSuccess: campaign => {
        setName('');
        setCampaign(campaign.id);
      },
    });
  };

  return (
    <BottomSheet
      visible={visible}
      onClose={onClose}
      title={t('textToSpeech.campaignSheet.title')}
    >
      <View className="gap-4">
        <TextField
          tone="outline"
          placeholder={t('textToSpeech.campaignSheet.placeholder')}
          value={name}
          onChangeText={text => {
            setName(text);
            create.reset();
          }}
          maxLength={textLimits.campaignName}
          returnKeyType="done"
          onSubmitEditing={submit}
          trailing={
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={t('textToSpeech.campaignSheet.create')}
              accessibilityState={{ disabled: !trimmed, busy: create.isPending }}
              hitSlop={layout.hitSlop}
              disabled={!trimmed || create.isPending}
              onPress={submit}
              className={cn(
                'size-icon-btn items-center justify-center rounded-lg active:bg-primary-dark',
                trimmed ? 'bg-primary' : 'bg-line-neutral',
              )}
            >
              {create.isPending ? (
                <ActivityIndicator color={palette.surface} />
              ) : (
                <Icon name="add" size={iconSize.md} color={palette.surface} />
              )}
            </Pressable>
          }
        />
        <FormError error={create.error ?? campaigns.error} />
        {campaigns.isPending ? (
          <ActivityIndicator color={palette.primary.DEFAULT} />
        ) : (
          <OptionList
            options={options}
            value={campaignId ?? DEFAULT_KEY}
            onSelect={choose}
          />
        )}
      </View>
    </BottomSheet>
  );
}
