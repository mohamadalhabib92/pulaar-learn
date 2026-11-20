import React, { useEffect, useState } from 'react';
import { TextInput } from 'react-native';
import { useI18n } from '../lib/i18n';
import { setTranscript } from '../lib/store';
import { useVerre } from '../lib/verre';
import { Badge, Button, Card, H3, Muted, Row, useInputStyle } from './ui';

export function TranscriptEditor({ recId, value }: { recId: string; value: string }) {
  const { t } = useI18n();
  const { colors, space } = useVerre();
  const input = useInputStyle();
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
        style={[input, { minHeight: 110, textAlignVertical: 'top' }]}
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
