import type { DesktopUnit } from '../../../engine/types';

// Desktop edition: write-the-code challenges for Ollama unit 14 (Agents with Ollama).
// lessons[i] runs after lesson i + 1. See docs/CONTENT_GUIDE.md.
const STOCK_TOOL =
  '[{"type": "function", "function": {"name": "check_stock", "description": "Units in stock for a SKU.",\n    "parameters": {"type": "object", "properties": {"sku": {"type": "string"}}, "required": ["sku"]}}}]';
const RATE_TOOL =
  '[{"type": "function", "function": {"name": "get_rate", "description": "Exchange rate from USD to a currency.",\n    "parameters": {"type": "object", "properties": {"currency": {"type": "string"}}, "required": ["currency"]}}}]';

const unit: DesktopUnit = {
  lessons: [
    // L1 The agent loop
    [
      {
        kind: 'write',
        prompt: 'check_stock("H-77") returned "4 in stock". Write the next request’s messages.',
        starter: `{\n  "model": "qwen3",\n  "stream": false,\n  "tools": ${STOCK_TOOL},\n  "messages": [\n    {"role": "user", "content": "Do you have the blue helmet, H-77?"}\n  ]\n}`,
        solution: `{\n  "model": "qwen3",\n  "stream": false,\n  "tools": ${STOCK_TOOL},\n  "messages": [\n    {"role": "user", "content": "Do you have the blue helmet, H-77?"},\n    {"role": "assistant", "content": "", "tool_calls": [{"function": {"name": "check_stock", "arguments": {"sku": "H-77"}}}]},\n    {"role": "tool", "tool_name": "check_stock", "content": "4 in stock"}\n  ]\n}`,
        checks: [
          { label: 'Append the assistant reply with its tool_calls', re: '\\{[^{}]*"role":\\s*"assistant"[^{}]*"tool_calls":\\s*\\[\\s*\\{\\s*"function":\\s*\\{\\s*"name":\\s*"check_stock"' },
          { label: 'The call’s arguments: {"sku": "H-77"}', re: '"arguments":\\s*\\{\\s*"sku":\\s*"H-77"\\s*\\}' },
          { label: 'Then a "tool" message', re: '"tool_calls"[\\s\\S]*"role":\\s*"tool"' },
          { label: '"tool_name": "check_stock" on it', re: '"tool_name":\\s*"check_stock"' },
          { label: 'The result as its content', re: '"content":\\s*"4 in stock"' },
        ],
        hint: 'Two new messages: the assistant turn exactly as the model sent it, then one role "tool" message with the result.',
        explain: 'The model only knows it asked for a tool if its own call is in the history, and only sees the answer in the tool message after it.',
      },
      {
        kind: 'write',
        prompt: 'The model called get_rate twice. Add both results: EUR 0.92, JPY 151.3.',
        starter: `{\n  "model": "qwen3",\n  "stream": false,\n  "tools": ${RATE_TOOL},\n  "messages": [\n    {"role": "user", "content": "How much is 50 USD in euros and in yen?"},\n    {"role": "assistant", "content": "", "tool_calls": [\n      {"function": {"name": "get_rate", "arguments": {"currency": "EUR"}}},\n      {"function": {"name": "get_rate", "arguments": {"currency": "JPY"}}}\n    ]}\n  ]\n}`,
        solution: `{\n  "model": "qwen3",\n  "stream": false,\n  "tools": ${RATE_TOOL},\n  "messages": [\n    {"role": "user", "content": "How much is 50 USD in euros and in yen?"},\n    {"role": "assistant", "content": "", "tool_calls": [\n      {"function": {"name": "get_rate", "arguments": {"currency": "EUR"}}},\n      {"function": {"name": "get_rate", "arguments": {"currency": "JPY"}}}\n    ]},\n    {"role": "tool", "tool_name": "get_rate", "content": "EUR 0.92"},\n    {"role": "tool", "tool_name": "get_rate", "content": "JPY 151.3"}\n  ]\n}`,
        checks: [
          { label: 'Two "tool" messages, one per call', re: '("role":\\s*"tool"[\\s\\S]*){2}' },
          { label: 'Each with "tool_name": "get_rate"', re: '("tool_name":\\s*"get_rate"[\\s\\S]*){2}' },
          { label: 'The EUR result 0.92', re: '"content":\\s*"[^"]*0\\.92[^"]*"' },
          { label: 'The JPY result 151.3', re: '"content":\\s*"[^"]*151\\.3[^"]*"' },
          { label: 'In call order: EUR first', re: '0\\.92[\\s\\S]*151\\.3' },
        ],
        hint: 'One tool message per entry in tool_calls, in the same order, after the assistant message.',
        explain: 'Several calls in one reply are run together; each result goes back as its own tool message so the model can match them up.',
      },
    ],
    // L2 Chains & plans
    [
      {
        kind: 'write',
        prompt: 'Write the system rule, user question and a well-described find_loan tool.',
        starter: '{\n  "model": "qwen3",\n  "stream": false,\n\n}',
        solution:
          '{\n  "model": "qwen3",\n  "stream": false,\n  "messages": [\n    {"role": "system", "content": "Plan the steps first. Use a tool for every fact. Answer in one sentence when you have everything."},\n    {"role": "user", "content": "When is library book B-221 due back?"}\n  ],\n  "tools": [{"type": "function", "function": {\n    "name": "find_loan",\n    "description": "Look up a library loan by book code. Returns the due date.",\n    "parameters": {"type": "object", "properties": {"code": {"type": "string"}}, "required": ["code"]}\n  }}]\n}',
        checks: [
          { label: 'A system message comes first', re: '"messages":\\s*\\[\\s*\\{\\s*"role":\\s*"system"' },
          { label: 'It says to plan and to use tools', re: '"role":\\s*"system",\\s*"content":\\s*"(?=[^"]*\\bplan)(?=[^"]*\\btools?\\b)[^"]*"', flags: 'i' },
          { label: 'Then a user message', re: '"role":\\s*"system"[\\s\\S]*"role":\\s*"user"' },
          { label: 'A function tool named find_loan', re: '"type":\\s*"function",\\s*"function":\\s*\\{\\s*"name":\\s*"find_loan"' },
          { label: 'A description that says what it returns', re: '"description":\\s*"[^"]{15,}"' },
          { label: 'Parameters with a required list', re: '"required":\\s*\\[\\s*"\\w+"' },
        ],
        hint: 'Rules go in the system message. The tool description is what the model reads to decide when to call it.',
        explain: 'A planning rule and a clear tool description keep small models from guessing facts they could look up.',
      },
      {
        kind: 'write',
        prompt: 'Chain the next call from find_flight’s result, then return get_gate’s error.',
        starter:
          '"messages": [\n  {"role": "user", "content": "Which gate is my flight? Booking QX7."},\n  {"role": "assistant", "content": "", "tool_calls": [{"function": {"name": "find_flight", "arguments": {"booking": "QX7"}}}]},\n  {"role": "tool", "tool_name": "find_flight", "content": "{\\"flight\\": \\"BA 117\\"}"}\n]',
        solution:
          '"messages": [\n  {"role": "user", "content": "Which gate is my flight? Booking QX7."},\n  {"role": "assistant", "content": "", "tool_calls": [{"function": {"name": "find_flight", "arguments": {"booking": "QX7"}}}]},\n  {"role": "tool", "tool_name": "find_flight", "content": "{\\"flight\\": \\"BA 117\\"}"},\n  {"role": "assistant", "content": "", "tool_calls": [{"function": {"name": "get_gate", "arguments": {"flight": "BA 117"}}}]},\n  {"role": "tool", "tool_name": "get_gate", "content": "Error: no gate assigned yet. Try again in 10 minutes."}\n]',
        checks: [
          { label: 'An assistant call to get_gate', re: '"tool_calls":\\s*\\[\\s*\\{\\s*"function":\\s*\\{\\s*"name":\\s*"get_gate"' },
          { label: 'Its argument uses the flight from find_flight', re: '"name":\\s*"get_gate",\\s*"arguments":\\s*\\{\\s*"flight":\\s*"BA 117"\\s*\\}' },
          { label: 'A tool message for get_gate', re: '"tool_name":\\s*"get_gate"' },
          { label: 'Its content is an error the model can read', re: '\\{(?=[^{}]*"tool_name":\\s*"get_gate")(?=[^{}]*"content":\\s*"Error)[^{}]*\\}' },
        ],
        hint: 'The second call’s argument comes from the first tool’s content. Send errors back as plain content, not as a crash.',
        explain: 'One result decides the next call; that is what makes it an agent. A readable error lets the model retry or tell the user.',
      },
    ],
    // L3 Capping the loop
    [
      {
        kind: 'write',
        prompt: 'Write the agent loop, capped at 4 steps, saying so if the cap runs out.',
        starter:
          'IChatClient chat = new OllamaApiClient(new Uri("http://localhost:11434"), "qwen3");\nAIFunction bookTable = AIFunctionFactory.Create(BookTable, "book_table");\nvar opts = new ChatOptions { Tools = [bookTable] };\nList<ChatMessage> history = [new(ChatRole.User, "Book a table for two at 7pm.")];\n// TODO: the capped loop\n\nasync Task<ChatMessage> RunCallsAsync(List<FunctionCallContent> calls)\n{\n    List<AIContent> results = [];\n    foreach (var c in calls)\n        results.Add(new FunctionResultContent(c.CallId, await bookTable.InvokeAsync(new AIFunctionArguments(c.Arguments))));\n    return new ChatMessage(ChatRole.Tool, results);\n}\nstatic string BookTable(string time, int people) => $"Booked a table for {people} at {time}.";',
        solution:
          'IChatClient chat = new OllamaApiClient(new Uri("http://localhost:11434"), "qwen3");\nAIFunction bookTable = AIFunctionFactory.Create(BookTable, "book_table");\nvar opts = new ChatOptions { Tools = [bookTable] };\nList<ChatMessage> history = [new(ChatRole.User, "Book a table for two at 7pm.")];\nconst int MaxSteps = 4;\nfor (int step = 0; step < MaxSteps; step++)\n{\n    ChatResponse r = await chat.GetResponseAsync(history, opts);\n    history.AddMessages(r);\n    var calls = r.Messages.SelectMany(m => m.Contents).OfType<FunctionCallContent>().ToList();\n    if (calls.Count == 0) { Console.WriteLine(r.Text); return; }\n    history.Add(await RunCallsAsync(calls));\n}\nConsole.WriteLine($"Stopped after {MaxSteps} steps.");\n\nasync Task<ChatMessage> RunCallsAsync(List<FunctionCallContent> calls)\n{\n    List<AIContent> results = [];\n    foreach (var c in calls)\n        results.Add(new FunctionResultContent(c.CallId, await bookTable.InvokeAsync(new AIFunctionArguments(c.Arguments))));\n    return new ChatMessage(ChatRole.Tool, results);\n}\nstatic string BookTable(string time, int people) => $"Booked a table for {people} at {time}.";',
        checks: [
          { label: 'A for loop that stops before 4 steps', re: 'for\\s*\\(\\s*(int|var)\\s+(\\w+)\\s*=\\s*0\\s*;\\s*\\2\\s*<\\s*(4|\\w+)\\s*;' },
          { label: 'Send history and opts each pass', re: 'GetResponseAsync\\(\\s*history\\s*,\\s*opts\\s*\\)' },
          { label: 'Save the reply with history.AddMessages', re: 'history\\.AddMessages\\(\\s*\\w+\\s*\\)' },
          { label: 'Collect the FunctionCallContent items', has: 'OfType<FunctionCallContent>()' },
          { label: 'No calls: print the answer and stop', re: '(\\.Count\\s*==\\s*0|!\\s*\\w+\\.Any\\(\\))[\\s\\S]*?(break|return)' },
          { label: 'Run the calls with RunCallsAsync', re: 'history\\.Add\\(\\s*await\\s+RunCallsAsync\\(' },
        ],
        hint: 'Each pass: ask, save, collect calls. Zero calls means r.Text is the answer; otherwise add the tool results and go round again.',
        explain: 'The cap turns a model stuck calling tools into a clear “stopped” message instead of a loop that never ends.',
        output: 'Done: a table for two is booked at 7pm. (sample reply)',
      },
      {
        kind: 'write',
        prompt: 'Fix the off-by-one cap and run each call through the tools dictionary.',
        starter:
          'IChatClient chat = new OllamaApiClient(new Uri("http://localhost:11434"), "qwen3");\nDictionary<string, AIFunction> tools = new()\n{\n    ["find_pet"] = AIFunctionFactory.Create(FindPet, "find_pet"),\n    ["next_visit"] = AIFunctionFactory.Create(NextVisit, "next_visit"),\n};\nvar opts = new ChatOptions { Tools = [.. tools.Values] };\nList<ChatMessage> history = [new(ChatRole.User, "When is Biscuit\'s next check-up?")];\nfor (int step = 0; step <= 5; step++)\n{\n    ChatResponse r = await chat.GetResponseAsync(history, opts);\n    history.AddMessages(r);\n    var calls = r.Messages.SelectMany(m => m.Contents).OfType<FunctionCallContent>().ToList();\n    if (calls.Count == 0) { Console.WriteLine(r.Text); break; }\n    // TODO: run each call, add its result as a tool message\n}\n\nstatic string FindPet(string name) => name == "Biscuit" ? "pet-31" : $"Error: no pet called {name}";\nstatic string NextVisit(string petId) => petId == "pet-31" ? "2026-11-04 10:30" : "Error: unknown pet id";',
        solution:
          'IChatClient chat = new OllamaApiClient(new Uri("http://localhost:11434"), "qwen3");\nDictionary<string, AIFunction> tools = new()\n{\n    ["find_pet"] = AIFunctionFactory.Create(FindPet, "find_pet"),\n    ["next_visit"] = AIFunctionFactory.Create(NextVisit, "next_visit"),\n};\nvar opts = new ChatOptions { Tools = [.. tools.Values] };\nList<ChatMessage> history = [new(ChatRole.User, "When is Biscuit\'s next check-up?")];\nfor (int step = 0; step < 5; step++)\n{\n    ChatResponse r = await chat.GetResponseAsync(history, opts);\n    history.AddMessages(r);\n    var calls = r.Messages.SelectMany(m => m.Contents).OfType<FunctionCallContent>().ToList();\n    if (calls.Count == 0) { Console.WriteLine(r.Text); break; }\n    foreach (var c in calls)\n    {\n        object? result = await tools[c.Name].InvokeAsync(new AIFunctionArguments(c.Arguments));\n        history.Add(new ChatMessage(ChatRole.Tool, [new FunctionResultContent(c.CallId, result)]));\n    }\n}\n\nstatic string FindPet(string name) => name == "Biscuit" ? "pet-31" : $"Error: no pet called {name}";\nstatic string NextVisit(string petId) => petId == "pet-31" ? "2026-11-04 10:30" : "Error: unknown pet id";',
        checks: [
          { label: 'Cap at 5 steps with <, not <=', re: 'step\\s*<\\s*5\\s*;' },
          { label: 'Loop over the calls', re: 'foreach\\s*\\(\\s*\\w+\\s+\\w+\\s+in\\s+calls\\s*\\)' },
          { label: 'Look the function up by name and InvokeAsync it', re: 'tools\\[\\s*\\w+\\.Name\\s*\\]\\.InvokeAsync\\(\\s*new\\s+AIFunctionArguments\\(\\s*\\w+\\.Arguments\\s*\\)' },
          { label: 'Wrap the result in FunctionResultContent with the CallId', re: 'new\\s+FunctionResultContent\\(\\s*\\w+\\.CallId\\s*,' },
          { label: 'Add it as a ChatRole.Tool message', re: 'history\\.Add\\(\\s*new\\s*(ChatMessage)?\\(\\s*ChatRole\\.Tool\\b' },
        ],
        hint: 'c.Name picks the AIFunction; c.Arguments go in AIFunctionArguments; c.CallId ties the result to its call.',
        explain: '<= 5 runs six passes. Each result must carry its CallId so the model knows which call it answers.',
        output: 'Biscuit’s next check-up is on 4 November at 10:30. (sample reply)',
      },
    ],
    // L4 Agents in C#
    [
      {
        kind: 'write',
        prompt: 'Build an agent with UseFunctionInvocation, capped at 4 iterations, and ask it.',
        starter:
          'IChatClient chat = new OllamaApiClient(new Uri("http://localhost:11434"), "qwen3");\n\nstatic string GetSession(string room) => room == "B" ? "14:00 Intro to Rust" : "No session";\nstatic string GetSpeaker(string session) => session.Contains("Rust") ? "Ana Silva" : "Unknown";',
        solution:
          'IChatClient chat = new OllamaApiClient(new Uri("http://localhost:11434"), "qwen3");\nIChatClient agent = new ChatClientBuilder(chat)\n    .UseFunctionInvocation(configure: f => f.MaximumIterationsPerRequest = 4)\n    .Build();\nvar opts = new ChatOptions\n{\n    Tools = [AIFunctionFactory.Create(GetSession, "get_session"), AIFunctionFactory.Create(GetSpeaker, "get_speaker")]\n};\nChatResponse r = await agent.GetResponseAsync("Who speaks in room B after lunch?", opts);\nConsole.WriteLine(r.Text);\n\nstatic string GetSession(string room) => room == "B" ? "14:00 Intro to Rust" : "No session";\nstatic string GetSpeaker(string session) => session.Contains("Rust") ? "Ana Silva" : "Unknown";',
        checks: [
          { label: 'Wrap chat with ChatClientBuilder (or AsBuilder)', re: 'new\\s+ChatClientBuilder\\(\\s*chat\\s*\\)|chat\\.AsBuilder\\(\\)' },
          { label: 'UseFunctionInvocation with MaximumIterationsPerRequest = 4', re: 'UseFunctionInvocation\\([\\s\\S]*MaximumIterationsPerRequest\\s*=\\s*4' },
          { label: 'Finish with .Build()', has: '.Build()' },
          { label: 'Both functions as Tools via AIFunctionFactory.Create', re: 'Tools\\s*=\\s*\\[[^\\]]*AIFunctionFactory\\.Create\\(\\s*GetSession[^\\]]*AIFunctionFactory\\.Create\\(\\s*GetSpeaker|Tools\\s*=\\s*\\[[^\\]]*AIFunctionFactory\\.Create\\(\\s*GetSpeaker[^\\]]*AIFunctionFactory\\.Create\\(\\s*GetSession' },
          { label: 'Ask the agent, passing the options', re: '\\w+\\.GetResponseAsync\\([^;]*,\\s*\\w+\\s*\\)\\s*;' },
          { label: 'Call the wrapped client, not chat', not: 'chat.GetResponseAsync(' },
        ],
        hint: 'new ChatClientBuilder(chat).UseFunctionInvocation(configure: f => …).Build() gives the agent client.',
        explain: 'The middleware runs the whole loop: call tools, add results, ask again, until there are no calls or the cap is hit.',
        output: 'Ana Silva, with Intro to Rust at 14:00. (sample reply)',
      },
      {
        kind: 'write',
        prompt: 'Fix this agent: the cap property, the client it calls and the missing options.',
        starter:
          'IChatClient agent = chat.AsBuilder()\n    .UseFunctionInvocation(configure: f => f.MaxIterations = 3)\n    .Build();\nvar opts = new ChatOptions { Tools = [AIFunctionFactory.Create(GetBalance, "get_balance")] };\nList<ChatMessage> history = [new(ChatRole.User, "Can I afford a 40 euro concert ticket?")];\nChatResponse r = await chat.GetResponseAsync(history);\nConsole.WriteLine(r.Text);',
        solution:
          'IChatClient agent = chat.AsBuilder()\n    .UseFunctionInvocation(configure: f => f.MaximumIterationsPerRequest = 3)\n    .Build();\nvar opts = new ChatOptions { Tools = [AIFunctionFactory.Create(GetBalance, "get_balance")] };\nList<ChatMessage> history = [new(ChatRole.User, "Can I afford a 40 euro concert ticket?")];\nChatResponse r = await agent.GetResponseAsync(history, opts);\nhistory.AddMessages(r);\nConsole.WriteLine(r.Text);',
        checks: [
          { label: 'Use MaximumIterationsPerRequest', re: 'MaximumIterationsPerRequest\\s*=\\s*\\d+' },
          { label: 'No MaxIterations (it doesn’t exist)', not: 'f.MaxIterations' },
          { label: 'Call agent.GetResponseAsync(history, opts)', re: 'agent\\.GetResponseAsync\\(\\s*history\\s*,\\s*opts\\s*\\)' },
          { label: 'Don’t call the bare chat client', not: 'chat.GetResponseAsync(' },
          { label: 'Save the reply with history.AddMessages', re: 'history\\.AddMessages\\(\\s*r\\s*\\)' },
        ],
        hint: 'Calling chat skips the middleware, and without opts the model never sees the tools.',
        explain: 'The agent client runs the tool loop, the options carry the tools, and AddMessages keeps calls and results for the next question.',
      },
    ],
    // L5 Guards & thinking
    [
      {
        kind: 'write',
        prompt: 'Ask a thinking model with think on, offering a read-only list_plants tool.',
        starter: '',
        solution:
          '{\n  "model": "qwen3",\n  "think": true,\n  "stream": false,\n  "messages": [{"role": "user", "content": "Which of my plants need water today?"}],\n  "tools": [{"type": "function", "function": {\n    "name": "list_plants",\n    "description": "List plants with the date each was last watered. Read-only.",\n    "parameters": {"type": "object", "properties": {}}\n  }}]\n}',
        checks: [
          { label: 'A thinking model (qwen3, deepseek-r1, gpt-oss…)', re: '"model":\\s*"(qwen3|deepseek-r1|gpt-oss|magistral|deepseek-v3\\.1)[^"]*"' },
          { label: '"think": true', re: '"think":\\s*(true|"(low|medium|high)")' },
          { label: 'Not "thinking" (that is the reply field)', not: '"thinking"' },
          { label: 'A user message', re: '"role":\\s*"user"' },
          { label: 'A list_plants function tool', re: '"name":\\s*"list_plants"' },
        ],
        hint: 'The request flag is think. The model’s plan comes back in message.thinking, separate from content.',
        explain: 'With think on, you can log the plan without showing it, and the content stays clean for the user.',
        output: '{"message": {"role": "assistant", "thinking": "I need the plant list first...", "content": "", "tool_calls": [...]}} (sample)',
      },
      {
        kind: 'write',
        prompt: 'Guard this destructive tool: check the id format, then ask a human first.',
        starter: 'static string CancelBooking(string bookingId)\n{\n    Bookings.Cancel(bookingId);\n    return $"Cancelled {bookingId}";\n}',
        solution:
          'static string CancelBooking(string bookingId)\n{\n    if (!Regex.IsMatch(bookingId, @"^B-\\d{4}$")) return "Refused: booking ids look like B-1234.";\n    Console.Write($"Cancel booking {bookingId}? (y/n) ");\n    if (Console.ReadLine() != "y") return "The user said no.";\n    Bookings.Cancel(bookingId);\n    return $"Cancelled {bookingId}";\n}',
        checks: [
          { label: 'Validate the id with Regex.IsMatch', re: 'Regex\\.IsMatch\\(\\s*bookingId\\s*,' },
          { label: 'Refuse with a message the model can read', re: 'IsMatch\\([^;]*return\\s+\\$?"[^"]+"' },
          { label: 'Show the exact booking id and ask y/n', re: 'Console\\.Write(Line)?\\(\\s*\\$"[^"]*\\{bookingId\\}[^"]*"' },
          { label: 'Return a message unless the answer is "y"', re: 'ReadLine\\(\\)[^;]*"y"[^;]*return\\s+\\$?"' },
          { label: 'Cancel only after the check and the yes', re: 'IsMatch[\\s\\S]*ReadLine\\(\\)[\\s\\S]*Bookings\\.Cancel\\(' },
        ],
        hint: 'Two guards before the Cancel line: a pattern check that returns a refusal, and a y/n question.',
        explain: 'The model can send anything, so the function checks it. Anything you can’t undo waits for a person.',
      },
    ],
  ],
};

export default unit;
