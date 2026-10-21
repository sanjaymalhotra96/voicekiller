// Route: /text-to-speech
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Keyboard, KeyboardAvoidingView, Platform, View } from 'react-native';
import {
  Button,
  FormError,
  ScreenHeader,
  SelectField,
  TextField,
} from '@/components';
import {
  insertAtSelection,
  GeneratedSpeech,
  PauseDuration,
  pauseTag,
  speechRulesFor,
  TextSelection,
  textLimits,
} from '@/domain';
import { CampaignSheet } from '@/features/text-to-speech/CampaignSheet';
import { EditorToolbar } from '@/features/text-to-speech/EditorToolbar';
import { EmotionSheet } from '@/features/text-to-speech/EmotionSheet';
import { GeneratedSpeechPlayer } from '@/features/text-to-speech/GeneratedSpeechPlayer';
import {
  useDefaultVoice,
  useGenerateSpeech,
  usePreviewSpeech,
} from '@/features/text-to-speech/hooks';
import { PauseSheet } from '@/features/text-to-speech/PauseSheet';
import { defaultFileName, toGenerateRequest, toSpeechRequest } from '@/features/text-to-speech/request';
import { ScriptInput } from '@/features/text-to-speech/ScriptInput';
import { SpeechSettingsSheet } from '@/features/text-to-speech/SpeechSettingsSheet';
import { useSpeechDraft } from '@/features/text-to-speech/store';
import { EditorSheet } from '@/features/text-to-speech/types';
import { useDefaultInstruction } from '@/features/text-to-speech/useDefaultInstruction';
import { VoicePickerSheet } from '@/features/voices/VoicePickerSheet';
import { usePlayback, useStatusBarStyle, useUnmountSignal } from '@/hooks';

const PREVIEW_ID = 'preview';

export default function TextToSpeechScreen() {
  useStatusBarStyle('light-content');
  const { t } = useTranslation();
  const router = useRouter();
  const [sheet, setSheet] = useState<EditorSheet | null>(null);
  const [generatedSpeech, setGeneratedSpeech] = useState<GeneratedSpeech | null>(null);
  const closeSheet = useCallback(() => setSheet(null), []);
  const selectionRef = useRef<TextSelection>({ start: 0, end: 0 });

  // Narrow subscriptions: none of these change while typing the script.
  const title = useSpeechDraft(state => state.title);
  const setTitle = useSpeechDraft(state => state.setTitle);
  const hasScript = useSpeechDraft(state => state.script.trim().length > 0);
  const scriptOverLimit = useSpeechDraft(
    state => state.script.length > speechRulesFor(state.voice).scriptLimit,
  );
  const voiceId = useSpeechDraft(state => state.voice?.id ?? null);
  const setVoice = useSpeechDraft(state => state.setVoice);
  const campaignName = useSpeechDraft(state => state.campaignName);

  // First visit: preselect a voice; later visits keep the last used one.
  useDefaultVoice();
  useDefaultInstruction();
  const preview = usePreviewSpeech();
  const generate = useGenerateSpeech();
  // Leaving the screen stops waiting for the file (the server still
  // saves it in Library).
  const unmountSignal = useUnmountSignal();
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
    const { script, setScript, voice } = useSpeechDraft.getState();
    const rules = speechRulesFor(voice);
    if (!rules.pauses) return;
    const result = insertAtSelection(
      script,
      selectionRef.current,
      pauseTag(seconds),
      rules.scriptLimit,
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
    if (draft.script.length > speechRulesFor(draft.voice).scriptLimit) return;
    const request = toGenerateRequest(draft, defaultFileName());
    if (!request) {
      setSheet('voice');
      return;
    }
    playback.stop();
    preview.reset();
    generate.mutate({ ...request, signal: unmountSignal() }, {
      onSuccess: speech => {
        draft.clearScript();
        lastPreview.current = null;
        Keyboard.dismiss();
        setGeneratedSpeech(speech);
        playback.toggle(speech);
      },
    });
  };

  return (
    <KeyboardAvoidingView
      className="flex-1"
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View className="flex-1 gap-4 pb-2">
        <ScreenHeader tone="night" title={t('textToSpeech.title')} />

        <View className="flex-row gap-3">
          <TextField
            tone="night"
            size="sm"
            placeholder={t('textToSpeech.fileName')}
            value={title}
            onChangeText={setTitle}
            maxLength={textLimits.fileTitle}
            returnKeyType="next"
            className="flex-1"
          />
          <SelectField
            tone="night"
            size="sm"
            value={campaignName ?? t('textToSpeech.campaign')}
            placeholder={t('textToSpeech.campaign')}
            accessibilityLabel={t('textToSpeech.campaign')}
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
            label={previewing ? t('textToSpeech.stopPreview') : t('textToSpeech.preview')}
            loading={
              preview.isPending ||
              (playback.activeId === PREVIEW_ID && playback.loading)
            }
            disabled={!hasScript || generate.isPending}
            onPress={onPreview}
            className="flex-1"
          />
          <Button
            icon="micSparkle"
            label={t('textToSpeech.generate')}
            loading={generate.isPending}
            disabled={!hasScript || scriptOverLimit}
            onPress={onGenerate}
            className="flex-1"
          />
        </View>
        {generatedSpeech ? (
          <GeneratedSpeechPlayer
            key={generatedSpeech.id}
            speech={generatedSpeech}
            player={playback.player}
            active={playback.activeId === generatedSpeech.id}
            playing={playback.playing}
            loading={playback.loading}
            onTogglePlay={() => playback.toggle(generatedSpeech)}
            onClose={() => {
              if (playback.activeId === generatedSpeech.id) playback.stop();
              setGeneratedSpeech(null);
            }}
          />
        ) : null}
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
