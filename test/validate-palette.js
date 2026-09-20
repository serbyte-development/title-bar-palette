'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {
  accentKeys,
  compactAccentKeys,
  compactPresetIndex,
  colorsForPreset,
  contrastRatio,
  legacyPresetIndex,
  presets,
} = require('../palette');

assert.equal(presets.length, 12, 'Expected exactly 12 colors');
assert.equal(new Set(presets.map(({ id }) => id)).size, presets.length, 'Preset IDs must be unique');
assert.equal(new Set(presets.map(({ darkBackground }) => darkBackground)).size, presets.length, 'Dark colors must be unique');
assert.equal(new Set(presets.map(({ lightBackground }) => lightBackground)).size, presets.length, 'Light colors must be unique');
assert.ok(accentKeys.includes('titleBar.activeBackground'), 'The preset must color the title bar');
assert.ok(accentKeys.includes('modernUI.shellBackground'), 'The preset must explicitly control the modern VS Code shell');

for (const preset of presets) {
  for (const variant of ['dark', 'light']) {
    const colors = colorsForPreset(preset, variant);
    assert.deepEqual(Object.keys(colors), accentKeys);
    assert.ok(
      contrastRatio(colors['commandCenter.background'], colors['commandCenter.foreground']) >= 4.5,
      `${preset.name} ${variant} Command Center colors must meet WCAG AA`,
    );
    assert.ok(
      contrastRatio(colors['titleBar.activeBackground'], colors['titleBar.activeForeground']) >= 4.5,
      `${preset.name} ${variant} title-bar colors must meet WCAG AA`,
    );
    assert.equal(colors['titleBar.activeBackground'], colors['commandCenter.background']);
    assert.notEqual(colors['modernUI.shellBackground'], colors['titleBar.activeBackground']);
    assert.ok(
      fs.existsSync(path.join(__dirname, '..', 'images', 'swatches', `${preset.id}-${variant}.png`)),
      `${preset.name} ${variant} swatch must exist`,
    );
  }
}

const previousCompactBlue = Object.fromEntries(
  compactAccentKeys.map((key) => [key, colorsForPreset(presets[0], 'dark')[key]]),
);
assert.equal(
  compactPresetIndex(previousCompactBlue),
  0,
  'The previous 0.2 compact Blue preset must be recognized for migration',
);

assert.equal(
  legacyPresetIndex({
    'titleBar.activeBackground': '#315BD6',
    'titleBar.activeForeground': '#FFFFFF',
    'titleBar.inactiveBackground': '#465CA4',
    'titleBar.inactiveForeground': '#FFFFFF',
  }),
  6,
  'Original 0.1.0 Cobalt must be recognized for migration',
);

assert.equal(
  legacyPresetIndex({
    'titleBar.activeBackground': '#075FC0',
    'titleBar.activeForeground': '#FFFFFF',
    'titleBar.inactiveBackground': '#075FC0',
    'titleBar.inactiveForeground': '#FFFFFF',
  }),
  0,
  'Recent 0.1.0 Blue must be recognized for migration',
);

console.log('Validated 12 theme-aware title-bar/shell colors, contrast, uniqueness, and migration signatures.');
