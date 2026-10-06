import type { LanguageId } from '@/domain/voices';

// Voice Design: describe a voice, get variations, keep one.

// Languages the designer speaks, with the name the API expects.
export const designLanguages = {
  en: 'English',
  zh: 'Chinese',
  ko: 'Korean',
  ja: 'Japanese',
  ar: 'Arabic',
  pl: 'Polish',
  nl: 'Dutch',
  hi: 'Hindi',
  he: 'Hebrew',
  de: 'German',
  fr: 'French',
  ru: 'Russian',
  pt: 'Portuguese',
  es: 'Spanish',
  it: 'Italian',
} as const satisfies Partial<Record<LanguageId, string>>;
export type DesignLanguageId = keyof typeof designLanguages;
export const designLanguageIds = Object.keys(designLanguages) as DesignLanguageId[];

// One generated candidate voice, playable before it is saved.
export type VoiceVariation = {
  // Draft voice id, sent back to keep this one.
  id: string;
  // Local file with the preview audio.
  previewUrl: string | null;
  // The sample sentence the variation reads.
  text: string;
  // The preview audio itself; the save call needs it.
  audioBase64: string;
};

// What Create Voice returns: the variations and the description the
// server built (with the language line), which the save call needs.
export type DesignSession = {
  description: string;
  variations: VoiceVariation[];
};

export type DesignVoiceInput = {
  name: string;
  language: DesignLanguageId;
  description: string;
};
