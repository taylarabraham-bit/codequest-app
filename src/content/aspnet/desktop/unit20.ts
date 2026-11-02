import type { DesktopUnit } from '../../../engine/types';

// Desktop edition: write-the-code challenges for ASP.NET unit 20 (Capstone: a complete API).
// lessons[i] runs after lesson i + 1. See docs/CONTENT_GUIDE.md.
const unit: DesktopUnit = {
  lessons: [
    // L1 Endpoints & route groups
    [
      {
        kind: 'write',
        prompt: 'Group the room endpoints under /rooms and write GetRoom with typed results.',
        starter: '// BookingsDb has DbSet<Room> Rooms\n',
        solution:
          '// BookingsDb has DbSet<Room> Rooms\nvar rooms = app.MapGroup("/rooms").WithTags("Rooms");\nrooms.MapGet("/", async (BookingsDb db) => TypedResults.Ok(await db.Rooms.ToListAsync()));\nrooms.MapGet("/{id:int}", GetRoom);\n\nstatic async Task<Results<Ok<Room>, NotFound>> GetRoom(int id, BookingsDb db) =>\n    await db.Rooms.FindAsync(id) is Room room ? TypedResults.Ok(room) : TypedResults.NotFound();',
        checks: [
          { label: 'A group: app.MapGroup("/rooms")', re: 'var\\s+\\w+\\s*=\\s*app\\.MapGroup\\(\\s*"/rooms"\\s*\\)' },
          { label: 'Tag the group with .WithTags', re: 'MapGroup\\(\\s*"/rooms"\\s*\\)\\s*\\.WithTags\\(\\s*"\\w+"\\s*\\)|\\w+\\.WithTags\\(\\s*"\\w+"\\s*\\)' },
          {
            label: 'Map GET /{id} on the group to your handler',
            re: 'var\\s+(\\w+)\\s*=\\s*app\\.MapGroup[\\s\\S]*\\b\\1\\.MapGet\\(\\s*"/\\{id(:int)?\\}"\\s*,\\s*\\w+\\s*\\)',
          },
          { label: 'The handler returns Results<Ok<Room>, NotFound>', re: 'Results<\\s*Ok<\\s*Room\\s*>\\s*,\\s*NotFound\\s*>' },
          { label: 'Return TypedResults.Ok and TypedResults.NotFound()', re: 'TypedResults\\.Ok\\(\\s*\\w+\\s*\\)[\\s\\S]*TypedResults\\.NotFound\\(\\)|TypedResults\\.NotFound\\(\\)[\\s\\S]*TypedResults\\.Ok\\(\\s*\\w+\\s*\\)' },
        ],
        hint: 'Map the handler by name: rooms.MapGet("/{id:int}", GetRoom).',
        explain: 'The group gives one prefix and one tag, and the typed return lists both outcomes for OpenAPI and for tests.',
      },
      {
        kind: 'write',
        prompt: 'Add POST / to create a booking and DELETE /{id} to cancel one.',
        starter:
          'var bookings = app.MapGroup("/bookings").WithTags("Bookings");\nbookings.MapGet("/{id:int}", GetBooking);\n\nstatic async Task<Results<Ok<Booking>, NotFound>> GetBooking(int id, BookingsDb db) =>\n    await db.Bookings.FindAsync(id) is Booking b ? TypedResults.Ok(b) : TypedResults.NotFound();',
        solution:
          'var bookings = app.MapGroup("/bookings").WithTags("Bookings");\nbookings.MapGet("/{id:int}", GetBooking);\nbookings.MapPost("/", CreateBooking);\nbookings.MapDelete("/{id:int}", CancelBooking);\n\nstatic async Task<Results<Ok<Booking>, NotFound>> GetBooking(int id, BookingsDb db) =>\n    await db.Bookings.FindAsync(id) is Booking b ? TypedResults.Ok(b) : TypedResults.NotFound();\n\nstatic async Task<Created<Booking>> CreateBooking(Booking booking, BookingsDb db)\n{\n    db.Bookings.Add(booking);\n    await db.SaveChangesAsync();\n    return TypedResults.Created($"/bookings/{booking.Id}", booking);\n}\n\nstatic async Task<Results<NoContent, NotFound>> CancelBooking(int id, BookingsDb db) =>\n    await db.Bookings.Where(b => b.Id == id).ExecuteDeleteAsync() == 1\n        ? TypedResults.NoContent()\n        : TypedResults.NotFound();',
        checks: [
          { label: 'Map POST on the group to a handler', re: 'bookings\\.MapPost\\(\\s*"/?"\\s*,\\s*\\w+\\s*\\)' },
          { label: 'Map DELETE /{id} on the group to a handler', re: 'bookings\\.MapDelete\\(\\s*"/\\{id(:int)?\\}"\\s*,\\s*\\w+\\s*\\)' },
          { label: 'Create returns TypedResults.Created with the new URL', re: 'TypedResults\\.Created\\(\\s*\\$"/bookings/\\{' },
          { label: 'Cancel returns Results<NoContent, NotFound>', re: 'Results<\\s*NoContent\\s*,\\s*NotFound\\s*>|Results<\\s*NotFound\\s*,\\s*NoContent\\s*>' },
          { label: 'Return TypedResults.NoContent() on success', has: 'TypedResults.NoContent()' },
        ],
        hint: 'Write two more static handlers below GetBooking and map them by name.',
        explain: 'Created sets the Location header to the new booking; DELETE answers 204 or 404, and both show up in the signature.',
      },
    ],
    // L2 The data model
    [
      {
        kind: 'write',
        prompt: 'Model desks with many reservations, plus a CoworkDb context exposing both.',
        starter: '',
        solution:
          'public class Desk\n{\n    public int Id { get; set; }\n    public string Name { get; set; } = "";\n    public List<Reservation> Reservations { get; set; } = [];\n}\n\npublic class Reservation\n{\n    public int Id { get; set; }\n    public int DeskId { get; set; }\n    public Desk? Desk { get; set; }\n    public DateTime Day { get; set; }\n}\n\npublic class CoworkDb(DbContextOptions<CoworkDb> options) : DbContext(options)\n{\n    public DbSet<Desk> Desks => Set<Desk>();\n    public DbSet<Reservation> Reservations => Set<Reservation>();\n}',
        checks: [
          { label: 'Desk has a list of Reservations', re: 'class\\s+Desk\\b[\\s\\S]*?(List|ICollection|IList)<\\s*Reservation\\s*>\\s+\\w+' },
          { label: 'Reservation has an int DeskId foreign key', re: 'class\\s+Reservation\\b[\\s\\S]*?int\\s+DeskId\\s*\\{\\s*get;\\s*set;\\s*\\}' },
          {
            label: 'CoworkDb derives from DbContext',
            re: 'class\\s+CoworkDb\\s*(\\(\\s*DbContextOptions<\\s*CoworkDb\\s*>\\s+\\w+\\s*\\))?\\s*:\\s*DbContext\\b',
          },
          { label: 'A DbSet<Desk>', re: 'DbSet<\\s*Desk\\s*>\\s+\\w+' },
          { label: 'A DbSet<Reservation>', re: 'DbSet<\\s*Reservation\\s*>\\s+\\w+' },
        ],
        hint: 'EF Core spots the relationship from the list on one side and DeskId on the other.',
        explain: 'Each DbSet becomes a table, and DeskId becomes a foreign key column linking every reservation to its desk.',
      },
      {
        kind: 'write',
        prompt: 'List a room’s bookings by start time, and add bookings to existing rooms only.',
        starter:
          '// GET: a room’s bookings, earliest first\napp.MapGet("/rooms/{id:int}/bookings", async (int id, BookingsDb db) =>\n    Results.Ok());\n\n// POST: add a booking to a room, 404 if the room doesn’t exist\n',
        solution:
          '// GET: a room’s bookings, earliest first\napp.MapGet("/rooms/{id:int}/bookings", async (int id, BookingsDb db) =>\n    Results.Ok(await db.Bookings.Where(b => b.RoomId == id).OrderBy(b => b.Start).ToListAsync()));\n\n// POST: add a booking to a room, 404 if the room doesn’t exist\napp.MapPost("/rooms/{id:int}/bookings", async (int id, Booking booking, BookingsDb db) =>\n{\n    if (await db.Rooms.FindAsync(id) is null)\n        return Results.NotFound();\n    booking.RoomId = id;\n    db.Bookings.Add(booking);\n    await db.SaveChangesAsync();\n    return Results.Created($"/bookings/{booking.Id}", booking);\n});',
        checks: [
          { label: 'Filter with Where(b => b.RoomId == id)', re: 'Where\\(\\s*(\\w+)\\s*=>\\s*\\1\\.RoomId\\s*==\\s*\\w+' },
          { label: 'Sort with OrderBy on Start', re: '\\.OrderBy\\(\\s*(\\w+)\\s*=>\\s*\\1\\.Start\\s*\\)' },
          { label: 'Run it with ToListAsync()', has: '.ToListAsync()' },
          { label: 'Check the room exists first', re: 'Rooms\\.(FindAsync|AnyAsync|FirstOrDefaultAsync|SingleOrDefaultAsync)\\(' },
          { label: 'Add the booking to the context', re: '\\.(Bookings\\.)?Add(Async)?\\(\\s*\\w+\\s*\\)' },
          { label: 'await SaveChangesAsync()', re: 'await\\s+\\w+\\.SaveChangesAsync\\(' },
        ],
        hint: 'Rooms.FindAsync(id) returns null when the room doesn’t exist.',
        explain: 'The LINQ query becomes one SQL SELECT with WHERE and ORDER BY, and SaveChangesAsync writes the new row with its RoomId.',
      },
    ],
    // L3 Validation & problem details
    [
      {
        kind: 'write',
        prompt: 'Validate tour sign-ups: name up to 60 chars, a valid email, 1–6 seats.',
        starter: '',
        solution:
          'builder.Services.AddValidation();\nbuilder.Services.AddProblemDetails();\n\npublic record NewSignup(\n    [Required, StringLength(60)] string Name,\n    [Required, EmailAddress] string Email,\n    [Range(1, 6)] int Seats);',
        checks: [
          { label: 'builder.Services.AddValidation()', has: 'builder.Services.AddValidation()' },
          { label: 'builder.Services.AddProblemDetails()', has: 'builder.Services.AddProblemDetails()' },
          { label: 'Mark Name and Email [Required]', re: '(\\bRequired\\b[\\s\\S]*){2}' },
          { label: 'Limit the name to 60 characters', re: '(StringLength|MaxLength)\\(\\s*60\\s*\\)' },
          { label: 'Check the email with [EmailAddress]', re: '\\bEmailAddress\\b' },
          { label: 'Seats with [Range(1, 6)]', re: 'Range\\(\\s*1\\s*,\\s*6\\s*\\)' },
        ],
        hint: 'Attributes go before each record parameter, e.g. [Range(1, 6)] int Seats.',
        explain: 'Bad input never reaches the handler: it gets a 400 with an errors object, in the same problem+json shape as every other error.',
      },
      {
        kind: 'write',
        prompt: 'Refuse overlapping bookings for the same room with a 409 problem.',
        starter:
          'static async Task<Results<Created<Booking>, ProblemHttpResult>> CreateBooking(NewBooking req, BookingsDb db)\n{\n    var booking = new Booking { RoomId = req.RoomId, Guest = req.Guest, Start = req.Start, End = req.End };\n    db.Bookings.Add(booking);\n    await db.SaveChangesAsync();\n    return TypedResults.Created($"/bookings/{booking.Id}", booking);\n}',
        solution:
          'static async Task<Results<Created<Booking>, ProblemHttpResult>> CreateBooking(NewBooking req, BookingsDb db)\n{\n    var taken = await db.Bookings.AnyAsync(b =>\n        b.RoomId == req.RoomId && b.Start < req.End && req.Start < b.End);\n    if (taken)\n        return TypedResults.Problem("Room already booked", statusCode: StatusCodes.Status409Conflict);\n    var booking = new Booking { RoomId = req.RoomId, Guest = req.Guest, Start = req.Start, End = req.End };\n    db.Bookings.Add(booking);\n    await db.SaveChangesAsync();\n    return TypedResults.Created($"/bookings/{booking.Id}", booking);\n}',
        checks: [
          { label: 'Query existing bookings with AnyAsync', re: 'Bookings\\.AnyAsync\\(' },
          { label: 'Same room: compare RoomId', re: '\\.RoomId\\s*==\\s*\\w+\\.RoomId' },
          { label: 'Overlap: compare both ends of the time ranges', re: '(\\.(Start|End)\\s*[<>]=?\\s*\\w+\\.(Start|End)[\\s\\S]*){2}' },
          { label: 'TypedResults.Problem with status 409', re: 'TypedResults\\.Problem\\([^;]*(409|Status409Conflict)' },
          { label: 'Check before adding the booking', re: 'Problem\\([\\s\\S]*\\.(Bookings\\.)?Add(Async)?\\(' },
        ],
        hint: 'Two ranges overlap when each one starts before the other ends.',
        explain: 'Attributes can’t see the database, so this rule lives in the handler; 409 Conflict says the request was valid but clashes with existing data.',
      },
    ],
    // L4 Auth & policies
    [
      {
        kind: 'write',
        prompt: 'Lock /shifts behind JWT auth; only managers may delete a shift.',
        starter: '',
        solution:
          'builder.Services.AddAuthentication().AddJwtBearer();\nbuilder.Services.AddAuthorizationBuilder()\n    .AddPolicy("manager", p => p.RequireRole("manager"));\nvar app = builder.Build();\nvar shifts = app.MapGroup("/shifts").RequireAuthorization();\nshifts.MapGet("/", () => "Mon, Tue");\nshifts.MapDelete("/{id:int}", (int id) => TypedResults.NoContent())\n    .RequireAuthorization("manager");',
        checks: [
          { label: 'AddAuthentication().AddJwtBearer()', has: 'AddAuthentication().AddJwtBearer()' },
          {
            label: 'A named policy that requires a role',
            re: 'AddAuthorizationBuilder\\(\\)\\s*\\.AddPolicy\\(\\s*"[\\w-]+"\\s*,\\s*\\w+\\s*=>\\s*\\w+\\.RequireRole\\(\\s*"[\\w-]+"\\s*\\)',
          },
          { label: 'RequireAuthorization() on the /shifts group', re: 'MapGroup\\(\\s*"/shifts"\\s*\\)\\s*\\.RequireAuthorization\\(\\s*\\)' },
          {
            label: 'The DELETE requires your policy by name',
            re: 'AddPolicy\\(\\s*"([\\w-]+)"[\\s\\S]*MapDelete\\([^;]*\\.RequireAuthorization\\(\\s*"\\1"\\s*\\)',
          },
        ],
        hint: 'RequireAuthorization() with no argument means “any signed-in user”; with a name it applies a policy.',
        explain: 'Every shift endpoint now needs a valid token, and deleting also needs the manager role. Anonymous calls get 401, others 403.',
      },
      {
        kind: 'write',
        prompt: 'Let guests cancel only their own bookings; staff can cancel any.',
        starter:
          'static async Task<Results<NoContent, NotFound>> CancelBooking(int id, BookingsDb db)\n{\n    var booking = await db.Bookings.FindAsync(id);\n    if (booking is null) return TypedResults.NotFound();\n    db.Bookings.Remove(booking);\n    await db.SaveChangesAsync();\n    return TypedResults.NoContent();\n}',
        solution:
          'static async Task<Results<NoContent, NotFound, ForbidHttpResult>> CancelBooking(\n    int id, ClaimsPrincipal user, BookingsDb db)\n{\n    var booking = await db.Bookings.FindAsync(id);\n    if (booking is null) return TypedResults.NotFound();\n    if (booking.Guest != user.Identity?.Name && !user.IsInRole("staff"))\n        return TypedResults.Forbid();\n    db.Bookings.Remove(booking);\n    await db.SaveChangesAsync();\n    return TypedResults.NoContent();\n}',
        checks: [
          { label: 'Take a ClaimsPrincipal parameter', re: 'ClaimsPrincipal\\s+\\w+' },
          { label: 'Compare the booking’s guest with the caller’s name', re: '\\.Identity\\??\\.Name|FindFirstValue\\(' },
          { label: 'Let staff through with IsInRole("staff")', re: 'IsInRole\\(\\s*"staff"\\s*\\)' },
          { label: 'Return TypedResults.Forbid() otherwise', has: 'TypedResults.Forbid()' },
          { label: 'Add ForbidHttpResult to the return type', re: 'Results<[^>]*\\bForbidHttpResult\\b[^>]*>' },
        ],
        hint: 'Minimal APIs bind ClaimsPrincipal from the request’s user automatically.',
        explain: 'Authorization on the group proves who you are; this check decides what you may touch. Forbid answers 403.',
      },
    ],
    // L5 Tests, docs & shipping
    [
      {
        kind: 'write',
        prompt: 'Document the tickets API: OpenAPI, summaries, and the 409 it can return.',
        starter:
          'var builder = WebApplication.CreateBuilder(args);\nvar app = builder.Build();\nvar tickets = app.MapGroup("/tickets").WithTags("Tickets");\ntickets.MapPost("/", BuyTicket);      // fails with 409 when sold out\ntickets.MapDelete("/{id:int}", RefundTicket);\napp.Run();',
        solution:
          'var builder = WebApplication.CreateBuilder(args);\nbuilder.Services.AddOpenApi();\nvar app = builder.Build();\nif (app.Environment.IsDevelopment())\n{\n    app.MapOpenApi();\n}\nvar tickets = app.MapGroup("/tickets").WithTags("Tickets");\ntickets.MapPost("/", BuyTicket)      // fails with 409 when sold out\n    .WithSummary("Buy a ticket")\n    .ProducesProblem(StatusCodes.Status409Conflict);\ntickets.MapDelete("/{id:int}", RefundTicket)\n    .WithSummary("Refund a ticket");\napp.Run();',
        checks: [
          { label: 'builder.Services.AddOpenApi()', has: 'builder.Services.AddOpenApi()' },
          { label: 'Serve it with app.MapOpenApi()', re: 'app\\.MapOpenApi\\(\\)' },
          { label: 'A .WithSummary on both endpoints', re: '(\\.WithSummary\\(\\s*"[^"]+"\\s*\\)[\\s\\S]*){2}' },
          { label: 'Declare the 409 with .ProducesProblem', re: 'MapPost\\([^;]*\\.ProducesProblem\\(\\s*(409|StatusCodes\\.Status409Conflict)\\s*\\)' },
        ],
        hint: 'ProducesProblem adds a problem+json response for a status code TypedResults can’t show.',
        explain: 'The document now lists each operation’s purpose and the 409 a client must handle, so generated clients know about it.',
      },
      {
        kind: 'write',
        prompt: 'Test the shipped API: its OpenAPI doc says "Book a room", and anonymous calls get 401.',
        starter:
          'public class ShippingTests(WebApplicationFactory<Program> factory) : IClassFixture<WebApplicationFactory<Program>>\n{\n    // 1. GET /openapi/v1.json is 200 and mentions "Book a room"\n    // 2. GET /bookings/1 with no token is 401\n}',
        solution:
          'public class ShippingTests(WebApplicationFactory<Program> factory) : IClassFixture<WebApplicationFactory<Program>>\n{\n    // 1. GET /openapi/v1.json is 200 and mentions "Book a room"\n    // 2. GET /bookings/1 with no token is 401\n    [Fact]\n    public async Task OpenApi_lists_booking_summary()\n    {\n        var response = await factory.CreateClient().GetAsync("/openapi/v1.json");\n        Assert.Equal(HttpStatusCode.OK, response.StatusCode);\n        Assert.Contains("Book a room", await response.Content.ReadAsStringAsync());\n    }\n\n    [Fact]\n    public async Task Bookings_need_a_token()\n    {\n        var response = await factory.CreateClient().GetAsync("/bookings/1");\n        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);\n    }\n}',
        checks: [
          { label: 'Two [Fact] tests', re: '(\\[Fact\\][\\s\\S]*){2}' },
          { label: 'Create clients with factory.CreateClient()', has: '.CreateClient()' },
          { label: 'GET /openapi/v1.json', re: '(GetAsync|GetStringAsync)\\(\\s*"/openapi/v1\\.json"\\s*\\)' },
          { label: 'Assert.Contains("Book a room", …)', re: 'Assert\\.Contains\\(\\s*"Book a room"\\s*,' },
          { label: 'GET /bookings/1 and expect HttpStatusCode.Unauthorized', re: 'GetAsync\\(\\s*"/bookings/1"\\s*\\)[\\s\\S]*HttpStatusCode\\.Unauthorized' },
        ],
        hint: 'WebApplicationFactory runs in Development by default, so the OpenAPI document is mapped.',
        explain: 'One test proves the contract you publish, the other proves the auth gate is shut, both against the real pipeline.',
      },
    ],
  ],
};

export default unit;
