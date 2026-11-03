import { router, useLocalSearchParams } from 'expo-router';
import React from 'react';
import { Linking, View } from 'react-native';
import { BackBar } from '../../components/BackBar';
import { Badge, Body, Button, Card, DialectBadge, EmptyState, H1, H2, H3, Muted, PulaarText, Row, Screen } from '../../components/ui';
import { SERIES, findEpisode, type Episode, type SectionId } from '../../data/contes';
import { TARO } from '../../data/taro';
import { useI18n } from '../../lib/i18n';
import { colors, space } from '../../theme';

const SEC_KEY: Record<SectionId, 'secStory' | 'secVocab' | 'secLetters' | 'secDialogue' | 'secGames' | 'secSong' | 'secParents'> = {
  story: 'secStory',
  vocab: 'secVocab',
  letters: 'secLetters',
  dialogue: 'secDialogue',
  games: 'secGames',
  song: 'secSong',
  parents: 'secParents',
};

export default function EpisodeScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t, lang } = useI18n();
  const e = findEpisode(String(id));
  if (!e)
    return (
      <Screen>
        <BackBar label={t('back')} />
        <EmptyState title={t('notFound')} action={<Button label={t('home')} onPress={() => router.replace('/')} />} />
      </Screen>
    );

  const Todo = ({ sec }: { sec: SectionId }) => (
    <Card style={{ gap: space.xs, borderStyle: 'dashed' }}>
      <Row style={{ flexWrap: 'wrap' }}>
        <H2 style={{ flex: 1 }}>{t(SEC_KEY[sec])}</H2>
        <Badge label={t('contesToWrite')} tone="neutral" />
      </Row>
      <Muted>{t('contesToWriteText')}</Muted>
    </Card>
  );
  const Head = ({ sec }: { sec: SectionId }) => (
    <Row style={{ flexWrap: 'wrap' }}>
      <H2 style={{ flex: 1 }}>{t(SEC_KEY[sec])}</H2>
      <DialectBadge label={t('reviewAi')} tone="warn" />
    </Row>
  );

  return (
    <Screen>
      <BackBar label={t('back')} />
      <Muted>{e.kind === 'serie' ? `${SERIES.title} · ${t('contesChapter', { v: e.volume ?? '?', c: e.chapter ?? '?' })}` : t('contesFree')}</Muted>
      <H1>{e.title.fr}</H1>
      {e.title.pu ? <PulaarText bold>{e.title.pu}</PulaarText> : null}
      <Card style={{ gap: space.xs }}>
        <Badge label={t('reviewAi')} tone="warn" />
        <Muted>{t('contesAiBanner')}</Muted>
      </Card>
      {e.moral ? <Muted>{t('contesMoral')} : {e.moral}</Muted> : null}

      {/* 1. Histoire */}
      <Head sec="story" />
      <Card style={{ gap: space.sm }}>
        <H3>{t('storyPulaar')}</H3>
        {e.story.pu ? e.story.pu.map((l, i) => <PulaarText key={i}>{l}</PulaarText>) : <Muted>{t('storyPulaarMissing')}</Muted>}
        <H3>{t('storyFrench')}</H3>
        {e.story.fr.map((l, i) => (
          <Body key={i}>{l}</Body>
        ))}
        <PulaarText bold style={{ color: colors.primary }}>{SERIES.ending}</PulaarText>
      </Card>

      {/* 2. Vocabulaire */}
      {e.vocab ? (
        <>
          <Head sec="vocab" />
          {e.vocab.map((g) => (
            <Card key={g.group} style={{ gap: space.sm }}>
              <H3>{g.group}</H3>
              {g.words.map((w) => (
                <View key={w.key} style={{ gap: 2, borderTopWidth: 1, borderTopColor: colors.border, paddingTop: space.xs }}>
                  <Muted style={{ fontWeight: '700' }}>{w.key}</Muted>
                  <PulaarText bold>
                    {w.pu}
                    {w.pron?.pu ? <Muted> ({w.pron.pu})</Muted> : null}
                  </PulaarText>
                  <Body>
                    {t('langAr')} : {w.ar}
                    {w.pron?.ar ? ` (${w.pron.ar})` : ''}
                  </Body>
                  <Body>
                    {t('langFr')} : {w.fr}
                  </Body>
                  <Body>
                    {t('langBe')} : {w.be}
                    {w.pron?.be ? ` (${w.pron.be})` : ''}
                  </Body>
                </View>
              ))}
            </Card>
          ))}
        </>
      ) : (
        <Todo sec="vocab" />
      )}

      {/* 3. Lettres du jour */}
      {e.letters ? (
        <>
          <Head sec="letters" />
          <Card style={{ gap: space.sm }}>
            <H3>{t('lettersPulaar', { l: e.letters.taroLessons.join(', ') })}</H3>
            <PulaarText bold style={{ fontSize: 24 }}>{e.letters.pulaar.join(' · ')}</PulaarText>
            {e.letters.syllables.length ? (
              <Muted>
                {t('lettersSyllables')} : {e.letters.syllables.join(', ')}
              </Muted>
            ) : null}
            <H3>{t('lettersArabic')}</H3>
            {e.letters.arabic.map((a) => (
              <Body key={a.name}>
                <Body style={{ fontSize: 24 }}>{a.letter}</Body> {a.name} — « {a.sound} » — {a.example}
              </Body>
            ))}
            {e.letters.note ? <Muted>{e.letters.note}</Muted> : null}
            <Muted onPress={() => router.push('/contes/taro')} accessibilityRole="link" style={{ color: colors.primary }}>
              {TARO.title} ({TARO.license}) →
            </Muted>
          </Card>
        </>
      ) : (
        <Todo sec="letters" />
      )}

      {/* 4. Dialogue */}
      {e.dialogue ? (
        <>
          <Head sec="dialogue" />
          <Card style={{ gap: space.xs }}>
            {e.dialogue.map((d, i) => (
              <Body key={i}>
                <Body style={{ fontWeight: '700' }}>{d.who} : </Body>
                {d.line}
              </Body>
            ))}
          </Card>
        </>
      ) : (
        <Todo sec="dialogue" />
      )}

      {/* 5. Mini-jeux */}
      {e.games ? (
        <>
          <Head sec="games" />
          {e.games.map((g) => (
            <Card key={g.title} style={{ gap: space.xs }}>
              <H3>{g.title}</H3>
              <Body>{g.text}</Body>
            </Card>
          ))}
        </>
      ) : (
        <Todo sec="games" />
      )}

      {/* 6. Chanson */}
      {e.song ? (
        <>
          <Head sec="song" />
          <Card style={{ gap: 2 }}>
            {e.song.map((l, i) => (
              <Body key={i}>{l}</Body>
            ))}
          </Card>
        </>
      ) : (
        <Todo sec="song" />
      )}

      {/* 7. Coin des parents */}
      {e.parents ? (
        <>
          <H2>{t('secParents')}</H2>
          <Card style={{ gap: space.xs }}>
            <H3>{t('parentsLearned')}</H3>
            {e.parents.learned.map((l, i) => (
              <Body key={i}>• {l}</Body>
            ))}
            <H3>{t('parentsTips')}</H3>
            {e.parents.tips.map((l, i) => (
              <Body key={i}>• {l}</Body>
            ))}
          </Card>
        </>
      ) : (
        <Todo sec="parents" />
      )}

      <ReviewBox e={e} t={t} />
      <Card style={{ gap: 4 }}>
        <Muted style={{ fontWeight: '700' }}>{t('contesOrigin')}</Muted>
        <Muted>{e.origin}</Muted>
        {e.letters ? (
          <Muted onPress={() => Linking.openURL(TARO.licenseUrl).catch(() => undefined)} accessibilityRole="link">
            {TARO.attribution[lang]}
          </Muted>
        ) : null}
      </Card>
    </Screen>
  );
}

function ReviewBox({ e, t }: { e: Episode; t: ReturnType<typeof useI18n>['t'] }) {
  if (!e.reviewNotes.length) return null;
  return (
    <Card style={{ gap: space.xs }}>
      <Row style={{ flexWrap: 'wrap' }}>
        <H3 style={{ flex: 1 }}>{t('contesReviewNotes')}</H3>
        <Badge label={t('reviewAi')} tone="warn" />
      </Row>
      {e.reviewNotes.map((n, i) => (
        <Muted key={i}>• {n}</Muted>
      ))}
    </Card>
  );
}
