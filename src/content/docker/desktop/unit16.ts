import type { DesktopUnit } from '../../../engine/types';

// Desktop edition: write-the-code challenges for Docker unit 16 (Dev containers).
// lessons[i] runs after lesson i + 1. See docs/CONTENT_GUIDE.md.

/** Regex source for a JSON key/value pair: "key": value (value is regex source). */
const kv = (key: string, value: string) => `"${key}"\\s*:\\s*${value}`;

/** Regex source: `inner` appears inside the JSON object that follows "key": { … } (one level of nesting allowed). */
const inObj = (key: string, inner: string) => `"${key}"\\s*:\\s*\\{(?:[^{}]|\\{[^{}]*\\})*?${inner}`;

const unit: DesktopUnit = {
  lessons: [
    // L1 devcontainer.json
    [
      {
        kind: 'write',
        prompt: 'Write a devcontainer.json named Budget that uses the Python 3.12 dev image.',
        starter: '// .devcontainer/devcontainer.json\n',
        solution:
          '// .devcontainer/devcontainer.json\n{\n  "name": "Budget",\n  "image": "mcr.microsoft.com/devcontainers/python:3.12"\n}',
        checks: [
          { label: 'A JSON object in { }', re: '^[\\s\\S]*\\{[\\s\\S]*\\}\\s*$' },
          { label: '"name": "Budget"', re: kv('name', '"Budget"') },
          { label: '"image": "mcr.microsoft.com/devcontainers/python:3.12"', re: kv('image', '"mcr\\.microsoft\\.com/devcontainers/python:3\\.12[\\w.-]*"') },
          { label: 'A comma between the two keys', re: '"\\s*,\\s*\\n?\\s*"(name|image)"' },
        ],
        hint: 'Keys and string values both take double quotes. Comments are allowed in this file.',
        explain: 'name labels the container in VS Code, and the ready-made Python image already has pip, git and a non-root vscode user.',
      },
      {
        kind: 'write',
        prompt: 'Build from the Dockerfile in the repo root instead of using a ready-made image.',
        starter:
          '// .devcontainer/devcontainer.json (the Dockerfile is in the repo root)\n{\n  "name": "Budget",\n  "image": "mcr.microsoft.com/devcontainers/python:3.12"\n}',
        solution:
          '// .devcontainer/devcontainer.json (the Dockerfile is in the repo root)\n{\n  "name": "Budget",\n  "build": {\n    "dockerfile": "../Dockerfile",\n    "context": ".."\n  }\n}',
        checks: [
          { label: 'A "build" object', re: kv('build', '\\{') },
          { label: '"dockerfile": "../Dockerfile"', re: inObj('build', kv('dockerfile', '"\\.\\./Dockerfile"')) },
          { label: '"context": ".." so COPY sees the whole repo', re: inObj('build', kv('context', '"\\.\\./?"')) },
          { label: 'Remove "image"', re: '^(?![\\s\\S]*"image"\\s*:)' },
        ],
        hint: 'Paths in build are relative to devcontainer.json, which sits one folder down.',
        explain: 'dockerfile points up a level to the repo root, and context: ".." sends the whole repo to the build, as docker build . would.',
      },
    ],
    // L2 Features & ports
    [
      {
        kind: 'write',
        prompt: 'Add Node 22 and the GitHub CLI as features, and forward port 3000.',
        starter: '{\n  "name": "Storefront",\n  "image": "mcr.microsoft.com/devcontainers/base:ubuntu"\n}',
        solution:
          '{\n  "name": "Storefront",\n  "image": "mcr.microsoft.com/devcontainers/base:ubuntu",\n  "features": {\n    "ghcr.io/devcontainers/features/node:1": { "version": "22" },\n    "ghcr.io/devcontainers/features/github-cli:1": {}\n  },\n  "forwardPorts": [3000]\n}',
        checks: [
          { label: 'A "features" object', re: kv('features', '\\{') },
          { label: 'The node:1 feature with "version": "22"', re: kv('ghcr\\.io/devcontainers/features/node:1', `\\{[^}]*${kv('version', '"22[\\w.]*"')}`) },
          { label: 'The github-cli:1 feature', re: kv('ghcr\\.io/devcontainers/features/github-cli:1', '\\{') },
          { label: '"forwardPorts" includes 3000', re: kv('forwardPorts', '\\[[^\\]]*\\b3000\\b') },
        ],
        hint: 'Each feature is a key holding an options object, {} when you take the defaults.',
        explain: 'Features install on top of any image, so you don’t maintain a Dockerfile for common tools. forwardPorts opens 3000 on your localhost.',
      },
      {
        kind: 'write',
        prompt: 'Add the .NET 10 feature, forward 5000 and 5432, and label 5432 as Postgres.',
        starter: '{\n  "name": "Clinic",\n  "image": "mcr.microsoft.com/devcontainers/base:ubuntu",\n  "forwardPorts": [5000]\n}',
        solution:
          '{\n  "name": "Clinic",\n  "image": "mcr.microsoft.com/devcontainers/base:ubuntu",\n  "features": {\n    "ghcr.io/devcontainers/features/dotnet:2": { "version": "10.0" }\n  },\n  "forwardPorts": [5000, 5432],\n  "portsAttributes": {\n    "5432": { "label": "Postgres" }\n  }\n}',
        checks: [
          { label: 'The dotnet:2 feature with "version": "10.0"', re: kv('ghcr\\.io/devcontainers/features/dotnet:2', `\\{[^}]*${kv('version', '"10(\\.0)?"')}`) },
          { label: '"forwardPorts" has 5000 and 5432', re: kv('forwardPorts', '\\[(?=[^\\]]*\\b5000\\b)(?=[^\\]]*\\b5432\\b)') },
          { label: '"portsAttributes" labels "5432" as Postgres', re: inObj('portsAttributes', kv('5432', `\\{[^}]*${kv('label', '"Postgres"')}`)) },
        ],
        hint: 'portsAttributes is keyed by the port number as a string.',
        explain: 'The label shows in VS Code’s Ports view, so the team can tell the database from the API at a glance.',
      },
    ],
    // L3 Lifecycle & extensions
    [
      {
        kind: 'write',
        prompt: 'Restore packages once after creation, and install the C# Dev Kit extension.',
        starter: '{\n  "name": "Clinic",\n  "image": "mcr.microsoft.com/devcontainers/base:ubuntu",\n  "features": { "ghcr.io/devcontainers/features/dotnet:2": { "version": "10.0" } }\n}',
        solution:
          '{\n  "name": "Clinic",\n  "image": "mcr.microsoft.com/devcontainers/base:ubuntu",\n  "features": { "ghcr.io/devcontainers/features/dotnet:2": { "version": "10.0" } },\n  "postCreateCommand": "dotnet restore",\n  "customizations": {\n    "vscode": {\n      "extensions": ["ms-dotnettools.csdevkit"]\n    }\n  }\n}',
        checks: [
          { label: '"postCreateCommand": "dotnet restore"', re: kv('postCreateCommand', '"dotnet restore[^"]*"') },
          { label: 'customizations → vscode → extensions', re: `${kv('customizations', '\\{')}\\s*${kv('vscode', '\\{')}\\s*${kv('extensions', '\\[')}` },
          { label: 'The extension ms-dotnettools.csdevkit', re: kv('extensions', '\\[[^\\]]*"ms-dotnettools\\.csdevkit"') },
        ],
        hint: 'Extension IDs are publisher.name. They live two objects deep.',
        explain: 'postCreateCommand runs once, so restore isn’t repeated on every start, and everyone who opens the repo gets the same extensions.',
      },
      {
        kind: 'write',
        prompt: 'Fix it: npm ci should run once, migrations on every start, extensions in the right place.',
        starter:
          '{\n  "name": "Storefront",\n  "image": "mcr.microsoft.com/devcontainers/javascript-node:22",\n  "postStartCommand": "npm ci && npm run db:migrate",\n  "extensions": ["dbaeumer.vscode-eslint", "esbenp.prettier-vscode"]\n}',
        solution:
          '{\n  "name": "Storefront",\n  "image": "mcr.microsoft.com/devcontainers/javascript-node:22",\n  "postCreateCommand": "npm ci",\n  "postStartCommand": "npm run db:migrate",\n  "customizations": {\n    "vscode": {\n      "extensions": ["dbaeumer.vscode-eslint", "esbenp.prettier-vscode"]\n    }\n  }\n}',
        checks: [
          { label: '"postCreateCommand": "npm ci"', re: kv('postCreateCommand', '"npm ci"') },
          { label: '"postStartCommand": "npm run db:migrate" only', re: kv('postStartCommand', '"npm run db:migrate"') },
          { label: 'Both extensions under customizations.vscode.extensions', re: `${kv('vscode', '\\{')}\\s*${kv('extensions', '\\[(?=[^\\]]*"dbaeumer\\.vscode-eslint")(?=[^\\]]*"esbenp\\.prettier-vscode")')}` },
          { label: 'No top-level "extensions"', re: '^(?![\\s\\S]*\\n  "extensions")' },
        ],
        hint: 'Installing packages is a one-time job. Top-level keys are shared by all tools; editor settings go under customizations.',
        explain: 'postStartCommand runs on every start, so npm ci there wasted time. A top-level extensions key is ignored by VS Code.',
      },
    ],
    // L4 User, mounts & env
    [
      {
        kind: 'write',
        prompt: 'Work as vscode, set ASPNETCORE_ENVIRONMENT, and keep NuGet packages in a volume.',
        starter: '{\n  "name": "Clinic",\n  "image": "mcr.microsoft.com/devcontainers/base:ubuntu",\n  "features": { "ghcr.io/devcontainers/features/dotnet:2": { "version": "10.0" } }\n}',
        solution:
          '{\n  "name": "Clinic",\n  "image": "mcr.microsoft.com/devcontainers/base:ubuntu",\n  "features": { "ghcr.io/devcontainers/features/dotnet:2": { "version": "10.0" } },\n  "remoteUser": "vscode",\n  "containerEnv": { "ASPNETCORE_ENVIRONMENT": "Development" },\n  "mounts": [\n    "source=clinic-nuget,target=/home/vscode/.nuget/packages,type=volume"\n  ]\n}',
        checks: [
          { label: '"remoteUser": "vscode"', re: kv('remoteUser', '"vscode"') },
          { label: '"containerEnv" sets ASPNETCORE_ENVIRONMENT to Development', re: inObj('containerEnv', kv('ASPNETCORE_ENVIRONMENT', '"Development"')) },
          { label: 'A volume mount at /home/vscode/.nuget/packages', re: kv('mounts', '\\[[^\\]]*"(?=[^"]*type=volume)(?=[^"]*source=[\\w.-]+)(?=[^"]*target=/home/vscode/\\.nuget/packages)') },
        ],
        hint: 'mounts entries are strings in --mount style: source=…,target=…,type=volume.',
        explain: 'The named volume outlives rebuilds, so restored packages don’t download again, and tools run as the non-root vscode user.',
      },
      {
        kind: 'write',
        prompt: 'Run as node and mount your own .ssh folder read-only, on Windows or Mac.',
        starter: '{\n  "name": "Storefront",\n  "image": "mcr.microsoft.com/devcontainers/javascript-node:22"\n}',
        solution:
          '{\n  "name": "Storefront",\n  "image": "mcr.microsoft.com/devcontainers/javascript-node:22",\n  "remoteUser": "node",\n  "mounts": [\n    "source=${localEnv:HOME}${localEnv:USERPROFILE}/.ssh,target=/home/node/.ssh,type=bind,readonly"\n  ]\n}',
        checks: [
          { label: '"remoteUser": "node"', re: kv('remoteUser', '"node"') },
          { label: 'Source from ${localEnv:HOME}${localEnv:USERPROFILE}/.ssh', re: 'source=(\\$\\{localEnv:HOME\\}\\$\\{localEnv:USERPROFILE\\}|\\$\\{localEnv:USERPROFILE\\}\\$\\{localEnv:HOME\\})/\\.ssh' },
          { label: 'target=/home/node/.ssh', re: 'target=/home/node/\\.ssh\\b' },
          { label: 'A bind mount, readonly', re: '"(?=[^"]*type=bind)(?=[^"]*\\b(readonly|ro)\\b)[^"]*"' },
        ],
        hint: 'HOME is set on Mac and Linux, USERPROFILE on Windows. Put both: the missing one is empty.',
        explain: 'An unset ${localEnv:…} becomes an empty string, so joining both works on every OS. readonly stops the container editing your keys.',
      },
    ],
    // L5 Compose, CLI & Codespaces
    [
      {
        kind: 'write',
        prompt: 'Make the dev container the app service of compose.yaml, with code in /workspaces/garage.',
        starter: '// .devcontainer/devcontainer.json\n',
        solution:
          '// .devcontainer/devcontainer.json\n{\n  "name": "Garage",\n  "dockerComposeFile": "compose.yaml",\n  "service": "app",\n  "workspaceFolder": "/workspaces/garage",\n  "shutdownAction": "stopCompose"\n}',
        checks: [
          { label: '"dockerComposeFile": "compose.yaml"', re: kv('dockerComposeFile', '(\\[\\s*)?"(\\./)?compose\\.ya?ml"') },
          { label: '"service": "app"', re: kv('service', '"app"') },
          { label: '"workspaceFolder": "/workspaces/garage"', re: kv('workspaceFolder', '"/workspaces/garage/?"') },
          { label: 'No "image" or "build": Compose decides', re: '^(?![\\s\\S]*"(image|build)"\\s*:)' },
        ],
        hint: 'Three keys connect it: which file, which service, and where the code lives inside.',
        explain: 'VS Code starts the whole Compose app and attaches to app. stopCompose shuts the other services down when you close the window.',
      },
      {
        kind: 'write',
        prompt: 'Write the compose.yaml it uses: an idle app container with the code, plus Postgres.',
        starter: '# .devcontainer/compose.yaml\n',
        solution:
          '# .devcontainer/compose.yaml\nservices:\n  app:\n    image: mcr.microsoft.com/devcontainers/base:ubuntu\n    volumes:\n      - ../..:/workspaces:cached\n    command: sleep infinity\n  db:\n    image: postgres:18\n    environment:\n      POSTGRES_PASSWORD: postgres\n    volumes:\n      - pgdata:/var/lib/postgresql\nvolumes:\n  pgdata:',
        checks: [
          { label: 'An app service', re: '^services:\\s*\\n[\\s\\S]*^[ \\t]+app:', flags: 'm' },
          { label: 'app mounts ../.. at /workspaces', re: '-[ \\t]*["\']?\\.\\./\\.\\.:/workspaces(:cached)?["\']?\\s*$', flags: 'm' },
          { label: 'app stays up with command: sleep infinity', re: 'command:\\s*(sleep\\s+infinity|\\[\\s*"sleep"\\s*,\\s*"infinity"\\s*\\])' },
          { label: 'A db service on a postgres image', re: '^[ \\t]+db:\\s*\\n(?:[ \\t]+.*\\n)*?[ \\t]+image:\\s*["\']?postgres\\b', flags: 'm' },
        ],
        hint: 'Paths are relative to this file in .devcontainer, so ../.. is the folder that holds your repo. app must not exit.',
        explain: 'sleep infinity keeps app running so VS Code can attach, and ../.. mounts the folder holding your repo at /workspaces.',
      },
    ],
  ],
  // Windows PowerShell versions of shared items (the phone keeps the bash ones).
  concepts: {
    4: {
      body: 'remoteUser picks who your terminals and tools run as, often the image’s non-root vscode or node user. mounts adds --mount style mounts, and containerEnv sets variables for every process. ${localEnv:VAR} reads a variable from your machine. On Windows your home folder is ${localEnv:USERPROFILE}; HOME is usually unset there, so files shared with Mac and Linux use ${localEnv:HOME}${localEnv:USERPROFILE}.',
      code: '"remoteUser": "node",\n"containerEnv": { "API_URL": "http://localhost:5000" },\n"mounts": [\n  "source=recipes-npm,target=/home/node/.npm,type=volume"\n]',
    },
  },
  overrides: {
    'L4.3': {
      kind: 'fill',
      prompt: 'Share your user folder’s .ssh, read-only.',
      code: '"mounts": [\n  "source=${localEnv:HOME}${localEnv:USERPROFILE}/.ssh,target=/home/vscode/.ssh,type=___,readonly"\n]',
      blanks: [{ answer: ['bind'], options: ['bind', 'volume', 'tmpfs'] }],
      hint: 'The source is a folder on your machine.',
      explain: 'Each string is docker run --mount syntax. A host path needs type=bind; a plain name with type=volume would make a named volume.',
    },
    'L4.6': {
      kind: 'fix',
      prompt: 'The mount has an empty source. Fix the variable.',
      code: '"mounts": [\n  "source=${[[containerEnv]]:USERPROFILE}/.aws,target=/home/vscode/.aws,type=bind"\n]',
      fix: 'localEnv',
      options: ['localEnv', 'hostEnv', 'remoteEnv'],
      hint: 'USERPROFILE is set on your Windows machine, not in the Linux container.',
      explain: '${containerEnv:VAR} reads the container’s environment, which has no USERPROFILE. ${localEnv:VAR} reads your host’s when the container is created.',
    },
  },
};

export default unit;
