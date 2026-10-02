// Voices: catalog IDs, filters and provider capabilities.
// Must match the check constraints on public.voices.

export const voiceProviderIds = [
  'expressive',
  'directable',
  'directablePro',
  'qwenTts',
] as const;
export type VoiceProviderId = (typeof voiceProviderIds)[number];

// What each provider's model accepts. The editor shows the Emotions
// button, the speed/delivery controls and the acting-instruction fields
// only when the selected voice's provider supports them.
type ProviderCapabilities = {
  emotions: boolean;
  actingInstructions: boolean;
  tuning: boolean;
};

const providerCapabilities: Record<
  VoiceProviderId,
  ProviderCapabilities
> = {
  expressive: { emotions: true, actingInstructions: false, tuning: true },
  directable: { emotions: false, actingInstructions: true, tuning: false },
  directablePro: { emotions: true, actingInstructions: true, tuning: false },
  qwenTts: { emotions: false, actingInstructions: false, tuning: true },
};

// Before a voice is chosen: only the basic settings.
export const noVoiceCapabilities: ProviderCapabilities = {
  emotions: false,
  actingInstructions: false,
  tuning: true,
};

// Where a voice comes from. `favorites` is a view over the others.
export const voiceSources = ['library', 'cloned', 'design', 'favorites'] as const;
export type VoiceSource = (typeof voiceSources)[number];

export const genders = ['female', 'male', 'neutral'] as const;
export type Gender = (typeof genders)[number];

// `auto` = no preference (filters) / detect (generation).
export const accentIds = [
  'auto',
  'ar-SA',
  'zh-north',
  'zh-south',
  'de-DE',
  'en-US',
  'en-AU',
  'en-GB',
  'en-IN',
  'en-US-south',
  'en-WA',
  'es-ES',
  'fr-FR',
  'it-IT',
  'ja-JP',
  'ko-KR',
  'pt-BR',
  'ru-RU',
] as const;
export type AccentId = (typeof accentIds)[number];

export const languageIds = [
  'auto',
  'ar',
  'yue',
  'zh',
  'cs',
  'nl',
  'en',
  'fi',
  'fr',
  'de',
  'el',
  'he',
  'hi',
  'hu',
  'id',
  'it',
  'ja',
  'ko',
  'pl',
  'pt',
  'ru',
  'es',
  'sv',
  'tr',
  'uk',
] as const;
export type LanguageId = (typeof languageIds)[number];

export type Voice = {
  id: string;
  name: string;
  description: string;
  provider: VoiceProviderId;
  gender: Gender;
  accent: string;
  language: string;
  source: Exclude<VoiceSource, 'favorites'>;
  previewUrl: string | null;
  isFavorite: boolean;
  createdAt: Date;
};

export type VoiceFilters = {
  provider: VoiceProviderId | 'all';
  gender: Gender | null;
  accent: AccentId;
  language: LanguageId;
};

export const defaultVoiceFilters: VoiceFilters = {
  provider: 'all',
  gender: null,
  accent: 'auto',
  language: 'auto',
};

// Number shown on the filter button badge.
export const activeFilterCount = (filters: VoiceFilters) =>
  [
    filters.provider !== 'all',
    filters.gender !== null,
    filters.accent !== 'auto',
    filters.language !== 'auto',
  ].filter(Boolean).length;

export type VoiceQuery = {
  source: VoiceSource;
  search: string;
  filters: VoiceFilters;
};

// Keyset cursor for the alphabetical voice list.
export type VoiceCursor = { name: string; id: string };

export const isVoiceProviderId = (value: string): value is VoiceProviderId =>
  (voiceProviderIds as readonly string[]).includes(value);

export const isGender = (value: string): value is Gender =>
  (genders as readonly string[]).includes(value);

export const capabilitiesOf = (voice: Pick<Voice, 'provider'> | null) =>
  voice ? providerCapabilities[voice.provider] : noVoiceCapabilities;

export const isLanguageId = (value: string): value is LanguageId =>
  (languageIds as readonly string[]).includes(value);
