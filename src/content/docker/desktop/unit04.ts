import type { DesktopUnit } from '../../../engine/types';

// Desktop edition: write-the-code challenges for Docker unit 4 (Building & tagging).
// lessons[i] runs after lesson i + 1. See docs/CONTENT_GUIDE.md.

/** One command line starting with `start` that also contains every fragment in `parts`, in any order. */
const cmd = (start: string, ...parts: string[]) =>
  `(?:^|\\n)[ \\t]*${start}${parts.map((p) => `(?=[^\\n]*${p})`).join('')}`;
const BUILD = 'docker\\s+(?:buildx\\s+|image\\s+)?build\\b';
const TAG = 'docker\\s+(?:image\\s+)?tag\\b';
const t = (ref: string) => `\\s(?:-t|--tag)[\\s=]+${ref}(?!\\S)`;
/** The build context `.` as its own argument. */
const DOT = '\\s\\.(?!\\S)';

const BUILT = (id: string) =>
  `[+] Building 6.2s (9/9) FINISHED                            docker:desktop-linux\n => [internal] load build definition from Dockerfile         0.0s\n => exporting to image                                       0.3s\n => => writing image sha256:${id}  0.0s`;

const unit: DesktopUnit = {
  lessons: [
    // L1 docker build
    [
      {
        kind: 'write',
        prompt: 'Build the Dockerfile in ./api, then build dev.Dockerfile from the current folder.',
        starter: '',
        solution: 'docker build ./api\ndocker build -f dev.Dockerfile .',
        checks: [
          { label: 'Build with ./api as the context', re: cmd(BUILD, '\\s(?:\\./)?api/?(?!\\S)') },
          { label: 'Pick dev.Dockerfile with -f', re: cmd(BUILD, '\\s(?:-f|--file)[\\s=]+(?:\\./)?dev\\.Dockerfile(?!\\S)') },
          { label: 'Use . as that build’s context', re: cmd(BUILD, '\\s(?:-f|--file)\\b', DOT) },
        ],
        hint: 'The last argument is always the context folder. -f only names the file.',
        explain: 'docker build ./api reads api/Dockerfile and sends the api folder; -f changes the file but not the context.',
        output: BUILT('7d1b5e9f3a2c4e6b8d0f1a3c5e7b9d2f4a6c8e0b1d3f5a7c9e2b4d6f8a0c1e3b'),
      },
      {
        kind: 'write',
        prompt: 'Fix each build: every docker build needs a context folder.',
        starter: 'docker build\ndocker build web/Dockerfile\ndocker build -f ci/test.Dockerfile\n',
        solution: 'docker build .\ndocker build ./web\ndocker build -f ci/test.Dockerfile .',
        checks: [
          { label: 'Build the current folder with docker build .', re: cmd(`${BUILD}(?![^\\n]*(?:-f|--file)\\b)`, DOT) },
          { label: 'Build the web folder (a folder, not a file)', re: cmd(BUILD, '\\s(?:\\./)?web/?(?!\\S)') },
          { label: 'ci/test.Dockerfile with . as the context', re: cmd(BUILD, '\\s(?:-f|--file)[\\s=]+(?:\\./)?ci/test\\.Dockerfile(?!\\S)', DOT) },
          { label: 'Don’t pass a Dockerfile as the context', not: 'build web/Dockerfile' },
        ],
        hint: 'The context is a folder. To use a Dockerfile elsewhere, name it with -f and still give the folder.',
        explain: 'Without a context Docker has nothing to read, and a file path isn’t a folder, so both of those fail.',
        output: BUILT('2c6e0a4b8d1f3e5a7c9b0d2f4e6a8c1b3d5f7e9a0c2e4b6d8f1a3c5e7b9d0f2a'),
      },
    ],
    // L2 Tagging builds
    [
      {
        kind: 'write',
        prompt: 'Build quiz as 1.0 and latest in one go, tag 1.0 as stable, then list them.',
        starter: '',
        solution: 'docker build -t quiz:1.0 -t quiz:latest .\ndocker tag quiz:1.0 quiz:stable\ndocker images quiz',
        checks: [
          { label: 'Build with -t quiz:1.0 and -t quiz:latest', re: cmd(BUILD, t('quiz:1\\.0'), t('quiz(?::latest)?'), DOT) },
          { label: 'docker tag quiz:1.0 quiz:stable', re: cmd(`${TAG}\\s+quiz:1\\.0\\s+quiz:stable(?!\\S)`) },
          { label: 'List the quiz images', re: cmd('docker\\s+(?:images|image\\s+ls)\\s+quiz\\b') },
        ],
        hint: 'Repeat -t for each name. docker tag takes the existing name first, then the new one.',
        explain: 'All three tags point at the same image ID, so the listing shows one image three times.',
        output:
          'REPOSITORY   TAG      IMAGE ID       CREATED          SIZE\nquiz         1.0      3f8a2c6e1b9d   10 seconds ago   182MB\nquiz         latest   3f8a2c6e1b9d   10 seconds ago   182MB\nquiz         stable   3f8a2c6e1b9d   10 seconds ago   182MB',
      },
      {
        kind: 'write',
        prompt: 'Fix the release script: build notes:2.1 plus latest, then tag 2.1 as stable.',
        starter: 'docker build -t Notes:2.1 .\ndocker tag notes:stable notes:2.1\n',
        solution: 'docker build -t notes:2.1 -t notes:latest .\ndocker tag notes:2.1 notes:stable',
        checks: [
          { label: 'Build notes:2.1 in lowercase', re: cmd(BUILD, t('notes:2\\.1'), DOT) },
          { label: 'Also tag that build as notes:latest', re: cmd(BUILD, t('notes:2\\.1'), t('notes(?::latest)?')) },
          { label: 'docker tag source first: notes:2.1 notes:stable', re: cmd(`${TAG}\\s+notes:2\\.1\\s+notes:stable(?!\\S)`) },
          { label: 'No uppercase repo name', not: 'Notes:' },
        ],
        hint: 'Repo names must be lowercase. docker tag SOURCE TARGET.',
        explain: 'An uppercase name fails the build, and swapping the docker tag arguments points at an image that doesn’t exist yet.',
        output: BUILT('9a1c3e5b7d0f2a4c6e8b1d3f5a7c9e0b2d4f6a8c1e3b5d7f9a0c2e4b6d8f1a3c'),
      },
    ],
    // L3 .dockerignore
    [
      {
        kind: 'write',
        prompt: 'Write a .dockerignore for a .NET project: skip bin, obj, .git and every log file.',
        starter: '',
        solution: 'bin/\nobj/\n.git\n**/*.log',
        checks: [
          { label: 'Leave out bin/', re: '^(?:\\*\\*/)?bin/?\\s*$', flags: 'm' },
          { label: 'Leave out obj/', re: '^(?:\\*\\*/)?obj/?\\s*$', flags: 'm' },
          { label: 'Leave out .git', re: '^\\.git/?\\s*$', flags: 'm' },
          { label: 'Logs at any depth with **/*.log', re: '^\\*\\*/\\*\\.log\\s*$', flags: 'm' },
        ],
        hint: 'One pattern per line. *.log alone only matches the top folder.',
        explain: 'Skipping build output and .git keeps the context small and stops COPY . . from sending stale files.',
      },
      {
        kind: 'write',
        prompt: 'Fix it so README.md is kept, and also leave out .env.',
        starter: '!README.md\n*.md\nnode_modules\n',
        solution: '*.md\n!README.md\nnode_modules\n.env',
        checks: [
          { label: 'Leave out Markdown files with *.md', re: '^(?:\\*\\*/)?\\*\\.md\\s*$', flags: 'm' },
          { label: '!README.md comes after *.md', re: '^(?:\\*\\*/)?\\*\\.md\\s*$[\\s\\S]*^!README\\.md\\s*$', flags: 'm' },
          { label: 'Still leave out node_modules', re: '^(?:\\*\\*/)?node_modules/?\\s*$', flags: 'm' },
          { label: 'Leave out .env', re: '^\\.env\\s*$', flags: 'm' },
        ],
        hint: 'When lines clash, the last match wins.',
        explain: 'With !README.md first, the later *.md line excluded it again; putting the exception last keeps it.',
      },
    ],
    // L4 Layer caching
    [
      {
        kind: 'write',
        prompt: 'Write a Node 22 Dockerfile that caches npm ci until package files change.',
        starter: '',
        solution: 'FROM node:22-alpine\nWORKDIR /app\nCOPY package.json package-lock.json ./\nRUN npm ci\nCOPY . .\nCMD ["node", "server.js"]',
        checks: [
          { label: 'FROM a node:22 image, then a WORKDIR', re: '^FROM\\s+node:22\\S*\\s*\\n[\\s\\S]*^WORKDIR\\s+\\S+', flags: 'm' },
          { label: 'COPY only the package files first', re: '^COPY\\s+(?:package\\*\\.json|package\\.json\\s+package-lock\\.json)\\s+\\S+\\s*$', flags: 'm' },
          { label: 'RUN npm ci after copying them', re: '^COPY\\s+package[^\\n]*\\n(?:[^\\n]*\\n)*?RUN\\s+npm\\s+(?:ci|install)\\b', flags: 'm' },
          { label: 'COPY . . only after the install', re: '^RUN\\s+npm\\s+(?:ci|install)\\b[^\\n]*\\n[\\s\\S]*^COPY\\s+\\.\\s+\\.', flags: 'm' },
          { label: 'A CMD to start the app', re: '^CMD\\s*\\[', flags: 'm' },
        ],
        hint: 'Copy package.json and package-lock.json, install, and only then copy the rest.',
        explain: 'Editing your code only changes the COPY . . layer, so the slow npm ci step stays cached.',
      },
      {
        kind: 'write',
        prompt: 'Reorder this .NET Dockerfile so restore stays cached when code changes.',
        starter: 'FROM mcr.microsoft.com/dotnet/sdk:10.0\nWORKDIR /src\nCOPY . .\nRUN dotnet restore\nRUN dotnet publish -c Release -o /out\n',
        solution:
          'FROM mcr.microsoft.com/dotnet/sdk:10.0\nWORKDIR /src\nCOPY *.csproj ./\nRUN dotnet restore\nCOPY . .\nRUN dotnet publish -c Release -o /out',
        checks: [
          { label: 'COPY the .csproj before restoring', re: '^COPY\\s+\\S*\\.csproj\\s+\\S+\\s*\\n(?:[^\\n]*\\n)*?RUN\\s+dotnet\\s+restore\\b', flags: 'm' },
          { label: 'No COPY . . before restore', re: '^(?![\\s\\S]*\\nCOPY\\s+\\.\\s+\\.[\\s\\S]*\\nRUN\\s+dotnet\\s+restore)' },
          { label: 'COPY . . after restore', re: '^RUN\\s+dotnet\\s+restore\\b[\\s\\S]*^COPY\\s+\\.\\s+\\.', flags: 'm' },
          { label: 'Publish after copying the code', re: '^COPY\\s+\\.\\s+\\.[\\s\\S]*^RUN\\s+dotnet\\s+publish\\b', flags: 'm' },
        ],
        hint: 'Restore only needs the project file; the code can come in afterwards.',
        explain: 'Once COPY . . sees a change, every later step reruns, so it must come after the slow restore.',
      },
    ],
    // L5 Build arguments
    [
      {
        kind: 'write',
        prompt: 'Let the build pick the Python version with an ARG, defaulting to 3.13.',
        starter: '',
        solution: 'ARG PY_VERSION=3.13\nFROM python:${PY_VERSION}-slim\nWORKDIR /app\nCOPY . .\nCMD ["python", "main.py"]',
        checks: [
          { label: 'ARG with default 3.13 before FROM', re: '^ARG\\s+\\w+=3\\.13\\s*\\n[\\s\\S]*^FROM\\b', flags: 'm' },
          { label: 'FROM python uses that ARG in its tag', re: '^ARG\\s+(\\w+)=[\\s\\S]*^FROM\\s+python:\\$(?:\\{\\1\\}|\\1\\b)', flags: 'm' },
          { label: 'Copy the app and start it with CMD', re: '^COPY\\s+[\\s\\S]*^CMD\\s*\\[', flags: 'm' },
        ],
        hint: 'Write ARG NAME=default, then FROM python:${NAME}-slim.',
        explain: 'docker build --build-arg PY_VERSION=3.12 . now swaps the base image without editing the file.',
      },
      {
        kind: 'write',
        prompt: 'Fix the ARGs so the RUN step sees both the tag and the build number.',
        starter:
          'ARG DOTNET_TAG=10.0\nFROM mcr.microsoft.com/dotnet/aspnet:${DOTNET_TAG}\nWORKDIR /app\nRUN echo "build $BUILD_NUMBER on $DOTNET_TAG" > build.txt\n',
        solution:
          'ARG DOTNET_TAG=10.0\nFROM mcr.microsoft.com/dotnet/aspnet:${DOTNET_TAG}\nARG DOTNET_TAG\nARG BUILD_NUMBER=0\nWORKDIR /app\nRUN echo "build $BUILD_NUMBER on $DOTNET_TAG" > build.txt',
        checks: [
          { label: 'Repeat ARG DOTNET_TAG after FROM', re: '^FROM\\b[\\s\\S]*^ARG\\s+DOTNET_TAG\\s*$', flags: 'm' },
          { label: 'Declare BUILD_NUMBER with a default', re: '^ARG\\s+BUILD_NUMBER=\\S+', flags: 'm' },
          { label: 'Both ARGs come before the RUN', re: '^FROM\\b(?=[\\s\\S]*^ARG\\s+DOTNET_TAG\\s*$[\\s\\S]*^RUN)(?=[\\s\\S]*^ARG\\s+BUILD_NUMBER\\b[\\s\\S]*^RUN)', flags: 'm' },
        ],
        hint: 'An ARG before FROM only reaches FROM. Inside the stage, declare it again with no value.',
        explain: 'Each stage starts with no ARGs; ARG DOTNET_TAG re-imports the earlier value and BUILD_NUMBER can be set with --build-arg.',
      },
    ],
  ],
  // Windows PowerShell versions of shared items (the phone keeps the bash ones).
  overrides: {
    'L3.7': {
      kind: 'order',
      prompt: 'Ignore .git, rebuild notes, then list its /app files.',
      lines: ['Add-Content .dockerignore ".git"', 'docker build -t notes .', 'docker run --rm notes ls -a'],
      hint: 'The rule must exist before the build reads the context.',
      explain:
        '.dockerignore is read at the start of every build, so the rebuilt image’s COPY . . skips .git. Use Add-Content, not echo >>: in Windows PowerShell 5.1, >> writes the file as UTF-16, which Docker doesn’t read as plain patterns. ls -a runs inside the Linux container.',
      output: '.\n..\n.dockerignore\nDockerfile\napp.py\nrequirements.txt',
    },
  },
};

export default unit;
