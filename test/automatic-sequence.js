'use strict';

const assert = require('node:assert/strict');
const Module = require('node:module');
const {
  accentKeys,
  colorsForPreset,
  legacyTitleBarKeys,
  presets,
} = require('../palette');

let globalColors = {};
let workspaceColors = {};
const persistedState = new Map();
const registeredCommands = new Map();
let themeChangeHandler;

const vscode = {
  ColorThemeKind: {
    Light: 1,
    Dark: 2,
    HighContrast: 3,
    HighContrastLight: 4,
  },
  ConfigurationTarget: {
    Global: 1,
    Workspace: 2,
  },
  commands: {
    registerCommand: (name, handler) => {
      registeredCommands.set(name, handler);
      return { dispose() {} };
    },
  },
  window: {
    activeColorTheme: { kind: 2 },
    onDidChangeActiveColorTheme: (handler) => {
      themeChangeHandler = handler;
      return { dispose() {} };
    },
    showErrorMessage() {},
    showInformationMessage() {},
    showQuickPick() {},
  },
  workspace: {
    workspaceFile: undefined,
    workspaceFolders: [{}],
    getConfiguration: () => ({
      get: () => ({ ...globalColors, ...workspaceColors }),
      inspect: () => ({ workspaceValue: workspaceColors }),
      update: async (_key, value) => {
        workspaceColors = value;
      },
    }),
  },
};

const originalLoad = Module._load;
Module._load = function load(request, parent, isMain) {
  return request === 'vscode'
    ? vscode
    : originalLoad.call(this, request, parent, isMain);
};

const { activate } = require('../extension');
Module._load = originalLoad;

function context() {
  return {
    subscriptions: [],
    globalState: {
      get: (key) => persistedState.get(key),
      update: async (key, value) => persistedState.set(key, value),
    },
  };
}

async function openNewWorkspace() {
  workspaceColors = {};
  await activate(context());
  return { ...workspaceColors };
}

function expectedPreset(preset, variant = 'dark') {
  return colorsForPreset(preset, variant);
}

(async () => {
  vscode.workspace.workspaceFolders = undefined;
  await activate(context());
  assert.deepEqual(workspaceColors, {}, 'Empty windows must not write global color settings');
  assert.equal(persistedState.size, 0, 'Empty windows must not advance the sequence');
  vscode.workspace.workspaceFolders = [{}];

  globalColors = {
    'titleBar.activeBackground': '#FF0000',
    'titleBar.activeForeground': '#FFFFFF',
    'titleBar.inactiveBackground': '#990000',
    'titleBar.inactiveForeground': '#FFFFFF',
  };
  persistedState.clear();
  assert.deepEqual(
    await openNewWorkspace(),
    expectedPreset(presets[0]),
    'Global title-bar customizations must not make a fresh workspace look configured',
  );
  globalColors = {};

  persistedState.clear();
  for (let index = 0; index < presets.length; index += 1) {
    assert.deepEqual(
      await openNewWorkspace(),
      expectedPreset(presets[index]),
      `Automatic sequence must apply preset ${index + 1}/${presets.length}`,
    );
  }
  assert.deepEqual(
    await openNewWorkspace(),
    expectedPreset(presets[0]),
    'Automatic sequence must wrap to the first preset',
  );

  workspaceColors = expectedPreset(presets[7]);
  await activate(context());
  assert.deepEqual(workspaceColors, expectedPreset(presets[7]), 'Existing preset must remain unchanged');
  assert.deepEqual(await openNewWorkspace(), expectedPreset(presets[8]), 'Existing known preset must re-anchor the sequence');

  const customColors = Object.fromEntries(accentKeys.map((key, index) => [key, `custom-${index}`]));
  workspaceColors = { ...customColors };
  await activate(context());
  assert.deepEqual(workspaceColors, customColors, 'Complete custom accent colors must remain unchanged');
  assert.deepEqual(await openNewWorkspace(), expectedPreset(presets[9]), 'Custom accents must not advance the sequence');

  workspaceColors = {
    'commandCenter.background': '#000000',
    'editor.background': '#123456',
  };
  await activate(context());
  assert.equal(workspaceColors['editor.background'], '#123456', 'Unrelated color customizations must be preserved');
  assert.deepEqual(
    Object.fromEntries(accentKeys.map((key) => [key, workspaceColors[key]])),
    expectedPreset(presets[10]),
    'Partial accent configuration must be replaced as one complete preset',
  );

  persistedState.clear();
  workspaceColors = {
    'titleBar.activeBackground': '#315BD6',
    'titleBar.activeForeground': '#FFFFFF',
    'titleBar.inactiveBackground': '#465CA4',
    'titleBar.inactiveForeground': '#FFFFFF',
    'editor.background': '#123456',
  };
  await activate(context());
  assert.deepEqual(
    Object.fromEntries(accentKeys.map((key) => [key, workspaceColors[key]])),
    expectedPreset(presets[6]),
    'Known 0.1.0 colors must migrate to the equivalent sequence slot',
  );
  assert.ok(
    legacyTitleBarKeys.every((key) => !(key in workspaceColors)),
    'Known legacy title-bar keys must be removed during migration',
  );
  assert.equal(workspaceColors['editor.background'], '#123456', 'Migration must preserve unrelated customizations');

  persistedState.clear();
  workspaceColors = expectedPreset(presets[0]);
  vscode.window.showQuickPick = async (items) => items[5];
  await activate(context());
  await registeredCommands.get('titleBarPalette.selectColor')();
  assert.deepEqual(workspaceColors, expectedPreset(presets[5]), 'Manual selection must replace the accent colors');
  assert.deepEqual(await openNewWorkspace(), expectedPreset(presets[6]), 'Manual selection must move the automatic pointer to the following color');

  workspaceColors = expectedPreset(presets[3], 'light');
  vscode.window.activeColorTheme = { kind: vscode.ColorThemeKind.Light };
  await activate(context());
  assert.deepEqual(workspaceColors, expectedPreset(presets[3], 'light'), 'Light themes must use the light preset');

  vscode.window.activeColorTheme = { kind: vscode.ColorThemeKind.Dark };
  await themeChangeHandler(vscode.window.activeColorTheme);
  assert.deepEqual(workspaceColors, expectedPreset(presets[3], 'dark'), 'Dark themes must use the dark preset');

  vscode.window.activeColorTheme = { kind: vscode.ColorThemeKind.HighContrastLight };
  await themeChangeHandler(vscode.window.activeColorTheme);
  assert.deepEqual(workspaceColors, expectedPreset(presets[3], 'light'), 'High-contrast light themes must use the light preset');

  vscode.window.activeColorTheme = { kind: vscode.ColorThemeKind.HighContrast };
  await themeChangeHandler(vscode.window.activeColorTheme);
  assert.deepEqual(workspaceColors, expectedPreset(presets[3], 'dark'), 'High-contrast dark themes must use the dark preset');

  console.log('Validated workspace-scoped assignment, migration, full cycling, manual selection, and theme updates.');
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
