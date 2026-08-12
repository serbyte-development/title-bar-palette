'use strict';

const vscode = require('vscode');
const { presets, titleBarKeys } = require('./palette');

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

function effectiveColors() {
  const value = vscode.workspace
    .getConfiguration('workbench')
    .get('colorCustomizations');

  return value && typeof value === 'object' ? value : {};
}

function matchingPresetIndex(colors) {
  return presets.findIndex((preset) =>
    titleBarKeys.every((key) => colors[key] === preset.colors[key]));
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

async function writePreset(preset) {
  const workbench = vscode.workspace.getConfiguration('workbench');
  const currentWorkspaceValue = workspaceValue(workbench.inspect('colorCustomizations'));

  await workbench.update(
    'colorCustomizations',
    { ...currentWorkspaceValue, ...preset.colors },
    vscode.ConfigurationTarget.Workspace,
  );
}

async function initializeTitleBar(context) {
  if (!hasWorkspace()) {
    return;
  }

  const colors = effectiveColors();
  const titleBarIsConfigured = titleBarKeys.every((key) => key in colors);

  if (titleBarIsConfigured) {
    const currentIndex = matchingPresetIndex(colors);
    if (currentIndex >= 0) {
      await setNextPresetIndex(context, nextPresetIndex(currentIndex));
    }
    return;
  }

  const presetIndex = storedPresetIndex(context);
  await writePreset(presets[presetIndex]);
  await setNextPresetIndex(context, nextPresetIndex(presetIndex));
}

async function selectColor(context) {
  if (!hasWorkspace()) {
    void vscode.window.showInformationMessage('Open a folder or workspace to set a title bar color.');
    return;
  }

  const currentIndex = matchingPresetIndex(effectiveColors());
  const items = presets.map((preset, index) => ({
    label: preset.name,
    description: `${index === currentIndex ? 'Current  •  ' : ''}${preset.colors['titleBar.activeBackground']}`,
    iconPath: vscode.Uri.joinPath(
      context.extensionUri,
      'assets',
      'swatches',
      `${preset.id}.png`,
    ),
    preset,
    index,
  }));

  const selection = await vscode.window.showQuickPick(items, {
    title: 'Title Bar Palette',
    placeHolder: 'Choose a title bar color',
    matchOnDescription: true,
  });

  if (!selection) {
    return;
  }

  await writePreset(selection.preset);
  await setNextPresetIndex(context, nextPresetIndex(selection.index));
}

async function activate(context) {
  context.subscriptions.push(
    vscode.commands.registerCommand(
      'titleBarPalette.selectColor',
      () => selectColor(context),
    ),
  );

  try {
    await initializeTitleBar(context);
  } catch (error) {
    void vscode.window.showErrorMessage(
      `Title Bar Palette could not initialize: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}

function deactivate() {}

module.exports = { activate, deactivate };
