import type { AppState, ImportMeta, LessonProgress } from './store';

/**
 * Migration additive de `pulaar:v1`.
 * Les champs inconnus déjà enregistrés sont conservés.
 * Les nouveaux champs (packFilter, reduceMotion) prennent la valeur initiale s’ils manquent.
 * Progression, imports et transcriptions ne sont jamais écrasés par une valeur vide.
 */
export function mergeAppState(stored: Partial<AppState>, current: AppState, dirty: boolean, initial: AppState): AppState {
  const base = { ...initial, ...stored };
  if (!dirty) return base;

  const lessons: Record<string, LessonProgress> = { ...(base.lessons ?? {}) };
  for (const [id, p] of Object.entries(current.lessons)) {
    const prev = lessons[id];
    lessons[id] = prev
      ? { seen: prev.seen || p.seen, best: Math.max(prev.best, p.best), attempts: Math.max(prev.attempts, p.attempts) }
      : p;
  }

  return {
    ...stored,
    ...base,
    lang: current.lang,
    questEnabled: current.questEnabled,
    dailyGoal: current.dailyGoal,
    rate: current.rate,
    packFilter: current.packFilter,
    reduceMotion: current.reduceMotion,
    xp: Math.max(base.xp ?? 0, current.xp),
    todayXp: Math.max(base.todayXp ?? 0, current.todayXp),
    streak: Math.max(base.streak ?? 0, current.streak),
    bestStreak: Math.max(base.bestStreak ?? 0, current.bestStreak),
    bossBest: Math.max(base.bossBest ?? 0, current.bossBest),
    jannguOpened: !!(base.jannguOpened || current.jannguOpened),
    lastActiveDay: current.lastActiveDay ?? base.lastActiveDay,
    todayDay: current.todayDay ?? base.todayDay,
    lessons,
    listened: Array.from(new Set([...(base.listened ?? []), ...current.listened])),
    badges: Array.from(new Set([...(base.badges ?? []), ...current.badges])),
    imports: unionImports(base.imports ?? [], current.imports),
    transcripts: unionText({ ...(base.transcripts ?? {}) }, current.transcripts),
  };
}

function unionImports(stored: ImportMeta[], current: ImportMeta[]): ImportMeta[] {
  const map = new Map<string, ImportMeta>();
  for (const m of stored) map.set(m.id, m);
  for (const m of current) {
    const prev = map.get(m.id);
    if (!prev) map.set(m.id, m);
    else {
      const transcript = (m.transcript?.length ?? 0) >= (prev.transcript?.length ?? 0) ? m.transcript : prev.transcript;
      map.set(m.id, { ...prev, ...m, transcript });
    }
  }
  return Array.from(map.values());
}

function unionText(stored: Record<string, string>, current: Record<string, string>): Record<string, string> {
  const out = { ...stored };
  for (const [k, v] of Object.entries(current)) {
    if ((v?.length ?? 0) >= (out[k]?.length ?? 0)) out[k] = v;
  }
  return out;
}
