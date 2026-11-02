import type { Tour } from '../../engine/types';

const tours: Tour[] = [
  {
    title: 'Ollama in the terminal',
    blurb: 'Download a model and chat with it, all from PowerShell.',
    screen: 'terminal',
    steps: [
      {
        prompt: 'Check Ollama is installed: type ollama --version.',
        hint: 'Two dashes before version.',
        explain: 'On Windows the Ollama app runs the server in the background (look for the llama icon in the system tray). Your version will differ.',
        command: ['ollama --version', 'ollama -v'],
        output: 'ollama version is 0.12.6',
      },
      {
        prompt: 'Download the llama3.2 model.',
        hint: 'ollama pull, then the model name.',
        explain: 'pull downloads a model from the Ollama library. llama3.2 is the 3B model, about 2 GB.',
        command: ['ollama pull llama3.2', 'ollama pull llama3.2:latest'],
        output: 'pulling manifest\npulling dde5aa3fc5ff: 100% ▕██████████████████▏ 2.0 GB\nverifying sha256 digest\nwriting manifest\nsuccess',
      },
      {
        prompt: 'List the models you have downloaded.',
        hint: 'One word after ollama.',
        explain: 'ollama list (or ollama ls) shows each local model with its ID, size and when it changed.',
        command: ['ollama list', 'ollama ls'],
        output: 'NAME               ID              SIZE      MODIFIED\nllama3.2:latest    a80c4f17acd5    2.0 GB    10 seconds ago',
      },
      {
        prompt: 'Start chatting with llama3.2.',
        hint: 'ollama run, then the model name.',
        explain: 'run loads the model (pulling it first if needed) and opens a chat prompt: >>>.',
        command: ['ollama run llama3.2', 'ollama run llama3.2:latest'],
        output: '>>> Send a message (/? for help)',
      },
      {
        prompt: 'You are at the >>> chat prompt. Leave the chat.',
        hint: 'Chat commands start with a slash.',
        explain: '/bye exits the chat (Ctrl+D works too). /? lists the other commands, like /set and /show.',
        command: ['/bye'],
      },
      {
        prompt: 'Check which models are loaded in memory right now.',
        hint: 'Like docker ps, but for models.',
        explain: 'ollama ps shows loaded models, whether they run on the GPU or CPU, and when they will be unloaded (5 minutes after last use by default).',
        command: ['ollama ps'],
        output: 'NAME               ID              SIZE      PROCESSOR    CONTEXT    UNTIL\nllama3.2:latest    a80c4f17acd5    3.5 GB    100% GPU     4096       4 minutes from now',
      },
    ],
  },
  {
    title: 'Talking to the Ollama API',
    blurb: 'Your apps talk to Ollama over HTTP on port 11434.',
    screen: 'terminal',
    steps: [
      {
        prompt: 'Check the server is up: call http://localhost:11434 with curl.exe.',
        hint: 'curl.exe http://localhost:11434',
        explain: 'In Windows PowerShell, plain curl is a different command (Invoke-WebRequest), so type curl.exe to get real curl.',
        command: ['curl.exe http://localhost:11434', 'curl.exe http://localhost:11434/', 'curl.exe localhost:11434'],
        output: 'Ollama is running',
      },
      {
        prompt: 'List the local models through the API.',
        hint: 'The endpoint is /api/tags.',
        explain: 'GET /api/tags returns the same models as ollama list, as JSON.',
        command: ['curl.exe http://localhost:11434/api/tags', 'curl.exe localhost:11434/api/tags'],
        output: '{"models":[{"name":"llama3.2:latest","model":"llama3.2:latest","size":2019393189,"details":{"family":"llama","parameter_size":"3.2B","quantization_level":"Q4_K_M"}}]}',
      },
      {
        prompt: 'Now do it the PowerShell way, which turns the JSON into objects.',
        hint: 'Invoke-RestMethod, then the URL.',
        explain: 'Invoke-RestMethod (alias irm) parses JSON for you, so you can write (irm http://localhost:11434/api/tags).models.name.',
        command: ['Invoke-RestMethod http://localhost:11434/api/tags', 'irm http://localhost:11434/api/tags'],
        output: 'models\n------\n{@{name=llama3.2:latest; model=llama3.2:latest; size=2019393189; …}}',
      },
      {
        prompt: 'Show details about llama3.2: its size, context length and quantization.',
        hint: 'ollama show, then the model name.',
        explain: 'ollama show prints the architecture, parameter count, context length and quantization. Add --modelfile to see the Modelfile.',
        command: ['ollama show llama3.2', 'ollama show llama3.2:latest'],
        output: '  Model\n    architecture        llama\n    parameters          3.2B\n    context length      131072\n    embedding length    3072\n    quantization        Q4_K_M',
      },
      {
        prompt: 'Delete the model to free up disk space.',
        hint: 'ollama rm, then the model name.',
        explain: 'rm deletes a local model. You can pull it again any time.',
        command: ['ollama rm llama3.2', 'ollama rm llama3.2:latest'],
        output: "deleted 'llama3.2'",
      },
    ],
  },
];

export default tours;
