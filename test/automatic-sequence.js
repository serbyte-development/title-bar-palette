'use strict';

const assert = require('node:assert/strict');
const Module = require('node:module');
const { presets, titleBarKeys } = require('../palette');

let effectiveColors = {};
let workspaceColors = {};
const persistedState = new Map();
const registeredCommands = new Map();

const vscode = {
  ConfigurationTarget: {
    Global: 1,
    Workspace: 2,
  },
  Uri: {
    joinPath: (...parts) => parts.join('/'),
  },
  commands: {
    registerCommand: (name, handler) => {
      registeredCommands.set(name, handler);
      return { dispose() {} };
    },
  },
  window: {
    showErrorMessage() {},
    showInformationMessage() {},
    showQuickPick() {},
  },
  workspace: {
    workspaceFile: undefined,
    workspaceFolders: [{}],
    getConfiguration: () => ({
      get: () => effectiveColors,
      inspect: () => ({ workspaceValue: workspaceColors }),
      update: async (_key, value) => {
        workspaceColors = value;
        effectiveColors = value;
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
    extensionUri: '/extension',
    subscriptions: [],
    globalState: {
      get: (key) => persistedState.get(key),
      update: async (key, value) => persistedState.set(key, value),
    },
  };
}

async function openNewWorkspace() {
  effectiveColors = {};
  workspaceColors = {};
  await activate(context());
  return workspaceColors['titleBar.activeBackground'];
}

(async () => {
  vscode.workspace.workspaceFolders = undefined;
  await activate(context());
  assert.deepEqual(workspaceColors, {}, 'Empty windows must not write global color settings');
  assert.equal(persistedState.size, 0, 'Empty windows must not advance the sequence');
  vscode.workspace.workspaceFolders = [{}];

  assert.equal(await openNewWorkspace(), presets[0].colors['titleBar.activeBackground']);
  assert.equal(await openNewWorkspace(), presets[1].colors['titleBar.activeBackground']);

  effectiveColors = { ...presets[7].colors };
  workspaceColors = { ...presets[7].colors };
  await activate(context());
  assert.deepEqual(workspaceColors, presets[7].colors, 'Existing preset must remain unchanged');
  assert.equal(await openNewWorkspace(), presets[8].colors['titleBar.activeBackground'], 'Existing known preset must re-anchor the sequence');

  const customColors = Object.fromEntries(titleBarKeys.map((key, index) => [key, `custom-${index}`]));
  effectiveColors = { ...customColors };
  workspaceColors = { ...customColors };
  await activate(context());
  assert.deepEqual(workspaceColors, customColors, 'Complete custom title bar must remain unchanged');
  assert.equal(await openNewWorkspace(), presets[9].colors['titleBar.activeBackground'], 'Custom colors must not advance the sequence');

  effectiveColors = {
    'titleBar.activeBackground': '#000000',
    'editor.background': '#123456',
  };
  workspaceColors = { ...effectiveColors };
  await activate(context());
  assert.equal(workspaceColors['editor.background'], '#123456', 'Unrelated color customizations must be preserved');
  assert.deepEqual(
    Object.fromEntries(titleBarKeys.map((key) => [key, workspaceColors[key]])),
    presets[10].colors,
    'Partial title bar configuration must be replaced as one complete preset',
  );

  persistedState.clear();
  effectiveColors = { ...presets[0].colors };
  workspaceColors = { ...presets[0].colors };
  vscode.window.showQuickPick = async (items) => items[5];
  await activate(context());
  await registeredCommands.get('titleBarPalette.selectColor')();
  assert.deepEqual(workspaceColors, presets[5].colors, 'Manual selection must replace the four title bar colors');
  assert.equal(await openNewWorkspace(), presets[6].colors['titleBar.activeBackground'], 'Manual selection must move the automatic pointer to the following color');

  console.log('Validated automatic sequence, re-anchoring, skipping, partial replacement, and manual selection.');
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
