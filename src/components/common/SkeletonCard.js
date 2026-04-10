import React, { useEffect } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useSharedValue, useAnimatedStyle,
  withRepeat, withSequence, withTiming,
} from 'react-native-reanimated';

const CARD_WIDTH = (Dimensions.get('window').width - 16 * 2 - 8) / 2;

export default function SkeletonCard() {
  const opacity = useSharedValue(0.4);

  useEffect(() => {
    opacity.value = withRepeat(
      withSequence(
        withTiming(0.9, { duration: 700 }),
        withTiming(0.4, { duration: 700 }),
      ),
      -1,
      false,
    );
  }, []);

  const animStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return (
    <Animated.View style={[styles.card, animStyle]}>
      {/* Cover placeholder */}
      <View style={styles.cover} />
      {/* Content placeholder */}
      <View style={styles.content}>
        <View style={styles.bar} />
        <View style={[styles.bar, { width: '50%', marginTop: 6 }]} />
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    backgroundColor: '#1E293B',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#334155',
    overflow: 'hidden',
  },
  cover: {
    width: CARD_WIDTH,
    height: CARD_WIDTH,
    backgroundColor: '#263348',
  },
  content: {
    paddingHorizontal: 10,
    paddingTop: 8,
    paddingBottom: 10,
  },
  bar: {
    height: 6,
    borderRadius: 999,
    backgroundColor: '#334155',
    width: '100%',
  },
});
