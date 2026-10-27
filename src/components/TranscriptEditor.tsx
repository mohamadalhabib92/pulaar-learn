import React, { useEffect, useState } from 'react';
import { TextInput } from 'react-native';
import { useI18n } from '../lib/i18n';
import { setTranscript } from '../lib/store';
import { colors, radius, space } from '../theme';
import { Badge, Button, Card, H3, Muted, Row } from './ui';

export function TranscriptEditor({ recId, value }: { recId: string; value: string }) {
  const { t } = useI18n();
  const [text, setText] = useState(value);
  const [saved, setSaved] = useState(false);
  useEffect(() => setText(value), [value]);
  return (
    <Card style={{ gap: space.sm }}>
      <Row style={{ justifyContent: 'space-between' }}>
        <H3>{t('transcript')}</H3>
        {!value ? <Badge label={t('toComplete')} tone="warn" /> : null}
      </Row>
      <Muted>{t('transcriptHint')}</Muted>
      <TextInput
        accessibilityLabel={t('transcript')}
        multiline
        value={text}
        onChangeText={(v) => {
          setText(v);
          setSaved(false);
        }}
        placeholder={t('toComplete')}
        placeholderTextColor={colors.muted}
        style={{ minHeight: 110, borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, padding: space.md, fontSize: 16, color: colors.text, backgroundColor: colors.bg, textAlignVertical: 'top' }}
      />
      <Row>
        <Button
          small
          label={t('saveTranscript')}
          disabled={text === value}
          onPress={() => {
            setTranscript(recId, text.trim());
            setSaved(true);
          }}
        />
        {saved ? <Muted color={colors.ok}>✓ {t('saved')}</Muted> : null}
      </Row>
    </Card>
  );
}
