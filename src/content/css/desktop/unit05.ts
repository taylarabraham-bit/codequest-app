import type { DesktopUnit } from '../../../engine/types';

// Desktop edition: write-the-code challenges for CSS unit 5 (Flexbox).
// lessons[i] runs after lesson i + 1. See docs/CONTENT_GUIDE.md.
const unit: DesktopUnit = {
  lessons: [
    // L1 Flex containers
    [
      {
        kind: 'write',
        prompt: 'Put the avatar beside the profile text, and stack the .stats lines.',
        starter: '',
        solution: '.profile {\n  display: flex;\n}\n.stats {\n  display: flex;\n  flex-direction: column;\n}',
        checks: [
          { label: '.profile is display: flex', re: '\\.profile\\s*\\{[^}]*display\\s*:\\s*flex\\s*[;}]', flags: 'i' },
          { label: '.stats is display: flex', re: '\\.stats\\s*\\{[^}]*display\\s*:\\s*flex\\s*[;}]', flags: 'i' },
          { label: '.stats runs top to bottom', re: '\\.stats\\s*\\{[^}]*flex-direction\\s*:\\s*column', flags: 'i' },
        ],
        hint: 'display: flex lines children up in a row. flex-direction: column stacks them.',
        explain: 'Flex works on direct children: .profile lays out the avatar and .stats, and .stats stacks its own spans.',
        preview: {
          html: '<div class="profile"><div style="background:#fcd34d;padding:12px">AB</div><div class="stats"><span>Ana B.</span><span>42 posts</span><span>310 followers</span></div></div>',
        },
      },
      {
        kind: 'write',
        prompt: 'Fix the card: flex goes on the parent, stacked top to bottom.',
        starter: '.card h3,\n.card p,\n.card button {\n  display: flex;\n  flex-direction: column;\n}',
        solution: '.card {\n  display: flex;\n  flex-direction: column;\n}',
        checks: [
          { label: '.card itself is display: flex', re: '\\.card\\s*\\{[^}]*display\\s*:\\s*flex\\s*[;}]', flags: 'i' },
          { label: '.card stacks with flex-direction: column', re: '\\.card\\s*\\{[^}]*flex-direction\\s*:\\s*column', flags: 'i' },
          { label: 'Remove flex from the children', re: '^(?![\\s\\S]*\\.card\\s+(h3|p|button)[^{]*\\{[^}]*display\\s*:\\s*flex)', flags: 'i' },
        ],
        hint: 'Children become flex items when their parent has display: flex.',
        explain: 'A flex container arranges its direct children; flex on the children only affects what’s inside them.',
        preview: {
          html: '<div class="card" style="border:1px solid #ccc;padding:8px;width:220px"><h3>Night hike</h3><p>Sat 9pm</p><button>Join</button></div>',
        },
      },
    ],
    // L2 Justify content
    [
      {
        kind: 'write',
        prompt: 'Lay out the top bar: logo far left, account link far right.',
        starter: '',
        solution: '.top {\n  display: flex;\n  justify-content: space-between;\n}',
        checks: [
          { label: '.top is display: flex', re: '\\.top\\s*\\{[^}]*display\\s*:\\s*flex\\s*[;}]', flags: 'i' },
          { label: 'Push them apart with space-between', re: '\\.top\\s*\\{[^}]*justify-content\\s*:\\s*space-between', flags: 'i' },
        ],
        hint: 'One justify-content value puts all spare room between the items.',
        explain: 'space-between puts the first item at the start, the last at the end, and the spare space between them.',
        preview: { html: '<div class="top" style="background:#eef;padding:8px"><b>Trailmap</b><a href="#">My account</a></div>' },
      },
      {
        kind: 'write',
        prompt: 'Center the page buttons, and spread the step dots out evenly.',
        starter: '.pages,\n.steps {\n  display: flex;\n}',
        solution: '.pages,\n.steps {\n  display: flex;\n}\n.pages {\n  justify-content: center;\n}\n.steps {\n  justify-content: space-evenly;\n}',
        checks: [
          { label: '.pages: justify-content: center', re: '(^|[\\s}])\\.pages\\s*\\{[^}]*justify-content\\s*:\\s*center', flags: 'i' },
          { label: '.steps: space-evenly or space-around', re: '(^|[\\s}])\\.steps\\s*\\{[^}]*justify-content\\s*:\\s*space-(evenly|around)', flags: 'i' },
        ],
        hint: 'Give each list its own rule under the shared one.',
        explain: 'center bunches items in the middle; space-evenly turns the spare room into equal gaps.',
        preview: {
          html: '<div class="pages"><button>1</button><button>2</button><button>3</button></div><div class="steps"><span>●</span><span>●</span><span>○</span><span>○</span></div>',
        },
      },
    ],
    // L3 Align items
    [
      {
        kind: 'write',
        prompt: 'Center the play icon both ways inside the 200px video box.',
        starter: '.video {\n  height: 200px;\n  background-color: black;\n}',
        solution: '.video {\n  height: 200px;\n  background-color: black;\n  display: flex;\n  justify-content: center;\n  align-items: center;\n}',
        checks: [
          { label: '.video is display: flex', re: '\\.video\\s*\\{[^}]*display\\s*:\\s*flex\\s*[;}]', flags: 'i' },
          { label: 'Center along the row: justify-content', re: '\\.video\\s*\\{[^}]*justify-content\\s*:\\s*center', flags: 'i' },
          { label: 'Center up and down: align-items', re: '\\.video\\s*\\{[^}]*align-items\\s*:\\s*center', flags: 'i' },
        ],
        hint: 'One property centers along the main axis, the other on the cross axis.',
        explain: 'justify-content works along the row and align-items across it, so both on center lands in the middle.',
        preview: { html: '<div class="video"><span style="color:white;font-size:32px">▶</span></div>' },
      },
      {
        kind: 'write',
        prompt: 'Line the prices up at the bottom of .row, and center the .menu column.',
        starter: '.row {\n  display: flex;\n  height: 100px;\n  border: 1px solid #ccc;\n}',
        solution:
          '.row {\n  display: flex;\n  height: 100px;\n  border: 1px solid #ccc;\n  align-items: flex-end;\n}\n.menu {\n  display: flex;\n  flex-direction: column;\n  align-items: center;\n}',
        checks: [
          { label: '.row: align-items at the bottom', re: '\\.row\\s*\\{[^}]*align-items\\s*:\\s*(flex-end|end)', flags: 'i' },
          { label: '.menu is a flex column', re: '\\.menu\\s*\\{(?=[^}]*display\\s*:\\s*flex\\s*[;}])(?=[^}]*flex-direction\\s*:\\s*column)', flags: 'i' },
          { label: '.menu centers side to side with align-items', re: '\\.menu\\s*\\{[^}]*align-items\\s*:\\s*center', flags: 'i' },
        ],
        hint: 'In a column the cross axis runs side to side, so align-items moves things left and right.',
        explain: 'align-items follows the cross axis: up and down in a row, left and right in a column.',
        preview: {
          html: '<div class="row"><span>Tea $2</span><span style="font-size:28px">Cake $4</span><span>Pie $3</span></div><div class="menu"><a href="#">Home</a><a href="#">Order now</a><a href="#">Help</a></div>',
        },
      },
    ],
    // L4 Wrap and gap
    [
      {
        kind: 'write',
        prompt: 'Lay out the photo tiles so they wrap onto new lines, 12px apart.',
        starter: '.gallery div {\n  width: 90px;\n  height: 60px;\n  background-color: lightsteelblue;\n}',
        solution:
          '.gallery {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 12px;\n}\n.gallery div {\n  width: 90px;\n  height: 60px;\n  background-color: lightsteelblue;\n}',
        checks: [
          { label: '.gallery is display: flex', re: '\\.gallery\\s*\\{[^}]*display\\s*:\\s*flex\\s*[;}]', flags: 'i' },
          { label: 'Let items wrap', re: '\\.gallery\\s*\\{[^}]*flex-wrap\\s*:\\s*wrap', flags: 'i' },
          { label: 'A gap between tiles', re: '\\.gallery\\s*\\{[^}]*(?<![\\w-])gap\\s*:\\s*\\d', flags: 'i' },
        ],
        hint: 'All three go on the container, .gallery, not on the tiles.',
        explain: 'flex-wrap lets tiles move to a new line instead of squeezing; gap spaces them without edge margins.',
        preview: { html: '<div class="gallery"><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div></div>' },
      },
      {
        kind: 'write',
        prompt: 'Fix the tag cloud: let it wrap, and space it with gap instead of margins.',
        starter: '.tags {\n  display: flex;\n}\n.tags span {\n  margin: 4px 8px;\n  padding: 4px 8px;\n  background-color: #eee;\n}',
        solution: '.tags {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 8px 16px;\n}\n.tags span {\n  padding: 4px 8px;\n  background-color: #eee;\n}',
        checks: [
          { label: '.tags wraps', re: '\\.tags\\s*\\{[^}]*flex-wrap\\s*:\\s*wrap', flags: 'i' },
          { label: 'gap with a row and a column value', re: '\\.tags\\s*\\{[^}]*(?<![\\w-])gap\\s*:\\s*[\\d.]+[a-z%]*\\s+[\\d.]+[a-z%]*\\s*[;}]', flags: 'i' },
          { label: 'No margin on the spans', re: '^(?![\\s\\S]*\\.tags\\s+span\\s*\\{[^}]*(?<![\\w-])margin)', flags: 'i' },
        ],
        hint: 'gap: 8px 16px sets the row gap, then the column gap. Then drop the span margin.',
        explain: 'gap only adds space between items, so the cloud lines up with the edges; margins add space at the edges too.',
        preview: {
          html: '<div class="tags" style="width:240px"><span>css</span><span>flexbox</span><span>grid</span><span>animation</span><span>layout</span><span>colors</span><span>fonts</span></div>',
        },
      },
    ],
    // L5 Grow and shrink
    [
      {
        kind: 'write',
        prompt: 'Make the search input fill the bar while the button keeps its size.',
        starter: '',
        solution: '.search {\n  display: flex;\n  gap: 8px;\n}\n.search input {\n  flex: 1;\n}\n.search button {\n  flex: 0 0 auto;\n}',
        checks: [
          { label: '.search is display: flex', re: '\\.search\\s*\\{[^}]*display\\s*:\\s*flex\\s*[;}]', flags: 'i' },
          { label: 'The input grows: flex: 1', re: 'input\\s*\\{[^}]*flex(-grow)?\\s*:\\s*[1-9]', flags: 'i' },
          {
            label: 'The button never shrinks',
            re: 'button\\s*\\{[^}]*(flex\\s*:\\s*(none|0\\s+0)|flex-shrink\\s*:\\s*0)',
            flags: 'i',
          },
        ],
        hint: 'flex: 1 takes the spare space. flex: 0 0 auto (or none) keeps a box at its own size.',
        explain: 'The input grows into whatever room is left; the button neither grows nor shrinks.',
        preview: { html: '<div class="search"><input placeholder="Search recipes"><button>Go</button></div>' },
      },
      {
        kind: 'write',
        prompt: 'Keep the sidebar 200px, and split the rest 2 : 1 between main and .extra.',
        starter: '.layout {\n  display: flex;\n  gap: 8px;\n}',
        solution: '.layout {\n  display: flex;\n  gap: 8px;\n}\naside {\n  flex: 0 0 200px;\n}\nmain {\n  flex: 2;\n}\n.extra {\n  flex: 1;\n}',
        checks: [
          {
            label: 'aside: flex: 0 0 200px',
            re: 'aside\\s*\\{[^}]*(flex\\s*:\\s*0\\s+0\\s+200px|(?=[^}]*flex-basis\\s*:\\s*200px)(?=[^}]*flex-shrink\\s*:\\s*0))',
            flags: 'i',
          },
          { label: 'main: flex: 2', re: 'main\\s*\\{[^}]*flex(-grow)?\\s*:\\s*2\\b', flags: 'i' },
          { label: '.extra: flex: 1', re: '\\.extra\\s*\\{[^}]*flex(-grow)?\\s*:\\s*1\\b', flags: 'i' },
        ],
        hint: 'The flex shorthand is grow, shrink, basis. A grow of 2 takes twice the share of 1.',
        explain: 'The sidebar is locked at 200px; the leftover space is shared out in the ratio of the grow values.',
        preview: {
          html: '<div class="layout"><aside style="background:#ddd">Menu</aside><main style="background:#eef">Main story</main><div class="extra" style="background:#fed">Ads</div></div>',
        },
      },
    ],
  ],
};

export default unit;
