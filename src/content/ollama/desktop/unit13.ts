import type { DesktopUnit } from '../../../engine/types';

// Desktop edition: write-the-code challenges for Ollama unit 13 (Choosing & quantizing models).
// lessons[i] runs after lesson i + 1. See docs/CONTENT_GUIDE.md.

/** A quoted -d '@file.json' argument (PowerShell needs the quotes around @). */
const fileArg = `(-d|--data(-binary)?)\\s+(['"])@[\\w.\\\\/:-]+\\.json\\3`;

const unit: DesktopUnit = {
  // Windows PowerShell versions of shared items (the phone keeps the originals):
  // curl.exe, the JSON body in request.json, ConvertFrom-Json, Set-Content.
  overrides: {
    'L3.4': {
      kind: 'build',
      prompt: 'request.json holds {"model": "gemma3"}. Ask the API for gemma3’s details.',
      answer: ['curl.exe', 'http://localhost:11434/api/show', '-d', "'@request.json'"],
      distractors: ['http://localhost:11434/api/ps', '-X GET'],
      hint: 'It’s a POST with the model in the body. On Windows it’s curl.exe, and @ sends the file.',
      explain:
        'POST /api/show returns the same facts as ollama show, as JSON your code can read. In Windows PowerShell, plain curl is Invoke-WebRequest, so type curl.exe.',
      alt: [['curl.exe', '-d', "'@request.json'", 'http://localhost:11434/api/show']],
    },
    'L4.3': {
      kind: 'order',
      prompt: 'Download a GGUF, wrap it, create it, check it.',
      lines: [
        'curl.exe -LO https://huggingface.co/bartowski/Llama-3.2-3B-Instruct-GGUF/resolve/main/Llama-3.2-3B-Instruct-Q4_K_M.gguf',
        'Set-Content Modelfile "FROM ./Llama-3.2-3B-Instruct-Q4_K_M.gguf"',
        'ollama create mini -f Modelfile',
        'ollama show mini',
      ],
      hint: 'The file must exist before FROM can point at it.',
      explain:
        'show should then say quantization Q4_K_M: the quant comes from the file you downloaded. curl.exe -LO follows redirects and keeps the file name.',
    },
    'boss.4': {
      kind: 'order',
      prompt: 'Import a Q5_K_M GGUF with an 8k context.',
      lines: [
        'curl.exe -LO https://huggingface.co/bartowski/Mistral-7B-Instruct-v0.3-GGUF/resolve/main/Mistral-7B-Instruct-v0.3-Q5_K_M.gguf',
        '"FROM ./Mistral-7B-Instruct-v0.3-Q5_K_M.gguf", "PARAMETER num_ctx 8192" | Set-Content Modelfile',
        'ollama create mistral-q5 -f Modelfile',
        'ollama show mistral-q5',
        'ollama run mistral-q5',
      ],
      hint: 'File, Modelfile, create, check, use.',
      explain:
        'The GGUF is used as-is, so show reports Q5_K_M, and the PARAMETER line bakes in the 8192-token context. Set-Content writes each string on its own line.',
    },
    'boss.5': {
      kind: 'build',
      prompt: 'request.json holds {"model": "gemma3"}. Print just its quantization from the API.',
      answer: ["(curl.exe -s http://localhost:11434/api/show -d '@request.json'", '|', 'ConvertFrom-Json)', '.details.quantization_level'],
      distractors: ['.quantization', '.model_info.quantization'],
      hint: 'It lives under details, in snake_case.',
      explain:
        'ConvertFrom-Json turns the reply into an object, and details.quantization_level is handy in scripts, for example to check every model is the quant you expect.',
      output: 'Q4_K_M',
    },
  },
  lessons: [
    // L1 Sizes & tags
    [
      {
        kind: 'write',
        prompt: 'Pull the 1b and 3b sizes of llama3.2, then chat with the smaller one.',
        starter: '',
        solution: 'ollama pull llama3.2:1b\nollama pull llama3.2:3b\nollama run llama3.2:1b "Suggest a name for a bakery."',
        checks: [
          { label: 'Pull llama3.2:1b', re: 'ollama pull llama3\\.2:1b\\b' },
          { label: 'Pull llama3.2:3b', re: 'ollama pull llama3\\.2:3b\\b' },
          { label: 'Run the 1b model', re: 'ollama run llama3\\.2:1b\\b' },
        ],
        hint: 'The size goes after a colon: model:tag.',
        explain: 'Same family, different sizes: 1b is faster and lighter, 3b answers better. Without a tag you get :latest, which is 3b here.',
        output: 'Rise & Shine Bakery (sample reply)',
      },
      {
        kind: 'write',
        prompt: 'Give each pull the tag that matches its comment.',
        starter:
          '# laptop with 16 GB RAM: qwen3 at 8 billion parameters\nollama pull qwen3\n# Raspberry Pi: the smallest qwen3\nollama pull qwen3\n# llama3.2 3b instruct, 8-bit quantization\nollama pull llama3.2',
        solution:
          '# laptop with 16 GB RAM: qwen3 at 8 billion parameters\nollama pull qwen3:8b\n# Raspberry Pi: the smallest qwen3\nollama pull qwen3:0.6b\n# llama3.2 3b instruct, 8-bit quantization\nollama pull llama3.2:3b-instruct-q8_0',
        checks: [
          { label: 'qwen3:8b for the laptop', re: 'ollama pull qwen3:8b\\b' },
          { label: 'qwen3:0.6b for the Pi', re: 'ollama pull qwen3:0\\.6b\\b' },
          { label: 'llama3.2:3b-instruct-q8_0', re: 'ollama pull llama3\\.2:3b-instruct-q8_0\\b' },
        ],
        hint: 'Size tags look like 0.6b or 8b. Long tags read size-tuning-quantization.',
        explain: 'A tag picks exactly one variant: its size, its tuning and how its weights are stored.',
      },
    ],
    // L2 Quantization levels
    [
      {
        kind: 'write',
        prompt: 'Pull llama3.2:3b-instruct at fp16, q8_0 and q4_K_M, biggest first.',
        starter: '',
        solution:
          'ollama pull llama3.2:3b-instruct-fp16     # 6.4 GB\nollama pull llama3.2:3b-instruct-q8_0     # 3.4 GB\nollama pull llama3.2:3b-instruct-q4_K_M   # 2.0 GB',
        checks: [
          { label: 'Pull the fp16 tag', re: 'ollama pull llama3\\.2:3b-instruct-fp16\\b' },
          { label: 'Pull the q8_0 tag', re: 'ollama pull llama3\\.2:3b-instruct-q8_0\\b' },
          { label: 'Pull the q4_K_M tag', re: 'ollama pull llama3\\.2:3b-instruct-q4_K_M\\b' },
          { label: 'Biggest to smallest: fp16, q8_0, q4_K_M', re: 'fp16[\\s\\S]*q8_0[\\s\\S]*q4_K_M' },
        ],
        hint: 'fp16 is 16 bits per weight, q8_0 about 8, q4_K_M about 4.5. Tags are case-sensitive: q4_K_M.',
        explain: 'Same 3 billion weights each time; fewer bits per weight shrink the file to about a third.',
      },
      {
        kind: 'write',
        prompt: 'Run the variant that fits in 6 GB of VRAM, then check where it runs.',
        starter:
          '# GPU has 6 GB of VRAM; leave room for context\n# qwen2.5-coder:7b-instruct-fp16     15 GB\n# qwen2.5-coder:7b-instruct-q8_0     8.1 GB\n# qwen2.5-coder:7b-instruct-q4_K_M   4.7 GB\nollama run qwen2.5-coder:7b-instruct-fp16',
        solution:
          '# GPU has 6 GB of VRAM; leave room for context\n# qwen2.5-coder:7b-instruct-fp16     15 GB\n# qwen2.5-coder:7b-instruct-q8_0     8.1 GB\n# qwen2.5-coder:7b-instruct-q4_K_M   4.7 GB\nollama run qwen2.5-coder:7b-instruct-q4_K_M\nollama ps',
        checks: [
          { label: 'Run the q4_K_M variant', re: '^\\s*ollama run qwen2\\.5-coder:7b-instruct-q4_K_M\\b', flags: 'm' },
          { label: 'Don’t run fp16 (15 GB)', not: 'ollama run qwen2.5-coder:7b-instruct-fp16' },
          { label: 'Check the PROCESSOR column with ollama ps', re: 'ollama ps' },
        ],
        hint: 'Only one file is smaller than 6 GB with room to spare.',
        explain: 'If a model doesn’t fit in VRAM, part of it runs on the CPU and every token gets slower; ollama ps would show a CPU/GPU split.',
        output: 'NAME                                SIZE      PROCESSOR    CONTEXT\nqwen2.5-coder:7b-instruct-q4_K_M    5.4 GB    100% GPU     4096',
      },
    ],
    // L3 Reading show & ps
    [
      {
        kind: 'write',
        prompt: 'Check a model’s quantization, load it, then see how it is running.',
        starter: '',
        solution: 'ollama show phi4\nollama run phi4 "Say ready."\nollama ps',
        checks: [
          { label: 'Read its details with ollama show', re: 'ollama show \\S+' },
          { label: 'Load it with ollama run', re: 'ollama run \\S+' },
          { label: 'Then check memory with ollama ps', re: 'ollama run[\\s\\S]*ollama ps' },
        ],
        hint: 'show reads the model file; ps only lists models that are loaded right now.',
        explain: 'show tells you parameters, quantization and context length; ps tells you SIZE in memory and how much sits on the GPU.',
        output: 'NAME           SIZE     PROCESSOR          CONTEXT    UNTIL\nphi4:latest    11 GB    18%/82% CPU/GPU    4096       4 minutes from now',
      },
      {
        kind: 'write',
        prompt: 'Fill in the monitoring script with the REST versions of show and ps.',
        starter: '# 1. print the quantization of mistral (from /api/show)\n# 2. print each loaded model with size and size_vram (from /api/ps)\n',
        solution:
          '# 1. print the quantization of mistral (from /api/show)\n\'{"model": "mistral"}\' | Set-Content request.json\n(curl.exe -s http://localhost:11434/api/show -d \'@request.json\' | ConvertFrom-Json).details.quantization_level\n# 2. print each loaded model with size and size_vram (from /api/ps)\n(curl.exe -s http://localhost:11434/api/ps | ConvertFrom-Json).models | Select-Object name, size, size_vram',
        checks: [
          { label: 'Save {"model": "mistral"} as the body file', re: '"model":\\s*"mistral"' },
          { label: "POST it to /api/show with curl.exe -d '@file.json'", re: `curl\\.exe[^\\n]*/api/show[^\\n]*${fileArg}` },
          { label: 'Parse the replies with ConvertFrom-Json', re: 'ConvertFrom-Json' },
          { label: 'Read .details.quantization_level', re: '\\.details\\.quantization_level' },
          { label: 'GET /api/ps with curl.exe', re: 'curl\\.exe[^\\n]*/api/ps' },
          { label: 'Show size_vram for each model', re: '\\.models[\\s\\S]*size_vram' },
        ],
        hint: 'Save the body with Set-Content, then pipe curl.exe -s into ConvertFrom-Json. /api/ps needs no body and returns a models array.',
        explain: 'If size_vram is less than size, part of the model is on the CPU, the same split ollama ps shows.',
        output: 'Q4_K_M\n\nname           size       size_vram\n----           ----       ---------\nmistral:latest 5137025024 5137025024',
      },
    ],
    // L4 Importing GGUF
    [
      {
        kind: 'write',
        prompt: 'Run a Hugging Face GGUF at Q4_K_M, then pull the same repo at Q8_0.',
        starter: '',
        solution: 'ollama run hf.co/bartowski/Qwen2.5-7B-Instruct-GGUF:Q4_K_M\nollama pull hf.co/bartowski/Qwen2.5-7B-Instruct-GGUF:Q8_0',
        checks: [
          { label: 'ollama run hf.co/user/repo:Q4_K_M', re: 'ollama run hf\\.co/[\\w.-]+/[\\w.-]+:Q4_K_M\\b', flags: 'i' },
          { label: 'ollama pull the Q8_0 quant', re: 'ollama pull hf\\.co/[\\w.-]+/[\\w.-]+:Q8_0\\b', flags: 'i' },
          { label: 'Both from the same repo', re: 'hf\\.co/([\\w.-]+/[\\w.-]+):\\w+[\\s\\S]*hf\\.co/\\1:' },
        ],
        hint: 'The quant goes after a colon, like any tag: hf.co/user/repo:QUANT.',
        explain: 'Ollama picks the GGUF file for that quant from the repo. It doesn’t requantize, so each quant is its own download.',
      },
      {
        kind: 'write',
        prompt: 'Build this reviewer on the downloaded GGUF file with an 8K window.',
        starter: '# downloaded: ./Mistral-7B-Instruct-v0.3-Q4_K_M.gguf\nFROM mistral\nSYSTEM You review pull requests in one paragraph.\n',
        solution:
          '# downloaded: ./Mistral-7B-Instruct-v0.3-Q4_K_M.gguf\nFROM ./Mistral-7B-Instruct-v0.3-Q4_K_M.gguf\nSYSTEM You review pull requests in one paragraph.\nPARAMETER num_ctx 8192',
        checks: [
          { label: 'FROM the local .gguf file', re: '^FROM\\s+\\./Mistral-7B-Instruct-v0\\.3-Q4_K_M\\.gguf\\s*$', flags: 'm' },
          { label: 'Not FROM the library model', not: 'FROM mistral' },
          { label: 'Keep the SYSTEM line', re: '^SYSTEM\\s+\\S', flags: 'm' },
          { label: 'PARAMETER num_ctx 8192', re: '^PARAMETER\\s+num_ctx\\s+8192\\s*$', flags: 'm' },
        ],
        hint: 'FROM takes a path to a .gguf file as well as a model name. Then: ollama create reviewer -f Modelfile.',
        explain: 'FROM a file imports those exact weights; the other Modelfile lines work the same as on a library model.',
      },
    ],
    // L5 Picking a model
    [
      {
        kind: 'write',
        prompt: 'Pull a Hugging Face model, give it a short name and remove the long tag.',
        starter: '',
        solution:
          'ollama pull hf.co/bartowski/Llama-3.2-3B-Instruct-GGUF:Q4_K_M\nollama cp hf.co/bartowski/Llama-3.2-3B-Instruct-GGUF:Q4_K_M helper\nollama rm hf.co/bartowski/Llama-3.2-3B-Instruct-GGUF:Q4_K_M\nollama run helper',
        checks: [
          { label: 'Pull from hf.co', re: 'ollama pull hf\\.co/\\S+' },
          { label: 'ollama cp the hf.co tag to a short name', re: 'ollama cp hf\\.co/\\S+\\s+[\\w.:-]+' },
          { label: 'ollama rm the long hf.co tag', re: 'ollama rm hf\\.co/\\S+' },
          { label: 'Run it by the short name', re: 'ollama cp \\S+\\s+([\\w.:-]+)[\\s\\S]*ollama run \\1\\b' },
        ],
        hint: 'ollama cp SOURCE NEW adds a second name for the same model; then rm the long one.',
        explain: 'cp only adds a name for the same blobs, so removing the long name keeps the model under its short one.',
      },
      {
        kind: 'write',
        prompt: 'Swap the models so each job gets the right size, and clean up.',
        starter:
          '# job 1: tag every support ticket as billing, bug or other (runs all day)\nollama run qwen3:32b\n# job 2: refactor a 600-line C# class\nollama run llama3.2:1b\n# clean up: llama3.2:3b-instruct-fp16 (6.4 GB) is unused\n',
        solution:
          '# job 1: tag every support ticket as billing, bug or other (runs all day)\nollama run llama3.2:3b\n# job 2: refactor a 600-line C# class\nollama run qwen2.5-coder:14b\n# clean up: llama3.2:3b-instruct-fp16 (6.4 GB) is unused\nollama rm llama3.2:3b-instruct-fp16',
        checks: [
          { label: 'Job 1: a small model (4b or less)', re: 'job 1[^\\n]*\\n\\s*ollama run [\\w.-]+:(0\\.5|0\\.6|1|1\\.5|1\\.7|2|3|4)b\\b' },
          { label: 'Job 2: a model of 7b or more', re: 'job 2[^\\n]*\\n\\s*ollama run [\\w.-]+:([7-9]|[1-9]\\d+)b\\b' },
          { label: 'ollama rm the fp16 variant', re: 'ollama rm llama3\\.2:3b-instruct-fp16\\b' },
        ],
        hint: 'Short, repetitive labelling suits a 1b–4b model; code and reasoning want 7b or more.',
        explain: 'The smallest model that does the job well is fastest and cheapest; save the big one for work that needs it.',
      },
    ],
  ],
};

export default unit;
