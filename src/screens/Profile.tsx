import { DESKTOP } from '../edition';
import { TRACKS } from '../content/roadmap';
import { BADGES, DAILY_GOALS, levelFor, liveStreak, type SaveState, type Settings } from '../engine/progress';
import type { TrackId } from '../engine/types';
import { goalLabel } from './Onboarding';

export function Profile({
  state,
  onBack,
  onSettings,
  onCertificate,
  onReset,
}: {
  state: SaveState;
  onBack: () => void;
  onSettings: (s: Settings) => void;
  onCertificate: (track: TrackId) => void;
  onReset: () => void;
}) {
  const lv = levelFor(state.xp);
  type Flag = { [K in keyof Settings]: Settings[K] extends boolean ? K : never }[keyof Settings];
  const toggle = (key: Flag) => onSettings({ ...state.settings, [key]: !state.settings[key] });
  const flag = (key: Flag, label: string) => (
    <button className="toggle" style={{ width: '100%' }} role="switch" aria-checked={state.settings[key]} onClick={() => toggle(key)}>
      <span>{label}</span>
      <span className={`switch ${state.settings[key] ? 'on' : ''}`} />
    </button>
  );

  return (
    <div className="screen">
      <div className="topbar">
        <button className="icon-btn" onClick={onBack} aria-label="Back">
          ←
        </button>
        <h1 style={{ fontSize: 20 }}>Profile</h1>
      </div>
      <div className="scroll">
        <div className="stat-row" style={{ marginTop: 0 }}>
          <div className="stat center">
            <b>{lv.level}</b>
            <span>Level</span>
          </div>
          <div className="stat center">
            <b>{state.xp}</b>
            <span>Total XP</span>
          </div>
          <div className="stat center">
            <b>{liveStreak(state)}</b>
            <span>Streak (best {state.streak.best})</span>
          </div>
        </div>
        <div className="stat-row" style={{ marginTop: 0 }}>
          <div className="stat center">
            <b>{Object.keys(state.lessons).length}</b>
            <span>Lessons</span>
          </div>
          <div className="stat center">
            <b>{state.stats.correct}</b>
            <span>Correct</span>
          </div>
          <div className="stat center">
            <b>{state.stats.perfectLessons}</b>
            <span>Flawless</span>
          </div>
        </div>

        {TRACKS.some((t) => state.certificates[t.id]) && (
          <>
            <div className="kind-label" style={{ margin: '8px 0 10px' }}>
              Certificates
            </div>
            {TRACKS.filter((t) => state.certificates[t.id]).map((t) => (
              <button
                key={t.id}
                className="card track-card"
                style={{ ['--c' as string]: t.color }}
                onClick={() => onCertificate(t.id)}
              >
                <div className="track-icon">🎓</div>
                <div style={{ flex: 1 }}>
                  <h2>{t.name}</h2>
                  <div className="muted small">
                    Best score {state.certificates[t.id]!.score}/{state.certificates[t.id]!.total}
                  </div>
                </div>
              </button>
            ))}
          </>
        )}

        <div className="kind-label" style={{ margin: '8px 0 10px' }}>
          Badges · {state.badges.length}/{BADGES.length}
        </div>
        <div className="badge-grid">
          {BADGES.map((b) => {
            const has = state.badges.includes(b.id);
            return (
              <div key={b.id} className={`badge ${has ? '' : 'off'}`}>
                <div className="e">{b.icon}</div>
                <b>{b.name}</b>
                <span>{b.desc}</span>
              </div>
            );
          })}
        </div>

        <div className="kind-label" style={{ margin: '24px 0 4px' }}>
          Settings
        </div>
        <div className="small muted" style={{ margin: '8px 0 6px' }}>
          Daily goal
        </div>
        <div className="choice-row" role="radiogroup" aria-label="Daily goal">
          {DAILY_GOALS.map((g) => (
            <button
              key={g}
              role="radio"
              aria-checked={state.settings.dailyGoal === g}
              className={`choice ${state.settings.dailyGoal === g ? 'on' : ''}`}
              onClick={() => onSettings({ ...state.settings, dailyGoal: g })}
            >
              {goalLabel(g)}
            </button>
          ))}
        </div>
        {flag('sound', 'Sound effects')}
        {!DESKTOP && flag('haptics', 'Vibration')}
        {flag('reducedMotion', 'Reduce motion')}
        {flag('largeCode', 'Larger code text')}
        <button
          className="btn secondary"
          style={{ marginTop: 28 }}
          onClick={() => {
            if (window.confirm('Erase ALL progress on this device? This cannot be undone.')) onReset();
          }}
        >
          Reset progress
        </button>
        <p className="muted small center" style={{ marginTop: 18 }}>
          Progress is saved only on this {DESKTOP ? 'computer' : 'phone'}.
        </p>
      </div>
    </div>
  );
}
