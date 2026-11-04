// Garde-fou contre le crash au démarrage du build 13 (dyld « Symbol missing » dans ExpoFileSystem) :
// les modules natifs Expo doivent correspondre aux versions attendues par le SDK installé,
// sinon les binaires précompilés iOS ne s'accordent pas.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const pkg = JSON.parse(readFileSync(new URL('../package.json', import.meta.url)));
const bundled = require('expo/bundledNativeModules.json');
const ver = (n) => require(`${n}/package.json`).version;
const ok = (v, range) => {
  const m = String(range).match(/^([~^]?)(\d+)\.(\d+)\.(\d+)/);
  if (!m) return true;
  const [a, b, c] = v.split('.').map(Number), [, op, x, y, z] = m, [X, Y, Z] = [x, y, z].map(Number);
  if (op === '') return a === X && b === Y && c === Z;
  if (a !== X || (op === '~' && b !== Y)) return false;
  return b > Y || (b === Y && c >= Z);
};
test('modules natifs Expo alignés sur le SDK', () => {
  const bad = Object.keys({ ...pkg.dependencies, 'expo-modules-core': 1 })
    .filter((n) => bundled[n] && !ok(ver(n), bundled[n]))
    .map((n) => `${n}@${ver(n)} (attendu ${bundled[n]})`);
  assert.deepEqual(bad, []);
});
test('expo-modules-core expose EventEmitter.eventRuntime (requis par ExpoFileSystem précompilé)', () => {
  const src = readFileSync(require.resolve('expo-modules-core/package.json').replace('package.json', 'ios/Core/Events/EventEmitter.swift'), 'utf8');
  assert.match(src, /eventRuntime/);
});
