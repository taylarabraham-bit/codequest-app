import { describe, expect, it } from 'vitest';
import {
  checkBuild,
  checkBuildTyped,
  checkFill,
  checkFix,
  checkFixTyped,
  checkOrder,
  checkType,
  checkWrite,
  isCommand,
  joinTokens,
  normalize,
  parseFixCode,
  tokenize,
} from '../src/engine/check';
import {
  addDays,
  completeBoss,
  completeExam,
  completeLesson,
  completeReview,
  completeSkipTest,
  completeTour,
  dueReviews,
  initialState,
  lessonUnlocked,
  levelFor,
  liveStreak,
  touchStreak,
  trackComplete,
  unitUnlocked,
} from '../src/engine/progress';
import type { BuildExercise, FixExercise } from '../src/engine/types';

const base = { prompt: 'p', hint: 'h', explain: 'e' };

describe('normalize & matching', () => {
  it('ignores spacing around punctuation', () => {
    expect(checkType('Console.WriteLine( "Hi" ) ;', ['Console.WriteLine("Hi");'], 'csharp')).toBe(true);
    expect(checkType('int  x=5;', ['int x = 5;'], 'csharp')).toBe(true);
  });
  it('keeps word boundaries', () => {
    expect(checkType('intx = 5;', ['int x = 5;'], 'csharp')).toBe(false);
  });
  it('is case-sensitive only for C#', () => {
    expect(checkType('console.writeline("Hi");', ['Console.WriteLine("Hi");'], 'csharp')).toBe(false);
    expect(checkType('from node:22', ['FROM node:22'], 'docker')).toBe(false);
    expect(checkType("<A HREF='x'>", ['<a href="x">'], 'html')).toBe(true);
    expect(normalize('color : RED ;', 'css')).toBe('color:red;');
  });
  it('handles minus in C# and keeps string contents', () => {
    expect(checkType('x-=3;', ['x -= 3;'], 'csharp')).toBe(true);
    expect(checkType('y = x-1;', ['y = x - 1;'], 'csharp')).toBe(true);
    expect(checkType('Console.WriteLine("Hi , Sam");', ['Console.WriteLine("Hi, Sam");'], 'csharp')).toBe(false);
  });
  it('keeps CSS descendant spaces meaningful', () => {
    expect(checkType('.menu.item', ['.menu .item'], 'css')).toBe(false);
    expect(checkType('.menu   .item{color : red}', ['.menu .item { color: red }'], 'css')).toBe(true);
    expect(checkType('h1,.sub', ['h1, .sub'], 'css')).toBe(true);
    expect(checkType('font-size:2em;', ['font-size: 2em;'], 'css')).toBe(true);
  });
  it('checks fill blanks against any accepted answer', () => {
    const ex = { blanks: [{ answer: ['h1'] }, { answer: ['red', '#f00'] }] };
    expect(checkFill(['h1', '#F00'], ex, 'css')).toBe(true);
    expect(checkFill(['h2', 'red'], ex, 'css')).toBe(false);
  });
});

describe('build, order, fix', () => {
  it('checks token order and alternatives', () => {
    const ex: BuildExercise = { ...base, kind: 'build', answer: ['a', 'b'], distractors: ['c'], alt: [['b', 'a']] };
    expect(checkBuild(['a', 'b'], ex)).toBe(true);
    expect(checkBuild(['b', 'a'], ex)).toBe(true);
    expect(checkBuild(['a', 'c'], ex)).toBe(false);
    expect(checkBuild(['a'], ex)).toBe(false);
  });
  it('treats identical lines as interchangeable', () => {
    const lines = ['{', 'x', '}', 'x'];
    expect(checkOrder([0, 3, 2, 1], lines)).toBe(true);
    expect(checkOrder([1, 0, 2, 3], lines)).toBe(false);
  });
  it('finds the bug token', () => {
    const ex: FixExercise = { ...base, kind: 'fix', code: '<p>Hi</[[b]]>', fix: 'p', options: ['p', 'h1'] };
    const { tokens, bugIndex } = parseFixCode(ex.code, 'html');
    expect(tokens[bugIndex]).toBe('b');
    expect(tokens.join('')).toBe('<p>Hi</b>');
    expect(checkFix(bugIndex, 'p', ex, 'html')).toBe(true);
    expect(checkFix(bugIndex - 1, 'p', ex, 'html')).toBe(false);
    expect(checkFix(bugIndex, 'h1', ex, 'html')).toBe(false);
  });
  it('tokenizes code losslessly', () => {
    for (const code of ['<a href="/x">Go</a>', 'p { color: red; }', 'int total = a + b; // sum', 'Console.WriteLine($"Hi {name}");']) {
      expect(tokenize(code, 'html').join('')).toBe(code);
      expect(tokenize(code, 'csharp').join('')).toBe(code);
    }
  });
  it('tokenizes C# operators as C#', () => {
    expect(tokenize('if (a<b) x--;', 'csharp').filter((t) => t.trim())).toEqual(['if', '(', 'a', '<', 'b', ')', 'x', '--', ';']);
  });
  it('joins tokens readably', () => {
    expect(joinTokens(['<h1>', 'Hi', '</h1>'], 'html')).toBe('<h1>Hi</h1>');
    expect(joinTokens(['Console.WriteLine', '(', '"Hi"', ')', ';'], 'csharp')).toBe('Console.WriteLine("Hi");');
    expect(joinTokens(['p', '{', 'color:', 'red;', '}'], 'css')).toBe('p { color: red; }');
    expect(joinTokens(['nav', '.link', '{'], 'css')).toBe('nav .link {');
  });
});

describe('typed answers (desktop edition)', () => {
  it('accepts a build typed with any spacing, and its alternatives', () => {
    const ex: BuildExercise = { ...base, kind: 'build', answer: ['int', 'x', '=', '5', ';'], distractors: ['var'], alt: [['var', 'x', '=', '5', ';']] };
    expect(checkBuildTyped('int x=5;', ex, 'csharp')).toBe(true);
    expect(checkBuildTyped('var x = 5;', ex, 'csharp')).toBe(true);
    expect(checkBuildTyped('int x = 6;', ex, 'csharp')).toBe(false);
  });
  it('needs the right token and the typed fix', () => {
    const ex: FixExercise = { ...base, kind: 'fix', code: 'int x = [["5"]];', fix: '5', options: ['5', '"5"'] };
    const { bugIndex } = parseFixCode(ex.code, 'csharp');
    expect(checkFixTyped(bugIndex, ' 5 ', ex, 'csharp')).toBe(true);
    expect(checkFixTyped(bugIndex - 2, '5', ex, 'csharp')).toBe(false);
  });
  it('wants the exact fix when only case differs', () => {
    const ex: FixExercise = { ...base, kind: 'fix', code: '{ "@type": [["recipe"]] }', fix: '"Recipe"', options: ['"Recipe"', '"recipe"'] };
    const { bugIndex } = parseFixCode(ex.code, 'html');
    expect(checkFixTyped(bugIndex, '"Recipe"', ex, 'html')).toBe(true);
    expect(checkFixTyped(bugIndex, '"recipe"', ex, 'html')).toBe(false);
  });
  it('write checks accept single-quoted HTML attributes', () => {
    const ex = { checks: [{ label: 'id', re: 'id="tip"' }, { label: 'class', has: 'class="note"' }] };
    expect(checkWrite("<p id='tip' class='note'>Hi</p>", ex, 'html')).toEqual([true, true]);
    expect(checkWrite("<p id='top'>Hi</p>", ex, 'html')).toEqual([false, false]);
    expect(checkWrite("var s = 'id=\"tip\"';", { checks: [{ label: 'x', re: "id='tip'" }] }, 'csharp')).toEqual([false]);
  });
  it('spots terminal commands', () => {
    expect(isCommand('docker run -d nginx', 'docker')).toBe(true);
    expect(isCommand('/set parameter temperature 0', 'ollama')).toBe(true);
    expect(isCommand('FROM node:22', 'docker')).toBe(false);
    expect(isCommand('/path/to/file', 'docker')).toBe(false);
  });
});

describe('progress', () => {
  const today = '2026-10-08';

  it('levels follow the triangular curve', () => {
    expect(levelFor(0).level).toBe(1);
    expect(levelFor(99).level).toBe(1);
    expect(levelFor(100).level).toBe(2);
    expect(levelFor(300)).toEqual({ level: 3, into: 0, needed: 300 });
  });

  it('streak continues on consecutive days and resets after a gap', () => {
    let s = touchStreak(initialState(), today);
    expect(s.streak.count).toBe(1);
    s = touchStreak(s, today);
    expect(s.streak.count).toBe(1);
    s = touchStreak(s, addDays(today, 1));
    expect(s.streak.count).toBe(2);
    expect(liveStreak(s, addDays(today, 2))).toBe(2);
    expect(liveStreak(s, addDays(today, 3))).toBe(0);
    s = touchStreak(s, addDays(today, 3));
    expect(s.streak).toEqual({ count: 1, best: 2, lastDay: addDays(today, 3) });
  });

  it('unlocks lessons and units in order', () => {
    let s = initialState();
    expect(lessonUnlocked(s, 'html', 0, 0)).toBe(true);
    expect(lessonUnlocked(s, 'html', 0, 1)).toBe(false);
    s = completeLesson(s, 'html-1.L1', ['first'], [], today).state;
    expect(lessonUnlocked(s, 'html', 0, 1)).toBe(true);
    expect(unitUnlocked(s, 'html', 1)).toBe(false);
    s = completeBoss(s, 'html-1', ['first'], [], today).state;
    expect(unitUnlocked(s, 'html', 1)).toBe(true);
    expect(lessonUnlocked(s, 'html', 0, 4)).toBe(true);
  });

  it('awards XP, perfect bonus and badges', () => {
    const r = completeLesson(initialState(), 'css-1.L1', Array(7).fill('first'), [], today);
    expect(r.xpGained).toBe(70 + 20 + 10);
    expect(r.newBadges.map((b) => b.id)).toEqual(['first-lesson', 'perfect']);
    expect(r.levelUp).toBe(true);
    const replay = completeLesson(r.state, 'css-1.L1', Array(7).fill('first'), [], today);
    expect(replay.xpGained).toBe(50);
  });

  it('skip test clears the unit and all earlier ones', () => {
    const fail = completeSkipTest(initialState(), 'csharp', 2, 6, today);
    expect(fail.passed).toBe(false);
    const pass = completeSkipTest(initialState(), 'csharp', 2, 7, today);
    expect(pass.passed).toBe(true);
    expect(pass.state.units).toEqual({ 'csharp-1': 'skipped', 'csharp-2': 'skipped', 'csharp-3': 'skipped' });
    expect(unitUnlocked(pass.state, 'csharp', 3)).toBe(true);
  });

  it('review queue schedules 1/3/7 days and graduates', () => {
    let s = completeLesson(initialState(), 'html-1.L1', ['revealed'], ['html-1.L1.1'], today).state;
    expect(dueReviews(s, today)).toHaveLength(0);
    let day = addDays(today, 1);
    expect(dueReviews(s, day).map((r) => r.id)).toEqual(['html-1.L1.1']);
    s = completeReview(s, [{ id: 'html-1.L1.1', outcome: 'first' }], day).state;
    expect(s.review[0]).toMatchObject({ stage: 1, due: addDays(day, 3) });
    day = addDays(day, 3);
    s = completeReview(s, [{ id: 'html-1.L1.1', outcome: 'hinted' }], day).state;
    expect(s.review[0]).toMatchObject({ stage: 0, due: addDays(day, 1) });
    s = completeReview(s, [{ id: 'html-1.L1.1', outcome: 'first' }], addDays(day, 1)).state;
    s = completeReview(s, [{ id: 'html-1.L1.1', outcome: 'first' }], addDays(day, 4)).state;
    s = completeReview(s, [{ id: 'html-1.L1.1', outcome: 'first' }], addDays(day, 11)).state;
    expect(s.review).toEqual([]);
  });

  it('final exam awards a certificate once and keeps the best score', () => {
    const fail = completeExam(initialState(), 'docker', 16, 20, today);
    expect(fail.passed).toBe(false);
    expect(fail.state.certificates).toEqual({});
    const pass = completeExam(initialState(), 'docker', 17, 20, today);
    expect(pass.passed).toBe(true);
    expect(pass.state.certificates.docker).toEqual({ day: today, score: 17, total: 20 });
    expect(pass.xpGained).toBe(150);
    expect(pass.newBadges.map((b) => b.id)).toContain('cert-docker');
    const again = completeExam(pass.state, 'docker', 19, 20, addDays(today, 3));
    expect(again.state.certificates.docker).toEqual({ day: today, score: 19, total: 20 });
    expect(again.xpGained).toBe(0);
    const worse = completeExam(again.state, 'docker', 18, 20, addDays(today, 4));
    expect(worse.state.certificates.docker!.score).toBe(19);
  });

  it('a track is complete only when every unit is cleared', () => {
    const s = completeSkipTest(initialState(), 'css', 2, 8, today).state;
    expect(trackComplete(s, 'css', 3)).toBe(true);
    expect(trackComplete(s, 'css', 4)).toBe(false);
    expect(trackComplete(initialState(), 'css', 0)).toBe(false);
  });

  it('tool tours pay XP, and half on a replay', () => {
    const first = completeTour(initialState(), 'docker-tour1', ['first', 'hinted', 'revealed'], today);
    expect(first.state.tours['docker-tour1']).toBe(true);
    expect(first.xpGained).toBe(10 + 5 + 20);
    expect(completeTour(first.state, 'docker-tour1', ['first'], today).xpGained).toBe(15);
  });
});
