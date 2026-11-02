import { useState, type PointerEvent } from 'react';

const KEY = 'codequest.panes';
const MIN = 240;

function load(): [number, number] {
  try {
    const v = JSON.parse(localStorage.getItem(KEY) ?? 'null') as unknown;
    if (Array.isArray(v) && v.length === 2 && v.every((n) => typeof n === 'number')) return [v[0], v[1]];
  } catch {
    // Use the defaults.
  }
  return window.innerWidth < 1300 ? [290, 320] : [340, 400];
}

/** Widths of the side panes (Instructions, Output); the code pane takes the
 * rest. Dragging a splitter resizes; sizes are remembered on this computer. */
export function usePaneSizes() {
  const [sizes, setSizes] = useState(load);

  const splitter = (which: 0 | 1) => ({
    className: 'splitter',
    role: 'separator',
    'aria-orientation': 'vertical' as const,
    'aria-label': which === 0 ? 'Resize instructions' : 'Resize output',
    onPointerDown: (e: PointerEvent<HTMLDivElement>) => {
      e.preventDefault();
      const startX = e.clientX;
      const start = sizes;
      const el = e.currentTarget;
      el.setPointerCapture(e.pointerId);
      let latest = start;
      const move = (ev: globalThis.PointerEvent) => {
        const dx = ev.clientX - startX;
        const max = window.innerWidth - 2 * MIN;
        const w = Math.min(max, Math.max(MIN, which === 0 ? start[0] + dx : start[1] - dx));
        latest = which === 0 ? [w, start[1]] : [start[0], w];
        setSizes(latest);
      };
      const up = () => {
        el.removeEventListener('pointermove', move);
        el.removeEventListener('pointerup', up);
        try {
          localStorage.setItem(KEY, JSON.stringify(latest));
        } catch {
          // Not saved; fine.
        }
      };
      el.addEventListener('pointermove', move);
      el.addEventListener('pointerup', up);
    },
  });

  return { columns: `${sizes[0]}px 6px minmax(${MIN}px, 1fr) 6px ${sizes[1]}px`, splitter };
}
