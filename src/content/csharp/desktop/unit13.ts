import type { DesktopUnit } from '../../../engine/types';

// Desktop edition: write-the-code challenges for C# unit 13 (Delegates & events).
// lessons[i] runs after lesson i + 1. See docs/CONTENT_GUIDE.md.
const unit: DesktopUnit = {
  lessons: [
    // L1 Func & Action
    [
      {
        kind: 'write',
        prompt: 'Store a squaring Func and an announcing Action, then use both.',
        starter: '',
        solution:
          'Func<int, int> square = n => n * n;\nAction<string> announce = msg => Console.WriteLine($"** {msg} **");\nannounce($"Area: {square(7)}");',
        checks: [
          { label: 'A Func<int, int> that squares its input', re: 'Func\\s*<\\s*int\\s*,\\s*int\\s*>\\s+\\w+\\s*=\\s*\\(?\\s*(\\w+)\\s*\\)?\\s*=>\\s*\\1\\s*\\*\\s*\\1' },
          { label: 'An Action<string> that prints', re: 'Action\\s*<\\s*string\\s*>\\s+\\w+\\s*=[^;]*Console\\.WriteLine' },
          { label: 'Call the Action with the square of 7', re: '\\w+\\s*(\\.Invoke)?\\s*\\([^;]*\\w+\\s*(\\.Invoke)?\\s*\\(\\s*7\\s*\\)' },
        ],
        hint: 'In Func<int, int> the last type is the return type. An Action returns nothing.',
        explain: 'Both variables hold code you call like a method. square(7) is 49, and the Action prints it with stars.',
        output: '** Area: 49 **',
      },
      {
        kind: 'write',
        prompt: 'Let Checkout take a discount Func, and try it with two discounts.',
        starter: 'Console.WriteLine(Checkout(80));\n\nint Checkout(int total)\n{\n    return total;\n}',
        solution:
          'Func<int, int> halfOff = p => p / 2;\nFunc<int, int> tenOff = p => p - 10;\nConsole.WriteLine(Checkout(80, halfOff));\nConsole.WriteLine(Checkout(80, tenOff));\n\nint Checkout(int total, Func<int, int> discount)\n{\n    return discount(total);\n}',
        checks: [
          { label: 'Checkout takes a Func<int, int> parameter', re: 'Checkout\\s*\\(\\s*int\\s+\\w+\\s*,\\s*Func\\s*<\\s*int\\s*,\\s*int\\s*>\\s*\\w+\\s*\\)' },
          { label: 'Checkout calls the discount on the total', re: 'Func\\s*<\\s*int\\s*,\\s*int\\s*>\\s*(\\w+)\\s*\\)[\\s\\S]*\\b\\1\\s*(\\.Invoke)?\\s*\\(\\s*\\w+\\s*\\)' },
          { label: 'Call Checkout(80, ...) with two different discounts', re: '(Checkout\\s*\\(\\s*80\\s*,[\\s\\S]*){2}' },
        ],
        hint: 'Add Func<int, int> discount to the parameters and return discount(total).',
        explain: 'Passing a Func lets the caller decide the rule. Half off 80 is 40; ten off is 70.',
        output: '40\n70',
      },
    ],
    // L2 Delegate types
    [
      {
        kind: 'write',
        prompt: 'Declare a Formatter delegate and fill it with a lambda and a method.',
        starter: '',
        solution:
          'Formatter plain = (n, s) => $"{n}: {s}";\nFormatter fancy = Trophy;\nConsole.WriteLine(plain("Ana", 12));\nConsole.WriteLine(fancy("Ana", 12));\n\nstring Trophy(string n, int s) => $"*** {n} scored {s} ***";\ndelegate string Formatter(string name, int score);',
        checks: [
          { label: 'delegate string Formatter(string name, int score);', re: 'delegate\\s+string\\s+Formatter\\s*\\(\\s*string\\s+\\w+\\s*,\\s*int\\s+\\w+\\s*\\)\\s*;' },
          { label: 'A Formatter set to a lambda', re: 'Formatter\\s+\\w+\\s*=\\s*\\(\\s*\\w+\\s*,\\s*\\w+\\s*\\)\\s*=>' },
          { label: 'A Formatter set to a method name', re: 'Formatter\\s+\\w+\\s*=\\s*\\w+\\s*;' },
          { label: 'A method string ...(string, int) that matches', re: 'string\\s+\\w+\\s*\\(\\s*string\\s+\\w+\\s*,\\s*int\\s+\\w+\\s*\\)\\s*(=>|\\{)' },
          { label: 'Call both', re: '(Console\\.WriteLine\\s*\\(\\s*\\w+\\s*\\([^)]*\\)\\s*\\)[\\s\\S]*){2}' },
        ],
        hint: 'The delegate line goes at the very bottom. Assign the method without brackets: Formatter fancy = Trophy;',
        explain: 'Anything with the same parameter and return types fits the delegate, whether it’s a lambda or a named method.',
        output: 'Ana: 12\n*** Ana scored 12 ***',
      },
      {
        kind: 'write',
        prompt: 'Write CountIf(int[], Rule) and use it to count dice rolls two ways.',
        starter: 'int[] rolls = [6, 2, 5, 6, 1, 4];\n// count the sixes, then the rolls under 5\n\ndelegate bool Rule(int n);',
        solution:
          'int[] rolls = [6, 2, 5, 6, 1, 4];\nConsole.WriteLine(CountIf(rolls, n => n == 6));\nConsole.WriteLine(CountIf(rolls, IsLow));\n\nint CountIf(int[] items, Rule rule)\n{\n    int count = 0;\n    foreach (int x in items)\n        if (rule(x)) count++;\n    return count;\n}\nbool IsLow(int n) => n < 5;\n\ndelegate bool Rule(int n);',
        checks: [
          { label: 'A method int CountIf(int[] ..., Rule ...)', re: 'int\\s+CountIf\\s*\\(\\s*int\\s*\\[\\s*\\]\\s*\\w+\\s*,\\s*Rule\\s+\\w+\\s*\\)' },
          { label: 'Call the rule on each item', re: 'Rule\\s+(\\w+)\\s*\\)[\\s\\S]*\\b\\1\\s*(\\.Invoke)?\\s*\\(\\s*\\w+\\s*\\)' },
          { label: 'Pass a lambda for the sixes', re: 'CountIf\\s*\\(\\s*\\w+\\s*,\\s*\\(?\\s*\\w+\\s*\\)?\\s*=>[^)]*==\\s*6' },
          { label: 'Pass a named method for rolls under 5', re: 'CountIf\\s*\\(\\s*\\w+\\s*,\\s*[A-Za-z_]\\w*\\s*\\)' },
          { label: 'Keep the delegate declaration last', re: 'delegate\\s+bool\\s+Rule\\s*\\(\\s*int\\s+\\w+\\s*\\)\\s*;\\s*$' },
        ],
        hint: 'Loop over the items and count the ones where rule(x) is true. bool IsLow(int n) => n < 5; fits Rule.',
        explain: 'Rule is a type like any other, so CountIf can take one. Two rolls are sixes and three are under 5.',
        output: '2\n3',
      },
    ],
    // L3 Multicast delegates
    [
      {
        kind: 'write',
        prompt: 'Build a wake-up Action that runs three steps in one call.',
        starter: '',
        solution:
          'Action wakeUp = () => Console.WriteLine("Lights on");\nwakeUp += () => Console.WriteLine("Music on");\nwakeUp += MakeCoffee;\nwakeUp();\n\nvoid MakeCoffee() => Console.WriteLine("Coffee brewing");',
        checks: [
          { label: 'Start with an Action variable', re: 'Action\\s+\\w+\\s*=' },
          { label: 'Add two more steps with +=', re: '(\\+=[\\s\\S]*){2}' },
          { label: 'Call it once to run them all', re: 'Action\\s+(\\w+)\\s*=[\\s\\S]*^\\s*\\1\\s*(\\.Invoke)?\\s*\\(\\s*\\)\\s*;', flags: 'm' },
        ],
        hint: '+= adds a lambda or a method name to the end of the list. Then call the variable with ().',
        explain: 'Calling a multicast delegate runs every method it holds, in the order you added them.',
        output: 'Lights on\nMusic on\nCoffee brewing',
      },
      {
        kind: 'write',
        prompt: 'Add SMS and Push alerts as methods, then remove SMS before the second message.',
        starter: 'Action<string> notify = msg => Console.WriteLine($"Email: {msg}");\nnotify("Order shipped");',
        solution:
          'Action<string> notify = msg => Console.WriteLine($"Email: {msg}");\nnotify += Sms;\nnotify += Push;\nnotify("Order shipped");\nnotify -= Sms;\nnotify("Order delivered");\n\nvoid Sms(string msg) => Console.WriteLine($"SMS: {msg}");\nvoid Push(string msg) => Console.WriteLine($"Push: {msg}");',
        checks: [
          { label: 'Add two named methods with +=', re: '(\\+=\\s*\\w+\\s*;[\\s\\S]*){2}' },
          { label: 'Remove a named method with -=', re: '-=\\s*(\\w+)\\s*;[\\s\\S]*void\\s+\\1\\s*\\(\\s*string\\s+\\w+\\s*\\)' },
          { label: 'Send a message before and after removing it', re: 'notify\\s*(\\.Invoke)?\\s*\\(\\s*"[^"]*"\\s*\\)[\\s\\S]*-=[\\s\\S]*notify\\s*(\\.Invoke)?\\s*\\(\\s*"[^"]*"\\s*\\)' },
        ],
        hint: 'Write void Sms(string msg) and void Push(string msg) at the bottom, then notify += Sms; and later notify -= Sms;.',
        explain: 'A named method can be removed again with -=. Two separate lambdas never count as equal, so a lambda can’t be taken out that way.',
        output: 'Email: Order shipped\nSMS: Order shipped\nPush: Order shipped\nEmail: Order delivered\nPush: Order delivered',
      },
    ],
    // L4 Declaring events
    [
      {
        kind: 'write',
        prompt: 'Give a Doorbell a Rang event that Press() raises, with two subscribers.',
        starter: '',
        solution:
          'var bell = new Doorbell();\nbell.Rang += () => Console.WriteLine("Dog barks");\nbell.Rang += () => Console.WriteLine("Someone opens the door");\nbell.Press();\n\nclass Doorbell\n{\n    public event Action? Rang;\n    public void Press()\n    {\n        Console.WriteLine("Ding dong");\n        Rang?.Invoke();\n    }\n}',
        checks: [
          { label: 'A Doorbell class with public event Action? Rang;', re: 'class\\s+Doorbell[\\s\\S]*public\\s+event\\s+Action\\s*\\?\\s+Rang\\s*;' },
          { label: 'Press() raises it with Rang?.Invoke()', re: 'Rang\\s*\\?\\.\\s*Invoke\\s*\\(\\s*\\)' },
          { label: 'Subscribe two handlers with +=', re: '(\\.Rang\\s*\\+=[\\s\\S]*){2}' },
          { label: 'Press the bell', re: '\\w+\\.Press\\s*\\(\\s*\\)\\s*;' },
        ],
        hint: 'Declare the event inside the class; outside, use bell.Rang += ... to subscribe.',
        explain: 'Only Doorbell can raise Rang. ?. skips the call if nobody subscribed; here both handlers run after Ding dong.',
        output: 'Ding dong\nDog barks\nSomeone opens the door',
      },
      {
        kind: 'write',
        prompt: 'Add a LevelUp event to Hero, and cheer on the first level-up only.',
        starter:
          'var hero = new Hero();\nhero.AddXp(120);\nhero.AddXp(150);\nConsole.WriteLine($"Level {hero.Level}");\n\nclass Hero\n{\n    public int Level { get; private set; } = 1;\n    int xp;\n    public void AddXp(int amount)\n    {\n        xp += amount;\n        if (xp < 100) return;\n        xp -= 100;\n        Level++;\n    }\n}',
        solution:
          'var hero = new Hero();\nhero.LevelUp += Cheer;\nhero.AddXp(120);\nhero.LevelUp -= Cheer;\nhero.AddXp(150);\nConsole.WriteLine($"Level {hero.Level}");\n\nvoid Cheer(int level) => Console.WriteLine($"Level up! Now {level}");\n\nclass Hero\n{\n    public int Level { get; private set; } = 1;\n    int xp;\n    public event Action<int>? LevelUp;\n    public void AddXp(int amount)\n    {\n        xp += amount;\n        if (xp < 100) return;\n        xp -= 100;\n        Level++;\n        LevelUp?.Invoke(Level);\n    }\n}',
        checks: [
          { label: 'Declare public event Action<int>? LevelUp;', re: 'public\\s+event\\s+Action\\s*<\\s*int\\s*>\\s*\\?\\s+LevelUp\\s*;' },
          { label: 'Raise it with the new level', re: 'LevelUp\\s*\\?\\.\\s*Invoke\\s*\\(\\s*\\w+\\s*\\)' },
          { label: 'Subscribe before the first AddXp', re: '\\.LevelUp\\s*\\+=\\s*\\w+\\s*;[\\s\\S]*AddXp\\s*\\(\\s*120' },
          { label: 'Unsubscribe with -= before the second AddXp', re: 'AddXp\\s*\\(\\s*120[\\s\\S]*\\.LevelUp\\s*-=\\s*\\w+\\s*;[\\s\\S]*AddXp\\s*\\(\\s*150' },
        ],
        hint: 'Raise the event after Level++. Use a named method like Cheer so you can remove it with -=.',
        explain: 'Both calls level the hero up, but only the first has a subscriber, so the cheer prints once.',
        output: 'Level up! Now 2\nLevel 3',
      },
    ],
    // L5 EventHandler & EventArgs
    [
      {
        kind: 'write',
        prompt: 'Raise a Scored event with ScoreArgs, and print the points it carries.',
        starter: '',
        solution:
          'var game = new Game();\ngame.Scored += (sender, e) => Console.WriteLine($"+{e.Points} points");\ngame.Score(3);\ngame.Score(7);\n\nclass ScoreArgs : EventArgs\n{\n    public int Points { get; init; }\n}\n\nclass Game\n{\n    public event EventHandler<ScoreArgs>? Scored;\n    public void Score(int points) => Scored?.Invoke(this, new ScoreArgs { Points = points });\n}',
        checks: [
          { label: 'class ScoreArgs : EventArgs with an int property', re: 'class\\s+ScoreArgs\\s*:\\s*EventArgs\\s*\\{[^}]*public\\s+int\\s+\\w+' },
          { label: 'public event EventHandler<ScoreArgs>? Scored;', re: 'public\\s+event\\s+EventHandler\\s*<\\s*ScoreArgs\\s*>\\s*\\?\\s+Scored\\s*;' },
          { label: 'Raise it with Scored?.Invoke(this, new ScoreArgs ...)', re: 'Scored\\s*\\?\\.\\s*Invoke\\s*\\(\\s*this\\s*,\\s*new\\s+ScoreArgs\\b' },
          { label: 'Subscribe with a (sender, e) lambda', re: '\\.Scored\\s*\\+=\\s*\\(\\s*\\w+\\s*,\\s*\\w+\\s*\\)\\s*=>' },
          { label: 'Score twice', re: '(\\.Score\\s*\\(\\s*\\d+\\s*\\)[\\s\\S]*){2}' },
        ],
        hint: 'ScoreArgs holds public int Points { get; init; }. The handler reads e.Points.',
        explain: 'EventHandler<T> handlers always get (sender, e). The data rides along in the EventArgs object.',
        output: '+3 points\n+7 points',
      },
      {
        kind: 'write',
        prompt: 'Give Sensor a Changed event, and log both sensors with one handler.',
        starter:
          'var kitchen = new Sensor("Kitchen");\nvar garage = new Sensor("Garage");\nkitchen.Read(22);\ngarage.Read(4);\n\nclass TempArgs : EventArgs { public int Temp { get; init; } }\n\nclass Sensor(string name)\n{\n    public string Name => name;\n    public void Read(int temp) { }\n}',
        solution:
          'var kitchen = new Sensor("Kitchen");\nvar garage = new Sensor("Garage");\nkitchen.Changed += OnTemp;\ngarage.Changed += OnTemp;\nkitchen.Read(22);\ngarage.Read(4);\n\nvoid OnTemp(object? sender, TempArgs e)\n{\n    if (sender is Sensor s) Console.WriteLine($"{s.Name}: {e.Temp}C");\n}\n\nclass TempArgs : EventArgs { public int Temp { get; init; } }\n\nclass Sensor(string name)\n{\n    public string Name => name;\n    public event EventHandler<TempArgs>? Changed;\n    public void Read(int temp) => Changed?.Invoke(this, new TempArgs { Temp = temp });\n}',
        checks: [
          { label: 'public event EventHandler<TempArgs>? Changed;', re: 'public\\s+event\\s+EventHandler\\s*<\\s*TempArgs\\s*>\\s*\\?\\s+Changed\\s*;' },
          { label: 'Read raises it with this and new TempArgs', re: 'Changed\\s*\\?\\.\\s*Invoke\\s*\\(\\s*this\\s*,\\s*new\\s+TempArgs\\b' },
          { label: 'A handler method (object? sender, TempArgs e)', re: 'void\\s+\\w+\\s*\\(\\s*object\\s*\\?\\s+\\w+\\s*,\\s*TempArgs\\s+\\w+\\s*\\)' },
          { label: 'Subscribe it to both sensors', re: '(\\.Changed\\s*\\+=\\s*\\w+\\s*;[\\s\\S]*){2}' },
          { label: 'Turn sender back into a Sensor to read its Name', re: 'is\\s+Sensor\\s+\\w+|\\(\\s*Sensor\\s*\\)\\s*\\w+|as\\s+Sensor\\b' },
        ],
        hint: 'sender is an object?, so use if (sender is Sensor s) before reading s.Name.',
        explain: 'One handler serves many publishers: sender tells it which sensor raised the event, and e carries the reading.',
        output: 'Kitchen: 22C\nGarage: 4C',
      },
    ],
  ],
};

export default unit;
