import { describe, expect, it } from '@jest/globals';
import {
  darkPalette,
  lightPalette,
  themeColors,
  themeVars,
} from '@/theme/palette';

type Tree = { [key: string]: string | Tree };

const leafPaths = (tree: Tree, prefix = ''): string[] =>
  Object.entries(tree).flatMap(([key, value]) =>
    typeof value === 'string'
      ? [`${prefix}${key}`]
      : leafPaths(value, `${prefix}${key}.`),
  );

describe('palettes', () => {
  it('give dark mode every colour light mode has (and nothing else)', () => {
    expect(leafPaths(darkPalette).sort()).toEqual(
      leafPaths(lightPalette).sort(),
    );
  });

  it('use valid colours only', () => {
    const valid = /^(#[0-9A-Fa-f]{6}|rgba\(\d+, \d+, \d+, (0|1|0?\.\d+)\))$/;
    for (const palette of [lightPalette, darkPalette]) {
      for (const value of Object.values(themeVars(palette))) {
        expect(String(value)).toMatch(/^(\d+ \d+ \d+|rgba\(.+\))$/);
      }
      const values = leafPaths(palette).map(path =>
        path
          .split('.')
          .reduce<Tree | string>((node, key) => (node as Tree)[key], palette),
      );
      for (const value of values) {
        expect(value).toMatch(valid);
      }
    }
  });

  it('keep content on coloured fills white in both schemes', () => {
    expect(lightPalette.contrast).toBe('#FFFFFF');
    expect(darkPalette.contrast).toBe('#FFFFFF');
  });
});

describe('Tailwind colours', () => {
  it('turn hex colours into opacity-aware CSS variables', () => {
    expect(themeVars(lightPalette)['--color-primary']).toBe('251 98 40');
    expect(themeVars(lightPalette)['--color-tone-cyan-soft']).toBe(
      '243 251 253',
    );
    const colors = themeColors() as Tree;
    expect((colors.primary as Tree).DEFAULT).toBe(
      'rgb(var(--color-primary) / <alpha-value>)',
    );
    // rgba colours cannot take an opacity modifier.
    expect(colors.overlay).toBe('var(--color-overlay)');
  });

  it('declare a variable for every class name', () => {
    const vars = themeVars(lightPalette);
    const referenced = JSON.stringify(themeColors()).match(/--color-[a-z-]+/g);
    for (const name of referenced ?? []) {
      expect(vars).toHaveProperty([name]);
    }
  });
});
