import { Hit, type MockProps } from './common';

const MENUS = ['File', 'Edit', 'Selection', 'View', 'Go', 'Run', 'Terminal', 'Help'];

/** A VS Code window with a small web project open. */
export function VSCodeMock({ terminal }: MockProps) {
  return (
    <div className="mk mk-vscode">
      <div className="mk-menubar">
        <span className="tf-logo code">❮❯</span>
        {MENUS.map((m) => (
          <Hit key={m} t={`menu-${m.toLowerCase()}`} className="mk-menu">
            {m}
          </Hit>
        ))}
        <Hit t="command-center" className="mk-command-center" title="Search files and run commands">
          ⌕ my-site
        </Hit>
      </div>
      <div className="mk-row mk-grow">
        <div className="mk-activity">
          <Hit t="act-explorer" title="Explorer">❐</Hit>
          <Hit t="act-search" title="Search">⌕</Hit>
          <Hit t="act-scm" title="Source Control">⑂</Hit>
          <Hit t="act-run" title="Run and Debug">▷</Hit>
          <Hit t="act-extensions" title="Extensions">⊞</Hit>
          <span className="spacer" />
          <Hit t="act-accounts" title="Accounts">◯</Hit>
          <Hit t="act-settings" title="Manage">⚙</Hit>
        </div>
        <div className="mk-side">
          <div className="mk-side-title">
            EXPLORER
            <span className="spacer" />
            <Hit t="new-file" title="New File…">🗋+</Hit>
            <Hit t="new-folder" title="New Folder…">🗀+</Hit>
          </div>
          <div className="mk-tree">
            <div className="mk-tree-root">▾ MY-SITE</div>
            <Hit t="folder-images" className="mk-file">▸ images</Hit>
            <Hit t="file-index" className="mk-file">◇ index.html</Hit>
            <Hit t="file-script" className="mk-file">◇ script.js</Hit>
            <Hit t="file-styles" className="mk-file">◇ styles.css</Hit>
          </div>
        </div>
        <div className="mk-col mk-grow">
          <div className="mk-tabs">
            <Hit t="tab-index" className="mk-tab on">index.html ✕</Hit>
            <Hit t="tab-styles" className="mk-tab">styles.css</Hit>
          </div>
          <div className="mk-row mk-grow">
            <Hit as="div" t="editor" className="mk-editor">
              {['<!DOCTYPE html>', '<html lang="en">', '<head>', '  <title>My site</title>', '  <link rel="stylesheet" href="styles.css">', '</head>', '<body>', '  <h1>Hello!</h1>', '</body>', '</html>'].map((l, i) => (
                <div key={i}>
                  <span className="ed-num">{i + 1}</span>
                  {l}
                </div>
              ))}
            </Hit>
            <Hit as="div" t="minimap" className="mk-minimap" title="Minimap" />
          </div>
          <div className="mk-panel">
            <div className="mk-panel-tabs">
              <Hit t="panel-problems">PROBLEMS</Hit>
              <Hit t="panel-output">OUTPUT</Hit>
              <Hit t="panel-debug">DEBUG CONSOLE</Hit>
              <Hit t="panel-terminal" className="on">TERMINAL</Hit>
              <Hit t="panel-ports">PORTS</Hit>
              <span className="spacer" />
              <Hit t="terminal-new" title="New Terminal">+</Hit>
              <Hit t="terminal-kill" title="Kill Terminal">🗑</Hit>
            </div>
            <div className="mk-panel-body">{terminal ?? <span className="muted">PS C:\dev\my-site&gt;</span>}</div>
          </div>
        </div>
      </div>
      <div className="mk-status code">
        <Hit t="status-branch">⎇ main</Hit>
        <Hit t="status-problems">⊗ 0 ⚠ 0</Hit>
        <span className="spacer" />
        <Hit t="status-indent">Spaces: 2</Hit>
        <Hit t="status-encoding">UTF-8</Hit>
        <Hit t="status-eol">CRLF</Hit>
        <Hit t="status-language">HTML</Hit>
        <Hit t="status-golive">⦿ Go Live</Hit>
      </div>
    </div>
  );
}
