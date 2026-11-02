import { useEffect, useMemo, useRef, useState } from 'react';
import { checkOrder } from '../../../engine/check';
import { shuffled } from '../../../engine/shuffle';
import type { OrderExercise } from '../../../engine/types';
import { Highlighted } from '../../CodeView';
import type { DesktopWidgetProps } from './common';

/** Reorder lines with the keyboard (Alt+↑/↓ moves the focused line) or by
 * dragging. */
export function DOrder({ ex, track, seed, locked, onChange, onTap }: DesktopWidgetProps<OrderExercise>) {
  const start = useMemo(() => {
    const order = shuffled(ex.lines.map((_, i) => i), seed);
    // Repeated lines make an already-solved shuffle likely; rotate it once.
    return checkOrder(order, ex.lines) ? [...order.slice(1), order[0]] : order;
  }, [ex, seed]);
  const [order, setOrder] = useState(start);
  // Key repeat can fire faster than React re-renders, so moves read the
  // latest order from a ref rather than from this render's closure.
  const latest = useRef(start);
  const [drag, setDrag] = useState(-1);
  /** Row elements by position, and by line (which stays with its row). */
  const rows = useRef<(HTMLLIElement | null)[]>([]);
  const byLine = useRef<(HTMLLIElement | null)[]>([]);

  const report = (order: number[]) =>
    onChange({ ready: true, correct: checkOrder(order, ex.lines), code: order.map((i) => ex.lines[i]).join('\n') });

  // Every line is already placed, so Check works from the start.
  useEffect(() => {
    report(start);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /** Move line `li` (an index into ex.lines) by `by` places, or to `to`. */
  const move = (li: number, by: number, to?: number, focus = true) => {
    const cur = latest.current;
    const from = cur.indexOf(li);
    const dest = to ?? from + by;
    if (locked || from < 0 || dest < 0 || dest >= cur.length || from === dest) return;
    onTap();
    const next = [...cur];
    next.splice(from, 1);
    next.splice(dest, 0, li);
    latest.current = next;
    setOrder(next);
    report(next);
    // Keep focus on the moved line if re-rendering dropped it, but never steal
    // it back from another line the learner has moved on to.
    if (focus)
      requestAnimationFrame(() => {
        const active = document.activeElement;
        if (!active || active === document.body) byLine.current[li]?.focus();
      });
  };

  return (
    <>
      <p className="ed-tip">Click a line, then press Alt+↑ / Alt+↓ to move it (or drag it). Ctrl+Enter checks.</p>
      <ol className="order-list" aria-label="Lines to put in order">
        {order.map((li, n) => (
          <li
            key={li}
            ref={(el) => {
              rows.current[n] = el;
              byLine.current[li] = el;
            }}
            tabIndex={0}
            draggable={!locked}
            className={`order-row ${drag === li ? 'dragging' : ''}`}
            aria-label={`Line ${n + 1}: ${ex.lines[li]}`}
            onDragStart={() => setDrag(li)}
            onDragEnd={() => setDrag(-1)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => {
              if (drag >= 0) move(drag, 0, n, false);
              setDrag(-1);
            }}
            onKeyDown={(e) => {
              if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
                e.preventDefault();
                const by = e.key === 'ArrowUp' ? -1 : 1;
                if (e.altKey) move(li, by);
                else rows.current[n + by]?.focus();
              }
            }}
          >
            <span className="ed-num">{n + 1}</span>
            <code className="order-code">
              <Highlighted code={ex.lines[li]} track={track} />
            </code>
            {!locked && (
              <span className="order-btns">
                <button tabIndex={-1} aria-label="Move up" disabled={n === 0} onClick={() => move(li, -1)}>
                  ▲
                </button>
                <button tabIndex={-1} aria-label="Move down" disabled={n === order.length - 1} onClick={() => move(li, 1)}>
                  ▼
                </button>
              </span>
            )}
          </li>
        ))}
      </ol>
    </>
  );
}
