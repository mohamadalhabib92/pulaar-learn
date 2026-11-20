import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router/js-tabs';
import React from 'react';
import { useI18n } from '../../lib/i18n';
import { appStore } from '../../lib/store';
import { useVerre } from '../../lib/verre';

export default function TabsLayout() {
  const { t } = useI18n();
  const { colors } = useVerre();
  const { questEnabled } = appStore.useStore();
  const icon =
    (name: keyof typeof Ionicons.glyphMap) =>
    ({ color, size }: { color: import('react-native').ColorValue; size: number }) => (
      <Ionicons name={name} color={(color ?? undefined) as string | undefined} size={size} />
    );
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.muted,
        tabBarStyle: {
          backgroundColor: colors.translucent ? colors.glass : colors.surfaceSolid,
          borderTopColor: colors.translucent ? colors.glassEdge : colors.border,
          borderTopWidth: 1,
        },
        tabBarLabelStyle: { fontWeight: '700', fontSize: 12 },
        tabBarItemStyle: { minHeight: 44 },
      }}
    >
      <Tabs.Screen name="index" options={{ title: t('tabLearn'), tabBarIcon: icon('school-outline') }} />
      <Tabs.Screen name="audio" options={{ title: t('tabAudio'), tabBarIcon: icon('headset-outline') }} />
      <Tabs.Screen name="accent" options={{ title: t('tabAccent'), tabBarIcon: icon('mic-outline') }} />
      <Tabs.Screen name="quest" options={{ title: t('tabQuest'), tabBarIcon: icon('trophy-outline'), href: questEnabled ? undefined : null }} />
      <Tabs.Screen name="settings" options={{ title: t('tabSettings'), tabBarIcon: icon('settings-outline') }} />
    </Tabs>
  );
}
