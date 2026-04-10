import React from 'react';
import { StyleSheet, Modal, KeyboardAvoidingView, Platform, TouchableWithoutFeedback } from 'react-native';
import { BlurView } from 'expo-blur';

/**
 * Modal glassmorphism : fond flouté derrière le contenu.
 * @param position 'center' (défaut) | 'bottom'
 */
export default function GlassOverlay({ visible, onClose, children, position = 'center', animationType = 'fade' }) {
  return (
    <Modal visible={visible} transparent animationType={animationType} statusBarTranslucent>
      <TouchableWithoutFeedback onPress={onClose}>
        <BlurView intensity={55} tint="dark" style={StyleSheet.absoluteFill} />
      </TouchableWithoutFeedback>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={[styles.wrapper, position === 'bottom' ? styles.bottom : styles.center]}
        pointerEvents="box-none"
      >
        {children}
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  wrapper: { flex: 1 },
  center: { justifyContent: 'center', alignItems: 'center', paddingHorizontal: 20 },
  bottom: { justifyContent: 'flex-end' },
});
