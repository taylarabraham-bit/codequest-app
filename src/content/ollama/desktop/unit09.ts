import type { DesktopUnit } from '../../../engine/types';

// Desktop edition: write-the-code challenges for Ollama unit 9 (Building a RAG app).
// lessons[i] runs after lesson i + 1. See docs/CONTENT_GUIDE.md.

const SETUP = `using System.Numerics.Tensors;
using Microsoft.Extensions.AI;
using OllamaSharp;

var uri = new Uri("http://localhost:11434");
IChatClient chat = new OllamaApiClient(uri, "llama3.2");
IEmbeddingGenerator<string, Embedding<float>> gen = new OllamaApiClient(uri, "embeddinggemma");
`;
const CHUNK = 'record Chunk(string Text, ReadOnlyMemory<float> Vector);';

const unit: DesktopUnit = {
  lessons: [
    // L1 The RAG flow
    [
      {
        kind: 'write',
        prompt: 'Paste the context and question into one prompt and ask the chat model.',
        starter: `${SETUP}string context = "The gym opens at 6am on weekdays and 8am on weekends.";
string question = "When can I train on Saturday?";
`,
        solution: `${SETUP}string context = "The gym opens at 6am on weekdays and 8am on weekends.";
string question = "When can I train on Saturday?";
string prompt = $"Context:\\n{context}\\n\\nQuestion: {question}";
ChatResponse r = await chat.GetResponseAsync(prompt);
Console.WriteLine(r.Text);`,
        checks: [
          { label: 'An interpolated prompt with {context}', re: '\\$"[^"]*\\{context\\}' },
          { label: '…and {question}', re: '\\$"[^"]*\\{question\\}' },
          { label: 'Send it with chat.GetResponseAsync', re: 'await chat\\.GetResponseAsync\\(' },
          { label: 'Print the answer’s .Text', re: 'Console\\.WriteLine\\(\\s*\\w+\\.Text\\s*\\)' },
        ],
        hint: 'Use $"…" with the context first, then the question.',
        explain: 'That’s augment and generate: the model answers from the text you pasted, not from memory.',
        output: 'From 8am.',
      },
      {
        kind: 'write',
        prompt: 'Retrieve the closest note, paste it into the prompt and generate an answer.',
        starter: `${SETUP}string[] notes = ["Wi-Fi password is on the fridge.", "Bins go out on Tuesday.", "The boiler switch is in the hall cupboard."];
string question = "Where do I turn the heating on?";
`,
        solution: `${SETUP}string[] notes = ["Wi-Fi password is on the fridge.", "Bins go out on Tuesday.", "The boiler switch is in the hall cupboard."];
string question = "Where do I turn the heating on?";
var vecs = await gen.GenerateAsync(notes);
ReadOnlyMemory<float> q = await gen.GenerateVectorAsync(question);
int best = 0;
for (int i = 1; i < notes.Length; i++)
    if (TensorPrimitives.CosineSimilarity(q.Span, vecs[i].Vector.Span) >
        TensorPrimitives.CosineSimilarity(q.Span, vecs[best].Vector.Span)) best = i;
string prompt = $"Context:\\n{notes[best]}\\n\\nQuestion: {question}";
ChatResponse r = await chat.GetResponseAsync(prompt);
Console.WriteLine(r.Text);`,
        checks: [
          { label: 'Embed the notes and the question', re: '(?=[\\s\\S]*GenerateAsync\\(\\s*notes\\s*\\))(?=[\\s\\S]*GenerateVectorAsync\\(\\s*question\\s*\\))' },
          { label: 'Score with CosineSimilarity', re: 'TensorPrimitives\\.CosineSimilarity\\(' },
          { label: 'Put the best note and the question in the prompt', re: '\\$"[^"]*\\{(notes\\[\\w+\\]|\\w+)\\}[^"]*\\{question\\}' },
          { label: 'Retrieve first, then GetResponseAsync', re: 'GenerateVectorAsync[\\s\\S]*CosineSimilarity[\\s\\S]*chat\\.GetResponseAsync\\(' },
        ],
        hint: 'Retrieve (embed and score), then augment (build the prompt), then generate.',
        explain: 'Only the best note goes in the prompt, so the model answers about the boiler, not the bins.',
        output: 'The boiler switch is in the hall cupboard.',
      },
    ],
    // L2 Chunking text
    [
      {
        kind: 'write',
        prompt: 'Read rules.txt and split it into trimmed, non-empty paragraph chunks.',
        starter: '',
        solution: `string text = File.ReadAllText("rules.txt");
string[] chunks = text.Split("\\n\\n",
    StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);
Console.WriteLine($"{chunks.Length} chunks");`,
        checks: [
          { label: 'Read the file with File.ReadAllText', re: 'File\\.ReadAllText\\(\\s*"rules\\.txt"\\s*\\)' },
          { label: 'Split on blank lines: "\\n\\n"', re: '\\.Split\\(\\s*"\\\\n\\\\n"' },
          { label: 'RemoveEmptyEntries', has: 'StringSplitOptions.RemoveEmptyEntries' },
          { label: 'TrimEntries, combined with |', re: 'RemoveEmptyEntries\\s*\\|\\s*StringSplitOptions\\.TrimEntries|TrimEntries\\s*\\|\\s*StringSplitOptions\\.RemoveEmptyEntries' },
        ],
        hint: 'A blank line is two newlines in a row. Options combine with |.',
        explain: 'Each paragraph becomes one chunk, so each vector stands for one idea; empty pieces are dropped.',
      },
      {
        kind: 'write',
        prompt: 'Group the sentences into chunks of 3 that share one sentence with the next.',
        starter: `string[] s = ["Doors open at 9.", "Bring your ticket.", "Bags are checked.", "No food inside.", "Exit by gate B.", "Parking is free."];
List<string> chunks = [];
`,
        solution: `string[] s = ["Doors open at 9.", "Bring your ticket.", "Bags are checked.", "No food inside.", "Exit by gate B.", "Parking is free."];
List<string> chunks = [];
for (int i = 0; i < s.Length - 1; i += 2)
    chunks.Add(string.Join(" ", s.Skip(i).Take(3)));
foreach (string c in chunks) Console.WriteLine(c);`,
        checks: [
          { label: 'Step forward 2 sentences at a time', re: '\\b\\w+\\s*\\+=\\s*2\\b' },
          { label: 'Take 3 sentences per chunk', re: '\\.Skip\\(\\s*\\w+\\s*\\)\\s*\\.Take\\(\\s*3\\s*\\)' },
          { label: 'Join them with spaces into chunks', re: 'chunks\\.Add\\(\\s*string\\.Join\\(\\s*" "' },
          { label: 'Print the chunks', re: 'Console\\.WriteLine\\(' },
        ],
        hint: 'Three per chunk, one shared: how far should the start move each time?',
        explain: 'Each chunk repeats the last sentence of the one before, so an idea split at a border isn’t lost.',
        output:
          'Doors open at 9. Bring your ticket. Bags are checked.\nBags are checked. No food inside. Exit by gate B.\nExit by gate B. Parking is free.',
      },
    ],
    // L3 Indexing chunks
    [
      {
        kind: 'write',
        prompt: 'Embed the chunks in one call and pair each text with its vector.',
        starter: `${SETUP}string[] chunks = ["Check-in is at 3pm.", "Breakfast runs 7 to 10.", "Pets stay free."];
`,
        solution: `${SETUP}string[] chunks = ["Check-in is at 3pm.", "Breakfast runs 7 to 10.", "Pets stay free."];
var embeddings = await gen.GenerateAsync(chunks);
List<Chunk> index = chunks.Zip(embeddings, (t, e) => new Chunk(t, e.Vector)).ToList();
Console.WriteLine(index.Count);

${CHUNK}`,
        checks: [
          { label: 'A record with string Text and ReadOnlyMemory<float> Vector', re: 'record \\w+\\(\\s*string \\w+\\s*,\\s*ReadOnlyMemory<float> \\w+\\s*\\)' },
          { label: 'One GenerateAsync call for all chunks', re: 'await gen\\.GenerateAsync\\(\\s*chunks\\s*\\)' },
          { label: 'Pair them up with Zip', re: '\\.Zip\\(\\s*\\w+\\s*,' },
          { label: 'Store each embedding’s .Vector', re: 'new \\w+\\(\\s*\\w+\\s*,\\s*\\w+\\.Vector\\s*\\)' },
        ],
        hint: 'The vectors come back in the same order as the chunks, so pair them by position.',
        explain: 'Each record keeps the text you will paste into prompts next to the vector you search with.',
        output: '3',
      },
      {
        kind: 'write',
        prompt: 'Build the index for menu.txt: split into paragraphs, embed once, pair up.',
        starter: SETUP,
        solution: `${SETUP}string text = File.ReadAllText("menu.txt");
string[] chunks = text.Split("\\n\\n",
    StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);
var embeddings = await gen.GenerateAsync(chunks);
List<Chunk> index = chunks.Zip(embeddings, (t, e) => new Chunk(t, e.Vector)).ToList();
Console.WriteLine($"Indexed {index.Count} chunks");

${CHUNK}`,
        checks: [
          { label: 'Read menu.txt', re: 'File\\.ReadAllText\\(\\s*"menu\\.txt"\\s*\\)' },
          { label: 'Split on blank lines, dropping empties', re: '\\.Split\\(\\s*"\\\\n\\\\n"[^;]*RemoveEmptyEntries' },
          { label: 'Embed every chunk in one GenerateAsync call', re: 'await gen\\.GenerateAsync\\(\\s*\\w+\\s*\\)' },
          { label: 'Zip texts and vectors into records', re: '\\.Zip\\([^;]*new \\w+\\(\\s*\\w+\\s*,\\s*\\w+\\.Vector\\s*\\)' },
          { label: 'Declare the record', re: 'record \\w+\\(\\s*string \\w+\\s*,\\s*ReadOnlyMemory<float> \\w+\\s*\\)' },
        ],
        hint: 'Chunk, then embed, then pair: three steps, each using the one before.',
        explain: 'This index is the searchable copy of your document that the next lesson ranks.',
      },
    ],
    // L4 Top matches
    [
      {
        kind: 'write',
        prompt: 'Find and print the three chunks closest to the question.',
        starter: `${SETUP}// index: List<Chunk> built with gen (embeddinggemma)
string question = "Can I bring my dog?";
`,
        solution: `${SETUP}// index: List<Chunk> built with gen (embeddinggemma)
string question = "Can I bring my dog?";
ReadOnlyMemory<float> q = await gen.GenerateVectorAsync(question);
var top = index
    .OrderByDescending(c => TensorPrimitives.CosineSimilarity(q.Span, c.Vector.Span))
    .Take(3);
foreach (var c in top) Console.WriteLine(c.Text);`,
        checks: [
          { label: 'Embed the question with gen', re: 'await gen\\.GenerateVectorAsync\\(\\s*question\\s*\\)' },
          { label: 'OrderByDescending by cosine similarity', re: '\\.OrderByDescending\\(\\s*\\w+\\s*=>\\s*TensorPrimitives\\.CosineSimilarity\\(' },
          { label: 'Compare with each chunk’s Vector.Span', re: 'CosineSimilarity\\(\\s*\\w+\\.Span\\s*,\\s*\\w+\\.Vector\\.Span\\s*\\)' },
          { label: 'Take(3)', has: '.Take(3)' },
          { label: 'Print each chunk’s text', re: 'Console\\.WriteLine\\(\\s*\\w+\\.Text\\s*\\)' },
        ],
        hint: 'Highest score first, then keep the first three.',
        explain: 'Ranking every chunk by similarity and keeping the top three gives the model just the relevant parts.',
        output: 'Pets stay free.\nCheck-in is at 3pm.\nBreakfast runs 7 to 10.',
      },
      {
        kind: 'write',
        prompt: 'Fix the search: the index’s embedding model, best first, top three.',
        starter: `${SETUP}// index was built with embeddinggemma
IEmbeddingGenerator<string, Embedding<float>> qGen = new OllamaApiClient(uri, "nomic-embed-text");
ReadOnlyMemory<float> q = await qGen.GenerateVectorAsync("Is there a kids menu?");
var top = index
    .OrderBy(c => TensorPrimitives.CosineSimilarity(q.Span, c.Vector.Span))
    .Take(1);
foreach (var c in top) Console.WriteLine(c.Text);
`,
        solution: `${SETUP}// index was built with embeddinggemma
IEmbeddingGenerator<string, Embedding<float>> qGen = new OllamaApiClient(uri, "embeddinggemma");
ReadOnlyMemory<float> q = await qGen.GenerateVectorAsync("Is there a kids menu?");
var top = index
    .OrderByDescending(c => TensorPrimitives.CosineSimilarity(q.Span, c.Vector.Span))
    .Take(3);
foreach (var c in top) Console.WriteLine(c.Text);`,
        checks: [
          { label: 'Embed the question with embeddinggemma', re: 'qGen = new OllamaApiClient\\(\\s*uri\\s*,\\s*"embeddinggemma"\\s*\\)|await gen\\.GenerateVectorAsync\\(' },
          { label: 'No nomic-embed-text', not: 'nomic-embed-text' },
          { label: 'Best first with OrderByDescending', re: '\\.OrderByDescending\\(' },
          { label: 'Not OrderBy', not: '.OrderBy(' },
          { label: 'Take(3)', has: '.Take(3)' },
        ],
        hint: 'Vectors from different models can’t be compared. Ascending order puts the worst match first.',
        explain: 'Same model for index and query, highest score first, three chunks for context.',
      },
    ],
    // L5 Grounded answers
    [
      {
        kind: 'write',
        prompt: 'Answer from the top chunks only, with an “I don’t know” rule.',
        starter: `${SETUP}// top: the best Chunk records from the search
string question = "Do you open on Sundays?";
`,
        solution: `${SETUP}// top: the best Chunk records from the search
string question = "Do you open on Sundays?";
string context = string.Join("\\n\\n", top.Select(c => c.Text));
string rules = "Answer only from the context. If it is not there, say \\"I don't know\\".";
List<ChatMessage> messages =
[
    new(ChatRole.System, $"{rules}\\n\\n{context}"),
    new(ChatRole.User, question),
];
ChatResponse r = await chat.GetResponseAsync(messages);
Console.WriteLine(r.Text);`,
        checks: [
          { label: 'Join the chunk texts with string.Join', re: 'string\\.Join\\([^;]*\\.Select\\(\\s*(\\w+)\\s*=>\\s*\\1\\.Text\\s*\\)' },
          { label: 'A rule to say “I don’t know”', re: 'I don(\\\\?\'|’)?t know', flags: 'i' },
          { label: 'A system message holding the context', re: 'ChatRole\\.System\\s*,\\s*\\$?"?[^;]*\\bcontext\\b' },
          { label: 'Then the question as a user message', re: 'ChatRole\\.User\\s*,\\s*question' },
          { label: 'Send the messages list', re: 'GetResponseAsync\\(\\s*messages\\s*\\)' },
        ],
        hint: 'Rules and context go in one system message at the top; the question is the user turn.',
        explain: 'Grounded in the context with a way out, the model says “I don’t know” instead of guessing.',
        output: 'I don’t know.',
      },
      {
        kind: 'write',
        prompt: 'Fix the grounded answer: join the texts, add the rules, send every message.',
        starter: `${SETUP}// top: the best Chunk records from the search
string question = "Is parking free?";
string context = string.Join("\\n\\n", top);
List<ChatMessage> messages =
[
    new(ChatRole.System, context),
    new(ChatRole.User, question),
];
ChatResponse r = await chat.GetResponseAsync(question);
Console.WriteLine(r.Text);
`,
        solution: `${SETUP}// top: the best Chunk records from the search
string question = "Is parking free?";
string context = string.Join("\\n\\n", top.Select(c => c.Text));
string rules = "Answer only from the context. If it is not there, say \\"I don't know\\".";
List<ChatMessage> messages =
[
    new(ChatRole.System, $"{rules}\\n\\n{context}"),
    new(ChatRole.User, question),
];
ChatResponse r = await chat.GetResponseAsync(messages);
Console.WriteLine(r.Text);`,
        checks: [
          { label: 'Join the .Text of each chunk, not the records', re: 'string\\.Join\\([^;]*\\.Select\\(\\s*(\\w+)\\s*=>\\s*\\1\\.Text\\s*\\)' },
          { label: 'Add an “I don’t know” rule', re: 'I don(\\\\?\'|’)?t know', flags: 'i' },
          { label: 'Put the rules and context in the system message', re: 'ChatRole\\.System\\s*,\\s*\\$"[^"]*\\{\\w+\\}[^"]*\\{\\w+\\}' },
          { label: 'Send messages, not just the question', re: 'GetResponseAsync\\(\\s*messages\\s*\\)' },
          { label: 'No GetResponseAsync(question)', not: 'GetResponseAsync(question)' },
        ],
        hint: 'Joining records prints their ToString(). The model only sees what you send.',
        explain: 'Sending only the question threw away the context and rules, so the model answered from memory.',
        output: 'Yes, parking is free.',
      },
    ],
  ],
};

export default unit;
