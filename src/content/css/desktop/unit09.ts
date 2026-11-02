import type { DesktopUnit } from '../../../engine/types';

// Desktop edition: write-the-code challenges for CSS unit 9 (Variables & specificity).
// lessons[i] runs after lesson i + 1. See docs/CONTENT_GUIDE.md.
const unit: DesktopUnit = {
  lessons: [
    // L1 Custom properties
    [
      {
        kind: 'write',
        prompt: 'Define a brand color and a spacing size on :root, then use both on .btn.',
        starter: '',
        solution: ':root {\n  --brand: #7c3aed;\n  --space: 12px;\n}\n.btn {\n  background-color: var(--brand);\n  padding: var(--space);\n  color: white;\n}',
        checks: [
          { label: ':root declares two custom properties', re: ':root\\s*\\{(\\s*[^}]*?--[\\w-]+\\s*:[^;}]+;?){2}', flags: 'i' },
          {
            label: '.btn background-color uses one with var()',
            re: ':root\\s*\\{[^}]*(--[\\w-]+)\\s*:[\\s\\S]*\\.btn\\s*\\{[^}]*background(-color)?\\s*:\\s*var\\(\\s*\\1\\s*\\)',
            flags: 'i',
          },
          {
            label: '.btn padding uses the other with var()',
            re: ':root\\s*\\{[^}]*(--[\\w-]+)\\s*:[\\s\\S]*\\.btn\\s*\\{[^}]*(?<![\\w-])padding\\s*:\\s*var\\(\\s*\\1\\s*\\)',
            flags: 'i',
          },
        ],
        hint: 'Custom property names start with two dashes. Read one back with var(--name).',
        explain: 'Change the value once on :root and every var() that reads it updates.',
        preview: { html: '<button class="btn">Upgrade to Pro</button>' },
      },
      {
        kind: 'write',
        prompt: 'Replace the repeated hex color with one custom property on :root.',
        starter:
          'h1 {\n  color: #0f766e;\n}\n.tag {\n  background-color: #0f766e;\n}\na {\n  color: #0f766e;\n  border-bottom: 2px solid #0f766e;\n}',
        solution:
          ':root {\n  --teal: #0f766e;\n}\nh1 {\n  color: var(--teal);\n}\n.tag {\n  background-color: var(--teal);\n}\na {\n  color: var(--teal);\n  border-bottom: 2px solid var(--teal);\n}',
        checks: [
          { label: ':root defines a property set to #0f766e', re: ':root\\s*\\{[^}]*--[\\w-]+\\s*:\\s*#0f766e', flags: 'i' },
          { label: 'The hex code appears only once', re: '^(?![\\s\\S]*#0f766e[\\s\\S]*#0f766e)', flags: 'i' },
          { label: 'All four uses read it with var()', re: '(var\\(\\s*--[\\w-]+\\s*\\)[\\s\\S]*){4}', flags: 'i' },
        ],
        hint: 'Declare --teal (or any name) once on :root, then swap each #0f766e for var(--teal).',
        explain: 'One source of truth: to re-brand, you now change a single line.',
        preview: { html: '<h1>Reef Notes</h1><span class="tag">diving</span><p>See the <a href="#">tide table</a>.</p>' },
      },
    ],
    // L2 Fallbacks and scope
    [
      {
        kind: 'write',
        prompt: 'Give badges a fallback color with var(), and re-theme .danger by redefining it.',
        starter: '',
        solution: '.badge {\n  background-color: var(--badge-bg, gray);\n  color: white;\n}\n.danger {\n  --badge-bg: crimson;\n}',
        checks: [
          {
            label: '.badge uses var() with a fallback',
            re: '\\.badge\\s*\\{[^}]*background(-color)?\\s*:\\s*var\\(\\s*--[\\w-]+\\s*,\\s*[^)]+\\)',
            flags: 'i',
          },
          {
            label: '.danger redefines that same property',
            re: 'var\\(\\s*(--[\\w-]+)\\s*,[\\s\\S]*\\.danger\\s*\\{[^}]*\\1\\s*:|\\.danger\\s*\\{[^}]*(--[\\w-]+)\\s*:[\\s\\S]*var\\(\\s*\\2\\s*,',
            flags: 'i',
          },
        ],
        hint: 'var(--name, fallback). Then in .danger, set --name: something;',
        explain: 'Plain badges use the fallback; .danger sets the property, and the badge inside that element picks it up.',
        preview: { html: '<span class="badge">Draft</span> <span class="badge danger">Overdue</span> <span class="badge">Saved</span>' },
      },
      {
        kind: 'write',
        prompt: 'Add a .dark theme by redefining the variables, and a smaller gap on phones.',
        starter:
          ':root {\n  --bg: white;\n  --text: #222;\n  --gap: 24px;\n}\n.panel {\n  background-color: var(--bg);\n  color: var(--text);\n  padding: var(--gap);\n}',
        solution:
          ':root {\n  --bg: white;\n  --text: #222;\n  --gap: 24px;\n}\n.panel {\n  background-color: var(--bg);\n  color: var(--text);\n  padding: var(--gap);\n}\n.dark {\n  --bg: #1e1e1e;\n  --text: #eee;\n}\n@media (max-width: 600px) {\n  :root {\n    --gap: 12px;\n  }\n}',
        checks: [
          { label: '.dark redefines --bg', re: '\\.dark\\s*\\{[^}]*--bg\\s*:', flags: 'i' },
          { label: '.dark redefines --text', re: '\\.dark\\s*\\{[^}]*--text\\s*:', flags: 'i' },
          { label: 'A max-width query redefines --gap', re: '@media[^{]*max-width[^{]*\\{[^@]*--gap\\s*:', flags: 'i' },
          { label: 'Keep .panel reading the variables', re: '\\.panel\\s*\\{[^}]*var\\(\\s*--bg\\s*\\)', flags: 'i' },
        ],
        hint: 'Set the custom properties themselves in .dark and in the media query. .panel stays as it is.',
        explain: 'Custom properties inherit, so redefining them on .dark re-themes every panel inside it.',
        preview: { html: '<div class="panel">Light panel</div><div class="dark"><div class="panel">Dark panel</div></div>' },
      },
    ],
    // L3 Inheritance
    [
      {
        kind: 'write',
        prompt: 'Set .article’s font and color once, and give .note its border with inherit.',
        starter: '',
        solution:
          '.article {\n  font-family: Georgia, serif;\n  color: #333;\n  border: 2px solid teal;\n  padding: 12px;\n}\n.note {\n  border: inherit;\n}',
        checks: [
          { label: '.article sets font-family', re: '\\.article\\s*\\{[^}]*font-family\\s*:', flags: 'i' },
          { label: '.article sets color', re: '\\.article\\s*\\{[^}]*(?<![\\w-])color\\s*:', flags: 'i' },
          { label: '.article has a border', re: '\\.article\\s*\\{[^}]*(?<![\\w-])border\\s*:', flags: 'i' },
          { label: '.note copies it with border: inherit', re: '\\.note\\s*\\{[^}]*(?<![\\w-])border\\s*:\\s*inherit', flags: 'i' },
        ],
        hint: 'Text properties pass down on their own. Borders don’t, so ask for it with inherit.',
        explain: 'The font and color reach every child automatically; border needs inherit to copy the parent’s value.',
        preview: { html: '<div class="article"><h3>Bread basics</h3><p>Flour, water, salt, time.</p><p class="note">Tip: weigh, don’t scoop.</p></div>' },
      },
      {
        kind: 'write',
        prompt: 'Make the form’s button and input inherit its font and color.',
        starter: '.form {\n  font-family: "Trebuchet MS", sans-serif;\n  font-size: 18px;\n  color: darkslateblue;\n}',
        solution:
          '.form {\n  font-family: "Trebuchet MS", sans-serif;\n  font-size: 18px;\n  color: darkslateblue;\n}\nbutton,\ninput {\n  font: inherit;\n  color: inherit;\n}',
        checks: [
          { label: 'button inherits the font', re: 'button[^{]*\\{[^}]*font(-family)?\\s*:\\s*inherit', flags: 'i' },
          { label: 'input inherits the font', re: 'input[^{]*\\{[^}]*font(-family)?\\s*:\\s*inherit', flags: 'i' },
          { label: 'The font size comes along too', re: '(?<![\\w-])font(-size)?\\s*:\\s*inherit', flags: 'i' },
          { label: 'They inherit the color', re: '(button|input)[^{]*\\{[^}]*(?<![\\w-])color\\s*:\\s*inherit', flags: 'i' },
        ],
        hint: 'Form controls don’t inherit text styles by default. font: inherit covers family and size.',
        explain: 'Buttons and inputs use the system font unless told otherwise; inherit makes them match the form.',
        preview: { html: '<div class="form"><p>Join the newsletter</p><input placeholder="you@example.com"> <button>Sign up</button></div>' },
      },
    ],
    // L4 Specificity scores
    [
      {
        kind: 'write',
        prompt: 'The .active link stays gray. Beat #nav a with a stronger selector, no !important.',
        starter: '#nav a {\n  color: gray;\n}\n.active {\n  color: orange;\n}',
        solution: '#nav a {\n  color: gray;\n}\n#nav .active {\n  color: orange;\n}',
        checks: [
          { label: 'A selector with #nav and .active that sets color', re: '#nav\\b[^{},]*\\.active\\b[^{]*\\{[^}]*(?<![\\w-])color\\s*:', flags: 'i' },
          { label: 'Keep the gray #nav a rule', re: '#nav\\s+a\\s*\\{[^}]*color\\s*:\\s*gray', flags: 'i' },
          { label: 'No !important', not: '!important' },
        ],
        hint: '#nav a scores 1-0-1. Adding the id to your class selector gives 1-1-0.',
        explain: '#nav .active scores 1-1-0, which beats 1-0-1, so the active link turns orange.',
        preview: { html: '<nav id="nav"><a href="#">Home</a> <a href="#" class="active">Blog</a> <a href="#">About</a></nav>' },
      },
      {
        kind: 'write',
        prompt: 'Sale prices should be red. Give the .sale rule a score that wins.',
        starter: '.price.sale {\n  color: red;\n}\n.card .price {\n  color: black;\n}\n#shop .card .price {\n  color: gray;\n}',
        solution: '.card .price {\n  color: black;\n}\n#shop .card .price {\n  color: gray;\n}\n#shop .card .price.sale {\n  color: red;\n}',
        checks: [
          { label: 'A red .sale rule that includes the #shop id', re: '#shop\\b[^{},]*\\.sale\\b[^{]*\\{[^}]*(?<![\\w-])color\\s*:\\s*red', flags: 'i' },
          {
            label: 'It scores above 1-2-0, or ties and comes last',
            re: '#shop(\\s*[^{},\\s]*\\.[\\w-]+){3}[^{]*\\{|#shop\\s+\\.card\\s+\\.price\\s*\\{[^}]*\\}[\\s\\S]*#shop\\b[^{},]*\\.sale\\b',
            flags: 'i',
          },
          { label: 'No !important', not: '!important' },
        ],
        hint: '#shop .card .price scores 1-2-0. Add the id and enough classes to beat or tie it.',
        explain: '#shop .card .price.sale scores 1-3-0, so it wins wherever it sits in the file.',
        preview: {
          html: '<div id="shop"><div class="card">Lamp <span class="price">$40</span></div><div class="card">Rug <span class="price sale">$25</span></div></div>',
        },
      },
    ],
    // L5 Using !important
    [
      {
        kind: 'write',
        prompt: 'Write .hidden and .center utilities that always win, using !important.',
        starter: '#msg {\n  display: block;\n  text-align: left;\n}',
        solution: '#msg {\n  display: block;\n  text-align: left;\n}\n.hidden {\n  display: none !important;\n}\n.center {\n  text-align: center !important;\n}',
        checks: [
          { label: '.hidden: display: none !important', re: '\\.hidden\\s*\\{[^}]*display\\s*:\\s*none\\s*!\\s*important', flags: 'i' },
          { label: '.center: text-align: center !important', re: '\\.center\\s*\\{[^}]*text-align\\s*:\\s*center\\s*!\\s*important', flags: 'i' },
        ],
        hint: '!important goes after the value, before the semicolon.',
        explain: 'An id selector beats a class, but !important beats any normal declaration, so the utilities always apply.',
        preview: { html: '<p id="msg" class="center">Welcome, traveler!</p><p id="old" class="hidden">Old banner</p>' },
      },
      {
        kind: 'write',
        prompt: 'Remove every !important: the cascade already gives the same result.',
        starter:
          '.btn {\n  background-color: gray !important;\n}\n.btn-primary {\n  background-color: royalblue !important;\n}\n#checkout .btn-primary {\n  background-color: green !important;\n}',
        solution: '.btn {\n  background-color: gray;\n}\n.btn-primary {\n  background-color: royalblue;\n}\n#checkout .btn-primary {\n  background-color: green;\n}',
        checks: [
          { label: 'No !important left', not: '!important' },
          { label: '.btn stays gray', re: '\\.btn\\s*\\{[^}]*background(-color)?\\s*:\\s*gray', flags: 'i' },
          { label: '.btn-primary stays royalblue', re: '(^|[\\s}])\\.btn-primary\\s*\\{[^}]*background(-color)?\\s*:\\s*royalblue', flags: 'i' },
          { label: '#checkout .btn-primary stays green', re: '#checkout\\s+\\.btn-primary\\s*\\{[^}]*background(-color)?\\s*:\\s*green', flags: 'i' },
        ],
        hint: 'Check each score: 0-1-0, 0-1-0 (later wins), then 1-1-0.',
        explain: 'Specificity and source order already pick the right color, so !important only made future changes harder.',
        preview: {
          html: '<button class="btn">Cancel</button> <button class="btn btn-primary">Save</button><div id="checkout"><button class="btn btn-primary">Pay now</button></div>',
        },
      },
    ],
  ],
};

export default unit;
