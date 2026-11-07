import React from 'react';
import { Text, View } from 'react-native';
import { useI18n } from '../lib/i18n';
import { preserveFieldName, preserveMessageKey } from '../lib/preserve';
import { colors, space } from '../theme';
import { Body, Button, H1, Muted, Screen, Skeleton } from './ui';

/** Squelettes pendant la lecture locale. Le mot « Loading » n’est pas affiché. */
export function BootSkeleton() {
  return (
    <Screen scroll={false}>
      <Skeleton height={22} width="40%" />
      <Skeleton height={96} />
      <Skeleton height={18} width="55%" />
      <Skeleton height={72} />
      <Skeleton height={72} />
      <Skeleton height={72} />
    </Screen>
  );
}

/** Après 8 s sans stockage local : les leçons (fichiers de l’app) restent disponibles. */
export function BootFallback({ onRetry, onOffline }: { onRetry: () => void; onOffline: () => void }) {
  const { t } = useI18n();
  return (
    <Screen scroll={false}>
      <View style={{ gap: space.md, paddingTop: space.xl }}>
        <H1>{t('bootOfflineTitle')}</H1>
        <Body color={colors.muted}>{t('bootOfflineText')}</Body>
        <Button label={t('bootRetry')} onPress={onRetry} />
        <Button variant="secondary" label={t('continueOffline')} onPress={onOffline} />
      </View>
    </Screen>
  );
}

/** Fichier local refusé : le texte brut reste lisible et n’est pas réécrit. */
export function BootIncompatible({
  reason,
  raw,
  onRetry,
  onOffline,
}: {
  reason: string | null;
  raw: string | null;
  onRetry: () => void;
  onOffline: () => void;
}) {
  const { t } = useI18n();
  const field = preserveFieldName(reason);
  return (
    <Screen>
      <View style={{ gap: space.md, paddingTop: space.xl }}>
        <H1>{t('bootIncompatibleTitle')}</H1>
        <Body color={colors.muted}>{t('bootIncompatibleText')}</Body>
        <Body>{field ? t(preserveMessageKey(reason), { field }) : t(preserveMessageKey(reason))}</Body>
        <Muted>{t('preserveExport')}</Muted>
        <Text accessibilityLabel={t('preserveExport')} selectable style={{ color: colors.text }}>
          {raw ?? ''}
        </Text>
        <Button label={t('bootRetry')} onPress={onRetry} />
        <Button variant="secondary" label={t('continueOffline')} onPress={onOffline} />
        <Muted>{t('preserveContinueNote')}</Muted>
      </View>
    </Screen>
  );
}
