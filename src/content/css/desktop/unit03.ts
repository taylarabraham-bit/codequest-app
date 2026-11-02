import type { DesktopUnit } from '../../../engine/types';

// Desktop edition: write-the-code challenges for CSS unit 3 (Box model).
// lessons[i] runs after lesson i + 1. See docs/CONTENT_GUIDE.md.
const unit: DesktopUnit = {
  lessons: [
    // L1 Padding and margin
    [
      {
        kind: 'write',
        prompt: 'Give each sticky note a yellow fill, padding inside and a margin outside.',
        starter: '',
        solution: '.note {\n  background-color: lightyellow;\n  padding: 16px;\n  margin: 12px;\n}',
        checks: [
          { label: '.note has a background-color', re: '\\.note\\s*\\{[^}]*background-color\\s*:', flags: 'i' },
          { label: '.note has padding', re: '\\.note\\s*\\{[^}]*(?<![\\w-])padding(-[a-z]+)?\\s*:\\s*\\d', flags: 'i' },
          { label: '.note has a margin', re: '\\.note\\s*\\{[^}]*(?<![\\w-])margin(-[a-z]+)?\\s*:\\s*\\d', flags: 'i' },
        ],
        hint: 'padding: 16px; adds room inside the yellow. margin: 12px; pushes the notes apart.',
        explain: 'Padding grows the colored box around the text; margin is clear space between boxes.',
        preview: { html: '<div class="note">Call the vet at 3pm</div><div class="note">Buy dog food</div>' },
      },
      {
        kind: 'write',
        prompt: 'Pad each dish, space the dishes apart, and remove the h3’s margin.',
        starter: '.dish {\n  background-color: wheat;\n}\n.dish h3 {\n  color: brown;\n}',
        solution: '.dish {\n  background-color: wheat;\n  padding: 20px;\n  margin-bottom: 16px;\n}\n.dish h3 {\n  color: brown;\n  margin: 0;\n}',
        checks: [
          { label: 'Padding inside .dish', re: '\\.dish\\s*\\{[^}]*(?<![\\w-])padding(-[a-z]+)?\\s*:\\s*\\d', flags: 'i' },
          { label: 'A margin on .dish to space them out', re: '\\.dish\\s*\\{[^}]*(?<![\\w-])margin(-[a-z]+)?\\s*:\\s*\\d', flags: 'i' },
          { label: '.dish h3 gets margin: 0', re: '\\.dish\\s+h3\\s*\\{[^}]*(?<![\\w-])margin(-top)?\\s*:\\s*0(px)?\\s*[;}]', flags: 'i' },
        ],
        hint: 'Headings come with a default margin. Set it to 0 in the .dish h3 rule.',
        explain: 'Padding makes room inside the box, margin keeps boxes apart, and zeroing the h3 margin removes the default gap.',
        preview: {
          html: '<div class="dish"><h3>Ramen</h3><p>Pork broth, soft egg.</p></div><div class="dish"><h3>Gyoza</h3><p>Six pieces.</p></div>',
        },
      },
    ],
    // L2 Borders
    [
      {
        kind: 'write',
        prompt: 'Frame a photo card with a solid border and rounded corners.',
        starter: '',
        solution: '.photo {\n  padding: 12px;\n  border: 3px solid #333;\n  border-radius: 8px;\n}',
        checks: [
          {
            label: 'A solid border with a width',
            re: '\\.photo\\s*\\{[^}]*(?<![\\w-])border\\s*:(?=[^;}]*\\bsolid\\b)(?=[^;}]*\\d+(\\.\\d+)?(px|rem|em)\\b)',
            flags: 'i',
          },
          { label: 'Rounded corners with border-radius', re: '\\.photo\\s*\\{[^}]*border-radius\\s*:\\s*\\d', flags: 'i' },
        ],
        hint: 'border: width style color, like 3px solid black. border-radius rounds the corners.',
        explain: 'The border shorthand sets width, style and color at once; border-radius curves the corners of the whole box.',
        preview: { html: '<div class="photo">Beach day, summer 2025</div>' },
      },
      {
        kind: 'write',
        prompt: 'Make a coupon: dashed border, and a borderless button with round corners.',
        starter: '.coupon {\n  padding: 16px;\n}\n.coupon button {\n  background-color: gold;\n}',
        solution:
          '.coupon {\n  padding: 16px;\n  border: 2px dashed tomato;\n}\n.coupon button {\n  background-color: gold;\n  border: none;\n  border-radius: 999px;\n}',
        checks: [
          { label: 'A dashed border on .coupon', re: '\\.coupon\\s*\\{[^}]*(?<![\\w-])border\\s*:[^;}]*\\bdashed\\b', flags: 'i' },
          { label: 'Remove the button’s border', re: '\\.coupon\\s+button\\s*\\{[^}]*(?<![\\w-])border\\s*:\\s*(none|0)\\s*[;}]', flags: 'i' },
          { label: 'Round the button’s corners', re: '\\.coupon\\s+button\\s*\\{[^}]*border-radius\\s*:\\s*\\d', flags: 'i' },
        ],
        hint: 'border: none; removes a border. A big border-radius turns a button into a pill.',
        explain: 'Buttons come with a default border; border: none clears it so only your fill and radius show.',
        preview: { html: '<div class="coupon"><p>20% off any pizza</p><button>Claim</button></div>' },
      },
    ],
    // L3 Shorthand sides
    [
      {
        kind: 'write',
        prompt: 'Shape the chat bubble with one padding and one margin shorthand.',
        starter: '.bubble {\n  background-color: lightcyan;\n}',
        solution: '.bubble {\n  background-color: lightcyan;\n  padding: 8px 14px;\n  margin: 0 0 12px 40px;\n}',
        checks: [
          {
            label: 'padding: 8px top and bottom, 14px left and right',
            re: '(?<![\\w-])padding\\s*:\\s*8px\\s+14px(\\s+8px(\\s+14px)?)?\\s*[;}]',
            flags: 'i',
          },
          {
            label: 'margin: 12px bottom, 40px left, 0 top and right',
            re: '(?<![\\w-])margin\\s*:\\s*0(px)?\\s+0(px)?\\s+12px\\s+40px\\s*[;}]',
            flags: 'i',
          },
        ],
        hint: 'Two values mean top/bottom, then left/right. Four go clockwise: top, right, bottom, left.',
        explain: 'Shorthands set several sides in one line; four values always start at the top and go clockwise.',
        preview: { html: '<p class="bubble">See you at 7!</p><p class="bubble">Bring the map.</p>' },
      },
      {
        kind: 'write',
        prompt: 'Replace the eight longhands with one margin and one padding shorthand.',
        starter:
          '.banner {\n  width: 300px;\n  background-color: khaki;\n  margin-top: 0;\n  margin-right: auto;\n  margin-bottom: 24px;\n  margin-left: auto;\n  padding-top: 10px;\n  padding-right: 20px;\n  padding-bottom: 10px;\n  padding-left: 20px;\n}',
        solution: '.banner {\n  width: 300px;\n  background-color: khaki;\n  margin: 0 auto 24px;\n  padding: 10px 20px;\n}',
        checks: [
          { label: 'margin: 0 top, auto sides, 24px bottom', re: '(?<![\\w-])margin\\s*:\\s*0(px)?\\s+auto\\s+24px(\\s+auto)?\\s*[;}]', flags: 'i' },
          { label: 'padding: 10px top/bottom, 20px sides', re: '(?<![\\w-])padding\\s*:\\s*10px\\s+20px(\\s+10px(\\s+20px)?)?\\s*[;}]', flags: 'i' },
          { label: 'No -top/-right/-bottom/-left longhands left', re: '^(?![\\s\\S]*(margin|padding)-(top|right|bottom|left))' },
        ],
        hint: 'Three values mean top, left/right, bottom. Two values mean top/bottom, left/right.',
        explain: 'margin: 0 auto 24px and padding: 10px 20px say the same as all eight longhands.',
        preview: { html: '<div class="banner">Summer sale ends Sunday</div><p>Shop now before it’s gone.</p>' },
      },
    ],
    // L4 Width, height & box-sizing
    [
      {
        kind: 'write',
        prompt: 'Make the profile card exactly 260px wide, padding and border included.',
        starter: '',
        solution: '.profile {\n  box-sizing: border-box;\n  width: 260px;\n  padding: 20px;\n  border: 2px solid slateblue;\n}',
        checks: [
          { label: 'width: 260px', re: '\\.profile\\s*\\{[^}]*(?<![\\w-])width\\s*:\\s*260px', flags: 'i' },
          { label: 'Some padding', re: '\\.profile\\s*\\{[^}]*(?<![\\w-])padding(-[a-z]+)?\\s*:\\s*\\d', flags: 'i' },
          { label: 'box-sizing: border-box', has: 'box-sizing: border-box' },
        ],
        hint: 'By default padding is added on top of width. One property changes that.',
        explain: 'With border-box the 260px includes padding and border, so the card is exactly as wide as you said.',
        preview: { html: '<div class="profile"><h3>Ada</h3><p>Backend developer, Lisbon</p></div>' },
      },
      {
        kind: 'write',
        prompt: 'Stop the progress bar spilling out, then add a 60% wide fill inside it.',
        starter: '.bar {\n  width: 100%;\n  height: 32px;\n  padding: 4px;\n  border: 4px solid teal;\n}',
        solution:
          '.bar {\n  box-sizing: border-box;\n  width: 100%;\n  height: 32px;\n  padding: 4px;\n  border: 4px solid teal;\n}\n.fill {\n  width: 60%;\n  height: 100%;\n  background-color: teal;\n}',
        checks: [
          { label: 'box-sizing: border-box for the bar', has: 'box-sizing: border-box' },
          { label: '.fill width in %', re: '\\.fill\\s*\\{[^}]*(?<![\\w-])width\\s*:\\s*\\d+(\\.\\d+)?%', flags: 'i' },
          { label: '.fill has a height', re: '\\.fill\\s*\\{[^}]*(?<![\\w-])height\\s*:\\s*\\d', flags: 'i' },
          { label: '.fill has a background-color', re: '\\.fill\\s*\\{[^}]*background(-color)?\\s*:', flags: 'i' },
        ],
        hint: 'width: 100% plus padding and border is wider than its parent. border-box fixes that.',
        explain: 'border-box keeps the bar at 100% wide, and a % width on .fill is measured against the bar’s inside.',
        preview: { html: '<p>Uploading…</p><div class="bar"><div class="fill"></div></div>' },
      },
    ],
    // L5 Centering with auto
    [
      {
        kind: 'write',
        prompt: 'Give the blog post a width and center it on the page.',
        starter: '',
        solution: '.post {\n  width: 320px;\n  margin: 0 auto;\n  background-color: ivory;\n}',
        checks: [
          { label: 'A width on .post', re: '\\.post\\s*\\{[^}]*(?<![\\w-])(max-)?width\\s*:\\s*\\d', flags: 'i' },
          {
            label: 'Center it with auto left and right margins',
            re: '\\.post\\s*\\{[^}]*((?<![\\w-])margin\\s*:\\s*[\\w.]+\\s+auto(\\s+[\\w.]+)?\\s*[;}]|(?<![\\w-])margin\\s*:\\s*auto\\s*[;}]|margin-inline\\s*:\\s*auto|margin-left\\s*:\\s*auto)',
            flags: 'i',
          },
        ],
        hint: 'A block needs a width first, then margin: 0 auto; shares the leftover space.',
        explain: 'auto on the left and right splits the spare space evenly, so the post sits in the middle.',
        preview: { html: '<div class="post"><h2>Day 3: Kyoto</h2><p>Temples in the morning, ramen at night.</p></div>' },
      },
      {
        kind: 'write',
        prompt: 'The modal hugs the left edge. Give it a width and center it.',
        starter: '.modal {\n  margin: auto 0;\n  padding: 24px;\n  border: 2px solid #333;\n}',
        solution: '.modal {\n  width: 280px;\n  margin: 40px auto;\n  padding: 24px;\n  border: 2px solid #333;\n}',
        checks: [
          { label: 'A width on .modal', re: '\\.modal\\s*\\{[^}]*(?<![\\w-])(max-)?width\\s*:\\s*\\d', flags: 'i' },
          {
            label: 'auto for the left and right margins',
            re: '\\.modal\\s*\\{[^}]*((?<![\\w-])margin\\s*:\\s*[\\w.]+\\s+auto(\\s+[\\w.]+)?\\s*[;}]|(?<![\\w-])margin\\s*:\\s*auto\\s*[;}]|margin-inline\\s*:\\s*auto|margin-left\\s*:\\s*auto)',
            flags: 'i',
          },
          { label: 'Keep the border', re: '\\.modal\\s*\\{[^}]*(?<![\\w-])border\\s*:', flags: 'i' },
        ],
        hint: 'margin: auto 0 puts auto on top and bottom. Which value is for the sides?',
        explain: 'With two values the second one sets left and right, so margin: 40px auto centers the box.',
        preview: { html: '<div class="modal"><h3>Delete file?</h3><p>This can’t be undone.</p></div>' },
      },
    ],
  ],
};

export default unit;
