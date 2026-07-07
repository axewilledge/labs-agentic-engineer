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

import type { ComponentProps, CSSProperties } from 'react';
import type { Streamdown } from 'streamdown';
import type { ColorScheme } from './styles/designTokens.js';

export type { ColorScheme };

/** The full prop surface of the underlying `streamdown` component. */
export type StreamdownProps = ComponentProps<typeof Streamdown>;

/**
 * Props for {@link MdStreamdownViewer}.
 *
 * Every prop accepted by the underlying `streamdown` component is forwarded
 * (`shikiTheme`, `controls`, `caret`, `mermaid`, `components`, `remarkPlugins`,
 * …) — except `children`, `isAnimating`, and `mode`, which this wrapper derives
 * from {@link MdStreamdownViewerProps.value} and
 * {@link MdStreamdownViewerProps.isStreaming}.
 */
export interface MdStreamdownViewerProps
  extends Omit<StreamdownProps, 'children' | 'isAnimating' | 'mode'> {
  /**
   * The markdown to render. Feed it the progressively-growing string from a
   * model token stream — incomplete blocks (open code fences, half-typed
   * emphasis, dangling links) are parsed gracefully while `isStreaming`.
   */
  value: string;
  /**
   * Whether content is actively streaming. While `true` the component renders
   * in streaming mode with the animated caret enabled and copy/download buttons
   * suppressed. Maps to streamdown's `mode` + `isAnimating`. Default: `false`.
   */
  isStreaming?: boolean;
  /**
   * Keep the surface scrolled to the newest content while streaming. Only has
   * an effect when a `maxHeight` or `fillHeight` makes the surface scrollable.
   * Default: `true`.
   */
  autoScroll?: boolean;
  /**
   * Inject a self-contained shadcn-style design-token palette onto the wrapper
   * so the component renders correctly without any consumer setup. Pass
   * `'inherit'` to inject nothing and use tokens defined by an ancestor.
   * Default: `'light'`.
   */
  colorScheme?: ColorScheme;
  /** Minimum height in pixels. */
  minHeight?: number;
  /** Maximum height in pixels (content scrolls beyond it). */
  maxHeight?: number;
  /**
   * Fill the parent's height and scroll only the content area. Overrides
   * `minHeight` / `maxHeight`. Default: `false`.
   */
  fillHeight?: boolean;
  /**
   * Max width of the rendered content column. Pass a number (pixels) or any CSS
   * length; omit (or `'none'`) to fill the container width.
   */
  contentMaxWidth?: number | string;
  /** Additional CSS class for the root container. */
  className?: string;
  /** Inline styles merged onto the root container. */
  style?: CSSProperties;
}
