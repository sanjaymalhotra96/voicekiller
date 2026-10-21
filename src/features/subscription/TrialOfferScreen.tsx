import { useVideoPlayer, VideoView } from 'expo-video';
import { Check } from 'lucide-react-native';
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { videos } from '@/assets';
import { Palette, useColors } from '@/theme';

type Props = {
  onTry: () => void;
};

// Shown once after signup, before the paywall. Same look as the paywall
// (StyleSheet and Figtree on purpose, colours from palette.paywall).
const trialColors = ({ paywall, contrast }: Palette) => ({
  page: paywall.page,
  brand: paywall.brand,
  text: paywall.text,
  muted: paywall.plan,
  card: paywall.card,
  onBrand: contrast,
});
type TrialColors = ReturnType<typeof trialColors>;

const fonts = {
  semibold: 'Figtree_600SemiBold',
  bold: 'Figtree_700Bold',
  extrabold: 'Figtree_800ExtraBold',
};

export function TrialOfferScreen({ onTry }: Props) {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const palette = useColors();
  const colors = useMemo(() => trialColors(palette), [palette]);
  const styles = useMemo(() => makeStyles(colors), [colors]);

  // Silent, endless loop; mixes with the user's own audio instead of
  // pausing it.
  const player = useVideoPlayer(videos.trialOffer, p => {
    p.loop = true;
    p.muted = true;
    p.audioMixingMode = 'mixWithOthers';
    p.play();
  });

  return (
    <View style={styles.screen}>
      <ScrollView
        contentContainerStyle={[
          styles.content,
          {
            paddingTop: insets.top + 32,
            paddingBottom: Math.max(insets.bottom, 16),
          },
        ]}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        <Text style={styles.title} accessibilityRole="header">
          {t('trialOffer.title')}
          {'\n'}
          <Text style={styles.titleHighlight}>
            {t('trialOffer.titleHighlight')}
          </Text>
        </Text>

        <View style={styles.spacer} />

        <View style={styles.videoCard}>
          <VideoView
            player={player}
            style={StyleSheet.absoluteFill}
            contentFit="cover"
            nativeControls={false}
            allowsPictureInPicture={false}
            accessible={false}
          />
        </View>

        <View style={styles.spacer} />

        <View style={styles.noPayment}>
          <View style={styles.check}>
            <Check size={13} strokeWidth={3} color={colors.onBrand} />
          </View>
          <Text style={styles.noPaymentText}>
            {t('trialOffer.noPaymentToday')}
          </Text>
        </View>

        {/* A fixed style, not Pressable's style function: NativeWind
            drops that (see PaywallScreen). */}
        <TouchableOpacity
          accessibilityRole="button"
          activeOpacity={0.8}
          onPress={onTry}
          style={styles.cta}
        >
          <Text style={styles.ctaText}>{t('trialOffer.cta')}</Text>
        </TouchableOpacity>
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
      paddingHorizontal: 24,
    },
    title: {
      fontFamily: fonts.extrabold,
      fontSize: 34,
      lineHeight: 40,
      letterSpacing: -0.8,
      color: colors.text,
      textAlign: 'center',
    },
    titleHighlight: {
      color: colors.brand,
    },
    // Above and below the video: 32 at least, sharing any extra height
    // so the button stays at the bottom.
    spacer: {
      flexGrow: 1,
      minHeight: 32,
    },
    videoCard: {
      width: '100%',
      aspectRatio: 16 / 9,
      borderRadius: 24,
      overflow: 'hidden',
      backgroundColor: colors.card,
    },
    noPayment: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
    },
    check: {
      width: 22,
      height: 22,
      borderRadius: 11,
      backgroundColor: colors.brand,
      alignItems: 'center',
      justifyContent: 'center',
    },
    noPaymentText: {
      fontFamily: fonts.semibold,
      fontSize: 16,
      color: colors.muted,
    },
    cta: {
      marginTop: 16,
      height: 56,
      borderRadius: 16,
      backgroundColor: colors.brand,
      alignItems: 'center',
      justifyContent: 'center',
    },
    ctaText: {
      fontFamily: fonts.bold,
      fontSize: 17,
      color: colors.onBrand,
    },
  });
