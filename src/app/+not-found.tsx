import { router } from 'expo-router';
import React from 'react';
import { Button, EmptyState, Screen } from '../components/ui';
import { useI18n } from '../lib/i18n';

export default function NotFound() {
  const { t } = useI18n();
  return (
    <Screen>
      <EmptyState title={t('notFound')} text={t('notFoundText')} action={<Button label={t('home')} onPress={() => router.replace('/')} />} />
    </Screen>
  );
}
