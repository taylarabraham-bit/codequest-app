import type { DesktopUnit } from '../../../engine/types';

// Desktop edition: write-the-code challenges for C# unit 16 (Iterators & yield).
// lessons[i] runs after lesson i + 1. See docs/CONTENT_GUIDE.md.
const unit: DesktopUnit = {
  lessons: [
    // L1 Your own foreach
    [
      {
        kind: 'write',
        prompt: 'Make a Playlist class that foreach can loop over.',
        starter: '',
        solution:
          'foreach (string song in new Playlist())\n    Console.WriteLine(song);\n\nclass Playlist\n{\n    public IEnumerator<string> GetEnumerator()\n    {\n        yield return "Intro";\n        yield return "Anthem";\n        yield return "Outro";\n    }\n}',
        checks: [
          { label: 'A class Playlist', re: 'class\\s+Playlist\\b' },
          { label: 'public IEnumerator<string> GetEnumerator()', re: 'public\\s+IEnumerator\\s*<\\s*string\\s*>\\s+GetEnumerator\\s*\\(\\s*\\)' },
          { label: 'yield return three songs', re: '(yield\\s+return\\s+"[^"]*"\\s*;[\\s\\S]*){3}' },
          { label: 'Loop over a Playlist with foreach', re: 'foreach\\s*\\(\\s*(string|var)\\s+\\w+\\s+in\\s+(new\\s+Playlist\\s*\\(\\s*\\)|\\w+)\\s*\\)' },
        ],
        hint: 'GetEnumerator is an iterator: each yield return hands foreach the next song.',
        explain: 'foreach only needs a GetEnumerator() method. The iterator pauses after each yield return until the loop asks for more.',
        output: 'Intro\nAnthem\nOutro',
      },
      {
        kind: 'write',
        prompt: 'Make Shelf an IEnumerable<string> so LINQ works on it.',
        starter:
          'var shelf = new Shelf(["Dune", "Emma", "Ulysses"]);\n// print the 4-letter titles, then how many books there are\n\nclass Shelf(string[] books)\n{\n    public IEnumerator<string> GetEnumerator()\n    {\n        foreach (string b in books) yield return b;\n    }\n}',
        solution:
          'using System.Collections;\n\nvar shelf = new Shelf(["Dune", "Emma", "Ulysses"]);\nforeach (string b in shelf.Where(t => t.Length == 4))\n    Console.WriteLine(b);\nConsole.WriteLine(shelf.Count());\n\nclass Shelf(string[] books) : IEnumerable<string>\n{\n    public IEnumerator<string> GetEnumerator()\n    {\n        foreach (string b in books) yield return b;\n    }\n    IEnumerator IEnumerable.GetEnumerator() => GetEnumerator();\n}',
        checks: [
          { label: 'Shelf implements IEnumerable<string>', re: 'class\\s+Shelf[^{]*:\\s*IEnumerable\\s*<\\s*string\\s*>' },
          { label: 'Add the non-generic IEnumerable.GetEnumerator()', re: 'IEnumerator\\s+(System\\.Collections\\.)?IEnumerable\\.GetEnumerator\\s*\\(\\s*\\)' },
          { label: 'Filter the 4-letter titles with Where', re: 'shelf\\s*\\.Where\\s*\\([^)]*Length\\s*==\\s*4' },
          { label: 'Print the count with Count()', re: 'shelf\\s*\\.Count\\s*\\(\\s*\\)' },
        ],
        hint: 'The old IEnumerable needs its own GetEnumerator too: add using System.Collections; and forward it to yours.',
        explain: 'LINQ’s Where and Count extend IEnumerable<T>, so they light up once Shelf implements it.',
        output: 'Dune\nEmma\n3',
      },
    ],
    // L2 Generators
    [
      {
        kind: 'write',
        prompt: 'Generate the first n square numbers with yield return.',
        starter: '',
        solution:
          'Console.WriteLine(string.Join(" ", Squares(5)));\n\nIEnumerable<int> Squares(int n)\n{\n    for (int i = 1; i <= n; i++)\n        yield return i * i;\n}',
        checks: [
          { label: 'A method IEnumerable<int> Squares(int n)', re: 'IEnumerable\\s*<\\s*int\\s*>\\s+Squares\\s*\\(\\s*int\\s+\\w+\\s*\\)' },
          { label: 'A loop inside it', re: 'Squares\\s*\\(\\s*int[\\s\\S]*(for|while)\\s*\\(' },
          { label: 'yield return each square', re: 'yield\\s+return\\s+(\\w+)\\s*\\*\\s*\\1\\s*;' },
          { label: 'Print Squares(5)', re: 'Squares\\s*\\(\\s*5\\s*\\)' },
        ],
        hint: 'Loop i from 1 to n and yield return i * i; no list needed.',
        explain: 'Each square is worked out only when it’s asked for. string.Join pulls all five.',
        output: '1 4 9 16 25',
      },
      {
        kind: 'write',
        prompt: 'Yield the savings balance each month, and stop once it reaches the goal.',
        starter:
          'foreach (int b in Savings(50, 200))\n    Console.WriteLine(b);\n\nIEnumerable<int> Savings(int monthly, int goal)\n{\n    // keep a running balance; stop once it reaches the goal\n}',
        solution:
          'foreach (int b in Savings(50, 200))\n    Console.WriteLine(b);\n\nIEnumerable<int> Savings(int monthly, int goal)\n{\n    int balance = 0;\n    while (true)\n    {\n        balance += monthly;\n        yield return balance;\n        if (balance >= goal) yield break;\n    }\n}',
        checks: [
          { label: 'Keep a running balance that starts at 0', re: 'int\\s+\\w+\\s*=\\s*0\\s*;' },
          { label: 'Add the monthly amount each pass', re: '\\+=\\s*monthly|=\\s*\\w+\\s*\\+\\s*monthly' },
          { label: 'yield return the balance', re: 'yield\\s+return\\s+\\w+\\s*;' },
          { label: 'Stop with yield break once it reaches the goal', re: 'goal[^;]*\\)\\s*yield\\s+break\\s*;|goal[^;]*\\)\\s*\\{\\s*yield\\s+break' },
        ],
        hint: 'Loop forever with while (true); after each yield return, check the goal and yield break.',
        explain: 'The balance variable survives between yields, so it keeps growing. yield break ends the sequence at 200.',
        output: '50\n100\n150\n200',
      },
    ],
    // L3 Lazy & deferred
    [
      {
        kind: 'write',
        prompt: 'Show that the query runs only when you call ToList().',
        starter:
          'IEnumerable<int> Prices()\n{\n    Console.WriteLine("Reading prices");\n    yield return 4;\n    yield return 15;\n    yield return 8;\n}',
        solution:
          'var cheap = Prices().Where(p => p < 10);\nConsole.WriteLine("Query built");\nList<int> list = cheap.ToList();\nConsole.WriteLine($"Found {list.Count}");\n\nIEnumerable<int> Prices()\n{\n    Console.WriteLine("Reading prices");\n    yield return 4;\n    yield return 15;\n    yield return 8;\n}',
        checks: [
          { label: 'Build a Where query on Prices() under 10', re: 'Prices\\s*\\(\\s*\\)\\s*\\.Where\\s*\\([^)]*<\\s*10' },
          { label: 'Print a line after building it, before ToList', re: '\\.Where[\\s\\S]*Console\\.WriteLine[\\s\\S]*\\.ToList\\s*\\(\\s*\\)' },
          { label: 'Run it with ToList()', re: '\\w+\\.ToList\\s*\\(\\s*\\)' },
          { label: 'Print how many were found', re: '\\.Count\\b' },
        ],
        hint: 'Store the query in a var, print something, then call .ToList() on it.',
        explain: 'Building the query reads nothing, so Query built prints first. ToList() is what makes the iterator run.',
        output: 'Query built\nReading prices\nFound 2',
      },
      {
        kind: 'write',
        prompt: 'The dice roll twice. Make the query run only once.',
        starter:
          'var rolls = Roll().Select(n => n * 10);\nConsole.WriteLine(rolls.Sum());\nConsole.WriteLine(rolls.Max());\n\nIEnumerable<int> Roll()\n{\n    Console.WriteLine("Rolling...");\n    yield return 3;\n    yield return 6;\n    yield return 2;\n}',
        solution:
          'var rolls = Roll().Select(n => n * 10).ToList();\nConsole.WriteLine(rolls.Sum());\nConsole.WriteLine(rolls.Max());\n\nIEnumerable<int> Roll()\n{\n    Console.WriteLine("Rolling...");\n    yield return 3;\n    yield return 6;\n    yield return 2;\n}',
        checks: [
          { label: 'Store the results with ToList() or ToArray()', re: 'Roll\\s*\\(\\s*\\)[^;]*\\.To(List|Array)\\s*\\(\\s*\\)' },
          { label: 'Still print the Sum()', has: '.Sum()' },
          { label: 'Still print the Max()', has: '.Max()' },
        ],
        hint: 'Each Sum or Max loops again, and each loop reruns Roll(). Save the results once.',
        explain: 'A lazy query reruns every time you loop. ToList() runs it once, so Rolling... prints once.',
        output: 'Rolling...\n110\n60',
      },
    ],
    // L4 Infinite sequences
    [
      {
        kind: 'write',
        prompt: 'Write an endless ticket-number generator and print the first three.',
        starter: '',
        solution:
          'foreach (string t in Tickets().Take(3))\n    Console.WriteLine(t);\n\nIEnumerable<string> Tickets()\n{\n    for (int n = 101; ; n++)\n        yield return $"T-{n}";\n}',
        checks: [
          { label: 'An iterator returning IEnumerable<string>', re: 'IEnumerable\\s*<\\s*string\\s*>\\s+\\w+\\s*\\(\\s*\\)' },
          { label: 'An endless loop inside it', re: 'for\\s*\\([^;]*;\\s*;|while\\s*\\(\\s*true\\s*\\)' },
          { label: 'yield return each ticket', re: 'yield\\s+return\\s+' },
          { label: 'Take(3) of them', has: '.Take(3)' },
        ],
        hint: 'for (int n = 101; ; n++) loops forever. Take(3) stops pulling after three.',
        explain: 'The loop is endless, but the iterator only runs when asked, so Take(3) gets three tickets and stops.',
        output: 'T-101\nT-102\nT-103',
      },
      {
        kind: 'write',
        prompt: 'This never ends. Print powers under 100, then the first one over 1000.',
        starter:
          'var all = Powers().ToList();\nConsole.WriteLine(all.Count);\n\nIEnumerable<int> Powers()\n{\n    int p = 1;\n    while (true)\n    {\n        yield return p;\n        p *= 2;\n    }\n}',
        solution:
          'var under = Powers().TakeWhile(p => p < 100);\nConsole.WriteLine(string.Join(" ", under));\nConsole.WriteLine(Powers().First(p => p > 1000));\n\nIEnumerable<int> Powers()\n{\n    int p = 1;\n    while (true)\n    {\n        yield return p;\n        p *= 2;\n    }\n}',
        checks: [
          { label: 'No ToList() on the endless sequence', not: '.ToList()' },
          { label: 'No Count on it either', not: '.Count' },
          { label: 'TakeWhile the powers under 100', re: '\\.TakeWhile\\s*\\(\\s*(\\w+)\\s*=>\\s*\\1\\s*<=?\\s*(100|99)\\b' },
          { label: 'First power over 1000', re: '\\.First\\s*\\(\\s*(\\w+)\\s*=>\\s*\\1\\s*>=?\\s*(1000|1001)\\b' },
          { label: 'Keep Powers() endless', re: 'while\\s*\\(\\s*true\\s*\\)|for\\s*\\([^;]*;\\s*;' },
        ],
        hint: 'TakeWhile stops at the first item that fails the test; First stops at the first that passes.',
        explain: 'ToList and Count try to read every item, which never ends. TakeWhile and First pull only what they need.',
        output: '1 2 4 8 16 32 64\n1024',
      },
    ],
    // L5 IEnumerator & async streams
    [
      {
        kind: 'write',
        prompt: 'Number the queue by stepping through it with MoveNext and Current.',
        starter: 'List<string> queue = ["Ana", "Ben", "Cleo"];\n',
        solution:
          'List<string> queue = ["Ana", "Ben", "Cleo"];\nIEnumerator<string> e = queue.GetEnumerator();\nint pos = 1;\nwhile (e.MoveNext())\n{\n    Console.WriteLine($"{pos}. {e.Current}");\n    pos++;\n}',
        checks: [
          { label: 'Get an enumerator with GetEnumerator()', re: 'queue\\s*\\.GetEnumerator\\s*\\(\\s*\\)' },
          { label: 'Loop with while (e.MoveNext())', re: 'while\\s*\\(\\s*\\w+\\.MoveNext\\s*\\(\\s*\\)\\s*\\)' },
          { label: 'Read each name from Current', re: '\\w+\\.Current\\b' },
          { label: 'No foreach this time', not: 'foreach' },
        ],
        hint: 'MoveNext() steps forward and returns false at the end; Current is the item you’re on.',
        explain: 'This is what foreach writes for you: call MoveNext until it returns false, reading Current each time.',
        output: '1. Ana\n2. Ben\n3. Cleo',
      },
      {
        kind: 'write',
        prompt: 'Make the news feed an async stream and step through it with MoveNextAsync.',
        starter:
          'IEnumerator<string> e = News().GetEnumerator();\nwhile (e.MoveNext())\n    Console.WriteLine($"Breaking: {e.Current}");\n\nIEnumerable<string> News()\n{\n    string[] headlines = ["Rain tomorrow", "Team wins cup"];\n    foreach (string h in headlines)\n    {\n        Thread.Sleep(100);\n        yield return h;\n    }\n}',
        solution:
          'await using var e = NewsAsync().GetAsyncEnumerator();\nwhile (await e.MoveNextAsync())\n    Console.WriteLine($"Breaking: {e.Current}");\n\nasync IAsyncEnumerable<string> NewsAsync()\n{\n    string[] headlines = ["Rain tomorrow", "Team wins cup"];\n    foreach (string h in headlines)\n    {\n        await Task.Delay(100);\n        yield return h;\n    }\n}',
        checks: [
          { label: 'Return async IAsyncEnumerable<string>', re: 'async\\s+IAsyncEnumerable\\s*<\\s*string\\s*>\\s+\\w+\\s*\\(' },
          { label: 'await Task.Delay instead of Thread.Sleep', re: 'await\\s+Task\\.Delay\\s*\\(' },
          { label: 'No Thread.Sleep', not: 'Thread.Sleep' },
          { label: 'Get it with GetAsyncEnumerator()', re: '\\.GetAsyncEnumerator\\s*\\(\\s*\\)' },
          { label: 'Loop with while (await e.MoveNextAsync())', re: 'while\\s*\\(\\s*await\\s+\\w+\\.MoveNextAsync\\s*\\(\\s*\\)\\s*\\)' },
          { label: 'Print each Current', re: '\\w+\\.Current\\b' },
        ],
        hint: 'Same shape as before, with Async names and awaits. await using disposes the enumerator at the end.',
        explain: 'await foreach writes exactly this loop for you: await MoveNextAsync(), read Current, repeat.',
        output: 'Breaking: Rain tomorrow\nBreaking: Team wins cup',
      },
    ],
  ],
};

export default unit;
