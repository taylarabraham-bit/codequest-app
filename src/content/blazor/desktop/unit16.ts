import type { DesktopUnit } from '../../../engine/types';

// Desktop edition: write-the-code challenges for Blazor unit 16 (WebAssembly & PWAs).
// lessons[i] runs after lesson i + 1. See docs/CONTENT_GUIDE.md.
const unit: DesktopUnit = {
  lessons: [
    // L1 Standalone WebAssembly
    [
      {
        kind: 'write',
        prompt: 'Write Program.cs for a standalone WebAssembly recipe app.',
        starter: `using Microsoft.AspNetCore.Components.Web;
using Microsoft.AspNetCore.Components.WebAssembly.Hosting;
using Recipes;
`,
        solution: `using Microsoft.AspNetCore.Components.Web;
using Microsoft.AspNetCore.Components.WebAssembly.Hosting;
using Recipes;

var builder = WebAssemblyHostBuilder.CreateDefault(args);
builder.RootComponents.Add<App>("#app");
builder.RootComponents.Add<HeadOutlet>("head::after");

builder.Services.AddScoped(sp =>
    new HttpClient { BaseAddress = new Uri(builder.HostEnvironment.BaseAddress) });

await builder.Build().RunAsync();`,
        checks: [
          { label: 'WebAssemblyHostBuilder.CreateDefault(args)', has: 'WebAssemblyHostBuilder.CreateDefault(args)' },
          { label: 'Mount App on #app', re: String.raw`RootComponents\.Add<App>\(\s*"#app"\s*\)` },
          { label: 'An HttpClient with the app’s BaseAddress', re: String.raw`new\s+HttpClient\s*\{\s*BaseAddress\s*=\s*new\s+Uri\(\s*builder\.HostEnvironment\.BaseAddress\s*\)` },
          { label: 'Register it with AddScoped', re: String.raw`AddScoped(<HttpClient>)?\(\s*\w+\s*=>\s*new\s+HttpClient` },
          { label: 'await builder.Build().RunAsync()', has: 'await builder.Build().RunAsync();' },
        ],
        hint: 'CreateDefault, add the root component, register HttpClient, then build and run.',
        explain: 'The app runs in the browser, so its HttpClient points back at the site it was downloaded from.',
      },
      {
        kind: 'write',
        prompt: 'Load trails from wwwroot/data/trails.json and list them.',
        starter: `@page "/trails"

<h1>Trails</h1>

@code {
    record Trail(string Name, double Km);
}`,
        solution: `@page "/trails"
@inject HttpClient Http

<h1>Trails</h1>

@if (trails is null)
{
    <p>Loading…</p>
}
else
{
    @foreach (var trail in trails)
    {
        <p>@trail.Name (@trail.Km km)</p>
    }
}

@code {
    record Trail(string Name, double Km);
    Trail[]? trails;

    protected override async Task OnInitializedAsync() =>
        trails = await Http.GetFromJsonAsync<Trail[]>("data/trails.json");
}`,
        checks: [
          { label: '@inject HttpClient', re: String.raw`@inject\s+HttpClient\s+\w+` },
          { label: 'Load in OnInitializedAsync', re: String.raw`override\s+async\s+Task\s+OnInitializedAsync\(\)` },
          {
            label: 'GetFromJsonAsync with the relative path data/trails.json',
            re: String.raw`GetFromJsonAsync<(Trail\[\]|List<Trail>|IReadOnlyList<Trail>)>\(\s*"data/trails\.json"`,
          },
          { label: 'Show Loading… until the data arrives', re: String.raw`@if\s*\(\s*\w+\s*(is\s+null|==\s*null)\s*\)` },
          { label: 'Loop over the trails', re: String.raw`foreach\s*\(\s*var\s+\w+\s+in\s+\w+\s*\)` },
        ],
        hint: 'No leading slash: the path is relative to the HttpClient’s BaseAddress, the app’s own folder.',
        explain: 'Static JSON in wwwroot is served with the app, so a standalone app can load it with no server code at all.',
      },
    ],
    // L2 Lazy loading
    [
      {
        kind: 'write',
        prompt: 'Mark Charts.wasm and Exports.wasm to download only when needed.',
        starter: '<!-- Budget.csproj -->\n',
        solution: `<!-- Budget.csproj -->
<ItemGroup>
  <BlazorWebAssemblyLazyLoad Include="Charts.wasm" />
  <BlazorWebAssemblyLazyLoad Include="Exports.wasm" />
</ItemGroup>`,
        checks: [
          { label: 'An <ItemGroup> wraps them', re: String.raw`<ItemGroup>[\s\S]*BlazorWebAssemblyLazyLoad[\s\S]*</ItemGroup>` },
          { label: 'Charts.wasm is lazy-loaded', re: String.raw`<BlazorWebAssemblyLazyLoad\s+Include="Charts\.wasm"\s*/>` },
          { label: 'Exports.wasm is lazy-loaded', re: String.raw`<BlazorWebAssemblyLazyLoad\s+Include="Exports\.wasm"\s*/>` },
        ],
        hint: 'One <BlazorWebAssemblyLazyLoad Include="…" /> item per assembly file.',
        explain: 'Those assemblies leave the startup download; the router must load them before their pages are shown.',
      },
      {
        kind: 'write',
        prompt: 'Load Charts.wasm when the user visits charts, and let the router find its pages.',
        starter: `@using System.Reflection
@using Microsoft.AspNetCore.Components.Routing
@using Microsoft.AspNetCore.Components.WebAssembly.Services
@inject LazyAssemblyLoader AssemblyLoader

<Router AppAssembly="typeof(App).Assembly">
    <Found Context="routeData">
        <RouteView RouteData="routeData" DefaultLayout="typeof(MainLayout)" />
    </Found>
</Router>

@code {
    private List<Assembly> lazyLoadedAssemblies = [];
}`,
        solution: `@using System.Reflection
@using Microsoft.AspNetCore.Components.Routing
@using Microsoft.AspNetCore.Components.WebAssembly.Services
@inject LazyAssemblyLoader AssemblyLoader

<Router AppAssembly="typeof(App).Assembly" AdditionalAssemblies="lazyLoadedAssemblies" OnNavigateAsync="OnNavigateAsync">
    <Found Context="routeData">
        <RouteView RouteData="routeData" DefaultLayout="typeof(MainLayout)" />
    </Found>
</Router>

@code {
    private List<Assembly> lazyLoadedAssemblies = [];

    private async Task OnNavigateAsync(NavigationContext context)
    {
        if (context.Path == "charts")
        {
            var loaded = await AssemblyLoader.LoadAssembliesAsync(["Charts.wasm"]);
            lazyLoadedAssemblies.AddRange(loaded);
        }
    }
}`,
        checks: [
          { label: 'AdditionalAssemblies="lazyLoadedAssemblies" on the Router', re: String.raw`<Router\b[^>]*AdditionalAssemblies="@?lazyLoadedAssemblies"` },
          { label: 'OnNavigateAsync on the Router', re: String.raw`<Router\b[^>]*OnNavigateAsync="@?(\w+)"[\s\S]*Task\s+\1\(\s*NavigationContext\s+\w+\s*\)` },
          { label: 'Check the path is charts', re: String.raw`\w+\.Path\s*==\s*"charts"|"charts"\s*==\s*\w+\.Path|\w+\.Path\.(StartsWith|Equals)\(\s*"charts"` },
          { label: 'Load it with LoadAssembliesAsync', re: String.raw`await\s+AssemblyLoader\.LoadAssembliesAsync\([^;]*"Charts\.wasm"` },
          { label: 'Add the loaded assemblies to the list', re: String.raw`lazyLoadedAssemblies\.AddRange\(` },
        ],
        hint: 'OnNavigateAsync gets a NavigationContext; its Path has no leading slash.',
        explain: 'The router waits for OnNavigateAsync, so Charts.wasm downloads before the router looks for the /charts page in it.',
      },
    ],
    // L3 AOT & trimming
    [
      {
        kind: 'write',
        prompt: 'Turn on AOT for the photo editor, install its workload and publish.',
        starter: '<!-- PhotoEditor.csproj -->\n',
        solution: `<!-- PhotoEditor.csproj -->
<PropertyGroup>
  <RunAOTCompilation>true</RunAOTCompilation>
</PropertyGroup>

dotnet workload install wasm-tools
dotnet publish -c Release`,
        checks: [
          { label: '<RunAOTCompilation>true</RunAOTCompilation> in a PropertyGroup', re: String.raw`<PropertyGroup>\s*<RunAOTCompilation>true</RunAOTCompilation>[\s\S]*</PropertyGroup>` },
          { label: 'dotnet workload install wasm-tools', re: String.raw`dotnet\s+workload\s+install\s+wasm-tools\b` },
          { label: 'dotnet publish in Release', re: String.raw`dotnet\s+publish\b[^\n]*(-c|--configuration)\s+Release` },
        ],
        hint: 'A property goes in a PropertyGroup. AOT needs the wasm-tools workload and only runs on publish.',
        explain: 'dotnet run and build skip AOT; the published app gets the compiled WebAssembly, faster but bigger.',
      },
      {
        kind: 'write',
        prompt: 'Fix the project: AOT as a property, and trimming no longer switched off.',
        starter: `<Project Sdk="Microsoft.NET.Sdk.BlazorWebAssembly">
  <PropertyGroup>
    <TargetFramework>net10.0</TargetFramework>
    <PublishTrimmed>false</PublishTrimmed>
  </PropertyGroup>
  <ItemGroup>
    <RunAOTCompilation>true</RunAOTCompilation>
  </ItemGroup>
</Project>`,
        solution: `<Project Sdk="Microsoft.NET.Sdk.BlazorWebAssembly">
  <PropertyGroup>
    <TargetFramework>net10.0</TargetFramework>
    <RunAOTCompilation>true</RunAOTCompilation>
  </PropertyGroup>
</Project>`,
        checks: [
          { label: 'RunAOTCompilation inside the PropertyGroup', re: String.raw`<PropertyGroup>(?:(?!</PropertyGroup>)[\s\S])*<RunAOTCompilation>true</RunAOTCompilation>` },
          { label: 'Not inside an ItemGroup', re: String.raw`^(?![\s\S]*<ItemGroup>(?:(?!</ItemGroup>)[\s\S])*<RunAOTCompilation>)` },
          { label: 'Remove PublishTrimmed false', not: '<PublishTrimmed>false</PublishTrimmed>' },
          { label: 'Keep net10.0', has: '<TargetFramework>net10.0</TargetFramework>' },
        ],
        hint: 'Settings like RunAOTCompilation are properties; ItemGroup is for lists of files and references.',
        explain: 'Blazor apps are trimmed on publish by default, which cuts unused code and keeps the AOT download smaller.',
      },
    ],
    // L4 Installable PWAs
    [
      {
        kind: 'write',
        prompt: 'Write the manifest so Habit Tracker installs as its own app window.',
        starter: '',
        solution: `{
  "name": "Habit Tracker",
  "short_name": "Habits",
  "start_url": "./",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#2b6cb0",
  "icons": [
    { "src": "icon-192.png", "type": "image/png", "sizes": "192x192" },
    { "src": "icon-512.png", "type": "image/png", "sizes": "512x512" }
  ]
}`,
        checks: [
          { label: '"name": "Habit Tracker"', re: String.raw`"name"\s*:\s*"Habit Tracker"` },
          { label: 'A start_url', re: String.raw`"start_url"\s*:\s*"[^"]*"` },
          { label: '"display": "standalone"', re: String.raw`"display"\s*:\s*"standalone"` },
          { label: 'An icons array with a 512x512 icon', re: String.raw`"icons"\s*:\s*\[[\s\S]*"sizes"\s*:\s*"512x512"[\s\S]*\]` },
        ],
        hint: 'It’s JSON: quoted keys, and icons is an array of { src, type, sizes } objects.',
        explain: 'standalone opens the installed app in its own window without the browser’s address bar.',
      },
      {
        kind: 'write',
        prompt: 'Make index.html installable: link the manifest and register the service worker.',
        starter: `<head>
    <meta charset="utf-8" />
    <title>Habits</title>
    <base href="/" />
</head>
<body>
    <div id="app">Loading…</div>
    <script src="_framework/blazor.webassembly.js"></script>
</body>`,
        solution: `<head>
    <meta charset="utf-8" />
    <title>Habits</title>
    <base href="/" />
    <link href="manifest.webmanifest" rel="manifest" />
    <link rel="apple-touch-icon" sizes="512x512" href="icon-512.png" />
</head>
<body>
    <div id="app">Loading…</div>
    <script src="_framework/blazor.webassembly.js"></script>
    <script>navigator.serviceWorker.register('service-worker.js');</script>
</body>`,
        checks: [
          { label: 'Link manifest.webmanifest with rel="manifest"', re: String.raw`<link(?=[^>]*rel="manifest")(?=[^>]*href="manifest\.webmanifest")` },
          { label: 'An apple-touch-icon link', re: String.raw`<link(?=[^>]*rel="apple-touch-icon")(?=[^>]*href="[^"]+\.png")` },
          { label: 'Register service-worker.js', re: String.raw`navigator\.serviceWorker\.register\(\s*['"]service-worker\.js['"]\s*\)` },
          { label: 'The links go in <head>', re: String.raw`<head>[\s\S]*rel="manifest"[\s\S]*</head>` },
        ],
        hint: 'The manifest and icon are <link>s in head; the worker is registered from a small script.',
        explain: 'The manifest says how the installed app looks, and the service worker is what makes it installable and offline-ready.',
      },
    ],
    // L5 Offline & storage
    [
      {
        kind: 'write',
        prompt: 'Save the notes to localStorage on click and load them on start.',
        starter: `@inject IJSRuntime JS

<textarea @bind="notes"></textarea>
<button @onclick="Save">Save</button>

@code {
    string notes = "";
}`,
        solution: `@inject IJSRuntime JS

<textarea @bind="notes"></textarea>
<button @onclick="Save">Save</button>

@code {
    string notes = "";

    protected override async Task OnInitializedAsync() =>
        notes = await JS.InvokeAsync<string?>("localStorage.getItem", "notes") ?? "";

    async Task Save() =>
        await JS.InvokeVoidAsync("localStorage.setItem", "notes", notes);
}`,
        checks: [
          { label: 'A Save method that calls localStorage.setItem', re: String.raw`Task\s+Save\(\)[\s\S]*InvokeVoidAsync\(\s*"localStorage\.setItem"\s*,\s*"[^"]+"\s*,\s*notes\s*\)` },
          { label: 'Read with InvokeAsync<string?>("localStorage.getItem", …)', re: String.raw`InvokeAsync<string\??>\(\s*"localStorage\.getItem"\s*,\s*"[^"]+"\s*\)` },
          { label: 'Use the same key for both', re: String.raw`setItem"\s*,\s*"([^"]+)"[\s\S]*getItem"\s*,\s*"\1"|getItem"\s*,\s*"([^"]+)"[\s\S]*setItem"\s*,\s*"\2"` },
          { label: 'Fall back to "" when nothing is saved', re: String.raw`\?\?\s*(""|string\.Empty)` },
        ],
        hint: 'getItem returns null for a missing key, so use ?? "".',
        explain: 'localStorage lives in the browser, so the notes survive reloads and work offline with no server.',
      },
      {
        kind: 'write',
        prompt: 'Store the habit list as JSON in localStorage and read it back.',
        starter: `@using System.Text.Json
@inject IJSRuntime JS

@code {
    record Habit(string Name, int Streak);
    List<Habit> habits = [];

    async Task SaveAsync()
    {
    }

    async Task LoadAsync()
    {
    }
}`,
        solution: `@using System.Text.Json
@inject IJSRuntime JS

@code {
    record Habit(string Name, int Streak);
    List<Habit> habits = [];

    async Task SaveAsync()
    {
        var json = JsonSerializer.Serialize(habits);
        await JS.InvokeVoidAsync("localStorage.setItem", "habits", json);
    }

    async Task LoadAsync()
    {
        var json = await JS.InvokeAsync<string?>("localStorage.getItem", "habits");
        if (json is not null)
            habits = JsonSerializer.Deserialize<List<Habit>>(json) ?? [];
    }
}`,
        checks: [
          { label: 'Turn the list into JSON with JsonSerializer.Serialize', re: String.raw`JsonSerializer\.Serialize\(\s*habits\s*\)` },
          { label: 'Save it with localStorage.setItem', re: String.raw`InvokeVoidAsync\(\s*"localStorage\.setItem"` },
          { label: 'Read it with localStorage.getItem', re: String.raw`InvokeAsync<string\??>\(\s*"localStorage\.getItem"` },
          { label: 'Deserialize<List<Habit>> back into habits', re: String.raw`habits\s*=[^;]*JsonSerializer\.Deserialize<List<Habit>>\(` },
          { label: 'Handle nothing saved yet', re: String.raw`is\s+not\s+null|!=\s*null|is\s+null|==\s*null|\?\?` },
        ],
        hint: 'localStorage only holds strings: serialize before setItem, deserialize after getItem.',
        explain: 'JSON turns the list into one string for storage; checking for null covers the first launch.',
      },
    ],
  ],
};

export default unit;
