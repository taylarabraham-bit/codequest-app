import { TRACKS } from '../content/roadmap';
import type { TrackId } from './types';

// All progress lives in one plain object, saved on the device (storage.ts).
// Every function here is pure: it takes a state and returns a new one.

export interface ReviewItem {
  id: string;
  /** 0, 1, 2: how many times it has been reviewed correctly in a row. */
  stage: number;
  due: string; // local YYYY-MM-DD
}

/** Earned by passing a track's final exam. */
export interface Certificate {
  day: string; // local YYYY-MM-DD it was first earned
  score: number; // best score so far
  total: number;
}

export interface SaveState {
  v: 1;
  xp: number;
  /** lessonId (e.g. "html-1.L3") → true once finished. */
  lessons: Record<string, true>;
  /** unitId (e.g. "css-2") → how the unit was cleared. */
  units: Record<string, 'boss' | 'skipped'>;
  streak: { count: number; best: number; lastDay: string | null };
  badges: string[];
  review: ReviewItem[];
  stats: { correct: number; perfectLessons: number; reviewsDone: number };
  settings: Settings;
  /** trackId → certificate from its final exam. */
  certificates: Partial<Record<TrackId, Certificate>>;
  /** Seen the first-launch intro. */
  onboarded: boolean;
  /** The track of the last lesson or boss started, for "Continue". */
  lastTrack: TrackId | null;
  /** XP earned on one local day, for the daily goal. */
  today: { day: string | null; xp: number };
  /** tourId (e.g. "docker-tour1") → true once finished (desktop edition). */
  tours: Record<string, true>;
}

export interface Settings {
  sound: boolean;
  haptics: boolean;
  /** XP per day; 0 turns the goal off. */
  dailyGoal: number;
  reducedMotion: boolean;
  largeCode: boolean;
}

export const DAILY_GOALS = [0, 30, 60, 120];

export const initialState = (): SaveState => ({
  v: 1,
  xp: 0,
  lessons: {},
  units: {},
  streak: { count: 0, best: 0, lastDay: null },
  badges: [],
  review: [],
  stats: { correct: 0, perfectLessons: 0, reviewsDone: 0 },
  settings: { sound: true, haptics: true, dailyGoal: 60, reducedMotion: false, largeCode: false },
  certificates: {},
  onboarded: false,
  lastTrack: null,
  today: { day: null, xp: 0 },
  tours: {},
});

/** XP earned today (0 when the stored day is not today). */
export const xpToday = (s: SaveState, today = dayKey()) => (s.today.day === today ? s.today.xp : 0);

// ---- Dates (local calendar days) ----------------------------------------

export function dayKey(d: Date = new Date()): string {
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

export function addDays(day: string, n: number): string {
  const [y, m, d] = day.split('-').map(Number);
  return dayKey(new Date(y, m - 1, d + n));
}

// ---- XP & levels --------------------------------------------------------

export const XP = {
  firstTry: 10,
  afterHint: 5,
  lessonDone: 20,
  perfectBonus: 10,
  bossDone: 50,
  skipTest: 40,
  reviewItem: 4,
  examPass: 150,
  tourDone: 20,
};

/** Level n needs 100·n·(n−1)/2 XP in total: 0, 100, 300, 600, 1000… */
export function levelFor(xp: number): { level: number; into: number; needed: number } {
  let level = 1;
  while (xp >= (100 * (level + 1) * level) / 2) level++;
  const base = (100 * level * (level - 1)) / 2;
  return { level, into: xp - base, needed: 100 * level };
}

// ---- Streak -------------------------------------------------------------

/** Call whenever a practice session (lesson, boss, review, skip test) ends. */
export function touchStreak(s: SaveState, today = dayKey()): SaveState {
  const { lastDay, count, best } = s.streak;
  if (lastDay === today) return s;
  const next = lastDay === addDays(today, -1) ? count + 1 : 1;
  return { ...s, streak: { count: next, best: Math.max(best, next), lastDay: today } };
}

/** The streak as shown: it lapses if neither today nor yesterday was practised. */
export function liveStreak(s: SaveState, today = dayKey()): number {
  const { lastDay, count } = s.streak;
  return lastDay === today || lastDay === addDays(today, -1) ? count : 0;
}

// ---- Unlocking ------------------------------------------------------------

export const unitCleared = (s: SaveState, unitId: string) => unitId in s.units;

export function unitUnlocked(s: SaveState, track: TrackId, unitIndex: number): boolean {
  return unitIndex === 0 || unitCleared(s, `${track}-${unitIndex}`);
}

export function lessonUnlocked(s: SaveState, track: TrackId, unitIndex: number, lessonIndex: number): boolean {
  if (!unitUnlocked(s, track, unitIndex)) return false;
  if (unitCleared(s, `${track}-${unitIndex + 1}`)) return true;
  return lessonIndex === 0 || `${track}-${unitIndex + 1}.L${lessonIndex}` in s.lessons;
}

/** Every unit on the track's roadmap is cleared (by boss or skip test). */
export function trackComplete(s: SaveState, track: TrackId, unitCount: number): boolean {
  for (let u = 0; u < unitCount; u++) if (!unitCleared(s, `${track}-${u + 1}`)) return false;
  return unitCount > 0;
}

export function bossUnlocked(s: SaveState, track: TrackId, unitIndex: number, lessonCount: number): boolean {
  return lessonUnlocked(s, track, unitIndex, lessonCount);
}

export function unitProgress(s: SaveState, track: TrackId, unitIndex: number, lessonCount: number): number {
  if (unitCleared(s, `${track}-${unitIndex + 1}`)) return 1;
  let done = 0;
  for (let l = 0; l < lessonCount; l++) if (`${track}-${unitIndex + 1}.L${l + 1}` in s.lessons) done++;
  return done / (lessonCount + 1);
}

// ---- Session results ------------------------------------------------------

export type Outcome = 'first' | 'hinted' | 'revealed';

export function xpForOutcomes(outcomes: Outcome[]): number {
  return outcomes.reduce((t, o) => t + (o === 'first' ? XP.firstTry : o === 'hinted' ? XP.afterHint : 0), 0);
}

export interface SessionResult {
  state: SaveState;
  xpGained: number;
  newBadges: Badge[];
  levelUp: boolean;
}

function finish(prev: SaveState, next: SaveState, xpGained: number, today: string): SessionResult {
  next = touchStreak({ ...next, xp: next.xp + xpGained, today: { day: today, xp: xpToday(next, today) + xpGained } }, today);
  const earned = BADGES.filter((b) => !next.badges.includes(b.id) && b.test(next));
  next = { ...next, badges: [...next.badges, ...earned.map((b) => b.id)] };
  return { state: next, xpGained, newBadges: earned, levelUp: levelFor(next.xp).level > levelFor(prev.xp).level };
}

const countCorrect = (s: SaveState, outcomes: Outcome[]) => ({
  ...s.stats,
  correct: s.stats.correct + outcomes.filter((o) => o !== 'revealed').length,
});

export function completeLesson(
  s: SaveState,
  lessonId: string,
  outcomes: Outcome[],
  missedIds: string[],
  today = dayKey(),
): SessionResult {
  const perfect = outcomes.every((o) => o === 'first');
  let xp = xpForOutcomes(outcomes) + XP.lessonDone + (perfect ? XP.perfectBonus : 0);
  if (lessonId in s.lessons) xp = Math.round(xp / 2); // replays still pay, but less
  const next: SaveState = {
    ...s,
    lessons: { ...s.lessons, [lessonId]: true },
    stats: { ...countCorrect(s, outcomes), perfectLessons: s.stats.perfectLessons + (perfect ? 1 : 0) },
    review: queueMissed(s.review, missedIds, today),
  };
  return finish(s, next, xp, today);
}

/** A tool tour (desktop edition). Outcomes count like lesson exercises. */
export function completeTour(s: SaveState, tourId: string, outcomes: Outcome[], today = dayKey()): SessionResult {
  let xp = xpForOutcomes(outcomes) + XP.tourDone;
  if (tourId in s.tours) xp = Math.round(xp / 2);
  const next: SaveState = { ...s, tours: { ...s.tours, [tourId]: true }, stats: countCorrect(s, outcomes) };
  return finish(s, next, xp, today);
}

export function completeBoss(
  s: SaveState,
  unitId: string,
  outcomes: Outcome[],
  missedIds: string[],
  today = dayKey(),
): SessionResult {
  const first = s.units[unitId] !== 'boss';
  const xp = xpForOutcomes(outcomes) + (first ? XP.bossDone : 0);
  const next: SaveState = {
    ...s,
    units: { ...s.units, [unitId]: 'boss' },
    stats: countCorrect(s, outcomes),
    review: queueMissed(s.review, missedIds, today),
  };
  return finish(s, next, xp, today);
}

export const SKIP_PASS = 7;
export const SKIP_SIZE = 8;

/** A passed skip test clears that unit and every earlier one in its track. */
export function completeSkipTest(
  s: SaveState,
  track: TrackId,
  unitIndex: number,
  correct: number,
  today = dayKey(),
): SessionResult & { passed: boolean } {
  const passed = correct >= SKIP_PASS;
  let next = s;
  if (passed) {
    const units = { ...s.units };
    for (let u = 0; u <= unitIndex; u++) units[`${track}-${u + 1}`] ??= 'skipped';
    next = { ...s, units };
  }
  return { ...finish(s, next, passed ? XP.skipTest : 0, today), passed };
}

export const EXAM_PASS = 17;
export const EXAM_SIZE = 20;

/** The final exam: passing earns (or improves) the track's certificate. */
export function completeExam(
  s: SaveState,
  track: TrackId,
  correct: number,
  total: number,
  today = dayKey(),
): SessionResult & { passed: boolean } {
  const passed = correct >= EXAM_PASS;
  const had = s.certificates[track];
  let next = s;
  if (passed) {
    const cert: Certificate = had
      ? { ...had, score: Math.max(had.score, correct), total }
      : { day: today, score: correct, total };
    next = { ...s, certificates: { ...s.certificates, [track]: cert } };
  }
  return { ...finish(s, next, passed && !had ? XP.examPass : 0, today), passed };
}

// ---- Review queue ---------------------------------------------------------

const INTERVALS = [1, 3, 7];

export function queueMissed(queue: ReviewItem[], ids: string[], today = dayKey()): ReviewItem[] {
  const rest = queue.filter((q) => !ids.includes(q.id));
  return [...rest, ...ids.map((id) => ({ id, stage: 0, due: addDays(today, 1) }))];
}

export function dueReviews(s: SaveState, today = dayKey()): ReviewItem[] {
  return s.review.filter((r) => r.due <= today).sort((a, b) => a.due.localeCompare(b.due));
}

/** Correct on the first try moves an item up a stage; it graduates after the
 * last interval. Anything else sends it back to stage 0, due tomorrow. */
export function reviewAnswered(queue: ReviewItem[], id: string, firstTry: boolean, today = dayKey()): ReviewItem[] {
  return queue.flatMap((q) => {
    if (q.id !== id) return [q];
    if (!firstTry) return [{ id, stage: 0, due: addDays(today, 1) }];
    const stage = q.stage + 1;
    return stage >= INTERVALS.length ? [] : [{ id, stage, due: addDays(today, INTERVALS[stage]) }];
  });
}

export function completeReview(
  s: SaveState,
  results: { id: string; outcome: Outcome }[],
  today = dayKey(),
): SessionResult {
  let review = s.review;
  for (const r of results) review = reviewAnswered(review, r.id, r.outcome === 'first', today);
  const outcomes = results.map((r) => r.outcome);
  const next: SaveState = {
    ...s,
    review,
    stats: { ...countCorrect(s, outcomes), reviewsDone: s.stats.reviewsDone + results.length },
  };
  const xp = outcomes.filter((o) => o === 'first').length * XP.reviewItem;
  return finish(s, next, xp, today);
}

// ---- Badges -----------------------------------------------------------------

export interface Badge {
  id: string;
  icon: string;
  name: string;
  desc: string;
  test: (s: SaveState) => boolean;
}

const firstBoss = (track: TrackId) => (s: SaveState) => s.units[`${track}-1`] === 'boss';
const anyBoss = (track: TrackId) => (s: SaveState) => Object.entries(s.units).some(([id, how]) => how === 'boss' && id.startsWith(`${track}-`));
const certified = (track: TrackId) => (s: SaveState) => !!s.certificates[track];

export const BADGES: Badge[] = [
  { id: 'first-lesson', icon: '🌱', name: 'Hello, World', desc: 'Finish your first lesson', test: (s) => Object.keys(s.lessons).length >= 1 },
  { id: 'ten-lessons', icon: '📚', name: 'Bookworm', desc: 'Finish 10 lessons', test: (s) => Object.keys(s.lessons).length >= 10 },
  { id: 'fifty-lessons', icon: '🏛️', name: 'Scholar', desc: 'Finish 50 lessons', test: (s) => Object.keys(s.lessons).length >= 50 },
  { id: 'perfect', icon: '💎', name: 'Flawless', desc: 'Finish a lesson with no mistakes', test: (s) => s.stats.perfectLessons >= 1 },
  { id: 'perfect-10', icon: '👑', name: 'Precision', desc: '10 flawless lessons', test: (s) => s.stats.perfectLessons >= 10 },
  { id: 'streak-3', icon: '🔥', name: 'Warming Up', desc: '3-day streak', test: (s) => s.streak.best >= 3 },
  { id: 'streak-7', icon: '⚡', name: 'On Fire', desc: '7-day streak', test: (s) => s.streak.best >= 7 },
  { id: 'streak-30', icon: '🌋', name: 'Unstoppable', desc: '30-day streak', test: (s) => s.streak.best >= 30 },
  { id: 'boss-html', icon: '🧱', name: 'Tag Tamer', desc: 'Beat the first HTML boss', test: firstBoss('html') },
  { id: 'boss-css', icon: '🎨', name: 'Style Slinger', desc: 'Beat the first CSS boss', test: firstBoss('css') },
  { id: 'boss-csharp', icon: '⚙️', name: 'Sharp Mind', desc: 'Beat the first C# boss', test: firstBoss('csharp') },
  { id: 'boss-aspnet', icon: '🛰️', name: 'API Builder', desc: 'Beat the first ASP.NET boss', test: firstBoss('aspnet') },
  { id: 'boss-blazor', icon: '✨', name: 'Razor Sharp', desc: 'Beat the first Blazor boss', test: firstBoss('blazor') },
  { id: 'boss-docker', icon: '📦', name: 'Shipshape', desc: 'Beat the first Docker boss', test: firstBoss('docker') },
  { id: 'boss-ollama', icon: '🦙', name: 'Llama Whisperer', desc: 'Beat the first Ollama boss', test: firstBoss('ollama') },
  { id: 'polyglot', icon: '🌐', name: 'Polyglot', desc: 'Beat a boss in every track', test: (s) => TRACKS.every((t) => anyBoss(t.id)(s)) },
  { id: 'skipper', icon: '🚀', name: 'Fast Track', desc: 'Pass a skip-ahead test', test: (s) => Object.values(s.units).includes('skipped') },
  { id: 'reviewer', icon: '🔁', name: 'Second Look', desc: 'Answer 25 review questions', test: (s) => s.stats.reviewsDone >= 25 },
  { id: 'xp-1000', icon: '🏆', name: 'Grinder', desc: 'Earn 1,000 XP', test: (s) => s.xp >= 1000 },
  { id: 'xp-10000', icon: '🌟', name: 'Veteran', desc: 'Earn 10,000 XP', test: (s) => s.xp >= 10000 },
  { id: 'track-done', icon: '🗺️', name: 'Finisher', desc: 'Clear every unit in a track', test: (s) => TRACKS.some((t) => trackComplete(s, t.id, t.roadmap.length)) },
  ...TRACKS.map((t) => ({ id: `cert-${t.id}`, icon: '🎓', name: `${t.name} Certified`, desc: `Pass the ${t.name} final exam`, test: certified(t.id) })),
  { id: 'all-certs', icon: '🏅', name: 'Grand Master', desc: 'Earn every certificate', test: (s) => TRACKS.every((t) => certified(t.id)(s)) },
];
