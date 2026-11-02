import type { DesktopUnit } from '../../../engine/types';

// Desktop edition: write-the-code challenges for ASP.NET unit 10 (Authentication & authorization).
// lessons[i] runs after lesson i + 1. See docs/CONTENT_GUIDE.md.
const unit: DesktopUnit = {
  lessons: [
    // L1 Turning auth on
    [
      {
        kind: 'write',
        prompt: 'Turn on JWT authentication and authorization, with both middleware in order.',
        starter: 'var builder = WebApplication.CreateBuilder(args);\n',
        solution:
          'var builder = WebApplication.CreateBuilder(args);\nbuilder.Services.AddAuthentication().AddJwtBearer();\nbuilder.Services.AddAuthorization();\nvar app = builder.Build();\n\napp.UseAuthentication();\napp.UseAuthorization();\n\napp.MapGet("/payslips", () => "3 payslips");\napp.Run();',
        checks: [
          { label: 'AddAuthentication().AddJwtBearer() before Build()', re: 'builder\\.Services\\.AddAuthentication\\(\\)\\s*\\.AddJwtBearer\\(\\)[\\s\\S]*\\.Build\\(\\)' },
          { label: 'AddAuthorization() before Build()', re: 'builder\\.Services\\.AddAuthorization\\(\\)[\\s\\S]*\\.Build\\(\\)' },
          { label: 'app.UseAuthentication() then app.UseAuthorization()', re: 'app\\.UseAuthentication\\(\\)[\\s\\S]*app\\.UseAuthorization\\(\\)' },
          { label: 'The middleware goes on app, after Build()', re: '\\.Build\\(\\)[\\s\\S]*app\\.UseAuthentication\\(\\)' },
        ],
        hint: 'Services go on builder.Services; middleware goes on app, authentication first.',
        explain: 'Authentication works out who is calling, then authorization checks what they may do, so the order matters.',
      },
      {
        kind: 'write',
        prompt: 'This startup code is out of order. Fix it.',
        starter:
          'builder.Services.AddAuthorization();\nvar app = builder.Build();\nbuilder.Services.AddAuthentication().AddJwtBearer();\n\napp.UseAuthorization();\napp.UseAuthentication();\n\napp.MapGet("/vault", () => "Gold bars");',
        solution:
          'builder.Services.AddAuthentication().AddJwtBearer();\nbuilder.Services.AddAuthorization();\nvar app = builder.Build();\n\napp.UseAuthentication();\napp.UseAuthorization();\n\napp.MapGet("/vault", () => "Gold bars");',
        checks: [
          { label: 'No services registered after Build()', re: '^(?![\\s\\S]*\\.Build\\(\\)[\\s\\S]*builder\\.Services)' },
          { label: 'Register authentication with AddJwtBearer()', re: 'AddAuthentication\\(\\)\\s*\\.AddJwtBearer\\(\\)' },
          { label: 'UseAuthentication() before UseAuthorization()', re: '^(?![\\s\\S]*UseAuthorization\\(\\)[\\s\\S]*UseAuthentication\\(\\))[\\s\\S]*UseAuthentication\\(\\)[\\s\\S]*UseAuthorization\\(\\)' },
          { label: 'Keep GET /vault', re: 'MapGet\\(\\s*"/vault"' },
        ],
        hint: 'Build() locks the service list, and you must know who someone is before checking their rights.',
        explain: 'Adding services after Build() throws, and authorization before authentication would see every caller as anonymous.',
        output: 'Gold bars',
      },
    ],
    // L2 Protecting endpoints
    [
      {
        kind: 'write',
        prompt: 'Lock every /orders endpoint, except a public GET /orders/menu.',
        starter: 'var app = builder.Build();\n',
        solution:
          'var app = builder.Build();\n\nvar orders = app.MapGroup("/orders").RequireAuthorization();\norders.MapGet("/", () => "Your orders");\norders.MapPost("/", () => "Order placed");\norders.MapGet("/menu", () => "Today\'s menu").AllowAnonymous();',
        checks: [
          { label: 'MapGroup("/orders").RequireAuthorization()', re: 'app\\.MapGroup\\(\\s*"/orders"\\s*\\)\\s*\\.RequireAuthorization\\(\\s*\\)' },
          { label: 'At least one locked endpoint on the group', re: 'var\\s+(\\w+)\\s*=\\s*app\\.MapGroup[\\s\\S]*\\b\\1\\.Map(Get|Post|Put|Delete)\\(\\s*"/?"' },
          { label: 'GET /menu on the group with .AllowAnonymous()', re: 'var\\s+(\\w+)\\s*=\\s*app\\.MapGroup[\\s\\S]*\\b\\1\\.MapGet\\(\\s*"/menu"[^;]*\\.AllowAnonymous\\(\\s*\\)' },
        ],
        hint: 'RequireAuthorization on the group covers every endpoint in it; AllowAnonymous reopens one.',
        explain: 'AllowAnonymous beats any Authorize rule, so /orders/menu stays public while the rest need a token.',
      },
      {
        kind: 'write',
        prompt: 'Protect InvoicesController, but keep its Terms action public.',
        starter:
          'using Microsoft.AspNetCore.Mvc;\n\n[ApiController]\n[Route("api/[controller]")]\npublic class InvoicesController : ControllerBase\n{\n    [HttpGet]\n    public string Mine() => "3 invoices";\n\n    [HttpGet("terms")]\n    public string Terms() => "Pay within 30 days";\n}',
        solution:
          'using Microsoft.AspNetCore.Authorization;\nusing Microsoft.AspNetCore.Mvc;\n\n[ApiController]\n[Route("api/[controller]")]\n[Authorize]\npublic class InvoicesController : ControllerBase\n{\n    [HttpGet]\n    public string Mine() => "3 invoices";\n\n    [HttpGet("terms")]\n    [AllowAnonymous]\n    public string Terms() => "Pay within 30 days";\n}',
        checks: [
          { label: 'using Microsoft.AspNetCore.Authorization;', has: 'using Microsoft.AspNetCore.Authorization;' },
          { label: '[Authorize] on the controller class', re: '\\[Authorize\\]\\s*(\\[[^\\]]*\\]\\s*)*public\\s+class\\s+InvoicesController' },
          { label: '[AllowAnonymous] on Terms', re: '\\[AllowAnonymous\\]\\s*(\\[[^\\]]*\\]\\s*)*public\\s+\\w+\\s+Terms\\(' },
          { label: 'Mine stays protected', re: '^(?![\\s\\S]*\\[AllowAnonymous\\]\\s*(\\[[^\\]]*\\]\\s*)*public\\s+\\w+\\s+Mine\\()' },
        ],
        hint: 'Attributes on the class apply to every action; an action attribute can override it.',
        explain: '[Authorize] on the class covers both actions, and [AllowAnonymous] on Terms wins over it.',
      },
    ],
    // L3 Dev tokens
    [
      {
        kind: 'write',
        prompt: 'Make a dev token for ana with the admin role, then call /admin with it.',
        starter: '',
        solution: 'dotnet user-jwts create --name ana --role admin\ncurl.exe -H "Authorization: Bearer <token>" https://localhost:7001/admin',
        checks: [
          { label: 'Create a token with dotnet user-jwts create', has: 'dotnet user-jwts create' },
          { label: '--name ana', re: '--name\\s+"?ana"?(\\s|$)' },
          { label: '--role admin', re: '--role\\s+"?admin"?(\\s|$)' },
          { label: 'Send it with curl.exe as an Authorization: Bearer header to /admin', re: 'curl\\.exe\\b[^\\n]*(-H|--header)\\s+"Authorization: Bearer [^"]+"[^\\n]*/admin|curl\\.exe\\b[^\\n]*/admin[^\\n]*(-H|--header)\\s+"Authorization: Bearer [^"]+"' },
        ],
        hint: 'user-jwts prints the token; paste it after the word Bearer. In PowerShell, call curl.exe.',
        explain: 'The token is signed with a key only your machine trusts, and the Bearer header is how JWTs travel.',
      },
      {
        kind: 'write',
        prompt: 'Fix the command: ben needs the staff and admin roles and two claims.',
        starter: 'dotnet user-jwts create --name ben --role staff,admin --claim "plan=pro, region=eu"',
        solution: 'dotnet user-jwts create --name ben --role staff --role admin --claim "plan=pro" --claim "region=eu"',
        checks: [
          { label: '--role staff on its own', re: '--role\\s+"?staff"?(\\s|$)' },
          { label: '--role admin on its own', re: '--role\\s+"?admin"?(\\s|$)' },
          { label: '--claim plan=pro', re: '--claim\\s+"?plan=pro"?(\\s|$)' },
          { label: '--claim region=eu', re: '--claim\\s+"?region=eu"?(\\s|$)' },
          { label: 'Keep --name ben', re: '--name\\s+"?ben"?(\\s|$)' },
        ],
        hint: 'Each option takes one value; repeat the option for more.',
        explain: 'Commas aren’t separators here: "staff,admin" would be one role with a comma in its name.',
      },
    ],
    // L4 Claims & the user
    [
      {
        kind: 'write',
        prompt: 'GET /me greets the signed-in user by name and shows their id.',
        starter: 'using System.Security.Claims;\n',
        solution:
          'using System.Security.Claims;\n\napp.MapGet("/me", (ClaimsPrincipal user) =>\n    $"Hi {user.Identity?.Name}, your id is {user.FindFirstValue(ClaimTypes.NameIdentifier)}")\n    .RequireAuthorization();',
        checks: [
          { label: 'A ClaimsPrincipal parameter', re: 'ClaimsPrincipal\\s+\\w+' },
          { label: 'Read the name with Identity?.Name', re: '\\w+\\.Identity\\?\\.Name\\b' },
          { label: 'FindFirstValue(ClaimTypes.NameIdentifier)', re: 'FindFirstValue\\(\\s*ClaimTypes\\.NameIdentifier\\s*\\)' },
          { label: 'Require a signed-in caller', re: 'MapGet\\(\\s*"/me"[^;]*\\.RequireAuthorization\\(\\s*\\)' },
        ],
        hint: 'ASP.NET fills a ClaimsPrincipal parameter with the caller.',
        explain: 'The name and id come from the token’s claims, and RequireAuthorization makes sure there is a caller to read.',
      },
      {
        kind: 'write',
        prompt: 'Only the note’s owner or an admin may delete it; others get 403.',
        starter:
          'app.MapDelete("/notes/{id:int}", async (int id, ClaimsPrincipal user, NotesDb db) =>\n{\n    var note = await db.Notes.FindAsync(id);\n    if (note is null) return Results.NotFound();\n    db.Notes.Remove(note);\n    await db.SaveChangesAsync();\n    return Results.NoContent();\n}).RequireAuthorization();',
        solution:
          'app.MapDelete("/notes/{id:int}", async (int id, ClaimsPrincipal user, NotesDb db) =>\n{\n    var note = await db.Notes.FindAsync(id);\n    if (note is null) return Results.NotFound();\n    var userId = user.FindFirstValue(ClaimTypes.NameIdentifier);\n    if (note.OwnerId != userId && !user.IsInRole("admin"))\n        return Results.Forbid();\n    db.Notes.Remove(note);\n    await db.SaveChangesAsync();\n    return Results.NoContent();\n}).RequireAuthorization();',
        checks: [
          { label: 'Read the caller’s id with FindFirstValue', re: 'FindFirstValue\\(\\s*ClaimTypes\\.NameIdentifier\\s*\\)' },
          { label: 'Compare it with the note’s owner', re: '\\w+\\.OwnerId\\s*(!=|==)|(!=|==)\\s*\\w+\\.OwnerId' },
          { label: 'Let admins through with IsInRole("admin")', re: 'IsInRole\\(\\s*"admin"\\s*\\)' },
          { label: 'return Results.Forbid() before removing', re: 'Results\\.Forbid\\(\\)[\\s\\S]*\\.Remove\\(' },
        ],
        hint: 'Check after finding the note but before Remove.',
        explain: 'The caller is signed in, so this isn’t 401; Forbid sends 403 because they’re known but not allowed.',
      },
    ],
    // L5 Roles & policies
    [
      {
        kind: 'write',
        prompt: 'Only managers may issue refunds: define a policy and apply it to POST /refunds.',
        starter: 'builder.Services.AddAuthentication().AddJwtBearer();\n',
        solution:
          'builder.Services.AddAuthentication().AddJwtBearer();\nbuilder.Services.AddAuthorizationBuilder()\n    .AddPolicy("Refunds", policy => policy.RequireRole("manager"));\nvar app = builder.Build();\n\napp.MapPost("/refunds", () => "Refund issued").RequireAuthorization("Refunds");',
        checks: [
          { label: 'AddAuthorizationBuilder().AddPolicy("…", …)', re: 'AddAuthorizationBuilder\\(\\)\\s*\\.AddPolicy\\(\\s*"\\w+"\\s*,' },
          { label: 'The policy requires the manager role', re: 'RequireRole\\(\\s*"manager"\\s*\\)' },
          { label: 'POST /refunds uses .RequireAuthorization with that policy', re: 'AddPolicy\\(\\s*"(\\w+)"[\\s\\S]*MapPost\\(\\s*"/refunds"[^;]*\\.RequireAuthorization\\(\\s*"\\1"\\s*\\)' },
        ],
        hint: 'Name the policy once, then pass the same name to RequireAuthorization.',
        explain: 'Signed-in callers without the manager role get 403; the rule lives in one place if it ever changes.',
      },
      {
        kind: 'write',
        prompt: 'Let admins or staff in; the EU report also needs staff with region=eu.',
        starter:
          'builder.Services.AddAuthorization();\n\n[ApiController]\n[Route("api/[controller]")]\n[Authorize]\npublic class ReportsController : ControllerBase\n{\n    [HttpGet("eu")]\n    public string Eu() => "EU sales: 1,204";\n}',
        solution:
          'builder.Services.AddAuthorizationBuilder()\n    .AddPolicy("EuStaff", policy => policy\n        .RequireRole("staff")\n        .RequireClaim("region", "eu"));\n\n[ApiController]\n[Route("api/[controller]")]\n[Authorize(Roles = "admin,staff")]\npublic class ReportsController : ControllerBase\n{\n    [HttpGet("eu")]\n    [Authorize(Policy = "EuStaff")]\n    public string Eu() => "EU sales: 1,204";\n}',
        checks: [
          { label: '[Authorize(Roles = "admin,staff")] on the class', re: '\\[Authorize\\(\\s*Roles\\s*=\\s*"(admin,\\s*staff|staff,\\s*admin)"\\s*\\)\\]\\s*(\\[[^\\]]*\\]\\s*)*public\\s+class' },
          { label: 'A policy that requires the staff role', re: 'AddPolicy\\([\\s\\S]*RequireRole\\(\\s*"staff"\\s*\\)' },
          { label: 'The policy also needs RequireClaim("region", "eu")', re: 'RequireClaim\\(\\s*"region"\\s*,\\s*"eu"\\s*\\)' },
          { label: '[Authorize(Policy = "…")] on Eu with that policy name', re: 'AddPolicy\\(\\s*"(\\w+)"[\\s\\S]*\\[Authorize\\(\\s*Policy\\s*=\\s*"\\1"\\s*\\)\\]\\s*(\\[[^\\]]*\\]\\s*)*public\\s+\\w+\\s+Eu\\(' },
        ],
        hint: 'Roles with a comma means either role. A policy can chain several requirements.',
        explain: 'Class and action rules both apply: the caller must be admin or staff, and also pass EuStaff for the report.',
      },
    ],
  ],
  // Windows PowerShell versions of shared items (the phone keeps the bash ones).
  concepts: {
    3: {
      body: 'dotnet user-jwts create makes a signed JWT for local testing and adds settings that trust it to appsettings.Development.json. --name sets the user, --role adds a role and --claim "name=value" adds any claim (repeat them for more). Clients send the token in an Authorization: Bearer <token> header. In Windows PowerShell, type curl.exe: plain curl there is an alias for Invoke-WebRequest, which takes different options.',
      code: 'dotnet user-jwts create --name ana --role admin --claim "scope=orders"\ncurl.exe -i -H "Authorization: Bearer eyJhbGci..." https://localhost:7042/orders',
    },
  },
  overrides: {
    'boss.5': {
      kind: 'fix',
      prompt: 'Valid token, still 401. Fix the request.',
      code: 'curl.exe -i -H "Authorization: [[Basic]] eyJhbGci..." https://localhost:7042/orders',
      fix: 'Bearer',
      options: ['Bearer', 'Token', 'JWT'],
      hint: 'The scheme word has to match AddJwtBearer.',
      explain: 'Basic is for a username and password. The JWT handler only reads tokens sent as Bearer, so it saw no token at all.',
    },
  },
};

export default unit;
