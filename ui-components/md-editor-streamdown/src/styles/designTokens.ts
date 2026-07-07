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
 * Streamdown's UI (code blocks, tables, mermaid controls, link-safety modal)
 * is built on shadcn/ui design tokens. Consumers that already define these
 * CSS custom properties get them for free; for everyone else we inject a
 * self-contained, neutral palette onto the wrapper so the component renders
 * correctly out of the box. Every token can still be overridden by an ancestor
 * because these are plain CSS variables.
 */
export type ColorScheme = 'light' | 'dark' | 'inherit';

export const lightTokens: Record<string, string> = {
  '--background': 'oklch(1 0 0)',
  '--foreground': 'oklch(0.145 0 0)',
  '--card': 'oklch(1 0 0)',
  '--card-foreground': 'oklch(0.145 0 0)',
  '--popover': 'oklch(1 0 0)',
  '--popover-foreground': 'oklch(0.145 0 0)',
  '--muted': 'oklch(0.97 0 0)',
  '--muted-foreground': 'oklch(0.556 0 0)',
  '--border': 'oklch(0.922 0 0)',
  '--input': 'oklch(0.922 0 0)',
  '--ring': 'oklch(0.708 0 0)',
  '--primary': 'oklch(0.205 0 0)',
  '--primary-foreground': 'oklch(0.985 0 0)',
  '--secondary': 'oklch(0.97 0 0)',
  '--secondary-foreground': 'oklch(0.205 0 0)',
  '--accent': 'oklch(0.97 0 0)',
  '--accent-foreground': 'oklch(0.205 0 0)',
  '--radius': '0.625rem',
};

export const darkTokens: Record<string, string> = {
  '--background': 'oklch(0.145 0 0)',
  '--foreground': 'oklch(0.985 0 0)',
  '--card': 'oklch(0.205 0 0)',
  '--card-foreground': 'oklch(0.985 0 0)',
  '--popover': 'oklch(0.205 0 0)',
  '--popover-foreground': 'oklch(0.985 0 0)',
  '--muted': 'oklch(0.269 0 0)',
  '--muted-foreground': 'oklch(0.708 0 0)',
  '--border': 'oklch(0.269 0 0)',
  '--input': 'oklch(0.269 0 0)',
  '--ring': 'oklch(0.439 0 0)',
  '--primary': 'oklch(0.985 0 0)',
  '--primary-foreground': 'oklch(0.205 0 0)',
  '--secondary': 'oklch(0.269 0 0)',
  '--secondary-foreground': 'oklch(0.985 0 0)',
  '--accent': 'oklch(0.269 0 0)',
  '--accent-foreground': 'oklch(0.985 0 0)',
  '--radius': '0.625rem',
};

export function tokensForScheme(scheme: ColorScheme): Record<string, string> | undefined {
  if (scheme === 'dark') return darkTokens;
  if (scheme === 'light') return lightTokens;
  return undefined;
}
