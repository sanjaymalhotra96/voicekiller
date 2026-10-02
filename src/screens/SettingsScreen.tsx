import { useRouter } from 'expo-router';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Share, View } from 'react-native';
import { AppText, Button, FormError, ListGroup, Section } from '@/components';
import { config } from '@/config';
import { ProfileCard, SettingsAction, settingsMenu } from '@/features/account';
import { useSignOut } from '@/features/auth';
import { openLink } from '@/utils';

export function SettingsScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const signOut = useSignOut();
  const { links } = config;

  // TODO: open the subscription / paywall screen once it is designed.
  const openSubscription = () => {};

  const handlers: Record<SettingsAction, (() => void) | null> = {
    personalInfo: () => router.push('/personal-info'),
    changePassword: () => router.push('/change-password'),
    subscription: openSubscription,
    // Rows below are hidden until their link is set in .env.
    share: links.appStore
      ? () =>
          Share.share({
            message: t('settings.shareMessage', {
              appName: t('common.appName'),
              url: links.appStore,
            }),
          }).catch(() => {})
      : null,
    contact: links.supportEmail
      ? () => openLink(`mailto:${links.supportEmail}`)
      : null,
    privacy: links.privacyPolicy
      ? () => openLink(links.privacyPolicy)
      : null,
  };

  return (
    <View className="gap-5 pb-6 pt-4">
      <AppText variant="heading" accessibilityRole="header">
        {t('settings.title')}
      </AppText>

      <ProfileCard onUpgrade={openSubscription} />

      {settingsMenu.map(section => {
        const items = section.items.flatMap(({ action, icon }) => {
          const onPress = handlers[action];
          return onPress
            ? [
                {
                  key: action,
                  icon,
                  label: t(`settings.items.${action}`),
                  onPress,
                },
              ]
            : [];
        });
        return items.length > 0 ? (
          <Section
            key={section.id}
            title={t(`settings.sections.${section.id}`)}
          >
            <ListGroup items={items} />
          </Section>
        ) : null;
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
