import type { DesktopUnit } from '../../../engine/types';

// Desktop edition: write-the-code challenges for CSS unit 1 (Selectors & syntax).
// lessons[i] runs after lesson i + 1. See docs/CONTENT_GUIDE.md.
const unit: DesktopUnit = {
  lessons: [
    // L1 Your first rule
    [
      {
        kind: 'write',
        prompt: 'Style a weather page: color the h1 headings and the paragraphs.',
        starter: '',
        solution: 'h1 {\n  color: steelblue;\n}\np {\n  color: gray;\n}',
        checks: [
          { label: 'An h1 rule that sets color', re: '(^|[\\s}])h1\\s*\\{[^}]*(?<![\\w-])color\\s*:\\s*[^;}\\s]', flags: 'i' },
          { label: 'A p rule that sets color', re: '(^|[\\s}])p\\s*\\{[^}]*(?<![\\w-])color\\s*:\\s*[^;}\\s]', flags: 'i' },
          { label: 'Each rule wrapped in { }', re: '^(\\s*[^{}]+\\{[^{}]*\\})+\\s*$' },
        ],
        hint: 'Two rules: selector, then { color: value; }. Start with h1 { … }.',
        explain: 'A type selector like h1 or p picks every element with that tag, and color recolors its text.',
        preview: { html: '<h1>Rainy Tuesday</h1><p>Bring an umbrella.</p><p>Low of 9°C tonight.</p>' },
      },
      {
        kind: 'write',
        prompt: 'Finish the h2 rule, then give every li its own color.',
        starter: 'h2 {\n  color: purple\n',
        solution: 'h2 {\n  color: purple;\n}\nli {\n  color: darkgreen;\n}',
        checks: [
          { label: 'End color: purple with a semicolon', re: 'color\\s*:\\s*purple\\s*;', flags: 'i' },
          { label: 'Close the h2 rule with }', re: 'h2\\s*\\{[^{}]*\\}', flags: 'i' },
          { label: 'An li rule that sets color', re: '(^|[\\s}])li\\s*\\{[^}]*(?<![\\w-])color\\s*:\\s*[^;}\\s]', flags: 'i' },
        ],
        hint: 'Add ; after purple and } on the next line, then write li { color: …; }.',
        explain: 'Each declaration ends with ; and each rule closes with }. Without the }, the next rule would be swallowed.',
        preview: { html: '<h2>Shopping list</h2><ul><li>Apples</li><li>Oats</li><li>Honey</li></ul>' },
      },
    ],
    // L2 Classes and ids
    [
      {
        kind: 'write',
        prompt: 'On the checkout, fill the .badge background and color the #total.',
        starter: '',
        solution: '.badge {\n  background-color: gold;\n}\n#total {\n  color: darkgreen;\n}',
        checks: [
          { label: 'A .badge rule with a background-color', re: '\\.badge\\s*\\{[^}]*background-color\\s*:\\s*[^;}\\s]', flags: 'i' },
          { label: 'A #total rule that sets color', re: '#total\\s*\\{[^}]*(?<![\\w-])color\\s*:\\s*[^;}\\s]', flags: 'i' },
        ],
        hint: 'A class selector starts with a dot, an id selector with #.',
        explain: '.badge styles both discount labels; #total styles the one element with that id.',
        preview: {
          html: '<p>Sneakers <span class="badge">-30%</span></p><p>Socks <span class="badge">-10%</span></p><p id="total">Total: $84</p>',
        },
      },
      {
        kind: 'write',
        prompt: 'Fix the selectors: tag is a class and player is an id.',
        starter: '#tag {\n  color: purple;\n}\n.player {\n  background-color: gold;\n}',
        solution: '.tag {\n  color: purple;\n}\n#player {\n  background-color: gold;\n}',
        checks: [
          { label: 'Select the tags with .tag', re: '(^|[\\s,}])\\.tag\\s*\\{', flags: 'i' },
          { label: 'Select the heading with #player', re: '(^|[\\s,}])#player\\s*\\{', flags: 'i' },
          { label: 'No #tag selector left', not: '#tag' },
          { label: 'No .player selector left', not: '.player' },
        ],
        hint: 'Look at the HTML: class="tag" needs a dot, id="player" needs a #.',
        explain: 'A dot looks for class=, a # looks for id=. Mixing them up means the rule matches nothing.',
        preview: { html: '<span class="tag">rpg</span> <span class="tag">co-op</span><h2 id="player">Player One</h2>' },
      },
    ],
    // L3 Grouping & many declarations
    [
      {
        kind: 'write',
        prompt: 'Give h1, h2 and h3 the same text and background colors in one rule.',
        starter: '',
        solution: 'h1, h2, h3 {\n  color: white;\n  background-color: darkolivegreen;\n}',
        checks: [
          {
            label: 'One selector list: h1, h2, h3',
            re: '(^|\\})\\s*(?=[^{}]*\\bh1\\b)(?=[^{}]*\\bh2\\b)(?=[^{}]*\\bh3\\b)(?=[^{}]*,[^{}]*,)[^{}]*\\{',
            flags: 'i',
          },
          {
            label: 'The rule sets color',
            re: '(^|\\})\\s*(?=[^{}]*\\bh1\\b)(?=[^{}]*\\bh2\\b)(?=[^{}]*\\bh3\\b)[^{}]*\\{[^}]*(?<![\\w-])color\\s*:',
            flags: 'i',
          },
          {
            label: 'The rule sets background-color',
            re: '(^|\\})\\s*(?=[^{}]*\\bh1\\b)(?=[^{}]*\\bh2\\b)(?=[^{}]*\\bh3\\b)[^{}]*\\{[^}]*background-color\\s*:',
            flags: 'i',
          },
        ],
        hint: 'Separate the selectors with commas, then put both declarations in one { }.',
        explain: 'A selector list shares one block of declarations, so you write the colors once.',
        preview: { html: '<h1>Field Guide</h1><h2>Birds</h2><h3>Owls</h3><p>Owls hunt at night.</p>' },
      },
      {
        kind: 'write',
        prompt: 'Merge the duplicate rules into one, then add a later rule turning .warning orange.',
        starter:
          '.error {\n  color: red;\n  background-color: mistyrose;\n}\n.warning {\n  color: red;\n  background-color: mistyrose;\n}',
        solution: '.error, .warning {\n  color: red;\n  background-color: mistyrose;\n}\n.warning {\n  color: darkorange;\n}',
        checks: [
          { label: 'One grouped rule: .error, .warning', re: '\\.error\\s*,\\s*\\.warning\\s*\\{|\\.warning\\s*,\\s*\\.error\\s*\\{', flags: 'i' },
          {
            label: 'The grouped rule sets background-color',
            re: '(\\.error\\s*,\\s*\\.warning|\\.warning\\s*,\\s*\\.error)\\s*\\{[^}]*background-color\\s*:',
            flags: 'i',
          },
          {
            label: 'A .warning rule after it with its own color',
            re: '(\\.error\\s*,\\s*\\.warning|\\.warning\\s*,\\s*\\.error)\\s*\\{[^}]*\\}[\\s\\S]*(^|\\})\\s*\\.warning\\s*\\{[^}]*(?<![\\w-])color\\s*:',
            flags: 'im',
          },
        ],
        hint: 'Join the selectors with a comma. For the override, write .warning { color: …; } below it.',
        explain: 'Grouping removes the copy-paste. The later .warning rule wins for color because, on a tie, the last one wins.',
        preview: { html: '<p class="error">Payment failed</p><p class="warning">Card expires soon</p>' },
      },
    ],
    // L4 Descendant selectors
    [
      {
        kind: 'write',
        prompt: 'Color only the footer links and only the list items inside .steps.',
        starter: '',
        solution: 'footer a {\n  color: gray;\n}\n.steps li {\n  color: navy;\n}',
        checks: [
          { label: 'footer a sets a color', re: 'footer\\s+a\\s*\\{[^}]*(?<![\\w-])color\\s*:', flags: 'i' },
          { label: '.steps li sets a color', re: '\\.steps\\s+li\\s*\\{[^}]*(?<![\\w-])color\\s*:', flags: 'i' },
        ],
        hint: 'Outer selector, a space, then the inner one: footer a.',
        explain: 'A space means "inside", so the link outside the footer and the li outside .steps stay as they were.',
        preview: {
          html: '<ol class="steps"><li>Boil water</li><li>Add pasta</li></ol><ul><li>Serves 2</li></ul><p><a href="#">More recipes</a></p><footer><a href="#">Contact</a></footer>',
        },
      },
      {
        kind: 'write',
        prompt: 'Only links inside .menu should turn white. Fix the first selector.',
        starter: '.menu, a {\n  color: white;\n}\n.menu {\n  background-color: navy;\n}',
        solution: '.menu a {\n  color: white;\n}\n.menu {\n  background-color: navy;\n}',
        checks: [
          { label: '.menu a turns the menu links white', re: '\\.menu\\s+a\\s*\\{[^}]*(?<![\\w-])color\\s*:', flags: 'i' },
          { label: 'No comma between .menu and a', not: '.menu, a' },
          { label: '.menu keeps its background', re: '\\.menu\\s*\\{[^}]*background-color\\s*:', flags: 'i' },
        ],
        hint: 'A comma styles both separately. You want links that sit inside the menu.',
        explain: '.menu, a hits every link on the page. .menu a only hits links inside .menu.',
        preview: {
          html: '<nav class="menu"><a href="#">Home</a> <a href="#">Shop</a></nav><p>Read our <a href="#">blog</a>.</p>',
        },
      },
    ],
    // L5 Comments & the style tag
    [
      {
        kind: 'write',
        prompt: 'Write the gym log styles, with a comment above each rule.',
        starter: '',
        solution: '/* Page title */\nh1 {\n  color: darkred;\n}\n/* Workout sets */\n.set {\n  background-color: whitesmoke;\n}',
        checks: [
          { label: 'At least two /* */ comments', re: '(\\/\\*[\\s\\S]*?\\*\\/[\\s\\S]*){2}' },
          { label: 'An h1 rule', re: '(^|[\\s}])h1\\s*\\{[^}]*:', flags: 'i' },
          { label: 'A .set rule', re: '\\.set\\s*\\{[^}]*:', flags: 'i' },
          { label: 'No // comments', not: '//' },
        ],
        hint: 'A CSS comment is /* note */. The // kind doesn’t exist in CSS.',
        explain: 'Comments label each part of the stylesheet; the browser skips them.',
        preview: { html: '<h1>Gym Log</h1><p class="set">Squat 5 × 5</p><p class="set">Bench 3 × 8</p>' },
      },
      {
        kind: 'write',
        prompt: 'Add a <style> block to the head with a comment and an h1 rule.',
        starter: '<head>\n  <title>Book Club</title>\n</head>',
        solution: '<head>\n  <title>Book Club</title>\n  <style>\n    /* Club colors */\n    h1 { color: maroon; }\n  </style>\n</head>',
        checks: [
          { label: 'A <style> element inside the head', re: '<head>[\\s\\S]*<style>[\\s\\S]*</style>[\\s\\S]*</head>', flags: 'i' },
          { label: 'A /* */ comment in the style block', re: '<style>[\\s\\S]*\\/\\*[\\s\\S]*?\\*\\/[\\s\\S]*</style>', flags: 'i' },
          { label: 'An h1 rule that sets color', re: '<style>[\\s\\S]*h1\\s*\\{[^}]*(?<![\\w-])color\\s*:[\\s\\S]*</style>', flags: 'i' },
        ],
        hint: 'Open <style> after the title, write the CSS, then close it with </style> before </head>.',
        explain: 'A <style> element in the head holds CSS for the whole page. Inside it, comments use /* */, not <!-- -->.',
      },
    ],
  ],
};

export default unit;
