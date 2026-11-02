import type { DesktopUnit } from '../../../engine/types';

// Desktop edition: write-the-code challenges for C# unit 19 (Reflection & attributes).
// lessons[i] runs after lesson i + 1. See docs/CONTENT_GUIDE.md.
const unit: DesktopUnit = {
  lessons: [
    // L1 typeof, GetType & nameof
    [
      {
        kind: 'write',
        prompt: 'Print the real type name of everything in a mixed inbox.',
        starter: 'object[] inbox = [42, "hello", 3.5, true];\n',
        solution:
          'object[] inbox = [42, "hello", 3.5, true];\nforeach (object item in inbox)\n    Console.WriteLine(item.GetType().Name);\nConsole.WriteLine(typeof(List<int>).Name);',
        checks: [
          { label: 'Loop over the inbox', re: 'foreach\\s*\\(\\s*(object|var)\\s+\\w+\\s+in\\s+inbox\\s*\\)' },
          { label: 'Print each item’s GetType().Name', re: '\\w+\\.GetType\\s*\\(\\s*\\)\\.Name' },
          { label: 'Also print typeof(List<int>).Name', re: 'typeof\\s*\\(\\s*List\\s*<\\s*int\\s*>\\s*\\)\\.Name' },
        ],
        hint: 'GetType() works on a value at run time; typeof(...) takes a type name you write in code.',
        explain: 'The variables are all object, but GetType() finds the real types. Generic names end in a backtick and the type-argument count.',
        output: 'Int32\nString\nDouble\nBoolean\nList`1',
      },
      {
        kind: 'write',
        prompt: 'Use nameof for the message, and check whether score is really an int.',
        starter:
          'CheckName("");\nobject score = 99L;\n// is score an int? print its full type name\n\nvoid CheckName(string name)\n{\n    if (name == "") Console.WriteLine("name is empty");\n}',
        solution:
          'CheckName("");\nobject score = 99L;\nConsole.WriteLine(score.GetType() == typeof(int));\nConsole.WriteLine(score.GetType().FullName);\n\nvoid CheckName(string name)\n{\n    if (name == "") Console.WriteLine($"{nameof(name)} is empty");\n}',
        checks: [
          { label: 'Build the message with nameof(name)', re: 'nameof\\s*\\(\\s*name\\s*\\)' },
          { label: 'No hard-coded "name is empty"', not: '"name is empty"' },
          { label: 'Compare score.GetType() with typeof(int)', re: 'score\\.GetType\\s*\\(\\s*\\)\\s*==\\s*typeof\\s*\\(\\s*int\\s*\\)|typeof\\s*\\(\\s*int\\s*\\)\\s*==\\s*score\\.GetType\\s*\\(\\s*\\)' },
          { label: 'Print its FullName', re: 'score\\.GetType\\s*\\(\\s*\\)\\.FullName' },
        ],
        hint: 'nameof(name) is the text "name", but it follows the parameter if you rename it.',
        explain: '99L is a long, so the types don’t match. FullName includes the namespace: System.Int64.',
        output: 'name is empty\nFalse\nSystem.Int64',
      },
    ],
    // L2 Listing members
    [
      {
        kind: 'write',
        prompt: 'List every property of a Movie class with its type.',
        starter: '',
        solution:
          'foreach (var p in typeof(Movie).GetProperties())\n    Console.WriteLine($"{p.Name}: {p.PropertyType.Name}");\n\nclass Movie\n{\n    public string Title { get; set; } = "";\n    public int Year { get; set; }\n    public bool Seen { get; set; }\n}',
        checks: [
          { label: 'A Movie class with three properties', re: 'class\\s+Movie\\s*\\{(\\s*public\\s+\\w+\\s+\\w+\\s*\\{\\s*get;[^}]*\\}[^\\n]*){3}' },
          { label: 'Loop over typeof(Movie).GetProperties()', re: 'typeof\\s*\\(\\s*Movie\\s*\\)\\.GetProperties\\s*\\(\\s*\\)' },
          { label: 'Print each Name', re: '\\w+\\.Name\\b' },
          { label: 'Print each PropertyType.Name', re: '\\.PropertyType\\.Name' },
        ],
        hint: 'GetProperties() gives PropertyInfo objects; each has Name and PropertyType.',
        explain: 'Reflection reads the class’s own description at run time. PropertyType is a Type, so .Name gives String, Int32, Boolean.',
        output: 'Title: String\nYear: Int32\nSeen: Boolean',
      },
      {
        kind: 'write',
        prompt: 'List only Robot’s own public instance methods, not inherited or static ones.',
        starter:
          'foreach (var m in typeof(Robot).GetMethods())\n    Console.WriteLine(m.Name);\n\nclass Robot\n{\n    public void Walk() { }\n    public void Beep() { }\n    private void Reboot() { }\n    public static Robot Build() => new();\n}',
        solution:
          'using System.Reflection;\n\nvar flags = BindingFlags.Public | BindingFlags.Instance | BindingFlags.DeclaredOnly;\nforeach (MethodInfo m in typeof(Robot).GetMethods(flags))\n    Console.WriteLine(m.Name);\n\nclass Robot\n{\n    public void Walk() { }\n    public void Beep() { }\n    private void Reboot() { }\n    public static Robot Build() => new();\n}',
        checks: [
          { label: 'using System.Reflection;', re: 'using\\s+System\\.Reflection\\s*;' },
          { label: 'BindingFlags.Public', has: 'BindingFlags.Public' },
          { label: 'BindingFlags.Instance', has: 'BindingFlags.Instance' },
          { label: 'BindingFlags.DeclaredOnly', has: 'BindingFlags.DeclaredOnly' },
          { label: 'Pass the flags to GetMethods', re: '\\.GetMethods\\s*\\(\\s*[^)\\s]' },
        ],
        hint: 'Combine flags with |. Without DeclaredOnly you also get ToString, Equals and friends from object.',
        explain: 'Public skips Reboot, Instance skips the static Build, and DeclaredOnly drops everything Robot inherits.',
        output: 'Walk\nBeep',
      },
    ],
    // L3 Get, set & create
    [
      {
        kind: 'write',
        prompt: 'Set a lamp’s Brightness through reflection, then read it back.',
        starter: 'var lamp = new Lamp();\n\nclass Lamp { public int Brightness { get; set; } }',
        solution:
          'var lamp = new Lamp();\nvar prop = typeof(Lamp).GetProperty("Brightness")!;\nprop.SetValue(lamp, 80);\nConsole.WriteLine(prop.GetValue(lamp));\nConsole.WriteLine(lamp.Brightness);\n\nclass Lamp { public int Brightness { get; set; } }',
        checks: [
          { label: 'Find it with GetProperty("Brightness")', re: '\\.GetProperty\\s*\\(\\s*"Brightness"\\s*\\)' },
          { label: 'Set it with SetValue(lamp, ...)', re: '\\.SetValue\\s*\\(\\s*lamp\\s*,\\s*\\d+\\s*\\)' },
          { label: 'Read it with GetValue(lamp)', re: '\\.GetValue\\s*\\(\\s*lamp\\s*\\)' },
        ],
        hint: 'GetProperty can return null, so add ! after it. SetValue takes the object and the new value.',
        explain: 'The PropertyInfo describes the property; SetValue and GetValue use it on a real lamp, so lamp.Brightness changes too.',
        output: '80\n80',
      },
      {
        kind: 'write',
        prompt: 'Create each pet from its Type and call its Speak method by name.',
        starter:
          'Type[] pets = [typeof(Dog), typeof(Cat)];\n// make each pet and call Speak\n\nclass Dog { public string Speak() => "Woof"; }\nclass Cat { public string Speak() => "Meow"; }',
        solution:
          'Type[] pets = [typeof(Dog), typeof(Cat)];\nforeach (Type t in pets)\n{\n    object pet = Activator.CreateInstance(t)!;\n    var speak = t.GetMethod("Speak")!;\n    Console.WriteLine($"{t.Name}: {speak.Invoke(pet, null)}");\n}\n\nclass Dog { public string Speak() => "Woof"; }\nclass Cat { public string Speak() => "Meow"; }',
        checks: [
          { label: 'Loop over the types', re: 'foreach\\s*\\(\\s*(Type|var)\\s+\\w+\\s+in\\s+pets\\s*\\)' },
          { label: 'Build each with Activator.CreateInstance', re: 'Activator\\.CreateInstance\\s*\\(\\s*\\w+\\s*\\)' },
          { label: 'Find the method with GetMethod("Speak")', re: '\\.GetMethod\\s*\\(\\s*"Speak"\\s*\\)' },
          { label: 'Call it with Invoke', re: '\\.Invoke\\s*\\(\\s*\\w+\\s*,\\s*(null|\\[\\s*\\]|Array\\.Empty\\s*<\\s*object\\??\\s*>\\s*\\(\\s*\\))\\s*\\)' },
        ],
        hint: 'Invoke takes the object to call it on and the arguments; Speak has none, so pass null.',
        explain: 'Nothing here names Dog or Cat after the array: the types are picked at run time, which is how plugins load.',
        output: 'Dog: Woof\nCat: Meow',
      },
    ],
    // L4 Custom attributes
    [
      {
        kind: 'write',
        prompt: 'Declare a Route attribute for classes, put it on ShopPage, and read it back.',
        starter: 'using System.Reflection;\n\nclass ShopPage { }',
        solution:
          'using System.Reflection;\n\nvar route = typeof(ShopPage).GetCustomAttribute<RouteAttribute>();\nConsole.WriteLine(route?.Path);\n\n[AttributeUsage(AttributeTargets.Class)]\nclass RouteAttribute(string path) : Attribute\n{\n    public string Path => path;\n}\n\n[Route("/shop")]\nclass ShopPage { }',
        checks: [
          { label: 'A RouteAttribute class that derives from Attribute', re: 'class\\s+RouteAttribute\\b[^{]*:\\s*Attribute\\b' },
          { label: 'Limit it to classes with [AttributeUsage]', re: '\\[\\s*AttributeUsage\\s*\\(\\s*AttributeTargets\\.Class\\b' },
          { label: 'Apply [Route("/shop")] to ShopPage', re: '\\[\\s*Route\\s*\\(\\s*"/shop"\\s*\\)\\s*\\]\\s*class\\s+ShopPage' },
          { label: 'Read it with GetCustomAttribute<RouteAttribute>()', re: 'GetCustomAttribute\\s*<\\s*RouteAttribute\\s*>\\s*\\(\\s*\\)' },
        ],
        hint: 'Declare RouteAttribute, but apply it as [Route(...)]. It needs a property to hold the path.',
        explain: 'The attribute is stored in the class’s metadata; GetCustomAttribute builds it again so you can read Path.',
        output: '/shop',
      },
      {
        kind: 'write',
        prompt: 'Mark Password with a [Secret] attribute and mask secret values when printing.',
        starter:
          'using System.Reflection;\n\nvar user = new Account { Name = "mia", Password = "hunter2", Email = "mia@x.io" };\nforeach (PropertyInfo p in typeof(Account).GetProperties())\n    Console.WriteLine($"{p.Name}: {p.GetValue(user)}");\n\nclass Account\n{\n    public string Name { get; set; } = "";\n    public string Password { get; set; } = "";\n    public string Email { get; set; } = "";\n}',
        solution:
          'using System.Reflection;\n\nvar user = new Account { Name = "mia", Password = "hunter2", Email = "mia@x.io" };\nforeach (PropertyInfo p in typeof(Account).GetProperties())\n{\n    bool hidden = p.GetCustomAttribute<SecretAttribute>() != null;\n    Console.WriteLine($"{p.Name}: {(hidden ? "***" : p.GetValue(user))}");\n}\n\n[AttributeUsage(AttributeTargets.Property)]\nclass SecretAttribute : Attribute { }\n\nclass Account\n{\n    public string Name { get; set; } = "";\n    [Secret] public string Password { get; set; } = "";\n    public string Email { get; set; } = "";\n}',
        checks: [
          { label: 'class SecretAttribute : Attribute', re: 'class\\s+SecretAttribute\\s*:\\s*Attribute\\b' },
          { label: 'Allow it on properties with [AttributeUsage]', re: '\\[\\s*AttributeUsage\\s*\\(\\s*AttributeTargets\\.Property\\b' },
          { label: 'Put [Secret] on Password', re: '\\[\\s*Secret\\s*\\]\\s*public\\s+string\\s+Password' },
          { label: 'Look for it with GetCustomAttribute<SecretAttribute>()', re: 'GetCustomAttribute\\s*<\\s*SecretAttribute\\s*>\\s*\\(\\s*\\)' },
          { label: 'Print *** instead of a secret value', has: '"***"' },
        ],
        hint: 'GetCustomAttribute<T>() returns null when the property doesn’t have it.',
        explain: 'The attribute is a label on the property; the printing code checks for it and hides the value.',
        output: 'Name: mia\nPassword: ***\nEmail: mia@x.io',
      },
    ],
    // L5 Built-in attributes
    [
      {
        kind: 'write',
        prompt: 'Report which Thermostat property changed using [CallerMemberName].',
        starter: '',
        solution:
          'using System.Runtime.CompilerServices;\n\nvar t = new Thermostat();\nt.Target = 21;\nt.Mode = "Eco";\n\nclass Thermostat\n{\n    int target;\n    string mode = "Off";\n    public int Target { get => target; set { target = value; Changed(); } }\n    public string Mode { get => mode; set { mode = value; Changed(); } }\n    void Changed([CallerMemberName] string prop = "") => Console.WriteLine($"{prop} changed");\n}',
        checks: [
          { label: 'using System.Runtime.CompilerServices;', re: 'using\\s+System\\.Runtime\\.CompilerServices\\s*;' },
          { label: 'A method with an optional [CallerMemberName] string', re: '\\[\\s*CallerMemberName\\s*\\]\\s*string\\s+\\w+\\s*=\\s*""' },
          { label: 'Two property setters that call it with no name', re: '(set\\s*\\{[^}]*\\b\\w+\\s*\\(\\s*\\)\\s*;[^}]*\\}[\\s\\S]*){2}' },
          { label: 'Set both properties', re: '\\w+\\.\\w+\\s*=\\s*\\d+\\s*;[\\s\\S]*\\w+\\.\\w+\\s*=\\s*"' },
        ],
        hint: 'Each setter stores value, then calls Changed(); the compiler fills in the property’s name.',
        explain: 'Called from a setter, [CallerMemberName] gets the property’s name, so no name is typed twice.',
        output: 'Target changed\nMode changed',
      },
      {
        kind: 'write',
        prompt: 'Retire Charge with [Obsolete], log callers by name, and print Charge’s note.',
        starter:
          'var till = new Till();\ntill.Pay(5);\ntill.Refund(2);\n\nclass Till\n{\n    public void Charge(int amount) => Console.WriteLine($"Charged {amount}");\n    public void Pay(int amount) => Log($"paid {amount}");\n    public void Refund(int amount) => Log($"refunded {amount}");\n    void Log(string msg, string who) => Console.WriteLine($"{who}: {msg}");\n}',
        solution:
          'using System.Reflection;\nusing System.Runtime.CompilerServices;\n\nvar till = new Till();\ntill.Pay(5);\ntill.Refund(2);\nvar old = typeof(Till).GetMethod("Charge")!.GetCustomAttribute<ObsoleteAttribute>();\nConsole.WriteLine(old?.Message);\n\nclass Till\n{\n    [Obsolete("Use Pay")]\n    public void Charge(int amount) => Console.WriteLine($"Charged {amount}");\n    public void Pay(int amount) => Log($"paid {amount}");\n    public void Refund(int amount) => Log($"refunded {amount}");\n    void Log(string msg, [CallerMemberName] string who = "") => Console.WriteLine($"{who}: {msg}");\n}',
        checks: [
          { label: 'Mark Charge [Obsolete("Use Pay")]', re: '\\[\\s*Obsolete\\s*\\(\\s*"Use Pay"\\s*\\)\\s*\\]\\s*public\\s+void\\s+Charge' },
          { label: 'Fill who with [CallerMemberName] = ""', re: '\\[\\s*CallerMemberName\\s*\\]\\s*string\\s+who\\s*=\\s*""' },
          { label: 'Read the ObsoleteAttribute from Charge', re: 'GetMethod\\s*\\(\\s*"Charge"\\s*\\)[^;]*GetCustomAttribute\\s*<\\s*ObsoleteAttribute\\s*>' },
          { label: 'Print its Message', re: '\\w+\\??\\.Message\\b' },
        ],
        hint: 'You need two usings: System.Reflection for GetCustomAttribute and System.Runtime.CompilerServices for CallerMemberName.',
        explain: '[Obsolete] warns anyone who calls Charge, and its message is also readable by reflection. Pay and Refund fill in who by themselves.',
        output: 'Pay: paid 5\nRefund: refunded 2\nUse Pay',
      },
    ],
  ],
};

export default unit;
