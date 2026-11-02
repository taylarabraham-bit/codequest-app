import type { DesktopUnit } from '../../../engine/types';

// Desktop edition: write-the-code challenges for ASP.NET unit 12 (Deploying & performance).
// lessons[i] runs after lesson i + 1. See docs/CONTENT_GUIDE.md.
const unit: DesktopUnit = {
  lessons: [
    // L1 Publishing
    [
      {
        kind: 'write',
        prompt: 'Publish the Bakery app to ./out, then start it from that folder.',
        starter: '',
        solution: 'dotnet publish -o ./out\ncd out\ndotnet Bakery.dll',
        checks: [
          { label: 'dotnet publish with -o pointing at out', re: '^\\s*dotnet\\s+publish\\b[^\\n]*\\s(-o|--output)\\s+(\\./)?out\\b', flags: 'm' },
          { label: 'Change into the output folder', re: '^\\s*cd\\s+(\\./)?out\\b', flags: 'm' },
          { label: 'Start it with dotnet Bakery.dll', re: '^\\s*dotnet\\s+Bakery\\.dll\\s*$', flags: 'm' },
        ],
        hint: 'Publish builds Release into the folder you name; the .dll inside is your app.',
        explain: 'Since .NET 8, dotnet publish uses Release by default. The published folder holds everything the app needs except the runtime.',
      },
      {
        kind: 'write',
        prompt: 'Publish Weather for a Raspberry Pi without .NET installed, to ./pi, and run it.',
        starter: '# the Pi runs 64-bit Linux on ARM and has no .NET runtime\n',
        solution:
          '# the Pi runs 64-bit Linux on ARM and has no .NET runtime\ndotnet publish -r linux-arm64 --self-contained -o ./pi\ncd pi\n./Weather',
        checks: [
          { label: 'Run dotnet publish', re: '^\\s*dotnet\\s+publish\\b', flags: 'm' },
          { label: 'Target the linux-arm64 runtime with -r', re: '(-r|--runtime)\\s+linux-arm64\\b' },
          { label: 'Bundle the runtime with --self-contained', has: '--self-contained' },
          { label: 'Write the output to ./pi', re: '(-o|--output)\\s+(\\./)?pi\\b' },
          { label: 'Start the native executable ./Weather', re: '^\\s*\\./Weather\\s*$', flags: 'm' },
        ],
        hint: 'A runtime identifier picks the OS and CPU; self-contained copies the runtime in.',
        explain: 'A self-contained build includes the .NET runtime and a native launcher named after the project, so the Pi needs nothing installed.',
      },
    ],
    // L2 Container images
    [
      {
        kind: 'write',
        prompt: 'In the .csproj, name the container image quiz-api and tag it 1.0.0.',
        starter: '<Project Sdk="Microsoft.NET.Sdk.Web">\n  <PropertyGroup>\n    <TargetFramework>net10.0</TargetFramework>\n  </PropertyGroup>\n</Project>',
        solution:
          '<Project Sdk="Microsoft.NET.Sdk.Web">\n  <PropertyGroup>\n    <TargetFramework>net10.0</TargetFramework>\n    <ContainerRepository>quiz-api</ContainerRepository>\n    <ContainerImageTag>1.0.0</ContainerImageTag>\n  </PropertyGroup>\n</Project>',
        checks: [
          { label: '<ContainerRepository>quiz-api</ContainerRepository>', re: '<ContainerRepository>\\s*quiz-api\\s*</ContainerRepository>' },
          { label: '<ContainerImageTag>1.0.0</ContainerImageTag>', re: '<ContainerImageTag>\\s*1\\.0\\.0\\s*</ContainerImageTag>' },
          {
            label: 'Both go inside a <PropertyGroup>',
            re: '<PropertyGroup>(?:(?!</PropertyGroup>)[\\s\\S])*<ContainerRepository>(?:(?!</PropertyGroup>)[\\s\\S])*<ContainerImageTag>|<PropertyGroup>(?:(?!</PropertyGroup>)[\\s\\S])*<ContainerImageTag>(?:(?!</PropertyGroup>)[\\s\\S])*<ContainerRepository>',
          },
        ],
        hint: 'They are MSBuild properties, just like TargetFramework.',
        explain: 'ContainerRepository names the image and ContainerImageTag replaces the default latest tag, so the image is quiz-api:1.0.0.',
      },
      {
        kind: 'write',
        prompt: 'Build the image with the SDK, then run it on host port 5000.',
        starter: '# build the image (no Dockerfile)\n\n# run it; the app listens on 8080 inside the container\ndocker run -p 5000:80 quiz-api:1.0.0\n',
        solution:
          '# build the image (no Dockerfile)\ndotnet publish --os linux --arch x64 /t:PublishContainer\n# run it; the app listens on 8080 inside the container\ndocker run -p 5000:8080 quiz-api:1.0.0',
        checks: [
          { label: 'dotnet publish', re: '^\\s*dotnet\\s+publish\\b', flags: 'm' },
          { label: 'Target Linux with --os linux', re: '--os\\s+linux\\b' },
          { label: 'Run the PublishContainer target', re: '[/-]t(arget)?:PublishContainer\\b' },
          { label: 'Map host 5000 to container 8080', re: 'docker\\s+run\\b[^\\n]*-p\\s+5000:8080\\b' },
          { label: 'Run the quiz-api image', re: 'docker\\s+run\\b[^\\n]*\\squiz-api(:1\\.0\\.0)?\\s*$', flags: 'm' },
        ],
        hint: 'The .NET 8+ ASP.NET images listen on 8080, not 80.',
        explain: 'The SDK builds and loads the image without a Dockerfile. -p host:container must point at the port the app really listens on: 8080.',
      },
    ],
    // L3 Health checks
    [
      {
        kind: 'write',
        prompt: 'Register two always-healthy checks and expose them at /healthz.',
        starter: 'var builder = WebApplication.CreateBuilder(args);\n',
        solution:
          'var builder = WebApplication.CreateBuilder(args);\nbuilder.Services.AddHealthChecks()\n    .AddCheck("db", () => HealthCheckResult.Healthy())\n    .AddCheck("printer", () => HealthCheckResult.Healthy());\nvar app = builder.Build();\napp.MapHealthChecks("/healthz");\napp.Run();',
        checks: [
          { label: 'Call builder.Services.AddHealthChecks()', has: 'builder.Services.AddHealthChecks()' },
          { label: 'Two named checks with .AddCheck', re: '(\\.AddCheck\\(\\s*"[^"]+"[\\s\\S]*?){2}' },
          { label: 'Each returns HealthCheckResult.Healthy()', re: '(HealthCheckResult\\.Healthy\\([^)]*\\)[\\s\\S]*?){2}' },
          { label: 'Map them at /healthz', re: 'app\\.MapHealthChecks\\(\\s*"/healthz"\\s*\\)' },
        ],
        hint: 'AddCheck takes a name and a lambda that returns a HealthCheckResult.',
        explain: 'Every check passes, so GET /healthz answers 200 with the text Healthy.',
        output: 'Healthy',
      },
      {
        kind: 'write',
        prompt: 'Finish the checks: mail can fail the probe, disk can only degrade it.',
        starter:
          'builder.Services.AddHealthChecks()\n    // mail: Unhealthy when Mail.IsUp() is false\n    // disk: Degraded when Disk.FreePercent() < 10\n    ;\nvar app = builder.Build();\n// expose them at /healthz\n',
        solution:
          'builder.Services.AddHealthChecks()\n    .AddCheck("mail", () => Mail.IsUp()\n        ? HealthCheckResult.Healthy()\n        : HealthCheckResult.Unhealthy("Mail server down"))\n    .AddCheck("disk", () => Disk.FreePercent() < 10\n        ? HealthCheckResult.Degraded("Low disk")\n        : HealthCheckResult.Healthy());\nvar app = builder.Build();\napp.MapHealthChecks("/healthz");',
        checks: [
          { label: 'A mail check that calls Mail.IsUp()', re: 'AddCheck\\(\\s*"mail"\\s*,[^;]*?Mail\\.IsUp\\(\\)' },
          { label: 'Mail reports Unhealthy when it’s down', re: 'AddCheck\\(\\s*"mail"\\s*,(?:(?!AddCheck\\()[^;])*HealthCheckResult\\.Unhealthy\\(' },
          { label: 'A disk check: Disk.FreePercent() < 10', re: 'AddCheck\\(\\s*"disk"\\s*,[^;]*?Disk\\.FreePercent\\(\\)\\s*<\\s*10\\b' },
          { label: 'Disk reports Degraded when space is low', re: 'AddCheck\\(\\s*"disk"\\s*,(?:(?!AddCheck\\()[^;])*HealthCheckResult\\.Degraded\\(' },
          { label: 'app.MapHealthChecks("/healthz")', has: 'app.MapHealthChecks("/healthz")' },
        ],
        hint: 'Use condition ? HealthCheckResult.Healthy() : HealthCheckResult.Unhealthy(…) in each lambda.',
        explain: 'Unhealthy answers 503 and pulls the instance out of the load balancer. Degraded still answers 200: a nearly full disk is a warning, not an outage.',
      },
    ],
    // L4 Output caching
    [
      {
        kind: 'write',
        prompt: 'Serve a cached leaderboard with output caching.',
        starter: 'var builder = WebApplication.CreateBuilder(args);\n',
        solution:
          'var builder = WebApplication.CreateBuilder(args);\nbuilder.Services.AddOutputCache();\nvar app = builder.Build();\napp.UseOutputCache();\napp.MapGet("/leaderboard", () => "1. Mia 980").CacheOutput();\napp.Run();',
        checks: [
          { label: 'Register builder.Services.AddOutputCache()', has: 'builder.Services.AddOutputCache()' },
          { label: 'Add app.UseOutputCache() after Build', re: 'builder\\.Build\\(\\)[\\s\\S]*app\\.UseOutputCache\\(\\)' },
          { label: 'A MapGet for the leaderboard', re: 'app\\.MapGet\\(\\s*"/\\w+' },
          { label: 'Opt the endpoint in with .CacheOutput()', re: 'MapGet\\([^;]*\\.CacheOutput\\(' },
        ],
        hint: 'Three pieces: Add… on services, Use… on app, then CacheOutput on the endpoint.',
        explain: 'The first GET runs your handler; later ones within a minute get the stored response without running it.',
        output: '1. Mia 980',
      },
      {
        kind: 'write',
        prompt: 'Cache every /scores endpoint for 10 seconds and /rules with the default policy.',
        starter:
          'builder.Services.AddOutputCache();\nvar app = builder.Build();\n\nvar scores = app.MapGroup("/scores");\nscores.MapGet("/today", () => "Mia 980");\nscores.MapGet("/week", () => "Leo 4200");\napp.MapGet("/rules", () => "No cheating");',
        solution:
          'builder.Services.AddOutputCache();\nvar app = builder.Build();\napp.UseOutputCache();\n\nvar scores = app.MapGroup("/scores")\n    .CacheOutput(p => p.Expire(TimeSpan.FromSeconds(10)));\nscores.MapGet("/today", () => "Mia 980");\nscores.MapGet("/week", () => "Leo 4200");\napp.MapGet("/rules", () => "No cheating").CacheOutput();',
        checks: [
          { label: 'Add app.UseOutputCache() after Build', re: 'builder\\.Build\\(\\)[\\s\\S]*app\\.UseOutputCache\\(\\)' },
          {
            label: 'Cache the whole /scores group',
            re: '(MapGroup\\(\\s*"/scores"\\s*\\)|\\bscores)\\s*\\.CacheOutput\\(',
          },
          {
            label: 'Expire the group after 10 seconds',
            re: '\\.CacheOutput\\(\\s*\\w+\\s*=>\\s*\\w+\\.Expire\\(\\s*TimeSpan\\.FromSeconds\\(\\s*10\\s*\\)\\s*\\)',
          },
          { label: 'Cache /rules with .CacheOutput()', re: '"/rules"[^;]*\\.CacheOutput\\(\\s*\\)' },
        ],
        hint: 'CacheOutput works on a MapGroup too, and Expire sets the lifetime.',
        explain: 'Policy on the group covers every endpoint in it. /rules keeps the default one-minute lifetime.',
      },
    ],
    // L5 Rate limiting
    [
      {
        kind: 'write',
        prompt: 'Allow 5 login attempts per minute; reject extras with 429.',
        starter: '',
        solution:
          'builder.Services.AddRateLimiter(o =>\n{\n    o.RejectionStatusCode = 429;\n    o.AddFixedWindowLimiter("login", w =>\n    {\n        w.PermitLimit = 5;\n        w.Window = TimeSpan.FromMinutes(1);\n    });\n});\nvar app = builder.Build();\napp.UseRateLimiter();\napp.MapPost("/login", (Login body) => Results.Ok()).RequireRateLimiting("login");',
        checks: [
          { label: 'A named fixed window limiter in AddRateLimiter', re: 'AddRateLimiter\\([\\s\\S]*AddFixedWindowLimiter\\(\\s*"[\\w-]+"' },
          { label: 'PermitLimit = 5', re: 'PermitLimit\\s*=\\s*5\\b' },
          { label: 'A one-minute Window', re: 'Window\\s*=\\s*TimeSpan\\.From(Minutes\\(\\s*1\\s*\\)|Seconds\\(\\s*60\\s*\\))' },
          { label: 'RejectionStatusCode = 429', re: 'RejectionStatusCode\\s*=\\s*(429|StatusCodes\\.Status429TooManyRequests)' },
          { label: 'app.UseRateLimiter()', has: 'app.UseRateLimiter()' },
          {
            label: 'Attach the policy to POST /login',
            re: 'AddFixedWindowLimiter\\(\\s*"([\\w-]+)"[\\s\\S]*MapPost\\(\\s*"/login"[^;]*\\.RequireRateLimiting\\(\\s*"\\1"\\s*\\)',
          },
        ],
        hint: 'Name the policy in AddFixedWindowLimiter and use the same name in RequireRateLimiting.',
        explain: 'The sixth login in a minute is rejected before the handler runs. 429 tells the client to slow down; the default 503 would look like an outage.',
      },
      {
        kind: 'write',
        prompt: 'Fix the limiter so /coupons allows 3 requests per 10 seconds.',
        starter:
          'builder.Services.AddRateLimiter(o =>\n    o.AddFixedWindowLimiter("coupons", w =>\n    {\n        w.PermitLimit = 3;\n        w.Window = TimeSpan.FromMinutes(10);\n    }));\nvar app = builder.Build();\napp.MapGet("/coupons", () => "SAVE10").RequireRateLimiting("coupon");\napp.Run();',
        solution:
          'builder.Services.AddRateLimiter(o =>\n    o.AddFixedWindowLimiter("coupons", w =>\n    {\n        w.PermitLimit = 3;\n        w.Window = TimeSpan.FromSeconds(10);\n    }));\nvar app = builder.Build();\napp.UseRateLimiter();\napp.MapGet("/coupons", () => "SAVE10").RequireRateLimiting("coupons");\napp.Run();',
        checks: [
          { label: 'A 10-second Window', re: 'Window\\s*=\\s*TimeSpan\\.FromSeconds\\(\\s*10\\s*\\)' },
          { label: 'No 10-minute window', not: 'FromMinutes(10)' },
          { label: 'Turn the middleware on with app.UseRateLimiter()', has: 'app.UseRateLimiter()' },
          {
            label: 'RequireRateLimiting uses the policy’s exact name',
            re: 'AddFixedWindowLimiter\\(\\s*"([\\w-]+)"[\\s\\S]*RequireRateLimiting\\(\\s*"\\1"\\s*\\)',
          },
        ],
        hint: 'Three bugs: the window length, a missing middleware call, and a name that doesn’t match.',
        explain: 'Without UseRateLimiter nothing is limited, and an unknown policy name throws when the endpoint is hit.',
        output: 'SAVE10',
      },
    ],
  ],
  // Windows PowerShell versions of shared items (the phone keeps the bash ones).
  overrides: {
    'L1.4': {
      kind: 'build',
      prompt: 'Start the published app from its folder.',
      answer: ['dotnet', 'Shop.dll'],
      distractors: ['run', 'Shop.csproj'],
      hint: 'Hand the compiled DLL to the dotnet host.',
      explain: 'The publish folder holds compiled files, not a project, so dotnet run has nothing to build. dotnet Shop.dll starts the app on the installed runtime.',
      output: 'info: Microsoft.Hosting.Lifetime[14]\n      Now listening on: http://localhost:5000\ninfo: Microsoft.Hosting.Lifetime[0]\n      Application started. Press Ctrl+C to shut down.\ninfo: Microsoft.Hosting.Lifetime[0]\n      Hosting environment: Production\ninfo: Microsoft.Hosting.Lifetime[0]\n      Content root path: C:\\Users\\ana\\Shop\\publish',
    },
    'L1.5': {
      kind: 'fill',
      prompt: 'Predict the environment the published app runs in.',
      code: 'PS> cd publish\nPS> dotnet Shop.dll\ninfo: Microsoft.Hosting.Lifetime[0]\n      Hosting environment: ___',
      blanks: [{ answer: ['Production'], options: ['Production', 'Development', 'Release'] }],
      hint: 'launchSettings.json is only used by dotnet run and your IDE.',
      explain: 'Nothing sets ASPNETCORE_ENVIRONMENT here, so the app falls back to Production. Release is a build configuration, not an environment.',
      output: 'info: Microsoft.Hosting.Lifetime[14]\n      Now listening on: http://localhost:5000\ninfo: Microsoft.Hosting.Lifetime[0]\n      Application started. Press Ctrl+C to shut down.\ninfo: Microsoft.Hosting.Lifetime[0]\n      Hosting environment: Production\ninfo: Microsoft.Hosting.Lifetime[0]\n      Content root path: C:\\Users\\ana\\Shop\\publish',
    },
    'boss.4': {
      kind: 'order',
      prompt: 'Build the shop image, run it, probe /healthz, stop it.',
      lines: [
        'dotnet publish --os linux --arch x64 /t:PublishContainer',
        'docker run -d --name shop1 -p 8080:8080 shop',
        'curl.exe http://localhost:8080/healthz',
        'docker stop shop1',
      ],
      hint: 'You can’t run an image that hasn’t been built yet.',
      explain: 'Publish pushes the shop image to Docker, run starts it in the background, curl.exe asks the health endpoint (plain curl in Windows PowerShell is Invoke-WebRequest), and stop shuts it down.',
      output: 'Healthy',
    },
  },
};

export default unit;
