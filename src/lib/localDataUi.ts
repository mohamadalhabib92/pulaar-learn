import { DELETE_CONFIRMATION } from './preserve.ts';

/**
 * Décisions d’écran pour la sauvegarde locale.
 * La copie brute n’est lue qu’après une demande puis une confirmation.
 * Réinitialiser la progression ne supprime pas les fichiers audio.
 * Tout effacer exige la phrase affichée dans l’interface.
 */

export type DeletionPlan = {
  resetProgress: boolean;
  deleteListedAudio: boolean;
  removeReadableKey: boolean;
  removeUnreadableKey: boolean;
};

export type LocalDataUi = {
  pending: null | 'export' | 'reset-progress' | 'delete-all';
  rawVisible: boolean;
  phraseDraft: string;
  notice: null | 'progress-reset' | 'deleted' | 'phrase-mismatch';
};

export type LocalDataEvent =
  | { type: 'request-export' }
  | { type: 'confirm-export' }
  | { type: 'hide-raw' }
  | { type: 'request-reset' }
  | { type: 'confirm-reset' }
  | { type: 'request-delete' }
  | { type: 'set-phrase'; phrase: string }
  | { type: 'confirm-delete' }
  | { type: 'cancel' };

export function initialLocalDataUi(): LocalDataUi {
  return { pending: null, rawVisible: false, phraseDraft: '', notice: null };
}

/** Vrai seulement après la confirmation explicite d’affichage. */
export function shouldRenderRaw(ui: LocalDataUi): boolean {
  return ui.rawVisible;
}

/**
 * N’appelle `read` que si l’affichage est confirmé.
 * Avant cela, le profil n’est pas lu pour l’écran.
 */
export function rawForDisplay(ui: LocalDataUi, read: () => string | null): string | null {
  if (!shouldRenderRaw(ui)) return null;
  return read();
}

export function deletionPlan(mode: 'progress' | 'all', readable: boolean): DeletionPlan {
  if (mode === 'progress') {
    return { resetProgress: true, deleteListedAudio: false, removeReadableKey: false, removeUnreadableKey: false };
  }
  return {
    resetProgress: false,
    deleteListedAudio: readable,
    removeReadableKey: readable,
    removeUnreadableKey: !readable,
  };
}

export function phraseShownToUser(): string {
  return DELETE_CONFIRMATION;
}

function idle(notice: LocalDataUi['notice']): LocalDataUi {
  return { pending: null, rawVisible: false, phraseDraft: '', notice };
}

export function reduceLocalData(
  ui: LocalDataUi,
  event: LocalDataEvent,
  ctx: { readable: boolean },
): { ui: LocalDataUi; plan: DeletionPlan | null } {
  switch (event.type) {
    case 'request-export':
      return { ui: { ...ui, pending: 'export', rawVisible: false, notice: null }, plan: null };
    case 'confirm-export':
      if (ui.pending !== 'export') return { ui, plan: null };
      return { ui: { ...ui, pending: null, rawVisible: true }, plan: null };
    case 'hide-raw':
      return { ui: { ...ui, rawVisible: false, pending: null }, plan: null };
    case 'request-reset':
      return { ui: { ...idle(null), pending: 'reset-progress' }, plan: null };
    case 'confirm-reset':
      if (ui.pending !== 'reset-progress') return { ui, plan: null };
      return { ui: idle('progress-reset'), plan: deletionPlan('progress', ctx.readable) };
    case 'request-delete':
      return { ui: { ...idle(null), pending: 'delete-all' }, plan: null };
    case 'set-phrase':
      return { ui: { ...ui, phraseDraft: event.phrase, notice: ui.notice === 'phrase-mismatch' ? null : ui.notice }, plan: null };
    case 'confirm-delete':
      if (ui.pending !== 'delete-all') return { ui, plan: null };
      if (ui.phraseDraft !== phraseShownToUser()) {
        return { ui: { ...ui, notice: 'phrase-mismatch' }, plan: null };
      }
      return { ui: idle('deleted'), plan: deletionPlan('all', ctx.readable) };
    case 'cancel':
      return { ui: idle(null), plan: null };
    default:
      return { ui, plan: null };
  }
}
