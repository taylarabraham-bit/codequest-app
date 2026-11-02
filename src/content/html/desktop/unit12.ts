import type { DesktopUnit } from '../../../engine/types';

// Desktop edition: write-the-code challenges for HTML unit 12 (SVG graphics).
// lessons[i] runs after lesson i + 1. See docs/CONTENT_GUIDE.md.
const unit: DesktopUnit = {
  lessons: [
    // L1 Shapes
    [
      {
        kind: 'write',
        prompt: 'Draw a traffic light: one dark rectangle with three circles on it.',
        starter: '',
        solution:
          '<svg width="80" viewBox="0 0 40 100">\n  <rect x="0" y="0" width="40" height="100" fill="#222" />\n  <circle cx="20" cy="20" r="12" fill="red" />\n  <circle cx="20" cy="50" r="12" fill="orange" />\n  <circle cx="20" cy="80" r="12" fill="green" />\n</svg>',
        checks: [
          { label: 'An <svg> with a viewBox', re: '<svg[^>]*\\sviewBox="\\s*-?[\\d.]+[\\s,]+-?[\\d.]+[\\s,]+[\\d.]+[\\s,]+[\\d.]+\\s*"', flags: 'i' },
          { label: 'A <rect> with width and height', re: '<rect(?=[^>]*\\swidth="[\\d.]+")(?=[^>]*\\sheight="[\\d.]+")[^>]*>', flags: 'i' },
          {
            label: 'Three <circle>s, each with cx, cy and r',
            re: '(<circle(?=[^>]*\\scx="[\\d.]+")(?=[^>]*\\scy="[\\d.]+")(?=[^>]*\\sr="[\\d.]+")[^>]*>[\\s\\S]*?){3}',
            flags: 'i',
          },
          { label: 'The rectangle comes first, so the lights sit on top', re: '<rect[\\s\\S]*<circle', flags: 'i' },
          { label: 'Close the </svg>', re: '</svg>\\s*$', flags: 'i' },
        ],
        hint: 'rect takes x, y, width, height; circle takes cx, cy and r. Later shapes paint over earlier ones.',
        explain: 'SVG paints in source order, so the box goes first. The viewBox grid lets you place shapes with simple numbers.',
        preview: {},
      },
      {
        kind: 'write',
        prompt: 'Finish the robot face: two eyes at the same height and a rectangle mouth.',
        starter: '<svg width="150" viewBox="0 0 100 100">\n  <rect x="10" y="10" width="80" height="80" fill="silver" />\n</svg>',
        solution:
          '<svg width="150" viewBox="0 0 100 100">\n  <rect x="10" y="10" width="80" height="80" fill="silver" />\n  <circle cx="35" cy="40" r="8" fill="navy" />\n  <circle cx="65" cy="40" r="8" fill="navy" />\n  <rect x="30" y="65" width="40" height="8" fill="navy" />\n</svg>',
        checks: [
          { label: 'Two eye <circle>s', re: '(<circle[^>]*\\sr="[\\d.]+"[^>]*>[\\s\\S]*?){2}', flags: 'i' },
          { label: 'Both eyes share the same cy', re: '<circle[^>]*\\scy="([\\d.]+)"[\\s\\S]*<circle[^>]*\\scy="\\1"', flags: 'i' },
          { label: 'A second <rect> for the mouth', re: '(<rect(?=[^>]*\\swidth=)(?=[^>]*\\sheight=)[^>]*>[\\s\\S]*?){2}', flags: 'i' },
          { label: 'The new shapes go after the face, inside the svg', re: '<rect[^>]*>[\\s\\S]*<circle[\\s\\S]*</svg>', flags: 'i' },
        ],
        hint: 'Same cy puts the eyes level; change only cx. The mouth is a wide, short rect.',
        explain: 'Shapes drawn after the face land on top of it. Matching cy values line the eyes up on one row.',
        preview: {},
      },
    ],
    // L2 Fill, stroke & lines
    [
      {
        kind: 'write',
        prompt: 'Draw a hollow target: two outlined circles and a cross of two lines.',
        starter: '',
        solution:
          '<svg width="120" viewBox="0 0 100 100">\n  <circle cx="50" cy="50" r="40" fill="none" stroke="crimson" stroke-width="4" />\n  <circle cx="50" cy="50" r="20" fill="none" stroke="crimson" stroke-width="4" />\n  <line x1="50" y1="0" x2="50" y2="100" stroke="black" />\n  <line x1="0" y1="50" x2="100" y2="50" stroke="black" />\n</svg>',
        checks: [
          {
            label: 'Two circles with fill="none" and a stroke',
            re: '(<circle(?=[^>]*\\sfill="none")(?=[^>]*\\sstroke="[^"]+")[^>]*>[\\s\\S]*?){2}',
            flags: 'i',
          },
          { label: 'A thicker outline with stroke-width', re: '\\sstroke-width="[\\d.]+', flags: 'i' },
          {
            label: 'Two <line>s with x1, y1, x2, y2 and a stroke',
            re: '(<line(?=[^>]*\\sx1=)(?=[^>]*\\sy1=)(?=[^>]*\\sx2=)(?=[^>]*\\sy2=)(?=[^>]*\\sstroke="[^"]+")[^>]*>[\\s\\S]*?){2}',
            flags: 'i',
          },
        ],
        hint: 'fill="none" makes a ring; a line needs a stroke or it is invisible.',
        explain: 'Without a fill the circles become rings. Lines have no inside, so stroke is the only thing that draws them.',
        preview: {},
      },
      {
        kind: 'write',
        prompt: 'Paint this tennis court green with white lines that actually show.',
        starter:
          '<svg width="200" viewBox="0 0 120 60">\n  <rect x="5" y="5" width="110" height="50" fill="none" />\n  <line x1="60" y1="5" x2="60" y2="55" />\n  <line x1="5" y1="30" x2="115" y2="30" />\n</svg>',
        solution:
          '<svg width="200" viewBox="0 0 120 60">\n  <rect x="5" y="5" width="110" height="50" fill="seagreen" stroke="white" stroke-width="2" />\n  <line x1="60" y1="5" x2="60" y2="55" stroke="white" stroke-width="2" />\n  <line x1="5" y1="30" x2="115" y2="30" stroke="white" stroke-width="2" />\n</svg>',
        checks: [
          { label: 'The court has a real fill colour', re: '<rect(?=[^>]*\\sfill="(?!none")[^"]+")', flags: 'i' },
          { label: 'The court has a stroke outline', re: '<rect[^>]*\\sstroke="[^"]+"', flags: 'i' },
          { label: 'Both lines get a stroke', re: '(<line[^>]*\\sstroke="[^"]+"[^>]*>[\\s\\S]*?){2}', flags: 'i' },
          { label: 'Set a stroke-width', re: '\\sstroke-width="[\\d.]+', flags: 'i' },
        ],
        hint: 'Swap fill="none" for a colour, then add stroke and stroke-width to every shape.',
        explain: 'fill paints the inside, stroke paints the edge. A line with no stroke draws nothing at all.',
        preview: {},
      },
    ],
    // L3 Polylines & text
    [
      {
        kind: 'write',
        prompt: 'Chart a week of steps as a polyline, with a centred label below.',
        starter: '',
        solution:
          '<svg width="200" viewBox="0 0 100 60">\n  <polyline points="0,45 20,30 40,35 60,15 80,20 100,5" fill="none" stroke="teal" stroke-width="2" />\n  <text x="50" y="58" text-anchor="middle" font-size="6">Steps this week</text>\n</svg>',
        checks: [
          { label: 'A <polyline> with at least 4 x,y points', re: '<polyline[^>]*\\spoints="(\\s*[\\d.]+[\\s,]+[\\d.]+){4,}\\s*"', flags: 'i' },
          { label: 'It has fill="none" and a stroke', re: '<polyline(?=[^>]*\\sfill="none")(?=[^>]*\\sstroke="[^"]+")', flags: 'i' },
          { label: 'A <text> label with x and y', re: '<text(?=[^>]*\\sx="[\\d.]+")(?=[^>]*\\sy="[\\d.]+")[^>]*>\\s*\\S[^<]*</text>', flags: 'i' },
          { label: 'The label is centred with text-anchor', re: '<text[^>]*\\stext-anchor="middle"', flags: 'i' },
        ],
        hint: 'points is a list like "0,45 20,30 …". text-anchor="middle" centres text on its x.',
        explain: 'A polyline joins its points but never closes, which suits a chart. fill="none" stops it shading the area under the line.',
        preview: {},
      },
      {
        kind: 'write',
        prompt: 'Turn the open arrow into a filled shape and label it Exit.',
        starter:
          '<svg width="160" viewBox="0 0 100 50">\n  <polyline points="5,15 60,15 60,5 95,25 60,45 60,35 5,35" fill="none" stroke="green" stroke-width="2" />\n</svg>',
        solution:
          '<svg width="160" viewBox="0 0 100 50">\n  <polygon points="5,15 60,15 60,5 95,25 60,45 60,35 5,35" fill="green" />\n  <text x="35" y="29" text-anchor="middle" font-size="12" fill="white">Exit</text>\n</svg>',
        checks: [
          { label: 'A <polygon> with points', re: '<polygon[^>]*\\spoints="[^"]+"', flags: 'i' },
          { label: 'No polyline left', not: '<polyline' },
          { label: 'The arrow is filled', re: '<polygon(?=[^>]*\\sfill="(?!none")[^"]+")', flags: 'i' },
          { label: 'Centred <text> that says Exit', re: '<text[^>]*\\stext-anchor="middle"[^>]*>\\s*Exit\\s*</text>', flags: 'i' },
          { label: 'Text after the polygon, so it’s on top', re: '<polygon[\\s\\S]*<text', flags: 'i' },
        ],
        hint: 'Keep the points, rename the element to polygon, give it a fill, then add text inside the svg.',
        explain: 'polygon closes the shape back to its first point, so it can be filled. The text comes last so it paints over the arrow.',
        preview: {},
      },
    ],
    // L4 Paths
    [
      {
        kind: 'write',
        prompt: 'Draw a house outline with one path: walls and a pointed roof.',
        starter: '',
        solution:
          '<svg width="120" viewBox="0 0 100 100">\n  <path d="M 20 90 V 45 L 50 15 L 80 45 V 90 Z" fill="none" stroke="brown" stroke-width="3" />\n</svg>',
        checks: [
          { label: 'A <path> whose d starts with M', re: '<path[^>]*\\sd="\\s*[Mm]', flags: 'i' },
          { label: 'L lines for the roof', re: '<path[^>]*\\sd="[^"]*[Ll]\\s*-?[\\d.]', flags: 'i' },
          { label: 'H or V for a straight wall', re: '<path[^>]*\\sd="[^"]*[HhVv]\\s*-?[\\d.]', flags: 'i' },
          { label: 'Close it with Z', re: '<path[^>]*\\sd="[^"]*[Zz]\\s*"', flags: 'i' },
          { label: 'Outlined, not filled', re: '<path(?=[^>]*\\sfill="none")(?=[^>]*\\sstroke="[^"]+")', flags: 'i' },
        ],
        hint: 'M to a bottom corner, V up the wall, L to the roof peak and down, V to the floor, then Z.',
        explain: 'One path can draw a whole outline. Z joins the last point back to the first, so the floor line comes free.',
        preview: {},
      },
      {
        kind: 'write',
        prompt: 'This diamond won’t draw. Start the path properly and close it.',
        starter: '<svg width="120" viewBox="0 0 100 100">\n  <path d="L 10 50 L 50 10 L 90 50 L 50 90" fill="gold" stroke="black" />\n</svg>',
        solution: '<svg width="120" viewBox="0 0 100 100">\n  <path d="M 10 50 L 50 10 L 90 50 L 50 90 Z" fill="gold" stroke="black" />\n</svg>',
        checks: [
          { label: 'The path starts with M', re: '<path[^>]*\\sd="\\s*[Mm]', flags: 'i' },
          { label: 'Three L lines to the other corners', re: '<path[^>]*\\sd="[^"]*([Ll][^Ll"]*){3}', flags: 'i' },
          { label: 'It ends with Z', re: '<path[^>]*\\sd="[^"]*[Zz]\\s*"', flags: 'i' },
        ],
        hint: 'Every path begins by moving the pen. Change the first command, and add a close at the end.',
        explain: 'Path data must start with M, or nothing draws. Z closes the last edge so the diamond has four sides.',
        preview: {},
      },
    ],
    // L5 Groups, reuse & titles
    [
      {
        kind: 'write',
        prompt: 'Draw three pine trees from one symbol, and give the svg a title.',
        starter: '',
        solution:
          '<svg viewBox="0 0 120 50" role="img">\n  <title>Three pine trees</title>\n  <symbol id="tree">\n    <polygon points="20,5 35,45 5,45" />\n  </symbol>\n  <g fill="forestgreen">\n    <use href="#tree" />\n    <use href="#tree" x="40" />\n    <use href="#tree" x="80" />\n  </g>\n</svg>',
        checks: [
          {
            label: 'A <symbol> with an id and a shape inside',
            re: '<symbol[^>]*\\sid="[\\w-]+"[^>]*>\\s*<(polygon|path|circle|rect|polyline|line|ellipse)\\b[\\s\\S]*?</symbol>',
            flags: 'i',
          },
          {
            label: 'Three <use href="#…"> copies of it',
            re: '<symbol[^>]*\\sid="([\\w-]+)"[\\s\\S]*(<use[^>]*\\s(xlink:)?href="#\\1"[\\s\\S]*?){3}',
            flags: 'i',
          },
          { label: 'Copies moved along with x', re: '<use[^>]*\\sx="[\\d.]+"', flags: 'i' },
          { label: 'role="img" on the svg', re: '<svg[^>]*\\srole="img"', flags: 'i' },
          { label: 'A <title> as the svg’s first child', re: '<svg[^>]*>\\s*<title>[^<]+</title>', flags: 'i' },
        ],
        hint: 'Define the tree once inside <symbol id="tree">, then stamp it with <use href="#tree" x="…">.',
        explain: 'symbol draws nothing by itself; each use stamps a copy. The title names the whole picture for screen readers.',
        preview: {},
      },
      {
        kind: 'write',
        prompt: 'Group the wheels so they share one fill, and name the picture.',
        starter:
          '<svg width="160" viewBox="0 0 100 50">\n  <rect x="10" y="10" width="80" height="20" fill="tomato" />\n  <circle cx="25" cy="35" r="8" fill="black" />\n  <circle cx="75" cy="35" r="8" fill="black" />\n</svg>',
        solution:
          '<svg width="160" viewBox="0 0 100 50" role="img">\n  <title>Red toy car</title>\n  <rect x="10" y="10" width="80" height="20" fill="tomato" />\n  <g fill="black">\n    <circle cx="25" cy="35" r="8" />\n    <circle cx="75" cy="35" r="8" />\n  </g>\n</svg>',
        checks: [
          { label: 'A <g> with a fill around both wheels', re: '<g[^>]*\\sfill="[^"]+"[^>]*>\\s*<circle[^>]*>\\s*<circle[^>]*>\\s*</g>', flags: 'i' },
          { label: 'The circles drop their own fill', re: '^(?![\\s\\S]*<circle[^>]*\\sfill=)[\\s\\S]*<circle', flags: 'i' },
          { label: 'role="img" on the svg', re: '<svg[^>]*\\srole="img"', flags: 'i' },
          { label: 'A <title> first inside the svg', re: '<svg[^>]*>\\s*<title>[^<]+</title>', flags: 'i' },
        ],
        hint: 'Wrap both circles in <g fill="black">…</g> and delete fill from each circle.',
        explain: 'Children inherit fill from their group, so the colour lives in one place. role="img" plus a title gives the drawing a name.',
        preview: {},
      },
    ],
  ],
};

export default unit;
