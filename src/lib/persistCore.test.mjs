import assert from 'node:assert/strict';
import test from 'node:test';
import { mergeAppState, resetProgressPatch } from './migrate.ts';
import { createPersistedStoreCore } from './persistCore.ts';
import { DELETE_CONFIRMATION } from './preserve.ts';

const savedImport = {
  id: 'imp-1',
  title: 'Salutations du matin',
  tag: 'salutations',
  lessonId: 'pc-3',
  transcript: 'Jam waali',
  createdAt: 1,
  durationS: 12,
  fileName: 'salut.mp3',
  mime: 'audio/mpeg',
  storage: 'idb',
  uri: null,
  langue: 'pulaar',
  source: 'Upload Mohamed',
};

function blank() {
  return {
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
    packFilter: 'all',
    reduceMotion: 'system',
  };
}

function deferred() {
  let resolve;
  let reject;
  const promise = new Promise((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}

function memoryStorage(initial = {}) {
  const data = { ...initial };
  const writes = [];
  const gate = deferred();
  const storage = {
    getItem() {
      return gate.promise;
    },
    setItem(key, value) {
      writes.push({ op: 'set', key, value });
      data[key] = value;
      return Promise.resolve();
    },
    removeItem(key) {
      writes.push({ op: 'remove', key });
      delete data[key];
      return Promise.resolve();
    },
  };
  return {
    storage,
    writes,
    data,
    release(value) {
      gate.resolve(value);
    },
    fail(error) {
      gate.reject(error);
    },
  };
}

const tick = () => new Promise((r) => setTimeout(r, 20));

test('aucune écriture avant un getItem réussi, même après le délai et « Continuer hors ligne »', async () => {
  const disk = JSON.stringify({ ...blank(), imports: [savedImport], xp: 40, lang: 'fr' });
  const mem = memoryStorage({ 'pulaar:v1': disk });
  const initial = blank();
  const store = createPersistedStoreCore('pulaar:v1', initial, {
    timeoutMs: 15,
    saveDelayMs: 0,
    storage: mem.storage,
    merge: (stored, current, dirty) => mergeAppState(stored, current, dirty, initial),
  });

  await tick();
  assert.equal(store.getStatus(), 'timedOut');
  assert.equal(store.isStorageReady(), false);
  store.continueOffline();
  store.reset();
  store.set({ lang: 'en' });
  store.set((s) => ({ lessons: { ...s.lessons, 'pc-1': { seen: true, best: 0, attempts: 0 } } }));
  await tick();
  assert.equal(mem.writes.length, 0, 'set/reset avant la lecture ne doivent pas toucher le disque');
  assert.equal(mem.data['pulaar:v1'], disk);

  mem.release(disk);
  await tick();
  assert.equal(store.isStorageReady(), true);
  const written = mem.writes.filter((w) => w.op === 'set').map((w) => JSON.parse(w.value));
  assert.equal(written.length, 1);
  assert.equal(written[0].imports.length, 1);
  assert.equal(written[0].imports[0].id, 'imp-1');
  assert.equal(written[0].imports[0].fileName, 'salut.mp3');
  assert.equal(written[0].xp, 40);
  assert.equal(written[0].lang, 'en');
  assert.equal(written[0].lessons['pc-1']?.seen, true);
  assert.equal(mem.writes.some((w) => w.op === 'remove'), false);
});

test('« Réessayer » ne débloque pas l’écriture tant que la nouvelle lecture n’a pas réussi', async () => {
  const disk = JSON.stringify({ ...blank(), imports: [savedImport] });
  const mem = memoryStorage();
  const initial = blank();
  const store = createPersistedStoreCore('pulaar:v1', initial, {
    timeoutMs: 15,
    saveDelayMs: 0,
    storage: mem.storage,
    merge: (stored, current, dirty) => mergeAppState(stored, current, dirty, initial),
  });
  await tick();
  store.retryHydration();
  store.continueOffline();
  store.set({ xp: 5 });
  await tick();
  assert.equal(mem.writes.length, 0);

  mem.release(disk);
  await tick();
  const saved = JSON.parse(mem.writes.at(-1)?.value ?? '{}');
  assert.deepEqual(
    saved.imports.map((m) => m.id),
    ['imp-1'],
  );
  assert.equal(saved.xp, 5);
});

test('une lecture en échec ne rend pas le stockage prêt', async () => {
  const mem = memoryStorage({ 'pulaar:v1': JSON.stringify({ ...blank(), imports: [savedImport] }) });
  const initial = blank();
  const store = createPersistedStoreCore('pulaar:v1', initial, {
    timeoutMs: 50,
    saveDelayMs: 0,
    storage: mem.storage,
  });
  mem.fail(new Error('disque occupé'));
  await tick();
  store.continueOffline();
  store.set({ xp: 9 });
  store.reset();
  await tick();
  assert.equal(store.isStorageReady(), false);
  assert.equal(mem.writes.length, 0);
  assert.ok(mem.data['pulaar:v1'].includes('imp-1'));
});

test('un JSON illisible n’est pas écrasé', async () => {
  const corrupt = '{not json';
  const mem = memoryStorage({ 'pulaar:v1': corrupt });
  const store = createPersistedStoreCore('pulaar:v1', blank(), {
    timeoutMs: 30,
    saveDelayMs: 0,
    storage: mem.storage,
  });
  mem.release(corrupt);
  await tick();
  assert.equal(store.isStorageReady(), false);
  store.continueOffline();
  store.set({ xp: 9 });
  store.reset();
  await tick();
  assert.equal(mem.writes.length, 0);
  assert.equal(mem.data['pulaar:v1'], corrupt);
});

test('une lecture vide réussie autorise ensuite les sauvegardes', async () => {
  const mem = memoryStorage();
  const initial = blank();
  const store = createPersistedStoreCore('pulaar:v1', initial, {
    timeoutMs: 500,
    saveDelayMs: 0,
    storage: mem.storage,
  });
  mem.release(null);
  await tick();
  assert.equal(store.isStorageReady(), true);
  assert.equal(mem.writes.length, 0);
  store.set({ xp: 3 });
  await tick();
  assert.equal(mem.writes.length, 1);
  assert.equal(JSON.parse(mem.writes[0].value).xp, 3);
  assert.equal(JSON.parse(mem.writes[0].value).schemaVersion, 1);
});

test('une lecture compatible sans modification ne réécrit pas le fichier', async () => {
  const disk = JSON.stringify({ ...blank(), xp: 4, bookmarks: [{ id: 'disk' }] });
  const mem = memoryStorage({ 'pulaar:v1': disk });
  const store = createPersistedStoreCore('pulaar:v1', blank(), {
    timeoutMs: 50,
    saveDelayMs: 0,
    storage: mem.storage,
    merge: (stored, current, dirty) => mergeAppState(stored, current, dirty, blank()),
  });
  mem.release(disk);
  await tick();
  assert.equal(mem.writes.length, 0);
  assert.equal(mem.data['pulaar:v1'], disk);
  assert.deepEqual(store.get().bookmarks, [{ id: 'disk' }]);
  assert.equal(store.signOut().wiped, false);
  assert.equal(store.reset(), false);
  await tick();
  assert.equal(mem.writes.length, 0);
  assert.equal(mem.data['pulaar:v1'], disk);
});

test('les champs inconnus du disque et de la session survivent à la fusion puis à l’enregistrement', async () => {
  const diskObj = {
    ...blank(),
    xp: 4,
    bookmarks: [{ id: 'disk', lessonId: 'pc-1' }],
    imports: [{ ...savedImport, speakerNote: 'kept' }],
    lessons: { 'pc-1': { seen: true, best: 20, attempts: 2, bookmark: true } },
  };
  const disk = JSON.stringify(diskObj);
  const mem = memoryStorage();
  const initial = blank();
  const store = createPersistedStoreCore('pulaar:v1', initial, {
    timeoutMs: 50,
    saveDelayMs: 0,
    storage: mem.storage,
    merge: (stored, current, dirty) => mergeAppState(stored, current, dirty, initial),
  });
  store.set({ bookmarks: [{ id: 'session' }] });
  store.set((s) => ({ lessons: { ...s.lessons, 'pc-2': { seen: true, best: 10, attempts: 1, localNote: 'oui' } } }));
  mem.release(disk);
  await tick();
  const saved = JSON.parse(mem.writes.at(-1).value);
  assert.deepEqual(saved.bookmarks, [
    { id: 'disk', lessonId: 'pc-1' },
    { id: 'session' },
  ]);
  assert.equal(saved.imports[0].speakerNote, 'kept');
  assert.equal(saved.imports[0].id, 'imp-1');
  assert.equal(saved.lessons['pc-1'].bookmark, true);
  assert.equal(saved.lessons['pc-1'].best, 20);
  assert.equal(saved.lessons['pc-2'].localNote, 'oui');
  assert.equal(saved.xp, 4);
  assert.equal(saved.schemaVersion, 1);
  assert.equal(mem.writes.some((w) => w.op === 'remove'), false);
});

test('la réinitialisation de progression garde imports, réglages et champs inconnus', async () => {
  const disk = JSON.stringify({
    ...blank(),
    xp: 15,
    lang: 'en',
    bookmarks: [{ id: 'bm' }],
    imports: [savedImport],
    lessons: { 'pc-1': { seen: true, best: 90, attempts: 1 } },
  });
  const mem = memoryStorage();
  const initial = blank();
  const store = createPersistedStoreCore('pulaar:v1', initial, {
    timeoutMs: 50,
    saveDelayMs: 0,
    storage: mem.storage,
    merge: (stored, current, dirty) => mergeAppState(stored, current, dirty, initial),
  });
  mem.release(disk);
  await tick();
  store.set((s) => resetProgressPatch(s));
  await tick();
  const saved = JSON.parse(mem.writes.at(-1).value);
  assert.equal(saved.xp, 0);
  assert.deepEqual(saved.lessons, {});
  assert.equal(saved.lang, 'en');
  assert.deepEqual(saved.bookmarks, [{ id: 'bm' }]);
  assert.equal(saved.imports[0].fileName, 'salut.mp3');
  assert.equal(saved.schemaVersion, 1);
});

test('un schéma futur ou un JSON cassé n’est pas écrasé, reste exportable, et résiste au reset et au sign-out', async () => {
  const future = '{"schemaVersion":2,"xp":99,"bookmarks":[{"id":"futur"}]}';
  const mem = memoryStorage({ 'pulaar:v1': future });
  const store = createPersistedStoreCore('pulaar:v1', blank(), {
    timeoutMs: 30,
    saveDelayMs: 0,
    storage: mem.storage,
  });
  mem.release(future);
  await tick();
  assert.equal(store.getStatus(), 'incompatible');
  assert.equal(store.isStorageReady(), false);
  assert.equal(store.exportRaw(), future);
  assert.equal(store.getPreserve().reason, 'future-schema');
  store.continueOffline();
  store.set({ xp: 1, lang: 'en' });
  store.reset();
  store.signOut();
  assert.deepEqual(store.deleteStored(DELETE_CONFIRMATION), { deleted: false, reason: 'locked' });
  assert.deepEqual(store.deleteStored('oui'), { deleted: false, reason: 'confirmation' });
  await tick();
  assert.equal(mem.writes.length, 0);
  assert.equal(mem.data['pulaar:v1'], future);
});

test('l’effacement de la clé exige la phrase exacte et n’est pas appelé par reset', async () => {
  const disk = JSON.stringify({ ...blank(), xp: 8, imports: [savedImport] });
  const mem = memoryStorage();
  const store = createPersistedStoreCore('pulaar:v1', blank(), {
    timeoutMs: 50,
    saveDelayMs: 0,
    storage: mem.storage,
  });
  mem.release(disk);
  await tick();
  store.set({ xp: 9 });
  assert.deepEqual(store.deleteStored('EFFACER'), { deleted: false, reason: 'confirmation' });
  await tick();
  assert.equal(mem.writes.some((w) => w.op === 'remove'), false);
  assert.equal(store.reset(), false);
  const result = store.deleteStored(DELETE_CONFIRMATION);
  assert.deepEqual(result, { deleted: true, reason: 'deleted' });
  await tick();
  assert.equal(mem.writes.filter((w) => w.op === 'remove').length, 1);
  assert.equal(mem.data['pulaar:v1'], undefined);
  store.set({ xp: 2 });
  await tick();
  assert.equal(JSON.parse(mem.data['pulaar:v1']).xp, 2);
  assert.equal(JSON.parse(mem.data['pulaar:v1']).schemaVersion, 1);
});

test('un fichier illisible ne part qu’avec discardUnreadable et la phrase, pas avec deleteStored', async () => {
  const future = '{"schemaVersion":2,"note":"enfant"}';
  const mem = memoryStorage({ 'pulaar:v1': future });
  const store = createPersistedStoreCore('pulaar:v1', blank(), {
    timeoutMs: 40,
    saveDelayMs: 0,
    storage: mem.storage,
  });
  mem.release(future);
  await tick();
  assert.deepEqual(store.deleteStored(DELETE_CONFIRMATION), { deleted: false, reason: 'locked' });
  assert.deepEqual(store.discardUnreadable('non'), { deleted: false, reason: 'confirmation' });
  await tick();
  assert.equal(mem.data['pulaar:v1'], future);
  assert.deepEqual(store.discardUnreadable(DELETE_CONFIRMATION), { deleted: true, reason: 'deleted' });
  await tick();
  assert.equal(mem.writes.filter((w) => w.op === 'remove').length, 1);
  assert.equal(store.exportRaw() == null || !String(store.exportRaw()).includes('enfant'), true);
});
