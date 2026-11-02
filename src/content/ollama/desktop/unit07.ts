import type { DesktopUnit } from '../../../engine/types';

// Desktop edition: write-the-code challenges for Ollama unit 7 (Ollama from C#).
// lessons[i] runs after lesson i + 1. See docs/CONTENT_GUIDE.md.

const HTTP = 'var http = new HttpClient { BaseAddress = new Uri("http://localhost:11434") };';
const CHAT_USINGS = 'using Microsoft.Extensions.AI;\nusing OllamaSharp;\n';
const chatClient = (model: string) =>
  `IChatClient chat = new OllamaApiClient(new Uri("http://localhost:11434"), "${model}");`;

/** `new OllamaApiClient(<uri>, "<model>")` with a Uri or a string address. */
const OLLAMA_CLIENT =
  'new OllamaApiClient\\(\\s*(new Uri\\(\\s*)?"http://localhost:11434/?"\\s*\\)?\\s*,\\s*"[\\w.:/-]+"\\s*\\)';

const unit: DesktopUnit = {
  lessons: [
    // L1 HttpClient calls
    [
      {
        kind: 'write',
        prompt: 'From C#, POST a non-streaming /api/generate request with HttpClient.',
        starter: '',
        solution: `using System.Net.Http.Json;

${HTTP}
var res = await http.PostAsJsonAsync("/api/generate",
    new { model = "gemma3", prompt = "Name a jazz album.", stream = false });
Console.WriteLine(await res.Content.ReadAsStringAsync());`,
        checks: [
          { label: 'using System.Net.Http.Json;', has: 'using System.Net.Http.Json;' },
          { label: 'A HttpClient with BaseAddress http://localhost:11434', re: 'BaseAddress\\s*=\\s*new\\s+Uri\\(\\s*"http://localhost:11434/?"\\s*\\)' },
          { label: 'PostAsJsonAsync to "/api/generate"', re: '\\.PostAsJsonAsync\\(\\s*"/?api/generate"\\s*,' },
          { label: 'An anonymous body with model and prompt', re: 'new\\s*\\{(?=[^}]*\\bmodel\\s*=\\s*"[^"]+")(?=[^}]*\\bprompt\\s*=\\s*"[^"]+")' },
          { label: 'stream = false', re: '\\bstream\\s*=\\s*false\\b' },
        ],
        hint: 'Property names in the anonymous object become the JSON keys, so write them in lower case.',
        explain: 'PostAsJsonAsync serializes the object to {"model":…,"prompt":…,"stream":false} and POSTs it.',
        output: '{"model":"gemma3",…,"response":"Kind of Blue","done":true,…}',
      },
      {
        kind: 'write',
        prompt: 'From C#, send /api/chat a system rule and a user question.',
        starter: `using System.Net.Http.Json;

${HTTP}
`,
        solution: `using System.Net.Http.Json;

${HTTP}
var res = await http.PostAsJsonAsync("/api/chat", new
{
    model = "llama3.2",
    messages = new[]
    {
        new { role = "system", content = "You are a tour guide in Kyoto." },
        new { role = "user", content = "One temple to visit?" },
    },
    stream = false,
});
Console.WriteLine(await res.Content.ReadAsStringAsync());`,
        checks: [
          { label: 'PostAsJsonAsync to "/api/chat"', re: '\\.PostAsJsonAsync\\(\\s*"/?api/chat"\\s*,' },
          { label: 'A messages array', re: '\\bmessages\\s*=\\s*(new(\\s*object)?\\s*\\[\\s*\\]|\\[)' },
          { label: 'A message with role = "system"', re: '\\brole\\s*=\\s*"system"\\s*,\\s*content\\s*=\\s*"[^"]+"' },
          { label: 'Then one with role = "user"', re: 'role\\s*=\\s*"system"[\\s\\S]*\\brole\\s*=\\s*"user"\\s*,\\s*content\\s*=\\s*"[^"]+"' },
          { label: 'stream = false', re: '\\bstream\\s*=\\s*false\\b' },
        ],
        hint: 'messages is an array of anonymous objects, each with role and content.',
        explain: 'The nested anonymous objects serialize to the same messages array you wrote by hand with curl.',
      },
    ],
    // L2 Typed replies
    [
      {
        kind: 'write',
        prompt: 'Read the reply into a record with Response and eval_count, then print both.',
        starter: `using System.Net.Http.Json;

${HTTP}
var res = await http.PostAsJsonAsync("/api/generate",
    new { model = "mistral", prompt = "Name a sea shanty.", stream = false });
`,
        solution: `using System.Net.Http.Json;
using System.Text.Json.Serialization;

${HTTP}
var res = await http.PostAsJsonAsync("/api/generate",
    new { model = "mistral", prompt = "Name a sea shanty.", stream = false });
res.EnsureSuccessStatusCode();
var reply = await res.Content.ReadFromJsonAsync<GenerateReply>();
Console.WriteLine($"{reply?.Response} ({reply?.EvalCount} tokens)");

record GenerateReply(string Response,
    [property: JsonPropertyName("eval_count")] int EvalCount);`,
        checks: [
          { label: 'using System.Text.Json.Serialization;', has: 'using System.Text.Json.Serialization;' },
          { label: 'EnsureSuccessStatusCode() before reading', re: '\\w+\\.EnsureSuccessStatusCode\\(\\)[\\s\\S]*ReadFromJsonAsync' },
          { label: 'ReadFromJsonAsync<YourRecord>()', re: '\\.ReadFromJsonAsync<(\\w+)>\\(\\)[\\s\\S]*record \\1\\(' },
          { label: 'A record with a string Response', re: 'record \\w+\\([^)]*\\bstring\\??\\s+Response\\b' },
          { label: 'An int mapped to "eval_count"', re: '\\[property:\\s*JsonPropertyName\\(\\s*"eval_count"\\s*\\)\\]\\s*(int|long)\\s+\\w+' },
          { label: 'Print the reply', re: 'Console\\.WriteLine\\([^;]*\\.Response' },
        ],
        hint: 'Matching ignores case, but snake_case needs JsonPropertyName with the property: target.',
        explain: 'Response matches "response" by name; eval_count needs the attribute because the underscore never matches.',
        output: 'Wellerman (6 tokens)',
      },
      {
        kind: 'write',
        prompt: 'Fix three bugs: streaming, error checking and the done_reason mapping.',
        starter: `using System.Net.Http.Json;
using System.Text.Json.Serialization;

${HTTP}
var res = await http.PostAsJsonAsync("/api/generate",
    new { model = "llama3.2", prompt = "Rate pineapple pizza out of 10.", stream = true });
var reply = await res.Content.ReadFromJsonAsync<Reply>();
Console.WriteLine($"{reply!.Response} [{reply.DoneReason}]");

record Reply(string Response,
    [JsonPropertyName("doneReason")] string DoneReason);
`,
        solution: `using System.Net.Http.Json;
using System.Text.Json.Serialization;

${HTTP}
var res = await http.PostAsJsonAsync("/api/generate",
    new { model = "llama3.2", prompt = "Rate pineapple pizza out of 10.", stream = false });
res.EnsureSuccessStatusCode();
var reply = await res.Content.ReadFromJsonAsync<Reply>();
Console.WriteLine($"{reply!.Response} [{reply.DoneReason}]");

record Reply(string Response,
    [property: JsonPropertyName("done_reason")] string DoneReason);`,
        checks: [
          { label: 'stream = false, so the body is one object', re: '\\bstream\\s*=\\s*false\\b' },
          { label: 'res.EnsureSuccessStatusCode() before reading', re: 'res\\.EnsureSuccessStatusCode\\(\\)[\\s\\S]*ReadFromJsonAsync' },
          { label: 'Map "done_reason" with the property: target', re: '\\[property:\\s*JsonPropertyName\\(\\s*"done_reason"\\s*\\)\\]' },
          { label: 'No "doneReason"', not: '"doneReason"' },
        ],
        hint: 'A stream is many JSON lines. The key in the reply is snake_case, and the attribute must target the property.',
        explain: 'One JSON object needs stream off, a failed call should throw early, and done_reason maps only by its exact name.',
        output: 'Pineapple pizza: a sweet, divisive 6/10. [stop]',
      },
    ],
    // L3 OllamaSharp & IChatClient
    [
      {
        kind: 'write',
        prompt: 'Ask gemma3 for a riddle through OllamaSharp’s IChatClient and print it.',
        starter: '',
        solution: `${CHAT_USINGS}
${chatClient('gemma3')}
ChatResponse r = await chat.GetResponseAsync("Tell me a riddle.");
Console.WriteLine(r.Text);`,
        checks: [
          { label: 'using Microsoft.Extensions.AI;', has: 'using Microsoft.Extensions.AI;' },
          { label: 'using OllamaSharp;', has: 'using OllamaSharp;' },
          { label: 'An IChatClient made with new OllamaApiClient(uri, model)', re: `IChatClient \\w+ = ${OLLAMA_CLIENT}` },
          { label: 'await GetResponseAsync with your prompt', re: 'await \\w+\\.GetResponseAsync\\(\\s*"[^"]+"\\s*\\)' },
          { label: 'Print the reply’s .Text', re: 'Console\\.WriteLine\\(\\s*\\w+\\.Text\\s*\\)' },
        ],
        hint: 'OllamaApiClient takes the server address and a model name. The reply text is on .Text.',
        explain: 'OllamaApiClient is an IChatClient, so the same GetResponseAsync works with any provider.',
        output: 'What has keys but can’t open locks? A piano.',
      },
      {
        kind: 'write',
        prompt: 'Rewrite this HttpClient call with OllamaSharp’s IChatClient.',
        starter: `using System.Net.Http.Json;

${HTTP}
var res = await http.PostAsJsonAsync("/api/generate",
    new { model = "llama3.2", prompt = "Suggest a name for a cat café.", stream = false });
var reply = await res.Content.ReadFromJsonAsync<Reply>();
Console.WriteLine(reply!.Response);

record Reply(string Response);
`,
        solution: `${CHAT_USINGS}
IChatClient chat = new OllamaApiClient(new Uri("http://localhost:11434"), "llama3.2");
ChatResponse r = await chat.GetResponseAsync("Suggest a name for a cat café.");
Console.WriteLine(r.Text);`,
        checks: [
          { label: 'The two usings for Microsoft.Extensions.AI and OllamaSharp', re: '(?=[\\s\\S]*using Microsoft\\.Extensions\\.AI;)(?=[\\s\\S]*using OllamaSharp;)' },
          { label: 'An IChatClient for llama3.2', re: 'IChatClient \\w+ = new OllamaApiClient\\([^;]*"llama3\\.2"\\s*\\)' },
          { label: 'GetResponseAsync with the same prompt', re: 'GetResponseAsync\\(\\s*"Suggest a name for a cat café\\.?"\\s*\\)' },
          { label: 'Print .Text', re: 'Console\\.WriteLine\\(\\s*\\w+\\.Text\\s*\\)' },
          { label: 'No PostAsJsonAsync', not: 'PostAsJsonAsync' },
        ],
        hint: 'No body, no record: the client builds the request and parses the reply.',
        explain: 'OllamaSharp does the JSON both ways, and it calls /api/chat for you behind IChatClient.',
      },
    ],
    // L4 History & options
    [
      {
        kind: 'write',
        prompt: 'Keep a chess coaching chat in a List<ChatMessage> and ask two questions.',
        starter: `${CHAT_USINGS}
${chatClient('llama3.2')}
`,
        solution: `${CHAT_USINGS}
${chatClient('llama3.2')}
List<ChatMessage> history = [new(ChatRole.System, "You are a chess coach.")];

history.Add(new(ChatRole.User, "Best first move for a beginner?"));
ChatResponse r1 = await chat.GetResponseAsync(history);
history.AddMessages(r1);

history.Add(new(ChatRole.User, "Why that one?"));
ChatResponse r2 = await chat.GetResponseAsync(history);
Console.WriteLine(r2.Text);`,
        checks: [
          { label: 'A List<ChatMessage> starting with a system message', re: 'List<ChatMessage> \\w+ = (\\[|new[^;]*)\\s*new(\\s*ChatMessage)?\\(\\s*ChatRole\\.System' },
          { label: 'Add a ChatRole.User question', re: '\\.Add\\(\\s*new(\\s*ChatMessage)?\\(\\s*ChatRole\\.User' },
          { label: 'Send the whole history to GetResponseAsync', re: 'GetResponseAsync\\(\\s*\\w+\\s*\\)' },
          { label: 'Append the reply with AddMessages', re: '\\.AddMessages\\(\\s*\\w+\\s*\\)' },
          { label: 'Then a second user question', re: 'AddMessages\\([\\s\\S]*ChatRole\\.User[\\s\\S]*GetResponseAsync' },
        ],
        hint: 'Add the user turn, send the list, then AddMessages the response before the next turn.',
        explain: 'The list is the whole conversation, so the second question can say “that one” and still make sense.',
      },
      {
        kind: 'write',
        prompt: 'Store replies with the right role, and make answers steady and short.',
        starter: `${CHAT_USINGS}
${chatClient('gemma3')}
List<ChatMessage> history = [new(ChatRole.System, "You are a quiz master.")];
history.Add(new(ChatRole.User, "Ask me a capital city question."));
ChatResponse reply = await chat.GetResponseAsync(history);
history.Add(new(ChatRole.User, reply.Text));
`,
        solution: `${CHAT_USINGS}
${chatClient('gemma3')}
List<ChatMessage> history = [new(ChatRole.System, "You are a quiz master.")];
var opts = new ChatOptions { Temperature = 0.2f, MaxOutputTokens = 80 };
history.Add(new(ChatRole.User, "Ask me a capital city question."));
ChatResponse reply = await chat.GetResponseAsync(history, opts);
history.AddMessages(reply);
Console.WriteLine(reply.Text);`,
        checks: [
          { label: 'Store the reply as the assistant', re: '\\.AddMessages\\(\\s*reply\\s*\\)|ChatRole\\.Assistant\\s*,\\s*reply\\.Text' },
          { label: 'Not as a user message', not: 'ChatRole.User, reply.Text' },
          { label: 'Temperature 0.2 in ChatOptions', re: 'new ChatOptions\\s*\\{[^}]*Temperature\\s*=\\s*0\\.2f' },
          { label: 'MaxOutputTokens 80', re: 'MaxOutputTokens\\s*=\\s*80\\b' },
          { label: 'Pass the options to GetResponseAsync', re: 'GetResponseAsync\\(\\s*\\w+\\s*,\\s*(\\w+|new ChatOptions[^;]*)\\)' },
        ],
        hint: 'Temperature is a float, so it needs an f. The options go in as the second argument.',
        explain: 'OllamaSharp sends Temperature as temperature and MaxOutputTokens as num_predict in the request options.',
      },
    ],
    // L5 Streaming in C#
    [
      {
        kind: 'write',
        prompt: 'Stream a short bedtime story to the console as it’s written.',
        starter: `${CHAT_USINGS}
${chatClient('gemma3')}
`,
        solution: `${CHAT_USINGS}
${chatClient('gemma3')}
await foreach (var u in chat.GetStreamingResponseAsync("Tell a 3-line bedtime story."))
{
    Console.Write(u.Text);
}
Console.WriteLine();`,
        checks: [
          { label: 'await foreach over GetStreamingResponseAsync', re: 'await foreach\\s*\\(\\s*(var|ChatResponseUpdate) \\w+ in \\w+\\.GetStreamingResponseAsync\\(' },
          { label: 'Print each piece with Console.Write (not WriteLine)', re: 'Console\\.Write\\(\\s*\\w+\\.Text\\s*\\)' },
          { label: 'Don’t wait for the whole reply', not: 'GetResponseAsync(' },
        ],
        hint: 'Each update holds a small piece of text. Write them side by side.',
        explain: 'Pieces arrive as the model writes them; Console.Write keeps them on one line, like ollama run.',
        output: 'The moon tucked the stars in.\nThe owl said goodnight.\nAnd the forest fell asleep.',
      },
      {
        kind: 'write',
        prompt: 'Stream the reply, then save it to the history as one message.',
        starter: `${CHAT_USINGS}
${chatClient('llama3.2')}
List<ChatMessage> history = [new(ChatRole.User, "Three tips for a first marathon?")];
`,
        solution: `${CHAT_USINGS}
${chatClient('llama3.2')}
List<ChatMessage> history = [new(ChatRole.User, "Three tips for a first marathon?")];
List<ChatResponseUpdate> updates = [];
await foreach (var u in chat.GetStreamingResponseAsync(history))
{
    Console.Write(u.Text);
    updates.Add(u);
}
history.AddMessages(updates);`,
        checks: [
          { label: 'A List<ChatResponseUpdate>', re: 'List<ChatResponseUpdate> \\w+ =' },
          { label: 'Stream with the history', re: 'await foreach\\s*\\([^)]*GetStreamingResponseAsync\\(\\s*history\\s*\\)' },
          { label: 'Print and keep each update in the loop', re: '(?=[\\s\\S]*Console\\.Write\\(\\s*\\w+\\.Text\\s*\\))(?=[\\s\\S]*\\w+\\.Add\\(\\s*\\w+\\s*\\);)' },
          { label: 'After the loop, AddMessages(updates)', re: '\\}\\s*\\w+\\.AddMessages\\(\\s*\\w+\\s*\\)' },
        ],
        hint: 'Collect the updates as they arrive; AddMessages joins them into one assistant message.',
        explain: 'You show the text live and still save a single assistant message for the next turn.',
      },
    ],
  ],
};

export default unit;
