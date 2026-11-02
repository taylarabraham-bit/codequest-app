import type { DesktopUnit } from '../../../engine/types';

// Desktop edition: write-the-code challenges for ASP.NET unit 1 (Minimal APIs).
// lessons[i] runs after lesson i + 1. See docs/CONTENT_GUIDE.md.
const unit: DesktopUnit = {
  lessons: [
    // L1 Your first endpoint
    [
      {
        kind: 'write',
        prompt: 'Write a whole Program.cs where GET /ping returns "pong".',
        starter: '',
        solution:
          'var builder = WebApplication.CreateBuilder(args);\nvar app = builder.Build();\n\napp.MapGet("/ping", () => "pong");\n\napp.Run();',
        checks: [
          { label: 'Create the builder with WebApplication.CreateBuilder(args)', re: 'WebApplication\\.CreateBuilder\\(\\s*args\\s*\\)' },
          { label: 'Build the app with .Build()', re: '\\w+\\.Build\\(\\s*\\)' },
          { label: 'MapGet("/ping", …) returns "pong"', re: 'MapGet\\(\\s*"/ping"\\s*,\\s*\\(\\s*\\)\\s*=>\\s*"pong"\\s*\\)' },
          { label: 'Start the app with Run() at the end', re: 'MapGet[\\s\\S]*\\w+\\.Run\\(\\s*\\)\\s*;\\s*$' },
        ],
        hint: 'Four steps: CreateBuilder, Build, MapGet, Run.',
        explain: 'The builder sets the app up, Build() creates it, MapGet links a path to a lambda, and Run() starts listening.',
        output: 'pong',
      },
      {
        kind: 'write',
        prompt: 'Give the bakery app a home page and an opening-hours page, then start it.',
        starter: 'var builder = WebApplication.CreateBuilder(args);\nvar app = builder.Build();\n\n// GET / and GET /hours go here\n',
        solution:
          'var builder = WebApplication.CreateBuilder(args);\nvar app = builder.Build();\n\n// GET / and GET /hours go here\napp.MapGet("/", () => "Welcome to Crumbs Bakery");\napp.MapGet("/hours", () => "Open 7am to 3pm");\n\napp.Run();',
        checks: [
          { label: 'GET / returns a welcome text', re: 'MapGet\\(\\s*"/"\\s*,\\s*\\(\\s*\\)\\s*=>\\s*"[^"]+"' },
          { label: 'GET /hours returns the opening hours', re: 'MapGet\\(\\s*"/hours"\\s*,\\s*\\(\\s*\\)\\s*=>\\s*"[^"]+"' },
          { label: 'app.Run() after the endpoints', re: 'MapGet[\\s\\S]*app\\.Run\\(\\s*\\)' },
        ],
        hint: 'One MapGet per path, each with a lambda that returns a string. Run() comes last.',
        explain: 'Each MapGet adds one route. app.Run() blocks and serves requests, so endpoints must be mapped before it.',
        output: 'Open 7am to 3pm',
      },
    ],
    // L2 HTTP verbs
    [
      {
        kind: 'write',
        prompt: 'Give /songs a GET, a POST and a DELETE handler.',
        starter: 'var builder = WebApplication.CreateBuilder(args);\nvar app = builder.Build();\n\n\napp.Run();',
        solution:
          'var builder = WebApplication.CreateBuilder(args);\nvar app = builder.Build();\n\napp.MapGet("/songs", () => "All songs");\napp.MapPost("/songs", () => "Song added");\napp.MapDelete("/songs", () => "Playlist cleared");\n\napp.Run();',
        checks: [
          { label: 'GET /songs with MapGet', re: 'MapGet\\(\\s*"/songs"\\s*,' },
          { label: 'POST /songs with MapPost', re: 'MapPost\\(\\s*"/songs"\\s*,' },
          { label: 'DELETE /songs with MapDelete', re: 'MapDelete\\(\\s*"/songs"\\s*,' },
          { label: 'Endpoints mapped before app.Run()', re: 'Map(Get|Post|Delete)[\\s\\S]*app\\.Run\\(\\s*\\)\\s*;\\s*$' },
        ],
        hint: 'Same path three times, one Map method per verb.',
        explain: 'One path can have a handler per verb. GET reads, POST creates and DELETE removes.',
        output: 'All songs',
      },
      {
        kind: 'write',
        prompt: 'Fix the thermostat: PUT changes it, and DELETE resets it to 18.',
        starter:
          'var temp = 20;\n\napp.MapGet("/thermostat", () => $"Set to {temp}");\napp.MapGet("/thermostat", () =>\n{\n    temp = 22;\n    return "Updated";\n});\n',
        solution:
          'var temp = 20;\n\napp.MapGet("/thermostat", () => $"Set to {temp}");\napp.MapPut("/thermostat", () =>\n{\n    temp = 22;\n    return "Updated";\n});\napp.MapDelete("/thermostat", () =>\n{\n    temp = 18;\n    return "Reset";\n});',
        checks: [
          { label: 'Keep exactly one MapGet', re: '^(?![\\s\\S]*MapGet[\\s\\S]*MapGet)[\\s\\S]*MapGet\\(' },
          { label: 'The update answers PUT with MapPut', re: 'MapPut\\(\\s*"/thermostat"\\s*,' },
          { label: 'MapDelete on /thermostat', re: 'MapDelete\\(\\s*"/thermostat"\\s*,' },
          { label: 'DELETE sets the temperature to 18', re: 'MapDelete\\([\\s\\S]*=\\s*18\\s*;' },
        ],
        hint: 'Two MapGet calls on one path clash. Which verb replaces a value?',
        explain: 'PUT replaces and DELETE removes or resets. Two handlers for the same verb and path make the request ambiguous.',
        output: 'Reset',
      },
    ],
    // L3 Route parameters
    [
      {
        kind: 'write',
        prompt: 'Map GET /recipes/{id:int} so /recipes/7 returns "Recipe #7".',
        starter: '',
        solution: 'app.MapGet("/recipes/{id:int}", (int id) => $"Recipe #{id}");',
        checks: [
          { label: 'Route /recipes/{…:int} with an int constraint', re: 'MapGet\\(\\s*"/recipes/\\{\\w+:int\\}"' },
          { label: 'An int lambda parameter with the same name', re: '"/recipes/\\{(\\w+):int\\}"\\s*,\\s*\\(\\s*int\\s+\\1\\s*\\)\\s*=>' },
          { label: 'Return "Recipe #" plus the id', re: '=>\\s*(\\$"Recipe #\\{\\w+\\}"|"Recipe #"\\s*\\+\\s*\\w+)' },
        ],
        hint: 'The name in {id:int} must match the lambda parameter name.',
        explain: 'The placeholder captures that URL segment into the parameter, and :int makes /recipes/abc a 404.',
        output: 'Recipe #7',
      },
      {
        kind: 'write',
        prompt: 'Add an optional page to the leaderboard route, defaulting to 1.',
        starter: 'app.MapGet("/scores/{game}", (string game) => $"{game} scores");',
        solution: 'app.MapGet("/scores/{game}/{page:int?}", (string game, int? page) =>\n    $"{game} page {page ?? 1}");',
        checks: [
          { label: 'Keep the {game} segment', re: '"/scores/\\{game\\}/' },
          { label: 'An optional {page?} segment', re: '\\{(\\w+)(:int)?\\?\\}"' },
          { label: 'A nullable int? parameter for it', re: '\\{(\\w+)(:int)?\\?\\}"[\\s\\S]*int\\?\\s+\\1\\b' },
          { label: 'Fall back to page 1 with ??', re: '\\?\\?\\s*1\\b' },
        ],
        hint: 'A ? after the name makes a segment optional; the parameter must be int? to hold “missing”.',
        explain: 'An optional segment binds null when it’s left out, and ?? 1 turns that into the first page.',
      },
    ],
    // L4 Query & body
    [
      {
        kind: 'write',
        prompt: 'GET /hotels?city=Oslo&nights=3 should return "3 nights in Oslo".',
        starter: '',
        solution: 'app.MapGet("/hotels", (string city, int nights) => $"{nights} nights in {city}");',
        checks: [
          { label: 'MapGet on /hotels with no route placeholders', re: 'MapGet\\(\\s*"/hotels"\\s*,' },
          { label: 'Read city from the query string', re: 'string\\s+city\\b|Name\\s*=\\s*"city"' },
          { label: 'Read nights as an int', re: 'int\\s+nights\\b|Name\\s*=\\s*"nights"\\s*\\)\\]\\s*int\\b' },
          { label: 'Return the nights and the city', re: '\\{\\s*nights\\s*\\}[^"]*\\{\\s*city\\s*\\}|nights\\s*\\+[\\s\\S]*city' },
        ],
        hint: 'Parameters that aren’t in the route come from the query string, by name.',
        explain: 'city and nights aren’t route segments, so ASP.NET reads them from ?city=…&nights=…, converting nights to int.',
        output: '3 nights in Oslo',
      },
      {
        kind: 'write',
        prompt: 'Add POST /bookings that reads a Booking body and an X-Api-Key header.',
        starter: 'using Microsoft.AspNetCore.Mvc;\n\n// POST /bookings goes here\n\nrecord Booking(string Guest, int Nights);',
        solution:
          'using Microsoft.AspNetCore.Mvc;\n\n// POST /bookings goes here\napp.MapPost("/bookings", (Booking booking, [FromHeader(Name = "X-Api-Key")] string apiKey) =>\n    $"Booked {booking.Nights} nights for {booking.Guest}");\n\nrecord Booking(string Guest, int Nights);',
        checks: [
          { label: 'MapPost on /bookings', re: 'MapPost\\(\\s*"/bookings"\\s*,' },
          { label: 'A Booking parameter read from the JSON body', re: '\\(\\s*(\\[FromBody\\]\\s*)?Booking\\s+\\w+|,\\s*(\\[FromBody\\]\\s*)?Booking\\s+\\w+' },
          { label: 'A string from [FromHeader(Name = "X-Api-Key")]', re: '\\[FromHeader\\(\\s*Name\\s*=\\s*"X-Api-Key"\\s*\\)\\]\\s*string\\??\\s+\\w+' },
          { label: 'Use the booking’s Guest or Nights in the reply', re: '\\w+\\.(Guest|Nights)\\b' },
        ],
        hint: 'A record parameter comes from the body; a header needs [FromHeader(Name = "…")].',
        explain: 'Complex types on POST bind from the JSON body. Headers are never bound by default, so you name them with [FromHeader].',
      },
    ],
    // L5 Results & status codes
    [
      {
        kind: 'write',
        prompt: 'Return the product with 200 OK, or 404 when the id is unknown.',
        starter: 'var stock = new Dictionary<int, Product> { [1] = new("Lamp", 25m) };\n\n\nrecord Product(string Name, decimal Price);',
        solution:
          'var stock = new Dictionary<int, Product> { [1] = new("Lamp", 25m) };\n\napp.MapGet("/stock/{id:int}", (int id) =>\n    stock.TryGetValue(id, out var product) ? Results.Ok(product) : Results.NotFound());\n\nrecord Product(string Name, decimal Price);',
        checks: [
          { label: 'A GET route with an {id:int}', re: 'MapGet\\(\\s*"/\\w+/\\{\\w+:int\\}"' },
          { label: 'Results.Ok(…) when found', re: 'Results\\.Ok\\(\\s*\\w+' },
          { label: 'Results.NotFound() when missing', has: 'Results.NotFound()' },
        ],
        hint: 'TryGetValue tells you whether the key exists; pick a result with ? :.',
        explain: 'Results.Ok sends the object as JSON with 200, and Results.NotFound sends an empty 404.',
        output: '{"name":"Lamp","price":25}',
      },
      {
        kind: 'write',
        prompt: 'Make POST /notes answer 201 Created, or 400 when the text is blank.',
        starter:
          'var notes = new List<Note>();\n\napp.MapPost("/notes", (Note note) =>\n{\n    notes.Add(note);\n    return "Saved";\n});\n\nrecord Note(int Id, string Text);',
        solution:
          'var notes = new List<Note>();\n\napp.MapPost("/notes", (Note note) =>\n{\n    if (string.IsNullOrWhiteSpace(note.Text))\n        return Results.BadRequest();\n    notes.Add(note);\n    return Results.Created($"/notes/{note.Id}", note);\n});\n\nrecord Note(int Id, string Text);',
        checks: [
          { label: 'Check for blank Text', re: 'IsNullOrWhiteSpace\\(\\s*\\w+\\.Text\\s*\\)|IsNullOrEmpty\\(\\s*\\w+\\.Text\\s*\\)|\\.Text\\s*==\\s*""' },
          { label: 'Return Results.BadRequest() for blank notes', re: 'Results\\.BadRequest\\(' },
          { label: 'Results.Created(url, note) with the new note’s URL', re: 'Results\\.Created\\(\\s*\\$?"[^"]+"\\s*,\\s*\\w+\\s*\\)' },
          { label: 'No more plain "Saved" string', not: 'return "Saved"' },
        ],
        hint: 'Every return must be an IResult now: BadRequest() first, Created(url, note) at the end.',
        explain: 'Created sends 201 with a Location header pointing at the new note. Checking first keeps bad data out of the list.',
      },
    ],
  ],
};

export default unit;
