import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, Dimensions } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Trash2 } from 'lucide-react-native';
import ProgressBarCustom from '../common/ProgressBarCustom';

const CARD_WIDTH = (Dimensions.get('window').width - 16 * 2 - 8) / 2;

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

const COLORS = {
  surface: '#1E293B',
  border: '#334155',
  textPrimary: '#F8FAFC',
  textSecondary: '#94A3B8',
  accent: '#A855F7',
  teal: '#2DD4BF',
};

const STATUS_LABELS = {
  in_progress: { label: 'En cours', color: COLORS.accent },
  finished:    { label: 'Terminé',  color: COLORS.teal },
};

export default function CardProject({ project, onPress, onDelete, progress = 0 }) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const status = STATUS_LABELS[project.status] ?? STATUS_LABELS.in_progress;
  const hasImage = !!project.cover_image;

  return (
    <AnimatedTouchable
      style={[styles.card, animatedStyle]}
      onPress={onPress}
      onPressIn={() => { scale.value = withSpring(0.97); }}
      onPressOut={() => { scale.value = withSpring(1); }}
      activeOpacity={1}
    >
      {/* Cover image */}
      <View style={styles.coverContainer}>
        {hasImage ? (
          <Animated.Image
            source={{ uri: project.cover_image }}
            style={styles.cover}
            sharedTransitionTag={`cover-${project.id}`}
          />
        ) : (
          <Text style={styles.coverEmoji}>🎭</Text>
        )}

        {/* Gradient overlay + titre */}
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.75)']}
          style={styles.coverOverlay}
        >
          <Text style={styles.characterName} numberOfLines={1}>
            {project.character_name || project.name}
          </Text>
          {project.series ? (
            <Text style={styles.series} numberOfLines={1}>{project.series}</Text>
          ) : null}
        </LinearGradient>

        {/* Badge statut — haut gauche */}
        <View style={[styles.statusBadge, { backgroundColor: status.color + '22', borderColor: status.color + '66' }]}>
          <Text style={[styles.statusBadgeText, { color: status.color }]}>{status.label}</Text>
        </View>

        {/* Poubelle — haut droit */}
        <TouchableOpacity style={styles.deleteBtn} onPress={onDelete} hitSlop={{ top: 8, right: 8, bottom: 8, left: 8 }}>
          <Trash2 size={13} color="rgba(255,255,255,0.6)" />
        </TouchableOpacity>
      </View>

      {/* Barre de progression + deadline */}
      <View style={styles.content}>
        <ProgressBarCustom progress={progress} height={5} />
        {project.deadline ? (
          <Text style={styles.deadline}>⏳ {project.deadline}</Text>
        ) : null}
      </View>
    </AnimatedTouchable>
  );
}

const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
  },
  coverContainer: {
    width: CARD_WIDTH,
    height: CARD_WIDTH,
    backgroundColor: '#263348',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cover: { width: CARD_WIDTH, height: CARD_WIDTH, resizeMode: 'contain' },
  coverEmoji: { fontSize: 36 },

  coverOverlay: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    paddingHorizontal: 10, paddingTop: 24, paddingBottom: 8,
  },
  characterName: { fontSize: 12, fontWeight: '700', color: '#F8FAFC' },
  series: { fontSize: 10, color: 'rgba(255,255,255,0.65)', marginTop: 1 },

  statusBadge: {
    position: 'absolute', top: 8, left: 8,
    borderWidth: 1, borderRadius: 999,
    paddingHorizontal: 7, paddingVertical: 2,
  },
  statusBadgeText: { fontSize: 9, fontWeight: '700' },

  deleteBtn: {
    position: 'absolute', top: 6, right: 6,
    backgroundColor: 'rgba(0,0,0,0.35)', borderRadius: 999, padding: 5,
  },

  content: { paddingHorizontal: 10, paddingTop: 8, paddingBottom: 10 },
  deadline: { fontSize: 9, color: COLORS.textSecondary, marginTop: 5 },
});
