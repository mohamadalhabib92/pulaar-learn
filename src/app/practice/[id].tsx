import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { BackBar } from '../../components/BackBar';
import { RecPlayer } from '../../components/RecPlayer';
import { Body, Button, Card, EmptyState, H1, H2, Muted, ProgressBar, Row, Screen } from '../../components/ui';
import { findLesson } from '../../data/lessons';
import { useI18n } from '../../lib/i18n';
import { buildBoss, buildLessonQuiz } from '../../lib/practice';
import { appStore, finishBoss, finishPractice } from '../../lib/store';
import { colors, radius, space } from '../../theme';

const XP_PER = 10;

export default function Practice() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t, lang } = useI18n();
  const { questEnabled } = appStore.useStore();
  const isBoss = id === 'boss';
  const lesson = isBoss ? findLesson('pc-1') : findLesson(String(id));
  const [round, setRound] = useState(0);
  const qs = useMemo(() => (isBoss ? buildBoss(lang) : lesson ? buildLessonQuiz(lesson.id, lang) : []), [isBoss, lesson, lang, round]);
  const [i, setI] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [correct, setCorrect] = useState(0);
  const [done, setDone] = useState<{ pct: number; xp: number } | null>(null);

  if (!lesson || !qs.length)
    return (
      <Screen>
        <BackBar label={t('back')} />
        <EmptyState title={t('notFound')} action={<Button label={t('home')} onPress={() => router.replace('/')} />} />
      </Screen>
    );

  const restart = () => {
    setRound((r) => r + 1);
    setI(0);
    setPicked(null);
    setCorrect(0);
    setDone(null);
  };

  if (done) {
    const ok = done.pct >= 80;
    return (
      <Screen>
        <BackBar label={t('back')} />
        <Card style={{ alignItems: 'center', gap: space.md, paddingVertical: space.xl }}>
          <Body style={{ fontSize: 56 }}>{ok ? (isBoss ? '🗣️' : '🎉') : '💪'}</Body>
          <H1 center>{t('result')}</H1>
          <H2 center>{t('score', { c: correct, n: qs.length })} · {done.pct} %</H2>
          {questEnabled ? <Body color={colors.accentText} style={{ fontWeight: '800' }}>{t('xpGained', { xp: done.xp })}</Body> : null}
          {ok ? <Body color={colors.ok} center style={{ fontWeight: '700' }}>{t('masteredMsg')}</Body> : null}
          <Row style={{ flexWrap: 'wrap', justifyContent: 'center' }}>
            <Button label={t('retry')} onPress={restart} />
            <Button variant="ghost" label={t('backLesson')} onPress={() => router.replace(`/lesson/${lesson.id}`)} />
          </Row>
        </Card>
      </Screen>
    );
  }

  const q = qs[i];
  const answered = picked !== null;
  const right = picked === q.answer;
  const label = q.kind === 'whatMeans' ? t('whatMeans') : q.kind === 'howSay' ? t('howSay') : t('whichSound');

  const choose = (o: string) => {
    if (answered) return;
    setPicked(o);
    if (o === q.answer) setCorrect((c) => c + 1);
  };
  const next = () => {
    if (i + 1 < qs.length) {
      setI(i + 1);
      setPicked(null);
      return;
    }
    const pct = Math.round((correct / qs.length) * 100);
    const xp = correct * XP_PER + (pct >= 80 ? 20 : 0);
    if (isBoss) finishBoss(pct, questEnabled ? xp : 0);
    else finishPractice(lesson.id, pct, questEnabled ? xp : 0);
    setDone({ pct, xp });
  };

  return (
    <Screen>
      <BackBar label={t('back')} />
      <H1>{isBoss ? t('bossTitle') : t('practiceTitle', { n: lesson.n })}</H1>
      {isBoss ? (
        <>
          <Muted>{t('bossText')}</Muted>
          <RecPlayer recId="up-1" initialRate={0.75} />
        </>
      ) : null}
      <Row style={{ justifyContent: 'space-between' }}>
        <Muted>{t('question', { i: i + 1, n: qs.length })}</Muted>
        {questEnabled ? <Muted color={colors.accentText}>⭐ {correct * XP_PER} XP</Muted> : null}
      </Row>
      <ProgressBar value={(i + (answered ? 1 : 0)) / qs.length} height={8} />
      <Card style={{ gap: space.sm, alignItems: 'center', paddingVertical: space.xl }}>
        <Muted>{label}</Muted>
        <Body center style={q.promptIsPu ? styles.puPrompt : styles.prompt}>
          {q.prompt}
        </Body>
      </Card>
      <View style={{ gap: space.sm }}>
        {q.options.map((o) => {
          const isAns = o === q.answer;
          const state = !answered ? null : isAns ? 'ok' : o === picked ? 'ko' : null;
          return (
            <Pressable
              key={o}
              accessibilityRole="button"
              accessibilityState={{ selected: picked === o, disabled: answered }}
              onPress={() => choose(o)}
              style={({ pressed }) => [styles.opt, state === 'ok' && styles.optOk, state === 'ko' && styles.optKo, pressed && !answered && { opacity: 0.8 }]}
            >
              <Body style={[{ flex: 1, fontSize: q.promptIsPu ? 16 : 20, fontWeight: q.promptIsPu ? '500' : '800' }]}>{o}</Body>
              {state === 'ok' ? <Ionicons name="checkmark-circle" size={22} color={colors.ok} /> : state === 'ko' ? <Ionicons name="close-circle" size={22} color={colors.danger} /> : null}
            </Pressable>
          );
        })}
      </View>
      {answered ? (
        <Card style={{ gap: space.sm, backgroundColor: right ? '#E3F6EA' : '#FDECEA' }}>
          <Body style={{ fontWeight: '700' }} color={right ? colors.ok : colors.danger}>
            {right ? (questEnabled ? t('correct', { xp: XP_PER }) : t('correctPlain')) : t('wrong', { a: q.answer })}
          </Body>
          <Button label={i + 1 < qs.length ? t('next') : t('finish')} onPress={next} />
        </Card>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  prompt: { fontSize: 20, fontWeight: '700' },
  puPrompt: { fontSize: 30, fontWeight: '800', color: colors.primary },
  opt: { flexDirection: 'row', alignItems: 'center', gap: space.sm, backgroundColor: colors.surface, borderWidth: 1.5, borderColor: colors.border, borderRadius: radius.md, padding: space.lg, minHeight: 56 },
  optOk: { borderColor: colors.ok, backgroundColor: '#E3F6EA' },
  optKo: { borderColor: colors.danger, backgroundColor: '#FDECEA' },
});
