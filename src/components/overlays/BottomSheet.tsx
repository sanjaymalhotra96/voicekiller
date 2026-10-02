import React, { ReactNode, useEffect, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  useWindowDimensions,
  View,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppText } from '@/components/ui/AppText';
import { config } from '@/config';
import { IconButton } from '@/components/ui/IconButton';
import { layout, palette } from '@/theme';

type Props = {
  visible: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  // Fraction of the screen height (0-1). Omit to fit the content.
  height?: number;
  // Hide the close (X) button, e.g. for a blocking sheet.
  hideClose?: boolean;
  // Next to the title, e.g. a "Beta" badge.
  titleAccessory?: ReactNode;
  // false: children fill the sheet and handle their own scrolling (use for
  // FlatLists, which must not sit inside a ScrollView). Needs `height`.
  scrollable?: boolean;
  children: ReactNode;
};

// Reusable sheet: pass any content as children. Usage:
// <BottomSheet visible={open} onClose={close} title="..." subtitle="...">
//   ...
// </BottomSheet>
export function BottomSheet({
  visible,
  onClose,
  title,
  subtitle,
  height,
  hideClose = false,
  titleAccessory,
  scrollable = true,
  children,
}: Props) {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const { height: screenHeight } = useWindowDimensions();
  const progress = useRef(new Animated.Value(0)).current;
  // Keep the Modal mounted until the close animation finishes.
  const [mounted, setMounted] = useState(visible);

  useEffect(() => {
    if (visible) {
      setMounted(true);
    }
    Animated.timing(progress, {
      toValue: visible ? 1 : 0,
      duration: config.animation.sheetMs,
      easing: visible ? Easing.out(Easing.cubic) : Easing.in(Easing.cubic),
      useNativeDriver: true,
    }).start(({ finished }) => {
      if (finished && !visible) {
        setMounted(false);
      }
    });
  }, [visible, progress]);

  const translateY = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [screenHeight, 0],
  });

  const maxHeight = screenHeight - insets.top - layout.sheetTopGap;
  const sheetHeight = height
    ? Math.min(screenHeight * height, maxHeight)
    : undefined;

  return (
    <Modal
      visible={mounted}
      transparent
      animationType="none"
      statusBarTranslucent
      navigationBarTranslucent
      onRequestClose={onClose}
    >
      <Animated.View
        className="absolute inset-0"
        style={{ backgroundColor: palette.overlay, opacity: progress }}
      >
        <Pressable
          className="flex-1"
          accessibilityRole="button"
          accessibilityLabel={t('common.close')}
          onPress={onClose}
        />
      </Animated.View>

      <KeyboardAvoidingView
        className="flex-1 justify-end"
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        pointerEvents="box-none"
      >
        <Animated.View
          className="rounded-t-3xl bg-surface"
          style={{
            height: sheetHeight,
            maxHeight,
            transform: [{ translateY }],
          }}
        >
          {(title || !hideClose) && (
            <View className="flex-row items-start gap-3 px-4 pt-5">
              <View className="flex-1">
                {title ? (
                  <View className="flex-row items-center gap-2">
                    <AppText variant="title">{title}</AppText>
                    {titleAccessory}
                  </View>
                ) : null}
                {subtitle ? (
                  <AppText variant="subtitle" className="mt-1">
                    {subtitle}
                  </AppText>
                ) : null}
              </View>
              {!hideClose && (
                <IconButton
                  shape="circle"
                  icon="close"
                  accessibilityLabel={t('common.close')}
                  onPress={onClose}
                />
              )}
            </View>
          )}

          {scrollable ? (
            <ScrollView
              className="flex-grow-0"
              contentContainerClassName="px-4 pt-6"
              contentContainerStyle={{
                paddingBottom: insets.bottom + layout.sheetBottomPadding,
              }}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              {children}
            </ScrollView>
          ) : (
            <View
              className="flex-1 px-4 pt-6"
              style={{ paddingBottom: insets.bottom }}
            >
              {children}
            </View>
          )}
        </Animated.View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
