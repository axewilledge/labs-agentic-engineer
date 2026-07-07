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

import { useEffect, useRef } from 'react';
import type { CSSProperties } from 'react';
import { Streamdown } from 'streamdown';
import type { PluginConfig } from 'streamdown';
import { code } from '@streamdown/code';
import { math } from '@streamdown/math';
import { mermaid } from '@streamdown/mermaid';
import { cjk } from '@streamdown/cjk';
import 'streamdown/styles.css';
// Full KaTeX stylesheet: the math plugin's injected styles handle layout but
// not the `.katex-mathml` a11y clip, so without this the MathML node renders as
// a visible duplicate next to every rendered equation.
import 'katex/dist/katex.min.css';
import { tokensForScheme } from './styles/designTokens.js';
import type { MdStreamdownViewerProps } from './types.js';

/**
 * In streamdown@2.x, code highlighting (Shiki), math (KaTeX), Mermaid diagrams,
 * and CJK typography are opt-in plugins shipped as separate packages. Without
 * them, math renders as raw `$$…$$` text and Mermaid as a plain code block. We
 * enable them all by default so the wrapper is batteries-included; a consumer
 * can still override or disable any plugin via the `plugins` prop.
 */
const DEFAULT_PLUGINS: PluginConfig = { code, math, mermaid, cjk };

/**
 * A streaming-aware markdown **renderer** built on
 * [`streamdown`](https://streamdown.ai). Feed it the progressively-growing
 * string from a model token stream and it renders rich markdown live —
 * gracefully handling unterminated blocks, with Shiki-highlighted code,
 * GitHub-flavored tables/task-lists, KaTeX math, and Mermaid diagrams.
 *
 * The wrapper adds a self-contained design-token palette (so it looks right
 * with zero setup), an optional scroll container with auto-scroll-to-bottom
 * while streaming, and a readable content-width column — while forwarding the
 * full `streamdown` prop surface for advanced customization.
 */
export function MdStreamdownViewer({
  value,
  isStreaming = false,
  autoScroll = true,
  colorScheme = 'light',
  minHeight,
  maxHeight,
  fillHeight = false,
  contentMaxWidth,
  className,
  style,
  plugins,
  ...streamdownProps
}: MdStreamdownViewerProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const mergedPlugins: PluginConfig = { ...DEFAULT_PLUGINS, ...plugins };

  // Keep the surface pinned to the newest content while streaming.
  useEffect(() => {
    if (!isStreaming || !autoScroll) return;
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [value, isStreaming, autoScroll]);

  const tokenVars = tokensForScheme(colorScheme) as CSSProperties | undefined;
  const themed = colorScheme !== 'inherit';

  const containerStyle: CSSProperties = {
    ...tokenVars,
    width: '100%',
    boxSizing: 'border-box',
    ...(themed
      ? { background: 'var(--background)', color: 'var(--foreground)' }
      : {}),
    ...(fillHeight
      ? { height: '100%', minHeight: 0, overflowY: 'auto' }
      : {
          minHeight: minHeight != null ? `${minHeight}px` : undefined,
          maxHeight: maxHeight != null ? `${maxHeight}px` : undefined,
          overflowY: maxHeight != null ? 'auto' : undefined,
        }),
    ...style,
  };

  const hasMaxWidth = contentMaxWidth != null && contentMaxWidth !== 'none';
  const innerStyle: CSSProperties = {
    maxWidth: hasMaxWidth
      ? typeof contentMaxWidth === 'number'
        ? `${contentMaxWidth}px`
        : contentMaxWidth
      : undefined,
    marginInline: hasMaxWidth ? 'auto' : undefined,
    padding: 16,
  };

  return (
    <div
      ref={scrollRef}
      className={['md-streamdown-viewer', className].filter(Boolean).join(' ')}
      style={containerStyle}
    >
      <div style={innerStyle}>
        <Streamdown
          mode={isStreaming ? 'streaming' : 'static'}
          isAnimating={isStreaming}
          plugins={mergedPlugins}
          {...streamdownProps}
        >
          {value}
        </Streamdown>
      </div>
    </div>
  );
}
