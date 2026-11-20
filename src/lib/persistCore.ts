// Extension .ts : le test Node charge ce module tel quel (`--experimental-strip-types`).
import { DELETE_CONFIRMATION, SCHEMA_VERSION, inspectStored, type PreserveView } from './preserve.ts';

export type BootStatus = 'pending' | 'timedOut' | 'ready' | 'offline' | 'incompatible';

/** Même valeur que BOOT_TIMEOUT_MS. Le fichier n’importe pas le thème pour rester testable sans Metro. */
const DEFAULT_TIMEOUT_MS = 8000;

export type KeyValueStore = {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
  removeItem(key: string): Promise<void>;
};

type Options<T> = {
  timeoutMs?: number;
  /** Délai avant setItem. 0 dans les tests. */
  saveDelayMs?: number;
  storage: KeyValueStore;
  /** Fusion additive. `dirty` est vrai si l’état a changé avant la fin de la lecture. */
  merge?: (stored: Partial<T>, current: T, dirty: boolean) => T;
};

/**
 * Lecture locale avec délai max.
 * setItem et removeItem restent bloqués tant qu’un getItem compatible n’a pas réussi.
 * Un JSON illisible ou un schéma futur n’est ni parsé dans l’état vivant ni réécrit.
 * `reset` ne supprime pas la clé. L’effacement passe par `deleteStored` et une confirmation.
 * Il n’y a pas de compte : `signOut` ne touche pas au disque.
 */
export function createPersistedStoreCore<T extends object>(key: string, initial: T, opts: Options<T>) {
  const timeoutMs = opts.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  const saveDelayMs = opts.saveDelayMs ?? 150;
  const storage = opts.storage;
  let state: T = initial;
  let status: BootStatus = 'pending';
  let dirty = false;
  /** Vrai seulement après un getItem compatible, pas après un délai, une erreur ou un fichier refusé. */
  let storageReady = false;
  let preserve: PreserveView = { kind: 'empty', raw: null, reason: null };
  let readId = 0;
  let writeGen = 0;
  const listeners = new Set<() => void>();
  const emit = () => listeners.forEach((l) => l());
  let timer: ReturnType<typeof setTimeout> | null = null;
  let saveTimer: ReturnType<typeof setTimeout> | null = null;
  let resolveHydration: () => void = () => undefined;
  const hydration = new Promise<void>((resolve) => {
    resolveHydration = resolve;
  });

  const clearTimer = () => {
    if (timer) clearTimeout(timer);
    timer = null;
  };

  const settle = (next: BootStatus) => {
    clearTimer();
    status = next;
    if (next === 'ready') dirty = false;
    resolveHydration();
    emit();
  };

  const serialize = (value: T) => JSON.stringify({ ...value, schemaVersion: SCHEMA_VERSION });

  const applyStored = (stored: Partial<T>) => {
    if (opts.merge) state = opts.merge(stored, state, dirty);
    else state = (dirty ? { ...initial, ...stored, ...state } : { ...initial, ...stored }) as T;
  };

  const persist = () => {
    if (!storageReady) return;
    if (preserve.kind === 'malformed' || preserve.kind === 'incompatible') return;
    if (saveTimer) clearTimeout(saveTimer);
    const gen = writeGen;
    saveTimer = setTimeout(() => {
      saveTimer = null;
      if (!storageReady || gen !== writeGen) return;
      if (preserve.kind === 'malformed' || preserve.kind === 'incompatible') return;
      storage.setItem(key, serialize(state)).catch(() => undefined);
    }, saveDelayMs);
  };

  const read = (id: number) => {
    storage
      .getItem(key)
      .then((raw) => {
        if (id !== readId) return;
        if (raw) {
          const report = inspectStored(raw);
          if (report.kind !== 'ok' || !report.value) {
            preserve = report;
            storageReady = false;
            settle('incompatible');
            return;
          }
          preserve = report;
          applyStored(report.value as Partial<T>);
        } else {
          preserve = { kind: 'empty', raw: null, reason: null };
        }
        storageReady = true;
        const edited = dirty;
        settle('ready');
        if (edited) persist();
      })
      .catch(() => {
        if (id !== readId) return;
        if (status === 'pending') settle('timedOut');
      });
  };

  const arm = (id: number) => {
    clearTimer();
    timer = setTimeout(() => {
      if (id !== readId) return;
      if (status === 'pending') settle('timedOut');
    }, timeoutMs);
  };

  const begin = () => {
    const id = ++readId;
    status = 'pending';
    emit();
    arm(id);
    read(id);
  };

  begin();

  return {
    get: () => state,
    getStatus: () => status,
    getPreserve: () => preserve,
    /** Exposé pour les tests : aucune écriture n’est permise avant ce drapeau. */
    isStorageReady: () => storageReady,
    /** Texte brut d’un fichier refusé, ou JSON courant une fois la lecture compatible. */
    exportRaw(): string | null {
      if (preserve.kind === 'malformed' || preserve.kind === 'incompatible') return preserve.raw;
      if (storageReady) return serialize(state);
      return preserve.raw;
    },
    set(patch: Partial<T> | ((s: T) => Partial<T>)) {
      dirty = true;
      const p = typeof patch === 'function' ? patch(state) : patch;
      state = { ...state, ...p };
      emit();
      persist();
    },
    /**
     * Avant la lecture, remet seulement la mémoire de travail.
     * Après une lecture, ou si le fichier est refusé, ne touche ni la mémoire durable ni le disque.
     */
    reset() {
      if (storageReady) return false;
      if (preserve.kind === 'malformed' || preserve.kind === 'incompatible') return false;
      state = { ...initial };
      dirty = true;
      emit();
      return true;
    },
    /**
     * Effacement volontaire d’une clé déjà lue comme compatible.
     * Refusé sans la phrase exacte. Un fichier illisible passe par discardUnreadable.
     */
    deleteStored(confirm: string) {
      if (confirm !== DELETE_CONFIRMATION) return { deleted: false, reason: 'confirmation' as const };
      if (!storageReady || preserve.kind === 'malformed' || preserve.kind === 'incompatible') {
        return { deleted: false, reason: 'locked' as const };
      }
      writeGen += 1;
      if (saveTimer) clearTimeout(saveTimer);
      saveTimer = null;
      state = { ...initial };
      dirty = false;
      storage.removeItem(key).catch(() => undefined);
      emit();
      return { deleted: true, reason: 'deleted' as const };
    },
    /**
     * Effacement volontaire d’un fichier qui n’a pas pu être ouvert.
     * La phrase est la même que celle affichée à l’écran. deleteStored ne le fait pas.
     */
    discardUnreadable(confirm: string) {
      if (confirm !== DELETE_CONFIRMATION) return { deleted: false, reason: 'confirmation' as const };
      if (preserve.kind !== 'malformed' && preserve.kind !== 'incompatible') {
        return { deleted: false, reason: 'not-unreadable' as const };
      }
      writeGen += 1;
      if (saveTimer) clearTimeout(saveTimer);
      saveTimer = null;
      storage.removeItem(key).catch(() => undefined);
      preserve = { kind: 'empty', raw: null, reason: null };
      state = { ...initial };
      dirty = false;
      storageReady = true;
      settle('ready');
      return { deleted: true, reason: 'deleted' as const };
    },
    /** Pas de compte dans cette application. Ne supprime rien. */
    signOut() {
      return { wiped: false as const };
    },
    hydration,
    retryHydration() {
      if (status === 'ready') return;
      begin();
    },
    continueOffline() {
      if (status === 'ready') return;
      settle('offline');
    },
    subscribe(l: () => void) {
      listeners.add(l);
      return () => listeners.delete(l);
    },
  };
}
