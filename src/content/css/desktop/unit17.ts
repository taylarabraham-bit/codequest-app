import type { DesktopUnit } from '../../../engine/types';

// Desktop edition: write-the-code challenges for CSS unit 17 (Logical properties & writing modes).
// lessons[i] runs after lesson i + 1. See docs/CONTENT_GUIDE.md.

const EVENT = '<div class="event" style="background:#eef">🎻 String quartet, Friday 8pm</div><div class="event" style="background:#fee">🎺 Jazz trio, Saturday 9pm</div>';
const QUOTE =
  '<blockquote class="quote" style="margin:0;background:#f6f6f6">Simplicity is the soul of efficiency.</blockquote><p>Next paragraph.</p>';
const MENU = '<ul style="list-style:none;padding:0"><li class="menu-item" style="background:#eee">🍕 Pizza</li><li class="menu-item" style="background:#ddd">🥗 Salad</li></ul>';
const CHAT =
  '<div class="bubble" style="background:#dfd;padding:6px">See you at 6!</div><div dir="rtl"><div class="bubble" style="background:#dfd;padding:6px">أراك في السادسة!</div></div>';
const NOTICE =
  '<div style="position:relative;width:220px;height:70px;background:#eef;padding:8px">📦 Parcel waiting<span class="badge" style="background:crimson;color:#fff;padding:2px 6px">2</span></div><div dir="rtl" style="position:relative;width:220px;height:70px;background:#eef;padding:8px;margin-top:8px">📦 طرد بانتظارك<span class="badge" style="background:crimson;color:#fff;padding:2px 6px">2</span></div>';
const PHOTO =
  '<div class="photo" style="height:90px;background:linear-gradient(#6cf,#396)"><div class="shade" style="background:rgba(0,0,0,0.4);color:#fff;padding:6px">Lake Bled</div></div><p><span class="aside" style="background:#ffe;padding:6px;width:90px">Best at dawn</span>The island church is reached by small wooden boats rowed from the shore.</p>';
const POEM =
  '<div style="display:flex;gap:16px;height:180px"><p class="poem" style="margin:0">古池や 蛙飛び込む 水の音</p><span class="label" style="background:#eee">Haiku</span></div>';
const SHELF =
  '<div style="display:flex;gap:4px;align-items:end"><span class="spine" style="background:#c33;color:#fff">Dune</span><span class="spine" style="background:#36c;color:#fff">Emma</span><span class="spine" style="background:#393;color:#fff">Beloved</span></div>';
const SIGN = '<div class="sign" style="background:#222;color:gold;font-weight:bold;padding:8px">HOTEL</div>';
const CARDS =
  '<div class="card" style="background:#f4f4f4;margin-bottom:8px">Read the guide <span class="arrow">➜</span></div><div dir="rtl"><div class="card" style="background:#f4f4f4">اقرأ الدليل <span class="arrow">➜</span></div></div>';

const unit: DesktopUnit = {
  lessons: [
    // L1 Inline and block
    [
      {
        kind: 'write',
        prompt: 'Space the event cards out with logical margin and padding.',
        starter: '',
        solution: '.event {\n  margin-block: 1rem;\n  padding-inline: 1.5rem;\n  padding-block: 0.5rem;\n}',
        checks: [
          { label: 'margin-block on .event', re: '\\.event\\s*\\{[^}]*margin-block(-start|-end)?\\s*:\\s*\\S', flags: 'i' },
          { label: 'padding-inline on .event', re: '\\.event\\s*\\{[^}]*padding-inline(-start|-end)?\\s*:\\s*\\S', flags: 'i' },
          { label: 'No physical margin-top or margin-bottom', re: '^(?![\\s\\S]*margin-(top|bottom|left|right)\\s*:)', flags: 'i' },
        ],
        hint: 'margin-block sets top and bottom in English; padding-inline sets left and right.',
        explain: 'Block is the way lines stack and inline the way text runs, so these follow the language.',
        preview: { html: EVENT },
      },
      {
        kind: 'write',
        prompt: 'Rewrite the quote’s physical spacing and border as logical properties.',
        starter:
          '.quote {\n  margin-top: 2rem;\n  margin-bottom: 2rem;\n  padding-left: 1.5rem;\n  padding-right: 1.5rem;\n  border-left: 4px solid teal;\n}\n',
        solution: '.quote {\n  margin-block: 2rem;\n  padding-inline: 1.5rem;\n  border-inline-start: 4px solid teal;\n}',
        checks: [
          { label: 'margin-block for top and bottom', re: 'margin-block(-start)?\\s*:\\s*\\S', flags: 'i' },
          { label: 'padding-inline for left and right', re: 'padding-inline(-start)?\\s*:\\s*\\S', flags: 'i' },
          { label: 'border-inline-start for the left border', re: 'border-inline-start\\s*:[^;}]*\\S', flags: 'i' },
          { label: 'No margin-top or margin-bottom left', re: '^(?![\\s\\S]*margin-(top|bottom)\\s*:)', flags: 'i' },
          { label: 'No padding-left or padding-right left', re: '^(?![\\s\\S]*padding-(left|right)\\s*:)', flags: 'i' },
          { label: 'No border-left left', not: 'border-left' },
        ],
        hint: 'Pairs of equal sides collapse into one logical shorthand. Left in English is inline-start.',
        explain: 'Logical properties turn with the text, so the quote bar sits on the right in a right-to-left page.',
        preview: { html: QUOTE },
      },
    ],
    // L2 Start, end & logical sizes
    [
      {
        kind: 'write',
        prompt: 'Indent the menu items at the start, set their width logically, and align text to start.',
        starter: '',
        solution: '.menu-item {\n  padding-inline-start: 1rem;\n  inline-size: 12rem;\n  text-align: start;\n}',
        checks: [
          { label: 'padding-inline-start', re: 'padding-inline-start\\s*:\\s*\\S', flags: 'i' },
          { label: 'inline-size instead of width', re: '(?<![\\w-])(max-|min-)?inline-size\\s*:\\s*\\S', flags: 'i' },
          { label: 'text-align: start', re: 'text-align\\s*:\\s*start', flags: 'i' },
        ],
        hint: 'width becomes inline-size; left becomes inline-start.',
        explain: 'These follow the writing direction, so the same rule works in English and Arabic.',
        preview: { html: MENU },
      },
      {
        kind: 'write',
        prompt: 'Make the chat bubble work in both directions with logical properties.',
        starter: '.bubble {\n  width: 60%;\n  margin-left: auto;\n  text-align: left;\n  border-right: 3px solid teal;\n}\n',
        solution: '.bubble {\n  inline-size: 60%;\n  margin-inline-start: auto;\n  text-align: start;\n  border-inline-end: 3px solid teal;\n}',
        checks: [
          { label: 'inline-size instead of width', re: '\\.bubble\\s*\\{[^}]*(?<![\\w-])inline-size\\s*:', flags: 'i' },
          { label: 'margin-inline-start: auto', re: 'margin-inline-start\\s*:\\s*auto', flags: 'i' },
          { label: 'text-align: start', re: 'text-align\\s*:\\s*start', flags: 'i' },
          { label: 'border-inline-end', re: 'border-inline-end\\s*:[^;}]*\\S', flags: 'i' },
          { label: 'No margin-left', not: 'margin-left' },
          { label: 'No border-right', not: 'border-right' },
        ],
        hint: 'Map each physical side to start or end, as it is in English.',
        explain: 'In the Arabic bubble, start is the right, so it now hugs the left and the bar flips sides.',
        preview: { html: CHAT },
      },
    ],
    // L3 Logical insets & corners
    [
      {
        kind: 'write',
        prompt: 'Pin the badge to the top end corner and round its bottom start corner.',
        starter: '',
        solution: '.badge {\n  position: absolute;\n  inset-block-start: 0;\n  inset-inline-end: 0;\n  border-end-start-radius: 8px;\n}',
        checks: [
          { label: 'position: absolute', re: 'position\\s*:\\s*absolute', flags: 'i' },
          { label: 'inset-block-start: 0', re: 'inset-block-start\\s*:\\s*0', flags: 'i' },
          { label: 'inset-inline-end: 0', re: 'inset-inline-end\\s*:\\s*0', flags: 'i' },
          { label: 'border-end-start-radius', re: 'border-end-start-radius\\s*:\\s*\\S', flags: 'i' },
        ],
        hint: 'Corners name the block side first, then the inline side.',
        explain: 'In the Arabic notice the badge jumps to the top-left by itself, because end follows the direction.',
        preview: { html: NOTICE },
      },
      {
        kind: 'write',
        prompt: 'Convert the shade, the floated aside and its corner to logical properties.',
        starter:
          '.photo { position: relative; }\n.shade {\n  position: absolute;\n  top: 0;\n  right: 0;\n  bottom: 0;\n  left: 0;\n}\n.aside {\n  float: right;\n  border-top-left-radius: 12px;\n}\n',
        solution:
          '.photo { position: relative; }\n.shade {\n  position: absolute;\n  inset: 0;\n}\n.aside {\n  float: inline-end;\n  border-start-start-radius: 12px;\n}',
        checks: [
          { label: 'inset: 0 on .shade', re: '\\.shade\\s*\\{[^}]*(?<![\\w-])inset\\s*:\\s*0', flags: 'i' },
          { label: 'float: inline-end', re: 'float\\s*:\\s*inline-end', flags: 'i' },
          { label: 'border-start-start-radius', re: 'border-start-start-radius\\s*:\\s*\\S', flags: 'i' },
          { label: 'No float: right', not: 'float: right' },
          { label: 'No border-top-left-radius', not: 'border-top-left-radius' },
          { label: 'No top, right, bottom or left offsets', re: '^(?![\\s\\S]*[\\s{;](top|right|bottom|left)\\s*:)', flags: 'i' },
        ],
        hint: 'inset sets all four offsets at once. Top-left is block-start, inline-start.',
        explain: 'inset replaces four lines, and the logical float and corner follow the text direction.',
        preview: { html: PHOTO },
      },
    ],
    // L4 Writing modes
    [
      {
        kind: 'write',
        prompt: 'Set the haiku in vertical columns, right to left, and make the label vertical too.',
        starter: '',
        solution: '.poem {\n  writing-mode: vertical-rl;\n  inline-size: 10rem;\n}\n.label {\n  writing-mode: vertical-lr;\n}',
        checks: [
          { label: '.poem uses writing-mode: vertical-rl', re: '\\.poem\\s*\\{[^}]*writing-mode\\s*:\\s*vertical-rl', flags: 'i' },
          { label: 'Cap the poem’s line length with inline-size', re: '\\.poem\\s*\\{[^}]*(max-)?inline-size\\s*:\\s*\\S', flags: 'i' },
          { label: '.label uses a vertical writing-mode too', re: '\\.label\\s*\\{[^}]*writing-mode\\s*:\\s*(vertical-(rl|lr)|sideways-(rl|lr))', flags: 'i' },
        ],
        hint: 'In vertical text, inline-size is the height of each column.',
        explain: 'Logical sizes turn with the writing mode, so inline-size limits how tall each column grows.',
        preview: { html: POEM },
      },
      {
        kind: 'write',
        prompt: 'Turn the books into vertical spines sized with logical properties.',
        starter: '.spine {\n  height: 8rem;\n  width: 2rem;\n}\n',
        solution: '.spine {\n  writing-mode: vertical-rl;\n  inline-size: 8rem;\n  block-size: 2rem;\n  padding-block: 0.25rem;\n}',
        checks: [
          { label: 'A vertical writing-mode', re: 'writing-mode\\s*:\\s*(vertical-(rl|lr)|sideways-(rl|lr))', flags: 'i' },
          { label: 'inline-size for the spine’s length', re: '(?<![\\w-])inline-size\\s*:\\s*\\S', flags: 'i' },
          { label: 'block-size for its thickness', re: '(?<![\\w-])block-size\\s*:\\s*\\S', flags: 'i' },
          { label: 'No physical height or width', re: '^(?![\\s\\S]*(?<![\\w-])(height|width)\\s*:)', flags: 'i' },
        ],
        hint: 'Once text is vertical, inline-size runs top to bottom and block-size runs across.',
        explain: 'Sized logically, the spine keeps its shape if you switch the writing mode back.',
        preview: { html: SHELF },
      },
    ],
    // L5 Direction, dir & orientation
    [
      {
        kind: 'write',
        prompt: 'Run the hotel sign vertically with each letter standing upright.',
        starter: '',
        solution: '.sign {\n  writing-mode: vertical-rl;\n  text-orientation: upright;\n  letter-spacing: 0.2em;\n}',
        checks: [
          { label: 'A vertical writing-mode', re: 'writing-mode\\s*:\\s*vertical-(rl|lr)', flags: 'i' },
          { label: 'text-orientation: upright', re: 'text-orientation\\s*:\\s*upright', flags: 'i' },
        ],
        hint: 'Vertical text lays Latin letters on their side unless you set text-orientation.',
        explain: 'upright stands each letter up, like a neon hotel sign.',
        preview: { html: SIGN },
      },
      {
        kind: 'write',
        prompt: 'Make the guide cards work right to left and flip the arrow there.',
        starter: '.card {\n  border-left: 4px solid teal;\n  padding-left: 1rem;\n}\n.card .arrow {\n  float: right;\n}\n',
        solution:
          '.card {\n  border-inline-start: 4px solid teal;\n  padding-inline-start: 1rem;\n}\n.card .arrow {\n  float: inline-end;\n}\n:dir(rtl) .arrow {\n  scale: -1 1;\n}',
        checks: [
          { label: 'border-inline-start on .card', re: 'border-inline-start\\s*:[^;}]*\\S', flags: 'i' },
          { label: 'padding-inline-start on .card', re: 'padding-inline-start\\s*:\\s*\\S', flags: 'i' },
          { label: 'float: inline-end for the arrow', re: 'float\\s*:\\s*inline-end', flags: 'i' },
          { label: 'Flip the arrow under :dir(rtl)', re: ':dir\\(\\s*rtl\\s*\\)[^{]*\\{[^}]*(scale\\s*:\\s*-1\\s+1|scalex\\(\\s*-1\\s*\\)|scale\\(\\s*-1\\s*,\\s*1\\s*\\)|rotate\\s*:\\s*y\\s+180deg)', flags: 'i' },
          { label: 'No physical left or right left', re: '^(?![\\s\\S]*(-left|-right|:\\s*right\\b))', flags: 'i' },
        ],
        hint: ':dir(rtl) matches inside dir="rtl". scale: -1 1 mirrors left to right.',
        explain: 'Logical properties flip the layout; only the arrow’s drawing needs a :dir(rtl) rule.',
        preview: { html: CARDS },
      },
    ],
  ],
};

export default unit;
