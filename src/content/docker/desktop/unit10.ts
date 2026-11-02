import type { DesktopUnit } from '../../../engine/types';

// Desktop edition: write-the-code challenges for Docker unit 10 (Registries & publishing).
// lessons[i] runs after lesson i + 1. See docs/CONTENT_GUIDE.md.

/** One command line starting with `start` that also contains every fragment in `parts`, in any order. */
const cmd = (start: string, ...parts: string[]) =>
  `(?:^|\\n)[ \\t]*${start}${parts.map((p) => `(?=[^\\n]*${p})`).join('')}`;
const RUN = 'docker\\s+(?:container\\s+)?run\\b';
const PULL = 'docker\\s+(?:image\\s+)?pull\\b';
const TAG = 'docker\\s+(?:image\\s+)?tag\\b';
const PUSH = 'docker\\s+(?:image\\s+)?push\\b';
const BUILDX = 'docker\\s+(?:buildx\\s+)?build\\b';
/** A token piped into docker login for ghcr.io, with a username. */
const STDIN_LOGIN = cmd('[^\\n]*\\|\\s*docker\\s+login\\b', '\\sghcr\\.io(?!\\S)', '\\s(?:-u|--username)[\\s=]+\\S+', '\\s--password-stdin(?!\\S)');
const t = (ref: string) => `\\s(?:-t|--tag)[\\s=]+${ref}(?!\\S)`;

// Made-up but well-formed digests (the same ones the unit's lessons use).
const NGINX = 'sha256:49a396810e7db38036573840d997ded961509157d6366921c81e9ec66d9a499e';
const NODE = 'sha256:7a51f4c2e8b90d3f6c15a2e94b087d3c1f65e2a9b48d07c3e1f9a26b5d8c4e07';
const TRACKER = 'sha256:5c2e8a1f9b3d7e6a0c4f2b8d1e9a3c7f5b0d6e2a8c4f1b9d3e7a5c0f2b6d8e1a';

const unit: DesktopUnit = {
  lessons: [
    // L1 Logging in
    [
      {
        kind: 'write',
        prompt: 'Log in to Docker Hub, then to ghcr.io with a token from $env:GH_TOKEN.',
        starter: '',
        solution: 'docker login\n$env:GH_TOKEN | docker login ghcr.io -u ana --password-stdin',
        checks: [
          { label: 'docker login with no server for Docker Hub', re: '^[ \\t]*docker\\s+login\\s*$', flags: 'm' },
          { label: 'Pipe the token into docker login ghcr.io', re: STDIN_LOGIN },
          { label: 'The token comes from $env:GH_TOKEN', re: '\\$env:GH_TOKEN[^\\n]*\\|\\s*docker\\s+login\\b' },
        ],
        hint: 'In PowerShell, $env:GH_TOKEN | docker login … sends the token on standard input. --password-stdin needs -u.',
        explain: 'The token never appears as an argument, so it doesn’t end up in your shell history or the process list.',
        output: 'Login Succeeded\nLogin Succeeded',
      },
      {
        kind: 'write',
        prompt: 'Stop typing the token: log out of ghcr.io, then log back in via stdin.',
        starter: 'docker login ghcr.io -u ana -p ghp_9xQw2LmT4v\n',
        solution: 'docker logout ghcr.io\n$env:GH_TOKEN | docker login ghcr.io -u ana --password-stdin',
        checks: [
          { label: 'Log out of ghcr.io', re: cmd('docker\\s+logout\\s+ghcr\\.io(?!\\S)') },
          { label: 'Log in again with --password-stdin', re: STDIN_LOGIN },
          { label: 'No token on the command line', not: 'ghp_9xQw2LmT4v' },
          { label: 'Log out before logging back in', re: 'logout\\s+ghcr\\.io[\\s\\S]*\\|\\s*docker\\s+login\\b' },
        ],
        hint: 'docker logout takes the registry host. Read the token from an environment variable instead.',
        explain: '-p leaves the token in your history and process list; --password-stdin keeps it out of both.',
        output: 'Removing login credentials for ghcr.io\nLogin Succeeded',
      },
    ],
    // L2 Registry names
    [
      {
        kind: 'write',
        prompt: 'Pull nginx, ana/api:1.0 and your local registry’s api, all by their full names.',
        starter: '',
        solution: 'docker pull docker.io/library/nginx\ndocker pull docker.io/ana/api:1.0\ndocker pull localhost:5000/api',
        checks: [
          { label: 'nginx as docker.io/library/nginx', re: cmd(`${PULL}\\s+docker\\.io/library/nginx(?::[\\w.-]+)?(?!\\S)`) },
          { label: 'ana/api:1.0 as docker.io/ana/api:1.0', re: cmd(`${PULL}\\s+docker\\.io/ana/api:1\\.0(?!\\S)`) },
          { label: 'api from localhost:5000', re: cmd(`${PULL}\\s+localhost:5000/api(?::[\\w.-]+)?(?!\\S)`) },
        ],
        hint: 'Official images live under library/ on docker.io. A host with a colon, like localhost:5000, is a registry.',
        explain: 'These are what nginx and ana/api already mean; localhost:5000 is a registry only because the name says so.',
        output:
          'Using default tag: latest\nlatest: Pulling from library/nginx\nStatus: Image is up to date for nginx:latest\ndocker.io/library/nginx:latest',
      },
      {
        kind: 'write',
        prompt: 'Run a local registry on port 5000, then give alpine and quiz names that point at it.',
        starter: '',
        solution:
          'docker run -d --name registry -p 5000:5000 registry:3\ndocker tag alpine:3.22 localhost:5000/alpine:3.22\ndocker tag quiz:1.0 localhost:5000/ana/quiz:1.0',
        checks: [
          { label: 'Run the registry image publishing 5000:5000', re: cmd(RUN, '\\s(?:-p|--publish)[\\s=]+5000:5000(?!\\S)', '\\sregistry(?::[\\w.-]+)?(?!\\S)') },
          { label: 'Tag alpine as localhost:5000/alpine…', re: cmd(`${TAG}\\s+alpine(?::[\\w.-]+)?\\s+localhost:5000/alpine(?::[\\w.-]+)?(?!\\S)`) },
          { label: 'Tag quiz:1.0 with a namespace on localhost:5000', re: cmd(`${TAG}\\s+quiz:1\\.0\\s+localhost:5000/[\\w.-]+/quiz:1\\.0(?!\\S)`) },
        ],
        hint: 'docker tag SOURCE localhost:5000/name:tag. The registry image listens on 5000.',
        explain: 'Because the first part has a colon, Docker treats localhost:5000 as the registry host for these names.',
        output: '3c9e1a5b7d2f4e6a8c0b1d3f5e7a9c2b4d6f8e0a1c3b5d7f9e2a4c6b8d0f1e3a',
      },
    ],
    // L3 Pushing images
    [
      {
        kind: 'write',
        prompt: 'Publish tracker:1.3 to ghcr.io under your account.',
        starter: '',
        solution: 'docker tag tracker:1.3 ghcr.io/ana/tracker:1.3\ndocker push ghcr.io/ana/tracker:1.3',
        checks: [
          { label: 'Tag tracker:1.3 as ghcr.io/<you>/tracker:1.3', re: cmd(`${TAG}\\s+tracker:1\\.3\\s+ghcr\\.io/[\\w.-]+/tracker:1\\.3(?!\\S)`) },
          { label: 'Push that full name', re: `${TAG}\\s+tracker:1\\.3\\s+(ghcr\\.io/[\\w.-]+/tracker:1\\.3)(?!\\S)[\\s\\S]*${PUSH}\\s+\\1(?!\\S)` },
        ],
        hint: 'docker push sends an image to the registry in its name, so the name must start with ghcr.io.',
        explain: 'Tagging adds a ghcr.io name without copying anything; push uploads the layers to that registry.',
        output: `The push refers to repository [ghcr.io/ana/tracker]\n8f1d3b5e7a9c: Pushed\ne0e1707308fe: Pushed\n1.3: digest: ${TRACKER} size: 856`,
      },
      {
        kind: 'write',
        prompt: 'This push is denied. Tag tracker for ana on Docker Hub and push both tags at once.',
        starter: 'docker push tracker:1.3\n',
        solution: 'docker tag tracker:1.3 ana/tracker:1.3\ndocker tag tracker:1.3 ana/tracker:latest\ndocker push --all-tags ana/tracker',
        checks: [
          { label: 'Tag ana/tracker:1.3', re: cmd(`${TAG}\\s+tracker:1\\.3\\s+(?:docker\\.io/)?ana/tracker:1\\.3(?!\\S)`) },
          { label: 'Tag ana/tracker:latest', re: cmd(`${TAG}\\s+tracker:1\\.3\\s+(?:docker\\.io/)?ana/tracker(?::latest)?(?!\\S)`) },
          { label: 'Push every tag with --all-tags', re: cmd(PUSH, '\\s(?:-a|--all-tags)(?!\\S)', '\\s(?:docker\\.io/)?ana/tracker(?!\\S)') },
          { label: 'Not the bare name: that means library/tracker', not: 'docker push tracker:1.3' },
        ],
        hint: 'Without an account in front, Docker Hub reads the name as an official library image.',
        explain: 'Only Docker can push to library/; under ana/ it’s your repository, and --all-tags sends 1.3 and latest together.',
        output:
          'The push refers to repository [docker.io/ana/tracker]\n8f1d3b5e7a9c: Pushed\ne0e1707308fe: Pushed\n1.3: digest: ' +
          `${TRACKER} size: 856\n8f1d3b5e7a9c: Layer already exists\ne0e1707308fe: Layer already exists\nlatest: digest: ${TRACKER} size: 856`,
      },
    ],
    // L4 Digests
    [
      {
        kind: 'write',
        prompt: 'Show your images with digests, then pull nginx pinned by its digest.',
        starter: `# nginx's digest: ${NGINX}\n`,
        solution: `# nginx's digest: ${NGINX}\ndocker images --digests\ndocker pull nginx@${NGINX}`,
        checks: [
          { label: 'List images with --digests', re: cmd('docker\\s+(?:images|image\\s+ls)\\b', '\\s--digests(?!\\S)') },
          { label: 'Pull nginx@sha256:…', re: cmd(`${PULL}\\s+(?:docker\\.io/(?:library/)?)?nginx(?::[\\w.-]+)?@sha256:[0-9a-f]{64}(?!\\S)`) },
        ],
        hint: 'Put @ and the digest after the name instead of :tag.',
        explain: 'A tag can be moved to a new build; a digest always names exactly the same image content.',
        output: `docker.io/library/nginx@${NGINX}: Pulling from library/nginx\nDigest: ${NGINX}\nStatus: Downloaded newer image for nginx@${NGINX}\ndocker.io/library/nginx@${NGINX}`,
      },
      {
        kind: 'write',
        prompt: 'Pin both base images in this Dockerfile by digest.',
        starter: `# node:22-alpine is ${NODE}\n# nginx:alpine is ${NGINX}\nFROM node:22-alpine AS build\nWORKDIR /src\nCOPY . .\nRUN npm ci && npm run build\n\nFROM nginx:alpine\nCOPY --from=build /src/dist /usr/share/nginx/html\n`,
        solution: `# node:22-alpine is ${NODE}\n# nginx:alpine is ${NGINX}\nFROM node:22-alpine@${NODE} AS build\nWORKDIR /src\nCOPY . .\nRUN npm ci && npm run build\n\nFROM nginx:alpine@${NGINX}\nCOPY --from=build /src/dist /usr/share/nginx/html`,
        checks: [
          { label: 'node pinned with @sha256:', re: `^FROM\\s+node(?::[\\w.-]+)?@${NODE}\\s+[Aa][Ss]\\s+build\\s*$`, flags: 'm' },
          { label: 'nginx pinned with @sha256:', re: `^FROM\\s+nginx(?::[\\w.-]+)?@${NGINX}\\s*$`, flags: 'm' },
          { label: 'Every FROM uses a digest', re: '^(?![\\s\\S]*(?:^|\\n)FROM\\s+(?!build\\b)[^@\\s]+(?:\\s|$))' },
          { label: 'Keep COPY --from=build', re: '^COPY\\s+--from=build\\s', flags: 'm' },
        ],
        hint: 'Keeping the tag is fine: name:tag@sha256:… documents it, and the digest wins.',
        explain: 'Builds now use exactly these bytes even if someone pushes a new node:22-alpine tomorrow.',
      },
    ],
    // L5 Multi-platform builds
    [
      {
        kind: 'write',
        prompt: 'Build api for Intel and ARM, push it to ghcr.io, then check its platforms.',
        starter: '',
        solution:
          'docker buildx build --platform linux/amd64,linux/arm64 -t ghcr.io/ana/api:1.0 --push .\ndocker buildx imagetools inspect ghcr.io/ana/api:1.0',
        checks: [
          {
            label: '--platform with linux/amd64 and linux/arm64, comma-separated',
            re: cmd(BUILDX, '\\s--platform[\\s=]+(?:linux/amd64,linux/arm64|linux/arm64,linux/amd64)(?!\\S)'),
          },
          { label: 'Tag it ghcr.io/<you>/api:1.0', re: cmd(BUILDX, t('ghcr\\.io/[\\w.-]+/api:1\\.0')) },
          { label: 'Upload both with --push', re: cmd(BUILDX, '\\s--push(?!\\S)') },
          { label: 'Use . as the context', re: cmd(BUILDX, '\\s\\.(?!\\S)') },
          { label: 'Inspect it with docker buildx imagetools inspect', re: cmd('docker\\s+buildx\\s+imagetools\\s+inspect\\s+ghcr\\.io/[\\w.-]+/api:1\\.0(?!\\S)') },
        ],
        hint: 'One --platform with a comma between the two, then -t, --push and the context.',
        explain: 'The tag now points at a list with one build per CPU, and each machine pulls the one that fits.',
        output:
          'Name:      ghcr.io/ana/api:1.0\nMediaType: application/vnd.oci.image.index.v1+json\nDigest:    sha256:36698c34bd021b6f683d3f5898572635dbd69873695ffc3d0913955e5c330618\n\nManifests:\n  Platform:  linux/amd64\n  Platform:  linux/arm64',
      },
      {
        kind: 'write',
        prompt: 'Fix the release: log in, comma-separate the platforms, add latest, and push.',
        starter: 'docker buildx build --platform linux/amd64 linux/arm64 -t ghcr.io/ana/notes:3.1 .\n',
        solution:
          '$env:GH_TOKEN | docker login ghcr.io -u ana --password-stdin\ndocker buildx build --platform linux/amd64,linux/arm64 -t ghcr.io/ana/notes:3.1 -t ghcr.io/ana/notes:latest --push .',
        checks: [
          { label: 'Log in to ghcr.io with --password-stdin first', re: `${STDIN_LOGIN}[\\s\\S]*${BUILDX}` },
          { label: 'Platforms as one comma-separated list', re: cmd(BUILDX, '\\s--platform[\\s=]+(?:linux/amd64,linux/arm64|linux/arm64,linux/amd64)(?!\\S)') },
          { label: 'Tag both notes:3.1 and notes:latest', re: cmd(BUILDX, t('ghcr\\.io/ana/notes:3\\.1'), t('ghcr\\.io/ana/notes(?::latest)?')) },
          { label: 'Add --push', re: cmd(BUILDX, '\\s--push(?!\\S)') },
          { label: 'No space between the platforms', not: 'linux/amd64 linux/arm64' },
        ],
        hint: 'With a space, linux/arm64 is read as the build context. Repeat -t for each tag.',
        explain: 'One build now uploads both platforms under 3.1 and latest; without --push a multi-platform build would only be cached.',
        output:
          ' => [linux/amd64 4/4] RUN npm run build                          3.1s\n => [linux/arm64 4/4] RUN npm run build                          5.4s\n => => pushing manifest for ghcr.io/ana/notes:3.1@sha256:d7b18506904d3215cbe93271eaddb57942b2a6477db596cc620ed259253152a8  1.1s',
      },
    ],
  ],
  // Windows PowerShell versions of shared items (the phone keeps the bash ones).
  concepts: {
    1: {
      body: 'docker login with no server signs you in to Docker Hub, the default registry. For another registry, name its host and pipe an access token in with --password-stdin, which also needs -u. In PowerShell, $env:CR_PAT | docker login … pipes the token from an environment variable. docker logout removes a saved login.',
      code: 'docker login\n$env:CR_PAT | docker login ghcr.io -u ana --password-stdin\ndocker logout ghcr.io',
    },
    5: {
      body: 'An image is built for one platform, such as linux/amd64 (Intel and AMD) or linux/arm64 (Apple silicon and ARM servers). docker buildx build --platform with a comma-separated list builds each one, and --push uploads them all under one tag. Each machine that pulls the tag gets the build for its CPU. In PowerShell, a backtick ` at the very end of a line continues the command on the next one.',
      code: 'docker buildx build `\n  --platform linux/amd64,linux/arm64 `\n  -t ghcr.io/ana/api:1.0 --push .',
    },
  },
  overrides: {
    'L1.5': {
      kind: 'fill',
      prompt: 'The token comes from stdin. Add the username flag.',
      code: '$env:CR_PAT | docker login ghcr.io ___ ana --password-stdin',
      blanks: [{ answer: ['-u'], options: ['-u', '-p', '--name'] }],
      hint: '--password-stdin still needs to know who you are.',
      explain: '--password-stdin reads the token from the pipe but only works with -u. -p sets a password, which clashes with --password-stdin.',
      output: 'Login Succeeded',
    },
    'L1.6': {
      kind: 'build',
      prompt: 'After $env:CR_PAT |, sign in to ghcr.io as ana.',
      answer: ['docker', 'login', 'ghcr.io', '-u', 'ana', '--password-stdin'],
      alt: [
        ['docker', 'login', 'ghcr.io', '--password-stdin', '-u', 'ana'],
        ['docker', 'login', '-u', 'ana', 'ghcr.io', '--password-stdin'],
        ['docker', 'login', '-u', 'ana', '--password-stdin', 'ghcr.io'],
        ['docker', 'login', '--password-stdin', 'ghcr.io', '-u', 'ana'],
        ['docker', 'login', '--password-stdin', '-u', 'ana', 'ghcr.io'],
      ],
      distractors: ['-p', '--token'],
      hint: 'The host, the username flag and name, then the stdin flag.',
      explain: 'The token arrives through the pipe, so it never appears in the command or your shell history.',
      output: 'Login Succeeded',
    },
    'boss.1': {
      kind: 'order',
      prompt: 'Release quiz 2.0. Sign in first, sign out last.',
      lines: [
        '$env:CR_PAT | docker login ghcr.io -u ana --password-stdin',
        'docker build -t quiz:2.0 .',
        'docker tag quiz:2.0 ghcr.io/ana/quiz:2.0',
        'docker push ghcr.io/ana/quiz:2.0',
        'docker logout ghcr.io',
      ],
      hint: 'Login and logout wrap the rest; each middle step needs the one before.',
      explain: 'Build, tag with the registry host, push, then log out so the token isn’t left on the machine.',
    },
    'L5.1': {
      kind: 'fill',
      prompt: 'Add 64-bit ARM to the platform list.',
      code: 'docker buildx build --platform linux/amd64,linux/___ `\n  -t ghcr.io/ana/api:1.0 --push .',
      blanks: [{ answer: ['arm64'], options: ['arm64', 'arm-64', 'apple'] }],
      hint: 'amd64 is the Intel/AMD one. The ARM one follows the same pattern.',
      explain: 'linux/arm64 covers Apple silicon Macs and ARM cloud servers. Each entry is os/arch.',
      output: ' => [linux/amd64 4/4] COPY . .                                    0.2s\n => [linux/arm64 4/4] COPY . .                                    0.2s\n => exporting to image                                            6.8s\n => => exporting manifest list sha256:36698c34bd021b6f683d3f5898572635dbd69873695ffc3d0913955e5c330618  0.0s\n => => pushing layers                                             4.9s\n => => pushing manifest for ghcr.io/ana/api:1.0@sha256:36698c34bd021b6f683d3f5898572635dbd69873695ffc3d0913955e5c330618  1.1s',
    },
    'L5.5': {
      kind: 'type',
      prompt: 'Target both amd64 and arm64.',
      template: 'docker buildx build ___ `\n  -t ghcr.io/ana/api:1.0 --push .',
      accept: [
        '--platform linux/amd64,linux/arm64',
        '--platform linux/arm64,linux/amd64',
        '--platform=linux/amd64,linux/arm64',
        '--platform=linux/arm64,linux/amd64',
        '--platform linux/amd64 --platform linux/arm64',
        '--platform linux/arm64 --platform linux/amd64',
      ],
      hint: 'One flag, both os/arch values, a comma between.',
      explain: 'Both builds are pushed under ghcr.io/ana/api:1.0 as one manifest list, which tells each machine which image is its own.',
      output: ' => [linux/amd64 4/4] COPY . .                                    0.2s\n => [linux/arm64 4/4] COPY . .                                    0.2s\n => exporting to image                                            6.8s\n => => exporting manifest list sha256:36698c34bd021b6f683d3f5898572635dbd69873695ffc3d0913955e5c330618  0.0s\n => => pushing layers                                             4.9s\n => => pushing manifest for ghcr.io/ana/api:1.0@sha256:36698c34bd021b6f683d3f5898572635dbd69873695ffc3d0913955e5c330618  1.1s',
    },
    'L5.6': {
      kind: 'type',
      prompt: 'Name it api:1.0 under ana on ghcr.io.',
      template: 'docker buildx build --platform linux/amd64,linux/arm64 `\n  ___ --push .',
      accept: [
        '-t ghcr.io/ana/api:1.0',
        '--tag ghcr.io/ana/api:1.0',
        '-t=ghcr.io/ana/api:1.0',
        '--tag=ghcr.io/ana/api:1.0',
      ],
      hint: 'The tag flag, then host/account/repo:tag.',
      explain: '--push sends the image to the registry in its name. Without ghcr.io/ana/, it would try Docker Hub’s library namespace and be denied.',
      output: ' => [linux/amd64 4/4] COPY . .                                    0.2s\n => [linux/arm64 4/4] COPY . .                                    0.2s\n => exporting to image                                            6.8s\n => => exporting manifest list sha256:36698c34bd021b6f683d3f5898572635dbd69873695ffc3d0913955e5c330618  0.0s\n => => pushing layers                                             4.9s\n => => pushing manifest for ghcr.io/ana/api:1.0@sha256:36698c34bd021b6f683d3f5898572635dbd69873695ffc3d0913955e5c330618  1.1s',
    },
    'L5.7': {
      kind: 'fix',
      prompt: 'The build finishes, but nothing reaches ghcr.io. Fix it.',
      code: 'docker buildx build --platform linux/amd64,linux/arm64 `\n  -t ghcr.io/ana/api:1.0 [[--pull]] .',
      fix: '--push',
      options: ['--push', '--upload', '--publish'],
      hint: 'One letter off: you want to send, not fetch.',
      explain: '--pull only checks for newer base images. --push uploads every platform’s image under the tag when the build ends.',
      output: ' => [linux/amd64 4/4] COPY . .                                    0.2s\n => [linux/arm64 4/4] COPY . .                                    0.2s\n => exporting to image                                            6.8s\n => => exporting manifest list sha256:36698c34bd021b6f683d3f5898572635dbd69873695ffc3d0913955e5c330618  0.0s\n => => pushing layers                                             4.9s\n => => pushing manifest for ghcr.io/ana/api:1.0@sha256:36698c34bd021b6f683d3f5898572635dbd69873695ffc3d0913955e5c330618  1.1s',
    },
    'boss.8': {
      kind: 'fill',
      prompt: 'Type the flags: build for both CPUs and upload.',
      code: 'docker buildx build ___ linux/amd64,linux/arm64 `\n  -t ghcr.io/ana/notes:3.1 ___ .',
      blanks: [{ answer: ['--platform'] }, { answer: ['--push', '--output=type=registry'] }],
      hint: 'One flag picks the CPUs, the other sends the result.',
      explain: '--platform builds one image per entry, and --push uploads them together under ghcr.io/ana/notes:3.1.',
      output: ' => [linux/amd64 5/5] RUN dotnet publish -c Release -o /app     21.4s\n => [linux/arm64 5/5] RUN dotnet publish -c Release -o /app     48.9s\n => exporting to image                                            7.3s\n => => exporting manifest list sha256:d7b18506904d3215cbe93271eaddb57942b2a6477db596cc620ed259253152a8  0.0s\n => => pushing layers                                             5.2s\n => => pushing manifest for ghcr.io/ana/notes:3.1@sha256:d7b18506904d3215cbe93271eaddb57942b2a6477db596cc620ed259253152a8  1.2s',
    },
    'boss.9': {
      kind: 'fix',
      prompt: 'This build fails on its platform. Fix it.',
      code: 'docker buildx build --platform [[amd64/linux]],linux/arm64 `\n  -t ghcr.io/ana/notes:3.1 --push .',
      fix: 'linux/amd64',
      options: ['linux/amd64', 'linux-amd64', 'x86/linux'],
      hint: 'Compare it with the platform after the comma.',
      explain: 'Platforms are written os/arch, so the OS comes first: linux/amd64. amd64/linux asks for an OS called amd64.',
    },
  },
};

export default unit;
