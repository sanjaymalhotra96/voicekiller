import { vars } from 'nativewind';
import React, { createContext, ReactNode, useContext, useMemo } from 'react';
import { StyleSheet, useColorScheme, View } from 'react-native';
import { lightPalette, palettes, themeVars } from '@/theme/palette';

// Light or dark, following the phone's setting (app.json
// userInterfaceStyle: automatic). Switching it while the app is open
// re-renders everything with the other palette.

export type Palette = typeof lightPalette;
export type SchemeName = keyof typeof palettes;

// CSS variables behind every Tailwind colour class, per scheme.
const schemeStyles = {
  light: vars(themeVars(palettes.light)),
  dark: vars(themeVars(palettes.dark)),
};

const ThemeContext = createContext<{ scheme: SchemeName; colors: Palette }>({
  scheme: 'light',
  colors: palettes.light,
});

export function ThemeProvider({ children }: { children: ReactNode }) {
  const scheme: SchemeName = useColorScheme() === 'dark' ? 'dark' : 'light';
  const value = useMemo(
    () => ({ scheme, colors: palettes[scheme] }),
    [scheme],
  );
  return (
    <ThemeContext.Provider value={value}>
      <View style={[styles.fill, schemeStyles[scheme]]}>{children}</View>
    </ThemeContext.Provider>
  );
}

// The active palette, for colours passed as props (icons, SVG, gradients).
// Tailwind classes need nothing: they switch through the CSS variables.
export const useColors = () => useContext(ThemeContext).colors;

export const useColorSchemeName = () => useContext(ThemeContext).scheme;

const styles = StyleSheet.create({ fill: { flex: 1 } });
