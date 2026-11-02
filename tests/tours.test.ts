import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { MOCKS } from '../src/components/desktop/mocks';
import { TRACKS } from '../src/content/roadmap';
import { toursFor } from '../src/content/tours';
import { checkType, isCode } from '../src/engine/check';
import type { Tour } from '../src/engine/types';

/** Every data-target the mock screen actually draws for this tour. */
function targetsOn(tour: Tour): string[] {
  const html = renderToStaticMarkup(createElement(MOCKS[tour.screen], { variant: tour.variant }));
  return [...html.matchAll(/data-target="([^"]+)"/g)].map((m) => m[1]);
}

describe('tool tours', () => {
  for (const track of TRACKS) {
    describe(track.name, () => {
      const tours = toursFor(track.id);
      it('has at least two tours', () => expect(tours.length).toBeGreaterThanOrEqual(2));
      tours.forEach((tour) => {
        it(`${tour.title}: every step is valid`, () => {
          const targets = targetsOn(tour);
          const bad: string[] = [];
          expect(new Set(targets).size, 'mock has duplicate targets').toBe(targets.length);
          tour.steps.forEach((s, i) => {
            if (!s.prompt.trim() || !s.hint.trim() || !s.explain.trim()) bad.push(`${i}: prompt/hint/explain must be non-empty`);
            if ('target' in s) {
              if (!targets.includes(s.target)) bad.push(`${i}: target ${s.target} is not on the ${tour.screen} screen`);
            } else {
              if (!s.command.length) bad.push(`${i}: no accepted commands`);
              if (!s.command.every((c) => checkType(c, s.command, 'docker'))) bad.push(`${i}: command does not check`);
            }
          });
          expect(tour.steps.length).toBeGreaterThanOrEqual(5);
          expect(bad).toEqual([]);
        });
      });
    });
  }
  it('commands are checked case-sensitively, like code', () => expect(isCode('docker')).toBe(true));
});
