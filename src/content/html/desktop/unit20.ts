import type { DesktopUnit } from '../../../engine/types';

// Desktop edition: write-the-code challenges for HTML unit 20 (Capstone: a complete page).
// lessons[i] runs after lesson i + 1. See docs/CONTENT_GUIDE.md.
// The challenges build a second site alongside the lessons' market: the Riverside Book Fair.
const LABELLED = (field: string) =>
  `<label[^>]*\\sfor="([\\w-]+)"[\\s\\S]*?<input(?=[^>]*\\sid="\\1")${field}|<input(?=[^>]*\\sid="([\\w-]+)")${field}[\\s\\S]*?<label[^>]*\\sfor="\\2"|<label[^>]*>[^<]*<input${field}`;

const unit: DesktopUnit = {
  lessons: [
    // L1 Skeleton & head
    [
      {
        kind: 'write',
        prompt: 'Write the full skeleton for Riverside Book Fair, with a complete head.',
        starter: '',
        solution:
          '<!DOCTYPE html>\n<html lang="en">\n  <head>\n    <meta charset="utf-8">\n    <meta name="viewport" content="width=device-width, initial-scale=1">\n    <title>Riverside Book Fair</title>\n    <meta name="description" content="Three days of used books, author talks and kids’ readings by the river.">\n  </head>\n  <body>\n    <h1>Riverside Book Fair</h1>\n  </body>\n</html>',
        checks: [
          { label: 'Doctype, then <html lang="…">', re: '^\\s*<!doctype html>\\s*<html[^>]*\\slang="[a-z]{2}(-[a-z]{2})?"', flags: 'i' },
          { label: '<meta charset="utf-8">', re: '<head>[\\s\\S]*<meta[^>]*\\scharset="utf-8"[\\s\\S]*</head>', flags: 'i' },
          {
            label: 'A viewport meta with width=device-width',
            re: '<meta(?=[^>]*\\sname="viewport")(?=[^>]*\\scontent="[^"]*width=device-width)',
            flags: 'i',
          },
          { label: 'The title Riverside Book Fair', re: '<title>\\s*Riverside Book Fair\\s*</title>', flags: 'i' },
          { label: 'A meta description', re: '<meta(?=[^>]*\\sname="description")(?=[^>]*\\scontent="[^"]{10,}")', flags: 'i' },
          { label: 'A body with an h1', re: '</head>\\s*<body>[\\s\\S]*<h1>[^<]+</h1>[\\s\\S]*</body>\\s*</html>\\s*$', flags: 'i' },
        ],
        hint: 'Head order: charset, viewport, title, description. Then the body with the h1.',
        explain: 'charset and viewport make the page read and fit right; title and description are what search results show.',
        preview: {},
      },
      {
        kind: 'write',
        prompt: 'Tidy this head: a language, charset first, viewport in the head, and a description.',
        starter:
          '<!DOCTYPE html>\n<html>\n<head>\n  <title>Riverside Book Fair</title>\n  <meta charset="utf-8">\n</head>\n<body>\n  <meta name="viewport" content="width=device-width, initial-scale=1">\n  <h1>Riverside Book Fair</h1>\n</body>\n</html>',
        solution:
          '<!DOCTYPE html>\n<html lang="en">\n<head>\n  <meta charset="utf-8">\n  <meta name="viewport" content="width=device-width, initial-scale=1">\n  <title>Riverside Book Fair</title>\n  <meta name="description" content="Used books, author talks and readings by the river, 11–13 September.">\n</head>\n<body>\n  <h1>Riverside Book Fair</h1>\n</body>\n</html>',
        checks: [
          { label: 'lang on <html>', re: '<html[^>]*\\slang="[a-z]{2}(-[a-z]{2})?"', flags: 'i' },
          { label: 'charset is the first thing in head', re: '<head>\\s*<meta\\s+charset="utf-8"', flags: 'i' },
          { label: 'The viewport meta is in the head', re: '<head>((?!</head>)[\\s\\S])*\\sname="viewport"', flags: 'i' },
          { label: 'Nothing but content in body', re: '<body>((?!<meta)[\\s\\S])*</body>', flags: 'i' },
          { label: 'A meta description in the head', re: '<head>((?!</head>)[\\s\\S])*<meta(?=[^>]*\\sname="description")(?=[^>]*\\scontent="[^"]{10,}")', flags: 'i' },
        ],
        hint: 'meta tags belong in head. Move charset to the top and the viewport up from body.',
        explain: 'The charset must come early so the browser reads the rest correctly. meta tags belong in head; one in body isn’t valid HTML.',
        preview: {},
      },
    ],
    // L2 Layout & navigation
    [
      {
        kind: 'write',
        prompt: 'Lay out the book fair body: skip link, header with nav, main and footer.',
        starter: '',
        solution:
          '<a href="#content">Skip to content</a>\n<header>\n  <nav aria-label="Main">\n    <a href="/" aria-current="page">Home</a>\n    <a href="/authors">Authors</a>\n    <a href="/map">Map</a>\n  </nav>\n</header>\n<main id="content">\n  <h1>Riverside Book Fair</h1>\n</main>\n<footer>© 2026 Riverside Book Fair</footer>',
        checks: [
          { label: 'A skip link first, pointing at main’s id', re: '^\\s*<a[^>]*\\shref="#([\\w-]+)"[\\s\\S]*<main[^>]*\\sid="\\1"', flags: 'i' },
          { label: 'A <nav> inside the <header>', re: '<header[^>]*>\\s*<nav[\\s\\S]*</nav>\\s*</header>', flags: 'i' },
          { label: 'aria-current="page" on the current link', re: '<a[^>]*\\saria-current="page"', flags: 'i' },
          { label: 'Exactly one <main>', re: '^(?![\\s\\S]*<main[\\s\\S]*<main)[\\s\\S]*<main[\\s\\S]*</main>', flags: 'i' },
          { label: 'A <footer> after main', re: '</main>\\s*<footer[^>]*>[\\s\\S]*\\S[\\s\\S]*</footer>', flags: 'i' },
        ],
        hint: 'Skip link, header > nav, main with an id, footer. The skip link’s href is # plus main’s id.',
        explain: 'Landmarks let screen-reader users jump between parts of the page, and the skip link does the same for keyboard users.',
        preview: {},
      },
      {
        kind: 'write',
        prompt: 'Swap the divs for landmarks, add a skip link, and mark the current page.',
        starter:
          '<div class="top">\n  <div class="links">\n    <a href="/">Home</a>\n    <a href="/tickets">Tickets</a>\n  </div>\n</div>\n<div class="content">\n  <h1>Tickets</h1>\n  <p>Day passes from $8.</p>\n</div>\n<div class="bottom">Riverside Book Fair</div>',
        solution:
          '<a href="#main">Skip to content</a>\n<header>\n  <nav aria-label="Main">\n    <a href="/">Home</a>\n    <a href="/tickets" aria-current="page">Tickets</a>\n  </nav>\n</header>\n<main id="main">\n  <h1>Tickets</h1>\n  <p>Day passes from $8.</p>\n</main>\n<footer>Riverside Book Fair</footer>',
        checks: [
          { label: 'header > nav around the links', re: '<header[^>]*>\\s*<nav[^>]*>[\\s\\S]*href="/tickets"[\\s\\S]*</nav>\\s*</header>', flags: 'i' },
          { label: '<main> with an id holds the content', re: '<main[^>]*\\sid="[\\w-]+"[^>]*>\\s*<h1>\\s*Tickets', flags: 'i' },
          { label: 'A skip link to main', re: '<a[^>]*\\shref="#([\\w-]+)"[\\s\\S]*<main[^>]*\\sid="\\1"', flags: 'i' },
          { label: 'Tickets marked aria-current="page"', re: '<a(?=[^>]*\\shref="/tickets")(?=[^>]*\\saria-current="page")', flags: 'i' },
          { label: 'A <footer>', re: '<footer[^>]*>[^<]*Riverside Book Fair', flags: 'i' },
        ],
        hint: 'top → header, links → nav, content → main, bottom → footer. This is the Tickets page.',
        explain: 'Same look, but now assistive tech knows which part is which, and the current link is announced as the current page.',
        preview: {},
      },
    ],
    // L3 Media & structured data
    [
      {
        kind: 'write',
        prompt: 'Add the fair poster, a machine-readable opening time and an Event JSON-LD.',
        starter: '',
        solution:
          '<img src="fair-poster.jpg" alt="Book stalls under white tents by the river" width="800" height="500">\n<p>Opens <time datetime="2026-09-12T10:00">10 am, Saturday 12 September</time></p>\n<script type="application/ld+json">\n{\n  "@context": "https://schema.org",\n  "@type": "Event",\n  "name": "Riverside Book Fair",\n  "startDate": "2026-09-12T10:00"\n}\n</script>',
        checks: [
          {
            label: 'A poster <img> with alt, width and height',
            re: '<img(?=[^>]*\\salt="[^"]{5,}")(?=[^>]*\\swidth="\\d+")(?=[^>]*\\sheight="\\d+")',
            flags: 'i',
          },
          { label: 'A <time datetime> with date and time', re: '<time[^>]*\\sdatetime="\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}"[^>]*>[^<]*\\S', flags: 'i' },
          { label: 'A JSON-LD script', re: '<script[^>]*\\stype="application/ld\\+json"', flags: 'i' },
          {
            label: '"@context" and "@type": "Event"',
            re: '^(?=[\\s\\S]*"@context"\\s*:\\s*"https://schema\\.org/?")(?=[\\s\\S]*"@type"\\s*:\\s*"Event")',
          },
          { label: '"startDate" matches the time’s datetime', re: '<time[^>]*\\sdatetime="([^"]+)"[\\s\\S]*"startDate"\\s*:\\s*"\\1"' },
        ],
        hint: 'Use the same ISO date-time in the time element and in "startDate".',
        explain: 'People read the friendly date, while time and JSON-LD give search engines the exact start, so the fair can show up as an event.',
        preview: {},
      },
      {
        kind: 'write',
        prompt: 'Finish the author-talk listing: image details, a real time, and the event’s place.',
        starter:
          '<img src="talk.jpg">\n<p>Mon 14 Sep, <time>6:30 pm</time></p>\n<script type="application/ld+json">\n{\n  "@context": "https://schema.org",\n  "@type": "Event",\n  "name": "Meet the Author: Jo Park"\n}\n</script>',
        solution:
          '<img src="talk.jpg" alt="Jo Park reading on stage" width="600" height="400">\n<p>Mon 14 Sep, <time datetime="2026-09-14T18:30">6:30 pm</time></p>\n<script type="application/ld+json">\n{\n  "@context": "https://schema.org",\n  "@type": "Event",\n  "name": "Meet the Author: Jo Park",\n  "startDate": "2026-09-14T18:30",\n  "location": { "@type": "Place", "name": "Riverside Tent B" }\n}\n</script>',
        checks: [
          { label: 'The img gets alt, width and height', re: '<img(?=[^>]*\\salt="[^"]{5,}")(?=[^>]*\\swidth="\\d+")(?=[^>]*\\sheight="\\d+")', flags: 'i' },
          { label: 'time gets datetime="2026-09-14T18:30"', re: '<time[^>]*\\sdatetime="2026-09-14T18:30(:00)?"', flags: 'i' },
          { label: 'A "startDate" in the JSON-LD', re: '"startDate"\\s*:\\s*"2026-09-14T18:30(:00)?"' },
          {
            label: '"location" as a Place with a name',
            re: '"location"\\s*:\\s*\\{(?=[^}]*"@type"\\s*:\\s*"Place")(?=[^}]*"name"\\s*:\\s*"[^"]+")',
          },
          { label: 'Still valid JSON: no trailing comma', re: '^(?![\\s\\S]*,\\s*\\})' },
        ],
        hint: '6:30 pm is 18:30. The location is a nested object with its own "@type".',
        explain: 'With a start and a place, search engines can list the talk properly. The image size keeps the page from jumping as it loads.',
        preview: {},
      },
    ],
    // L4 An accessible form
    [
      {
        kind: 'write',
        prompt: 'Build the volunteer sign-up: labelled name and email, autofill, and an email hint.',
        starter: '',
        solution:
          '<form action="/volunteer" method="post">\n  <label for="vname">Full name</label>\n  <input id="vname" name="name" autocomplete="name" required>\n  <label for="vemail">Email</label>\n  <input id="vemail" type="email" name="email" autocomplete="email" required aria-describedby="vemail-hint">\n  <p id="vemail-hint">We’ll email your shift times.</p>\n  <button>Sign up</button>\n</form>',
        checks: [
          { label: 'A labelled name field with autocomplete="name"', re: LABELLED('(?=[^>]*\\sautocomplete="name")'), flags: 'i' },
          {
            label: 'A labelled email field: type="email", autocomplete="email"',
            re: LABELLED('(?=[^>]*\\stype="email")(?=[^>]*\\sautocomplete="email")'),
            flags: 'i',
          },
          {
            label: 'aria-describedby links the email to a hint',
            re: '<input[^>]*\\saria-describedby="([\\w-]+)"[^>]*>[\\s\\S]*<(p|span|div|small)[^>]*\\sid="\\1"[^>]*>[^<]*\\S',
            flags: 'i',
          },
          { label: 'A submit button', re: '<button[^>]*>[^<]*\\S[^<]*</button>', flags: 'i' },
        ],
        hint: 'for on the label matches id on the input. aria-describedby holds the hint’s id.',
        explain: 'Labels name each field, autocomplete fills them in, and the described-by hint is read out when the email field gets focus.',
        preview: {},
      },
      {
        kind: 'write',
        prompt: 'Group the shift choices with fieldset and legend, and label each radio.',
        starter:
          '<form action="/volunteer" method="post">\n  <p>Pick a shift:</p>\n  <input type="radio" name="shift" value="am"> Morning\n  <input type="radio" name="shift" value="pm"> Afternoon\n  <button>Save</button>\n</form>',
        solution:
          '<form action="/volunteer" method="post">\n  <fieldset>\n    <legend>Pick a shift</legend>\n    <input type="radio" id="shift-am" name="shift" value="am" required>\n    <label for="shift-am">Morning</label>\n    <input type="radio" id="shift-pm" name="shift" value="pm">\n    <label for="shift-pm">Afternoon</label>\n  </fieldset>\n  <button>Save</button>\n</form>',
        checks: [
          { label: 'A <fieldset> starting with a <legend>', re: '<fieldset[^>]*>\\s*<legend>[^<]*\\S[^<]*</legend>', flags: 'i' },
          { label: 'Both radios inside the fieldset', re: '<fieldset[\\s\\S]*(<input[^>]*\\stype="radio"[\\s\\S]*?){2}</fieldset>', flags: 'i' },
          { label: 'Morning in a <label>', re: '<label[^>]*>[^<]*(<input[^>]*>)?\\s*Morning\\s*</label>', flags: 'i' },
          { label: 'Afternoon in a <label>', re: '<label[^>]*>[^<]*(<input[^>]*>)?\\s*Afternoon\\s*</label>', flags: 'i' },
          { label: 'The legend replaces the <p>', re: '^(?![\\s\\S]*<p>\\s*Pick a shift)', flags: 'i' },
        ],
        hint: 'fieldset wraps the group with legend first. Give each radio an id and a <label for> (or wrap it in the label).',
        explain: 'The legend is read with each option (“Pick a shift, Morning”), and labels make the words clickable too.',
        preview: {},
      },
    ],
    // L5 Final polish
    [
      {
        kind: 'write',
        prompt: 'Speed up the fair page: preload the hero, defer the script, lazy-load the map.',
        starter: '',
        solution:
          '<link rel="preload" href="hero.jpg" as="image">\n<script src="schedule.js" defer></script>\n<img src="hero.jpg" alt="Crowds browsing book stalls" width="1200" height="600" fetchpriority="high">\n<img src="site-map.png" alt="Map of stalls and stages" width="600" height="400" loading="lazy">',
        checks: [
          {
            label: 'Preload the hero image with as="image"',
            re: '<link(?=[^>]*\\srel="preload")(?=[^>]*\\sas="image")(?=[^>]*\\shref="([^"]+)")[^>]*>[\\s\\S]*<img[^>]*\\ssrc="\\1"',
            flags: 'i',
          },
          { label: 'A script with defer', re: '<script(?=[^>]*\\ssrc="[^"]+")(?=[^>]*\\sdefer\\b)', flags: 'i' },
          { label: 'The map image has loading="lazy"', re: '<img[^>]*\\sloading="lazy"', flags: 'i' },
          { label: 'Alt text on every image', re: '^(?![\\s\\S]*<img(?![^>]*\\salt="[^"]+")[^>]*>)[\\s\\S]*<img[\\s\\S]*<img', flags: 'i' },
          {
            label: 'width and height on every image',
            re: '^(?![\\s\\S]*<img(?!(?=[^>]*\\swidth="\\d+")(?=[^>]*\\sheight="\\d+"))[^>]*>)[\\s\\S]*<img',
            flags: 'i',
          },
        ],
        hint: 'The preload’s href is the hero’s src. Only the image far down the page gets loading="lazy".',
        explain: 'The hero arrives sooner, the script waits for parsing, and the map isn’t fetched until someone scrolls near it.',
        preview: {},
      },
      {
        kind: 'write',
        prompt: 'Fix the audit: one h1, headings in order, alt text, a label, a deferred script.',
        starter:
          '<h1>Riverside Book Fair</h1>\n<h3>Programme</h3>\n<img src="tents.jpg">\n<h1>Getting there</h1>\n<input type="search" name="q" placeholder="Search authors">\n<script src="map.js"></script>',
        solution:
          '<h1>Riverside Book Fair</h1>\n<h2>Programme</h2>\n<img src="tents.jpg" alt="White tents full of books" width="800" height="500">\n<h2>Getting there</h2>\n<label for="q">Search authors</label>\n<input type="search" id="q" name="q">\n<script src="map.js" defer></script>',
        checks: [
          { label: 'Only one <h1>', re: '^(?![\\s\\S]*<h1[\\s\\S]*<h1)[\\s\\S]*<h1', flags: 'i' },
          { label: 'Programme and Getting there as <h2>', re: '<h2>\\s*Programme\\s*</h2>[\\s\\S]*<h2>\\s*Getting there\\s*</h2>', flags: 'i' },
          { label: 'Alt text on the image', re: '<img[^>]*\\salt="[^"]{3,}"', flags: 'i' },
          { label: 'A <label> for the search box', re: LABELLED('(?=[^>]*\\stype="search")'), flags: 'i' },
          { label: 'map.js deferred', re: '<script(?=[^>]*\\ssrc="map\\.js")(?=[^>]*\\sdefer\\b)', flags: 'i' },
        ],
        hint: 'Headings go h1, h2, h3 without skipping. A placeholder is not a label.',
        explain: 'A tidy outline, alt text and real labels make the page usable with a screen reader; defer keeps the script from blocking it.',
        preview: {},
      },
    ],
  ],
};

export default unit;
