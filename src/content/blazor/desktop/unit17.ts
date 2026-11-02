import type { DesktopUnit } from '../../../engine/types';

// Desktop edition: write-the-code challenges for Blazor unit 17 (Blazor Hybrid with MAUI).
// lessons[i] runs after lesson i + 1. See docs/CONTENT_GUIDE.md.
const unit: DesktopUnit = {
  lessons: [
    // L1 Your first hybrid app
    [
      {
        kind: 'write',
        prompt: 'Host the Razor app in MainPage with a BlazorWebView.',
        starter: `<ContentPage xmlns="http://schemas.microsoft.com/dotnet/2021/maui"
             xmlns:x="http://schemas.microsoft.com/winfx/2009/xaml"
             xmlns:local="clr-namespace:TripLog"
             x:Class="TripLog.MainPage">

</ContentPage>`,
        solution: `<ContentPage xmlns="http://schemas.microsoft.com/dotnet/2021/maui"
             xmlns:x="http://schemas.microsoft.com/winfx/2009/xaml"
             xmlns:local="clr-namespace:TripLog"
             x:Class="TripLog.MainPage">
    <BlazorWebView x:Name="blazorWebView" HostPage="wwwroot/index.html">
        <BlazorWebView.RootComponents>
            <RootComponent Selector="#app" ComponentType="{x:Type local:Components.Routes}" />
        </BlazorWebView.RootComponents>
    </BlazorWebView>
</ContentPage>`,
        checks: [
          { label: 'A BlazorWebView with HostPage="wwwroot/index.html"', re: String.raw`<BlazorWebView\b[^>]*HostPage="wwwroot/index\.html"` },
          { label: 'A <BlazorWebView.RootComponents> section', re: String.raw`<BlazorWebView\.RootComponents>[\s\S]*</BlazorWebView\.RootComponents>` },
          { label: 'A RootComponent on Selector="#app"', re: String.raw`<RootComponent(?=[^>]*Selector="#app")` },
          { label: 'Its ComponentType is Routes via {x:Type}', re: String.raw`<RootComponent(?=[^>]*ComponentType="\{x:Type\s+\w+:[\w.]*Routes\}")` },
        ],
        hint: 'The web view needs a host page, and one root component mounted on the #app element of that page.',
        explain: 'BlazorWebView loads index.html into a native web view and renders Routes into #app, all in-process.',
      },
      {
        kind: 'write',
        prompt: 'This host page was copied from a web app. Fix it for the web view.',
        starter: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8" />
    <base href="/" />
    <link rel="stylesheet" href="css/app.css" />
</head>
<body>
    <div id="main">Loading...</div>
    <script src="_framework/blazor.web.js"></script>
</body>
</html>`,
        solution: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8" />
    <base href="/" />
    <link rel="stylesheet" href="css/app.css" />
</head>
<body>
    <div id="app">Loading...</div>
    <script src="_framework/blazor.webview.js" autostart="false"></script>
</body>
</html>`,
        checks: [
          { label: 'An element with id="app" for the RootComponent', re: String.raw`<div\b[^>]*id="app"` },
          { label: 'Load _framework/blazor.webview.js', re: String.raw`<script\b[^>]*src="_framework/blazor\.webview\.js"` },
          { label: 'No blazor.web.js', not: 'blazor.web.js' },
        ],
        hint: 'The Selector in MainPage.xaml is #app, and hybrid apps use the webview script.',
        explain: 'blazor.webview.js talks to the native host instead of a server, and #app is where Routes is mounted.',
      },
    ],
    // L2 MauiProgram.cs
    [
      {
        kind: 'write',
        prompt: 'Write CreateMauiApp with the Blazor web view and DEBUG-only dev tools.',
        starter: `public static class MauiProgram
{
}`,
        solution: `public static class MauiProgram
{
    public static MauiApp CreateMauiApp()
    {
        var builder = MauiApp.CreateBuilder();
        builder.UseMauiApp<App>();
        builder.Services.AddMauiBlazorWebView();
#if DEBUG
        builder.Services.AddBlazorWebViewDeveloperTools();
#endif
        return builder.Build();
    }
}`,
        checks: [
          { label: 'public static MauiApp CreateMauiApp()', re: String.raw`public\s+static\s+MauiApp\s+CreateMauiApp\(\)` },
          { label: 'MauiApp.CreateBuilder() and UseMauiApp<App>()', re: String.raw`MauiApp\.CreateBuilder\(\)[\s\S]*\.UseMauiApp<App>\(\)` },
          { label: 'AddMauiBlazorWebView()', has: 'Services.AddMauiBlazorWebView()' },
          { label: 'Dev tools only inside #if DEBUG', re: String.raw`#if DEBUG\s*\n\s*builder\.Services\.AddBlazorWebViewDeveloperTools\(\);\s*\n\s*#endif` },
          { label: 'return builder.Build()', re: String.raw`return\s+builder\.Build\(\)` },
        ],
        hint: 'Create the builder, register the web view, wrap dev tools in #if DEBUG … #endif, then build.',
        explain: 'Dev tools let you inspect the web view like a browser tab; #if DEBUG keeps them out of release builds.',
      },
      {
        kind: 'write',
        prompt: 'Register TripStore as a singleton, add debug logging, and inject it in a page.',
        starter: `// MauiProgram.cs
var builder = MauiApp.CreateBuilder();
builder.UseMauiApp<App>();
builder.Services.AddMauiBlazorWebView();
return builder.Build();

@* Components/Pages/Trips.razor *@
@page "/trips"
<h1>Trips</h1>`,
        solution: `// MauiProgram.cs
var builder = MauiApp.CreateBuilder();
builder.UseMauiApp<App>();
builder.Services.AddMauiBlazorWebView();
builder.Services.AddSingleton<TripStore>();
#if DEBUG
builder.Logging.AddDebug();
#endif
return builder.Build();

@* Components/Pages/Trips.razor *@
@page "/trips"
@inject TripStore Store
<h1>Trips (@Store.Count)</h1>`,
        checks: [
          { label: 'builder.Services.AddSingleton<TripStore>()', has: 'builder.Services.AddSingleton<TripStore>()' },
          { label: 'builder.Logging.AddDebug() inside #if DEBUG', re: String.raw`#if DEBUG\s*\n[^#]*builder\.Logging\.AddDebug\(\);[^#]*#endif` },
          { label: 'Register it all before Build()', re: String.raw`AddSingleton<TripStore>\(\)[\s\S]*#endif[\s\S]*return\s+builder\.Build\(\)` },
          { label: '@inject TripStore in the page', re: String.raw`@inject\s+TripStore\s+\w+` },
        ],
        hint: 'Services go on builder.Services, logging on builder.Logging, and both before return builder.Build().',
        explain: 'MauiProgram is the app’s DI root: components @inject the same TripStore for the whole app’s lifetime.',
      },
    ],
    // L3 Native device APIs
    [
      {
        kind: 'write',
        prompt: 'Add a Where am I? button that shows the device’s latitude and longitude.',
        starter: '',
        solution: `<button @onclick="FindMe">Where am I?</button>
<p>@where</p>

@code {
    string where = "";

    async Task FindMe()
    {
        var spot = await Geolocation.Default.GetLocationAsync();
        where = spot is null ? "Unknown" : $"{spot.Latitude:F3}, {spot.Longitude:F3}";
    }
}`,
        checks: [
          { label: 'A button whose @onclick runs an async method', re: String.raw`<button[^>]*@onclick="@?(\w+)"[\s\S]*async\s+Task\s+\1\(\)` },
          { label: 'await Geolocation.Default.GetLocationAsync()', re: String.raw`await\s+Geolocation\.Default\.GetLocationAsync\(` },
          { label: 'Handle a null location', re: String.raw`is\s+null|==\s*null|is\s+not\s+null|!=\s*null|\?\.` },
          { label: 'Show Latitude and Longitude', re: String.raw`(?=[\s\S]*\.Latitude)(?=[\s\S]*\.Longitude)` },
        ],
        hint: 'GetLocationAsync can return null when no fix is available.',
        explain: 'Hybrid components are native .NET, so they call MAUI’s Geolocation directly, no JavaScript needed.',
      },
      {
        kind: 'write',
        prompt: 'Remember the units setting, and save trips to the app data folder.',
        starter: `@code {
    string units = "metric";

    void SetUnits(string value)
    {
        units = value;
    }

    async Task SaveTripsAsync(string json)
    {
    }
}`,
        solution: `@code {
    string units = Preferences.Default.Get("units", "metric");

    void SetUnits(string value)
    {
        units = value;
        Preferences.Default.Set("units", value);
    }

    async Task SaveTripsAsync(string json)
    {
        var path = Path.Combine(FileSystem.AppDataDirectory, "trips.json");
        await File.WriteAllTextAsync(path, json);
    }
}`,
        checks: [
          { label: 'Start from Preferences.Default.Get with "metric" as default', re: String.raw`Preferences\.Default\.Get\(\s*"(\w+)"\s*,\s*"metric"\s*\)` },
          { label: 'Save it in SetUnits with Preferences.Default.Set', re: String.raw`void\s+SetUnits[\s\S]*Preferences\.Default\.Set\(\s*"\w+"\s*,\s*value\s*\)` },
          { label: 'Same key for Get and Set', re: String.raw`Get\(\s*"(\w+)"[\s\S]*Set\(\s*"\1"` },
          { label: 'Path.Combine(FileSystem.AppDataDirectory, …)', re: String.raw`Path\.Combine\(\s*FileSystem\.AppDataDirectory\s*,` },
          { label: 'Write the json with File.WriteAllTextAsync', re: String.raw`await\s+File\.WriteAllTextAsync\(\s*\w+\s*,\s*json\s*\)` },
        ],
        hint: 'Preferences is for small key/value settings; FileSystem.AppDataDirectory is for files the app keeps.',
        explain: 'Both survive restarts: Preferences uses the platform’s settings store, and AppDataDirectory is private app storage.',
      },
    ],
    // L4 Platform checks
    [
      {
        kind: 'write',
        prompt: 'Show BottomTabs on phones and SideMenu everywhere else.',
        starter: '',
        solution: `@if (DeviceInfo.Idiom == DeviceIdiom.Phone)
{
    <BottomTabs />
}
else
{
    <SideMenu />
}`,
        checks: [
          { label: 'Check DeviceInfo.Idiom == DeviceIdiom.Phone', re: String.raw`DeviceInfo(\.Current)?\.Idiom\s*==\s*DeviceIdiom\.Phone` },
          { label: '<BottomTabs /> for phones', re: String.raw`Phone\s*\)\s*\{\s*<BottomTabs\s*/>` },
          { label: '<SideMenu /> in the else branch', re: String.raw`else\s*\{\s*<SideMenu\s*/>\s*\}` },
        ],
        hint: 'An @if / else in the markup, comparing the idiom.',
        explain: 'Idiom tells phone from tablet or desktop at runtime, so one build adapts its navigation to the device.',
      },
      {
        kind: 'write',
        prompt: 'Return the right store name for the platform the app runs on.',
        starter: `@code {
    // Google Play on Android, App Store on iOS and Mac, otherwise Microsoft Store
    string StoreName()
    {
        return "";
    }
}`,
        solution: `@code {
    // Google Play on Android, App Store on iOS and Mac, otherwise Microsoft Store
    string StoreName()
    {
        var platform = DeviceInfo.Platform;
        if (platform == DevicePlatform.Android) return "Google Play";
        if (platform == DevicePlatform.iOS || platform == DevicePlatform.MacCatalyst) return "App Store";
        return "Microsoft Store";
    }
}`,
        checks: [
          { label: 'Read DeviceInfo.Platform', re: String.raw`DeviceInfo(\.Current)?\.Platform` },
          { label: 'Google Play for DevicePlatform.Android', re: String.raw`DevicePlatform\.Android[^;]*"Google Play"` },
          { label: 'App Store for iOS and MacCatalyst', re: String.raw`(?=[\s\S]*DevicePlatform\.iOS)(?=[\s\S]*DevicePlatform\.MacCatalyst)[\s\S]*"App Store"` },
          { label: 'Microsoft Store otherwise', re: String.raw`return\s+"Microsoft Store"` },
        ],
        hint: 'Compare DeviceInfo.Platform with DevicePlatform.Android, .iOS and .MacCatalyst.',
        explain: 'Runtime checks keep one code path that compiles everywhere; #if ANDROID is only for platform-only APIs.',
      },
    ],
    // L5 Sharing with the web
    [
      {
        kind: 'write',
        prompt: 'Add an IDeviceName interface in Shared and register a class for it in each host.',
        starter: `// Shared/IDeviceName.cs

// TripLog (MAUI) MauiProgram.cs

// TripLog.Web Program.cs
`,
        solution: `// Shared/IDeviceName.cs
public interface IDeviceName
{
    string Get();
}

// TripLog (MAUI) MauiProgram.cs
builder.Services.AddSingleton<IDeviceName, MauiDeviceName>();

// TripLog.Web Program.cs
builder.Services.AddSingleton<IDeviceName, WebDeviceName>();`,
        checks: [
          { label: 'public interface IDeviceName with a method', re: String.raw`public\s+interface\s+IDeviceName\s*\{[^}]*\w+\s+\w+\([^)]*\)\s*;` },
          {
            label: 'Register IDeviceName in the MAUI host',
            re: String.raw`MauiProgram[\s\S]*builder\.Services\.Add(Singleton|Scoped|Transient)<IDeviceName,\s*\w+>\(\)`,
          },
          {
            label: 'Register a different class in the web host',
            re: String.raw`Add\w+<IDeviceName,\s*(\w+)>\(\)[\s\S]*Add\w+<IDeviceName,\s*(?!\1>)\w+>\(\)`,
          },
        ],
        hint: 'One interface, two AddSingleton<IDeviceName, …> lines with different classes.',
        explain: 'Shared pages inject IDeviceName and never know which host they run in; each host supplies its own version.',
      },
      {
        kind: 'write',
        prompt: 'Implement IShareService natively for MAUI and with JavaScript for the web.',
        starter: `// Shared
public interface IShareService
{
    Task ShareAsync(string title, string url);
}

// MAUI

// Web
`,
        solution: `// Shared
public interface IShareService
{
    Task ShareAsync(string title, string url);
}

// MAUI
public class MauiShareService : IShareService
{
    public Task ShareAsync(string title, string url) =>
        Share.Default.RequestAsync(new ShareTextRequest { Title = title, Uri = url });
}

// Web
public class WebShareService(IJSRuntime js) : IShareService
{
    public async Task ShareAsync(string title, string url) =>
        await js.InvokeVoidAsync("navigator.share", new { title, url });
}`,
        checks: [
          { label: 'A MAUI class that implements IShareService', re: String.raw`class\s+(\w+)\s*:\s*IShareService[\s\S]*Share\.Default\.RequestAsync\(` },
          { label: 'Share with new ShareTextRequest', re: String.raw`new\s+ShareTextRequest\b` },
          { label: 'A web class that takes IJSRuntime', re: String.raw`class\s+\w+\s*(\(\s*IJSRuntime\s+\w+\s*\))?\s*:\s*IShareService[\s\S]*IJSRuntime|IJSRuntime[\s\S]*class\s+\w+\s*:\s*IShareService` },
          { label: 'Call navigator.share through JS interop', re: String.raw`InvokeVoidAsync\(\s*"navigator\.share"` },
          { label: 'Two classes implement IShareService', re: String.raw`(class\s+\w+[^{]*:\s*IShareService[\s\S]*){2}` },
        ],
        hint: 'MAUI has Share.Default; the browser has navigator.share, reached with IJSRuntime.',
        explain: 'Each host implements the same interface with what it has, so the shared Share button works in both.',
      },
    ],
  ],
};

export default unit;
