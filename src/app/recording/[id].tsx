import { router, useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import { BackBar } from '../../components/BackBar';
import { RecPlayer } from '../../components/RecPlayer';
import { TranscriptEditor } from '../../components/TranscriptEditor';
import { Badge, Button, Card, EmptyState, H1, Muted, Row, Screen } from '../../components/ui';
import { findLesson } from '../../data/lessons';
import { useI18n } from '../../lib/i18n';
import { deleteImportFile } from '../../lib/audioFiles';
import { appStore, removeImportMeta } from '../../lib/store';
import { useRecordingMeta } from '../../lib/useRecording';
import { space } from '../../theme';

export default function RecordingScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t, lang } = useI18n();
  const rec = useRecordingMeta(String(id), lang);
  const imports = appStore.useStore().imports;
  const [confirm, setConfirm] = useState(false);

  if (!rec)
    return (
      <Screen>
        <BackBar label={t('back')} />
        <EmptyState title={t('notFound')} action={<Button label={t('home')} onPress={() => router.replace('/')} />} />
      </Screen>
    );
  const lesson = rec.lessonId ? findLesson(rec.lessonId) : null;

  return (
    <Screen>
      <BackBar label={t('back')} />
      <H1>{rec.title}</H1>
      <Row style={{ flexWrap: 'wrap' }}>
        <Badge label={t(`tag_${rec.tag}` as 'tag_autre')} tone="info" />
        <Badge label="pulaar" />
        <Badge label={t('uploadSource')} />
        {rec.kind === 'bundled' ? <Badge label={t('audioProvisional')} tone="warn" /> : null}
      </Row>
      {rec.createdAt ? <Muted>{t('importedOn', { d: new Date(rec.createdAt).toLocaleDateString(lang === 'fr' ? 'fr-CH' : 'en-GB') })}</Muted> : null}
      <RecPlayer recId={rec.id} />
      {lesson ? (
        <Card onPress={() => router.push(`/lesson/${lesson.id}`)}>
          <Muted>{t('lessonN', { n: lesson.n })}</Muted>
          <Muted style={{ fontWeight: '700' }}>{lesson.title[lang]} →</Muted>
        </Card>
      ) : null}
      <TranscriptEditor recId={rec.id} value={rec.transcript} />
      {rec.kind === 'import' ? (
        <Button
          variant={confirm ? 'danger' : 'ghost'}
          label={confirm ? t('confirmDelete') : t('deleteRec')}
          style={{ marginTop: space.md }}
          onPress={async () => {
            if (!confirm) return setConfirm(true);
            const m = imports.find((x) => x.id === rec.id);
            if (m) await deleteImportFile(m);
            removeImportMeta(rec.id);
            router.canGoBack() ? router.back() : router.replace('/audio');
          }}
        />
      ) : null}
    </Screen>
  );
}
