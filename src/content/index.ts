import type { DesktopUnit, Exercise, IndexedExercise, TrackId, Unit, WriteExercise } from '../engine/types';

// Written units are picked up automatically: content/<track>/unitNN.ts, each
// with a default-exported Unit. unitNN.ts sits at index NN-1, so a missing file
// leaves a "coming soon" gap instead of shifting the units after it.
const modules = import.meta.glob<{ default: Unit }>('./*/unit*.ts', { eager: true });

const byTrack: Record<TrackId, Unit[]> = { html: [], css: [], csharp: [], aspnet: [], blazor: [], docker: [], ollama: [] };
for (const path of Object.keys(modules)) {
  const [, track, file] = path.split('/');
  if (track in byTrack) byTrack[track as TrackId][parseInt(file.slice(4), 10) - 1] = modules[path].default;
}

// Desktop edition: write-the-code challenges, content/<track>/desktop/unitNN.ts,
// two per lesson of the matching unit.
// The phone build leaves them out (about 2 MB); dev servers and tests load them.
const withChallenges = import.meta.env.VITE_EDITION === 'desktop' || import.meta.env.DEV || import.meta.env.MODE === 'test';
const desktopModules = withChallenges ? import.meta.glob<{ default: DesktopUnit }>('./*/desktop/unit*.ts', { eager: true }) : {};
const desktopByTrack: Record<TrackId, DesktopUnit[]> = { html: [], css: [], csharp: [], aspnet: [], blazor: [], docker: [], ollama: [] };
for (const path of Object.keys(desktopModules)) {
  const [, track, , file] = path.split('/');
  if (track in desktopByTrack) desktopByTrack[track as TrackId][parseInt(file.slice(4), 10) - 1] = desktopModules[path].default;
}

/** A unit as the desktop edition shows it: laptop overrides of exercises and
 * concept cards swapped in. Returns `unit` itself when there are none. */
export function applyDesktop(unit: Unit, du: DesktopUnit | undefined): Unit {
  const o = du?.overrides ?? {};
  return {
    ...unit,
    lessons: unit.lessons.map((lesson, l) => {
      const concept = du?.concepts?.[l + 1] ?? lesson.concept;
      return {
        ...lesson,
        concept: { ...concept, code: psPrompt(concept.code) },
        exercises: lesson.exercises.map((ex, i) => o[`L${l + 1}.${i + 1}`] ?? windowsPrompts(ex)),
      };
    }),
    boss: unit.boss.map((ex, i) => o[`boss.${i + 1}`] ?? windowsPrompts(ex)),
  };
}

/** Shell examples show a `$ ` prompt; on Windows it is PowerShell's `PS> `. */
const psPrompt = (code: string) => code.replace(/^\$ /gm, 'PS> ');

function windowsPrompts(ex: Exercise): Exercise {
  switch (ex.kind) {
    case 'fill':
    case 'fix':
      return { ...ex, code: psPrompt(ex.code) };
    case 'order':
      return { ...ex, lines: ex.lines.map(psPrompt) };
    case 'type':
      return ex.template ? { ...ex, template: psPrompt(ex.template) } : ex;
    default:
      return ex;
  }
}

// The desktop edition teaches Windows commands: swap in the laptop overrides.
if (import.meta.env.VITE_EDITION === 'desktop')
  for (const track of Object.keys(byTrack) as TrackId[])
    byTrack[track] = byTrack[track].map((unit, u) => applyDesktop(unit, desktopByTrack[track][u]));

/** The desktop challenges for each unit of a track (gaps where none are written). */
export function desktopUnits(track: TrackId): (DesktopUnit | undefined)[] {
  return desktopByTrack[track];
}

/** The write-the-code challenges added after a lesson in the desktop edition. */
export function lessonChallenges(track: TrackId, unitIndex: number, lessonIndex: number): WriteExercise[] {
  return desktopByTrack[track][unitIndex]?.lessons[lessonIndex] ?? [];
}

export const challengeId = (track: TrackId, unitIndex: number, lessonIndex: number, i: number) =>
  `${lessonId(track, unitIndex, lessonIndex)}.W${i + 1}`;

export function writtenUnits(track: TrackId): Unit[] {
  return byTrack[track];
}

export const unitId = (track: TrackId, unitIndex: number) => `${track}-${unitIndex + 1}`;
export const lessonId = (track: TrackId, unitIndex: number, lessonIndex: number) =>
  `${unitId(track, unitIndex)}.L${lessonIndex + 1}`;
export const exerciseId = (track: TrackId, unitIndex: number, lessonIndex: number | 'boss', i: number) =>
  `${unitId(track, unitIndex)}.${lessonIndex === 'boss' ? 'boss' : `L${lessonIndex + 1}`}.${i + 1}`;

const exerciseIndex = new Map<string, IndexedExercise>();
for (const track of Object.keys(byTrack) as TrackId[]) {
  byTrack[track].forEach((unit, u) => {
    const add = (ex: Exercise, id: string) => exerciseIndex.set(id, { id, track, unitIndex: u, exercise: ex });
    unit.lessons.forEach((lesson, l) => lesson.exercises.forEach((ex, i) => add(ex, exerciseId(track, u, l, i))));
    unit.boss.forEach((ex, i) => add(ex, exerciseId(track, u, 'boss', i)));
  });
  desktopByTrack[track].forEach((du, u) =>
    du?.lessons.forEach((list, l) =>
      list.forEach((ex, i) => {
        const id = challengeId(track, u, l, i);
        exerciseIndex.set(id, { id, track, unitIndex: u, exercise: ex });
      }),
    ),
  );
}

export function getExercise(id: string): IndexedExercise | undefined {
  return exerciseIndex.get(id);
}

export function allExercises(): IndexedExercise[] {
  return [...exerciseIndex.values()];
}
