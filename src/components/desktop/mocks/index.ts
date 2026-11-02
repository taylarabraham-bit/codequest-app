import type { ComponentType } from 'react';
import type { MockScreenId } from '../../../engine/types';
import type { MockProps } from './common';
import { DevToolsMock } from './DevToolsMock';
import { DockerDesktopMock } from './DockerDesktopMock';
import { TerminalMock } from './TerminalMock';
import { VisualStudioMock } from './VisualStudioMock';
import { VSCodeMock } from './VSCodeMock';

export const MOCKS: Record<MockScreenId, ComponentType<MockProps>> = {
  vscode: VSCodeMock,
  visualstudio: VisualStudioMock,
  devtools: DevToolsMock,
  dockerdesktop: DockerDesktopMock,
  terminal: TerminalMock,
};

export { MOCK_NAMES } from '../../../content/tours';
