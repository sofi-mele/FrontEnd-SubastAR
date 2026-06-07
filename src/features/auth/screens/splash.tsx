import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { Easing, FadeIn, SlideInUp, ZoomIn, interpolate, useAnimatedStyle, useSharedValue, withRepeat, withSequence, withTiming } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

import { BrandIcon, BrandWordmark } from '@/components/brand/logo';
import { Screen } from '@/components/ui/primitives';
import { colors, fonts, radius, spacing, typography } from '@/constants/theme';
import { useSession } from '@/providers/app-provider';

export function SplashScreen() {
  const router = useRouter();
  const { loading, session } = useSession();
  const logoScale = useSharedValue(0.86);
  const logoOpacity = useSharedValue(0);
  const progress = useSharedValue(0);
  const float = useSharedValue(0);

  useEffect(() => {
    logoScale.value = withTiming(1, { duration: 720, easing: Easing.out(Easing.cubic) });
    logoOpacity.value = withTiming(1, { duration: 620, easing: Easing.out(Easing.quad) });
    progress.value = withTiming(1, { duration: 1600, easing: Easing.inOut(Easing.cubic) });
    float.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 1800, easing: Easing.inOut(Easing.quad) }),
        withTiming(0, { duration: 1800, easing: Easing.inOut(Easing.quad) }),
      ),
      -1,
    );
  }, [float, logoOpacity, logoScale, progress]);

  useEffect(() => {
    if (!loading) {
      const timer = setTimeout(() => router.replace(session ? '/(tabs)' : '/welcome'), 2000);
      return () => clearTimeout(timer);
    }
  }, [loading, router, session]);

  const logoAnimatedStyle = useAnimatedStyle(() => ({
    opacity: logoOpacity.value,
    transform: [{ scale: logoScale.value }],
  }));

  const progressAnimatedStyle = useAnimatedStyle(() => ({
    width: interpolate(progress.value, [0, 1], [0, 180]),
  }));

  const glowAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: interpolate(float.value, [0, 1], [-8, 8]) },
      { translateX: interpolate(float.value, [0, 1], [-5, 5]) },
      { scale: interpolate(float.value, [0, 1], [0.98, 1.04]) },
    ],
  }));

  return (
    <Screen scroll={false} style={styles.splashScreen}>
      <View style={styles.splashBackground}>
        <Animated.View style={[styles.splashGlow, styles.splashGlowTop, glowAnimatedStyle]} />
        <Animated.View style={[styles.splashGlow, styles.splashGlowBottom, glowAnimatedStyle]} />
        <View style={styles.splashRingOne} />
        <View style={styles.splashRingTwo} />

        <Animated.View entering={ZoomIn.duration(650).easing(Easing.out(Easing.cubic))} style={[styles.splashBrandBlock, logoAnimatedStyle]}>
          <View style={styles.splashLogoCircle}>
            <BrandIcon size={104} />
          </View>
          <View style={styles.splashTitleBlock}>
            <BrandWordmark />
          </View>
        </Animated.View>

        <Animated.View entering={SlideInUp.delay(250).duration(550)} style={styles.splashFeaturePill}>
          <Ionicons name="shield-checkmark-outline" size={18} color={colors.primary} />
          <Text style={styles.splashFeatureText}>Catálogos verificados · Pujas en vivo</Text>
        </Animated.View>

        <Animated.View entering={FadeIn.delay(420).duration(500)} style={styles.splashProgressBlock}>
          <View style={styles.splashProgressTrack}>
            <Animated.View style={[styles.splashProgressFill, progressAnimatedStyle]} />
          </View>
          <Text style={styles.splashLoadingText}>Cargando experiencia segura...</Text>
        </Animated.View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  splashScreen: { flex: 1, backgroundColor: colors.background, paddingHorizontal: 0 },
  splashBackground: { flex: 1, alignItems: 'center', justifyContent: 'center', overflow: 'hidden', width: '100%' },
  splashGlow: { position: 'absolute', width: 320, height: 320, borderRadius: 160, backgroundColor: colors.primarySoft, opacity: 0.62 },
  splashGlowTop: { top: -60, left: -60 },
  splashGlowBottom: { bottom: -60, right: -60, opacity: 0.45 },
  splashRingOne: { position: 'absolute', width: 420, height: 420, borderRadius: 210, borderWidth: 1, borderColor: colors.primaryBorder, opacity: 0.35, top: -140, left: -150 },
  splashRingTwo: { position: 'absolute', width: 300, height: 300, borderRadius: 150, borderWidth: 1, borderColor: colors.border, opacity: 0.55, bottom: -120, right: -80 },
  splashBrandBlock: { alignItems: 'center', justifyContent: 'center', alignSelf: 'center', width: '100%', gap: spacing.lg },
  splashLogoCircle: {
    width: 156,
    height: 156,
    borderRadius: 78,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.primaryBorder,
    shadowColor: colors.primary,
    shadowOpacity: 0.18,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 12 },
    elevation: 8,
  },
  splashTitleBlock: { alignItems: 'center', gap: spacing.xs },
  splashFeaturePill: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, marginTop: spacing.xl, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: radius.pill, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.primaryBorder },
  splashFeatureText: { color: colors.primary, fontFamily: fonts.medium, fontSize: typography.small },
  splashProgressBlock: { position: 'absolute', bottom: spacing.xl, alignSelf: 'center', alignItems: 'center', gap: spacing.sm },
  splashProgressTrack: { width: 180, height: 5, borderRadius: radius.pill, backgroundColor: colors.surfaceAlt, overflow: 'hidden' },
  splashProgressFill: { height: '100%', borderRadius: radius.pill, backgroundColor: colors.primary },
  splashLoadingText: { color: colors.textMuted, fontFamily: fonts.medium, fontSize: typography.caption },
});
