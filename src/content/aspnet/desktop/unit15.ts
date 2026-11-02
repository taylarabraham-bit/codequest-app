import type { DesktopUnit } from '../../../engine/types';

// Desktop edition: write-the-code challenges for ASP.NET unit 15 (gRPC services).
// lessons[i] runs after lesson i + 1. See docs/CONTENT_GUIDE.md.
const unit: DesktopUnit = {
  lessons: [
    // L1 Proto contracts
    [
      {
        kind: 'write',
        prompt: 'Write a .proto for a forecast service: send a city, get a summary and temperature.',
        starter: '',
        solution:
          'syntax = "proto3";\noption csharp_namespace = "Weather";\npackage weather;\n\nservice Forecasts {\n  rpc GetForecast (ForecastRequest) returns (ForecastReply);\n}\n\nmessage ForecastRequest {\n  string city = 1;\n}\n\nmessage ForecastReply {\n  string summary = 1;\n  int32 high_c = 2;\n}',
        checks: [
          { label: 'Start with syntax = "proto3";', re: '^\\s*syntax\\s*=\\s*"proto3"\\s*;' },
          { label: 'Pick the C# namespace with option csharp_namespace', re: 'option\\s+csharp_namespace\\s*=\\s*"[\\w.]+"\\s*;' },
          {
            label: 'A service with one rpc: (Request) returns (Reply)',
            re: 'service\\s+\\w+\\s*\\{[^}]*rpc\\s+\\w+\\s*\\(\\s*\\w+\\s*\\)\\s*returns\\s*\\(\\s*\\w+\\s*\\)\\s*;',
          },
          {
            label: 'The request message has a string city field',
            re: 'rpc\\s+\\w+\\s*\\(\\s*(\\w+)\\s*\\)[\\s\\S]*message\\s+\\1\\s*\\{[^}]*\\bstring\\s+city\\s*=\\s*\\d+\\s*;|message\\s+(\\w+)\\s*\\{[^}]*\\bstring\\s+city\\s*=\\s*\\d+\\s*;[^}]*\\}[\\s\\S]*rpc\\s+\\w+\\s*\\(\\s*\\2\\s*\\)',
          },
          {
            label: 'The reply message has a string and a number field',
            re: 'message\\s+\\w+\\s*\\{(?=[^}]*\\bstring\\s+\\w+\\s*=\\s*\\d+\\s*;)(?=[^}]*\\b(int32|int64|sint32|double|float)\\s+\\w+\\s*=\\s*\\d+\\s*;)[^}]*\\}',
          },
        ],
        hint: 'Every field is type name = number; numbers start at 1 in each message.',
        explain: 'The .proto is the contract both sides generate code from. Field numbers, not names, identify fields on the wire.',
      },
      {
        kind: 'write',
        prompt: 'Fix the library proto so it compiles.',
        starter:
          'option csharp_namespace = "Library";\n\nservice Loans {\n  rpc Borrow (BorrowRequest) returns (BorrowReply)\n}\n\nmessage BorrowRequest {\n  int32 book_id = 1;\n  string member = 1;\n}\n\nmessage BorrowReply {\n  string due_date = 1;\n}',
        solution:
          'syntax = "proto3";\noption csharp_namespace = "Library";\n\nservice Loans {\n  rpc Borrow (BorrowRequest) returns (BorrowReply);\n}\n\nmessage BorrowRequest {\n  int32 book_id = 1;\n  string member = 2;\n}\n\nmessage BorrowReply {\n  string due_date = 1;\n}',
        checks: [
          { label: 'syntax = "proto3"; on the first line', re: '^\\s*syntax\\s*=\\s*"proto3"\\s*;' },
          { label: 'End the rpc line with a semicolon', re: 'returns\\s*\\(\\s*BorrowReply\\s*\\)\\s*(;|\\{\\s*\\})' },
          {
            label: 'Give book_id and member different numbers',
            re: 'int32\\s+book_id\\s*=\\s*(\\d+)\\s*;\\s*string\\s+member\\s*=\\s*(?!\\1\\s*;)\\d+\\s*;',
          },
        ],
        hint: 'Three bugs: a missing first line, a missing semicolon and a reused field number.',
        explain: 'Without syntax the compiler assumes proto2, and two fields can’t share a number because the number is what goes on the wire.',
      },
    ],
    // L2 Messages & enums
    [
      {
        kind: 'write',
        prompt: 'Model a support ticket: a title, a Priority enum and a list of labels.',
        starter: 'syntax = "proto3";\noption csharp_namespace = "Helpdesk";\n',
        solution:
          'syntax = "proto3";\noption csharp_namespace = "Helpdesk";\n\nenum Priority {\n  PRIORITY_UNSPECIFIED = 0;\n  PRIORITY_LOW = 1;\n  PRIORITY_HIGH = 2;\n}\n\nmessage Ticket {\n  string title = 1;\n  Priority priority = 2;\n  repeated string labels = 3;\n}',
        checks: [
          { label: 'An enum whose first value is 0', re: 'enum\\s+\\w+\\s*\\{\\s*\\w+\\s*=\\s*0\\s*;' },
          { label: 'At least one more enum value', re: 'enum\\s+\\w+\\s*\\{[^}]*\\b\\w+\\s*=\\s*[1-9]\\d*\\s*;' },
          { label: 'A message with a string title', re: 'message\\s+\\w+\\s*\\{[^}]*\\bstring\\s+title\\s*=\\s*\\d+\\s*;' },
          { label: 'A field whose type is your enum', re: 'enum\\s+(\\w+)[\\s\\S]*message\\s+\\w+\\s*\\{[^}]*\\b\\1\\s+\\w+\\s*=\\s*\\d+\\s*;' },
          { label: 'A repeated string field for labels', re: 'repeated\\s+string\\s+\\w+\\s*=\\s*\\d+\\s*;' },
        ],
        hint: 'repeated makes a list; an enum’s zero value is the “not set” default.',
        explain: 'An unset priority reads as PRIORITY_UNSPECIFIED, so you can tell “not given” from a real choice.',
      },
      {
        kind: 'write',
        prompt: 'Build a large Sunrise smoothie with mango and lime, then print it.',
        starter:
          '// smoothie.proto:\n// enum Size { SIZE_UNSPECIFIED = 0; SIZE_SMALL = 1; SIZE_LARGE = 2; }\n// message Smoothie { string name = 1; Size size = 2; repeated string fruits = 3; }\n\n// print: name, size and fruit count\n',
        solution:
          '// smoothie.proto:\n// enum Size { SIZE_UNSPECIFIED = 0; SIZE_SMALL = 1; SIZE_LARGE = 2; }\n// message Smoothie { string name = 1; Size size = 2; repeated string fruits = 3; }\n\n// print: name, size and fruit count\nvar drink = new Smoothie { Name = "Sunrise", Size = Size.Large };\ndrink.Fruits.Add("mango");\ndrink.Fruits.Add("lime");\nConsole.WriteLine($"{drink.Name} {drink.Size} {drink.Fruits.Count}");',
        checks: [
          { label: 'new Smoothie with Name = "Sunrise"', re: 'new\\s+Smoothie\\s*(\\(\\s*\\))?\\s*\\{[^}]*Name\\s*=\\s*"Sunrise"' },
          { label: 'Size = Size.Large (prefix dropped in C#)', re: 'Size\\s*=\\s*Size\\.Large\\b' },
          {
            label: 'Add mango and lime to the read-only Fruits list',
            re: '\\.Fruits\\.Add\\(\\s*"mango"[\\s\\S]*\\.Fruits\\.Add\\(\\s*"lime"|Fruits\\.Add(Range)?\\([^;]*"mango"[^;]*"lime"|Fruits\\s*=\\s*\\{\\s*"mango"\\s*,\\s*"lime"\\s*\\}',
          },
          { label: 'Print name, size and Fruits.Count', re: 'Console\\.WriteLine\\([^;]*\\.Fruits\\.Count' },
        ],
        hint: 'Repeated fields have no setter: call .Add on them. SIZE_LARGE becomes Size.Large.',
        explain: 'The generator strips the enum prefix and makes Fruits a RepeatedField you add to. An enum prints its C# name.',
        output: 'Sunrise Large 2',
      },
    ],
    // L3 Hosting a service
    [
      {
        kind: 'write',
        prompt: 'Implement FindBook and host the Library gRPC service.',
        starter:
          '// service Library { rpc FindBook (BookRequest) returns (BookReply); }\n// message BookRequest { string isbn = 1; }\n// message BookReply { string title = 1; }\n',
        solution:
          '// service Library { rpc FindBook (BookRequest) returns (BookReply); }\n// message BookRequest { string isbn = 1; }\n// message BookReply { string title = 1; }\nbuilder.Services.AddGrpc();\nvar app = builder.Build();\napp.MapGrpcService<LibraryService>();\napp.Run();\n\npublic class LibraryService : Library.LibraryBase\n{\n    public override Task<BookReply> FindBook(BookRequest request, ServerCallContext context) =>\n        Task.FromResult(new BookReply { Title = request.Isbn == "9780441013593" ? "Dune" : "Unknown" });\n}',
        checks: [
          { label: 'Derive from the generated Library.LibraryBase', re: 'class\\s+\\w+\\s*(\\([^)]*\\))?\\s*:\\s*Library\\.LibraryBase\\b' },
          {
            label: 'Override FindBook(BookRequest, ServerCallContext)',
            re: 'public\\s+override\\s+(async\\s+)?Task<\\s*BookReply\\s*>\\s+FindBook\\(\\s*BookRequest\\s+\\w+\\s*,\\s*ServerCallContext\\s+\\w+\\s*\\)',
          },
          { label: 'Reply with a BookReply that sets Title', re: 'new\\s+BookReply\\s*(\\(\\s*\\))?\\s*\\{\\s*Title\\s*=' },
          { label: 'Register gRPC with AddGrpc()', has: 'builder.Services.AddGrpc()' },
          { label: 'Map it with MapGrpcService<T>()', re: 'app\\.MapGrpcService<\\s*\\w+\\s*>\\(\\)' },
        ],
        hint: 'The build generates Library.LibraryBase from the proto; override its method.',
        explain: 'The base class does the HTTP/2 and Protobuf work; your override only turns a request into a reply.',
      },
      {
        kind: 'write',
        prompt: 'Implement async PlaceOrder: save through OrderStore and reply with the new id.',
        starter:
          '// rpc PlaceOrder (PlaceOrderRequest) returns (PlaceOrderReply);\n// message PlaceOrderRequest { string item = 1; int32 qty = 2; }\n// message PlaceOrderReply { int32 order_id = 1; }\n// OrderStore.AddAsync(item, qty, token) returns Task<int>\npublic class CafeService(OrderStore store)\n{\n}',
        solution:
          '// rpc PlaceOrder (PlaceOrderRequest) returns (PlaceOrderReply);\n// message PlaceOrderRequest { string item = 1; int32 qty = 2; }\n// message PlaceOrderReply { int32 order_id = 1; }\n// OrderStore.AddAsync(item, qty, token) returns Task<int>\npublic class CafeService(OrderStore store) : Cafe.CafeBase\n{\n    public override async Task<PlaceOrderReply> PlaceOrder(PlaceOrderRequest request, ServerCallContext context)\n    {\n        var id = await store.AddAsync(request.Item, request.Qty, context.CancellationToken);\n        return new PlaceOrderReply { OrderId = id };\n    }\n}',
        checks: [
          { label: 'Derive from Cafe.CafeBase', re: 'class\\s+CafeService\\s*\\([^)]*\\)\\s*:\\s*Cafe\\.CafeBase\\b' },
          {
            label: 'public override async Task<PlaceOrderReply> PlaceOrder(…)',
            re: 'public\\s+override\\s+async\\s+Task<\\s*PlaceOrderReply\\s*>\\s+PlaceOrder\\(\\s*PlaceOrderRequest\\s+\\w+\\s*,\\s*ServerCallContext\\s+\\w+\\s*\\)',
          },
          { label: 'await store.AddAsync with Item and Qty', re: 'await\\s+store\\.AddAsync\\(\\s*\\w+\\.Item\\s*,\\s*\\w+\\.Qty\\s*,' },
          { label: 'Pass the call’s CancellationToken', re: '\\w+\\.CancellationToken\\s*\\)' },
          { label: 'Set OrderId (order_id in the proto)', re: 'new\\s+PlaceOrderReply\\s*(\\(\\s*\\))?\\s*\\{\\s*OrderId\\s*=' },
        ],
        hint: 'snake_case proto fields become PascalCase properties: order_id is OrderId.',
        explain: 'context.CancellationToken fires when the client gives up or its deadline passes, so the save stops instead of running for nobody.',
      },
    ],
    // L4 Errors & streaming
    [
      {
        kind: 'write',
        prompt: 'Implement GetSong; send a NotFound error when the song doesn’t exist.',
        starter:
          '// rpc GetSong (SongRequest) returns (SongReply);  SongRequest { int32 id = 1; }  SongReply { string title = 1; }\n// songs.Find(id) returns a Song or null\npublic class MusicService(SongCatalog songs) : Music.MusicBase\n{\n}',
        solution:
          '// rpc GetSong (SongRequest) returns (SongReply);  SongRequest { int32 id = 1; }  SongReply { string title = 1; }\n// songs.Find(id) returns a Song or null\npublic class MusicService(SongCatalog songs) : Music.MusicBase\n{\n    public override Task<SongReply> GetSong(SongRequest request, ServerCallContext context)\n    {\n        var song = songs.Find(request.Id)\n            ?? throw new RpcException(new Status(StatusCode.NotFound, $"No song {request.Id}"));\n        return Task.FromResult(new SongReply { Title = song.Title });\n    }\n}',
        checks: [
          { label: 'Override GetSong', re: 'public\\s+override\\s+(async\\s+)?Task<\\s*SongReply\\s*>\\s+GetSong\\(\\s*SongRequest\\s+\\w+\\s*,\\s*ServerCallContext\\s+\\w+\\s*\\)' },
          { label: 'Look the song up with songs.Find', re: 'songs\\.Find\\(\\s*\\w+\\.Id\\s*\\)' },
          {
            label: 'throw new RpcException with StatusCode.NotFound',
            re: 'throw\\s+new\\s+RpcException\\(\\s*new\\s+Status\\(\\s*StatusCode\\.NotFound\\s*,\\s*\\$?"[^"]+"\\s*\\)\\s*\\)',
          },
          { label: 'Otherwise reply with a SongReply', re: 'new\\s+SongReply\\s*(\\(\\s*\\))?\\s*\\{' },
        ],
        hint: 'gRPC errors are exceptions: new RpcException(new Status(code, message)).',
        explain: 'The client receives status NotFound with your message instead of a generic Unknown error, so it can react properly.',
      },
      {
        kind: 'write',
        prompt: 'Stream a PriceTick for each price in history, half a second apart.',
        starter:
          '// rpc Watch (WatchRequest) returns (stream PriceTick);\n// WatchRequest { string symbol = 1; }  PriceTick { string symbol = 1; double price = 2; }\n// prices.History(symbol) returns IEnumerable<double>\npublic class StocksService(PriceFeed prices) : Stocks.StocksBase\n{\n}',
        solution:
          '// rpc Watch (WatchRequest) returns (stream PriceTick);\n// WatchRequest { string symbol = 1; }  PriceTick { string symbol = 1; double price = 2; }\n// prices.History(symbol) returns IEnumerable<double>\npublic class StocksService(PriceFeed prices) : Stocks.StocksBase\n{\n    public override async Task Watch(WatchRequest request,\n        IServerStreamWriter<PriceTick> responseStream, ServerCallContext context)\n    {\n        foreach (var price in prices.History(request.Symbol))\n        {\n            await responseStream.WriteAsync(new PriceTick { Symbol = request.Symbol, Price = price });\n            await Task.Delay(500, context.CancellationToken);\n        }\n    }\n}',
        checks: [
          {
            label: 'Override Watch with an IServerStreamWriter<PriceTick>',
            re: 'public\\s+override\\s+async\\s+Task\\s+Watch\\(\\s*WatchRequest\\s+\\w+\\s*,\\s*IServerStreamWriter<\\s*PriceTick\\s*>\\s+\\w+\\s*,\\s*ServerCallContext\\s+\\w+\\s*\\)',
          },
          { label: 'Loop over prices.History(symbol)', re: 'foreach\\s*\\(\\s*var\\s+\\w+\\s+in\\s+prices\\.History\\(\\s*\\w+\\.Symbol\\s*\\)\\s*\\)' },
          { label: 'await WriteAsync(new PriceTick …) per price', re: 'await\\s+\\w+\\.WriteAsync\\(\\s*new\\s+PriceTick' },
          {
            label: 'Wait 500 ms with the call’s token',
            re: 'await\\s+Task\\.Delay\\(\\s*(500|TimeSpan\\.FromMilliseconds\\(\\s*500\\s*\\))\\s*,\\s*\\w+\\.CancellationToken\\s*\\)',
          },
        ],
        hint: 'A server-streaming method returns plain Task and writes each message to the stream.',
        explain: 'Each WriteAsync reaches the client right away. The call’s token stops the loop if the client disconnects.',
      },
    ],
    // L5 Clients & JSON transcoding
    [
      {
        kind: 'write',
        prompt: 'Call GetSong for song 3 with a 3-second deadline and print the title.',
        starter: '',
        solution:
          'using var channel = GrpcChannel.ForAddress("https://localhost:7042");\nvar client = new Music.MusicClient(channel);\nvar reply = await client.GetSongAsync(new SongRequest { Id = 3 },\n    deadline: DateTime.UtcNow.AddSeconds(3));\nConsole.WriteLine(reply.Title);',
        checks: [
          { label: 'Open a channel with GrpcChannel.ForAddress', re: 'using\\s+var\\s+\\w+\\s*=\\s*GrpcChannel\\.ForAddress\\(\\s*"https?://[^"]+"\\s*\\)' },
          { label: 'Wrap it in new Music.MusicClient(channel)', re: 'new\\s+Music\\.MusicClient\\(\\s*\\w+\\s*\\)' },
          { label: 'await GetSongAsync with Id = 3', re: 'await\\s+\\w+\\.GetSongAsync\\(\\s*new\\s+SongRequest\\s*(\\(\\s*\\))?\\s*\\{\\s*Id\\s*=\\s*3\\s*\\}' },
          { label: 'A deadline 3 seconds from now (UTC)', re: 'deadline:\\s*DateTime\\.UtcNow\\.AddSeconds\\(\\s*3\\s*\\)' },
          { label: 'Print reply.Title', re: 'Console\\.WriteLine\\(\\s*\\w+\\.Title\\s*\\)' },
        ],
        hint: 'The generated client has an …Async method per rpc, which takes a deadline: argument.',
        explain: 'If the server takes longer than 3 seconds, the call fails with DeadlineExceeded instead of hanging, and the server sees it cancelled too.',
      },
      {
        kind: 'write',
        prompt: 'Expose GetSong as GET /v1/songs/{id} with JSON transcoding.',
        starter:
          '// music.proto\nsyntax = "proto3";\noption csharp_namespace = "Records";\n\nservice Music {\n  rpc GetSong (SongRequest) returns (SongReply);\n}\n\n// Program.cs\nbuilder.Services.AddGrpc();',
        solution:
          '// music.proto\nsyntax = "proto3";\noption csharp_namespace = "Records";\nimport "google/api/annotations.proto";\n\nservice Music {\n  rpc GetSong (SongRequest) returns (SongReply) {\n    option (google.api.http) = { get: "/v1/songs/{id}" };\n  }\n}\n\n// Program.cs\nbuilder.Services.AddGrpc().AddJsonTranscoding();',
        checks: [
          { label: 'import "google/api/annotations.proto";', re: 'import\\s+"google/api/annotations\\.proto"\\s*;' },
          {
            label: 'Give GetSong an option (google.api.http) with get: "/v1/songs/{id}"',
            re: 'rpc\\s+GetSong\\s*\\([^)]*\\)\\s*returns\\s*\\([^)]*\\)\\s*\\{\\s*option\\s*\\(\\s*google\\.api\\.http\\s*\\)\\s*=\\s*\\{\\s*get\\s*:\\s*"/v1/songs/\\{id\\}"\\s*\\}\\s*;\\s*\\}',
          },
          { label: 'Turn on .AddJsonTranscoding() after AddGrpc()', has: 'builder.Services.AddGrpc().AddJsonTranscoding()' },
        ],
        hint: 'The rpc gets a { … } body holding an option; {id} binds to the request’s id field.',
        explain: 'The same rpc now answers gRPC clients and plain HTTP GETs returning JSON, so browsers and curl can use it too.',
      },
    ],
  ],
};

export default unit;
