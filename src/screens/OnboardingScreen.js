import React, { useEffect } from 'react';
import {
  View, Text, StyleSheet, Image, TouchableOpacity,
  Dimensions, SafeAreaView,
} from 'react-native';
import Animated, {
  useSharedValue, useAnimatedStyle,
  withSpring, withTiming, withDelay, withSequence,
  Easing,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Scissors, Camera, FileDown } from 'lucide-react-native';
import * as SecureStore from 'expo-secure-store';
import FooterCredit from '../components/common/FooterCredit';

const { width, height } = Dimensions.get('window');

const FEATURES = [
  { icon: Scissors, label: 'Patrons & Matériaux',  desc: 'Suit chaque pièce, son budget et ses achats' },
  { icon: Camera,   label: 'Galerie de progression', desc: 'Photos étape par étape avec notes' },
  { icon: FileDown, label: 'Export PDF',             desc: 'Partage ton projet en un tap' },
];

export default function OnboardingScreen({ navigation }) {
  // --- Valeurs animées ---
  const glowScale  = useSharedValue(0.6);
  const glowOpacity = useSharedValue(0);

  const logoScale   = useSharedValue(0.25);
  const logoOpacity = useSharedValue(0);

  const titleY      = useSharedValue(24);
  const titleOpacity = useSharedValue(0);

  const taglineY      = useSharedValue(16);
  const taglineOpacity = useSharedValue(0);

  const featuresOpacity = useSharedValue(0);
  const featuresY       = useSharedValue(20);

  const btnScale   = useSharedValue(0.85);
  const btnOpacity = useSharedValue(0);

  useEffect(() => {
    // Glow pulse
    glowOpacity.value = withTiming(1, { duration: 800 });
    glowScale.value   = withTiming(1, { duration: 900, easing: Easing.out(Easing.exp) });

    // Logo spring — légèrement retardé
    logoOpacity.value = withDelay(200, withTiming(1, { duration: 500 }));
    logoScale.value   = withDelay(200, withSpring(1, { damping: 9, stiffness: 120 }));

    // Titre
    titleOpacity.value = withDelay(700, withTiming(1, { duration: 450 }));
    titleY.value       = withDelay(700, withTiming(0, { duration: 450, easing: Easing.out(Easing.quad) }));

    // Tagline
    taglineOpacity.value = withDelay(950, withTiming(1, { duration: 400 }));
    taglineY.value       = withDelay(950, withTiming(0, { duration: 400, easing: Easing.out(Easing.quad) }));

    // Features
    featuresOpacity.value = withDelay(1250, withTiming(1, { duration: 500 }));
    featuresY.value       = withDelay(1250, withTiming(0, { duration: 450, easing: Easing.out(Easing.quad) }));

    // Bouton
    btnOpacity.value = withDelay(1700, withTiming(1, { duration: 400 }));
    btnScale.value   = withDelay(1700, withSpring(1, { damping: 10, stiffness: 130 }));
  }, []);

  // --- Styles animés ---
  const glowStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
    transform: [{ scale: glowScale.value }],
  }));
  const logoStyle = useAnimatedStyle(() => ({
    opacity: logoOpacity.value,
    transform: [{ scale: logoScale.value }],
  }));
  const titleStyle = useAnimatedStyle(() => ({
    opacity: titleOpacity.value,
    transform: [{ translateY: titleY.value }],
  }));
  const taglineStyle = useAnimatedStyle(() => ({
    opacity: taglineOpacity.value,
    transform: [{ translateY: taglineY.value }],
  }));
  const featuresStyle = useAnimatedStyle(() => ({
    opacity: featuresOpacity.value,
    transform: [{ translateY: featuresY.value }],
  }));
  const btnStyle = useAnimatedStyle(() => ({
    opacity: btnOpacity.value,
    transform: [{ scale: btnScale.value }],
  }));

  const handleStart = async () => {
    await SecureStore.setItemAsync('hasSeenOnboarding', 'true');
    navigation.replace('Main');
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Halo derrière le logo */}
      <Animated.View style={[styles.glowWrapper, glowStyle]}>
        <LinearGradient
          colors={['#A855F722', '#2DD4BF11', 'transparent']}
          style={styles.glow}
        />
      </Animated.View>

      {/* Logo */}
      <Animated.View style={[styles.logoWrapper, logoStyle]}>
        <Image
          source={require('../../assets/logo.png')}
          style={styles.logo}
          resizeMode="contain"
        />
      </Animated.View>

      {/* Titre */}
      <Animated.Text style={[styles.title, titleStyle]}>
        CraftLog
      </Animated.Text>

      {/* Tagline */}
      <Animated.Text style={[styles.tagline, taglineStyle]}>
        Gère tes projets cosplay{'\n'}de A à Z
      </Animated.Text>

      {/* Features */}
      <Animated.View style={[styles.features, featuresStyle]}>
        {FEATURES.map(({ icon: Icon, label, desc }) => (
          <View key={label} style={styles.featureRow}>
            <View style={styles.featureIcon}>
              <Icon size={18} color="#A855F7" />
            </View>
            <View style={styles.featureText}>
              <Text style={styles.featureLabel}>{label}</Text>
              <Text style={styles.featureDesc}>{desc}</Text>
            </View>
          </View>
        ))}
      </Animated.View>

      {/* Bouton */}
      <Animated.View style={[styles.btnWrapper, btnStyle]}>
        <TouchableOpacity onPress={handleStart} activeOpacity={0.85}>
          <LinearGradient
            colors={['#A855F7', '#7C3AED', '#2DD4BF']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.btn}
          >
            <Text style={styles.btnText}>Commencer ✦</Text>
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>
      <FooterCredit style={styles.footer} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Halo
  glowWrapper: {
    position: 'absolute',
    top: height * 0.08,
    alignSelf: 'center',
    width: width * 0.9,
    height: width * 0.9,
    borderRadius: width * 0.45,
    overflow: 'hidden',
  },
  glow: {
    flex: 1,
  },

  // Logo
  logoWrapper: {
    marginBottom: 20,
  },
  logo: {
    width: width * 0.38,
    height: width * 0.38,
  },

  // Textes
  title: {
    fontSize: 42,
    fontWeight: '800',
    color: '#F8FAFC',
    letterSpacing: -0.5,
    marginBottom: 10,
  },
  tagline: {
    fontSize: 16,
    color: '#94A3B8',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 40,
  },

  // Features
  features: {
    width: '85%',
    gap: 16,
    marginBottom: 50,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  featureIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#A855F715',
    borderWidth: 1,
    borderColor: '#A855F730',
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureText: { flex: 1 },
  featureLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#F8FAFC',
    marginBottom: 2,
  },
  featureDesc: {
    fontSize: 12,
    color: '#64748B',
    lineHeight: 16,
  },

  // Bouton
  btnWrapper: {
    width: '85%',
  },
  btn: {
    borderRadius: 999,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: '#A855F7',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.45,
    shadowRadius: 14,
    elevation: 8,
  },
  btnText: {
    fontSize: 17,
    fontWeight: '800',
    color: '#F8FAFC',
    letterSpacing: 0.3,
  },
  footer: {
    position: 'absolute',
    bottom: 12,
  },
});
