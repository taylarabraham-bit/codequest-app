import type { DesktopUnit } from '../../../engine/types';

// Desktop edition: write-the-code challenges for ASP.NET unit 8 (EF Core basics).
// lessons[i] runs after lesson i + 1. See docs/CONTENT_GUIDE.md.
const unit: DesktopUnit = {
  lessons: [
    // L1 Entities & DbContext
    [
      {
        kind: 'write',
        prompt: 'Write a Plant entity and a GardenDb context with a Plants table.',
        starter: 'using Microsoft.EntityFrameworkCore;\n',
        solution:
          'using Microsoft.EntityFrameworkCore;\n\npublic class Plant\n{\n    public int Id { get; set; }\n    public string Name { get; set; } = "";\n    public int WaterEveryDays { get; set; }\n}\n\npublic class GardenDb : DbContext\n{\n    public GardenDb(DbContextOptions<GardenDb> options) : base(options) { }\n\n    public DbSet<Plant> Plants => Set<Plant>();\n}',
        checks: [
          { label: 'A Plant class with an int Id (or PlantId) key', re: 'class\\s+Plant\\b[\\s\\S]*public\\s+int\\s+(Id|PlantId)\\s*\\{\\s*get;\\s*set;' },
          { label: 'GardenDb inherits DbContext', re: 'class\\s+GardenDb\\b[^{]*:\\s*DbContext\\b' },
          { label: 'Take DbContextOptions<GardenDb> and pass it to the base', re: 'GardenDb\\s*\\(\\s*DbContextOptions<\\s*GardenDb\\s*>\\s+(\\w+)\\s*\\)\\s*:\\s*(base|DbContext)\\(\\s*\\1\\s*\\)' },
          { label: 'A DbSet<Plant> called Plants', re: 'DbSet<\\s*Plant\\s*>\\s+Plants\\b' },
        ],
        hint: 'The constructor forwards options with : base(options). One DbSet per table.',
        explain: 'EF Core maps Plant to a Plants table and makes Id its primary key just by naming convention.',
      },
      {
        kind: 'write',
        prompt: 'Pass the options to base, and add a Loan entity with its own table.',
        starter:
          'public class Member\n{\n    public int Id { get; set; }\n    public string Name { get; set; } = "";\n}\n\npublic class LibraryDb : DbContext\n{\n    public LibraryDb(DbContextOptions<LibraryDb> options) { }\n\n    public DbSet<Member> Members => Set<Member>();\n}',
        solution:
          'public class Member\n{\n    public int Id { get; set; }\n    public string Name { get; set; } = "";\n}\n\npublic class Loan\n{\n    public int LoanId { get; set; }\n    public string BookTitle { get; set; } = "";\n    public DateOnly DueOn { get; set; }\n}\n\npublic class LibraryDb : DbContext\n{\n    public LibraryDb(DbContextOptions<LibraryDb> options) : base(options) { }\n\n    public DbSet<Member> Members => Set<Member>();\n    public DbSet<Loan> Loans => Set<Loan>();\n}',
        checks: [
          { label: 'The constructor calls : base(options)', re: 'LibraryDb\\s*\\(\\s*DbContextOptions<\\s*LibraryDb\\s*>\\s+(\\w+)\\s*\\)\\s*:\\s*base\\(\\s*\\1\\s*\\)' },
          { label: 'A Loan class with an Id or LoanId key', re: 'class\\s+Loan\\b[\\s\\S]*?public\\s+int\\s+(Id|LoanId)\\s*\\{\\s*get;\\s*set;' },
          { label: 'A DbSet<Loan> called Loans', re: 'DbSet<\\s*Loan\\s*>\\s+Loans\\b' },
        ],
        hint: 'Without base(options) the context never learns which database to use.',
        explain: 'The options carry the provider and connection string. A new DbSet adds a table; LoanId is a key because it is the class name plus Id.',
      },
    ],
    // L2 Connecting a database
    [
      {
        kind: 'write',
        prompt: 'Register GardenDb with SQLite, using the "Garden" connection string.',
        starter: '// appsettings.json: "ConnectionStrings": { "Garden": "Data Source=garden.db" }\nvar builder = WebApplication.CreateBuilder(args);\n',
        solution:
          '// appsettings.json: "ConnectionStrings": { "Garden": "Data Source=garden.db" }\nvar builder = WebApplication.CreateBuilder(args);\nvar connection = builder.Configuration.GetConnectionString("Garden");\nbuilder.Services.AddDbContext<GardenDb>(options => options.UseSqlite(connection));\nvar app = builder.Build();',
        checks: [
          { label: 'Read it with GetConnectionString("Garden")', re: 'GetConnectionString\\(\\s*"Garden"\\s*\\)' },
          { label: 'AddDbContext<GardenDb>(…)', re: 'builder\\.Services\\.AddDbContext<\\s*GardenDb\\s*>\\(' },
          { label: 'Use the SQLite provider', re: 'AddDbContext<\\s*GardenDb\\s*>\\(\\s*(\\w+)\\s*=>\\s*\\1\\.UseSqlite\\(' },
          { label: 'Register before Build()', re: 'AddDbContext[\\s\\S]*\\.Build\\(\\)' },
        ],
        hint: 'GetConnectionString looks inside the "ConnectionStrings" section for you.',
        explain: 'AddDbContext registers GardenDb as scoped, so each request gets its own context pointed at garden.db.',
      },
      {
        kind: 'write',
        prompt: 'Read the connection string from config, and create the database at startup.',
        starter:
          'builder.Services.AddDbContext<GardenDb>(options => options.UseSqlite("Data Source=garden.db"));\nvar app = builder.Build();\n\napp.Run();',
        solution:
          'builder.Services.AddDbContext<GardenDb>(options =>\n    options.UseSqlite(builder.Configuration.GetConnectionString("Garden")));\nvar app = builder.Build();\n\nusing (var scope = app.Services.CreateScope())\n{\n    var db = scope.ServiceProvider.GetRequiredService<GardenDb>();\n    await db.Database.EnsureCreatedAsync();\n}\n\napp.Run();',
        checks: [
          { label: 'No connection string in the code', not: 'UseSqlite("Data Source' },
          { label: 'Use GetConnectionString("…")', re: 'GetConnectionString\\(\\s*"\\w+"\\s*\\)' },
          { label: 'Get the context from a scope', re: 'CreateScope\\(\\)[\\s\\S]*GetRequiredService<\\s*GardenDb\\s*>\\(\\)' },
          { label: 'await db.Database.EnsureCreatedAsync()', re: 'await\\s+\\w+\\.Database\\.EnsureCreatedAsync\\(\\s*\\)' },
          { label: 'Create it before app.Run()', re: 'EnsureCreatedAsync[\\s\\S]*app\\.Run\\(\\)' },
        ],
        hint: 'GardenDb is scoped, so startup code needs a scope (unit 2). Then call Database.EnsureCreatedAsync().',
        explain: 'EnsureCreatedAsync builds the database and tables on the first run and does nothing once they exist.',
      },
    ],
    // L3 Querying data
    [
      {
        kind: 'write',
        prompt: 'GET /plants/thirsty lists plants watered every 3 days or less, read-only.',
        starter: '',
        solution:
          'app.MapGet("/plants/thirsty", async (GardenDb db) =>\n    await db.Plants\n        .AsNoTracking()\n        .Where(p => p.WaterEveryDays <= 3)\n        .ToListAsync());',
        checks: [
          { label: 'An async handler that injects GardenDb', re: 'async\\s*\\(\\s*GardenDb\\s+\\w+\\s*\\)\\s*=>' },
          { label: 'Filter with Where(… <= 3)', re: '\\.Where\\(\\s*(\\w+)\\s*=>\\s*\\1\\.WaterEveryDays\\s*(<=\\s*3|<\\s*4)\\s*\\)' },
          { label: 'AsNoTracking() for a read-only query', has: '.AsNoTracking()' },
          { label: 'Run it with await … ToListAsync()', re: 'await\\s+[\\s\\S]*\\.ToListAsync\\(\\s*\\)' },
        ],
        hint: 'Chain AsNoTracking and Where on db.Plants; nothing runs until ToListAsync.',
        explain: 'The Where becomes a SQL WHERE, and AsNoTracking skips change tracking because nothing will be saved.',
      },
      {
        kind: 'write',
        prompt: 'Look plants up by id with FindAsync, and by name; 404 when missing.',
        starter: 'app.MapGet("/plants/{id:int}", (int id, GardenDb db) =>\n    db.Plants.ToList().First(p => p.Id == id));',
        solution:
          'app.MapGet("/plants/{id:int}", async (int id, GardenDb db) =>\n    await db.Plants.FindAsync(id) is Plant plant ? Results.Ok(plant) : Results.NotFound());\n\napp.MapGet("/plants/by-name/{name}", async (string name, GardenDb db) =>\n    await db.Plants.FirstOrDefaultAsync(p => p.Name == name) is Plant plant\n        ? Results.Ok(plant)\n        : Results.NotFound());',
        checks: [
          { label: 'FindAsync(id) for the id lookup', re: '\\.FindAsync\\(\\s*\\w+\\s*\\)' },
          { label: 'FirstOrDefaultAsync(… Name == name …) for the name lookup', re: 'FirstOrDefaultAsync\\(\\s*(\\w+)\\s*=>\\s*\\1\\.Name\\s*==\\s*\\w+\\s*\\)' },
          { label: 'Results.NotFound() when null', has: 'Results.NotFound()' },
          { label: 'No ToList() loading the whole table', not: '.ToList()' },
        ],
        hint: 'Both return null when nothing matches; test with is or a null check.',
        explain: 'FindAsync looks up the key (and checks tracked entities first); FirstOrDefaultAsync turns any condition into a query.',
      },
    ],
    // L4 Saving changes
    [
      {
        kind: 'write',
        prompt: 'POST /plants adds a plant, saves, and answers 201 with its new id.',
        starter: '',
        solution:
          'app.MapPost("/plants", async (Plant plant, GardenDb db) =>\n{\n    db.Plants.Add(plant);\n    await db.SaveChangesAsync();\n    return Results.Created($"/plants/{plant.Id}", plant);\n});',
        checks: [
          { label: 'MapPost on /plants taking a Plant and GardenDb', re: 'MapPost\\(\\s*"/plants"\\s*,\\s*async\\s*\\([^)]*Plant\\s+\\w+[^)]*GardenDb\\s+\\w+|MapPost\\(\\s*"/plants"\\s*,\\s*async\\s*\\([^)]*GardenDb\\s+\\w+[^)]*Plant\\s+\\w+' },
          { label: 'Add it to db.Plants', re: '\\w+\\.Plants\\.Add\\(\\s*\\w+\\s*\\)' },
          { label: 'await db.SaveChangesAsync()', re: 'await\\s+\\w+\\.SaveChangesAsync\\(\\s*\\)' },
          { label: 'Results.Created after saving', re: 'SaveChangesAsync[\\s\\S]*Results\\.Created\\(' },
        ],
        hint: 'Add only queues the insert; SaveChangesAsync runs it and fills in Id.',
        explain: 'After SaveChangesAsync the database has assigned the Id, so the Location URL points at the real row.',
      },
      {
        kind: 'write',
        prompt: 'Fix the delete endpoint, then add PUT /plants/{id} that updates a plant.',
        starter:
          'app.MapDelete("/plants/{id:int}", async (int id, GardenDb db) =>\n{\n    var plant = await db.Plants.FindAsync(id);\n    if (plant is null) return Results.NotFound();\n    db.Plants.Remove(plant);\n    await db.Plants.SaveChangesAsync();\n    return Results.NoContent();\n});',
        solution:
          'app.MapDelete("/plants/{id:int}", async (int id, GardenDb db) =>\n{\n    var plant = await db.Plants.FindAsync(id);\n    if (plant is null) return Results.NotFound();\n    db.Plants.Remove(plant);\n    await db.SaveChangesAsync();\n    return Results.NoContent();\n});\n\napp.MapPut("/plants/{id:int}", async (int id, Plant input, GardenDb db) =>\n{\n    var plant = await db.Plants.FindAsync(id);\n    if (plant is null) return Results.NotFound();\n    plant.Name = input.Name;\n    plant.WaterEveryDays = input.WaterEveryDays;\n    await db.SaveChangesAsync();\n    return Results.NoContent();\n});',
        checks: [
          { label: 'SaveChangesAsync is called on the context, not the DbSet', not: 'Plants.SaveChangesAsync' },
          { label: 'MapPut on /plants/{id}', re: 'MapPut\\(\\s*"/plants/\\{\\w+(:int)?\\}"' },
          { label: 'Find the plant and set its properties', re: 'MapPut\\([\\s\\S]*FindAsync\\([\\s\\S]*\\w+\\.\\w+\\s*=\\s*\\w+\\.\\w+\\s*;' },
          { label: 'Save in both endpoints', re: '(SaveChangesAsync[\\s\\S]*){2}' },
          { label: 'Results.NotFound() in both', re: '(Results\\.NotFound\\(\\)[\\s\\S]*){2}' },
        ],
        hint: 'SaveChangesAsync lives on GardenDb. For PUT, edit the tracked entity, then save.',
        explain: 'FindAsync returns a tracked entity, so changing its properties is enough: SaveChangesAsync sends an UPDATE.',
      },
    ],
    // L5 Bulk updates
    [
      {
        kind: 'write',
        prompt: 'Delete every expired session in one query and report how many went.',
        starter: '',
        solution:
          'app.MapDelete("/sessions/expired", async (AppDb db) =>\n{\n    var removed = await db.Sessions\n        .Where(s => s.ExpiresAt < DateTime.UtcNow)\n        .ExecuteDeleteAsync();\n    return $"Removed {removed} sessions";\n});',
        checks: [
          { label: 'Filter with Where(…)', re: '\\.Where\\(\\s*\\w+\\s*=>[\\s\\S]*?\\)\\s*\\.ExecuteDeleteAsync' },
          { label: 'Delete with ExecuteDeleteAsync()', re: 'await\\s+[\\s\\S]*\\.ExecuteDeleteAsync\\(\\s*\\)' },
          { label: 'Keep the returned row count', re: 'var\\s+\\w+\\s*=\\s*await\\s+[\\s\\S]*ExecuteDeleteAsync' },
          { label: 'No SaveChangesAsync needed', not: 'SaveChangesAsync' },
        ],
        hint: 'Where picks the rows; ExecuteDeleteAsync runs the DELETE and returns the count.',
        explain: 'ExecuteDeleteAsync becomes one DELETE … WHERE statement, without loading any sessions into memory.',
      },
      {
        kind: 'write',
        prompt: 'Rewrite the winter sale as one UPDATE with ExecuteUpdateAsync.',
        starter:
          'app.MapPost("/products/sale", async (ShopDb db) =>\n{\n    var products = await db.Products.Where(p => p.Category == "Winter").ToListAsync();\n    foreach (var p in products) p.Price = p.Price * 0.8m;\n    await db.SaveChangesAsync();\n    return Results.Ok(products.Count);\n});',
        solution:
          'app.MapPost("/products/sale", async (ShopDb db) =>\n{\n    var updated = await db.Products\n        .Where(p => p.Category == "Winter")\n        .ExecuteUpdateAsync(s => s.SetProperty(p => p.Price, p => p.Price * 0.8m));\n    return Results.Ok(updated);\n});',
        checks: [
          { label: 'Keep the Winter filter', re: '\\.Where\\(\\s*(\\w+)\\s*=>\\s*\\1\\.Category\\s*==\\s*"Winter"\\s*\\)' },
          { label: 'ExecuteUpdateAsync(s => s.SetProperty(…))', re: 'ExecuteUpdateAsync\\(\\s*(\\w+)\\s*=>\\s*\\1\\s*\\.SetProperty\\(' },
          { label: 'Set Price from the old price × 0.8', re: 'SetProperty\\(\\s*(\\w+)\\s*=>\\s*\\1\\.Price\\s*,\\s*(\\w+)\\s*=>\\s*\\2\\.Price\\s*\\*\\s*0\\.8m\\s*\\)' },
          { label: 'No loading with ToListAsync', not: 'ToListAsync' },
          { label: 'No foreach or SaveChangesAsync', re: '^(?![\\s\\S]*(foreach|SaveChangesAsync))' },
        ],
        hint: 'SetProperty takes the property, then a lambda that computes the new value from the old one.',
        explain: 'The whole sale becomes UPDATE … SET Price = Price * 0.8 WHERE Category = \'Winter\', and the count of changed rows comes back.',
      },
    ],
  ],
};

export default unit;
