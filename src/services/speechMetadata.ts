import {
  capabilitiesOf,
  cloneProvider,
  EmotionId,
  snapSpeed,
  SpeechRequest,
} from '@/domain';

// The `metadata` body of POST /api/tts and /api/tts/clone: only what the
// chosen voice's provider accepts. Pure, so it is unit tested
// (speechMetadata.test.ts).

// Providers that take { speed, volume, pitch, emotion? } as voiceOptions.
const voiceOptionProviders = new Set(['IN', 'v4', 'v4in']);

// V2 clone emotion sliders, in the API's order: happy, angry, sad, fear,
// hate, low, surprise, natural.
const v2Emotions: readonly EmotionId[] = [
  'happy',
  'angry',
  'sad',
  'fearful',
  'disgusted',
  'calm',
  'surprised',
  'fluent',
];
// Strength of the chosen emotion (the API wants the sum under 1.5).
const v2EmotionWeight = 0.8;

// "English (United States)" -> "English".
const languageName = (language: string) => language.replace(/\s*\(.*\)$/, '');

export const isV2Clone = (request: SpeechRequest) =>
  request.voice.cloneEngine === 'V2';

// The `metadata` body: only what the voice's provider accepts.
export function toMetadata({ script, voice, emotion, settings, instructions }: SpeechRequest) {
  const can = capabilitiesOf(voice);
  const metadata: Record<string, unknown> = {
    script,
    voice: voice.voice,
    provider: voice.provider,
    format: settings.format,
    audioQuality: 'low',
    character_count: script.length,
  };
  if (voice.plan) metadata.plan = voice.plan;
  if (voice.accent) metadata.language = voice.accent;
  if (can.actingInstructions && instructions) metadata.instructions = instructions;
  // A speed saved for another voice may be outside this one's limits.
  const speed = can.speed ? snapSpeed(settings.speed, can.speed) : 1;
  if (can.speed) metadata.speed = speed;
  if (can.delivery) metadata.deliveryMode = settings.delivery.toUpperCase();
  if (voiceOptionProviders.has(voice.provider)) {
    metadata.voiceOptions = {
      speed,
      volume: 1,
      pitch: 0,
      ...(emotion ? { emotion } : null),
    };
  }
  if (voice.provider === 'Qwen-tts' && voice.language) {
    metadata.languageType = languageName(voice.language);
  }
  if (voice.provider === cloneProvider) {
    metadata.sample = voice.previewUrl;
    metadata.CloneProvider = voice.cloneEngine;
  }
  if (isV2Clone({ script, voice, emotion, settings, instructions })) {
    metadata.modelData = {
      selectedModel: 'V2',
      method: emotion ? 'manual' : '',
      ...(emotion
        ? {
            manualControls: v2Emotions.map(id => (id === emotion ? v2EmotionWeight : 0)),
          }
        : null),
    };
  }
  return metadata;
}
