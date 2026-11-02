import type { DesktopUnit } from '../../../engine/types';

// Desktop edition: write-the-code challenges for CSS unit 15 (Scrolling & snap).
// lessons[i] runs after lesson i + 1. See docs/CONTENT_GUIDE.md.

const STANDINGS =
  '<div class="wrap" style="border:1px solid #ccc"><table style="width:520px"><tr><th>Team</th><th>W</th><th>D</th><th>L</th><th>GF</th><th>GA</th><th>Pts</th></tr><tr><td>Rovers</td><td>9</td><td>2</td><td>1</td><td>27</td><td>9</td><td>29</td></tr></table></div>' +
  '<div class="chat" style="height:80px;border:1px solid #ccc;margin-top:8px"><p>🧑 Pizza tonight?</p><p>👩 Yes! 7pm?</p><p>🧑 Booked.</p><p>👩 Bring the board games.</p></div>';
const CARD_LIST =
  '<div class="card" style="position:relative;width:180px;height:60px;border:1px solid #ccc;margin:12px"><span style="position:absolute;top:-10px;right:-20px;background:gold;padding:2px 6px">SALE</span>🎧 Headphones</div>' +
  '<ul class="list" style="height:80px;border:1px solid #ccc;margin:0"><li>Milk</li><li>Eggs</li><li>Bread</li><li>Apples</li><li>Rice</li></ul>';
const DOCS =
  '<header style="position:sticky;top:0;height:40px;background:#222;color:#fff">🧭 Guide</header><p><a href="#setup">Setup</a> · <a href="#faq">FAQ</a></p><div style="height:300px"></div><h2 id="setup">Setup</h2><div style="height:300px"></div><h2 id="faq">FAQ</h2><div style="height:300px"></div>';
const SLIDES =
  '<div class="slides" style="display:flex;gap:8px;width:240px"><div class="slide" style="flex:0 0 200px;height:80px;background:#fde">🏖️ Beach</div><div class="slide" style="flex:0 0 200px;height:80px;background:#def">🏔️ Peaks</div><div class="slide" style="flex:0 0 200px;height:80px;background:#efd">🌲 Forest</div></div>';
const FEED =
  '<div class="feed" style="height:120px;border:1px solid #ccc"><div class="post" style="height:120px;background:#fde">🎬 Clip 1</div><div class="post" style="height:120px;background:#def">🎬 Clip 2</div><div class="post" style="height:120px;background:#efd">🎬 Clip 3</div></div>';
const TABLE =
  '<div style="height:110px;overflow-y:auto;border:1px solid #ccc"><table style="width:100%"><thead><tr><th>Day</th><th>Steps</th></tr></thead><tbody><tr><td>Mon</td><td>8,200</td></tr><tr><td>Tue</td><td>10,450</td></tr><tr><td>Wed</td><td>6,900</td></tr><tr><td>Thu</td><td>12,010</td></tr><tr><td>Fri</td><td>9,300</td></tr></tbody></table></div>';
const DRAWER =
  '<div class="drawer" style="border:1px solid #ccc"><h3 style="margin:0;background:#fff">Filters</h3><p>Price</p><p>Brand</p><p>Color</p><p>Size</p><p>Rating</p></div>';
const LONG =
  '<div class="bar" style="position:fixed;top:0;left:0;right:0;height:6px;background:teal"></div><p>Scroll down…</p><div style="height:400px"></div><div class="card" style="padding:16px;background:#def">🌟 Hello from the middle</div><div style="height:400px"></div>';

const unit: DesktopUnit = {
  lessons: [
    // L1 Overflow per axis
    [
      {
        kind: 'write',
        prompt: 'Let the standings table scroll sideways and the chat scroll down.',
        starter: '',
        solution: '.wrap {\n  overflow-x: auto;\n}\n.chat {\n  overflow-y: auto;\n  scrollbar-gutter: stable;\n}',
        checks: [
          { label: '.wrap scrolls on the x axis', re: '\\.wrap\\s*\\{[^}]*overflow-(x|inline)\\s*:\\s*(auto|scroll)', flags: 'i' },
          { label: '.chat scrolls on the y axis', re: '\\.chat\\s*\\{[^}]*overflow-(y|block)\\s*:\\s*(auto|scroll)', flags: 'i' },
          { label: 'Reserve the chat’s scrollbar space', re: '\\.chat\\s*\\{[^}]*scrollbar-gutter\\s*:\\s*stable', flags: 'i' },
        ],
        hint: 'overflow-x and overflow-y each take auto, scroll, hidden or clip.',
        explain: 'auto only shows a scrollbar when needed, and the stable gutter stops the text jumping when it appears.',
        preview: { html: STANDINGS },
      },
      {
        kind: 'write',
        prompt: 'Clip the card’s badge without making it scrollable, and scroll the list vertically only.',
        starter: '.card {\n  overflow: auto;\n}\n.list {\n  overflow: scroll;\n}\n',
        solution: '.card {\n  overflow: clip;\n}\n.list {\n  overflow-x: hidden;\n  overflow-y: auto;\n  scrollbar-gutter: stable;\n}',
        checks: [
          { label: '.card uses overflow: clip', re: '\\.card\\s*\\{[^}]*overflow\\s*:\\s*clip', flags: 'i' },
          { label: '.list scrolls on the y axis', re: '\\.list\\s*\\{[^}]*overflow-(y|block)\\s*:\\s*(auto|scroll)', flags: 'i' },
          { label: 'No overflow: scroll on both axes', not: 'overflow: scroll' },
          { label: 'Reserve the list’s scrollbar space', re: '\\.list\\s*\\{[^}]*scrollbar-gutter\\s*:\\s*stable', flags: 'i' },
        ],
        hint: 'clip cuts off like hidden but never scrolls. Set overflow-y on its own for the list.',
        explain: 'overflow: scroll draws both scrollbars; overflow-y: auto scrolls one way, only when needed.',
        preview: { html: CARD_LIST },
      },
    ],
    // L2 Smooth jumps & anchors
    [
      {
        kind: 'write',
        prompt: 'Make the guide’s links glide, stopping below the 40px sticky header.',
        starter: '',
        solution: 'html {\n  scroll-behavior: smooth;\n  scroll-padding-top: 50px;\n}',
        checks: [
          { label: 'scroll-behavior: smooth on html', re: 'html\\s*\\{[^}]*scroll-behavior\\s*:\\s*smooth', flags: 'i' },
          { label: 'Room for the header with scroll-padding-top', re: 'html\\s*\\{[^}]*scroll-padding(-top|-block-start|-block)?\\s*:\\s*[\\d.]+[a-z]+', flags: 'i' },
        ],
        hint: 'Both go on html, the page’s scroller.',
        explain: 'scroll-padding-top shrinks the area a jump aims for, so the heading lands below the header.',
        preview: { html: DOCS },
      },
      {
        kind: 'write',
        prompt: 'Only glide when motion is OK, and leave room above each h2.',
        starter: 'html {\n  scroll-behavior: smooth;\n}\n',
        solution:
          '@media (prefers-reduced-motion: no-preference) {\n  html {\n    scroll-behavior: smooth;\n  }\n}\nh2 {\n  scroll-margin-top: 50px;\n}',
        checks: [
          {
            label: 'Smooth only inside a prefers-reduced-motion query',
            re: 'prefers-reduced-motion\\s*:\\s*no-preference\\s*\\)\\s*\\{[^@]*scroll-behavior\\s*:\\s*smooth|prefers-reduced-motion\\s*:\\s*reduce\\s*\\)\\s*\\{[^@]*scroll-behavior\\s*:\\s*auto',
            flags: 'i',
          },
          { label: 'scroll-margin-top on h2', re: 'h2\\s*\\{[^}]*scroll-margin(-top|-block-start|-block)?\\s*:\\s*[\\d.]+[a-z]+', flags: 'i' },
        ],
        hint: 'Wrap the smooth rule in @media (prefers-reduced-motion: no-preference) { … }.',
        explain: 'Some people get dizzy from motion; the query lets their setting win. scroll-margin sits on the target itself.',
        preview: { html: DOCS },
      },
    ],
    // L3 Scroll snap
    [
      {
        kind: 'write',
        prompt: 'Turn the trips into a carousel that snaps each slide to the center.',
        starter: '',
        solution: '.slides {\n  overflow-x: auto;\n  scroll-snap-type: x mandatory;\n}\n.slide {\n  scroll-snap-align: center;\n}',
        checks: [
          { label: '.slides scrolls sideways', re: '\\.slides\\s*\\{[^}]*overflow(-x|-inline)?\\s*:\\s*(auto|scroll)', flags: 'i' },
          { label: 'scroll-snap-type on the x axis', re: '\\.slides\\s*\\{[^}]*scroll-snap-type\\s*:\\s*(x|inline|both)\\b', flags: 'i' },
          { label: 'Each .slide snaps to the center', re: '\\.slide\\s*\\{[^}]*scroll-snap-align\\s*:\\s*center', flags: 'i' },
        ],
        hint: 'scroll-snap-type goes on the scroller; scroll-snap-align goes on each child.',
        explain: 'mandatory always settles on a slide, so the carousel never rests between two.',
        preview: { html: SLIDES },
      },
      {
        kind: 'write',
        prompt: 'Snap the clip feed one post at a time, even on fast swipes.',
        starter: '.feed {\n  overflow-y: auto;\n}\n',
        solution:
          '.feed {\n  overflow-y: auto;\n  scroll-snap-type: y mandatory;\n}\n.post {\n  scroll-snap-align: start;\n  scroll-snap-stop: always;\n}',
        checks: [
          { label: 'scroll-snap-type on the y axis', re: '\\.feed\\s*\\{[^}]*scroll-snap-type\\s*:\\s*(y|block)\\b', flags: 'i' },
          { label: 'Each .post snaps at its start', re: '\\.post\\s*\\{[^}]*scroll-snap-align\\s*:\\s*start', flags: 'i' },
          { label: 'scroll-snap-stop: always', re: 'scroll-snap-stop\\s*:\\s*always', flags: 'i' },
        ],
        hint: 'A fast swipe can skip posts unless each one says scroll-snap-stop: always.',
        explain: 'always forces the scroll to stop at the next post, like a short-video app.',
        preview: { html: FEED },
      },
    ],
    // L4 Sticky & scrollbars
    [
      {
        kind: 'write',
        prompt: 'Keep the step table’s header row visible while it scrolls.',
        starter: '',
        solution: 'thead th {\n  position: sticky;\n  top: 0;\n  background: white;\n}',
        checks: [
          { label: 'position: sticky on the header cells', re: 'th\\s*\\{[^}]*position\\s*:\\s*sticky', flags: 'i' },
          { label: 'An offset: top: 0', re: 'th\\s*\\{[^}]*(?<![\\w-])(top|inset-block-start)\\s*:\\s*0', flags: 'i' },
          { label: 'A background so rows don’t show through', re: 'th\\s*\\{[^}]*background(-color)?\\s*:', flags: 'i' },
        ],
        hint: 'Sticky does nothing without an offset like top: 0.',
        explain: 'The header cells stick to the top of the scrolling box; the background hides the rows passing under them.',
        preview: { html: TABLE },
      },
      {
        kind: 'write',
        prompt: 'Polish the filter drawer: contained scroll, thin teal scrollbar, sticky heading.',
        starter: '.drawer {\n  height: 120px;\n  overflow-y: auto;\n}\n',
        solution:
          '.drawer {\n  height: 120px;\n  overflow-y: auto;\n  overscroll-behavior: contain;\n  scrollbar-width: thin;\n  scrollbar-color: teal #eee;\n}\n.drawer h3 {\n  position: sticky;\n  top: 0;\n}',
        checks: [
          { label: 'overscroll-behavior: contain', re: 'overscroll-behavior(-y|-block)?\\s*:\\s*contain', flags: 'i' },
          { label: 'scrollbar-width: thin', re: 'scrollbar-width\\s*:\\s*thin', flags: 'i' },
          { label: 'scrollbar-color with a thumb and a track color', re: 'scrollbar-color\\s*:\\s*[^\\s;}]+\\s+[^\\s;}]+', flags: 'i' },
          { label: 'A sticky h3 with top: 0', re: 'h3\\s*\\{(?=[^}]*position\\s*:\\s*sticky)[^}]*(?<![\\w-])(top|inset-block-start)\\s*:\\s*0', flags: 'i' },
        ],
        hint: 'scrollbar-color takes two colors: the thumb, then the track.',
        explain: 'contain stops the page scrolling when the drawer hits its end, and the h3 sticks inside the drawer.',
        preview: { html: DRAWER },
      },
    ],
    // L5 Scroll-driven animations
    [
      {
        kind: 'write',
        prompt: 'Grow the top bar from left to right as the page scrolls.',
        starter: '',
        solution:
          '@keyframes grow {\n  from { scale: 0 1; }\n  to { scale: 1 1; }\n}\n.bar {\n  transform-origin: left;\n  animation: grow linear both;\n  animation-timeline: scroll(root);\n}',
        checks: [
          { label: 'A @keyframes that scales the bar', re: '@keyframes\\s+[\\w-]+\\s*\\{[\\s\\S]*(scale|width|inline-size)', flags: 'i' },
          { label: 'transform-origin on the left', re: 'transform-origin\\s*:\\s*(left|0|0%)\\b', flags: 'i' },
          { label: 'animation-timeline: scroll() after the animation shorthand', re: '(?<![\\w-])animation\\s*:[^;}]*;[^}]*animation-timeline\\s*:\\s*scroll\\(', flags: 'i' },
        ],
        hint: 'Keyframes from scale: 0 1 to scale: 1 1. The shorthand resets the timeline, so set the timeline after it.',
        explain: 'scroll() swaps time for scroll position, so the bar shows how far down the page you are.',
        preview: { html: LONG },
      },
      {
        kind: 'write',
        prompt: 'Fix the card so it fades in on scroll, done by cover 40%.',
        starter:
          '@keyframes fade-in {\n  from { opacity: 0; translate: 0 20px; }\n  to { opacity: 1; translate: 0 0; }\n}\n.card {\n  animation-timeline: view();\n  animation: fade-in linear both;\n}\n',
        solution:
          '@keyframes fade-in {\n  from { opacity: 0; translate: 0 20px; }\n  to { opacity: 1; translate: 0 0; }\n}\n.card {\n  animation: fade-in linear both;\n  animation-timeline: view();\n  animation-range: entry 0% cover 40%;\n}',
        checks: [
          { label: 'animation-timeline: view() after the shorthand', re: '(?<![\\w-])animation\\s*:[^;}]*;[^}]*animation-timeline\\s*:\\s*view\\(', flags: 'i' },
          { label: 'animation-range ending at cover 40%', re: 'animation-range(-end)?\\s*:[^;}]*cover\\s+40%', flags: 'i' },
        ],
        hint: 'Swap the two lines, then add animation-range: entry 0% cover 40%.',
        explain: 'The animation shorthand resets animation-timeline to auto, so the timeline must come after it.',
        preview: { html: LONG },
      },
    ],
  ],
};

export default unit;
