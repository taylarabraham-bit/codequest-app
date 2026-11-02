import type { DesktopUnit } from '../../../engine/types';

// Desktop edition: write-the-code challenges for C# unit 20 (Memory & performance).
// lessons[i] runs after lesson i + 1. See docs/CONTENT_GUIDE.md.
const unit: DesktopUnit = {
  lessons: [
    // L1 Value vs reference
    [
      {
        kind: 'write',
        prompt: 'Copy a Pin struct and a Card class, change the copies, print the originals.',
        starter: '',
        solution:
          'var pin1 = new Pin { Code = 1234 };\nvar pin2 = pin1;\npin2.Code = 9999;\nvar card1 = new Card { Owner = "Ana" };\nvar card2 = card1;\ncard2.Owner = "Bo";\nConsole.WriteLine(pin1.Code);\nConsole.WriteLine(card1.Owner);\n\nstruct Pin { public int Code; }\nclass Card { public string Owner = ""; }',
        checks: [
          { label: 'A struct Pin with an int Code', re: 'struct\\s+Pin\\s*\\{[^}]*int\\s+Code' },
          { label: 'A class Card with a string Owner', re: 'class\\s+Card\\s*\\{[^}]*string\\s+Owner' },
          { label: 'Copy the pin and change the copy', re: 'var\\s+(\\w+)\\s*=\\s*\\w+\\s*;\\s*\\1\\.Code\\s*=' },
          { label: 'Copy the card and change the copy', re: 'var\\s+(\\w+)\\s*=\\s*\\w+\\s*;\\s*\\1\\.Owner\\s*=' },
          { label: 'Print the original Code and Owner', re: 'Console\\.WriteLine\\s*\\(\\s*\\w+\\.Code\\s*\\)[\\s\\S]*Console\\.WriteLine\\s*\\(\\s*\\w+\\.Owner\\s*\\)' },
        ],
        hint: 'Assign with var copy = original; then change a field on the copy only.',
        explain: 'The struct copy is a separate value, so the original Code stays 1234. Both card variables point at one object, so Owner becomes Bo.',
        output: '1234\nBo',
      },
      {
        kind: 'write',
        prompt: 'Heal changes a copy, so the hero never heals. Fix it, keeping Stats a struct.',
        starter:
          'var hero = new Stats { Hp = 50 };\nHeal(hero);\nConsole.WriteLine(hero.Hp);\n\nvoid Heal(Stats s) => s.Hp += 20;\n\nstruct Stats { public int Hp; }',
        solution:
          'var hero = new Stats { Hp = 50 };\nhero = Heal(hero);\nConsole.WriteLine(hero.Hp);\n\nStats Heal(Stats s)\n{\n    s.Hp += 20;\n    return s;\n}\n\nstruct Stats { public int Hp; }',
        checks: [
          { label: 'Keep Stats a struct', re: 'struct\\s+Stats\\b' },
          { label: 'Heal returns the healed Stats (or takes it by ref)', re: 'Stats\\s+Heal\\s*\\(\\s*Stats\\s+\\w+\\s*\\)|Heal\\s*\\(\\s*ref\\s+Stats\\s+\\w+\\s*\\)' },
          { label: 'Store the result back in hero', re: 'hero\\s*=\\s*Heal\\s*\\(\\s*hero\\s*\\)|Heal\\s*\\(\\s*ref\\s+hero\\s*\\)' },
        ],
        hint: 'A struct parameter is a copy. Return the changed copy and assign it to hero.',
        explain: 'Passing a struct copies it, so changes inside Heal were lost. Handing the copy back makes hero 70.',
        output: '70',
      },
    ],
    // L2 Smarter structs & boxing
    [
      {
        kind: 'write',
        prompt: 'Make a readonly record struct for money, put it on sale and compare.',
        starter: '',
        solution:
          'var price = new Money(499, "EUR");\nvar sale = price with { Cents = 399 };\nConsole.WriteLine(sale);\nConsole.WriteLine(price == new Money(499, "EUR"));\n\nreadonly record struct Money(int Cents, string Currency);',
        checks: [
          { label: 'readonly record struct Money(int Cents, string Currency);', re: 'readonly\\s+record\\s+struct\\s+Money\\s*\\(\\s*int\\s+Cents\\s*,\\s*string\\s+Currency\\s*\\)\\s*;' },
          { label: 'Make the sale price with with { Cents = ... }', re: 'with\\s*\\{\\s*Cents\\s*=\\s*\\d+\\s*\\}' },
          { label: 'Print the sale value', re: 'Console\\.WriteLine\\s*\\(\\s*\\w+\\s*\\)' },
          { label: 'Compare with == against a new Money', re: '==\\s*new\\s+Money\\s*\\(' },
        ],
        hint: 'It is a record and a struct in one line, with readonly in front.',
        explain: 'A record struct gives you value equality, ToString and with, and readonly means no copy can ever be changed.',
        output: 'Money { Cents = 399, Currency = EUR }\nTrue',
      },
      {
        kind: 'write',
        prompt: 'Make Spot an immutable record struct, move it with with, then box it.',
        starter:
          'var spot = new Spot(2, 3);\nspot.X = 10;\nConsole.WriteLine(spot.X);\n\nstruct Spot\n{\n    public int X;\n    public int Y;\n    public Spot(int x, int y) { X = x; Y = y; }\n}',
        solution:
          'var spot = new Spot(2, 3);\nvar moved = spot with { X = 10 };\nobject boxed = moved;\nConsole.WriteLine(moved);\nConsole.WriteLine(boxed is Spot s && s == moved);\n\nreadonly record struct Spot(int X, int Y);',
        checks: [
          { label: 'readonly record struct Spot(int X, int Y);', re: 'readonly\\s+record\\s+struct\\s+Spot\\s*\\(\\s*int\\s+X\\s*,\\s*int\\s+Y\\s*\\)\\s*;' },
          { label: 'Move it with with { X = 10 }', re: 'with\\s*\\{\\s*X\\s*=\\s*10\\s*\\}' },
          { label: 'No spot.X = assignment', not: 'spot.X =' },
          { label: 'Box it into an object variable', re: 'object\\s+\\w+\\s*=\\s*\\w+\\s*;' },
          { label: 'Unbox it with is Spot', re: 'is\\s+Spot\\b|\\(\\s*Spot\\s*\\)\\s*\\w+' },
        ],
        hint: 'readonly record struct Spot(int X, int Y); replaces the whole struct. Use is Spot s to get it back out of the box.',
        explain: 'Boxing copies the value onto the heap. The boxed copy still equals moved, since record structs compare by value.',
        output: 'Spot { X = 10, Y = 3 }\nTrue',
      },
    ],
    // L3 Span & slicing
    [
      {
        kind: 'write',
        prompt: 'Book three middle seats through a Span over the seat array.',
        starter: 'int[] seats = [0, 0, 0, 0, 0, 0];\n',
        solution:
          'int[] seats = [0, 0, 0, 0, 0, 0];\nSpan<int> row = seats.AsSpan(2, 3);\nrow.Fill(1);\nrow[0] = 7;\nConsole.WriteLine(string.Join(" ", seats));',
        checks: [
          { label: 'A Span<int> over part of seats', re: 'Span\\s*<\\s*int\\s*>\\s+\\w+\\s*=\\s*seats\\.AsSpan\\s*\\(\\s*\\d+\\s*,\\s*\\d+\\s*\\)|Span\\s*<\\s*int\\s*>\\s+\\w+\\s*=\\s*seats\\.AsSpan\\s*\\(\\s*\\)\\s*\\[|Span\\s*<\\s*int\\s*>\\s+\\w+\\s*=\\s*seats\\.AsSpan\\s*\\(\\s*\\)\\.Slice' },
          { label: 'Write through the span', re: '\\w+\\.Fill\\s*\\(|\\w+\\s*\\[\\s*\\d+\\s*\\]\\s*=\\s*\\d' },
          { label: 'Print the original array', re: 'string\\.Join\\s*\\([^;]*seats\\s*\\)' },
        ],
        hint: 'seats.AsSpan(2, 3) starts at index 2 and covers three seats. Fill sets them all.',
        explain: 'The span is a window onto seats, not a copy, so writing through it changes the array itself.',
        output: '0 0 7 1 1 0',
      },
      {
        kind: 'write',
        prompt: 'Parse the time with a ReadOnlySpan<char> instead of Split.',
        starter:
          'string time = "12:45";\nstring[] parts = time.Split(\':\');\nint h = int.Parse(parts[0]);\nint m = int.Parse(parts[1]);\nConsole.WriteLine(h * 60 + m);',
        solution:
          'string time = "12:45";\nReadOnlySpan<char> span = time.AsSpan();\nint colon = span.IndexOf(\':\');\nint h = int.Parse(span[..colon]);\nint m = int.Parse(span[(colon + 1)..]);\nConsole.WriteLine(h * 60 + m);',
        checks: [
          { label: 'A ReadOnlySpan<char> from time.AsSpan()', re: 'ReadOnlySpan\\s*<\\s*char\\s*>\\s+\\w+\\s*=\\s*time\\.AsSpan\\s*\\(\\s*\\)' },
          { label: 'Find the colon with IndexOf', re: '\\.IndexOf\\s*\\(\\s*\':\'\\s*\\)' },
          { label: 'int.Parse slices of the span', re: '(int\\.Parse\\s*\\(\\s*\\w+\\s*(\\[|\\.Slice\\s*\\()[\\s\\S]*){2}' },
          { label: 'No Split', not: '.Split(' },
        ],
        hint: 'span[..colon] is the hours and span[(colon + 1)..] the minutes. int.Parse accepts a span.',
        explain: 'Split made an array and two new strings. Slicing a span points into the original text, so nothing new is allocated.',
        output: '765',
      },
    ],
    // L4 Fewer allocations
    [
      {
        kind: 'write',
        prompt: 'Build the list of the first five squares with a StringBuilder.',
        starter: '',
        solution:
          'using System.Text;\n\nvar sb = new StringBuilder();\nfor (int i = 1; i <= 5; i++)\n    sb.Append(i * i).Append(\',\');\nsb.Length--;\nConsole.WriteLine(sb.ToString());',
        checks: [
          { label: 'using System.Text;', re: 'using\\s+System\\.Text\\s*;' },
          { label: 'Create a StringBuilder', re: 'new\\s+StringBuilder\\s*\\(|StringBuilder\\s+\\w+\\s*=\\s*new\\s*\\(' },
          { label: 'Append inside a loop', re: '(for|foreach|while)\\s*\\([\\s\\S]*\\.Append\\s*\\(' },
          { label: 'Print the result', re: 'Console\\.Write(Line)?\\s*\\(\\s*\\w+(\\.ToString\\s*\\(\\s*\\))?\\s*\\)' },
        ],
        hint: 'Append returns the builder, so calls can chain. Shrinking Length by one drops the last comma.',
        explain: 'All the appends write into one buffer, and ToString makes a single string at the end.',
        output: '1,4,9,16,25',
      },
      {
        kind: 'write',
        prompt: 'Stop the report allocating a new string each pass, and size the list up front.',
        starter:
          'string report = "";\nvar lines = new List<string>();\nfor (int day = 1; day <= 3; day++)\n{\n    report += $"Day {day}: ok\\n";\n    lines.Add($"day{day}");\n}\nConsole.Write(report);\nConsole.WriteLine(lines.Count);',
        solution:
          'using System.Text;\n\nvar report = new StringBuilder();\nvar lines = new List<string>(3);\nfor (int day = 1; day <= 3; day++)\n{\n    report.AppendLine($"Day {day}: ok");\n    lines.Add($"day{day}");\n}\nConsole.Write(report);\nConsole.WriteLine(lines.Count);',
        checks: [
          { label: 'No string += in the loop', not: 'report +=' },
          { label: 'Make report a StringBuilder', re: 'report\\s*=\\s*new\\s+StringBuilder\\s*\\(|StringBuilder\\s+report\\s*=\\s*new' },
          { label: 'Append each day inside the loop', re: 'report\\.Append(Line)?\\s*\\(' },
          { label: 'Give the List a capacity of 3', re: 'new\\s+List\\s*<\\s*string\\s*>\\s*\\(\\s*3\\s*\\)|List\\s*<\\s*string\\s*>\\s+lines\\s*=\\s*new\\s*\\(\\s*3\\s*\\)' },
        ],
        hint: 'AppendLine adds the text and a line break. new List<string>(3) reserves three slots.',
        explain: 'Each += copied the whole report into a new string. The builder grows one buffer, and the list never has to regrow.',
        output: 'Day 1: ok\nDay 2: ok\nDay 3: ok\n3',
      },
    ],
    // L5 ref, in & ref returns
    [
      {
        kind: 'write',
        prompt: 'Knock player 2 out by writing through a ref local to their slot.',
        starter: 'int[] lives = [3, 3, 3];\n',
        solution:
          'int[] lives = [3, 3, 3];\nref int p2 = ref lives[1];\np2 = 0;\nConsole.WriteLine(string.Join(" ", lives));',
        checks: [
          { label: 'A ref int local for lives[1]', re: 'ref\\s+int\\s+\\w+\\s*=\\s*ref\\s+lives\\s*\\[\\s*1\\s*\\]' },
          { label: 'Change it through the ref local', re: 'ref\\s+int\\s+(\\w+)\\s*=\\s*ref\\s+lives\\s*\\[\\s*1\\s*\\]\\s*;[\\s\\S]*^\\s*\\1\\s*(=|-=|--|\\+=|\\+\\+)', flags: 'm' },
          { label: 'Print the whole array', re: 'string\\.Join\\s*\\([^;]*lives\\s*\\)' },
        ],
        hint: 'ref int p2 = ref lives[1]; makes p2 another name for that slot.',
        explain: 'A ref local isn’t a copy. Setting p2 writes straight into lives[1].',
        output: '3 0 3',
      },
      {
        kind: 'write',
        prompt: 'Make Largest return a ref so the change hits the array; pass the box with in.',
        starter:
          'int[] stock = [4, 12, 7];\nint most = Largest(stock);\nmost -= 5;\nConsole.WriteLine(string.Join(" ", stock));\nvar box = new Box(2, 3, 4);\nConsole.WriteLine(Volume(box));\n\nint Largest(int[] xs)\n{\n    int best = 0;\n    for (int i = 1; i < xs.Length; i++)\n        if (xs[i] > xs[best]) best = i;\n    return xs[best];\n}\nint Volume(Box b) => b.W * b.H * b.D;\n\nreadonly record struct Box(int W, int H, int D);',
        solution:
          'int[] stock = [4, 12, 7];\nref int most = ref Largest(stock);\nmost -= 5;\nConsole.WriteLine(string.Join(" ", stock));\nvar box = new Box(2, 3, 4);\nConsole.WriteLine(Volume(in box));\n\nref int Largest(int[] xs)\n{\n    int best = 0;\n    for (int i = 1; i < xs.Length; i++)\n        if (xs[i] > xs[best]) best = i;\n    return ref xs[best];\n}\nint Volume(in Box b) => b.W * b.H * b.D;\n\nreadonly record struct Box(int W, int H, int D);',
        checks: [
          { label: 'Declare ref int Largest(...)', re: 'ref\\s+int\\s+Largest\\s*\\(' },
          { label: 'return ref the array slot', re: 'return\\s+ref\\s+\\w+\\s*\\[' },
          { label: 'Catch it in a ref local: ref int most = ref Largest(...)', re: 'ref\\s+int\\s+\\w+\\s*=\\s*ref\\s+Largest\\s*\\(' },
          { label: 'Volume takes in Box', re: 'Volume\\s*\\(\\s*in\\s+Box\\s+\\w+\\s*\\)' },
        ],
        hint: 'ref goes in three places: the return type, the return statement, and both sides of the local.',
        explain: 'Largest now hands back the slot itself, so most -= 5 turns 12 into 7. in passes the box by reference, read-only.',
        output: '4 7 7\n24',
      },
    ],
  ],
};

export default unit;
