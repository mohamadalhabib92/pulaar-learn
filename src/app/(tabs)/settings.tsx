import React, { useState } from 'react';
import { Linking, Switch } from 'react-native';
import { Body, Button, Card, Chip, H1, H3, Muted, Row, Screen } from '../../components/ui';
import { SOURCE } from '../../data/lessons';
import { JANNGU } from '../../data/recordings';
import { LANGS } from '../../i18n/strings';
import { useI18n } from '../../lib/i18n';
import { appStore, resetProgress } from '../../lib/store';
import { colors, space } from '../../theme';

export default function Settings() {
  const { t, lang, setLang } = useI18n();
  const s = appStore.useStore();
  const [confirm, setConfirm] = useState(false);
  const [done, setDone] = useState(false);
  return (
    <Screen>
      <H1>{t('settings')}</H1>
      <Card style={{ gap: space.sm }}>
        <H3>{t('language')}</H3>
        <Row>
          {LANGS.map((l) => (
            <Chip key={l.code} label={l.label} active={lang === l.code} onPress={() => setLang(l.code)} />
          ))}
        </Row>
      </Card>
      <Card style={{ gap: space.sm }}>
        <Row style={{ justifyContent: 'space-between' }}>
          <H3 style={{ flex: 1 }}>{t('questMode')}</H3>
          <Switch
            accessibilityLabel={t('questMode')}
            value={s.questEnabled}
            onValueChange={(v) => appStore.set({ questEnabled: v })}
            trackColor={{ true: colors.primary, false: colors.border }}
            thumbColor={colors.surface}
          />
        </Row>
        <Muted>{t('questModeText')}</Muted>
        {s.questEnabled ? (
          <>
            <Muted style={{ fontWeight: '700' }}>{t('goal')}</Muted>
            <Row>
              {[10, 30, 50].map((g) => (
                <Chip key={g} label={`${g} XP`} active={s.dailyGoal === g} onPress={() => appStore.set({ dailyGoal: g })} />
              ))}
            </Row>
          </>
        ) : null}
      </Card>
      <Card style={{ gap: space.sm }}>
        <H3>{t('data')}</H3>
        <Muted>{t('dataText')}</Muted>
        <Button
          variant={confirm ? 'danger' : 'ghost'}
          label={confirm ? t('confirmReset') : t('resetProgress')}
          onPress={() => {
            if (!confirm) return setConfirm(true);
            resetProgress();
            setConfirm(false);
            setDone(true);
          }}
        />
        {done ? <Muted color={colors.ok}>{t('resetDone')}</Muted> : null}
      </Card>
      <Card style={{ gap: space.sm }}>
        <H3>{t('phase2')}</H3>
        <Muted>{t('phase2Text')}</Muted>
      </Card>
      <Card style={{ gap: space.sm }}>
        <H3>{t('about')}</H3>
        <Body>{t('aboutText')}</Body>
        <Muted>{SOURCE.title}</Muted>
        <Muted>{SOURCE.license[lang]}</Muted>
        <Body color={colors.primary} accessibilityRole="link" onPress={() => Linking.openURL(SOURCE.url).catch(() => undefined)}>livelingua.com</Body>
        <Body color={colors.primary} accessibilityRole="link" onPress={() => Linking.openURL(JANNGU.site).catch(() => undefined)}>janngu.com</Body>
        <Muted>Pulaar Learn · v1.0.0</Muted>
      </Card>
    </Screen>
  );
}
