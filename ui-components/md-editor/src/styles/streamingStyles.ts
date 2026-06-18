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

/**
 * Streaming caret styling for the WYSIWYG editor. A blinking block caret is
 * appended after the last rendered block while content is streaming in, via a
 * pure-CSS `::after` so it never becomes part of the editor's document.
 */

import { paletteVar } from './paletteVar.js';

export function streamingStylesToCss(): string {
  const caret = paletteVar('primary-main', '#1976d2');
  return `
@keyframes md-streaming-caret-blink {
  0%, 45% { opacity: 1; }
  50%, 95% { opacity: 0.15; }
  100% { opacity: 1; }
}
.md-streaming-editor.is-streaming .tiptap > :last-child::after {
  content: "";
  display: inline-block;
  width: 0.5em;
  height: 1.05em;
  margin-left: 0.1em;
  vertical-align: text-bottom;
  border-radius: 1px;
  background-color: ${caret};
  animation: md-streaming-caret-blink 1.05s steps(1, end) infinite;
}
/* Tuck the caret inside trailing code blocks rather than below them. */
.md-streaming-editor.is-streaming .tiptap > pre:last-child::after,
.md-streaming-editor.is-streaming .tiptap > blockquote:last-child::after {
  vertical-align: baseline;
  margin: 0.15em 0 0 0.1em;
  height: 0.95em;
}
/* Hide the empty-doc placeholder while streaming — the caret is the signal. */
.md-streaming-editor.is-streaming .tiptap p.is-editor-empty:first-child::before {
  content: "";
}
`;
}
