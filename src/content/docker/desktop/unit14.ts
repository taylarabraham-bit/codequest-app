import type { DesktopUnit } from '../../../engine/types';

// Desktop edition: write-the-code challenges for Docker unit 14 (Docker in CI/CD).
// lessons[i] runs after lesson i + 1. See docs/CONTENT_GUIDE.md.

/** Regex source: a step using docker/<action> at any major version. */
const uses = (action: string) => `uses:\\s*["']?docker/${action}@v\\d+`;

/** Regex source for a GitHub expression like ${{ secrets.X }}, spaces optional. */
const expr = (inner: string) => `\\$\\{\\{\\s*${inner}\\s*\\}\\}`;

const JOB_HEAD =
  'name: image\non:\n  push:\n    branches: [main]\njobs:\n  build:\n    runs-on: ubuntu-latest\n';

const LOGIN_STEPS =
  '    permissions:\n      contents: read\n      packages: write\n    steps:\n      - uses: actions/checkout@v7\n      - uses: docker/setup-buildx-action@v4\n      - uses: docker/login-action@v4\n        with:\n          registry: ghcr.io\n          username: ${{ github.actor }}\n          password: ${{ secrets.GITHUB_TOKEN }}\n';

const unit: DesktopUnit = {
  lessons: [
    // L1 Buildx & login
    [
      {
        kind: 'write',
        prompt: 'Give the job push rights to packages, then set up Buildx and log in to ghcr.io.',
        starter: JOB_HEAD,
        solution: JOB_HEAD + LOGIN_STEPS.trimEnd(),
        checks: [
          { label: 'permissions: with packages: write', re: 'permissions:\\s*\\n(?:[ \\t]+.*\\n)*?[ \\t]+packages:[ \\t]*write\\b' },
          { label: 'A docker/setup-buildx-action step', re: uses('setup-buildx-action') },
          { label: 'A docker/login-action step with registry: ghcr.io', re: `${uses('login-action')}[\\s\\S]*?registry:\\s*["']?ghcr\\.io\\b` },
          { label: 'username: ${{ github.actor }}', re: `username:\\s*${expr('github\\.actor')}` },
          { label: 'password: ${{ secrets.GITHUB_TOKEN }}', re: `password:\\s*${expr('(secrets\\.GITHUB_TOKEN|github\\.token)')}` },
        ],
        hint: 'permissions sits on the job, next to runs-on. login-action takes registry, username and password under with:.',
        explain: 'GITHUB_TOKEN is created for each run, so there is no secret to store. It can only push because the job asks for packages: write.',
      },
      {
        kind: 'write',
        prompt: 'Log in to Docker Hub with repository secrets, not a pasted token.',
        starter:
          '    steps:\n      - uses: actions/checkout@v7\n      - uses: docker/setup-buildx-action@v4\n      - uses: docker/login-action@v4\n        with:\n          registry: ghcr.io\n          username: ana\n          password: dckr_pat_4fQ9xLmT2vRk8sWb\n',
        solution:
          '    steps:\n      - uses: actions/checkout@v7\n      - uses: docker/setup-buildx-action@v4\n      - uses: docker/login-action@v4\n        with:\n          username: ${{ vars.DOCKERHUB_USERNAME }}\n          password: ${{ secrets.DOCKERHUB_TOKEN }}',
        checks: [
          { label: 'Delete the pasted dckr_pat_ token', not: 'dckr_pat_' },
          { label: 'password: from ${{ secrets.… }}', re: `password:\\s*${expr('secrets\\.\\w+')}` },
          { label: 'username: from ${{ vars.… }} or ${{ secrets.… }}', re: `username:\\s*${expr('(vars|secrets)\\.\\w+')}` },
          { label: 'Drop registry: ghcr.io (Docker Hub is the default)', re: '^(?![\\s\\S]*registry:\\s*["\']?ghcr\\.io)' },
        ],
        hint: 'With no registry:, login-action signs in to Docker Hub. Secrets are read with ${{ secrets.NAME }}.',
        explain: 'A token in the workflow file is readable by anyone with the repo. Repository secrets are masked in logs and never stored in Git.',
      },
    ],
    // L2 Build & push
    [
      {
        kind: 'write',
        prompt: 'Add a step that builds this folder and pushes it as ghcr.io/ana/quiz:main.',
        starter: '    steps:\n      - uses: actions/checkout@v7\n      - uses: docker/setup-buildx-action@v4\n      - uses: docker/login-action@v4\n',
        solution:
          '    steps:\n      - uses: actions/checkout@v7\n      - uses: docker/setup-buildx-action@v4\n      - uses: docker/login-action@v4\n      - uses: docker/build-push-action@v7\n        with:\n          context: .\n          push: true\n          tags: ghcr.io/ana/quiz:main',
        checks: [
          { label: 'A docker/build-push-action step after login', re: `login-action[\\s\\S]*${uses('build-push-action')}` },
          { label: 'context: .', re: 'context:\\s*["\']?\\.(/)?["\']?\\s*$', flags: 'm' },
          { label: 'push: true', re: 'push:\\s*true\\b' },
          { label: 'tags: ghcr.io/ana/quiz:main', re: 'tags:\\s*(\\|\\s*)?["\']?ghcr\\.io/ana/quiz:main\\b' },
        ],
        hint: 'The settings go under with:, indented below the uses: line.',
        explain: 'build-push-action runs docker buildx build with these inputs. Without push: true the image stays in the builder’s cache.',
      },
      {
        kind: 'write',
        prompt: 'Make this build push one tag for both amd64 and arm64.',
        starter:
          '    steps:\n      - uses: actions/checkout@v7\n      - uses: docker/setup-buildx-action@v4\n      - uses: docker/login-action@v4\n        with:\n          registry: ghcr.io\n          username: ${{ github.actor }}\n          password: ${{ secrets.GITHUB_TOKEN }}\n      - uses: docker/build-push-action@v7\n        with:\n          context: .\n          push: true\n          tags: ghcr.io/ana/quiz:main\n',
        solution:
          '    steps:\n      - uses: actions/checkout@v7\n      - uses: docker/setup-qemu-action@v4\n      - uses: docker/setup-buildx-action@v4\n      - uses: docker/login-action@v4\n        with:\n          registry: ghcr.io\n          username: ${{ github.actor }}\n          password: ${{ secrets.GITHUB_TOKEN }}\n      - uses: docker/build-push-action@v7\n        with:\n          context: .\n          platforms: linux/amd64,linux/arm64\n          push: true\n          tags: ghcr.io/ana/quiz:main',
        checks: [
          { label: 'A docker/setup-qemu-action step before the build', re: `${uses('setup-qemu-action')}[\\s\\S]*build-push-action` },
          { label: 'platforms: lists linux/amd64', re: 'platforms:[^\\n]*\\blinux/amd64\\b' },
          { label: 'and linux/arm64', re: 'platforms:[^\\n]*\\blinux/arm64\\b' },
          { label: 'Keep Buildx, which builds multi-platform images', re: uses('setup-buildx-action') },
        ],
        hint: 'QEMU emulates the CPU the runner lacks. platforms takes a comma-separated list.',
        explain: 'Buildx builds once per platform and pushes an image index, so one tag serves Intel and ARM machines alike.',
      },
    ],
    // L3 Tags from metadata
    [
      {
        kind: 'write',
        prompt: 'Write a metadata step for ghcr.io/ana/quiz with branch and sha tags.',
        starter: '',
        solution:
          '- id: meta\n  uses: docker/metadata-action@v6\n  with:\n    images: ghcr.io/ana/quiz\n    tags: |\n      type=ref,event=branch\n      type=sha',
        checks: [
          { label: 'A docker/metadata-action step', re: uses('metadata-action') },
          { label: 'Give it id: meta', re: 'id:\\s*["\']?meta["\']?\\s*$', flags: 'm' },
          { label: 'images: ghcr.io/ana/quiz', re: 'images:\\s*(\\|\\s*)?["\']?ghcr\\.io/ana/quiz\\b' },
          { label: 'A type=ref,event=branch tag', re: 'type=ref,\\s*event=branch' },
          { label: 'A type=sha tag', re: 'type=sha\\b' },
        ],
        hint: 'tags: | starts a multi-line block, one rule per line.',
        explain: 'A push to main now yields :main and :sha-<short commit>, and the id lets later steps read steps.meta.outputs.',
        output: 'ghcr.io/ana/quiz:main\nghcr.io/ana/quiz:sha-4c81e2f',
      },
      {
        kind: 'write',
        prompt: 'Tag releases from Git tags like v2.3.1: add metadata and use its outputs.',
        starter:
          "on:\n  push:\n    tags: ['v*']\njobs:\n  release:\n    runs-on: ubuntu-latest\n    steps:\n      - uses: actions/checkout@v7\n      - uses: docker/setup-buildx-action@v4\n      - uses: docker/build-push-action@v7\n        with:\n          push: true\n          tags: ghcr.io/ana/quiz:latest\n",
        solution:
          "on:\n  push:\n    tags: ['v*']\njobs:\n  release:\n    runs-on: ubuntu-latest\n    steps:\n      - uses: actions/checkout@v7\n      - uses: docker/setup-buildx-action@v4\n      - id: meta\n        uses: docker/metadata-action@v6\n        with:\n          images: ghcr.io/ana/quiz\n          tags: |\n            type=semver,pattern={{version}}\n            type=semver,pattern={{major}}.{{minor}}\n      - uses: docker/build-push-action@v7\n        with:\n          push: true\n          tags: ${{ steps.meta.outputs.tags }}\n          labels: ${{ steps.meta.outputs.labels }}",
        checks: [
          { label: 'A metadata-action step with id: meta, before the build', re: `(id:\\s*meta\\s*\\n\\s*${uses('metadata-action')}|${uses('metadata-action')}\\s*\\n\\s*id:\\s*meta\\b)[\\s\\S]*build-push-action` },
          { label: 'type=semver,pattern={{version}}', re: 'type=semver,\\s*pattern=\\{\\{\\s*version\\s*\\}\\}' },
          { label: 'type=semver,pattern={{major}}.{{minor}}', re: 'type=semver,\\s*pattern=\\{\\{\\s*major\\s*\\}\\}\\.\\{\\{\\s*minor\\s*\\}\\}' },
          { label: 'tags: ${{ steps.meta.outputs.tags }}', re: `tags:\\s*${expr('steps\\.meta\\.outputs\\.tags')}` },
          { label: 'labels: ${{ steps.meta.outputs.labels }}', re: `labels:\\s*${expr('steps\\.meta\\.outputs\\.labels')}` },
          { label: 'No hand-written :latest tag', not: 'quiz:latest' },
        ],
        hint: 'The build step reads the metadata step through steps.<id>.outputs.',
        explain: 'Tag v2.3.1 becomes :2.3.1 and :2.3, and semver tags also move :latest for you on a full release.',
        output: 'ghcr.io/ana/quiz:2.3.1\nghcr.io/ana/quiz:2.3\nghcr.io/ana/quiz:latest',
      },
    ],
    // L4 Cache & test stages
    [
      {
        kind: 'write',
        prompt: 'Write a step that builds only the test stage, using the Actions cache.',
        starter: '',
        solution:
          '- uses: docker/build-push-action@v7\n  with:\n    context: .\n    target: test\n    cache-from: type=gha\n    cache-to: type=gha,mode=max',
        checks: [
          { label: 'A docker/build-push-action step', re: uses('build-push-action') },
          { label: 'target: test', re: 'target:\\s*["\']?test["\']?\\s*$', flags: 'm' },
          { label: 'cache-from: type=gha', re: 'cache-from:\\s*["\']?type=gha\\b' },
          { label: 'cache-to: type=gha with mode=max', re: 'cache-to:\\s*["\']?type=gha\\b[^\\n]*mode=max' },
          { label: 'Don’t push a test build', re: '^(?![\\s\\S]*push:\\s*true)' },
        ],
        hint: 'target picks a stage by its AS name. Read and write the same cache type.',
        explain: 'If dotnet test fails in the test stage, the step fails and nothing ships. mode=max also caches the stages before it.',
      },
      {
        kind: 'write',
        prompt: 'Run the tests first, then build and push, both sharing one cache.',
        starter:
          '      - uses: docker/build-push-action@v7\n        with:\n          context: .\n          push: true\n          tags: ghcr.io/ana/quiz:main\n',
        solution:
          '      - uses: docker/build-push-action@v7\n        with:\n          context: .\n          target: test\n          cache-from: type=gha\n          cache-to: type=gha,mode=max\n      - uses: docker/build-push-action@v7\n        with:\n          context: .\n          push: true\n          tags: ghcr.io/ana/quiz:main\n          cache-from: type=gha\n          cache-to: type=gha,mode=max',
        checks: [
          { label: 'Two docker/build-push-action steps', re: `(${uses('build-push-action')}[\\s\\S]*){2}` },
          { label: 'The first one has target: test', re: `${uses('build-push-action')}(?:(?!build-push-action)[\\s\\S])*target:\\s*test\\b(?:(?!build-push-action)[\\s\\S])*${uses('build-push-action')}` },
          { label: 'The second one pushes', re: `${uses('build-push-action')}[\\s\\S]*${uses('build-push-action')}(?:(?!build-push-action)[\\s\\S])*push:\\s*true` },
          { label: 'Both read cache-from: type=gha', re: '(cache-from:\\s*["\']?type=gha[\\s\\S]*){2}' },
          { label: 'cache-to: type=gha,mode=max', re: 'cache-to:\\s*["\']?type=gha\\b[^\\n]*mode=max' },
        ],
        hint: 'Copy the step, give the first one a target and no push. Steps run top to bottom.',
        explain: 'The test build fills the cache, so the push build reuses its restore and compile layers instead of redoing them.',
      },
    ],
    // L5 Provenance & SBOM
    [
      {
        kind: 'write',
        prompt: 'Write a push step for ghcr.io/ana/quiz:2.0 that attaches full provenance and an SBOM.',
        starter: '',
        solution:
          '- uses: docker/build-push-action@v7\n  with:\n    context: .\n    push: true\n    tags: ghcr.io/ana/quiz:2.0\n    provenance: mode=max\n    sbom: true',
        checks: [
          { label: 'A docker/build-push-action step', re: uses('build-push-action') },
          { label: 'push: true with tag ghcr.io/ana/quiz:2.0', re: '(?=[\\s\\S]*push:\\s*true)[\\s\\S]*tags:\\s*["\']?ghcr\\.io/ana/quiz:2\\.0\\b' },
          { label: 'provenance: mode=max', re: 'provenance:\\s*["\']?mode=max\\b' },
          { label: 'sbom: true', re: 'sbom:\\s*true\\b' },
        ],
        hint: 'Both are inputs under with:. Provenance takes a mode; the SBOM is on or off.',
        explain: 'The attestations are pushed beside the image in the same index, so anyone pulling it can see how it was built and what’s inside.',
      },
      {
        kind: 'write',
        prompt: 'Check the pushed image: its index, then its SBOM and provenance as JSON.',
        starter: '',
        solution:
          "docker buildx imagetools inspect ghcr.io/ana/quiz:2.0\ndocker buildx imagetools inspect ghcr.io/ana/quiz:2.0 --format '{{json .SBOM}}'\ndocker buildx imagetools inspect ghcr.io/ana/quiz:2.0 --format '{{json .Provenance}}'",
        checks: [
          { label: 'docker buildx imagetools inspect ghcr.io/ana/quiz:2.0', re: 'docker\\s+buildx\\s+imagetools\\s+inspect\\s+[^\\n]*ghcr\\.io/ana/quiz:2\\.0' },
          { label: "--format '{{json .SBOM}}'", re: '--format[\\s=]+["\']\\{\\{\\s*json\\s+\\.SBOM\\s*\\}\\}["\']' },
          { label: "--format '{{json .Provenance}}'", re: '--format[\\s=]+["\']\\{\\{\\s*json\\s+\\.Provenance\\s*\\}\\}["\']' },
        ],
        hint: 'Same command three times. The template fields are .SBOM and .Provenance.',
        explain: 'Plain inspect lists the image manifest plus an attestation manifest. The templates pull the SBOM and provenance out of it.',
        output:
          'Name:      ghcr.io/ana/quiz:2.0\nMediaType: application/vnd.oci.image.index.v1+json\nDigest:    sha256:2b9e4f7a1c3d8e6b0a5f9c2d7e1b4a8f3c6d0e9b5a2f7c1d4e8b3a6f0c9d2e5b\n\nManifests:\n  Name:        ghcr.io/ana/quiz:2.0@sha256:7d1a4e8c2f6b9d3a0e5c1f7b4d8a2e6c9f3b0d5a7e1c4f8b2d6a9e3c0f5b7d1a\n  MediaType:   application/vnd.oci.image.manifest.v1+json\n  Platform:    linux/amd64\n\n  Name:        ghcr.io/ana/quiz:2.0@sha256:e3c8a1f5d9b2e7c4a0f6d1b8e5c2a9f4d7b0e3c6a1f8d5b2e9c4a7f0d3b6e1c8\n  MediaType:   application/vnd.oci.image.manifest.v1+json\n  Platform:    unknown/unknown\n  Annotations:\n    vnd.docker.reference.digest: sha256:7d1a4e8c2f6b9d3a0e5c1f7b4d8a2e6c9f3b0d5a7e1c4f8b2d6a9e3c0f5b7d1a\n    vnd.docker.reference.type:   attestation-manifest\n{"SPDX": {"spdxVersion": "SPDX-2.3", "name": "sbom", …}}\n{"SLSA": {…}}',
      },
    ],
  ],
  // Windows PowerShell versions of shared items (the phone keeps the bash ones).
  overrides: {
    'L5.5': {
      kind: 'type',
      prompt: 'Print just the SBOM as JSON.',
      template: 'docker buildx imagetools inspect `\n  ghcr.io/ana/recipes:1.4.2 ___',
      accept: [
        '--format \'{{json .SBOM}}\'',
        '--format "{{json .SBOM}}"',
        '--format=\'{{json .SBOM}}\'',
        '--format="{{json .SBOM}}"',
      ],
      hint: 'A Go template with json and the SBOM field.',
      explain: '.SBOM and .Provenance are fields of the inspect result, just like the templates you used with docker inspect.',
      output: '{\n  "SPDX": {\n    "spdxVersion": "SPDX-2.3",\n    "name": "sbom",\n    "packages": [\n      { "name": "Microsoft.AspNetCore.App", "versionInfo": "10.0.0" },\n      { "name": "openssl", "versionInfo": "3.0.13-0ubuntu3.5" },\n      ...',
    },
  },
};

export default unit;
