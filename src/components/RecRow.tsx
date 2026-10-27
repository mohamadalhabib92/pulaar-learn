import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import { View } from 'react-native';
import { fmtTime } from '../data/recordings';
import { colors } from '../theme';
import { Badge, Card, H3, Muted, Row } from './ui';

export function RecRow({ id, title, sub, durationS, badge, listened }: { id: string; title: string; sub: string; durationS: number | null; badge?: string; listened?: boolean }) {
  return (
    <Card onPress={() => router.push(`/recording/${id}`)} accessibilityLabel={title} style={{ paddingVertical: 12 }}>
      <Row>
        <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' }}>
          <Ionicons name={listened ? 'checkmark' : 'play'} size={18} color={colors.primary} />
        </View>
        <View style={{ flex: 1, gap: 2 }}>
          <H3 numberOfLines={1}>{title}</H3>
          <Muted numberOfLines={1}>{sub}{durationS ? ` · ${fmtTime(durationS)}` : ''}</Muted>
        </View>
        {badge ? <Badge label={badge} tone="warn" /> : null}
      </Row>
    </Card>
  );
}
