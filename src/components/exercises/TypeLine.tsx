import { useRef, useState } from 'react';
import { checkType } from '../../engine/check';
import type { TrackId, TypeExercise } from '../../engine/types';
import { CodeView } from '../CodeView';
import type { WidgetProps } from './common';

const CS = ['(', ')', ';', '"', '{', '}', '=', '.', '+', '<', '>', '[', ']', '$', '!', '&', '|', '?', ':', ','];
const SHELL = ['-', ':', '/', '.', '=', '"', ',', '[', ']', '{', '}'];
const SYMBOLS: Record<TrackId, string[]> = {
  html: ['<', '>', '/', '=', '"', '!', '#', '-'],
  css: ['{', '}', ':', ';', '.', '#', '-', '%', '(', ')', ','],
  csharp: CS,
  aspnet: CS,
  blazor: ['@', ...CS],
  docker: SHELL,
  ollama: SHELL,
};

export function TypeLine({ ex, track, locked, onChange }: WidgetProps<TypeExercise>) {
  const [text, setText] = useState('');
  const input = useRef<HTMLInputElement>(null);

  const update = (v: string) => {
    setText(v);
    const code = ex.template ? ex.template.replace('___', v) : v;
    onChange({ ready: v.trim() !== '', correct: checkType(v, ex.accept, track), code });
  };

  const insert = (sym: string) => {
    const el = input.current;
    const start = el?.selectionStart ?? text.length;
    const end = el?.selectionEnd ?? text.length;
    update(text.slice(0, start) + sym + text.slice(end));
    requestAnimationFrame(() => {
      el?.focus();
      el?.setSelectionRange(start + sym.length, start + sym.length);
    });
  };

  return (
    <>
      {ex.template && <CodeView code={ex.template.replace('___', '/* your line */')} track={track} />}
      <div style={{ marginTop: 12 }}>
        <input
          ref={input}
          className="type-input"
          value={text}
          disabled={locked}
          placeholder="Type your line…"
          autoCapitalize="off"
          autoCorrect="off"
          autoComplete="off"
          spellCheck={false}
          enterKeyHint="done"
          onChange={(e) => update(e.target.value)}
        />
        {!locked && (
          <div className="symbol-bar" onMouseDown={(e) => e.preventDefault()}>
            {SYMBOLS[track].map((s) => (
              <button key={s} onClick={() => insert(s)}>
                {s}
              </button>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
