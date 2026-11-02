import type { DesktopUnit } from '../../../engine/types';

// Desktop edition: write-the-code challenges for CSS unit 19 (CSS architecture).
// lessons[i] runs after lesson i + 1. See docs/CONTENT_GUIDE.md.

const PROFILE =
  '<div class="profile"><img class="profile__avatar" alt="" src="data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 width=%2748%27 height=%2748%27%3E%3Crect width=%2748%27 height=%2748%27 fill=%27%23fc9%27/%3E%3C/svg%3E"><h3 class="profile__name">Rosa Diaz</h3></div><div class="profile profile--pro"><h3 class="profile__name">Kai Lee ⭐</h3></div>';
const MENU =
  '<nav class="menu"><h4 class="menu__title">Account</h4><ul style="list-style:none;padding:0"><li><a class="menu__link menu__link--active" href="#">Orders</a></li><li><a class="menu__link" href="#">Settings</a></li></ul></nav>';
const CHIPS =
  '<h3 class="text-center">Filter by diet</h3><span class="chip">Vegan</span> <span class="chip">Halal</span> <span class="chip hidden">Paleo</span>';
const ARTICLE =
  '<article class="flow"><h2>Make cold brew</h2><p>Grind the beans coarse.</p><p>Steep overnight in the fridge.</p><button><span class="visually-hidden">Print </span>🖨️</button></article>';
const ALERT = '<div class="alert">✅ Backup finished.</div>';
const BRAND = '<button class="btn" style="color:#fff;border:0;padding:8px 14px">Upgrade</button> <a class="link" href="#">Compare plans</a>';
const PAGE =
  '<h1>Garden Club</h1><p class="intro">Meet every Tuesday.</p><ul><li>Seed swap</li><li>Compost talk</li></ul>';
const WIDGET =
  '<aside id="sidebar"><div class="widget"><ul><li><a class="widget__link" href="#">Latest posts</a></li><li><a class="widget__link" href="#">Archive</a></li></ul></div></aside>';
const ACCORDION =
  '<div class="accordion"><button class="accordion__toggle" aria-expanded="true">Shipping <span class="accordion__icon">▸</span></button><div class="accordion__panel" data-state="open">Free over $50.</div></div><div role="tablist"><button class="tab" role="tab" aria-selected="true" style="border:2px solid #ccc">Reviews</button> <button class="tab" role="tab" aria-selected="false" style="border:2px solid #ccc">Specs</button></div>';

const unit: DesktopUnit = {
  lessons: [
    // L1 BEM naming
    [
      {
        kind: 'write',
        prompt: 'Style the profile card with the BEM classes in the markup.',
        starter: '',
        solution:
          '.profile {\n  padding: 1rem;\n  border: 1px solid #ccc;\n}\n.profile__avatar {\n  border-radius: 50%;\n}\n.profile__name {\n  font-size: 1.25rem;\n}\n.profile--pro {\n  border-color: gold;\n}',
        checks: [
          { label: 'A .profile block rule', re: '\\.profile\\s*\\{[^}]*:', flags: 'i' },
          { label: 'Rules for its elements, like .profile__name', re: '\\.profile__(name|avatar)\\s*\\{[^}]*:', flags: 'i' },
          { label: 'A .profile--pro modifier rule', re: '\\.profile--pro\\s*\\{[^}]*:', flags: 'i' },
          { label: 'Flat selectors: no .profile .something nesting', re: '^(?![\\s\\S]*\\.profile[\\w-]*\\s+[.#\\w])', flags: 'i' },
        ],
        hint: 'Every selector is one class: block, block__element, block--modifier.',
        explain: 'Flat BEM classes all score the same, so the modifier wins just by coming later.',
        preview: { html: PROFILE },
      },
      {
        kind: 'write',
        prompt: 'Rewrite the nested menu selectors as flat BEM classes from the markup.',
        starter: '.menu ul li a { color: #333; }\n.menu ul li a.active { color: teal; }\n.menu h4 { font-weight: bold; }\n',
        solution:
          '.menu__link {\n  color: #333;\n}\n.menu__link--active {\n  color: teal;\n}\n.menu__title {\n  font-weight: bold;\n}',
        checks: [
          { label: '.menu__link sets the color', re: '\\.menu__link\\s*\\{[^}]*color\\s*:', flags: 'i' },
          { label: '.menu__link--active sets the active color', re: '\\.menu__link--active\\s*\\{[^}]*color\\s*:', flags: 'i' },
          { label: '.menu__title is bold', re: '\\.menu__title\\s*\\{[^}]*font-weight\\s*:', flags: 'i' },
          { label: 'No .menu ul li a chain', not: '.menu ul' },
          { label: 'No .menu h4', not: '.menu h4' },
        ],
        hint: 'Look at the class names in the HTML: menu__title, menu__link, menu__link--active.',
        explain: 'Single classes don’t break when the markup changes, and they are easy to override.',
        preview: { html: MENU },
      },
    ],
    // L2 Components & utilities
    [
      {
        kind: 'write',
        prompt: 'Write a .chip component plus .text-center and .hidden utilities.',
        starter: '',
        solution:
          '.chip {\n  display: inline-block;\n  padding: 0.25rem 0.75rem;\n  border-radius: 999px;\n  background: #eef;\n}\n.text-center {\n  text-align: center;\n}\n.hidden {\n  display: none;\n}',
        checks: [
          { label: 'A .chip component with at least three declarations', re: '\\.chip\\s*\\{([^}]*;){2}[^}]*:', flags: 'i' },
          { label: '.text-center sets text-align: center', re: '\\.text-center\\s*\\{[^}]*text-align\\s*:\\s*center', flags: 'i' },
          { label: '.hidden sets display: none', re: '\\.hidden\\s*\\{[^}]*display\\s*:\\s*none', flags: 'i' },
        ],
        hint: 'A component bundles many declarations; a utility does exactly one job.',
        explain: 'The chip owns its whole look, while utilities are small switches you add in the HTML.',
        preview: { html: CHIPS },
      },
      {
        kind: 'write',
        prompt: 'Add a .flow spacing utility and a .visually-hidden utility for screen-reader text.',
        starter: '',
        solution:
          '.flow > * + * {\n  margin-block-start: 1em;\n}\n.visually-hidden {\n  position: absolute;\n  width: 1px;\n  height: 1px;\n  overflow: hidden;\n  clip-path: inset(50%);\n  white-space: nowrap;\n}',
        checks: [
          { label: '.flow > * + * gets a top margin', re: '\\.flow\\s*>\\s*\\*\\s*\\+\\s*\\*\\s*\\{[^}]*margin-(top|block-start)\\s*:', flags: 'i' },
          { label: '.visually-hidden is position: absolute', re: '\\.visually-hidden\\s*\\{[^}]*position\\s*:\\s*absolute', flags: 'i' },
          { label: 'It shrinks to 1px', re: '\\.visually-hidden\\s*\\{[^}]*(width|inline-size)\\s*:\\s*1px', flags: 'i' },
          { label: 'It hides overflow', re: '\\.visually-hidden\\s*\\{[^}]*overflow\\s*:\\s*hidden', flags: 'i' },
          { label: 'It clips with clip-path (or clip)', re: '\\.visually-hidden\\s*\\{[^}]*clip(-path)?\\s*:', flags: 'i' },
          { label: 'No display: none (screen readers would skip it)', not: 'display: none' },
        ],
        hint: 'The owl selector * + * hits every child but the first. Hide text visually without display: none.',
        explain: '.flow spaces any stack of children, and .visually-hidden hides text from eyes but not from screen readers.',
        preview: { html: ARTICLE },
      },
    ],
    // L3 Design tokens
    [
      {
        kind: 'write',
        prompt: 'Add primitive and semantic tokens, and build the success alert from them.',
        starter: '',
        solution:
          ':root {\n  --green-600: oklch(0.55 0.15 150);\n  --color-success: var(--green-600);\n  --space-2: 0.5rem;\n}\n.alert {\n  color: white;\n  background: var(--color-success);\n  padding: var(--space-2);\n}',
        checks: [
          { label: 'A primitive color token like --green-600', re: '--[a-z]+-\\d{2,3}\\s*:\\s*\\S', flags: 'i' },
          { label: 'A semantic --color-… token that points to it with var()', re: '--color-[\\w-]+\\s*:\\s*var\\(\\s*--[a-z]+-\\d{2,3}\\s*\\)', flags: 'i' },
          { label: 'A --space-… token', re: '--space-[\\w-]+\\s*:\\s*[\\d.]+', flags: 'i' },
          { label: '.alert background uses the semantic token', re: '\\.alert\\s*\\{[^}]*background(-color)?\\s*:\\s*var\\(\\s*--color-', flags: 'i' },
          { label: '.alert padding uses the space token', re: '\\.alert\\s*\\{[^}]*padding\\s*:\\s*var\\(\\s*--space-', flags: 'i' },
        ],
        hint: 'Primitive: --green-600: some color. Semantic: --color-success: var(--green-600).',
        explain: 'The alert only knows "success", so changing which green that is touches one line.',
        preview: { html: ALERT },
      },
      {
        kind: 'write',
        prompt: 'Rebrand to orange: add --color-action and make both components use it.',
        starter:
          ':root {\n  --purple-600: oklch(0.5 0.2 300);\n  --orange-500: oklch(0.7 0.18 50);\n}\n.btn { background: var(--purple-600); }\n.link { color: var(--purple-600); }\n',
        solution:
          ':root {\n  --purple-600: oklch(0.5 0.2 300);\n  --orange-500: oklch(0.7 0.18 50);\n  --color-action: var(--orange-500);\n}\n.btn { background: var(--color-action); }\n.link { color: var(--color-action); }',
        checks: [
          { label: '--color-action: var(--orange-500)', re: '--color-action\\s*:\\s*var\\(\\s*--orange-500\\s*\\)', flags: 'i' },
          { label: '.btn background uses var(--color-action)', re: '\\.btn\\s*\\{[^}]*background(-color)?\\s*:\\s*var\\(\\s*--color-action\\s*\\)', flags: 'i' },
          { label: '.link color uses var(--color-action)', re: '\\.link\\s*\\{[^}]*(?<![\\w-])color\\s*:\\s*var\\(\\s*--color-action\\s*\\)', flags: 'i' },
          { label: 'Components no longer use --purple-600 directly', re: '^(?![\\s\\S]*\\.(btn|link)\\s*\\{[^}]*var\\(\\s*--purple-600)', flags: 'i' },
        ],
        hint: 'Point the semantic token at the primitive, and point components at the semantic token.',
        explain: 'Next rebrand, only --color-action changes; the components never mention a raw color.',
        preview: { html: BRAND },
      },
    ],
    // L4 Keeping specificity low
    [
      {
        kind: 'write',
        prompt: 'Write a zero-specificity reset for headings, paragraphs and lists, then override it.',
        starter: '',
        solution:
          ':where(h1, h2, p) {\n  margin: 0;\n}\n:where(ul) {\n  padding: 0;\n  list-style: none;\n}\n.intro {\n  margin-block-end: 1rem;\n}',
        checks: [
          { label: ':where() with h1 and p sets margin: 0', re: ':where\\((?=[^)]*\\bh1\\b)(?=[^)]*\\bp\\b)[^)]*\\)\\s*\\{[^}]*margin\\s*:\\s*0', flags: 'i' },
          { label: ':where() with ul sets padding: 0', re: ':where\\([^)]*\\bul\\b[^)]*\\)\\s*\\{[^}]*padding(-left|-inline-start)?\\s*:\\s*0', flags: 'i' },
          { label: 'A single-class .intro rule adds a margin back', re: '\\.intro\\s*\\{[^}]*margin', flags: 'i' },
        ],
        hint: 'List the tags inside :where(…), separated by commas.',
        explain: ':where() scores 0-0-0, so even a single class like .intro overrides the reset.',
        preview: { html: PAGE },
      },
      {
        kind: 'write',
        prompt: 'Replace the ID chains with single classes from the markup.',
        starter: '#sidebar .widget ul li a { color: navy; }\n#sidebar .widget ul li a:hover { color: crimson; }\n',
        solution: '.widget__link {\n  color: navy;\n}\n.widget__link:hover {\n  color: crimson;\n}',
        checks: [
          { label: '.widget__link sets the color', re: '\\.widget__link\\s*\\{[^}]*color\\s*:', flags: 'i' },
          { label: '.widget__link:hover changes it', re: '\\.widget__link:hover\\s*\\{[^}]*color\\s*:', flags: 'i' },
          { label: 'No #sidebar', not: '#sidebar' },
          { label: 'No ul li chains', not: 'ul li' },
        ],
        hint: 'The links already have class="widget__link".',
        explain: 'An ID scores 1-0-0, so every later override needed another ID. One class keeps it at 0-1-0.',
        preview: { html: WIDGET },
      },
    ],
    // L5 Layers, files & state hooks
    [
      {
        kind: 'write',
        prompt: 'Set the four-layer order, then import cards.css into components.',
        starter: '',
        solution:
          '@layer reset, base, components, utilities;\n@import url("cards.css") layer(components);\n\n@layer utilities {\n  .mt-0 { margin-top: 0; }\n}',
        checks: [
          { label: 'Start with @layer reset, base, components, utilities;', re: '^\\s*@layer\\s+reset\\s*,\\s*base\\s*,\\s*components\\s*,\\s*utilities\\s*;', flags: 'i' },
          { label: 'Then @import cards.css with layer(components)', re: ';\\s*@import\\s+(url\\(\\s*["\']?cards\\.css["\']?\\s*\\)|["\']cards\\.css["\'])\\s+layer\\(\\s*components\\s*\\)\\s*;', flags: 'i' },
          { label: 'An @layer utilities block with a rule', re: '@layer\\s+utilities\\s*\\{[^@]*\\{[^}]*:', flags: 'i' },
        ],
        hint: 'Only @layer statements may come before @import.',
        explain: 'The order line fixes priority once; each file can then land in its own layer.',
        preview: { html: ALERT },
      },
      {
        kind: 'write',
        prompt: 'Swap the .is-open and .is-active classes for the ARIA and data attributes in the markup.',
        starter:
          '.accordion__panel { display: none; }\n.accordion__panel.is-open { display: block; }\n.tab.is-active { border-color: teal; }\n',
        solution:
          '.accordion__panel { display: none; }\n.accordion__panel[data-state="open"] { display: block; }\n.accordion__toggle[aria-expanded="true"] .accordion__icon { rotate: 90deg; }\n.tab[aria-selected="true"] { border-color: teal; }',
        checks: [
          { label: 'Show the panel with [data-state="open"]', re: '\\[\\s*data-state\\s*=\\s*["\']?open["\']?\\s*\\]\\s*\\{[^}]*display\\s*:\\s*(block|flow|grid|flex)', flags: 'i' },
          { label: 'Style the tab with [aria-selected="true"]', re: '\\[\\s*aria-selected\\s*=\\s*["\']?true["\']?\\s*\\]\\s*\\{[^}]*border', flags: 'i' },
          { label: 'Turn the icon with [aria-expanded="true"]', re: '\\[\\s*aria-expanded\\s*=\\s*["\']?true["\']?\\s*\\][^{]*\\{[^}]*(rotate|transform)\\s*:', flags: 'i' },
          { label: 'No .is-open', not: '.is-open' },
          { label: 'No .is-active', not: '.is-active' },
        ],
        hint: 'Attribute selectors look like [name="value"], right after the class.',
        explain: 'The markup must update aria-expanded anyway, so styling it means one source of truth for the state.',
        preview: { html: ACCORDION },
      },
    ],
  ],
};

export default unit;
