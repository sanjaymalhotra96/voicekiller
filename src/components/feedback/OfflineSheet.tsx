import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import { BottomSheet } from '@/components/overlays/BottomSheet';
import { AppText } from '@/components/ui/AppText';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { useIsOffline } from '@/hooks/useIsOffline';
import { recheckConnection } from '@/lib/network';
import { iconSize, useColors } from '@/theme';

// Slides up when the internet drops and closes on its own when it is
// back. The user may dismiss it; it shows again on the next drop.
// Screens underneath stay mounted, so nothing reloads or is lost.
export function OfflineSheet() {
  const colors = useColors();
  const { t } = useTranslation();
  const offline = useIsOffline();
  const [dismissed, setDismissed] = useState(false);
  const [checking, setChecking] = useState(false);
  const [stillOffline, setStillOffline] = useState(false);

  // Back online: forget the dismissal and the last retry result.
  useEffect(() => {
    if (!offline) {
      setDismissed(false);
      setStillOffline(false);
    }
  }, [offline]);

  const retry = async () => {
    setChecking(true);
    try {
      // When the connection is back, `offline` flips and the sheet closes.
      setStillOffline(!(await recheckConnection()));
    } finally {
      setChecking(false);
    }
  };

  return (
    <BottomSheet visible={offline && !dismissed} onClose={() => setDismissed(true)}>
      <View
        accessibilityLiveRegion="assertive"
        className="items-center gap-3 pb-2"
      >
        <View className="size-avatar-lg items-center justify-center rounded-full bg-primary-wash">
          <Icon name="wifiOff" size={iconSize.xxl} color={colors.primary.DEFAULT} />
        </View>
        <AppText variant="title" accessibilityRole="header" className="mt-2 text-center">
          {t('offline.title')}
        </AppText>
        <AppText className="text-center">
          {stillOffline ? t('offline.stillOffline') : t('offline.message')}
        </AppText>
        <Button
          className="mt-4 self-stretch"
          icon="refresh"
          label={t('offline.retry')}
          loading={checking}
          onPress={retry}
        />
      </View>
    </BottomSheet>
  );
}
