import React, { ReactNode, useState } from 'react';
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
import { keptWordTimes, textLimits } from '@/domain';
import { useLibraryJob } from '@/features/results/hooks';
import { layout } from '@/theme';
import { EditorSession, speechEditorService } from '@/services/speechEditor';

type Props = {
  // Null hides the sheet, unless `visible` is set.
  session: EditorSession | null;
  // Open even before `session` (shows `placeholder` until then).
  visible?: boolean;
  placeholder?: ReactNode;
  onClose: () => void;
  onSaved: () => void;
};

// Edit the transcription of an uploaded recording and regenerate the
// audio from the edited text. Each regenerated audio is saved on the
// Library file by the server.
export function EditorSheet({
  session,
  visible = !!session,
  placeholder = null,
  onClose,
  onSaved,
}: Props) {
  const { t } = useTranslation();
  return (
    <BottomSheet
      visible={visible}
      onClose={onClose}
      title={t('speechEditor.sheet.title')}
      height={layout.sheetHeight}
    >
      {/* Keyed by session so each new upload starts from a clean editor. */}
      {session ? (
        <EditorContent
          key={session.fileId}
          session={session}
          onSaved={onSaved}
        />
      ) : (
        placeholder
      )}
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
  const [audioUrl, setAudioUrl] = useState(session.mediaUrl);
  // The text the current audio was made from.
  const [voicedText, setVoicedText] = useState(session.transcript);
  // After a regeneration the original word timings no longer apply.
  const [regenerated, setRegenerated] = useState(false);
  const synthesize = useLibraryJob(speechEditorService.inpaint);

  const edited = transcript !== session.transcript;
  const needsAudio = transcript.trim() !== voicedText.trim();

  const revert = () => {
    setTranscript(session.transcript);
    setVoicedText(session.transcript);
    setAudioUrl(session.mediaUrl);
    setRegenerated(false);
    synthesize.reset();
  };

  const generate = () =>
    synthesize.mutate(
      {
        session,
        inputText: voicedText,
        outputText: transcript.trim(),
        wordTimes: regenerated ? [] : keptWordTimes(session.words, transcript),
      },
      {
        onSuccess: url => {
          setAudioUrl(url);
          setVoicedText(transcript);
          setRegenerated(true);
        },
      },
    );

  return (
    <View className="gap-5">
      <View className="gap-3">
        <AppText variant="label">{t('speechEditor.sheet.audio')}</AppText>
        <AudioPlayerCard key={audioUrl} uri={audioUrl} />
      </View>

      <View className="gap-3">
        <AppText variant="label">
          {t('speechEditor.sheet.transcription')}
        </AppText>
        <TextArea
          tone="muted"
          accessibilityLabel={t('speechEditor.sheet.transcription')}
          value={transcript}
          onChangeText={setTranscript}
          maxLength={textLimits.script}
          boxClassName="h-textarea"
        />
      </View>

      <View className="flex-row gap-5">
        <Button
          variant="neutral"
          label={t('speechEditor.sheet.revert')}
          disabled={!edited}
          onPress={revert}
          className="flex-1"
        />
        <Button
          variant="outline"
          label={t('speechEditor.sheet.generate')}
          loading={synthesize.isPending}
          disabled={!needsAudio || !transcript.trim()}
          onPress={generate}
          className="flex-1"
        />
      </View>

      <FormError error={synthesize.error} />

      <Button
        className="mt-6"
        label={t('speechEditor.sheet.done')}
        disabled={synthesize.isPending}
        onPress={onSaved}
      />
    </View>
  );
}
