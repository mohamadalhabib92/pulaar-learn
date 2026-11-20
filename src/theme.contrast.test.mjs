import assert from 'node:assert/strict';
import test from 'node:test';
import { resolvePalette } from './theme.ts';

function channel(c) {
  const x = c / 255;
  return x <= 0.04045 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4;
}

function parse(input) {
  if (input.startsWith('#')) {
    const n = parseInt(input.slice(1), 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255, 1];
  }
  const m = String(input).match(/rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*([0-9.]+)\s*)?\)/);
  if (!m) throw new Error(`couleur illisible: ${input}`);
  return [Number(m[1]), Number(m[2]), Number(m[3]), m[4] == null ? 1 : Number(m[4])];
}

function blend(fg, bg) {
  const [r, g, b, a] = parse(fg);
  const [R, G, B] = parse(bg);
  return [r, g, b].map((v, i) => Math.round(v * a + [R, G, B][i] * (1 - a)));
}

function lum(rgb) {
  const [r, g, b] = rgb;
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}

function contrast(a, b) {
  const left = Array.isArray(a) ? a : parse(a).slice(0, 3);
  const right = Array.isArray(b) ? b : parse(b).slice(0, 3);
  const L1 = lum(left);
  const L2 = lum(right);
  const [hi, lo] = L1 > L2 ? [L1, L2] : [L2, L1];
  return (hi + 0.05) / (lo + 0.05);
}

const pairs = [
  ['text', 'bg'],
  ['text', 'surfaceSolid'],
  ['muted', 'bg'],
  ['muted', 'surfaceSolid'],
  ['muted', 'surfaceAlt'],
  ['onPrimary', 'primaryFill'],
  ['onPrimaryMuted', 'primaryFill'],
  ['primary', 'bg'],
  ['primary', 'surfaceSolid'],
  ['primary', 'primarySoft'],
  ['accentInk', 'accentFill'],
  ['accentText', 'accentSoft'],
  ['accent', 'bg'],
  ['accent', 'surfaceSolid'],
  ['danger', 'surfaceSolid'],
  ['danger', 'dangerSoft'],
  ['onPrimary', 'dangerFill'],
  ['highlightInk', 'highlight'],
  ['ok', 'surfaceSolid'],
  ['ok', 'okSoft'],
  ['flame', 'bg'],
  ['flame', 'surfaceSolid'],
];

for (const mode of ['light', 'dark']) {
  test(`contrastes AA — ${mode}`, () => {
    const solid = resolvePalette(mode, true);
    const glass = resolvePalette(mode, false);
    assert.equal(solid.translucent, false);
    assert.equal(solid.surface, solid.surfaceSolid);
    assert.equal(glass.translucent, true);
    assert.equal(glass.surface, glass.glass);
    for (const [fg, bg] of pairs) {
      const ratio = contrast(solid[fg], solid[bg]);
      assert.ok(ratio >= 4.5, `${mode} ${fg}/${bg} = ${ratio.toFixed(2)}`);
    }
    const behind = blend(glass.glass, glass.bg);
    for (const fg of ['text', 'muted', 'primary', 'accent']) {
      const ratio = contrast(glass[fg], behind);
      assert.ok(ratio >= 4.5, `${mode} ${fg} sur verre = ${ratio.toFixed(2)}`);
    }
  });
}
