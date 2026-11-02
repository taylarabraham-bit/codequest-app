import type { DesktopUnit } from '../../../engine/types';

// Desktop edition: write-the-code challenges for HTML unit 16 (Templates & shadow DOM).
// lessons[i] runs after lesson i + 1. See docs/CONTENT_GUIDE.md.
const CUSTOM = '[a-z][a-z0-9]*-[a-z0-9-]*';

const unit: DesktopUnit = {
  lessons: [
    // L1 The template element
    [
      {
        kind: 'write',
        prompt: 'Add an empty playlist and a template for one track row.',
        starter: '',
        solution:
          '<ol id="playlist"></ol>\n<template id="track-row">\n  <li class="track">\n    <span class="title">Untitled</span>\n    <span class="length">0:00</span>\n  </li>\n</template>',
        checks: [
          { label: 'An empty list with an id', re: '<(ol|ul)[^>]*\\sid="[\\w-]+"[^>]*>\\s*</\\1>', flags: 'i' },
          { label: 'A <template> with an id', re: '<template[^>]*\\sid="[\\w-]+"', flags: 'i' },
          { label: 'An <li> row inside the template', re: '<template[^>]*>\\s*<li[\\s\\S]*</li>\\s*</template>', flags: 'i' },
          { label: 'Two spans for title and length', re: '<template[^>]*>[\\s\\S]*(<span[^>]*>[^<]*</span>[\\s\\S]*?){2}</template>', flags: 'i' },
        ],
        hint: 'The list stays empty for now. Everything inside <template> is a blueprint that never shows.',
        explain: 'The preview shows nothing: template content is parsed but not rendered until script clones it into the list.',
        preview: {},
      },
      {
        kind: 'write',
        prompt: 'Clone the card template into #cards once for each of two people.',
        starter:
          '<div id="cards"></div>\n<template id="card">\n  <article class="card"><h3>Name</h3><p>Volunteer</p></article>\n</template>\n<script>\n  const tpl = document.getElementById(\'card\');\n  // clone the template into #cards for Ada and Grace\n</script>',
        solution:
          '<div id="cards"></div>\n<template id="card">\n  <article class="card"><h3>Name</h3><p>Volunteer</p></article>\n</template>\n<script>\n  const tpl = document.getElementById(\'card\');\n  const box = document.getElementById(\'cards\');\n  for (const name of [\'Ada\', \'Grace\']) {\n    const copy = tpl.content.cloneNode(true);\n    copy.querySelector(\'h3\').textContent = name;\n    box.append(copy);\n  }\n</script>',
        checks: [
          {
            label: 'Copy the template’s content with cloneNode(true)',
            re: '\\.content\\.cloneNode\\(\\s*true\\s*\\)|importNode\\(\\s*[\\w.]+\\.content\\s*,\\s*true\\s*\\)',
          },
          { label: 'Set each card’s name with textContent', re: '\\.(textContent|innerText)\\s*=' },
          { label: 'Add the copies to the page', re: '\\.(append|appendChild|prepend|replaceChildren)\\(' },
          { label: 'Two names: Ada and Grace', re: '^(?=[\\s\\S]*[\'"`]Ada[\'"`])(?=[\\s\\S]*[\'"`]Grace[\'"`])' },
        ],
        hint: 'tpl.content is a fragment. Clone it, fill in the h3, then append it to the #cards div. Repeat or loop.',
        explain: 'Each clone is a fresh copy of the blueprint, so one template can stamp out as many cards as you need.',
        preview: { css: '.card{border:1px solid #ccc;border-radius:8px;padding:6px 10px;margin:6px 0}.card h3{margin:0}' },
      },
    ],
    // L2 Custom element names
    [
      {
        kind: 'write',
        prompt: 'Mark up a recipe card using three custom elements you name yourself.',
        starter: '',
        solution: '<recipe-card>\n  <recipe-title>Miso soup</recipe-title>\n  <cook-time>15 min</cook-time>\n</recipe-card>',
        checks: [
          { label: 'Three custom tags, each with a hyphen', re: `(<${CUSTOM}[\\s>][\\s\\S]*?){3}` },
          { label: 'One custom element wraps the others', re: `<(${CUSTOM})[^>]*>[\\s\\S]*<(${CUSTOM})[^>]*>[\\s\\S]*?</\\2>[\\s\\S]*</\\1>` },
          { label: 'Names in lowercase', re: '^(?![\\s\\S]*</?(?=[\\w-]*-)[\\w-]*[A-Z])' },
          { label: 'No self-closing custom tags', re: `^(?![\\s\\S]*<${CUSTOM}[^>]*/>)` },
        ],
        hint: 'Names like <recipe-card>: lowercase, at least one hyphen, and a real closing tag.',
        explain: 'The hyphen keeps your names clear of future HTML tags. Unknown elements act like spans until styled.',
        preview: { css: ':not(:defined){display:block;border-left:3px solid #8b5cf6;padding:2px 8px;margin:4px 0}' },
      },
      {
        kind: 'write',
        prompt: 'Fix these custom tag names and closing tags so they are valid.',
        starter: '<UserBadge>Admin</UserBadge>\n<rating>4.5</rating>\n<x-icon name="star" />\n<1-up>Extra life</1-up>',
        solution:
          '<user-badge>Admin</user-badge>\n<star-rating>4.5</star-rating>\n<x-icon name="star"></x-icon>\n<one-up>Extra life</one-up>',
        checks: [
          { label: 'Admin in a lowercase, hyphenated tag', re: `<(${CUSTOM})>\\s*Admin\\s*</\\1>` },
          { label: '4.5 in a hyphenated tag', re: `<(${CUSTOM})>\\s*4\\.5\\s*</\\1>` },
          { label: 'Close <x-icon> with </x-icon>', re: '<x-icon[^>]*\\sname="star"[^>]*>\\s*</x-icon>' },
          { label: 'Extra life in a name that starts with a letter', re: `<(${CUSTOM})>\\s*Extra life\\s*</\\1>` },
        ],
        hint: 'Start with a lowercase letter, include a hyphen, and never self-close.',
        explain: 'A custom name must start with a letter and contain a hyphen. <x-icon /> isn’t closed in HTML, so it would swallow what follows.',
        preview: { css: ':not(:defined){display:block;border-left:3px solid #8b5cf6;padding:2px 8px;margin:4px 0}' },
      },
    ],
    // L3 Declarative shadow DOM
    [
      {
        kind: 'write',
        prompt: 'Build a <weather-badge> whose shadow root styles its own paragraph.',
        starter: '',
        solution:
          '<weather-badge>\n  <template shadowrootmode="open">\n    <style>p { color: white; background: steelblue; padding: 4px 8px; }</style>\n    <p>Sunny, 24°C</p>\n  </template>\n</weather-badge>\n<p>This page paragraph stays plain.</p>',
        checks: [
          { label: 'A <weather-badge> host', re: '<weather-badge[^>]*>[\\s\\S]*</weather-badge>', flags: 'i' },
          { label: 'A <template shadowrootmode="open"> first inside it', re: '<weather-badge[^>]*>\\s*<template[^>]*\\sshadowrootmode="open"', flags: 'i' },
          { label: 'A <style> inside the template', re: '<template[^>]*\\sshadowrootmode[^>]*>[\\s\\S]*<style>[\\s\\S]*?\\{[\\s\\S]*?</style>[\\s\\S]*</template>', flags: 'i' },
          { label: 'A <p> inside the template', re: '<template[^>]*\\sshadowrootmode[^>]*>[\\s\\S]*<p>[^<]+</p>[\\s\\S]*</template>', flags: 'i' },
          { label: 'A plain <p> on the page, after the badge', re: '</weather-badge>\\s*<p>[^<]+</p>', flags: 'i' },
        ],
        hint: 'Host, then template shadowrootmode="open", then style and content inside the template.',
        explain: 'The p rule only reaches the shadow root, so the page paragraph below keeps its normal look.',
        preview: {},
      },
      {
        kind: 'write',
        prompt: 'This shadow root never forms. Fix the attribute and make it closed.',
        starter:
          '<price-tag>\n  <template shadowroot="open">\n    <style>span { font-weight: bold; color: green; }</style>\n    <span>$19</span>\n  </template>\n</price-tag>',
        solution:
          '<price-tag>\n  <template shadowrootmode="closed">\n    <style>span { font-weight: bold; color: green; }</style>\n    <span>$19</span>\n  </template>\n</price-tag>',
        checks: [
          { label: 'Use shadowrootmode="closed"', re: '<template[^>]*\\sshadowrootmode="closed"', flags: 'i' },
          { label: 'Drop the old shadowroot attribute', re: '^(?![\\s\\S]*\\sshadowroot=)', flags: 'i' },
          { label: 'Keep the style and price inside', re: '<template[^>]*>\\s*<style>[\\s\\S]*</style>\\s*<span>\\s*\\$19\\s*</span>\\s*</template>', flags: 'i' },
        ],
        hint: 'The attribute that turns a template into a shadow root is shadowrootmode.',
        explain: 'shadowroot was an early, non-standard name and is now ignored. closed still renders, but page scripts can’t reach the shadow root.',
        preview: {},
      },
    ],
    // L4 Slots
    [
      {
        kind: 'write',
        prompt: 'Give <movie-card> a shadow layout with a named title slot and a default slot.',
        starter: '',
        solution:
          '<movie-card>\n  <template shadowrootmode="open">\n    <h3><slot name="title">Untitled film</slot></h3>\n    <slot></slot>\n  </template>\n  <span slot="title">Arrival</span>\n  <p>Linguists decode an alien language.</p>\n</movie-card>',
        checks: [
          { label: 'A named <slot> with fallback text', re: '<slot[^>]*\\sname="[\\w-]+"[^>]*>[^<]*\\S[^<]*</slot>', flags: 'i' },
          { label: 'An unnamed <slot> too', re: '<slot(?![^>]*\\sname=)[^>]*>', flags: 'i' },
          {
            label: 'A child with slot="…" that fills the named slot',
            re: '<slot[^>]*\\sname="([\\w-]+)"[\\s\\S]*</template>[\\s\\S]*<\\w+[^>]*\\sslot="\\1"[^>]*>[^<]*\\S',
            flags: 'i',
          },
          { label: 'A child with no slot for the default slot', re: '</template>[\\s\\S]*<(p|div|span)(?![^>]*\\sslot=)[^>]*>[^<]*\\S[\\s\\S]*</movie-card>', flags: 'i' },
        ],
        hint: 'Slots go inside the template; the host’s own children go after it, with slot="title" on the title.',
        explain: 'The named slot shows Arrival instead of its fallback, and every child without a slot attribute lands in the unnamed slot.',
        preview: {},
      },
      {
        kind: 'write',
        prompt: 'Fill the shop item’s name and price slots; leave the badge on its fallback.',
        starter:
          '<shop-item>\n  <template shadowrootmode="open">\n    <style>.price { color: green; }</style>\n    <strong><slot name="name">Item</slot></strong>\n    <span class="price"><slot name="price">$0</slot></span>\n    <em><slot name="badge">In stock</slot></em>\n  </template>\n</shop-item>',
        solution:
          '<shop-item>\n  <template shadowrootmode="open">\n    <style>.price { color: green; }</style>\n    <strong><slot name="name">Item</slot></strong>\n    <span class="price"><slot name="price">$0</slot></span>\n    <em><slot name="badge">In stock</slot></em>\n  </template>\n  <span slot="name">Canvas tote</span>\n  <span slot="price">$24</span>\n</shop-item>',
        checks: [
          { label: 'A child with slot="name"', re: '</template>[\\s\\S]*<\\w+[^>]*\\sslot="name"[^>]*>[^<]*\\S', flags: 'i' },
          { label: 'A child with slot="price"', re: '</template>[\\s\\S]*<\\w+[^>]*\\sslot="price"[^>]*>[^<]*\\S', flags: 'i' },
          { label: 'Nothing fills the badge slot', not: 'slot="badge"' },
          { label: 'The children go inside <shop-item>', re: '</template>[\\s\\S]*\\sslot=[\\s\\S]*</shop-item>', flags: 'i' },
        ],
        hint: 'Add children after the template, inside the host, each with slot set to a slot’s name.',
        explain: 'Filled slots show your content; the empty badge slot falls back to In stock.',
        preview: {},
      },
    ],
    // L5 Styling the shadow
    [
      {
        kind: 'write',
        prompt: 'Make <status-pill> a rounded pill with :host, and colour its slotted em.',
        starter: '',
        solution:
          '<status-pill>\n  <template shadowrootmode="open">\n    <style>\n      :host { display: inline-block; padding: 2px 10px; border-radius: 999px; background: #dcfce7; }\n      ::slotted(em) { color: #166534; }\n    </style>\n    <slot></slot>\n  </template>\n  <em>Online</em>\n</status-pill>',
        checks: [
          { label: 'A shadow root with a <style>', re: '<template[^>]*\\sshadowrootmode="(open|closed)"[^>]*>\\s*<style>', flags: 'i' },
          { label: 'A :host rule with border-radius', re: ':host\\s*\\{[^}]*border-radius\\s*:', flags: 'i' },
          { label: 'A ::slotted(em) rule', re: '::slotted\\(\\s*em\\s*\\)\\s*\\{[^}]*[\\w-]+\\s*:', flags: 'i' },
          { label: 'A <slot> and an <em> child to fill it', re: '<slot[\\s\\S]*</template>\\s*<em>[^<]+</em>', flags: 'i' },
        ],
        hint: ':host targets <status-pill> itself; ::slotted(em) targets the em placed into the slot.',
        explain: 'Inside a shadow root you can’t select the host by name, so :host does it. ::slotted reaches light-DOM children shown in slots.',
        preview: {},
      },
      {
        kind: 'write',
        prompt: 'Let the page colour the inbox count red through a part.',
        starter:
          '<style>\n  /* page CSS: colour the badge count red */\n</style>\n<inbox-badge>\n  <template shadowrootmode="open">\n    <span>Inbox</span>\n    <b>12</b>\n  </template>\n</inbox-badge>',
        solution:
          '<style>\n  inbox-badge::part(count) { color: red; }\n</style>\n<inbox-badge>\n  <template shadowrootmode="open">\n    <span>Inbox</span>\n    <b part="count">12</b>\n  </template>\n</inbox-badge>',
        checks: [
          { label: 'Give the <b> a part name', re: '<b[^>]*\\spart="[\\w-]+"', flags: 'i' },
          { label: 'A page rule inbox-badge::part(…) with a red colour', re: 'inbox-badge::part\\(\\s*[\\w-]+\\s*\\)\\s*\\{[^}]*color\\s*:\\s*(red|#f00\\b|#ff0000)', flags: 'i' },
          { label: 'The rule names the same part', re: '::part\\(\\s*([\\w-]+)\\s*\\)[\\s\\S]*\\spart="\\1"', flags: 'i' },
        ],
        hint: 'part="count" on the b inside the shadow, then inbox-badge::part(count) in the page style.',
        explain: 'Page CSS can’t reach into a shadow root, except through parts the component chooses to expose.',
        preview: {},
      },
    ],
  ],
};

export default unit;
