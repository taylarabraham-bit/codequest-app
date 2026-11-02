import type { DesktopUnit } from '../../../engine/types';

// Desktop edition: write-the-code challenges for Docker unit 20 (Capstone: ship a full stack).
// The app is Pantry: api/ (.NET 10), web/ (Vite + nginx) and db (Postgres 18).
// lessons[i] runs after lesson i + 1. See docs/CONTENT_GUIDE.md.

/** Regex source: inside the YAML block `name`, some line starts with `line`. Any key order. Use flags 'm'. */
const inBlock = (name: string, line: string) =>
  `^([ \\t]*)${name}:[ \\t]*\\n(?:\\1[ \\t]+.*\\n|[ \\t]*\\n)*?\\1[ \\t]+${line}`;

/** Regex source: a YAML list item `item` under `key`, in either `key: [a, b]` or `- a` form. */
const listHas = (key: string, item: string) =>
  `${key}:[ \\t]*(\\[[^\\]\\n]*["']?\\b${item}["']?\\s*[,\\]]|\\n(?:[ \\t]+-.*\\n)*?[ \\t]+-[ \\t]*["']?${item}["']?[ \\t]*$)`;

/** Regex source for a GitHub expression like ${{ matrix.app }}, spaces optional. */
const expr = (inner: string) => `\\$\\{\\{\\s*${inner}\\s*\\}\\}`;

const STACK =
  'services:\n  web:\n    image: ghcr.io/ana/pantry-web:1.0.0\n    networks: [front]\n  api:\n    image: ghcr.io/ana/pantry-api:1.0.0\n    networks: [front, back]\n  db:\n    image: postgres:18\n    networks: [back]\n    volumes:\n      - db-data:/var/lib/postgresql\nnetworks:\n  front: {}\n  back:\n    internal: true\nvolumes:\n  db-data: {}';

const CI_HEAD =
  "on:\n  push: { tags: ['v*'] }\n  pull_request:\njobs:\n  image:\n    runs-on: ubuntu-latest\n    permissions: { contents: read, packages: write }\n    strategy:\n      matrix:\n        app: [api, web]\n    steps:\n      - uses: actions/checkout@v7\n      - uses: docker/setup-buildx-action@v4\n";

const unit: DesktopUnit = {
  lessons: [
    // L1 Two Dockerfiles
    [
      {
        kind: 'write',
        prompt: 'Write api/Dockerfile: restore and publish Pantry.Api on the SDK, run it on aspnet Alpine.',
        starter: '# api/Dockerfile (project: Pantry.Api/Pantry.Api.csproj)\n',
        solution:
          '# api/Dockerfile (project: Pantry.Api/Pantry.Api.csproj)\nFROM mcr.microsoft.com/dotnet/sdk:10.0 AS build\nWORKDIR /src\nCOPY Pantry.Api/Pantry.Api.csproj Pantry.Api/\nRUN dotnet restore Pantry.Api/Pantry.Api.csproj\nCOPY . .\nRUN dotnet publish Pantry.Api/Pantry.Api.csproj -c Release -o /app/publish --no-restore\n\nFROM mcr.microsoft.com/dotnet/aspnet:10.0-alpine\nWORKDIR /app\nCOPY --from=build /app/publish .\nUSER $APP_UID\nENTRYPOINT ["dotnet", "Pantry.Api.dll"]',
        checks: [
          { label: 'A build stage on the sdk:10.0 image', re: '^\\s*FROM\\s+mcr\\.microsoft\\.com/dotnet/sdk:10\\.0\\S*\\s+AS\\s+\\w+', flags: 'im' },
          { label: 'Copy the .csproj and restore before COPY . .', re: 'COPY\\s+\\S*Pantry\\.Api\\.csproj\\s+\\S+[\\s\\S]*dotnet\\s+restore[\\s\\S]*COPY\\s+\\.\\s+\\.' },
          { label: 'Publish to a folder with --no-restore', re: 'dotnet\\s+publish\\s[^\\n]*(?=[^\\n]*--no-restore)[^\\n]*(-o|--output)\\s+\\S+|dotnet\\s+publish\\s[^\\n]*(-o|--output)\\s+\\S+[^\\n]*--no-restore' },
          { label: 'Final stage FROM aspnet:10.0-alpine', re: '^\\s*FROM\\s+mcr\\.microsoft\\.com/dotnet/aspnet:10\\.0-alpine\\b', flags: 'm' },
          { label: 'COPY --from the build stage, then USER $APP_UID', re: 'COPY\\s+--from=\\w+\\s[\\s\\S]*^\\s*USER\\s+(\\$APP_UID|\\$\\{APP_UID\\}|app)\\s*$', flags: 'm' },
          { label: 'ENTRYPOINT ["dotnet", "Pantry.Api.dll"]', re: 'ENTRYPOINT\\s*\\[\\s*"dotnet"\\s*,\\s*"(\\./|/app/)?Pantry\\.Api\\.dll"\\s*\\]' },
        ],
        hint: 'Everything from units 8 and 12: name the SDK stage, cache restore, and finish non-root on the small runtime image.',
        explain: 'Only the last stage ships: the Alpine aspnet runtime, the published DLLs and nothing from the SDK.',
      },
      {
        kind: 'write',
        prompt: 'Finish web/Dockerfile: build the Vite app with npm, serve dist from nginx:alpine.',
        starter: '# web/Dockerfile\nFROM node:22-alpine AS build\nWORKDIR /src\n',
        solution:
          '# web/Dockerfile\nFROM node:22-alpine AS build\nWORKDIR /src\nCOPY package.json package-lock.json ./\nRUN npm ci\nCOPY . .\nRUN npm run build\n\nFROM nginx:alpine\nCOPY --from=build /src/dist /usr/share/nginx/html',
        checks: [
          { label: 'Copy package.json and the lock file first', re: 'COPY\\s+(?=[^\\n]*package(\\*|-lock)?\\.json)[^\\n]*\\n[\\s\\S]*RUN\\s+npm\\s+ci' },
          { label: 'Install with npm ci before COPY . .', re: 'RUN\\s+npm\\s+ci\\b[\\s\\S]*COPY\\s+\\.\\s+\\.' },
          { label: 'RUN npm run build', re: 'RUN\\s+npm\\s+run\\s+build\\b' },
          { label: 'A final FROM nginx:alpine', re: '^\\s*FROM\\s+nginx(inc/nginx-unprivileged)?:\\S*alpine\\S*\\s*$', flags: 'm' },
          { label: 'COPY --from=build /src/dist into /usr/share/nginx/html', re: 'COPY\\s+--from=build\\s+/src/dist/?\\s+/usr/share/nginx/html/?' },
        ],
        hint: 'Vite writes the built site to dist/ inside WORKDIR. nginx serves /usr/share/nginx/html.',
        explain: 'npm ci only reruns when the lock file changes. The final image is nginx plus static files, with no Node at all.',
      },
    ],
    // L2 The Compose file
    [
      {
        kind: 'write',
        prompt: 'Write compose.yaml: web on front, db on an internal back network, api on both.',
        starter: '',
        solution: STACK,
        checks: [
          { label: 'web is on front only', re: inBlock('web', 'networks:[ \\t]*(\\[[ \\t]*front[ \\t]*\\]|\\n[ \\t]+-[ \\t]*front[ \\t]*$(?!\\n[ \\t]+-))'), flags: 'm' },
          { label: 'api is on front and back', re: inBlock('api', 'networks:(?=[^\\n]*\\bfront\\b|(?:\\n[ \\t]+-.*)*\\n[ \\t]+-[ \\t]*front\\b)(?=[^\\n]*\\bback\\b|(?:\\n[ \\t]+-.*)*\\n[ \\t]+-[ \\t]*back\\b)'), flags: 'm' },
          { label: 'db is on back', re: inBlock('db', listHas('networks', 'back')), flags: 'm' },
          { label: 'db mounts a named volume at /var/lib/postgresql', re: '^[ \\t]+-[ \\t]*["\']?[\\w-]+:/var/lib/postgresql/?["\']?[ \\t]*$', flags: 'm' },
          { label: 'Top-level networks: back is internal: true', re: '^networks:\\s*\\n(?:[ \\t]+.*\\n)*?[ \\t]+back:\\s*(\\{\\s*internal:\\s*true|\\n[ \\t]+internal:\\s*true)', flags: 'm' },
          { label: 'Declare the volume under top-level volumes:', re: '^volumes:\\s*\\n[ \\t]+[\\w-]+:', flags: 'm' },
        ],
        hint: 'An internal network has no route out, so the database can’t reach, or be reached from, the internet.',
        explain: 'web can talk to api but never to db; only api bridges the two networks. The named volume keeps the data across rebuilds.',
      },
      {
        kind: 'write',
        prompt: 'Add healthchecks so api waits for db, web waits for api, and publish web on 8080.',
        starter:
          'services:\n  web:\n    image: ghcr.io/ana/pantry-web:1.0.0\n  api:\n    image: ghcr.io/ana/pantry-api:1.0.0\n  db:\n    image: postgres:18\n',
        solution:
          'services:\n  web:\n    image: ghcr.io/ana/pantry-web:1.0.0\n    ports:\n      - "8080:80"\n    depends_on:\n      api: { condition: service_healthy }\n  api:\n    image: ghcr.io/ana/pantry-api:1.0.0\n    depends_on:\n      db: { condition: service_healthy }\n    healthcheck:\n      test: ["CMD", "wget", "--spider", "-q", "http://localhost:8080/healthz"]\n      interval: 10s\n  db:\n    image: postgres:18\n    healthcheck:\n      test: ["CMD", "pg_isready", "-U", "postgres"]\n      interval: 5s',
        checks: [
          { label: 'db: a pg_isready healthcheck', re: inBlock('db', 'healthcheck:[\\s\\S]*?test:[^\\n]*pg_isready'), flags: 'm' },
          { label: 'api: a wget --spider healthcheck on :8080/healthz', re: inBlock('api', 'healthcheck:[\\s\\S]*?test:[^\\n]*wget[^\\n]*--spider[^\\n]*localhost:8080/healthz'), flags: 'm' },
          { label: 'api depends_on db: service_healthy', re: inBlock('api', 'depends_on:\\s*\\n[ \\t]+db:\\s*(\\{\\s*|\\n[ \\t]+)condition:\\s*service_healthy'), flags: 'm' },
          { label: 'web depends_on api: service_healthy', re: inBlock('web', 'depends_on:\\s*\\n[ \\t]+api:\\s*(\\{\\s*|\\n[ \\t]+)condition:\\s*service_healthy'), flags: 'm' },
          { label: 'web publishes host port 8080 to nginx’s 80', re: inBlock('web', 'ports:[\\s\\S]*?["\']?8080:80["\']?\\s*[\\n\\]]'), flags: 'm' },
        ],
        hint: 'The Alpine aspnet image has no curl, but busybox wget is there. --spider checks without downloading.',
        explain: 'docker compose up now starts db, waits for pg_isready, starts api, waits for /healthz, then starts web.',
      },
    ],
    // L3 Config & secrets
    [
      {
        kind: 'write',
        prompt: 'Give db its password as a secret file, and web its nginx config as a Compose config.',
        starter:
          'services:\n  web:\n    image: ghcr.io/ana/pantry-web:1.0.0\n  db:\n    image: postgres:18\n',
        solution:
          'services:\n  web:\n    image: ghcr.io/ana/pantry-web:1.0.0\n    configs:\n      - source: web_conf\n        target: /etc/nginx/conf.d/default.conf\n  db:\n    image: postgres:18\n    environment:\n      POSTGRES_PASSWORD_FILE: /run/secrets/db_password\n    secrets:\n      - db_password\nsecrets:\n  db_password:\n    file: ./secrets/db_password.txt\nconfigs:\n  web_conf:\n    file: ./web/default.conf',
        checks: [
          { label: 'Top-level secrets: db_password from ./secrets/db_password.txt', re: '^secrets:\\s*\\n[ \\t]+db_password:\\s*\\n[ \\t]+file:\\s*["\']?(\\./)?secrets/db_password\\.txt', flags: 'm' },
          { label: 'db lists the db_password secret', re: inBlock('db', listHas('secrets', 'db_password')), flags: 'm' },
          { label: 'POSTGRES_PASSWORD_FILE: /run/secrets/db_password', re: 'POSTGRES_PASSWORD_FILE[:=]\\s*["\']?/run/secrets/db_password\\b' },
          { label: 'Top-level configs: web_conf from ./web/default.conf', re: '^configs:\\s*\\n[ \\t]+web_conf:\\s*\\n[ \\t]+file:\\s*["\']?(\\./)?web/default\\.conf', flags: 'm' },
          { label: 'web mounts web_conf at /etc/nginx/conf.d/default.conf', re: inBlock('web', 'configs:[\\s\\S]*?source:\\s*web_conf[\\s\\S]*?target:\\s*["\']?/etc/nginx/conf\\.d/default\\.conf|configs:[\\s\\S]*?target:\\s*["\']?/etc/nginx/conf\\.d/default\\.conf[\\s\\S]*?source:\\s*web_conf'), flags: 'm' },
          { label: 'No plain POSTGRES_PASSWORD', re: '^(?![\\s\\S]*POSTGRES_PASSWORD\\s*[:=])' },
        ],
        hint: 'Declare secrets and configs at the top level, then grant them per service. Secrets land in /run/secrets/.',
        explain: 'The password never sits in an environment variable that docker inspect would show; postgres reads it from the file.',
      },
      {
        kind: 'write',
        prompt: 'Write web/default.conf: serve the Vite app, and pass /api/ to the api service.',
        starter: '',
        solution:
          'server {\n    listen 80;\n    root /usr/share/nginx/html;\n\n    location / {\n        try_files $uri /index.html;\n    }\n\n    location /api/ {\n        proxy_pass http://api:8080;\n    }\n}',
        checks: [
          { label: 'A server block that listens on 80', re: 'server\\s*\\{[\\s\\S]*listen\\s+80\\s*;' },
          { label: 'root /usr/share/nginx/html', re: 'root\\s+/usr/share/nginx/html/?\\s*;' },
          { label: 'location / falls back to /index.html with try_files', re: 'location\\s+/\\s*\\{[^}]*try_files\\s[^;]*/index\\.html\\s*;' },
          { label: 'location /api/ proxies to http://api:8080', re: 'location\\s+/api/?\\s*\\{[^}]*proxy_pass\\s+http://api:8080/?\\s*;' },
        ],
        hint: 'Inside Compose, the service name api is the hostname. Every nginx directive ends with ;.',
        explain: 'The browser only talks to web, so there’s no CORS. try_files sends unknown paths to index.html for the app’s own router.',
      },
    ],
    // L4 CI: build, tag, push
    [
      {
        kind: 'write',
        prompt: 'Add the build step: each matrix app from its folder, pushed except on pull requests.',
        starter: CI_HEAD,
        solution:
          CI_HEAD +
          "      - uses: docker/login-action@v4\n        with:\n          registry: ghcr.io\n          username: ${{ github.actor }}\n          password: ${{ secrets.GITHUB_TOKEN }}\n      - uses: docker/build-push-action@v7\n        with:\n          context: ./${{ matrix.app }}\n          push: ${{ github.event_name != 'pull_request' }}\n          tags: ghcr.io/ana/pantry-${{ matrix.app }}:edge",
        checks: [
          { label: 'Log in to ghcr.io with login-action', re: 'uses:\\s*docker/login-action@v\\d+[\\s\\S]*?registry:\\s*ghcr\\.io' },
          { label: 'A build-push-action step', re: 'uses:\\s*docker/build-push-action@v\\d+' },
          { label: 'context: ./${{ matrix.app }}', re: `context:\\s*["']?(\\./)?${expr('matrix\\.app')}` },
          { label: "push: only when github.event_name != 'pull_request'", re: `push:\\s*${expr("github\\.event_name\\s*!=\\s*'pull_request'")}` },
          { label: 'tags: ghcr.io/ana/pantry-${{ matrix.app }}', re: `tags:\\s*["']?ghcr\\.io/ana/pantry-${expr('matrix\\.app')}` },
        ],
        hint: 'The matrix runs this job once per app; read the value with ${{ matrix.app }}.',
        explain: 'One job definition builds both images. Pull requests still build, so a broken Dockerfile fails the check without pushing anything.',
      },
      {
        kind: 'write',
        prompt: 'Tag from Git with metadata-action, and give each app its own Actions cache.',
        starter:
          "      - uses: docker/build-push-action@v7\n        with:\n          context: ./${{ matrix.app }}\n          push: ${{ github.event_name != 'pull_request' }}\n          tags: ghcr.io/ana/pantry-${{ matrix.app }}:edge\n",
        solution:
          "      - id: meta\n        uses: docker/metadata-action@v6\n        with:\n          images: ghcr.io/ana/pantry-${{ matrix.app }}\n          tags: |\n            type=semver,pattern={{version}}\n            type=sha\n      - uses: docker/build-push-action@v7\n        with:\n          context: ./${{ matrix.app }}\n          push: ${{ github.event_name != 'pull_request' }}\n          tags: ${{ steps.meta.outputs.tags }}\n          labels: ${{ steps.meta.outputs.labels }}\n          cache-from: type=gha,scope=${{ matrix.app }}\n          cache-to: type=gha,mode=max,scope=${{ matrix.app }}",
        checks: [
          { label: 'A metadata-action step with id: meta before the build', re: '(id:\\s*meta\\s*\\n\\s*uses:\\s*docker/metadata-action@v\\d+|uses:\\s*docker/metadata-action@v\\d+\\s*\\n\\s*id:\\s*meta\\b)[\\s\\S]*build-push-action' },
          { label: 'images: ghcr.io/ana/pantry-${{ matrix.app }}', re: `images:\\s*["']?ghcr\\.io/ana/pantry-${expr('matrix\\.app')}` },
          { label: 'type=semver,pattern={{version}} and type=sha', re: '^(?=[\\s\\S]*type=semver,\\s*pattern=\\{\\{\\s*version\\s*\\}\\})(?=[\\s\\S]*type=sha\\b)' },
          { label: 'tags and labels from steps.meta.outputs', re: `^(?=[\\s\\S]*tags:\\s*${expr('steps\\.meta\\.outputs\\.tags')})(?=[\\s\\S]*labels:\\s*${expr('steps\\.meta\\.outputs\\.labels')})` },
          { label: 'cache-from and cache-to type=gha with scope=${{ matrix.app }}', re: `^(?=[\\s\\S]*cache-from:\\s*["']?type=gha[^\\n]*scope=${expr('matrix\\.app')})(?=[\\s\\S]*cache-to:\\s*["']?type=gha[^\\n]*scope=${expr('matrix\\.app')})` },
          { label: 'No more hand-written :edge tag', not: ':edge' },
        ],
        hint: 'Without a scope, the api and web builds would overwrite each other’s cache.',
        explain: 'Git tag v1.0.0 now pushes pantry-api:1.0.0 and pantry-web:1.0.0 plus sha- tags, each build reusing only its own cache.',
      },
    ],
    // L5 Harden & monitor
    [
      {
        kind: 'write',
        prompt: 'Lock down api: read-only with a /tmp tmpfs, no capabilities, no new privileges.',
        starter: 'services:\n  api:\n    image: ghcr.io/ana/pantry-api:1.0.0\n    networks: [front, back]\n',
        solution:
          'services:\n  api:\n    image: ghcr.io/ana/pantry-api:1.0.0\n    networks: [front, back]\n    read_only: true\n    tmpfs:\n      - /tmp\n    cap_drop: [ALL]\n    security_opt:\n      - no-new-privileges:true',
        checks: [
          { label: 'read_only: true', re: inBlock('api', 'read_only:[ \\t]*true\\b'), flags: 'm' },
          { label: 'A tmpfs at /tmp', re: `${listHas('tmpfs', '/tmp')}|tmpfs:[ \\t]*["']?/tmp\\b`, flags: 'm' },
          { label: 'cap_drop: [ALL]', re: listHas('cap_drop', 'ALL'), flags: 'm' },
          { label: 'security_opt: no-new-privileges:true', re: listHas('security_opt', 'no-new-privileges(:true)?'), flags: 'm' },
        ],
        hint: 'These are the Compose names of --read-only, --tmpfs, --cap-drop and --security-opt.',
        explain: 'The .NET app writes only temp files, so a read-only root plus a tmpfs is enough, and it already runs as the app user.',
      },
      {
        kind: 'write',
        prompt: 'Share one logging block with an x- anchor, and move web to nginx-unprivileged.',
        starter:
          'services:\n  web:\n    image: nginx:alpine\n    ports:\n      - "8080:80"\n  api:\n    image: ghcr.io/ana/pantry-api:1.0.0\n  db:\n    image: postgres:18\n',
        solution:
          'x-logging: &logging\n  driver: local\n  options:\n    max-size: "10m"\nservices:\n  web:\n    image: nginxinc/nginx-unprivileged:alpine\n    ports:\n      - "8080:8080"\n    logging: *logging\n  api:\n    image: ghcr.io/ana/pantry-api:1.0.0\n    logging: *logging\n  db:\n    image: postgres:18\n    logging: *logging',
        checks: [
          { label: 'A top-level x-logging: &logging block', re: '^x-[\\w-]+:\\s*&(\\w+)\\s*\\n', flags: 'm' },
          { label: 'It sets a driver', re: '^x-[\\w-]+:\\s*&\\w+\\s*\\n(?:[ \\t]+.*\\n)*?[ \\t]+driver:\\s*\\S', flags: 'm' },
          { label: 'All three services use logging: *logging', re: '(logging:\\s*\\*\\w+[\\s\\S]*){3}' },
          { label: 'web runs nginxinc/nginx-unprivileged', re: inBlock('web', 'image:\\s*["\']?nginxinc/nginx-unprivileged(:\\S+)?'), flags: 'm' },
          { label: 'web maps to container port 8080 now', re: inBlock('web', 'ports:[\\s\\S]*?["\']?\\d+:8080["\']?\\s*[\\n\\]]'), flags: 'm' },
          { label: 'Nothing maps to container port 80 any more', re: '^(?![\\s\\S]*\\d:80["\']?\\s*(\\n|$))' },
        ],
        hint: '&name labels a block and *name reuses it. The unprivileged image listens on 8080, not 80.',
        explain: 'Compose ignores top-level x- keys, so they’re a safe place for anchors. A non-root nginx can’t bind ports below 1024, hence 8080.',
      },
    ],
  ],
  // Windows PowerShell versions of shared items (the phone keeps the bash ones).
  overrides: {
    'L3.7': {
      kind: 'build',
      prompt: 'Pin the API image to TAG, falling back to 1.0.0.',
      answer: ['image:', 'ghcr.io/ana/pantry-api:${TAG:-1.0.0}'],
      distractors: ['ghcr.io/ana/pantry-api:${TAG}', 'ghcr.io/ana/pantry-api:latest'],
      hint: ':- gives a default.',
      explain: '$env:TAG = "1.1.0" followed by docker compose up -d deploys a new release, and the same file still works with no TAG set.',
    },
  },
};

export default unit;
