/**
 * Lecture défensive de la sauvegarde locale `pulaar:v1`.
 *
 * Un fichier illisible, d’une forme inattendue ou d’une version future
 * n’est pas réécrit. Les champs inconnus d’un fichier compatible sont gardés.
 * Les tests unitaires ne remplacent pas une copie réelle puis une restauration
 * isolée avant une bascule. Ils ne promettent pas zéro perte sur un appareil.
 */

export const SCHEMA_VERSION = 1;

/** Seule chaîne qui autorise l’effacement de la clé. Absente de l’interface. */
export const DELETE_CONFIRMATION = 'EFFACER_DONNEES_LOCALES_PULAAR';

export type PreserveKind = 'empty' | 'ok' | 'malformed' | 'incompatible';

export type PreserveView = {
  kind: PreserveKind;
  /** Texte d’origine. Null seulement s’il n’y avait pas de valeur. */
  raw: string | null;
  reason: string | null;
  /** Présent seulement si kind est `ok`. Les champs inconnus restent. */
  value?: Record<string, unknown>;
};

const STRING_FIELDS = ['lang', 'packFilter', 'reduceMotion'] as const;
const BOOLEAN_FIELDS = ['questEnabled', 'jannguOpened'] as const;
const NUMBER_FIELDS = ['dailyGoal', 'xp', 'todayXp', 'streak', 'bestStreak', 'bossBest', 'rate'] as const;
const NULLABLE_STRING_FIELDS = ['todayDay', 'lastActiveDay'] as const;
const STRING_ARRAY_FIELDS = ['badges', 'listened'] as const;

function isPlain(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}

function checkLessons(value: unknown): boolean {
  if (!isPlain(value)) return false;
  for (const entry of Object.values(value)) {
    if (!isPlain(entry)) return false;
    if ('seen' in entry && typeof entry.seen !== 'boolean') return false;
    if ('best' in entry && !isFiniteNumber(entry.best)) return false;
    if ('attempts' in entry && !isFiniteNumber(entry.attempts)) return false;
  }
  return true;
}

function checkImports(value: unknown): boolean {
  if (!Array.isArray(value)) return false;
  const strings = ['title', 'tag', 'transcript', 'fileName', 'mime', 'langue', 'source', 'storage'];
  for (const item of value) {
    if (!isPlain(item)) return false;
    if (typeof item.id !== 'string' || item.id.length === 0) return false;
    for (const key of strings) {
      if (key in item && typeof item[key] !== 'string') return false;
    }
    if ('lessonId' in item && item.lessonId !== null && typeof item.lessonId !== 'string') return false;
    if ('createdAt' in item && !isFiniteNumber(item.createdAt)) return false;
    if ('durationS' in item && item.durationS !== null && !isFiniteNumber(item.durationS)) return false;
    if ('uri' in item && item.uri !== null && typeof item.uri !== 'string') return false;
  }
  return true;
}

function checkTranscripts(value: unknown): boolean {
  if (!isPlain(value)) return false;
  return Object.values(value).every((item) => typeof item === 'string');
}

/** Premier champ incompatible, ou null si le document peut être repris. */
export function incompatibleField(value: Record<string, unknown>): string | null {
  for (const key of STRING_FIELDS) {
    if (key in value && typeof value[key] !== 'string') return key;
  }
  for (const key of BOOLEAN_FIELDS) {
    if (key in value && typeof value[key] !== 'boolean') return key;
  }
  for (const key of NUMBER_FIELDS) {
    if (key in value && !isFiniteNumber(value[key])) return key;
  }
  for (const key of NULLABLE_STRING_FIELDS) {
    if (!(key in value)) continue;
    const item = value[key];
    if (item !== null && typeof item !== 'string') return key;
  }
  for (const key of STRING_ARRAY_FIELDS) {
    if (!(key in value)) continue;
    const item = value[key];
    if (!Array.isArray(item) || item.some((entry) => typeof entry !== 'string')) return key;
  }
  if ('lessons' in value && !checkLessons(value.lessons)) return 'lessons';
  if ('imports' in value && !checkImports(value.imports)) return 'imports';
  if ('transcripts' in value && !checkTranscripts(value.transcripts)) return 'transcripts';
  return null;
}

/**
 * `null` ou chaîne vide : pas de sauvegarde (écriture ultérieure permise).
 * Tout autre contenu non compatible : on garde le texte brut et on n’écrit pas.
 */
export function inspectStored(raw: string | null): PreserveView {
  if (raw == null || raw === '') return { kind: 'empty', raw, reason: null };
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return { kind: 'malformed', raw, reason: 'malformed-json' };
  }
  if (!isPlain(parsed)) return { kind: 'incompatible', raw, reason: 'not-object' };
  if ('schemaVersion' in parsed) {
    const version = parsed.schemaVersion;
    if (!isFiniteNumber(version) || !Number.isInteger(version) || version < 1) {
      return { kind: 'incompatible', raw, reason: 'invalid-schema-version' };
    }
    if (version > SCHEMA_VERSION) return { kind: 'incompatible', raw, reason: 'future-schema' };
  }
  const field = incompatibleField(parsed);
  if (field) return { kind: 'incompatible', raw, reason: `bad-field:${field}` };
  return { kind: 'ok', raw, reason: null, value: parsed };
}

export function preserveMessageKey(
  reason: string | null,
): 'preserveMalformed' | 'preserveFuture' | 'preserveNotObject' | 'preserveVersion' | 'preserveBadField' {
  if (reason === 'future-schema') return 'preserveFuture';
  if (reason === 'not-object') return 'preserveNotObject';
  if (reason === 'invalid-schema-version') return 'preserveVersion';
  if (reason?.startsWith('bad-field:')) return 'preserveBadField';
  return 'preserveMalformed';
}

export function preserveFieldName(reason: string | null): string {
  if (!reason?.startsWith('bad-field:')) return '';
  return reason.slice('bad-field:'.length);
}
