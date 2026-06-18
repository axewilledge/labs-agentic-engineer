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
 * Auto-complete unterminated markdown so a half-streamed string parses cleanly
 * into the editor instead of flickering between valid and broken states (a
 * stray ```` ``` ````, a lone `**`, a dangling `[label](`, etc).
 *
 * The completion is purely cosmetic stabilization of the *current* streamed
 * frame — the next delta supersedes it, so it does not need to be perfect.
 */
export function completeIncompleteMarkdown(input: string): string {
  if (!input) return input;

  let text = input;

  // 1. Unterminated fenced code block: if the number of fence lines is odd,
  //    append a closing fence so the open block renders as code, not prose.
  const fenceMatches = text.match(/^[ \t]*```/gm);
  if (fenceMatches && fenceMatches.length % 2 === 1) {
    if (!text.endsWith('\n')) text += '\n';
    text += '```';
    // Inside an open fence everything is literal — leave inline tokens alone.
    return text;
  }

  // The rest operates on the active (last) line only, so we never mangle
  // already-complete markdown earlier in the document.
  const newlineIdx = text.lastIndexOf('\n');
  const head = newlineIdx === -1 ? '' : text.slice(0, newlineIdx + 1);
  let line = newlineIdx === -1 ? text : text.slice(newlineIdx + 1);

  // 2. Dangling link / image: `[label](partial` or `[label` with no close.
  const danglingLink = /(!?)\[[^\]]*\]\([^)]*$/.exec(line);
  if (danglingLink) return head + line.slice(0, danglingLink.index);
  const openBracket = /(!?)\[[^\]]*$/.exec(line);
  if (openBracket) return head + line.slice(0, openBracket.index);

  // 3. Unterminated inline code (odd number of single backticks on the line).
  const ticks = (line.match(/`/g) ?? []).length;
  if (ticks % 2 === 1) line += '`';

  // 4. Unterminated emphasis: close doubled markers first, then singles.
  for (const token of ['**', '__', '~~']) {
    if (countOccurrences(line, token) % 2 === 1) line += token;
  }
  for (const token of ['*', '_']) {
    if (countSingleEmphasis(line, token) % 2 === 1) line += token;
  }

  return head + line;
}

function countOccurrences(s: string, token: string): number {
  let count = 0;
  let idx = s.indexOf(token);
  while (idx !== -1) {
    count++;
    idx = s.indexOf(token, idx + token.length);
  }
  return count;
}

/**
 * Count single-char emphasis markers (`*` or `_`) that are NOT part of a
 * doubled marker (`**` / `__`), so we don't double-close what step 4 handled.
 */
function countSingleEmphasis(s: string, ch: string): number {
  let count = 0;
  for (let i = 0; i < s.length; i++) {
    if (s[i] !== ch) continue;
    const prev = s[i - 1];
    const next = s[i + 1];
    if (prev === ch || next === ch) {
      if (next === ch) i++;
      continue;
    }
    count++;
  }
  return count;
}
