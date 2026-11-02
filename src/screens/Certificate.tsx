import { trackMeta } from '../content/roadmap';
import type { SaveState } from '../engine/progress';
import type { TrackId } from '../engine/types';

const longDate = (day: string) => {
  const [y, m, d] = day.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
};

export function Certificate({ track, state, onBack }: { track: TrackId; state: SaveState; onBack: () => void }) {
  const meta = trackMeta(track);
  const cert = state.certificates[track];
  return (
    <div className="screen" style={{ ['--c' as string]: meta.color }}>
      <div className="topbar">
        <button className="icon-btn" onClick={onBack} aria-label="Back">
          ←
        </button>
        <h2 style={{ fontSize: 20 }}>Certificate</h2>
      </div>
      <div className="scroll center" style={{ justifyContent: 'center' }}>
        {cert ? (
          <div className="certificate pop" role="img" aria-label={`${meta.name} certificate, ${cert.score} out of ${cert.total}`}>
            <div className="small muted" style={{ letterSpacing: 2, fontWeight: 700 }}>
              CODEQUEST CERTIFICATE
            </div>
            <div className="track-icon cert-icon">{meta.icon}</div>
            <h1 style={{ fontSize: 30 }}>{meta.name}</h1>
            <p className="muted">
              Completed all {meta.roadmap.length} units and passed the final exam
            </p>
            <div className="stat-row" style={{ width: '100%' }}>
              <div className="stat">
                <b style={{ color: 'var(--c)' }}>
                  {cert.score}/{cert.total}
                </b>
                <span>Best score</span>
              </div>
              <div className="stat">
                <b style={{ fontSize: 16 }}>{longDate(cert.day)}</b>
                <span>Earned</span>
              </div>
            </div>
            <p className="small muted" style={{ marginTop: 6 }}>
              {meta.tagline}
            </p>
          </div>
        ) : (
          <p className="muted">Pass the {meta.name} final exam to earn this certificate.</p>
        )}
      </div>
    </div>
  );
}
