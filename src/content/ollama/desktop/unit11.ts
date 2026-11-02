import type { DesktopUnit } from '../../../engine/types';

// Desktop edition: write-the-code challenges for Ollama unit 11 (Vision models).
// lessons[i] runs after lesson i + 1. See docs/CONTENT_GUIDE.md.

/** A quoted -d '@file.json' argument (PowerShell needs the quotes around @). */
const fileArg = `(-d|--data(-binary)?)\\s+(['"])@[\\w.\\\\/:-]+\\.json\\3`;

/** Ways to type "base64 this file as one line" in Windows PowerShell 5.1. */
const base64Forms = (file: string) => [
  ...new Set(
    ['', 'System.'].flatMap((ns) =>
      [file, `.\\${file}`].flatMap((f) => [
        `[${ns}Convert]::ToBase64String((Get-Content ${f} -Encoding Byte -Raw))`,
        `[${ns}Convert]::ToBase64String((Get-Content ${f} -Raw -Encoding Byte))`,
        `[${ns}Convert]::ToBase64String((Get-Content -Path ${f} -Encoding Byte -Raw))`,
        `[${ns}Convert]::ToBase64String([IO.File]::ReadAllBytes("$PWD\\${file}"))`,
        `[${ns}Convert]::ToBase64String([System.IO.File]::ReadAllBytes("$PWD\\${file}"))`,
      ]),
    ),
  ),
];

const VISION = '(gemma3(?!:1b)|llama3\\.2-vision|qwen2\\.5vl|qwen3-vl|llava|minicpm-v|llama4|moondream|granite3\\.2-vision|mistral-small3\\.[12])';

const unit: DesktopUnit = {
  // Windows PowerShell versions of shared items (the phone keeps the originals):
  // curl.exe, JSON bodies in request.json, base64 with [Convert], ; instead of &&.
  concepts: {
    2: {
      body: 'Over HTTP you send the image itself, base64-encoded. /api/generate takes a top-level "images" array next to prompt; /api/chat puts "images" on a message. Several strings in the array means several images, in that order. On Windows, type curl.exe (in Windows PowerShell, plain curl is Invoke-WebRequest) and keep the body in request.json, sent with -d \'@request.json\'.',
      code: `# the body, saved as request.json\n{\n  "model": "gemma3",\n  "prompt": "Caption this photo.",\n  "images": ["/9j/4AAQSkZJRgABAQ..."],\n  "stream": false\n}\nPS> curl.exe http://localhost:11434/api/generate -d '@request.json'`,
    },
  },
  overrides: {
    'L1.7': {
      kind: 'build',
      prompt: 'Pull the 3b qwen2.5vl, then check its capabilities.',
      answer: ['ollama pull qwen2.5vl:3b', ';', 'ollama show qwen2.5vl:3b'],
      distractors: ['ollama run qwen2.5vl:3b', 'qwen2.5vl-3b', '&&'],
      hint: 'Model, colon, size tag, in both commands. Windows PowerShell separates commands with ;',
      explain:
        'The 3b tag is a small vision model that fits on modest GPUs; show confirms vision is in its capabilities. Windows PowerShell 5.1 has no &&, so ; runs one command after the other.',
    },
    'L2.1': {
      kind: 'fill',
      prompt: 'Pick the endpoint for this request.json.',
      code: `# body, saved as request.json: {"model": "gemma3", "prompt": "Caption this.", "images": ["iVBORw0KGgoAAAANSUhEUg..."], "stream": false}\nPS> curl.exe http://localhost:11434/api/___ -d '@request.json'`,
      blanks: [{ answer: ['generate'], options: ['generate', 'chat', 'embed'] }],
      hint: 'A top-level prompt, no messages.',
      explain: 'prompt plus a top-level images array is a generate request. /api/chat wants messages, with images on each message.',
      output:
        '{"model":"gemma3","created_at":"2026-10-14T09:12:40.518302Z","response":"A tabby cat asleep on a stack of books.","done":true,"done_reason":"stop","total_duration":1630221458,"load_duration":71204125,"prompt_eval_count":283,"prompt_eval_duration":904118000,"eval_count":11,"eval_duration":402551000}',
    },
    'L2.4': {
      kind: 'build',
      prompt: 'Encode receipt.jpg as one line of base64 in PowerShell.',
      answer: ['[Convert]::ToBase64String(', '(Get-Content receipt.jpg -Encoding Byte -Raw)', ')'],
      distractors: ['[Convert]::FromBase64String(', '(Get-Content receipt.jpg)'],
      hint: 'Read the file as bytes, then let .NET encode them.',
      explain:
        'In Windows PowerShell 5.1, Get-Content -Encoding Byte -Raw reads the file as one byte array, and ToBase64String turns it into a single line you can put in JSON. FromBase64String would decode instead.',
    },
    'L2.6': {
      kind: 'fill',
      prompt: 'Send the request.json that PowerShell just built.',
      code: '$img = [Convert]::ToBase64String((Get-Content shelf.jpg -Encoding Byte -Raw))\n@{ model = "gemma3"; prompt = "Count the books."; images = @($img); stream = $false } |\n  ConvertTo-Json | Set-Content request.json\ncurl.exe http://localhost:11434/api/generate -d ___',
      blanks: [
        {
          answer: ["'@request.json'", '"@request.json"'],
          options: ["'@request.json'", '$img', "'request.json'"],
        },
      ],
      hint: 'curl.exe reads the body from a file when the name starts with @.',
      explain:
        "ConvertTo-Json builds valid JSON around the long base64 string, and -d '@request.json' sends the file’s contents. Quote it: a bare @ means splatting in PowerShell, and without the @ curl.exe sends the words request.json.",
      output:
        '{"model":"gemma3","created_at":"2026-10-14T09:20:03.10442Z","response":"There are 23 books on the shelf.","done":true,"done_reason":"stop", ...}',
    },
    'boss.3': {
      kind: 'fill',
      prompt: 'Send a photo through the chat endpoint.',
      code: `{\n  "model": "gemma3", "stream": false,\n  "messages": [{"role": "user", "content": "Caption it.", "___": ["iVBORw0KGgoAAAANSUhEUg..."]}]\n}\n# PS> curl.exe http://localhost:11434/api/___ -d '@request.json'`,
      blanks: [
        { answer: ['images'], options: ['images', 'image', 'files'] },
        { answer: ['chat'], options: ['chat', 'generate', 'embed'] },
      ],
      hint: 'The key is plural; messages means chat.',
      explain: 'In /api/chat the images ride on the message they belong to. /api/generate would want a prompt and a top-level images array.',
    },
    'boss.8': {
      kind: 'type',
      prompt: 'Encode fridge.png as one unwrapped base64 line in PowerShell.',
      accept: base64Forms('fridge.png'),
      hint: '[Convert]::ToBase64String around the file’s bytes from Get-Content.',
      explain:
        'ToBase64String never wraps lines, so the string drops straight into a JSON body. In Windows PowerShell 5.1, Get-Content -Encoding Byte -Raw gives the file as one byte array.',
    },
  },
  lessons: [
    // L1 Models that see
    [
      {
        kind: 'write',
        prompt: 'Pull a vision model, check it can see, then ask about a photo.',
        starter: '',
        solution: 'ollama pull gemma3\nollama show gemma3\nollama run gemma3 "What breed is this dog? ./dog.jpg"',
        checks: [
          {
            label: 'Pull a vision model (gemma3, qwen2.5vl, llama3.2-vision…)',
            re: `ollama pull ${VISION}`,
          },
          {
            label: 'Check its Capabilities with ollama show',
            re: 'ollama show \\S+',
          },
          {
            label: 'ollama run with an image path inside the prompt',
            re: 'ollama run \\S+ "[^"]*\\.(jpe?g|png|webp)\\b[^"]*"',
            flags: 'i',
          },
        ],
        hint: 'ollama show lists vision under Capabilities. The image path goes inside the quoted prompt.',
        explain: 'A one-shot ollama run spots file paths in the prompt and attaches each image, so the model sees the photo with your question.',
        output: "Added image './dog.jpg'\nA beagle: short tan-and-white coat and long floppy ears. (sample reply)",
      },
      {
        kind: 'write',
        prompt: 'Fix the command so the model can see, and compare both shelf photos.',
        starter: 'ollama run llama3.2 "Which shelf is emptier? ./monday.jpg"',
        solution: 'ollama pull qwen2.5vl\nollama run qwen2.5vl "Which shelf is emptier? ./monday.jpg ./friday.jpg"',
        checks: [
          { label: 'Pull a vision model first', re: `ollama pull ${VISION}` },
          {
            label: 'Run that vision model, not text-only llama3.2',
            re: `ollama run ${VISION}`,
          },
          {
            label: 'Both monday.jpg and friday.jpg in the prompt',
            re: '"[^"]*monday\\.jpg[^"]*friday\\.jpg[^"]*"|"[^"]*friday\\.jpg[^"]*monday\\.jpg[^"]*"',
          },
        ],
        hint: 'llama3.2 has no vision capability. Put every image path in the same quoted prompt.',
        explain: 'Only models with the vision capability read images. Each path in the prompt becomes one attached image, in order.',
        output: "Added image './monday.jpg'\nAdded image './friday.jpg'\nThe Friday shelf is emptier: the top row is bare. (sample reply)",
      },
    ],
    // L2 Images over REST
    [
      {
        kind: 'write',
        prompt: 'Caption a base64 photo with one /api/generate request.',
        starter: '',
        solution:
          '{\n  "model": "gemma3",\n  "prompt": "Write a one-line caption for this photo.",\n  "images": ["iVBORw0KGgoAAAANSUhEUg..."],\n  "stream": false\n}\n# save as request.json, then in PowerShell:\ncurl.exe http://localhost:11434/api/generate -d \'@request.json\'',
        checks: [
          {
            label: 'POST to /api/generate with curl.exe',
            re: 'curl\\.exe[^\\n]*/api/generate',
          },
          { label: "Send the body file with -d '@request.json'", re: fileArg },
          {
            label: 'A model and a prompt',
            re: '"model":\\s*"[^"]+"[\\s\\S]*"prompt":\\s*"[^"]+"|"prompt":\\s*"[^"]+"[\\s\\S]*"model":\\s*"[^"]+"',
          },
          {
            label: 'A top-level "images" array with a base64 string',
            re: '"images":\\s*\\[\\s*"[^"]+"',
          },
          { label: '"stream": false', re: '"stream":\\s*false' },
        ],
        hint: 'Write the body (request.json), then the curl.exe line. Put "images" next to "prompt": an array of base64 strings, not file paths.',
        explain: 'Over HTTP there is no file to attach, so you send the image bytes as base64 in the images array.',
        output: '{"model":"gemma3","response":"A red kayak resting on a misty lake at dawn.","done":true, ...}',
      },
      {
        kind: 'write',
        prompt: 'Attach two parking-lot photos to the user message and say which is which.',
        starter:
          '{\n  "model": "qwen2.5vl",\n  "stream": false,\n  "messages": [\n    {"role": "user", "content": "Did the parking lot fill up?"}\n  ]\n}\n# save as request.json, then in PowerShell:\ncurl.exe http://localhost:11434/api/chat -d \'@request.json\'',
        solution:
          '{\n  "model": "qwen2.5vl",\n  "stream": false,\n  "messages": [\n    {"role": "user",\n     "content": "Image 1 is 8am, image 2 is noon. Did the parking lot fill up?",\n     "images": ["/9j/4AAQSkZJRgAM...", "/9j/4AAQSkZJRgNOON..."]}\n  ]\n}\n# save as request.json, then in PowerShell:\ncurl.exe http://localhost:11434/api/chat -d \'@request.json\'',
        checks: [
          {
            label: 'Still POST to /api/chat',
            re: 'curl\\.exe[^\\n]*/api/chat',
          },
          {
            label: 'An "images" array with two strings on the user message',
            re: '\\{[^{}]*"role":\\s*"user"[^{}]*"images":\\s*\\[\\s*"[^"]+"\\s*,\\s*"[^"]+"\\s*\\][^{}]*\\}|\\{[^{}]*"images":\\s*\\[\\s*"[^"]+"\\s*,\\s*"[^"]+"\\s*\\][^{}]*"role":\\s*"user"[^{}]*\\}',
          },
          {
            label: 'The content names image 1 and image 2',
            re: '"content":\\s*"[^"]*((image|photo|picture)\\s*(1|one)\\b|first (image|photo|picture))[^"]*"',
            flags: 'i',
          },
        ],
        hint: 'In /api/chat, images belong to a message, next to role and content.',
        explain: 'Chat images ride on the message that shows them. Naming image 1 and image 2 tells the model which string is which.',
      },
    ],
    // L3 Images from C#
    [
      {
        kind: 'write',
        prompt: 'Read receipt.jpg, base64 it and ask gemma3 about it with PostAsJsonAsync.',
        starter: 'using System.Net.Http.Json;\nusing System.Text.Json;\n\nvar http = new HttpClient { BaseAddress = new Uri("http://localhost:11434") };\n',
        solution:
          'using System.Net.Http.Json;\nusing System.Text.Json;\n\nvar http = new HttpClient { BaseAddress = new Uri("http://localhost:11434") };\nstring img = Convert.ToBase64String(File.ReadAllBytes("receipt.jpg"));\nvar res = await http.PostAsJsonAsync("/api/generate",\n    new { model = "gemma3", prompt = "Which shop is this receipt from?", images = new[] { img }, stream = false });\nvar body = await res.Content.ReadFromJsonAsync<JsonElement>();\nConsole.WriteLine(body.GetProperty("response").GetString());',
        checks: [
          {
            label: 'Base64 the bytes with Convert.ToBase64String',
            re: 'Convert\\.ToBase64String\\(\\s*(await\\s+)?File\\.ReadAllBytes(Async)?\\(\\s*"receipt\\.jpg"',
          },
          {
            label: 'PostAsJsonAsync to /api/generate',
            re: 'PostAsJsonAsync\\(\\s*"/?api/generate"',
          },
          {
            label: 'An images array holding the string',
            re: 'images\\s*=\\s*(new\\s*(string)?\\s*\\[\\]\\s*\\{\\s*\\w+\\s*\\}|\\[\\s*\\w+\\s*\\])',
          },
          { label: 'stream = false', has: 'stream = false' },
          {
            label: 'Print the "response" field',
            re: 'GetProperty\\(\\s*"response"\\s*\\)',
          },
        ],
        hint: 'File.ReadAllBytes gives bytes; Convert.ToBase64String turns them into text. The JSON field is still images.',
        explain: 'The anonymous object serializes to the same JSON as the curl body, with your base64 string inside images.',
        output: 'Corner Bakery (sample reply)',
      },
      {
        kind: 'write',
        prompt: 'Base64 both photos with Select, then ask qwen2.5vl over /api/chat.',
        starter:
          'using System.Net.Http.Json;\n\nvar http = new HttpClient { BaseAddress = new Uri("http://localhost:11434") };\nstring[] files = ["scratch-before.jpg", "scratch-after.jpg"];\n// TODO: base64 every file, then ask if the scratch was repaired\n',
        solution:
          'using System.Net.Http.Json;\n\nvar http = new HttpClient { BaseAddress = new Uri("http://localhost:11434") };\nstring[] files = ["scratch-before.jpg", "scratch-after.jpg"];\nstring[] imgs = files.Select(f => Convert.ToBase64String(File.ReadAllBytes(f))).ToArray();\nvar res = await http.PostAsJsonAsync("/api/chat", new\n{\n    model = "qwen2.5vl",\n    stream = false,\n    messages = new[]\n    {\n        new { role = "user", content = "Image 1 is before, image 2 after. Was the scratch repaired?", images = imgs }\n    }\n});',
        checks: [
          {
            label: 'Select each file into Convert.ToBase64String',
            re: '\\.Select\\(\\s*\\w+\\s*=>\\s*Convert\\.ToBase64String\\(\\s*File\\.ReadAllBytes\\(',
          },
          {
            label: 'Turn the result into an array',
            re: '\\.ToArray\\(\\)|\\[\\s*\\.\\.',
          },
          {
            label: 'PostAsJsonAsync to /api/chat',
            re: 'PostAsJsonAsync\\(\\s*"/?api/chat"',
          },
          {
            label: 'images on the user message',
            re: 'role\\s*=\\s*"user"[^}]*images\\s*=|images\\s*=[^}]*role\\s*=\\s*"user"',
          },
          { label: 'stream = false', has: 'stream = false' },
        ],
        hint: 'files.Select(f => …).ToArray() gives a string[]. In a chat body, images sits inside the message object.',
        explain: 'One base64 string per photo, in order, on the message that asks about them. The model sees them as image 1 and image 2.',
      },
    ],
    // L4 DataContent
    [
      {
        kind: 'write',
        prompt: 'Ask the IChatClient what snacks are on a shelf photo, using DataContent.',
        starter: 'using Microsoft.Extensions.AI;\nusing OllamaSharp;\n\nIChatClient chat = new OllamaApiClient(new Uri("http://localhost:11434"), "gemma3");\n',
        solution:
          'using Microsoft.Extensions.AI;\nusing OllamaSharp;\n\nIChatClient chat = new OllamaApiClient(new Uri("http://localhost:11434"), "gemma3");\nbyte[] bytes = File.ReadAllBytes("pantry.jpg");\nvar msg = new ChatMessage(ChatRole.User, [\n    new TextContent("List the snacks on this shelf."),\n    new DataContent(bytes, "image/jpeg")]);\nChatResponse r = await chat.GetResponseAsync(msg);\nConsole.WriteLine(r.Text);',
        checks: [
          {
            label: 'Read the photo as bytes',
            re: 'File\\.ReadAllBytes(Async)?\\(',
          },
          {
            label: 'A TextContent with the question',
            re: 'new\\s+TextContent\\(\\s*"[^"]+"',
          },
          {
            label: 'A DataContent with an image media type',
            re: 'new\\s+DataContent\\(\\s*\\w+\\s*,\\s*"image/(jpeg|png|webp)"',
          },
          {
            label: 'Both in one ChatRole.User message',
            re: 'ChatMessage\\(\\s*ChatRole\\.User\\s*,\\s*\\[',
          },
          {
            label: 'Get the response and print r.Text',
            re: 'GetResponseAsync\\([\\s\\S]*Console\\.WriteLine\\(\\s*\\w+\\.Text\\s*\\)',
          },
        ],
        hint: 'A ChatMessage can hold a list of contents: [new TextContent(...), new DataContent(bytes, "image/jpeg")].',
        explain: 'DataContent carries the raw bytes and media type; OllamaSharp base64-encodes them into the message’s images for you.',
        output: 'Crisps, two chocolate bars and a bag of pretzels. (sample reply)',
      },
      {
        kind: 'write',
        prompt: 'Fix the image content, then ask a follow-up about the same sign.',
        starter:
          'using Microsoft.Extensions.AI;\nusing OllamaSharp;\n\nIChatClient chat = new OllamaApiClient(new Uri("http://localhost:11434"), "qwen2.5vl");\nList<ChatMessage> history = [];\nbyte[] bytes = File.ReadAllBytes("parking-sign.png");\nvar msg = new ChatMessage(ChatRole.User, [\n    new TextContent("Can I park here on Sunday?"),\n    new TextContent(bytes, "image/png")]);\n',
        solution:
          'using Microsoft.Extensions.AI;\nusing OllamaSharp;\n\nIChatClient chat = new OllamaApiClient(new Uri("http://localhost:11434"), "qwen2.5vl");\nList<ChatMessage> history = [];\nbyte[] bytes = File.ReadAllBytes("parking-sign.png");\nvar msg = new ChatMessage(ChatRole.User, [\n    new TextContent("Can I park here on Sunday?"),\n    new DataContent(bytes, "image/png")]);\nhistory.Add(msg);\nhistory.AddMessages(await chat.GetResponseAsync(history));\nhistory.Add(new ChatMessage(ChatRole.User, "Until what time?"));\nChatResponse r2 = await chat.GetResponseAsync(history);\nConsole.WriteLine(r2.Text);',
        checks: [
          {
            label: 'The image is a DataContent, not a TextContent',
            re: 'new\\s+DataContent\\(\\s*bytes\\s*,\\s*"image/png"\\s*\\)',
          },
          { label: 'Add msg to history', re: 'history\\.Add\\(\\s*msg\\s*\\)' },
          {
            label: 'Save the first reply with AddMessages',
            re: 'history\\.AddMessages\\(',
          },
          {
            label: 'Add a text-only follow-up question',
            re: 'history\\.Add\\(\\s*new\\s*(ChatMessage)?\\(\\s*ChatRole\\.User\\s*,\\s*"[^"]+"\\s*\\)\\s*\\)',
          },
          {
            label: 'Ask twice with the whole history',
            re: '(GetResponseAsync\\(\\s*history[\\s\\S]*){2}',
          },
        ],
        hint: 'TextContent only holds text. The follow-up needs no image: the photo is already in history.',
        explain: 'Every request sends the whole history, so the photo goes up again with the follow-up and the model can still see it.',
        output: 'Until 6pm; after that parking is free. (sample reply)',
      },
    ],
    // L5 Reading images
    [
      {
        kind: 'write',
        prompt: 'Pull the plate and fine off a parking-ticket photo as JSON.',
        starter: '',
        solution:
          '{\n  "model": "qwen2.5vl",\n  "prompt": "Read this parking ticket. Return the licence plate and the fine.",\n  "images": ["/9j/4AAQSkZJRgABAQ..."],\n  "format": {"type": "object",\n    "properties": {"plate": {"type": "string"}, "fine": {"type": "number"}},\n    "required": ["plate", "fine"]},\n  "options": {"temperature": 0},\n  "stream": false\n}\n# save as request.json, then in PowerShell:\ncurl.exe http://localhost:11434/api/generate -d \'@request.json\'',
        checks: [
          {
            label: "POST it to /api/generate with curl.exe -d '@request.json'",
            re: `curl\\.exe[^\\n]*/api/generate[^\\n]*${fileArg}`,
          },
          {
            label: 'Send the photo in "images"',
            re: '"images":\\s*\\[\\s*"[^"]+"',
          },
          {
            label: 'A "format" object schema',
            re: '"format":\\s*\\{\\s*"type":\\s*"object"',
          },
          {
            label: 'A number field for the fine',
            re: '"type":\\s*"(number|integer)"',
          },
          {
            label: 'List the "required" fields',
            re: '"required":\\s*\\[\\s*"\\w+"',
          },
          {
            label: 'temperature 0 in "options"',
            re: '"options":\\s*\\{[^}]*"temperature":\\s*0(\\.0)?\\s*[,}]',
          },
        ],
        hint: 'format takes a JSON schema: type object, properties, required. Temperature goes inside options.',
        explain: 'The schema forces the reply into those fields and temperature 0 stops the model getting creative with the digits.',
        output: '{"model":"qwen2.5vl","response":"{\\"plate\\": \\"KD19 XRT\\", \\"fine\\": 60}","done":true, ...}',
      },
      {
        kind: 'write',
        prompt: 'Make this label reader exact and typed: get a WineLabel at temperature 0.',
        starter:
          'using Microsoft.Extensions.AI;\nusing OllamaSharp;\n\nIChatClient chat = new OllamaApiClient(new Uri("http://localhost:11434"), "qwen2.5vl");\nbyte[] label = File.ReadAllBytes("wine-label.jpg");\nvar r = await chat.GetResponseAsync(new ChatMessage(ChatRole.User, [\n    new TextContent("What\'s this?"),\n    new DataContent(label, "image/jpeg")]));\nConsole.WriteLine(r.Text);\n\nrecord WineLabel(string Name, int Year);',
        solution:
          'using Microsoft.Extensions.AI;\nusing OllamaSharp;\n\nIChatClient chat = new OllamaApiClient(new Uri("http://localhost:11434"), "qwen2.5vl");\nbyte[] label = File.ReadAllBytes("wine-label.jpg");\nvar opts = new ChatOptions { Temperature = 0 };\nvar r = await chat.GetResponseAsync<WineLabel>(new ChatMessage(ChatRole.User, [\n    new TextContent("Read the wine label. Give the wine name exactly as written and the vintage year."),\n    new DataContent(label, "image/jpeg")]), opts);\nConsole.WriteLine($"{r.Result.Name} ({r.Result.Year})");\n\nrecord WineLabel(string Name, int Year);',
        checks: [
          {
            label: 'Replace the vague “What’s this?” prompt',
            not: '"What\'s this?"',
          },
          {
            label: 'Ask for the name and the year',
            re: 'TextContent\\(\\s*"(?=[^"]*\\bname\\b)(?=[^"]*\\byear\\b)[^"]*"',
            flags: 'i',
          },
          {
            label: 'Call GetResponseAsync<WineLabel>',
            re: 'GetResponseAsync<WineLabel>\\(',
          },
          {
            label: 'ChatOptions with Temperature = 0',
            re: 'Temperature\\s*=\\s*0(\\.0)?f?\\s*[,}]',
          },
          {
            label: 'Print fields from r.Result',
            re: '\\.Result\\.(Name|Year)',
          },
        ],
        hint: 'GetResponseAsync<T> sends T’s schema as format. Pass a ChatOptions with Temperature = 0 as the last argument.',
        explain: 'A specific prompt plus a schema and temperature 0 turns a chatty caption into two fields you can store.',
        output: 'Château Margaux (2015) (sample reply)',
      },
    ],
  ],
};

export default unit;
