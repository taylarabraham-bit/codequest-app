import type { DesktopUnit } from '../../../engine/types';

// Desktop edition: write-the-code challenges for ASP.NET unit 7 (Validation & errors).
// lessons[i] runs after lesson i + 1. See docs/CONTENT_GUIDE.md.
const ATTRS = '[^\\]]*\\]\\s*(\\[[^\\]]*\\]\\s*)*public\\s+';

const unit: DesktopUnit = {
  lessons: [
    // L1 Validation attributes
    [
      {
        kind: 'write',
        prompt: 'Add rules: username 3–30 characters, email required and valid, age 13–120.',
        starter:
          'public class Signup\n{\n    public string Username { get; set; } = "";\n    public string Email { get; set; } = "";\n    public int Age { get; set; }\n}',
        solution:
          'using System.ComponentModel.DataAnnotations;\n\npublic class Signup\n{\n    [Required]\n    [StringLength(30, MinimumLength = 3)]\n    public string Username { get; set; } = "";\n\n    [Required]\n    [EmailAddress]\n    public string Email { get; set; } = "";\n\n    [Range(13, 120)]\n    public int Age { get; set; }\n}',
        checks: [
          { label: 'using System.ComponentModel.DataAnnotations;', has: 'using System.ComponentModel.DataAnnotations;' },
          { label: '[StringLength(30, MinimumLength = 3)] on Username', re: '\\bStringLength\\(\\s*30\\s*,\\s*MinimumLength\\s*=\\s*3\\s*(,[^\\]]*)?\\)' + ATTRS + 'string\\??\\s+Username\\b' },
          { label: '[Required] on Email', re: '\\bRequired\\b' + ATTRS + 'string\\??\\s+Email\\b' },
          { label: '[EmailAddress] on Email', re: '\\bEmailAddress\\b' + ATTRS + 'string\\??\\s+Email\\b' },
          { label: '[Range(13, 120)] on Age', re: '\\bRange\\(\\s*13\\s*,\\s*120\\s*(,[^\\]]*)?\\)' + ATTRS + 'int\\??\\s+Age\\b' },
        ],
        hint: 'Attributes go in square brackets on the line above each property.',
        explain: 'The rules live on the model itself, so every endpoint or page that accepts a Signup checks them the same way.',
      },
      {
        kind: 'write',
        prompt: 'Limit guests to 1–8, and give Name and Guests friendly error messages.',
        starter:
          'using System.ComponentModel.DataAnnotations;\n\npublic class TableBooking\n{\n    [Required]\n    public string Name { get; set; } = "";\n\n    [Range(1, 100)]\n    public int Guests { get; set; }\n\n    [Phone]\n    public string? Phone { get; set; }\n}',
        solution:
          'using System.ComponentModel.DataAnnotations;\n\npublic class TableBooking\n{\n    [Required(ErrorMessage = "Who is the booking for?")]\n    public string Name { get; set; } = "";\n\n    [Range(1, 8, ErrorMessage = "We seat 1 to 8 guests per table.")]\n    public int Guests { get; set; }\n\n    [Phone]\n    public string? Phone { get; set; }\n}',
        checks: [
          { label: '[Required(ErrorMessage = "…")] on Name', re: 'Required\\(\\s*ErrorMessage\\s*=\\s*"[^"]+"\\s*\\)' + ATTRS + 'string\\??\\s+Name\\b' },
          { label: '[Range(1, 8, ErrorMessage = "…")] on Guests', re: 'Range\\(\\s*1\\s*,\\s*8\\s*,\\s*ErrorMessage\\s*=\\s*"[^"]+"\\s*\\)' + ATTRS + 'int\\s+Guests\\b' },
          { label: 'No 1–100 range left', not: 'Range(1, 100)' },
          { label: 'Keep [Phone] on Phone', has: '[Phone]' },
        ],
        hint: 'ErrorMessage = "…" goes inside the attribute’s parentheses, after any numbers.',
        explain: 'Default messages name the property and the rule; your own text tells the user what to do instead.',
      },
    ],
    // L2 Automatic validation
    [
      {
        kind: 'write',
        prompt: 'Reject reviews with blank text or stars outside 1–5 before the handler runs.',
        starter:
          'using System.ComponentModel.DataAnnotations;\n\nvar builder = WebApplication.CreateBuilder(args);\nvar app = builder.Build();\n\napp.MapPost("/reviews", (Review review) => Results.Ok(review));\n\napp.Run();\n\npublic class Review\n{\n    public string Text { get; set; } = "";\n    public int Stars { get; set; }\n}',
        solution:
          'using System.ComponentModel.DataAnnotations;\n\nvar builder = WebApplication.CreateBuilder(args);\nbuilder.Services.AddValidation();\nvar app = builder.Build();\n\napp.MapPost("/reviews", (Review review) => Results.Ok(review));\n\napp.Run();\n\npublic class Review\n{\n    [Required]\n    public string Text { get; set; } = "";\n\n    [Range(1, 5)]\n    public int Stars { get; set; }\n}',
        checks: [
          { label: 'builder.Services.AddValidation() before Build()', re: 'builder\\.Services\\.AddValidation\\(\\)[\\s\\S]*\\.Build\\(\\)' },
          { label: '[Required] on Text', re: '\\bRequired\\b' + ATTRS + 'string\\??\\s+Text\\b' },
          { label: '[Range(1, 5)] on Stars', re: '\\bRange\\(\\s*1\\s*,\\s*5\\s*(,[^\\]]*)?\\)' + ATTRS + 'int\\s+Stars\\b' },
          { label: 'Keep the POST /reviews handler', re: 'MapPost\\(\\s*"/reviews"' },
        ],
        hint: 'The attributes describe the rules; one service registration makes minimal APIs check them.',
        explain: 'With AddValidation, a bad review gets a 400 listing the errors and the handler never runs.',
      },
      {
        kind: 'write',
        prompt: 'Limit pageSize to 1–50, and skip validation on the bulk import endpoint.',
        starter:
          'builder.Services.AddValidation();\nvar app = builder.Build();\n\napp.MapGet("/products", (int pageSize) => $"Showing {pageSize} products");\napp.MapPost("/import", (Product[] rows) => $"Imported {rows.Length}");',
        solution:
          'builder.Services.AddValidation();\nvar app = builder.Build();\n\napp.MapGet("/products", ([Range(1, 50)] int pageSize) => $"Showing {pageSize} products");\napp.MapPost("/import", (Product[] rows) => $"Imported {rows.Length}")\n    .DisableValidation();',
        checks: [
          { label: '[Range(1, 50)] on the pageSize parameter', re: '\\[Range\\(\\s*1\\s*,\\s*50\\s*(,[^\\]]*)?\\)\\]\\s*int\\s+pageSize\\b' },
          { label: '.DisableValidation() on /import', re: '"/import"[^;]*\\.DisableValidation\\(\\)' },
          { label: 'Keep validation on /products', re: '^(?![\\s\\S]*"/products"[^;]*DisableValidation)' },
        ],
        hint: 'Attributes work on handler parameters too. DisableValidation chains onto one endpoint.',
        explain: 'AddValidation also checks query parameters, so ?pageSize=500 gets a 400. The import opts out to skip checking every row.',
      },
    ],
    // L3 ModelState in pages
    [
      {
        kind: 'write',
        prompt: 'Show the email’s errors under its input, and a summary of model-level errors.',
        starter:
          '<form method="post">\n    <label asp-for="Signup.Email"></label>\n    <input asp-for="Signup.Email" />\n    <button>Join</button>\n</form>',
        solution:
          '<form method="post">\n    <div asp-validation-summary="ModelOnly"></div>\n    <label asp-for="Signup.Email"></label>\n    <input asp-for="Signup.Email" />\n    <span asp-validation-for="Signup.Email"></span>\n    <button>Join</button>\n</form>',
        checks: [
          { label: 'A <span asp-validation-for="Signup.Email">', re: '<span\\s[^>]*asp-validation-for="Signup\\.Email"' },
          { label: 'It comes after the input', re: '<input[^>]*asp-for="Signup\\.Email"[^>]*>[\\s\\S]*asp-validation-for="Signup\\.Email"' },
          { label: 'A summary with asp-validation-summary="ModelOnly"', re: '<div\\s[^>]*asp-validation-summary="ModelOnly"' },
          { label: 'The summary is inside the form', re: '<form[\\s\\S]*asp-validation-summary[\\s\\S]*</form>' },
        ],
        hint: 'asp-validation-for goes on a span; asp-validation-summary goes on a div.',
        explain: 'The span shows that field’s messages from ModelState, and ModelOnly lists errors not tied to any field.',
      },
      {
        kind: 'write',
        prompt: 'Reject a taken email with AddModelError, and redisplay the form when invalid.',
        starter:
          'public IActionResult OnPost()\n{\n    TakenEmails.Add(Signup.Email);\n    return RedirectToPage("./Thanks");\n}',
        solution:
          'public IActionResult OnPost()\n{\n    if (TakenEmails.Contains(Signup.Email))\n    {\n        ModelState.AddModelError("Signup.Email", "That email is already signed up.");\n    }\n\n    if (!ModelState.IsValid)\n    {\n        return Page();\n    }\n\n    TakenEmails.Add(Signup.Email);\n    return RedirectToPage("./Thanks");\n}',
        checks: [
          { label: 'Check if the email is already taken', re: 'TakenEmails\\.(Contains|Any)\\(' },
          { label: 'ModelState.AddModelError("Signup.Email", "…")', re: 'ModelState\\.AddModelError\\(\\s*"Signup\\.Email"\\s*,\\s*"[^"]+"\\s*\\)' },
          { label: 'if (!ModelState.IsValid) return Page();', re: 'if\\s*\\(\\s*!\\s*ModelState\\.IsValid\\s*\\)\\s*\\{?\\s*return\\s+Page\\(\\)' },
          { label: 'Redisplay before saving', re: 'return\\s+Page\\(\\)[\\s\\S]*TakenEmails\\.Add\\(' },
        ],
        hint: 'Add your own error first, then one IsValid check catches it along with the attribute errors.',
        explain: 'Razor Pages never reject input for you. AddModelError joins ModelState, so IsValid turns false and the span shows the message.',
      },
    ],
    // L4 Problem details
    [
      {
        kind: 'write',
        prompt: 'Return a 409 "Sold out" problem for the finale; any other show gets a ticket.',
        starter: 'var app = builder.Build();\n',
        solution:
          'builder.Services.AddProblemDetails();\nvar app = builder.Build();\n\napp.MapPost("/tickets/{show}", (string show) =>\n    show == "finale"\n        ? Results.Problem(title: "Sold out", statusCode: 409)\n        : Results.Ok($"Ticket for {show}"));',
        checks: [
          { label: 'builder.Services.AddProblemDetails() before Build()', re: 'builder\\.Services\\.AddProblemDetails\\(\\)[\\s\\S]*\\.Build\\(\\)' },
          { label: 'Results.Problem with title: "Sold out"', re: 'Results\\.Problem\\([^;]*title:\\s*"Sold out"' },
          { label: 'statusCode: 409', re: 'Results\\.Problem\\([^;]*statusCode:\\s*(409|StatusCodes\\.Status409Conflict)' },
          { label: 'A ticket for other shows', re: 'Results\\.Ok\\(' },
        ],
        hint: 'Results.Problem takes named arguments; without statusCode it sends 500.',
        explain: 'A problem response is application/problem+json with type, title and status, so clients can read any error the same way.',
      },
      {
        kind: 'write',
        prompt: 'Return a validation problem listing each signup error.',
        starter:
          'app.MapPost("/accounts", (NewAccount account) =>\n{\n    if (account.Password.Length < 8)\n        return Results.BadRequest("Password too short");\n    return Results.Created($"/accounts/{account.Username}", account);\n});\n\nrecord NewAccount(string Username, string Password);',
        solution:
          'app.MapPost("/accounts", (NewAccount account) =>\n{\n    var errors = new Dictionary<string, string[]>();\n    if (account.Password.Length < 8)\n        errors["Password"] = ["Use at least 8 characters."];\n    if (account.Username.Length < 3)\n        errors["Username"] = ["Use at least 3 characters."];\n    if (errors.Count > 0)\n        return Results.ValidationProblem(errors);\n    return Results.Created($"/accounts/{account.Username}", account);\n});\n\nrecord NewAccount(string Username, string Password);',
        checks: [
          { label: 'A Dictionary<string, string[]> of errors', re: 'Dictionary<\\s*string\\s*,\\s*string\\[\\]\\s*>' },
          { label: 'An error under "Password"', re: '\\[\\s*"Password"\\s*\\]\\s*=|Add\\(\\s*"Password"|\\{\\s*"Password"\\s*,' },
          { label: 'Return Results.ValidationProblem(errors)', re: 'Results\\.ValidationProblem\\(\\s*\\w+\\s*\\)' },
          { label: 'No plain BadRequest', not: 'Results.BadRequest(' },
        ],
        hint: 'Collect every problem first, keyed by field name, then return them all at once.',
        explain: 'ValidationProblem sends a 400 problem with an errors object, so the client can show each message next to its field.',
      },
    ],
    // L5 Handling exceptions
    [
      {
        kind: 'write',
        prompt: 'Turn unhandled exceptions into problem 500s, and fill empty error responses.',
        starter: 'var app = builder.Build();\n\napp.MapGet("/crash", () => { throw new InvalidOperationException("Boom"); });',
        solution:
          'builder.Services.AddProblemDetails();\nvar app = builder.Build();\n\napp.UseExceptionHandler();\napp.UseStatusCodePages();\n\napp.MapGet("/crash", () => { throw new InvalidOperationException("Boom"); });',
        checks: [
          { label: 'AddProblemDetails() before Build()', re: 'AddProblemDetails\\(\\)[\\s\\S]*\\.Build\\(\\)' },
          { label: 'app.UseExceptionHandler()', re: 'app\\.UseExceptionHandler\\(\\s*\\)' },
          { label: 'app.UseStatusCodePages()', re: 'app\\.UseStatusCodePages\\(\\s*\\)' },
          { label: 'Exception handler before the endpoints', re: 'UseExceptionHandler\\(\\s*\\)[\\s\\S]*app\\.Map' },
        ],
        hint: 'UseExceptionHandler with no arguments needs the problem details service.',
        explain: 'The handler catches exceptions from everything after it and sends a problem 500 instead of an empty response.',
      },
      {
        kind: 'write',
        prompt: 'Write an IExceptionHandler that turns OutOfStockException into a 409.',
        starter: 'using Microsoft.AspNetCore.Diagnostics;\n\nclass OutOfStockException(string sku) : Exception($"Out of stock: {sku}");\n',
        solution:
          'using Microsoft.AspNetCore.Diagnostics;\n\nbuilder.Services.AddExceptionHandler<OutOfStockHandler>();\n\nclass OutOfStockException(string sku) : Exception($"Out of stock: {sku}");\n\nclass OutOfStockHandler : IExceptionHandler\n{\n    public async ValueTask<bool> TryHandleAsync(HttpContext context, Exception exception, CancellationToken cancellationToken)\n    {\n        if (exception is not OutOfStockException) return false;\n        context.Response.StatusCode = StatusCodes.Status409Conflict;\n        await context.Response.WriteAsJsonAsync(new { error = exception.Message }, cancellationToken);\n        return true;\n    }\n}',
        checks: [
          { label: 'A class that implements IExceptionHandler', re: 'class\\s+\\w+\\s*:\\s*IExceptionHandler\\b' },
          { label: 'ValueTask<bool> TryHandleAsync(HttpContext, Exception, CancellationToken)', re: 'ValueTask<bool>\\s+TryHandleAsync\\(\\s*HttpContext\\s+\\w+\\s*,\\s*Exception\\s+\\w+\\s*,\\s*CancellationToken\\s+\\w+\\s*\\)' },
          { label: 'return false for other exceptions', re: 'return\\s+false\\s*;' },
          { label: 'Set status 409', re: 'StatusCode\\s*=\\s*(409|StatusCodes\\.Status409Conflict)' },
          { label: 'return true once handled', re: 'return\\s+true\\s*;' },
          { label: 'Register it with AddExceptionHandler<…>()', re: 'AddExceptionHandler<\\s*\\w+\\s*>\\(\\s*\\)' },
        ],
        hint: 'Check the exception type first; only reply (and return true) when it’s yours.',
        explain: 'Returning false passes the exception on to the next handler, so everything else still becomes a problem 500.',
      },
    ],
  ],
};

export default unit;
