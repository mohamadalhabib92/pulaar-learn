/**
 * Pack « Uploads Mohamed » : 8 MP3 en pulaar fournis par Mohamed le 2026-09-17.
 * Le lien avec les leçons 1–8 est PROVISOIRE : c'est une hypothèse fondée sur l'ordre des durées, titres à confirmer.
 * Transcriptions : à compléter. Elles ne sont jamais générées par une IA.
 */
export type Tag = 'alphabet' | 'salutations' | 'nombres' | 'vocabulaire' | 'phrases' | 'conte' | 'autre';
export const TAGS: Tag[] = ['alphabet', 'salutations', 'nombres', 'vocabulaire', 'phrases', 'conte', 'autre'];

export type BundledRecording = {
  id: string;
  n: number;
  title: { fr: string; en: string };
  lessonId: string;
  tag: Tag;
  durationS: number;
  source: number;
  file: string;
};

const mk = (n: number, lessonId: string, tag: Tag, durationS: number, source: number): BundledRecording => ({
  id: `up-${n}`,
  n,
  title: { fr: `Upload Mohamed n° ${n}`, en: `Mohamed upload #${n}` },
  lessonId,
  tag,
  durationS,
  source,
  file: `upload-0${n}.mp3`,
});

export const BUNDLED: BundledRecording[] = [
  mk(1, 'pc-1', 'alphabet', 71.0, require('../../assets/audio/upload-01.mp3')),
  mk(2, 'pc-2', 'vocabulaire', 89.3, require('../../assets/audio/upload-02.mp3')),
  mk(3, 'pc-3', 'salutations', 97.7, require('../../assets/audio/upload-03.mp3')),
  mk(4, 'pc-4', 'nombres', 118.7, require('../../assets/audio/upload-04.mp3')),
  mk(5, 'pc-5', 'vocabulaire', 140.8, require('../../assets/audio/upload-05.mp3')),
  mk(6, 'pc-6', 'vocabulaire', 159.3, require('../../assets/audio/upload-06.mp3')),
  mk(7, 'pc-7', 'phrases', 172.7, require('../../assets/audio/upload-07.mp3')),
  mk(8, 'pc-8', 'phrases', 178.7, require('../../assets/audio/upload-08.mp3')),
];

export const findBundled = (id: string) => BUNDLED.find((r) => r.id === id);
export const bundledForLesson = (lessonId: string) => BUNDLED.find((r) => r.lessonId === lessonId);

export const JANNGU = {
  site: 'https://www.janngu.com/',
  telegram: 'https://t.me/janngupulaar',
  tiktok: 'https://www.tiktok.com/@janngu2580',
  email: 'contact@janngu.com',
};

export const WONNOO = {
  title: 'Wonnoo ɗoo — Tinndi e ɗemngal Pulaar',
  pages: 72,
  tales: 15,
  firstTale: 'Sammba e ɓii Mbaroodi',
};

export const fmtTime = (s: number) => {
  if (!isFinite(s) || s < 0) s = 0;
  const m = Math.floor(s / 60);
  const r = Math.floor(s % 60);
  return `${m}:${r.toString().padStart(2, '0')}`;
};
