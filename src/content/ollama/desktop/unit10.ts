import type { DesktopUnit } from '../../../engine/types';

// Desktop edition: write-the-code challenges for Ollama unit 10 (Tools & structured output).
// lessons[i] runs after lesson i + 1. See docs/CONTENT_GUIDE.md.

/** A JSON `"key": value` pair with any spacing (value is a regex source). */
const kv = (key: string, value: string) => `"${key}"\\s*:\\s*${value}`;
/** A flat JSON object (no nested braces) holding every given pair, in any order. */
const obj = (...pairs: string[]) => `\\{${pairs.map((p) => `(?=[^{}]*${p})`).join('')}[^{}]*\\}`;
/** A schema property: `"name": {"type": "<type>"`. */
const prop = (name: string, type: string) => `"${name}"\\s*:\\s*\\{\\s*${kv('type', `"${type}"`)}`;

/** A quoted -d '@file.json' argument (PowerShell needs the quotes around @). */
const fileArg = `(-d|--data(-binary)?)\\s+(['"])@[\\w.\\\\/:-]+\\.json\\3`;

const CHAT_SETUP = `using Microsoft.Extensions.AI;
using OllamaSharp;

IChatClient chat = new OllamaApiClient(new Uri("http://localhost:11434"), "llama3.2");
`;

const unit: DesktopUnit = {
  lessons: [
    // L1 JSON output
    [
      {
        kind: 'write',
        prompt: 'Ask /api/chat to invent a pizza, replying in any valid JSON.',
        starter: '',
        solution:
          '{\n  "model": "llama3.2",\n  "messages": [{"role": "user", "content": "Invent a pizza. Reply in JSON."}],\n  "format": "json",\n  "options": {"temperature": 0},\n  "stream": false\n}\n# save as request.json, then in PowerShell:\ncurl.exe http://localhost:11434/api/chat -d \'@request.json\'',
        checks: [
          { label: 'POST to /api/chat with curl.exe', re: 'curl\\.exe[^\\n]*localhost:11434/api/chat' },
          { label: "Send the body file with -d '@request.json'", re: fileArg },
          { label: '"format": "json"', re: kv('format', '"json"') },
          { label: 'temperature 0 in "options"', re: `"options"\\s*:\\s*\\{[^}]*${kv('temperature', '0(\\.0+)?\\s*[,}]')}` },
          { label: 'A user message that asks for JSON', re: obj(kv('role', '"user"'), kv('content', '"[^"]*JSON')) },
          { label: '"stream": false', re: kv('stream', 'false') },
        ],
        hint: 'Write request.json, then the curl.exe line. format sits at the top level of the body.',
        explain: 'The reply’s message.content is now a JSON string, which you still parse yourself.',
        output: '{…,"message":{"role":"assistant","content":"{\\"name\\": \\"Fig & Honey\\"}"},"done":true,…}',
      },
      {
        kind: 'write',
        prompt: 'In request.json, pin the reply to a schema: a dish name and whole-number servings.',
        starter:
          '{\n  "model": "llama3.2",\n  "messages": [{"role": "user", "content": "Suggest a dinner for a family."}],\n  "stream": false\n}\n',
        solution:
          '{\n  "model": "llama3.2",\n  "messages": [{"role": "user", "content": "Suggest a dinner for a family."}],\n  "format": {\n    "type": "object",\n    "properties": {\n      "dish": {"type": "string"},\n      "servings": {"type": "integer"}\n    },\n    "required": ["dish", "servings"]\n  },\n  "stream": false\n}',
        checks: [
          { label: '"format" is an object schema', re: `"format"\\s*:\\s*\\{\\s*${kv('type', '"object"')}` },
          { label: '"dish" is a string', re: prop('dish', 'string') },
          { label: '"servings" is an integer', re: prop('servings', 'integer') },
          { label: 'Both are "required"', re: kv('required', '\\[\\s*("dish"\\s*,\\s*"servings"|"servings"\\s*,\\s*"dish")\\s*\\]') },
        ],
        hint: 'A JSON schema: type object, properties with a type each, and a required list.',
        explain: 'With a schema the reply must have exactly those keys and types, so servings can’t come back as “four”.',
      },
    ],
    // L2 Typed output in C#
    [
      {
        kind: 'write',
        prompt: 'Get a typed hike suggestion (trail name and km) and print it.',
        starter: CHAT_SETUP,
        solution: `${CHAT_SETUP}ChatResponse<Hike> r = await chat.GetResponseAsync<Hike>("Suggest a day hike in the Alps.");
Console.WriteLine($"{r.Result.Trail}: {r.Result.Km} km");

record Hike(string Trail, double Km);`,
        checks: [
          { label: 'A record with a string and a number', re: 'record (\\w+)\\(\\s*string \\w+\\s*,\\s*(double|float|decimal|int) \\w+\\s*\\)' },
          { label: 'GetResponseAsync<YourRecord>', re: 'GetResponseAsync<(\\w+)>\\(\\s*"[^"]+"\\s*\\)[\\s\\S]*record \\1\\(' },
          { label: 'Read the fields from r.Result', re: '\\w+\\.Result\\.\\w+' },
          { label: 'Print them', re: 'Console\\.WriteLine\\([^;]*\\.Result\\.' },
        ],
        hint: 'Put the record type in the angle brackets. The parsed object is on .Result.',
        explain: 'The client turns Hike into a JSON schema, sends it as format and parses the reply into a Hike.',
        output: 'Lac Blanc trail: 9.5 km',
      },
      {
        kind: 'write',
        prompt: 'Swap the manual parsing for typed output with GetResponseAsync<Workout>.',
        starter: `using System.Text.Json;
${CHAT_SETUP}ChatResponse r = await chat.GetResponseAsync("Plan a 3-move workout. Reply in JSON.");
var w = JsonSerializer.Deserialize<Workout>(r.Text);
foreach (var m in w!.Moves) Console.WriteLine($"{m.Name} x{m.Reps}");

record Workout(string Name, Move[] Moves);
record Move(string Name, int Reps);
`,
        solution: `${CHAT_SETUP}ChatResponse<Workout> r = await chat.GetResponseAsync<Workout>("Plan a 3-move workout.");
foreach (var m in r.Result.Moves) Console.WriteLine($"{m.Name} x{m.Reps}");

record Workout(string Name, Move[] Moves);
record Move(string Name, int Reps);`,
        checks: [
          { label: 'Call GetResponseAsync<Workout>', re: 'GetResponseAsync<Workout>\\(' },
          { label: 'Loop over r.Result.Moves', re: 'foreach\\s*\\([^)]*\\bin\\s+\\w+\\.Result\\.Moves\\s*\\)' },
          { label: 'No JsonSerializer.Deserialize', not: 'JsonSerializer.Deserialize' },
          { label: 'Keep both records', re: '(?=[\\s\\S]*record Workout\\()(?=[\\s\\S]*record Move\\()' },
        ],
        hint: 'The typed call sends the schema and parses the reply, nested records included.',
        explain: 'With the schema sent as format, the keys always match, so Moves is never null.',
        output: 'Squats x15\nPush-ups x10\nLunges x12',
      },
    ],
    // L3 Defining tools
    [
      {
        kind: 'write',
        prompt: 'Offer qwen3 a get_time tool that takes a city.',
        starter: '{\n  "model": "qwen3",\n  "messages": [{"role": "user", "content": "What time is it in Lima?"}],\n',
        solution:
          '{\n  "model": "qwen3",\n  "messages": [{"role": "user", "content": "What time is it in Lima?"}],\n  "tools": [{"type": "function", "function": {\n    "name": "get_time",\n    "description": "Get the current local time in a city",\n    "parameters": {"type": "object", "properties": {"city": {"type": "string"}}, "required": ["city"]}\n  }}],\n  "stream": false\n}\n# save as request.json, then in PowerShell:\ncurl.exe http://localhost:11434/api/chat -d \'@request.json\'',
        checks: [
          { label: 'A "tools" array', re: kv('tools', '\\[') },
          { label: 'An entry with "type": "function"', re: `"tools"\\s*:\\s*\\[\\s*\\{\\s*${kv('type', '"function"')}` },
          { label: 'Named get_time, with a description', re: `(?=[\\s\\S]*${kv('name', '"get_time"')})(?=[\\s\\S]*${kv('description', '"[^"]+"')})` },
          { label: 'parameters: an object with a string city', re: `"parameters"\\s*:\\s*\\{\\s*${kv('type', '"object"')}\\s*,\\s*"properties"\\s*:\\s*\\{\\s*${prop('city', 'string')}` },
          { label: 'city is required', re: kv('required', '\\[\\s*"city"\\s*\\]') },
          { label: "Send it with curl.exe to /api/chat, -d '@request.json'", re: `curl\\.exe[^\\n]*localhost:11434/api/chat[^\\n]*${fileArg}` },
        ],
        hint: 'Finish request.json, then send it. Each tool is {"type": "function", "function": {name, description, parameters}}.',
        explain: 'The model reads the name, description and schema to decide when to call get_time and with what.',
      },
      {
        kind: 'write',
        prompt: 'Add a second tool, convert_currency, taking a number amount and a string to.',
        starter:
          '"tools": [\n  {"type": "function", "function": {\n    "name": "get_rate",\n    "description": "Get the exchange rate between two currencies",\n    "parameters": {"type": "object", "properties": {"from": {"type": "string"}, "to": {"type": "string"}}, "required": ["from", "to"]}\n  }}\n]\n',
        solution:
          '"tools": [\n  {"type": "function", "function": {\n    "name": "get_rate",\n    "description": "Get the exchange rate between two currencies",\n    "parameters": {"type": "object", "properties": {"from": {"type": "string"}, "to": {"type": "string"}}, "required": ["from", "to"]}\n  }},\n  {"type": "function", "function": {\n    "name": "convert_currency",\n    "description": "Convert an amount of euros to another currency",\n    "parameters": {"type": "object", "properties": {"amount": {"type": "number"}, "to": {"type": "string"}}, "required": ["amount", "to"]}\n  }}\n]',
        checks: [
          { label: 'Keep get_rate', re: kv('name', '"get_rate"') },
          { label: 'A second function entry after a comma', re: `\\}\\s*\\}\\s*,\\s*\\{\\s*${kv('type', '"function"')}` },
          { label: 'Named convert_currency, with a description', re: `${kv('name', '"convert_currency"')}\\s*,\\s*${kv('description', '"[^"]+"')}` },
          { label: 'amount is a number', re: prop('amount', '(number|integer)') },
          { label: 'Both amount and to are required', re: kv('required', '\\[\\s*("amount"\\s*,\\s*"to"|"to"\\s*,\\s*"amount")\\s*\\]') },
        ],
        hint: 'Copy the shape of the first entry, then change the name, description and properties.',
        explain: 'The model can now choose between two tools, or call both, depending on the question.',
      },
    ],
    // L4 Tool calls & results
    [
      {
        kind: 'write',
        prompt: 'Send back the tool result: the assistant’s call, then a tool message.',
        starter:
          '# the model asked for book_table with {"people": 4, "time": "19:00"}\n# your function returned "Booked for 19:00"\n"messages": [\n  {"role": "user", "content": "Book a table for 4 at 7pm."}\n]\n',
        solution:
          '# the model asked for book_table with {"people": 4, "time": "19:00"}\n# your function returned "Booked for 19:00"\n"messages": [\n  {"role": "user", "content": "Book a table for 4 at 7pm."},\n  {"role": "assistant", "content": "", "tool_calls": [{"function": {"name": "book_table", "arguments": {"people": 4, "time": "19:00"}}}]},\n  {"role": "tool", "tool_name": "book_table", "content": "Booked for 19:00"}\n]',
        checks: [
          { label: 'An assistant message with tool_calls', re: `\\{\\s*${kv('role', '"assistant"')}[^\\n]*"tool_calls"\\s*:\\s*\\[` },
          { label: 'The call: book_table with its arguments object', re: `"function"\\s*:\\s*\\{\\s*${kv('name', '"book_table"')}\\s*,\\s*"arguments"\\s*:\\s*\\{[^}]*"people"\\s*:\\s*4` },
          { label: 'A "tool" message with tool_name book_table', re: obj(kv('role', '"tool"'), kv('tool_name', '"book_table"'), kv('content', '"Booked for 19:00"')) },
          { label: 'The tool result after the call', re: '"tool_calls"[\\s\\S]*"role"\\s*:\\s*"tool"' },
        ],
        hint: 'Add the model’s turn as it came back, then your result with role tool.',
        explain: 'tool_name tells the model which call this result answers; then you call /api/chat again.',
      },
      {
        kind: 'write',
        prompt: 'The model called get_weather twice. Add both calls and both results.',
        starter:
          '# the model called get_weather for Oslo, then for Bergen\n# your function returned 12°C for Oslo and 9°C for Bergen\n"messages": [\n  {"role": "user", "content": "Is Oslo or Bergen warmer?"}\n]\n',
        solution:
          '# the model called get_weather for Oslo, then for Bergen\n# your function returned 12°C for Oslo and 9°C for Bergen\n"messages": [\n  {"role": "user", "content": "Is Oslo or Bergen warmer?"},\n  {"role": "assistant", "content": "", "tool_calls": [\n    {"function": {"name": "get_weather", "arguments": {"city": "Oslo"}}},\n    {"function": {"name": "get_weather", "arguments": {"city": "Bergen"}}}\n  ]},\n  {"role": "tool", "tool_name": "get_weather", "content": "12°C"},\n  {"role": "tool", "tool_name": "get_weather", "content": "9°C"}\n]',
        checks: [
          { label: 'One assistant message with tool_calls', re: `\\{\\s*${kv('role', '"assistant"')}[^\\n]*"tool_calls"\\s*:\\s*\\[` },
          { label: 'Calls for Oslo and then Bergen', re: '"arguments"\\s*:\\s*\\{\\s*"city"\\s*:\\s*"Oslo"[\\s\\S]*"arguments"\\s*:\\s*\\{\\s*"city"\\s*:\\s*"Bergen"' },
          { label: 'A tool message with 12°C', re: obj(kv('role', '"tool"'), kv('tool_name', '"get_weather"'), kv('content', '"12°C"')) },
          { label: 'A tool message with 9°C', re: obj(kv('role', '"tool"'), kv('tool_name', '"get_weather"'), kv('content', '"9°C"')) },
          { label: 'Results in the same order as the calls', re: '"content"\\s*:\\s*"12°C"[\\s\\S]*"content"\\s*:\\s*"9°C"' },
        ],
        hint: 'Both calls live in one tool_calls list. Each result gets its own tool message.',
        explain: 'With both results in order, the next /api/chat call can compare them and answer “Oslo”.',
      },
    ],
    // L5 Tools in C#
    [
      {
        kind: 'write',
        prompt: 'Give the model a C# tool for museum opening hours and let it call it.',
        starter: `using System.ComponentModel;
using Microsoft.Extensions.AI;
using OllamaSharp;

IChatClient chat = new OllamaApiClient(new Uri("http://localhost:11434"), "qwen3");
`,
        solution: `using System.ComponentModel;
using Microsoft.Extensions.AI;
using OllamaSharp;

IChatClient chat = new OllamaApiClient(new Uri("http://localhost:11434"), "qwen3");
AIFunction tool = AIFunctionFactory.Create(GetOpeningHours, "get_opening_hours");
IChatClient client = chat.AsBuilder().UseFunctionInvocation().Build();
ChatResponse r = await client.GetResponseAsync("When does the Louvre open today?",
    new ChatOptions { Tools = [tool] });
Console.WriteLine(r.Text);

[Description("Gets the opening hours of a museum today")]
static string GetOpeningHours(string museum) => $"{museum}: 9:00 to 18:00";`,
        checks: [
          { label: 'A [Description] on your method', re: '\\[Description\\(\\s*"[^"]+"\\s*\\)\\]\\s*(static\\s+)?\\w+\\s+\\w+\\(' },
          { label: 'AIFunctionFactory.Create(Method, "snake_name")', re: 'AIFunctionFactory\\.Create\\(\\s*\\w+\\s*,\\s*"[a-z_]+"\\s*\\)' },
          { label: 'Wrap the client with UseFunctionInvocation().Build()', re: '\\.AsBuilder\\(\\)\\s*\\.UseFunctionInvocation\\(\\)\\s*\\.Build\\(\\)' },
          { label: 'Offer it with ChatOptions { Tools = [...] }', re: 'new ChatOptions\\s*\\{[^}]*Tools\\s*=' },
          { label: 'Ask through the wrapped client', re: 'await client\\.GetResponseAsync\\(' },
        ],
        hint: 'Describe the method, make it a tool, wrap the client, then pass the tool in the options.',
        explain: 'The wrapped client runs get_opening_hours when the model asks, then asks the model again for the answer.',
        output: 'The Louvre is open from 9:00 to 18:00 today.',
      },
      {
        kind: 'write',
        prompt: 'Fix the tool setup so the model can call get_bus_times.',
        starter: `using System.ComponentModel;
using Microsoft.Extensions.AI;
using OllamaSharp;

IChatClient chat = new OllamaApiClient(new Uri("http://localhost:11434"), "qwen3");
AIFunction tool = AIFunctionFactory.Create(GetBusTimes);
IChatClient client = chat.AsBuilder().UseFunctionInvocation().Create();
ChatResponse r = await client.GetResponseAsync("Next bus from Mill Road?");
Console.WriteLine(r.Text);

static string GetBusTimes(string stop) => $"{stop}: 14:05, 14:20";
`,
        solution: `using System.ComponentModel;
using Microsoft.Extensions.AI;
using OllamaSharp;

IChatClient chat = new OllamaApiClient(new Uri("http://localhost:11434"), "qwen3");
AIFunction tool = AIFunctionFactory.Create(GetBusTimes, "get_bus_times");
IChatClient client = chat.AsBuilder().UseFunctionInvocation().Build();
ChatResponse r = await client.GetResponseAsync("Next bus from Mill Road?",
    new ChatOptions { Tools = [tool] });
Console.WriteLine(r.Text);

[Description("Gets the next departures from a bus stop")]
static string GetBusTimes(string stop) => $"{stop}: 14:05, 14:20";`,
        checks: [
          { label: 'Name the tool "get_bus_times"', re: 'AIFunctionFactory\\.Create\\(\\s*GetBusTimes\\s*,\\s*"get_bus_times"\\s*\\)' },
          { label: 'Finish the builder with .Build()', re: '\\.UseFunctionInvocation\\(\\)\\s*\\.Build\\(\\)' },
          { label: 'No .Create() on the builder', not: '.UseFunctionInvocation().Create()' },
          { label: 'Pass the tool in ChatOptions.Tools', re: 'GetResponseAsync\\([^;]*new ChatOptions\\s*\\{[^}]*Tools\\s*=|GetResponseAsync\\(\\s*"[^"]*"\\s*,\\s*\\w+\\s*\\)' },
          { label: 'Describe GetBusTimes with [Description]', re: '\\[Description\\(\\s*"[^"]+"\\s*\\)\\]\\s*static string GetBusTimes' },
        ],
        hint: 'A builder ends with Build. The tool does nothing until it’s in the options, and the model needs to know what it does.',
        explain: 'Now the model sees get_bus_times with a description, and the wrapped client runs it when called.',
        output: 'The next bus from Mill Road leaves at 14:05.',
      },
    ],
  ],
  // Laptop versions: Windows PowerShell 5.1 needs curl.exe and the JSON body in a file.
  concepts: {
    1: {
      body: 'Add "format" to a /api/chat body and the reply has to be JSON. "format": "json" allows any valid JSON object, while a JSON schema object pins the exact keys and types. Set temperature to 0 for steady output, and remember message.content is still a string you parse. On Windows, type curl.exe (in Windows PowerShell, plain curl is Invoke-WebRequest) and keep the body in request.json, sent with -d \'@request.json\'.',
      code: '# request.json\n{\n  "model": "llama3.2", "stream": false,\n  "messages": [{"role": "user", "content": "Invent a pizza. Reply in JSON."}],\n  "format": {"type": "object", "properties": {"name": {"type": "string"}}, "required": ["name"]},\n  "options": {"temperature": 0}\n}\nPS> curl.exe http://localhost:11434/api/chat -d \'@request.json\'',
    },
  },
  overrides: {
    'L1.1': {
      kind: 'fill',
      prompt: 'Turn on JSON mode in request.json.',
      code: '{\n  "model": "llama3.2",\n  "messages": [{"role": "user", "content": "List three primary colors. Reply in JSON."}],\n  "stream": false,\n  "___": "json"\n}',
      blanks: [{ answer: ['format'], options: ['format', 'response_format', 'output'] }],
      hint: 'The same key also takes a schema object.',
      explain: '"format": "json" makes the model write only valid JSON. response_format is the name used by the OpenAI-compatible endpoint, not by /api/chat.',
      output:
        '{"model":"llama3.2","created_at":"2026-10-12T11:02:14.318402Z","message":{"role":"assistant","content":"{\\"colors\\": [\\"red\\", \\"yellow\\", \\"blue\\"]}"},"done":true,"done_reason":"stop","total_duration":812403125,"load_duration":61208459,"prompt_eval_count":37,"prompt_eval_duration":120884000,"eval_count":15,"eval_duration":598201000}',
    },
    'L3.1': {
      kind: 'fill',
      prompt: 'Pick a model in request.json that accepts tools.',
      code: '{\n  "model": "___",\n  "messages": [{"role": "user", "content": "Is it raining in Bergen?"}],\n  "stream": false,\n  "tools": [{"type": "function", "function": {"name": "get_weather", ...}}]\n}',
      blanks: [{ answer: ['qwen3'], options: ['qwen3', 'llava', 'nomic-embed-text'] }],
      hint: 'Which one lists tools under Capabilities in ollama show?',
      explain: 'qwen3 lists completion, tools and thinking. llava is a vision model and nomic-embed-text only makes embeddings, so Ollama answers 400 for them.',
    },
  },
};

export default unit;
