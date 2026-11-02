import type { DesktopUnit } from '../../../engine/types';

// Desktop edition: write-the-code challenges for Ollama unit 3 (Modelfiles).
// lessons[i] runs after lesson i + 1. See docs/CONTENT_GUIDE.md.
const unit: DesktopUnit = {
  // Windows versions of shared items (the phone keeps the originals).
  overrides: {
    'L4.6': {
      kind: 'order',
      prompt: 'Copy llama3.2’s recipe, tweak it, rebuild, test.',
      lines: [
        'ollama show llama3.2 --modelfile > Modelfile',
        'notepad Modelfile',
        'ollama create myllama -f Modelfile',
        'ollama run myllama',
      ],
      hint: 'You can’t edit a file before it exists.',
      explain: 'Exporting with --modelfile is the quickest start for your own variant. Edit and save it in Notepad, then create.',
    },
  },
  lessons: [
    // L1 Your first Modelfile
    [
      {
        kind: 'write',
        prompt: 'Write a Modelfile for a haiku bot built on gemma3.',
        starter: '',
        solution: 'FROM gemma3\nSYSTEM """You reply only with a haiku about the user\'s topic."""',
        checks: [
          { label: 'Start with FROM gemma3', re: '^\\s*FROM gemma3(:\\w+)?\\s*$', flags: 'm' },
          { label: 'A SYSTEM prompt in """ quotes', re: '^SYSTEM """[\\s\\S]*\\S[\\s\\S]*"""', flags: 'm' },
          { label: 'The system prompt mentions haiku', re: 'SYSTEM """[^"]*haiku', flags: 'i' },
        ],
        hint: 'FROM names the base model. SYSTEM bakes in the rules.',
        explain: 'FROM picks the weights and SYSTEM stores a system prompt, so every chat with the new model starts with it.',
      },
      {
        kind: 'write',
        prompt: 'Fix this coach Modelfile, then add the commands to build and run it as coach.',
        starter: 'FROM: llama3.2\nSYSTEM You are a gym coach.\nAnswer in two sentences or fewer.\n',
        solution:
          'FROM llama3.2\nSYSTEM """You are a gym coach.\nAnswer in two sentences or fewer."""\n\n# ollama create coach -f Modelfile\n# ollama run coach',
        checks: [
          { label: 'FROM llama3.2, with no colon after FROM', re: '^FROM llama3\\.2\\s*$', flags: 'm' },
          { label: 'Both lines of the system prompt inside SYSTEM """…"""', re: 'SYSTEM """\\s*You are a gym coach\\.\\s*\\n\\s*Answer in two sentences or fewer\\.?\\s*"""' },
          { label: 'Build it with ollama create coach', re: 'ollama create coach( -f \\S+)?\\s*$', flags: 'm' },
          { label: 'Start it with ollama run coach', re: 'ollama run coach\\s*$', flags: 'm' },
        ],
        hint: 'Instructions are a word and a space. Text over several lines needs triple quotes.',
        explain: 'Without """ the second line would be read as an unknown instruction. create builds the model and run starts it.',
      },
    ],
    // L2 PARAMETER lines
    [
      {
        kind: 'write',
        prompt: 'Bake temperature 0.2 and an 8192-token context into a llama3.2 tutor.',
        starter: '',
        solution: 'FROM llama3.2\nSYSTEM """You are a patient maths tutor."""\nPARAMETER temperature 0.2\nPARAMETER num_ctx 8192',
        checks: [
          { label: 'FROM llama3.2', re: '^\\s*FROM llama3\\.2\\s*$', flags: 'm' },
          { label: 'PARAMETER temperature 0.2', re: '^PARAMETER temperature 0\\.2\\s*$', flags: 'm' },
          { label: 'PARAMETER num_ctx 8192', re: '^PARAMETER num_ctx 8192\\s*$', flags: 'm' },
        ],
        hint: 'One PARAMETER line per setting: name, then value.',
        explain: 'These are the same settings as /set parameter, but baked in, so every chat starts with them.',
      },
      {
        kind: 'write',
        prompt: 'Fix the PARAMETER lines: two stop strings and a 200-token cap.',
        starter: 'FROM mistral\nPARAMETER stop "User:", "###"\nPARAMETER num_predict=200\n',
        solution: 'FROM mistral\nPARAMETER stop "User:"\nPARAMETER stop "###"\nPARAMETER num_predict 200',
        checks: [
          { label: 'A PARAMETER stop line for User:', re: '^PARAMETER stop "?User:"?\\s*$', flags: 'm' },
          { label: 'A separate PARAMETER stop line for ###', re: '^PARAMETER stop "?###"?\\s*$', flags: 'm' },
          { label: 'PARAMETER num_predict 200, no =', re: '^PARAMETER num_predict 200\\s*$', flags: 'm' },
        ],
        hint: 'Each stop string gets its own PARAMETER line, and values follow a space.',
        explain: 'Repeating PARAMETER stop adds more markers. ollama show --parameters then lists both.',
      },
    ],
    // L3 Few-shot MESSAGE
    [
      {
        kind: 'write',
        prompt: 'Teach a gemma3 mood-to-colour bot with two example exchanges.',
        starter: '',
        solution:
          'FROM gemma3\nMESSAGE user I feel calm.\nMESSAGE assistant Pale blue.\nMESSAGE user I feel excited.\nMESSAGE assistant Bright orange.',
        checks: [
          { label: 'FROM gemma3', re: '^\\s*FROM gemma3(:\\w+)?\\s*$', flags: 'm' },
          { label: 'A MESSAGE user line followed by MESSAGE assistant', re: '^MESSAGE user \\S.*\\n\\s*MESSAGE assistant \\S', flags: 'm' },
          { label: 'Two example pairs', re: '(MESSAGE user [^\\n]+\\n\\s*MESSAGE assistant [^\\n]+\\s*){2}' },
          { label: 'Use the assistant role, not model', not: 'MESSAGE model' },
        ],
        hint: 'MESSAGE, a role (user or assistant), then the text.',
        explain: 'The example turns go in front of every chat, so the model copies their short style.',
      },
      {
        kind: 'write',
        prompt: 'Add a low temperature and one example exchange to this pun rater.',
        starter: 'FROM llama3.2\nSYSTEM """Rate puns out of 10."""\n',
        solution:
          'FROM llama3.2\nSYSTEM """Rate puns out of 10."""\nPARAMETER temperature 0.3\nMESSAGE user I used to be a baker, but I could not make enough dough.\nMESSAGE assistant 7/10. Solid wordplay.',
        checks: [
          { label: 'Keep the SYSTEM prompt', re: 'SYSTEM """Rate puns out of 10\\."""' },
          { label: 'A temperature below 1', re: '^PARAMETER temperature 0(\\.\\d+)?\\s*$', flags: 'm' },
          { label: 'A MESSAGE user pun', re: '^MESSAGE user \\S', flags: 'm' },
          { label: 'Then a MESSAGE assistant rating', re: 'MESSAGE user [^\\n]+\\n\\s*MESSAGE assistant [^\\n]*\\d+\\s*/\\s*10' },
        ],
        hint: 'PARAMETER for the setting; MESSAGE user then MESSAGE assistant for the example.',
        explain: 'The example shows the exact reply format you want, and a low temperature keeps the scores steady.',
      },
    ],
    // L4 Reading templates
    [
      {
        kind: 'write',
        prompt: 'Print llama3.2’s template, then save its full Modelfile to base.Modelfile.',
        starter: '',
        solution: 'ollama show llama3.2 --template\nollama show llama3.2 --modelfile > base.Modelfile',
        checks: [
          { label: 'ollama show with --template', re: '^\\s*ollama show (?=.*\\bllama3\\.2\\b).*--template', flags: 'm' },
          { label: 'ollama show with --modelfile', re: '^\\s*ollama show (?=.*\\bllama3\\.2\\b).*--modelfile', flags: 'm' },
          { label: 'Redirect the Modelfile into base.Modelfile with >', re: '--modelfile[^\\n]*>\\s*base\\.Modelfile|>\\s*base\\.Modelfile[^\\n]*--modelfile' },
        ],
        hint: 'Each part of ollama show has its own flag. > sends output to a file.',
        explain: '--template prints only the prompt template. The saved Modelfile is a handy starting point for your own.',
      },
      {
        kind: 'write',
        prompt: 'Make the system block optional and mark where the reply goes.',
        starter:
          'FROM qwen2.5\nTEMPLATE """<|im_start|>system\n{{ .System }}<|im_end|>\n<|im_start|>user\n{{ .Prompt }}<|im_end|>\n<|im_start|>assistant\n"""\n',
        solution:
          'FROM qwen2.5\nTEMPLATE """{{ if .System }}<|im_start|>system\n{{ .System }}<|im_end|>\n{{ end }}<|im_start|>user\n{{ .Prompt }}<|im_end|>\n<|im_start|>assistant\n{{ .Response }}<|im_end|>\n"""',
        checks: [
          { label: 'Open {{ if .System }} before the system block', re: '\\{\\{-?\\s*if\\s+\\.System\\s*-?\\}\\}\\s*<\\|im_start\\|>system' },
          { label: 'Close it with {{ end }} after <|im_end|>', re: '\\{\\{\\s*\\.System\\s*\\}\\}\\s*<\\|im_end\\|>\\s*\\{\\{-?\\s*end\\s*-?\\}\\}' },
          { label: 'Put {{ .Response }} after the assistant line', re: '<\\|im_start\\|>assistant\\s*\\{\\{\\s*\\.Response\\s*\\}\\}' },
          { label: 'Keep {{ .Prompt }} in the user block', re: '<\\|im_start\\|>user\\s*\\{\\{\\s*\\.Prompt\\s*\\}\\}' },
        ],
        hint: 'Go templates use {{ if … }} … {{ end }}. The reply has its own variable.',
        explain: 'With no system prompt the whole system block is skipped, and {{ .Response }} marks where the model writes.',
      },
    ],
    // L5 Weights & adapters
    [
      {
        kind: 'write',
        prompt: 'Import recipebot from a local GGUF file with an MIT license, then build it.',
        starter: '# folder: Modelfile, recipebot-Q5_K_M.gguf\n',
        solution:
          '# folder: Modelfile, recipebot-Q5_K_M.gguf\nFROM ./recipebot-Q5_K_M.gguf\nLICENSE """MIT License"""\nSYSTEM """You suggest quick recipes."""\n\n# ollama create recipebot',
        checks: [
          { label: 'FROM the .gguf file', re: '^FROM (\\./)?recipebot-Q5_K_M\\.gguf\\s*$', flags: 'm' },
          { label: 'A LICENSE """…""" block', re: '^LICENSE """[^"]*MIT[^"]*"""', flags: 'm' },
          { label: 'Build it with ollama create recipebot', re: 'ollama create recipebot\\b' },
          { label: 'No -q: a GGUF is already quantized', not: ' -q ' },
        ],
        hint: 'FROM takes a file path too. LICENSE is spelled the American way.',
        explain: 'The GGUF is used as-is at Q5_K_M, and ollama show recipebot --license prints the terms you shipped.',
      },
      {
        kind: 'write',
        prompt: 'Fix it: import the merged Safetensors folder as int4 under Apache 2.0.',
        starter:
          'FROM llama3.2\nADAPTER ./merged-weights\nLICENCE """Apache License 2.0"""\n\n# ollama create ranger -q q4_K_M\n',
        solution: 'FROM ./merged-weights\nLICENSE """Apache License 2.0"""\n\n# ollama create ranger -q int4',
        checks: [
          { label: 'FROM the ./merged-weights folder', re: '^FROM (\\./)?merged-weights/?\\s*$', flags: 'm' },
          { label: 'No ADAPTER line', not: 'ADAPTER' },
          { label: 'Spell LICENSE the American way', re: '^LICENSE """Apache License 2\\.0"""', flags: 'm' },
          { label: 'Create ranger quantized to int4', re: 'ollama create (?=[^\\n]*\\branger\\b)(?=[^\\n]*(-q|--quantize)[ =]int4\\b)' },
          { label: 'No q4_K_M: that’s for GGUF only', not: 'q4_K_M' },
        ],
        hint: 'ADAPTER is gone, so load the merged weights with FROM. Safetensors imports take int4 or int8.',
        explain: 'The LoRA is already merged into full weights, so FROM imports them and -q int4 shrinks them as they’re imported.',
      },
    ],
  ],
};

export default unit;
