import type { DesktopUnit } from '../../../engine/types';

// Desktop edition: write-the-code challenges for HTML unit 2 (Text & links).
// lessons[i] runs after lesson i + 1. See docs/CONTENT_GUIDE.md.
const unit: DesktopUnit = {
  lessons: [
    // L1 Headings & paragraphs
    [
      {
        kind: 'write',
        prompt: 'Write a podcast page: a title, one episode heading and its summary.',
        starter: '',
        solution: '<h1>Night Owls Podcast</h1>\n<h2>Episode 12: Moths</h2>\n<p>Why moths fly at lamps, and why it matters.</p>',
        checks: [
          { label: 'An <h1> page title', re: '<h1>\\s*\\S[\\s\\S]*?</h1>', flags: 'i' },
          { label: 'An <h2> episode heading after it', re: '</h1>[\\s\\S]*<h2>\\s*\\S[\\s\\S]*?</h2>', flags: 'i' },
          { label: 'A <p> summary under the h2', re: '</h2>[\\s\\S]*<p>\\s*\\S[\\s\\S]*?</p>', flags: 'i' },
        ],
        hint: 'One h1 for the page, an h2 for the section, then a p for its text.',
        explain: 'Heading levels show structure: the episode is a section of the podcast page, and its text sits below it.',
        preview: {},
      },
      {
        kind: 'write',
        prompt: 'Fix the heading levels: one page title, and Tents and Food as sections.',
        starter:
          '<h1>Camping Guide</h1>\n<h1>Tents</h1>\n<p>Pick a tent rated for three seasons.</p>\n<h1>Food</h1>\n<p>Pack oats, noodles and a stove.</p>',
        solution:
          '<h1>Camping Guide</h1>\n<h2>Tents</h2>\n<p>Pick a tent rated for three seasons.</p>\n<h2>Food</h2>\n<p>Pack oats, noodles and a stove.</p>',
        checks: [
          {
            label: 'Only one <h1>: Camping Guide',
            re: '^(?![\\s\\S]*<h1[\\s\\S]*<h1)[\\s\\S]*<h1>\\s*Camping Guide\\s*</h1>',
            flags: 'i',
          },
          { label: 'Tents is an <h2>', re: '<h2>\\s*Tents\\s*</h2>', flags: 'i' },
          { label: 'Food is an <h2>', re: '<h2>\\s*Food\\s*</h2>', flags: 'i' },
          { label: 'Keep both paragraphs', re: '(<p>[\\s\\S]*?</p>[\\s\\S]*){2}', flags: 'i' },
        ],
        hint: 'A page has one h1. Sections inside it drop one level to h2.',
        explain: 'Screen readers and search engines use heading levels as an outline, so sections belong one level under the title.',
        preview: {},
      },
    ],
    // L2 Emphasis & breaks
    [
      {
        kind: 'write',
        prompt: 'Write pool rules with a strong warning, a stressed word and a divider.',
        starter: '',
        solution:
          '<h2>Pool rules</h2>\n<p><strong>No diving</strong> in the shallow end.</p>\n<hr>\n<p>Please shower <em>before</em> you swim.</p>',
        checks: [
          { label: 'A warning in <strong>', re: '<strong>\\s*\\S[\\s\\S]*?</strong>', flags: 'i' },
          { label: 'A stressed word in <em>', re: '<em>\\s*\\S[\\s\\S]*?</em>', flags: 'i' },
          { label: 'An <hr> divider (no closing tag)', re: '<hr\\s*/?>', flags: 'i' },
          { label: 'No </hr> closing tag', not: '</hr>' },
          { label: 'Text inside <p> paragraphs', re: '<p>[\\s\\S]*?(<strong>|<em>)[\\s\\S]*?</p>', flags: 'i' },
        ],
        hint: 'strong and em wrap words inside a p. hr stands alone, with no closing tag.',
        explain: 'strong says “this matters”, em stresses a word, and hr marks a change of topic.',
        preview: {},
      },
      {
        kind: 'write',
        prompt: 'Put the cafe address on three lines and make the name bold.',
        starter: '<p>Fern Cafe 12 Mill Road Leeds</p>',
        solution: '<p><strong>Fern Cafe</strong><br>12 Mill Road<br>Leeds</p>',
        checks: [
          { label: 'Fern Cafe in <strong>', re: '<strong>\\s*Fern Cafe\\s*</strong>', flags: 'i' },
          { label: 'A <br> after the name', re: 'Fern Cafe\\s*</strong>\\s*<br\\s*/?>\\s*12 Mill Road', flags: 'i' },
          { label: 'A <br> before Leeds', re: '12 Mill Road\\s*<br\\s*/?>\\s*Leeds', flags: 'i' },
          { label: 'No </br> tags', not: '</br>' },
          { label: 'All in one paragraph', re: '^\\s*<p>[\\s\\S]*Leeds\\s*</p>\\s*$', flags: 'i' },
        ],
        hint: 'br is empty: write <br> where each new line starts. Bold the name with strong.',
        explain: 'An address is one block of text with line breaks, so it stays one paragraph and uses br.',
        preview: {},
      },
    ],
    // L3 Links
    [
      {
        kind: 'write',
        prompt: 'Link a band page to its ticket site and to its own tour page.',
        starter: '<h1>The Lanterns</h1>\n',
        solution:
          '<h1>The Lanterns</h1>\n<p><a href="https://tickets.example.com/lanterns">Buy tickets</a></p>\n<p><a href="tour.html">Tour dates</a></p>',
        checks: [
          {
            label: 'A link with a full https:// URL',
            re: '<a[^>]*\\shref=["\']https?://[^"\']+["\'][^>]*>\\s*\\S[\\s\\S]*?</a>',
            flags: 'i',
          },
          {
            label: 'A link with a relative path like tour.html',
            re: '<a[^>]*\\shref=["\'](?![a-z]+:|#|//)[^"\']+["\'][^>]*>\\s*\\S[\\s\\S]*?</a>',
            flags: 'i',
          },
          { label: 'Both links use href, not src', not: '<a src' },
        ],
        hint: 'Other sites need https:// at the start. Your own pages just need the file name.',
        explain: 'A full URL leaves your site; a relative path finds a page next to the current one.',
        preview: {},
      },
      {
        kind: 'write',
        prompt: 'Fix both links so they go to the right places.',
        starter: '<p>Read our <a src="menu.html">menu</a> or visit <a href="www.citybakes.com">our shop</a>.</p>',
        solution: '<p>Read our <a href="menu.html">menu</a> or visit <a href="https://www.citybakes.com">our shop</a>.</p>',
        checks: [
          { label: 'The menu link uses href="menu.html"', re: '<a\\s[^>]*href=["\']menu\\.html["\'][^>]*>\\s*menu\\s*</a>', flags: 'i' },
          { label: 'No src on links', re: '^(?![\\s\\S]*<a[^>]*\\ssrc=)[\\s\\S]*<a', flags: 'i' },
          {
            label: 'The shop link starts with https://',
            re: '<a\\s[^>]*href=["\']https?://(www\\.)?citybakes\\.com/?["\']',
            flags: 'i',
          },
          { label: 'No href starting with www.', not: 'href="www.' },
        ],
        hint: 'Links always use href. Without https:// the browser treats www.citybakes.com as a file on your own site.',
        explain: 'src is for images and media; a link’s target is href. A full URL needs its scheme, or it is read as a relative path.',
        preview: {},
      },
    ],
    // L4 New tabs & email
    [
      {
        kind: 'write',
        prompt: 'Write a contact block: email link, phone link and a map in a new tab.',
        starter: '',
        solution:
          '<p><a href="mailto:hello@yogabarn.com">Email us</a></p>\n<p><a href="tel:+441234567890">Call us</a></p>\n<p><a href="https://maps.example.com/yogabarn" target="_blank">Find us</a></p>',
        checks: [
          { label: 'An email link with mailto:', re: '<a[^>]*\\shref=["\']mailto:[^"\'@]+@[^"\']+["\']', flags: 'i' },
          { label: 'A phone link with tel:', re: '<a[^>]*\\shref=["\']tel:[+\\d][\\d\\s-]*["\']', flags: 'i' },
          {
            label: 'A map link with target="_blank"',
            re: '<a(?=[^>]*\\shref=["\']https?://)(?=[^>]*\\starget=["\']_blank["\'])[^>]*>',
            flags: 'i',
          },
          { label: 'Three links, each with text', re: '(<a[^>]*>\\s*\\S[^<]*</a>[\\s\\S]*){3}', flags: 'i' },
        ],
        hint: 'href can start with mailto: or tel:. target="_blank" opens a new tab.',
        explain: 'mailto: opens the mail app and tel: the dialler; target="_blank" keeps your page open behind the map.',
        preview: {},
      },
      {
        kind: 'write',
        prompt: 'This page is blog/post.html. Fix the home, source and email links.',
        starter:
          '<!-- this file: blog/post.html -->\n<p>Back to <a href="index.html">home</a></p>\n<p>Source: <a href="https://data.gov">data.gov</a></p>\n<p>Questions? Email <a href="ana@site.com">Ana</a></p>',
        solution:
          '<!-- this file: blog/post.html -->\n<p>Back to <a href="../index.html">home</a></p>\n<p>Source: <a href="https://data.gov" target="_blank">data.gov</a></p>\n<p>Questions? Email <a href="mailto:ana@site.com">Ana</a></p>',
        checks: [
          { label: 'Home goes up a folder: ../index.html', has: 'href="../index.html"' },
          {
            label: 'The source opens in a new tab',
            re: '<a(?=[^>]*data\\.gov)(?=[^>]*\\starget=["\']_blank["\'])[^>]*>',
            flags: 'i',
          },
          { label: 'Email Ana with mailto:ana@site.com', has: 'href="mailto:ana@site.com"' },
          { label: 'No plain href="ana@site.com"', not: 'href="ana@' },
        ],
        hint: '../ climbs out of blog/. An email address needs mailto: in front.',
        explain: 'Relative paths start from the current folder, so ../ is needed to reach the site root. Without mailto: the browser looks for a file.',
        preview: {},
      },
    ],
    // L5 Jump links
    [
      {
        kind: 'write',
        prompt: 'Add a trail page with jump links to its Gear and Route sections.',
        starter: '',
        solution:
          '<h1>Ridge Trail</h1>\n<p><a href="#gear">Gear</a> | <a href="#route">Route</a></p>\n<h2 id="gear">Gear</h2>\n<p>Boots, water, a map.</p>\n<h2 id="route">Route</h2>\n<p>12 km loop from the car park.</p>',
        checks: [
          { label: 'Two links whose href starts with #', re: '(<a[^>]*\\shref=["\']#[\\w-]+["\'][\\s\\S]*){2}', flags: 'i' },
          { label: 'Two <h2> sections with an id', re: '(<h2[^>]*\\sid=["\'][\\w-]+["\'][\\s\\S]*){2}', flags: 'i' },
          {
            label: 'Each link matches an id on the page',
            re: '^(?=[\\s\\S]*href=["\']#([\\w-]+)["\'][\\s\\S]*href=["\']#([\\w-]+)["\'])(?=[\\s\\S]*\\sid=["\']\\1["\'])(?=[\\s\\S]*\\sid=["\']\\2["\'])',
          },
        ],
        hint: 'Give each h2 an id, then link to it with href="#" plus that id.',
        explain: 'A # link scrolls to the element with that id on the same page, so the two must match exactly.',
        preview: {},
      },
      {
        kind: 'write',
        prompt: 'Fix the rules link, add Back to top, and link to the prizes on results.html.',
        starter:
          '<h1 id="top">Chess Club</h1>\n<p><a href="rules">Jump to rules</a></p>\n<h2 id="rules">Rules</h2>\n<p>Touch a piece, move a piece.</p>\n<!-- results.html has <h2 id="prizes"> -->\n',
        solution:
          '<h1 id="top">Chess Club</h1>\n<p><a href="#rules">Jump to rules</a></p>\n<h2 id="rules">Rules</h2>\n<p>Touch a piece, move a piece.</p>\n<!-- results.html has <h2 id="prizes"> -->\n<p><a href="results.html#prizes">See the prizes</a></p>\n<p><a href="#top">Back to top</a></p>',
        checks: [
          { label: 'The rules link uses #rules', has: 'href="#rules"' },
          { label: 'A Back to top link to #top', re: '<a[^>]*\\shref=["\']#top["\'][^>]*>\\s*Back to top\\s*</a>', flags: 'i' },
          { label: 'A link to results.html#prizes', has: 'href="results.html#prizes"' },
        ],
        hint: 'Same page: just #id. Another page: its file name, then #id.',
        explain: 'Without the # the browser looks for a file called rules. Put a page name before the # to jump into another page.',
        preview: {},
      },
    ],
  ],
};

export default unit;
