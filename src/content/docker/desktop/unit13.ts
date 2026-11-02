import type { DesktopUnit } from '../../../engine/types';

// Desktop edition: write-the-code challenges for Docker unit 13 (Security hardening).
// lessons[i] runs after lesson i + 1. See docs/CONTENT_GUIDE.md.

/** Regex source: inside the YAML block `name`, some line starts with `line`. Any key order. Use flags 'm'. */
const inBlock = (name: string, line: string) =>
  `^([ \\t]*)${name}:[ \\t]*\\n(?:\\1[ \\t]+.*\\n|[ \\t]*\\n)*?\\1[ \\t]+${line}`;

/** Regex source: a YAML list item `item` under `key`, in either `key: [a, b]` or `- a` form. */
const listHas = (key: string, item: string) =>
  `${key}:\\s*(\\[[^\\]\\n]*["']?${item}["']?\\s*[,\\]]|\\n(?:[ \\t]+-.*\\n)*?[ \\t]+-[ \\t]*["']?${item}["']?[ \\t]*$)`;

const DIGEST = 'sha256:9a4c1e7f3b0d8e2a6c5f1b9d4e7a0c3f8b2d6e1a5c9f0b4d7e3a8c2f6b1d5e9a';

const unit: DesktopUnit = {
  lessons: [
    // L1 Non-root & read-only
    [
      {
        kind: 'write',
        prompt: 'Run acme/notes:1.2 as user 1000:1000, read-only, with a scratch /tmp. Check the user.',
        starter: '',
        solution: 'docker run -d --name notes --user 1000:1000 --read-only --tmpfs /tmp acme/notes:1.2\ndocker exec notes id',
        checks: [
          { label: 'Run as --user 1000:1000', re: 'run\\s[^\\n]*(--user|-u)[\\s=]+1000:1000\\b' },
          { label: 'Make the filesystem --read-only', re: 'run\\s[^\\n]*--read-only\\b' },
          { label: 'Add --tmpfs /tmp for scratch files', re: 'run\\s[^\\n]*--tmpfs[\\s=]+/tmp\\b' },
          { label: 'The image is acme/notes:1.2', re: 'run\\s[^\\n]*\\sacme/notes:1\\.2\\b' },
          { label: 'Check the user with docker exec … id', re: 'docker\\s+(container\\s+)?exec\\s+[\\w.-]+\\s+id\\s*$', flags: 'm' },
        ],
        hint: 'All three are docker run flags before the image. id prints the user the process runs as.',
        explain: '--user beats whatever USER the image sets, and --read-only blocks writes everywhere except the in-memory /tmp.',
        output: 'f2a7c4e9b1d6a3f8c0e5b2d9a4f7c1e6b3d8a0f5c2e9b6d1a4f8c3e7b0d5a2f9\nuid=1000 gid=1000 groups=1000',
      },
      {
        kind: 'write',
        prompt: 'Harden the reports service the same way, in Compose.',
        starter: 'services:\n  reports:\n    image: acme/reports:3.0\n    ports:\n      - "8080:8080"\n',
        solution:
          'services:\n  reports:\n    image: acme/reports:3.0\n    ports:\n      - "8080:8080"\n    user: "1000:1000"\n    read_only: true\n    tmpfs:\n      - /tmp',
        checks: [
          { label: 'user: "1000:1000"', re: inBlock('reports', 'user:[ \\t]*["\']?1000:1000["\']?[ \\t]*$'), flags: 'm' },
          { label: 'read_only: true', re: inBlock('reports', 'read_only:[ \\t]*true\\b'), flags: 'm' },
          { label: 'A tmpfs for /tmp', re: listHas('tmpfs', '/tmp') + '|tmpfs:[ \\t]*["\']?/tmp\\b', flags: 'm' },
        ],
        hint: 'The Compose keys are the flags with underscores: read_only, and tmpfs takes a list.',
        explain: 'Quoting "1000:1000" keeps YAML from reading it as something odd. read_only plus tmpfs is --read-only --tmpfs /tmp.',
      },
    ],
    // L2 Capabilities
    [
      {
        kind: 'write',
        prompt: 'Run acme/proxy:1.0 with only NET_BIND_SERVICE and no-new-privileges, then confirm.',
        starter: '',
        solution:
          "docker run -d --name proxy --cap-drop ALL --cap-add NET_BIND_SERVICE --security-opt no-new-privileges acme/proxy:1.0\ndocker inspect -f '{{.HostConfig.CapDrop}} {{.HostConfig.CapAdd}}' proxy",
        checks: [
          { label: 'Drop every capability with --cap-drop ALL', re: '--cap-drop[\\s=]+ALL\\b' },
          { label: 'Add back NET_BIND_SERVICE', re: '--cap-add[\\s=]+(CAP_)?NET_BIND_SERVICE\\b' },
          { label: 'Block setuid escalation with no-new-privileges', re: '--security-opt[\\s=]+["\']?no-new-privileges(:true)?\\b' },
          { label: 'Check {{.HostConfig.CapDrop}} with docker inspect', re: 'inspect[^\\n]*\\{\\{\\s*\\.HostConfig\\.CapDrop\\s*\\}\\}' },
        ],
        hint: 'Drop all first, then add back the one that lets a non-root process bind ports below 1024.',
        explain: 'An allow-list is safer than guessing what to drop. no-new-privileges stops setuid binaries from regaining what you removed.',
        output:
          '1c8e5a2f9d3b7e0a4c6f1d8b2e5a9c3f7d0b4e6a1c8f2d5b9e3a7c0f4d6b1e8a\n[ALL] [NET_BIND_SERVICE]',
      },
      {
        kind: 'write',
        prompt: 'In Compose, drop all capabilities from worker except CHOWN, and block new privileges.',
        starter: 'services:\n  worker:\n    image: acme/worker:2.3\n    user: "1000:1000"\n',
        solution:
          'services:\n  worker:\n    image: acme/worker:2.3\n    user: "1000:1000"\n    cap_drop:\n      - ALL\n    cap_add:\n      - CHOWN\n    security_opt:\n      - no-new-privileges:true',
        checks: [
          { label: 'cap_drop: ALL', re: listHas('cap_drop', 'ALL'), flags: 'm' },
          { label: 'cap_add: CHOWN', re: listHas('cap_add', '(CAP_)?CHOWN'), flags: 'm' },
          { label: 'security_opt: no-new-privileges:true', re: listHas('security_opt', 'no-new-privileges(:true)?'), flags: 'm' },
          { label: 'Don’t add any other capability', re: '^(?![\\s\\S]*cap_add:[^\\n]*\\[[^\\]]*,)(?![\\s\\S]*cap_add:\\s*\\n[ \\t]+-.*\\n[ \\t]+-)' },
        ],
        hint: 'cap_drop and cap_add take lists. security_opt takes a list too, written name:value.',
        explain: 'The Compose keys mirror --cap-drop, --cap-add and --security-opt. worker keeps only the right to change file owners.',
      },
    ],
    // L3 Risky flags
    [
      {
        kind: 'write',
        prompt: 'Start a throwaway Alpine sandbox that a fork bomb can’t hurt: 50 processes, no caps.',
        starter: '',
        solution: 'docker run --rm -it --pids-limit 50 --cap-drop ALL --read-only --user 1000:1000 alpine sh',
        checks: [
          { label: 'Cap processes with --pids-limit 50', re: 'run\\s[^\\n]*--pids-limit[\\s=]+50\\b' },
          { label: 'Drop all capabilities', re: 'run\\s[^\\n]*--cap-drop[\\s=]+ALL\\b' },
          { label: 'Clean up after with --rm', re: 'run\\s[^\\n]*--rm\\b' },
          { label: 'Never --privileged', not: '--privileged' },
          { label: 'Run alpine with a shell', re: 'run\\s[^\\n]*\\salpine(:\\S+)?\\s+(sh|ash|/bin/sh)\\s*$', flags: 'm' },
        ],
        hint: 'One flag caps the process count. -it gives you the interactive shell.',
        explain: 'With --pids-limit a fork bomb hits the cap and fails inside the container instead of filling the host’s process table.',
      },
      {
        kind: 'write',
        prompt: 'The netprobe service is root on your host. Replace the risky settings with narrow ones.',
        starter:
          'services:\n  netprobe:\n    image: acme/netprobe:1.0\n    privileged: true\n    volumes:\n      - /var/run/docker.sock:/var/run/docker.sock\n',
        solution:
          'services:\n  netprobe:\n    image: acme/netprobe:1.0\n    cap_drop:\n      - ALL\n    cap_add:\n      - NET_ADMIN\n      - NET_RAW\n    pids_limit: 100',
        checks: [
          { label: 'Remove privileged: true', not: 'privileged: true' },
          { label: 'Remove the docker.sock mount', not: 'docker.sock' },
          { label: 'Add back just NET_ADMIN', re: listHas('cap_add', '(CAP_)?NET_ADMIN'), flags: 'm' },
          { label: 'Cap processes with pids_limit: 100', re: inBlock('netprobe', 'pids_limit:[ \\t]*100\\b'), flags: 'm' },
          { label: 'Start from cap_drop: ALL', re: listHas('cap_drop', 'ALL'), flags: 'm' },
        ],
        hint: 'A network tool needs network capabilities, not the whole machine or the Docker API.',
        explain: 'privileged and the Docker socket each hand over the host. NET_ADMIN (and NET_RAW for ping) is all a probe needs.',
      },
    ],
    // L4 Pinning & scanning
    [
      {
        kind: 'write',
        prompt: 'Scan acme/shop:4.1: a summary first, then only critical and high CVEs.',
        starter: '',
        solution: 'docker scout quickview acme/shop:4.1\ndocker scout cves --only-severity critical,high acme/shop:4.1',
        checks: [
          { label: 'docker scout quickview acme/shop:4.1', re: 'docker\\s+scout\\s+(quickview|qv)\\s+acme/shop:4\\.1\\b' },
          { label: 'List CVEs with docker scout cves', re: 'docker\\s+scout\\s+cves\\s[^\\n]*acme/shop:4\\.1\\b' },
          { label: 'Only critical and high with --only-severity', re: '--only-severity[\\s=]+["\']?(critical,high|high,critical)\\b' },
        ],
        hint: 'quickview counts, cves lists. The severity filter takes a comma-separated list.',
        explain: 'quickview sums up the image and its base, and the filtered cves list shows what to fix first.',
        output:
          '    ✓ Image stored for indexing\n    ✓ Indexed 188 packages\n\n  Target     │  acme/shop:4.1      │    0C     1H     3M    12L\n    digest   │  5b8e1c4f7a2d       │\n  Base image │  node:22-bookworm   │    0C     1H     3M    11L\n    ✓ SBOM of image already cached, 188 packages indexed\n    ✗ Detected 1 vulnerable package with a total of 1 vulnerability\n\n   0C     1H     0M     0L  openssl 3.0.15-1~deb12u1',
      },
      {
        kind: 'write',
        prompt: 'Pin the runtime base to the digest in the comment, on the chiseled variant.',
        starter:
          `# imagetools inspect mcr.microsoft.com/dotnet/aspnet:10.0-noble-chiseled\n#   Digest: ${DIGEST}\nFROM mcr.microsoft.com/dotnet/sdk:10.0 AS build\nWORKDIR /src\nCOPY . .\nRUN dotnet publish -c Release -o /app/publish\n\nFROM mcr.microsoft.com/dotnet/aspnet:10.0\nWORKDIR /app\nCOPY --from=build /app/publish .\nENTRYPOINT ["dotnet", "Shop.dll"]`,
        solution:
          `# imagetools inspect mcr.microsoft.com/dotnet/aspnet:10.0-noble-chiseled\n#   Digest: ${DIGEST}\nFROM mcr.microsoft.com/dotnet/sdk:10.0 AS build\nWORKDIR /src\nCOPY . .\nRUN dotnet publish -c Release -o /app/publish\n\nFROM mcr.microsoft.com/dotnet/aspnet:10.0-noble-chiseled@${DIGEST}\nWORKDIR /app\nCOPY --from=build /app/publish .\nENTRYPOINT ["dotnet", "Shop.dll"]`,
        checks: [
          { label: 'Use the aspnet:10.0-noble-chiseled tag', re: '^\\s*FROM\\s+mcr\\.microsoft\\.com/dotnet/aspnet:10\\.0-noble-chiseled\\b', flags: 'm' },
          { label: 'Pin it with @ and the digest from the comment', re: `^\\s*FROM\\s+\\S+@${DIGEST}\\s*$`, flags: 'm' },
          { label: 'Keep the SDK build stage', re: '^\\s*FROM\\s+mcr\\.microsoft\\.com/dotnet/sdk:10\\.0\\S*\\s+AS\\s+build', flags: 'im' },
        ],
        hint: 'Write image:tag@sha256:…, with the tag kept so people can still read which version it is.',
        explain: 'The digest fixes the exact bytes, so rebuilds can’t pick up a changed base. The tag stays as a readable label.',
      },
    ],
    // L5 Secrets that don’t leak
    [
      {
        kind: 'write',
        prompt: 'Write a .dockerignore that keeps secrets and junk out of COPY . .',
        starter: '',
        solution: '.env\n.env.*\n**/*.pem\n**/*.key\n.git\nnode_modules',
        checks: [
          { label: 'Ignore .env', re: '^\\s*(\\*\\*/)?\\.env\\*?\\s*$', flags: 'm' },
          { label: 'Ignore private keys like *.pem', re: '^\\s*(\\*\\*/)?\\*\\.pem\\s*$', flags: 'm' },
          { label: 'Ignore the .git folder', re: '^\\s*(\\*\\*/)?\\.git/?\\s*$', flags: 'm' },
          { label: 'Ignore node_modules', re: '^\\s*(\\*\\*/)?node_modules/?\\s*$', flags: 'm' },
        ],
        hint: 'One pattern per line. **/ matches in any folder.',
        explain: 'Anything not ignored is sent to the builder and can end up in a layer. .git can hold old secrets in its history.',
      },
      {
        kind: 'write',
        prompt: 'This build bakes NPM_TOKEN into the image. Use a secret mount instead.',
        starter:
          'FROM node:22-alpine\nWORKDIR /app\nARG NPM_TOKEN\nENV NPM_TOKEN=$NPM_TOKEN\nCOPY . .\nRUN npm ci\nCMD ["node", "server.js"]\n# docker build --build-arg NPM_TOKEN=$env:NPM_TOKEN -t shop .',
        solution:
          'FROM node:22-alpine\nWORKDIR /app\nCOPY . .\nRUN --mount=type=secret,id=npm,env=NPM_TOKEN npm ci\nCMD ["node", "server.js"]\n# docker build --secret id=npm,env=NPM_TOKEN -t shop .',
        checks: [
          { label: 'No ARG NPM_TOKEN', not: 'ARG NPM_TOKEN' },
          { label: 'No ENV NPM_TOKEN', re: '^(?![\\s\\S]*(^|\\n)\\s*ENV\\s+NPM_TOKEN)' },
          { label: 'RUN --mount=type=secret with an id and env=NPM_TOKEN', re: 'RUN\\s+--mount=(?=[^\\s]*type=secret)(?=[^\\s]*id=\\w+)(?=[^\\s]*env=NPM_TOKEN)\\S+\\s+npm\\s+ci' },
          { label: 'Build with --secret id=…,env=NPM_TOKEN', re: 'docker\\s+(buildx\\s+)?build\\s[^\\n]*--secret[\\s=]+(?=\\S*id=\\w+)(?=\\S*env=NPM_TOKEN)' },
          { label: 'No --build-arg for the token', not: '--build-arg' },
        ],
        hint: 'The mount exists only for that one RUN. The id links it to --secret on the build command.',
        explain: 'ARG and ENV are saved in the image, where docker history and inspect show them. A secret mount is never written to a layer.',
      },
    ],
  ],
  // Windows PowerShell versions of shared items (the phone keeps the bash ones).
  overrides: {
    'boss.8': {
      kind: 'fill',
      prompt: 'A critical CVE is found. What does echo print?',
      code: 'docker scout cves --exit-code --only-severity critical acme/api:3.1\necho $LASTEXITCODE\n# prints ___',
      blanks: [{ answer: ['2'], options: ['2', '0', '137'] }],
      hint: 'Not success, and not a crash.',
      explain: 'With --exit-code, scout returns 2 when it finds vulnerabilities, which fails the CI step. In PowerShell, $LASTEXITCODE holds the last program’s exit code; $? is only True or False.',
    },
  },
};

export default unit;
