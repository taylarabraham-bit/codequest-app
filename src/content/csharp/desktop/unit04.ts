import type { DesktopUnit } from '../../../engine/types';

// Desktop edition: write-the-code challenges for C# unit 4 (Loops).
// lessons[i] runs after lesson i + 1. See docs/CONTENT_GUIDE.md.
const unit: DesktopUnit = {
  lessons: [
    // L1 while loops
    [
      {
        kind: 'write',
        prompt: 'Count a rocket down from 5 to 1 with a while loop, then print Liftoff!',
        starter: '',
        solution: 'int count = 5;\nwhile (count > 0)\n{\n    Console.WriteLine(count);\n    count--;\n}\nConsole.WriteLine("Liftoff!");',
        checks: [
          { label: 'A counter that starts at 5', re: '(int|var)\\s+\\w+\\s*=\\s*5\\s*;' },
          { label: 'A while loop with a condition', re: 'while\\s*\\([^)]+\\)' },
          { label: 'Lower the counter inside the loop', re: 'while[\\s\\S]*(\\w+\\s*--|--\\s*\\w+|\\w+\\s*-=\\s*1)' },
          { label: 'Print Liftoff! after the loop', re: '\\}\\s*Console\\.WriteLine\\s*\\(\\s*"Liftoff!"\\s*\\)' },
        ],
        hint: 'while (count > 0) { print; count--; }',
        explain: 'Each pass prints and lowers count. At 0 the condition is false, the loop ends and Liftoff! prints.',
        output: '5\n4\n3\n2\n1\nLiftoff!',
      },
      {
        kind: 'write',
        prompt: 'Save 30 a week until you reach 100, then print the weeks and the total.',
        starter: 'int saved = 0;\nint weeks = 0;\n',
        solution:
          'int saved = 0;\nint weeks = 0;\nwhile (saved < 100)\n{\n    saved += 30;\n    weeks++;\n}\nConsole.WriteLine($"{weeks} weeks, saved {saved}");',
        checks: [
          { label: 'Loop while saved < 100', re: 'while\\s*\\(\\s*(saved\\s*<\\s*100|100\\s*>\\s*saved)\\s*\\)' },
          { label: 'Add 30 each pass', re: 'saved\\s*(\\+=\\s*30|=\\s*saved\\s*\\+\\s*30)' },
          { label: 'Count the weeks', re: 'weeks\\s*\\+\\+|\\+\\+\\s*weeks|weeks\\s*\\+=\\s*1' },
          { label: 'Print weeks and saved after the loop', re: '\\}\\s*Console\\.WriteLine\\s*\\([^;]*weeks[^;]*\\)' },
        ],
        hint: 'Both variables change inside the loop; the print goes after the closing }.',
        explain: '30, 60, 90 are still under 100, so a fourth week runs: 4 weeks, 120 saved.',
        output: '4 weeks, saved 120',
      },
    ],
    // L2 for loops
    [
      {
        kind: 'write',
        prompt: 'Print the 7 times table from 7 x 1 to 7 x 5 with a for loop.',
        starter: '',
        solution: 'for (int i = 1; i <= 5; i++)\n{\n    Console.WriteLine($"7 x {i} = {7 * i}");\n}',
        checks: [
          {
            label: 'A for loop from 1 to 5',
            re: 'for\\s*\\(\\s*(int|var)\\s+\\w+\\s*=\\s*1\\s*;\\s*\\w+\\s*(<=\\s*5|<\\s*6)\\s*;\\s*(\\w+\\s*\\+\\+|\\+\\+\\s*\\w+|\\w+\\s*\\+=\\s*1)\\s*\\)',
          },
          { label: 'Multiply 7 by the counter', re: '7\\s*\\*\\s*\\w+|\\w+\\s*\\*\\s*7' },
          { label: 'Print each line inside the loop', re: 'for\\s*\\([^)]*\\)\\s*\\{?\\s*Console\\.WriteLine' },
        ],
        hint: 'for (start; condition; step). Work out 7 * i inside the braces of $"...".',
        explain: 'i takes the values 1 to 5, and each pass prints one row of the table.',
        output: '7 x 1 = 7\n7 x 2 = 14\n7 x 3 = 21\n7 x 4 = 28\n7 x 5 = 35',
      },
      {
        kind: 'write',
        prompt: 'Above the last line, count a timer down from 30 to 0 in steps of 10.',
        starter: 'Console.WriteLine("Time\'s up!");',
        solution: 'for (int t = 30; t >= 0; t -= 10)\n{\n    Console.WriteLine($"{t} seconds");\n}\nConsole.WriteLine("Time\'s up!");',
        checks: [
          { label: 'Start the counter at 30', re: 'for\\s*\\(\\s*(int|var)\\s+\\w+\\s*=\\s*30\\s*;' },
          { label: 'Keep going down to 0', re: ';\\s*\\w+\\s*(>=\\s*0|>\\s*-\\d+)\\s*;' },
          { label: 'Step down with -= 10', re: '\\w+\\s*-=\\s*10\\s*\\)' },
          { label: 'The loop comes before Time’s up!', re: 'for\\s*\\([\\s\\S]*Console\\.WriteLine\\s*\\(\\s*"Time\'s up!"' },
        ],
        hint: 'The step part can be t -= 10. Use >= so 0 still prints.',
        explain: 't goes 30, 20, 10, 0; at -10 the condition fails and the code after the loop runs.',
        output: '30 seconds\n20 seconds\n10 seconds\n0 seconds\nTime\'s up!',
      },
    ],
    // L3 do-while loops
    [
      {
        kind: 'write',
        prompt: 'Make an alarm beep three times with a do-while loop.',
        starter: '',
        solution: 'int beeps = 0;\ndo\n{\n    Console.WriteLine("Beep!");\n    beeps++;\n} while (beeps < 3);',
        checks: [
          { label: 'A counter before the loop', re: '(int|var)\\s+\\w+\\s*=\\s*\\d+\\s*;[\\s\\S]*do' },
          { label: 'do { ... } with the body first', re: '\\bdo\\s*\\{' },
          { label: 'Change the counter in the body', re: 'do\\s*\\{[^}]*(\\+\\+|--|\\+=|-=)' },
          { label: 'End with while (...);', re: '\\}\\s*while\\s*\\([^)]+\\)\\s*;' },
        ],
        hint: 'do { ... } while (beeps < 3); and don’t forget the final semicolon.',
        explain: 'The body runs, then the condition is checked. It stays true for 0, 1 and 2, so Beep! prints three times.',
        output: 'Beep!\nBeep!\nBeep!',
      },
      {
        kind: 'write',
        prompt: 'Add a do-while with the same condition to show it runs once anyway.',
        starter: 'int coins = 10;\nwhile (coins < 5)\n{\n    Console.WriteLine("while: buy");\n    coins++;\n}\n',
        solution:
          'int coins = 10;\nwhile (coins < 5)\n{\n    Console.WriteLine("while: buy");\n    coins++;\n}\ndo\n{\n    Console.WriteLine("do: buy");\n    coins++;\n} while (coins < 5);\nConsole.WriteLine($"Coins: {coins}");',
        checks: [
          { label: 'A do { } block after the while loop', re: '\\}\\s*do\\s*\\{' },
          { label: 'Print and add a coin in its body', re: 'do\\s*\\{[^}]*Console\\.WriteLine[^}]*coins\\s*(\\+\\+|\\+=)' },
          { label: 'End with } while (coins < 5);', re: '\\}\\s*while\\s*\\(\\s*coins\\s*<\\s*5\\s*\\)\\s*;' },
          { label: 'Print coins at the end', re: 'while\\s*\\(\\s*coins\\s*<\\s*5\\s*\\)\\s*;[\\s\\S]*Console\\.WriteLine\\s*\\([^;]*coins' },
        ],
        hint: 'Copy the loop body into do { ... } and move the condition to the end.',
        explain: 'coins is 10, so the while loop never runs, but the do-while runs once before checking: 11 coins.',
        output: 'do: buy\nCoins: 11',
      },
    ],
    // L4 break & continue
    [
      {
        kind: 'write',
        prompt: 'Call out bus stops 1 to 10, skipping every third stop with continue.',
        starter: '',
        solution: 'for (int i = 1; i <= 10; i++)\n{\n    if (i % 3 == 0) continue;\n    Console.WriteLine($"Stop {i}");\n}',
        checks: [
          { label: 'A loop from 1 to 10', re: 'for\\s*\\(\\s*(int|var)\\s+\\w+\\s*=\\s*1\\s*;\\s*\\w+\\s*(<=\\s*10|<\\s*11)\\s*;' },
          { label: 'Spot every third stop with % 3 == 0', re: '%\\s*3\\s*==\\s*0' },
          { label: 'Skip it with continue;', re: 'continue\\s*;' },
          { label: 'Print the stop after the skip', re: 'continue\\s*;[\\s\\S]*Console\\.WriteLine' },
        ],
        hint: 'if (i % 3 == 0) continue; jumps straight to the next number.',
        explain: 'continue skips the rest of this pass, so 3, 6 and 9 never reach the WriteLine.',
        output: 'Stop 1\nStop 2\nStop 4\nStop 5\nStop 7\nStop 8\nStop 10',
      },
      {
        kind: 'write',
        prompt: 'Fill a lift with 80 kg riders until the next one would pass 300 kg.',
        starter: 'int load = 0;\nint riders = 0;\n',
        solution:
          'int load = 0;\nint riders = 0;\nwhile (true)\n{\n    if (load + 80 > 300) break;\n    load += 80;\n    riders++;\n}\nConsole.WriteLine($"{riders} riders, {load} kg");',
        checks: [
          { label: 'Loop with while (true)', re: 'while\\s*\\(\\s*true\\s*\\)' },
          { label: 'break out when the next rider won’t fit', re: 'if\\s*\\([^)]*\\)\\s*\\{?\\s*break\\s*;' },
          { label: 'Add 80 to load', re: 'load\\s*(\\+=\\s*80|=\\s*load\\s*\\+\\s*80)' },
          { label: 'Count the rider', re: 'riders\\s*\\+\\+|\\+\\+\\s*riders|riders\\s*\\+=\\s*1' },
          { label: 'Print riders and load after the loop', re: '\\}\\s*Console\\.WriteLine\\s*\\([^;]*riders' },
        ],
        hint: 'Check before adding: if (load + 80 > 300) break;',
        explain: '80, 160, 240 fit; one more would make 320, so break stops the loop with 3 riders.',
        output: '3 riders, 240 kg',
      },
    ],
    // L5 Nested loops
    [
      {
        kind: 'write',
        prompt: 'Draw a grid of # that is 3 rows tall and 4 columns wide.',
        starter: '',
        solution:
          'for (int row = 0; row < 3; row++)\n{\n    for (int col = 0; col < 4; col++)\n    {\n        Console.Write("#");\n    }\n    Console.WriteLine();\n}',
        checks: [
          { label: 'A for loop inside another for loop', re: 'for\\s*\\([^)]*\\)\\s*\\{?\\s*for\\s*\\(' },
          { label: 'Console.Write one # at a time', re: 'Console\\.Write\\s*\\(\\s*("#"|\'#\')\\s*\\)' },
          { label: 'End each row with Console.WriteLine()', re: 'Console\\.WriteLine\\s*\\(\\s*\\)' },
        ],
        hint: 'The outer loop makes rows; the inner loop writes the # marks of one row.',
        explain: 'The inner loop runs 4 times on each of the 3 outer passes, and WriteLine() starts the next row.',
        output: '####\n####\n####',
      },
      {
        kind: 'write',
        prompt: 'Add an inner loop to print a number staircase: 1, 12, 123, 1234.',
        starter: 'for (int i = 1; i <= 4; i++)\n{\n    // inner loop here\n    Console.WriteLine();\n}',
        solution:
          'for (int i = 1; i <= 4; i++)\n{\n    for (int j = 1; j <= i; j++)\n    {\n        Console.Write(j);\n    }\n    Console.WriteLine();\n}',
        checks: [
          { label: 'An inner for loop with its own counter', re: 'for\\s*\\([\\s\\S]*for\\s*\\(\\s*(int|var)\\s+(?!i\\b)\\w+\\s*=\\s*1\\s*;' },
          { label: 'The inner loop runs up to i', re: 'for\\s*\\([^;]*;\\s*\\w+\\s*(<=\\s*i|<\\s*i\\s*\\+\\s*1)\\s*;' },
          { label: 'Write the inner counter with Console.Write', re: 'Console\\.Write\\s*\\(\\s*(?!i\\b)\\w+\\s*\\)' },
          { label: 'Inner loop before Console.WriteLine()', re: 'for[\\s\\S]*for[\\s\\S]*Console\\.Write\\s*\\([^)]+\\)[\\s\\S]*Console\\.WriteLine\\s*\\(\\s*\\)' },
        ],
        hint: 'Row i needs the numbers 1 up to i, so the inner condition uses i.',
        explain: 'Each row’s inner loop stops at the row number, so rows grow by one digit.',
        output: '1\n12\n123\n1234',
      },
    ],
  ],
};

export default unit;
