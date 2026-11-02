import type { DesktopUnit } from '../../../engine/types';

// Desktop edition: write-the-code challenges for CSS unit 18 (Anchor positioning).
// lessons[i] runs after lesson i + 1. See docs/CONTENT_GUIDE.md.

// Matches when the name given to anchor-name is the one position-anchor uses (either order).
const SAME_ANCHOR =
  'anchor-name\\s*:\\s*(--[\\w-]+)[\\s\\S]*position-anchor\\s*:\\s*\\1(?![\\w-])|position-anchor\\s*:\\s*(--[\\w-]+)[\\s\\S]*anchor-name\\s*:\\s*\\2(?![\\w-])';

const PROFILE =
  '<div style="padding:30px"><span class="avatar" style="display:inline-block;width:56px;height:56px;border-radius:50%;background:#fc9;text-align:center;line-height:56px">🦊</span><span class="status" style="width:12px;height:12px;border-radius:50%;background:limegreen"></span></div>';
const CART =
  '<div style="padding:30px"><button class="cart" style="font-size:22px">🛒</button><span class="count" style="background:crimson;color:#fff;border-radius:9px;padding:0 6px;font-size:12px">3</span></div>';
const HELP =
  '<div style="padding:20px 20px 60px"><button class="help">❓ Help</button><div class="tip" style="background:#222;color:#fff;padding:4px 8px;font-size:13px">Ask us anything</div></div>';
const SIGNUP =
  '<div style="padding:20px"><input id="email" placeholder="Email"><br><br><input id="pw" type="password" placeholder="Password"><span class="hint" style="font-size:12px;color:#555;margin-left:8px">We send a code here</span></div>';
const NAV =
  '<div style="padding:20px 20px 90px"><button class="nav-btn" style="padding:6px 24px">Products ▾</button><ul class="menu" style="margin:0;padding:6px;list-style:none;background:#fff;border:1px solid #ccc"><li>Shoes</li><li>Bags</li><li>Hats</li></ul></div>';
const BELL =
  '<div style="padding:30px 30px 60px"><button class="bell" style="font-size:24px;padding:4px 16px">🔔</button><span class="dot" style="width:10px;height:10px;border-radius:50%;background:crimson"></span><span class="label" style="background:#eee;font-size:12px;text-align:center">Inbox</span></div>';
const SAVE =
  '<div style="padding:60px 20px 20px"><button class="save">💾 Save</button><div class="tip" style="background:#222;color:#fff;padding:4px 8px;font-size:13px">Ctrl+S</div></div>';
const SORT =
  '<div style="padding:20px 20px 90px 140px"><button class="sort">Sort ▸</button><ul class="menu" style="margin:0;padding:6px;list-style:none;background:#fff;border:1px solid #ccc"><li>Newest</li><li>Price</li></ul></div>';
const SHARE =
  '<button class="share-btn" popovertarget="share">Share</button><div id="share" popover style="padding:8px">📋 Copy link<br>✉️ Email</div>';
const PROFILE_MENU =
  '<button class="me" popovertarget="menu">Kai ▾</button><div id="menu" popover style="padding:8px">⚙️ Settings<br>🚪 Log out</div>';

const unit: DesktopUnit = {
  lessons: [
    // L1 Naming an anchor
    [
      {
        kind: 'write',
        prompt: 'Anchor the green status dot to the avatar’s bottom-right corner.',
        starter: '',
        solution:
          '.avatar {\n  anchor-name: --avatar;\n}\n.status {\n  position: absolute;\n  position-anchor: --avatar;\n  position-area: bottom right;\n}',
        checks: [
          { label: 'Name the avatar with anchor-name: --something', re: '\\.avatar\\s*\\{[^}]*anchor-name\\s*:\\s*--[\\w-]+', flags: 'i' },
          { label: 'position-anchor uses the same name', re: SAME_ANCHOR, flags: 'i' },
          { label: '.status is position: absolute', re: '\\.status\\s*\\{[^}]*position\\s*:\\s*(absolute|fixed)', flags: 'i' },
          { label: 'Place it with position-area', re: '\\.status\\s*\\{[^}]*position-area\\s*:\\s*[a-z]', flags: 'i' },
        ],
        hint: 'Anchor names start with two dashes. The dot needs position: absolute to be placed.',
        explain: 'anchor-name marks the avatar, and position-anchor ties the dot to it wherever the avatar moves.',
        preview: { html: PROFILE },
      },
      {
        kind: 'write',
        prompt: 'Fix the cart counter so it sits on the cart’s top-right corner.',
        starter: '.cart {\n  anchor-name: cart;\n}\n.count {\n  position: static;\n  position-anchor: --cart;\n  position-area: top right;\n}\n',
        solution: '.cart {\n  anchor-name: --cart;\n}\n.count {\n  position: absolute;\n  position-anchor: --cart;\n  position-area: top right;\n}',
        checks: [
          { label: 'anchor-name: --cart (with two dashes)', has: 'anchor-name: --cart' },
          { label: '.count is absolutely positioned', re: '\\.count\\s*\\{[^}]*position\\s*:\\s*(absolute|fixed)', flags: 'i' },
          { label: 'No position: static', not: 'position: static' },
          { label: 'Keep position-anchor: --cart', has: 'position-anchor: --cart' },
        ],
        hint: 'Two bugs: the name needs --, and a static box can’t be placed.',
        explain: 'Anchor names are dashed idents like custom properties, and only absolute or fixed boxes can be anchored.',
        preview: { html: CART },
      },
    ],
    // L2 The anchor() function
    [
      {
        kind: 'write',
        prompt: 'Place the help tip under the button, lined up with its left edge.',
        starter: '.help {\n  anchor-name: --help;\n}\n',
        solution:
          '.help {\n  anchor-name: --help;\n}\n.tip {\n  position: absolute;\n  position-anchor: --help;\n  top: anchor(bottom);\n  left: anchor(left);\n}',
        checks: [
          { label: '.tip is position: absolute', re: '\\.tip\\s*\\{[^}]*position\\s*:\\s*(absolute|fixed)', flags: 'i' },
          { label: 'It uses the --help anchor', re: '\\.tip\\s*\\{[^}]*(position-anchor\\s*:\\s*--help\\b|anchor\\(\\s*--help\\s)', flags: 'i' },
          { label: 'top: anchor(bottom)', re: '(?<![\\w-])(top|inset-block-start)\\s*:\\s*anchor\\(\\s*(--help\\s+)?bottom\\s*\\)', flags: 'i' },
          { label: 'left: anchor(left)', re: '(?<![\\w-])(left|inset-inline-start)\\s*:\\s*anchor\\(\\s*(--help\\s+)?(left|start)\\s*\\)', flags: 'i' },
        ],
        hint: 'top: anchor(bottom) puts the tip’s top edge on the button’s bottom edge.',
        explain: 'anchor() reads an edge of the anchor, so the tip follows the button wherever it goes.',
        preview: { html: HELP },
      },
      {
        kind: 'write',
        prompt: 'Put the hint just right of the email field, naming the anchor inside anchor().',
        starter: '#email {\n  anchor-name: --email;\n}\n#pw {\n  anchor-name: --pw;\n}\n',
        solution:
          '#email {\n  anchor-name: --email;\n}\n#pw {\n  anchor-name: --pw;\n}\n.hint {\n  position: absolute;\n  left: anchor(--email right);\n  top: anchor(--email top);\n}',
        checks: [
          { label: '.hint is absolutely positioned', re: '\\.hint\\s*\\{[^}]*position\\s*:\\s*(absolute|fixed)', flags: 'i' },
          { label: 'left: anchor(--email right)', re: '(?<![\\w-])(left|inset-inline-start)\\s*:[^;}]*anchor\\(\\s*--email\\s+(right|end)\\s*\\)', flags: 'i' },
          { label: 'top: anchor(--email …) to line it up', re: '(?<![\\w-])(top|inset-block-start)\\s*:[^;}]*anchor\\(\\s*--email\\s+(top|start|center|bottom)\\s*\\)', flags: 'i' },
        ],
        hint: 'Name the anchor first inside the function: anchor(--email right).',
        explain: 'With two anchors on the page, naming one inside anchor() picks it without a position-anchor line.',
        preview: { html: SIGNUP },
      },
    ],
    // L3 position-area & anchor-size()
    [
      {
        kind: 'write',
        prompt: 'Drop the products menu below its button, stretching right, at least as wide.',
        starter: '',
        solution:
          '.nav-btn {\n  anchor-name: --nav;\n}\n.menu {\n  position: absolute;\n  position-anchor: --nav;\n  position-area: bottom span-right;\n  min-width: anchor-size(width);\n}',
        checks: [
          { label: 'An anchor-name on .nav-btn that .menu uses', re: SAME_ANCHOR, flags: 'i' },
          { label: '.menu is absolutely positioned', re: '\\.menu\\s*\\{[^}]*position\\s*:\\s*(absolute|fixed)', flags: 'i' },
          { label: 'position-area: bottom span-right', re: 'position-area\\s*:\\s*(bottom\\s+span-(right|x-end)|span-(right|x-end)\\s+bottom)', flags: 'i' },
          { label: 'A min-width from anchor-size(width)', re: '(min-width|width|min-inline-size|inline-size)\\s*:\\s*anchor-size\\(\\s*(--[\\w-]+\\s*)?(width|inline|self-inline)?\\s*\\)', flags: 'i' },
        ],
        hint: 'position-area picks a cell of the 3×3 grid; anchor-size(width) reads the button’s width.',
        explain: 'span-right starts under the button and grows right, and anchor-size keeps the menu at least as wide.',
        preview: { html: NAV },
      },
      {
        kind: 'write',
        prompt: 'Sit the dot on the bell’s top-right corner and the label below, as wide as it.',
        starter:
          '.bell { anchor-name: --bell; }\n.dot {\n  position: absolute;\n  position-anchor: --bell;\n  /* top-right corner */\n}\n.label {\n  position: absolute;\n  position-anchor: --bell;\n  /* below, same width */\n}\n',
        solution:
          '.bell { anchor-name: --bell; }\n.dot {\n  position: absolute;\n  position-anchor: --bell;\n  position-area: top right;\n}\n.label {\n  position: absolute;\n  position-anchor: --bell;\n  position-area: bottom;\n  width: anchor-size(width);\n}',
        checks: [
          { label: '.dot: position-area: top right', re: '\\.dot\\s*\\{[^}]*position-area\\s*:\\s*(top\\s+right|right\\s+top)', flags: 'i' },
          { label: '.label: position-area: bottom', re: '\\.label\\s*\\{[^}]*position-area\\s*:\\s*bottom', flags: 'i' },
          { label: '.label width from anchor-size()', re: '\\.label\\s*\\{[^}]*(width|inline-size)\\s*:\\s*anchor-size\\(', flags: 'i' },
        ],
        hint: 'Two keywords pick a corner cell; anchor-size(width) copies the bell’s width.',
        explain: 'position-area handles placement in one line, and anchor-size() sizes the label from the anchor.',
        preview: { html: BELL },
      },
    ],
    // L4 Fallbacks when space runs out
    [
      {
        kind: 'write',
        prompt: 'Show the shortcut tip above Save, flipping below if there’s no room.',
        starter: '.save {\n  anchor-name: --save;\n}\n',
        solution:
          '.save {\n  anchor-name: --save;\n}\n.tip {\n  position: absolute;\n  position-anchor: --save;\n  position-area: top;\n  position-try-fallbacks: flip-block;\n}',
        checks: [
          { label: '.tip anchored to --save', re: '\\.tip\\s*\\{(?=[^}]*position\\s*:\\s*(absolute|fixed))[^}]*position-anchor\\s*:\\s*--save\\b', flags: 'i' },
          { label: 'position-area: top', re: '\\.tip\\s*\\{[^}]*position-area\\s*:\\s*top\\b', flags: 'i' },
          { label: 'position-try-fallbacks: flip-block', re: 'position-try-fallbacks\\s*:[^;}]*(flip-block|bottom)', flags: 'i' },
        ],
        hint: 'flip-block mirrors top and bottom when the first spot would overflow.',
        explain: 'The browser tries the fallback only when the tip would be cut off at the top of the screen.',
        preview: { html: SAVE },
      },
      {
        kind: 'write',
        prompt: 'Open the sort menu to the right, with a custom left-side fallback.',
        starter: '.sort {\n  anchor-name: --sort;\n}\n.menu {\n  position: absolute;\n  position-anchor: --sort;\n}\n',
        solution:
          '.sort {\n  anchor-name: --sort;\n}\n.menu {\n  position: absolute;\n  position-anchor: --sort;\n  position-area: right span-bottom;\n  position-try-fallbacks: --left-side, flip-block;\n}\n@position-try --left-side {\n  position-area: left span-bottom;\n}',
        checks: [
          { label: '.menu opens to the right', re: '\\.menu\\s*\\{[^}]*position-area\\s*:\\s*([\\w-]+\\s+)?right\\b', flags: 'i' },
          { label: 'An @position-try --name with a position-area', re: '@position-try\\s+--[\\w-]+\\s*\\{[^}]*position-area\\s*:', flags: 'i' },
          {
            label: 'position-try-fallbacks lists that name',
            re: '@position-try\\s+(--[\\w-]+)[\\s\\S]*position-try-fallbacks\\s*:[^;}]*\\1(?![\\w-])|position-try-fallbacks\\s*:([^;}]*?)(--[\\w-]+)[\\s\\S]*@position-try\\s+\\3(?![\\w-])',
            flags: 'i',
          },
          { label: 'Plus a second fallback after a comma', re: 'position-try-fallbacks\\s*:[^;}]*,', flags: 'i' },
        ],
        hint: '@position-try --left-side { position-area: left; } then list --left-side in the fallbacks.',
        explain: 'Fallbacks are tried in order; a custom @position-try can change the area and more.',
        preview: { html: SORT },
      },
    ],
    // L5 Popovers & tooltips
    [
      {
        kind: 'write',
        prompt: 'Anchor the share popover under its button instead of the screen’s center.',
        starter: '',
        solution: '.share-btn {\n  anchor-name: --share;\n}\n#share {\n  position-anchor: --share;\n  position-area: bottom span-right;\n  margin: 0;\n}',
        checks: [
          { label: 'Name the button with anchor-name', re: '\\.share-btn\\s*\\{[^}]*anchor-name\\s*:\\s*--[\\w-]+', flags: 'i' },
          { label: '#share uses the same anchor', re: SAME_ANCHOR, flags: 'i' },
          { label: 'A position-area below the button', re: '#share\\s*\\{[^}]*position-area\\s*:[^;}]*bottom', flags: 'i' },
          { label: 'Reset the popover’s auto margin', re: '#share\\s*\\{[^}]*(?<![\\w-])margin\\s*:\\s*0', flags: 'i' },
        ],
        hint: 'Popovers are already fixed, so you only need the anchor, the area and margin: 0.',
        explain: 'Browsers center popovers with margin: auto; resetting it lets the anchor placement take over.',
        preview: { html: SHARE },
      },
      {
        kind: 'write',
        prompt: 'Style the profile popover: anchored, a fallback, an open state and a dim backdrop.',
        starter: '.me {\n  anchor-name: --me;\n}\n#menu {\n  margin: 0;\n}\n',
        solution:
          '.me {\n  anchor-name: --me;\n}\n#menu {\n  margin: 0;\n  position-anchor: --me;\n  position-area: bottom span-left;\n  position-try-fallbacks: flip-block;\n}\n#menu:popover-open {\n  box-shadow: 0 4px 12px rgb(0 0 0 / 20%);\n}\n#menu::backdrop {\n  background: rgb(0 0 0 / 30%);\n}',
        checks: [
          { label: 'Anchor #menu to --me with a position-area', re: '#menu\\s*\\{(?=[^}]*position-anchor\\s*:\\s*--me\\b)[^}]*position-area\\s*:', flags: 'i' },
          { label: 'A position-try-fallbacks', re: 'position-try-fallbacks\\s*:\\s*\\S', flags: 'i' },
          { label: 'A rule for :popover-open', re: ':popover-open\\s*\\{[^}]*:', flags: 'i' },
          { label: 'A ::backdrop with a background', re: '::backdrop\\s*\\{[^}]*background', flags: 'i' },
        ],
        hint: ':popover-open matches while it’s shown; ::backdrop is the layer behind it.',
        explain: 'Popovers sit in the top layer, and anchoring keeps them attached to the button that opened them.',
        preview: { html: PROFILE_MENU },
      },
    ],
  ],
};

export default unit;
