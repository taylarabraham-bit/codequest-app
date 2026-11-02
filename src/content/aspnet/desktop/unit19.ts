import type { DesktopUnit } from '../../../engine/types';

// Desktop edition: write-the-code challenges for ASP.NET unit 19 (Aspire & cloud-native).
// lessons[i] runs after lesson i + 1. See docs/CONTENT_GUIDE.md.
const unit: DesktopUnit = {
  lessons: [
    // L1 The AppHost
    [
      {
        kind: 'write',
        prompt: 'Write an AppHost that runs the Gym.Api and Gym.Worker projects.',
        starter: '',
        solution:
          'var builder = DistributedApplication.CreateBuilder(args);\nbuilder.AddProject<Projects.Gym_Api>("api");\nbuilder.AddProject<Projects.Gym_Worker>("worker");\nbuilder.Build().Run();',
        checks: [
          { label: 'DistributedApplication.CreateBuilder(args)', has: 'DistributedApplication.CreateBuilder(args)' },
          { label: 'Add Gym.Api as Projects.Gym_Api with a name', re: 'AddProject<\\s*Projects\\.Gym_Api\\s*>\\(\\s*"[\\w-]+"\\s*\\)' },
          { label: 'Add Gym.Worker as Projects.Gym_Worker with a name', re: 'AddProject<\\s*Projects\\.Gym_Worker\\s*>\\(\\s*"[\\w-]+"\\s*\\)' },
          { label: 'Build and Run the app model', re: '\\.Build\\(\\)\\s*\\.Run\\(\\)|\\.Build\\(\\)\\s*;[\\s\\S]*\\.Run\\(\\)' },
        ],
        hint: 'Dots in a project name become underscores in the generated Projects class.',
        explain: 'aspire run starts both projects plus the dashboard, where each shows up under the name you gave it.',
      },
      {
        kind: 'write',
        prompt: 'This AppHost won’t build or start. Fix it.',
        starter:
          'var builder = WebApplication.CreateBuilder(args);\nbuilder.AddProject<Projects.Gym.Api>("api");\nbuilder.AddProject<Projects.Gym_Web>("web");\nbuilder.Build();',
        solution:
          'var builder = DistributedApplication.CreateBuilder(args);\nbuilder.AddProject<Projects.Gym_Api>("api");\nbuilder.AddProject<Projects.Gym_Web>("web");\nbuilder.Build().Run();',
        checks: [
          { label: 'Use DistributedApplication.CreateBuilder', has: 'DistributedApplication.CreateBuilder(args)' },
          { label: 'No WebApplication builder in the AppHost', not: 'WebApplication.CreateBuilder' },
          { label: 'Refer to the API as Projects.Gym_Api', re: 'AddProject<\\s*Projects\\.Gym_Api\\s*>' },
          { label: 'Keep the web project', re: 'AddProject<\\s*Projects\\.Gym_Web\\s*>' },
          { label: 'Actually Run it', re: '\\.Build\\(\\)\\s*\\.Run\\(\\)|\\.Build\\(\\)\\s*;[\\s\\S]*\\.Run\\(\\)' },
        ],
        hint: 'Three bugs: the builder type, a dotted project name, and a missing call at the end.',
        explain: 'An AppHost describes a distributed app, not a web app. Without Run() it builds the model and exits immediately.',
      },
    ],
    // L2 Databases & caches
    [
      {
        kind: 'write',
        prompt: 'Give the tickets API a Postgres database named tickets and a Redis cache.',
        starter: 'var builder = DistributedApplication.CreateBuilder(args);\n\nbuilder.Build().Run();',
        solution:
          'var builder = DistributedApplication.CreateBuilder(args);\nvar db = builder.AddPostgres("pg").AddDatabase("tickets");\nvar cache = builder.AddRedis("cache");\nbuilder.AddProject<Projects.Tickets_Api>("api")\n    .WithReference(db)\n    .WithReference(cache);\nbuilder.Build().Run();',
        checks: [
          { label: 'Run Postgres with AddPostgres', re: 'AddPostgres\\(\\s*"[\\w-]+"\\s*\\)' },
          { label: 'Add a database named tickets', re: '\\.AddDatabase\\(\\s*"tickets"\\s*\\)' },
          { label: 'Run Redis with AddRedis', re: 'AddRedis\\(\\s*"[\\w-]+"\\s*\\)' },
          {
            label: 'Reference the database from the API',
            re: '^(?=[\\s\\S]*var\\s+(\\w+)\\s*=[^;]*AddDatabase\\()[\\s\\S]*AddProject<\\s*Projects\\.Tickets_Api\\s*>[^;]*\\.WithReference\\(\\s*\\1\\s*\\)',
          },
          {
            label: 'Reference the cache from the API',
            re: '^(?=[\\s\\S]*var\\s+(\\w+)\\s*=[^;]*AddRedis\\()[\\s\\S]*AddProject<\\s*Projects\\.Tickets_Api\\s*>[^;]*\\.WithReference\\(\\s*\\1\\s*\\)',
          },
        ],
        hint: 'Store each resource in a variable, then chain WithReference(…) onto the project.',
        explain: 'Aspire starts both containers and hands the API ConnectionStrings__tickets and ConnectionStrings__cache, so no connection string lives in code.',
      },
      {
        kind: 'write',
        prompt: 'In the API, use the tickets database and cache the AppHost hands you.',
        starter:
          'var builder = WebApplication.CreateBuilder(args);\nbuilder.Services.AddDbContext<TicketsDb>(o =>\n    o.UseNpgsql("Host=localhost;Database=tickets;Username=postgres;Password=pass"));\nvar app = builder.Build();\napp.MapGet("/tickets", async (TicketsDb db) => await db.Tickets.ToListAsync());\napp.Run();',
        solution:
          'var builder = WebApplication.CreateBuilder(args);\nbuilder.AddNpgsqlDbContext<TicketsDb>("tickets");\nbuilder.AddRedisClient("cache");\nvar app = builder.Build();\napp.MapGet("/tickets", async (TicketsDb db) => await db.Tickets.ToListAsync());\napp.Run();',
        checks: [
          { label: 'builder.AddNpgsqlDbContext<TicketsDb>("tickets")', re: 'builder\\.AddNpgsqlDbContext<\\s*TicketsDb\\s*>\\(\\s*"tickets"\\s*\\)' },
          { label: 'A Redis client integration named "cache"', re: 'builder\\.AddRedis(Client|DistributedCache|OutputCache)\\(\\s*"cache"\\s*\\)' },
          { label: 'No hard-coded connection string', not: 'Password=' },
        ],
        hint: 'Client integrations hang off builder, not builder.Services, and take the resource name.',
        explain: 'The name must match the AppHost resource: the integration reads ConnectionStrings:tickets and also adds health checks and telemetry.',
      },
    ],
    // L3 Startup order & discovery
    [
      {
        kind: 'write',
        prompt: 'Start Cafe.Api after its menu database, and Cafe.Web after the API.',
        starter: 'var builder = DistributedApplication.CreateBuilder(args);\n',
        solution:
          'var builder = DistributedApplication.CreateBuilder(args);\nvar db = builder.AddPostgres("pg").AddDatabase("menu");\nvar api = builder.AddProject<Projects.Cafe_Api>("api")\n    .WithReference(db)\n    .WaitFor(db);\nbuilder.AddProject<Projects.Cafe_Web>("web")\n    .WithReference(api)\n    .WaitFor(api);\nbuilder.Build().Run();',
        checks: [
          { label: 'A database named menu', re: '\\.AddDatabase\\(\\s*"menu"\\s*\\)' },
          {
            label: 'The API references and waits for the database',
            re: '^(?=[\\s\\S]*var\\s+(\\w+)\\s*=[^;]*AddDatabase\\()[\\s\\S]*AddProject<\\s*Projects\\.Cafe_Api\\s*>(?=[^;]*\\.WithReference\\(\\s*\\1\\s*\\))[^;]*\\.WaitFor\\(\\s*\\1\\s*\\)',
          },
          {
            label: 'The web app references and waits for the API',
            re: '^(?=[\\s\\S]*var\\s+(\\w+)\\s*=\\s*builder\\.AddProject<\\s*Projects\\.Cafe_Api\\s*>)[\\s\\S]*AddProject<\\s*Projects\\.Cafe_Web\\s*>(?=[^;]*\\.WithReference\\(\\s*\\1\\s*\\))[^;]*\\.WaitFor\\(\\s*\\1\\s*\\)',
          },
          { label: 'Build and Run', re: '\\.Build\\(\\)\\s*\\.Run\\(\\)|\\.Build\\(\\)\\s*;[\\s\\S]*\\.Run\\(\\)' },
        ],
        hint: 'Keep the API in a variable so the web project can WithReference and WaitFor it.',
        explain: 'WaitFor holds each project until its dependency is healthy, so the API’s first query and the web’s first call both succeed.',
      },
      {
        kind: 'write',
        prompt: 'Replace the hard-coded API address with service discovery.',
        starter:
          'var builder = WebApplication.CreateBuilder(args);\nbuilder.Services.AddHttpClient<MenuClient>(c =>\n    c.BaseAddress = new Uri("https://localhost:7123"));\nvar app = builder.Build();\napp.MapGet("/", async (MenuClient menu) => await menu.TodayAsync());\napp.Run();',
        solution:
          'var builder = WebApplication.CreateBuilder(args);\nbuilder.AddServiceDefaults();\nbuilder.Services.AddHttpClient<MenuClient>(c =>\n    c.BaseAddress = new Uri("https+http://api"));\nvar app = builder.Build();\napp.MapGet("/", async (MenuClient menu) => await menu.TodayAsync());\napp.Run();',
        checks: [
          { label: 'BaseAddress = new Uri("https+http://api")', re: 'new\\s+Uri\\(\\s*"https\\+http://api/?"\\s*\\)' },
          { label: 'No localhost address left', not: 'localhost' },
          { label: 'Turn on service discovery', re: 'AddServiceDefaults\\(\\)|AddServiceDiscovery\\(\\)' },
          { label: 'Keep the typed MenuClient', re: 'AddHttpClient<\\s*MenuClient\\s*>' },
        ],
        hint: 'Use the resource name from the AppHost as the host; the scheme lists HTTPS first.',
        explain: 'Discovery resolves api to whatever address Aspire gave it, preferring HTTPS, so ports can change without breaking the web app.',
      },
    ],
    // L4 Service defaults
    [
      {
        kind: 'write',
        prompt: 'Wire the service defaults into a classes API with one GET endpoint.',
        starter: '',
        solution:
          'var builder = WebApplication.CreateBuilder(args);\nbuilder.AddServiceDefaults();\nbuilder.AddNpgsqlDbContext<GymDb>("gym");\nvar app = builder.Build();\napp.MapDefaultEndpoints();\napp.MapGet("/classes", async (GymDb db) => await db.Classes.ToListAsync());\napp.Run();',
        checks: [
          { label: 'builder.AddServiceDefaults() before Build', re: 'builder\\.AddServiceDefaults\\(\\)[\\s\\S]*builder\\.Build\\(\\)' },
          { label: 'app.MapDefaultEndpoints() after Build', re: 'builder\\.Build\\(\\)[\\s\\S]*app\\.MapDefaultEndpoints\\(\\)' },
          { label: 'A GET endpoint', re: 'app\\.MapGet\\(\\s*"/' },
          { label: 'app.Run()', has: 'app.Run()' },
        ],
        hint: 'One call on builder, one call on app: that’s the whole ServiceDefaults contract.',
        explain: 'You get OpenTelemetry, resilient HttpClients, discovery and /health and /alive in Development, all reported to the dashboard.',
      },
      {
        kind: 'write',
        prompt: 'Finish AddServiceDefaults: telemetry, health checks, discovery and resilient HttpClients.',
        starter:
          'public static TBuilder AddServiceDefaults<TBuilder>(this TBuilder builder)\n    where TBuilder : IHostApplicationBuilder\n{\n    // ConfigureOpenTelemetry and AddDefaultHealthChecks are written below\n\n    return builder;\n}',
        solution:
          'public static TBuilder AddServiceDefaults<TBuilder>(this TBuilder builder)\n    where TBuilder : IHostApplicationBuilder\n{\n    // ConfigureOpenTelemetry and AddDefaultHealthChecks are written below\n    builder.ConfigureOpenTelemetry();\n    builder.AddDefaultHealthChecks();\n    builder.Services.AddServiceDiscovery();\n    builder.Services.ConfigureHttpClientDefaults(http =>\n    {\n        http.AddStandardResilienceHandler();\n        http.AddServiceDiscovery();\n    });\n    return builder;\n}',
        checks: [
          { label: 'builder.ConfigureOpenTelemetry()', has: 'builder.ConfigureOpenTelemetry()' },
          { label: 'builder.AddDefaultHealthChecks()', has: 'builder.AddDefaultHealthChecks()' },
          { label: 'builder.Services.AddServiceDiscovery()', has: 'builder.Services.AddServiceDiscovery()' },
          {
            label: 'Every HttpClient gets AddStandardResilienceHandler()',
            re: 'ConfigureHttpClientDefaults\\(\\s*(\\w+)\\s*=>[\\s\\S]*\\b\\1\\.AddStandardResilienceHandler\\(\\)',
          },
          { label: 'Every HttpClient gets AddServiceDiscovery()', re: 'ConfigureHttpClientDefaults\\(\\s*(\\w+)\\s*=>[\\s\\S]*\\b\\1\\.AddServiceDiscovery\\(\\)' },
        ],
        hint: 'ConfigureHttpClientDefaults applies its lambda to every HttpClient the app creates.',
        explain: 'This is what the template’s Extensions.cs does, so each project gets the same telemetry, probes and retries from one line.',
      },
    ],
    // L5 Config, secrets & deploy
    [
      {
        kind: 'write',
        prompt: 'Pass a secret Stripe key and the currency EUR to the shop API.',
        starter: 'var builder = DistributedApplication.CreateBuilder(args);\n',
        solution:
          'var builder = DistributedApplication.CreateBuilder(args);\nvar stripeKey = builder.AddParameter("stripe-key", secret: true);\nbuilder.AddProject<Projects.Shop_Api>("api")\n    .WithEnvironment("Stripe__ApiKey", stripeKey)\n    .WithEnvironment("Shop__Currency", "EUR");\nbuilder.Build().Run();',
        checks: [
          { label: 'A secret parameter with AddParameter(…, secret: true)', re: 'var\\s+\\w+\\s*=\\s*builder\\.AddParameter\\(\\s*"[\\w-]+"\\s*,\\s*secret:\\s*true\\s*\\)' },
          {
            label: 'Pass it to the API with WithEnvironment',
            re: '^(?=[\\s\\S]*var\\s+(\\w+)\\s*=\\s*builder\\.AddParameter\\()[\\s\\S]*\\.WithEnvironment\\(\\s*"\\w+"\\s*,\\s*\\1\\s*\\)',
          },
          { label: 'Pass the plain value "EUR" too', re: '\\.WithEnvironment\\(\\s*"\\w+"\\s*,\\s*"EUR"\\s*\\)' },
          { label: 'Build and Run', re: '\\.Build\\(\\)\\s*\\.Run\\(\\)|\\.Build\\(\\)\\s*;[\\s\\S]*\\.Run\\(\\)' },
        ],
        hint: 'Use __ in the variable name so it maps to a config section like Stripe:ApiKey.',
        explain: 'The key’s value comes from Parameters:stripe-key in the AppHost’s user secrets, so it never lands in source control.',
      },
      {
        kind: 'write',
        prompt: 'Get this AppHost ready for Docker Compose and stop hard-coding the mail key.',
        starter:
          'var builder = DistributedApplication.CreateBuilder(args);\nvar db = builder.AddPostgres("pg").AddDatabase("news");\nvar api = builder.AddProject<Projects.News_Api>("api")\n    .WithReference(db).WaitFor(db)\n    .WithEnvironment("Mail__ApiKey", "sk_live_123");\nbuilder.AddProject<Projects.News_Web>("web")\n    .WithReference(api);\nbuilder.Build().Run();',
        solution:
          'var builder = DistributedApplication.CreateBuilder(args);\nbuilder.AddDockerComposeEnvironment("compose");\nvar mailKey = builder.AddParameter("mail-key", secret: true);\nvar db = builder.AddPostgres("pg").WithDataVolume().AddDatabase("news");\nvar api = builder.AddProject<Projects.News_Api>("api")\n    .WithReference(db).WaitFor(db)\n    .WithEnvironment("Mail__ApiKey", mailKey);\nbuilder.AddProject<Projects.News_Web>("web")\n    .WithReference(api)\n    .WithExternalHttpEndpoints();\nbuilder.Build().Run();',
        checks: [
          { label: 'Add a Docker Compose environment', re: 'builder\\.AddDockerComposeEnvironment\\(\\s*"[\\w-]+"\\s*\\)' },
          { label: 'Remove the hard-coded key', not: 'sk_live_123' },
          { label: 'A secret parameter for the key', re: 'var\\s+\\w+\\s*=\\s*builder\\.AddParameter\\(\\s*"[\\w-]+"\\s*,\\s*secret:\\s*true\\s*\\)' },
          {
            label: 'Pass the parameter as Mail__ApiKey',
            re: '^(?=[\\s\\S]*var\\s+(\\w+)\\s*=\\s*builder\\.AddParameter\\()[\\s\\S]*\\.WithEnvironment\\(\\s*"Mail__ApiKey"\\s*,\\s*\\1\\s*\\)',
          },
          { label: 'Keep Postgres data with WithDataVolume()', re: 'AddPostgres\\([^;]*\\.WithDataVolume\\(\\)' },
          { label: 'Expose the web app with WithExternalHttpEndpoints()', re: 'Projects\\.News_Web\\s*>[^;]*\\.WithExternalHttpEndpoints\\(\\)' },
        ],
        hint: 'aspire publish needs a compute environment; secrets become parameters it writes to .env.',
        explain: 'aspire publish now writes docker-compose.yaml with a volume for the data, a public port for the web app, and the key as an .env value.',
      },
    ],
  ],
};

export default unit;
