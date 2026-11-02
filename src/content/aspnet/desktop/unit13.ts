import type { DesktopUnit } from '../../../engine/types';

// Desktop edition: write-the-code challenges for ASP.NET unit 13 (Real-time with SignalR).
// lessons[i] runs after lesson i + 1. See docs/CONTENT_GUIDE.md.
const unit: DesktopUnit = {
  lessons: [
    // L1 Your first hub
    [
      {
        kind: 'write',
        prompt: 'Write an auction hub whose Bid method broadcasts each bid, and map it.',
        starter: '',
        solution:
          'builder.Services.AddSignalR();\nvar app = builder.Build();\napp.MapHub<AuctionHub>("/auction");\napp.Run();\n\npublic class AuctionHub : Hub\n{\n    public Task Bid(string bidder, decimal amount) =>\n        Clients.All.SendAsync("NewBid", bidder, amount);\n}',
        checks: [
          { label: 'A class that derives from Hub', re: 'class\\s+\\w+\\s*:\\s*Hub\\b' },
          { label: 'A public Bid method returning Task', re: 'public\\s+(async\\s+)?Task\\s+Bid\\s*\\(' },
          { label: 'Broadcast with Clients.All.SendAsync', re: 'Clients\\.All\\.SendAsync\\(\\s*"\\w+"\\s*,' },
          { label: 'Register SignalR with AddSignalR()', has: 'builder.Services.AddSignalR()' },
          { label: 'Give the hub a URL with MapHub', re: 'app\\.MapHub<\\s*\\w+\\s*>\\(\\s*"/[\\w-]+"\\s*\\)' },
        ],
        hint: 'SendAsync takes the client method name first, then the arguments to send.',
        explain: 'Every connected client that registered a NewBid handler receives the bidder and amount the moment someone bids.',
      },
      {
        kind: 'write',
        prompt: 'Make ScoreHub a working hub that tells every fan about a goal, at /scores.',
        starter:
          'var builder = WebApplication.CreateBuilder(args);\nvar app = builder.Build();\napp.Run();\n\npublic class ScoreHub\n{\n    public void Goal(string team) { }\n}',
        solution:
          'var builder = WebApplication.CreateBuilder(args);\nbuilder.Services.AddSignalR();\nvar app = builder.Build();\napp.MapHub<ScoreHub>("/scores");\napp.Run();\n\npublic class ScoreHub : Hub\n{\n    public Task Goal(string team) => Clients.All.SendAsync("GoalScored", team);\n}',
        checks: [
          { label: 'ScoreHub derives from Hub', re: 'class\\s+ScoreHub\\s*:\\s*Hub\\b' },
          { label: 'Goal returns a Task', re: 'public\\s+(async\\s+)?Task\\s+Goal\\s*\\(' },
          { label: 'Send the team to all clients', re: 'Clients\\.All\\.SendAsync\\(\\s*"\\w+"\\s*,\\s*team\\s*\\)' },
          { label: 'AddSignalR() before builder.Build()', re: 'AddSignalR\\(\\)[\\s\\S]*builder\\.Build\\(\\)' },
          { label: 'Map the hub at /scores', re: 'app\\.MapHub<\\s*ScoreHub\\s*>\\(\\s*"/scores"\\s*\\)' },
        ],
        hint: 'A hub needs the Hub base class, the SignalR services and a MapHub URL.',
        explain: 'Returning the Task from SendAsync lets SignalR wait for the send to finish, and errors reach the caller instead of vanishing.',
      },
    ],
    // L2 Choosing recipients
    [
      {
        kind: 'write',
        prompt: 'Tell the caller if their quiz answer is right, and tell others someone answered.',
        starter: 'public class QuizHub : Hub\n{\n}',
        solution:
          'public class QuizHub : Hub\n{\n    public async Task Answer(string choice)\n    {\n        await Clients.Caller.SendAsync("Feedback", choice == "B" ? "Correct!" : "Wrong");\n        await Clients.Others.SendAsync("Answered", Context.ConnectionId);\n    }\n}',
        checks: [
          { label: 'A public async Task method with the answer', re: 'public\\s+async\\s+Task\\s+\\w+\\s*\\(\\s*\\w+\\s+\\w+\\s*\\)' },
          { label: 'Send feedback to Clients.Caller', re: 'Clients\\.Caller\\.SendAsync\\(\\s*"\\w+"' },
          { label: 'Notify Clients.Others', re: 'Clients\\.Others\\.SendAsync\\(\\s*"\\w+"' },
          { label: 'Include Context.ConnectionId for the others', re: 'Others\\.SendAsync\\([^;]*Context\\.ConnectionId' },
          { label: 'await both sends', re: '(await\\s+Clients\\.[\\s\\S]*){2}' },
        ],
        hint: 'Caller is only the one who called; Others is everyone else.',
        explain: 'Only the player who answered sees the result, so nobody can copy it; the rest just learn that someone answered.',
      },
      {
        kind: 'write',
        prompt: 'Write Reply so a support agent can answer one customer by connection id.',
        starter: 'public class SupportHub : Hub\n{\n    // Reply(connectionId, text): send text to that one customer,\n    // then tell the agent "Sent"\n}',
        solution:
          'public class SupportHub : Hub\n{\n    public async Task Reply(string connectionId, string text)\n    {\n        await Clients.Client(connectionId).SendAsync("AgentReply", text);\n        await Clients.Caller.SendAsync("Sent", connectionId);\n    }\n}',
        checks: [
          { label: 'Reply takes a connection id and the text', re: 'public\\s+(async\\s+)?Task\\s+Reply\\s*\\(\\s*string\\s+\\w+\\s*,\\s*string\\s+\\w+\\s*\\)' },
          { label: 'Send to Clients.Client(id)', re: 'Clients\\.Client\\(\\s*\\w+\\s*\\)\\.SendAsync\\(\\s*"\\w+"' },
          { label: 'Confirm to the agent with Clients.Caller and "Sent"', re: 'Clients\\.Caller\\.SendAsync\\(\\s*"Sent"' },
          { label: 'Don’t broadcast with Clients.All', not: 'Clients.All' },
        ],
        hint: 'Clients.Client takes the connection id of the one client to reach.',
        explain: 'Clients.Client targets a single connection, so a private reply never reaches other customers.',
      },
    ],
    // L3 Groups
    [
      {
        kind: 'write',
        prompt: 'Let players join and leave game lobbies, announcing each join to the lobby.',
        starter: 'public class LobbyHub : Hub\n{\n}',
        solution:
          'public class LobbyHub : Hub\n{\n    public async Task Join(string lobby)\n    {\n        await Groups.AddToGroupAsync(Context.ConnectionId, lobby);\n        await Clients.Group(lobby).SendAsync("PlayerJoined", Context.ConnectionId);\n    }\n\n    public Task Leave(string lobby) =>\n        Groups.RemoveFromGroupAsync(Context.ConnectionId, lobby);\n}',
        checks: [
          { label: 'Join with Groups.AddToGroupAsync(Context.ConnectionId, …)', re: 'Groups\\.AddToGroupAsync\\(\\s*Context\\.ConnectionId\\s*,\\s*\\w+\\s*\\)' },
          { label: 'await the join before announcing', re: 'await\\s+Groups\\.AddToGroupAsync[\\s\\S]*Clients\\.Group\\(' },
          { label: 'Announce to Clients.Group(lobby)', re: 'Clients\\.Group\\(\\s*\\w+\\s*\\)\\.SendAsync\\(\\s*"\\w+"' },
          { label: 'Leave with Groups.RemoveFromGroupAsync', re: 'Groups\\.RemoveFromGroupAsync\\(\\s*Context\\.ConnectionId\\s*,\\s*\\w+\\s*\\)' },
        ],
        hint: 'Groups are keyed by name; the connection to add is Context.ConnectionId.',
        explain: 'Awaiting the join first means the new player is already in the group and hears their own announcement.',
      },
      {
        kind: 'write',
        prompt: 'Send questions only to their classroom, and add Switch(from, to) to change rooms.',
        starter:
          'public class ClassroomHub : Hub\n{\n    public async Task Join(string room) =>\n        await Groups.AddToGroupAsync(Context.ConnectionId, room);\n\n    public async Task Ask(string room, string question) =>\n        await Clients.All.SendAsync("Question", question);\n}',
        solution:
          'public class ClassroomHub : Hub\n{\n    public async Task Join(string room) =>\n        await Groups.AddToGroupAsync(Context.ConnectionId, room);\n\n    public async Task Ask(string room, string question) =>\n        await Clients.Group(room).SendAsync("Question", question);\n\n    public async Task Switch(string from, string to)\n    {\n        await Groups.RemoveFromGroupAsync(Context.ConnectionId, from);\n        await Groups.AddToGroupAsync(Context.ConnectionId, to);\n    }\n}',
        checks: [
          { label: 'Ask sends to Clients.Group(room)', re: 'Clients\\.(Group|OthersInGroup)\\(\\s*room\\s*\\)\\.SendAsync\\(\\s*"Question"' },
          { label: 'No Clients.All left', not: 'Clients.All' },
          { label: 'A Switch method with two room names', re: 'Task\\s+Switch\\s*\\(\\s*string\\s+\\w+\\s*,\\s*string\\s+\\w+\\s*\\)' },
          { label: 'Switch leaves the old room', re: 'Groups\\.RemoveFromGroupAsync\\(\\s*Context\\.ConnectionId\\s*,\\s*\\w+\\s*\\)' },
          { label: 'Switch joins the new room', re: '(Groups\\.AddToGroupAsync\\(\\s*Context\\.ConnectionId[\\s\\S]*){2}' },
        ],
        hint: 'Clients.Group(name) reaches one group; leaving is RemoveFromGroupAsync.',
        explain: 'A connection can sit in many groups, so switching means leaving the old one explicitly or it keeps getting both rooms’ questions.',
      },
    ],
    // L4 Strongly typed hubs
    [
      {
        kind: 'write',
        prompt: 'Write a typed kitchen hub: an IOrderClient interface and a Hub<IOrderClient>.',
        starter: '',
        solution:
          'public interface IOrderClient\n{\n    Task OrderReady(int orderId, string item);\n}\n\npublic class KitchenHub : Hub<IOrderClient>\n{\n    public Task Ready(int orderId, string item) => Clients.All.OrderReady(orderId, item);\n}',
        checks: [
          { label: 'A client interface with a Task method', re: 'interface\\s+I\\w+\\s*\\{[\\s\\S]*?Task\\s+\\w+\\s*\\([^)]*\\)\\s*;' },
          { label: 'The hub derives from Hub<YourInterface>', re: 'interface\\s+(I\\w+)[\\s\\S]*class\\s+\\w+\\s*:\\s*Hub<\\s*\\1\\s*>' },
          { label: 'Call the interface method on Clients.All', re: 'Task\\s+(\\w+)\\s*\\([^)]*\\)\\s*;[\\s\\S]*Clients\\.All\\.\\1\\(' },
          { label: 'No SendAsync with a string name', not: 'SendAsync' },
        ],
        hint: 'Clients.All has the interface’s methods, so call it like a normal method.',
        explain: 'The compiler now checks the method name and its arguments, so a typo like OrderRedy fails the build instead of failing silently.',
      },
      {
        kind: 'write',
        prompt: 'Add POST /parcels/{id}/status that pushes the new status to every client.',
        starter:
          'var builder = WebApplication.CreateBuilder(args);\nbuilder.Services.AddSignalR();\nvar app = builder.Build();\napp.MapHub<DeliveryHub>("/delivery");\n// POST /parcels/{id}/status?status=... goes here\napp.Run();\n\npublic interface IDeliveryClient { Task StatusChanged(int parcelId, string status); }\npublic class DeliveryHub : Hub<IDeliveryClient> { }',
        solution:
          'var builder = WebApplication.CreateBuilder(args);\nbuilder.Services.AddSignalR();\nvar app = builder.Build();\napp.MapHub<DeliveryHub>("/delivery");\napp.MapPost("/parcels/{id:int}/status",\n    async (int id, string status, IHubContext<DeliveryHub, IDeliveryClient> hub) =>\n    {\n        await hub.Clients.All.StatusChanged(id, status);\n        return Results.NoContent();\n    });\napp.Run();\n\npublic interface IDeliveryClient { Task StatusChanged(int parcelId, string status); }\npublic class DeliveryHub : Hub<IDeliveryClient> { }',
        checks: [
          { label: 'MapPost("/parcels/{id}/status", …)', re: 'app\\.MapPost\\(\\s*"/parcels/\\{id(:int)?\\}/status"' },
          { label: 'Inject IHubContext<DeliveryHub, IDeliveryClient>', re: 'IHubContext<\\s*DeliveryHub\\s*,\\s*IDeliveryClient\\s*>\\s+\\w+' },
          { label: 'Call StatusChanged on hub.Clients.All', re: '\\w+\\.Clients\\.All\\.StatusChanged\\(\\s*\\w+\\s*,\\s*\\w+\\s*\\)' },
          { label: 'Use the typed method, not SendAsync', not: 'SendAsync' },
        ],
        hint: 'Endpoints can’t use Clients directly; ask DI for the hub context.',
        explain: 'IHubContext lets any endpoint or service push through the hub. The typed version keeps the compiler checking StatusChanged.',
      },
    ],
    // L5 Clients & streaming
    [
      {
        kind: 'write',
        prompt: 'Connect a .NET client to the auction hub, print each NewBid, then bid.',
        starter: '',
        solution:
          'var connection = new HubConnectionBuilder()\n    .WithUrl("https://localhost:5001/auction")\n    .WithAutomaticReconnect()\n    .Build();\nconnection.On<string, decimal>("NewBid", (bidder, amount) =>\n    Console.WriteLine($"{bidder} bid {amount}"));\nawait connection.StartAsync();\nawait connection.InvokeAsync("Bid", "Ana", 120m);',
        checks: [
          { label: 'Build a connection with new HubConnectionBuilder()', re: 'new\\s+HubConnectionBuilder\\(\\)' },
          { label: 'Point it at the hub with .WithUrl', re: '\\.WithUrl\\(\\s*"https?://[^"]+"\\s*\\)' },
          { label: 'Turn on .WithAutomaticReconnect()', has: '.WithAutomaticReconnect()' },
          { label: 'Handle "NewBid" with On<…> before connecting', re: '\\.On<[^>]+>\\(\\s*"NewBid"[\\s\\S]*StartAsync\\(\\)' },
          { label: 'await StartAsync, then InvokeAsync("Bid", …)', re: 'await\\s+\\w+\\.StartAsync\\(\\)[\\s\\S]*await\\s+\\w+\\.InvokeAsync\\(\\s*"Bid"\\s*,' },
        ],
        hint: 'Register handlers with On before StartAsync so no message is missed.',
        explain: 'The hub broadcasts to everyone, including you, so your own bid comes back through the NewBid handler.',
        output: 'Ana bid 120',
      },
      {
        kind: 'write',
        prompt: 'Stream a launch countdown from the hub and print it on the client.',
        starter:
          'public class LaunchHub : Hub\n{\n    // Countdown(from): yield from, from - 1, ... 1, one per second\n}\n\n// client, after StartAsync: print each number from Countdown(3)\n',
        solution:
          'public class LaunchHub : Hub\n{\n    public async IAsyncEnumerable<int> Countdown(int from,\n        [EnumeratorCancellation] CancellationToken cancellationToken)\n    {\n        for (var i = from; i > 0; i--)\n        {\n            yield return i;\n            await Task.Delay(1000, cancellationToken);\n        }\n    }\n}\n\n// client, after StartAsync: print each number from Countdown(3)\nawait foreach (var n in connection.StreamAsync<int>("Countdown", 3))\n    Console.WriteLine(n);',
        checks: [
          { label: 'A hub method returning IAsyncEnumerable<int>', re: 'public\\s+async\\s+IAsyncEnumerable<\\s*int\\s*>\\s+\\w+\\s*\\(' },
          { label: 'yield return each number', re: 'yield\\s+return\\s+\\w+' },
          { label: 'Wait a second between numbers', re: 'await\\s+Task\\.Delay\\(\\s*(1000|TimeSpan\\.FromSeconds\\(\\s*1\\s*\\))' },
          { label: 'Read it with await foreach over StreamAsync<int>', re: 'await\\s+foreach\\s*\\(\\s*var\\s+\\w+\\s+in\\s+\\w+\\.StreamAsync<\\s*int\\s*>\\(\\s*"\\w+"\\s*,\\s*3\\s*\\)\\s*\\)' },
          { label: 'Print each item', re: 'Console\\.WriteLine\\(' },
        ],
        hint: 'Streams are async iterators: yield return on the server, await foreach on the client.',
        explain: 'Each yield return goes out as soon as it’s produced, so the client prints 3, 2, 1 a second apart instead of all at the end.',
        output: '3\n2\n1',
      },
    ],
  ],
};

export default unit;
