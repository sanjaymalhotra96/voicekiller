// Route: /voice-design
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
  DesignLanguageId,
  designLanguageIds,
  DesignSession,
  textLimits,
  VoiceVariation,
} from '@/domain';
import { useEnhanceDescription, useGenerateVariations, useSaveDesign } from '@/features/voice-design/hooks';
import { VariationsSheet } from '@/features/voice-design/VariationsSheet';
import { ResultsView } from '@/features/results/ResultsView';
import { useStatusBarStyle } from '@/hooks';
import { iconSize, layout, palette } from '@/theme';

// Describe a voice in words; pick one of the generated variations.
export default function VoiceDesignScreen() {
  useStatusBarStyle('light-content');
  const { t } = useTranslation();
  const [language, setLanguage] = useState<DesignLanguageId>(
    config.defaultLanguage as DesignLanguageId,
  );
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [guideOpen, setGuideOpen] = useState(false);
  const [session, setSession] = useState<DesignSession | null>(null);
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
      { ...input, session, variation },
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
      accessibilityLabel={t('voiceDesign.enhance')}
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
        title={t('voiceDesign.title')}
        trailing={
          <StatusPill
            icon="info"
            label={t('voiceDesign.guide')}
            onPress={() => setGuideOpen(true)}
          />
        }
      />

      <LanguageField
        label={t('voiceDesign.language')}
        value={language}
        onChange={value => value && setLanguage(value)}
        languages={designLanguageIds}
      />

      <TextField
        tone="night"
        required
        label={t('voiceDesign.name')}
        placeholder={t('voiceDesign.namePlaceholder')}
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
        label={t('voiceDesign.description')}
        placeholder={t('voiceDesign.descriptionPlaceholder')}
        value={description}
        onChangeText={setDescription}
        maxLength={textLimits.designDescription}
        showCount
        countPlacement="below"
        hint={t('voiceDesign.descriptionHint')}
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
        label={t('voiceDesign.submit')}
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
        title={t('voiceDesign.guideSheet.title')}
        tips={t('voiceDesign.guideSheet.tips', { returnObjects: true })}
      />
    </View>
  );
}
