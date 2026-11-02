import type { DesktopUnit } from '../../../engine/types';

// Desktop edition: write-the-code challenges for Blazor unit 12 (Testing & best practices).
// lessons[i] runs after lesson i + 1. See docs/CONTENT_GUIDE.md.
const unit: DesktopUnit = {
  lessons: [
    // L1 Your first bUnit test
    [
      {
        kind: 'write',
        prompt: 'Test that the Banner component renders <h1>Daily Deals</h1>.',
        starter: '',
        solution: `public class BannerTests : BunitContext
{
    [Fact]
    public void ShowsTheHeading()
    {
        var cut = Render<Banner>();
        cut.MarkupMatches("<h1>Daily Deals</h1>");
    }
}`,
        checks: [
          { label: 'A test class that inherits BunitContext', re: String.raw`class\s+\w+\s*:\s*BunitContext\b` },
          { label: 'A [Fact] public void test method', re: String.raw`\[Fact\]\s*public\s+void\s+\w+\(\)` },
          { label: 'Render<Banner>() in memory', re: String.raw`Render<Banner>\(\s*\)` },
          { label: 'MarkupMatches("<h1>Daily Deals</h1>")', re: String.raw`\.MarkupMatches\(\s*@?"<h1>\s*Daily Deals\s*</h1>"\s*\)` },
        ],
        hint: 'Inherit BunitContext, mark the method [Fact], render, then compare the markup.',
        explain: 'Render<T>() builds the component without a browser, and MarkupMatches compares HTML while ignoring whitespace.',
      },
      {
        kind: 'write',
        prompt: 'Fix this test so xUnit runs it and bUnit renders the badge.',
        starter: `public class StockBadgeTests
{
    public void ShowsInStock()
    {
        var cut = new StockBadge();
        cut.MarkupMatches("<span class=\\"badge\\">In stock</span>");
    }
}`,
        solution: `public class StockBadgeTests : BunitContext
{
    [Fact]
    public void ShowsInStock()
    {
        var cut = Render<StockBadge>();
        cut.MarkupMatches("<span class=\\"badge\\">In stock</span>");
    }
}`,
        checks: [
          { label: 'The class inherits BunitContext', re: String.raw`class\s+StockBadgeTests\s*:\s*BunitContext\b` },
          { label: 'Mark the method with [Fact]', re: String.raw`\[Fact\]\s*public\s+void\s+ShowsInStock` },
          { label: 'Render<StockBadge>() instead of new', re: String.raw`Render<StockBadge>\(\s*\)` },
          { label: 'No new StockBadge()', not: 'new StockBadge()' },
        ],
        hint: 'xUnit only runs [Fact] methods, and components need a renderer, not new.',
        explain: 'A component made with new is never rendered. Render<T>() from BunitContext runs its lifecycle and gives you the markup.',
      },
    ],
    // L2 Parameters & clicks
    [
      {
        kind: 'write',
        prompt: 'Render PlayerCard with Name set to Ana and check the h3 text.',
        starter: '',
        solution: `[Fact]
public void ShowsThePlayerName()
{
    var cut = Render<PlayerCard>(p => p.Add(c => c.Name, "Ana"));
    Assert.Equal("Ana", cut.Find("h3").TextContent);
}`,
        checks: [
          { label: 'A [Fact] test method', re: String.raw`\[Fact\]\s*public\s+void\s+\w+\(\)` },
          {
            label: 'Pass Name = "Ana" with p.Add',
            re: String.raw`Render<PlayerCard>\(\s*(\w+)\s*=>\s*\1\s*\.Add\(\s*(\w+)\s*=>\s*\2\.Name\s*,\s*"Ana"\s*\)`,
          },
          { label: 'Find the h3', re: String.raw`\.Find\(\s*"[^"]*h3[^"]*"\s*\)` },
          { label: 'Assert.Equal("Ana", … .TextContent)', re: String.raw`Assert\.Equal\(\s*"Ana"\s*,[^;]*\.TextContent` },
        ],
        hint: 'The parameter builder is p => p.Add(c => c.Name, "Ana"). The expected value goes first in Assert.Equal.',
        explain: 'The lambda c => c.Name picks the parameter in a type-safe way, so renaming it breaks the test at compile time.',
      },
      {
        kind: 'write',
        prompt: 'Type Milk, click Add, then check the list has exactly one Milk item.',
        starter: `[Fact]
public void AddsAnItem()
{
    var cut = Render<ShoppingList>();
}`,
        solution: `[Fact]
public void AddsAnItem()
{
    var cut = Render<ShoppingList>();
    cut.Find("input").Change("Milk");
    cut.Find("button").Click();
    var items = cut.FindAll("li");
    Assert.Single(items);
    Assert.Equal("Milk", items[0].TextContent);
}`,
        checks: [
          { label: 'Change the input to "Milk"', re: String.raw`\.Find\(\s*"[^"]*input[^"]*"\s*\)\s*\.Change\(\s*"Milk"\s*\)` },
          { label: 'Click the button', re: String.raw`\.Find\(\s*"[^"]*button[^"]*"\s*\)\s*\.Click\(\)` },
          { label: 'Get every li with FindAll', re: String.raw`\.FindAll\(\s*"li"\s*\)` },
          { label: 'Assert there is exactly one', re: String.raw`Assert\.Single\(|Assert\.Equal\(\s*1\s*,` },
          { label: 'Assert its text is Milk', re: String.raw`Assert\.Equal\(\s*"Milk"\s*,[^;]*TextContent` },
        ],
        hint: 'Change fires the input’s change event, Click the button’s click; then FindAll("li").',
        explain: 'bUnit re-renders after each event, so FindAll right after Click already sees the new item.',
      },
    ],
    // L3 Faking dependencies
    [
      {
        kind: 'write',
        prompt: 'Give Forecast a fake IWeatherApi and check it shows Sunny.',
        starter: '',
        solution: `[Fact]
public void ShowsTheForecast()
{
    Services.AddSingleton<IWeatherApi>(new FakeWeatherApi());
    var cut = Render<Forecast>();
    Assert.Contains("Sunny", cut.Markup);
}`,
        checks: [
          { label: 'Register the fake on Services', re: String.raw`Services\.Add(Singleton|Scoped|Transient)<IWeatherApi\b` },
          { label: 'Register it before Render<Forecast>()', re: String.raw`Services\.Add\w+<IWeatherApi[\s\S]*Render<Forecast>\(` },
          { label: 'Assert the markup contains Sunny', re: String.raw`Assert\.Contains\(\s*"Sunny"|MarkupMatches\([^;]*Sunny|Assert\.Equal\(\s*"Sunny"` },
        ],
        hint: 'Services.AddSingleton<IWeatherApi>(new FakeWeatherApi()) goes first, then Render.',
        explain: 'The component injects IWeatherApi; registering a fake means the test never touches the network.',
      },
      {
        kind: 'write',
        prompt: 'Sign Mo in as Admin and plan the getTheme JS call before rendering.',
        starter: `[Fact]
public void AdminSeesDeleteAll()
{
    var cut = Render<AdminPanel>();
    Assert.Equal("Delete all", cut.Find("button.danger").TextContent);
}`,
        solution: `[Fact]
public void AdminSeesDeleteAll()
{
    var auth = AddAuthorization();
    auth.SetAuthorized("Mo");
    auth.SetRoles("Admin");
    JSInterop.Setup<string>("getTheme").SetResult("dark");

    var cut = Render<AdminPanel>();
    Assert.Equal("Delete all", cut.Find("button.danger").TextContent);
}`,
        checks: [
          { label: 'Fake auth with AddAuthorization()', has: 'AddAuthorization()' },
          { label: 'SetAuthorized("Mo")', re: String.raw`\.SetAuthorized\(\s*"Mo"\s*\)` },
          { label: 'SetRoles("Admin")', re: String.raw`\.SetRoles\(\s*"Admin"\s*\)` },
          { label: 'Plan getTheme with Setup<string>(…).SetResult(…)', re: String.raw`JSInterop\.Setup<string>\(\s*"getTheme"[^)]*\)\s*\.SetResult\(` },
          { label: 'Do all of it before Render', re: String.raw`^(?![\s\S]*Render<AdminPanel>[\s\S]*(SetAuthorized|SetRoles|JSInterop))[\s\S]*Render<AdminPanel>` },
        ],
        hint: 'var auth = AddAuthorization(); then auth.SetAuthorized and auth.SetRoles. JS calls are planned with JSInterop.Setup.',
        explain: 'Strict JSInterop fails on any unplanned call, and the fake auth state must exist before the component asks for it.',
      },
    ],
    // L4 Fast lists
    [
      {
        kind: 'write',
        prompt: 'Render a PlayerRow for each player, keyed by the player’s Id.',
        starter: '',
        solution: `<ul>
    @foreach (var player in players)
    {
        <PlayerRow @key="player.Id" Player="player" />
    }
</ul>`,
        checks: [
          { label: 'Loop with @foreach over players', re: String.raw`@foreach\s*\(\s*var\s+\w+\s+in\s+players\s*\)` },
          { label: 'A <PlayerRow> keyed with @key="….Id"', re: String.raw`<PlayerRow\s[^>]*@key="@?\(?\w+\.Id\)?"` },
          { label: 'Pass the player as the Player parameter', re: String.raw`<PlayerRow\s[^>]*Player="@?\w+"` },
        ],
        hint: '@key goes on the repeated component, next to its parameters.',
        explain: 'With @key, Blazor matches rows by Id, so inserting a player keeps each row’s state with the right player.',
      },
      {
        kind: 'write',
        prompt: 'Swap the loop for Virtualize so only visible order rows render.',
        starter: `<h2>All orders</h2>
@foreach (var order in orders)
{
    <div class="row">#@order.Id: @order.Customer</div>
}

@code {
    List<Order> orders = [];
}`,
        solution: `<h2>All orders</h2>
<Virtualize Items="orders" Context="order">
    <div class="row">#@order.Id: @order.Customer</div>
</Virtualize>

@code {
    List<Order> orders = [];
}`,
        checks: [
          { label: '<Virtualize Items="orders">', re: String.raw`<Virtualize\s[^>]*Items="@?orders"` },
          { label: 'The row markup inside Virtualize', re: String.raw`<Virtualize[\s\S]*class="row"[\s\S]*</Virtualize>` },
          { label: 'Name each item with Context or use @context', re: String.raw`<Virtualize\s[^>]*Context="order"|@context\.Id` },
          { label: 'No @foreach left', not: '@foreach' },
        ],
        hint: 'Virtualize replaces the loop: Items is the list, Context names the current item.',
        explain: 'Virtualize only renders the rows in view plus a few spare, so a list of 10,000 orders stays fast.',
      },
    ],
    // L5 Error boundaries
    [
      {
        kind: 'write',
        prompt: 'Wrap the StockTicker so a crash shows a friendly message instead.',
        starter: '',
        solution: `<ErrorBoundary>
    <ChildContent>
        <StockTicker />
    </ChildContent>
    <ErrorContent>
        <p class="error">Prices are unavailable right now.</p>
    </ErrorContent>
</ErrorBoundary>`,
        checks: [
          { label: 'An <ErrorBoundary> around it', re: String.raw`<ErrorBoundary[^>]*>[\s\S]*</ErrorBoundary>` },
          { label: '<StockTicker /> in <ChildContent>', re: String.raw`<ChildContent>\s*<StockTicker\s*/>\s*</ChildContent>` },
          { label: 'A message in <ErrorContent>', re: String.raw`<ErrorContent[^>]*>[\s\S]*\w[\s\S]*</ErrorContent>` },
        ],
        hint: 'ErrorBoundary has two templates: ChildContent and ErrorContent.',
        explain: 'If StockTicker throws, only the boundary’s area switches to ErrorContent; the rest of the page keeps working.',
      },
      {
        kind: 'write',
        prompt: 'Show the error message and add a Try again button that recovers.',
        starter: `@rendermode InteractiveServer

<ErrorBoundary>
    <ChildContent>
        <PhotoFeed />
    </ChildContent>
    <ErrorContent>
        <p>Feed failed.</p>
    </ErrorContent>
</ErrorBoundary>`,
        solution: `@rendermode InteractiveServer

<ErrorBoundary @ref="feedBoundary">
    <ChildContent>
        <PhotoFeed />
    </ChildContent>
    <ErrorContent Context="ex">
        <p>Feed failed: @ex.Message</p>
        <button @onclick="() => feedBoundary?.Recover()">Try again</button>
    </ErrorContent>
</ErrorBoundary>

@code {
    private ErrorBoundary? feedBoundary;
}`,
        checks: [
          { label: 'Capture the boundary with @ref', re: String.raw`<ErrorBoundary\s+@ref="(\w+)"[\s\S]*ErrorBoundary\??\s+\1\s*;` },
          { label: 'Name the exception with Context and show its Message', re: String.raw`<ErrorContent\s+Context="(\w+)"[\s\S]*@\1\.Message` },
          { label: 'A Try again button', re: String.raw`<button[^<]*@onclick[^<]*>\s*Try again\s*</button>` },
          { label: 'The button calls Recover() on the boundary', re: String.raw`@ref="(\w+)"[\s\S]*\b\1\??\.Recover\(\)` },
        ],
        hint: 'Declare an ErrorBoundary? field in @code, point @ref at it, and call field?.Recover() on click.',
        explain: 'Recover() resets the boundary and renders ChildContent again, so a passing glitch doesn’t need a page reload.',
      },
    ],
  ],
};

export default unit;
