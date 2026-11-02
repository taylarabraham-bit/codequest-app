import { useDeferredValue } from 'react';
import { previewDoc } from '../../engine/check';
import type { PreviewSpec, TrackId } from '../../engine/types';
import { CodeView } from '../CodeView';

/** A browser window around the live preview (HTML and CSS tracks). */
export function BrowserFrame({ track, code, spec, file }: { track: TrackId; code: string; spec: PreviewSpec; file: string }) {
  const doc = useDeferredValue(previewDoc(track, code, spec));
  const title = /<title>([^<]*)<\/title>/i.exec(code)?.[1] || 'My site';
  return (
    <div className="win browser">
      <div className="browser-tabs" aria-hidden="true">
        <span className="browser-tab">{title}</span>
        <span className="tf-wt-plus">+</span>
      </div>
      <div className="browser-bar">
        <span aria-hidden="true">← → ⟳</span>
        <span className="browser-url">127.0.0.1:5500/{file === 'styles.css' ? 'index.html' : file}</span>
      </div>
      <iframe className="browser-view" title="Live preview" sandbox="" srcDoc={doc} />
    </div>
  );
}

/** The console the program writes to. Empty until the code has run. */
export function ConsoleWindow({ title, command, text, waiting }: { title: string; command: string; text?: string; waiting: string }) {
  return (
    <div className="win console-win">
      <div className="win-title">{title}</div>
      <div className="console-body">
        <div className="muted">{command}</div>
        {text ? <div className="pop">{text}</div> : <div className="muted console-wait">{waiting}</div>}
      </div>
    </div>
  );
}

/** For exercises with nothing to run: the code as it stands. */
export function CodeSnapshot({ code, track, label }: { code: string; track: TrackId; label: string }) {
  return (
    <div className="win">
      <div className="win-title">{label}</div>
      <div className="snapshot">{code.trim() ? <CodeView code={code} track={track} /> : <div className="muted">Your code shows here as you type.</div>}</div>
    </div>
  );
}
