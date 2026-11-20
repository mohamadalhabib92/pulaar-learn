import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import { Pressable } from 'react-native';
import { useVerre } from '../lib/verre';
import { Body } from './ui';

export function BackBar({ label }: { label: string }) {
  const { colors, hit } = useVerre();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={() => (router.canGoBack() ? router.back() : router.replace('/'))}
      style={{ flexDirection: 'row', alignItems: 'center', gap: 4, minHeight: hit.min, alignSelf: 'flex-start', paddingRight: 8 }}
    >
      <Ionicons name="chevron-back" size={22} color={colors.primary} />
      <Body color={colors.primary} style={{ fontWeight: '700' }}>{label}</Body>
    </Pressable>
  );
}
