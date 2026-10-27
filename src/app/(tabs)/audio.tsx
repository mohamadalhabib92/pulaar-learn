import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import { RecRow } from '../../components/RecRow';
import { Body, Button, Card, EmptyState, H1, H2, Muted, Row, Screen } from '../../components/ui';
import { findLesson } from '../../data/lessons';
import { BUNDLED } from '../../data/recordings';
import { useI18n } from '../../lib/i18n';
import { appStore } from '../../lib/store';
import { colors, space } from '../../theme';

export default function AudioTab() {
  const { t, lang } = useI18n();
  const s = appStore.useStore();
  const tagLabel = (tag: string) => t(`tag_${tag}` as 'tag_autre');
  return (
    <Screen>
      <H1>{t('audioTitle')}</H1>
      <Body color={colors.muted}>{t('audioIntro')}</Body>
      <Button label={t('importBtn')} icon={<Ionicons name="add-circle-outline" size={18} color={colors.onPrimary} />} onPress={() => router.push('/import')} />

      <H2>{t('myImports')}</H2>
      {s.imports.length === 0 ? (
        <Card>
          <EmptyState icon={<Ionicons name="musical-notes-outline" size={32} color={colors.muted} />} title={t('noImports')} text={t('noImportsText')} />
        </Card>
      ) : (
        s.imports.map((m) => {
          const l = m.lessonId ? findLesson(m.lessonId) : null;
          return <RecRow key={m.id} id={m.id} title={m.title} sub={[tagLabel(m.tag), l ? t('linkedLesson', { n: l.n }) : null].filter(Boolean).join(' · ')} durationS={m.durationS} listened={s.listened.includes(m.id)} />;
        })
      )}

      <Row style={{ justifyContent: 'space-between', marginTop: space.sm }}>
        <H2 style={{ flex: 1 }}>{t('packMohamed')}</H2>
      </Row>
      <Muted>{t('uploadSource')} · {t('audioProvisional')} · {t('transcript')} : {t('toComplete').toLowerCase()}</Muted>
      {BUNDLED.map((r) => {
        const l = findLesson(r.lessonId);
        return (
          <RecRow
            key={r.id}
            id={r.id}
            title={r.title[lang]}
            sub={`${t('linkedLesson', { n: l?.n ?? '?' })} — ${l?.title[lang] ?? ''}`}
            durationS={r.durationS}
            badge={s.transcripts[r.id] ? undefined : t('toComplete')}
            listened={s.listened.includes(r.id)}
          />
        );
      })}

      <Card style={{ gap: space.sm, borderStyle: 'dashed' }}>
        <H2>{t('nativePack')}</H2>
        <Muted>{t('nativePackText')}</Muted>
      </Card>
    </Screen>
  );
}
