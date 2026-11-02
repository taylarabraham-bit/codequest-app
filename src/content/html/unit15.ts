import type { Unit } from "../../engine/types";

const perms = (xs: string[]): string[][] =>
  xs.length <= 1
    ? [xs]
    : xs.flatMap((x, i) =>
        perms([...xs.slice(0, i), ...xs.slice(i + 1)]).map((p) => [x, ...p]),
      );

/** Every other order of a tag's attributes, as token lists (for build `alt`). */
function attrOrders(open: string, attrs: string[], rest: string[]): string[][] {
  return perms(attrs)
    .slice(1)
    .map((p) => [open, ...p, ...rest]);
}

/** Every order of the attributes, each in any listed spelling. The first spelling,
 * in the given order, comes first (canonical). */
function attrSets(attrs: string[][]): string[] {
  const combos = attrs.reduce<string[][]>(
    (acc, alts) => acc.flatMap((a) => alts.map((s) => [...a, s])),
    [[]],
  );
  return combos.flatMap((c) => perms(c).map((p) => p.join(" ")));
}

const FORM =
  "label{display:block;margin:6px 0}input,button,output,select,textarea{font:inherit}";

const unit: Unit = {
  title: "Advanced forms",
  blurb:
    "Suggestions, sliders and pickers, phone keyboards, autofill, button overrides and file uploads.",
  lessons: [
    {
      title: "Suggestions & output",
      concept: {
        body: 'list="id" links an input to a <datalist>, whose options pop up as suggestions while any text is still allowed. <output> shows a worked-out result; its for lists the ids of the fields it came from, separated by spaces.',
        code: '<input list="teas" name="tea">\n<datalist id="teas">\n  <option value="Sencha">\n  <option value="Earl Grey">\n</datalist>\n<output for="qty price">$12</output>',
      },
      exercises: [
        {
          kind: "fill",
          prompt: "Link the input to the suggestions.",
          code: '<input name="city" ___="cities">\n<datalist id="cities">\n  <option value="Lisbon">\n  <option value="Porto">\n</datalist>',
          blanks: [
            { answer: ["list"], options: ["list", "datalist", "suggest"] },
          ],
          hint: "A short attribute named after what it points to.",
          explain:
            "list holds the datalist’s id. Tap the box in the preview to see Lisbon and Porto offered.",
          preview: { css: FORM },
        },
        {
          kind: "fill",
          prompt: "Pick the element that holds the suggestions.",
          code: '<input list="fruit" name="fruit">\n<___ id="fruit">\n  <option value="Mango">\n  <option value="Kiwi">\n</datalist>',
          blanks: [
            {
              answer: ["datalist"],
              options: ["datalist", "select", "options"],
            },
          ],
          hint: "Match the closing tag.",
          explain:
            "A datalist only suggests. Unlike select, the player can still type a fruit that isn’t listed.",
          preview: { css: FORM },
        },
        {
          kind: "fill",
          prompt: "Point the input at the pets list.",
          code: '<input list="___" name="pet">\n<datalist id="pets">\n  <option value="Cat">\n  <option value="Dog">\n</datalist>',
          blanks: [
            { answer: ["pets"], options: ["pets", "#pets", "datalist"] },
          ],
          hint: "Same as the datalist’s id, nothing added.",
          explain:
            "list takes a bare id, like label’s for. A # belongs in links and CSS, not here.",
          preview: { css: FORM },
        },
        {
          kind: "build",
          prompt: "Build a suggestion for Paris.",
          answer: ["<option", 'value="Paris"', ">"],
          distractors: ["<li", 'label="Paris"'],
          hint: "datalist holds the same items select does.",
          explain:
            "Each option’s value is what gets suggested and filled in when tapped.",
        },
        {
          kind: "order",
          prompt: "Order it: label, input, then the list with Leeds and York.",
          lines: [
            '<label for="town">Town</label>',
            '<input id="town" name="town" list="towns">',
            '<datalist id="towns">',
            '  <option value="Leeds">',
            '  <option value="York">',
            "</datalist>",
          ],
          hint: "The datalist can sit anywhere, but here it follows the input.",
          explain:
            "The datalist itself is never drawn. It only feeds the dropdown of the input that names it.",
          preview: { css: FORM },
        },
        {
          kind: "fill",
          prompt: "Say which fields the total comes from.",
          code: '<input type="number" id="w" name="w" value="3"> ×\n<input type="number" id="h" name="h" value="4"> =\n<output ___="w h">12</output>',
          blanks: [{ answer: ["for"], options: ["for", "list", "from"] }],
          hint: "The same attribute a label uses.",
          explain:
            "for lists every source field’s id, space-separated. Script updates the value; the preview just shows 12.",
          preview: { css: FORM },
        },
        {
          kind: "build",
          prompt: "Build an output from fields a and b, showing 0.",
          answer: ["<output", 'for="a b"', ">", "0", "</output>"],
          distractors: ['for="a,b"', 'for="#a #b"'],
          hint: "Bare ids with spaces between them.",
          explain:
            "Like class, for takes a space-separated list. Screen readers can also announce output changes as they happen.",
          preview: {},
        },
      ],
    },
    {
      title: "Sliders, pickers & step",
      concept: {
        body: 'type="range" draws a slider, color opens a picker that sends a hex like #ff8800, time takes hours and minutes, and search is a text box made for queries. step sets the gap between allowed values: step="5" on a slider, or step="any" for any decimal.',
        code: '<input type="range" name="vol" min="0" max="10" step="2">\n<input type="color" name="tint" value="#ff8800">\n<input type="time" name="alarm">\n<input type="search" name="q">',
      },
      exercises: [
        {
          kind: "fill",
          prompt: "Turn the volume into a slider.",
          code: '<label>Volume\n  <input type="___" name="vol" min="0" max="11">\n</label>',
          blanks: [
            { answer: ["range"], options: ["range", "slider", "number"] },
          ],
          hint: "It picks from a range of values.",
          explain:
            'type="range" is a slider. It suits rough choices; use number when the exact value matters.',
          preview: { css: FORM },
        },
        {
          kind: "fill",
          prompt: "Start the team colour as blue.",
          code: '<label>Team colour\n  <input type="color" name="team" value="___">\n</label>',
          blanks: [
            {
              answer: ["#3366ff"],
              options: ["#3366ff", "3366ff", "#blue"],
            },
          ],
          hint: "A hash and six hex digits.",
          explain:
            "#rrggbb works in every browser, and newer ones also accept names like blue. A value that isn’t a colour, like 3366ff with no #, is ignored and it starts black.",
          preview: { css: FORM },
        },
        {
          kind: "build",
          prompt: "Build a time input named alarm.",
          answer: ["<input", 'type="time"', 'name="alarm"', ">"],
          alt: attrOrders("<input", ['type="time"', 'name="alarm"'], [">"]),
          distractors: ['type="clock"', 'type="hour"'],
          hint: "The type is the plain word for it.",
          explain:
            'type="time" shows a time picker and always sends 24-hour HH:MM, like 07:30.',
          preview: { css: FORM },
        },
        {
          kind: "fill",
          prompt: "Let the tip slider move in fives.",
          code: '<input type="range" name="tip" min="0" max="25" ___="5">',
          blanks: [
            { answer: ["step"], options: ["step", "jump", "increment"] },
          ],
          hint: "The same attribute works on number inputs.",
          explain:
            'step="5" allows 0, 5, 10, 15, 20 and 25, so the slider snaps between them.',
          preview: { css: FORM },
        },
        {
          kind: "build",
          prompt: "Build a search box named q.",
          answer: ["<input", 'type="search"', 'name="q"', ">"],
          alt: attrOrders("<input", ['type="search"', 'name="q"'], [">"]),
          distractors: ['type="find"', 'type="query"'],
          hint: "Named after what it’s for.",
          explain:
            'type="search" acts like text, but phones show a Search key and some browsers add a clear button.',
          preview: { css: FORM },
        },
        {
          kind: "fill",
          prompt: "Pick the type for a date and a time together.",
          code: '<label>Kick-off\n  <input type="___" name="kickoff">\n</label>',
          blanks: [
            {
              answer: ["datetime-local"],
              options: ["datetime-local", "datetime", "date-time"],
            },
          ],
          hint: "The old plain version was dropped; the working one ends in -local.",
          explain:
            'datetime-local sends values like 2026-11-07T19:30. type="datetime" was removed and falls back to text.',
          preview: { css: FORM },
        },
        {
          kind: "fill",
          prompt: "Allow weights like 72.35 kg.",
          code: '<label>Weight\n  <input type="number" name="kg" step="___">\n</label>',
          blanks: [{ answer: ["any"], options: ["any", "all", "0"] }],
          hint: "A word meaning no restriction.",
          explain:
            'The default step is 1, so 72.35 would be invalid. step="any" accepts any decimal.',
          preview: { css: FORM },
        },
      ],
    },
    {
      title: "Phone keyboards & autofill",
      concept: {
        body: "inputmode picks the on-screen keyboard without changing the field: numeric for a PIN, decimal for a price. enterkeyhint labels the Enter key, like send, search or next. autocomplete tells the browser what to fill in: email, username, current-password, one-time-code and more.",
        code: '<input name="pin" inputmode="numeric">\n<input name="msg" enterkeyhint="send">\n<input type="email" name="email" autocomplete="email">\n<input type="password" name="pw" autocomplete="current-password">',
      },
      exercises: [
        {
          kind: "build",
          prompt: "Build a zip input that opens the number keyboard.",
          answer: ["<input", 'name="zip"', 'inputmode="numeric"', ">"],
          alt: attrOrders(
            "<input",
            ['name="zip"', 'inputmode="numeric"'],
            [">"],
          ),
          distractors: ['inputmode="number"', 'type="digits"'],
          hint: "The value is the adjective, not the noun.",
          explain:
            'A zip code isn’t a quantity, so type="number" would add spinners. inputmode="numeric" just shows digits.',
          preview: { css: FORM },
        },
        {
          kind: "fill",
          prompt: "Type the inputmode that adds a decimal point key.",
          code: '<label>Price\n  <input name="price" inputmode="___">\n</label>',
          blanks: [{ answer: ["decimal"] }],
          hint: "Numbers with a point are called…",
          explain:
            "decimal shows digits plus the local decimal separator, so 4.99 is easy to tap.",
          preview: { css: FORM },
        },
        {
          kind: "build",
          prompt: "Build a chat box whose Enter key says Send.",
          answer: ["<input", 'name="msg"', 'enterkeyhint="send"', ">"],
          alt: attrOrders(
            "<input",
            ['name="msg"', 'enterkeyhint="send"'],
            [">"],
          ),
          distractors: ['enterkeyhint="submit"', 'enterkey="send"'],
          hint: "enter, key, hint, all one word.",
          explain:
            "enterkeyhint only changes the key’s label or icon. Values include enter, done, go, next, previous, search and send.",
          preview: { css: FORM },
        },
        {
          kind: "order",
          prompt: "Order the sign-in form: username, password, then button.",
          lines: [
            '<form action="/login" method="post">',
            '  <input name="user" autocomplete="username" enterkeyhint="next">',
            '  <input type="password" name="pw" autocomplete="current-password">',
            "  <button>Sign in</button>",
            "</form>",
          ],
          hint: "Next on the first field moves you to the second.",
          explain:
            "username and current-password let password managers fill both fields in one tap.",
          preview: { css: FORM },
        },
        {
          kind: "fill",
          prompt: "Type the word that asks for a fresh password.",
          code: '<label>Choose a password\n  <input type="password" name="pw" autocomplete="___-password">\n</label>',
          blanks: [{ answer: ["new"] }],
          hint: "The opposite of current.",
          explain:
            "new-password tells password managers to suggest a strong one instead of filling a saved one.",
          preview: { css: FORM },
        },
        {
          kind: "build",
          prompt: "Build an SMS code box with a digit keyboard.",
          answer: [
            "<input",
            'name="otp"',
            'inputmode="numeric"',
            'autocomplete="one-time-code"',
            ">",
          ],
          alt: attrOrders(
            "<input",
            [
              'name="otp"',
              'inputmode="numeric"',
              'autocomplete="one-time-code"',
            ],
            [">"],
          ),
          distractors: ['autocomplete="otp"', 'autocomplete="sms"'],
          hint: "The token spells out one, time and code.",
          explain:
            "one-time-code lets phones offer the code from a fresh text message right above the keyboard.",
          preview: { css: FORM },
        },
        {
          kind: "fix",
          prompt: "Autofill never offers the address. Tap the bug.",
          code: '<input type="email" name="email" autocomplete=[["e-mail"]]>',
          fix: '"email"',
          options: ['"email"', '"mail"', '"address"'],
          hint: "Match the spelling of type.",
          explain:
            "autocomplete only knows its own tokens. e-mail isn’t one, so the browser ignores it.",
          preview: { css: FORM },
        },
      ],
    },
    {
      title: "Button overrides & owners",
      concept: {
        body: 'A submit button can override its form: formaction sends to another URL, formmethod swaps get and post, and formnovalidate skips the checks, handy for Save draft. form="id" ties a field or button placed outside the form to it. <fieldset disabled> switches off every control inside at once.',
        code: '<form id="post" action="/publish" method="post">\n  <textarea name="body" required></textarea>\n  <button formaction="/draft" formnovalidate>Save draft</button>\n</form>\n<button form="post">Publish</button>',
      },
      exercises: [
        {
          kind: "build",
          prompt: "Build a Preview button that sends to /preview.",
          answer: [
            "<button",
            'formaction="/preview"',
            ">",
            "Preview",
            "</button>",
          ],
          distractors: ['action="/preview"', 'href="/preview"'],
          hint: "The form’s attribute, with form in front.",
          explain:
            "formaction replaces the form’s action for this button only. The other buttons still use action.",
          preview: { css: FORM },
        },
        {
          kind: "fill",
          prompt: "Let Save draft skip the required checks.",
          code: '<form action="/post" method="post">\n  <input name="title" required>\n  <button ___ formaction="/draft">Save draft</button>\n  <button>Publish</button>\n</form>',
          blanks: [
            {
              answer: ["formnovalidate"],
              options: ["formnovalidate", "novalidate", "skip"],
            },
          ],
          hint: "Button versions of form attributes start with form.",
          explain:
            "formnovalidate turns validation off for this one button. novalidate on the form would turn it off for both.",
          preview: { css: FORM },
        },
        {
          kind: "order",
          prompt: "Order it: the form, then a button outside it.",
          lines: [
            '<form id="vote" action="/vote" method="post">',
            '  <label><input type="radio" name="pick" value="a"> Cats</label>',
            '  <label><input type="radio" name="pick" value="b"> Dogs</label>',
            "</form>",
            '<button form="vote">Vote</button>',
          ],
          hint: "The button names the form’s id.",
          explain:
            'form="vote" makes the button submit that form even though it sits outside it.',
          preview: { css: FORM },
        },
        {
          kind: "fill",
          prompt: "Type the id that ties this input to its form.",
          code: '<form id="search" action="/find"></form>\n<header>\n  <input name="q" form="___">\n</header>',
          blanks: [{ answer: ["search"] }],
          hint: "Look at the form tag.",
          explain:
            "form takes the form’s id. The field can live in the header and still be sent with that form.",
          preview: { css: FORM },
        },
        {
          kind: "build",
          prompt: "Build a disabled fieldset titled Shipping.",
          answer: [
            "<fieldset",
            "disabled",
            ">",
            "<legend>",
            "Shipping",
            "</legend>",
          ],
          distractors: ["readonly", "off"],
          hint: "The same boolean that disables one input.",
          explain:
            "disabled on a fieldset greys out every control inside, and none of them are sent.",
          preview: { css: FORM },
        },
        {
          kind: "fix",
          prompt: "Remove submits the wrong way. Tap the bug.",
          code: '<form action="/cart" method="post">\n  <button formaction="/cart/remove" formmethod=[["delete"]]>Remove</button>\n</form>',
          fix: '"post"',
          options: ['"post"', '"remove"', '"put"'],
          hint: "HTML forms only know two ways to send.",
          explain:
            "formmethod accepts get, post or dialog. Anything else falls back to get, which puts the data in the URL.",
          preview: { css: FORM },
        },
        {
          kind: "build",
          prompt: "Build a Search button sending to /search with get.",
          answer: [
            "<button",
            'formaction="/search"',
            'formmethod="get"',
            ">",
            "Search",
            "</button>",
          ],
          alt: attrOrders(
            "<button",
            ['formaction="/search"', 'formmethod="get"'],
            [">", "Search", "</button>"],
          ),
          distractors: ['method="get"', 'formmethod="fetch"'],
          hint: "Two attributes, both starting with form.",
          explain:
            "One form can serve two jobs: Save posts to its action, and this button searches with get instead.",
          preview: { css: FORM },
        },
      ],
    },
    {
      title: "Files & stricter checks",
      concept: {
        body: 'type="file" picks files; multiple allows several, and accept filters the picker, like image/* or .pdf. To upload, the form needs method="post" and enctype="multipart/form-data". pattern must match the whole value, and title can describe the format.',
        code: '<form method="post" enctype="multipart/form-data">\n  <input type="file" name="photos" multiple accept="image/*">\n  <input name="sku" pattern="[A-Z]{3}-[0-9]{3}" title="Like ABC-123">\n  <button>Upload</button>\n</form>',
      },
      exercises: [
        {
          kind: "build",
          prompt: "Build a file input named cv that only offers PDFs.",
          answer: ["<input", 'type="file"', 'name="cv"', 'accept=".pdf"', ">"],
          alt: attrOrders(
            "<input",
            ['type="file"', 'name="cv"', 'accept=".pdf"'],
            [">"],
          ),
          distractors: ['accept="pdf"', 'type="upload"'],
          hint: "An extension starts with a dot.",
          explain:
            "accept takes extensions like .pdf or types like image/*. It only filters the picker, so check files on the server too.",
          preview: { css: FORM },
        },
        {
          kind: "fill",
          prompt: "Type the attribute that allows several photos.",
          code: '<label>Holiday photos\n  <input type="file" name="pics" accept="image/*" ___>\n</label>',
          blanks: [{ answer: ["multiple"] }],
          hint: "The same boolean that lets a select pick many.",
          explain:
            "multiple lets the player choose many files at once; each is sent under the same name.",
          preview: { css: FORM },
        },
        {
          kind: "order",
          prompt: "Order the upload form: file input, caption, then button.",
          lines: [
            '<form action="/upload" method="post" enctype="multipart/form-data">',
            '  <input type="file" name="art" accept="image/png, image/jpeg">',
            '  <input name="caption" maxlength="80">',
            "  <button>Upload</button>",
            "</form>",
          ],
          hint: "The encoding goes on the form, not the input.",
          explain:
            "accept can list several types, comma-separated. enctype makes the form send the file’s bytes.",
          preview: { css: FORM },
        },
        {
          kind: "fix",
          prompt: "Only the file name reaches the server. Tap the bug.",
          code: '<form action="/avatar" method="post" enctype=[["text/plain"]]>\n  <input type="file" name="avatar" accept="image/*">\n  <button>Save</button>\n</form>',
          fix: '"multipart/form-data"',
          options: ['"multipart/form-data"', '"application/json"', '"image/*"'],
          hint: "Files need the encoding that splits the body into parts.",
          explain:
            "Without multipart/form-data, a file input sends just its name. Forms can’t send JSON by themselves.",
          preview: { css: FORM },
        },
        {
          kind: "type",
          prompt: "Allow only quarter-hour slots. Time steps count seconds.",
          template:
            '<label>Slot\n  <input type="time" name="slot" ___>\n</label>',
          accept: ['step="900"', "step=900"],
          hint: "How many seconds in 15 minutes?",
          explain:
            "For time, step is in seconds: 900 is 15 minutes, so 09:15 is valid but 09:20 isn’t.",
          preview: { css: FORM },
        },
        {
          kind: "fill",
          prompt: "Pick the attribute that explains the expected format.",
          code: '<label>Product code\n  <input name="sku" pattern="[A-Z]{3}-[0-9]{3}" ___="Like ABC-123">\n</label>',
          blanks: [{ answer: ["title"], options: ["title", "alt", "error"] }],
          hint: "The attribute that also shows as a tooltip.",
          explain:
            "A failed pattern only says the format is wrong; browsers add the title text so people know what to fix.",
          preview: { css: FORM },
        },
        {
          kind: "type",
          prompt: "Type a file input named docs that takes several files.",
          template:
            '<form method="post" enctype="multipart/form-data">\n  ___\n</form>',
          accept: attrSets([
            ['type="file"', "type=file"],
            ['name="docs"', "name=docs"],
            ["multiple"],
          ]).map((a) => `<input ${a}>`),
          hint: "type, name, then the boolean for many.",
          explain:
            "multiple is a boolean, so it needs no value. The form already has the encoding files need.",
          preview: { css: FORM },
        },
      ],
    },
  ],
  boss: [
    {
      kind: "order",
      prompt: "Order it: quantity, price, then the total output.",
      lines: [
        "<form>",
        '  <input type="number" id="qty" name="qty" value="2">',
        '  <input type="number" id="price" name="price" value="5" step="0.01">',
        '  <output for="qty price" name="total">10</output>',
        "</form>",
      ],
      hint: "The result comes after the fields it uses.",
      explain:
        'step="0.01" allows cents, and for names both sources. output isn’t sent with the form; it just shows the result.',
      preview: { css: FORM },
    },
    {
      kind: "fix",
      prompt: "No suggestions appear. Tap the bug.",
      code: '<input name="size" list=[["#sizes"]]>\n<datalist id="sizes">\n  <option value="Small">\n  <option value="Large">\n</datalist>',
      fix: '"sizes"',
      options: ['"sizes"', '"datalist"', '".sizes"'],
      hint: "Ids in attributes are written bare.",
      explain:
        "list takes the id itself. With the # it looks for an id that starts with #, finds none and shows nothing.",
      preview: { css: FORM },
    },
    {
      kind: "build",
      prompt: "Build a 1 to 5 rating slider named stars.",
      answer: [
        "<input",
        'type="range"',
        'name="stars"',
        'min="1"',
        'max="5"',
        ">",
      ],
      alt: attrOrders(
        "<input",
        ['type="range"', 'name="stars"', 'min="1"', 'max="5"'],
        [">"],
      ),
      distractors: ['type="slider"', 'step="any"'],
      hint: "The default step of 1 already gives whole stars.",
      explain:
        'A range defaults to 0–100, so min and max set the ends. step="any" would allow 3.7 stars.',
      preview: { css: FORM },
    },
    {
      kind: "type",
      prompt: "Let the password manager fill the saved password.",
      template: '<input type="password" name="pw" ___>',
      accept: [
        'autocomplete="current-password"',
        "autocomplete=current-password",
      ],
      hint: "Not new: the one you already have.",
      explain:
        "current-password fills the saved one. Sign-up and change forms use new-password instead.",
      preview: { css: FORM },
    },
    {
      kind: "fill",
      prompt: "Type the inputmode for the card number.",
      code: '<label>Card number\n  <input name="card" inputmode="___" autocomplete="cc-number">\n</label>',
      blanks: [{ answer: ["numeric"] }],
      hint: "Digits only, no decimal point.",
      explain:
        'A card number is digits, not a quantity, so numeric beats type="number". cc-number lets the browser fill a saved card.',
      preview: { css: FORM },
    },
    {
      kind: "fix",
      prompt: "The address fields still work. Tap the bug.",
      code: '<fieldset [[readonly]]>\n  <legend>Billing address</legend>\n  <input name="street">\n  <input name="city">\n</fieldset>',
      fix: "disabled",
      options: ["disabled", "locked", "off"],
      hint: "Only one boolean on fieldset reaches every control.",
      explain:
        "readonly does nothing on a fieldset. disabled switches off every control inside and leaves them out of the form data.",
      preview: { css: FORM },
    },
    {
      kind: "build",
      prompt: "Build a Save for later button for form cart, sent to /save.",
      answer: [
        "<button",
        'form="cart"',
        'formaction="/save"',
        ">",
        "Save for later",
        "</button>",
      ],
      alt: attrOrders(
        "<button",
        ['form="cart"', 'formaction="/save"'],
        [">", "Save for later", "</button>"],
      ),
      distractors: ['action="/save"', 'for="cart"'],
      hint: "One attribute picks the form, one picks the URL.",
      explain:
        "form ties the button to the cart form from anywhere on the page, and formaction overrides where it sends.",
      preview: { css: FORM },
    },
    {
      kind: "fill",
      prompt: "Pick a value the form will accept.",
      code: '<label>Eggs\n  <input type="number" name="eggs" min="0" step="6" value="___">\n</label>',
      blanks: [{ answer: ["12"], options: ["12", "10", "8"] }],
      hint: "Count up from min in steps of 6.",
      explain:
        "Valid values are min plus whole steps: 0, 6, 12, 18… so 10 and 8 would fail validation.",
      preview: { css: FORM },
    },
    {
      kind: "order",
      prompt: "Order the form: photos, then a Draft button that skips checks.",
      lines: [
        '<form action="/listing" method="post" enctype="multipart/form-data">',
        '  <input type="file" name="photos" accept="image/*" multiple required>',
        '  <button formaction="/listing/draft" formnovalidate>Draft</button>',
        "  <button>Publish</button>",
        "</form>",
      ],
      hint: "Both buttons sit at the end; Draft comes first.",
      explain:
        "Publish requires photos, but Draft saves anyway: formnovalidate skips required for that button only.",
      preview: { css: FORM },
    },
    {
      kind: "type",
      prompt: "Type the datalist’s opening tag, id flavors.",
      template:
        '<input list="flavors" name="flavor">\n___\n  <option value="Mint">\n  <option value="Mango">\n</datalist>',
      accept: ['<datalist id="flavors">', "<datalist id=flavors>"],
      hint: "Its id must match the input’s list.",
      explain:
        "The input’s list and the datalist’s id must match exactly, or no suggestions show.",
      preview: { css: FORM },
    },
  ],
};

export default unit;
