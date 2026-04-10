import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, FlatList,
  TouchableOpacity, TextInput, RefreshControl,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Search, ShoppingBag, ShoppingCart, PackageCheck } from 'lucide-react-native';
import { getAllMaterialsWithProject, updateMaterial } from '../database/materialsDao';

const COLORS = {
  bg: '#0F172A', surface: '#1E293B', textPrimary: '#F8FAFC',
  textSecondary: '#94A3B8', accent: '#A855F7', teal: '#2DD4BF',
  border: '#334155',
};

const FILTERS = [
  { key: 'all', label: 'Tous' },
  { key: 'to_buy', label: 'À acheter' },
  { key: 'bought', label: 'Achetés' },
];

export default function InventoryScreen() {
  const [materials, setMaterials] = useState([]);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  useFocusEffect(useCallback(() => { loadData(); }, []));

  const loadData = async () => {
    const data = await getAllMaterialsWithProject();
    setMaterials(data);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleToggleBought = async (mat) => {
    await updateMaterial(mat.id, { is_bought: mat.is_bought ? 0 : 1 });
    loadData();
  };

  const filtered = materials.filter((m) => {
    const matchSearch = search.trim() === '' ||
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.project_name.toLowerCase().includes(search.toLowerCase());
    const matchFilter =
      filter === 'all' ||
      (filter === 'bought' && m.is_bought) ||
      (filter === 'to_buy' && !m.is_bought);
    return matchSearch && matchFilter;
  });

  const toBuyCount = materials.filter((m) => !m.is_bought).length;
  const boughtCount = materials.filter((m) => m.is_bought).length;
  const totalAll = materials.reduce((a, m) => a + (m.price || 0), 0);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Inventaire</Text>
        <Text style={styles.subtitle}>{materials.length} matériaux · {totalAll.toFixed(2)} €</Text>
      </View>

      {/* Stats */}
      <View style={styles.statsRow}>
        <View style={styles.statBox}>
          <Text style={styles.statValue}>{toBuyCount}</Text>
          <Text style={styles.statLabel}>À acheter</Text>
        </View>
        <View style={[styles.statBox, { borderColor: COLORS.teal }]}>
          <Text style={[styles.statValue, { color: COLORS.teal }]}>{boughtCount}</Text>
          <Text style={styles.statLabel}>Achetés</Text>
        </View>
        <View style={[styles.statBox, { borderColor: COLORS.accent }]}>
          <Text style={[styles.statValue, { color: COLORS.accent }]}>{totalAll.toFixed(0)} €</Text>
          <Text style={styles.statLabel}>Total dépensé</Text>
        </View>
      </View>

      {/* Recherche */}
      <View style={styles.searchRow}>
        <Search size={15} color={COLORS.textSecondary} />
        <TextInput
          style={styles.searchInput}
          value={search}
          onChangeText={setSearch}
          placeholder="Rechercher..."
          placeholderTextColor={COLORS.border}
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch('')}>
            <Text style={styles.searchClear}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Filtres */}
      <View style={styles.filterRow}>
        {FILTERS.map((f) => (
          <TouchableOpacity
            key={f.key}
            style={[styles.filterBtn, filter === f.key && styles.filterBtnActive]}
            onPress={() => setFilter(f.key)}
          >
            <Text style={[styles.filterText, filter === f.key && styles.filterTextActive]}>
              {f.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor="#A855F7" />}
        renderItem={({ item }) => (
          <InventoryRow material={item} onToggle={() => handleToggleBought(item)} />
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <ShoppingBag size={40} color={COLORS.border} />
            <Text style={styles.emptyText}>
              {search ? 'Aucun résultat.' : 'Aucun matériau encore ajouté.'}
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

function InventoryRow({ material, onToggle }) {
  const bought = !!material.is_bought;
  return (
    <View style={[styles.row, bought && styles.rowBought]}>
      <TouchableOpacity style={[styles.check, bought && styles.checkDone]} onPress={onToggle}>
        {bought && <Text style={styles.checkMark}>✓</Text>}
      </TouchableOpacity>
      <View style={styles.rowInfo}>
        <Text style={[styles.rowName, bought && styles.rowNameDone]} numberOfLines={1}>
          {material.name}
        </Text>
        <Text style={styles.rowMeta} numberOfLines={1}>
          {material.project_name}{material.part_name ? ` · ${material.part_name}` : ''}
        </Text>
      </View>
      {material.price > 0 && (
        <Text style={[styles.rowPrice, bought && { color: COLORS.textSecondary }]}>
          {material.price.toFixed(2)} €
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  header: { paddingHorizontal: 16, paddingTop: 20, paddingBottom: 8 },
  title: { fontSize: 28, fontWeight: '700', color: COLORS.textPrimary },
  subtitle: { fontSize: 13, color: COLORS.textSecondary, marginTop: 2, marginBottom: 14 },
  statsRow: { flexDirection: 'row', gap: 10, paddingHorizontal: 16, marginBottom: 14 },
  statBox: {
    flex: 1, backgroundColor: COLORS.surface, borderRadius: 12,
    borderWidth: 1, borderColor: COLORS.border, padding: 10, alignItems: 'center',
  },
  statValue: { fontSize: 20, fontWeight: '700', color: COLORS.textPrimary },
  statLabel: { fontSize: 11, color: COLORS.textSecondary, marginTop: 2 },
  searchRow: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: COLORS.surface, borderRadius: 12,
    borderWidth: 1, borderColor: COLORS.border,
    marginHorizontal: 16, paddingHorizontal: 12, paddingVertical: 10, marginBottom: 12,
  },
  searchInput: { flex: 1, fontSize: 14, color: COLORS.textPrimary },
  searchClear: { fontSize: 14, color: COLORS.textSecondary },
  filterRow: { flexDirection: 'row', paddingHorizontal: 16, gap: 8, marginBottom: 12 },
  filterBtn: {
    paddingHorizontal: 14, paddingVertical: 6, borderRadius: 999,
    backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border,
  },
  filterBtnActive: { backgroundColor: COLORS.accent, borderColor: COLORS.accent },
  filterText: { fontSize: 13, color: COLORS.textSecondary, fontWeight: '500' },
  filterTextActive: { color: '#F8FAFC' },
  list: { paddingHorizontal: 16, paddingBottom: 40 },
  row: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: COLORS.surface, borderRadius: 12,
    borderWidth: 1, borderColor: COLORS.border,
    padding: 12, marginBottom: 8, gap: 10,
  },
  rowBought: { opacity: 0.55 },
  check: {
    width: 22, height: 22, borderRadius: 6,
    borderWidth: 2, borderColor: COLORS.border,
    alignItems: 'center', justifyContent: 'center',
  },
  checkDone: { backgroundColor: COLORS.teal, borderColor: COLORS.teal },
  checkMark: { fontSize: 12, color: '#0F172A', fontWeight: '700' },
  rowInfo: { flex: 1 },
  rowName: { fontSize: 14, color: COLORS.textPrimary, fontWeight: '500' },
  rowNameDone: { textDecorationLine: 'line-through', color: COLORS.textSecondary },
  rowMeta: { fontSize: 11, color: COLORS.textSecondary, marginTop: 2 },
  rowPrice: { fontSize: 13, color: COLORS.accent, fontWeight: '600' },
  empty: { alignItems: 'center', paddingTop: 60, gap: 12 },
  emptyText: { fontSize: 14, color: COLORS.textSecondary },
});
