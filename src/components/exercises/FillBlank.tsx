import { Fragment, useState } from 'react';
import { checkFill, fillCode } from '../../engine/check';
import type { FillExercise } from '../../engine/types';
import { Highlighted } from '../CodeView';
import { shuffled } from '../../engine/shuffle';
import type { WidgetProps } from './common';

export function FillBlank({ ex, track, seed, locked, onChange, onTap }: WidgetProps<FillExercise>) {
  const [values, setValues] = useState<string[]>(() => ex.blanks.map(() => ''));
  const [active, setActive] = useState(0);
  const parts = ex.code.split('___');

  const update = (next: string[], nextActive = active) => {
    setValues(next);
    setActive(nextActive);
    onChange({ ready: next.every((v) => v.trim() !== ''), correct: checkFill(next, ex, track), code: fillCode(ex.code, next) });
  };

  const pick = (opt: string) => {
    if (locked) return;
    onTap();
    const next = [...values];
    next[active] = opt;
    const empty = next.findIndex((v, i) => v === '' && ex.blanks[i].options);
    update(next, empty === -1 ? active : empty);
  };

  const activeBlank = ex.blanks[active];
  return (
    <>
      <div className="code">
        {parts.map((part, i) => (
          <Fragment key={i}>
            <Highlighted code={part} track={track} />
            {i < ex.blanks.length &&
              (ex.blanks[i].options ? (
                <button
                  className={`slot ${values[i] ? 'filled' : ''} ${i === active && !locked ? 'active' : ''}`}
                  onClick={() => !locked && setActive(i)}
                  aria-label={`Blank ${i + 1}`}
                >
                  {values[i] || ' '}
                </button>
              ) : (
                <input
                  className="slot-input"
                  value={values[i]}
                  disabled={locked}
                  autoCapitalize="off"
                  autoCorrect="off"
                  autoComplete="off"
                  spellCheck={false}
                  aria-label={`Blank ${i + 1}`}
                  style={{ width: `${Math.max(5, values[i].length + 2)}ch` }}
                  onFocus={() => setActive(i)}
                  onChange={(e) => {
                    const next = [...values];
                    next[i] = e.target.value;
                    update(next, i);
                  }}
                />
              ))}
          </Fragment>
        ))}
      </div>
      {activeBlank?.options && !locked && (
        <div className="chips" style={{ marginTop: 16 }}>
          {shuffled(activeBlank.options, seed + active).map((opt) => (
            <button key={opt} className={`chip ${values[active] === opt ? 'selected' : ''}`} onClick={() => pick(opt)}>
              {opt}
            </button>
          ))}
        </div>
      )}
    </>
  );
}
