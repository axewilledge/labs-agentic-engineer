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

import type { Theme } from '@mui/material/styles';

/** Palette tokens that track the active CSS color scheme (light/dark). */
export function themePalette(theme: Theme) {
  const v = theme.vars?.palette;
  const p = theme.palette;
  return {
    paper: (v?.background?.paper as string | undefined) ?? p.background.paper,
    textPrimary: (v?.text?.primary as string | undefined) ?? p.text.primary,
    textSecondary: (v?.text?.secondary as string | undefined) ?? p.text.secondary,
    textDisabled: (v?.text?.disabled as string | undefined) ?? p.text.disabled,
    divider: (v?.divider as string | undefined) ?? p.divider,
    primaryMain: (v?.primary?.main as string | undefined) ?? p.primary.main,
    primaryLight: (v?.primary?.light as string | undefined) ?? p.primary.light,
    primaryDark: (v?.primary?.dark as string | undefined) ?? p.primary.dark,
    successMain: (v?.success?.main as string | undefined) ?? p.success.main,
    successLight: (v?.success?.light as string | undefined) ?? p.success.light,
    successDark: (v?.success?.dark as string | undefined) ?? p.success.dark,
    errorMain: (v?.error?.main as string | undefined) ?? p.error.main,
    errorLight: (v?.error?.light as string | undefined) ?? p.error.light,
    errorDark: (v?.error?.dark as string | undefined) ?? p.error.dark,
  };
}

export type ThemePalette = ReturnType<typeof themePalette>;

/** Opacity helper that works with CSS var palette tokens (MUI alpha() does not). */
export function withAlpha(color: string, opacity: number): string {
  const pct = Math.round(opacity * 100);
  return `color-mix(in srgb, ${color} ${pct}%, transparent)`;
}
