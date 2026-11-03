import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSyncExternalStore } from 'react';
import { BOOT_TIMEOUT_MS } from '../theme';
import { createPersistedStoreCore, type BootStatus, type KeyValueStore } from './persistCore';

export type { BootStatus };

type Options<T> = {
  timeoutMs?: number;
  /** Fusion additive. `dirty` est vrai si l’utilisateur a modifié l’état avant la fin de la lecture. */
  merge?: (stored: Partial<T>, current: T, dirty: boolean) => T;
  storage?: KeyValueStore;
  saveDelayMs?: number;
};

/**
 * Store persistant (AsyncStorage, localStorage sur le web).
 * La clé ne change pas. La lecture a un délai max ; ensuite l’UI propose
 * « Réessayer » ou « Continuer hors ligne ».
 * Aucune écriture avant un getItem réussi : sur main, le délai de 2,5 s
 * considérait la lecture comme vide puis le setItem suivant écrasait les imports.
 */
export function createPersistedStore<T extends object>(key: string, initial: T, timeoutMsOrOpts: number | Options<T> = BOOT_TIMEOUT_MS) {
  const opts: Options<T> = typeof timeoutMsOrOpts === 'number' ? { timeoutMs: timeoutMsOrOpts } : timeoutMsOrOpts;
  const core = createPersistedStoreCore(key, initial, {
    timeoutMs: opts.timeoutMs ?? BOOT_TIMEOUT_MS,
    saveDelayMs: opts.saveDelayMs,
    merge: opts.merge,
    storage: opts.storage ?? AsyncStorage,
  });

  return {
    get: core.get,
    set: core.set,
    reset: core.reset,
    hydration: core.hydration,
    retryHydration: core.retryHydration,
    continueOffline: core.continueOffline,
    useStore(): T {
      return useSyncExternalStore(core.subscribe, core.get, core.get);
    },
    useBoot(): BootStatus {
      return useSyncExternalStore(core.subscribe, core.getStatus, core.getStatus);
    },
    useHydrated(): boolean {
      const ready = () => {
        const s = core.getStatus();
        return s === 'ready' || s === 'offline';
      };
      return useSyncExternalStore(core.subscribe, ready, ready);
    },
  };
}
