import type { TranscriptSegment } from '@/domain';

// The saved Salad JSON contains srt_content and sentence_level_timestamps.
// Keep support for the older transcript shapes already used by the app.
const record = (value: unknown): Record<string, unknown> | null =>
  value !== null && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;

const textOf = (...values: unknown[]) =>
  values
    .find(
      (value): value is string =>
        typeof value === 'string' && value.trim().length > 0,
    )
    ?.trim() ?? '';

const seconds = (value: unknown): number | null => {
  if (typeof value !== 'number' && typeof value !== 'string') return null;
  if (typeof value === 'string' && !value.trim()) return null;
  const number = Number(value);
  return Number.isFinite(number) && number >= 0 ? number : null;
};

// "00:00:03,050" -> 3.05. Malformed times stay unknown, never zero.
const srtTime = (value: string): number | null => {
  const match = value
    .trim()
    .match(/^(\d{2,}):([0-5]\d):([0-5]\d)[,.](\d{1,3})$/);
  if (!match) return null;
  return (
    Number(match[1]) * 3600 +
    Number(match[2]) * 60 +
    Number(match[3]) +
    Number(match[4].padEnd(3, '0')) / 1000
  );
};

function parseSrt(value: unknown): TranscriptSegment[] {
  if (typeof value !== 'string') return [];
  const segments: TranscriptSegment[] = [];
  for (const block of value
    .replace(/^\uFEFF/, '')
    .replace(/\r\n?/g, '\n')
    .split(/\n[\t ]*\n+/)) {
    const lines = block.trim().split('\n');
    const timeLine = lines.findIndex(line => line.includes('-->'));
    if (timeLine < 0) continue;
    const times = lines[timeLine].split('-->');
    if (times.length !== 2) continue;
    const start = srtTime(times[0]);
    const end = srtTime(times[1]);
    const text = lines
      .slice(timeLine + 1)
      .join('\n')
      .trim();
    if (start !== null && end !== null && end > start && text) {
      segments.push({ start, end, text });
    }
  }
  return segments;
}

function toSegment(value: unknown): TranscriptSegment | null {
  const item = record(value);
  if (!item) return null;
  const text = textOf(item.text, item.sentence, item.transcript);
  if (!text) return null;
  const timestamp = Array.isArray(item.timestamp) ? item.timestamp : [];
  const ms = item.start_ms !== undefined;
  const start = seconds(
    ms ? item.start_ms : item.start ?? item.start_time ?? timestamp[0],
  );
  const end = seconds(
    ms ? item.end_ms : item.end ?? item.end_time ?? timestamp[1],
  );
  if (start === null || end === null || end <= start) {
    return { start: null, end: null, text };
  }
  return { start: start / (ms ? 1000 : 1), end: end / (ms ? 1000 : 1), text };
}

function fromContent(json: Record<string, unknown>): TranscriptSegment[] {
  // Use the provider's subtitle boundaries before reconstructing sentences.
  for (const key of ['srt_content', 'srt']) {
    const segments = parseSrt(json[key]);
    if (segments.length) return segments;
  }
  for (const key of [
    'sentence_level_timestamps',
    'sentences',
    'segments',
    'utterances',
  ]) {
    const value = json[key];
    if (!Array.isArray(value)) continue;
    const segments = value
      .map(toSegment)
      .filter((segment): segment is TranscriptSegment => segment !== null);
    if (segments.length) return segments;
  }
  const text = textOf(json.text, json.transcript);
  return text ? [{ start: null, end: null, text }] : [];
}

export function toSegments(
  json: Record<string, unknown>,
  translation: string | null,
) {
  const translated = translation
    ? record(json.translations)?.[translation]
    : undefined;
  const nested = record(translated);
  const segments = nested ? fromContent(nested) : parseSrt(translated);
  return segments.length ? segments : fromContent(json);
}
