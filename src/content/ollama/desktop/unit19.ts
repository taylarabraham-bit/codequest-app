import type { DesktopUnit } from '../../../engine/types';

// Desktop edition: write-the-code challenges for Ollama unit 19 (Ollama from JavaScript & Python).
// lessons[i] runs after lesson i + 1. See docs/CONTENT_GUIDE.md.
const Q = '[\'"]'; // either quote style
const unit: DesktopUnit = {
  lessons: [
    // L1 The ollama package
    [
      {
        kind: 'write',
        prompt: 'In JavaScript, ask llama3.2 for a goldfish name and print the reply.',
        starter: '',
        solution:
          "import ollama from 'ollama'\n\nconst r = await ollama.chat({\n  model: 'llama3.2',\n  messages: [{ role: 'user', content: 'Give me a name for a goldfish.' }],\n})\nconsole.log(r.message.content)",
        checks: [
          { label: "import ollama from 'ollama'", re: `import\\s+ollama\\s+from\\s+${Q}ollama${Q}` },
          { label: 'await ollama.chat({ … })', re: 'await\\s+ollama\\.chat\\(\\s*\\{' },
          { label: 'A model name', re: `model:\\s*${Q}[^'"]+${Q}` },
          { label: 'A messages array with a user message', re: `messages:\\s*\\[\\s*\\{\\s*role:\\s*${Q}user${Q}` },
          { label: 'Print r.message.content', re: 'console\\.log\\(\\s*\\w+\\.message\\.content\\s*\\)' },
        ],
        hint: 'ollama.chat takes the same fields as /api/chat. It returns a promise, so await it.',
        explain: 'The library mirrors the REST API, so the reply has the same shape: the text is in message.content.',
        output: 'How about Bubbles? (sample reply)',
      },
      {
        kind: 'write',
        prompt: 'In Python, ask once, keep the reply, then ask a follow-up.',
        starter: "from ollama import chat\n\nmsgs = [{'role': 'user', 'content': 'Suggest a board game for 4 players.'}]\n",
        solution:
          "from ollama import chat\n\nmsgs = [{'role': 'user', 'content': 'Suggest a board game for 4 players.'}]\nr = chat(model='gemma3', messages=msgs)\nprint(r.message.content)\nmsgs.append({'role': 'assistant', 'content': r.message.content})\nmsgs.append({'role': 'user', 'content': 'Something under 30 minutes?'})\nr = chat(model='gemma3', messages=msgs)\nprint(r.message.content)",
        checks: [
          { label: 'Call chat(model=…, messages=msgs) twice', re: '(chat\\(\\s*model\\s*=[^)]*messages\\s*=\\s*msgs[\\s\\S]*){2}' },
          { label: 'Append the assistant reply', re: `msgs\\.append\\(\\s*(\\{\\s*${Q}role${Q}\\s*:\\s*${Q}assistant${Q}|\\w+\\.message\\s*\\))` },
          { label: 'Append a user follow-up', re: `msgs\\.append\\(\\s*\\{\\s*${Q}role${Q}\\s*:\\s*${Q}user${Q}` },
          { label: 'Print r.message.content', re: `print\\(\\s*\\w+(\\.message\\.content|\\[${Q}message${Q}\\]\\[${Q}content${Q}\\])` },
          { label: 'Follow-up after the first reply', re: `msgs\\.append\\(\\s*(\\{\\s*${Q}role${Q}\\s*:\\s*${Q}assistant${Q}|\\w+\\.message\\s*\\))[\\s\\S]*msgs\\.append\\(\\s*\\{\\s*${Q}role${Q}\\s*:\\s*${Q}user${Q}` },
        ],
        hint: 'In Python, chat(...) is a plain call. The history is just the list you pass in each time.',
        explain: 'The model has no memory: the follow-up only makes sense because the first answer is in msgs.',
        output: 'Ticket to Ride works well for four.\nTry Sushi Go!: about 15 minutes. (sample replies)',
      },
    ],
    // L2 Generate, embed & options
    [
      {
        kind: 'write',
        prompt: 'Generate a two-line rain poem at low temperature, keeping the model loaded 10m.',
        starter: "import ollama from 'ollama'\n",
        solution:
          "import ollama from 'ollama'\n\nconst g = await ollama.generate({\n  model: 'llama3.2',\n  prompt: 'Write a two-line poem about rain.',\n  options: { temperature: 0.2 },\n  keep_alive: '10m',\n})\nconsole.log(g.response)",
        checks: [
          { label: 'await ollama.generate({ … })', re: 'await\\s+ollama\\.generate\\(\\s*\\{' },
          { label: 'A prompt', re: `prompt:\\s*${Q}[^'"]+${Q}` },
          { label: 'options: { temperature: … } of 0.5 or lower', re: 'options:\\s*\\{[^}]*temperature:\\s*0(\\.[0-5]\\d*)?\\s*[,}]' },
          { label: "keep_alive: '10m'", re: `keep_alive:\\s*(${Q}10m${Q}|600)` },
          { label: 'Print g.response', re: 'console\\.log\\(\\s*\\w+\\.response\\s*\\)' },
        ],
        hint: 'generate returns its text in response, not message.content. options and keep_alive work as in REST.',
        explain: 'Same fields as /api/generate: options tunes sampling and keep_alive decides when the model unloads.',
        output: 'Soft rain on the window,\nthe street hums a silver tune. (sample reply)',
      },
      {
        kind: 'write',
        prompt: 'In Python, embed three phrases in one call and compare the first to the others.',
        starter: "import ollama\n\nphrases = ['refund', 'money back', 'shipping time']\n",
        solution:
          "import ollama\n\nphrases = ['refund', 'money back', 'shipping time']\ne = ollama.embed(model='embeddinggemma', input=phrases)\na, b, c = e.embeddings\n\ndef cosine(x, y):\n    dot = sum(p * q for p, q in zip(x, y))\n    return dot / (sum(p * p for p in x) ** 0.5 * sum(q * q for q in y) ** 0.5)\n\nprint(round(cosine(a, b), 2), round(cosine(a, c), 2))",
        checks: [
          { label: 'One ollama.embed call with input=the list', re: 'ollama\\.embed\\([^)]*input\\s*=\\s*phrases' },
          { label: 'An embedding model', re: `model\\s*=\\s*${Q}(embeddinggemma|nomic-embed-text|mxbai-embed-large|all-minilm|bge-m3|qwen3-embedding|snowflake-arctic-embed)` },
          { label: 'Read the vectors from .embeddings', re: '\\.embeddings\\b' },
          { label: 'A dot product with zip', re: 'zip\\(' },
          { label: 'Print the two similarities', re: 'print\\(' },
        ],
        hint: 'input takes a list and you get one vector per item, in order, in embeddings.',
        explain: '“refund” should sit closer to “money back” than to “shipping time”: that is what search over embeddings relies on.',
        output: '0.82 0.41 (sample)',
      },
    ],
    // L3 Streaming & hosts
    [
      {
        kind: 'write',
        prompt: 'Stream a reply from the Ollama server on gpu-box, printing chunks as they arrive.',
        starter: '',
        solution:
          "import { Ollama } from 'ollama'\n\nconst client = new Ollama({ host: 'http://gpu-box:11434' })\nconst stream = await client.chat({\n  model: 'qwen3',\n  messages: [{ role: 'user', content: 'Explain DNS in three sentences.' }],\n  stream: true,\n})\nfor await (const part of stream) {\n  process.stdout.write(part.message.content)\n}",
        checks: [
          { label: "import { Ollama } from 'ollama'", re: `import\\s*\\{\\s*Ollama\\s*\\}\\s*from\\s*${Q}ollama${Q}` },
          { label: 'new Ollama({ host }) pointing at gpu-box', re: `new\\s+Ollama\\(\\s*\\{\\s*host:\\s*${Q}(https?://)?gpu-box(:\\d+)?/?${Q}` },
          { label: 'stream: true', re: 'stream:\\s*true' },
          { label: 'Loop with for await', re: 'for\\s+await\\s*\\(\\s*const\\s+\\w+\\s+of\\s+\\w+\\s*\\)' },
          { label: 'Write each part.message.content', re: 'process\\.stdout\\.write\\(\\s*\\w+\\.message\\.content\\s*\\)' },
        ],
        hint: 'The default export talks to localhost. For another server, make your own client with a host.',
        explain: 'With stream: true the call returns an async iterator; each chunk holds the next bit of message.content.',
      },
      {
        kind: 'write',
        prompt: 'Fix the stream, print it on one line, and save the full reply to msgs.',
        starter:
          "from ollama import Client\n\nclient = Client(host='http://10.0.0.5:11434')\nmsgs = [{'role': 'user', 'content': 'Give me a 3-step stretching routine.'}]\nfor chunk in client.chat(model='llama3.2', messages=msgs, stream=False):\n    print(chunk.message.content)\n",
        solution:
          "from ollama import Client\n\nclient = Client(host='http://10.0.0.5:11434')\nmsgs = [{'role': 'user', 'content': 'Give me a 3-step stretching routine.'}]\nfull = ''\nfor chunk in client.chat(model='llama3.2', messages=msgs, stream=True):\n    print(chunk.message.content, end='', flush=True)\n    full += chunk.message.content\nmsgs.append({'role': 'assistant', 'content': full})",
        checks: [
          { label: 'stream=True', has: 'stream=True' },
          { label: 'No stream=False', not: 'stream=False' },
          { label: "print(…, end='') so chunks join up", re: `print\\(\\s*\\w+\\.message\\.content\\s*,\\s*end\\s*=\\s*(''|"")` },
          { label: 'Collect the chunks into one string', re: '\\w+\\s*\\+=\\s*\\w+\\.message\\.content|\\.append\\(\\s*\\w+\\.message\\.content\\s*\\)' },
          { label: 'Append the full reply as the assistant', re: `msgs\\.append\\(\\s*\\{\\s*${Q}role${Q}\\s*:\\s*${Q}assistant${Q}` },
        ],
        hint: 'Each chunk holds only a piece of the text. print adds a newline unless you pass end.',
        explain: 'Streaming shows text at once; collecting it gives you the whole reply for the next turn.',
        output: '1. Neck rolls, 30 seconds. 2. Shoulder shrugs, 10 reps. 3. Hamstring stretch, 30 seconds a side. (sample reply)',
      },
    ],
    // L4 Schemas & tools
    [
      {
        kind: 'write',
        prompt: 'In Python, get a book recommendation as a validated pydantic object.',
        starter: '',
        solution:
          "from ollama import chat\nfrom pydantic import BaseModel\n\nclass Book(BaseModel):\n    title: str\n    author: str\n    year: int\n\nr = chat(model='gemma3',\n         messages=[{'role': 'user', 'content': 'Recommend one classic sci-fi novel.'}],\n         format=Book.model_json_schema())\nbook = Book.model_validate_json(r.message.content)\nprint(book.title, book.year)",
        checks: [
          { label: 'A class that extends BaseModel', re: 'class\\s+\\w+\\(\\s*BaseModel\\s*\\)\\s*:' },
          { label: 'An int field', re: '^\\s+\\w+\\s*:\\s*int\\b', flags: 'm' },
          { label: 'format=YourModel.model_json_schema()', re: 'class\\s+(\\w+)\\(\\s*BaseModel[\\s\\S]*format\\s*=\\s*\\1\\.model_json_schema\\(\\)' },
          { label: 'Parse with model_validate_json(r.message.content)', re: 'class\\s+(\\w+)\\(\\s*BaseModel[\\s\\S]*\\1\\.model_validate_json\\(\\s*\\w+\\.message\\.content\\s*\\)' },
        ],
        hint: 'One class gives you both halves: the schema to send and the parser for the reply.',
        explain: 'The schema forces the shape and validation checks it, so book.year is a real int.',
        output: 'Dune 1965 (sample)',
      },
      {
        kind: 'write',
        prompt: 'Make this zod extraction work: send the schema, then parse the JSON.',
        starter:
          "import ollama from 'ollama'\nimport { z } from 'zod'\n\nconst Event = z.object({ name: z.string(), date: z.string(), seats: z.number() })\nconst r = await ollama.chat({\n  model: 'gemma3',\n  messages: [{ role: 'user', content: 'Extract the event: \"Jazz night, 12 March, 80 seats.\"' }],\n})\nconst event = Event.parse(r.message.content)\n",
        solution:
          "import ollama from 'ollama'\nimport { z } from 'zod'\n\nconst Event = z.object({ name: z.string(), date: z.string(), seats: z.number() })\nconst r = await ollama.chat({\n  model: 'gemma3',\n  messages: [{ role: 'user', content: 'Extract the event: \"Jazz night, 12 March, 80 seats.\"' }],\n  format: z.toJSONSchema(Event),\n})\nconst event = Event.parse(JSON.parse(r.message.content))\nconsole.log(event.seats)",
        checks: [
          { label: 'format: z.toJSONSchema(Event)', re: 'format:\\s*z\\.toJSONSchema\\(\\s*Event\\s*\\)' },
          { label: 'JSON.parse the content first', re: 'Event\\.parse\\(\\s*JSON\\.parse\\(\\s*\\w+\\.message\\.content\\s*\\)\\s*\\)' },
          { label: 'Don’t parse the raw string', not: 'Event.parse(r.message.content)' },
          { label: 'Use a typed field', re: 'event\\.(name|date|seats)' },
        ],
        hint: 'message.content is a string of JSON. The zod schema checks objects, not strings.',
        explain: 'The JSON schema steers the model; zod then checks the parsed object really matches.',
        output: '80 (sample)',
      },
    ],
    // L5 The OpenAI-compatible API
    [
      {
        kind: 'write',
        prompt: 'Use the openai Python client against local Ollama.',
        starter: '',
        solution:
          "from openai import OpenAI\n\nclient = OpenAI(base_url='http://localhost:11434/v1', api_key='ollama')\nr = client.chat.completions.create(\n    model='llama3.2',\n    messages=[{'role': 'user', 'content': 'Name three uses for a paperclip.'}],\n)\nprint(r.choices[0].message.content)",
        checks: [
          { label: 'from openai import OpenAI', re: 'from\\s+openai\\s+import\\s+OpenAI' },
          { label: "base_url ending in /v1", re: `base_url\\s*=\\s*${Q}http://(localhost|127\\.0\\.0\\.1):11434/v1/?${Q}` },
          { label: 'Any non-empty api_key', re: `api_key\\s*=\\s*${Q}[^'"]+${Q}` },
          { label: 'client.chat.completions.create(…)', re: '\\w+\\.chat\\.completions\\.create\\(' },
          { label: 'Print r.choices[0].message.content', re: '\\.choices\\[0\\]\\.message\\.content' },
        ],
        hint: 'The client insists on an api_key; Ollama ignores it. The reply uses OpenAI’s shape.',
        explain: 'Code written for OpenAI runs locally by changing two arguments.',
        output: 'Hold papers, reset a router, make a tiny hook. (sample reply)',
      },
      {
        kind: 'write',
        prompt: 'Port this JavaScript from the ollama package to the openai client.',
        starter:
          "import ollama from 'ollama'\n\nconst r = await ollama.chat({\n  model: 'qwen3',\n  messages: [{ role: 'user', content: 'Translate \"good morning\" to Italian.' }],\n})\nconsole.log(r.message.content)",
        solution:
          "import OpenAI from 'openai'\n\nconst client = new OpenAI({ baseURL: 'http://localhost:11434/v1', apiKey: 'ollama' })\nconst r = await client.chat.completions.create({\n  model: 'qwen3',\n  messages: [{ role: 'user', content: 'Translate \"good morning\" to Italian.' }],\n})\nconsole.log(r.choices[0].message.content)",
        checks: [
          { label: "import OpenAI from 'openai'", re: `import\\s+OpenAI\\s+from\\s+${Q}openai${Q}` },
          { label: 'baseURL ending in /v1', re: `baseURL:\\s*${Q}http://(localhost|127\\.0\\.0\\.1):11434/v1/?${Q}` },
          { label: 'An apiKey', re: `apiKey:\\s*${Q}[^'"]+${Q}` },
          { label: 'await client.chat.completions.create', re: 'await\\s+\\w+\\.chat\\.completions\\.create\\(' },
          { label: 'Print r.choices[0].message.content', re: 'console\\.log\\(\\s*\\w+\\.choices\\[0\\]\\.message\\.content\\s*\\)' },
          { label: 'No ollama.chat left', not: 'ollama.chat(' },
        ],
        hint: 'In JavaScript the options are camelCase: baseURL and apiKey. Messages keep the same shape.',
        explain: 'Same model, same messages; only the client and the reply shape (choices[0]) change.',
        output: 'Buongiorno (sample reply)',
      },
    ],
  ],
};

export default unit;
