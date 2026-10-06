import { useMutation } from '@tanstack/react-query';
import React, { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FlatList, ListRenderItem, View } from 'react-native';
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
import { SegmentRow } from '@/features/speech-to-text/SegmentRow';
import { shareTextFile } from '@/lib/shareFile';
import { config } from '@/config';
import { layout } from '@/theme';
import { cn } from '@/utils';
import type { TranscriptionSession } from '@/services/speechToText';

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

// Results: listen, fix any line and export subtitles. The server already
// saved the transcript in Library.
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
      title={t('speechToText.sheet.title')}
      height={layout.sheetHeight}
      // The transcript is a virtualised list: it scrolls by itself.
      scrollable={false}
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
        label: t(`speechToText.sheet.formats.${key}`),
      })),
    [t],
  );

  const lastIndex = segments.length - 1;
  // Each line is one list row; together they draw the bordered box of the
  // design (rounded top on the first row, bottom on the last).
  const renderItem = useCallback<ListRenderItem<TranscriptSegment>>(
    ({ item, index }) => (
      <View
        className={cn(
          'border-x border-line-neutral bg-muted px-4 pb-5',
          index === 0 && 'rounded-t-xl border-t pt-4',
          index === lastIndex && 'rounded-b-xl border-b pb-4',
        )}
      >
        <SegmentRow
          index={index}
          segment={item}
          rtl={rtl}
          onChange={updateSegment}
        />
      </View>
    ),
    [lastIndex, rtl, updateSegment],
  );

  const header = (
    <View className="gap-3 pb-3">
      <View className="gap-3 pb-2">
        <AppText variant="label">{t('speechToText.sheet.audio')}</AppText>
        <AudioPlayerCard uri={session.audioUrl} />
      </View>
      <AppText variant="label">{t('speechToText.sheet.content')}</AppText>
    </View>
  );

  const footer = (
    <View className="gap-5 pt-5">
      {menuOpen ? (
        <OptionList
          options={formatOptions}
          onSelect={format => {
            setMenuOpen(false);
            share.mutate(format);
          }}
        />
      ) : null}

      <FormError error={share.error} />

      <View className="flex-row gap-5">
        <Button
          variant="neutral"
          icon={menuOpen ? 'chevronUp' : 'chevronDown'}
          label={t('speechToText.sheet.download')}
          loading={share.isPending}
          onPress={() => setMenuOpen(open => !open)}
          className="flex-1 flex-row-reverse"
        />
        <Button
          label={t('speechToText.sheet.finish')}
          onPress={onSaved}
          className="flex-1"
        />
      </View>
    </View>
  );

  return (
    <FlatList
      data={segments}
      keyExtractor={(segment, index) => `${segment.start}-${index}`}
      renderItem={renderItem}
      ListHeaderComponent={header}
      ListFooterComponent={footer}
      {...config.speechToText.list}
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="on-drag"
      // iOS: the line being edited stays above the keyboard.
      automaticallyAdjustKeyboardInsets
      showsVerticalScrollIndicator={false}
      className="flex-1"
    />
  );
}
