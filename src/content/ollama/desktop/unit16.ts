import type { DesktopUnit } from '../../../engine/types';

// Desktop edition: write-the-code challenges for Ollama unit 16 (Evaluating model output).
// lessons[i] runs after lesson i + 1. See docs/CONTENT_GUIDE.md.
const CASE_LINE = '\\{\\s*"prompt":\\s*"[^"]+"\\s*,\\s*"expected":\\s*"[^"]+"\\s*\\}';
const NS = '(1e9|1_000_000_000|1000000000)(\\.0)?d?'; // nanoseconds per second
const HEADER = 'using Microsoft.Extensions.AI;\nusing OllamaSharp;\n\nIChatClient chat = new OllamaApiClient(new Uri("http://localhost:11434"), "llama3.2");\n';

const unit: DesktopUnit = {
  // Windows PowerShell versions of shared items (the phone keeps the originals):
  // curl.exe, ConvertFrom-Json instead of jq, no : in Windows file names.
  concepts: {
    4: {
      body: 'To compare two models or two prompts, run both over the same cases with the same settings and compare pass counts. Speed is in each final reply: eval_count / eval_duration × 10^9 is tokens per second, and total_duration is the whole wait in nanoseconds, model load included. On Windows, type curl.exe (in Windows PowerShell, plain curl is Invoke-WebRequest) and read the JSON with ConvertFrom-Json.',
      code: `# the request is in case.json, with "stream": false\nPS> $r = curl.exe -s localhost:11434/api/generate -d '@case.json' | ConvertFrom-Json\nPS> $r.eval_count / $r.eval_duration * 1e9\n48.3`,
    },
  },
  overrides: {
    'L4.1': {
      kind: 'build',
      prompt: '$r holds the parsed reply. Build the tokens-per-second sum.',
      answer: ['$r.eval_count', '/', '$r.eval_duration', '*', '1e9'],
      distractors: ['$r.total_duration', '1e6'],
      hint: 'Tokens out, over the time spent writing them.',
      explain: 'eval_duration is in nanoseconds, so × 1e9 turns tokens per nanosecond into tokens per second.',
      alt: [['$r.eval_count', '*', '1e9', '/', '$r.eval_duration']],
    },
    'L4.3': {
      kind: 'order',
      prompt: 'load.json holds just {"model": "qwen3:4b"}. Load first, then time one case.',
      lines: [
        "curl.exe -s localhost:11434/api/generate -d '@load.json'",
        "$r = curl.exe -s localhost:11434/api/generate -d '@case.json' | ConvertFrom-Json",
        '$r.eval_count / $r.eval_duration * 1e9',
      ],
      hint: 'A body with only a model just loads it.',
      explain: 'Loading first keeps load_duration out of the timed run, so you compare the models, not the disk.',
      output: '41.7',
    },
    'L4.7': {
      kind: 'order',
      prompt: 'Order a fair model comparison.',
      lines: [
        'foreach ($m in "llama3.2:3b", "qwen3:4b") {',
        `  .\\eval.ps1 $m > "results-$($m.Replace(':', '_')).txt"`,
        '}',
        'Compare-Object (Get-Content results-llama3.2_3b.txt) (Get-Content results-qwen3_4b.txt)',
      ],
      hint: 'Loop the models, run the same eval, then compare.',
      explain:
        'One script for both models means the same cases and settings, so the scores are comparable. Windows file names can’t contain :, so the tag’s colon becomes _.',
    },
    'boss.6': {
      kind: 'fix',
      prompt: 'Speeds look 1000× too small. Fix the conversion.',
      code: '$r.eval_count / $r.eval_duration * [[1e6]]',
      fix: '1e9',
      options: ['1e9', '1e3', '60'],
      hint: 'Durations are nanoseconds.',
      explain: 'A second has 10^9 nanoseconds, so multiply by 1e9 to get tokens per second.',
    },
  },
  lessons: [
    // L1 Test sets & settings
    [
      {
        kind: 'write',
        prompt: 'Write tests.jsonl: four unit-conversion cases with short expected answers.',
        starter: '',
        solution:
          '{"prompt": "How many grams in a kilogram? Reply with the number only.", "expected": "1000"}\n{"prompt": "How many centimetres in a metre? Reply with the number only.", "expected": "100"}\n{"prompt": "How many minutes in two hours? Reply with the number only.", "expected": "120"}\n{"prompt": "How many millilitres in a litre? Reply with the number only.", "expected": "1000"}',
        checks: [
          { label: 'At least four cases', re: `(${CASE_LINE}[\\s\\S]*?){4}` },
          { label: 'One JSON object per line', re: `^(\\s*${CASE_LINE}[ \\t]*\\n){3,}\\s*${CASE_LINE}\\s*$` },
          { label: 'No empty expected answers', not: '"expected": ""' },
        ],
        hint: 'JSONL is one complete JSON object per line, no commas between lines and no outer array.',
        explain: 'Asking for “the number only” makes the expected answer easy to check, and the same file runs the same way every time.',
      },
      {
        kind: 'write',
        prompt: 'Make this eval repeatable: temperature 0 and a fixed seed.',
        starter:
          'foreach ($line in Get-Content tests.jsonl) {\n  $p = ($line | ConvertFrom-Json).prompt\n  @{ model = "llama3.2"; prompt = $p; stream = $false; options = @{ temperature = 0.8 } } |\n    ConvertTo-Json | Set-Content request.json\n  (curl.exe -s http://localhost:11434/api/generate -d \'@request.json\' | ConvertFrom-Json).response\n}',
        solution:
          'foreach ($line in Get-Content tests.jsonl) {\n  $p = ($line | ConvertFrom-Json).prompt\n  @{ model = "llama3.2"; prompt = $p; stream = $false; options = @{ temperature = 0; seed = 42 } } |\n    ConvertTo-Json | Set-Content request.json\n  (curl.exe -s http://localhost:11434/api/generate -d \'@request.json\' | ConvertFrom-Json).response\n}',
        checks: [
          { label: 'temperature 0', re: 'temperature"?\\s*[:=]\\s*0\\s*[,;}]' },
          { label: 'A fixed seed', re: 'seed"?\\s*[:=]\\s*\\d+' },
          { label: 'Both inside options', re: 'options"?\\s*[:=]\\s*@?\\{(?=[^}]*temperature)(?=[^}]*seed)[^}]*\\}' },
          { label: 'Still POST to /api/generate and print .response', re: '/api/generate[\\s\\S]*\\.response' },
        ],
        hint: 'Sampling settings live in options. Temperature 0 picks the likeliest token; the seed fixes any randomness left.',
        explain: 'With the dice fixed, a score that moves means your change moved it.',
        output: '1000\n100\n120\n1000',
      },
    ],
    // L2 Checking answers
    [
      {
        kind: 'write',
        prompt: 'Check the reply both ways: exact match and case-insensitive contains.',
        starter: 'string reply = "The answer is 12 eggs.";\nstring expected = "12";\n',
        solution:
          'string reply = "The answer is 12 eggs.";\nstring expected = "12";\nbool exact = reply.Trim() == expected;\nbool contains = reply.Contains(expected, StringComparison.OrdinalIgnoreCase);\nConsole.WriteLine($"exact: {exact}, contains: {contains}");',
        checks: [
          { label: 'Exact: the trimmed reply == expected', re: 'reply\\.Trim\\(\\)\\s*==\\s*expected|expected\\s*==\\s*reply\\.Trim\\(\\)' },
          {
            label: 'Contains with StringComparison.OrdinalIgnoreCase',
            re: 'reply\\.Contains\\(\\s*expected\\s*,\\s*StringComparison\\.OrdinalIgnoreCase\\s*\\)',
          },
          { label: 'Print both results', re: 'Console\\.WriteLine\\([^;]*\\{\\w+\\}[^;]*\\{\\w+\\}' },
        ],
        hint: 'Trim() strips spaces before comparing. Contains takes a StringComparison as a second argument.',
        explain: 'Exact is strict and fails on chatty replies; contains is lenient. Pick per case, and know which you used.',
        output: 'exact: False, contains: True',
      },
      {
        kind: 'write',
        prompt: 'Check the JSON reply properly: parse it and compare the "to" field.',
        starter:
          'using System.Text.Json;\n\nstring reply = """{"from": "Oslo", "to": "Bergen"}""";\nbool ok = reply.Contains("Bergen");\nConsole.WriteLine(ok ? "PASS" : "FAIL");',
        solution:
          'using System.Text.Json;\n\nstring reply = """{"from": "Oslo", "to": "Bergen"}""";\nbool ok;\ntry\n{\n    using var doc = JsonDocument.Parse(reply);\n    ok = doc.RootElement.TryGetProperty("to", out var to) && to.GetString() == "Bergen";\n}\ncatch (JsonException)\n{\n    ok = false;\n}\nConsole.WriteLine(ok ? "PASS" : "FAIL");',
        checks: [
          { label: 'Parse with JsonDocument.Parse', re: 'JsonDocument\\.Parse\\(\\s*reply\\s*\\)' },
          { label: 'Read the "to" property', re: '(Get|TryGet)Property\\(\\s*"to"' },
          { label: 'Compare it to "Bergen"', re: '==\\s*"Bergen"|"Bergen"\\s*==|Equals\\(\\s*"Bergen"' },
          { label: 'Bad JSON counts as a fail: catch JsonException', re: 'catch\\s*\\(\\s*JsonException' },
          { label: 'No plain Contains check', not: 'reply.Contains(' },
        ],
        hint: 'Wrap the parse in try/catch: a reply that isn’t JSON should FAIL, not crash the eval.',
        explain: 'Contains would pass {"from": "Bergen"} too. Parsing checks the shape and the right field.',
        output: 'PASS',
      },
    ],
    // L3 LLM as judge
    [
      {
        kind: 'write',
        prompt: 'Write a judge request: grade a reply 1–5 against a reference, as JSON.',
        starter: '',
        solution:
          '{\n  "model": "qwen3:8b",\n  "stream": false,\n  "options": {"temperature": 0},\n  "prompt": "Question: What does HTTP 404 mean?\\nReference: The server cannot find the requested page.\\nReply: The server crashed.\\nScore the reply from 1 to 5 against the reference.",\n  "format": {"type": "object",\n    "properties": {"score": {"type": "integer"}, "reason": {"type": "string"}},\n    "required": ["score", "reason"]}\n}',
        checks: [
          { label: 'Give the question, a reference and the reply', re: '(?=[\\s\\S]*Question)(?=[\\s\\S]*Reference)(?=[\\s\\S]*Reply)', flags: 'i' },
          { label: 'Ask for a score from 1 to 5', re: '1\\s*(to|-|–)\\s*5' },
          { label: 'A "score" property of type integer', re: '"score":\\s*\\{\\s*"type":\\s*"integer"' },
          { label: 'A "reason" string', re: '"reason":\\s*\\{\\s*"type":\\s*"string"' },
          { label: 'Make "score" required', re: '"required":\\s*\\[[^\\]]*"score"' },
          { label: 'temperature 0', re: '"temperature":\\s*0\\s*[,}]' },
        ],
        hint: 'Put the three texts in the prompt, then a format schema with score and reason.',
        explain: 'Free-text answers can’t be string-matched, but a schema-bound score from a steady judge can be counted.',
        output: '{"response": "{\\"score\\": 1, \\"reason\\": \\"A 404 means not found, not a crash.\\"}", ...} (sample)',
      },
      {
        kind: 'write',
        prompt: 'Finish the judge: a different, steady model, a typed Grade, PASS at 4+.',
        starter: `${HEADER.replace('IChatClient chat', '// model under test: llama3.2:1b\nIChatClient judge').replace('"llama3.2"', '"llama3.2:1b"')}var opts = new ChatOptions { Temperature = 0.9f, Seed = 42 };\nstring question = "What does HTTP 404 mean?";\nstring reference = "The server cannot find the requested page.";\nstring reply = "It means the server crashed.";\n// TODO: ask the judge for a Grade, print PASS if the score is 4 or more\n\nrecord Grade(int Score, string Reason);`,
        solution: `${HEADER.replace('IChatClient chat', '// model under test: llama3.2:1b\nIChatClient judge').replace('"llama3.2"', '"qwen3:8b"')}var opts = new ChatOptions { Temperature = 0, Seed = 42 };\nstring question = "What does HTTP 404 mean?";\nstring reference = "The server cannot find the requested page.";\nstring reply = "It means the server crashed.";\nstring prompt = $"Question: {question}\\nReference: {reference}\\nReply: {reply}\\nScore the reply from 1 to 5 against the reference.";\nChatResponse<Grade> g = await judge.GetResponseAsync<Grade>(prompt, opts);\nConsole.WriteLine($"{g.Result.Score}: {g.Result.Reason}");\nConsole.WriteLine(g.Result.Score >= 4 ? "PASS" : "FAIL");\n\nrecord Grade(int Score, string Reason);`,
        checks: [
          { label: 'The judge is not the model under test', not: '"llama3.2:1b"' },
          { label: 'Temperature = 0', re: 'Temperature\\s*=\\s*0(\\.0)?f?\\s*[,}]' },
          { label: 'Put the reference and the reply in the prompt', re: '\\{reference\\}[\\s\\S]*\\{reply\\}|\\{reply\\}[\\s\\S]*\\{reference\\}' },
          { label: 'Call GetResponseAsync<Grade>', re: 'GetResponseAsync<Grade>\\(' },
          { label: 'PASS when Score >= 4', re: '\\.Score\\s*(>=\\s*4|>\\s*3)' },
        ],
        hint: 'A judge should be at least as strong as the model it grades. GetResponseAsync<Grade> sends Grade’s schema.',
        explain: 'A steady, separate judge gives scores you can trust and compare from run to run.',
        output: '1: A 404 means the page was not found, not a crash.\nFAIL (sample)',
      },
    ],
    // L4 Comparing & timing
    [
      {
        kind: 'write',
        prompt: 'Save one reply, then print tokens per second and total seconds in PowerShell.',
        starter: '',
        solution:
          "curl.exe -s http://localhost:11434/api/generate -d '@case.json' | Set-Content out.json\n$r = Get-Content out.json -Raw | ConvertFrom-Json\n$r.eval_count / $r.eval_duration * 1e9\n$r.total_duration / 1e9",
        checks: [
          { label: 'Save the curl.exe reply to a file', re: 'curl\\.exe[^\\n]*/api/(generate|chat)[^\\n]*(>\\s*\\S+|\\|\\s*(Set-Content|Out-File)\\s+\\S+)' },
          { label: 'Read it back with ConvertFrom-Json', re: 'ConvertFrom-Json' },
          {
            label: 'Tokens/s: eval_count / eval_duration × 1e9',
            re: '\\$\\w+\\.eval_count\\s*/\\s*(\\$\\w+\\.eval_duration\\s*\\*\\s*(1e9|1000000000)|\\(\\s*\\$\\w+\\.eval_duration\\s*/\\s*(1e9|1000000000)\\s*\\))',
          },
          { label: 'Seconds: total_duration / 1e9', re: '\\$\\w+\\.total_duration\\s*/\\s*(1e9|1000000000)' },
        ],
        hint: 'Get-Content out.json -Raw | ConvertFrom-Json gives you an object. Durations are in nanoseconds: 10^9 per second.',
        explain: 'eval_duration covers only writing tokens; total_duration includes loading and reading the prompt, so it’s the user’s real wait.',
        output: '48.3\n2.5 (sample)',
      },
      {
        kind: 'write',
        prompt: 'Compare the two models’ speed fairly: same settings, and a type that won’t overflow.',
        starter:
          'using System.Net.Http.Json;\nusing System.Text.Json.Serialization;\n\nvar http = new HttpClient { BaseAddress = new Uri("http://localhost:11434") };\nforeach (string model in new[] { "llama3.2:1b", "llama3.2:3b" })\n{\n    // TODO: same prompt, temperature 0, seed 42; print tokens per second\n}\n\nrecord Stats(\n    [property: JsonPropertyName("eval_count")] int EvalCount,\n    [property: JsonPropertyName("eval_duration")] int EvalDuration);',
        solution:
          'using System.Net.Http.Json;\nusing System.Text.Json.Serialization;\n\nvar http = new HttpClient { BaseAddress = new Uri("http://localhost:11434") };\nforeach (string model in new[] { "llama3.2:1b", "llama3.2:3b" })\n{\n    var res = await http.PostAsJsonAsync("/api/generate", new\n    {\n        model, prompt = "List three uses for vinegar.", stream = false,\n        options = new { temperature = 0, seed = 42 }\n    });\n    Stats s = (await res.Content.ReadFromJsonAsync<Stats>())!;\n    double tps = s.EvalCount / (s.EvalDuration / 1e9);\n    Console.WriteLine($"{model}: {tps:F1} tokens/s");\n}\n\nrecord Stats(\n    [property: JsonPropertyName("eval_count")] int EvalCount,\n    [property: JsonPropertyName("eval_duration")] long EvalDuration);',
        checks: [
          { label: 'EvalDuration is a long', re: 'long\\s+EvalDuration' },
          { label: 'No int EvalDuration', not: 'int EvalDuration' },
          { label: 'POST to /api/generate', re: 'PostAsJsonAsync\\(\\s*"/?api/generate"' },
          { label: 'options with temperature = 0 and a seed', re: 'options\\s*=\\s*new\\s*\\{(?=[^}]*temperature\\s*=\\s*0\\b)(?=[^}]*seed\\s*=\\s*\\d+)' },
          {
            label: 'Tokens/s = EvalCount ÷ (EvalDuration in seconds)',
            re: `EvalCount\\s*(\\*\\s*${NS}\\s*/\\s*\\(?\\s*\\w+\\.EvalDuration|/\\s*\\(\\s*\\w+\\.EvalDuration\\s*/\\s*${NS}\\s*\\))|\\(double\\)\\s*\\w+\\.EvalCount\\s*/\\s*\\w+\\.EvalDuration\\s*\\*\\s*${NS}`,
          },
          { label: 'Print the model and its speed', re: 'Console\\.WriteLine\\(\\s*\\$"[^"]*\\{model\\}[^"]*\\{' },
        ],
        hint: 'eval_duration is nanoseconds: an int overflows after about 2.1 seconds. Divide by 1e9 to get a double.',
        explain: 'Same prompt and settings for both models means the only difference left is the model.',
        output: 'llama3.2:1b: 92.4 tokens/s\nllama3.2:3b: 51.7 tokens/s (sample)',
      },
    ],
    // L5 Regression checks in C#
    [
      {
        kind: 'write',
        prompt: 'Run every case, print a PASS/FAIL row each, the score, and an exit code.',
        starter: `${HEADER}var opts = new ChatOptions { Temperature = 0, Seed = 42 };\nCase[] cases = [new("Spanish for cat? One word.", "gato"), new("Spanish for dog? One word.", "perro")];\n// TODO: run the cases\n\nrecord Case(string Prompt, string Expected);`,
        solution: `${HEADER}var opts = new ChatOptions { Temperature = 0, Seed = 42 };\nCase[] cases = [new("Spanish for cat? One word.", "gato"), new("Spanish for dog? One word.", "perro")];\nint passed = 0;\nforeach (var c in cases)\n{\n    ChatResponse r = await chat.GetResponseAsync(c.Prompt, opts);\n    bool ok = r.Text.Trim().Trim('.').Equals(c.Expected, StringComparison.OrdinalIgnoreCase);\n    if (ok) passed++;\n    Console.WriteLine($"{c.Prompt,-28}{(ok ? "PASS" : "FAIL")}");\n}\nConsole.WriteLine($"{passed}/{cases.Length}");\nreturn passed == cases.Length ? 0 : 1;\n\nrecord Case(string Prompt, string Expected);`,
        checks: [
          { label: 'Loop over the cases', re: 'foreach\\s*\\(\\s*\\w+\\s+\\w+\\s+in\\s+cases\\s*\\)' },
          { label: 'Ask with the case’s Prompt and opts', re: 'GetResponseAsync\\(\\s*\\w+\\.Prompt\\s*,\\s*opts\\s*\\)' },
          { label: 'Compare the reply to Expected', re: '\\.Expected\\b' },
          { label: 'Count the passes', re: '\\w+\\+\\+|\\w+\\s*\\+=\\s*1' },
          { label: 'Print a PASS/FAIL row', re: '"PASS"\\s*:\\s*"FAIL"|"FAIL"\\s*:\\s*"PASS"' },
          { label: 'Return 1 when anything fails', re: 'return\\s+[^;]*\\?\\s*(0\\s*:\\s*1|1\\s*:\\s*0)\\s*;|Environment\\.Exit\\(|return\\s+1\\s*;' },
        ],
        hint: 'Top-level code can return an int: that becomes the exit code CI looks at.',
        explain: 'One row per case shows what broke, and a non-zero exit stops the build before a worse prompt ships.',
        output: 'Spanish for cat? One word.  PASS\nSpanish for dog? One word.  PASS\n2/2 (sample)',
      },
      {
        kind: 'write',
        prompt: 'Make this check repeatable and strict, and fail the build on any FAIL.',
        starter: `${HEADER}var opts = new ChatOptions { Temperature = 0.8f };\nCase[] cases = [new("Square root of 81? Digits only.", "9"), new("Days in a leap year? Digits only.", "366")];\nint failed = 0;\nforeach (var c in cases)\n{\n    ChatResponse r = await chat.GetResponseAsync(c.Prompt, opts);\n    bool ok = r.Text.Contains(c.Expected);\n    if (!ok) failed++;\n    Console.WriteLine($"{c.Prompt,-36}{(ok ? "PASS" : "FAIL")}");\n}\n\nrecord Case(string Prompt, string Expected);`,
        solution: `${HEADER}var opts = new ChatOptions { Temperature = 0, Seed = 42 };\nCase[] cases = [new("Square root of 81? Digits only.", "9"), new("Days in a leap year? Digits only.", "366")];\nint failed = 0;\nforeach (var c in cases)\n{\n    ChatResponse r = await chat.GetResponseAsync(c.Prompt, opts);\n    bool ok = r.Text.Trim() == c.Expected;\n    if (!ok) failed++;\n    Console.WriteLine($"{c.Prompt,-36}{(ok ? "PASS" : "FAIL")}");\n}\nreturn failed > 0 ? 1 : 0;\n\nrecord Case(string Prompt, string Expected);`,
        checks: [
          { label: 'Temperature = 0', re: 'Temperature\\s*=\\s*0(\\.0)?f?\\s*[,}]' },
          { label: 'A fixed Seed', re: 'Seed\\s*=\\s*\\d+' },
          {
            label: 'Exact match: r.Text.Trim() == c.Expected',
            re: '\\w+\\.Text\\.Trim\\(\\)\\s*==\\s*\\w+\\.Expected|\\w+\\.Expected\\s*==\\s*\\w+\\.Text\\.Trim\\(\\)',
          },
          { label: 'No loose Contains (“19” contains “9”)', not: 'r.Text.Contains(' },
          {
            label: 'Return 1 when anything failed',
            re: 'return\\s+(failed\\s*>\\s*0\\s*\\?\\s*1\\s*:\\s*0|failed\\s*==\\s*0\\s*\\?\\s*0\\s*:\\s*1)\\s*;|Environment\\.Exit\\(|if\\s*\\(\\s*failed\\s*>\\s*0\\s*\\)\\s*return\\s+1',
          },
        ],
        hint: 'Three fixes: steady sampling, exact comparison, and an exit code from failed.',
        explain: 'Random sampling makes the score wobble, Contains lets wrong answers through, and without an exit code CI never notices.',
      },
    ],
  ],
};

export default unit;
