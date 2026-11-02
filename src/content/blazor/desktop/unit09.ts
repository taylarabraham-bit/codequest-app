import type { DesktopUnit } from '../../../engine/types';

// Desktop edition: write-the-code challenges for Blazor unit 9 (JavaScript interop).
// lessons[i] runs after lesson i + 1. See docs/CONTENT_GUIDE.md.
const unit: DesktopUnit = {
  lessons: [
    // L1 Calling JavaScript
    [
      {
        kind: 'write',
        prompt: 'Ask the browser to confirm with JS confirm before emptying the cart.',
        starter: '@rendermode InteractiveServer\n<p>@items items in cart</p>\n',
        solution:
          '@rendermode InteractiveServer\n@inject IJSRuntime JS\n<p>@items items in cart</p>\n<button @onclick="Clear">Empty cart</button>\n@code {\n    int items = 3;\n    async Task Clear()\n    {\n        if (await JS.InvokeAsync<bool>("confirm", "Empty the cart?"))\n        {\n            items = 0;\n        }\n    }\n}',
        checks: [
          { label: 'Inject IJSRuntime', re: '@inject\\s+IJSRuntime\\s+\\w+' },
          { label: 'Call "confirm" with InvokeAsync<bool>', re: '@inject\\s+IJSRuntime\\s+(\\w+)[\\s\\S]*await\\s+\\1\\.InvokeAsync<bool>\\(\\s*"(window\\.)?confirm"\\s*,\\s*"[^"]+"\\s*\\)' },
          { label: 'Only empty the cart when it returns true', re: 'if\\s*\\([^)]*InvokeAsync<bool>[\\s\\S]*\\w+\\s*=\\s*0' },
          { label: 'Run it from a button’s @onclick', re: '<button[^>]*@onclick="\\w+"' },
        ],
        hint: 'InvokeAsync<T> hands back the JS result; confirm returns a bool.',
        explain: 'The JS call is async because it travels to the browser and back; the bool says which button the user picked.',
        output: '3 items in cart\nEmpty cart',
      },
      {
        kind: 'write',
        prompt: 'On each new message, put the unread count in the tab title and log it.',
        starter:
          '@rendermode InteractiveServer\n@inject IJSRuntime JS\n<button @onclick="NewMessage">Simulate message</button>\n@code {\n    int unread;\n    async Task NewMessage()\n    {\n        unread++;\n    }\n}',
        solution:
          '@rendermode InteractiveServer\n@inject IJSRuntime JS\n<button @onclick="NewMessage">Simulate message</button>\n@code {\n    int unread;\n    async Task NewMessage()\n    {\n        unread++;\n        await JS.SetValueAsync("document.title", $"({unread}) Inbox");\n        await JS.InvokeVoidAsync("console.log", $"Unread: {unread}");\n    }\n}',
        checks: [
          { label: 'Set "document.title" with SetValueAsync', re: 'await\\s+JS\\.SetValueAsync(<\\w+>)?\\(\\s*"document\\.title"\\s*,\\s*[^)]*unread' },
          { label: 'Log with InvokeVoidAsync("console.log", …)', re: 'await\\s+JS\\.InvokeVoidAsync\\(\\s*"console\\.log"\\s*,\\s*[^)]*unread' },
        ],
        hint: 'SetValueAsync writes a JS property by its path. InvokeVoidAsync calls a function and ignores the result.',
        explain: 'SetValueAsync is new in .NET 10, so you no longer need a helper function just to set document.title.',
        output: 'Simulate message',
      },
    ],
    // L2 JS modules
    [
      {
        kind: 'write',
        prompt: 'Export a burst function from Confetti.razor.js, and call it on click.',
        starter: '// Components/Confetti.razor.js\n\n\n@* Components/Confetti.razor *@\n@rendermode InteractiveServer\n@inject IJSRuntime JS\n',
        solution:
          '// Components/Confetti.razor.js\nexport function burst(count) {\n    console.log(`Boom x${count}`);\n}\n\n@* Components/Confetti.razor *@\n@rendermode InteractiveServer\n@inject IJSRuntime JS\n<button @onclick="Party">Party!</button>\n@code {\n    async Task Party()\n    {\n        var module = await JS.InvokeAsync<IJSObjectReference>("import", "./Components/Confetti.razor.js");\n        await module.InvokeVoidAsync("burst", 50);\n    }\n}',
        checks: [
          { label: 'export function burst in the .js file', re: 'export\\s+(async\\s+)?function\\s+burst\\s*\\(' },
          { label: 'Import "./Components/Confetti.razor.js"', re: 'InvokeAsync<IJSObjectReference>\\(\\s*"import"\\s*,\\s*"\\./Components/Confetti\\.razor\\.js"\\s*\\)' },
          { label: 'Call "burst" on the module you got back', re: '(\\w+)\\s*=\\s*await\\s+JS\\.InvokeAsync<IJSObjectReference>[\\s\\S]*\\1\\.InvokeVoidAsync\\(\\s*"burst"' },
          { label: 'From a button click', re: '<button[^>]*@onclick="\\w+"' },
        ],
        hint: 'The import path starts with ./ and follows the project folders to the file.',
        explain: 'A collocated module keeps the component’s JavaScript next to it and out of the global window.',
        output: 'Party!',
      },
      {
        kind: 'write',
        prompt: 'Three bugs stop this module from working. Fix them.',
        starter:
          '// Components/Pages/Clock.razor.js\nfunction startTicking() {\n    setInterval(() => console.log("tick"), 1000);\n}\n\n@* Components/Pages/Clock.razor *@\n@page "/clock"\n@rendermode InteractiveServer\n@inject IJSRuntime JS\n<button @onclick="Start">Start</button>\n@code {\n    async Task Start()\n    {\n        var module = await JS.InvokeAsync<IJSObjectReference>("import", "Clock.razor.js");\n        await JS.InvokeVoidAsync("startTicking");\n    }\n}',
        solution:
          '// Components/Pages/Clock.razor.js\nexport function startTicking() {\n    setInterval(() => console.log("tick"), 1000);\n}\n\n@* Components/Pages/Clock.razor *@\n@page "/clock"\n@rendermode InteractiveServer\n@inject IJSRuntime JS\n<button @onclick="Start">Start</button>\n@code {\n    async Task Start()\n    {\n        var module = await JS.InvokeAsync<IJSObjectReference>("import", "./Components/Pages/Clock.razor.js");\n        await module.InvokeVoidAsync("startTicking");\n    }\n}',
        checks: [
          { label: 'Export the function', re: 'export\\s+function\\s+startTicking' },
          { label: 'Use the full ./Components/Pages/ path', has: '"./Components/Pages/Clock.razor.js"' },
          { label: 'Call it on the module, not on JS', re: 'module\\.InvokeVoidAsync\\(\\s*"startTicking"' },
          { label: 'No JS.InvokeVoidAsync("startTicking")', not: 'JS.InvokeVoidAsync("startTicking")' },
        ],
        hint: 'Check the export, the path from the project root, and which object owns the function.',
        explain: 'Module functions aren’t on window, so JS can’t find them by name; only the imported module reference can call them.',
        output: 'Start',
      },
    ],
    // L3 Element references
    [
      {
        kind: 'write',
        prompt: 'Put the cursor in the search box as soon as the page appears.',
        starter: '@rendermode InteractiveServer\n<input placeholder="Search recipes" />\n',
        solution:
          '@rendermode InteractiveServer\n<input @ref="searchBox" placeholder="Search recipes" />\n@code {\n    ElementReference searchBox;\n    protected override async Task OnAfterRenderAsync(bool firstRender)\n    {\n        if (firstRender)\n        {\n            await searchBox.FocusAsync();\n        }\n    }\n}',
        checks: [
          { label: 'Capture the input with @ref into an ElementReference', re: '<input[^>]*@ref="(\\w+)"[\\s\\S]*ElementReference\\s+\\1\\b' },
          { label: 'Use OnAfterRenderAsync(bool firstRender)', has: 'protected override async Task OnAfterRenderAsync(bool firstRender)' },
          { label: 'Only on the first render', re: 'if\\s*\\(\\s*!?\\s*firstRender\\s*\\)' },
          { label: 'await FocusAsync() on it', re: '@ref="(\\w+)"[\\s\\S]*await\\s+\\1\\.FocusAsync\\(\\s*\\)' },
        ],
        hint: 'The reference is empty until the element is rendered, so focus it after rendering.',
        explain: '@ref fills the ElementReference once the input exists in the browser; FocusAsync then moves the cursor there.',
      },
      {
        kind: 'write',
        prompt: 'After each render, scroll the chat log to the bottom with scrollToEnd.',
        starter:
          '// Components/Chat.razor.js\nexport function scrollToEnd(el) { el.scrollTop = el.scrollHeight; }\n\n@* Components/Chat.razor *@\n@rendermode InteractiveServer\n@inject IJSRuntime JS\n<div class="log">\n    @foreach (var m in messages) { <p>@m</p> }\n</div>\n<button @onclick="Send">Send</button>\n@code {\n    List<string> messages = ["Hi!", "Hello"];\n    IJSObjectReference? module;\n    void Send() => messages.Add("New message");\n}',
        solution:
          '// Components/Chat.razor.js\nexport function scrollToEnd(el) { el.scrollTop = el.scrollHeight; }\n\n@* Components/Chat.razor *@\n@rendermode InteractiveServer\n@inject IJSRuntime JS\n<div class="log" @ref="log">\n    @foreach (var m in messages) { <p>@m</p> }\n</div>\n<button @onclick="Send">Send</button>\n@code {\n    List<string> messages = ["Hi!", "Hello"];\n    IJSObjectReference? module;\n    ElementReference log;\n    void Send() => messages.Add("New message");\n    protected override async Task OnAfterRenderAsync(bool firstRender)\n    {\n        module ??= await JS.InvokeAsync<IJSObjectReference>("import", "./Components/Chat.razor.js");\n        await module.InvokeVoidAsync("scrollToEnd", log);\n    }\n}',
        checks: [
          { label: 'Capture the log div with @ref', re: '<div[^>]*@ref="(\\w+)"[\\s\\S]*ElementReference\\s+\\1\\b' },
          { label: 'Work in OnAfterRenderAsync', has: 'protected override async Task OnAfterRenderAsync(bool firstRender)' },
          { label: 'Import ./Components/Chat.razor.js', re: 'InvokeAsync<IJSObjectReference>\\(\\s*"import"\\s*,\\s*"\\./Components/Chat\\.razor\\.js"\\s*\\)' },
          { label: 'Pass the element to scrollToEnd', re: '@ref="(\\w+)"[\\s\\S]*InvokeVoidAsync\\(\\s*"scrollToEnd"\\s*,\\s*\\1\\s*\\)' },
        ],
        hint: 'Don’t limit it to firstRender: each new message causes a render that should scroll.',
        explain: 'An ElementReference passed to JS arrives as the real DOM element, so el.scrollTop works on it.',
        output: 'Hi!\nHello\nSend',
      },
    ],
    // L4 Calling .NET from JS
    [
      {
        kind: 'write',
        prompt: 'Start watchWidth after the first render, and let it report widths to SetWidth.',
        starter:
          '// Components/Size.razor.js\nexport function watchWidth(helper) {\n    window.addEventListener("resize", () =>\n        helper.invokeMethodAsync("SetWidth", window.innerWidth));\n}\n\n@* Components/Size.razor *@\n@rendermode InteractiveServer\n@inject IJSRuntime JS\n<p>Width: @width px</p>\n',
        solution:
          '// Components/Size.razor.js\nexport function watchWidth(helper) {\n    window.addEventListener("resize", () =>\n        helper.invokeMethodAsync("SetWidth", window.innerWidth));\n}\n\n@* Components/Size.razor *@\n@rendermode InteractiveServer\n@inject IJSRuntime JS\n<p>Width: @width px</p>\n@code {\n    int width;\n    protected override async Task OnAfterRenderAsync(bool firstRender)\n    {\n        if (!firstRender) return;\n        var module = await JS.InvokeAsync<IJSObjectReference>("import", "./Components/Size.razor.js");\n        await module.InvokeVoidAsync("watchWidth", DotNetObjectReference.Create(this));\n    }\n    [JSInvokable]\n    public void SetWidth(int w) { width = w; StateHasChanged(); }\n}',
        checks: [
          { label: 'Pass DotNetObjectReference.Create(this) to watchWidth', re: 'InvokeVoidAsync\\(\\s*"watchWidth"\\s*,\\s*(DotNetObjectReference\\.Create\\(\\s*this\\s*\\)|\\w+)\\s*\\)' },
          { label: 'Create the reference with DotNetObjectReference.Create(this)', re: 'DotNetObjectReference\\.Create\\(\\s*this\\s*\\)' },
          { label: 'A public [JSInvokable] SetWidth(int …)', re: '\\[JSInvokable\\]\\s*public\\s+(void|Task|async\\s+Task)\\s+SetWidth\\s*\\(\\s*int\\s+\\w+\\s*\\)' },
          { label: 'Call StateHasChanged() after storing the width', re: 'SetWidth[\\s\\S]*StateHasChanged\\(\\)' },
        ],
        hint: 'The method name must match the string JS uses, and it must be public with [JSInvokable].',
        explain: 'JS holds a handle to this component and calls SetWidth through it; Blazor doesn’t re-render after such calls on its own.',
      },
      {
        kind: 'write',
        prompt: 'JS can’t call Update, and the page never refreshes. Fix the C# side.',
        starter:
          '// Components/Battery.razor.js\nexport async function watch(helper) {\n    const battery = await navigator.getBattery();\n    battery.addEventListener("levelchange", () =>\n        helper.invokeMethodAsync("Update", Math.round(battery.level * 100)));\n}\n\n// Components/Battery.razor, in @code\nint level;\nvoid Update(int percent)\n{\n    level = percent;\n}',
        solution:
          '// Components/Battery.razor.js\nexport async function watch(helper) {\n    const battery = await navigator.getBattery();\n    battery.addEventListener("levelchange", () =>\n        helper.invokeMethodAsync("Update", Math.round(battery.level * 100)));\n}\n\n// Components/Battery.razor, in @code\nint level;\n[JSInvokable]\npublic void Update(int percent)\n{\n    level = percent;\n    StateHasChanged();\n}',
        checks: [
          { label: 'Mark it [JSInvokable]', re: '\\[JSInvokable\\]\\s*public\\s+\\w+\\s+Update\\s*\\(' },
          { label: 'Make it public', re: 'public\\s+(void|Task|async\\s+Task)\\s+Update\\s*\\(\\s*int\\s+\\w+\\s*\\)' },
          { label: 'Call StateHasChanged() after setting level', re: 'level\\s*=\\s*\\w+\\s*;\\s*StateHasChanged\\(\\)' },
        ],
        hint: 'JS may only call public methods that opt in. Then ask Blazor to redraw.',
        explain: '[JSInvokable] is the opt-in for JS callers, and StateHasChanged shows the new level because interop calls don’t trigger a render.',
      },
    ],
    // L5 Timing & cleanup
    [
      {
        kind: 'write',
        prompt: 'Free the module and the .NET reference when MapView goes away.',
        starter:
          '@* Components/MapView.razor *@\n@rendermode InteractiveServer\n@inject IJSRuntime JS\n<div id="map"></div>\n@code {\n    IJSObjectReference? module;\n    DotNetObjectReference<MapView>? objRef;\n    protected override async Task OnAfterRenderAsync(bool firstRender)\n    {\n        if (!firstRender) return;\n        objRef = DotNetObjectReference.Create(this);\n        module = await JS.InvokeAsync<IJSObjectReference>("import", "./Components/MapView.razor.js");\n        await module.InvokeVoidAsync("init", objRef);\n    }\n}',
        solution:
          '@* Components/MapView.razor *@\n@rendermode InteractiveServer\n@implements IAsyncDisposable\n@inject IJSRuntime JS\n<div id="map"></div>\n@code {\n    IJSObjectReference? module;\n    DotNetObjectReference<MapView>? objRef;\n    protected override async Task OnAfterRenderAsync(bool firstRender)\n    {\n        if (!firstRender) return;\n        objRef = DotNetObjectReference.Create(this);\n        module = await JS.InvokeAsync<IJSObjectReference>("import", "./Components/MapView.razor.js");\n        await module.InvokeVoidAsync("init", objRef);\n    }\n    public async ValueTask DisposeAsync()\n    {\n        try { if (module is not null) await module.DisposeAsync(); }\n        catch (JSDisconnectedException) { }\n        objRef?.Dispose();\n    }\n}',
        checks: [
          { label: '@implements IAsyncDisposable', has: '@implements IAsyncDisposable' },
          { label: 'public async ValueTask DisposeAsync()', re: 'public\\s+async\\s+ValueTask\\s+DisposeAsync\\s*\\(\\s*\\)' },
          { label: 'await module.DisposeAsync()', re: 'await\\s+module\\.DisposeAsync\\(\\s*\\)' },
          { label: 'catch JSDisconnectedException', re: 'catch\\s*\\(\\s*JSDisconnectedException(\\s+\\w+)?\\s*\\)' },
          { label: 'Dispose objRef', re: 'objRef\\??\\.Dispose\\(\\s*\\)' },
        ],
        hint: 'The module is JS-side and async to free; the .NET reference is a plain Dispose.',
        explain: 'If the user closed the tab, the circuit is gone and freeing the module throws JSDisconnectedException, which is safe to ignore.',
      },
      {
        kind: 'write',
        prompt: 'This throws during prerendering. Read the saved theme at the right time.',
        starter:
          '@rendermode InteractiveServer\n@inject IJSRuntime JS\n<p>Theme: @theme</p>\n@code {\n    string theme = "light";\n    protected override async Task OnInitializedAsync()\n    {\n        theme = await JS.InvokeAsync<string?>("localStorage.getItem", "theme") ?? "light";\n    }\n}',
        solution:
          '@rendermode InteractiveServer\n@inject IJSRuntime JS\n<p>Theme: @theme</p>\n@code {\n    string theme = "light";\n    protected override async Task OnAfterRenderAsync(bool firstRender)\n    {\n        if (!firstRender) return;\n        theme = await JS.InvokeAsync<string?>("localStorage.getItem", "theme") ?? "light";\n        StateHasChanged();\n    }\n}',
        checks: [
          { label: 'Move the call to OnAfterRenderAsync(bool firstRender)', has: 'protected override async Task OnAfterRenderAsync(bool firstRender)' },
          { label: 'No JS call in OnInitializedAsync', not: 'OnInitializedAsync' },
          { label: 'Only on the first render', re: 'if\\s*\\(\\s*!?\\s*firstRender\\s*\\)' },
          { label: 'Still read localStorage.getItem', re: 'InvokeAsync<string\\??>\\(\\s*"localStorage\\.getItem"' },
          { label: 'Call StateHasChanged() to show it', has: 'StateHasChanged()' },
        ],
        hint: 'OnInitializedAsync first runs on the server with no browser. Which method only runs in the browser?',
        explain: 'Prerendering runs OnInitializedAsync where there’s no JS at all. After the first interactive render the browser is connected.',
        output: 'Theme: light',
      },
    ],
  ],
};

export default unit;
