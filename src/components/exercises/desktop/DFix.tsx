import { useMemo, useRef, useState } from 'react';
import { checkFixTyped, parseFixCode } from '../../../engine/check';
import type { FixExercise } from '../../../engine/types';
import { tokenClass } from '../../CodeView';
import { codeInputProps, EditorView, type Piece } from '../../desktop/EditorView';
import type { DesktopWidgetProps } from './common';

/** Click the wrong token, then type what it should be. */
export function DFix({ ex, track, locked, onChange, onTap }: DesktopWidgetProps<FixExercise>) {
  const { tokens } = useMemo(() => parseFixCode(ex.code, track), [ex, track]);
  const [tapped, setTapped] = useState(-1);
  const [typed, setTyped] = useState('');
  const input = useRef<HTMLInputElement>(null);

  const update = (t: number, v: string) => {
    setTapped(t);
    setTyped(v);
    const code = tokens.map((tok, i) => (i === t && v ? v : tok)).join('');
    onChange({ ready: t >= 0 && v.trim() !== '', correct: checkFixTyped(t, v, ex, track), code });
  };

  const pick = (i: number) => {
    if (locked) return;
    onTap();
    update(i, i === tapped ? typed : '');
    requestAnimationFrame(() => input.current?.focus());
  };

  const pieces: Piece[] = tokens.map((tok, i) =>
    /^\s+$/.test(tok)
      ? tok
      : {
          node: (
            <span
              role="button"
              aria-label={`Select ${tok}`}
              className={`tok-btn tappable ${tokenClass(tok, track, tokens[i - 1] ?? '')} ${i === tapped ? 'picked' : ''}`}
              tabIndex={locked ? -1 : 0}
              onClick={() => pick(i)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  pick(i);
                }
              }}
            >
              {i === tapped && typed ? typed : tok}
            </span>
          ),
        },
  );

  return (
    <>
      <p className="ed-tip">{tapped < 0 ? '1. Click the part of the code that is wrong.' : '2. Type what it should be, then Ctrl+Enter.'}</p>
      <EditorView pieces={pieces} track={track} />
      {tapped >= 0 && (
        <label className="fix-field pop">
          <span>
            Replace <code>{tokens[tapped]}</code> with
          </span>
          <input
            ref={input}
            className="ed-blank"
            value={typed}
            disabled={locked}
            aria-label="Replacement"
            style={{ width: `${Math.max(16, typed.length + 2)}ch` }}
            {...codeInputProps}
            onChange={(e) => update(tapped, e.target.value)}
          />
        </label>
      )}
    </>
  );
}
