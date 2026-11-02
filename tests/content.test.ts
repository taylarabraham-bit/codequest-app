import { describe, expect, it } from 'vitest';
import { allExercises, writtenUnits } from '../src/content';
import { TRACKS } from '../src/content/roadmap';
import type { Exercise } from '../src/engine/types';
import { problems } from './validate';

const LESSONS_PER_UNIT = 5;
const EXERCISES_PER_LESSON = 7;
const BOSS_SIZE = 10;

describe('course content', () => {
  for (const track of TRACKS) {
    const units = writtenUnits(track.id);

    it(`${track.name}: written units fit the roadmap`, () => {
      expect(units.length).toBeGreaterThan(0);
      expect(units.length).toBeLessThanOrEqual(track.roadmap.length);
    });

    units.forEach((unit, u) => {
      describe(`${track.name} unit ${u + 1}: ${unit.title}`, () => {
        it('has the right shape', () => {
          expect(unit.title).toBe(track.roadmap[u]);
          expect(unit.lessons).toHaveLength(LESSONS_PER_UNIT);
          unit.lessons.forEach((l) => {
            expect(l.exercises, l.title).toHaveLength(EXERCISES_PER_LESSON);
            expect(l.concept.body.trim(), l.title).not.toBe('');
            expect(l.concept.code.trim(), l.title).not.toBe('');
          });
          expect(unit.boss).toHaveLength(BOSS_SIZE);
        });

        it('ramps up in difficulty', () => {
          const kinds = (exs: Exercise[]) => new Set(exs.map((e) => e.kind));
          const first = kinds(unit.lessons[0].exercises);
          expect(first.has('fix') || first.has('type'), 'lesson 1 has no fix/type').toBe(false);
          const last = kinds(unit.lessons[LESSONS_PER_UNIT - 1].exercises);
          expect(last.has('fix') && last.has('type'), 'lesson 5 has fix and type').toBe(true);
          unit.lessons.forEach((l) => expect(kinds(l.exercises).size, l.title).toBeGreaterThanOrEqual(2));
          expect(kinds(unit.boss).size, 'boss mixes 4+ kinds').toBeGreaterThanOrEqual(4);
        });

        it('every exercise is valid', () => {
          const all = [
            ...unit.lessons.flatMap((l, li) => l.exercises.map((ex, i) => ({ ex, at: `L${li + 1}.${i + 1}` }))),
            ...unit.boss.map((ex, i) => ({ ex, at: `boss.${i + 1}` })),
          ];
          const bad = all.flatMap(({ ex, at }) => problems(ex, track.id).map((m) => `${at}: ${m}`));
          expect(bad).toEqual([]);
        });
      });
    });
  }

  it('exercise ids are unique', () => {
    const ids = allExercises().map((e) => e.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});
