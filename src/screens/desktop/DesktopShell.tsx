import type { ReactNode } from 'react';
import { writtenUnits } from '../../content';
import { TRACKS } from '../../content/roadmap';
import { unitProgress, type SaveState } from '../../engine/progress';
import type { TrackId } from '../../engine/types';

export type NavTarget = { name: 'home' } | { name: 'track'; track: TrackId } | { name: 'profile' };

/** Desktop frame for every screen except a running lesson: a sidebar with the
 * tracks on the left, the screen on the right. */
export function DesktopShell({
  state,
  current,
  onNav,
  children,
}: {
  state: SaveState;
  current: NavTarget | null;
  onNav: (t: NavTarget) => void;
  children: ReactNode;
}) {
  const is = (t: NavTarget) => current?.name === t.name && (t.name !== 'track' || (current.name === 'track' && current.track === t.track));
  return (
    <div className="desk-shell">
      <nav className="desk-nav" aria-label="Main">
        <div className="desk-brand">
          <span style={{ color: 'var(--accent)' }}>{'>'}</span>CodeQuest <span className="desk-edition">Desktop</span>
        </div>
        <button className={`desk-link ${is({ name: 'home' }) ? 'on' : ''}`} onClick={() => onNav({ name: 'home' })}>
          <span aria-hidden="true">⌂</span> Home
        </button>
        <div className="kind-label desk-nav-head">Tracks</div>
        {TRACKS.map((t) => {
          const done = writtenUnits(t.id).reduce((n, u, i) => n + unitProgress(state, t.id, i, u.lessons.length), 0);
          const pct = Math.round((done / t.roadmap.length) * 100);
          return (
            <button
              key={t.id}
              className={`desk-link ${is({ name: 'track', track: t.id }) ? 'on' : ''}`}
              style={{ ['--c' as string]: t.color }}
              onClick={() => onNav({ name: 'track', track: t.id })}
            >
              <span className="desk-dot" aria-hidden="true" />
              {t.name}
              <span className="spacer" />
              <span className="muted small">{pct}%</span>
            </button>
          );
        })}
        <div className="spacer" />
        <button className={`desk-link ${is({ name: 'profile' }) ? 'on' : ''}`} onClick={() => onNav({ name: 'profile' })}>
          <span aria-hidden="true">👤</span> Profile &amp; settings
        </button>
      </nav>
      <div className="desk-main">{children}</div>
    </div>
  );
}
