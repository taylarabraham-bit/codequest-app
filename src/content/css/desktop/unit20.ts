import type { DesktopUnit } from '../../../engine/types';

// Desktop edition: write-the-code challenges for CSS unit 20 (Capstone: a responsive site).
// lessons[i] runs after lesson i + 1. See docs/CONTENT_GUIDE.md.

const GENERIC = '(serif|sans-serif|monospace|system-ui|ui-serif|ui-sans-serif|ui-monospace|ui-rounded)';

// A small landing page for a coffee roastery, reused across the capstone.
const HEADER =
  '<header class="site-header"><strong class="logo">☕ Ember Roasters</strong><ul class="nav" style="list-style:none;margin:0;padding:0"><li><a href="#beans">Beans</a></li><li><a href="#subscribe">Subscribe</a></li><li><a href="#visit">Visit</a></li></ul></header>';
const HERO =
  '<section class="hero"><div><h1>Fresh beans, roasted Tuesday</h1><p>Small batches from three farms we know by name.</p></div><div style="font-size:48px">🫘🔥</div></section>';
const FEATURES =
  '<section class="features"><div class="feature">🌱 Organic</div><div class="feature">🚚 Free delivery</div><div class="feature">♻️ Compostable bags</div><div class="feature">⭐ 4.9 rating</div></section>';
const PRICING =
  '<section class="pricing"><div class="plan" style="border:1px solid #ccc;padding:12px"><h3 style="margin:0">Monthly bag</h3><p style="margin:0">$18 / month</p><button>Subscribe</button></div></section>';
const BUTTONS =
  '<nav><a class="nav__link" href="#" aria-current="page">Home</a> · <a class="nav__link" href="#">Beans</a></nav><p><button class="btn">Order now</button> <button class="btn" disabled>Sold out</button></p>';
const FORM =
  '<form><label><input type="checkbox" checked> Grind for me</label><br><input type="range"></form>';

const unit: DesktopUnit = {
  lessons: [
    // L1 Tokens & base type
    [
      {
        kind: 'write',
        prompt: 'Set up the roastery’s tokens and base type.',
        starter: '',
        solution:
          ':root {\n  --brand: oklch(0.55 0.15 45);\n  --space-3: 1rem;\n  --step-4: clamp(1.8rem, 1.2rem + 3vw, 3rem);\n}\nbody {\n  font-family: system-ui, sans-serif;\n  line-height: 1.5;\n}\nh1 {\n  font-size: var(--step-4);\n}',
        checks: [
          { label: 'A --brand color token on :root', re: ':root\\s*\\{[^}]*--brand\\s*:\\s*\\S', flags: 'i' },
          { label: 'A spacing token like --space-3', re: ':root\\s*\\{[^}]*--space-[\\w-]+\\s*:\\s*[\\d.]', flags: 'i' },
          { label: 'A fluid heading-size token with clamp()', re: '--[\\w-]+\\s*:\\s*clamp\\(', flags: 'i' },
          { label: 'body font stack ending in a generic', re: `body\\s*\\{[^}]*font-family\\s*:[^;}]*\\b${GENERIC}\\s*(;|\\})`, flags: 'i' },
          { label: 'A unitless body line-height', re: 'body\\s*\\{[^}]*line-height\\s*:\\s*[\\d.]+\\s*(;|\\})', flags: 'i' },
          { label: 'The h1 font-size reads the clamp token', re: 'h1\\s*\\{[^}]*font-size\\s*:\\s*var\\(\\s*--', flags: 'i' },
        ],
        hint: 'Tokens first on :root, then body, then h1 using var().',
        explain: 'Every rule after this reads the tokens, so the whole site can be retuned from :root.',
        preview: { html: HEADER + HERO },
      },
      {
        kind: 'write',
        prompt: 'Write the base layer under these tokens: box sizing, body, and balanced headings.',
        starter: ':root {\n  --brand: oklch(0.55 0.15 45);\n  --text: #2b211a;\n  --step-4: clamp(1.8rem, 1.2rem + 3vw, 3rem);\n}\n',
        solution:
          ':root {\n  --brand: oklch(0.55 0.15 45);\n  --text: #2b211a;\n  --step-4: clamp(1.8rem, 1.2rem + 3vw, 3rem);\n}\n*, *::before, *::after {\n  box-sizing: border-box;\n}\nbody {\n  margin: 0;\n  font-family: system-ui, sans-serif;\n  line-height: 1.5;\n  color: var(--text);\n}\nh1 {\n  font-size: var(--step-4);\n  color: var(--brand);\n}\nh1, h2 {\n  text-wrap: balance;\n}',
        checks: [
          { label: 'box-sizing: border-box on everything', re: '\\*[^{]*\\{[^}]*box-sizing\\s*:\\s*border-box', flags: 'i' },
          { label: 'body text color from var(--text)', re: 'body\\s*\\{[^}]*(?<![\\w-])color\\s*:\\s*var\\(\\s*--text\\s*\\)', flags: 'i' },
          { label: 'body has a font-family', re: 'body\\s*\\{[^}]*font-family\\s*:\\s*\\S', flags: 'i' },
          { label: 'h1 size from var(--step-4)', re: 'h1[^{]*\\{[^}]*font-size\\s*:\\s*var\\(\\s*--step-4\\s*\\)', flags: 'i' },
          { label: 'Balanced heading wrap', re: 'h[1-6][^{]*\\{[^}]*text-wrap(-style)?\\s*:\\s*balance', flags: 'i' },
        ],
        hint: 'Start with *, *::before, *::after { box-sizing: border-box; }.',
        explain: 'A base layer sets sane defaults once, so components only add what makes them different.',
        preview: { html: HEADER + HERO },
      },
    ],
    // L2 Layout with grid & flex
    [
      {
        kind: 'write',
        prompt: 'Lay out the header: logo left, nav right, links in a row.',
        starter: '',
        solution:
          '.site-header {\n  display: flex;\n  justify-content: space-between;\n  align-items: center;\n}\n.nav {\n  display: flex;\n  gap: 1rem;\n}',
        checks: [
          { label: '.site-header is a flex container', re: '\\.site-header\\s*\\{[^}]*display\\s*:\\s*(inline-)?flex', flags: 'i' },
          { label: 'Push logo and nav apart with space-between', re: '\\.site-header\\s*\\{[^}]*justify-content\\s*:\\s*space-between', flags: 'i' },
          { label: '.nav is a flex row', re: '\\.nav\\s*\\{[^}]*display\\s*:\\s*(inline-)?flex', flags: 'i' },
          { label: 'A gap between the links', re: '\\.nav\\s*\\{[^}]*(?<![\\w-])(column-)?gap\\s*:\\s*\\S', flags: 'i' },
        ],
        hint: 'Flexbox suits one row: display: flex, then justify-content on the header.',
        explain: 'space-between puts the free room between logo and nav; gap spaces the links evenly.',
        preview: { html: HEADER },
      },
      {
        kind: 'write',
        prompt: 'Grid the hero into two columns and wrap the feature cards with no media query.',
        starter: ':root {\n  --space-4: 1.5rem;\n}\n',
        solution:
          ':root {\n  --space-4: 1.5rem;\n}\n.hero {\n  display: grid;\n  grid-template-columns: 3fr 2fr;\n  align-items: center;\n}\n.features {\n  display: grid;\n  grid-template-columns: repeat(auto-fit, minmax(10rem, 1fr));\n  gap: var(--space-4);\n}',
        checks: [
          { label: '.hero is a grid', re: '\\.hero\\s*\\{[^}]*display\\s*:\\s*grid', flags: 'i' },
          { label: 'Two hero columns', re: '\\.hero\\s*\\{[^}]*grid-template-columns\\s*:\\s*(repeat\\(\\s*2\\s*,|[^\\s;}]+\\s+[^\\s;}]+\\s*(;|\\}))', flags: 'i' },
          { label: '.features is a grid', re: '\\.features\\s*\\{[^}]*display\\s*:\\s*grid', flags: 'i' },
          { label: 'repeat(auto-fit, minmax(…, 1fr))', re: 'repeat\\(\\s*auto-(fit|fill)\\s*,\\s*minmax\\(\\s*[^,]+,\\s*1fr\\s*\\)\\s*\\)', flags: 'i' },
          { label: 'The gap reads var(--space-4)', re: '\\.features\\s*\\{[^}]*gap\\s*:\\s*var\\(\\s*--space-4\\s*\\)', flags: 'i' },
        ],
        hint: 'minmax(10rem, 1fr) lets each card shrink to 10rem before the row wraps.',
        explain: 'auto-fit makes as many columns as fit, so the cards reflow on any screen without breakpoints.',
        preview: { html: HERO + FEATURES },
      },
    ],
    // L3 Breakpoints & container queries
    [
      {
        kind: 'write',
        prompt: 'Stack the hero on phones, then go two columns from 48rem up.',
        starter: '',
        solution:
          '.hero {\n  display: grid;\n  gap: 1rem;\n}\n@media (min-width: 48rem) {\n  .hero {\n    grid-template-columns: 3fr 2fr;\n  }\n}',
        checks: [
          { label: 'A base .hero grid before any media query', re: '^(?:(?!@media)[\\s\\S])*\\.hero\\s*\\{[^}]*display\\s*:\\s*grid', flags: 'i' },
          { label: 'A min-width media query', re: '@media\\s*(screen\\s+and\\s*)?\\(\\s*(min-width\\s*:\\s*[\\d.]+[a-z]+|width\\s*>=?\\s*[\\d.]+[a-z]+)\\s*\\)', flags: 'i' },
          { label: 'Inside it, .hero gets two columns', re: '@media[^{]*\\{\\s*\\.hero\\s*\\{[^}]*grid-template-columns\\s*:', flags: 'i' },
          { label: 'No max-width queries (phone first)', not: 'max-width' },
        ],
        hint: 'Write the phone layout with no query, then @media (min-width: 48rem) { … }.',
        explain: 'Mobile first means the small screen gets the simplest CSS, and wider screens add to it.',
        preview: { html: HERO },
      },
      {
        kind: 'write',
        prompt: 'Make the pricing plan go side by side when its container is 30rem wide.',
        starter: '.plan {\n  border: 1px solid #ccc;\n  padding: 1rem;\n}\n',
        solution:
          '.plan {\n  border: 1px solid #ccc;\n  padding: 1rem;\n}\n.pricing {\n  container-type: inline-size;\n}\n@container (min-width: 30rem) {\n  .plan {\n    display: flex;\n    justify-content: space-between;\n    align-items: center;\n  }\n}',
        checks: [
          { label: '.pricing has container-type: inline-size', re: '\\.pricing\\s*\\{[^}]*container(-type)?\\s*:[^;}]*inline-size', flags: 'i' },
          { label: 'An @container width query', re: '@container\\s*([\\w-]+\\s*)?\\(\\s*(min-width\\s*:|(inline-size|width)\\s*>)', flags: 'i' },
          { label: 'Inside it, .plan becomes a flex or grid row', re: '@container[^{]*\\{\\s*\\.plan\\s*\\{[^}]*display\\s*:\\s*(flex|grid)', flags: 'i' },
          { label: 'No @media for this one', not: '@media' },
        ],
        hint: 'Mark the parent as a container first; @container then measures it, not the screen.',
        explain: 'A container query lets the card adapt to wherever it is placed, sidebar or full width.',
        preview: { html: PRICING },
      },
    ],
    // L4 Components, states & motion
    [
      {
        kind: 'write',
        prompt: 'Give the order button hover and focus-visible states with a short transition.',
        starter: '.btn {\n  background: oklch(0.55 0.15 45);\n  color: white;\n}\n',
        solution:
          '.btn {\n  background: oklch(0.55 0.15 45);\n  color: white;\n  transition: background-color 200ms, translate 200ms;\n}\n.btn:hover {\n  background: oklch(0.45 0.15 45);\n  translate: 0 -2px;\n}\n.btn:focus-visible {\n  outline: 3px solid oklch(0.55 0.15 45);\n  outline-offset: 2px;\n}',
        checks: [
          { label: 'A transition on .btn of 100–300ms', re: '\\.btn\\s*\\{[^}]*transition(-duration)?\\s*:[^;}]*(?<![\\d.])(([1-2]\\d\\d|300)ms|0?\\.[1-3]\\d*s)\\b', flags: 'i' },
          { label: 'Name the properties, not transition: all', re: '^(?![\\s\\S]*transition(-property)?\\s*:\\s*all\\b)', flags: 'i' },
          { label: 'A :hover rule that changes something', re: '\\.btn:hover\\s*\\{[^}]*:', flags: 'i' },
          { label: 'A :focus-visible outline', re: '\\.btn:focus-visible\\s*\\{[^}]*outline(-color|-style|-width)?\\s*:', flags: 'i' },
        ],
        hint: 'transition: background-color 200ms, translate 200ms; then change those on :hover.',
        explain: 'Short, named transitions feel snappy, and :focus-visible shows keyboard users where they are.',
        preview: { html: BUTTONS },
      },
      {
        kind: 'write',
        prompt: 'Add the current-page link, disabled button and reduced-motion states.',
        starter: '.btn {\n  transition: background-color 200ms, translate 200ms;\n}\n.btn:hover {\n  translate: 0 -2px;\n}\n',
        solution:
          '.btn {\n  transition: background-color 200ms, translate 200ms;\n}\n.btn:hover {\n  translate: 0 -2px;\n}\n.nav__link[aria-current="page"] {\n  font-weight: bold;\n  text-decoration: underline;\n}\n.btn:disabled {\n  opacity: 0.5;\n  cursor: not-allowed;\n  translate: none;\n}\n@media (prefers-reduced-motion: reduce) {\n  .btn {\n    transition: none;\n  }\n}',
        checks: [
          { label: 'Style [aria-current="page"]', re: '\\[\\s*aria-current\\s*=\\s*["\']?page["\']?\\s*\\]\\s*\\{[^}]*:', flags: 'i' },
          { label: 'Style .btn:disabled', re: ':disabled\\s*\\{[^}]*(opacity|cursor|background|color)', flags: 'i' },
          { label: 'Turn the transition off for prefers-reduced-motion: reduce', re: 'prefers-reduced-motion\\s*:\\s*reduce\\s*\\)\\s*\\{[^@]*transition(-duration)?\\s*:\\s*(none|0m?s)', flags: 'i' },
        ],
        hint: 'Attribute selectors look like [aria-current="page"]. Motion settings live in a media query.',
        explain: 'The component owns all its states, and people who ask for less motion get the same button, still.',
        preview: { html: BUTTONS },
      },
    ],
    // L5 Dark mode & polish
    [
      {
        kind: 'write',
        prompt: 'Make the site follow the device theme and tint its form controls.',
        starter: '',
        solution:
          ':root {\n  color-scheme: light dark;\n  --bg: light-dark(#fffaf3, #1b1714);\n  --text: light-dark(#2b211a, #f3ece4);\n  --brand: oklch(0.6 0.15 45);\n}\nbody {\n  background: var(--bg);\n  color: var(--text);\n  accent-color: var(--brand);\n}',
        checks: [
          { label: 'color-scheme: light dark', re: 'color-scheme\\s*:\\s*(light\\s+dark|dark\\s+light)', flags: 'i' },
          { label: 'Background and text tokens with light-dark()', re: '(--[\\w-]+\\s*:\\s*light-dark\\([\\s\\S]*){2}', flags: 'i' },
          { label: 'body uses the tokens', re: 'body\\s*\\{(?=[^}]*background(-color)?\\s*:\\s*var\\(--)[^}]*(?<![\\w-])color\\s*:\\s*var\\(--', flags: 'i' },
          { label: 'accent-color for the form controls', re: 'accent-color\\s*:\\s*\\S', flags: 'i' },
        ],
        hint: 'light-dark(light, dark) inside each token, after color-scheme allows both.',
        explain: 'The page flips with the device, and accent-color brings the checkboxes along.',
        preview: { html: FORM },
      },
      {
        kind: 'write',
        prompt: 'Polish the page: sticky header, safe smooth scrolling, and room for the header.',
        starter: ':root {\n  --header-h: 4rem;\n}\n',
        solution:
          ':root {\n  --header-h: 4rem;\n}\n.site-header {\n  position: sticky;\n  top: 0;\n  block-size: var(--header-h);\n}\nhtml {\n  scroll-padding-top: var(--header-h);\n}\n@media (prefers-reduced-motion: no-preference) {\n  html {\n    scroll-behavior: smooth;\n  }\n}',
        checks: [
          { label: 'A sticky .site-header at top: 0', re: '\\.site-header\\s*\\{(?=[^}]*position\\s*:\\s*sticky)[^}]*(?<![\\w-])(top|inset-block-start)\\s*:\\s*0', flags: 'i' },
          { label: 'scroll-padding-top on html', re: 'html\\s*\\{[^}]*scroll-padding(-top|-block-start|-block)?\\s*:\\s*\\S', flags: 'i' },
          {
            label: 'Smooth scrolling only without reduced motion',
            re: 'prefers-reduced-motion\\s*:\\s*no-preference\\s*\\)\\s*\\{[^@]*scroll-behavior\\s*:\\s*smooth|prefers-reduced-motion\\s*:\\s*reduce\\s*\\)\\s*\\{[^@]*scroll-behavior\\s*:\\s*auto',
            flags: 'i',
          },
        ],
        hint: 'Use the --header-h token for scroll-padding-top so jumps land below the header.',
        explain: 'In-page links now glide (for those who want it) and stop just below the sticky header.',
        preview: { html: HEADER + '<p><a href="#visit">Visit us</a></p><div style="height:400px"></div><h2 id="visit">Visit</h2><div style="height:400px"></div>' },
      },
    ],
  ],
};

export default unit;
