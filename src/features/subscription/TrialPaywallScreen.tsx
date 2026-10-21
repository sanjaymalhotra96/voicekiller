import React, { useMemo, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { PaywallPlan } from '@/features/subscription/PaywallScreen';
import { ReviewMarquee } from '@/features/subscription/ReviewMarquee';
import { alpha, gradientStyle, Palette, shadows, useColors } from '@/theme';

type Props = {
  onLater: () => void;
  onStart: (plan: PaywallPlan) => void;
  // Store prices; the design's values until they load.
  yearlyPrice?: string;
  monthlyPrice?: string;
  // The yearly price per month, for the badge over the Yearly card.
  yearlyPerMonth?: string | null;
  savePercent?: number | null;
  // Free trial length; must match the store products' free trial.
  trialDays?: number;
  // Purchase running: taps are ignored.
  busy?: boolean;
};

// The 3-day free trial paywall shown after signup, built to the design
// (StyleSheet and Figtree on purpose, like PaywallScreen). The route
// wires it to RevenueCat. Colours from the active scheme (palette.paywall).
const trialColors = ({ paywall, contrast }: Palette) => ({
  page: paywall.canvas,
  card: paywall.raised,
  text: paywall.text,
  muted: paywall.footer,
  highlight: paywall.highlight,
  // The badge is `text` coloured, so its label is the page colour.
  badgeText: paywall.page,
  onBrand: contrast,
  ctaTextShadow: alpha(paywall.deep, 0.35),
});
type TrialColors = ReturnType<typeof trialColors>;

const fonts = {
  regular: 'Figtree_400Regular',
  medium: 'Figtree_500Medium',
  semibold: 'Figtree_600SemiBold',
  bold: 'Figtree_700Bold',
  extrabold: 'Figtree_800ExtraBold',
};

export function TrialPaywallScreen({
  onLater,
  onStart,
  yearlyPrice = '$90',
  monthlyPrice = '$9',
  yearlyPerMonth = '$7.50',
  savePercent = 17,
  trialDays = 3,
  busy = false,
}: Props) {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const palette = useColors();
  const colors = useMemo(() => trialColors(palette), [palette]);
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const shadow = shadows(palette);
  const [plan, setPlan] = useState<PaywallPlan>('yearly');
  const days = { days: trialDays };

  const plans = [
    {
      id: 'monthly',
      name: t('paywall.monthly'),
      note: t('trialPaywall.monthlyNote', days),
      price: t('trialPaywall.perMonth', { price: monthlyPrice }),
      badge: null,
    },
    {
      id: 'yearly',
      name: t('paywall.yearly'),
      note: savePercent
        ? t('trialPaywall.yearlyNote', { ...days, percent: savePercent })
        : t('trialPaywall.trialNote', days),
      price: t('trialPaywall.perYear', { price: yearlyPrice }),
      badge: yearlyPerMonth
        ? t('trialPaywall.perMonth', { price: yearlyPerMonth })
        : null,
    },
  ] as const;
  const selected = plans.find(item => item.id === plan) ?? plans[1];

  return (
    <View style={styles.screen}>
      <ScrollView
        contentContainerStyle={[
          styles.content,
          {
            paddingTop: insets.top + 8,
            paddingBottom: Math.max(insets.bottom, 20),
          },
        ]}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        <View style={styles.topBar}>
          <Pressable
            accessibilityRole="button"
            hitSlop={8}
            disabled={busy}
            onPress={onLater}
            style={styles.later}
          >
            <Text style={styles.laterText}>{t('trialPaywall.later')}</Text>
          </Pressable>
        </View>

        {/* Edge to edge, out of the screen padding. */}
        <View style={styles.reviews}>
          <ReviewMarquee />
        </View>

        <View style={styles.spacer} />

        <Text style={styles.kicker}>{t('trialPaywall.kicker')}</Text>
        <Text style={styles.title} accessibilityRole="header">
          <Trans
            i18nKey="trialPaywall.title"
            components={{ brand: <Text style={styles.titleHighlight} /> }}
          />
        </Text>

        <View style={styles.spacer} />

        <View style={styles.plans}>
          {plans.map(item => {
            const isSelected = plan === item.id;
            return (
              <Pressable
                key={item.id}
                accessibilityRole="radio"
                accessibilityState={{ checked: isSelected }}
                disabled={busy}
                onPress={() => setPlan(item.id)}
                style={[
                  styles.planCard,
                  isSelected ? shadow.trialPlanSelected : shadow.trialPlan,
                ]}
              >
                {/* The gradient border: a gradient fill under the card,
                    showing through its 2px margin. */}
                {isSelected ? (
                  <View
                    style={[
                      StyleSheet.absoluteFill,
                      styles.planBorder,
                      gradientStyle(palette, 'trialBorder'),
                    ]}
                  />
                ) : null}
                <View style={styles.planInner}>
                  <View style={styles.planText}>
                    <Text style={styles.planName}>{item.name}</Text>
                    <Text style={styles.planNote}>{item.note}</Text>
                  </View>
                  <Text style={styles.planPrice}>{item.price}</Text>
                </View>
                {item.badge ? (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>{item.badge}</Text>
                  </View>
                ) : null}
              </Pressable>
            );
          })}
        </View>

        <View style={styles.spacer} />

        {/* A fixed style, not Pressable's style function: NativeWind
            drops that (see PaywallScreen). */}
        <TouchableOpacity
          accessibilityRole="button"
          activeOpacity={0.8}
          disabled={busy}
          onPress={() => onStart(plan)}
          style={[styles.cta, shadow.trialCta, busy && styles.ctaDimmed]}
        >
          <View
            style={[
              StyleSheet.absoluteFill,
              styles.ctaFill,
              gradientStyle(palette, 'trialCta'),
            ]}
          />
          <Text style={styles.ctaText}>{t('trialPaywall.cta', days)}</Text>
          <Text style={styles.ctaSubtext}>
            {t('trialPaywall.then', { price: selected.price })}
          </Text>
        </TouchableOpacity>

        <Text style={styles.disclaimer}>
          {t('trialPaywall.disclaimer', days)}
        </Text>
      </ScrollView>
    </View>
  );
}

const makeStyles = (colors: TrialColors) =>
  StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: colors.page,
    },
    content: {
      flexGrow: 1,
      paddingHorizontal: 20,
    },
    topBar: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
    },
    later: {
      height: 44,
      paddingHorizontal: 4,
      justifyContent: 'center',
    },
    laterText: {
      fontFamily: fonts.semibold,
      fontSize: 16,
      color: colors.muted,
    },
    reviews: {
      marginTop: 4,
      marginHorizontal: -20,
    },
    // Between the reviews, title, plans and button: 24 at least, sharing
    // any extra height so the button stays at the bottom.
    spacer: {
      flexGrow: 1,
      minHeight: 24,
    },
    kicker: {
      fontFamily: fonts.bold,
      fontSize: 16,
      color: colors.text,
      textAlign: 'center',
    },
    title: {
      marginTop: 8,
      fontFamily: fonts.extrabold,
      fontSize: 32,
      lineHeight: 37,
      letterSpacing: -0.6,
      color: colors.text,
      textAlign: 'center',
    },
    titleHighlight: {
      color: colors.highlight,
    },
    plans: {
      gap: 14,
      overflow: 'visible',
    },
    planCard: {
      borderRadius: 22,
      backgroundColor: colors.card,
      overflow: 'visible',
    },
    planBorder: {
      borderRadius: 22,
    },
    planInner: {
      margin: 2,
      minHeight: 72,
      borderRadius: 20,
      backgroundColor: colors.card,
      paddingVertical: 14,
      paddingHorizontal: 18,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 12,
    },
    planText: {
      flexShrink: 1,
      gap: 2,
    },
    planName: {
      fontFamily: fonts.extrabold,
      fontSize: 19,
      color: colors.text,
    },
    planNote: {
      fontFamily: fonts.regular,
      fontSize: 14,
      color: colors.muted,
    },
    planPrice: {
      fontFamily: fonts.semibold,
      fontSize: 17,
      color: colors.text,
    },
    badge: {
      position: 'absolute',
      top: -13,
      right: 14,
      zIndex: 1,
      backgroundColor: colors.text,
      borderRadius: 999,
      paddingHorizontal: 12,
      paddingVertical: 5,
    },
    badgeText: {
      fontFamily: fonts.bold,
      fontSize: 13,
      color: colors.badgeText,
    },
    cta: {
      height: 70,
      borderRadius: 35,
      alignItems: 'center',
      justifyContent: 'center',
      gap: 2,
    },
    ctaFill: {
      borderRadius: 35,
    },
    ctaDimmed: {
      opacity: 0.8,
    },
    ctaText: {
      fontFamily: fonts.extrabold,
      fontSize: 20,
      color: colors.onBrand,
      textShadowColor: colors.ctaTextShadow,
      textShadowOffset: { width: 0, height: 1 },
      textShadowRadius: 2,
    },
    ctaSubtext: {
      fontFamily: fonts.medium,
      fontSize: 14,
      color: colors.onBrand,
      textShadowColor: colors.ctaTextShadow,
      textShadowOffset: { width: 0, height: 1 },
      textShadowRadius: 2,
    },
    disclaimer: {
      marginTop: 12,
      marginHorizontal: 8,
      fontFamily: fonts.regular,
      fontSize: 12,
      lineHeight: 17,
      color: colors.muted,
      textAlign: 'center',
    },
  });
