import { Hit, type MockProps } from './common';

const MENUS = ['File', 'Edit', 'View', 'Git', 'Project', 'Build', 'Debug', 'Test', 'Analyze', 'Tools', 'Extensions', 'Window', 'Help'];

const CODE: Record<string, string[]> = {
  console: ['Console.Write("Your name? ");', 'string name = Console.ReadLine() ?? "";', 'int total = Add(2, 3);', 'Console.WriteLine($"Hi {name}, 2 + 3 = {total}");', '', 'static int Add(int a, int b)', '{', '    return a + b;', '}'],
  api: ['var builder = WebApplication.CreateBuilder(args);', 'builder.Services.AddOpenApi();', '', 'var app = builder.Build();', 'app.MapOpenApi();', '', 'app.MapGet("/todos", () => new[] { "Learn C#", "Ship it" });', '', 'app.Run();'],
  blazor: ['@page "/counter"', '@rendermode InteractiveServer', '', '<h1>Counter</h1>', '<p role="status">Current count: @currentCount</p>', '<button class="btn btn-primary" @onclick="IncrementCount">Click me</button>', '', '@code {', '    private int currentCount = 0;', '    private void IncrementCount() => currentCount++;', '}'],
};
CODE.debug = CODE.console;

/** Visual Studio with a console app, web API or Blazor app open. The `debug`
 * variant shows the app paused at a breakpoint. */
export function VisualStudioMock({ variant = 'console', terminal }: MockProps) {
  const debug = variant === 'debug';
  const name = variant === 'api' ? 'TodoApi' : variant === 'blazor' ? 'BlazorApp' : 'HelloApp';
  const file = variant === 'blazor' ? 'Counter.razor' : 'Program.cs';
  const stopLine = 2;
  return (
    <div className="mk mk-vs">
      <div className="mk-menubar">
        <span className="tf-logo vs">∞</span>
        {MENUS.map((m) => (
          <Hit key={m} t={`menu-${m.toLowerCase()}`} className="mk-menu">
            {m}
          </Hit>
        ))}
        <Hit t="search" className="mk-command-center" title="Search (Ctrl+Q)">
          Search ⌕
        </Hit>
        <span className="mk-title">{name}</span>
      </div>
      <div className="mk-toolbar">
        {debug ? (
          <>
            <Hit t="continue" className="mk-tb green" title="Continue (F5)">▶ Continue</Hit>
            <Hit t="pause" className="mk-tb" title="Break All (Ctrl+Alt+Break)">❚❚</Hit>
            <Hit t="stop" className="mk-tb red" title="Stop Debugging (Shift+F5)">■</Hit>
            <Hit t="restart" className="mk-tb" title="Restart (Ctrl+Shift+F5)">↻</Hit>
            <span className="mk-sep" />
            <Hit t="step-into" className="mk-tb" title="Step Into (F11)">↓</Hit>
            <Hit t="step-over" className="mk-tb" title="Step Over (F10)">↷</Hit>
            <Hit t="step-out" className="mk-tb" title="Step Out (Shift+F11)">↑</Hit>
          </>
        ) : (
          <>
            <Hit t="config-dropdown" className="mk-tb drop" title="Solution Configurations">Debug ▾</Hit>
            <Hit t="platform-dropdown" className="mk-tb drop" title="Solution Platforms">Any CPU ▾</Hit>
            <Hit t="start-debug" className="mk-tb green" title="Start Debugging (F5)">
              ▶ {variant === 'console' ? name : 'https'}
            </Hit>
            <Hit t="launch-profile" className="mk-tb" title="Launch profiles">▾</Hit>
            <Hit t="start-nodebug" className="mk-tb green-outline" title="Start Without Debugging (Ctrl+F5)">▷</Hit>
          </>
        )}
        <span className="mk-sep" />
        <Hit t="hot-reload" className="mk-tb" title="Hot Reload (Alt+F10)">🔥</Hit>
      </div>
      <div className="mk-row mk-grow">
        <div className="mk-col mk-grow">
          <div className="mk-tabs">
            <Hit t={variant === 'blazor' ? 'tab-counter' : 'tab-program'} className="mk-tab on">
              {file} ✕
            </Hit>
          </div>
          <Hit as="div" t="editor" className="mk-editor vs">
            {CODE[variant].map((l, i) => (
              <div key={i} className={debug && i === stopLine ? 'mk-current' : ''}>
                <Hit as="span" t={i === stopLine ? 'breakpoint-margin' : `margin-${i + 1}`} className="mk-margin" title="Breakpoint margin">
                  {debug && i === stopLine ? '●➜' : ''}
                </Hit>
                <span className="ed-num">{i + 1}</span>
                {l}
              </div>
            ))}
          </Hit>
          <div className="mk-panel vs">
            <div className="mk-panel-tabs">
              {debug ? (
                <>
                  <Hit t="tab-autos">Autos</Hit>
                  <Hit t="tab-locals" className="on">Locals</Hit>
                  <Hit t="tab-watch">Watch 1</Hit>
                  <Hit t="tab-callstack">Call Stack</Hit>
                  <Hit t="tab-immediate">Immediate Window</Hit>
                  <Hit t="tab-output">Output</Hit>
                </>
              ) : (
                <>
                  <Hit t="tab-errorlist" className="on">Error List</Hit>
                  <Hit t="tab-output">Output</Hit>
                  <Hit t="tab-pmc">Package Manager Console</Hit>
                  <Hit t="tab-terminal">Developer PowerShell</Hit>
                </>
              )}
            </div>
            <div className="mk-panel-body">
              {terminal ??
                (debug ? (
                  <table className="mk-table">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Value</th>
                        <th>Type</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>name</td>
                        <td>&quot;Sam&quot;</td>
                        <td>string</td>
                      </tr>
                      <tr>
                        <td>total</td>
                        <td>0</td>
                        <td>int</td>
                      </tr>
                    </tbody>
                  </table>
                ) : variant === 'console' ? (
                  <Hit as="div" t="error-row" className="mk-error-row">
                    ⊗ CS1002 ; expected · Program.cs · Line 3
                  </Hit>
                ) : (
                  <span className="muted">✓ No issues found</span>
                ))}
            </div>
          </div>
        </div>
        <div className="mk-side right">
          <div className="mk-side-title">Solution Explorer</div>
          <div className="mk-tree">
            <Hit t="sln" className="mk-file">▣ Solution &apos;{name}&apos; (1 of 1 project)</Hit>
            <Hit t="project" className="mk-file d1">▾ {name}</Hit>
            {variant !== 'console' && variant !== 'debug' && <Hit t="connected-services" className="mk-file d2">▸ Connected Services</Hit>}
            <Hit t="dependencies" className="mk-file d2">▸ Dependencies</Hit>
            {variant !== 'console' && variant !== 'debug' && (
              <>
                <Hit t="properties" className="mk-file d2">▾ Properties</Hit>
                <Hit t="launchsettings" className="mk-file d3">launchSettings.json</Hit>
              </>
            )}
            {variant === 'blazor' && (
              <>
                <Hit t="wwwroot" className="mk-file d2">▸ wwwroot</Hit>
                <Hit t="folder-components" className="mk-file d2">▾ Components</Hit>
                <Hit t="folder-layout" className="mk-file d3">▸ Layout</Hit>
                <Hit t="folder-pages" className="mk-file d3">▾ Pages</Hit>
                <Hit t="file-counter" className="mk-file d4">Counter.razor</Hit>
                <Hit t="file-home" className="mk-file d4">Home.razor</Hit>
                <Hit t="app-razor" className="mk-file d3">App.razor</Hit>
                <Hit t="routes-razor" className="mk-file d3">Routes.razor</Hit>
                <Hit t="imports-razor" className="mk-file d3">_Imports.razor</Hit>
              </>
            )}
            {variant !== 'console' && variant !== 'debug' && <Hit t="appsettings" className="mk-file d2">appsettings.json</Hit>}
            <Hit t="program-cs" className="mk-file d2">Program.cs</Hit>
            {variant === 'api' && <Hit t="http-file" className="mk-file d2">TodoApi.http</Hit>}
          </div>
        </div>
      </div>
      <div className={`mk-status vs ${debug ? 'debugging' : ''}`}>
        <span>{debug ? 'Debugging' : 'Ready'}</span>
        <span className="spacer" />
        <Hit t="status-git">⎇ main</Hit>
      </div>
    </div>
  );
}
