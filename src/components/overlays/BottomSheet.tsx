import React, { ReactNode, useEffect, useMemo, useState } from 'react';
import {
  Keyboard,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  useWindowDimensions,
  View,
} from 'react-native';
import {
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
} from 'react-native-gesture-handler';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { scheduleOnRN } from 'react-native-worklets';
import { AppText } from '@/components/ui/AppText';
import { IconButton } from '@/components/ui/IconButton';
import { config } from '@/config';
import { useKeyboardHeight } from '@/hooks/useKeyboardHeight';
import { layout, useColors } from '@/theme';
import { dismissKeyboardOnBlankTouch } from '@/utils';

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

const SPRING = { damping: 20, stiffness: 220 };

// Reusable sheet: pass any content as children. Usage:
// <BottomSheet visible={open} onClose={close} title="..." subtitle="...">
//   ...
// </BottomSheet>
//
// - Drag the handle / header down to close; a short drag springs back.
// - Tapping outside closes the keyboard first, then the sheet.
// - Keyboard (iOS and Android): the sheet rises only as far as it fits
//   under the status bar; any part the keyboard still covers scrolls.
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
  const colors = useColors();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const { height: screenHeight } = useWindowDimensions();
  const keyboardHeight = useKeyboardHeight();
  // Keep the Modal mounted until the close animation finishes.
  const [mounted, setMounted] = useState(visible);
  const [sheetHeight, setSheetHeight] = useState(0);

  // 0 = off screen, 1 = open. `drag` is the finger offset (down = +).
  const progress = useSharedValue(0);
  const drag = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      setMounted(true);
      drag.value = 0;
    }
    progress.value = withTiming(
      visible ? 1 : 0,
      {
        duration: config.animation.sheetMs,
        easing: visible ? Easing.out(Easing.cubic) : Easing.in(Easing.cubic),
      },
      finished => {
        if (finished && !visible) {
          scheduleOnRN(setMounted, false);
        }
      },
    );
  }, [visible, progress, drag]);

  // Drag down to close; upward pulls stretch a little and spring back.
  const pan = useMemo(
    () =>
      Gesture.Pan()
        .onUpdate(event => {
          drag.value =
            event.translationY > 0 ? event.translationY : event.translationY / 4;
        })
        .onEnd(event => {
          // A sheet without a close button is not closed by a swipe either.
          const dismiss =
            !hideClose &&
            (event.translationY > layout.sheetDismissDistance ||
              event.velocityY > layout.sheetDismissVelocity);
          if (dismiss) {
            // Keep the swipe's momentum: slide straight off from where the
            // finger let go, fast at first (the close animation alone eases
            // in, which looked like a pause after a swipe). Runs on the UI
            // thread at once; onClose then hides the sheet as the X does.
            drag.value = withTiming(screenHeight, {
              duration: config.animation.sheetMs,
              easing: Easing.out(Easing.cubic),
            });
            scheduleOnRN(onClose);
            return;
          }
          // Not far or fast enough: spring back open.
          drag.value = withSpring(0, SPRING);
        }),
    [drag, onClose, hideClose, screenHeight],
  );

  const sheetStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: (1 - progress.value) * screenHeight + drag.value },
    ],
  }));
  const backdropStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
  }));

  // Tap outside: first put the keyboard away, then close.
  const onBackdropPress = () => {
    if (Keyboard.isVisible()) {
      Keyboard.dismiss();
    } else {
      onClose();
    }
  };

  const maxHeight = screenHeight - insets.top - layout.sheetTopGap;
  const fixedHeight = height
    ? Math.min(screenHeight * height, maxHeight)
    : undefined;
  // How far the sheet may rise above the keyboard without its top leaving
  // the screen. The rest of the keyboard overlaps the content, which the
  // ScrollView insets and scrolls.
  const lift = Math.max(
    0,
    Math.min(keyboardHeight, maxHeight - (fixedHeight ?? sheetHeight)),
  );
  // The part of the keyboard the lift could not clear: the content is
  // padded by it, so it can still be scrolled into view. Done the same
  // way on both platforms. (iOS automaticallyAdjustKeyboardInsets is not
  // used: it measured the sheet before it rose, then scrolled the content
  // away and left the raised sheet looking empty.)
  const covered = keyboardHeight - lift;
  // The keyboard covers the home indicator: no safe-area gap above it.
  const bottomInset = keyboardHeight > 0 ? 0 : insets.bottom;

  return (
    <Modal
      visible={mounted}
      transparent
      animationType="none"
      statusBarTranslucent
      navigationBarTranslucent
      onRequestClose={onClose}
    >
      {/* Gestures inside an Android Modal need their own root view. */}
      <GestureHandlerRootView style={styles.fill}>
        <Animated.View
          style={[
            StyleSheet.absoluteFill,
            { backgroundColor: colors.overlay },
            backdropStyle,
          ]}
        >
          <Pressable
            style={styles.fill}
            accessibilityRole="button"
            accessibilityLabel={t('common.close')}
            onPress={onBackdropPress}
          />
        </Animated.View>

        <View
          pointerEvents="box-none"
          style={[styles.fill, styles.bottom, { paddingBottom: lift }]}
        >
          <Animated.View
            onLayout={event => setSheetHeight(event.nativeEvent.layout.height)}
            // Blank space anywhere in the sheet closes the keyboard.
            onStartShouldSetResponder={dismissKeyboardOnBlankTouch}
            style={[
              styles.sheet,
              { height: fixedHeight, maxHeight, backgroundColor: colors.surface },
              sheetStyle,
            ]}
          >
            <GestureDetector gesture={pan}>
              {/* Handle + header: drag here; a tap closes the keyboard. */}
              <Pressable accessible={false} onPress={Keyboard.dismiss}>
                <View className="items-center pt-2.5">
                  <View className="h-1 w-10 rounded-full bg-line-neutral" />
                </View>
                {title || !hideClose ? (
                  <View className="flex-row items-start gap-3 px-4 pt-3">
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
                    {!hideClose ? (
                      <IconButton
                        shape="circle"
                        icon="close"
                        accessibilityLabel={t('common.close')}
                        onPress={onClose}
                      />
                    ) : null}
                  </View>
                ) : null}
              </Pressable>
            </GestureDetector>

            {scrollable ? (
              <ScrollView
                className="flex-grow-0"
                contentContainerClassName="px-4 pt-6"
                contentContainerStyle={{
                  paddingBottom: bottomInset + layout.sheetBottomPadding + covered,
                }}
                // Taps on empty space close the keyboard.
                keyboardShouldPersistTaps="handled"
                keyboardDismissMode={
                  Platform.OS === 'ios' ? 'interactive' : 'on-drag'
                }
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
        </View>
      </GestureHandlerRootView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  bottom: { justifyContent: 'flex-end' },
  sheet: {
    borderTopLeftRadius: layout.sheetRadius,
    borderTopRightRadius: layout.sheetRadius,
    overflow: 'hidden',
  },
});
