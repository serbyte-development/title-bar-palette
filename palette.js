'use strict';

const titleBarKeys = [
  'titleBar.activeBackground',
  'titleBar.activeForeground',
  'titleBar.inactiveBackground',
  'titleBar.inactiveForeground',
];

const presetDefinitions = [
  ['emerald', 'Emerald', '#36B67A', '#15202B', '#3C9D72', '#15202B'],
  ['plum', 'Plum', '#963D77', '#FFFFFF', '#81456D', '#FFFFFF'],
  ['moss', 'Moss', '#6E9E35', '#15202B', '#73954B', '#15202B'],
  ['rose', 'Rose', '#B83F5D', '#FFFFFF', '#984A5E', '#FFFFFF'],
  ['ocean', 'Ocean', '#187CB7', '#FFFFFF', '#266F99', '#FFFFFF'],
  ['coral', 'Coral', '#C6503E', '#FFFFFF', '#A75A4B', '#FFFFFF'],
  ['cobalt', 'Cobalt', '#315BD6', '#FFFFFF', '#465CA4', '#FFFFFF'],
  ['rust', 'Rust', '#AD552D', '#FFFFFF', '#925D40', '#FFFFFF'],
  ['indigo', 'Indigo', '#5B4BC4', '#FFFFFF', '#5F549B', '#FFFFFF'],
  ['amber', 'Amber', '#D49A00', '#15202B', '#B58B27', '#15202B'],
  ['violet', 'Violet', '#7E47B8', '#FFFFFF', '#74518F', '#FFFFFF'],
  ['gold', 'Gold', '#D9AA24', '#15202B', '#B89A43', '#15202B'],
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

const presets = presetDefinitions.map(([
  id,
  name,
  activeBackground,
  activeForeground,
  inactiveBackground,
  inactiveForeground,
]) => ({
  id,
  name,
  colors: {
    'titleBar.activeBackground': activeBackground,
    'titleBar.activeForeground': activeForeground,
    'titleBar.inactiveBackground': inactiveBackground,
    'titleBar.inactiveForeground': inactiveForeground,
  },
}));

module.exports = { contrastRatio, presets, titleBarKeys };
