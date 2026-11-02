import type { DesktopUnit } from '../../../engine/types';

// Desktop edition: write-the-code challenges for ASP.NET unit 14 (Background services & caching).
// lessons[i] runs after lesson i + 1. See docs/CONTENT_GUIDE.md.
const unit: DesktopUnit = {
  lessons: [
    // L1 Background services
    [
      {
        kind: 'write',
        prompt: 'Write a hosted service that logs a heartbeat every 5 seconds until shutdown.',
        starter: '',
        solution:
          'builder.Services.AddHostedService<Pinger>();\n\npublic class Pinger(ILogger<Pinger> log) : BackgroundService\n{\n    protected override async Task ExecuteAsync(CancellationToken stoppingToken)\n    {\n        while (!stoppingToken.IsCancellationRequested)\n        {\n            log.LogInformation("Still alive");\n            await Task.Delay(TimeSpan.FromSeconds(5), stoppingToken);\n        }\n    }\n}',
        checks: [
          { label: 'A class that derives from BackgroundService', re: 'class\\s+\\w+[^{]*:\\s*BackgroundService\\b' },
          {
            label: 'Override ExecuteAsync(CancellationToken)',
            re: 'protected\\s+override\\s+async\\s+Task\\s+ExecuteAsync\\(\\s*CancellationToken\\s+\\w+\\s*\\)',
          },
          { label: 'Loop until the token is cancelled', re: 'while\\s*\\(\\s*!\\s*\\w+\\.IsCancellationRequested\\s*\\)' },
          {
            label: 'Wait 5 seconds, passing the token to Task.Delay',
            re: 'await\\s+Task\\.Delay\\(\\s*(5000|TimeSpan\\.FromSeconds\\(\\s*5\\s*\\))\\s*,\\s*\\w+\\s*\\)',
          },
          { label: 'Register it with AddHostedService<T>()', re: 'AddHostedService<\\s*\\w+\\s*>\\(\\)' },
        ],
        hint: 'ExecuteAsync gets a stoppingToken: check it in the loop and hand it to Task.Delay.',
        explain: 'Passing the token to Task.Delay means shutdown interrupts the wait at once instead of after up to 5 seconds.',
      },
      {
        kind: 'write',
        prompt: 'The cleaner never runs and ignores shutdown. Fix it.',
        starter:
          'builder.Services.AddSingleton<Cleaner>();\n\npublic class Cleaner : BackgroundService\n{\n    protected override async Task ExecuteAsync(CancellationToken stoppingToken)\n    {\n        while (true)\n        {\n            Files.DeleteOld();\n            await Task.Delay(60_000);\n        }\n    }\n}',
        solution:
          'builder.Services.AddHostedService<Cleaner>();\n\npublic class Cleaner : BackgroundService\n{\n    protected override async Task ExecuteAsync(CancellationToken stoppingToken)\n    {\n        while (!stoppingToken.IsCancellationRequested)\n        {\n            Files.DeleteOld();\n            await Task.Delay(60_000, stoppingToken);\n        }\n    }\n}',
        checks: [
          { label: 'Register it with AddHostedService<Cleaner>()', has: 'AddHostedService<Cleaner>()' },
          { label: 'Not as a plain singleton', not: 'AddSingleton<Cleaner>()' },
          { label: 'Loop while the token isn’t cancelled', re: 'while\\s*\\(\\s*!\\s*stoppingToken\\.IsCancellationRequested\\s*\\)' },
          { label: 'Pass stoppingToken to Task.Delay', re: 'Task\\.Delay\\([^;]*,\\s*stoppingToken\\s*\\)' },
        ],
        hint: 'AddSingleton only registers it; something has to start it.',
        explain: 'AddHostedService makes the host call ExecuteAsync at startup. Watching the token lets the app stop cleanly instead of being killed.',
      },
    ],
    // L2 Timers & scopes
    [
      {
        kind: 'write',
        prompt: 'Remind people to stretch every 10 minutes with a PeriodicTimer.',
        starter: 'public class StretchReminder(ILogger<StretchReminder> log) : BackgroundService\n{\n}',
        solution:
          'public class StretchReminder(ILogger<StretchReminder> log) : BackgroundService\n{\n    protected override async Task ExecuteAsync(CancellationToken stoppingToken)\n    {\n        using var timer = new PeriodicTimer(TimeSpan.FromMinutes(10));\n        while (await timer.WaitForNextTickAsync(stoppingToken))\n            log.LogInformation("Time to stretch");\n    }\n}',
        checks: [
          { label: 'Override ExecuteAsync', re: 'protected\\s+override\\s+async\\s+Task\\s+ExecuteAsync\\(\\s*CancellationToken\\s+\\w+\\s*\\)' },
          { label: 'A PeriodicTimer that ticks every 10 minutes', re: 'new\\s*(PeriodicTimer)?\\(\\s*TimeSpan\\.From(Minutes\\(\\s*10\\s*\\)|Seconds\\(\\s*600\\s*\\))\\s*\\)' },
          { label: 'Dispose the timer with using', re: 'using\\s+(var|PeriodicTimer)\\s+\\w+\\s*=' },
          {
            label: 'Loop with while (await timer.WaitForNextTickAsync(token))',
            re: 'while\\s*\\(\\s*await\\s+\\w+\\.WaitForNextTickAsync\\(\\s*\\w+\\s*\\)\\s*\\)',
          },
          { label: 'Log the reminder on each tick', re: 'WaitForNextTickAsync[\\s\\S]*\\.Log(Information|Warning)\\(' },
        ],
        hint: 'WaitForNextTickAsync returns false when the token is cancelled, which ends the loop.',
        explain: 'PeriodicTimer keeps a steady rhythm and never overlaps ticks, and its loop ends cleanly at shutdown.',
      },
      {
        kind: 'write',
        prompt: 'A hosted service can’t take a scoped ShopDb. Fix it with a scope per tick.',
        starter:
          'public class ExpireCarts(ShopDb db) : BackgroundService\n{\n    protected override async Task ExecuteAsync(CancellationToken stoppingToken)\n    {\n        using var timer = new PeriodicTimer(TimeSpan.FromMinutes(15));\n        while (await timer.WaitForNextTickAsync(stoppingToken))\n        {\n            await db.Carts.Where(c => c.UpdatedAt < DateTime.UtcNow.AddHours(-2))\n                .ExecuteDeleteAsync(stoppingToken);\n        }\n    }\n}',
        solution:
          'public class ExpireCarts(IServiceScopeFactory scopes) : BackgroundService\n{\n    protected override async Task ExecuteAsync(CancellationToken stoppingToken)\n    {\n        using var timer = new PeriodicTimer(TimeSpan.FromMinutes(15));\n        while (await timer.WaitForNextTickAsync(stoppingToken))\n        {\n            using var scope = scopes.CreateScope();\n            var db = scope.ServiceProvider.GetRequiredService<ShopDb>();\n            await db.Carts.Where(c => c.UpdatedAt < DateTime.UtcNow.AddHours(-2))\n                .ExecuteDeleteAsync(stoppingToken);\n        }\n    }\n}',
        checks: [
          { label: 'Don’t inject ShopDb into the constructor', not: '(ShopDb db)' },
          { label: 'Inject IServiceScopeFactory instead', re: 'IServiceScopeFactory\\s+\\w+' },
          { label: 'Create a scope with using', re: '(await\\s+)?using\\s+var\\s+\\w+\\s*=\\s*\\w+\\.Create(Async)?Scope\\(\\)' },
          { label: 'Get ShopDb from the scope’s ServiceProvider', re: '\\.ServiceProvider\\.GetRequiredService<\\s*ShopDb\\s*>\\(\\)' },
          { label: 'Create the scope inside the loop, once per tick', re: 'WaitForNextTickAsync[\\s\\S]*Create(Async)?Scope\\(' },
        ],
        hint: 'Ask for IServiceScopeFactory, then scopes.CreateScope() at the start of each tick.',
        explain: 'A fresh scope per tick gives a fresh DbContext, and disposing it at the end of the tick releases its connection.',
      },
    ],
    // L3 Queues with channels
    [
      {
        kind: 'write',
        prompt: 'Queue photo resize jobs in a Channel and answer 202 straight away.',
        starter: 'public record ResizeJob(string File, int Width);\n',
        solution:
          'builder.Services.AddSingleton(Channel.CreateUnbounded<ResizeJob>());\nvar app = builder.Build();\napp.MapPost("/photos/resize", async (ResizeJob job, Channel<ResizeJob> queue) =>\n{\n    await queue.Writer.WriteAsync(job);\n    return Results.Accepted();\n});\n\npublic record ResizeJob(string File, int Width);',
        checks: [
          { label: 'Register one Channel<ResizeJob> as a singleton', re: 'AddSingleton\\(\\s*Channel\\.Create(Unbounded|Bounded)<\\s*ResizeJob\\s*>\\(' },
          { label: 'An async MapPost endpoint', re: 'MapPost\\(\\s*"/[^"]*"\\s*,\\s*async\\s*\\(' },
          { label: 'Inject Channel<ResizeJob> into it', re: 'Channel<\\s*ResizeJob\\s*>\\s+\\w+\\s*\\)' },
          { label: 'await queue.Writer.WriteAsync(job)', re: 'await\\s+\\w+\\.Writer\\.WriteAsync\\(\\s*\\w+' },
          { label: 'Return 202 Accepted', re: '(Results|TypedResults)\\.Accepted\\(' },
        ],
        hint: 'The endpoint only writes the job; a background worker will do the slow part.',
        explain: 'The client gets 202 in milliseconds while the resize happens later, and a singleton channel means the worker reads the same queue.',
      },
      {
        kind: 'write',
        prompt: 'Write and register the worker that resizes each queued job.',
        starter:
          'builder.Services.AddSingleton(Channel.CreateUnbounded<ResizeJob>());\n// register the worker here\n\n// the worker: read each ResizeJob and call Images.ResizeAsync(job, token)\n',
        solution:
          'builder.Services.AddSingleton(Channel.CreateUnbounded<ResizeJob>());\nbuilder.Services.AddHostedService<ResizeWorker>();\n\npublic class ResizeWorker(Channel<ResizeJob> queue, ILogger<ResizeWorker> log) : BackgroundService\n{\n    protected override async Task ExecuteAsync(CancellationToken stoppingToken)\n    {\n        await foreach (var job in queue.Reader.ReadAllAsync(stoppingToken))\n        {\n            log.LogInformation("Resizing {File}", job.File);\n            await Images.ResizeAsync(job, stoppingToken);\n        }\n    }\n}',
        checks: [
          { label: 'Register it with AddHostedService<T>()', re: 'AddHostedService<\\s*\\w+\\s*>\\(\\)' },
          { label: 'The worker derives from BackgroundService', re: ':\\s*BackgroundService\\b' },
          { label: 'Inject the Channel<ResizeJob>', re: 'Channel<\\s*ResizeJob\\s*>\\s+\\w+' },
          {
            label: 'await foreach over Reader.ReadAllAsync(token)',
            re: 'await\\s+foreach\\s*\\(\\s*var\\s+\\w+\\s+in\\s+\\w+\\.Reader\\.ReadAllAsync\\(\\s*\\w+\\s*\\)\\s*\\)',
          },
          { label: 'await Images.ResizeAsync for each job', re: 'await\\s+Images\\.ResizeAsync\\(' },
        ],
        hint: 'ReadAllAsync waits for new jobs and ends when the token is cancelled.',
        explain: 'The worker handles one job at a time as they arrive, and the loop ends on shutdown because it was given the stopping token.',
      },
    ],
    // L4 Memory & hybrid cache
    [
      {
        kind: 'write',
        prompt: 'Cache each currency’s exchange rate in IMemoryCache for 10 minutes.',
        starter: '',
        solution:
          'builder.Services.AddMemoryCache();\nvar app = builder.Build();\napp.MapGet("/rates/{currency}", async (string currency, IMemoryCache cache, RatesApi api) =>\n    await cache.GetOrCreateAsync($"rate:{currency}", async e =>\n    {\n        e.AbsoluteExpirationRelativeToNow = TimeSpan.FromMinutes(10);\n        return await api.GetRateAsync(currency);\n    }));',
        checks: [
          { label: 'Register builder.Services.AddMemoryCache()', has: 'builder.Services.AddMemoryCache()' },
          { label: 'Inject IMemoryCache into the endpoint', re: 'IMemoryCache\\s+\\w+' },
          { label: 'Use GetOrCreateAsync', re: '\\.GetOrCreateAsync\\(' },
          { label: 'Put the currency in the cache key', re: 'GetOrCreateAsync\\(\\s*\\$"[^"]*\\{\\s*\\w+\\s*\\}' },
          {
            label: 'Expire entries after 10 minutes',
            re: '(AbsoluteExpirationRelativeToNow\\s*=\\s*|SetAbsoluteExpiration\\(\\s*)TimeSpan\\.FromMinutes\\(\\s*10\\s*\\)',
          },
        ],
        hint: 'The factory lambda gets the cache entry: set its expiration, then return the value.',
        explain: 'The factory only runs on a miss. One key per currency keeps EUR and USD apart, and the expiry stops rates going stale.',
      },
      {
        kind: 'write',
        prompt: 'Cache products with HybridCache under a tag, and clear the tag on PUT.',
        starter:
          'var app = builder.Build();\napp.MapGet("/products/{id:int}", async (int id, ShopDb db, CancellationToken ct) =>\n    await db.Products.FindAsync([id], ct));\napp.MapPut("/products/{id:int}", async (int id, Product p, ShopDb db) =>\n{\n    db.Update(p);\n    await db.SaveChangesAsync();\n    return Results.NoContent();\n});',
        solution:
          'builder.Services.AddHybridCache();\nvar app = builder.Build();\napp.MapGet("/products/{id:int}", async (int id, ShopDb db, HybridCache cache, CancellationToken ct) =>\n    await cache.GetOrCreateAsync($"product:{id}",\n        async token => await db.Products.FindAsync([id], token),\n        tags: ["products"], cancellationToken: ct));\napp.MapPut("/products/{id:int}", async (int id, Product p, ShopDb db, HybridCache cache) =>\n{\n    db.Update(p);\n    await db.SaveChangesAsync();\n    await cache.RemoveByTagAsync("products");\n    return Results.NoContent();\n});',
        checks: [
          { label: 'Register builder.Services.AddHybridCache()', has: 'builder.Services.AddHybridCache()' },
          { label: 'Inject HybridCache', re: 'HybridCache\\s+\\w+' },
          { label: 'GetOrCreateAsync with a per-product key', re: '\\.GetOrCreateAsync\\(\\s*\\$"[^"]*\\{\\s*id\\s*\\}' },
          { label: 'Tag the entry', re: 'tags:\\s*(\\[|new)[^)]*"(\\w+)"' },
          { label: 'RemoveByTagAsync with the same tag after saving', re: 'tags:\\s*(\\[|new)[^)]*"(\\w+)"[\\s\\S]*SaveChangesAsync[\\s\\S]*RemoveByTagAsync\\(\\s*"\\2"' },
        ],
        hint: 'GetOrCreateAsync takes tags: ["…"]; RemoveByTagAsync drops every entry with that tag.',
        explain: 'Tags let one call clear every cached product after a change, and HybridCache runs the database query only once even when many requests miss together.',
      },
    ],
    // L5 Output & HTTP caching
    [
      {
        kind: 'write',
        prompt: 'Cache GET /events under a tag and clear it when POST /events adds one.',
        starter: 'builder.Services.AddOutputCache();\nvar app = builder.Build();\napp.UseOutputCache();\n',
        solution:
          'builder.Services.AddOutputCache();\nvar app = builder.Build();\napp.UseOutputCache();\napp.MapGet("/events", (EventStore events) => events.Upcoming())\n    .CacheOutput(p => p.Tag("events"));\napp.MapPost("/events", async (Event e, EventStore events, IOutputCacheStore cache, CancellationToken ct) =>\n{\n    events.Add(e);\n    await cache.EvictByTagAsync("events", ct);\n    return Results.Created($"/events/{e.Id}", e);\n});',
        checks: [
          { label: 'Tag the GET with .CacheOutput(p => p.Tag(…))', re: 'MapGet\\(\\s*"/events"[^;]*\\.CacheOutput\\(\\s*\\w+\\s*=>\\s*\\w+\\.Tag\\(\\s*"[\\w-]+"\\s*\\)' },
          { label: 'A MapPost for /events', re: 'MapPost\\(\\s*"/events"' },
          { label: 'Inject IOutputCacheStore', re: 'IOutputCacheStore\\s+\\w+' },
          { label: 'await EvictByTagAsync(tag, token)', re: 'await\\s+\\w+\\.EvictByTagAsync\\(\\s*"[\\w-]+"\\s*,\\s*\\w+\\s*\\)' },
          { label: 'Evict the same tag you cached with', re: 'Tag\\(\\s*"([\\w-]+)"[\\s\\S]*EvictByTagAsync\\(\\s*"\\1"' },
        ],
        hint: 'IOutputCacheStore comes from DI; EvictByTagAsync also needs a CancellationToken.',
        explain: 'Without eviction, new events wouldn’t show for up to a minute. Evicting the tag makes the next GET rebuild the list.',
      },
      {
        kind: 'write',
        prompt: 'Let browsers cache the logo for a day, but never store the balance.',
        starter:
          'app.MapGet("/logo", () => Results.File("logo.png", "image/png"));\napp.MapGet("/balance", (Account acct) => acct.Balance.ToString("C"));',
        solution:
          'app.MapGet("/logo", (HttpContext ctx) =>\n{\n    ctx.Response.Headers.CacheControl = "public, max-age=86400";\n    return Results.File("logo.png", "image/png");\n});\napp.MapGet("/balance", (Account acct, HttpContext ctx) =>\n{\n    ctx.Response.Headers.CacheControl = "no-store";\n    return acct.Balance.ToString("C");\n});',
        checks: [
          { label: 'Take HttpContext in the handlers', re: 'HttpContext\\s+\\w+' },
          {
            label: '/logo sends Cache-Control: public, max-age=86400',
            re: '"/logo"(?:(?!MapGet)[\\s\\S])*?(\\.CacheControl|\\["Cache-Control"\\])\\s*=\\s*"public,\\s*max-age=86400"',
          },
          {
            label: '/balance sends Cache-Control: no-store',
            re: '"/balance"(?:(?!MapGet)[\\s\\S])*?(\\.CacheControl|\\["Cache-Control"\\])\\s*=\\s*"[^"]*no-store[^"]*"',
          },
        ],
        hint: 'Set ctx.Response.Headers.CacheControl before returning; 86400 seconds is a day.',
        explain: 'max-age lets browsers and proxies reuse the logo without asking you. no-store keeps a bank balance out of every cache.',
      },
    ],
  ],
};

export default unit;
