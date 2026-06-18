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
import { Button, Stack, Typography } from '@wso2/oxygen-ui';
import { MdStreamingEditor } from './MdStreamingEditor.js';

const meta = {
  title: 'Components/MdStreamingEditor',
  component: MdStreamingEditor,
  parameters: {
    layout: 'padded',
  },
  argTypes: {
    value: { control: 'text' },
    isStreaming: { control: 'boolean' },
    readOnly: { control: 'boolean' },
    parseIncompleteMarkdown: { control: 'boolean' },
    showCaret: { control: 'boolean' },
    showToolbar: { control: 'boolean' },
    autoScroll: { control: 'boolean' },
    minHeight: { control: { type: 'number', min: 50, max: 800 } },
    maxHeight: { control: { type: 'number', min: 100, max: 800 } },
  },
} satisfies Meta<typeof MdStreamingEditor>;

export default meta;
type Story = StoryObj<typeof meta>;

const SAMPLE_MARKDOWN = `# Streaming into the Editor

This is the **MdStreamingEditor** — the WYSIWYG editor rendering live model
output as rich text, then handing control back to you when the stream ends.

## How it works

1. While streaming, the editor is **read-only** and shows a blinking caret.
2. Each new frame is parsed and pushed straight into the document.
3. Unterminated markdown (open code fences, half-typed *emphasis*) is auto-completed.
4. When the stream ends, the toolbar appears and you can keep editing.

### Some code arrives mid-stream

\`\`\`typescript
export function greet(name: string): string {
  return \`Hello, \${name}!\`;
}
\`\`\`

> Try editing this text once streaming finishes — it behaves like a normal editor.

- Bullet one
- Bullet two
- Bullet three
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

/** Static, fully-streamed result — editable like a normal MdEditor. */
export const Default: Story = {
  args: {
    value: SAMPLE_MARKDOWN,
    isStreaming: false,
  },
};

/** Frozen mid-stream frame so you can see the read-only caret state. */
export const StreamingFrame: Story = {
  args: {
    value: SAMPLE_MARKDOWN.slice(0, Math.floor(SAMPLE_MARKDOWN.length * 0.4)),
    isStreaming: true,
  },
};

/** The core experience: text streams into the editor, then becomes editable. */
export const Streaming: Story = {
  args: { value: '', isStreaming: false },
  render: function StreamingStory() {
    const { text, isStreaming } = useStreamedText(SAMPLE_MARKDOWN, {
      chunkSize: 3,
      tickMs: 22,
    });
    return (
      <MdStreamingEditor value={text} isStreaming={isStreaming} maxHeight={480} />
    );
  },
};

/** Full playback controls + a live "editable after stream" indicator. */
export const StreamingWithControls: Story = {
  args: { value: '', isStreaming: false },
  render: function ControlsStory() {
    const [chunkSize, setChunkSize] = useState(3);
    const [edited, setEdited] = useState<string | null>(null);
    const { text, isStreaming, done, start, pause, reset } = useStreamedText(
      SAMPLE_MARKDOWN,
      { chunkSize, tickMs: 22 },
    );
    return (
      <Stack spacing={1.5}>
        <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
          <Button variant="contained" size="small" onClick={start} disabled={isStreaming || done}>
            Play
          </Button>
          <Button variant="outlined" size="small" onClick={pause} disabled={!isStreaming}>
            Pause
          </Button>
          <Button
            variant="outlined"
            size="small"
            color="error"
            onClick={() => {
              setEdited(null);
              reset();
            }}
          >
            Restart
          </Button>
          <Stack direction="row" spacing={1} alignItems="center" sx={{ ml: 1 }}>
            <Typography variant="caption" color="text.secondary">
              Speed
            </Typography>
            <input
              type="range"
              min={1}
              max={12}
              value={chunkSize}
              onChange={(e) => setChunkSize(Number(e.target.value))}
            />
          </Stack>
          <Typography variant="caption" color="text.secondary" sx={{ ml: 'auto' }}>
            {done ? 'Done — editor is now editable' : isStreaming ? 'Streaming…' : 'Paused'}
          </Typography>
        </Stack>
        <MdStreamingEditor
          value={text}
          isStreaming={isStreaming}
          maxHeight={420}
          onChange={setEdited}
          onStreamEnd={() => undefined}
        />
        {edited !== null && (
          <Typography variant="caption" color="text.secondary">
            User has edited the streamed content ({edited.length} chars).
          </Typography>
        )}
      </Stack>
    );
  },
};

/** Read-only even after streaming — a pure live transcript view. */
export const ReadOnlyTranscript: Story = {
  args: { value: '', isStreaming: false },
  render: function ReadOnlyStory() {
    const { text, isStreaming } = useStreamedText(SAMPLE_MARKDOWN, {
      chunkSize: 4,
      tickMs: 24,
    });
    return (
      <MdStreamingEditor value={text} isStreaming={isStreaming} readOnly maxHeight={480} />
    );
  },
};
