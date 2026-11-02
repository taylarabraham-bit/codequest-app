import type { DesktopUnit } from '../../../engine/types';

// Desktop edition: write-the-code challenges for C# unit 18 (Generics in depth).
// lessons[i] runs after lesson i + 1. See docs/CONTENT_GUIDE.md.
const unit: DesktopUnit = {
  lessons: [
    // L1 Many type parameters
    [
      {
        kind: 'write',
        prompt: 'Write a generic Label method with two type parameters, and call it three ways.',
        starter: '',
        solution:
          'Console.WriteLine(Label("Seat", 14));\nConsole.WriteLine(Label("Open", true));\nConsole.WriteLine(Label(\'A\', "Gold"));\n\nstring Label<TName, TValue>(TName name, TValue value) => $"{name} = {value}";',
        checks: [
          { label: 'A method with two type parameters', re: '\\w+\\s+\\w+\\s*<\\s*\\w+\\s*,\\s*\\w+\\s*>\\s*\\(' },
          { label: 'One parameter of each type', re: '<\\s*(\\w+)\\s*,\\s*(\\w+)\\s*>\\s*\\(\\s*\\1\\s+\\w+\\s*,\\s*\\2\\s+\\w+\\s*\\)' },
          { label: 'Call it three times with different types', re: '(Console\\.WriteLine\\s*\\(\\s*\\w+\\s*\\([^;]*,[^;]*\\)\\s*\\)\\s*;[\\s\\S]*){3}' },
        ],
        hint: 'string Label<TName, TValue>(TName name, TValue value) => ...; C# works out the types from each call.',
        explain: 'Each call infers its own types: string and int, string and bool, char and string. bool prints as True.',
        output: 'Seat = 14\nOpen = True\nA = Gold',
      },
      {
        kind: 'write',
        prompt: 'Write Map, inferred from a lambda, and Fresh, which needs its type written out.',
        starter:
          'string[] fruit = ["kiwi", "fig", "banana"];\nint[] lengths = Map(fruit, s => s.Length);\nConsole.WriteLine(string.Join(", ", lengths));\nList<string> log = Fresh<string>();\nlog.Add("started");\nConsole.WriteLine(log.Count);\n\n// write Map and Fresh here',
        solution:
          'string[] fruit = ["kiwi", "fig", "banana"];\nint[] lengths = Map(fruit, s => s.Length);\nConsole.WriteLine(string.Join(", ", lengths));\nList<string> log = Fresh<string>();\nlog.Add("started");\nConsole.WriteLine(log.Count);\n\nTOut[] Map<TIn, TOut>(TIn[] items, Func<TIn, TOut> f)\n{\n    var result = new TOut[items.Length];\n    for (int i = 0; i < items.Length; i++) result[i] = f(items[i]);\n    return result;\n}\nList<T> Fresh<T>() => new List<T>();',
        checks: [
          { label: 'Map<TIn, TOut>(TIn[] items, Func<TIn, TOut> f)', re: '(\\w+)\\s*\\[\\s*\\]\\s+Map\\s*<\\s*(\\w+)\\s*,\\s*\\1\\s*>\\s*\\(\\s*\\2\\s*\\[\\s*\\]\\s*\\w+\\s*,\\s*Func\\s*<\\s*\\2\\s*,\\s*\\1\\s*>\\s*\\w+\\s*\\)' },
          { label: 'Map calls the function on every item', re: 'Map\\s*<[\\s\\S]*(for|foreach)\\s*\\([\\s\\S]*\\w+\\s*\\(\\s*\\w+(\\s*\\[\\s*\\w+\\s*\\])?\\s*\\)' },
          { label: 'List<T> Fresh<T>() returns a new list', re: 'List\\s*<\\s*(\\w+)\\s*>\\s+Fresh\\s*<\\s*\\1\\s*>\\s*\\(\\s*\\)\\s*(=>|\\{)[\\s\\S]*new' },
        ],
        hint: 'Map returns TOut[]; fill a new TOut[items.Length] in a for loop. Fresh just returns new List<T>().',
        explain: 'Map’s TOut is inferred from what the lambda returns (int). Fresh’s T appears only in the return type, so you must write Fresh<string>().',
        output: '4, 3, 6\n1',
      },
    ],
    // L2 Constraints
    [
      {
        kind: 'write',
        prompt: 'Write Largest<T>, constrained to IComparable<T>, and use it on ints and strings.',
        starter: 'int[] scores = [3, 9, 4];\nstring[] fruit = ["pear", "apple", "plum"];\n',
        solution:
          'int[] scores = [3, 9, 4];\nstring[] fruit = ["pear", "apple", "plum"];\nConsole.WriteLine(Largest(scores));\nConsole.WriteLine(Largest(fruit));\n\nT Largest<T>(T[] items) where T : IComparable<T>\n{\n    T best = items[0];\n    foreach (T x in items)\n        if (x.CompareTo(best) > 0) best = x;\n    return best;\n}',
        checks: [
          { label: 'T Largest<T>(T[] items)', re: 'T\\s+Largest\\s*<\\s*T\\s*>\\s*\\(\\s*T\\s*\\[\\s*\\]\\s*\\w+\\s*\\)' },
          { label: 'where T : IComparable<T>', re: 'where\\s+T\\s*:\\s*IComparable\\s*<\\s*T\\s*>' },
          { label: 'Compare with CompareTo', re: '\\.CompareTo\\s*\\(' },
          { label: 'Call it on scores and on fruit', re: 'Largest\\s*\\(\\s*scores\\s*\\)[\\s\\S]*Largest\\s*\\(\\s*fruit\\s*\\)|Largest\\s*\\(\\s*fruit\\s*\\)[\\s\\S]*Largest\\s*\\(\\s*scores\\s*\\)' },
        ],
        hint: 'Without the constraint, the compiler won’t let you call CompareTo on a T.',
        explain: 'The constraint promises every T can be compared, so one method works for numbers and for text.',
        output: '9\nplum',
      },
      {
        kind: 'write',
        prompt: 'Constrain Greet<T> so it compiles, then add a Spanish greeter.',
        starter:
          'Console.WriteLine(Greet<English>());\nConsole.WriteLine(Greet<French>());\n\nstring Greet<T>() => new T().Hello();\n\ninterface IGreeter { string Hello(); }\nclass English : IGreeter { public string Hello() => "Hello"; }\nclass French : IGreeter { public string Hello() => "Bonjour"; }',
        solution:
          'Console.WriteLine(Greet<English>());\nConsole.WriteLine(Greet<French>());\nConsole.WriteLine(Greet<Spanish>());\n\nstring Greet<T>() where T : IGreeter, new() => new T().Hello();\n\ninterface IGreeter { string Hello(); }\nclass English : IGreeter { public string Hello() => "Hello"; }\nclass French : IGreeter { public string Hello() => "Bonjour"; }\nclass Spanish : IGreeter { public string Hello() => "Hola"; }',
        checks: [
          { label: 'where T : IGreeter, new()', re: 'where\\s+T\\s*:\\s*IGreeter\\s*,\\s*new\\s*\\(\\s*\\)' },
          { label: 'A third class that implements IGreeter', re: '(class\\s+\\w+\\s*:\\s*IGreeter[\\s\\S]*){3}' },
          { label: 'Greet the new class too', re: '(Greet\\s*<\\s*\\w+\\s*>\\s*\\(\\s*\\)[\\s\\S]*){3}' },
        ],
        hint: 'new T() needs new(), and .Hello() needs the interface. new() always goes last.',
        explain: 'Each constraint unlocks something: IGreeter lets you call Hello, and new() lets you write new T().',
        output: 'Hello\nBonjour\nHola',
      },
    ],
    // L3 default & per-type statics
    [
      {
        kind: 'write',
        prompt: 'Write PeekOrDefault<T>: the first item, or default when the list is empty.',
        starter: 'List<int> noScores = [];\nList<string> noNames = [];\nList<int> laps = [7, 8];\n',
        solution:
          'List<int> noScores = [];\nList<string> noNames = [];\nList<int> laps = [7, 8];\nConsole.WriteLine(PeekOrDefault(noScores));\nConsole.WriteLine(PeekOrDefault(noNames) is null);\nConsole.WriteLine(PeekOrDefault(laps));\n\nT? PeekOrDefault<T>(List<T> items) => items.Count > 0 ? items[0] : default;',
        checks: [
          { label: 'A generic method PeekOrDefault<T>(List<T> items)', re: 'PeekOrDefault\\s*<\\s*(\\w+)\\s*>\\s*\\(\\s*List\\s*<\\s*\\1\\s*>\\s*\\w+\\s*\\)' },
          { label: 'Return default when the list is empty', re: '(:\\s*|return\\s+)default\\b' },
          { label: 'Try it on all three lists', re: 'PeekOrDefault\\s*\\(\\s*noScores[\\s\\S]*PeekOrDefault\\s*\\(\\s*noNames[\\s\\S]*PeekOrDefault\\s*\\(\\s*laps' },
        ],
        hint: 'default works for any T. Check items.Count first.',
        explain: 'default is 0 for int and null for string, so one method gives the right empty value for each type.',
        output: '0\nTrue\n7',
      },
      {
        kind: 'write',
        prompt: 'Count tracked items per type with a static field in a generic class.',
        starter:
          'Track("apple");\nTrack("pear");\nTrack(42);\nConsole.WriteLine($"strings: {Registry<string>.Count}");\nConsole.WriteLine($"ints: {Registry<int>.Count}");\nConsole.WriteLine($"bools: {Registry<bool>.Count}");\n\n// declare Track<T> and Registry<T> here',
        solution:
          'Track("apple");\nTrack("pear");\nTrack(42);\nConsole.WriteLine($"strings: {Registry<string>.Count}");\nConsole.WriteLine($"ints: {Registry<int>.Count}");\nConsole.WriteLine($"bools: {Registry<bool>.Count}");\n\nvoid Track<T>(T item) => Registry<T>.Count++;\n\nstatic class Registry<T> { public static int Count; }',
        checks: [
          { label: 'static class Registry<T>', re: 'static\\s+class\\s+Registry\\s*<\\s*T\\s*>' },
          { label: 'A public static int Count field', re: 'public\\s+static\\s+int\\s+Count\\b' },
          { label: 'void Track<T>(T item)', re: 'void\\s+Track\\s*<\\s*(\\w+)\\s*>\\s*\\(\\s*\\1\\s+\\w+\\s*\\)' },
          { label: 'Track adds one to Registry<T>.Count', re: 'Registry\\s*<\\s*\\w+\\s*>\\s*\\.\\s*Count\\s*(\\+\\+|\\+=\\s*1)|\\+\\+\\s*Registry\\s*<' },
        ],
        hint: 'Inside Track<T>, Registry<T> is a different class for each T, with its own Count.',
        explain: 'Registry<string> and Registry<int> are separate types, so each keeps its own Count. Nobody tracked a bool, so that one is 0.',
        output: 'strings: 2\nints: 1\nbools: 0',
      },
    ],
    // L4 Variance: out & in
    [
      {
        kind: 'write',
        prompt: 'Use cats as objects, and a general logger as a string logger.',
        starter: 'List<string> cats = ["Tom", "Kit"];\n',
        solution:
          'List<string> cats = ["Tom", "Kit"];\nIEnumerable<object> things = cats;\nforeach (object t in things)\n    Console.WriteLine(t);\nAction<object> log = o => Console.WriteLine($"log: {o}");\nAction<string> logName = log;\nlogName("Felix");',
        checks: [
          { label: 'Assign cats to an IEnumerable<object>', re: 'IEnumerable\\s*<\\s*object\\s*>\\s+\\w+\\s*=\\s*cats\\s*;' },
          { label: 'Loop over it and print each', re: 'foreach\\s*\\(\\s*(object|var)\\s+\\w+\\s+in\\s+\\w+\\s*\\)' },
          { label: 'An Action<object> logger', re: 'Action\\s*<\\s*object\\s*>\\s+\\w+\\s*=' },
          { label: 'Assign it to an Action<string> and call that', re: 'Action\\s*<\\s*string\\s*>\\s+(\\w+)\\s*=\\s*\\w+\\s*;[\\s\\S]*\\b\\1\\s*(\\.Invoke)?\\s*\\(\\s*"' },
        ],
        hint: 'No casts needed: IEnumerable<T> is out (covariant) and Action<T> is in (contravariant).',
        explain: 'Every string is an object, so a sequence of strings can be read as objects, and a logger for any object can take a string.',
        output: 'Tom\nKit\nlog: Felix',
      },
      {
        kind: 'write',
        prompt: 'Add out and in to the interfaces so both assignments compile.',
        starter:
          'ISource<string> words = new WordSource();\nISource<object> anything = words;\nConsole.WriteLine(anything.Next());\nIPrinter<object> general = new ObjectPrinter();\nIPrinter<string> forText = general;\nforText.Print("hello");\n\ninterface ISource<T> { T Next(); }\ninterface IPrinter<T> { void Print(T item); }\nclass WordSource : ISource<string> { public string Next() => "banana"; }\nclass ObjectPrinter : IPrinter<object> { public void Print(object item) => Console.WriteLine($"[{item}]"); }',
        solution:
          'ISource<string> words = new WordSource();\nISource<object> anything = words;\nConsole.WriteLine(anything.Next());\nIPrinter<object> general = new ObjectPrinter();\nIPrinter<string> forText = general;\nforText.Print("hello");\n\ninterface ISource<out T> { T Next(); }\ninterface IPrinter<in T> { void Print(T item); }\nclass WordSource : ISource<string> { public string Next() => "banana"; }\nclass ObjectPrinter : IPrinter<object> { public void Print(object item) => Console.WriteLine($"[{item}]"); }',
        checks: [
          { label: 'ISource<out T>: T only comes out', re: 'interface\\s+ISource\\s*<\\s*out\\s+T\\s*>' },
          { label: 'IPrinter<in T>: T only goes in', re: 'interface\\s+IPrinter\\s*<\\s*in\\s+T\\s*>' },
          { label: 'Keep ISource<object> anything = words;', re: 'ISource\\s*<\\s*object\\s*>\\s+\\w+\\s*=\\s*\\w+\\s*;' },
          { label: 'Keep IPrinter<string> forText = general;', re: 'IPrinter\\s*<\\s*string\\s*>\\s+\\w+\\s*=\\s*\\w+\\s*;' },
        ],
        hint: 'Next returns a T, so T comes out. Print takes a T, so T goes in.',
        explain: 'out lets a source of strings act as a source of objects; in lets a printer of objects act as a printer of strings.',
        output: 'banana\n[hello]',
      },
    ],
    // L5 Generic math
    [
      {
        kind: 'write',
        prompt: 'Write one Product<T> that multiplies ints or doubles, using INumber<T>.',
        starter: 'using System.Numerics;\n\nint[] dice = [2, 3, 4];\ndouble[] rates = [0.5, 8];\n',
        solution:
          'using System.Numerics;\n\nint[] dice = [2, 3, 4];\ndouble[] rates = [0.5, 8];\nConsole.WriteLine(Product(dice));\nConsole.WriteLine(Product(rates));\n\nT Product<T>(T[] xs) where T : INumber<T>\n{\n    T result = T.One;\n    foreach (T x in xs) result *= x;\n    return result;\n}',
        checks: [
          { label: 'T Product<T>(T[] xs) where T : INumber<T>', re: 'T\\s+Product\\s*<\\s*T\\s*>\\s*\\(\\s*T\\s*\\[\\s*\\]\\s*\\w+\\s*\\)\\s*where\\s+T\\s*:\\s*INumber\\s*<\\s*T\\s*>' },
          { label: 'Start from T.One', has: 'T.One' },
          { label: 'Multiply each item in', re: '\\*=\\s*\\w+|=\\s*\\w+\\s*\\*\\s*\\w+' },
          { label: 'Call it on both arrays', re: 'Product\\s*\\(\\s*dice\\s*\\)[\\s\\S]*Product\\s*\\(\\s*rates\\s*\\)|Product\\s*\\(\\s*rates\\s*\\)[\\s\\S]*Product\\s*\\(\\s*dice\\s*\\)' },
        ],
        hint: 'A product starts at 1, not 0. INumber<T> gives you T.One and the * operator.',
        explain: 'INumber<T> declares the operators as static abstract members, so T * T works for every number type.',
        output: '24\n4',
      },
      {
        kind: 'write',
        prompt: 'Make Mean generic so it works for ints and doubles.',
        starter:
          'using System.Numerics;\n\nint[] ages = [7, 8, 9];\ndouble[] times = [2.5, 3.5];\nConsole.WriteLine(Mean(ages));\nConsole.WriteLine(Mean(times));\n\nint Mean(int[] xs)\n{\n    int sum = 0;\n    foreach (int x in xs) sum += x;\n    return sum / xs.Length;\n}',
        solution:
          'using System.Numerics;\n\nint[] ages = [7, 8, 9];\ndouble[] times = [2.5, 3.5];\nConsole.WriteLine(Mean(ages));\nConsole.WriteLine(Mean(times));\n\nT Mean<T>(T[] xs) where T : INumber<T>\n{\n    T sum = T.Zero;\n    T count = T.Zero;\n    foreach (T x in xs)\n    {\n        sum += x;\n        count += T.One;\n    }\n    return sum / count;\n}',
        checks: [
          { label: 'T Mean<T>(T[] xs) where T : INumber<T>', re: 'T\\s+Mean\\s*<\\s*T\\s*>\\s*\\(\\s*T\\s*\\[\\s*\\]\\s*\\w+\\s*\\)\\s*where\\s+T\\s*:\\s*INumber\\s*<\\s*T\\s*>' },
          { label: 'Start the sum at T.Zero', re: 'T\\s+\\w+\\s*=\\s*T\\.Zero' },
          { label: 'Get the count as a T (T.One or T.CreateChecked)', re: 'T\\.One|T\\.CreateChecked\\s*\\(|T\\.CreateTruncating\\s*\\(' },
          { label: 'Divide the sum by the count', re: 'return\\s+\\w+\\s*/\\s*[^;]+;' },
          { label: 'No int-only Mean left', not: 'int Mean(' },
        ],
        hint: 'xs.Length is an int, not a T. Add T.One once per item, or use T.CreateChecked(xs.Length).',
        explain: 'Everything inside is now a T, so the same code adds and divides ints or doubles. (2.5 + 3.5) / 2 is 3.',
        output: '8\n3',
      },
    ],
  ],
};

export default unit;
