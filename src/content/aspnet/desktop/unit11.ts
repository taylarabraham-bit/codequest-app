import type { DesktopUnit } from '../../../engine/types';

// Desktop edition: write-the-code challenges for ASP.NET unit 11 (Testing APIs).
// lessons[i] runs after lesson i + 1. See docs/CONTENT_GUIDE.md.
const unit: DesktopUnit = {
  lessons: [
    // L1 OpenAPI documents
    [
      {
        kind: 'write',
        prompt: 'Give a pet shop API an OpenAPI document that only Development serves.',
        starter: 'var builder = WebApplication.CreateBuilder(args);\n',
        solution:
          'var builder = WebApplication.CreateBuilder(args);\nbuilder.Services.AddOpenApi();\nvar app = builder.Build();\nif (app.Environment.IsDevelopment())\n{\n    app.MapOpenApi();\n}\napp.MapGet("/pets", () => "Rex, Tom");\napp.Run();',
        checks: [
          { label: 'Register the generator with AddOpenApi()', has: 'builder.Services.AddOpenApi()' },
          { label: 'Register it before builder.Build()', re: 'AddOpenApi\\(\\)[\\s\\S]*builder\\.Build\\(\\)' },
          {
            label: 'Map the document only if IsDevelopment()',
            re: 'if\\s*\\(\\s*app\\.Environment\\.IsDevelopment\\(\\)\\s*\\)\\s*\\{?\\s*app\\.MapOpenApi\\(\\)',
          },
          { label: 'At least one MapGet endpoint to document', re: 'app\\.MapGet\\(\\s*"/' },
        ],
        hint: 'AddOpenApi goes on builder.Services; MapOpenApi goes on app, inside the environment check.',
        explain: 'AddOpenApi registers the generator and MapOpenApi serves /openapi/v1.json. The if keeps your API description out of production.',
      },
      {
        kind: 'write',
        prompt: 'Name and summarise both room endpoints, and hide the docs outside Development.',
        starter:
          'builder.Services.AddOpenApi();\nvar app = builder.Build();\napp.MapOpenApi();\n\napp.MapGet("/rooms", () => "Lab, Studio");\napp.MapPost("/rooms/{id}/book", (int id) => $"Booked room {id}");',
        solution:
          'builder.Services.AddOpenApi();\nvar app = builder.Build();\nif (app.Environment.IsDevelopment())\n{\n    app.MapOpenApi();\n}\n\napp.MapGet("/rooms", () => "Lab, Studio")\n    .WithName("ListRooms")\n    .WithSummary("All rooms you can book");\napp.MapPost("/rooms/{id}/book", (int id) => $"Booked room {id}")\n    .WithName("BookRoom")\n    .WithSummary("Book one room");',
        checks: [
          { label: 'Give GET /rooms a name with .WithName', re: 'MapGet\\([^;]*\\.WithName\\(\\s*"\\w+"\\s*\\)' },
          { label: 'Give GET /rooms a .WithSummary', re: 'MapGet\\([^;]*\\.WithSummary\\(\\s*"[^"]+"\\s*\\)' },
          { label: 'Give the POST a name with .WithName', re: 'MapPost\\([^;]*\\.WithName\\(\\s*"\\w+"\\s*\\)' },
          { label: 'Give the POST a .WithSummary', re: 'MapPost\\([^;]*\\.WithSummary\\(\\s*"[^"]+"\\s*\\)' },
          {
            label: 'Only map the document in Development',
            re: 'if\\s*\\(\\s*app\\.Environment\\.IsDevelopment\\(\\)\\s*\\)\\s*\\{?\\s*app\\.MapOpenApi\\(\\)',
          },
        ],
        hint: 'Chain .WithName("…") and .WithSummary("…") onto each Map call, before the semicolon.',
        explain: 'WithName becomes the operationId and WithSummary the one-line description in /openapi/v1.json. Production never maps the document.',
      },
    ],
    // L2 xUnit basics
    [
      {
        kind: 'write',
        prompt: 'Write an xUnit test class proving Fare.Child(4m) returns 2m.',
        starter: '',
        solution:
          'public class FareTests\n{\n    [Fact]\n    public void Child_fare_is_half()\n    {\n        Assert.Equal(2m, Fare.Child(4m));\n    }\n}',
        checks: [
          { label: 'A public test class', re: 'public\\s+class\\s+\\w+' },
          { label: 'Mark the test method with [Fact]', has: '[Fact]' },
          { label: 'A public void (or async Task) test method', re: 'public\\s+(void|async\\s+Task)\\s+\\w+\\s*\\(\\s*\\)' },
          {
            label: 'Assert.Equal with the expected 2m first',
            re: 'Assert\\.Equal\\(\\s*2(\\.0+)?m?\\s*,\\s*Fare\\.Child\\(\\s*4(\\.0+)?m?\\s*\\)\\s*\\)',
          },
        ],
        hint: 'A [Fact] is a public method with no parameters. Assert.Equal(expected, actual).',
        explain: 'xUnit runs every [Fact]. Putting the expected value first makes the failure message read “Expected: 2, Actual: …”.',
      },
      {
        kind: 'write',
        prompt: 'Replace the two Facts with one [Theory] running three [InlineData] rows.',
        starter:
          'public class GradeTests\n{\n    [Fact]\n    public void Ninety_is_A() => Assert.Equal("A", Grade.For(90));\n\n    [Fact]\n    public void Seventy_is_C() => Assert.Equal("C", Grade.For(70));\n}',
        solution:
          'public class GradeTests\n{\n    [Theory]\n    [InlineData(90, "A")]\n    [InlineData(70, "C")]\n    [InlineData(40, "F")]\n    public void Score_maps_to_grade(int score, string expected) =>\n        Assert.Equal(expected, Grade.For(score));\n}',
        checks: [
          { label: 'Mark the method with [Theory]', has: '[Theory]' },
          { label: 'Three [InlineData] rows', re: '(\\[InlineData\\([^)]*\\)\\][\\s\\S]*?){3}' },
          { label: 'No [Fact] left', not: '[Fact]' },
          { label: 'The method takes a parameter per column', re: 'public\\s+void\\s+\\w+\\s*\\(\\s*\\w+\\s+\\w+\\s*,\\s*\\w+\\s+\\w+\\s*\\)' },
          { label: 'Assert.Equal(expected, Grade.For(score)) using the parameters', re: 'Assert\\.Equal\\(\\s*\\w+\\s*,\\s*Grade\\.For\\(\\s*\\w+\\s*\\)\\s*\\)' },
        ],
        hint: 'Each [InlineData(score, grade)] row fills the method’s parameters in order.',
        explain: 'A Theory runs once per InlineData row and reports each row separately, so adding a case is one line.',
      },
    ],
    // L3 Testing handlers
    [
      {
        kind: 'write',
        prompt: 'Write GetParcel: return the parcel from IParcelStore.Find(code), or NotFound.',
        starter: 'public static class ParcelApi\n{\n}',
        solution:
          'public static class ParcelApi\n{\n    public static Results<Ok<Parcel>, NotFound> GetParcel(string code, IParcelStore store) =>\n        store.Find(code) is Parcel p ? TypedResults.Ok(p) : TypedResults.NotFound();\n}',
        checks: [
          {
            label: 'A public static method returning Results<Ok<Parcel>, NotFound>',
            re: 'public\\s+static\\s+(async\\s+)?(Task<\\s*)?Results<\\s*Ok<\\s*Parcel\\s*>\\s*,\\s*NotFound\\s*>',
          },
          { label: 'Take the code and an IParcelStore as parameters', re: 'string\\s+\\w+\\s*,\\s*IParcelStore\\s+\\w+' },
          { label: 'Return TypedResults.Ok with the parcel', re: 'TypedResults\\.Ok\\(\\s*\\w+\\s*\\)' },
          { label: 'Return TypedResults.NotFound() when missing', has: 'TypedResults.NotFound()' },
        ],
        hint: 'store.Find(code) is Parcel p ? … : … picks between the two outcomes.',
        explain: 'The Results<…> return type lists every outcome, so OpenAPI and your tests both know exactly what can come back.',
      },
      {
        kind: 'write',
        prompt: 'Write a fake store and a test proving an unknown code returns NotFound.',
        starter:
          'public interface IParcelStore { Parcel? Find(string code); }\n\npublic static class ParcelApi\n{\n    public static Results<Ok<Parcel>, NotFound> GetParcel(string code, IParcelStore store) =>\n        store.Find(code) is Parcel p ? TypedResults.Ok(p) : TypedResults.NotFound();\n}\n',
        solution:
          'public interface IParcelStore { Parcel? Find(string code); }\n\npublic static class ParcelApi\n{\n    public static Results<Ok<Parcel>, NotFound> GetParcel(string code, IParcelStore store) =>\n        store.Find(code) is Parcel p ? TypedResults.Ok(p) : TypedResults.NotFound();\n}\n\nclass EmptyStore : IParcelStore\n{\n    public Parcel? Find(string code) => null;\n}\n\npublic class ParcelApiTests\n{\n    [Fact]\n    public void Unknown_code_is_not_found()\n    {\n        var result = ParcelApi.GetParcel("ZZ9", new EmptyStore());\n        Assert.IsType<NotFound>(result.Result);\n    }\n}',
        checks: [
          { label: 'A fake class that implements IParcelStore', re: 'class\\s+\\w+\\s*:\\s*IParcelStore' },
          { label: 'A [Fact] test method', has: '[Fact]' },
          { label: 'Call ParcelApi.GetParcel directly', re: 'ParcelApi\\.GetParcel\\(\\s*"[^"]*"\\s*,\\s*new\\s+\\w+' },
          { label: 'Assert.IsType<NotFound> on result.Result', re: 'Assert\\.IsType<\\s*NotFound\\s*>\\(\\s*\\w+\\.Result\\s*\\)' },
        ],
        hint: 'The fake’s Find can simply return null. Then check which result type came back.',
        explain: 'Calling the handler as a plain method needs no server. .Result unwraps the Results<…> union so Assert.IsType can check it.',
      },
    ],
    // L4 Integration tests
    [
      {
        kind: 'write',
        prompt: 'Write an integration test that GETs /menu and expects 200 OK.',
        starter: '',
        solution:
          'public class MenuTests(WebApplicationFactory<Program> factory) : IClassFixture<WebApplicationFactory<Program>>\n{\n    [Fact]\n    public async Task Menu_returns_ok()\n    {\n        var client = factory.CreateClient();\n        var response = await client.GetAsync("/menu");\n        Assert.Equal(HttpStatusCode.OK, response.StatusCode);\n    }\n}',
        checks: [
          { label: 'Share the app with IClassFixture<WebApplicationFactory<Program>>', re: 'IClassFixture<\\s*WebApplicationFactory<\\s*Program\\s*>\\s*>' },
          { label: 'An async Task test method', re: 'public\\s+async\\s+Task\\s+\\w+' },
          { label: 'Create the client with CreateClient()', has: '.CreateClient()' },
          { label: 'await a GET to /menu', re: 'await\\s+\\w+\\.GetAsync\\(\\s*"/menu"\\s*\\)' },
          {
            label: 'Assert the status is OK',
            re: 'Assert\\.Equal\\(\\s*HttpStatusCode\\.OK\\s*,\\s*\\w+\\.StatusCode\\s*\\)|EnsureSuccessStatusCode\\(\\)',
          },
        ],
        hint: 'Take the factory in the constructor, then factory.CreateClient().GetAsync(…).',
        explain: 'WebApplicationFactory boots your real Program in memory, so the request goes through routing, middleware and DI without a port.',
      },
      {
        kind: 'write',
        prompt: 'POST a new ticket, then GET it back by its new id.',
        starter:
          '// Ticket is: public record Ticket(int Id, string Show);\npublic class TicketTests(WebApplicationFactory<Program> factory) : IClassFixture<WebApplicationFactory<Program>>\n{\n    [Fact]\n    public async Task Created_ticket_can_be_read()\n    {\n        var client = factory.CreateClient();\n    }\n}',
        solution:
          '// Ticket is: public record Ticket(int Id, string Show);\npublic class TicketTests(WebApplicationFactory<Program> factory) : IClassFixture<WebApplicationFactory<Program>>\n{\n    [Fact]\n    public async Task Created_ticket_can_be_read()\n    {\n        var client = factory.CreateClient();\n        var created = await client.PostAsJsonAsync("/tickets", new Ticket(0, "Opera"));\n        Assert.Equal(HttpStatusCode.Created, created.StatusCode);\n        var saved = await created.Content.ReadFromJsonAsync<Ticket>();\n        var ticket = await client.GetFromJsonAsync<Ticket>($"/tickets/{saved!.Id}");\n        Assert.Equal("Opera", ticket!.Show);\n    }\n}',
        checks: [
          { label: 'POST a Ticket with PostAsJsonAsync to /tickets', re: 'PostAsJsonAsync\\(\\s*"/tickets"\\s*,\\s*new\\s+Ticket\\(' },
          { label: 'Assert the POST returned 201 Created', re: 'Assert\\.Equal\\(\\s*HttpStatusCode\\.Created\\s*,' },
          { label: 'Read the created Ticket with ReadFromJsonAsync<Ticket>', re: 'ReadFromJsonAsync<\\s*Ticket\\s*>' },
          { label: 'GET /tickets/{id} using the new id', re: '(GetAsync|GetFromJsonAsync<\\s*Ticket\\s*>)\\(\\s*\\$"/tickets/\\{' },
          { label: 'Assert on the fetched ticket’s Show', re: 'Assert\\.\\w+\\([^;]*\\.Show\\b' },
        ],
        hint: 'The POST response body holds the saved ticket, including the id the server assigned.',
        explain: 'Round-tripping through POST and GET proves the endpoint really stored the ticket, not just that it answered.',
      },
    ],
    // L5 Swapping services
    [
      {
        kind: 'write',
        prompt: 'Swap IWeatherFeed for a FakeWeatherFeed, then build the client from that copy.',
        starter:
          '[Fact]\npublic async Task Forecast_uses_the_feed()\n{\n    // swap the feed and create the client here\n    var body = await client.GetStringAsync("/forecast");\n    Assert.Equal("Sunny", body);\n}',
        solution:
          '[Fact]\npublic async Task Forecast_uses_the_feed()\n{\n    var custom = factory.WithWebHostBuilder(b => b.ConfigureTestServices(s =>\n    {\n        s.RemoveAll<IWeatherFeed>();\n        s.AddSingleton<IWeatherFeed>(new FakeWeatherFeed("Sunny"));\n    }));\n    var client = custom.CreateClient();\n    var body = await client.GetStringAsync("/forecast");\n    Assert.Equal("Sunny", body);\n}',
        checks: [
          { label: 'Make a tweaked copy with WithWebHostBuilder', re: '\\w+\\.WithWebHostBuilder\\(' },
          { label: 'Change services in ConfigureTestServices', has: '.ConfigureTestServices(' },
          { label: 'RemoveAll<IWeatherFeed>()', re: 'RemoveAll<\\s*IWeatherFeed\\s*>\\(\\)' },
          { label: 'Register the fake as IWeatherFeed', re: 'Add(Singleton|Scoped|Transient)<\\s*IWeatherFeed\\s*[,>]' },
          { label: 'Create an HttpClient', has: '.CreateClient()' },
          { label: 'Create it from the copy, not factory', not: 'factory.CreateClient()' },
        ],
        hint: 'ConfigureTestServices runs after Program.cs, so your registration wins.',
        explain: 'The copy carries your swapped service. A client from the original factory would still talk to the real weather feed.',
      },
      {
        kind: 'write',
        prompt: 'Fix the test so the fake gateway replaces the real one, in the Testing environment.',
        starter:
          'var custom = factory.WithWebHostBuilder(b => b.ConfigureServices(s =>\n{\n    s.AddSingleton<IPaymentGateway>(new FakeGateway(approve: false));\n}));\nvar client = factory.CreateClient();\nvar response = await client.PostAsJsonAsync("/checkout", new Cart(3));\nAssert.Equal(HttpStatusCode.PaymentRequired, response.StatusCode);',
        solution:
          'var custom = factory.WithWebHostBuilder(b =>\n{\n    b.UseEnvironment("Testing");\n    b.ConfigureTestServices(s =>\n    {\n        s.RemoveAll<IPaymentGateway>();\n        s.AddSingleton<IPaymentGateway>(new FakeGateway(approve: false));\n    });\n});\nvar client = custom.CreateClient();\nvar response = await client.PostAsJsonAsync("/checkout", new Cart(3));\nAssert.Equal(HttpStatusCode.PaymentRequired, response.StatusCode);',
        checks: [
          { label: 'Use ConfigureTestServices so it runs after Program.cs', has: '.ConfigureTestServices(' },
          { label: 'No ConfigureServices left', not: '.ConfigureServices(' },
          { label: 'RemoveAll<IPaymentGateway>() before adding the fake', re: 'RemoveAll<\\s*IPaymentGateway\\s*>\\(\\)[\\s\\S]*Add\\w*<\\s*IPaymentGateway' },
          { label: 'UseEnvironment("Testing")', re: 'UseEnvironment\\(\\s*"Testing"\\s*\\)' },
          { label: 'Create the client from the copy', re: '\\w+\\.CreateClient\\(\\)' },
          { label: 'Not from the original factory', not: 'factory.CreateClient()' },
        ],
        hint: 'Three bugs: the wrong configure method, nothing removed, and the client comes from the wrong factory.',
        explain: 'ConfigureServices runs before Program.cs registers the real gateway, so it would win. ConfigureTestServices runs last, and the client must come from the copy.',
      },
    ],
  ],
};

export default unit;
