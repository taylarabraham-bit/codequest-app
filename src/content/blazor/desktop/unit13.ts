import type { DesktopUnit } from '../../../engine/types';

// Desktop edition: write-the-code challenges for Blazor unit 13 (Styling components).
// lessons[i] runs after lesson i + 1. See docs/CONTENT_GUIDE.md.
const unit: DesktopUnit = {
  lessons: [
    // L1 Scope rules
    [
      {
        kind: 'write',
        prompt: 'Style the card box, and the h3 headings a parent passes in.',
        starter: '/* Card.razor.css (Card.razor renders <div class="card">@ChildContent</div>) */\n',
        solution: `/* Card.razor.css (Card.razor renders <div class="card">@ChildContent</div>) */
.card {
    border: 1px solid #ddd;
    padding: 1rem;
}

.card ::deep h3 {
    margin-top: 0;
}`,
        checks: [
          { label: 'A .card rule with at least one property', re: String.raw`(^|\n)\s*\.card\s*\{[^}]*:[^}]*\}` },
          { label: 'Reach the passed-in h3 with .card ::deep h3', re: String.raw`\.card\s+::deep\s+h3\s*\{[^}]*:[^}]*\}` },
        ],
        hint: 'The h3 comes from the parent, so it carries the parent’s scope. Put ::deep after an element Card renders.',
        explain: 'Scoped CSS only matches markup written in Card.razor; .card ::deep h3 reaches into content rendered inside the card.',
      },
      {
        kind: 'write',
        prompt: 'The tab buttons come from ChildContent, so these rules miss. Fix them.',
        starter: `/* Tabs.razor.css (Tabs.razor renders <div class="tabs">@ChildContent</div>) */
.tabs {
    display: flex;
    gap: 4px;
}

.tab {
    padding: 6px 12px;
}

.tab.active {
    font-weight: bold;
}`,
        solution: `/* Tabs.razor.css (Tabs.razor renders <div class="tabs">@ChildContent</div>) */
.tabs {
    display: flex;
    gap: 4px;
}

.tabs ::deep .tab {
    padding: 6px 12px;
}

.tabs ::deep .tab.active {
    font-weight: bold;
}`,
        checks: [
          { label: 'Keep the .tabs rule', re: String.raw`(^|\n)\s*\.tabs\s*\{` },
          { label: '.tabs ::deep .tab for the padding', re: String.raw`\.tabs\s+::deep\s+\.tab\s*\{[^}]*padding` },
          { label: '.tabs ::deep .tab.active for the bold tab', re: String.raw`\.tabs\s+::deep\s+\.tab\.active\s*\{[^}]*font-weight` },
          { label: 'No bare .tab rules left', re: String.raw`^(?![\s\S]*\n\s*\.tab[\s.{])` },
        ],
        hint: 'Prefix each .tab selector with .tabs ::deep, since .tabs is the element Tabs renders itself.',
        explain: 'Without ::deep the rules get Tabs’ scope attribute, which the parent’s buttons don’t carry, so nothing matched.',
      },
    ],
    // L2 Classes from C#
    [
      {
        kind: 'write',
        prompt: 'List the chores and give finished ones the done class.',
        starter: `@code {
    record Chore(string Name, bool Done);
    List<Chore> chores = [new("Dishes", true), new("Laundry", false)];
}`,
        solution: `<ul>
    @foreach (var chore in chores)
    {
        <li class="@(chore.Done ? "done" : null)">@chore.Name</li>
    }
</ul>

@code {
    record Chore(string Name, bool Done);
    List<Chore> chores = [new("Dishes", true), new("Laundry", false)];
}`,
        checks: [
          { label: 'Loop over chores with @foreach', re: String.raw`@foreach\s*\(\s*var\s+\w+\s+in\s+chores\s*\)` },
          {
            label: 'class is "done" when Done, else nothing',
            re: String.raw`class="@\(\s*!?\s*\w+\.Done\s*\?\s*("done"|null|"")\s*:\s*("done"|null|"")\s*\)"`,
          },
          { label: 'Show each chore’s Name', re: String.raw`<li[^>]*>\s*@\w+\.Name\s*</li>` },
        ],
        hint: 'A ternary inside @( ) can pick "done" or null.',
        explain: 'When the whole class value is null, Blazor leaves the attribute out, so unfinished chores get no class at all.',
        output: 'Dishes\nLaundry',
      },
      {
        kind: 'write',
        prompt: 'Size the savings bar by Pct, and add class full when it hits 100.',
        starter: `<div class="meter">
    <div class="fill"></div>
</div>
<p>@saved of @goal saved</p>

@code {
    int saved = 450;
    int goal = 600;
    int Pct => saved * 100 / goal;
}`,
        solution: `<div class="meter">
    <div class="@FillClass" style="width: @(Pct)%"></div>
</div>
<p>@saved of @goal saved</p>

@code {
    int saved = 450;
    int goal = 600;
    int Pct => saved * 100 / goal;
    string FillClass => Pct >= 100 ? "fill full" : "fill";
}`,
        checks: [
          { label: 'style="width: …%" built from Pct', re: String.raw`style="[^"]*width:\s*@\(?\s*Pct\s*\)?\s*%` },
          { label: 'The class depends on Pct >= 100', re: String.raw`Pct\s*>=\s*100\s*\?` },
          { label: 'Add full but keep fill', re: String.raw`"fill full"|"full fill"|"fill\s*@|fill @\(` },
        ],
        hint: 'Put @(Pct) in the style value, and a ternary on Pct >= 100 in the class.',
        explain: 'Attributes are just strings: Blazor recomputes width and class every render, so the bar tracks the data.',
        output: '450 of 600 saved',
      },
    ],
    // L3 Attribute splatting
    [
      {
        kind: 'write',
        prompt: 'Make TextField pass every extra attribute through to its input.',
        starter: '@* TextField.razor *@\n',
        solution: `@* TextField.razor *@
<input class="text-field" @attributes="Extra" />

@code {
    [Parameter(CaptureUnmatchedValues = true)]
    public Dictionary<string, object>? Extra { get; set; }
}`,
        checks: [
          { label: '[Parameter(CaptureUnmatchedValues = true)]', re: String.raw`\[Parameter\(\s*CaptureUnmatchedValues\s*=\s*true\s*\)\]` },
          {
            label: 'A dictionary of string to object',
            re: String.raw`(I?Dictionary|IReadOnlyDictionary)<string,\s*object\??>\??\s+\w+\s*\{\s*get;\s*set;\s*\}`,
          },
          {
            label: 'Spread it on the input with @attributes',
            re: String.raw`<input\b[^>]*@attributes="@?(\w+)"[\s\S]*Dictionary<string,\s*object\??>\??\s+\1\b`,
          },
        ],
        hint: 'One dictionary parameter catches the unmatched attributes; @attributes spreads them on an element.',
        explain: 'Now a parent can write <TextField placeholder="Email" maxlength="80" /> without TextField declaring each one.',
      },
      {
        kind: 'write',
        prompt: 'Reorder so parents can change type but can never replace class.',
        starter: `<button class="chip" @attributes="Rest" type="button">
    @ChildContent
</button>

@code {
    [Parameter] public RenderFragment? ChildContent { get; set; }
    [Parameter(CaptureUnmatchedValues = true)]
    public IReadOnlyDictionary<string, object>? Rest { get; set; }
}`,
        solution: `<button type="button" @attributes="Rest" class="chip">
    @ChildContent
</button>

@code {
    [Parameter] public RenderFragment? ChildContent { get; set; }
    [Parameter(CaptureUnmatchedValues = true)]
    public IReadOnlyDictionary<string, object>? Rest { get; set; }
}`,
        checks: [
          { label: 'type="button" before @attributes, so a parent can override it', re: String.raw`<button\b[^>]*type="button"[^>]*@attributes="Rest"` },
          { label: 'class="chip" after @attributes, so it always wins', re: String.raw`<button\b[^>]*@attributes="Rest"[^>]*class="chip"` },
          { label: 'Keep the captured Rest parameter', has: 'CaptureUnmatchedValues = true' },
        ],
        hint: 'When an attribute appears twice, the one furthest right wins.',
        explain: 'Defaults go left of @attributes and rules you enforce go right of it.',
      },
    ],
    // L4 A reusable Button
    [
      {
        kind: 'write',
        prompt: 'Write a Button with Variant, ChildContent and an OnClick callback.',
        starter: '@* Button.razor *@\n',
        solution: `@* Button.razor *@
<button class="btn btn-@Variant" @onclick="OnClick">
    @ChildContent
</button>

@code {
    [Parameter] public string Variant { get; set; } = "primary";
    [Parameter] public RenderFragment? ChildContent { get; set; }
    [Parameter] public EventCallback OnClick { get; set; }
}`,
        checks: [
          { label: 'A [Parameter] string Variant', re: String.raw`\[Parameter\]\s*public\s+string\??\s+Variant\b` },
          { label: 'The class uses the variant, e.g. btn-@Variant', re: String.raw`class="[^"]*@\(?Variant` },
          { label: 'Render @ChildContent inside the button', re: String.raw`<button[\s\S]*@ChildContent[\s\S]*</button>` },
          { label: 'A [Parameter] EventCallback OnClick', re: String.raw`\[Parameter\]\s*public\s+EventCallback(<MouseEventArgs>)?\s+OnClick\b` },
          { label: 'Wire it with @onclick="OnClick"', re: String.raw`@onclick="@?OnClick"` },
        ],
        hint: 'Three parameters: a string, a RenderFragment and an EventCallback.',
        explain: 'EventCallback runs the parent’s handler and re-renders the parent, so <Button OnClick="Save">Save</Button> just works.',
      },
      {
        kind: 'write',
        prompt: 'Switch to NavLinks with a current class, and style it from scoped CSS.',
        starter: `@* SideNav.razor *@
<nav class="side">
    <a href="">Home</a>
    <a href="deals">Deals</a>
</nav>

/* SideNav.razor.css */
.side a.current { font-weight: bold; }`,
        solution: `@* SideNav.razor *@
<nav class="side">
    <NavLink href="" Match="NavLinkMatch.All" ActiveClass="current">Home</NavLink>
    <NavLink href="deals" ActiveClass="current">Deals</NavLink>
</nav>

/* SideNav.razor.css */
.side ::deep a.current { font-weight: bold; }`,
        checks: [
          { label: 'Home is a NavLink matched only on /', re: String.raw`<NavLink(?=[^>]*href="")(?=[^>]*Match="NavLinkMatch\.All")[^>]*>\s*Home` },
          { label: 'Deals is a NavLink', re: String.raw`<NavLink[^>]*href="deals"[^>]*>\s*Deals` },
          { label: 'ActiveClass="current" on both', re: String.raw`(<NavLink[^>]*ActiveClass="current"[\s\S]*){2}` },
          { label: 'Reach the links with .side ::deep a.current', re: String.raw`\.side\s+::deep\s+a\.current` },
          { label: 'No plain <a> tags left', not: '<a href' },
        ],
        hint: 'NavLink is its own component, so its <a> doesn’t get SideNav’s scope: use ::deep.',
        explain: 'NavLink adds ActiveClass on the current page; Match="NavLinkMatch.All" stops Home being active everywhere.',
      },
    ],
    // L5 Razor class libraries
    [
      {
        kind: 'write',
        prompt: 'Create a Widgets library, reference it from Garden and import it.',
        starter: '',
        solution: `dotnet new razorclasslib -o Widgets
dotnet add Garden/Garden.csproj reference Widgets/Widgets.csproj

@* Garden/Components/_Imports.razor *@
@using Widgets`,
        checks: [
          { label: 'dotnet new razorclasslib -o Widgets', re: String.raw`dotnet\s+new\s+razorclasslib\s+(-o|--output)\s+Widgets\b` },
          {
            label: 'Reference Widgets.csproj from the Garden project',
            re: String.raw`dotnet\s+(add\s+\S*Garden\S*\s+reference|reference\s+add)\s+\S*Widgets\.csproj`,
          },
          { label: '@using Widgets in _Imports.razor', re: String.raw`@using\s+Widgets\s*(\n|$)` },
        ],
        hint: 'Three steps: make the library, add a project reference, then a @using.',
        explain: 'A project reference builds the library with the app, and the @using in _Imports.razor makes its components usable everywhere.',
      },
      {
        kind: 'write',
        prompt: 'Load the Widgets library’s widgets.css and rating.js from its wwwroot.',
        starter: `<head>
    <meta charset="utf-8" />
    <base href="/" />
    <link rel="stylesheet" href="@Assets["app.css"]" />
    <link rel="stylesheet" href="@Assets["Garden.styles.css"]" />
    <HeadOutlet />
</head>
<body>
    <Routes />
    <script src="_framework/blazor.web.js"></script>
</body>`,
        solution: `<head>
    <meta charset="utf-8" />
    <base href="/" />
    <link rel="stylesheet" href="@Assets["app.css"]" />
    <link rel="stylesheet" href="@Assets["_content/Widgets/widgets.css"]" />
    <link rel="stylesheet" href="@Assets["Garden.styles.css"]" />
    <HeadOutlet />
</head>
<body>
    <Routes />
    <script src="_framework/blazor.web.js"></script>
    <script src="@Assets["_content/Widgets/rating.js"]"></script>
</body>`,
        checks: [
          { label: 'A stylesheet link to _content/Widgets/widgets.css', re: String.raw`<link\b[^>]*href="(@Assets\[")?_content/Widgets/widgets\.css` },
          { label: 'A script from _content/Widgets/rating.js', re: String.raw`<script\b[^>]*src="(@Assets\[")?_content/Widgets/rating\.js` },
          { label: 'Keep Garden.styles.css (it already bundles Widgets’ scoped CSS)', has: 'Garden.styles.css' },
          { label: 'No separate Widgets.styles.css link', not: 'Widgets.styles.css' },
        ],
        hint: 'A library’s wwwroot is served at _content/{LibraryName}/.',
        explain: 'Static files come from _content/Widgets/, while the library’s .razor.css is already in the app’s Garden.styles.css bundle.',
      },
    ],
  ],
};

export default unit;
