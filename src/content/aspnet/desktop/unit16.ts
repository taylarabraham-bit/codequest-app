import type { DesktopUnit } from '../../../engine/types';

// Desktop edition: write-the-code challenges for ASP.NET unit 16 (Rate limiting & resilience).
// lessons[i] runs after lesson i + 1. See docs/CONTENT_GUIDE.md.
const unit: DesktopUnit = {
  lessons: [
    // L1 Picking a limiter
    [
      {
        kind: 'write',
        prompt: 'Limit /search with a token bucket: bursts of 20, refilling 5 tokens per second.',
        starter: '',
        solution:
          'builder.Services.AddRateLimiter(o =>\n{\n    o.AddTokenBucketLimiter("search", b =>\n    {\n        b.TokenLimit = 20;\n        b.TokensPerPeriod = 5;\n        b.ReplenishmentPeriod = TimeSpan.FromSeconds(1);\n    });\n});\nvar app = builder.Build();\napp.UseRateLimiter();\napp.MapGet("/search", (string q) => $"Results for {q}").RequireRateLimiting("search");',
        checks: [
          { label: 'A named token bucket with AddTokenBucketLimiter', re: 'AddTokenBucketLimiter\\(\\s*"[\\w-]+"' },
          { label: 'TokenLimit = 20 (the burst size)', re: 'TokenLimit\\s*=\\s*20\\b' },
          { label: 'TokensPerPeriod = 5', re: 'TokensPerPeriod\\s*=\\s*5\\b' },
          { label: 'Refill every second', re: 'ReplenishmentPeriod\\s*=\\s*TimeSpan\\.From(Seconds\\(\\s*1\\s*\\)|Milliseconds\\(\\s*1000\\s*\\))' },
          { label: 'app.UseRateLimiter()', has: 'app.UseRateLimiter()' },
          {
            label: 'Attach the policy to GET /search',
            re: 'AddTokenBucketLimiter\\(\\s*"([\\w-]+)"[\\s\\S]*MapGet\\(\\s*"/search"[^;]*\\.RequireRateLimiting\\(\\s*"\\1"\\s*\\)',
          },
        ],
        hint: 'TokenLimit is the bucket size; TokensPerPeriod and ReplenishmentPeriod set the refill rate.',
        explain: 'A full bucket allows a burst of 20, then a steady 5 per second, which suits people typing searches in bursts.',
      },
      {
        kind: 'write',
        prompt: 'Make feed a 6-segment sliding window, and run at most 2 uploads at once.',
        starter:
          'builder.Services.AddRateLimiter(o =>\n{\n    o.AddFixedWindowLimiter("feed", w =>\n    {\n        w.PermitLimit = 120;\n        w.Window = TimeSpan.FromMinutes(1);\n    });\n});\nvar app = builder.Build();\napp.UseRateLimiter();\napp.MapGet("/feed", () => "Latest posts").RequireRateLimiting("feed");\napp.MapPost("/upload", (Photo photo) => Results.Accepted());',
        solution:
          'builder.Services.AddRateLimiter(o =>\n{\n    o.AddSlidingWindowLimiter("feed", w =>\n    {\n        w.PermitLimit = 120;\n        w.Window = TimeSpan.FromMinutes(1);\n        w.SegmentsPerWindow = 6;\n    });\n    o.AddConcurrencyLimiter("uploads", c => c.PermitLimit = 2);\n});\nvar app = builder.Build();\napp.UseRateLimiter();\napp.MapGet("/feed", () => "Latest posts").RequireRateLimiting("feed");\napp.MapPost("/upload", (Photo photo) => Results.Accepted()).RequireRateLimiting("uploads");',
        checks: [
          { label: 'Make "feed" a sliding window', re: 'AddSlidingWindowLimiter\\(\\s*"feed"' },
          { label: 'SegmentsPerWindow = 6', re: 'SegmentsPerWindow\\s*=\\s*6\\b' },
          { label: 'No fixed window left', not: 'AddFixedWindowLimiter' },
          { label: 'A concurrency limiter allowing 2', re: 'AddConcurrencyLimiter\\(\\s*"[\\w-]+"[^;]*PermitLimit\\s*=\\s*2\\b' },
          {
            label: 'Attach it to POST /upload',
            re: 'AddConcurrencyLimiter\\(\\s*"([\\w-]+)"[\\s\\S]*MapPost\\(\\s*"/upload"[^;]*\\.RequireRateLimiting\\(\\s*"\\1"\\s*\\)',
          },
        ],
        hint: 'Swap the limiter method and add SegmentsPerWindow; the concurrency limiter only needs PermitLimit.',
        explain: 'Sliding segments stop a burst straddling two windows. The concurrency limiter caps uploads in flight, not uploads per minute.',
      },
    ],
    // L2 Applying policies
    [
      {
        kind: 'write',
        prompt: 'Limit every OrdersController action with "bucket", except a health action.',
        starter: '',
        solution:
          '[ApiController, Route("api/[controller]")]\n[EnableRateLimiting("bucket")]\npublic class OrdersController : ControllerBase\n{\n    [HttpGet]\n    public string List() => "3 orders";\n\n    [HttpGet("health"), DisableRateLimiting]\n    public string Health() => "ok";\n}',
        checks: [
          { label: 'An OrdersController : ControllerBase', re: 'class\\s+OrdersController\\s*:\\s*ControllerBase\\b' },
          { label: '[EnableRateLimiting("bucket")] on the class', re: 'EnableRateLimiting\\(\\s*"bucket"\\s*\\)\\s*\\][\\s\\S]*?class\\s+OrdersController' },
          { label: 'Two actions with [HttpGet]', re: '(\\[\\s*Http(Get|Post|Put|Delete)[\\s\\S]*){2}' },
          { label: '[DisableRateLimiting] on one action', re: 'class\\s+OrdersController[\\s\\S]*\\bDisableRateLimiting\\b' },
        ],
        hint: 'Attributes on the class apply to every action; an action attribute can opt out.',
        explain: 'Health probes must never be throttled, or a busy load balancer could mark a healthy app as down.',
      },
      {
        kind: 'write',
        prompt: 'Move these into a /api/games group limited by "sliding"; exempt status.',
        starter:
          'var app = builder.Build();\napp.UseRateLimiter();\n\napp.MapGet("/api/games", () => "Chess, Go");\napp.MapGet("/api/games/{id:int}", (int id) => $"Game {id}");\napp.MapPost("/api/games", (Game g) => Results.Created($"/api/games/{g.Id}", g));\napp.MapGet("/api/games/status", () => "up");',
        solution:
          'var app = builder.Build();\napp.UseRateLimiter();\n\nvar games = app.MapGroup("/api/games").RequireRateLimiting("sliding");\ngames.MapGet("/", () => "Chess, Go");\ngames.MapGet("/{id:int}", (int id) => $"Game {id}");\ngames.MapPost("/", (Game g) => Results.Created($"/api/games/{g.Id}", g));\ngames.MapGet("/status", () => "up").DisableRateLimiting();',
        checks: [
          { label: 'A group: app.MapGroup("/api/games")', re: 'var\\s+\\w+\\s*=\\s*app\\.MapGroup\\(\\s*"/api/games"\\s*\\)' },
          { label: 'RequireRateLimiting("sliding") on the group', re: '(MapGroup\\(\\s*"/api/games"\\s*\\)|\\b\\w+)\\s*\\.RequireRateLimiting\\(\\s*"sliding"\\s*\\)' },
          { label: 'Map the endpoints on the group', re: 'var\\s+(\\w+)\\s*=\\s*app\\.MapGroup[\\s\\S]*\\b\\1\\.MapPost\\(' },
          { label: 'No app.MapGet("/api/games…") left', not: 'app.MapGet("/api/games' },
          { label: 'Exempt /status with .DisableRateLimiting()', re: '"/status"[^;]*\\.DisableRateLimiting\\(\\)' },
        ],
        hint: 'Map on the group with routes relative to its prefix, like "/status".',
        explain: 'One RequireRateLimiting on the group covers every endpoint, including ones added later, and DisableRateLimiting opts one out.',
      },
    ],
    // L3 Partitions & rejections
    [
      {
        kind: 'write',
        prompt: 'Give each IP address its own limit of 30 requests per minute.',
        starter: '',
        solution:
          'builder.Services.AddRateLimiter(o =>\n{\n    o.AddPolicy("per-ip", ctx => RateLimitPartition.GetFixedWindowLimiter(\n        partitionKey: ctx.Connection.RemoteIpAddress?.ToString() ?? "unknown",\n        factory: _ => new FixedWindowRateLimiterOptions\n        {\n            PermitLimit = 30,\n            Window = TimeSpan.FromMinutes(1)\n        }));\n});',
        checks: [
          { label: 'A policy with o.AddPolicy("name", ctx => …)', re: 'AddPolicy\\(\\s*"[\\w-]+"\\s*,\\s*\\w+\\s*=>' },
          { label: 'Partition with RateLimitPartition.Get…Limiter', re: 'RateLimitPartition\\.Get(FixedWindow|SlidingWindow|TokenBucket)Limiter\\(' },
          { label: 'Key it on the RemoteIpAddress', re: '\\.Connection\\.RemoteIpAddress' },
          { label: 'PermitLimit = 30', re: 'PermitLimit\\s*=\\s*30\\b' },
          { label: 'A one-minute Window', re: 'Window\\s*=\\s*TimeSpan\\.From(Minutes\\(\\s*1\\s*\\)|Seconds\\(\\s*60\\s*\\))' },
        ],
        hint: 'The factory lambda builds the options for each new partition key.',
        explain: 'Each IP gets its own window, so one scraper hitting the limit doesn’t lock out everybody else.',
      },
      {
        kind: 'write',
        prompt: 'Key the limit by user name, and reject with 429 and Retry-After: 30.',
        starter:
          'builder.Services.AddRateLimiter(o =>\n{\n    o.AddPolicy("per-user", ctx => RateLimitPartition.GetFixedWindowLimiter(\n        partitionKey: "everyone",\n        factory: _ => new FixedWindowRateLimiterOptions { PermitLimit = 20, Window = TimeSpan.FromSeconds(30) }));\n});',
        solution:
          'builder.Services.AddRateLimiter(o =>\n{\n    o.RejectionStatusCode = 429;\n    o.OnRejected = (ctx, ct) =>\n    {\n        ctx.HttpContext.Response.Headers.RetryAfter = "30";\n        return ValueTask.CompletedTask;\n    };\n    o.AddPolicy("per-user", ctx => RateLimitPartition.GetFixedWindowLimiter(\n        partitionKey: ctx.User.Identity?.Name ?? "anon",\n        factory: _ => new FixedWindowRateLimiterOptions { PermitLimit = 20, Window = TimeSpan.FromSeconds(30) }));\n});',
        checks: [
          { label: 'Stop sharing one "everyone" key', not: 'partitionKey: "everyone"' },
          { label: 'Key on ctx.User.Identity?.Name', re: '\\.User\\.Identity\\??\\.Name' },
          { label: 'RejectionStatusCode = 429', re: 'RejectionStatusCode\\s*=\\s*(429|StatusCodes\\.Status429TooManyRequests)' },
          { label: 'Set an OnRejected callback', re: 'OnRejected\\s*=\\s*(async\\s*)?\\(\\s*\\w+\\s*,\\s*\\w+\\s*\\)\\s*=>' },
          { label: 'Send a Retry-After header of 30', re: '(Headers\\.RetryAfter|Headers\\["Retry-After"\\])\\s*=\\s*"30"' },
        ],
        hint: 'OnRejected gets a context with HttpContext; return ValueTask.CompletedTask when done.',
        explain: 'Retry-After tells well-behaved clients exactly how long to back off instead of hammering you with retries.',
      },
    ],
    // L4 Resilient HttpClient
    [
      {
        kind: 'write',
        prompt: 'Register a typed ExchangeClient with a base address and standard resilience.',
        starter: '',
        solution:
          'builder.Services.AddHttpClient<ExchangeClient>(c =>\n        c.BaseAddress = new Uri("https://rates.example"))\n    .AddStandardResilienceHandler();\n\npublic class ExchangeClient(HttpClient http)\n{\n    public Task<decimal> GetRateAsync(string currency) =>\n        http.GetFromJsonAsync<decimal>($"/rates/{currency}");\n}',
        checks: [
          { label: 'Register it with AddHttpClient<ExchangeClient>', re: 'AddHttpClient<\\s*ExchangeClient\\s*>\\(' },
          { label: 'Set BaseAddress to a new Uri', re: 'BaseAddress\\s*=\\s*new\\s+Uri\\(\\s*"https?://[^"]+"\\s*\\)' },
          { label: 'Chain .AddStandardResilienceHandler()', re: '\\.AddStandardResilienceHandler\\(' },
          { label: 'The class takes an HttpClient', re: 'class\\s+ExchangeClient\\b[\\s\\S]*HttpClient\\s+\\w+' },
          { label: 'A method that calls the API', re: 'http\\w*\\.(GetFromJsonAsync|GetAsync|GetStringAsync)|_\\w+\\.(GetFromJsonAsync|GetAsync|GetStringAsync)' },
        ],
        hint: 'AddHttpClient<T> returns a builder you can chain the resilience handler onto.',
        explain: 'Every call through ExchangeClient now gets timeouts, retries and a circuit breaker without any extra code in the class.',
      },
      {
        kind: 'write',
        prompt: 'Tune the shipping client: 2 retries, 3-second attempts, 15 seconds in total.',
        starter:
          'builder.Services.AddHttpClient<ShippingClient>(c =>\n        c.BaseAddress = new Uri("https://ship.example"))\n    .AddStandardResilienceHandler();',
        solution:
          'builder.Services.AddHttpClient<ShippingClient>(c =>\n        c.BaseAddress = new Uri("https://ship.example"))\n    .AddStandardResilienceHandler(o =>\n    {\n        o.Retry.MaxRetryAttempts = 2;\n        o.AttemptTimeout.Timeout = TimeSpan.FromSeconds(3);\n        o.TotalRequestTimeout.Timeout = TimeSpan.FromSeconds(15);\n    });',
        checks: [
          { label: 'Pass a lambda to AddStandardResilienceHandler', re: 'AddStandardResilienceHandler\\(\\s*\\w+\\s*=>' },
          { label: 'Retry.MaxRetryAttempts = 2', re: '\\.Retry\\.MaxRetryAttempts\\s*=\\s*2\\b' },
          { label: 'AttemptTimeout.Timeout of 3 seconds', re: '\\.AttemptTimeout\\.Timeout\\s*=\\s*TimeSpan\\.FromSeconds\\(\\s*3\\s*\\)' },
          { label: 'TotalRequestTimeout.Timeout of 15 seconds', re: '\\.TotalRequestTimeout\\.Timeout\\s*=\\s*TimeSpan\\.FromSeconds\\(\\s*15\\s*\\)' },
        ],
        hint: 'Each strategy is a property on the options: Retry, AttemptTimeout, TotalRequestTimeout.',
        explain: 'One slow try is cut off after 3 s so a retry can go, and the whole call, retries included, gives up after 15 s.',
      },
    ],
    // L5 Polly pipelines
    [
      {
        kind: 'write',
        prompt: 'Retry publishing up to 4 times with exponential backoff and jitter, within 10 seconds.',
        starter: '',
        solution:
          'var pipeline = new ResiliencePipelineBuilder()\n    .AddRetry(new RetryStrategyOptions\n    {\n        MaxRetryAttempts = 4,\n        Delay = TimeSpan.FromMilliseconds(500),\n        BackoffType = DelayBackoffType.Exponential,\n        UseJitter = true\n    })\n    .AddTimeout(TimeSpan.FromSeconds(10))\n    .Build();\n\nawait pipeline.ExecuteAsync(async ct => await queue.PublishAsync(message, ct), cancellationToken);',
        checks: [
          { label: 'Start with new ResiliencePipelineBuilder()', has: 'new ResiliencePipelineBuilder()' },
          { label: 'AddRetry with MaxRetryAttempts = 4', re: 'AddRetry\\([\\s\\S]*MaxRetryAttempts\\s*=\\s*4\\b' },
          { label: 'BackoffType = DelayBackoffType.Exponential', re: 'BackoffType\\s*=\\s*DelayBackoffType\\.Exponential' },
          { label: 'UseJitter = true', re: 'UseJitter\\s*=\\s*true' },
          { label: 'AddTimeout of 10 seconds', re: '\\.AddTimeout\\(\\s*TimeSpan\\.FromSeconds\\(\\s*10\\s*\\)\\s*\\)' },
          { label: 'Build it, then run the publish with ExecuteAsync', re: '\\.Build\\(\\)[\\s\\S]*\\.ExecuteAsync\\(\\s*async\\s+\\w+\\s*=>[^;]*PublishAsync\\(' },
        ],
        hint: 'Strategies run in the order you add them; ExecuteAsync passes a token to your lambda.',
        explain: 'Backoff doubles the wait after each failure and jitter spreads clients out, so a recovering broker isn’t hit by everyone at once.',
      },
      {
        kind: 'write',
        prompt: 'Register an "inventory" pipeline and run the stock lookup through it.',
        starter:
          'builder.Services.AddSingleton<StockService>();\nvar app = builder.Build();\napp.MapGet("/stock/{sku}", async (string sku, StockService stock, CancellationToken ct) =>\n    await stock.CountAsync(sku, ct));',
        solution:
          'builder.Services.AddSingleton<StockService>();\nbuilder.Services.AddResiliencePipeline("inventory", b => b\n    .AddRetry(new RetryStrategyOptions { MaxRetryAttempts = 3, BackoffType = DelayBackoffType.Exponential })\n    .AddTimeout(TimeSpan.FromSeconds(5)));\nvar app = builder.Build();\napp.MapGet("/stock/{sku}", async (string sku, StockService stock,\n    ResiliencePipelineProvider<string> pipelines, CancellationToken ct) =>\n{\n    var pipeline = pipelines.GetPipeline("inventory");\n    return await pipeline.ExecuteAsync(async token => await stock.CountAsync(sku, token), ct);\n});',
        checks: [
          { label: 'Register it with AddResiliencePipeline("inventory", …)', re: 'AddResiliencePipeline\\(\\s*"inventory"\\s*,\\s*\\w+\\s*=>' },
          { label: 'Give it a retry strategy', re: 'AddResiliencePipeline\\([\\s\\S]*\\.AddRetry\\(' },
          { label: 'Inject ResiliencePipelineProvider<string>', re: 'ResiliencePipelineProvider<\\s*string\\s*>\\s+\\w+' },
          { label: 'GetPipeline("inventory")', re: '\\.GetPipeline\\(\\s*"inventory"\\s*\\)' },
          { label: 'Run CountAsync inside ExecuteAsync', re: '\\.ExecuteAsync\\(\\s*async\\s+\\w+\\s*=>[^;]*CountAsync\\(' },
        ],
        hint: 'Register by key on builder.Services; the provider hands the pipeline out by the same key.',
        explain: 'The pipeline is built once and shared, and any class or endpoint can fetch it by name instead of building its own.',
      },
    ],
  ],
};

export default unit;
