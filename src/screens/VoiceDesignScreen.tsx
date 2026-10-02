import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Pressable, View } from 'react-native';
import {
  Button,
  FormError,
  Icon,
  LanguageField,
  ScreenHeader,
  StatusPill,
  TextArea,
  TextField,
  TipsSheet,
} from '@/components';
import { config } from '@/config';
import {
  LanguageId,
  textLimits,
  VoiceVariation,
} from '@/domain';
import {
  useEnhanceDescription,
  useGenerateVariations,
  useSaveDesign,
  VariationsSheet,
} from '@/features/voice-design';
import { ResultsView } from '@/features/results';
import { useStatusBarStyle } from '@/hooks';
import { iconSize, layout, palette } from '@/theme';

// Describe a voice in words; pick one of the generated variations.
export function VoiceDesignScreen() {
  useStatusBarStyle('light-content');
  const { t } = useTranslation();
  const [language, setLanguage] = useState<LanguageId>(
    config.defaultLanguage as LanguageId,
  );
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [guideOpen, setGuideOpen] = useState(false);
  const [session, setSession] = useState<{
    sessionId: string;
    variations: VoiceVariation[];
  } | null>(null);
  const enhance = useEnhanceDescription();
  const generate = useGenerateVariations();
  const save = useSaveDesign();

  const input = {
    name: name.trim(),
    language,
    description: description.trim(),
  };

  const create = () => {
    setSubmitted(true);
    if (input.name && input.description) {
      generate.mutate(input, { onSuccess: setSession });
    }
  };

  const keep = (variation: VoiceVariation) => {
    if (!session) {
      return;
    }
    save.mutate(
      { ...input, sessionId: session.sessionId, variationId: variation.id },
      {
        onSuccess: () => {
          setSession(null);
          setName('');
          setDescription('');
          setSubmitted(false);
        },
      },
    );
  };

  const wand = (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={t('design.enhance')}
      accessibilityState={{ busy: enhance.isPending }}
      hitSlop={layout.hitSlop}
      disabled={!input.description || enhance.isPending}
      onPress={() =>
        enhance.mutate(
          { description: input.description, language },
          { onSuccess: setDescription },
        )
      }
      className="size-icon-btn items-center justify-center rounded-full bg-surface active:opacity-70"
    >
      {enhance.isPending ? (
        <ActivityIndicator color={palette.ink.DEFAULT} />
      ) : (
        <Icon name="wand" size={iconSize.md} color={palette.ink.DEFAULT} />
      )}
    </Pressable>
  );

  return (
    <View className="gap-5 pb-6">
      <ScreenHeader
        tone="night"
        title={t('design.title')}
        trailing={
          <StatusPill
            icon="info"
            label={t('design.guide')}
            onPress={() => setGuideOpen(true)}
          />
        }
      />

      <LanguageField
        label={t('design.language')}
        value={language}
        onChange={value => value && setLanguage(value)}
      />

      <TextField
        tone="night"
        required
        label={t('design.name')}
        placeholder={t('design.namePlaceholder')}
        value={name}
        onChangeText={setName}
        maxLength={textLimits.voiceName}
        error={
          submitted && !input.name ? t('validation.voiceNameRequired') : undefined
        }
      />

      <TextArea
        tone="night"
        required
        label={t('design.description')}
        placeholder={t('design.descriptionPlaceholder')}
        value={description}
        onChangeText={setDescription}
        maxLength={textLimits.designDescription}
        showCount
        countPlacement="below"
        hint={t('design.descriptionHint')}
        accessory={wand}
        boxClassName="h-textarea"
        error={
          submitted && !input.description
            ? t('validation.descriptionRequired')
            : undefined
        }
      />

      <FormError error={enhance.error ?? generate.error} />

      <Button
        icon="micSparkle"
        label={t('design.submit')}
        loading={generate.isPending}
        onPress={create}
      />

      <ResultsView tool="voiceDesign" mode="recent" />

      <VariationsSheet
        variations={session?.variations ?? null}
        onClose={() => setSession(null)}
        onSave={keep}
        saving={save.isPending}
        error={save.error}
      />
      <TipsSheet
        visible={guideOpen}
        onClose={() => setGuideOpen(false)}
        title={t('design.guideSheet.title')}
        tips={t('design.guideSheet.tips', { returnObjects: true })}
      />
    </View>
  );
}
