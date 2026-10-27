import { Ionicons } from '@expo/vector-icons';
import { AudioSource, setAudioModeAsync, useAudioPlayer, useAudioPlayerStatus } from 'expo-audio';
import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';
import { fmtTime } from '../data/recordings';
import { useI18n } from '../lib/i18n';
import { appStore, markListened } from '../lib/store';
import { colors, radius, space } from '../theme';
import { Body, Muted, Row, Slider } from './ui';

const RATES = [0.75, 1, 1.25];
let modeSet = false;

/**
 * Lecteur audio robuste : lecture/pause, ±5 s, barre de position et vitesse 0,75/1/1,25.
 * Si le fichier est absent ou illisible, un message clair s'affiche (aucun plantage).
 */
export function AudioPlayer({
  source,
  recId,
  fallbackDuration,
  initialRate,
}: {
  source: AudioSource | null;
  recId: string;
  fallbackDuration?: number;
  initialRate?: number;
}) {
  if (!source) return <AudioError />;
  return <Inner key={recId} source={source} recId={recId} fallbackDuration={fallbackDuration} initialRate={initialRate} />;
}

export function AudioError() {
  const { t } = useI18n();
  return (
    <View style={[styles.box, { backgroundColor: '#FDECEA', borderColor: '#F5C6C2' }]} accessibilityRole="alert">
      <Row>
        <Ionicons name="alert-circle-outline" size={20} color={colors.danger} />
        <Body style={{ fontWeight: '700', flex: 1 }} color={colors.danger}>
          {t('audioError')}
        </Body>
      </Row>
      <Muted>{t('audioErrorText')}</Muted>
    </View>
  );
}

function Inner({ source, recId, fallbackDuration, initialRate }: { source: AudioSource; recId: string; fallbackDuration?: number; initialRate?: number }) {
  const { t, lang } = useI18n();
  const storedRate = appStore.useStore().rate;
  const [rate, setRate] = useState(initialRate ?? storedRate ?? 1);
  const player = useAudioPlayer(source, { updateInterval: 250 });
  const status = useAudioPlayerStatus(player);
  const [scrub, setScrub] = useState<number | null>(null);
  const [timedOut, setTimedOut] = useState(false);
  const counted = useRef(false);
  const err = (status as { error?: string }).error;

  useEffect(() => {
    if (!modeSet) {
      modeSet = true;
      setAudioModeAsync({ playsInSilentMode: true }).catch(() => undefined);
    }
  }, []);

  useEffect(() => {
    if (status.isLoaded) return;
    const id = setTimeout(() => setTimedOut(true), 12000);
    return () => clearTimeout(id);
  }, [status.isLoaded]);

  useEffect(() => {
    try {
      player.setPlaybackRate(rate);
    } catch {
      // vitesse non prise en charge : on ignore
    }
  }, [player, rate, status.isLoaded]);

  useEffect(() => {
    if (!counted.current && status.currentTime > 3) {
      counted.current = true;
      markListened(recId);
    }
  }, [status.currentTime, recId]);

  if (err || (timedOut && !status.isLoaded)) return <AudioError />;

  const duration = status.duration > 0 ? status.duration : fallbackDuration ?? 0;
  const pos = scrub ?? status.currentTime;
  const safe = (fn: () => void) => {
    try {
      fn();
    } catch {
      // le lecteur peut avoir été libéré pendant une navigation
    }
  };
  const toggle = () =>
    safe(() => {
      if (status.playing) player.pause();
      else {
        if (duration && status.currentTime >= duration - 0.3) player.seekTo(0);
        player.play();
      }
    });
  const jump = (d: number) => safe(() => player.seekTo(Math.max(0, Math.min(duration || 0, status.currentTime + d))));
  const changeRate = (r: number) => {
    setRate(r);
    if (initialRate == null) appStore.set({ rate: r });
  };

  return (
    <View style={styles.box}>
      <Row gap={space.md} style={{ justifyContent: 'center' }}>
        <RoundBtn icon="play-back" label={t('back5')} onPress={() => jump(-5)} />
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={status.playing ? t('pause') : t('play')}
          onPress={toggle}
          disabled={!status.isLoaded}
          style={({ pressed }) => [styles.play, { opacity: !status.isLoaded ? 0.6 : pressed ? 0.85 : 1 }]}
        >
          {!status.isLoaded || (status.isBuffering && !status.playing) ? (
            <ActivityIndicator color={colors.onPrimary} />
          ) : (
            <Ionicons name={status.playing ? 'pause' : 'play'} size={30} color={colors.onPrimary} style={status.playing ? undefined : { marginLeft: 3 }} />
          )}
        </Pressable>
        <RoundBtn icon="play-forward" label={t('fwd5')} onPress={() => jump(5)} />
      </Row>
      <Slider
        value={pos}
        min={0}
        max={duration || 1}
        accessibilityLabel={t('seek')}
        onChange={(v) => setScrub(v)}
        onComplete={(v) => {
          setScrub(null);
          safe(() => player.seekTo(v));
        }}
      />
      <Row style={{ justifyContent: 'space-between' }}>
        <Muted>{fmtTime(pos)}</Muted>
        {!status.isLoaded ? <Muted>{t('audioLoading')}</Muted> : null}
        <Muted>{fmtTime(duration)}</Muted>
      </Row>
        <Row style={{ justifyContent: 'center' }} gap={6}>
          <Muted>{t('speed')}</Muted>
          {RATES.map((r) => (
            <Pressable
              key={r}
              accessibilityRole="button"
              accessibilityState={{ selected: rate === r }}
              accessibilityLabel={`${t('speed')} ${r}×`}
              onPress={() => changeRate(r)}
              style={[styles.rate, rate === r && { backgroundColor: colors.primary, borderColor: colors.primary }]}
            >
              <Body style={{ fontSize: 13, fontWeight: '700' }} color={rate === r ? colors.onPrimary : colors.text}>
                {lang === 'fr' ? String(r).replace('.', ',') : String(r)}×
              </Body>
            </Pressable>
          ))}
        </Row>
    </View>
  );
}

function RoundBtn({ icon, label, onPress }: { icon: keyof typeof Ionicons.glyphMap; label: string; onPress: () => void }) {
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={label} onPress={onPress} style={({ pressed }) => [styles.round, pressed && { opacity: 0.7 }]}>
      <Ionicons name={icon} size={20} color={colors.primary} />
      <Muted style={{ fontSize: 10, marginTop: -2 }}>5 s</Muted>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  box: { backgroundColor: colors.bg, borderRadius: radius.lg, padding: space.md, gap: space.sm, borderWidth: 1, borderColor: colors.border },
  play: { width: 64, height: 64, borderRadius: 32, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  round: { width: 48, height: 48, borderRadius: 24, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colors.border },
  rate: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 999, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface, minWidth: 48, alignItems: 'center' },
});
