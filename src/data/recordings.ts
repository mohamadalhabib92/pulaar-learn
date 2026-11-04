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

/**
 * Pack « Uploads Mohamed — 03.11.2026 » : 5 MP3 nouveaux (upload-09 à upload-13), doublons déjà retirés.
 * Contenu non écouté : titres PROVISOIRES, à confirmer par Mohamed. Aucune leçon associée, aucune transcription inventée.
 * Le pack du 2026-09-17 (BUNDLED ci-dessus) reste intact.
 */
export type NewUploadRecording = Omit<BundledRecording, 'lessonId'> & {
  lessonId: null;
  /** false tant que Mohamed n’a pas confirmé le titre. */
  titleConfirmed: boolean;
  receivedOn: string;
};

const mkNov = (n: number, durationS: number, source: number): NewUploadRecording => ({
  id: `up-${n}`,
  n,
  title: { fr: `Upload Mohamed n° ${n} (titre à confirmer)`, en: `Mohamed upload #${n} (title to be confirmed)` },
  lessonId: null,
  tag: 'autre',
  durationS,
  source,
  file: `upload-${String(n).padStart(2, '0')}.mp3`,
  titleConfirmed: false,
  receivedOn: '2026-11-03',
});

export const BUNDLED_NOV: NewUploadRecording[] = [
  mkNov(9, 123.9, require('../../assets/audio/upload-09.mp3')),
  mkNov(10, 96.8, require('../../assets/audio/upload-10.mp3')),
  mkNov(11, 79.3, require('../../assets/audio/upload-11.mp3')),
  mkNov(12, 180.4, require('../../assets/audio/upload-12.mp3')),
  mkNov(13, 177.0, require('../../assets/audio/upload-13.mp3')),
];

export type AnyBundled = BundledRecording | NewUploadRecording;
export const ALL_BUNDLED: AnyBundled[] = [...BUNDLED, ...BUNDLED_NOV];
export const isNovUpload = (id: string) => BUNDLED_NOV.some((r) => r.id === id);

export const findBundled = (id: string): AnyBundled | undefined => ALL_BUNDLED.find((r) => r.id === id);
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
