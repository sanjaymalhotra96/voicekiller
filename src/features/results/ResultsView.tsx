import { useRouter } from 'expo-router';
import React, { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, View } from 'react-native';
import {
  FlashList,
  FlashListRenderItem,
  AppText,
  Button,
  EmptyState,
  FormError,
  RenameSheet,
  TextLink,
} from '@/components';
import { config } from '@/config';
import { LibraryItem, textLimits } from '@/domain';
import {
  ResultsQuery,
  useLibraryResults,
  useVoiceResults,
} from '@/features/results/hooks';
import { ResultCard } from '@/features/results/ResultCard';
import { ResultViewer } from '@/features/results/ResultViewer';
import {
  ResultItem,
  resultSources,
  ResultTool,
  resultsRoute,
  undownloadableTools,
  viewableTools,
} from '@/features/results/types';
import { useResultActions } from '@/features/results/useResultActions';
import { TranscriptDownloadMenu } from '@/features/speech-to-text/TranscriptDownloadMenu';
import { useTranscriptDownload } from '@/features/speech-to-text/useTranscriptDownload';
import { errorMessageKey } from '@/lib/errors';
import { useColors } from '@/theme';
import type { OwnVoiceSource } from '@/services/ownVoices';

// `recent`: section on a tool screen (title, "View all", first few cards,
// no scrolling of its own). `all`: the full, virtualised "My ..." grid.
type Mode = 'recent' | 'all';

type Props = {
  tool: ResultTool;
  mode: Mode;
};

// Results of one tool, whatever their source. Each source has its own
// small component so its data hook is called unconditionally.
export function ResultsView({ tool, mode }: Props) {
  const source = resultSources[tool];
  return source.kind === 'voices' ? (
    <VoiceResults tool={tool} source={source.source} mode={mode} />
  ) : (
    <LibraryResults tool={tool} mode={mode} />
  );
}

function VoiceResults(props: Props & { source: OwnVoiceSource }) {
  return <ResultsBody {...props} query={useVoiceResults(props.source)} />;
}

function LibraryResults(props: Props) {
  return <ResultsBody {...props} query={useLibraryResults(props.tool)} />;
}

function ResultsBody({ tool, mode, query }: Props & { query: ResultsQuery }) {
  const colors = useColors();
  const { t } = useTranslation();
  const router = useRouter();
  const actions = useResultActions(query);
  const transcriptDownload = useTranscriptDownload();
  const { mutate: downloadTranscript, isPending: downloadingTranscript } =
    transcriptDownload;
  const { playback, togglePlay, download, confirmDelete, startRename } =
    actions;
  const playbackState = useMemo(
    () => ({
      id: playback.activeId,
      playing: playback.playing,
      loading: playback.loading,
    }),
    [playback.activeId, playback.playing, playback.loading],
  );
  // Only offered when the source supports them (see ResultsQuery).
  const onRename = query.rename ? startRename : undefined;
  const onDelete = query.remove ? confirmDelete : undefined;
  // "View" for tools whose files have text to show.
  const [viewing, setViewing] = useState<LibraryItem | null>(null);
  const { file } = query;
  const onView = useCallback(
    (item: ResultItem) => {
      playback.stop();
      setViewing(file?.(item.id) ?? null);
    },
    [file, playback.stop],
  );
  const canView = viewableTools.includes(tool) && !!file;
  const isTranscript = tool === 'speechToText';
  const onDownload =
    isTranscript || undownloadableTools.includes(tool) ? undefined : download;

  const renderCard = useCallback(
    (item: ResultItem) => {
      const active = playback.activeId === item.id;
      const transcriptFile = isTranscript ? file?.(item.id) : undefined;
      return (
        <ResultCard
          item={item}
          active={active}
          playing={active && playback.playing}
          loading={active && playback.loading}
          player={playback.player}
          onTogglePlay={togglePlay}
          onRename={onRename}
          onView={canView ? onView : undefined}
          viewPrimary={isTranscript}
          downloadControl={
            isTranscript ? (
              <TranscriptDownloadMenu
                variant="icon"
                accessibilityLabel={t('results.download', { name: item.title })}
                loading={downloadingTranscript}
                disabled={!transcriptFile}
                onSelect={format => {
                  if (transcriptFile)
                    downloadTranscript({ file: transcriptFile, format });
                }}
              />
            ) : undefined
          }
          onDownload={onDownload}
          onDelete={onDelete}
        />
      );
    },
    [
      playback.activeId,
      playback.playing,
      playback.loading,
      playback.player,
      togglePlay,
      onRename,
      canView,
      onView,
      onDownload,
      onDelete,
      isTranscript,
      file,
      t,
      downloadingTranscript,
      downloadTranscript,
    ],
  );
  // FlashList sizes each column; the card fills that column's width.
  const renderItem = useCallback<FlashListRenderItem<ResultItem>>(
    ({ item }) => <View className="w-full p-1.5">{renderCard(item)}</View>,
    [renderCard],
  );

  const viewer = (
    <ResultViewer tool={tool} file={viewing} onClose={() => setViewing(null)} />
  );

  const renameSheet = (
    <RenameSheet
      {...actions.renameSheet}
      title={t('results.renameTitle')}
      label={t('results.renameLabel')}
      placeholder={t('results.renamePlaceholder')}
      maxLength={textLimits.voiceName}
    />
  );

  if (mode === 'recent') {
    const recent = query.items.slice(0, config.media.recentCount);
    return (
      <View className="gap-3">
        <View className="flex-row items-center justify-between">
          <AppText variant="title" className="text-xl text-night-text">
            {t(`results.recent.${tool}`)}
          </AppText>
          {query.items.length > 0 ? (
            <TextLink
              label={t('results.viewAll')}
              tone="accent"
              variant="caption"
              onPress={() => router.push(resultsRoute(tool))}
            />
          ) : null}
        </View>
        {query.isPending ? (
          <ActivityIndicator color={colors.primary.DEFAULT} />
        ) : recent.length > 0 ? (
          <View className="-mx-1.5 flex-row flex-wrap">
            {recent.map(item => (
              <View key={item.id} className="w-1/2 p-1.5">
                {renderCard(item)}
              </View>
            ))}
          </View>
        ) : query.error ? (
          // Could not load: say why, with a retry.
          <View className="flex-row items-center gap-3">
            <FormError error={query.error} className="flex-1" />
            <TextLink
              label={t('library.retry')}
              tone="accent"
              variant="caption"
              onPress={query.refetch}
            />
          </View>
        ) : (
          <AppText variant="caption" className="text-night-subtle">
            {t('results.empty')}
          </AppText>
        )}
        {actions.isDownloading ? (
          <ActivityIndicator color={colors.primary.DEFAULT} />
        ) : null}
        <FormError
          error={
            transcriptDownload.error ??
            actions.downloadError ??
            query.mutationError
          }
        />
        {renameSheet}
        {viewer}
      </View>
    );
  }

  if (query.isPending) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator color={colors.primary.DEFAULT} />
      </View>
    );
  }
  if (query.error) {
    return (
      <EmptyState
        tone="night"
        icon="cloudOff"
        title={t(errorMessageKey(query.error))}
        action={
          <Button
            size="sm"
            icon="refresh"
            label={t('library.retry')}
            onPress={query.refetch}
          />
        }
      />
    );
  }

  return (
    <View className="flex-1 gap-3">
      {actions.isDownloading ? (
        <ActivityIndicator color={colors.primary.DEFAULT} />
      ) : null}
      <FormError
        error={
          transcriptDownload.error ??
          actions.downloadError ??
          query.mutationError
        }
      />
      <FlashList
        data={query.items}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        extraData={playbackState}
        numColumns={2}
        onEndReachedThreshold={0.5}
        onEndReached={query.fetchNextPage}
        ListFooterComponent={
          query.isFetchingNextPage ? (
            <ActivityIndicator
              className="py-4"
              color={colors.primary.DEFAULT}
            />
          ) : null
        }
        ListEmptyComponent={
          <EmptyState
            tone="night"
            icon="folderOpen"
            title={t('results.empty')}
          />
        }
        contentContainerClassName="grow pb-6"
        showsVerticalScrollIndicator={false}
        className="-mx-1.5 flex-1"
      />
      {renameSheet}
      {viewer}
    </View>
  );
}
