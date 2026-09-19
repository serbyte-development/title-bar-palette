# Title Bar Palette

[![CI](https://github.com/Serbyte-Development/title-bar-palette/actions/workflows/ci.yml/badge.svg)](https://github.com/Serbyte-Development/title-bar-palette/actions/workflows/ci.yml)
[![Visual Studio Marketplace Version](https://img.shields.io/visual-studio-marketplace/v/serbytedevelopment.title-bar-palette)](https://marketplace.visualstudio.com/items?itemName=serbytedevelopment.title-bar-palette)
[![Visual Studio Marketplace Installs](https://img.shields.io/visual-studio-marketplace/i/serbytedevelopment.title-bar-palette)](https://marketplace.visualstudio.com/items?itemName=serbytedevelopment.title-bar-palette)
[![Open VSX Version](https://img.shields.io/open-vsx/v/serbytedevelopment/title-bar-palette)](https://open-vsx.org/extension/serbytedevelopment/title-bar-palette)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

Automatically give each VS Code or Cursor workspace a distinct title-bar accent color. No setup, theme replacement, or extra panel required.

- **Identify windows quickly.** New workspaces rotate through 12 curated colors.
- **Fits current VS Code.** The accent colors the Command Center and thin window/title borders, keeping the modern UI shell on the active theme.
- **Works in Cursor.** The same compact accent keys are supported by Cursor.
- **Assigns automatically.** The sequence persists after VS Code or Cursor is closed and reopened.
- **Respects workspace settings.** A complete workspace-level accent remains unchanged.
- **Choose manually.** `Title Bar Palette: Select Color` opens the 12-color picker.

**Developed & maintained by [Serbyte Development](https://www.serbyte.net/)** · [GitHub](https://github.com/Serbyte-Development)

## How it works

Title Bar Palette writes a small workspace accent through `workbench.colorCustomizations`:

- `commandCenter.background`
- `commandCenter.foreground`
- `commandCenter.inactiveForeground`
- `commandCenter.activeBackground`
- `commandCenter.activeForeground`
- `commandCenter.border`
- `commandCenter.activeBorder`
- `commandCenter.inactiveBorder`
- `window.activeBorder`
- `window.inactiveBorder`
- `titleBar.border`

Fresh workspaces use the next palette color. The extension checks the workspace-scoped value directly, so user-level color customizations do not suppress automatic assignment.

Version 0.2 migrates recognized 0.1 title-bar presets to the compact accent and removes the four old workspace-level `titleBar.*Background` / `titleBar.*Foreground` values. Unrelated color customizations remain unchanged.

Empty untitled windows are left alone because Title Bar Palette writes only to workspace settings.

## Colors

| Color | Dark theme | Light theme |
| --- | --- | --- |
| Blue | `#2563EB` | `#93C5FD` |
| Violet | `#7C3AED` | `#C4B5FD` |
| Emerald | `#047857` | `#6EE7B7` |
| Amber | `#A16207` | `#FCD34D` |
| Rose | `#BE123C` | `#FDA4AF` |
| Teal | `#0F766E` | `#5EEAD4` |
| Cyan | `#0E7490` | `#67E8F9` |
| Indigo | `#4338CA` | `#A5B4FC` |
| Fuchsia | `#A21CAF` | `#F0ABFC` |
| Orange | `#C2410C` | `#FDBA74` |
| Lime | `#4D7C0F` | `#BEF264` |
| Pink | `#BE185D` | `#F9A8D4` |

Dark variants use white text. Light variants use `#111827`. Every Command Center text/background pair meets WCAG AA contrast.

## Why the full title bar changed

Current VS Code uses `titleBar.activeBackground` as the default for `modernUI.shellBackground`. A full title-bar tint can therefore color the larger shell around the workbench. Version 0.2 uses smaller title-bar surfaces that keep the window identity visible without tinting that shell.

If your User settings already contain `titleBar.activeBackground`, `titleBar.activeForeground`, `titleBar.inactiveBackground`, or `titleBar.inactiveForeground`, those user-level values still affect the editor. Remove them from User settings if you want the compact accent by itself.

## Command

Open the Command Palette and run **Title Bar Palette: Select Color** to choose any preset for the current workspace.

Manual selection also moves the automatic sequence to the following preset.

## Compatibility

Title Bar Palette uses standard VS Code workspace configuration APIs and has no native dependencies. It is designed for desktop VS Code and Cursor.

`window.activeBorder` and `window.inactiveBorder` are visible on macOS and Linux when custom window chrome supports them. The Command Center and title-bar border provide the accent on other layouts.

## Development

```sh
npm install
npm test
npm run package
```

## Support

For bugs, compatibility issues, or focused feature requests, see [SUPPORT.md](SUPPORT.md).

## License

MIT.
