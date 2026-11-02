import type { DesktopUnit } from '../../../engine/types';

// Desktop edition: write-the-code challenges for Ollama unit 12 (Running Ollama in production).
// lessons[i] runs after lesson i + 1. See docs/CONTENT_GUIDE.md.

/** A quoted -d '@file.json' argument (PowerShell needs the quotes around @). */
const fileArg = `(-d|--data(-binary)?)\\s+(['"])@[\\w.\\\\/:-]+\\.json\\3`;

/** A user variable saved with setx or [Environment]::SetEnvironmentVariable. */
const userVar = (name: string, value: string) =>
  `setx\\s+${name}\\s+(["']?)${value}\\1(\\s|$)|SetEnvironmentVariable\\(\\s*(["'])${name}\\3\\s*,\\s*(["'])${value}\\4\\s*,\\s*(["'])User\\5\\s*\\)`;

const unit: DesktopUnit = {
  // Windows PowerShell versions of shared items (the phone keeps the originals).
  // Settings on the learner's PC: setx + restart Ollama from the tray; checks from
  // the PC: curl.exe with the body in a file. systemd, nginx and the Docker GPU
  // host stay Linux (see linuxOk).
  concepts: {
    1: {
      body: 'ollama serve reads its settings from OLLAMA_* environment variables when it starts. OLLAMA_HOST sets the address, OLLAMA_KEEP_ALIVE the default time a model stays loaded and OLLAMA_MODELS where models are stored. On your Windows PC, save them as user variables with setx (or search Start for “environment variables”), then quit Ollama from the system tray and start it again. On a Linux server the installer runs a systemd service, so set them with systemctl edit.',
      code: '# your Windows PC\nPS> setx OLLAMA_HOST 0.0.0.0:11434\nSUCCESS: Specified value was saved.\nPS> setx OLLAMA_KEEP_ALIVE 30m\n# then quit Ollama from the tray and start it again\n\n# a Linux server\nsudo systemctl edit ollama.service\n[Service]\nEnvironment="OLLAMA_HOST=0.0.0.0:11434"\nEnvironment="OLLAMA_KEEP_ALIVE=30m"\nsudo systemctl restart ollama',
    },
    2: {
      body: "keep_alive on a request overrides OLLAMA_KEEP_ALIVE for that model. A request with a model and no prompt just loads it, so the first user doesn’t wait; keep_alive 0 unloads it. ollama ps, or GET /api/ps, shows what’s in memory. On Windows, type curl.exe (in Windows PowerShell, plain curl is Invoke-WebRequest) and keep the body in a file sent with -d '@file.json'.",
      code: `# preload and pin gemma3\n# request.json: {"model": "gemma3", "keep_alive": -1}\nPS> curl.exe http://localhost:11434/api/generate -d '@request.json'\n# unload it\n# request.json: {"model": "gemma3", "keep_alive": 0}\nPS> curl.exe http://localhost:11434/api/generate -d '@request.json'`,
    },
    3: {
      body: 'OLLAMA_NUM_PARALLEL sets how many requests one model answers at once, and each gets its own context, so memory grows with it. OLLAMA_MAX_LOADED_MODELS caps how many models stay loaded together; extra requests wait in a queue of OLLAMA_MAX_QUEUE. OLLAMA_CONTEXT_LENGTH sets the default context; num_ctx overrides it per request. On Windows, save them with setx and restart Ollama from the tray.',
      code: 'PS> setx OLLAMA_NUM_PARALLEL 4\nPS> setx OLLAMA_MAX_LOADED_MODELS 2\nPS> setx OLLAMA_CONTEXT_LENGTH 8192\n# then quit Ollama from the system tray and start it again',
    },
    4: {
      body: 'On the Linux GPU server, the ollama/ollama image runs ollama serve on port 11434. Mount a volume at /root/.ollama so models survive the container, and add --gpus=all (with the NVIDIA Container Toolkit) to use the GPU. Run CLI commands inside it with docker exec.',
      code: 'docker run -d --gpus=all -v ollama:/root/.ollama \\\n  -p 11434:11434 --name ollama ollama/ollama\ndocker exec -it ollama ollama run llama3.2',
    },
  },
  overrides: {
    'L1.1': {
      kind: 'build',
      prompt: 'On your PC, keep models loaded for an hour by default.',
      answer: ['setx', 'OLLAMA_KEEP_ALIVE', '1h'],
      distractors: ['OLLAMA_KEEPALIVE', '--keepalive'],
      hint: 'setx, the variable name, then the value. Mind the underscore between KEEP and ALIVE.',
      explain: 'setx saves a user variable; quit Ollama from the tray and start it again so the server reads it. A misspelt name is silently ignored.',
    },
    'L1.2': {
      kind: 'fill',
      prompt: 'Make your PC’s Ollama listen on every interface, on port 8000.',
      code: 'setx OLLAMA_HOST ___\n# then quit Ollama from the tray and start it again',
      blanks: [
        {
          answer: ['0.0.0.0:8000'],
          options: ['0.0.0.0:8000', '127.0.0.1:8000', 'localhost:8000'],
        },
      ],
      hint: 'Which address means all interfaces?',
      explain: 'OLLAMA_HOST takes host and port together. 0.0.0.0 listens on every interface; 127.0.0.1 and localhost only accept this machine.',
    },
    'L1.3': {
      kind: 'fill',
      prompt: 'Store models on the big D: drive.',
      code: 'setx ___ D:\\ollama-models\n# then quit Ollama from the tray and start it again',
      blanks: [
        {
          answer: ['OLLAMA_MODELS'],
          options: ['OLLAMA_MODELS', 'OLLAMA_HOME', 'OLLAMA_PATH'],
        },
      ],
      hint: 'Named after what lives in the folder.',
      explain:
        'OLLAMA_MODELS moves the model store away from %USERPROFILE%\\.ollama\\models, handy when C: is small. Models already downloaded stay in the old folder.',
    },
    'L1.6': {
      kind: 'fill',
      prompt: 'Never unload models by default on your PC.',
      code: '[Environment]::SetEnvironmentVariable("OLLAMA_KEEP_ALIVE", "___", "User")\n# then quit Ollama from the tray and start it again',
      blanks: [{ answer: ['-1'], options: ['-1', '0', 'forever'] }],
      hint: 'Any negative number does it.',
      explain:
        'This saves the same user variable setx does. A negative keep-alive keeps models in memory until you stop them; 0 is the opposite: unload right after each reply.',
    },
    'L1.7': {
      kind: 'fill',
      prompt: 'See what’s loaded on the gpu-box server.',
      code: '$env:OLLAMA_HOST = "gpu-box:11434"\nollama ___',
      blanks: [{ answer: ['ps'], options: ['ps', 'serve', 'show'] }],
      hint: 'The CLI is only a client.',
      explain:
        'Every ollama command but serve talks to a server, and OLLAMA_HOST tells it which one. $env: sets it for this PowerShell window only, so ps lists gpu-box’s loaded models.',
    },
    'L2.1': {
      kind: 'fill',
      prompt: 'What does a prompt-less request do?',
      code: `# body, saved as request.json: {"model": "qwen3"}\nPS> curl.exe http://localhost:11434/api/generate -d '@request.json'\n# with no prompt, this ___ the model`,
      blanks: [{ answer: ['loads'], options: ['loads', 'pulls', 'deletes'] }],
      hint: 'It needs the model on disk already.',
      explain: 'An empty request loads the model into memory and returns at once, so the first real request skips the load time.',
      output: '{"model":"qwen3","created_at":"2026-10-20T07:58:02.11439Z","response":"","done":true,"done_reason":"load"}',
    },
    'L2.5': {
      kind: 'build',
      prompt: 'List loaded models over HTTP.',
      answer: ['curl.exe', 'http://localhost:11434/api/ps'],
      distractors: ['http://localhost:11434/api/tags', '-d'],
      hint: 'Same name as the CLI command.',
      explain: '/api/ps is what ollama ps calls: each loaded model with its memory use and expires_at. /api/tags lists models on disk.',
      output:
        '{"models":[{"name":"gemma3:latest","model":"gemma3:latest","size":6169209344,"digest":"a2af6cc3eb7fa8be8504abaf9b04e88f17a119ec3f04a3addf55f92841195f5a","expires_at":"2026-10-20T08:35:12.4410213Z","size_vram":6169209344,"context_length":8192}]}',
    },
    'L2.6': {
      kind: 'fill',
      prompt: 'When does gemma3 unload here?',
      code: `{"model": "gemma3", "prompt": "Hi", "keep_alive": "5m"}\n# server default: OLLAMA_KEEP_ALIVE is 24h\n# PS> curl.exe http://localhost:11434/api/generate -d '@request.json'\n# gemma3 unloads after ___`,
      blanks: [
        {
          answer: ['5 minutes'],
          options: ['5 minutes', '24 hours', '24 hours and 5 minutes'],
        },
      ],
      hint: 'The most specific setting wins.',
      explain: 'A request’s keep_alive overrides the server default for that model. The next request resets the timer again.',
    },
    'L3.1': {
      kind: 'build',
      prompt: 'Let each model answer four requests at once.',
      answer: ['setx', 'OLLAMA_NUM_PARALLEL', '4'],
      distractors: ['OLLAMA_PARALLEL', '--parallel'],
      hint: 'NUM, then PARALLEL.',
      explain: 'After you restart Ollama from the tray, four users get tokens at the same time instead of waiting in line, at the cost of more memory.',
    },
    'L3.2': {
      kind: 'fill',
      prompt: 'Keep a chat and an embedding model loaded together.',
      code: '# chat: gemma3, embeddings: nomic-embed-text\nsetx OLLAMA_MAX_LOADED_MODELS ___',
      blanks: [{ answer: ['2'] }],
      hint: 'Count the models.',
      explain: 'With room for 2, a RAG app can embed and chat without swapping models in and out on every question.',
    },
    'L3.3': {
      kind: 'fill',
      prompt: 'How many tokens of context get memory?',
      code: 'PS> setx OLLAMA_CONTEXT_LENGTH 8192\nPS> setx OLLAMA_NUM_PARALLEL 4\n# after restarting Ollama: memory for ___ tokens of context per loaded model',
      blanks: [{ answer: ['32768'], options: ['32768', '8192', '2048'] }],
      hint: 'Every parallel slot has its own window.',
      explain: '4 slots × 8192 tokens = 32768 tokens of KV cache. If ollama ps shows a CPU/GPU split, lower one of the two.',
    },
    'L3.5': {
      kind: 'fix',
      prompt: 'The default context didn’t change. Fix the variable.',
      code: 'setx [[OLLAMA_NUM_CTX]] 16384',
      fix: 'OLLAMA_CONTEXT_LENGTH',
      options: ['OLLAMA_CONTEXT_LENGTH', 'OLLAMA_CTX', 'OLLAMA_MAX_CONTEXT'],
      hint: 'num_ctx is the request option; the variable has a longer name.',
      explain: 'Unknown OLLAMA_* names are ignored without a warning. OLLAMA_CONTEXT_LENGTH sets the default; num_ctx in options still wins per request.',
    },
    'L3.7': {
      kind: 'build',
      prompt: 'Halve context memory with a q8_0 KV cache.',
      answer: ['setx OLLAMA_FLASH_ATTENTION 1', ';', 'setx OLLAMA_KV_CACHE_TYPE q8_0'],
      distractors: ['setx OLLAMA_KV_CACHE_TYPE q2', '--flash'],
      hint: 'The quantised cache needs flash attention on. ; separates two commands.',
      explain:
        'q8_0 stores the KV cache at 8 bits instead of 16, so the same memory holds about twice the context. It only applies with flash attention, once Ollama is restarted from the tray.',
      alt: [['setx OLLAMA_KV_CACHE_TYPE q8_0', ';', 'setx OLLAMA_FLASH_ATTENTION 1']],
    },
    'L5.1': {
      kind: 'fill',
      prompt: 'Check the server is alive.',
      code: 'curl.exe -f http://localhost:11434/api/___',
      blanks: [{ answer: ['version'], options: ['version', 'health', 'status'] }],
      hint: 'The endpoint tells you which release is running.',
      explain: 'Ollama has no /health endpoint. /api/version is tiny and touches no model, and -f makes curl.exe fail on an HTTP error.',
      output: '{"version":"0.40.3"}',
    },
    'L5.2': {
      kind: 'fill',
      prompt: 'List just the names of the models on disk.',
      code: '(curl.exe -s http://localhost:11434/api/tags | ConvertFrom-Json).models.___',
      blanks: [{ answer: ['name'], options: ['name', 'id', 'tag'] }],
      hint: 'The same column ollama list shows first.',
      explain:
        'ConvertFrom-Json turns the reply into objects, and .models.name collects every name. A deploy script can pull any model missing from this list.',
      output: 'gemma3:latest\nnomic-embed-text:latest',
    },
    'L5.4': {
      kind: 'order',
      prompt: 'Add a login to the nginx proxy on the server, then test it from your PC.',
      lines: [
        'sudo htpasswd -c /etc/nginx/.htpasswd alice',
        'sudo nginx -t',
        'sudo systemctl reload nginx',
        'curl.exe -u alice https://ai.example.com/api/version',
      ],
      hint: 'Create the user, test the config, reload, then try it.',
      explain: 'nginx -t catches config mistakes before reload. curl.exe -u prompts for alice’s password and sends it as basic auth over TLS.',
      output: 'Enter host password for user \'alice\':\n{"version":"0.40.3"}',
    },
    'L5.6': {
      kind: 'type',
      prompt: 'On your PC, allow the web app at https://notes.example.com.',
      accept: [
        'setx OLLAMA_ORIGINS https://notes.example.com',
        'setx OLLAMA_ORIGINS "https://notes.example.com"',
        "setx OLLAMA_ORIGINS 'https://notes.example.com'",
      ],
      hint: 'setx, the variable for browser origins, then the URL.',
      explain:
        'Browsers send an Origin header and Ollama only answers allowed ones; separate several origins with commas. Restart Ollama from the tray to apply it.',
    },
    'boss.1': {
      kind: 'type',
      prompt: 'Give your PC’s Ollama a one-day default keep-alive.',
      accept: ['setx OLLAMA_KEEP_ALIVE 24h', 'setx OLLAMA_KEEP_ALIVE "24h"', "setx OLLAMA_KEEP_ALIVE '24h'"],
      hint: 'setx, the variable, then the value. Count in hours.',
      explain:
        'Once you quit Ollama from the tray and start it again, every model stays loaded 24 hours after its last request unless a request sets its own keep_alive.',
    },
    'boss.4': {
      kind: 'fill',
      prompt: 'Two requests per model, up to three models.',
      code: 'setx ___ 2\nsetx ___ 3\n# then quit Ollama from the tray and start it again',
      blanks: [
        {
          answer: ['OLLAMA_NUM_PARALLEL'],
          options: ['OLLAMA_NUM_PARALLEL', 'OLLAMA_MAX_LOADED_MODELS', 'OLLAMA_MAX_QUEUE'],
        },
        {
          answer: ['OLLAMA_MAX_LOADED_MODELS'],
          options: ['OLLAMA_MAX_LOADED_MODELS', 'OLLAMA_NUM_PARALLEL', 'OLLAMA_MAX_QUEUE'],
        },
      ],
      hint: 'One counts requests, the other counts models.',
      explain: 'NUM_PARALLEL is per model and MAX_LOADED_MODELS is per server. Up to 6 requests can be answered at once, each slot needing context memory.',
    },
    'boss.5': {
      kind: 'build',
      prompt: 'request.json holds {"model": "gemma3", "keep_alive": 0}. Unload gemma3 over HTTP.',
      answer: ['curl.exe', 'http://localhost:11434/api/generate', '-d', "'@request.json'"],
      distractors: ['http://localhost:11434/api/delete', "'request.json'"],
      hint: 'Same endpoint as a reply; the @ sends the file’s contents.',
      explain: '/api/delete would remove the model from disk. keep_alive 0 only frees its memory, just like ollama stop.',
      alt: [['curl.exe', '-d', "'@request.json'", 'http://localhost:11434/api/generate']],
      output: '{"model":"gemma3","created_at":"2026-10-20T10:02:16.70412Z","response":"","done":true,"done_reason":"unload"}',
    },
    'boss.8': {
      kind: 'type',
      prompt: 'Health-check localhost so HTTP errors fail.',
      accept: [
        'curl.exe -f http://localhost:11434/api/version',
        'curl.exe --fail http://localhost:11434/api/version',
        'curl.exe -sf http://localhost:11434/api/version',
        'curl.exe -fs http://localhost:11434/api/version',
        'curl.exe -f localhost:11434/api/version',
      ],
      hint: 'curl.exe, the fail flag, then the version endpoint.',
      explain: 'Without -f, curl.exe exits 0 even on a 500. With it, a broken server fails the check so a monitor or orchestrator can act.',
    },
    'boss.9': {
      kind: 'fill',
      prompt: 'Does OLLAMA_ORIGINS stop this curl.exe from your PC?',
      code: '# server: OLLAMA_HOST=0.0.0.0:11434 OLLAMA_ORIGINS=https://app.example.com\ncurl.exe http://gpu-box:11434/api/tags\n# result: ___',
      blanks: [
        {
          answer: ['the model list'],
          options: ['the model list', '403 Forbidden', '401 Unauthorized'],
        },
      ],
      hint: 'CORS is enforced by browsers.',
      explain:
        'curl.exe sends no Origin header, so CORS never applies. OLLAMA_ORIGINS isn’t auth; only a proxy with a login, or a firewall, keeps strangers out.',
      output: '{"models":[{"name":"gemma3:latest","model":"gemma3:latest", ...}]}',
    },
  },
  linuxOk: {
    'L4.concept': 'docker run on the Linux GPU server (NVIDIA Container Toolkit)',
    'L4.4': 'Compose stack on the Linux server; the curl check runs on that host',
    'boss.3': 'Compose stack on the Linux server; the preload curl runs on that host',
    'L5.W2': 'docker run and the curl health checks run on the Linux server (the port is bound to its 127.0.0.1)',
  },
  lessons: [
    // L1 Configuring the server
    [
      {
        kind: 'write',
        prompt: 'On the Linux server, write a systemd override: LAN access, 1h keep-alive, models on /data.',
        starter: '',
        solution: '[Service]\nEnvironment="OLLAMA_HOST=0.0.0.0:11434"\nEnvironment="OLLAMA_KEEP_ALIVE=1h"\nEnvironment="OLLAMA_MODELS=/data/ollama"',
        checks: [
          {
            label: 'Start with a [Service] section',
            re: '^\\s*\\[Service\\]',
            flags: 'm',
          },
          {
            label: 'Environment="OLLAMA_HOST=…" on all interfaces',
            re: 'Environment="OLLAMA_HOST=0\\.0\\.0\\.0(:\\d+)?"',
          },
          {
            label: 'Environment="OLLAMA_KEEP_ALIVE=1h"',
            re: 'Environment="OLLAMA_KEEP_ALIVE=(1h|60m|3600s?)"',
          },
          {
            label: 'Environment="OLLAMA_MODELS=/data/…"',
            re: 'Environment="OLLAMA_MODELS=/data(/[^"]*)?"',
          },
        ],
        hint: 'One Environment="NAME=value" line per variable, under [Service]. Save it with sudo systemctl edit ollama.service.',
        explain: 'ollama serve reads OLLAMA_* variables at start, so restart the service after editing. The ollama user must own the new models folder.',
      },
      {
        kind: 'write',
        prompt: 'Serve on port 11500 with a 10-minute keep-alive, then list models from it.',
        starter: '# PowerShell window 1\nollama serve\n# PowerShell window 2\nollama list',
        solution:
          '# PowerShell window 1\n$env:OLLAMA_HOST = "127.0.0.1:11500"\n$env:OLLAMA_KEEP_ALIVE = "10m"\nollama serve\n# PowerShell window 2\n$env:OLLAMA_HOST = "127.0.0.1:11500"\nollama list',
        checks: [
          {
            label: 'Set $env:OLLAMA_HOST to port 11500, then ollama serve',
            re: `\\$env:OLLAMA_HOST\\s*=\\s*(["'])[\\w.-]*:11500\\1[\\s\\S]*ollama serve`,
          },
          {
            label: 'Set $env:OLLAMA_KEEP_ALIVE to 10m before ollama serve',
            re: `\\$env:OLLAMA_KEEP_ALIVE\\s*=\\s*(["'])(10m|600s?)\\1[\\s\\S]*ollama serve`,
          },
          {
            label: 'Point ollama list at the same port',
            re: `ollama serve[\\s\\S]*\\$env:OLLAMA_HOST\\s*=\\s*(["'])[\\w.-]*:11500\\1[\\s\\S]*ollama list`,
          },
        ],
        hint: '$env:NAME = "value" sets a variable for this PowerShell window only. The CLI also reads OLLAMA_HOST to find the server.',
        explain:
          'The tray app keeps serving on 11434; this second server uses 11500. The CLI is a client, so without OLLAMA_HOST it would ask the one on 11434.',
        output: 'NAME               ID              SIZE      MODIFIED\nllama3.2:latest    a80c4f17acd5    2.0 GB    3 days ago',
      },
    ],
    // L2 Loading & unloading
    [
      {
        kind: 'write',
        prompt: 'Preload llama3.2 so it never unloads, then unload it at closing time.',
        starter: '',
        solution:
          '# morning: preload and pin\n\'{"model": "llama3.2", "keep_alive": -1}\' | Set-Content preload.json\ncurl.exe http://localhost:11434/api/generate -d \'@preload.json\'\n# closing time: unload\n\'{"model": "llama3.2", "keep_alive": 0}\' | Set-Content unload.json\ncurl.exe http://localhost:11434/api/generate -d \'@unload.json\'',
        checks: [
          {
            label: 'Preload with "keep_alive": -1',
            re: '"keep_alive":\\s*(-1|"-1")\\s*[,}]',
          },
          {
            label: 'Unload with "keep_alive": 0',
            re: '"keep_alive":\\s*(0|"0")\\s*[,}]',
          },
          {
            label: 'Preload before you unload',
            re: '"keep_alive":\\s*"?-1[\\s\\S]*"keep_alive":\\s*"?0',
          },
          { label: 'Send no prompt: just the model', not: '"prompt"' },
          {
            label: "POST to /api/generate with curl.exe -d '@file.json'",
            re: `curl\\.exe[^\\n]*/api/generate[^\\n]*${fileArg}`,
          },
        ],
        hint: "A request with only a model loads it. keep_alive -1 means forever, 0 means now. Save each body with Set-Content, then send it with -d '@file.json'.",
        explain: 'Preloading means the first user doesn’t wait for the model to load. ollama stop llama3.2 is the CLI way to unload.',
        output:
          '{"model":"llama3.2","created_at":"...","response":"","done":true,"done_reason":"load"}\n{"model":"llama3.2","created_at":"...","response":"","done":true,"done_reason":"unload"}',
      },
      {
        kind: 'write',
        prompt: 'Let qwen3 unload 2 minutes after this request, then check what is loaded.',
        starter:
          '{\n  "model": "qwen3",\n  "messages": [{"role": "user", "content": "Summarize the release notes."}],\n  "stream": false\n}\n# server default: OLLAMA_KEEP_ALIVE is 24h\n# save as request.json, then in PowerShell:\ncurl.exe http://localhost:11434/api/chat -d \'@request.json\'',
        solution:
          '{\n  "model": "qwen3",\n  "messages": [{"role": "user", "content": "Summarize the release notes."}],\n  "keep_alive": "2m",\n  "stream": false\n}\n# server default: OLLAMA_KEEP_ALIVE is 24h\n# save as request.json, then in PowerShell:\ncurl.exe http://localhost:11434/api/chat -d \'@request.json\'\nollama ps',
        checks: [
          {
            label: 'Add "keep_alive": "2m" to the request',
            re: '"keep_alive":\\s*("2m"|"120s"|120)\\s*[,}]',
          },
          { label: 'Keep the chat messages', re: '"messages":\\s*\\[' },
          {
            label: 'Check with ollama ps or GET /api/ps',
            re: 'ollama ps|/api/ps',
          },
        ],
        hint: 'keep_alive on a request beats the server’s OLLAMA_KEEP_ALIVE. Durations are strings like "2m"; plain numbers are seconds.',
        explain: 'The per-request value wins for that model, so qwen3 leaves memory after 2 minutes; ollama ps shows it in the UNTIL column.',
        output:
          'NAME           ID              SIZE      PROCESSOR    CONTEXT    UNTIL\nqwen3:latest   500a1f067a9f    6.0 GB    100% GPU     4096       2 minutes from now',
      },
    ],
    // L3 Parallel requests & memory
    [
      {
        kind: 'write',
        prompt: 'Set your PC’s Ollama to 3 requests at once, 2 models loaded, a queue of 100.',
        starter: '',
        solution:
          'setx OLLAMA_NUM_PARALLEL 3\nsetx OLLAMA_MAX_LOADED_MODELS 2\nsetx OLLAMA_MAX_QUEUE 100\n# then quit Ollama from the system tray and start it again',
        checks: [
          {
            label: 'OLLAMA_NUM_PARALLEL 3 as a user variable',
            re: userVar('OLLAMA_NUM_PARALLEL', '3'),
          },
          {
            label: 'OLLAMA_MAX_LOADED_MODELS 2 as a user variable',
            re: userVar('OLLAMA_MAX_LOADED_MODELS', '2'),
          },
          {
            label: 'OLLAMA_MAX_QUEUE 100 as a user variable',
            re: userVar('OLLAMA_MAX_QUEUE', '100'),
          },
        ],
        hint: 'setx NAME value saves a user variable. Ollama reads them when it starts, so restart it from the tray afterwards.',
        explain: 'Each parallel slot gets its own context, so 3 slots need about 3 times the context memory per model.',
      },
      {
        kind: 'write',
        prompt: 'Fix the override: the context variable is wrong and 8 slots won’t fit.',
        starter: '[Service]\nEnvironment="OLLAMA_NUM_CTX=16384"\nEnvironment="OLLAMA_NUM_PARALLEL=8"',
        solution: '[Service]\nEnvironment="OLLAMA_CONTEXT_LENGTH=16384"\nEnvironment="OLLAMA_NUM_PARALLEL=2"',
        checks: [
          {
            label: 'No OLLAMA_NUM_CTX (it doesn’t exist)',
            not: 'OLLAMA_NUM_CTX',
          },
          {
            label: 'OLLAMA_CONTEXT_LENGTH=16384',
            re: 'Environment="OLLAMA_CONTEXT_LENGTH=16384"',
          },
          {
            label: 'OLLAMA_NUM_PARALLEL down to 4 or fewer',
            re: 'Environment="OLLAMA_NUM_PARALLEL=[1-4]"',
          },
          {
            label: 'Keep the [Service] header',
            re: '^\\s*\\[Service\\]',
            flags: 'm',
          },
        ],
        hint: 'The server variable for the default window is OLLAMA_CONTEXT_LENGTH. num_ctx is the per-request option.',
        explain: 'Memory for context is roughly window × parallel slots: 16384 × 8 needs four times what 16384 × 2 does.',
      },
    ],
    // L4 Ollama in Docker
    [
      {
        kind: 'write',
        prompt: 'Run Ollama in Docker with the GPU and a model volume, then pull a model.',
        starter: '',
        solution: 'docker run -d --gpus=all -v ollama:/root/.ollama -p 11434:11434 --name ollama ollama/ollama\ndocker exec -it ollama ollama pull gemma3',
        checks: [
          {
            label: 'docker run -d … ollama/ollama',
            re: 'docker run\\s[\\s\\S]*(-d\\b|--detach\\b)[\\s\\S]*ollama/ollama',
          },
          { label: 'Use the GPU with --gpus=all', re: '--gpus[= ]all' },
          {
            label: 'A volume mounted at /root/.ollama',
            re: '-v\\s+[\\w.-]+:/root/\\.ollama\\b',
          },
          { label: 'Publish port 11434', re: '-p\\s+([\\d.]+:)?11434:11434' },
          {
            label: 'Pull a model with docker exec',
            re: 'docker exec\\s+(-it\\s+)?[\\w.-]+\\s+ollama\\s+pull\\s+\\S+',
          },
        ],
        hint: 'The image is ollama/ollama. Models live in /root/.ollama inside it. Give the container a --name to exec into.',
        explain: 'The named volume keeps downloaded models when the container is replaced, and docker exec runs the CLI next to the server.',
        output: 'pulling manifest\npulling aeda25e63ebd: 100% ▕████████████████▏ 3.3 GB\nsuccess',
      },
      {
        kind: 'write',
        prompt: 'Finish the compose service: port, model volume, keep-alive and the GPU.',
        starter: 'services:\n  ollama:\n    image: ollama/ollama\n',
        solution:
          'services:\n  ollama:\n    image: ollama/ollama\n    ports:\n      - "11434:11434"\n    volumes:\n      - ollama:/root/.ollama\n    environment:\n      - OLLAMA_KEEP_ALIVE=1h\n    deploy:\n      resources:\n        reservations:\n          devices:\n            - driver: nvidia\n              count: all\n              capabilities: [gpu]\n\nvolumes:\n  ollama:',
        checks: [
          { label: 'Publish port 11434', re: '"?([\\d.]+:)?11434:11434"?' },
          {
            label: 'Mount a named volume at /root/.ollama',
            re: '[\\w.-]+:/root/\\.ollama\\b',
          },
          {
            label: 'Declare the volume at the top level',
            re: '^volumes:\\s*\\n\\s+[\\w.-]+:',
            flags: 'm',
          },
          {
            label: 'Set OLLAMA_KEEP_ALIVE',
            re: 'OLLAMA_KEEP_ALIVE[=:]\\s*"?\\w+',
          },
          { label: 'Reserve an nvidia device', re: 'driver:\\s*nvidia' },
          {
            label: 'With capabilities: [gpu]',
            re: 'capabilities:\\s*\\[\\s*"?gpu"?\\s*\\]',
          },
        ],
        hint: 'GPUs go under deploy.resources.reservations.devices. Named volumes also need a top-level volumes: entry.',
        explain: 'Compose writes down the same docker run flags: -p is ports, -v is volumes, -e is environment and --gpus is the device reservation.',
      },
    ],
    // L5 Health checks & security
    [
      {
        kind: 'write',
        prompt: 'Add a location that asks for a login and proxies to the local Ollama.',
        starter:
          'server {\n  listen 443 ssl;\n  server_name ai.example.com;\n  ssl_certificate     /etc/ssl/ai.crt;\n  ssl_certificate_key /etc/ssl/ai.key;\n\n}',
        solution:
          'server {\n  listen 443 ssl;\n  server_name ai.example.com;\n  ssl_certificate     /etc/ssl/ai.crt;\n  ssl_certificate_key /etc/ssl/ai.key;\n\n  location / {\n    auth_basic "Ollama";\n    auth_basic_user_file /etc/nginx/.htpasswd;\n    proxy_pass http://127.0.0.1:11434;\n    proxy_set_header Host localhost:11434;\n  }\n}',
        checks: [
          { label: 'A location / block', re: 'location\\s+/\\s*\\{' },
          {
            label: 'auth_basic with a realm name',
            re: 'auth_basic\\s+"[^"]+"\\s*;',
          },
          {
            label: 'auth_basic_user_file pointing at a password file',
            re: 'auth_basic_user_file\\s+\\S+\\s*;',
          },
          {
            label: 'proxy_pass to Ollama on 127.0.0.1',
            re: 'proxy_pass\\s+http://(127\\.0\\.0\\.1|localhost):11434/?\\s*;',
          },
          {
            label: 'Set the Host header to localhost:11434',
            re: 'proxy_set_header\\s+Host\\s+localhost:11434\\s*;',
          },
        ],
        hint: 'Ollama has no login of its own, so nginx checks the password before proxy_pass forwards anything.',
        explain: 'TLS and Basic auth live in nginx; Ollama only listens on loopback. Rewriting Host keeps Ollama’s host check happy.',
      },
      {
        kind: 'write',
        prompt: 'On the Linux server, bind the container to the host only, then health-check it.',
        starter:
          'docker run -d -v ollama:/root/.ollama -p 11434:11434 --name ollama ollama/ollama\n# TODO: fail if Ollama is down, then print the model names\n',
        solution:
          "docker run -d -v ollama:/root/.ollama -p 127.0.0.1:11434:11434 --name ollama ollama/ollama\ncurl -f http://localhost:11434/api/version\ncurl -s http://localhost:11434/api/tags | jq -r '.models[].name'",
        checks: [
          {
            label: 'Publish the port on 127.0.0.1 only',
            re: '-p\\s+127\\.0\\.0\\.1:11434:11434',
          },
          { label: 'No port open to every interface', not: '-p 11434:11434' },
          {
            label: 'Health check: curl -f /api/version',
            re: 'curl\\b[^\\n]*\\s(-[a-zA-Z]*f[a-zA-Z]*|--fail)\\s[^\\n]*/api/version',
          },
          {
            label: 'List models with GET /api/tags',
            re: 'curl[^\\n]*/api/tags',
          },
        ],
        hint: 'Put an IP before the host port: -p 127.0.0.1:11434:11434. curl -f exits with an error on HTTP failures.',
        explain: 'Only processes on this machine (like nginx) can reach Ollama now. /api/version is cheap, and /api/tags proves the models are there.',
        output: '{"version":"0.12.6"}\ngemma3:latest\nllama3.2:latest',
      },
    ],
  ],
};

export default unit;
