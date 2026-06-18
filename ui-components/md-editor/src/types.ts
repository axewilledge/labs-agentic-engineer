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

import type React from 'react';
import type { Editor } from '@tiptap/react';
import type { CollabConfig } from './extensions/index.js';

export type { CollabConfig };

export type ToolbarGroup =
  | 'text-style'
  | 'headings'
  | 'lists'
  | 'blocks'
  | 'links'
  | 'history';

export const ALL_TOOLBAR_GROUPS: ToolbarGroup[] = [
  'text-style',
  'headings',
  'lists',
  'blocks',
  'links',
  'history',
];

export interface MdEditorProps {
  /** Controlled markdown string value */
  value?: string;
  /** Initial value for uncontrolled mode */
  defaultValue?: string;
  /** Called with markdown string on every content change */
  onChange?: (markdown: string) => void;
  /** Called on blur with final markdown string */
  onBlur?: (markdown: string) => void;
  /** Placeholder text when editor is empty */
  placeholder?: string;
  /** Disable editing */
  readOnly?: boolean;
  /** Minimum height in pixels. Default: 200 */
  minHeight?: number;
  /** Maximum height in pixels (scrolls beyond). Default: none */
  maxHeight?: number;
  /**
   * Fill the parent's height and make only the content area scroll.
   * The editor becomes a flex column: toolbar stays pinned; the editor
   * surface gets `flex:1` and `overflowY:auto`. Overrides min/maxHeight.
   */
  fillHeight?: boolean;
  /** Show/hide the toolbar. Default: true */
  showToolbar?: boolean;
  /** Which toolbar groups to display. Default: all groups */
  toolbarGroups?: ToolbarGroup[];
  /** Optional content rendered on the right side of the toolbar */
  toolbarRightContent?: React.ReactNode;
  /** Additional CSS class for the root container */
  className?: string;
  /** Auto-focus the editor on mount. Default: false */
  autoFocus?: boolean;
  /** Ref for imperative access to the editor */
  editorRef?: React.Ref<MdEditorRef>;
  /** Base markdown to diff against. When set, shows inline diff decorations while editing. */
  baseMarkdown?: string;
  /**
   * Real-time collaboration config. When provided, the editor binds directly to
   * the supplied Y.Doc via y-prosemirror — local edits become granular Y ops,
   * remote ops apply as granular PM transactions, and peer carets/selections
   * are rendered via `@tiptap/extension-collaboration-caret` (no offset math).
   *
   * In collab mode the editor is uncontrolled — `value` is ignored. To seed
   * content, call `editor.commands.setContent(md, { contentType: 'markdown' })`
   * via the imperative ref once, on a fresh empty Y fragment.
   */
  collab?: CollabConfig;
  /**
   * Max width of the editor content column. Defaults to `'816px'` (roughly
   * Google Docs readable-column width). Pass a number (pixels) or any CSS
   * length. Pass `'none'` to let the content fill the entire editor pane.
   */
  contentMaxWidth?: number | string;
}

export interface MdStreamingEditorProps {
  /**
   * The markdown content. Feed it the progressively-growing string from a model
   * token stream — while `isStreaming` is true it is pushed into the editor on
   * every change and rendered live as rich text. Controlled.
   */
  value: string;
  /**
   * Whether content is actively streaming. While `true` the editor is
   * non-editable, a blinking caret is shown, and incomplete markdown is
   * auto-completed. When it flips to `false` the editor becomes editable
   * (unless `readOnly`) and `onStreamEnd` fires.
   */
  isStreaming: boolean;
  /** Called with markdown on user edits after streaming has ended. */
  onChange?: (markdown: string) => void;
  /** Called once with the final markdown when streaming ends. */
  onStreamEnd?: (markdown: string) => void;
  /** Called on blur with final markdown string. */
  onBlur?: (markdown: string) => void;
  /** Keep the editor read-only even after streaming finishes. Default: false. */
  readOnly?: boolean;
  /**
   * Auto-complete unterminated markdown tokens (open code fences, inline code,
   * bold/italic/strikethrough, dangling links) while streaming. Default: true.
   */
  parseIncompleteMarkdown?: boolean;
  /** Show the blinking streaming caret. Defaults to following `isStreaming`. */
  showCaret?: boolean;
  /** Keep the surface scrolled to the newest content while streaming. Default: true. */
  autoScroll?: boolean;
  /** Placeholder text when the editor is empty and editable. */
  placeholder?: string;
  /** Minimum height in pixels. Default: 200. */
  minHeight?: number;
  /** Maximum height in pixels (scrolls beyond). Default: none. */
  maxHeight?: number;
  /** Fill the parent's height and scroll only the content area. Overrides min/maxHeight. */
  fillHeight?: boolean;
  /** Show the formatting toolbar once the editor is editable (after streaming). Default: true. */
  showToolbar?: boolean;
  /** Which toolbar groups to display. Default: all groups. */
  toolbarGroups?: ToolbarGroup[];
  /** Optional content rendered on the right side of the toolbar. */
  toolbarRightContent?: React.ReactNode;
  /** Additional CSS class for the root container. */
  className?: string;
  /** Ref for imperative access to the editor. */
  editorRef?: React.Ref<MdEditorRef>;
  /** Max width of the editor content column. Default: `'816px'`; `'none'` fills the pane. */
  contentMaxWidth?: number | string;
}

export interface MdDiffViewerProps {
  /** The original markdown content (before changes) */
  oldMarkdown: string;
  /** The updated markdown content (after changes) */
  newMarkdown: string;
  /** Minimum height in pixels. Default: 200 */
  minHeight?: number;
  /** Maximum height in pixels (scrolls beyond). Default: none */
  maxHeight?: number;
  /** Additional CSS class for the root container */
  className?: string;
}

export interface UseEditorStorageOptions {
  /** localStorage key for this document */
  storageKey: string;
  /** Max snapshots to keep. Default: 50 */
  maxSnapshots?: number;
  /** Debounce delay in ms for saving. Default: 500 */
  debounceMs?: number;
}

export interface UseEditorStorageReturn {
  /** Current markdown value (latest snapshot or empty) */
  value: string;
  /** Call on every editor change */
  onChange: (markdown: string) => void;
  /** Undo to previous snapshot */
  undo: () => void;
  /** Redo to next snapshot */
  redo: () => void;
  /** Whether undo is available */
  canUndo: boolean;
  /** Whether redo is available */
  canRedo: boolean;
  /** Clear all saved snapshots */
  clear: () => void;
}

export interface MdEditorRef {
  /** Get the current markdown content */
  getMarkdown(): string;
  /** Set markdown content programmatically */
  setMarkdown(md: string): void;
  /** Focus the editor */
  focus(): void;
  /** Access the underlying TipTap editor instance */
  editor: Editor | null;
}
