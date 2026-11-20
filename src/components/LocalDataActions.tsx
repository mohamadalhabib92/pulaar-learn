import React, { useState } from 'react';
import { Text, TextInput, View } from 'react-native';
import { useI18n } from '../lib/i18n';
import {
  initialLocalDataUi,
  phraseShownToUser,
  rawForDisplay,
  reduceLocalData,
  type DeletionPlan,
  type LocalDataEvent,
} from '../lib/localDataUi';
import { colors, radius, space } from '../theme';
import { Body, Button, Muted } from './ui';

/**
 * Export, réinitialisation et effacement.
 * Le profil brut n’est lu qu’au moment où rawForDisplay l’autorise.
 */
export function LocalDataActions({
  readable,
  includeProgressReset,
  readRaw,
  onPlan,
}: {
  readable: boolean;
  includeProgressReset: boolean;
  readRaw: () => string | null;
  onPlan: (plan: DeletionPlan) => void;
}) {
  const { t } = useI18n();
  const [ui, setUi] = useState(initialLocalDataUi);
  const dispatch = (event: LocalDataEvent) => {
    const step = reduceLocalData(ui, event, { readable });
    setUi(step.ui);
    if (step.plan) onPlan(step.plan);
  };
  const raw = rawForDisplay(ui, readRaw);
  const phrase = phraseShownToUser();

  return (
    <View style={{ gap: space.sm }}>
      {ui.pending === 'export' ? (
        <View style={{ gap: space.sm }} accessibilityLiveRegion="polite">
          <Body>{t('rawDisclosure')}</Body>
          <Button label={t('confirmExport')} onPress={() => dispatch({ type: 'confirm-export' })} />
          <Button variant="secondary" label={t('cancelData')} onPress={() => dispatch({ type: 'cancel' })} />
        </View>
      ) : null}

      {raw != null ? (
        <View style={{ gap: space.sm }}>
          <Body>{t('rawDisclosure')}</Body>
          <Text accessibilityLabel={t('rawDisclosure')} selectable style={{ color: colors.text }}>
            {raw}
          </Text>
          <Button variant="secondary" label={t('hideRaw')} onPress={() => dispatch({ type: 'hide-raw' })} />
        </View>
      ) : null}

      {ui.pending === null && raw == null ? (
        <Button variant="ghost" label={t('requestExport')} onPress={() => dispatch({ type: 'request-export' })} />
      ) : null}

      {includeProgressReset && ui.pending === 'reset-progress' ? (
        <View style={{ gap: space.sm }} accessibilityLiveRegion="polite">
          <Body>{t('resetProgressHelp')}</Body>
          <Button variant="danger" label={t('confirmReset')} onPress={() => dispatch({ type: 'confirm-reset' })} />
          <Button variant="secondary" label={t('cancelData')} onPress={() => dispatch({ type: 'cancel' })} />
        </View>
      ) : null}
      {includeProgressReset && ui.pending === null && raw == null ? (
        <Button variant="ghost" label={t('resetProgress')} onPress={() => dispatch({ type: 'request-reset' })} />
      ) : null}

      {ui.pending === 'delete-all' ? (
        <View style={{ gap: space.sm }} accessibilityLiveRegion="polite">
          <Body>{readable ? t('deleteAllHelp') : t('deleteUnreadableHelp')}</Body>
          <Body>{t('deletePhraseHelp')}</Body>
          <Text accessibilityLabel={t('deletePhraseLabel')} selectable style={{ color: colors.text, fontWeight: '700' }}>
            {phrase}
          </Text>
          <TextInput
            value={ui.phraseDraft}
            onChangeText={(value) => dispatch({ type: 'set-phrase', phrase: value })}
            autoCapitalize="none"
            autoCorrect={false}
            accessibilityLabel={t('deletePhraseLabel')}
            style={{
              minHeight: 44,
              borderWidth: 1,
              borderColor: colors.border,
              borderRadius: radius.sm,
              paddingHorizontal: space.sm,
              color: colors.text,
            }}
          />
          <Button variant="danger" label={t('confirmDeleteAll')} onPress={() => dispatch({ type: 'confirm-delete' })} />
          <Button variant="secondary" label={t('cancelData')} onPress={() => dispatch({ type: 'cancel' })} />
        </View>
      ) : null}
      {ui.pending === null && raw == null ? (
        <Button variant="ghost" label={t('deleteAll')} onPress={() => dispatch({ type: 'request-delete' })} />
      ) : null}

      {ui.notice === 'phrase-mismatch' ? <Muted accessibilityLiveRegion="polite">{t('deleteMismatch')}</Muted> : null}
      {ui.notice === 'progress-reset' ? <Muted accessibilityLiveRegion="polite" color={colors.ok}>{t('resetDone')}</Muted> : null}
      {ui.notice === 'deleted' ? <Muted accessibilityLiveRegion="polite" color={colors.ok}>{t('deleteDone')}</Muted> : null}
    </View>
  );
}
