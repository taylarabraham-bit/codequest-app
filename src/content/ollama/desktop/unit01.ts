import type { DesktopUnit } from '../../../engine/types';

// Desktop edition: write-the-code challenges for Ollama unit 1 (Running models).
// lessons[i] runs after lesson i + 1. See docs/CONTENT_GUIDE.md.
const unit: DesktopUnit = {
  // Windows PowerShell versions of shared items (the phone keeps the originals).
  concepts: {
    4: {
      body: 'Put a quoted prompt after the model name to get one reply and land back in PowerShell. Pipe a file in with Get-Content file -Raw | and Ollama puts its text before your prompt. At >>>, wrap a message in """ to send several lines as one.',
      code: 'ollama run llama3.2 "Name a planet."\nGet-Content notes.txt -Raw | ollama run llama3.2 "Summarise:"\n>>> """First line\n... second line"""',
    },
  },
  overrides: {
    'L1.2': {
      kind: 'fill',
      prompt: 'Which prompt means the model is waiting for you?',
      code: 'PS> ollama run gemma3\n___ Send a message (/? for help)',
      blanks: [{ answer: ['>>>'], options: ['>>>', '...', 'PS>'] }],
      hint: 'It isn’t PowerShell’s prompt.',
      explain: '>>> is the chat prompt. The grey hint text vanishes once you type.',
    },
    'L4.2': {
      kind: 'build',
      prompt: 'Pipe notes.txt into llama3.2 with the prompt "Summarise:".',
      answer: ['Get-Content', 'notes.txt', '-Raw', '|', 'ollama', 'run', 'llama3.2', '"Summarise:"'],
      alt: [['Get-Content', '-Raw', 'notes.txt', '|', 'ollama', 'run', 'llama3.2', '"Summarise:"']],
      distractors: ['>', '<'],
      hint: 'Get-Content reads the file; its text flows left to right through the pipe.',
      explain: 'Get-Content -Raw reads the whole file as one string. Ollama reads the piped text, adds your prompt after it and prints one reply.',
    },
    'L4.5': {
      kind: 'fill',
      prompt: 'What does the model receive?',
      code: 'PS> Get-Content todo.txt\nbuy milk\nPS> Get-Content todo.txt -Raw | ollama run llama3.2 "Sort this:"\n# prompt = ___',
      blanks: [
        {
          answer: ['file text, then Sort this:'],
          options: ['file text, then Sort this:', 'Sort this:, then file text', 'Sort this: only'],
        },
      ],
      hint: 'The piped text is read first.',
      explain: 'Ollama puts the piped text first and appends your prompt after a space, so write prompts that read well after the text.',
    },
    'boss.7': {
      kind: 'fix',
      prompt: 'The log never reaches Ollama. Fix it.',
      code: 'Get-Content error.log -Raw [[>]] ollama run mistral "Explain:"',
      fix: '|',
      options: ['|', '<', '&'],
      hint: 'You want Get-Content’s output fed into the next command.',
      explain: '> redirects the log into a file named ollama. | pipes it into ollama run, ahead of your prompt.',
    },
  },
  lessons: [
    // L1 Your first model
    [
      {
        kind: 'write',
        prompt: 'Start a chat with gemma3, ask for a goldfish name, then quit.',
        starter: '',
        solution: 'ollama run gemma3\n>>> Suggest a name for a goldfish.\n>>> /bye',
        checks: [
          { label: 'Open the chat with ollama run gemma3', re: '^\\s*ollama run gemma3(:\\w+)?\\s*$', flags: 'm' },
          { label: 'Send a message at the >>> prompt', re: '^>>> [^/\\s]', flags: 'm' },
          { label: 'Quit with /bye as the last line', re: '\\n>>> /bye\\s*$' },
        ],
        hint: 'One shell command opens the chat; then type at >>>. Commands there start with a slash.',
        explain: 'ollama run opens the chat (pulling gemma3 first if needed), and /bye takes you back to the shell.',
        output: 'Bubbles.',
      },
      {
        kind: 'write',
        prompt: 'Wipe this chat, ask something new, then leave.',
        starter: 'ollama run llama3.2\n>>> My budget is 500 euros. Plan a weekend in Porto.\n',
        solution:
          'ollama run llama3.2\n>>> My budget is 500 euros. Plan a weekend in Porto.\n>>> /clear\n>>> Suggest a board game for four players.\n>>> /bye',
        checks: [
          { label: 'Forget the chat so far with /clear', re: '^>>> /clear\\s*$', flags: 'm' },
          { label: 'Ask a new question after /clear', re: '>>> /clear\\s*\\n(>>> [^\\n]*\\n)*?>>> [^/\\s]' },
          { label: 'End with /bye', re: '\\n>>> /bye\\s*$' },
        ],
        hint: 'The command that wipes the conversation sounds like clearing a whiteboard.',
        explain: '/clear empties the conversation memory but keeps the chat open, so the next question starts fresh.',
      },
    ],
    // L2 Names & tags
    [
      {
        kind: 'write',
        prompt: 'Download gemma3 in sizes 1b and 12b, then chat with the small one.',
        starter: '',
        solution: 'ollama pull gemma3:1b\nollama pull gemma3:12b\nollama run gemma3:1b',
        checks: [
          { label: 'ollama pull gemma3:1b', has: 'ollama pull gemma3:1b' },
          { label: 'ollama pull gemma3:12b', has: 'ollama pull gemma3:12b' },
          { label: 'Chat with gemma3:1b using run', re: '^\\s*ollama run gemma3:1b\\s*$', flags: 'm' },
        ],
        hint: 'pull downloads without chatting. The size goes after a colon.',
        explain: 'model:tag picks a variant. pull only downloads, and run opens the chat with the exact tag you name.',
      },
      {
        kind: 'write',
        prompt: 'Fix both commands: download llama3.2 1b, then chat with mistral 7b.',
        starter: 'ollama get llama3.2/1b\nollama run mistral:7gb\n',
        solution: 'ollama pull llama3.2:1b\nollama run mistral:7b',
        checks: [
          { label: 'Download with ollama pull llama3.2:1b', has: 'ollama pull llama3.2:1b' },
          { label: 'Chat with ollama run mistral:7b', has: 'ollama run mistral:7b' },
          { label: 'No get command', not: 'ollama get' },
          { label: 'Size tags end in b, not gb', not: '7gb' },
        ],
        hint: 'The download command is the opposite of push, and tags follow a colon.',
        explain: 'Tags join with a colon, and b means billions of parameters, so 7b is the 7-billion variant.',
      },
    ],
    // L3 Managing models
    [
      {
        kind: 'write',
        prompt: 'List your models, inspect qwen3, then delete mistral.',
        starter: '',
        solution: 'ollama list\nollama show qwen3\nollama rm mistral',
        checks: [
          { label: 'List models with ollama list (or ls)', re: '^\\s*ollama (list|ls)\\s*$', flags: 'm' },
          { label: 'Show the details of qwen3', re: '^\\s*ollama show qwen3(:\\w+)?\\s*$', flags: 'm' },
          { label: 'Delete mistral with ollama rm', re: '^\\s*ollama rm mistral(:\\w+)?\\s*$', flags: 'm' },
        ],
        hint: 'One command lists, one prints details, and one removes. rm is short for remove.',
        explain: 'list shows what is on disk, show prints a model’s details and capabilities, and rm frees the space.',
      },
      {
        kind: 'write',
        prompt: 'Rename llama3.2 to trip-bot: copy it, delete the original, then list.',
        starter: '# rename llama3.2 to trip-bot\n',
        solution: '# rename llama3.2 to trip-bot\nollama cp llama3.2 trip-bot\nollama rm llama3.2\nollama ls',
        checks: [
          { label: 'Copy with ollama cp llama3.2 trip-bot', has: 'ollama cp llama3.2 trip-bot' },
          { label: 'Remove llama3.2 after copying it', re: 'ollama cp llama3\\.2 trip-bot[\\s\\S]*\\n\\s*ollama rm llama3\\.2(:latest)?\\s*\\n' },
          { label: 'List the models last', re: '\\n\\s*ollama (list|ls)\\s*$' },
        ],
        hint: 'There is no rename command: cp first, then rm the old name.',
        explain: 'cp shares the same layers on disk, so the copy is instant, and rm then removes only the old name.',
        output: 'NAME               ID              SIZE      MODIFIED\ntrip-bot:latest    a80c4f17acd5    2.0 GB    5 seconds ago',
      },
    ],
    // L4 Prompts from the shell
    [
      {
        kind: 'write',
        prompt: 'Ask gemma3 one quick question, then pipe recipe.txt in for a shopping list.',
        starter: '',
        solution: 'ollama run gemma3 "Name a spice for tomato soup."\nGet-Content recipe.txt -Raw | ollama run gemma3 "Make a shopping list:"',
        checks: [
          { label: 'A one-shot prompt: ollama run, a model and a quoted prompt', re: '^\\s*ollama run [\\w.:/-]+ "[^"]+"\\s*$', flags: 'm' },
          { label: 'Pipe recipe.txt into ollama run with Get-Content and |', re: '^\\s*(cat|type|gc|Get-Content)( -Raw)? \\.?[/\\\\]?recipe\\.txt( -Raw)?\\s*\\|\\s*ollama run [\\w.:/-]+', flags: 'mi' },
          { label: 'Give the piped run a quoted prompt', re: '\\|\\s*ollama run [\\w.:/-]+ "[^"]+"' },
        ],
        hint: 'Put the prompt in quotes after the model name. Get-Content reads the file on the left of the pipe.',
        explain: 'With a prompt on the command line, run answers once and exits. Piped text goes in front of your prompt.',
      },
      {
        kind: 'write',
        prompt: 'Send this three-line poem to llama3.2 as one message, then quit.',
        starter: 'ollama run llama3.2\n',
        solution: 'ollama run llama3.2\n>>> """Fix the grammar:\n... Roses is red\n... Violets is blue"""\n>>> /bye',
        checks: [
          { label: 'Open the message with >>> """', re: '^>>> """', flags: 'm' },
          { label: 'Continue on ... lines', re: '^\\.\\.\\. [^\\n]*\\w[^\\n]*\\n\\.\\.\\. ', flags: 'm' },
          { label: 'Close it with """ on a ... line', re: '^\\.\\.\\. .*"""\\s*$', flags: 'm' },
          { label: 'Use """, not \'\'\'', not: "'''" },
          { label: 'Quit with /bye', re: '\\n>>> /bye\\s*$' },
        ],
        hint: 'Triple double quotes open and close a multi-line message. Ollama shows ... while it waits.',
        explain: 'Everything between the """ pair goes to the model as one message instead of one line at a time.',
        output: 'Roses are red,\nViolets are blue.',
      },
    ],
    // L5 Loaded models
    [
      {
        kind: 'write',
        prompt: 'Warm up gemma3 to stay loaded for an hour, then check memory.',
        starter: '',
        solution: 'ollama run gemma3 --keepalive 1h "Say ready."\nollama ps',
        checks: [
          { label: 'Run gemma3 with a quoted prompt', re: '^\\s*ollama run (.* )?gemma3(:\\w+)?( .*)? "[^"]+"', flags: 'm' },
          { label: 'Keep it loaded with --keepalive 1h', re: '--keepalive[ =](1h|60m)\\b' },
          { label: 'Then list loaded models with ollama ps', re: '--keepalive[\\s\\S]*\\n\\s*ollama ps\\s*$' },
        ],
        hint: 'Durations look like 30m or 1h. ps lists what is in memory.',
        explain: '--keepalive overrides the 5-minute default, so UNTIL in ollama ps shows about an hour.',
        output:
          'Ready.\nNAME             ID              SIZE      PROCESSOR    CONTEXT    UNTIL\ngemma3:latest    a2af6cc3eb7f    6.3 GB    100% GPU     4096       59 minutes from now',
      },
      {
        kind: 'write',
        prompt: 'Free memory but keep mistral downloaded. Fix the script.',
        starter: '# free up memory, but keep mistral on disk\nollama ps\nollama rm mistral\n',
        solution: '# free up memory, but keep mistral on disk\nollama ps\nollama stop mistral\nollama ps',
        checks: [
          { label: 'Unload it with ollama stop mistral', has: 'ollama stop mistral' },
          { label: 'Don’t delete it with rm', not: 'ollama rm' },
          { label: 'Check ollama ps again at the end', re: 'ollama stop mistral[\\s\\S]*\\n\\s*ollama ps\\s*$' },
        ],
        hint: 'One command unloads from memory; rm deletes from disk.',
        explain: 'stop unloads the model right away and keeps the download, so the second ps no longer lists it.',
      },
    ],
  ],
};

export default unit;
