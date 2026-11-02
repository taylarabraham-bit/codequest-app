import type { DesktopUnit } from '../../../engine/types';

// Desktop edition: write-the-code challenges for HTML unit 1 (Tags & structure).
// lessons[i] runs after lesson i + 1. See docs/CONTENT_GUIDE.md.
const unit: DesktopUnit = {
  lessons: [
    // L1 Your first tag
    [
      {
        kind: 'write',
        prompt: 'Add a big heading and a paragraph for a movie night.',
        starter: '',
        solution: '<h1>Movie Night</h1>\n<p>Friday at 8, bring snacks.</p>',
        checks: [
          { label: 'An <h1> heading that says Movie Night', re: '<h1>\\s*Movie Night\\s*</h1>', flags: 'i' },
          { label: 'A <p> paragraph under it, opened and closed', re: '</h1>[\\s\\S]*<p>[\\s\\S]+</p>', flags: 'i' },
        ],
        hint: 'Each element needs an opening tag like <h1> and a closing tag like </h1>.',
        explain: 'The heading comes first, then the paragraph. Each element closes with the same name plus a slash.',
        preview: {},
      },
      {
        kind: 'write',
        prompt: 'Finish the recipe: close the heading and add two paragraphs.',
        starter: '<h1>Pancakes\n',
        solution: '<h1>Pancakes</h1>\n<p>Mix flour, milk and eggs.</p>\n<p>Fry until golden.</p>',
        checks: [
          { label: 'Close the <h1> with </h1>', re: '<h1>\\s*Pancakes\\s*</h1>', flags: 'i' },
          { label: 'Two <p> paragraphs', re: '(<p>[\\s\\S]*?</p>[\\s\\S]*){2}', flags: 'i' },
        ],
        hint: 'Type </h1> after Pancakes, then add <p>…</p> twice, one per line.',
        explain: 'Every opening tag needs its closing tag. Two separate <p> elements make two paragraphs.',
        preview: {},
      },
    ],
    // L2 Elements
    [
      {
        kind: 'write',
        prompt: 'Build a shop front: a comment, an h2, a paragraph and a button.',
        starter: '',
        solution: '<!-- Shop front -->\n<h2>Bike Shop</h2>\n<p>Repairs while you wait.</p>\n<button>Book a repair</button>',
        checks: [
          { label: 'A comment like <!-- Shop front -->', re: '<!--[\\s\\S]+?-->' },
          { label: 'An <h2> heading', re: '<h2>[\\s\\S]+?</h2>', flags: 'i' },
          { label: 'A <p> paragraph', re: '<p>[\\s\\S]+?</p>', flags: 'i' },
          { label: 'A <button> with text in it', re: '<button>\\s*\\S[\\s\\S]*?</button>', flags: 'i' },
        ],
        hint: 'A comment starts with <!-- and ends with -->. The button is <button>Text</button>.',
        explain: 'Each element’s tag name says what it is. The comment is a note for you; the browser doesn’t show it.',
        preview: {},
      },
      {
        kind: 'write',
        prompt: 'Turn these notes into a quiz card: heading, question, button.',
        starter: '<!-- heading: Daily Quiz -->\n<!-- question: What is 7 x 6? -->\n<!-- button: Answer -->\n',
        solution:
          '<!-- heading: Daily Quiz -->\n<!-- question: What is 7 x 6? -->\n<!-- button: Answer -->\n<h1>Daily Quiz</h1>\n<p>What is 7 x 6?</p>\n<button>Answer</button>',
        checks: [
          { label: 'The heading Daily Quiz', re: '<h[1-3]>\\s*Daily Quiz\\s*</h[1-3]>', flags: 'i' },
          { label: 'The question in a paragraph', re: '<p>\\s*What is 7 x 6\\?\\s*</p>', flags: 'i' },
          { label: 'An Answer button', re: '<button>\\s*Answer\\s*</button>', flags: 'i' },
        ],
        hint: 'Write the elements under the comments: <h1>, <p> and <button>.',
        explain: 'The comments stay hidden; only the three elements show up on the page.',
        preview: {},
      },
    ],
    // L3 Nesting
    [
      {
        kind: 'write',
        prompt: 'Wrap a game tip in a div: Press Start to play, with Start in bold.',
        starter: '',
        solution: '<div>\n  <p>Press <b>Start</b> to play</p>\n</div>',
        checks: [
          { label: 'A <div> that wraps everything', re: '^\\s*<div>[\\s\\S]*</div>\\s*$', flags: 'i' },
          { label: 'A <p> inside the div', re: '<div>\\s*<p>[\\s\\S]*</p>\\s*</div>', flags: 'i' },
          { label: 'Start in bold with <b>', re: '<b>\\s*Start\\s*</b>', flags: 'i' },
          { label: 'Inner elements close first', re: '</b>[\\s\\S]*</p>[\\s\\S]*</div>', flags: 'i' },
        ],
        hint: 'Open div, then p, then b. Close them in reverse: </b>, </p>, </div>.',
        explain: 'Last opened, first closed: the b sits inside the p, which sits inside the div.',
        preview: {},
      },
      {
        kind: 'write',
        prompt: 'Fix the nesting so every tag closes in the right order.',
        starter: '<div>\n  <p>Level <b>7</p></b>\n<p>Lives: <i>3</div></i></p>',
        solution: '<div>\n  <p>Level <b>7</b></p>\n  <p>Lives: <i>3</i></p>\n</div>',
        checks: [
          { label: 'Close </b> before </p>', re: '<b>\\s*7\\s*</b>\\s*</p>', flags: 'i' },
          { label: 'Close </i> before </p>', re: '<i>\\s*3\\s*</i>\\s*</p>', flags: 'i' },
          { label: 'Both paragraphs inside the div', re: '^\\s*<div>\\s*<p>[\\s\\S]*</p>\\s*<p>[\\s\\S]*</p>\\s*</div>\\s*$', flags: 'i' },
        ],
        hint: 'Read each line from the inside out: the innermost tag closes first, and </div> goes last.',
        explain: 'Browsers try to repair bad nesting, but they guess. Closing in order means the page is built the way you meant.',
        preview: {},
      },
    ],
    // L4 Attributes
    [
      {
        kind: 'write',
        prompt: 'Give the paragraph an id, a class and a tooltip.',
        starter: '<p>Save often!</p>',
        solution: '<p id="tip" class="note" title="Pro tip">Save often!</p>',
        checks: [
          { label: 'id="tip"', has: 'id="tip"' },
          { label: 'class="note"', has: 'class="note"' },
          { label: 'A title tooltip', re: '<p[^>]*\\stitle="[^"]+"', flags: 'i' },
          { label: 'All attributes in the opening tag', re: '<p\\s[^>]*>\\s*Save often!\\s*</p>', flags: 'i' },
        ],
        hint: 'Attributes go inside <p ...>, as name="value", separated by spaces.',
        explain: 'id names one element, class labels a group, and title shows when you hover.',
        preview: { css: '.note{background:#fff3c4;padding:6px}' },
      },
      {
        kind: 'write',
        prompt: 'Add a Sold out button that cannot be clicked, with a tooltip.',
        starter: '<h2>Concert tickets</h2>\n',
        solution: '<h2>Concert tickets</h2>\n<button disabled title="Try again tomorrow">Sold out</button>',
        checks: [
          { label: 'A button that says Sold out', re: '<button[^>]*>\\s*Sold out\\s*</button>', flags: 'i' },
          { label: 'It is disabled', re: '<button[^>]*\\sdisabled[\\s>=]', flags: 'i' },
          { label: 'It has a title', re: '<button[^>]*\\stitle="[^"]+"', flags: 'i' },
        ],
        hint: 'disabled is a boolean attribute: just write the word inside <button ...>.',
        explain: 'A boolean attribute switches on just by being there, so disabled needs no value.',
        preview: {},
      },
    ],
    // L5 The page skeleton
    [
      {
        kind: 'write',
        prompt: 'Write a whole page skeleton for “Gym Log”, from the doctype down.',
        starter: '',
        solution:
          '<!DOCTYPE html>\n<html lang="en">\n  <head>\n    <title>Gym Log</title>\n  </head>\n  <body>\n    <h1>Gym Log</h1>\n  </body>\n</html>',
        checks: [
          { label: 'Start with <!DOCTYPE html>', re: '^\\s*<!doctype html>', flags: 'i' },
          { label: '<html lang="en"> wraps the page', re: '<html\\s+lang="en">[\\s\\S]*</html>\\s*$', flags: 'i' },
          { label: 'A <head> with the title Gym Log', re: '<head>[\\s\\S]*<title>\\s*Gym Log\\s*</title>[\\s\\S]*</head>', flags: 'i' },
          { label: 'A <body> with an h1', re: '<body>[\\s\\S]*<h1>[\\s\\S]+</h1>[\\s\\S]*</body>', flags: 'i' },
          { label: 'The head comes before the body', re: '</head>[\\s\\S]*<body>', flags: 'i' },
        ],
        hint: 'Doctype, then html. Inside html: head (with title), then body (with what you see).',
        explain: 'Every page has this shape. The title shows in the browser tab; the body is the page itself.',
        preview: {},
      },
      {
        kind: 'write',
        prompt: 'This page is broken. Fix the skeleton so it is valid.',
        starter: '<html>\n  <body>\n    <title>Arcade</title>\n  </head>\n  <head>\n    <h1>Arcade</h1>\n  </body>\n',
        solution: '<!DOCTYPE html>\n<html lang="en">\n  <head>\n    <title>Arcade</title>\n  </head>\n  <body>\n    <h1>Arcade</h1>\n  </body>\n</html>',
        checks: [
          { label: 'Add the doctype', re: '^\\s*<!doctype html>', flags: 'i' },
          { label: 'Say the language with lang', re: '<html\\s+lang="[a-z-]+">', flags: 'i' },
          { label: 'The title goes in the head', re: '<head>\\s*<title>\\s*Arcade\\s*</title>\\s*</head>', flags: 'i' },
          { label: 'The h1 goes in the body', re: '<body>\\s*<h1>\\s*Arcade\\s*</h1>\\s*</body>', flags: 'i' },
          { label: 'Close the page with </html>', re: '</html>\\s*$', flags: 'i' },
        ],
        hint: 'head holds page info like the title; body holds what you see. Swap them back.',
        explain: 'The title belongs in head and visible content in body; </html> closes the whole page.',
        preview: {},
      },
    ],
  ],
};

export default unit;
