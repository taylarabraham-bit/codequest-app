import type { DesktopUnit } from '../../../engine/types';

// Desktop edition: write-the-code challenges for Ollama unit 4 (The REST API).
// lessons[i] runs after lesson i + 1. See docs/CONTENT_GUIDE.md.

/** A JSON `"key": value` pair with any spacing (value is a regex source). */
const kv = (key: string, value: string) => `"${key}"\\s*:\\s*${value}`;
/** `"options": { ... "key": value ... }` */
const opt = (key: string, value: string) => `"options"\\s*:\\s*\\{[^}]*${kv(key, value)}`;

const unit: DesktopUnit = {
  // Windows PowerShell versions of shared items (the phone keeps the originals):
  // curl.exe, JSON bodies in request.json sent with -d '@request.json', setx.
  concepts: {
    1: {
      body: 'Every ollama command talks to a local server at http://localhost:11434. On Windows the Ollama app runs it from the system tray, or you run ollama serve. In PowerShell type curl.exe, because plain curl is Invoke-WebRequest there; GET /api/version gives the version.',
      code: 'PS> curl.exe http://localhost:11434\nOllama is running\nPS> curl.exe http://localhost:11434/api/version\n{"version":"0.40.3"}',
    },
    2: {
      body: 'To get a reply, POST JSON with the model and prompt to /api/generate. Windows PowerShell strips the " marks from inline JSON, so save the body as request.json and send it with -d \'@request.json\': the @ reads the file, and -d makes it a POST. Add "stream": false to get one JSON object back, with the text in response.',
      code: '# request.json\n{"model": "llama3.2", "prompt": "Name a planet.", "stream": false}\n\nPS> curl.exe http://localhost:11434/api/generate -d \'@request.json\'',
    },
    3: {
      body: 'request.json can carry more than a prompt. system sets the system prompt for this request, and options takes the same settings as /set parameter. On thinking models, "think": true returns the reasoning in a separate thinking field.',
      code: '{\n  "model": "qwen3", "prompt": "Is 51 prime?", "stream": false,\n  "system": "Answer in one line.", "think": true,\n  "options": {"temperature": 0, "num_ctx": 8192}\n}',
    },
    5: {
      body: 'Each CLI command has an endpoint: GET /api/tags (list), GET /api/ps (ps), POST /api/show (show), POST /api/pull (pull) and DELETE /api/delete (rm). Bodies still go in request.json. On a generate request, keep_alive sets how long the model stays loaded: "10m", -1 for good, or 0 to unload now.',
      code: 'curl.exe http://localhost:11434/api/tags\n# request.json: {"model": "mistral"}\ncurl.exe -X DELETE http://localhost:11434/api/delete -d \'@request.json\'\n# request.json: {"model": "llama3.2", "keep_alive": 0}\ncurl.exe http://localhost:11434/api/generate -d \'@request.json\'',
    },
  },
  overrides: {
    'L1.1': {
      kind: 'fill',
      prompt: 'Start the Ollama server by hand.',
      code: 'ollama ___',
      blanks: [{ answer: ['serve'], options: ['serve', 'run', 'ps'] }],
      hint: 'run opens a chat. You want the thing every command talks to.',
      explain: 'ollama serve runs the server in this window until Ctrl+C. On Windows the Ollama app in the system tray usually runs it for you.',
    },
    'L1.3': {
      kind: 'build',
      prompt: 'Check that the server is up.',
      answer: ['curl.exe', 'http://localhost:11434'],
      distractors: ['https://localhost:11434', 'http://localhost:8080', 'curl'],
      hint: 'Real curl in PowerShell has .exe on the end. Plain http, on Ollama’s port.',
      explain: 'The root URL answers in plain text when the server is up. The local server has no TLS, so https fails.',
      output: 'Ollama is running',
    },
    'L1.4': {
      kind: 'fill',
      prompt: 'Ask the server which version it runs.',
      code: 'curl.exe http://localhost:11434/api/___',
      blanks: [{ answer: ['version'], options: ['version', 'ver', 'about'] }],
      hint: 'The full word, no short forms.',
      explain: 'GET /api/version returns a small JSON object, handy for checking the server is new enough.',
      output: '{"version":"0.40.3"}',
    },
    'L1.5': {
      kind: 'fill',
      prompt: 'Which HTTP method does this curl.exe send?',
      code: 'curl.exe http://localhost:11434/api/version\n# sends a ___ request',
      blanks: [{ answer: ['GET'], options: ['GET', 'POST', 'DELETE'] }],
      hint: 'No data goes up; curl.exe just fetches.',
      explain: 'With no -d or -X, curl.exe sends GET. That’s why the docs list this endpoint as GET /api/version.',
    },
    'L1.6': {
      kind: 'build',
      prompt: 'Make Ollama listen on every network interface.',
      answer: ['setx', 'OLLAMA_HOST', '0.0.0.0:11434'],
      distractors: ['127.0.0.1:11434', 'export', 'OLLAMA_HOST=0.0.0.0:11434'],
      hint: 'setx saves a user variable: name, a space, then the value.',
      explain: 'Quit Ollama from the tray and start it again to apply it; Windows Firewall may ask to allow it. There’s no login, so only do this on a network you trust.',
      output: 'SUCCESS: Specified value was saved.',
    },
    'L1.7': {
      kind: 'fill',
      prompt: 'Why does ollama serve fail here?',
      code: 'PS> ollama serve\nError: listen tcp 127.0.0.1:11434: bind: Only one usage of each socket address (protocol/network address/port) is normally permitted.\n# the server is ___',
      blanks: [{ answer: ['already running'], options: ['already running', 'not installed', 'out of memory'] }],
      hint: 'Something already holds port 11434.',
      explain: 'Only one program can hold the port. The Ollama app in the system tray is already serving, so just curl.exe it.',
    },
    'L2.1': {
      kind: 'fill',
      prompt: 'Send the one-shot prompt in request.json. Pick the endpoint.',
      code: "curl.exe http://localhost:11434/api/___ -d '@request.json'",
      blanks: [{ answer: ['generate'], options: ['generate', 'run', 'complete'] }],
      hint: 'The CLI says run, but the endpoint is named for what the model does.',
      explain: '/api/generate takes a single prompt and returns the model’s text.',
    },
    'L2.2': {
      kind: 'fill',
      prompt: 'Name the key in request.json that picks the model.',
      code: '{\n  "___": "gemma3",\n  "prompt": "Give me a pasta tip.",\n  "stream": false\n}',
      blanks: [{ answer: ['model'], options: ['model', 'name', 'engine'] }],
      hint: 'The same word the CLI uses for model:tag.',
      explain: 'Every request names its model in model, using the same model:tag names as the CLI.',
    },
    'L2.3': {
      kind: 'fill',
      prompt: 'Get the whole reply as one JSON object.',
      code: '{\n  "model": "llama3.2",\n  "prompt": "Suggest a cat name.",\n  "stream": ___\n}',
      blanks: [{ answer: ['false'], options: ['false', '"false"', 'true'] }],
      hint: 'A JSON boolean has no quotes.',
      explain: '"stream": false turns streaming off. The string "false" isn’t a boolean, so the server rejects it with 400.',
    },
    'L2.4': {
      kind: 'build',
      prompt: 'Send request.json to the generate endpoint.',
      answer: ['curl.exe', 'http://localhost:11434/api/generate', '-d', "'@request.json'"],
      distractors: ['-X GET', "'request.json'", 'http://localhost:11434/generate'],
      alt: [['curl.exe', '-d', "'@request.json'", 'http://localhost:11434/api/generate']],
      hint: 'URL and -d with @ and the file name. The path starts with /api.',
      explain: "-d '@request.json' sends the file’s contents and makes it a POST. Without the @, curl.exe would send the words request.json.",
    },
    'L2.7': {
      kind: 'fill',
      prompt: 'What comes back without "stream": false?',
      code: '# request.json: {"model": "llama3.2", "prompt": "Count to 5."}\ncurl.exe http://localhost:11434/api/generate -d \'@request.json\'\n# reply: ___',
      blanks: [
        {
          answer: ['many JSON lines'],
          options: ['many JSON lines', 'one JSON object', 'plain text only'],
        },
      ],
      hint: 'Streaming is on unless you turn it off.',
      explain: 'By default each line is a JSON object with a small piece of text in response, and the last one has "done": true.',
    },
    'L3.2': {
      kind: 'fill',
      prompt: 'Type the key in request.json that holds sampling settings.',
      code: '{\n  "model": "llama3.2",\n  "prompt": "Invent a planet name.",\n  "stream": false,\n  "___": {"temperature": 1.5}\n}',
      blanks: [{ answer: ['options'] }],
      hint: 'Plural: it can hold several settings.',
      explain: 'Settings go inside options. A temperature at the top level is silently ignored.',
    },
    'L3.4': {
      kind: 'order',
      prompt: 'Order request.json for a creative haiku.',
      lines: [
        '{',
        '  "model": "llama3.2", "prompt": "Write a haiku.", "stream": false,',
        '  "options": {',
        '    "temperature": 1.2',
        '  }',
        '}',
      ],
      hint: 'Settings nest inside options; model and prompt stay at the top.',
      explain: 'Put the model line inside options and the request has no model at all. 1.2 makes word choices more adventurous.',
    },
    'L3.7': {
      kind: 'fix',
      prompt: 'The reply isn’t capped at 50 tokens. Fix the key.',
      code: '{\n  "model": "llama3.2", "prompt": "Describe Paris.", "stream": false,\n  "options": {[["max_tokens"]]: 50}\n}',
      fix: '"num_predict"',
      options: ['"num_predict"', '"num_ctx"', '"limit"'],
      hint: 'Use the same name as /set parameter.',
      explain: 'max_tokens is an OpenAI name. Ollama skips unknown options with only a warning in the server log; num_predict is the cap.',
    },
    'L4.5': {
      kind: 'order',
      prompt: 'Order request.json: cap at 200 tokens or a blank line.',
      lines: [
        '{',
        '  "model": "gemma3", "prompt": "Describe Rome.", "stream": false,',
        '  "options": {',
        '    "num_predict": 200,',
        '    "stop": ["\\n\\n"]',
        '  }',
        '}',
      ],
      hint: 'Both limits live inside options. The last pair has no comma.',
      explain: 'Whichever comes first ends the reply: a blank line gives done_reason stop, 200 tokens gives length.',
    },
    'L5.1': {
      kind: 'build',
      prompt: 'List your downloaded models over HTTP.',
      answer: ['curl.exe', 'http://localhost:11434/api/tags'],
      distractors: ['http://localhost:11434/api/list', 'http://localhost:11434/api/ps', '-d'],
      hint: 'Models are listed by their model:tag names.',
      explain: 'GET /api/tags is ollama list: {"models": [...]} with each model’s name, size and details.',
    },
    'L5.2': {
      kind: 'fill',
      prompt: 'Which endpoint matches ollama ps?',
      code: 'curl.exe http://localhost:11434/api/___',
      blanks: [{ answer: ['ps'], options: ['ps', 'tags', 'running'] }],
      hint: 'Same name as the CLI command.',
      explain: 'GET /api/ps lists loaded models. expires_at is the UNTIL column and size_vram is how much sits on the GPU.',
    },
    'L5.3': {
      kind: 'fill',
      prompt: 'Get llama3.2’s details, like ollama show.',
      code: '# request.json: {"model": "llama3.2"}\ncurl.exe http://localhost:11434/api/___ -d \'@request.json\'',
      blanks: [{ answer: ['show'], options: ['show', 'tags', 'info'] }],
      hint: 'Same name as the CLI command, sent as a POST.',
      explain: 'POST /api/show returns details, parameters, template, model_info and capabilities.',
    },
    'L5.4': {
      kind: 'fix',
      prompt: 'Delete mistral over HTTP. Fix the method.',
      code: '# request.json: {"model": "mistral"}\ncurl.exe -X [[POST]] http://localhost:11434/api/delete -d \'@request.json\'',
      fix: 'DELETE',
      options: ['DELETE', 'GET', 'PUT'],
      hint: 'This endpoint is neither GET nor POST.',
      explain: 'The route only accepts DELETE, so POST gets 405 Method Not Allowed. Success is a 200 with an empty body.',
    },
    'L5.5': {
      kind: 'build',
      prompt: 'request.json holds gemma3:1b with streaming off. Send it to pull.',
      answer: ['curl.exe', 'http://localhost:11434/api/pull', '-d', "'@request.json'"],
      distractors: ['-X DELETE', 'http://localhost:11434/api/download'],
      alt: [['curl.exe', '-d', "'@request.json'", 'http://localhost:11434/api/pull']],
      hint: 'Same name as the CLI command, with the file as the body.',
      explain: 'Like ollama pull. With "stream": false in the file you get one status at the end instead of a line per progress update.',
      output: '{"status":"success"}',
    },
    'L5.6': {
      kind: 'fill',
      prompt: 'Keep llama3.2 loaded until the server stops.',
      code: '{\n  "model": "llama3.2",\n  "keep_alive": ___\n}',
      blanks: [{ answer: ['-1'], options: ['-1', '0', '"10m"'] }],
      hint: 'Any negative number means no time limit.',
      explain: 'Sent to /api/generate with no prompt, this just loads the model, and -1 keeps it there; ollama ps shows UNTIL as Forever. "10m" would last 10 minutes.',
      output: '{"model":"llama3.2","created_at":"2026-10-12T09:30:15.204331Z","response":"","done":true,"done_reason":"load"}',
    },
    'L5.7': {
      kind: 'type',
      prompt: 'In request.json, unload gemma3 right now, like ollama stop.',
      template: '{\n  "model": "gemma3",\n  ___\n}',
      accept: ['"keep_alive": 0', '"keep_alive": "0"', '"keep_alive": "0s"', '"keep_alive": "0m"'],
      hint: 'How long should it stay? No time at all.',
      explain: 'Sent to /api/generate, keep_alive 0 with no prompt unloads the model at once, which is exactly what ollama stop does.',
      output: '{"model":"gemma3","created_at":"2026-10-12T09:41:07.512837Z","response":"","done":true,"done_reason":"unload"}',
    },
    'boss.1': {
      kind: 'fill',
      prompt: 'Reach your laptop’s server from another PC.',
      code: '# laptop (192.168.1.20) ran: setx OLLAMA_HOST 0.0.0.0:11434\n# then restarted Ollama from the tray\n# on the other PC:\ncurl.exe http://___:11434',
      blanks: [{ answer: ['192.168.1.20'], options: ['192.168.1.20', 'localhost', '0.0.0.0'] }],
      hint: 'localhost always means the device you’re typing on.',
      explain: '0.0.0.0 is an address to listen on, not one to connect to. Other devices use the laptop’s own IP.',
      output: 'Ollama is running',
    },
    'boss.2': {
      kind: 'build',
      prompt: 'Delete the model named in request.json, like ollama rm.',
      answer: ['curl.exe', '-X', 'DELETE', 'http://localhost:11434/api/delete', '-d', "'@request.json'"],
      distractors: ['POST', 'http://localhost:11434/api/rm'],
      alt: [
        ['curl.exe', '-X', 'DELETE', '-d', "'@request.json'", 'http://localhost:11434/api/delete'],
        ['curl.exe', 'http://localhost:11434/api/delete', '-X', 'DELETE', '-d', "'@request.json'"],
        ['curl.exe', 'http://localhost:11434/api/delete', '-d', "'@request.json'", '-X', 'DELETE'],
        ['curl.exe', '-d', "'@request.json'", '-X', 'DELETE', 'http://localhost:11434/api/delete'],
        ['curl.exe', '-d', "'@request.json'", 'http://localhost:11434/api/delete', '-X', 'DELETE'],
      ],
      hint: 'The method, the endpoint and the file as the body.',
      explain: '-d alone would make it a POST, so -X DELETE sets the method. A 200 with an empty body means it’s gone.',
    },
    'boss.3': {
      kind: 'order',
      prompt: 'Check the server, pull and ask qwen3, see it loaded, delete it.',
      lines: [
        'curl.exe http://localhost:11434',
        "curl.exe http://localhost:11434/api/pull -d '@pull.json'",
        "curl.exe http://localhost:11434/api/generate -d '@ask.json'",
        'curl.exe http://localhost:11434/api/ps',
        "curl.exe -X DELETE http://localhost:11434/api/delete -d '@delete.json'",
      ],
      hint: 'You can’t ask a model you haven’t pulled, and ps only lists it after a request.',
      explain: 'Each step is the HTTP side of a CLI command: pull, a one-shot run, ps and rm. Each body sits in its own .json file.',
    },
    'boss.5': {
      kind: 'fix',
      prompt: 'Keep mistral loaded 30 minutes. Fix the value in request.json.',
      code: '{\n  "model": "mistral",\n  "prompt": "Hi",\n  "keep_alive": [["30"]]\n}',
      fix: '"30m"',
      options: ['"30m"', '"30min"', '"30 minutes"'],
      hint: 'A duration string needs a short unit: s, m or h.',
      explain: '"30" fails with missing unit in duration. A bare number counts seconds, so 30 without quotes would mean half a minute.',
    },
    'boss.6': {
      kind: 'type',
      prompt: 'Serve Ollama to every device on your network.',
      accept: [
        'setx OLLAMA_HOST 0.0.0.0:11434',
        'setx OLLAMA_HOST 0.0.0.0',
        'setx OLLAMA_HOST "0.0.0.0:11434"',
        'setx OLLAMA_HOST "0.0.0.0"',
        'setx OLLAMA_HOST http://0.0.0.0:11434',
        'setx OLLAMA_HOST "http://0.0.0.0:11434"',
        '$env:OLLAMA_HOST = "0.0.0.0:11434"; ollama serve',
        '$env:OLLAMA_HOST = "0.0.0.0"; ollama serve',
        "$env:OLLAMA_HOST = '0.0.0.0:11434'; ollama serve",
        "$env:OLLAMA_HOST = '0.0.0.0'; ollama serve",
      ],
      hint: 'Save OLLAMA_HOST as a user variable with setx.',
      explain: 'Then quit Ollama from the tray and start it again. Leave off the port and it stays 11434. Anyone on the network can now use your models, so only do this on one you trust.',
      output: 'SUCCESS: Specified value was saved.',
    },
    'boss.8': {
      kind: 'fix',
      prompt: 'The server answers 400. Swap in a thinking model.',
      code: '{\n  "model": [["llama3.2"]],\n  "prompt": "Is 221 prime?",\n  "think": true,\n  "stream": false\n}',
      fix: '"qwen3"',
      options: ['"qwen3"', '"llama3.2:1b"', '"mistral"'],
      hint: 'Which model in this unit returned a thinking field?',
      explain: 'llama3.2 can’t think, so the error says it does not support thinking. qwen3 returns thinking plus the answer: 221 = 13 × 17.',
    },
    'boss.9': {
      kind: 'build',
      prompt: 'request.json names qwen3. Check its capabilities over HTTP.',
      answer: ['curl.exe', 'http://localhost:11434/api/show', '-d', "'@request.json'"],
      distractors: ['-X GET', 'http://localhost:11434/api/tags'],
      alt: [['curl.exe', '-d', "'@request.json'", 'http://localhost:11434/api/show']],
      hint: 'The endpoint behind ollama show, with the file as the body.',
      explain: 'POST /api/show lists qwen3’s capabilities (completion, tools, thinking) along with its details and template.',
    },
  },
  lessons: [
    // L1 The local server
    [
      {
        kind: 'write',
        prompt: 'Start the server, check it’s up, then ask for its version.',
        starter: '',
        solution: 'ollama serve\ncurl.exe http://localhost:11434\ncurl.exe http://localhost:11434/api/version',
        checks: [
          { label: 'Start it with ollama serve', re: '^\\s*ollama serve\\s*$', flags: 'm' },
          { label: 'curl.exe the server root on port 11434', re: '^\\s*curl\\.exe (http://)?(localhost|127\\.0\\.0\\.1):11434/?\\s*$', flags: 'm' },
          { label: 'GET /api/version with curl.exe', re: '^\\s*curl\\.exe (http://)?(localhost|127\\.0\\.0\\.1):11434/api/version\\s*$', flags: 'm' },
        ],
        hint: 'The server listens on localhost, port 11434. In PowerShell, real curl is curl.exe.',
        explain: 'The root answers “Ollama is running”, and /api/version returns the version as JSON. If the tray app is running, it is already serving.',
      },
      {
        kind: 'write',
        prompt: 'Serve Ollama to your network, then reach it from another PC.',
        starter: '# on the laptop (192.168.1.20)\n\n# on the other PC\n',
        solution:
          '# on the laptop (192.168.1.20)\nsetx OLLAMA_HOST 0.0.0.0:11434\n# then quit Ollama from the tray and start it again\n# on the other PC\ncurl.exe http://192.168.1.20:11434/api/version',
        checks: [
          {
            label: 'Set OLLAMA_HOST to 0.0.0.0 with setx',
            re: '(setx\\s+OLLAMA_HOST\\s+|\\$env:OLLAMA_HOST\\s*=\\s*)["\']?(http://)?0\\.0\\.0\\.0(:11434)?["\']?',
            flags: 'i',
          },
          { label: 'curl.exe the laptop’s address, port 11434', re: 'curl\\.exe (http://)?192\\.168\\.1\\.20:11434' },
          { label: 'Not localhost from the other PC', not: 'curl.exe http://localhost' },
          { label: 'No bash-style OLLAMA_HOST=… ollama serve', not: 'OLLAMA_HOST=0' },
        ],
        hint: 'setx saves a user variable that Ollama reads when it starts. 0.0.0.0 means every network card.',
        explain: 'After a restart from the tray the server accepts other devices, which reach it at the laptop’s own IP. Windows Firewall may ask you to allow Ollama.',
        output: '{"version":"0.40.3"}',
      },
    ],
    // L2 Generate requests
    [
      {
        kind: 'write',
        prompt: 'Write request.json for a one-shot gemma3 prompt, then send it.',
        starter: '# request.json\n\n# PowerShell\n',
        solution:
          '# request.json\n{\n  "model": "gemma3",\n  "prompt": "Suggest a name for a bakery.",\n  "stream": false\n}\n# PowerShell\ncurl.exe http://localhost:11434/api/generate -d \'@request.json\'',
        checks: [
          { label: 'A "model" name', re: kv('model', '"[\\w.:/-]+"') },
          { label: 'A "prompt"', re: kv('prompt', '"[^"]+"') },
          { label: '"stream": false', re: kv('stream', 'false') },
          { label: 'curl.exe http://localhost:11434/api/generate', re: 'curl\\.exe (http://)?localhost:11434/api/generate' },
          { label: "Send the file with -d '@request.json'", re: '(-d|--data) [\'"]?@request\\.json' },
        ],
        hint: 'The JSON goes in the file. -d with @ sends the file and makes it a POST.',
        explain: 'With streaming off the reply is one JSON object, and the text is in its response field.',
        output: '{"model":"gemma3","created_at":"…","response":"The Daily Crumb","done":true,…}',
      },
      {
        kind: 'write',
        prompt: 'Fix the file and the command: valid JSON, no streaming, file sent as the body.',
        starter:
          '# request.json\n{\n  "model": "llama3.2"\n  "prompt": "Name three board games.",\n  "stream": "false"\n}\n# PowerShell\ncurl.exe http://localhost:11434/api/generate \'request.json\'\n',
        solution:
          '# request.json\n{\n  "model": "llama3.2",\n  "prompt": "Name three board games.",\n  "stream": false\n}\n# PowerShell\ncurl.exe http://localhost:11434/api/generate -d \'@request.json\'',
        checks: [
          { label: 'A comma after the model', re: kv('model', '"llama3\\.2"\\s*,') },
          { label: 'false without quotes', re: kv('stream', 'false\\b') },
          { label: 'Not the string "false"', not: '"false"' },
          { label: 'curl.exe to /api/generate', re: '^\\s*curl\\.exe [^\\n]*/api/generate', flags: 'm' },
          { label: "Send the body with -d '@request.json'", re: '(-d|--data) [\'"]?@request\\.json' },
        ],
        hint: 'JSON needs commas between pairs, and booleans have no quotes. The file needs -d and an @.',
        explain: 'Without -d curl.exe sends a GET, without @ it would send the words request.json, and "false" in quotes is a string, not a boolean.',
      },
    ],
    // L3 Request options
    [
      {
        kind: 'write',
        prompt: 'Write request.json: a bike-shop slogan from llama3.2, with a system prompt and temperature 1.2.',
        starter: '',
        solution:
          '{\n  "model": "llama3.2",\n  "prompt": "Write a slogan for a bike shop.",\n  "system": "You are a witty copywriter.",\n  "options": {"temperature": 1.2},\n  "stream": false\n}',
        checks: [
          { label: '"model": "llama3.2"', re: kv('model', '"llama3\\.2(:\\w+)?"') },
          { label: 'A "system" prompt', re: kv('system', '"[^"]+"') },
          { label: 'temperature 1.2 inside "options"', re: opt('temperature', '1\\.2\\b') },
          { label: '"stream": false', re: kv('stream', 'false') },
        ],
        hint: 'system sits at the top level. Settings like temperature go inside an options object.',
        explain: 'options takes the same names as /set parameter, and system applies to this request only. Send it with curl.exe … /api/generate -d \'@request.json\'.',
        output: '{"model":"llama3.2",…,"response":"Pedal more, worry less.","done":true,…}',
      },
      {
        kind: 'write',
        prompt: 'Edit request.json: qwen3’s reasoning separately, temperature 0 and a 4096 context.',
        starter: '{\n  "model": "qwen3",\n  "prompt": "Is 221 prime?",\n  "stream": false\n}\n',
        solution:
          '{\n  "model": "qwen3",\n  "prompt": "Is 221 prime?",\n  "think": true,\n  "options": {"temperature": 0, "num_ctx": 4096},\n  "stream": false\n}',
        checks: [
          { label: '"think": true', re: kv('think', 'true') },
          { label: 'temperature 0 in "options"', re: opt('temperature', '0(\\.0+)?\\s*[,}]') },
          { label: 'num_ctx 4096 in "options"', re: opt('num_ctx', '4096') },
          { label: 'Keep "stream": false', re: kv('stream', 'false') },
        ],
        hint: 'think is a top-level field; the two settings share one options object.',
        explain: 'With think on, the reasoning comes back in a thinking field and response holds only the answer.',
        output: '{…,"thinking":"221 = 13 × 17…","response":"No, 221 = 13 × 17.","done":true,…}',
      },
    ],
    // L4 Reply stats
    [
      {
        kind: 'write',
        prompt: 'Work out this reply’s speed in tokens per second, as comments.',
        starter:
          '# reply (trimmed)\n# "done": true,\n# "done_reason": "stop",\n# "eval_count": 150,\n# "eval_duration": 3000000000\n',
        solution:
          '# reply (trimmed)\n# "done": true,\n# "done_reason": "stop",\n# "eval_count": 150,\n# "eval_duration": 3000000000\n# tokens/s = eval_count / eval_duration * 10^9\n# = 150 / 3000000000 * 10^9 = 50',
        checks: [
          { label: 'The formula: eval_count / eval_duration × 10^9', re: 'eval_count\\s*/\\s*\\(?\\s*eval_duration' },
          { label: 'The answer: 50 tokens/s', re: '=\\s*50(\\.0+)?\\b' },
        ],
        hint: 'Durations are in nanoseconds. 3000000000 ns is 3 seconds.',
        explain: '150 tokens in 3 seconds is 50 tokens/s. Multiplying by 10^9 turns nanoseconds into seconds.',
      },
      {
        kind: 'write',
        prompt: 'The list was cut off. Edit request.json so the reply finishes with stop.',
        starter:
          '{\n  "model": "gemma3",\n  "prompt": "List the planets in order.",\n  "options": {"num_predict": 20},\n  "stream": false\n}\n# reply: "Mercury, Venus, Earth, Mars, Jupiter,"\n# "done_reason": "length"\n',
        solution:
          '{\n  "model": "gemma3",\n  "prompt": "List the planets in order.",\n  "options": {"num_predict": -1},\n  "stream": false\n}\n# reply: "Mercury, Venus, Earth, Mars, Jupiter, Saturn, Uranus, Neptune."\n# "done_reason": "stop"',
        checks: [
          { label: 'No small num_predict cap: raise it, use -1 or drop it', re: '^(?![\\s\\S]*"num_predict"\\s*:\\s*\\d{1,2}\\b)' },
          { label: 'Keep the model and prompt', re: `${kv('model', '"gemma3"')}[\\s\\S]*${kv('prompt', '"List the planets')}` },
          { label: 'Keep "stream": false', re: kv('stream', 'false') },
          { label: 'Note the new done_reason: stop', re: '"?done_reason"?\\s*:?\\s*"?stop"?' },
        ],
        hint: 'done_reason length means num_predict ran out. Raise it, set it to -1, or drop it.',
        explain: 'With no cap the model ends on its own, so done is true and done_reason is stop.',
      },
    ],
    // L5 Model endpoints
    [
      {
        kind: 'write',
        prompt: 'Over the API: list your models, pull mistral, then delete it.',
        starter: '',
        solution:
          '# model.json\n{"model": "mistral"}\n# PowerShell\ncurl.exe http://localhost:11434/api/tags\ncurl.exe http://localhost:11434/api/pull -d \'@model.json\'\ncurl.exe -X DELETE http://localhost:11434/api/delete -d \'@model.json\'',
        checks: [
          { label: 'A JSON body with "model": "mistral"', re: kv('model', '"mistral(:\\w+)?"') },
          { label: 'GET /api/tags with curl.exe', re: '^\\s*curl\\.exe (http://)?localhost:11434/api/tags\\s*$', flags: 'm' },
          { label: "POST /api/pull with -d '@file'", re: '^\\s*curl\\.exe [^\\n]*/api/pull[^\\n]*(-d|--data) [\'"]?@[\\w.-]+', flags: 'm' },
          {
            label: "DELETE /api/delete with -X DELETE and -d '@file'",
            re: '^\\s*curl\\.exe (?=[^\\n]*-X DELETE)(?=[^\\n]*/api/delete)(?=[^\\n]*(-d|--data) [\'"]?@[\\w.-]+)',
            flags: 'm',
          },
        ],
        hint: 'Put {"model": "mistral"} in a file and send it with -d \'@file\'. -d makes a POST, so delete needs -X DELETE.',
        explain: 'Each CLI command has an endpoint: tags lists, pull downloads (streaming progress) and delete removes. One file can serve both requests.',
      },
      {
        kind: 'write',
        prompt: 'Preload llama3.2 for good, check what’s loaded, then unload it.',
        starter: '# load.json\n\n# unload.json\n\n# PowerShell\n',
        solution:
          '# load.json\n{"model": "llama3.2", "keep_alive": -1}\n# unload.json\n{"model": "llama3.2", "keep_alive": 0}\n# PowerShell\ncurl.exe http://localhost:11434/api/generate -d \'@load.json\'\ncurl.exe http://localhost:11434/api/ps\ncurl.exe http://localhost:11434/api/generate -d \'@unload.json\'',
        checks: [
          { label: 'Load it with "keep_alive": -1', re: kv('keep_alive', '(-1|"-1")\\b') },
          { label: 'Unload it with "keep_alive": 0', re: kv('keep_alive', '(0|"0s?")\\s*[,}]') },
          { label: 'GET /api/ps with curl.exe', re: '^\\s*curl\\.exe (http://)?localhost:11434/api/ps\\s*$', flags: 'm' },
          {
            label: 'Send load.json, then /api/ps, then unload.json',
            re: '/api/generate[^\\n]*@load\\.json[\\s\\S]*/api/ps[\\s\\S]*/api/generate[^\\n]*@unload\\.json',
          },
        ],
        hint: 'A request with a model and no prompt just loads it. -1 means forever; 0 means now.',
        explain: 'keep_alive -1 keeps the model loaded until you unload it, and keep_alive 0 frees the memory right away.',
      },
    ],
  ],
};

export default unit;
