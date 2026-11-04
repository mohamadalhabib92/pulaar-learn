import { LESSONS, SOURCE } from './lessons';
import { BUNDLED, BUNDLED_NOV } from './recordings';

/**
 * Packs séparés. Le contenu des leçons et des MP3 n’est pas dupliqué ici :
 * les leçons restent dans lessons.ts, les fichiers dans recordings.ts.
 * Le pack Gambie est vide dans ce dépôt : aucune leçon n’est inventée.
 */
export type DialectId = 'mr' | 'gm' | 'sn' | 'a_valider';
/** a_relire : texte pulaar généré ou rédigé avec une IA, à relire par un locuteur natif (jamais « validé »). */
export type ReviewStatus = 'a_completer' | 'a_relire' | 'relu' | 'valide_natif';
export type PackId = 'gambia' | 'mauritania' | 'uploads' | 'uploads_nov' | 'contes';
export type PackFilter = 'all' | PackId;

export type Provenance = {
  dialect: DialectId;
  flag: string;
  /** Toujours affiché à côté du drapeau. */
  dialectLabel: { fr: string; en: string };
  source: { fr: string; en: string };
  /** null : aucun consentement de locuteur n’est enregistré dans le dépôt. */
  speaker: null;
  speakerNote: { fr: string; en: string };
  license: { fr: string; en: string };
  review: ReviewStatus;
};

export const DIALECTS: Record<DialectId, { flag: string; fr: string; en: string }> = {
  mr: { flag: '🇲🇷', fr: 'Mauritanie', en: 'Mauritania' },
  gm: { flag: '🇬🇲', fr: 'Gambie', en: 'Gambia' },
  sn: { flag: '🇸🇳', fr: 'Sénégal', en: 'Senegal' },
  a_valider: { flag: '', fr: 'Dialecte à valider', en: 'Dialect to be validated' },
};

const speakerNote = {
  fr: 'Non indiqué (pas de consentement enregistré)',
  en: 'Not stated (no recorded consent)',
};

export const MAURITANIA_PROVENANCE: Provenance = {
  dialect: 'mr',
  flag: DIALECTS.mr.flag,
  dialectLabel: { fr: DIALECTS.mr.fr, en: DIALECTS.mr.en },
  source: {
    fr: 'Adapté de Peace Corps — Pulaar Language Lessons (Mauritanie)',
    en: 'Adapted from Peace Corps — Pulaar Language Lessons (Mauritania)',
  },
  speaker: null,
  speakerNote,
  license: SOURCE.license,
  review: 'a_completer',
};

export const UPLOADS_PROVENANCE: Provenance = {
  dialect: 'a_valider',
  flag: '',
  dialectLabel: { fr: DIALECTS.a_valider.fr, en: DIALECTS.a_valider.en },
  source: { fr: 'Upload Mohamed', en: 'Mohamed upload' },
  speaker: null,
  speakerNote,
  license: {
    fr: 'Fichiers fournis par Mohamed — licence à valider',
    en: 'Files provided by Mohamed — license to be validated',
  },
  review: 'a_completer',
};

export const UPLOADS_NOV_PROVENANCE: Provenance = {
  dialect: 'a_valider',
  flag: '',
  dialectLabel: { fr: DIALECTS.a_valider.fr, en: DIALECTS.a_valider.en },
  source: { fr: 'Upload Mohamed — 03.11.2026 (titres à confirmer)', en: 'Mohamed upload — 2026-11-03 (titles to be confirmed)' },
  speaker: null,
  speakerNote,
  license: {
    fr: 'Fichiers fournis par Mohamed — licence à valider',
    en: 'Files provided by Mohamed — license to be validated',
  },
  review: 'a_completer',
};

export const CONTES_PROVENANCE: Provenance = {
  dialect: 'a_valider',
  flag: '',
  dialectLabel: { fr: DIALECTS.a_valider.fr, en: DIALECTS.a_valider.en },
  source: {
    fr: 'Méthode de Mohamed (03.11.2026) — textes rédigés avec une IA',
    en: 'Mohamed’s method (2026-11-03) — texts drafted with AI',
  },
  speaker: null,
  speakerNote,
  license: {
    fr: 'Textes de la famille — lettres pulaar d’après Taro CP (CC BY 4.0 IGO)',
    en: 'Family texts — Pulaar letters after Taro CP (CC BY 4.0 IGO)',
  },
  review: 'a_relire',
};

export const GAMBIA_PROVENANCE: Provenance = {
  dialect: 'gm',
  flag: DIALECTS.gm.flag,
  dialectLabel: { fr: DIALECTS.gm.fr, en: DIALECTS.gm.en },
  source: { fr: 'Pack Gambie (Vibecode) — fichiers absents de ce dépôt', en: 'Gambia pack (Vibecode) — files are not in this repository' },
  speaker: null,
  speakerNote,
  license: { fr: 'À valider (fichiers non fournis)', en: 'To be validated (files not provided)' },
  review: 'a_completer',
};

export const PACKS: {
  id: PackId;
  flag: string;
  name: { fr: string; en: string };
  lessonIds: string[];
  recordingIds: string[];
  provenance: Provenance;
}[] = [
  {
    id: 'mauritania',
    flag: '🇲🇷',
    name: { fr: 'Mauritanie (cours Peace Corps adapté)', en: 'Mauritania (adapted Peace Corps course)' },
    lessonIds: LESSONS.map((l) => l.id),
    recordingIds: [],
    provenance: MAURITANIA_PROVENANCE,
  },
  {
    id: 'gambia',
    flag: '🇬🇲',
    name: { fr: 'Gambie (Vibecode)', en: 'Gambia (Vibecode)' },
    lessonIds: [],
    recordingIds: [],
    provenance: GAMBIA_PROVENANCE,
  },
  {
    id: 'uploads',
    flag: '',
    name: { fr: 'Uploads Mohamed', en: 'Mohamed uploads' },
    lessonIds: [],
    recordingIds: BUNDLED.map((r) => r.id),
    provenance: UPLOADS_PROVENANCE,
  },
  {
    id: 'uploads_nov',
    flag: '',
    name: { fr: 'Uploads Mohamed — 03.11.2026', en: 'Mohamed uploads — 2026-11-03' },
    lessonIds: [],
    recordingIds: BUNDLED_NOV.map((r) => r.id),
    provenance: UPLOADS_NOV_PROVENANCE,
  },
  {
    id: 'contes',
    flag: '',
    name: { fr: 'Contes pour enfants', en: 'Children’s stories' },
    // Les épisodes vivent dans contes.ts (format à 7 parties), pas dans LESSONS.
    lessonIds: [],
    recordingIds: [],
    provenance: CONTES_PROVENANCE,
  },
];

export const packById = (id: PackId) => PACKS.find((p) => p.id === id)!;

export const provenanceForLesson = (_lessonId: string): Provenance => MAURITANIA_PROVENANCE;

export const reviewLabelKey = {
  a_completer: 'reviewTodo',
  a_relire: 'reviewAi',
  relu: 'reviewRead',
  valide_natif: 'reviewNative',
} as const;
