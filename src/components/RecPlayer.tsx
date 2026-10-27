import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { findBundled } from '../data/recordings';
import { useI18n } from '../lib/i18n';
import { isOffline, makeOffline, offlineSupported } from '../lib/offline';
import { useRecordingSource } from '../lib/useRecording';
import { colors } from '../theme';
import { AudioPlayer } from './AudioPlayer';
import { Badge, Button, Muted, Row, Skeleton } from './ui';

export function RecPlayer({ recId, initialRate }: { recId: string; initialRate?: number }) {
  const { source, loading } = useRecordingSource(recId);
  const b = findBundled(recId);
  if (loading) return <Skeleton height={150} />;
  return (
    <>
      <AudioPlayer source={source} recId={recId} fallbackDuration={b?.durationS} initialRate={initialRate} />
      {b ? <OfflineButton mod={b.source} /> : null}
    </>
  );
}

/** Web uniquement : met le MP3 en cache pour la lecture hors ligne. Sur mobile, l'audio est embarqué. */
export function OfflineButton({ mod }: { mod: number }) {
  const { t } = useI18n();
  const [ready, setReady] = useState<boolean | null>(null);
  const [busy, setBusy] = useState(false);
  const [fail, setFail] = useState(false);
  useEffect(() => {
    let alive = true;
    isOffline(mod).then((v) => alive && setReady(v)).catch(() => alive && setReady(false));
    return () => {
      alive = false;
    };
  }, [mod]);
  if (!offlineSupported() || ready === null) return null;
  if (ready)
    return (
      <Row>
        <Ionicons name="cloud-done-outline" size={16} color={colors.ok} />
        <Badge label={t('offlineReady')} tone="ok" />
      </Row>
    );
  return (
    <Row style={{ flexWrap: 'wrap' }}>
      <Button
        small
        variant="ghost"
        label={t('makeOffline')}
        icon={<Ionicons name="cloud-download-outline" size={16} color={colors.primary} />}
        disabled={busy}
        onPress={async () => {
          setBusy(true);
          setFail(false);
          const ok = await makeOffline(mod);
          setBusy(false);
          if (ok) setReady(true);
          else setFail(true);
        }}
      />
      {fail ? <Muted color={colors.danger}>{t('offlineFail')}</Muted> : null}
    </Row>
  );
}
