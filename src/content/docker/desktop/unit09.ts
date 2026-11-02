import type { DesktopUnit } from '../../../engine/types';

// Desktop edition: write-the-code challenges for Docker unit 9 (Multi-stage builds).
// lessons[i] runs after lesson i + 1. See docs/CONTENT_GUIDE.md.

/** A JSON-array (exec form) string, e.g. "dotnet". */
const q = (s: string) => `\\s*"${s}"\\s*`;
/** `AS name` on a FROM line; keywords may be any case. */
const AS = '\\s+[Aa][Ss]\\s+';
/** The last FROM line in the file. */
const lastFrom = (image: string) => `^FROM\\s+${image}(?:\\s|$)(?![\\s\\S]*\\nFROM\\b)`;
/** One command line starting with `start` that also contains every fragment in `parts`, in any order. */
const cmd = (start: string, ...parts: string[]) =>
  `(?:^|\\n)[ \\t]*${start}${parts.map((p) => `(?=[^\\n]*${p})`).join('')}`;
const BUILD = 'docker\\s+(?:buildx\\s+|image\\s+)?build\\b';
const SDK = 'mcr\\.microsoft\\.com/dotnet/sdk:10\\.0\\S*';
const ASPNET = 'mcr\\.microsoft\\.com/dotnet/aspnet:10\\.0';
/** RUN --mount=type=cache for NuGet's package folder (keys in any order). */
const NUGET_CACHE = '--mount=(?=\\S*type=cache)(?=\\S*(?:target|dst|destination)=/root/\\.nuget/packages(?:,|\\s|$))\\S*';

const DOTNET_LISTEN = 'info: Microsoft.Hosting.Lifetime[14]\n      Now listening on: http://[::]:8080';

const unit: DesktopUnit = {
  lessons: [
    // L1 Two stages
    [
      {
        kind: 'write',
        prompt: 'Write two stages: a named Go stage that checks its version, then a small Alpine one.',
        starter: '',
        solution: 'FROM golang:1.26 AS build\nWORKDIR /src\nRUN go version\n\nFROM alpine:3.22\nCMD ["echo", "only this stage ships"]',
        checks: [
          { label: 'First stage: FROM golang … AS a name', re: `^FROM\\s+golang(?::\\S+)?${AS}\\w+\\s*$`, flags: 'm' },
          { label: 'RUN go version in that stage', re: `${AS}\\w+\\s*\\n(?:(?!FROM\\b)[^\\n]*\\n)*?RUN\\s+go\\s+version\\b` },
          { label: 'A second FROM alpine as the last stage', re: lastFrom('alpine(?::\\S+)?'), flags: 'm' },
          { label: 'The final stage has a CMD', re: '^FROM\\s+alpine\\b[\\s\\S]*^CMD\\s*\\[', flags: 'm' },
        ],
        hint: 'Every FROM starts a new stage. AS name goes at the end of the FROM line.',
        explain: 'Only the last stage becomes the image, so the whole Go toolchain stays behind and the result is tiny.',
        output: 'only this stage ships',
      },
      {
        kind: 'write',
        prompt: 'Reorder the stages so nginx:alpine ships, and name the node stage build.',
        starter:
          'FROM nginx:alpine\nCOPY site/ /usr/share/nginx/html/\n\nFROM node:22-alpine\nWORKDIR /src\nRUN npm --version\n',
        solution:
          'FROM node:22-alpine AS build\nWORKDIR /src\nRUN npm --version\n\nFROM nginx:alpine\nCOPY site/ /usr/share/nginx/html/',
        checks: [
          { label: 'FROM node:22-alpine AS build', re: `^FROM\\s+node:22-alpine${AS}build\\s*$`, flags: 'm' },
          { label: 'nginx:alpine is the last stage', re: lastFrom('nginx:alpine'), flags: 'm' },
          { label: 'Keep COPY site/ in the nginx stage', re: '^FROM\\s+nginx:alpine\\s*\\n[\\s\\S]*^COPY\\s+(?:\\./)?site/?\\s+/usr/share/nginx/html/?\\s*$', flags: 'm' },
          { label: 'Keep WORKDIR and RUN in the node stage', re: '^FROM\\s+node\\S*[^\\n]*\\n(?:(?!FROM\\b)[^\\n]*\\n)*?RUN\\s+npm\\s+--version', flags: 'm' },
        ],
        hint: 'The stage that should become the image goes last.',
        explain: 'In the starter, node was the last stage, so the image shipped Node and none of your site.',
      },
    ],
    // L2 COPY --from
    [
      {
        kind: 'write',
        prompt: 'Compile a Go todo app in one stage and ship only the binary on Alpine.',
        starter: '',
        solution:
          'FROM golang:1.26 AS build\nWORKDIR /src\nCOPY . .\nRUN CGO_ENABLED=0 go build -o /bin/todo .\n\nFROM alpine:3.22\nCOPY --from=build /bin/todo /usr/local/bin/todo\nENTRYPOINT ["todo"]',
        checks: [
          { label: 'A named golang build stage', re: `^FROM\\s+golang(?::\\S+)?${AS}\\w+\\s*$`, flags: 'm' },
          { label: 'go build -o to an output path', re: '^RUN\\b[^\\n]*\\bgo\\s+build\\b[^\\n]*\\s-o\\s+\\S+', flags: 'm' },
          { label: 'Final stage FROM alpine', re: lastFrom('alpine(?::\\S+)?'), flags: 'm' },
          {
            label: 'COPY --from=<stage> that same binary',
            re: `^FROM\\s+golang\\S*${AS}(\\w+)[\\s\\S]*\\bgo\\s+build\\b[^\\n]*\\s-o\\s+(\\S+)[\\s\\S]*^FROM\\b[\\s\\S]*^COPY\\s+--from=\\1\\s+\\2\\s+\\S+`,
            flags: 'm',
          },
          { label: 'Start it with an exec-form ENTRYPOINT or CMD', re: '^(?:ENTRYPOINT|CMD)\\s*\\[\\s*"[^"]*todo"', flags: 'm' },
        ],
        hint: 'COPY --from=build takes a path inside the build stage, then a path in this one.',
        explain: 'The final image holds Alpine and one static binary; the Go compiler never ships.',
        output: 'todo: 3 tasks open',
      },
      {
        kind: 'write',
        prompt: 'Copy the uv tool in straight from its image, then install and run with uv.',
        starter: '# uv’s image keeps its binaries at /uv and /uvx\nFROM python:3.13-slim\nWORKDIR /app\nCOPY . .\n',
        solution:
          '# uv’s image keeps its binaries at /uv and /uvx\nFROM python:3.13-slim\nCOPY --from=ghcr.io/astral-sh/uv:latest /uv /uvx /bin/\nWORKDIR /app\nCOPY . .\nRUN uv sync --locked\nCMD ["uv", "run", "main.py"]',
        checks: [
          { label: 'COPY --from=ghcr.io/astral-sh/uv', re: '^COPY\\s+--from=ghcr\\.io/astral-sh/uv(?::\\S+|@sha256:\\w+)?\\s', flags: 'm' },
          { label: 'Copy /uv into /bin/', re: '^COPY\\s+--from=\\S+(?=[^\\n]*\\s/uv\\s)[^\\n]*\\s/(?:usr/local/)?bin/?\\s*$', flags: 'm' },
          { label: 'Install with RUN uv sync', re: '^RUN\\s+uv\\s+sync\\b', flags: 'm' },
          { label: 'Start with uv run in an exec-form CMD', re: `^CMD\\s*\\[${q('uv')},${q('run')},`, flags: 'm' },
        ],
        hint: '--from also takes an image name; list several sources before the destination folder.',
        explain: 'COPY --from an image grabs just the files you need, without adding a stage or installing anything.',
        output: 'Installed 6 packages in 21ms\nBot ready.',
      },
    ],
    // L3 .NET publish image
    [
      {
        kind: 'write',
        prompt: 'Write a two-stage .NET 10 Dockerfile for Gym.Api: publish, then the aspnet runtime.',
        starter: '',
        solution:
          'FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build\nWORKDIR /src\nCOPY *.csproj ./\nRUN dotnet restore\nCOPY . .\nRUN dotnet publish -c Release -o /app/publish\n\nFROM mcr.microsoft.com/dotnet/aspnet:10.0\nWORKDIR /app\nCOPY --from=build /app/publish .\nENTRYPOINT ["dotnet", "Gym.Api.dll"]',
        checks: [
          { label: 'FROM the sdk:10.0 image AS a name', re: `^FROM\\s+${SDK}${AS}\\w+\\s*$`, flags: 'm' },
          { label: 'dotnet publish -c Release -o a folder', re: '^RUN\\s+dotnet\\s+publish\\b(?=[^\\n]*\\s-c\\s+Release\\b)[^\\n]*\\s(?:-o|--output)\\s+\\S+', flags: 'm' },
          { label: 'Final stage on aspnet:10.0', re: lastFrom(`${ASPNET}\\S*`), flags: 'm' },
          {
            label: 'COPY --from the build stage’s publish folder',
            re: `^FROM\\s+${SDK}${AS}(\\w+)[\\s\\S]*\\bdotnet\\s+publish\\b[^\\n]*\\s(?:-o|--output)\\s+(\\S+?)/?(?:\\s|$)[\\s\\S]*^COPY\\s+--from=\\1\\s+\\2/?\\s+\\S+`,
            flags: 'm',
          },
          { label: 'ENTRYPOINT ["dotnet", "Gym.Api.dll"]', re: `^ENTRYPOINT\\s*\\[${q('dotnet')},${q('Gym\\.Api\\.dll')}\\]`, flags: 'm' },
        ],
        hint: 'The SDK builds; the aspnet image only runs. COPY --from bridges the two.',
        explain: 'The final image has the runtime and your published files, but no SDK, so it’s far smaller.',
        output: DOTNET_LISTEN,
      },
      {
        kind: 'write',
        prompt: 'Split this into a build stage and a chiseled runtime stage, with cached restore.',
        starter:
          'FROM mcr.microsoft.com/dotnet/sdk:10.0\nWORKDIR /src\nCOPY . .\nRUN dotnet publish -c Release -o /app/publish\nWORKDIR /app/publish\nENTRYPOINT ["dotnet", "Tickets.Api.dll"]\n',
        solution:
          'FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build\nWORKDIR /src\nCOPY *.csproj ./\nRUN dotnet restore\nCOPY . .\nRUN dotnet publish -c Release -o /app/publish\n\nFROM mcr.microsoft.com/dotnet/aspnet:10.0-noble-chiseled\nWORKDIR /app\nCOPY --from=build /app/publish .\nENTRYPOINT ["dotnet", "Tickets.Api.dll"]',
        checks: [
          { label: 'Name the sdk stage', re: `^FROM\\s+${SDK}${AS}\\w+\\s*$`, flags: 'm' },
          { label: 'Restore after copying only the .csproj', re: '^COPY\\s+\\S*\\.csproj\\s+\\S+\\s*\\n(?:[^\\n]*\\n)*?RUN\\s+dotnet\\s+restore\\b', flags: 'm' },
          { label: 'Last stage: aspnet:10.0-noble-chiseled', re: lastFrom(`${ASPNET}-noble-chiseled`), flags: 'm' },
          { label: 'COPY --from=<build stage> the published app', re: `^FROM\\s+${SDK}${AS}(\\w+)[\\s\\S]*^COPY\\s+--from=\\1\\s+/app/publish/?\\s+\\S+`, flags: 'm' },
          { label: 'Exec-form ENTRYPOINT: chiseled images have no shell', re: `^ENTRYPOINT\\s*\\[${q('dotnet')},${q('Tickets\\.Api\\.dll')}\\]`, flags: 'm' },
        ],
        hint: 'Keep the SDK steps in the first stage; the second needs only WORKDIR, COPY --from and ENTRYPOINT.',
        explain: 'The chiseled runtime has no shell or package manager, so the shipped image is small and has little to attack.',
        output: DOTNET_LISTEN,
      },
    ],
    // L4 Target a stage
    [
      {
        kind: 'write',
        prompt: 'Build just the test stage, then a dev image from build, then the full api:1.0.',
        starter: '',
        solution: 'docker build --target test .\ndocker build --target build -t api:dev .\ndocker build -t api:1.0 .',
        checks: [
          { label: 'Build up to the test stage with --target test', re: cmd(BUILD, '\\s--target[\\s=]+test(?!\\S)') },
          { label: 'Build the build stage tagged api:dev', re: cmd(BUILD, '\\s--target[\\s=]+build(?!\\S)', '\\s(?:-t|--tag)[\\s=]+api:dev(?!\\S)') },
          { label: 'Build the whole file as api:1.0, no --target', re: cmd(`${BUILD}(?![^\\n]*--target)`, '\\s(?:-t|--tag)[\\s=]+api:1\\.0(?!\\S)') },
        ],
        hint: '--target names a stage from an AS in the Dockerfile.',
        explain: 'With --target the build stops at that stage; without it, BuildKit builds only what the last stage needs.',
        output: '[+] Building 41.7s (12/12) FINISHED\n => [test 1/1] RUN dotnet test\n…\nPassed!  - Failed: 0, Passed: 24, Skipped: 0, Total: 24',
      },
      {
        kind: 'write',
        prompt: 'Add a test stage, starting from build, that runs dotnet test.',
        starter:
          'FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build\nWORKDIR /src\nCOPY . .\nRUN dotnet restore\nRUN dotnet publish Api/Api.csproj -c Release -o /app/publish\n\nFROM mcr.microsoft.com/dotnet/aspnet:10.0\nWORKDIR /app\nCOPY --from=build /app/publish .\nENTRYPOINT ["dotnet", "Api.dll"]\n',
        solution:
          'FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build\nWORKDIR /src\nCOPY . .\nRUN dotnet restore\nRUN dotnet publish Api/Api.csproj -c Release -o /app/publish\n\nFROM build AS test\nRUN dotnet test\n\nFROM mcr.microsoft.com/dotnet/aspnet:10.0\nWORKDIR /app\nCOPY --from=build /app/publish .\nENTRYPOINT ["dotnet", "Api.dll"]',
        checks: [
          { label: 'FROM build AS test', re: `^FROM\\s+build${AS}test\\s*$`, flags: 'm' },
          { label: 'RUN dotnet test in that stage', re: `^FROM\\s+build${AS}test\\s*\\n(?:(?!FROM\\b)[^\\n]*\\n)*?RUN\\s+dotnet\\s+test\\b`, flags: 'm' },
          { label: 'The aspnet runtime is still the last stage', re: lastFrom(`${ASPNET}\\S*`), flags: 'm' },
          { label: 'The test stage comes after build', re: `${AS}build\\s*\\n[\\s\\S]*^FROM\\s+build${AS}test`, flags: 'm' },
        ],
        hint: 'FROM can start from an earlier stage’s name, which keeps its files and tools.',
        explain: 'docker build --target test . now fails if a test fails, while a normal build skips the stage entirely.',
        output: 'Passed!  - Failed: 0, Passed: 24, Skipped: 0, Total: 24, Duration: 1 s',
      },
    ],
    // L5 Build mounts
    [
      {
        kind: 'write',
        prompt: 'Cache npm’s downloads between builds with a cache mount on npm ci.',
        starter: '',
        solution:
          'FROM node:22-alpine\nWORKDIR /app\nCOPY package.json package-lock.json ./\nRUN --mount=type=cache,target=/root/.npm npm ci\nCOPY . .\nCMD ["node", "server.js"]',
        checks: [
          { label: 'Copy the package files first', re: '^COPY\\s+(?:package\\*\\.json|package\\.json\\s+package-lock\\.json)\\s+\\S+\\s*$', flags: 'm' },
          {
            label: 'RUN --mount=type=cache,target=/root/.npm npm ci',
            re: '^RUN\\s+--mount=(?=\\S*type=cache)(?=\\S*(?:target|dst|destination)=/root/\\.npm(?:,|\\s|$))\\S*\\s+(?:\\\\\\s*\\n\\s*)?npm\\s+(?:ci|install)\\b',
            flags: 'm',
          },
          { label: 'COPY . . after the install', re: '^RUN\\b(?:[^\\n]*\\\\\\n)*[^\\n]*npm\\s+(?:ci|install)\\b[\\s\\S]*^COPY\\s+\\.\\s+\\.', flags: 'm' },
          { label: 'A CMD to start the app', re: '^CMD\\s*\\[', flags: 'm' },
        ],
        hint: 'npm keeps its download cache in /root/.npm when building as root.',
        explain: 'Even when package.json changes and npm ci reruns, packages come from the cache mount instead of the network.',
      },
      {
        kind: 'write',
        prompt: 'Stop baking nuget.config into a layer: pass it as a secret and cache packages.',
        starter:
          'FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build\nWORKDIR /src\nCOPY *.csproj ./\nCOPY nuget.config ./\nRUN dotnet restore\nCOPY . .\nRUN dotnet publish -c Release -o /app/publish --no-restore\n',
        solution:
          'FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build\nWORKDIR /src\nCOPY *.csproj ./\nRUN --mount=type=secret,id=nuget --mount=type=cache,target=/root/.nuget/packages \\\n    dotnet restore --configfile /run/secrets/nuget\nCOPY . .\nRUN --mount=type=cache,target=/root/.nuget/packages \\\n    dotnet publish -c Release -o /app/publish --no-restore',
        checks: [
          { label: 'No COPY of nuget.config', not: 'COPY nuget.config' },
          { label: 'Mount the secret with id=nuget', re: '^RUN\\b[^\\n]*--mount=(?=\\S*type=secret)(?=\\S*\\bid=nuget(?:,|\\s|$))', flags: 'm' },
          { label: 'Restore with --configfile /run/secrets/nuget', re: 'dotnet\\s+restore\\b[^\\n]*\\s--configfile[\\s=]+/run/secrets/nuget(?!\\S)' },
          { label: 'Cache /root/.nuget/packages on restore and publish', re: `(?:${NUGET_CACHE}[\\s\\S]*){2}` },
        ],
        hint: 'The secret appears at /run/secrets/<id> only during that RUN. publish needs the cached packages too.',
        explain: 'Build with docker build --secret id=nuget,src=nuget.config . and the token never lands in any layer.',
      },
    ],
  ],
};

export default unit;
