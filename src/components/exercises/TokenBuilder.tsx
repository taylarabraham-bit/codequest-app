import { useMemo, useState } from 'react';
import { checkBuild, joinTokens } from '../../engine/check';
import { shuffled } from '../../engine/shuffle';
import type { BuildExercise } from '../../engine/types';
import type { WidgetProps } from './common';

export function TokenBuilder({ ex, track, seed, locked, onChange, onTap }: WidgetProps<BuildExercise>) {
  const bank = useMemo(() => shuffled([...ex.answer, ...ex.distractors], seed), [ex, seed]);
  /** Indexes into `bank`, in placed order. */
  const [placed, setPlaced] = useState<number[]>([]);

  const update = (next: number[]) => {
    setPlaced(next);
    const toks = next.map((i) => bank[i]);
    onChange({ ready: next.length > 0, correct: checkBuild(toks, ex), code: joinTokens(toks, track) });
  };

  return (
    <>
      <div className="dropzone" data-empty="Tap tokens below to build the code">
        {placed.map((bi, i) => (
          <button
            key={bi}
            className="chip pop"
            onClick={() => {
              if (locked) return;
              onTap();
              update(placed.filter((_, j) => j !== i));
            }}
          >
            {bank[bi]}
          </button>
        ))}
      </div>
      <div className="chips">
        {bank.map((tok, bi) => (
          <button
            key={bi}
            className={`chip ${placed.includes(bi) ? 'used' : ''}`}
            disabled={locked}
            onClick={() => {
              if (locked || placed.includes(bi)) return;
              onTap();
              update([...placed, bi]);
            }}
          >
            {tok}
          </button>
        ))}
      </div>
    </>
  );
}
