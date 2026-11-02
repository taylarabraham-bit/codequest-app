import type { Badge } from '../engine/progress';

export interface ResultsInfo {
  title: string;
  emoji: string;
  subtitle: string;
  xpGained: number;
  accuracy: number; // 0..1
  streak: number;
  levelUp: number | null;
  badges: Badge[];
}

export function Results({ info, onContinue }: { info: ResultsInfo; onContinue: () => void }) {
  return (
    <div className="screen">
      <div className="scroll center" style={{ justifyContent: 'center' }}>
        <div className="big-emoji pop">{info.emoji}</div>
        <h1 style={{ fontSize: 28 }}>{info.title}</h1>
        <p className="muted">{info.subtitle}</p>
        <div className="stat-row">
          <div className="stat pop" style={{ borderColor: 'var(--xp)' }}>
            <b style={{ color: 'var(--xp)' }}>+{info.xpGained}</b>
            <span>XP</span>
          </div>
          <div className="stat pop" style={{ borderColor: 'var(--accent)' }}>
            <b style={{ color: 'var(--accent)' }}>{Math.round(info.accuracy * 100)}%</b>
            <span>Accuracy</span>
          </div>
          <div className="stat pop" style={{ borderColor: '#f0883e' }}>
            <b style={{ color: '#f0883e' }}>🔥 {info.streak}</b>
            <span>Streak</span>
          </div>
        </div>
        {info.levelUp && (
          <div className="card pop" style={{ width: '100%', marginBottom: 12, borderColor: 'var(--xp)' }}>
            ⬆️ <b>Level up!</b> You&apos;re now level {info.levelUp}.
          </div>
        )}
        {info.badges.map((b) => (
          <div key={b.id} className="card pop row" style={{ width: '100%', marginBottom: 12, textAlign: 'left' }}>
            <span style={{ fontSize: 34 }}>{b.icon}</span>
            <div>
              <div className="small muted">NEW BADGE</div>
              <b>{b.name}</b>
              <div className="small muted">{b.desc}</div>
            </div>
          </div>
        ))}
      </div>
      <div className="actionbar">
        <button className="btn" onClick={onContinue}>
          Continue
        </button>
      </div>
    </div>
  );
}
