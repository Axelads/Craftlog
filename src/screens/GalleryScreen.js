import React, { useState, useCallback, useEffect } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, FlatList,
  Image, TouchableOpacity, Modal, TextInput, Dimensions, Alert,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import { Camera, ImageIcon, X, Trash2 } from 'lucide-react-native';
import { getGalleryByProject, addPhoto, deletePhoto } from '../database/galleryDao';
import { getPartsByProject } from '../database/partsDao';

const { width } = Dimensions.get('window');
const THUMB = (width - 16 * 2 - 8 * 2) / 3;

const COLORS = {
  bg: '#0F172A', surface: '#1E293B', textPrimary: '#F8FAFC',
  textSecondary: '#94A3B8', accent: '#A855F7', teal: '#2DD4BF',
  border: '#334155', error: '#F87171',
};

export default function GalleryScreen({ route, navigation }) {
  const { projectId, projectName } = route.params ?? {};
  const [photos, setPhotos] = useState([]);
  const [parts, setParts] = useState([]);
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedPartId, setSelectedPartId] = useState(null);
  const [note, setNote] = useState('');
  const [pendingUri, setPendingUri] = useState(null);
  const [saving, setSaving] = useState(false);

  useFocusEffect(
    useCallback(() => {
      if (projectId) loadData();
    }, [projectId])
  );

  useEffect(() => {
    navigation.setOptions({ title: projectName ?? 'Galerie' });
  }, [projectName]);

  const loadData = async () => {
    const [imgs, pts] = await Promise.all([
      getGalleryByProject(projectId),
      getPartsByProject(projectId),
    ]);
    setPhotos(imgs);
    setParts(pts);
    if (pts.length > 0 && !selectedPartId) setSelectedPartId(pts[0].id);
  };

  const pickFromLibrary = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') { Alert.alert('Permission requise', "Autorise l'accès à ta galerie."); return; }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'], quality: 0.85,
    });
    if (!result.canceled) { setPendingUri(result.assets[0].uri); setShowAddModal(true); }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') { Alert.alert('Permission requise', "Autorise l'accès à la caméra."); return; }
    const result = await ImagePicker.launchCameraAsync({ quality: 0.85 });
    if (!result.canceled) { setPendingUri(result.assets[0].uri); setShowAddModal(true); }
  };

  const handleSavePhoto = async () => {
    if (!pendingUri || !selectedPartId) return;
    setSaving(true);
    await addPhoto({ part_id: selectedPartId, image_uri: pendingUri, note: note.trim() || null });
    setPendingUri(null); setNote(''); setShowAddModal(false); setSaving(false);
    loadData();
  };

  const handleDeletePhoto = (photo) => {
    Alert.alert('Supprimer ?', 'Cette photo sera supprimée définitivement.', [
      { text: 'Annuler', style: 'cancel' },
      { text: 'Supprimer', style: 'destructive', onPress: async () => { await deletePhoto(photo.id); setSelectedPhoto(null); loadData(); } },
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>

      {/* Header actions */}
      <View style={styles.topBar}>
        <Text style={styles.count}>{photos.length} photo{photos.length !== 1 ? 's' : ''}</Text>
        <View style={styles.topActions}>
          <TouchableOpacity style={styles.topBtn} onPress={takePhoto}>
            <Camera size={20} color={COLORS.accent} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.topBtn} onPress={pickFromLibrary}>
            <ImageIcon size={20} color={COLORS.accent} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Grille */}
      {photos.length === 0 ? (
        <View style={styles.empty}>
          <ImageIcon size={48} color={COLORS.border} />
          <Text style={styles.emptyTitle}>Pas encore de photos</Text>
          <Text style={styles.emptyText}>Capture ta progression avec l'appareil ou la galerie.</Text>
          <TouchableOpacity style={styles.emptyBtn} onPress={pickFromLibrary}>
            <Text style={styles.emptyBtnText}>Ajouter une photo</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={photos}
          keyExtractor={(item) => item.id.toString()}
          numColumns={3}
          contentContainerStyle={styles.grid}
          columnWrapperStyle={styles.row}
          renderItem={({ item }) => (
            <TouchableOpacity onPress={() => setSelectedPhoto(item)}>
              <Image source={{ uri: item.image_uri }} style={styles.thumb} />
              {item.note ? <View style={styles.noteIndicator} /> : null}
            </TouchableOpacity>
          )}
        />
      )}

      {/* Modal ajout photo */}
      <Modal visible={showAddModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Ajouter la photo</Text>

            {pendingUri && (
              <Image source={{ uri: pendingUri }} style={styles.pendingPreview} />
            )}

            {/* Sélection de la pièce */}
            <Text style={styles.fieldLabel}>Pièce associée</Text>
            <View style={styles.partsList}>
              {parts.map((p) => (
                <TouchableOpacity
                  key={p.id}
                  style={[styles.partChip, selectedPartId === p.id && styles.partChipActive]}
                  onPress={() => setSelectedPartId(p.id)}
                >
                  <Text style={[styles.partChipText, selectedPartId === p.id && styles.partChipTextActive]}>
                    {p.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.fieldLabel}>Note (optionnel)</Text>
            <TextInput
              style={styles.noteInput}
              value={note}
              onChangeText={setNote}
              placeholder="Ex: Première couche de peinture..."
              placeholderTextColor={COLORS.border}
              multiline
            />

            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.modalCancel} onPress={() => { setShowAddModal(false); setPendingUri(null); setNote(''); }}>
                <Text style={styles.modalCancelText}>Annuler</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalConfirm, saving && styles.btnDisabled]}
                onPress={handleSavePhoto}
                disabled={saving}
              >
                <Text style={styles.modalConfirmText}>{saving ? '...' : 'Enregistrer'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Lightbox */}
      <Modal visible={!!selectedPhoto} transparent animationType="fade">
        <View style={styles.lightbox}>
          <TouchableOpacity style={styles.lightboxClose} onPress={() => setSelectedPhoto(null)}>
            <X size={22} color="#F8FAFC" />
          </TouchableOpacity>
          {selectedPhoto && (
            <>
              <Image
                source={{ uri: selectedPhoto.image_uri }}
                style={styles.lightboxImage}
                resizeMode="contain"
              />
              {selectedPhoto.note ? (
                <View style={styles.lightboxNote}>
                  <Text style={styles.lightboxNoteText}>{selectedPhoto.note}</Text>
                </View>
              ) : null}
              <Text style={styles.lightboxDate}>{selectedPhoto.date?.split('T')[0]}</Text>
              <TouchableOpacity style={styles.lightboxDelete} onPress={() => handleDeletePhoto(selectedPhoto)}>
                <Trash2 size={18} color={COLORS.error} />
                <Text style={styles.lightboxDeleteText}>Supprimer</Text>
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
  topBar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 12,
  },
  count: { fontSize: 14, color: COLORS.textSecondary, fontWeight: '500' },
  topActions: { flexDirection: 'row', gap: 8 },
  topBtn: {
    backgroundColor: COLORS.surface, borderRadius: 10,
    borderWidth: 1, borderColor: COLORS.border, padding: 8,
  },
  grid: { paddingHorizontal: 16, paddingBottom: 40 },
  row: { gap: 8, marginBottom: 8 },
  thumb: { width: THUMB, height: THUMB, borderRadius: 8, backgroundColor: COLORS.surface },
  noteIndicator: {
    position: 'absolute', bottom: 5, right: 5,
    width: 8, height: 8, borderRadius: 999, backgroundColor: COLORS.accent,
  },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, padding: 32 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: COLORS.textPrimary },
  emptyText: { fontSize: 14, color: COLORS.textSecondary, textAlign: 'center' },
  emptyBtn: {
    marginTop: 8, backgroundColor: COLORS.accent, borderRadius: 12,
    paddingHorizontal: 20, paddingVertical: 12,
  },
  emptyBtnText: { fontSize: 14, fontWeight: '700', color: '#F8FAFC' },

  // Modal ajout
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'flex-end' },
  modalBox: {
    backgroundColor: COLORS.surface, borderTopLeftRadius: 20, borderTopRightRadius: 20,
    padding: 20, borderTopWidth: 1, borderColor: COLORS.border,
  },
  modalTitle: { fontSize: 18, fontWeight: '700', color: COLORS.textPrimary, marginBottom: 14 },
  pendingPreview: { width: '100%', height: 160, borderRadius: 12, marginBottom: 14, resizeMode: 'cover' },
  fieldLabel: { fontSize: 12, color: COLORS.textSecondary, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 },
  partsList: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 14 },
  partChip: {
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999,
    backgroundColor: COLORS.bg, borderWidth: 1, borderColor: COLORS.border,
  },
  partChipActive: { backgroundColor: COLORS.accent, borderColor: COLORS.accent },
  partChipText: { fontSize: 13, color: COLORS.textSecondary },
  partChipTextActive: { color: '#F8FAFC', fontWeight: '600' },
  noteInput: {
    backgroundColor: COLORS.bg, borderWidth: 1, borderColor: COLORS.border,
    borderRadius: 10, color: COLORS.textPrimary, fontSize: 14,
    paddingHorizontal: 12, paddingVertical: 10, marginBottom: 16, minHeight: 70,
  },
  modalActions: { flexDirection: 'row', gap: 10 },
  modalCancel: { flex: 1, alignItems: 'center', paddingVertical: 12 },
  modalCancelText: { fontSize: 15, color: COLORS.textSecondary },
  modalConfirm: { flex: 1, backgroundColor: COLORS.accent, borderRadius: 10, alignItems: 'center', paddingVertical: 12 },
  modalConfirmText: { fontSize: 15, fontWeight: '700', color: '#F8FAFC' },
  btnDisabled: { opacity: 0.4 },

  // Lightbox
  lightbox: { flex: 1, backgroundColor: 'rgba(0,0,0,0.95)', justifyContent: 'center', alignItems: 'center' },
  lightboxClose: { position: 'absolute', top: 50, right: 20, padding: 8, zIndex: 10 },
  lightboxImage: { width: '100%', height: '70%' },
  lightboxNote: {
    position: 'absolute', bottom: 120, left: 20, right: 20,
    backgroundColor: 'rgba(30,41,59,0.9)', borderRadius: 12, padding: 12,
    borderWidth: 1, borderColor: COLORS.border,
  },
  lightboxNoteText: { fontSize: 14, color: COLORS.textPrimary },
  lightboxDate: { fontSize: 12, color: COLORS.textSecondary, marginTop: 12 },
  lightboxDelete: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 16 },
  lightboxDeleteText: { fontSize: 14, color: COLORS.error, fontWeight: '600' },
});
