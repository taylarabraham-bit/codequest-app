import type { DesktopUnit } from '../../../engine/types';

// Desktop edition: write-the-code challenges for HTML unit 19 (Email-safe HTML).
// lessons[i] runs after lesson i + 1. See docs/CONTENT_GUIDE.md.
const TABLE_RESET = '<table(?=[^>]*\\sborder="0")(?=[^>]*\\scellpadding="0")(?=[^>]*\\scellspacing="0")';

const unit: DesktopUnit = {
  lessons: [
    // L1 Tables for layout
    [
      {
        kind: 'write',
        prompt: 'Lay out a 600-wide, two-column newsletter row with a layout table.',
        starter: '',
        solution:
          '<table role="presentation" width="600" border="0" cellpadding="0" cellspacing="0">\n  <tr>\n    <td width="300">Fresh this week: blood oranges</td>\n    <td width="300">Recipe: citrus salad</td>\n  </tr>\n</table>',
        checks: [
          { label: 'A <table role="presentation">', re: '<table[^>]*\\srole="presentation"', flags: 'i' },
          { label: 'width="600" on the table', re: '<table[^>]*\\swidth="600"', flags: 'i' },
          { label: 'border, cellpadding and cellspacing set to 0', re: TABLE_RESET, flags: 'i' },
          { label: 'One row with two cells', re: '<tr>\\s*<td[^>]*>[^<]*\\S[\\s\\S]*?</td>\\s*<td[^>]*>[^<]*\\S[\\s\\S]*?</td>\\s*</tr>', flags: 'i' },
        ],
        hint: 'table > tr > two td. role="presentation" and the three zeros go on the table tag.',
        explain: 'Tables are the one layout tool every email app agrees on. role="presentation" stops screen readers announcing a data table.',
        preview: {},
      },
      {
        kind: 'write',
        prompt: 'Outlook ignores this flexbox header. Rebuild it as a layout table.',
        starter: '<div style="display:flex; width:600px;">\n  <div>Logo</div>\n  <div>View in browser</div>\n</div>',
        solution:
          '<table role="presentation" width="600" border="0" cellpadding="0" cellspacing="0">\n  <tr>\n    <td>Logo</td>\n    <td align="right">View in browser</td>\n  </tr>\n</table>',
        checks: [
          { label: 'No flexbox left', not: 'display:flex' },
          { label: 'A presentation table', re: '<table[^>]*\\srole="presentation"', flags: 'i' },
          { label: 'Reset border, cellpadding and cellspacing to 0', re: TABLE_RESET, flags: 'i' },
          { label: 'Logo and View in browser in two cells of one row', re: '<tr>\\s*<td[^>]*>\\s*Logo\\s*</td>\\s*<td[^>]*>\\s*View in browser\\s*</td>\\s*</tr>', flags: 'i' },
        ],
        hint: 'Each flex child becomes a td in one tr. Put the width on the table as an attribute.',
        explain: 'Outlook on Windows renders with Word’s engine, which knows tables but not flexbox, so the table keeps the two side by side.',
        preview: {},
      },
    ],
    // L2 Inline styles & widths
    [
      {
        kind: 'write',
        prompt: 'Write a teal banner cell with inline styles and a bgcolor fallback.',
        starter: '',
        solution:
          '<table role="presentation" width="600" border="0" cellpadding="0" cellspacing="0">\n  <tr>\n    <td bgcolor="#0f766e" style="background:#0f766e; color:#ffffff; padding:24px; font-size:22px;">\n      Your plant order has shipped\n    </td>\n  </tr>\n</table>',
        checks: [
          { label: 'A presentation table around the cell', re: '<table[^>]*\\srole="presentation"[\\s\\S]*<td', flags: 'i' },
          { label: 'A bgcolor hex on the td', re: '<td[^>]*\\sbgcolor="#[0-9a-f]{3,6}"', flags: 'i' },
          {
            label: 'The same colour as background in style',
            re: '<td[^>]*\\sbgcolor="(#[0-9a-f]{3,6})"[^>]*\\sstyle="[^"]*background(?:-color)?\\s*:\\s*\\1|<td[^>]*\\sstyle="[^"]*background(?:-color)?\\s*:\\s*(#[0-9a-f]{3,6})[^>]*\\sbgcolor="\\2"',
            flags: 'i',
          },
          { label: 'A text color in the style', re: '<td[^>]*\\sstyle="([^"]*;)?\\s*color\\s*:', flags: 'i' },
          { label: 'Padding in the style', re: '<td[^>]*\\sstyle="[^"]*padding\\s*:', flags: 'i' },
        ],
        hint: 'bgcolor="#…" and style="background:#…; color:…; padding:…" both go on the td.',
        explain: 'Some apps drop CSS backgrounds, so bgcolor is the fallback. Inline styles survive apps that strip style blocks.',
        preview: {},
      },
      {
        kind: 'write',
        prompt: 'Some inboxes strip the style block. Move every style inline.',
        starter:
          '<style>\n  .title { font-size: 24px; color: #111827; }\n  .note { color: #6b7280; }\n</style>\n<table role="presentation" width="600" border="0" cellpadding="0" cellspacing="0">\n  <tr><td class="title">Your receipt</td></tr>\n  <tr><td class="note">Order #4471, paid by card</td></tr>\n</table>',
        solution:
          '<table role="presentation" width="600" border="0" cellpadding="0" cellspacing="0">\n  <tr><td style="font-size:24px; color:#111827;">Your receipt</td></tr>\n  <tr><td style="color:#6b7280;">Order #4471, paid by card</td></tr>\n</table>',
        checks: [
          { label: 'No <style> block left', not: '<style' },
          {
            label: 'Title cell: font-size 24px and color #111827 inline',
            re: '<td[^>]*\\sstyle="(?=[^"]*font-size\\s*:\\s*24px)(?=[^"]*color\\s*:\\s*#111827)[^"]*"[^>]*>\\s*Your receipt',
            flags: 'i',
          },
          { label: 'Note cell: color #6b7280 inline', re: '<td[^>]*\\sstyle="[^"]*color\\s*:\\s*#6b7280[^"]*"[^>]*>\\s*Order', flags: 'i' },
        ],
        hint: 'Copy each rule’s declarations into a style="…" on the matching td, then delete the style block.',
        explain: 'An inline style travels with its element, so it survives even when the head and style blocks are thrown away.',
        preview: {},
      },
    ],
    // L3 When images are blocked
    [
      {
        kind: 'write',
        prompt: 'Add an email hero image that still makes sense when images are off.',
        starter: '',
        solution:
          '<img src="https://mail.example/fall-boots.jpg" width="600" height="300"\n  alt="New fall boots: 20% off until Sunday"\n  style="display:block; color:#7c2d12; font-size:18px;">',
        checks: [
          { label: 'Alt text that tells the message', re: '<img[^>]*\\salt="[^"]{12,}"', flags: 'i' },
          { label: 'width and height as numbers', re: '<img(?=[^>]*\\swidth="\\d+")(?=[^>]*\\sheight="\\d+")', flags: 'i' },
          { label: 'display:block in the style', re: '<img[^>]*\\sstyle="[^"]*display\\s*:\\s*block', flags: 'i' },
          { label: 'A color for the alt text', re: '<img[^>]*\\sstyle="([^"]*;)?\\s*color\\s*:', flags: 'i' },
        ],
        hint: 'Write the alt as if it were the image: the offer itself, not “banner”.',
        explain: 'With images blocked, the reader sees the styled alt text in a box of the right size, so the offer still lands.',
        preview: {},
      },
      {
        kind: 'write',
        prompt: 'Make both images survive blocking: real alt text, fixed sizes, no gaps.',
        starter:
          '<table role="presentation" width="600" border="0" cellpadding="0" cellspacing="0">\n  <tr><td><img src="logo.png"></td></tr>\n  <tr><td><img src="sale-banner.jpg" alt="banner"></td></tr>\n</table>',
        solution:
          '<table role="presentation" width="600" border="0" cellpadding="0" cellspacing="0">\n  <tr><td><img src="logo.png" alt="Pine and Pebble" width="160" height="48" style="display:block;"></td></tr>\n  <tr><td><img src="sale-banner.jpg" alt="Winter sale: everything 30% off" width="600" height="250" style="display:block;"></td></tr>\n</table>',
        checks: [
          { label: 'Real alt text on both images', re: '^(?![\\s\\S]*<img(?![^>]*\\salt="[^"]{3,}")[^>]*>)[\\s\\S]*<img[\\s\\S]*<img', flags: 'i' },
          { label: 'Not just alt="banner"', not: 'alt="banner"' },
          {
            label: 'width and height on both',
            re: '^(?![\\s\\S]*<img(?!(?=[^>]*\\swidth="\\d+")(?=[^>]*\\sheight="\\d+"))[^>]*>)[\\s\\S]*<img[\\s\\S]*<img',
            flags: 'i',
          },
          { label: 'display:block on both', re: '^(?![\\s\\S]*<img(?![^>]*display\\s*:\\s*block)[^>]*>)[\\s\\S]*<img[\\s\\S]*<img', flags: 'i' },
        ],
        hint: 'Each img needs alt, width, height and style="display:block;".',
        explain: 'Sizes stop the layout collapsing, display:block removes the gap under each image, and alt carries the message.',
        preview: {},
      },
    ],
    // L4 Preheader & fonts
    [
      {
        kind: 'write',
        prompt: 'Start a class-update email with a hidden preheader, then a web-safe font cell.',
        starter: '',
        solution:
          '<div style="display:none; max-height:0; overflow:hidden;">\n  Your yoga class moved to 7 pm tonight.\n</div>\n<table role="presentation" width="600" border="0" cellpadding="0" cellspacing="0">\n  <tr>\n    <td style="font-family:Georgia, \'Times New Roman\', serif; font-size:16px;">\n      Hi Priya, tonight’s Flow class now starts at 7 pm.\n    </td>\n  </tr>\n</table>',
        checks: [
          { label: 'A hidden preheader div first', re: '^\\s*<div[^>]*\\sstyle="[^"]*display\\s*:\\s*none[^"]*"[^>]*>\\s*\\S[\\s\\S]*?</div>', flags: 'i' },
          {
            label: 'It also has max-height:0 and overflow:hidden',
            re: '<div[^>]*\\sstyle="(?=[^"]*max-height\\s*:\\s*0)(?=[^"]*overflow\\s*:\\s*hidden)',
            flags: 'i',
          },
          {
            label: 'A font-family with a web-safe font',
            re: 'font-family\\s*:[^;"]*\\b(Arial|Helvetica|Georgia|Verdana|Tahoma|Times New Roman|Trebuchet MS)\\b',
            flags: 'i',
          },
          { label: 'The stack ends with serif or sans-serif', re: 'font-family\\s*:[^;"]*,\\s*(sans-serif|serif)\\s*(;|")', flags: 'i' },
        ],
        hint: 'The preheader div comes first in the body. Fonts go in a font-family list, generic family last.',
        explain: 'Inboxes show the preheader beside the subject line. Web-safe fonts are installed almost everywhere, so the email looks as planned.',
        preview: {},
      },
      {
        kind: 'write',
        prompt: 'Move the preheader to the top and hide it; give the font web-safe fallbacks.',
        starter:
          '<h1 style="font-family:\'Playfair Display\';">Spring menu</h1>\n<p>Five new dishes, starting Monday.</p>\n<div>Book now: the new menu starts Monday.</div>',
        solution:
          '<div style="display:none; max-height:0; overflow:hidden;">Book now: the new menu starts Monday.</div>\n<h1 style="font-family:\'Playfair Display\', Georgia, serif;">Spring menu</h1>\n<p>Five new dishes, starting Monday.</p>',
        checks: [
          { label: 'The preheader comes first, hidden', re: '^\\s*<div[^>]*\\sstyle="[^"]*display\\s*:\\s*none[^"]*"[^>]*>\\s*Book now', flags: 'i' },
          { label: 'The preheader appears only once', re: '^(?![\\s\\S]*Book now[\\s\\S]*Book now)' },
          {
            label: 'Playfair Display, then a web-safe font, then a generic family',
            re: 'font-family\\s*:\\s*[\'"]?Playfair Display[\'"]?\\s*,[^;"]*\\b(Georgia|Times New Roman|Times|Arial|Helvetica|Verdana)\\b[^;"]*,\\s*(serif|sans-serif)\\s*(;|")',
            flags: 'i',
          },
        ],
        hint: 'Cut the div and paste it above the h1 with display:none. Add fonts after Playfair Display, separated by commas.',
        explain: 'Apps that can’t load Playfair Display fall back to Georgia, then to any serif, instead of a random default.',
        preview: {},
      },
    ],
    // L5 Bulletproof buttons
    [
      {
        kind: 'write',
        prompt: 'Build a bulletproof Track parcel button.',
        starter: '',
        solution:
          '<table role="presentation" border="0" cellpadding="0" cellspacing="0">\n  <tr>\n    <td bgcolor="#16a34a" style="border-radius:6px;">\n      <a href="https://parcel.example/track/8812" style="display:inline-block; padding:12px 24px; color:#ffffff; text-decoration:none; font-family:Arial, sans-serif;">Track parcel</a>\n    </td>\n  </tr>\n</table>',
        checks: [
          { label: 'A presentation table', re: '<table[^>]*\\srole="presentation"', flags: 'i' },
          { label: 'A td with a bgcolor', re: '<td[^>]*\\sbgcolor="#[0-9a-f]{3,6}"', flags: 'i' },
          { label: 'A link inside the td that says Track parcel', re: '<td[^>]*>\\s*<a[^>]*\\shref="https?://[^"]+"[^>]*>\\s*Track parcel\\s*</a>', flags: 'i' },
          {
            label: 'The link has display:inline-block and padding',
            re: '<a[^>]*\\sstyle="(?=[^"]*display\\s*:\\s*inline-block)(?=[^"]*padding\\s*:)',
            flags: 'i',
          },
          { label: 'No underline: text-decoration:none', re: '<a[^>]*\\sstyle="[^"]*text-decoration\\s*:\\s*none', flags: 'i' },
        ],
        hint: 'The cell paints the colour; the padded inline-block link makes the whole button clickable.',
        explain: 'No images are involved, so the button shows even when images are blocked, and every email app follows a plain link.',
        preview: {},
      },
      {
        kind: 'write',
        prompt: 'Email apps strip forms. Turn this RSVP into a bulletproof link button.',
        starter:
          '<form action="https://club.example/rsvp">\n  <button style="background:#9333ea; color:#fff; padding:12px 20px;">RSVP now</button>\n</form>',
        solution:
          '<table role="presentation" border="0" cellpadding="0" cellspacing="0">\n  <tr>\n    <td bgcolor="#9333ea" style="border-radius:6px;">\n      <a href="https://club.example/rsvp" style="display:inline-block; padding:12px 20px; color:#ffffff; text-decoration:none;">RSVP now</a>\n    </td>\n  </tr>\n</table>',
        checks: [
          { label: 'No <form> left', not: '<form' },
          { label: 'No <button> left', not: '<button' },
          { label: 'A presentation table', re: '<table[^>]*\\srole="presentation"', flags: 'i' },
          { label: 'A td with bgcolor="#9333ea"', re: '<td[^>]*\\sbgcolor="#9333ea"', flags: 'i' },
          { label: 'A link to the RSVP page saying RSVP now', re: '<a[^>]*\\shref="https://club\\.example/rsvp"[^>]*>\\s*RSVP now\\s*</a>', flags: 'i' },
          { label: 'The link is padded', re: '<a[^>]*\\sstyle="[^"]*padding\\s*:', flags: 'i' },
        ],
        hint: 'The form’s action becomes the link’s href; the button’s colour moves to the td’s bgcolor.',
        explain: 'Links work in every inbox, forms don’t. The RSVP itself happens on the web page the link opens.',
        preview: {},
      },
    ],
  ],
};

export default unit;
