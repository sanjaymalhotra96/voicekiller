import { describe, expect, it } from '@jest/globals';
import {
  exportTranscript,
  formatTimestamp,
  isRtlLanguage,
  TranscriptSegment,
} from '@/domain';

const segments: TranscriptSegment[] = [
  { start: 0.1, end: 3.05, text: ' First line ' },
  { start: 3.05, end: 6.8, text: 'Second line' },
];

describe('formatTimestamp', () => {
  it('pads hours, minutes, seconds and milliseconds', () => {
    expect(formatTimestamp(0.1)).toBe('00:00:00,100');
    expect(formatTimestamp(3725.5, '.')).toBe('01:02:05.500');
    expect(formatTimestamp(-1)).toBe('00:00:00,000');
  });
});

describe('exportTranscript', () => {
  it('writes SRT', () => {
    expect(exportTranscript(segments, 'srt')).toBe(
      '1\n00:00:00,100 --> 00:00:03,050\nFirst line\n\n' +
        '2\n00:00:03,050 --> 00:00:06,800\nSecond line\n',
    );
  });

  it('writes WebVTT', () => {
    expect(exportTranscript(segments, 'vtt')).toBe(
      'WEBVTT\n\n00:00:00.100 --> 00:00:03.050\nFirst line\n\n' +
        '00:00:03.050 --> 00:00:06.800\nSecond line\n',
    );
  });

  it('writes plain text', () => {
    expect(exportTranscript(segments, 'txt')).toBe('First line\nSecond line');
  });
});

describe('isRtlLanguage', () => {
  it('detects right-to-left languages', () => {
    expect(isRtlLanguage('ar')).toBe(true);
    expect(isRtlLanguage('en')).toBe(false);
    expect(isRtlLanguage(null)).toBe(false);
  });
});
