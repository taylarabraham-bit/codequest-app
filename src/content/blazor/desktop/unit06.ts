import type { DesktopUnit } from '../../../engine/types';

// Desktop edition: write-the-code challenges for Blazor unit 6 (Routing & navigation).
// lessons[i] runs after lesson i + 1. See docs/CONTENT_GUIDE.md.
const unit: DesktopUnit = {
  lessons: [
    // L1 Pages & links
    [
      {
        kind: 'write',
        prompt: 'Make Deals a page at both /deals and /offers, and link to it.',
        starter: '@* Pages/Deals.razor *@\n\n\n@* Layout/NavMenu.razor *@\n',
        solution:
          '@* Pages/Deals.razor *@\n@page "/deals"\n@page "/offers"\n<h1>Hot deals</h1>\n\n@* Layout/NavMenu.razor *@\n<nav>\n    <NavLink href="deals">Deals</NavLink>\n</nav>',
        checks: [
          { label: '@page "/deals"', re: '@page\\s+"/deals"' },
          { label: 'A second @page for "/offers"', re: '@page\\s+"/offers"' },
          { label: 'Some content on the page', re: '@page[^\\n]*\\n\\s*<(\\w+)[^>]*>[^<]*\\S[^<]*</\\1>' },
          { label: 'A NavLink to deals in the menu', re: 'NavMenu\\.razor[\\s\\S]*<NavLink[^>]*href="/?(deals|offers)"[^>]*>[^<]*\\S[^<]*</NavLink>' },
        ],
        hint: 'Each @page line adds one URL. NavLink works like <a> with an href.',
        explain: 'Both URLs show the same component, and the NavLink gets the active class while you’re on it.',
        output: 'Hot deals',
      },
      {
        kind: 'write',
        prompt: 'Switch the menu to NavLinks; Home must only light up on the home page.',
        starter:
          '@* Layout/NavMenu.razor *@\n<nav>\n    <a href="">Home</a>\n    <a href="news">News</a>\n    <a href="events">Events</a>\n</nav>',
        solution:
          '@* Layout/NavMenu.razor *@\n<nav>\n    <NavLink href="" Match="NavLinkMatch.All">Home</NavLink>\n    <NavLink href="news">News</NavLink>\n    <NavLink href="events">Events</NavLink>\n</nav>',
        checks: [
          { label: 'No plain <a> links left', re: '^(?![\\s\\S]*<a\\s)' },
          { label: 'Home is a NavLink with Match="NavLinkMatch.All"', re: '<NavLink(?=[^>]*href="/?")(?=[^>]*Match="NavLinkMatch\\.All")[^>]*>\\s*Home' },
          { label: 'News and Events are NavLinks', re: '<NavLink[^>]*href="/?news"[\\s\\S]*<NavLink[^>]*href="/?events"' },
          { label: 'Only Home uses NavLinkMatch.All', re: '^(?![\\s\\S]*NavLinkMatch\\.All[\\s\\S]*NavLinkMatch\\.All)' },
        ],
        hint: 'An empty href matches every URL as a prefix. Match changes that for one link.',
        explain: 'By default a NavLink is active for its URL and everything below it, so the home link would always be lit. News stays prefix so /news/42 lights it.',
      },
    ],
    // L2 Route parameters
    [
      {
        kind: 'write',
        prompt: 'Make an order page whose URL ends in a numeric order id.',
        starter: '',
        solution: '@page "/orders/{Id:int}"\n<h1>Order #@Id</h1>\n@code {\n    [Parameter] public int Id { get; set; }\n}',
        checks: [
          { label: 'A route with an {Id:int} segment', re: '@page\\s+"/\\w+(/\\w+)*/\\{\\w+:int\\}"' },
          { label: 'A matching int [Parameter] property', re: '\\{(\\w+):int\\}[\\s\\S]*\\[Parameter\\]\\s*public\\s+int\\s+\\1\\s*\\{\\s*get;\\s*set;' },
          { label: 'Show the id on the page', re: '<\\w+>[^<]*@\\w+' },
        ],
        hint: 'Put the segment in braces with a constraint, and name the property the same.',
        explain: 'At /orders/42 this shows Order #42. The :int constraint only matches numbers, so /orders/abc never reaches this page.',
        output: 'Order #42',
      },
      {
        kind: 'write',
        prompt: 'Give /blog an optional page number, and make /docs catch the rest of the URL.',
        starter: '@* Blog.razor *@\n@page "/blog"\n<p>Blog page 1</p>\n\n@* Docs.razor *@\n@page "/docs"\n<p>Doc: home</p>',
        solution:
          '@* Blog.razor *@\n@page "/blog/{PageNo:int?}"\n<p>Blog page @(PageNo ?? 1)</p>\n@code {\n    [Parameter] public int? PageNo { get; set; }\n}\n\n@* Docs.razor *@\n@page "/docs/{*Path}"\n<p>Doc: @(Path ?? "home")</p>\n@code {\n    [Parameter] public string? Path { get; set; }\n}',
        checks: [
          { label: 'An optional {…:int?} segment on /blog', re: '@page\\s+"/blog/\\{\\w+:int\\?\\}"' },
          { label: 'A matching int? parameter', re: '\\{(\\w+):int\\?\\}[\\s\\S]*\\[Parameter\\]\\s*public\\s+int\\?\\s+\\1\\b' },
          { label: 'A catch-all {*…} segment on /docs', re: '@page\\s+"/docs/\\{\\*\\w+\\}"' },
          { label: 'A matching string? parameter', re: '\\{\\*(\\w+)\\}[\\s\\S]*\\[Parameter\\]\\s*public\\s+string\\??\\s+\\1\\b' },
        ],
        hint: 'A ? after the type makes the segment optional; a * before the name captures everything after it.',
        explain: '/blog and /blog/3 both match the first page. /docs/setup/linux puts "setup/linux" into one string.',
        output: 'Blog page 1',
      },
    ],
    // L3 Layouts
    [
      {
        kind: 'write',
        prompt: 'Write a ShopLayout with a header, the page body, and a footer.',
        starter: '@* Layout/ShopLayout.razor *@\n',
        solution:
          '@* Layout/ShopLayout.razor *@\n@inherits LayoutComponentBase\n<header>Plant Shop</header>\n<main>\n    @Body\n</main>\n<footer>Free delivery over 40 euros</footer>',
        checks: [
          { label: '@inherits LayoutComponentBase', has: '@inherits LayoutComponentBase' },
          { label: 'Render the page with @Body', has: '@Body' },
          { label: 'A header before @Body', re: '<header[^>]*>[\\s\\S]*@Body' },
          { label: 'A footer after @Body', re: '@Body[\\s\\S]*<footer[^>]*>' },
        ],
        hint: 'A layout is a component that inherits LayoutComponentBase and puts @Body where pages go.',
        explain: 'Every page using this layout appears where @Body is, between the shared header and footer.',
      },
      {
        kind: 'write',
        prompt: 'Default to MainLayout; Admin uses AdminLayout, which nests inside MainLayout.',
        starter:
          '@* Routes.razor *@\n<Router AppAssembly="typeof(Program).Assembly">\n    <Found Context="routeData">\n        <RouteView RouteData="routeData" />\n    </Found>\n</Router>\n\n@* Pages/Admin.razor *@\n@page "/admin"\n<h1>Admin</h1>\n\n@* Layout/AdminLayout.razor *@\n',
        solution:
          '@* Routes.razor *@\n<Router AppAssembly="typeof(Program).Assembly">\n    <Found Context="routeData">\n        <RouteView RouteData="routeData" DefaultLayout="typeof(MainLayout)" />\n    </Found>\n</Router>\n\n@* Pages/Admin.razor *@\n@page "/admin"\n@layout AdminLayout\n<h1>Admin</h1>\n\n@* Layout/AdminLayout.razor *@\n@inherits LayoutComponentBase\n@layout MainLayout\n<div class="admin">@Body</div>',
        checks: [
          { label: 'RouteView defaults to MainLayout', re: '<RouteView[^>]*DefaultLayout="typeof\\(\\s*MainLayout\\s*\\)"' },
          { label: 'The Admin page picks @layout AdminLayout', re: '@layout\\s+AdminLayout\\b' },
          { label: 'AdminLayout inherits LayoutComponentBase and renders @Body', re: 'AdminLayout\\.razor[\\s\\S]*@inherits\\s+LayoutComponentBase[\\s\\S]*@Body' },
          { label: 'AdminLayout sits inside @layout MainLayout', re: 'AdminLayout\\.razor[\\s\\S]*@layout\\s+MainLayout\\b' },
        ],
        hint: 'DefaultLayout takes typeof(…). A layout can have its own @layout, just like a page.',
        explain: 'Admin renders inside AdminLayout’s @Body, which itself renders inside MainLayout’s @Body.',
      },
    ],
    // L4 Navigating in code
    [
      {
        kind: 'write',
        prompt: 'After Checkout is clicked, send the shopper to /thanks.',
        starter: '@rendermode InteractiveServer\n',
        solution:
          '@rendermode InteractiveServer\n@inject NavigationManager Nav\n<button @onclick="Checkout">Checkout</button>\n@code {\n    void Checkout() => Nav.NavigateTo("/thanks");\n}',
        checks: [
          { label: 'Inject NavigationManager', re: '@inject\\s+NavigationManager\\s+\\w+' },
          { label: 'Call NavigateTo("/thanks") on it', re: '@inject\\s+NavigationManager\\s+(\\w+)[\\s\\S]*\\1\\.NavigateTo\\(\\s*"/?thanks"' },
          { label: 'A Checkout button with @onclick', re: '<button[^>]*@onclick="[^"]+"[^>]*>\\s*Checkout' },
        ],
        hint: '@inject Type Name gives you the service; NavigateTo takes the URL.',
        explain: 'NavigateTo moves to another page inside the app without a full reload.',
        output: 'Checkout',
      },
      {
        kind: 'write',
        prompt: 'Show the not-found page for unknown ids, and make Log out fully reload /logout.',
        starter:
          '@page "/product/{Id:int}"\n@rendermode InteractiveServer\n@inject NavigationManager Nav\n<h1>@name</h1>\n<button>Log out</button>\n@code {\n    [Parameter] public int Id { get; set; }\n    string? name;\n    Dictionary<int, string> products = new() { [1] = "Lamp", [2] = "Rug" };\n    protected override void OnParametersSet()\n    {\n        products.TryGetValue(Id, out name);\n    }\n}',
        solution:
          '@page "/product/{Id:int}"\n@rendermode InteractiveServer\n@inject NavigationManager Nav\n<h1>@name</h1>\n<button @onclick="LogOut">Log out</button>\n@code {\n    [Parameter] public int Id { get; set; }\n    string? name;\n    Dictionary<int, string> products = new() { [1] = "Lamp", [2] = "Rug" };\n    protected override void OnParametersSet()\n    {\n        if (!products.TryGetValue(Id, out name))\n        {\n            Nav.NotFound();\n        }\n    }\n    void LogOut() => Nav.NavigateTo("/logout", forceLoad: true);\n}',
        checks: [
          { label: 'Call Nav.NotFound() when the id is unknown', re: 'if\\s*\\([\\s\\S]*?\\)\\s*\\{?\\s*Nav\\.NotFound\\(\\s*\\)' },
          { label: 'Log out button has @onclick', re: '<button[^>]*@onclick="[^"]+"[^>]*>\\s*Log out' },
          { label: 'NavigateTo("/logout") with forceLoad: true', re: 'NavigateTo\\(\\s*"/logout"\\s*,\\s*(forceLoad:\\s*)?true\\s*\\)' },
        ],
        hint: 'TryGetValue returns false for a missing key. forceLoad is NavigateTo’s second argument.',
        explain: 'NotFound() shows the Router’s NotFoundPage. forceLoad makes the browser load /logout from the server, so it can clear the sign-in cookie.',
      },
    ],
    // L5 Query strings
    [
      {
        kind: 'write',
        prompt: 'On /shop, read the search text from ?q= and the page from ?page=.',
        starter: '@page "/shop"\n',
        solution:
          '@page "/shop"\n<p>Searching for @Search, page @PageNo</p>\n@code {\n    [SupplyParameterFromQuery(Name = "q")]\n    public string? Search { get; set; }\n\n    [SupplyParameterFromQuery(Name = "page")]\n    public int PageNo { get; set; }\n}',
        checks: [
          { label: 'A string? property filled from "q"', re: '\\[SupplyParameterFromQuery\\(\\s*Name\\s*=\\s*"q"\\s*\\)\\]\\s*public\\s+string\\??\\s+\\w+' },
          { label: 'An int property filled from "page"', re: '\\[SupplyParameterFromQuery(\\(\\s*Name\\s*=\\s*"page"\\s*\\))?\\]\\s*public\\s+int\\??\\s+\\w+' },
          { label: 'Show both on the page', re: '<p>[^<]*@\\w+[^<]*@\\w+' },
        ],
        hint: 'Add Name = "q" when the URL key differs from the property name.',
        explain: 'For /shop?q=lamp&page=2, Blazor fills both properties and converts page to an int for you.',
        output: 'Searching for lamp, page 2',
      },
      {
        kind: 'write',
        prompt: 'Add Previous and Next links that change only the page query value.',
        starter:
          '@page "/photos"\n@inject NavigationManager Nav\n<p>Page @current</p>\n@code {\n    [SupplyParameterFromQuery]\n    public int? Page { get; set; }\n    int current => Page ?? 1;\n}',
        solution:
          '@page "/photos"\n@inject NavigationManager Nav\n<p>Page @current</p>\n<a href="@(Nav.GetUriWithQueryParameter("page", current - 1))">Previous</a>\n<a href="@(Nav.GetUriWithQueryParameter("page", current + 1))">Next</a>\n@code {\n    [SupplyParameterFromQuery]\n    public int? Page { get; set; }\n    int current => Page ?? 1;\n}',
        checks: [
          { label: 'A Previous link to page - 1', re: '<a[^>]*href="@\\(?\\s*Nav\\.GetUriWithQueryParameter\\(\\s*"page"\\s*,\\s*\\w+\\s*-\\s*1\\s*\\)[^>]*>\\s*Previous' },
          { label: 'A Next link to page + 1', re: '<a[^>]*href="@\\(?\\s*Nav\\.GetUriWithQueryParameter\\(\\s*"page"\\s*,\\s*\\w+\\s*\\+\\s*1\\s*\\)[^>]*>\\s*Next' },
        ],
        hint: 'GetUriWithQueryParameter("page", value) keeps the rest of the URL and swaps page.',
        explain: 'Any other query values, like a filter, survive, because only page is added or replaced.',
        output: 'Page 1\nPrevious Next',
      },
    ],
  ],
};

export default unit;
