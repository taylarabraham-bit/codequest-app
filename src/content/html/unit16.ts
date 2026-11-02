import type { Unit } from "../../engine/types";

/** Page styles for the hosts: custom elements are inline until styled. */
const BOX =
  "user-card,info-box,note-box,promo-box,weather-card,profile-card,deal-card,song-card,tag-chip,menu-card,quote-card{display:block;border:1px solid #ccc;border-radius:8px;padding:6px 10px;margin:4px 0}";

const unit: Unit = {
  title: "Templates & shadow DOM",
  blurb:
    "Inert templates, custom tags, declarative shadow roots, slots, scoped styles and parts.",
  lessons: [
    {
      title: "The template element",
      concept: {
        body: "Markup inside <template> is parsed but never shown: its images don’t load and its scripts don’t run. It waits as a blueprint that script clones into the page with template.content. That’s why the preview shows nothing from inside it.",
        code: '<ul id="songs"></ul>\n<template id="row">\n  <li class="song">Untitled</li>\n</template>',
      },
      exercises: [
        {
          kind: "fill",
          prompt: "Pick the element that hides a blueprint.",
          code: '<p>Your cards:</p>\n<___ id="card">\n  <p>Blueprint card</p>\n</template>',
          blanks: [
            { answer: ["template"], options: ["template", "div", "section"] },
          ],
          hint: "Match the closing tag.",
          explain:
            "Only Your cards shows in the preview. Everything inside template stays parsed but unrendered.",
          preview: {},
        },
        {
          kind: "build",
          prompt: "Build a toast template with id toast saying Saved!",
          answer: [
            "<template",
            'id="toast"',
            ">",
            "<p>",
            "Saved!",
            "</p>",
            "</template>",
          ],
          distractors: ["hidden", "<div"],
          hint: "The id lets script find the blueprint.",
          explain:
            "Nothing appears in the preview: the toast waits in the template until script clones it.",
          preview: {},
        },
        {
          kind: "fill",
          prompt: "Pick the property script clones from.",
          code: '<template id="row">\n  <li>New song</li>\n</template>\n<!-- script: row.___.cloneNode(true) -->',
          blanks: [
            { answer: ["content"], options: ["content", "innerText", "value"] },
          ],
          hint: "It holds what’s inside the template.",
          explain:
            "template.content is a document fragment of the parsed markup. Cloning it gives a fresh copy each time.",
          preview: {},
        },
        {
          kind: "order",
          prompt: "Order it: the visible list, then the row template.",
          lines: [
            '<ul id="songs">',
            "  <li>Intro</li>",
            "</ul>",
            '<template id="song">',
            "  <li>New song</li>",
            "</template>",
          ],
          hint: "Intro is visible; New song is the blueprint.",
          explain:
            "Only Intro shows. Script would clone the template’s li into the ul for every song added.",
          preview: {},
        },
        {
          kind: "fill",
          prompt: "Pick the wrapper whose script will NOT run.",
          code: '<___>\n  <script>alert("Boo!")</script>\n  <img src="huge-banner.jpg" alt="Sale">\n</template>',
          blanks: [
            { answer: ["template"], options: ["template", "div", "aside"] },
          ],
          hint: "Only one of these keeps its content inert.",
          explain:
            "Inside a template, scripts don’t run and images don’t download until a copy is put in the page.",
          preview: {},
        },
        {
          kind: "build",
          prompt: "Build a template holding a table row with one cell, Name.",
          answer: [
            "<template",
            ">",
            "<tr>",
            "<td>",
            "Name",
            "</td>",
            "</tr>",
            "</template>",
          ],
          distractors: ["<div>", "hidden"],
          hint: "Row first, then the cell inside it.",
          explain:
            "A tr outside a table would be thrown away, but template keeps it intact, ready to clone into a tbody.",
          preview: {},
        },
        {
          kind: "fill",
          prompt: "Give the template the id the script looks for.",
          code: '<template id="___">\n  <span class="badge">New</span>\n</template>\n<!-- script: document.getElementById("badge").content -->',
          blanks: [
            { answer: ["badge"], options: ["badge", "#badge", ".badge"] },
          ],
          hint: "getElementById takes the plain id.",
          explain:
            "The id is written bare. # and . are CSS selector syntax, not part of the id.",
          preview: {},
        },
      ],
    },
    {
      title: "Custom element names",
      concept: {
        body: "You can invent your own tags, called autonomous custom elements. The name starts with a lowercase letter and must contain a hyphen, like <user-card> or <x-icon>, so it never clashes with a future HTML tag. It always needs a closing tag, and until styled it’s inline like a span.",
        code: '<user-card>\n  <h3>Ada</h3>\n</user-card>\n<star-rating value="4"></star-rating>',
      },
      exercises: [
        {
          kind: "fill",
          prompt: "Open the custom user card.",
          code: "<___>\n  <h3>Ada Lovelace</h3>\n</user-card>",
          blanks: [
            {
              answer: ["user-card"],
              options: ["user-card", "usercard", "card"],
            },
          ],
          hint: "Match the closing tag.",
          explain:
            "user-card has a hyphen, so it’s a valid custom element name.",
          preview: { css: BOX },
        },
        {
          kind: "fill",
          prompt: "Pick what every custom tag name needs.",
          code: "<!-- every custom tag needs a ___ -->\n<chat-bubble>See you at 8!</chat-bubble>",
          blanks: [
            { answer: ["hyphen"], options: ["hyphen", "number", "capital"] },
          ],
          hint: "Look between chat and bubble.",
          explain:
            "Built-in HTML tags never contain a hyphen, so hyphenated names are safe from future clashes.",
          preview: {},
        },
        {
          kind: "build",
          prompt: "Build a price-tag with currency EUR showing 12.50.",
          answer: [
            "<price-tag",
            'currency="EUR"',
            ">",
            "12.50",
            "</price-tag>",
          ],
          distractors: ["/>", "<pricetag"],
          hint: "Custom tags open and close like a span.",
          explain:
            "Custom elements can have their own attributes, and they always need a full closing tag.",
          preview: {},
        },
        {
          kind: "fill",
          prompt: "Close the chat bubble.",
          code: "<chat-bubble>Running late!___\n<p>Sent 9:02</p>",
          blanks: [
            {
              answer: ["</chat-bubble>"],
              options: ["</chat-bubble>", "/>", "</chat>"],
            },
          ],
          hint: "Custom elements are never void.",
          explain:
            "Only built-in void tags like img may skip the close. <chat-bubble/> would just open it and swallow the next paragraph.",
          preview: {},
        },
        {
          kind: "fill",
          prompt: "Pick a valid name for the status pill.",
          code: "<___>Online</___>",
          blanks: [
            {
              answer: ["status-pill"],
              options: ["status-pill", "status_pill", "statuspill"],
            },
            {
              answer: ["status-pill"],
              options: ["status-pill", "status_pill", "statuspill"],
            },
          ],
          hint: "An underscore isn’t a hyphen.",
          explain:
            "Only a hyphen makes a custom element name. status_pill is just an unknown tag.",
          preview: {},
        },
        {
          kind: "build",
          prompt: "Build an empty autonomous emoji-picker tag.",
          answer: ["<emoji-picker", ">", "</emoji-picker>"],
          distractors: ["<button", 'is="emoji-picker"'],
          hint: "Autonomous means its own tag, not a button with is.",
          explain:
            'is="…" customizes a built-in tag, but Safari doesn’t support it. An autonomous tag works everywhere.',
          preview: {},
        },
        {
          kind: "order",
          prompt: "Order the profile card: avatar, name, then follow button.",
          lines: [
            "<profile-card>",
            '  <avatar-pic initials="AL"></avatar-pic>',
            "  <h3>Ada Lovelace</h3>",
            "  <follow-button>Follow</follow-button>",
            "</profile-card>",
          ],
          hint: "The card wraps everything.",
          explain:
            "Custom tags nest like any others. The page CSS here makes profile-card a block, since custom tags start inline.",
          preview: { css: BOX },
        },
      ],
    },
    {
      title: "Declarative shadow DOM",
      concept: {
        body: 'Put <template shadowrootmode="open"> first inside an element and the parser turns it into a shadow root: a private tree that renders with no JavaScript. Styles inside it apply only there, and page styles don’t reach in. shadowrootmode="closed" also hides it from page scripts.',
        code: '<info-box>\n  <template shadowrootmode="open">\n    <style>p { color: teal; }</style>\n    <p>Drawn from the shadow root</p>\n  </template>\n</info-box>',
      },
      exercises: [
        {
          kind: "order",
          prompt: "Order the weather card with its shadow root.",
          lines: [
            "<weather-card>",
            '  <template shadowrootmode="open">',
            "    <h3>Oslo</h3>",
            "    <p>Snow, -4°C</p>",
            "  </template>",
            "</weather-card>",
          ],
          hint: "The template sits directly inside the host.",
          explain:
            "The template becomes the card’s shadow root, so Oslo shows even though no script ran.",
          preview: { css: BOX },
        },
        {
          kind: "fill",
          prompt: "Type the mode that lets page scripts see the root.",
          code: '<info-box>\n  <template shadowrootmode="___">\n    <p>Tip: drink water.</p>\n  </template>\n</info-box>',
          blanks: [{ answer: ["open"] }],
          hint: "The opposite of closed.",
          explain:
            "With open, page script can reach it through element.shadowRoot. Either mode renders the same.",
          preview: { css: BOX },
        },
        {
          kind: "build",
          prompt: "Build an info-box with an open shadow root saying Shadow!",
          answer: [
            "<info-box>",
            "<template",
            'shadowrootmode="open"',
            ">",
            "Shadow!",
            "</template>",
            "</info-box>",
          ],
          distractors: ['shadowroot="open"', 'mode="open"'],
          hint: "The attribute is shadow, root, mode in one word.",
          explain:
            "The parser swaps the template for a real shadow root, so Shadow! appears with no script at all.",
          preview: { css: BOX },
        },
        {
          kind: "fill",
          prompt: "Type the element that holds the shadow’s CSS.",
          code: '<p>Page text</p>\n<note-box>\n  <template shadowrootmode="open">\n    <___>p { color: crimson; }</style>\n    <p>Shadow text</p>\n  </template>\n</note-box>',
          blanks: [{ answer: ["style"] }],
          hint: "Match the closing tag.",
          explain:
            "Only Shadow text turns crimson. A style inside a shadow root is scoped to that root.",
          preview: { css: BOX },
        },
        {
          kind: "fix",
          prompt: "The template shows nothing. Tap the bug.",
          code: '<info-box>\n  <template [[shadowroot]]="open">\n    <p>Free shipping today</p>\n  </template>\n</info-box>',
          fix: "shadowrootmode",
          options: ["shadowrootmode", "shadow", "mode"],
          hint: "The standard name ends in mode.",
          explain:
            "shadowroot was an early Chrome-only name. Without shadowrootmode it stays a plain, inert template.",
          preview: { css: BOX },
        },
        {
          kind: "fill",
          prompt: "Type the mode that hides the root from page scripts.",
          code: '<bank-pin>\n  <template shadowrootmode="___">\n    <p>Enter your PIN</p>\n  </template>\n</bank-pin>',
          blanks: [{ answer: ["closed"] }],
          hint: "The opposite of open.",
          explain:
            "With closed, element.shadowRoot returns null. It still renders and still keeps page styles out.",
          preview: {},
        },
        {
          kind: "order",
          prompt: "Order it: page style, page heading, then the component.",
          lines: [
            "<style>h2 { color: red; }</style>",
            "<h2>Page heading</h2>",
            "<promo-box>",
            '  <template shadowrootmode="open">',
            "    <h2>Not red</h2>",
            "  </template>",
            "</promo-box>",
          ],
          hint: "The style applies to the page first.",
          explain:
            "The page rule turns its own h2 red, but can’t reach the h2 inside the shadow root.",
          preview: { css: BOX },
        },
      ],
    },
    {
      title: "Slots",
      concept: {
        body: 'A <slot> in the shadow root is a hole where the host’s own children appear. A named slot is filled by a child with slot="that-name"; children with no slot attribute go to the unnamed slot. Content inside <slot> is a fallback, shown only when nothing fills it.',
        code: '<user-card>\n  <template shadowrootmode="open">\n    <b><slot name="name">Anonymous</slot></b> <slot></slot>\n  </template>\n  <span slot="name">Ada</span> loves maths.\n</user-card>',
      },
      exercises: [
        {
          kind: "build",
          prompt: "Build an empty slot named title.",
          answer: ["<slot", 'name="title"', ">", "</slot>"],
          distractors: ['slot="title"', 'id="title"'],
          hint: "Slots are named with name; children pick one with slot.",
          explain:
            'name goes on the slot in the shadow root. The host’s child uses slot="title" to land there.',
        },
        {
          kind: "fill",
          prompt: "Type the attribute that sends the price into its slot.",
          code: '<deal-card>\n  <template shadowrootmode="open">\n    <p>Today only: <slot name="price"></slot></p>\n  </template>\n  <span ___="price">$9</span>\n</deal-card>',
          blanks: [{ answer: ["slot"] }],
          hint: "The same word as the element it targets.",
          explain:
            'slot="price" assigns the span to the slot named price, so $9 shows inside the shadow’s paragraph.',
          preview: { css: BOX },
        },
        {
          kind: "order",
          prompt: "Order it: shadow root with a slot, then the light child.",
          lines: [
            "<song-card>",
            '  <template shadowrootmode="open">',
            '    <p>Now playing: <slot name="song"></slot></p>',
            "  </template>",
            '  <em slot="song">Clair de Lune</em>',
            "</song-card>",
          ],
          hint: "The template usually goes first inside the host.",
          explain:
            "The em lives in the page, but it’s drawn where the slot sits in the shadow root.",
          preview: { css: BOX },
        },
        {
          kind: "fix",
          prompt: "The heading lands in the wrong place. Tap the bug.",
          code: '<deal-card>\n  <template shadowrootmode="open">\n    <header><slot name="title"></slot></header>\n    <slot></slot>\n  </template>\n  <h2 [[name]]="title">Summer sale</h2>\n  <p>Half price shoes.</p>\n</deal-card>',
          fix: "slot",
          options: ["slot", "part", "for"],
          hint: "Children choose a slot with a different attribute than slots use.",
          explain:
            'name on the h2 means nothing to slots, so it fell into the unnamed slot. slot="title" puts it in the header.',
          preview: { css: BOX },
        },
        {
          kind: "build",
          prompt: "Build a heading for the title slot: Weekly deals.",
          answer: ["<h2", 'slot="title"', ">", "Weekly deals", "</h2>"],
          distractors: ['name="title"', 'slot="#title"'],
          hint: "A bare slot name, no #.",
          explain:
            "The heading stays a page element you can read and style, but it shows where the title slot is.",
        },
        {
          kind: "order",
          prompt:
            "Order the card: named slot with fallback, then the default slot.",
          lines: [
            "<quote-card>",
            '  <template shadowrootmode="open">',
            '    <slot name="who">Unknown</slot>',
            "    <slot></slot>",
            "  </template>",
            "  <p>Stay hungry.</p>",
            "</quote-card>",
          ],
          hint: 'Nothing has slot="who", so its fallback shows.',
          explain:
            "Unknown is the fallback because no child targets who. The paragraph has no slot attribute, so it fills the unnamed slot.",
          preview: { css: BOX },
        },
        {
          kind: "fill",
          prompt: "Type the slot name the subtitle needs.",
          code: '<user-card>\n  <template shadowrootmode="open">\n    <h3>Ada</h3>\n    <p><slot name="___"></slot></p>\n  </template>\n  <em slot="subtitle">First programmer</em>\n</user-card>',
          blanks: [{ answer: ["subtitle"] }],
          hint: "Look at the em.",
          explain:
            "The slot’s name and the child’s slot value must match, or the em isn’t shown at all.",
          preview: { css: BOX },
        },
      ],
    },
    {
      title: "Styling the shadow",
      concept: {
        body: 'Inside a shadow root, :host styles the host element itself and ::slotted(p) styles slotted children. Page CSS can’t reach in, except through parts: mark an element part="label" and style it from the page with tag-chip::part(label).',
        code: '<template shadowrootmode="open">\n  <style>:host { display: block; } ::slotted(p) { margin: 0; }</style>\n  <span part="label"><slot></slot></span>\n</template>\n<!-- page CSS: tag-chip::part(label) { color: red; } -->',
      },
      exercises: [
        {
          kind: "fill",
          prompt: "Pick the selector for the host itself.",
          code: '<menu-card>\n  <template shadowrootmode="open">\n    <style>___ { display: block; border: 2px solid teal; }</style>\n    <p>Soup of the day</p>\n  </template>\n</menu-card>',
          blanks: [{ answer: [":host"], options: [":host", ":root", "this"] }],
          hint: "The element hosting the shadow root.",
          explain:
            ":host matches menu-card from inside its own shadow root, so the component sets its own default look.",
          preview: {},
        },
        {
          kind: "fill",
          prompt: "Pick the selector that styles slotted paragraphs.",
          code: '<menu-card>\n  <template shadowrootmode="open">\n    <style>___(p) { color: teal; }</style>\n    <slot></slot>\n  </template>\n  <p>Pumpkin soup</p>\n</menu-card>',
          blanks: [
            {
              answer: ["::slotted"],
              options: ["::slotted", "::part", ":host"],
            },
          ],
          hint: "It targets what fills a slot.",
          explain:
            "::slotted(p) reaches page children placed in a slot. A plain p rule in the shadow wouldn’t match them.",
          preview: { css: BOX },
        },
        {
          kind: "build",
          prompt: "Build a span exposed as part badge, saying New.",
          answer: ["<span", 'part="badge"', ">", "New", "</span>"],
          distractors: ['class="badge"', 'slot="badge"'],
          hint: "The attribute that ::part looks for.",
          explain:
            'part="badge" is a public styling hook: the page can now style it with ::part(badge).',
        },
        {
          kind: "type",
          prompt: "Type the page selector for tag-chip’s label part.",
          template:
            '<style>\n  ___ { color: crimson; }\n</style>\n<tag-chip>\n  <template shadowrootmode="open">\n    <span part="label">Sale</span>\n  </template>\n</tag-chip>',
          accept: ["tag-chip::part(label)", "::part(label)"],
          hint: "The host’s tag, ::part, then the name in brackets.",
          explain:
            "Page CSS can’t see inside the shadow, but it can style anything marked with part.",
          preview: { css: BOX },
        },
        {
          kind: "fix",
          prompt: "The page’s ::part(title) rule does nothing. Tap the bug.",
          code: '<tag-chip>\n  <template shadowrootmode="open">\n    <b [[class]]="title">Vegan</b>\n  </template>\n</tag-chip>',
          fix: "part",
          options: ["part", "slot", "id"],
          hint: "Classes inside a shadow root are private.",
          explain:
            'A class can’t be reached from the page. part="title" exposes the b to tag-chip::part(title).',
          preview: { css: BOX + "tag-chip::part(title){color:crimson}" },
        },
        {
          kind: "order",
          prompt: "Order it: shadow styles, the slot, then the page paragraph.",
          lines: [
            "<note-box>",
            '  <template shadowrootmode="open">',
            "    <style>:host { background: lightyellow; } ::slotted(p) { font-style: italic; }</style>",
            "    <slot></slot>",
            "  </template>",
            "  <p>Buy oat milk.</p>",
            "</note-box>",
          ],
          hint: "Styles come first inside the shadow root.",
          explain:
            ":host paints the note itself yellow and ::slotted makes the page’s paragraph italic.",
          preview: {},
        },
        {
          kind: "type",
          prompt: "Type a :host rule that makes the host display block.",
          template:
            '<tag-chip>\n  <template shadowrootmode="open">\n    <style>___</style>\n    <slot></slot>\n  </template>\n  Ready\n</tag-chip>',
          accept: [":host { display: block; }", ":host { display: block }"],
          hint: ":host, then a normal declaration in braces.",
          explain:
            "Custom tags start inline. :host lets the component set its own display without page CSS.",
          preview: {},
        },
      ],
    },
  ],
  boss: [
    {
      kind: "order",
      prompt: "Order the card: shadow root, styles, slots, then the children.",
      lines: [
        "<user-card>",
        '  <template shadowrootmode="open">',
        "    <style>:host { display: block; } ::slotted(h3) { margin: 0; }</style>",
        '    <slot name="name"></slot> <slot></slot>',
        "  </template>",
        '  <h3 slot="name">Grace Hopper</h3>',
        "  <p>Wrote the first compiler.</p>",
        "</user-card>",
      ],
      hint: "Styles first in the shadow root, children after the template.",
      explain:
        "By convention the template comes first in the host. The h3 lands in the name slot and gets the ::slotted rule.",
      preview: {},
    },
    {
      kind: "fix",
      prompt: "Nothing renders from the template. Tap the bug.",
      code: '<info-box>\n  <template shadowrootmode=[["shadow"]]>\n    <p>Back in 5 minutes</p>\n  </template>\n</info-box>',
      fix: '"open"',
      options: ['"open"', '"true"', '"on"'],
      hint: "There are only two modes.",
      explain:
        "shadowrootmode must be open or closed. Any other value leaves an ordinary, inert template.",
      preview: { css: BOX },
    },
    {
      kind: "build",
      prompt: "Build a price span for the price slot: €4.",
      answer: ["<span", 'slot="price"', ">", "€4", "</span>"],
      distractors: ['name="price"', 'part="price"'],
      hint: "Children choose a slot by its name.",
      explain:
        "slot assigns a child to a slot; part exposes a shadow element to page CSS. Different jobs.",
    },
    {
      kind: "type",
      prompt: "Type the tag that starts an open shadow root.",
      template:
        "<deal-card>\n  ___\n    <p>2 for 1</p>\n  </template>\n</deal-card>",
      accept: [
        '<template shadowrootmode="open">',
        "<template shadowrootmode=open>",
      ],
      hint: "A template with one attribute.",
      explain:
        "The parser attaches the shadow root as it reads the page, so it shows even with scripts off.",
      preview: { css: BOX },
    },
    {
      kind: "fill",
      prompt: "Type the attribute that lets the page style the icon.",
      code: '<style>tag-chip::part(icon) { color: gold; }</style>\n<tag-chip>\n  <template shadowrootmode="open">\n    <span ___="icon">★</span> <slot></slot>\n  </template>\n  Favourite\n</tag-chip>',
      blanks: [{ answer: ["part"] }],
      hint: "It matches the pseudo-element’s name.",
      explain:
        'part="icon" is what ::part(icon) targets. Without it, the shadow’s span is out of the page’s reach.',
      preview: { css: BOX },
    },
    {
      kind: "fill",
      prompt: "Pick the valid custom element name.",
      code: '<___ level="3"></___>',
      blanks: [
        {
          answer: ["skill-meter"],
          options: ["skill-meter", "SkillMeter", "meter"],
        },
        {
          answer: ["skill-meter"],
          options: ["skill-meter", "SkillMeter", "meter"],
        },
      ],
      hint: "Lowercase, with a hyphen.",
      explain:
        "meter is already a built-in tag, and SkillMeter has no hyphen. skill-meter follows the rules.",
      preview: {},
    },
    {
      kind: "build",
      prompt: "Build a template with id tip holding Drink water.",
      answer: [
        "<template",
        'id="tip"',
        ">",
        "<p>",
        "Drink water",
        "</p>",
        "</template>",
      ],
      distractors: ['shadowrootmode="open"', "hidden"],
      hint: "A plain blueprint, not a shadow root.",
      explain:
        "Without shadowrootmode the template stays inert, waiting for script to clone its content.",
      preview: {},
    },
    {
      kind: "order",
      prompt: "Order it: page CSS with ::part, then the chip.",
      lines: [
        "<style>tag-chip::part(text) { color: purple; }</style>",
        "<tag-chip>",
        '  <template shadowrootmode="open">',
        "    <style>span { font-weight: bold; }</style>",
        '    <span part="text">Limited</span>',
        "  </template>",
        "</tag-chip>",
      ],
      hint: "The page’s style is outside the host.",
      explain:
        "The shadow style makes the span bold, and the page adds purple through the text part. Both apply.",
      preview: { css: BOX },
    },
    {
      kind: "type",
      prompt: "Type a slot named price that falls back to Free.",
      template:
        '<deal-card>\n  <template shadowrootmode="open">\n    <p>Price: ___</p>\n  </template>\n</deal-card>',
      accept: [
        '<slot name="price">Free</slot>',
        "<slot name=price>Free</slot>",
      ],
      hint: "The fallback goes between the slot tags.",
      explain:
        'No child has slot="price", so the fallback Free shows. Add one and it replaces Free.',
      preview: { css: BOX },
    },
    {
      kind: "fill",
      prompt: "Style the host and its slotted paragraphs.",
      code: '<note-box>\n  <template shadowrootmode="open">\n    <style>\n      ___ { display: block; border: 1px dashed gray; }\n      ___(p) { color: navy; }\n    </style>\n    <slot></slot>\n  </template>\n  <p>Call the vet.</p>\n</note-box>',
      blanks: [
        { answer: [":host"], options: [":host", "::part", ":root"] },
        { answer: ["::slotted"], options: ["::slotted", "::part", ":host"] },
      ],
      hint: "One targets the element itself, one what fills its slot.",
      explain:
        ":host styles note-box from inside, and ::slotted(p) reaches the page’s paragraph shown in the slot.",
      preview: {},
    },
  ],
};

export default unit;
