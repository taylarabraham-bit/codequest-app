import type { DesktopUnit } from '../../../engine/types';

// Desktop edition: write-the-code challenges for C# unit 10 (Collections & generics).
// lessons[i] runs after lesson i + 1. See docs/CONTENT_GUIDE.md.
const unit: DesktopUnit = {
  lessons: [
    // L1 List<T> basics
    [
      {
        kind: 'write',
        prompt: 'Build a to-do list: add three tasks, remove one, print the count and first.',
        starter: '',
        solution:
          'List<string> todo = [];\ntodo.Add("Laundry");\ntodo.Add("Email Sam");\ntodo.Add("Water plants");\ntodo.Remove("Laundry");\nConsole.WriteLine(todo.Count);\nConsole.WriteLine(todo[0]);',
        checks: [
          { label: 'An empty List<string>', re: 'List<string>\\s+\\w+\\s*=\\s*(\\[\\s*\\]|new\\s*(List<string>\\s*)?\\(\\s*\\))|var\\s+\\w+\\s*=\\s*new\\s+List<string>\\s*\\(\\s*\\)' },
          { label: 'Add three tasks with .Add()', re: '(\\.Add\\s*\\(\\s*"[^"]*"\\s*\\)\\s*;[\\s\\S]*){3}' },
          { label: 'Remove one with .Remove()', re: '\\.Remove\\s*\\(\\s*"[^"]*"\\s*\\)' },
          { label: 'Print .Count', re: 'WriteLine\\s*\\(\\s*\\w+\\.Count\\s*\\)' },
          { label: 'Print the first with [0]', re: 'WriteLine\\s*\\(\\s*\\w+\\[\\s*0\\s*\\]\\s*\\)' },
        ],
        hint: 'A List grows with .Add(). Count has no brackets; [0] reads the first item.',
        explain: 'After removing Laundry, the list shifts down: 2 items, and Email Sam is now at index 0.',
        output: '2\nEmail Sam',
      },
      {
        kind: 'write',
        prompt: 'Invite Dev only if missing, cancel Ben, then print every guest and the count.',
        starter: 'List<string> guests = ["Ana", "Ben", "Cleo"];\n',
        solution:
          'List<string> guests = ["Ana", "Ben", "Cleo"];\nif (!guests.Contains("Dev")) guests.Add("Dev");\nguests.Remove("Ben");\nforeach (string guest in guests) Console.WriteLine(guest);\nConsole.WriteLine($"{guests.Count} guests");',
        checks: [
          { label: 'Check with !guests.Contains("Dev")', re: 'if\\s*\\(\\s*!\\s*guests\\.Contains\\s*\\(\\s*"Dev"\\s*\\)\\s*\\)' },
          { label: 'Then add Dev', re: 'guests\\.Add\\s*\\(\\s*"Dev"\\s*\\)' },
          { label: 'Remove Ben', re: 'guests\\.Remove\\s*\\(\\s*"Ben"\\s*\\)|guests\\.RemoveAt\\s*\\(\\s*1\\s*\\)' },
          { label: 'Print each guest with foreach', re: 'foreach\\s*\\(\\s*(string|var)\\s+\\w+\\s+in\\s+guests\\s*\\)' },
          { label: 'Print guests.Count', re: 'WriteLine\\s*\\([^;]*guests\\.Count' },
        ],
        hint: 'Contains returns a bool, so ! flips it: "not already there".',
        explain: 'Dev joins at the end, Ben leaves, and the rest shift up: Ana, Cleo, Dev.',
        output: 'Ana\nCleo\nDev\n3 guests',
      },
    ],
    // L2 Dictionary lookups
    [
      {
        kind: 'write',
        prompt: 'Store capitals in a Dictionary, add one more, and look one up by country.',
        starter: '',
        solution:
          'var capitals = new Dictionary<string, string>\n{\n    ["France"] = "Paris",\n    ["Japan"] = "Tokyo",\n};\ncapitals["Peru"] = "Lima";\nConsole.WriteLine(capitals["Japan"]);\nConsole.WriteLine(capitals.Count);',
        checks: [
          { label: 'A Dictionary<string, string>', re: 'Dictionary<\\s*string\\s*,\\s*string\\s*>' },
          { label: 'Add one later with name["key"] = value', re: '^\\s*\\w+\\[\\s*"[^"]+"\\s*\\]\\s*=\\s*"[^"]*"\\s*;', flags: 'm' },
          { label: 'Print one value by its key', re: 'WriteLine\\s*\\(\\s*\\w+\\[\\s*"[^"]+"\\s*\\]\\s*\\)' },
          { label: 'Print how many with .Count', re: 'WriteLine\\s*\\(\\s*\\w+\\.Count\\s*\\)' },
        ],
        hint: 'Start with ["France"] = "Paris" entries inside { }, then use capitals["Peru"] = ... later.',
        explain: 'Each key maps to one value; d[key] reads it and d[key] = value adds or replaces it. Three keys in all.',
        output: 'Tokyo\n3',
      },
      {
        kind: 'write',
        prompt: 'Report each wanted part with TryGetValue, restock screws, then list all stock.',
        starter: 'var stock = new Dictionary<string, int> { ["bolts"] = 40, ["nuts"] = 25 };\nstring[] wanted = ["bolts", "screws", "nuts"];\n',
        solution:
          'var stock = new Dictionary<string, int> { ["bolts"] = 40, ["nuts"] = 25 };\nstring[] wanted = ["bolts", "screws", "nuts"];\nforeach (string item in wanted)\n{\n    if (stock.TryGetValue(item, out int count))\n        Console.WriteLine($"{item}: {count}");\n    else\n        Console.WriteLine($"{item}: none");\n}\nstock["screws"] = 10;\nforeach (var kv in stock) Console.WriteLine($"{kv.Key} = {kv.Value}");',
        checks: [
          { label: 'Loop over wanted', re: 'foreach\\s*\\([^)]*\\bin\\s+wanted\\s*\\)' },
          { label: 'Look up with TryGetValue(item, out int count)', re: 'stock\\.TryGetValue\\s*\\(\\s*\\w+\\s*,\\s*out\\s+(int|var)\\s+\\w+\\s*\\)' },
          { label: 'An else for parts not in stock', re: '\\belse\\b' },
          { label: 'Restock with stock["screws"] = ...', re: 'stock\\[\\s*"screws"\\s*\\]\\s*=\\s*\\d+' },
          { label: 'List every pair with .Key and .Value', re: 'foreach\\s*\\([^)]*\\bin\\s+stock\\s*\\)[\\s\\S]*\\.Key\\b[\\s\\S]*\\.Value\\b' },
        ],
        hint: 'TryGetValue returns false instead of crashing when the key is missing.',
        explain: 'screws isn’t a key yet, so TryGetValue is false and none prints. After restocking, the dictionary has three pairs.',
        output: 'bolts: 40\nscrews: none\nnuts: 25\nbolts = 40\nnuts = 25\nscrews = 10',
      },
    ],
    // L3 Generic methods
    [
      {
        kind: 'write',
        prompt: 'Write a generic Head<T> that returns an array’s first item; use it twice.',
        starter: '',
        solution:
          'int[] ages = [31, 25, 40];\nstring[] pets = ["cat", "owl"];\nConsole.WriteLine(Head<int>(ages));\nConsole.WriteLine(Head(pets));\n\nT Head<T>(T[] items) => items[0];',
        checks: [
          { label: 'T Name<T>(T[] items)', re: 'T\\s+\\w+\\s*<\\s*T\\s*>\\s*\\(\\s*T\\s*\\[\\s*\\]\\s+\\w+\\s*\\)' },
          { label: 'Return the first item', re: '(=>|return)\\s*\\w+\\[\\s*0\\s*\\]' },
          { label: 'Call it with <int> on an int array', re: '\\w+\\s*<\\s*int\\s*>\\s*\\(\\s*\\w+\\s*\\)' },
          { label: 'Call it again and let C# infer T', re: 'WriteLine\\s*\\(\\s*\\w+\\s*\\(\\s*\\w+\\s*\\)\\s*\\)' },
        ],
        hint: 'Put <T> after the method name, then use T for the return type and the array type.',
        explain: 'One method serves both arrays: T is int in the first call and string (inferred) in the second.',
        output: '31\ncat',
      },
      {
        kind: 'write',
        prompt: 'Write a generic Swap<T> with ref parameters and swap both pairs.',
        starter: 'int a = 1, b = 2;\nstring x = "left", y = "right";\n',
        solution:
          'int a = 1, b = 2;\nstring x = "left", y = "right";\nSwap(ref a, ref b);\nSwap<string>(ref x, ref y);\nConsole.WriteLine($"{a} {b}");\nConsole.WriteLine($"{x} {y}");\n\nvoid Swap<T>(ref T first, ref T second)\n{\n    T temp = first;\n    first = second;\n    second = temp;\n}',
        checks: [
          { label: 'void Swap<T>(ref T first, ref T second)', re: 'void\\s+Swap\\s*<\\s*T\\s*>\\s*\\(\\s*ref\\s+T\\s+\\w+\\s*,\\s*ref\\s+T\\s+\\w+\\s*\\)' },
          { label: 'Swap the values inside (a temp T works)', re: 'T\\s+\\w+\\s*=\\s*\\w+\\s*;|\\(\\s*\\w+\\s*,\\s*\\w+\\s*\\)\\s*=\\s*\\(' },
          { label: 'Swap the ints with ref', re: 'Swap\\s*(<\\s*int\\s*>)?\\s*\\(\\s*ref\\s+(a\\s*,\\s*ref\\s+b|b\\s*,\\s*ref\\s+a)\\s*\\)' },
          { label: 'Swap the strings with ref', re: 'Swap\\s*(<\\s*string\\s*>)?\\s*\\(\\s*ref\\s+(x\\s*,\\s*ref\\s+y|y\\s*,\\s*ref\\s+x)\\s*\\)' },
          { label: 'Print both pairs', re: '(Console\\.WriteLine[\\s\\S]*){2}' },
        ],
        hint: 'Hold one value in a temp variable of type T while you overwrite it.',
        explain: 'ref lets Swap change the caller’s variables, and T lets the same code swap ints and strings.',
        output: '2 1\nright left',
      },
    ],
    // L4 Generic classes
    [
      {
        kind: 'write',
        prompt: 'Write a generic Pair<T> class and use it with ints and with strings.',
        starter: '',
        solution:
          'var dice = new Pair<int>(3, 5);\nvar names = new Pair<string>("Rio", "Mae");\nConsole.WriteLine(dice.First + dice.Second);\nConsole.WriteLine($"{names.First} & {names.Second}");\n\nclass Pair<T>\n{\n    public T First;\n    public T Second;\n    public Pair(T first, T second)\n    {\n        First = first;\n        Second = second;\n    }\n}',
        checks: [
          { label: 'class Pair<T>', re: 'class\\s+Pair\\s*<\\s*T\\s*>' },
          { label: 'Two members of type T', re: '(public\\s+T\\s+\\w+[\\s\\S]*){2}' },
          { label: 'A constructor taking (T first, T second)', re: 'Pair\\s*\\(\\s*T\\s+\\w+\\s*,\\s*T\\s+\\w+\\s*\\)' },
          { label: 'A Pair<int>', re: 'new\\s+Pair\\s*<\\s*int\\s*>\\s*\\(' },
          { label: 'A Pair<string>', re: 'new\\s+Pair\\s*<\\s*string\\s*>\\s*\\(' },
        ],
        hint: 'Write <T> after the class name and use T wherever the type should vary.',
        explain: 'Pair<int> has int fields, so they add up to 8; Pair<string> holds two names.',
        output: '8\nRio & Mae',
      },
      {
        kind: 'write',
        prompt: 'Write Cart<T> where T : IPriced, with Add and a Total of all prices.',
        starter:
          'var cart = new Cart<Book>();\ncart.Add(new Book(12));\ncart.Add(new Book(30));\nConsole.WriteLine(cart.Total());\n\ninterface IPriced { int Price { get; } }\n\nclass Book : IPriced\n{\n    public int Price { get; }\n    public Book(int price) { Price = price; }\n}',
        solution:
          'var cart = new Cart<Book>();\ncart.Add(new Book(12));\ncart.Add(new Book(30));\nConsole.WriteLine(cart.Total());\n\ninterface IPriced { int Price { get; } }\n\nclass Book : IPriced\n{\n    public int Price { get; }\n    public Book(int price) { Price = price; }\n}\n\nclass Cart<T> where T : IPriced\n{\n    private List<T> items = [];\n    public void Add(T item) => items.Add(item);\n    public int Total()\n    {\n        int sum = 0;\n        foreach (T item in items) sum += item.Price;\n        return sum;\n    }\n}',
        checks: [
          { label: 'class Cart<T> where T : IPriced', re: 'class\\s+Cart\\s*<\\s*T\\s*>\\s*where\\s+T\\s*:\\s*IPriced\\b' },
          { label: 'Keep the items in a List<T>', re: 'List\\s*<\\s*T\\s*>' },
          { label: 'public void Add(T item)', re: 'public\\s+void\\s+Add\\s*\\(\\s*T\\s+\\w+\\s*\\)' },
          { label: 'public int Total() adds up each .Price', re: 'public\\s+int\\s+Total\\s*\\(\\s*\\)[\\s\\S]*\\.Price\\b' },
        ],
        hint: 'The where clause is what lets Cart read item.Price from a T.',
        explain: 'Because T must be IPriced, every item has a Price. 12 + 30 is 42.',
        output: '42',
      },
    ],
    // L5 IEnumerable & yield
    [
      {
        kind: 'write',
        prompt: 'Write an iterator that yields the even numbers up to a limit.',
        starter: '',
        solution:
          'foreach (int n in Evens(8)) Console.WriteLine(n);\n\nIEnumerable<int> Evens(int max)\n{\n    for (int i = 2; i <= max; i += 2) yield return i;\n}',
        checks: [
          { label: 'A method returning IEnumerable<int>', re: 'IEnumerable\\s*<\\s*int\\s*>\\s+\\w+\\s*\\(\\s*int\\s+\\w+\\s*\\)' },
          { label: 'Hand out each number with yield return', re: 'yield\\s+return\\s+\\w+' },
          { label: 'foreach over a call to it', re: 'foreach\\s*\\([^)]*\\bin\\s+\\w+\\s*\\(' },
        ],
        hint: 'An iterator’s return type is IEnumerable<int>, and it uses yield return instead of return.',
        explain: 'Each yield return hands one number to the foreach, then the iterator picks up where it left off.',
        output: '2\n4\n6\n8',
      },
      {
        kind: 'write',
        prompt: 'Write UntilHot: yield readings until one tops 30, then stop. Use it on both.',
        starter: 'int[] temps = [18, 21, 25, 31, 22];\nList<int> more = [15, 19, 35, 20];\n',
        solution:
          'int[] temps = [18, 21, 25, 31, 22];\nList<int> more = [15, 19, 35, 20];\nConsole.WriteLine(string.Join(", ", UntilHot(temps)));\nConsole.WriteLine(string.Join(", ", UntilHot(more)));\n\nIEnumerable<int> UntilHot(IEnumerable<int> readings)\n{\n    foreach (int t in readings)\n    {\n        if (t > 30) yield break;\n        yield return t;\n    }\n}',
        checks: [
          { label: 'Take and return IEnumerable<int>', re: 'IEnumerable\\s*<\\s*int\\s*>\\s+\\w+\\s*\\(\\s*IEnumerable\\s*<\\s*int\\s*>\\s+\\w+\\s*\\)' },
          { label: 'yield break when a reading tops 30', re: 'if\\s*\\([^)]*\\b3[01]\\b[^)]*\\)\\s*\\{?\\s*yield\\s+break\\s*;' },
          { label: 'yield return the others', re: 'yield\\s+return\\s+\\w+' },
          { label: 'Use it on the array and the list', re: '(?=[\\s\\S]*\\w+\\s*\\(\\s*temps\\s*\\))(?=[\\s\\S]*\\w+\\s*\\(\\s*more\\s*\\))' },
        ],
        hint: 'One IEnumerable<int> parameter accepts both an int[] and a List<int>.',
        explain: 'yield break ends the sequence at 31 and at 35, so later readings never come out.',
        output: '18, 21, 25\n15, 19',
      },
    ],
  ],
};

export default unit;
