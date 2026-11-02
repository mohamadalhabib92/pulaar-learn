import assert from 'node:assert/strict';
import test from 'node:test';
import { mergeAppState } from './migrate.ts';
import { createPersistedStoreCore } from './persistCore.ts';

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
});
