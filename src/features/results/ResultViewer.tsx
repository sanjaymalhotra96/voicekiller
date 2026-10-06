import { useQuery } from '@tanstack/react-query';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, View } from 'react-native';
import { Button, FormError } from '@/components';
import type { LibraryItem } from '@/domain';
import type { ResultTool } from '@/features/results/types';
import { EditorSheet } from '@/features/speech-editor/EditorSheet';
import { TranscriptSheet } from '@/features/speech-to-text/TranscriptSheet';
import { queryKeys } from '@/lib/queryKeys';
import { speechEditorService } from '@/services/speechEditor';
import { speechToTextService } from '@/services/speechToText';
import { palette } from '@/theme';

type Props = {
  tool: ResultTool;
  // The file to show; null hides the viewer.
  file: LibraryItem | null;
  onClose: () => void;
};

// "View" on a result card: opens a saved transcription (Speech to Text) or
// editor file (Speech Editor) in the same sheet the tool shows after a job.
// The sheet opens at full size at once; the file loads inside it.
export function ResultViewer({ tool, file, onClose }: Props) {
  if (tool === 'speechToText') {
    return <TranscriptViewer file={file} onClose={onClose} />;
  }
  if (tool === 'speechEditor') {
    return <EditorViewer file={file} onClose={onClose} />;
  }
  return null;
}

type ViewerProps = Omit<Props, 'tool'>;

function TranscriptViewer({ file, onClose }: ViewerProps) {
  const session = useQuery({
    queryKey: queryKeys.results.view(file?.id),
    queryFn: () =>
      speechToTextService.open({
        rowId: file!.rowId,
        audioUrl: file!.audioUrl,
        transcriptUrl: file!.metadata.transcriptUrl,
      }),
    enabled: !!file,
  });
  return (
    <TranscriptSheet
      visible={!!file}
      session={file ? session.data ?? null : null}
      placeholder={<Loading query={session} />}
      textLanguage={null}
      fileName={file?.title || 'transcript'}
      onClose={onClose}
      onSaved={onClose}
    />
  );
}

function EditorViewer({ file, onClose }: ViewerProps) {
  const session = useQuery({
    queryKey: queryKeys.results.view(file?.id),
    queryFn: () =>
      speechEditorService.open({ rowId: file!.rowId, fileUrl: file!.fileUrl }),
    enabled: !!file,
  });
  return (
    <EditorSheet
      visible={!!file}
      session={file ? session.data ?? null : null}
      placeholder={<Loading query={session} />}
      onClose={onClose}
      onSaved={onClose}
    />
  );
}

// Inside the sheet while the file loads, or when it could not be loaded.
function Loading({
  query,
}: {
  query: { error: unknown; isError: boolean; refetch: () => unknown };
}) {
  const { t } = useTranslation();
  if (query.isError) {
    return (
      <View className="gap-4">
        <FormError error={query.error} />
        <Button
          size="sm"
          icon="refresh"
          label={t('library.retry')}
          onPress={() => query.refetch()}
        />
      </View>
    );
  }
  return (
    <View className="flex-1 items-center justify-center py-16">
      <ActivityIndicator color={palette.primary.DEFAULT} />
    </View>
  );
}
