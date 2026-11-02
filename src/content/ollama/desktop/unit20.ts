import type { DesktopUnit } from '../../../engine/types';

// Desktop edition: write-the-code challenges for Ollama unit 20 (Capstone: a local AI assistant).
// lessons[i] runs after lesson i + 1. See docs/CONTENT_GUIDE.md.
// Scenario: recipe-bot, an offline assistant for your recipe notes.
const HEADER =
  'using Microsoft.Extensions.AI;\nusing OllamaSharp;\n\nIChatClient chat = new OllamaApiClient(new Uri("http://localhost:11434"), "recipe-bot");\n';
const TOOLS_MODEL = '(qwen3|qwen2\\.5|llama3\\.[123]|mistral|granite3|gpt-oss|command-r)';
const EMBED_MODEL = '(embeddinggemma|nomic-embed-text|mxbai-embed-large|all-minilm|bge-m3|qwen3-embedding|snowflake-arctic-embed)';

const unit: DesktopUnit = {
  // Windows PowerShell versions of shared items (the phone keeps the originals):
  // setx + a restart from the tray, curl.exe with the JSON body in a file.
  overrides: {
    'L2.7': {
      kind: 'build',
      prompt: 'Keep the model loaded between questions.',
      answer: ['setx', 'OLLAMA_KEEP_ALIVE', '1h'],
      distractors: ['OLLAMA_HOST', 'run'],
      hint: 'The server-wide keep-alive variable, saved with setx.',
      explain: 'After you quit Ollama from the tray and start it again, a model that stays loaded answers fast and keeps its cache warm between turns.',
    },
    'L5.3': {
      kind: 'order',
      prompt: 'preload.json holds {"model": "notes-bot"}. Order the first deploy.',
      lines: [
        'docker compose up -d',
        'docker compose cp Modelfile ollama:/Modelfile',
        'docker compose exec ollama ollama create notes-bot -f /Modelfile',
        "curl.exe localhost:11434/api/chat -d '@preload.json'",
      ],
      hint: 'Start, copy, build, then preload.',
      explain:
        'The model is built inside the container, then a request without messages loads it before users arrive. In Windows PowerShell, type curl.exe: plain curl is Invoke-WebRequest.',
    },
    'boss.2': {
      kind: 'build',
      prompt: 'Build request.json to call notes-bot over /api/chat without streaming.',
      answer: ['{"model": "notes-bot",', '"messages": [{"role": "user", "content": "Any birthdays?"}],', '"stream": false}'],
      distractors: ['"prompt": "Any birthdays?",', '"stream": true}'],
      hint: 'Chat takes messages; turn streaming off.',
      explain:
        "Send it with curl.exe localhost:11434/api/chat -d '@request.json'. With stream false the whole reply comes back as one object with the text in message.content.",
      output: '{"model":"notes-bot","message":{"role":"assistant","content":"Mia’s birthday is 2 July."},"done":true, ...}',
    },
  },
  lessons: [
    // L1 Pick & package the model
    [
      {
        kind: 'write',
        prompt: 'Write the Modelfile for recipe-bot: a tools-capable base, its role, low temperature, 8K window.',
        starter: '',
        solution:
          'FROM qwen3:4b\nSYSTEM """You answer questions about the user’s recipe notes. Cite the note file."""\nPARAMETER temperature 0.2\nPARAMETER num_ctx 8192',
        checks: [
          { label: 'FROM a chat model with tools (qwen3, llama3.1…)', re: `^FROM\\s+${TOOLS_MODEL}`, flags: 'm' },
          { label: 'A SYSTEM role that says to cite the note', re: '^SYSTEM\\s+[\\s\\S]*\\bcite', flags: 'mi' },
          { label: 'PARAMETER temperature 0.3 or lower', re: '^PARAMETER\\s+temperature\\s+0(\\.[0-3]\\d*)?\\s*$', flags: 'm' },
          { label: 'PARAMETER num_ctx of 8192 or more', re: '^PARAMETER\\s+num_ctx\\s+(8192|9\\d{3}|[1-9]\\d{4,})\\s*$', flags: 'm' },
        ],
        hint: 'The bot will call a search tool, so check the base lists tools under Capabilities.',
        explain: 'Baking the role and settings into the model means every client gets the same bot, from curl to C#.',
      },
      {
        kind: 'write',
        prompt: 'Pull both models, build recipe-bot, check its Modelfile and try it.',
        starter: '# Modelfile is ready in this folder\n',
        solution:
          '# Modelfile is ready in this folder\nollama pull qwen3:4b\nollama pull embeddinggemma\nollama create recipe-bot -f Modelfile\nollama show recipe-bot --modelfile\nollama run recipe-bot "Which of my recipes use lentils?"',
        checks: [
          { label: 'Pull the chat model', re: `ollama pull ${TOOLS_MODEL}` },
          { label: 'Pull an embedding model', re: `ollama pull ${EMBED_MODEL}` },
          { label: 'ollama create recipe-bot -f Modelfile', re: 'ollama create\\s+recipe-bot\\s+-f\\s+\\S+' },
          { label: 'Check it with ollama show --modelfile', re: 'ollama show\\s+(recipe-bot\\s+--modelfile|--modelfile\\s+recipe-bot)' },
          { label: 'Ask it a question', re: 'ollama run\\s+recipe-bot\\b' },
        ],
        hint: 'FROM needs the base on disk first. The embedding model is for searching notes later.',
        explain: 'show --modelfile proves the SYSTEM and parameters made it in before you build on the model.',
        output: 'Red lentil dal (dal.md) and lentil soup (soups.md). (sample reply)',
      },
    ],
    // L2 Chat, stream & history
    [
      {
        kind: 'write',
        prompt: 'Write the chat loop: stream each reply and keep the history.',
        starter: `${HEADER}List<ChatMessage> history = [];\n`,
        solution: `${HEADER}List<ChatMessage> history = [];\nwhile (Console.ReadLine() is string question)\n{\n    history.Add(new(ChatRole.User, question));\n    List<ChatResponseUpdate> updates = [];\n    await foreach (var u in chat.GetStreamingResponseAsync(history))\n    {\n        Console.Write(u.Text);\n        updates.Add(u);\n    }\n    Console.WriteLine();\n    history.AddMessages(updates);\n}`,
        checks: [
          { label: 'Read questions in a loop', re: '(while|for)\\s*\\([^)]*ReadLine\\(\\)' },
          { label: 'Add each question as a user message', re: 'history\\.Add\\(\\s*new\\s*(ChatMessage)?\\(\\s*ChatRole\\.User' },
          {
            label: 'await foreach over GetStreamingResponseAsync(history)',
            re: 'await\\s+foreach\\s*\\([^)]*in\\s+chat\\.GetStreamingResponseAsync\\(\\s*history',
          },
          { label: 'Write each u.Text as it arrives', re: 'Console\\.Write\\(\\s*\\w+\\.Text\\s*\\)' },
          { label: 'Collect the updates', re: '\\w+\\.Add\\(\\s*\\w+\\s*\\)\\s*;' },
          { label: 'Save them with history.AddMessages', re: 'history\\.AddMessages\\(\\s*\\w+\\s*\\)' },
        ],
        hint: 'Streaming gives pieces. Keep them in a List<ChatResponseUpdate>; AddMessages turns them into one message.',
        explain: 'Text appears at once, and the full answer still lands in history for the next question.',
      },
      {
        kind: 'write',
        prompt: 'Save the streamed reply and trim old pairs when the prompt passes 6000 tokens.',
        starter: `${HEADER}List<ChatMessage> history = [new(ChatRole.System, "Answer from the recipe notes.")];\nhistory.Add(new(ChatRole.User, question));\nList<ChatResponseUpdate> updates = [];\nawait foreach (var u in chat.GetStreamingResponseAsync(history))\n{\n    Console.Write(u.Text);\n    updates.Add(u);\n}\n// TODO: save the reply, trim if needed\n`,
        solution: `${HEADER}List<ChatMessage> history = [new(ChatRole.System, "Answer from the recipe notes.")];\nhistory.Add(new(ChatRole.User, question));\nList<ChatResponseUpdate> updates = [];\nawait foreach (var u in chat.GetStreamingResponseAsync(history))\n{\n    Console.Write(u.Text);\n    updates.Add(u);\n}\nChatResponse full = updates.ToChatResponse();\nhistory.AddMessages(full);\nif (full.Usage?.InputTokenCount > 6000 && history.Count > 3)\n    history.RemoveRange(1, 2);\n`,
        checks: [
          { label: 'Combine the updates with ToChatResponse()', re: '\\w+\\.ToChatResponse\\(\\)' },
          { label: 'Save it with AddMessages', re: 'history\\.AddMessages\\(' },
          { label: 'Test Usage?.InputTokenCount > 6000', re: '\\.Usage\\??\\.InputTokenCount\\s*(\\?\\?\\s*0\\s*)?>\\s*6000' },
          { label: 'Drop the oldest pair with RemoveRange(1, 2)', re: 'RemoveRange\\(\\s*1\\s*,\\s*2\\s*\\)' },
        ],
        hint: 'The token counts arrive in the last update; ToChatResponse gathers them into Usage.',
        explain: 'Trimming from index 1 keeps the bot’s system message and makes room before Ollama starts dropping turns itself.',
      },
    ],
    // L3 RAG over your notes
    [
      {
        kind: 'write',
        prompt: 'Index notes/*.md: split on blank lines, embed each file’s chunks in one call.',
        starter:
          'using Microsoft.Extensions.AI;\nusing OllamaSharp;\n\nIEmbeddingGenerator<string, Embedding<float>> embedder =\n    new OllamaApiClient(new Uri("http://localhost:11434"), "embeddinggemma");\nList<Chunk> index = [];\n// TODO: fill the index\n\nrecord Chunk(string File, string Text, ReadOnlyMemory<float> Vector);',
        solution:
          'using Microsoft.Extensions.AI;\nusing OllamaSharp;\n\nIEmbeddingGenerator<string, Embedding<float>> embedder =\n    new OllamaApiClient(new Uri("http://localhost:11434"), "embeddinggemma");\nList<Chunk> index = [];\nforeach (string file in Directory.GetFiles("notes", "*.md"))\n{\n    string[] parts = File.ReadAllText(file).Split("\\n\\n", StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);\n    var vectors = await embedder.GenerateAsync(parts);\n    for (int i = 0; i < parts.Length; i++)\n        index.Add(new Chunk(Path.GetFileName(file), parts[i], vectors[i].Vector));\n}\n\nrecord Chunk(string File, string Text, ReadOnlyMemory<float> Vector);',
        checks: [
          { label: 'Loop over the .md files in notes', re: 'Directory\\.(Get|Enumerate)Files\\(\\s*"notes"\\s*,\\s*"\\*\\.md"' },
          { label: 'Split on blank lines', re: '\\.Split\\(\\s*("\\\\n\\\\n"|"\\\\r\\\\n\\\\r\\\\n"|new\\s*\\[\\])|Regex\\.Split\\(' },
          { label: 'Embed all parts in one GenerateAsync call', re: 'embedder\\.GenerateAsync\\(\\s*\\w+\\s*\\)' },
          { label: 'Add a Chunk with file, text and .Vector', re: 'index\\.Add\\(\\s*new\\s*(Chunk)?\\([^;]*\\.Vector\\s*\\)\\s*\\)' },
        ],
        hint: 'GenerateAsync takes a list and returns one embedding per item, in order.',
        explain: 'One call per file is much faster than one per chunk, and keeping the file name lets the bot cite it.',
      },
      {
        kind: 'write',
        prompt: 'Retrieve the top 3 chunks for a question and wrap them safely in <note> tags.',
        starter:
          'using System.Numerics.Tensors;\n// embedder, index and history are ready\nstring question = "How long do I rest the pizza dough?";\n// TODO: embed, rank, wrap, ask\n',
        solution:
          'using System.Numerics.Tensors;\n// embedder, index and history are ready\nstring question = "How long do I rest the pizza dough?";\nvar q = await embedder.GenerateVectorAsync(question);\nvar top = index\n    .OrderByDescending(c => TensorPrimitives.CosineSimilarity(q.Span, c.Vector.Span))\n    .Take(3);\nstring context = string.Join("\\n", top.Select(c =>\n    $"<note file=\\"{c.File}\\">\\n{c.Text.Replace("</note>", "")}\\n</note>"));\nhistory.Add(new(ChatRole.User, $"{context}\\n\\nAnswer from the notes above and cite the file: {question}"));',
        checks: [
          { label: 'Embed the question with GenerateVectorAsync', re: 'GenerateVectorAsync\\(\\s*question\\s*\\)' },
          { label: 'Rank by TensorPrimitives.CosineSimilarity', re: 'OrderByDescending\\([^;]*TensorPrimitives\\.CosineSimilarity\\(' },
          { label: 'Take(3)', re: '\\.Take\\(\\s*3\\s*\\)' },
          { label: 'Wrap each in <note file="…"> with its File', re: '<note file=\\\\"\\{\\w+\\.File\\}\\\\"' },
          { label: 'Strip "</note>" from the chunk text', re: '\\.Replace\\(\\s*"</note>"\\s*,' },
          {
            label: 'Add context and question as a user message',
            re: 'history\\.Add\\(\\s*new\\s*(ChatMessage)?\\(\\s*ChatRole\\.User\\s*,[^;]*\\{question\\}',
          },
        ],
        hint: 'Sort the index by similarity to the question vector, highest first, and keep three.',
        explain: 'The file attribute lets the bot cite its source, and stripping </note> keeps a note from breaking out of its block.',
      },
    ],
    // L4 Tools & guards
    [
      {
        kind: 'write',
        prompt: 'Turn recipe-bot into a capped agent with search_notes and a typed Answer.',
        starter: `${HEADER}List<ChatMessage> history = [new(ChatRole.User, "What can I bake with oat flour?")];\n// TODO\n\nstatic string SearchNotes(string query) => "oat-cookies.md: 200 g oat flour, 100 g butter...";\nrecord Answer(string Text, string[] Sources);`,
        solution: `${HEADER}List<ChatMessage> history = [new(ChatRole.User, "What can I bake with oat flour?")];\nIChatClient agent = new ChatClientBuilder(chat)\n    .UseFunctionInvocation(configure: f => f.MaximumIterationsPerRequest = 4)\n    .Build();\nvar opts = new ChatOptions { Tools = [AIFunctionFactory.Create(SearchNotes, "search_notes")] };\nChatResponse<Answer> r = await agent.GetResponseAsync<Answer>(history, opts);\nConsole.WriteLine(r.Result.Text);\nConsole.WriteLine("Sources: " + string.Join(", ", r.Result.Sources));\n\nstatic string SearchNotes(string query) => "oat-cookies.md: 200 g oat flour, 100 g butter...";\nrecord Answer(string Text, string[] Sources);`,
        checks: [
          { label: 'UseFunctionInvocation with MaximumIterationsPerRequest', re: 'UseFunctionInvocation\\([\\s\\S]*MaximumIterationsPerRequest\\s*=\\s*\\d+' },
          { label: 'AIFunctionFactory.Create(SearchNotes, "search_notes")', re: 'AIFunctionFactory\\.Create\\(\\s*SearchNotes\\s*,\\s*"search_notes"\\s*\\)' },
          { label: 'GetResponseAsync<Answer>(history, opts) on the agent', re: '\\w+\\.GetResponseAsync<Answer>\\(\\s*history\\s*,\\s*\\w+\\s*\\)' },
          { label: 'Print the answer text', re: '\\.Result\\.Text' },
          { label: 'Print the sources with string.Join', re: 'string\\.Join\\([^;]*\\.Result\\.Sources' },
        ],
        hint: 'Builder → UseFunctionInvocation → Build; tools in ChatOptions; GetResponseAsync<Answer> for the typed result.',
        explain: 'The agent searches as often as it needs (up to the cap) and returns text plus the files it used.',
        output: 'Oat cookies: mix the oat flour with butter and sugar...\nSources: oat-cookies.md (sample)',
      },
      {
        kind: 'write',
        prompt: 'Guard both tools: cap the search count, and make AddNote safe and confirmed.',
        starter:
          'static string SearchNotes(string query, int count)\n{\n    return string.Join("\\n---\\n", Search(query).Take(count));\n}\n\nstatic string AddNote(string title, string text)\n{\n    File.WriteAllText(Path.Combine("notes", title + ".md"), text);\n    return $"Saved {title}";\n}',
        solution:
          'static string SearchNotes(string query, int count)\n{\n    int n = Math.Clamp(count, 1, 5);\n    return string.Join("\\n---\\n", Search(query).Take(n));\n}\n\nstatic string AddNote(string title, string text)\n{\n    if (!Regex.IsMatch(title, @"^[\\w -]{1,60}$")) return "Error: use letters, digits, spaces or dashes in the title.";\n    Console.Write($"Add note \\"{title}\\"? (y/n) ");\n    if (Console.ReadLine() != "y") return "The user said no.";\n    File.WriteAllText(Path.Combine("notes", title + ".md"), text);\n    return $"Saved {title}";\n}',
        checks: [
          { label: 'Math.Clamp(count, 1, …)', re: 'Math\\.Clamp\\(\\s*count\\s*,\\s*1\\s*,\\s*\\d+\\s*\\)' },
          { label: 'Don’t Take the raw count', not: 'Take(count)' },
          {
            label: 'Validate the title (no ../ paths)',
            re: 'Regex\\.IsMatch\\(\\s*title|Path\\.GetFileName\\(\\s*title\\s*\\)\\s*!=\\s*title|title\\.(IndexOfAny|Contains)\\(',
          },
          { label: 'Ask y/n and return a message on no', re: 'ReadLine\\(\\)[^;]*"y"[^;]*return\\s+\\$?"' },
          { label: 'Write only after the checks', re: 'ReadLine\\(\\)[\\s\\S]*File\\.WriteAllText' },
        ],
        hint: 'A title like ../../.bashrc would write outside notes. Anything that writes waits for a human yes.',
        explain: 'Read-only search gets a cap; the write tool gets validation and a confirmation, because the model can be talked into anything.',
      },
    ],
    // L5 Ship & evaluate
    [
      {
        kind: 'write',
        prompt: 'Write the compose file for recipe-bot’s Ollama: local-only port, model volume, cloud off.',
        starter: '',
        solution:
          'services:\n  ollama:\n    image: ollama/ollama\n    ports: ["127.0.0.1:11434:11434"]\n    volumes: [ollama:/root/.ollama]\n    environment: [OLLAMA_KEEP_ALIVE=1h, OLLAMA_NO_CLOUD=1]\n\nvolumes:\n  ollama:',
        checks: [
          { label: 'image: ollama/ollama', re: 'image:\\s*"?ollama/ollama' },
          { label: 'Port bound to 127.0.0.1', re: '"?127\\.0\\.0\\.1:11434:11434"?' },
          { label: 'A volume at /root/.ollama', re: '[\\w.-]+:/root/\\.ollama\\b' },
          { label: 'Declare the volume at the top level', re: '^volumes:\\s*\\n\\s+[\\w.-]+:', flags: 'm' },
          { label: 'OLLAMA_NO_CLOUD=1', re: 'OLLAMA_NO_CLOUD[=:]\\s*"?1' },
          { label: 'A keep-alive so the bot stays warm', re: 'OLLAMA_KEEP_ALIVE[=:]\\s*"?\\w+' },
        ],
        hint: 'Put 127.0.0.1 in front of the port mapping. Models live in /root/.ollama inside the container.',
        explain: 'Only this machine can reach the API, models survive rebuilds, and nothing goes to the cloud.',
      },
      {
        kind: 'write',
        prompt: 'Finish the eval gate: steady settings, check each Answer’s sources, fail below full marks.',
        starter: `${HEADER}var opts = new ChatOptions { Temperature = 0.8f, Seed = 7 };\nEvalCase[] cases = [\n    new("Which recipe uses lentils?", "dal.md"),\n    new("How long do I rest the pizza dough?", "pizza.md")];\n// TODO: run the cases\n\nrecord Answer(string Text, string[] Sources);\nrecord EvalCase(string Question, string ExpectedFile);`,
        solution: `${HEADER}var opts = new ChatOptions { Temperature = 0, Seed = 7 };\nEvalCase[] cases = [\n    new("Which recipe uses lentils?", "dal.md"),\n    new("How long do I rest the pizza dough?", "pizza.md")];\nint passed = 0;\nforeach (var c in cases)\n{\n    ChatResponse<Answer> r = await chat.GetResponseAsync<Answer>(c.Question, opts);\n    bool ok = r.Result.Sources.Contains(c.ExpectedFile);\n    if (ok) passed++;\n    Console.WriteLine($"{(ok ? "PASS" : "FAIL")}  {c.Question}");\n}\nConsole.WriteLine($"Score: {passed}/{cases.Length}");\nreturn passed < cases.Length ? 1 : 0;\n\nrecord Answer(string Text, string[] Sources);\nrecord EvalCase(string Question, string ExpectedFile);`,
        checks: [
          { label: 'Temperature = 0', re: 'Temperature\\s*=\\s*0(\\.0)?f?\\s*[,}]' },
          { label: 'Loop over the cases', re: 'foreach\\s*\\(\\s*\\w+\\s+\\w+\\s+in\\s+cases\\s*\\)' },
          { label: 'Ask with GetResponseAsync<Answer>', re: 'GetResponseAsync<Answer>\\(\\s*\\w+\\.Question' },
          { label: 'Pass if Sources contains ExpectedFile', re: '\\.Result\\.Sources\\.Contains\\(\\s*\\w+\\.ExpectedFile\\s*\\)' },
          { label: 'Print the score', re: '\\{\\w+\\}\\s*/\\s*\\{\\w+\\.(Length|Count)\\}' },
          { label: 'Return 1 when the score drops', re: 'return\\s+[^;]*\\?\\s*(1\\s*:\\s*0|0\\s*:\\s*1)\\s*;|Environment\\.Exit\\(' },
        ],
        hint: 'Checking the cited file is an exact test that survives any wording of the answer.',
        explain: 'Run this before each model, prompt or index change ships; a non-zero exit stops the build.',
        output: 'PASS  Which recipe uses lentils?\nPASS  How long do I rest the pizza dough?\nScore: 2/2 (sample)',
      },
    ],
  ],
};

export default unit;
