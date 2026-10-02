import { useMutation } from '@tanstack/react-query';
import React, { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import {
  AppText,
  AudioPlayerCard,
  BottomSheet,
  Button,
  FormError,
  OptionList,
} from '@/components';
import {
  exportTranscript,
  isRtlLanguage,
  TranscriptFormat,
  transcriptFormats,
  transcriptMimeTypes,
  TranscriptSegment,
} from '@/domain';
import { useLibraryJob } from '@/features/results';
import { SegmentRow } from '@/features/speech-to-text/SegmentRow';
import { shareTextFile } from '@/lib/shareFile';
import { layout } from '@/theme';
import {
  speechToTextService,
  TranscriptionSession,
} from '@/services/mediaTools';

type Props = {
  // Null hides the sheet.
  session: TranscriptionSession | null;
  // Language the segments are written in (translation if any).
  textLanguage: string | null;
  // Base name for exported files ("harvard" -> harvard.srt).
  fileName: string;
  onClose: () => void;
  onSaved: () => void;
};

// Results: listen, fix any line, export subtitles or save to Library.
export function TranscriptSheet({
  session,
  textLanguage,
  fileName,
  onClose,
  onSaved,
}: Props) {
  const { t } = useTranslation();
  return (
    <BottomSheet
      visible={!!session}
      onClose={onClose}
      title={t('stt.sheet.title')}
      height={layout.sheetHeight}
    >
      {session ? (
        <TranscriptContent
          key={session.sessionId}
          session={session}
          rtl={isRtlLanguage(textLanguage)}
          fileName={fileName}
          onSaved={onSaved}
        />
      ) : null}
    </BottomSheet>
  );
}

function TranscriptContent({
  session,
  rtl,
  fileName,
  onSaved,
}: {
  session: TranscriptionSession;
  rtl: boolean;
  fileName: string;
  onSaved: () => void;
}) {
  const { t } = useTranslation();
  const [segments, setSegments] = useState<TranscriptSegment[]>(
    session.segments,
  );
  const [menuOpen, setMenuOpen] = useState(false);
  const save = useLibraryJob(speechToTextService.save);
  const share = useMutation({
    mutationFn: (format: TranscriptFormat) =>
      shareTextFile(
        `${fileName}.${format}`,
        exportTranscript(segments, format),
        transcriptMimeTypes[format],
      ),
  });

  const updateSegment = useCallback(
    (index: number, text: string) =>
      setSegments(list =>
        list.map((segment, i) => (i === index ? { ...segment, text } : segment)),
      ),
    [],
  );

  const formatOptions = useMemo(
    () =>
      transcriptFormats.map(key => ({
        key,
        label: t(`stt.sheet.formats.${key}`),
      })),
    [t],
  );

  return (
    <View className="gap-5">
      <View className="gap-3">
        <AppText variant="label">{t('stt.sheet.audio')}</AppText>
        <AudioPlayerCard uri={session.audioUrl} />
      </View>

      <View className="gap-3">
        <AppText variant="label">{t('stt.sheet.content')}</AppText>
        <View className="gap-5 rounded-xl border border-line-neutral bg-muted p-4">
          {segments.map((segment, index) => (
            <SegmentRow
              key={`${segment.start}-${index}`}
              index={index}
              segment={segment}
              rtl={rtl}
              onChange={updateSegment}
            />
          ))}
        </View>
      </View>

      {menuOpen ? (
        <OptionList
          options={formatOptions}
          onSelect={format => {
            setMenuOpen(false);
            share.mutate(format);
          }}
        />
      ) : null}

      <FormError error={share.error ?? save.error} />

      <View className="flex-row gap-5">
        <Button
          variant="neutral"
          icon={menuOpen ? 'chevronUp' : 'chevronDown'}
          label={t('stt.sheet.download')}
          loading={share.isPending}
          onPress={() => setMenuOpen(open => !open)}
          className="flex-1 flex-row-reverse"
        />
        <Button
          label={t('stt.sheet.save')}
          loading={save.isPending}
          onPress={() =>
            save.mutate(
              { sessionId: session.sessionId, segments },
              { onSuccess: onSaved },
            )
          }
          className="flex-1"
        />
      </View>
    </View>
  );
}
