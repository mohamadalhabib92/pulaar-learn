export type BootStatus = 'pending' | 'timedOut' | 'ready' | 'offline';

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
 * Lecture locale avec délai max. « Continuer hors ligne » et « Réessayer »
 * n’ouvrent pas le droit d’écrire : setItem / removeItem restent bloqués
 * tant que getItem n’a pas réussi. Sinon la sauvegarde suivante remplace
 * les imports (métadonnées MP3) par l’état vide.
 */
export function createPersistedStoreCore<T extends object>(key: string, initial: T, opts: Options<T>) {
  const timeoutMs = opts.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  const saveDelayMs = opts.saveDelayMs ?? 150;
  const storage = opts.storage;
  let state: T = initial;
  let status: BootStatus = 'pending';
  let dirty = false;
  /** Vrai seulement après un getItem résolu, pas après un délai ni une erreur. */
  let storageReady = false;
  let readId = 0;
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

  const applyStored = (stored: Partial<T>) => {
    if (opts.merge) state = opts.merge(stored, state, dirty);
    else state = (dirty ? { ...initial, ...stored, ...state } : { ...initial, ...stored }) as T;
  };

  const persist = () => {
    if (!storageReady) return;
    if (saveTimer) clearTimeout(saveTimer);
    saveTimer = setTimeout(() => {
      saveTimer = null;
      if (!storageReady) return;
      storage.setItem(key, JSON.stringify(state)).catch(() => undefined);
    }, saveDelayMs);
  };

  const read = (id: number) => {
    storage
      .getItem(key)
      .then((raw) => {
        if (id !== readId) return;
        if (raw) {
          try {
            applyStored(JSON.parse(raw) as Partial<T>);
          } catch {
            // Fichier présent mais illisible : ne pas l’écraser par l’état vide.
            return;
          }
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
    /** Exposé pour les tests : aucune écriture n’est permise avant ce drapeau. */
    isStorageReady: () => storageReady,
    set(patch: Partial<T> | ((s: T) => Partial<T>)) {
      dirty = true;
      const p = typeof patch === 'function' ? patch(state) : patch;
      state = { ...state, ...p };
      emit();
      persist();
    },
    reset() {
      state = initial;
      dirty = true;
      emit();
      if (!storageReady) return;
      storage.removeItem(key).catch(() => undefined);
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
