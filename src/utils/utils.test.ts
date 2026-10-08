import { describe, expect, it } from '@jest/globals';
import { asNumber, asText, fileNameFromUrl } from '@/utils/coerce';
import { cn } from '@/utils/cn';
import {
  formatBytes,
  formatDate,
  formatDateInput,
  formatDuration,
} from '@/utils/format';

describe('formatDuration', () => {
  it('shows minutes and seconds, with hours only when needed', () => {
    expect(formatDuration(72)).toBe('1:12');
    expect(formatDuration(72, { padMinutes: true })).toBe('01:12');
    expect(formatDuration(3725)).toBe('1:02:05');
  });

  it('never shows negative or fractional time', () => {
    expect(formatDuration(-5)).toBe('0:00');
    expect(formatDuration(59.9)).toBe('0:59');
  });
});

describe('dates', () => {
  it('adds slashes while a date is typed', () => {
    expect(formatDateInput('0')).toBe('0');
    expect(formatDateInput('0909')).toBe('09/09');
    expect(formatDateInput('09/09/26extra99')).toBe('09/09/26');
  });

  it('shows dates as day/month/year', () => {
    expect(formatDate(new Date(2026, 8, 9))).toBe('09/09/2026');
  });
});

describe('formatBytes', () => {
  it('picks the largest unit and one decimal', () => {
    expect(formatBytes(900)).toBe('900B');
    expect(formatBytes(3250585)).toBe('3.1MB');
    expect(formatBytes(5 * 1024 ** 4)).toBe('5120GB');
  });
});

describe('coerce', () => {
  it('turns untyped values into text', () => {
    expect(asText('a')).toBe('a');
    expect(asText(5)).toBe('5');
    expect(asText(null)).toBe('');
    expect(asText(undefined)).toBe('');
  });

  it('turns untyped values into finite numbers', () => {
    expect(asNumber('2.5')).toBe(2.5);
    expect(asNumber('x')).toBe(0);
    expect(asNumber(Infinity)).toBe(0);
  });

  it('reads the file name out of a URL', () => {
    expect(
      fileNameFromUrl('https://x/conversion/conversion_3f5c.mp3?v=1'),
    ).toBe('conversion_3f5c');
    expect(fileNameFromUrl('https://x/a/My%20Take.wav#t')).toBe('My Take');
    expect(fileNameFromUrl('https://x/a/bad%E0%A4%A.mp3')).toBe('bad%E0%A4%A');
  });
});

describe('cn', () => {
  it('lets the later colour win and keeps theme font sizes', () => {
    expect(cn('text-ink', 'text-primary')).toBe('text-primary');
    // A theme size is not mistaken for a colour.
    expect(cn('text-body', 'text-ink')).toBe('text-body text-ink');
    expect(cn('text-surface', false, 'text-contrast')).toBe('text-contrast');
  });
});
