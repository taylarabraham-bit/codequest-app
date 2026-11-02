import { useRef, useState, type KeyboardEvent } from 'react';
import type { TrackId } from '../../engine/types';
import { Highlighted } from '../CodeView';
import { codeInputProps } from './EditorView';

/** Spaces per indent: 2 for markup and config, 4 for C#. */
const indentFor = (track: TrackId) => (track === 'csharp' || track === 'aspnet' || track === 'blazor' ? 4 : 2);

/** Insert text at the caret through the browser, so Ctrl+Z still undoes it. */
function insert(el: HTMLTextAreaElement, text: string) {
  el.focus();
  if (!document.execCommand('insertText', false, text)) el.setRangeText(text, el.selectionStart, el.selectionEnd, 'end');
}

/** A small multi-line code editor: a textarea laid over highlighted code, with
 * line numbers, Tab / Shift+Tab indenting and indentation kept on Enter.
 * Ctrl+M switches Tab between indenting and moving focus, like VS Code. */
export function CodeEditor({
  value,
  onChange,
  track,
  readOnly,
  label = 'Code editor',
}: {
  value: string;
  onChange: (v: string) => void;
  track: TrackId;
  readOnly?: boolean;
  label?: string;
}) {
  const area = useRef<HTMLTextAreaElement>(null);
  const [tabMoves, setTabMoves] = useState(false);
  const lines = value.split('\n');
  const width = Math.max(...lines.map((l) => l.length)) + 2;
  const unit = ' '.repeat(indentFor(track));

  const onKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    const el = e.currentTarget;
    const { selectionStart: start, selectionEnd: end } = el;
    if (e.key === 'm' && e.ctrlKey) {
      e.preventDefault();
      setTabMoves((t) => !t);
      return;
    }
    if (e.key === 'Tab' && !tabMoves) {
      e.preventDefault();
      const lineStart = value.lastIndexOf('\n', start - 1) + 1;
      if (e.shiftKey) {
        const lead = /^ */.exec(value.slice(lineStart))![0].length;
        const cut = Math.min(lead, unit.length);
        if (!cut) return;
        el.setSelectionRange(lineStart, lineStart + cut);
        insert(el, '');
        el.setSelectionRange(Math.max(lineStart, start - cut), Math.max(lineStart, end - cut));
      } else if (start !== end && value.slice(start, end).includes('\n')) {
        // Indent every selected line.
        const block = value.slice(lineStart, end);
        el.setSelectionRange(lineStart, end);
        insert(el, block.replace(/^/gm, unit));
      } else insert(el, unit);
      return;
    }
    if (e.key === 'Enter' && !e.ctrlKey && !e.shiftKey && !e.altKey) {
      e.preventDefault();
      const lineStart = value.lastIndexOf('\n', start - 1) + 1;
      const before = value.slice(lineStart, start);
      let lead = /^ */.exec(before)![0];
      const after = value.slice(end);
      // Opening a block: indent one more; between {} or ><, put the closer on its own line.
      if (/[{[(]\s*$/.test(before) || /<[a-zA-Z][^<>/]*>\s*$/.test(before) || /:\s*$/.test(before)) {
        const closes = /^\s*[}\])]/.test(after) || /^\s*<\//.test(after);
        lead += unit;
        insert(el, '\n' + lead + (closes ? '\n' + lead.slice(unit.length) : ''));
        if (closes) el.setSelectionRange(start + 1 + lead.length, start + 1 + lead.length);
        return;
      }
      insert(el, '\n' + lead);
    }
  };

  return (
    <div className="ce" onClick={() => area.current?.focus()}>
      <div className="ce-gutter" aria-hidden="true">
        {lines.map((_, i) => (
          <div key={i}>{i + 1}</div>
        ))}
      </div>
      <div className="ce-area" style={{ width: `calc(${width}ch + 28px)`, height: `calc(${lines.length} * 1.7em + 20px)` }}>
        <pre className="ce-hl" aria-hidden="true">
          <Highlighted code={value + '\n'} track={track} />
        </pre>
        <textarea
          ref={area}
          className="ce-input"
          aria-label={label}
          value={value}
          readOnly={readOnly}
          wrap="off"
          autoFocus
          {...codeInputProps}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={onKeyDown}
        />
      </div>
      {tabMoves && <div className="ce-mode">Tab moves focus (Ctrl+M to indent again)</div>}
    </div>
  );
}
