# UI Components Preview App — Design Spec

**Date:** 2026-06-11
**Status:** Approved

## Problem

Seven component packages live under `ui-components/`. Three have per-package Storybook instances (ports 6006/6007/6008); four have no preview at all. There is no single place to browse and try all components together.

## Goal

A single Storybook app at `ui-components-preview/` that aggregates stories from every component package, runs on one command, and is trivially extended when new packages are added.

## Package Structure

```
labs-agentic-engineer/
  console/                         existing React app
  ui-components/                   component libraries (unchanged)
    explorer/
    md-editor/
    excalidraw-editor/
    excalidraw-dsl/
    cell-diagram-view/
    openapi-view/
    project-status/
  ui-components-preview/           NEW — Storybook preview app
    package.json                   @asdlc/ui-components-preview
    tsconfig.json
    .storybook/
      main.ts
      preview.tsx
```

`pnpm-workspace.yaml` gains one entry: `- ui-components-preview`.

## Storybook Configuration

### `main.ts`

- **stories glob:** `../ui-components/*/src/**/*.stories.@(js|jsx|mjs|ts|tsx)` and `../ui-components/*/src/**/*.mdx`
- **framework:** `@storybook/react-vite`
- **addons:** `@storybook/addon-docs`
- **port:** `6100` (avoids collision with existing per-package instances at 6006/6007/6008)

Vite resolves `@asdlc/*` workspace packages via their `"main": "src/index.ts"` — no build step required.

### `preview.tsx`

Shared OxygenUI theme wrapper (based on the existing `md-editor` preview, the most complete copy):

- `OxygenUIThemeProvider` with `AcrylicOrangeTheme`
- `CssBaseline`
- Light/dark toggle via Storybook toolbar global
- `ThemeModeApplier` for flicker-free mode switching

The three packages that already duplicate this (`explorer`, `md-editor`, `project-status`) keep their own copies — their per-package Storybooks are unaffected.

### `tsconfig.json`

Extends a base config, adds path aliases mapping every `@asdlc/*` package to its `src/index.ts`.

### `package.json` scripts

```json
{
  "storybook": "storybook dev -p 6100",
  "build-storybook": "storybook build"
}
```

All `@asdlc/*` packages declared as `workspace:*` dependencies.

## Stories for Packages Without Them

Story files live inside each component package's `src/` directory — consistent with the existing pattern. The preview app picks them up automatically via the glob.

### `excalidraw-editor/src/ExcalidrawEditor.stories.tsx`

One story rendering `ExcalidrawEditor` with a minimal initial scene (a few shapes). Demonstrates the canvas loads and is interactive.

### `excalidraw-dsl/src/ExcalidrawDsl.stories.tsx`

Two stories using `ExcalidrawEditor` as the renderer for DSL output:
- `WireframesDsl` — a simple wireframes DSL string converted to an Excalidraw scene
- `DomainModelDsl` — a simple domain-model DSL string converted to an Excalidraw scene

Since `excalidraw-dsl` exports a pure converter (no React component), these stories visualise the converter output rather than a component directly.

### `cell-diagram-view/src/CellDiagramView.stories.tsx`

One story with a hardcoded `components` array (2–3 services with connections) passed to `CellDiagramView`.

### `openapi-view/src/OpenApiView.stories.tsx`

One story with an inline petstore-style OpenAPI YAML string (2–3 endpoints) passed to `OpenApiView`.

## Running

```bash
# From workspace root:
pnpm --filter @asdlc/ui-components-preview storybook

# Or from the package directory:
cd ui-components-preview && pnpm storybook
```

Opens at `http://localhost:6100`.

## Extending

To add a new component to the gallery:

1. Create the package under `ui-components/<new-package>/`
2. Add `"@asdlc/new-package": "workspace:*"` to `ui-components-preview/package.json`
3. Add `src/NewComponent.stories.tsx` inside the new package

No changes to `main.ts` or any other preview-app config needed.

## What Is Not Changing

- Existing per-package Storybook configs and scripts are untouched and continue to work for focused single-package development.
- No component source files are modified.
- `pnpm-workspace.yaml` gets one new line only.
