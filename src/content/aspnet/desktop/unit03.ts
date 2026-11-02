import type { DesktopUnit } from '../../../engine/types';

// Desktop edition: write-the-code challenges for ASP.NET unit 3 (Configuration & environments).
// lessons[i] runs after lesson i + 1. See docs/CONTENT_GUIDE.md.
const unit: DesktopUnit = {
  lessons: [
    // L1 Reading appsettings
    [
      {
        kind: 'write',
        prompt: 'Read the café name and table count, and return both from GET /about.',
        starter: '// appsettings.json: { "Cafe": { "Name": "Blue Door", "Tables": 12 } }\n',
        solution:
          '// appsettings.json: { "Cafe": { "Name": "Blue Door", "Tables": 12 } }\nvar name = builder.Configuration["Cafe:Name"];\nvar tables = builder.Configuration.GetValue<int>("Cafe:Tables", 8);\nvar app = builder.Build();\n\napp.MapGet("/about", () => $"{name} has {tables} tables");',
        checks: [
          { label: 'Read Cafe:Name with Configuration["…"]', re: 'Configuration\\[\\s*"Cafe:Name"\\s*\\]' },
          { label: 'Read Cafe:Tables as an int with GetValue<int>', re: 'GetValue<int>\\(\\s*"Cafe:Tables"' },
          { label: 'Give the table count a fallback', re: 'GetValue<int>\\(\\s*"Cafe:Tables"\\s*,\\s*\\d+\\s*\\)' },
          { label: 'GET /about returns both values', re: 'MapGet\\(\\s*"/about"[^;]*\\{\\s*\\w+\\s*\\}[^;]*\\{\\s*\\w+\\s*\\}' },
        ],
        hint: 'A colon steps into a section: "Cafe:Name". GetValue<int> takes the key and a default.',
        explain: 'Indexing returns a string (or null). GetValue<int> converts it and uses your fallback when the key is missing.',
        output: 'Blue Door has 12 tables',
      },
      {
        kind: 'write',
        prompt: 'Fix the config keys; default MaxPlayers to 4 and Mode to "classic".',
        starter:
          '// "Game": { "Rules": { "MaxPlayers": 6, "Mode": "co-op" } }\nvar max = int.Parse(builder.Configuration["Game.Rules.MaxPlayers"]);\nvar mode = builder.Configuration["Game.Rules.Mode"];',
        solution:
          '// "Game": { "Rules": { "MaxPlayers": 6, "Mode": "co-op" } }\nvar max = builder.Configuration.GetValue<int>("Game:Rules:MaxPlayers", 4);\nvar mode = builder.Configuration["Game:Rules:Mode"] ?? "classic";',
        checks: [
          { label: 'No dotted keys like "Game.Rules…"', not: '"Game.Rules' },
          { label: 'MaxPlayers via GetValue<int>(…, 4)', re: 'GetValue<int>\\(\\s*"Game:Rules:MaxPlayers"\\s*,\\s*4\\s*\\)' },
          { label: 'No int.Parse', not: 'int.Parse' },
          { label: 'Mode falls back to "classic" with ??', re: 'Configuration\\[\\s*"Game:Rules:Mode"\\s*\\]\\s*\\?\\?\\s*"classic"' },
        ],
        hint: 'Each level is separated by a colon. Indexing can return null, so ?? supplies a default.',
        explain: 'Dots aren’t separators, so those keys were never found and int.Parse(null) would crash at startup.',
      },
    ],
    // L2 The options pattern
    [
      {
        kind: 'write',
        prompt: 'Bind the Mail section to MailOptions and return the sender from GET /mail/from.',
        starter: '// appsettings.json: { "Mail": { "From": "hi@pawshop.dev", "Port": 587 } }\nusing Microsoft.Extensions.Options;\n',
        solution:
          '// appsettings.json: { "Mail": { "From": "hi@pawshop.dev", "Port": 587 } }\nusing Microsoft.Extensions.Options;\n\nbuilder.Services.Configure<MailOptions>(builder.Configuration.GetSection("Mail"));\nvar app = builder.Build();\n\napp.MapGet("/mail/from", (IOptions<MailOptions> options) => options.Value.From);\n\nclass MailOptions\n{\n    public string From { get; set; } = "";\n    public int Port { get; set; }\n}',
        checks: [
          { label: 'A MailOptions class with From and Port get/set properties', re: 'class\\s+MailOptions[\\s\\S]*string\\??\\s+From\\s*\\{\\s*get;\\s*set;[\\s\\S]*int\\s+Port\\s*\\{\\s*get;\\s*set;|class\\s+MailOptions[\\s\\S]*int\\s+Port\\s*\\{\\s*get;\\s*set;[\\s\\S]*string\\??\\s+From\\s*\\{\\s*get;\\s*set;' },
          { label: 'Configure<MailOptions>(…GetSection("Mail"))', re: 'Configure<\\s*MailOptions\\s*>\\(\\s*builder\\.Configuration\\.GetSection\\(\\s*"Mail"\\s*\\)\\s*\\)' },
          { label: 'Inject IOptions<MailOptions>', re: 'IOptions<\\s*MailOptions\\s*>\\s+\\w+' },
          { label: 'Return .Value.From', re: '\\.Value\\.From\\b' },
        ],
        hint: 'Property names must match the JSON keys. Read the bound object through .Value.',
        explain: 'Configure binds the section once, by property name, and IOptions<T> hands you a typed object instead of string keys.',
        output: 'hi@pawshop.dev',
      },
      {
        kind: 'write',
        prompt: 'Re-read the banner on every request and return its Text and Color.',
        starter:
          '// "Banner": { "Text": "Sale!", "Color": "red" }\nbuilder.Services.Configure<BannerOptions>(builder.Configuration.GetSection("Banner"));\nvar app = builder.Build();\n\napp.MapGet("/banner", (IOptions<BannerOptions> options) => options.Value.Text);\n\nclass BannerOptions\n{\n    public string Text { get; set; } = "";\n}',
        solution:
          '// "Banner": { "Text": "Sale!", "Color": "red" }\nbuilder.Services.Configure<BannerOptions>(builder.Configuration.GetSection("Banner"));\nvar app = builder.Build();\n\napp.MapGet("/banner", (IOptionsSnapshot<BannerOptions> options) =>\n    new { options.Value.Text, options.Value.Color });\n\nclass BannerOptions\n{\n    public string Text { get; set; } = "";\n    public string Color { get; set; } = "";\n}',
        checks: [
          { label: 'Use IOptionsSnapshot<BannerOptions>', re: 'IOptionsSnapshot<\\s*BannerOptions\\s*>\\s+\\w+' },
          { label: 'No plain IOptions<BannerOptions> left', not: 'IOptions<BannerOptions>' },
          { label: 'Add a Color property with get; set;', re: 'string\\??\\s+Color\\s*\\{\\s*get;\\s*set;' },
          { label: 'Return both .Value.Text and .Value.Color', re: '\\.Value\\.Text[\\s\\S]*\\.Value\\.Color|\\.Value\\.Color[\\s\\S]*\\.Value\\.Text' },
        ],
        hint: 'Swap the interface name, add the property, and return an anonymous object with both.',
        explain: 'IOptionsSnapshot<T> rebinds per request, so an edited appsettings.json shows up without a restart.',
        output: '{"text":"Sale!","color":"red"}',
      },
    ],
    // L3 Environments
    [
      {
        kind: 'write',
        prompt: 'Map GET /debug/env only in Development; GET / names the environment.',
        starter: 'var app = builder.Build();\n',
        solution:
          'var app = builder.Build();\n\nif (app.Environment.IsDevelopment())\n{\n    app.MapGet("/debug/env", () => "Dev tools on");\n}\n\napp.MapGet("/", () => $"Running in {app.Environment.EnvironmentName}");',
        checks: [
          { label: 'Test app.Environment.IsDevelopment() in an if', re: 'if\\s*\\(\\s*app\\.Environment\\.IsDevelopment\\(\\)\\s*\\)' },
          { label: 'Map /debug/env inside that if', re: 'IsDevelopment\\(\\)\\s*\\)\\s*\\{?\\s*app\\.MapGet\\(\\s*"/debug/env"' },
          { label: 'GET / returns app.Environment.EnvironmentName', re: 'MapGet\\(\\s*"/"[^;]*app\\.Environment\\.EnvironmentName' },
        ],
        hint: 'Endpoints mapped inside the if only exist when the condition is true.',
        explain: 'dotnet run sets ASPNETCORE_ENVIRONMENT to Development, so the debug route never reaches production.',
        output: 'Running in Development',
      },
      {
        kind: 'write',
        prompt: 'Use the environment helpers, and add a Staging mode with test payments.',
        starter:
          'var app = builder.Build();\n\nvar mode = app.Environment.EnvironmentName == "Development" ? "dev: fake payments" : "live payments";\n\napp.MapGet("/payments/mode", () => mode);',
        solution:
          'var app = builder.Build();\n\nstring mode;\nif (app.Environment.IsDevelopment())\n    mode = "dev: fake payments";\nelse if (app.Environment.IsEnvironment("Staging"))\n    mode = "staging: test payments";\nelse\n    mode = "live payments";\n\napp.MapGet("/payments/mode", () => mode);',
        checks: [
          { label: 'Use IsDevelopment()', has: 'app.Environment.IsDevelopment()' },
          { label: 'Use IsEnvironment("Staging")', re: 'app\\.Environment\\.IsEnvironment\\(\\s*"Staging"\\s*\\)' },
          { label: 'No string compare on EnvironmentName', not: 'EnvironmentName ==' },
          { label: 'Staging gets its own mode text', re: 'IsEnvironment\\(\\s*"Staging"\\s*\\)\\s*\\)?\\s*(\\?|\\{?\\s*\\w+\\s*=)\\s*"[^"]+"' },
          { label: 'Keep GET /payments/mode', re: 'MapGet\\(\\s*"/payments/mode"' },
        ],
        hint: 'There’s no IsStaging(), but IsEnvironment takes any name.',
        explain: 'The helpers compare names ignoring case, so "staging" matches too. A typo in a hand-written string compare would not.',
        output: 'staging: test payments',
      },
    ],
    // L4 Env vars & secrets
    [
      {
        kind: 'write',
        prompt: 'In the terminal, store the Stripe API key and webhook secret as user secrets.',
        starter: '',
        solution:
          'dotnet user-secrets init\ndotnet user-secrets set "Stripe:ApiKey" "sk_test_51abc"\ndotnet user-secrets set "Stripe:WebhookSecret" "whsec_9xyz"',
        checks: [
          { label: 'Turn on user secrets with init', has: 'dotnet user-secrets init' },
          { label: 'Set Stripe:ApiKey', re: 'dotnet user-secrets set\\s+"?Stripe:ApiKey"?\\s+\\S+' },
          { label: 'Set Stripe:WebhookSecret', re: 'dotnet user-secrets set\\s+"?Stripe:WebhookSecret"?\\s+\\S+' },
          { label: 'Run init before set', re: 'user-secrets init[\\s\\S]*user-secrets set' },
        ],
        hint: 'init adds a UserSecretsId to the project; set takes a key (with colons) and a value.',
        explain: 'User secrets live in your user profile, not the repo, and load in Development as if they were in appsettings.json.',
      },
      {
        kind: 'write',
        prompt: 'Fix the PowerShell env var names, add Shop:Currency = EUR, then run.',
        starter: '# Override Shop:Name for this run\n$env:Shop:Name = "Night Market"\ndotnet run',
        solution: '# Override Shop:Name for this run\n$env:Shop__Name = "Night Market"\n$env:Shop__Currency = "EUR"\ndotnet run',
        checks: [
          { label: 'Shop__Name with a double underscore', re: '\\$env:Shop__Name\\s*=\\s*"[^"]+"' },
          { label: 'Set Shop__Currency to "EUR"', re: '\\$env:Shop__Currency\\s*=\\s*"EUR"' },
          { label: 'No colons in env var names', not: '$env:Shop:' },
          { label: 'Run the app after setting them', re: '\\$env:[\\s\\S]*dotnet run\\s*$' },
        ],
        hint: 'A colon can’t go in an environment variable name; two underscores stand in for it.',
        explain: 'Env vars load after the appsettings files, so Shop__Name overrides Shop:Name for this terminal session.',
      },
    ],
    // L5 Logging levels
    [
      {
        kind: 'write',
        prompt: 'Log "Order {OrderId} shipped" at Information when an order ships.',
        starter: 'app.MapPost("/orders/{id:int}/ship", (int id) =>\n{\n    return Results.Ok();\n});',
        solution:
          'app.MapPost("/orders/{id:int}/ship", (int id, ILogger<Program> logger) =>\n{\n    logger.LogInformation("Order {OrderId} shipped", id);\n    return Results.Ok();\n});',
        checks: [
          { label: 'Inject an ILogger<T>', re: 'ILogger<\\s*\\w+\\s*>\\s+\\w+' },
          { label: 'Call LogInformation', re: '\\w+\\.LogInformation\\(' },
          { label: 'A message template with {OrderId}, id passed separately', re: 'LogInformation\\(\\s*"[^"]*\\{OrderId\\}[^"]*"\\s*,\\s*\\w+\\s*\\)' },
          { label: 'No $"…" interpolation in the log call', not: 'LogInformation($' },
        ],
        hint: 'The template has a {Name} hole; the value goes in as the next argument.',
        explain: 'Templates keep OrderId as a searchable field in structured logs. Interpolation would bake it into plain text.',
      },
      {
        kind: 'write',
        prompt: 'Swap Console.WriteLine for a logger: Warning under 5 in stock, Debug otherwise.',
        starter:
          'class StockChecker\n{\n    public void Check(string sku, int count)\n    {\n        Console.WriteLine($"Low stock for {sku}: {count}");\n    }\n}',
        solution:
          'class StockChecker\n{\n    private readonly ILogger<StockChecker> _logger;\n\n    public StockChecker(ILogger<StockChecker> logger)\n    {\n        _logger = logger;\n    }\n\n    public void Check(string sku, int count)\n    {\n        if (count < 5)\n            _logger.LogWarning("Low stock for {Sku}: {Count}", sku, count);\n        else\n            _logger.LogDebug("Stock ok for {Sku}", sku);\n    }\n}',
        checks: [
          { label: 'Take ILogger<StockChecker> in the constructor', re: 'StockChecker\\s*\\(\\s*ILogger<\\s*StockChecker\\s*>\\s+\\w+\\s*\\)' },
          { label: 'Remove Console.WriteLine', not: 'Console.WriteLine' },
          { label: 'Test for fewer than 5', re: '<\\s*5\\b|>=\\s*5\\b|<=\\s*4\\b' },
          { label: 'LogWarning with a template', re: 'LogWarning\\(\\s*"[^"]*\\{\\w+\\}[^"]*"\\s*,' },
          { label: 'LogDebug for the normal case', re: '\\w+\\.LogDebug\\(\\s*"' },
        ],
        hint: 'Constructor-inject the logger like any service, then pick a Log… method per case.',
        explain: 'Debug is hidden at the default Information level, so normal checks stay quiet while low stock still stands out.',
      },
    ],
  ],
  // Windows PowerShell versions of shared items (the phone keeps the bash ones).
  concepts: {
    4: {
      body: 'Sources load in order and later ones win: appsettings.json, appsettings.{Environment}.json, user secrets (Development only), environment variables, then command-line args. In an env var name, __ stands for each colon, so Shop__Name sets Shop:Name. In PowerShell, $env:Shop__Name = "Tea Hut" sets it for that window only. dotnet user-secrets keeps keys in your user profile, out of the repo.',
      code: 'dotnet user-secrets init\ndotnet user-secrets set "Stripe:Key" "sk_test_123"\n$env:Shop__Name = "Tea Hut"   # sets Shop:Name',
    },
  },
  overrides: {
    'L4.7': {
      kind: 'fix',
      prompt: 'This should override Mail:Sender. Fix the name.',
      code: '# PowerShell\n$env:[[Mail_Sender]] = "shop@example.com"',
      fix: 'Mail__Sender',
      options: ['Mail__Sender', 'Mail.Sender', 'MailSender'],
      hint: 'Count the underscores.',
      explain: 'One underscore is just part of the name. Two (__) stand for a colon, giving Mail:Sender.',
    },
    'L4.1': {
      kind: 'fill',
      prompt: 'Type the env var name for Game:MaxPlayers.',
      code: '# PowerShell: override Game:MaxPlayers for this window\n$env:___ = "16"',
      blanks: [{ answer: ['Game__MaxPlayers', 'GAME__MAXPLAYERS', 'game__maxplayers'] }],
      hint: 'Each colon becomes two underscores.',
      explain: 'Colons don’t work in env var names on every platform, so __ stands in for each one and ASP.NET turns it back into a colon.',
    },
    'boss.8': {
      kind: 'type',
      prompt: 'Name the env var that sets Logging:LogLevel:Default.',
      template: '$env:___ = "Debug"',
      accept: ['Logging__LogLevel__Default', 'LOGGING__LOGLEVEL__DEFAULT', 'logging__loglevel__default'],
      hint: 'Swap every colon for two underscores.',
      explain: 'Env vars beat appsettings.json, so this turns on Debug logs for apps started from this PowerShell window, without editing a file.',
    },
  },
};

export default unit;
