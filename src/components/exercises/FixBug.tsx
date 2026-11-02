import { useMemo, useState } from 'react';
import { checkFix, parseFixCode } from '../../engine/check';
import { shuffled } from '../../engine/shuffle';
import type { FixExercise } from '../../engine/types';
import { tokenClass } from '../CodeView';
import type { WidgetProps } from './common';

export function FixBug({ ex, track, seed, locked, onChange, onTap }: WidgetProps<FixExercise>) {
  const { tokens } = useMemo(() => parseFixCode(ex.code, track), [ex, track]);
  const options = useMemo(() => shuffled(ex.options, seed), [ex, seed]);
  const [tapped, setTapped] = useState(-1);
  const [chosen, setChosen] = useState('');

  const update = (t: number, c: string) => {
    setTapped(t);
    setChosen(c);
    const code = tokens.map((tok, i) => (i === t && c ? c : tok)).join('');
    onChange({ ready: t >= 0 && c !== '', correct: checkFix(t, c, ex, track), code });
  };

  return (
    <>
      <p className="muted small" style={{ marginTop: -6 }}>
        {tapped < 0 ? '1. Tap the part of the code that is wrong.' : '2. Pick what it should be.'}
      </p>
      <div className="code">
        {tokens.map((tok, i) =>
          /^\s+$/.test(tok) ? (
            <span key={i}>{tok}</span>
          ) : (
            <span
              key={i}
              role="button"
              className={`tok-btn tappable ${tokenClass(tok, track, tokens[i - 1] ?? '')} ${i === tapped ? 'picked' : ''}`}
              onClick={() => {
                if (locked) return;
                onTap();
                update(i, i === tapped ? chosen : '');
              }}
            >
              {i === tapped && chosen ? chosen : tok}
            </span>
          ),
        )}
      </div>
      {tapped >= 0 && !locked && (
        <div className="chips pop" style={{ marginTop: 16 }}>
          {options.map((opt) => (
            <button
              key={opt}
              className={`chip ${chosen === opt ? 'selected' : ''}`}
              onClick={() => {
                onTap();
                update(tapped, opt);
              }}
            >
              {opt}
            </button>
          ))}
        </div>
      )}
    </>
  );
}
