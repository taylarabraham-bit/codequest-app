import type { DesktopUnit } from '../../../engine/types';

// Desktop edition: write-the-code challenges for Blazor unit 3 (Parameters & child content).
// lessons[i] runs after lesson i + 1. See docs/CONTENT_GUIDE.md.
const unit: DesktopUnit = {
  lessons: [
    // L1 Component parameters
    [
      {
        kind: 'write',
        prompt: 'Make a PlayerCard with Name and Level parameters, then use it once.',
        starter: '@* PlayerCard.razor *@\n\n\n@* Home.razor *@\n',
        solution:
          '@* PlayerCard.razor *@\n<div class="player">\n    <h3>@Name</h3>\n    <p>Level @Level</p>\n</div>\n@code {\n    [Parameter] public string Name { get; set; } = "";\n    [Parameter] public int Level { get; set; }\n}\n\n@* Home.razor *@\n<PlayerCard Name="Zoe" Level="12" />',
        checks: [
          { label: 'A string Name [Parameter] property', re: '\\[Parameter\\]\\s*public\\s+string\\??\\s+Name\\s*\\{\\s*get;\\s*set;\\s*\\}' },
          { label: 'An int Level [Parameter] property', re: '\\[Parameter\\]\\s*public\\s+int\\s+Level\\s*\\{\\s*get;\\s*set;\\s*\\}' },
          { label: 'Render @Name and @Level', re: '@Name\\b[\\s\\S]*@Level\\b|@Level\\b[\\s\\S]*@Name\\b' },
          { label: 'Home sets both, like <PlayerCard Name="…" Level="…" />', re: '<PlayerCard(?=[^>]*\\bName="[^"]+")(?=[^>]*\\bLevel="\\d+")[^>]*/>' },
        ],
        hint: 'Parameters are public properties with { get; set; } and [Parameter] on top.',
        explain: 'Each [Parameter] becomes an attribute the parent can set; text goes in as-is and numbers are converted.',
        output: 'Zoe\nLevel 12',
      },
      {
        kind: 'write',
        prompt: 'Declare Price’s two parameters, and make Amount required.',
        starter:
          '@* Price.razor *@\n<span>@Amount.ToString("0.00") @Currency</span>\n@code {\n}\n\n@* Checkout.razor *@\n<p>Total: <Price Amount="@total" Currency="EUR" /></p>\n@code {\n    decimal total = 18.5m;\n}',
        solution:
          '@* Price.razor *@\n<span>@Amount.ToString("0.00") @Currency</span>\n@code {\n    [Parameter, EditorRequired] public decimal Amount { get; set; }\n    [Parameter] public string Currency { get; set; } = "USD";\n}\n\n@* Checkout.razor *@\n<p>Total: <Price Amount="@total" Currency="EUR" /></p>\n@code {\n    decimal total = 18.5m;\n}',
        checks: [
          { label: 'A decimal Amount parameter', re: '\\[Parameter[^\\]]*\\](\\s*\\[[^\\]]*\\])?\\s*public\\s+decimal\\s+Amount\\s*\\{\\s*get;\\s*set;' },
          { label: 'Mark Amount with [EditorRequired]', re: 'EditorRequired[^;{}]*public\\s+decimal\\s+Amount' },
          { label: 'A string Currency parameter', re: '\\[Parameter\\]\\s*public\\s+string\\??\\s+Currency\\s*\\{\\s*get;\\s*set;' },
        ],
        hint: 'Match each type to what the parent passes: @total is a decimal, "EUR" is text.',
        explain: 'Amount="@total" passes a C# value; Currency="EUR" is plain text. [EditorRequired] makes a missing Amount a build warning.',
        output: 'Total: 18.50 EUR',
      },
    ],
    // L2 Child content
    [
      {
        kind: 'write',
        prompt: 'Make a Panel that wraps whatever markup the parent puts inside it.',
        starter: '@* Panel.razor *@\n\n\n@* Home.razor *@\n',
        solution:
          '@* Panel.razor *@\n<section class="panel">\n    @ChildContent\n</section>\n@code {\n    [Parameter] public RenderFragment? ChildContent { get; set; }\n}\n\n@* Home.razor *@\n<Panel>\n    <p>Doors open at 7.</p>\n</Panel>',
        checks: [
          { label: 'A RenderFragment? ChildContent parameter', re: '\\[Parameter\\]\\s*public\\s+RenderFragment\\??\\s+ChildContent\\s*\\{\\s*get;\\s*set;' },
          { label: 'Render it with @ChildContent inside an element', re: '<(\\w+)[^>]*>\\s*@ChildContent\\s*</\\1>' },
          { label: 'Home nests markup inside <Panel>', re: '<Panel>\\s*<\\w+[^>]*>[\\s\\S]*?</Panel>' },
        ],
        hint: 'The parameter must be called ChildContent for nested markup to land in it.',
        explain: 'Whatever sits between <Panel> and </Panel> arrives as ChildContent, and @ChildContent drops it into place.',
        output: 'Doors open at 7.',
      },
      {
        kind: 'write',
        prompt: 'Give Dialog a Title slot, then fill both slots from the parent.',
        starter:
          '@* Dialog.razor *@\n<div class="dialog">\n    <header></header>\n    <div class="body">@ChildContent</div>\n</div>\n@code {\n    [Parameter] public RenderFragment? ChildContent { get; set; }\n}\n\n@* Home.razor *@\n<Dialog>\n    <p>Delete this photo?</p>\n</Dialog>',
        solution:
          '@* Dialog.razor *@\n<div class="dialog">\n    <header>@Title</header>\n    <div class="body">@ChildContent</div>\n</div>\n@code {\n    [Parameter] public RenderFragment? Title { get; set; }\n    [Parameter] public RenderFragment? ChildContent { get; set; }\n}\n\n@* Home.razor *@\n<Dialog>\n    <Title><b>Are you sure?</b></Title>\n    <ChildContent>\n        <p>Delete this photo?</p>\n    </ChildContent>\n</Dialog>',
        checks: [
          { label: 'A RenderFragment? Title parameter', re: '\\[Parameter\\]\\s*public\\s+RenderFragment\\??\\s+Title\\s*\\{' },
          { label: 'Render @Title in the header', re: '<header>\\s*@Title\\s*</header>' },
          { label: 'The parent fills <Title>', re: '<Title>[\\s\\S]*\\S[\\s\\S]*</Title>' },
          { label: 'The question moves into <ChildContent>', re: '<ChildContent>[\\s\\S]*Delete this photo\\?[\\s\\S]*</ChildContent>' },
        ],
        hint: 'Once the parent uses a <Title> tag, the rest has to go inside <ChildContent> too.',
        explain: 'Any RenderFragment parameter is a named slot. With more than one, the parent labels each with a tag.',
        output: 'Are you sure?\nDelete this photo?',
      },
    ],
    // L3 Events to the parent
    [
      {
        kind: 'write',
        prompt: 'Make a RatingButton that tells its parent how many stars were picked.',
        starter: '@* RatingButton.razor *@\n',
        solution:
          '@* RatingButton.razor *@\n<button @onclick="Rate">@Stars stars</button>\n@code {\n    [Parameter] public int Stars { get; set; }\n    [Parameter] public EventCallback<int> OnRate { get; set; }\n    private async Task Rate() => await OnRate.InvokeAsync(Stars);\n}',
        checks: [
          { label: 'An int parameter for the stars', re: '\\[Parameter\\]\\s*public\\s+int\\s+\\w+\\s*\\{' },
          { label: 'An EventCallback<int> parameter', re: '\\[Parameter\\]\\s*public\\s+EventCallback<int>\\s+(\\w+)\\s*\\{' },
          { label: 'Call InvokeAsync with the stars', re: '\\b\\w+\\.InvokeAsync\\(\\s*\\w+\\s*\\)' },
          { label: 'Raise it from a button click', re: '<button[^>]*@onclick="' },
        ],
        hint: 'EventCallback<int> is a parameter like any other. Call InvokeAsync on it in the click handler.',
        explain: 'The child never knows what the parent does; it just raises the event with a value and Blazor runs the parent’s method.',
        output: '0 stars',
      },
      {
        kind: 'write',
        prompt: 'Wire up the parent so finished tasks appear in its Done line.',
        starter:
          '@* TodoItem.razor *@\n<li>@Text <button @onclick="() => OnDone.InvokeAsync(Text)">Done</button></li>\n@code {\n    [Parameter] public string Text { get; set; } = "";\n    [Parameter] public EventCallback<string> OnDone { get; set; }\n}\n\n@* Todos.razor *@\n@rendermode InteractiveServer\n<ul>\n    <TodoItem Text="Water plants" />\n    <TodoItem Text="Pay rent" />\n</ul>\n<p>Done: @(string.Join(", ", done))</p>\n@code {\n    List<string> done = [];\n}',
        solution:
          '@* TodoItem.razor *@\n<li>@Text <button @onclick="() => OnDone.InvokeAsync(Text)">Done</button></li>\n@code {\n    [Parameter] public string Text { get; set; } = "";\n    [Parameter] public EventCallback<string> OnDone { get; set; }\n}\n\n@* Todos.razor *@\n@rendermode InteractiveServer\n<ul>\n    <TodoItem Text="Water plants" OnDone="MarkDone" />\n    <TodoItem Text="Pay rent" OnDone="MarkDone" />\n</ul>\n<p>Done: @(string.Join(", ", done))</p>\n@code {\n    List<string> done = [];\n    void MarkDone(string task) => done.Add(task);\n}',
        checks: [
          { label: 'Both TodoItems set OnDone to a method', re: '<TodoItem[^>]*OnDone="(\\w+)"[^>]*/>\\s*<TodoItem[^>]*OnDone="\\1"' },
          { label: 'The method takes the task text', re: 'OnDone="(\\w+)"[\\s\\S]*void\\s+\\1\\s*\\(\\s*string\\s+\\w+\\s*\\)' },
          { label: 'It adds the text to done', re: 'done\\.Add\\(\\s*\\w+\\s*\\)' },
        ],
        hint: 'OnDone="MethodName" on each tag. The method’s string parameter receives Text.',
        explain: 'The child passes its Text up through the callback, and Blazor re-renders the parent after MarkDone runs.',
      },
    ],
    // L4 Templated components
    [
      {
        kind: 'write',
        prompt: 'Write a generic BulletList with Items and an ItemTemplate parameter.',
        starter: '@* BulletList.razor *@\n',
        solution:
          '@* BulletList.razor *@\n@typeparam TItem\n<ul>\n    @foreach (var item in Items)\n    {\n        <li>@ItemTemplate(item)</li>\n    }\n</ul>\n@code {\n    [Parameter] public IEnumerable<TItem> Items { get; set; } = [];\n    [Parameter] public RenderFragment<TItem> ItemTemplate { get; set; } = default!;\n}',
        checks: [
          { label: 'Make it generic with @typeparam', re: '@typeparam\\s+(\\w+)' },
          { label: 'An Items parameter holding that type', re: '@typeparam\\s+(\\w+)[\\s\\S]*\\[Parameter\\]\\s*public\\s+(IEnumerable|IReadOnlyList|IList|List|ICollection|IReadOnlyCollection)<\\1>\\??\\s+Items' },
          { label: 'An ItemTemplate RenderFragment<T> parameter', re: '\\[Parameter\\]\\s*public\\s+RenderFragment<\\w+>\\??\\s+ItemTemplate' },
          { label: 'Loop the items and render @ItemTemplate(item)', re: '@foreach\\s*\\(\\s*\\w+\\s+(\\w+)\\s+in\\s+Items\\s*\\)[\\s\\S]*@ItemTemplate\\(\\s*\\1\\s*\\)' },
        ],
        hint: '@typeparam TItem first, then RenderFragment<TItem>, called like a method with each item.',
        explain: 'The component owns the list markup; the parent writes how one item looks, and you render it once per item.',
      },
      {
        kind: 'write',
        prompt: 'Use BulletList to show each pet’s name and age, naming the context pet.',
        starter:
          '@* Pets.razor *@\n<BulletList Items="pets">\n</BulletList>\n@code {\n    record Pet(string Name, int Age);\n    List<Pet> pets = [new("Rex", 3), new("Luna", 5)];\n}',
        solution:
          '@* Pets.razor *@\n<BulletList Items="pets" Context="pet">\n    <ItemTemplate>@pet.Name, age @pet.Age</ItemTemplate>\n</BulletList>\n@code {\n    record Pet(string Name, int Age);\n    List<Pet> pets = [new("Rex", 3), new("Luna", 5)];\n}',
        checks: [
          { label: 'Name the context with Context="pet"', has: 'Context="pet"' },
          { label: 'Fill <ItemTemplate> inside BulletList', re: '<BulletList[^>]*>\\s*<ItemTemplate( [^>]*)?>[\\s\\S]+</ItemTemplate>\\s*</BulletList>' },
          { label: 'Show @pet.Name and @pet.Age', re: '@pet\\.Name[\\s\\S]*@pet\\.Age|@pet\\.Age[\\s\\S]*@pet\\.Name' },
        ],
        hint: 'Context can go on <BulletList> or on <ItemTemplate>. Then use pet like a variable.',
        explain: 'Inside a template the item is called context; Context="pet" renames it so the markup reads clearly.',
        output: 'Rex, age 3\nLuna, age 5',
      },
    ],
    // L5 Binding to components
    [
      {
        kind: 'write',
        prompt: 'Make a Switch component that supports @bind-Value for a bool.',
        starter: '@* Switch.razor *@\n',
        solution:
          '@* Switch.razor *@\n<button @onclick="Flip">@(Value ? "On" : "Off")</button>\n@code {\n    [Parameter] public bool Value { get; set; }\n    [Parameter] public EventCallback<bool> ValueChanged { get; set; }\n    private async Task Flip() => await ValueChanged.InvokeAsync(!Value);\n}',
        checks: [
          { label: 'A bool Value parameter', re: '\\[Parameter\\]\\s*public\\s+bool\\s+Value\\s*\\{' },
          { label: 'An EventCallback<bool> ValueChanged parameter', re: '\\[Parameter\\]\\s*public\\s+EventCallback<bool>\\s+ValueChanged\\s*\\{' },
          { label: 'Invoke ValueChanged with the flipped value', re: 'ValueChanged\\.InvokeAsync\\(\\s*!\\s*Value\\s*\\)' },
          { label: 'Flip on a button click', re: '<button[^>]*@onclick="' },
        ],
        hint: 'The pair must be named Value and ValueChanged for @bind-Value to find them.',
        explain: '@bind-Value passes the parent’s field in as Value and listens on ValueChanged to write the new value back.',
        output: 'Off',
      },
      {
        kind: 'write',
        prompt: 'Fix Rating so the parent’s stars update, then bind it with @bind-Value.',
        starter:
          '@* Rating.razor *@\n@for (int i = 1; i <= 5; i++)\n{\n    var n = i;\n    <button @onclick="() => Value = n">@n</button>\n}\n@code {\n    [Parameter] public int Value { get; set; }\n}\n\n@* Review.razor *@\n@rendermode InteractiveServer\n<Rating Value="stars" />\n<p>You gave @stars stars</p>\n@code {\n    int stars = 3;\n}',
        solution:
          '@* Rating.razor *@\n@for (int i = 1; i <= 5; i++)\n{\n    var n = i;\n    <button @onclick="() => ValueChanged.InvokeAsync(n)">@n</button>\n}\n@code {\n    [Parameter] public int Value { get; set; }\n    [Parameter] public EventCallback<int> ValueChanged { get; set; }\n}\n\n@* Review.razor *@\n@rendermode InteractiveServer\n<Rating @bind-Value="stars" />\n<p>You gave @stars stars</p>\n@code {\n    int stars = 3;\n}',
        checks: [
          { label: 'Add an EventCallback<int> ValueChanged parameter', re: '\\[Parameter\\]\\s*public\\s+EventCallback<int>\\s+ValueChanged\\s*\\{' },
          { label: 'Buttons invoke ValueChanged with n', re: 'ValueChanged\\.InvokeAsync\\(\\s*n\\s*\\)' },
          { label: 'Don’t assign the Value parameter directly', not: '=> Value = n' },
          { label: 'Review uses <Rating @bind-Value="stars" />', re: '<Rating\\s+@bind-Value="stars"\\s*/>' },
        ],
        hint: 'A child should never set its own parameter. Report the new value through ValueChanged.',
        explain: 'Setting Value inside the child is overwritten on the next parent render. Raising ValueChanged lets @bind-Value update stars.',
        output: '1 2 3 4 5\nYou gave 3 stars',
      },
    ],
  ],
};

export default unit;
