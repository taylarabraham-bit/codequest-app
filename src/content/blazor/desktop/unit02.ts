import type { DesktopUnit } from '../../../engine/types';

// Desktop edition: write-the-code challenges for Blazor unit 2 (Events & data binding).
// lessons[i] runs after lesson i + 1. See docs/CONTENT_GUIDE.md.
const unit: DesktopUnit = {
  lessons: [
    // L1 Click events
    [
      {
        kind: 'write',
        prompt: 'Build a water tracker: a Drink button that adds one cup per click.',
        starter: '',
        solution:
          '@rendermode InteractiveServer\n<p>Cups of water: @cups</p>\n<button @onclick="AddCup">Drink</button>\n@code {\n    int cups;\n    void AddCup() => cups++;\n}',
        checks: [
          { label: 'Make it interactive with @rendermode InteractiveServer', has: '@rendermode InteractiveServer' },
          { label: 'Show the count with @', re: '<p>[^<]*@\\w+' },
          { label: 'A button with @onclick set to a method name', re: '<button[^>]*@onclick="(\\w+)"[\\s\\S]*void\\s+\\1\\s*\\(\\s*\\)' },
          { label: 'The method adds one', re: '\\w+\\s*\\+\\+|\\+\\+\\s*\\w+|\\w+\\s*\\+=\\s*1\\b' },
        ],
        hint: 'Put @rendermode at the top, then @onclick="MethodName" with no brackets.',
        explain: 'Interactive mode wires the click to your C# method, and Blazor re-renders the count after it runs.',
        output: 'Cups of water: 0\nDrink',
      },
      {
        kind: 'write',
        prompt: 'The Switch button does nothing. Make it toggle the lamp.',
        starter:
          '<p>Lamp is @(on ? "on" : "off")</p>\n<button onclick="Toggle()">Switch</button>\n@code {\n    bool on;\n    void Toggle() => on = !on;\n}',
        solution:
          '@rendermode InteractiveServer\n<p>Lamp is @(on ? "on" : "off")</p>\n<button @onclick="Toggle">Switch</button>\n@code {\n    bool on;\n    void Toggle() => on = !on;\n}',
        checks: [
          { label: 'Add @rendermode InteractiveServer', has: '@rendermode InteractiveServer' },
          { label: 'Use the Blazor event @onclick', re: '@onclick="(Toggle|\\(\\)\\s*=>\\s*Toggle\\(\\))"' },
          { label: 'No HTML onclick="Toggle()" left', not: 'onclick="Toggle()"' },
        ],
        hint: 'Three things: a render mode, an @ before onclick, and no brackets after the method name.',
        explain: 'Plain onclick is a JavaScript attribute and static pages never run C#. @onclick plus a render mode connects the button to Toggle.',
        output: 'Lamp is off\nSwitch',
      },
    ],
    // L2 Lambda handlers
    [
      {
        kind: 'write',
        prompt: 'Make +1 and +5 buttons and a Reset button, all with inline lambdas.',
        starter: '@rendermode InteractiveServer\n<p>Score: @score</p>\n@code { int score; }',
        solution:
          '@rendermode InteractiveServer\n<p>Score: @score</p>\n<button @onclick="() => score += 1">+1</button>\n<button @onclick="() => score += 5">+5</button>\n<button @onclick="() => score = 0">Reset</button>\n@code { int score; }',
        checks: [
          { label: 'A +1 button using () => score += 1', re: '@onclick="\\(\\)\\s*=>\\s*(score\\s*\\+=\\s*1|score\\s*\\+\\+|\\+\\+\\s*score)\\s*"' },
          { label: 'A +5 button using a lambda', re: '@onclick="\\(\\)\\s*=>\\s*score\\s*\\+=\\s*5\\s*"' },
          { label: 'A Reset button that sets score to 0', re: '@onclick="\\(\\)\\s*=>\\s*score\\s*=\\s*0\\s*"' },
        ],
        hint: 'Inside the quotes write () => followed by the statement, like () => score += 5.',
        explain: 'A lambda is a tiny handler written in place, handy when a method would be one line anyway.',
        output: 'Score: 0\n+1 +5 Reset',
      },
      {
        kind: 'write',
        prompt: 'Every button books 5 seats. Fix the loop so each books its own number.',
        starter:
          '@rendermode InteractiveServer\n<p>Seats: @seats</p>\n@for (int i = 1; i <= 4; i++)\n{\n    <button @onclick="() => Book(i)">@i</button>\n}\n@code {\n    int seats;\n    void Book(int n) => seats = n;\n}',
        solution:
          '@rendermode InteractiveServer\n<p>Seats: @seats</p>\n@for (int i = 1; i <= 4; i++)\n{\n    var count = i;\n    <button @onclick="() => Book(count)">@count</button>\n}\n@code {\n    int seats;\n    void Book(int n) => seats = n;\n}',
        checks: [
          { label: 'Copy i into a local inside the loop', re: '(var|int)\\s+(\\w+)\\s*=\\s*i\\s*;[\\s\\S]*@onclick="\\(\\)\\s*=>\\s*Book\\(\\s*\\2\\s*\\)"' },
          { label: 'No lambda that captures i directly', not: 'Book(i)' },
        ],
        hint: 'Inside the braces, add var n = i; and pass n to Book.',
        explain: 'The lambdas run later, after the loop has finished and i is 5. A fresh local per pass keeps each button’s own number.',
        output: 'Seats: 0\n1 2 3 4',
      },
    ],
    // L3 Event arguments
    [
      {
        kind: 'write',
        prompt: 'Show where the player tapped the board, using the mouse event’s position.',
        starter: '@rendermode InteractiveServer\n<div class="board">Tap the board</div>\n',
        solution:
          '@rendermode InteractiveServer\n<div class="board" @onclick="Tap">Tap the board</div>\n<p>Tapped at @x, @y</p>\n@code {\n    double x, y;\n    void Tap(MouseEventArgs e)\n    {\n        x = e.ClientX;\n        y = e.ClientY;\n    }\n}',
        checks: [
          { label: 'The board has an @onclick handler', re: '<div[^>]*@onclick="\\w+"' },
          { label: 'The handler takes MouseEventArgs', re: 'void\\s+\\w+\\s*\\(\\s*MouseEventArgs\\s+\\w+\\s*\\)' },
          { label: 'Read ClientX and ClientY', re: '\\.ClientX[\\s\\S]*\\.ClientY|\\.ClientY[\\s\\S]*\\.ClientX' },
          { label: 'Show the position on the page', re: '<p>[^<]*@\\w+' },
        ],
        hint: 'Give the method a MouseEventArgs parameter; Blazor fills it in for you.',
        explain: 'When a handler declares an event-args parameter, Blazor passes the event details, like where the click landed.',
        output: 'Tap the board\nTapped at 0, 0',
      },
      {
        kind: 'write',
        prompt: 'Move the player with the arrow keys, without the page scrolling.',
        starter:
          '@rendermode InteractiveServer\n<div tabindex="0">\n    Player at @pos\n</div>\n@code {\n    int pos = 5;\n}',
        solution:
          '@rendermode InteractiveServer\n<div tabindex="0" @onkeydown="Move" @onkeydown:preventDefault>\n    Player at @pos\n</div>\n@code {\n    int pos = 5;\n    void Move(KeyboardEventArgs e)\n    {\n        if (e.Key == "ArrowLeft") pos--;\n        if (e.Key == "ArrowRight") pos++;\n    }\n}',
        checks: [
          { label: 'Handle @onkeydown on the div', re: '<div[^>]*@onkeydown="\\w+"' },
          { label: 'The handler takes KeyboardEventArgs', re: 'void\\s+\\w+\\s*\\(\\s*KeyboardEventArgs\\s+\\w+\\s*\\)' },
          { label: 'Check e.Key for "ArrowLeft" and "ArrowRight"', re: '"ArrowLeft"[\\s\\S]*"ArrowRight"|"ArrowRight"[\\s\\S]*"ArrowLeft"' },
          { label: 'Block scrolling with @onkeydown:preventDefault', has: '@onkeydown:preventDefault' },
        ],
        hint: 'e.Key holds names like "ArrowLeft". The :preventDefault modifier stops the browser’s own reaction.',
        explain: 'Arrow keys normally scroll the page. preventDefault stops that while your handler still gets every key.',
        output: 'Player at 5',
      },
    ],
    // L4 Two-way @bind
    [
      {
        kind: 'write',
        prompt: 'Preview a name tag: a live text box and a Pro member checkbox.',
        starter: '@rendermode InteractiveServer\n',
        solution:
          '@rendermode InteractiveServer\n<input @bind="nickname" @bind:event="oninput" />\n<label><input type="checkbox" @bind="pro" /> Pro member</label>\n<p>@nickname @(pro ? "(Pro)" : "")</p>\n@code {\n    string nickname = "Sam";\n    bool pro;\n}',
        checks: [
          { label: 'A text box bound with @bind', re: '<input(?![^>]*checkbox)[^>]*@bind="\\w+"' },
          { label: 'It updates on every keystroke', has: '@bind:event="oninput"' },
          { label: 'A checkbox bound to a bool', re: '<input(?=[^>]*type="checkbox")[^>]*@bind="(\\w+)"[\\s\\S]*bool\\s+(\\w+\\s*,\\s*)*\\1\\b' },
          { label: 'Show the name in a <p>', re: '<p>[^<]*@\\w+' },
        ],
        hint: '@bind="field" on each input; add @bind:event="oninput" to the text box.',
        explain: '@bind both shows the field and writes edits back. oninput updates as you type instead of when you leave the box.',
        output: 'Pro member\nSam',
      },
      {
        kind: 'write',
        prompt: 'Bind the size picker, and add a quantity box bound to an int.',
        starter:
          '@rendermode InteractiveServer\n<select>\n    <option value="S">Small</option>\n    <option value="M">Medium</option>\n    <option value="L">Large</option>\n</select>\n<p>Size: @size</p>\n@code {\n    string size = "M";\n}',
        solution:
          '@rendermode InteractiveServer\n<select @bind="size">\n    <option value="S">Small</option>\n    <option value="M">Medium</option>\n    <option value="L">Large</option>\n</select>\n<input type="number" @bind="qty" />\n<p>Size: @size, quantity: @qty</p>\n@code {\n    string size = "M";\n    int qty = 1;\n}',
        checks: [
          { label: 'Bind the <select> to size', re: '<select[^>]*@bind="size"' },
          { label: 'An input bound to an int field', re: '<input[^>]*@bind="(\\w+)"[\\s\\S]*int\\s+\\1\\b' },
          { label: 'Show the quantity in the <p>', re: '<input[^>]*@bind="(\\w+)"[\\s\\S]*<p>[^<]*@\\1\\b' },
        ],
        hint: 'A <select> binds like an input. Add an int field in @code for the quantity.',
        explain: 'A select binds to the picked option’s value, and an int field makes Blazor convert the box’s text to a number.',
      },
    ],
    // L5 Bind modifiers
    [
      {
        kind: 'write',
        prompt: 'Bind a due date shown as yyyy-MM-dd, and save after each change.',
        starter: '@rendermode InteractiveServer\n',
        solution:
          '@rendermode InteractiveServer\n<input @bind="due" @bind:format="yyyy-MM-dd" @bind:after="Save" />\n<p>@status</p>\n@code {\n    DateTime due = new(2026, 12, 1);\n    string status = "";\n    void Save() => status = $"Saved {due:d MMM}";\n}',
        checks: [
          { label: 'A DateTime field', re: 'DateTime\\??\\s+\\w+' },
          { label: 'Bind it with @bind', re: '<input[^>]*@bind="\\w+"' },
          { label: 'Format it with @bind:format="yyyy-MM-dd"', has: '@bind:format="yyyy-MM-dd"' },
          { label: 'Run a method with @bind:after', re: '@bind:after="(\\w+)"[\\s\\S]*(void|Task)\\s+\\1\\s*\\(' },
        ],
        hint: 'Modifiers sit next to @bind on the same input: @bind:format and @bind:after.',
        explain: 'format controls how the date is written in the box, and after runs your method once the field holds the new value.',
      },
      {
        kind: 'write',
        prompt: 'Use @bind:get and @bind:set so the coupon is always uppercase.',
        starter:
          '@rendermode InteractiveServer\n<input @bind="coupon" />\n<p>Coupon: @coupon</p>\n@code {\n    string coupon = "";\n}',
        solution:
          '@rendermode InteractiveServer\n<input @bind:get="coupon" @bind:set="SetCoupon" />\n<p>Coupon: @coupon</p>\n@code {\n    string coupon = "";\n    void SetCoupon(string? value) => coupon = value?.ToUpper() ?? "";\n}',
        checks: [
          { label: 'Read the field with @bind:get="coupon"', has: '@bind:get="coupon"' },
          { label: 'Write through a method with @bind:set', re: '@bind:set="(\\w+)"[\\s\\S]*(void|Task)\\s+\\1\\s*\\(\\s*string\\??\\s+\\w+\\s*\\)' },
          { label: 'Uppercase the value', re: '\\.ToUpper(Invariant)?\\(\\)' },
          { label: 'No plain @bind left', not: '@bind="coupon"' },
        ],
        hint: 'The setter gets the typed text as a string? parameter. Assign coupon yourself.',
        explain: 'get/set splits binding in two: Blazor shows the field, and your setter decides what to store.',
      },
    ],
  ],
};

export default unit;
