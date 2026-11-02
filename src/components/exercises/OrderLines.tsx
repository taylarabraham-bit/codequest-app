import { useMemo, useState } from 'react';
import { checkOrder } from '../../engine/check';
import { shuffled } from '../../engine/shuffle';
import type { OrderExercise } from '../../engine/types';
import { Highlighted } from '../CodeView';
import type { WidgetProps } from './common';

export function OrderLines({ ex, track, seed, locked, onChange, onTap }: WidgetProps<OrderExercise>) {
  const order = useMemo(() => shuffled(ex.lines.map((_, i) => i), seed), [ex, seed]);
  const [picked, setPicked] = useState<number[]>([]);

  const update = (next: number[]) => {
    setPicked(next);
    onChange({
      ready: next.length === ex.lines.length,
      correct: checkOrder(next, ex.lines),
      code: next.map((i) => ex.lines[i]).join('\n'),
    });
  };

  return (
    <>
      <div className="dropzone" style={{ display: 'block' }} data-empty="Tap the lines in the right order">
        {picked.map((li, n) => (
          <button
            key={li}
            className="line-btn placed pop"
            onClick={() => {
              if (locked) return;
              onTap();
              update(picked.filter((_, j) => j !== n));
            }}
          >
            <b>{n + 1}</b>
            <span>
              <Highlighted code={ex.lines[li]} track={track} />
            </span>
          </button>
        ))}
      </div>
      {order
        .filter((li) => !picked.includes(li))
        .map((li) => (
          <button
            key={li}
            className="line-btn"
            disabled={locked}
            onClick={() => {
              if (locked) return;
              onTap();
              update([...picked, li]);
            }}
          >
            <Highlighted code={ex.lines[li]} track={track} />
          </button>
        ))}
    </>
  );
}
