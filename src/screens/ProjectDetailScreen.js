import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, ScrollView, StyleSheet, SafeAreaView,
  TouchableOpacity, TextInput, Alert,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Plus, Trash2, ChevronRight, Clock, Images, Trash, FileDown, LayoutGrid, Pencil } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue, useAnimatedStyle,
  withSequence, withSpring, withTiming,
} from 'react-native-reanimated';
import GlassOverlay from '../components/common/GlassOverlay';
import { getProjectById, deleteProject } from '../database/projectsDao';
import { getPartsByProject, createPart, deletePart, updatePart } from '../database/partsDao';
import { getTotalCostByProject } from '../database/materialsDao';
import StatBadge from '../components/common/StatBadge';
import ProgressBarCustom from '../components/common/ProgressBarCustom';
import { exportProjectPDF } from '../utils/pdfExport';

const COLORS = {
  bg: '#0F172A', surface: '#1E293B', textPrimary: '#F8FAFC',
  textSecondary: '#94A3B8', accent: '#A855F7', teal: '#2DD4BF',
  border: '#334155', error: '#F87171',
};

function formatTime(seconds) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h > 0) return `${h}h${m.toString().padStart(2, '0')}`;
  return `${m}min`;
}

export default function ProjectDetailScreen({ route, navigation }) {
  const { projectId } = route.params ?? {};
  const [project, setProject] = useState(null);
  const [parts, setParts] = useState([]);
  const [totalCost, setTotalCost] = useState(0);
  const [showAddPart, setShowAddPart] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [newPartName, setNewPartName] = useState('');
  const [addingPart, setAddingPart] = useState(false);

  useFocusEffect(
    useCallback(() => {
      if (projectId) loadData();
    }, [projectId])
  );

  const loadData = async () => {
    const [p, pts, cost] = await Promise.all([
      getProjectById(projectId),
      getPartsByProject(projectId),
      getTotalCostByProject(projectId),
    ]);
    setProject(p);
    setParts(pts);
    setTotalCost(cost);
  };

  const handleAddPart = async () => {
    if (!newPartName.trim()) return;
    setAddingPart(true);
    await createPart({ project_id: projectId, name: newPartName.trim() });
    setNewPartName('');
    setShowAddPart(false);
    setAddingPart(false);
    loadData();
  };

  const handleToggleStatus = async (part) => {
    const next = part.status === 'finished' ? 'in_progress' : 'finished';
    await updatePart(part.id, { status: next });
    loadData();
  };

  const handleExportPDF = async () => {
    setExporting(true);
    try {
      await exportProjectPDF(projectId);
    } catch (e) {
      Alert.alert('Erreur', "Impossible de générer le PDF.");
    }
    setExporting(false);
  };

  const handleDeleteProject = () => {
    Alert.alert(
      'Supprimer le projet',
      `Supprimer "${project.character_name || project.name}" ? Toutes les pièces, matériaux et photos seront perdus.`,
      [
        { text: 'Annuler', style: 'cancel' },
        { text: 'Supprimer', style: 'destructive', onPress: async () => { await deleteProject(projectId); navigation.goBack(); } },
      ]
    );
  };

  const handleDeletePart = (part) => {
    Alert.alert(
      'Supprimer la pièce',
      `Supprimer "${part.name}" ? Ses matériaux et photos seront perdus.`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer', style: 'destructive',
          onPress: async () => { await deletePart(part.id); loadData(); },
        },
      ]
    );
  };

  const doneCount = parts.filter((p) => p.status === 'finished').length;
  const progress = parts.length > 0 ? doneCount / parts.length : 0;
  const budgetOver = project?.budget_limit > 0 && totalCost > project.budget_limit;
  const budgetProgress = project?.budget_limit > 0 ? Math.min(totalCost / project.budget_limit, 1) : 0;
  const totalTime = parts.reduce((acc, p) => acc + (p.time_spent || 0), 0);

  if (!project) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.placeholder}>Chargement...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>

        {/* Cover hero */}
        <View style={styles.coverWrapper}>
          {project.cover_image ? (
            <Animated.Image
              source={{ uri: project.cover_image }}
              style={styles.cover}
              sharedTransitionTag={`cover-${projectId}`}
            />
          ) : (
            <View style={styles.coverPlaceholder}>
              <Text style={styles.coverEmoji}>🎭</Text>
            </View>
          )}
          <LinearGradient
            colors={['transparent', 'rgba(15,23,42,0.85)']}
            style={styles.coverGradient}
          />
        </View>

        <View style={styles.body}>
          {/* Titre */}
          <View style={styles.titleRow}>
            <Text style={[styles.title, { flex: 1 }]}>{project.character_name || project.name}</Text>
            <TouchableOpacity
              onPress={() => navigation.navigate('EditProject', { project })}
              style={styles.editProjectBtn}
            >
              <Pencil size={16} color={COLORS.accent} />
            </TouchableOpacity>
            <TouchableOpacity onPress={handleDeleteProject} style={styles.deleteProjectBtn}>
              <Trash size={18} color={COLORS.error} />
            </TouchableOpacity>
          </View>
          {project.series ? <Text style={styles.series}>{project.series}</Text> : null}
          {project.deadline ? (
            <Text style={styles.deadline}>Deadline : {project.deadline}</Text>
          ) : null}

          {/* Progression pièces */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>Avancement</Text>
              <Text style={styles.cardValue}>{doneCount}/{parts.length} pièces</Text>
            </View>
            <ProgressBarCustom progress={progress} height={8} />
          </View>

          {/* Budget */}
          <View style={[styles.card, budgetOver && styles.cardDanger]}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>Budget</Text>
              <Text style={[styles.cardValue, budgetOver && { color: COLORS.error }]}>
                {totalCost.toFixed(2)} € {project.budget_limit > 0 ? `/ ${project.budget_limit} €` : ''}
              </Text>
            </View>
            {project.budget_limit > 0 && <ProgressBarCustom progress={budgetProgress} height={6} />}
            {budgetOver && <Text style={styles.budgetWarn}>Budget dépassé !</Text>}
          </View>

          {/* Stats */}
          <View style={styles.statsRow}>
            <StatBadge label="Temps total" value={totalTime > 0 ? formatTime(totalTime) : '—'} />
            <StatBadge label="Statut" value={project.status === 'finished' ? 'Terminé' : 'En cours'} />
          </View>

          {/* Planche de référence */}
          <TouchableOpacity
            style={styles.galleryBtn}
            onPress={() => navigation.navigate('ReferenceBoard', { projectId, projectName: project.character_name || project.name })}
          >
            <LayoutGrid size={18} color={COLORS.accent} />
            <Text style={[styles.galleryBtnText, { color: COLORS.accent }]}>Planche de référence</Text>
            <ChevronRight size={16} color={COLORS.accent} />
          </TouchableOpacity>

          {/* Galerie */}
          <TouchableOpacity
            style={[styles.galleryBtn, { marginTop: 8 }]}
            onPress={() => navigation.navigate('Gallery', { projectId, projectName: project.character_name || project.name })}
          >
            <Images size={18} color={COLORS.teal} />
            <Text style={styles.galleryBtnText}>Galerie de progression</Text>
            <ChevronRight size={16} color={COLORS.teal} />
          </TouchableOpacity>

          {/* Export PDF */}
          <TouchableOpacity
            style={[styles.exportBtn, exporting && styles.btnDisabled]}
            onPress={handleExportPDF}
            disabled={exporting}
          >
            <FileDown size={18} color={COLORS.accent} />
            <Text style={styles.exportBtnText}>{exporting ? 'Génération...' : 'Exporter en PDF'}</Text>
          </TouchableOpacity>

          {/* Pièces */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Pièces du costume</Text>
            <TouchableOpacity style={styles.addBtn} onPress={() => setShowAddPart(true)}>
              <Plus size={16} color={COLORS.accent} />
              <Text style={styles.addBtnText}>Ajouter</Text>
            </TouchableOpacity>
          </View>

          {parts.length === 0 ? (
            <View style={styles.emptyParts}>
              <Text style={styles.emptyText}>Aucune pièce encore ajoutée.</Text>
              <TouchableOpacity onPress={() => setShowAddPart(true)}>
                <Text style={styles.emptyAction}>+ Ajouter la première pièce</Text>
              </TouchableOpacity>
            </View>
          ) : (
            parts.map((part) => (
              <PartRow
                key={part.id}
                part={part}
                onPress={() => navigation.navigate('PartDetail', { partId: part.id, partName: part.name, projectId })}
                onToggle={() => handleToggleStatus(part)}
                onDelete={() => handleDeletePart(part)}
              />
            ))
          )}
        </View>
      </ScrollView>

      {/* Modal ajout pièce */}
      <GlassOverlay visible={showAddPart} onClose={() => { setShowAddPart(false); setNewPartName(''); }}>
        <View style={styles.modalBox}>
          <Text style={styles.modalTitle}>Nouvelle pièce</Text>
          <TextInput
            style={styles.modalInput}
            value={newPartName}
            onChangeText={setNewPartName}
            placeholder="Ex: Casque, Cape, Épée..."
            placeholderTextColor={COLORS.border}
            autoFocus
          />
          <View style={styles.modalActions}>
            <TouchableOpacity style={styles.modalCancel} onPress={() => { setShowAddPart(false); setNewPartName(''); }}>
              <Text style={styles.modalCancelText}>Annuler</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalConfirm, (!newPartName.trim() || addingPart) && styles.btnDisabled]}
              onPress={handleAddPart}
              disabled={!newPartName.trim() || addingPart}
            >
              <Text style={styles.modalConfirmText}>{addingPart ? '...' : 'Ajouter'}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </GlassOverlay>
    </SafeAreaView>
  );
}

function PartRow({ part, onPress, onToggle, onDelete }) {
  const done = part.status === 'finished';
  const scale = useSharedValue(1);

  const handleToggle = () => {
    if (!done) {
      // Célébration : pop violet puis retour
      scale.value = withSequence(
        withSpring(1.35, { damping: 6, stiffness: 280 }),
        withTiming(1, { duration: 250 }),
      );
    }
    onToggle();
  };

  const checkAnimStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <TouchableOpacity style={styles.partRow} onPress={onPress}>
      <Animated.View style={checkAnimStyle}>
        <TouchableOpacity style={[styles.partCheck, done && styles.partCheckDone]} onPress={handleToggle}>
          {done && <Text style={styles.partCheckMark}>✓</Text>}
        </TouchableOpacity>
      </Animated.View>
      <View style={styles.partInfo}>
        <Text style={[styles.partName, done && styles.partNameDone]}>{part.name}</Text>
        {part.time_spent > 0 && (
          <View style={styles.partMeta}>
            <Clock size={10} color={COLORS.textSecondary} />
            <Text style={styles.partMetaText}>{formatTime(part.time_spent)}</Text>
          </View>
        )}
      </View>
      <TouchableOpacity style={styles.partDelete} onPress={onDelete}>
        <Trash2 size={15} color={COLORS.border} />
      </TouchableOpacity>
      <ChevronRight size={16} color={COLORS.border} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  scroll: { paddingBottom: 40 },
  coverWrapper: { width: '100%', height: 200 },
  cover: { width: '100%', height: 200, resizeMode: 'cover' },
  coverGradient: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 80 },
  coverPlaceholder: {
    width: '100%', height: 200, backgroundColor: '#1A2744',
    alignItems: 'center', justifyContent: 'center',
  },
  coverEmoji: { fontSize: 48 },
  body: { padding: 16 },
  titleRow: { flexDirection: 'row', alignItems: 'center', marginTop: 12 },
  editProjectBtn: { padding: 6, marginLeft: 8 },
  deleteProjectBtn: { padding: 6, marginLeft: 4 },
  title: { fontSize: 24, fontWeight: '700', color: COLORS.textPrimary },
  series: { fontSize: 14, color: COLORS.textSecondary, marginTop: 4 },
  deadline: { fontSize: 12, color: COLORS.accent, marginTop: 4, marginBottom: 4 },
  placeholder: { color: COLORS.textSecondary, textAlign: 'center', marginTop: 40 },
  card: {
    backgroundColor: COLORS.surface, borderRadius: 14, borderWidth: 1,
    borderColor: COLORS.border, padding: 14, marginTop: 16, gap: 10,
  },
  cardDanger: { borderColor: COLORS.error },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardTitle: { fontSize: 13, color: COLORS.textSecondary, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.4 },
  cardValue: { fontSize: 15, color: COLORS.textPrimary, fontWeight: '700' },
  budgetWarn: { fontSize: 12, color: COLORS.error, fontWeight: '600' },
  statsRow: { flexDirection: 'row', gap: 10, marginTop: 16 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 24, marginBottom: 12 },
  sectionTitle: { fontSize: 17, fontWeight: '700', color: COLORS.textPrimary },
  addBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  addBtnText: { fontSize: 14, color: COLORS.accent, fontWeight: '600' },
  galleryBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: COLORS.surface, borderRadius: 12,
    borderWidth: 1, borderColor: COLORS.teal + '55',
    padding: 14, marginTop: 16,
  },
  galleryBtnText: { flex: 1, fontSize: 14, color: COLORS.teal, fontWeight: '600' },
  exportBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: COLORS.surface, borderRadius: 12,
    borderWidth: 1, borderColor: COLORS.accent + '55',
    padding: 14, marginTop: 10,
  },
  exportBtnText: { flex: 1, fontSize: 14, color: COLORS.accent, fontWeight: '600' },
  emptyParts: { alignItems: 'center', paddingVertical: 24 },
  emptyText: { fontSize: 14, color: COLORS.textSecondary },
  emptyAction: { fontSize: 14, color: COLORS.accent, marginTop: 8, fontWeight: '600' },
  partRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: COLORS.surface, borderRadius: 12,
    borderWidth: 1, borderColor: COLORS.border,
    padding: 12, marginBottom: 8, gap: 10,
  },
  partCheck: {
    width: 22, height: 22, borderRadius: 999,
    borderWidth: 2, borderColor: COLORS.border,
    alignItems: 'center', justifyContent: 'center',
  },
  partCheckDone: { backgroundColor: COLORS.teal, borderColor: COLORS.teal },
  partCheckMark: { fontSize: 12, color: '#0F172A', fontWeight: '700' },
  partInfo: { flex: 1 },
  partName: { fontSize: 14, color: COLORS.textPrimary, fontWeight: '500' },
  partNameDone: { color: COLORS.textSecondary, textDecorationLine: 'line-through' },
  partMeta: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
  partMetaText: { fontSize: 11, color: COLORS.textSecondary },
  partDelete: { padding: 4 },
  modalBox: {
    width: '85%', backgroundColor: COLORS.surface,
    borderRadius: 16, padding: 20, borderWidth: 1, borderColor: COLORS.border,
  },
  modalTitle: { fontSize: 18, fontWeight: '700', color: COLORS.textPrimary, marginBottom: 16 },
  modalInput: {
    backgroundColor: COLORS.bg, borderWidth: 1, borderColor: COLORS.border,
    borderRadius: 10, color: COLORS.textPrimary, fontSize: 15,
    paddingHorizontal: 14, paddingVertical: 11, marginBottom: 16,
  },
  modalActions: { flexDirection: 'row', gap: 10 },
  modalCancel: { flex: 1, alignItems: 'center', paddingVertical: 12 },
  modalCancelText: { fontSize: 15, color: COLORS.textSecondary },
  modalConfirm: { flex: 1, backgroundColor: COLORS.accent, borderRadius: 10, alignItems: 'center', paddingVertical: 12 },
  modalConfirmText: { fontSize: 15, fontWeight: '700', color: '#F8FAFC' },
  btnDisabled: { opacity: 0.4 },
});
