import type { DesktopUnit } from '../../../engine/types';

// Desktop edition: write-the-code challenges for Blazor unit 19 (Advanced components).
// lessons[i] runs after lesson i + 1. See docs/CONTENT_GUIDE.md.
const unit: DesktopUnit = {
  lessons: [
    // L1 Generic constraints
    [
      {
        kind: 'write',
        prompt: 'Write a generic NameList that shows item.Name for any TItem that is IHasName.',
        starter: '@* NameList.razor *@\n',
        solution: `@* NameList.razor *@
@typeparam TItem where TItem : IHasName

<ul>
    @foreach (var item in Items)
    {
        <li>@item.Name</li>
    }
</ul>

@code {
    [Parameter, EditorRequired] public IEnumerable<TItem> Items { get; set; } = [];
}`,
        checks: [
          { label: '@typeparam TItem where TItem : IHasName', re: String.raw`@typeparam\s+TItem\s+where\s+TItem\s*:\s*IHasName\b` },
          { label: 'A [Parameter] list of TItem', re: String.raw`\[Parameter[^\]]*\]\s*public\s+(IEnumerable|IReadOnlyList|IList|List|ICollection)<TItem>\??\s+\w+` },
          { label: 'Loop over it and show .Name', re: String.raw`@foreach\s*\(\s*var\s+(\w+)\s+in\s+\w+\s*\)[\s\S]*@\1\.Name` },
        ],
        hint: 'The where clause goes right after @typeparam TItem, as in a C# generic class.',
        explain: 'The constraint promises every TItem has Name, so the component can use it without knowing the real type.',
      },
      {
        kind: 'write',
        prompt: 'Add a TKey type parameter and group the items by a KeySelector.',
        starter: `@typeparam TItem

<ul>
    @foreach (var item in Items)
    {
        <li>@ItemText(item)</li>
    }
</ul>

@code {
    [Parameter] public IEnumerable<TItem> Items { get; set; } = [];
    [Parameter] public Func<TItem, string> ItemText { get; set; } = i => i?.ToString() ?? "";
}`,
        solution: `@typeparam TItem
@typeparam TKey where TKey : notnull

@foreach (var group in Items.GroupBy(KeySelector))
{
    <h3>@group.Key</h3>
    <ul>
        @foreach (var item in group)
        {
            <li>@ItemText(item)</li>
        }
    </ul>
}

@code {
    [Parameter] public IEnumerable<TItem> Items { get; set; } = [];
    [Parameter] public Func<TItem, string> ItemText { get; set; } = i => i?.ToString() ?? "";
    [Parameter, EditorRequired] public Func<TItem, TKey> KeySelector { get; set; } = default!;
}`,
        checks: [
          { label: 'A second line: @typeparam TKey where TKey : notnull', re: String.raw`@typeparam\s+TItem\s*\n\s*@typeparam\s+TKey\s+where\s+TKey\s*:\s*notnull` },
          { label: 'A [Parameter] Func<TItem, TKey> KeySelector', re: String.raw`\[Parameter[^\]]*\]\s*public\s+Func<TItem,\s*TKey>\s+KeySelector\b` },
          { label: 'Group with Items.GroupBy(KeySelector)', re: String.raw`\.GroupBy\(\s*KeySelector\s*\)` },
          { label: 'A heading per group showing its Key', re: String.raw`<h[2-4]>\s*@\w+\.Key\s*</h[2-4]>` },
          { label: 'Loop over each group’s items', re: String.raw`foreach\s*\(\s*var\s+\w+\s+in\s+(\w+)\s*\)[\s\S]*@\1\.Key|@\w+\.Key[\s\S]*foreach\s*\(\s*var\s+\w+\s+in\s+\w+\s*\)` },
        ],
        hint: 'Each type parameter gets its own @typeparam line. GroupBy gives groups with a Key that you can loop over.',
        explain: 'TKey is inferred from the KeySelector the parent passes, so <GroupedList Items="songs" KeySelector="s => s.Artist" /> just works.',
      },
    ],
    // L2 Templates in depth
    [
      {
        kind: 'write',
        prompt: 'Write a generic TableView with a Header template and a Row template.',
        starter: '@typeparam TItem\n',
        solution: `@typeparam TItem

<table>
    <thead><tr>@Header</tr></thead>
    <tbody>
        @foreach (var item in Items)
        {
            <tr>@Row(item)</tr>
        }
    </tbody>
</table>

@code {
    [Parameter] public IEnumerable<TItem> Items { get; set; } = [];
    [Parameter] public RenderFragment? Header { get; set; }
    [Parameter, EditorRequired] public RenderFragment<TItem> Row { get; set; } = default!;
}`,
        checks: [
          { label: 'A [Parameter] RenderFragment Header', re: String.raw`\[Parameter[^\]]*\]\s*public\s+RenderFragment\??\s+Header\b` },
          { label: 'A [Parameter] RenderFragment<TItem> Row', re: String.raw`\[Parameter[^\]]*\]\s*public\s+RenderFragment<TItem>\??\s+Row\b` },
          { label: 'Render @Header in the thead', re: String.raw`<thead>[\s\S]*@Header[\s\S]*</thead>` },
          { label: 'Render @Row(item) for each item', re: String.raw`foreach\s*\(\s*var\s+(\w+)\s+in\s+Items\s*\)[\s\S]*@Row\(\s*\1\s*\)` },
        ],
        hint: 'A plain RenderFragment for the header; RenderFragment<TItem> for rows, called like a method.',
        explain: 'The parent writes the markup and the table decides where and how often it renders: once for Header, once per item for Row.',
      },
      {
        kind: 'write',
        prompt: 'Fall back to default templates when the parent passes no Card or Empty.',
        starter: `@if (!Songs.Any())
{
    @Empty
}
else
{
    foreach (var song in Songs)
    {
        @Card(song)
    }
}

@code {
    [Parameter] public IEnumerable<Song> Songs { get; set; } = [];
    [Parameter] public RenderFragment? Empty { get; set; }
    [Parameter] public RenderFragment<Song>? Card { get; set; }
}`,
        solution: `@if (!Songs.Any())
{
    @(Empty ?? DefaultEmpty)
}
else
{
    foreach (var song in Songs)
    {
        @((Card ?? DefaultCard)(song))
    }
}

@code {
    [Parameter] public IEnumerable<Song> Songs { get; set; } = [];
    [Parameter] public RenderFragment? Empty { get; set; }
    [Parameter] public RenderFragment<Song>? Card { get; set; }

    RenderFragment DefaultEmpty = @<p>No songs yet.</p>;
    RenderFragment<Song> DefaultCard = s => @<p>@s.Title</p>;
}`,
        checks: [
          { label: 'A default RenderFragment written as @<…>', re: String.raw`RenderFragment\s+(\w+)\s*=\s*@<\w+` },
          { label: 'A default RenderFragment<Song> lambda', re: String.raw`RenderFragment<Song>\s+(\w+)\s*=\s*\(?\s*\w+\s*\)?\s*=>\s*@<\w+` },
          { label: 'Render Empty ?? your default', re: String.raw`@\(\s*Empty\s*\?\?\s*\w+\s*\)` },
          { label: 'Render (Card ?? your default)(song)', re: String.raw`@\(\s*\(\s*Card\s*\?\?\s*\w+\s*\)\s*\(\s*song\s*\)\s*\)` },
        ],
        hint: 'Write templates in @code with @<p>…</p>, then pick one with ??.',
        explain: 'Null-coalescing picks the parent’s template if given, so the list always shows something sensible.',
      },
    ],
    // L3 Dynamic components & sections
    [
      {
        kind: 'write',
        prompt: 'Render a dashboard widget chosen at runtime, passing it a TimeZone.',
        starter: '',
        solution: `<DynamicComponent Type="widgetType" Parameters="widgetParams" />

@code {
    Type widgetType = typeof(ClockWidget);
    Dictionary<string, object> widgetParams = new() { ["TimeZone"] = "Europe/Paris" };
}`,
        checks: [
          { label: '<DynamicComponent Type="…" Parameters="…" />', re: String.raw`<DynamicComponent(?=[^>]*Type="@?\w+")(?=[^>]*Parameters="@?\w+")` },
          { label: 'A Type field set with typeof(…)', re: String.raw`Type\s+(\w+)\s*=\s*typeof\(\s*\w+\s*\)` },
          { label: 'A Dictionary<string, object> of parameters', re: String.raw`(I?Dictionary|IReadOnlyDictionary)<string,\s*object\??>\??\s+\w+\s*=` },
          { label: 'It holds a TimeZone entry', re: String.raw`\[\s*"TimeZone"\s*\]\s*=|\{\s*"TimeZone"\s*,` },
        ],
        hint: 'Type takes a System.Type, and Parameters maps parameter names to values.',
        explain: 'Change widgetType at runtime and DynamicComponent renders the new component with the same parameters.',
      },
      {
        kind: 'write',
        prompt: 'Let the basket page put a Checkout button into the layout’s header.',
        starter: `@* MainLayout.razor *@
@inherits LayoutComponentBase
<header>
    <h1>Shop</h1>
</header>
<main>@Body</main>

@* Basket.razor *@
@page "/basket"
<h2>Your basket</h2>`,
        solution: `@* MainLayout.razor *@
@inherits LayoutComponentBase
@using Microsoft.AspNetCore.Components.Sections
<header>
    <h1>Shop</h1>
    <SectionOutlet SectionName="header-actions" />
</header>
<main>@Body</main>

@* Basket.razor *@
@page "/basket"
@using Microsoft.AspNetCore.Components.Sections
<SectionContent SectionName="header-actions">
    <button>Checkout</button>
</SectionContent>
<h2>Your basket</h2>`,
        checks: [
          { label: 'A <SectionOutlet SectionName="…" /> in the header', re: String.raw`<header>[\s\S]*<SectionOutlet\s+SectionName="[^"]+"\s*/>[\s\S]*</header>` },
          { label: 'The page fills it with <SectionContent>', re: String.raw`@page[\s\S]*<SectionContent\s+SectionName="[^"]+">` },
          { label: 'Both use the same SectionName', re: String.raw`<SectionOutlet\s+SectionName="([^"]+)"[\s\S]*<SectionContent\s+SectionName="\1"` },
          { label: 'The Checkout button inside SectionContent', re: String.raw`<SectionContent[^>]*>\s*<button[^>]*>\s*Checkout\s*</button>\s*</SectionContent>` },
        ],
        hint: 'The layout marks the slot with SectionOutlet; the page supplies the markup with SectionContent.',
        explain: 'The button is written in the page but renders in the layout’s header, and it goes away when you leave the page.',
      },
    ],
    // L4 Controlling renders
    [
      {
        kind: 'write',
        prompt: 'Only re-render the sensor panel when the number of readings changes.',
        starter: `<p>Readings: @Points.Count</p>

@code {
    [Parameter] public IReadOnlyList<double> Points { get; set; } = [];
}`,
        solution: `<p>Readings: @Points.Count</p>

@code {
    [Parameter] public IReadOnlyList<double> Points { get; set; } = [];
    private int lastCount = -1;

    protected override bool ShouldRender()
    {
        var changed = Points.Count != lastCount;
        lastCount = Points.Count;
        return changed;
    }
}`,
        checks: [
          { label: 'Override ShouldRender()', re: String.raw`protected\s+override\s+bool\s+ShouldRender\(\)` },
          { label: 'Compare Points.Count with a remembered value', re: String.raw`ShouldRender\(\)[\s\S]*Points\.Count\s*(!=|==)\s*\w+|ShouldRender\(\)[\s\S]*\w+\s*(!=|==)\s*Points\.Count` },
          { label: 'Remember the new count', re: String.raw`\w+\s*=\s*Points\.Count\s*;` },
          { label: 'Don’t just return true', not: 'ShouldRender() => true' },
        ],
        hint: 'Keep the last count in a field; ShouldRender returns whether it changed, then updates it.',
        explain: 'Returning false skips the render the new parameters would cause; the very first render still happens.',
      },
      {
        kind: 'write',
        prompt: 'Skip renders while typing; render only when Save is clicked.',
        starter: `<input @oninput="OnInput" />
<p>Saved: @saved</p>
<button @onclick="Save">Save</button>

@code {
    string draft = "", saved = "";

    void OnInput(ChangeEventArgs e) => draft = e.Value?.ToString() ?? "";

    void Save() => saved = draft;
}`,
        solution: `<input @oninput="OnInput" />
<p>Saved: @saved</p>
<button @onclick="Save">Save</button>

@code {
    string draft = "", saved = "";
    bool dirty;

    void OnInput(ChangeEventArgs e) => draft = e.Value?.ToString() ?? "";

    void Save()
    {
        saved = draft;
        dirty = true;
    }

    protected override bool ShouldRender()
    {
        var render = dirty;
        dirty = false;
        return render;
    }
}`,
        checks: [
          { label: 'A bool flag field', re: String.raw`(^|\n)\s*(private\s+)?bool\s+\w+\s*(=\s*false\s*)?;` },
          { label: 'Save sets the flag to true', re: String.raw`void\s+Save\(\)\s*\{[^}]*\b\w+\s*=\s*true\s*;` },
          { label: 'Override ShouldRender()', re: String.raw`protected\s+override\s+bool\s+ShouldRender\(\)` },
          { label: 'ShouldRender resets the flag to false', re: String.raw`ShouldRender\(\)\s*\{[^}]*\b\w+\s*=\s*false` },
          { label: 'OnInput doesn’t set the flag', re: String.raw`void\s+OnInput\([^)]*\)\s*=>\s*draft\s*=[^;]*;|void\s+OnInput\([^)]*\)\s*\{(?![^}]*=\s*true)[^}]*\}` },
        ],
        hint: 'Every event handler triggers a render check; let only Save turn the flag on.',
        explain: 'Each keystroke still updates draft, but ShouldRender says no until Save, so the UI isn’t redrawn per key.',
      },
    ],
    // L5 Render trees & @ref
    [
      {
        kind: 'write',
        prompt: 'Hand-write the render tree for <a href=Url>Text</a>.',
        starter: `using Microsoft.AspNetCore.Components;
using Microsoft.AspNetCore.Components.Rendering;

public class ExternalLink : ComponentBase
{
    [Parameter] public string Url { get; set; } = "";
    [Parameter] public string Text { get; set; } = "";
}`,
        solution: `using Microsoft.AspNetCore.Components;
using Microsoft.AspNetCore.Components.Rendering;

public class ExternalLink : ComponentBase
{
    [Parameter] public string Url { get; set; } = "";
    [Parameter] public string Text { get; set; } = "";

    protected override void BuildRenderTree(RenderTreeBuilder builder)
    {
        builder.OpenElement(0, "a");
        builder.AddAttribute(1, "href", Url);
        builder.AddContent(2, Text);
        builder.CloseElement();
    }
}`,
        checks: [
          { label: 'Override BuildRenderTree(RenderTreeBuilder builder)', re: String.raw`protected\s+override\s+void\s+BuildRenderTree\(\s*RenderTreeBuilder\s+\w+\s*\)` },
          { label: 'OpenElement(0, "a")', re: String.raw`\.OpenElement\(\s*\d+\s*,\s*"a"\s*\)` },
          { label: 'AddAttribute(…, "href", Url)', re: String.raw`\.AddAttribute\(\s*\d+\s*,\s*"href"\s*,\s*Url\s*\)` },
          { label: 'AddContent(…, Text)', re: String.raw`\.AddContent\(\s*\d+\s*,\s*Text\s*\)` },
          { label: 'CloseElement() last', re: String.raw`\.AddContent\([^;]*;\s*\w+\.CloseElement\(\)` },
        ],
        hint: 'Open, add the attribute, add the content, close. Sequence numbers are hard-coded and go up.',
        explain: 'Fixed sequence numbers let Blazor’s diff line up the old and new trees, just as compiled Razor does.',
      },
      {
        kind: 'write',
        prompt: 'Give VideoPlayer a public Restart method and call it from a page button.',
        starter: `@* VideoPlayer.razor *@
<video src="@Src" data-position="@position"></video>
@code {
    [Parameter] public string Src { get; set; } = "";
    private double position = 42;
}

@* Lesson.razor *@
<VideoPlayer Src="intro.mp4" />`,
        solution: `@* VideoPlayer.razor *@
<video src="@Src" data-position="@position"></video>
@code {
    [Parameter] public string Src { get; set; } = "";
    private double position = 42;

    public void Restart()
    {
        position = 0;
        StateHasChanged();
    }
}

@* Lesson.razor *@
<VideoPlayer @ref="player" Src="intro.mp4" />
<button @onclick="() => player?.Restart()">Restart</button>
@code {
    private VideoPlayer? player;
}`,
        checks: [
          { label: 'A public void Restart() in VideoPlayer', re: String.raw`public\s+(void|Task|async\s+Task)\s+Restart\(\)` },
          { label: 'It resets position and calls StateHasChanged()', re: String.raw`Restart\(\)[\s\S]*position\s*=\s*0[\s\S]*StateHasChanged\(\)` },
          { label: '@ref on the VideoPlayer tag', re: String.raw`<VideoPlayer\s[^>]*@ref="(\w+)"` },
          { label: 'A VideoPlayer? field for it', re: String.raw`@ref="(\w+)"[\s\S]*VideoPlayer\??\s+\1\s*;` },
          { label: 'A button that calls Restart()', re: String.raw`<button[^<]*@onclick="[^"]*\b\w+\??\.Restart\(\)` },
        ],
        hint: '@ref fills a field with the component instance once it renders, so check it for null.',
        explain: 'Methods called through @ref aren’t events, so the child calls StateHasChanged itself to show the change.',
      },
    ],
  ],
};

export default unit;
