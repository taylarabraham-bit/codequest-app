import type { DesktopUnit } from '../../../engine/types';

// Desktop edition: write-the-code challenges for ASP.NET unit 6 (Razor Pages).
// lessons[i] runs after lesson i + 1. See docs/CONTENT_GUIDE.md.
const unit: DesktopUnit = {
  lessons: [
    // L1 Pages & routes
    [
      {
        kind: 'write',
        prompt: 'Turn on Razor Pages in this empty Program.cs.',
        starter: 'var builder = WebApplication.CreateBuilder(args);\n',
        solution:
          'var builder = WebApplication.CreateBuilder(args);\nbuilder.Services.AddRazorPages();\nvar app = builder.Build();\napp.MapRazorPages();\napp.Run();',
        checks: [
          { label: 'builder.Services.AddRazorPages() before Build()', re: 'builder\\.Services\\.AddRazorPages\\(\\)[\\s\\S]*\\.Build\\(\\)' },
          { label: 'app.MapRazorPages() after Build()', re: '\\.Build\\(\\)[\\s\\S]*app\\.MapRazorPages\\(\\)' },
          { label: 'app.Run() at the end', re: 'MapRazorPages\\(\\)[\\s\\S]*app\\.Run\\(\\)\\s*;\\s*$' },
        ],
        hint: 'Register the service on builder, map the pages on app, then run.',
        explain: 'AddRazorPages registers the framework and MapRazorPages turns every @page file under Pages into a route.',
      },
      {
        kind: 'write',
        prompt: 'Fix Pages/Events/Details.cshtml so /Events/Details/4 works and only numbers match.',
        starter: '@* Event details *@\n<h1>Event details</h1>\n<p>Doors open at 7pm.</p>\n@page "{id}"',
        solution: '@page "{id:int}"\n@* Event details *@\n<h1>Event details</h1>\n<p>Doors open at 7pm.</p>',
        checks: [
          { label: '@page is the very first line', re: '^\\s*@page\\b' },
          { label: 'Route template "{id:int}"', re: '^\\s*@page\\s+"\\{\\w+:int\\}"' },
          { label: 'Only one @page line', re: '^\\s*@page[^\\n]*(?![\\s\\S]*@page)' },
          { label: 'Keep the heading', re: '<h1>[^<]+</h1>' },
        ],
        hint: '@page must come first, and :int constrains the segment.',
        explain: 'Without @page first the file isn’t a page at all. The {id:int} segment is added after the folder path /Events/Details.',
      },
    ],
    // L2 The PageModel
    [
      {
        kind: 'write',
        prompt: 'Write ForecastModel: OnGet fills a Summary property for the page.',
        starter: 'using Microsoft.AspNetCore.Mvc.RazorPages;\n',
        solution:
          'using Microsoft.AspNetCore.Mvc.RazorPages;\n\npublic class ForecastModel : PageModel\n{\n    public string Summary { get; private set; } = "";\n\n    public void OnGet()\n    {\n        Summary = "Sunny, 24°C";\n    }\n}',
        checks: [
          { label: 'class ForecastModel : PageModel', re: 'class\\s+ForecastModel\\s*:\\s*PageModel\\b' },
          { label: 'A public Summary property', re: 'public\\s+string\\??\\s+Summary\\s*\\{\\s*get;' },
          { label: 'A public OnGet() handler', re: 'public\\s+(void|IActionResult|async\\s+Task(<IActionResult>)?)\\s+OnGet(Async)?\\(\\s*\\)' },
          { label: 'OnGet sets Summary', re: 'OnGet(Async)?\\(\\s*\\)[\\s\\S]*Summary\\s*=' },
        ],
        hint: 'Public properties are what the markup reads through @Model.',
        explain: 'Each GET runs OnGet, which fills Summary before the page renders @Model.Summary.',
      },
      {
        kind: 'write',
        prompt: 'Return a 404 for unknown trails instead of crashing.',
        starter:
          'using Microsoft.AspNetCore.Mvc;\nusing Microsoft.AspNetCore.Mvc.RazorPages;\n\npublic class TrailModel : PageModel\n{\n    private static readonly string[] Trails = ["Ridge Loop", "Lake Path"];\n    public string Name { get; private set; } = "";\n\n    public void OnGet(int id)\n    {\n        Name = Trails[id];\n    }\n}',
        solution:
          'using Microsoft.AspNetCore.Mvc;\nusing Microsoft.AspNetCore.Mvc.RazorPages;\n\npublic class TrailModel : PageModel\n{\n    private static readonly string[] Trails = ["Ridge Loop", "Lake Path"];\n    public string Name { get; private set; } = "";\n\n    public IActionResult OnGet(int id)\n    {\n        if (id < 0 || id >= Trails.Length) return NotFound();\n        Name = Trails[id];\n        return Page();\n    }\n}',
        checks: [
          { label: 'OnGet(int id) returns IActionResult', re: 'public\\s+IActionResult\\s+OnGet\\(\\s*int\\s+\\w+\\s*\\)' },
          { label: 'Check the id is in range', re: '(>=|>)\\s*Trails\\.Length|<\\s*Trails\\.Length' },
          { label: 'return NotFound() for a bad id', has: 'return NotFound()' },
          { label: 'return Page() otherwise', has: 'return Page()' },
        ],
        hint: 'void can’t choose a status. Switch to IActionResult and return NotFound() or Page().',
        explain: 'An out-of-range index would throw and send a 500. Checking first turns it into a clean 404.',
      },
    ],
    // L3 Tag helpers
    [
      {
        kind: 'write',
        prompt: 'Link to the dishes list page, and to dish 3’s details page.',
        starter: '@page\n<nav>\n</nav>',
        solution:
          '@page\n<nav>\n    <a asp-page="/Dishes/Index">All dishes</a>\n    <a asp-page="/Dishes/Details" asp-route-id="3">Soup of the day</a>\n</nav>',
        checks: [
          { label: 'A link with asp-page to the list page', re: '<a\\s[^>]*asp-page="/\\w+(/Index)?"[^>]*>' },
          { label: 'A link with asp-page to a Details page', re: '<a\\s[^>]*asp-page="/\\w+/Details"[^>]*>' },
          { label: 'asp-route-id="3" fills the id', re: '<a\\s[^>]*asp-route-id="3"' },
          { label: 'No hand-written href', not: 'href=' },
        ],
        hint: 'asp-page takes the page path from Pages, without .cshtml.',
        explain: 'Tag helpers build the URL from the page’s real route, so links survive if the route template changes.',
      },
      {
        kind: 'write',
        prompt: 'Tie the label and input to Dish.Name, and add Dish.Price the same way.',
        starter:
          '@page\n@model NewDishModel\n<form method="post">\n    <label>Name</label>\n    <input name="Name" />\n    <button>Save</button>\n</form>',
        solution:
          '@page\n@model NewDishModel\n<form method="post">\n    <label asp-for="Dish.Name"></label>\n    <input asp-for="Dish.Name" />\n    <label asp-for="Dish.Price"></label>\n    <input asp-for="Dish.Price" />\n    <button>Save</button>\n</form>',
        checks: [
          { label: '<label asp-for="Dish.Name">', re: '<label\\s[^>]*asp-for="Dish\\.Name"' },
          { label: '<input asp-for="Dish.Name">', re: '<input\\s[^>]*asp-for="Dish\\.Name"' },
          { label: '<label asp-for="Dish.Price">', re: '<label\\s[^>]*asp-for="Dish\\.Price"' },
          { label: '<input asp-for="Dish.Price">', re: '<input\\s[^>]*asp-for="Dish\\.Price"' },
          { label: 'No hand-written name="Name"', not: 'name="Name"' },
        ],
        hint: 'asp-for takes the property path from the model, starting after @Model.',
        explain: 'asp-for writes the id, name, type and label text for you, so the form binds back to Dish on post.',
      },
    ],
    // L4 Handling forms
    [
      {
        kind: 'write',
        prompt: 'Bind the Message field; redisplay if blank, otherwise redirect to ./Thanks.',
        starter:
          'using Microsoft.AspNetCore.Mvc;\nusing Microsoft.AspNetCore.Mvc.RazorPages;\n\npublic class ContactModel : PageModel\n{\n}',
        solution:
          'using Microsoft.AspNetCore.Mvc;\nusing Microsoft.AspNetCore.Mvc.RazorPages;\n\npublic class ContactModel : PageModel\n{\n    [BindProperty]\n    public string Message { get; set; } = "";\n\n    public IActionResult OnPost()\n    {\n        if (string.IsNullOrWhiteSpace(Message)) return Page();\n        return RedirectToPage("./Thanks");\n    }\n}',
        checks: [
          { label: 'A [BindProperty] Message property with get; set;', re: '\\[BindProperty\\]\\s*public\\s+string\\??\\s+Message\\s*\\{\\s*get;\\s*set;' },
          { label: 'An OnPost (or OnPostAsync) handler', re: 'public\\s+(IActionResult\\s+OnPost|async\\s+Task<IActionResult>\\s+OnPostAsync)\\(\\s*\\)' },
          { label: 'return Page() when Message is blank', re: 'IsNullOrWhiteSpace\\(\\s*Message\\s*\\)[\\s\\S]*return\\s+Page\\(\\)|IsNullOrEmpty\\(\\s*Message\\s*\\)[\\s\\S]*return\\s+Page\\(\\)' },
          { label: 'RedirectToPage("./Thanks") on success', re: 'RedirectToPage\\(\\s*"\\./Thanks"\\s*\\)' },
        ],
        hint: '[BindProperty] fills the property from the posted form before OnPost runs.',
        explain: 'Redirecting after a successful post stops a browser refresh from sending the form twice.',
      },
      {
        kind: 'write',
        prompt: 'Add a Delete handler that removes a habit by id, then redirects.',
        starter:
          'public class HabitsModel : PageModel\n{\n    public static List<string> Habits { get; } = ["Read", "Stretch"];\n\n    [BindProperty]\n    public string NewHabit { get; set; } = "";\n\n    public IActionResult OnPost()\n    {\n        Habits.Add(NewHabit);\n        return RedirectToPage("./Index");\n    }\n}',
        solution:
          'public class HabitsModel : PageModel\n{\n    public static List<string> Habits { get; } = ["Read", "Stretch"];\n\n    [BindProperty]\n    public string NewHabit { get; set; } = "";\n\n    public IActionResult OnPost()\n    {\n        Habits.Add(NewHabit);\n        return RedirectToPage("./Index");\n    }\n\n    public IActionResult OnPostDelete(int id)\n    {\n        if (id >= 0 && id < Habits.Count) Habits.RemoveAt(id);\n        return RedirectToPage("./Index");\n    }\n}',
        checks: [
          { label: 'An OnPostDelete(int id) handler (or OnPostDeleteAsync)', re: 'public\\s+(IActionResult\\s+OnPostDelete|async\\s+Task<IActionResult>\\s+OnPostDeleteAsync)\\(\\s*int\\s+\\w+\\s*\\)' },
          { label: 'Remove the habit from the list', re: 'OnPostDelete[\\s\\S]*Habits\\.(RemoveAt|Remove)\\(' },
          { label: 'Redirect after deleting', re: 'OnPostDelete[\\s\\S]*RedirectToPage\\(\\s*"[^"]+"\\s*\\)' },
          { label: 'Keep the original OnPost', re: 'IActionResult\\s+OnPost\\(\\s*\\)' },
        ],
        hint: 'A button with asp-page-handler="Delete" calls OnPost + Delete.',
        explain: 'The handler name after OnPost matches asp-page-handler, so one form can have several submit buttons.',
      },
    ],
    // L5 Layouts & partials
    [
      {
        kind: 'write',
        prompt: 'Write a layout with a site header, the page body and an optional Scripts section.',
        starter: '',
        solution:
          '<!DOCTYPE html>\n<html lang="en">\n<head>\n    <title>@ViewData["Title"] - Bean Bar</title>\n</head>\n<body>\n    <header>Bean Bar</header>\n    <main>@RenderBody()</main>\n    @RenderSection("Scripts", required: false)\n</body>\n</html>',
        checks: [
          { label: 'A <header> above the page content', re: '<header>[\\s\\S]*</header>[\\s\\S]*@RenderBody\\(\\)' },
          { label: '@RenderBody() inside the body', re: '<body>[\\s\\S]*@RenderBody\\(\\)[\\s\\S]*</body>' },
          { label: 'An optional "Scripts" section', re: '@(await\\s+)?RenderSection(Async)?\\(\\s*"Scripts"\\s*,\\s*required:\\s*false\\s*\\)' },
          { label: 'A full page with <html>', re: '<html[\\s\\S]*</html>' },
        ],
        hint: 'RenderBody is where each page goes; RenderSection with required: false is an optional slot.',
        explain: 'Every page renders inside this layout, so the header appears everywhere and pages can add their own scripts.',
      },
      {
        kind: 'write',
        prompt: 'Use the _DishCard partial for each dish, and add a Scripts section.',
        starter:
          '@page\n@model MenuModel\n<h1>Menu</h1>\n@foreach (var dish in Model.Dishes)\n{\n    <div class="card">\n        <h3>@dish.Name</h3>\n        <p>@dish.Price</p>\n    </div>\n}',
        solution:
          '@page\n@model MenuModel\n<h1>Menu</h1>\n@foreach (var dish in Model.Dishes)\n{\n    <partial name="_DishCard" model="dish" />\n}\n\n@section Scripts {\n    <script src="~/js/menu.js"></script>\n}',
        checks: [
          { label: '<partial name="_DishCard" model="dish" /> in the loop', re: '@foreach[\\s\\S]*<partial(?=[^>]*\\sname="_DishCard")(?=[^>]*\\smodel="@?\\w+")[^>]*>' },
          { label: 'Remove the inline card markup', not: '<div class="card">' },
          { label: '@section Scripts { … } with a <script>', re: '@section\\s+Scripts\\s*\\{[\\s\\S]*<script[\\s\\S]*\\}' },
        ],
        hint: 'The partial tag helper takes the file name and the model to pass in.',
        explain: 'The card markup now lives in Pages/Shared/_DishCard.cshtml, and the section fills the layout’s Scripts slot.',
      },
    ],
  ],
};

export default unit;
