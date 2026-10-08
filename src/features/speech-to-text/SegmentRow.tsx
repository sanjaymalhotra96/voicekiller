import React, { memo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { TextInput, View } from 'react-native';
import { AppText, IconButton, textVariants } from '@/components';
import { formatTimestamp, TranscriptSegment } from '@/domain';
import { useColors } from '@/theme';
import { cn } from '@/utils';

type Props = {
  index: number;
  segment: TranscriptSegment;
  rtl: boolean;
  onChange: (index: number, text: string) => void;
};

// One timed line: "00:00:00,100 -> 00:00:03,050  #1", its text, and a
// pencil that turns the text into an inline editor.
export const SegmentRow = memo(function SegmentRowInner({
  index,
  segment,
  rtl,
  onChange,
}: Props) {
  const colors = useColors();
  const { t } = useTranslation();
  const [editing, setEditing] = useState(false);
  const number = index + 1;
  const textStyle = { writingDirection: rtl ? 'rtl' : 'ltr' } as const;

  return (
    <View className="gap-2">
      <View className="flex-row items-center gap-2">
        <View className="rounded bg-primary-soft px-2 py-1">
          <AppText variant="caption" className="text-primary">
            {`${formatTimestamp(segment.start)} → ${formatTimestamp(segment.end)}`}
          </AppText>
        </View>
        <View className="rounded bg-tone-blue-tile px-2 py-1">
          <AppText variant="caption" className="text-tone-blue">
            {t('speechToText.sheet.segment', { number })}
          </AppText>
        </View>
      </View>
      <View className="flex-row items-start gap-3">
        {editing ? (
          <TextInput
            multiline
            autoFocus
            value={segment.text}
            onChangeText={text => onChange(index, text)}
            accessibilityLabel={t('speechToText.sheet.edit', { number })}
            selectionColor={colors.primary.DEFAULT}
            className={cn(
              'flex-1 rounded-lg border border-primary bg-surface px-3 py-2',
              textVariants.body,
              'text-ink',
            )}
            style={textStyle}
          />
        ) : (
          <AppText
            variant="body"
            className={cn('flex-1 text-ink', rtl && 'text-right')}
            style={textStyle}
          >
            {segment.text}
          </AppText>
        )}
        <IconButton
          variant="ghost"
          icon={editing ? 'check' : 'edit'}
          color={colors.ink.muted}
          accessibilityLabel={
            editing
              ? t('speechToText.sheet.done', { number })
              : t('speechToText.sheet.edit', { number })
          }
          onPress={() => setEditing(value => !value)}
        />
      </View>
    </View>
  );
});
