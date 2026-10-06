// Route: /
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Platform, Pressable, View } from 'react-native';
import { icons } from '@/assets';
import { AppText, BottomSheet, FormError, TransText } from '@/components';
import { AuthButton } from '@/features/auth/AuthButton';
import { useGoogleSignIn } from '@/features/auth/hooks';
import { SignInForm } from '@/features/auth/SignInForm';
import { SignUpForm } from '@/features/auth/SignUpForm';
import { AuthSheet } from '@/features/auth/types';
import { WelcomeIllustration } from '@/features/welcome/WelcomeIllustration';
import { layout } from '@/theme';

// Apple: not enabled in Supabase yet (Authentication > Providers).
const noop = () => {};

export default function WelcomeScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ sheet?: AuthSheet }>();
  const { t } = useTranslation();
  const isIOS = Platform.OS === 'ios';
  const [sheet, setSheet] = useState<AuthSheet | null>(null);
  // RootNavigator opens the app once Google's session arrives.
  const google = useGoogleSignIn();
  const signInWithGoogle = () => {
    if (!google.isPending) {
      google.mutate();
    }
  };

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
      <WelcomeIllustration />

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
              loading={google.isPending}
              onPress={signInWithGoogle}
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
              loading={google.isPending}
              onPress={signInWithGoogle}
            />
            <AuthButton
              label={t('auth.continueWithEmail')}
              icon={icons.mail}
              onPress={openSignUp}
            />
          </View>
        )}
        <FormError error={google.error} className="mt-3" />
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
