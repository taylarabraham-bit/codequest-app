import type { MockScreenId, Tour, TrackId } from '../../engine/types';
import aspnet from './aspnet';
import blazor from './blazor';
import csharp from './csharp';
import docker from './docker';
import html from './html';
import ollama from './ollama';
import css from './css';

// Tool tours (desktop edition): clickable mocks of the tools each track uses.
const TOURS: Record<TrackId, Tour[]> = { html, css, csharp, aspnet, blazor, docker, ollama };

export const toursFor = (track: TrackId): Tour[] => TOURS[track];
export const tourId = (track: TrackId, i: number) => `${track}-tour${i + 1}`;

export const MOCK_NAMES: Record<MockScreenId, string> = {
  vscode: 'VS Code',
  visualstudio: 'Visual Studio',
  devtools: 'Browser DevTools',
  dockerdesktop: 'Docker Desktop',
  terminal: 'Terminal',
};
