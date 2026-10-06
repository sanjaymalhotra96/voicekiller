import type { SpeedLimits, Voice } from '@/domain/voices';

// Text to Speech: settings, emotions, pauses and script helpers.

export const emotionIds = [
  'auto',
  'happy',
  'sad',
  'angry',
  'fearful',
  'disgusted',
  'surprised',
  'calm',
  'fluent',
] as const;
export type EmotionId = (typeof emotionIds)[number];

// Seconds offered by "Add pause".
export const pauseDurations = [0.5, 1, 1.5, 2, 2.5] as const;
export type PauseDuration = (typeof pauseDurations)[number];

export const audioFormats = ['mp3', 'wav'] as const;
type AudioFormat = (typeof audioFormats)[number];

export const deliveryModes = ['stable', 'balanced', 'creative'] as const;
type DeliveryMode = (typeof deliveryModes)[number];

export const speedRange = { min: 0.5, max: 2, step: 0.1 } as const;
export const speedPresets = [0.5, 0.8, 1, 1.2, 2] as const;

export type SpeechSettings = {
  format: AudioFormat;
  speed: number;
  delivery: DeliveryMode;
};

export const defaultSpeechSettings: SpeechSettings = {
  format: 'mp3',
  speed: 1,
  delivery: 'balanced',
};

// Clamp to the limits (default: the whole range) and round to one step
// (no 1.2000000002).
export function snapSpeed(value: number, limits: SpeedLimits = speedRange) {
  const { min, max } = limits;
  const { step } = speedRange;
  const clamped = Math.min(max, Math.max(min, value));
  const steps = Math.round((clamped - min) / step);
  return Math.round((min + steps * step) * 10) / 10;
}

// "1.0X", "0.5X".
export const formatSpeed = (speed: number) => `${speed.toFixed(1)}X`;

// Pause marker understood by the speech providers (SSML-style break).
export const pauseTag = (seconds: number) => `<break time="${seconds}s" />`;

export type TextSelection = { start: number; end: number };

// Inserts `snippet` in place of the selection, with a space on each side
// where it would otherwise touch a word. Returns null if the result would
// exceed `maxLength`.
export function insertAtSelection(
  text: string,
  selection: TextSelection,
  snippet: string,
  maxLength: number,
): { text: string; cursor: number } | null {
  const start = Math.max(0, Math.min(selection.start, text.length));
  const end = Math.max(start, Math.min(selection.end, text.length));
  const before = text.slice(0, start);
  const after = text.slice(end);
  const lead = before === '' || /\s$/.test(before) ? '' : ' ';
  const trail = after === '' || /^\s/.test(after) ? '' : ' ';
  const inserted = `${lead}${snippet}${trail}`;
  const next = before + inserted + after;
  if (next.length > maxLength) {
    return null;
  }
  return { text: next, cursor: before.length + inserted.length };
}

// What the server needs to synthesise speech. services/textToSpeech sends
// only what the voice's provider accepts (capabilitiesOf).
export type SpeechRequest = {
  script: string;
  voice: Voice;
  emotion: EmotionId | null;
  settings: SpeechSettings;
  // Acting instructions text (directable voices only).
  instructions: string | null;
};

export type GenerateSpeechRequest = SpeechRequest & {
  title: string;
  // Campaign name; "default" when none was chosen.
  campaignName: string;
};
