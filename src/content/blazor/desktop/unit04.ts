import type { DesktopUnit } from '../../../engine/types';

// Desktop edition: write-the-code challenges for Blazor unit 4 (Lifecycle methods).
// lessons[i] runs after lesson i + 1. See docs/CONTENT_GUIDE.md.
const unit: DesktopUnit = {
  lessons: [
    // L1 Setting up state
    [
      {
        kind: 'write',
        prompt: 'Set the game title and starting coins in OnInitialized, then show them.',
        starter: '',
        solution:
          '<h2>@title</h2>\n<p>Coins: @coins</p>\n@code {\n    string title = "";\n    int coins;\n    protected override void OnInitialized()\n    {\n        title = "Treasure Hunt";\n        coins = 50;\n    }\n}',
        checks: [
          { label: 'Override OnInitialized', has: 'protected override void OnInitialized()' },
          { label: 'Give a string field its value there', re: 'OnInitialized\\(\\)[\\s\\S]*\\w+\\s*=\\s*"[^"]+"' },
          { label: 'Give an int field its value there', re: 'OnInitialized\\(\\)[\\s\\S]*\\w+\\s*=\\s*\\d+' },
          { label: 'Render both fields', re: '@(?!code\\b)\\w+[\\s\\S]*@(?!code\\b)\\w+[\\s\\S]*@code' },
        ],
        hint: 'Declare the fields, then assign them inside protected override void OnInitialized().',
        explain: 'OnInitialized runs once before the first render, so the page never shows the empty starting values.',
        output: 'Treasure Hunt\nCoins: 50',
      },
      {
        kind: 'write',
        prompt: 'OnInitialized never runs. Fix it so the page shows 3 tasks, 1 done.',
        starter:
          '<p>@count tasks, @done done</p>\n@code {\n    string[] tasks = ["Pack", "Book hotel", "Print tickets"];\n    bool[] finished = [true, false, false];\n    int count, done;\n    public void OnInitialized()\n    {\n    }\n}',
        solution:
          '<p>@count tasks, @done done</p>\n@code {\n    string[] tasks = ["Pack", "Book hotel", "Print tickets"];\n    bool[] finished = [true, false, false];\n    int count, done;\n    protected override void OnInitialized()\n    {\n        count = tasks.Length;\n        done = finished.Count(f => f);\n    }\n}',
        checks: [
          { label: 'Use protected override void OnInitialized()', has: 'protected override void OnInitialized()' },
          { label: 'No public void OnInitialized', not: 'public void OnInitialized' },
          { label: 'Set count from the tasks array', re: 'count\\s*=\\s*tasks\\.(Length|Count\\(\\s*\\))' },
          { label: 'Work out done from finished', re: 'done\\s*=[^;]*finished|done\\s*\\+\\+|done\\s*\\+=' },
        ],
        hint: 'Without override, your method just hides the real one and Blazor never calls it.',
        explain: 'Blazor calls the base class’s OnInitialized; only an override replaces it. Count(f => f) counts the true values.',
        output: '3 tasks, 1 done',
      },
    ],
    // L2 Async loading
    [
      {
        kind: 'write',
        prompt: 'Load the playlist in OnInitializedAsync, showing Loading… until it arrives.',
        starter: '',
        solution:
          '@if (songs is null)\n{\n    <p>Loading…</p>\n}\nelse\n{\n    <p>@songs.Length songs</p>\n}\n@code {\n    string[]? songs;\n    protected override async Task OnInitializedAsync()\n    {\n        await Task.Delay(500);\n        songs = ["Intro", "Skyline", "Outro"];\n    }\n}',
        checks: [
          { label: 'A nullable field for the data', re: '\\w+(\\[\\]|<[^>]+>)?\\?\\s+\\w+\\s*;' },
          { label: 'Override OnInitializedAsync', has: 'protected override async Task OnInitializedAsync()' },
          { label: 'await something inside it', re: 'OnInitializedAsync\\(\\)[\\s\\S]*await\\s+\\w+' },
          { label: 'Show Loading… while it is null', re: '@if\\s*\\(\\s*\\w+\\s*(is\\s+null|==\\s*null)\\s*\\)[\\s\\S]*Loading' },
        ],
        hint: 'Task.Delay can stand in for a slow load. Check for null before using the field.',
        explain: 'Blazor renders once at the first await, while the field is still null, and again when the method finishes.',
        output: '3 songs',
      },
      {
        kind: 'write',
        prompt: 'Load the forecast the async way and guard against null.',
        starter:
          '@inject WeatherService Weather\n<p>@forecast.Summary, @forecast.TempC °C</p>\n@code {\n    Forecast? forecast;\n    protected override void OnInitialized()\n    {\n        forecast = Weather.GetAsync().Result;\n    }\n}',
        solution:
          '@inject WeatherService Weather\n@if (forecast is null)\n{\n    <p>Loading…</p>\n}\nelse\n{\n    <p>@forecast.Summary, @forecast.TempC °C</p>\n}\n@code {\n    Forecast? forecast;\n    protected override async Task OnInitializedAsync()\n    {\n        forecast = await Weather.GetAsync();\n    }\n}',
        checks: [
          { label: 'Use OnInitializedAsync', has: 'protected override async Task OnInitializedAsync()' },
          { label: 'await Weather.GetAsync()', has: 'await Weather.GetAsync()' },
          { label: 'No blocking .Result', not: '.Result' },
          { label: 'Guard the markup with @if', re: '@if\\s*\\(\\s*forecast\\s*(is\\s+(not\\s+)?null|[!=]=\\s*null)\\s*\\)' },
        ],
        hint: '.Result blocks the thread. Make the method async and await the call instead.',
        explain: 'Awaiting keeps the app responsive, and the null check covers the first render that happens before the data arrives.',
      },
    ],
    // L3 Reacting to parameters
    [
      {
        kind: 'write',
        prompt: 'Show the Km parameter in miles, recomputed whenever the parent changes it.',
        starter: '@* Distance.razor *@\n',
        solution:
          '@* Distance.razor *@\n<p>@label</p>\n@code {\n    [Parameter] public double Km { get; set; }\n    string label = "";\n    protected override void OnParametersSet()\n    {\n        label = $"{Km * 0.621:0.0} miles";\n    }\n}',
        checks: [
          { label: 'A numeric Km parameter', re: '\\[Parameter\\]\\s*public\\s+(double|decimal|float|int)\\s+Km\\s*\\{' },
          { label: 'Override OnParametersSet', has: 'protected override void OnParametersSet()' },
          { label: 'Compute from Km in there', re: 'OnParametersSet\\(\\)[\\s\\S]*\\bKm\\b' },
          { label: 'Render the result', re: '<\\w+>[^<]*@\\w+' },
        ],
        hint: 'Store the text in a field and set it in OnParametersSet, which runs on every new Km.',
        explain: 'OnInitialized runs once; OnParametersSet runs again each time the parent passes a new value.',
      },
      {
        kind: 'write',
        prompt: 'The total never updates after Add one. Fix PriceTag.',
        starter:
          '@* PriceTag.razor *@\n<p>@display</p>\n@code {\n    [Parameter] public decimal Price { get; set; }\n    [Parameter] public int Qty { get; set; }\n    string display = "";\n    protected override void OnInitialized() => display = $"Total: {Price * Qty}";\n}\n\n@* Shop.razor *@\n@rendermode InteractiveServer\n<PriceTag Price="4.5m" Qty="qty" />\n<button @onclick="() => qty++">Add one</button>\n@code { int qty = 1; }',
        solution:
          '@* PriceTag.razor *@\n<p>@display</p>\n@code {\n    [Parameter] public decimal Price { get; set; }\n    [Parameter] public int Qty { get; set; }\n    string display = "";\n    protected override void OnParametersSet() => display = $"Total: {Price * Qty}";\n}\n\n@* Shop.razor *@\n@rendermode InteractiveServer\n<PriceTag Price="4.5m" Qty="qty" />\n<button @onclick="() => qty++">Add one</button>\n@code { int qty = 1; }',
        checks: [
          { label: 'Compute display in OnParametersSet', re: 'protected\\s+override\\s+void\\s+OnParametersSet\\(\\)[\\s\\S]*display\\s*=' },
          { label: 'Not in OnInitialized, which runs once', not: 'void OnInitialized()' },
          { label: 'Still multiply Price by Qty', re: 'Price\\s*\\*\\s*Qty|Qty\\s*\\*\\s*Price' },
        ],
        hint: 'Which lifecycle method runs again when the parent passes a new Qty?',
        explain: 'The parent re-renders PriceTag with a new Qty, but OnInitialized already ran. OnParametersSet runs on every update.',
      },
    ],
    // L4 After render
    [
      {
        kind: 'write',
        prompt: 'Log Board ready to the console after the first render only.',
        starter: '@rendermode InteractiveServer\n<h2>Chess board</h2>\n',
        solution:
          '@rendermode InteractiveServer\n<h2>Chess board</h2>\n@code {\n    protected override void OnAfterRender(bool firstRender)\n    {\n        if (firstRender)\n        {\n            Console.WriteLine("Board ready");\n        }\n    }\n}',
        checks: [
          { label: 'Override OnAfterRender(bool firstRender)', re: 'protected\\s+override\\s+(void\\s+OnAfterRender|async\\s+Task\\s+OnAfterRenderAsync)\\(\\s*bool\\s+firstRender\\s*\\)' },
          { label: 'Only when firstRender is true', re: 'if\\s*\\(\\s*firstRender\\s*\\)|if\\s*\\(\\s*!\\s*firstRender\\s*\\)\\s*return' },
          { label: 'Log with Console.WriteLine', re: 'Console\\.WriteLine\\(\\s*"[^"]+"\\s*\\)' },
        ],
        hint: 'The method gets a bool; wrap the log in if (firstRender).',
        explain: 'OnAfterRender runs after every render, so firstRender is what keeps one-time work from repeating.',
        output: 'Chess board',
      },
      {
        kind: 'write',
        prompt: 'Count every render in renders and log it, plus a message on the first.',
        starter:
          '@rendermode InteractiveServer\n<button @onclick="() => clicks++">Clicks: @clicks</button>\n@code {\n    int clicks;\n    int renders;\n}',
        solution:
          '@rendermode InteractiveServer\n<button @onclick="() => clicks++">Clicks: @clicks</button>\n@code {\n    int clicks;\n    int renders;\n    protected override void OnAfterRender(bool firstRender)\n    {\n        renders++;\n        if (firstRender)\n        {\n            Console.WriteLine("First render done");\n        }\n        Console.WriteLine($"Renders: {renders}");\n    }\n}',
        checks: [
          { label: 'Override OnAfterRender(bool firstRender)', re: 'protected\\s+override\\s+void\\s+OnAfterRender\\(\\s*bool\\s+firstRender\\s*\\)' },
          { label: 'Add one to renders each time', re: 'renders\\s*\\+\\+|\\+\\+\\s*renders|renders\\s*\\+=\\s*1' },
          { label: 'A first-render message inside if (firstRender)', re: 'if\\s*\\(\\s*firstRender\\s*\\)\\s*\\{?\\s*Console\\.WriteLine' },
          { label: 'Log the renders count', re: 'Console\\.WriteLine\\([^;]*renders' },
        ],
        hint: 'Increment outside the if, so every render counts; log the first one inside it.',
        explain: 'Each click causes a render, then OnAfterRender. Changing renders there doesn’t re-render, which is why you log it instead of showing it.',
        output: 'Clicks: 0',
      },
    ],
    // L5 Refresh & dispose
    [
      {
        kind: 'write',
        prompt: 'Count down from 10 every second, and stop the timer when disposed.',
        starter: '@rendermode InteractiveServer\n',
        solution:
          '@rendermode InteractiveServer\n@implements IDisposable\n<p>@left s left</p>\n@code {\n    int left = 10;\n    Timer? timer;\n    protected override void OnInitialized()\n    {\n        timer = new Timer(async _ =>\n        {\n            if (left > 0) left--;\n            await InvokeAsync(StateHasChanged);\n        }, null, 1000, 1000);\n    }\n    public void Dispose() => timer?.Dispose();\n}',
        checks: [
          { label: 'Add @implements IDisposable', has: '@implements IDisposable' },
          { label: 'Start a Timer', re: 'new\\s+(System\\.Threading\\.)?Timer\\s*\\(' },
          { label: 'Refresh with InvokeAsync(StateHasChanged)', has: 'InvokeAsync(StateHasChanged)' },
          { label: 'Dispose the timer in public void Dispose()', re: 'public\\s+void\\s+Dispose\\s*\\(\\s*\\)\\s*(=>\\s*\\w+\\??\\.Dispose\\(\\)|\\{[^}]*\\w+\\??\\.Dispose\\(\\))' },
        ],
        hint: 'Timer ticks run off Blazor’s thread, so refresh through InvokeAsync.',
        explain: 'Nothing re-renders after a timer tick unless you ask, and a timer left running keeps ticking after the user leaves the page.',
        output: '10 s left',
      },
      {
        kind: 'write',
        prompt: 'Make the upload text update on every step, and show Done at 100.',
        starter:
          '@rendermode InteractiveServer\n<p>Upload: @progress%</p>\n<button @onclick="Upload">Upload</button>\n@code {\n    int progress;\n    async Task Upload()\n    {\n        for (int i = 0; i < 10; i++)\n        {\n            await Task.Delay(300);\n            progress += 10;\n        }\n    }\n}',
        solution:
          '@rendermode InteractiveServer\n<p>Upload: @progress%</p>\n@if (progress == 100)\n{\n    <p>Done</p>\n}\n<button @onclick="Upload">Upload</button>\n@code {\n    int progress;\n    async Task Upload()\n    {\n        for (int i = 0; i < 10; i++)\n        {\n            await Task.Delay(300);\n            progress += 10;\n            StateHasChanged();\n        }\n    }\n}',
        checks: [
          { label: 'Call StateHasChanged() inside the loop', re: 'for\\s*\\([^)]*\\)\\s*\\{[^}]*StateHasChanged[^}]*\\}' },
          { label: 'Keep the await Task.Delay', has: 'await Task.Delay(' },
          { label: 'Show Done when progress reaches 100', re: '@if\\s*\\(\\s*progress\\s*(==|>=)\\s*100\\s*\\)[\\s\\S]*Done' },
        ],
        hint: 'Blazor re-renders at the first await and at the end. Ask for the steps in between.',
        explain: 'An event handler only triggers renders at its first await and when it finishes; StateHasChanged() shows each step.',
        output: 'Upload: 0%\nUpload',
      },
    ],
  ],
};

export default unit;
