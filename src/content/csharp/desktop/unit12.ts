import type { DesktopUnit } from '../../../engine/types';

// Desktop edition: write-the-code challenges for C# unit 12 (LINQ).
// lessons[i] runs after lesson i + 1. See docs/CONTENT_GUIDE.md.
const unit: DesktopUnit = {
  lessons: [
    // L1 Lambdas & Where
    [
      {
        kind: 'write',
        prompt: 'Keep only the temperatures above 25 and print each one.',
        starter: 'int[] temps = [18, 27, 31, 22, 29];\n',
        solution:
          'int[] temps = [18, 27, 31, 22, 29];\nvar hot = temps.Where(t => t > 25);\nforeach (var t in hot)\n    Console.WriteLine(t);',
        checks: [
          { label: 'Filter with Where and a lambda', re: '\\.Where\\s*\\(\\s*\\(?\\s*\\w+\\s*\\)?\\s*=>' },
          { label: 'The lambda keeps values over 25', re: '=>\\s*\\w+\\s*>\\s*25\\b' },
          { label: 'Loop over the result with foreach', re: 'foreach\\s*\\(\\s*\\w+\\s+\\w+\\s+in\\s+\\w+' },
          { label: 'Print each one with Console.WriteLine', has: 'Console.WriteLine(' },
        ],
        hint: 'temps.Where(t => t > 25) gives the matches; foreach walks through them.',
        explain: 'Where runs the lambda on every temperature and keeps the ones where it returns true: 27, 31 and 29.',
        output: '27\n31\n29',
      },
      {
        kind: 'write',
        prompt: 'Print only the songs that start with S and are longer than 3 letters.',
        starter: 'string[] songs = ["Sun", "Stars", "Rain", "Summer", "Snow"];\nforeach (string s in songs)\n    Console.WriteLine(s);',
        solution:
          'string[] songs = ["Sun", "Stars", "Rain", "Summer", "Snow"];\nvar picks = songs.Where(s => s.StartsWith("S") && s.Length > 3);\nforeach (string s in picks)\n    Console.WriteLine(s);',
        checks: [
          { label: 'Use Where on songs', re: 'songs\\s*\\.Where\\s*\\(' },
          { label: 'Test StartsWith("S")', re: 'StartsWith\\s*\\(\\s*"S"' },
          { label: 'Combine it with Length > 3 using &&', re: '(&&[^;]*Length\\s*>\\s*3)|(Length\\s*>\\s*3[^;]*&&)' },
          { label: 'Don’t loop over all the songs', not: 'in songs)' },
        ],
        hint: 'One lambda can test two things: s => s.StartsWith("S") && s.Length > 3.',
        explain: 'Sun is too short and Rain doesn’t start with S, so Stars, Summer and Snow are left.',
        output: 'Stars\nSummer\nSnow',
      },
    ],
    // L2 Select & ToList
    [
      {
        kind: 'write',
        prompt: 'Turn the fruit names into upper-case labels in a List, then print them.',
        starter: 'string[] fruits = ["apple", "kiwi", "mango"];\n',
        solution:
          'string[] fruits = ["apple", "kiwi", "mango"];\nList<string> labels = fruits.Select(f => f.ToUpper()).ToList();\nConsole.WriteLine(string.Join(", ", labels));',
        checks: [
          { label: 'Select each fruit’s ToUpper()', re: '\\.Select\\s*\\(\\s*(\\w+)\\s*=>\\s*\\1\\.ToUpper\\s*\\(\\s*\\)' },
          { label: 'Store the result with ToList()', has: '.ToList()' },
          { label: 'Print the labels', re: 'Console\\.Write(Line)?\\s*\\(' },
        ],
        hint: 'fruits.Select(f => f.ToUpper()) maps each item; add .ToList() on the end.',
        explain: 'Select keeps whatever the lambda returns, and ToList() runs the query and stores the results.',
        output: 'APPLE, KIWI, MANGO',
      },
      {
        kind: 'write',
        prompt: 'List the names of players who scored over 20, joined with &.',
        starter:
          'List<Player> team =\n[\n    new Player { Name = "Ana", Score = 40 },\n    new Player { Name = "Bo", Score = 15 },\n    new Player { Name = "Cy", Score = 28 },\n];\n\nclass Player\n{\n    public string Name { get; set; } = "";\n    public int Score { get; set; }\n}',
        solution:
          'List<Player> team =\n[\n    new Player { Name = "Ana", Score = 40 },\n    new Player { Name = "Bo", Score = 15 },\n    new Player { Name = "Cy", Score = 28 },\n];\nList<string> stars = team\n    .Where(p => p.Score > 20)\n    .Select(p => p.Name)\n    .ToList();\nConsole.WriteLine(string.Join(" & ", stars));\n\nclass Player\n{\n    public string Name { get; set; } = "";\n    public int Score { get; set; }\n}',
        checks: [
          { label: 'Where the Score is over 20', re: '\\.Where\\s*\\(\\s*(\\w+)\\s*=>\\s*\\1\\.Score\\s*>\\s*20' },
          { label: 'Then Select the Name', re: '\\.Where[\\s\\S]*\\.Select\\s*\\(\\s*(\\w+)\\s*=>\\s*\\1\\.Name\\s*\\)' },
          { label: 'Finish with ToList()', has: '.ToList()' },
          { label: 'Print them with string.Join(" & ", ...)', re: 'string\\.Join\\s*\\(\\s*" & "' },
        ],
        hint: 'Chain .Where(...), then .Select(...), then .ToList(), one per line.',
        explain: 'Filtering first means Select only maps the players you keep. Bo scored 15, so only Ana and Cy are left.',
        output: 'Ana & Cy',
      },
    ],
    // L3 Sort, Skip & Take
    [
      {
        kind: 'write',
        prompt: 'Print the top three high scores, biggest first.',
        starter: 'int[] scores = [70, 95, 60, 88, 91];\n',
        solution:
          'int[] scores = [70, 95, 60, 88, 91];\nvar top = scores.OrderByDescending(s => s).Take(3);\nConsole.WriteLine(string.Join(" ", top));',
        checks: [
          { label: 'Sort with OrderByDescending', re: '\\.OrderByDescending\\s*\\(\\s*\\w+\\s*=>' },
          { label: 'Keep three with Take(3)', has: '.Take(3)' },
          { label: 'Print the result', re: 'Console\\.Write(Line)?\\s*\\(' },
        ],
        hint: 'Sort high to low first, then Take the first three.',
        explain: 'OrderByDescending puts 95 first; Take(3) stops after 95, 91 and 88.',
        output: '95 91 88',
      },
      {
        kind: 'write',
        prompt: 'Sort the dogs by name length, then A to Z, and show page 2.',
        starter: 'string[] dogs = ["Rex", "Bella", "Max", "Luna", "Bo", "Daisy"];\nint pageSize = 2;\nint page = 2;\n',
        solution:
          'string[] dogs = ["Rex", "Bella", "Max", "Luna", "Bo", "Daisy"];\nint pageSize = 2;\nint page = 2;\nvar shown = dogs\n    .OrderBy(d => d.Length)\n    .ThenBy(d => d)\n    .Skip((page - 1) * pageSize)\n    .Take(pageSize);\nConsole.WriteLine(string.Join(", ", shown));',
        checks: [
          { label: 'OrderBy the name’s Length', re: '\\.OrderBy\\s*\\(\\s*(\\w+)\\s*=>\\s*\\1\\.Length\\s*\\)' },
          { label: 'ThenBy the name itself', re: '\\.ThenBy\\s*\\(\\s*(\\w+)\\s*=>\\s*\\1\\s*\\)' },
          { label: 'Skip the earlier pages', re: '\\.Skip\\s*\\([^;]*page' },
          { label: 'Take one page', re: '\\.Skip[\\s\\S]*\\.Take\\s*\\(\\s*pageSize\\s*\\)' },
        ],
        hint: 'Page 2 starts after (page - 1) * pageSize items. Skip comes before Take.',
        explain: 'Sorted: Bo, Max, Rex, Luna, Bella, Daisy. Skipping the first page of two leaves Rex and Luna on page 2.',
        output: 'Rex, Luna',
      },
    ],
    // L4 Count, Sum & Average
    [
      {
        kind: 'write',
        prompt: 'Print the total, best day, average and 10,000+ days of a step log.',
        starter: 'int[] steps = [8000, 12000, 9500, 15000];\n',
        solution:
          'int[] steps = [8000, 12000, 9500, 15000];\nConsole.WriteLine(steps.Sum());\nConsole.WriteLine(steps.Max());\nConsole.WriteLine(steps.Average());\nConsole.WriteLine(steps.Count(s => s >= 10000));',
        checks: [
          { label: 'The total with Sum()', has: '.Sum()' },
          { label: 'The best day with Max()', has: '.Max()' },
          { label: 'The mean with Average()', has: '.Average()' },
          { label: 'Count the days of 10000 or more with a lambda', re: '\\.Count\\s*\\(\\s*\\w+\\s*=>\\s*\\w+\\s*>=?\\s*(10000|9999)\\b' },
        ],
        hint: 'Each aggregate is one call on steps. Count takes a lambda that says which days to count.',
        explain: 'Each aggregate squashes the array to one value. The average is 44500 / 4 = 11125, a double that happens to be whole.',
        output: '44500\n15000\n11125\n2',
      },
      {
        kind: 'write',
        prompt: 'Report the basket’s total price, priciest item and items under 50.',
        starter:
          'List<Item> basket =\n[\n    new Item { Name = "Lamp", Price = 30 },\n    new Item { Name = "Rug", Price = 120 },\n    new Item { Name = "Mug", Price = 8 },\n];\n\nclass Item\n{\n    public string Name { get; set; } = "";\n    public int Price { get; set; }\n}',
        solution:
          'List<Item> basket =\n[\n    new Item { Name = "Lamp", Price = 30 },\n    new Item { Name = "Rug", Price = 120 },\n    new Item { Name = "Mug", Price = 8 },\n];\nConsole.WriteLine($"Total: {basket.Sum(i => i.Price)}");\nConsole.WriteLine($"Priciest: {basket.MaxBy(i => i.Price)!.Name}");\nConsole.WriteLine($"Under 50: {basket.Count(i => i.Price < 50)}");\n\nclass Item\n{\n    public string Name { get; set; } = "";\n    public int Price { get; set; }\n}',
        checks: [
          { label: 'Sum the prices with Sum(i => i.Price)', re: '\\.Sum\\s*\\(\\s*(\\w+)\\s*=>\\s*\\1\\.Price\\s*\\)' },
          { label: 'Find the priciest item with MaxBy', re: '\\.MaxBy\\s*\\(\\s*(\\w+)\\s*=>\\s*\\1\\.Price\\s*\\)' },
          { label: 'Print that item’s Name', re: 'MaxBy\\s*\\([^)]*\\)\\s*!?\\s*\\??\\.Name|\\w+\\.Name\\s*\\}' },
          { label: 'Count the items under 50', re: '\\.Count\\s*\\(\\s*(\\w+)\\s*=>\\s*\\1\\.Price\\s*<=?\\s*\\d+' },
        ],
        hint: 'Sum and Count take a lambda. MaxBy returns the whole Item, so add .Name.',
        explain: 'MaxBy gives back the Rug object itself, not 120, so you can read any of its properties. ! tells the compiler it isn’t null.',
        output: 'Total: 158\nPriciest: Rug\nUnder 50: 2',
      },
    ],
    // L5 Any, All & First
    [
      {
        kind: 'write',
        prompt: 'Check the guest ages: any under 18, all adults, and the first over 50.',
        starter: 'int[] ages = [34, 17, 52, 29];\n',
        solution:
          'int[] ages = [34, 17, 52, 29];\nConsole.WriteLine(ages.Any(a => a < 18));\nConsole.WriteLine(ages.All(a => a >= 18));\nConsole.WriteLine(ages.First(a => a > 50));',
        checks: [
          { label: 'Any guest under 18 with Any(...)', re: '\\.Any\\s*\\(\\s*(\\w+)\\s*=>\\s*\\1\\s*<=?\\s*1[78]\\b' },
          { label: 'Every guest an adult with All(...)', re: '\\.All\\s*\\(\\s*(\\w+)\\s*=>\\s*\\1\\s*>=?\\s*1[78]\\b' },
          { label: 'The first age over 50 with First(...)', re: '\\.First\\s*\\(\\s*(\\w+)\\s*=>\\s*\\1\\s*>=?\\s*5[01]\\b' },
        ],
        hint: 'Any, All and First each take a lambda; Any and All return a bool.',
        explain: 'One guest is 17, so Any is True and All is False. First stops at the first match, 52.',
        output: 'True\nFalse\n52',
      },
      {
        kind: 'write',
        prompt: 'Stop First from crashing, then say whether the Gold room is listed.',
        starter: 'string[] rooms = ["Blue", "Gold", "Green"];\nstring room = rooms.First(r => r.StartsWith("R"));\nConsole.WriteLine(room);',
        solution:
          'string[] rooms = ["Blue", "Gold", "Green"];\nstring? room = rooms.FirstOrDefault(r => r.StartsWith("R"));\nConsole.WriteLine(room ?? "No R rooms");\nif (rooms.Any(r => r == "Gold"))\n    Console.WriteLine("Gold is free");',
        checks: [
          { label: 'Use FirstOrDefault instead of First', re: '\\.FirstOrDefault\\s*\\(' },
          { label: 'Make the variable string?', re: 'string\\?\\s+\\w+\\s*=' },
          { label: 'Print a fallback with ??', re: '\\?\\?\\s*"[^"]+"' },
          { label: 'Check for Gold with Any(...)', re: '\\.Any\\s*\\([^)]*"Gold"' },
          { label: 'No plain First( left', not: '.First(' },
        ],
        hint: 'No room starts with R, so First throws. FirstOrDefault returns null instead, and ?? swaps in a message.',
        explain: 'FirstOrDefault gives null for a string when nothing matches, so pair it with string? and ??.',
        output: 'No R rooms\nGold is free',
      },
    ],
  ],
};

export default unit;
