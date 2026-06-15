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

import { useEffect, useRef, useId, useMemo, useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import { Box, ButtonBase } from '@wso2/oxygen-ui';
import { createExtensions } from './extensions/index.js';
import { computeDiffDocument } from './diff/computeDiff.js';
import { editorStylesToCss } from './styles/editorStyles.js';
import { diffStylesToCss } from './styles/diffStyles.js';
import type { MdDiffViewerProps } from './types.js';

type Mode = 'diff' | 'view';

const modeIcons = {
  diff: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 3v12" />
      <circle cx="6" cy="18" r="3" />
      <path d="M18 6V9" />
      <circle cx="18" cy="15" r="3" />
      <circle cx="6" cy="6" r="3" />
      <path d="M15 6h3a3 3 0 0 1 3 3" />
    </svg>
  ),
  view: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  ),
};

export function MdDiffViewer({
  oldMarkdown,
  newMarkdown,
  minHeight = 200,
  maxHeight,
  className,
}: MdDiffViewerProps) {
  const styleId = useId();
  const styleInjectedRef = useRef(false);
  const [mode, setMode] = useState<Mode>('diff');

  // Inject editor + diff styles once
  useEffect(() => {
    if (styleInjectedRef.current) return;
    const existing = document.getElementById(`md-diff-styles-${styleId}`);
    if (existing) return;
    const style = document.createElement('style');
    style.id = `md-diff-styles-${styleId}`;
    style.textContent = editorStylesToCss() + '\n' + diffStylesToCss();
    document.head.appendChild(style);
    styleInjectedRef.current = true;
    return () => {
      style.remove();
      styleInjectedRef.current = false;
    };
  }, [styleId]);

  const editor = useEditor({
    extensions: createExtensions({ includeDiffMarks: true }),
    editable: false,
    content: '',
  });

  // Compute diff document once per markdown pair — reused whenever user
  // switches back to diff mode.
  const diffDoc = useMemo(() => {
    if (!editor?.markdown) return null;
    const oldDoc = editor.markdown.parse(oldMarkdown);
    const newDoc = editor.markdown.parse(newMarkdown);
    return computeDiffDocument(oldDoc, newDoc);
  }, [editor?.markdown, oldMarkdown, newMarkdown]);

  useEffect(() => {
    if (!editor) return;
    if (mode === 'diff') {
      if (diffDoc) editor.commands.setContent(diffDoc);
    } else {
      editor.commands.setContent(newMarkdown, { contentType: 'markdown' });
    }
  }, [editor, mode, diffDoc, newMarkdown]);

  return (
    <Box
      className={className}
      sx={{
        width: '100%',
        border: 1,
        borderColor: 'divider',
        borderRadius: 1,
        overflow: 'hidden',
        bgcolor: 'background.paper',
      }}
    >
      <ModeToolbar mode={mode} onChange={setMode} />
      <Box
        sx={{
          minHeight: `${minHeight}px`,
          maxHeight: maxHeight ? `${maxHeight}px` : undefined,
          overflowY: maxHeight ? 'auto' : undefined,
          cursor: 'default',
        }}
      >
        <Box
          sx={{
            maxWidth: '816px',
            mx: 'auto',
            px: 2,
            py: 1.5,
          }}
        >
          <EditorContent editor={editor} />
        </Box>
      </Box>
    </Box>
  );
}

function ModeToolbar({ mode, onChange }: { mode: Mode; onChange: (m: Mode) => void }) {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-start',
        gap: 0.25,
        px: 1,
        py: 0.5,
        borderBottom: 1,
        borderColor: 'divider',
        bgcolor: 'background.default',
      }}
    >
      <ModeButton
        label="Diff"
        icon={modeIcons.diff}
        active={mode === 'diff'}
        onClick={() => onChange('diff')}
      />
      <ModeButton
        label="View"
        icon={modeIcons.view}
        active={mode === 'view'}
        onClick={() => onChange('view')}
      />
    </Box>
  );
}

function ModeButton({
  label,
  icon,
  active,
  onClick,
}: {
  label: string;
  icon: React.ReactNode;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <ButtonBase
      type="button"
      aria-pressed={active}
      onClick={onClick}
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 0.75,
        height: 32,
        px: 1.25,
        borderRadius: 0.5,
        color: active ? 'text.primary' : 'text.secondary',
        bgcolor: active ? 'action.selected' : 'transparent',
        fontSize: 13,
        fontWeight: active ? 600 : 500,
        lineHeight: 1,
        transition: 'background-color 0.15s',
        '&:hover': {
          bgcolor: active ? 'action.selected' : 'action.hover',
        },
      }}
    >
      {icon}
      <span>{label}</span>
    </ButtonBase>
  );
}
