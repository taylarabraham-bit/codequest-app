import type { DesktopUnit } from '../../../engine/types';

// Desktop edition: write-the-code challenges for CSS unit 4 (Display & positioning).
// lessons[i] runs after lesson i + 1. See docs/CONTENT_GUIDE.md.
const unit: DesktopUnit = {
  lessons: [
    // L1 Block and inline
    [
      {
        kind: 'write',
        prompt: 'Turn the diet list items into inline-block pills in one row.',
        starter: '',
        solution: '.tags li {\n  display: inline-block;\n  padding: 4px 10px;\n  background-color: honeydew;\n  border-radius: 12px;\n}',
        checks: [
          { label: 'The li items are inline-block', re: 'li\\s*\\{[^}]*display\\s*:\\s*inline-block', flags: 'i' },
          { label: 'Give them padding', re: 'li\\s*\\{[^}]*(?<![\\w-])padding(-[a-z]+)?\\s*:\\s*\\d', flags: 'i' },
          { label: 'Give them a background-color', re: 'li\\s*\\{[^}]*background(-color)?\\s*:', flags: 'i' },
        ],
        hint: 'List items are blocks, so they stack. inline-block puts them in a line but keeps padding working.',
        explain: 'inline-block sits in the text flow like a word, yet takes padding, width and height like a box.',
        preview: { html: '<h3>Thai green curry</h3><ul class="tags"><li>vegan</li><li>gluten-free</li><li>spicy</li></ul>' },
      },
      {
        kind: 'write',
        prompt: 'Stack the sidebar links as blocks and let the badge span take its width.',
        starter: '.sidebar a {\n  color: navy;\n}\n.badge {\n  width: 40px;\n  background-color: crimson;\n  color: white;\n}',
        solution:
          '.sidebar a {\n  display: block;\n  color: navy;\n}\n.badge {\n  display: inline-block;\n  width: 40px;\n  background-color: crimson;\n  color: white;\n}',
        checks: [
          { label: 'Sidebar links are display: block', re: '\\.sidebar\\s+a\\s*\\{[^}]*display\\s*:\\s*block', flags: 'i' },
          { label: '.badge is display: inline-block', re: '\\.badge\\s*\\{[^}]*display\\s*:\\s*inline-block', flags: 'i' },
          { label: 'Keep the badge’s width', re: '\\.badge\\s*\\{[^}]*(?<![\\w-])width\\s*:\\s*\\d', flags: 'i' },
        ],
        hint: 'Links are inline, so they share a line. Inline boxes like span ignore width.',
        explain: 'block puts each link on its own line, and inline-block lets the span keep its width while staying in the text.',
        preview: {
          html: '<div class="sidebar"><a href="#">Inbox <span class="badge">4</span></a><a href="#">Sent</a><a href="#">Spam</a></div>',
        },
      },
    ],
    // L2 Hiding & overflow
    [
      {
        kind: 'write',
        prompt: 'Remove the .spoiler entirely, but keep the .ghost’s space while hiding it.',
        starter: '',
        solution: '.spoiler {\n  display: none;\n}\n.ghost {\n  visibility: hidden;\n}',
        checks: [
          { label: '.spoiler: display: none', re: '\\.spoiler\\s*\\{[^}]*display\\s*:\\s*none', flags: 'i' },
          { label: '.ghost: visibility: hidden', re: '\\.ghost\\s*\\{[^}]*visibility\\s*:\\s*hidden', flags: 'i' },
        ],
        hint: 'One way closes the gap, the other leaves an empty space behind.',
        explain: 'display: none takes the box out of the page; visibility: hidden only makes it invisible.',
        preview: {
          html: '<p>Who stole the cake?</p><p class="spoiler">The butler did.</p><p class="ghost">Boo!</p><p>The end.</p>',
        },
      },
      {
        kind: 'write',
        prompt: 'Make .log a 120px box that scrolls when needed, and clip .preview.',
        starter: '.log {\n  border: 1px solid gray;\n}\n.preview {\n  height: 40px;\n}',
        solution: '.log {\n  border: 1px solid gray;\n  height: 120px;\n  overflow: auto;\n}\n.preview {\n  height: 40px;\n  overflow: hidden;\n}',
        checks: [
          { label: '.log height: 120px', re: '\\.log\\s*\\{[^}]*(?<![\\w-])(max-)?height\\s*:\\s*120px', flags: 'i' },
          { label: '.log scrolls only when needed', re: '\\.log\\s*\\{[^}]*overflow(-y)?\\s*:\\s*auto', flags: 'i' },
          { label: '.preview clips with overflow: hidden', re: '\\.preview\\s*\\{[^}]*overflow(-y)?\\s*:\\s*hidden', flags: 'i' },
        ],
        hint: 'A fixed height makes content spill. overflow decides what happens to the spill.',
        explain: 'overflow: auto adds a scrollbar only if the text is too long; hidden simply cuts it off.',
        preview: {
          html: '<div class="log"><p>10:01 Sam joined</p><p>10:02 Sam: hi!</p><p>10:03 Lee: hey</p><p>10:04 Lee: ready?</p><p>10:05 Sam: go</p><p>10:06 Lee: gg</p></div><p class="preview">Lee: That last round was wild, did you see the comeback in the final minute? I could not believe it.</p>',
        },
      },
    ],
    // L3 Relative & absolute
    [
      {
        kind: 'write',
        prompt: 'Pin the SALE badge to the top-right corner of the product card.',
        starter: '',
        solution: '.card {\n  position: relative;\n}\n.badge {\n  position: absolute;\n  top: 8px;\n  right: 8px;\n}',
        checks: [
          { label: '.card is position: relative', re: '\\.card\\s*\\{[^}]*position\\s*:\\s*relative', flags: 'i' },
          { label: '.badge is position: absolute', re: '\\.badge\\s*\\{[^}]*position\\s*:\\s*absolute', flags: 'i' },
          { label: '.badge sets top', re: '\\.badge\\s*\\{[^}]*(?<![\\w-])(top|inset)\\s*:', flags: 'i' },
          { label: '.badge sets right', re: '\\.badge\\s*\\{[^}]*(?<![\\w-])(right|inset)\\s*:', flags: 'i' },
        ],
        hint: 'The card is the anchor (relative); the badge leaves the flow (absolute) and uses top and right.',
        explain: 'An absolute box is placed inside its nearest positioned ancestor, here the relative card.',
        preview: {
          html: '<div class="card" style="border:1px solid #ccc;padding:12px;width:200px"><span class="badge" style="background:crimson;color:#fff;padding:2px 6px">SALE</span><h3>Headphones</h3><p>$59</p></div>',
        },
      },
      {
        kind: 'write',
        prompt: 'Cover the photo with a full-size dark overlay using inset.',
        starter: '.photo {\n  height: 160px;\n  background-color: steelblue;\n}\n.overlay {\n  background-color: rgba(0, 0, 0, 0.5);\n  color: white;\n}',
        solution:
          '.photo {\n  position: relative;\n  height: 160px;\n  background-color: steelblue;\n}\n.overlay {\n  position: absolute;\n  inset: 0;\n  background-color: rgba(0, 0, 0, 0.5);\n  color: white;\n}',
        checks: [
          { label: '.photo is the anchor: position: relative', re: '\\.photo\\s*\\{[^}]*position\\s*:\\s*relative', flags: 'i' },
          { label: '.overlay is position: absolute', re: '\\.overlay\\s*\\{[^}]*position\\s*:\\s*absolute', flags: 'i' },
          { label: '.overlay fills it with inset: 0', re: '\\.overlay\\s*\\{[^}]*(?<![\\w-])inset\\s*:\\s*0(px)?\\s*[;}]', flags: 'i' },
        ],
        hint: 'inset: 0 sets top, right, bottom and left to 0 in one go.',
        explain: 'Stretched from all four edges of the relative parent, the overlay covers it exactly.',
        preview: { html: '<div class="photo"><div class="overlay">Sold out</div></div><p>Mountain print, A3</p>' },
      },
    ],
    // L4 Fixed, sticky & z-index
    [
      {
        kind: 'write',
        prompt: 'Make the header stick to the top while the episode list scrolls.',
        starter: '',
        solution: 'header {\n  position: sticky;\n  top: 0;\n  background-color: white;\n}',
        checks: [
          { label: 'header is position: sticky', re: 'header\\s*\\{[^}]*position\\s*:\\s*sticky', flags: 'i' },
          { label: 'It sticks at top: 0', re: 'header\\s*\\{[^}]*(?<![\\w-])top\\s*:\\s*0', flags: 'i' },
          { label: 'A background so the list doesn’t show through', re: 'header\\s*\\{[^}]*background(-color)?\\s*:', flags: 'i' },
        ],
        hint: 'sticky needs an offset like top to know where to stop.',
        explain: 'A sticky box scrolls normally, then holds at top: 0. The background hides the rows sliding under it.',
        preview: {
          html: '<header><b>Podcast: Deep Sea</b></header><p>Ep 1: Anglerfish</p><p>Ep 2: Giant squid</p><p>Ep 3: Vents</p><p>Ep 4: Whale falls</p><p>Ep 5: Jellies</p><p>Ep 6: Trenches</p><p>Ep 7: Sharks</p><p>Ep 8: Corals</p><p>Ep 9: Sponges</p><p>Ep 10: Eels</p><p>Ep 11: Crabs</p><p>Ep 12: Finale</p>',
        },
      },
      {
        kind: 'write',
        prompt: 'Pin the chat button to the bottom-right corner, above the cookie bar.',
        starter:
          '.cookie {\n  position: fixed;\n  bottom: 0;\n  left: 0;\n  right: 0;\n  z-index: 10;\n  background-color: #333;\n  color: white;\n}\n.chat {\n  background-color: royalblue;\n  color: white;\n}',
        solution:
          '.cookie {\n  position: fixed;\n  bottom: 0;\n  left: 0;\n  right: 0;\n  z-index: 10;\n  background-color: #333;\n  color: white;\n}\n.chat {\n  position: fixed;\n  bottom: 8px;\n  right: 16px;\n  z-index: 20;\n  background-color: royalblue;\n  color: white;\n}',
        checks: [
          { label: '.chat is position: fixed', re: '\\.chat\\s*\\{[^}]*position\\s*:\\s*fixed', flags: 'i' },
          { label: '.chat sets bottom', re: '\\.chat\\s*\\{[^}]*(?<![\\w-])bottom\\s*:', flags: 'i' },
          { label: '.chat sets right', re: '\\.chat\\s*\\{[^}]*(?<![\\w-])right\\s*:', flags: 'i' },
          { label: 'A z-index above the cookie bar’s 10', re: '\\.chat\\s*\\{[^}]*z-index\\s*:\\s*(1[1-9]|[2-9]\\d|\\d{3,})\\s*[;}]', flags: 'i' },
        ],
        hint: 'fixed pins it to the window. The higher z-index sits on top.',
        explain: 'Both boxes are fixed, so z-index decides the overlap: 20 beats the cookie bar’s 10.',
        preview: { html: '<p>Read today’s top stories below.</p><button class="chat">Chat</button><div class="cookie">We use cookies. OK?</div>' },
      },
    ],
    // L5 ::before and ::after
    [
      {
        kind: 'write',
        prompt: 'Add a star before each .fav item with ::before, and color it.',
        starter: '',
        solution: ".fav::before {\n  content: '★ ';\n  color: goldenrod;\n}",
        checks: [
          { label: '.fav::before with text in content', re: '\\.fav::?before\\s*\\{[^}]*content\\s*:\\s*(\'[^\']+\'|"[^"]+")', flags: 'i' },
          { label: 'Give the star a color', re: '\\.fav::?before\\s*\\{[^}]*(?<![\\w-])color\\s*:', flags: 'i' },
        ],
        hint: 'The selector is .fav::before, and content takes the text in quotes.',
        explain: 'The pseudo-element adds a box before the content; without content it wouldn’t show at all.',
        preview: { html: '<ul><li class="fav">Green tea</li><li>Coffee</li><li class="fav">Cocoa</li></ul>' },
      },
      {
        kind: 'write',
        prompt: 'Add a red notification dot to the bell’s top-right corner with ::after.',
        starter: '.bell {\n  display: inline-block;\n  padding: 8px;\n}',
        solution:
          ".bell {\n  display: inline-block;\n  padding: 8px;\n  position: relative;\n}\n.bell::after {\n  content: '';\n  position: absolute;\n  top: 0;\n  right: 0;\n  width: 10px;\n  height: 10px;\n  border-radius: 50%;\n  background-color: red;\n}",
        checks: [
          { label: '.bell is position: relative', re: '\\.bell\\s*\\{[^}]*position\\s*:\\s*relative', flags: 'i' },
          { label: '.bell::after with empty content', re: '\\.bell::?after\\s*\\{[^}]*content\\s*:\\s*(\'\'|"")', flags: 'i' },
          { label: 'The dot is position: absolute', re: '\\.bell::?after\\s*\\{[^}]*position\\s*:\\s*absolute', flags: 'i' },
          { label: 'The dot has a width and height', re: '\\.bell::?after\\s*\\{(?=[^}]*(?<![\\w-])width\\s*:)(?=[^}]*(?<![\\w-])height\\s*:)', flags: 'i' },
          { label: 'Round it with border-radius', re: '\\.bell::?after\\s*\\{[^}]*border-radius\\s*:', flags: 'i' },
        ],
        hint: "content: '' makes an empty box. Size it, round it, then place it inside the relative bell.",
        explain: 'An empty ::after is a free extra box: sized and rounded it becomes a dot, pinned by the relative parent.',
        preview: { html: '<span class="bell">Alerts</span> <span>Settings</span>' },
      },
    ],
  ],
};

export default unit;
