import type { DesktopUnit } from '../../../engine/types';

// Desktop edition: write-the-code challenges for CSS unit 11 (Pseudo-classes & pseudo-elements).
// lessons[i] runs after lesson i + 1. See docs/CONTENT_GUIDE.md.

const PLAYLIST =
  '<ol class="playlist"><li>Intro</li><li>Neon Nights</li><li>Slow Burn</li><li>Afterglow</li><li>Outro</li></ol>';
const PODIUM =
  '<ul class="podium" style="list-style:none;padding:0"><li>🥇 Mia, 98</li><li>🥈 Leo, 91</li><li>🥉 Ana, 87</li><li>Sam, 80</li><li>Kai, 72</li></ul>';
const TILES =
  '<div class="grid">' +
  Array.from({ length: 9 }, (_, i) => `<span class="tile" style="display:inline-block;width:28%;margin:0 2% 6px 0;padding:8px 0;text-align:center;background:#eee">${i + 1}</span>`).join('') +
  '</div>';
const ARTICLE =
  '<article><h2>Trail report</h2><p>Snow is gone from the lower loop.</p><p>Mud near the bridge, bring boots.</p><p>Updated Sunday 6pm.</p></article>';
const TABS =
  '<ul class="tabs" style="list-style:none;padding:0;display:flex"><li style="padding:0 10px">Home</li><li style="padding:0 10px">Shop <span class="badge" style="background:crimson;color:#fff;border-radius:9px;padding:0 6px">3</span></li><li style="padding:0 10px">Cart <span class="badge" style="background:crimson;color:#fff;border-radius:9px;padding:0 6px"></span></li></ul>';
const BUTTONS =
  '<button class="btn primary">Save</button> <button class="btn">Preview</button> <button class="btn danger">Delete</button> <button class="btn">Share</button><p class="tip"></p>';
const SIGNUP =
  '<form><input type="email" required placeholder="Your email"><br><input type="email" value="sam@mail.com"><br><button disabled>Join the club</button></form>';
const TODO =
  '<div><input type="checkbox" id="t1" checked><label for="t1">Water the plants</label></div><div><input type="checkbox" id="t2"><label for="t2">Call the vet</label></div><div><input type="checkbox" id="t3" disabled><label for="t3">Renew passport (next year)</label></div>';
const STORY =
  '<div class="story"><p>Once upon a time, a lighthouse keeper found a letter in a bottle. It was addressed to him, and it was dated fifty years in the future.</p></div>';
const LINKS =
  '<input placeholder="Search recipes"><ul class="links"><li><a href="/soup">Soup</a></li><li><a href="/salad">Salad</a></li></ul>';

const unit: DesktopUnit = {
  lessons: [
    // L1 First, last and nth-child
    [
      {
        kind: 'write',
        prompt: 'Style the playlist: bold first song, gray last song, shaded even rows.',
        starter: '',
        solution:
          'li:first-child {\n  font-weight: bold;\n}\nli:last-child {\n  color: gray;\n}\nli:nth-child(even) {\n  background-color: #eee;\n}',
        checks: [
          { label: 'Bold the first item with :first-child', re: ':first-child\\s*\\{[^}]*font-weight\\s*:\\s*(bold|bolder|[6-9]00)', flags: 'i' },
          { label: 'Give the last item a text color with :last-child', re: ':last-child\\s*\\{[^}]*(?<![\\w-])color\\s*:', flags: 'i' },
          { label: 'Shade even rows with :nth-child(even)', re: ':nth-child\\(\\s*(even|2n)\\s*\\)\\s*\\{[^}]*background', flags: 'i' },
        ],
        hint: 'Put the pseudo-class right after li, with no space: li:first-child.',
        explain: ':first-child and :last-child look at position among siblings; :nth-child(even) picks items 2, 4, 6…',
        preview: { html: PLAYLIST },
      },
      {
        kind: 'write',
        prompt: 'Color the podium: gold, silver and bronze for the top three, faded last place.',
        starter: '.podium li {\n  padding: 4px 8px;\n}\n',
        solution:
          '.podium li {\n  padding: 4px 8px;\n}\n.podium li:first-child {\n  background-color: gold;\n}\n.podium li:nth-child(2) {\n  background-color: silver;\n}\n.podium li:nth-child(3) {\n  background-color: peru;\n}\n.podium li:last-child {\n  opacity: 0.5;\n}',
        checks: [
          { label: 'A background on the first item', re: ':(first-child|nth-child\\(\\s*1\\s*\\))\\s*\\{[^}]*background', flags: 'i' },
          { label: 'A background on item 2 with :nth-child(2)', re: ':nth-child\\(\\s*2\\s*\\)\\s*\\{[^}]*background', flags: 'i' },
          { label: 'A background on item 3 with :nth-child(3)', re: ':nth-child\\(\\s*3\\s*\\)\\s*\\{[^}]*background', flags: 'i' },
          { label: 'Fade the last item with opacity', re: ':last-child\\s*\\{[^}]*opacity\\s*:', flags: 'i' },
        ],
        hint: 'Write one rule per position: :first-child, :nth-child(2), :nth-child(3), :last-child.',
        explain: ':nth-child() counts from 1, so :nth-child(2) is the second item. :last-child works however long the list gets.',
        preview: { html: PODIUM },
      },
    ],
    // L2 nth formulas & of-type
    [
      {
        kind: 'write',
        prompt: 'Highlight every third photo tile and fade tiles 7 onward.',
        starter: '',
        solution: '.tile:nth-child(3n) {\n  background-color: gold;\n}\n.tile:nth-child(n+7) {\n  opacity: 0.4;\n}',
        checks: [
          { label: 'Every 3rd tile with :nth-child(3n) gets a background', re: ':nth-child\\(\\s*3n\\s*(\\+\\s*0\\s*)?\\)\\s*\\{[^}]*background', flags: 'i' },
          { label: 'Tiles 7 onward with :nth-child(n+7) are faded', re: ':nth-child\\(\\s*n\\s*\\+\\s*7\\s*\\)\\s*\\{[^}]*opacity\\s*:', flags: 'i' },
        ],
        hint: 'n counts 0, 1, 2…: 3n gives 3, 6, 9 and n+7 gives 7, 8, 9…',
        explain: 'An+B formulas pick patterns without extra classes, so the grid stays right when tiles are added.',
        preview: { html: TILES },
      },
      {
        kind: 'write',
        prompt: 'The intro style never applies. Fix it and style the last paragraph too.',
        starter: 'article p:first-child {\n  font-size: 1.2rem;\n}\n',
        solution:
          'article p:first-of-type {\n  font-size: 1.2rem;\n}\narticle p:last-of-type {\n  color: gray;\n  font-style: italic;\n}',
        checks: [
          { label: 'Make the first paragraph bigger with :first-of-type', re: 'p:first-of-type\\s*\\{[^}]*font-size\\s*:', flags: 'i' },
          { label: 'Style the last paragraph with :last-of-type', re: 'p:last-of-type\\s*\\{[^}]*[\\w-]+\\s*:', flags: 'i' },
          { label: 'Drop p:first-child (the h2 is the first child)', not: 'p:first-child' },
        ],
        hint: 'The h2 comes first, so no p is the first child. -of-type counts only the p elements.',
        explain: ':first-of-type and :last-of-type only count siblings with the same tag, so the heading no longer gets in the way.',
        preview: { html: ARTICLE },
      },
    ],
    // L3 :not() and :empty
    [
      {
        kind: 'write',
        prompt: 'Put dividers between the tabs and hide the empty badge.',
        starter: '',
        solution: 'li:not(:last-child) {\n  border-right: 1px solid #ccc;\n}\n.badge:empty {\n  display: none;\n}',
        checks: [
          { label: 'A border on every tab but the last, with :not(:last-child)', re: ':not\\(\\s*:last-child\\s*\\)\\s*\\{[^}]*border', flags: 'i' },
          { label: 'Hide .badge when it is :empty', re: '\\.badge:empty\\s*\\{[^}]*display\\s*:\\s*none', flags: 'i' },
        ],
        hint: 'Wrap the pseudo-class you want to skip inside :not(…).',
        explain: ':not(:last-child) skips just the last tab, so there is no stray divider. :empty matches an element with nothing inside.',
        preview: { html: TABS },
      },
      {
        kind: 'write',
        prompt: 'Make every plain button white, skipping .primary and .danger, and hide the empty tip.',
        starter:
          '.btn { padding: 6px 12px; border: 1px solid #333; }\n.primary { background-color: royalblue; color: white; }\n.danger { background-color: crimson; color: white; }\n',
        solution:
          '.btn { padding: 6px 12px; border: 1px solid #333; }\n.primary { background-color: royalblue; color: white; }\n.danger { background-color: crimson; color: white; }\n.btn:not(.primary, .danger) {\n  background-color: white;\n}\n.tip:empty {\n  display: none;\n}',
        checks: [
          {
            label: 'One :not() with a list that skips .primary and .danger',
            re: ':not\\((?=[^)]*\\.primary)(?=[^)]*\\.danger)[^)]*,[^)]*\\)',
            flags: 'i',
          },
          { label: 'Those buttons get a white background', re: ':not\\([^)]*\\)\\s*\\{[^}]*background(-color)?\\s*:\\s*(white|#fff\\b|#ffffff)', flags: 'i' },
          { label: 'Hide .tip when it is :empty', re: '\\.tip:empty\\s*\\{[^}]*display\\s*:\\s*none', flags: 'i' },
        ],
        hint: ':not() takes a comma list: .btn:not(.a, .b).',
        explain: 'A list inside :not() excludes any of them, so one rule covers every ordinary button.',
        preview: { html: BUTTONS },
      },
    ],
    // L4 Form states
    [
      {
        kind: 'write',
        prompt: 'Show red borders on invalid emails, green on valid ones, and fade the disabled button.',
        starter: '',
        solution:
          'input:invalid {\n  border: 2px solid crimson;\n}\ninput:valid {\n  border: 2px solid seagreen;\n}\nbutton:disabled {\n  opacity: 0.5;\n}',
        checks: [
          { label: 'A border on input:invalid', re: ':invalid\\s*\\{[^}]*border', flags: 'i' },
          { label: 'A border on input:valid', re: '(?<!in):valid\\s*\\{[^}]*border', flags: 'i' },
          { label: 'Fade button:disabled with opacity', re: ':disabled\\s*\\{[^}]*opacity\\s*:', flags: 'i' },
        ],
        hint: 'The empty field is required, so it starts out :invalid.',
        explain: 'The browser tracks validity for you, so :valid and :invalid update as the learner types.',
        preview: { html: SIGNUP },
      },
      {
        kind: 'write',
        prompt: 'Cross out done to-dos and gray out the disabled one’s label.',
        starter: 'label {\n  cursor: pointer;\n}\n',
        solution:
          'label {\n  cursor: pointer;\n}\ninput:checked + label {\n  text-decoration: line-through;\n  color: gray;\n}\ninput:disabled + label {\n  opacity: 0.5;\n  cursor: not-allowed;\n}',
        checks: [
          { label: 'Strike through the label after a :checked box', re: ':checked\\s*\\+\\s*label\\s*\\{[^}]*text-decoration(-line)?\\s*:[^;}]*line-through', flags: 'i' },
          { label: 'Change that label’s color too', re: ':checked\\s*\\+\\s*label\\s*\\{[^}]*(?<![\\w-])color\\s*:', flags: 'i' },
          { label: 'Gray out the label after a :disabled box', re: ':disabled\\s*\\+\\s*label\\s*\\{[^}]*(opacity|(?<![\\w-])color)\\s*:', flags: 'i' },
        ],
        hint: 'The label comes right after its checkbox, so use input:checked + label.',
        explain: 'The + combinator reaches the very next sibling, so the box’s state can restyle its own label.',
        preview: { html: TODO },
      },
    ],
    // L5 More pseudo-elements
    [
      {
        kind: 'write',
        prompt: 'Give the story a big drop cap and a bold first line.',
        starter: '',
        solution:
          '.story p::first-letter {\n  font-size: 3em;\n  float: left;\n  line-height: 1;\n}\n.story p::first-line {\n  font-weight: bold;\n}',
        checks: [
          { label: 'Make ::first-letter bigger with font-size', re: '::?first-letter\\s*\\{[^}]*font-size\\s*:', flags: 'i' },
          { label: 'Bold the ::first-line', re: '::?first-line\\s*\\{[^}]*font-weight\\s*:\\s*(bold|bolder|[6-9]00)', flags: 'i' },
        ],
        hint: 'Pseudo-elements use two colons: p::first-letter.',
        explain: 'The browser works out the first letter and first line itself, so they stay right however the text wraps.',
        preview: { html: STORY },
      },
      {
        kind: 'write',
        prompt: 'Polish the search box and links: placeholder, bullets and visible URLs.',
        starter: '.links a {\n  color: teal;\n}\n',
        solution:
          '.links a {\n  color: teal;\n}\ninput::placeholder {\n  color: gray;\n  font-style: italic;\n}\n.links li::marker {\n  color: crimson;\n}\n.links a::after {\n  content: " (" attr(href) ")";\n  color: gray;\n}',
        checks: [
          { label: 'Style the ::placeholder (color or italic)', re: '::placeholder\\s*\\{[^}]*(color|font-style)\\s*:', flags: 'i' },
          { label: 'Color the bullets with ::marker', re: '::marker\\s*\\{[^}]*color\\s*:', flags: 'i' },
          { label: 'Show each link’s href after it with attr(href)', re: '::?after\\s*\\{[^}]*content\\s*:[^;}]*attr\\(\\s*href\\s*\\)', flags: 'i' },
        ],
        hint: 'content can join strings and attr(href) with spaces: content: " (" attr(href) ")";',
        explain: '::placeholder and ::marker style parts you can’t select in HTML, and attr() pulls an attribute’s value into generated content.',
        preview: { html: LINKS },
      },
    ],
  ],
};

export default unit;
