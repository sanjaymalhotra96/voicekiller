import type { TranscriptSegment } from '@/domain';
import { asNumber, asText } from '@/utils';

// Reads the transcript JSON file Speech to Text saves. Its layout is not
// documented, so several likely shapes are accepted. Pure, so it is unit
// tested (transcriptFile.test.ts).

// "00:00:03,050" -> 3.05
const srtTime = (value: string) => {
  const [h, m, rest] = value.trim().split(':');
  return asNumber(h) * 3600 + asNumber(m) * 60 + asNumber(rest?.replace(',', '.'));
};

const parseSrt = (srt: string): TranscriptSegment[] =>
  srt
    .split(/\r?\n\r?\n/)
    .map(block => {
      const lines = block.trim().split(/\r?\n/);
      const timeLine = lines.findIndex(line => line.includes('-->'));
      if (timeLine < 0) return null;
      const [start, end] = lines[timeLine].split('-->');
      return {
        start: srtTime(start),
        end: srtTime(end),
        text: lines.slice(timeLine + 1).join(' '),
      };
    })
    .filter((segment): segment is TranscriptSegment => !!segment?.text);

const toSegment = (item: Record<string, unknown>): TranscriptSegment | null => {
  const text = asText(item.text) || asText(item.sentence) || asText(item.transcript);
  if (!text) return null;
  const ms = item.start_ms !== undefined;
  return {
    start: ms ? asNumber(item.start_ms) / 1000 : asNumber(item.start ?? item.start_time),
    end: ms ? asNumber(item.end_ms) / 1000 : asNumber(item.end ?? item.end_time),
    text,
  };
};

const fromList = (value: unknown): TranscriptSegment[] =>
  Array.isArray(value)
    ? value
        .map(item => toSegment(item as Record<string, unknown>))
        .filter((segment): segment is TranscriptSegment => segment !== null)
    : [];

// The transcript file's layout is not documented: take timed sentences,
// then subtitles, then plain text, whichever is there. A translation, when
// asked for, replaces the original.
export function toSegments(json: Record<string, unknown>, translation: string | null) {
  const translated = translation
    ? (json.translations as Record<string, unknown> | undefined)?.[translation]
    : undefined;
  if (typeof translated === 'string') {
    const segments = parseSrt(translated);
    if (segments.length) return segments;
  }
  if (translated && typeof translated === 'object') {
    const nested = translated as Record<string, unknown>;
    const segments =
      typeof nested.srt === 'string'
        ? parseSrt(nested.srt)
        : fromList(nested.sentences ?? nested.segments);
    if (segments.length) return segments;
  }
  for (const key of ['sentences', 'segments', 'utterances']) {
    const segments = fromList(json[key]);
    if (segments.length) return segments;
  }
  if (typeof json.srt === 'string') {
    const segments = parseSrt(json.srt);
    if (segments.length) return segments;
  }
  const plain = asText(json.text) || asText(json.transcript);
  return plain ? [{ start: 0, end: 0, text: plain }] : [];
}
