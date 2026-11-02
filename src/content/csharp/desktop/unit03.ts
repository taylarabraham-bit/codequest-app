import type { DesktopUnit } from '../../../engine/types';

// Desktop edition: write-the-code challenges for C# unit 3 (Conditionals).
// lessons[i] runs after lesson i + 1. See docs/CONTENT_GUIDE.md.
const unit: DesktopUnit = {
  lessons: [
    // L1 if and else
    [
      {
        kind: 'write',
        prompt: 'Print Boarding if the gate is open, otherwise print Wait.',
        starter: '',
        solution:
          'bool gateOpen = true;\nif (gateOpen)\n{\n    Console.WriteLine("Boarding");\n}\nelse\n{\n    Console.WriteLine("Wait");\n}',
        checks: [
          { label: 'A variable for the gate', re: '(bool|int|var|string)\\s+\\w+\\s*=' },
          { label: 'An if with a condition in brackets', re: 'if\\s*\\([^)]+\\)' },
          { label: 'Print Boarding in the if block', re: 'if\\s*\\([^)]*\\)\\s*\\{?\\s*Console\\.WriteLine\\s*\\(\\s*"Boarding"' },
          { label: 'Print Wait in the else block', re: 'else\\s*\\{?\\s*Console\\.WriteLine\\s*\\(\\s*"Wait"' },
        ],
        hint: 'if (condition) { ... } else { ... }',
        explain: 'The gate is open, so the if block runs and the else block is skipped.',
        output: 'Boarding',
      },
      {
        kind: 'write',
        prompt: 'Warn about a low battery and switch on saver mode below 20%.',
        starter: 'int battery = 15;\n',
        solution:
          'int battery = 15;\nbool saver = false;\nif (battery < 20)\n{\n    Console.WriteLine("Low battery");\n    saver = true;\n}\nelse\n{\n    Console.WriteLine("Battery OK");\n}\nConsole.WriteLine($"Saver: {saver}");',
        checks: [
          { label: 'Start with bool saver = false', re: 'bool\\s+saver\\s*=\\s*false\\s*;' },
          { label: 'Test battery < 20', re: 'if\\s*\\(\\s*(battery\\s*<\\s*20|20\\s*>\\s*battery)\\s*\\)' },
          { label: 'Inside the if braces: warn and set saver = true', re: 'if\\s*\\([^)]*\\)\\s*\\{[^}]*WriteLine[^}]*\\bsaver\\s*=\\s*true\\s*;[^}]*\\}|if\\s*\\([^)]*\\)\\s*\\{[^}]*\\bsaver\\s*=\\s*true\\s*;[^}]*WriteLine[^}]*\\}' },
          { label: 'An else branch for a good battery', re: '\\belse\\b' },
          { label: 'Print saver after the if/else', re: 'else[\\s\\S]*Console\\.WriteLine\\s*\\([^;]*\\bsaver\\b' },
        ],
        hint: 'Two statements in one branch need { } braces around them.',
        explain: '15 is below 20, so both lines in the if block run and saver ends up True.',
        output: 'Low battery\nSaver: True',
      },
    ],
    // L2 else if & nesting
    [
      {
        kind: 'write',
        prompt: 'Band a parcel: over 10 kg Heavy, over 2 kg Medium, else Light.',
        starter: '',
        solution:
          'int kg = 6;\nif (kg > 10) Console.WriteLine("Heavy");\nelse if (kg > 2) Console.WriteLine("Medium");\nelse Console.WriteLine("Light");',
        checks: [
          { label: 'Start with if for Heavy', re: 'if\\s*\\([^)]*10[^)]*\\)\\s*\\{?\\s*Console\\.WriteLine\\s*\\(\\s*"Heavy"' },
          { label: 'Then else if for Medium', re: 'else\\s+if\\s*\\([^)]*2[^)]*\\)\\s*\\{?\\s*Console\\.WriteLine\\s*\\(\\s*"Medium"' },
          { label: 'A final else for Light', re: 'else\\s*\\{?\\s*Console\\.WriteLine\\s*\\(\\s*"Light"' },
        ],
        hint: 'Test the biggest band first: the first true condition wins.',
        explain: '6 kg isn’t over 10 but is over 2, so Medium prints and the final else is skipped.',
        output: 'Medium',
      },
      {
        kind: 'write',
        prompt: 'Nest an if: adults go to the VIP lounge or Main floor; under-18s are turned away.',
        starter: 'bool member = false;\nint age = 20;\n',
        solution:
          'bool member = false;\nint age = 20;\nif (age >= 18)\n{\n    if (member) Console.WriteLine("VIP lounge");\n    else Console.WriteLine("Main floor");\n}\nelse\n{\n    Console.WriteLine("Too young");\n}',
        checks: [
          { label: 'Check age >= 18 first', re: 'if\\s*\\(\\s*(age\\s*>=\\s*18|age\\s*>\\s*17|18\\s*<=\\s*age)\\s*\\)' },
          { label: 'An if on member inside the age block', re: 'if\\s*\\([^)]*age[^)]*\\)\\s*\\{[^}]*if\\s*\\(\\s*!?\\s*member' },
          { label: 'VIP lounge and Main floor for adults', re: '"VIP lounge"[\\s\\S]*"Main floor"|"Main floor"[\\s\\S]*"VIP lounge"' },
          { label: 'An else for under-18s', re: '\\}\\s*else\\s*\\{?\\s*Console\\.WriteLine\\s*\\(\\s*"[^"]*"' },
        ],
        hint: 'Put the member if/else inside the { } of the age check.',
        explain: 'The inner if only runs for adults. A 20-year-old non-member lands on the Main floor.',
        output: 'Main floor',
      },
    ],
    // L3 Logic & the ternary
    [
      {
        kind: 'write',
        prompt: 'Use a ternary to pick a "Child" or "Adult" ticket for an 8-year-old.',
        starter: '',
        solution: 'int age = 8;\nstring ticket = age < 12 ? "Child" : "Adult";\nConsole.WriteLine(ticket);',
        checks: [
          { label: 'Store the choice in a string', re: '(string|var)\\s+\\w+\\s*=\\s*[^;]*\\?' },
          { label: 'cond ? "Child" : "Adult"', re: '\\?\\s*("Child"\\s*:\\s*"Adult"|"Adult"\\s*:\\s*"Child")' },
          { label: 'No if statement needed', not: 'if (' },
          { label: 'Print the ticket', re: 'Console\\.WriteLine\\s*\\(' },
        ],
        hint: 'condition ? valueIfTrue : valueIfFalse',
        explain: 'age < 12 is true, so the ternary picks the first value, "Child".',
        output: 'Child',
      },
      {
        kind: 'write',
        prompt: 'Open the door for the right code with the alarm off, or a master key.',
        starter: 'int code = 4321;\nbool alarmOn = false;\nbool masterKey = false;\n',
        solution:
          'int code = 4321;\nbool alarmOn = false;\nbool masterKey = false;\nbool unlocked = (code == 4321 && !alarmOn) || masterKey;\nConsole.WriteLine(unlocked ? "Door opens" : "Access denied");',
        checks: [
          { label: 'Compare the code with ==', re: 'code\\s*==\\s*4321|4321\\s*==\\s*code' },
          { label: 'Alarm off with ! and &&', re: '&&\\s*!\\s*alarmOn|!\\s*alarmOn\\s*&&' },
          { label: 'Or the master key with ||', re: '\\|\\|\\s*masterKey|masterKey\\s*\\|\\|' },
          { label: 'Print a message chosen with ? :', re: '\\?\\s*"[^"]*"\\s*:\\s*"[^"]*"' },
        ],
        hint: 'Group the code and alarm tests in brackets, then || masterKey.',
        explain: 'The code matches and !alarmOn is true, so && is true; || then doesn’t need the key.',
        output: 'Door opens',
      },
    ],
    // L4 The switch statement
    [
      {
        kind: 'write',
        prompt: 'Switch on a traffic light colour and print what drivers should do.',
        starter: '',
        solution:
          'string light = "amber";\nswitch (light)\n{\n    case "green":\n        Console.WriteLine("Go");\n        break;\n    case "amber":\n        Console.WriteLine("Slow down");\n        break;\n    case "red":\n        Console.WriteLine("Stop");\n        break;\n    default:\n        Console.WriteLine("Light broken");\n        break;\n}',
        checks: [
          { label: 'switch on the colour variable', re: 'switch\\s*\\(\\s*\\w+\\s*\\)\\s*\\{' },
          { label: 'Three case labels (green, amber, red)', re: '(case\\s+"[^"]+"\\s*:[\\s\\S]*){3}' },
          { label: 'A default case', re: 'default\\s*:' },
          { label: 'End every case with break;', re: '(break\\s*;[\\s\\S]*){4}' },
        ],
        hint: 'case "green": ... break; for each colour, then default: for anything else.',
        explain: 'The value "amber" matches its case, so Slow down prints and break leaves the switch.',
        output: 'Slow down',
      },
      {
        kind: 'write',
        prompt: 'Sort months into seasons with stacked case labels.',
        starter: 'int month = 7;\nswitch (month)\n{\n}',
        solution:
          'int month = 7;\nswitch (month)\n{\n    case 12: case 1: case 2:\n        Console.WriteLine("Winter");\n        break;\n    case 3: case 4: case 5:\n        Console.WriteLine("Spring");\n        break;\n    case 6: case 7: case 8:\n        Console.WriteLine("Summer");\n        break;\n    default:\n        Console.WriteLine("Autumn");\n        break;\n}',
        checks: [
          { label: 'Stack each season’s months, like case 6: case 7: case 8:', re: '(case\\s+\\d+\\s*:\\s*case\\s+\\d+\\s*:\\s*case\\s+\\d+\\s*:[\\s\\S]*){3}' },
          { label: 'July prints Summer', re: 'case\\s+7\\s*:[^;]*Console\\.WriteLine\\s*\\(\\s*"Summer"' },
          { label: 'A default for the rest', re: 'default\\s*:' },
          { label: 'break; after each block', re: '(break\\s*;[\\s\\S]*){4}' },
        ],
        hint: 'Several case labels in a row share the block under them.',
        explain: 'month is 7, which matches the stacked case 6/7/8 block, so Summer prints.',
        output: 'Summer',
      },
    ],
    // L5 Switch expressions & is
    [
      {
        kind: 'write',
        prompt: 'Turn a star rating into a word with a switch expression.',
        starter: '',
        solution:
          'int stars = 4;\nstring verdict = stars switch\n{\n    5 => "Perfect",\n    4 => "Great",\n    3 => "Okay",\n    _ => "Skip it"\n};\nConsole.WriteLine(verdict);',
        checks: [
          { label: 'value switch { ... } stored in a variable', re: '=\\s*\\w+\\s+switch\\s*\\{' },
          { label: 'Arms like 5 => "Perfect", with commas', re: '(=>\\s*"[^"]*"\\s*,[\\s\\S]*){2}' },
          { label: 'A _ arm for everything else', re: '_\\s*=>' },
          { label: 'Close with };', re: '\\}\\s*;' },
          { label: 'Print the word', re: 'Console\\.WriteLine\\s*\\(' },
        ],
        hint: 'string x = stars switch { 5 => "...", _ => "..." };',
        explain: 'A switch expression produces a value. 4 matches its arm, so verdict is "Great".',
        output: 'Great',
      },
      {
        kind: 'write',
        prompt: 'Price a cinema ticket by age with relational patterns, and flag teens with is.',
        starter: 'int age = 15;\n',
        solution:
          'int age = 15;\nint price = age switch\n{\n    < 4 => 0,\n    < 16 => 6,\n    >= 65 => 7,\n    _ => 10\n};\nConsole.WriteLine($"Price: {price}");\nif (age is >= 13 and <= 19) Console.WriteLine("Teen");',
        checks: [
          { label: 'A switch expression on age', re: 'age\\s+switch\\s*\\{' },
          { label: 'Relational arms like < 16 =>', re: '([<>]=?\\s*\\d+\\s*=>[\\s\\S]*){2}' },
          { label: 'A _ arm for the full price', re: '_\\s*=>' },
          { label: 'A teen test with is ... and ...', re: '\\bis\\s+[<>]=?\\s*\\d+\\s+and\\s+[<>]=?\\s*\\d+' },
        ],
        hint: 'Arms are checked top to bottom: < 4 before < 16. Patterns join with and.',
        explain: '15 isn’t under 4 but is under 16, so the price is 6. 15 is between 13 and 19, so Teen prints.',
        output: 'Price: 6\nTeen',
      },
    ],
  ],
};

export default unit;
