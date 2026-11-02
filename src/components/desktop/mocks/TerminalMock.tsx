import { Hit, type MockProps } from './common';

/** Windows Terminal with a PowerShell tab. */
export function TerminalMock({ terminal }: MockProps) {
  return (
    <div className="mk mk-wt">
      <div className="mk-wt-tabs">
        <Hit t="tab-ps" className="mk-wt-tab on">
          ⌨ Windows PowerShell
        </Hit>
        <Hit t="close-tab" title="Close tab">✕</Hit>
        <Hit t="new-tab" title="New Tab (Ctrl+Shift+T)">+</Hit>
        <Hit t="tab-dropdown" title="Open a profile or settings">⌄</Hit>
        <span className="spacer" />
        <span className="muted">—  ▢  ✕</span>
      </div>
      <div className="mk-wt-body">{terminal}</div>
    </div>
  );
}
