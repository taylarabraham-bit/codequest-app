import { useEffect, useRef } from 'react';
import { lessonId, unitId, writtenUnits } from '../content';
import { trackMeta } from '../content/roadmap';
import { MOCK_NAMES, tourId, toursFor } from '../content/tours';
import { bossUnlocked, EXAM_PASS, EXAM_SIZE, lessonUnlocked, trackComplete, unitCleared, unitUnlocked, type SaveState } from '../engine/progress';
import type { TrackId } from '../engine/types';
import { TopStats } from './Home';

export type MapAction =
  | { type: 'lesson'; unit: number; lesson: number }
  | { type: 'boss'; unit: number }
  | { type: 'skip'; unit: number }
  | { type: 'exam' }
  | { type: 'certificate' };

const OFFSETS = [0, 46, 70, 46, 0, -46];

export function TrackMap({
  track,
  state,
  onBack,
  onAction,
  onTour,
}: {
  track: TrackId;
  state: SaveState;
  onBack: () => void;
  onAction: (a: MapAction) => void;
  /** Desktop edition: start a tool tour. */
  onTour?: (tour: number) => void;
}) {
  const meta = trackMeta(track);
  const units = writtenUnits(track);
  const current = useRef<HTMLDivElement>(null);

  useEffect(() => {
    current.current?.scrollIntoView({ block: 'center' });
  }, []);

  // The first unlocked, unfinished node gets the "start" marker.
  let markerPlaced = false;

  return (
    <div className="screen" style={{ ['--c' as string]: meta.color }}>
      <div className="topbar">
        <button className="icon-btn" onClick={onBack} aria-label="Back">
          ←
        </button>
        <h1 style={{ fontSize: 20 }}>{meta.name}</h1>
        <div className="spacer" />
        <TopStats state={state} />
      </div>
      <div className="scroll">
        {onTour && (
          <section className="tours" aria-labelledby="tours-head">
            <h2 id="tours-head" className="kind-label">
              🧭 Tool tours: practise in the real apps
            </h2>
            <div className="tour-list">
              {toursFor(track).map((t, i) => (
                <button key={i} className="card tour-card" onClick={() => onTour(i)}>
                  <span className="tour-tool">{MOCK_NAMES[t.screen]}</span>
                  <b>
                    {t.title} {tourId(track, i) in state.tours && <span aria-label="done">✓</span>}
                  </b>
                  <span className="muted small">{t.blurb}</span>
                </button>
              ))}
            </div>
          </section>
        )}
        {meta.roadmap.map((title, u) => {
          const unit = units[u];
          if (!unit) {
            return (
              <div key={u} className="soon">
                <span>🔒</span>
                <div>
                  <b>
                    Unit {u + 1}: {title}
                  </b>
                  <div className="small">Coming soon</div>
                </div>
              </div>
            );
          }
          const open = unitUnlocked(state, track, u);
          const cleared = unitCleared(state, unitId(track, u));
          return (
            <section key={u} className="unit">
              <div className={`unit-head ${open ? '' : 'locked'}`}>
                <div className="small muted" style={{ fontWeight: 700 }}>
                  UNIT {u + 1} {cleared && (state.units[unitId(track, u)] === 'skipped' ? '· SKIPPED ✓' : '· COMPLETE ✓')}
                </div>
                <h2 className="unit-title">{unit.title}</h2>
                <div className="small muted">{unit.blurb}</div>
                {!open && (
                  <button className="btn secondary" style={{ marginTop: 12, padding: 10, fontSize: 15 }} onClick={() => onAction({ type: 'skip', unit: u })}>
                    🚀 Test out to jump here
                  </button>
                )}
              </div>
              <div className="path">
                {unit.lessons.map((lesson, l) => {
                  const unlocked = lessonUnlocked(state, track, u, l);
                  const done = lessonId(track, u, l) in state.lessons || cleared;
                  const isCurrent = unlocked && !done && !markerPlaced;
                  if (isCurrent) markerPlaced = true;
                  return (
                    <div key={l} className="node-wrap" style={{ transform: `translateX(${OFFSETS[l % OFFSETS.length]}px)` }} ref={isCurrent ? current : undefined}>
                      {isCurrent && <div className="pill pop" style={{ marginBottom: 8, color: meta.color }}>START</div>}
                      <button
                        className={`node ${done ? 'done' : unlocked ? '' : 'locked'}`}
                        disabled={!unlocked}
                        onClick={() => onAction({ type: 'lesson', unit: u, lesson: l })}
                        aria-label={`Lesson ${l + 1}: ${lesson.title}${done ? ", done" : unlocked ? "" : ", locked"}`}
                      >
                        {done ? '★' : unlocked ? l + 1 : '🔒'}
                      </button>
                      <div className="node-label">{lesson.title}</div>
                    </div>
                  );
                })}
                {(() => {
                  const unlocked = bossUnlocked(state, track, u, unit.lessons.length);
                  const isCurrent = unlocked && !cleared && !markerPlaced;
                  if (isCurrent) markerPlaced = true;
                  return (
                    <div className="node-wrap" ref={isCurrent ? current : undefined}>
                      <button
                        className={`node boss ${cleared ? 'done' : unlocked ? '' : 'locked'}`}
                        disabled={!unlocked}
                        onClick={() => onAction({ type: 'boss', unit: u })}
                        aria-label="Unit boss"
                      >
                        {cleared ? '🏆' : '👾'}
                      </button>
                      <div className="node-label">
                        <b>Boss</b> · {unit.boss.length} mixed challenges
                      </div>
                    </div>
                  );
                })()}
              </div>
            </section>
          );
        })}
        <FinalExam track={track} state={state} onAction={onAction} color={meta.color} unitCount={meta.roadmap.length} />
      </div>
    </div>
  );
}

function FinalExam({
  track,
  state,
  onAction,
  color,
  unitCount,
}: {
  track: TrackId;
  state: SaveState;
  onAction: (a: MapAction) => void;
  color: string;
  unitCount: number;
}) {
  const open = writtenUnits(track).filter(Boolean).length === unitCount && trackComplete(state, track, unitCount);
  const cert = state.certificates[track];
  return (
    <section className="unit exam">
      <div className={`unit-head ${open ? '' : 'locked'}`}>
        <div className="small muted" style={{ fontWeight: 700 }}>
          FINAL EXAM {cert && '· PASSED ✓'}
        </div>
        <h2 className="unit-title">{cert ? `Certified · ${cert.score}/${cert.total}` : 'Earn your certificate'}</h2>
        <div className="small muted">
          {open
            ? `${EXAM_SIZE} questions from the whole track, one try each, no hints. Get ${EXAM_PASS} right to pass.`
            : 'Clear every unit to unlock the final exam.'}
        </div>
        {cert && (
          <button className="btn secondary" style={{ marginTop: 12, padding: 10, fontSize: 15 }} onClick={() => onAction({ type: 'certificate' })}>
            🎓 View certificate
          </button>
        )}
      </div>
      <div className="path">
        <div className="node-wrap">
          <button
            className={`node boss ${cert ? 'done' : open ? '' : 'locked'}`}
            style={{ ['--c' as string]: color }}
            disabled={!open}
            onClick={() => onAction({ type: 'exam' })}
            aria-label={cert ? 'Retake final exam' : 'Final exam'}
          >
            {open ? '🎓' : '🔒'}
          </button>
          <div className="node-label">
            <b>{cert ? 'Retake exam' : 'Final exam'}</b>
          </div>
        </div>
      </div>
    </section>
  );
}
