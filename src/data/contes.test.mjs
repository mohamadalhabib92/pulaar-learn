import assert from 'node:assert/strict';
import { test } from 'node:test';
import { EPISODES, SECTION_ORDER, SERIES, filledSections } from './contes.ts';
import { TARO, TARO_PROGRESSION } from './taro.ts';

test('le format compte exactement 7 parties, dans l’ordre de la méthode', () => {
  assert.deepEqual([...SECTION_ORDER], ['story', 'vocab', 'letters', 'dialogue', 'games', 'song', 'parents']);
  for (const e of EPISODES) for (const k of SECTION_ORDER) assert.ok(k in e, `${e.id} : partie ${k} absente`);
});

test('chaque texte pulaar IA est « à relire », jamais validé', () => {
  for (const e of EPISODES) {
    assert.equal(e.review, 'a_relire', e.id);
    assert.equal(e.aiGenerated, true, e.id);
    assert.ok(e.reviewNotes.length > 0, `${e.id} : notes de relecture manquantes`);
  }
  const src = JSON.stringify(EPISODES);
  assert.ok(!/valide_natif|"relu"/.test(src));
});

test('le chapitre 1 est complet (7/7) et les histoires se terminent par « Waalee e jam »', () => {
  const ch1 = EPISODES.find((e) => e.id === 'conte-v1-ch1');
  assert.equal(filledSections(ch1), 7);
  assert.equal(SERIES.ending, 'Waalee e jam');
  for (const e of EPISODES.filter((x) => x.story.pu)) assert.match(e.story.pu.at(-1), /Waalee e jam/);
});

test('le vocabulaire est en 4 langues', () => {
  for (const e of EPISODES)
    for (const g of e.vocab ?? [])
      for (const w of g.words) for (const l of ['pu', 'ar', 'fr', 'be']) assert.ok(w[l]?.trim(), `${e.id}/${w.key} : ${l}`);
});

test('ids uniques', () => {
  assert.equal(new Set(EPISODES.map((e) => e.id)).size, EPISODES.length);
});

test('Taro CP : licence et attribution présentes, lettres des contes dans la progression', () => {
  assert.equal(TARO.license, 'CC BY 4.0 IGO');
  assert.match(TARO.sourceUrl, /^https:\/\/senprof\.education\.sn\//);
  assert.match(TARO.attribution.fr, /CC BY 4\.0 IGO/);
  const all = new Set(TARO_PROGRESSION.flatMap((s) => s.letters));
  for (const e of EPISODES) for (const l of e.letters?.pulaar ?? []) assert.ok(all.has(l), `${e.id} : lettre ${l}`);
});

test('corrections de Mohamed du 04.11.2026 appliquées (toujours à relire)', () => {
  const words = Object.fromEntries(EPISODES.flatMap((e) => (e.vocab ?? []).flatMap((g) => g.words)).map((w) => [w.key, w]));
  assert.equal(words['Chameau'].pu, 'Ngelooba');
  assert.equal(words['Gazelle'].pu, 'Lella');
  assert.equal(words['Faucon'].pu, 'Ciilal');
  assert.equal(words['Grand frère'].pu, 'Mawniraaɗo');
  assert.equal(words['Petit frère'].pu, 'Miñiraaɗo');
  assert.equal(words['Grand-père'].pu, 'Taaniraaɗo');
  assert.equal(words['Bonjour'].be, 'Grüessech');
  assert.equal(words['Vache'].be, 'Chue');
  // Hors notes de relecture, plus aucune ancienne forme.
  const body = JSON.stringify(EPISODES.map(({ reviewNotes, ...e }) => e));
  assert.ok(!/Njamdi|Loopo|Buutuuru|Mawniraawo|Grüezi|Chuei|ɓe njari, ɓe njari/i.test(body));
  assert.match(body, /Binta Lella/);
  assert.match(body, /Ɓe ngarii, ɓe njari ndiyam/);
  for (const e of EPISODES) assert.equal(e.review, 'a_relire');
});

test('Ch. 3 présent, 7 parties, seule l’histoire est remplie, à relire', () => {
  const ch3 = EPISODES.find((e) => e.id === 'conte-v1-ch3');
  assert.ok(ch3);
  for (const k of SECTION_ORDER) assert.ok(k in ch3, k);
  assert.equal(filledSections(ch3), 1);
  for (const k of ['vocab', 'letters', 'dialogue', 'games', 'song', 'parents']) assert.equal(ch3[k], null, k);
  assert.equal(ch3.review, 'a_relire');
  assert.match(ch3.story.pu.at(-1), /Waalee e jam/);
  assert.ok(ch3.reviewNotes.some((n) => /piindi/.test(n)) && ch3.reviewNotes.some((n) => /bodeeri/.test(n)));
});

test('Bojel : nouvel ordre des mots présent, ancien absent hors notes', () => {
  const body = JSON.stringify(EPISODES.map(({ reviewNotes, ...e }) => e));
  assert.match(body, /Bojel yiyi lekki mawki/);
  assert.ok(!/Bojel, lekki mawki yiyi/.test(body));
});
