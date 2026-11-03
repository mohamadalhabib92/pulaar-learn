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
