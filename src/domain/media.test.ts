import { describe, expect, it } from '@jest/globals';
import {
  fileExtension,
  fileRules,
  formatExtensions,
  maxMegabytes,
  validateFile,
} from '@/domain';

const MB = 1024 * 1024;

describe('fileExtension', () => {
  it('reads the lower-cased extension', () => {
    expect(fileExtension('Harvard.MP3')).toBe('mp3');
    expect(fileExtension('a.b.wav')).toBe('wav');
    expect(fileExtension('noext')).toBe('');
  });
});

describe('validateFile', () => {
  it.each(['a.mp3', 'a.wav', 'a.m4a', 'a.mp4', 'a.mov', 'a.webm', 'a.ogg'])(
    'clone accepts %p',
    name => {
      expect(validateFile({ name, size: MB }, fileRules.clone)).toBeNull();
    },
  );

  it('applies each rule set', () => {
    expect(validateFile({ name: 'a.m4a', size: 1 }, fileRules.changer)).toBe(
      'fileType',
    );
    expect(validateFile({ name: 'a.flac', size: 1 }, fileRules.media)).toBeNull();
    expect(validateFile({ name: 'a.pdf', size: 1 }, fileRules.media)).toBe(
      'fileType',
    );
  });

  it('rejects files over the limit, and allows unknown sizes', () => {
    expect(validateFile({ name: 'a.mp3', size: 5 * MB }, fileRules.clone)).toBe(
      'fileTooLarge',
    );
    expect(validateFile({ name: 'a.mp3', size: null }, fileRules.clone)).toBeNull();
  });
});

describe('hint helpers', () => {
  it('formats extensions and the size limit', () => {
    expect(formatExtensions(fileRules.changer)).toBe('.mp3, .wav');
    expect(maxMegabytes(fileRules.media)).toBe(50);
  });
});
