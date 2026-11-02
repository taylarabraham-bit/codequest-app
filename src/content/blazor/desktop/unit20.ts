import type { DesktopUnit } from '../../../engine/types';

// Desktop edition: write-the-code challenges for Blazor unit 20 (Capstone: a complete app).
// lessons[i] runs after lesson i + 1. See docs/CONTENT_GUIDE.md.
const unit: DesktopUnit = {
  lessons: [
    // L1 Layout & routing
    [
      {
        kind: 'write',
        prompt: 'Write TaskBoard’s MainLayout: a header, the NavMenu and the page body.',
        starter: '@* Layout/MainLayout.razor *@\n',
        solution: `@* Layout/MainLayout.razor *@
@inherits LayoutComponentBase

<header>TaskBoard</header>
<div class="page">
    <NavMenu />
    <main>@Body</main>
</div>`,
        checks: [
          { label: '@inherits LayoutComponentBase', re: String.raw`@inherits\s+LayoutComponentBase\b` },
          { label: 'Include <NavMenu />', re: String.raw`<NavMenu\s*/>` },
          { label: 'Render @Body inside <main>', re: String.raw`<main>\s*@Body\s*</main>` },
          { label: 'A header with the app name', re: String.raw`<header[^>]*>[\s\S]*\w[\s\S]*</header>` },
        ],
        hint: 'A layout inherits LayoutComponentBase and places @Body where the page should appear.',
        explain: 'Every page renders inside @Body, so the header and NavMenu stay put while the main area changes.',
      },
      {
        kind: 'write',
        prompt: 'Make the task page accept only whole-number Ids, and route unknown URLs to NotFound.',
        starter: `@* Pages/TaskDetails.razor *@
@page "/tasks/{id}"
<h1>Task @Id</h1>
@code {
    [Parameter] public string Id { get; set; } = "";
}

@* Routes.razor *@
<Router AppAssembly="typeof(Program).Assembly">
    <Found Context="routeData">
        <RouteView RouteData="routeData" DefaultLayout="typeof(Layout.MainLayout)" />
    </Found>
</Router>`,
        solution: `@* Pages/TaskDetails.razor *@
@page "/tasks/{Id:int}"
<h1>Task @Id</h1>
@code {
    [Parameter] public int Id { get; set; }
}

@* Routes.razor *@
<Router AppAssembly="typeof(Program).Assembly" NotFoundPage="typeof(Pages.NotFound)">
    <Found Context="routeData">
        <RouteView RouteData="routeData" DefaultLayout="typeof(Layout.MainLayout)" />
    </Found>
</Router>`,
        checks: [
          { label: 'Route /tasks/{Id:int}', re: String.raw`@page\s+"/tasks/\{\w+:int\}"` },
          { label: 'Make the Id parameter an int', re: String.raw`\[Parameter\]\s*public\s+int\s+Id\b` },
          { label: 'NotFoundPage="typeof(Pages.NotFound)" on the Router', re: String.raw`<Router\b[^>]*NotFoundPage="typeof\(\s*(Pages\.)?NotFound\s*\)"` },
        ],
        hint: 'The constraint goes after a colon in the route, and the parameter type must match it.',
        explain: '/tasks/abc no longer matches, so it falls through to the NotFoundPage instead of breaking the details page.',
      },
    ],
    // L2 Components & parameters
    [
      {
        kind: 'write',
        prompt: 'Write TaskCard: a required Item, its title, and a Move button that raises OnMove.',
        starter: '@* TaskCard.razor *@\n',
        solution: `@* TaskCard.razor *@
<div class="card">
    <h3>@Item.Title</h3>
    <button @onclick="() => OnMove.InvokeAsync(Item)">Move</button>
</div>

@code {
    [Parameter, EditorRequired] public TaskItem Item { get; set; } = default!;
    [Parameter] public EventCallback<TaskItem> OnMove { get; set; }
}`,
        checks: [
          {
            label: 'A required TaskItem Item parameter',
            re: String.raw`(\[Parameter\s*,\s*EditorRequired\]|\[EditorRequired\s*,\s*Parameter\]|\[Parameter\]\s*\[EditorRequired\]|\[EditorRequired\]\s*\[Parameter\])\s*public\s+TaskItem\s+Item\b`,
          },
          { label: 'A [Parameter] EventCallback<TaskItem> OnMove', re: String.raw`\[Parameter\]\s*public\s+EventCallback<TaskItem>\s+OnMove\b` },
          { label: 'Show @Item.Title', has: '@Item.Title' },
          { label: 'A Move button with @onclick', re: String.raw`<button[^<]*@onclick="[^"]+"[^<]*>\s*Move\s*</button>` },
          { label: 'Raise OnMove.InvokeAsync(Item)', re: String.raw`OnMove\.InvokeAsync\(\s*Item\s*\)` },
        ],
        hint: 'EditorRequired goes with Parameter. The button hands the item back with InvokeAsync(Item).',
        explain: 'The card doesn’t change the task itself; it tells the board, which owns the list.',
      },
      {
        kind: 'write',
        prompt: 'Fill the Doing column with keyed TaskCards and move tasks along in Advance.',
        starter: `<Column Title="Doing">
</Column>

@code {
    List<TaskItem> tasks = [];

    void Advance(TaskItem item)
    {
    }
}`,
        solution: `<Column Title="Doing">
    @foreach (var t in tasks.Where(t => t.Stage == Stage.Doing))
    {
        <TaskCard @key="t.Id" Item="t" OnMove="Advance" />
    }
</Column>

@code {
    List<TaskItem> tasks = [];

    void Advance(TaskItem item)
    {
        if (item.Stage < Stage.Done) item.Stage++;
    }
}`,
        checks: [
          { label: 'Loop over the Doing tasks', re: String.raw`<Column[^>]*>[\s\S]*@foreach\s*\([^\n]*Stage\.Doing[\s\S]*</Column>` },
          { label: 'A TaskCard keyed by Id', re: String.raw`<TaskCard\s[^>]*@key="@?\(?\w+\.Id\)?"` },
          { label: 'Pass Item and OnMove="Advance"', re: String.raw`<TaskCard(?=[^>]*\sItem="@?\w+")(?=[^>]*OnMove="@?Advance")` },
          { label: 'Advance moves the task to the next stage', re: String.raw`void\s+Advance\([^)]*\)\s*\{[^}]*\.Stage\s*(\+\+|=|\+=)` },
        ],
        hint: 'Filter with Where on Stage, and in Advance change item.Stage.',
        explain: 'The board owns the list: when the card raises OnMove, the board changes the stage and re-renders its columns.',
      },
    ],
    // L3 A form with validation
    [
      {
        kind: 'write',
        prompt: 'Write the TaskItem model with a required, max-60 Title, a Stage and an optional Due.',
        starter: 'using System.ComponentModel.DataAnnotations;\n',
        solution: `using System.ComponentModel.DataAnnotations;

public enum Stage { Todo, Doing, Done }

public class TaskItem
{
    public int Id { get; set; }

    [Required, StringLength(60)]
    public string Title { get; set; } = "";

    public Stage Stage { get; set; } = Stage.Todo;
    public DateOnly? Due { get; set; }
}`,
        checks: [
          { label: 'An enum Stage with Todo, Doing and Done', re: String.raw`enum\s+Stage\s*\{\s*Todo\s*,\s*Doing\s*,\s*Done\s*,?\s*\}` },
          { label: '[Required] on Title', re: String.raw`\[(Required\b[^\]]*|[^\]]*,\s*Required)\]\s*(\[[^\]]*\]\s*)*public\s+string\??\s+Title\b` },
          { label: '[StringLength(60)] on Title', re: String.raw`StringLength\(\s*60\b[^\]]*\]\s*(\[[^\]]*\]\s*)*public\s+string\??\s+Title\b` },
          { label: 'A Stage property', re: String.raw`public\s+Stage\s+Stage\s*\{\s*get;\s*set;\s*\}` },
          { label: 'A DateOnly? Due property', re: String.raw`public\s+DateOnly\?\s+Due\s*\{\s*get;\s*set;\s*\}` },
        ],
        hint: 'Attributes go in square brackets right above the property they check.',
        explain: 'DataAnnotationsValidator reads these attributes, so the rules live on the model, not in the form.',
      },
      {
        kind: 'write',
        prompt: 'Build the New task form with validation, a stage picker and a due date.',
        starter: `@rendermode InteractiveServer

@code {
    TaskItem draft = new();
    void Save() => Console.WriteLine($"Saved {draft.Title}");
}`,
        solution: `@rendermode InteractiveServer

<EditForm Model="draft" OnValidSubmit="Save">
    <DataAnnotationsValidator />
    <InputText @bind-Value="draft.Title" />
    <ValidationMessage For="() => draft.Title" />
    <InputSelect @bind-Value="draft.Stage">
        @foreach (var s in Enum.GetValues<Stage>())
        {
            <option value="@s">@s</option>
        }
    </InputSelect>
    <InputDate @bind-Value="draft.Due" />
    <button type="submit">Add</button>
</EditForm>

@code {
    TaskItem draft = new();
    void Save() => Console.WriteLine($"Saved {draft.Title}");
}`,
        checks: [
          { label: '<EditForm Model="draft" OnValidSubmit="Save">', re: String.raw`<EditForm(?=[^>]*Model="@?draft")(?=[^>]*OnValidSubmit="@?Save")` },
          { label: '<DataAnnotationsValidator />', re: String.raw`<DataAnnotationsValidator\s*/>` },
          { label: 'InputText bound to draft.Title, with a validation message', re: String.raw`<InputText[^>]*@bind-Value="draft\.Title"[\s\S]*<Validation(Message[^<]*draft\.Title|Summary)` },
          { label: 'InputSelect bound to draft.Stage with options', re: String.raw`<InputSelect[^>]*@bind-Value="draft\.Stage"[^>]*>[\s\S]*<option[\s\S]*</InputSelect>` },
          { label: 'InputDate bound to draft.Due', re: String.raw`<InputDate[^>]*@bind-Value="draft\.Due"` },
          { label: 'A submit button', re: String.raw`<button[^>]*type="submit"` },
        ],
        hint: 'Each Input* component uses @bind-Value. Enum.GetValues<Stage>() gives every option.',
        explain: 'OnValidSubmit only runs Save once every [Required] and [StringLength] rule passes.',
      },
    ],
    // L4 Data with QuickGrid
    [
      {
        kind: 'write',
        prompt: 'Write a typed TaskApi over HttpClient and register it in Program.cs.',
        starter: '',
        solution: `public class TaskApi(HttpClient http)
{
    public async Task<List<TaskItem>> GetAllAsync() =>
        await http.GetFromJsonAsync<List<TaskItem>>("api/tasks") ?? [];
}

// Program.cs
builder.Services.AddHttpClient<TaskApi>(client =>
    client.BaseAddress = new Uri("https://localhost:7001/"));`,
        checks: [
          { label: 'A TaskApi class that takes an HttpClient', re: String.raw`class\s+TaskApi\s*\(\s*HttpClient\s+\w+\s*\)|TaskApi\s*\(\s*HttpClient\s+\w+\s*\)\s*\{` },
          { label: 'A method returning Task<List<TaskItem>>', re: String.raw`Task<(List|IReadOnlyList|IEnumerable)<TaskItem>>\s+\w+\(\)` },
          { label: 'GetFromJsonAsync<…>("api/tasks")', re: String.raw`GetFromJsonAsync<[^>]*TaskItem[^>]*>+\(\s*"/?api/tasks"` },
          { label: 'Fall back to an empty list on null', re: String.raw`\?\?\s*(\[\]|new\s*\(\)|new\s+List<TaskItem>\(\))` },
          { label: 'Register it with AddHttpClient<TaskApi>', re: String.raw`builder\.Services\.AddHttpClient<TaskApi>\(` },
        ],
        hint: 'A typed client takes HttpClient in its constructor; AddHttpClient<TaskApi> creates and configures it.',
        explain: 'Pages inject TaskApi instead of a raw HttpClient, so URLs and JSON handling live in one place.',
      },
      {
        kind: 'write',
        prompt: 'Show Loading… then a sortable, paged QuickGrid of the tasks.',
        starter: `@inject TaskApi Api

@code {
    List<TaskItem>? tasks;

    protected override async Task OnInitializedAsync() => tasks = await Api.GetAllAsync();
}`,
        solution: `@inject TaskApi Api

@if (tasks is null)
{
    <p>Loading…</p>
}
else
{
    <QuickGrid Items="tasks.AsQueryable()" Pagination="pages">
        <PropertyColumn Property="t => t.Title" Sortable="true" />
        <PropertyColumn Property="t => t.Stage" Sortable="true" />
        <TemplateColumn Title="Actions">
            <a href="tasks/@context.Id">Open</a>
        </TemplateColumn>
    </QuickGrid>
    <Paginator State="pages" />
}

@code {
    List<TaskItem>? tasks;
    PaginationState pages = new() { ItemsPerPage = 10 };

    protected override async Task OnInitializedAsync() => tasks = await Api.GetAllAsync();
}`,
        checks: [
          { label: 'Show Loading… while tasks is null', re: String.raw`@if\s*\(\s*tasks\s*(is\s+null|==\s*null)\s*\)\s*\{[\s\S]*Loading` },
          { label: 'A QuickGrid over tasks.AsQueryable() with Pagination', re: String.raw`<QuickGrid(?=[^<]*Items="@?\(?tasks\.AsQueryable\(\)\)?")(?=[^<]*Pagination="@?\w+")` },
          { label: 'A sortable PropertyColumn', re: String.raw`<PropertyColumn(?=[^<]*Property=)(?=[^<]*Sortable="true")` },
          { label: 'A TemplateColumn that uses @context', re: String.raw`<TemplateColumn[\s\S]*@context\.\w+[\s\S]*</TemplateColumn>` },
          { label: 'A PaginationState and a <Paginator>', re: String.raw`(?=[\s\S]*PaginationState\s+\w+\s*=)(?=[\s\S]*<Paginator\s+State=")` },
          { label: 'The Paginator shares the grid’s state', re: String.raw`Pagination="@?(\w+)"[\s\S]*<Paginator\s+State="@?\1"` },
        ],
        hint: 'Guard on null first. The grid and the Paginator take the same PaginationState.',
        explain: 'The guard avoids a null grid on the first render; once the API answers, QuickGrid sorts and pages in memory.',
      },
    ],
    // L5 State, auth & polish
    [
      {
        kind: 'write',
        prompt: 'Load the board’s tasks once, even with prerendering, using [PersistentState].',
        starter: `@page "/"
@rendermode InteractiveServer
@inject TaskApi Api

<p>@Tasks?.Count tasks</p>`,
        solution: `@page "/"
@rendermode InteractiveServer
@inject TaskApi Api

<p>@Tasks?.Count tasks</p>

@code {
    [PersistentState]
    public List<TaskItem>? Tasks { get; set; }

    protected override async Task OnInitializedAsync()
    {
        Tasks ??= await Api.GetAllAsync();
    }
}`,
        checks: [
          { label: 'A [PersistentState] property', re: String.raw`\[PersistentState[^\]]*\]\s*public\s+[\w<>?]+\s+Tasks\s*\{\s*get;\s*set;\s*\}` },
          { label: 'It must be public', re: String.raw`public\s+(List|IReadOnlyList|IList)<TaskItem>\??\s+Tasks\b` },
          { label: 'Load in OnInitializedAsync', re: String.raw`override\s+async\s+Task\s+OnInitializedAsync\(\)` },
          { label: 'Only call the API when nothing was restored', re: String.raw`Tasks\s*\?\?=\s*await|if\s*\(\s*Tasks\s*(is\s+null|==\s*null)\s*\)` },
        ],
        hint: 'The restored value is already set when OnInitializedAsync runs, so only load when it’s null.',
        explain: 'The prerender’s data rides along in the page, so the interactive render reuses it instead of calling the API again.',
      },
      {
        kind: 'write',
        prompt: 'Lock the board to signed-in users and keep the header’s task count live.',
        starter: `@* Board.razor *@
@page "/"
<BoardHeader />

@* BoardHeader.razor *@
@inject BoardState State
<h1>@State.Tasks.Count tasks</h1>`,
        solution: `@* Board.razor *@
@page "/"
@attribute [Authorize]
<PageTitle>Board</PageTitle>
<BoardHeader />

@* BoardHeader.razor *@
@implements IDisposable
@inject BoardState State
<h1>@State.Tasks.Count tasks</h1>
@code {
    protected override void OnInitialized() => State.OnChange += Refresh;
    private void Refresh() => InvokeAsync(StateHasChanged);
    public void Dispose() => State.OnChange -= Refresh;
}`,
        checks: [
          { label: '@attribute [Authorize] on the board page', re: String.raw`@page\s+"/"[\s\S]*@attribute\s*\[\s*Authorize\s*\]` },
          { label: 'A <PageTitle> for the browser tab', re: String.raw`<PageTitle>[\s\S]*\w[\s\S]*</PageTitle>` },
          { label: 'Subscribe to State.OnChange', re: String.raw`State\.OnChange\s*\+=\s*(\w+)` },
          { label: 'Re-render with InvokeAsync(StateHasChanged)', re: String.raw`InvokeAsync\(\s*StateHasChanged\s*\)` },
          { label: '@implements IDisposable', re: String.raw`@implements\s+IDisposable` },
          { label: 'Unsubscribe in Dispose', re: String.raw`State\.OnChange\s*\+=\s*(\w+)[\s\S]*Dispose\(\)[\s\S]*State\.OnChange\s*-=\s*\1` },
        ],
        hint: 'Subscribe in OnInitialized with +=, and remove the same handler with -= in Dispose.',
        explain: 'Every change to BoardState now redraws the header, and unsubscribing stops the scoped service holding dead components.',
      },
    ],
  ],
};

export default unit;
