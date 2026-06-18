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

import { useEffect, useImperativeHandle, useRef, useId } from 'react';
import { EditorContent } from '@tiptap/react';
import { Box } from '@wso2/oxygen-ui';
import { useMarkdownEditor } from './hooks/useMarkdownEditor.js';
import { useControlledEditor } from './hooks/useControlledEditor.js';
import { Toolbar } from './toolbar/Toolbar.js';
import { editorStylesToCss } from './styles/editorStyles.js';
import { diffStylesToCss } from './styles/diffStyles.js';
import { streamingStylesToCss } from './styles/streamingStyles.js';
import { completeIncompleteMarkdown } from './markdown/completeMarkdown.js';
import type { MdStreamingEditorProps } from './types.js';
import { ALL_TOOLBAR_GROUPS } from './types.js';

/**
 * A WYSIWYG markdown editor that renders **streaming** model output live as rich
 * text. While `isStreaming` is true the editor is read-only: each new `value`
 * frame is parsed (with unterminated blocks auto-completed) and pushed straight
 * into the document, and a blinking caret trails the content. When the stream
 * ends the editor becomes editable and behaves like a normal controlled
 * `MdEditor` — the user can keep editing and `onChange` fires.
 */
export function MdStreamingEditor({
  value,
  isStreaming,
  onChange,
  onStreamEnd,
  onBlur,
  readOnly = false,
  parseIncompleteMarkdown = true,
  showCaret,
  autoScroll = true,
  placeholder = 'Write something...',
  minHeight = 200,
  maxHeight,
  fillHeight = false,
  showToolbar = true,
  toolbarGroups = ALL_TOOLBAR_GROUPS,
  toolbarRightContent,
  className,
  editorRef,
  contentMaxWidth = '816px',
}: MdStreamingEditorProps) {
  const styleId = useId();
  const styleInjectedRef = useRef(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  // Read the latest value inside transition effects without making them re-run
  // on every streamed delta.
  const valueRef = useRef(value);
  valueRef.current = value;

  // Inject editor + diff + streaming styles once per mount.
  useEffect(() => {
    if (styleInjectedRef.current) return;
    const elementId = `md-streaming-editor-styles-${styleId}`;
    if (document.getElementById(elementId)) return;
    const style = document.createElement('style');
    style.id = elementId;
    style.textContent =
      editorStylesToCss() + '\n' + diffStylesToCss() + '\n' + streamingStylesToCss();
    document.head.appendChild(style);
    styleInjectedRef.current = true;
    return () => {
      style.remove();
      styleInjectedRef.current = false;
    };
  }, [styleId]);

  const editor = useMarkdownEditor({
    content: value,
    placeholder,
    editable: !isStreaming && !readOnly,
    onBlur,
  });

  // Post-stream editing: the editor is controlled by `value` only when NOT
  // streaming. During streaming we own the document via direct setContent
  // (below), so we pass `undefined` here to disable the controlled sync.
  const handleUpdate = useControlledEditor(
    editor,
    isStreaming ? undefined : value,
    onChange,
  );
  useEffect(() => {
    if (!editor) return;
    const handler = () => { handleUpdate(editor.getMarkdown()); };
    editor.on('update', handler);
    return () => { editor.off('update', handler); };
  }, [editor, handleUpdate]);

  // Live streaming sync: push each frame into the document without emitting an
  // update (so we don't echo back through onChange), then keep the view pinned
  // to the newest content.
  useEffect(() => {
    if (!editor || !isStreaming) return;
    const md = parseIncompleteMarkdown ? completeIncompleteMarkdown(value) : value;
    editor.commands.setContent(md || '', { contentType: 'markdown', emitUpdate: false });
    if (autoScroll && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [editor, value, isStreaming, parseIncompleteMarkdown, autoScroll]);

  // Keep editable state in sync: locked while streaming, editable after (unless readOnly).
  useEffect(() => {
    if (!editor) return;
    editor.setEditable(!isStreaming && !readOnly, false);
  }, [editor, isStreaming, readOnly]);

  // Fire onStreamEnd exactly on the streaming -> done transition, finalizing
  // the document with the raw (un-completed) markdown.
  const wasStreamingRef = useRef(isStreaming);
  useEffect(() => {
    if (!editor) return;
    const was = wasStreamingRef.current;
    wasStreamingRef.current = isStreaming;
    if (was && !isStreaming) {
      const finalMd = valueRef.current;
      editor.commands.setContent(finalMd || '', { contentType: 'markdown', emitUpdate: false });
      onStreamEnd?.(finalMd);
    }
  }, [editor, isStreaming, onStreamEnd]);

  useImperativeHandle(
    editorRef,
    () => ({
      getMarkdown: () => editor?.getMarkdown() ?? '',
      setMarkdown: (md: string) => {
        editor?.commands.setContent(md, { contentType: 'markdown' });
      },
      focus: () => editor?.commands.focus(),
      editor: editor ?? null,
    }),
    [editor],
  );

  const caretOn = showCaret ?? isStreaming;
  const editable = !isStreaming && !readOnly;

  return (
    <Box
      className={[
        'md-streaming-editor',
        caretOn ? 'is-streaming' : '',
        className ?? '',
      ]
        .filter(Boolean)
        .join(' ')}
      sx={{
        width: '100%',
        overflow: 'hidden',
        bgcolor: 'background.paper',
        ...(fillHeight
          ? { height: '100%', display: 'flex', flexDirection: 'column', minHeight: 0 }
          : {}),
      }}
    >
      {showToolbar && !readOnly && editor && (
        <Box sx={fillHeight ? { flexShrink: 0 } : undefined}>
          <Toolbar
            editor={editor}
            groups={toolbarGroups}
            rightContent={toolbarRightContent}
            disabled={isStreaming}
          />
        </Box>
      )}
      <Box
        ref={scrollRef}
        sx={{
          minHeight: fillHeight ? 0 : `${minHeight}px`,
          maxHeight: fillHeight ? undefined : maxHeight ? `${maxHeight}px` : undefined,
          overflowY: fillHeight || maxHeight ? 'auto' : undefined,
          flex: fillHeight ? 1 : undefined,
          cursor: editable ? 'text' : 'default',
        }}
        onClick={() => { if (editable) editor?.commands.focus(); }}
      >
        <Box
          sx={{
            maxWidth:
              contentMaxWidth === 'none'
                ? undefined
                : typeof contentMaxWidth === 'number'
                  ? `${contentMaxWidth}px`
                  : contentMaxWidth,
            mx: contentMaxWidth === 'none' ? undefined : 'auto',
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
