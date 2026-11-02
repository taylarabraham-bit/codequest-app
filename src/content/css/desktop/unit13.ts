import type { DesktopUnit } from '../../../engine/types';

// Desktop edition: write-the-code challenges for CSS unit 13 (Typography & web fonts).
// lessons[i] runs after lesson i + 1. See docs/CONTENT_GUIDE.md.

const GENERIC = '(serif|sans-serif|monospace|cursive|fantasy|system-ui|ui-serif|ui-sans-serif|ui-monospace|ui-rounded|math)';

const DOCS =
  '<h1>CLI Handbook</h1><p>Install the tool, then run <code>quest init</code> in your project folder.</p>';
const BAKERY = '<h1>Crumb &amp; Co. Bakery</h1><p>Sourdough every morning from 7.</p>';
const POSTER = '<h1>Summer Sale</h1><p class="lead">Up to 50% off every tent.</p>';
const MAG =
  '<h1 class="headline">Inside the Night Market</h1><blockquote class="quote">The best noodles I have ever eaten.</blockquote>';
const TAG =
  '<span class="label">New arrival</span><article><p>These waterproof hiking boots are built for long, muddy days on the trail. A grippy sole keeps you steady on wet rock, and the padded collar keeps blisters away.</p></article>';
const POST =
  '<div class="post"><h2>Spring planting</h2><p>Start tomatoes indoors six weeks before the last frost.</p><p>Harden them off outside for a week before planting.</p><span class="tag">Garden</span></div>';
const NEWS =
  '<div lang="en" style="width:220px"><h1>Council approves the new riverside cycling bridge</h1><p>Construction of the internationally recognised, energy-efficient footbridge starts in spring.</p></div>';
const FILES =
  '<ul style="list-style:none;padding:0"><li class="file">holiday-photos-2026-final-final-v3.zip</li><li class="file">budget.xlsx</li><li class="file">meeting-notes-with-the-whole-marketing-team.docx</li></ul>';
const REVIEW =
  '<div class="review" style="width:240px"><b>★★★★☆</b><p class="excerpt">Lovely little café with great coffee and friendly staff. The cinnamon buns were warm and the window seats get the morning sun. Only downside: it gets busy around noon, so come early if you want a table.</p></div>';
const RECEIPT =
  '<table class="receipt"><tr><td>Coffee</td><td class="price">3.50</td></tr><tr><td>Bagel</td><td class="price">11.00</td></tr><tr><td class="total">Total</td><td class="price total">14.50</td></tr></table><p class="note" style="width:220px">Thanks for visiting! Bring this receipt next time for 10% off any drink, valid for thirty days from the date printed above.</p>';

const unit: DesktopUnit = {
  lessons: [
    // L1 Font stacks & @font-face
    [
      {
        kind: 'write',
        prompt: 'Give the docs page a body font stack and a monospace stack for code.',
        starter: '',
        solution:
          'body {\n  font-family: "Segoe UI", Roboto, system-ui, sans-serif;\n}\ncode {\n  font-family: Consolas, "Cascadia Code", ui-monospace, monospace;\n}',
        checks: [
          {
            label: 'body font-family lists fonts and ends with a generic family',
            re: `body\\s*\\{[^}]*font-family\\s*:[^;}]*,\\s*${GENERIC}\\s*(;|\\})`,
            flags: 'i',
          },
          { label: 'code font-family ends with monospace or ui-monospace', re: 'code\\s*\\{[^}]*font-family\\s*:[^;}]*(ui-)?monospace\\s*(;|\\})', flags: 'i' },
        ],
        hint: 'Separate fonts with commas, quote names with spaces, and finish with a bare generic like sans-serif.',
        explain: 'The browser uses the first font it has. The generic at the end means there is always a fallback.',
        preview: { html: DOCS },
      },
      {
        kind: 'write',
        prompt: 'Load Bricolage from /fonts/bricolage.woff2 and use it for the heading.',
        starter: 'h1 {\n  font-size: 2rem;\n}\n',
        solution:
          '@font-face {\n  font-family: "Bricolage";\n  src: url("/fonts/bricolage.woff2") format("woff2");\n  font-display: swap;\n}\nh1 {\n  font-size: 2rem;\n  font-family: "Bricolage", Georgia, serif;\n}',
        checks: [
          { label: 'An @font-face named Bricolage', re: '@font-face\\s*\\{[^}]*font-family\\s*:\\s*["\']?Bricolage', flags: 'i' },
          { label: 'src: url(…) with format("woff2")', re: '@font-face\\s*\\{[^}]*src\\s*:\\s*url\\(\\s*["\']?/fonts/bricolage\\.woff2["\']?\\s*\\)\\s*format\\(\\s*["\']?woff2', flags: 'i' },
          { label: 'The h1 uses Bricolage first, with a fallback after it', re: 'h1\\s*\\{[^}]*font-family\\s*:\\s*["\']?Bricolage["\']?\\s*,\\s*\\S', flags: 'i' },
        ],
        hint: '@font-face { font-family: …; src: url(…) format(…); } then use the same name in a stack.',
        explain: 'The name in @font-face is yours to pick; any font-family that uses it loads the file.',
        preview: { html: BAKERY },
      },
    ],
    // L2 Weights, styles & variable fonts
    [
      {
        kind: 'write',
        prompt: 'Load Recursive as a variable font and use an in-between weight on the heading.',
        starter: '',
        solution:
          '@font-face {\n  font-family: "Recursive";\n  src: url("recursive.woff2") format("woff2");\n  font-weight: 300 1000;\n}\nh1 {\n  font-family: "Recursive", sans-serif;\n  font-weight: 750;\n}',
        checks: [
          { label: '@font-face with a src and a font-weight range like 100 900', re: '@font-face\\s*\\{(?=[^}]*src\\s*:)[^}]*font-weight\\s*:\\s*\\d{3,4}\\s+\\d{3,4}', flags: 'i' },
          { label: 'The h1 uses the font', re: 'h1\\s*\\{[^}]*font-family\\s*:\\s*["\']?Recursive', flags: 'i' },
          { label: 'A weight between the steps, like 750', re: 'h1\\s*\\{[^}]*font-weight\\s*:\\s*\\d(?:[1-9]\\d|\\d[1-9])\\b', flags: 'i' },
        ],
        hint: 'In @font-face, font-weight takes two numbers for a range. Then any weight in it works.',
        explain: 'A variable font holds every weight in one file, so 750 is real, not rounded to 700.',
        preview: { html: POSTER },
      },
      {
        kind: 'write',
        prompt: 'Make the headline narrow and heavy with axes, and italicize the quote.',
        starter:
          '@font-face {\n  font-family: "Roboto Flex";\n  src: url("roboto-flex.woff2") format("woff2");\n  font-weight: 100 1000;\n}\nbody {\n  font-family: "Roboto Flex", sans-serif;\n}\n',
        solution:
          '@font-face {\n  font-family: "Roboto Flex";\n  src: url("roboto-flex.woff2") format("woff2");\n  font-weight: 100 1000;\n}\nbody {\n  font-family: "Roboto Flex", sans-serif;\n}\n.headline {\n  font-variation-settings: "wght" 800, "wdth" 75;\n}\n.quote {\n  font-style: italic;\n}',
        checks: [
          { label: 'Set the "wght" axis on .headline', re: '\\.headline\\s*\\{[^}]*font-variation-settings\\s*:[^;}]*["\']wght["\']\\s+\\d', flags: 'i' },
          { label: 'Set the "wdth" axis in the same declaration', re: 'font-variation-settings\\s*:[^;}]*["\']wdth["\']\\s+\\d', flags: 'i' },
          { label: 'Italicize .quote with font-style', re: '\\.quote\\s*\\{[^}]*font-style\\s*:\\s*(italic|oblique)', flags: 'i' },
        ],
        hint: 'Quote each 4-letter axis tag, follow it with a number, and separate axes with commas.',
        explain: 'font-variation-settings dials axes directly, so one font file can be both narrow and bold.',
        preview: { html: MAG },
      },
    ],
    // L3 Lines, spacing & case
    [
      {
        kind: 'write',
        prompt: 'Make the label uppercase and airy, and keep the article readable.',
        starter: '',
        solution:
          '.label {\n  text-transform: uppercase;\n  letter-spacing: 0.1em;\n}\narticle {\n  max-width: 60ch;\n  line-height: 1.6;\n}',
        checks: [
          { label: 'Uppercase .label with text-transform', re: '\\.label\\s*\\{[^}]*text-transform\\s*:\\s*uppercase', flags: 'i' },
          { label: 'letter-spacing in em', re: 'letter-spacing\\s*:\\s*[\\d.]+em', flags: 'i' },
          { label: 'article max-width in ch', re: 'article\\s*\\{[^}]*max-(width|inline-size)\\s*:\\s*[\\d.]+ch', flags: 'i' },
          { label: 'A unitless line-height on article', re: 'article\\s*\\{[^}]*line-height\\s*:\\s*[\\d.]+\\s*(;|\\})', flags: 'i' },
        ],
        hint: 'About 60–70ch makes a comfy line length. Leave the unit off line-height.',
        explain: 'Em spacing grows with the text, ch caps the line length, and a unitless line-height scales for every child.',
        preview: { html: TAG },
      },
      {
        kind: 'write',
        prompt: 'Fix the spacing so it scales with the text, and gap paragraphs by one line.',
        starter: '.post {\n  font-size: 16px;\n  line-height: 24px;\n}\n.post h2 {\n  font-size: 32px;\n}\n.tag {\n  letter-spacing: 2px;\n}\n',
        solution:
          '.post {\n  font-size: 16px;\n  line-height: 1.5;\n}\n.post h2 {\n  font-size: 32px;\n}\n.post p + p {\n  margin-top: 1lh;\n}\n.tag {\n  letter-spacing: 0.1em;\n}',
        checks: [
          { label: 'A unitless line-height on .post', re: '\\.post\\s*\\{[^}]*line-height\\s*:\\s*[\\d.]+\\s*(;|\\})', flags: 'i' },
          { label: 'letter-spacing on .tag in em', re: '\\.tag\\s*\\{[^}]*letter-spacing\\s*:\\s*[\\d.]+em', flags: 'i' },
          { label: 'A one-line gap between paragraphs, in lh', re: 'margin(-top|-block-start|-block)?\\s*:\\s*[\\d.]+lh', flags: 'i' },
          { label: 'No fixed line-height: 24px', not: 'line-height: 24px' },
        ],
        hint: '24px is 1.5 times 16px. 1lh is exactly one line-height.',
        explain: 'A fixed 24px line-height cramps the 32px heading; a ratio recomputes for each element.',
        preview: { html: POST },
      },
    ],
    // L4 Wrapping & truncating
    [
      {
        kind: 'write',
        prompt: 'Balance the headline, polish the paragraph wrap, and hyphenate long words.',
        starter: '',
        solution: 'h1 {\n  text-wrap: balance;\n}\np {\n  text-wrap: pretty;\n  hyphens: auto;\n}',
        checks: [
          { label: 'text-wrap: balance on the h1', re: 'h1\\s*\\{[^}]*text-wrap(-style)?\\s*:\\s*balance', flags: 'i' },
          { label: 'text-wrap: pretty on the paragraph', re: 'p\\s*\\{[^}]*text-wrap(-style)?\\s*:\\s*pretty', flags: 'i' },
          { label: 'hyphens: auto on the paragraph', re: 'p\\s*\\{[^}]*hyphens\\s*:\\s*auto', flags: 'i' },
        ],
        hint: 'balance suits short headings; pretty suits paragraphs. The markup already has lang="en".',
        explain: 'Balanced headings avoid one long line and one short one, and auto hyphens need a lang to know the words.',
        preview: { html: NEWS },
      },
      {
        kind: 'write',
        prompt: 'Cut long file names off with … on a single line.',
        starter: '.file {\n  width: 160px;\n}\n',
        solution: '.file {\n  width: 160px;\n  white-space: nowrap;\n  overflow: hidden;\n  text-overflow: ellipsis;\n}',
        checks: [
          { label: 'Keep it on one line (white-space: nowrap)', re: '(white-space|text-wrap|text-wrap-mode)\\s*:\\s*nowrap', flags: 'i' },
          { label: 'Hide what spills out', re: '(?<![\\w-])overflow(-x)?\\s*:\\s*(hidden|clip)', flags: 'i' },
          { label: 'Show … with text-overflow: ellipsis', re: 'text-overflow\\s*:\\s*ellipsis', flags: 'i' },
        ],
        hint: 'You need all three: no wrapping, hidden overflow, and an ellipsis.',
        explain: 'text-overflow only kicks in when text overflows a single line and the overflow is hidden.',
        preview: { html: FILES },
      },
    ],
    // L5 Line clamps & numerals
    [
      {
        kind: 'write',
        prompt: 'Clamp the review excerpt to three lines.',
        starter: '',
        solution: '.excerpt {\n  display: -webkit-box;\n  -webkit-box-orient: vertical;\n  -webkit-line-clamp: 3;\n  overflow: hidden;\n}',
        checks: [
          { label: 'display: -webkit-box', has: 'display: -webkit-box' },
          { label: '-webkit-box-orient: vertical', has: '-webkit-box-orient: vertical' },
          { label: '-webkit-line-clamp: 3', re: '-webkit-line-clamp\\s*:\\s*3\\b', flags: 'i' },
          { label: 'overflow: hidden', re: '(?<![\\w-])overflow\\s*:\\s*hidden', flags: 'i' },
        ],
        hint: 'The clamp needs the whole prefixed set plus overflow: hidden.',
        explain: 'Every browser supports this prefixed set, and it adds the … for you on the last line.',
        preview: { html: REVIEW },
      },
      {
        kind: 'write',
        prompt: 'Line up the receipt’s prices and clamp the note to two lines.',
        starter: '.total {\n  font-weight: bold;\n}\n',
        solution:
          '.total {\n  font-weight: bold;\n}\n.price {\n  font-variant-numeric: tabular-nums;\n  text-align: right;\n}\n.note {\n  display: -webkit-box;\n  -webkit-box-orient: vertical;\n  -webkit-line-clamp: 2;\n  overflow: hidden;\n}',
        checks: [
          { label: 'Tabular digits on .price', re: '\\.price\\s*\\{[^}]*(font-variant-numeric\\s*:[^;}]*tabular-nums|font-feature-settings\\s*:[^;}]*["\']tnum["\'])', flags: 'i' },
          { label: 'Right-align .price', re: '\\.price\\s*\\{[^}]*text-align\\s*:\\s*(right|end)', flags: 'i' },
          { label: 'Clamp .note to 2 lines', re: '\\.note\\s*\\{[^}]*-webkit-line-clamp\\s*:\\s*2\\b', flags: 'i' },
          { label: 'The rest of the clamp set on .note', re: '\\.note\\s*\\{(?=[^}]*display\\s*:\\s*-webkit-box)(?=[^}]*-webkit-box-orient\\s*:\\s*vertical)(?=[^}]*overflow\\s*:\\s*hidden)', flags: 'i' },
        ],
        hint: 'tabular-nums makes every digit the same width. The clamp needs display, orient, clamp and overflow.',
        explain: 'Same-width digits keep the decimal points in a column, and the clamp keeps the note short.',
        preview: { html: RECEIPT },
      },
    ],
  ],
};

export default unit;
