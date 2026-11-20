import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';
import {
  deletionPlan,
  initialLocalDataUi,
  phraseShownToUser,
  rawForDisplay,
  reduceLocalData,
  shouldRenderRaw,
} from './localDataUi.ts';
import { DELETE_CONFIRMATION } from './preserve.ts';

const ctx = (readable) => ({ readable });

test('la copie brute n’est ni lue ni affichée tant que la personne ne l’a pas demandée puis confirmée', () => {
  let calls = 0;
  const read = () => {
    calls += 1;
    return 'SECRET-ENFANT';
  };
  let ui = initialLocalDataUi();
  assert.equal(shouldRenderRaw(ui), false);
  assert.equal(rawForDisplay(ui, read), null);
  assert.equal(calls, 0);

  const asked = reduceLocalData(ui, { type: 'request-export' }, ctx(true));
  assert.equal(asked.plan, null);
  assert.equal(shouldRenderRaw(asked.ui), false);
  assert.equal(rawForDisplay(asked.ui, read), null);
  assert.equal(calls, 0);

  const shown = reduceLocalData(asked.ui, { type: 'confirm-export' }, ctx(true));
  assert.equal(shouldRenderRaw(shown.ui), true);
  assert.equal(rawForDisplay(shown.ui, read), 'SECRET-ENFANT');
  assert.equal(calls, 1);
});

test('annuler masque la copie et n’émet aucun plan d’effacement', () => {
  let ui = reduceLocalData(initialLocalDataUi(), { type: 'request-export' }, ctx(true)).ui;
  ui = reduceLocalData(ui, { type: 'confirm-export' }, ctx(true)).ui;
  const cancelled = reduceLocalData(ui, { type: 'cancel' }, ctx(true));
  assert.equal(cancelled.plan, null);
  assert.equal(cancelled.ui.rawVisible, false);
  assert.equal(cancelled.ui.pending, null);
  assert.equal(shouldRenderRaw(cancelled.ui), false);
});

test('la réinitialisation de progression ne supprime ni l’audio ni la clé', () => {
  let ui = reduceLocalData(initialLocalDataUi(), { type: 'request-reset' }, ctx(true)).ui;
  const armed = reduceLocalData(ui, { type: 'confirm-delete' }, ctx(true));
  assert.equal(armed.plan, null, 'confirmer l’effacement total depuis l’autre demande ne fait rien');
  const step = reduceLocalData(ui, { type: 'confirm-reset' }, ctx(true));
  assert.deepEqual(step.plan, deletionPlan('progress', true));
  assert.equal(step.plan.resetProgress, true);
  assert.equal(step.plan.deleteListedAudio, false);
  assert.equal(step.plan.removeReadableKey, false);
  assert.equal(step.plan.removeUnreadableKey, false);
  assert.equal(step.ui.notice, 'progress-reset');
});

test('annuler la réinitialisation ou l’effacement ne produit aucun plan', () => {
  for (const request of ['request-reset', 'request-delete']) {
    let ui = reduceLocalData(initialLocalDataUi(), { type: request }, ctx(true)).ui;
    ui = reduceLocalData(ui, { type: 'set-phrase', phrase: DELETE_CONFIRMATION }, ctx(true)).ui;
    const step = reduceLocalData(ui, { type: 'cancel' }, ctx(true));
    assert.equal(step.plan, null);
    assert.equal(step.ui.pending, null);
    assert.equal(step.ui.phraseDraft, '');
  }
});

test('l’effacement total exige la phrase affichée, puis distingue audio et fichier illisible', () => {
  assert.equal(phraseShownToUser(), DELETE_CONFIRMATION);
  assert.ok(DELETE_CONFIRMATION.length > 8);

  let ui = reduceLocalData(initialLocalDataUi(), { type: 'request-delete' }, ctx(true)).ui;
  const wrong = reduceLocalData(ui, { type: 'confirm-delete' }, ctx(true));
  assert.equal(wrong.plan, null);
  assert.equal(wrong.ui.notice, 'phrase-mismatch');
  assert.equal(wrong.ui.pending, 'delete-all');

  ui = reduceLocalData(wrong.ui, { type: 'set-phrase', phrase: 'presque ' + DELETE_CONFIRMATION }, ctx(true)).ui;
  const still = reduceLocalData(ui, { type: 'confirm-delete' }, ctx(true));
  assert.equal(still.plan, null);

  ui = reduceLocalData(still.ui, { type: 'set-phrase', phrase: DELETE_CONFIRMATION }, ctx(true)).ui;
  const ok = reduceLocalData(ui, { type: 'confirm-delete' }, ctx(true));
  assert.equal(ok.plan.deleteListedAudio, true);
  assert.equal(ok.plan.removeReadableKey, true);
  assert.equal(ok.plan.removeUnreadableKey, false);
  assert.equal(ok.plan.resetProgress, false);

  let blocked = reduceLocalData(initialLocalDataUi(), { type: 'request-delete' }, ctx(false)).ui;
  blocked = reduceLocalData(blocked, { type: 'set-phrase', phrase: DELETE_CONFIRMATION }, ctx(false)).ui;
  const unreadable = reduceLocalData(blocked, { type: 'confirm-delete' }, ctx(false));
  assert.equal(unreadable.plan.deleteListedAudio, false);
  assert.equal(unreadable.plan.removeReadableKey, false);
  assert.equal(unreadable.plan.removeUnreadableKey, true);
});

test('les écrans ne rendent pas le profil tout seuls et montrent la phrase de suppression', () => {
  const boot = readFileSync(new URL('../components/Boot.tsx', import.meta.url), 'utf8');
  const settings = readFileSync(new URL('../app/(tabs)/settings.tsx', import.meta.url), 'utf8');
  const panel = readFileSync(new URL('../components/LocalDataActions.tsx', import.meta.url), 'utf8');
  for (const [name, src] of [['Boot', boot], ['settings', settings]]) {
    assert.equal(src.includes('preserve.raw'), false, name);
    assert.equal(src.includes('raw ??'), false, name);
    assert.equal(src.includes('{raw}'), false, name);
  }
  assert.match(panel, /rawForDisplay/);
  assert.match(panel, /phraseShownToUser/);
  assert.match(panel, /cancelData/);
  assert.match(panel, /rawDisclosure/);
  assert.match(settings, /plan\.resetProgress/);
  assert.match(settings, /plan\.deleteListedAudio/);
  const progressBranch = settings.slice(settings.indexOf('if (plan.resetProgress)'), settings.indexOf('if (plan.deleteListedAudio)'));
  assert.match(progressBranch, /resetProgress\(/);
  assert.equal(progressBranch.includes('deleteImportFile'), false);
});
