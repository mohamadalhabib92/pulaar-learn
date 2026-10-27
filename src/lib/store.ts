import type { Lang } from '../i18n/strings';
import type { Tag } from '../data/recordings';
import { LESSONS } from '../data/lessons';
import { createPersistedStore } from './persist';

export type LessonProgress = { seen: boolean; best: number; attempts: number };
export type ImportMeta = {
  id: string;
  title: string;
  tag: Tag;
  lessonId: string | null;
  transcript: string;
  createdAt: number;
  durationS: number | null;
  fileName: string;
  mime: string;
  /** web : blob dans IndexedDB ; natif : fichier copié dans le dossier documents. */
  storage: 'idb' | 'file';
  uri: string | null;
  langue: 'pulaar';
  source: 'Upload Mohamed';
};

export type AppState = {
  lang: Lang;
  questEnabled: boolean;
  dailyGoal: number;
  xp: number;
  todayXp: number;
  todayDay: string | null;
  streak: number;
  bestStreak: number;
  lastActiveDay: string | null;
  badges: string[];
  lessons: Record<string, LessonProgress>;
  listened: string[];
  jannguOpened: boolean;
  bossBest: number;
  imports: ImportMeta[];
  transcripts: Record<string, string>;
  rate: number;
};

const initial: AppState = {
  lang: 'fr',
  questEnabled: true,
  dailyGoal: 30,
  xp: 0,
  todayXp: 0,
  todayDay: null,
  streak: 0,
  bestStreak: 0,
  lastActiveDay: null,
  badges: [],
  lessons: {},
  listened: [],
  jannguOpened: false,
  bossBest: 0,
  imports: [],
  transcripts: {},
  rate: 1,
};

export const appStore = createPersistedStore<AppState>('pulaar:v1', initial);

export const BADGES: { id: string; icon: string; fr: string; en: string; test: (s: AppState) => boolean }[] = [
  { id: 'first-listen', icon: '🎧', fr: 'Première écoute', en: 'First listen', test: (s) => s.listened.length >= 1 },
  { id: 'ear-5', icon: '👂', fr: 'Oreille fine (5 écoutes)', en: 'Sharp ear (5 listens)', test: (s) => s.listened.length >= 5 },
  { id: 'first-lesson', icon: '🌱', fr: 'Première leçon maîtrisée', en: 'First lesson mastered', test: (s) => Object.values(s.lessons).some((l) => l.best >= 80) },
  { id: 'all-lessons', icon: '🏆', fr: '10 leçons maîtrisées', en: '10 lessons mastered', test: (s) => LESSONS.every((l) => (s.lessons[l.id]?.best ?? 0) >= 80) },
  { id: 'boss', icon: '🗣️', fr: 'Boss phonétique vaincu', en: 'Phonetics boss defeated', test: (s) => s.bossBest >= 80 },
  { id: 'streak-3', icon: '🔥', fr: 'Série de 3 jours', en: '3-day streak', test: (s) => s.bestStreak >= 3 },
  { id: 'streak-7', icon: '⚡', fr: 'Série de 7 jours', en: '7-day streak', test: (s) => s.bestStreak >= 7 },
  { id: 'xp-100', icon: '⭐', fr: '100 XP', en: '100 XP', test: (s) => s.xp >= 100 },
  { id: 'xp-500', icon: '🌟', fr: '500 XP', en: '500 XP', test: (s) => s.xp >= 500 },
  { id: 'first-import', icon: '📥', fr: 'Premier import', en: 'First import', test: (s) => s.imports.length >= 1 },
  { id: 'janngu', icon: '🎙️', fr: 'À l’écoute de Janngu', en: 'Listening to Janngu', test: (s) => s.jannguOpened },
];

export const dayKey = (d = new Date()) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const yesterdayKey = () => {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return dayKey(d);
};

/** Applique un patch, met à jour la série du jour et attribue les badges. */
function act(fn: (s: AppState) => Partial<AppState>, xpGain = 0) {
  appStore.set((s) => {
    const today = dayKey();
    let { streak, bestStreak, todayXp, todayDay } = s;
    if (s.lastActiveDay !== today) streak = s.lastActiveDay === yesterdayKey() ? streak + 1 : 1;
    if (todayDay !== today) {
      todayDay = today;
      todayXp = 0;
    }
    bestStreak = Math.max(bestStreak, streak);
    const next: AppState = { ...s, ...fn(s), streak, bestStreak, lastActiveDay: today, todayDay, todayXp: todayXp + xpGain, xp: s.xp + xpGain };
    const badges = new Set(next.badges);
    for (const b of BADGES) if (b.test(next)) badges.add(b.id);
    return { ...next, badges: Array.from(badges) };
  });
}

export const markListened = (recId: string) =>
  act((s) => (s.listened.includes(recId) ? {} : { listened: [...s.listened, recId] }), appStore.get().listened.includes(recId) ? 0 : 5);

export const markSeen = (lessonId: string) =>
  act((s) => {
    const p = s.lessons[lessonId] ?? { seen: false, best: 0, attempts: 0 };
    return p.seen ? {} : { lessons: { ...s.lessons, [lessonId]: { ...p, seen: true } } };
  }, appStore.get().lessons[lessonId]?.seen ? 0 : 5);

export const finishPractice = (lessonId: string, pct: number, xp: number) =>
  act((s) => {
    const p = s.lessons[lessonId] ?? { seen: false, best: 0, attempts: 0 };
    return { lessons: { ...s.lessons, [lessonId]: { seen: true, attempts: p.attempts + 1, best: Math.max(p.best, pct) } } };
  }, xp);

export const finishBoss = (pct: number, xp: number) => act((s) => ({ bossBest: Math.max(s.bossBest, pct) }), xp);
export const openedJanngu = () => act(() => ({ jannguOpened: true }));
export const addImport = (m: ImportMeta) => act((s) => ({ imports: [m, ...s.imports] }), 10);
export const removeImportMeta = (id: string) => appStore.set((s) => ({ imports: s.imports.filter((m) => m.id !== id) }));
export const setTranscript = (recId: string, text: string) =>
  appStore.set((s) => {
    if (recId.startsWith('imp-')) return { imports: s.imports.map((m) => (m.id === recId ? { ...m, transcript: text } : m)) };
    return { transcripts: { ...s.transcripts, [recId]: text } };
  });

/** Réinitialise la progression mais garde langue, réglages, imports et transcriptions. */
export const resetProgress = () =>
  appStore.set((s) => ({ ...initial, lang: s.lang, questEnabled: s.questEnabled, dailyGoal: s.dailyGoal, imports: s.imports, transcripts: s.transcripts, rate: s.rate }));

export const lessonStatus = (s: AppState, id: string): 'mastered' | 'seen' | 'new' => {
  const p = s.lessons[id];
  if (!p) return 'new';
  if (p.best >= 80) return 'mastered';
  return p.seen ? 'seen' : 'new';
};
