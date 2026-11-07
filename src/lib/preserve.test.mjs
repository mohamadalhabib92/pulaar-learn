import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';
import { inspectStored, SCHEMA_VERSION } from './preserve.ts';

const legacy = {
  lang: 'fr',
  xp: 12,
  imports: [{ id: 'imp-1', title: 'Salut', uri: null, lessonId: 'pc-3', createdAt: 1 }],
  bookmarks: [{ id: 'b1' }],
};

test('un objet ancien sans schemaVersion reste compatible et garde les champs inconnus', () => {
  const raw = JSON.stringify(legacy);
  const report = inspectStored(raw);
  assert.equal(report.kind, 'ok');
  assert.equal(report.value.xp, 12);
  assert.deepEqual(report.value.bookmarks, [{ id: 'b1' }]);
  assert.equal(report.value.schemaVersion, undefined);
  assert.equal(SCHEMA_VERSION, 1);
});

test('schemaVersion 1 est accepté', () => {
  const report = inspectStored(JSON.stringify({ ...legacy, schemaVersion: 1 }));
  assert.equal(report.kind, 'ok');
  assert.equal(report.value.schemaVersion, 1);
});

test('une version future, un tableau, null et un champ de mauvais type sont incompatibles', () => {
  assert.equal(inspectStored('{"schemaVersion":2,"xp":1}').reason, 'future-schema');
  assert.equal(inspectStored('[]').reason, 'not-object');
  assert.equal(inspectStored('null').reason, 'not-object');
  assert.equal(inspectStored('"texte"').reason, 'not-object');
  assert.equal(inspectStored('{"schemaVersion":1.5}').reason, 'invalid-schema-version');
  assert.equal(inspectStored('{"schemaVersion":"1"}').reason, 'invalid-schema-version');
  assert.equal(inspectStored('{"xp":"40","imports":[]}').reason, 'bad-field:xp');
  assert.equal(inspectStored('{"imports":{"id":"x"}}').reason, 'bad-field:imports');
  assert.equal(inspectStored('{"lessons":{"pc-1":"vu"}}').reason, 'bad-field:lessons');
});

test('le texte brut illisible est rendu tel quel', () => {
  const raw = '{pas du json';
  const report = inspectStored(raw);
  assert.equal(report.kind, 'malformed');
  assert.equal(report.raw, raw);
  assert.equal(report.value, undefined);
});

test('une chaîne vide est une absence de sauvegarde, pas un fichier cassé', () => {
  assert.equal(inspectStored(null).kind, 'empty');
  assert.equal(inspectStored('').kind, 'empty');
});

test('la persistance ne supprime pas les fichiers audio', () => {
  for (const name of ['persistCore.ts', 'migrate.ts', 'preserve.ts', 'store.ts']) {
    const src = readFileSync(new URL(`./${name}`, import.meta.url), 'utf8');
    assert.equal(src.includes('deleteImportFile'), false, name);
    assert.equal(src.includes("from './audioFiles'"), false, name);
    assert.equal(src.includes('from "../lib/audioFiles"'), false, name);
  }
});
