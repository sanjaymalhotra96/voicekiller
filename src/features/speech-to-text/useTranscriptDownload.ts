import {
  queryOptions,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';
import { useRef } from 'react';
import {
  exportTranscript,
  isTimedTranscriptSegment,
  LibraryItem,
  TranscriptFormat,
  transcriptMimeTypes,
  TranscriptSegment,
} from '@/domain';
import { AppError } from '@/lib/errors';
import { queryKeys } from '@/lib/queryKeys';
import { shareTextFile } from '@/lib/shareFile';
import { speechToTextService } from '@/services/speechToText';

// Viewing and downloading the same saved result share one cached JSON request.
export const savedTranscriptQuery = (file: LibraryItem | null) =>
  queryOptions({
    queryKey: queryKeys.results.view(file?.id),
    enabled: !!file,
    queryFn: () => {
      if (!file) throw new AppError('notFound');
      return speechToTextService.open({
        rowId: file.rowId,
        audioUrl: file.audioUrl,
        transcriptUrl: file.metadata.transcriptUrl,
      });
    },
  });

type Download = { format: TranscriptFormat } & (
  | { file: LibraryItem }
  | { segments: TranscriptSegment[]; fileName: string }
);

export function useTranscriptDownload() {
  const client = useQueryClient();
  const busy = useRef(false);
  return useMutation({
    mutationFn: async (download: Download) => {
      if (busy.current) return;
      busy.current = true;
      try {
        const segments =
          'file' in download
            ? (await client.fetchQuery(savedTranscriptQuery(download.file)))
                .segments
            : download.segments;
        const name =
          'file' in download ? download.file.title : download.fileName;
        if (!segments.length) throw new AppError('transcriptUnavailable');
        if (
          download.format !== 'txt' &&
          !segments.every(isTimedTranscriptSegment)
        ) {
          throw new AppError('transcriptTimingUnavailable');
        }
        await shareTextFile(
          `${name}.${download.format}`,
          exportTranscript(segments, download.format),
          transcriptMimeTypes[download.format],
        );
      } finally {
        busy.current = false;
      }
    },
  });
}
