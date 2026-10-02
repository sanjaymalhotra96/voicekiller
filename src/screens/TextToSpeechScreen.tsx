import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { KeyboardAvoidingView, Platform, View } from 'react-native';
import {
  Button,
  FormError,
  ScreenHeader,
  SelectField,
  TextField,
} from '@/components';
import {
  insertAtSelection,
  PauseDuration,
  pauseTag,
  TextSelection,
  textLimits,
} from '@/domain';
import {
  CampaignSheet,
  EditorSheet,
  EditorToolbar,
  EmotionSheet,
  PauseSheet,
  SpeechSettingsSheet,
  titleFromScript,
  toGenerateRequest,
  toSpeechRequest,
  useCampaigns,
  useGenerateSpeech,
  usePreviewSpeech,
  ScriptInput,
  UsagePill,
  useSpeechDraft,
} from '@/features/text-to-speech';
import { VoicePickerSheet } from '@/features/voices';
import { usePlayback, useStatusBarStyle } from '@/hooks';

const PREVIEW_ID = 'preview';

export function TextToSpeechScreen() {
  useStatusBarStyle('light-content');
  const { t } = useTranslation();
  const router = useRouter();
  const [sheet, setSheet] = useState<EditorSheet | null>(null);
  const closeSheet = useCallback(() => setSheet(null), []);
  const selectionRef = useRef<TextSelection>({ start: 0, end: 0 });

  // Narrow subscriptions: none of these change while typing the script.
  const title = useSpeechDraft(state => state.title);
  const setTitle = useSpeechDraft(state => state.setTitle);
  const hasScript = useSpeechDraft(state => state.script.trim().length > 0);
  const voiceId = useSpeechDraft(state => state.voice?.id ?? null);
  const setVoice = useSpeechDraft(state => state.setVoice);
  const campaignId = useSpeechDraft(state => state.campaignId);
  const campaigns = useCampaigns();
  const campaignName = campaigns.data?.find(c => c.id === campaignId)?.name;

  const preview = usePreviewSpeech();
  const generate = useGenerateSpeech();
  const playback = usePlayback();
  // Same request as last time -> replay the same audio, no new request.
  const lastPreview = useRef<{ key: string; url: string } | null>(null);
  const previewing = playback.activeId === PREVIEW_ID && playback.playing;

  // Coming back from Acting Instruction reopens the Settings sheet.
  const reopenSettings = useRef(false);
  useFocusEffect(
    useCallback(() => {
      if (reopenSettings.current) {
        reopenSettings.current = false;
        setSheet('settings');
      }
    }, []),
  );

  const browseInstructions = () => {
    reopenSettings.current = true;
    setSheet(null);
    router.push('/acting-instructions');
  };

  const insertPause = (seconds: PauseDuration) => {
    const { script, setScript } = useSpeechDraft.getState();
    const result = insertAtSelection(
      script,
      selectionRef.current,
      pauseTag(seconds),
      textLimits.script,
    );
    if (result) {
      setScript(result.text);
      selectionRef.current = { start: result.cursor, end: result.cursor };
    }
  };

  const onPreview = () => {
    if (previewing) {
      playback.stop();
      return;
    }
    const request = toSpeechRequest(useSpeechDraft.getState());
    if (!request) {
      setSheet('voice');
      return;
    }
    const key = JSON.stringify(request);
    const play = (url: string) => {
      lastPreview.current = { key, url };
      playback.toggle({ id: PREVIEW_ID, audioUrl: url });
    };
    if (lastPreview.current?.key === key) {
      play(lastPreview.current.url);
    } else {
      generate.reset();
      preview.mutate(request, { onSuccess: play });
    }
  };

  const onGenerate = () => {
    const draft = useSpeechDraft.getState();
    const request = toGenerateRequest(draft, titleFromScript(draft.script));
    if (!request) {
      setSheet('voice');
      return;
    }
    playback.stop();
    preview.reset();
    generate.mutate(request, {
      onSuccess: () => {
        draft.clearScript();
        lastPreview.current = null;
        router.navigate('/library');
      },
    });
  };

  return (
    <KeyboardAvoidingView
      className="flex-1"
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View className="flex-1 gap-4 pb-2">
        <ScreenHeader tone="night" title={t('speech.title')} trailing={<UsagePill />} />

        <View className="flex-row gap-3">
          <TextField
            tone="night"
            size="sm"
            placeholder={t('speech.fileName')}
            value={title}
            onChangeText={setTitle}
            maxLength={textLimits.fileTitle}
            returnKeyType="next"
            className="flex-1"
          />
          <SelectField
            tone="night"
            size="sm"
            value={campaignName ?? t('speech.campaign')}
            placeholder={t('speech.campaign')}
            accessibilityLabel={t('speech.campaign')}
            onPress={() => setSheet('campaign')}
            className="max-w-40"
          />
        </View>

        <ScriptInput selectionRef={selectionRef} />

        <EditorToolbar onOpen={setSheet} />

        <FormError error={preview.error ?? generate.error} />

        <View className="flex-row gap-5">
          <Button
            variant="night"
            icon={previewing ? 'stop' : 'play'}
            label={previewing ? t('speech.stopPreview') : t('speech.preview')}
            loading={preview.isPending}
            disabled={!hasScript || generate.isPending}
            onPress={onPreview}
            className="flex-1"
          />
          <Button
            icon="micSparkle"
            label={t('speech.generate')}
            loading={generate.isPending}
            disabled={!hasScript}
            onPress={onGenerate}
            className="flex-1"
          />
        </View>
      </View>

      <VoicePickerSheet
        visible={sheet === 'voice'}
        onClose={closeSheet}
        selectedId={voiceId}
        onSelect={setVoice}
      />
      <EmotionSheet visible={sheet === 'emotion'} onClose={closeSheet} />
      <PauseSheet
        visible={sheet === 'pause'}
        onClose={closeSheet}
        onInsert={insertPause}
      />
      <SpeechSettingsSheet
        visible={sheet === 'settings'}
        onClose={closeSheet}
        onBrowseInstructions={browseInstructions}
      />
      <CampaignSheet visible={sheet === 'campaign'} onClose={closeSheet} />
    </KeyboardAvoidingView>
  );
}
