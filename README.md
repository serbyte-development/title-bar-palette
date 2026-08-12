# Title Bar Palette

[![CI](https://github.com/Serbyte-Development/title-bar-palette/actions/workflows/ci.yml/badge.svg)](https://github.com/Serbyte-Development/title-bar-palette/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

<!--
[![Visual Studio Marketplace Version](https://img.shields.io/visual-studio-marketplace/v/serbytedevelopment.title-bar-palette)](https://marketplace.visualstudio.com/items?itemName=serbytedevelopment.title-bar-palette)
[![Visual Studio Marketplace Installs](https://img.shields.io/visual-studio-marketplace/i/serbytedevelopment.title-bar-palette)](https://marketplace.visualstudio.com/items?itemName=serbytedevelopment.title-bar-palette)
[![Open VSX Version](https://img.shields.io/open-vsx/v/serbytedevelopment/title-bar-palette)](https://open-vsx.org/extension/serbytedevelopment/title-bar-palette)
-->

Automatically give each VS Code or Cursor workspace a distinct title bar color. No setup, no theme changes, no extra UI.

![Two VS Code workspaces with distinct Title Bar Palette colors](images/workspaces.png)

- **See which window you are in instantly.** New workspaces rotate through 12 curated colors.
- **Set it and forget it.** The sequence persists after VS Code or Cursor is closed and reopened.
- **Respect existing workspaces.** If all four title bar colors are already configured, automatic coloring does nothing.
- **Preserve your theme.** Only four title bar values are changed; every unrelated color customization stays untouched.
- **Choose manually when needed.** `Title Bar Palette: Select Color` opens the 12-color picker.

**Developed & maintained by [Serbyte Development](https://www.serbyte.net/)** · [GitHub](https://github.com/Serbyte-Development)

## How it works

When a workspace opens, Title Bar Palette checks these four `workbench.colorCustomizations` values:

- `titleBar.activeBackground`
- `titleBar.activeForeground`
- `titleBar.inactiveBackground`
- `titleBar.inactiveForeground`

If all four are already set, the workspace is left unchanged. If fewer than four are set, the extension applies the next complete preset and advances the global sequence.

If the existing four values exactly match one of Title Bar Palette's presets, that preset re-anchors the sequence so the next newly colored workspace gets a different color. Complete custom title bar colors are left alone and do not advance the sequence.

Empty untitled windows are left alone because Title Bar Palette writes only to workspace settings.

## Colors

| Color | Active | Foreground | Inactive | Foreground |
| --- | --- | --- | --- | --- |
| Emerald | `#36B67A` | `#15202B` | `#3C9D72` | `#15202B` |
| Plum | `#963D77` | `#FFFFFF` | `#81456D` | `#FFFFFF` |
| Moss | `#6E9E35` | `#15202B` | `#73954B` | `#15202B` |
| Rose | `#B83F5D` | `#FFFFFF` | `#984A5E` | `#FFFFFF` |
| Ocean | `#187CB7` | `#FFFFFF` | `#266F99` | `#FFFFFF` |
| Coral | `#C6503E` | `#FFFFFF` | `#A75A4B` | `#FFFFFF` |
| Cobalt | `#315BD6` | `#FFFFFF` | `#465CA4` | `#FFFFFF` |
| Rust | `#AD552D` | `#FFFFFF` | `#925D40` | `#FFFFFF` |
| Indigo | `#5B4BC4` | `#FFFFFF` | `#5F549B` | `#FFFFFF` |
| Amber | `#D49A00` | `#15202B` | `#B58B27` | `#15202B` |
| Violet | `#7E47B8` | `#FFFFFF` | `#74518F` | `#FFFFFF` |
| Gold | `#D9AA24` | `#15202B` | `#B89A43` | `#15202B` |

Every active and inactive text/background pair meets WCAG AA contrast (4.5:1 or better). The inactive backgrounds are opaque because alpha colors blend with the underlying editor theme and make final contrast unpredictable.

## Command

Open the Command Palette and run:

- **Title Bar Palette: Select Color** — choose any of the 12 presets for the current workspace.

Manual selection also moves the automatic sequence to the following preset.

## Compatibility

Title Bar Palette uses standard VS Code workspace configuration APIs and has no native dependencies. It is designed for desktop VS Code and Cursor.

If title bar colors are not visible, set `"window.titleBarStyle": "custom"` and restart the editor.

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
