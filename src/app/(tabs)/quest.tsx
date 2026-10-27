import { router } from 'expo-router';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { QuestStrip } from '../../components/Quest';
import { Body, Button, Card, EmptyState, H1, H2, H3, Muted, Screen } from '../../components/ui';
import { LESSONS } from '../../data/lessons';
import { useI18n } from '../../lib/i18n';
import { appStore, BADGES, lessonStatus } from '../../lib/store';
import { colors, radius, space } from '../../theme';

export default function Quest() {
  const { t, lang } = useI18n();
  const s = appStore.useStore();
  if (!s.questEnabled)
    return (
      <Screen>
        <EmptyState title={t('questOff')} text={t('questOffText')} action={<Button label={t('settings')} onPress={() => router.push('/settings')} />} />
      </Screen>
    );
  const next = LESSONS.find((l) => lessonStatus(s, l.id) !== 'mastered');
  return (
    <Screen>
      <H1>{t('questTitle')}</H1>
      <Muted>{t('questHint')}</Muted>
      <QuestStrip />
      <Muted>{t('bestStreak', { n: s.bestStreak })}</Muted>
      <Card style={{ gap: space.sm, backgroundColor: colors.accentSoft }}>
        <Muted color={colors.accentText} style={{ fontWeight: '700' }}>{t('nextQuest')}</Muted>
        {next ? (
          <>
            <H3>{t('questLesson', { n: next.n, t: next.title[lang] })}</H3>
            <Button label={t('practice')} onPress={() => router.push(`/lesson/${next.id}`)} style={{ alignSelf: 'flex-start' }} />
          </>
        ) : (
          <Body>{t('allDone')}</Body>
        )}
      </Card>
      <H2>{t('badges')} · {s.badges.length}/{BADGES.length}</H2>
      <View style={styles.grid}>
        {BADGES.map((b) => {
          const on = s.badges.includes(b.id);
          return (
            <View key={b.id} style={[styles.badge, !on && { opacity: 0.4 }]} accessibilityLabel={`${b[lang]}${on ? '' : ' (verrouillé)'}`}>
              <Body style={{ fontSize: 30 }}>{on ? b.icon : '🔒'}</Body>
              <Muted center>{b[lang]}</Muted>
            </View>
          );
        })}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm },
  badge: { width: '31%', flexGrow: 1, alignItems: 'center', gap: 4, backgroundColor: colors.surface, borderRadius: radius.md, padding: space.md, borderWidth: 1, borderColor: colors.border },
});
