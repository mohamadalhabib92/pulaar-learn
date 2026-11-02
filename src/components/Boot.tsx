import React from 'react';
import { View } from 'react-native';
import { useI18n } from '../lib/i18n';
import { colors, space } from '../theme';
import { Body, Button, H1, Screen, Skeleton } from './ui';

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
