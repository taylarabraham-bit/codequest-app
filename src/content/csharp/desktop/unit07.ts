import type { DesktopUnit } from '../../../engine/types';

// Desktop edition: write-the-code challenges for C# unit 7 (Classes & objects).
// lessons[i] runs after lesson i + 1. See docs/CONTENT_GUIDE.md.
const unit: DesktopUnit = {
  lessons: [
    // L1 Your first class
    [
      {
        kind: 'write',
        prompt: 'Make a Book class with Title and Pages fields; create one and print it.',
        starter: '',
        solution:
          'var book = new Book();\nbook.Title = "Dune";\nbook.Pages = 412;\nConsole.WriteLine($"{book.Title}: {book.Pages} pages");\n\nclass Book\n{\n    public string Title = "";\n    public int Pages;\n}',
        checks: [
          { label: 'A class named Book', re: 'class\\s+Book\\b' },
          { label: 'A public string Title field', re: 'public\\s+string\\s+Title\\b' },
          { label: 'A public int Pages field', re: 'public\\s+int\\s+Pages\\b' },
          { label: 'Create one with new Book()', re: 'new\\s+Book\\s*\\(\\s*\\)|Book\\s+\\w+\\s*=\\s*new\\s*\\(\\s*\\)' },
          { label: 'Set both fields with a dot', re: '(?=[\\s\\S]*\\w+\\.Title\\s*=)(?=[\\s\\S]*\\w+\\.Pages\\s*=)' },
        ],
        hint: 'Top-level code first, then class Book { public string Title = ""; ... }.',
        explain: 'new Book() builds an object from the blueprint, and book.Title reaches into that object’s field.',
        output: 'Dune: 412 pages',
      },
      {
        kind: 'write',
        prompt: 'Above the class, create two planets and print which has more moons.',
        starter: '\nclass Planet\n{\n    public string Name = "";\n    public int Moons;\n}',
        solution:
          'var earth = new Planet();\nearth.Name = "Earth";\nearth.Moons = 1;\nvar mars = new Planet();\nmars.Name = "Mars";\nmars.Moons = 2;\nif (mars.Moons > earth.Moons) Console.WriteLine($"{mars.Name} wins");\nelse Console.WriteLine($"{earth.Name} wins");\n\nclass Planet\n{\n    public string Name = "";\n    public int Moons;\n}',
        checks: [
          { label: 'Two new Planet objects', re: '(new\\s*(Planet\\s*)?\\(\\s*\\)[\\s\\S]*){2}class\\s+Planet' },
          { label: 'Set Moons on each', re: '(\\w+\\.Moons\\s*=\\s*\\d+[\\s\\S]*){2}' },
          { label: 'Set Name on each', re: '(\\w+\\.Name\\s*=\\s*"[^"]*"[\\s\\S]*){2}' },
          { label: 'Compare their Moons fields', re: '\\w+\\.Moons\\s*[<>]=?\\s*\\w+\\.Moons' },
        ],
        hint: 'Each new Planet() is a separate object with its own Name and Moons.',
        explain: 'The two objects share a blueprint but keep their own values, so you can compare mars.Moons with earth.Moons.',
        output: 'Mars wins',
      },
    ],
    // L2 Instance methods
    [
      {
        kind: 'write',
        prompt: 'Give a Lamp an On field plus Toggle and Show methods; toggle it twice.',
        starter: '',
        solution:
          'var lamp = new Lamp();\nlamp.Toggle();\nlamp.Show();\nlamp.Toggle();\nlamp.Show();\n\nclass Lamp\n{\n    public bool On;\n    public void Toggle() => On = !On;\n    public void Show() => Console.WriteLine(On ? "Light on" : "Light off");\n}',
        checks: [
          { label: 'A public bool On field', re: 'public\\s+bool\\s+On\\b' },
          { label: 'Toggle flips On with !', re: 'public\\s+void\\s+Toggle\\s*\\(\\s*\\)\\s*(=>|\\{)[^}]*On\\s*=\\s*!\\s*On' },
          { label: 'A public void Show() that prints', re: 'public\\s+void\\s+Show\\s*\\(\\s*\\)\\s*(=>|\\{)[^}]*Console\\.WriteLine' },
          { label: 'Call Toggle and Show twice with a dot', re: '(\\w+\\.Toggle\\s*\\(\\s*\\)\\s*;[\\s\\S]*\\w+\\.Show\\s*\\(\\s*\\)\\s*;[\\s\\S]*){2}' },
        ],
        hint: 'Inside the class, On means this lamp’s own field. Call methods with lamp.Toggle();',
        explain: 'Each Toggle flips the same object’s field: off to on, then back to off.',
        output: 'Light on\nLight off',
      },
      {
        kind: 'write',
        prompt: 'Add the Add, Eat and Report methods so this program runs.',
        starter: 'var jar = new CookieJar();\njar.Add(5);\njar.Eat(2);\njar.Report();\n\nclass CookieJar\n{\n    public int Cookies;\n}',
        solution:
          'var jar = new CookieJar();\njar.Add(5);\njar.Eat(2);\njar.Report();\n\nclass CookieJar\n{\n    public int Cookies;\n    public void Add(int n) => Cookies += n;\n    public void Eat(int n)\n    {\n        if (n <= Cookies) Cookies -= n;\n    }\n    public void Report() => Console.WriteLine($"{Cookies} cookies left");\n}',
        checks: [
          { label: 'public void Add(int n) adds to Cookies', re: 'public\\s+void\\s+Add\\s*\\(\\s*int\\s+\\w+\\s*\\)\\s*(=>|\\{)\\s*Cookies\\s*(\\+=|=\\s*Cookies\\s*\\+)' },
          { label: 'public void Eat(int n) takes some away', re: 'public\\s+void\\s+Eat\\s*\\(\\s*int\\s+\\w+\\s*\\)[\\s\\S]*Cookies\\s*(-=|=\\s*Cookies\\s*-)' },
          { label: 'public void Report() prints the count', re: 'public\\s+void\\s+Report\\s*\\(\\s*\\)\\s*(=>|\\{)[^}]*Console\\.WriteLine\\s*\\([^;]*Cookies' },
        ],
        hint: 'Methods go inside the class braces, after the field. Each one uses Cookies directly.',
        explain: 'All three methods work on the same jar’s Cookies: 5 added, 2 eaten, 3 left.',
        output: '3 cookies left',
      },
    ],
    // L3 Writing constructors
    [
      {
        kind: 'write',
        prompt: 'Give a Course class a constructor that sets its name and credits.',
        starter: '',
        solution:
          'var course = new Course("Biology", 5);\nConsole.WriteLine($"{course.Name} ({course.Credits} credits)");\n\nclass Course\n{\n    public string Name;\n    public int Credits;\n\n    public Course(string name, int credits)\n    {\n        Name = name;\n        Credits = credits;\n    }\n}',
        checks: [
          { label: 'A constructor Course(string, int)', re: 'public\\s+Course\\s*\\(\\s*string\\s+\\w+\\s*,\\s*int\\s+\\w+\\s*\\)' },
          { label: 'No return type on the constructor', not: 'void Course' },
          { label: 'Set both fields inside it', re: 'Course\\s*\\([^)]*\\)\\s*\\{[^}]*=[^}]*=[^}]*\\}' },
          { label: 'Create it with new Course("...", number)', re: 'new\\s*(Course\\s*)?\\(\\s*"[^"]*"\\s*,\\s*\\d+\\s*\\)' },
        ],
        hint: 'A constructor is named exactly like the class and has no return type.',
        explain: 'new Course("Biology", 5) runs the constructor, which copies the arguments into the fields.',
        output: 'Biology (5 credits)',
      },
      {
        kind: 'write',
        prompt: 'Add two Robot constructors: one using this., one with defaults.',
        starter:
          'var a = new Robot("R2", 90);\nvar b = new Robot();\nConsole.WriteLine($"{a.name}: {a.battery}%");\nConsole.WriteLine($"{b.name}: {b.battery}%");\n\nclass Robot\n{\n    public string name;\n    public int battery;\n}',
        solution:
          'var a = new Robot("R2", 90);\nvar b = new Robot();\nConsole.WriteLine($"{a.name}: {a.battery}%");\nConsole.WriteLine($"{b.name}: {b.battery}%");\n\nclass Robot\n{\n    public string name;\n    public int battery;\n\n    public Robot(string name, int battery)\n    {\n        this.name = name;\n        this.battery = battery;\n    }\n    public Robot()\n    {\n        name = "Unit-0";\n        battery = 100;\n    }\n}',
        checks: [
          { label: 'Robot(string name, int battery)', re: 'public\\s+Robot\\s*\\(\\s*string\\s+name\\s*,\\s*int\\s+battery\\s*\\)' },
          { label: 'this.name = name;', re: 'this\\.name\\s*=\\s*name\\s*;' },
          { label: 'this.battery = battery;', re: 'this\\.battery\\s*=\\s*battery\\s*;' },
          { label: 'An empty Robot() for "Unit-0" at 100', re: 'public\\s+Robot\\s*\\(\\s*\\)[\\s\\S]*"Unit-0"[\\s\\S]*100|public\\s+Robot\\s*\\(\\s*\\)[\\s\\S]*100[\\s\\S]*"Unit-0"' },
        ],
        hint: 'When the parameter and field share a name, this.name is the field.',
        explain: 'C# picks the constructor whose parameters match the arguments; new Robot() uses the defaults.',
        output: 'R2: 90%\nUnit-0: 100%',
      },
    ],
    // L4 References & null
    [
      {
        kind: 'write',
        prompt: 'Two variables, one Playlist: change Songs through one, print it through the other.',
        starter: '',
        solution:
          'var mine = new Playlist();\nvar yours = mine;\nyours.Songs = 12;\nConsole.WriteLine(mine.Songs);\n\nclass Playlist\n{\n    public int Songs = 10;\n}',
        checks: [
          { label: 'A Playlist class with an int Songs field', re: 'class\\s+Playlist\\s*\\{[^}]*public\\s+int\\s+Songs' },
          { label: 'Exactly one new Playlist()', re: '^(?![\\s\\S]*new\\s*(Playlist\\s*)?\\([\\s\\S]*new\\s*(Playlist\\s*)?\\()[\\s\\S]*new\\s*(Playlist\\s*)?\\(' },
          { label: 'A second variable that copies the first', re: '(var|Playlist)\\s+\\w+\\s*=\\s*[A-Za-z_]\\w*\\s*;' },
          { label: 'Change through one, print through the other', re: '(\\w+)\\.Songs\\s*=[^;]*;[\\s\\S]*WriteLine\\s*\\([^;]*\\b(?!\\1\\b)\\w+\\.Songs' },
        ],
        hint: 'var b = a; copies the reference, not the object.',
        explain: 'Both variables point to the same Playlist, so a change through yours shows up through mine.',
        output: '12',
      },
      {
        kind: 'write',
        prompt: 'Stop the null crash with ?. and ??, then fall back to a guest with ??=.',
        starter:
          'Member? found = Find("Zed");\nConsole.WriteLine(found.Name);\n\nMember? Find(string name) => name == "Ana" ? new Member("Ana") : null;\n\nclass Member\n{\n    public string Name;\n    public Member(string name) { Name = name; }\n}',
        solution:
          'Member? found = Find("Zed");\nConsole.WriteLine(found?.Name ?? "No member");\nfound ??= new Member("Guest");\nConsole.WriteLine(found.Name);\nif (Find("Ana") is not null) Console.WriteLine("Ana found");\n\nMember? Find(string name) => name == "Ana" ? new Member("Ana") : null;\n\nclass Member\n{\n    public string Name;\n    public Member(string name) { Name = name; }\n}',
        checks: [
          { label: 'Read the name safely with ?.', has: 'found?.Name' },
          { label: 'Fall back to a message with ??', re: '\\?\\.Name\\s*\\?\\?\\s*"[^"]*"' },
          { label: 'found ??= new Member("Guest")', re: 'found\\s*\\?\\?=\\s*new\\s*(Member\\s*)?\\(\\s*"[^"]*"\\s*\\)' },
          { label: 'Test a Find result with is null or is not null', re: '\\bis\\s+(not\\s+)?null\\b' },
        ],
        hint: 'found?.Name gives null instead of crashing; ?? then supplies the text.',
        explain: 'Zed isn’t found, so the fallback prints, ??= fills found with a guest, and Ana is found.',
        output: 'No member\nGuest\nAna found',
      },
    ],
    // L5 Static members
    [
      {
        kind: 'write',
        prompt: 'Count how many Ticket objects get made with a static field.',
        starter: '',
        solution:
          'new Ticket();\nnew Ticket();\nnew Ticket();\nConsole.WriteLine($"Tickets sold: {Ticket.Sold}");\n\nclass Ticket\n{\n    public static int Sold;\n    public Ticket() { Sold++; }\n}',
        checks: [
          { label: 'A public static int field', re: 'public\\s+static\\s+int\\s+\\w+' },
          { label: 'The constructor adds one to it', re: 'public\\s+Ticket\\s*\\(\\s*\\)\\s*(\\{[^}]*(\\w+\\s*\\+\\+|\\+\\+\\s*\\w+|\\w+\\s*\\+=\\s*1)|=>\\s*(\\w+\\s*\\+\\+|\\+\\+\\s*\\w+))' },
          { label: 'Make three tickets', re: '(new\\s+Ticket\\s*\\(\\s*\\)[\\s\\S]*){3}' },
          { label: 'Read it through the class: Ticket.Name', re: 'WriteLine\\s*\\([^;]*Ticket\\.\\w+' },
        ],
        hint: 'static means one shared value. Read it with the class name, not an object.',
        explain: 'Every constructor call bumps the one shared Sold, so after three tickets it is 3.',
        output: 'Tickets sold: 3',
      },
      {
        kind: 'write',
        prompt: 'Write a static Temp class so these calls work.',
        starter: 'Console.WriteLine(Temp.ToF(20));\nConsole.WriteLine(Temp.ToC(212));\nConsole.WriteLine(Math.Max(Temp.ToF(0), 30));\n',
        solution:
          'Console.WriteLine(Temp.ToF(20));\nConsole.WriteLine(Temp.ToC(212));\nConsole.WriteLine(Math.Max(Temp.ToF(0), 30));\n\nstatic class Temp\n{\n    public static int ToF(int c) => c * 9 / 5 + 32;\n    public static int ToC(int f) => (f - 32) * 5 / 9;\n}',
        checks: [
          { label: 'static class Temp', re: 'static\\s+class\\s+Temp\\b' },
          { label: 'public static int ToF(int c): c * 9 / 5 + 32', re: 'public\\s+static\\s+int\\s+ToF\\s*\\(\\s*int\\s+\\w+\\s*\\)' },
          { label: 'public static int ToC(int f): (f - 32) * 5 / 9', re: 'public\\s+static\\s+int\\s+ToC\\s*\\(\\s*int\\s+\\w+\\s*\\)' },
          { label: 'Subtract 32 for ToC', re: '-\\s*32' },
        ],
        hint: 'Every member of a static class must be static too. Multiply before dividing to keep whole numbers right.',
        explain: 'No object needed: Temp.ToF(20) is 68 and Temp.ToC(212) is 100. Math.Max is a static method too.',
        output: '68\n100\n32',
      },
    ],
  ],
};

export default unit;
