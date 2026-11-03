import { router } from 'expo-router';
import React from 'react';
import { BackBar } from '../../components/BackBar';
import { ProvenanceCard } from '../../components/ProvenanceCard';
import { Badge, Body, Button, Card, DialectBadge, H1, H2, H3, Muted, PulaarText, Row, Screen } from '../../components/ui';
import { EPISODES, SERIES, WORLDS, filledSections } from '../../data/contes';
import { CONTES_PROVENANCE } from '../../data/packs';
import { TARO } from '../../data/taro';
import { useI18n } from '../../lib/i18n';
import { colors, space } from '../../theme';

export default function ContesIndex() {
  const { t, lang } = useI18n();
  return (
    <Screen>
      <BackBar label={t('back')} />
      <H1>{t('contesTitle')}</H1>
      <Body color={colors.muted}>{t('contesIntro')}</Body>
      <Card style={{ gap: space.xs }}>
        <Badge label={t('reviewAi')} tone="warn" />
        <Muted>{t('contesAiBanner')}</Muted>
      </Card>

      <H2>{SERIES.title}</H2>
      <Muted>{SERIES.subtitle} · {SERIES.land}</Muted>
      {EPISODES.map((e) => (
        <Card key={e.id} style={{ gap: space.xs }} onPress={() => router.push(`/contes/${e.id}`)} accessibilityLabel={e.title.fr}>
          <Row style={{ flexWrap: 'wrap' }}>
            <Muted style={{ flex: 1 }}>
              {e.kind === 'serie' ? t('contesChapter', { v: e.volume ?? '?', c: e.chapter ?? '?' }) : t('contesFree')} · {t('contesMinutes', { m: e.minutes })}
            </Muted>
            <DialectBadge label={t('reviewAi')} tone="warn" />
          </Row>
          <H3>{e.title.fr}</H3>
          {e.title.pu ? <PulaarText style={{ color: colors.muted }}>{e.title.pu}</PulaarText> : null}
          <Muted>
            {e.worlds.map((w) => WORLDS[w].emoji).join(' ')} · {t('contesSections', { n: filledSections(e) })}
          </Muted>
        </Card>
      ))}

      <H2>{t('contesCharacters')}</H2>
      <Card style={{ gap: space.xs }}>
        {SERIES.characters.map((c) => (
          <Body key={c.name}>
            {c.emoji} <Body style={{ fontWeight: '700' }}>{c.name}</Body> — {c.role}
          </Body>
        ))}
      </Card>

      <H2>{t('contesWorlds')}</H2>
      <Card style={{ gap: space.xs }}>
        {Object.values(WORLDS).map((w) => (
          <Body key={w.fr}>
            {w.emoji} {w[lang]}
          </Body>
        ))}
      </Card>

      <Card style={{ gap: space.sm }}>
        <H3>{t('taroTitle')}</H3>
        <Muted>{TARO.attribution[lang]}</Muted>
        <Button small variant="secondary" label={t('taroTitle')} onPress={() => router.push('/contes/taro')} style={{ alignSelf: 'flex-start' }} />
      </Card>
      <ProvenanceCard provenance={CONTES_PROVENANCE} />
    </Screen>
  );
}
