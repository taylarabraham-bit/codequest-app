import type { DesktopUnit } from '../../../engine/types';

// Desktop edition: write-the-code challenges for Blazor unit 7 (Calling APIs).
// lessons[i] runs after lesson i + 1. See docs/CONTENT_GUIDE.md.
const unit: DesktopUnit = {
  lessons: [
    // L1 Fetching JSON
    [
      {
        kind: 'write',
        prompt: 'Register an HttpClient, then list the books from api/books.',
        starter: '// Program.cs\n\n\n@* Books.razor *@\n',
        solution:
          '// Program.cs\nbuilder.Services.AddScoped(sp => new HttpClient { BaseAddress = new Uri("https://localhost:7001/") });\n\n@* Books.razor *@\n@inject HttpClient Http\n@if (books is null)\n{\n    <p>Loading…</p>\n}\nelse\n{\n    <ul>\n        @foreach (var b in books)\n        {\n            <li>@b.Title</li>\n        }\n    </ul>\n}\n@code {\n    Book[]? books;\n    protected override async Task OnInitializedAsync() =>\n        books = await Http.GetFromJsonAsync<Book[]>("api/books");\n}',
        checks: [
          { label: 'Register an HttpClient with a BaseAddress', re: 'builder\\.Services\\.AddScoped\\(\\s*\\w+\\s*=>\\s*new\\s+HttpClient\\s*\\{\\s*BaseAddress\\s*=\\s*new\\s+Uri\\(\\s*"[^"]+"\\s*\\)' },
          { label: 'Inject it with @inject HttpClient', re: '@inject\\s+HttpClient\\s+\\w+' },
          { label: 'await GetFromJsonAsync<…>("api/books")', re: '@inject\\s+HttpClient\\s+(\\w+)[\\s\\S]*await\\s+\\1\\.GetFromJsonAsync<[^>]+>\\(\\s*"/?api/books"\\s*\\)' },
          { label: 'Load in OnInitializedAsync', has: 'protected override async Task OnInitializedAsync()' },
          { label: 'Guard for null while loading', re: '@if\\s*\\(\\s*\\w+\\s*(is\\s+null|==\\s*null)\\s*\\)' },
        ],
        hint: 'AddScoped with a lambda that builds the client; in the component, await the JSON call.',
        explain: 'The relative "api/books" is joined onto the BaseAddress, and the JSON array becomes a Book[] for you.',
      },
      {
        kind: 'write',
        prompt: 'Load the movie for the URL’s Id the async way, with a loading message.',
        starter:
          '@page "/movies/{Id:int}"\n@inject HttpClient Http\n<h1>@movie.Title</h1>\n<p>@movie.Year</p>\n@code {\n    [Parameter] public int Id { get; set; }\n    Movie movie;\n    protected override void OnInitialized()\n    {\n        movie = Http.GetFromJsonAsync<Movie>("api/movies/1").Result;\n    }\n}',
        solution:
          '@page "/movies/{Id:int}"\n@inject HttpClient Http\n@if (movie is null)\n{\n    <p>Loading…</p>\n}\nelse\n{\n    <h1>@movie.Title</h1>\n    <p>@movie.Year</p>\n}\n@code {\n    [Parameter] public int Id { get; set; }\n    Movie? movie;\n    protected override async Task OnParametersSetAsync() =>\n        movie = await Http.GetFromJsonAsync<Movie>($"api/movies/{Id}");\n}',
        checks: [
          { label: 'Load in an async lifecycle method', re: 'protected\\s+override\\s+async\\s+Task\\s+On(Initialized|ParametersSet)Async\\(\\s*\\)' },
          { label: 'Put Id in the URL', re: 'GetFromJsonAsync<Movie\\??>\\(\\s*(\\$"/?api/movies/\\{\\s*Id\\s*\\}"|"/?api/movies/"\\s*\\+\\s*Id)' },
          { label: 'await it, no .Result', not: '.Result' },
          { label: 'Make the movie field nullable', re: 'Movie\\?\\s+movie\\b' },
          { label: 'Show Loading… while movie is null', re: '@if\\s*\\(\\s*movie\\s*(is\\s+null|==\\s*null)\\s*\\)[\\s\\S]*Loading' },
        ],
        hint: 'Use an interpolated string, $"api/movies/{Id}", and await the call.',
        explain: 'OnParametersSetAsync also reloads when you move from /movies/1 to /movies/2 on the same page.',
      },
    ],
    // L2 Sending data
    [
      {
        kind: 'write',
        prompt: 'Post the new note as JSON, and clear the box when it succeeds.',
        starter:
          '@rendermode InteractiveServer\n@inject HttpClient Http\n<input @bind="text" />\n<button @onclick="Add">Add note</button>\n<p>@status</p>\n@code {\n    string text = "";\n    string status = "";\n    async Task Add()\n    {\n    }\n}',
        solution:
          '@rendermode InteractiveServer\n@inject HttpClient Http\n<input @bind="text" />\n<button @onclick="Add">Add note</button>\n<p>@status</p>\n@code {\n    string text = "";\n    string status = "";\n    async Task Add()\n    {\n        var response = await Http.PostAsJsonAsync("api/notes", new Note(text));\n        if (response.IsSuccessStatusCode)\n        {\n            text = "";\n            status = "Saved";\n        }\n    }\n}',
        checks: [
          { label: 'await Http.PostAsJsonAsync(url, item)', re: 'await\\s+Http\\.PostAsJsonAsync\\(\\s*"[^"]+"\\s*,\\s*[^)]' },
          { label: 'Keep the response and check IsSuccessStatusCode', re: '(\\w+)\\s*=\\s*await\\s+Http\\.PostAsJsonAsync[\\s\\S]*\\1\\.IsSuccessStatusCode' },
          { label: 'Clear text on success', re: 'IsSuccessStatusCode[\\s\\S]*text\\s*=\\s*(""|string\\.Empty)' },
        ],
        hint: 'PostAsJsonAsync returns a response; it does not throw on a 400 or 500.',
        explain: 'An error status still returns a response, so check IsSuccessStatusCode before you treat the note as saved.',
        output: 'Add note',
      },
      {
        kind: 'write',
        prompt: 'Fill in Save with a PUT that reads the reply, and Remove with a DELETE.',
        starter:
          '@rendermode InteractiveServer\n@inject HttpClient Http\n<input @bind="habit.Name" />\n<button @onclick="Save">Save</button>\n<button @onclick="Remove">Delete</button>\n<p>@status</p>\n@code {\n    Habit habit = new() { Id = 4, Name = "Stretch" };\n    string status = "";\n    async Task Save()\n    {\n    }\n    async Task Remove()\n    {\n    }\n}',
        solution:
          '@rendermode InteractiveServer\n@inject HttpClient Http\n<input @bind="habit.Name" />\n<button @onclick="Save">Save</button>\n<button @onclick="Remove">Delete</button>\n<p>@status</p>\n@code {\n    Habit habit = new() { Id = 4, Name = "Stretch" };\n    string status = "";\n    async Task Save()\n    {\n        var response = await Http.PutAsJsonAsync($"api/habits/{habit.Id}", habit);\n        if (response.IsSuccessStatusCode)\n            habit = await response.Content.ReadFromJsonAsync<Habit>() ?? habit;\n    }\n    async Task Remove()\n    {\n        var response = await Http.DeleteAsync($"api/habits/{habit.Id}");\n        status = response.IsSuccessStatusCode ? "Deleted" : "Could not delete";\n    }\n}',
        checks: [
          { label: 'PUT the habit with PutAsJsonAsync', re: 'await\\s+Http\\.PutAsJsonAsync\\(\\s*[^,]+,\\s*habit\\s*\\)' },
          { label: 'Read the reply with ReadFromJsonAsync<Habit>()', re: '\\.Content\\.ReadFromJsonAsync<Habit\\??>\\(\\s*\\)' },
          { label: 'Send a DELETE with DeleteAsync', re: 'await\\s+Http\\.DeleteAsync\\(\\s*[^)]+\\)' },
          { label: 'Check IsSuccessStatusCode in both', re: 'IsSuccessStatusCode[\\s\\S]*IsSuccessStatusCode' },
        ],
        hint: 'Both URLs end with the habit’s Id. The reply body is in response.Content.',
        explain: 'PUT replaces the habit and the server can echo back the saved version; DELETE sends no body at all.',
      },
    ],
    // L3 Typed API clients
    [
      {
        kind: 'write',
        prompt: 'Write a TaskApi class over HttpClient, and register it with AddHttpClient.',
        starter: '// TaskApi.cs\n\n\n// Program.cs\n',
        solution:
          '// TaskApi.cs\npublic class TaskApi\n{\n    private readonly HttpClient _http;\n    public TaskApi(HttpClient http) { _http = http; }\n\n    public Task<TodoTask[]?> GetAllAsync() =>\n        _http.GetFromJsonAsync<TodoTask[]>("api/tasks");\n}\n\n// Program.cs\nbuilder.Services.AddHttpClient<TaskApi>(c => c.BaseAddress = new Uri("https://localhost:7001/"));',
        checks: [
          { label: 'TaskApi takes an HttpClient in its constructor', re: 'class\\s+TaskApi\\s*\\(\\s*HttpClient\\s+\\w+\\s*\\)|TaskApi\\s*\\(\\s*HttpClient\\s+\\w+\\s*\\)\\s*(\\{|=>|:)' },
          { label: 'A method that calls GetFromJsonAsync', re: 'public\\s+(async\\s+)?Task<[^\\n]+\\s+\\w+Async\\(\\)[\\s\\S]*GetFromJsonAsync<' },
          { label: 'Register with AddHttpClient<TaskApi> and a BaseAddress', re: 'AddHttpClient<TaskApi>\\([\\s\\S]*?BaseAddress\\s*=\\s*new\\s+Uri\\(' },
        ],
        hint: 'AddHttpClient<T> builds T and passes it a configured HttpClient through the constructor.',
        explain: 'Components now ask for TaskApi and call GetAllAsync, without knowing any URLs.',
      },
      {
        kind: 'write',
        prompt: 'Move the call into ReviewApi and inject that instead of HttpClient.',
        starter:
          '@* Reviews.razor *@\n@inject HttpClient Http\n<ul>\n    @foreach (var r in reviews) { <li>@r.Stars: @r.Text</li> }\n</ul>\n@code {\n    Review[] reviews = [];\n    protected override async Task OnInitializedAsync() =>\n        reviews = await Http.GetFromJsonAsync<Review[]>("api/reviews") ?? [];\n}\n\n// ReviewApi.cs\npublic class ReviewApi(HttpClient http)\n{\n}',
        solution:
          '@* Reviews.razor *@\n@inject ReviewApi Api\n<ul>\n    @foreach (var r in reviews) { <li>@r.Stars: @r.Text</li> }\n</ul>\n@code {\n    Review[] reviews = [];\n    protected override async Task OnInitializedAsync() =>\n        reviews = await Api.GetAllAsync();\n}\n\n// ReviewApi.cs\npublic class ReviewApi(HttpClient http)\n{\n    public async Task<Review[]> GetAllAsync() =>\n        await http.GetFromJsonAsync<Review[]>("api/reviews") ?? [];\n}',
        checks: [
          { label: 'Inject ReviewApi in the component', re: '@inject\\s+ReviewApi\\s+\\w+' },
          { label: 'No HttpClient in the component', not: '@inject HttpClient' },
          { label: 'Call a ReviewApi method with await', re: '@inject\\s+ReviewApi\\s+(\\w+)[\\s\\S]*await\\s+\\1\\.\\w+\\(' },
          { label: 'ReviewApi fetches api/reviews', re: 'class\\s+ReviewApi[\\s\\S]*GetFromJsonAsync<Review\\[\\]>\\(\\s*"/?api/reviews"' },
        ],
        hint: 'The class already has the HttpClient through its primary constructor. Add a method that returns the reviews.',
        explain: 'The URL now lives in one place, and the component only knows it can ask ReviewApi for reviews.',
      },
    ],
    // L4 Handling failures
    [
      {
        kind: 'write',
        prompt: 'Load the scores, and show a friendly error if the call fails.',
        starter: '@inject HttpClient Http\n',
        solution:
          '@inject HttpClient Http\n@if (error is not null)\n{\n    <p class="error">@error</p>\n}\nelse if (scores is null)\n{\n    <p>Loading…</p>\n}\nelse\n{\n    <p>@scores.Length scores</p>\n}\n@code {\n    int[]? scores;\n    string? error;\n    protected override async Task OnInitializedAsync()\n    {\n        try { scores = await Http.GetFromJsonAsync<int[]>("api/scores"); }\n        catch (HttpRequestException) { error = "Scores are offline. Try later."; }\n    }\n}',
        checks: [
          { label: 'Call GetFromJsonAsync inside try', re: 'try\\s*\\{[^}]*GetFromJsonAsync' },
          { label: 'catch (HttpRequestException)', re: 'catch\\s*\\(\\s*HttpRequestException(\\s+\\w+)?\\s*\\)' },
          { label: 'The catch sets an error field', re: 'catch\\s*\\(\\s*HttpRequestException(\\s+\\w+)?\\s*\\)\\s*\\{\\s*\\w+\\s*=' },
          { label: 'Show that error field in the markup', re: '@(\\w+)\\b[\\s\\S]*catch\\s*\\([^)]*\\)\\s*\\{\\s*\\1\\s*=' },
        ],
        hint: 'GetFromJsonAsync throws HttpRequestException on a failed call. Catch it and store a message.',
        explain: 'Catching the exception keeps the page alive and shows a message instead of the error UI.',
      },
      {
        kind: 'write',
        prompt: 'Use GetAsync, and show No such pet when the API returns 404.',
        starter:
          '@page "/pets/{Id:int}"\n@inject HttpClient Http\n<p>@message</p>\n@code {\n    [Parameter] public int Id { get; set; }\n    string message = "";\n    protected override async Task OnParametersSetAsync()\n    {\n        var pet = await Http.GetFromJsonAsync<Pet>($"api/pets/{Id}");\n        message = pet!.Name;\n    }\n}',
        solution:
          '@page "/pets/{Id:int}"\n@using System.Net\n@inject HttpClient Http\n<p>@message</p>\n@code {\n    [Parameter] public int Id { get; set; }\n    string message = "";\n    protected override async Task OnParametersSetAsync()\n    {\n        var response = await Http.GetAsync($"api/pets/{Id}");\n        if (response.StatusCode == HttpStatusCode.NotFound)\n        {\n            message = "No such pet.";\n            return;\n        }\n        var pet = await response.Content.ReadFromJsonAsync<Pet>();\n        message = pet?.Name ?? "";\n    }\n}',
        checks: [
          { label: 'Add @using System.Net', has: '@using System.Net' },
          { label: 'Get the raw response with GetAsync', re: 'await\\s+Http\\.GetAsync\\(' },
          { label: 'Compare StatusCode with HttpStatusCode.NotFound', re: 'StatusCode\\s*==\\s*HttpStatusCode\\.NotFound|HttpStatusCode\\.NotFound\\s*==\\s*\\w+\\.StatusCode|StatusCode\\s+is\\s+HttpStatusCode\\.NotFound' },
          { label: 'Read the pet with ReadFromJsonAsync<Pet>()', re: 'ReadFromJsonAsync<Pet\\??>\\(\\s*\\)' },
          { label: 'No GetFromJsonAsync left', not: 'GetFromJsonAsync' },
        ],
        hint: 'GetAsync never throws on a 404; check the status, then read the body yourself.',
        explain: 'With the raw response you can tell a missing pet apart from other failures and show the right message.',
      },
    ],
    // L5 Streaming rendering
    [
      {
        kind: 'write',
        prompt: 'Write a streamed /deliveries page that shows Loading… until the stops load.',
        starter: '',
        solution:
          '@page "/deliveries"\n@attribute [StreamRendering]\n@if (stops is null)\n{\n    <p>Loading…</p>\n}\nelse\n{\n    <p>@stops.Length stops today</p>\n}\n@code {\n    string[]? stops;\n    protected override async Task OnInitializedAsync()\n    {\n        await Task.Delay(2000);\n        stops = ["Depot", "Mill St", "Harbor"];\n    }\n}',
        checks: [
          { label: '@page "/deliveries"', re: '@page\\s+"/deliveries"' },
          { label: '@attribute [StreamRendering]', re: '@attribute\\s+\\[StreamRendering(\\(\\s*(true)?\\s*\\))?\\]' },
          { label: 'Stay static: no @rendermode', not: '@rendermode' },
          { label: 'await slow work in OnInitializedAsync', re: 'OnInitializedAsync\\(\\)[\\s\\S]*await\\s+' },
          { label: 'Show Loading… while the data is null', re: '@if\\s*\\(\\s*\\w+\\s*(is\\s+null|==\\s*null)\\s*\\)[\\s\\S]*Loading' },
        ],
        hint: '@attribute puts a C# attribute on the component; the page itself stays static.',
        explain: 'The Loading… markup is sent at once, and the finished list streams into the same response when the await completes.',
        output: '3 stops today',
      },
      {
        kind: 'write',
        prompt: 'Fix the streaming line and the crash on the first, empty render.',
        starter:
          '@page "/league"\n@StreamRendering\n<h1>League table</h1>\n<ul>\n    @foreach (var t in teams)\n    {\n        <li>@t</li>\n    }\n</ul>\n@code {\n    List<string> teams;\n    protected override async Task OnInitializedAsync()\n    {\n        await Task.Delay(1500);\n        teams = ["Hawks", "Lions", "Otters"];\n    }\n}',
        solution:
          '@page "/league"\n@attribute [StreamRendering]\n<h1>League table</h1>\n@if (teams is null)\n{\n    <p>Loading…</p>\n}\nelse\n{\n    <ul>\n        @foreach (var t in teams)\n        {\n            <li>@t</li>\n        }\n    </ul>\n}\n@code {\n    List<string>? teams;\n    protected override async Task OnInitializedAsync()\n    {\n        await Task.Delay(1500);\n        teams = ["Hawks", "Lions", "Otters"];\n    }\n}',
        checks: [
          { label: 'Use @attribute [StreamRendering]', re: '@attribute\\s+\\[StreamRendering(\\(\\s*(true)?\\s*\\))?\\]' },
          { label: 'No bare @StreamRendering line', not: '@StreamRendering' },
          { label: 'Make teams nullable', re: 'List<string>\\?\\s+teams' },
          { label: 'Show Loading… until teams arrive', re: '@if\\s*\\(\\s*teams\\s*(is\\s+null|==\\s*null)\\s*\\)[\\s\\S]*Loading' },
        ],
        hint: 'StreamRendering is an attribute class, so it needs @attribute and brackets.',
        explain: 'Streaming sends a first render before the await finishes, so the list must handle teams being null.',
        output: 'League table\nHawks\nLions\nOtters',
      },
    ],
  ],
};

export default unit;
