import type { Unit } from '../../engine/types';

// Made-up but well-formed digests and commit, reused so related outputs agree.
const INDEX_142 = 'sha256:5755c0a05c71287651a3b75c7b34634ef247db304ca77db484e2e52f24f11c24';
const AMD64_142 = 'sha256:cdba383f6b2348bea698cff8b57893ac96eee5f3f8942763f031e0de9d2fdae5';
const ATTEST_142 = 'sha256:8d6853aed77d6cd003995c242d59700b7298abc1aa1451abe09f1de4063af195';
const MAIN_DIGEST = 'sha256:3e4311b190a161bb981a66a27ff41f670b9b985b770bd2be34d9b7e2a7113e37';

const LOGIN_OK = 'Logging into ghcr.io...\nLogin Succeeded!';

const META_MAIN = 'ghcr.io/ana/recipes:main\nghcr.io/ana/recipes:sha-67dd2ac';
const META_RELEASE = 'ghcr.io/ana/recipes:1.4.2\nghcr.io/ana/recipes:1.4\nghcr.io/ana/recipes:latest';

const PUSH_MAIN = ` => exporting to image                                            5.9s
 => => exporting manifest list ${MAIN_DIGEST}  0.0s
 => => pushing layers                                             3.7s
 => => pushing manifest for ghcr.io/ana/recipes:main@${MAIN_DIGEST}  0.9s`;

const TEST_FAIL = ` => ERROR [test 1/1] RUN dotnet test                              21.4s
------
 > [test 1/1] RUN dotnet test:
  Failed!  - Failed:     1, Passed:    41, Skipped:     0, Total:    42
------
ERROR: failed to build: failed to solve: process "/bin/sh -c dotnet test" did not complete successfully: exit code: 1`;

const IMAGETOOLS_142 = `Name:      ghcr.io/ana/recipes:1.4.2
MediaType: application/vnd.oci.image.index.v1+json
Digest:    ${INDEX_142}

Manifests:
  Name:        ghcr.io/ana/recipes:1.4.2@${AMD64_142}
  MediaType:   application/vnd.oci.image.manifest.v1+json
  Platform:    linux/amd64

  Name:        ghcr.io/ana/recipes:1.4.2@${ATTEST_142}
  MediaType:   application/vnd.oci.image.manifest.v1+json
  Platform:    unknown/unknown
  Annotations:
    vnd.docker.reference.digest: ${AMD64_142}
    vnd.docker.reference.type:   attestation-manifest`;

const SBOM_142 = `{
  "SPDX": {
    "spdxVersion": "SPDX-2.3",
    "name": "sbom",
    "packages": [
      { "name": "Microsoft.AspNetCore.App", "versionInfo": "10.0.0" },
      { "name": "openssl", "versionInfo": "3.0.13-0ubuntu3.5" },
      ...`;

const unit: Unit = {
  title: 'Docker in CI/CD',
  blurb: 'Let GitHub Actions build, test, tag, cache, attest and push your image on every commit.',
  lessons: [
    {
      title: 'Buildx & login',
      concept: {
        body: 'A workflow job starts on a fresh runner. docker/setup-buildx-action creates a BuildKit builder and docker/login-action signs in. For ghcr.io the run’s own GITHUB_TOKEN is the password, but the job needs permissions: packages: write to push.',
        code: 'permissions:\n  contents: read\n  packages: write\nsteps:\n  - uses: docker/setup-buildx-action@v4\n  - uses: docker/login-action@v4',
      },
      exercises: [
        {
          kind: 'fill',
          prompt: 'Set up a BuildKit builder on the runner.',
          code: 'steps:\n  - uses: docker/___@v4',
          blanks: [
            {
              answer: ['setup-buildx-action'],
              options: ['setup-buildx-action', 'setup-docker-action', 'buildkit-action'],
            },
          ],
          hint: 'Buildx is the CLI plugin that talks to BuildKit.',
          explain: 'setup-buildx-action starts a docker-container builder, which supports multi-platform builds, cache export and attestations.',
        },
        {
          kind: 'fill',
          prompt: 'Use the run’s built-in token as the password.',
          code: '  - uses: docker/login-action@v4\n    with:\n      registry: ghcr.io\n      username: ${{ github.actor }}\n      password: ___',
          blanks: [
            {
              answer: ['${{ secrets.GITHUB_TOKEN }}'],
              options: ['${{ secrets.GITHUB_TOKEN }}', '${{ github.actor }}', '${{ vars.GITHUB_TOKEN }}'],
            },
          ],
          hint: 'GitHub hands every run a secret token.',
          explain: 'GitHub creates GITHUB_TOKEN for each run and revokes it when the job ends, so there’s no personal token to store or rotate.',
          output: LOGIN_OK,
        },
        {
          kind: 'fill',
          prompt: 'Sign in as whoever triggered the run.',
          code: '  - uses: docker/login-action@v4\n    with:\n      registry: ghcr.io\n      username: ___\n      password: ${{ secrets.GITHUB_TOKEN }}',
          blanks: [
            {
              answer: ['${{ github.actor }}'],
              options: ['${{ github.actor }}', '${{ github.repository }}', '${{ secrets.USERNAME }}'],
            },
          ],
          hint: 'The user who pushed the commit or started the run.',
          explain: 'github.actor is that user’s login. ghcr.io checks the token, so the name only has to be a real account.',
          output: LOGIN_OK,
        },
        {
          kind: 'fill',
          prompt: 'Let the token push packages.',
          code: 'jobs:\n  publish:\n    runs-on: ubuntu-latest\n    permissions:\n      contents: read\n      packages: ___',
          blanks: [{ answer: ['write'], options: ['write', 'read', 'push'] }],
          hint: 'Pushing changes the package.',
          explain: 'Once a job lists permissions, everything it doesn’t list is none. contents: read lets it check out code, packages: write lets it push.',
        },
        {
          kind: 'build',
          prompt: 'Add the login step at its current major version.',
          answer: ['-', 'uses:', 'docker/login-action@v4'],
          distractors: ['run:', 'docker/login-action@latest'],
          hint: 'A step that uses an action, pinned to a major tag.',
          explain: '@v4 tracks the newest v4 release, so you get fixes but no breaking changes. Actions have no @latest tag.',
        },
        {
          kind: 'order',
          prompt: 'Give the publish job package write access.',
          lines: ['jobs:', '  publish:', '    permissions:', '      packages: write'],
          hint: 'Each line nests one level under the one before.',
          explain: 'permissions: on a job scopes GITHUB_TOKEN for that job only. You can also set it at the top of the workflow for every job.',
        },
        {
          kind: 'fill',
          prompt: 'The push is denied. Add the missing permission.',
          code: 'permissions:\n  contents: read\n  ___',
          blanks: [
            {
              answer: ['packages: write'],
              options: ['packages: write', 'contents: write', 'actions: write'],
            },
          ],
          hint: 'ghcr.io images are GitHub Packages.',
          explain: 'Login works with read access, but the push needs packages: write. contents: write would let the job push code, which it doesn’t need.',
          output: 'ERROR: failed to build: failed to solve: failed to push ghcr.io/ana/recipes:main: denied: permission_denied: write_package',
        },
      ],
    },
    {
      title: 'Build & push',
      concept: {
        body: 'docker/build-push-action runs docker buildx build for you. context: . builds the checked-out folder, tags: names the image and push: true uploads it. platforms: builds for several CPUs, with docker/setup-qemu-action emulating the ones the runner lacks.',
        code: '- uses: docker/build-push-action@v7\n  with:\n    context: .\n    platforms: linux/amd64,linux/arm64\n    push: true\n    tags: ghcr.io/ana/recipes:main',
      },
      exercises: [
        {
          kind: 'fill',
          prompt: 'Pick the action that builds and pushes.',
          code: '- uses: docker/___@v7\n  with:\n    push: true\n    tags: ghcr.io/ana/recipes:main',
          blanks: [
            { answer: ['build-push-action'], options: ['build-push-action', 'buildx-action', 'push-action'] },
          ],
          hint: 'It does both jobs, and its name says so.',
          explain: 'build-push-action wraps docker buildx build, so every buildx feature is an input: platforms, cache, target, attestations.',
          output: PUSH_MAIN,
        },
        {
          kind: 'fill',
          prompt: 'Upload the image when the build ends.',
          code: '- uses: docker/build-push-action@v7\n  with:\n    context: .\n    push: ___\n    tags: ghcr.io/ana/recipes:main',
          blanks: [{ answer: ['true'], options: ['true', 'false', 'always'] }],
          hint: 'It’s a yes/no input.',
          explain: 'push defaults to false, so without it the image is built and then thrown away when the runner shuts down.',
          output: PUSH_MAIN,
        },
        {
          kind: 'build',
          prompt: 'Build for Intel and ARM servers.',
          answer: ['platforms:', 'linux/amd64', ',', 'linux/arm64'],
          alt: [['platforms:', 'linux/arm64', ',', 'linux/amd64']],
          distractors: ['platform:', ';'],
          hint: 'The input is plural and takes a comma-separated list.',
          explain: 'Both builds go out under one tag as a manifest list, the same as --platform on docker buildx build.',
        },
        {
          kind: 'fill',
          prompt: 'Emulate ARM on the x64 runner.',
          code: 'steps:\n  - uses: docker/___@v4\n  - uses: docker/setup-buildx-action@v4',
          blanks: [
            { answer: ['setup-qemu-action'], options: ['setup-qemu-action', 'setup-arm-action', 'setup-buildx-action'] },
          ],
          hint: 'QEMU is the CPU emulator.',
          explain: 'setup-qemu-action registers QEMU so RUN steps for arm64 can execute on an amd64 runner. Put it before setup-buildx-action.',
        },
        {
          kind: 'fill',
          prompt: 'Build pull requests, but don’t push them.',
          code: "- uses: docker/build-push-action@v7\n  with:\n    push: ${{ github.event_name ___ 'pull_request' }}",
          blanks: [{ answer: ['!='], options: ['!=', '==', '='] }],
          hint: 'Push when the event is NOT a pull request.',
          explain: 'PRs still prove the image builds, but a fork’s PR shouldn’t publish anything, and its token can’t write packages anyway.',
        },
        {
          kind: 'build',
          prompt: 'Push the image under two tags.',
          answer: ['tags:', 'ghcr.io/ana/recipes:main', ',', 'ghcr.io/ana/recipes:67dd2ac'],
          alt: [['tags:', 'ghcr.io/ana/recipes:67dd2ac', ',', 'ghcr.io/ana/recipes:main']],
          distractors: [';', 'tag:'],
          hint: 'tags takes a comma-separated list, or one per line.',
          explain: 'Both tags point at the same digest. The push uploads layers once and adds each name.',
        },
        {
          kind: 'fill',
          prompt: 'An earlier step wrote a file. Build the checked-out folder.',
          code: '- uses: actions/checkout@v7\n- run: echo "${{ github.sha }}" > VERSION\n- uses: docker/build-push-action@v7\n  with:\n    context: ___\n    push: true',
          blanks: [{ answer: ['.'], options: ['.', '{{defaultContext}}', './Dockerfile'] }],
          hint: 'The current folder on the runner.',
          explain: 'With no context, the action builds straight from the Git commit and ignores files your steps changed, like VERSION. context: . uses the workspace.',
        },
      ],
    },
    {
      title: 'Tags from metadata',
      concept: {
        body: 'docker/metadata-action turns the Git event into tags. type=ref,event=branch gives main, type=semver,pattern={{version}} turns Git tag v1.4.2 into 1.4.2, and type=sha adds sha-67dd2ac. Pass steps.meta.outputs.tags to the build step.',
        code: '- id: meta\n  uses: docker/metadata-action@v6\n  with:\n    images: ghcr.io/ana/recipes\n    tags: |\n      type=ref,event=branch',
      },
      exercises: [
        {
          kind: 'build',
          prompt: 'Tag each push with its branch name.',
          answer: ['type=ref', ',', 'event=branch'],
          distractors: ['type=branch', 'event=push'],
          hint: 'The type is a Git ref; the event says which kind.',
          explain: 'A push to main tags the image main. The action replaces characters tags can’t hold, so feature/login becomes feature-login.',
          output: 'ghcr.io/ana/recipes:main',
        },
        {
          kind: 'fill',
          prompt: 'Type the type that tags the short commit hash.',
          code: 'tags: |\n  type=ref,event=branch\n  type=___',
          blanks: [{ answer: ['sha'] }],
          hint: 'Git names every commit with a hash.',
          explain: 'type=sha adds sha- plus 7 characters of the commit. That tag never moves, so it always means the same build.',
          output: META_MAIN,
        },
        {
          kind: 'fill',
          prompt: 'Git tag v1.4.2 is pushed. Fill in the tags.',
          code: 'tags: |\n  type=semver,pattern={{version}}\n  type=semver,pattern={{major}}.{{minor}}\n# pushes 1.4.2, ___ and latest',
          blanks: [{ answer: ['1.4'], options: ['1.4', 'v1.4', '1'] }],
          hint: 'The v is dropped, and the pattern keeps two numbers.',
          explain: 'semver tags strip the v. latest comes free: by default the action adds it for semver tags, so it follows the newest release.',
          output: META_RELEASE,
        },
        {
          kind: 'order',
          prompt: 'Generate the tags, then build with them.',
          lines: [
            '- id: meta',
            '  uses: docker/metadata-action@v6',
            '  with:',
            '    images: ghcr.io/ana/recipes',
            '- uses: docker/build-push-action@v7',
            '  with:',
            '    tags: ${{ steps.meta.outputs.tags }}',
          ],
          hint: 'A step can only read outputs of steps above it.',
          explain: 'id: meta names the step, and steps.meta.outputs.tags is its newline-separated tag list, ready for the build step.',
          output: META_MAIN,
        },
        {
          kind: 'build',
          prompt: 'Pass the generated labels to the build too.',
          answer: ['labels:', '${{', 'steps.meta.outputs.labels', '}}'],
          distractors: ['steps.meta.labels', 'tags:'],
          hint: 'Same shape as the tags line, different output.',
          explain: 'The labels include org.opencontainers.image.source and revision, so ghcr.io links the package to its repo and commit.',
        },
        {
          kind: 'fix',
          prompt: 'The build step gets no tags. Fix the reference.',
          code: '- id: meta\n  uses: docker/metadata-action@v6\n  with:\n    images: ghcr.io/ana/recipes\n- uses: docker/build-push-action@v7\n  with:\n    push: true\n    tags: ${{ steps.[[metadata]].outputs.tags }}',
          fix: 'meta',
          options: ['meta', 'build', 'docker'],
          hint: 'Steps are found by their id, not their action.',
          explain: 'steps.<id> needs the id: you gave. steps.metadata doesn’t exist, so the expression is empty and the push fails with no tag.',
          output: 'ERROR: failed to build: tag is needed when pushing to registry',
        },
        {
          kind: 'fill',
          prompt: 'The repo is Ana/Recipes. Type the account part.',
          code: 'images: ghcr.io/${{ github.repository }}\n# tags start ghcr.io/___/recipes',
          blanks: [{ answer: ['ana'] }],
          hint: 'Image names allow only some characters.',
          explain: 'Repository names must be lowercase, so metadata-action lowercases the image name for you. A plain docker build -t would reject Ana.',
          output: 'ghcr.io/ana/recipes:main\nghcr.io/ana/recipes:sha-67dd2ac',
        },
      ],
    },
    {
      title: 'Cache & test stages',
      concept: {
        body: 'A fresh runner has no layer cache. cache-from: type=gha and cache-to: type=gha,mode=max keep BuildKit’s cache in GitHub’s Actions cache between runs. target: test builds just the test stage, so failing tests stop the job before anything ships.',
        code: '- uses: docker/build-push-action@v7\n  with:\n    target: test\n    cache-from: type=gha\n    cache-to: type=gha,mode=max',
      },
      exercises: [
        {
          kind: 'fill',
          prompt: 'Read layers from GitHub’s Actions cache.',
          code: 'cache-from: type=___',
          blanks: [{ answer: ['gha'], options: ['gha', 'github', 'local'] }],
          hint: 'Three letters: GitHub Actions.',
          explain: 'The gha cache backend stores BuildKit layers in the same cache actions/cache uses, keyed per branch with fallback to the default branch.',
        },
        {
          kind: 'build',
          prompt: 'Save every stage’s layers to the cache.',
          answer: ['cache-to:', 'type=gha', ',', 'mode=max'],
          distractors: ['mode=min', 'cache-from:'],
          hint: 'Export to the same backend, at the bigger mode.',
          explain: 'mode=min, the default, only caches the final image’s layers. mode=max also keeps the build and test stages, which is where restore and compile live.',
        },
        {
          kind: 'fill',
          prompt: 'Type the input that stops at the test stage.',
          code: '- uses: docker/build-push-action@v7\n  with:\n    ___: test\n    cache-from: type=gha',
          blanks: [{ answer: ['target'] }],
          hint: 'Same word as the docker build flag.',
          explain: 'target: test is --target test. With push left false, the stage runs its tests and nothing is uploaded.',
        },
        {
          kind: 'order',
          prompt: 'Test first, then build and push the final image.',
          lines: [
            '- uses: docker/build-push-action@v7',
            '  with:',
            '    target: test',
            '- uses: docker/build-push-action@v7',
            '  with:',
            '    push: true',
          ],
          hint: 'The step without push comes first.',
          explain: 'Steps run in order and a failed step stops the job, so a red test means the push step never starts. Shared cache makes the second build quick.',
          output: TEST_FAIL,
        },
        {
          kind: 'fill',
          prompt: 'A test fails in the test step. What about the push?',
          code: '- uses: docker/build-push-action@v7\n  with: { target: test }\n- uses: docker/build-push-action@v7\n  with: { push: true }\n# the push step ___',
          blanks: [{ answer: ['is skipped'], options: ['is skipped', 'still runs', 'pushes the test image'] }],
          hint: 'RUN dotnet test exits with 1.',
          explain: 'The non-zero exit fails the build, the step fails, and later steps are skipped unless they say if: always().',
          output: TEST_FAIL,
        },
        {
          kind: 'build',
          prompt: 'Give the api image its own cache scope.',
          answer: ['cache-to:', 'type=gha', ',', 'scope=api', ',', 'mode=max'],
          alt: [['cache-to:', 'type=gha', ',', 'mode=max', ',', 'scope=api']],
          distractors: ['name=api', 'mode=min'],
          hint: 'An extra key=value names which cache to use.',
          explain: 'Every gha build shares one scope by default, so two images in one repo keep overwriting each other’s cache. Use the same scope in cache-from.',
        },
        {
          kind: 'fix',
          prompt: 'The cache is read but never saved. Fix the key.',
          code: '- uses: docker/build-push-action@v7\n  with:\n    cache-from: type=gha\n    [[cache-from]]: type=gha,mode=max',
          fix: 'cache-to',
          options: ['cache-to', 'cache-save', 'cache'],
          hint: 'One input imports, the other exports.',
          explain: 'cache-from imports and cache-to exports. Without cache-to, every run starts from an empty cache.',
        },
      ],
    },
    {
      title: 'Provenance & SBOM',
      concept: {
        body: 'Attestations are records pushed alongside the image. provenance: mode=max says how and from what it was built, and sbom: true lists every package inside it. docker buildx imagetools inspect shows them, so anyone can check what they’re running.',
        code: '- uses: docker/build-push-action@v7\n  with:\n    push: true\n    provenance: mode=max\n    sbom: true\n# docker buildx imagetools inspect ghcr.io/ana/recipes:1.4.2',
      },
      exercises: [
        {
          kind: 'fill',
          prompt: 'Attach a list of every package in the image.',
          code: '- uses: docker/build-push-action@v7\n  with:\n    push: true\n    sbom: ___',
          blanks: [{ answer: ['true'], options: ['true', 'max', 'spdx'] }],
          hint: 'It’s on or off.',
          explain: 'BuildKit scans the image and attaches an SPDX software bill of materials, which scanners like docker scout read.',
        },
        {
          kind: 'fill',
          prompt: 'Record the full build details.',
          code: 'provenance: mode=___',
          blanks: [{ answer: ['max'], options: ['max', 'min', 'full'] }],
          hint: 'The opposite of the smaller mode.',
          explain: 'mode=max adds the build args, the Dockerfile and every source to the provenance. mode=min keeps just the basics. Never pass secrets as build args.',
        },
        {
          kind: 'fill',
          prompt: 'Private repo, no provenance input. What gets attached?',
          code: '- uses: docker/build-push-action@v7\n  with:\n    push: true\n    tags: ${{ steps.meta.outputs.tags }}\n# attached: ___',
          blanks: [{ answer: ['min provenance'], options: ['min provenance', 'max provenance', 'nothing'] }],
          hint: 'The action adds some provenance on its own.',
          explain: 'build-push-action adds provenance by default: mode=max for public repos and mode=min for private ones. With load: true, none is added.',
        },
        {
          kind: 'build',
          prompt: 'Look at what was pushed as 1.4.2.',
          answer: ['docker', 'buildx', 'imagetools', 'inspect', 'ghcr.io/ana/recipes:1.4.2'],
          distractors: ['pull', 'manifest'],
          hint: 'buildx has a tool for images in a registry.',
          explain: 'The attestations sit in the index as an extra manifest with platform unknown/unknown, pointing at the image they describe.',
          output: IMAGETOOLS_142,
        },
        {
          kind: 'type',
          prompt: 'Print just the SBOM as JSON.',
          template: 'docker buildx imagetools inspect \\\n  ghcr.io/ana/recipes:1.4.2 ___',
          accept: [
            "--format '{{json .SBOM}}'",
            '--format "{{json .SBOM}}"',
            "--format='{{json .SBOM}}'",
            '--format="{{json .SBOM}}"',
          ],
          hint: 'A Go template with json and the SBOM field.',
          explain: '.SBOM and .Provenance are fields of the inspect result, just like the templates you used with docker inspect.',
          output: SBOM_142,
        },
        {
          kind: 'fill',
          prompt: 'Tag latest only on the default branch.',
          code: 'tags: |\n  type=ref,event=branch\n  type=raw,value=latest,enable={{___}}',
          blanks: [{ answer: ['is_default_branch'] }],
          hint: 'is_ plus the kind of branch main usually is.',
          explain: 'The expression is true only for pushes to the repo’s default branch, so feature branches never move latest.',
        },
        {
          kind: 'fix',
          prompt: 'Production must not change on its own. Fix the tag.',
          code: 'services:\n  recipes:\n    image: ghcr.io/ana/recipes:[[latest]]',
          fix: 'sha-67dd2ac',
          options: ['sha-67dd2ac', 'main', 'edge'],
          hint: 'Which tag is tied to one commit forever?',
          explain: 'latest and main move with every release or push. A sha- tag (or a digest) always means the same build, so prod changes only when you change it.',
        },
      ],
    },
  ],
  boss: [
    {
      kind: 'order',
      prompt: 'Emulate, set up the builder, sign in, tag, then build.',
      lines: [
        'steps:',
        '  - uses: docker/setup-qemu-action@v4',
        '  - uses: docker/setup-buildx-action@v4',
        '  - uses: docker/login-action@v4',
        '  - id: meta',
        '    uses: docker/metadata-action@v6',
        '  - uses: docker/build-push-action@v7',
      ],
      hint: 'Follow the prompt’s order.',
      explain: 'QEMU first so the builder sees the extra platforms, login before anything pushes, and meta before the step that reads its outputs.',
    },
    {
      kind: 'fix',
      prompt: 'Login works but the push is denied. Fix it.',
      code: 'permissions:\n  contents: read\n  packages: [[read]]',
      fix: 'write',
      options: ['write', 'none'],
      hint: 'Pulling and pushing need different rights.',
      explain: 'packages: read is enough for login and pulls. Pushing a new tag is a write.',
      output: 'ERROR: failed to build: failed to solve: failed to push ghcr.io/ana/recipes:main: denied: permission_denied: write_package',
    },
    {
      kind: 'type',
      prompt: 'Build for both amd64 and arm64.',
      template: '- uses: docker/build-push-action@v7\n  with:\n    ___\n    push: true',
      accept: ['platforms: linux/amd64,linux/arm64', 'platforms: linux/arm64,linux/amd64'],
      hint: 'The plural input, then os/arch pairs.',
      explain: 'Remember setup-qemu-action, or the arm64 RUN steps can’t execute on the amd64 runner.',
    },
    {
      kind: 'fill',
      prompt: 'Pushed to branch fix/login-bug. Type the tag.',
      code: 'tags: |\n  type=ref,event=branch\n# tag: ___',
      blanks: [{ answer: ['fix-login-bug'] }],
      hint: 'A tag can’t contain a slash.',
      explain: 'metadata-action replaces characters a tag can’t hold with -, so fix/login-bug becomes fix-login-bug.',
      output: 'ghcr.io/ana/recipes:fix-login-bug',
    },
    {
      kind: 'build',
      prompt: 'Sign in with the run’s own token.',
      answer: ['password:', '${{', 'secrets.GITHUB_TOKEN', '}}'],
      distractors: ['github.actor', 'vars.GITHUB_TOKEN'],
      hint: 'It’s a secret GitHub creates for you.',
      explain: 'GITHUB_TOKEN lives in the secrets context. vars holds plain configuration values, never tokens.',
      output: LOGIN_OK,
    },
    {
      kind: 'fill',
      prompt: 'A PR builds with load: true. Are attestations added?',
      code: "- uses: docker/build-push-action@v7\n  with:\n    load: true\n    push: ${{ github.event_name != 'pull_request' }}\n# attestations: ___",
      blanks: [{ answer: ['none'], options: ['none', 'provenance only', 'provenance and SBOM'] }],
      hint: 'The runner’s image store can’t hold them.',
      explain: 'load: true exports to the local Docker image store, which has no room for attestation manifests, so the action skips them.',
    },
    {
      kind: 'fill',
      prompt: 'Pull request #42 builds. Pick its tag.',
      code: 'tags: |\n  type=ref,event=pr\n# tag: ___',
      blanks: [{ answer: ['pr-42'], options: ['pr-42', '42', 'pull-42'] }],
      hint: 'A short prefix, then the number.',
      explain: 'event=pr tags pr-<number>. Handy with load: true to test the PR image, even when you don’t push it.',
      output: 'ghcr.io/ana/recipes:pr-42',
    },
    {
      kind: 'fix',
      prompt: 'Pull requests push and pushes don’t. Fix it.',
      code: "push: ${{ github.event_name [[==]] 'pull_request' }}",
      fix: '!=',
      options: ['!=', '='],
      hint: 'The test is upside down.',
      explain: 'push should be true for every event except pull_request, so compare with !=.',
    },
    {
      kind: 'fill',
      prompt: 'Type the cache backends and the export mode.',
      code: 'cache-from: type=___\ncache-to: type=___,mode=___',
      blanks: [{ answer: ['gha'] }, { answer: ['gha'] }, { answer: ['max'] }],
      hint: 'GitHub Actions cache both ways, keeping all stages.',
      explain: 'Read and write the same gha cache, and mode=max keeps the restore and test layers that make the next run fast.',
    },
    {
      kind: 'build',
      prompt: 'Also tag v1.4.2 as 1.4.',
      answer: ['type=semver', ',', 'pattern={{major}}.{{minor}}'],
      distractors: ['pattern={{version}}', 'type=ref'],
      hint: 'A semver tag that keeps two numbers.',
      explain: '1.4 moves to each new patch release, so users who want fixes but no surprises can pin it.',
      output: META_RELEASE,
    },
  ],
};

export default unit;
