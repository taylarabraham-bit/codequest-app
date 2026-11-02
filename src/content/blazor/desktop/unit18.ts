import type { DesktopUnit } from '../../../engine/types';

// Desktop edition: write-the-code challenges for Blazor unit 18 (Real-time Blazor).
// lessons[i] runs after lesson i + 1. See docs/CONTENT_GUIDE.md.
const unit: DesktopUnit = {
  lessons: [
    // L1 A hub client in a component
    [
      {
        kind: 'write',
        prompt: 'Connect the auction page to the /bids hub when it starts.',
        starter: '@page "/auction"\n',
        solution: `@page "/auction"
@rendermode InteractiveWebAssembly
@using Microsoft.AspNetCore.SignalR.Client
@inject NavigationManager Navigation

<h1>Live auction</h1>

@code {
    private HubConnection? hub;

    protected override async Task OnInitializedAsync()
    {
        hub = new HubConnectionBuilder()
            .WithUrl(Navigation.ToAbsoluteUri("/bids"))
            .Build();
        await hub.StartAsync();
    }
}`,
        checks: [
          { label: 'An interactive @rendermode', re: String.raw`@rendermode\s+Interactive(Server|WebAssembly|Auto)\b` },
          { label: '@inject NavigationManager', re: String.raw`@inject\s+NavigationManager\s+\w+` },
          { label: 'A HubConnection? field', re: String.raw`HubConnection\??\s+\w+\s*;` },
          { label: 'new HubConnectionBuilder().WithUrl(….ToAbsoluteUri("/bids"))', re: String.raw`new\s+HubConnectionBuilder\(\)\s*\.WithUrl\(\s*\w+\.ToAbsoluteUri\(\s*"/bids"\s*\)\s*\)` },
          { label: 'Build() and await StartAsync() in OnInitializedAsync', re: String.raw`OnInitializedAsync\(\)[\s\S]*\.Build\(\)[\s\S]*await\s+\w+\.StartAsync\(\)` },
        ],
        hint: 'Build the connection with the builder, then await StartAsync. ToAbsoluteUri turns "/bids" into a full URL.',
        explain: 'The component owns its own connection; an interactive render mode keeps it alive to receive bids.',
      },
      {
        kind: 'write',
        prompt: 'Fix the tracker so the connection works on any host and really starts.',
        starter: `@page "/tracker"
@using Microsoft.AspNetCore.SignalR.Client

<h1>Delivery tracker</h1>

@code {
    private HubConnection? hub;

    protected override void OnInitialized()
    {
        hub = new HubConnectionBuilder()
            .WithUrl("https://localhost:7180/deliveries")
            .Build();
        hub.StartAsync();
    }
}`,
        solution: `@page "/tracker"
@rendermode InteractiveServer
@using Microsoft.AspNetCore.SignalR.Client
@inject NavigationManager Navigation

<h1>Delivery tracker</h1>

@code {
    private HubConnection? hub;

    protected override async Task OnInitializedAsync()
    {
        hub = new HubConnectionBuilder()
            .WithUrl(Navigation.ToAbsoluteUri("/deliveries"))
            .Build();
        await hub.StartAsync();
    }
}`,
        checks: [
          { label: 'Add an interactive @rendermode', re: String.raw`@rendermode\s+Interactive(Server|WebAssembly|Auto)\b` },
          { label: 'Use ToAbsoluteUri("/deliveries")', re: String.raw`\.WithUrl\(\s*\w+\.ToAbsoluteUri\(\s*"/deliveries"\s*\)\s*\)` },
          { label: 'No hard-coded localhost URL', not: 'https://localhost' },
          { label: 'Switch to async OnInitializedAsync', re: String.raw`override\s+async\s+Task\s+OnInitializedAsync\(\)` },
          { label: 'await hub.StartAsync()', re: String.raw`await\s+hub\.StartAsync\(\)` },
        ],
        hint: 'Inject NavigationManager for the URL, and make the lifecycle method async so you can await.',
        explain: 'A hard-coded port breaks once deployed, and an un-awaited StartAsync hides errors and races later calls.',
      },
    ],
    // L2 Handlers and cleanup
    [
      {
        kind: 'write',
        prompt: 'Show the live queue length whenever the hub sends QueueLength.',
        starter: `@inject NavigationManager Navigation
<p>@waiting people waiting</p>

@code {
    private HubConnection? hub;
    private int waiting;

    protected override async Task OnInitializedAsync()
    {
        hub = new HubConnectionBuilder()
            .WithUrl(Navigation.ToAbsoluteUri("/queue"))
            .Build();
        await hub.StartAsync();
    }
}`,
        solution: `@inject NavigationManager Navigation
<p>@waiting people waiting</p>

@code {
    private HubConnection? hub;
    private int waiting;

    protected override async Task OnInitializedAsync()
    {
        hub = new HubConnectionBuilder()
            .WithUrl(Navigation.ToAbsoluteUri("/queue"))
            .Build();
        hub.On<int>("QueueLength", count =>
        {
            waiting = count;
            InvokeAsync(StateHasChanged);
        });
        await hub.StartAsync();
    }
}`,
        checks: [
          { label: 'hub.On<int>("QueueLength", …)', re: String.raw`hub\.On<int>\(\s*"QueueLength"\s*,` },
          { label: 'Store the value in waiting', re: String.raw`On<int>[\s\S]*waiting\s*=\s*\w+` },
          { label: 'Re-render with InvokeAsync(StateHasChanged)', re: String.raw`InvokeAsync\(\s*StateHasChanged\s*\)` },
          { label: 'Register the handler before StartAsync', re: String.raw`\.On<int>[\s\S]*StartAsync\(\)` },
        ],
        hint: 'On<int> takes the message name and a lambda that receives the int.',
        explain: 'The handler runs outside Blazor’s event system, so InvokeAsync(StateHasChanged) asks for a render on the right thread.',
      },
      {
        kind: 'write',
        prompt: 'Handle PriceChanged(symbol, price) and dispose the connection when the page closes.',
        starter: `@inject NavigationManager Navigation
<p>@symbol: @price</p>

@code {
    private HubConnection? hub;
    private string symbol = "";
    private decimal price;

    protected override async Task OnInitializedAsync()
    {
        hub = new HubConnectionBuilder().WithUrl(Navigation.ToAbsoluteUri("/prices")).Build();
        await hub.StartAsync();
    }
}`,
        solution: `@implements IAsyncDisposable
@inject NavigationManager Navigation

<p>@symbol: @price</p>

@code {
    private HubConnection? hub;
    private string symbol = "";
    private decimal price;

    protected override async Task OnInitializedAsync()
    {
        hub = new HubConnectionBuilder().WithUrl(Navigation.ToAbsoluteUri("/prices")).Build();
        hub.On<string, decimal>("PriceChanged", (s, p) =>
        {
            (symbol, price) = (s, p);
            InvokeAsync(StateHasChanged);
        });
        await hub.StartAsync();
    }

    public async ValueTask DisposeAsync() { if (hub is not null) await hub.DisposeAsync(); }
}`,
        checks: [
          { label: 'hub.On<string, decimal>("PriceChanged", …)', re: String.raw`\.On<string,\s*decimal>\(\s*"PriceChanged"\s*,` },
          { label: 'InvokeAsync(StateHasChanged) in the handler', re: String.raw`On<string[\s\S]*InvokeAsync\(\s*StateHasChanged\s*\)` },
          { label: '@implements IAsyncDisposable', re: String.raw`@implements\s+IAsyncDisposable` },
          { label: 'public async ValueTask DisposeAsync()', re: String.raw`public\s+async\s+ValueTask\s+DisposeAsync\(\)` },
          { label: 'await hub.DisposeAsync() in it', re: String.raw`DisposeAsync\(\)[\s\S]*await\s+hub[?!]?\.DisposeAsync\(\)` },
        ],
        hint: 'On<T1, T2> takes a two-argument lambda. DisposeAsync should check hub for null first.',
        explain: 'Without disposal, every visit leaves another open connection behind, still firing handlers on a dead component.',
      },
    ],
    // L3 A live chat
    [
      {
        kind: 'write',
        prompt: 'Finish Send: send the user and draft to SendMessage, then clear the box.',
        starter: `<input @bind="draft" />
<button @onclick="Send">Send</button>

@code {
    private HubConnection? hub;
    private string user = "Zoe";
    private string draft = "";

    async Task Send()
    {
    }
}`,
        solution: `<input @bind="draft" />
<button @onclick="Send">Send</button>

@code {
    private HubConnection? hub;
    private string user = "Zoe";
    private string draft = "";

    async Task Send()
    {
        if (hub is null || draft == "") return;
        await hub.SendAsync("SendMessage", user, draft);
        draft = "";
    }
}`,
        checks: [
          { label: 'Skip when hub is null', re: String.raw`hub\s+is\s+null|hub\s*==\s*null|hub\s+is\s+not\s+null|hub\s*!=\s*null` },
          { label: 'await hub.SendAsync("SendMessage", user, draft)', re: String.raw`await\s+hub!?\.SendAsync\(\s*"SendMessage"\s*,\s*user\s*,\s*draft\s*\)` },
          { label: 'Clear the draft afterwards', re: String.raw`SendAsync[\s\S]*draft\s*=\s*(""|string\.Empty)` },
        ],
        hint: 'SendAsync takes the hub method name, then its arguments in order.',
        explain: 'SendAsync returns once the message is on its way; clearing draft after it keeps the text if sending throws.',
      },
      {
        kind: 'write',
        prompt: 'Show incoming messages, and disable Send unless the hub is connected.',
        starter: `@inject NavigationManager Navigation
@foreach (var line in messages)
{
    <p>@line</p>
}
<button @onclick="Send">Send</button>

@code {
    private HubConnection? hub;
    private List<string> messages = [];

    protected override async Task OnInitializedAsync()
    {
        hub = new HubConnectionBuilder().WithUrl(Navigation.ToAbsoluteUri("/chat")).Build();
        await hub.StartAsync();
    }
}`,
        solution: `@inject NavigationManager Navigation
@foreach (var line in messages)
{
    <p>@line</p>
}
<button @onclick="Send" disabled="@(!IsConnected)">Send</button>

@code {
    private HubConnection? hub;
    private List<string> messages = [];
    private bool IsConnected => hub?.State == HubConnectionState.Connected;

    protected override async Task OnInitializedAsync()
    {
        hub = new HubConnectionBuilder().WithUrl(Navigation.ToAbsoluteUri("/chat")).Build();
        hub.On<string, string>("ReceiveMessage", (user, text) =>
        {
            messages.Add($"{user}: {text}");
            InvokeAsync(StateHasChanged);
        });
        await hub.StartAsync();
    }
}`,
        checks: [
          { label: 'hub.On<string, string>("ReceiveMessage", …)', re: String.raw`\.On<string,\s*string>\(\s*"ReceiveMessage"\s*,` },
          { label: 'Add each message to the list', re: String.raw`messages\.Add\(` },
          { label: 'Re-render with InvokeAsync(StateHasChanged)', re: String.raw`InvokeAsync\(\s*StateHasChanged\s*\)` },
          { label: 'Compare hub.State with HubConnectionState.Connected', re: String.raw`hub[?!]?\.State\s*(==|!=)\s*HubConnectionState\.Connected` },
          { label: 'Bind the button’s disabled to it', re: String.raw`<button[^<]*disabled="@\(?[^"]+"` },
        ],
        hint: 'A small IsConnected property reads hub?.State; disabled="@(!IsConnected)" uses it.',
        explain: 'Sending while disconnected throws, so the button only enables once the connection is live.',
      },
    ],
    // L4 Reconnect state in the UI
    [
      {
        kind: 'write',
        prompt: 'Retry dropped connections and show Reconnecting… until it’s back.',
        starter: `@inject NavigationManager Navigation
<p>@status</p>

@code {
    private HubConnection? hub;
    private string status = "";

    protected override async Task OnInitializedAsync()
    {
        hub = new HubConnectionBuilder().WithUrl(Navigation.ToAbsoluteUri("/scores")).Build();
        await hub.StartAsync();
    }
}`,
        solution: `@inject NavigationManager Navigation
<p>@status</p>

@code {
    private HubConnection? hub;
    private string status = "";

    protected override async Task OnInitializedAsync()
    {
        hub = new HubConnectionBuilder().WithUrl(Navigation.ToAbsoluteUri("/scores"))
            .WithAutomaticReconnect().Build();
        hub.Reconnecting += error =>
        {
            status = "Reconnecting…";
            return InvokeAsync(StateHasChanged);
        };
        hub.Reconnected += id =>
        {
            status = "";
            return InvokeAsync(StateHasChanged);
        };
        await hub.StartAsync();
    }
}`,
        checks: [
          { label: 'Add .WithAutomaticReconnect() before Build()', re: String.raw`\.WithAutomaticReconnect\([^)]*\)[\s\S]*\.Build\(\)` },
          { label: 'A Reconnecting handler that sets the status', re: String.raw`Reconnecting\s*\+=\s*\(?\w*\)?\s*=>\s*\{[^}]*status\s*=` },
          { label: 'A Reconnected handler that clears it', re: String.raw`Reconnected\s*\+=\s*\(?\w*\)?\s*=>\s*\{[^}]*status\s*=\s*(""|string\.Empty)` },
          { label: 'Each handler returns InvokeAsync(StateHasChanged)', re: String.raw`(return\s+InvokeAsync\(\s*StateHasChanged\s*\)[\s\S]*){2}` },
        ],
        hint: 'The events take a lambda that returns a Task, so end each one with return InvokeAsync(StateHasChanged);',
        explain: 'Automatic reconnect retries a few times; the events let the UI say what’s happening instead of freezing.',
      },
      {
        kind: 'write',
        prompt: 'When the connection closes for good, show a banner with a Retry button.',
        starter: `@inject NavigationManager Navigation
@code {
    private HubConnection? hub;
    private bool closed;

    protected override async Task OnInitializedAsync()
    {
        hub = new HubConnectionBuilder().WithUrl(Navigation.ToAbsoluteUri("/orders"))
            .WithAutomaticReconnect().Build();
        await hub.StartAsync();
    }
}`,
        solution: `@inject NavigationManager Navigation
@if (closed)
{
    <div class="banner">Connection lost. <button @onclick="Retry">Retry</button></div>
}

@code {
    private HubConnection? hub;
    private bool closed;

    protected override async Task OnInitializedAsync()
    {
        hub = new HubConnectionBuilder().WithUrl(Navigation.ToAbsoluteUri("/orders"))
            .WithAutomaticReconnect().Build();
        hub.Closed += error =>
        {
            closed = true;
            return InvokeAsync(StateHasChanged);
        };
        await hub.StartAsync();
    }

    async Task Retry() { await hub!.StartAsync(); closed = false; }
}`,
        checks: [
          { label: 'A Closed handler that sets closed = true', re: String.raw`Closed\s*\+=\s*\(?\w*\)?\s*=>\s*\{[^}]*closed\s*=\s*true` },
          { label: 'It returns InvokeAsync(StateHasChanged)', re: String.raw`Closed[\s\S]*return\s+InvokeAsync\(\s*StateHasChanged\s*\)` },
          { label: 'A banner shown @if (closed)', re: String.raw`@if\s*\(\s*closed\s*\)\s*\{[\s\S]*<(div|p|section)\b` },
          { label: 'A Retry button that calls StartAsync again', re: String.raw`<button[^<]*@onclick="@?(\w+)"[\s\S]*Task\s+\1\(\)\s*\{[^}]*StartAsync\(\)` },
          { label: 'Hide the banner after reconnecting', re: String.raw`StartAsync\(\);\s*closed\s*=\s*false` },
        ],
        hint: 'Closed fires once automatic reconnect gives up; starting again is just another StartAsync.',
        explain: 'After Closed the connection stays down, so the user gets an explicit way to try again.',
      },
    ],
    // L5 Server push & timers
    [
      {
        kind: 'write',
        prompt: 'Write an AlertBoard service that raises an event, and register it once for everyone.',
        starter: '',
        solution: `public class AlertBoard
{
    public event Action<string>? AlertRaised;
    public void Raise(string message) => AlertRaised?.Invoke(message);
}

// Program.cs
builder.Services.AddSingleton<AlertBoard>();`,
        checks: [
          { label: 'A public class AlertBoard', re: String.raw`public\s+class\s+AlertBoard\b` },
          { label: 'A public event Action<string>?', re: String.raw`public\s+event\s+Action<string>\?\s+(\w+)\s*;` },
          { label: 'A method that invokes it with ?.Invoke', re: String.raw`public\s+event\s+Action<string>\?\s+(\w+)[\s\S]*\b\1\?\.Invoke\(` },
          { label: 'Register it with AddSingleton<AlertBoard>()', has: 'builder.Services.AddSingleton<AlertBoard>()' },
        ],
        hint: 'An event field plus a method that fires it. A singleton is shared by every circuit.',
        explain: 'With Interactive Server, all circuits live in one process, so one singleton event reaches every open page.',
      },
      {
        kind: 'write',
        prompt: 'Count down from 60 with a PeriodicTimer, and stop it when the page closes.',
        starter: `@rendermode InteractiveServer
@implements IDisposable

<p>@secondsLeft s left</p>

@code {
    private int secondsLeft = 60;
}`,
        solution: `@rendermode InteractiveServer
@implements IDisposable

<p>@secondsLeft s left</p>

@code {
    private int secondsLeft = 60;
    private readonly PeriodicTimer timer = new(TimeSpan.FromSeconds(1));

    protected override void OnInitialized() => _ = TickAsync();

    private async Task TickAsync()
    {
        while (secondsLeft > 0 && await timer.WaitForNextTickAsync())
        {
            secondsLeft--;
            await InvokeAsync(StateHasChanged);
        }
    }

    public void Dispose() => timer.Dispose();
}`,
        checks: [
          { label: 'A PeriodicTimer that ticks every second', re: String.raw`PeriodicTimer\b[^;]*\(\s*TimeSpan\.FromSeconds\(\s*1\s*\)\s*\)` },
          { label: 'Loop while await timer.WaitForNextTickAsync(…)', re: String.raw`while\s*\([^)]*await\s+\w+\.WaitForNextTickAsync\(` },
          { label: 'Count down and InvokeAsync(StateHasChanged)', re: String.raw`secondsLeft\s*(--|-=\s*1)[\s\S]*InvokeAsync\(\s*StateHasChanged\s*\)` },
          { label: 'Start the loop without blocking the first render', re: String.raw`_\s*=\s*\w+\(\)|_\s*=\s*Task\.Run` },
          { label: 'Dispose() stops the timer (dispose it or cancel its token)', re: String.raw`void\s+Dispose\(\)[\s\S]*\.(Dispose|Cancel)\(\)` },
        ],
        hint: 'Fire-and-forget the loop with _ = TickAsync(); a disposed timer makes WaitForNextTickAsync return false.',
        explain: 'Stopping the timer in Dispose ends the loop; otherwise it would keep ticking for a page nobody is viewing.',
        output: '60 s left',
      },
    ],
  ],
};

export default unit;
