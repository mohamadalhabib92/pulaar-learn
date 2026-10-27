import { Item, LESSONS } from '../data/lessons';

export type Q = { prompt: string; promptIsPu: boolean; kind: 'whatMeans' | 'howSay' | 'whichSound'; options: string[]; answer: string };

export function shuffle<T>(a: T[]): T[] {
  const r = a.slice();
  for (let i = r.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [r[i], r[j]] = [r[j], r[i]];
  }
  return r;
}

/** Descriptions anglaises sans ambiguïté pour les sons « no equivalent » de l'alphabet. */
const EN_SOUND: Record<string, string> = {
  'ɓ': 'implosive b (air drawn inward)',
  'ɗ': 'implosive d (air drawn inward)',
  'ƴ': 'glottalised y',
  'ñ': 'ny as in “canyon”',
  mb: 'prenasalised m+b, one sound',
  nd: 'prenasalised n+d, one sound',
  ng: 'prenasalised n+g, one sound',
  nj: 'prenasalised n+j, one sound',
  ii: 'long i, as in “meat”',
  ee: 'long e, as in “fair”',
  aa: 'long a, as in “far”',
  oo: 'long o, as in “boy”',
  uu: 'long u, as in “food”',
};
const meaning = (it: Item, lang: 'fr' | 'en') => (lang === 'fr' ? it.fr : EN_SOUND[it.pu] ?? it.en);

function options(answer: string, pool: string[], n = 4) {
  const others = shuffle(Array.from(new Set(pool.filter((p) => p !== answer)))).slice(0, n - 1);
  return shuffle([answer, ...others]);
}

export function buildLessonQuiz(lessonId: string, lang: 'fr' | 'en', count = 10): Q[] {
  const lesson = LESSONS.find((l) => l.id === lessonId);
  if (!lesson) return [];
  const all = LESSONS.flatMap((l) => l.items);
  const pool = lesson.items.length >= 6 ? lesson.items : all;
  return shuffle(lesson.items)
    .slice(0, Math.min(count, lesson.items.length))
    .map((it, k) => {
      const toPu = lessonId === 'pc-1' ? true : k % 2 === 1;
      if (toPu) {
        return { kind: lessonId === 'pc-1' ? 'whichSound' : 'howSay', prompt: meaning(it, lang), promptIsPu: false, answer: it.pu, options: options(it.pu, pool.map((p) => p.pu)) } as Q;
      }
      return { kind: 'whatMeans', prompt: it.pu, promptIsPu: true, answer: meaning(it, lang), options: options(meaning(it, lang), pool.map((p) => meaning(p, lang))) } as Q;
    });
}

/** Boss phonétique : implosives (ɓ ɗ ƴ), nasales (ñ ŋ), prénasales (mb nd ng nj) et voyelles longues. */
export const BOSS_SOUNDS = ['ɓ', 'ɗ', 'ƴ', 'ñ', 'ŋ', 'mb', 'nd', 'ng', 'nj', 'aa', 'ee', 'ii', 'oo', 'uu', 'c', 'j', 'b', 'd', 'y'];

export function buildBoss(lang: 'fr' | 'en'): Q[] {
  const alpha = LESSONS[0].items;
  const targets = alpha.filter((it) => BOSS_SOUNDS.slice(0, 14).includes(it.pu));
  return shuffle(targets)
    .slice(0, 10)
    .map((it) => {
      // distracteurs « pièges » : sons proches d'abord (ɓ/b, ɗ/d, ƴ/y, aa/a…)
      const near = alpha.filter((o) => o.pu !== it.pu && (o.pu[0] === it.pu[0] || o.pu.includes(it.pu[0]) || BOSS_SOUNDS.includes(o.pu))).map((o) => o.pu);
      return { kind: 'whichSound', prompt: meaning(it, lang), promptIsPu: false, answer: it.pu, options: options(it.pu, near) } as Q;
    });
}
