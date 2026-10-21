import { Star } from 'lucide-react-native';
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  LayoutChangeEvent,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useFrameCallback,
  useReducedMotion,
  useSharedValue,
} from 'react-native-reanimated';
import { gradientStyle, Palette, shadows, useColors } from '@/theme';

const reviews = ['textToSpeech', 'acting', 'voiceClone', 'allInOne'] as const;

// One copy (4 cards of 236 + 12 gap) every 32 s, as designed.
const speed = 31;

// The 3-day trial paywall's reviews: an endless, untouchable loop of
// cards (drawn twice, sliding by one copy's width, like the onboarding
// MarqueeRow). With Reduce Motion on, a plain horizontal scroller.
export function ReviewMarquee() {
  const { t } = useTranslation();
  const colors = useColors();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const reduceMotion = useReducedMotion();

  const copyWidth = useSharedValue(0);
  const offset = useSharedValue(0);

  useFrameCallback(frame => {
    const width = copyWidth.value;
    const dt = frame.timeSincePreviousFrame;
    if (width === 0 || dt === null) {
      return;
    }
    offset.value = (offset.value + (speed * dt) / 1000) % width;
  }, !reduceMotion);

  const stripStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: -offset.value }],
  }));

  const onCopyLayout = (e: LayoutChangeEvent) => {
    copyWidth.value = e.nativeEvent.layout.width;
  };

  const renderCopy = (copy: number) => (
    <View
      key={copy}
      style={styles.copy}
      onLayout={copy === 0 ? onCopyLayout : undefined}
      // The second copy is decoration for the loop.
      importantForAccessibility={copy === 0 ? 'auto' : 'no-hide-descendants'}
      accessibilityElementsHidden={copy !== 0}
    >
      {reviews.map(key => (
        <View key={key} style={[styles.card, shadows(colors).review]}>
          <View
            style={styles.stars}
            accessible
            accessibilityLabel={t('trialPaywall.stars')}
          >
            {[0, 1, 2, 3, 4].map(i => (
              <Star
                key={i}
                size={13}
                strokeWidth={0}
                fill={colors.paywall.star}
                color={colors.paywall.star}
              />
            ))}
          </View>
          <Text style={styles.quote}>{t(`trialPaywall.reviews.${key}`)}</Text>
        </View>
      ))}
    </View>
  );

  if (reduceMotion) {
    return (
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.row}
        contentContainerStyle={styles.strip}
      >
        {renderCopy(0)}
      </ScrollView>
    );
  }

  return (
    <View style={styles.row}>
      <Animated.View style={[styles.strip, stripStyle]}>
        {[0, 1].map(renderCopy)}
      </Animated.View>
      {/* Soft fade at both edges. */}
      <View
        pointerEvents="none"
        style={[
          styles.fade,
          styles.fadeLeft,
          gradientStyle(colors, 'trialFadeLeft'),
        ]}
      />
      <View
        pointerEvents="none"
        style={[
          styles.fade,
          styles.fadeRight,
          gradientStyle(colors, 'trialFadeRight'),
        ]}
      />
    </View>
  );
}

const makeStyles = ({ paywall }: Palette) =>
  StyleSheet.create({
    // Room above and below the cards for their shadow.
    row: {
      height: 186,
      overflow: 'hidden',
    },
    strip: {
      flexDirection: 'row',
      alignSelf: 'flex-start',
      paddingTop: 10,
      paddingBottom: 18,
      paddingLeft: 20,
    },
    copy: {
      flexDirection: 'row',
    },
    card: {
      width: 236,
      height: 156,
      marginRight: 12,
      padding: 16,
      borderRadius: 22,
      backgroundColor: paywall.raised,
      gap: 8,
    },
    stars: {
      flexDirection: 'row',
      gap: 2,
    },
    quote: {
      fontFamily: 'Figtree_500Medium',
      fontSize: 16,
      lineHeight: 22,
      color: paywall.text,
    },
    fade: {
      position: 'absolute',
      top: 0,
      bottom: 0,
      width: 28,
    },
    fadeLeft: {
      left: 0,
    },
    fadeRight: {
      right: 0,
    },
  });
