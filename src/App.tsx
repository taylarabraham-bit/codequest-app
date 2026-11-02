import { useCallback, useEffect, useRef, useState } from 'react';
import { App as CapApp } from '@capacitor/app';
import { challengeId, exerciseId, getExercise, lessonChallenges, lessonId, unitId, writtenUnits } from './content';
import { trackMeta } from './content/roadmap';
import { tourId, toursFor } from './content/tours';
import { DESKTOP } from './edition';
import {
  completeBoss,
  completeExam,
  completeLesson,
  completeReview,
  completeSkipTest,
  completeTour,
  dueReviews,
  EXAM_PASS,
  EXAM_SIZE,
  levelFor,
  liveStreak,
  SKIP_PASS,
  SKIP_SIZE,
  unitCleared,
  unitUnlocked,
  type Outcome,
  type SaveState,
  type SessionResult,
} from './engine/progress';
import { sample, shuffled } from './engine/shuffle';
import { loadState, resetState, saveState } from './engine/storage';
import type { Lesson, TrackId } from './engine/types';
import { Certificate } from './screens/Certificate';
import { Home } from './screens/Home';
import { Onboarding } from './screens/Onboarding';
import { Profile } from './screens/Profile';
import { Results, type ResultsInfo } from './screens/Results';
import { Session, type SessionItem, type SessionMode, type SessionResultItem } from './screens/Session';
import { TrackMap, type MapAction } from './screens/TrackMap';
import { DesktopSession } from './screens/desktop/DesktopSession';
import { DesktopShell, type NavTarget } from './screens/desktop/DesktopShell';
import { TourSession } from './screens/desktop/TourSession';

type SessionKind =
  | { type: 'lesson'; track: TrackId; unit: number; lesson: number }
  | { type: 'boss'; track: TrackId; unit: number }
  | { type: 'skip'; track: TrackId; unit: number }
  | { type: 'exam'; track: TrackId }
  | { type: 'review' };

type Route =
  | { name: 'home' }
  | { name: 'track'; track: TrackId }
  | { name: 'profile' }
  | { name: 'certificate'; track: TrackId; back: Route }
  | {
      name: 'session';
      kind: SessionKind;
      mode: SessionMode;
      title: string;
      items: SessionItem[];
      concept?: Lesson['concept'];
      back: Route;
    }
  | { name: 'results'; info: ResultsInfo; back: Route }
  | { name: 'tour'; track: TrackId; tour: number; back: Route };

const REVIEW_MAX = 10;

/** The next thing to play in a track: the first unfinished lesson or boss in
 * the first uncleared unit, then the final exam. */
function nextStep(s: SaveState, track: TrackId): { action: MapAction; label: string } | null {
  const units = writtenUnits(track);
  for (let u = 0; u < units.length; u++) {
    const unit = units[u];
    if (!unit || !unitUnlocked(s, track, u)) return null;
    if (unitCleared(s, unitId(track, u))) continue;
    const l = unit.lessons.findIndex((_, i) => !(lessonId(track, u, i) in s.lessons));
    return l >= 0
      ? { action: { type: 'lesson', unit: u, lesson: l }, label: unit.lessons[l].title }
      : { action: { type: 'boss', unit: u }, label: `${unit.title} boss` };
  }
  const complete = units.filter(Boolean).length === trackMeta(track).roadmap.length;
  return complete && !s.certificates[track] ? { action: { type: 'exam' }, label: 'Final exam' } : null;
}

/** Final exam questions: boss exercises spread evenly over every unit. */
function examItems(track: TrackId): SessionItem[] {
  const perUnit = writtenUnits(track).map((unit, u) =>
    shuffled(
      unit.boss.map((exercise, i) => ({ id: exerciseId(track, u, 'boss', i), track, exercise })),
      Date.now() + u,
    ),
  );
  const picked: SessionItem[] = [];
  for (let round = 0; picked.length < EXAM_SIZE && perUnit.some((q) => q.length > round); round++)
    for (const q of perUnit) if (q[round] && picked.length < EXAM_SIZE) picked.push(q[round]);
  return sample(picked, picked.length);
}

export default function App() {
  const [state, setState] = useState<SaveState>(loadState);
  const [route, setRoute] = useState<Route>({ name: 'home' });

  useEffect(() => saveState(state), [state]);

  const { reducedMotion, largeCode } = state.settings;
  useEffect(() => {
    document.documentElement.classList.toggle('reduce-motion', reducedMotion);
    document.documentElement.classList.toggle('large-code', largeCode);
  }, [reducedMotion, largeCode]);

  // Android hardware back: step back a screen instead of closing the app.
  const routeRef = useRef(route);
  routeRef.current = route;
  useEffect(() => {
    if (DESKTOP) return;
    const sub = CapApp.addListener('backButton', () => {
      const r = routeRef.current;
      if (r.name === 'home') void CapApp.exitApp();
      else if (r.name === 'track' || r.name === 'profile') setRoute({ name: 'home' });
      else if (r.name === 'certificate') setRoute(r.back);
      else if (r.name === 'results') setRoute(r.back);
      else if (r.name === 'session' && window.confirm('Quit this session?')) setRoute(r.back);
    });
    return () => {
      void sub.then((s) => s.remove()).catch(() => undefined);
    };
  }, []);

  // Desktop: Esc steps back a screen (lessons and tours handle Esc themselves).
  useEffect(() => {
    if (!DESKTOP) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      const r = routeRef.current;
      if (r.name === 'track' || r.name === 'profile') setRoute({ name: 'home' });
      else if (r.name === 'certificate' || r.name === 'results') setRoute(r.back);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const start = useCallback(
    (a: MapAction, track: TrackId) => {
      const units = writtenUnits(track);
      const back: Route = { name: 'track', track };
      if (a.type === 'lesson' || a.type === 'boss') setState((s) => (s.lastTrack === track ? s : { ...s, lastTrack: track }));
      if (a.type === 'certificate') {
        setRoute({ name: 'certificate', track, back });
      } else if (a.type === 'exam') {
        const ok = window.confirm(
          `Take the ${trackMeta(track).name} final exam?\n\n${EXAM_SIZE} questions from the whole track, one try each, no hints. Get ${EXAM_PASS} right to earn your certificate.`,
        );
        if (!ok) return;
        setRoute({
          name: 'session',
          kind: { type: 'exam', track },
          mode: 'exam',
          title: `${trackMeta(track).name} final exam`,
          items: examItems(track),
          back,
        });
      } else if (a.type === 'lesson') {
        const lesson = units[a.unit].lessons[a.lesson];
        setRoute({
          name: 'session',
          kind: { type: 'lesson', track, unit: a.unit, lesson: a.lesson },
          mode: 'lesson',
          title: lesson.title,
          concept: lesson.concept,
          items: [
            ...lesson.exercises.map((exercise, i) => ({ id: exerciseId(track, a.unit, a.lesson, i), track, exercise })),
            // Desktop: finish with the write-the-code challenges.
            ...(DESKTOP
              ? lessonChallenges(track, a.unit, a.lesson).map((exercise, i) => ({ id: challengeId(track, a.unit, a.lesson, i), track, exercise }))
              : []),
          ],
          back,
        });
      } else if (a.type === 'boss') {
        setRoute({
          name: 'session',
          kind: { type: 'boss', track, unit: a.unit },
          mode: 'boss',
          title: `${units[a.unit].title} — Boss`,
          items: units[a.unit].boss.map((exercise, i) => ({ id: exerciseId(track, a.unit, 'boss', i), track, exercise })),
          back,
        });
      } else {
        // Testing out of everything BEFORE unit a.unit: the hardest material
        // (lessons 4–5 and bosses) from those units.
        const pool: SessionItem[] = [];
        for (let u = 0; u < a.unit; u++) {
          units[u].lessons.forEach((l, li) => {
            if (li >= 3) l.exercises.forEach((exercise, i) => pool.push({ id: exerciseId(track, u, li, i), track, exercise }));
          });
          units[u].boss.forEach((exercise, i) => pool.push({ id: exerciseId(track, u, 'boss', i), track, exercise }));
        }
        const ok = window.confirm(
          `Skip ahead to Unit ${a.unit + 1}?\n\n${SKIP_SIZE} questions from earlier units, one try each, no hints. Get ${SKIP_PASS} right to unlock it.`,
        );
        if (!ok) return;
        setRoute({
          name: 'session',
          kind: { type: 'skip', track, unit: a.unit },
          mode: 'test',
          title: 'Skip-ahead test',
          items: sample(pool, SKIP_SIZE),
          back,
        });
      }
    },
    [],
  );

  const startReview = () => {
    const items = dueReviews(state)
      .slice(0, REVIEW_MAX)
      .map((r) => getExercise(r.id))
      .filter((x) => x !== undefined)
      // Write challenges only exist in the desktop edition.
      .filter((x) => DESKTOP || x.exercise.kind !== 'write')
      .map((x) => ({ id: x.id, track: x.track, exercise: x.exercise }));
    if (!items.length) return;
    setRoute({ name: 'session', kind: { type: 'review' }, mode: 'review', title: 'Review', items, back: { name: 'home' } });
  };

  const finishSession = (r: Extract<Route, { name: 'session' }>, results: SessionResultItem[]) => {
    const outcomes = results.map((x) => x.outcome);
    const missed = results.filter((x) => x.outcome !== 'first').map((x) => x.id);
    const accuracy = outcomes.filter((o) => o === 'first').length / Math.max(1, outcomes.length);
    const k = r.kind;
    let res: SessionResult;
    let emoji = '🎉';
    let title = 'Lesson complete!';
    let subtitle = r.title;
    let after: Route = r.back;

    if (k.type === 'lesson') {
      res = completeLesson(state, lessonId(k.track, k.unit, k.lesson), outcomes, missed);
      if (accuracy === 1) {
        emoji = '💎';
        title = 'Flawless!';
      }
    } else if (k.type === 'boss') {
      res = completeBoss(state, unitId(k.track, k.unit), outcomes, missed);
      emoji = '🏆';
      title = 'Boss defeated!';
      subtitle = `${trackMeta(k.track).name} · Unit ${k.unit + 1} complete`;
    } else if (k.type === 'skip') {
      const correct = outcomes.filter((o) => o === 'first').length;
      const sr = completeSkipTest(state, k.track, k.unit - 1, correct);
      res = sr;
      emoji = sr.passed ? '🚀' : '📘';
      title = sr.passed ? 'You tested out!' : 'Not yet';
      subtitle = sr.passed
        ? `${correct}/${outcomes.length} correct — Unit ${k.unit + 1} unlocked.`
        : `${correct}/${outcomes.length} correct. You need ${SKIP_PASS}. Keep going through the lessons!`;
    } else if (k.type === 'exam') {
      const correct = outcomes.filter((o) => o === 'first').length;
      const er = completeExam(state, k.track, correct, outcomes.length);
      res = er;
      emoji = er.passed ? '🎓' : '📘';
      title = er.passed ? 'Certified!' : 'Not yet';
      subtitle = er.passed
        ? `${correct}/${outcomes.length} on the ${trackMeta(k.track).name} final exam.`
        : `${correct}/${outcomes.length} correct. You need ${EXAM_PASS}. Brush up and try again!`;
      if (er.passed) after = { name: 'certificate', track: k.track, back: r.back };
    } else {
      res = completeReview(state, results);
      emoji = '🔁';
      title = 'Review done!';
      subtitle = `${outcomes.filter((o) => o === 'first').length}/${outcomes.length} remembered`;
    }

    setState(res.state);
    setRoute({
      name: 'results',
      back: after,
      info: {
        emoji,
        title,
        subtitle,
        xpGained: res.xpGained,
        accuracy,
        streak: liveStreak(res.state),
        levelUp: res.levelUp ? levelFor(res.state.xp).level : null,
        badges: res.newBadges,
      },
    });
  };

  const finishTour = (r: Extract<Route, { name: 'tour' }>, outcomes: Outcome[]) => {
    const tour = toursFor(r.track)[r.tour];
    const res = completeTour(state, tourId(r.track, r.tour), outcomes);
    setState(res.state);
    setRoute({
      name: 'results',
      back: r.back,
      info: {
        emoji: '🧭',
        title: 'Tour complete!',
        subtitle: tour.title,
        xpGained: res.xpGained,
        accuracy: outcomes.filter((o) => o === 'first').length / Math.max(1, outcomes.length),
        streak: liveStreak(res.state),
        levelUp: res.levelUp ? levelFor(res.state.xp).level : null,
        badges: res.newBadges,
      },
    });
  };

  if (!state.onboarded) {
    return (
      <Onboarding
        onDone={(track, dailyGoal) => {
          setState((s) => ({ ...s, onboarded: true, settings: { ...s.settings, dailyGoal } }));
          if (track) setRoute({ name: 'track', track });
        }}
      />
    );
  }

  const next = state.lastTrack ? nextStep(state, state.lastTrack) : null;

  if (route.name === 'session') {
    const Runner = DESKTOP ? DesktopSession : Session;
    return (
      <Runner
        key={route.title + route.items[0]?.id}
        title={route.title}
        items={route.items}
        mode={route.mode}
        concept={route.concept}
        settings={state.settings}
        onQuit={() => setRoute(route.back)}
        onDone={(results) => finishSession(route, results)}
      />
    );
  }
  if (route.name === 'tour') {
    return (
      <TourSession
        key={`${route.track}-${route.tour}`}
        tour={toursFor(route.track)[route.tour]}
        settings={state.settings}
        onQuit={() => setRoute(route.back)}
        onDone={(outcomes) => finishTour(route, outcomes)}
      />
    );
  }

  const page = (() => {
    switch (route.name) {
      case 'home':
        return (
          <Home
            state={state}
            next={next && state.lastTrack ? { track: state.lastTrack, label: next.label } : null}
            onContinue={() => next && state.lastTrack && start(next.action, state.lastTrack)}
            onTrack={(track) => setRoute({ name: 'track', track })}
            onReview={startReview}
            onProfile={() => setRoute({ name: 'profile' })}
          />
        );
      case 'track':
        return (
          <TrackMap
            track={route.track}
            state={state}
            onBack={() => setRoute({ name: 'home' })}
            onAction={(a) => start(a, route.track)}
            onTour={DESKTOP ? (tour) => setRoute({ name: 'tour', track: route.track, tour, back: route }) : undefined}
          />
        );
      case 'profile':
        return (
          <Profile
            state={state}
            onBack={() => setRoute({ name: 'home' })}
            onSettings={(settings) => setState((s) => ({ ...s, settings }))}
            onCertificate={(track) => setRoute({ name: 'certificate', track, back: { name: 'profile' } })}
            onReset={() => {
              setState(resetState());
              setRoute({ name: 'home' });
            }}
          />
        );
      case 'certificate':
        return <Certificate track={route.track} state={state} onBack={() => setRoute(route.back)} />;
      case 'results':
        return <Results info={route.info} onContinue={() => setRoute(route.back)} />;
    }
  })();

  if (!DESKTOP) return page;
  const current: NavTarget | null =
    route.name === 'home' || route.name === 'profile' ? { name: route.name } : route.name === 'track' ? { name: 'track', track: route.track } : null;
  return (
    <DesktopShell state={state} current={current} onNav={setRoute}>
      {page}
    </DesktopShell>
  );
}
