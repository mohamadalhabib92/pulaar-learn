import type { AudioSource } from 'expo-audio';
import { useEffect, useState } from 'react';
import { findBundled, Tag } from '../data/recordings';
import { loadImportUri } from './audioFiles';
import { appStore } from './store';

export type RecView = {
  id: string;
  kind: 'bundled' | 'import';
  title: string;
  tag: Tag;
  lessonId: string | null;
  durationS: number | null;
  transcript: string;
  createdAt: number | null;
  module: number | null;
};

export function useRecordingMeta(id: string, lang: 'fr' | 'en'): RecView | null {
  const s = appStore.useStore();
  const b = findBundled(id);
  if (b)
    return { id, kind: 'bundled', title: b.title[lang], tag: b.tag, lessonId: b.lessonId, durationS: b.durationS, transcript: s.transcripts[id] ?? '', createdAt: null, module: b.source };
  const m = s.imports.find((x) => x.id === id);
  if (!m) return null;
  return { id, kind: 'import', title: m.title, tag: m.tag, lessonId: m.lessonId, durationS: m.durationS, transcript: m.transcript, createdAt: m.createdAt, module: null };
}

/** Résout la source audio : module embarqué, ou fichier importé (chargé de façon asynchrone). */
export function useRecordingSource(id: string): { source: AudioSource | null; loading: boolean } {
  const b = findBundled(id);
  const meta = appStore.useStore().imports.find((x) => x.id === id);
  const [state, setState] = useState<{ source: AudioSource | null; loading: boolean }>(() =>
    b ? { source: b.source, loading: false } : { source: null, loading: !!meta },
  );
  useEffect(() => {
    if (b) {
      setState({ source: b.source, loading: false });
      return;
    }
    if (!meta) {
      setState({ source: null, loading: false });
      return;
    }
    let alive = true;
    let created: string | null = null;
    setState({ source: null, loading: true });
    loadImportUri(meta)
      .then((uri) => {
        if (uri?.startsWith('blob:')) created = uri;
        if (alive) setState({ source: uri ? { uri } : null, loading: false });
      })
      .catch(() => alive && setState({ source: null, loading: false }));
    return () => {
      alive = false;
      if (created) URL.revokeObjectURL(created);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, meta?.uri, meta?.storage]);
  return state;
}
