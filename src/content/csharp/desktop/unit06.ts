import type { DesktopUnit } from '../../../engine/types';

// Desktop edition: write-the-code challenges for C# unit 6 (Strings & arrays).
// lessons[i] runs after lesson i + 1. See docs/CONTENT_GUIDE.md.
const unit: DesktopUnit = {
  lessons: [
    // L1 String methods
    [
      {
        kind: 'write',
        prompt: 'Clean up the username: trim it, lower-case it, then print it and its length.',
        starter: 'string raw = "  SkyRider99 ";\n',
        solution: 'string raw = "  SkyRider99 ";\nstring user = raw.Trim().ToLower();\nConsole.WriteLine(user);\nConsole.WriteLine(user.Length);',
        checks: [
          { label: 'Remove the spaces with .Trim()', has: '.Trim()' },
          { label: 'Lower-case it with .ToLower()', has: '.ToLower()' },
          { label: 'Store the result in a new string', re: '(string|var)\\s+\\w+\\s*=\\s*\\w+\\.(Trim|ToLower)\\s*\\(' },
          { label: 'Print its .Length (no brackets)', re: 'WriteLine\\s*\\(\\s*\\w+\\.Length\\s*\\)' },
        ],
        hint: 'Methods chain: raw.Trim().ToLower(). Length is a property, so no ().',
        explain: 'Trim and ToLower return a new string; raw itself never changes. "skyrider99" has 10 characters.',
        output: 'skyrider99\n10',
      },
      {
        kind: 'write',
        prompt: 'Upper-case the product code, swap BLU for BLUE, then test the result.',
        starter: 'string code = "sku-4471-blu";\n',
        solution:
          'string code = "sku-4471-blu";\nstring clean = code.ToUpper().Replace("BLU", "BLUE");\nConsole.WriteLine(clean);\nConsole.WriteLine(clean.StartsWith("SKU"));\nConsole.WriteLine(clean.Contains("4471"));\nConsole.WriteLine(code);',
        checks: [
          { label: 'Upper-case it with .ToUpper()', has: '.ToUpper()' },
          { label: 'Swap the colour with .Replace', re: '\\.Replace\\s*\\(\\s*"(BLU|blu)"\\s*,\\s*"(BLUE|blue)"\\s*\\)' },
          { label: 'Print whether it starts with SKU', re: 'WriteLine\\s*\\(\\s*\\w+\\.StartsWith\\s*\\(\\s*"SKU"\\s*\\)\\s*\\)' },
          { label: 'Print whether it contains 4471', re: 'WriteLine\\s*\\(\\s*\\w+\\.Contains\\s*\\(\\s*"4471"\\s*\\)\\s*\\)' },
          { label: 'Print code itself to show it never changed', re: 'WriteLine\\s*\\(\\s*code\\s*\\)' },
        ],
        hint: 'Chain them: code.ToUpper().Replace("BLU", "BLUE"). StartsWith and Contains give True or False.',
        explain: 'Every string method returns a new copy, so code still holds the original lower-case text.',
        output: 'SKU-4471-BLUE\nTrue\nTrue\nsku-4471-blu',
      },
    ],
    // L2 Indexes & ranges
    [
      {
        kind: 'write',
        prompt: 'From "Saturday", print the first letter, the last letter and the first three.',
        starter: '',
        solution: 'string day = "Saturday";\nConsole.WriteLine(day[0]);\nConsole.WriteLine(day[^1]);\nConsole.WriteLine(day[..3]);',
        checks: [
          { label: 'Store "Saturday" in a string', re: '(string|var)\\s+\\w+\\s*=\\s*"Saturday"\\s*;' },
          { label: 'First letter with [0]', re: '\\w+\\[\\s*0\\s*\\]' },
          { label: 'Last letter with [^1]', re: '\\w+\\[\\s*(\\^1|\\w+\\.Length\\s*-\\s*1)\\s*\\]' },
          { label: 'First three with the range [..3]', re: '\\w+\\[\\s*(0\\s*)?\\.\\.\\s*3\\s*\\]' },
        ],
        hint: 'Indexes start at 0, ^1 counts from the end, and ..3 stops before index 3.',
        explain: 'day[0] is S, day[^1] is y, and day[..3] slices indexes 0, 1 and 2: Sat.',
        output: 'S\ny\nSat',
      },
      {
        kind: 'write',
        prompt: 'Slice the flight code into airline, number and airport, then find LHR.',
        starter: 'string flight = "BA2490LHR";\n',
        solution:
          'string flight = "BA2490LHR";\nstring airline = flight[..2];\nstring number = flight[2..6];\nstring airport = flight[^3..];\nConsole.WriteLine($"{airline} | {number} | {airport}");\nConsole.WriteLine(flight.IndexOf("LHR"));',
        checks: [
          { label: 'Airline: the first 2 characters', re: 'flight\\[\\s*(0\\s*)?\\.\\.\\s*2\\s*\\]' },
          { label: 'Number: indexes 2 up to 6', re: 'flight\\[\\s*2\\s*\\.\\.\\s*6\\s*\\]' },
          { label: 'Airport: the last 3, like [^3..]', re: 'flight\\[\\s*(\\^3|6)\\s*\\.\\.\\s*(9|\\^0)?\\s*\\]' },
          { label: 'Print where LHR starts with .IndexOf', re: 'WriteLine\\s*\\(\\s*flight\\.IndexOf\\s*\\(\\s*"LHR"\\s*\\)\\s*\\)' },
        ],
        hint: 'A range a..b includes a but stops before b. ^3.. means "the last three".',
        explain: 'B and A sit at 0 and 1, the digits at 2 to 5, and LHR starts at index 6.',
        output: 'BA | 2490 | LHR\n6',
      },
    ],
    // L3 Making arrays
    [
      {
        kind: 'write',
        prompt: 'Store four lap times in an int array; print the first, last and count.',
        starter: '',
        solution:
          'int[] laps = [62, 58, 60, 57];\nConsole.WriteLine(laps[0]);\nConsole.WriteLine(laps[laps.Length - 1]);\nConsole.WriteLine(laps.Length);',
        checks: [
          { label: 'An int[] with four values', re: 'int\\[\\]\\s+\\w+\\s*=\\s*(\\[|new\\s+int\\s*\\[\\s*\\]\\s*\\{|\\{)\\s*\\d+\\s*,\\s*\\d+\\s*,\\s*\\d+\\s*,\\s*\\d+\\s*[\\]}]' },
          { label: 'Print the first with [0]', re: 'WriteLine\\s*\\(\\s*\\w+\\[\\s*0\\s*\\]\\s*\\)' },
          { label: 'Print the last one', re: 'WriteLine\\s*\\(\\s*\\w+\\[\\s*(\\w+\\.Length\\s*-\\s*1|\\^1|3)\\s*\\]\\s*\\)' },
          { label: 'Print the count with .Length', re: 'WriteLine\\s*\\(\\s*\\w+\\.Length\\s*\\)' },
        ],
        hint: 'int[] laps = [ ... ]; The last index is Length - 1.',
        explain: 'Four values means indexes 0 to 3, so the last one is at Length - 1.',
        output: '62\n57\n4',
      },
      {
        kind: 'write',
        prompt: 'Fill the empty podium array, then print the gold and bronze winners.',
        starter: 'string[] podium = new string[3];\n',
        solution:
          'string[] podium = new string[3];\npodium[0] = "Kim";\npodium[1] = "Leo";\npodium[2] = "Ava";\nConsole.WriteLine($"Gold: {podium[0]}");\nConsole.WriteLine($"Bronze: {podium[2]}");',
        checks: [
          {
            label: 'Set slots [0], [1] and [2]',
            re: '(?=[\\s\\S]*podium\\[\\s*0\\s*\\]\\s*=\\s*")(?=[\\s\\S]*podium\\[\\s*1\\s*\\]\\s*=\\s*")(?=[\\s\\S]*podium\\[\\s*2\\s*\\]\\s*=\\s*")',
          },
          { label: 'Print gold from [0]', re: 'WriteLine\\s*\\([^;]*podium\\[\\s*0\\s*\\]' },
          { label: 'Print bronze from [2]', re: 'WriteLine\\s*\\([^;]*podium\\[\\s*(2|\\^1)\\s*\\]' },
          { label: 'No podium[3]: indexes stop at 2', not: 'podium[3]' },
        ],
        hint: 'Three slots are numbered 0, 1 and 2. Assign with podium[0] = "...";',
        explain: 'new string[3] makes three empty (null) slots; you fill them by index, from 0 up to Length - 1.',
        output: 'Gold: Kim\nBronze: Ava',
      },
    ],
    // L4 foreach loops
    [
      {
        kind: 'write',
        prompt: 'Add up a week of step counts with a foreach loop.',
        starter: '',
        solution:
          'int[] steps = [4000, 6500, 3000, 8000, 5500];\nint total = 0;\nforeach (int s in steps)\n{\n    total += s;\n}\nConsole.WriteLine($"Total: {total}");',
        checks: [
          { label: 'An int array of step counts', re: 'int\\[\\]\\s+\\w+\\s*=' },
          { label: 'A total set to 0 before the loop', re: '(int|var)\\s+\\w+\\s*=\\s*0\\s*;[\\s\\S]*foreach' },
          { label: 'foreach (int x in array)', re: 'foreach\\s*\\(\\s*(int|var)\\s+\\w+\\s+in\\s+\\w+\\s*\\)' },
          { label: 'Add each item with +=', re: 'foreach[\\s\\S]*\\w+\\s*\\+=\\s*\\w+' },
          { label: 'Print the total after the loop', re: 'Console\\.WriteLine' },
        ],
        hint: 'Declare the total before the loop so it keeps growing across passes.',
        explain: 'foreach hands over each value in turn; the five days add up to 27000.',
        output: 'Total: 27000',
      },
      {
        kind: 'write',
        prompt: 'Count the vowels in the song title with foreach over its chars.',
        starter: 'string title = "Bohemian Rhapsody";\n',
        solution:
          'string title = "Bohemian Rhapsody";\nint vowels = 0;\nforeach (char c in title.ToLower())\n{\n    if ("aeiou".Contains(c)) vowels++;\n}\nConsole.WriteLine($"Vowels: {vowels}");',
        checks: [
          { label: 'A counter set to 0 before the loop', re: '(int|var)\\s+\\w+\\s*=\\s*0\\s*;[\\s\\S]*foreach' },
          { label: 'foreach over the title’s chars', re: 'foreach\\s*\\(\\s*(char|var)\\s+\\w+\\s+in\\s+title' },
          { label: 'Test each char with an if', re: 'foreach[\\s\\S]*if\\s*\\(' },
          { label: 'Count up inside the loop', re: 'foreach[\\s\\S]*(\\w+\\s*\\+\\+|\\+\\+\\s*\\w+|\\w+\\s*\\+=\\s*1)' },
          { label: 'Print the count', re: 'Console\\.WriteLine\\s*\\([^;]*\\w' },
        ],
        hint: 'A string is a list of chars. "aeiou".Contains(c) is one way to test a vowel.',
        explain: 'o, e, i, a in Bohemian and a, o in Rhapsody make 6. ToLower means capitals count too.',
        output: 'Vowels: 6',
      },
    ],
    // L5 Split & Join
    [
      {
        kind: 'write',
        prompt: 'Split the shopping list at commas, sort it, and print it joined with " - ".',
        starter: 'string list = "milk,eggs,bread,apples";\n',
        solution:
          'string list = "milk,eggs,bread,apples";\nstring[] items = list.Split(\',\');\nArray.Sort(items);\nConsole.WriteLine(string.Join(" - ", items));',
        checks: [
          { label: 'Split at the commas into a string[]', re: '(string\\[\\]|var)\\s+\\w+\\s*=\\s*list\\.Split\\s*\\(\\s*(\',\'|",")\\s*\\)' },
          { label: 'Sort it with Array.Sort', re: 'Array\\.Sort\\s*\\(\\s*\\w+\\s*\\)\\s*;' },
          { label: 'Join with " - "', re: '[sS]tring\\.Join\\s*\\(\\s*" - "\\s*,\\s*\\w+\\s*\\)' },
        ],
        hint: 'Split gives an array. Array.Sort changes it in place; string.Join glues it back.',
        explain: 'Sorting puts the items in A–Z order, and Join puts " - " only between items, not at the ends.',
        output: 'apples - bread - eggs - milk',
      },
      {
        kind: 'write',
        prompt: 'Turn the scores text into ints, total them, and print them sorted.',
        starter: 'string csv = "3,8,5,10";\n',
        solution:
          'string csv = "3,8,5,10";\nstring[] parts = csv.Split(\',\');\nint[] nums = new int[parts.Length];\nint total = 0;\nfor (int i = 0; i < parts.Length; i++)\n{\n    nums[i] = int.Parse(parts[i]);\n    total += nums[i];\n}\nArray.Sort(nums);\nConsole.WriteLine(string.Join(", ", nums));\nConsole.WriteLine($"Total: {total}");',
        checks: [
          { label: 'Split the text at commas', re: 'csv\\.Split\\s*\\(\\s*(\',\'|",")\\s*\\)' },
          { label: 'Parse each piece with int.Parse', re: 'int\\.Parse\\s*\\(|Convert\\.ToInt32\\s*\\(' },
          { label: 'Keep a running total with +=', re: '\\w+\\s*\\+=\\s*' },
          { label: 'Sort the numbers with Array.Sort', re: 'Array\\.Sort\\s*\\(' },
          { label: 'Print them with string.Join', re: '[sS]tring\\.Join\\s*\\(\\s*"[^"]*"\\s*,' },
        ],
        hint: 'Split gives strings; parse each one into an int[] of the same Length.',
        explain: 'Sorted as numbers, 10 comes last (as text it would sort before 3). 3 + 8 + 5 + 10 is 26.',
        output: '3, 5, 8, 10\nTotal: 26',
      },
    ],
  ],
};

export default unit;
