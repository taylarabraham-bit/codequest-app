import type { DesktopUnit } from '../../../engine/types';

// Desktop edition: write-the-code challenges for CSS unit 8 (Transitions & animation).
// lessons[i] runs after lesson i + 1. See docs/CONTENT_GUIDE.md.

// The keyframes name matches the animation's name, whichever comes first.
const linked =
  '@keyframes\\s+([\\w-]+)\\s*\\{[\\s\\S]*animation(?:-name)?\\s*:(?:[^;}]*[\\s,])?\\s*\\1(?![\\w-])' +
  '|animation-name\\s*:\\s*([\\w-]+)[\\s\\S]*@keyframes\\s+\\2(?![\\w-])' +
  '|animation\\s*:(?:[^;}]*[\\s,])?\\s*([a-z][\\w-]*)[^;}]*[;}][\\s\\S]*@keyframes\\s+\\3(?![\\w-])';

const unit: DesktopUnit = {
  lessons: [
    // L1 Hover and focus
    [
      {
        kind: 'write',
        prompt: 'Give the Buy button a hover color and a different pressed color.',
        starter: '.buy {\n  background-color: seagreen;\n  color: white;\n}',
        solution: '.buy {\n  background-color: seagreen;\n  color: white;\n}\n.buy:hover {\n  background-color: mediumseagreen;\n}\n.buy:active {\n  background-color: darkgreen;\n}',
        checks: [
          { label: '.buy:hover changes the background', re: '\\.buy:hover[^{]*\\{[^}]*background(-color)?\\s*:', flags: 'i' },
          { label: '.buy:active changes a color', re: '\\.buy:active[^{]*\\{[^}]*(background(-color)?|(?<![\\w-])color)\\s*:', flags: 'i' },
        ],
        hint: 'Add the state right after the selector, with no space: .buy:hover.',
        explain: ':hover matches while the pointer is over the button and :active while it is pressed down.',
        preview: { html: '<p>Trail shoes, size 42</p><button class="buy">Buy now</button>' },
      },
      {
        kind: 'write',
        prompt: 'Keyboard users can’t see focus. Add clear :focus-visible outlines to inputs and links.',
        starter: 'input:focus {\n  outline: none;\n}\na:hover {\n  color: crimson;\n}',
        solution:
          'input:focus {\n  outline: none;\n}\na:hover {\n  color: crimson;\n}\ninput:focus-visible,\na:focus-visible {\n  outline: 3px solid orange;\n}',
        checks: [
          { label: 'input:focus-visible gets an outline', re: 'input:focus-visible[^{]*\\{[^}]*outline\\s*:\\s*(?!none)\\S', flags: 'i' },
          { label: 'a:focus-visible gets an outline', re: '(^|[\\s,}])a:focus-visible[^{]*\\{[^}]*outline\\s*:\\s*(?!none)\\S', flags: 'i' },
          { label: 'Keep the a:hover color', re: 'a:hover[^{]*\\{[^}]*(?<![\\w-])color\\s*:', flags: 'i' },
        ],
        hint: 'A selector list can share one rule: input:focus-visible, a:focus-visible { … }.',
        explain: ':focus-visible shows when the browser thinks focus should be seen, like after Tab, so mouse users don’t get a ring on click.',
        preview: { html: '<label>Email <input type="email"></label> <a href="#">Forgot password?</a>' },
      },
    ],
    // L2 Transforms
    [
      {
        kind: 'write',
        prompt: 'Tilt the sale sticker a few degrees and make it 20% bigger.',
        starter: '',
        solution: '.sticker {\n  display: inline-block;\n  transform: rotate(-8deg) scale(1.2);\n  background-color: gold;\n}',
        checks: [
          { label: 'Make the span inline-block', re: '\\.sticker\\s*\\{[^}]*display\\s*:\\s*inline-block', flags: 'i' },
          {
            label: 'One transform with rotate() and scale(1.2)',
            re: '\\.sticker\\s*\\{[^}]*transform\\s*:(?=[^;}]*rotate\\(\\s*-?\\d+(\\.\\d+)?(deg|turn)\\s*\\))(?=[^;}]*scale\\(\\s*1\\.2\\s*\\))',
            flags: 'i',
          },
        ],
        hint: 'List both functions in one transform, separated by a space. A plain span ignores transform.',
        explain: 'scale(1.2) is 120% size, and rotate turns it; inline-block lets the span be transformed at all.',
        preview: { html: '<p>Fresh sourdough <span class="sticker">50% off</span> today only.</p>' },
      },
      {
        kind: 'write',
        prompt: 'On hover, lift each card a few pixels and grow it slightly.',
        starter: '.card {\n  padding: 16px;\n  border: 1px solid #ccc;\n}',
        solution: '.card {\n  padding: 16px;\n  border: 1px solid #ccc;\n}\n.card:hover {\n  transform: translateY(-6px) scale(1.03);\n}',
        checks: [
          { label: 'A .card:hover rule with a transform', re: '\\.card:hover[^{]*\\{[^}]*transform\\s*:', flags: 'i' },
          {
            label: 'Move it up with translateY() and a negative value',
            re: '\\.card:hover[^{]*\\{[^}]*transform\\s*:[^;}]*translate(Y\\(\\s*-|\\(\\s*0(px)?\\s*,\\s*-)',
            flags: 'i',
          },
          { label: 'Grow it with scale() above 1', re: '\\.card:hover[^{]*\\{[^}]*transform\\s*:[^;}]*scale\\(\\s*1\\.\\d*[1-9]', flags: 'i' },
        ],
        hint: 'Up is a negative y. Put translateY() and scale() in one transform.',
        explain: 'transform moves the card without pushing its neighbors, so the grid below doesn’t jump.',
        preview: { html: '<div class="card">Paris, 3 nights</div><div class="card">Rome, 4 nights</div>' },
      },
    ],
    // L3 Transitions
    [
      {
        kind: 'write',
        prompt: 'Make the link color fade over 0.3s when hovered.',
        starter: '',
        solution: 'a {\n  color: navy;\n  transition: color 0.3s ease;\n}\na:hover {\n  color: crimson;\n}',
        checks: [
          { label: 'A transition on the a rule with a duration', re: '(^|[\\s,}])a\\s*\\{[^}]*transition\\s*:[^;}]*\\d(ms|s)\\b', flags: 'i' },
          { label: 'a:hover changes the color', re: 'a:hover[^{]*\\{[^}]*(?<![\\w-])color\\s*:', flags: 'i' },
          { label: 'Keep transition off the :hover rule', re: '^(?![\\s\\S]*:hover[^{]*\\{[^}]*transition)', flags: 'i' },
        ],
        hint: 'Put transition on the normal state so it animates in both directions.',
        explain: 'On the base rule the fade plays when the pointer arrives and again when it leaves.',
        preview: { html: '<p>Read the <a href="#">full recipe</a> or <a href="#">print it</a>.</p>' },
      },
      {
        kind: 'write',
        prompt: 'Transition the button’s background over 0.2s, and its transform with a 0.1s delay.',
        starter: '.btn {\n  background-color: teal;\n  color: white;\n}\n.btn:hover {\n  background-color: darkslategray;\n  transform: scale(1.1);\n}',
        solution:
          '.btn {\n  background-color: teal;\n  color: white;\n  transition: background-color 0.2s ease, transform 0.3s ease-in-out 0.1s;\n}\n.btn:hover {\n  background-color: darkslategray;\n  transform: scale(1.1);\n}',
        checks: [
          {
            label: 'One transition on .btn listing both, separated by a comma',
            re: '\\.btn\\s*\\{[^}]*transition\\s*:(?=[^;}]*background(-color)?\\s)(?=[^;}]*transform\\s)[^;}]*,',
            flags: 'i',
          },
          { label: 'background-color takes 0.2s', re: 'background(-color)?\\s+(0?\\.2s|200ms)', flags: 'i' },
          {
            label: 'transform has a duration, then a 0.1s delay',
            re: 'transform(\\s+[a-z-]+)*\\s+[\\d.]+m?s(\\s+[a-z-]+)*\\s+(0?\\.1s|100ms)',
            flags: 'i',
          },
        ],
        hint: 'Each part is property, duration, timing, delay. Separate the two parts with a comma.',
        explain: 'The first time is always the duration and the second the delay, so the button colors first, then grows.',
        preview: { html: '<button class="btn">Start quest</button>' },
      },
    ],
    // L4 Keyframes
    [
      {
        kind: 'write',
        prompt: 'Write a fade-in keyframes animation and run it on the banner for 1s.',
        starter: '',
        solution: '@keyframes fade-in {\n  from {\n    opacity: 0;\n  }\n  to {\n    opacity: 1;\n  }\n}\n.banner {\n  animation-name: fade-in;\n  animation-duration: 1s;\n}',
        checks: [
          { label: '@keyframes with a from (or 0%) step', re: '@keyframes\\s+[\\w-]+\\s*\\{[\\s\\S]*(from|0%)\\s*\\{[^}]*opacity\\s*:', flags: 'i' },
          { label: '…and a to (or 100%) step', re: '@keyframes\\s+[\\w-]+\\s*\\{[\\s\\S]*(\\bto|100%)\\s*\\{[^}]*opacity\\s*:', flags: 'i' },
          { label: '.banner uses the keyframes’ name', re: linked, flags: 'i' },
          { label: 'Give it a duration', re: '\\.banner\\s*\\{[^}]*animation(-duration)?\\s*:[^;}]*\\d(ms|s)\\b', flags: 'i' },
        ],
        hint: 'Name the keyframes, then set animation-name to that name and animation-duration to 1s.',
        explain: 'Without a duration an animation lasts 0s; with one, opacity runs from 0 to 1 as the page loads.',
        preview: { html: '<div class="banner" style="background:#fde68a;padding:12px">Welcome back, Kai!</div>' },
      },
      {
        kind: 'write',
        prompt: 'Make the loading dot bounce: up at 50%, back down at the start and end.',
        starter: '.dot {\n  display: inline-block;\n  width: 16px;\n  height: 16px;\n  border-radius: 50%;\n  background-color: tomato;\n}',
        solution:
          '@keyframes bounce {\n  0%, 100% {\n    transform: translateY(0);\n  }\n  50% {\n    transform: translateY(-20px);\n  }\n}\n.dot {\n  display: inline-block;\n  width: 16px;\n  height: 16px;\n  border-radius: 50%;\n  background-color: tomato;\n  animation-name: bounce;\n  animation-duration: 0.8s;\n  animation-iteration-count: infinite;\n}',
        checks: [
          { label: 'A 50% step that moves it up', re: '@keyframes[\\s\\S]*\\b50%\\s*\\{[^}]*translate(Y\\(\\s*-|\\(\\s*0(px)?\\s*,\\s*-)', flags: 'i' },
          { label: '0% and 100% steps', re: '@keyframes(?=[\\s\\S]*(\\b0%|from)[\\s,]*[^{]*\\{)(?=[\\s\\S]*(100%|\\bto)\\s*\\{)', flags: 'i' },
          { label: '.dot uses the keyframes’ name', re: linked, flags: 'i' },
          { label: 'Give it a duration', re: '\\.dot\\s*\\{[^}]*animation(-duration)?\\s*:[^;}]*\\d(ms|s)\\b', flags: 'i' },
        ],
        hint: '0%, 100% { … } shares one step between the start and the end.',
        explain: 'Percent steps place each pose in time, so the dot is highest exactly halfway through.',
        preview: { html: '<p>Loading <span class="dot"></span></p>' },
      },
    ],
    // L5 Looping & reduced motion
    [
      {
        kind: 'write',
        prompt: 'Make the heart pulse forever, back and forth, with the animation shorthand.',
        starter: '@keyframes pulse {\n  to {\n    transform: scale(1.2);\n  }\n}\n.heart {\n  display: inline-block;\n}',
        solution:
          '@keyframes pulse {\n  to {\n    transform: scale(1.2);\n  }\n}\n.heart {\n  display: inline-block;\n  animation: pulse 0.8s ease-in-out infinite alternate;\n}',
        checks: [
          {
            label: 'animation: pulse with a duration',
            re: '\\.heart\\s*\\{[^}]*animation\\s*:(?=[^;}]*\\bpulse\\b)(?=[^;}]*\\d(ms|s)\\b)',
            flags: 'i',
          },
          { label: 'It loops: infinite', re: '\\.heart\\s*\\{[^}]*animation\\s*:[^;}]*\\binfinite\\b', flags: 'i' },
          { label: 'It runs back and forth: alternate', re: '\\.heart\\s*\\{[^}]*animation\\s*:[^;}]*\\balternate\\b', flags: 'i' },
        ],
        hint: 'One line: animation: name duration timing infinite alternate;',
        explain: 'infinite repeats forever and alternate plays every other run backwards, so the pulse never jumps.',
        preview: { html: '<p>Liked by 1,204 people <span class="heart" style="color:crimson">♥</span></p>' },
      },
      {
        kind: 'write',
        prompt: 'Spin the loader forever, and turn it off for people who reduce motion.',
        starter: '.spinner {\n  width: 32px;\n  height: 32px;\n  border: 4px solid #ddd;\n  border-top-color: royalblue;\n  border-radius: 50%;\n}',
        solution:
          '@keyframes spin {\n  to {\n    transform: rotate(360deg);\n  }\n}\n.spinner {\n  width: 32px;\n  height: 32px;\n  border: 4px solid #ddd;\n  border-top-color: royalblue;\n  border-radius: 50%;\n  animation: spin 1s linear infinite;\n}\n@media (prefers-reduced-motion: reduce) {\n  .spinner {\n    animation: none;\n  }\n}',
        checks: [
          { label: '@keyframes that rotate a full turn', re: '@keyframes\\s+[\\w-]+\\s*\\{[\\s\\S]*rotate\\(\\s*(360deg|1turn)\\s*\\)', flags: 'i' },
          { label: '.spinner loops it forever', re: '\\.spinner\\s*\\{[^}]*animation(-iteration-count)?\\s*:[^;}]*\\binfinite\\b', flags: 'i' },
          { label: 'A prefers-reduced-motion: reduce query', re: '@media\\s*\\(\\s*prefers-reduced-motion\\s*:\\s*reduce\\s*\\)', flags: 'i' },
          {
            label: 'Inside it, the spinner gets animation: none',
            re: 'prefers-reduced-motion\\s*:\\s*reduce\\s*\\)\\s*\\{\\s*\\.spinner\\s*\\{[^}]*animation(-name)?\\s*:\\s*none',
            flags: 'i',
          },
        ],
        hint: 'linear keeps the spin steady. The motion query goes after the rule it overrides.',
        explain: 'Some people get dizzy from motion; the query respects their system setting and stops the spin.',
        preview: { html: '<div class="spinner"></div><p>Loading your playlist…</p>' },
      },
    ],
  ],
};

export default unit;
