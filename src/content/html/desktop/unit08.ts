import type { DesktopUnit } from '../../../engine/types';

// Desktop edition: write-the-code challenges for HTML unit 8 (Accessibility).
// lessons[i] runs after lesson i + 1. See docs/CONTENT_GUIDE.md.
const unit: DesktopUnit = {
  lessons: [
    // L1 Decorative images
    [
      {
        kind: 'write',
        prompt: 'Add a decorative wave divider and a meaningful photo of the harbour.',
        starter: '<h2>Harbour walk</h2>\n',
        solution:
          '<h2>Harbour walk</h2>\n<img src="wave-divider.svg" alt="">\n<img src="harbour.jpg" alt="Red fishing boats moored at low tide">',
        checks: [
          { label: 'A decorative <img> with alt=""', re: '<img[^>]*\\salt=(""|\'\')[^>]*>', flags: 'i' },
          { label: 'A photo with descriptive alt text', re: '<img[^>]*\\salt=["\'][^"\']*\\w[^"\']*["\'][^>]*>', flags: 'i' },
          { label: 'Every <img> has an alt', re: '^(?![\\s\\S]*<img(?![^>]*\\salt=)[^>]*>)[\\s\\S]*<img', flags: 'i' },
        ],
        hint: 'Empty alt="" tells screen readers to skip; real pictures get a short description.',
        explain: 'alt="" hides decoration; leaving alt out entirely can make a screen reader read the file name.',
        preview: {},
      },
      {
        kind: 'write',
        prompt: 'Fix the alt text: hide the swirl, describe the lighthouse beyond its caption.',
        starter:
          '<img src="swirl.svg" alt="swirl decoration">\n<figure>\n  <img src="lighthouse.jpg">\n  <figcaption>Hook Head lighthouse</figcaption>\n</figure>',
        solution:
          '<img src="swirl.svg" alt="">\n<figure>\n  <img src="lighthouse.jpg" alt="Black and white striped tower on rocks under a stormy sky">\n  <figcaption>Hook Head lighthouse</figcaption>\n</figure>',
        checks: [
          { label: 'The swirl gets alt=""', re: '<img(?=[^>]*swirl\\.svg)[^>]*\\salt=(""|\'\')', flags: 'i' },
          {
            label: 'The lighthouse has alt text',
            re: '<img(?=[^>]*lighthouse\\.jpg)(?=[^>]*\\salt=["\'][^"\']*\\w[^"\']*["\'])[^>]*>',
            flags: 'i',
          },
          {
            label: 'Its alt doesn’t just repeat the caption',
            re: '<img(?=[^>]*lighthouse\\.jpg)(?![^>]*\\salt=["\']\\s*Hook Head lighthouse\\s*["\'])[^>]*>',
            flags: 'i',
          },
          { label: 'Keep the figcaption', re: '<figcaption>\\s*Hook Head lighthouse\\s*</figcaption>', flags: 'i' },
        ],
        hint: 'Decoration: empty alt. The caption already names the place, so alt says what it looks like.',
        explain: 'A screen reader reads both alt and caption, so repeating the caption wastes the alt.',
        preview: {},
      },
    ],
    // L2 Fieldset & legend
    [
      {
        kind: 'write',
        prompt: 'Group three delivery options as labelled radios in a fieldset.',
        starter: '<form action="/checkout" method="post">\n\n  <button>Pay</button>\n</form>',
        solution:
          '<form action="/checkout" method="post">\n  <fieldset>\n    <legend>Delivery</legend>\n    <label><input type="radio" name="delivery" value="standard"> Standard</label>\n    <label><input type="radio" name="delivery" value="express"> Express</label>\n    <label><input type="radio" name="delivery" value="pickup"> Pickup</label>\n  </fieldset>\n  <button>Pay</button>\n</form>',
        checks: [
          { label: 'A <fieldset> whose first child is a <legend>', re: '<fieldset[^>]*>\\s*<legend>[^<]*\\S[^<]*</legend>', flags: 'i' },
          {
            label: 'Three radios sharing one name, inside it',
            re: '<fieldset[\\s\\S]*?(<input(?=[^>]*type=["\']radio["\'])[^>]*\\sname=["\']([\\w-]+)["\'][\\s\\S]*?){1}(<input(?=[^>]*type=["\']radio["\'])(?=[^>]*\\sname=["\']\\2["\'])[\\s\\S]*?){2}</fieldset>',
            flags: 'i',
          },
          { label: 'A label for each choice', re: '(<label[^>]*>[\\s\\S]*?</label>[\\s\\S]*){3}', flags: 'i' },
        ],
        hint: 'fieldset wraps the group; legend goes first and names it. Radios share one name.',
        explain: 'Screen readers announce “Delivery” as you enter the group, then each choice’s own label.',
        preview: {},
      },
      {
        kind: 'write',
        prompt: 'Group the survey questions into fieldsets with legends instead of paragraphs.',
        starter:
          '<form action="/survey" method="post">\n  <p>Diet</p>\n  <label><input type="checkbox" name="diet" value="vegan"> Vegan</label>\n  <label><input type="checkbox" name="diet" value="gf"> Gluten-free</label>\n  <p>Seat</p>\n  <label><input type="radio" name="seat" value="window"> Window</label>\n  <label><input type="radio" name="seat" value="aisle"> Aisle</label>\n  <button>Send</button>\n</form>',
        solution:
          '<form action="/survey" method="post">\n  <fieldset>\n    <legend>Diet</legend>\n    <label><input type="checkbox" name="diet" value="vegan"> Vegan</label>\n    <label><input type="checkbox" name="diet" value="gf"> Gluten-free</label>\n  </fieldset>\n  <fieldset>\n    <legend>Seat</legend>\n    <label><input type="radio" name="seat" value="window"> Window</label>\n    <label><input type="radio" name="seat" value="aisle"> Aisle</label>\n  </fieldset>\n  <button>Send</button>\n</form>',
        checks: [
          {
            label: 'A Diet fieldset holding both checkboxes',
            re: '<fieldset[^>]*>\\s*<legend>\\s*Diet\\s*</legend>(?:(?!</fieldset>)[\\s\\S])*Vegan(?:(?!</fieldset>)[\\s\\S])*Gluten-free[\\s\\S]*?</fieldset>',
            flags: 'i',
          },
          {
            label: 'A Seat fieldset holding both radios',
            re: '<fieldset[^>]*>\\s*<legend>\\s*Seat\\s*</legend>(?:(?!</fieldset>)[\\s\\S])*Window(?:(?!</fieldset>)[\\s\\S])*Aisle[\\s\\S]*?</fieldset>',
            flags: 'i',
          },
          { label: 'No <p> group titles left', re: '^(?![\\s\\S]*<p>\\s*(Diet|Seat)\\s*</p>)[\\s\\S]*<form', flags: 'i' },
          { label: 'The button stays in the form', re: '</fieldset>\\s*<button[^>]*>[\\s\\S]*?</button>\\s*</form>', flags: 'i' },
        ],
        hint: 'Wrap each group in fieldset and turn its p into the legend, as the first child.',
        explain: 'A p looks like a title but isn’t tied to the inputs. legend is, so it is read with every choice.',
        preview: {},
      },
    ],
    // L3 ARIA labels
    [
      {
        kind: 'write',
        prompt: 'Build a music player: an icon-only play button and a section named by its heading.',
        starter: '',
        solution:
          '<section aria-labelledby="now-playing">\n  <h2 id="now-playing">Now playing</h2>\n  <p>Blue Monday</p>\n  <button aria-label="Play">▶</button>\n</section>',
        checks: [
          {
            label: 'A <button> named with aria-label',
            re: '<button[^>]*\\saria-label=["\'][^"\']*\\w[^"\']*["\'][^>]*>[\\s\\S]*?</button>',
            flags: 'i',
          },
          {
            label: 'A <section> with aria-labelledby that matches the heading’s id',
            re: '<section[^>]*\\saria-labelledby=["\']([\\w-]+)["\'][^>]*>[\\s\\S]*<h[1-6][^>]*\\sid=["\']\\1["\']',
            flags: 'i',
          },
          { label: 'No # in aria-labelledby', not: 'aria-labelledby="#' },
        ],
        hint: 'aria-label gives words to the ▶ button. aria-labelledby points at a bare id.',
        explain: 'A symbol has no name to read. aria-labelledby reuses visible text, so the name matches what people see.',
        preview: {},
      },
      {
        kind: 'write',
        prompt: 'Name the search button, and tie the password hint to its field.',
        starter:
          '<button>🔍</button>\n<label for="pw">Password</label>\n<input type="password" id="pw" aria-describedby="#pw-help">\n<p>At least 8 characters.</p>',
        solution:
          '<button aria-label="Search">🔍</button>\n<label for="pw">Password</label>\n<input type="password" id="pw" aria-describedby="pw-help">\n<p id="pw-help">At least 8 characters.</p>',
        checks: [
          { label: 'The 🔍 button has an aria-label', re: '<button[^>]*\\saria-label=["\'][^"\']*\\w[^"\']*["\'][^>]*>', flags: 'i' },
          {
            label: 'aria-describedby matches the hint’s id',
            re: '<input[^>]*\\saria-describedby=["\']([\\w-]+)["\'][\\s\\S]*<p[^>]*\\sid=["\']\\1["\'][^>]*>\\s*At least 8',
            flags: 'i',
          },
          { label: 'No # in aria-describedby', not: 'aria-describedby="#' },
          { label: 'Keep the label linked', re: '<label[^>]*\\sfor=["\']pw["\']', flags: 'i' },
        ],
        hint: 'ARIA id references are bare ids, with no #. The hint paragraph needs that id.',
        explain: 'The label names the field and aria-describedby adds the hint, so a screen reader reads both.',
        preview: {},
      },
    ],
    // L4 Skip links & focus
    [
      {
        kind: 'write',
        prompt: 'Start a page with a skip link that jumps past the menu to main.',
        starter: '',
        solution:
          '<a href="#main">Skip to content</a>\n<nav>\n  <a href="/">Home</a>\n  <a href="/menu">Menu</a>\n</nav>\n<main id="main">\n  <h1>Noodle Bar</h1>\n</main>',
        checks: [
          { label: 'A skip link comes first', re: '^\\s*<a[^>]*\\shref=["\']#[\\w-]+["\'][^>]*>[^<]*\\S[^<]*</a>', flags: 'i' },
          { label: 'Then a <nav> with links', re: '</a>\\s*<nav[^>]*>[\\s\\S]*<a[\\s\\S]*</nav>', flags: 'i' },
          {
            label: 'A <main> whose id matches the skip link',
            re: '^\\s*<a[^>]*\\shref=["\']#([\\w-]+)["\'][\\s\\S]*<main[^>]*\\sid=["\']\\1["\']',
            flags: 'i',
          },
        ],
        hint: 'The first thing in body is <a href="#main">. main gets id="main".',
        explain: 'Keyboard users meet the skip link on their first Tab and can jump straight past the menu.',
        preview: {},
      },
      {
        kind: 'write',
        prompt: 'Fix the Tab order: no positive tabindex, and let Tab reach the chart.',
        starter:
          '<a href="#main">Skip to content</a>\n<nav>\n  <a href="/" tabindex="2">Home</a>\n  <a href="/shop" tabindex="1">Shop</a>\n</nav>\n<main id="main">\n  <div class="chart">Sales chart</div>\n</main>',
        solution:
          '<a href="#main">Skip to content</a>\n<nav>\n  <a href="/">Home</a>\n  <a href="/shop">Shop</a>\n</nav>\n<main id="main">\n  <div class="chart" tabindex="0">Sales chart</div>\n</main>',
        checks: [
          { label: 'No positive tabindex', re: '^(?![\\s\\S]*tabindex=["\']?[1-9])[\\s\\S]*<nav', flags: 'i' },
          { label: 'The chart has tabindex="0"', re: '<div(?=[^>]*class=["\']chart["\'])[^>]*\\stabindex=["\']?0["\']?[\\s>]', flags: 'i' },
          { label: 'Keep both menu links', re: '<nav>\\s*<a[^>]*>\\s*Home\\s*</a>\\s*<a[^>]*>\\s*Shop\\s*</a>\\s*</nav>', flags: 'i' },
          { label: 'The skip link stays first', re: '^\\s*<a\\s+href=["\']#main["\']', flags: 'i' },
        ],
        hint: 'Links are already in the Tab order. tabindex="0" adds an element where it sits.',
        explain: 'Positive tabindex jumps elements ahead of the page order and confuses keyboard users. 0 keeps source order.',
        preview: {},
      },
    ],
    // L5 ARIA states
    [
      {
        kind: 'write',
        prompt: 'Write a nav that marks the current page, plus a closed menu button.',
        starter: '',
        solution:
          '<nav>\n  <a href="/">Home</a>\n  <a href="/recipes" aria-current="page">Recipes</a>\n  <a href="/about">About</a>\n</nav>\n<button aria-expanded="false">More</button>',
        checks: [
          { label: 'A <nav> with three links', re: '<nav[^>]*>(?:(?!</nav>)[\\s\\S])*((<a[^>]*>[^<]*</a>)(?:(?!</nav>)[\\s\\S])*){3}</nav>', flags: 'i' },
          { label: 'Exactly one link with aria-current="page"', re: '^(?![\\s\\S]*aria-current[\\s\\S]*aria-current)[\\s\\S]*<a[^>]*\\saria-current=["\']page["\']', flags: 'i' },
          { label: 'A <button> with aria-expanded="false"', re: '<button[^>]*\\saria-expanded=["\']false["\'][^>]*>[^<]*\\S[^<]*</button>', flags: 'i' },
        ],
        hint: 'aria-current="page" goes on the link to the page you are on. A closed menu is aria-expanded="false".',
        explain: 'Sighted users see which link is highlighted; aria-current tells screen reader users the same thing.',
        preview: { css: '[aria-current]{font-weight:bold}nav a{margin-right:8px}' },
      },
      {
        kind: 'write',
        prompt: 'Make Filters a real button that says it’s open, and hide the decorative tick.',
        starter:
          '<div class="btn">Filters</div>\n<ul>\n  <li>In stock</li>\n  <li>On sale</li>\n</ul>\n<p><span>✔</span> Saved</p>',
        solution:
          '<button aria-expanded="true">Filters</button>\n<ul>\n  <li>In stock</li>\n  <li>On sale</li>\n</ul>\n<p><span aria-hidden="true">✔</span> Saved</p>',
        checks: [
          { label: 'Filters is a <button>', re: '<button[^>]*>\\s*Filters\\s*</button>', flags: 'i' },
          { label: 'It has aria-expanded="true": the list shows', re: '<button[^>]*\\saria-expanded=["\']true["\']', flags: 'i' },
          { label: 'No fake div button', not: '<div class="btn"' },
          { label: 'The tick has aria-hidden="true"', re: '<span[^>]*\\saria-hidden=["\']true["\'][^>]*>\\s*✔\\s*</span>', flags: 'i' },
        ],
        hint: 'Use a native button first. The list is visible, so expanded is true.',
        explain: 'A real button works with Enter, Space and screen readers for free; ARIA then reports its state.',
        preview: {},
      },
    ],
  ],
};

export default unit;
