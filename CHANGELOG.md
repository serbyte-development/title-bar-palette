# Changelog

## 0.1.0

- Initial public release.
- Automatically assigns one of 12 curated title bar colors to new workspaces.
- Persists the global color sequence across editor restarts.
- Skips workspaces that already define all four title bar color values.
- Re-anchors the sequence when an existing workspace uses a built-in preset.
- Preserves unrelated `workbench.colorCustomizations` values.
- Adds a Command Palette picker for manually selecting any preset.
