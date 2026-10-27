import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import { Platform, TextInput, View } from 'react-native';
import { BackBar } from '../components/BackBar';
import { Body, Button, Card, Chip, H1, H3, Muted, Row, Screen } from '../components/ui';
import { LESSONS } from '../data/lessons';
import { Tag, TAGS } from '../data/recordings';
import { ACCEPTED, extOf, probeDurationWeb, storeImport } from '../lib/audioFiles';
import { useI18n } from '../lib/i18n';
import { addImport } from '../lib/store';
import { colors, radius, space } from '../theme';

type Picked = { uri: string; name: string; mimeType?: string; file?: File };

export default function ImportScreen() {
  const { t } = useI18n();
  const params = useLocalSearchParams<{ lesson?: string }>();
  const [file, setFile] = useState<Picked | null>(null);
  const [title, setTitle] = useState('');
  const [tag, setTag] = useState<Tag>('phrases');
  const [lessonId, setLessonId] = useState<string | null>(params.lesson && LESSONS.some((l) => l.id === params.lesson) ? String(params.lesson) : null);
  const [transcript, setTranscript] = useState('');
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const pick = async () => {
    setMsg(null);
    try {
      const res = await DocumentPicker.getDocumentAsync({ type: ['audio/*'], copyToCacheDirectory: true, multiple: false });
      if (res.canceled || !res.assets?.length) return;
      const a = res.assets[0];
      if (!ACCEPTED.includes(extOf(a.name)) && !(a.mimeType ?? '').startsWith('audio/')) {
        setMsg({ ok: false, text: t('badType') });
        return;
      }
      setFile({ uri: a.uri, name: a.name, mimeType: a.mimeType, file: (a as { file?: File }).file });
      if (!title) setTitle(a.name.replace(/\.[^.]+$/, '').replace(/[_-]+/g, ' '));
    } catch (e) {
      setMsg({ ok: false, text: t('importError', { e: e instanceof Error ? e.message : String(e) }) });
    }
  };

  const save = async () => {
    if (!file) return setMsg({ ok: false, text: t('needFile') });
    if (!title.trim()) return setMsg({ ok: false, text: t('needTitle') });
    setBusy(true);
    setMsg(null);
    try {
      const id = `imp-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
      const stored = await storeImport(id, file);
      let durationS: number | null = null;
      if (Platform.OS === 'web' && file.file) durationS = await probeDurationWeb(file.file);
      addImport({
        id,
        title: title.trim(),
        tag,
        lessonId,
        transcript: transcript.trim(),
        createdAt: Date.now(),
        durationS,
        fileName: file.name,
        mime: file.mimeType ?? 'audio/mpeg',
        storage: stored.storage,
        uri: stored.uri,
        langue: 'pulaar',
        source: 'Upload Mohamed',
      });
      setMsg({ ok: true, text: t('importDone') });
      router.replace(`/recording/${id}`);
    } catch (e) {
      setMsg({ ok: false, text: t('importError', { e: e instanceof Error ? e.message : String(e) }) });
    } finally {
      setBusy(false);
    }
  };

  const input = { borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, padding: space.md, fontSize: 16, color: colors.text, backgroundColor: colors.surface } as const;

  return (
    <Screen>
      <BackBar label={t('back')} />
      <H1>{t('importTitle')}</H1>
      <Card style={{ gap: space.sm }}>
        <Button variant="secondary" label={t('pickFile')} icon={<Ionicons name="folder-open-outline" size={18} color={colors.primary} />} onPress={pick} />
        {file ? <Body>🎵 {t('fileChosen', { f: file.name })}</Body> : null}
      </Card>
      <View style={{ gap: space.xs }}>
        <H3>{t('title')}</H3>
        <TextInput accessibilityLabel={t('title')} value={title} onChangeText={setTitle} placeholder={t('titlePh')} placeholderTextColor={colors.muted} style={input} />
      </View>
      <View style={{ gap: space.xs }}>
        <H3>{t('tag')}</H3>
        <Row style={{ flexWrap: 'wrap' }}>
          {TAGS.map((g) => (
            <Chip key={g} label={t(`tag_${g}` as 'tag_autre')} active={tag === g} onPress={() => setTag(g)} />
          ))}
        </Row>
      </View>
      <View style={{ gap: space.xs }}>
        <H3>{t('lesson')}</H3>
        <Row style={{ flexWrap: 'wrap' }}>
          <Chip label={t('none')} active={!lessonId} onPress={() => setLessonId(null)} />
          {LESSONS.map((l) => (
            <Chip key={l.id} label={String(l.n)} active={lessonId === l.id} onPress={() => setLessonId(l.id)} />
          ))}
        </Row>
      </View>
      <View style={{ gap: space.xs }}>
        <H3>{t('transcriptOpt')}</H3>
        <TextInput accessibilityLabel={t('transcriptOpt')} multiline value={transcript} onChangeText={setTranscript} placeholder={t('toComplete')} placeholderTextColor={colors.muted} style={[input, { minHeight: 100, textAlignVertical: 'top' }]} />
      </View>
      <Muted>pulaar · {t('uploadSource')}</Muted>
      {msg ? <Body color={msg.ok ? colors.ok : colors.danger}>{msg.text}</Body> : null}
      <Button label={busy ? t('importing') : t('save')} disabled={busy} onPress={save} />
    </Screen>
  );
}
