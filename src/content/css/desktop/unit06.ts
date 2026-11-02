import type { DesktopUnit } from '../../../engine/types';

// Desktop edition: write-the-code challenges for CSS unit 6 (Grid).
// lessons[i] runs after lesson i + 1. See docs/CONTENT_GUIDE.md.
const cells = (n: number) => Array.from({ length: n }, (_, i) => `<div>${i + 1}</div>`).join('');

const unit: DesktopUnit = {
  lessons: [
    // L1 Grid columns
    [
      {
        kind: 'write',
        prompt: 'Make a two-column page: a 180px menu, and content filling the rest.',
        starter: '',
        solution: '.page {\n  display: grid;\n  grid-template-columns: 180px 1fr;\n}',
        checks: [
          { label: '.page is display: grid', re: '\\.page\\s*\\{[^}]*display\\s*:\\s*grid\\s*[;}]', flags: 'i' },
          { label: 'Columns: 180px, then 1fr', re: '\\.page\\s*\\{[^}]*grid-template-columns\\s*:\\s*180px\\s+1fr\\s*[;}]', flags: 'i' },
        ],
        hint: 'grid-template-columns takes one size per column. fr shares out what’s left.',
        explain: 'The first column is fixed at 180px and 1fr takes all the remaining width.',
        preview: {
          html: '<div class="page"><nav style="background:#e0e7ff">Menu</nav><main style="background:#f5f5f4">Today’s top recipes</main></div>',
        },
      },
      {
        kind: 'write',
        prompt: 'Make the scoreboard’s name column twice as wide as score and time.',
        starter: '.board {\n  display: grid;\n}\n',
        solution: '.board {\n  display: grid;\n  grid-template-columns: 2fr 1fr 1fr;\n}\n.board div {\n  padding: 4px 8px;\n  border-bottom: 1px solid #ddd;\n}',
        checks: [
          { label: 'Three columns: 2fr 1fr 1fr', re: '\\.board\\s*\\{[^}]*grid-template-columns\\s*:\\s*2fr\\s+1fr\\s+1fr\\s*[;}]', flags: 'i' },
          { label: 'Padding on each cell', re: '\\.board\\s+(div|>\\s*\\*|\\*)\\s*\\{[^}]*(?<![\\w-])padding(-[a-z]+)?\\s*:', flags: 'i' },
        ],
        hint: '2fr gets two shares of the space, 1fr gets one.',
        explain: 'fr values are ratios: 2fr 1fr 1fr splits the width into four shares, two for the name.',
        preview: {
          html: '<div class="board"><div><b>Player</b></div><div><b>Score</b></div><div><b>Time</b></div><div>Mira</div><div>9200</div><div>3:12</div><div>Jon</div><div>8700</div><div>3:40</div></div>',
        },
      },
    ],
    // L2 Repeat and rows
    [
      {
        kind: 'write',
        prompt: 'Make a 7-column calendar with repeat() and 6px gaps.',
        starter: '',
        solution: '.month {\n  display: grid;\n  grid-template-columns: repeat(7, 1fr);\n  gap: 6px;\n}',
        checks: [
          { label: '.month is display: grid', re: '\\.month\\s*\\{[^}]*display\\s*:\\s*grid\\s*[;}]', flags: 'i' },
          { label: 'Seven equal columns with repeat()', re: 'grid-template-columns\\s*:\\s*repeat\\(\\s*7\\s*,\\s*1fr\\s*\\)', flags: 'i' },
          { label: 'A 6px gap', re: '\\.month\\s*\\{[^}]*(?<![\\w-])gap\\s*:\\s*6px', flags: 'i' },
        ],
        hint: 'repeat(count, size) writes the same column size many times.',
        explain: 'repeat(7, 1fr) is 1fr written seven times: one equal column per weekday.',
        preview: { html: `<div class="month">${cells(31)}</div>` },
      },
      {
        kind: 'write',
        prompt: 'Size the dashboard rows 80px, flexible, 40px, with separate row and column gaps.',
        starter: '.dash {\n  display: grid;\n  grid-template-columns: 1fr 1fr 1fr;\n  height: 300px;\n}',
        solution:
          '.dash {\n  display: grid;\n  grid-template-columns: repeat(3, 1fr);\n  grid-template-rows: 80px 1fr 40px;\n  gap: 12px 20px;\n  height: 300px;\n}',
        checks: [
          { label: 'Columns written with repeat()', re: 'grid-template-columns\\s*:\\s*repeat\\(\\s*3\\s*,\\s*1fr\\s*\\)', flags: 'i' },
          { label: 'Rows: 80px, 1fr, 40px', re: 'grid-template-rows\\s*:\\s*80px\\s+1fr\\s+40px\\s*[;}]', flags: 'i' },
          {
            label: 'A row gap and a different column gap',
            re: '(?<![\\w-])gap\\s*:\\s*([\\d.]+[a-z%]*)\\s+(?!\\1\\s*[;}])[\\d.]+[a-z%]*\\s*[;}]|(?=[\\s\\S]*row-gap\\s*:)(?=[\\s\\S]*column-gap\\s*:)',
            flags: 'i',
          },
        ],
        hint: 'grid-template-rows works like columns. gap: 12px 20px is rows, then columns.',
        explain: 'The middle row takes whatever height is left, and two gap values space rows and columns differently.',
        preview: { html: `<div class="dash">${cells(9)}</div>` },
      },
    ],
    // L3 Placing items
    [
      {
        kind: 'write',
        prompt: 'In a 3-column grid, span the .featured photo 2 columns and the .banner all.',
        starter: '',
        solution:
          '.grid {\n  display: grid;\n  grid-template-columns: repeat(3, 1fr);\n  gap: 8px;\n}\n.featured {\n  grid-column: span 2;\n}\n.banner {\n  grid-column: 1 / -1;\n}',
        checks: [
          { label: '.grid has three columns', re: '\\.grid\\s*\\{(?=[^}]*display\\s*:\\s*grid)(?=[^}]*grid-template-columns\\s*:\\s*(repeat\\(\\s*3\\s*,|\\S+\\s+\\S+\\s+\\S+\\s*[;}]))', flags: 'i' },
          {
            label: '.featured covers two columns',
            re: '\\.featured\\s*\\{[^}]*grid-column\\s*:\\s*(span\\s+2|1\\s*\\/\\s*3|2\\s*\\/\\s*4|\\d\\s*\\/\\s*span\\s+2)\\s*[;}]',
            flags: 'i',
          },
          { label: '.banner runs edge to edge', re: '\\.banner\\s*\\{[^}]*grid-column\\s*:\\s*1\\s*\\/\\s*(-1|4|span\\s+3)\\s*[;}]', flags: 'i' },
        ],
        hint: 'span 2 covers two columns from where the item starts. 1 / -1 goes from the first line to the last.',
        explain: 'Grid lines run 1 to 4 in a 3-column grid; -1 always means the last line, so 1 / -1 spans them all.',
        preview: {
          html: '<div class="grid"><div class="banner" style="background:#fde68a">Summer sale</div><div class="featured" style="background:#bae6fd">Featured: kayak</div><div style="background:#eee">Tent</div><div style="background:#eee">Lamp</div><div style="background:#eee">Stove</div><div style="background:#eee">Map</div></div>',
        },
      },
      {
        kind: 'write',
        prompt: 'Place the stage across the top row and the aisle down column 3, rows 2–4.',
        starter: '.seats {\n  display: grid;\n  grid-template-columns: repeat(5, 1fr);\n  gap: 4px;\n}\n.stage {\n  background-color: gold;\n}\n.aisle {\n  background-color: lightgray;\n}',
        solution:
          '.seats {\n  display: grid;\n  grid-template-columns: repeat(5, 1fr);\n  gap: 4px;\n}\n.stage {\n  grid-column: 1 / -1;\n  grid-row: 1;\n  background-color: gold;\n}\n.aisle {\n  grid-column: 3;\n  grid-row: 2 / 5;\n  background-color: lightgray;\n}',
        checks: [
          { label: '.stage spans all columns', re: '\\.stage\\s*\\{[^}]*grid-column\\s*:\\s*1\\s*\\/\\s*(-1|6|span\\s+5)\\s*[;}]', flags: 'i' },
          { label: '.aisle sits in column 3', re: '\\.aisle\\s*\\{[^}]*grid-column\\s*:\\s*3(\\s*\\/\\s*(4|span\\s+1))?\\s*[;}]', flags: 'i' },
          { label: '.aisle runs from row 2 to row 4', re: '\\.aisle\\s*\\{[^}]*grid-row\\s*:\\s*2\\s*\\/\\s*(5|span\\s+3)\\s*[;}]', flags: 'i' },
        ],
        hint: 'Rows 2 to 4 means from line 2 to line 5, or 2 / span 3.',
        explain: 'An item covering three rows ends on the line after the last row, so rows 2–4 is 2 / 5.',
        preview: {
          html: `<div class="seats"><div class="stage">STAGE</div><div class="aisle">aisle</div>${Array.from({ length: 12 }, () => '<div style="background:#c7d2fe">seat</div>').join('')}</div>`,
        },
      },
    ],
    // L4 Named areas
    [
      {
        kind: 'write',
        prompt: 'Lay out the blog with named areas: header, sidebar beside main, footer.',
        starter: '',
        solution:
          '.page {\n  display: grid;\n  grid-template-columns: 160px 1fr;\n  grid-template-areas:\n    "head head"\n    "side main"\n    "foot foot";\n}\nheader { grid-area: head; }\naside { grid-area: side; }\nmain { grid-area: main; }\nfooter { grid-area: foot; }',
        checks: [
          { label: '.page is a grid with two columns', re: '\\.page\\s*\\{(?=[^}]*display\\s*:\\s*grid)(?=[^}]*grid-template-columns\\s*:\\s*\\S+\\s+\\S+\\s*[;}])', flags: 'i' },
          { label: 'grid-template-areas with three row strings', re: 'grid-template-areas\\s*:\\s*(["\'][^"\']+["\']\\s*){3}[;}]', flags: 'i' },
          { label: 'header and footer get a grid-area', re: '(?=[\\s\\S]*header\\s*\\{[^}]*grid-area\\s*:\\s*[\\w-]+)(?=[\\s\\S]*footer\\s*\\{[^}]*grid-area\\s*:\\s*[\\w-]+)', flags: 'i' },
          { label: 'aside and main get a grid-area', re: '(?=[\\s\\S]*aside\\s*\\{[^}]*grid-area\\s*:\\s*[\\w-]+)(?=[\\s\\S]*main\\s*\\{[^}]*grid-area\\s*:\\s*[\\w-]+)', flags: 'i' },
        ],
        hint: 'One quoted string per row, one name per cell. Repeat a name to stretch it across.',
        explain: 'The strings draw the layout; grid-area drops each element into the area with that name.',
        preview: {
          html: '<div class="page"><header style="background:#fde68a">My Blog</header><aside style="background:#e5e7eb">Archive</aside><main style="background:#f5f5f4">Post: Learning grid</main><footer style="background:#d1d5db">© 2026</footer></div>',
        },
      },
      {
        kind: 'write',
        prompt: 'Fix the layout: every row needs two cells, and grid-area names take no quotes.',
        starter:
          '.app {\n  display: grid;\n  grid-template-columns: 1fr 3fr;\n  grid-template-areas:\n    "nav nav"\n    "menu content content"\n    "foot foot";\n}\n.top { grid-area: "nav"; }\n.menu { grid-area: menu; }\n.content { grid-area: content; }\n.bottom { grid-area: foot; }',
        solution:
          '.app {\n  display: grid;\n  grid-template-columns: 1fr 3fr;\n  grid-template-areas:\n    "nav nav"\n    "menu content"\n    "foot foot";\n}\n.top { grid-area: nav; }\n.menu { grid-area: menu; }\n.content { grid-area: content; }\n.bottom { grid-area: foot; }',
        checks: [
          { label: 'The middle row is "menu content"', re: '["\']\\s*menu\\s+content\\s*["\']', flags: 'i' },
          { label: 'No three-cell row left', not: 'menu content content' },
          { label: '.top uses grid-area: nav, without quotes', re: '\\.top\\s*\\{[^}]*grid-area\\s*:\\s*nav\\s*[;}]', flags: 'i' },
        ],
        hint: 'Count the cells in each string: two columns means two names per row.',
        explain: 'A row with the wrong number of cells makes the whole template invalid, and a quoted grid-area is a different value.',
        preview: {
          html: '<div class="app"><div class="top" style="background:#fde68a">Nav</div><div class="menu" style="background:#e5e7eb">Menu</div><div class="content" style="background:#f5f5f4">Inbox (3)</div><div class="bottom" style="background:#d1d5db">Footer</div></div>',
        },
      },
    ],
    // L5 Auto-fit and minmax
    [
      {
        kind: 'write',
        prompt: 'Fit as many product cards per row as there’s room for, each 160px or wider.',
        starter: '',
        solution: '.products {\n  display: grid;\n  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));\n  gap: 12px;\n}',
        checks: [
          { label: '.products is display: grid', re: '\\.products\\s*\\{[^}]*display\\s*:\\s*grid\\s*[;}]', flags: 'i' },
          {
            label: 'repeat(auto-fit, minmax(160px, 1fr))',
            re: 'grid-template-columns\\s*:\\s*repeat\\(\\s*auto-(fit|fill)\\s*,\\s*minmax\\(\\s*160px\\s*,\\s*1fr\\s*\\)\\s*\\)',
            flags: 'i',
          },
          { label: 'A gap between cards', re: '\\.products\\s*\\{[^}]*(?<![\\w-])gap\\s*:\\s*\\d', flags: 'i' },
        ],
        hint: 'minmax(min, max) inside repeat(auto-fit, …). The minimum is 160px, the maximum 1fr.',
        explain: 'auto-fit makes as many 160px-plus columns as fit, and 1fr lets them stretch to fill the row.',
        preview: { html: `<div class="products">${['Mug', 'Lamp', 'Plant', 'Clock', 'Rug'].map((p) => `<div style="background:#eef;padding:16px">${p}</div>`).join('')}</div>` },
      },
      {
        kind: 'write',
        prompt: 'Fix the gallery: fr can’t be the minimum, and two photos should stretch.',
        starter: '.gallery {\n  display: grid;\n  grid-template-columns: repeat(auto-fill, minmax(1fr, 150px));\n  gap: 8px;\n}',
        solution: '.gallery {\n  display: grid;\n  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));\n  gap: 8px;\n}',
        checks: [
          { label: 'Use auto-fit so items stretch', re: 'repeat\\(\\s*auto-fit\\s*,', flags: 'i' },
          { label: 'minmax(150px, 1fr): minimum first', re: 'minmax\\(\\s*150px\\s*,\\s*1fr\\s*\\)', flags: 'i' },
          { label: 'No fr as the minimum', not: 'minmax(1fr' },
        ],
        hint: 'minmax takes the minimum first. auto-fill keeps empty columns; the other one doesn’t.',
        explain: 'With auto-fit the empty tracks collapse, so the two photos grow to fill the row.',
        preview: { html: '<div class="gallery"><div style="background:#bae6fd;height:80px">Lake</div><div style="background:#bbf7d0;height:80px">Forest</div></div>' },
      },
    ],
  ],
};

export default unit;
