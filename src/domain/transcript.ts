// Speech to Text: timed segments and subtitle exports.

export type TranscriptSegment = {
  // Seconds from the start of the audio.
  start: number;
  end: number;
  text: string;
};

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

function toSrt(segments: readonly TranscriptSegment[]) {
  return segments
    .map(
      (segment, index) =>
        `${index + 1}\n${formatTimestamp(segment.start)} --> ${formatTimestamp(
          segment.end,
        )}\n${segment.text.trim()}\n`,
    )
    .join('\n');
}

function toVtt(segments: readonly TranscriptSegment[]) {
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
  switch (format) {
    case 'srt':
      return toSrt(segments);
    case 'vtt':
      return toVtt(segments);
    case 'txt':
      return toPlainText(segments);
  }
}

// Languages written right to left (subtitle text alignment).
const RTL_LANGUAGES = new Set(['ar', 'he', 'fa', 'ur']);
export const isRtlLanguage = (language: string | null) =>
  !!language && RTL_LANGUAGES.has(language);
