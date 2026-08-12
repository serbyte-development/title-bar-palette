'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { contrastRatio, presets, titleBarKeys } = require('../palette');

assert.equal(presets.length, 12, 'Expected exactly 12 base colors');
assert.equal(new Set(presets.map(({ id }) => id)).size, presets.length, 'Preset IDs must be unique');

for (const preset of presets) {
  assert.deepEqual(Object.keys(preset.colors), titleBarKeys);
  assert.ok(
    contrastRatio(
      preset.colors['titleBar.activeBackground'],
      preset.colors['titleBar.activeForeground'],
    ) >= 4.5,
    `${preset.name} active colors must meet WCAG AA`,
  );
  assert.ok(
    contrastRatio(
      preset.colors['titleBar.inactiveBackground'],
      preset.colors['titleBar.inactiveForeground'],
    ) >= 4.5,
    `${preset.name} inactive colors must meet WCAG AA`,
  );
  assert.ok(
    fs.existsSync(path.join(__dirname, '..', 'assets', 'swatches', `${preset.id}.png`)),
    `${preset.name} must have a picker swatch`,
  );
}

console.log('Validated 12 title bar colors; every text/background pair meets WCAG AA.');
