import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { Linking, Pressable, StyleSheet, View } from 'react-native';
import { RecPlayer } from '../../components/RecPlayer';
import { Body, Button, Card, H1, H2, H3, Muted, Row, Screen } from '../../components/ui';
import { LESSONS } from '../../data/lessons';
import { JANNGU } from '../../data/recordings';
import { useI18n } from '../../lib/i18n';
import { BOSS_SOUNDS } from '../../lib/practice';
import { appStore, openedJanngu } from '../../lib/store';
import { synthesize } from '../../lib/tts';
import { colors, radius, space } from '../../theme';

export default function Accent() {
  const { t, lang } = useI18n();
  const { bossBest } = appStore.useStore();
  const [tts, setTts] = useState<null | 'not_configured' | 'payment' | 'error' | 'busy'>(null);
  const [showNative, setShowNative] = useState(false);
  const open = (url: string) => {
    openedJanngu();
    Linking.openURL(url).catch(() => undefined);
  };
  const sounds = LESSONS[0].items.filter((it) => BOSS_SOUNDS.slice(0, 9).includes(it.pu));

  return (
    <Screen>
      <H1>{t('accentTitle')}</H1>

      <Card style={{ gap: space.sm, backgroundColor: colors.primary }}>
        <Row>
          <Ionicons name="radio-outline" size={22} color={colors.accent} />
          <H2 color={colors.onPrimary} style={{ flex: 1 }}>Janngu</H2>
        </Row>
        <Body color={colors.onPrimary} style={{ fontWeight: '700' }}>{t('jannguLabel')}</Body>
        <Muted color="#D5ECDF">{t('jannguText')}</Muted>
        <Row style={{ flexWrap: 'wrap' }}>
          <LinkBtn icon="globe-outline" label={t('website')} onPress={() => open(JANNGU.site)} />
          <LinkBtn icon="paper-plane-outline" label={t('telegram')} onPress={() => open(JANNGU.telegram)} />
          <LinkBtn icon="logo-tiktok" label={t('tiktok')} onPress={() => open(JANNGU.tiktok)} />
          <LinkBtn icon="mail-outline" label={t('contact')} onPress={() => open(`mailto:${JANNGU.email}`)} />
        </Row>
      </Card>

      <H2>{t('sounds')}</H2>
      <Muted>{t('soundsText')}</Muted>
      <View style={styles.grid}>
        {sounds.map((it) => (
          <View key={it.pu} style={styles.cell}>
            <Body style={styles.letter}>{it.pu}</Body>
            <Muted center numberOfLines={3}>{lang === 'fr' ? it.fr : it.en}</Muted>
          </View>
        ))}
      </View>
      <Card style={{ gap: space.sm }}>
        <H3>{t('listenAlphabet')} · 0,75×</H3>
        <RecPlayer recId="up-1" initialRate={0.75} />
      </Card>
      <Button label={bossBest ? `${t('startBoss')} · ${bossBest} %` : t('startBoss')} icon={<Ionicons name="flash" size={18} color={colors.onPrimary} />} onPress={() => router.push('/practice/boss')} />

      <H2>{t('teacher')}</H2>
      <Card style={{ gap: space.sm }}>
        <Muted>{t('teacherText')}</Muted>
        <Button
          variant="secondary"
          label={tts === 'busy' ? '…' : t('ttsBtn')}
          icon={<Ionicons name="volume-high-outline" size={18} color={colors.primary} />}
          disabled={tts === 'busy'}
          onPress={async () => {
            setTts('busy');
            const r = await synthesize('Jam waali');
            if (r.ok) {
              setTts(null);
              // Un proxy configuré renvoie un MP3 : lecture simple via le lecteur web.
              if (typeof Audio !== 'undefined') new Audio(r.uri).play().catch(() => undefined);
            } else {
              setTts(r.reason);
              setShowNative(true);
            }
          }}
        />
        {tts && tts !== 'busy' ? (
          <View style={styles.notice} accessibilityRole="alert">
            <Body style={{ fontWeight: '700' }} color={colors.accentText}>
              {tts === 'not_configured' ? t('ttsNotConfigured') : tts === 'payment' ? t('ttsPayment') : t('ttsError')}
            </Body>
            {tts === 'not_configured' ? <Muted color={colors.accentText}>{t('ttsNotConfiguredText')}</Muted> : null}
          </View>
        ) : null}
        {showNative ? <RecPlayer recId="up-3" /> : null}
      </Card>
    </Screen>
  );
}

function LinkBtn({ icon, label, onPress }: { icon: keyof typeof Ionicons.glyphMap; label: string; onPress: () => void }) {
  return (
    <Pressable accessibilityRole="link" accessibilityLabel={`Janngu ${label}`} onPress={onPress} style={({ pressed }) => [styles.link, pressed && { opacity: 0.8 }]}>
      <Ionicons name={icon} size={16} color={colors.primary} />
      <Body style={{ fontWeight: '700', fontSize: 14 }} color={colors.primary}>{label}</Body>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm },
  cell: { width: '31%', flexGrow: 1, backgroundColor: colors.surface, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, padding: space.sm, alignItems: 'center', gap: 2, minHeight: 96 },
  letter: { fontSize: 30, fontWeight: '800', color: colors.primary },
  link: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: colors.surface, borderRadius: 999, paddingHorizontal: space.md, paddingVertical: 8 },
  notice: { backgroundColor: colors.accentSoft, borderRadius: radius.md, padding: space.md, gap: 4 },
});
