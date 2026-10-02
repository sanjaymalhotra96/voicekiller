import { useMutation } from '@tanstack/react-query';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import {
  AppText,
  AudioPlayerCard,
  BottomSheet,
  Button,
  FormError,
  TextArea,
} from '@/components';
import { textLimits } from '@/domain';
import { useLibraryJob } from '@/features/results';
import { layout } from '@/theme';
import { EditorSession, speechEditorService } from '@/services/mediaTools';

type Props = {
  // Null hides the sheet.
  session: EditorSession | null;
  onClose: () => void;
  onSaved: () => void;
};

// Edit the transcription of an uploaded recording, regenerate the audio
// from the edited text, then save it to Library.
export function EditorSheet({ session, onClose, onSaved }: Props) {
  const { t } = useTranslation();
  return (
    <BottomSheet
      visible={!!session}
      onClose={onClose}
      title={t('editor.sheet.title')}
      height={layout.sheetHeight}
    >
      {/* Keyed by session so each new upload starts from a clean editor. */}
      {session ? (
        <EditorContent key={session.sessionId} session={session} onSaved={onSaved} />
      ) : null}
    </BottomSheet>
  );
}

function EditorContent({
  session,
  onSaved,
}: {
  session: EditorSession;
  onSaved: () => void;
}) {
  const { t } = useTranslation();
  const [transcript, setTranscript] = useState(session.transcript);
  const [audioUrl, setAudioUrl] = useState(session.audioUrl);
  // The text the current audio was made from.
  const [voicedText, setVoicedText] = useState(session.transcript);
  const synthesize = useMutation({ mutationFn: speechEditorService.synthesize });
  const save = useLibraryJob(speechEditorService.save);

  const edited = transcript !== session.transcript;
  const needsAudio = transcript.trim() !== voicedText.trim();

  const revert = () => {
    setTranscript(session.transcript);
    setVoicedText(session.transcript);
    setAudioUrl(session.audioUrl);
    synthesize.reset();
  };

  const generate = () =>
    synthesize.mutate(
      { sessionId: session.sessionId, transcript },
      {
        onSuccess: url => {
          setAudioUrl(url);
          setVoicedText(transcript);
        },
      },
    );

  return (
    <View className="gap-5">
      <View className="gap-3">
        <AppText variant="label">{t('editor.sheet.audio')}</AppText>
        <AudioPlayerCard key={audioUrl} uri={audioUrl} />
      </View>

      <View className="gap-3">
        <AppText variant="label">{t('editor.sheet.transcription')}</AppText>
        <TextArea
          tone="muted"
          accessibilityLabel={t('editor.sheet.transcription')}
          value={transcript}
          onChangeText={setTranscript}
          maxLength={textLimits.script}
          boxClassName="h-textarea"
        />
      </View>

      <View className="flex-row gap-5">
        <Button
          variant="neutral"
          label={t('editor.sheet.revert')}
          disabled={!edited}
          onPress={revert}
          className="flex-1"
        />
        <Button
          variant="outline"
          label={t('editor.sheet.generate')}
          loading={synthesize.isPending}
          disabled={!needsAudio || !transcript.trim()}
          onPress={generate}
          className="flex-1"
        />
      </View>

      <FormError error={synthesize.error ?? save.error} />

      <Button
        className="mt-6"
        label={t('editor.sheet.save')}
        loading={save.isPending}
        // Save what you hear: regenerate first if the text changed.
        disabled={needsAudio || synthesize.isPending}
        onPress={() =>
          save.mutate(
            { sessionId: session.sessionId, transcript },
            { onSuccess: onSaved },
          )
        }
      />
    </View>
  );
}
