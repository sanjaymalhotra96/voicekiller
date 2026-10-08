import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Pressable, View } from 'react-native';
import {
  Banner,
  BottomSheet,
  FormError,
  Icon,
  OptionList,
  TextField,
} from '@/components';
import { defaultCampaign, textLimits } from '@/domain';
import { useCampaigns } from '@/features/text-to-speech/hooks';
import { useSpeechDraft } from '@/features/text-to-speech/store';
import type { EditorSheetProps } from '@/features/text-to-speech/types';
import { iconSize, layout, useColors } from '@/theme';
import { cn } from '@/utils';

const sameName = (a: string, b: string) =>
  a.localeCompare(b, undefined, { sensitivity: 'accent' }) === 0;

// Pick the campaign for the new file, or add a new name. A campaign is
// only a name saved with each file, so a new one exists on the server as
// soon as a file is generated with it.
export function CampaignSheet({ visible, onClose }: EditorSheetProps) {
  const colors = useColors();
  const { t } = useTranslation();
  const campaignName = useSpeechDraft(state => state.campaignName);
  const setCampaign = useSpeechDraft(state => state.setCampaign);
  const campaigns = useCampaigns();
  // Names added here that have no file yet.
  const [added, setAdded] = useState<string[]>([]);
  const [name, setName] = useState('');
  const [duplicate, setDuplicate] = useState(false);

  // Default first, then every other name once (server, added, selected).
  const names = useMemo(() => {
    const all: string[] = [];
    for (const n of [...(campaigns.data ?? []), ...added, campaignName ?? '']) {
      if (n && !sameName(n, defaultCampaign) && !all.some(x => sameName(x, n))) {
        all.push(n);
      }
    }
    return all;
  }, [campaigns.data, added, campaignName]);

  const options = useMemo(
    () => [
      { key: defaultCampaign, label: t('textToSpeech.campaignSheet.default') },
      ...names.map(n => ({ key: n, label: n })),
    ],
    [names, t],
  );

  const choose = (key: string) => {
    setCampaign(key === defaultCampaign ? null : key);
    onClose();
  };

  const trimmed = name.trim();
  const submit = () => {
    if (!trimmed) {
      return;
    }
    if (sameName(trimmed, defaultCampaign) || names.some(n => sameName(n, trimmed))) {
      setDuplicate(true);
      return;
    }
    setAdded(list => [...list, trimmed]);
    setCampaign(trimmed);
    setName('');
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
            setDuplicate(false);
          }}
          maxLength={textLimits.campaignName}
          returnKeyType="done"
          onSubmitEditing={submit}
          trailing={
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={t('textToSpeech.campaignSheet.create')}
              accessibilityState={{ disabled: !trimmed }}
              hitSlop={layout.hitSlop}
              disabled={!trimmed}
              onPress={submit}
              className={cn(
                'size-icon-btn items-center justify-center rounded-lg active:bg-primary-dark',
                trimmed ? 'bg-primary' : 'bg-line-neutral',
              )}
            >
              <Icon name="add" size={iconSize.md} color={colors.contrast} />
            </Pressable>
          }
        />
        {duplicate ? <Banner message={t('errors.campaignExists')} /> : null}
        <FormError error={campaigns.error} />
        {campaigns.isPending ? (
          <ActivityIndicator color={colors.primary.DEFAULT} />
        ) : (
          <OptionList
            options={options}
            value={campaignName ?? defaultCampaign}
            onSelect={choose}
          />
        )}
      </View>
    </BottomSheet>
  );
}
