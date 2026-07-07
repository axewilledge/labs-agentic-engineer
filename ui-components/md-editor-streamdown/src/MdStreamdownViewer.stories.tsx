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

import { useCallback, useEffect, useRef, useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { MdStreamdownViewer } from './MdStreamdownViewer.js';
import type { ColorScheme } from './types.js';
import sampleMarkdown from '../sample.md?raw';

const meta = {
  title: 'Components/MdStreamdownViewer',
  component: MdStreamdownViewer,
  parameters: {
    layout: 'padded',
  },
  argTypes: {
    value: { control: 'text' },
    isStreaming: { control: 'boolean' },
    autoScroll: { control: 'boolean' },
    colorScheme: {
      control: 'inline-radio',
      options: ['light', 'dark', 'inherit'],
    },
    caret: { control: 'inline-radio', options: ['block', 'circle'] },
    parseIncompleteMarkdown: { control: 'boolean' },
    minHeight: { control: { type: 'number', min: 0, max: 800 } },
    maxHeight: { control: { type: 'number', min: 100, max: 800 } },
    contentMaxWidth: { control: 'text' },
  },
} satisfies Meta<typeof MdStreamdownViewer>;

export default meta;
type Story = StoryObj<typeof meta>;

const SAMPLE_MARKDOWN = `# Streamdown renderer

This is **MdStreamdownViewer** — a streaming-aware markdown _renderer_ built on
[streamdown](https://streamdown.ai). It handles incomplete markdown gracefully
while tokens arrive, then settles into a polished static document.

## Features

- GitHub-flavored markdown: tables, task lists, ~~strikethrough~~, autolinks
- Shiki-highlighted code blocks with copy & download controls
- KaTeX math and Mermaid diagrams
- Security-hardened rendering and link-safety

### Task list

- [x] Parse unterminated blocks
- [x] Highlight code
- [ ] Ship it

### A code block

\`\`\`typescript
export function greet(name: string): string {
  return \`Hello, \${name}!\`;
}
\`\`\`

### A table

| Feature   | Streaming | Static |
| --------- | :-------: | :----: |
| Caret     |    yes    |   no   |
| Copy btn  |    no     |  yes   |

> Streamed markdown stays readable even mid-token.
`;

const MATH_AND_DIAGRAM = `## Math

The Gaussian integral:

$$
\\int_{-\\infty}^{\\infty} e^{-x^2}\\,dx = \\sqrt{\\pi}
$$

Inline math like $E = mc^2$ works too.

## Diagram

\`\`\`mermaid
flowchart LR
  A[Model] -->|tokens| B(MdStreamdownViewer)
  B --> C{Complete?}
  C -->|no| B
  C -->|yes| D[Rendered]
\`\`\`
`;

/** A tiny stand-in for a model token stream: reveals text a few chars per tick. */
function useStreamedText(
  fullText: string,
  opts: { chunkSize?: number; tickMs?: number; autoStart?: boolean } = {},
) {
  const { chunkSize = 4, tickMs = 28, autoStart = true } = opts;
  const [count, setCount] = useState(0);
  const [isStreaming, setIsStreaming] = useState(autoStart);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const countRef = useRef(0);
  countRef.current = count;

  const clear = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const start = useCallback(() => {
    if (countRef.current >= fullText.length) return;
    setIsStreaming(true);
  }, [fullText.length]);
  const pause = useCallback(() => setIsStreaming(false), []);
  const reset = useCallback(() => {
    clear();
    setCount(0);
    setIsStreaming(autoStart);
  }, [autoStart, clear]);

  useEffect(() => {
    setCount(0);
    setIsStreaming(autoStart);
  }, [fullText, autoStart]);

  useEffect(() => {
    if (!isStreaming) {
      clear();
      return;
    }
    timerRef.current = setInterval(() => {
      setCount((c) => {
        const next = Math.min(c + chunkSize, fullText.length);
        if (next >= fullText.length) setIsStreaming(false);
        return next;
      });
    }, tickMs);
    return clear;
  }, [isStreaming, chunkSize, tickMs, fullText.length, clear]);

  return {
    text: fullText.slice(0, count),
    isStreaming,
    done: count >= fullText.length,
    start,
    pause,
    reset,
  };
}

/** Fully-rendered static document. */
export const Default: Story = {
  args: {
    value: SAMPLE_MARKDOWN,
    isStreaming: false,
    maxHeight: 520,
  },
  render: (args, { globals }) => (
    <MdStreamdownViewer
      {...args}
      colorScheme={(globals.theme ?? 'light') as ColorScheme}
    />
  ),
};

/** Frozen mid-stream frame — see incomplete-markdown parsing + the caret. */
export const StreamingFrame: Story = {
  args: {
    value: SAMPLE_MARKDOWN.slice(0, Math.floor(SAMPLE_MARKDOWN.length * 0.45)),
    isStreaming: true,
    maxHeight: 520,
  },
  render: (args, { globals }) => (
    <MdStreamdownViewer
      {...args}
      colorScheme={(globals.theme ?? 'light') as ColorScheme}
    />
  ),
};

/** The core experience: markdown streams in live, then settles to static. */
export const Streaming: Story = {
  args: { value: '', isStreaming: false },
  render: (_args, { globals }) => {
    const { text, isStreaming } = useStreamedText(SAMPLE_MARKDOWN, {
      chunkSize: 3,
      tickMs: 22,
    });
    return (
      <MdStreamdownViewer
        value={text}
        isStreaming={isStreaming}
        maxHeight={520}
        colorScheme={(globals.theme ?? 'light') as ColorScheme}
      />
    );
  },
};

/** Full playback controls over the token stream. */
export const StreamingWithControls: Story = {
  args: { value: '', isStreaming: false },
  render: (_args, { globals }) => {
    const [chunkSize, setChunkSize] = useState(3);
    const { text, isStreaming, done, start, pause, reset } = useStreamedText(
      SAMPLE_MARKDOWN,
      { chunkSize, tickMs: 22 },
    );
    const btn: React.CSSProperties = {
      padding: '4px 12px',
      borderRadius: 6,
      border: '1px solid var(--border, #d4d4d4)',
      background: 'transparent',
      color: 'inherit',
      cursor: 'pointer',
      font: 'inherit',
    };
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          <button type="button" style={btn} onClick={start} disabled={isStreaming || done}>
            Play
          </button>
          <button type="button" style={btn} onClick={pause} disabled={!isStreaming}>
            Pause
          </button>
          <button type="button" style={btn} onClick={reset}>
            Restart
          </button>
          <label style={{ display: 'flex', gap: 8, alignItems: 'center', marginLeft: 8 }}>
            <span style={{ fontSize: 12, opacity: 0.7 }}>Speed</span>
            <input
              type="range"
              min={1}
              max={12}
              value={chunkSize}
              onChange={(e) => setChunkSize(Number(e.target.value))}
            />
          </label>
          <span style={{ fontSize: 12, opacity: 0.7, marginLeft: 'auto' }}>
            {done ? 'Done' : isStreaming ? 'Streaming…' : 'Paused'}
          </span>
        </div>
        <MdStreamdownViewer
          value={text}
          isStreaming={isStreaming}
          maxHeight={460}
          colorScheme={(globals.theme ?? 'light') as ColorScheme}
        />
      </div>
    );
  },
};

/**
 * The full `sample.md` feature showcase rendered statically — text formatting,
 * headings, lists, task lists, tables, highlighted code, KaTeX math, Mermaid
 * diagrams, CJK typography, and more.
 */
export const FeatureShowcase: Story = {
  args: {
    value: sampleMarkdown,
    isStreaming: false,
    maxHeight: 640,
  },
  render: (args, { globals }) => (
    <MdStreamdownViewer
      {...args}
      colorScheme={(globals.theme ?? 'light') as ColorScheme}
    />
  ),
};

/** `sample.md` streamed in live, token by token, then settling to static. */
export const FeatureShowcaseStreaming: Story = {
  args: { value: '', isStreaming: false },
  render: (_args, { globals }) => {
    const { text, isStreaming } = useStreamedText(sampleMarkdown, {
      chunkSize: 6,
      tickMs: 16,
    });
    return (
      <MdStreamdownViewer
        value={text}
        isStreaming={isStreaming}
        maxHeight={640}
        colorScheme={(globals.theme ?? 'light') as ColorScheme}
      />
    );
  },
};

/** Math (KaTeX) and Mermaid diagrams rendered from streamed markdown. */
export const MathAndDiagrams: Story = {
  args: { value: '', isStreaming: false },
  render: (_args, { globals }) => {
    const { text, isStreaming } = useStreamedText(MATH_AND_DIAGRAM, {
      chunkSize: 4,
      tickMs: 24,
    });
    return (
      <MdStreamdownViewer
        value={text}
        isStreaming={isStreaming}
        maxHeight={560}
        colorScheme={(globals.theme ?? 'light') as ColorScheme}
      />
    );
  },
};
