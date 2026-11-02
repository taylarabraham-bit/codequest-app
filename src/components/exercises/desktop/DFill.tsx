import { useState } from 'react';
import { checkFill, fillCode } from '../../../engine/check';
import type { FillExercise } from '../../../engine/types';
import { codeInputProps, EditorView, type Piece } from '../../desktop/EditorView';
import type { DesktopWidgetProps } from './common';

/** Every blank is typed, including ones the phone edition offers as chips.
 * Tab / Shift+Tab move between blanks. */
export function DFill({ ex, track, locked, onChange }: DesktopWidgetProps<FillExercise>) {
  const [values, setValues] = useState<string[]>(() => ex.blanks.map(() => ''));
  const parts = ex.code.split('___');

  const update = (i: number, v: string) => {
    const next = [...values];
    next[i] = v;
    setValues(next);
    onChange({ ready: next.every((x) => x.trim() !== ''), correct: checkFill(next, ex, track), code: fillCode(ex.code, next) });
  };

  const pieces: Piece[] = [];
  parts.forEach((part, i) => {
    pieces.push(part);
    if (i < ex.blanks.length)
      pieces.push({
        node: (
          <input
            className="ed-blank"
            value={values[i]}
            disabled={locked}
            autoFocus={i === 0}
            aria-label={`Blank ${i + 1}`}
            style={{ width: `${Math.max(6, values[i].length + 2)}ch` }}
            {...codeInputProps}
            onChange={(e) => update(i, e.target.value)}
          />
        ),
      });
  });

  return (
    <>
      <EditorView pieces={pieces} track={track} />
      {ex.blanks.length > 1 && <p className="ed-tip">Tab moves to the next blank.</p>}
    </>
  );
}
