import type { DesktopUnit } from '../../../engine/types';

// Desktop edition: write-the-code challenges for HTML unit 6 (Semantic layout).
// lessons[i] runs after lesson i + 1. See docs/CONTENT_GUIDE.md.
const unit: DesktopUnit = {
  lessons: [
    // L1 Header, nav & footer
    [
      {
        kind: 'write',
        prompt: 'Write a yoga studio’s header with a menu, and a footer.',
        starter: '',
        solution:
          '<header>\n  <h1>Lotus Yoga</h1>\n  <nav>\n    <a href="/">Home</a>\n    <a href="classes.html">Classes</a>\n    <a href="prices.html">Prices</a>\n  </nav>\n</header>\n<footer>\n  <p>12 Elm Street. Call 555 0142.</p>\n</footer>',
        checks: [
          { label: 'A <header> with the site name in a heading', re: '<header>\\s*<h1>[^<]*\\S[^<]*</h1>[\\s\\S]*</header>', flags: 'i' },
          { label: 'A <nav> inside the header', re: '<header>[\\s\\S]*<nav>[\\s\\S]*</nav>[\\s\\S]*</header>', flags: 'i' },
          { label: 'At least two links in the nav', re: '<nav>(?:(?!</nav>)[\\s\\S])*(<a[^>]*\\shref=[\\s\\S]*?</a>(?:(?!</nav>)[\\s\\S])*){2}</nav>', flags: 'i' },
          { label: 'A <footer> with some text', re: '</header>[\\s\\S]*<footer>[\\s\\S]*\\w[\\s\\S]*</footer>', flags: 'i' },
        ],
        hint: 'header holds the name and the nav; footer goes at the bottom.',
        explain: 'These elements tell browsers and screen readers which part is the top, the menu and the bottom of the page.',
        preview: { css: 'nav a{margin-right:10px}footer{border-top:1px solid #ccc;margin-top:12px}' },
      },
      {
        kind: 'write',
        prompt: 'Replace the generic divs with header, nav and footer.',
        starter:
          '<div class="top">\n  <h1>Moss Books</h1>\n  <div class="menu">\n    <a href="/">Home</a>\n    <a href="events.html">Events</a>\n  </div>\n</div>\n<p>New this week: three cosy mysteries.</p>\n<div class="bottom">© 2026 Moss Books</div>',
        solution:
          '<header>\n  <h1>Moss Books</h1>\n  <nav>\n    <a href="/">Home</a>\n    <a href="events.html">Events</a>\n  </nav>\n</header>\n<p>New this week: three cosy mysteries.</p>\n<footer>© 2026 Moss Books</footer>',
        checks: [
          { label: 'A <header> around the h1 and menu', re: '<header[^>]*>\\s*<h1>\\s*Moss Books\\s*</h1>[\\s\\S]*</header>', flags: 'i' },
          { label: 'The links in a <nav> inside the header', re: '<nav[^>]*>\\s*<a[\\s\\S]*Events\\s*</a>\\s*</nav>\\s*</header>', flags: 'i' },
          { label: 'The © line in a <footer>', re: '<footer[^>]*>\\s*©[\\s\\S]*?</footer>', flags: 'i' },
          { label: 'No divs left', not: '<div' },
        ],
        hint: 'Swap each div for the element that says what it is, and close it with the matching tag.',
        explain: 'A div says nothing about its content. header, nav and footer give the same boxes real meaning.',
        preview: {},
      },
    ],
    // L2 Main & sections
    [
      {
        kind: 'write',
        prompt: 'Write a dentist page’s main content with two titled sections.',
        starter: '',
        solution:
          '<main>\n  <section>\n    <h2>Treatments</h2>\n    <p>Check-ups, fillings and whitening.</p>\n  </section>\n  <section>\n    <h2>Opening hours</h2>\n    <p>Mon to Fri, 9 to 5.</p>\n  </section>\n</main>',
        checks: [
          { label: 'A <main> wraps the content', re: '^\\s*<main>[\\s\\S]*</main>\\s*$', flags: 'i' },
          {
            label: 'Two <section> elements, each opening with an <h2>',
            re: '(<section[^>]*>\\s*<h2>[^<]*\\S[^<]*</h2>[\\s\\S]*?</section>[\\s\\S]*){2}',
            flags: 'i',
          },
          { label: 'Some text in each section', re: '(</h2>\\s*<p>[^<]*\\S[\\s\\S]*?</section>[\\s\\S]*){2}', flags: 'i' },
        ],
        hint: 'One main, and inside it a section per topic, each with its own h2.',
        explain: 'main marks the page’s core content; sections split it into themes that each need a heading.',
        preview: {},
      },
      {
        kind: 'write',
        prompt: 'Fix the gym page: one main, and every section gets a heading.',
        starter:
          '<header><h1>Fox Gym</h1></header>\n<main>\n  <section>\n    <h2>Classes</h2>\n    <p>Spin, boxing, yoga.</p>\n  </section>\n</main>\n<main>\n  <section>\n    <p>Monthly: $30.</p>\n  </section>\n</main>\n<footer>Open 6 to 10</footer>',
        solution:
          '<header><h1>Fox Gym</h1></header>\n<main>\n  <section>\n    <h2>Classes</h2>\n    <p>Spin, boxing, yoga.</p>\n  </section>\n  <section>\n    <h2>Prices</h2>\n    <p>Monthly: $30.</p>\n  </section>\n</main>\n<footer>Open 6 to 10</footer>',
        checks: [
          { label: 'Only one <main>', re: '^(?![\\s\\S]*<main[\\s\\S]*<main)[\\s\\S]*<main>', flags: 'i' },
          { label: 'Both sections inside it', re: '<main>(\\s*<section>[\\s\\S]*?</section>){2}\\s*</main>', flags: 'i' },
          { label: 'The price section has an <h2>', re: '<section>\\s*<h2>[^<]*\\S[^<]*</h2>\\s*<p>\\s*Monthly', flags: 'i' },
          { label: 'Header and footer stay outside main', re: '</header>\\s*<main>[\\s\\S]*</main>\\s*<footer>', flags: 'i' },
        ],
        hint: 'Merge the two mains into one. Give the second section a heading like Prices.',
        explain: 'A page has only one visible main. A section without a heading is just a div in disguise.',
        preview: {},
      },
    ],
    // L3 Articles & asides
    [
      {
        kind: 'write',
        prompt: 'Write two recipe cards as articles, plus a side tip in an aside.',
        starter: '',
        solution:
          '<article>\n  <h2>Tomato soup</h2>\n  <p>Ready in 30 minutes.</p>\n</article>\n<article>\n  <h2>Banana bread</h2>\n  <p>Uses up old bananas.</p>\n</article>\n<aside>\n  <p>Tip: freeze soup in portions.</p>\n</aside>',
        checks: [
          {
            label: 'Two <article> cards, each with a heading',
            re: '(<article[^>]*>\\s*<h[2-4]>[^<]*\\S[^<]*</h[2-4]>[\\s\\S]*?</article>[\\s\\S]*){2}',
            flags: 'i',
          },
          { label: 'An <aside> with the tip', re: '<aside[^>]*>[\\s\\S]*\\w[\\s\\S]*</aside>', flags: 'i' },
          { label: 'The aside sits outside the articles', re: '</article>\\s*<aside', flags: 'i' },
        ],
        hint: 'Each card makes sense alone, so each is an article. The tip is side content.',
        explain: 'article is self-contained and could be shared on its own; aside holds extra, related content.',
        preview: { css: 'article{border:1px solid #ccc;padding:6px;margin:6px 0}aside{background:#eef;padding:6px}' },
      },
      {
        kind: 'write',
        prompt: 'Make the review an article, the tip an aside, and add a reader comment.',
        starter:
          '<main>\n  <div>\n    <h2>Review: Trail Shoes X2</h2>\n    <p>Grippy and light.</p>\n  </div>\n  <div>Tip: size up half a number.</div>\n</main>',
        solution:
          '<main>\n  <article>\n    <h2>Review: Trail Shoes X2</h2>\n    <p>Grippy and light.</p>\n    <article>\n      <h3>Comment from Sam</h3>\n      <p>Mine lasted 800 km!</p>\n    </article>\n  </article>\n  <aside>Tip: size up half a number.</aside>\n</main>',
        checks: [
          { label: 'The review is an <article>', re: '<article[^>]*>\\s*<h2>\\s*Review: Trail Shoes X2\\s*</h2>', flags: 'i' },
          { label: 'The tip is an <aside>', re: '<aside[^>]*>[\\s\\S]*Tip: size up half a number\\.[\\s\\S]*</aside>', flags: 'i' },
          { label: 'A second <article> for the comment', re: '(<article[\\s\\S]*){2}', flags: 'i' },
          { label: 'The comment has a heading and text', re: '<article[^>]*>\\s*<h[2-4]>(?!\\s*Review)[^<]*\\S[^<]*</h[2-4]>\\s*<p>[^<]*\\S', flags: 'i' },
          { label: 'No divs left', not: '<div' },
        ],
        hint: 'Swap the divs for article and aside. A comment is self-contained too: another article.',
        explain: 'Comments are articles that relate to the post, so they can sit inside the post’s article.',
        preview: { css: 'article{border:1px solid #ccc;padding:6px;margin:6px 0}aside{background:#eef;padding:6px}' },
      },
    ],
    // L4 Inline semantics
    [
      {
        kind: 'write',
        prompt: 'Announce a meetup with a machine-readable date, a highlight and an abbreviation.',
        starter: '',
        solution:
          '<p>The <abbr title="JavaScript">JS</abbr> meetup is on <time datetime="2026-11-14">Saturday the 14th</time>.</p>\n<p>Talks: <mark>free pizza</mark> included!</p>',
        checks: [
          {
            label: 'A <time> with datetime like 2026-11-14',
            re: '<time[^>]*\\sdatetime=["\']\\d{4}-\\d{2}-\\d{2}(T\\d{2}:\\d{2}(:\\d{2})?)?["\'][^>]*>[^<]*\\S[^<]*</time>',
            flags: 'i',
          },
          { label: 'A <mark> highlight', re: '<mark>[^<]*\\S[^<]*</mark>', flags: 'i' },
          { label: 'An <abbr> with a title', re: '<abbr[^>]*\\stitle=["\'][^"\']*\\w[^"\']*["\'][^>]*>[^<]*\\S[^<]*</abbr>', flags: 'i' },
          { label: 'Inside paragraphs', re: '<p>[\\s\\S]*(<time|<mark|<abbr)[\\s\\S]*</p>', flags: 'i' },
        ],
        hint: 'datetime is year-month-day. abbr spells itself out in title.',
        explain: 'time lets calendars and search engines read the date; abbr explains the short form on hover and to screen readers.',
        preview: {},
      },
      {
        kind: 'write',
        prompt: 'Fix the gig notice: valid datetimes, an explained abbreviation, a classed price.',
        starter:
          '<p>Doors open <time datetime="7pm">7pm</time> on <time datetime="25/12/2026">Christmas Day</time>.</p>\n<p>Bring your <abbr>ID</abbr>. Tickets: <span>$12</span>.</p>',
        solution:
          '<p>Doors open <time datetime="19:00">7pm</time> on <time datetime="2026-12-25">Christmas Day</time>.</p>\n<p>Bring your <abbr title="Identity document">ID</abbr>. Tickets: <span class="price">$12</span>.</p>',
        checks: [
          { label: 'The time uses 24-hour datetime="19:00"', re: '<time[^>]*\\sdatetime=["\']19:00(:00)?["\']', flags: 'i' },
          { label: 'The date uses datetime="2026-12-25"', re: '<time[^>]*\\sdatetime=["\']2026-12-25["\']', flags: 'i' },
          { label: 'ID is spelled out in a title', re: '<abbr[^>]*\\stitle=["\'][^"\']*\\w[^"\']*["\'][^>]*>\\s*ID\\s*</abbr>', flags: 'i' },
          { label: 'The price <span> has a class', re: '<span[^>]*\\sclass=["\'][\\w-]+["\'][^>]*>\\s*\\$12\\s*</span>', flags: 'i' },
        ],
        hint: 'Times are HH:MM in 24-hour form; dates are YYYY-MM-DD.',
        explain: 'Only the datetime value must be machine-readable; the text inside time can stay friendly.',
        preview: { css: '.price{font-weight:bold;color:#b00}' },
      },
    ],
    // L5 Details & summary
    [
      {
        kind: 'write',
        prompt: 'Write a two-question FAQ that opens on tap; start the first one open.',
        starter: '',
        solution:
          '<details open>\n  <summary>Is parking free?</summary>\n  <p>Yes, after 6pm.</p>\n</details>\n<details>\n  <summary>Can I bring my dog?</summary>\n  <p>Only on the patio.</p>\n</details>',
        checks: [
          {
            label: 'Two <details>, each starting with a <summary>',
            re: '(<details[^>]*>\\s*<summary>[^<]*\\S[^<]*</summary>[\\s\\S]*?</details>[\\s\\S]*){2}',
            flags: 'i',
          },
          { label: 'An answer after each summary', re: '(</summary>\\s*<p>[^<]*\\S[\\s\\S]*?</details>[\\s\\S]*){2}', flags: 'i' },
          { label: 'The first one has open', re: '^\\s*<details[^>]*\\sopen[\\s>=]', flags: 'i' },
        ],
        hint: 'summary is the visible question; the rest shows when opened. open is boolean.',
        explain: 'details needs no JavaScript to expand; open just sets its starting state.',
        preview: { css: 'summary{cursor:pointer;font-weight:bold}' },
      },
      {
        kind: 'write',
        prompt: 'Turn these into an accordion, fix the Care label, and start Sizes open.',
        starter:
          '<details>\n  <summary>Sizes</summary>\n  <p>S to XXL.</p>\n</details>\n<details>\n  <h3>Care</h3>\n  <p>Wash cold.</p>\n</details>\n<details>\n  <summary>Returns</summary>\n  <p>30 days.</p>\n</details>',
        solution:
          '<details name="shirt" open>\n  <summary>Sizes</summary>\n  <p>S to XXL.</p>\n</details>\n<details name="shirt">\n  <summary>Care</summary>\n  <p>Wash cold.</p>\n</details>\n<details name="shirt">\n  <summary>Returns</summary>\n  <p>30 days.</p>\n</details>',
        checks: [
          {
            label: 'All three <details> share one name',
            re: '<details[^>]*\\sname=["\']([\\w-]+)["\'][\\s\\S]*<details[^>]*\\sname=["\']\\1["\'][\\s\\S]*<details[^>]*\\sname=["\']\\1["\']',
            flags: 'i',
          },
          { label: 'Care is a <summary>', re: '<details[^>]*>\\s*<summary>\\s*Care\\s*</summary>', flags: 'i' },
          { label: 'Sizes starts open', re: '<details[^>]*\\sopen[^>]*>\\s*<summary>\\s*Sizes', flags: 'i' },
          { label: 'No <h3> as the label', not: '<h3>Care' },
        ],
        hint: 'Give every details the same name. The label must be a summary, first inside details.',
        explain: 'Details with the same name act as an accordion: opening one closes the others.',
        preview: { css: 'summary{cursor:pointer;font-weight:bold}' },
      },
    ],
  ],
};

export default unit;
