import type { DesktopUnit } from '../../../engine/types';

// Desktop edition: write-the-code challenges for C# unit 15 (Records, patterns & advanced C#).
// lessons[i] runs after lesson i + 1. See docs/CONTENT_GUIDE.md.
const unit: DesktopUnit = {
  lessons: [
    // L1 Declaring enums
    [
      {
        kind: 'write',
        prompt: 'Price a coffee by cup size with an enum and a switch expression.',
        starter: '',
        solution:
          'Size cup = Size.Large;\nint price = cup switch\n{\n    Size.Small => 2,\n    Size.Medium => 3,\n    Size.Large => 4,\n    _ => 0\n};\nConsole.WriteLine($"{cup} coffee: {price} dollars");\nConsole.WriteLine((int)cup);\n\nenum Size { Small, Medium, Large }',
        checks: [
          { label: 'An enum with three sizes, at the end of the file', re: 'enum\\s+\\w+\\s*\\{\\s*\\w+\\s*,\\s*\\w+\\s*,\\s*\\w+\\s*,?\\s*\\}\\s*$' },
          { label: 'A switch expression with an arm per size', re: 'switch\\s*\\{(\\s*\\w+\\.\\w+\\s*=>\\s*\\d+\\s*,?){3}' },
          { label: 'Print the size and its price', re: 'Console\\.WriteLine\\s*\\(\\s*\\$"[^"]*\\{\\s*\\w+\\s*\\}[^"]*\\{\\s*\\w+\\s*\\}' },
          { label: 'Print its number with (int)', re: '\\(\\s*int\\s*\\)\\s*\\w+' },
        ],
        hint: 'Arms look like Size.Small => 2,. The enum goes after all the top-level code.',
        explain: 'Printing an enum shows its name; casting to int shows its position, counting from 0, so Large is 2.',
        output: 'Large coffee: 4 dollars\n2',
      },
      {
        kind: 'write',
        prompt: 'Parse each drink order into the Drink enum, print its number and count teas.',
        starter: 'string[] orders = ["Tea", "Coffee", "Tea", "Juice"];\n\nenum Drink { Tea, Coffee, Juice }',
        solution:
          'string[] orders = ["Tea", "Coffee", "Tea", "Juice"];\nint teas = 0;\nforeach (string text in orders)\n{\n    Drink d = Enum.Parse<Drink>(text);\n    Console.WriteLine($"{d} = {(int)d}");\n    if (d == Drink.Tea) teas++;\n}\nConsole.WriteLine($"Teas: {teas}");\n\nenum Drink { Tea, Coffee, Juice }',
        checks: [
          { label: 'Loop over the orders', re: 'foreach\\s*\\(\\s*(string|var)\\s+\\w+\\s+in\\s+orders\\s*\\)' },
          { label: 'Turn text into a Drink with Enum.Parse<Drink>', re: 'Enum\\.Parse\\s*<\\s*Drink\\s*>\\s*\\(' },
          { label: 'Print the number with (int)', re: '\\(\\s*int\\s*\\)\\s*\\w+' },
          { label: 'Count the teas by comparing with Drink.Tea', re: '==\\s*Drink\\.Tea|Drink\\.Tea\\s*==' },
        ],
        hint: 'Enum.Parse<Drink>(text) gives a Drink; compare it with Drink.Tea, not with the string.',
        explain: 'Once parsed, the order is a real Drink value, so the compiler checks every comparison. Tea is 0, Coffee 1 and Juice 2.',
        output: 'Tea = 0\nCoffee = 1\nTea = 0\nJuice = 2\nTeas: 2',
      },
    ],
    // L2 Records & with
    [
      {
        kind: 'write',
        prompt: 'Declare a Book record, make a shorter edition with with, and compare.',
        starter: '',
        solution:
          'var book = new Book("Dune", 412);\nvar shortEd = book with { Pages = 200 };\nConsole.WriteLine(book);\nConsole.WriteLine(shortEd);\nConsole.WriteLine(book == new Book("Dune", 412));\n\nrecord Book(string Title, int Pages);',
        checks: [
          { label: 'record Book(string Title, int Pages); at the end', re: 'record\\s+Book\\s*\\(\\s*string\\s+Title\\s*,\\s*int\\s+Pages\\s*\\)\\s*;\\s*$' },
          { label: 'Copy it with with { Pages = ... }', re: '\\bwith\\s*\\{\\s*Pages\\s*=\\s*\\d+\\s*\\}' },
          { label: 'Print a record', re: 'Console\\.WriteLine\\s*\\(\\s*\\w+\\s*\\)' },
          { label: 'Compare with == against a new Book', re: '==\\s*new\\s+Book\\s*\\(' },
        ],
        hint: 'A positional record is one line: record Book(string Title, int Pages);',
        explain: 'Records print their values and compare by value, so a new Book with the same title and pages is ==.',
        output: 'Book { Title = Dune, Pages = 412 }\nBook { Title = Dune, Pages = 200 }\nTrue',
      },
      {
        kind: 'write',
        prompt: 'This won’t compile. Make a changed copy of the order instead.',
        starter: 'var order = new Order("Pizza", 1);\norder.Qty = 3;\nConsole.WriteLine(order);\n\nrecord Order(string Dish, int Qty);',
        solution:
          'var order = new Order("Pizza", 1);\nvar bigger = order with { Qty = 3 };\nConsole.WriteLine(order);\nConsole.WriteLine(bigger);\nConsole.WriteLine(order == bigger);\n\nrecord Order(string Dish, int Qty);',
        checks: [
          { label: 'Don’t assign to order.Qty', not: 'order.Qty =' },
          { label: 'Make the copy with order with { Qty = 3 }', re: 'order\\s+with\\s*\\{\\s*Qty\\s*=\\s*3\\s*\\}' },
          { label: 'Print the original and the copy', re: '(Console\\.WriteLine\\s*\\(\\s*\\w+\\s*\\)\\s*;[\\s\\S]*){2}' },
          { label: 'Print whether they are equal with ==', re: 'Console\\.WriteLine\\s*\\(\\s*\\w+\\s*==\\s*\\w+\\s*\\)' },
        ],
        hint: 'Positional record properties are init-only. with copies the record and changes just Qty.',
        explain: 'with leaves the original alone, so you get two orders. Their Qty differs, so == is False.',
        output: 'Order { Dish = Pizza, Qty = 1 }\nOrder { Dish = Pizza, Qty = 3 }\nFalse',
      },
    ],
    // L3 Tuples & deconstruction
    [
      {
        kind: 'write',
        prompt: 'Return the lowest and highest temperature as a tuple, then unpack it.',
        starter: 'int[] temps = [12, 4, 19, 7];\n',
        solution:
          'int[] temps = [12, 4, 19, 7];\nvar (low, high) = Range(temps);\nConsole.WriteLine($"Low {low}, high {high}");\n\n(int Min, int Max) Range(int[] xs) => (xs.Min(), xs.Max());',
        checks: [
          { label: 'A method returning (int Min, int Max)', re: '\\(\\s*int\\s+\\w+\\s*,\\s*int\\s+\\w+\\s*\\)\\s+\\w+\\s*\\(\\s*int\\s*\\[\\s*\\]\\s*\\w+\\s*\\)' },
          { label: 'Return both values in brackets', re: '(=>|return)\\s*\\(\\s*[^,;]+,\\s*[^;]+\\)\\s*;' },
          { label: 'Unpack it into two variables', re: '(var\\s*\\(\\s*\\w+\\s*,\\s*\\w+\\s*\\)|\\(\\s*int\\s+\\w+\\s*,\\s*int\\s+\\w+\\s*\\))\\s*=\\s*\\w+\\s*\\(' },
          { label: 'Print both', re: 'Console\\.WriteLine\\s*\\(' },
        ],
        hint: 'The return type goes in brackets: (int Min, int Max). Unpack with var (low, high) = ...;',
        explain: 'A tuple returns two values without a new type, and deconstruction gives each one its own variable.',
        output: 'Low 4, high 19',
      },
      {
        kind: 'write',
        prompt: 'Print the top scorer from the tuples, then unpack the match record.',
        starter:
          'List<(string Name, int Goals)> scorers = [("Kai", 3), ("Lu", 5), ("Max", 2)];\nvar match = new Match("Reds", "Blues");\n\nrecord Match(string Home, string Away);',
        solution:
          'List<(string Name, int Goals)> scorers = [("Kai", 3), ("Lu", 5), ("Max", 2)];\nvar match = new Match("Reds", "Blues");\nvar top = scorers.MaxBy(s => s.Goals);\nConsole.WriteLine($"{top.Name} leads with {top.Goals}");\nvar (home, away) = match;\nConsole.WriteLine($"{home} vs {away}");\n\nrecord Match(string Home, string Away);',
        checks: [
          { label: 'Find the top scorer by Goals', re: '(MaxBy|OrderByDescending)\\s*\\(\\s*(\\w+)\\s*=>\\s*\\2\\.Goals\\s*\\)' },
          { label: 'Print their Name and Goals', re: '\\w+\\.Name[\\s\\S]*\\w+\\.Goals\\s*\\}' },
          { label: 'Unpack match into two variables', re: 'var\\s*\\(\\s*\\w+\\s*,\\s*\\w+\\s*\\)\\s*=\\s*match\\s*;' },
          { label: 'Print the two team names', re: 'Console\\.WriteLine\\s*\\(\\s*\\$"\\{\\s*\\w+\\s*\\}[^"]*\\{\\s*\\w+\\s*\\}"' },
        ],
        hint: 'Tuple elements have names, so s.Goals works. A positional record unpacks like a tuple.',
        explain: 'Named tuple elements read like properties, and positional records deconstruct in their declared order.',
        output: 'Lu leads with 5\nReds vs Blues',
      },
    ],
    // L4 Property patterns
    [
      {
        kind: 'write',
        prompt: 'Send heavy, non-fragile parcels by freight using a property pattern.',
        starter: 'var box = new Parcel(25, false);\n\nrecord Parcel(int Weight, bool Fragile);',
        solution:
          'var box = new Parcel(25, false);\nif (box is { Weight: > 20, Fragile: false })\n    Console.WriteLine("Send by freight");\nelse\n    Console.WriteLine("Send by post");\n\nrecord Parcel(int Weight, bool Fragile);',
        checks: [
          { label: 'Test box is { ... } with a property pattern', re: 'box\\s+is\\s*\\{' },
          { label: 'Weight: > 20 inside the braces', re: 'is\\s*\\{[^}]*Weight\\s*:\\s*>=?\\s*2[01]\\b' },
          { label: 'Fragile: false inside the braces', re: 'is\\s*\\{[^}]*Fragile\\s*:\\s*false' },
          { label: 'An else for everything else', re: '\\belse\\b' },
        ],
        hint: 'One pattern can test both: box is { Weight: > 20, Fragile: false }.',
        explain: 'A property pattern matches only when every property inside the braces matches.',
        output: 'Send by freight',
      },
      {
        kind: 'write',
        prompt: 'Price each guest’s ticket with a switch on their properties.',
        starter:
          'Guest[] guests = [new(70, new Card("Basic")), new(30, new Card("Gold")), new(30, new Card("Basic"))];\n// Gold members free, 65+ half price, everyone else full price\n\nrecord Card(string Tier);\nrecord Guest(int Age, Card Member);',
        solution:
          'Guest[] guests = [new(70, new Card("Basic")), new(30, new Card("Gold")), new(30, new Card("Basic"))];\nforeach (var g in guests)\n{\n    string price = g switch\n    {\n        { Member.Tier: "Gold" } => "Free",\n        { Age: >= 65 } => "Half price",\n        _ => "Full price"\n    };\n    Console.WriteLine(price);\n}\n\nrecord Card(string Tier);\nrecord Guest(int Age, Card Member);',
        checks: [
          { label: 'Loop over the guests with a switch expression', re: 'foreach[\\s\\S]*\\w+\\s+switch\\s*\\{' },
          { label: 'Match Gold members with { Member.Tier: "Gold" }', re: 'Member\\.Tier\\s*:\\s*"Gold"|Member\\s*:\\s*\\{\\s*Tier\\s*:\\s*"Gold"' },
          { label: 'Match 65 and over with { Age: >= 65 }', re: '\\{\\s*Age\\s*:\\s*(>=\\s*65|>\\s*64)\\s*\\}' },
          { label: 'Gold is checked before age', re: '"Gold"[\\s\\S]*Age\\s*:' },
          { label: 'A _ arm for full price', re: '_\\s*=>' },
        ],
        hint: 'A dot reaches into the nested record: { Member.Tier: "Gold" }. Arms are tried top to bottom.',
        explain: 'The first matching arm wins, so a Gold member of any age goes free and only the others are checked for age.',
        output: 'Half price\nFree\nFull price',
      },
    ],
    // L5 Extension members
    [
      {
        kind: 'write',
        prompt: 'Add a WordCount() extension method to string and use it on a review.',
        starter: 'string review = "Great food and friendly staff";\n',
        solution:
          'string review = "Great food and friendly staff";\nConsole.WriteLine(review.WordCount());\n\nstatic class TextTools\n{\n    public static int WordCount(this string s) => s.Split(\' \').Length;\n}',
        checks: [
          { label: 'A static class', re: 'static\\s+class\\s+\\w+' },
          { label: 'public static int WordCount(this string s)', re: 'public\\s+static\\s+int\\s+WordCount\\s*\\(\\s*this\\s+string\\s+\\w+\\s*\\)' },
          { label: 'Count by splitting on spaces', re: '\\.Split\\s*\\(' },
          { label: 'Call it like review.WordCount()', re: 'review\\s*\\.\\s*WordCount\\s*\\(\\s*\\)' },
        ],
        hint: 'this before the first parameter is what makes it an extension method.',
        explain: 'The compiler turns review.WordCount() into TextTools.WordCount(review). Five words, so it prints 5.',
        output: '5',
      },
      {
        kind: 'write',
        prompt: 'Move Stars into a C# 14 extension block and add an IsEven property.',
        starter:
          'int[] ratings = [3, 4, 5];\nforeach (int r in ratings)\n    Console.WriteLine(r.Stars());\n\nstatic class NumberExt\n{\n    public static string Stars(this int n) => new string(\'*\', n);\n}',
        solution:
          'int[] ratings = [3, 4, 5];\nforeach (int r in ratings)\n    Console.WriteLine($"{r.Stars()} {(r.IsEven ? "even" : "odd")}");\n\nstatic class NumberExt\n{\n    extension(int n)\n    {\n        public bool IsEven => n % 2 == 0;\n        public string Stars() => new string(\'*\', n);\n    }\n}',
        checks: [
          { label: 'An extension(int n) block in the static class', re: 'extension\\s*\\(\\s*int\\s+\\w+\\s*\\)\\s*\\{' },
          { label: 'A public bool IsEven property inside it', re: 'extension[\\s\\S]*public\\s+bool\\s+IsEven\\s*(=>|\\{)' },
          { label: 'Stars() moved inside the block', re: 'extension[\\s\\S]*public\\s+string\\s+Stars\\s*\\(\\s*\\)' },
          { label: 'No this parameter left', not: 'this int' },
          { label: 'Use IsEven when printing', re: '\\w+\\.IsEven\\b' },
        ],
        hint: 'Inside extension(int n) { }, members drop static and this, and use n directly. A property has no brackets.',
        explain: 'An extension block names the receiver once, and can add properties, which classic extension methods can’t.',
        output: '*** odd\n**** even\n***** odd',
      },
    ],
  ],
};

export default unit;
