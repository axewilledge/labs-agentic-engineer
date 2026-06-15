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

import { paletteVar } from './paletteVar.js';

const success = paletteVar('success-main', '#2e7d32');
const successFg = paletteVar('success-dark', '#22633a');
const successFgDark = paletteVar('success-light', '#86efac');
const error = paletteVar('error-main', '#d32f2f');
const errorFg = paletteVar('error-dark', '#991b1b');
const errorFgDark = paletteVar('error-light', '#fca5a5');

const addedBg = `color-mix(in srgb, ${success} 18%, transparent)`;
const removedBg = `color-mix(in srgb, ${error} 18%, transparent)`;

/** CSS styles for diff marks and decorations in the TipTap editor. */
export const diffContentStyles: Record<string, Record<string, string>> = {
  // Mark-based styles (MdDiffViewer)
  '.tiptap ins.diff-added': {
    backgroundColor: addedBg,
    color: successFg,
    textDecoration: 'none',
  },
  ':root[data-mui-color-scheme="dark"] .tiptap ins.diff-added, :root[data-color-scheme="dark"] .tiptap ins.diff-added':
    {
      color: successFgDark,
    },
  '.tiptap del.diff-removed': {
    backgroundColor: removedBg,
    color: errorFg,
    textDecoration: 'line-through',
  },
  ':root[data-mui-color-scheme="dark"] .tiptap del.diff-removed, :root[data-color-scheme="dark"] .tiptap del.diff-removed':
    {
      color: errorFgDark,
    },
  // Decoration-based styles (inline diff mode)
  '.tiptap .diff-added': {
    backgroundColor: addedBg,
    borderRadius: '2px',
  },
  '.tiptap .diff-removed-widget': {
    backgroundColor: removedBg,
    color: errorFg,
    textDecoration: 'line-through',
    userSelect: 'none',
    pointerEvents: 'none',
    borderRadius: '2px',
  },
  ':root[data-mui-color-scheme="dark"] .tiptap .diff-removed-widget, :root[data-color-scheme="dark"] .tiptap .diff-removed-widget':
    {
      color: errorFgDark,
    },
};

/** Convert diff style object to CSS string. */
export function diffStylesToCss(): string {
  const lines: string[] = [];
  for (const [selector, props] of Object.entries(diffContentStyles)) {
    lines.push(`${selector} {`);
    for (const [prop, val] of Object.entries(props)) {
      const kebab = prop.replace(/[A-Z]/g, (m) => `-${m.toLowerCase()}`);
      lines.push(`  ${kebab}: ${val};`);
    }
    lines.push('}');
  }
  return lines.join('\n');
}
