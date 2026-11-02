import type { DesktopUnit } from '../../../engine/types';

// Desktop edition: write-the-code challenges for ASP.NET unit 2 (Dependency injection).
// lessons[i] runs after lesson i + 1. See docs/CONTENT_GUIDE.md.
const unit: DesktopUnit = {
  lessons: [
    // L1 Register & inject
    [
      {
        kind: 'write',
        prompt: 'Write an IQuotes service, register it, and serve its quote at GET /quote.',
        starter: 'var builder = WebApplication.CreateBuilder(args);\n',
        solution:
          'var builder = WebApplication.CreateBuilder(args);\nbuilder.Services.AddSingleton<IQuotes, FixedQuotes>();\nvar app = builder.Build();\n\napp.MapGet("/quote", (IQuotes quotes) => quotes.Today());\n\napp.Run();\n\ninterface IQuotes { string Today(); }\n\nclass FixedQuotes : IQuotes\n{\n    public string Today() => "Ship it.";\n}',
        checks: [
          { label: 'An interface IQuotes with a method', re: 'interface\\s+IQuotes\\s*\\{[^}]*\\w+\\s*\\(' },
          { label: 'A class that implements IQuotes', re: 'class\\s+\\w+\\s*:\\s*IQuotes\\b' },
          { label: 'Register it as IQuotes on builder.Services', re: 'builder\\.Services\\.Add(Singleton|Scoped|Transient)<\\s*IQuotes\\s*,\\s*\\w+\\s*>\\(\\s*\\)' },
          { label: 'Register before builder.Build()', re: 'Add(Singleton|Scoped|Transient)<[^>]*>\\(\\s*\\)\\s*;[\\s\\S]*\\.Build\\(\\)' },
          { label: 'GET /quote takes an IQuotes parameter', re: 'MapGet\\(\\s*"/quote"\\s*,\\s*\\(\\s*(\\[FromServices\\]\\s*)?IQuotes\\s+\\w+\\s*\\)' },
        ],
        hint: 'Register with Add…<IQuotes, YourClass>() before Build, then ask for IQuotes in the lambda.',
        explain: 'The handler only knows the interface; the container hands it the class you registered for that interface.',
        output: 'Ship it.',
      },
      {
        kind: 'write',
        prompt: 'Stop newing up TaxCalculator in the handler: inject it through an interface.',
        starter:
          'var app = builder.Build();\n\napp.MapGet("/tax/{amount:decimal}", (decimal amount) =>\n{\n    var calc = new TaxCalculator();\n    return calc.Add(amount);\n});\n\nclass TaxCalculator\n{\n    public decimal Add(decimal amount) => amount * 1.2m;\n}',
        solution:
          'builder.Services.AddSingleton<ITaxCalculator, TaxCalculator>();\nvar app = builder.Build();\n\napp.MapGet("/tax/{amount:decimal}", (decimal amount, ITaxCalculator calc) => calc.Add(amount));\n\ninterface ITaxCalculator\n{\n    decimal Add(decimal amount);\n}\n\nclass TaxCalculator : ITaxCalculator\n{\n    public decimal Add(decimal amount) => amount * 1.2m;\n}',
        checks: [
          { label: 'An ITaxCalculator interface', re: 'interface\\s+ITaxCalculator\\b' },
          { label: 'TaxCalculator implements it', re: 'class\\s+TaxCalculator\\s*:\\s*ITaxCalculator\\b' },
          { label: 'Register it before Build()', re: 'Add(Singleton|Scoped|Transient)<\\s*ITaxCalculator\\s*,\\s*TaxCalculator\\s*>\\(\\s*\\)[\\s\\S]*\\.Build\\(\\)' },
          { label: 'The handler takes an ITaxCalculator parameter', re: 'MapGet\\([^;]*(\\(|,)\\s*(\\[FromServices\\]\\s*)?ITaxCalculator\\s+\\w+' },
          { label: 'No new TaxCalculator() in the handler', not: 'new TaxCalculator()' },
        ],
        hint: 'Add the interface, register the pair, and put ITaxCalculator next to amount in the lambda.',
        explain: 'Now the endpoint depends on an interface, so a test or a new tax rule can swap the class without touching the handler.',
      },
    ],
    // L2 Service lifetimes
    [
      {
        kind: 'write',
        prompt: 'Share one visit counter across the app, but give each request its own cart.',
        starter:
          'var builder = WebApplication.CreateBuilder(args);\n\nvar app = builder.Build();\n\nclass VisitCounter\n{\n    private int count;\n    public int Next() => Interlocked.Increment(ref count);\n}\n\nclass Cart\n{\n    public List<string> Items { get; } = [];\n}',
        solution:
          'var builder = WebApplication.CreateBuilder(args);\nbuilder.Services.AddSingleton<VisitCounter>();\nbuilder.Services.AddScoped<Cart>();\nvar app = builder.Build();\n\napp.MapGet("/visit", (VisitCounter counter) => $"Visit #{counter.Next()}");\n\nclass VisitCounter\n{\n    private int count;\n    public int Next() => Interlocked.Increment(ref count);\n}\n\nclass Cart\n{\n    public List<string> Items { get; } = [];\n}',
        checks: [
          { label: 'VisitCounter as a singleton', has: 'builder.Services.AddSingleton<VisitCounter>()' },
          { label: 'Cart as scoped', has: 'builder.Services.AddScoped<Cart>()' },
          { label: 'Both registered before Build()', re: '^(?![\\s\\S]*\\.Build\\(\\)[\\s\\S]*\\.Add(Singleton|Scoped)<)' },
          { label: 'A GET endpoint that injects VisitCounter', re: 'MapGet\\([^;]*VisitCounter\\s+\\w+' },
        ],
        hint: 'AddSingleton lives as long as the app; AddScoped lives for one request.',
        explain: 'One shared counter keeps counting across all requests, while scoped carts start empty for every request.',
        output: 'Visit #1',
      },
      {
        kind: 'write',
        prompt: 'Build() throws: SalesReport is a singleton holding a scoped ShopDb. Fix it.',
        starter:
          'builder.Services.AddScoped<ShopDb>();\nbuilder.Services.AddSingleton<SalesReport>();\nvar app = builder.Build();\n\napp.MapGet("/report", (SalesReport report) => report.Today());\n\nclass SalesReport(ShopDb db)\n{\n    public string Today() => $"{db.OrderCount()} orders today";\n}\n\nclass ShopDb\n{\n    public int OrderCount() => 42;\n}',
        solution:
          'builder.Services.AddScoped<ShopDb>();\nbuilder.Services.AddScoped<SalesReport>();\nvar app = builder.Build();\n\napp.MapGet("/report", (SalesReport report) => report.Today());\n\nclass SalesReport(ShopDb db)\n{\n    public string Today() => $"{db.OrderCount()} orders today";\n}\n\nclass ShopDb\n{\n    public int OrderCount() => 42;\n}',
        checks: [
          { label: 'SalesReport is no longer a singleton', not: 'AddSingleton<SalesReport>' },
          { label: 'Register SalesReport as scoped or transient', re: 'Add(Scoped|Transient)<\\s*SalesReport\\s*>\\(\\s*\\)' },
          { label: 'ShopDb stays scoped', has: 'AddScoped<ShopDb>()' },
        ],
        hint: 'A service can only depend on things that live at least as long as it does.',
        explain: 'A singleton would keep the first request’s ShopDb forever. Scoped SalesReport gets a fresh ShopDb each request.',
        output: '42 orders today',
      },
    ],
    // L3 Constructor injection
    [
      {
        kind: 'write',
        prompt: 'Write OrderMailer: it takes an IEmailSender in its constructor and uses it.',
        starter: 'interface IEmailSender\n{\n    string Send(string message);\n}\n',
        solution:
          'interface IEmailSender\n{\n    string Send(string message);\n}\n\nclass OrderMailer\n{\n    private readonly IEmailSender _sender;\n\n    public OrderMailer(IEmailSender sender)\n    {\n        _sender = sender;\n    }\n\n    public string Confirm(int orderId) => _sender.Send($"Order {orderId} confirmed");\n}',
        checks: [
          { label: 'A class OrderMailer', re: 'class\\s+OrderMailer\\b' },
          { label: 'A private readonly IEmailSender field', re: 'private\\s+readonly\\s+IEmailSender\\s+\\w+\\s*;' },
          { label: 'A constructor that takes IEmailSender', re: 'public\\s+OrderMailer\\s*\\(\\s*IEmailSender\\s+\\w+\\s*\\)' },
          { label: 'Store the parameter in the field', re: '\\b(this\\.)?\\w+\\s*=\\s*\\w+\\s*;' },
          { label: 'A method that calls Send on the field', re: '\\b\\w+\\.Send\\(' },
        ],
        hint: 'Field, constructor that assigns it, then a method that uses it.',
        explain: 'The container sees the constructor parameter and passes in the registered IEmailSender. readonly stops anything else replacing it.',
      },
      {
        kind: 'write',
        prompt: 'Register everything Checkout needs, then use it in POST /checkout/{sku}.',
        starter:
          'builder.Services.AddScoped<Checkout>();\nvar app = builder.Build();\n\ninterface IPayments { bool Charge(decimal total); }\nclass CardPayments : IPayments { public bool Charge(decimal total) => total > 0; }\nclass Stock { public bool Reserve(string sku) => true; }\n\nclass Checkout\n{\n    private readonly IPayments _payments;\n    private readonly Stock _stock;\n    public Checkout(IPayments payments, Stock stock) { _payments = payments; _stock = stock; }\n    public string Buy(string sku, decimal price) =>\n        _stock.Reserve(sku) && _payments.Charge(price) ? $"Bought {sku}" : "Failed";\n}',
        solution:
          'builder.Services.AddScoped<Checkout>();\nbuilder.Services.AddScoped<IPayments, CardPayments>();\nbuilder.Services.AddScoped<Stock>();\nvar app = builder.Build();\n\napp.MapPost("/checkout/{sku}", (string sku, Checkout checkout) => checkout.Buy(sku, 12m));\n\ninterface IPayments { bool Charge(decimal total); }\nclass CardPayments : IPayments { public bool Charge(decimal total) => total > 0; }\nclass Stock { public bool Reserve(string sku) => true; }\n\nclass Checkout\n{\n    private readonly IPayments _payments;\n    private readonly Stock _stock;\n    public Checkout(IPayments payments, Stock stock) { _payments = payments; _stock = stock; }\n    public string Buy(string sku, decimal price) =>\n        _stock.Reserve(sku) && _payments.Charge(price) ? $"Bought {sku}" : "Failed";\n}',
        checks: [
          { label: 'Register IPayments as CardPayments', re: 'Add(Singleton|Scoped|Transient)<\\s*IPayments\\s*,\\s*CardPayments\\s*>\\(\\s*\\)' },
          { label: 'Register Stock', re: 'Add(Singleton|Scoped|Transient)<\\s*Stock\\s*>\\(\\s*\\)' },
          { label: 'All registrations before Build()', re: '^(?![\\s\\S]*\\.Build\\(\\)[\\s\\S]*\\.Add(Singleton|Scoped|Transient)<)' },
          { label: 'MapPost("/checkout/{sku}", …) injects Checkout', re: 'MapPost\\(\\s*"/checkout/\\{\\w+\\}"[^;]*Checkout\\s+\\w+' },
        ],
        hint: 'Checkout’s constructor asks for IPayments and Stock, so both need registering too.',
        explain: 'The container builds the whole chain: to make a Checkout it first makes a CardPayments and a Stock.',
      },
    ],
    // L4 Resolving manually
    [
      {
        kind: 'write',
        prompt: 'Run the DataSeeder once at startup, from a scope.',
        starter: 'builder.Services.AddScoped<DataSeeder>();\nvar app = builder.Build();\n\n\napp.Run();',
        solution:
          'builder.Services.AddScoped<DataSeeder>();\nvar app = builder.Build();\n\nusing (var scope = app.Services.CreateScope())\n{\n    var seeder = scope.ServiceProvider.GetRequiredService<DataSeeder>();\n    seeder.Seed();\n}\n\napp.Run();',
        checks: [
          { label: 'Create a scope with app.Services.CreateScope() in a using', re: 'using\\s*\\(?\\s*var\\s+\\w+\\s*=\\s*app\\.Services\\.CreateScope\\(\\s*\\)' },
          { label: 'Resolve DataSeeder from the scope’s ServiceProvider', re: '\\w+\\.ServiceProvider\\.GetRequiredService<\\s*DataSeeder\\s*>\\(\\s*\\)' },
          { label: 'Call Seed() on it', re: '\\.Seed\\(\\s*\\)' },
          { label: 'Seed before app.Run()', re: 'CreateScope[\\s\\S]*app\\.Run\\(\\s*\\)' },
        ],
        hint: 'No request yet, so make your own scope and ask its ServiceProvider.',
        explain: 'A scope stands in for a request so scoped services can be created, and using disposes them afterwards.',
      },
      {
        kind: 'write',
        prompt: 'Fix the startup code: use a scope, and fail fast if PriceCache is missing.',
        starter:
          'builder.Services.AddScoped<PriceCache>();\nvar app = builder.Build();\n\nvar cache = app.Services.GetService<PriceCache>();\ncache.Warm();\n\napp.Run();',
        solution:
          'builder.Services.AddScoped<PriceCache>();\nvar app = builder.Build();\n\nusing (var scope = app.Services.CreateScope())\n{\n    var cache = scope.ServiceProvider.GetRequiredService<PriceCache>();\n    cache.Warm();\n}\n\napp.Run();',
        checks: [
          { label: 'Don’t resolve straight from app.Services', re: '^(?![\\s\\S]*app\\.Services\\.Get)' },
          { label: 'Create a scope', re: 'app\\.Services\\.CreateScope\\(\\s*\\)' },
          { label: 'GetRequiredService<PriceCache>() from the scope', re: '\\.ServiceProvider\\.GetRequiredService<\\s*PriceCache\\s*>\\(\\s*\\)' },
          { label: 'Still call Warm()', re: '\\.Warm\\(\\s*\\)' },
        ],
        hint: 'Scoped services need a scope. GetService returns null; GetRequiredService throws a clear error.',
        explain: 'Taking a scoped service from the root provider throws in Development, and GetRequiredService fails loudly instead of handing you null.',
      },
    ],
    // L5 Keyed services
    [
      {
        kind: 'write',
        prompt: 'Register email and sms notifiers by key; POST /alerts uses the sms one.',
        starter:
          'interface INotifier { string Send(string text); }\nclass EmailNotifier : INotifier { public string Send(string text) => $"Email: {text}"; }\nclass SmsNotifier : INotifier { public string Send(string text) => $"SMS: {text}"; }\n',
        solution:
          'builder.Services.AddKeyedSingleton<INotifier, EmailNotifier>("email");\nbuilder.Services.AddKeyedSingleton<INotifier, SmsNotifier>("sms");\nvar app = builder.Build();\n\napp.MapPost("/alerts", ([FromKeyedServices("sms")] INotifier notifier) => notifier.Send("Server down"));\n\ninterface INotifier { string Send(string text); }\nclass EmailNotifier : INotifier { public string Send(string text) => $"Email: {text}"; }\nclass SmsNotifier : INotifier { public string Send(string text) => $"SMS: {text}"; }',
        checks: [
          { label: 'EmailNotifier under the key "email"', re: 'AddKeyed(Singleton|Scoped|Transient)<\\s*INotifier\\s*,\\s*EmailNotifier\\s*>\\(\\s*"email"\\s*\\)' },
          { label: 'SmsNotifier under the key "sms"', re: 'AddKeyed(Singleton|Scoped|Transient)<\\s*INotifier\\s*,\\s*SmsNotifier\\s*>\\(\\s*"sms"\\s*\\)' },
          { label: 'MapPost on /alerts', re: 'MapPost\\(\\s*"/alerts"' },
          { label: 'Inject it with [FromKeyedServices("sms")]', re: '\\[FromKeyedServices\\(\\s*"sms"\\s*\\)\\]\\s*INotifier\\s+\\w+' },
        ],
        hint: 'AddKeyedSingleton<INotifier, Class>("key"), then [FromKeyedServices("key")] on the parameter.',
        explain: 'Keys let two classes share one interface. Without them, the last registration would win.',
        output: 'SMS: Server down',
      },
      {
        kind: 'write',
        prompt: 'Pick the notifier from the {channel} route value; unknown channels get 404.',
        starter:
          'app.MapPost("/alerts/{channel}", ([FromKeyedServices("email")] INotifier notifier) =>\n    notifier.Send("Disk full"));',
        solution:
          'app.MapPost("/alerts/{channel}", (string channel, IServiceProvider services) =>\n{\n    var notifier = services.GetKeyedService<INotifier>(channel);\n    return notifier is null\n        ? Results.NotFound()\n        : Results.Ok(notifier.Send("Disk full"));\n});',
        checks: [
          { label: 'Take channel as a string parameter', re: 'string\\s+channel\\b' },
          { label: 'Inject IServiceProvider', re: 'IServiceProvider\\s+\\w+' },
          { label: 'GetKeyedService<INotifier>(channel)', re: 'GetKeyedService<\\s*INotifier\\s*>\\(\\s*channel\\s*\\)' },
          { label: 'Results.NotFound() when it is null', has: 'Results.NotFound()' },
          { label: 'No hard-coded "email" key', not: '[FromKeyedServices("email")]' },
        ],
        hint: 'GetKeyedService returns null for an unknown key, unlike GetRequiredKeyedService.',
        explain: 'Resolving by a runtime key lets the URL choose the implementation, and the null check turns a typo into a 404 instead of a 500.',
      },
    ],
  ],
};

export default unit;
