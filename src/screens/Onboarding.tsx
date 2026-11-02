import { useState } from 'react';
import { DESKTOP } from '../edition';
import { TRACKS } from '../content/roadmap';
import { DAILY_GOALS } from '../engine/progress';
import type { TrackId } from '../engine/types';

const STEPS = [
  {
    emoji: '👋',
    title: 'Welcome to CodeQuest',
    body: 'Learn to code in two-minute bites. Seven tracks take you from your first tag to shipping apps, containers and local AI.',
  },
  {
    emoji: '🧩',
    title: 'How a lesson works',
    body: DESKTOP
      ? 'Each lesson is three panes: the concept and task on the left, a code editor in the middle, and the output on the right. You type every answer, then press Ctrl+Enter to check. Tool tours let you practise in mock versions of VS Code, Visual Studio, DevTools, Docker Desktop and the terminal.'
      : 'Read one short concept card, then solve 7 hands-on exercises: fill blanks, build code from tokens, order lines, fix bugs and type short lines.',
  },
  {
    emoji: '🏆',
    title: 'Level up as you go',
    body: 'Miss one and you get a hint; miss twice and it joins your review queue. Beat a boss to finish each unit, then pass the final exam to earn a certificate.',
  },
];

export const goalLabel = (xp: number) => (xp === 0 ? 'Off' : xp <= 30 ? `Casual · ${xp} XP` : xp <= 60 ? `Regular · ${xp} XP` : `Serious · ${xp} XP`);

export function Onboarding({ onDone }: { onDone: (track: TrackId | null, dailyGoal: number) => void }) {
  const [step, setStep] = useState(0);
  const [goal, setGoal] = useState(60);
  const last = step === STEPS.length;

  return (
    <div className="screen">
      <div className="topbar">
        <div className="dots" aria-hidden="true">
          {[...STEPS, null].map((_, i) => (
            <i key={i} className={i === step ? 'on' : ''} />
          ))}
        </div>
        <div className="spacer" />
        {!last && (
          <button className="icon-btn" style={{ width: 'auto', padding: '0 10px', fontSize: 15 }} onClick={() => setStep(STEPS.length)}>
            Skip
          </button>
        )}
      </div>
      <div className="scroll">
        {!last ? (
          <div key={step} className="center pop" style={{ paddingTop: 40 }}>
            <div className="big-emoji">{STEPS[step].emoji}</div>
            <h1 style={{ fontSize: 28, marginBottom: 12 }}>{STEPS[step].title}</h1>
            <p className="muted" style={{ fontSize: 17 }}>
              {STEPS[step].body}
            </p>
          </div>
        ) : (
          <div className="pop">
            <h1 style={{ fontSize: 26, margin: '8px 0 6px' }}>Set a daily goal</h1>
            <p className="muted small">A lesson is worth up to 100 XP. You can change this later in Profile.</p>
            <div className="choice-row" role="radiogroup" aria-label="Daily goal">
              {DAILY_GOALS.filter((g) => g > 0).map((g) => (
                <button key={g} role="radio" aria-checked={goal === g} className={`choice ${goal === g ? 'on' : ''}`} onClick={() => setGoal(g)}>
                  {goalLabel(g)}
                </button>
              ))}
            </div>
            <h2 style={{ fontSize: 20, margin: '22px 0 10px' }}>Where do you want to start?</h2>
            {TRACKS.map((t) => (
              <button key={t.id} className="card track-card" style={{ ['--c' as string]: t.color }} onClick={() => onDone(t.id, goal)}>
                <div className="track-icon">{t.icon}</div>
                <div style={{ flex: 1 }}>
                  <h3>{t.name}</h3>
                  <div className="muted small">{t.tagline}</div>
                </div>
              </button>
            ))}
            <button className="btn secondary" style={{ marginTop: 6 }} onClick={() => onDone(null, goal)}>
              I&apos;ll look around first
            </button>
          </div>
        )}
      </div>
      {!last && (
        <div className="actionbar">
          <button className="btn" onClick={() => setStep(step + 1)}>
            {step === STEPS.length - 1 ? 'Get started' : 'Next'}
          </button>
        </div>
      )}
    </div>
  );
}
