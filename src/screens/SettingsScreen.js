import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, Alert, Linking } from 'react-native';
import { Crown, Palette, Info, ExternalLink, ChevronRight } from 'lucide-react-native';
import { FORCE_PREMIUM, FREE_PROJECT_LIMIT } from '../config';
import FooterCredit from '../components/common/FooterCredit';

const COLORS = {
  bg: '#0F172A',
  surface: '#1E293B',
  textPrimary: '#F8FAFC',
  textSecondary: '#94A3B8',
  accent: '#A855F7',
  teal: '#2DD4BF',
  border: '#334155',
  warning: '#FBBF24',
};

const isPremium = FORCE_PREMIUM;

export default function SettingsScreen() {
  const handleUpgrade = () => {
    Alert.alert(
      'Passer en version Pro',
      'La version Pro débloque :\n\n• Projets illimités\n• Export PDF complet\n\n(Achat intégré à venir)',
      [{ text: 'Fermer', style: 'cancel' }]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Réglages</Text>
      </View>

      {/* Bloc Pro */}
      {isPremium ? (
        <View style={styles.proBanner}>
          <Crown size={18} color={COLORS.warning} />
          <Text style={styles.proBannerText}>Version Pro activée</Text>
        </View>
      ) : (
        <TouchableOpacity style={styles.upgradeCard} onPress={handleUpgrade}>
          <View style={styles.upgradeCardLeft}>
            <Crown size={20} color={COLORS.warning} />
            <View>
              <Text style={styles.upgradeTitle}>Passer en Pro</Text>
              <Text style={styles.upgradeSubtitle}>Projets illimités · Export PDF</Text>
            </View>
          </View>
          <ChevronRight size={16} color={COLORS.warning} />
        </TouchableOpacity>
      )}

      {/* Préférences */}
      <Text style={styles.sectionLabel}>Préférences</Text>
      <View style={styles.section}>
        <View style={styles.row}>
          <Palette size={16} color={COLORS.textSecondary} />
          <Text style={styles.rowLabel}>Thème</Text>
          <Text style={styles.rowValue}>Deep Workshop (Sombre)</Text>
        </View>
        <View style={[styles.row, styles.rowLast]}>
          <Info size={16} color={COLORS.textSecondary} />
          <Text style={styles.rowLabel}>Limite gratuite</Text>
          <Text style={styles.rowValue}>{FREE_PROJECT_LIMIT} projets</Text>
        </View>
      </View>

      {/* À propos */}
      <Text style={styles.sectionLabel}>À propos</Text>
      <View style={styles.section}>
        <View style={styles.row}>
          <Info size={16} color={COLORS.textSecondary} />
          <Text style={styles.rowLabel}>Version</Text>
          <Text style={styles.rowValue}>1.0.0</Text>
        </View>
        <TouchableOpacity
          style={[styles.row, styles.rowLast]}
          onPress={() => Linking.openURL('mailto:support@craftlog.app')}
        >
          <ExternalLink size={16} color={COLORS.textSecondary} />
          <Text style={styles.rowLabel}>Contact / Support</Text>
          <ChevronRight size={14} color={COLORS.border} />
        </TouchableOpacity>
      </View>

      <Text style={styles.appCredit}>CraftLog — Fait avec passion pour les makers</Text>
      <FooterCredit style={styles.footerCredit} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  header: { paddingHorizontal: 16, paddingTop: 20, paddingBottom: 16 },
  title: { fontSize: 28, fontWeight: '700', color: COLORS.textPrimary },

  proBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    marginHorizontal: 16, marginBottom: 20,
    backgroundColor: COLORS.warning + '22', borderRadius: 12,
    borderWidth: 1, borderColor: COLORS.warning + '55',
    padding: 14,
  },
  proBannerText: { fontSize: 14, fontWeight: '700', color: COLORS.warning },

  upgradeCard: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    marginHorizontal: 16, marginBottom: 20,
    backgroundColor: COLORS.warning + '15', borderRadius: 12,
    borderWidth: 1, borderColor: COLORS.warning + '55',
    padding: 16,
  },
  upgradeCardLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  upgradeTitle: { fontSize: 15, fontWeight: '700', color: COLORS.warning },
  upgradeSubtitle: { fontSize: 12, color: COLORS.textSecondary, marginTop: 2 },

  sectionLabel: {
    fontSize: 11, color: COLORS.textSecondary, fontWeight: '600',
    textTransform: 'uppercase', letterSpacing: 0.5,
    marginHorizontal: 16, marginBottom: 8, marginTop: 8,
  },
  section: {
    marginHorizontal: 16, marginBottom: 20,
    backgroundColor: COLORS.surface,
    borderRadius: 12, borderWidth: 1, borderColor: COLORS.border,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingHorizontal: 16, paddingVertical: 14,
    borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  rowLast: { borderBottomWidth: 0 },
  rowLabel: { flex: 1, fontSize: 15, color: COLORS.textPrimary, fontWeight: '500' },
  rowValue: { fontSize: 13, color: COLORS.textSecondary },

  appCredit: {
    textAlign: 'center', fontSize: 12, color: COLORS.border,
    marginTop: 'auto', paddingBottom: 4,
  },
  footerCredit: { paddingBottom: 20 },
});
