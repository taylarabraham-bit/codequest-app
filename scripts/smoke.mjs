// Browser smoke test: plays HTML lesson 1 at phone size against the dev
// server, making one deliberate mistake, then checks results + persistence.
// Usage: npm run dev (port 5180) then `node scripts/smoke.mjs [outDir]`.
import { chromium } from 'playwright';

const out = process.argv[2] ?? 'smoke-shots';
const url = process.env.URL ?? 'http://127.0.0.1:5180/';
const browser = await chromium.launch({ executablePath: process.env.CHROMIUM ?? undefined });
const page = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, hasTouch: true });
const errors = [];
page.on('pageerror', (e) => errors.push(e.message));
page.on('dialog', (d) => d.accept());
const shot = (n) => page.screenshot({ path: `${out}/${n}.png` });

await page.goto(url);
await page.waitForFunction(() => window.__cq);
// First launch: the intro, then a daily goal, then home.
await shot('00-onboarding');
await page.getByRole('button', { name: 'Next', exact: true }).click();
await page.getByRole('button', { name: 'Next', exact: true }).click();
await page.getByRole('button', { name: 'Get started', exact: true }).click();
await page.getByRole('radio', { name: /Serious/ }).click();
await shot('00-goal');
await page.getByRole('button', { name: /look around first/ }).click();
await shot('01-home');
await page.getByRole('button', { name: /HTML/ }).click();
await shot('02-map');
await page.locator('.node').first().click();
await shot('03-concept');
await page.getByRole('button', { name: "Let's go" }).click();

// Clicks the first matching element whose text is exactly t (regex locators
// break on tokens containing quotes, so match by index instead).
async function clickExact(sel, t) {
  const k = await page.evaluate(([sel, t]) => [...document.querySelectorAll(sel)].findIndex((b) => b.textContent === t), [sel, t]);
  if (k < 0) throw new Error(`no ${sel} with text ${t}`);
  await page.locator(sel).nth(k).click();
}

async function solve(ex, id) {
  if (ex.kind === 'fill') {
    for (let i = 0; i < ex.blanks.length; i++) {
      const b = ex.blanks[i];
      if (b.options) {
        await page.getByRole('button', { name: `Blank ${i + 1}` }).click();
        await clickExact('.chip:not(.used)', b.answer[0]);
      } else await page.getByLabel(`Blank ${i + 1}`).fill(b.answer[0]);
    }
  } else if (ex.kind === 'build') {
    for (const t of ex.answer) await clickExact('.chips .chip:not(.used)', t);
  } else if (ex.kind === 'order') {
    for (const l of ex.lines) {
      const k = await page.evaluate(
        (l) => [...document.querySelectorAll('button.line-btn:not(.placed)')].findIndex((b) => b.textContent === l),
        l,
      );
      await page.locator('button.line-btn:not(.placed)').nth(k).click();
    }
  } else if (ex.kind === 'fix') {
    const bug = await page.evaluate(([code, t]) => window.__cq.parseFixCode(code, t).bugIndex, [ex.code, id.split('-')[0]]);
    await page.locator('.scroll .code > span').nth(bug).click();
    await clickExact('.chip:not(.used)', ex.fix);
  } else if (ex.kind === 'type') {
    await page.locator('.type-input').fill(ex.accept[0]);
  }
}

let missed = false;
// ids: the exercise ids in order, or a count when the order is random (exams).
async function playSession(ids) {
  const n = typeof ids === 'number' ? ids : ids.length;
  for (let i = 0; i < n; i++) {
    const id = typeof ids === 'number' ? await page.locator('[data-ex]').getAttribute('data-ex') : ids[i];
    const ex = await page.evaluate((id) => window.__cq.getExercise(id).exercise, id);
    if (ex.kind === 'build' && !missed) {
      missed = true;
      // Deliberate miss: submit a one-token build (always wrong), expect the hint.
      await page.locator('.chips .chip:not(.used)').first().click();
      await page.getByRole('button', { name: 'Check', exact: true }).click();
      await page.locator('.actionbar.hint').waitFor();
      await shot('05-hint');
      await page.locator('.dropzone .chip').first().click();
    }
    await solve(ex, id);
    if (id === 'html-1.L1.1') await shot('04-exercise');
    await page.getByRole('button', { name: 'Check', exact: true }).click();
    await page.locator('.actionbar.good').waitFor({ timeout: 3000 }).catch(async () => {
      await shot(`fail-${id}`);
      throw new Error(`exercise ${id} (${ex.kind}) not accepted`);
    });
    if (id === 'html-1.L1.1') await shot('06-correct');
    if (ex.output && !shotOutput) {
      shotOutput = true;
      await shot('10-csharp-output');
    }
    if (ex.kind === 'fix' && !shotFix) {
      shotFix = true;
      await shot('11-fix');
    }
    await page.getByRole('button', { name: 'Continue', exact: true }).click();
  }
}
let shotOutput = false;
let shotFix = false;

await playSession(Array.from({ length: 7 }, (_, i) => `html-1.L1.${i + 1}`));
await page.getByText(/XP/).first().waitFor();
await shot('07-results');
await page.getByRole('button', { name: 'Continue', exact: true }).click();
await page.reload();
await page.locator('.track-card:not(.continue)').filter({ hasText: 'Structure every web page' }).click();
const done = await page.locator('.node.done').count();
await shot('08-map-after');
await page.goto(url);
await page.getByRole('button', { name: 'Profile', exact: true }).click();
await shot('09-profile');
if (process.env.ALL) {
  // Play every written lesson and boss of every track through the UI.
  const names = { html: 'HTML', css: 'CSS', csharp: 'C#', aspnet: 'ASP.NET', blazor: 'Blazor', docker: 'Docker', ollama: 'Ollama' };
  for (const track of (process.env.TRACKS ?? Object.keys(names).join(',')).split(',')) {
    await page.goto(url);
    await page.waitForFunction(() => window.__cq);
    await page.locator('.track-card:not(.continue)').filter({ has: page.getByText(names[track], { exact: true }) }).first().click();
    for (let u = 1; ; u++) {
      if (!(await page.evaluate((id) => !!window.__cq.getExercise(id), `${track}-${u}.L1.1`))) break;
      for (let l = 1; l <= 6; l++) {
        if (`${track}-${u}.L${l}` === 'html-1.L1') continue;
        await page.locator('.unit').nth(u - 1).locator('.node').nth(l - 1).click();
        if (l <= 5) await page.getByRole('button', { name: "Let's go" }).click();
        const n = l <= 5 ? 7 : 10;
        await playSession(Array.from({ length: n }, (_, i) => `${track}-${u}.${l <= 5 ? 'L' + l : 'boss'}.${i + 1}`));
        if (u === 1 && l === 6 && track === 'csharp') await shot('12-boss-results');
        await page.getByRole('button', { name: 'Continue', exact: true }).click();
      }
      console.log(`played ${track} unit ${u}`);
    }
    const exam = page.getByRole('button', { name: 'Final exam', exact: true });
    if (await exam.isEnabled()) {
      await exam.click();
      await playSession(20);
      await page.getByText('Certified!').waitFor();
      await page.getByRole('button', { name: 'Continue', exact: true }).click();
      await page.locator('.certificate').waitFor();
      await page.waitForTimeout(500); // let the pop animation finish
      await shot(`14-certificate-${track}`);
      console.log(`passed ${track} final exam`);
    }
  }
  await page.goto(url);
  await shot('13-home-after-all');
}
await browser.close();
if (done < 1) throw new Error('progress not saved across reload');
if (errors.length) throw new Error('page errors: ' + errors.join('; '));
console.log('smoke OK');
