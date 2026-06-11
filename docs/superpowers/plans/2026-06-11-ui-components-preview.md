# UI Components Preview App — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a `ui-components-preview/` Storybook app at the workspace root that aggregates all component stories into a single gallery at http://localhost:6100, and write basic stories for the four packages that currently have none.

**Architecture:** A new pnpm workspace package `@asdlc/ui-components-preview` at the repo root. Its `.storybook/main.ts` uses a glob that spans `../ui-components/*/src/**/*.stories.*` so all existing and future stories are picked up automatically with zero config changes. Story files live inside each component package's `src/` directory — consistent with the existing pattern in `explorer`, `md-editor`, and `project-status`.

**Tech Stack:** Storybook 10 (`@storybook/react-vite`), React 19, TypeScript 5.9, Vite (via storybook), pnpm workspaces, Oxygen UI (MUI-based), `@excalidraw/excalidraw`, `@wso2/cell-diagram`.

---

## File Map

**New files:**
- `ui-components-preview/package.json` — package descriptor, all `@asdlc/*` as workspace deps
- `ui-components-preview/tsconfig.json` — TS config for `.storybook/` dir only
- `ui-components-preview/.storybook/main.ts` — Storybook config with cross-package stories glob
- `ui-components-preview/.storybook/preview.tsx` — shared OxygenUI theme wrapper
- `ui-components/excalidraw-editor/src/ExcalidrawEditor.stories.tsx`
- `ui-components/excalidraw-dsl/src/ExcalidrawDsl.stories.tsx`
- `ui-components/cell-diagram-view/src/CellDiagramView.stories.tsx`
- `ui-components/openapi-view/src/OpenApiView.stories.tsx`

**Modified files:**
- `pnpm-workspace.yaml` — add `- ui-components-preview`
- `ui-components/excalidraw-editor/package.json` — add storybook devDeps
- `ui-components/excalidraw-dsl/package.json` — add storybook devDeps + `@asdlc/excalidraw-editor` + `@types/react`
- `ui-components/excalidraw-dsl/tsconfig.json` — add `jsx`, `DOM`, `DOM.Iterable`
- `ui-components/cell-diagram-view/package.json` — add storybook devDeps
- `ui-components/openapi-view/package.json` — add storybook devDeps

---

## Task 1: Scaffold `ui-components-preview` workspace package

**Files:**
- Create: `ui-components-preview/package.json`
- Create: `ui-components-preview/tsconfig.json`
- Modify: `pnpm-workspace.yaml`

- [ ] **Step 1: Register the new package in the workspace**

Edit `pnpm-workspace.yaml` (at the repo root `labs-agentic-engineer/pnpm-workspace.yaml`):

```yaml
packages:
  - console
  - ui-components/*
  - ui-components-preview

allowBuilds:
  "@swc/core": true
  core-js: true
  esbuild: true
```

- [ ] **Step 2: Create `ui-components-preview/package.json`**

Create `labs-agentic-engineer/ui-components-preview/package.json`:

```json
{
  "name": "@asdlc/ui-components-preview",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "scripts": {
    "storybook": "storybook dev -p 6100",
    "build-storybook": "storybook build"
  },
  "dependencies": {
    "@asdlc/cell-diagram-view": "workspace:*",
    "@asdlc/excalidraw-dsl": "workspace:*",
    "@asdlc/excalidraw-editor": "workspace:*",
    "@asdlc/explorer": "workspace:*",
    "@asdlc/md-editor": "workspace:*",
    "@asdlc/openapi-view": "workspace:*",
    "@asdlc/project-status": "workspace:*"
  },
  "devDependencies": {
    "@emotion/react": "11.14.0",
    "@emotion/styled": "11.14.1",
    "@mui/material": "7.3.4",
    "@storybook/addon-docs": "^10.3.5",
    "@storybook/react-vite": "^10.3.5",
    "@types/react": "19.1.6",
    "@types/react-dom": "19.0.2",
    "@wso2/oxygen-ui": "0.1.0",
    "@wso2/oxygen-ui-icons-react": "0.1.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "storybook": "^10.3.5",
    "typescript": "5.9.3"
  }
}
```

- [ ] **Step 3: Create `ui-components-preview/tsconfig.json`**

Create `labs-agentic-engineer/ui-components-preview/tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "jsx": "react-jsx",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "verbatimModuleSyntax": true,
    "moduleDetection": "force",
    "strict": true,
    "noUncheckedSideEffectImports": true
  },
  "include": [".storybook"]
}
```

- [ ] **Step 4: Install workspace dependencies**

Run from repo root (`labs-agentic-engineer/`):

```bash
pnpm install
```

Expected: no errors, `ui-components-preview` is linked in the workspace. Verify with:

```bash
pnpm --filter @asdlc/ui-components-preview ls
```

Expected: lists all `@asdlc/*` packages as resolved workspace links.

- [ ] **Step 5: Commit**

```bash
git add pnpm-workspace.yaml pnpm-lock.yaml ui-components-preview/package.json ui-components-preview/tsconfig.json
git commit -m "feat: scaffold ui-components-preview workspace package"
```

---

## Task 2: Configure Storybook

**Files:**
- Create: `ui-components-preview/.storybook/main.ts`
- Create: `ui-components-preview/.storybook/preview.tsx`

- [ ] **Step 1: Create `.storybook/main.ts`**

Create `labs-agentic-engineer/ui-components-preview/.storybook/main.ts`:

```ts
/**
 * Copyright (c) 2026, WSO2 LLC. (https://www.wso2.com).
 *
 * WSO2 LLC. licenses this file to you under the Apache License,
 * Version 2.0 (the "License"); you may not use this file except
 * in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

import type { StorybookConfig } from '@storybook/react-vite';

const config: StorybookConfig = {
  stories: [
    '../ui-components/*/src/**/*.mdx',
    '../ui-components/*/src/**/*.stories.@(js|jsx|mjs|ts|tsx)',
  ],
  addons: ['@storybook/addon-docs'],
  framework: '@storybook/react-vite',
};

export default config;
```

- [ ] **Step 2: Create `.storybook/preview.tsx`**

Create `labs-agentic-engineer/ui-components-preview/.storybook/preview.tsx`:

```tsx
/**
 * Copyright (c) 2026, WSO2 LLC. (https://www.wso2.com).
 *
 * WSO2 LLC. licenses this file to you under the Apache License,
 * Version 2.0 (the "License"); you may not use this file except
 * in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

import { useLayoutEffect } from 'react';
import type { Preview } from '@storybook/react-vite';
import { AcrylicOrangeTheme, CssBaseline, OxygenUIThemeProvider } from '@wso2/oxygen-ui';
import { useColorScheme } from '@mui/material/styles';

function ThemeModeApplier({ mode }: { mode: 'light' | 'dark' }) {
  const { setMode } = useColorScheme();
  useLayoutEffect(() => {
    const html = document.documentElement;
    html.setAttribute('data-mui-color-scheme', mode);
    html.setAttribute('data-color-scheme', mode);
    html.style.colorScheme = mode;
    setMode(mode);
  }, [mode, setMode]);
  return null;
}

const preview: Preview = {
  globalTypes: {
    theme: {
      name: 'Theme',
      description: 'Light / dark mode',
      defaultValue: 'light',
      toolbar: {
        icon: 'circlehollow',
        items: [
          { value: 'light', title: 'Light', icon: 'sun' },
          { value: 'dark', title: 'Dark', icon: 'moon' },
        ],
        dynamicTitle: true,
      },
    },
  },
  decorators: [
    (Story, context) => {
      const mode = (context.globals.theme ?? 'light') as 'light' | 'dark';
      if (typeof document !== 'undefined') {
        const html = document.documentElement;
        html.setAttribute('data-mui-color-scheme', mode);
        html.setAttribute('data-color-scheme', mode);
        html.style.colorScheme = mode;
      }
      return (
        <OxygenUIThemeProvider theme={AcrylicOrangeTheme} defaultMode={mode}>
          <CssBaseline />
          <ThemeModeApplier mode={mode} />
          <div
            style={{
              padding: 16,
              background:
                'var(--oxygen-palette-background-default, var(--mui-palette-background-default, #fff))',
              color:
                'var(--oxygen-palette-text-primary, var(--mui-palette-text-primary, #1a1a1a))',
              minHeight: '100vh',
            }}
          >
            <Story />
          </div>
        </OxygenUIThemeProvider>
      );
    },
  ],
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    a11y: { test: 'todo' },
  },
};

export default preview;
```

- [ ] **Step 3: Start Storybook and verify existing stories load**

Run from repo root:

```bash
pnpm --filter @asdlc/ui-components-preview storybook
```

Open http://localhost:6100 in a browser.

Expected: Storybook loads without errors. The left sidebar shows story groups for all three packages that already have stories:
- `Components/Explorer` (stories: Default, Controlled, TocNavigation, ReadOnlyActions, WithAddFile, RenameAndDelete, EmptyState, LiveTocUpdate)
- `Components/MdEditor` (stories: Default, WithInitialContent, Controlled, ReadOnly, NoToolbar, CustomToolbarGroups, MarkdownRoundtrip, WithPlaceholder, WithPersistence)
- `Components/MdDiffViewer` (stories: BasicDiff)
- `Components/ProjectStatusPolyline` (stories from `project-status`)

Stop Storybook with Ctrl+C once verified.

- [ ] **Step 4: Commit**

```bash
git add ui-components-preview/.storybook/main.ts ui-components-preview/.storybook/preview.tsx
git commit -m "feat: add Storybook config to ui-components-preview"
```

---

## Task 3: Add ExcalidrawEditor story

**Files:**
- Modify: `ui-components/excalidraw-editor/package.json`
- Create: `ui-components/excalidraw-editor/src/ExcalidrawEditor.stories.tsx`

- [ ] **Step 1: Add Storybook devDeps to `excalidraw-editor`**

Edit `ui-components/excalidraw-editor/package.json`. Add to `devDependencies`:

```json
"storybook": "^10.3.5",
"@storybook/react-vite": "^10.3.5",
"@storybook/addon-docs": "^10.3.5"
```

The full `devDependencies` block becomes:

```json
"devDependencies": {
  "@emotion/react": "11.14.0",
  "@emotion/styled": "11.14.1",
  "@mui/material": "7.3.4",
  "@storybook/addon-docs": "^10.3.5",
  "@storybook/react-vite": "^10.3.5",
  "@types/react": "19.1.6",
  "@types/react-dom": "19.0.2",
  "@wso2/oxygen-ui": "0.1.0",
  "storybook": "^10.3.5",
  "typescript": "5.9.3"
}
```

- [ ] **Step 2: Install**

```bash
pnpm install
```

Expected: no errors.

- [ ] **Step 3: Create `ExcalidrawEditor.stories.tsx`**

Create `ui-components/excalidraw-editor/src/ExcalidrawEditor.stories.tsx`:

```tsx
/**
 * Copyright (c) 2026, WSO2 LLC. (https://www.wso2.com).
 *
 * WSO2 LLC. licenses this file to you under the Apache License,
 * Version 2.0 (the "License"); you may not use this file except
 * in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { ExcalidrawEditor } from './ExcalidrawEditor.js';

const meta = {
  title: 'Components/ExcalidrawEditor',
  component: ExcalidrawEditor,
  parameters: { layout: 'padded' },
  argTypes: {
    readOnly: { control: 'boolean' },
    fillHeight: { control: 'boolean' },
  },
} satisfies Meta<typeof ExcalidrawEditor>;

export default meta;
type Story = StoryObj<typeof meta>;

export const BlankCanvas: Story = {
  args: { value: '' },
};

export const ReadOnly: Story = {
  args: { value: '', readOnly: true },
  parameters: {
    docs: {
      description: {
        story: 'View-only mode — the canvas is rendered but cannot be edited.',
      },
    },
  },
};

export const Controlled: Story = {
  args: {},
  render: function ControlledStory() {
    const [json, setJson] = useState('');
    return (
      <div style={{ display: 'flex', gap: 16, flexDirection: 'column' }}>
        <ExcalidrawEditor value={json} onChange={setJson} />
        <div
          style={{
            fontFamily: 'monospace',
            fontSize: 11,
            padding: 8,
            border: '1px solid #e0e0e0',
            borderRadius: 4,
            background: '#fafafa',
            maxHeight: 120,
            overflow: 'auto',
          }}
        >
          <strong>onChange output (truncated):</strong>{' '}
          {json ? json.slice(0, 200) + (json.length > 200 ? '…' : '') : '(no changes yet)'}
        </div>
      </div>
    );
  },
};
```

- [ ] **Step 4: Verify in Storybook**

Start Storybook if not running:

```bash
pnpm --filter @asdlc/ui-components-preview storybook
```

Open http://localhost:6100. Expected: `Components/ExcalidrawEditor` appears in the sidebar with stories `BlankCanvas`, `ReadOnly`, `Controlled`. Click `BlankCanvas` — the Excalidraw canvas loads and is interactive.

- [ ] **Step 5: Commit**

```bash
git add ui-components/excalidraw-editor/package.json pnpm-lock.yaml ui-components/excalidraw-editor/src/ExcalidrawEditor.stories.tsx
git commit -m "feat(excalidraw-editor): add Storybook stories"
```

---

## Task 4: Add ExcalidrawDsl stories

`excalidraw-dsl` is a pure TypeScript package (no React). Its story file needs a wrapper component that calls `dslToExcalidraw` and renders the result via `ExcalidrawEditor`.

**Files:**
- Modify: `ui-components/excalidraw-dsl/package.json`
- Modify: `ui-components/excalidraw-dsl/tsconfig.json`
- Create: `ui-components/excalidraw-dsl/src/ExcalidrawDsl.stories.tsx`

- [ ] **Step 1: Add devDeps to `excalidraw-dsl`**

Edit `ui-components/excalidraw-dsl/package.json`. Add a `devDependencies` block (there is none currently):

```json
"devDependencies": {
  "@asdlc/excalidraw-editor": "workspace:*",
  "@emotion/react": "11.14.0",
  "@emotion/styled": "11.14.1",
  "@mui/material": "7.3.4",
  "@storybook/addon-docs": "^10.3.5",
  "@storybook/react-vite": "^10.3.5",
  "@types/react": "19.1.6",
  "@types/react-dom": "19.0.2",
  "@wso2/oxygen-ui": "0.1.0",
  "react": "^19.0.0",
  "react-dom": "^19.0.0",
  "storybook": "^10.3.5",
  "typescript": "5.9.3"
}
```

- [ ] **Step 2: Add JSX and DOM support to `excalidraw-dsl/tsconfig.json`**

The current tsconfig has `"lib": ["ES2022"]` and no `jsx`. The story file is `.tsx` so both are required.

Replace `ui-components/excalidraw-dsl/tsconfig.json` with:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "jsx": "react-jsx",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "verbatimModuleSyntax": true,
    "moduleDetection": "force",
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "outDir": "dist",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "erasableSyntaxOnly": true,
    "noFallthroughCasesInSwitch": true,
    "noUncheckedSideEffectImports": true,
    "composite": true
  },
  "include": ["src"]
}
```

- [ ] **Step 3: Install**

```bash
pnpm install
```

Expected: no errors.

- [ ] **Step 4: Create `ExcalidrawDsl.stories.tsx`**

Create `ui-components/excalidraw-dsl/src/ExcalidrawDsl.stories.tsx`:

```tsx
/**
 * Copyright (c) 2026, WSO2 LLC. (https://www.wso2.com).
 *
 * WSO2 LLC. licenses this file to you under the Apache License,
 * Version 2.0 (the "License"); you may not use this file except
 * in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { ExcalidrawEditor } from '@asdlc/excalidraw-editor';
import { tryDslToExcalidraw, type DslKind } from './index.js';

interface DslPreviewProps {
  kind: DslKind;
  dsl: string;
}

// Wrapper component: converts DSL text to an Excalidraw scene and renders it.
function DslPreview({ kind, dsl }: DslPreviewProps) {
  const result = tryDslToExcalidraw(kind, dsl);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {!result.ok && (
        <div
          style={{
            padding: '8px 12px',
            background: '#fff3cd',
            border: '1px solid #ffc107',
            borderRadius: 4,
            fontSize: 13,
            color: '#856404',
          }}
        >
          DSL produced no elements — check the syntax or edit the <code>dsl</code> control below.
        </div>
      )}
      <ExcalidrawEditor value={result.ok ? result.json : ''} readOnly />
    </div>
  );
}

const meta = {
  title: 'Components/ExcalidrawDsl',
  component: DslPreview,
  parameters: { layout: 'padded' },
  argTypes: {
    kind: {
      control: 'select',
      options: ['wireframes', 'domain-model'],
    },
    dsl: { control: 'text' },
  },
} satisfies Meta<typeof DslPreview>;

export default meta;
type Story = StoryObj<typeof meta>;

const WIREFRAMES_DSL = `screen Login
  text "Email" 20,30 180x20
  rect "email-input" 20,55 260x36
  text "Password" 20,105 180x20
  rect "password-input" 20,130 260x36
  button "Sign In" 20,185 260x44
screen Dashboard
  text "Welcome back!" 20,30 260x24
  rect "summary-card" 20,70 260x80
  button "New Project" 20,165 260x44
flow
  Login -> Dashboard`;

const DOMAIN_MODEL_DSL = `entity User
  id: uuid
  email: string
  name: string
entity Project
  id: uuid
  title: string
  createdAt: timestamp
entity Task
  id: uuid
  title: string
  status: enum
relation User --> Project "owns"
relation Project --> Task "contains"`;

export const WireframesDsl: Story = {
  args: { kind: 'wireframes', dsl: WIREFRAMES_DSL },
  parameters: {
    docs: {
      description: {
        story:
          'Converts a wireframes DSL string to an Excalidraw scene. Edit the `dsl` control to try different layouts.',
      },
    },
  },
};

export const DomainModelDsl: Story = {
  args: { kind: 'domain-model', dsl: DOMAIN_MODEL_DSL },
  parameters: {
    docs: {
      description: {
        story:
          'Converts a domain-model DSL string to an Excalidraw entity-relationship diagram.',
      },
    },
  },
};

export const LiveEditor: Story = {
  args: {},
  render: function LiveEditorStory() {
    const [kind, setKind] = useState<DslKind>('wireframes');
    const [dsl, setDsl] = useState(WIREFRAMES_DSL);
    const result = tryDslToExcalidraw(kind, dsl);

    return (
      <div style={{ display: 'flex', gap: 16 }}>
        <div style={{ flex: '0 0 320px', display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ display: 'flex', gap: 8 }}>
            {(['wireframes', 'domain-model'] as DslKind[]).map((k) => (
              <button
                key={k}
                type="button"
                onClick={() => {
                  setKind(k);
                  setDsl(k === 'wireframes' ? WIREFRAMES_DSL : DOMAIN_MODEL_DSL);
                }}
                style={{
                  padding: '4px 12px',
                  border: '1px solid #ccc',
                  borderRadius: 4,
                  background: kind === k ? '#e3f2fd' : '#fff',
                  fontWeight: kind === k ? 600 : 400,
                  cursor: 'pointer',
                  fontSize: 13,
                }}
              >
                {k}
              </button>
            ))}
          </div>
          <textarea
            value={dsl}
            onChange={(e) => setDsl(e.target.value)}
            style={{
              flex: 1,
              fontFamily: 'monospace',
              fontSize: 12,
              padding: 8,
              border: '1px solid #e0e0e0',
              borderRadius: 4,
              resize: 'none',
              minHeight: 400,
            }}
          />
          {!result.ok && (
            <div style={{ fontSize: 12, color: '#856404', padding: '4px 8px', background: '#fff3cd', borderRadius: 4 }}>
              No elements generated — check DSL syntax.
            </div>
          )}
        </div>
        <div style={{ flex: 1 }}>
          <ExcalidrawEditor value={result.ok ? result.json : ''} readOnly />
        </div>
      </div>
    );
  },
};
```

- [ ] **Step 5: Verify in Storybook**

Open http://localhost:6100. Expected: `Components/ExcalidrawDsl` appears in the sidebar with stories `WireframesDsl`, `DomainModelDsl`, `LiveEditor`. Click `WireframesDsl` — the Excalidraw canvas renders the Login and Dashboard wireframe screens.

- [ ] **Step 6: Commit**

```bash
git add ui-components/excalidraw-dsl/package.json ui-components/excalidraw-dsl/tsconfig.json pnpm-lock.yaml ui-components/excalidraw-dsl/src/ExcalidrawDsl.stories.tsx
git commit -m "feat(excalidraw-dsl): add Storybook stories with live DSL editor"
```

---

## Task 5: Add CellDiagramView story

**Files:**
- Modify: `ui-components/cell-diagram-view/package.json`
- Create: `ui-components/cell-diagram-view/src/CellDiagramView.stories.tsx`

- [ ] **Step 1: Add Storybook devDeps to `cell-diagram-view`**

Edit `ui-components/cell-diagram-view/package.json`. Add to `devDependencies`:

```json
"storybook": "^10.3.5",
"@storybook/react-vite": "^10.3.5",
"@storybook/addon-docs": "^10.3.5"
```

The full `devDependencies` block becomes:

```json
"devDependencies": {
  "@emotion/react": "11.14.0",
  "@emotion/styled": "11.14.1",
  "@mui/material": "7.3.4",
  "@storybook/addon-docs": "^10.3.5",
  "@storybook/react-vite": "^10.3.5",
  "@types/react": "19.1.6",
  "@types/react-dom": "19.0.2",
  "@wso2/oxygen-ui": "0.1.0",
  "storybook": "^10.3.5",
  "typescript": "5.9.3"
}
```

- [ ] **Step 2: Install**

```bash
pnpm install
```

Expected: no errors.

- [ ] **Step 3: Create `CellDiagramView.stories.tsx`**

Create `ui-components/cell-diagram-view/src/CellDiagramView.stories.tsx`:

```tsx
/**
 * Copyright (c) 2026, WSO2 LLC. (https://www.wso2.com).
 *
 * WSO2 LLC. licenses this file to you under the Apache License,
 * Version 2.0 (the "License"); you may not use this file except
 * in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

import type { Meta, StoryObj } from '@storybook/react-vite';
import { CellDiagramView } from './CellDiagramView.js';
import type { CellDiagramComponent } from './buildProjectModel.js';

const meta = {
  title: 'Components/CellDiagramView',
  component: CellDiagramView,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof CellDiagramView>;

export default meta;
type Story = StoryObj<typeof meta>;

const SIMPLE_COMPONENTS: CellDiagramComponent[] = [
  {
    name: 'frontend',
    componentType: 'web-app',
    dependsOn: ['api'],
  },
  {
    name: 'api',
    componentType: 'service',
    dependsOn: ['db'],
  },
  {
    name: 'db',
    componentType: 'service',
  },
];

const FULL_COMPONENTS: CellDiagramComponent[] = [
  {
    name: 'console',
    componentType: 'web-app',
    dependsOn: ['bff'],
  },
  {
    name: 'bff',
    componentType: 'service',
    dependsOn: ['agents', 'git-service'],
    dependentApis: [
      { name: 'github', url: 'https://api.github.com', description: 'GitHub REST API' },
    ],
  },
  {
    name: 'agents',
    componentType: 'service',
    dependentApis: [
      { name: 'anthropic', url: 'https://api.anthropic.com', description: 'Claude API' },
    ],
  },
  {
    name: 'git-service',
    componentType: 'service',
  },
];

export const SimpleThreeTier: Story = {
  args: { components: SIMPLE_COMPONENTS },
  parameters: {
    docs: {
      description: {
        story: 'A simple three-tier app: web-app → service → service.',
      },
    },
  },
};

export const AsdlcServices: Story = {
  args: { components: FULL_COMPONENTS },
  parameters: {
    docs: {
      description: {
        story: 'The ASDLC platform services with external API dependencies.',
      },
    },
  },
};

export const EmptyState: Story = {
  args: { components: [] },
  parameters: {
    docs: {
      description: {
        story: 'Empty state shown when no components are provided.',
      },
    },
  },
};
```

- [ ] **Step 4: Verify in Storybook**

Open http://localhost:6100. Expected: `Components/CellDiagramView` appears in the sidebar with stories `SimpleThreeTier`, `AsdlcServices`, `EmptyState`. Click `SimpleThreeTier` — the cell diagram renders with three nodes.

- [ ] **Step 5: Commit**

```bash
git add ui-components/cell-diagram-view/package.json pnpm-lock.yaml ui-components/cell-diagram-view/src/CellDiagramView.stories.tsx
git commit -m "feat(cell-diagram-view): add Storybook stories"
```

---

## Task 6: Add OpenApiView story

**Files:**
- Modify: `ui-components/openapi-view/package.json`
- Create: `ui-components/openapi-view/src/OpenApiView.stories.tsx`

- [ ] **Step 1: Add Storybook devDeps to `openapi-view`**

Edit `ui-components/openapi-view/package.json`. Add to `devDependencies`:

```json
"storybook": "^10.3.5",
"@storybook/react-vite": "^10.3.5",
"@storybook/addon-docs": "^10.3.5"
```

The full `devDependencies` block becomes:

```json
"devDependencies": {
  "@emotion/react": "11.14.0",
  "@emotion/styled": "11.14.1",
  "@mui/material": "7.3.4",
  "@storybook/addon-docs": "^10.3.5",
  "@storybook/react-vite": "^10.3.5",
  "@types/js-yaml": "^4.0.9",
  "@types/react": "19.1.6",
  "@types/react-dom": "19.0.2",
  "@wso2/oxygen-ui": "0.1.0",
  "storybook": "^10.3.5",
  "typescript": "5.9.3"
}
```

- [ ] **Step 2: Install**

```bash
pnpm install
```

Expected: no errors.

- [ ] **Step 3: Create `OpenApiView.stories.tsx`**

Create `ui-components/openapi-view/src/OpenApiView.stories.tsx`:

```tsx
/**
 * Copyright (c) 2026, WSO2 LLC. (https://www.wso2.com).
 *
 * WSO2 LLC. licenses this file to you under the Apache License,
 * Version 2.0 (the "License"); you may not use this file except
 * in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

import type { Meta, StoryObj } from '@storybook/react-vite';
import { OpenApiView } from './OpenApiView.js';

const meta = {
  title: 'Components/OpenApiView',
  component: OpenApiView,
  parameters: { layout: 'padded' },
  argTypes: {
    spec: { control: 'text' },
  },
} satisfies Meta<typeof OpenApiView>;

export default meta;
type Story = StoryObj<typeof meta>;

const PETSTORE_SPEC = `openapi: "3.0.3"
info:
  title: Petstore API
  version: "1.0.0"
  description: A sample API that demonstrates OpenApiView.
paths:
  /pets:
    get:
      summary: List all pets
      operationId: listPets
      tags:
        - pets
      parameters:
        - name: limit
          in: query
          required: false
          schema:
            type: integer
      responses:
        "200":
          description: A list of pets
          content:
            application/json:
              schema:
                type: array
                items:
                  $ref: "#/components/schemas/Pet"
    post:
      summary: Create a pet
      operationId: createPet
      tags:
        - pets
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: "#/components/schemas/NewPet"
      responses:
        "201":
          description: Pet created
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/Pet"
  /pets/{id}:
    get:
      summary: Get a pet by ID
      operationId: getPet
      tags:
        - pets
      parameters:
        - name: id
          in: path
          required: true
          schema:
            type: string
      responses:
        "200":
          description: A single pet
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/Pet"
        "404":
          description: Pet not found
    delete:
      summary: Delete a pet
      operationId: deletePet
      tags:
        - pets
      parameters:
        - name: id
          in: path
          required: true
          schema:
            type: string
      responses:
        "204":
          description: Pet deleted
components:
  schemas:
    Pet:
      type: object
      required:
        - id
        - name
      properties:
        id:
          type: string
        name:
          type: string
        tag:
          type: string
    NewPet:
      type: object
      required:
        - name
      properties:
        name:
          type: string
        tag:
          type: string`;

const ASDLC_SPEC = `openapi: "3.0.3"
info:
  title: ASDLC BFF API
  version: "1.0.0"
  description: Backend-for-frontend API for the ASDLC platform.
paths:
  /api/v1/projects:
    get:
      summary: List projects
      operationId: listProjects
      tags:
        - projects
      responses:
        "200":
          description: List of projects
          content:
            application/json:
              schema:
                type: array
                items:
                  $ref: "#/components/schemas/Project"
    post:
      summary: Create project
      operationId: createProject
      tags:
        - projects
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: "#/components/schemas/CreateProjectRequest"
      responses:
        "201":
          description: Project created
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/Project"
  /api/v1/projects/{id}/tasks:
    get:
      summary: List component tasks for a project
      operationId: listTasks
      tags:
        - tasks
      parameters:
        - name: id
          in: path
          required: true
          schema:
            type: string
      responses:
        "200":
          description: List of tasks
          content:
            application/json:
              schema:
                type: array
                items:
                  $ref: "#/components/schemas/ComponentTask"
components:
  schemas:
    Project:
      type: object
      properties:
        id:
          type: string
        name:
          type: string
        status:
          type: string
          enum: [active, archived]
    CreateProjectRequest:
      type: object
      required:
        - name
      properties:
        name:
          type: string
    ComponentTask:
      type: object
      properties:
        id:
          type: string
        componentName:
          type: string
        status:
          type: string
          enum: [pending, in_progress, ready_for_review, merged, building, deployed, rejected, failed]`;

export const PetstoreApi: Story = {
  args: { spec: PETSTORE_SPEC },
  parameters: {
    docs: {
      description: {
        story: 'A classic petstore API — good for exploring all endpoint types and schema rendering.',
      },
    },
  },
};

export const AsdlcBffApi: Story = {
  args: { spec: ASDLC_SPEC },
  parameters: {
    docs: {
      description: {
        story: 'A representative slice of the ASDLC BFF API with projects and tasks.',
      },
    },
  },
};
```

- [ ] **Step 4: Verify in Storybook**

Open http://localhost:6100. Expected: `Components/OpenApiView` appears in the sidebar with stories `PetstoreApi` and `AsdlcBffApi`. Click `PetstoreApi` — the OpenAPI viewer renders all four endpoints grouped under the `pets` tag.

- [ ] **Step 5: Commit**

```bash
git add ui-components/openapi-view/package.json pnpm-lock.yaml ui-components/openapi-view/src/OpenApiView.stories.tsx
git commit -m "feat(openapi-view): add Storybook stories"
```

---

## Task 7: Final verification

- [ ] **Step 1: Start Storybook and verify all 7 components appear**

```bash
pnpm --filter @asdlc/ui-components-preview storybook
```

Open http://localhost:6100. Expected sidebar groups:

- `Components/CellDiagramView` — SimpleThreeTier, AsdlcServices, EmptyState
- `Components/ExcalidrawDsl` — WireframesDsl, DomainModelDsl, LiveEditor
- `Components/ExcalidrawEditor` — BlankCanvas, ReadOnly, Controlled
- `Components/Explorer` — Default, Controlled, TocNavigation, ReadOnlyActions, WithAddFile, RenameAndDelete, EmptyState, LiveTocUpdate
- `Components/MdDiffViewer` — BasicDiff (+ any others in md-editor)
- `Components/MdEditor` — Default, WithInitialContent, Controlled, ReadOnly, NoToolbar, CustomToolbarGroups, MarkdownRoundtrip, WithPlaceholder, WithPersistence
- `Components/OpenApiView` — PetstoreApi, AsdlcBffApi
- `Components/ProjectStatusPolyline` — (stories from project-status)

- [ ] **Step 2: Smoke-test each new story**

Click through each new story and confirm it renders without a console error:
- `ExcalidrawEditor/BlankCanvas` — canvas loads
- `ExcalidrawDsl/WireframesDsl` — Login + Dashboard wireframe screens rendered on canvas
- `ExcalidrawDsl/DomainModelDsl` — User/Project/Task entities rendered on canvas
- `CellDiagramView/SimpleThreeTier` — three-node cell diagram visible
- `OpenApiView/PetstoreApi` — endpoints listed with method chips

- [ ] **Step 3: Final commit (if any untracked files remain)**

```bash
git status
# Commit anything uncommitted
```
