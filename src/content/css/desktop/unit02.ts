import type { DesktopUnit } from '../../../engine/types';

// Desktop edition: write-the-code challenges for CSS unit 2 (Colors & text).
// lessons[i] runs after lesson i + 1. See docs/CONTENT_GUIDE.md.
const unit: DesktopUnit = {
  lessons: [
    // L1 Names and hex codes
    [
      {
        kind: 'write',
        prompt: 'Color a tide chart: a hex color for h1, a named background for .high.',
        starter: '',
        solution: 'h1 {\n  color: #1e3a8a;\n}\n.high {\n  background-color: lightblue;\n}',
        checks: [
          {
            label: 'h1 color as a hex code, like #1e3a8a',
            re: 'h1\\s*\\{[^}]*(?<![\\w-])color\\s*:\\s*#([0-9a-f]{6}|[0-9a-f]{3})(?![0-9a-f])',
            flags: 'i',
          },
          { label: '.high background-color as a color name', re: '\\.high\\s*\\{[^}]*background-color\\s*:\\s*[a-z]+\\s*[;}]', flags: 'i' },
        ],
        hint: 'A hex code is # plus 3 or 6 digits from 0–9 and a–f. Names are plain words like lightblue.',
        explain: 'Hex gives you exact brand colors; names are handy for quick, readable choices.',
        preview: { html: '<h1>Tide Times</h1><p class="high">High tide 06:42</p><p>Low tide 12:55</p>' },
      },
      {
        kind: 'write',
        prompt: 'Shorten every hex code that can be shortened, and leave the rest.',
        starter:
          '.logo {\n  color: #ff0000;\n  background-color: #ffffff;\n}\n.tagline {\n  color: #336699;\n}\n.footer {\n  color: #1a2b3c;\n}',
        solution: '.logo {\n  color: #f00;\n  background-color: #fff;\n}\n.tagline {\n  color: #369;\n}\n.footer {\n  color: #1a2b3c;\n}',
        checks: [
          { label: '#ff0000 becomes #f00', re: '#f00(?![0-9a-f])', flags: 'i' },
          { label: '#ffffff becomes #fff', re: '#fff(?![0-9a-f])', flags: 'i' },
          { label: '#336699 becomes #369', re: '#369(?![0-9a-f])', flags: 'i' },
          { label: 'Keep #1a2b3c: its pairs don’t repeat', has: '#1a2b3c' },
        ],
        hint: 'A pair can shrink only when both digits match: ff → f, 33 → 3. Every pair must match.',
        explain: '#369 is read as #336699. #1a2b3c has mixed pairs, so it has no short form.',
        preview: { html: '<div class="logo">PIXEL</div><p class="tagline">Games for everyone</p><p class="footer">© 2026 Pixel</p>' },
      },
    ],
    // L2 rgb, rgba and hsl
    [
      {
        kind: 'write',
        prompt: 'Style a toast: rgb() text and a see-through rgba() background.',
        starter: '',
        solution: '.toast {\n  color: rgb(20, 83, 45);\n  background-color: rgba(34, 197, 94, 0.3);\n}',
        checks: [
          { label: 'color uses rgb()', re: '\\.toast\\s*\\{[^}]*(?<![\\w-])color\\s*:\\s*rgba?\\(\\s*\\d', flags: 'i' },
          {
            label: 'background-color uses rgba() with an opacity below 1',
            re: '\\.toast\\s*\\{[^}]*background-color\\s*:\\s*rgba\\(\\s*\\d+\\s*,\\s*\\d+\\s*,\\s*\\d+\\s*,\\s*(0?\\.\\d+|0)\\s*\\)',
            flags: 'i',
          },
        ],
        hint: 'rgb takes red, green, blue from 0 to 255. rgba adds a 4th value from 0 to 1.',
        explain: 'The alpha value lets the page show through the background, so the toast looks light and soft.',
        preview: { html: '<p>Your draft is safe.</p><div class="toast">Saved!</div>' },
      },
      {
        kind: 'write',
        prompt: 'Swap each status color name for an hsl() value with a matching hue.',
        starter: '.ok {\n  background-color: green;\n}\n.warn {\n  background-color: orange;\n}\n.bad {\n  background-color: red;\n}',
        solution:
          '.ok {\n  background-color: hsl(120, 60%, 70%);\n}\n.warn {\n  background-color: hsl(35, 100%, 65%);\n}\n.bad {\n  background-color: hsl(0, 80%, 65%);\n}',
        checks: [
          {
            label: '.ok: an hsl() green, hue about 80–160',
            re: '\\.ok\\s*\\{[^}]*background-color\\s*:\\s*hsl\\(\\s*(8\\d|9\\d|1[0-5]\\d|160)(deg)?[\\s,]+\\d+%[\\s,]+\\d+%',
            flags: 'i',
          },
          {
            label: '.warn: an hsl() orange, hue about 20–50',
            re: '\\.warn\\s*\\{[^}]*background-color\\s*:\\s*hsl\\(\\s*([2-4]\\d|50)(deg)?[\\s,]+\\d+%[\\s,]+\\d+%',
            flags: 'i',
          },
          {
            label: '.bad: an hsl() red, hue about 0–15 or 340–360',
            re: '\\.bad\\s*\\{[^}]*background-color\\s*:\\s*hsl\\(\\s*(\\d|1[0-5]|3[4-5]\\d|360)(deg)?[\\s,]+\\d+%[\\s,]+\\d+%',
            flags: 'i',
          },
        ],
        hint: 'Hue is an angle on the color wheel: red 0, orange about 30, green 120. Then saturation % and lightness %.',
        explain: 'With hsl the hue says which color, and lightness lets you make it paler without guessing hex digits.',
        preview: { html: '<p class="ok">Server online</p><p class="warn">Disk 80% full</p><p class="bad">Backup failed</p>' },
      },
    ],
    // L3 Font family and weight
    [
      {
        kind: 'write',
        prompt: 'Set fonts for a news page: a body font stack and a heavy headline.',
        starter: '',
        solution:
          'body {\n  font-family: Georgia, "Times New Roman", serif;\n}\n.headline {\n  font-family: Arial, Helvetica, sans-serif;\n  font-weight: 800;\n}',
        checks: [
          {
            label: 'body font-family: a list ending in a generic family',
            re: 'body\\s*\\{[^}]*font-family\\s*:[^;}]*,\\s*(serif|sans-serif|monospace|system-ui|cursive)\\s*[;}]',
            flags: 'i',
          },
          { label: '.headline sets its own font-family', re: '\\.headline\\s*\\{[^}]*font-family\\s*:\\s*\\S', flags: 'i' },
          { label: '.headline font-weight as a number, like 800', re: '\\.headline\\s*\\{[^}]*font-weight\\s*:\\s*[1-9]00\\s*[;}]', flags: 'i' },
        ],
        hint: 'List fonts with commas, favorite first, and finish with serif or sans-serif.',
        explain: 'If no listed font is installed, the generic family at the end still gives a sensible look.',
        preview: { html: '<h1 class="headline">Comet Spotted Over Oslo</h1><p>Astronomers say it will be visible all week.</p>' },
      },
      {
        kind: 'write',
        prompt: 'Fix the font rules so every value is valid and every stack has a fallback.',
        starter: 'code {\n  font-family: monospace, Consolas;\n  font-weight: heavy;\n}\n.note {\n  font-family: "Segoe UI";\n}',
        solution: 'code {\n  font-family: Consolas, monospace;\n  font-weight: bold;\n}\n.note {\n  font-family: "Segoe UI", sans-serif;\n}',
        checks: [
          { label: 'code: monospace comes last', re: 'code\\s*\\{[^}]*font-family\\s*:[^;}]*,\\s*monospace\\s*[;}]', flags: 'i' },
          { label: 'code: a real font-weight (bold or 100–900)', re: 'code\\s*\\{[^}]*font-weight\\s*:\\s*(bold|bolder|normal|[1-9]00)\\s*[;}]', flags: 'i' },
          { label: 'No heavy weight', not: 'heavy' },
          {
            label: '.note: add a generic fallback',
            re: '\\.note\\s*\\{[^}]*font-family\\s*:[^;}]*,\\s*(sans-serif|serif|system-ui|monospace)\\s*[;}]',
            flags: 'i',
          },
        ],
        hint: 'The generic family goes at the end of the list. font-weight takes bold or a number like 700.',
        explain: 'The browser tries fonts left to right, so a generic first means your favorite is never used.',
        preview: { html: '<p class="note">Tip: press <code>Ctrl+S</code> to save your game.</p>' },
      },
    ],
    // L4 Font sizes
    [
      {
        kind: 'write',
        prompt: 'Size a pricing card: rem for the plan and price, px for the fine print.',
        starter: '',
        solution: '.plan {\n  font-size: 2rem;\n}\n.price {\n  font-size: 1.5rem;\n}\n.fine {\n  font-size: 12px;\n}',
        checks: [
          { label: '.plan font-size in rem', re: '\\.plan\\s*\\{[^}]*font-size\\s*:\\s*\\d*\\.?\\d+rem', flags: 'i' },
          { label: '.price font-size in rem', re: '\\.price\\s*\\{[^}]*font-size\\s*:\\s*\\d*\\.?\\d+rem', flags: 'i' },
          { label: '.fine font-size in px', re: '\\.fine\\s*\\{[^}]*font-size\\s*:\\s*\\d*\\.?\\d+px', flags: 'i' },
        ],
        hint: '1rem is the root size, usually 16px, so 2rem is about 32px.',
        explain: 'rem sizes follow the reader’s font setting; px stays fixed, which suits tiny print you size by hand.',
        preview: { html: '<h2 class="plan">Pro plan</h2><p class="price">$9 / month</p><p class="fine">Cancel any time.</p>' },
      },
      {
        kind: 'write',
        prompt: 'Inside the 20px sidebar, size the h3 at 1.5em and .small below 1em.',
        starter: '.sidebar {\n  font-size: 20px;\n}\n',
        solution: '.sidebar {\n  font-size: 20px;\n}\n.sidebar h3 {\n  font-size: 1.5em;\n}\n.small {\n  font-size: 0.75em;\n}',
        checks: [
          { label: 'Keep .sidebar at 20px', re: '\\.sidebar\\s*\\{[^}]*font-size\\s*:\\s*20px', flags: 'i' },
          { label: 'h3 font-size: 1.5em', re: 'h3\\s*\\{[^}]*font-size\\s*:\\s*1\\.5em', flags: 'i' },
          { label: '.small font-size in em, below 1', re: '\\.small\\s*\\{[^}]*font-size\\s*:\\s*0?\\.\\d+em', flags: 'i' },
        ],
        hint: 'em multiplies the parent’s size: 1.5em of 20px is 30px.',
        explain: 'em follows the parent, so change the sidebar’s size and everything in it scales along.',
        preview: { html: '<div class="sidebar"><h3>Tips</h3><p>Drink water.</p><p class="small">Updated daily</p></div>' },
      },
    ],
    // L5 Align, spacing and lines
    [
      {
        kind: 'write',
        prompt: 'Style a poem: centered title, roomy lines, underlined author.',
        starter: '',
        solution: '.title {\n  text-align: center;\n}\n.poem {\n  line-height: 1.8;\n}\n.author {\n  text-decoration: underline;\n}',
        checks: [
          { label: 'Center .title with text-align', re: '\\.title\\s*\\{[^}]*text-align\\s*:\\s*center', flags: 'i' },
          { label: '.poem line-height as a plain number', re: '\\.poem\\s*\\{[^}]*line-height\\s*:\\s*\\d*\\.?\\d+\\s*[;}]', flags: 'i' },
          { label: 'Underline .author', re: '\\.author\\s*\\{[^}]*text-decoration(-line)?\\s*:[^;}]*underline', flags: 'i' },
        ],
        hint: 'text-align: center; line-height with no unit, like 1.8; text-decoration: underline.',
        explain: 'A unitless line-height scales with the font size, so the spacing stays right if the text grows.',
        preview: {
          html: '<h2 class="title">Tin Roof</h2><p class="poem">Rain on the tin roof,<br>a drum that never tires,<br>a song for the sleepless.</p><p class="author">by M. Reyes</p>',
        },
      },
      {
        kind: 'write',
        prompt: 'Fix the nav: right-aligned, unitless line-height, links without underlines.',
        starter: 'nav {\n  text-align: middle;\n  line-height: 1.6px;\n}\nnav a {\n  text-decoration: underline;\n}',
        solution: 'nav {\n  text-align: right;\n  line-height: 1.6;\n}\nnav a {\n  text-decoration: none;\n}',
        checks: [
          { label: 'Right-align the nav', re: 'nav\\s*\\{[^}]*text-align\\s*:\\s*(right|end)', flags: 'i' },
          { label: 'nav line-height with no unit', re: 'nav\\s*\\{[^}]*line-height\\s*:\\s*\\d*\\.?\\d+\\s*[;}]', flags: 'i' },
          { label: 'Remove the underline from nav a', re: 'nav\\s+a\\s*\\{[^}]*text-decoration\\s*:\\s*none', flags: 'i' },
          { label: 'No middle value', not: 'middle' },
        ],
        hint: 'There’s no middle in text-align. 1.6px is a tiny line; drop the unit.',
        explain: 'text-align takes left, center, right or justify, and text-decoration: none removes link underlines.',
        preview: { html: '<nav><a href="#">Menu</a> · <a href="#">Book</a> · <a href="#">Contact</a></nav><p>Open daily 9–5.</p>' },
      },
    ],
  ],
};

export default unit;
