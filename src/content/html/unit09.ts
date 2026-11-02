import type { Unit } from '../../engine/types';

const perms = (xs: string[]): string[][] =>
  xs.length <= 1 ? [xs] : xs.flatMap((x, i) => perms([...xs.slice(0, i), ...xs.slice(i + 1)]).map((p) => [x, ...p]));

/** Every other order of a tag's attributes, as token lists (for build `alt`). */
function attrOrders(open: string, attrs: string[], rest: string[]): string[][] {
  return perms(attrs)
    .slice(1)
    .map((p) => [open, ...p, ...rest]);
}

/** Typed variants of an empty tag: each attribute in any listed spelling, in any
 * order, with or without a closing slash. The first spelling, in the given order,
 * comes first (canonical). No slash after an unquoted value: it would join it. */
function voidTag(name: string, attrs: string[][]): string[] {
  const combos = attrs.reduce<string[][]>((acc, alts) => acc.flatMap((a) => alts.map((s) => [...a, s])), [[]]);
  return combos.flatMap((c) =>
    perms(c).flatMap((p) => {
      const tag = `<${name} ${p.join(' ')}`;
      return p[p.length - 1].endsWith('"') ? [`${tag}>`, `${tag}/>`] : [`${tag}>`];
    }),
  );
}

const VIEWPORT = 'content="width=device-width, initial-scale=1"';

const unit: Unit = {
  title: 'Meta & SEO',
  blurb: 'The head: charset, viewport, descriptions, linked files, social cards and robots.',
  lessons: [
    {
      title: 'Charset & viewport',
      concept: {
        body: 'Start the head with <meta charset="utf-8"> so every letter, accent and emoji shows correctly. The viewport meta makes phones lay the page out at the screen’s real width instead of shrinking a desktop layout. meta is empty: no closing tag.',
        code: '<head>\n  <meta charset="utf-8">\n  <meta name="viewport" content="width=device-width, initial-scale=1">\n  <title>Chainline Bike Repairs</title>\n</head>',
      },
      exercises: [
        {
          kind: 'fill',
          prompt: 'Declare the page’s character encoding.',
          code: '<head>\n  <meta ___="utf-8">\n  <title>Noodle Bar</title>\n</head>',
          blanks: [{ answer: ['charset'], options: ['charset', 'encoding', 'lang'] }],
          hint: 'Short for character set.',
          explain: 'charset tells the browser how to turn the file’s bytes into letters. lang is the human language, not the encoding.',
        },
        {
          kind: 'fill',
          prompt: 'Pick the encoding every page should use.',
          code: '<meta charset="___">',
          blanks: [{ answer: ['utf-8'], options: ['utf-8', 'en', 'ascii'] }],
          hint: 'The only encoding HTML allows.',
          explain: 'UTF-8 is the only encoding HTML allows, and it covers every alphabet and emoji. en is a language code, which belongs in lang.',
        },
        {
          kind: 'build',
          prompt: 'Build the charset meta tag.',
          answer: ['<meta', 'charset="utf-8"', '>'],
          distractors: ['</meta>', 'lang="utf-8"'],
          hint: 'One attribute, and like img there is no closing tag.',
          explain: 'meta is empty: everything lives in its attributes, so there is no </meta>.',
        },
        {
          kind: 'fill',
          prompt: 'Pick the element that holds the page info.',
          code: '<___>\n  <meta charset="utf-8">\n  <title>Café Olé</title>\n</head>',
          blanks: [{ answer: ['head'], options: ['head', 'body', 'header'] }],
          hint: 'Match the closing tag.',
          explain: 'meta and title live in head. header is a visible banner inside body, not the page info.',
        },
        {
          kind: 'fill',
          prompt: 'Name the meta that fits the page to phones.',
          code: '<meta name="___" content="width=device-width, initial-scale=1">',
          blanks: [{ answer: ['viewport'], options: ['viewport', 'mobile', 'screen'] }],
          hint: 'The visible area of the page is called the…',
          explain: 'Without the viewport meta, phones lay the page out for a desktop-width window and shrink it, so text comes out tiny.',
        },
        {
          kind: 'fill',
          prompt: 'Fit the phone’s width at normal zoom.',
          code: '<meta name="viewport" content="width=___, initial-scale=___">',
          blanks: [
            { answer: ['device-width'], options: ['device-width', '100%', 'auto'] },
            { answer: ['1', '1.0'], options: ['1', '2', '100%'] },
          ],
          hint: 'Width comes from the device; normal zoom is a scale of one.',
          explain: 'width takes a number of pixels or device-width, never a percentage. initial-scale=1 starts at 100% zoom.',
        },
        {
          kind: 'build',
          prompt: 'Build the viewport meta tag.',
          answer: ['<meta', 'name="viewport"', VIEWPORT, '>'],
          alt: attrOrders('<meta', ['name="viewport"', VIEWPORT], ['>']),
          distractors: ['name="mobile"', 'content="width=100%"', '</meta>'],
          hint: 'A name to say what it is, then content with the settings.',
          explain: 'This exact line belongs in every page’s head. It matches the layout to the phone’s width at normal zoom.',
        },
      ],
    },
    {
      title: 'Page descriptions',
      concept: {
        body: 'The title names the page in the browser tab, and search engines usually show it as the clickable headline, so make it specific and different on every page. <meta name="description"> holds a short summary that may appear under that headline.',
        code: '<title>Sourdough Starter Guide | Rise Bakery</title>\n<meta name="description" content="Grow a starter in 7 days with just flour and water.">',
      },
      exercises: [
        {
          kind: 'fill',
          prompt: 'Name the meta that summarises the page.',
          code: '<meta name="___" content="Hand-thrown mugs and bowls, made in Leeds.">',
          blanks: [{ answer: ['description'], options: ['description', 'keywords', 'summary'] }],
          hint: 'It describes the page.',
          explain: 'description is the summary search engines may show in results. Google ignores the keywords meta.',
        },
        {
          kind: 'fill',
          prompt: 'Pick the attribute that holds the summary text.',
          code: '<meta name="description" ___="Weekly specials, open late on Fridays.">',
          blanks: [{ answer: ['content'], options: ['content', 'value', 'text'] }],
          hint: 'Same attribute that holds the viewport settings.',
          explain: 'name says what the meta is and content holds its value. value belongs to form inputs.',
        },
        {
          kind: 'fill',
          prompt: 'Pick the best title for a product page.',
          code: '<title>___</title>',
          blanks: [
            { answer: ['Trail Shoes | Peak Gear'], options: ['Trail Shoes | Peak Gear', 'Home', 'shoes shoes cheap shoes'] },
          ],
          hint: 'Say what this page is, without stuffing words in.',
          explain: 'A good title names the page and the site. Vague titles like Home and repeated keywords help nobody.',
        },
        {
          kind: 'build',
          prompt: 'Build a description meta: Free beginner yoga, Sundays at 9.',
          answer: ['<meta', 'name="description"', 'content="Free beginner yoga, Sundays at 9."', '>'],
          alt: attrOrders('<meta', ['name="description"', 'content="Free beginner yoga, Sundays at 9."'], ['>']),
          distractors: ['name="summary"', 'value="Free beginner yoga, Sundays at 9."', '</meta>'],
          hint: 'name says which meta, content holds the text.',
          explain: 'Like every meta, it is empty and sits in the head.',
        },
        {
          kind: 'fill',
          prompt: 'Pick the description that fits this page.',
          code: '<title>How to Repot a Cactus | Prickly Plants</title>\n<meta name="description" content="___">',
          blanks: [
            {
              answer: ['Repot a cactus in 5 steps, no pricked fingers.'],
              options: ['Repot a cactus in 5 steps, no pricked fingers.', 'Prickly Plants', 'cactus, cacti, repot, soil'],
            },
          ],
          hint: 'Which one would make you click the result?',
          explain: 'A description should be a real sentence about this page. A bare site name or a keyword list tells searchers nothing.',
        },
        {
          kind: 'fill',
          prompt: 'Name the tab title element and the meta attribute.',
          code: '<head>\n  <meta charset="utf-8">\n  <___>Moon Phases Explained | Sky Notes</title>\n  <meta ___="description" content="Why the Moon changes shape every 29.5 days.">\n</head>',
          blanks: [
            { answer: ['title'], options: ['title', 'h1', 'meta'] },
            { answer: ['name'], options: ['name', 'type', 'content'] },
          ],
          hint: 'Match the closing tag, then the attribute that says which meta it is.',
          explain: 'The title closes with </title>, and name="description" marks the summary meta.',
        },
        {
          kind: 'build',
          prompt: 'Build a unique title for Juniper Café’s menu page.',
          answer: ['<title>', 'Menu | Juniper Café', '</title>'],
          distractors: ['Juniper Café', '<h1>', '</h1>'],
          hint: 'Every page of the site needs its own title.',
          explain: 'If every page were titled just Juniper Café, tabs and results would look identical. Page name, then site name, is a common pattern.',
        },
      ],
    },
    {
      title: 'Head links',
      concept: {
        body: 'link connects the page to another file. It is empty and sits in head: href is the address and rel says what it is, like stylesheet for CSS, icon for the tab icon, or canonical for the page’s preferred URL.',
        code: '<link rel="stylesheet" href="style.css">\n<link rel="icon" href="favicon.png">\n<link rel="canonical" href="https://risebakery.com/menu">',
      },
      exercises: [
        {
          kind: 'build',
          prompt: 'Link the stylesheet garden.css.',
          answer: ['<link', 'rel="stylesheet"', 'href="garden.css"', '>'],
          alt: attrOrders('<link', ['rel="stylesheet"', 'href="garden.css"'], ['>']),
          distractors: ['src="garden.css"', 'rel="style"', '</link>'],
          hint: 'rel says it is CSS, href says where it is. No closing tag.',
          explain: 'link is empty like meta. The browser downloads garden.css and applies it to the page.',
        },
        {
          kind: 'fill',
          prompt: 'Type the attribute that holds the file address.',
          code: '<link rel="stylesheet" ___="theme.css">',
          blanks: [{ answer: ['href'] }],
          hint: 'Same attribute as on an a link.',
          explain: 'link uses href, just like a. src belongs to elements such as img, audio and video.',
        },
        {
          kind: 'build',
          prompt: 'Use favicon.png as the browser tab icon.',
          answer: ['<link', 'rel="icon"', 'href="favicon.png"', '>'],
          alt: attrOrders('<link', ['rel="icon"', 'href="favicon.png"'], ['>']),
          distractors: ['<img', 'rel="favicon"', 'src="favicon.png"'],
          hint: 'A link, and the rel value is one plain word.',
          explain: 'rel="icon" sets the little picture in the tab. An img would show on the page instead.',
        },
        {
          kind: 'fix',
          prompt: 'Tap why the page loads unstyled.',
          code: '<head>\n  <meta charset="utf-8">\n  <link rel="[[style]]" href="main.css">\n</head>',
          fix: 'stylesheet',
          options: ['stylesheet', 'css', 'icon'],
          hint: 'The rel value is one long word.',
          explain: 'Browsers only apply CSS from rel="stylesheet". Unknown rel values like style are ignored.',
        },
        {
          kind: 'order',
          prompt: 'Order the head so theme.css overrides base.css.',
          lines: [
            '<head>',
            '  <meta charset="utf-8">',
            '  <link rel="stylesheet" href="base.css">',
            '  <link rel="stylesheet" href="theme.css">',
            '</head>',
          ],
          hint: 'Charset first. When two files clash, which one wins?',
          explain: 'When two stylesheets set the same rule, the one linked later wins, so the base styles go first.',
        },
        {
          kind: 'build',
          prompt: 'Name https://hikeclub.org/trails as this page’s preferred URL.',
          answer: ['<link', 'rel="canonical"', 'href="https://hikeclub.org/trails"', '>'],
          alt: attrOrders('<link', ['rel="canonical"', 'href="https://hikeclub.org/trails"'], ['>']),
          distractors: ['rel="main"', 'href="trails?sort=new"', '</link>'],
          hint: 'The rel value means the official version.',
          explain: 'When the same page has several addresses, canonical tells search engines which one to list. Use the full https:// URL.',
        },
        {
          kind: 'fill',
          prompt: 'Type the rel value that names the preferred URL.',
          code: '<!-- Same page as /shoes?color=red -->\n<link rel="___" href="https://peakgear.com/shoes">',
          blanks: [{ answer: ['canonical'] }],
          hint: 'The rel from the concept card that picks the main URL.',
          explain: 'Tracking and filter parameters create duplicate URLs. canonical points search engines at the main one.',
        },
      ],
    },
    {
      title: 'Social previews',
      concept: {
        body: 'When a link is shared in a chat or social app, the preview card comes from Open Graph meta tags. They use property (not name) for the og: key and content for the value. Give og:image and og:url full https:// addresses.',
        code: '<meta property="og:title" content="Lemon Tart Recipe">\n<meta property="og:description" content="Zesty, buttery, ready in an hour.">\n<meta property="og:image" content="https://tartlab.com/lemon.jpg">\n<meta property="og:url" content="https://tartlab.com/lemon-tart">',
      },
      exercises: [
        {
          kind: 'build',
          prompt: 'Set the card title to Street Food Guide.',
          answer: ['<meta', 'property="og:title"', 'content="Street Food Guide"', '>'],
          alt: attrOrders('<meta', ['property="og:title"', 'content="Street Food Guide"'], ['>']),
          distractors: ['name="og:title"', 'value="Street Food Guide"'],
          hint: 'Open Graph keys go in property, text goes in content.',
          explain: 'Open Graph defines its tags with property. name is for standard metas like description and viewport.',
        },
        {
          kind: 'fill',
          prompt: 'Type the attribute Open Graph tags use for the key.',
          code: '<meta ___="og:description" content="Five easy hikes near Oslo.">',
          blanks: [{ answer: ['property'] }],
          hint: 'Not name: the Open Graph one.',
          explain: 'Every og: tag pairs property with content.',
        },
        {
          kind: 'build',
          prompt: 'Set the card image to https://citybites.com/img/bao.jpg.',
          answer: ['<meta', 'property="og:image"', 'content="https://citybites.com/img/bao.jpg"', '>'],
          alt: attrOrders('<meta', ['property="og:image"', 'content="https://citybites.com/img/bao.jpg"'], ['>']),
          distractors: ['property="og:img"', 'src="https://citybites.com/img/bao.jpg"'],
          hint: 'The key spells the word out in full, and meta has no src.',
          explain: 'og:image is the picture on the card. The app fetches it from another site, so the full URL matters.',
        },
        {
          kind: 'order',
          prompt: 'Put the card tag in the head, after the charset.',
          lines: [
            '<head>',
            '  <meta charset="utf-8">',
            '  <meta property="og:title" content="Street Food Guide">',
            '</head>',
            '<body>',
            '  <h1>Street Food Guide</h1>',
            '</body>',
          ],
          hint: 'Page info before visible content, and the charset leads.',
          explain: 'Open Graph tags are page info, so they go in head with the other metas, after the charset.',
          preview: {},
        },
        {
          kind: 'fix',
          prompt: 'Tap the attribute that should hold the URL.',
          code: '<meta property="og:url" [[href]]="https://citybites.com/street-food">',
          fix: 'content',
          options: ['content', 'src', 'rel'],
          hint: 'link uses href, but this is a meta.',
          explain: 'Every meta stores its value in content, even when the value is a URL.',
        },
        {
          kind: 'build',
          prompt: 'Set the card’s address to https://citybites.com/street-food.',
          answer: ['<meta', 'property="og:url"', 'content="https://citybites.com/street-food"', '>'],
          alt: attrOrders('<meta', ['property="og:url"', 'content="https://citybites.com/street-food"'], ['>']),
          distractors: ['property="og:link"', 'href="https://citybites.com/street-food"'],
          hint: 'The key is og: plus the three-letter word for an address.',
          explain: 'og:url is the page’s canonical address, so shares of tracked or duplicate links all point to one place.',
        },
        {
          kind: 'fill',
          prompt: 'Type the og: keys for the card’s headline and blurb.',
          code: '<meta property="og:___" content="Ramen Week">\n<meta property="og:___" content="Eight bowls under $12, ranked.">',
          blanks: [{ answer: ['title'] }, { answer: ['description'] }],
          hint: 'The same words as the title element and the description meta.',
          explain: 'og:title and og:description fill the card’s headline and the line of text under it.',
        },
      ],
    },
    {
      title: 'Robots rules',
      concept: {
        body: '<meta name="robots"> gives search engines rules: noindex keeps the page out of results and nofollow says not to follow its links. On a single link, rel explains it: sponsored for paid links, ugc for user posts like comments, nofollow for anything else you don’t vouch for.',
        code: '<meta name="robots" content="noindex, nofollow">\n<a href="https://gearhub.com" rel="sponsored">Our sponsor</a>\n<a href="https://kimcooks.net" rel="ugc">Kim’s blog</a>',
      },
      exercises: [
        {
          kind: 'fill',
          prompt: 'Type the name of the meta search crawlers obey.',
          code: '<meta name="___" content="noindex">',
          blanks: [{ answer: ['robots'] }],
          hint: 'Crawlers are automated bots, also called…',
          explain: 'name="robots" speaks to every search crawler. Its content lists the rules.',
        },
        {
          kind: 'fill',
          prompt: 'Keep this thank-you page out of search results.',
          code: '<meta name="robots" content="___">',
          blanks: [{ answer: ['noindex'], options: ['noindex', 'nofollow', 'index'] }],
          hint: 'Search results come from the search index.',
          explain: 'noindex keeps the page out of results. nofollow only affects the links on it.',
        },
        {
          kind: 'build',
          prompt: 'Mark the affiliate link to Bean Box as paid.',
          answer: ['<a', 'href="https://beanbox.com"', 'rel="sponsored"', '>', 'Bean Box', '</a>'],
          alt: attrOrders('<a', ['href="https://beanbox.com"', 'rel="sponsored"'], ['>', 'Bean Box', '</a>']),
          distractors: ['rel="ugc"', 'rel="paid"'],
          hint: 'Ads and affiliate links are paid for, or…',
          explain: 'rel="sponsored" tells search engines the link is an ad or paid placement, not a free recommendation.',
          preview: {},
        },
        {
          kind: 'fill',
          prompt: 'List the page in search, but don’t follow its links.',
          code: '<meta name="robots" content="___">',
          blanks: [{ answer: ['nofollow'], options: ['nofollow', 'noindex', 'none'] }],
          hint: 'Only the links are affected.',
          explain: 'nofollow leaves the page indexable. none means noindex, nofollow, so it would hide the page too.',
        },
        {
          kind: 'fix',
          prompt: 'Tap the wrong rel on this reader’s comment link.',
          code: '<p class="comment">\n  Great tips! More on <a href="https://kimcooks.net" rel="[[sponsored]]">my blog</a>\n</p>',
          fix: 'ugc',
          options: ['ugc', 'noindex', 'comment'],
          hint: 'Nobody paid for this link; a visitor posted it.',
          explain: 'ugc stands for user-generated content: comments and forum posts. noindex is a robots meta rule, not a rel value.',
          preview: {},
        },
        {
          kind: 'type',
          prompt: 'Type a robots meta that only blocks indexing.',
          template: '<head>\n  <meta charset="utf-8">\n  ___\n</head>',
          accept: voidTag('meta', [
            ['name="robots"', 'name=robots'],
            ['content="noindex"', 'content=noindex', 'content="noindex, follow"', 'content="noindex,follow"'],
          ]),
          hint: 'name says who it is for, content holds the one rule.',
          explain: 'noindex alone hides the page from results while its links can still be followed.',
        },
        {
          kind: 'fix',
          prompt: 'This order page shows up in search. Tap the wrong rule.',
          code: '<head>\n  <meta charset="utf-8">\n  <title>Order confirmed | Bean Box</title>\n  <meta name="robots" content="[[nofollow]]">\n</head>',
          fix: 'noindex',
          options: ['noindex', 'index', 'follow'],
          hint: 'The page itself must leave the results, not just its links.',
          explain: 'nofollow only covers links. noindex is what keeps a private page like an order confirmation out of results.',
        },
      ],
    },
  ],
  boss: [
    {
      kind: 'order',
      prompt: 'Order the head: charset, viewport, title, description, then CSS.',
      lines: [
        '<head>',
        '  <meta charset="utf-8">',
        `  <meta name="viewport" ${VIEWPORT}>`,
        '  <title>Tide Times | Surf Log</title>',
        '  <meta name="description" content="Live tide times for 40 UK beaches.">',
        '  <link rel="stylesheet" href="surf.css">',
        '</head>',
      ],
      hint: 'Follow the prompt, and nothing goes before the charset.',
      explain: 'The charset goes first so the browser knows the encoding before it reads any text. The rest is page info inside head.',
    },
    {
      kind: 'fix',
      prompt: 'Tap the attribute Open Graph does not use.',
      code: '<meta name="description" content="Trail runs every Saturday.">\n<meta [[name]]="og:description" content="Trail runs every Saturday.">',
      fix: 'property',
      options: ['property', 'content', 'rel'],
      hint: 'One line is a standard meta, the other is Open Graph.',
      explain: 'The description meta uses name, but og: tags use property.',
    },
    {
      kind: 'fill',
      prompt: 'Complete the viewport settings.',
      code: '<meta name="viewport" content="___=device-width, initial-scale=___">',
      blanks: [{ answer: ['width'] }, { answer: ['1', '1.0'] }],
      hint: 'Which side of the screen does device-width set? Normal zoom is a scale of one.',
      explain: 'width=device-width uses the phone’s real width, and initial-scale=1 starts at normal zoom.',
    },
    {
      kind: 'fill',
      prompt: 'Pick rel for the paid link and the reader’s link.',
      code: '<p>Sponsored by <a href="https://gearhub.com" rel="___">GearHub</a></p>\n<p class="comment">Ali: see <a href="https://alirides.net" rel="___">my blog</a></p>',
      blanks: [
        { answer: ['sponsored'], options: ['sponsored', 'ugc', 'canonical'] },
        { answer: ['ugc'], options: ['ugc', 'sponsored', 'canonical'] },
      ],
      hint: 'One was paid for, one was posted by a visitor.',
      explain: 'sponsored marks paid links and ugc marks links from users. canonical belongs on a head link, not on a.',
      preview: {},
    },
    {
      kind: 'type',
      prompt: 'Type the line that sets the character encoding.',
      template: '<head>\n  ___\n  <title>Crêpe Corner</title>\n</head>',
      accept: voidTag('meta', [['charset="utf-8"', 'charset=utf-8']]),
      hint: 'An empty meta with one attribute, and it comes first.',
      explain: 'It goes before the title, so the ê in Crêpe is read correctly.',
    },
    {
      kind: 'type',
      prompt: 'Type the attribute that makes this a search summary.',
      template: '<head>\n  <title>Quick Vegan Dinners | Green Fork</title>\n  <meta ___ content="Vegan dinners in 15 minutes, no oven needed.">\n</head>',
      accept: ['name="description"', 'name=description'],
      hint: 'Standard metas say which one they are with name.',
      explain: 'name="description" turns the content into the snippet search engines may show.',
    },
    {
      kind: 'build',
      prompt: 'Set the share card image to https://surflog.uk/wave.jpg.',
      answer: ['<meta', 'property="og:image"', 'content="https://surflog.uk/wave.jpg"', '>'],
      alt: attrOrders('<meta', ['property="og:image"', 'content="https://surflog.uk/wave.jpg"'], ['>']),
      distractors: ['name="og:image"', 'src="https://surflog.uk/wave.jpg"', '</meta>'],
      hint: 'Open Graph key in property, URL in content, no closing tag.',
      explain: 'og:image needs property and content like every og: tag, and meta never closes.',
    },
    {
      kind: 'fix',
      prompt: 'Tap why the page has no styling.',
      code: '<head>\n  <meta charset="utf-8">\n  <title>Pixel Quest</title>\n  <link rel="[[icon]]" href="pixel.css">\n</head>',
      fix: 'stylesheet',
      options: ['stylesheet', 'canonical', 'style'],
      hint: 'The file is CSS. What does rel say it is?',
      explain: 'With rel="icon" the browser treats pixel.css as a tab icon. Only rel="stylesheet" applies CSS.',
    },
    {
      kind: 'fix',
      prompt: 'Tap why phones get a layout wider than the screen.',
      code: '<meta name="viewport" content="width=[[980]], initial-scale=1">',
      fix: 'device-width',
      options: ['device-width', '100%', 'auto'],
      hint: 'A fixed number of pixels is too wide for a phone.',
      explain: 'width=980 forces a 980-pixel layout on every screen. device-width matches whatever screen the page is on.',
    },
    {
      kind: 'build',
      prompt: 'Hide this staff page from search and its links from crawlers.',
      answer: ['<meta', 'name="robots"', 'content="noindex, nofollow"', '>'],
      alt: attrOrders('<meta', ['name="robots"', 'content="noindex, nofollow"'], ['>']),
      distractors: ['content="nofollow"', 'property="robots"', 'rel="nofollow"'],
      hint: 'Two rules in one content, separated by a comma.',
      explain: 'noindex hides the page and nofollow covers its links. robots is a standard meta, so it uses name.',
    },
  ],
};

export default unit;
