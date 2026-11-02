import type { DesktopUnit } from '../../../engine/types';

// Desktop edition: write-the-code challenges for HTML unit 18 (Embedding & security).
// lessons[i] runs after lesson i + 1. See docs/CONTENT_GUIDE.md.
const unit: DesktopUnit = {
  lessons: [
    // L1 Sandboxed frames
    [
      {
        kind: 'write',
        prompt: 'Embed a player-made game in a frame that may run scripts, nothing more.',
        starter: '<h2>Play Snake</h2>\n',
        solution:
          '<h2>Play Snake</h2>\n<iframe src="https://games.example/snake.html" title="Snake game" width="400" height="300" sandbox="allow-scripts"></iframe>',
        checks: [
          { label: 'An <iframe> with a src', re: '<iframe[^>]*\\ssrc="[^"]+"[^>]*>\\s*</iframe>', flags: 'i' },
          { label: 'A title for screen readers', re: '<iframe[^>]*\\stitle="[^"]+"', flags: 'i' },
          { label: 'sandbox="allow-scripts" and no other tokens', re: '<iframe[^>]*\\ssandbox="\\s*allow-scripts\\s*"', flags: 'i' },
        ],
        hint: 'sandbox on its own blocks everything. List only the token you want to give back.',
        explain: 'The game can run its code but can’t submit forms, open pop-ups or act as your site.',
        preview: {},
      },
      {
        kind: 'write',
        prompt: 'This survey only needs to submit its form. Lock the sandbox down.',
        starter:
          '<iframe src="https://survey.example/q/77"\n  sandbox="allow-scripts allow-same-origin allow-popups allow-forms"></iframe>',
        solution: '<iframe src="https://survey.example/q/77" title="Customer survey"\n  sandbox="allow-forms"></iframe>',
        checks: [
          { label: 'Keep allow-forms', re: '<iframe[^>]*\\ssandbox="[^"]*\\ballow-forms\\b', flags: 'i' },
          { label: 'Remove allow-scripts', not: 'allow-scripts' },
          { label: 'Remove allow-same-origin', not: 'allow-same-origin' },
          { label: 'Remove allow-popups', not: 'allow-popups' },
          { label: 'Add a title', re: '<iframe[^>]*\\stitle="[^"]+"', flags: 'i' },
        ],
        hint: 'Every token hands a power back. Keep only the one the survey needs.',
        explain: 'Fewer tokens, less risk. allow-scripts with allow-same-origin is the riskiest pair, since together they can undo the sandbox.',
        preview: {},
      },
    ],
    // L2 Permissions & old embeds
    [
      {
        kind: 'write',
        prompt: 'Embed a running-route map that may use location and go fullscreen.',
        starter: '',
        solution:
          '<iframe src="https://maps.example/embed?route=riverside-5k" title="Riverside 5k route" width="600" height="400"\n  allow="geolocation; fullscreen"></iframe>',
        checks: [
          { label: 'An <iframe> with a src and title', re: '<iframe(?=[^>]*\\ssrc="[^"]+")(?=[^>]*\\stitle="[^"]+")', flags: 'i' },
          { label: 'allow includes geolocation', re: '<iframe[^>]*\\sallow="[^"]*\\bgeolocation\\b', flags: 'i' },
          { label: 'allow includes fullscreen', re: '<iframe[^>]*\\sallow="[^"]*\\bfullscreen\\b', flags: 'i' },
          { label: 'Features separated with ;', re: '\\sallow="[^"]*\\w\\s*;\\s*\\w', flags: 'i' },
        ],
        hint: 'One allow attribute, features separated by semicolons.',
        explain: 'A framed page gets no camera, location or fullscreen unless allow grants it. The browser still asks the user too.',
        preview: {},
      },
      {
        kind: 'write',
        prompt: 'Swap this embed for an iframe that may autoplay, sandboxed to scripts.',
        starter: '<embed src="https://radio.example/player" width="300" height="80">',
        solution:
          '<iframe src="https://radio.example/player" title="Live radio player" width="300" height="80"\n  allow="autoplay" sandbox="allow-scripts"></iframe>',
        checks: [
          { label: 'No <embed> left', not: '<embed' },
          { label: 'An iframe with the same src', re: '<iframe[^>]*\\ssrc="https://radio\\.example/player"', flags: 'i' },
          { label: 'allow="autoplay"', re: '<iframe[^>]*\\sallow="[^"]*\\bautoplay\\b', flags: 'i' },
          { label: 'A sandbox with allow-scripts', re: '<iframe[^>]*\\ssandbox="[^"]*\\ballow-scripts\\b', flags: 'i' },
          { label: 'A title', re: '<iframe[^>]*\\stitle="[^"]+"', flags: 'i' },
        ],
        hint: 'embed can’t take sandbox or allow, so it has to become an iframe, which needs a closing tag.',
        explain: 'An iframe can be fenced in with sandbox and granted only the features it needs, which embed never could.',
        preview: {},
      },
    ],
    // L3 Safe new-tab links
    [
      {
        kind: 'write',
        prompt: 'List two partner shops that open in new tabs, safely and without your URL.',
        starter: '',
        solution:
          '<ul>\n  <li><a href="https://beans.example" target="_blank" rel="noopener noreferrer">Bean Roasters</a></li>\n  <li><a href="https://mugs.example" target="_blank" rel="noopener noreferrer">Mug Studio</a></li>\n</ul>',
        checks: [
          { label: 'Two links with target="_blank"', re: '(<a(?=[^>]*\\shref="https?://[^"]+")(?=[^>]*\\starget="_blank")[^>]*>[^<]*\\S[\\s\\S]*?){2}', flags: 'i' },
          {
            label: 'Each has rel="noopener noreferrer"',
            re: '^(?![\\s\\S]*<a(?=[^>]*\\starget="_blank")(?![^>]*\\srel="(?=[^"]*\\bnoopener\\b)(?=[^"]*\\bnoreferrer\\b)[^"]*")[^>]*>)[\\s\\S]*target="_blank"',
            flags: 'i',
          },
          { label: 'Inside a list', re: '<(ul|ol)>[\\s\\S]*<li>[\\s\\S]*</\\1>', flags: 'i' },
        ],
        hint: 'rel takes several words separated by spaces.',
        explain: 'noopener stops the new tab reaching back to your page, and noreferrer keeps your address out of their logs.',
        preview: {},
      },
      {
        kind: 'write',
        prompt: 'Stop these three from sending your page’s address to other sites.',
        starter:
          '<img src="https://stats.example/pixel.png" alt="">\n<iframe src="https://video.example/v/42" title="Trailer"></iframe>\n<a href="https://forum.example/thread/9" target="_blank">Discuss</a>',
        solution:
          '<img src="https://stats.example/pixel.png" alt="" referrerpolicy="no-referrer">\n<iframe src="https://video.example/v/42" title="Trailer" referrerpolicy="no-referrer"></iframe>\n<a href="https://forum.example/thread/9" target="_blank" rel="noopener noreferrer">Discuss</a>',
        checks: [
          { label: 'The img gets referrerpolicy="no-referrer"', re: '<img[^>]*\\sreferrerpolicy="no-referrer"', flags: 'i' },
          { label: 'The iframe gets referrerpolicy="no-referrer"', re: '<iframe[^>]*\\sreferrerpolicy="no-referrer"', flags: 'i' },
          {
            label: 'The link gets noreferrer (or a no-referrer policy)',
            re: '<a(?=[^>]*\\s(rel="[^"]*\\bnoreferrer\\b|referrerpolicy="no-referrer"))',
            flags: 'i',
          },
        ],
        hint: 'Images and frames take referrerpolicy. A link can use rel too.',
        explain: 'Every request normally says which page asked for it. no-referrer sends nothing, so the other sites can’t tell where you came from.',
        preview: {},
      },
    ],
    // L4 Content Security Policy
    [
      {
        kind: 'write',
        prompt: 'Add a CSP meta: everything from your own site, plus images from cdn.photos.example.',
        starter: '<head>\n  <meta charset="utf-8">\n  <title>Photo Diary</title>\n</head>',
        solution:
          '<head>\n  <meta charset="utf-8">\n  <meta http-equiv="Content-Security-Policy"\n    content="default-src \'self\'; img-src \'self\' https://cdn.photos.example">\n  <title>Photo Diary</title>\n</head>',
        checks: [
          { label: 'A <meta http-equiv="Content-Security-Policy">', re: '<meta[^>]*\\shttp-equiv="Content-Security-Policy"', flags: 'i' },
          { label: 'default-src \'self\'', re: 'default-src\\s+\'self\'' },
          { label: 'img-src with \'self\' and the CDN', re: 'img-src(?=[^;"]*\'self\')(?=[^;"]*https://cdn\\.photos\\.example)' },
          { label: 'Directives separated with ;', re: '(default-src|img-src)[^;"]*;\\s*(img-src|default-src)' },
          { label: 'Inside the head', re: '<head>[\\s\\S]*Content-Security-Policy[\\s\\S]*</head>', flags: 'i' },
        ],
        hint: 'content holds directives like default-src \'self\', separated by semicolons. Keep the single quotes around self.',
        explain: 'default-src covers every kind of file; img-src overrides it for images, so it must repeat \'self\' as well as the CDN.',
        preview: {},
      },
      {
        kind: 'write',
        prompt: 'Fix this broken CSP: quote the keyword and separate the directives properly.',
        starter: '<meta http-equiv="Content-Security-Policy"\n  content="default-src self, script-src \'self\' https://cdn.charts.example">',
        solution: '<meta http-equiv="Content-Security-Policy"\n  content="default-src \'self\'; script-src \'self\' https://cdn.charts.example">',
        checks: [
          { label: 'default-src \'self\' with single quotes', re: 'default-src\\s+\'self\'' },
          { label: 'A ; before script-src, not a comma', re: ';\\s*script-src' },
          { label: 'No comma left', re: '^(?![\\s\\S]*content="[^"]*,)' },
          { label: 'script-src keeps \'self\' and the CDN', re: 'script-src(?=[^;"]*\'self\')(?=[^;"]*https://cdn\\.charts\\.example)' },
        ],
        hint: 'Keywords like \'self\' need their single quotes, and directives are split with semicolons.',
        explain: 'Unquoted, self means a host called “self”. A comma doesn’t end a directive, so script-src was swallowed into default-src; semicolons separate directives.',
        preview: {},
      },
    ],
    // L5 Integrity & autofill limits
    [
      {
        kind: 'write',
        prompt: 'Load a CDN stylesheet and script, both checked with integrity hashes.',
        starter: '',
        solution:
          '<link rel="stylesheet" href="https://cdn.example/grid.min.css"\n  integrity="sha384-T9mY2kLk8Vq4b3cJXc1pZfN0eQhGx7aW5uR6sD2yH4oP8iL1nM3vB9tC0kE5jA7r" crossorigin="anonymous">\n<script src="https://cdn.example/grid.min.js"\n  integrity="sha384-Qb7nX2pF5kR8vL1mC4zT9yH6wD3sJ0gA2eU7iO5rN8cV1bM4xK6tP9lZ3hY0fG2" crossorigin="anonymous" defer></script>',
        checks: [
          {
            label: 'A stylesheet <link> with an integrity hash',
            re: '<link(?=[^>]*\\srel="stylesheet")(?=[^>]*\\shref="https://[^"]+")(?=[^>]*\\sintegrity="sha(256|384|512)-[^"]+")',
            flags: 'i',
          },
          {
            label: 'A <script> with an integrity hash',
            re: '<script(?=[^>]*\\ssrc="https://[^"]+")(?=[^>]*\\sintegrity="sha(256|384|512)-[^"]+")',
            flags: 'i',
          },
          { label: 'crossorigin="anonymous" on both', re: '(<(link|script)[^>]*\\scrossorigin="anonymous"[\\s\\S]*?){2}', flags: 'i' },
        ],
        hint: 'integrity="sha384-…" plus crossorigin="anonymous" on each tag. The CDN lists the real hash.',
        explain: 'If the CDN file ever changes, its hash no longer matches and the browser refuses to use it.',
        preview: {},
      },
      {
        kind: 'write',
        prompt: 'Replace the useless autocomplete="off" with hints that help password managers.',
        starter:
          '<form action="/signup" method="post">\n  <label>Email <input type="email" name="email" autocomplete="off"></label>\n  <label>New password <input type="password" name="pw" autocomplete="off"></label>\n  <label>Repeat password <input type="password" name="pw2" autocomplete="off"></label>\n  <button>Create account</button>\n</form>',
        solution:
          '<form action="/signup" method="post">\n  <label>Email <input type="email" name="email" autocomplete="email"></label>\n  <label>New password <input type="password" name="pw" autocomplete="new-password"></label>\n  <label>Repeat password <input type="password" name="pw2" autocomplete="new-password"></label>\n  <button>Create account</button>\n</form>',
        checks: [
          { label: 'No autocomplete="off" left', not: 'autocomplete="off"' },
          { label: 'The email field uses email or username', re: '<input(?=[^>]*\\sname="email")(?=[^>]*\\sautocomplete="(email|username)")', flags: 'i' },
          {
            label: 'Both password fields use new-password',
            re: '(<input(?=[^>]*\\stype="password")(?=[^>]*\\sautocomplete="new-password")[^>]*>[\\s\\S]*?){2}',
            flags: 'i',
          },
        ],
        hint: 'On a sign-up form the passwords are new ones.',
        explain: 'Browsers often ignore off on logins anyway. new-password tells a password manager to suggest a strong one and save it.',
        preview: {},
      },
    ],
  ],
};

export default unit;
