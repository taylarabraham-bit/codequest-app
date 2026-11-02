import type { DesktopUnit } from '../../../engine/types';

// Desktop edition: write-the-code challenges for ASP.NET unit 4 (Middleware).
// lessons[i] runs after lesson i + 1. See docs/CONTENT_GUIDE.md.
const unit: DesktopUnit = {
  lessons: [
    // L1 The pipeline
    [
      {
        kind: 'write',
        prompt: 'Add middleware that logs the path on the way in and the status on the way out.',
        starter: 'var app = builder.Build();\n\n\napp.MapGet("/", () => "Garden API");\napp.Run();',
        solution:
          'var app = builder.Build();\n\napp.Use(async (context, next) =>\n{\n    Console.WriteLine($"-> {context.Request.Path}");\n    await next(context);\n    Console.WriteLine($"<- {context.Response.StatusCode}");\n});\n\napp.MapGet("/", () => "Garden API");\napp.Run();',
        checks: [
          { label: 'app.Use with an async (context, next) lambda', re: 'app\\.Use\\(\\s*async\\s*\\(\\s*\\w+\\s*,\\s*\\w+\\s*\\)\\s*=>' },
          { label: 'Call await next(context)', re: 'await\\s+\\w+\\(\\s*\\w+\\s*\\)' },
          { label: 'Read Request.Path before next', re: 'Request\\.Path[\\s\\S]*await\\s+\\w+\\(\\s*\\w+\\s*\\)' },
          { label: 'Read Response.StatusCode after next', re: 'await\\s+\\w+\\(\\s*\\w+\\s*\\)[\\s\\S]*Response\\.StatusCode' },
          { label: 'Add it before the endpoints', re: 'app\\.Use\\([\\s\\S]*app\\.MapGet\\(' },
        ],
        hint: 'Code before await next(context) runs on the way in; code after it on the way out.',
        explain: 'The status code is only known once the rest of the pipeline has run, so it has to be read after next.',
      },
      {
        kind: 'write',
        prompt: 'When Maintenance is true, answer every request with 503 "Back soon!".',
        starter:
          'var maintenance = builder.Configuration.GetValue<bool>("Maintenance");\nvar app = builder.Build();\n\n\napp.MapGet("/", () => "Shop is open");\napp.Run();',
        solution:
          'var maintenance = builder.Configuration.GetValue<bool>("Maintenance");\nvar app = builder.Build();\n\napp.Use(async (context, next) =>\n{\n    if (maintenance)\n    {\n        context.Response.StatusCode = 503;\n        await context.Response.WriteAsync("Back soon!");\n        return;\n    }\n    await next(context);\n});\n\napp.MapGet("/", () => "Shop is open");\napp.Run();',
        checks: [
          { label: 'Middleware added with app.Use before MapGet', re: 'app\\.Use\\([\\s\\S]*app\\.MapGet\\(' },
          { label: 'Set StatusCode to 503', re: 'StatusCode\\s*=\\s*(503|StatusCodes\\.Status503ServiceUnavailable)\\s*;' },
          { label: 'Write "Back soon!" to the response', re: 'WriteAsync\\(\\s*"Back soon!"\\s*\\)' },
          { label: 'Otherwise call await next(context)', re: 'await\\s+\\w+\\(\\s*\\w+\\s*\\)\\s*;' },
        ],
        hint: 'Set the status first, write the text, and don’t call next in that branch.',
        explain: 'Skipping next short-circuits the pipeline, so no endpoint runs. The status must be set before the body starts.',
        output: 'Back soon!',
      },
    ],
    // L2 Middleware classes
    [
      {
        kind: 'write',
        prompt: 'Write middleware that adds an X-Request-Id header, then register it.',
        starter: '',
        solution:
          'app.UseMiddleware<RequestIdMiddleware>();\n\nclass RequestIdMiddleware\n{\n    private readonly RequestDelegate _next;\n\n    public RequestIdMiddleware(RequestDelegate next)\n    {\n        _next = next;\n    }\n\n    public async Task InvokeAsync(HttpContext context)\n    {\n        context.Response.Headers["X-Request-Id"] = Guid.NewGuid().ToString();\n        await _next(context);\n    }\n}',
        checks: [
          { label: 'A constructor that takes a RequestDelegate', re: '(public|class)\\s+\\w+\\s*\\(\\s*RequestDelegate\\s+\\w+\\s*\\)' },
          { label: 'public async Task InvokeAsync(HttpContext context)', re: 'public\\s+async\\s+Task\\s+InvokeAsync\\(\\s*HttpContext\\s+\\w+\\s*\\)' },
          { label: 'Set the "X-Request-Id" response header', re: 'Response\\.Headers(\\[\\s*"X-Request-Id"\\s*\\]\\s*=|\\.Append\\(\\s*"X-Request-Id")' },
          { label: 'Call the next delegate', re: 'await\\s+_?\\w+\\(\\s*\\w+\\s*\\)' },
          { label: 'Register it with app.UseMiddleware<…>()', re: 'app\\.UseMiddleware<\\s*\\w+\\s*>\\(\\s*\\)' },
        ],
        hint: 'Keep next in a field from the constructor; InvokeAsync does the work and calls it.',
        explain: 'Headers must be set before the response starts, so this one goes in before calling the next step.',
      },
      {
        kind: 'write',
        prompt: 'VisitLog is scoped. Take it in InvokeAsync, not the constructor, and register the middleware.',
        starter:
          'class VisitMiddleware\n{\n    private readonly RequestDelegate _next;\n    private readonly VisitLog _log;\n\n    public VisitMiddleware(RequestDelegate next, VisitLog log)\n    {\n        _next = next;\n        _log = log;\n    }\n\n    public async Task InvokeAsync(HttpContext context)\n    {\n        _log.Add(context.Request.Path);\n        await _next(context);\n    }\n}',
        solution:
          'app.UseMiddleware<VisitMiddleware>();\n\nclass VisitMiddleware\n{\n    private readonly RequestDelegate _next;\n\n    public VisitMiddleware(RequestDelegate next)\n    {\n        _next = next;\n    }\n\n    public async Task InvokeAsync(HttpContext context, VisitLog log)\n    {\n        log.Add(context.Request.Path);\n        await _next(context);\n    }\n}',
        checks: [
          { label: 'Constructor takes only the RequestDelegate', re: '(public|class)\\s+VisitMiddleware\\s*\\(\\s*RequestDelegate\\s+\\w+\\s*\\)' },
          { label: 'No VisitLog field', not: 'readonly VisitLog' },
          { label: 'InvokeAsync(HttpContext, VisitLog)', re: 'InvokeAsync\\(\\s*HttpContext\\s+\\w+\\s*,\\s*VisitLog\\s+\\w+\\s*\\)' },
          { label: 'Register with app.UseMiddleware<VisitMiddleware>()', re: 'app\\.UseMiddleware<\\s*VisitMiddleware\\s*>\\(\\s*\\)' },
        ],
        hint: 'The class is built once for the app, but InvokeAsync runs per request.',
        explain: 'Extra InvokeAsync parameters are resolved from each request’s scope, so every request gets its own VisitLog.',
      },
    ],
    // L3 HTTPS & static files
    [
      {
        kind: 'write',
        prompt: 'Serve a static site from wwwroot: redirect to HTTPS and show index.html at /.',
        starter: 'var app = builder.Build();\n\n\napp.Run();',
        solution:
          'var app = builder.Build();\n\napp.UseHttpsRedirection();\napp.UseDefaultFiles();\napp.UseStaticFiles();\n\napp.Run();',
        checks: [
          { label: 'app.UseHttpsRedirection()', has: 'app.UseHttpsRedirection()' },
          { label: 'app.UseDefaultFiles()', has: 'app.UseDefaultFiles()' },
          { label: 'app.UseStaticFiles()', has: 'app.UseStaticFiles()' },
          { label: 'Default files before static files', re: 'UseDefaultFiles\\(\\)[\\s\\S]*UseStaticFiles\\(\\)' },
        ],
        hint: 'UseDefaultFiles only rewrites the path, so something after it must serve the file.',
        explain: 'UseDefaultFiles turns / into /index.html, then UseStaticFiles finds that file in wwwroot and sends it.',
      },
      {
        kind: 'write',
        prompt: 'Fix the portfolio: / should show index.html, and http should go to https.',
        starter:
          'var app = builder.Build();\n\napp.UseStaticFiles();\napp.UseDefaultFiles();\napp.MapGet("/api/projects", () => new[] { "Weather app", "Chess bot" });\n\napp.Run();',
        solution:
          'var app = builder.Build();\n\napp.UseHttpsRedirection();\napp.UseDefaultFiles();\napp.UseStaticFiles();\napp.MapGet("/api/projects", () => new[] { "Weather app", "Chess bot" });\n\napp.Run();',
        checks: [
          { label: 'UseDefaultFiles() before UseStaticFiles()', re: 'UseDefaultFiles\\(\\)[\\s\\S]*UseStaticFiles\\(\\)' },
          { label: 'Only one UseStaticFiles()', re: '^(?![\\s\\S]*UseStaticFiles[\\s\\S]*UseStaticFiles)' },
          { label: 'UseHttpsRedirection() comes first', re: 'UseHttpsRedirection\\(\\)[\\s\\S]*UseDefaultFiles\\(\\)' },
          { label: 'Keep GET /api/projects', re: 'MapGet\\(\\s*"/api/projects"' },
        ],
        hint: 'Order matters: by the time UseStaticFiles runs, / must already be /index.html.',
        explain: 'Redirecting first means no file is ever served over plain http, and the rewrite has to happen before the file lookup.',
        output: '["Weather app","Chess bot"]',
      },
    ],
    // L4 CORS
    [
      {
        kind: 'write',
        prompt: 'Let pages on https://app.fitlog.dev call this API, with a named CORS policy.',
        starter: 'var builder = WebApplication.CreateBuilder(args);\n\nvar app = builder.Build();\n',
        solution:
          'var builder = WebApplication.CreateBuilder(args);\nbuilder.Services.AddCors(options =>\n    options.AddPolicy("Web", policy =>\n        policy.WithOrigins("https://app.fitlog.dev")\n            .AllowAnyHeader()\n            .AllowAnyMethod()));\nvar app = builder.Build();\napp.UseCors("Web");',
        checks: [
          { label: 'builder.Services.AddCors(…) before Build()', re: 'builder\\.Services\\.AddCors\\([\\s\\S]*\\.Build\\(\\)' },
          { label: 'A named policy with AddPolicy("…")', re: 'AddPolicy\\(\\s*"\\w+"\\s*,' },
          { label: 'WithOrigins("https://app.fitlog.dev"), no trailing slash', re: 'WithOrigins\\(\\s*"https://app\\.fitlog\\.dev"\\s*\\)' },
          { label: 'app.UseCors with the same policy name', re: 'AddPolicy\\(\\s*"(\\w+)"[\\s\\S]*app\\.UseCors\\(\\s*"\\1"\\s*\\)' },
        ],
        hint: 'AddCors(options => options.AddPolicy("Name", policy => policy.WithOrigins(…))).',
        explain: 'The browser compares the page’s origin to the one you allow, character for character, then lets the page read the response.',
      },
      {
        kind: 'write',
        prompt: 'Fix the origin, and allow CORS only on /api/prices.',
        starter:
          'builder.Services.AddCors(o => o.AddPolicy("Partners", p =>\n    p.WithOrigins("http://localhost:5173/").AllowAnyHeader()));\nvar app = builder.Build();\n\napp.MapGet("/api/prices", () => new { Gold = 2400 });\napp.MapGet("/api/admin", () => "secret");',
        solution:
          'builder.Services.AddCors(o => o.AddPolicy("Partners", p =>\n    p.WithOrigins("http://localhost:5173").AllowAnyHeader()));\nvar app = builder.Build();\n\napp.UseCors();\n\napp.MapGet("/api/prices", () => new { Gold = 2400 }).RequireCors("Partners");\napp.MapGet("/api/admin", () => "secret");',
        checks: [
          { label: 'Origin "http://localhost:5173" with no trailing slash', re: 'WithOrigins\\(\\s*"http://localhost:5173"\\s*\\)' },
          { label: 'app.UseCors() with no policy name', re: 'app\\.UseCors\\(\\s*\\)' },
          { label: '/api/prices gets .RequireCors("Partners")', re: '"/api/prices"[^;]*\\.RequireCors\\(\\s*"Partners"\\s*\\)' },
          { label: 'Leave /api/admin without CORS', re: '^(?![\\s\\S]*"/api/admin"[^;]*RequireCors)' },
        ],
        hint: 'An origin never ends in /. UseCors() with no name turns CORS on; RequireCors picks endpoints.',
        explain: 'The browser sends the origin without a slash, so the old policy never matched. RequireCors scopes the policy to one endpoint.',
        output: '{"gold":2400}',
      },
    ],
    // L5 Groups & filters
    [
      {
        kind: 'write',
        prompt: 'Put the recipe endpoints in a /api/recipes group: list all and get one by id.',
        starter: '',
        solution:
          'var recipes = app.MapGroup("/api/recipes");\n\nrecipes.MapGet("/", () => new[] { "Soup", "Pie" });\nrecipes.MapGet("/{id:int}", (int id) => $"Recipe {id}");',
        checks: [
          { label: 'Store app.MapGroup("/api/recipes") in a variable', re: 'var\\s+\\w+\\s*=\\s*app\\.MapGroup\\(\\s*"/api/recipes"\\s*\\)' },
          { label: 'A GET for the whole list on the group', re: 'var\\s+(\\w+)\\s*=\\s*app\\.MapGroup[\\s\\S]*\\b\\1\\.MapGet\\(\\s*"/?"' },
          { label: 'A GET by {id:int} on the group', re: 'var\\s+(\\w+)\\s*=\\s*app\\.MapGroup[\\s\\S]*\\b\\1\\.MapGet\\(\\s*"/\\{\\w+:int\\}"' },
          { label: 'Don’t repeat /api/recipes in the endpoints', not: 'MapGet("/api/recipes' },
        ],
        hint: 'Map the endpoints on the group variable, with paths relative to its prefix.',
        explain: 'Every endpoint on the group gets the /api/recipes prefix, so /{id:int} answers /api/recipes/3.',
      },
      {
        kind: 'write',
        prompt: 'Add an endpoint filter that rejects negative points with 400.',
        starter:
          'var scores = app.MapGroup("/api/scores");\nscores.MapGet("/", () => "Top: 990");\nscores.MapPost("/{points:int}", (int points) => $"Saved {points}");',
        solution:
          'var scores = app.MapGroup("/api/scores");\nscores.MapGet("/", () => "Top: 990");\nscores.MapPost("/{points:int}", (int points) => $"Saved {points}")\n    .AddEndpointFilter(async (ctx, next) =>\n    {\n        var points = ctx.GetArgument<int>(0);\n        if (points < 0)\n            return Results.BadRequest("Points must be 0 or more");\n        return await next(ctx);\n    });',
        checks: [
          { label: 'AddEndpointFilter on the POST endpoint', re: 'MapPost\\([^;]*\\.AddEndpointFilter\\(\\s*async' },
          { label: 'Read the points with GetArgument<int>(0)', re: 'GetArgument<int>\\(\\s*0\\s*\\)' },
          { label: 'Results.BadRequest(…) when it is below 0', re: '<\\s*0[\\s\\S]*Results\\.BadRequest\\(' },
          { label: 'Otherwise return await next(…)', re: 'return\\s+await\\s+\\w+\\(\\s*\\w+\\s*\\)' },
        ],
        hint: 'Chain .AddEndpointFilter onto MapPost. Arguments are numbered from 0.',
        explain: 'The filter runs before the handler, so a bad value never reaches it. Returning next(ctx) lets good requests through.',
      },
    ],
  ],
};

export default unit;
