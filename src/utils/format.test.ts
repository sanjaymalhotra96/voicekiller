import { describe, expect, it } from '@jest/globals';
import {
  formatBytes,
  formatDate,
  formatDateInput,
  formatDuration,
} from '@/utils/format';

describe('formatDuration', () => {
  it.each([
    [0, '0:00'],
    [5, '0:05'],
    [72, '1:12'],
    [3725, '1:02:05'],
    [59.9, '0:59'],
    [-10, '0:00'],
  ])('%p seconds -> %p', (seconds, expected) => {
    expect(formatDuration(seconds)).toBe(expected);
  });

  it('pads minutes when asked', () => {
    expect(formatDuration(59, { padMinutes: true })).toBe('00:59');
  });
});

describe('formatDateInput', () => {
  it.each([
    ['', ''],
    ['1', '1'],
    ['0102', '01/02'],
    ['010299', '01/02/99'],
    ['01/02/99', '01/02/99'],
    ['01029912', '01/02/99'],
    ['ab01c', '01'],
  ])('%p -> %p', (input, expected) => {
    expect(formatDateInput(input)).toBe(expected);
  });
});

describe('formatBytes', () => {
  it.each([
    [900, '900B'],
    [1536, '1.5KB'],
    [3250585, '3.1MB'],
  ])('%p -> %p', (bytes, expected) => {
    expect(formatBytes(bytes)).toBe(expected);
  });
});

describe('formatDate', () => {
  it('writes day/month/year', () => {
    expect(formatDate(new Date(2026, 8, 9))).toBe('09/09/2026');
  });
});
