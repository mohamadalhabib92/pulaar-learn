import React from 'react';
import { Linking } from 'react-native';
import { BackBar } from '../../components/BackBar';
import { Badge, Body, Button, Card, H1, H3, Muted, PulaarText, Row, Screen } from '../../components/ui';
import { TARO, TARO_PROGRESSION } from '../../data/taro';
import { useI18n } from '../../lib/i18n';
import { colors, space } from '../../theme';

export default function TaroScreen() {
  const { t, lang } = useI18n();
  return (
    <Screen>
      <BackBar label={t('back')} />
      <H1>{t('taroTitle')}</H1>
      <Body color={colors.muted}>{t('taroIntro')}</Body>
      {TARO_PROGRESSION.map((step) => (
        <Card key={step.lessons} style={{ gap: space.xs, paddingVertical: space.md }}>
          <Row style={{ flexWrap: 'wrap' }}>
            <H3 style={{ flex: 1 }}>{t('taroLesson', { l: step.lessons })}</H3>
            {step.note ? <Badge label={step.note} tone="info" /> : null}
          </Row>
          {step.letters.length ? (
            <PulaarText bold style={{ fontSize: 22 }}>
              {step.letters.join('  ·  ')}
            </PulaarText>
          ) : null}
        </Card>
      ))}
      <Card style={{ gap: space.xs }}>
        <Muted style={{ fontWeight: '700' }}>{TARO.title}</Muted>
        <Muted>{TARO.publisher}, {TARO.year}</Muted>
        <Muted>
          {t('taroLicense')} : {TARO.license}
        </Muted>
        <Muted>{TARO.attribution[lang]}</Muted>
        <Body color={colors.primary} onPress={() => Linking.openURL(TARO.licenseUrl).catch(() => undefined)} accessibilityRole="link">
          creativecommons.org/licenses/by/4.0/igo
        </Body>
        <Button small variant="secondary" label={t('taroOpenSource')} onPress={() => Linking.openURL(TARO.sourceUrl).catch(() => undefined)} style={{ alignSelf: 'flex-start' }} />
      </Card>
    </Screen>
  );
}
