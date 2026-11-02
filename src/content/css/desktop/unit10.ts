import type { DesktopUnit } from '../../../engine/types';

// Desktop edition: write-the-code challenges for CSS unit 10 (Modern CSS).
// lessons[i] runs after lesson i + 1. See docs/CONTENT_GUIDE.md.

// The inside of a rule's block, allowing nested rules one level deep.
const inside = (sel: string) => `${sel}\\s*\\{(?:[^{}]|\\{[^{}]*\\})*?`;

const unit: DesktopUnit = {
  lessons: [
    // L1 CSS nesting
    [
      {
        kind: 'write',
        prompt: 'Write the .tile styles with nesting: a hover state and its h3 inside.',
        starter: '',
        solution: '.tile {\n  padding: 12px;\n  background-color: #f1f5f9;\n  &:hover {\n    background-color: #e2e8f0;\n  }\n  h3 {\n    color: teal;\n  }\n}',
        checks: [
          { label: 'A .tile rule with its own styles', re: '\\.tile\\s*\\{[^{}]*:[^{}]*;', flags: 'i' },
          { label: '&:hover nested inside .tile', re: `${inside('\\.tile')}&:hover\\s*\\{`, flags: 'i' },
          { label: 'h3 nested inside .tile', re: `${inside('\\.tile')}(?<![\\w-])(&\\s+)?h3\\s*\\{[^}]*(?<![\\w-])color\\s*:`, flags: 'i' },
          { label: 'No separate .tile:hover rule', not: '.tile:hover' },
        ],
        hint: '& stands for .tile, so &:hover is .tile:hover. A bare h3 inside means .tile h3.',
        explain: 'Nesting keeps everything about the tile in one block; the browser expands it to .tile:hover and .tile h3.',
        preview: { html: '<div class="tile"><h3>Lisbon</h3><p>3 days, 2 nights</p></div>' },
      },
      {
        kind: 'write',
        prompt: 'Rewrite these four rules as one nested .alert block.',
        starter:
          '.alert {\n  padding: 10px;\n  border: 1px solid orange;\n}\n.alert.error {\n  border-color: red;\n}\n.alert p {\n  margin: 0;\n}\n@media (max-width: 500px) {\n  .alert {\n    padding: 6px;\n  }\n}',
        solution:
          '.alert {\n  padding: 10px;\n  border: 1px solid orange;\n  &.error {\n    border-color: red;\n  }\n  p {\n    margin: 0;\n  }\n  @media (max-width: 500px) {\n    padding: 6px;\n  }\n}',
        checks: [
          { label: '&.error nested inside .alert', re: `${inside('\\.alert')}&\\.error\\s*\\{[^}]*border-color\\s*:`, flags: 'i' },
          { label: 'p nested inside .alert', re: `${inside('\\.alert')}(?<![\\w-])(&\\s+)?p\\s*\\{[^}]*margin\\s*:`, flags: 'i' },
          { label: '@media nested inside .alert', re: `${inside('\\.alert')}@media[^{]*\\{[^{}]*padding\\s*:`, flags: 'i' },
          { label: 'No .alert.error rule left', not: '.alert.error' },
          { label: 'No .alert p rule left', not: '.alert p' },
        ],
        hint: '&.error means the same element with both classes. A nested @media holds plain declarations.',
        explain: 'Nested, the alert’s variants, children and breakpoints all live in one block that reads top to bottom.',
        preview: { html: '<div class="alert"><p>Storage almost full.</p></div><div class="alert error"><p>Upload failed.</p></div>' },
      },
    ],
    // L2 :is() and :where()
    [
      {
        kind: 'write',
        prompt: 'Color every link in header, nav and footer with one :is() rule.',
        starter: '',
        solution: ':is(header, nav, footer) a {\n  color: darkorange;\n}',
        checks: [
          {
            label: ':is() listing header, nav and footer',
            re: ':is\\((?=[^)]*\\bheader\\b)(?=[^)]*\\bnav\\b)(?=[^)]*\\bfooter\\b)[^)]*\\)',
            flags: 'i',
          },
          { label: 'Followed by a, setting a color', re: ':is\\([^)]*\\)\\s+a\\s*\\{[^}]*(?<![\\w-])color\\s*:', flags: 'i' },
        ],
        hint: ':is(a, b, c) matches any of them. Then a space and the element inside.',
        explain: 'One short selector replaces header a, nav a, footer a.',
        preview: {
          html: '<header><a href="#">Logo</a></header><nav><a href="#">Shop</a></nav><main><a href="#">Article link</a></main><footer><a href="#">Contact</a></footer>',
        },
      },
      {
        kind: 'write',
        prompt: 'Wrap the default heading rule in :where() so .accent can override it.',
        starter: '#post h2,\n#post h3 {\n  color: slategray;\n}\n.accent {\n  color: crimson;\n}',
        solution: ':where(#post h2, #post h3) {\n  color: slategray;\n}\n.accent {\n  color: crimson;\n}',
        checks: [
          {
            label: 'The slategray rule starts with :where(), no id outside it',
            re: '(^|\\})\\s*:where\\([^)]*\\)(?:[^#{(]|\\([^)]*\\))*\\{[^}]*color\\s*:\\s*slategray',
            flags: 'i',
          },
          { label: 'No #post selector outside :where()', re: '^(?![\\s\\S]*(^|[\\s,}])#post\\s+h[23]\\s*[,{])', flags: 'i' },
          { label: 'Keep .accent crimson', re: '\\.accent\\s*\\{[^}]*color\\s*:\\s*crimson', flags: 'i' },
        ],
        hint: '#post h2 scores 1-0-1, which beats .accent. Anything inside :where() scores 0.',
        explain: ':where() matches the same headings but scores 0-0-0, so a single class like .accent now wins.',
        preview: {
          html: '<article id="post"><h2>Ocean facts</h2><h3 class="accent">Whales sing</h3><h3>Octopuses have three hearts</h3></article>',
        },
      },
    ],
    // L3 The :has() selector
    [
      {
        kind: 'write',
        prompt: 'Frame cards that contain an image, and pad cards with a direct-child .badge.',
        starter: '',
        solution: '.card:has(img) {\n  border: 3px solid gold;\n}\n.card:has(> .badge) {\n  padding-top: 24px;\n}',
        checks: [
          { label: '.card:has(img) gets a border', re: '\\.card:has\\(\\s*img\\s*\\)\\s*\\{[^}]*(?<![\\w-])border\\s*:', flags: 'i' },
          { label: '.card:has(> .badge) for direct children only', re: '\\.card:has\\(\\s*>\\s*\\.badge\\s*\\)\\s*\\{[^}]*padding', flags: 'i' },
        ],
        hint: ':has(img) looks anywhere inside. Start the inner selector with > for direct children.',
        explain: ':has() styles the parent by what it holds, which plain descendant selectors can’t do.',
        preview: {
          html: `<div class="card" style="border:1px solid #ccc;padding:8px;margin:4px"><img alt="" width="60" height="30" src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='60' height='30'%3E%3Crect width='60' height='30' fill='%2387ceeb'/%3E%3C/svg%3E"> Kayak tour</div><div class="card" style="border:1px solid #ccc;padding:8px;margin:4px"><span class="badge">NEW</span> Cave walk</div>`,
        },
      },
      {
        kind: 'write',
        prompt: 'Style each form field by its input: one look on focus, another when ticked.',
        starter: '.field {\n  display: block;\n  padding: 8px;\n  border: 2px solid #ccc;\n  border-radius: 6px;\n}',
        solution:
          '.field {\n  display: block;\n  padding: 8px;\n  border: 2px solid #ccc;\n  border-radius: 6px;\n}\n.field:has(input:focus-visible) {\n  border-color: royalblue;\n}\n.field:has(:checked) {\n  background-color: honeydew;\n}',
        checks: [
          {
            label: '.field:has(input:focus-visible) changes the border or outline',
            re: '\\.field:has\\(\\s*(>\\s*)?input:focus(-visible)?\\s*\\)\\s*\\{[^}]*(border(-color)?|outline)\\s*:',
            flags: 'i',
          },
          {
            label: '.field:has(:checked) changes the background',
            re: '\\.field:has\\(\\s*(>\\s*)?(input)?:checked\\s*\\)\\s*\\{[^}]*background(-color)?\\s*:',
            flags: 'i',
          },
        ],
        hint: 'The state goes inside :has(): .field:has(input:focus-visible).',
        explain: 'The label reacts to the input inside it, so the whole field lights up, not just the box.',
        preview: {
          html: '<label class="field">Email <input type="email"></label><label class="field"><input type="checkbox"> Send me the weekly tips</label>',
        },
      },
    ],
    // L4 clamp, min, max
    [
      {
        kind: 'write',
        prompt: 'Make the hero title fluid between 1.5rem and 3rem, and pad the page with max().',
        starter: '',
        solution: '.hero h1 {\n  font-size: clamp(1.5rem, 5vw, 3rem);\n}\n.page {\n  padding: max(16px, 4vw);\n}',
        checks: [
          {
            label: 'font-size: clamp(1.5rem, a vw value, 3rem)',
            re: 'font-size\\s*:\\s*clamp\\(\\s*1\\.5rem\\s*,[^,]*vw[^,]*,\\s*3rem\\s*\\)',
            flags: 'i',
          },
          { label: '.page padding at least 16px with max()', re: '\\.page\\s*\\{[^}]*padding(-inline)?\\s*:[^;}]*max\\((?=[^)]*16px)', flags: 'i' },
        ],
        hint: 'clamp(MIN, IDEAL, MAX). max() picks the larger value, so it sets a floor.',
        explain: 'The title follows the screen width but never drops below 1.5rem or grows past 3rem.',
        preview: { html: '<div class="page"><section class="hero"><h1>Festival of Lights</h1></section><p>Nov 14–16, Old Town</p></div>' },
      },
      {
        kind: 'write',
        prompt: 'Cap the card at 600px with min(), and keep its side padding at least 16px.',
        starter: '.card {\n  width: 600px;\n  padding: 24px;\n  margin: 0 auto;\n  background-color: #f8fafc;\n}',
        solution: '.card {\n  width: min(600px, 100%);\n  padding: 24px max(16px, 4vw);\n  margin: 0 auto;\n  background-color: #f8fafc;\n  box-sizing: border-box;\n}',
        checks: [
          { label: 'width: min() with 600px and a % or vw', re: '(?<![\\w-])width\\s*:\\s*min\\((?=[^)]*600px)(?=[^)]*\\d(%|vw))', flags: 'i' },
          { label: 'Side padding uses max() with 16px', re: '(?<![\\w-])padding(-inline|-left|-right)?\\s*:[^;}]*max\\((?=[^)]*16px)', flags: 'i' },
        ],
        hint: 'min() picks the smaller value, so min(600px, 100%) never overflows a narrow screen.',
        explain: 'On wide screens the card stops at 600px; on phones 100% is smaller, so it fits.',
        preview: { html: '<div class="card"><h3>Order #2041</h3><p>2 × oat latte, 1 × cinnamon bun</p></div>' },
      },
    ],
    // L5 Container queries
    [
      {
        kind: 'write',
        prompt: 'Make .wrap a container, and lay .product out in a row when it’s 400px+.',
        starter: '',
        solution: '.wrap {\n  container-type: inline-size;\n}\n@container (min-width: 400px) {\n  .product {\n    display: flex;\n    gap: 12px;\n  }\n}',
        checks: [
          { label: '.wrap: container-type: inline-size', re: '\\.wrap\\s*\\{[^}]*container-type\\s*:\\s*inline-size', flags: 'i' },
          {
            label: 'A container query for 400px and up',
            re: '@container\\s*([\\w-]+\\s*)?\\(\\s*(min-width\\s*:\\s*400px|width\\s*>=\\s*400px|400px\\s*<=\\s*width)\\s*\\)',
            flags: 'i',
          },
          { label: 'Inside it, .product is display: flex', re: '@container[^{]*\\{\\s*([^{}]*\\{[^{}]*\\}\\s*)*\\.product\\s*\\{[^}]*display\\s*:\\s*flex', flags: 'i' },
        ],
        hint: 'container-type goes on the wrapper; @container (min-width: 400px) { … } styles what’s inside.',
        explain: 'The product reacts to the width of .wrap, not the screen, so it works in any column.',
        preview: {
          html: '<div class="wrap"><div class="product"><div style="background:#fde68a;padding:16px">IMG</div><div><h3>Desk lamp</h3><p>$35, warm light</p></div></div></div>',
        },
      },
      {
        kind: 'write',
        prompt: 'Swap the media query for a container query, so each widget fits its column.',
        starter:
          '.sidebar {\n  width: 200px;\n}\n.widget {\n  padding: 8px;\n}\n@media (min-width: 600px) {\n  .widget h3 {\n    font-size: 1.5rem;\n  }\n}',
        solution:
          '.sidebar,\n.main {\n  container-type: inline-size;\n}\n.sidebar {\n  width: 200px;\n}\n.widget {\n  padding: 8px;\n}\n@container (width >= 300px) {\n  .widget h3 {\n    font-size: 1.5rem;\n  }\n}',
        checks: [
          { label: '.sidebar is a container', re: '\\.sidebar[^{]*\\{[^}]*container-type\\s*:\\s*inline-size', flags: 'i' },
          { label: '.main is a container', re: '\\.main[^{]*\\{[^}]*container-type\\s*:\\s*inline-size', flags: 'i' },
          {
            label: 'An @container query sizes .widget h3',
            re: '@container\\s*([\\w-]+\\s*)?\\([^)]*\\)\\s*\\{\\s*\\.widget\\s+h3\\s*\\{[^}]*font-size\\s*:',
            flags: 'i',
          },
          { label: 'No @media left', not: '@media' },
        ],
        hint: 'Both columns need container-type. The query body stays the same; only @media becomes @container.',
        explain: 'Now the heading grows in the wide main column but stays small in the 200px sidebar, on any screen.',
        preview: {
          html: '<div style="display:flex;gap:8px"><aside class="sidebar"><div class="widget" style="background:#e0f2fe"><h3>Weather</h3><p>12°C</p></div></aside><main class="main" style="flex:1"><div class="widget" style="background:#e0f2fe"><h3>Weather</h3><p>12°C, light wind</p></div></main></div>',
        },
      },
    ],
  ],
};

export default unit;
