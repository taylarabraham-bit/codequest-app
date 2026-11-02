import type { DesktopUnit } from '../../../engine/types';

// Desktop edition: write-the-code challenges for Ollama unit 6 (Streaming).
// lessons[i] runs after lesson i + 1. See docs/CONTENT_GUIDE.md.

/** A JSON `"key": value` pair with any spacing (value is a regex source). */
const kv = (key: string, value: string) => `"${key}"\\s*:\\s*${value}`;
/** A whole line holding one JSON object that contains every given pattern. */
const line = (...parts: string[]) => `^\\{${parts.map((p) => `(?=[^\\n]*${p})`).join('')}[^\\n]*\\}\\s*$`;
/** `"message": {"role": "assistant", "content": "<text>` with keys in either order. */
/** A quoted -d '@file.json' argument (PowerShell needs the quotes around @). */
const fileArg = `(-d|--data(-binary)?)\\s+(['"])@[\\w.\\\\/:-]+\\.json\\3`;
const chatPiece = (text: string) =>
  `"message"\\s*:\\s*\\{(?=[^{}]*${kv('role', '"assistant"')})(?=[^{}]*${kv('content', `"${text}"`)})`;

const unit: DesktopUnit = {
  lessons: [
    // L1 Streams by default
    [
      {
        kind: 'write',
        prompt: 'Write two request files and send each: one streamed, one as one object.',
        starter: '',
        solution:
          '# stream.json\n{"model": "gemma3", "prompt": "Name a moon of Jupiter."}\n# once.json\n{"model": "gemma3", "prompt": "Name a moon of Jupiter.", "stream": false}\n# in PowerShell:\ncurl.exe http://localhost:11434/api/generate -d \'@stream.json\'\ncurl.exe http://localhost:11434/api/generate -d \'@once.json\'\n# first: application/x-ndjson, second: application/json',
        checks: [
          { label: 'Two curl.exe requests to /api/generate', re: 'curl\\.exe[^\\n]*/api/generate[\\s\\S]*curl\\.exe[^\\n]*/api/generate' },
          { label: "Each sends a file with -d '@file.json'", re: `${fileArg}[\\s\\S]*${fileArg}` },
          { label: 'One body with no "stream" key, so it streams', re: '\\{(?:(?!"stream")[^{}])*"prompt"(?:(?!"stream")[^{}])*\\}' },
          { label: 'One body with "stream": false', re: kv('stream', 'false') },
          { label: 'Note both content types in a comment', re: '#[^\\n]*(x-ndjson[^\\n]*application/json|application/json[^\\n]*x-ndjson)' },
        ],
        hint: 'Label each file with a # comment. Streaming is the default; turning it off takes one extra field.',
        explain: 'The streamed reply is newline-delimited JSON, one object per line; with stream off you get one JSON object.',
      },
      {
        kind: 'write',
        prompt: 'Write the stream this request prints for the reply “Mars.” in two pieces.',
        starter:
          '# request.json: {"model": "llama3.2", "prompt": "Name a red planet."}\nPS> curl.exe http://localhost:11434/api/generate -d \'@request.json\'\n',
        solution:
          '# request.json: {"model": "llama3.2", "prompt": "Name a red planet."}\nPS> curl.exe http://localhost:11434/api/generate -d \'@request.json\'\n{"model":"llama3.2","created_at":"2026-10-30T09:00:01.10Z","response":"Mars","done":false}\n{"model":"llama3.2","created_at":"2026-10-30T09:00:01.12Z","response":".","done":false}\n{"model":"llama3.2","created_at":"2026-10-30T09:00:01.14Z","response":"","done":true,"done_reason":"stop"}',
        checks: [
          { label: 'Two pieces, each a whole JSON object on one line with "done": false', re: `(${line(kv('response', '"'), kv('done', 'false'))}\\n){2}`, flags: 'm' },
          { label: 'Each piece’s text in "response"', re: line(kv('response', '"Mars')), flags: 'm' },
          { label: 'A last line with "done": true', re: `${line(kv('done', 'true'))}(?![\\s\\S]*\\{)`, flags: 'm' },
          { label: 'It says why: "done_reason": "stop"', re: kv('done_reason', '"stop"') },
        ],
        hint: 'One complete JSON object per line. Only the last one is done.',
        explain: 'That’s NDJSON: each line parses on its own, and the final line closes the stream with done true.',
      },
    ],
    // L2 Chunk shapes
    [
      {
        kind: 'write',
        prompt: 'Rewrite these /api/generate chunks as /api/chat chunks.',
        starter: '{"model":"gemma3","response":"Lima","done":false}\n{"model":"gemma3","response":" is lovely.","done":false}\n',
        solution:
          '{"model":"gemma3","message":{"role":"assistant","content":"Lima"},"done":false}\n{"model":"gemma3","message":{"role":"assistant","content":" is lovely."},"done":false}',
        checks: [
          { label: 'The first piece in message.content', re: chatPiece('Lima') },
          { label: 'The second piece, space included', re: chatPiece(' is lovely\\.') },
          { label: 'No "response" field', not: '"response"' },
          { label: 'Both still "done": false', re: `(${line(kv('done', 'false'))}\\s*){2}`, flags: 'm' },
        ],
        hint: 'Chat chunks wrap the text in a message object with a role.',
        explain: 'Chat chunks carry a message with role assistant; the text piece is message.content.',
      },
      {
        kind: 'write',
        prompt: 'Stream a recipe from /api/chat and note where each chunk’s text is.',
        starter: '',
        solution:
          '{\n  "model": "mistral",\n  "messages": [{"role": "user", "content": "A 3-step omelette recipe."}]\n}\n# save as request.json, then in PowerShell:\ncurl.exe http://localhost:11434/api/chat -d \'@request.json\'\n# each chunk: {"message": {"role": "assistant", "content": "…"}, "done": false}\n# text piece: message.content',
        checks: [
          { label: 'POST to /api/chat with curl.exe', re: 'curl\\.exe[^\\n]*localhost:11434/api/chat' },
          { label: "Send the body file with -d '@request.json'", re: fileArg },
          { label: 'A user message', re: `\\{(?=[^{}]*${kv('role', '"user"')})(?=[^{}]*${kv('content', '"[^"]+"')})` },
          { label: 'Let it stream: no "stream": false', re: '^(?![\\s\\S]*"stream"\\s*:\\s*false)' },
          { label: 'Note that the text is in message.content', re: '#[^\\n]*message\\.content' },
        ],
        hint: 'Write the body as request.json, then the curl.exe line. Leave out the stream field.',
        explain: 'Each chat chunk’s message.content holds the next piece; generate chunks use response instead.',
      },
    ],
    // L3 The final chunk
    [
      {
        kind: 'write',
        prompt: 'Write the last line of a chat stream cut off by num_predict.',
        starter: '',
        solution:
          '{"model":"llama3.2","created_at":"2026-10-30T09:12:04.004Z","message":{"role":"assistant","content":""},"done":true,"done_reason":"length","total_duration":912000000,"eval_count":40}',
        checks: [
          { label: 'A chat message object', re: chatPiece('[^"]*') },
          { label: '"done": true', re: kv('done', 'true') },
          { label: '"done_reason": "length"', re: kv('done_reason', '"length"') },
          { label: 'An eval_count stat', re: kv('eval_count', '\\d+') },
        ],
        hint: 'The final line is done, says why it ended, and carries the stats.',
        explain: 'length means num_predict stopped the reply; a natural end would say stop.',
      },
      {
        kind: 'write',
        prompt: 'Note the full reply, why it ended and its speed in tokens/s.',
        starter:
          '{"message":{"role":"assistant","content":"Bake"},"done":false}\n{"message":{"role":"assistant","content":" at 180°C"},"done":false}\n{"message":{"role":"assistant","content":"."},"done":true,"done_reason":"stop","eval_count":5,"eval_duration":100000000}\n',
        solution:
          '{"message":{"role":"assistant","content":"Bake"},"done":false}\n{"message":{"role":"assistant","content":" at 180°C"},"done":false}\n{"message":{"role":"assistant","content":"."},"done":true,"done_reason":"stop","eval_count":5,"eval_duration":100000000}\n# reply: Bake at 180°C.\n# ended: stop, it finished normally\n# speed: 5 / 0.1 s = 50 tokens/s',
        checks: [
          { label: 'The full reply, with the last chunk’s “.”', re: '^#[^\\n]*Bake at 180°C\\.', flags: 'm' },
          { label: 'Why it ended: stop', re: '^#[^\\n]*\\bstop\\b', flags: 'm' },
          { label: 'The speed: 50 tokens/s', re: '^#[^\\n]*\\b50(\\.0+)?\\b', flags: 'm' },
        ],
        hint: 'The final chunk can hold text too. eval_duration is in nanoseconds.',
        explain: 'Add the last piece before you stop. 5 tokens in 0.1 s is 50 tokens per second.',
      },
    ],
    // L4 Rebuilding the reply
    [
      {
        kind: 'write',
        prompt: 'Rebuild the thinking and the answer, then write the assistant message to save.',
        starter:
          '{"message":{"role":"assistant","content":"","thinking":"7 × 6"},"done":false}\n{"message":{"role":"assistant","content":"","thinking":" = 42"},"done":false}\n{"message":{"role":"assistant","content":"42"},"done":false}\n{"message":{"role":"assistant","content":" eggs"},"done":false}\n{"message":{"role":"assistant","content":""},"done":true,"done_reason":"stop"}\n',
        solution:
          '{"message":{"role":"assistant","content":"","thinking":"7 × 6"},"done":false}\n{"message":{"role":"assistant","content":"","thinking":" = 42"},"done":false}\n{"message":{"role":"assistant","content":"42"},"done":false}\n{"message":{"role":"assistant","content":" eggs"},"done":false}\n{"message":{"role":"assistant","content":""},"done":true,"done_reason":"stop"}\n# thinking: "7 × 6 = 42"\n# content: "42 eggs"\n{"role": "assistant", "content": "42 eggs"}',
        checks: [
          { label: 'The thinking, joined', re: '^#[^\\n]*thinking[^\\n]*7 × 6 = 42', flags: 'm' },
          { label: 'The answer, joined', re: '^#[^\\n]*content[^\\n]*42 eggs', flags: 'm' },
          { label: 'One assistant message holding "42 eggs"', re: `^\\{(?=[^{}\\n]*${kv('role', '"assistant"')})(?=[^{}\\n]*${kv('content', '"42 eggs"')})`, flags: 'm' },
        ],
        hint: 'Join the thinking pieces and the content pieces separately, keeping their spaces.',
        explain: 'Thinking streams first and stays apart from the answer; the saved message holds the joined content.',
      },
      {
        kind: 'write',
        prompt: 'Add the streamed reply to request.json and ask the next question.',
        starter:
          '# streamed reply pieces: "Try", " the", " lentil soup", "."\n# request.json, sent with: curl.exe http://localhost:11434/api/chat -d \'@request.json\'\n{\n  "model": "llama3.2",\n  "messages": [\n    {"role": "user", "content": "Something warm for lunch?"}\n  ]\n}\n',
        solution:
          '# streamed reply pieces: "Try", " the", " lentil soup", "."\n# request.json, sent with: curl.exe http://localhost:11434/api/chat -d \'@request.json\'\n{\n  "model": "llama3.2",\n  "messages": [\n    {"role": "user", "content": "Something warm for lunch?"},\n    {"role": "assistant", "content": "Try the lentil soup."},\n    {"role": "user", "content": "Is it vegan?"}\n  ]\n}',
        checks: [
          { label: 'One assistant message with the joined text', re: `\\{(?=[^{}]*${kv('role', '"assistant"')})(?=[^{}]*${kv('content', '"Try the lentil soup\\."')})` },
          { label: 'Not one message per piece', re: '^(?![\\s\\S]*"content"\\s*:\\s*"Try")' },
          { label: 'Then a new user question', re: `"Try the lentil soup\\."[^{}]*\\}\\s*,\\s*\\{(?=[^{}]*${kv('role', '"user"')})(?=[^{}]*${kv('content', '"[^"]+"')})` },
          { label: 'Keep the first question', re: kv('content', '"Something warm for lunch\\?"') },
        ],
        hint: 'Join the pieces in order, exactly as sent, into one assistant message.',
        explain: 'The stream is one reply, so history gets one assistant message, followed by your next turn.',
      },
    ],
    // L5 Stream errors
    [
      {
        kind: 'write',
        prompt: 'Write what a misspelled model name returns: status line and body.',
        starter:
          '# request.json: {"model": "gemma33", "messages": [{"role": "user", "content": "Hi"}]}\nPS> curl.exe -i http://localhost:11434/api/chat -d \'@request.json\'\n',
        solution:
          '# request.json: {"model": "gemma33", "messages": [{"role": "user", "content": "Hi"}]}\nPS> curl.exe -i http://localhost:11434/api/chat -d \'@request.json\'\nHTTP/1.1 404 Not Found\nContent-Type: application/json; charset=utf-8\n\n{"error":"model \'gemma33\' not found"}',
        checks: [
          { label: 'A 404 Not Found status line', re: '^HTTP/[\\d.]+ 404 Not Found', flags: 'm' },
          { label: 'Sent as application/json', re: '^Content-Type: application/json', flags: 'mi' },
          { label: 'One {"error": …} object', re: `^\\{\\s*${kv('error', '"[^"]+"')}\\s*\\}\\s*$`, flags: 'm' },
          { label: 'No "done" in an error', not: '"done"' },
        ],
        hint: 'It fails before any text is sent, so the status is set and the body is one object.',
        explain: 'An unknown model fails up front: a 404 status and a single JSON error, not a stream.',
      },
      {
        kind: 'write',
        prompt: 'Write a generate stream that fails mid-way: two pieces, then the error.',
        starter: 'HTTP/1.1 200 OK\n',
        solution:
          'HTTP/1.1 200 OK\nContent-Type: application/x-ndjson\n\n{"model":"llama3.2","response":"Once","done":false}\n{"model":"llama3.2","response":" upon","done":false}\n{"error":"an error was encountered while running the model"}',
        checks: [
          { label: 'Streamed as application/x-ndjson', re: '^Content-Type: application/x-ndjson', flags: 'mi' },
          { label: 'Two pieces with "done": false', re: `(${line(kv('response', '"'), kv('done', 'false'))}\\n){2}`, flags: 'm' },
          { label: 'An {"error": …} line last', re: `\\n\\{\\s*${kv('error', '"[^"]+"')}\\s*\\}\\s*$` },
          { label: 'No "done": true line', re: '^(?![\\s\\S]*"done"\\s*:\\s*true)' },
        ],
        hint: 'The 200 is already sent, so the error arrives as one more line.',
        explain: 'A mid-stream failure ends with an error line instead of done true, so check every line for error.',
      },
    ],
  ],
  // Laptop versions: Windows PowerShell 5.1 needs curl.exe and the JSON body in a file.
  concepts: {
    1: {
      body: 'Leave out "stream" and both /api/generate and /api/chat stream. The reply comes as newline-delimited JSON (application/x-ndjson): one complete JSON object per line, each with the next small piece of text. Send "stream": false to get one application/json object instead. On Windows, type curl.exe (in Windows PowerShell, plain curl is Invoke-WebRequest) and keep the body in request.json, sent with -d \'@request.json\'.',
      code: `# request.json: {"model": "llama3.2", "prompt": "Name a moon."}\nPS> curl.exe http://localhost:11434/api/generate -d '@request.json'\n{"model":"llama3.2","created_at":"2026-10-12T10:02:11.481203Z","response":"Io","done":false}\n{"model":"llama3.2","created_at":"2026-10-12T10:02:11.497618Z","response":".","done":false}\n{"model":"llama3.2","created_at":"2026-10-12T10:02:11.513377Z","response":"","done":true,"done_reason":"stop",...}`,
    },
    5: {
      body: 'If a request fails before any text is sent, you get an error status such as 404 and one {"error": "..."} object as application/json. If it fails mid-stream, the 200 status is already sent, so the error comes as a last {"error": "..."} line with no "done": true. Check every line for error. curl.exe -i shows the status line and headers above the body.',
      code: `# request.json: {"model": "lama3.2", "prompt": "Hi"}\nPS> curl.exe -i http://localhost:11434/api/generate -d '@request.json'\nHTTP/1.1 404 Not Found   # headers trimmed\n{"error":"model 'lama3.2' not found"}\n# fails mid-stream: status stays 200 OK\n{"model":"llama3.2","created_at":"2026-10-12T10:15:40.662281Z","response":" Yes","done":false}\n{"error":"an error was encountered while running the model"}`,
    },
  },
  overrides: {
    'L1.1': {
      kind: 'fill',
      prompt: 'What does sending this request.json to /api/chat get back?',
      code: `{\n  "model": "gemma3",\n  "messages": [{"role": "user", "content": "Suggest a tea."}]\n}\n# PS> curl.exe http://localhost:11434/api/chat -d '@request.json'\n# reply: ___`,
      blanks: [
        {
          answer: ['a stream of JSON lines'],
          options: ['a stream of JSON lines', 'one JSON object', 'plain text'],
        },
      ],
      hint: 'The body has no "stream" key. What’s the default?',
      explain: '/api/chat streams by default, just like /api/generate. Each line is a JSON object with the next piece of the reply.',
    },
    'L1.2': {
      kind: 'fill',
      prompt: 'Which content type marks a streamed reply?',
      code: `# request.json: {"model": "gemma3", "prompt": "Name a spice."}\nPS> curl.exe -i http://localhost:11434/api/generate -d '@request.json'\nHTTP/1.1 200 OK\nContent-Type: ___\nDate: Mon, 12 Oct 2026 10:03:27 GMT\nTransfer-Encoding: chunked\n\n{"model":"gemma3","created_at":"2026-10-12T10:03:27.640118Z","response":"Pap","done":false}`,
      blanks: [
        {
          answer: ['application/x-ndjson'],
          options: ['application/x-ndjson', 'application/json', 'text/event-stream'],
        },
      ],
      hint: 'The body is JSON objects split by newlines.',
      explain: 'x-ndjson means newline-delimited JSON, so you read and parse one line at a time. text/event-stream is a different format that puts data: before each event.',
    },
    'L1.4': {
      kind: 'fill',
      prompt: 'Name the key in request.json that switches streaming off.',
      code: `{\n  "model": "llama3.2",\n  "messages": [{"role": "user", "content": "Name a herb."}],\n  "___": false\n}`,
      blanks: [{ answer: ['stream'], options: ['stream', 'streaming', 'chunked'] }],
      hint: 'One short word, no -ing.',
      explain: 'With "stream": false the server waits and sends one object. Unknown keys like "streaming" are ignored, so you’d still get a stream.',
    },
    'L1.7': {
      kind: 'build',
      prompt: 'request.json holds a llama3.2 chat body with no "stream" key. Stream the reply.',
      answer: ['curl.exe', 'http://localhost:11434/api/chat', '-d', "'@request.json'"],
      distractors: ['http://localhost:11434/api/stream', "'request.json'", 'curl'],
      alt: [['curl.exe', '-d', "'@request.json'", 'http://localhost:11434/api/chat']],
      hint: 'The chat endpoint. The @ tells curl.exe to send the file’s contents.',
      explain: 'There is no /api/stream: streaming is simply how /api/chat answers unless the body says "stream": false. Without the @, curl.exe would send the words request.json as the body.',
    },
    'L5.1': {
      kind: 'fill',
      prompt: 'What status does this misspelled model get?',
      code: `# request.json: {"model": "gemma-3", "messages": [{"role": "user", "content": "Hi"}]}\nPS> curl.exe -i http://localhost:11434/api/chat -d '@request.json'\nHTTP/1.1 ___\nContent-Type: application/json; charset=utf-8\nDate: Mon, 12 Oct 2026 10:14:09 GMT\nContent-Length: 37\n\n{"error":"model 'gemma-3' not found"}`,
      blanks: [
        {
          answer: ['404 Not Found'],
          options: ['404 Not Found', '200 OK', '500 Internal Server Error'],
        },
      ],
      hint: 'Nothing has streamed yet, and the model doesn’t exist.',
      explain: 'The check fails before any text is sent, so you get a real status and one JSON object with an error key, not a stream.',
    },
    'L5.6': {
      kind: 'type',
      prompt: 'Edit request.json so any failure comes back with a real HTTP status.',
      template: '{\n  "model": "llama3.2",\n  "prompt": "Describe a tide pool.",\n  ___\n}',
      accept: ['"stream": false'],
      hint: 'If nothing is sent until the end, the status can still change.',
      explain: 'With "stream": false nothing is sent until the reply is done, so even a mid-reply failure gets a real error status, like 500.',
    },
    'boss.5': {
      kind: 'fill',
      prompt: 'Which content type does each request get back?',
      code: '# A: request.json = {"model": "llama3.2", "prompt": "Hi", "stream": false}\n# B: request.json = {"model": "llama3.2", "prompt": "Hi"}\n# A replies as ___, B as ___',
      blanks: [
        { answer: ['application/json'], options: ['application/json', 'application/x-ndjson'] },
        { answer: ['application/x-ndjson'], options: ['application/x-ndjson', 'application/json'] },
      ],
      hint: 'Only one of them leaves streaming on.',
      explain: 'A turns streaming off, so it gets one JSON object. B streams by default: one JSON object per line.',
    },
    'boss.8': {
      kind: 'fix',
      prompt: 'Sending this request.json to /api/chat fails before streaming starts. Fix it.',
      code: `{"model": [["mistrall"]], "messages": [{"role": "user", "content": "Hi"}]}\n# PS> curl.exe http://localhost:11434/api/chat -d '@request.json'\n# {"error":"model 'mistrall' not found"}`,
      fix: '"mistral"',
      options: ['"mistral"', '"mistrall:latest"', '"Mistral 7B"'],
      hint: 'Read the error: which name doesn’t exist?',
      explain: 'An unknown model fails before any text, so you get a 404 and one error object. Adding :latest doesn’t fix a typo, and names can’t have spaces.',
    },
  },
};

export default unit;
