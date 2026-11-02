import type { DesktopUnit } from '../../../engine/types';

// Desktop edition: write-the-code challenges for C# unit 11 (Exceptions).
// lessons[i] runs after lesson i + 1. See docs/CONTENT_GUIDE.md.
const unit: DesktopUnit = {
  lessons: [
    // L1 try & catch
    [
      {
        kind: 'write',
        prompt: 'Parse a ticket count from text, and catch the error if it fails.',
        starter: 'string input = "two";\n',
        solution:
          'string input = "two";\ntry\n{\n    int tickets = int.Parse(input);\n    Console.WriteLine($"Booked {tickets} tickets");\n}\ncatch (Exception ex)\n{\n    Console.WriteLine($"Oops: {ex.Message}");\n}',
        checks: [
          { label: 'Call int.Parse inside a try block', re: 'try\\s*\\{[^}]*int\\.Parse\\s*\\(' },
          { label: 'Add catch (Exception ex)', re: 'catch\\s*\\(\\s*Exception\\s+\\w+\\s*\\)' },
          { label: 'Print the error’s Message in the catch', re: 'catch[\\s\\S]*Console\\.Write(Line)?\\s*\\([^;]*\\w+\\.Message' },
        ],
        hint: 'try { ... } holds the risky line; catch (Exception ex) { ... } runs if it throws.',
        explain: '"two" isn’t digits, so int.Parse throws and C# jumps straight to catch. ex.Message describes the problem.',
        output: "Oops: The input string 'two' was not in a correct format.",
      },
      {
        kind: 'write',
        prompt: 'Stop this lap reader from crashing so Race over still prints.',
        starter: 'int[] laps = [52, 48, 50];\nConsole.WriteLine(laps[5]);\nConsole.WriteLine("Race over");',
        solution:
          'int[] laps = [52, 48, 50];\ntry\n{\n    Console.WriteLine(laps[5]);\n}\ncatch (Exception ex)\n{\n    Console.WriteLine(ex.Message);\n}\nConsole.WriteLine("Race over");',
        checks: [
          { label: 'Wrap laps[5] in a try block', re: 'try\\s*\\{[^}]*laps\\[5\\]' },
          { label: 'Catch the Exception and print its Message', re: 'catch\\s*\\(\\s*Exception\\s+(\\w+)\\s*\\)\\s*\\{[^}]*\\1\\.Message' },
          { label: 'Print Race over after the catch, not inside it', re: '\\}\\s*Console\\.WriteLine\\(\\s*"Race over"\\s*\\)\\s*;\\s*$' },
        ],
        hint: 'Only the line that can throw goes in try. The last line stays outside, after the catch.',
        explain: 'laps only has indexes 0 to 2. The catch handles the error, then the program carries on after it.',
        output: 'Index was outside the bounds of the array.\nRace over',
      },
    ],
    // L2 Catching by type
    [
      {
        kind: 'write',
        prompt: 'Split a 120 bill, with a separate catch for each kind of bad input.',
        starter: 'string people = "0";\n',
        solution:
          'string people = "0";\ntry\n{\n    Console.WriteLine(120 / int.Parse(people));\n}\ncatch (FormatException)\n{\n    Console.WriteLine("Numbers only");\n}\ncatch (DivideByZeroException)\n{\n    Console.WriteLine("Nobody to split with");\n}',
        checks: [
          { label: 'Divide 120 by int.Parse(people) in a try', re: 'try\\s*\\{[^}]*/\\s*int\\.Parse\\s*\\(\\s*people\\s*\\)' },
          { label: 'A catch for FormatException', re: 'catch\\s*\\(\\s*FormatException\\b' },
          { label: 'A catch for DivideByZeroException', re: 'catch\\s*\\(\\s*DivideByZeroException\\b' },
        ],
        hint: 'Write two catch blocks in a row, each naming one exception type. The variable name is optional.',
        explain: '"0" parses fine, so the division throws DivideByZeroException and only that catch runs.',
        output: 'Nobody to split with',
      },
      {
        kind: 'write',
        prompt: 'Fix the catch order, and add a when filter for an empty PIN.',
        starter:
          'string code = "";\ntry\n{\n    int pin = int.Parse(code);\n    Console.WriteLine($"PIN {pin} accepted");\n}\ncatch (Exception ex)\n{\n    Console.WriteLine(ex.Message);\n}\ncatch (FormatException)\n{\n    Console.WriteLine("Digits only");\n}',
        solution:
          'string code = "";\ntry\n{\n    int pin = int.Parse(code);\n    Console.WriteLine($"PIN {pin} accepted");\n}\ncatch (FormatException) when (code == "")\n{\n    Console.WriteLine("Enter your PIN");\n}\ncatch (FormatException)\n{\n    Console.WriteLine("Digits only");\n}\ncatch (Exception ex)\n{\n    Console.WriteLine(ex.Message);\n}',
        checks: [
          { label: 'catch (FormatException) when (...) for an empty code', re: 'catch\\s*\\(\\s*FormatException\\s*\\w*\\s*\\)\\s*when\\s*\\([^)]*code' },
          { label: 'Keep a plain FormatException catch for Digits only', re: 'catch\\s*\\(\\s*FormatException\\s*\\w*\\s*\\)\\s*\\{[^}]*Digits only' },
          { label: 'catch (Exception ex) comes last', re: 'catch\\s*\\(\\s*Exception\\s+\\w+\\s*\\)\\s*\\{[^{}]*\\}\\s*$' },
        ],
        hint: 'C# tries catches top to bottom, so the most specific goes first. A filter is when (condition) after the brackets.',
        explain: 'A catch (Exception) above a more specific one would swallow everything, so C# refuses to compile it. The filtered catch handles the empty case first.',
        output: 'Enter your PIN',
      },
    ],
    // L3 Throwing exceptions
    [
      {
        kind: 'write',
        prompt: 'Write SetVolume that throws when the level is over 10, then catch it.',
        starter: '',
        solution:
          'try\n{\n    SetVolume(15);\n}\ncatch (ArgumentOutOfRangeException ex)\n{\n    Console.WriteLine(ex.Message);\n}\n\nvoid SetVolume(int level)\n{\n    if (level > 10) throw new ArgumentOutOfRangeException("level", "Max is 10");\n    Console.WriteLine($"Volume {level}");\n}',
        checks: [
          { label: 'A method void SetVolume(int level)', re: 'void\\s+SetVolume\\s*\\(\\s*int\\s+\\w+\\s*\\)' },
          { label: 'Throw ArgumentOutOfRangeException when it’s over 10', re: 'if\\s*\\([^)]*>\\s*10\\s*\\)[^;]*throw\\s+new\\s+ArgumentOutOfRangeException\\s*\\(' },
          { label: 'Call SetVolume(15) inside a try', re: 'try\\s*\\{[^}]*SetVolume\\s*\\(\\s*15\\s*\\)' },
          { label: 'Catch ArgumentOutOfRangeException', re: 'catch\\s*\\(\\s*ArgumentOutOfRangeException\\b' },
        ],
        hint: 'Inside the method: if (level > 10) throw new ArgumentOutOfRangeException("level", "Max is 10");',
        explain: 'throw stops SetVolume at once, so Volume never prints. The caller’s catch gets the error, whose Message ends with the parameter name.',
        output: "Max is 10 (Parameter 'level')",
      },
      {
        kind: 'write',
        prompt: 'Finish Welcome: fail fast on null, log the error, then pass it on.',
        starter:
          'try\n{\n    Welcome(null);\n}\ncatch (ArgumentNullException)\n{\n    Console.WriteLine("Login failed");\n}\n\nvoid Welcome(string? player)\n{\n    string name = player;\n    Console.WriteLine($"Hi {name}");\n}',
        solution:
          'try\n{\n    Welcome(null);\n}\ncatch (ArgumentNullException)\n{\n    Console.WriteLine("Login failed");\n}\n\nvoid Welcome(string? player)\n{\n    try\n    {\n        string name = player ?? throw new ArgumentNullException("player");\n        Console.WriteLine($"Hi {name}");\n    }\n    catch (ArgumentNullException)\n    {\n        Console.WriteLine("Logging: no player");\n        throw;\n    }\n}',
        checks: [
          { label: 'Use ?? throw new ArgumentNullException(...)', re: '\\?\\?\\s*throw\\s+new\\s+ArgumentNullException\\s*\\(' },
          { label: 'Catch it inside Welcome and print a log line', re: 'void\\s+Welcome[\\s\\S]*catch\\s*\\(\\s*ArgumentNullException\\s*\\w*\\s*\\)\\s*\\{[^}]*Console\\.WriteLine' },
          { label: 'Pass the same error on with throw;', re: '\\bthrow\\s*;' },
          { label: 'Don’t use throw ex;', not: 'throw ex;' },
        ],
        hint: 'Put the two lines in their own try, then in the catch print a message and write throw; on its own.',
        explain: 'throw; rethrows the very same exception, so the outer catch still sees it. Your log runs first, then Login failed.',
        output: 'Logging: no player\nLogin failed',
      },
    ],
    // L4 finally & using
    [
      {
        kind: 'write',
        prompt: 'Bake at a parsed temperature, and always turn the oven off.',
        starter: '',
        solution:
          'try\n{\n    Console.WriteLine("Oven on");\n    int temp = int.Parse("hot");\n    Console.WriteLine($"Baking at {temp}");\n}\ncatch (FormatException)\n{\n    Console.WriteLine("Bad temperature");\n}\nfinally\n{\n    Console.WriteLine("Oven off");\n}',
        checks: [
          { label: 'int.Parse inside a try', re: 'try\\s*\\{[^}]*int\\.Parse\\s*\\(' },
          { label: 'A catch for the bad number', re: 'catch\\s*\\(\\s*\\w*Exception\\b' },
          { label: 'A finally block after the catch', re: 'catch[\\s\\S]*\\}\\s*finally\\s*\\{' },
          { label: 'Print a clean-up line in finally', re: 'finally\\s*\\{[^}]*Console\\.WriteLine\\s*\\(' },
        ],
        hint: 'The order is try { } catch (...) { } finally { }.',
        explain: 'finally runs whether try succeeded or threw, so the oven always goes off, after the catch.',
        output: 'Oven on\nBad temperature\nOven off',
      },
      {
        kind: 'write',
        prompt: 'Make GarageDoor disposable so it closes itself after using var.',
        starter:
          'var door = new GarageDoor();\ndoor.Open();\n\nclass GarageDoor\n{\n    public void Open() => Console.WriteLine("Door open");\n}',
        solution:
          'using var door = new GarageDoor();\ndoor.Open();\n\nclass GarageDoor : IDisposable\n{\n    public void Open() => Console.WriteLine("Door open");\n    public void Dispose() => Console.WriteLine("Door closed");\n}',
        checks: [
          { label: 'GarageDoor implements IDisposable', re: 'class\\s+GarageDoor\\s*:\\s*IDisposable' },
          { label: 'A public void Dispose() that prints Door closed', re: 'public\\s+void\\s+Dispose\\s*\\(\\s*\\)[^}]*Door closed' },
          { label: 'Create the door with using', re: 'using\\s*(\\(\\s*)?var\\s+\\w+\\s*=\\s*new\\s+GarageDoor\\s*\\(' },
        ],
        hint: 'Add : IDisposable to the class and a Dispose() method, then put using in front of var.',
        explain: 'using var calls Dispose() when the variable goes out of scope, here at the end of the program, so the door closes after it opens.',
        output: 'Door open\nDoor closed',
      },
    ],
    // L5 Custom exceptions
    [
      {
        kind: 'write',
        prompt: 'Declare LowBatteryException and throw it when a drone’s battery is under 20.',
        starter:
          'try\n{\n    TakeOff(5);\n}\ncatch (LowBatteryException ex)\n{\n    Console.WriteLine($"Grounded: {ex.Message}");\n}\n\nvoid TakeOff(int battery)\n{\n    Console.WriteLine("Drone up");\n}\n',
        solution:
          'try\n{\n    TakeOff(5);\n}\ncatch (LowBatteryException ex)\n{\n    Console.WriteLine($"Grounded: {ex.Message}");\n}\n\nvoid TakeOff(int battery)\n{\n    if (battery < 20) throw new LowBatteryException(battery);\n    Console.WriteLine("Drone up");\n}\n\nclass LowBatteryException : Exception\n{\n    public LowBatteryException(int percent) : base($"battery at {percent}%") { }\n}',
        checks: [
          { label: 'class LowBatteryException : Exception', re: 'class\\s+LowBatteryException\\s*:\\s*Exception\\b' },
          { label: 'Its constructor passes a message to base(...)', re: 'LowBatteryException\\s*\\([^)]*\\)\\s*:\\s*base\\s*\\(' },
          { label: 'Throw it when the battery is under 20', re: 'if\\s*\\([^)]*<\\s*20\\s*\\)[^;]*throw\\s+new\\s+LowBatteryException\\s*\\(' },
        ],
        hint: 'Inherit from Exception and write : base(message) after the constructor’s brackets. The class goes at the end of the file.',
        explain: 'Your exception is a normal Exception with its own name, so the catch can pick it out by type. base(...) sets its Message.',
        output: 'Grounded: battery at 5%',
      },
      {
        kind: 'write',
        prompt: 'Throw a SeatsException that carries how many seats are missing, and print it.',
        starter:
          'Book(3, 2);\n\nvoid Book(int wanted, int free)\n{\n    // throw a SeatsException when wanted > free\n    Console.WriteLine($"Booked {wanted}");\n}\n\n// declare SeatsException here',
        solution:
          'try\n{\n    Book(3, 2);\n}\ncatch (SeatsException ex)\n{\n    Console.WriteLine($"{ex.Message} (short by {ex.Missing})");\n}\n\nvoid Book(int wanted, int free)\n{\n    if (wanted > free) throw new SeatsException(wanted - free);\n    Console.WriteLine($"Booked {wanted}");\n}\n\nclass SeatsException : Exception\n{\n    public int Missing { get; }\n    public SeatsException(int missing) : base("Not enough seats") => Missing = missing;\n}',
        checks: [
          { label: 'class SeatsException : Exception', re: 'class\\s+SeatsException\\s*:\\s*Exception\\b' },
          { label: 'An int property for the missing seats', re: 'public\\s+int\\s+\\w+\\s*\\{\\s*get' },
          { label: 'Pass a message up with : base(...)', re: 'SeatsException\\s*\\([^)]*\\)\\s*:\\s*base\\s*\\(' },
          { label: 'Throw it when wanted > free', re: 'throw\\s+new\\s+SeatsException\\s*\\(' },
          { label: 'Call Book in a try and catch (SeatsException ex)', re: 'try\\s*\\{[^}]*Book\\s*\\([^}]*\\}\\s*catch\\s*\\(\\s*SeatsException\\s+\\w+\\s*\\)' },
          { label: 'Print the property in the catch', re: 'catch\\s*\\(\\s*SeatsException\\s+(\\w+)\\s*\\)[\\s\\S]*?\\b\\1\\.(?!Message\\b)\\w+' },
        ],
        hint: 'Give the class public int Missing { get; } and set it in the constructor; the catch reads ex.Missing.',
        explain: 'A custom exception can carry extra data, so the code that catches it knows exactly what went wrong.',
        output: 'Not enough seats (short by 1)',
      },
    ],
  ],
};

export default unit;
