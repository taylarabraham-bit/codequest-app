import type { DesktopUnit } from '../../../engine/types';

// Desktop edition: write-the-code challenges for Ollama unit 8 (Embeddings).
// lessons[i] runs after lesson i + 1. See docs/CONTENT_GUIDE.md.

/** A JSON `"key": value` pair with any spacing (value is a regex source). */
const kv = (key: string, value: string) => `"${key}"\\s*:\\s*${value}`;

/** A quoted -d '@file.json' argument (PowerShell needs the quotes around @). */
const fileArg = `(-d|--data(-binary)?)\\s+(['"])@[\\w.\\\\/:-]+\\.json\\3`;

const GEN_SETUP = `using Microsoft.Extensions.AI;
using OllamaSharp;

IEmbeddingGenerator<string, Embedding<float>> gen =
    new OllamaApiClient(new Uri("http://localhost:11434"), "embeddinggemma");
`;

const unit: DesktopUnit = {
  lessons: [
    // L1 What embeddings are
    [
      {
        kind: 'write',
        prompt: 'Download an embedding model, then embed two dog descriptions from PowerShell.',
        starter: '',
        solution:
          'ollama pull embeddinggemma\nollama run embeddinggemma "Golden retriever puppy"\nollama run embeddinggemma "Young labrador"',
        checks: [
          { label: 'Pull an embedding model', re: '^\\s*ollama pull [\\w.:/-]+\\s*$', flags: 'm' },
          { label: 'ollama run it with quoted text', re: '^\\s*ollama run [\\w.:/-]+ "[^"]+"\\s*$', flags: 'm' },
          { label: 'Embed two texts', re: '(ollama run [\\w.:/-]+ "[^"]+"[\\s\\S]*){2}' },
        ],
        hint: 'An embedding model takes text after its name, like a one-shot prompt.',
        explain: 'Instead of a reply, ollama prints the vector: a long list of floats. Similar meanings give nearby vectors.',
        output: '[-0.04127,0.01873,0.06391,…]\n[-0.03892,0.02210,0.05977,…]',
      },
      {
        kind: 'write',
        prompt: 'Embedding models can’t chat. Get a vector, and use a chat model for the poem.',
        starter: 'ollama run embeddinggemma\n>>> Write a poem about pesto.\n',
        solution: 'ollama run embeddinggemma "Fresh basil pesto"\nollama run llama3.2 "Write a poem about pesto."',
        checks: [
          { label: 'Embed text with ollama run embeddinggemma "…"', re: '^\\s*ollama run embeddinggemma "[^"]+"', flags: 'm' },
          { label: 'Ask a chat model for the poem', re: '^\\s*ollama run (?!embeddinggemma)[\\w.:/-]+ "[^"]*poem', flags: 'mi' },
          { label: 'No >>> chat with the embedding model', not: '>>>' },
        ],
        hint: 'Give the embedding model its text on the command line. Poems need a model that generates text.',
        explain: 'An embedding model only turns text into numbers. Writing a poem needs a chat model like llama3.2.',
      },
    ],
    // L2 The embed endpoint
    [
      {
        kind: 'write',
        prompt: 'Embed one café review through /api/embed.',
        starter: '',
        solution:
          '{\n  "model": "embeddinggemma",\n  "input": "Great coffee, slow service."\n}\n# save as request.json, then in PowerShell:\ncurl.exe http://localhost:11434/api/embed -d \'@request.json\'',
        checks: [
          { label: 'POST to /api/embed with curl.exe', re: 'curl\\.exe[^\\n]*localhost:11434/api/embed' },
          { label: "Send the body file with -d '@request.json'", re: fileArg },
          { label: 'An embedding "model"', re: kv('model', '"[\\w.:/-]+"') },
          { label: 'The text in "input"', re: kv('input', '"[^"]+"') },
          { label: 'Not "prompt": embed takes input', not: '"prompt"' },
        ],
        hint: 'Write the body (request.json), then the curl.exe line. The text goes in input.',
        explain: 'The reply’s embeddings field is a list of vectors: one input gives a list holding one list.',
        output: '{"model":"embeddinggemma","embeddings":[[0.02130,-0.05871,…]],…}',
      },
      {
        kind: 'write',
        prompt: 'Call /api/embed from C# and print the vector’s length.',
        starter: 'using System.Net.Http.Json;\n\nvar http = new HttpClient { BaseAddress = new Uri("http://localhost:11434") };\n',
        solution: `using System.Net.Http.Json;

var http = new HttpClient { BaseAddress = new Uri("http://localhost:11434") };
var res = await http.PostAsJsonAsync("/api/embed", new { model = "embeddinggemma", input = "Fern care tips" });
res.EnsureSuccessStatusCode();
var reply = await res.Content.ReadFromJsonAsync<EmbedReply>();
Console.WriteLine(reply!.Embeddings[0].Length);

record EmbedReply(float[][] Embeddings);`,
        checks: [
          { label: 'PostAsJsonAsync to "/api/embed"', re: '\\.PostAsJsonAsync\\(\\s*"/?api/embed"\\s*,' },
          { label: 'A body with model and input', re: 'new\\s*\\{(?=[^}]*\\bmodel\\s*=\\s*"[^"]+")(?=[^}]*\\binput\\s*=\\s*"[^"]+")' },
          { label: 'A record with float[][] Embeddings', re: 'record \\w+\\(\\s*(float|double)\\[\\]\\[\\]\\??\\s+Embeddings\\s*\\)' },
          { label: 'Print the length of the first vector', re: 'Embeddings\\[0\\]\\.Length' },
        ],
        hint: 'embeddings is a list of lists, so its C# type is an array of arrays.',
        explain: 'Embeddings[0] is the vector for your one input; embeddinggemma vectors have 768 floats.',
        output: '768',
      },
    ],
    // L3 Batch embedding
    [
      {
        kind: 'write',
        prompt: 'Embed three product names in one call, as 256-float vectors.',
        starter: '',
        solution:
          '{\n  "model": "embeddinggemma",\n  "input": ["steel kettle", "bamboo toaster", "glass blender"],\n  "dimensions": 256\n}\n# save as request.json, then in PowerShell:\ncurl.exe http://localhost:11434/api/embed -d \'@request.json\'',
        checks: [
          { label: 'POST to /api/embed with curl.exe', re: 'curl\\.exe[^\\n]*localhost:11434/api/embed' },
          { label: "Send the body file with -d '@request.json'", re: fileArg },
          { label: 'embeddinggemma, which supports dimensions', re: kv('model', '"embeddinggemma(:\\w+)?"') },
          { label: '"input" as a list of three strings', re: kv('input', '\\[\\s*"[^"]+"\\s*,\\s*"[^"]+"\\s*,\\s*"[^"]+"\\s*\\]') },
          { label: '"dimensions": 256', re: kv('dimensions', '256\\b') },
        ],
        hint: 'A JSON list in input gives one vector per item. dimensions is a top-level number.',
        explain: 'You get three vectors of 256 floats, in the same order as the inputs.',
      },
      {
        kind: 'write',
        prompt: 'In request.json, make long inputs an error instead of cut, and shrink vectors to 128.',
        starter: '{\n  "model": "embeddinggemma",\n  "input": ["refund policy", "delivery times"]\n}\n',
        solution:
          '{\n  "model": "embeddinggemma",\n  "input": ["refund policy", "delivery times"],\n  "truncate": false,\n  "dimensions": 128\n}\n# curl.exe http://localhost:11434/api/embed -d \'@request.json\'\n# embeddings: 2 vectors of 128 floats',
        checks: [
          { label: '"truncate": false', re: kv('truncate', 'false\\b') },
          { label: '"dimensions": 128', re: kv('dimensions', '128\\b') },
          { label: 'Keep both inputs in a list', re: kv('input', '\\[\\s*"refund policy"\\s*,\\s*"delivery times"\\s*\\]') },
          { label: 'Commas between the fields', re: '\\]\\s*,\\s*"(truncate|dimensions)"' },
        ],
        hint: 'truncate defaults to true. Each new field needs a comma before it.',
        explain: 'With truncate off, an input longer than the context fails instead of being silently cut.',
      },
    ],
    // L4 Embeddings in C#
    [
      {
        kind: 'write',
        prompt: 'Embed one search query with OllamaSharp and print the vector’s length.',
        starter: '',
        solution: `${GEN_SETUP}ReadOnlyMemory<float> v = await gen.GenerateVectorAsync("waterproof hiking boots");
Console.WriteLine(v.Length);`,
        checks: [
          { label: 'The usings for Microsoft.Extensions.AI and OllamaSharp', re: '(?=[\\s\\S]*using Microsoft\\.Extensions\\.AI;)(?=[\\s\\S]*using OllamaSharp;)' },
          { label: 'An IEmbeddingGenerator<string, Embedding<float>>', has: 'IEmbeddingGenerator<string, Embedding<float>>' },
          { label: 'Made with new OllamaApiClient(uri, "embeddinggemma")', re: 'new OllamaApiClient\\([^;]*"embeddinggemma"\\s*\\)' },
          { label: 'await GenerateVectorAsync on your text', re: 'await \\w+\\.GenerateVectorAsync\\(\\s*"[^"]+"\\s*\\)' },
          { label: 'Print its Length', re: 'Console\\.WriteLine\\(\\s*\\w+\\.Length\\s*\\)' },
        ],
        hint: 'Declare the client as the embedding interface, then ask for one vector.',
        explain: 'GenerateVectorAsync returns a ReadOnlyMemory<float>; embeddinggemma vectors have 768 floats.',
        output: '768',
      },
      {
        kind: 'write',
        prompt: 'Embed every playlist name in one call and print each vector’s length.',
        starter: `${GEN_SETUP}string[] playlists = ["Morning run", "Rainy day jazz", "Road trip"];
`,
        solution: `${GEN_SETUP}string[] playlists = ["Morning run", "Rainy day jazz", "Road trip"];
var embeddings = await gen.GenerateAsync(playlists);
for (int i = 0; i < playlists.Length; i++)
    Console.WriteLine($"{playlists[i]}: {embeddings[i].Vector.Length}");`,
        checks: [
          { label: 'One GenerateAsync call with the whole array', re: 'await \\w+\\.GenerateAsync\\(\\s*playlists\\s*\\)' },
          { label: 'No call per text', not: 'GenerateVectorAsync' },
          { label: 'Loop over the results in order', re: '(for\\s*\\(|foreach\\s*\\()' },
          { label: 'Read each one’s .Vector.Length', re: '\\.Vector\\.Length' },
        ],
        hint: 'GenerateAsync takes a list and returns one Embedding<float> per text, in order.',
        explain: 'One call embeds every text; the results line up with the inputs by index.',
        output: 'Morning run: 768\nRainy day jazz: 768\nRoad trip: 768',
      },
    ],
    // L5 Cosine similarity
    [
      {
        kind: 'write',
        prompt: 'Score how close two job titles are with cosine similarity.',
        starter: GEN_SETUP,
        solution: `using System.Numerics.Tensors;
${GEN_SETUP}var a = await gen.GenerateVectorAsync("software engineer");
var b = await gen.GenerateVectorAsync("web developer");
float score = TensorPrimitives.CosineSimilarity(a.Span, b.Span);
Console.WriteLine(score.ToString("F2"));`,
        checks: [
          { label: 'using System.Numerics.Tensors;', has: 'using System.Numerics.Tensors;' },
          { label: 'Embed two texts', re: '(GenerateVectorAsync\\(\\s*"[^"]+"\\s*\\)[\\s\\S]*){2}' },
          { label: 'TensorPrimitives.CosineSimilarity of the two .Span values', re: 'TensorPrimitives\\.CosineSimilarity\\(\\s*\\w+\\.Span\\s*,\\s*\\w+\\.Span\\s*\\)' },
          { label: 'Print the score', re: 'Console\\.WriteLine\\(' },
        ],
        hint: 'CosineSimilarity takes spans, and ReadOnlyMemory<float> has a .Span.',
        explain: 'Closer to 1 means closer in meaning. Both vectors come from the same model, so the score is fair.',
      },
      {
        kind: 'write',
        prompt: 'Print the FAQ answer closest in meaning to the customer’s question.',
        starter: `using System.Numerics.Tensors;
${GEN_SETUP}string[] faq = ["Shipping takes 3 days.", "Returns are free within 30 days.", "We ship to the EU."];
`,
        solution: `using System.Numerics.Tensors;
${GEN_SETUP}string[] faq = ["Shipping takes 3 days.", "Returns are free within 30 days.", "We ship to the EU."];
var docs = await gen.GenerateAsync(faq);
var q = await gen.GenerateVectorAsync("Can I send it back?");
int best = 0;
float bestScore = -1;
for (int i = 0; i < faq.Length; i++)
{
    float s = TensorPrimitives.CosineSimilarity(q.Span, docs[i].Vector.Span);
    if (s > bestScore) { bestScore = s; best = i; }
}
Console.WriteLine(faq[best]);`,
        checks: [
          { label: 'Embed the FAQ in one GenerateAsync call', re: 'GenerateAsync\\(\\s*faq\\s*\\)' },
          { label: 'Embed the question with GenerateVectorAsync', re: 'GenerateVectorAsync\\(\\s*"[^"]+"\\s*\\)' },
          { label: 'Score each with CosineSimilarity on .Vector.Span', re: 'CosineSimilarity\\([^;]*\\.Vector\\.Span' },
          { label: 'Keep the highest score', re: 'if\\s*\\([^)]*>|OrderByDescending|MaxBy|Math\\.Max' },
          { label: 'Print the best FAQ entry', re: 'Console\\.WriteLine\\([^;]*(faq\\[|\\.Text|best)' },
        ],
        hint: 'Score every entry against the question and remember the index with the highest score.',
        explain: 'The returns answer scores highest even though it shares no words with “send it back”: that’s meaning, not keywords.',
        output: 'Returns are free within 30 days.',
      },
    ],
  ],
  // Laptop versions: Windows PowerShell 5.1 needs curl.exe, the JSON body in a file, and Get-Content instead of cat.
  concepts: {
    2: {
      body: 'POST a model and an input to /api/embed to get vectors over HTTP. The reply’s embeddings field is a list of vectors, so one input comes back as a list holding one list. Nothing streams: you always get one JSON object. On Windows, type curl.exe (in Windows PowerShell, plain curl is Invoke-WebRequest) and keep the body in request.json, sent with -d \'@request.json\'.',
      code: `# request.json\n{\n  "model": "embeddinggemma",\n  "input": "Quiet cafe with good wifi"\n}\nPS> curl.exe http://localhost:11434/api/embed -d '@request.json'\n{"model":"embeddinggemma","embeddings":[[0.021304,-0.058719,...]],...}`,
    },
    3: {
      body: 'Make input a list to embed many texts in one call: you get one vector per input, in the same order. truncate (default true) cuts input that’s longer than the context; "truncate": false makes that an error instead. dimensions asks for shorter vectors, for models trained for it like embeddinggemma (768 down to 512, 256 or 128).',
      code: `# request.json\n{\n  "model": "embeddinggemma",\n  "input": ["red apple", "green pear", "used bike"],\n  "dimensions": 256\n}\nPS> curl.exe http://localhost:11434/api/embed -d '@request.json'\n# 3 vectors of 256 floats, in input order`,
    },
  },
  overrides: {
    'L1.7': {
      kind: 'build',
      prompt: 'Embed the text in review.txt by piping it in.',
      answer: ['Get-Content', 'review.txt', '-Raw', '|', 'ollama', 'run', 'embeddinggemma'],
      distractors: ['>', 'llama3.2'],
      alt: [['Get-Content', '-Raw', 'review.txt', '|', 'ollama', 'run', 'embeddinggemma']],
      hint: 'The same pipe you used to summarise a file.',
      explain: 'Get-Content -Raw reads the file as one string, and piped text becomes the input, so this prints one vector for the whole file.',
    },
    'L2.1': {
      kind: 'fill',
      prompt: 'Pick the endpoint that returns vectors.',
      code: `# request.json: {"model": "embeddinggemma", "input": "Vegan lasagne"}\ncurl.exe http://localhost:11434/api/___ -d '@request.json'`,
      blanks: [{ answer: ['embed'], options: ['embed', 'generate', 'vector'] }],
      hint: 'Short for embedding.',
      explain: '/api/embed turns input into vectors. /api/generate would refuse an embedding model, since it can’t write text.',
    },
    'L2.2': {
      kind: 'fill',
      prompt: 'Name the key in request.json that holds the text.',
      code: '{\n  "model": "embeddinggemma",\n  "___": "Vegan lasagne"\n}',
      blanks: [{ answer: ['input'], options: ['input', 'prompt', 'text'] }],
      hint: 'Not the name /api/generate uses.',
      explain: '/api/embed reads input. A prompt key is ignored here, so you’d get "embeddings": [] back.',
    },
    'L2.6': {
      kind: 'fill',
      prompt: 'Where should embeddinggemma requests go instead?',
      code: `# request.json: {"model": "embeddinggemma", "prompt": "Hi", "stream": false}\nPS> curl.exe http://localhost:11434/api/generate -d '@request.json'\n{"error":"\\"embeddinggemma\\" does not support generate"}\n# send it to ___ instead`,
      blanks: [{ answer: ['/api/embed'], options: ['/api/embed', '/api/chat', '/api/show'] }],
      hint: 'Which endpoint makes vectors?',
      explain: 'An embedding model can’t write text, so /api/generate and /api/chat refuse it with 400. Send it to /api/embed, with the text in input.',
    },
    'L2.7': {
      kind: 'build',
      prompt: 'request.json asks embeddinggemma to embed "Rainy day reads". Send it.',
      answer: ['curl.exe', 'http://localhost:11434/api/embed', '-d', "'@request.json'"],
      distractors: ['-X GET', 'http://localhost:11434/api/embeddings'],
      alt: [['curl.exe', '-d', "'@request.json'", 'http://localhost:11434/api/embed']],
      hint: '-d sends the body and makes the request a POST.',
      explain: '/api/embed only takes POST. The older /api/embeddings expects prompt, not input, so it would ignore this text.',
    },
    'L3.3': {
      kind: 'order',
      prompt: 'Order request.json for a batch of two support questions.',
      lines: [
        '{',
        '  "model": "embeddinggemma",',
        '  "input": [',
        '    "How do I reset my password?",',
        '    "Where is my parcel?"',
        '  ]',
        '}',
      ],
      hint: 'The list sits inside input. Its last item has no comma.',
      explain: 'Sent to /api/embed, it returns two vectors: the password question’s first, the parcel question’s second.',
    },
    'L3.4': {
      kind: 'fill',
      prompt: 'Type the key in request.json that shortens the vectors.',
      code: '{\n  "model": "embeddinggemma",\n  "input": ["sea kayak", "ski pass"],\n  "___": 256\n}',
      blanks: [{ answer: ['dimensions'] }],
      hint: 'How many numbers each vector has.',
      explain: 'Each vector comes back with 256 floats instead of 768: smaller to store and faster to compare, for a little less accuracy.',
    },
    'L3.7': {
      kind: 'fix',
      prompt: 'Fix request.json so it returns shorter vectors.',
      code: `{\n  "model": "embeddinggemma",\n  "input": ["sunrise hike", "night market"],\n  "dimensions": [[1024]]\n}\n# curl.exe http://localhost:11434/api/embed -d '@request.json' prints:\n# {"error":"dimensions 1024 exceeds embedding length 768"}`,
      fix: '512',
      options: ['512', '1536', '2048'],
      hint: 'dimensions can only shrink a vector.',
      explain: 'embeddinggemma makes 768 floats, so dimensions must be smaller: 512, 256 or 128.',
    },
    'boss.1': {
      kind: 'fill',
      prompt: 'What shape is the reply to this request.json?',
      code: '{\n  "model": "embeddinggemma",\n  "input": ["kettle", "toaster", "blender"],\n  "dimensions": 128\n}\n# sent to /api/embed: "embeddings" holds ___',
      blanks: [
        {
          answer: ['3 vectors of 128 floats'],
          options: ['3 vectors of 128 floats', '1 vector of 384 floats', '128 vectors of 3 floats'],
        },
      ],
      hint: 'One vector per input; dimensions sets each one’s length.',
      explain: 'Each of the three inputs gets its own vector, in order, shortened from 768 to 128 floats.',
    },
    'boss.3': {
      kind: 'type',
      prompt: 'In request.json, embed "oak" then "pine" in one request.',
      template: '{\n  "model": "embeddinggemma",\n  ___\n}',
      accept: ['"input": ["oak", "pine"]'],
      hint: 'One key, with a JSON list as its value.',
      explain: 'A list as input returns two vectors: embeddings[0] for oak, embeddings[1] for pine.',
    },
  },
};

export default unit;
