import type { DesktopUnit } from '../../../engine/types';

// Desktop edition: write-the-code challenges for C# unit 9 (Inheritance & interfaces).
// lessons[i] runs after lesson i + 1. See docs/CONTENT_GUIDE.md.
const unit: DesktopUnit = {
  lessons: [
    // L1 Inheriting a class
    [
      {
        kind: 'write',
        prompt: 'Make a Vehicle with a Wheels field, and a Bike subclass with a Ring method.',
        starter: '',
        solution:
          'var bike = new Bike();\nbike.Wheels = 2;\nConsole.WriteLine($"Wheels: {bike.Wheels}");\nbike.Ring();\n\nclass Vehicle\n{\n    public int Wheels;\n}\n\nclass Bike : Vehicle\n{\n    public void Ring() => Console.WriteLine("Ring ring!");\n}',
        checks: [
          { label: 'A Vehicle class with a public int Wheels', re: 'class\\s+Vehicle\\s*\\{[^}]*public\\s+int\\s+Wheels' },
          { label: 'class Bike : Vehicle', re: 'class\\s+Bike\\s*:\\s*Vehicle\\b' },
          { label: 'Bike has a public Ring() method', re: 'class\\s+Bike[^{]*\\{[^}]*public\\s+void\\s+Ring\\s*\\(\\s*\\)' },
          { label: 'Use the inherited Wheels on a Bike', re: '\\w+\\.Wheels\\s*=' },
          { label: 'Call Ring()', re: '\\w+\\.Ring\\s*\\(\\s*\\)\\s*;' },
        ],
        hint: 'class Bike : Vehicle { ... } gives every Bike the Wheels field for free.',
        explain: 'Bike inherits Wheels from Vehicle and adds its own Ring method on top.',
        output: 'Wheels: 2\nRing ring!',
      },
      {
        kind: 'write',
        prompt: 'Fix the access so Cat can use energy, but outside code still can’t.',
        starter:
          'var cat = new Cat();\ncat.Nap();\ncat.Nap();\ncat.Status();\n\nclass Animal\n{\n    private int energy = 1;\n}\n\nclass Cat : Animal\n{\n    public void Nap() => energy += 2;\n    public void Status() => Console.WriteLine($"Energy: {energy}");\n}',
        solution:
          'var cat = new Cat();\ncat.Nap();\ncat.Nap();\ncat.Status();\n\nclass Animal\n{\n    protected int energy = 1;\n}\n\nclass Cat : Animal\n{\n    public void Nap() => energy += 2;\n    public void Status() => Console.WriteLine($"Energy: {energy}");\n}',
        checks: [
          { label: 'Make energy protected', has: 'protected int energy' },
          { label: 'Not private (subclasses can’t see it)', not: 'private int energy' },
          { label: 'Not public (outside code would see it)', not: 'public int energy' },
        ],
        hint: 'One access word sits between private and public: open to subclasses only.',
        explain: 'protected lets Cat’s methods use energy while code outside the classes still can’t. 1 + 2 + 2 is 5.',
        output: 'Energy: 5',
      },
    ],
    // L2 base & constructors
    [
      {
        kind: 'write',
        prompt: 'Add a Savings subclass whose constructor passes the owner to base.',
        starter: '\nclass Account\n{\n    public string Owner;\n    public Account(string owner) { Owner = owner; }\n}',
        solution:
          'var acc = new Savings("Priya", 3);\nConsole.WriteLine($"{acc.Owner} earns {acc.Rate}%");\n\nclass Account\n{\n    public string Owner;\n    public Account(string owner) { Owner = owner; }\n}\n\nclass Savings : Account\n{\n    public int Rate;\n    public Savings(string owner, int rate) : base(owner)\n    {\n        Rate = rate;\n    }\n}',
        checks: [
          { label: 'class Savings : Account', re: 'class\\s+Savings\\s*:\\s*Account\\b' },
          { label: 'Its constructor calls : base(owner)', re: 'public\\s+Savings\\s*\\([^)]*\\)\\s*:\\s*base\\s*\\(\\s*\\w+\\s*\\)' },
          { label: 'Store the extra rate in its own field', re: 'class\\s+Savings[\\s\\S]*\\w+\\s*=\\s*\\w+\\s*;' },
          { label: 'Create a Savings and print it, above the classes', re: 'new\\s+Savings\\s*\\([\\s\\S]*Console\\.WriteLine[\\s\\S]*class\\s+Account' },
        ],
        hint: 'Account has no empty constructor, so Savings must hand it an owner with : base(owner).',
        explain: 'Constructors aren’t inherited. : base(owner) runs Account’s constructor first, then the Savings body.',
        output: 'Priya earns 3%',
      },
      {
        kind: 'write',
        prompt: 'Give Truck a base(...) constructor and a Details method that calls base.Describe().',
        starter:
          'var truck = new Truck("Volvo", 18);\ntruck.Details();\n\nclass Vehicle\n{\n    public string Brand;\n    public Vehicle(string brand) { Brand = brand; }\n    public void Describe() => Console.WriteLine($"Brand: {Brand}");\n}\n\nclass Truck : Vehicle\n{\n    public int Tonnes;\n}',
        solution:
          'var truck = new Truck("Volvo", 18);\ntruck.Details();\n\nclass Vehicle\n{\n    public string Brand;\n    public Vehicle(string brand) { Brand = brand; }\n    public void Describe() => Console.WriteLine($"Brand: {Brand}");\n}\n\nclass Truck : Vehicle\n{\n    public int Tonnes;\n    public Truck(string brand, int tonnes) : base(brand)\n    {\n        Tonnes = tonnes;\n    }\n    public void Details()\n    {\n        base.Describe();\n        Console.WriteLine($"Load: {Tonnes} t");\n    }\n}',
        checks: [
          { label: 'Truck(string brand, int tonnes) : base(brand)', re: 'public\\s+Truck\\s*\\(\\s*string\\s+\\w+\\s*,\\s*int\\s+\\w+\\s*\\)\\s*:\\s*base\\s*\\(\\s*\\w+\\s*\\)' },
          { label: 'Set Tonnes in the constructor', re: 'Tonnes\\s*=\\s*\\w+\\s*;' },
          { label: 'A public void Details()', re: 'public\\s+void\\s+Details\\s*\\(\\s*\\)' },
          { label: 'Details calls base.Describe() then prints the load', re: 'base\\.Describe\\s*\\(\\s*\\)\\s*;\\s*Console\\.WriteLine\\s*\\([^;]*Tonnes' },
        ],
        hint: 'base(brand) passes the brand up; base.Describe() runs the parent’s method.',
        explain: 'Vehicle sets Brand, Truck sets Tonnes, and Details reuses Describe before adding its own line.',
        output: 'Brand: Volvo\nLoad: 18 t',
      },
    ],
    // L3 virtual & override
    [
      {
        kind: 'write',
        prompt: 'Make Instrument.Play virtual and override it in Drum and Flute.',
        starter: '',
        solution:
          'Instrument[] band = [new Drum(), new Flute()];\nforeach (Instrument item in band) item.Play();\n\nclass Instrument\n{\n    public virtual void Play() => Console.WriteLine("...");\n}\n\nclass Drum : Instrument\n{\n    public override void Play() => Console.WriteLine("Boom");\n}\n\nclass Flute : Instrument\n{\n    public override void Play() => Console.WriteLine("Toot");\n}',
        checks: [
          { label: 'public virtual void Play() in Instrument', re: 'class\\s+Instrument\\s*\\{[^}]*public\\s+virtual\\s+void\\s+Play\\s*\\(\\s*\\)' },
          { label: 'Drum and Flute both inherit Instrument', re: '(?=[\\s\\S]*class\\s+Drum\\s*:\\s*Instrument)(?=[\\s\\S]*class\\s+Flute\\s*:\\s*Instrument)' },
          { label: 'Two public override void Play()', re: '(public\\s+override\\s+void\\s+Play\\s*\\(\\s*\\)[\\s\\S]*){2}' },
          { label: 'Call Play through Instrument-typed variables', re: 'Instrument(\\[\\])?\\s+\\w+\\s*(=|in\\b)[\\s\\S]*\\.Play\\s*\\(\\s*\\)' },
        ],
        hint: 'virtual in the base, override in each subclass, same name and signature.',
        explain: 'Even through Instrument variables, each object runs its own override: Boom, then Toot.',
        output: 'Boom\nToot',
      },
      {
        kind: 'write',
        prompt: 'Override ToString in Pizza, then again in Calzone to add (folded).',
        starter:
          'Pizza a = new Pizza("Margherita", 9);\nPizza b = new Calzone("Ham", 11);\nConsole.WriteLine(a);\nConsole.WriteLine(b);\n\nclass Pizza\n{\n    public string Name;\n    public int Price;\n    public Pizza(string name, int price) { Name = name; Price = price; }\n}\n\nclass Calzone : Pizza\n{\n    public Calzone(string name, int price) : base(name, price) { }\n}',
        solution:
          'Pizza a = new Pizza("Margherita", 9);\nPizza b = new Calzone("Ham", 11);\nConsole.WriteLine(a);\nConsole.WriteLine(b);\n\nclass Pizza\n{\n    public string Name;\n    public int Price;\n    public Pizza(string name, int price) { Name = name; Price = price; }\n    public override string ToString() => $"{Name}: {Price} euros";\n}\n\nclass Calzone : Pizza\n{\n    public Calzone(string name, int price) : base(name, price) { }\n    public override string ToString() => base.ToString() + " (folded)";\n}',
        checks: [
          { label: 'public override string ToString() in Pizza', re: 'class\\s+Pizza\\s*\\{[\\s\\S]*public\\s+override\\s+string\\s+ToString\\s*\\(\\s*\\)[\\s\\S]*class\\s+Calzone' },
          { label: 'Pizza’s version shows Name and Price', re: 'ToString\\s*\\(\\s*\\)\\s*(=>|\\{)[^;]*(Name[^;]*Price|Price[^;]*Name)' },
          { label: 'Calzone overrides it too', re: 'class\\s+Calzone[\\s\\S]*public\\s+override\\s+string\\s+ToString\\s*\\(\\s*\\)' },
          { label: 'Calzone reuses base.ToString() and adds (folded)', re: 'base\\.ToString\\s*\\(\\s*\\)[^;]*\\(folded\\)' },
        ],
        hint: 'WriteLine calls ToString() for you. In Calzone, base.ToString() gives Pizza’s text.',
        explain: 'Without an override you’d see the class name, Pizza. b is a Calzone, so its own ToString runs.',
        output: 'Margherita: 9 euros\nHam: 11 euros (folded)',
      },
    ],
    // L4 Abstract classes
    [
      {
        kind: 'write',
        prompt: 'Make an abstract Shape with an abstract Area, and a Triangle that overrides it.',
        starter: '',
        solution:
          'Shape shape = new Triangle();\nConsole.WriteLine(shape.Area());\n\nabstract class Shape\n{\n    public abstract double Area();\n}\n\nclass Triangle : Shape\n{\n    public double Base = 6;\n    public double Height = 4;\n    public override double Area() => Base * Height / 2;\n}',
        checks: [
          { label: 'abstract class Shape', re: 'abstract\\s+class\\s+Shape\\b' },
          { label: 'public abstract double Area(); with no body', re: 'public\\s+abstract\\s+double\\s+Area\\s*\\(\\s*\\)\\s*;' },
          { label: 'class Triangle : Shape', re: 'class\\s+Triangle\\s*:\\s*Shape\\b' },
          { label: 'Triangle overrides Area: base × height / 2', re: 'public\\s+override\\s+double\\s+Area\\s*\\(\\s*\\)[^;]*/\\s*2' },
        ],
        hint: 'An abstract method ends in ; instead of a body. The subclass fills it in with override.',
        explain: 'You can’t write new Shape(), but a Shape variable can hold a Triangle. 6 × 4 / 2 is 12.',
        output: '12',
      },
      {
        kind: 'write',
        prompt: 'Make this compile: finish Manager and add the missing Intern class.',
        starter:
          'Employee[] staff = [new Manager("Ines"), new Intern("Tom")];\nforeach (var e in staff) Console.WriteLine($"{e.Name}: {e.Pay()}");\n\nabstract class Employee\n{\n    public string Name;\n    public Employee(string name) { Name = name; }\n    public abstract int Pay();\n}\n\nclass Manager : Employee\n{\n    public Manager(string name) : base(name) { }\n}',
        solution:
          'Employee[] staff = [new Manager("Ines"), new Intern("Tom")];\nforeach (var e in staff) Console.WriteLine($"{e.Name}: {e.Pay()}");\n\nabstract class Employee\n{\n    public string Name;\n    public Employee(string name) { Name = name; }\n    public abstract int Pay();\n}\n\nclass Manager : Employee\n{\n    public Manager(string name) : base(name) { }\n    public override int Pay() => 5000;\n}\n\nclass Intern : Employee\n{\n    public Intern(string name) : base(name) { }\n    public override int Pay() => 1200;\n}',
        checks: [
          { label: 'Manager overrides Pay()', re: 'class\\s+Manager\\s*:\\s*Employee\\s*\\{(?:[^{}]|\\{\\s*\\})*public\\s+override\\s+int\\s+Pay\\s*\\(\\s*\\)' },
          { label: 'class Intern : Employee', re: 'class\\s+Intern\\s*:\\s*Employee\\b' },
          { label: 'Intern passes its name to base', re: 'public\\s+Intern\\s*\\(\\s*string\\s+\\w+\\s*\\)\\s*:\\s*base\\s*\\(\\s*\\w+\\s*\\)' },
          { label: 'Intern overrides Pay() too', re: 'class\\s+Intern[\\s\\S]*public\\s+override\\s+int\\s+Pay\\s*\\(\\s*\\)' },
          { label: 'Keep Employee abstract', has: 'abstract class Employee' },
        ],
        hint: 'Every non-abstract subclass must override each abstract method, and pass name up with : base(name).',
        explain: 'The abstract Pay forces every kind of employee to say how it’s paid; the loop calls each one’s version.',
        output: 'Ines: 5000\nTom: 1200',
      },
    ],
    // L5 Implementing interfaces
    [
      {
        kind: 'write',
        prompt: 'Define an IPlayable interface and implement it in Song and Podcast.',
        starter: '',
        solution:
          'IPlayable[] queue = [new Song(), new Podcast()];\nforeach (IPlayable item in queue) item.Play();\n\ninterface IPlayable\n{\n    void Play();\n}\n\nclass Song : IPlayable\n{\n    public void Play() => Console.WriteLine("Playing song");\n}\n\nclass Podcast : IPlayable\n{\n    public void Play() => Console.WriteLine("Playing podcast");\n}',
        checks: [
          { label: 'interface IPlayable { void Play(); }', re: 'interface\\s+IPlayable\\s*\\{\\s*void\\s+Play\\s*\\(\\s*\\)\\s*;\\s*\\}' },
          { label: 'Song and Podcast both : IPlayable', re: '(?=[\\s\\S]*class\\s+Song\\s*:\\s*IPlayable)(?=[\\s\\S]*class\\s+Podcast\\s*:\\s*IPlayable)' },
          { label: 'Each has a public void Play()', re: '(public\\s+void\\s+Play\\s*\\(\\s*\\)[\\s\\S]*){2}' },
          { label: 'Play them through an IPlayable variable or array', re: 'IPlayable(\\[\\])?\\s+\\w+\\s*(=|in\\b)[\\s\\S]*\\.Play\\s*\\(\\s*\\)' },
        ],
        hint: 'Interface members have no body and no public. The classes must make Play public.',
        explain: 'An IPlayable variable can hold anything that keeps the promise, so one loop plays both.',
        output: 'Playing song\nPlaying podcast',
      },
      {
        kind: 'write',
        prompt: 'Write a Scooter that implements both interfaces, then use it through each.',
        starter: 'var scooter = new Scooter();\n\ninterface ICharge { int Battery(); }\ninterface IDrive { string Move(); }',
        solution:
          'var scooter = new Scooter();\nICharge charge = scooter;\nIDrive drive = scooter;\nConsole.WriteLine($"Battery: {charge.Battery()}%");\nConsole.WriteLine(drive.Move());\n\ninterface ICharge { int Battery(); }\ninterface IDrive { string Move(); }\n\nclass Scooter : ICharge, IDrive\n{\n    public int Battery() => 80;\n    public string Move() => "Zooming";\n}',
        checks: [
          { label: 'class Scooter : ICharge, IDrive', re: 'class\\s+Scooter\\s*:\\s*(ICharge\\s*,\\s*IDrive|IDrive\\s*,\\s*ICharge)\\b' },
          { label: 'public int Battery()', re: 'public\\s+int\\s+Battery\\s*\\(\\s*\\)' },
          { label: 'public string Move()', re: 'public\\s+string\\s+Move\\s*\\(\\s*\\)' },
          { label: 'An ICharge variable and an IDrive variable', re: '(?=[\\s\\S]*ICharge\\s+\\w+\\s*=)(?=[\\s\\S]*IDrive\\s+\\w+\\s*=)' },
          { label: 'Statements go above the interfaces', re: 'Console\\.WriteLine[\\s\\S]*interface\\s+ICharge' },
        ],
        hint: 'List both interfaces after the colon with a comma, and implement every member of each.',
        explain: 'One Scooter keeps two promises, so it fits in an ICharge variable and an IDrive variable.',
        output: 'Battery: 80%\nZooming',
      },
    ],
  ],
};

export default unit;
