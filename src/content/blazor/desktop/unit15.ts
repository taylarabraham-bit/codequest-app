import type { DesktopUnit } from '../../../engine/types';

// Desktop edition: write-the-code challenges for Blazor unit 15 (Localization).
// lessons[i] runs after lesson i + 1. See docs/CONTENT_GUIDE.md.
const unit: DesktopUnit = {
  lessons: [
    // L1 Your first localizer
    [
      {
        kind: 'write',
        prompt: 'Register localization and translate the checkout heading and Pay button.',
        starter: `// Program.cs

@* Checkout.razor *@
`,
        solution: `// Program.cs
builder.Services.AddLocalization();

@* Checkout.razor *@
@using Microsoft.Extensions.Localization
@inject IStringLocalizer<Checkout> Loc

<h1>@Loc["YourBasket"]</h1>
<button>@Loc["PayNow"]</button>`,
        checks: [
          { label: 'builder.Services.AddLocalization() in Program.cs', has: 'builder.Services.AddLocalization(' },
          { label: '@inject IStringLocalizer<Checkout>', re: String.raw`@inject\s+IStringLocalizer<Checkout>\s+\w+` },
          { label: 'The heading text comes from the localizer', re: String.raw`@inject\s+IStringLocalizer<Checkout>\s+(\w+)[\s\S]*<h[1-3]>\s*@\1\["\w+"\]\s*</h[1-3]>` },
          { label: 'So does the button text', re: String.raw`@inject\s+IStringLocalizer<Checkout>\s+(\w+)[\s\S]*<button[^>]*>\s*@\1\["\w+"\]\s*</button>` },
        ],
        hint: 'Inject IStringLocalizer<Checkout> under a name like Loc, then write @Loc["Key"] where the text goes.',
        explain: 'The localizer looks each key up for the current culture; with no translation yet you see the key itself.',
        output: 'YourBasket\nPayNow',
      },
      {
        kind: 'write',
        prompt: 'Replace every hard-coded string in the forecast card with localizer keys.',
        starter: `@inject IStringLocalizer<WeatherCard> L

<h2>Forecast</h2>
<p>No rain today.</p>
<button>Refresh</button>`,
        solution: `@inject IStringLocalizer<WeatherCard> L

<h2>@L["Forecast"]</h2>
<p>@L["NoRainToday"]</p>
<button>@L["Refresh"]</button>`,
        checks: [
          { label: 'The h2 uses @L["…"]', re: String.raw`<h2>\s*@L\["\w+"\]\s*</h2>` },
          { label: 'The paragraph uses @L["…"]', re: String.raw`<p>\s*@L\["\w+"\]\s*</p>` },
          { label: 'The button uses @L["…"]', re: String.raw`<button[^>]*>\s*@L\["\w+"\]\s*</button>` },
          { label: 'No English sentence left in the markup', not: 'No rain today.' },
        ],
        hint: 'Pick a short key per string, like "Forecast", and wrap it in @L[...].',
        explain: 'Short, stable keys survive copy edits; translators fill in the text for each culture in the .resx files.',
      },
    ],
    // L2 Resource files
    [
      {
        kind: 'write',
        prompt: 'Keep translations in Resources and welcome the player by name.',
        starter: `// Program.cs

@* Lobby.razor *@
@inject IStringLocalizer<Lobby> Loc

@code {
    string playerName = "Kai";
}`,
        solution: `// Program.cs
builder.Services.AddLocalization(options => options.ResourcesPath = "Resources");

@* Lobby.razor *@
@inject IStringLocalizer<Lobby> Loc
<p>@Loc["Welcome", playerName]</p>

@code {
    string playerName = "Kai";
}`,
        checks: [
          {
            label: 'AddLocalization with ResourcesPath = "Resources"',
            re: String.raw`AddLocalization\(\s*(\w+)\s*=>\s*\1\.ResourcesPath\s*=\s*"Resources"\s*\)`,
          },
          { label: 'Pass playerName as an argument: Loc["Key", playerName]', re: String.raw`@Loc\[\s*"\w+"\s*,\s*playerName\s*\]` },
        ],
        hint: 'ResourcesPath is set in the options lambda. Extra values after the key fill {0}, {1}…',
        explain: 'A value like "Welcome, {0}!" lets each language put the name where its grammar needs it.',
      },
      {
        kind: 'write',
        prompt: 'Add the French Welcome and Logout values to this resource file.',
        starter: `<!-- Resources/Pages.Lobby.fr.resx (inside <root>) -->
<data name="Title" xml:space="preserve">
    <value>Salon</value>
</data>`,
        solution: `<!-- Resources/Pages.Lobby.fr.resx (inside <root>) -->
<data name="Title" xml:space="preserve">
    <value>Salon</value>
</data>
<data name="Welcome" xml:space="preserve">
    <value>Bienvenue, {0} !</value>
</data>
<data name="Logout" xml:space="preserve">
    <value>Se déconnecter</value>
</data>`,
        checks: [
          { label: 'A <data name="Welcome"> entry', re: String.raw`<data\s+name="Welcome"[^>]*>[\s\S]*?</data>` },
          { label: 'Its <value> has the {0} placeholder', re: String.raw`<data\s+name="Welcome"[^>]*>\s*<value>[^<]*\{0\}[^<]*</value>\s*</data>` },
          { label: 'A <data name="Logout"> with a value', re: String.raw`<data\s+name="Logout"[^>]*>\s*<value>[^<]*\w[^<]*</value>\s*</data>` },
          { label: 'Keep the Title entry', has: '<data name="Title"' },
        ],
        hint: 'Copy the Title entry’s shape: <data name="…"><value>…</value></data>.',
        explain: 'The file name says French (fr) for Pages/Lobby.razor; any key it lacks falls back to Pages.Lobby.resx.',
      },
    ],
    // L3 Request cultures
    [
      {
        kind: 'write',
        prompt: 'Support en-GB, es-ES and ja-JP, with en-GB as the default.',
        starter: 'var app = builder.Build();\n',
        solution: `var app = builder.Build();

string[] cultures = ["en-GB", "es-ES", "ja-JP"];
var options = new RequestLocalizationOptions()
    .SetDefaultCulture("en-GB")
    .AddSupportedCultures(cultures)
    .AddSupportedUICultures(cultures);
app.UseRequestLocalization(options);`,
        checks: [
          { label: 'List en-GB, es-ES and ja-JP', re: String.raw`(?=[\s\S]*"en-GB")(?=[\s\S]*"es-ES")(?=[\s\S]*"ja-JP")` },
          { label: 'new RequestLocalizationOptions()', re: String.raw`new\s+RequestLocalizationOptions\s*[({]` },
          { label: 'SetDefaultCulture to en-GB', re: String.raw`\.SetDefaultCulture\(\s*("en-GB"|\w+\[0\])\s*\)` },
          { label: 'AddSupportedCultures and AddSupportedUICultures', re: String.raw`\.AddSupportedCultures\([\s\S]*\.AddSupportedUICultures\(|\.AddSupportedUICultures\([\s\S]*\.AddSupportedCultures\(` },
          { label: 'app.UseRequestLocalization(…)', re: String.raw`app\.UseRequestLocalization\(` },
        ],
        hint: 'Build the options with the three chained calls, then pass them to app.UseRequestLocalization.',
        explain: 'Cultures set number and date formats, UI cultures pick the .resx file; listing both keeps them in step.',
      },
      {
        kind: 'write',
        prompt: 'Add request localization for nl-NL and en-US before the components are mapped.',
        starter: `var builder = WebApplication.CreateBuilder(args);
builder.Services.AddRazorComponents().AddInteractiveServerComponents();
builder.Services.AddLocalization();

var app = builder.Build();
app.UseAntiforgery();
app.MapStaticAssets();
app.MapRazorComponents<App>().AddInteractiveServerRenderMode();
app.Run();`,
        solution: `var builder = WebApplication.CreateBuilder(args);
builder.Services.AddRazorComponents().AddInteractiveServerComponents();
builder.Services.AddLocalization();

var app = builder.Build();

string[] cultures = ["nl-NL", "en-US"];
app.UseRequestLocalization(new RequestLocalizationOptions()
    .SetDefaultCulture("nl-NL")
    .AddSupportedCultures(cultures)
    .AddSupportedUICultures(cultures));

app.UseAntiforgery();
app.MapStaticAssets();
app.MapRazorComponents<App>().AddInteractiveServerRenderMode();
app.Run();`,
        checks: [
          { label: 'Support nl-NL and en-US', re: String.raw`(?=[\s\S]*"nl-NL")(?=[\s\S]*"en-US")` },
          { label: 'Pick a default with SetDefaultCulture', re: String.raw`\.SetDefaultCulture\(` },
          { label: 'Add both supported cultures and UI cultures', re: String.raw`(?=[\s\S]*\.AddSupportedCultures\()(?=[\s\S]*\.AddSupportedUICultures\()` },
          { label: 'UseRequestLocalization after Build()', re: String.raw`builder\.Build\(\)[\s\S]*app\.UseRequestLocalization\(` },
          { label: 'UseRequestLocalization before MapRazorComponents', re: String.raw`app\.UseRequestLocalization\([\s\S]*app\.MapRazorComponents<` },
        ],
        hint: 'Middleware runs in order, so the culture must be chosen before the components render.',
        explain: 'Placed early, the middleware sets the culture from ?culture=, the cookie or Accept-Language before any page renders.',
      },
    ],
    // L4 Formatting by culture
    [
      {
        kind: 'write',
        prompt: 'Show 1499.9 as N2 and 24 Dec 2026 as a short date, in German.',
        starter: '@using System.Globalization\n',
        solution: `@using System.Globalization

<p>@total.ToString("N2", de)</p>
<p>@due.ToString("d", de)</p>

@code {
    decimal total = 1499.9m;
    DateOnly due = new(2026, 12, 24);
    CultureInfo de = new("de-DE");
}`,
        checks: [
          {
            label: 'A CultureInfo for de-DE',
            re: String.raw`new(\s+CultureInfo)?\s*\(\s*"de-DE"\s*\)|CultureInfo\.GetCultureInfo\(\s*"de-DE"\s*\)`,
          },
          { label: 'The total with ToString("N2", culture)', re: String.raw`\.ToString\(\s*"N2"\s*,\s*[\w.()"-]+\s*\)` },
          { label: 'The date with ToString("d", culture)', re: String.raw`\.ToString\(\s*"d"\s*,\s*[\w.()"-]+\s*\)` },
          { label: 'Use the values 1499.9 and 2026-12-24', re: String.raw`(?=[\s\S]*1499\.9)(?=[\s\S]*2026\s*,\s*12\s*,\s*24)` },
        ],
        hint: 'Pass the CultureInfo as the second argument to ToString.',
        explain: 'German swaps the separators: a dot groups thousands and a comma marks decimals, and dates go day.month.year.',
        output: '1.499,90\n24.12.2026',
      },
      {
        kind: 'write',
        prompt: 'Keep the distance localized, but make the map link culture-proof.',
        starter: `<p>Distance: @km.ToString("N1") km</p>
<a href="@MapUrl">Open map</a>

@code {
    double km = 12.5;
    double lat = 48.8566;
    double lng = 2.3522;
    string MapUrl => $"map?lat={lat}&lng={lng}";
}`,
        solution: `@using System.Globalization

<p>Distance: @km.ToString("N1") km</p>
<a href="@MapUrl">Open map</a>

@code {
    double km = 12.5;
    double lat = 48.8566;
    double lng = 2.3522;
    string MapUrl => string.Create(CultureInfo.InvariantCulture, $"map?lat={lat}&lng={lng}");
}`,
        checks: [
          { label: 'Keep km.ToString("N1") for people', has: 'km.ToString("N1")' },
          {
            label: 'Build MapUrl with the invariant culture',
            re: String.raw`MapUrl\s*=>\s*(string\.Create\(\s*CultureInfo\.InvariantCulture|FormattableString\.Invariant\(|[^;]*lat\.ToString\(\s*CultureInfo\.InvariantCulture\s*\)[^;]*lng\.ToString\(\s*CultureInfo\.InvariantCulture\s*\))`,
          },
          { label: 'Import System.Globalization', re: String.raw`@using\s+System\.Globalization|System\.Globalization\.CultureInfo|FormattableString\.Invariant` },
        ],
        hint: 'In French, 48.8566 prints as 48,8566 and breaks the URL. Format it with CultureInfo.InvariantCulture.',
        explain: 'Text people read follows their culture; text machines parse, like URLs, must use the invariant culture.',
      },
    ],
    // L5 Picking a culture
    [
      {
        kind: 'write',
        prompt: 'Finish Set: store the culture in the cookie, then go back.',
        starter: `[Route("[controller]/[action]")]
public class CultureController : Controller
{
    public IActionResult Set(string culture, string redirectUri)
    {
    }
}`,
        solution: `[Route("[controller]/[action]")]
public class CultureController : Controller
{
    public IActionResult Set(string culture, string redirectUri)
    {
        HttpContext.Response.Cookies.Append(
            CookieRequestCultureProvider.DefaultCookieName,
            CookieRequestCultureProvider.MakeCookieValue(new RequestCulture(culture, culture)));
        return LocalRedirect(redirectUri);
    }
}`,
        checks: [
          { label: 'Append a cookie named DefaultCookieName', re: String.raw`Cookies\.Append\(\s*CookieRequestCultureProvider\.DefaultCookieName\s*,` },
          {
            label: 'Its value from MakeCookieValue(new RequestCulture(…))',
            re: String.raw`CookieRequestCultureProvider\.MakeCookieValue\(\s*new\s+RequestCulture\(\s*culture`,
          },
          { label: 'return LocalRedirect(redirectUri)', re: String.raw`return\s+LocalRedirect\(\s*redirectUri\s*\)` },
        ],
        hint: 'Response.Cookies.Append(name, value), where both come from CookieRequestCultureProvider.',
        explain: 'The cookie provider reads this cookie on every request; LocalRedirect refuses to bounce users to other sites.',
      },
      {
        kind: 'write',
        prompt: 'When a language is picked, call Culture/Set with a full page reload.',
        starter: `@rendermode InteractiveServer
@inject NavigationManager Nav

<select @onchange="Pick">
    <option value="en-US">English</option>
    <option value="es-ES">Español</option>
</select>

@code {
    void Pick(ChangeEventArgs e)
    {
    }
}`,
        solution: `@rendermode InteractiveServer
@inject NavigationManager Nav

<select @onchange="Pick">
    <option value="en-US">English</option>
    <option value="es-ES">Español</option>
</select>

@code {
    void Pick(ChangeEventArgs e)
    {
        var culture = e.Value?.ToString() ?? "en-US";
        var back = new Uri(Nav.Uri).PathAndQuery;
        var url = $"Culture/Set?culture={Uri.EscapeDataString(culture)}&redirectUri={Uri.EscapeDataString(back)}";
        Nav.NavigateTo(url, forceLoad: true);
    }
}`,
        checks: [
          { label: 'Read the choice from e.Value', re: String.raw`e\.Value` },
          { label: 'Escape values with Uri.EscapeDataString', re: String.raw`Uri\.EscapeDataString\(` },
          { label: 'Send culture and redirectUri to Culture/Set', re: String.raw`Culture/Set\?culture=[\s\S]*redirectUri=` },
          { label: 'NavigateTo with forceLoad: true', re: String.raw`Nav\.NavigateTo\([^;]*,\s*(forceLoad:\s*)?true\s*\)` },
        ],
        hint: 'Build the Culture/Set URL with both query values escaped, then NavigateTo(url, forceLoad: true).',
        explain: 'forceLoad makes a real HTTP request, so the controller can set the cookie and the new culture applies on reload.',
      },
    ],
  ],
};

export default unit;
