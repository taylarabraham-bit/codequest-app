import type { DesktopUnit } from '../../../engine/types';

// Desktop edition: write-the-code challenges for Ollama unit 15 (LoRA adapters & templates).
// lessons[i] runs after lesson i + 1. See docs/CONTENT_GUIDE.md.
const CHATML = 'TEMPLATE """{{- range .Messages }}<|im_start|>{{ .Role }}\n{{ .Content }}<|im_end|>\n{{ end }}<|im_start|>assistant\n"""';

const unit: DesktopUnit = {
  // Windows PowerShell versions of shared items (the phone keeps the originals):
  // backtick line breaks, Set-Content instead of echo >, an editor that exists on Windows.
  concepts: {
    2: {
      body: 'To use a LoRA now, merge it into its base and import the result. llama.cpp’s llama-export-lora merges GGUF files; Hugging Face PEFT’s merge_and_unload does it for Safetensors. Then FROM points at the merged weights. In PowerShell a backtick ` at the end of a line continues the command.',
      code: 'llama-export-lora -m Llama-3.2-3B-Instruct-F16.gguf `\n  --lora pirate-lora-F16.gguf -o pirate-F16.gguf\n\n# Modelfile\nFROM ./pirate-F16.gguf',
    },
  },
  overrides: {
    'L2.5': {
      kind: 'order',
      prompt: 'Merge, write the Modelfile, create, run.',
      lines: [
        'llama-export-lora -m base-F16.gguf --lora pirate-lora-F16.gguf -o pirate-F16.gguf',
        'Set-Content Modelfile "FROM ./pirate-F16.gguf"',
        'ollama create pirate -f Modelfile',
        'ollama run pirate "Where is the treasure?"',
      ],
      hint: 'The merged file must exist before FROM can use it.',
      explain: 'After the merge Ollama only sees one ordinary model, so create and run work as usual. Set-Content writes the one-line Modelfile.',
      output: 'Arr, buried under the old palm, matey!',
    },
    'boss.10': {
      kind: 'order',
      prompt: 'Merge, import, template, build, test.',
      lines: [
        'llama-export-lora -m base-F16.gguf --lora pirate-lora.gguf -o pirate-F16.gguf',
        'ollama show qwen2.5:3b --template > template.txt',
        'code Modelfile',
        'ollama create pirate -f Modelfile',
        'ollama run pirate "Hello"',
      ],
      hint: 'Get the weights and the base’s template before writing the Modelfile.',
      explain: 'Copying the base’s own template is the safest start: the merged model still expects the base’s markers. code opens the Modelfile in VS Code.',
    },
  },
  lessons: [
    // L1 What a LoRA is
    [
      {
        kind: 'write',
        prompt: 'Write a baseline Modelfile on the base chef-lora was trained for.',
        starter:
          '# chef-lora-F16.gguf (38 MB): "LoRA for Llama-3.2-3B-Instruct"\n# on disk: Llama-3.2-1B-Instruct-F16.gguf, Llama-3.2-3B-Instruct-F16.gguf, Qwen2.5-3B-Instruct-F16.gguf\n',
        solution:
          '# chef-lora-F16.gguf (38 MB): "LoRA for Llama-3.2-3B-Instruct"\n# on disk: Llama-3.2-1B-Instruct-F16.gguf, Llama-3.2-3B-Instruct-F16.gguf, Qwen2.5-3B-Instruct-F16.gguf\nFROM ./Llama-3.2-3B-Instruct-F16.gguf\nSYSTEM You are a friendly chef. Answer cooking questions in short steps.',
        checks: [
          { label: 'FROM the Llama-3.2-3B-Instruct file', re: '^FROM\\s+\\./Llama-3\\.2-3B-Instruct-F16\\.gguf\\s*$', flags: 'm' },
          { label: 'A SYSTEM line about cooking', re: '^SYSTEM\\s+[\\s\\S]*\\b(cook|chef|recipe)', flags: 'mi' },
          { label: 'No ADAPTER line', not: 'ADAPTER' },
        ],
        hint: 'The adapter card names its base. Size and family must both match: 3B, Llama 3.2, Instruct.',
        explain: 'This is your “before” model: same base the LoRA was trained on, so you can compare once you merge it in.',
      },
      {
        kind: 'write',
        prompt: 'Fix it: wrong base, and today’s Ollama rejects ADAPTER. Keep the temperature.',
        starter: '# chef-lora card: "LoRA for Llama-3.1-8B-Instruct"\nFROM qwen2.5:7b\nADAPTER ./chef-lora.gguf\nPARAMETER temperature 0.4',
        solution:
          '# chef-lora card: "LoRA for Llama-3.1-8B-Instruct"\n# merge chef-lora into this base before using it\nFROM llama3.1:8b\nPARAMETER temperature 0.4',
        checks: [
          { label: 'FROM llama3.1:8b (the adapter’s base)', re: '^FROM\\s+llama3\\.1:8b(-instruct\\S*)?\\s*$', flags: 'm' },
          { label: 'Not qwen2.5', not: 'FROM qwen2.5' },
          { label: 'Remove the ADAPTER line', not: 'ADAPTER' },
          { label: 'Keep PARAMETER temperature 0.4', re: '^PARAMETER\\s+temperature\\s+0\\.4\\s*$', flags: 'm' },
        ],
        hint: 'A LoRA only works on the exact model it was trained on. ADAPTER now errors, so the adapter has to be merged first.',
        explain: 'On the wrong base the adapter’s small weight changes land in the wrong places, giving errors or nonsense.',
      },
    ],
    // L2 Merging adapters
    [
      {
        kind: 'write',
        prompt: 'Merge chef-lora into its base with llama-export-lora, then build a model.',
        starter: '',
        solution:
          'llama-export-lora -m Llama-3.2-3B-Instruct-F16.gguf `\n  --lora chef-lora-F16.gguf -o chef-F16.gguf\nSet-Content Modelfile "FROM ./chef-F16.gguf"\nollama create chef -f Modelfile',
        checks: [
          { label: 'llama-export-lora -m with the base .gguf', re: 'llama-export-lora\\s[\\s\\S]*-m\\s+\\S+\\.gguf' },
          { label: '--lora with the adapter .gguf', re: '--lora\\s+\\S+\\.gguf' },
          { label: '-o the merged .gguf, then FROM it', re: '-o\\s+(?:\\./)?(\\S+\\.gguf)[\\s\\S]*FROM\\s+(\\./)?\\1' },
          { label: 'ollama create … -f Modelfile', re: 'ollama create\\s+[\\w.:-]+\\s+-f\\s+\\S+' },
        ],
        hint: '-m is the base model, --lora the adapter, -o the output file. Then FROM points at the output; Set-Content writes the Modelfile.',
        explain: 'The merged file has the adapter baked in, so Ollama imports it like any other GGUF.',
        output: 'gathering metadata\ncreating new layer sha256:...\nwriting manifest\nsuccess',
      },
      {
        kind: 'write',
        prompt: 'Finish the PEFT merge and save it for a Modelfile to import.',
        starter:
          'from transformers import AutoModelForCausalLM, AutoTokenizer\nfrom peft import PeftModel\n\nBASE = "meta-llama/Llama-3.2-3B-Instruct"\nbase = AutoModelForCausalLM.from_pretrained(BASE)\n# TODO: load ./support-lora on top, merge it, save model + tokenizer\n',
        solution:
          'from transformers import AutoModelForCausalLM, AutoTokenizer\nfrom peft import PeftModel\n\nBASE = "meta-llama/Llama-3.2-3B-Instruct"\nbase = AutoModelForCausalLM.from_pretrained(BASE)\nmodel = PeftModel.from_pretrained(base, "./support-lora")\nmerged = model.merge_and_unload()\nmerged.save_pretrained("./support-merged")\nAutoTokenizer.from_pretrained(BASE).save_pretrained("./support-merged")\n# Modelfile: FROM ./support-merged',
        checks: [
          { label: 'Load the adapter with PeftModel.from_pretrained(base, …)', re: 'PeftModel\\.from_pretrained\\(\\s*base\\s*,\\s*["\'][^"\']+["\']' },
          { label: 'Merge with merge_and_unload()', has: '.merge_and_unload()' },
          { label: 'save_pretrained the merged model', re: '\\w+\\.save_pretrained\\(\\s*["\'][^"\']+["\']\\s*\\)' },
          { label: 'Save the tokenizer to the same folder', re: 'AutoTokenizer\\.from_pretrained\\([^)]*\\)\\.save_pretrained\\(' },
          { label: 'A Modelfile comment: FROM that folder', re: 'save_pretrained\\(\\s*["\'](\\./)?([\\w.-]+)["\']\\s*\\)[\\s\\S]*FROM\\s+(\\./)?\\2\\b' },
        ],
        hint: 'PeftModel wraps base plus adapter; merge_and_unload folds the adapter into the weights.',
        explain: 'Ollama imports a Safetensors folder (weights, config, tokenizer) with FROM, so save everything to one place.',
      },
    ],
    // L3 Template variables
    [
      {
        kind: 'write',
        prompt: 'Write a ChatML TEMPLATE that loops over every message.',
        starter: 'FROM ./tutor-merged-Q4_K_M.gguf\n',
        solution: `FROM ./tutor-merged-Q4_K_M.gguf\n${CHATML}`,
        checks: [
          { label: 'A TEMPLATE in triple quotes', re: '^TEMPLATE\\s+"""[\\s\\S]*"""', flags: 'm' },
          { label: 'Loop with {{ range .Messages }}', re: '\\{\\{-?\\s*range\\s+\\.Messages\\s*-?\\}\\}' },
          { label: '<|im_start|> then {{ .Role }}', re: '<\\|im_start\\|>\\{\\{-?\\s*\\.Role\\s*-?\\}\\}' },
          { label: '{{ .Content }} then <|im_end|>', re: '\\{\\{-?\\s*\\.Content\\s*-?\\}\\}<\\|im_end\\|>' },
          { label: 'Close the loop with {{ end }}', re: '\\{\\{-?\\s*end\\s*-?\\}\\}' },
          { label: 'Open the assistant turn after the loop', re: '\\{\\{-?\\s*end\\s*-?\\}\\}\\s*<\\|im_start\\|>assistant' },
        ],
        hint: 'Inside range, the dot is one message: .Role and .Content. After {{ end }}, start the assistant’s turn.',
        explain: 'The template renders the history in the exact markup the model was trained on, then leaves the assistant turn open for it to fill.',
      },
      {
        kind: 'write',
        prompt: 'Fix the template: tools are top-level and field names are case-sensitive.',
        starter:
          'FROM ./helper-Q4_K_M.gguf\nTEMPLATE """{{- range .Messages }}\n{{- if and (eq .Role "user") .Tools }}[AVAILABLE_TOOLS] {{ json .Tools }}[/AVAILABLE_TOOLS]\n{{- end }}\n{{- if eq .Role "user" }}[INST] {{ .content }}[/INST]\n{{- else }}{{ .Content }}</s>\n{{- end }}\n{{- end }}"""',
        solution:
          'FROM ./helper-Q4_K_M.gguf\nTEMPLATE """{{- range .Messages }}\n{{- if and (eq .Role "user") $.Tools }}[AVAILABLE_TOOLS] {{ json $.Tools }}[/AVAILABLE_TOOLS]\n{{- end }}\n{{- if eq .Role "user" }}[INST] {{ .Content }}[/INST]\n{{- else }}{{ .Content }}</s>\n{{- end }}\n{{- end }}"""',
        checks: [
          { label: 'Test $.Tools in the if', re: 'and\\s*\\(\\s*eq\\s+\\.Role\\s+"user"\\s*\\)\\s+\\$\\.Tools' },
          { label: 'Print {{ json $.Tools }}', re: 'json\\s+\\$\\.Tools' },
          { label: '[INST] {{ .Content }} with a capital C', re: '\\[INST\\]\\s*\\{\\{-?\\s*\\.Content\\s*-?\\}\\}' },
          { label: 'No lowercase .content', not: '.content' },
        ],
        hint: 'Inside range, the dot is the message, which has no Tools field. $ is always the top level.',
        explain: 'Go templates are case-sensitive, and $. reaches fields outside the loop, so $.Tools finds the request’s tool list.',
      },
    ],
    // L4 Chat tokens & stops
    [
      {
        kind: 'write',
        prompt: 'Give this merged Llama 3 model its own template and stop token.',
        starter: 'FROM ./coach-merged-Q4_K_M.gguf\n',
        solution:
          'FROM ./coach-merged-Q4_K_M.gguf\nTEMPLATE """{{- range .Messages }}<|start_header_id|>{{ .Role }}<|end_header_id|>\n\n{{ .Content }}<|eot_id|>\n{{- end }}<|start_header_id|>assistant<|end_header_id|>\n\n"""\nPARAMETER stop <|eot_id|>',
        checks: [
          { label: 'Loop over .Messages', re: '\\{\\{-?\\s*range\\s+\\.Messages\\s*-?\\}\\}' },
          { label: '<|start_header_id|>{{ .Role }}<|end_header_id|>', re: '<\\|start_header_id\\|>\\{\\{-?\\s*\\.Role\\s*-?\\}\\}<\\|end_header_id\\|>' },
          { label: '{{ .Content }} ends with <|eot_id|>', re: '\\{\\{-?\\s*\\.Content\\s*-?\\}\\}<\\|eot_id\\|>' },
          { label: 'Open the assistant header after the loop', re: '\\{\\{-?\\s*end\\s*-?\\}\\}\\s*<\\|start_header_id\\|>assistant<\\|end_header_id\\|>' },
          { label: 'PARAMETER stop <|eot_id|>', re: '^PARAMETER\\s+stop\\s+"?<\\|eot_id\\|>"?\\s*$', flags: 'm' },
        ],
        hint: 'Llama 3 wraps each role in header markers and ends every turn with <|eot_id|>.',
        explain: 'The merged model still speaks Llama 3’s markup, and the stop makes the reply end at its end-of-turn token.',
      },
      {
        kind: 'write',
        prompt: 'This Gemma model got ChatML end markers. Switch them to Gemma’s.',
        starter:
          'FROM ./gemma-notes-Q4_K_M.gguf\nTEMPLATE """{{- range .Messages }}<start_of_turn>{{ if eq .Role "assistant" }}model{{ else }}user{{ end }}\n{{ .Content }}<|im_end|>\n{{ end }}<start_of_turn>model\n"""\nPARAMETER stop <|im_end|>',
        solution:
          'FROM ./gemma-notes-Q4_K_M.gguf\nTEMPLATE """{{- range .Messages }}<start_of_turn>{{ if eq .Role "assistant" }}model{{ else }}user{{ end }}\n{{ .Content }}<end_of_turn>\n{{ end }}<start_of_turn>model\n"""\nPARAMETER stop <end_of_turn>',
        checks: [
          { label: 'End each turn with <end_of_turn>', re: '\\{\\{-?\\s*\\.Content\\s*-?\\}\\}<end_of_turn>' },
          { label: 'PARAMETER stop <end_of_turn>', re: '^PARAMETER\\s+stop\\s+"?<end_of_turn>"?\\s*$', flags: 'm' },
          { label: 'No ChatML <|im_end|> left', not: '<|im_end|>' },
          { label: 'Keep the open model turn at the end', re: '<start_of_turn>model\\s*\\n\\s*"""' },
        ],
        hint: 'Gemma opens a turn with <start_of_turn> and closes it with <end_of_turn>; the assistant role is called model.',
        explain: 'Markers from another family are just text to Gemma, so it never sees a turn end and the stop never fires.',
      },
    ],
    // L5 Build & test a template
    [
      {
        kind: 'write',
        prompt: 'Write a complete ChatML Modelfile for a barista bot, with one example exchange.',
        starter: '',
        solution: `FROM ./barista-F16.gguf\n${CHATML}\nPARAMETER stop <|im_end|>\nMESSAGE user Can I get a flat white?\nMESSAGE assistant Coming right up! Whole milk or oat?`,
        checks: [
          { label: 'FROM a model file', re: '^FROM\\s+\\S+', flags: 'm' },
          { label: 'A TEMPLATE that loops .Messages', re: '^TEMPLATE\\s+"""[\\s\\S]*range\\s+\\.Messages', flags: 'm' },
          { label: 'PARAMETER stop <|im_end|>', re: '^PARAMETER\\s+stop\\s+"?<\\|im_end\\|>"?\\s*$', flags: 'm' },
          { label: 'A MESSAGE user example', re: '^MESSAGE\\s+user\\s+\\S', flags: 'm' },
          { label: 'Followed by a MESSAGE assistant reply', re: '^MESSAGE\\s+user\\b[\\s\\S]*^MESSAGE\\s+assistant\\s+\\S', flags: 'm' },
        ],
        hint: 'FROM, TEMPLATE, PARAMETER stop, then MESSAGE lines: user first, assistant after.',
        explain: 'MESSAGE turns go through the template like real history, so they show the model the tone you want.',
      },
      {
        kind: 'write',
        prompt: 'Fix the Modelfile: the loop end, the missing stop and the example order.',
        starter:
          'FROM ./barber-F16.gguf\nTEMPLATE """{{- range .Messages }}<|im_start|>{{ .Role }}\n{{ .Content }}<|im_end|>\n{{ endrange }}<|im_start|>assistant\n"""\nMESSAGE assistant Sure! Saturday at 10 is free.\nMESSAGE user Can I book a trim?',
        solution: `FROM ./barber-F16.gguf\n${CHATML}\nPARAMETER stop <|im_end|>\nMESSAGE user Can I book a trim?\nMESSAGE assistant Sure! Saturday at 10 is free.`,
        checks: [
          { label: 'Close the loop with {{ end }}', re: '\\{\\{-?\\s*end\\s*-?\\}\\}<\\|im_start\\|>assistant' },
          { label: 'No endrange', not: 'endrange' },
          { label: 'Add PARAMETER stop <|im_end|>', re: '^PARAMETER\\s+stop\\s+"?<\\|im_end\\|>"?\\s*$', flags: 'm' },
          { label: 'The user example comes before the assistant one', re: '^MESSAGE\\s+user\\b[\\s\\S]*^MESSAGE\\s+assistant\\b', flags: 'm' },
        ],
        hint: 'Go templates close every block with plain {{ end }}. Examples read like a real chat: the user speaks first.',
        explain: 'Without the stop, the reply runs past <|im_end|> and invents the user’s next turn. Check the result with ollama show barber --modelfile.',
      },
    ],
  ],
};

export default unit;
