'use strict';

const accentKeys = [
  'commandCenter.background',
  'commandCenter.foreground',
  'commandCenter.inactiveForeground',
  'commandCenter.activeBackground',
  'commandCenter.activeForeground',
  'commandCenter.border',
  'commandCenter.activeBorder',
  'commandCenter.inactiveBorder',
  'window.activeBorder',
  'window.inactiveBorder',
  'titleBar.border',
];

const legacyTitleBarKeys = [
  'titleBar.activeBackground',
  'titleBar.activeForeground',
  'titleBar.inactiveBackground',
  'titleBar.inactiveForeground',
];

const presetDefinitions = [
  ['blue', 'Blue', '#2563EB', '#93C5FD'],
  ['violet', 'Violet', '#7C3AED', '#C4B5FD'],
  ['emerald', 'Emerald', '#047857', '#6EE7B7'],
  ['amber', 'Amber', '#A16207', '#FCD34D'],
  ['rose', 'Rose', '#BE123C', '#FDA4AF'],
  ['teal', 'Teal', '#0F766E', '#5EEAD4'],
  ['cyan', 'Cyan', '#0E7490', '#67E8F9'],
  ['indigo', 'Indigo', '#4338CA', '#A5B4FC'],
  ['fuchsia', 'Fuchsia', '#A21CAF', '#F0ABFC'],
  ['orange', 'Orange', '#C2410C', '#FDBA74'],
  ['lime', 'Lime', '#4D7C0F', '#BEF264'],
  ['pink', 'Pink', '#BE185D', '#F9A8D4'],
];

const originalLegacyDefinitions = [
  ['#36B67A', '#15202B', '#3C9D72', '#15202B'],
  ['#963D77', '#FFFFFF', '#81456D', '#FFFFFF'],
  ['#6E9E35', '#15202B', '#73954B', '#15202B'],
  ['#B83F5D', '#FFFFFF', '#984A5E', '#FFFFFF'],
  ['#187CB7', '#FFFFFF', '#266F99', '#FFFFFF'],
  ['#C6503E', '#FFFFFF', '#A75A4B', '#FFFFFF'],
  ['#315BD6', '#FFFFFF', '#465CA4', '#FFFFFF'],
  ['#AD552D', '#FFFFFF', '#925D40', '#FFFFFF'],
  ['#5B4BC4', '#FFFFFF', '#5F549B', '#FFFFFF'],
  ['#D49A00', '#15202B', '#B58B27', '#15202B'],
  ['#7E47B8', '#FFFFFF', '#74518F', '#FFFFFF'],
  ['#D9AA24', '#15202B', '#B89A43', '#15202B'],
];

const recentLegacyDefinitions = [
  ['#075FC0', '#7FA8F8', '#6B8FD4'],
  ['#6333AF', '#C09AF5', '#A482D2'],
  ['#2D8A36', '#9FD184', '#86B170'],
  ['#D56F03', '#F2A175', '#CE8964'],
  ['#BF2F2B', '#EE8FA6', '#CA788E'],
  ['#0B887D', '#79D3C7', '#65B4AA'],
  ['#1F8C69', '#70C9A4', '#5FAC8C'],
  ['#C34A3F', '#EF9085', '#CB7A71'],
  ['#453DB8', '#A5AEF7', '#8C94D2'],
  ['#B37E00', '#EACB76', '#C7AC65'],
  ['#087EA4', '#74C4DE', '#62A7BD'],
  ['#A13DB5', '#D19BE8', '#B184C6'],
];

function relativeLuminance(hex) {
  const channels = hex
    .slice(1)
    .match(/../g)
    .map((value) => parseInt(value, 16) / 255)
    .map((value) => value <= 0.04045
      ? value / 12.92
      : ((value + 0.055) / 1.055) ** 2.4);

  return (0.2126 * channels[0])
    + (0.7152 * channels[1])
    + (0.0722 * channels[2]);
}

function contrastRatio(first, second) {
  const lighter = Math.max(relativeLuminance(first), relativeLuminance(second));
  const darker = Math.min(relativeLuminance(first), relativeLuminance(second));
  return (lighter + 0.05) / (darker + 0.05);
}

const presets = presetDefinitions.map(([id, name, darkBackground, lightBackground]) => ({
  id,
  name,
  darkBackground,
  lightBackground,
}));

function colorsForPreset(preset, themeVariant) {
  const background = themeVariant === 'dark'
    ? preset.darkBackground
    : preset.lightBackground;
  const foreground = themeVariant === 'dark' ? '#FFFFFF' : '#111827';

  return {
    'commandCenter.background': background,
    'commandCenter.foreground': foreground,
    'commandCenter.inactiveForeground': foreground,
    'commandCenter.activeBackground': background,
    'commandCenter.activeForeground': foreground,
    'commandCenter.border': background,
    'commandCenter.activeBorder': background,
    'commandCenter.inactiveBorder': background,
    'window.activeBorder': background,
    'window.inactiveBorder': background,
    'titleBar.border': background,
  };
}

function legacyColors(activeBackground, activeForeground, inactiveBackground, inactiveForeground) {
  return {
    'titleBar.activeBackground': activeBackground,
    'titleBar.activeForeground': activeForeground,
    'titleBar.inactiveBackground': inactiveBackground,
    'titleBar.inactiveForeground': inactiveForeground,
  };
}

const legacyPresets = originalLegacyDefinitions.map((definition, index) => {
  const [darkBackground, lightBackground, lightInactiveBackground] = recentLegacyDefinitions[index];
  return [
    legacyColors(...definition),
    legacyColors(darkBackground, '#FFFFFF', darkBackground, '#FFFFFF'),
    legacyColors(lightBackground, '#000000', lightInactiveBackground, '#1E2030'),
  ];
});

function legacyPresetIndex(colors) {
  return legacyPresets.findIndex((variants) => variants.some((variant) =>
    legacyTitleBarKeys.every((key) => colors[key] === variant[key])));
}

module.exports = {
  accentKeys,
  colorsForPreset,
  contrastRatio,
  legacyPresetIndex,
  legacyTitleBarKeys,
  presets,
};
