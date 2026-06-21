import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, RADIUS, SHADOWS } from '../utils/theme';

export function PrimaryButton({ title, onPress, style, textStyle, gradient = COLORS.gradient1, icon }) {
  return (
    <TouchableOpacity style={[styles.btnWrap, style]} onPress={onPress}>
      <LinearGradient colors={gradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.btn}>
        {icon && <Text style={styles.icon}>{icon}</Text>}
        <Text style={[styles.btnText, textStyle]}>{title}</Text>
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  btnWrap: {
    borderRadius: RADIUS.xl,
    overflow: 'hidden',
    ...SHADOWS.md,
  },
  btn: {
    flexDirection: 'row',
    height: 54,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  btnText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  icon: {
    fontSize: 20,
    marginRight: 10,
  },
});
