import type { DesktopUnit } from '../../../engine/types';

// Desktop edition: write-the-code challenges for HTML unit 11 (Interactive elements).
// lessons[i] runs after lesson i + 1. See docs/CONTENT_GUIDE.md.
const unit: DesktopUnit = {
  lessons: [
    // L1 Disclosure widgets
    [
      {
        kind: 'write',
        prompt: 'Write two bike-rental FAQ entries with details; start the second one open.',
        starter: '',
        solution:
          '<details>\n  <summary>Do you rent helmets?</summary>\n  <p>Yes, free with every bike.</p>\n</details>\n<details open>\n  <summary>Can I return late?</summary>\n  <p>Up to 30 minutes, no charge.</p>\n</details>',
        checks: [
          { label: 'Two <details> elements', re: '(<details[\\s>][\\s\\S]*?</details>[\\s\\S]*?){2}', flags: 'i' },
          { label: 'Each starts with a <summary> question', re: '(<details[^>]*>\\s*<summary>[^<]*\\S[^<]*</summary>[\\s\\S]*?){2}', flags: 'i' },
          { label: 'An answer in a <p> after each summary', re: '(</summary>\\s*<p>[\\s\\S]+?</p>[\\s\\S]*?){2}', flags: 'i' },
          { label: 'One entry starts open', re: '<details[^>]*\\sopen[\\s>=]', flags: 'i' },
        ],
        hint: 'details wraps the whole entry, summary is the clickable line, and open is a boolean attribute.',
        explain: 'The summary stays visible as the toggle; everything else inside details hides until it opens. open just sets the starting state.',
        preview: {},
      },
      {
        kind: 'write',
        prompt: 'Make these panels an accordion with h3 labels, Shipping open first.',
        starter:
          '<details>\n  <summary>Shipping</summary>\n  <p>Ships in 2 days.</p>\n</details>\n<details>\n  <summary>Returns</summary>\n  <p>30-day returns.</p>\n</details>\n<details>\n  <summary>Warranty</summary>\n  <p>One year, parts and labour.</p>\n</details>\n',
        solution:
          '<details name="help" open>\n  <summary><h3>Shipping</h3></summary>\n  <p>Ships in 2 days.</p>\n</details>\n<details name="help">\n  <summary><h3>Returns</h3></summary>\n  <p>30-day returns.</p>\n</details>\n<details name="help">\n  <summary><h3>Warranty</h3></summary>\n  <p>One year, parts and labour.</p>\n</details>',
        checks: [
          {
            label: 'All three details share one name',
            re: '<details[^>]*\\sname="([^"]+)"[^>]*>[\\s\\S]*<details[^>]*\\sname="\\1"[^>]*>[\\s\\S]*<details[^>]*\\sname="\\1"[^>]*>',
            flags: 'i',
          },
          { label: 'Each summary holds an <h3>', re: '(<summary>\\s*<h3>[^<]+</h3>\\s*</summary>[\\s\\S]*?){3}', flags: 'i' },
          { label: 'Shipping starts open', re: '<details[^>]*\\sopen[^>]*>\\s*<summary>\\s*(<h3>)?\\s*Shipping', flags: 'i' },
        ],
        hint: 'Add the same name="…" to every details, wrap each label in <h3>, and put open on the first.',
        explain: 'details elements that share a name form a group: opening one closes the others. A heading in the summary keeps the page outline clear.',
        preview: {},
      },
    ],
    // L2 Dialog basics
    [
      {
        kind: 'write',
        prompt: 'Show a non-modal Level complete dialog with an OK button that closes it.',
        starter: '',
        solution:
          '<dialog open>\n  <p>Level complete! +50 coins</p>\n  <form method="dialog">\n    <button>OK</button>\n  </form>\n</dialog>',
        checks: [
          { label: 'A <dialog> shown with open', re: '<dialog[^>]*\\sopen[\\s>=]', flags: 'i' },
          { label: 'A message inside the dialog', re: '<dialog[^>]*>[\\s\\S]*<p>[\\s\\S]+?</p>[\\s\\S]*</dialog>', flags: 'i' },
          { label: 'A <form method="dialog"> inside it', re: '<dialog[^>]*>[\\s\\S]*<form[^>]*\\smethod="dialog"[\\s\\S]*</dialog>', flags: 'i' },
          { label: 'An OK button in the form', re: '<form[^>]*>[\\s\\S]*<button[^>]*>\\s*OK\\s*</button>[\\s\\S]*</form>', flags: 'i' },
        ],
        hint: 'dialog open shows it. Put the button inside a form whose method is dialog.',
        explain: 'A dialog-method form closes its dialog when a button submits it, and nothing is sent to a server.',
        preview: {},
      },
      {
        kind: 'write',
        prompt: 'Fix the cookie notice: show it, and let Accept and Decline close it.',
        starter:
          '<dialog>\n  <h2>Cookies</h2>\n  <p>We use one cookie to remember your theme.</p>\n  <form method="post">\n    <button>Accept</button>\n  </form>\n</dialog>',
        solution:
          '<dialog open>\n  <h2>Cookies</h2>\n  <p>We use one cookie to remember your theme.</p>\n  <form method="dialog">\n    <button value="accept">Accept</button>\n    <button value="decline">Decline</button>\n  </form>\n</dialog>',
        checks: [
          { label: 'The dialog shows with open', re: '<dialog[^>]*\\sopen[\\s>=]', flags: 'i' },
          { label: 'The form uses method="dialog"', re: '<form[^>]*\\smethod="dialog"', flags: 'i' },
          { label: 'No method="post" left', not: 'method="post"' },
          { label: 'A Decline button next to Accept', re: '<form[^>]*>[\\s\\S]*<button[^>]*>\\s*Decline\\s*</button>[\\s\\S]*</form>', flags: 'i' },
        ],
        hint: 'Two changes and one addition: open on the dialog, dialog as the form method, and a second button.',
        explain: 'method="dialog" turns every submit button in the form into a close button. A value on each tells script which one was pressed.',
        preview: {},
      },
    ],
    // L3 Modal dialogs
    [
      {
        kind: 'write',
        prompt: 'Open a delete-photo confirmation as a modal using command buttons, no script.',
        starter: '',
        solution:
          '<button commandfor="confirm-delete" command="show-modal">Delete photo</button>\n<dialog id="confirm-delete">\n  <p>Delete this photo for good?</p>\n  <button commandfor="confirm-delete" command="close">Cancel</button>\n</dialog>',
        checks: [
          { label: 'A <dialog> with an id', re: '<dialog[^>]*\\sid="[\\w-]+"', flags: 'i' },
          {
            label: 'A button with command="show-modal" aimed at that id',
            re: '<button(?=[^>]*\\scommand="show-modal")(?=[^>]*\\scommandfor="([\\w-]+)")[^>]*>[\\s\\S]*<dialog[^>]*\\sid="\\1"|<dialog[^>]*\\sid="([\\w-]+)"[\\s\\S]*<button(?=[^>]*\\scommand="show-modal")(?=[^>]*\\scommandfor="\\2")',
            flags: 'i',
          },
          {
            label: 'A command="close" button inside the dialog',
            re: '<dialog[^>]*>[\\s\\S]*<button(?=[^>]*\\scommand="close")(?=[^>]*\\scommandfor=")[^>]*>[\\s\\S]*</dialog>',
            flags: 'i',
          },
          { label: 'A question in the dialog', re: '<dialog[^>]*>\\s*<p>[^<]+</p>', flags: 'i' },
        ],
        hint: 'commandfor holds the dialog’s id; command says what to do: show-modal or close.',
        explain: 'The opener and the closer both point at the dialog by id, so the browser handles the modal, backdrop and Esc for you.',
        preview: { css: 'dialog::backdrop{background:rgba(0,0,0,.5)}' },
      },
      {
        kind: 'write',
        prompt: 'Wire the script so Start opens the rules as a modal and Close shuts it.',
        starter:
          '<button id="start">Start</button>\n<dialog id="rules">\n  <p>Three strikes and you’re out.</p>\n  <button id="close">Close</button>\n</dialog>\n<script>\n  const rules = document.getElementById(\'rules\');\n  // open on Start, close on Close\n</script>',
        solution:
          '<button id="start">Start</button>\n<dialog id="rules">\n  <p>Three strikes and you’re out.</p>\n  <button id="close">Close</button>\n</dialog>\n<script>\n  const rules = document.getElementById(\'rules\');\n  document.getElementById(\'start\').addEventListener(\'click\', () => rules.showModal());\n  document.getElementById(\'close\').addEventListener(\'click\', () => rules.close());\n</script>',
        checks: [
          {
            label: 'Listen for clicks on the Start button',
            re: '(getElementById\\(\\s*[\'"]start[\'"]\\s*\\)|querySelector\\(\\s*[\'"]#start[\'"]\\s*\\))\\s*(\\.addEventListener\\(\\s*[\'"]click|\\.onclick\\s*=)',
          },
          { label: 'Open it with showModal()', re: '\\.showModal\\(\\s*\\)' },
          { label: 'Shut it with close()', re: '\\.close\\(\\s*\\)' },
          { label: 'Not show(), which opens it non-modal', not: '.show()' },
        ],
        hint: 'Find each button by id, add a click listener, and call rules.showModal() or rules.close().',
        explain: 'showModal() dims the page with a ::backdrop and makes it inert; close() hides the dialog again. Esc also closes a modal.',
        preview: { css: 'dialog::backdrop{background:rgba(0,0,0,.5)}' },
      },
    ],
    // L4 Popovers
    [
      {
        kind: 'write',
        prompt: 'Make a Share button that toggles a popover holding two links.',
        starter: '',
        solution:
          '<button popovertarget="share">Share</button>\n<div id="share" popover>\n  <a href="https://mastodon.social/">Mastodon</a>\n  <a href="mailto:?subject=Look%20at%20this">Email</a>\n</div>',
        checks: [
          { label: 'An element with popover and an id', re: '<\\w+(?=[^>]*\\spopover\\b)(?=[^>]*\\sid="[\\w-]+")', flags: 'i' },
          {
            label: 'A Share button whose popovertarget is that id',
            re: '<button[^>]*\\spopovertarget="([\\w-]+)"[^>]*>\\s*Share[\\s\\S]*<\\w+(?=[^>]*\\sid="\\1")(?=[^>]*\\spopover\\b)|<\\w+(?=[^>]*\\sid="([\\w-]+)")(?=[^>]*\\spopover\\b)[\\s\\S]*<button[^>]*\\spopovertarget="\\2"[^>]*>\\s*Share',
            flags: 'i',
          },
          {
            label: 'Two links inside the popover',
            re: '<(\\w+)[^>]*\\spopover\\b[^>]*>[\\s\\S]*?<a\\s[^>]*href=[\\s\\S]*?</a>[\\s\\S]*?<a\\s[^>]*href=[\\s\\S]*?</a>[\\s\\S]*?</\\1>',
            flags: 'i',
          },
        ],
        hint: 'Give the box popover and an id, then point the button at it with popovertarget.',
        explain: 'popover hides the box until its button toggles it; it then sits on top of everything, and a tap outside closes it.',
        preview: {},
      },
      {
        kind: 'write',
        prompt: 'Make the tip a manual popover with separate Show and Hide buttons.',
        starter: '<button>Show tip</button>\n<div id="tip">\n  <p>Tip: drag cards to reorder them.</p>\n</div>',
        solution:
          '<button popovertarget="tip" popovertargetaction="show">Show tip</button>\n<div id="tip" popover="manual">\n  <p>Tip: drag cards to reorder them.</p>\n  <button popovertarget="tip" popovertargetaction="hide">Hide</button>\n</div>',
        checks: [
          { label: 'The tip has popover="manual"', re: '<div(?=[^>]*\\sid="tip")(?=[^>]*\\spopover="manual")', flags: 'i' },
          {
            label: 'Show tip only shows it',
            re: '<button(?=[^>]*\\spopovertarget="tip")(?=[^>]*\\spopovertargetaction="show")[^>]*>\\s*Show tip',
            flags: 'i',
          },
          {
            label: 'A Hide button that only hides it',
            re: '<button(?=[^>]*\\spopovertarget="tip")(?=[^>]*\\spopovertargetaction="hide")[^>]*>\\s*Hide',
            flags: 'i',
          },
        ],
        hint: 'popover="manual" stops tap-outside closing; popovertargetaction can be show or hide.',
        explain: 'A manual popover stays up until a button or script hides it, so it needs its own Hide button.',
        preview: {},
      },
    ],
    // L5 Inert content
    [
      {
        kind: 'write',
        prompt: 'Lock the bonus level section with inert so its button can’t be used.',
        starter: '',
        solution: '<section inert>\n  <h2>Bonus level</h2>\n  <p>Finish level 5 to unlock.</p>\n  <button>Play</button>\n</section>',
        checks: [
          { label: 'A region with the inert attribute', re: '<(\\w+)[^>]*\\sinert\\b[^>]*>[\\s\\S]*</\\1>', flags: 'i' },
          { label: 'A heading inside it', re: '\\sinert\\b[^>]*>[\\s\\S]*<h[1-6][^>]*>[^<]+</h[1-6]>', flags: 'i' },
          { label: 'A Play button inside it', re: '\\sinert\\b[^>]*>[\\s\\S]*<button[^>]*>\\s*Play\\s*</button>', flags: 'i' },
        ],
        hint: 'inert is a boolean attribute on the wrapper, like <section inert>.',
        explain: 'inert switches off clicks, focus and screen readers for everything inside, but the content still shows. The preview greys it with CSS.',
        preview: { css: '[inert]{opacity:.45}' },
      },
      {
        kind: 'write',
        prompt: 'Step 1 is done: lock it with inert, and unlock step 2.',
        starter:
          '<fieldset>\n  <legend>Step 1: Delivery</legend>\n  <input name="address" value="12 Elm St">\n</fieldset>\n<fieldset inert>\n  <legend>Step 2: Payment</legend>\n  <input name="card">\n  <button>Pay</button>\n</fieldset>',
        solution:
          '<fieldset inert>\n  <legend>Step 1: Delivery</legend>\n  <input name="address" value="12 Elm St">\n</fieldset>\n<fieldset>\n  <legend>Step 2: Payment</legend>\n  <input name="card">\n  <button>Pay</button>\n</fieldset>',
        checks: [
          { label: 'Step 1’s fieldset is inert', re: '<fieldset[^>]*\\sinert\\b[^>]*>\\s*<legend>\\s*Step 1', flags: 'i' },
          { label: 'Step 2’s fieldset is not inert', re: '<fieldset(?![^>]*\\sinert\\b)[^>]*>\\s*<legend>\\s*Step 2', flags: 'i' },
          { label: 'The Pay button stays in step 2', re: 'Step 2[\\s\\S]*<button[^>]*>\\s*Pay\\s*</button>', flags: 'i' },
        ],
        hint: 'Move the inert attribute from one fieldset tag to the other.',
        explain: 'inert takes a finished step out of the way: no tabbing into it, no editing, but the learner can still see it.',
        preview: { css: '[inert]{opacity:.45}' },
      },
    ],
  ],
};

export default unit;
