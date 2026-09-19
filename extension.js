'use strict';

const vscode = require('vscode');
const {
  accentKeys,
  colorsForPreset,
  legacyPresetIndex,
  legacyTitleBarKeys,
  presets,
} = require('./palette');

const nextAutomaticPresetIndexKey = 'nextAutomaticPresetIndex';

function hasWorkspace() {
  return Boolean(vscode.workspace.workspaceFile || vscode.workspace.workspaceFolders?.length);
}

function workspaceValue(inspected) {
  if (!inspected) {
    return {};
  }

  const value = inspected.workspaceValue;
  return value && typeof value === 'object' ? value : {};
}

function workspaceColors() {
  const workbench = vscode.workspace.getConfiguration('workbench');
  return workspaceValue(workbench.inspect('colorCustomizations'));
}

function matchingPresetIndex(colors) {
  return presets.findIndex((preset) => ['dark', 'light'].some((variant) => {
    const expected = colorsForPreset(preset, variant);
    return accentKeys.every((key) => colors[key] === expected[key]);
  }));
}

function themeVariant() {
  const kind = vscode.window.activeColorTheme.kind;
  return kind === vscode.ColorThemeKind.Dark || kind === vscode.ColorThemeKind.HighContrast
    ? 'dark'
    : 'light';
}

function nextPresetIndex(index) {
  return (index + 1) % presets.length;
}

function storedPresetIndex(context) {
  const index = context.globalState.get(nextAutomaticPresetIndexKey);
  return Number.isInteger(index) && index >= 0 && index < presets.length ? index : 0;
}

async function setNextPresetIndex(context, index) {
  await context.globalState.update(nextAutomaticPresetIndexKey, index);
}

async function writePreset(preset, removeLegacy = false) {
  const workbench = vscode.workspace.getConfiguration('workbench');
  const nextColors = { ...workspaceColors() };

  if (removeLegacy) {
    for (const key of legacyTitleBarKeys) {
      delete nextColors[key];
    }
  }

  await workbench.update(
    'colorCustomizations',
    { ...nextColors, ...colorsForPreset(preset, themeVariant()) },
    vscode.ConfigurationTarget.Workspace,
  );
}

async function syncThemePreset() {
  if (!hasWorkspace()) {
    return;
  }

  const colors = workspaceColors();
  const presetIndex = matchingPresetIndex(colors);
  if (presetIndex < 0) {
    return;
  }

  const expectedColors = colorsForPreset(presets[presetIndex], themeVariant());
  if (accentKeys.every((key) => colors[key] === expectedColors[key])) {
    return;
  }

  const workbench = vscode.workspace.getConfiguration('workbench');
  await workbench.update(
    'colorCustomizations',
    { ...colors, ...expectedColors },
    vscode.ConfigurationTarget.Workspace,
  );
}

async function initializeAccent(context) {
  if (!hasWorkspace()) {
    return;
  }

  const colors = workspaceColors();
  const accentIsConfigured = accentKeys.every((key) => key in colors);

  if (accentIsConfigured) {
    const currentIndex = matchingPresetIndex(colors);
    if (currentIndex >= 0) {
      await syncThemePreset();
      await setNextPresetIndex(context, nextPresetIndex(currentIndex));
    }
    return;
  }

  const legacyIndex = legacyPresetIndex(colors);
  if (legacyIndex >= 0) {
    await writePreset(presets[legacyIndex], true);
    await setNextPresetIndex(context, nextPresetIndex(legacyIndex));
    return;
  }

  const presetIndex = storedPresetIndex(context);
  await writePreset(presets[presetIndex]);
  await setNextPresetIndex(context, nextPresetIndex(presetIndex));
}

async function selectColor(context) {
  if (!hasWorkspace()) {
    void vscode.window.showInformationMessage('Open a folder or workspace to set a title bar accent.');
    return;
  }

  const colors = workspaceColors();
  const currentIndex = matchingPresetIndex(colors);
  const items = presets.map((preset, index) => ({
    label: preset.name,
    description: `${index === currentIndex ? 'Current  •  ' : ''}${colorsForPreset(preset, themeVariant())['commandCenter.background']}`,
    preset,
    index,
  }));

  const selection = await vscode.window.showQuickPick(items, {
    title: 'Title Bar Palette',
    placeHolder: 'Choose a title bar accent color',
    matchOnDescription: true,
  });

  if (!selection) {
    return;
  }

  await writePreset(selection.preset, legacyPresetIndex(colors) >= 0);
  await setNextPresetIndex(context, nextPresetIndex(selection.index));
}

async function activate(context) {
  context.subscriptions.push(
    vscode.commands.registerCommand(
      'titleBarPalette.selectColor',
      () => selectColor(context),
    ),
    vscode.window.onDidChangeActiveColorTheme(() => {
      void syncThemePreset().catch((error) => {
        void vscode.window.showErrorMessage(
          `Title Bar Palette could not update the accent colors: ${error instanceof Error ? error.message : String(error)}`,
        );
      });
    }),
  );

  try {
    await initializeAccent(context);
  } catch (error) {
    void vscode.window.showErrorMessage(
      `Title Bar Palette could not initialize: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}

function deactivate() {}

module.exports = { activate, deactivate };
