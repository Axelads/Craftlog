import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, SafeAreaView, TouchableOpacity, Image, Alert, RefreshControl, TextInput } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Lock, Search, X } from 'lucide-react-native';

import { getAllProjects, deleteProject } from '../database/projectsDao';
import CardProject from '../components/project/CardProject';
import FloatingActionButton from '../components/common/FloatingActionButton';
import SkeletonCard from '../components/common/SkeletonCard';
import FooterCredit from '../components/common/FooterCredit';
import { FORCE_PREMIUM, FREE_PROJECT_LIMIT } from '../config';

const COLORS = {
  bg: '#0F172A',
  textPrimary: '#F8FAFC',
  textSecondary: '#94A3B8',
  accent: '#A855F7',
  surface: '#1E293B',
};

export default function HomeScreen({ navigation }) {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // 'all' | 'in_progress' | 'finished'
  const [search, setSearch] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  useFocusEffect(
    useCallback(() => {
      loadProjects();
    }, [])
  );

  const loadProjects = async () => {
    const data = await getAllProjects();
    setProjects(data);
    setLoading(false);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadProjects();
    setRefreshing(false);
  };

  const handleDelete = (project) => {
    Alert.alert(
      'Supprimer le projet',
      `Supprimer "${project.character_name || project.name}" ? Toutes les pièces, matériaux et photos seront perdus.`,
      [
        { text: 'Annuler', style: 'cancel' },
        { text: 'Supprimer', style: 'destructive', onPress: async () => { await deleteProject(project.id); loadProjects(); } },
      ]
    );
  };

  const isPremium = FORCE_PREMIUM;

  const filtered = projects.filter((p) => {
    const matchFilter = filter === 'all' || p.status === filter;
    const q = search.trim().toLowerCase();
    const matchSearch = q === '' ||
      (p.character_name ?? '').toLowerCase().includes(q) ||
      (p.name ?? '').toLowerCase().includes(q) ||
      (p.series ?? '').toLowerCase().includes(q);
    return matchFilter && matchSearch;
  });

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Image
          source={require('../../assets/logo.png')}
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={styles.subtitle}>{projects.length} projet{projects.length !== 1 ? 's' : ''}</Text>
      </View>

      {/* Barre de recherche */}
      <View style={styles.searchRow}>
        <Search size={15} color={COLORS.textSecondary} />
        <TextInput
          style={styles.searchInput}
          value={search}
          onChangeText={setSearch}
          placeholder="Rechercher un projet, personnage, série..."
          placeholderTextColor="#334155"
          returnKeyType="search"
          clearButtonMode="never"
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch('')} hitSlop={{ top: 8, right: 8, bottom: 8, left: 8 }}>
            <X size={15} color={COLORS.textSecondary} />
          </TouchableOpacity>
        )}
      </View>

      {/* Filtres */}
      <View style={styles.filterRow}>
        {['all', 'in_progress', 'finished'].map((f) => (
          <TouchableOpacity
            key={f}
            style={[styles.filterBtn, filter === f && styles.filterBtnActive]}
            onPress={() => setFilter(f)}
          >
            <Text style={[styles.filterText, filter === f && styles.filterTextActive]}>
              {f === 'all' ? 'Tous' : f === 'in_progress' ? 'En cours' : 'Terminés'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Liste */}
      {loading ? (
        <View style={styles.skeletonGrid}>
          {[0, 1, 2, 3].map((i) => (
            <SkeletonCard key={i} />
          ))}
        </View>
      ) : null}
      <FlatList
        data={loading ? [] : filtered}
        keyExtractor={(item) => item.id.toString()}
        numColumns={2}
        columnWrapperStyle={styles.row}
        renderItem={({ item }) => (
          <CardProject
            project={item}
            onPress={() => navigation.navigate('ProjectDetail', { projectId: item.id })}
            onDelete={() => handleDelete(item)}
          />
        )}
        contentContainerStyle={styles.list}
        ListFooterComponent={<FooterCredit style={styles.footerCredit} />}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor="#A855F7" />}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>
              {search.trim() ? 'Aucun résultat.' : 'Aucun projet pour l\'instant.'}
            </Text>
            {!search.trim() && (
              <Text style={styles.emptyHint}>Appuie sur + pour commencer !</Text>
            )}
          </View>
        }
      />

      {isPremium || projects.length < FREE_PROJECT_LIMIT ? (
        <FloatingActionButton onPress={() => navigation.navigate('CreateProject')} />
      ) : (
        <TouchableOpacity
          style={styles.upgradeBtn}
          onPress={() => Alert.alert('Version gratuite', `La version gratuite est limitée à ${FREE_PROJECT_LIMIT} projets. Passe en version Pro dans les Réglages pour en créer davantage.`)}
        >
          <Lock size={16} color="#F8FAFC" />
          <Text style={styles.upgradeBtnText}>Limite atteinte — Passer Pro</Text>
        </TouchableOpacity>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  header: { paddingHorizontal: 16, paddingTop: 20, paddingBottom: 8, alignItems: 'center' },
  logo: { height: 85, width: 85 },
  subtitle: { fontSize: 13, color: COLORS.textSecondary, marginTop: 6 },
  searchRow: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    marginHorizontal: 16, marginBottom: 10,
    backgroundColor: '#1E293B', borderRadius: 12,
    borderWidth: 1, borderColor: '#334155',
    paddingHorizontal: 12, paddingVertical: 9,
  },
  searchInput: {
    flex: 1, fontSize: 14, color: '#F8FAFC',
    paddingVertical: 0,
  },
  filterRow: { flexDirection: 'row', paddingHorizontal: 16, gap: 8, marginBottom: 12 },
  filterBtn: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: '#1E293B',
    borderWidth: 1,
    borderColor: '#334155',
  },
  filterBtnActive: { backgroundColor: '#A855F7', borderColor: '#A855F7' },
  filterText: { fontSize: 13, color: '#94A3B8', fontWeight: '500' },
  filterTextActive: { color: '#F8FAFC' },
  list: { paddingHorizontal: 16, paddingBottom: 100 },
  row: { gap: 8, marginBottom: 8 },
  skeletonGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, paddingHorizontal: 16, marginTop: 4 },
  empty: { alignItems: 'center', marginTop: 80 },
  emptyText: { fontSize: 16, color: '#94A3B8', fontWeight: '500' },
  emptyHint: { fontSize: 13, color: '#334155', marginTop: 6 },
  upgradeBtn: {
    position: 'absolute', bottom: 30, alignSelf: 'center',
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: '#475569', borderRadius: 999,
    paddingHorizontal: 20, paddingVertical: 14,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 8, elevation: 6,
  },
  upgradeBtnText: { fontSize: 14, fontWeight: '700', color: '#F8FAFC' },
  footerCredit: { marginTop: 8 },
});
