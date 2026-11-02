// Renders the launcher icon and splash images for Android, and the Windows
// app icon (build/icon.png), from vector art.
// Usage: node scripts/icons.mjs  (needs Playwright's Chromium; set CHROMIUM if not found)
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';

const res = 'android/app/src/main/res';
const glyph = (stroke) => `
  <path d="M150 176l-80 80 80 80" fill="none" stroke="#3fb950" stroke-width="${stroke}" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M362 176l80 80-80 80" fill="none" stroke="#a371f7" stroke-width="${stroke}" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M290 130l-68 252" stroke="#58a6ff" stroke-width="${stroke}" stroke-linecap="round"/>`;
const full = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><rect width="512" height="512" fill="#0d1117"/>${glyph(44)}</svg>`;
const round = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><circle cx="256" cy="256" r="256" fill="#0d1117"/>${glyph(44)}</svg>`;
// Adaptive foreground: 108dp canvas, glyph kept inside the 66dp safe zone.
const fg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-176 -176 864 864">${glyph(44)}</svg>`;

const densities = { mdpi: 1, hdpi: 1.5, xhdpi: 2, xxhdpi: 3, xxxhdpi: 4 };
const browser = await chromium.launch({ executablePath: process.env.CHROMIUM ?? undefined });
const page = await browser.newPage();

async function render(svg, size, path, transparent = false) {
  await page.setViewportSize({ width: size, height: size });
  await page.setContent(`<html><body style="margin:0;background:transparent">${svg.replace('<svg ', `<svg width="${size}" height="${size}" `)}</body></html>`);
  await page.screenshot({ path, omitBackground: transparent });
}

for (const [d, k] of Object.entries(densities)) {
  mkdirSync(`${res}/mipmap-${d}`, { recursive: true });
  await render(full, Math.round(48 * k), `${res}/mipmap-${d}/ic_launcher.png`);
  await render(round, Math.round(48 * k), `${res}/mipmap-${d}/ic_launcher_round.png`, true);
  await render(fg, Math.round(108 * k), `${res}/mipmap-${d}/ic_launcher_foreground.png`, true);
}
// Windows desktop app (electron-builder makes the .ico from this).
mkdirSync('build', { recursive: true });
await render(round.replace('<circle cx="256" cy="256" r="256"', '<rect width="512" height="512" rx="96"'), 512, 'build/icon.png', true);
await browser.close();
console.log('icons written');
