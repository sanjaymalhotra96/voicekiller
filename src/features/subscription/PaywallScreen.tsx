import { Check, LucideIcon, X } from 'lucide-react-native';
import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  ChangerIcon,
  CleanIcon,
  ClonesIcon,
  EditorIcon,
  VoicesIcon,
} from '@/features/subscription/paywallIcons';
import { alpha, Palette, useColors } from '@/theme';

export type PaywallPlan = 'yearly' | 'monthly';

type Props = {
  onClose: () => void;
  onContinue: (plan: PaywallPlan) => void;
  onRestore: () => void;
  onTerms: () => void;
  onPrivacy: () => void;
  // Store prices; the design's values until they load.
  yearlyPrice?: string;
  monthlyPrice?: string;
  savePercent?: number | null;
  minutesPerMonth?: number;
  // Purchase or restore running: taps are ignored.
  busy?: boolean;
};

// Unlock Studio, built to the design (StyleSheet and Figtree on purpose,
// not the app's NativeWind tokens). The route wires it to RevenueCat.
// Colours from the active scheme (palette.paywall).
const paywallColors = ({ paywall, contrast }: Palette) => ({
  brand: paywall.brand,
  tile: paywall.tile,
  icon: paywall.accent,
  selectedBg: paywall.selected,
  minutes: paywall.accent,
  card: paywall.card,
  border: paywall.line,
  text: paywall.text,
  planName: paywall.plan,
  footer: paywall.footer,
  // Screen, unselected plan card, and the SAVE badge's text (the badge
  // is `text` coloured, so its label is the page colour).
  page: paywall.page,
  // Title, check, Continue label and close icon on the orange.
  onBrand: contrast,
  closeBg: alpha(contrast, 0.25),
});
type PaywallColors = ReturnType<typeof paywallColors>;

const fonts = {
  regular: 'Figtree_400Regular',
  medium: 'Figtree_500Medium',
  semibold: 'Figtree_600SemiBold',
  bold: 'Figtree_700Bold',
  extrabold: 'Figtree_800ExtraBold',
};

const features: { key: string; icon: LucideIcon }[] = [
  { key: 'voices', icon: VoicesIcon },
  { key: 'clones', icon: ClonesIcon },
  { key: 'audioClean', icon: CleanIcon },
  { key: 'voiceChanger', icon: ChangerIcon },
  { key: 'speechEditor', icon: EditorIcon },
];

export function PaywallScreen({
  onClose,
  onContinue,
  onRestore,
  onTerms,
  onPrivacy,
  yearlyPrice = '$90',
  monthlyPrice = '$9',
  savePercent = 17,
  minutesPerMonth = 240,
  busy = false,
}: Props) {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const palette = useColors();
  const colors = useMemo(() => paywallColors(palette), [palette]);
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const [plan, setPlan] = useState<PaywallPlan>('yearly');
  const minutes = t('paywall.minutes', { count: minutesPerMonth });

  const plans = [
    { id: 'yearly', name: t('paywall.yearly'), price: yearlyPrice },
    { id: 'monthly', name: t('paywall.monthly'), price: monthlyPrice },
  ] as const;

  const links = [
    { key: 'restore', onPress: onRestore },
    { key: 'terms', onPress: onTerms },
    { key: 'privacy', onPress: onPrivacy },
  ] as const;

  return (
    <View style={styles.screen}>
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingBottom: Math.max(insets.bottom - 16, 16) },
        ]}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        <View style={[styles.header, { paddingTop: insets.top }]}>
          <Text style={styles.title} accessibilityRole="header">
            {t('paywall.title')}
          </Text>
        </View>

        <View style={styles.body}>
          <View style={styles.spacer} />
          <View style={styles.featureCard}>
            {features.map(({ key, icon: FeatureIcon }) => (
              <View key={key} style={styles.featureRow}>
                <View style={styles.iconTile}>
                  <FeatureIcon
                    size={16}
                    strokeWidth={1.8}
                    color={colors.icon}
                  />
                </View>
                <Text style={styles.featureLabel}>
                  {t(`paywall.features.${key as 'voices'}`)}
                </Text>
              </View>
            ))}
          </View>

          <View style={styles.spacer} />

          <View style={styles.plans}>
            {plans.map(item => {
              const selected = plan === item.id;
              return (
                <Pressable
                  key={item.id}
                  accessibilityRole="radio"
                  accessibilityState={{ checked: selected }}
                  disabled={busy}
                  onPress={() => setPlan(item.id)}
                  style={[styles.planCard, selected && styles.planCardSelected]}
                >
                  {item.id === 'yearly' && savePercent ? (
                    <View style={styles.badge}>
                      <Text style={styles.badgeText}>
                        {t('paywall.save', { percent: savePercent })}
                      </Text>
                    </View>
                  ) : null}
                  {selected ? (
                    <View style={styles.check}>
                      <Check size={13} strokeWidth={3} color={colors.onBrand} />
                    </View>
                  ) : null}
                  <Text style={styles.planName}>{item.name}</Text>
                  <Text style={styles.price}>{item.price}</Text>
                  <Text style={styles.minutes}>{minutes}</Text>
                </Pressable>
              );
            })}
          </View>

          {/* A fixed style, not Pressable's style function: NativeWind
              drops that, which left the button white on white. */}
          <TouchableOpacity
            accessibilityRole="button"
            activeOpacity={0.8}
            disabled={busy}
            onPress={() => onContinue(plan)}
            style={[styles.cta, busy && styles.ctaDimmed]}
          >
            <Text style={styles.ctaText}>{t('paywall.continue')}</Text>
          </TouchableOpacity>

          <View style={styles.footer}>
            <Text style={styles.footerText}>{t('paywall.cancelAnytime')}</Text>
            {links.map(link => (
              <Pressable
                key={link.key}
                accessibilityRole="link"
                hitSlop={8}
                disabled={busy}
                onPress={link.onPress}
              >
                <Text style={[styles.footerText, styles.footerLink]}>
                  {t(`paywall.${link.key}`)}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>
      </ScrollView>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel={t('paywall.close')}
        hitSlop={8}
        disabled={busy}
        onPress={onClose}
        style={[styles.close, { top: insets.top + 16 }]}
      >
        <X size={20} strokeWidth={2} color={colors.onBrand} />
      </Pressable>
    </View>
  );
}

const makeStyles = (colors: PaywallColors) =>
  StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: colors.page,
    },
    content: {
      flexGrow: 1,
    },
    header: {
      height: 250,
      backgroundColor: colors.brand,
      alignItems: 'center',
      justifyContent: 'center',
    },
    title: {
      fontFamily: fonts.extrabold,
      fontSize: 44,
      letterSpacing: -1.2,
      color: colors.onBrand,
      textAlign: 'center',
    },
    close: {
      position: 'absolute',
      right: 16,
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: colors.closeBg,
      alignItems: 'center',
      justifyContent: 'center',
    },
    body: {
      flexGrow: 1,
      paddingHorizontal: 24,
    },
    // Above the feature card and the plans: 32 at least, and on taller
    // screens they share the extra height equally (61 each on an iPhone 14,
    // as designed), keeping the footer at the bottom.
    spacer: {
      flexGrow: 1,
      minHeight: 32,
    },
    featureCard: {
      backgroundColor: colors.card,
      borderRadius: 24,
      padding: 20,
      gap: 14,
    },
    featureRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    iconTile: {
      width: 30,
      height: 30,
      borderRadius: 8,
      backgroundColor: colors.tile,
      alignItems: 'center',
      justifyContent: 'center',
    },
    featureLabel: {
      flex: 1,
      fontFamily: fonts.semibold,
      fontSize: 16,
      color: colors.text,
    },
    plans: {
      flexDirection: 'row',
      gap: 12,
      overflow: 'visible',
    },
    planCard: {
      flex: 1,
      borderRadius: 16,
      borderWidth: 2,
      borderColor: colors.border,
      backgroundColor: colors.page,
      padding: 16,
      overflow: 'visible',
    },
    planCardSelected: {
      borderColor: colors.brand,
      backgroundColor: colors.selectedBg,
    },
    badge: {
      position: 'absolute',
      // Inside the 2px border: 16 from the card edge, 9.5 above it.
      top: -11.5,
      left: 14,
      zIndex: 1,
      backgroundColor: colors.text,
      borderRadius: 999,
      paddingHorizontal: 10,
      paddingVertical: 4,
    },
    badgeText: {
      fontFamily: fonts.extrabold,
      fontSize: 11,
      color: colors.page,
      letterSpacing: 0.4,
      textTransform: 'uppercase',
    },
    check: {
      position: 'absolute',
      top: 14,
      right: 14,
      width: 22,
      height: 22,
      borderRadius: 11,
      backgroundColor: colors.brand,
      alignItems: 'center',
      justifyContent: 'center',
    },
    planName: {
      fontFamily: fonts.medium,
      fontSize: 15,
      color: colors.planName,
    },
    price: {
      fontFamily: fonts.extrabold,
      fontSize: 32,
      color: colors.text,
    },
    minutes: {
      fontFamily: fonts.semibold,
      fontSize: 13,
      color: colors.minutes,
    },
    cta: {
      marginTop: 16,
      height: 56,
      borderRadius: 16,
      backgroundColor: colors.brand,
      alignItems: 'center',
      justifyContent: 'center',
    },
    ctaDimmed: {
      opacity: 0.8,
    },
    ctaText: {
      fontFamily: fonts.bold,
      fontSize: 17,
      color: colors.onBrand,
    },
    footer: {
      marginTop: 12,
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      gap: 14,
    },
    footerText: {
      fontFamily: fonts.regular,
      fontSize: 12,
      color: colors.footer,
    },
    footerLink: {
      textDecorationLine: 'underline',
    },
  });
