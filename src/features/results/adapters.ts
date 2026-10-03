import type { TFunction } from 'i18next';
import { isLanguageId, LibraryItem, Voice } from '@/domain';
import type { ResultItem } from '@/features/results/types';
import type { OwnVoiceSource } from '@/services/ownVoices';

const languageTag = (language: string | undefined, t: TFunction) =>
  language
    ? {
        label: isLanguageId(language) ? t(`languages.${language}`) : language,
        icon: 'languages' as const,
      }
    : undefined;

// A Library file as a result card.
export function fromLibraryItem(item: LibraryItem, t: TFunction): ResultItem {
  let tag: ResultItem['tag'];
  if (item.tool === 'audioClean' && item.metadata.enhanced) {
    tag = { label: t('results.enhanced') };
  }
  return {
    id: item.id,
    title: item.title || t('library.untitled'),
    audioUrl: item.audioUrl,
    createdAt: item.createdAt,
    tag,
  };
}

// A cloned or designed voice as a result card.
export function fromVoice(
  voice: Voice,
  source: OwnVoiceSource,
  t: TFunction,
): ResultItem {
  return {
    id: voice.id,
    title: voice.name,
    audioUrl: voice.previewUrl,
    createdAt: voice.createdAt,
    tag: source === 'design' ? languageTag(voice.language, t) : undefined,
  };
}
