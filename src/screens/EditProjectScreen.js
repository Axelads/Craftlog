import React, { useState } from 'react';
import {
  View, Text, TextInput, StyleSheet, SafeAreaView,
  ScrollView, TouchableOpacity, Alert, KeyboardAvoidingView,
  Platform, Image,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as ImagePicker from 'expo-image-picker';
import { Camera, CalendarDays, X } from 'lucide-react-native';
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import { updateProject } from '../database/projectsDao';

const COLORS = {
  bg: '#0F172A', surface: '#1E293B', textPrimary: '#F8FAFC',
  textSecondary: '#94A3B8', accent: '#A855F7', teal: '#2DD4BF',
  border: '#334155', error: '#F87171',
};

export default function EditProjectScreen({ route, navigation }) {
  const { project } = route.params ?? {};

  const [name, setName] = useState(project?.name ?? '');
  const [characterName, setCharacterName] = useState(project?.character_name ?? '');
  const [series, setSeries] = useState(project?.series ?? '');
  const [deadline, setDeadline] = useState(
    project?.deadline ? parseISO(project.deadline) : null
  );
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [budgetLimit, setBudgetLimit] = useState(
    project?.budget_limit > 0 ? String(project.budget_limit) : ''
  );
  const [coverImage, setCoverImage] = useState(project?.cover_image ?? null);
  const [saving, setSaving] = useState(false);

  const pickCoverImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission requise', "Autorise l'accès à ta galerie.");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.8,
    });
    if (!result.canceled) setCoverImage(result.assets[0].uri);
  };

  const onDateChange = (event, selectedDate) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) setDeadline(selectedDate);
  };

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Champ requis', 'Donne un nom à ton projet.');
      return;
    }
    setSaving(true);
    try {
      await updateProject(project.id, {
        name: name.trim(),
        character_name: characterName.trim() || null,
        series: series.trim() || null,
        deadline: deadline ? format(deadline, 'yyyy-MM-dd') : null,
        budget_limit: budgetLimit ? parseFloat(budgetLimit) : 0,
        cover_image: coverImage || null,
      });
      navigation.goBack();
    } catch (e) {
      Alert.alert('Erreur', e.message);
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">

          {/* Cover image picker */}
          <TouchableOpacity style={styles.coverPicker} onPress={pickCoverImage}>
            {coverImage ? (
              <>
                <Image source={{ uri: coverImage }} style={styles.coverPreview} />
                <TouchableOpacity style={styles.coverRemove} onPress={() => setCoverImage(null)}>
                  <X size={14} color="#F8FAFC" />
                </TouchableOpacity>
              </>
            ) : (
              <View style={styles.coverPlaceholder}>
                <Camera size={28} color={COLORS.accent} />
                <Text style={styles.coverHint}>Ajouter une photo de couverture</Text>
              </View>
            )}
          </TouchableOpacity>

          <View style={styles.header}>
            <Text style={styles.title}>Modifier le projet</Text>
            <Text style={styles.subtitle}>Mets à jour les infos de ton costume</Text>
          </View>

          <View style={styles.form}>
            <Field label="Nom du projet *" value={name} onChangeText={setName} placeholder="Ex: Costume Zelda TotK" />
            <Field label="Nom du personnage" value={characterName} onChangeText={setCharacterName} placeholder="Ex: Link" />
            <Field label="Série / Univers" value={series} onChangeText={setSeries} placeholder="Ex: The Legend of Zelda" />

            <View style={styles.fieldWrapper}>
              <Text style={styles.label}>Deadline</Text>
              <TouchableOpacity style={styles.dateBtn} onPress={() => setShowDatePicker(true)}>
                <CalendarDays size={16} color={deadline ? COLORS.textPrimary : COLORS.border} />
                <Text style={[styles.dateBtnText, !deadline && styles.dateBtnPlaceholder]}>
                  {deadline ? format(deadline, 'd MMMM yyyy', { locale: fr }) : 'Choisir une date'}
                </Text>
                {deadline && (
                  <TouchableOpacity onPress={() => setDeadline(null)}>
                    <X size={14} color={COLORS.textSecondary} />
                  </TouchableOpacity>
                )}
              </TouchableOpacity>
            </View>

            {showDatePicker && (
              <DateTimePicker
                value={deadline || new Date()}
                mode="date"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={onDateChange}
                themeVariant="dark"
              />
            )}

            <Field
              label="Budget limite (€)"
              value={budgetLimit}
              onChangeText={setBudgetLimit}
              placeholder="Ex: 150"
              keyboardType="numeric"
            />
          </View>

          <TouchableOpacity
            style={[styles.btnPrimary, saving && styles.btnDisabled]}
            onPress={handleSave}
            disabled={saving}
          >
            <Text style={styles.btnPrimaryText}>{saving ? 'Enregistrement...' : 'Enregistrer les modifications'}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.btnSecondary} onPress={() => navigation.goBack()}>
            <Text style={styles.btnSecondaryText}>Annuler</Text>
          </TouchableOpacity>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function Field({ label, value, onChangeText, placeholder, keyboardType }) {
  const [focused, setFocused] = useState(false);
  return (
    <View style={styles.fieldWrapper}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={[styles.input, focused && styles.inputFocused]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={COLORS.border}
        keyboardType={keyboardType ?? 'default'}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  scroll: { paddingBottom: 40 },
  coverPicker: { width: '100%', height: 180, position: 'relative' },
  coverPreview: { width: '100%', height: 180, resizeMode: 'cover' },
  coverPlaceholder: {
    flex: 1, backgroundColor: '#1A2744',
    alignItems: 'center', justifyContent: 'center', gap: 8,
    borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  coverHint: { fontSize: 13, color: COLORS.accent, fontWeight: '500' },
  coverRemove: {
    position: 'absolute', top: 10, right: 10,
    backgroundColor: 'rgba(0,0,0,0.6)', borderRadius: 999, padding: 6,
  },
  header: { paddingHorizontal: 16, marginTop: 20, marginBottom: 20 },
  title: { fontSize: 26, fontWeight: '700', color: COLORS.textPrimary },
  subtitle: { fontSize: 14, color: COLORS.textSecondary, marginTop: 4 },
  form: { paddingHorizontal: 16, gap: 16, marginBottom: 32 },
  fieldWrapper: { gap: 6 },
  label: { fontSize: 12, fontWeight: '600', color: COLORS.textSecondary, textTransform: 'uppercase', letterSpacing: 0.5 },
  input: {
    backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border,
    borderRadius: 12, color: COLORS.textPrimary, fontSize: 15,
    paddingHorizontal: 14, paddingVertical: 12,
  },
  inputFocused: { borderColor: COLORS.accent },
  dateBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border,
    borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12,
  },
  dateBtnText: { flex: 1, fontSize: 15, color: COLORS.textPrimary },
  dateBtnPlaceholder: { color: COLORS.border },
  btnPrimary: {
    marginHorizontal: 16, backgroundColor: COLORS.accent, borderRadius: 14,
    paddingVertical: 16, alignItems: 'center', marginBottom: 12,
    shadowColor: COLORS.accent, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4, shadowRadius: 10, elevation: 6,
  },
  btnDisabled: { opacity: 0.6 },
  btnPrimaryText: { fontSize: 16, fontWeight: '700', color: '#F8FAFC' },
  btnSecondary: { alignItems: 'center', paddingVertical: 12 },
  btnSecondaryText: { fontSize: 15, color: COLORS.textSecondary },
});
