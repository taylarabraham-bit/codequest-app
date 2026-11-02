// Desktop-edition smoke test: plays lessons by TYPING every answer in the
// 3-pane layout at laptop size, makes one deliberate mistake, plays one tool
// tour per track, then checks progress survives a reload.
// Usage: npm run dev:desktop (port 5181) then `node scripts/smoke-desktop.mjs [outDir]`.
//   ALL=1   also plays every lesson, boss and every tour of every track.
//   TRACKS=docker,ollama  limits ALL to some tracks.
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';

const out = process.argv[2] ?? 'smoke-shots-desktop';
mkdirSync(out, { recursive: true });
const url = process.env.URL ?? 'http://127.0.0.1:5181/';
const browser = await chromium.launch({ executablePath: process.env.CHROMIUM ?? undefined });
const page = await browser.newPage({ viewport: { width: 1366, height: 768 } });
const errors = [];
page.on('pageerror', (e) => errors.push(e.message));
page.on('dialog', (d) => d.accept());
const shot = (n) => page.screenshot({ path: `${out}/${n}.png` });
const NAMES = { html: 'HTML', css: 'CSS', csharp: 'C#', aspnet: 'ASP.NET', blazor: 'Blazor', docker: 'Docker', ollama: 'Ollama' };

await page.goto(url);
await page.waitForFunction(() => window.__cq);
await page.getByRole('button', { name: 'Next', exact: true }).click();
await page.getByRole('button', { name: 'Next', exact: true }).click();
await page.getByRole('button', { name: 'Get started', exact: true }).click();
await page.getByRole('radio', { name: /Serious/ }).click();
await page.getByRole('button', { name: /look around first/ }).click();
await shot('01-home');

const openTrack = (track) => page.locator('.desk-nav').getByRole('button', { name: new RegExp(`^${NAMES[track].replace(/[.#+]/g, '\\$&')}(\\s|$)`) }).click();

async function solve(ex, id, track) {
  const terminal = await page.evaluate(([e, t]) => window.__cq.isTerminalExercise(e, t), [ex, track]);
  const line = ex.kind === 'build' ? await page.evaluate(([a, t]) => window.__cq.joinTokens(a, t), [ex.answer, track]) : ex.kind === 'type' ? ex.accept[0] : '';
  if (ex.kind === 'fill') {
    for (let i = 0; i < ex.blanks.length; i++) await page.getByLabel(`Blank ${i + 1}`, { exact: true }).fill(ex.blanks[i].answer[0]);
  } else if (ex.kind === 'build' || ex.kind === 'type') {
    await page.getByLabel(terminal ? 'Terminal' : 'Your line', { exact: true }).fill(line);
  } else if (ex.kind === 'order') {
    for (let p = 0; p < ex.lines.length; p++) {
      const rows = await page.locator('.order-row .order-code').allTextContents();
      const k = rows.findIndex((r, i) => i >= p && r === ex.lines[p]);
      if (k < 0) throw new Error(`order: line ${JSON.stringify(ex.lines[p])} not found in ${id}: ${JSON.stringify(rows)}`);
      await page.locator('.order-row').nth(k).focus();
      for (let n = k; n > p; n--) await page.keyboard.press('Alt+ArrowUp');
    }
  } else if (ex.kind === 'write') {
    await page.getByLabel('Code editor', { exact: true }).fill(ex.solution);
  } else if (ex.kind === 'fix') {
    const { tokens, bugIndex } = await page.evaluate(([code, t]) => window.__cq.parseFixCode(code, t), [ex.code, track]);
    const nth = tokens.slice(0, bugIndex).filter((t) => !/^\s+$/.test(t)).length;
    await page.locator('.widget .tok-btn').nth(nth).click();
    await page.getByLabel('Replacement', { exact: true }).fill(ex.fix);
  }
}

let missed = false;
// ids: the exercise ids in order, or a count when the order is random (exams).
// Lessons end with the desktop write challenges, so their ids come from the page.
const sessionLength = async () => Number((await page.locator('.desk-top .muted.small').textContent()).split('/')[1]);
async function playLesson(track, u, l) {
  const n = await sessionLength();
  const ids = Array.from({ length: n }, (_, i) => (i < 7 ? `${track}-${u}.L${l}.${i + 1}` : `${track}-${u}.L${l}.W${i - 6}`));
  await playSession(ids, track);
}
async function playSession(ids, track) {
  const n = typeof ids === 'number' ? ids : ids.length;
  for (let i = 0; i < n; i++) {
    const id = typeof ids === 'number' ? await page.locator('[data-ex]').getAttribute('data-ex') : ids[i];
    const ex = await page.evaluate((id) => window.__cq.getExercise(id).exercise, id);
    const t = id.split('-')[0];
    if (!missed && (ex.kind === 'build' || ex.kind === 'type')) {
      // Deliberate miss: a wrong line gets the hint (and the word bank for builds).
      missed = true;
      const field = page.locator('.term-input, .ed-line-input').first();
      await field.fill('wrong');
      await page.keyboard.press('Control+Enter');
      await page.locator('.fb-card.hint').waitFor();
      await shot('05-hint');
    }
    await solve(ex, id, t);
    await page.keyboard.press('Control+Enter');
    await page.locator('.fb-card.good').waitFor({ timeout: 3000 }).catch(async () => {
      await shot(`fail-${id}`);
      throw new Error(`exercise ${id} (${ex.kind}) not accepted`);
    });
    if (!shots.has(`${track}-${ex.kind}`) && shots.size < 40) {
      shots.add(`${track}-${ex.kind}`);
      await shot(`ex-${track}-${ex.kind}`);
    }
    await page.getByRole('button', { name: 'Continue', exact: true }).click();
  }
}
const shots = new Set();

async function playTour(track, i) {
  const tour = await page.evaluate(([t, i]) => window.__cq.toursFor(t)[i], [track, i]);
  await page.locator('.tour-card').nth(i).click();
  for (const [s, step] of tour.steps.entries()) {
    if (step.target) await page.locator(`.mock-wrap [data-target="${step.target}"]`).click();
    else {
      await page.getByLabel('Command', { exact: true }).fill(step.command[0]);
      await page.keyboard.press('Enter');
    }
    await page.locator('.fb-card.good').waitFor({ timeout: 3000 }).catch(async () => {
      await shot(`fail-tour-${track}-${i}-${s}`);
      throw new Error(`tour ${track} ${i} step ${s} not accepted`);
    });
    if (s === tour.steps.length - 1 || s === 2) await shot(`tour-${track}-${i + 1}-step${s + 1}`);
    await page.getByRole('button', { name: 'Continue', exact: true }).click();
  }
  await page.getByText('Tour complete!').waitFor();
  await page.getByRole('button', { name: 'Continue', exact: true }).click();
}

// HTML lesson 1, then progress must survive a reload.
await openTrack('html');
await shot('02-map');
await page.locator('.node').first().click();
await shot('03-lesson');
await playLesson('html', 1, 1);
await page.getByText(/XP/).first().waitFor();
await shot('04-results');
await page.getByRole('button', { name: 'Continue', exact: true }).click();
await page.reload();
await openTrack('html');
const done = await page.locator('.node.done').count();

// First lesson and first tour of every other track.
for (const track of ['css', 'csharp', 'aspnet', 'blazor', 'docker', 'ollama']) {
  await openTrack(track);
  await page.locator('.node').first().click();
  await playLesson(track, 1, 1);
  await page.getByRole('button', { name: 'Continue', exact: true }).click();
  await playTour(track, 0);
  console.log(`played ${track} lesson 1 and tour 1`);
}
await openTrack('html');
await playTour('html', 0);

if (process.env.ALL) {
  for (const track of (process.env.TRACKS ?? Object.keys(NAMES).join(',')).split(',')) {
    await openTrack(track);
    const tours = await page.evaluate((t) => window.__cq.toursFor(t).length, track);
    for (let i = 0; i < tours; i++) await playTour(track, i);
    for (let u = 1; ; u++) {
      if (!(await page.evaluate((id) => !!window.__cq.getExercise(id), `${track}-${u}.L1.1`))) break;
      for (let l = 1; l <= 6; l++) {
        if (u === 1 && l === 1) continue;
        await page.locator('.unit').nth(u - 1).locator('.node').nth(l - 1).click();
        if (l <= 5) await playLesson(track, u, l);
        else await playSession(Array.from({ length: 10 }, (_, i) => `${track}-${u}.boss.${i + 1}`), track);
        await page.getByRole('button', { name: 'Continue', exact: true }).click();
      }
      console.log(`played ${track} unit ${u}`);
    }
    const exam = page.getByRole('button', { name: 'Final exam', exact: true });
    if (await exam.isEnabled()) {
      await exam.click();
      await playSession(20, track);
      await page.getByText('Certified!').waitFor();
      await page.getByRole('button', { name: 'Continue', exact: true }).click();
      console.log(`passed ${track} final exam`);
    }
  }
}
await openTrack('docker');
await shot('09-map-tours');
await browser.close();
if (done < 1) throw new Error('progress not saved across reload');
if (errors.length) throw new Error('page errors: ' + errors.join('; '));
console.log('desktop smoke OK');
