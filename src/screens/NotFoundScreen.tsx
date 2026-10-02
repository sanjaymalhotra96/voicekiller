import { useRouter } from 'expo-router';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button, EmptyState, SafeArea } from '@/components';

// Shown for unknown paths and deep links without a screen yet.
export function NotFoundScreen() {
  const { t } = useTranslation();
  const router = useRouter();

  return (
    <SafeArea>
      <EmptyState
        icon="help"
        title={t('notFound.title')}
        action={
          <Button
            size="sm"
            icon="tabHome"
            label={t('notFound.action')}
            onPress={() => router.replace('/')}
          />
        }
      />
    </SafeArea>
  );
}
