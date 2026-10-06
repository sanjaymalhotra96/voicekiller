// Voices: models, filters and what each provider accepts.

// What the user sees instead of the API provider. The catalog
// (public.voices) stores the provider: Gemini voices are Directable Pro,
// OpenAI voices Directable, every other provider Expressive.
export const voiceModels = ['expressive', 'directable', 'directablePro'] as const;
export type VoiceModel = (typeof voiceModels)[number];

// API provider ids that have a model of their own (see modelOf).
export const modelProviders = {
  directablePro: 'Gemini',
  directable: 'OpenAI',
} as const satisfies Partial<Record<VoiceModel, string>>;

export const modelOf = (provider: string): VoiceModel =>
  provider === modelProviders.directablePro
    ? 'directablePro'
    : provider === modelProviders.directable
    ? 'directable'
    : 'expressive';

// Provider ids of the user's own voices.
export const cloneProvider = 'custom';
export const designProvider = 'design';

// What a provider's model accepts (POST /api/tts). The editor shows the
// Emotions button, speed, delivery and acting instructions only when the
// selected voice's provider takes them.
// Speeds a provider accepts (x normal), or null when it takes none.
export type SpeedLimits = { min: number; max: number };

// Inworld (also clones and designs): 0.5 to 1.5. Minimax: 0.5 to 2.
const inworldSpeed: SpeedLimits = { min: 0.5, max: 1.5 };
const minimaxSpeed: SpeedLimits = { min: 0.5, max: 2 };

type ProviderCapabilities = {
  emotions: boolean;
  actingInstructions: boolean;
  speed: SpeedLimits | null;
  delivery: boolean;
};

const none: ProviderCapabilities = {
  emotions: false,
  actingInstructions: false,
  speed: null,
  delivery: false,
};

const providerCapabilities: Partial<Record<string, ProviderCapabilities>> = {
  Gemini: { ...none, actingInstructions: true },
  OpenAI: { ...none, actingInstructions: true },
  'Qwen-tts': { ...none, actingInstructions: true },
  // Inworld, and Minimax voices on Inworld.
  IN: { ...none, speed: inworldSpeed, delivery: true },
  v4in: { ...none, speed: inworldSpeed, delivery: true },
  // Minimax.
  v4: { ...none, emotions: true, speed: minimaxSpeed },
  [cloneProvider]: { ...none, speed: inworldSpeed },
  [designProvider]: { ...none, speed: inworldSpeed },
};

// Clones made with the V2 engine take emotions (POST /api/tts/clone).
const v2CloneCapabilities: ProviderCapabilities = { ...none, emotions: true };

// Where a voice comes from. `favorites` is a view over the others.
export const voiceSources = ['library', 'cloned', 'design', 'favorites'] as const;
export type VoiceSource = (typeof voiceSources)[number];

export const genders = ['female', 'male', 'neutral'] as const;
export type Gender = (typeof genders)[number];

// Locales of the catalog voices. `auto` = no preference.
export const accentIds = [
  'auto',
  'ar-001',
  'ar-EG',
  'cs-CZ',
  'de-DE',
  'el-GR',
  'en-AU',
  'en-CA',
  'en-GB',
  'en-IE',
  'en-IN',
  'en-NZ',
  'en-US',
  'en-ZA',
  'es-419',
  'es-ES',
  'fr-CA',
  'fr-FR',
  'hi-IN',
  'it-IT',
  'ja-JP',
  'jv-ID',
  'ko-KR',
  'nl-NL',
  'pl-PL',
  'pt-BR',
  'pt-PT',
  'sw-KE',
  'ta-IN',
  'te-IN',
  'vi-VN',
  'zh-CN',
] as const;
export type AccentId = (typeof accentIds)[number];

// `auto` = no preference (filters) / detect (generation).
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
  // Unique in a list: `${provider}:${voice}` (also the favourites key).
  id: string;
  // What the API calls the voice (metadata.voice).
  voice: string;
  name: string;
  description: string;
  // API provider ("Gemini", "v4in", "custom"...). Never shown: see modelOf.
  provider: string;
  gender: Gender;
  // Locale, e.g. "en-US"; empty when unknown.
  accent: string;
  // Language name, e.g. "English (United States)"; empty when unknown.
  language: string;
  source: Exclude<VoiceSource, 'favorites'>;
  previewUrl: string | null;
  // Null when the API does not send one.
  createdAt: Date | null;
  // Plan the voice belongs to, sent with each generation.
  plan: string | null;
  // Own voices: the record id the API deletes by.
  recordId: string | null;
  // Cloned voices: the clone engine ("V1", "V2", "V3").
  cloneEngine: string | null;
};

export const voiceKey = (provider: string, voice: string) => `${provider}:${voice}`;

// A saved favourite (GET /api/tts/get-favorite). The whole list is saved
// at once when one is added or removed.
export type FavoriteVoice = {
  displayName: string;
  voice: string;
  provider: string;
};

export type VoiceFilters = {
  model: VoiceModel | 'all';
  gender: Gender | null;
  accent: AccentId;
  language: LanguageId;
};

export const defaultVoiceFilters: VoiceFilters = {
  model: 'all',
  gender: null,
  accent: 'auto',
  language: 'auto',
};

// Number shown on the filter button badge.
export const activeFilterCount = (filters: VoiceFilters) =>
  [
    filters.model !== 'all',
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

// "Female" -> "female"; anything else is neutral.
export const toGender = (value: string | null | undefined): Gender => {
  const lower = (value ?? '').toLowerCase();
  return (genders as readonly string[]).includes(lower)
    ? (lower as Gender)
    : 'neutral';
};

// Before a voice is chosen, or an unknown provider: output format only.
export const capabilitiesOf = (
  voice: Pick<Voice, 'provider' | 'cloneEngine'> | null,
): ProviderCapabilities => {
  if (!voice) return none;
  if (voice.cloneEngine === 'V2') return v2CloneCapabilities;
  return providerCapabilities[voice.provider] ?? none;
};

export const isLanguageId = (value: string): value is LanguageId =>
  (languageIds as readonly string[]).includes(value);
