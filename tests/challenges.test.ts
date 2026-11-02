import { describe, expect, it } from 'vitest';
import { desktopUnits, writtenUnits } from '../src/content';
import { problems as exerciseProblems } from './validate';
import { TRACKS } from '../src/content/roadmap';
import { checkWrite, isCode } from '../src/engine/check';
import type { TrackId, WriteExercise } from '../src/engine/types';

// Desktop edition: two write-the-code challenges after every lesson.
// Run one unit: npx vitest run tests/challenges.test.ts -t "Docker unit 7:"
const PER_LESSON = 2;

function problems(ex: WriteExercise, track: TrackId): string[] {
  const p: string[] = [];
  if (ex.kind !== 'write') return ['kind must be write'];
  if (!ex.prompt.trim() || !ex.hint.trim() || !ex.explain.trim()) p.push('prompt/hint/explain must be non-empty');
  if (isCode(track) && ex.preview) p.push('code tracks use `output`, not `preview`');
  if (!isCode(track) && ex.output) p.push('HTML/CSS use `preview`, not `output`');
  if (ex.checks.length < 2 || ex.checks.length > 6) p.push(`needs 2–6 checks, has ${ex.checks.length}`);
  const labels = ex.checks.map((c) => c.label.trim());
  if (labels.some((l) => !l)) p.push('every check needs a label');
  if (new Set(labels).size !== labels.length) p.push('check labels must be unique');
  ex.checks.forEach((c, i) => {
    const set = [c.has, c.re, c.not].filter((x) => x !== undefined).length;
    if (set !== 1) p.push(`check ${i} must set exactly one of has/re/not`);
    if (c.re !== undefined) {
      try {
        new RegExp(c.re, c.flags);
      } catch {
        p.push(`check ${i}: bad regex ${c.re}`);
      }
    }
    if (c.has !== undefined && !c.has.trim()) p.push(`check ${i}: empty has`);
    // With the m flag, ^ matches at every line start, so ^(?!…) almost always passes.
    if (c.re !== undefined && /^\^\(\?!/.test(c.re) && c.flags?.includes('m')) p.push(`check ${i}: ^(?!…) with the m flag passes too easily`);
  });
  if (!ex.checks.some((c) => c.not === undefined)) p.push('needs at least one has/re check');
  try {
    const sol = checkWrite(ex.solution, ex, track);
    sol.forEach((ok, i) => !ok && p.push(`solution fails check ${i} (${ex.checks[i].label})`));
    if (checkWrite(ex.starter, ex, track).every(Boolean)) p.push('starter already passes every check');
  } catch (e) {
    p.push(`checking threw: ${(e as Error).message}`);
  }
  if (ex.solution.trim() === ex.starter.trim()) p.push('solution equals starter');
  const lines = ex.solution.trim().split('\n').length;
  if (lines > 24) p.push(`solution should be at most 24 lines, has ${lines}`);
  if (lines < 2 && ex.solution.trim().length < 40) p.push('too small for a write challenge: 2+ lines or 40+ characters');
  if (/\t/.test(ex.solution + ex.starter)) p.push('use spaces, not tabs');
  return p;
}

describe('desktop write challenges', () => {
  for (const track of TRACKS) {
    const units = writtenUnits(track.id);
    const desk = desktopUnits(track.id);
    units.forEach((unit, u) => {
      const du = desk[u];
      if (!du) return;
      describe(`${track.name} unit ${u + 1}: ${unit.title}`, () => {
        it('laptop overrides replace real exercises and are valid', () => {
          const bad: string[] = [];
          const original = (key: string) => {
            const m = /^L(\d)\.(\d+)$|^boss\.(\d+)$/.exec(key);
            if (!m) return undefined;
            return m[3] ? unit.boss[+m[3] - 1] : unit.lessons[+m[1] - 1]?.exercises[+m[2] - 1];
          };
          for (const [key, ex] of Object.entries(du.overrides ?? {})) {
            const orig = original(key);
            if (!orig) bad.push(`${key}: no such exercise (use L<lesson>.<n> or boss.<n>)`);
            else if (orig.kind !== ex.kind) bad.push(`${key}: kind ${ex.kind} must match the original ${orig.kind}`);
            exerciseProblems(ex, track.id).forEach((m) => bad.push(`${key}: ${m}`));
          }
          for (const [n, c] of Object.entries(du.concepts ?? {})) {
            if (!unit.lessons[+n - 1]) bad.push(`concept ${n}: no such lesson`);
            if (!c.body.trim() || !c.code.trim()) bad.push(`concept ${n}: body and code must be non-empty`);
          }
          expect(bad).toEqual([]);
        });

        it('has two valid challenges per lesson', () => {
          expect(du.lessons.length, 'one entry per lesson').toBe(unit.lessons.length);
          const bad: string[] = [];
          du.lessons.forEach((list, l) => {
            if (list.length !== PER_LESSON) bad.push(`L${l + 1}: needs ${PER_LESSON} challenges, has ${list.length}`);
            list.forEach((ex, i) => problems(ex, track.id).forEach((m) => bad.push(`L${l + 1}.W${i + 1}: ${m}`)));
          });
          expect(bad).toEqual([]);
        });
      });
    });
    it(`${track.name}: no challenges for units that don't exist`, () => {
      desk.forEach((du, u) => du && expect(units[u], `desktop unit ${u + 1} has no unit`).toBeDefined());
    });
  }

  it('every unit of every track has challenges', () => {
    const missing = TRACKS.flatMap((t) => writtenUnits(t.id).flatMap((_, u) => (desktopUnits(t.id)[u] ? [] : [`${t.id}-${u + 1}`])));
    expect(missing).toEqual([]);
  });
});
