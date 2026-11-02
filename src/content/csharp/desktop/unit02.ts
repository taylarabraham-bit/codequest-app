import type { DesktopUnit } from '../../../engine/types';

// Desktop edition: write-the-code challenges for C# unit 2 (Types & operators).
// lessons[i] runs after lesson i + 1. See docs/CONTENT_GUIDE.md.
const unit: DesktopUnit = {
  lessons: [
    // L1 The core types
    [
      {
        kind: 'write',
        prompt: 'Describe a hotel room with an int, a double, a bool and a char.',
        starter: '',
        solution:
          'int floor = 3;\ndouble size = 24.5;\nbool hasView = true;\nchar wing = \'B\';\nConsole.WriteLine($"Floor {floor}, {size} m2, view: {hasView}, wing {wing}");',
        checks: [
          { label: 'An int for the floor', re: 'int\\s+\\w+\\s*=\\s*-?\\d+\\s*;' },
          { label: 'A double for the size', re: 'double\\s+\\w+\\s*=\\s*-?\\d+(\\.\\d+)?\\s*;' },
          { label: 'A bool set to true or false', re: 'bool\\s+\\w+\\s*=\\s*(true|false)\\s*;' },
          { label: 'A char in single quotes', re: 'char\\s+\\w+\\s*=\\s*\'[^\']\'\\s*;' },
          { label: 'Print them with Console.WriteLine', re: 'Console\\.WriteLine\\s*\\(' },
        ],
        hint: 'bool is true or false (lower case); a char is one character in \'single quotes\'.',
        explain: 'Each type fits one kind of value. A bool prints as True or False.',
        output: 'Floor 3, 24.5 m2, view: True, wing B',
      },
      {
        kind: 'write',
        prompt: 'Fix the cinema bill so it compiles and prints the total and the row.',
        starter:
          'decimal ticket = 12.50;\ndecimal snack = 4.25m;\nchar row = "F";\nConsole.WriteLine(ticket + snack);\nConsole.WriteLine(row);',
        solution:
          'decimal ticket = 12.50m;\ndecimal snack = 4.25m;\nchar row = \'F\';\nConsole.WriteLine(ticket + snack);\nConsole.WriteLine(row);',
        checks: [
          { label: 'Give the ticket price its m suffix', re: 'ticket\\s*=\\s*\\d+(\\.\\d+)?[mM]\\s*;' },
          { label: 'The row is a char in single quotes', re: 'row\\s*=\\s*\'F\'\\s*;' },
          { label: 'No "F" string for a char', not: 'row = "F"' },
        ],
        hint: 'A decimal literal ends in m. A char uses single quotes, not double.',
        explain: '12.50 on its own is a double, which won’t go into a decimal. "F" is a string; \'F\' is a char.',
        output: '16.75\nF',
      },
    ],
    // L2 Doing the maths
    [
      {
        kind: 'write',
        prompt: 'Share 17 sweets among 5 kids: print each share, then the leftover.',
        starter: '',
        solution: 'int sweets = 17;\nint kids = 5;\nConsole.WriteLine(sweets / kids);\nConsole.WriteLine(sweets % kids);',
        checks: [
          { label: 'Store 17 and 5 in int variables', re: '(?=[\\s\\S]*int\\s+\\w+\\s*=\\s*17\\s*;)(?=[\\s\\S]*int\\s+\\w+\\s*=\\s*5\\s*;)' },
          { label: 'Each share: divide with /', re: 'WriteLine\\s*\\(\\s*\\w+\\s*/\\s*\\w+\\s*\\)' },
          { label: 'The leftover: remainder with %', re: 'WriteLine\\s*\\(\\s*\\w+\\s*%\\s*\\w+\\s*\\)' },
        ],
        hint: 'int / int drops the remainder, and % gives you just the remainder.',
        explain: '17 / 5 is 3 because whole-number division throws away the rest; 17 % 5 is the 2 that’s left.',
        output: '3\n2',
      },
      {
        kind: 'write',
        prompt: 'Fix the bill split: add the tip first, and keep the cents.',
        starter: 'int bill = 40;\nint tip = 5;\nint people = 4;\nConsole.WriteLine(bill + tip / people);',
        solution: 'int bill = 40;\nint tip = 5;\ndouble people = 4;\nConsole.WriteLine((bill + tip) / people);',
        checks: [
          { label: 'Brackets so bill + tip adds first', re: '\\(\\s*(bill\\s*\\+\\s*tip|tip\\s*\\+\\s*bill)\\s*\\)' },
          { label: 'Avoid whole-number division (bring in a double)', re: 'double\\s+\\w+|\\d\\.\\d|\\(double\\)|\\d[dD]\\b' },
          { label: 'Remove the buggy bill + tip / people', not: 'bill + tip / people' },
        ],
        hint: '/ happens before +. And when both sides are int, the decimals are lost.',
        explain: 'Brackets force the addition first, and one double in the division keeps the .25: 45 / 4.0 is 11.25.',
        output: '11.25',
      },
    ],
    // L3 Updating values
    [
      {
        kind: 'write',
        prompt: 'Piggy bank: start at 20, add 15, spend 5, then double it.',
        starter: '',
        solution: 'int bank = 20;\nbank += 15;\nbank -= 5;\nbank *= 2;\nConsole.WriteLine(bank);',
        checks: [
          { label: 'Start at 20', re: '(int|var)\\s+\\w+\\s*=\\s*20\\s*;' },
          { label: 'Add 15 with +=', re: '\\w+\\s*\\+=\\s*15\\s*;' },
          { label: 'Spend 5 with -=', re: '\\w+\\s*-=\\s*5\\s*;' },
          { label: 'Double it with *=', re: '\\w+\\s*\\*=\\s*2\\s*;' },
          { label: 'Print the result', re: 'Console\\.WriteLine\\s*\\(\\s*\\w+\\s*\\)' },
        ],
        hint: 'x += 15 is short for x = x + 15. -= and *= work the same way.',
        explain: '20 + 15 is 35, minus 5 is 30, doubled is 60. Each compound operator updates the variable in place.',
        output: '60',
      },
      {
        kind: 'write',
        prompt: 'Count lift riders with ++ and --, then compare riders++ with riders.',
        starter: 'int riders = 0;\n// 3 people get in, 1 gets out\n',
        solution:
          'int riders = 0;\n// 3 people get in, 1 gets out\nriders++;\nriders++;\nriders++;\nriders--;\nConsole.WriteLine(riders++);\nConsole.WriteLine(riders);',
        checks: [
          { label: 'Three riders get in with ++', re: '((riders\\s*\\+\\+|\\+\\+\\s*riders)\\s*;[\\s\\S]*){3}' },
          { label: 'One gets out with --', re: '(riders\\s*--|--\\s*riders)\\s*;' },
          { label: 'Print riders++ (shows the old value)', re: 'WriteLine\\s*\\(\\s*riders\\s*\\+\\+\\s*\\)' },
          { label: 'Then print riders (the new value)', re: 'WriteLine\\s*\\(\\s*riders\\s*\\+\\+\\s*\\)\\s*;\\s*Console\\.WriteLine\\s*\\(\\s*riders\\s*\\)' },
        ],
        hint: 'riders++ on its own line adds one. Inside WriteLine it prints first, then adds.',
        explain: 'After 3 in and 1 out there are 2. riders++ prints 2 and then bumps it to 3, which the next line shows.',
        output: '2\n3',
      },
    ],
    // L4 Converting types
    [
      {
        kind: 'write',
        prompt: 'Turn the text "12" into an int, add 3 boxes, and print it.',
        starter: '',
        solution: 'string text = "12";\nint boxes = int.Parse(text);\nboxes += 3;\nConsole.WriteLine(boxes);',
        checks: [
          { label: 'A string holding "12"', re: '(string|var)\\s+\\w+\\s*=\\s*"12"\\s*;' },
          { label: 'Convert it with int.Parse or Convert.ToInt32', re: 'int\\.Parse\\s*\\(|Convert\\.ToInt32\\s*\\(' },
          { label: 'Add 3', re: '\\+=?\\s*3\\b' },
          { label: 'Print the number', re: 'Console\\.WriteLine\\s*\\(' },
        ],
        hint: 'int.Parse(text) hands back the number inside the text.',
        explain: 'Without parsing, "12" + 3 would join text and print 123. Parsed, it’s real maths: 15.',
        output: '15',
      },
      {
        kind: 'write',
        prompt: 'Fix the race timer with casts: whole seconds, and an exact average.',
        starter:
          'double lap = 59.8;\nint shown = lap;\nint total = 7;\nint runs = 2;\nConsole.WriteLine(shown);\nConsole.WriteLine(total / runs);',
        solution:
          'double lap = 59.8;\nint shown = (int)lap;\nint total = 7;\nint runs = 2;\nConsole.WriteLine(shown);\nConsole.WriteLine((double)total / runs);',
        checks: [
          { label: 'Cast the lap with (int)', re: '=\\s*\\(int\\)\\s*lap\\s*;' },
          { label: 'Cast to (double) before dividing', re: '\\(double\\)\\s*\\w+\\s*/\\s*\\w+' },
          { label: 'Remove the uncast int shown = lap;', not: 'int shown = lap;' },
        ],
        hint: 'A double won’t go into an int by itself. Put the target type in brackets in front.',
        explain: '(int) chops 59.8 down to 59. Casting total to double first makes 7 / 2 give 3.5.',
        output: '59\n3.5',
      },
    ],
    // L5 Comparisons & const
    [
      {
        kind: 'write',
        prompt: 'Check whether a 23 kg parcel goes over a const 20 kg limit.',
        starter: '',
        solution: 'const int MaxKg = 20;\nint weight = 23;\nbool tooHeavy = weight > MaxKg;\nConsole.WriteLine(tooHeavy);',
        checks: [
          { label: 'A const int for the limit', re: 'const\\s+int\\s+\\w+\\s*=\\s*20\\s*;' },
          { label: 'A bool from a comparison', re: 'bool\\s+\\w+\\s*=\\s*[^;]*(>|<)' },
          { label: 'Print the bool', re: 'Console\\.WriteLine\\s*\\(' },
        ],
        hint: 'const goes before the type. A comparison like a > b is already a bool.',
        explain: 'weight > MaxKg works out to true, which prints as True. A const can never be changed later.',
        output: 'True',
      },
      {
        kind: 'write',
        prompt: 'Can the kid ride? Print the answer, then its opposite with !.',
        starter: 'int age = 9;\nint height = 135;\nbool withAdult = true;\n',
        solution:
          'int age = 9;\nint height = 135;\nbool withAdult = true;\nconst int MinAge = 10;\nconst int MinHeight = 130;\nbool canRide = (age >= MinAge && height >= MinHeight) || withAdult;\nConsole.WriteLine(canRide);\nConsole.WriteLine(!canRide);',
        checks: [
          { label: 'Two const limits (age 10, height 130)', re: '(const\\s+int\\s+\\w+\\s*=\\s*\\d+\\s*;[\\s\\S]*){2}' },
          { label: 'Old and tall enough with &&', has: '&&' },
          { label: 'Or with an adult, using ||', re: '\\|\\|\\s*withAdult|withAdult\\s*\\|\\|' },
          { label: 'Print the result, then its opposite with !', re: 'WriteLine\\s*\\(\\s*!\\s*\\w+\\s*\\)' },
        ],
        hint: '(a && b) || c is true when both a and b are, or when c is.',
        explain: 'Age 9 fails the age test, but withAdult is true, so || makes the whole thing True. ! flips it to False.',
        output: 'True\nFalse',
      },
    ],
  ],
};

export default unit;
