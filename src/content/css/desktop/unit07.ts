import type { DesktopUnit } from '../../../engine/types';

// Desktop edition: write-the-code challenges for CSS unit 7 (Responsive design).
// lessons[i] runs after lesson i + 1. See docs/CONTENT_GUIDE.md.

// A 400×200 stand-in photo as an inline SVG (same as unit07.ts), so images
// show in the preview without a network request.
const PHOTO =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='200' viewBox='0 0 400 200' preserveAspectRatio='none'%3E%3Crect width='400' height='200' fill='%2387ceeb'/%3E%3Ccircle cx='200' cy='90' r='45' fill='%23fc3'/%3E%3Crect y='150' width='400' height='50' fill='%233a5'/%3E%3C/svg%3E";
const img = (attrs: string) => `<img ${attrs} src="${PHOTO}">`;

// "(max-width: 600px)" or the range form "(width <= 600px)".
const maxW = (px: number) => `\\(\\s*(max-width\\s*:\\s*${px}px|width\\s*<=\\s*${px}px)\\s*\\)`;
// "(min-width: 900px)" or "(width >= 900px)".
const minW = (px: number) => `\\(\\s*(min-width\\s*:\\s*${px}px|width\\s*>=\\s*${px}px|${px}px\\s*<=\\s*width)\\s*\\)`;

const unit: DesktopUnit = {
  lessons: [
    // L1 Viewport units
    [
      {
        kind: 'write',
        prompt: 'Make a full-screen hero: as tall as the viewport, heading sized by width.',
        starter: '',
        solution: '.hero {\n  min-height: 100dvh;\n  background-color: midnightblue;\n  color: white;\n}\n.hero h1 {\n  font-size: 8vw;\n}',
        checks: [
          { label: '.hero is 100vh or 100dvh tall', re: '\\.hero\\s*\\{[^}]*(?<![\\w-])(min-)?height\\s*:\\s*100(d|s|l)?vh', flags: 'i' },
          { label: 'The h1 font-size in vw', re: 'h1\\s*\\{[^}]*font-size\\s*:\\s*\\d*\\.?\\d+vw', flags: 'i' },
        ],
        hint: '1vh is 1% of the viewport’s height and 1vw 1% of its width.',
        explain: 'A vw font grows and shrinks with the screen; 100dvh fills the height you can actually see.',
        preview: { html: '<section class="hero"><h1>Night Market</h1><p>Every Friday, 6pm–midnight</p></section>' },
      },
      {
        kind: 'write',
        prompt: 'Fix the phone splash with dvh, and make the drawer 80% of the screen wide.',
        starter: '.splash {\n  height: 100vh;\n  background-color: tomato;\n}\n.drawer {\n  width: 300px;\n  background-color: white;\n}',
        solution: '.splash {\n  height: 100dvh;\n  background-color: tomato;\n}\n.drawer {\n  width: 80vw;\n  background-color: white;\n}',
        checks: [
          { label: '.splash height: 100dvh', re: '\\.splash\\s*\\{[^}]*(?<![\\w-])(min-)?height\\s*:\\s*100dvh', flags: 'i' },
          { label: '.drawer width: 80vw', re: '\\.drawer\\s*\\{[^}]*(?<![\\w-])width\\s*:\\s*80vw', flags: 'i' },
        ],
        hint: 'vh ignores the phone’s sliding address bar; dvh tracks it. Width in viewport units is vw.',
        explain: '100dvh is the height you can see right now, so the bottom of the splash never hides behind the browser bar.',
        preview: { html: '<div class="splash"><div class="drawer">Menu<br>Profile<br>Settings</div><p>Tap to start</p></div>' },
      },
    ],
    // L2 Fluid media
    [
      {
        kind: 'write',
        prompt: 'Make the post images shrink to fit their column and keep their shape.',
        starter: '',
        solution: 'img {\n  max-width: 100%;\n  height: auto;\n}',
        checks: [
          { label: 'max-width: 100%', re: 'img\\s*\\{[^}]*max-width\\s*:\\s*100%', flags: 'i' },
          { label: 'height: auto', re: 'img\\s*\\{[^}]*(?<![\\w-])height\\s*:\\s*auto', flags: 'i' },
        ],
        hint: 'One property stops the image getting wider than its box, the other keeps its proportions.',
        explain: 'max-width: 100% lets the image shrink; height: auto scales the height along so it doesn’t squash.',
        preview: {
          html: `<div style="width:220px;border:1px solid #ccc;padding:6px"><h3>Hike day</h3>${img('alt="Hills" width="400" height="200"')}<p>12 km, two lakes.</p></div>`,
        },
      },
      {
        kind: 'write',
        prompt: 'Crop the thumbnails to squares, and show the whole logo inside its box.',
        starter: '.thumb {\n  width: 120px;\n}\n.logo {\n  width: 200px;\n  height: 60px;\n}',
        solution: '.thumb {\n  width: 120px;\n  aspect-ratio: 1 / 1;\n  object-fit: cover;\n}\n.logo {\n  width: 200px;\n  height: 60px;\n  object-fit: contain;\n}',
        checks: [
          { label: '.thumb is square with aspect-ratio', re: '\\.thumb\\s*\\{[^}]*aspect-ratio\\s*:\\s*1(\\s*\\/\\s*1)?\\s*[;}]', flags: 'i' },
          { label: '.thumb crops with object-fit: cover', re: '\\.thumb\\s*\\{[^}]*object-fit\\s*:\\s*cover', flags: 'i' },
          { label: '.logo shows it all with object-fit: contain', re: '\\.logo\\s*\\{[^}]*object-fit\\s*:\\s*contain', flags: 'i' },
        ],
        hint: 'aspect-ratio: 1 / 1 makes a square. cover crops to fill; contain fits the whole image in.',
        explain: 'object-fit decides how an image fills a box of a different shape: cover crops, contain letterboxes.',
        preview: { html: `${img('class="thumb" alt="Thumb 1"')} ${img('class="thumb" alt="Thumb 2"')}<br>${img('class="logo" alt="Logo" style="background:#eee"')}` },
      },
    ],
    // L3 Media queries
    [
      {
        kind: 'write',
        prompt: 'Hide the sidebar on screens 600px wide or less.',
        starter: '',
        solution: '@media (max-width: 600px) {\n  .sidebar {\n    display: none;\n  }\n}',
        checks: [
          { label: 'A query for 600px or less', re: `@media\\s*${maxW(600)}`, flags: 'i' },
          { label: 'Inside it, .sidebar gets display: none', re: '@media[^{]*\\{\\s*([^{}]*\\{[^{}]*\\}\\s*)*\\.sidebar\\s*\\{[^}]*display\\s*:\\s*none', flags: 'i' },
        ],
        hint: '@media (max-width: 600px) { … } and inside it a whole rule with selector and braces.',
        explain: 'Rules inside the query only apply when the viewport is 600px or narrower.',
        preview: { html: '<div class="sidebar" style="background:#e5e7eb;padding:6px">Ads and links</div><main>Article text goes here.</main>' },
      },
      {
        kind: 'write',
        prompt: 'At 700px or less, stack the columns and shrink the heading.',
        starter: '.cols {\n  display: flex;\n  gap: 16px;\n}\nh1 {\n  font-size: 2.5rem;\n}',
        solution:
          '.cols {\n  display: flex;\n  gap: 16px;\n}\nh1 {\n  font-size: 2.5rem;\n}\n@media (max-width: 700px) {\n  .cols {\n    flex-direction: column;\n  }\n  h1 {\n    font-size: 1.6rem;\n  }\n}',
        checks: [
          { label: 'A query for 700px or less', re: `@media\\s*${maxW(700)}`, flags: 'i' },
          { label: 'Inside it, .cols becomes a column', re: '@media[^{]*\\{[\\s\\S]*\\.cols\\s*\\{[^}]*flex-direction\\s*:\\s*column', flags: 'i' },
          { label: 'Inside it, h1 gets a smaller font-size', re: '@media[^{]*\\{[\\s\\S]*h1\\s*\\{[^}]*font-size\\s*:', flags: 'i' },
          { label: 'The @media block comes after the base rules', re: 'font-size\\s*:\\s*2\\.5rem[\\s\\S]*@media', flags: 'i' },
        ],
        hint: 'A query adds no specificity, so it must come after the rules it overrides.',
        explain: 'On a tie the later rule wins, so the small-screen overrides go at the bottom.',
        preview: {
          html: '<h1>Weekend Plans</h1><div class="cols"><div style="background:#fef3c7;padding:6px">Saturday: market</div><div style="background:#dbeafe;padding:6px">Sunday: beach</div></div>',
        },
      },
    ],
    // L4 Mobile-first breakpoints
    [
      {
        kind: 'write',
        prompt: 'Mobile first: one column of cards by default, three columns from 900px.',
        starter: '',
        solution:
          '.cards {\n  display: grid;\n  gap: 12px;\n}\n@media (min-width: 900px) {\n  .cards {\n    grid-template-columns: repeat(3, 1fr);\n  }\n}',
        checks: [
          { label: 'Base .cards rule is a grid', re: '^\\s*\\.cards\\s*\\{[^}]*display\\s*:\\s*grid', flags: 'i' },
          { label: 'A min-width query at 900px', re: `@media\\s*${minW(900)}`, flags: 'i' },
          { label: 'Inside it, three columns', re: '@media[^{]*\\{[\\s\\S]*grid-template-columns\\s*:\\s*(repeat\\(\\s*3\\s*,|\\S+\\s+\\S+\\s+\\S+\\s*[;}])', flags: 'i' },
          { label: 'No max-width query', not: 'max-width' },
        ],
        hint: 'Plain rules are for phones. Add columns inside @media (min-width: 900px).',
        explain: 'A grid with no template has one column; the min-width query adds more only on wide screens.',
        preview: { html: `<div class="cards">${['Plan A', 'Plan B', 'Plan C'].map((p) => `<div style="background:#eef;padding:12px">${p}</div>`).join('')}</div>` },
      },
      {
        kind: 'write',
        prompt: 'Rewrite this desktop-first nav as mobile-first, with a min-width query.',
        starter: '.nav {\n  display: flex;\n  justify-content: space-between;\n}\n@media (max-width: 767px) {\n  .nav {\n    display: block;\n  }\n}',
        solution: '.nav {\n  display: block;\n}\n@media (width >= 768px) {\n  .nav {\n    display: flex;\n    justify-content: space-between;\n  }\n}',
        checks: [
          { label: 'The base .nav is display: block', re: '^\\s*\\.nav\\s*\\{[^}]*display\\s*:\\s*block', flags: 'i' },
          {
            label: 'A query for 768px and up',
            re: `@media\\s*(${minW(768)}|\\(\\s*width\\s*>\\s*767px\\s*\\))`,
            flags: 'i',
          },
          { label: 'Inside it, .nav is display: flex', re: '@media[^{]*\\{\\s*\\.nav\\s*\\{[^}]*display\\s*:\\s*flex', flags: 'i' },
          { label: 'No max-width query left', not: 'max-width' },
        ],
        hint: 'Swap the roles: the phone layout becomes the plain rule, the wide layout goes in the query.',
        explain: 'min-width: 768px (or width >= 768px) covers exactly the screens the old max-width: 767px skipped.',
        preview: { html: '<nav class="nav"><a href="#">Home</a> <a href="#">Shop</a> <a href="#">Cart (2)</a></nav>' },
      },
    ],
    // L5 Dark mode queries
    [
      {
        kind: 'write',
        prompt: 'Give the notes page dark colors when the device is in dark mode.',
        starter: '',
        solution: '@media (prefers-color-scheme: dark) {\n  body {\n    background-color: #111;\n    color: #eee;\n  }\n}',
        checks: [
          { label: 'A prefers-color-scheme: dark query', re: '@media\\s*\\(\\s*prefers-color-scheme\\s*:\\s*dark\\s*\\)', flags: 'i' },
          { label: 'Inside it, body gets a dark background', re: '@media[^{]*\\{[\\s\\S]*body\\s*\\{[^}]*background(-color)?\\s*:', flags: 'i' },
          { label: 'Inside it, body gets a light text color', re: '@media[^{]*\\{[\\s\\S]*body\\s*\\{[^}]*(?<![\\w-])color\\s*:', flags: 'i' },
        ],
        hint: '@media (prefers-color-scheme: dark) { body { … } }',
        explain: 'The query matches when the system is set to dark, so the page follows the user’s choice.',
        preview: { html: '<h2>Notes</h2><p>Buy stamps. Call Mum. Water the ferns.</p>' },
      },
      {
        kind: 'write',
        prompt: 'Add a dark card theme, plus a glowing border on wide dark screens.',
        starter: '.card {\n  background-color: white;\n  color: #222;\n  border: 1px solid #ddd;\n}',
        solution:
          '.card {\n  background-color: white;\n  color: #222;\n  border: 1px solid #ddd;\n}\n@media (prefers-color-scheme: dark) {\n  .card {\n    background-color: #1f2937;\n    color: #f3f4f6;\n  }\n}\n@media (prefers-color-scheme: dark) and (min-width: 800px) {\n  .card {\n    border-color: cyan;\n  }\n}',
        checks: [
          {
            label: 'Dark mode gives .card a dark background',
            re: '@media\\s*\\(\\s*prefers-color-scheme\\s*:\\s*dark\\s*\\)\\s*\\{\\s*\\.card\\s*\\{[^}]*background(-color)?\\s*:',
            flags: 'i',
          },
          {
            label: 'A query joining dark mode and a min-width with and',
            re: '@media\\s*(\\(\\s*prefers-color-scheme\\s*:\\s*dark\\s*\\)\\s*and\\s*\\(\\s*(min-width\\s*:|width\\s*>)[^)]*\\)|\\(\\s*(min-width\\s*:|width\\s*>)[^)]*\\)\\s*and\\s*\\(\\s*prefers-color-scheme\\s*:\\s*dark\\s*\\))',
            flags: 'i',
          },
          {
            label: 'That query changes the border',
            re: '\\)\\s*and\\s*\\([^)]*\\)\\s*\\{\\s*\\.card\\s*\\{[^}]*border(-color)?\\s*:',
            flags: 'i',
          },
        ],
        hint: 'Join two conditions: @media (prefers-color-scheme: dark) and (min-width: 800px).',
        explain: 'With and, every condition must be true, so the glow only shows on wide screens in dark mode.',
        preview: { html: '<div class="card" style="padding:12px">Battery: 82%</div>' },
      },
    ],
  ],
};

export default unit;
