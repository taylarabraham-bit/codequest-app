import type { DesktopUnit } from '../../../engine/types';

// Desktop edition: write-the-code challenges for Blazor unit 11 (Auth in Blazor).
// lessons[i] runs after lesson i + 1. See docs/CONTENT_GUIDE.md.
const unit: DesktopUnit = {
  lessons: [
    // L1 Showing by sign-in
    [
      {
        kind: 'write',
        prompt: 'Greet signed-in users by name and show guests a Log in link.',
        starter: '',
        solution: `<AuthorizeView>
    <Authorized>
        <p>Welcome back, @context.User.Identity?.Name!</p>
    </Authorized>
    <NotAuthorized>
        <a href="Account/Login">Log in</a>
    </NotAuthorized>
</AuthorizeView>`,
        checks: [
          { label: 'An <AuthorizeView> around everything', re: String.raw`<AuthorizeView>[\s\S]*</AuthorizeView>` },
          {
            label: '<Authorized> shows @context.User.Identity?.Name',
            re: String.raw`<Authorized>[\s\S]*@\(?context\.User\.Identity[?!]?\.Name[\s\S]*</Authorized>`,
          },
          {
            label: '<NotAuthorized> links to Account/Login',
            re: String.raw`<NotAuthorized>[\s\S]*<a\s[^>]*href="/?Account/Login"[\s\S]*</NotAuthorized>`,
          },
        ],
        hint: 'Put the greeting in <Authorized> and the link in <NotAuthorized>, both inside <AuthorizeView>.',
        explain: 'AuthorizeView picks one of its templates by sign-in state, and context.User is the current user inside it.',
        output: 'Welcome back, ana@gym.dev!',
      },
      {
        kind: 'write',
        prompt: 'Add a checking message and a guest message around the Book button.',
        starter: `<h2>Class timetable</h2>
<AuthorizeView>
    <button>Book a spot</button>
</AuthorizeView>`,
        solution: `<h2>Class timetable</h2>
<AuthorizeView>
    <Authorized>
        <button>Book a spot</button>
    </Authorized>
    <Authorizing>
        <p>Checking your account…</p>
    </Authorizing>
    <NotAuthorized>
        <p>Log in to book a class.</p>
    </NotAuthorized>
</AuthorizeView>`,
        checks: [
          { label: 'Move the button into <Authorized>', re: String.raw`<Authorized>\s*<button>[\s\S]*?</button>\s*</Authorized>` },
          { label: 'An <Authorizing> message for while it checks', re: String.raw`<Authorizing>[\s\S]*\w[\s\S]*</Authorizing>` },
          { label: 'A <NotAuthorized> message for guests', re: String.raw`<NotAuthorized>[\s\S]*\w[\s\S]*</NotAuthorized>` },
        ],
        hint: 'Once you use a named template like <NotAuthorized>, the button must go in its own <Authorized> template too.',
        explain: 'Bare child content and named templates can’t be mixed, so the button moves into <Authorized> beside the other two.',
      },
    ],
    // L2 Protecting pages
    [
      {
        kind: 'write',
        prompt: 'Make a /billing page that only signed-in users can open.',
        starter: '',
        solution: `@page "/billing"
@using Microsoft.AspNetCore.Authorization
@attribute [Authorize]

<h1>Billing</h1>`,
        checks: [
          { label: 'Route it with @page "/billing"', re: String.raw`@page\s+"/billing"` },
          {
            label: '@using Microsoft.AspNetCore.Authorization',
            re: String.raw`@using\s+Microsoft\.AspNetCore\.Authorization\b|\[\s*Microsoft\.AspNetCore\.Authorization\.Authorize`,
          },
          { label: 'Lock it with @attribute [Authorize]', re: String.raw`@attribute\s*\[\s*(Microsoft\.AspNetCore\.Authorization\.)?Authorize\s*\]` },
          { label: 'A heading for the page', re: String.raw`<h[1-3]>[\s\S]+?</h[1-3]>` },
        ],
        hint: 'Three directive lines at the top: @page, @using, then @attribute.',
        explain: '[Authorize] on a routable page blocks the whole page for anyone not signed in, not just some markup.',
      },
      {
        kind: 'write',
        prompt: 'Make the router enforce [Authorize] and explain to guests why.',
        starter: `<Router AppAssembly="typeof(Program).Assembly" NotFoundPage="typeof(Pages.NotFound)">
    <Found Context="routeData">
        <RouteView RouteData="routeData" DefaultLayout="typeof(Layout.MainLayout)" />
        <FocusOnNavigate RouteData="routeData" Selector="h1" />
    </Found>
</Router>`,
        solution: `<Router AppAssembly="typeof(Program).Assembly" NotFoundPage="typeof(Pages.NotFound)">
    <Found Context="routeData">
        <AuthorizeRouteView RouteData="routeData" DefaultLayout="typeof(Layout.MainLayout)">
            <NotAuthorized>
                <p>Please log in to see this page.</p>
            </NotAuthorized>
        </AuthorizeRouteView>
        <FocusOnNavigate RouteData="routeData" Selector="h1" />
    </Found>
</Router>`,
        checks: [
          { label: 'Swap RouteView for <AuthorizeRouteView>', re: String.raw`<AuthorizeRouteView\s[^>]*RouteData="routeData"` },
          { label: 'Keep the DefaultLayout', re: String.raw`<AuthorizeRouteView\s[^>]*DefaultLayout="typeof\(Layout\.MainLayout\)"` },
          {
            label: 'A <NotAuthorized> message inside it',
            re: String.raw`<AuthorizeRouteView[\s\S]*<NotAuthorized>[\s\S]*\w[\s\S]*</NotAuthorized>[\s\S]*</AuthorizeRouteView>`,
          },
          { label: 'No plain <RouteView> left', not: '<RouteView' },
        ],
        hint: 'AuthorizeRouteView takes the same RouteData and DefaultLayout, plus a <NotAuthorized> template.',
        explain: 'AuthorizeRouteView checks each page’s [Authorize] before rendering it and shows <NotAuthorized> when the check fails.',
      },
    ],
    // L3 Roles & policies
    [
      {
        kind: 'write',
        prompt: 'Show the Refund button only to the Admin or Support roles.',
        starter: '<h3>Order #1042</h3>\n',
        solution: `<h3>Order #1042</h3>
<AuthorizeView Roles="Admin, Support">
    <Authorized>
        <button>Refund</button>
    </Authorized>
    <NotAuthorized>
        <p>Contact support for refunds.</p>
    </NotAuthorized>
</AuthorizeView>`,
        checks: [
          { label: 'AuthorizeView with Roles for Admin and Support', re: String.raw`<AuthorizeView\s+Roles="\s*(Admin\s*,\s*Support|Support\s*,\s*Admin)\s*"` },
          { label: 'The Refund button inside <Authorized>', re: String.raw`<Authorized>[\s\S]*<button[^>]*>\s*Refund\s*</button>[\s\S]*</Authorized>` },
          { label: 'A <NotAuthorized> note for everyone else', re: String.raw`<NotAuthorized>[\s\S]*\w[\s\S]*</NotAuthorized>` },
        ],
        hint: 'Roles takes a comma-separated list, and any one role is enough.',
        explain: 'Roles="Admin, Support" lets in a user with either role; everyone else sees the NotAuthorized content.',
      },
      {
        kind: 'write',
        prompt: 'Add a ViewPayroll policy for HR or Finance, and lock the payroll page with it.',
        starter: `// Program.cs
builder.Services.AddAuthorizationBuilder();

@* Payroll.razor *@
@page "/payroll"
<h1>Payroll</h1>`,
        solution: `// Program.cs
builder.Services.AddAuthorizationBuilder()
    .AddPolicy("ViewPayroll", p => p.RequireRole("HR", "Finance"));

@* Payroll.razor *@
@page "/payroll"
@attribute [Authorize(Policy = "ViewPayroll")]
<h1>Payroll</h1>`,
        checks: [
          { label: 'AddPolicy("ViewPayroll", …) on the builder', re: String.raw`AddAuthorizationBuilder\(\)\s*\.AddPolicy\(\s*"ViewPayroll"` },
          {
            label: 'The policy requires the HR or Finance role',
            re: String.raw`RequireRole\(\s*("HR"\s*,\s*"Finance"|"Finance"\s*,\s*"HR")\s*\)`,
          },
          { label: 'The page uses [Authorize(Policy = "ViewPayroll")]', re: String.raw`@attribute\s*\[\s*Authorize\(\s*Policy\s*=\s*"ViewPayroll"\s*\)\s*\]` },
        ],
        hint: 'Chain .AddPolicy("ViewPayroll", p => p.RequireRole(...)), then name the policy in [Authorize(Policy = ...)].',
        explain: 'A policy keeps the rule in one place in Program.cs; pages just name it, so changing who may see payroll is a one-line edit.',
      },
    ],
    // L4 The user in code
    [
      {
        kind: 'write',
        prompt: 'Read the auth state in code and show Signed in or Guest.',
        starter: '<p>@(signedIn ? "Signed in" : "Guest")</p>\n',
        solution: `<p>@(signedIn ? "Signed in" : "Guest")</p>

@code {
    [CascadingParameter] private Task<AuthenticationState>? AuthState { get; set; }
    private bool signedIn;

    protected override async Task OnInitializedAsync()
    {
        if (AuthState is null) return;
        var user = (await AuthState).User;
        signedIn = user.Identity?.IsAuthenticated == true;
    }
}`,
        checks: [
          {
            label: 'A [CascadingParameter] of type Task<AuthenticationState>',
            re: String.raw`\[CascadingParameter\][\s\S]*?Task<AuthenticationState>\??\s+\w+`,
          },
          { label: 'Override OnInitializedAsync', re: String.raw`override\s+async\s+Task\s+OnInitializedAsync\(\)` },
          { label: 'Await it and read .User', re: String.raw`await\s+\w+[\s\S]*\.User\b` },
          { label: 'Set signedIn from Identity.IsAuthenticated', re: String.raw`signedIn\s*=[^;]*IsAuthenticated` },
        ],
        hint: 'The auth state arrives as a Task; await it in OnInitializedAsync, then look at .User.Identity.',
        explain: 'AddCascadingAuthenticationState hands every component the sign-in state; awaiting it gives the ClaimsPrincipal.',
      },
      {
        kind: 'write',
        prompt: 'Set isAdmin from the cascading auth state so admins see the stock link.',
        starter: `@if (isAdmin)
{
    <a href="admin/stock">Manage stock</a>
}

@code {
    private bool isAdmin;
}`,
        solution: `@if (isAdmin)
{
    <a href="admin/stock">Manage stock</a>
}

@code {
    [CascadingParameter] private Task<AuthenticationState>? AuthState { get; set; }
    private bool isAdmin;

    protected override async Task OnInitializedAsync()
    {
        if (AuthState is null) return;
        var user = (await AuthState).User;
        isAdmin = user.IsInRole("Admin");
    }
}`,
        checks: [
          {
            label: 'Receive Task<AuthenticationState> as a [CascadingParameter]',
            re: String.raw`\[CascadingParameter\][\s\S]*?Task<AuthenticationState>\??\s+\w+`,
          },
          { label: 'Do the check in OnInitializedAsync', re: String.raw`override\s+async\s+Task\s+OnInitializedAsync\(\)` },
          { label: 'Skip it when the state is null', re: String.raw`is\s+null|==\s*null|is\s+not\s+null|!=\s*null|\?\.` },
          { label: 'isAdmin = user.IsInRole("Admin")', re: String.raw`isAdmin\s*=[^;]*IsInRole\(\s*"Admin"\s*\)` },
        ],
        hint: 'Same pattern as reading the user: await the task, take .User, then call IsInRole.',
        explain: 'IsInRole checks the role claims on the user. Role names are case-sensitive, so "Admin" must match exactly.',
      },
    ],
    // L5 Auth across modes
    [
      {
        kind: 'write',
        prompt: 'Let WebAssembly components in the .Client project know who is signed in.',
        starter: `// Shop.Client/Program.cs
var builder = WebAssemblyHostBuilder.CreateDefault(args);

await builder.Build().RunAsync();`,
        solution: `// Shop.Client/Program.cs
var builder = WebAssemblyHostBuilder.CreateDefault(args);
builder.Services.AddAuthorizationCore();
builder.Services.AddCascadingAuthenticationState();
builder.Services.AddAuthenticationStateDeserialization();
await builder.Build().RunAsync();`,
        checks: [
          { label: 'builder.Services.AddAuthorizationCore()', has: 'builder.Services.AddAuthorizationCore()' },
          { label: 'builder.Services.AddCascadingAuthenticationState()', has: 'builder.Services.AddCascadingAuthenticationState()' },
          { label: 'builder.Services.AddAuthenticationStateDeserialization()', has: 'builder.Services.AddAuthenticationStateDeserialization(' },
          { label: 'Register them before Build()', re: String.raw`AddAuthenticationStateDeserialization[\s\S]*builder\.Build\(\)` },
        ],
        hint: 'Three service registrations: the authorization core, the cascading state, and the deserializer.',
        explain: 'The browser can’t read the auth cookie itself, so it deserializes the user the server sent along with the page.',
      },
      {
        kind: 'write',
        prompt: 'Send the user to WebAssembly components and lock the wishlist API.',
        starter: `builder.Services.AddRazorComponents()
    .AddInteractiveServerComponents()
    .AddInteractiveWebAssemblyComponents();

var app = builder.Build();

app.MapGet("/api/wishlist", (WishlistStore store, ClaimsPrincipal user) =>
    store.For(user.Identity!.Name!));`,
        solution: `builder.Services.AddRazorComponents()
    .AddInteractiveServerComponents()
    .AddInteractiveWebAssemblyComponents()
    .AddAuthenticationStateSerialization();

var app = builder.Build();

app.MapGet("/api/wishlist", (WishlistStore store, ClaimsPrincipal user) =>
    store.For(user.Identity!.Name!))
    .RequireAuthorization();`,
        checks: [
          { label: 'Chain .AddAuthenticationStateSerialization()', re: String.raw`AddInteractiveWebAssemblyComponents\(\)\s*\.AddAuthenticationStateSerialization\(` },
          { label: 'The endpoint calls .RequireAuthorization()', re: String.raw`MapGet\([\s\S]*\)\s*\.RequireAuthorization\(` },
          { label: 'Keep the WebAssembly components', has: 'AddInteractiveWebAssemblyComponents()' },
        ],
        hint: 'Serialization chains onto AddRazorComponents; RequireAuthorization chains onto MapGet.',
        explain: 'Serialization ships the user to the browser for the UI, but the API must still check on the server, because browser code can be changed.',
      },
    ],
  ],
};

export default unit;
