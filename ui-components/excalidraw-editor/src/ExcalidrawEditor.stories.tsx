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

import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { ExcalidrawEditor } from './ExcalidrawEditor.js';

const meta = {
  title: 'Components/ExcalidrawEditor',
  component: ExcalidrawEditor,
  parameters: { layout: 'padded' },
  argTypes: {
    readOnly: { control: 'boolean' },
    fillHeight: { control: 'boolean' },
  },
} satisfies Meta<typeof ExcalidrawEditor>;

export default meta;
type Story = StoryObj<typeof meta>;

export const BlankCanvas: Story = {
  args: { value: '' },
};

export const ReadOnly: Story = {
  args: { value: '', readOnly: true },
  parameters: {
    docs: {
      description: {
        story: 'View-only mode — the canvas is rendered but cannot be edited.',
      },
    },
  },
};

export const Controlled: Story = {
  args: {},
  render: function ControlledStory() {
    const [json, setJson] = useState('');
    return (
      <div style={{ display: 'flex', gap: 16, flexDirection: 'column' }}>
        <ExcalidrawEditor value={json} onChange={setJson} />
        <div
          style={{
            fontFamily: 'monospace',
            fontSize: 11,
            padding: 8,
            border: '1px solid #e0e0e0',
            borderRadius: 4,
            background: '#fafafa',
            maxHeight: 120,
            overflow: 'auto',
          }}
        >
          <strong>onChange output (truncated):</strong>{' '}
          {json ? json.slice(0, 200) + (json.length > 200 ? '…' : '') : '(no changes yet)'}
        </div>
      </div>
    );
  },
};
