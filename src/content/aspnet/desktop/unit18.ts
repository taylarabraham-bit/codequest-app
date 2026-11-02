import type { DesktopUnit } from '../../../engine/types';

// Desktop edition: write-the-code challenges for ASP.NET unit 18 (File uploads & static files).
// lessons[i] runs after lesson i + 1. See docs/CONTENT_GUIDE.md.
const unit: DesktopUnit = {
  lessons: [
    // L1 Receiving a file
    [
      {
        kind: 'write',
        prompt: 'Accept a receipt upload from an API client, save it, and reply with its size.',
        starter: '',
        solution:
          'app.MapPost("/receipts", async (IFormFile receipt) =>\n{\n    await using var stream = File.Create("receipt.pdf");\n    await receipt.CopyToAsync(stream);\n    return Results.Ok(receipt.Length);\n}).DisableAntiforgery();',
        checks: [
          { label: 'A MapPost that takes an IFormFile', re: 'MapPost\\(\\s*"/[^"]*"\\s*,\\s*async\\s*\\(\\s*IFormFile\\s+\\w+\\s*\\)' },
          {
            label: 'Open a file stream with using',
            re: '(await\\s+)?using\\s+(var\\s+\\w+\\s*=\\s*|\\(\\s*var\\s+\\w+\\s*=\\s*)(File\\.(Create|OpenWrite)|new\\s+FileStream)\\(',
          },
          { label: 'await CopyToAsync into the stream', re: 'await\\s+\\w+\\.CopyToAsync\\(\\s*\\w+' },
          { label: 'Reply with the file’s Length', re: '(Results|TypedResults)\\.Ok\\([^;]*\\.Length\\b' },
          { label: 'Allow API calls with .DisableAntiforgery()', has: '.DisableAntiforgery()' },
        ],
        hint: 'IFormFile.CopyToAsync writes the upload into any stream you open.',
        explain: 'The IFormFile parameter reads the multipart form for you. An API called with a bearer token sends no antiforgery token, so it opts out.',
      },
      {
        kind: 'write',
        prompt: 'Reject empty avatars with 400, and reply with the file’s name, type and size.',
        starter:
          'app.MapPost("/avatars", async (IFormFile file) =>\n{\n    await using var stream = File.Create("avatar.png");\n    await file.CopyToAsync(stream);\n    return Results.Ok();\n}).DisableAntiforgery();',
        solution:
          'app.MapPost("/avatars", async (IFormFile file) =>\n{\n    if (file.Length == 0)\n        return Results.BadRequest("Empty file");\n    await using var stream = File.Create("avatar.png");\n    await file.CopyToAsync(stream);\n    return Results.Ok(new { file.FileName, file.ContentType, file.Length });\n}).DisableAntiforgery();',
        checks: [
          { label: 'Check for an empty file with Length', re: 'if\\s*\\(\\s*\\w+\\.Length\\s*(==\\s*0|<=\\s*0|<\\s*1)\\s*\\)' },
          { label: 'Return 400 with BadRequest', re: '(Results|TypedResults)\\.BadRequest\\(' },
          { label: 'Check before saving', re: 'BadRequest\\([\\s\\S]*CopyToAsync\\(' },
          {
            label: 'Reply with FileName, ContentType and Length',
            re: 'Ok\\(\\s*new\\s*\\{(?=[^}]*FileName)(?=[^}]*ContentType)(?=[^}]*Length)[^}]*\\}',
          },
        ],
        hint: 'An anonymous object like new { file.FileName, … } serialises to JSON.',
        explain: 'Bailing out before touching the disk means an empty upload never overwrites a good avatar.',
      },
    ],
    // L2 Many files, safe names
    [
      {
        kind: 'write',
        prompt: 'Save every photo in the gallery upload under a random name in uploadsDir.',
        starter: 'var uploadsDir = Path.Combine(builder.Environment.ContentRootPath, "uploads");\n',
        solution:
          'var uploadsDir = Path.Combine(builder.Environment.ContentRootPath, "uploads");\napp.MapPost("/gallery", async (IFormFileCollection photos) =>\n{\n    foreach (var photo in photos)\n    {\n        var path = Path.Combine(uploadsDir, Path.GetRandomFileName());\n        await using var stream = File.Create(path);\n        await photo.CopyToAsync(stream);\n    }\n    return Results.Ok(photos.Count);\n}).DisableAntiforgery();',
        checks: [
          { label: 'Take an IFormFileCollection', re: 'IFormFileCollection\\s+\\w+' },
          { label: 'Loop over the files with foreach', re: 'foreach\\s*\\(\\s*(var|IFormFile)\\s+\\w+\\s+in\\s+\\w+\\s*\\)' },
          { label: 'Name each file with Path.GetRandomFileName()', has: 'Path.GetRandomFileName()' },
          { label: 'Save inside uploadsDir with Path.Combine', re: 'Path\\.Combine\\(\\s*uploadsDir\\s*,' },
          { label: 'Never use the client’s FileName for the path', re: '^(?![\\s\\S]*(?<!GetExtension\\(\\w{1,40})\\.FileName\\b)' },
          { label: 'Allow API calls with .DisableAntiforgery()', has: '.DisableAntiforgery()' },
        ],
        hint: 'IFormFileCollection is a list of IFormFile; save each one like a single upload.',
        explain: 'A random name can’t contain ../ or clobber another user’s file, and uploads stay outside wwwroot so nobody can run them.',
      },
      {
        kind: 'write',
        prompt: 'This upload endpoint is unsafe. Save outside wwwroot under a random name.',
        starter:
          'app.MapPost("/docs", async (IFormFile doc) =>\n{\n    var path = Path.Combine(app.Environment.WebRootPath, doc.FileName);\n    await using var stream = File.Create(path);\n    await doc.CopyToAsync(stream);\n    return Results.Ok(path);\n}).DisableAntiforgery();',
        solution:
          'var uploadsDir = Path.Combine(app.Environment.ContentRootPath, "uploads");\nDirectory.CreateDirectory(uploadsDir);\n\napp.MapPost("/docs", async (IFormFile doc) =>\n{\n    var name = Path.GetRandomFileName();\n    await using var stream = File.Create(Path.Combine(uploadsDir, name));\n    await doc.CopyToAsync(stream);\n    return Results.Ok(name);\n}).DisableAntiforgery();',
        checks: [
          { label: 'Don’t save under WebRootPath', not: 'WebRootPath' },
          { label: 'Don’t use doc.FileName', not: 'doc.FileName' },
          { label: 'Generate a name with Path.GetRandomFileName()', has: 'Path.GetRandomFileName()' },
          { label: 'Save in an uploads folder outside wwwroot', re: 'ContentRootPath|"[^"]*uploads[^"]*"' },
          { label: 'Don’t send the server path back', not: 'Results.Ok(path)' },
        ],
        hint: 'Three problems: the folder, the file name, and what the endpoint returns.',
        explain: 'Files in wwwroot are served to anyone, a client-chosen name can escape the folder, and a server path leaks your layout.',
      },
    ],
    // L3 Limits & validation
    [
      {
        kind: 'write',
        prompt: 'Only accept .pdf and .docx CVs; reject anything else with 400.',
        starter:
          'app.MapPost("/cv", async (IFormFile cv) =>\n{\n    await using var stream = File.Create(Path.Combine(uploadsDir, Path.GetRandomFileName()));\n    await cv.CopyToAsync(stream);\n    return Results.Ok();\n}).DisableAntiforgery();',
        solution:
          'string[] allowed = [".pdf", ".docx"];\napp.MapPost("/cv", async (IFormFile cv) =>\n{\n    var ext = Path.GetExtension(cv.FileName).ToLowerInvariant();\n    if (!allowed.Contains(ext))\n        return Results.BadRequest("Only .pdf and .docx");\n    await using var stream = File.Create(Path.Combine(uploadsDir, Path.GetRandomFileName()));\n    await cv.CopyToAsync(stream);\n    return Results.Ok();\n}).DisableAntiforgery();',
        checks: [
          { label: 'Read the extension with Path.GetExtension(cv.FileName)', re: 'Path\\.GetExtension\\(\\s*\\w+\\.FileName\\s*\\)' },
          { label: 'Ignore the extension’s case', re: 'ToLowerInvariant\\(\\)|ToLower\\(\\)|OrdinalIgnoreCase' },
          { label: 'An allow-list with ".pdf" and ".docx"', re: '"\\.pdf"[\\s\\S]*"\\.docx"|"\\.docx"[\\s\\S]*"\\.pdf"' },
          { label: 'Check it with Contains', re: '\\.Contains\\(' },
          { label: 'Return BadRequest before saving', re: 'BadRequest\\([\\s\\S]*CopyToAsync\\(' },
        ],
        hint: 'Compare the lower-cased extension against a small array or HashSet.',
        explain: 'An allow-list rejects anything you didn’t think of, and lower-casing first means CV.PDF is still accepted.',
      },
      {
        kind: 'write',
        prompt: 'Cap scan uploads at 20 MB, app-wide and on the action, and accept PDFs only.',
        starter:
          '// Program.cs: cap multipart bodies here\n\n// ScansController.cs\n[ApiController, Route("api/scans")]\npublic class ScansController : ControllerBase\n{\n    [HttpPost]\n    public async Task<IActionResult> Upload(IFormFile scan)\n    {\n        await using var stream = System.IO.File.Create(Path.Combine("scans", Path.GetRandomFileName()));\n        await scan.CopyToAsync(stream);\n        return Ok();\n    }\n}',
        solution:
          '// Program.cs: cap multipart bodies here\nbuilder.Services.Configure<FormOptions>(o => o.MultipartBodyLengthLimit = 20 * 1024 * 1024);\n\n// ScansController.cs\n[ApiController, Route("api/scans")]\npublic class ScansController : ControllerBase\n{\n    [HttpPost, RequestSizeLimit(20 * 1024 * 1024)]\n    public async Task<IActionResult> Upload(IFormFile scan)\n    {\n        if (scan.ContentType != "application/pdf")\n            return BadRequest("PDF only");\n        await using var stream = System.IO.File.Create(Path.Combine("scans", Path.GetRandomFileName()));\n        await scan.CopyToAsync(stream);\n        return Ok();\n    }\n}',
        checks: [
          {
            label: 'Configure<FormOptions> with MultipartBodyLengthLimit of 20 MB',
            re: 'Configure<\\s*FormOptions\\s*>\\([^;]*MultipartBodyLengthLimit\\s*=\\s*(20\\s*\\*\\s*1024\\s*\\*\\s*1024|20_?000_?000|20_?971_?520)\\b',
          },
          { label: '[RequestSizeLimit] of 20 MB on the action', re: 'RequestSizeLimit\\(\\s*(20\\s*\\*\\s*1024\\s*\\*\\s*1024|20_?000_?000|20_?971_?520)\\s*\\)' },
          { label: 'Check for a PDF (type or extension)', re: '(ContentType\\s*(!=|==|is)[^;]*"application/pdf"|GetExtension[\\s\\S]*"\\.pdf")' },
          { label: 'Return BadRequest before saving', re: 'BadRequest\\([\\s\\S]*CopyToAsync\\(' },
        ],
        hint: 'FormOptions caps multipart forms for the app; the attribute caps this action’s whole body.',
        explain: 'Kestrel’s default is about 30 MB and forms allow 128 MB; both limits now stop oversized scans early, before you check the type.',
      },
    ],
    // L4 Streaming & downloads
    [
      {
        kind: 'write',
        prompt: 'Let users download invoice {id} as a named PDF, or get 404.',
        starter: 'var invoicesDir = Path.Combine(builder.Environment.ContentRootPath, "invoices");\n',
        solution:
          'var invoicesDir = Path.Combine(builder.Environment.ContentRootPath, "invoices");\napp.MapGet("/invoices/{id:int}", (int id) =>\n{\n    var path = Path.Combine(invoicesDir, $"{id}.pdf");\n    if (!File.Exists(path))\n        return Results.NotFound();\n    return TypedResults.PhysicalFile(path, "application/pdf", fileDownloadName: $"invoice-{id}.pdf");\n});',
        checks: [
          { label: 'MapGet("/invoices/{id}")', re: 'MapGet\\(\\s*"/invoices/\\{id(:int)?\\}"' },
          { label: 'Return 404 when File.Exists is false', re: 'File\\.Exists\\([\\s\\S]*NotFound\\(\\)' },
          { label: 'Send it with PhysicalFile and "application/pdf"', re: '(TypedResults|Results)\\.(PhysicalFile|File)\\([^;]*"application/pdf"' },
          {
            label: 'Name the download with fileDownloadName',
            re: 'fileDownloadName:\\s*\\$?"[^"]+"|\\.(PhysicalFile|File)\\([^;]*"application/pdf"\\s*,\\s*\\$?"[^"]+\\.pdf"',
          },
        ],
        hint: 'fileDownloadName sets Content-Disposition: attachment, so the browser saves the file.',
        explain: 'PhysicalFile streams straight from disk instead of loading the PDF into memory, and the 404 keeps missing ids from throwing.',
      },
      {
        kind: 'write',
        prompt: 'Stream raw podcast uploads to disk, then serve them back with seeking support.',
        starter: 'var episodesDir = Path.Combine(builder.Environment.ContentRootPath, "episodes");\nvar app = builder.Build();\n',
        solution:
          'var episodesDir = Path.Combine(builder.Environment.ContentRootPath, "episodes");\nvar app = builder.Build();\n\napp.MapPost("/episodes", async (HttpRequest request) =>\n{\n    var name = Path.GetRandomFileName();\n    await using var target = File.Create(Path.Combine(episodesDir, name));\n    await request.Body.CopyToAsync(target);\n    return Results.Created($"/episodes/{name}", null);\n});\n\napp.MapGet("/episodes/{name}", (string name) =>\n    TypedResults.PhysicalFile(Path.Combine(episodesDir, Path.GetFileName(name)),\n        "audio/mpeg", enableRangeProcessing: true));',
        checks: [
          { label: 'Take the raw HttpRequest', re: 'HttpRequest\\s+\\w+' },
          { label: 'Copy request.Body straight to the file', re: 'await\\s+\\w+\\.Body\\.CopyToAsync\\(' },
          { label: 'Skip IFormFile for big uploads', not: 'IFormFile' },
          { label: 'Save under Path.GetRandomFileName()', has: 'Path.GetRandomFileName()' },
          { label: 'Serve with PhysicalFile as "audio/mpeg"', re: 'PhysicalFile\\([\\s\\S]*?"audio/mpeg"' },
          { label: 'Answer Range requests: enableRangeProcessing: true', re: 'enableRangeProcessing:\\s*true' },
        ],
        hint: 'request.Body is a stream you can copy as bytes arrive; PhysicalFile handles Range for you.',
        explain: 'Streaming the body never buffers the whole episode in memory, and range support lets players jump ahead with 206 Partial Content.',
      },
    ],
    // L5 Static files & caching
    [
      {
        kind: 'write',
        prompt: 'Serve wwwroot with MapStaticAssets and uploaded photos at /photos.',
        starter: 'var app = builder.Build();\n',
        solution:
          'var app = builder.Build();\nvar uploadsDir = Path.Combine(app.Environment.ContentRootPath, "uploads");\nDirectory.CreateDirectory(uploadsDir);\napp.UseStaticFiles(new StaticFileOptions\n{\n    FileProvider = new PhysicalFileProvider(uploadsDir),\n    RequestPath = "/photos",\n});\napp.MapStaticAssets();',
        checks: [
          { label: 'UseStaticFiles with new StaticFileOptions', re: 'UseStaticFiles\\(\\s*new\\s+StaticFileOptions' },
          { label: 'FileProvider = new PhysicalFileProvider(folder)', re: 'FileProvider\\s*=\\s*new\\s+PhysicalFileProvider\\(\\s*[\\w"]' },
          { label: 'RequestPath = "/photos"', re: 'RequestPath\\s*=\\s*"/photos"' },
          { label: 'app.MapStaticAssets() for wwwroot', has: 'app.MapStaticAssets()' },
        ],
        hint: 'MapStaticAssets only knows files present at build time; uploads need their own provider.',
        explain: 'GET /photos/abc.jpg now reads uploads/abc.jpg, while wwwroot files get compression and fingerprinted, long-cached URLs.',
      },
      {
        kind: 'write',
        prompt: 'Cache served photos for a day and stop browsers sniffing their type.',
        starter:
          'app.UseStaticFiles(new StaticFileOptions\n{\n    FileProvider = new PhysicalFileProvider(uploadsDir),\n    RequestPath = "/photos",\n});',
        solution:
          'app.UseStaticFiles(new StaticFileOptions\n{\n    FileProvider = new PhysicalFileProvider(uploadsDir),\n    RequestPath = "/photos",\n    OnPrepareResponse = ctx =>\n    {\n        ctx.Context.Response.Headers.CacheControl = "public, max-age=86400";\n        ctx.Context.Response.Headers.XContentTypeOptions = "nosniff";\n    },\n});',
        checks: [
          { label: 'Set OnPrepareResponse = ctx => …', re: 'OnPrepareResponse\\s*=\\s*\\w+\\s*=>' },
          {
            label: 'Cache-Control: public, max-age=86400',
            re: '\\w+\\.Context\\.Response\\.Headers(\\.CacheControl|\\["Cache-Control"\\])\\s*=\\s*"public,\\s*max-age=86400"',
          },
          {
            label: 'X-Content-Type-Options: nosniff',
            re: '\\w+\\.Context\\.Response\\.Headers(\\.XContentTypeOptions|\\["X-Content-Type-Options"\\])\\s*=\\s*"nosniff"',
          },
          { label: 'Keep RequestPath = "/photos"', re: 'RequestPath\\s*=\\s*"/photos"' },
        ],
        hint: 'OnPrepareResponse runs for each file just before it’s sent; ctx.Context is the HttpContext.',
        explain: 'A day of caching saves repeat downloads. nosniff stops a browser treating an uploaded “image” as HTML or script.',
      },
    ],
  ],
};

export default unit;
