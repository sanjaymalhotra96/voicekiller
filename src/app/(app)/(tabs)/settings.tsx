// Route: /settings
import { useRouter } from 'expo-router';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Share, View } from 'react-native';
import { AppText, Button, FormError, ListGroup, Section } from '@/components';
import { config } from '@/config';
import { ProfileCard } from '@/features/account/ProfileCard';
import { SettingsAction, settingsMenu } from '@/features/account/settingsMenu';
import { useSignOut } from '@/features/auth/hooks';
import { useOpenSubscription } from '@/features/subscription/hooks';
import { openLink } from '@/utils';

export default function SettingsScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const signOut = useSignOut();
  const openSubscription = useOpenSubscription();
  const { links } = config;

  const handlers: Record<SettingsAction, () => void> = {
    personalInfo: () => router.push('/personal-info'),
    changePassword: () => router.push('/change-password'),
    // Unlock Studio when free; the store's subscription page when paid.
    subscription: openSubscription,
    // Links come from .env. Share works without one; Privacy does
    // nothing until EXPO_PUBLIC_PRIVACY_URL is set.
    share: () =>
      Share.share({
        message: links.appStore
          ? t('settings.shareMessage', {
              appName: t('common.appName'),
              url: links.appStore,
            })
          : t('settings.shareMessageNoLink', { appName: t('common.appName') }),
      }).catch(() => {}),
    // Live chat with support (Chatwoot).
    contact: () => router.push('/support'),
    privacy: () => {
      if (links.privacyPolicy) {
        openLink(links.privacyPolicy);
      }
    },
  };

  return (
    <View className="gap-5 pb-6 pt-4">
      <AppText variant="heading" accessibilityRole="header">
        {t('settings.title')}
      </AppText>

      <ProfileCard onUpgrade={openSubscription} />

      {settingsMenu.map(section => {
        const items = section.items.map(({ action, icon }) => ({
          key: action,
          icon,
          label: t(`settings.items.${action}`),
          onPress: handlers[action],
        }));
        return (
          <Section
            key={section.id}
            title={t(`settings.sections.${section.id}`)}
          >
            <ListGroup items={items} />
          </Section>
        );
      })}

      <FormError error={signOut.error} />
      {/* Signing out flips RootNavigator back to Welcome. */}
      <Button
        variant="dangerSoft"
        label={t('settings.signOut')}
        loading={signOut.isPending}
        onPress={() => signOut.mutate()}
      />
    </View>
  );
}
