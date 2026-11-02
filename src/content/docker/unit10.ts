import type { Unit } from '../../engine/types';

// Made-up but well-formed digests, reused so related outputs agree.
const QUIZ_14 = 'sha256:b37653cb83324bbc781135d8209e53f6cae07f1f8fd8358331d825f3cd403d7f';
const QUIZ_15 = 'sha256:b666e989a73b0940f7542e8a99d0a4178831de45e025dc6bb114ae79a0600b68';
const QUIZ_16 = 'sha256:52004f66c2e4b13004cc0999edbb4d738e0ad5ab3c0e8af0fe2bfe06d6237882';
const BOT_MON = 'sha256:acceab201bf02c916796d473bc93678982baeaade89413ce442940fae01fed27';
const BOT_TUE = 'sha256:95ec56906ecdd77c2b0811fd6b5844c7836d2b123b7397f5396c1f272f1f4577';
const NGINX = 'sha256:49a396810e7db38036573840d997ded961509157d6366921c81e9ec66d9a499e';
const RUBY = 'sha256:91e18cf182a899267b8974c0fc0049775b3c2e6d30bd09463f92202e4f75d8f5';
const PYTHON = 'sha256:872969023ee8ba9c49be62fd25a87b5a73d0953b4257fce56b81f48ad310aa9a';
const API_10 = 'sha256:36698c34bd021b6f683d3f5898572635dbd69873695ffc3d0913955e5c330618';
const NOTES_30 = 'sha256:ab05285fd67ef25eb71c9fb5054823ea70ab6c2783179a1ea4739e9ad54672b2';
const NOTES_31 = 'sha256:3e082a3911678b26938c6ff0ee12526bc24c92f414cc94ce4ebe93aa13711cc0';
const NOTES_MP = 'sha256:d7b18506904d3215cbe93271eaddb57942b2a6477db596cc620ed259253152a8';

const LOGIN_OK = 'Login Succeeded';

const PUSH_QUIZ_14 = `The push refers to repository [ghcr.io/ana/quiz]
3108e2d3171e: Pushed
e0e1707308fe: Pushed
7d36faf77fbd: Pushed
1.4: digest: ${QUIZ_14} size: 856`;

const PUSH_QUIZ_15 = `The push refers to repository [ghcr.io/ana/quiz]
b362529711af: Pushed
e0e1707308fe: Layer already exists
7d36faf77fbd: Layer already exists
1.5: digest: ${QUIZ_15} size: 856`;

const PUSH_NOTES_31 = `The push refers to repository [ghcr.io/ana/notes]
d6c8d0c8a734: Pushed
0a4bdb51d0c5: Pushed
16938dc68883: Layer already exists
3.1: digest: ${NOTES_31} size: 1048`;

const BUILDX_PUSH_API = ` => [linux/amd64 4/4] COPY . .                                    0.2s
 => [linux/arm64 4/4] COPY . .                                    0.2s
 => exporting to image                                            6.8s
 => => exporting manifest list ${API_10}  0.0s
 => => pushing layers                                             4.9s
 => => pushing manifest for ghcr.io/ana/api:1.0@${API_10}  1.1s`;

const DIGESTS_QUIZ = `REPOSITORY         TAG      DIGEST                                                                    IMAGE ID       CREATED       SIZE
ghcr.io/ana/quiz   1.5      ${QUIZ_15}   b666e989a73b   2 hours ago   187MB
ghcr.io/ana/quiz   1.4      ${QUIZ_14}   b37653cb8332   3 days ago    186MB
ghcr.io/ana/quiz   latest   ${QUIZ_14}   b37653cb8332   3 days ago    186MB`;

const unit: Unit = {
  title: 'Registries & publishing',
  blurb: 'Log in, name, push, pin and publish multi-platform images to a registry.',
  lessons: [
    {
      title: 'Logging in',
      concept: {
        body: 'docker login with no server signs you in to Docker Hub, the default registry. For another registry, name its host and pipe an access token in with --password-stdin, which also needs -u. docker logout removes a saved login.',
        code: 'docker login\necho "$CR_PAT" | docker login ghcr.io -u ana --password-stdin\ndocker logout ghcr.io',
      },
      exercises: [
        {
          kind: 'fill',
          prompt: 'Sign in to Docker Hub.',
          code: 'docker ___',
          blanks: [{ answer: ['login'], options: ['login', 'signin', 'auth'] }],
          hint: 'You log ___ to a website. One word.',
          explain: 'docker login with no server uses Docker Hub. Without -u it signs you in through your browser with a one-time code.',
          output:
            "i Info → Using web-based login. To sign in with credentials on the command line, use 'docker login -u <username>'\n\nYour one-time device confirmation code is: KVRD-TQXM\nOpen this URL to authenticate: https://login.docker.com/activate?user_code=KVRD-TQXM\n\nPress ENTER to open the URL in your browser, or Ctrl+C to cancel.\n\nLogin Succeeded",
        },
        {
          kind: 'fill',
          prompt: 'No server given. Where does this sign in?',
          code: 'docker login\n# signs in to ___',
          blanks: [{ answer: ['Docker Hub'], options: ['Docker Hub', 'ghcr.io', 'every registry'] }],
          hint: 'Where does docker pull nginx download from?',
          explain: 'Docker Hub is the default registry, so leaving the server out means Docker Hub. Every other registry needs its own login.',
        },
        {
          kind: 'fill',
          prompt: 'Sign in to GitHub’s container registry.',
          code: 'docker login ___ -u ana',
          blanks: [{ answer: ['ghcr.io'], options: ['ghcr.io', 'github.com', 'docker.io'] }],
          hint: 'GitHub Container Registry, shortened, plus .io.',
          explain: 'docker login takes the registry’s host name. GitHub’s registry lives at ghcr.io, not github.com, and docker.io is Docker Hub.',
          output: 'Password:\nLogin Succeeded',
        },
        {
          kind: 'build',
          prompt: 'Sign in to Docker Hub as ana with a password prompt.',
          answer: ['docker', 'login', '-u', 'ana'],
          distractors: ['--name', '-p'],
          hint: 'A one-letter flag for the username.',
          explain: 'With -u, docker login skips the browser and asks for a password. A Docker Hub personal access token works there too and is safer.',
        },
        {
          kind: 'fill',
          prompt: 'The token comes from stdin. Add the username flag.',
          code: 'echo "$CR_PAT" | docker login ghcr.io ___ ana --password-stdin',
          blanks: [{ answer: ['-u'], options: ['-u', '-p', '--name'] }],
          hint: '--password-stdin still needs to know who you are.',
          explain: '--password-stdin reads the token from the pipe but only works with -u. -p sets a password, which clashes with --password-stdin.',
          output: LOGIN_OK,
        },
        {
          kind: 'build',
          prompt: 'After echo "$CR_PAT" |, sign in to ghcr.io as ana.',
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
          output: LOGIN_OK,
        },
        {
          kind: 'fill',
          prompt: 'Sign out of ghcr.io.',
          code: 'docker ___ ghcr.io',
          blanks: [{ answer: ['logout'], options: ['logout', 'logoff', 'rm'] }],
          hint: 'The opposite of login.',
          explain: 'docker logout deletes the saved credentials for that host. With no host, it signs you out of Docker Hub.',
          output: 'Removing login credentials for ghcr.io',
        },
      ],
    },
    {
      title: 'Registry names',
      concept: {
        body: 'A full image name is registry/namespace/repo:tag. The first part is a registry host only if it has a dot or a colon, or is localhost. Anything else is on Docker Hub: ana/api means docker.io/ana/api, and official images like nginx live in docker.io/library.',
        code: 'ghcr.io/ana/api:1.0   # on ghcr.io\nlocalhost:5000/api    # registry on your machine\nana/api               # docker.io/ana/api\nnginx                 # docker.io/library/nginx',
      },
      exercises: [
        {
          kind: 'fill',
          prompt: 'Pick the registry host.',
          code: 'docker pull ghcr.io/ana/shop:2.0\n# registry: ___',
          blanks: [{ answer: ['ghcr.io'], options: ['ghcr.io', 'ana', 'shop'] }],
          hint: 'It’s the part before the first slash.',
          explain: 'ghcr.io has a dot, so Docker treats it as a host. ana is the account and shop the repository.',
          output:
            '2.0: Pulling from ana/shop\n3f66949c90b2: Pull complete\nf8c1c5333744: Pull complete\nDigest: sha256:59cfbc935e1fdc60ea3048d105dc09c17ab3b94e35137d426023f43c049f064e\nStatus: Downloaded newer image for ghcr.io/ana/shop:2.0\nghcr.io/ana/shop:2.0',
        },
        {
          kind: 'fill',
          prompt: 'Expand the short name.',
          code: 'docker pull ana/quiz\n# really pulls ___:latest',
          blanks: [
            {
              answer: ['docker.io/ana/quiz'],
              options: ['docker.io/ana/quiz', 'docker.io/library/ana/quiz', 'ghcr.io/ana/quiz'],
            },
          ],
          hint: 'No host means one registry. Is ana an official image?',
          explain: 'ana has no dot or colon, so it’s a Docker Hub account. Only one-part names like nginx get library/ added.',
          output:
            'Using default tag: latest\nlatest: Pulling from ana/quiz\na0c25f4ede92: Pull complete\nDigest: sha256:98834734c380daf6baef3394d8a64e1ae4e9053c83e8488c0e427b8231e0fd94\nStatus: Downloaded newer image for ana/quiz:latest\ndocker.io/ana/quiz:latest',
        },
        {
          kind: 'fill',
          prompt: 'Finish the full name of the official httpd image.',
          code: 'docker pull httpd\n# full name: docker.io/___/httpd:latest',
          blanks: [{ answer: ['library'], options: ['library', 'official', 'docker'] }],
          hint: 'Docker Official Images share one namespace.',
          explain: 'One-part names are Docker Official Images, kept in the library namespace, so httpd is docker.io/library/httpd.',
          output:
            'Using default tag: latest\nlatest: Pulling from library/httpd\n333a87023552: Pull complete\nae382d6707f5: Pull complete\nDigest: sha256:ad47e1bb8a816e01259d05b332e9fbcc92075fc196d2dce400bf520e68c72ae1\nStatus: Downloaded newer image for httpd:latest\ndocker.io/library/httpd:latest',
        },
        {
          kind: 'fill',
          prompt: 'Is myteam a registry host here?',
          code: 'docker pull myteam/api:1.0\n# myteam is a ___',
          blanks: [{ answer: ['Docker Hub account'], options: ['Docker Hub account', 'registry host'] }],
          hint: 'Look for a dot, a colon or localhost.',
          explain: 'myteam has no dot or colon and isn’t localhost, so this pulls docker.io/myteam/api:1.0 from Docker Hub.',
        },
        {
          kind: 'build',
          prompt: 'Pull notes:2.1 from ana’s account on ghcr.io.',
          answer: ['docker', 'pull', 'ghcr.io/ana/notes:2.1'],
          distractors: ['https://ghcr.io/ana/notes:2.1', 'ana/notes:2.1', 'ghcr.io:ana/notes:2.1'],
          hint: 'Image names never include a protocol.',
          explain: 'Host, then account, then repo:tag, joined by slashes. With https:// or a colon after the host, Docker rejects the name.',
          output:
            '2.1: Pulling from ana/notes\n3108e2d3171e: Pull complete\n1bfd811fca51: Pull complete\nDigest: sha256:1794f5b85b5ac9d2370ac4a78552bd5ccef627627e9030c821a33169ace44f68\nStatus: Downloaded newer image for ghcr.io/ana/notes:2.1\nghcr.io/ana/notes:2.1',
        },
        {
          kind: 'build',
          prompt: 'Run web:1.0 from the registry at localhost:5000.',
          answer: ['docker', 'run', 'localhost:5000/web:1.0'],
          distractors: ['localhost/web:1.0', 'web:1.0@localhost:5000', 'http://localhost:5000/web:1.0'],
          hint: 'The port belongs to the host part, at the front.',
          explain: 'localhost:5000 is the host and port, so it comes first. localhost/web:1.0 would look for a registry on the default port, not 5000.',
        },
        {
          kind: 'fill',
          prompt: 'Split this name into registry and tag.',
          code: 'registry.gitlab.com/ana/blog:3.0\n# registry: ___\n# tag: ___',
          blanks: [
            { answer: ['registry.gitlab.com'], options: ['registry.gitlab.com', 'gitlab.com', 'ana'] },
            { answer: ['3.0'], options: ['3.0', 'blog', 'latest'] },
          ],
          hint: 'The host ends at the first slash; the tag follows the last colon.',
          explain: 'Everything before the first / is the host, here GitLab’s registry. ana/blog is the repository and 3.0 its tag.',
        },
      ],
    },
    {
      title: 'Pushing images',
      concept: {
        body: 'docker push uploads an image to the registry in its name, so first docker tag it with the full name. With no tag, only :latest is pushed, and --all-tags (-a) pushes every tag of the repository. Layers the registry already has are skipped.',
        code: 'docker tag shop:2.0 ghcr.io/ana/shop:2.0\ndocker push ghcr.io/ana/shop:2.0\ndocker push --all-tags ghcr.io/ana/shop',
      },
      exercises: [
        {
          kind: 'build',
          prompt: 'Give quiz:1.4 its ghcr.io name for ana.',
          answer: ['docker', 'tag', 'quiz:1.4', 'ghcr.io/ana/quiz:1.4'],
          distractors: ['push', 'ghcr.io/quiz:1.4'],
          hint: 'docker tag SOURCE TARGET, with the host in the target.',
          explain: 'The new name points at the same image. Its ghcr.io/ana/ prefix tells docker push where to upload it.',
        },
        {
          kind: 'build',
          prompt: 'Upload the tagged quiz:1.4 to ana’s ghcr.io.',
          answer: ['docker', 'push', 'ghcr.io/ana/quiz:1.4'],
          distractors: ['quiz:1.4', 'upload', 'pull'],
          hint: 'Push the name that includes the host.',
          explain: 'push reads the registry from the name. Each layer is uploaded, then the tag gets the image’s digest.',
          output: PUSH_QUIZ_14,
        },
        {
          kind: 'fill',
          prompt: 'No tag given. Type the tag that gets pushed.',
          code: 'docker push ghcr.io/ana/quiz\n# pushes only :___',
          blanks: [{ answer: ['latest'] }],
          hint: 'Same default as docker pull.',
          explain: 'A name with no tag means :latest, for push too. Other local tags such as 1.4 aren’t pushed.',
          output: `Using default tag: latest\nThe push refers to repository [ghcr.io/ana/quiz]\n3108e2d3171e: Layer already exists\ne0e1707308fe: Layer already exists\n7d36faf77fbd: Layer already exists\nlatest: digest: ${QUIZ_14} size: 856`,
        },
        {
          kind: 'order',
          prompt: 'You’re logged in. Build, tag, push, then sign out.',
          lines: [
            'docker build -t quiz:1.5 .',
            'docker tag quiz:1.5 ghcr.io/ana/quiz:1.5',
            'docker push ghcr.io/ana/quiz:1.5',
            'docker logout ghcr.io',
          ],
          hint: 'Each step needs the one before it.',
          explain: 'You can only tag an image that exists and only push a name you’ve tagged. Logging out last removes the stored token.',
          output: `${PUSH_QUIZ_15}\nRemoving login credentials for ghcr.io`,
        },
        {
          kind: 'build',
          prompt: 'Push every tag of ghcr.io/ana/quiz.',
          answer: ['docker', 'push', '--all-tags', 'ghcr.io/ana/quiz'],
          alt: [['docker', 'push', 'ghcr.io/ana/quiz', '--all-tags']],
          distractors: ['--all', 'ghcr.io/ana/quiz:*'],
          hint: 'Leave the tag off and add one flag.',
          explain: '--all-tags (or -a) pushes every local tag of the repository, skipping layers the registry already has.',
          output: `The push refers to repository [ghcr.io/ana/quiz]\n7d36faf77fbd: Layer already exists\n1.4: digest: ${QUIZ_14} size: 856\nb362529711af: Layer already exists\n1.5: digest: ${QUIZ_15} size: 856\n7d36faf77fbd: Layer already exists\nlatest: digest: ${QUIZ_14} size: 856`,
        },
        {
          kind: 'fix',
          prompt: 'This push heads to the wrong registry. Fix it.',
          code: 'docker tag quiz:1.5 ghcr.io/ana/quiz:1.5\ndocker push [[quiz:1.5]]',
          fix: 'ghcr.io/ana/quiz:1.5',
          options: ['ghcr.io/ana/quiz:1.5', 'ana/quiz:1.5', 'https://ghcr.io/ana/quiz:1.5'],
          hint: 'Push the name you just made.',
          explain: 'quiz:1.5 means docker.io/library/quiz:1.5, and Docker Hub denies that push. The ghcr.io name sends it to GitHub.',
          output: PUSH_QUIZ_15,
        },
        {
          kind: 'order',
          prompt: 'Registry at localhost:5000: build, push, delete locally, pull back.',
          lines: [
            'docker build -t localhost:5000/notes:1.0 .',
            'docker push localhost:5000/notes:1.0',
            'docker rmi localhost:5000/notes:1.0',
            'docker pull localhost:5000/notes:1.0',
          ],
          hint: 'Building with the full name means no docker tag step.',
          explain: 'Naming the build localhost:5000/notes:1.0 skips docker tag. After rmi, the pull fetches it from your registry, which proves the push worked.',
          output:
            '1.0: Pulling from notes\n79913c3ee3c8: Pull complete\n722527cbd585: Pull complete\nDigest: sha256:b3f280ef93356fe27a01532f2c3ead4caef52c472cc06e21178009c68aa99af4\nStatus: Downloaded newer image for localhost:5000/notes:1.0\nlocalhost:5000/notes:1.0',
        },
      ],
    },
    {
      title: 'Digests',
      concept: {
        body: 'A tag can move: push a new build as :1.4 and the tag points at it. A digest (sha256:…) is a hash of the image’s content, so it always means exactly one image. docker images --digests shows them, and name@sha256:… pins one in pull, run or FROM.',
        code: `docker images --digests\ndocker pull nginx@${NGINX}\n# in a Dockerfile:\nFROM nginx@${NGINX}`,
      },
      exercises: [
        {
          kind: 'fill',
          prompt: 'Which reference always gives the same image?',
          code: `# A: nginx:alpine\n# B: nginx@${NGINX}\n# always the same image: ___`,
          blanks: [{ answer: ['B'], options: ['B', 'A', 'both'] }],
          hint: 'Which one can the publisher move?',
          explain: 'The publisher can point alpine at a new build any time. A digest is a hash of the content, so it only ever means one image.',
        },
        {
          kind: 'build',
          prompt: 'List the digests of your ghcr.io/ana/quiz images.',
          answer: ['docker', 'images', '--digests', 'ghcr.io/ana/quiz'],
          alt: [['docker', 'images', 'ghcr.io/ana/quiz', '--digests']],
          distractors: ['--digest', '--sha'],
          hint: 'The flag is the plural of what you want to see.',
          explain: '--digests adds a DIGEST column, and the repository name limits the list to that repo. 1.4 and latest share a digest, so they’re one image.',
          output: DIGESTS_QUIZ,
        },
        {
          kind: 'fill',
          prompt: 'Type which part of a name can move.',
          code: '# a ___ can point at a new image tomorrow;\n# a digest can’t',
          blanks: [{ answer: ['tag'] }],
          hint: 'It’s the part after the colon, like 1.4.',
          explain: 'Anyone who can push to the repo can move a tag. A digest is computed from the content, so a different image always has a different digest.',
        },
        {
          kind: 'order',
          prompt: 'Pinned base first, gems before code, CMD last.',
          lines: [
            `FROM ruby:3.4-slim@${RUBY}`,
            'WORKDIR /app',
            'COPY Gemfile Gemfile.lock ./',
            'RUN bundle install',
            'COPY . .',
            'CMD ["ruby", "app.rb"]',
          ],
          hint: 'FROM always comes first; dependencies before your code.',
          explain: 'The digest pins ruby:3.4-slim to one exact build, so a rebuild next month uses the same base. The tag is just there for humans.',
        },
        {
          kind: 'fill',
          prompt: 'Tag 1.0 moved on Tuesday. Whose build does this pull?',
          code: `# Monday:  bot:1.0 pushed, ${BOT_MON.slice(0, 15)}…\n# Tuesday: bot:1.0 pushed, ${BOT_TUE.slice(0, 15)}…\ndocker pull ghcr.io/ana/bot@${BOT_MON}\n# you get ___’s build`,
          blanks: [{ answer: ['Monday', 'monday'] }],
          hint: 'A digest never follows a tag around.',
          explain: 'The digest still names Monday’s image even though tag 1.0 now points at Tuesday’s. Pulling ghcr.io/ana/bot:1.0 would get Tuesday’s.',
          output: `${BOT_MON}: Pulling from ana/bot\nb265a99b1019: Pull complete\nDigest: ${BOT_MON}\nStatus: Downloaded newer image for ghcr.io/ana/bot@${BOT_MON}\nghcr.io/ana/bot@${BOT_MON}`,
        },
        {
          kind: 'fix',
          prompt: 'This pinned FROM won’t parse. Fix it.',
          code: `FROM python:3.13-slim[[:]]${PYTHON}\nWORKDIR /app`,
          fix: '@',
          options: ['@', '#', '/'],
          hint: 'Tags follow a colon. Digests follow a different symbol.',
          explain: 'A digest joins the name with @. python:3.13-slim@sha256:… keeps the readable tag and pins the exact build.',
        },
        {
          kind: 'order',
          prompt: 'Push 1.6, read its digest, then run that exact build.',
          lines: [
            'docker push ghcr.io/ana/quiz:1.6',
            'docker images --digests ghcr.io/ana/quiz',
            `docker run -d ghcr.io/ana/quiz@${QUIZ_16}`,
          ],
          hint: 'You can’t copy a digest you haven’t looked up yet.',
          explain: 'Running by digest means the server gets exactly the build you pushed, even if someone moves the 1.6 tag later.',
          output: '6a1f0c94d2b7e3a85f0d9c71b4e2a6038d5f7c19e2b4a60f8d3c7e1b5a9f2d40',
        },
      ],
    },
    {
      title: 'Multi-platform builds',
      concept: {
        body: 'An image is built for one platform, such as linux/amd64 (Intel and AMD) or linux/arm64 (Apple silicon and ARM servers). docker buildx build --platform with a comma-separated list builds each one, and --push uploads them all under one tag. Each machine that pulls the tag gets the build for its CPU.',
        code: 'docker buildx build \\\n  --platform linux/amd64,linux/arm64 \\\n  -t ghcr.io/ana/api:1.0 --push .',
      },
      exercises: [
        {
          kind: 'fill',
          prompt: 'Add 64-bit ARM to the platform list.',
          code: 'docker buildx build --platform linux/amd64,linux/___ \\\n  -t ghcr.io/ana/api:1.0 --push .',
          blanks: [{ answer: ['arm64'], options: ['arm64', 'arm-64', 'apple'] }],
          hint: 'amd64 is the Intel/AMD one. The ARM one follows the same pattern.',
          explain: 'linux/arm64 covers Apple silicon Macs and ARM cloud servers. Each entry is os/arch.',
          output: BUILDX_PUSH_API,
        },
        {
          kind: 'fill',
          prompt: 'Separate the two platforms.',
          code: 'docker buildx build --platform linux/amd64___linux/arm64 .',
          blanks: [{ answer: [','], options: [',', ';', '+'] }],
          hint: 'One flag, a list of values.',
          explain: '--platform takes a comma-separated list with no spaces, and BuildKit builds the image once per entry.',
        },
        {
          kind: 'build',
          prompt: 'Build this folder for linux/arm64 only.',
          answer: ['docker', 'buildx', 'build', '--platform', 'linux/arm64', '.'],
          alt: [['docker', 'buildx', 'build', '.', '--platform', 'linux/arm64']],
          distractors: ['--arch', 'arm64/linux'],
          hint: 'One flag, a value written os/arch, then the context.',
          explain: 'The result runs on ARM even if you built it on an Intel PC. Docker Desktop emulates other CPUs with QEMU, which is slower but works.',
        },
        {
          kind: 'fill',
          prompt: 'An Apple silicon Mac pulls the tag. Type its platform’s arch.',
          code: 'docker pull ghcr.io/ana/api:1.0\n# on an M3 Mac, Docker picks linux/___',
          blanks: [{ answer: ['arm64'] }],
          hint: 'Apple silicon is an ARM chip.',
          explain: 'Docker Desktop runs Linux containers on the Mac’s ARM CPU, so it takes the linux/arm64 image from the list. An Intel server gets linux/amd64.',
        },
        {
          kind: 'type',
          prompt: 'Target both amd64 and arm64.',
          template: 'docker buildx build ___ \\\n  -t ghcr.io/ana/api:1.0 --push .',
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
          output: BUILDX_PUSH_API,
        },
        {
          kind: 'type',
          prompt: 'Name it api:1.0 under ana on ghcr.io.',
          template: 'docker buildx build --platform linux/amd64,linux/arm64 \\\n  ___ --push .',
          accept: [
            '-t ghcr.io/ana/api:1.0',
            '--tag ghcr.io/ana/api:1.0',
            '-t=ghcr.io/ana/api:1.0',
            '--tag=ghcr.io/ana/api:1.0',
          ],
          hint: 'The tag flag, then host/account/repo:tag.',
          explain: '--push sends the image to the registry in its name. Without ghcr.io/ana/, it would try Docker Hub’s library namespace and be denied.',
          output: BUILDX_PUSH_API,
        },
        {
          kind: 'fix',
          prompt: 'The build finishes, but nothing reaches ghcr.io. Fix it.',
          code: 'docker buildx build --platform linux/amd64,linux/arm64 \\\n  -t ghcr.io/ana/api:1.0 [[--pull]] .',
          fix: '--push',
          options: ['--push', '--upload', '--publish'],
          hint: 'One letter off: you want to send, not fetch.',
          explain: '--pull only checks for newer base images. --push uploads every platform’s image under the tag when the build ends.',
          output: BUILDX_PUSH_API,
        },
      ],
    },
  ],
  boss: [
    {
      kind: 'order',
      prompt: 'Release quiz 2.0. Sign in first, sign out last.',
      lines: [
        'echo "$CR_PAT" | docker login ghcr.io -u ana --password-stdin',
        'docker build -t quiz:2.0 .',
        'docker tag quiz:2.0 ghcr.io/ana/quiz:2.0',
        'docker push ghcr.io/ana/quiz:2.0',
        'docker logout ghcr.io',
      ],
      hint: 'Login and logout wrap the rest; each middle step needs the one before.',
      explain: 'Build, tag with the registry host, push, then log out so the token isn’t left on the machine.',
    },
    {
      kind: 'fill',
      prompt: 'Type the two missing parts of mysql:8.4’s full name.',
      code: 'docker pull mysql:8.4\n# full name: ___/___/mysql:8.4',
      blanks: [{ answer: ['docker.io'] }, { answer: ['library'] }],
      hint: 'The default registry, then the official images’ namespace.',
      explain: 'No host means Docker Hub (docker.io), and a one-part name is an official image in library.',
      output:
        '8.4: Pulling from library/mysql\n6fbd1f76bcbb: Pull complete\n163f8f84f8a4: Pull complete\nDigest: sha256:be579f7baaae51860dfd78bdd05c9fb1230d373a8865039ecd783f90383b2ff2\nStatus: Downloaded newer image for mysql:8.4\ndocker.io/library/mysql:8.4',
    },
    {
      kind: 'fix',
      prompt: 'The push can’t find the image. Fix the build.',
      code: 'docker build -t [[notes:3.1]] .\ndocker push ghcr.io/ana/notes:3.1',
      fix: 'ghcr.io/ana/notes:3.1',
      options: ['ghcr.io/ana/notes:3.1', 'ana/notes:3.1', 'notes:3.1@ghcr.io'],
      hint: 'The build must create the exact name the push uses.',
      explain: 'Only notes:3.1 existed, so there was nothing called ghcr.io/ana/notes:3.1 to push. Naming the build in full skips docker tag.',
      output: PUSH_NOTES_31,
    },
    {
      kind: 'build',
      prompt: 'After the token pipe, log in to GitLab’s registry as ana.',
      answer: ['docker', 'login', 'registry.gitlab.com', '-u', 'ana', '--password-stdin'],
      alt: [
        ['docker', 'login', 'registry.gitlab.com', '--password-stdin', '-u', 'ana'],
        ['docker', 'login', '-u', 'ana', 'registry.gitlab.com', '--password-stdin'],
        ['docker', 'login', '-u', 'ana', '--password-stdin', 'registry.gitlab.com'],
        ['docker', 'login', '--password-stdin', 'registry.gitlab.com', '-u', 'ana'],
        ['docker', 'login', '--password-stdin', '-u', 'ana', 'registry.gitlab.com'],
      ],
      distractors: ['gitlab.com', '-p'],
      hint: 'Use the registry’s host, not the website’s.',
      explain: 'GitLab’s images live on registry.gitlab.com, so that’s the host to log in to. -u names you and --password-stdin reads the token.',
      output: LOGIN_OK,
    },
    {
      kind: 'fill',
      prompt: 'Pick a tag or a digest for each job.',
      code: '# prod must never change unless you edit it\n# dev should pick up patched 3.x builds\n# prod pins a ___, dev follows a ___',
      blanks: [
        { answer: ['digest'], options: ['digest', 'tag'] },
        { answer: ['tag'], options: ['tag', 'digest'] },
      ],
      hint: 'Which one can the publisher move?',
      explain: 'A digest can’t change, so prod only updates when you edit it. A tag like 3 moves to each patched build the publisher pushes.',
    },
    {
      kind: 'fix',
      prompt: 'Docker refuses this push. Fix the name.',
      code: 'docker push --all-tags [[ghcr.io/ana/notes:3.1]]',
      fix: 'ghcr.io/ana/notes',
      options: ['ghcr.io/ana/notes', 'ghcr.io/ana/notes:*', 'ghcr.io/ana/notes:all'],
      hint: '--all-tags chooses the tags for you.',
      explain: '--all-tags pushes every tag of a repository, so the name must have no tag. With one, Docker stops with an error.',
      output: `The push refers to repository [ghcr.io/ana/notes]\n16938dc68883: Layer already exists\n3.0: digest: ${NOTES_30} size: 1048\nd6c8d0c8a734: Layer already exists\n3.1: digest: ${NOTES_31} size: 1048\nd6c8d0c8a734: Layer already exists\nlatest: digest: ${NOTES_31} size: 1048`,
    },
    {
      kind: 'type',
      prompt: 'List digests for ghcr.io/ana/notes only.',
      accept: [
        'docker images --digests ghcr.io/ana/notes',
        'docker images ghcr.io/ana/notes --digests',
        'docker image ls --digests ghcr.io/ana/notes',
        'docker image ls ghcr.io/ana/notes --digests',
        'docker image list --digests ghcr.io/ana/notes',
        'docker image list ghcr.io/ana/notes --digests',
      ],
      hint: 'The list command, the plural flag, then the repository.',
      explain: '--digests adds the DIGEST column, and the repository argument filters the list to that one repo.',
      output: `REPOSITORY          TAG      DIGEST                                                                    IMAGE ID       CREATED       SIZE\nghcr.io/ana/notes   3.1      ${NOTES_31}   3e082a391167   5 hours ago   212MB\nghcr.io/ana/notes   latest   ${NOTES_31}   3e082a391167   5 hours ago   212MB\nghcr.io/ana/notes   3.0      ${NOTES_30}   ab05285fd67e   2 weeks ago   209MB`,
    },
    {
      kind: 'fill',
      prompt: 'Type the flags: build for both CPUs and upload.',
      code: 'docker buildx build ___ linux/amd64,linux/arm64 \\\n  -t ghcr.io/ana/notes:3.1 ___ .',
      blanks: [{ answer: ['--platform'] }, { answer: ['--push', '--output=type=registry'] }],
      hint: 'One flag picks the CPUs, the other sends the result.',
      explain: '--platform builds one image per entry, and --push uploads them together under ghcr.io/ana/notes:3.1.',
      output: ` => [linux/amd64 5/5] RUN dotnet publish -c Release -o /app     21.4s\n => [linux/arm64 5/5] RUN dotnet publish -c Release -o /app     48.9s\n => exporting to image                                            7.3s\n => => exporting manifest list ${NOTES_MP}  0.0s\n => => pushing layers                                             5.2s\n => => pushing manifest for ghcr.io/ana/notes:3.1@${NOTES_MP}  1.2s`,
    },
    {
      kind: 'fix',
      prompt: 'This build fails on its platform. Fix it.',
      code: 'docker buildx build --platform [[amd64/linux]],linux/arm64 \\\n  -t ghcr.io/ana/notes:3.1 --push .',
      fix: 'linux/amd64',
      options: ['linux/amd64', 'linux-amd64', 'x86/linux'],
      hint: 'Compare it with the platform after the comma.',
      explain: 'Platforms are written os/arch, so the OS comes first: linux/amd64. amd64/linux asks for an OS called amd64.',
    },
    {
      kind: 'type',
      prompt: 'Give notes:3.1 its ghcr.io name for ana.',
      accept: ['docker tag notes:3.1 ghcr.io/ana/notes:3.1', 'docker image tag notes:3.1 ghcr.io/ana/notes:3.1'],
      hint: 'docker tag, the image you have, then the full new name.',
      explain: 'The new name carries the host and account, so docker push ghcr.io/ana/notes:3.1 knows where to upload.',
    },
  ],
};

export default unit;
