import { describe, expect, it } from '@jest/globals';
import fs from 'fs';
import path from 'path';
import en from '@/i18n/locales/en.json';

// Every user-facing string lives in locales/en.json. These checks catch a
// key used in code but missing from the file (it would show the raw key).

const srcDir = path.join(__dirname, '..');

const sourceFiles = (dir: string): string[] =>
  fs.readdirSync(dir, { withFileTypes: true }).flatMap(entry => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      return sourceFiles(full);
    }
    // App code only: not tests or type declarations.
    return /\.tsx?$/.test(entry.name) && !/\.(test|d)\.tsx?$/.test(entry.name)
      ? [full]
      : [];
  });

const hasKey = (key: string) =>
  key
    .split('.')
    .reduce<unknown>(
      (node, part) =>
        node && typeof node === 'object'
          ? (node as Record<string, unknown>)[part]
          : undefined,
      en,
    ) !== undefined;

// A key with plural forms ("minutes_one" / "minutes_other") counts too.
const exists = (key: string) =>
  hasKey(key) || hasKey(`${key}_one`) || hasKey(`${key}_other`);

describe('translations', () => {
  it('has every key the code uses', () => {
    const missing: string[] = [];
    let checked = 0;
    for (const file of sourceFiles(srcDir)) {
      const text = fs.readFileSync(file, 'utf8');
      // t('a.b'), t("a.b"), t(`a.b`) without ${...}, i18nKey="a.b"
      const pattern =
        /\bt\(\s*(['"`])([a-zA-Z]\w*(?:\.\w+)+)\1|i18nKey=(?:\{\s*)?(['"])([a-zA-Z]\w*(?:\.\w+)+)\3/g;
      for (const match of text.matchAll(pattern)) {
        const key = match[2] ?? match[4];
        checked += 1;
        if (!exists(key)) {
          missing.push(`${path.relative(srcDir, file)}: ${key}`);
        }
      }
    }
    // Guards the scan itself: it must find the app's keys.
    expect(checked).toBeGreaterThan(200);
    expect(missing).toEqual([]);
  });

  it('has a message for every error code', () => {
    const errorsFile = fs.readFileSync(
      path.join(srcDir, 'lib', 'errors.ts'),
      'utf8',
    );
    const union = errorsFile.match(/export type AppErrorCode =([^;]+);/);
    const codes = [...(union?.[1] ?? '').matchAll(/'([a-zA-Z]+)'/g)].map(
      m => m[1],
    );
    expect(codes.length).toBeGreaterThan(10);
    for (const code of codes) {
      expect(en.errors).toHaveProperty([code]);
    }
  });
});
