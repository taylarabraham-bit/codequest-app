import type { DesktopUnit } from '../../../engine/types';

// Desktop edition: write-the-code challenges for HTML unit 3 (Lists & images).
// lessons[i] runs after lesson i + 1. See docs/CONTENT_GUIDE.md.
const unit: DesktopUnit = {
  lessons: [
    // L1 Bullet lists
    [
      {
        kind: 'write',
        prompt: 'Write a beach-day packing list with at least three items.',
        starter: '',
        solution: '<h2>Beach bag</h2>\n<ul>\n  <li>Towel</li>\n  <li>Sunscreen</li>\n  <li>Water</li>\n</ul>',
        checks: [
          { label: 'A <ul> list, opened and closed', re: '<ul>[\\s\\S]*</ul>', flags: 'i' },
          { label: 'At least three <li> items inside it', re: '<ul>(\\s*<li>[^<]*\\S[^<]*</li>){3,}\\s*</ul>', flags: 'i' },
        ],
        hint: 'Open <ul>, give each item its own <li>…</li>, then close </ul>.',
        explain: 'ul is the list; each li is one bullet. Only li elements go directly inside a ul.',
        preview: {},
      },
      {
        kind: 'write',
        prompt: 'Fix the merch list so all three items are bullets in one list.',
        starter: '<h2>Band merch</h2>\n<ul>\n  <p>T-shirt</p>\n  <li>Poster</li>\n</ul>\n<li>Tote bag</li>',
        solution: '<h2>Band merch</h2>\n<ul>\n  <li>T-shirt</li>\n  <li>Poster</li>\n  <li>Tote bag</li>\n</ul>',
        checks: [
          { label: 'T-shirt is an <li>, not a <p>', re: '<li>\\s*T-shirt\\s*</li>', flags: 'i' },
          { label: 'Tote bag moves inside the <ul>', re: '<ul>[\\s\\S]*<li>\\s*Tote bag\\s*</li>[\\s\\S]*</ul>', flags: 'i' },
          { label: 'Exactly three <li> items in the list', re: '<ul>(\\s*<li>[^<]*</li>){3}\\s*</ul>', flags: 'i' },
          { label: 'No <p> inside the list', not: '<p>T-shirt' },
        ],
        hint: 'Every item gets <li>…</li>, and all of them sit between <ul> and </ul>.',
        explain: 'A ul may only contain li elements, and an li outside a list is invalid, so each item needs both.',
        preview: {},
      },
    ],
    // L2 Numbered lists
    [
      {
        kind: 'write',
        prompt: 'Write the steps to brew tea as a numbered list.',
        starter: '',
        solution: '<h2>Brew tea</h2>\n<ol>\n  <li>Boil the water</li>\n  <li>Add the tea bag</li>\n  <li>Wait three minutes</li>\n</ol>',
        checks: [
          { label: 'An <ol> list, opened and closed', re: '<ol[^>]*>[\\s\\S]*</ol>', flags: 'i' },
          { label: 'At least three <li> steps in it', re: '<ol[^>]*>(\\s*<li>[^<]*\\S[^<]*</li>){3,}\\s*</ol>', flags: 'i' },
          { label: 'No bullet list here', not: '<ul>' },
        ],
        hint: 'Steps happen in order, so use ol. The browser adds the numbers.',
        explain: 'ol means order matters. Don’t type 1., 2., 3. yourself: the browser numbers each li.',
        preview: {},
      },
      {
        kind: 'write',
        prompt: 'After the break, add a second list that carries on from step 4.',
        starter:
          '<ol>\n  <li>Unpack the parts</li>\n  <li>Attach the legs</li>\n  <li>Fit the shelf</li>\n</ol>\n<p>Coffee break!</p>\n',
        solution:
          '<ol>\n  <li>Unpack the parts</li>\n  <li>Attach the legs</li>\n  <li>Fit the shelf</li>\n</ol>\n<p>Coffee break!</p>\n<ol start="4">\n  <li>Add the doors</li>\n  <li>Tighten every screw</li>\n</ol>',
        checks: [
          { label: 'A new <ol> after the paragraph', re: '</p>\\s*<ol[^>]*>', flags: 'i' },
          { label: 'It starts at 4 with start="4"', re: '</p>\\s*<ol[^>]*\\sstart=["\']?4["\']?[\\s>]', flags: 'i' },
          { label: 'At least two <li> steps in it', re: '</p>\\s*<ol[^>]*>(\\s*<li>[^<]*\\S[^<]*</li>){2,}\\s*</ol>', flags: 'i' },
        ],
        hint: 'A second ol restarts at 1 unless you set start on it.',
        explain: 'start sets the first number, so a list split by other content can keep counting.',
        preview: {},
      },
    ],
    // L3 Nested lists
    [
      {
        kind: 'write',
        prompt: 'Write a to-do list where Weekend has its own sub-list of two jobs.',
        starter: '',
        solution:
          '<ul>\n  <li>Pay rent</li>\n  <li>Weekend\n    <ul>\n      <li>Wash the car</li>\n      <li>Call Gran</li>\n    </ul>\n  </li>\n</ul>',
        checks: [
          { label: 'An outer <ul> list', re: '^\\s*<ul>[\\s\\S]*</ul>\\s*$', flags: 'i' },
          { label: 'A Weekend item', re: '<li>\\s*Weekend', flags: 'i' },
          {
            label: 'A sub-list inside the Weekend <li>, after its text',
            re: '<li>\\s*Weekend\\s*<(ul|ol)>[\\s\\S]*?</\\1>\\s*</li>',
            flags: 'i',
          },
          {
            label: 'Two items in the sub-list',
            re: 'Weekend\\s*<(ul|ol)>(\\s*<li>[^<]*\\S[^<]*</li>){2,}\\s*</\\1>',
            flags: 'i',
          },
        ],
        hint: 'Put the whole inner <ul> inside the Weekend li, before its </li>.',
        explain: 'A nested list belongs to one item, so it lives inside that li and closes before the li does.',
        preview: {},
      },
      {
        kind: 'write',
        prompt: 'Fix the workout: Jog and Stretch belong under Warm up.',
        starter:
          '<ol>\n  <li>Warm up</li>\n  <ul>\n    <li>Jog</li>\n    <li>Stretch</li>\n  </ul>\n  <li>Main set</li>\n</ol>',
        solution:
          '<ol>\n  <li>Warm up\n    <ul>\n      <li>Jog</li>\n      <li>Stretch</li>\n    </ul>\n  </li>\n  <li>Main set</li>\n</ol>',
        checks: [
          { label: 'The <ul> starts inside the Warm up item', re: '<li>\\s*Warm up\\s*<ul>', flags: 'i' },
          { label: 'Close </ul>, then </li>', re: 'Stretch\\s*</li>\\s*</ul>\\s*</li>', flags: 'i' },
          { label: 'Main set stays a step of the <ol>', re: '</ul>\\s*</li>\\s*<li>\\s*Main set\\s*</li>\\s*</ol>', flags: 'i' },
          { label: 'No list sitting straight inside the <ol>', not: '</li><ul>' },
        ],
        hint: 'Move </li> from after Warm up to after the inner </ul>.',
        explain: 'An ol may only hold li elements directly; the sub-list has to sit inside one of them.',
        preview: {},
      },
    ],
    // L4 Images
    [
      {
        kind: 'write',
        prompt: 'Show a 250-pixel-wide photo of your cat, with useful alt text.',
        starter: '',
        solution: '<h2>Meet Biscuit</h2>\n<img src="biscuit.jpg" alt="Ginger cat asleep in a box" width="250">',
        checks: [
          { label: 'An <img> with a src file', re: '<img[^>]*\\ssrc=["\'][^"\']+\\.(jpe?g|png|gif|webp|avif|svg)["\']', flags: 'i' },
          { label: 'alt text that describes it', re: '<img[^>]*\\salt=["\'][^"\']*\\w[^"\']*["\']', flags: 'i' },
          { label: 'width="250", a plain number', re: '<img[^>]*\\swidth=["\']?250["\']?[\\s/>]', flags: 'i' },
          { label: 'No </img> closing tag', not: '</img>' },
        ],
        hint: 'img is empty: <img src="…" alt="…" width="…">, with no closing tag.',
        explain: 'src points at the file, alt is read aloud or shown if it fails, and width is in pixels without px.',
        preview: {},
      },
      {
        kind: 'write',
        prompt: 'Fix the team photos so both images load, describe themselves and size correctly.',
        starter: '<h2>Our team</h2>\n<img href="sam.jpg" width="150px">\n<img src="lee.jpg" alt="Lee at the front desk"></img>',
        solution: '<h2>Our team</h2>\n<img src="sam.jpg" alt="Sam fixing a bike" width="150">\n<img src="lee.jpg" alt="Lee at the front desk">',
        checks: [
          { label: 'Sam’s photo uses src, not href', re: '<img[^>]*\\ssrc=["\']sam\\.jpg["\']', flags: 'i' },
          {
            label: 'Sam’s photo has alt text',
            re: '<img(?=[^>]*\\ssrc=["\']sam\\.jpg["\'])(?=[^>]*\\salt=["\'][^"\']*\\w[^"\']*["\'])[^>]*>',
            flags: 'i',
          },
          { label: 'width="150" without px', re: '<img[^>]*\\swidth=["\']?150["\']?[\\s/>]', flags: 'i' },
          { label: 'No href on images', re: '^(?![\\s\\S]*<img[^>]*\\shref=)[\\s\\S]*<img', flags: 'i' },
          { label: 'No </img> closing tag', not: '</img>' },
        ],
        hint: 'Images use src. width is just a number. img never closes.',
        explain: 'href belongs to links, so an img with href shows nothing. width counts pixels already, so px is invalid.',
        preview: {},
      },
    ],
    // L5 Figures & image links
    [
      {
        kind: 'write',
        prompt: 'Show a photo of a bridge with a caption underneath.',
        starter: '',
        solution: '<figure>\n  <img src="bridge.jpg" alt="Stone bridge over a river in fog">\n  <figcaption>Old Mill Bridge, built 1820</figcaption>\n</figure>',
        checks: [
          { label: 'A <figure> wraps everything', re: '^\\s*<figure>[\\s\\S]*</figure>\\s*$', flags: 'i' },
          { label: 'An <img> with alt text inside it', re: '<figure>[\\s\\S]*<img[^>]*\\salt=["\'][^"\']*\\w[^"\']*["\'][\\s\\S]*</figure>', flags: 'i' },
          { label: 'A <figcaption> with text', re: '<figcaption>\\s*\\S[\\s\\S]*?</figcaption>\\s*</figure>', flags: 'i' },
        ],
        hint: 'figure holds the img and a figcaption; the caption goes last to sit underneath.',
        explain: 'figure ties a caption to its image, so the two are understood as one unit.',
        preview: {},
      },
      {
        kind: 'write',
        prompt: 'Make the fox photo a captioned link to the full-size picture.',
        starter: '<img src="fox-small.jpg" alt="Red fox in snow">',
        solution:
          '<figure>\n  <a href="fox-large.jpg">\n    <img src="fox-small.jpg" alt="Red fox in snow">\n  </a>\n  <figcaption>Tap for the full-size photo</figcaption>\n</figure>',
        checks: [
          {
            label: 'An <a href> wraps the img',
            re: '<a[^>]*\\shref=["\'][^"\']+["\'][^>]*>\\s*<img[^>]*fox-small\\.jpg[^>]*>\\s*</a>',
            flags: 'i',
          },
          { label: 'A <figure> wraps the link', re: '<figure>[\\s\\S]*<a[\\s\\S]*</a>[\\s\\S]*</figure>', flags: 'i' },
          { label: 'A <figcaption> inside the figure', re: '<figure>[\\s\\S]*<figcaption>\\s*\\S[\\s\\S]*?</figcaption>[\\s\\S]*</figure>', flags: 'i' },
          { label: 'Keep the alt text', re: '<img[^>]*\\salt=["\'][^"\']*\\w[^"\']*["\']', flags: 'i' },
        ],
        hint: 'Wrap the img in <a href="…">…</a>, then put that and a figcaption in a figure.',
        explain: 'An image inside a link is clickable, and the link’s name comes from the image’s alt text.',
        preview: {},
      },
    ],
  ],
};

export default unit;
