import type { DesktopUnit } from '../../../engine/types';

// Desktop edition: write-the-code challenges for Blazor unit 8 (State & cascading values).
// lessons[i] runs after lesson i + 1. See docs/CONTENT_GUIDE.md.
const unit: DesktopUnit = {
  lessons: [
    // L1 Cascading values
    [
      {
        kind: 'write',
        prompt: 'Cascade the Player from Game down to a ScoreBadge deep inside Board.',
        starter:
          '@* Game.razor *@\n<Board />\n@code {\n    Player player = new() { Name = "Ivy", Score = 120 };\n}\n\n@* ScoreBadge.razor, somewhere inside Board *@\n',
        solution:
          '@* Game.razor *@\n<CascadingValue Value="player">\n    <Board />\n</CascadingValue>\n@code {\n    Player player = new() { Name = "Ivy", Score = 120 };\n}\n\n@* ScoreBadge.razor, somewhere inside Board *@\n<span>@(Player?.Name): @(Player?.Score)</span>\n@code {\n    [CascadingParameter] private Player? Player { get; set; }\n}',
        checks: [
          { label: 'Wrap <Board /> in <CascadingValue Value="player">', re: '<CascadingValue\\s+Value="player"\\s*>\\s*<Board\\s*/>\\s*</CascadingValue>' },
          { label: 'A [CascadingParameter] of type Player', re: '\\[CascadingParameter\\]\\s*(private\\s+|public\\s+|protected\\s+)?Player\\??\\s+\\w+\\s*\\{\\s*get;\\s*set;' },
          { label: 'Show the player’s name in ScoreBadge', re: 'ScoreBadge[\\s\\S]*@\\(?\\w+\\??\\.Name' },
        ],
        hint: 'The receiver asks by type, so its property must be a Player.',
        explain: 'Board and everything inside it can now receive the player, without passing it through each layer as a parameter.',
        output: 'Ivy: 120',
      },
      {
        kind: 'write',
        prompt: 'Leg shows no units. Receive them from the cascade instead.',
        starter:
          '@* Trip.razor *@\n<CascadingValue Value="units">\n    <TripList />\n</CascadingValue>\n@code {\n    string units = "km";\n}\n\n@* Leg.razor, inside TripList *@\n<li>@Distance @Units</li>\n@code {\n    [Parameter] public double Distance { get; set; }\n    [Parameter] public string? Units { get; set; }\n}',
        solution:
          '@* Trip.razor *@\n<CascadingValue Value="units">\n    <TripList />\n</CascadingValue>\n@code {\n    string units = "km";\n}\n\n@* Leg.razor, inside TripList *@\n<li>@Distance @Units</li>\n@code {\n    [Parameter] public double Distance { get; set; }\n    [CascadingParameter] public string? Units { get; set; }\n}',
        checks: [
          { label: 'Units is a [CascadingParameter] string', re: '\\[CascadingParameter\\]\\s*(private\\s+|public\\s+|protected\\s+)?string\\??\\s+Units\\b' },
          { label: 'Distance stays a normal [Parameter]', re: '\\[Parameter\\]\\s*public\\s+double\\s+Distance\\b' },
          { label: 'No [Parameter] Units left', not: '[Parameter] public string? Units' },
        ],
        hint: 'TripList never passes Units, so [Parameter] stays empty. Which attribute reads a cascade?',
        explain: '[Parameter] only gets what the direct parent sets; [CascadingParameter] gets the nearest ancestor’s cascaded string.',
      },
    ],
    // L2 Named & root cascades
    [
      {
        kind: 'write',
        prompt: 'Cascade a fixed Currency and Language by name, and read both in PriceTag.',
        starter:
          '@* Store.razor *@\n<PriceTag Amount="25" />\n@code {\n    string currency = "EUR", language = "fr";\n}\n\n@* PriceTag.razor *@\n<span>@Amount @Currency (@Language)</span>\n@code {\n    [Parameter] public int Amount { get; set; }\n}',
        solution:
          '@* Store.razor *@\n<CascadingValue Value="currency" Name="Currency" IsFixed="true">\n    <CascadingValue Value="language" Name="Language" IsFixed="true">\n        <PriceTag Amount="25" />\n    </CascadingValue>\n</CascadingValue>\n@code {\n    string currency = "EUR", language = "fr";\n}\n\n@* PriceTag.razor *@\n<span>@Amount @Currency (@Language)</span>\n@code {\n    [Parameter] public int Amount { get; set; }\n    [CascadingParameter(Name = "Currency")] private string? Currency { get; set; }\n    [CascadingParameter(Name = "Language")] private string? Language { get; set; }\n}',
        checks: [
          { label: 'Cascade currency with Name="Currency" and IsFixed', re: '<CascadingValue(?=[^>]*Value="currency")(?=[^>]*Name="Currency")(?=[^>]*IsFixed="true")[^>]*>' },
          { label: 'Cascade language with Name="Language" and IsFixed', re: '<CascadingValue(?=[^>]*Value="language")(?=[^>]*Name="Language")(?=[^>]*IsFixed="true")[^>]*>' },
          { label: '[CascadingParameter(Name = "Currency")]', re: '\\[CascadingParameter\\(\\s*Name\\s*=\\s*"Currency"\\s*\\)\\]\\s*(private\\s+|public\\s+)?string\\??\\s+Currency' },
          { label: '[CascadingParameter(Name = "Language")]', re: '\\[CascadingParameter\\(\\s*Name\\s*=\\s*"Language"\\s*\\)\\]\\s*(private\\s+|public\\s+)?string\\??\\s+Language' },
        ],
        hint: 'Nest one CascadingValue inside the other. Both are strings, so names tell them apart.',
        explain: 'Without names the nearest string would fill both properties. IsFixed tells Blazor these never change, saving work.',
        output: '25 EUR (fr)',
      },
      {
        kind: 'write',
        prompt: 'Replace the CascadingValue with a root cascade, and receive Brand in Header.',
        starter:
          '// Program.cs\nbuilder.Services.AddRazorComponents();\n\n@* Routes.razor *@\n<CascadingValue Value="brand">\n    <Router AppAssembly="typeof(Program).Assembly">\n        <Found Context="routeData">\n            <RouteView RouteData="routeData" />\n        </Found>\n    </Router>\n</CascadingValue>\n@code {\n    Brand brand = new() { Name = "Bloom", Color = "green" };\n}\n\n@* Header.razor *@\n<header>@(Brand?.Name)</header>\n@code {\n}',
        solution:
          '// Program.cs\nbuilder.Services.AddRazorComponents();\nbuilder.Services.AddCascadingValue(sp => new Brand { Name = "Bloom", Color = "green" });\n\n@* Routes.razor *@\n<Router AppAssembly="typeof(Program).Assembly">\n    <Found Context="routeData">\n        <RouteView RouteData="routeData" />\n    </Found>\n</Router>\n\n@* Header.razor *@\n<header>@(Brand?.Name)</header>\n@code {\n    [CascadingParameter] public Brand? Brand { get; set; }\n}',
        checks: [
          { label: 'AddCascadingValue(sp => new Brand { … }) in Program.cs', re: 'builder\\.Services\\.AddCascadingValue\\(\\s*\\w+\\s*=>\\s*new\\s+Brand\\b' },
          { label: 'No <CascadingValue> left in Routes', not: '<CascadingValue' },
          { label: 'Keep the Router', re: '<Router[\\s\\S]*</Router>' },
          { label: 'Header has a [CascadingParameter] Brand', re: '\\[CascadingParameter\\]\\s*(private\\s+|public\\s+)?Brand\\??\\s+Brand\\s*\\{' },
        ],
        hint: 'AddCascadingValue takes a factory lambda, like the other builder.Services calls.',
        explain: 'A root cascade reaches every component, including interactive ones, without wrapping the Router in markup.',
        output: 'Bloom',
      },
    ],
    // L3 State containers
    [
      {
        kind: 'write',
        prompt: 'Write a scoped WishlistState that raises OnChange whenever an item is added.',
        starter: '// WishlistState.cs\n\n\n// Program.cs\n',
        solution:
          '// WishlistState.cs\npublic class WishlistState\n{\n    public List<string> Items { get; } = [];\n    public event Action? OnChange;\n\n    public void Add(string item)\n    {\n        Items.Add(item);\n        OnChange?.Invoke();\n    }\n}\n\n// Program.cs\nbuilder.Services.AddScoped<WishlistState>();',
        checks: [
          { label: 'A WishlistState class with a list of items', re: 'class\\s+WishlistState[\\s\\S]*(List|IList|ICollection)<string>' },
          { label: 'public event Action? OnChange', re: 'public\\s+event\\s+Action\\??\\s+OnChange\\s*;' },
          { label: 'An Add method that raises OnChange', re: 'void\\s+Add\\s*\\(\\s*string\\s+(\\w+)\\s*\\)[\\s\\S]*\\.Add\\(\\s*\\1\\s*\\)[\\s\\S]*OnChange\\?\\.Invoke\\(\\)' },
          { label: 'Register it with AddScoped', has: 'builder.Services.AddScoped<WishlistState>()' },
        ],
        hint: 'Change the list, then OnChange?.Invoke() so listeners hear about it.',
        explain: 'Scoped gives each user’s circuit its own wishlist, and the event lets components know when to redraw.',
      },
      {
        kind: 'write',
        prompt: 'Every shopper shares one wishlist. Fix that, then make Save add the product.',
        starter:
          '// Program.cs\nbuilder.Services.AddSingleton<WishlistState>();\n\n@* ProductCard.razor *@\n@rendermode InteractiveServer\n<h3>@Name</h3>\n<button>Save</button>\n@code {\n    [Parameter] public string Name { get; set; } = "";\n}',
        solution:
          '// Program.cs\nbuilder.Services.AddScoped<WishlistState>();\n\n@* ProductCard.razor *@\n@rendermode InteractiveServer\n@inject WishlistState Wishlist\n<h3>@Name</h3>\n<button @onclick="() => Wishlist.Add(Name)">Save</button>\n@code {\n    [Parameter] public string Name { get; set; } = "";\n}',
        checks: [
          { label: 'Register it with AddScoped', has: 'AddScoped<WishlistState>()' },
          { label: 'No AddSingleton', not: 'AddSingleton<WishlistState>' },
          { label: 'Inject WishlistState in ProductCard', re: '@inject\\s+WishlistState\\s+\\w+' },
          { label: 'Save calls Add(Name) on it', re: '@inject\\s+WishlistState\\s+(\\w+)[\\s\\S]*<button[^>]*@onclick="[^"]*\\1\\.Add\\(\\s*Name\\s*\\)|@inject\\s+WishlistState\\s+(\\w+)[\\s\\S]*@onclick="\\w+"[\\s\\S]*\\2\\.Add\\(\\s*Name\\s*\\)' },
        ],
        hint: 'A singleton is one object for the whole server. Inject the service and call Add from @onclick.',
        explain: 'With AddScoped each circuit gets its own WishlistState, so one shopper’s saves never show up for another.',
        output: 'Save',
      },
    ],
    // L4 Reacting to changes
    [
      {
        kind: 'write',
        prompt: 'Make the badge re-render whenever the wishlist changes, and clean up after.',
        starter: '@inject WishlistState Wishlist\n<span>Saved: @Wishlist.Items.Count</span>\n',
        solution:
          '@implements IDisposable\n@inject WishlistState Wishlist\n<span>Saved: @Wishlist.Items.Count</span>\n@code {\n    protected override void OnInitialized() => Wishlist.OnChange += Refresh;\n    void Refresh() => InvokeAsync(StateHasChanged);\n    public void Dispose() => Wishlist.OnChange -= Refresh;\n}',
        checks: [
          { label: 'Subscribe in OnInitialized with +=', re: 'OnInitialized\\(\\)[\\s\\S]*OnChange\\s*\\+=\\s*\\w+' },
          { label: 'The handler calls InvokeAsync(StateHasChanged)', has: 'InvokeAsync(StateHasChanged)' },
          { label: '@implements IDisposable', has: '@implements IDisposable' },
          { label: 'Unsubscribe the same handler with -= in Dispose', re: 'OnChange\\s*\\+=\\s*(\\w+)[\\s\\S]*void\\s+Dispose\\s*\\(\\s*\\)[\\s\\S]*OnChange\\s*-=\\s*\\1\\b' },
        ],
        hint: 'Use a named method, so the same one can be removed with -= later.',
        explain: 'The service outlives the badge. Without -= it would keep calling a component that’s gone.',
        output: 'Saved: 0',
      },
      {
        kind: 'write',
        prompt: 'This leaks and can throw off-thread. Use a named handler and unsubscribe.',
        starter:
          '@inject ScoreBoard Board\n<p>Top score: @Board.Top</p>\n@code {\n    protected override void OnInitialized()\n    {\n        Board.OnChange += () => StateHasChanged();\n    }\n}',
        solution:
          '@implements IDisposable\n@inject ScoreBoard Board\n<p>Top score: @Board.Top</p>\n@code {\n    protected override void OnInitialized()\n    {\n        Board.OnChange += Refresh;\n    }\n    void Refresh() => InvokeAsync(StateHasChanged);\n    public void Dispose() => Board.OnChange -= Refresh;\n}',
        checks: [
          { label: 'No anonymous lambda subscription', not: '+= () =>' },
          { label: 'Subscribe a named method', re: 'OnChange\\s*\\+=\\s*\\w+\\s*;' },
          { label: 'Refresh with InvokeAsync(StateHasChanged)', has: 'InvokeAsync(StateHasChanged)' },
          { label: '@implements IDisposable and -= in Dispose', re: '@implements\\s+IDisposable[\\s\\S]*void\\s+Dispose\\s*\\(\\s*\\)[\\s\\S]*OnChange\\s*-=' },
        ],
        hint: 'A lambda can’t be removed later. The event fires on whatever thread changed the board.',
        explain: 'InvokeAsync moves the re-render onto the component’s own context, and -= stops the board holding on to a dead component.',
      },
    ],
    // L5 Browser storage
    [
      {
        kind: 'write',
        prompt: 'Save the chosen theme to ProtectedLocalStorage every time it changes.',
        starter:
          '@rendermode InteractiveServer\n<select @bind="theme">\n    <option value="light">Light</option>\n    <option value="dark">Dark</option>\n</select>\n@code {\n    string theme = "light";\n}',
        solution:
          '@rendermode InteractiveServer\n@using Microsoft.AspNetCore.Components.Server.ProtectedBrowserStorage\n@inject ProtectedLocalStorage Store\n<select @bind="theme" @bind:after="Save">\n    <option value="light">Light</option>\n    <option value="dark">Dark</option>\n</select>\n@code {\n    string theme = "light";\n    async Task Save() => await Store.SetAsync("theme", theme);\n}',
        checks: [
          { label: '@using …Server.ProtectedBrowserStorage', has: '@using Microsoft.AspNetCore.Components.Server.ProtectedBrowserStorage' },
          { label: 'Inject ProtectedLocalStorage', re: '@inject\\s+ProtectedLocalStorage\\s+\\w+' },
          { label: 'await SetAsync with a key and the theme', re: '@inject\\s+ProtectedLocalStorage\\s+(\\w+)[\\s\\S]*await\\s+\\1\\.SetAsync\\(\\s*"[^"]+"\\s*,\\s*theme\\s*\\)' },
          { label: 'Save after each change with @bind:after', re: '<select[^>]*@bind:after="\\w+"' },
        ],
        hint: '@bind:after runs a method once theme holds the new value.',
        explain: 'Local storage survives closing the browser, and the protected version encrypts the value so users can’t tamper with it.',
        output: 'Light',
      },
      {
        kind: 'write',
        prompt: 'This throws while prerendering. Load the saved step after the first render.',
        starter:
          '@rendermode InteractiveServer\n@using Microsoft.AspNetCore.Components.Server.ProtectedBrowserStorage\n@inject ProtectedSessionStorage Store\n<p>Step @step of 5</p>\n@code {\n    int step = 1;\n    protected override async Task OnInitializedAsync()\n    {\n        var result = await Store.GetAsync<int>("step");\n        step = result.Value;\n    }\n}',
        solution:
          '@rendermode InteractiveServer\n@using Microsoft.AspNetCore.Components.Server.ProtectedBrowserStorage\n@inject ProtectedSessionStorage Store\n<p>Step @step of 5</p>\n@code {\n    int step = 1;\n    protected override async Task OnAfterRenderAsync(bool firstRender)\n    {\n        if (!firstRender) return;\n        var result = await Store.GetAsync<int>("step");\n        if (result.Success)\n        {\n            step = result.Value;\n            StateHasChanged();\n        }\n    }\n}',
        checks: [
          { label: 'Use OnAfterRenderAsync(bool firstRender)', has: 'protected override async Task OnAfterRenderAsync(bool firstRender)' },
          { label: 'No storage call in OnInitializedAsync', not: 'OnInitializedAsync' },
          { label: 'Only on the first render', re: 'if\\s*\\(\\s*!?\\s*firstRender\\s*\\)' },
          { label: 'Check result.Success', re: '\\w+\\.Success\\b' },
          { label: 'Call StateHasChanged() to show it', has: 'StateHasChanged()' },
        ],
        hint: 'Storage lives in the browser, which only exists after rendering. Changing a field there needs a manual refresh.',
        explain: 'During prerendering there’s no browser to ask. OnAfterRenderAsync runs once it’s connected, and StateHasChanged shows the loaded step.',
        output: 'Step 1 of 5',
      },
    ],
  ],
};

export default unit;
