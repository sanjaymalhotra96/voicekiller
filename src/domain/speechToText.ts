import type { LanguageId } from '@/domain/voices';

// Speech to Text: timed segments and subtitle exports.

// Subtitle languages a transcript can be translated into, with the name
// the API expects.
export const translationLanguages = {
  en: 'english',
  fr: 'french',
  de: 'german',
  it: 'italian',
  pt: 'portuguese',
  hi: 'hindi',
  es: 'spanish',
} as const satisfies Partial<Record<LanguageId, string>>;
export type TranslationLanguageId = keyof typeof translationLanguages;
export const translationLanguageIds = Object.keys(
  translationLanguages,
) as TranslationLanguageId[];

export type TranscriptSegment = {
  // Seconds from the start of the audio; null when timing is unavailable.
  start: number | null;
  end: number | null;
  text: string;
};

type TimedTranscriptSegment = TranscriptSegment & {
  start: number;
  end: number;
};

export const isTimedTranscriptSegment = (
  segment: TranscriptSegment,
): segment is TimedTranscriptSegment =>
  segment.start !== null &&
  segment.end !== null &&
  Number.isFinite(segment.start) &&
  Number.isFinite(segment.end) &&
  segment.start >= 0 &&
  segment.end > segment.start;

export const transcriptFormats = ['srt', 'vtt', 'txt'] as const;
export type TranscriptFormat = (typeof transcriptFormats)[number];

export const transcriptMimeTypes: Record<TranscriptFormat, string> = {
  srt: 'application/x-subrip',
  vtt: 'text/vtt',
  txt: 'text/plain',
};

// 3.05 -> "00:00:03,050" (SRT) or "00:00:03.050" (VTT).
export function formatTimestamp(seconds: number, separator: ',' | '.' = ',') {
  const totalMs = Math.max(0, Math.round(seconds * 1000));
  const pad = (value: number, width = 2) => String(value).padStart(width, '0');
  const h = Math.floor(totalMs / 3_600_000);
  const m = Math.floor((totalMs % 3_600_000) / 60_000);
  const s = Math.floor((totalMs % 60_000) / 1000);
  return `${pad(h)}:${pad(m)}:${pad(s)}${separator}${pad(totalMs % 1000, 3)}`;
}

function toSrt(segments: readonly TimedTranscriptSegment[]) {
  return segments
    .map(
      (segment, index) =>
        `${index + 1}\n${formatTimestamp(segment.start)} --> ${formatTimestamp(
          segment.end,
        )}\n${segment.text.trim()}\n`,
    )
    .join('\n');
}

function toVtt(segments: readonly TimedTranscriptSegment[]) {
  const cues = segments
    .map(
      segment =>
        `${formatTimestamp(segment.start, '.')} --> ${formatTimestamp(
          segment.end,
          '.',
        )}\n${segment.text.trim()}\n`,
    )
    .join('\n');
  return `WEBVTT\n\n${cues}`;
}

const toPlainText = (segments: readonly TranscriptSegment[]) =>
  segments.map(segment => segment.text.trim()).join('\n');

export function exportTranscript(
  segments: readonly TranscriptSegment[],
  format: TranscriptFormat,
) {
  if (format === 'txt') return toPlainText(segments);
  if (!segments.every(isTimedTranscriptSegment)) {
    throw new Error(
      'Subtitle export requires valid timestamps for every segment.',
    );
  }
  switch (format) {
    case 'srt':
      return toSrt(segments);
    case 'vtt':
      return toVtt(segments);
  }
}

// Languages written right to left (subtitle text alignment).
const RTL_LANGUAGES = new Set(['ar', 'he', 'fa', 'ur']);
export const isRtlLanguage = (language: string | null) =>
  !!language && RTL_LANGUAGES.has(language);
