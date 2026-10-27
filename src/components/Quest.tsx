import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useI18n } from '../lib/i18n';
import { appStore, dayKey } from '../lib/store';
import { colors, radius, space } from '../theme';
import { Body, Card, H3, Muted, ProgressBar, Row } from './ui';

export function QuestStrip() {
  const { t } = useI18n();
  const s = appStore.useStore();
  const today = s.todayDay === dayKey() ? s.todayXp : 0;
  const streakAlive = s.lastActiveDay === dayKey() || s.lastActiveDay === (() => { const d = new Date(); d.setDate(d.getDate() - 1); return dayKey(d); })();
  const streak = streakAlive ? s.streak : 0;
  return (
    <Card style={{ gap: space.sm }}>
      <Row style={{ justifyContent: 'space-between' }}>
        <Stat icon="star" color={colors.accent} value={String(s.xp)} label={t('xp')} />
        <Stat icon="flame" color="#E4572E" value={t('days', { n: streak })} label={t('streak')} />
        <Stat icon="ribbon" color={colors.primary} value={String(s.badges.length)} label={t('badges')} />
      </Row>
      <Row style={{ justifyContent: 'space-between' }}>
        <Muted>{t('dailyGoal')}</Muted>
        <Muted>{t('dailyGoalProgress', { x: Math.min(today, s.dailyGoal), g: s.dailyGoal })}</Muted>
      </Row>
      <ProgressBar value={today / s.dailyGoal} color={colors.accent} height={8} />
    </Card>
  );
}

function Stat({ icon, color, value, label }: { icon: keyof typeof Ionicons.glyphMap; color: string; value: string; label: string }) {
  return (
    <View style={styles.stat}>
      <Row gap={6}>
        <Ionicons name={icon} size={18} color={color} />
        <H3>{value}</H3>
      </Row>
      <Muted>{label}</Muted>
    </View>
  );
}

export function ProvisionalBanner() {
  const { t } = useI18n();
  return (
    <View style={styles.banner}>
      <Row>
        <Ionicons name="construct-outline" size={16} color={colors.accentText} />
        <Body style={{ fontWeight: '700', flex: 1 }} color={colors.accentText}>
          {t('orthoProvisional')}
        </Body>
      </Row>
      <Muted color={colors.accentText}>{t('orthoText')}</Muted>
    </View>
  );
}

const styles = StyleSheet.create({
  stat: { alignItems: 'center', flex: 1, gap: 2 },
  banner: { backgroundColor: colors.accentSoft, borderRadius: radius.md, padding: space.md, gap: 4, borderWidth: 1, borderColor: '#F3D9AE' },
});
