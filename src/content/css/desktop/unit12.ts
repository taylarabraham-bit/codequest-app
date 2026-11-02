import type { DesktopUnit } from '../../../engine/types';

// Desktop edition: write-the-code challenges for CSS unit 12 (Transforms, filters & effects).
// lessons[i] runs after lesson i + 1. See docs/CONTENT_GUIDE.md.

const CARD =
  '<div class="card" style="width:200px;padding:12px;margin:16px;background:#fff;border-radius:8px"><h2 style="margin:0">Trail Shoes</h2><p>$89, free returns</p></div>';
const BTN = '<div style="padding:16px"><button class="btn" style="padding:8px 16px;border:0;border-radius:6px;background:#3c9;color:#fff">Jump!</button></div>';
const BANNER =
  '<div class="banner" style="padding:24px;color:#fff;font-weight:bold">Sunset Cruise 🌅</div><div class="orb" style="width:80px;height:80px;border-radius:50%;margin:12px"></div>';
const PROGRESS = '<p>Upload: 70%</p><div class="progress" style="height:16px;border-radius:8px;border:1px solid #999"></div>';
const SIGN =
  '<div style="padding:24px"><div class="sign" style="display:inline-block;padding:8px 16px;background:#8b5a2b;color:#fff;font-weight:bold">OPEN</div></div>';
const CARDS =
  '<div style="padding:20px"><div class="card" style="display:inline-block;width:120px;padding:12px;background:#fde;border-radius:6px">🎟️ Gig ticket</div></div>';
const PHOTOS =
  '<img class="old" alt="" src="data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 width=%27160%27 height=%27100%27%3E%3Crect width=%27160%27 height=%2750%27 fill=%27%2387ceeb%27/%3E%3Crect y=%2750%27 width=%27160%27 height=%2750%27 fill=%27%233cb371%27/%3E%3Ccircle cx=%27120%27 cy=%2730%27 r=%2714%27 fill=%27gold%27/%3E%3C/svg%3E">';
const GLASS =
  '<div style="height:150px;background:linear-gradient(135deg,#f6a,#6af);padding-top:20px"><nav class="nav" style="padding:10px;display:flex;gap:12px"><a href="#">Home</a><a href="#">Menu</a><a class="off" href="#">Bookings</a></nav><p style="font-size:40px;margin:0">🌴🍹🏝️</p></div>';
const AVATAR =
  '<div class="avatar" style="width:90px;height:90px;background:linear-gradient(#fc6,#f66)"></div><div class="flag" style="width:160px;padding:8px;background:teal;color:#fff;margin-top:8px">Best seller</div>';
const POSTER =
  '<div style="padding:16px;background:repeating-linear-gradient(45deg,#ffd54f 0 12px,#4fc3f7 12px 24px)"><h1 class="title" style="font-size:44px;margin:0">JAZZ FEST</h1><div class="photo" style="height:60px;background:#333"></div></div>';

const unit: DesktopUnit = {
  lessons: [
    // L1 Shadows
    [
      {
        kind: 'write',
        prompt: 'Lift the product card with a soft shadow and give its heading a text shadow.',
        starter: '',
        solution: '.card {\n  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);\n}\nh2 {\n  text-shadow: 1px 1px 0 gold;\n}',
        checks: [
          { label: 'A box-shadow on .card with offsets, blur and a color', re: '\\.card\\s*\\{[^}]*box-shadow\\s*:[^;}]*\\d[^;}]*\\s[^;}]*\\d', flags: 'i' },
          { label: 'A text-shadow on the h2', re: 'h2\\s*\\{[^}]*text-shadow\\s*:[^;}]*\\d', flags: 'i' },
        ],
        hint: 'box-shadow: x y blur color, for example 0 4px 12px gray.',
        explain: 'A small y offset with a wide blur looks like the card floats above the page.',
        preview: { html: CARD },
      },
      {
        kind: 'write',
        prompt: 'Make the button look pressed when clicked and add a double focus ring.',
        starter: '.btn {\n  box-shadow: 0 4px 0 #2a6;\n}\n',
        solution:
          '.btn {\n  box-shadow: 0 4px 0 #2a6;\n}\n.btn:active {\n  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.4);\n}\n.btn:focus-visible {\n  outline: none;\n  box-shadow: 0 0 0 2px white, 0 0 0 4px #2a6;\n}',
        checks: [
          { label: 'An inset box-shadow on .btn:active', re: ':active\\s*\\{[^}]*box-shadow\\s*:[^;}]*\\binset\\b', flags: 'i' },
          { label: 'Two shadows, separated by a comma, on .btn:focus-visible', re: ':focus-visible\\s*\\{[^}]*box-shadow\\s*:[^;}]*\\d[^;}]*,[^;}]*\\d', flags: 'i' },
          { label: 'Use spread (a 4th length) for the ring', re: ':focus-visible\\s*\\{[^}]*box-shadow\\s*:[^;}]*?(^|[\\s:,])-?[\\d.]+\\w*\\s+-?[\\d.]+\\w*\\s+[\\d.]+\\w*\\s+[\\d.]+\\w*', flags: 'i' },
        ],
        hint: 'inset moves the shadow inside. For a ring, use 0 0 0 2px: no offset, no blur, just spread.',
        explain: 'Stacked spread shadows draw crisp rings, and inset makes the button look pushed in.',
        preview: { html: BTN },
      },
    ],
    // L2 Gradients
    [
      {
        kind: 'write',
        prompt: 'Paint the banner with a sunset linear gradient and the orb with a radial one.',
        starter: '',
        solution:
          '.banner {\n  background-image: linear-gradient(to right, orange, purple);\n}\n.orb {\n  background-image: radial-gradient(circle, white, navy);\n}',
        checks: [
          { label: 'A linear-gradient() on .banner', re: '\\.banner\\s*\\{[^}]*background(-image)?\\s*:\\s*linear-gradient\\(', flags: 'i' },
          { label: 'A radial-gradient() on .orb', re: '\\.orb\\s*\\{[^}]*background(-image)?\\s*:\\s*radial-gradient\\(', flags: 'i' },
          { label: 'Not in background-color (a gradient is an image)', re: '^(?![\\s\\S]*background-color\\s*:\\s*(linear|radial)-gradient)', flags: 'i' },
        ],
        hint: 'Use background-image or background. Give each gradient at least two colors.',
        explain: 'Gradients are generated images, so they live in background-image, never background-color.',
        preview: { html: BANNER },
      },
      {
        kind: 'write',
        prompt: 'Fix the progress bar so it shows a hard edge at 70%.',
        starter: '.progress {\n  background-color: linear-gradient(to right, seagreen, #ddd);\n}\n',
        solution: '.progress {\n  background-image: linear-gradient(to right, seagreen 70%, #ddd 70%);\n}',
        checks: [
          { label: 'Use background-image (or background)', re: '\\.progress\\s*\\{[^}]*background(-image)?\\s*:\\s*linear-gradient\\(', flags: 'i' },
          { label: 'Left to right', re: 'linear-gradient\\(\\s*(to\\s+right|90deg)', flags: 'i' },
          { label: 'Both colors stop at 70%', re: 'linear-gradient\\([^;]*\\s70%[^;]*\\s70%', flags: 'i' },
          { label: 'No gradient in background-color', not: 'background-color: linear-gradient' },
        ],
        hint: 'When two stops sit at the same spot, the colors switch with no blend.',
        explain: 'Matching stop positions give a sharp line instead of a fade, perfect for a progress bar.',
        preview: { html: PROGRESS },
      },
    ],
    // L3 Pivots & single transforms
    [
      {
        kind: 'write',
        prompt: 'Hang the shop sign from its top edge, tilt it, and grow it on hover.',
        starter: '',
        solution: '.sign {\n  transform-origin: top center;\n  rotate: 8deg;\n}\n.sign:hover {\n  scale: 1.1;\n}',
        checks: [
          { label: 'transform-origin at the top', re: 'transform-origin\\s*:\\s*([^;}]*\\s)?top\\b', flags: 'i' },
          { label: 'Tilt it with the rotate property', re: '(?<![\\w-])rotate\\s*:\\s*-?[\\d.]+(deg|turn|rad|grad)', flags: 'i' },
          { label: 'Grow it on :hover with the scale property', re: ':hover\\s*\\{[^}]*(?<![\\w-])scale\\s*:\\s*[\\d.]', flags: 'i' },
        ],
        hint: 'Use the separate rotate and scale properties, not transform.',
        explain: 'With the origin at the top, the sign swings like it hangs from a hook.',
        preview: { html: SIGN },
      },
      {
        kind: 'write',
        prompt: 'The hover wipes out the card’s tilt. Rewrite it with single transform properties.',
        starter: '.card {\n  transform: rotate(-3deg);\n}\n.card:hover {\n  transform: scale(1.1);\n}\n',
        solution: '.card {\n  rotate: -3deg;\n}\n.card:hover {\n  scale: 1.1;\n  translate: 0 -4px;\n}',
        checks: [
          { label: 'Tilt .card with the rotate property', re: '\\.card\\s*\\{[^}]*(?<![\\w-])rotate\\s*:\\s*-?[\\d.]+deg', flags: 'i' },
          { label: 'Scale it on :hover with the scale property', re: ':hover\\s*\\{[^}]*(?<![\\w-])scale\\s*:', flags: 'i' },
          { label: 'Also lift it on :hover with translate', re: ':hover\\s*\\{[^}]*(?<![\\w-])translate\\s*:', flags: 'i' },
          { label: 'No transform shorthand left', not: 'transform:' },
        ],
        hint: 'rotate, scale and translate are separate properties, so one can change without resetting the others.',
        explain: 'transform is one value, so the hover replaced the tilt. Single properties combine instead.',
        preview: { html: CARDS },
      },
    ],
    // L4 Filters & opacity
    [
      {
        kind: 'write',
        prompt: 'Make the old photo gray and a little bright, then full color on hover.',
        starter: '',
        solution: 'img.old {\n  filter: grayscale(1) brightness(1.1);\n}\nimg.old:hover {\n  filter: none;\n}',
        checks: [
          { label: 'Two filters, separated by a space, one of them grayscale()', re: '(?<![\\w-])filter\\s*:(?=[^;}]*grayscale\\()[^;}]*\\)\\s+[a-z-]+\\(', flags: 'i' },
          { label: 'A different filter on :hover', re: ':hover\\s*\\{[^}]*(?<![\\w-])filter\\s*:', flags: 'i' },
        ],
        hint: 'List filter functions with spaces, no commas: filter: grayscale(1) brightness(1.1);',
        explain: 'filter runs the effects left to right, and filter: none brings the original back.',
        preview: { html: PHOTOS },
      },
      {
        kind: 'write',
        prompt: 'Turn the nav into frosted glass and fade the unavailable link.',
        starter: '.nav {\n  background-color: white;\n}\n',
        solution:
          '.nav {\n  background-color: rgba(255, 255, 255, 0.4);\n  backdrop-filter: blur(8px);\n}\n.nav .off {\n  opacity: 0.5;\n}',
        checks: [
          { label: 'A see-through background on .nav', re: '\\.nav\\s*\\{[^}]*background(-color)?\\s*:\\s*([a-z]+\\([^)]*(,|\\/)\\s*(0?\\.\\d+|\\d{1,2}%)\\s*\\)|#[0-9a-f]{8}\\b|#[0-9a-f]{4}\\b)', flags: 'i' },
          { label: 'Blur what shows through with backdrop-filter', re: 'backdrop-filter\\s*:\\s*blur\\(', flags: 'i' },
          { label: 'Fade .off with opacity below 1', re: '\\.off\\s*\\{[^}]*opacity\\s*:\\s*(0?\\.\\d+|\\d{1,2}%)', flags: 'i' },
        ],
        hint: 'backdrop-filter needs a background you can see through, like rgba(255, 255, 255, 0.4).',
        explain: 'backdrop-filter blurs the page behind the box, but only if its own background lets it show.',
        preview: { html: GLASS },
      },
    ],
    // L5 Clipping & blending
    [
      {
        kind: 'write',
        prompt: 'Cut the avatar into a circle and give the flag a notched tail.',
        starter: '',
        solution:
          '.avatar {\n  clip-path: circle(50%);\n}\n.flag {\n  clip-path: polygon(0 0, 100% 0, 90% 50%, 100% 100%, 0 100%);\n}',
        checks: [
          { label: 'clip-path: circle() on .avatar', re: '\\.avatar\\s*\\{[^}]*clip-path\\s*:\\s*circle\\(', flags: 'i' },
          { label: 'clip-path: polygon() with at least 4 points on .flag', re: '\\.flag\\s*\\{[^}]*clip-path\\s*:\\s*polygon\\(([^,)]+,){3,}[^,)]+\\)', flags: 'i' },
        ],
        hint: 'Each polygon point is x y, and commas separate the points. Go around the shape in order.',
        explain: 'clip-path hides everything outside the shape, so the box keeps its size but shows a new outline.',
        preview: { html: AVATAR },
      },
      {
        kind: 'write',
        prompt: 'Blend the poster title into the stripes and trim the photo’s edges.',
        starter: '.title {\n  color: crimson;\n}\n',
        solution: '.title {\n  color: crimson;\n  mix-blend-mode: multiply;\n}\n.photo {\n  clip-path: inset(8px round 6px);\n}',
        checks: [
          { label: 'A mix-blend-mode on .title (not normal)', re: '\\.title\\s*\\{[^}]*mix-blend-mode\\s*:\\s*(?!normal)[a-z-]+', flags: 'i' },
          { label: 'Trim .photo with clip-path: inset()', re: '\\.photo\\s*\\{[^}]*clip-path\\s*:\\s*inset\\(', flags: 'i' },
        ],
        hint: 'multiply darkens with the stripes; screen lightens. inset(8px) cuts 8px off each side.',
        explain: 'Blending mixes the text’s colors with the background, and inset() crops a box without changing layout.',
        preview: { html: POSTER },
      },
    ],
  ],
};

export default unit;
