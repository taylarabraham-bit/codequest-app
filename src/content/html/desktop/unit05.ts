import type { DesktopUnit } from '../../../engine/types';

// Desktop edition: write-the-code challenges for HTML unit 5 (Forms).
// lessons[i] runs after lesson i + 1. See docs/CONTENT_GUIDE.md.
const unit: DesktopUnit = {
  lessons: [
    // L1 Form basics
    [
      {
        kind: 'write',
        prompt: 'Write a recipe search form that sends q to /recipes with GET.',
        starter: '',
        solution: '<form action="/recipes" method="get">\n  <input type="text" name="q">\n  <button type="submit">Search</button>\n</form>',
        checks: [
          { label: 'A <form> with action="/recipes"', re: '<form[^>]*\\saction=["\']/recipes["\']', flags: 'i' },
          { label: 'method="get"', re: '<form[^>]*\\smethod=["\']get["\']', flags: 'i' },
          { label: 'A text input with name="q"', re: '<input(?=[^>]*\\sname=["\']q["\'])[^>]*>', flags: 'i' },
          { label: 'A submit button inside the form', re: '<form[\\s\\S]*<button[^>]*>[^<]*\\S[^<]*</button>[\\s\\S]*</form>', flags: 'i' },
        ],
        hint: 'action is where it goes, method is how. The input’s name becomes the key in the URL.',
        explain: 'With GET, submitting “soup” visits /recipes?q=soup, so the search can be bookmarked.',
        preview: {},
      },
      {
        kind: 'write',
        prompt: 'Fix the booking form: POST it, name every field and make the button send it.',
        starter:
          '<form action="/bookings">\n  <input type="text">\n  <input type="text" name="guests">\n</form>\n<button type="submit">Book</button>',
        solution:
          '<form action="/bookings" method="post">\n  <input type="text" name="guest_name">\n  <input type="text" name="guests">\n  <button type="submit">Book</button>\n</form>',
        checks: [
          { label: 'method="post"', re: '<form[^>]*\\smethod=["\']post["\']', flags: 'i' },
          { label: 'Keep action="/bookings"', re: '<form[^>]*\\saction=["\']/bookings["\']', flags: 'i' },
          {
            label: 'Every input has a name',
            re: '^(?![\\s\\S]*<input(?![^>]*\\sname=["\']?\\w)[^>]*>)(?=(?:[\\s\\S]*<input){2})',
            flags: 'i',
          },
          { label: 'The button sits inside the form', re: '<form[\\s\\S]*<button[^>]*>\\s*Book\\s*</button>\\s*</form>', flags: 'i' },
        ],
        hint: 'Without a name a field isn’t sent. A button outside the form can’t submit it.',
        explain: 'POST sends the data in the request body, which suits bookings. Only named fields inside the form are sent.',
        preview: {},
      },
    ],
    // L2 Labels
    [
      {
        kind: 'write',
        prompt: 'Write an adoption form: one label linked with for, one wrapped around its input.',
        starter: '<form action="/adopt" method="post">\n\n</form>',
        solution:
          '<form action="/adopt" method="post">\n  <label for="pet">Pet name</label>\n  <input type="text" id="pet" name="pet">\n  <label>Your name <input type="text" name="owner"></label>\n  <button>Apply</button>\n</form>',
        checks: [
          {
            label: 'A <label for> that matches an input id',
            re: '<label[^>]*\\sfor=["\']([\\w-]+)["\'][^>]*>[^<]*\\S[^<]*</label>[\\s\\S]*<input[^>]*\\sid=["\']\\1["\']',
            flags: 'i',
          },
          { label: 'A <label> wrapped around an input', re: '<label>[^<]*\\S[^<]*<input[^>]*>[\\s\\S]*?</label>', flags: 'i' },
          { label: 'Both inputs have a name', re: '(<input[^>]*\\sname=["\'][^"\']+["\'][\\s\\S]*){2}', flags: 'i' },
          { label: 'A submit button', re: '<button[^>]*>[^<]*\\S[^<]*</button>\\s*</form>', flags: 'i' },
        ],
        hint: 'for="x" pairs with id="x". Or put the input inside <label>…</label>.',
        explain: 'Either way the label names the field for screen readers, and clicking the label focuses the input.',
        preview: {},
      },
      {
        kind: 'write',
        prompt: 'Link the Email label to its input and give City a real label.',
        starter:
          '<form action="/signup" method="post">\n  <label for="email">Email</label>\n  <input type="text" id="mail" name="email">\n  <input type="text" name="city" placeholder="City">\n  <button>Join</button>\n</form>',
        solution:
          '<form action="/signup" method="post">\n  <label for="email">Email</label>\n  <input type="text" id="email" name="email">\n  <label for="city">City</label>\n  <input type="text" id="city" name="city" placeholder="e.g. Leeds">\n  <button>Join</button>\n</form>',
        checks: [
          {
            label: 'The Email label’s for matches the input’s id',
            re: '<label[^>]*\\sfor=["\']([\\w-]+)["\'][^>]*>\\s*Email\\s*</label>\\s*<input[^>]*\\sid=["\']\\1["\']',
            flags: 'i',
          },
          {
            label: 'A City label linked to the city input',
            re: '<label>\\s*City\\s*<input|<label[^>]*\\sfor=["\']([\\w-]+)["\'][^>]*>\\s*City\\s*</label>\\s*<input[^>]*\\sid=["\']\\1["\']',
            flags: 'i',
          },
          { label: 'Keep name="city" on its input', re: '<input[^>]*\\sname=["\']city["\']', flags: 'i' },
        ],
        hint: 'for and id must be the same text. A placeholder is only an example, not a label.',
        explain: 'A placeholder vanishes as you type, so the field needs a label. for only works when it exactly matches an id.',
        preview: {},
      },
    ],
    // L3 Input types
    [
      {
        kind: 'write',
        prompt: 'Write a gym sign-up form with email, password and date of birth.',
        starter: '<form action="/join" method="post">\n\n  <button>Join</button>\n</form>',
        solution:
          '<form action="/join" method="post">\n  <label for="em">Email</label>\n  <input type="email" id="em" name="email">\n  <label for="pw">Password</label>\n  <input type="password" id="pw" name="password">\n  <label for="dob">Date of birth</label>\n  <input type="date" id="dob" name="dob">\n  <button>Join</button>\n</form>',
        checks: [
          { label: 'An input with type="email"', re: '<input[^>]*\\stype=["\']email["\']', flags: 'i' },
          { label: 'An input with type="password"', re: '<input[^>]*\\stype=["\']password["\']', flags: 'i' },
          { label: 'An input with type="date"', re: '<input[^>]*\\stype=["\']date["\']', flags: 'i' },
          { label: 'A label for each field', re: '(<label[\\s\\S]*?</label>[\\s\\S]*){3}', flags: 'i' },
          {
            label: 'Every input has a name',
            re: '^(?![\\s\\S]*<input(?![^>]*\\sname=["\']?\\w)[^>]*>)[\\s\\S]*<input',
            flags: 'i',
          },
        ],
        hint: 'Only type changes: email, password, date. Each still needs a name and a label.',
        explain: 'The right type gives phones the right keyboard or picker and lets the browser check the format.',
        preview: {},
      },
      {
        kind: 'write',
        prompt: 'Give each order field the right type, and make Note a multi-line box.',
        starter:
          '<form action="/order" method="post">\n  <label for="ph">Phone</label>\n  <input type="text" id="ph" name="phone">\n  <label for="qty">Boxes</label>\n  <input type="text" id="qty" name="boxes">\n  <label for="note">Note</label>\n  <input type="text" id="note" name="note">\n  <button>Order</button>\n</form>',
        solution:
          '<form action="/order" method="post">\n  <label for="ph">Phone</label>\n  <input type="tel" id="ph" name="phone">\n  <label for="qty">Boxes</label>\n  <input type="number" id="qty" name="boxes">\n  <label for="note">Note</label>\n  <textarea id="note" name="note" rows="4"></textarea>\n  <button>Order</button>\n</form>',
        checks: [
          { label: 'Phone uses type="tel"', re: '<input(?=[^>]*\\sid=["\']ph["\'])(?=[^>]*\\stype=["\']tel["\'])[^>]*>', flags: 'i' },
          { label: 'Boxes uses type="number"', re: '<input(?=[^>]*\\sid=["\']qty["\'])(?=[^>]*\\stype=["\']number["\'])[^>]*>', flags: 'i' },
          {
            label: 'Note is a <textarea> with id and name, closed',
            re: '<textarea(?=[^>]*\\sid=["\']note["\'])(?=[^>]*\\sname=["\']note["\'])[^>]*>[^<]*</textarea>',
            flags: 'i',
          },
          { label: 'The textarea sets rows', re: '<textarea[^>]*\\srows=["\']?\\d+', flags: 'i' },
          { label: 'No type="text" left', not: 'type="text"' },
        ],
        hint: 'tel for phones, number for counts. textarea is its own element with a closing tag.',
        explain: 'tel brings up a dial pad and number a numeric keypad; textarea lets the note run over several lines.',
        preview: {},
      },
    ],
    // L4 Choices
    [
      {
        kind: 'write',
        prompt: 'Write a pizza order: a size radio group and an extra-cheese checkbox.',
        starter: '<form action="/pizza" method="post">\n\n  <button>Order</button>\n</form>',
        solution:
          '<form action="/pizza" method="post">\n  <label><input type="radio" name="size" value="medium"> Medium</label>\n  <label><input type="radio" name="size" value="large"> Large</label>\n  <label><input type="checkbox" name="cheese" value="yes"> Extra cheese</label>\n  <button>Order</button>\n</form>',
        checks: [
          {
            label: 'Two or more radios sharing one name',
            re: '<input(?=[^>]*\\stype=["\']radio["\'])[^>]*\\sname=["\']([\\w-]+)["\'][^>]*>[\\s\\S]*<input(?=[^>]*\\stype=["\']radio["\'])(?=[^>]*\\sname=["\']\\1["\'])',
            flags: 'i',
          },
          {
            label: 'Each radio has its own value',
            re: '^(?![\\s\\S]*<input(?=[^>]*\\stype=["\']radio["\'])(?![^>]*\\svalue=)[^>]*>)[\\s\\S]*type=["\']radio',
            flags: 'i',
          },
          { label: 'A checkbox with a name', re: '<input(?=[^>]*\\stype=["\']checkbox["\'])(?=[^>]*\\sname=["\'][^"\']+["\'])[^>]*>', flags: 'i' },
          { label: 'A <label> for every choice', re: '(<label[^>]*>[\\s\\S]*?</label>[\\s\\S]*){3}', flags: 'i' },
        ],
        hint: 'Radios in one group share a name; value is what gets sent.',
        explain: 'A shared name makes the radios one group, so only one size can be picked. The checkbox ticks on and off alone.',
        preview: {},
      },
      {
        kind: 'write',
        prompt: 'Fix the seat radios, pre-pick one, and add a show-time dropdown with 7pm selected.',
        starter:
          '<form action="/tickets" method="post">\n  <p>Seat</p>\n  <label><input type="radio" name="seat1" value="stalls"> Stalls</label>\n  <label><input type="radio" name="seat2" value="balcony"> Balcony</label>\n  <button>Buy</button>\n</form>',
        solution:
          '<form action="/tickets" method="post">\n  <p>Seat</p>\n  <label><input type="radio" name="seat" value="stalls" checked> Stalls</label>\n  <label><input type="radio" name="seat" value="balcony"> Balcony</label>\n  <label for="time">Show</label>\n  <select id="time" name="time">\n    <option value="5pm">5pm</option>\n    <option value="7pm" selected>7pm</option>\n  </select>\n  <button>Buy</button>\n</form>',
        checks: [
          {
            label: 'Both seat radios share one name',
            re: '<input(?=[^>]*\\stype=["\']radio["\'])[^>]*\\sname=["\']([\\w-]+)["\'][^>]*>[\\s\\S]*<input(?=[^>]*\\stype=["\']radio["\'])(?=[^>]*\\sname=["\']\\1["\'])',
            flags: 'i',
          },
          { label: 'One radio is checked', re: '<input(?=[^>]*\\stype=["\']radio["\'])[^>]*\\schecked[\\s>=/]', flags: 'i' },
          {
            label: 'A named <select> with two or more options',
            re: '<select[^>]*\\sname=["\'][^"\']+["\'][^>]*>(\\s*<option[^>]*>[^<]*</option>){2,}\\s*</select>',
            flags: 'i',
          },
          { label: 'The 7pm option is selected', re: '<option(?=[^>]*\\sselected)[^>]*>[^<]*(?<!\\d)(7|19)(?!\\d)[^<]*</option>', flags: 'i' },
        ],
        hint: 'Radios in a group need the same name. checked and selected are boolean attributes.',
        explain: 'Different names made two separate groups, so both could be picked. checked and selected set the defaults.',
        preview: {},
      },
    ],
    // L5 Built-in validation
    [
      {
        kind: 'write',
        prompt: 'Write a sign-up form: a required 3–20 character username and an age of 18+.',
        starter: '<form action="/register" method="post">\n\n  <button>Sign up</button>\n</form>',
        solution:
          '<form action="/register" method="post">\n  <label for="user">Username</label>\n  <input type="text" id="user" name="user" required minlength="3" maxlength="20">\n  <label for="age">Age</label>\n  <input type="number" id="age" name="age" min="18">\n  <button>Sign up</button>\n</form>',
        checks: [
          {
            label: 'A required username input',
            re: '<input(?=[^>]*\\sminlength=)(?=[^>]*\\srequired[\\s>=/])[^>]*>',
            flags: 'i',
          },
          { label: 'minlength="3"', re: '\\sminlength=["\']?3["\']?[\\s>/]', flags: 'i' },
          { label: 'maxlength="20"', re: '\\smaxlength=["\']?20["\']?[\\s>/]', flags: 'i' },
          {
            label: 'A number input with min="18"',
            re: '<input(?=[^>]*\\stype=["\']number["\'])(?=[^>]*\\smin=["\']?18["\']?[\\s>/])[^>]*>',
            flags: 'i',
          },
          { label: 'Labels for both fields', re: '(<label[\\s\\S]*?</label>[\\s\\S]*){2}', flags: 'i' },
        ],
        hint: 'minlength/maxlength count characters; min/max limit numbers.',
        explain: 'The browser blocks the form until these rules pass, but the server must still check them.',
        preview: {},
      },
      {
        kind: 'write',
        prompt: 'Fix the RSVP rules: 1–8 guests, and a required 6-character code via pattern.',
        starter:
          '<form action="/rsvp" method="post">\n  <label for="guests">Guests</label>\n  <input type="number" id="guests" name="guests" minlength="1" maxlength="8">\n  <label for="code">Invite code</label>\n  <input type="text" id="code" name="code" max="6">\n  <button>RSVP</button>\n</form>',
        solution:
          '<form action="/rsvp" method="post">\n  <label for="guests">Guests</label>\n  <input type="number" id="guests" name="guests" min="1" max="8">\n  <label for="code">Invite code</label>\n  <input type="text" id="code" name="code" required pattern="[A-Za-z0-9]{6}">\n  <button>RSVP</button>\n</form>',
        checks: [
          {
            label: 'Guests uses min="1" and max="8"',
            re: '<input(?=[^>]*\\sid=["\']guests["\'])(?=[^>]*\\smin=["\']?1["\']?[\\s>/])(?=[^>]*\\smax=["\']?8["\']?[\\s>/])[^>]*>',
            flags: 'i',
          },
          { label: 'No minlength/maxlength on a number', re: '^(?![\\s\\S]*(min|max)length=)[\\s\\S]*<input', flags: 'i' },
          {
            label: 'The code has a pattern for exactly 6 characters',
            re: '<input(?=[^>]*\\sid=["\']code["\'])(?=[^>]*\\spattern=["\'][^"\']*\\{6\\}[^"\']*["\'])[^>]*>',
            flags: 'i',
          },
          { label: 'The code is required', re: '<input(?=[^>]*\\sid=["\']code["\'])(?=[^>]*\\srequired[\\s>=/])[^>]*>', flags: 'i' },
          { label: 'No max on the text field', not: 'max="6"' },
        ],
        hint: 'Numbers use min and max. A text field can’t use max; pattern like [A-Z0-9]{6} fixes its shape.',
        explain: 'minlength and maxlength only work on text, and min and max only on numbers and dates, so the wrong one is ignored.',
        preview: {},
      },
    ],
  ],
};

export default unit;
