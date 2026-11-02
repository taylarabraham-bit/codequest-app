import { writtenUnits } from '../content';
import { trackMeta, TRACKS } from '../content/roadmap';
import { dueReviews, levelFor, liveStreak, unitProgress, xpToday, type SaveState } from '../engine/progress';
import type { TrackId } from '../engine/types';

export function TopStats({ state }: { state: SaveState }) {
  const lv = levelFor(state.xp);
  const streak = liveStreak(state);
  return (
    <div className="row" style={{ gap: 8 }}>
      <span className="pill" title="Day streak" style={{ color: streak ? '#f0883e' : undefined }}>
        🔥 {streak}
      </span>
      <span className="pill" title="Experience" style={{ color: 'var(--xp)' }}>
        ⚡ {state.xp}
      </span>
      <span className="pill" title="Level">
        Lv {lv.level}
      </span>
    </div>
  );
}

export function Home({
  state,
  onTrack,
  onReview,
  onProfile,
  next,
  onContinue,
}: {
  state: SaveState;
  onTrack: (t: TrackId) => void;
  onReview: () => void;
  onProfile: () => void;
  /** What "Continue" would start, if there is a last track with work left. */
  next: { track: TrackId; label: string } | null;
  onContinue: () => void;
}) {
  const lv = levelFor(state.xp);
  const due = dueReviews(state).length;
  const goal = state.settings.dailyGoal;
  const today = xpToday(state);

  return (
    <div className="screen">
      <div className="topbar">
        <h1 style={{ fontSize: 22, fontFamily: 'var(--mono)' }}>
          <span style={{ color: 'var(--accent)' }}>{'>'}</span>CodeQuest
        </h1>
        <div className="spacer" />
        <button className="icon-btn" onClick={onProfile} aria-label="Profile">
          👤
        </button>
      </div>
      <div className="scroll">
        <div className="card" style={{ marginBottom: 18 }}>
          <div className="row" style={{ justifyContent: 'space-between', marginBottom: 10 }}>
            <TopStats state={state} />
          </div>
          <div className="row small muted" style={{ marginBottom: 6 }}>
            <span>Level {lv.level}</span>
            <span className="spacer" />
            <span>
              {lv.into} / {lv.needed} XP
            </span>
          </div>
          <div className="bar">
            <i style={{ width: `${(lv.into / lv.needed) * 100}%`, background: 'var(--xp)' }} />
          </div>
          {goal > 0 && (
            <>
              <div className="row small muted" style={{ margin: '12px 0 6px' }}>
                <span>{today >= goal ? '✅ Daily goal reached' : '🎯 Daily goal'}</span>
                <span className="spacer" />
                <span>
                  {Math.min(today, goal)} / {goal} XP
                </span>
              </div>
              <div className="bar" role="progressbar" aria-label="Daily goal" aria-valuemin={0} aria-valuemax={goal} aria-valuenow={Math.min(today, goal)}>
                <i style={{ width: `${Math.min(1, today / goal) * 100}%` }} />
              </div>
            </>
          )}
        </div>

        {next && (
          <button className="card track-card continue" style={{ ['--c' as string]: trackMeta(next.track).color }} onClick={onContinue}>
            <div className="track-icon">▶</div>
            <div style={{ flex: 1 }}>
              <div className="small muted">CONTINUE · {trackMeta(next.track).name.toUpperCase()}</div>
              <h2>{next.label}</h2>
            </div>
          </button>
        )}

        {due > 0 && (
          <button className="card track-card" style={{ ['--c' as string]: 'var(--warn)' }} onClick={onReview}>
            <div className="track-icon">🔁</div>
            <div>
              <h2>Review time</h2>
              <div className="muted small">
                {due} exercise{due === 1 ? '' : 's'} to brush up on
              </div>
            </div>
          </button>
        )}

        <div className="kind-label" style={{ margin: '6px 0 10px' }}>
          Tracks
        </div>
        <div className="track-list">
          {TRACKS.map((t) => {
            const units = writtenUnits(t.id);
            const done = units.reduce((n, u, i) => n + unitProgress(state, t.id, i, u.lessons.length), 0);
            const pct = Math.round((done / t.roadmap.length) * 100);
            return (
              <button key={t.id} className="card track-card" style={{ ['--c' as string]: t.color }} onClick={() => onTrack(t.id)}>
                <div className="track-icon">{t.icon}</div>
                <div style={{ flex: 1 }}>
                  <h2>{t.name}</h2>
                  <div className="muted small" style={{ marginBottom: 8 }}>
                    {t.tagline} · {t.roadmap.length} units
                  </div>
                  <div className="bar" style={{ height: 6 }}>
                    <i style={{ width: `${pct}%`, background: t.color }} />
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
