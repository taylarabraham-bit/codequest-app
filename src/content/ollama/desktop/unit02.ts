import type { DesktopUnit } from '../../../engine/types';

// Desktop edition: write-the-code challenges for Ollama unit 2 (Prompts & parameters).
// lessons[i] runs after lesson i + 1. See docs/CONTENT_GUIDE.md.
const unit: DesktopUnit = {
  lessons: [
    // L1 System prompts
    [
      {
        kind: 'write',
        prompt: 'Make llama3.2 a terse pirate tour guide, then print the system prompt.',
        starter: 'ollama run llama3.2\n',
        solution: 'ollama run llama3.2\n>>> /set system You are a pirate tour guide. Keep answers short.\n>>> /show system',
        checks: [
          { label: 'Set the role with /set system (no quotes)', re: '^>>> /set system [^"\\s]', flags: 'm' },
          { label: 'Mention the pirate tour guide role', re: '/set system [^\\n]*pirate', flags: 'i' },
          { label: 'Print it back with /show system afterwards', re: '/set system[\\s\\S]*\\n>>> /show system\\s*$', flags: 'm' },
        ],
        hint: 'Everything after /set system becomes the system prompt, exactly as typed.',
        explain: 'The system prompt applies to the whole chat. /show system prints it back so you can check it.',
        output: 'You are a pirate tour guide. Keep answers short.',
      },
      {
        kind: 'write',
        prompt: 'Give gemma3 a two-line museum guide system prompt, then ask a question.',
        starter: 'ollama run gemma3\n',
        solution:
          'ollama run gemma3\n>>> /set system """\n... You are a museum guide.\n... Keep answers under 50 words.\n... """\n>>> Who painted The Night Watch?',
        checks: [
          { label: 'Open it with /set system """', re: '^>>> /set system """', flags: 'm' },
          { label: 'Two lines of rules on ... lines', re: '^\\.\\.\\. [^\\n]*\\w[^\\n]*\\n\\.\\.\\. [^\\n]*\\w', flags: 'm' },
          { label: 'Close it with """', re: '^\\.\\.\\. .*"""\\s*$', flags: 'm' },
          { label: 'Then ask a question at >>>', re: '"""\\s*\\n>>> [^/\\s]' },
        ],
        hint: 'Triple quotes open and close a multi-line system prompt, just like a multi-line message.',
        explain: 'Ollama keeps reading ... lines until the closing """, then stores them all as one system message.',
      },
    ],
    // L2 Temperature & seed
    [
      {
        kind: 'write',
        prompt: 'Make llama3.2 focused and repeatable, then ask for a colour name.',
        starter: 'ollama run llama3.2\n',
        solution:
          'ollama run llama3.2\n>>> /set parameter temperature 0\n>>> /set parameter seed 7\n>>> Name a colour for a kitchen.',
        checks: [
          { label: 'Temperature 0 with /set parameter', re: '^>>> /set parameter temperature 0(\\.0+)?\\s*$', flags: 'm' },
          { label: 'A fixed whole-number seed', re: '^>>> /set parameter seed \\d+\\s*$', flags: 'm' },
          { label: 'Ask the question after both settings', re: '(temperature[\\s\\S]*seed|seed[\\s\\S]*temperature)[^\\n]*\\n(>>> [^\\n]*\\n)*>>> [^/\\s]' },
        ],
        hint: 'Both use /set parameter, then the name, then the value.',
        explain: 'Temperature 0 picks the likeliest words, and a fixed seed makes the same prompt give the same reply.',
        output: 'Sage green.',
      },
      {
        kind: 'write',
        prompt: 'Fix both settings so they apply, then ask for band names.',
        starter: 'ollama run mistral\n>>> /set temperature=1.2\n>>> /set parameter seed forty-two\n',
        solution:
          'ollama run mistral\n>>> /set parameter temperature 1.2\n>>> /set parameter seed 42\n>>> Suggest three band names.',
        checks: [
          { label: 'Temperature 1.2 with /set parameter', re: '^>>> /set parameter temperature 1\\.2\\s*$', flags: 'm' },
          { label: 'Seed 42 as a number', re: '^>>> /set parameter seed 42\\s*$', flags: 'm' },
          { label: 'No = sign', not: '=' },
          { label: 'Ask for band names after the settings', re: 'seed 42\\s*\\n>>> [^/\\s]' },
        ],
        hint: 'The form is /set parameter name value, with a space between them, and seeds are numbers.',
        explain: 'Higher temperature gives more surprising names; the seed still makes the run repeatable.',
      },
    ],
    // L3 Length & stops
    [
      {
        kind: 'write',
        prompt: 'Cap replies at 60 tokens, stop at ###, then list the parameters.',
        starter: 'ollama run mistral\n',
        solution: 'ollama run mistral\n>>> /set parameter num_predict 60\n>>> /set parameter stop ###\n>>> /show parameters',
        checks: [
          { label: 'num_predict 60', re: '^>>> /set parameter num_predict 60\\s*$', flags: 'm' },
          { label: 'A stop marker of ###, no quotes', re: '^>>> /set parameter stop ###\\s*$', flags: 'm' },
          { label: 'Finish with /show parameters', re: '\\n>>> /show parameters\\s*$' },
        ],
        hint: 'Both are /set parameter lines. /show lists what you set.',
        explain: 'num_predict caps the reply length in tokens, and the reply also ends early wherever ### appears.',
      },
      {
        kind: 'write',
        prompt: 'Fix the stop line for Q: and END, and remove the length cap.',
        starter: 'ollama run gemma3\n>>> /set parameter stop "Q:", "END"\n>>> /set parameter num_predict 50\n',
        solution: 'ollama run gemma3\n>>> /set parameter stop Q: END\n>>> /set parameter num_predict -1\n>>> /show parameters',
        checks: [
          { label: 'Both stop markers, space-separated, no quotes', re: '^>>> /set parameter stop (Q: END|END Q:)\\s*$', flags: 'm' },
          { label: 'No limit with num_predict -1', re: '^>>> /set parameter num_predict -1\\s*$', flags: 'm' },
          { label: 'Check them with /show parameters', re: '\\n>>> /show parameters\\s*$' },
        ],
        hint: 'At >>> list several stops separated by spaces. Which num_predict value means no limit?',
        explain: 'Quotes would become part of the markers. -1 removes the cap so the reply runs until a stop or the end.',
      },
    ],
    // L4 Context window
    [
      {
        kind: 'write',
        prompt: 'Give llama3.2 an 8192-token window before pasting a long report.',
        starter: 'ollama run llama3.2\n',
        solution:
          'ollama run llama3.2\n>>> /set parameter num_ctx 8192\n>>> """Summarise this report:\n... Q3 sales rose 12% in the north...\n... """',
        checks: [
          { label: 'num_ctx 8192 with /set parameter', re: '^>>> /set parameter num_ctx 8192\\s*$', flags: 'm' },
          { label: 'Set it before sending the report', re: 'num_ctx 8192\\s*\\n>>> [^/\\s]' },
          { label: 'Send the report as a """ message', re: '>>> """[\\s\\S]*"""' },
        ],
        hint: 'num_ctx is the window size in tokens. Change it before you send the long text.',
        explain: 'The system prompt, history and reply all share num_ctx, so a long report needs a bigger window.',
      },
      {
        kind: 'write',
        prompt: 'Set up a long story chat: a storyteller role, 16384 context, temperature 1.',
        starter: 'ollama run gemma3\n',
        solution:
          'ollama run gemma3\n>>> /set system You are a fantasy storyteller.\n>>> /set parameter num_ctx 16384\n>>> /set parameter temperature 1\n>>> /show parameters',
        checks: [
          { label: 'A storyteller system prompt', re: '^>>> /set system [^"\\n]*story', flags: 'mi' },
          { label: 'num_ctx 16384', re: '^>>> /set parameter num_ctx 16384\\s*$', flags: 'm' },
          { label: 'temperature 1', re: '^>>> /set parameter temperature 1(\\.0+)?\\s*$', flags: 'm' },
          { label: 'Confirm with /show parameters', re: '\\n>>> /show parameters\\s*$' },
        ],
        hint: 'One /set system line, then two /set parameter lines.',
        explain: 'A long story needs a big window to remember early chapters, and temperature 1 keeps it inventive.',
      },
    ],
    // L5 Thinking models
    [
      {
        kind: 'write',
        prompt: 'Ask qwen3 two one-shot questions: thinking off, then thinking hidden.',
        starter: '',
        solution: 'ollama run qwen3 --think=false "Capital of Chile?"\nollama run qwen3 --hidethinking "Is 97 prime?"',
        checks: [
          { label: 'qwen3 with --think=false and a quoted prompt', re: '^\\s*ollama run (?=.*\\bqwen3\\b)(?=.*--think=false)(?=.*"[^"]+").*$', flags: 'm' },
          { label: 'qwen3 with --hidethinking and a quoted prompt', re: '^\\s*ollama run (?=.*\\bqwen3\\b)(?=.*--hidethinking)(?=.*"[^"]+").*$', flags: 'm' },
          { label: 'Write --think=false with =, not a space', not: '--think false' },
        ],
        hint: 'One flag switches thinking off; another lets the model think but hides it.',
        explain: '--think=false skips the reasoning, so it is fast. --hidethinking still reasons but prints only the answer.',
        output: 'Santiago.\nYes, 97 is prime.',
      },
      {
        kind: 'write',
        prompt: 'In one qwen3 chat, think through a puzzle, then answer fast without thinking.',
        starter: 'ollama run qwen3\n',
        solution:
          'ollama run qwen3\n>>> /set think\n>>> 3 cats catch 3 mice in 3 minutes. How many cats catch 100 mice in 100 minutes?\n>>> /set nothink\n>>> Capital of Peru?',
        checks: [
          { label: '/set think, then the puzzle', re: '^>>> /set think\\s*\\n>>> [^/\\s]', flags: 'm' },
          { label: '/set nothink, then a quick question', re: '^>>> /set nothink\\s*\\n>>> [^/\\s]', flags: 'm' },
          { label: 'Think first, nothink second', re: '/set think\\s*\\n[\\s\\S]*/set nothink' },
        ],
        hint: 'At >>> thinking is switched with /set and one word each way.',
        explain: '/set think and /set nothink switch thinking per message, so you pay for reasoning only where it helps.',
      },
    ],
  ],
};

export default unit;
