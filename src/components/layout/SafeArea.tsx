import React from 'react';
import { Platform, ScrollView, View, ViewProps } from 'react-native';
import { Edge, useSafeAreaInsets } from 'react-native-safe-area-context';
import { GradientBackground } from '@/components/layout/GradientBackground';
import { GradientName } from '@/theme';
import { cn } from '@/utils';

type SafeAreaProps = ViewProps & {
  // Gradient from theme/gradients.ts, or a plain colour (see plainBackgrounds).
  background?: GradientName | PlainBackground;
  // Safe-area edges to pad. Drop one when a header or tab bar handles it.
  edges?: readonly Edge[];
  // Wrap content in a ScrollView (forms, long content).
  scroll?: boolean;
};

const ALL_EDGES: readonly Edge[] = ['top', 'bottom', 'left', 'right'];

// Flat screen colours. `none` is the warm canvas.
const plainBackgrounds = {
  none: 'bg-canvas',
  surface: 'bg-surface',
  night: 'bg-night',
} as const;
type PlainBackground = keyof typeof plainBackgrounds;

const isPlain = (value: string): value is PlainBackground =>
  value in plainBackgrounds;

// Root wrapper for every screen: background + safe-area insets.
// Applied by each src/app/_layout.tsx through `safeAreaLayout`, so screens
// never import it.
export function SafeArea({
  background = 'brand',
  edges = ALL_EDGES,
  scroll = false,
  className,
  style,
  children,
  ...rest
}: SafeAreaProps) {
  const insets = useSafeAreaInsets();
  const padding = {
    paddingTop: edges.includes('top') ? insets.top : 0,
    paddingBottom: edges.includes('bottom') ? insets.bottom : 0,
    paddingLeft: edges.includes('left') ? insets.left : 0,
    paddingRight: edges.includes('right') ? insets.right : 0,
  };

  // Insets live on the outer layer and the screen's own className/style on
  // the inner one, so inline inset padding never overrides classes like px-4.
  const body = (
    <View className={cn('flex-1', className)} style={style} {...rest}>
      {children}
    </View>
  );

  const content = scroll ? (
    <ScrollView
      className="flex-1"
      contentContainerClassName="grow"
      contentContainerStyle={padding}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      {body}
    </ScrollView>
  ) : (
    <View className="flex-1" style={padding}>
      {body}
    </View>
  );

  if (isPlain(background)) {
    return (
      <View className={cn('flex-1', plainBackgrounds[background])}>
        {content}
      </View>
    );
  }

  return (
    <GradientBackground variant={background}>{content}</GradientBackground>
  );
}

// SafeArea options per route file name. Unlisted routes get the defaults
// (brand gradient, all edges, no scroll); `null` means no wrapper (used for
// nested navigators such as the tabs).
type SafeAreaLayouts = Record<
  string,
  Omit<SafeAreaProps, 'children'> | null
>;

// Common presets for the layouts above.
export const safeAreaPresets = {
  // Pushed screens with forms: scroll + side padding.
  form: { scroll: true, className: 'px-4' },
  // Tab screens: the tab bar already handles the bottom inset.
  tab: { edges: ['top', 'left', 'right'], className: 'px-4' },
  // Dark full-screen editor (Text to Speech).
  night: { background: 'night', className: 'px-4' },
  // White pages inside a modal. On iOS the modal card already sits below
  // the status bar, so it skips the top inset.
  page: {
    background: 'surface',
    className: 'px-4',
    edges:
      Platform.OS === 'ios' ? ['bottom', 'left', 'right'] : ALL_EDGES,
  },
} as const satisfies Record<string, Omit<SafeAreaProps, 'children'>>;

// For a navigator's `screenLayout` prop in src/app/**/_layout.tsx:
// wraps each screen in SafeArea using its entry in `layouts`.
export const safeAreaLayout = (layouts: SafeAreaLayouts) =>
  function ScreenSafeArea({
    route,
    children,
  }: {
    route: { name: string };
    children: React.ReactNode;
  }) {
    const layout = layouts[route.name];
    if (layout === null) {
      return <>{children}</>;
    }
    return <SafeArea {...layout}>{children}</SafeArea>;
  };
