import React from 'react';
import { Linking, Switch } from 'react-native';
import { LocalDataActions } from '../../components/LocalDataActions';
import { Body, Card, Chip, H1, H3, Muted, Row, Screen } from '../../components/ui';
import { SOURCE } from '../../data/lessons';
import { JANNGU } from '../../data/recordings';
import { LANGS } from '../../i18n/strings';
import { deleteImportFile } from '../../lib/audioFiles';
import type { DeletionPlan } from '../../lib/localDataUi';
import { useI18n } from '../../lib/i18n';
import { DELETE_CONFIRMATION, preserveFieldName, preserveMessageKey } from '../../lib/preserve';
import type { AppState } from '../../lib/store';
import { appStore, resetProgress } from '../../lib/store';
import { colors, space } from '../../theme';

export default function Settings() {
  const { t, lang, setLang } = useI18n();
  const s = appStore.useStore();
  const preserve = appStore.usePreserve();
  const blocked = preserve.kind === 'malformed' || preserve.kind === 'incompatible';
  const field = preserveFieldName(preserve.reason);
  const onPlan = (plan: DeletionPlan) => {
    if (plan.resetProgress) {
      resetProgress();
      return;
    }
    void applyFullDelete(plan);
  };
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
        <H3>{t('reduceMotion')}</H3>
        <Muted>{t('reduceMotionText')}</Muted>
        <Row style={{ flexWrap: 'wrap' }}>
          {([
            ['system', t('reduceSystem')],
            ['on', t('reduceOn')],
            ['off', t('reduceOff')],
          ] as const).map(([value, label]) => (
            <Chip key={value} label={label} active={s.reduceMotion === value} onPress={() => appStore.set({ reduceMotion: value satisfies AppState['reduceMotion'] })} />
          ))}
        </Row>
      </Card>
      {blocked ? (
        <Card style={{ gap: space.sm }}>
          <H3>{t('bootIncompatibleTitle')}</H3>
          <Body color={colors.muted}>{t('bootIncompatibleText')}</Body>
          <Body>{field ? t(preserveMessageKey(preserve.reason), { field }) : t(preserveMessageKey(preserve.reason))}</Body>
        </Card>
      ) : null}
      <Card style={{ gap: space.sm }}>
        <H3>{t('data')}</H3>
        <Muted>{t('dataText')}</Muted>
        <LocalDataActions readable={!blocked} includeProgressReset readRaw={() => appStore.exportRaw()} onPlan={onPlan} />
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

async function applyFullDelete(plan: DeletionPlan) {
  if (plan.deleteListedAudio) {
    const listed = appStore.get().imports.slice();
    for (const item of listed) await deleteImportFile(item);
  }
  if (plan.removeReadableKey) appStore.deleteStored(DELETE_CONFIRMATION);
  if (plan.removeUnreadableKey) appStore.discardUnreadable(DELETE_CONFIRMATION);
}
