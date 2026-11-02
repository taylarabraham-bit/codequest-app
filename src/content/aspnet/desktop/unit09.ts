import type { DesktopUnit } from '../../../engine/types';

// Desktop edition: write-the-code challenges for ASP.NET unit 9 (EF Core relationships & migrations).
// lessons[i] runs after lesson i + 1. See docs/CONTENT_GUIDE.md.
const unit: DesktopUnit = {
  lessons: [
    // L1 One-to-many
    [
      {
        kind: 'write',
        prompt: 'Model a team with many players: write Team and Player entities.',
        starter: '',
        solution:
          'public class Team\n{\n    public int Id { get; set; }\n    public string Name { get; set; } = "";\n    public List<Player> Players { get; set; } = [];\n}\n\npublic class Player\n{\n    public int Id { get; set; }\n    public string Name { get; set; } = "";\n    public int TeamId { get; set; }\n    public Team Team { get; set; } = null!;\n}',
        checks: [
          { label: 'Team and Player classes, each with an int Id', re: 'class\\s+Team\\b[\\s\\S]*?int\\s+Id\\b[\\s\\S]*class\\s+Player\\b[\\s\\S]*?int\\s+Id\\b|class\\s+Player\\b[\\s\\S]*?int\\s+Id\\b[\\s\\S]*class\\s+Team\\b[\\s\\S]*?int\\s+Id\\b' },
          { label: 'A Players collection on Team', re: '(List|ICollection)<\\s*Player\\s*>\\s+Players\\s*\\{' },
          { label: 'An int TeamId foreign key on Player', re: 'public\\s+int\\s+TeamId\\s*\\{\\s*get;\\s*set;' },
          { label: 'A Team reference on Player', re: 'public\\s+Team\\??\\s+Team\\s*\\{\\s*get;\\s*set;' },
        ],
        hint: 'The “one” side gets a collection; the “many” side gets a foreign key plus a reference.',
        explain: 'EF pairs Players with Team by name and stores TeamId as a column in the Players table.',
      },
      {
        kind: 'write',
        prompt: 'Add a player to a team; 404 if the team does not exist.',
        starter:
          'app.MapPost("/teams/{teamId:int}/players", async (int teamId, Player player, LeagueDb db) =>\n{\n    // your code\n});',
        solution:
          'app.MapPost("/teams/{teamId:int}/players", async (int teamId, Player player, LeagueDb db) =>\n{\n    // your code\n    if (await db.Teams.FindAsync(teamId) is null) return Results.NotFound();\n    player.TeamId = teamId;\n    db.Players.Add(player);\n    await db.SaveChangesAsync();\n    return Results.Created($"/players/{player.Id}", player);\n});',
        checks: [
          { label: 'Look the team up with FindAsync', re: 'Teams\\.FindAsync\\(\\s*\\w+\\s*\\)' },
          { label: 'Results.NotFound() when it is missing', has: 'Results.NotFound()' },
          { label: 'Link them: set TeamId or add to team.Players', re: '\\w+\\.TeamId\\s*=\\s*\\w+|\\.Players\\.Add\\(\\s*\\w+\\s*\\)' },
          { label: 'await db.SaveChangesAsync()', re: 'await\\s+\\w+\\.SaveChangesAsync\\(\\s*\\)' },
        ],
        hint: 'Setting the foreign key is enough to link the player; then save.',
        explain: 'EF writes TeamId into the new Players row. Adding the player to team.Players would do the same.',
      },
    ],
    // L2 Many-to-many
    [
      {
        kind: 'write',
        prompt: 'Let a student take many courses, and a course have many students.',
        starter:
          'public class Student\n{\n    public int Id { get; set; }\n    public string Name { get; set; } = "";\n}\n\npublic class Course\n{\n    public int Id { get; set; }\n    public string Title { get; set; } = "";\n}',
        solution:
          'public class Student\n{\n    public int Id { get; set; }\n    public string Name { get; set; } = "";\n    public List<Course> Courses { get; set; } = [];\n}\n\npublic class Course\n{\n    public int Id { get; set; }\n    public string Title { get; set; } = "";\n    public List<Student> Students { get; set; } = [];\n}',
        checks: [
          { label: 'A Course collection on Student', re: 'class\\s+Student\\b(?:(?!\\bclass\\s)[\\s\\S])*(List|ICollection)<\\s*Course\\s*>\\s+\\w+' },
          { label: 'A Student collection on Course', re: 'class\\s+Course\\b(?:(?!\\bclass\\s)[\\s\\S])*(List|ICollection)<\\s*Student\\s*>\\s+\\w+' },
          { label: 'No hand-made foreign key ids', re: '^(?![\\s\\S]*\\b(StudentId|CourseId)\\b)' },
        ],
        hint: 'A collection on both sides is all EF needs.',
        explain: 'With collections on both ends, EF creates a hidden CourseStudent join table to hold the pairs.',
      },
      {
        kind: 'write',
        prompt: 'Enrol a student in a course; 404 if either is missing.',
        starter:
          'app.MapPost("/courses/{courseId:int}/students/{studentId:int}",\n    async (int courseId, int studentId, SchoolDb db) =>\n{\n    // your code\n});',
        solution:
          'app.MapPost("/courses/{courseId:int}/students/{studentId:int}",\n    async (int courseId, int studentId, SchoolDb db) =>\n{\n    // your code\n    var course = await db.Courses.FindAsync(courseId);\n    var student = await db.Students.FindAsync(studentId);\n    if (course is null || student is null) return Results.NotFound();\n    course.Students.Add(student);\n    await db.SaveChangesAsync();\n    return Results.NoContent();\n});',
        checks: [
          { label: 'Find both the course and the student', re: 'Courses\\.FindAsync\\([\\s\\S]*Students\\.FindAsync\\(|Students\\.FindAsync\\([\\s\\S]*Courses\\.FindAsync\\(' },
          { label: 'Results.NotFound() if either is null', has: 'Results.NotFound()' },
          { label: 'Add one to the other’s collection', re: '\\w+\\.(Students|Courses)\\.Add\\(\\s*\\w+\\s*\\)' },
          { label: 'Save the change', re: 'await\\s+\\w+\\.SaveChangesAsync\\(\\s*\\)' },
        ],
        hint: 'course.Students.Add(student) links them; SaveChangesAsync writes the join row.',
        explain: 'You never touch the join table: adding to either collection makes EF insert a CourseStudent row.',
      },
    ],
    // L3 Loading related data
    [
      {
        kind: 'write',
        prompt: 'The summary always says 0 players. Load them with the team.',
        starter:
          'app.MapGet("/teams/{id:int}/summary", async (int id, LeagueDb db) =>\n{\n    var team = await db.Teams.FirstOrDefaultAsync(t => t.Id == id);\n    return team is null\n        ? Results.NotFound()\n        : Results.Ok($"{team.Name}: {team.Players.Count} players");\n});',
        solution:
          'app.MapGet("/teams/{id:int}/summary", async (int id, LeagueDb db) =>\n{\n    var team = await db.Teams\n        .Include(t => t.Players)\n        .FirstOrDefaultAsync(t => t.Id == id);\n    return team is null\n        ? Results.NotFound()\n        : Results.Ok($"{team.Name}: {team.Players.Count} players");\n});',
        checks: [
          { label: 'Include(t => t.Players) on the query', re: '\\.Include\\(\\s*(\\w+)\\s*=>\\s*\\1\\.Players\\s*\\)' },
          { label: 'Include comes before FirstOrDefaultAsync', re: 'Include\\([\\s\\S]*FirstOrDefaultAsync\\(' },
          { label: 'Keep the 404 for a missing team', has: 'Results.NotFound()' },
        ],
        hint: 'Lazy loading is off, so related rows only arrive when you ask for them.',
        explain: 'Include adds a JOIN, so team.Players is filled in the same query instead of staying empty.',
      },
      {
        kind: 'write',
        prompt: 'Replace the Include with a projection: name plus titles of books after 2020.',
        starter: 'app.MapGet("/authors", async (LibraryDb db) =>\n    await db.Authors.Include(a => a.Books).ToListAsync());',
        solution:
          'app.MapGet("/authors", async (LibraryDb db) =>\n    await db.Authors\n        .Select(a => new\n        {\n            a.Name,\n            Recent = a.Books.Where(b => b.Year > 2020).Select(b => b.Title).ToList()\n        })\n        .ToListAsync());',
        checks: [
          { label: 'Project with Select(a => new { … })', re: '\\.Select\\(\\s*(\\w+)\\s*=>\\s*new\\b' },
          { label: 'Filter the books by year > 2020', re: '\\.Books\\.Where\\(\\s*(\\w+)\\s*=>\\s*\\1\\.Year\\s*(>\\s*2020|>=\\s*2021)\\s*\\)' },
          { label: 'Select only the titles', re: '\\.Select\\(\\s*(\\w+)\\s*=>\\s*\\1\\.Title\\s*\\)' },
          { label: 'No Include needed', not: '.Include(' },
          { label: 'Still finish with ToListAsync()', has: '.ToListAsync()' },
        ],
        hint: 'Inside Select you can reach a.Books directly; EF turns it into the right SQL.',
        explain: 'A projection fetches only the columns you name and needs no Include, and it avoids the author ↔ book cycle in JSON.',
      },
    ],
    // L4 Fluent configuration
    [
      {
        kind: 'write',
        prompt: 'Cap plant names at 100 characters and make them unique.',
        starter:
          'public class GardenDb(DbContextOptions<GardenDb> options) : DbContext(options)\n{\n    public DbSet<Plant> Plants => Set<Plant>();\n}',
        solution:
          'public class GardenDb(DbContextOptions<GardenDb> options) : DbContext(options)\n{\n    public DbSet<Plant> Plants => Set<Plant>();\n\n    protected override void OnModelCreating(ModelBuilder modelBuilder)\n    {\n        modelBuilder.Entity<Plant>().Property(p => p.Name).HasMaxLength(100);\n        modelBuilder.Entity<Plant>().HasIndex(p => p.Name).IsUnique();\n    }\n}',
        checks: [
          { label: 'protected override void OnModelCreating(ModelBuilder …)', re: 'protected\\s+override\\s+void\\s+OnModelCreating\\(\\s*ModelBuilder\\s+\\w+\\s*\\)' },
          { label: 'Configure Entity<Plant>()', re: '\\.Entity<\\s*Plant\\s*>\\(\\s*\\)' },
          { label: 'Property(p => p.Name).HasMaxLength(100)', re: 'Property\\(\\s*(\\w+)\\s*=>\\s*\\1\\.Name\\s*\\)\\s*\\.HasMaxLength\\(\\s*100\\s*\\)' },
          { label: 'HasIndex(p => p.Name).IsUnique()', re: 'HasIndex\\(\\s*(\\w+)\\s*=>\\s*\\1\\.Name\\s*\\)\\s*\\.IsUnique\\(\\s*\\)' },
        ],
        hint: 'Pick the entity with modelBuilder.Entity<Plant>(), then chain a rule.',
        explain: 'HasMaxLength sets the column size, and a unique index makes the database reject a second plant with the same name.',
      },
      {
        kind: 'write',
        prompt: 'Configure team → players explicitly, and block deleting a team that has players.',
        starter:
          'protected override void OnModelCreating(ModelBuilder modelBuilder)\n{\n}',
        solution:
          'protected override void OnModelCreating(ModelBuilder modelBuilder)\n{\n    modelBuilder.Entity<Team>()\n        .HasMany(t => t.Players)\n        .WithOne(p => p.Team)\n        .HasForeignKey(p => p.TeamId)\n        .OnDelete(DeleteBehavior.Restrict);\n}',
        checks: [
          { label: 'Start from Entity<Team>()', re: '\\.Entity<\\s*Team\\s*>\\(\\s*\\)' },
          { label: 'HasMany(t => t.Players)', re: '\\.HasMany\\(\\s*(\\w+)\\s*=>\\s*\\1\\.Players\\s*\\)' },
          { label: 'WithOne(p => p.Team)', re: '\\.WithOne\\(\\s*(\\w+)\\s*=>\\s*\\1\\.Team\\s*\\)' },
          { label: 'HasForeignKey(p => p.TeamId)', re: '\\.HasForeignKey\\(\\s*(\\w+)\\s*=>\\s*\\1\\.TeamId\\s*\\)' },
          { label: 'OnDelete(DeleteBehavior.Restrict)', has: '.OnDelete(DeleteBehavior.Restrict)' },
        ],
        hint: 'Read it as a sentence: a team has many players, each with one team, keyed by TeamId.',
        explain: 'Restrict makes the database refuse to delete a team while players still point at it, instead of cascading.',
      },
    ],
    // L5 Migrations
    [
      {
        kind: 'write',
        prompt: 'Install the EF tools, then record and apply a migration called AddPlantNotes.',
        starter: '',
        solution:
          'dotnet tool install --global dotnet-ef\ndotnet add package Microsoft.EntityFrameworkCore.Design\ndotnet ef migrations add AddPlantNotes\ndotnet ef database update',
        checks: [
          { label: 'Install the dotnet-ef tool', re: 'dotnet tool install\\s+(--global|-g)\\s+dotnet-ef' },
          { label: 'Add the Microsoft.EntityFrameworkCore.Design package', re: 'dotnet add package\\s+Microsoft\\.EntityFrameworkCore\\.Design' },
          { label: 'dotnet ef migrations add AddPlantNotes', re: 'dotnet ef migrations add\\s+AddPlantNotes\\b' },
          { label: 'Apply it with dotnet ef database update, last', re: 'migrations add[\\s\\S]*dotnet ef database update\\s*$' },
        ],
        hint: 'Tool, package, then migrations add, then database update.',
        explain: 'migrations add writes C# describing the change; database update runs it against the database.',
      },
      {
        kind: 'write',
        prompt: 'Switch startup to migrations, and only run them in Development.',
        starter:
          'using (var scope = app.Services.CreateScope())\n{\n    var db = scope.ServiceProvider.GetRequiredService<GardenDb>();\n    await db.Database.EnsureCreatedAsync();\n}',
        solution:
          'if (app.Environment.IsDevelopment())\n{\n    using var scope = app.Services.CreateScope();\n    var db = scope.ServiceProvider.GetRequiredService<GardenDb>();\n    await db.Database.MigrateAsync();\n}',
        checks: [
          { label: 'await db.Database.MigrateAsync()', re: 'await\\s+\\w+\\.Database\\.MigrateAsync\\(\\s*\\)' },
          { label: 'No EnsureCreatedAsync', not: 'EnsureCreatedAsync' },
          { label: 'Only when app.Environment.IsDevelopment()', re: 'if\\s*\\(\\s*app\\.Environment\\.IsDevelopment\\(\\)\\s*\\)[\\s\\S]*MigrateAsync' },
          { label: 'Still resolve the context from a scope', re: 'CreateScope\\(\\)[\\s\\S]*GetRequiredService<\\s*GardenDb\\s*>' },
        ],
        hint: 'EnsureCreatedAsync and migrations don’t mix; MigrateAsync applies pending migrations.',
        explain: 'A database made by EnsureCreatedAsync has no migrations history, so later migrations can’t be applied to it.',
      },
    ],
  ],
};

export default unit;
