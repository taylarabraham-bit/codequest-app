import type { DesktopUnit } from '../../../engine/types';

// Desktop edition: write-the-code challenges for Ollama unit 5 (Chat & history).
// lessons[i] runs after lesson i + 1. See docs/CONTENT_GUIDE.md.

/** A JSON `"key": value` pair with any spacing (value is a regex source). */
const kv = (key: string, value: string) => `"${key}"\\s*:\\s*${value}`;
/** One flat message object with this role, and content matching `content`
 * (a regex source for the text after the opening quote). Keys in any order. */
const msg = (role: string, content = '[^"]+') =>
  `\\{(?=[^{}]*${kv('role', `"${role}"`)})(?=[^{}]*${kv('content', `"${content}`)})[^{}]*\\}`;
/** Messages that follow each other in the array. */
const then = (...parts: string[]) => parts.join('\\s*,\\s*');

const unit: DesktopUnit = {
  // Windows PowerShell versions of shared items (the phone keeps the originals):
  // curl.exe, and JSON bodies in request.json sent with -d '@request.json'.
  concepts: {
    1: {
      body: '/api/chat takes a messages array instead of a prompt. Each message has a role and content, and your question is a user message. Save the body as request.json and send it with curl.exe (plain curl is Invoke-WebRequest in Windows PowerShell); with "stream": false the reply text is in message.content.',
      code: '# request.json\n{"model": "llama3.2",\n "messages": [{"role": "user", "content": "Name a fruit."}],\n "stream": false}\nPS> curl.exe http://localhost:11434/api/chat -d \'@request.json\'',
    },
  },
  overrides: {
    'L1.1': {
      kind: 'fill',
      prompt: 'request.json holds a messages array. Pick the chat endpoint.',
      code: "curl.exe http://localhost:11434/api/___ -d '@request.json'",
      blanks: [{ answer: ['chat'], options: ['chat', 'generate', 'messages'] }],
      hint: 'It’s named after what you’re having with the model.',
      explain: '/api/chat reads a messages array. /api/generate wants a prompt instead, and there is no /api/messages endpoint.',
      output:
        '{"model":"llama3.2","created_at":"2026-10-12T09:14:03.512094Z","message":{"role":"assistant","content":"Yes. Botanically, a tomato is a fruit."},"done":true,"done_reason":"stop","total_duration":702418833,"load_duration":64512250,"prompt_eval_count":32,"prompt_eval_duration":118204000,"eval_count":12,"eval_duration":512930000}',
    },
    'L1.2': {
      kind: 'fill',
      prompt: 'Name the request.json key that holds the conversation.',
      code: '{\n  "model": "gemma3",\n  "___": [{"role": "user", "content": "Give me a pancake tip."}],\n  "stream": false\n}',
      blanks: [{ answer: ['messages'], options: ['messages', 'prompt', 'history'] }],
      hint: 'Plural: it holds a list of them.',
      explain: 'Chat reads a messages array. A prompt key is ignored here, so the request has no messages and you get an empty reply.',
      output:
        '{"model":"gemma3","created_at":"2026-10-12T09:15:47.20871Z","message":{"role":"assistant","content":"Let the batter rest for 10 minutes."},"done":true,"done_reason":"stop","total_duration":915304125,"load_duration":80113708,"prompt_eval_count":16,"prompt_eval_duration":140022000,"eval_count":11,"eval_duration":688517000}',
    },
    'L1.6': {
      kind: 'fill',
      prompt: 'Get one JSON object back.',
      code: '{\n  "model": "llama3.2",\n  "messages": [{"role": "user", "content": "One word for happy?"}],\n  "stream": ___\n}',
      blanks: [{ answer: ['false'], options: ['false', '"false"', '0'] }],
      hint: 'A JSON boolean has no quotes.',
      explain: 'stream needs a real boolean: "false" and 0 are rejected with a 400 error. Leave it out and the reply streams in many small pieces.',
      output:
        '{"model":"llama3.2","created_at":"2026-10-12T09:17:30.66403Z","message":{"role":"assistant","content":"Joyful."},"done":true,"done_reason":"stop","total_duration":298671042,"load_duration":59877125,"prompt_eval_count":31,"prompt_eval_duration":97361000,"eval_count":4,"eval_duration":139825000}',
    },
    'L4.2': {
      kind: 'fill',
      prompt: 'Pick a model in request.json that can see the photo.',
      code: '{\n  "model": "___",\n  "messages": [{"role": "user", "content": "Describe this.", "images": ["/9j/4AAQSkZJRg..."]}],\n  "stream": false\n}',
      blanks: [{ answer: ['llava'], options: ['llava', 'llama3.2', 'mistral'] }],
      hint: 'Which one would ollama show list with vision?',
      explain: 'ollama show llava lists the vision capability. llama3.2 and mistral are text-only, so they can’t read the photo.',
      output:
        '{"model":"llava","created_at":"2026-10-12T10:41:09.03312Z","message":{"role":"assistant","content":"A red bicycle leaning against a brick wall."},"done":true,"done_reason":"stop","total_duration":2104883917,"load_duration":1287410500,"prompt_eval_count":590,"prompt_eval_duration":512404000,"eval_count":12,"eval_duration":289011000}',
    },
    'boss.5': {
      kind: 'fix',
      prompt: 'This request.json gets an empty chat reply. Fix it.',
      code: '{\n  "model": "llama3.2",\n  [["prompt"]]: [{"role": "user", "content": "Plan a 20-minute workout."}],\n  "stream": false\n}',
      fix: '"messages"',
      options: ['"messages"', '"history"', '"content"'],
      hint: 'Chat doesn’t read the key /api/generate uses.',
      explain: '/api/chat ignores a prompt key, so it sees no messages: it just loads the model and returns an empty reply with done_reason load.',
    },
  },
  lessons: [
    // L1 The chat endpoint
    [
      {
        kind: 'write',
        prompt: 'Send one user message to /api/chat and get a single JSON reply.',
        starter: '# request.json\n\n# PowerShell\n',
        solution:
          '# request.json\n{\n  "model": "llama3.2",\n  "messages": [{"role": "user", "content": "Name a fruit that is high in iron."}],\n  "stream": false\n}\n# PowerShell\ncurl.exe http://localhost:11434/api/chat -d \'@request.json\'',
        checks: [
          { label: "POST it with curl.exe http://localhost:11434/api/chat -d '@request.json'", re: 'curl\\.exe (http://)?localhost:11434/api/chat (-d|--data) [\'"]?@request\\.json' },
          { label: 'A "messages" array', re: kv('messages', '\\[') },
          { label: 'A user message with content', re: msg('user') },
          { label: '"stream": false', re: kv('stream', 'false') },
          { label: 'No "prompt" field', not: '"prompt"' },
        ],
        hint: 'Chat takes messages, each with a role and content, instead of a prompt. -d \'@request.json\' sends the file.',
        explain: 'The reply is one JSON object, and the model’s text is in message.content.',
        output: '{"model":"llama3.2",…,"message":{"role":"assistant","content":"Dried apricots."},"done":true,…}',
      },
      {
        kind: 'write',
        prompt: 'Turn this generate request into a chat request, and note where the reply is.',
        starter:
          '# request.json\n{\n  "model": "gemma3",\n  "prompt": "Plan a 20-minute workout.",\n  "stream": false\n}\n# PowerShell\ncurl.exe http://localhost:11434/api/generate -d \'@request.json\'\n# reply text: response\n',
        solution:
          '# request.json\n{\n  "model": "gemma3",\n  "messages": [{"role": "user", "content": "Plan a 20-minute workout."}],\n  "stream": false\n}\n# PowerShell\ncurl.exe http://localhost:11434/api/chat -d \'@request.json\'\n# reply text: message.content',
        checks: [
          { label: 'Send it to /api/chat', re: 'curl\\.exe [^\\n]*localhost:11434/api/chat' },
          { label: 'The workout question as a user message', re: msg('user', 'Plan a 20-minute workout') },
          { label: 'No "prompt" field', not: '"prompt"' },
          { label: 'Keep "stream": false', re: kv('stream', 'false') },
          { label: 'Note the reply text is in message.content', re: '#[^\\n]*message\\.content' },
        ],
        hint: 'The prompt becomes the content of a message whose role is user.',
        explain: 'Same model, same question: chat wraps it in a messages array and replies with a message object.',
      },
    ],
    // L2 Message roles
    [
      {
        kind: 'write',
        prompt: 'Write the messages for a book recommender: a rule, then a question.',
        starter: '',
        solution:
          '"messages": [\n  {"role": "system", "content": "Recommend one book at a time, in one line."},\n  {"role": "user", "content": "A cosy mystery for a train ride?"}\n]',
        checks: [
          { label: 'A "messages" array', re: kv('messages', '\\[') },
          { label: 'A system message first', re: `"messages"\\s*:\\s*\\[\\s*${msg('system')}` },
          { label: 'Then a user message', re: then(msg('system'), msg('user')) },
        ],
        hint: 'Each message is {"role": …, "content": …}. Rules go first.',
        explain: 'The system message sets the rules for the whole chat, and the user message is the question.',
      },
      {
        kind: 'write',
        prompt: 'Fix the roles so this gardening chat makes sense.',
        starter:
          '"messages": [\n  {"role": "user", "content": "Only answer gardening questions."},\n  {"role": "system", "content": "When should I plant tulips?"},\n  {"role": "model", "content": "In autumn, before the first frost."},\n  {"role": "user", "content": "How deep?"}\n]\n',
        solution:
          '"messages": [\n  {"role": "system", "content": "Only answer gardening questions."},\n  {"role": "user", "content": "When should I plant tulips?"},\n  {"role": "assistant", "content": "In autumn, before the first frost."},\n  {"role": "user", "content": "How deep?"}\n]',
        checks: [
          { label: 'The rule is a system message', re: msg('system', 'Only answer gardening') },
          { label: 'The tulip question is a user message', re: msg('user', 'When should I plant tulips') },
          { label: 'The model’s answer is an assistant message', re: msg('assistant', 'In autumn') },
          { label: 'No "model" role', not: '"model"' },
          { label: 'Keep the order: system, user, assistant, user', re: then(msg('system'), msg('user'), msg('assistant'), msg('user')) },
        ],
        hint: 'Rules are system, the person is user, and the model’s own replies are assistant.',
        explain: 'Ollama has three roles. The model reads its earlier answers as assistant turns, so the follow-up makes sense.',
      },
    ],
    // L3 Multi-turn history
    [
      {
        kind: 'write',
        prompt: 'Continue the chat in request.json: add the model’s reply and a follow-up question.',
        starter:
          '{\n  "model": "llama3.2",\n  "messages": [\n    {"role": "user", "content": "Suggest a weekend hike near Denver."}\n  ],\n  "stream": false\n}\n# reply: "Try the Royal Arch trail in Boulder."\n',
        solution:
          '{\n  "model": "llama3.2",\n  "messages": [\n    {"role": "user", "content": "Suggest a weekend hike near Denver."},\n    {"role": "assistant", "content": "Try the Royal Arch trail in Boulder."},\n    {"role": "user", "content": "How long does it take?"}\n  ],\n  "stream": false\n}',
        checks: [
          { label: 'Keep the first user message', re: msg('user', 'Suggest a weekend hike') },
          { label: 'Add the reply as an assistant message', re: msg('assistant', 'Try the Royal Arch trail') },
          { label: 'Then a new user question', re: then(msg('assistant', 'Try the Royal Arch'), msg('user')) },
          { label: 'Hike, reply, follow-up, in that order', re: then(msg('user', 'Suggest'), msg('assistant'), msg('user')) },
        ],
        hint: 'The server forgets everything, so send the whole conversation again.',
        explain: 'Each call carries the full history: the model reads its own answer, then your follow-up.',
      },
      {
        kind: 'write',
        prompt: 'Write request.json for a trivia chat: the rules, one past exchange and the next question.',
        starter: '{\n',
        solution:
          '{\n  "model": "gemma3",\n  "messages": [\n    {"role": "system", "content": "You host a trivia quiz. One question at a time."},\n    {"role": "user", "content": "Start the quiz."},\n    {"role": "assistant", "content": "Which planet has the most moons?"},\n    {"role": "user", "content": "Saturn?"}\n  ],\n  "stream": false\n}',
        checks: [
          { label: 'A "model"', re: kv('model', '"[\\w.:/-]+"') },
          { label: 'System, user, assistant, then user', re: then(msg('system'), msg('user'), msg('assistant'), msg('user')) },
          { label: 'The new user question is last', re: `${msg('user')}\\s*\\]` },
          { label: '"stream": false', re: kv('stream', 'false') },
          { label: 'Close the object with }', re: '\\]\\s*,[\\s\\S]*\\}\\s*$' },
        ],
        hint: 'Four messages: the rules, your turn, the model’s turn, your next turn.',
        explain: 'The assistant turn is the model’s last answer, so it can judge “Saturn?” against its own question.',
      },
    ],
    // L4 Images in chat
    [
      {
        kind: 'write',
        prompt: 'Write request.json asking gemma3 the breed of the dog in a photo, sent as base64.',
        starter: '',
        solution:
          '{\n  "model": "gemma3",\n  "messages": [{\n    "role": "user",\n    "content": "What breed is this dog?",\n    "images": ["iVBORw0KGgoAAAANSUhEUgAA..."]\n  }],\n  "stream": false\n}',
        checks: [
          { label: 'A "model" with vision, such as gemma3', re: kv('model', '"[\\w.:/-]+"') },
          { label: 'A user message asking about the photo', re: msg('user') },
          { label: '"images" inside that user message', re: `\\{(?=[^{}]*${kv('role', '"user"')})[^{}]*"images"` },
          { label: 'images holds base64 text, not a file path', re: kv('images', '\\[\\s*"[A-Za-z0-9+/=]{8,}') },
        ],
        hint: 'images is a list of strings on the message itself, each the file’s bytes as base64.',
        explain: 'Vision models read the base64 picture alongside the text. In PowerShell, [Convert]::ToBase64String([IO.File]::ReadAllBytes("$PWD\\dog.jpg")) prints that text.',
        output: '{…,"message":{"role":"assistant","content":"It looks like a beagle."},"done":true,…}',
      },
      {
        kind: 'write',
        prompt: 'Check gemma3 can see, then ask about ./receipt.png at the >>> prompt.',
        starter: '',
        solution: 'ollama show gemma3\n# Capabilities: completion, vision\nollama run gemma3\n>>> What is the total on this receipt? ./receipt.png',
        checks: [
          { label: 'ollama show gemma3', re: '^\\s*ollama show gemma3(:\\w+)?\\s*$', flags: 'm' },
          { label: 'Note the vision capability in a comment', re: '#[^\\n]*vision' },
          { label: 'Open the chat with ollama run gemma3', re: '^\\s*ollama run gemma3(:\\w+)?\\s*$', flags: 'm' },
          { label: 'Ask at >>> with the path ./receipt.png', re: '^>>> .*\\.[/\\\\]receipt\\.png', flags: 'm' },
        ],
        hint: 'ollama show lists capabilities. At >>> a path starting with ./ gets attached.',
        explain: 'The CLI spots the image path in your message, reads the file and sends it as base64 for you.',
        output: 'Added image \'./receipt.png\'\nThe total is $23.40.',
      },
    ],
    // L5 Trimming history
    [
      {
        kind: 'write',
        prompt: 'The prompt nearly fills num_ctx. Drop the oldest exchange, keep the rules.',
        starter:
          '# num_ctx 2048, last prompt_eval_count 1990\n"messages": [\n  {"role": "system", "content": "You are a chess coach."},\n  {"role": "user", "content": "Explain the Sicilian."},\n  {"role": "assistant", "content": "It starts 1.e4 c5 and fights for d4."},\n  {"role": "user", "content": "And the Najdorf?"},\n  {"role": "assistant", "content": "It adds 5...a6 for flexibility."},\n  {"role": "user", "content": "Best plan for white?"}\n]\n',
        solution:
          '# num_ctx 2048, last prompt_eval_count 1990\n"messages": [\n  {"role": "system", "content": "You are a chess coach."},\n  {"role": "user", "content": "And the Najdorf?"},\n  {"role": "assistant", "content": "It adds 5...a6 for flexibility."},\n  {"role": "user", "content": "Best plan for white?"}\n]',
        checks: [
          { label: 'Keep the system message first', re: `"messages"\\s*:\\s*\\[\\s*${msg('system', 'You are a chess coach')}` },
          { label: 'Drop the oldest user turn', not: 'Explain the Sicilian' },
          { label: 'Drop its assistant reply', not: 'It starts 1.e4' },
          { label: 'Keep the rest in order', re: then(msg('system'), msg('user', 'And the Najdorf'), msg('assistant', 'It adds'), msg('user', 'Best plan')) },
        ],
        hint: 'Remove one user message and the assistant reply right after it, from the top of the chat.',
        explain: 'The oldest pair matters least, and the system message must stay at index 0 to keep the rules.',
      },
      {
        kind: 'write',
        prompt: 'This request.json trim dropped the rules. Restore them and drop the oldest pair instead.',
        starter:
          '# system was: "You are a Tokyo travel guide."\n{\n  "model": "llama3.2",\n  "messages": [\n    {"role": "user", "content": "Plan 2 days in Tokyo."},\n    {"role": "assistant", "content": "Day 1: Asakusa and Ueno..."},\n    {"role": "user", "content": "Add a sushi lunch."},\n    {"role": "assistant", "content": "Day 2: Tsukiji outer market..."},\n    {"role": "user", "content": "Where should I stay?"}\n  ],\n  "options": {"num_ctx": 4096},\n  "stream": false\n}\n',
        solution:
          '# system was: "You are a Tokyo travel guide."\n{\n  "model": "llama3.2",\n  "messages": [\n    {"role": "system", "content": "You are a Tokyo travel guide."},\n    {"role": "user", "content": "Add a sushi lunch."},\n    {"role": "assistant", "content": "Day 2: Tsukiji outer market..."},\n    {"role": "user", "content": "Where should I stay?"}\n  ],\n  "options": {"num_ctx": 4096},\n  "stream": false\n}',
        checks: [
          { label: 'The system message back at index 0', re: `"messages"\\s*:\\s*\\[\\s*${msg('system', 'You are a Tokyo travel guide')}` },
          { label: 'Drop the oldest user turn', not: 'Plan 2 days in Tokyo' },
          { label: 'Drop its assistant reply', not: 'Asakusa' },
          { label: 'Keep the newest question last', re: `${msg('user', 'Where should I stay')}\\s*\\]` },
          { label: 'Keep num_ctx 4096 in options', re: `"options"\\s*:\\s*\\{[^}]*${kv('num_ctx', '4096')}` },
        ],
        hint: 'The system message is never trimmed. The oldest user/assistant pair goes.',
        explain: 'Dropping the rules changes how the model behaves; dropping the oldest exchange only loses old detail.',
      },
    ],
  ],
};

export default unit;
