import type { DesktopUnit } from '../../../engine/types';

// Desktop edition: write-the-code challenges for C# unit 8 (Properties & encapsulation).
// lessons[i] runs after lesson i + 1. See docs/CONTENT_GUIDE.md.
const unit: DesktopUnit = {
  lessons: [
    // L1 private & public
    [
      {
        kind: 'write',
        prompt: 'Write a Vault with a private balance and public Deposit and Show methods.',
        starter: '',
        solution:
          'var vault = new Vault();\nvault.Deposit(50);\nvault.Deposit(-20);\nvault.Show();\n\nclass Vault\n{\n    private int balance;\n    public void Deposit(int amount)\n    {\n        if (amount > 0) balance += amount;\n    }\n    public void Show() => Console.WriteLine($"Balance: {balance}");\n}',
        checks: [
          { label: 'A private int balance field', re: 'private\\s+int\\s+\\w+\\s*(=\\s*\\d+\\s*)?;' },
          { label: 'public void Deposit(int amount)', re: 'public\\s+void\\s+Deposit\\s*\\(\\s*int\\s+\\w+\\s*\\)' },
          { label: 'Deposit ignores amounts of 0 or less', re: 'if\\s*\\(\\s*\\w+\\s*(>\\s*0|>=\\s*1)\\s*\\)|if\\s*\\(\\s*\\w+\\s*<=\\s*0\\s*\\)' },
          { label: 'A public Show() that prints the balance', re: 'public\\s+void\\s+Show\\s*\\(\\s*\\)' },
          { label: 'Try a negative deposit', re: '\\.Deposit\\s*\\(\\s*-\\s*\\d+\\s*\\)' },
        ],
        hint: 'Outside code can’t touch balance, so give it public methods that check first.',
        explain: 'The -20 deposit is rejected inside the class, so the balance stays 50. Nothing outside can break that rule.',
        output: 'Balance: 50',
      },
      {
        kind: 'write',
        prompt: 'This won’t compile: code is private. Add a public SetCode method instead.',
        starter:
          'var door = new SmartLock();\ndoor.code = 4321;\ndoor.Unlock(4321);\ndoor.Unlock(1111);\n\nclass SmartLock\n{\n    private int code = 1234;\n    public void Unlock(int guess) => Console.WriteLine(guess == code ? "Unlocked" : "Wrong code");\n}',
        solution:
          'var door = new SmartLock();\ndoor.SetCode(4321);\ndoor.Unlock(4321);\ndoor.Unlock(1111);\n\nclass SmartLock\n{\n    private int code = 1234;\n    public void SetCode(int newCode)\n    {\n        if (newCode >= 1000) code = newCode;\n    }\n    public void Unlock(int guess) => Console.WriteLine(guess == code ? "Unlocked" : "Wrong code");\n}',
        checks: [
          { label: 'Outside code no longer touches door.code', not: 'door.code' },
          { label: 'Keep code private', has: 'private int code' },
          { label: 'A public SetCode(int) that sets code', re: 'public\\s+void\\s+SetCode\\s*\\(\\s*int\\s+\\w+\\s*\\)\\s*(\\{|=>)[^}]*\\bcode\\s*=' },
          { label: 'Call door.SetCode(4321)', re: 'door\\.SetCode\\s*\\(\\s*4321\\s*\\)\\s*;' },
        ],
        hint: 'Methods inside the class may use private fields. Swap the assignment for a method call.',
        explain: 'Private fields can only change through the class’s own methods, which can check the new value first.',
        output: 'Unlocked\nWrong code',
      },
    ],
    // L2 Get & set
    [
      {
        kind: 'write',
        prompt: 'Give a Thermostat a Target property whose set keeps it between 10 and 30.',
        starter: '',
        solution:
          'var t = new Thermostat();\nt.Target = 45;\nConsole.WriteLine(t.Target);\nt.Target = 21;\nConsole.WriteLine(t.Target);\n\nclass Thermostat\n{\n    private int target = 20;\n    public int Target\n    {\n        get { return target; }\n        set\n        {\n            if (value < 10) target = 10;\n            else if (value > 30) target = 30;\n            else target = value;\n        }\n    }\n}',
        checks: [
          { label: 'A private backing field', re: 'private\\s+int\\s+\\w+' },
          { label: 'A public int Target property', re: 'public\\s+int\\s+Target\\s*\\{' },
          { label: 'get hands out the field', re: 'get\\s*(\\{\\s*return\\s+\\w+\\s*;\\s*\\}|=>\\s*\\w+\\s*;)' },
          { label: 'set checks value against 10 and 30', re: 'set\\s*(\\{|=>)[\\s\\S]*\\bvalue\\b[\\s\\S]*(10[\\s\\S]*30|30[\\s\\S]*10)' },
          { label: 'Set it from outside like a field', re: '\\w+\\.Target\\s*=\\s*\\d+\\s*;' },
        ],
        hint: 'Inside set, the new value is called value. Store a fixed-up version in the private field.',
        explain: 'Setting 45 runs set, which stores 30 instead. Outside code just uses t.Target like a field.',
        output: '30\n21',
      },
      {
        kind: 'write',
        prompt: 'Turn Title into a property whose set trims the text.',
        starter:
          'var song = new Song();\nsong.Title = "  echoes  ";\nConsole.WriteLine($"[{song.Title}]");\n\nclass Song\n{\n    public string Title = "";\n}',
        solution:
          'var song = new Song();\nsong.Title = "  echoes  ";\nConsole.WriteLine($"[{song.Title}]");\n\nclass Song\n{\n    private string title = "";\n    public string Title\n    {\n        get { return title; }\n        set { title = value.Trim(); }\n    }\n}',
        checks: [
          { label: 'A private string field to hold it', re: 'private\\s+string\\s+\\w+' },
          { label: 'A public string Title property with get', re: 'public\\s+string\\s+Title\\s*\\{[\\s\\S]*\\bget\\b' },
          { label: 'set stores value.Trim()', re: 'set\\s*(\\{|=>)[^}]*value\\.Trim\\s*\\(\\s*\\)' },
          { label: 'Title is no longer a plain field', not: 'public string Title = ""' },
        ],
        hint: 'Keep the outside code the same: a property is used exactly like a field.',
        explain: 'The program didn’t change, but every value now passes through set, which trims the spaces.',
        output: '[echoes]',
      },
    ],
    // L3 Auto & computed properties
    [
      {
        kind: 'write',
        prompt: 'Make a Rectangle with auto-properties and a computed Area.',
        starter: '',
        solution:
          'var rect = new Rectangle();\nrect.Width = 6;\nrect.Height = 4;\nConsole.WriteLine(rect.Area);\n\nclass Rectangle\n{\n    public int Width { get; set; }\n    public int Height { get; set; }\n    public int Area => Width * Height;\n}',
        checks: [
          { label: 'Width and Height as { get; set; } auto-properties', re: '(public\\s+int\\s+\\w+\\s*\\{\\s*get\\s*;\\s*set\\s*;\\s*\\}[\\s\\S]*){2}' },
          { label: 'Area worked out with =>', re: 'public\\s+int\\s+Area\\s*=>\\s*\\w+\\s*\\*\\s*\\w+\\s*;' },
          { label: 'Print Area (no brackets: it’s a property)', re: 'WriteLine\\s*\\(\\s*\\w+\\.Area\\s*\\)' },
        ],
        hint: 'public int Width { get; set; } needs no field. A => property is recalculated on every read.',
        explain: 'C# makes the hidden fields for you, and Area is 6 × 4 each time it’s read.',
        output: '24',
      },
      {
        kind: 'write',
        prompt: 'Write Drone so Battery starts at 100, only Fly can lower it.',
        starter:
          'var bot = new Drone();\nbot.Fly(30);\nbot.Fly(50);\nConsole.WriteLine($"Battery {bot.Battery}%, grounded: {bot.Grounded}");\n\nclass Drone\n{\n}',
        solution:
          'var bot = new Drone();\nbot.Fly(30);\nbot.Fly(50);\nConsole.WriteLine($"Battery {bot.Battery}%, grounded: {bot.Grounded}");\n\nclass Drone\n{\n    public int Battery { get; private set; } = 100;\n    public bool Grounded => Battery <= 25;\n    public void Fly(int minutes) => Battery -= minutes;\n}',
        checks: [
          { label: 'Battery { get; private set; } = 100;', re: 'public\\s+int\\s+Battery\\s*\\{\\s*get\\s*;\\s*private\\s+set\\s*;\\s*\\}\\s*=\\s*100\\s*;' },
          { label: 'Grounded computed with => (true at 25 or below)', re: 'public\\s+bool\\s+Grounded\\s*=>\\s*Battery' },
          { label: 'Fly(int minutes) lowers Battery', re: 'public\\s+void\\s+Fly\\s*\\(\\s*int\\s+\\w+\\s*\\)[^}]*Battery\\s*(-=|=\\s*Battery\\s*-)' },
        ],
        hint: 'private set: anyone can read it, but only code in Drone can change it.',
        explain: '100 − 30 − 50 leaves 20, and Grounded is recalculated from Battery each time, so it’s True.',
        output: 'Battery 20%, grounded: True',
      },
    ],
    // L4 init & required
    [
      {
        kind: 'write',
        prompt: 'Create a Movie with an object initializer; Title is required and init-only.',
        starter: '',
        solution:
          'var film = new Movie { Title = "Arrival", Year = 2016 };\nConsole.WriteLine($"{film.Title} ({film.Year})");\n\nclass Movie\n{\n    public required string Title { get; init; }\n    public int Year { get; init; }\n}',
        checks: [
          { label: 'public required string Title { get; init; }', re: 'public\\s+required\\s+string\\s+Title\\s*\\{\\s*get\\s*;\\s*init\\s*;\\s*\\}' },
          { label: 'An init-only int Year', re: 'public\\s+int\\s+Year\\s*\\{\\s*get\\s*;\\s*init\\s*;\\s*\\}' },
          { label: 'Set both in { } right after new', re: 'new\\s*(Movie\\s*)?(\\(\\s*\\))?\\s*\\{(?=[^}]*Title\\s*=)(?=[^}]*Year\\s*=)' },
        ],
        hint: 'new Movie { Title = "...", Year = ... } sets properties as part of creating it.',
        explain: 'init allows setting only during creation, and required makes the compiler insist on Title.',
        output: 'Arrival (2016)',
      },
      {
        kind: 'write',
        prompt: 'Fix the two compile errors without touching the Order class.',
        starter:
          'var order = new Order { Dish = "Ramen" };\norder.Dish = "Sushi";\nvar second = new Order { Table = 4 };\nConsole.WriteLine($"{order.Dish} for table {order.Table}");\n\nclass Order\n{\n    public required string Dish { get; init; }\n    public int Table { get; init; } = 1;\n}',
        solution:
          'var order = new Order { Dish = "Sushi" };\nvar second = new Order { Dish = "Ramen", Table = 4 };\nConsole.WriteLine($"{order.Dish} for table {order.Table}");\nConsole.WriteLine($"{second.Dish} for table {second.Table}");\n\nclass Order\n{\n    public required string Dish { get; init; }\n    public int Table { get; init; } = 1;\n}',
        checks: [
          { label: 'Don’t set Dish after creation', not: 'order.Dish =' },
          { label: 'Every new Order sets the required Dish', re: '^(?![\\s\\S]*new\\s+Order\\s*\\{(?![^}]*Dish\\s*=)[^}]*\\})[\\s\\S]*new\\s+Order' },
          { label: 'The second order still sits at table 4', re: 'new\\s+Order\\s*\\{[^}]*Table\\s*=\\s*4' },
          { label: 'Keep Dish required and init-only', has: 'public required string Dish { get; init; }' },
        ],
        hint: 'Init-only values go inside the { } at creation. A required one must be in every { }.',
        explain: 'You can’t change an init property later, so the first order is created as Sushi. The second needed its Dish.',
        output: 'Sushi for table 1\nRamen for table 4',
      },
    ],
    // L5 The field keyword
    [
      {
        kind: 'write',
        prompt: 'Use field in a Score property so set never stores a negative.',
        starter: '',
        solution:
          'var player = new Player();\nplayer.Score = -5;\nConsole.WriteLine(player.Score);\nplayer.Score = 40;\nConsole.WriteLine(player.Score);\n\nclass Player\n{\n    public int Score { get; set => field = value < 0 ? 0 : value; }\n}',
        checks: [
          { label: 'get; stays automatic', re: 'Score\\s*\\{\\s*get\\s*;' },
          { label: 'set assigns to field', re: 'set\\s*(=>|\\{)[^}]*\\bfield\\s*=' },
          { label: 'Turn negatives into 0', re: 'value\\s*<\\s*0|0\\s*>\\s*value|Math\\.Max\\s*\\(\\s*(0\\s*,\\s*value|value\\s*,\\s*0)\\s*\\)' },
          { label: 'No private backing field needed', not: 'private int' },
        ],
        hint: 'public int Score { get; set => field = ...; }',
        explain: 'field is the hidden storage C# makes for you, so you can validate in set without declaring a field.',
        output: '0\n40',
      },
      {
        kind: 'write',
        prompt: 'Rewrite Name with field, drop the private field, and ignore blank names.',
        starter:
          'var pet = new Pet();\npet.Name = "  luna ";\nConsole.WriteLine($"[{pet.Name}]");\npet.Name = "   ";\nConsole.WriteLine($"[{pet.Name}]");\n\nclass Pet\n{\n    private string name = "Unnamed";\n    public string Name\n    {\n        get { return name; }\n        set { name = value.Trim(); }\n    }\n}',
        solution:
          'var pet = new Pet();\npet.Name = "  luna ";\nConsole.WriteLine($"[{pet.Name}]");\npet.Name = "   ";\nConsole.WriteLine($"[{pet.Name}]");\n\nclass Pet\n{\n    public string Name\n    {\n        get;\n        set\n        {\n            if (value.Trim() != "") field = value.Trim();\n        }\n    } = "Unnamed";\n}',
        checks: [
          { label: 'Drop the private name field', not: 'private string name' },
          { label: 'get; is automatic', re: '\\bget\\s*;' },
          { label: 'set stores the trimmed text in field', re: '\\bfield\\s*=\\s*value\\.Trim\\s*\\(\\s*\\)' },
          { label: 'Skip blank names with an if', re: 'if\\s*\\(.*(!=\\s*""|IsNullOrWhiteSpace|Length\\s*>\\s*0|IsNullOrEmpty)' },
        ],
        hint: 'Keep the trim, but only assign field when the trimmed text isn’t empty.',
        explain: 'The blank name is ignored, so luna stays. field replaces the private name you had to declare before.',
        output: '[luna]\n[luna]',
      },
    ],
  ],
};

export default unit;
