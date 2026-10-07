import '@/global.css';
import '@/i18n';
import { QueryClientProvider } from '@tanstack/react-query';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router/stack';
import * as SplashScreen from 'expo-splash-screen';
import React, { useEffect } from 'react';
import { StatusBar } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { fontAssets } from '@/assets';
import { ErrorBoundary, OfflineSheet } from '@/components';
import { entryGroups } from '@/domain';
import { AuthProvider, useSession } from '@/features/auth/AuthProvider';
import {
  completeOnboarding,
  useOnboardingCompleted,
} from '@/features/onboarding/store';
import { queryClient } from '@/lib/queryClient';
import { stackScreenOptions } from '@/theme';

// Keep the native splash up until fonts and the stored session are ready,
// so there is no blank frame on launch.
SplashScreen.preventAutoHideAsync();
// Fade into the first screen instead of cutting to it.
SplashScreen.setOptions({ fade: true, duration: 300 });

// Signed in -> (app); signed out -> (onboarding) at launch, then
// (auth). Supabase session changes (sign in, OTP verified, sign out) and
// finishing onboarding switch between them automatically.
function SessionStack() {
  const { session, isLoading } = useSession();
  const onboarded = useOnboardingCompleted();

  useEffect(() => {
    if (!isLoading) {
      SplashScreen.hideAsync();
    }
  }, [isLoading]);

  // Signed in at any point this run: a later sign-out opens Welcome, not
  // onboarding. (A fresh launch while signed out still shows onboarding.)
  useEffect(() => {
    if (session) {
      completeOnboarding();
    }
  }, [session]);

  if (isLoading) {
    return null;
  }

  const groups = entryGroups(!!session, onboarded);
  return (
    <Stack screenOptions={stackScreenOptions}>
      <Stack.Protected guard={groups.onboarding}>
        <Stack.Screen name="(onboarding)" />
      </Stack.Protected>
      <Stack.Protected guard={groups.auth}>
        <Stack.Screen name="(auth)" />
      </Stack.Protected>
      <Stack.Protected guard={groups.app}>
        <Stack.Screen name="(app)" />
      </Stack.Protected>
    </Stack>
  );
}

// App root: providers, then the session-aware stack.
export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts(fontAssets);

  // On a font error, carry on with the system font rather than hang.
  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    // Canvas colour (same as the splash) so no white shows between frames.
    <GestureHandlerRootView className="flex-1 bg-canvas">
      <ErrorBoundary>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <SafeAreaProvider>
              <StatusBar barStyle="dark-content" />
              <SessionStack />
              {/* Bottom sheet while offline; hides itself on reconnect. */}
              <OfflineSheet />
            </SafeAreaProvider>
          </AuthProvider>
        </QueryClientProvider>
      </ErrorBoundary>
    </GestureHandlerRootView>
  );
}
