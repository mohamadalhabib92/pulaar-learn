import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { BackBar } from '../../components/BackBar';
import { ProvisionalBanner } from '../../components/Quest';
import { RecPlayer } from '../../components/RecPlayer';
import { TranscriptEditor } from '../../components/TranscriptEditor';
import { Badge, Body, Button, Card, EmptyState, H1, H3, Muted, Row, Screen } from '../../components/ui';
import { findLesson, LESSONS } from '../../data/lessons';
import { bundledForLesson } from '../../data/recordings';
import { useI18n } from '../../lib/i18n';
import { appStore, markSeen } from '../../lib/store';
import { colors, radius, space } from '../../theme';

export default function LessonScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t, lang } = useI18n();
  const s = appStore.useStore();
  const lesson = findLesson(String(id));

  useEffect(() => {
    if (lesson) markSeen(lesson.id);
  }, [lesson]);

  if (!lesson)
    return (
      <Screen>
        <BackBar label={t('back')} />
        <EmptyState title={t('notFound')} action={<Button label={t('home')} onPress={() => router.replace('/')} />} />
      </Screen>
    );

  const bundled = bundledForLesson(lesson.id);
  const imports = s.imports.filter((m) => m.lessonId === lesson.id);
  const mainRec = bundled?.id ?? imports[0]?.id ?? null;
  const best = s.lessons[lesson.id]?.best ?? 0;
  const nextLesson = LESSONS.find((l) => l.n === lesson.n + 1);

  return (
    <Screen>
      <BackBar label={t('back')} />
      <Muted>{t('lessonN', { n: lesson.n })} · {t('items', { n: lesson.items.length })}</Muted>
      <H1>{lesson.title[lang]}</H1>
      <Body color={colors.muted}>{lesson.intro[lang]}</Body>

      <Card style={{ gap: space.sm }}>
        <Row>
          <Ionicons name="headset" size={20} color={colors.primary} />
          <H3 style={{ flex: 1 }}>{t('listen')}</H3>
          {bundled ? <Badge label={t('audioProvisional')} tone="warn" /> : null}
        </Row>
        {mainRec ? <RecPlayer recId={mainRec} /> : <EmptyState title={t('noAudio')} text={t('noAudioText')} action={<Button small variant="secondary" label={t('importBtn')} onPress={() => router.push(`/import?lesson=${lesson.id}`)} />} />}
        {bundled ? <Muted>{t('audioProvisionalText', { n: bundled.n })}</Muted> : null}
        {imports.filter((m) => m.id !== mainRec).map((m) => (
          <Button key={m.id} small variant="ghost" label={`🎧 ${m.title}`} onPress={() => router.push(`/recording/${m.id}`)} style={{ alignSelf: 'flex-start' }} />
        ))}
      </Card>

      {mainRec ? <TranscriptEditor recId={mainRec} value={bundled ? s.transcripts[mainRec] ?? '' : imports[0]?.transcript ?? ''} /> : null}

      <ProvisionalBanner />

      <Card style={{ gap: 0, padding: 0, overflow: 'hidden' }}>
        <View style={{ padding: space.lg, paddingBottom: space.sm }}>
          <H3>{t('vocabulary')}</H3>
        </View>
        {lesson.items.map((it, k) => (
          <View key={k} style={[styles.item, k % 2 === 1 && { backgroundColor: colors.bg }]}>
            <Body style={styles.pu}>{it.pu}</Body>
            <View style={{ flex: 1 }}>
              <Body>{lang === 'fr' ? it.fr : it.en}</Body>
              <Muted>{lang === 'fr' ? it.en : it.fr}</Muted>
            </View>
          </View>
        ))}
      </Card>

      <Button label={best ? `${t('practice')} · ${best} %` : t('practice')} icon={<Ionicons name="flash" size={18} color={colors.onPrimary} />} onPress={() => router.push(`/practice/${lesson.id}`)} />
      {nextLesson ? <Button variant="ghost" label={`${t('lessonN', { n: nextLesson.n })} : ${nextLesson.title[lang]} →`} onPress={() => router.replace(`/lesson/${nextLesson.id}`)} /> : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  item: { flexDirection: 'row', gap: space.md, paddingHorizontal: space.lg, paddingVertical: space.sm, alignItems: 'center', borderTopWidth: 1, borderTopColor: colors.border },
  pu: { fontSize: 18, fontWeight: '800', color: colors.primary, minWidth: 110, maxWidth: '45%', borderRadius: radius.sm },
});
