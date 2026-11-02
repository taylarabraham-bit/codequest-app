// Shared exercise validation: the phone content (content.test.ts) and the
// desktop overrides (challenges.test.ts) must meet the same rules.
import {
  answerCode,
  checkBuild,
  checkBuildTyped,
  checkFill,
  checkFix,
  checkFixTyped,
  checkOrder,
  checkType,
  isCode,
  joinTokens,
  parseFixCode,
  sameCode,
} from '../src/engine/check';
import type { Exercise, TrackId } from '../src/engine/types';

export function problems(ex: Exercise, track: TrackId): string[] {
  const p: string[] = [];
  if (!ex.prompt.trim() || !ex.hint.trim() || !ex.explain.trim()) p.push('prompt/hint/explain must be non-empty');
  if (isCode(track) && ex.preview) p.push('code tracks use `output`, not `preview`');
  if (!isCode(track) && ex.output) p.push('HTML/CSS exercises use `preview`, not `output`');
  switch (ex.kind) {
    case 'fill': {
      const gaps = ex.code.split('___').length - 1;
      if (gaps !== ex.blanks.length) p.push(`fill: ${gaps} gaps but ${ex.blanks.length} blanks`);
      ex.blanks.forEach((b, i) => {
        if (!b.answer.length) p.push(`fill: blank ${i} has no answer`);
        if (b.options) {
          if (!b.options.includes(b.answer[0])) p.push(`fill: blank ${i} options lack its answer`);
          if (new Set(b.options).size !== b.options.length) p.push(`fill: blank ${i} has duplicate options`);
          if (b.options.length < 2) p.push(`fill: blank ${i} needs 2+ options`);
          // Desktop edition types every blank, so a wrong option must not
          // normalize to a right answer.
          for (const o of b.options)
            if (!b.answer.includes(o) && b.answer.some((a) => sameCode(o, a, track)))
              p.push(`fill: blank ${i} option ${o} types the same as an answer`);
        }
      });
      if (!checkFill(ex.blanks.map((b) => b.answer[0]), ex, track)) p.push('fill: answer does not check');
      break;
    }
    case 'build':
      if (ex.answer.length < 2) p.push('build: answer needs 2+ tokens');
      if (ex.distractors.length < 1) p.push('build: needs at least one distractor');
      if (!checkBuild(ex.answer, ex)) p.push('build: answer does not check');
      // Desktop edition: the same line typed out.
      if (!checkBuildTyped(joinTokens(ex.answer, track), ex, track)) p.push('build: typed answer does not check');
      if (checkBuildTyped(joinTokens([...ex.answer, ex.distractors[0]], track), ex, track))
        p.push('build: typed answer plus a distractor still checks');
      break;
    case 'order':
      if (ex.lines.length < 3) p.push('order: needs 3+ lines');
      if (new Set(ex.lines).size < 2) p.push('order: lines are all identical');
      if (!checkOrder(ex.lines.map((_, i) => i), ex.lines)) p.push('order: answer does not check');
      break;
    case 'fix': {
      const markers = ex.code.match(/\[\[(.+?)\]\]/g) ?? [];
      if (markers.length !== 1) p.push(`fix: needs exactly one [[bug]] marker, found ${markers.length}`);
      const { bugIndex, bug } = parseFixCode(ex.code, track);
      if (bug === ex.fix) p.push('fix: fix equals the bug');
      if (!ex.options.includes(ex.fix)) p.push('fix: options lack the fix');
      if (ex.options.length < 2) p.push('fix: needs 2+ options');
      if (!checkFix(bugIndex, ex.fix, ex, track)) p.push('fix: answer does not check');
      if (!checkFixTyped(bugIndex, ex.fix, ex, track)) p.push('fix: typed fix does not check');
      if (checkFixTyped(bugIndex, bug, ex, track)) p.push('fix: retyping the bug checks (desktop)');
      break;
    }
    case 'type':
      if (!ex.accept.length) p.push('type: no accepted answers');
      if (ex.template && ex.template.split('___').length !== 2) p.push('type: template needs exactly one ___');
      if (!checkType(ex.accept[0], ex.accept, track)) p.push('type: answer does not check');
      break;
  }
  if (!answerCode(ex, track).trim()) p.push('empty answer code');
  return p;
}
