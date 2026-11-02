import type { DesktopUnit } from '../../../engine/types';

// Desktop edition: write-the-code challenges for HTML unit 9 (Meta & SEO).
// lessons[i] runs after lesson i + 1. See docs/CONTENT_GUIDE.md.
const unit: DesktopUnit = {
  lessons: [
    // L1 Charset & viewport
    [
      {
        kind: 'write',
        prompt: 'Write the head for a plant shop page that works on phones.',
        starter: '<!DOCTYPE html>\n<html lang="en">\n\n<body>\n  <h1>Leafy Corner</h1>\n</body>\n</html>',
        solution:
          '<!DOCTYPE html>\n<html lang="en">\n<head>\n  <meta charset="utf-8">\n  <meta name="viewport" content="width=device-width, initial-scale=1">\n  <title>Leafy Corner Plant Shop</title>\n</head>\n<body>\n  <h1>Leafy Corner</h1>\n</body>\n</html>',
        checks: [
          { label: '<meta charset="utf-8"> first in the head', re: '<head>\\s*<meta\\s+charset=["\']?utf-8["\']?\\s*/?>', flags: 'i' },
          {
            label: 'A viewport meta: width=device-width, initial-scale=1',
            re: '<meta(?=[^>]*\\sname=["\']viewport["\'])(?=[^>]*\\scontent=["\']width=device-width,\\s*initial-scale=1(\\.0)?["\'])[^>]*>',
            flags: 'i',
          },
          { label: 'A <title> in the head', re: '<head>[\\s\\S]*<title>[^<]*\\S[^<]*</title>[\\s\\S]*</head>\\s*<body>', flags: 'i' },
          { label: 'No </meta> closing tags', not: '</meta>' },
        ],
        hint: 'charset goes first; meta is empty. The viewport content is width=device-width, initial-scale=1.',
        explain: 'charset makes every character show correctly, and the viewport stops phones shrinking a desktop layout.',
        preview: {},
      },
      {
        kind: 'write',
        prompt: 'Fix the tide page head: charset first, a phone-ready viewport, valid meta tags.',
        starter:
          '<!DOCTYPE html>\n<html lang="en">\n<head>\n  <title>Tide Times</title>\n  <meta name="viewport" content="width=980">\n  <meta charset="utf-8"></meta>\n</head>\n<body>\n  <h1>Tide Times</h1>\n</body>\n</html>',
        solution:
          '<!DOCTYPE html>\n<html lang="en">\n<head>\n  <meta charset="utf-8">\n  <meta name="viewport" content="width=device-width, initial-scale=1">\n  <title>Tide Times</title>\n</head>\n<body>\n  <h1>Tide Times</h1>\n</body>\n</html>',
        checks: [
          { label: 'charset is the first thing in the head', re: '<head>\\s*<meta\\s+charset=["\']?utf-8["\']?\\s*/?>', flags: 'i' },
          { label: 'No </meta>', not: '</meta>' },
          {
            label: 'Viewport: width=device-width, initial-scale=1',
            re: '<meta(?=[^>]*\\sname=["\']viewport["\'])(?=[^>]*\\scontent=["\']width=device-width,\\s*initial-scale=1(\\.0)?["\'])[^>]*>',
            flags: 'i',
          },
          { label: 'No fixed width=980', not: 'width=980' },
          { label: 'Keep the title', re: '<title>\\s*Tide Times\\s*</title>', flags: 'i' },
        ],
        hint: 'Move the charset line to the top of head and drop </meta>. device-width means the phone’s own width.',
        explain: 'The charset must come early, before any text is read. A fixed 980px viewport makes phones zoom out.',
        preview: {},
      },
    ],
    // L2 Page descriptions
    [
      {
        kind: 'write',
        prompt: 'Write a specific title and a search description for a dog-walking page.',
        starter: '<head>\n  <meta charset="utf-8">\n\n</head>',
        solution:
          '<head>\n  <meta charset="utf-8">\n  <title>Dog Walking in Bristol | Happy Paws</title>\n  <meta name="description" content="Daily group and solo walks for dogs of every size, with GPS updates.">\n</head>',
        checks: [
          { label: 'A <title> of a few words', re: '<title>\\s*\\S+\\s+\\S[^<]*</title>', flags: 'i' },
          {
            label: 'A meta description with a real summary',
            re: '<meta(?=[^>]*\\sname=["\']description["\'])(?=[^>]*\\scontent=["\'][^"\']{20,}["\'])[^>]*>',
            flags: 'i',
          },
          { label: 'Both inside the head', re: '<head>[\\s\\S]*(<title|<meta[^>]*description)[\\s\\S]*</head>', flags: 'i' },
        ],
        hint: 'The title names this page and the site. The description is one short, useful sentence.',
        explain: 'Search results often show the title as the headline and the description beneath it.',
        preview: {},
      },
      {
        kind: 'write',
        prompt: 'Give the kayak tours page a specific title and a real description.',
        starter: '<head>\n  <meta charset="utf-8">\n  <title>Page</title>\n  <meta name="summary" content="">\n</head>',
        solution:
          '<head>\n  <meta charset="utf-8">\n  <title>Sunset Kayak Tours | Bay Paddlers</title>\n  <meta name="description" content="Two-hour guided kayak tours at sunset. No experience needed.">\n</head>',
        checks: [
          { label: 'A title that mentions kayak tours', re: '<title>[^<]*kayak[^<]*</title>', flags: 'i' },
          { label: 'Not just “Page”', not: '<title>Page</title>' },
          {
            label: 'name="description" with a summary of 20+ characters',
            re: '<meta(?=[^>]*\\sname=["\']description["\'])(?=[^>]*\\scontent=["\'][^"\']{20,}["\'])[^>]*>',
            flags: 'i',
          },
          { label: 'No name="summary"', not: 'name="summary"' },
        ],
        hint: 'The meta’s name must be exactly description, and content holds the sentence.',
        explain: 'Search engines only read name="description". A vague title like Page gives searchers no reason to click.',
        preview: {},
      },
    ],
    // L3 Head links
    [
      {
        kind: 'write',
        prompt: 'Link a stylesheet, a tab icon and a canonical URL in the head.',
        starter: '<head>\n  <meta charset="utf-8">\n  <title>Rise Bakery Menu</title>\n\n</head>',
        solution:
          '<head>\n  <meta charset="utf-8">\n  <title>Rise Bakery Menu</title>\n  <link rel="stylesheet" href="styles.css">\n  <link rel="icon" href="favicon.png">\n  <link rel="canonical" href="https://risebakery.example/menu">\n</head>',
        checks: [
          { label: 'A stylesheet link to a .css file', re: '<link(?=[^>]*\\srel=["\']stylesheet["\'])(?=[^>]*\\shref=["\'][^"\']+\\.css["\'])[^>]*>', flags: 'i' },
          { label: 'An icon link', re: '<link(?=[^>]*\\srel=["\'](shortcut )?icon["\'])(?=[^>]*\\shref=["\'][^"\']+["\'])[^>]*>', flags: 'i' },
          { label: 'A canonical link with a full https:// URL', re: '<link(?=[^>]*\\srel=["\']canonical["\'])(?=[^>]*\\shref=["\']https://[^"\']+["\'])[^>]*>', flags: 'i' },
          { label: 'No </link> closing tags', not: '</link>' },
        ],
        hint: 'Each is <link rel="…" href="…">, empty, inside head.',
        explain: 'rel says what the file is for: styles, the tab icon, or the address search engines should index.',
        preview: {},
      },
      {
        kind: 'write',
        prompt: 'Fix the head links so the CSS, icon and canonical URL all work.',
        starter:
          '<!DOCTYPE html>\n<html lang="en">\n<head>\n  <meta charset="utf-8">\n  <title>Pixel Pets</title>\n  <link rel="style" href="pets.css">\n  <link href="paw.png">\n</head>\n<body>\n  <link rel="canonical" href="https://pixelpets.example/">\n  <h1>Pixel Pets</h1>\n</body>\n</html>',
        solution:
          '<!DOCTYPE html>\n<html lang="en">\n<head>\n  <meta charset="utf-8">\n  <title>Pixel Pets</title>\n  <link rel="stylesheet" href="pets.css">\n  <link rel="icon" href="paw.png">\n  <link rel="canonical" href="https://pixelpets.example/">\n</head>\n<body>\n  <h1>Pixel Pets</h1>\n</body>\n</html>',
        checks: [
          { label: 'pets.css uses rel="stylesheet"', re: '<link(?=[^>]*\\srel=["\']stylesheet["\'])(?=[^>]*\\shref=["\']pets\\.css["\'])[^>]*>', flags: 'i' },
          { label: 'paw.png uses rel="icon"', re: '<link(?=[^>]*\\srel=["\'](shortcut )?icon["\'])(?=[^>]*\\shref=["\']paw\\.png["\'])[^>]*>', flags: 'i' },
          { label: 'The canonical link moves into the head', re: '<link[^>]*\\srel=["\']canonical["\'][^>]*>[\\s\\S]*</head>', flags: 'i' },
          { label: 'No links left in the body', re: '<body>(?:(?!<link)[\\s\\S])*</body>', flags: 'i' },
        ],
        hint: 'rel must be a real keyword: stylesheet, icon, canonical. link belongs in head.',
        explain: 'An unknown rel like style is ignored, so the CSS never loads. Search engines look for canonical in the head.',
        preview: {},
      },
    ],
    // L4 Social previews
    [
      {
        kind: 'write',
        prompt: 'Add the four Open Graph tags for a shared pizza recipe page.',
        starter: '<head>\n  <meta charset="utf-8">\n  <title>Pizza Dough | Oven Club</title>\n\n</head>',
        solution:
          '<head>\n  <meta charset="utf-8">\n  <title>Pizza Dough | Oven Club</title>\n  <meta property="og:title" content="Overnight Pizza Dough">\n  <meta property="og:description" content="Crisp, chewy crust from four ingredients.">\n  <meta property="og:image" content="https://ovenclub.example/dough.jpg">\n  <meta property="og:url" content="https://ovenclub.example/pizza-dough">\n</head>',
        checks: [
          { label: 'og:title', re: '<meta(?=[^>]*\\sproperty=["\']og:title["\'])(?=[^>]*\\scontent=["\'][^"\']+["\'])[^>]*>', flags: 'i' },
          { label: 'og:description', re: '<meta(?=[^>]*\\sproperty=["\']og:description["\'])(?=[^>]*\\scontent=["\'][^"\']+["\'])[^>]*>', flags: 'i' },
          { label: 'og:image with a full https:// URL', re: '<meta(?=[^>]*\\sproperty=["\']og:image["\'])(?=[^>]*\\scontent=["\']https://[^"\']+["\'])[^>]*>', flags: 'i' },
          { label: 'og:url with a full https:// URL', re: '<meta(?=[^>]*\\sproperty=["\']og:url["\'])(?=[^>]*\\scontent=["\']https://[^"\']+["\'])[^>]*>', flags: 'i' },
          { label: 'Use property, not name, for og: tags', re: '^(?![\\s\\S]*name=["\']og:)[\\s\\S]*og:', flags: 'i' },
        ],
        hint: '<meta property="og:…" content="…">. Image and URL need https:// in full.',
        explain: 'Chat and social apps read these tags to build the link card, and they can’t resolve relative paths.',
        preview: {},
      },
      {
        kind: 'write',
        prompt: 'Fix the night-market preview tags and add the missing og:url.',
        starter:
          '<meta name="og:title" content="Night Market Guide">\n<meta property="og:image" content="/img/market.jpg">\n<meta property="og:description" value="Street food after dark.">',
        solution:
          '<meta property="og:title" content="Night Market Guide">\n<meta property="og:image" content="https://citybites.example/img/market.jpg">\n<meta property="og:description" content="Street food after dark.">\n<meta property="og:url" content="https://citybites.example/night-market">',
        checks: [
          { label: 'og:title uses property', re: '<meta(?=[^>]*\\sproperty=["\']og:title["\'])(?=[^>]*\\scontent=)[^>]*>', flags: 'i' },
          { label: 'og:image is a full https:// URL', re: '<meta(?=[^>]*\\sproperty=["\']og:image["\'])(?=[^>]*\\scontent=["\']https://[^"\']+["\'])[^>]*>', flags: 'i' },
          { label: 'og:description uses content, not value', re: '<meta(?=[^>]*\\sproperty=["\']og:description["\'])(?![^>]*\\svalue=)(?=[^>]*\\scontent=["\'][^"\']+["\'])[^>]*>', flags: 'i' },
          { label: 'Add og:url with https://', re: '<meta(?=[^>]*\\sproperty=["\']og:url["\'])(?=[^>]*\\scontent=["\']https://[^"\']+["\'])[^>]*>', flags: 'i' },
          { label: 'No name="og:…"', not: 'name="og:' },
        ],
        hint: 'Open Graph uses property and content. A path starting with / isn’t a full address.',
        explain: 'Apps fetch the preview from outside your site, so they ignore name, value and relative paths.',
        preview: {},
      },
    ],
    // L5 Robots rules
    [
      {
        kind: 'write',
        prompt: 'Keep this order-confirmed page out of search and stop robots following its links.',
        starter: '<head>\n  <meta charset="utf-8">\n  <title>Order confirmed | Bean Box</title>\n\n</head>',
        solution:
          '<head>\n  <meta charset="utf-8">\n  <title>Order confirmed | Bean Box</title>\n  <meta name="robots" content="noindex, nofollow">\n</head>',
        checks: [
          { label: 'A <meta name="robots">', re: '<meta[^>]*\\sname=["\']robots["\']', flags: 'i' },
          { label: 'Its content includes noindex', re: '<meta(?=[^>]*\\sname=["\']robots["\'])[^>]*\\scontent=["\'][^"\']*noindex', flags: 'i' },
          { label: 'Its content includes nofollow', re: '<meta(?=[^>]*\\sname=["\']robots["\'])[^>]*\\scontent=["\'][^"\']*nofollow', flags: 'i' },
          { label: 'Inside the head', re: '<head>[\\s\\S]*<meta[^>]*robots[\\s\\S]*</head>', flags: 'i' },
        ],
        hint: 'One meta tag: name="robots", content with both rules, separated by a comma.',
        explain: 'noindex keeps the page out of results; nofollow tells crawlers not to follow its links.',
        preview: {},
      },
      {
        kind: 'write',
        prompt: 'Mark the sponsor link as paid and the commenter’s link as user content.',
        starter:
          '<aside>\n  <p>Thanks to <a href="https://tentco.example">TentCo</a> for sponsoring this post!</p>\n</aside>\n<section>\n  <h2>Comments</h2>\n  <p>Great trip! Pics on <a href="https://jo-hikes.example">my blog</a></p>\n</section>',
        solution:
          '<aside>\n  <p>Thanks to <a href="https://tentco.example" rel="sponsored">TentCo</a> for sponsoring this post!</p>\n</aside>\n<section>\n  <h2>Comments</h2>\n  <p>Great trip! Pics on <a href="https://jo-hikes.example" rel="ugc">my blog</a></p>\n</section>',
        checks: [
          {
            label: 'The TentCo link has rel="sponsored"',
            re: '<a(?=[^>]*tentco\\.example)(?=[^>]*\\srel=["\'][^"\']*\\bsponsored\\b[^"\']*["\'])[^>]*>',
            flags: 'i',
          },
          {
            label: 'The comment link has rel="ugc"',
            re: '<a(?=[^>]*jo-hikes\\.example)(?=[^>]*\\srel=["\'][^"\']*\\bugc\\b[^"\']*["\'])[^>]*>',
            flags: 'i',
          },
          { label: 'Don’t mix them up', re: '^(?![\\s\\S]*<a(?=[^>]*jo-hikes)[^>]*sponsored)(?![\\s\\S]*<a(?=[^>]*tentco)[^>]*ugc)[\\s\\S]*<a', flags: 'i' },
        ],
        hint: 'rel goes on each a: sponsored for paid links, ugc for links people post.',
        explain: 'rel tells search engines why a link is there, so paid and user links don’t pass your site’s trust.',
        preview: {},
      },
    ],
  ],
};

export default unit;
