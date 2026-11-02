import type { DesktopUnit } from '../../../engine/types';

// Desktop edition: write-the-code challenges for ASP.NET unit 5 (Controllers & MVC).
// lessons[i] runs after lesson i + 1. See docs/CONTENT_GUIDE.md.
const unit: DesktopUnit = {
  lessons: [
    // L1 API controllers
    [
      {
        kind: 'write',
        prompt: 'Turn on controllers and write a MoviesController that answers GET /api/movies.',
        starter: 'using Microsoft.AspNetCore.Mvc;\n\nvar builder = WebApplication.CreateBuilder(args);\n',
        solution:
          'using Microsoft.AspNetCore.Mvc;\n\nvar builder = WebApplication.CreateBuilder(args);\nbuilder.Services.AddControllers();\nvar app = builder.Build();\napp.MapControllers();\napp.Run();\n\n[ApiController]\n[Route("api/[controller]")]\npublic class MoviesController : ControllerBase\n{\n    [HttpGet]\n    public string[] GetAll() => ["Alien", "Up"];\n}',
        checks: [
          { label: 'builder.Services.AddControllers() before Build()', re: 'builder\\.Services\\.AddControllers\\(\\)[\\s\\S]*\\.Build\\(\\)' },
          { label: 'app.MapControllers()', has: 'app.MapControllers()' },
          { label: 'Mark the class [ApiController]', has: '[ApiController]' },
          { label: '[Route("api/[controller]")] on the class', has: '[Route("api/[controller]")]' },
          { label: 'class MoviesController : ControllerBase', re: 'class\\s+MoviesController\\s*:\\s*ControllerBase\\b' },
          { label: 'A [HttpGet] action', re: '\\[HttpGet\\]\\s*public\\s+' },
        ],
        hint: 'Register with AddControllers, map with MapControllers. [controller] becomes the class name minus Controller.',
        explain: 'MapControllers finds every controller class and maps its attribute routes, so MoviesController answers /api/movies.',
        output: '["Alien","Up"]',
      },
      {
        kind: 'write',
        prompt: 'GET /api/tickets returns 404. Fix the setup and the route.',
        starter:
          'using Microsoft.AspNetCore.Mvc;\n\nvar builder = WebApplication.CreateBuilder(args);\nvar app = builder.Build();\napp.MapControllers();\napp.Run();\n\n[ApiController]\n[Route("api/controller")]\npublic class TicketsController : ControllerBase\n{\n    [HttpGet]\n    public string Open() => "3 open tickets";\n}',
        solution:
          'using Microsoft.AspNetCore.Mvc;\n\nvar builder = WebApplication.CreateBuilder(args);\nbuilder.Services.AddControllers();\nvar app = builder.Build();\napp.MapControllers();\napp.Run();\n\n[ApiController]\n[Route("api/[controller]")]\npublic class TicketsController : ControllerBase\n{\n    [HttpGet]\n    public string Open() => "3 open tickets";\n}',
        checks: [
          { label: 'Register controllers before Build()', re: 'AddControllers\\(\\)[\\s\\S]*\\.Build\\(\\)' },
          { label: 'Route to api/[controller] (or api/tickets)', re: '\\[Route\\(\\s*"api/(\\[controller\\]|tickets)"\\s*\\)\\]' },
          { label: 'No literal "api/controller" route', not: '"api/controller"' },
          { label: 'Keep app.MapControllers()', has: 'app.MapControllers()' },
        ],
        hint: 'Without square brackets, “controller” is just a word in the URL.',
        explain: 'The [controller] token is replaced by Tickets, and MapControllers needs the services AddControllers registers.',
        output: '3 open tickets',
      },
    ],
    // L2 Action attributes
    [
      {
        kind: 'write',
        prompt: 'Give PlaylistsController actions to list all, get one by id, and create one.',
        starter:
          '[ApiController]\n[Route("api/[controller]")]\npublic class PlaylistsController : ControllerBase\n{\n}\n\npublic record Playlist(string Name);',
        solution:
          '[ApiController]\n[Route("api/[controller]")]\npublic class PlaylistsController : ControllerBase\n{\n    [HttpGet]\n    public string[] All() => ["Chill", "Focus"];\n\n    [HttpGet("{id:int}")]\n    public string One(int id) => $"Playlist {id}";\n\n    [HttpPost]\n    public string Create(Playlist playlist) => $"Created {playlist.Name}";\n}\n\npublic record Playlist(string Name);',
        checks: [
          { label: 'A [HttpGet] action for the list', re: '\\[HttpGet\\]\\s*public\\s+' },
          { label: '[HttpGet("{id:int}")] with a matching int parameter', re: '\\[HttpGet\\(\\s*"\\{(\\w+):int\\}"\\s*\\)\\]\\s*public\\s+[\\w<>\\[\\]]+\\s+\\w+\\(\\s*int\\s+\\1\\s*\\)' },
          { label: 'A [HttpPost] action that takes a Playlist', re: '\\[HttpPost\\]\\s*public\\s+[\\w<>\\[\\]]+\\s+\\w+\\(\\s*(\\[FromBody\\]\\s*)?Playlist\\s+\\w+\\s*\\)' },
        ],
        hint: 'One public method per action, each with its verb attribute; the id template adds to the class route.',
        explain: 'The template in [HttpGet("{id:int}")] is appended to api/playlists, and the Playlist parameter comes from the JSON body.',
      },
      {
        kind: 'write',
        prompt: 'Add PUT and DELETE for /api/alarms/{id}; DELETE takes a force flag from the query.',
        starter:
          '[ApiController]\n[Route("api/[controller]")]\npublic class AlarmsController : ControllerBase\n{\n    [HttpGet("{id:int}")]\n    public string Get(int id) => $"Alarm {id}";\n}\n\npublic record Alarm(string Time);',
        solution:
          '[ApiController]\n[Route("api/[controller]")]\npublic class AlarmsController : ControllerBase\n{\n    [HttpGet("{id:int}")]\n    public string Get(int id) => $"Alarm {id}";\n\n    [HttpPut("{id:int}")]\n    public string Update(int id, Alarm alarm) => $"Alarm {id} set to {alarm.Time}";\n\n    [HttpDelete("{id:int}")]\n    public string Delete(int id, bool force = false) =>\n        force ? $"Alarm {id} deleted" : $"Alarm {id} snoozed";\n}\n\npublic record Alarm(string Time);',
        checks: [
          { label: '[HttpPut("{id}")] taking the id and an Alarm body', re: '\\[HttpPut\\(\\s*"\\{\\w+(:int)?\\}"\\s*\\)\\]\\s*public\\s+[\\w<>]+\\s+\\w+\\(\\s*int\\s+\\w+\\s*,\\s*(\\[FromBody\\]\\s*)?Alarm\\s+\\w+\\s*\\)' },
          { label: '[HttpDelete("{id}")] on a delete action', re: '\\[HttpDelete\\(\\s*"\\{\\w+(:int)?\\}"\\s*\\)\\]\\s*public\\s+' },
          { label: 'DELETE takes a bool flag', re: '\\[HttpDelete[^\\]]*\\]\\s*public\\s+[\\w<>]+\\s+\\w+\\([^)]*bool\\s+\\w+' },
        ],
        hint: 'Route values, query string and body all bind by parameter name, just like minimal APIs.',
        explain: 'id comes from the route, the Alarm from the body, and a simple bool that isn’t in the route reads ?force=true.',
      },
    ],
    // L3 Action results
    [
      {
        kind: 'write',
        prompt: 'Write GetById: return the pet, or 404 when no pet has that id.',
        starter:
          '[ApiController]\n[Route("api/[controller]")]\npublic class PetsController : ControllerBase\n{\n    private static readonly List<Pet> Pets = [new(1, "Rex"), new(2, "Mochi")];\n\n}\n\npublic record Pet(int Id, string Name);',
        solution:
          '[ApiController]\n[Route("api/[controller]")]\npublic class PetsController : ControllerBase\n{\n    private static readonly List<Pet> Pets = [new(1, "Rex"), new(2, "Mochi")];\n\n    [HttpGet("{id:int}")]\n    public ActionResult<Pet> GetById(int id)\n    {\n        var pet = Pets.FirstOrDefault(p => p.Id == id);\n        if (pet is null) return NotFound();\n        return pet;\n    }\n}\n\npublic record Pet(int Id, string Name);',
        checks: [
          { label: '[HttpGet("{id:int}")] on the action', re: '\\[HttpGet\\(\\s*"\\{\\w+(:int)?\\}"\\s*\\)\\]' },
          { label: 'Return type ActionResult<Pet>', re: 'public\\s+ActionResult<\\s*Pet\\s*>\\s+GetById\\(\\s*int\\s+\\w+\\s*\\)' },
          { label: 'NotFound() when missing', re: '\\bNotFound\\(\\s*\\)' },
          { label: 'Return the pet itself (or Ok(pet)) when found', re: 'return\\s+(?!NotFound)\\w+\\s*;|\\bOk\\(\\s*\\w+\\s*\\)' },
        ],
        hint: 'ActionResult<Pet> accepts both a Pet and a status like NotFound().',
        explain: 'Returning the Pet sends 200 with JSON, and NotFound() sends 404, all from one declared type.',
        output: '{"id":1,"name":"Rex"}',
      },
      {
        kind: 'write',
        prompt: 'Make Create answer 201 with a Location, or 400 if the name is blank.',
        starter:
          '// Inside PetsController, below GetById:\n[HttpPost]\npublic ActionResult<Pet> Create(Pet pet)\n{\n    Pets.Add(pet);\n    return Ok(pet);\n}',
        solution:
          '// Inside PetsController, below GetById:\n[HttpPost]\npublic ActionResult<Pet> Create(Pet pet)\n{\n    if (string.IsNullOrWhiteSpace(pet.Name))\n        return BadRequest();\n    Pets.Add(pet);\n    return CreatedAtAction(nameof(GetById), new { id = pet.Id }, pet);\n}',
        checks: [
          { label: 'Check for a blank Name', re: 'IsNullOrWhiteSpace\\(\\s*\\w+\\.Name\\s*\\)|IsNullOrEmpty\\(\\s*\\w+\\.Name\\s*\\)' },
          { label: 'return BadRequest() before adding', re: 'BadRequest\\([\\s\\S]*\\.Add\\(' },
          { label: 'CreatedAtAction(nameof(GetById), new { id = … }, pet)', re: 'CreatedAtAction\\(\\s*nameof\\(\\s*GetById\\s*\\)\\s*,\\s*new\\s*\\{\\s*id\\s*=\\s*\\w+\\.Id\\s*\\}\\s*,\\s*\\w+\\s*\\)' },
          { label: 'No more Ok(pet)', not: 'return Ok(' },
        ],
        hint: 'CreatedAtAction needs the action name, its route values, and the new object.',
        explain: 'CreatedAtAction builds the Location URL from GetById’s route, so clients know where the new pet lives.',
      },
    ],
    // L4 Views & routing
    [
      {
        kind: 'write',
        prompt: 'Set up MVC with the default route and a MenuController whose Index shows a view.',
        starter: 'using Microsoft.AspNetCore.Mvc;\n\nvar builder = WebApplication.CreateBuilder(args);\n',
        solution:
          'using Microsoft.AspNetCore.Mvc;\n\nvar builder = WebApplication.CreateBuilder(args);\nbuilder.Services.AddControllersWithViews();\nvar app = builder.Build();\napp.MapControllerRoute(\n    name: "default",\n    pattern: "{controller=Home}/{action=Index}/{id?}");\napp.Run();\n\npublic class MenuController : Controller\n{\n    public IActionResult Index() => View(new[] { "Ramen", "Gyoza" });\n}',
        checks: [
          { label: 'builder.Services.AddControllersWithViews()', has: 'builder.Services.AddControllersWithViews()' },
          { label: 'MapControllerRoute with "{controller=Home}/{action=Index}/{id?}"', re: 'MapControllerRoute\\([\\s\\S]*"\\{controller=Home\\}/\\{action=Index\\}/\\{id\\?\\}"' },
          { label: 'MenuController inherits Controller', re: 'class\\s+MenuController\\s*:\\s*Controller\\b' },
          { label: 'Index() returns View(…)', re: 'IActionResult\\s+Index\\(\\s*\\)[\\s\\S]*View\\(' },
        ],
        hint: 'Views need AddControllersWithViews. The route pattern has defaults after each =.',
        explain: '/Menu matches {controller=Menu} with the default action Index, which renders Views/Menu/Index.cshtml.',
      },
      {
        kind: 'write',
        prompt: 'Add Details(id) with a 404 for bad ids, and Today, which reuses the Details view.',
        starter:
          'public class RecipesController : Controller\n{\n    private static readonly Recipe[] Recipes = [new("Soup"), new("Curry"), new("Tacos")];\n\n    public IActionResult Index() => View(Recipes);\n}\n\npublic record Recipe(string Name);',
        solution:
          'public class RecipesController : Controller\n{\n    private static readonly Recipe[] Recipes = [new("Soup"), new("Curry"), new("Tacos")];\n\n    public IActionResult Index() => View(Recipes);\n\n    public IActionResult Details(int id)\n    {\n        if (id < 0 || id >= Recipes.Length) return NotFound();\n        return View(Recipes[id]);\n    }\n\n    public IActionResult Today() => View("Details", Recipes[1]);\n}\n\npublic record Recipe(string Name);',
        checks: [
          { label: 'public IActionResult Details(int id)', re: 'public\\s+IActionResult\\s+Details\\(\\s*int\\s+id\\s*\\)' },
          { label: 'NotFound() for an id out of range', re: 'Details\\([\\s\\S]*NotFound\\(\\)' },
          { label: 'Details returns View(recipe)', re: 'Details\\(\\s*int[\\s\\S]*return\\s+View\\(\\s*\\w+' },
          { label: 'Today renders View("Details", …)', re: 'IActionResult\\s+Today\\(\\s*\\)[\\s\\S]*View\\(\\s*"Details"\\s*,\\s*[^)]+\\)' },
        ],
        hint: 'Name the parameter id so the {id?} route segment fills it. View("Name", model) picks another file.',
        explain: '/Recipes/Details/2 binds id from the route. Today shares Views/Recipes/Details.cshtml instead of needing its own view.',
      },
    ],
    // L5 Razor syntax
    [
      {
        kind: 'write',
        prompt: 'Write a view that lists each book’s title and author.',
        starter: '',
        solution:
          '@model List<Book>\n\n<h1>Reading list</h1>\n<ul>\n    @foreach (var book in Model)\n    {\n        <li>@book.Title by @book.Author</li>\n    }\n</ul>',
        checks: [
          { label: 'Start with @model List<Book>', re: '^\\s*@model\\s+(List|IEnumerable|IList)<\\s*Book\\s*>' },
          { label: '@foreach over Model', re: '@foreach\\s*\\(\\s*var\\s+\\w+\\s+in\\s+Model\\s*\\)' },
          { label: 'An <li> showing the title and author', re: '<li>[^<]*@\\w+\\.(Title|Author)[^<]*@\\w+\\.(Title|Author)[^<]*</li>' },
          { label: 'The loop sits inside a <ul>', re: '<ul>[\\s\\S]*@foreach[\\s\\S]*</ul>' },
        ],
        hint: '@model sets the type, @foreach loops over @Model, and @book.Title prints a value.',
        explain: 'Inside the loop, the <li> switches back to HTML and each @ expression is printed, HTML-encoded.',
      },
      {
        kind: 'write',
        prompt: 'Show each line total with @( ), and an empty-cart message with @if.',
        starter:
          '@model List<CartItem>\n\n<h2>Your cart</h2>\n<ul>\n    @foreach (var item in Model)\n    {\n        <li>@item.Name</li>\n    }\n</ul>',
        solution:
          '@model List<CartItem>\n\n<h2>Your cart</h2>\n@if (Model.Count == 0)\n{\n    <p>Your cart is empty.</p>\n}\nelse\n{\n    <ul>\n        @foreach (var item in Model)\n        {\n            <li>@item.Name: @(item.Price * item.Quantity)</li>\n        }\n    </ul>\n}',
        checks: [
          { label: '@if that tests for an empty cart', re: '@if\\s*\\(\\s*(Model\\.Count\\s*==\\s*0|!\\s*Model\\.Any\\(\\)|Model\\.Count\\s*(>|!=)\\s*0|Model\\.Any\\(\\))\\s*\\)' },
          { label: 'A message for the empty cart', re: '<p>[^<]*[Ee]mpty[^<]*</p>' },
          { label: 'The line total in @( … * … )', re: '@\\(\\s*\\w+\\.\\w+\\s*\\*\\s*\\w+\\.\\w+\\s*\\)' },
          { label: 'Keep the @foreach list', re: '@foreach\\s*\\(\\s*var\\s+\\w+\\s+in\\s+Model\\s*\\)' },
        ],
        hint: '@item.Price * item.Quantity would print the price then a literal *; wrap the sum in @( ).',
        explain: '@( ) evaluates the whole expression before printing, and @if picks which markup to render.',
      },
    ],
  ],
};

export default unit;
