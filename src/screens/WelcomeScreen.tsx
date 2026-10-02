import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Platform, Pressable, View } from 'react-native';
import { icons } from '@/assets';
import { AppText, BottomSheet, TransText } from '@/components';
import { AuthButton, AuthSheet, SignInForm, SignUpForm } from '@/features/auth';
import { OrbitHero } from '@/features/welcome';
import { layout } from '@/theme';

// Google / Apple: wire to Supabase OAuth once the provider credentials exist.
const noop = () => {};

export function WelcomeScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ sheet?: AuthSheet }>();
  const { t } = useTranslation();
  const isIOS = Platform.OS === 'ios';
  const [sheet, setSheet] = useState<AuthSheet | null>(null);

  // Open a sheet requested by another screen (e.g. "Back to login").
  const requested = params.sheet;
  useEffect(() => {
    if (requested) {
      setSheet(requested);
      router.setParams({ sheet: undefined });
    }
  }, [requested, router]);

  const openSignUp = () => setSheet('signUp');
  const openSignIn = () => setSheet('signIn');
  const closeSheet = () => setSheet(null);

  const onSignedUp = (email: string) => {
    closeSheet();
    router.push({ pathname: '/verify', params: { email } });
  };

  // RootNavigator switches to the tabs once the session exists.
  const onSignedIn = closeSheet;

  const onForgotPassword = (email: string) => {
    closeSheet();
    router.push({ pathname: '/forgot-password', params: { email } });
  };

  return (
    <>
      <OrbitHero />

      <View className="flex-1 justify-center px-5">
        <TransText
          i18nKey="welcome.title"
          values={{ appName: t('common.appName') }}
          variant="display"
          numberOfLines={1}
          adjustsFontSizeToFit
          className="text-center"
        />
        <AppText variant="lead" className="mt-3 text-center">
          {t('welcome.subtitle')}
        </AppText>

        {isIOS ? (
          <View className="mt-8 flex-row gap-5">
            <AuthButton
              variant="tile"
              label={t('auth.google')}
              icon={icons.google}
              onPress={noop}
            />
            <AuthButton
              variant="tile"
              label={t('auth.apple')}
              icon={icons.apple}
              onPress={noop}
            />
            <AuthButton
              variant="tile"
              label={t('auth.email')}
              icon={icons.mail}
              onPress={openSignUp}
            />
          </View>
        ) : (
          <View className="mt-8 gap-3">
            <AuthButton
              label={t('auth.continueWithGoogle')}
              icon={icons.google}
              onPress={noop}
            />
            <AuthButton
              label={t('auth.continueWithEmail')}
              icon={icons.mail}
              onPress={openSignUp}
            />
          </View>
        )}
      </View>

      {/* The whole line opens Sign In, not just the small bold word. */}
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={t('signIn.title')}
        hitSlop={layout.hitSlop}
        onPress={openSignIn}
        className="py-5 active:opacity-60"
      >
        <TransText
          i18nKey="auth.haveAccount"
          className="text-center"
          linkClassName="font-sans-bold"
        />
      </Pressable>

      <BottomSheet
        visible={sheet === 'signUp'}
        onClose={closeSheet}
        title={t('signUp.title')}
        subtitle={t('signUp.subtitle')}
        height={layout.sheetHeight}
      >
        <SignUpForm onSuccess={onSignedUp} />
      </BottomSheet>

      <BottomSheet
        visible={sheet === 'signIn'}
        onClose={closeSheet}
        title={t('signIn.title')}
        subtitle={t('signIn.subtitle')}
        height={layout.sheetHeight}
      >
        <SignInForm
          onSuccess={onSignedIn}
          onForgotPassword={onForgotPassword}
        />
      </BottomSheet>
    </>
  );
}
