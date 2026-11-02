import type { DesktopUnit } from '../../../engine/types';

// Desktop edition: write-the-code challenges for CSS unit 14 (Cascade layers & scope).
// lessons[i] runs after lesson i + 1. See docs/CONTENT_GUIDE.md.

const ALERT = '<div id="app"><div class="alert" style="padding:8px">⛈️ Storm warning <span class="muted">until 9pm</span></div></div>';
const SHOP = '<h1>Pet Shop</h1><button class="btn">Adopt a cat</button>';
const BOOKING =
  '<h1>Book a table</h1><form><input placeholder="Name"> <input class="error" placeholder="Phone"> <button>Book</button></form>';
const NEWS = '<p>Read the <a href="#">terms</a> and the <a href="#">privacy policy</a>.</p>';
const BUTTONS = '<button>Save</button> <button class="plain">Cancel</button>';
const RECIPE =
  '<h2>Today’s picks</h2><div class="recipe"><h2>Tomato soup</h2><p>Ready in 25 minutes.</p></div><h2>More soon</h2>';
const POST =
  '<article class="post"><p>New trail map! <a href="#">Download it</a>.</p><section class="comments"><p>Thanks! <a href="#">@kai</a></p></section></article>';
const TOOLBAR =
  '<div style="height:120px;background:linear-gradient(135deg,#fa6,#a6f)"><div class="toolbar" style="padding:10px">✏️ Edit · 🔍 Zoom · 💾 Save</div><p style="font-size:36px;margin:0">🎨🖌️🖼️</p></div>';
const SIDEBAR =
  '<aside class="sidebar" style="padding:10px"><a href="#">Dashboard</a> · <a class="plain" href="#">Log out</a><ul class="steps"><li>Sign up</li><li>Verify email</li><li>Pick a plan</li></ul></aside>';

const unit: DesktopUnit = {
  lessons: [
    // L1 Declaring layers
    [
      {
        kind: 'write',
        prompt: 'Declare layers base then theme, and let the theme’s h1 color win.',
        starter: '',
        solution:
          '@layer base, theme;\n@layer base {\n  h1 { color: black; }\n}\n@layer theme {\n  h1 { color: teal; }\n}',
        checks: [
          { label: 'An order statement: @layer base, theme;', re: '@layer\\s+base\\s*,\\s*theme\\s*;', flags: 'i' },
          { label: 'An @layer base block that colors the h1', re: '@layer\\s+base\\s*\\{[^@]*h1[^{]*\\{[^}]*color\\s*:', flags: 'i' },
          { label: 'An @layer theme block that colors the h1', re: '@layer\\s+theme\\s*\\{[^@]*h1[^{]*\\{[^}]*color\\s*:', flags: 'i' },
        ],
        hint: 'Write the order statement first, then a block for each layer.',
        explain: 'theme is declared later, so its rules win any clash with base.',
        preview: { html: SHOP },
      },
      {
        kind: 'write',
        prompt: 'Add an order statement so components beat the reset, plus a utilities layer.',
        starter:
          '@layer components {\n  .alert { background: gold; }\n}\n@layer reset {\n  #app div { background: white; }\n}\n',
        solution:
          '@layer reset, components, utilities;\n@layer components {\n  .alert { background: gold; }\n}\n@layer reset {\n  #app div { background: white; }\n}\n@layer utilities {\n  .muted { opacity: 0.6; }\n}',
        checks: [
          { label: 'Start with @layer reset, components, utilities;', re: '^\\s*(/\\*[\\s\\S]*?\\*/\\s*)?@layer\\s+reset\\s*,\\s*components\\s*,\\s*utilities\\s*;', flags: 'i' },
          { label: 'Keep the components and reset blocks', re: '^(?=[\\s\\S]*@layer\\s+components\\s*\\{)(?=[\\s\\S]*@layer\\s+reset\\s*\\{)', flags: 'i' },
          { label: 'An @layer utilities block with a .muted rule', re: '@layer\\s+utilities\\s*\\{[^@]*\\.muted\\s*\\{[^}]*:', flags: 'i' },
        ],
        hint: 'Without a statement, layers are ordered by where they first appear. Put the statement on line 1.',
        explain: 'The order statement wins over file position, so components now beat #app div despite its ID.',
        preview: { html: ALERT },
      },
    ],
    // L2 Unlayered & imported styles
    [
      {
        kind: 'write',
        prompt: 'Import kit.css into a framework layer and override its button color.',
        starter: '',
        solution: '@import url("kit.css") layer(framework);\n\n.btn {\n  background: tomato;\n  color: white;\n}',
        checks: [
          { label: 'Start with @import … layer(framework);', re: '^\\s*@import\\s+(url\\(\\s*["\']?kit\\.css["\']?\\s*\\)|["\']kit\\.css["\'])\\s+layer\\(\\s*framework\\s*\\)\\s*;', flags: 'i' },
          { label: 'A .btn rule that sets a background', re: '\\.btn\\s*\\{[^}]*background(-color)?\\s*:', flags: 'i' },
          { label: 'Keep your .btn outside any @layer block', not: '@layer' },
        ],
        hint: '@import must come first. Your own loose rules beat anything in a layer.',
        explain: 'Unlayered rules beat every layer, so a plain .btn overrides the framework without !important.',
        preview: { html: SHOP },
      },
      {
        kind: 'write',
        prompt: 'Put input styles in base.forms and heading styles in base.type, then flag the error field.',
        starter: '@layer base;\n',
        solution:
          '@layer base;\n@layer base.forms {\n  input { padding: 6px; border: 1px solid #999; }\n}\n@layer base.type {\n  h1 { font-family: Georgia, serif; }\n}\n.error {\n  border-color: crimson;\n}',
        checks: [
          { label: 'A nested forms layer inside base that styles input', re: '(@layer\\s+base\\.forms\\s*\\{|@layer\\s+base\\s*\\{\\s*@layer\\s+forms\\s*\\{)[^@]*input', flags: 'i' },
          { label: 'A nested type layer inside base that styles h1', re: '(@layer\\s+base\\.type\\s*\\{|@layer\\s+base\\s*\\{[\\s\\S]*@layer\\s+type\\s*\\{)[^@]*h1', flags: 'i' },
          { label: 'An unlayered .error rule with a border color', re: '(^|[;}])\\s*\\.error\\s*\\{[^}]*border(-color)?\\s*:[^;}]*[a-z#]', flags: 'i' },
        ],
        hint: 'Write @layer base.forms { … } with a dot, or nest @layer forms inside @layer base.',
        explain: 'Nested layers keep a framework tidy, and your unlayered .error still beats all of them.',
        preview: { html: BOOKING },
      },
    ],
    // L3 !important & revert-layer
    [
      {
        kind: 'write',
        prompt: 'Lock links to underlined in a reset layer, even if the theme says no.',
        starter: '',
        solution:
          '@layer reset, theme;\n@layer reset {\n  a { text-decoration: underline !important; }\n}\n@layer theme {\n  a { text-decoration: none; color: teal; }\n}',
        checks: [
          { label: 'Declare @layer reset, theme;', re: '@layer\\s+reset\\s*,\\s*theme\\s*;', flags: 'i' },
          { label: 'In reset, text-decoration: underline !important', re: '@layer\\s+reset\\s*\\{[^@]*text-decoration(-line)?\\s*:\\s*underline\\s*!\\s*important', flags: 'i' },
          { label: 'In theme, a rule that tries text-decoration: none', re: '@layer\\s+theme\\s*\\{[^@]*text-decoration(-line)?\\s*:\\s*none', flags: 'i' },
        ],
        hint: '!important flips the layer order, so the earlier reset layer wins.',
        explain: 'Important declarations in earlier layers beat later ones, which lets a reset guard what must not change.',
        preview: { html: NEWS },
      },
      {
        kind: 'write',
        prompt: 'Give .plain buttons the base look back using revert-layer.',
        starter:
          '@layer base, theme;\n@layer base {\n  button { background: #eee; color: #111; }\n}\n@layer theme {\n  button { background: navy; color: white; }\n  /* .plain buttons should look like base */\n}\n',
        solution:
          '@layer base, theme;\n@layer base {\n  button { background: #eee; color: #111; }\n}\n@layer theme {\n  button { background: navy; color: white; }\n  .plain {\n    background: revert-layer;\n    color: revert-layer;\n  }\n}',
        checks: [
          { label: 'A .plain rule inside the theme layer', re: '@layer\\s+theme\\s*\\{[^@]*\\.plain\\s*\\{', flags: 'i' },
          { label: 'background: revert-layer', re: '\\.plain\\s*\\{[^}]*background(-color)?\\s*:\\s*revert-layer', flags: 'i' },
          { label: 'color: revert-layer', re: '\\.plain\\s*\\{[^}]*(?<![\\w-])color\\s*:\\s*revert-layer', flags: 'i' },
        ],
        hint: 'revert-layer goes where a value would, inside the layer that set navy.',
        explain: 'revert-layer throws away the theme’s value and falls back to what base set, with no copying.',
        preview: { html: BUTTONS },
      },
    ],
    // L4 @scope
    [
      {
        kind: 'write',
        prompt: 'Style only the recipe card: a border on the card and a colored h2.',
        starter: '',
        solution: '@scope (.recipe) {\n  :scope {\n    border: 1px solid #ccc;\n    padding: 8px;\n  }\n  h2 {\n    color: tomato;\n  }\n}',
        checks: [
          { label: 'An @scope (.recipe) block', re: '@scope\\s*\\(\\s*\\.recipe\\s*\\)\\s*\\{', flags: 'i' },
          { label: 'A border on :scope', re: ':scope\\s*\\{[^}]*border', flags: 'i' },
          { label: 'A color on the h2 inside the scope', re: '@scope[^{]*\\{[\\s\\S]*h2\\s*\\{[^}]*color\\s*:', flags: 'i' },
        ],
        hint: 'Inside @scope, :scope means the .recipe element itself.',
        explain: 'Only the h2 inside .recipe changes; the page’s other h2s stay as they were.',
        preview: { html: RECIPE },
      },
      {
        kind: 'write',
        prompt: 'Make post links teal but leave the comment links alone.',
        starter: '.post a {\n  color: teal;\n}\n/* also turns comment links teal */\n',
        solution: '@scope (.post) to (.comments) {\n  a {\n    color: teal;\n  }\n}',
        checks: [
          { label: '@scope (.post) to (.comments)', re: '@scope\\s*\\(\\s*\\.post\\s*\\)\\s*to\\s*\\(\\s*\\.comments\\s*\\)', flags: 'i' },
          { label: 'Color the links inside it', re: '@scope[^{]*\\{\\s*a\\s*\\{[^}]*color\\s*:', flags: 'i' },
          { label: 'Remove the old .post a rule', not: '.post a' },
        ],
        hint: 'Add to (…) after the scope root to stop at an inner boundary.',
        explain: 'The to (.comments) limit cuts a hole in the scope, so links in the comments keep their own color.',
        preview: { html: POST },
      },
    ],
    // L5 @supports & reset keywords
    [
      {
        kind: 'write',
        prompt: 'Frost the toolbar only where backdrop-filter works; keep a solid fallback.',
        starter: '',
        solution:
          '.toolbar {\n  background: white;\n}\n@supports (backdrop-filter: blur(4px)) {\n  .toolbar {\n    background: rgb(255 255 255 / 50%);\n    backdrop-filter: blur(4px);\n  }\n}',
        checks: [
          { label: 'A plain .toolbar background before the @supports', re: '\\.toolbar\\s*\\{[^}]*background[^}]*\\}[\\s\\S]*@supports', flags: 'i' },
          { label: '@supports (backdrop-filter: blur(…))', re: '@supports\\s*\\(\\s*backdrop-filter\\s*:\\s*blur\\(', flags: 'i' },
          { label: 'Inside it, .toolbar gets backdrop-filter', re: '@supports[^{]*\\{\\s*\\.toolbar\\s*\\{[^}]*backdrop-filter\\s*:\\s*blur\\(', flags: 'i' },
        ],
        hint: 'Write the safe style first, then wrap the fancy one in @supports (property: value).',
        explain: 'Browsers that don’t know backdrop-filter skip the whole @supports block and keep the solid toolbar.',
        preview: { html: TOOLBAR },
      },
      {
        kind: 'write',
        prompt: 'Let the Log out link inherit its color and give the steps list its browser style back.',
        starter:
          '.sidebar { color: white; background: #222; }\n.sidebar a { color: gold; }\n.sidebar ul { padding: 0; list-style: none; }\n',
        solution:
          '.sidebar { color: white; background: #222; }\n.sidebar a { color: gold; }\n.sidebar ul { padding: 0; list-style: none; }\n.sidebar a.plain {\n  color: inherit;\n}\n.sidebar ul.steps {\n  padding: revert;\n  list-style: revert;\n}',
        checks: [
          { label: '.plain gets color: inherit', re: '\\.plain\\s*\\{[^}]*(?<![\\w-])color\\s*:\\s*inherit', flags: 'i' },
          { label: '.steps gets padding: revert', re: '\\.steps\\s*\\{[^}]*padding(-left|-inline-start)?\\s*:\\s*revert\\s*(;|\\}|!)', flags: 'i' },
          { label: '.steps gets list-style: revert', re: '\\.steps\\s*\\{[^}]*list-style(-type)?\\s*:\\s*revert\\s*(;|\\}|!)', flags: 'i' },
        ],
        hint: 'inherit copies the parent’s value; revert goes back to the browser’s own style.',
        explain: 'revert undoes your rules for that property, so the list gets its bullets and 40px indent back.',
        preview: { html: SIDEBAR },
      },
    ],
  ],
};

export default unit;
