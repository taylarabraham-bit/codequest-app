import type { DesktopUnit } from '../../../engine/types';

// Desktop edition: write-the-code challenges for HTML unit 17 (Scripts & loading).
// lessons[i] runs after lesson i + 1. See docs/CONTENT_GUIDE.md.
const unit: DesktopUnit = {
  lessons: [
    // L1 Inline or src
    [
      {
        kind: 'write',
        prompt: 'Write a quiz page body that loads quiz.js, then calls startQuiz() inline.',
        starter: '',
        solution:
          '<body>\n  <h1>Capital Cities Quiz</h1>\n  <div id="quiz"></div>\n  <script src="quiz.js"></script>\n  <script>startQuiz();</script>\n</body>',
        checks: [
          { label: 'A heading for the page', re: '<h[1-6][^>]*>[^<]*\\S[^<]*</h[1-6]>', flags: 'i' },
          { label: 'An empty <script src="quiz.js">', re: '<script[^>]*\\ssrc="quiz\\.js"[^>]*>\\s*</script>', flags: 'i' },
          { label: 'A separate inline script calling startQuiz()', re: '<script>\\s*startQuiz\\(\\s*\\);?\\s*</script>', flags: 'i' },
          { label: 'quiz.js loads before the inline call', re: 'quiz\\.js[\\s\\S]*startQuiz', flags: 'i' },
          { label: 'Scripts last, just before </body>', re: '</script>\\s*</body>', flags: 'i' },
        ],
        hint: 'Two script tags: one with src and nothing inside, then one holding the call.',
        explain: 'startQuiz() is defined in quiz.js, so that file must load first. At the end of body the page is already built when they run.',
        preview: {},
      },
      {
        kind: 'write',
        prompt: 'resetTimer() never runs and the script blocks the page. Fix both.',
        starter:
          '<!DOCTYPE html>\n<html lang="en">\n  <head>\n    <title>Timer</title>\n    <script src="timer.js">\n      resetTimer();\n    </script>\n  </head>\n  <body>\n    <p id="time">00:00</p>\n  </body>\n</html>',
        solution:
          '<!DOCTYPE html>\n<html lang="en">\n  <head>\n    <title>Timer</title>\n  </head>\n  <body>\n    <p id="time">00:00</p>\n    <script src="timer.js"></script>\n    <script>resetTimer();</script>\n  </body>\n</html>',
        checks: [
          { label: '<script src="timer.js"> with nothing inside', re: '<script[^>]*\\ssrc="timer\\.js"[^>]*>\\s*</script>', flags: 'i' },
          { label: 'resetTimer() in its own script', re: '<script>\\s*resetTimer\\(\\s*\\);?\\s*</script>', flags: 'i' },
          { label: 'No scripts left in head', re: '<head>((?!<script)[\\s\\S])*</head>', flags: 'i' },
          { label: 'Scripts at the end of body', re: '<body>[\\s\\S]*<p[\\s\\S]*<script[\\s\\S]*</script>\\s*</body>', flags: 'i' },
        ],
        hint: 'Code inside a script with src is ignored. Split it into two tags and move both to the end of body.',
        explain: 'A script with src ignores its own content, so the call needs a second tag. At the end of body it no longer holds up the page.',
        preview: {},
      },
    ],
    // L2 defer vs async
    [
      {
        kind: 'write',
        prompt: 'In head, load lightbox.js then gallery.js in order, and visits.js whenever.',
        starter: '<head>\n  <title>Photo Gallery</title>\n</head>',
        solution:
          '<head>\n  <title>Photo Gallery</title>\n  <script src="lightbox.js" defer></script>\n  <script src="gallery.js" defer></script>\n  <script src="visits.js" async></script>\n</head>',
        checks: [
          { label: 'lightbox.js with defer', re: '<script(?=[^>]*\\ssrc="lightbox\\.js")(?=[^>]*\\sdefer\\b)', flags: 'i' },
          { label: 'gallery.js with defer', re: '<script(?=[^>]*\\ssrc="gallery\\.js")(?=[^>]*\\sdefer\\b)', flags: 'i' },
          { label: 'lightbox.js comes before gallery.js', re: 'lightbox\\.js[\\s\\S]*gallery\\.js', flags: 'i' },
          { label: 'visits.js with async', re: '<script(?=[^>]*\\ssrc="visits\\.js")(?=[^>]*\\sasync\\b)', flags: 'i' },
          { label: 'All inside the head', re: '<head>[\\s\\S]*visits\\.js[\\s\\S]*</head>', flags: 'i' },
        ],
        hint: 'defer keeps source order; async runs whenever the file arrives.',
        explain: 'Deferred scripts run in order after parsing, so gallery.js can use lightbox.js. The visit counter depends on nothing, so async suits it.',
        preview: {},
      },
      {
        kind: 'write',
        prompt: 'dashboard.js needs charts.js first, and ads.js must not block. Fix the attributes.',
        starter:
          '<head>\n  <script src="charts.js" async></script>\n  <script src="dashboard.js" async></script>\n  <script src="ads.js"></script>\n</head>',
        solution:
          '<head>\n  <script src="charts.js" defer></script>\n  <script src="dashboard.js" defer></script>\n  <script src="ads.js" async></script>\n</head>',
        checks: [
          { label: 'charts.js uses defer, not async', re: '<script(?=[^>]*\\ssrc="charts\\.js")(?=[^>]*\\sdefer\\b)(?![^>]*\\sasync\\b)', flags: 'i' },
          { label: 'dashboard.js uses defer, not async', re: '<script(?=[^>]*\\ssrc="dashboard\\.js")(?=[^>]*\\sdefer\\b)(?![^>]*\\sasync\\b)', flags: 'i' },
          { label: 'charts.js still comes first', re: 'charts\\.js[\\s\\S]*dashboard\\.js', flags: 'i' },
          { label: 'ads.js no longer blocks', re: '<script(?=[^>]*\\ssrc="ads\\.js")(?=[^>]*\\s(async|defer)\\b)', flags: 'i' },
        ],
        hint: 'Two async scripts can run in either order. Which attribute keeps order?',
        explain: 'With async, dashboard.js could arrive first and crash. defer runs both in order; async frees ads.js to run whenever.',
        preview: {},
      },
    ],
    // L3 Modules & fallbacks
    [
      {
        kind: 'write',
        prompt: 'Load the bus map as a module, with an old-browser script and a no-JS message.',
        starter: '<div id="map"></div>\n',
        solution:
          '<div id="map"></div>\n<script type="module" src="map.js"></script>\n<script nomodule src="map-legacy.js"></script>\n<noscript>\n  <p>Turn on JavaScript to see the map, or read the <a href="/stops.html">list of stops</a>.</p>\n</noscript>',
        checks: [
          { label: 'A <script type="module"> with a src', re: '<script(?=[^>]*\\stype="module")(?=[^>]*\\ssrc="[^"]+")', flags: 'i' },
          { label: 'A nomodule script for old browsers', re: '<script(?=[^>]*\\snomodule\\b)(?=[^>]*\\ssrc="[^"]+")', flags: 'i' },
          { label: 'A <noscript> with a message', re: '<noscript>[\\s\\S]*?[A-Za-z][\\s\\S]*?</noscript>', flags: 'i' },
        ],
        hint: 'type="module" for modern browsers, nomodule for old ones, noscript for no JavaScript at all.',
        explain: 'Modern browsers skip nomodule and old ones skip type="module", so exactly one runs. Modules are deferred already.',
        preview: {},
      },
      {
        kind: 'write',
        prompt: 'This import throws an error. Make the script a module and add a no-JS fallback.',
        starter:
          '<p id="total"></p>\n<script>\n  import { formatPrice } from \'./money.js\';\n  document.getElementById(\'total\').textContent = formatPrice(1999);\n</script>',
        solution:
          '<p id="total"></p>\n<script type="module">\n  import { formatPrice } from \'./money.js\';\n  document.getElementById(\'total\').textContent = formatPrice(1999);\n</script>\n<noscript>\n  <p>Total: $19.99</p>\n</noscript>',
        checks: [
          { label: 'The script has type="module"', re: '<script[^>]*\\stype="module"[^>]*>\\s*import\\b', flags: 'i' },
          { label: 'Keep the import line', re: 'import\\s*\\{\\s*formatPrice\\s*\\}\\s*from\\s*[\'"]\\./money\\.js[\'"]' },
          { label: 'A <noscript> fallback', re: '<noscript>[\\s\\S]*?[A-Za-z0-9][\\s\\S]*?</noscript>', flags: 'i' },
        ],
        hint: 'import only works inside one kind of script. One attribute fixes it.',
        explain: 'A classic script can’t use import. As a module it can, and it waits for the page like defer does.',
        preview: {},
      },
    ],
    // L4 Resource hints
    [
      {
        kind: 'write',
        prompt: 'Add head hints: connect to a font server, preload the hero, prefetch the next page.',
        starter: '<head>\n  <meta charset="utf-8">\n  <title>Surf Report</title>\n</head>',
        solution:
          '<head>\n  <meta charset="utf-8">\n  <title>Surf Report</title>\n  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>\n  <link rel="preload" href="waves.webp" as="image">\n  <link rel="prefetch" href="/forecast.html">\n</head>',
        checks: [
          { label: 'A preconnect to an https server', re: '<link(?=[^>]*\\srel="preconnect")(?=[^>]*\\shref="https://[^"]+")', flags: 'i' },
          { label: 'A preload of the hero with as="image"', re: '<link(?=[^>]*\\srel="preload")(?=[^>]*\\shref="[^"]+")(?=[^>]*\\sas="image")', flags: 'i' },
          { label: 'A prefetch of the next page', re: '<link(?=[^>]*\\srel="prefetch")(?=[^>]*\\shref="[^"]+")', flags: 'i' },
          { label: 'The hints sit in the head', re: '<head>[\\s\\S]*<link[\\s\\S]*</head>', flags: 'i' },
        ],
        hint: 'Three <link rel="…"> tags: preconnect, preload (with as) and prefetch.',
        explain: 'preconnect warms up a connection, preload fetches what this page needs now, and prefetch quietly grabs the next page.',
        preview: {},
      },
      {
        kind: 'write',
        prompt: 'Match each hint to its job: this page’s banner, the next page, a module.',
        starter:
          '<head>\n  <title>Checkout</title>\n  <link rel="prefetch" href="banner.jpg">\n  <link rel="preload" href="/thanks.html">\n  <link rel="preload" href="cart.js">\n  <script type="module" src="cart.js"></script>\n</head>',
        solution:
          '<head>\n  <title>Checkout</title>\n  <link rel="preload" href="banner.jpg" as="image">\n  <link rel="prefetch" href="/thanks.html">\n  <link rel="modulepreload" href="cart.js">\n  <script type="module" src="cart.js"></script>\n</head>',
        checks: [
          { label: 'Preload banner.jpg with as="image"', re: '<link(?=[^>]*\\srel="preload")(?=[^>]*\\shref="banner\\.jpg")(?=[^>]*\\sas="image")', flags: 'i' },
          { label: 'Prefetch /thanks.html', re: '<link(?=[^>]*\\srel="prefetch")(?=[^>]*\\shref="/thanks\\.html")', flags: 'i' },
          { label: 'modulepreload for cart.js', re: '<link(?=[^>]*\\srel="modulepreload")(?=[^>]*\\shref="cart\\.js")', flags: 'i' },
        ],
        hint: 'Needed now: preload (with as). Needed next: prefetch. A module: its own kind of preload.',
        explain: 'Each hint has one job. modulepreload also parses the module, which a plain preload can’t do.',
        preview: {},
      },
    ],
    // L5 Priority & paint
    [
      {
        kind: 'write',
        prompt: 'Rush the cabin hero image, and lazy-load two thumbnails below it.',
        starter: '',
        solution:
          '<img src="cabin.jpg" alt="Log cabin by a frozen lake" width="800" height="450" fetchpriority="high">\n<img src="sauna.jpg" alt="Wood-fired sauna" width="200" height="150" loading="lazy" decoding="async">\n<img src="trail.jpg" alt="Snowshoe trail through pines" width="200" height="150" loading="lazy" decoding="async">',
        checks: [
          { label: 'The hero comes first, with fetchpriority="high"', re: '^((?!<img)[\\s\\S])*<img[^>]*\\sfetchpriority="high"', flags: 'i' },
          { label: 'The hero isn’t lazy', re: '<img(?=[^>]*\\sfetchpriority="high")(?![^>]*\\sloading="lazy")', flags: 'i' },
          {
            label: 'Two thumbnails with loading="lazy" and decoding="async"',
            re: '(<img(?=[^>]*\\sloading="lazy")(?=[^>]*\\sdecoding="async")[^>]*>[\\s\\S]*?){2}',
            flags: 'i',
          },
          { label: 'Alt text on every image', re: '^(?![\\s\\S]*<img(?![^>]*\\salt="[^"]+")[^>]*>)[\\s\\S]*<img', flags: 'i' },
        ],
        hint: 'fetchpriority on the hero; loading and decoding on the thumbnails.',
        explain: 'The hero is fetched first, while the thumbnails wait until they’re near the screen and decode without holding anything up.',
        preview: {},
      },
      {
        kind: 'write',
        prompt: 'Stop the theme flash with render blocking, and push analytics to low priority.',
        starter: '<head>\n  <script src="theme.js" async></script>\n  <script src="analytics.js" fetchpriority="high" async></script>\n</head>',
        solution:
          '<head>\n  <script src="theme.js" async blocking="render"></script>\n  <script src="analytics.js" fetchpriority="low" async></script>\n</head>',
        checks: [
          { label: 'theme.js has blocking="render"', re: '<script(?=[^>]*\\ssrc="theme\\.js")(?=[^>]*\\sblocking="render")', flags: 'i' },
          { label: 'analytics.js has fetchpriority="low"', re: '<script(?=[^>]*\\ssrc="analytics\\.js")(?=[^>]*\\sfetchpriority="low")', flags: 'i' },
          { label: 'analytics.js doesn’t block rendering', re: '<script(?=[^>]*\\ssrc="analytics\\.js")(?![^>]*\\sblocking=)', flags: 'i' },
        ],
        hint: 'One script must run before the first paint; the other matters least of all.',
        explain: 'blocking="render" holds the first paint so the page never flashes the wrong theme. Analytics can wait, so it goes low.',
        preview: {},
      },
    ],
  ],
};

export default unit;
