import type { DesktopUnit } from '../../../engine/types';

// Desktop edition: write-the-code challenges for HTML unit 15 (Advanced forms).
// lessons[i] runs after lesson i + 1. See docs/CONTENT_GUIDE.md.
const unit: DesktopUnit = {
  lessons: [
    // L1 Suggestions & output
    [
      {
        kind: 'write',
        prompt: 'Add a labelled city box that suggests four cities from a datalist.',
        starter: '',
        solution:
          '<label for="city">City</label>\n<input id="city" name="city" list="cities">\n<datalist id="cities">\n  <option value="Oslo">\n  <option value="Bergen">\n  <option value="Tromsø">\n  <option value="Stavanger">\n</datalist>',
        checks: [
          { label: 'A <label> tied to the input', re: '<label[^>]*\\sfor="([\\w-]+)"[\\s\\S]*<input[^>]*\\sid="\\1"|<label[^>]*>[^<]*<input', flags: 'i' },
          { label: 'The input’s list matches the datalist id', re: '<input[^>]*\\slist="([\\w-]+)"[\\s\\S]*<datalist[^>]*\\sid="\\1"', flags: 'i' },
          { label: 'Four <option>s in the datalist', re: '<datalist[^>]*>([\\s\\S]*?<option\\b[^>]*\\S){4}[\\s\\S]*?</datalist>', flags: 'i' },
        ],
        hint: 'list="cities" on the input points at <datalist id="cities">, which holds <option value="…"> lines.',
        explain: 'The datalist only suggests: the learner can still type a city that isn’t on the list.',
        preview: {},
      },
      {
        kind: 'write',
        prompt: 'Show the total in an <output> that names the bill and tip fields.',
        starter:
          '<form oninput="total.value = (bill.valueAsNumber * (1 + tip.valueAsNumber / 100)).toFixed(2)">\n  <label>Bill <input type="number" id="bill" name="bill" value="40"></label>\n  <label>Tip % <input type="number" id="tip" name="tip" value="15"></label>\n  <p>Total: </p>\n</form>',
        solution:
          '<form oninput="total.value = (bill.valueAsNumber * (1 + tip.valueAsNumber / 100)).toFixed(2)">\n  <label>Bill <input type="number" id="bill" name="bill" value="40"></label>\n  <label>Tip % <input type="number" id="tip" name="tip" value="15"></label>\n  <p>Total: <output name="total" for="bill tip">46.00</output></p>\n</form>',
        checks: [
          { label: 'An <output> named total', re: '<output[^>]*\\sname="total"[^>]*>[\\s\\S]*?</output>', flags: 'i' },
          { label: 'for lists bill and tip', re: '<output[^>]*\\sfor="\\s*(bill\\s+tip|tip\\s+bill)\\s*"', flags: 'i' },
          { label: 'The output sits inside the form', re: '<output[\\s\\S]*</form>', flags: 'i' },
        ],
        hint: 'The script sets total.value, so name the output total. for takes ids separated by a space.',
        explain: 'output holds a worked-out result, and for records which fields it came from. Change a number and the total updates.',
        preview: {},
      },
    ],
    // L2 Sliders, pickers & step
    [
      {
        kind: 'write',
        prompt: 'Build lamp settings: a 0–100 slider in steps of 10, a colour and an off time.',
        starter: '<form>\n</form>',
        solution:
          '<form>\n  <label for="bright">Brightness</label>\n  <input type="range" id="bright" name="brightness" min="0" max="100" step="10" value="50">\n  <label for="glow">Colour</label>\n  <input type="color" id="glow" name="color" value="#ffcc66">\n  <label for="off">Switch off at</label>\n  <input type="time" id="off" name="off">\n</form>',
        checks: [
          {
            label: 'A range slider with min 0, max 100, step 10',
            re: '<input(?=[^>]*\\stype="range")(?=[^>]*\\smin="0")(?=[^>]*\\smax="100")(?=[^>]*\\sstep="10")',
            flags: 'i',
          },
          { label: 'A colour picker', re: '<input[^>]*\\stype="color"', flags: 'i' },
          { label: 'A time input', re: '<input[^>]*\\stype="time"', flags: 'i' },
          { label: 'A <label> for each control', re: '(<label[\\s\\S]*?</label>[\\s\\S]*?){3}', flags: 'i' },
        ],
        hint: 'Three inputs with type range, color and time. step="10" sets the slider’s jumps.',
        explain: 'Each type brings its own control: a slider, a colour picker that sends a hex, and an hours-and-minutes field.',
        preview: {},
      },
      {
        kind: 'write',
        prompt: 'Fix the gear search: a real search box, prices with cents, a weight slider.',
        starter:
          '<form>\n  <label>Search gear <input type="text" name="q"></label>\n  <label>Max price <input type="number" name="max" min="0"></label>\n  <label>Weight limit (kg) <input type="number" name="kg" min="0" max="20" step="5"></label>\n  <button>Search</button>\n</form>',
        solution:
          '<form>\n  <label>Search gear <input type="search" name="q"></label>\n  <label>Max price <input type="number" name="max" min="0" step="0.01"></label>\n  <label>Weight limit (kg) <input type="range" name="kg" min="0" max="20" step="5"></label>\n  <button>Search</button>\n</form>',
        checks: [
          { label: 'q is type="search"', re: '<input(?=[^>]*\\sname="q")(?=[^>]*\\stype="search")', flags: 'i' },
          { label: 'max accepts cents with step', re: '<input(?=[^>]*\\sname="max")(?=[^>]*\\sstep="(any|0?\\.01)")', flags: 'i' },
          { label: 'kg is a range slider', re: '<input(?=[^>]*\\sname="kg")(?=[^>]*\\stype="range")', flags: 'i' },
        ],
        hint: 'A number field only allows whole numbers until you change its step.',
        explain: 'The default step of 1 rejects 19.99; step="0.01" or "any" allows cents. A slider suits a value in a small range.',
        preview: {},
      },
    ],
    // L3 Phone keyboards & autofill
    [
      {
        kind: 'write',
        prompt: 'Build a login form that autofills, with a numeric one-time code.',
        starter: '',
        solution:
          '<form>\n  <label for="user">Username</label>\n  <input id="user" name="username" autocomplete="username">\n  <label for="pw">Password</label>\n  <input id="pw" type="password" name="password" autocomplete="current-password">\n  <label for="otp">Code from your app</label>\n  <input id="otp" name="otp" inputmode="numeric" autocomplete="one-time-code">\n  <button>Sign in</button>\n</form>',
        checks: [
          { label: 'A username field with autocomplete="username"', re: '<input[^>]*\\sautocomplete="username"', flags: 'i' },
          {
            label: 'A password field with autocomplete="current-password"',
            re: '<input(?=[^>]*\\stype="password")(?=[^>]*\\sautocomplete="current-password")',
            flags: 'i',
          },
          {
            label: 'A code field: one-time-code and a numeric keypad',
            re: '<input(?=[^>]*\\sautocomplete="one-time-code")(?=[^>]*\\sinputmode="numeric")',
            flags: 'i',
          },
          { label: 'A submit button', re: '<button[^>]*>[^<]*\\S[^<]*</button>', flags: 'i' },
        ],
        hint: 'autocomplete names what goes in each field; inputmode="numeric" shows a number pad.',
        explain: 'Password managers fill username and current-password, and phones can paste a texted code straight into one-time-code.',
        preview: {},
      },
      {
        kind: 'write',
        prompt: 'Give each checkout field the right keyboard, autofill and Enter key label.',
        starter: '<form>\n  <label>Email <input name="email"></label>\n  <label>Tip amount <input name="tip"></label>\n  <label>Gift message <input name="msg"></label>\n</form>',
        solution:
          '<form>\n  <label>Email <input type="email" name="email" autocomplete="email" enterkeyhint="next"></label>\n  <label>Tip amount <input name="tip" inputmode="decimal" enterkeyhint="next"></label>\n  <label>Gift message <input name="msg" enterkeyhint="send"></label>\n</form>',
        checks: [
          { label: 'Email autofills with autocomplete="email"', re: '<input(?=[^>]*\\sname="email")(?=[^>]*\\sautocomplete="email")', flags: 'i' },
          { label: 'Tip shows a decimal keypad', re: '<input(?=[^>]*\\sname="tip")(?=[^>]*\\sinputmode="decimal")', flags: 'i' },
          {
            label: 'The message’s Enter key says send or done',
            re: '<input(?=[^>]*\\sname="msg")(?=[^>]*\\senterkeyhint="(send|done|go)")',
            flags: 'i',
          },
        ],
        hint: 'inputmode picks the keyboard, autocomplete the autofill, enterkeyhint the Enter key’s label.',
        explain: 'None of these change what the field accepts; they just make typing on a phone faster.',
        preview: {},
      },
    ],
    // L4 Button overrides & owners
    [
      {
        kind: 'write',
        prompt: 'Quiz form: Submit checks the answer; Save for later skips validation.',
        starter: '',
        solution:
          '<form action="/quiz/submit" method="post">\n  <label for="ans">Capital of Peru?</label>\n  <input id="ans" name="answer" required>\n  <button>Submit</button>\n  <button formaction="/quiz/save" formnovalidate>Save for later</button>\n</form>',
        checks: [
          { label: 'A form with an action and method="post"', re: '<form(?=[^>]*\\saction="[^"]+")(?=[^>]*\\smethod="post")', flags: 'i' },
          { label: 'A required answer field', re: '<input[^>]*\\srequired\\b', flags: 'i' },
          { label: 'A plain Submit button', re: '<button(?![^>]*\\sformaction)[^>]*>\\s*Submit\\s*</button>', flags: 'i' },
          {
            label: 'Save for later with formaction and formnovalidate',
            re: '<button(?=[^>]*\\sformaction="[^"]+")(?=[^>]*\\sformnovalidate\\b)[^>]*>\\s*Save for later',
            flags: 'i',
          },
        ],
        hint: 'Both buttons submit the same form. Override the URL and the checks on just the second one.',
        explain: 'formaction sends this button’s submit somewhere else, and formnovalidate lets a half-done answer through.',
        preview: {},
      },
      {
        kind: 'write',
        prompt: 'Pickup only today: switch off delivery, and tie the outside field and button to the form.',
        starter:
          '<form id="order" action="/order" method="post">\n  <fieldset>\n    <legend>Delivery</legend>\n    <input name="address">\n  </fieldset>\n</form>\n<label>Promo code <input name="promo"></label>\n<button>Place order</button>',
        solution:
          '<form id="order" action="/order" method="post">\n  <fieldset disabled>\n    <legend>Delivery</legend>\n    <input name="address">\n  </fieldset>\n</form>\n<label>Promo code <input name="promo" form="order"></label>\n<button form="order">Place order</button>',
        checks: [
          { label: 'The Delivery fieldset is disabled', re: '<fieldset[^>]*\\sdisabled\\b[^>]*>\\s*<legend>\\s*Delivery', flags: 'i' },
          { label: 'The promo field has form="order"', re: '<input(?=[^>]*\\sname="promo")(?=[^>]*\\sform="order")', flags: 'i' },
          { label: 'The button has form="order"', re: '<button[^>]*\\sform="order"[^>]*>\\s*Place order', flags: 'i' },
        ],
        hint: 'One attribute on the fieldset switches off everything inside. form="id" links a control from anywhere.',
        explain: 'Disabled controls aren’t sent. form="order" makes the promo code and button part of the form even outside it.',
        preview: {},
      },
    ],
    // L5 Files & stricter checks
    [
      {
        kind: 'write',
        prompt: 'Build a photo-contest upload: several images, posted as multipart.',
        starter: '',
        solution:
          '<form action="/entries" method="post" enctype="multipart/form-data">\n  <label for="shots">Your photos</label>\n  <input type="file" id="shots" name="shots" multiple accept="image/*">\n  <button>Enter contest</button>\n</form>',
        checks: [
          {
            label: 'The form posts with enctype="multipart/form-data"',
            re: '<form(?=[^>]*\\smethod="post")(?=[^>]*\\senctype="multipart/form-data")',
            flags: 'i',
          },
          { label: 'A file input that allows several files', re: '<input(?=[^>]*\\stype="file")(?=[^>]*\\smultiple\\b)', flags: 'i' },
          { label: 'Only images, using accept', re: '<input(?=[^>]*\\stype="file")(?=[^>]*\\saccept="[^"]*image)', flags: 'i' },
          { label: 'A submit button', re: '<button[^>]*>[^<]*\\S[^<]*</button>', flags: 'i' },
        ],
        hint: 'multiple and accept="image/*" go on the input; method and enctype go on the form.',
        explain: 'Without multipart encoding the server only gets file names, not the files. accept just filters the picker.',
        preview: {},
      },
      {
        kind: 'write',
        prompt: 'Fix the refund form: codes like TK-12345, and PDF receipts that actually upload.',
        starter:
          '<form action="/claim" method="post">\n  <label>Ticket code <input name="code" pattern="[0-9]"></label>\n  <label>Receipt (PDF) <input type="file" name="receipt"></label>\n  <button>Claim refund</button>\n</form>',
        solution:
          '<form action="/claim" method="post" enctype="multipart/form-data">\n  <label>Ticket code <input name="code" pattern="TK-[0-9]{5}" title="Like TK-12345" required></label>\n  <label>Receipt (PDF) <input type="file" name="receipt" accept=".pdf,application/pdf"></label>\n  <button>Claim refund</button>\n</form>',
        checks: [
          { label: 'A pattern for TK- and five digits', re: '\\spattern="(TK|\\[A-Z\\]\\{2\\})-(\\[0-9\\]|\\\\d)\\{5\\}"' },
          { label: 'A title that describes the format', re: '<input(?=[^>]*\\spattern=)(?=[^>]*\\stitle="[^"]+")', flags: 'i' },
          { label: 'The file input accepts PDFs', re: '<input(?=[^>]*\\stype="file")(?=[^>]*\\saccept="[^"]*(\\.pdf|application/pdf))', flags: 'i' },
          { label: 'The form uses multipart encoding', re: '<form[^>]*\\senctype="multipart/form-data"', flags: 'i' },
        ],
        hint: 'pattern must match the whole value: TK, a hyphen, then [0-9]{5}. Uploads also need enctype on the form.',
        explain: 'pattern="[0-9]" only allowed a single digit. The title shows in the error message, so say what the format looks like.',
        preview: {},
      },
    ],
  ],
};

export default unit;
