import type { DesktopUnit } from '../../../engine/types';

// Desktop edition: write-the-code challenges for Ollama unit 17 (Context & memory).
// lessons[i] runs after lesson i + 1. See docs/CONTENT_GUIDE.md.
const HEADER = (model: string) =>
  `using Microsoft.Extensions.AI;\nusing OllamaSharp;\n\nIChatClient chat = new OllamaApiClient(new Uri("http://localhost:11434"), "${model}");\n`;

/** A quoted -d '@file.json' argument (PowerShell needs the quotes around @). */
const fileArg = `(-d|--data(-binary)?)\\s+(['"])@[\\w.\\\\/:-]+\\.json\\3`;

const unit: DesktopUnit = {
  // Windows PowerShell versions of shared items (the phone keeps the originals):
  // ConvertFrom-Json instead of jq, the JSON body in request.json for curl.exe.
  overrides: {
    'L2.4': {
      kind: 'build',
      prompt: '$r holds the parsed reply. Add up the tokens used.',
      answer: ['$r.prompt_eval_count', '+', '$r.eval_count'],
      distractors: ['$r.eval_duration', '$r.total_duration'],
      hint: 'Tokens read plus tokens written.',
      explain: 'Both sides share the window, so the sum is how full it was after this reply. ConvertFrom-Json gave you $r.',
      alt: [['$r.eval_count', '+', '$r.prompt_eval_count']],
      output: '3850',
    },
    'L5.6': {
      kind: 'type',
      prompt: 'Write request.json to preload qwen3:4b for an hour without a prompt.',
      template: "___\n# PS> curl.exe localhost:11434/api/chat -d '@request.json'",
      accept: [
        '{"model": "qwen3:4b", "keep_alive": "1h"}',
        '{"model": "qwen3:4b", "keep_alive": "60m"}',
        '{"keep_alive": "1h", "model": "qwen3:4b"}',
        '{"keep_alive": "60m", "model": "qwen3:4b"}',
      ],
      hint: 'A body with just a model loads it.',
      explain:
        "With no messages the request only loads the model, so the first real user doesn’t wait for it. curl.exe -d '@request.json' sends the file’s contents.",
    },
  },
  lessons: [
    // L1 Windows & overflow
    [
      {
        kind: 'write',
        prompt: 'Send a wedding-planning chat with a 16384-token context window.',
        starter: '',
        solution:
          '{\n  "model": "qwen3:4b",\n  "messages": [\n    {"role": "system", "content": "You help plan a wedding. Keep answers short."},\n    {"role": "user", "content": "Here is the guest list and seating notes: ..."}\n  ],\n  "options": {"num_ctx": 16384},\n  "stream": false\n}\n# save as request.json, then in PowerShell:\ncurl.exe http://localhost:11434/api/chat -d \'@request.json\'',
        checks: [
          { label: 'POST to /api/chat with curl.exe', re: 'curl\\.exe[^\\n]*/api/chat' },
          { label: "Send the body file with -d '@request.json'", re: fileArg },
          { label: 'A system message first', re: '"messages":\\s*\\[\\s*\\{\\s*"role":\\s*"system"' },
          { label: 'Then a user message', re: '"role":\\s*"user"' },
          { label: '"num_ctx": 16384 inside "options"', re: '"options":\\s*\\{[^}]*"num_ctx":\\s*16384' },
        ],
        hint: 'Write the body (request.json), then the curl.exe line. num_ctx is an option, so it goes in the "options" object, not at the top level.',
        explain: 'The window must hold the system prompt, the history and the reply. Too small, and Ollama silently drops the oldest turns.',
      },
      {
        kind: 'write',
        prompt: 'Fix the window parameter and raise it to 32768 for long contracts.',
        starter: 'FROM llama3.2:3b\nSYSTEM You answer questions about the contract the user pastes.\nPARAMETER context 4096\n',
        solution: 'FROM llama3.2:3b\nSYSTEM You answer questions about the contract the user pastes.\nPARAMETER num_ctx 32768\n',
        checks: [
          { label: 'PARAMETER num_ctx 32768', re: '^PARAMETER\\s+num_ctx\\s+32768\\s*$', flags: 'm' },
          { label: 'No PARAMETER context', not: 'PARAMETER context' },
          { label: 'Keep FROM and SYSTEM', re: '^FROM\\s+\\S+[\\s\\S]*^SYSTEM\\s+\\S', flags: 'm' },
        ],
        hint: 'The Modelfile name matches the API option: num_ctx.',
        explain: 'Baked into the model, every request gets the bigger window. More context also means more memory, so check ollama ps.',
      },
    ],
    // L2 Measuring the prompt
    [
      {
        kind: 'write',
        prompt: 'Print how many tokens a chat turn used and how many of 8192 are left.',
        starter: '',
        solution:
          "curl.exe -s http://localhost:11434/api/chat -d '@chat.json' | Set-Content reply.json\n$r = Get-Content reply.json -Raw | ConvertFrom-Json\n$r.prompt_eval_count + $r.eval_count\n8192 - ($r.prompt_eval_count + $r.eval_count)",
        checks: [
          { label: 'Save the curl.exe reply to a file', re: 'curl\\.exe[^\\n]*/api/chat[^\\n]*(>\\s*\\S+|\\|\\s*(Set-Content|Out-File)\\s+\\S+)' },
          { label: 'Read it back with ConvertFrom-Json', re: 'ConvertFrom-Json' },
          {
            label: 'Used: prompt_eval_count + eval_count',
            re: '\\$\\w+\\.prompt_eval_count\\s*\\+\\s*\\$\\w+\\.eval_count|\\$\\w+\\.eval_count\\s*\\+\\s*\\$\\w+\\.prompt_eval_count',
          },
          {
            label: 'Left: 8192 minus the sum',
            re: '8192\\s*-\\s*\\(\\s*\\$\\w+\\.(prompt_eval_count|eval_count)\\s*\\+|8192\\s*-\\s*\\$\\w+\\.prompt_eval_count\\s*-\\s*\\$\\w+\\.eval_count',
          },
        ],
        hint: 'Read the saved reply with Get-Content -Raw | ConvertFrom-Json. prompt_eval_count is what the model read; eval_count is what it wrote.',
        explain: 'The next turn reads all of this again plus your new message, so “left” is your budget for it and the reply.',
        output: '3850\n4342 (sample)',
      },
      {
        kind: 'write',
        prompt: 'After each reply, print token use and warn when the next turn may not fit.',
        starter: `${HEADER('qwen3:4b')}List<ChatMessage> history = [new(ChatRole.System, "You are a patient Spanish tutor.")];\nconst int NumCtx = 8192, ReplyRoom = 1024;\nhistory.Add(new(ChatRole.User, "Explain ser vs estar."));\n// TODO: get a reply, save it, print the token counts, warn if close to full\n`,
        solution: `${HEADER('qwen3:4b')}List<ChatMessage> history = [new(ChatRole.System, "You are a patient Spanish tutor.")];\nconst int NumCtx = 8192, ReplyRoom = 1024;\nhistory.Add(new(ChatRole.User, "Explain ser vs estar."));\nChatResponse r = await chat.GetResponseAsync(history);\nhistory.AddMessages(r);\nlong input = r.Usage?.InputTokenCount ?? 0;\nlong output = r.Usage?.OutputTokenCount ?? 0;\nConsole.WriteLine($"read {input}, wrote {output}");\nif (input + output > NumCtx - ReplyRoom)\n    Console.WriteLine("Warning: trim the history before the next turn.");\n`,
        checks: [
          { label: 'Get a reply and save it with AddMessages', re: 'GetResponseAsync\\(\\s*history[\\s\\S]*history\\.AddMessages\\(' },
          { label: 'Read r.Usage?.InputTokenCount', re: '\\.Usage\\??\\.InputTokenCount' },
          { label: 'Read r.Usage?.OutputTokenCount', re: '\\.Usage\\??\\.OutputTokenCount' },
          { label: 'Compare against NumCtx - ReplyRoom', re: 'NumCtx\\s*-\\s*ReplyRoom' },
          { label: 'Print a warning', re: 'Console\\.WriteLine\\(\\s*"[^"]*(warn|trim|full|fit)[^"]*"', flags: 'i' },
        ],
        hint: 'Usage is the C# side of prompt_eval_count and eval_count. It can be null, so use ?. and ??.',
        explain: 'Leaving room for the reply stops the window filling mid-answer, before Ollama starts dropping old turns.',
        output: 'read 412, wrote 230 (sample)',
      },
    ],
    // L3 Sliding windows in C#
    [
      {
        kind: 'write',
        prompt: 'Finish the trivia loop: ask, print, then slide the window to MaxMessages.',
        starter: `${HEADER('llama3.2')}const int MaxMessages = 7;   // system + 3 pairs\nList<ChatMessage> history = [new(ChatRole.System, "You are a trivia host.")];\nwhile (Console.ReadLine() is string answer)\n{\n    // TODO\n}`,
        solution: `${HEADER('llama3.2')}const int MaxMessages = 7;   // system + 3 pairs\nList<ChatMessage> history = [new(ChatRole.System, "You are a trivia host.")];\nwhile (Console.ReadLine() is string answer)\n{\n    history.Add(new(ChatRole.User, answer));\n    ChatResponse r = await chat.GetResponseAsync(history);\n    history.AddMessages(r);\n    Console.WriteLine(r.Text);\n    while (history.Count > MaxMessages)\n        history.RemoveRange(1, 2);\n}`,
        checks: [
          { label: 'Add the user’s answer to history', re: 'history\\.Add\\(\\s*new\\s*(ChatMessage)?\\(\\s*ChatRole\\.User\\s*,\\s*answer\\s*\\)\\s*\\)' },
          { label: 'Save the reply with AddMessages', re: 'history\\.AddMessages\\(' },
          { label: 'Loop while history.Count > MaxMessages', re: 'while\\s*\\(\\s*history\\.Count\\s*>\\s*MaxMessages\\s*\\)' },
          { label: 'Remove the oldest pair: RemoveRange(1, 2)', re: 'RemoveRange\\(\\s*1\\s*,\\s*2\\s*\\)' },
          { label: 'Trim after saving the reply', re: 'AddMessages\\([\\s\\S]*RemoveRange\\(' },
        ],
        hint: 'Index 0 is the system message, so the oldest user/assistant pair starts at index 1.',
        explain: 'The host keeps its rules and the latest three exchanges; older ones slide out before the window overflows.',
      },
      {
        kind: 'write',
        prompt: 'Trim by tokens, not message count, and never drop the system message.',
        starter: `${HEADER('qwen3:4b')}List<ChatMessage> history = [new(ChatRole.System, "You review code snippets.")];\nhistory.Add(new(ChatRole.User, snippet));\nChatResponse r = await chat.GetResponseAsync(history);\nhistory.AddMessages(r);\nif (history.Count > 9)\n    history.RemoveRange(0, 2);`,
        solution: `${HEADER('qwen3:4b')}List<ChatMessage> history = [new(ChatRole.System, "You review code snippets.")];\nhistory.Add(new(ChatRole.User, snippet));\nChatResponse r = await chat.GetResponseAsync(history);\nhistory.AddMessages(r);\nif (r.Usage?.InputTokenCount > 3000 && history.Count > 3)\n    history.RemoveRange(1, 2);`,
        checks: [
          { label: 'Test r.Usage?.InputTokenCount against a limit', re: '\\.Usage\\??\\.InputTokenCount\\s*(\\?\\?\\s*0\\s*)?>\\s*\\d+' },
          { label: 'No message-count rule', not: 'history.Count > 9' },
          { label: 'RemoveRange(1, 2) keeps index 0', re: 'RemoveRange\\(\\s*1\\s*,\\s*2\\s*\\)' },
          { label: 'Never RemoveRange(0, …)', not: 'RemoveRange(0' },
        ],
        hint: 'One pasted file can fill the window in one message, so measure tokens. Index 0 is the system message.',
        explain: 'InputTokenCount says how full the prompt really was; removing from index 1 keeps the reviewer’s rules.',
      },
    ],
    // L4 Summaries & memory
    [
      {
        kind: 'write',
        prompt: 'Summarize the 4 oldest turns into one system note at index 1.',
        starter: '// history: system message, then a long trip-planning chat\n',
        solution:
          '// history: system message, then a long trip-planning chat\nstring old = string.Join("\\n", history.GetRange(1, 4).Select(m => $"{m.Role}: {m.Text}"));\nChatResponse s = await chat.GetResponseAsync($"Summarize in 3 bullets:\\n{old}");\nhistory.RemoveRange(1, 4);\nhistory.Insert(1, new ChatMessage(ChatRole.System, $"Earlier: {s.Text}"));',
        checks: [
          { label: 'Take the oldest turns with GetRange(1, 4)', re: 'GetRange\\(\\s*1\\s*,\\s*4\\s*\\)' },
          { label: 'Ask the model to summarize them', re: 'GetResponseAsync\\(\\s*\\$?"[^"]*summar', flags: 'i' },
          { label: 'Remove the same 4 with RemoveRange(1, 4)', re: 'RemoveRange\\(\\s*1\\s*,\\s*4\\s*\\)' },
          { label: 'Insert a ChatRole.System summary at index 1', re: 'Insert\\(\\s*1\\s*,\\s*new\\s*(ChatMessage)?\\(\\s*ChatRole\\.System' },
          { label: 'Remove before you insert', re: 'RemoveRange\\([\\s\\S]*\\.Insert\\(\\s*1' },
        ],
        hint: 'Inserting first would shift the old turns to index 2, and RemoveRange(1, 4) would delete your summary.',
        explain: 'Four turns shrink to a few bullets, so the gist survives while the window gets its space back.',
      },
      {
        kind: 'write',
        prompt: 'Load facts from memory.json, save the new one, and add them to the system prompt.',
        starter:
          'using System.Text.Json;\nusing Microsoft.Extensions.AI;\n\nList<string> facts = [];\nfacts.Add("Prefers metric units");\n// TODO: load before, save after, build the system message\n',
        solution:
          'using System.Text.Json;\nusing Microsoft.Extensions.AI;\n\nList<string> facts = File.Exists("memory.json")\n    ? JsonSerializer.Deserialize<List<string>>(File.ReadAllText("memory.json")) ?? []\n    : [];\nfacts.Add("Prefers metric units");\nFile.WriteAllText("memory.json", JsonSerializer.Serialize(facts));\nvar system = new ChatMessage(ChatRole.System,\n    "You are a cooking helper. Facts about the user:\\n- " + string.Join("\\n- ", facts));',
        checks: [
          { label: 'Only load when File.Exists("memory.json")', re: 'File\\.Exists\\(\\s*"memory\\.json"\\s*\\)' },
          { label: 'Deserialize<List<string>> the file', re: 'Deserialize<List<string>>\\(' },
          {
            label: 'Write Serialize(facts) back to memory.json',
            re: 'File\\.WriteAllText(Async)?\\(\\s*"memory\\.json"\\s*,\\s*JsonSerializer\\.Serialize\\(\\s*facts\\s*\\)',
          },
          { label: 'Put the facts in a ChatRole.System message', re: 'ChatRole\\.System[\\s\\S]*string\\.Join\\([^)]*facts' },
          { label: 'Load before adding the new fact', re: 'Deserialize[\\s\\S]*facts\\.Add\\(' },
        ],
        hint: 'Read with File.ReadAllText + Deserialize, write with Serialize + File.WriteAllText. The file may not exist yet.',
        explain: 'The chat history ends with the session; a small facts file lasts and rides along in every system prompt.',
      },
    ],
    // L5 Keeping the cache warm
    [
      {
        kind: 'write',
        prompt: 'Send the next help-desk turn, keeping the model loaded for 30 minutes.',
        starter: '',
        solution:
          '{\n  "model": "qwen3:4b",\n  "keep_alive": "30m",\n  "messages": [\n    {"role": "system", "content": "You are a calm help-desk agent for a bike shop."},\n    {"role": "user", "content": "My gears slip."},\n    {"role": "assistant", "content": "Try a quarter turn on the barrel adjuster."},\n    {"role": "user", "content": "Still slipping on the big cog."}\n  ],\n  "stream": false\n}\n# save as request.json, then in PowerShell:\ncurl.exe http://localhost:11434/api/chat -d \'@request.json\'',
        checks: [
          { label: "POST it to /api/chat with curl.exe -d '@request.json'", re: `curl\\.exe[^\\n]*/api/chat[^\\n]*${fileArg}` },
          { label: '"keep_alive": "30m"', re: '"keep_alive":\\s*("30m"|1800|"1800s")\\s*[,}]' },
          { label: 'The same system message first', re: '"messages":\\s*\\[\\s*\\{\\s*"role":\\s*"system"' },
          { label: 'Keep the earlier turns', re: '"role":\\s*"assistant"' },
          { label: 'The new user message goes last', re: '\\{\\s*"role":\\s*"user"[^{}]*\\}\\s*\\]' },
        ],
        hint: 'The cache only helps if the model is still loaded and the prompt starts the same way.',
        explain: 'Same start, new message at the end: Ollama reuses the cached tokens and only reads the new turn.',
      },
      {
        kind: 'write',
        prompt: 'Keep the prompt start stable: take the clock out of the system message.',
        starter: `${HEADER('qwen3:4b')}// rebuilt before every turn\nhistory[0] = new ChatMessage(ChatRole.System, $"Time: {DateTime.Now:HH:mm:ss}. You are a quiz host.");\nhistory.Add(new(ChatRole.User, answer));\nChatResponse r = await chat.GetResponseAsync(history);\nhistory.AddMessages(r);`,
        solution: `${HEADER('qwen3:4b')}const string Rules = "You are a quiz host.";\n// rebuilt before every turn, but always identical\nhistory[0] = new ChatMessage(ChatRole.System, Rules);\nhistory.Add(new(ChatRole.User, $"[{DateTime.Now:HH:mm}] {answer}"));\nChatResponse r = await chat.GetResponseAsync(history);\nhistory.AddMessages(r);`,
        checks: [
          { label: 'A system message with fixed text', re: 'ChatRole\\.System\\s*,\\s*(\\w+|"[^"{]*")\\s*\\)' },
          { label: 'No timestamp in the system message', re: '^(?![\\s\\S]*ChatRole\\.System[^;]*DateTime)' },
          { label: 'Still add the user message at the end', re: 'history\\.Add\\(\\s*new\\s*(ChatMessage)?\\(\\s*ChatRole\\.User' },
          { label: 'Still save the reply', re: 'history\\.AddMessages\\(' },
        ],
        hint: 'Anything that changes every turn belongs at the end of the prompt, if anywhere.',
        explain: 'A new timestamp at the very start changes the first tokens, so the whole cached prompt is read again every turn.',
      },
    ],
  ],
};

export default unit;
