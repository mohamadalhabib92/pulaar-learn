import type { AppState, ImportMeta, LessonProgress } from './store';

function finite(value: unknown): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : 0;
}

const KNOWN_FIELDS = new Set([
  'lang',
  'questEnabled',
  'dailyGoal',
  'xp',
  'todayXp',
  'todayDay',
  'streak',
  'bestStreak',
  'lastActiveDay',
  'badges',
  'lessons',
  'listened',
  'jannguOpened',
  'bossBest',
  'imports',
  'transcripts',
  'rate',
  'packFilter',
  'reduceMotion',
  'schemaVersion',
]);

function plain(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/** Garde les deux côtés d’un champ inconnu au lieu d’en effacer un. */
function mergeUnknown(stored: unknown, current: unknown): unknown {
  if (Array.isArray(stored) && Array.isArray(current)) {
    const seen = new Set(stored.map((item) => JSON.stringify(item)));
    const out = stored.slice();
    for (const item of current) {
      const key = JSON.stringify(item);
      if (!seen.has(key)) {
        seen.add(key);
        out.push(item);
      }
    }
    return out;
  }
  if (plain(stored) && plain(current)) return { ...stored, ...current };
  return stored === undefined ? current : stored;
}

function keepUnknown(stored: Record<string, unknown>, current: Record<string, unknown>, dirty: boolean) {
  const extra: Record<string, unknown> = {};
  const keys = new Set([...Object.keys(stored), ...Object.keys(current)]);
  for (const key of keys) {
    if (KNOWN_FIELDS.has(key)) continue;
    const inStored = Object.prototype.hasOwnProperty.call(stored, key);
    const inCurrent = Object.prototype.hasOwnProperty.call(current, key);
    if (inStored && inCurrent && dirty) extra[key] = mergeUnknown(stored[key], current[key]);
    else if (inStored) extra[key] = stored[key];
    else extra[key] = current[key];
  }
  return extra;
}

/**
 * Migration additive de `pulaar:v1`.
 * Les champs inconnus (signets, métadonnées futures) du disque et de la session
 * sont conservés. Un fichier sans `schemaVersion` reste lisible.
 * Progression, imports et transcriptions ne sont jamais écrasés par une valeur vide.
 */
export function mergeAppState(stored: Partial<AppState>, current: AppState, dirty: boolean, initial: AppState): AppState {
  const storedRec = stored as AppState & Record<string, unknown>;
  const currentRec = current as AppState & Record<string, unknown>;
  const base = { ...initial, ...stored } as AppState & Record<string, unknown>;
  if (!dirty) return base;

  const lessons: Record<string, LessonProgress & Record<string, unknown>> = { ...(base.lessons ?? {}) };
  for (const [id, progress] of Object.entries(current.lessons ?? {})) {
    const prev = lessons[id];
    lessons[id] = prev
      ? {
          ...prev,
          ...progress,
          seen: Boolean(prev.seen || progress.seen),
          best: Math.max(finite(prev.best), finite(progress.best)),
          attempts: Math.max(finite(prev.attempts), finite(progress.attempts)),
        }
      : progress;
  }

  return {
    ...storedRec,
    ...currentRec,
    ...base,
    ...keepUnknown(storedRec, currentRec, true),
    lang: current.lang,
    questEnabled: current.questEnabled,
    dailyGoal: current.dailyGoal,
    rate: current.rate,
    packFilter: current.packFilter,
    reduceMotion: current.reduceMotion,
    xp: Math.max(finite(base.xp), finite(current.xp)),
    todayXp: Math.max(finite(base.todayXp), finite(current.todayXp)),
    streak: Math.max(finite(base.streak), finite(current.streak)),
    bestStreak: Math.max(finite(base.bestStreak), finite(current.bestStreak)),
    bossBest: Math.max(finite(base.bossBest), finite(current.bossBest)),
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

/**
 * Remet uniquement la progression à zéro.
 * Langue, réglages, imports, transcriptions et champs inconnus restent.
 * N’efface ni la clé de stockage ni les fichiers audio.
 */
export function resetProgressPatch<T extends AppState>(state: T): T {
  return {
    ...state,
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
