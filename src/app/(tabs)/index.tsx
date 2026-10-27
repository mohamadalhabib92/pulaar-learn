import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import { Linking, StyleSheet, View } from 'react-native';
import { ProvisionalBanner, QuestStrip } from '../../components/Quest';
import { Badge, Body, Button, Card, H1, H2, H3, Muted, Row, Screen } from '../../components/ui';
import { LESSONS, SOURCE } from '../../data/lessons';
import { WONNOO } from '../../data/recordings';
import { useI18n } from '../../lib/i18n';
import { appStore, lessonStatus } from '../../lib/store';
import { colors, radius, space } from '../../theme';

export default function Learn() {
  const { t, lang } = useI18n();
  const s = appStore.useStore();
  const started = Object.keys(s.lessons).length > 0 || s.listened.length > 0;
  const next = LESSONS.find((l) => lessonStatus(s, l.id) !== 'mastered') ?? LESSONS[0];

  return (
    <Screen>
      <View style={styles.hero}>
        <Muted color="#CFEBDD">{t('appName')}</Muted>
        <H1 color={colors.onPrimary}>{t('hello')}</H1>
        <Body color="#E6F4EC">{t('tagline')}</Body>
        <Button
          label={started ? t('continueLesson', { n: next.n }) : t('startFirst')}
          icon={<Ionicons name="play" size={18} color={colors.accentText} />}
          onPress={() => router.push(`/lesson/${started ? next.id : 'pc-1'}`)}
          style={{ backgroundColor: colors.accent, alignSelf: 'flex-start', marginTop: space.sm }}
        />
      </View>

      {s.questEnabled ? <QuestStrip /> : null}
      <ProvisionalBanner />

      <H2>{t('lessonsPath')}</H2>
      <View style={{ gap: space.sm }}>
        {LESSONS.map((l, idx) => {
          const st = lessonStatus(s, l.id);
          const best = s.lessons[l.id]?.best ?? 0;
          return (
            <View key={l.id} style={{ flexDirection: 'row', gap: space.md, alignItems: 'stretch' }}>
              {s.questEnabled ? (
                <View style={{ alignItems: 'center', width: 36 }}>
                  <View style={[styles.node, st === 'mastered' ? styles.nodeDone : st === 'seen' ? styles.nodeSeen : null]}>
                    {st === 'mastered' ? <Ionicons name="checkmark" size={18} color={colors.onPrimary} /> : <Body style={{ fontWeight: '800' }} color={st === 'seen' ? colors.primary : colors.muted}>{l.n}</Body>}
                  </View>
                  {idx < LESSONS.length - 1 ? <View style={styles.line} /> : null}
                </View>
              ) : null}
              <Card style={{ flex: 1, paddingVertical: space.md }} onPress={() => router.push(`/lesson/${l.id}`)} accessibilityLabel={`${t('lessonN', { n: l.n })} ${l.title[lang]}`}>
                <Row>
                  <View style={styles.icon}>
                    <Ionicons name={`${l.icon}-outline` as keyof typeof Ionicons.glyphMap} size={20} color={colors.primary} />
                  </View>
                  <View style={{ flex: 1, gap: 2 }}>
                    <Muted>{t('lessonN', { n: l.n })} · {t('items', { n: l.items.length })}{l.upload ? ' · 🎧' : ''}</Muted>
                    <H3>{l.title[lang]}</H3>
                  </View>
                  <Badge label={st === 'mastered' ? `${t('mastered')} ${best} %` : st === 'seen' ? t('seen') : t('newL')} tone={st === 'mastered' ? 'ok' : st === 'seen' ? 'info' : 'neutral'} />
                </Row>
              </Card>
            </View>
          );
        })}
      </View>

      <Card style={{ gap: space.sm, borderStyle: 'dashed' }}>
        <Row>
          <Ionicons name="cloud-offline-outline" size={20} color={colors.muted} />
          <H3 style={{ flex: 1 }}>{t('nativePack')}</H3>
        </Row>
        <Muted>{t('nativePackText')}</Muted>
        <Button small variant="secondary" label={t('importNow')} onPress={() => router.push('/import')} style={{ alignSelf: 'flex-start' }} />
      </Card>

      <H2>{t('readings')}</H2>
      <Card style={{ gap: space.sm }}>
        <Row>
          <Ionicons name="book-outline" size={20} color={colors.primary} />
          <H3 style={{ flex: 1 }}>{WONNOO.title}</H3>
        </Row>
        <Badge label={t('wonnooStatus')} tone="warn" />
        <Muted>{t('wonnooText', { t: WONNOO.title, n: WONNOO.tales, p: WONNOO.pages, f: WONNOO.firstTale })}</Muted>
      </Card>

      <Card style={{ gap: 4 }}>
        <Muted style={{ fontWeight: '700' }}>{t('sourceCredit')}</Muted>
        <Muted>{SOURCE.title}</Muted>
        <Muted>{SOURCE.license[lang]}</Muted>
        <Body color={colors.primary} onPress={() => Linking.openURL(SOURCE.url).catch(() => undefined)} accessibilityRole="link">
          livelingua.com
        </Body>
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: { backgroundColor: colors.primary, borderRadius: radius.lg, padding: space.xl, gap: space.xs },
  node: { width: 36, height: 36, borderRadius: 18, borderWidth: 2, borderColor: colors.border, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center', marginTop: space.md },
  nodeSeen: { borderColor: colors.primary },
  nodeDone: { backgroundColor: colors.primary, borderColor: colors.primary },
  line: { flex: 1, width: 2, backgroundColor: colors.border, marginTop: 2, marginBottom: -space.sm - 14 },
  icon: { width: 40, height: 40, borderRadius: 12, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' },
});
