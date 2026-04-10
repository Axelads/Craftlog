import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, TouchableOpacity,
  Image, Modal, ScrollView, Alert, Dimensions,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import { Plus, Trash2, Palette, X, ImageIcon } from 'lucide-react-native';
import {
  getReferenceImages, addReferenceImage, deleteReferenceImage,
  getReferenceBoardSettings, upsertReferenceBoardSettings,
} from '../database/referenceBoardDao';

const { width: SCREEN_W } = Dimensions.get('window');
const CANVAS_W = SCREEN_W;
const CANVAS_H = SCREEN_W * 1.4;

const COLORS = {
  bg: '#0F172A', surface: '#1E293B', textPrimary: '#F8FAFC',
  textSecondary: '#94A3B8', accent: '#A855F7', teal: '#2DD4BF',
  border: '#334155', error: '#F87171',
};

// Fond prédéfinis
const BG_PRESETS = [
  '#1A1A2E', '#0F172A', '#16213E', '#1E293B',
  '#0D1117', '#1C1C1C', '#2D2D2D', '#F8FAFC',
  '#FFF5E4', '#E8F4FD', '#1B1B2F', '#162447',
];

// Config de chaque label : position (x,y en % canvas) et taille (% de CANVAS_W)
// x, y = coin haut-gauche de l'image en fraction du canvas
export const LABEL_CONFIG = {
  corps_complet: { label: 'Corps complet',  x: 0.01, y: 0.01, size: 0.50, order: 0 },
  tete:          { label: 'Tête',           x: 0.53, y: 0.01, size: 0.28, order: 1 },
  casque:        { label: 'Casque',         x: 0.53, y: 0.01, size: 0.28, order: 1 },
  visage:        { label: 'Visage',         x: 0.53, y: 0.01, size: 0.28, order: 1 },
  yeux:          { label: 'Yeux',           x: 0.74, y: 0.34, size: 0.15, order: 2 },
  torse:         { label: 'Torse / Buste',  x: 0.53, y: 0.35, size: 0.26, order: 3 },
  dos:           { label: 'Dos',            x: 0.53, y: 0.35, size: 0.26, order: 3 },
  bras_droit:    { label: 'Bras droit',     x: 0.53, y: 0.59, size: 0.20, order: 4 },
  bras_gauche:   { label: 'Bras gauche',    x: 0.75, y: 0.59, size: 0.20, order: 4 },
  main_droite:   { label: 'Main droite',    x: 0.54, y: 0.79, size: 0.14, order: 5 },
  main_gauche:   { label: 'Main gauche',    x: 0.71, y: 0.79, size: 0.14, order: 5 },
  jambe_droite:  { label: 'Jambe droite',   x: 0.02, y: 0.59, size: 0.22, order: 4 },
  jambe_gauche:  { label: 'Jambe gauche',   x: 0.24, y: 0.59, size: 0.22, order: 4 },
  pied:          { label: 'Pied / Chaussure', x: 0.02, y: 0.80, size: 0.14, order: 5 },
  accessoire:    { label: 'Accessoire',     x: 0.36, y: 0.77, size: 0.16, order: 5 },
  autre:         { label: 'Autre',          x: 0.36, y: 0.59, size: 0.16, order: 4 },
};

export default function ReferenceBoardScreen({ route, navigation }) {
  const { projectId, projectName } = route.params ?? {};

  const [images, setImages] = useState([]);
  const [bgColor, setBgColor] = useState('#1A1A2E');
  const [bgImageUri, setBgImageUri] = useState(null);
  const [showLabelModal, setShowLabelModal] = useState(false);
  const [showBgModal, setShowBgModal] = useState(false);
  const [pendingLabel, setPendingLabel] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);

  useFocusEffect(
    useCallback(() => {
      loadBoard();
    }, [projectId])
  );

  const loadBoard = async () => {
    const [imgs, settings] = await Promise.all([
      getReferenceImages(projectId),
      getReferenceBoardSettings(projectId),
    ]);
    setImages(imgs);
    if (settings) {
      setBgColor(settings.bg_color ?? '#1A1A2E');
      setBgImageUri(settings.bg_image_uri ?? null);
    }
  };

  // ── Ajouter une image ──────────────────────────────────────
  const handleSelectLabel = (labelKey) => {
    setPendingLabel(labelKey);
    setShowLabelModal(false);
    setTimeout(() => pickImageForLabel(labelKey), 300);
  };

  const pickImageForLabel = async (labelKey) => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') { Alert.alert('Permission requise', "Autorise l'accès à ta galerie."); return; }
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.85 });
    if (!result.canceled) {
      await addReferenceImage({ project_id: projectId, uri: result.assets[0].uri, label: labelKey });
      loadBoard();
    }
  };

  // ── Supprimer une image ────────────────────────────────────
  const handleDeleteImage = (img) => {
    Alert.alert('Supprimer ?', `Supprimer la référence "${LABEL_CONFIG[img.label]?.label}" ?`, [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Supprimer', style: 'destructive',
        onPress: async () => { await deleteReferenceImage(img.id); setSelectedImage(null); loadBoard(); },
      },
    ]);
  };

  // ── Fond ───────────────────────────────────────────────────
  const handleBgColorSelect = async (color) => {
    setBgColor(color);
    setBgImageUri(null);
    await upsertReferenceBoardSettings(projectId, { bg_color: color, bg_image_uri: null });
    setShowBgModal(false);
  };

  const handleBgImagePick = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') return;
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.8 });
    if (!result.canceled) {
      const uri = result.assets[0].uri;
      setBgImageUri(uri);
      await upsertReferenceBoardSettings(projectId, { bg_color: bgColor, bg_image_uri: uri });
      setShowBgModal(false);
    }
  };

  // ── Rendu canvas ───────────────────────────────────────────
  const renderCanvasImages = () => {
    return images.map((img) => {
      const cfg = LABEL_CONFIG[img.label];
      if (!cfg) return null;
      const imgSize = cfg.size * CANVAS_W;
      const posX = cfg.x * CANVAS_W;
      const posY = cfg.y * CANVAS_H;
      return (
        <TouchableOpacity
          key={img.id}
          style={[styles.canvasItem, { left: posX, top: posY, width: imgSize, height: imgSize }]}
          onPress={() => setSelectedImage(img)}
          activeOpacity={0.85}
        >
          <Image source={{ uri: img.uri }} style={styles.canvasImage} resizeMode="cover" />
          <View style={styles.canvasLabel}>
            <Text style={styles.canvasLabelText} numberOfLines={1}>{cfg.label}</Text>
          </View>
        </TouchableOpacity>
      );
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll} bounces={false}>

        {/* Canvas */}
        <View style={[styles.canvas, { height: CANVAS_H }]}>
          {/* Fond */}
          {bgImageUri ? (
            <Image source={{ uri: bgImageUri }} style={StyleSheet.absoluteFillObject} resizeMode="cover" />
          ) : (
            <View style={[StyleSheet.absoluteFillObject, { backgroundColor: bgColor }]} />
          )}

          {/* Images positionnées */}
          {renderCanvasImages()}

          {/* Watermark si vide */}
          {images.length === 0 && (
            <View style={styles.emptyCanvas}>
              <ImageIcon size={48} color="rgba(255,255,255,0.15)" />
              <Text style={styles.emptyCanvasText}>
                Ajoute des références avec le bouton +
              </Text>
            </View>
          )}
        </View>

        {/* Barre de contrôles */}
        <View style={styles.controls}>
          <TouchableOpacity style={styles.controlBtn} onPress={() => setShowBgModal(true)}>
            <Palette size={18} color={COLORS.teal} />
            <Text style={styles.controlBtnText}>Fond</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.controlBtnPrimary} onPress={() => setShowLabelModal(true)}>
            <Plus size={18} color="#F8FAFC" />
            <Text style={styles.controlBtnPrimaryText}>Ajouter une référence</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>

      {/* Modal sélection label */}
      <Modal visible={showLabelModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Quelle partie ?</Text>
              <TouchableOpacity onPress={() => setShowLabelModal(false)}>
                <X size={20} color={COLORS.textSecondary} />
              </TouchableOpacity>
            </View>
            <ScrollView>
              <View style={styles.labelsGrid}>
                {Object.entries(LABEL_CONFIG).map(([key, cfg]) => (
                  <TouchableOpacity
                    key={key}
                    style={styles.labelChip}
                    onPress={() => handleSelectLabel(key)}
                  >
                    <Text style={styles.labelChipText}>{cfg.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Modal sélection fond */}
      <Modal visible={showBgModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Choisir le fond</Text>
              <TouchableOpacity onPress={() => setShowBgModal(false)}>
                <X size={20} color={COLORS.textSecondary} />
              </TouchableOpacity>
            </View>
            <Text style={styles.bgSectionLabel}>Couleurs</Text>
            <View style={styles.bgColorsGrid}>
              {BG_PRESETS.map((color) => (
                <TouchableOpacity
                  key={color}
                  style={[styles.bgColorChip, { backgroundColor: color }, bgColor === color && !bgImageUri && styles.bgColorChipActive]}
                  onPress={() => handleBgColorSelect(color)}
                />
              ))}
            </View>
            <Text style={styles.bgSectionLabel}>Image personnalisée</Text>
            <TouchableOpacity style={styles.bgImageBtn} onPress={handleBgImagePick}>
              <ImageIcon size={18} color={COLORS.accent} />
              <Text style={styles.bgImageBtnText}>Choisir depuis la galerie</Text>
            </TouchableOpacity>
            {bgImageUri && (
              <TouchableOpacity
                style={styles.bgRemoveBtn}
                onPress={() => handleBgColorSelect(bgColor)}
              >
                <Text style={styles.bgRemoveBtnText}>Supprimer l'image de fond</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </Modal>

      {/* Lightbox image sélectionnée */}
      <Modal visible={!!selectedImage} transparent animationType="fade">
        <View style={styles.lightbox}>
          <TouchableOpacity style={styles.lightboxClose} onPress={() => setSelectedImage(null)}>
            <X size={22} color="#F8FAFC" />
          </TouchableOpacity>
          {selectedImage && (
            <>
              <Text style={styles.lightboxLabel}>
                {LABEL_CONFIG[selectedImage.label]?.label}
              </Text>
              <Image
                source={{ uri: selectedImage.uri }}
                style={styles.lightboxImage}
                resizeMode="contain"
              />
              <TouchableOpacity style={styles.lightboxDelete} onPress={() => handleDeleteImage(selectedImage)}>
                <Trash2 size={18} color={COLORS.error} />
                <Text style={styles.lightboxDeleteText}>Supprimer cette référence</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </Modal>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  scroll: { paddingBottom: 40 },

  // Canvas
  canvas: {
    width: CANVAS_W,
    position: 'relative',
    overflow: 'hidden',
  },
  canvasItem: {
    position: 'absolute',
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  canvasImage: { width: '100%', height: '80%' },
  canvasLabel: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: 'rgba(0,0,0,0.65)', paddingVertical: 3, paddingHorizontal: 6,
  },
  canvasLabelText: { fontSize: 9, color: '#F8FAFC', fontWeight: '600', textTransform: 'uppercase' },
  emptyCanvas: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, padding: 32 },
  emptyCanvasText: { fontSize: 14, color: 'rgba(255,255,255,0.3)', textAlign: 'center' },

  // Contrôles
  controls: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    paddingHorizontal: 16, paddingVertical: 14,
    borderTopWidth: 1, borderTopColor: COLORS.border,
  },
  controlBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: COLORS.surface, borderRadius: 10,
    borderWidth: 1, borderColor: COLORS.teal + '55',
    paddingHorizontal: 14, paddingVertical: 10,
  },
  controlBtnText: { fontSize: 13, color: COLORS.teal, fontWeight: '600' },
  controlBtnPrimary: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
    backgroundColor: COLORS.accent, borderRadius: 10, paddingVertical: 12,
  },
  controlBtnPrimaryText: { fontSize: 14, color: '#F8FAFC', fontWeight: '700' },

  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
  modalBox: {
    backgroundColor: COLORS.surface, borderTopLeftRadius: 20, borderTopRightRadius: 20,
    padding: 20, maxHeight: '75%', borderTopWidth: 1, borderColor: COLORS.border,
  },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  modalTitle: { fontSize: 18, fontWeight: '700', color: COLORS.textPrimary },

  // Labels
  labelsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, paddingBottom: 30 },
  labelChip: {
    backgroundColor: COLORS.bg, borderWidth: 1, borderColor: COLORS.border,
    borderRadius: 999, paddingHorizontal: 14, paddingVertical: 8,
  },
  labelChipText: { fontSize: 13, color: COLORS.textPrimary, fontWeight: '500' },

  // Fond
  bgSectionLabel: {
    fontSize: 11, color: COLORS.textSecondary, fontWeight: '600',
    textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 10, marginTop: 4,
  },
  bgColorsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 16 },
  bgColorChip: { width: 44, height: 44, borderRadius: 10, borderWidth: 2, borderColor: 'transparent' },
  bgColorChipActive: { borderColor: COLORS.accent },
  bgImageBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: COLORS.bg, borderRadius: 10, borderWidth: 1,
    borderColor: COLORS.accent + '55', padding: 14, marginBottom: 10,
  },
  bgImageBtnText: { fontSize: 14, color: COLORS.accent, fontWeight: '600' },
  bgRemoveBtn: { alignItems: 'center', paddingVertical: 10, marginBottom: 10 },
  bgRemoveBtnText: { fontSize: 13, color: COLORS.error },

  // Lightbox
  lightbox: { flex: 1, backgroundColor: 'rgba(0,0,0,0.95)', justifyContent: 'center', alignItems: 'center' },
  lightboxClose: { position: 'absolute', top: 50, right: 20, padding: 8, zIndex: 10 },
  lightboxLabel: { fontSize: 13, color: COLORS.textSecondary, marginBottom: 12, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 },
  lightboxImage: { width: '90%', height: '65%' },
  lightboxDelete: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 24 },
  lightboxDeleteText: { fontSize: 14, color: COLORS.error, fontWeight: '600' },
});
