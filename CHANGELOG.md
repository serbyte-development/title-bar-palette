# Changelog

## 0.2.0

- Replaces full title-bar backgrounds with a compact Command Center and border accent for current VS Code UI.
- Fixes automatic assignment when User settings already contain title-bar colors.
- Migrates recognized 0.1.0 workspace title-bar presets to the new accent format.
- Adds a new 12-color palette with dark and light variants.
- Replaces the broken GitHub Actions badge with live Marketplace and Open VSX badges.

## 0.1.0

- Initial public release.
- Automatically assigns one of 12 curated title bar colors to new workspaces.
- Persists the global color sequence across editor restarts.
- Skips workspaces that already define all four title bar color values.
- Re-anchors the sequence when an existing workspace uses a built-in preset.
- Preserves unrelated `workbench.colorCustomizations` values.
- Adds a Command Palette picker for manually selecting any preset.
