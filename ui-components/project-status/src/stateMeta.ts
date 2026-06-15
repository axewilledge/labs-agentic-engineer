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
import type { StageState } from './types.js';
import { themePalette, withAlpha } from './themePalette.js';

export interface ResolvedStateMeta {
  label: string;
  dot: string;
  pillBg: string;
  pillText: string;
}

export function resolveStateMeta(
  theme: Theme,
  state: StageState,
  isDark = theme.palette.mode === 'dark',
): ResolvedStateMeta {
  const c = themePalette(theme);
  switch (state) {
    case 'done':
      return {
        label: 'Complete',
        dot: c.successMain,
        pillBg: withAlpha(c.successMain, isDark ? 0.18 : 0.1),
        pillText: isDark ? c.successLight : c.successDark,
      };
    case 'active':
      return {
        label: 'Running',
        dot: c.primaryMain,
        pillBg: withAlpha(c.primaryMain, isDark ? 0.2 : 0.12),
        pillText: isDark ? c.primaryLight : c.primaryDark,
      };
    case 'blocked':
      return {
        label: 'Blocked',
        dot: c.errorMain,
        pillBg: withAlpha(c.errorMain, isDark ? 0.18 : 0.12),
        pillText: isDark ? c.errorLight : c.errorDark,
      };
    case 'pending':
    default:
      return {
        label: 'Pending',
        dot: c.textDisabled,
        pillBg: withAlpha(c.textDisabled, isDark ? 0.18 : 0.12),
        pillText: c.textSecondary,
      };
  }
}
