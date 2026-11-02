import type { DesktopUnit } from '../../../engine/types';

// Desktop edition: write-the-code challenges for CSS unit 16 (Color & theming).
// lessons[i] runs after lesson i + 1. See docs/CONTENT_GUIDE.md.

const STATUS =
  '<span class="ok" style="padding:4px 8px;color:#fff">Online</span> <span class="warn" style="padding:4px 8px;color:#fff">Busy</span> <span class="err" style="padding:4px 8px;color:#fff">Offline</span>';
const HERO =
  '<div style="background:linear-gradient(90deg,#fc6,#6cf);padding:10px"><div class="overlay" style="padding:10px;color:#fff">Night sky tours</div><span class="tag">Sold out soon</span></div>';
const TAG =
  '<span class="tag" style="display:inline-flex;gap:4px;align-items:center;padding:2px 8px"><svg width="12" height="12" viewBox="0 0 12 12"><circle cx="6" cy="6" r="6"/></svg> Vegan</span>';
const SURVEY =
  '<form><label><input type="checkbox" checked> Email me</label><br><label><input type="radio" name="r" checked> Monthly</label><br><input type="range"><br><progress value="60" max="100"></progress><br><label class="danger"><input type="checkbox" checked> Delete my data</label></form>';
const ALERT = '<div class="alert" style="padding:10px">🔔 Your order has shipped.</div>';
const BTNS = '<button class="btn" style="padding:8px 14px;border:0">Pay now</button> <button class="btn" disabled style="padding:8px 14px;border:0">Pay later</button>';
const PAGE = '<h1>Habit tracker</h1><p>Seven days in a row! 🎉</p>';
const CARD =
  '<div class="card" style="padding:12px;width:220px">🍜 Ramen Bar<br><a href="#">See the menu</a></div>';
const FORM =
  '<label>Email<br><input class="field" placeholder="you@mail.com"></label><p class="hint">We never share your address.</p>';
const CHIPS = '<button class="chip" style="padding:4px 10px;border-radius:12px">Vegan</button> <button class="chip" style="padding:4px 10px;border-radius:12px">Gluten free</button>';

const unit: DesktopUnit = {
  lessons: [
    // L1 oklch, the even color space
    [
      {
        kind: 'write',
        prompt: 'Color three status badges in oklch, equally light but different hues.',
        starter: '',
        solution:
          '.ok {\n  background: oklch(0.6 0.15 145);\n}\n.warn {\n  background: oklch(0.6 0.15 70);\n}\n.err {\n  background: oklch(0.6 0.15 25);\n}',
        checks: [
          { label: 'An oklch() background on .ok', re: '\\.ok\\s*\\{[^}]*background(-color)?\\s*:\\s*oklch\\(', flags: 'i' },
          { label: 'An oklch() background on .warn', re: '\\.warn\\s*\\{[^}]*background(-color)?\\s*:\\s*oklch\\(', flags: 'i' },
          { label: 'An oklch() background on .err', re: '\\.err\\s*\\{[^}]*background(-color)?\\s*:\\s*oklch\\(', flags: 'i' },
          { label: 'All three use the same lightness (first number)', re: 'oklch\\(\\s*([\\d.]+%?)\\s[\\s\\S]*oklch\\(\\s*\\1\\s[\\s\\S]*oklch\\(\\s*\\1\\s', flags: 'i' },
        ],
        hint: 'oklch(L C H): keep L the same, change the hue angle H.',
        explain: 'oklch lightness matches what eyes see, so the badges look equally bright and white text reads on all three.',
        preview: { html: STATUS },
      },
      {
        kind: 'write',
        prompt: 'Rewrite the old comma colors in the modern space syntax.',
        starter: '.overlay {\n  background: rgba(0, 0, 0, 0.5);\n}\n.tag {\n  color: hsla(200, 80%, 40%, 0.8);\n}\n',
        solution: '.overlay {\n  background: rgb(0 0 0 / 50%);\n}\n.tag {\n  color: hsl(200 80% 40% / 0.8);\n}',
        checks: [
          { label: '.overlay uses rgb(r g b / alpha)', re: '\\.overlay\\s*\\{[^}]*rgb\\(\\s*\\d+\\s+\\d+\\s+\\d+\\s*/\\s*[\\d.]+%?\\s*\\)', flags: 'i' },
          { label: '.tag uses hsl(h s l / alpha)', re: '\\.tag\\s*\\{[^}]*hsl\\(\\s*[\\d.]+(deg)?\\s+[\\d.]+%\\s+[\\d.]+%\\s*/\\s*[\\d.]+%?\\s*\\)', flags: 'i' },
          { label: 'No rgba()', not: 'rgba(' },
          { label: 'No hsla()', not: 'hsla(' },
        ],
        hint: 'Drop the commas and the a: rgb(0 0 0 / 50%). The slash comes before the alpha.',
        explain: 'Modern rgb() and hsl() take the alpha after a slash, so the old rgba() and hsla() aren’t needed.',
        preview: { html: HERO },
      },
    ],
    // L2 currentColor & accent-color
    [
      {
        kind: 'write',
        prompt: 'Make the vegan tag’s border and icon follow its text color.',
        starter: '',
        solution: '.tag {\n  color: seagreen;\n  border: 2px solid currentColor;\n}\n.tag svg {\n  fill: currentColor;\n}',
        checks: [
          { label: 'A text color on .tag', re: '\\.tag\\s*\\{[^}]*(?<![\\w-])color\\s*:', flags: 'i' },
          { label: 'A border that uses currentColor', re: 'border(-color)?\\s*:[^;}]*currentcolor', flags: 'i' },
          { label: 'The svg fill uses currentColor', re: 'svg\\s*\\{[^}]*fill\\s*:\\s*currentcolor', flags: 'i' },
        ],
        hint: 'currentColor is a keyword you can use anywhere a color goes.',
        explain: 'Change the tag’s color once and the border and icon follow, because they read currentColor.',
        preview: { html: TAG },
      },
      {
        kind: 'write',
        prompt: 'Tint the survey’s controls, make the danger box crimson, and ring focus in currentColor.',
        starter: 'form {\n  color: #333;\n}\n',
        solution:
          'form {\n  color: #333;\n  accent-color: oklch(0.55 0.2 290);\n}\n.danger {\n  color: crimson;\n  accent-color: currentColor;\n}\ninput:focus-visible {\n  outline: 2px solid currentColor;\n}',
        checks: [
          { label: 'accent-color on the form', re: 'form\\s*\\{[^}]*accent-color\\s*:\\s*\\S', flags: 'i' },
          { label: '.danger is crimson text with accent-color: currentColor', re: '\\.danger\\s*\\{(?=[^}]*(?<![\\w-])color\\s*:\\s*crimson)[^}]*accent-color\\s*:\\s*currentcolor', flags: 'i' },
          { label: 'A :focus-visible outline in currentColor', re: ':focus-visible\\s*\\{[^}]*outline(-color)?\\s*:[^;}]*currentcolor', flags: 'i' },
        ],
        hint: 'accent-color inherits, so set it on the form once. Inside .danger, currentColor is crimson.',
        explain: 'accent-color tints native checkboxes, radios, sliders and progress bars with no custom widgets.',
        preview: { html: SURVEY },
      },
    ],
    // L3 Mixing & relative colors
    [
      {
        kind: 'write',
        prompt: 'Tint the shipping alert from a --brand token mixed with white.',
        starter: '',
        solution:
          ':root {\n  --brand: teal;\n}\n.alert {\n  background: color-mix(in oklch, var(--brand) 15%, white);\n  border: 1px solid var(--brand);\n}',
        checks: [
          { label: 'A --brand custom property', re: '--brand\\s*:\\s*\\S', flags: 'i' },
          { label: 'A color-mix(in …) of var(--brand) with a percent', re: 'color-mix\\(\\s*in\\s+[\\w-]+\\s*,[^;]*var\\(\\s*--brand\\s*\\)[^;]*\\d+%', flags: 'i' },
          { label: 'A border in var(--brand)', re: 'border(-color)?\\s*:[^;}]*var\\(\\s*--brand\\s*\\)', flags: 'i' },
        ],
        hint: 'color-mix(in oklch, var(--brand) 15%, white): the percent is how much of the first color.',
        explain: 'Mixing from the token means a new brand color retints the alert automatically.',
        preview: { html: ALERT },
      },
      {
        kind: 'write',
        prompt: 'Darken the button on hover and fade it when disabled, with relative colors.',
        starter: ':root {\n  --brand: oklch(0.6 0.18 150);\n}\n.btn {\n  background: var(--brand);\n  color: white;\n}\n',
        solution:
          ':root {\n  --brand: oklch(0.6 0.18 150);\n}\n.btn {\n  background: var(--brand);\n  color: white;\n}\n.btn:hover {\n  background: oklch(from var(--brand) calc(l - 0.1) c h);\n}\n.btn:disabled {\n  background: oklch(from var(--brand) l c h / 40%);\n}',
        checks: [
          { label: ':hover lowers l with oklch(from var(--brand) …)', re: ':hover\\s*\\{[^}]*oklch\\(\\s*from\\s+var\\(\\s*--brand\\s*\\)\\s+calc\\(\\s*l\\s*-', flags: 'i' },
          { label: ':disabled adds an alpha with / …', re: ':disabled\\s*\\{[^}]*(oklch|rgb|hsl|oklab|lab|lch)\\(\\s*from\\s+var\\(\\s*--brand\\s*\\)[^;}]*/\\s*[\\d.]+%?', flags: 'i' },
        ],
        hint: 'oklch(from X l c h) copies X; change a channel with calc(), or add / 40% for alpha.',
        explain: 'Relative colors derive each state from the one token, so hover and disabled always match the brand.',
        preview: { html: BTNS },
      },
    ],
    // L4 Theme tokens & light-dark()
    [
      {
        kind: 'write',
        prompt: 'Make the habit tracker follow light and dark mode with two color tokens.',
        starter: '',
        solution:
          ':root {\n  color-scheme: light dark;\n  --bg: light-dark(#ffffff, #121212);\n  --text: light-dark(#222222, #eeeeee);\n}\nbody {\n  background: var(--bg);\n  color: var(--text);\n}',
        checks: [
          { label: 'color-scheme: light dark', re: 'color-scheme\\s*:\\s*(light\\s+dark|dark\\s+light)', flags: 'i' },
          { label: 'Two tokens set with light-dark()', re: '(--[\\w-]+\\s*:\\s*light-dark\\([\\s\\S]*){2}', flags: 'i' },
          { label: 'body background uses a token', re: 'body\\s*\\{[^}]*background(-color)?\\s*:\\s*var\\(\\s*--', flags: 'i' },
          { label: 'body color uses a token', re: 'body\\s*\\{[^}]*(?<![\\w-])color\\s*:\\s*var\\(\\s*--', flags: 'i' },
        ],
        hint: 'light-dark(light value, dark value) only works once color-scheme allows both.',
        explain: 'The tokens switch with the device setting, and every rule that reads them follows.',
        preview: { html: PAGE },
      },
      {
        kind: 'write',
        prompt: 'Replace the card’s hard-coded colors with light-dark() tokens.',
        starter:
          ':root {\n  color-scheme: light dark;\n}\n.card {\n  background: #ffffff;\n  color: #1a1a1a;\n  border: 1px solid #dddddd;\n}\n.card a {\n  color: #0b57d0;\n}\n',
        solution:
          ':root {\n  color-scheme: light dark;\n  --surface: light-dark(#ffffff, #1e1e1e);\n  --text: light-dark(#1a1a1a, #eeeeee);\n  --line: light-dark(#dddddd, #444444);\n  --link: light-dark(#0b57d0, #8ab4f8);\n}\n.card {\n  background: var(--surface);\n  color: var(--text);\n  border: 1px solid var(--line);\n}\n.card a {\n  color: var(--link);\n}',
        checks: [
          { label: 'At least three tokens set with light-dark()', re: '(--[\\w-]+\\s*:\\s*light-dark\\([\\s\\S]*){3}', flags: 'i' },
          { label: '.card background from a token', re: '\\.card\\s*\\{[^}]*background(-color)?\\s*:\\s*var\\(\\s*--', flags: 'i' },
          { label: '.card text color from a token', re: '\\.card\\s*\\{[^}]*(?<![\\w-])color\\s*:\\s*var\\(\\s*--', flags: 'i' },
          { label: '.card border color from a token', re: '\\.card\\s*\\{[^}]*border(-color)?\\s*:[^;}]*var\\(\\s*--', flags: 'i' },
          { label: 'The link color from a token', re: '\\.card a\\s*\\{[^}]*color\\s*:\\s*var\\(\\s*--', flags: 'i' },
        ],
        hint: 'Put each color in a token on :root as light-dark(old color, dark color), then use var().',
        explain: 'Components that only read tokens get dark mode for free, and a theme change is one place to edit.',
        preview: { html: CARD },
      },
    ],
    // L5 Contrast & forced colors
    [
      {
        kind: 'write',
        prompt: 'Darken the faint hint and field border when more contrast is asked for.',
        starter: '.hint { color: #999; }\n.field { border: 1px solid #ddd; }\n',
        solution:
          '.hint { color: #999; }\n.field { border: 1px solid #ddd; }\n@media (prefers-contrast: more) {\n  .hint { color: #222; }\n  .field { border-color: #000; }\n}',
        checks: [
          { label: '@media (prefers-contrast: more)', re: '@media\\s*\\(\\s*prefers-contrast\\s*:\\s*more\\s*\\)', flags: 'i' },
          { label: 'A darker .hint color inside it', re: 'prefers-contrast\\s*:\\s*more\\s*\\)\\s*\\{[^@]*\\.hint\\s*\\{[^}]*color\\s*:', flags: 'i' },
          { label: 'A darker .field border inside it', re: 'prefers-contrast\\s*:\\s*more\\s*\\)\\s*\\{[^@]*\\.field\\s*\\{[^}]*border', flags: 'i' },
        ],
        hint: 'Repeat the two selectors inside the media query with darker colors.',
        explain: 'People who turn on more contrast get readable text without changing the look for everyone else.',
        preview: { html: FORM },
      },
      {
        kind: 'write',
        prompt: 'Make the chip focus ring survive forced colors, and give chips a system-color border there.',
        starter:
          '.chip { background: #eef; border: none; }\n.chip:focus-visible {\n  outline: none;\n  box-shadow: 0 0 0 3px royalblue;\n}\n',
        solution:
          '.chip { background: #eef; border: none; }\n.chip:focus-visible {\n  outline: 2px solid transparent;\n  box-shadow: 0 0 0 3px royalblue;\n}\n@media (forced-colors: active) {\n  .chip { border: 1px solid CanvasText; }\n}',
        checks: [
          { label: 'A transparent outline on :focus-visible', re: ':focus-visible\\s*\\{[^}]*outline(-color)?\\s*:[^;}]*transparent', flags: 'i' },
          { label: 'No outline: none', not: 'outline: none' },
          { label: '@media (forced-colors: active)', re: '@media\\s*\\(\\s*forced-colors\\s*:\\s*active\\s*\\)', flags: 'i' },
          { label: 'A .chip border in a system color like CanvasText', re: 'forced-colors\\s*:\\s*active\\s*\\)\\s*\\{[^@]*\\.chip\\s*\\{[^}]*border[^;}]*(canvastext|buttontext|buttonborder|linktext|highlight|graytext)', flags: 'i' },
        ],
        hint: 'In forced colors the box-shadow vanishes, but a transparent outline is redrawn in a visible color.',
        explain: 'Forced colors mode swaps colors for system ones; a transparent outline becomes a real focus ring there.',
        preview: { html: CHIPS },
      },
    ],
  ],
};

export default unit;
