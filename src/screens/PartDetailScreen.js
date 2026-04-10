import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, ScrollView,
  TouchableOpacity, Modal, TextInput, Alert, Image,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Play, Pause, RotateCcw, Plus, Trash2, ShoppingBag, ExternalLink, Images, Scissors, BookOpen, X } from 'lucide-react-native';
import GlassOverlay from '../components/common/GlassOverlay';
import * as ImagePicker from 'expo-image-picker';
import { getMaterialsByPart, createMaterial, deleteMaterial, updateMaterial } from '../database/materialsDao';
import { updatePart } from '../database/partsDao';
import { getGalleryByPart } from '../database/galleryDao';
import { getPatronsByPart, addPatron, deletePatron } from '../database/patronsDao';
import { getTutosByPart, addTuto, deleteTuto } from '../database/tutosDao';

const COLORS = {
  bg: '#0F172A', surface: '#1E293B', textPrimary: '#F8FAFC',
  textSecondary: '#94A3B8', accent: '#A855F7', teal: '#2DD4BF',
  border: '#334155', error: '#F87171', warning: '#FBBF24',
};

function formatTimer(seconds) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

export default function PartDetailScreen({ route, navigation }) {
  const { partId, partName, projectId } = route.params ?? {};

  // Matériaux
  const [materials, setMaterials] = useState([]);
  const [totalCost, setTotalCost] = useState(0);
  const [photoCount, setPhotoCount] = useState(0);
  const [showAddMaterial, setShowAddMaterial] = useState(false);
  const [matName, setMatName] = useState('');
  const [matPrice, setMatPrice] = useState('');
  const [matLink, setMatLink] = useState('');
  const [saving, setSaving] = useState(false);

  // Patrons
  const [patrons, setPatrons] = useState([]);
  const [selectedPatron, setSelectedPatron] = useState(null);

  // Tutos
  const [tutos, setTutos] = useState([]);
  const [showAddTuto, setShowAddTuto] = useState(false);
  const [selectedTuto, setSelectedTuto] = useState(null);
  const [tutoTitle, setTutoTitle] = useState('');
  const [tutoContent, setTutoContent] = useState('');

  // Chronomètre
  const [elapsed, setElapsed] = useState(0);       // secondes accumulées cette session
  const [savedTime, setSavedTime] = useState(0);   // temps déjà en base
  const [running, setRunning] = useState(false);
  const intervalRef = useRef(null);

  useFocusEffect(
    useCallback(() => {
      loadData();
      return () => {
        // Sauvegarde auto si le chrono tourne quand on quitte
        if (running) stopAndSave(elapsed);
      };
    }, [partId])
  );

  useEffect(() => {
    navigation.setOptions({ title: partName });
  }, [partName]);

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => setElapsed((e) => e + 1), 1000);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [running]);

  const loadData = async () => {
    const [mats, photos, pats, tuts] = await Promise.all([
      getMaterialsByPart(partId),
      getGalleryByPart(partId),
      getPatronsByPart(partId),
      getTutosByPart(partId),
    ]);
    setMaterials(mats);
    setPhotoCount(photos.length);
    setPatrons(pats);
    setTutos(tuts);
    const cost = mats.reduce((acc, m) => acc + (m.price || 0), 0);
    setTotalCost(cost);
  };

  const stopAndSave = async (extra) => {
    if (extra === 0) return;
    const total = savedTime + extra;
    await updatePart(partId, { time_spent: total });
    setSavedTime(total);
    setElapsed(0);
    setRunning(false);
  };

  const handleTimerToggle = () => setRunning((r) => !r);

  const handleTimerReset = () => {
    Alert.alert('Réinitialiser ?', 'La session en cours sera perdue (le temps déjà sauvegardé reste intact).', [
      { text: 'Annuler', style: 'cancel' },
      { text: 'Réinitialiser', style: 'destructive', onPress: () => { setRunning(false); setElapsed(0); } },
    ]);
  };

  const handleSaveTime = async () => {
    if (elapsed === 0) return;
    await stopAndSave(elapsed);
    Alert.alert('Temps sauvegardé', `+${formatTimer(elapsed)} ajouté au compteur de cette pièce.`);
  };

  const handleAddMaterial = async () => {
    if (!matName.trim()) return;
    setSaving(true);
    await createMaterial({
      part_id: partId,
      name: matName.trim(),
      price: matPrice ? parseFloat(matPrice) : 0,
      store_link: matLink.trim() || null,
    });
    setMatName(''); setMatPrice(''); setMatLink('');
    setShowAddMaterial(false);
    setSaving(false);
    loadData();
  };

  const handleToggleBought = async (mat) => {
    await updateMaterial(mat.id, { is_bought: mat.is_bought ? 0 : 1 });
    loadData();
  };

  const handleDeleteMaterial = (mat) => {
    Alert.alert('Supprimer ?', `Supprimer "${mat.name}" ?`, [
      { text: 'Annuler', style: 'cancel' },
      { text: 'Supprimer', style: 'destructive', onPress: async () => { await deleteMaterial(mat.id); loadData(); } },
    ]);
  };

  // ── Patrons ──────────────────────────────────────────────
  const handleAddPatron = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') { Alert.alert('Permission requise', "Autorise l'accès à ta galerie."); return; }
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.85 });
    if (!result.canceled) {
      await addPatron({ part_id: partId, uri: result.assets[0].uri });
      loadData();
    }
  };

  const handleDeletePatron = (patron) => {
    Alert.alert('Supprimer ?', 'Ce patron sera supprimé définitivement.', [
      { text: 'Annuler', style: 'cancel' },
      { text: 'Supprimer', style: 'destructive', onPress: async () => { await deletePatron(patron.id); setSelectedPatron(null); loadData(); } },
    ]);
  };

  // ── Tutos ────────────────────────────────────────────────
  const handleSaveTuto = async () => {
    if (!tutoTitle.trim()) return;
    await addTuto({ part_id: partId, title: tutoTitle.trim(), content: tutoContent.trim() || null });
    setTutoTitle(''); setTutoContent(''); setShowAddTuto(false);
    loadData();
  };

  const handleDeleteTuto = (tuto) => {
    Alert.alert('Supprimer ?', `Supprimer "${tuto.title}" ?`, [
      { text: 'Annuler', style: 'cancel' },
      { text: 'Supprimer', style: 'destructive', onPress: async () => { await deleteTuto(tuto.id); loadData(); } },
    ]);
  };

  const boughtCount = materials.filter((m) => m.is_bought).length;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>

        {/* ─── Bouton Galerie ─────────────────────────────────── */}
        <TouchableOpacity
          style={styles.galleryBtn}
          onPress={() => navigation.navigate('Gallery', { partId, projectId, projectName: partName })}
        >
          <Images size={18} color={COLORS.teal} />
          <Text style={styles.galleryBtnText}>Galerie de progression</Text>
          {photoCount > 0 && (
            <View style={styles.galleryBadge}>
              <Text style={styles.galleryBadgeText}>{photoCount}</Text>
            </View>
          )}
        </TouchableOpacity>

        {/* ─── Chronomètre ───────────────────────────────────── */}
        <View style={styles.timerCard}>
          <Text style={styles.timerLabel}>Temps de travail</Text>
          <Text style={[styles.timerDisplay, running && styles.timerRunning]}>
            {formatTimer(elapsed)}
          </Text>
          {savedTime > 0 && (
            <Text style={styles.timerSaved}>Total sauvegardé : {formatTimer(savedTime)}</Text>
          )}
          <View style={styles.timerActions}>
            <TouchableOpacity style={styles.timerBtn} onPress={handleTimerReset}>
              <RotateCcw size={18} color={COLORS.textSecondary} />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.timerPlayBtn, running && styles.timerPlayBtnActive]}
              onPress={handleTimerToggle}
            >
              {running
                ? <Pause size={24} color="#F8FAFC" />
                : <Play size={24} color="#F8FAFC" />}
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.timerBtn, elapsed === 0 && styles.btnDisabled]}
              onPress={handleSaveTime}
              disabled={elapsed === 0}
            >
              <Text style={[styles.timerSaveText, elapsed === 0 && { color: COLORS.border }]}>Sauver</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* ─── Matériaux ─────────────────────────────────────── */}
        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionTitle}>Matériaux</Text>
            <Text style={styles.sectionSub}>
              {boughtCount}/{materials.length} achetés · {totalCost.toFixed(2)} €
            </Text>
          </View>
          <TouchableOpacity style={styles.addBtn} onPress={() => setShowAddMaterial(true)}>
            <Plus size={16} color={COLORS.accent} />
            <Text style={styles.addBtnText}>Ajouter</Text>
          </TouchableOpacity>
        </View>

        {materials.length === 0 ? (
          <View style={styles.emptyBox}>
            <ShoppingBag size={32} color={COLORS.border} />
            <Text style={styles.emptyText}>Aucun matériau pour l'instant.</Text>
            <TouchableOpacity onPress={() => setShowAddMaterial(true)}>
              <Text style={styles.emptyAction}>+ Ajouter un matériau</Text>
            </TouchableOpacity>
          </View>
        ) : (
          materials.map((mat) => (
            <MaterialRow
              key={mat.id}
              material={mat}
              onToggle={() => handleToggleBought(mat)}
              onDelete={() => handleDeleteMaterial(mat)}
            />
          ))
        )}

        {/* ─── Patrons ────────────────────────────────────── */}
        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionTitle}>Patrons</Text>
            <Text style={styles.sectionSub}>{patrons.length} fichier{patrons.length !== 1 ? 's' : ''}</Text>
          </View>
          <TouchableOpacity style={styles.addBtn} onPress={handleAddPatron}>
            <Plus size={16} color={COLORS.accent} />
            <Text style={styles.addBtnText}>Ajouter</Text>
          </TouchableOpacity>
        </View>

        {patrons.length === 0 ? (
          <View style={styles.emptyBox}>
            <Scissors size={32} color={COLORS.border} />
            <Text style={styles.emptyText}>Aucun patron pour l'instant.</Text>
            <TouchableOpacity onPress={handleAddPatron}>
              <Text style={styles.emptyAction}>+ Ajouter un patron</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.patronsScroll} contentContainerStyle={styles.patronsRow}>
            {patrons.map((p) => (
              <TouchableOpacity key={p.id} onPress={() => setSelectedPatron(p)} style={styles.patronThumbWrap}>
                <Image source={{ uri: p.uri }} style={styles.patronThumb} />
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}

        {/* ─── Tutos ──────────────────────────────────────── */}
        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionTitle}>Tutoriels</Text>
            <Text style={styles.sectionSub}>{tutos.length} note{tutos.length !== 1 ? 's' : ''}</Text>
          </View>
          <TouchableOpacity style={styles.addBtn} onPress={() => setShowAddTuto(true)}>
            <Plus size={16} color={COLORS.accent} />
            <Text style={styles.addBtnText}>Ajouter</Text>
          </TouchableOpacity>
        </View>

        {tutos.length === 0 ? (
          <View style={styles.emptyBox}>
            <BookOpen size={32} color={COLORS.border} />
            <Text style={styles.emptyText}>Aucun tutoriel pour l'instant.</Text>
            <TouchableOpacity onPress={() => setShowAddTuto(true)}>
              <Text style={styles.emptyAction}>+ Ajouter un tutoriel</Text>
            </TouchableOpacity>
          </View>
        ) : (
          tutos.map((t) => (
            <TouchableOpacity key={t.id} style={styles.tutoCard} onPress={() => setSelectedTuto(t)}>
              <View style={styles.tutoCardContent}>
                <Text style={styles.tutoTitle} numberOfLines={1}>{t.title}</Text>
                {t.content ? <Text style={styles.tutoPreview} numberOfLines={2}>{t.content}</Text> : null}
              </View>
              <TouchableOpacity onPress={() => handleDeleteTuto(t)} style={styles.tutoDelete}>
                <Trash2 size={15} color={COLORS.border} />
              </TouchableOpacity>
            </TouchableOpacity>
          ))
        )}

      </ScrollView>

      {/* Modal ajout matériau */}
      <GlassOverlay visible={showAddMaterial} onClose={() => { setShowAddMaterial(false); setMatName(''); setMatPrice(''); setMatLink(''); }}>
        <View style={styles.modalBox}>
          <Text style={styles.modalTitle}>Nouveau matériau</Text>

          <Text style={styles.fieldLabel}>Nom *</Text>
          <TextInput
            style={styles.modalInput}
            value={matName}
            onChangeText={setMatName}
            placeholder="Ex: Tissu EVA, Peinture acrylique..."
            placeholderTextColor={COLORS.border}
            autoFocus
          />
          <Text style={styles.fieldLabel}>Prix (€)</Text>
          <TextInput
            style={styles.modalInput}
            value={matPrice}
            onChangeText={setMatPrice}
            placeholder="Ex: 12.50"
            placeholderTextColor={COLORS.border}
            keyboardType="numeric"
          />
          <Text style={styles.fieldLabel}>Lien boutique</Text>
          <TextInput
            style={styles.modalInput}
            value={matLink}
            onChangeText={setMatLink}
            placeholder="https://..."
            placeholderTextColor={COLORS.border}
            autoCapitalize="none"
          />

          <View style={styles.modalActions}>
            <TouchableOpacity style={styles.modalCancel} onPress={() => { setShowAddMaterial(false); setMatName(''); setMatPrice(''); setMatLink(''); }}>
              <Text style={styles.modalCancelText}>Annuler</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalConfirm, (!matName.trim() || saving) && styles.btnDisabled]}
              onPress={handleAddMaterial}
              disabled={!matName.trim() || saving}
            >
              <Text style={styles.modalConfirmText}>{saving ? '...' : 'Ajouter'}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </GlassOverlay>

      {/* Modal ajout tuto */}
      <GlassOverlay visible={showAddTuto} onClose={() => { setShowAddTuto(false); setTutoTitle(''); setTutoContent(''); }}>
        <View style={styles.modalBox}>
          <Text style={styles.modalTitle}>Nouveau tutoriel</Text>
          <Text style={styles.fieldLabel}>Titre *</Text>
          <TextInput
            style={styles.modalInput}
            value={tutoTitle}
            onChangeText={setTutoTitle}
            placeholder="Ex: Découpe du patron, Peinture acrylique..."
            placeholderTextColor={COLORS.border}
            autoFocus
          />
          <Text style={styles.fieldLabel}>Contenu</Text>
          <TextInput
            style={[styles.modalInput, { minHeight: 100, textAlignVertical: 'top' }]}
            value={tutoContent}
            onChangeText={setTutoContent}
            placeholder="Décris les étapes, les astuces, les liens..."
            placeholderTextColor={COLORS.border}
            multiline
          />
          <View style={styles.modalActions}>
            <TouchableOpacity style={styles.modalCancel} onPress={() => { setShowAddTuto(false); setTutoTitle(''); setTutoContent(''); }}>
              <Text style={styles.modalCancelText}>Annuler</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalConfirm, !tutoTitle.trim() && styles.btnDisabled]}
              onPress={handleSaveTuto}
              disabled={!tutoTitle.trim()}
            >
              <Text style={styles.modalConfirmText}>Enregistrer</Text>
            </TouchableOpacity>
          </View>
        </View>
      </GlassOverlay>

      {/* Lightbox patron */}
      <Modal visible={!!selectedPatron} transparent animationType="fade">
        <View style={styles.lightbox}>
          <TouchableOpacity style={styles.lightboxClose} onPress={() => setSelectedPatron(null)}>
            <X size={22} color="#F8FAFC" />
          </TouchableOpacity>
          {selectedPatron && (
            <>
              <Image source={{ uri: selectedPatron.uri }} style={styles.lightboxImage} resizeMode="contain" />
              <TouchableOpacity style={styles.lightboxDelete} onPress={() => handleDeletePatron(selectedPatron)}>
                <Trash2 size={18} color={COLORS.error} />
                <Text style={styles.lightboxDeleteText}>Supprimer</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </Modal>

      {/* Modal lecture tuto */}
      <GlassOverlay visible={!!selectedTuto} onClose={() => setSelectedTuto(null)} position="bottom" animationType="slide">
        <View style={styles.tutoModalBox}>
          <View style={styles.tutoModalHeader}>
            <Text style={styles.tutoModalTitle} numberOfLines={2}>{selectedTuto?.title}</Text>
            <TouchableOpacity onPress={() => setSelectedTuto(null)}>
              <X size={20} color={COLORS.textSecondary} />
            </TouchableOpacity>
          </View>
          <ScrollView>
            <Text style={styles.tutoModalContent}>{selectedTuto?.content ?? 'Pas de contenu.'}</Text>
          </ScrollView>
        </View>
      </GlassOverlay>

    </SafeAreaView>
  );
}

function MaterialRow({ material, onToggle, onDelete }) {
  const bought = !!material.is_bought;
  return (
    <View style={[styles.matRow, bought && styles.matRowBought]}>
      <TouchableOpacity style={[styles.matCheck, bought && styles.matCheckBought]} onPress={onToggle}>
        {bought && <Text style={styles.matCheckMark}>✓</Text>}
      </TouchableOpacity>
      <View style={styles.matInfo}>
        <Text style={[styles.matName, bought && styles.matNameBought]}>{material.name}</Text>
        {material.price > 0 && (
          <Text style={styles.matPrice}>{material.price.toFixed(2)} €</Text>
        )}
      </View>
      {material.store_link ? (
        <ExternalLink size={15} color={COLORS.teal} style={{ marginRight: 6 }} />
      ) : null}
      <TouchableOpacity onPress={onDelete}>
        <Trash2 size={15} color={COLORS.border} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  scroll: { padding: 16, paddingBottom: 40 },

  // Galerie
  galleryBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: COLORS.surface, borderRadius: 12,
    borderWidth: 1, borderColor: COLORS.teal + '55',
    padding: 14, marginBottom: 16,
  },
  galleryBtnText: { flex: 1, fontSize: 14, color: COLORS.teal, fontWeight: '600' },
  galleryBadge: {
    backgroundColor: COLORS.teal, borderRadius: 999,
    paddingHorizontal: 8, paddingVertical: 2,
  },
  galleryBadgeText: { fontSize: 12, color: '#0F172A', fontWeight: '700' },

  // Chronomètre
  timerCard: {
    backgroundColor: COLORS.surface, borderRadius: 16, borderWidth: 1,
    borderColor: COLORS.border, padding: 20, alignItems: 'center', marginBottom: 24,
  },
  timerLabel: { fontSize: 12, color: COLORS.textSecondary, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 12 },
  timerDisplay: { fontSize: 48, fontWeight: '200', color: COLORS.textPrimary, letterSpacing: 2, fontVariant: ['tabular-nums'] },
  timerRunning: { color: COLORS.accent },
  timerSaved: { fontSize: 12, color: COLORS.textSecondary, marginTop: 4, marginBottom: 8 },
  timerActions: { flexDirection: 'row', alignItems: 'center', gap: 20, marginTop: 16 },
  timerBtn: { padding: 8 },
  timerPlayBtn: {
    width: 60, height: 60, borderRadius: 999,
    backgroundColor: COLORS.accent, alignItems: 'center', justifyContent: 'center',
    shadowColor: COLORS.accent, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5, shadowRadius: 10, elevation: 6,
  },
  timerPlayBtnActive: { backgroundColor: '#7C3AED' },
  timerSaveText: { fontSize: 14, color: COLORS.teal, fontWeight: '600' },

  // Section matériaux
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 12 },
  sectionTitle: { fontSize: 17, fontWeight: '700', color: COLORS.textPrimary },
  sectionSub: { fontSize: 12, color: COLORS.textSecondary, marginTop: 2 },
  addBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  addBtnText: { fontSize: 14, color: COLORS.accent, fontWeight: '600' },

  emptyBox: { alignItems: 'center', paddingVertical: 32, gap: 8 },
  emptyText: { fontSize: 14, color: COLORS.textSecondary },
  emptyAction: { fontSize: 14, color: COLORS.accent, fontWeight: '600' },

  // Ligne matériau
  matRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: COLORS.surface, borderRadius: 12,
    borderWidth: 1, borderColor: COLORS.border,
    padding: 12, marginBottom: 8, gap: 10,
  },
  matRowBought: { opacity: 0.6 },
  matCheck: {
    width: 22, height: 22, borderRadius: 6,
    borderWidth: 2, borderColor: COLORS.border,
    alignItems: 'center', justifyContent: 'center',
  },
  matCheckBought: { backgroundColor: COLORS.teal, borderColor: COLORS.teal },
  matCheckMark: { fontSize: 12, color: '#0F172A', fontWeight: '700' },
  matInfo: { flex: 1 },
  matName: { fontSize: 14, color: COLORS.textPrimary, fontWeight: '500' },
  matNameBought: { textDecorationLine: 'line-through', color: COLORS.textSecondary },
  matPrice: { fontSize: 12, color: COLORS.accent, marginTop: 2, fontWeight: '600' },

  // Modal
  modalBox: {
    width: '88%', backgroundColor: COLORS.surface,
    borderRadius: 16, padding: 20, borderWidth: 1, borderColor: COLORS.border,
  },
  modalTitle: { fontSize: 18, fontWeight: '700', color: COLORS.textPrimary, marginBottom: 16 },
  fieldLabel: { fontSize: 12, color: COLORS.textSecondary, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 },
  modalInput: {
    backgroundColor: COLORS.bg, borderWidth: 1, borderColor: COLORS.border,
    borderRadius: 10, color: COLORS.textPrimary, fontSize: 15,
    paddingHorizontal: 14, paddingVertical: 10, marginBottom: 12,
  },
  modalActions: { flexDirection: 'row', gap: 10, marginTop: 4 },
  modalCancel: { flex: 1, alignItems: 'center', paddingVertical: 12 },
  modalCancelText: { fontSize: 15, color: COLORS.textSecondary },
  modalConfirm: { flex: 1, backgroundColor: COLORS.accent, borderRadius: 10, alignItems: 'center', paddingVertical: 12 },
  modalConfirmText: { fontSize: 15, fontWeight: '700', color: '#F8FAFC' },
  btnDisabled: { opacity: 0.4 },

  // Patrons
  patronsScroll: { marginBottom: 16 },
  patronsRow: { gap: 10, paddingVertical: 4 },
  patronThumbWrap: {
    borderRadius: 10, overflow: 'hidden',
    borderWidth: 1, borderColor: COLORS.border,
  },
  patronThumb: { width: 110, height: 110 },

  // Tutos
  tutoCard: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: COLORS.surface, borderRadius: 12,
    borderWidth: 1, borderColor: COLORS.border,
    padding: 14, marginBottom: 8, gap: 10,
  },
  tutoCardContent: { flex: 1 },
  tutoTitle: { fontSize: 14, fontWeight: '700', color: COLORS.textPrimary },
  tutoPreview: { fontSize: 12, color: COLORS.textSecondary, marginTop: 4 },
  tutoDelete: { padding: 4 },

  // Lightbox patron
  lightbox: { flex: 1, backgroundColor: 'rgba(0,0,0,0.95)', justifyContent: 'center', alignItems: 'center' },
  lightboxClose: { position: 'absolute', top: 50, right: 20, padding: 8, zIndex: 10 },
  lightboxImage: { width: '100%', height: '75%' },
  lightboxDelete: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 20 },
  lightboxDeleteText: { fontSize: 14, color: COLORS.error, fontWeight: '600' },

  // Modal lecture tuto
  tutoModalBox: {
    backgroundColor: COLORS.surface, borderTopLeftRadius: 20, borderTopRightRadius: 20,
    padding: 20, maxHeight: '80%', borderTopWidth: 1, borderColor: COLORS.border,
  },
  tutoModalHeader: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16, gap: 12 },
  tutoModalTitle: { flex: 1, fontSize: 18, fontWeight: '700', color: COLORS.textPrimary },
  tutoModalContent: { fontSize: 15, color: COLORS.textSecondary, lineHeight: 24, paddingBottom: 40 },
});
