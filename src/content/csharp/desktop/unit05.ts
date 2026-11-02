import type { DesktopUnit } from '../../../engine/types';

// Desktop edition: write-the-code challenges for C# unit 5 (Methods).
// lessons[i] runs after lesson i + 1. See docs/CONTENT_GUIDE.md.
const unit: DesktopUnit = {
  lessons: [
    // L1 Your first method
    [
      {
        kind: 'write',
        prompt: 'Write a void method that prints a shop sale banner, and call it twice.',
        starter: '',
        solution: 'PrintBanner();\nPrintBanner();\n\nvoid PrintBanner()\n{\n    Console.WriteLine("*** Big Sale ***");\n}',
        checks: [
          { label: 'Declare a method: void Name()', re: 'void\\s+\\w+\\s*\\(\\s*\\)' },
          { label: 'Print the banner inside its { } body', re: 'void\\s+\\w+\\s*\\(\\s*\\)\\s*(\\{[^}]*Console\\.WriteLine|=>\\s*Console\\.WriteLine)' },
          {
            label: 'Call it twice with Name();',
            re: '^(?=[\\s\\S]*void\\s+(\\w+)\\s*\\(\\s*\\))(?:[\\s\\S]*?\\b\\1\\s*\\(\\s*\\)\\s*;){2}',
          },
        ],
        hint: 'Calls go at the top; the void method goes below them.',
        explain: 'The method’s body runs every time you call it, so two calls print the banner twice.',
        output: '*** Big Sale ***\n*** Big Sale ***',
      },
      {
        kind: 'write',
        prompt: 'Move the repeated divider into a Divider() method and call it instead.',
        starter:
          'Console.WriteLine("Step 1: Stretch");\nConsole.WriteLine("--------");\nConsole.WriteLine("Step 2: Jog");\nConsole.WriteLine("--------");\nConsole.WriteLine("Step 3: Rest");\nConsole.WriteLine("--------");',
        solution:
          'Console.WriteLine("Step 1: Stretch");\nDivider();\nConsole.WriteLine("Step 2: Jog");\nDivider();\nConsole.WriteLine("Step 3: Rest");\nDivider();\n\nvoid Divider()\n{\n    Console.WriteLine("--------");\n}',
        checks: [
          { label: 'A void Divider() method', re: 'void\\s+Divider\\s*\\(\\s*\\)' },
          { label: 'Call Divider(); three times', re: '(Divider\\s*\\(\\s*\\)\\s*;[\\s\\S]*){3}' },
          { label: 'The dashes are written only once, in the method', re: '^(?![\\s\\S]*"-+"[\\s\\S]*"-+")' },
        ],
        hint: 'Write the dashes line once inside void Divider() { }, then swap each copy for Divider();',
        explain: 'Now the divider lives in one place: change the method and every call changes with it.',
        output: 'Step 1: Stretch\n--------\nStep 2: Jog\n--------\nStep 3: Rest\n--------',
      },
    ],
    // L2 Passing parameters
    [
      {
        kind: 'write',
        prompt: 'Write a method that prints a wedding name badge with a table number.',
        starter: '',
        solution:
          'Badge("Ana", 4);\nBadge("Raj", 7);\n\nvoid Badge(string name, int table)\n{\n    Console.WriteLine($"{name} - table {table}");\n}',
        checks: [
          { label: 'Two parameters: a string and an int', re: 'void\\s+\\w+\\s*\\(\\s*string\\s+\\w+\\s*,\\s*int\\s+\\w+\\s*\\)' },
          { label: 'Print using both parameters', re: 'Console\\.WriteLine\\s*\\([^;]*\\{\\s*\\w+\\s*\\}[^;]*\\{\\s*\\w+\\s*\\}|Console\\.WriteLine\\s*\\([^;]*\\w\\s*\\+[^;]*\\+\\s*\\w' },
          { label: 'Call it twice with a name and a number', re: '(\\w+\\s*\\(\\s*"[^"]*"\\s*,\\s*\\d+\\s*\\)\\s*;[\\s\\S]*){2}' },
        ],
        hint: 'void Badge(string name, int table) { ... } and call Badge("Ana", 4);',
        explain: 'Each call passes its own arguments, in the same order as the parameters.',
        output: 'Ana - table 4\nRaj - table 7',
      },
      {
        kind: 'write',
        prompt: 'Fix the call, then make Water print one line per cup.',
        starter: 'Water(3, "Fern");\n\nvoid Water(string plant, int cups)\n{\n    // print "Cup 1 for Fern" and so on\n}',
        solution:
          'Water("Fern", 3);\nWater("Cactus", 1);\n\nvoid Water(string plant, int cups)\n{\n    for (int i = 1; i <= cups; i++)\n    {\n        Console.WriteLine($"Cup {i} for {plant}");\n    }\n}',
        checks: [
          { label: 'Arguments in order: Water("Fern", 3)', re: 'Water\\s*\\(\\s*"Fern"\\s*,\\s*3\\s*\\)\\s*;' },
          { label: 'No call with the number first', not: 'Water(3,' },
          { label: 'A loop that runs cups times', re: '(for|while)\\s*\\([^)]*\\bcups\\b' },
          { label: 'Print the plant name inside the loop', re: 'Console\\.WriteLine\\s*\\([^;]*\\bplant\\b' },
          { label: 'Water a second plant too', re: '(Water\\s*\\(\\s*"[^"]*"\\s*,\\s*\\d+\\s*\\)\\s*;[\\s\\S]*){2}' },
        ],
        hint: 'Arguments must match the parameter order: string first, then int.',
        explain: 'C# matches arguments to parameters by position, so (3, "Fern") won’t compile. The loop uses cups as its limit.',
        output: 'Cup 1 for Fern\nCup 2 for Fern\nCup 3 for Fern\nCup 1 for Cactus',
      },
    ],
    // L3 Return values
    [
      {
        kind: 'write',
        prompt: 'Write a method that returns a garden bed’s area, and print one.',
        starter: '',
        solution: 'Console.WriteLine(Area(4, 5));\n\nint Area(int width, int length)\n{\n    return width * length;\n}',
        checks: [
          { label: 'An int method with two int parameters', re: 'int\\s+\\w+\\s*\\(\\s*int\\s+\\w+\\s*,\\s*int\\s+\\w+\\s*\\)' },
          { label: 'return the two multiplied', re: 'return\\s+\\w+\\s*\\*\\s*\\w+\\s*;|=>\\s*\\w+\\s*\\*\\s*\\w+\\s*;' },
          { label: 'Print the result of a call', re: 'Console\\.WriteLine\\s*\\([^;]*\\w+\\s*\\(\\s*\\d+\\s*,\\s*\\d+\\s*\\)' },
        ],
        hint: 'Swap void for int and end the body with return ...;',
        explain: 'The call Area(4, 5) is replaced by the returned value, 20, which WriteLine prints.',
        output: '20',
      },
      {
        kind: 'write',
        prompt: 'Price the fruit with => methods and add the results together.',
        starter: 'int apples = 3;\nint pears = 2;\n// apples cost 4 each, pears 5 each\n',
        solution:
          'int apples = 3;\nint pears = 2;\n// apples cost 4 each, pears 5 each\nint total = Cost(apples, 4) + Cost(pears, 5);\nConsole.WriteLine($"Total: {total}");\nConsole.WriteLine(IsBig(total));\n\nint Cost(int count, int price) => count * price;\nbool IsBig(int amount) => amount > 20;',
        checks: [
          { label: 'An int Cost(count, price) method with =>', re: 'int\\s+\\w+\\s*\\(\\s*int\\s+\\w+\\s*,\\s*int\\s+\\w+\\s*\\)\\s*=>' },
          { label: 'Add two calls together', re: '\\w+\\s*\\([^()]*\\)\\s*\\+\\s*\\w+\\s*\\([^()]*\\)' },
          { label: 'A bool method with => (true if over 20)', re: 'bool\\s+\\w+\\s*\\(\\s*int\\s+\\w+\\s*\\)\\s*=>' },
          { label: 'Print the total and the bool', re: '(Console\\.WriteLine[\\s\\S]*){2}' },
        ],
        hint: 'int Cost(int count, int price) => count * price;',
        explain: '3 × 4 + 2 × 5 is 22, and 22 > 20, so the bool method returns True.',
        output: 'Total: 22\nTrue',
      },
    ],
    // L4 Optional & named args
    [
      {
        kind: 'write',
        prompt: 'Write a Brew method with a default of 1 sugar; call it with and without.',
        starter: '',
        solution:
          'Brew("Tea");\nBrew("Coffee", 2);\n\nvoid Brew(string drink, int sugars = 1)\n{\n    Console.WriteLine($"{drink} with {sugars} sugar(s)");\n}',
        checks: [
          { label: 'A last parameter with a default: int sugars = 1', re: 'void\\s+\\w+\\s*\\(\\s*string\\s+\\w+\\s*,\\s*int\\s+\\w+\\s*=\\s*1\\s*\\)' },
          { label: 'A call that leaves the sugars out', re: '\\w+\\s*\\(\\s*"[^"]*"\\s*\\)\\s*;' },
          { label: 'A call that passes the sugars', re: '\\w+\\s*\\(\\s*"[^"]*"\\s*,\\s*\\d+\\s*\\)\\s*;' },
        ],
        hint: 'Write = 1 after the parameter name to give it a default.',
        explain: 'Leave the argument out and the default is used; pass one and it replaces the default.',
        output: 'Tea with 1 sugar(s)\nCoffee with 2 sugar(s)',
      },
      {
        kind: 'write',
        prompt: 'Book Paris with breakfast and Oslo for 3 nights, using named arguments.',
        starter:
          'Book("Rome");\n\nvoid Book(string city, int nights = 1, bool breakfast = false)\n{\n    Console.WriteLine($"{city}: {nights} night(s), breakfast {breakfast}");\n}',
        solution:
          'Book("Rome");\nBook("Paris", breakfast: true);\nBook("Oslo", nights: 3);\n\nvoid Book(string city, int nights = 1, bool breakfast = false)\n{\n    Console.WriteLine($"{city}: {nights} night(s), breakfast {breakfast}");\n}',
        checks: [
          { label: 'Paris with breakfast: true, skipping nights', re: 'Book\\s*\\(\\s*"Paris"\\s*,\\s*breakfast\\s*:\\s*true\\s*\\)\\s*;' },
          { label: 'Oslo with nights: 3', re: 'Book\\s*\\(\\s*"Oslo"\\s*,\\s*nights\\s*:\\s*3\\s*(,\\s*breakfast\\s*:\\s*false\\s*)?\\)\\s*;' },
          { label: 'Keep the method as it is', has: 'void Book(string city, int nights = 1, bool breakfast = false)' },
        ],
        hint: 'Name the parameter, a colon, then the value: breakfast: true.',
        explain: 'A named argument lets you skip nights and still set breakfast; the skipped one keeps its default of 1.',
        output: 'Rome: 1 night(s), breakfast False\nParis: 1 night(s), breakfast True\nOslo: 3 night(s), breakfast False',
      },
    ],
    // L5 out & ref
    [
      {
        kind: 'write',
        prompt: 'TryParse the step count "250" and print it plus 50, or Bad input.',
        starter: '',
        solution:
          'string text = "250";\nif (int.TryParse(text, out int steps))\n{\n    Console.WriteLine(steps + 50);\n}\nelse\n{\n    Console.WriteLine("Bad input");\n}',
        checks: [
          { label: 'int.TryParse with out int', re: 'int\\.TryParse\\s*\\(\\s*[^,]+,\\s*out\\s+(int|var)\\s+\\w+\\s*\\)' },
          { label: 'Use TryParse as the if condition', re: 'if\\s*\\(\\s*!?\\s*int\\.TryParse' },
          { label: 'Print the number + 50', re: 'WriteLine\\s*\\([^;]*\\+\\s*50|WriteLine\\s*\\([^;]*50\\s*\\+' },
          { label: 'Print Bad input in the else', re: 'else\\s*\\{?\\s*Console\\.WriteLine\\s*\\(\\s*"Bad input"' },
        ],
        hint: 'if (int.TryParse(text, out int steps)) { ... } else { ... }',
        explain: 'TryParse returns true and fills steps with 250, so 300 prints. A bad string would go to else instead of crashing.',
        output: '300',
      },
      {
        kind: 'write',
        prompt: 'Make Fill top the tank up to 100 with ref, and report the litres with out.',
        starter: 'int fuel = 40;\nFill(fuel);\nConsole.WriteLine(fuel);\n\nvoid Fill(int tank)\n{\n    tank = 100;\n}',
        solution:
          'int fuel = 40;\nFill(ref fuel, out int added);\nConsole.WriteLine(fuel);\nConsole.WriteLine(added);\n\nvoid Fill(ref int tank, out int litres)\n{\n    litres = 100 - tank;\n    tank = 100;\n}',
        checks: [
          { label: 'Fill takes ref int and out int', re: 'void\\s+Fill\\s*\\(\\s*ref\\s+int\\s+\\w+\\s*,\\s*out\\s+int\\s+\\w+\\s*\\)' },
          { label: 'Work out the litres before filling the tank', re: '=\\s*100\\s*-\\s*\\w+\\s*;[\\s\\S]*\\w+\\s*=\\s*100\\s*;' },
          { label: 'Call it with ref and out', re: 'Fill\\s*\\(\\s*ref\\s+fuel\\s*,\\s*out\\s+(int|var)\\s+\\w+\\s*\\)\\s*;' },
          { label: 'Print the litres added', re: 'Console\\.WriteLine\\s*\\(\\s*(?!fuel\\b)\\w+\\s*\\)' },
        ],
        hint: 'Write ref and out in both the method header and the call.',
        explain: 'ref lets Fill change fuel itself, and the out parameter hands back 60 as a second result.',
        output: '100\n60',
      },
    ],
  ],
};

export default unit;
