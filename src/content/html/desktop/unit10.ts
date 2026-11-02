import type { DesktopUnit } from '../../../engine/types';

// Desktop edition: write-the-code challenges for HTML unit 10 (Best practices).
// lessons[i] runs after lesson i + 1. See docs/CONTENT_GUIDE.md.
const unit: DesktopUnit = {
  lessons: [
    // L1 Character entities
    [
      {
        kind: 'write',
        prompt: 'Write a tip that shows the <h1> tag as text, plus Fish & Chips and a © line.',
        starter: '',
        solution: '<p>Use &lt;h1&gt; once per page.</p>\n<p>Today: Fish &amp; Chips</p>\n<p>&copy; 2026 Code Café</p>',
        checks: [
          { label: 'Show <h1> as text with &lt; and &gt;', re: '&lt;h1&gt;', flags: 'i' },
          { label: 'Write the & as &amp;', re: 'Fish\\s*&amp;\\s*Chips', flags: 'i' },
          { label: 'A © with &copy;', has: '&copy;' },
          { label: 'No bare & left', re: '^(?![\\s\\S]*&(?!(?:[a-z]+\\d*|#\\d+|#x[0-9a-f]+);))[\\s\\S]*&', flags: 'i' },
        ],
        hint: '< is &lt;, > is &gt;, & is &amp; and © is &copy;. Every entity ends with ;.',
        explain: 'A raw < would start a real tag, and a raw & starts an entity, so both are escaped to show as text.',
        preview: {},
      },
      {
        kind: 'write',
        prompt: 'Escape the special characters so the quiz page shows exactly what’s written.',
        starter:
          '<p>Rock & Roll Quiz</p>\n<p>Tip: 5 < 7 is true</p>\n<input value="Type "yes" to play">\n<p>(c) 2026 Quiz Hut</p>',
        solution:
          '<p>Rock &amp; Roll Quiz</p>\n<p>Tip: 5 &lt; 7 is true</p>\n<input value="Type &quot;yes&quot; to play">\n<p>&copy; 2026 Quiz Hut</p>',
        checks: [
          { label: 'Rock &amp; Roll', re: 'Rock\\s*&amp;\\s*Roll', flags: 'i' },
          { label: '5 &lt; 7', re: '5\\s*&lt;\\s*7', flags: 'i' },
          { label: '&quot; around yes inside the value', re: 'value="Type &quot;yes&quot; to play"', flags: 'i' },
          { label: '&copy; instead of (c)', re: '&copy;\\s*2026', flags: 'i' },
          { label: 'No (c) left', not: '(c)' },
        ],
        hint: 'Inside a double-quoted attribute, a " ends the value early, so write &quot;.',
        explain: 'Escaping keeps the browser from reading text as code: the < no longer opens a tag and the quote no longer ends the value.',
        preview: {},
      },
    ],
    // L2 Valid nesting
    [
      {
        kind: 'write',
        prompt: 'Write a camp kit note: an intro line, then a list, all inside one div.',
        starter: '',
        solution: '<div id="kit">\n  <p>Pack these <strong>before</strong> Friday:</p>\n  <ul>\n    <li>Sleeping bag</li>\n    <li>Torch</li>\n  </ul>\n</div>',
        checks: [
          { label: 'A <div> wraps everything', re: '^\\s*<div[^>]*>[\\s\\S]*</div>\\s*$', flags: 'i' },
          { label: 'A <p> intro that closes before the list', re: '<p>[\\s\\S]*?</p>\\s*<(ul|ol)>', flags: 'i' },
          { label: 'The list is not inside the <p>', re: '^(?![\\s\\S]*<p>(?:(?!</p>)[\\s\\S])*<(ul|ol))[\\s\\S]*<(ul|ol)>', flags: 'i' },
          { label: 'At least two <li> items in the list', re: '<(ul|ol)>(\\s*<li>[^<]*\\S[^<]*</li>){2,}\\s*</\\1>', flags: 'i' },
        ],
        hint: 'Close the p before the ul starts. Both sit side by side inside the div.',
        explain: 'A p can only hold text-level content; a list inside it makes the browser end the p early.',
        preview: {},
      },
      {
        kind: 'write',
        prompt: 'Fix the invalid nesting and the duplicate id in this menu.',
        starter:
          '<p>Menu\n  <ul>\n    <li>Soup</li>\n    <p>Bread</p>\n  </ul>\n</p>\n<a href="/order"><button>Order</button></a>\n<h2 id="menu">Mains</h2>\n<h2 id="menu">Drinks</h2>',
        solution:
          '<p>Menu</p>\n<ul>\n  <li>Soup</li>\n  <li>Bread</li>\n</ul>\n<a href="/order">Order</a>\n<h2 id="mains">Mains</h2>\n<h2 id="drinks">Drinks</h2>',
        checks: [
          { label: 'The list is not inside a <p>', re: '^(?![\\s\\S]*<p>(?:(?!</p>)[\\s\\S])*<ul)[\\s\\S]*<ul>', flags: 'i' },
          { label: 'Soup and Bread both <li> items', re: '<ul>\\s*<li>\\s*Soup\\s*</li>\\s*<li>\\s*Bread\\s*</li>\\s*</ul>', flags: 'i' },
          { label: 'No button inside the link', re: '^(?![\\s\\S]*<a[^>]*>(?:(?!</a>)[\\s\\S])*<button)[\\s\\S]*Order', flags: 'i' },
          { label: 'An Order link or button remains', re: '<a[^>]*\\shref=["\']/order["\'][^>]*>\\s*Order\\s*</a>|<button[^>]*>\\s*Order\\s*</button>', flags: 'i' },
          {
            label: 'Every id is unique',
            re: '^(?![\\s\\S]*\\sid=["\']([\\w-]+)["\'][\\s\\S]*\\sid=["\']\\1["\'])(?=(?:[\\s\\S]*<h2[^>]*\\sid=){2})',
            flags: 'i',
          },
        ],
        hint: 'Close the p before the list, make Bread an li, drop the button from the link, rename one id.',
        explain: 'Browsers silently rearrange invalid nesting, and a duplicate id breaks jump links and labels.',
        preview: {},
      },
    ],
    // L3 Responsive images
    [
      {
        kind: 'write',
        prompt: 'Show the logo sharp on high-density screens using a 2x version.',
        starter: '',
        solution: '<img src="logo.png" srcset="logo@2x.png 2x" alt="Kite Club" width="160" height="60">',
        checks: [
          { label: 'A src for the normal logo', re: '<img[^>]*\\ssrc=["\'][^"\']+\\.(png|jpe?g|webp|svg|avif)["\']', flags: 'i' },
          { label: 'srcset with a 2x version', re: '<img[^>]*\\ssrcset=["\'][^"\']*\\S+\\s+2x[^"\']*["\']', flags: 'i' },
          { label: 'alt text', re: '<img[^>]*\\salt=["\'][^"\']*\\w[^"\']*["\']', flags: 'i' },
        ],
        hint: 'srcset="file 2x" next to the usual src. Keep the alt.',
        explain: 'Screens with twice the pixels pick the 2x file; everyone else uses src.',
        preview: {},
      },
      {
        kind: 'write',
        prompt: 'Add 640 and 1280-wide versions, full width on phones, 60% otherwise.',
        starter: '<img src="beach-640.jpg" alt="Surfers at dawn">',
        solution:
          '<img src="beach-640.jpg" alt="Surfers at dawn"\n  srcset="beach-640.jpg 640w, beach-1280.jpg 1280w"\n  sizes="(max-width: 700px) 100vw, 60vw">',
        checks: [
          { label: 'srcset lists beach-640.jpg 640w', re: '\\ssrcset=["\'][^"\']*beach-640\\.jpg\\s+640w', flags: 'i' },
          { label: '…and beach-1280.jpg 1280w', re: '\\ssrcset=["\'][^"\']*beach-1280\\.jpg\\s+1280w', flags: 'i' },
          {
            label: 'sizes: 100vw on small screens, 60vw by default',
            re: '\\ssizes=["\']\\s*\\((max-width:\\s*\\d+(px|em|rem))\\)\\s*100vw\\s*,\\s*60vw\\s*["\']',
            flags: 'i',
          },
          { label: 'Keep src as the fallback', re: '<img[^>]*\\ssrc=["\']beach-640\\.jpg["\']', flags: 'i' },
        ],
        hint: 'Width descriptors end in w, not px. sizes is (condition) width, then a default.',
        explain: 'srcset says what files exist; sizes says how wide the image will show, so the browser can pick before layout.',
        preview: {},
      },
    ],
    // L4 Picture element
    [
      {
        kind: 'write',
        prompt: 'Serve a hedgehog photo as AVIF, then WebP, with a JPEG fallback.',
        starter: '',
        solution:
          '<picture>\n  <source srcset="hedgehog.avif" type="image/avif">\n  <source srcset="hedgehog.webp" type="image/webp">\n  <img src="hedgehog.jpg" alt="Hedgehog curled up in leaves">\n</picture>',
        checks: [
          { label: 'A <picture> wraps everything', re: '^\\s*<picture>[\\s\\S]*</picture>\\s*$', flags: 'i' },
          { label: 'An AVIF <source> with type="image/avif"', re: '<source(?=[^>]*\\ssrcset=["\'][^"\']+\\.avif)(?=[^>]*\\stype=["\']image/avif["\'])[^>]*>', flags: 'i' },
          { label: 'A WebP <source> with type="image/webp"', re: '<source(?=[^>]*\\ssrcset=["\'][^"\']+\\.webp)(?=[^>]*\\stype=["\']image/webp["\'])[^>]*>', flags: 'i' },
          { label: 'AVIF listed before WebP', re: 'image/avif[\\s\\S]*image/webp', flags: 'i' },
          { label: 'An <img> with alt comes last', re: '<img(?=[^>]*\\ssrc=["\'][^"\']+["\'])[^>]*\\salt=["\'][^"\']*\\w[^"\']*["\'][^>]*>\\s*</picture>', flags: 'i' },
        ],
        hint: 'Sources use srcset and type; the first one the browser supports wins. img goes last.',
        explain: 'Browsers that can’t read AVIF try WebP, and anything older falls back to the img, which also holds the alt.',
        preview: {},
      },
      {
        kind: 'write',
        prompt: 'Fix the picture so phones get the tall crop and others the wide one.',
        starter:
          '<picture>\n  <img src="team-wide.jpg" alt="Our five-person team on the office roof">\n  <source src="team-tall.jpg" media="(max-width: 600px)">\n</picture>',
        solution:
          '<picture>\n  <source srcset="team-tall.jpg" media="(max-width: 600px)">\n  <img src="team-wide.jpg" alt="Our five-person team on the office roof">\n</picture>',
        checks: [
          { label: 'The source uses srcset, not src', re: '<source(?![^>]*\\ssrc=)[^>]*\\ssrcset=["\']team-tall\\.jpg["\']', flags: 'i' },
          { label: 'Keep a small-screen media condition', re: '<source[^>]*\\smedia=["\']\\(max-width:\\s*\\d+(px|em|rem)\\)["\']', flags: 'i' },
          { label: 'The source comes before the img', re: '<picture>\\s*<source[^>]*>\\s*<img[^>]*team-wide\\.jpg[^>]*>\\s*</picture>', flags: 'i' },
          { label: 'Keep the alt on the img', re: '<img[^>]*\\salt=["\'][^"\']*\\w[^"\']*["\']', flags: 'i' },
        ],
        hint: 'Sources take srcset. The browser stops at the img, so it has to be last.',
        explain: 'The img is the fallback and the element that actually shows; sources after it are never checked.',
        preview: {},
      },
    ],
    // L5 Fast loading
    [
      {
        kind: 'write',
        prompt: 'Add a lazy-loading chart lower on the page and a deferred script.',
        starter: '<h1>Weather report</h1>\n<p>Lots of text above the fold…</p>\n',
        solution:
          '<h1>Weather report</h1>\n<p>Lots of text above the fold…</p>\n<img src="rain-chart.png" alt="Bar chart of rainfall by month"\n  width="800" height="450" loading="lazy">\n<script src="report.js" defer></script>',
        checks: [
          { label: 'An <img> with loading="lazy"', re: '<img[^>]*\\sloading=["\']lazy["\']', flags: 'i' },
          {
            label: 'Its width and height set',
            re: '<img(?=[^>]*\\swidth=["\']?\\d+["\']?[\\s>/])(?=[^>]*\\sheight=["\']?\\d+["\']?[\\s>/])[^>]*>',
            flags: 'i',
          },
          { label: 'alt on the image', re: '<img[^>]*\\salt=["\'][^"\']*\\w[^"\']*["\']', flags: 'i' },
          { label: 'A <script src> with defer, closed', re: '<script(?=[^>]*\\ssrc=["\'][^"\']+\\.js["\'])(?=[^>]*\\sdefer[\\s>=])[^>]*>\\s*</script>', flags: 'i' },
        ],
        hint: 'loading="lazy", width and height go on img. defer goes on script, which always needs </script>.',
        explain: 'Lazy images load near the viewport, width and height reserve space, and defer runs the script after parsing.',
        preview: {},
      },
      {
        kind: 'write',
        prompt: 'Speed up this gallery page without making the top photo load late.',
        starter:
          '<!DOCTYPE html>\n<html lang="en">\n<head>\n  <meta charset="utf-8">\n  <title>Harbour Photos</title>\n  <script src="gallery.js"></script>\n</head>\n<body>\n  <img src="hero.jpg" alt="Harbour at sunrise" width="1200" height="600" loading="lazy">\n  <p>Scroll for more photos.</p>\n  <img src="boats.jpg" alt="Fishing boats tied up">\n</body>\n</html>',
        solution:
          '<!DOCTYPE html>\n<html lang="en">\n<head>\n  <meta charset="utf-8">\n  <title>Harbour Photos</title>\n  <script src="gallery.js" defer></script>\n</head>\n<body>\n  <img src="hero.jpg" alt="Harbour at sunrise" width="1200" height="600">\n  <p>Scroll for more photos.</p>\n  <img src="boats.jpg" alt="Fishing boats tied up" width="800" height="533" loading="lazy">\n</body>\n</html>',
        checks: [
          { label: 'The script has defer', re: '<script(?=[^>]*gallery\\.js)(?=[^>]*\\sdefer[\\s>=])[^>]*>\\s*</script>', flags: 'i' },
          { label: 'The hero image is not lazy', re: '<img(?=[^>]*hero\\.jpg)(?![^>]*loading=["\']lazy)[^>]*>', flags: 'i' },
          { label: 'The boats image is lazy', re: '<img(?=[^>]*boats\\.jpg)(?=[^>]*\\sloading=["\']lazy["\'])[^>]*>', flags: 'i' },
          {
            label: 'The boats image has width and height',
            re: '<img(?=[^>]*boats\\.jpg)(?=[^>]*\\swidth=["\']?\\d+)(?=[^>]*\\sheight=["\']?\\d+)[^>]*>',
            flags: 'i',
          },
        ],
        hint: 'Lazy loading is for images further down, never the first one seen. defer stops the script blocking the page.',
        explain: 'A lazy hero image starts loading late and slows the page’s main paint; the lower photo can wait.',
        preview: {},
      },
    ],
  ],
};

export default unit;
