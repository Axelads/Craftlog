import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Linking } from 'react-native';

const URL = 'https://www.axelgregoire.fr';

export default function FooterCredit({ style }) {
  return (
    <View style={[styles.wrapper, style]}>
      <Text style={styles.text}>propulsé par </Text>
      <TouchableOpacity onPress={() => Linking.openURL(URL)} activeOpacity={0.7}>
        <Text style={styles.link}>Axel Grégoire</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 12,
  },
  text: {
    fontSize: 11,
    color: '#475569',
  },
  link: {
    fontSize: 11,
    color: '#A855F7',
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
});
