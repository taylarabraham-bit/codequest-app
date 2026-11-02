import type { ReactNode } from 'react';
import type { TrackId } from '../../engine/types';

// Editor chrome modelled on the tools each track is written in, so the layout
// of the real apps feels familiar: VS Code for web pages, Docker and Ollama;
// Visual Studio for C#, ASP.NET and Blazor; Windows Terminal for commands.

export type Tool = 'vscode' | 'vs' | 'terminal';

export const toolFor = (track: TrackId): Exclude<Tool, 'terminal'> =>
  track === 'csharp' || track === 'aspnet' || track === 'blazor' ? 'vs' : 'vscode';

const PROJECT: Record<TrackId, string> = {
  html: 'my-site',
  css: 'my-site',
  csharp: 'HelloApp',
  aspnet: 'TodoApi',
  blazor: 'BlazorApp',
  docker: 'shop-app',
  ollama: 'local-ai',
};

/** The file an exercise's code most likely lives in. Cosmetic only. */
export function fileFor(track: TrackId, code: string): string {
  const c = code.trimStart();
  // A first-line comment naming a file (`# request.json`, `// Program.cs`) wins.
  const named = /^(?:#|\/\/|@\*)\s*([\w.-]+\.[a-z]{2,6})\b/i.exec(c);
  if (named) return named[1];
  // PowerShell commands (curl.exe, $env:, Get-Content) read as a script.
  // Command lines (not a Dockerfile or JSON) read as a PowerShell script.
  const commands = /^(PS>\s*)?(curl\.exe|\$env:|Get-Content|Set-Content|setx|Invoke-RestMethod|docker|kubectl|kind|ollama|dotnet)(\s|$)/m;
  if (commands.test(c) && !c.startsWith('{') && !/^(FROM|RUN|COPY|CMD|ENTRYPOINT|WORKDIR)\s/m.test(c) && !/^\s*\w+:\s*$/m.test(c))
    return 'commands.ps1';
  if (track === 'html') return 'index.html';
  if (track === 'css') return 'styles.css';
  if (/^(apiVersion|kind):/m.test(c)) return 'deployment.yaml';
  if (/^(services|volumes|networks):/m.test(c) || /^\s+(image|build|ports):/m.test(c)) return 'compose.yaml';
  if (track === 'docker') return /^[a-z_*!./]+$/m.test(c.split('\n')[0]) && !/^[A-Z]/.test(c) ? '.dockerignore' : 'Dockerfile';
  if (track === 'ollama') {
    if (/^(FROM|PARAMETER|SYSTEM|TEMPLATE|MESSAGE|ADAPTER|LICENSE)\b/m.test(c)) return 'Modelfile';
    if (c.startsWith('{') || c.startsWith('[')) return 'request.json';
    if (/^(FROM|RUN|COPY|CMD)\b/.test(c)) return 'Dockerfile';
    return 'Program.cs';
  }
  if (c.startsWith('{')) return 'appsettings.json';
  if (/^<(Project|ItemGroup|PackageReference)/.test(c)) return `${PROJECT[track]}.csproj`;
  if (track === 'blazor' && (/^@/m.test(c) || /^<[A-Z]?[a-zA-Z]/.test(c))) return 'Counter.razor';
  return 'Program.cs';
}

const lang = (file: string) =>
  ({ html: 'HTML', css: 'CSS', cs: 'C#', razor: 'Razor', json: 'JSON', yaml: 'YAML', csproj: 'XML', ps1: 'PowerShell' })[file.split('.').pop() ?? ''] ??
  'Plain Text';

/** The files shown in the side tree, with the open one marked. */
function tree(track: TrackId, file: string): { name: string; depth: number; folder?: boolean }[] {
  const f = (name: string, depth = 1) => ({ name, depth });
  const d = (name: string, depth = 1) => ({ name, depth, folder: true });
  const extra = (names: string[]) => (names.includes(file) ? [] : [f(file)]);
  switch (track) {
    case 'html':
    case 'css':
      return [d('images'), f('index.html'), f('styles.css'), f('script.js')];
    case 'docker':
      return [d('src'), f('.dockerignore'), f('compose.yaml'), f('Dockerfile'), f('package.json'), ...extra(['.dockerignore', 'compose.yaml', 'Dockerfile'])];
    case 'ollama':
      return [d('data'), f('Modelfile'), f('Program.cs'), f('request.json'), ...extra(['Modelfile', 'Program.cs', 'request.json'])];
    case 'csharp':
      return [d('Dependencies'), f('Program.cs'), ...extra(['Program.cs'])];
    case 'aspnet':
      return [d('Connected Services'), d('Dependencies'), d('Properties'), f('appsettings.json'), f('Program.cs'), f('TodoApi.http'), ...extra(['appsettings.json', 'Program.cs'])];
    case 'blazor':
      return [
        d('Dependencies'),
        d('Properties'),
        d('wwwroot'),
        d('Components'),
        d('Layout', 2),
        d('Pages', 2),
        f('Counter.razor', 3),
        f('Home.razor', 3),
        f('App.razor', 2),
        f('Routes.razor', 2),
        f('_Imports.razor', 2),
        f('appsettings.json'),
        f('Program.cs'),
        ...extra(['Counter.razor', 'appsettings.json', 'Program.cs']),
      ];
  }
}

function FileTree({ track, file }: { track: TrackId; file: string }) {
  return (
    <ul className="tf-tree">
      {tree(track, file).map((n, i) => (
        <li key={i} className={n.name === file ? 'on' : ''} style={{ paddingLeft: 8 + n.depth * 12 }}>
          <span className="tf-ico" aria-hidden="true">
            {n.folder ? '▸' : '·'}
          </span>
          {n.name}
        </li>
      ))}
    </ul>
  );
}

const VSCODE_MENU = ['File', 'Edit', 'Selection', 'View', 'Go', 'Run', 'Terminal', 'Help'];
const VS_MENU = ['File', 'Edit', 'View', 'Git', 'Project', 'Build', 'Debug', 'Test', 'Analyze', 'Tools', 'Extensions', 'Window', 'Help'];

export function ToolFrame({
  tool,
  track,
  file,
  onRun,
  canRun,
  children,
}: {
  tool: Tool;
  track: TrackId;
  file: string;
  onRun: () => void;
  canRun: boolean;
  children: ReactNode;
}) {
  const project = PROJECT[track];
  if (tool === 'terminal') {
    return (
      <div className="tf tf-terminal">
        <div className="tf-wt-tabs" aria-hidden="true">
          <span className="tf-wt-tab on">⌨ Windows PowerShell</span>
          <span className="tf-wt-plus">+</span>
          <span className="tf-wt-plus">⌄</span>
        </div>
        <div className="tf-body tf-term-body">{children}</div>
      </div>
    );
  }
  if (tool === 'vs') {
    return (
      <div className="tf tf-vs">
        <div className="tf-menubar" aria-hidden="true">
          <span className="tf-logo vs">∞</span>
          {VS_MENU.map((m) => (
            <span key={m}>{m}</span>
          ))}
          <span className="tf-search">Search ⌕</span>
          <span className="tf-title">{project}</span>
        </div>
        <div className="tf-toolbar">
          <span className="tf-drop" aria-hidden="true">Debug ▾</span>
          <span className="tf-drop" aria-hidden="true">Any CPU ▾</span>
          <button className="tf-run" onClick={onRun} disabled={!canRun} title="Check (Ctrl+Enter)">
            <span aria-hidden="true">▶</span> {track === 'csharp' ? project : 'https'}
          </button>
          <span className="tf-icon-btn" aria-hidden="true">▷</span>
        </div>
        <div className="tf-body tf-vs-body">
          <div className="tf-editor">
            <div className="tf-tabs">
              <span className="tf-tab on">
                {file} <span aria-hidden="true">✕</span>
              </span>
            </div>
            <div className="tf-content">{children}</div>
          </div>
          <aside className="tf-side tf-side-right" aria-label="Solution Explorer">
            <div className="tf-side-title">Solution Explorer</div>
            <div className="tf-tree-root">▣ Solution &apos;{project}&apos; (1 of 1 project)</div>
            <div className="tf-tree-root" style={{ paddingLeft: 14 }}>
              ▾ {project}
            </div>
            <FileTree track={track} file={file} />
          </aside>
        </div>
        <div className="tf-status vs" aria-hidden="true">
          <span>Ready</span>
          <span className="spacer" />
          <span>Ln 1 · Ch 1</span>
          <span>⎇ main</span>
        </div>
      </div>
    );
  }
  return (
    <div className="tf tf-vscode">
      <div className="tf-menubar" aria-hidden="true">
        <span className="tf-logo code">❮❯</span>
        {VSCODE_MENU.map((m) => (
          <span key={m}>{m}</span>
        ))}
        <span className="tf-search center">⌕ {project}</span>
      </div>
      <div className="tf-body tf-vscode-body">
        <nav className="tf-activity" aria-hidden="true">
          <span className="on" title="Explorer">❐</span>
          <span title="Search">⌕</span>
          <span title="Source Control">⑂</span>
          <span title="Run and Debug">▷</span>
          <span title="Extensions">⊞</span>
        </nav>
        <aside className="tf-side" aria-label="Explorer">
          <div className="tf-side-title">Explorer</div>
          <div className="tf-tree-root">▾ {project.toUpperCase()}</div>
          <FileTree track={track} file={file} />
        </aside>
        <div className="tf-editor">
          <div className="tf-tabs">
            <span className="tf-tab on">
              {file} <span aria-hidden="true">✕</span>
            </span>
            <span className="spacer" />
            <button className="tf-run small" onClick={onRun} disabled={!canRun} title="Check (Ctrl+Enter)">
              <span aria-hidden="true">▶</span> Run
            </button>
          </div>
          <div className="tf-breadcrumb" aria-hidden="true">
            {project} › {file}
          </div>
          <div className="tf-content">{children}</div>
        </div>
      </div>
      <div className="tf-status code" aria-hidden="true">
        <span>⎇ main</span>
        <span>⊗ 0 ⚠ 0</span>
        <span className="spacer" />
        <span>Spaces: 2</span>
        <span>UTF-8</span>
        <span>CRLF</span>
        <span>{lang(file)}</span>
        {(track === 'html' || track === 'css') && <span>◉ Port : 5500</span>}
      </div>
    </div>
  );
}
