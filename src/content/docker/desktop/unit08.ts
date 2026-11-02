import type { DesktopUnit } from '../../../engine/types';

// Desktop edition: write-the-code challenges for Docker unit 8 (Environment & secrets).
// lessons[i] runs after lesson i + 1. See docs/CONTENT_GUIDE.md.

/** One command line starting with `start` that also contains every fragment in `parts`, in any order. */
const cmd = (start: string, ...parts: string[]) =>
  `(?:^|\\n)[ \\t]*${start}${parts.map((p) => `(?=[^\\n]*${p})`).join('')}`;
const RUN = 'docker\\s+(?:container\\s+)?run\\b';
const D = '\\s(?:-[a-zA-Z]*d[a-zA-Z]*|--detach)(?!\\S)';
const env = (kv: string) => `\\s(?:-e|--env)[\\s=]+["']?${kv}["']?(?!\\S)`;
/** A line inside service `name`'s block (indented deeper than the name) that matches `body`. Use with flag m. */
const svc = (name: string, body: string) =>
  `^( +)${name}:[ \\t]*\\n(?:\\1[ \\t]+[^\\n]*\\n|[ \\t]*\\n)*?\\1[ \\t]+${body}`;
/** An environment entry in map (KEY: value) or list (- KEY=value) form. */
const envEntry = (key: string, value: string) => `^[ \\t]+(?:-[ \\t]*["']?${key}=|${key}:[ \\t]*)["']?${value}`;

const unit: DesktopUnit = {
  lessons: [
    // L1 ENV in Dockerfiles
    [
      {
        kind: 'write',
        prompt: 'Bake TZ=Europe/London and a DATA_DIR into a Python image, and work in DATA_DIR.',
        starter: '',
        solution: 'FROM python:3.13-slim\nENV TZ=Europe/London\nENV DATA_DIR=/data\nWORKDIR $DATA_DIR\nCMD ["printenv", "TZ"]',
        checks: [
          { label: 'ENV TZ=Europe/London', re: '^ENV\\b[^\\n]*\\sTZ=["\']?Europe/London\\b', flags: 'm' },
          { label: 'ENV DATA_DIR set to a folder', re: '^ENV\\b[^\\n]*\\sDATA_DIR=["\']?/\\S*', flags: 'm' },
          { label: 'WORKDIR reads it as $DATA_DIR', re: '^WORKDIR\\s+\\$(?:\\{DATA_DIR\\}|DATA_DIR\\b)', flags: 'm' },
          { label: 'ENV comes before WORKDIR', re: '^ENV\\b[^\\n]*DATA_DIR=[\\s\\S]*^WORKDIR\\b', flags: 'm' },
        ],
        hint: 'ENV NAME=value; later instructions read it as $NAME.',
        explain: 'ENV values are saved in the image, so later steps and every container started from it see them.',
        output: 'Europe/London',
      },
      {
        kind: 'write',
        prompt: 'The app can’t see APP_VERSION at run time. Fix it, and set NODE_ENV and PORT.',
        starter: 'FROM node:22-alpine\nARG APP_VERSION=3.2.0\nWORKDIR /app\nCOPY . .\nCMD ["node", "server.js"]\n',
        solution:
          'FROM node:22-alpine\nARG APP_VERSION=3.2.0\nENV APP_VERSION=$APP_VERSION\nENV NODE_ENV=production PORT=3000\nWORKDIR /app\nCOPY . .\nEXPOSE $PORT\nCMD ["node", "server.js"]',
        checks: [
          { label: 'Copy the ARG into ENV APP_VERSION', re: '^ENV\\b[^\\n]*\\sAPP_VERSION=["\']?\\$(?:\\{APP_VERSION\\}|APP_VERSION\\b)', flags: 'm' },
          { label: 'ENV NODE_ENV=production', re: '^ENV\\b[^\\n]*\\sNODE_ENV=["\']?production\\b', flags: 'm' },
          { label: 'ENV PORT=3000', re: '^ENV\\b[^\\n]*\\sPORT=["\']?3000\\b', flags: 'm' },
          { label: 'EXPOSE the port, e.g. EXPOSE $PORT', re: '^EXPOSE\\s+(?:\\$\\{?PORT\\}?|3000)\\b', flags: 'm' },
          { label: 'The ENV for APP_VERSION comes after its ARG', re: '^ARG\\s+APP_VERSION\\b[\\s\\S]*^ENV\\b[^\\n]*APP_VERSION=', flags: 'm' },
        ],
        hint: 'ARG only lives during the build. ENV NAME=$NAME keeps its value in the image.',
        explain: 'Now --build-arg APP_VERSION=… still works, and the running app can read process.env.APP_VERSION.',
        output: 'Server 3.2.0 (production) listening on port 3000',
      },
    ],
    // L2 -e & --env-file
    [
      {
        kind: 'write',
        prompt: 'Run shop-api with debug logging and currency EUR set by -e, then print CURRENCY.',
        starter: '',
        solution: 'docker run -d --name shop -e LOG_LEVEL=debug -e CURRENCY=EUR shop-api\ndocker exec shop printenv CURRENCY',
        checks: [
          { label: 'Set LOG_LEVEL=debug with -e', re: cmd(RUN, env('LOG_LEVEL=debug')) },
          { label: 'Set CURRENCY=EUR with -e', re: cmd(RUN, env('CURRENCY=EUR')) },
          { label: 'Run shop-api in the background with a name', re: cmd(RUN, D, '\\s--name[\\s=]+\\w', '\\sshop-api(?::[\\w.-]+)?(?!\\S)') },
          { label: 'Print CURRENCY inside it with docker exec', re: cmd('docker\\s+(?:container\\s+)?exec\\b', '\\s(?:printenv\\s+CURRENCY|env)\\b') },
        ],
        hint: 'One -e per variable, before the image name.',
        explain: '-e sets a variable for this container only and beats any ENV with the same name in the image.',
        output: 'EUR',
      },
      {
        kind: 'write',
        prompt: 'Load app.env, pass STRIPE_KEY from your shell, and override LOG_LEVEL to debug.',
        starter: '# app.env holds:\n# LOG_LEVEL=info\n# CURRENCY=EUR\n$env:STRIPE_KEY = "sk_test_4eC39H"\n',
        solution:
          '# app.env holds:\n# LOG_LEVEL=info\n# CURRENCY=EUR\n$env:STRIPE_KEY = "sk_test_4eC39H"\ndocker run -d --name shop --env-file ./app.env -e STRIPE_KEY -e LOG_LEVEL=debug shop-api',
        checks: [
          { label: 'Load the file with --env-file app.env', re: cmd(RUN, '\\s--env-file[\\s=]+["\']?(?:\\.[\\\\/])?app\\.env["\']?(?!\\S)') },
          { label: 'Copy STRIPE_KEY from the shell with -e and no value', re: cmd(RUN, '\\s(?:-e|--env)[\\s=]+STRIPE_KEY(?!\\S)') },
          { label: 'Override LOG_LEVEL=debug with -e', re: cmd(RUN, env('LOG_LEVEL=debug')) },
          { label: 'Keep the key out of the docker run line', re: `^(?![\\s\\S]*${RUN}[^\\n]*sk_test)` },
        ],
        hint: '-e NAME without =value copies NAME from your shell. -e beats the env file.',
        explain: 'The key never appears in the command (or your history), and a single -e tweaks one value from the file.',
        output: '1f3a5c7e9b2d4f6a8c0e1b3d5f7a9c2e4b6d8f0a1c3e5b7d9f2a4c6e8b0d1f3a',
      },
    ],
    // L3 Compose environment
    [
      {
        kind: 'write',
        prompt: 'Give the worker service QUEUE_NAME orders and LOG_LEVEL info in compose.yaml.',
        starter: 'services:\n  worker:\n    image: shop-worker:2.0\n',
        solution: 'services:\n  worker:\n    image: shop-worker:2.0\n    environment:\n      QUEUE_NAME: orders\n      LOG_LEVEL: info',
        checks: [
          { label: 'An environment: key under worker', re: svc('worker', 'environment:[ \\t]*$'), flags: 'm' },
          { label: 'QUEUE_NAME set to orders', re: envEntry('QUEUE_NAME', 'orders\\b'), flags: 'm' },
          { label: 'LOG_LEVEL set to info', re: envEntry('LOG_LEVEL', 'info\\b'), flags: 'm' },
        ],
        hint: 'Map form is KEY: value; list form is - KEY=value. Either works.',
        explain: 'Compose passes these to the worker container just like -e would.',
        output: 'shop-worker-1  | Listening on queue "orders" (log level: info)',
      },
      {
        kind: 'write',
        prompt: 'Load common.env then api.env into api, and force LOG_LEVEL to warning.',
        starter: 'services:\n  api:\n    image: shop-api:1.5\n',
        solution:
          'services:\n  api:\n    image: shop-api:1.5\n    env_file:\n      - common.env\n      - api.env\n    environment:\n      LOG_LEVEL: warning',
        checks: [
          { label: 'env_file: lists common.env', re: svc('api', 'env_file:[ \\t]*\\n(?:[ \\t]*-[^\\n]*\\n)*?[ \\t]*-[ \\t]*["\']?(?:\\./)?common\\.env'), flags: 'm' },
          { label: 'api.env comes after common.env, so it wins', re: 'common\\.env["\']?[ \\t]*\\n[ \\t]*-[ \\t]*["\']?(?:\\./)?api\\.env' },
          { label: 'environment: sets LOG_LEVEL to warning', re: envEntry('LOG_LEVEL', 'warning\\b'), flags: 'm' },
          { label: 'environment: is under api', re: svc('api', 'environment:[ \\t]*$'), flags: 'm' },
        ],
        hint: 'env_file: takes a list; later files win. environment: beats every file.',
        explain: 'Shared settings live in common.env, api.env refines them, and environment: has the final say.',
        output: 'shop-api-1  | Log level: Warning',
      },
    ],
    // L4 Interpolation & .env
    [
      {
        kind: 'write',
        prompt: 'Let .env or the shell pick api’s image tag and host port, with defaults.',
        starter: 'services:\n  api:\n    image: shop-api:1.4\n    ports:\n      - "5000:8080"\n',
        solution: 'services:\n  api:\n    image: shop-api:${TAG:-latest}\n    ports:\n      - "${API_PORT:-5000}:8080"',
        checks: [
          { label: 'Tag from a variable, default latest: ${TAG:-latest}', re: 'image:[ \\t]*["\']?shop-api:\\$\\{\\w+:?-latest\\}' },
          { label: 'Host port from a variable, default 5000', re: '-[ \\t]*["\']?\\$\\{\\w+:?-5000\\}:8080["\']?' },
          { label: 'No hard-coded 1.4 tag', not: 'shop-api:1.4' },
        ],
        hint: '${NAME:-default} uses the default when NAME is unset or empty.',
        explain: 'With TAG=1.5 in .env, Compose runs shop-api:1.5; with nothing set, it falls back to latest and port 5000.',
        output: '[+] Running 2/2\n ✔ Network shop_default   Created\n ✔ Container shop-api-1   Started',
      },
      {
        kind: 'write',
        prompt: 'Require DB_PASSWORD for postgres and stop with an error if it is missing.',
        starter: '# .env holds DB_PASSWORD and TAG\nservices:\n  db:\n    image: postgres:18\n  api:\n    image: shop-api:1.4\n',
        solution:
          '# .env holds DB_PASSWORD and TAG\nservices:\n  db:\n    image: postgres:18\n    environment:\n      POSTGRES_PASSWORD: ${DB_PASSWORD:?set DB_PASSWORD in .env}\n  api:\n    image: shop-api:${TAG:-latest}\n    environment:\n      DB_PASSWORD: ${DB_PASSWORD}',
        checks: [
          { label: 'POSTGRES_PASSWORD from ${DB_PASSWORD:?…}', re: envEntry('POSTGRES_PASSWORD', '\\$\\{DB_PASSWORD:?\\?'), flags: 'm' },
          { label: 'That variable is under db', re: svc('db', 'environment:[ \\t]*$'), flags: 'm' },
          { label: 'api’s tag comes from TAG', re: 'image:[ \\t]*["\']?shop-api:\\$\\{TAG(?::?[-?][^}]*)?\\}' },
          { label: 'Pass DB_PASSWORD on to the api container too', re: svc('api', '(?:-[ \\t]*["\']?)?\\w+[:=][ \\t]*["\']?\\$\\{DB_PASSWORD'), flags: 'm' },
        ],
        hint: '.env only fills ${…} in the file; containers get only what environment: gives them.',
        explain: 'With :? Compose refuses to start and prints your message instead of booting postgres with an empty password.',
        output: 'error while interpolating services.db.environment.POSTGRES_PASSWORD: required variable DB_PASSWORD is missing a value: set DB_PASSWORD in .env',
      },
    ],
    // L5 Secret files
    [
      {
        kind: 'write',
        prompt: 'Give mariadb its root password from a secret file instead of a variable.',
        starter: 'services:\n  db:\n    image: mariadb:11\n',
        solution:
          'services:\n  db:\n    image: mariadb:11\n    environment:\n      MARIADB_ROOT_PASSWORD_FILE: /run/secrets/root_pw\n    secrets:\n      - root_pw\nsecrets:\n  root_pw:\n    file: ./root_pw.txt',
        checks: [
          { label: 'A top-level secret read from a file', re: '^secrets:[ \\t]*\\n[ \\t]+[\\w.-]+:[ \\t]*\\n[ \\t]+file:[ \\t]*\\S+', flags: 'm' },
          { label: 'db lists that secret under secrets:', re: '^[ \\t]+secrets:[ \\t]*\\n[ \\t]*-[ \\t]*([\\w.-]+)[ \\t]*\\n[\\s\\S]*^secrets:[ \\t]*\\n[ \\t]+\\1:', flags: 'm' },
          {
            label: 'MARIADB_ROOT_PASSWORD_FILE points at /run/secrets/<name>',
            re: '(?:MARIADB_ROOT_PASSWORD_FILE:[ \\t]*|MARIADB_ROOT_PASSWORD_FILE=)["\']?/run/secrets/([\\w.-]+)[\\s\\S]*^secrets:[ \\t]*\\n[ \\t]+\\1:',
            flags: 'm',
          },
        ],
        hint: 'Compose mounts each secret at /run/secrets/<name>; the _FILE variable tells mariadb where to read it.',
        explain: 'The password never sits in an environment variable, so docker inspect and app logs can’t leak it.',
        output: 'shop-db-1  | [Note] mariadbd: ready for connections.',
      },
      {
        kind: 'write',
        prompt: 'Stop leaking the Stripe key: move it into a secret that pay-api reads from a file.',
        starter: '# pay-api reads STRIPE_KEY, or a file path from STRIPE_KEY_FILE\nservices:\n  api:\n    image: pay-api:3.0\n    environment:\n      STRIPE_KEY: sk_live_51Hx9\n',
        solution:
          '# pay-api reads STRIPE_KEY, or a file path from STRIPE_KEY_FILE\nservices:\n  api:\n    image: pay-api:3.0\n    environment:\n      STRIPE_KEY_FILE: /run/secrets/stripe_key\n    secrets:\n      - stripe_key\nsecrets:\n  stripe_key:\n    file: ./stripe_key.txt',
        checks: [
          { label: 'The key itself is gone from compose.yaml', not: 'sk_live_51Hx9' },
          { label: 'A top-level secret with file:', re: '^secrets:[ \\t]*\\n[ \\t]+[\\w.-]+:[ \\t]*\\n[ \\t]+file:[ \\t]*\\S+', flags: 'm' },
          { label: 'api lists the secret', re: svc('api', 'secrets:[ \\t]*\\n[ \\t]*-[ \\t]*[\\w.-]+'), flags: 'm' },
          { label: 'STRIPE_KEY_FILE points at /run/secrets/<name>', re: envEntry('STRIPE_KEY_FILE', '/run/secrets/[\\w.-]+'), flags: 'm' },
        ],
        hint: 'Put the key in a text file next to compose.yaml, declare it under secrets:, and list it in the service.',
        explain: 'The key now lives in one file mounted read-only at /run/secrets, not in the compose file or the container’s environment.',
        output: 'pay-api-1  | Stripe key loaded from /run/secrets/stripe_key',
      },
    ],
  ],
  // Windows PowerShell versions of shared items (the phone keeps the bash ones).
  concepts: {
    2: {
      body: 'docker run -e KEY=value sets a variable for one container and beats the image’s ENV. -e KEY with no value copies KEY from your shell; in PowerShell, set it first with $env:KEY = "value". --env-file ./app.env loads a file with one KEY=value per line.',
      code: 'docker run -e LOG_LEVEL=debug shop-api\n$env:API_KEY = "test-key-7f3k9"\ndocker run -e API_KEY shop-api\ndocker run --env-file ./app.env shop-api',
    },
  },
  overrides: {
    'L2.7': {
      kind: 'order',
      prompt: 'Write app.env with two lines, then read CACHE_TTL.',
      lines: [
        'Set-Content app.env "LOG_LEVEL=info"',
        'Add-Content app.env "CACHE_TTL=300"',
        'docker run --rm --env-file app.env alpine printenv CACHE_TTL',
      ],
      hint: 'One cmdlet replaces the file, the other adds to the end.',
      explain: 'Set-Content starts a fresh file and Add-Content appends to it. Run Set-Content second and it would wipe the CACHE_TTL line. Avoid > and >> here: in Windows PowerShell 5.1 they write UTF-16, which --env-file can’t read.',
      output: '300',
    },
    'L2.4': {
      kind: 'fill',
      prompt: 'Pass your shell’s API_KEY through unchanged.',
      code: '$env:API_KEY = "test-key-7f3k9"\ndocker run --rm -e ___ alpine printenv API_KEY',
      blanks: [{ answer: ['API_KEY'], options: ['API_KEY', '$env:API_KEY', 'API_KEY=API_KEY'] }],
      hint: 'Give the name, not a value.',
      explain: 'With no =value, Docker copies API_KEY from your PowerShell session. $env:API_KEY would be expanded by PowerShell first, so Docker would get the key as a variable name.',
      output: 'test-key-7f3k9',
    },
    'L4.2': {
      kind: 'fill',
      prompt: 'Predict the image each command runs.',
      code: '# .env\nTAG=1.4\n# compose.yaml: image: shop-api:${TAG}\n\ndocker compose up -d\n# runs shop-api:___\n$env:TAG = "2.0"\ndocker compose up -d\n# runs shop-api:___',
      blanks: [
        { answer: ['1.4'], options: ['1.4', '2.0', 'latest'] },
        { answer: ['2.0'], options: ['2.0', '1.4', 'latest'] },
      ],
      hint: 'The shell beats .env.',
      explain: 'With nothing in the shell, Compose uses .env. A variable set in PowerShell wins over the same one in .env.',
    },
    'L4.3': {
      kind: 'build',
      prompt: 'Set TAG to 2.1 in PowerShell, then run docker compose up -d.',
      answer: ['$env:TAG', '=', '"2.1"', ';', 'docker', 'compose', 'up', '-d'],
      distractors: ['export', '-e', '--build-arg'],
      hint: 'PowerShell sets environment variables through $env:.',
      explain: '$env:TAG lasts until you close this PowerShell window (Remove-Item Env:TAG clears it sooner), and the shell beats .env.',
    },
    'boss.8': {
      kind: 'order',
      prompt: 'Pass your shell’s API_KEY to api, check it, clean up.',
      lines: [
        '$env:API_KEY = "test-key-7f3k9"',
        'docker run -d --name api -e API_KEY shop-api',
        'docker exec api printenv API_KEY',
        'docker rm -f api',
      ],
      hint: 'The key must be in your shell before docker run copies it.',
      explain: '-e API_KEY copies the value at docker run, so $env:API_KEY comes first. exec needs api running, and rm -f ends it.',
      output: 'd632fc3ea59ab2e7dcdb41b85e9565aa143f3a86201aaf61585719b4c345e517\ntest-key-7f3k9\napi',
    },
  },
};

export default unit;
