import React from 'react';
import { View } from 'react-native';
import type { Provenance } from '../data/packs';
import { reviewLabelKey } from '../data/packs';
import { useI18n } from '../lib/i18n';
import { space } from '../theme';
import { Card, DialectBadge, Muted } from './ui';

/** Dialecte, source, locuteur, licence et statut. Rien n’est marqué « validé » sans relecture. */
export function ProvenanceCard({ provenance }: { provenance: Provenance }) {
  const { t, lang } = useI18n();
  return (
    <Card style={{ gap: space.sm }}>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space.sm }}>
        <DialectBadge flag={provenance.flag || undefined} label={provenance.dialectLabel[lang]} tone={provenance.dialect === 'a_valider' ? 'warn' : 'info'} />
        <DialectBadge label={t(reviewLabelKey[provenance.review])} tone={provenance.review === 'a_completer' ? 'warn' : 'ok'} />
      </View>
      <Muted>{t('sourceLabel')} : {provenance.source[lang]}</Muted>
      <Muted>{t('speakerLabel')} : {provenance.speakerNote[lang]}</Muted>
      <Muted>{t('licenseLabel')} : {provenance.license[lang]}</Muted>
    </Card>
  );
}
