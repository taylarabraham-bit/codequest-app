import type { DesktopUnit } from '../../../engine/types';

// Desktop edition: write-the-code challenges for C# unit 1 (Hello world & variables).
// lessons[i] runs after lesson i + 1. See docs/CONTENT_GUIDE.md.
const unit: DesktopUnit = {
  lessons: [
    // L1 Your first line
    [
      {
        kind: 'write',
        prompt: 'Print a beach packing list: a title line, then two items.',
        starter: '',
        solution: 'Console.WriteLine("Beach list:");\nConsole.WriteLine("Towel");\nConsole.WriteLine("Sunscreen");',
        checks: [
          { label: 'A first line that prints Beach list:', re: '^\\s*Console\\.WriteLine\\s*\\(\\s*"Beach list:"\\s*\\)\\s*;' },
          {
            label: 'Three Console.WriteLine lines, each ending in ;',
            re: '(Console\\.WriteLine\\s*\\(\\s*"[^"]*"\\s*\\)\\s*;[\\s\\S]*){3}',
          },
        ],
        hint: 'One Console.WriteLine("..."); per line of output.',
        explain: 'Each WriteLine prints its text and moves to a new line, so three calls make three lines.',
        output: 'Beach list:\nTowel\nSunscreen',
      },
      {
        kind: 'write',
        prompt: 'Fix both lines so the ticket message compiles and prints.',
        starter: 'console.WriteLine("Ticket booked")\nConsole.WriteLine(\'Seat 14B\');',
        solution: 'Console.WriteLine("Ticket booked");\nConsole.WriteLine("Seat 14B");',
        checks: [
          { label: 'Console starts with a capital C', not: 'console.' },
          { label: 'End the first line with ;', has: 'Console.WriteLine("Ticket booked");' },
          { label: 'Put Seat 14B in double quotes', has: 'Console.WriteLine("Seat 14B");' },
        ],
        hint: 'C# is case-sensitive, every statement ends with ;, and text needs "double quotes".',
        explain: 'Single quotes are for one char only, so \'Seat 14B\' won’t compile. Console needs its capital C.',
        output: 'Ticket booked\nSeat 14B',
      },
    ],
    // L2 Comments & Write
    [
      {
        kind: 'write',
        prompt: 'Under a comment, print Score: 42 on one line using Write, then WriteLine.',
        starter: '',
        solution: '// Final score\nConsole.Write("Score: ");\nConsole.WriteLine(42);',
        checks: [
          { label: 'A comment with // or /* */', re: '//|/\\*' },
          { label: 'Console.Write for the label (no line break)', re: 'Console\\.Write\\s*\\(\\s*"[^"]*"\\s*\\)\\s*;' },
          { label: 'Then Console.WriteLine for the number', re: 'Console\\.Write\\s*\\([\\s\\S]*Console\\.WriteLine\\s*\\(\\s*42\\s*\\)\\s*;' },
        ],
        hint: 'Write leaves the cursor on the same line, so the next output continues there.',
        explain: 'Write prints "Score: " and stays put; WriteLine adds 42 and ends the line. The comment is ignored.',
        output: 'Score: 42',
      },
      {
        kind: 'write',
        prompt: 'Make the countdown print on one line and comment out the debug line.',
        starter:
          'Console.WriteLine("Debug: start");\nConsole.WriteLine("3... ");\nConsole.WriteLine("2... ");\nConsole.WriteLine("1... ");\nConsole.WriteLine("Go!");',
        solution:
          '// Console.WriteLine("Debug: start");\nConsole.Write("3... ");\nConsole.Write("2... ");\nConsole.Write("1... ");\nConsole.WriteLine("Go!");',
        checks: [
          { label: 'Comment out the Debug line', re: '(//|/\\*)\\s*Console\\.WriteLine\\s*\\(\\s*"Debug: start"' },
          { label: 'Console.Write for 3, 2 and 1', re: '(Console\\.Write\\s*\\(\\s*"[^"]*"\\s*\\)\\s*;[\\s\\S]*){3}Console\\.WriteLine' },
          { label: 'Finish with WriteLine("Go!")', has: 'Console.WriteLine("Go!");' },
        ],
        hint: 'Put // in front of the debug line. Change WriteLine to Write on the 3, 2 and 1 lines.',
        explain: 'Write keeps everything on one line until the final WriteLine. A // comment switches a line off without deleting it.',
        output: '3... 2... 1... Go!',
      },
    ],
    // L3 Storing values
    [
      {
        kind: 'write',
        prompt: 'Store a coffee order in a string and an int, then print both.',
        starter: '',
        solution: 'string drink = "Latte";\nint cups = 3;\nConsole.WriteLine(drink);\nConsole.WriteLine(cups);',
        checks: [
          { label: 'A string variable holding the drink', re: 'string\\s+\\w+\\s*=\\s*"[^"]*"\\s*;' },
          { label: 'An int variable holding the cups', re: 'int\\s+\\w+\\s*=\\s*\\d+\\s*;' },
          {
            label: 'Print the variables (no quotes around the names)',
            re: '(Console\\.WriteLine\\s*\\(\\s*[A-Za-z_]\\w*\\s*\\)\\s*;[\\s\\S]*){2}',
          },
        ],
        hint: 'Type, name, =, value, ;. Then Console.WriteLine(name);',
        explain: 'string holds text in quotes and int holds a whole number. Printing a variable prints its value.',
        output: 'Latte\n3',
      },
      {
        kind: 'write',
        prompt: 'The player loses a life: change lives to 2 and print it again.',
        starter: 'int lives = 3;\nConsole.WriteLine(lives);\n',
        solution: 'int lives = 3;\nConsole.WriteLine(lives);\nlives = 2;\nConsole.WriteLine(lives);',
        checks: [
          { label: 'Set lives to 2 with lives = 2;', re: '^\\s*lives\\s*=\\s*2\\s*;', flags: 'm' },
          { label: 'Don’t write int again (only one int lives)', re: '^(?![\\s\\S]*int\\s+lives[\\s\\S]*int\\s+lives)' },
          { label: 'Print lives after the change', re: 'lives\\s*=\\s*2\\s*;[\\s\\S]*Console\\.WriteLine\\s*\\(\\s*lives\\s*\\)' },
        ],
        hint: 'To change a variable you already made, write just its name, = and the new value.',
        explain: 'The type is only written once, when the variable is created. After that, name = value replaces the old value.',
        output: '3\n2',
      },
    ],
    // L4 var & joining text
    [
      {
        kind: 'write',
        prompt: 'Use var for a city and temperature, then print "Oslo is 12 degrees".',
        starter: '',
        solution: 'var city = "Oslo";\nvar temp = 12;\nConsole.WriteLine(city + " is " + temp + " degrees");',
        checks: [
          { label: 'A var holding the city text', re: 'var\\s+\\w+\\s*=\\s*"[^"]*"\\s*;' },
          { label: 'A var holding the temperature number', re: 'var\\s+\\w+\\s*=\\s*-?\\d+\\s*;' },
          { label: 'Join text and variables with +', re: 'Console\\.WriteLine\\s*\\([^;]*\\+[^;]*\\+[^;]*\\)\\s*;' },
          { label: 'Use + here, not $ interpolation', not: '$"' },
        ],
        hint: 'var works out the type. Join pieces like city + " is " + temp.',
        explain: 'When one side of + is a string, the number is turned into text and glued on. Mind the spaces inside the quotes.',
        output: 'Oslo is 12 degrees',
      },
      {
        kind: 'write',
        prompt: 'Print the line in the comment by joining the three variables with +.',
        starter: 'var player = "Zoe";\nvar level = 4;\nvar guild = "Owls";\n// Print: Zoe (level 4) joins the Owls\n',
        solution:
          'var player = "Zoe";\nvar level = 4;\nvar guild = "Owls";\n// Print: Zoe (level 4) joins the Owls\nConsole.WriteLine(player + " (level " + level + ") joins the " + guild);',
        checks: [
          {
            label: 'Use player, level and guild, in that order',
            re: 'WriteLine\\s*\\(\\s*player\\s*\\+[^;]*\\+\\s*level\\s*\\+[^;]*\\+\\s*guild\\s*\\)',
          },
          { label: 'Join the pieces with +', re: 'WriteLine\\s*\\(([^;]*\\+){4}' },
          { label: 'Don’t type Zoe or Owls again', re: '^(?![\\s\\S]*WriteLine\\s*\\([^;]*"[^"]*(Zoe|Owls))' },
        ],
        hint: 'Alternate variables and text: player + " (level " + level + ...',
        explain: 'Using the variables means the line updates by itself when a value changes. The spaces live inside the quoted pieces.',
        output: 'Zoe (level 4) joins the Owls',
      },
    ],
    // L5 Interpolation & input
    [
      {
        kind: 'write',
        prompt: 'Log a run with $ interpolation: "Ran 5 km in 30 minutes".',
        starter: '',
        solution: 'int km = 5;\nint minutes = 30;\nConsole.WriteLine($"Ran {km} km in {minutes} minutes");',
        checks: [
          { label: 'Two number variables', re: '((int|var)\\s+\\w+\\s*=\\s*\\d+\\s*;[\\s\\S]*){2}' },
          { label: 'A $ string', has: '$"' },
          { label: 'Both variables in {braces}', re: '\\$"[^"]*\\{\\s*\\w+\\s*\\}[^"]*\\{\\s*\\w+\\s*\\}[^"]*"' },
        ],
        hint: 'Start the string with $" and write {km} where the value goes.',
        explain: 'With $ in front, anything in {braces} is replaced by its value. No + needed.',
        output: 'Ran 5 km in 30 minutes',
      },
      {
        kind: 'write',
        prompt: 'Ask for a pet’s name and favourite toy, then reply using both.',
        starter: '',
        solution:
          'Console.Write("Pet name? ");\nstring? pet = Console.ReadLine();\nConsole.Write("Favourite toy? ");\nstring? toy = Console.ReadLine();\nConsole.WriteLine($"{pet} loves the {toy}!");',
        checks: [
          {
            label: 'Ask with Console.Write before reading',
            re: 'Console\\.Write\\s*\\(\\s*"[^"]*"\\s*\\)\\s*;\\s*(string\\?|var)\\s+\\w+\\s*=\\s*Console\\.ReadLine',
          },
          { label: 'Read two answers with Console.ReadLine()', re: '(Console\\.ReadLine\\s*\\(\\s*\\)\\s*;[\\s\\S]*){2}' },
          { label: 'Store them in string? (or var) variables', re: '((string\\?|var)\\s+\\w+\\s*=\\s*Console\\.ReadLine[\\s\\S]*){2}' },
          { label: 'Reply with both in a $ string', re: '\\$"[^"]*\\{\\s*\\w+\\s*\\}[^"]*\\{\\s*\\w+\\s*\\}[^"]*"' },
        ],
        hint: 'Write the question, then string? name = Console.ReadLine(); and repeat.',
        explain: 'ReadLine waits for Enter and returns the typed text as string?. Asking first tells the user what to type.',
      },
    ],
  ],
};

export default unit;
