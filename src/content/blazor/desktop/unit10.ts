import type { DesktopUnit } from '../../../engine/types';

// Desktop edition: write-the-code challenges for Blazor unit 10 (Render modes).
// lessons[i] runs after lesson i + 1. See docs/CONTENT_GUIDE.md.
const unit: DesktopUnit = {
  lessons: [
    // L1 The four modes
    [
      {
        kind: 'write',
        prompt: 'Make a /dice page that runs in the browser and rolls on click.',
        starter: '',
        solution:
          '@page "/dice"\n@rendermode InteractiveWebAssembly\n<p>You rolled @roll</p>\n<button @onclick="Roll">Roll</button>\n@code {\n    int roll = 1;\n    void Roll() => roll = Random.Shared.Next(1, 7);\n}',
        checks: [
          { label: '@page "/dice"', re: '@page\\s+"/dice"' },
          { label: 'Run it with @rendermode InteractiveWebAssembly', has: '@rendermode InteractiveWebAssembly' },
          { label: 'A button with @onclick', re: '<button[^>]*@onclick="[^"]+"' },
          { label: 'Show the roll', re: '<p>[^<]*@\\w+' },
        ],
        hint: 'Pick the mode whose C# runs in the browser itself.',
        explain: 'InteractiveWebAssembly downloads .NET to the browser, so each roll runs locally with no trip to the server.',
        output: 'You rolled 1\nRoll',
      },
      {
        kind: 'write',
        prompt: 'Give each page the best render mode for what its comment says.',
        starter:
          '@* About.razor: text only, no clicks *@\n@page "/about"\n<h1>About us</h1>\n\n@* LiveChat.razor: reads the database on every message *@\n@page "/chat"\n<h1>Chat</h1>\n\n@* Sketch.razor: starts fast, then runs in the browser on later visits *@\n@page "/sketch"\n<h1>Sketch</h1>',
        solution:
          '@* About.razor: text only, no clicks *@\n@page "/about"\n<h1>About us</h1>\n\n@* LiveChat.razor: reads the database on every message *@\n@page "/chat"\n@rendermode InteractiveServer\n<h1>Chat</h1>\n\n@* Sketch.razor: starts fast, then runs in the browser on later visits *@\n@page "/sketch"\n@rendermode InteractiveAuto\n<h1>Sketch</h1>',
        checks: [
          { label: 'About stays static: no @rendermode', re: 'About\\.razor(?:(?!@rendermode|LiveChat\\.razor)[\\s\\S])*LiveChat\\.razor' },
          { label: 'LiveChat runs on the server', re: 'LiveChat\\.razor(?:(?!Sketch\\.razor)[\\s\\S])*@rendermode\\s+InteractiveServer\\b' },
          { label: 'Sketch uses Auto', re: 'Sketch\\.razor[\\s\\S]*@rendermode\\s+InteractiveAuto\\b' },
        ],
        hint: 'Static for no clicks, Server when C# needs the server’s data, Auto for server first and browser later.',
        explain: 'Static SSR is cheapest, Server keeps code next to the database, and Auto avoids a slow first WebAssembly download.',
      },
    ],
    // L2 Enabling render modes
    [
      {
        kind: 'write',
        prompt: 'Set up Program.cs for interactive server components.',
        starter:
          'var builder = WebApplication.CreateBuilder(args);\n\nvar app = builder.Build();\napp.UseAntiforgery();\napp.MapStaticAssets();\n\napp.Run();',
        solution:
          'var builder = WebApplication.CreateBuilder(args);\nbuilder.Services.AddRazorComponents()\n    .AddInteractiveServerComponents();\n\nvar app = builder.Build();\napp.UseAntiforgery();\napp.MapStaticAssets();\napp.MapRazorComponents<App>()\n    .AddInteractiveServerRenderMode();\n\napp.Run();',
        checks: [
          { label: 'AddRazorComponents().AddInteractiveServerComponents()', re: 'builder\\.Services\\.AddRazorComponents\\(\\)\\s*\\.AddInteractiveServerComponents\\(\\)' },
          { label: 'Register services before builder.Build()', re: 'AddInteractiveServerComponents[\\s\\S]*builder\\.Build\\(\\)' },
          { label: 'MapRazorComponents<App>().AddInteractiveServerRenderMode()', re: 'app\\.MapRazorComponents<App>\\(\\)\\s*\\.AddInteractiveServerRenderMode\\(\\)' },
          { label: 'Map them before app.Run()', re: 'AddInteractiveServerRenderMode\\(\\)[\\s\\S]*app\\.Run\\(\\)' },
        ],
        hint: 'Two halves: services on builder.Services, endpoints on app.',
        explain: 'The services half adds the circuit machinery, and the endpoints half maps the SignalR hub components talk through.',
      },
      {
        kind: 'write',
        prompt: 'Add WebAssembly too, so Auto works, and register the Recipes.Client pages.',
        starter:
          'builder.Services.AddRazorComponents()\n    .AddInteractiveServerComponents();\n\nvar app = builder.Build();\napp.UseAntiforgery();\napp.MapStaticAssets();\napp.MapRazorComponents<App>()\n    .AddInteractiveServerRenderMode();',
        solution:
          'builder.Services.AddRazorComponents()\n    .AddInteractiveServerComponents()\n    .AddInteractiveWebAssemblyComponents();\n\nvar app = builder.Build();\napp.UseAntiforgery();\napp.MapStaticAssets();\napp.MapRazorComponents<App>()\n    .AddInteractiveServerRenderMode()\n    .AddInteractiveWebAssemblyRenderMode()\n    .AddAdditionalAssemblies(typeof(Recipes.Client._Imports).Assembly);',
        checks: [
          { label: 'Keep the Server pair', re: 'AddInteractiveServerComponents\\(\\)[\\s\\S]*AddInteractiveServerRenderMode\\(\\)' },
          { label: 'Add .AddInteractiveWebAssemblyComponents()', re: 'AddRazorComponents\\(\\)[^;]*\\.AddInteractiveWebAssemblyComponents\\(\\)' },
          { label: 'Add .AddInteractiveWebAssemblyRenderMode()', re: 'MapRazorComponents<App>\\(\\)[^;]*\\.AddInteractiveWebAssemblyRenderMode\\(\\)' },
          { label: 'AddAdditionalAssemblies for the Recipes.Client project', re: 'MapRazorComponents<App>\\(\\)[^;]*\\.AddAdditionalAssemblies\\(\\s*typeof\\(\\s*Recipes\\.Client\\.\\w+\\s*\\)\\.Assembly\\s*\\)' },
        ],
        hint: 'Auto needs both pairs. Any type in the Client project, like its _Imports, points at its assembly.',
        explain: 'WebAssembly and Auto pages live in the .Client project; AddAdditionalAssemblies lets the server route to them and prerender them.',
      },
    ],
    // L3 Where modes apply
    [
      {
        kind: 'write',
        prompt: 'Keep the report page static, but make its Poll interactive on the server.',
        starter: '@* Pages/Report.razor *@\n@page "/report"\n<h1>Quarterly report</h1>\n',
        solution:
          '@* Pages/Report.razor *@\n@page "/report"\n<h1>Quarterly report</h1>\n<p>Sales grew 12% this quarter.</p>\n<Poll @rendermode="InteractiveServer" Question="Was this useful?" />',
        checks: [
          { label: 'Set the mode on the tag: <Poll @rendermode="InteractiveServer" />', re: '<Poll[^>]*@rendermode="(RenderMode\\.)?InteractiveServer"' },
          { label: 'Pass Poll a Question', re: '<Poll[^>]*\\bQuestion="[^"]+"' },
          { label: 'No @rendermode directive on the page', not: '@rendermode InteractiveServer' },
        ],
        hint: 'As an attribute, @rendermode="…" applies to that one component instance.',
        explain: 'The page stays cheap static HTML, and only the Poll opens a circuit. Question is a string, so it can cross into the interactive child.',
        output: 'Quarterly report\nSales grew 12% this quarter.',
      },
      {
        kind: 'write',
        prompt: 'Make every page interactive on the server from App.razor, then fix the page that breaks.',
        starter:
          '@* App.razor *@\n<!DOCTYPE html>\n<html lang="en">\n<head>\n    <meta charset="utf-8" />\n    <base href="/" />\n    <HeadOutlet />\n</head>\n<body>\n    <Routes />\n    <script src="_framework/blazor.web.js"></script>\n</body>\n</html>\n\n@* Pages/Map.razor *@\n@page "/map"\n@rendermode InteractiveWebAssembly\n<h1>Map</h1>',
        solution:
          '@* App.razor *@\n<!DOCTYPE html>\n<html lang="en">\n<head>\n    <meta charset="utf-8" />\n    <base href="/" />\n    <HeadOutlet @rendermode="InteractiveServer" />\n</head>\n<body>\n    <Routes @rendermode="InteractiveServer" />\n    <script src="_framework/blazor.web.js"></script>\n</body>\n</html>\n\n@* Pages/Map.razor *@\n@page "/map"\n<h1>Map</h1>',
        checks: [
          { label: '<Routes @rendermode="InteractiveServer" />', re: '<Routes\\s+@rendermode="(RenderMode\\.)?InteractiveServer"\\s*/>' },
          { label: '<HeadOutlet @rendermode="InteractiveServer" />', re: '<HeadOutlet\\s+@rendermode="(RenderMode\\.)?InteractiveServer"\\s*/>' },
          { label: 'Map no longer asks for WebAssembly', not: 'InteractiveWebAssembly' },
        ],
        hint: 'A page inside an interactive Routes can’t switch to a different interactive mode.',
        explain: 'Routes passes its mode down to every page. Map would try to change Server to WebAssembly, which throws, so it just inherits.',
      },
    ],
    // L4 Prerendering
    [
      {
        kind: 'write',
        prompt: 'Show where the component runs, and disable Buy until it is interactive.',
        starter: '@rendermode InteractiveServer\n',
        solution:
          '@rendermode InteractiveServer\n<p>Running on: @RendererInfo.Name</p>\n<button disabled="@(!RendererInfo.IsInteractive)" @onclick="Buy">Buy</button>\n<p>@status</p>\n@code {\n    string status = "";\n    void Buy() => status = "Bought!";\n}',
        checks: [
          { label: 'Show @RendererInfo.Name', re: '@\\(?RendererInfo\\.Name' },
          { label: 'disabled="@(!RendererInfo.IsInteractive)" on the button', re: '<button[^>]*disabled="@\\(\\s*!\\s*RendererInfo\\.IsInteractive\\s*\\)"' },
          { label: 'The button has an @onclick', re: '<button[^>]*@onclick="[^"]+"' },
        ],
        hint: 'RendererInfo is available in every component; IsInteractive is false while prerendering.',
        explain: 'The prerendered HTML says Static with a disabled button; once the circuit connects it says Server and Buy works.',
        output: 'Running on: Server\nBuy',
      },
      {
        kind: 'write',
        prompt: 'Prices load twice and crash at first. Skip prerendering and guard for null.',
        starter:
          '@page "/prices"\n@rendermode InteractiveServer\n@inject PriceService Prices\n<p>@prices.Length prices loaded</p>\n@code {\n    decimal[]? prices;\n    protected override async Task OnInitializedAsync()\n    {\n        Console.WriteLine("Fetching prices");\n        prices = await Prices.GetAllAsync();\n    }\n}',
        solution:
          '@page "/prices"\n@rendermode @(new InteractiveServerRenderMode(prerender: false))\n@inject PriceService Prices\n@if (prices is null)\n{\n    <p>Loading…</p>\n}\nelse\n{\n    <p>@prices.Length prices loaded</p>\n}\n@code {\n    decimal[]? prices;\n    protected override async Task OnInitializedAsync()\n    {\n        Console.WriteLine("Fetching prices");\n        prices = await Prices.GetAllAsync();\n    }\n}',
        checks: [
          { label: 'Use new InteractiveServerRenderMode(prerender: false)', re: '@rendermode\\s+@\\(\\s*new\\s+InteractiveServerRenderMode\\(\\s*(prerender:\\s*)?false\\s*\\)\\s*\\)' },
          { label: 'No plain @rendermode InteractiveServer', not: '@rendermode InteractiveServer' },
          { label: 'Show Loading… while prices is null', re: '@if\\s*\\(\\s*prices\\s*(is\\s+null|==\\s*null)\\s*\\)[\\s\\S]*Loading' },
        ],
        hint: 'The mode becomes an object: wrap new InteractiveServerRenderMode(…) in @( ).',
        explain: 'Without prerendering OnInitializedAsync runs once, but the first interactive render still happens before the await finishes.',
      },
    ],
    // L5 Persisting state
    [
      {
        kind: 'write',
        prompt: 'Load the teams once, persisting them across prerendering.',
        starter: '@page "/teams"\n@rendermode InteractiveServer\n@inject TeamApi Api\n',
        solution:
          '@page "/teams"\n@rendermode InteractiveServer\n@inject TeamApi Api\n@if (Teams is null)\n{\n    <p>Loading…</p>\n}\nelse\n{\n    <p>@Teams.Length teams</p>\n}\n@code {\n    [PersistentState]\n    public Team[]? Teams { get; set; }\n\n    protected override async Task OnInitializedAsync() =>\n        Teams ??= await Api.GetAllAsync();\n}',
        checks: [
          { label: 'A public [PersistentState] property', re: '\\[PersistentState\\]\\s*public\\s+[\\w<>\\[\\]]+\\??\\s+\\w+\\s*\\{\\s*get;\\s*set;\\s*\\}' },
          { label: 'Load it in OnInitializedAsync', has: 'protected override async Task OnInitializedAsync()' },
          { label: 'Load only if empty, with ??= await', re: '\\[PersistentState\\]\\s*public\\s+[^\\s]+\\s+(\\w+)[\\s\\S]*\\1\\s*\\?\\?=\\s*await\\s+Api\\.\\w+\\(' },
          { label: 'Guard the markup for null', re: '@if\\s*\\(\\s*\\w+\\s*(is\\s+null|==\\s*null)\\s*\\)' },
        ],
        hint: 'The attribute goes on a public property; ??= skips the fetch when a value was restored.',
        explain: 'The prerender saves Teams into the page, and the interactive run restores it before OnInitializedAsync, so ??= skips the second call.',
      },
      {
        kind: 'write',
        prompt: 'Persisting fails and the week still loads twice. Fix both bugs.',
        starter:
          '@page "/forecast"\n@rendermode InteractiveAuto\n@inject WeatherApi Api\n@if (Days is not null)\n{\n    <ul>\n        @foreach (var d in Days) { <li>@d.Summary</li> }\n    </ul>\n}\n@code {\n    [PersistentState]\n    private Day[]? Days;\n\n    protected override async Task OnInitializedAsync()\n    {\n        Days = await Api.GetWeekAsync();\n    }\n}',
        solution:
          '@page "/forecast"\n@rendermode InteractiveAuto\n@inject WeatherApi Api\n@if (Days is not null)\n{\n    <ul>\n        @foreach (var d in Days) { <li>@d.Summary</li> }\n    </ul>\n}\n@code {\n    [PersistentState]\n    public Day[]? Days { get; set; }\n\n    protected override async Task OnInitializedAsync()\n    {\n        Days ??= await Api.GetWeekAsync();\n    }\n}',
        checks: [
          { label: 'Make Days a public property', re: '\\[PersistentState\\]\\s*public\\s+Day\\[\\]\\?\\s+Days\\s*\\{\\s*get;\\s*set;\\s*\\}' },
          { label: 'No private field Days', not: 'private Day[]? Days;' },
          { label: 'Fetch only when empty: Days ??= await …', re: 'Days\\s*\\?\\?=\\s*await\\s+Api\\.GetWeekAsync\\(\\s*\\)' },
        ],
        hint: '[PersistentState] only works on public properties, and = always fetches again.',
        explain: 'The attribute needs a public property to save and restore; ??= keeps the restored value instead of fetching again.',
      },
    ],
  ],
};

export default unit;
