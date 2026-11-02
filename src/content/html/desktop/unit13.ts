import type { DesktopUnit } from '../../../engine/types';

// Desktop edition: write-the-code challenges for HTML unit 13 (Structured data).
// lessons[i] runs after lesson i + 1. See docs/CONTENT_GUIDE.md.
const unit: DesktopUnit = {
  lessons: [
    // L1 Data attributes
    [
      {
        kind: 'write',
        prompt: 'List three board games, storing player count and play time in data attributes.',
        starter: '',
        solution:
          '<ul>\n  <li data-players="2-5" data-minutes="45">Ticket to Ride</li>\n  <li data-players="2" data-minutes="30">Patchwork</li>\n  <li data-players="3-4" data-minutes="90">Catan</li>\n</ul>',
        checks: [
          { label: 'A <ul> list', re: '<ul>[\\s\\S]*</ul>', flags: 'i' },
          { label: 'Three <li>s, each with a data- attribute', re: '(<li[^>]*\\sdata-[a-z][a-z0-9-]*="[^"]*"[^>]*>[^<]*\\S[\\s\\S]*?){3}', flags: 'i' },
          { label: 'Two data- values on one game', re: '<li[^>]*\\sdata-[a-z0-9-]+="[^"]*"[^>]*\\sdata-[a-z0-9-]+="', flags: 'i' },
          { label: 'data- names in lowercase', re: '^(?![\\s\\S]*\\sdata-[\\w-]*[A-Z])[\\s\\S]*\\sdata-' },
        ],
        hint: 'Invent names like data-players and data-minutes, lowercase with hyphens, and put them on each <li>.',
        explain: 'data- attributes hold extra facts without changing what the element means. Script can read them later with el.dataset.',
        preview: {},
      },
      {
        kind: 'write',
        prompt: 'Tag each item’s stock level and highlight the low ones with CSS.',
        starter:
          '<style>\n  /* highlight items whose stock is low */\n</style>\n<ul>\n  <li>Oat milk</li>\n  <li>Coffee beans</li>\n  <li>Croissants</li>\n</ul>',
        solution:
          '<style>\n  [data-stock="low"] { background: #fde68a; }\n</style>\n<ul>\n  <li data-stock="ok">Oat milk</li>\n  <li data-stock="low">Coffee beans</li>\n  <li data-stock="low">Croissants</li>\n</ul>',
        checks: [
          { label: 'Every item has data-stock', re: '(<li[^>]*\\sdata-stock="[\\w-]+"[\\s\\S]*?){3}', flags: 'i' },
          { label: 'At least one is data-stock="low"', re: '<li[^>]*\\sdata-stock="low"', flags: 'i' },
          { label: 'A CSS rule selecting [data-stock="low"]', re: '\\[\\s*data-stock\\s*=\\s*["\']?low["\']?\\s*\\]\\s*\\{[^}]*[\\w-]+\\s*:', flags: 'i' },
        ],
        hint: 'Add data-stock="low" or "ok" to each <li>, then style [data-stock="low"] in the style block.',
        explain: 'An attribute selector matches the data value, so changing the data changes the look with no extra classes.',
        preview: {},
      },
    ],
    // L2 Data & time values
    [
      {
        kind: 'write',
        prompt: 'List a gig: door time, set length and ticket price, each machine-readable.',
        starter: '',
        solution:
          '<h2>Static Pines live</h2>\n<p>Doors: <time datetime="2026-12-12T19:00">Sat 12 Dec, 7 pm</time></p>\n<p>Set: <time datetime="PT2H">two hours</time></p>\n<p>Ticket: <data value="25">twenty-five dollars</data></p>',
        checks: [
          {
            label: 'A <time> with a date and time like 2026-12-12T19:00',
            re: '<time[^>]*\\sdatetime="\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}(:\\d{2})?"[^>]*>[^<]*\\S[^<]*</time>',
            flags: 'i',
          },
          { label: 'A <time> with a duration like PT2H', re: '<time[^>]*\\sdatetime="P(\\d+[DW]|T\\d+[HMS])[^"]*"[^>]*>[^<]*\\S[^<]*</time>', flags: 'i' },
          { label: 'A <data value> for the price', re: '<data[^>]*\\svalue="[^"]+"[^>]*>[^<]*\\S[^<]*</data>', flags: 'i' },
        ],
        hint: 'Readers see the words between the tags; machines read datetime and value. Durations start with P, times with PT.',
        explain: 'time and data let you write friendly text for people while keeping an exact value for search engines and scripts.',
        preview: {},
      },
      {
        kind: 'write',
        prompt: 'Fix the machine values: an ISO date-time, an ISO duration and the product code.',
        starter:
          '<p>Sale ends <time datetime="25/12/2026 9pm">Christmas night</time>.</p>\n<p>Cook time: <time datetime="45 minutes">45 min</time></p>\n<p><data>Cast-iron pan</data> (code SKU-7781)</p>',
        solution:
          '<p>Sale ends <time datetime="2026-12-25T21:00">Christmas night</time>.</p>\n<p>Cook time: <time datetime="PT45M">45 min</time></p>\n<p><data value="SKU-7781">Cast-iron pan</data> (code SKU-7781)</p>',
        checks: [
          { label: 'Sale end as 2026-12-25T21:00', re: '<time[^>]*\\sdatetime="2026-12-25T21:00(:00)?"', flags: 'i' },
          { label: 'Cook time as PT45M', re: '<time[^>]*\\sdatetime="PT45M"', flags: 'i' },
          { label: 'The pan’s <data> gets value="SKU-7781"', re: '<data[^>]*\\svalue="SKU-7781"[^>]*>\\s*Cast-iron pan', flags: 'i' },
          { label: 'No day/month/year date left', not: '25/12' },
        ],
        hint: 'Dates go year-month-day with T before a 24-hour time. 45 minutes is P, then T, then 45M.',
        explain: 'Machines need one exact format: ISO 8601. The visible text can stay as friendly as you like.',
        preview: {},
      },
    ],
    // L3 Microdata basics
    [
      {
        kind: 'write',
        prompt: 'Mark up a restaurant card with microdata: name, cuisine and phone.',
        starter: '',
        solution:
          '<div itemscope itemtype="https://schema.org/Restaurant">\n  <h2 itemprop="name">Little Saigon</h2>\n  <p itemprop="servesCuisine">Vietnamese</p>\n  <p>Call <span itemprop="telephone">555-0142</span></p>\n</div>',
        checks: [
          {
            label: 'A wrapper with itemscope and itemtype Restaurant',
            re: '<\\w+(?=[^>]*\\sitemscope\\b)(?=[^>]*\\sitemtype="https?://schema\\.org/Restaurant")',
            flags: 'i',
          },
          { label: 'itemprop="name" on the name', re: '<\\w+[^>]*\\sitemprop="name"[^>]*>\\s*\\S', flags: 'i' },
          { label: 'itemprop="servesCuisine" on the cuisine', re: '<\\w+[^>]*\\sitemprop="servesCuisine"[^>]*>\\s*\\S', flags: 'i' },
          { label: 'itemprop="telephone" on the number', re: '<\\w+[^>]*\\sitemprop="telephone"[^>]*>\\s*\\S', flags: 'i' },
          { label: 'The properties sit inside the item', re: '\\sitemscope\\b[\\s\\S]*\\sitemprop="', flags: 'i' },
        ],
        hint: 'itemscope and itemtype="https://schema.org/Restaurant" go on the wrapper; itemprop goes on each piece.',
        explain: 'The card looks the same, but search engines can now read it as a Restaurant with a name, cuisine and phone.',
        preview: {},
      },
      {
        kind: 'write',
        prompt: 'Add microdata so search engines read this profile as a Person.',
        starter:
          '<article>\n  <h2>Omar Haddad</h2>\n  <p>Bike mechanic at Spoke and Chain</p>\n  <a href="mailto:omar@spoke.example">omar@spoke.example</a>\n</article>',
        solution:
          '<article itemscope itemtype="https://schema.org/Person">\n  <h2 itemprop="name">Omar Haddad</h2>\n  <p><span itemprop="jobTitle">Bike mechanic</span> at Spoke and Chain</p>\n  <a itemprop="email" href="mailto:omar@spoke.example">omar@spoke.example</a>\n</article>',
        checks: [
          {
            label: 'The article is a Person item',
            re: '<article(?=[^>]*\\sitemscope\\b)(?=[^>]*\\sitemtype="https?://schema\\.org/Person")',
            flags: 'i',
          },
          { label: 'The h2 is the name', re: '<h2[^>]*\\sitemprop="name"', flags: 'i' },
          { label: 'Mark the job with itemprop="jobTitle"', re: '\\sitemprop="jobTitle"[^>]*>\\s*Bike mechanic', flags: 'i' },
          { label: 'Mark the link with itemprop="email"', re: '<a[^>]*\\sitemprop="email"', flags: 'i' },
        ],
        hint: 'Wrap just “Bike mechanic” in a span so the job title doesn’t include the shop name.',
        explain: 'itemprop can sit on any element. On a link, the property’s value is its href rather than its text.',
        preview: {},
      },
    ],
    // L4 Nested & hidden values
    [
      {
        kind: 'write',
        prompt: 'Mark up a book: a nested Person as author, and a hidden ISBN.',
        starter: '',
        solution:
          '<div itemscope itemtype="https://schema.org/Book">\n  <h2 itemprop="name">The Salt Road</h2>\n  <p>By <span itemprop="author" itemscope itemtype="https://schema.org/Person"><span itemprop="name">Lena Ortiz</span></span></p>\n  <meta itemprop="isbn" content="9781234567897">\n</div>',
        checks: [
          { label: 'A Book item with a name', re: '\\sitemtype="https?://schema\\.org/Book"[\\s\\S]*\\sitemprop="name"', flags: 'i' },
          {
            label: 'itemprop="author" that is itself a Person item',
            re: '<\\w+(?=[^>]*\\sitemprop="author")(?=[^>]*\\sitemscope\\b)(?=[^>]*\\sitemtype="https?://schema\\.org/Person")',
            flags: 'i',
          },
          { label: 'The author’s name inside it', re: '\\sitemprop="author"[^>]*>[\\s\\S]*?\\sitemprop="name"[^>]*>\\s*\\S', flags: 'i' },
          { label: 'A <meta> with itemprop="isbn" and content', re: '<meta(?=[^>]*\\sitemprop="isbn")(?=[^>]*\\scontent="[\\d-]+")', flags: 'i' },
        ],
        hint: 'Put itemprop="author" itemscope itemtype=".../Person" on one element, with the name inside it.',
        explain: 'A property can hold a whole item, so the author has its own type and name. meta carries the ISBN without showing it.',
        preview: {},
      },
      {
        kind: 'write',
        prompt: 'Finish the event: a startDate, a nested Place and a hidden eventStatus.',
        starter:
          '<div itemscope itemtype="https://schema.org/Event">\n  <h2 itemprop="name">Night Swim</h2>\n  <p>Starts <time datetime="2026-07-18T21:00">Sat 9 pm</time></p>\n  <p>At <span>Lido Pool</span></p>\n</div>',
        solution:
          '<div itemscope itemtype="https://schema.org/Event">\n  <h2 itemprop="name">Night Swim</h2>\n  <p>Starts <time itemprop="startDate" datetime="2026-07-18T21:00">Sat 9 pm</time></p>\n  <p>At <span itemprop="location" itemscope itemtype="https://schema.org/Place"><span itemprop="name">Lido Pool</span></span></p>\n  <link itemprop="eventStatus" href="https://schema.org/EventScheduled">\n</div>',
        checks: [
          { label: 'itemprop="startDate" on the time', re: '<time(?=[^>]*\\sitemprop="startDate")(?=[^>]*\\sdatetime="[^"]+")', flags: 'i' },
          {
            label: 'itemprop="location" as a Place item',
            re: '<\\w+(?=[^>]*\\sitemprop="location")(?=[^>]*\\sitemscope\\b)(?=[^>]*\\sitemtype="https?://schema\\.org/Place")',
            flags: 'i',
          },
          { label: 'The place’s name: Lido Pool', re: '\\sitemprop="location"[^>]*>[\\s\\S]*?\\sitemprop="name"[^>]*>\\s*Lido Pool', flags: 'i' },
          {
            label: 'A <link> for eventStatus EventScheduled',
            re: '<link(?=[^>]*\\sitemprop="eventStatus")(?=[^>]*\\shref="https?://schema\\.org/EventScheduled")',
            flags: 'i',
          },
        ],
        hint: 'time hands its datetime to itemprop. For a value that is a URL, use <link itemprop href>.',
        explain: 'The location is an item of its own, and link holds a schema.org URL without showing anything on the page.',
        preview: {},
      },
    ],
    // L5 JSON-LD
    [
      {
        kind: 'write',
        prompt: 'Describe a bakery in JSON-LD: type, name, phone and opening hours.',
        starter: '',
        solution:
          '<script type="application/ld+json">\n{\n  "@context": "https://schema.org",\n  "@type": "Bakery",\n  "name": "Rise and Shine",\n  "telephone": "+1-555-0199",\n  "openingHours": "Mo-Sa 07:00-15:00"\n}\n</script>',
        checks: [
          { label: 'A <script type="application/ld+json">', re: '<script[^>]*\\stype="application/ld\\+json"[^>]*>[\\s\\S]*</script>', flags: 'i' },
          { label: '"@context": "https://schema.org"', re: '"@context"\\s*:\\s*"https://schema\\.org/?"' },
          { label: '"@type": "Bakery"', re: '"@type"\\s*:\\s*"Bakery"' },
          { label: 'A "name", "telephone" and "openingHours"', re: '^(?=[\\s\\S]*"name"\\s*:\\s*"[^"]+")(?=[\\s\\S]*"telephone"\\s*:\\s*"[^"]+")(?=[\\s\\S]*"openingHours"\\s*:\\s*"[^"]+")' },
          { label: 'No trailing comma before }', re: '^(?![\\s\\S]*,\\s*\\})' },
        ],
        hint: 'One JSON object in the script: every key and string in double quotes, commas between pairs, none after the last.',
        explain: 'JSON-LD describes the business without touching the markup. One stray comma makes the whole block unreadable.',
        preview: {},
      },
      {
        kind: 'write',
        prompt: 'Fix the JSON-LD so it parses, then add a director as a Person.',
        starter:
          '<script type="application/ld+json">\n{\n  \'@context\': \'https://schema.org\',\n  "@type": "Movie"\n  "name": "Paper Moons",\n  "dateCreated": "2025-03-14",\n}\n</script>',
        solution:
          '<script type="application/ld+json">\n{\n  "@context": "https://schema.org",\n  "@type": "Movie",\n  "name": "Paper Moons",\n  "dateCreated": "2025-03-14",\n  "director": { "@type": "Person", "name": "Ana Ruiz" }\n}\n</script>',
        checks: [
          { label: 'Double quotes on every key and string', re: '^(?![\\s\\S]*(\'\\s*:|:\\s*\'))[\\s\\S]*"@context"\\s*:\\s*"https://schema\\.org/?"' },
          { label: 'A comma after "Movie"', re: '"@type"\\s*:\\s*"Movie"\\s*,' },
          { label: 'No trailing comma before }', re: '^(?![\\s\\S]*,\\s*\\})' },
          {
            label: '"director" is an object with "@type": "Person" and a name',
            re: '"director"\\s*:\\s*\\{(?=[^}]*"@type"\\s*:\\s*"Person")(?=[^}]*"name"\\s*:\\s*"[^"]+")',
          },
        ],
        hint: 'JSON wants double quotes only, a comma between every pair, and none after the last one.',
        explain: 'A nested object gives the director its own type, just like a nested itemscope in microdata.',
        preview: {},
      },
    ],
  ],
};

export default unit;
