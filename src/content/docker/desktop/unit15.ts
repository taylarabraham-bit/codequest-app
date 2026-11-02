import type { DesktopUnit } from '../../../engine/types';

// Desktop edition: write-the-code challenges for Docker unit 15 (Compose for development).
// lessons[i] runs after lesson i + 1. See docs/CONTENT_GUIDE.md.

/** Regex source: inside the YAML block `name`, some line starts with `line`. Any key order. Use flags 'm'. */
const inBlock = (name: string, line: string) =>
  `^([ \\t]*)${name}:[ \\t]*\\n(?:\\1[ \\t]+.*\\n|[ \\t]*\\n)*?\\1[ \\t]+${line}`;

/** Regex source: a `profiles:` entry naming `profile`, flow or block list. Use flags 'm'. */
const profile = (p: string) => `profiles:\\s*(\\[[^\\]\\n]*\\b${p}\\b|\\n(?:[ \\t]+-.*\\n)*?[ \\t]+-[ \\t]*["']?${p}\\b)`;

const unit: DesktopUnit = {
  lessons: [
    // L1 Override files
    [
      {
        kind: 'write',
        prompt: 'Write compose.override.yaml: build web locally, publish 3000 and log at debug.',
        starter:
          '# compose.yaml already has:\n#   services:\n#     web:\n#       image: acme/shop:1.0\n#       environment:\n#         LOG_LEVEL: info\n',
        solution:
          '# compose.yaml already has:\n#   services:\n#     web:\n#       image: acme/shop:1.0\n#       environment:\n#         LOG_LEVEL: info\nservices:\n  web:\n    build: .\n    ports:\n      - "3000:3000"\n    environment:\n      LOG_LEVEL: debug',
        checks: [
          { label: 'Start with services: and the same web service', re: '^services:\\s*\\n[ \\t]+web:', flags: 'm' },
          { label: 'web is built from . here', re: inBlock('web', 'build:'), flags: 'm' },
          { label: 'Publish port 3000', re: '^[ \\t]+-[ \\t]*["\']?(\\d+\\.\\d+\\.\\d+\\.\\d+:)?3000:3000\\b', flags: 'm' },
          { label: 'Override LOG_LEVEL to debug', re: '^[ \\t]+-?[ \\t]*LOG_LEVEL[:=][ \\t]*["\']?debug\\b', flags: 'm' },
        ],
        hint: 'An override file has the same shape as compose.yaml, with only what changes.',
        explain: 'docker compose up merges this file on top. LOG_LEVEL merges by name, so debug wins, and the base file stays production-ready.',
      },
      {
        kind: 'write',
        prompt: 'Check the merged prod config, then start it, skipping your dev override.',
        starter: '',
        solution:
          'docker compose -f compose.yaml -f compose.prod.yaml config\ndocker compose -f compose.yaml -f compose.prod.yaml up -d',
        checks: [
          { label: 'Print the merge with docker compose … config', re: 'docker\\s+compose\\s[^\\n]*\\sconfig\\b' },
          { label: 'Start it with up -d', re: 'docker\\s+compose\\s[^\\n]*\\sup\\s+(-d|--detach)\\b' },
          { label: 'Both commands: -f compose.yaml, then -f compose.prod.yaml', re: '(docker\\s+compose\\s+(-f|--file)\\s+compose\\.yaml\\s+(-f|--file)\\s+compose\\.prod\\.yaml\\s[\\s\\S]*){2}' },
          { label: 'No compose.override.yaml', not: 'compose.override.yaml' },
        ],
        hint: 'With -f, Compose loads only the files you name, in order, later ones winning.',
        explain: 'Naming files with -f turns off the automatic override, so dev-only settings stay out of production.',
      },
    ],
    // L2 Profiles
    [
      {
        kind: 'write',
        prompt: 'Keep adminer and mailpit out of a plain up by giving them a tools profile.',
        starter:
          'services:\n  api:\n    build: .\n  db:\n    image: postgres:18\n  adminer:\n    image: adminer\n    ports: ["8081:8080"]\n  mailpit:\n    image: axllent/mailpit\n    ports: ["8025:8025"]\n',
        solution:
          'services:\n  api:\n    build: .\n  db:\n    image: postgres:18\n  adminer:\n    image: adminer\n    ports: ["8081:8080"]\n    profiles: [tools]\n  mailpit:\n    image: axllent/mailpit\n    ports: ["8025:8025"]\n    profiles: [tools]',
        checks: [
          { label: 'adminer: profiles: [tools]', re: inBlock('adminer', profile('tools')), flags: 'm' },
          { label: 'mailpit: profiles: [tools]', re: inBlock('mailpit', profile('tools')), flags: 'm' },
          { label: 'api and db have no profile, so they always start', re: '^(?![\\s\\S]*profiles:[\\s\\S]*profiles:[\\s\\S]*profiles:)' },
        ],
        hint: 'profiles takes a list, even for a single name.',
        explain: 'Services without profiles always start. adminer and mailpit now start only with --profile tools.',
      },
      {
        kind: 'write',
        prompt: 'Start the stack with the tools and debug profiles: with flags, then with a variable.',
        starter: '',
        solution:
          'docker compose --profile tools --profile debug up -d\n$env:COMPOSE_PROFILES = "tools,debug"\ndocker compose up -d',
        checks: [
          { label: 'Repeat --profile for tools and debug', re: 'docker\\s+compose\\s[^\\n]*--profile[\\s=]+(tools|debug)\\s[^\\n]*--profile[\\s=]+(tools|debug)\\s[^\\n]*up\\b' },
          { label: 'Set COMPOSE_PROFILES to tools,debug', re: 'COMPOSE_PROFILES\\s*=\\s*["\']?(tools,debug|debug,tools)\\b' },
          { label: 'Then a plain docker compose up -d', re: 'COMPOSE_PROFILES[^\\n]*\\n[\\s\\S]*docker\\s+compose\\s+up\\s+(-d|--detach)\\b' },
        ],
        hint: 'In PowerShell, set a variable for this session with $env:NAME = "value".',
        explain: 'COMPOSE_PROFILES takes a comma list and lasts for the session (or lives in .env), so you stop typing the flags.',
      },
    ],
    // L3 Watch & hot reload
    [
      {
        kind: 'write',
        prompt: 'Add watch rules to web: sync ./src, rebuild when package.json changes.',
        starter: 'services:\n  web:\n    build: .\n    ports:\n      - "5173:5173"\n',
        solution:
          'services:\n  web:\n    build: .\n    ports:\n      - "5173:5173"\n    develop:\n      watch:\n        - action: sync\n          path: ./src\n          target: /app/src\n        - action: rebuild\n          path: package.json',
        checks: [
          { label: 'develop: then watch: inside web', re: inBlock('web', 'develop:\\s*\\n[ \\t]+watch:'), flags: 'm' },
          { label: 'A sync rule for ./src', re: '(?=[^-]*action:\\s*sync\\s*[\\n,}])[^-]*path:\\s*["\']?(\\./)?src\\b' },
          { label: 'with target: /app/src', re: 'target:\\s*["\']?/app/src\\b' },
          { label: 'A rebuild rule for package.json', re: '(?=[^-]*action:\\s*rebuild\\b)[^-]*path:\\s*["\']?(\\./)?package\\.json\\b' },
        ],
        hint: 'watch is a list; each rule has action, path and (for sync) target.',
        explain: 'docker compose watch copies edits in src straight into the container, and rebuilds the image when dependencies change.',
      },
      {
        kind: 'write',
        prompt: 'Sync the api code but not its tests, and restart when appsettings.json changes.',
        starter: 'services:\n  api:\n    build: .\n    develop:\n      watch:\n',
        solution:
          'services:\n  api:\n    build: .\n    develop:\n      watch:\n        - action: sync\n          path: ./src\n          target: /app/src\n          ignore:\n            - tests/\n        - action: sync+restart\n          path: ./appsettings.json\n          target: /app/appsettings.json',
        checks: [
          { label: 'A sync rule from ./src to /app/src', re: 'action:\\s*sync\\s*\\n(?:[ \\t]+(?!-).*\\n)*?[ \\t]+path:\\s*["\']?(\\./)?src' },
          { label: 'ignore: the tests folder', re: 'ignore:\\s*(\\[\\s*["\']?(\\./)?tests/?|\\n[ \\t]+-[ \\t]*["\']?(\\./)?tests/?)' },
          { label: 'action: sync+restart for appsettings.json', re: 'action:\\s*sync\\+restart[\\s\\S]*?path:\\s*["\']?(\\./)?appsettings\\.json|path:\\s*["\']?(\\./)?appsettings\\.json["\']?\\s*\\n\\s*action:\\s*sync\\+restart' },
          { label: 'Give that rule a target in /app', re: 'target:\\s*["\']?/app/appsettings\\.json' },
        ],
        hint: 'ignore paths are relative to the rule’s path. Config is read at startup, so it needs a restart.',
        explain: 'Plain sync can’t help a file that is only read at startup. sync+restart copies it, then restarts the container.',
      },
    ],
    // L4 Ready, run, logs
    [
      {
        kind: 'write',
        prompt: 'Make the queue service wait for a healthy Redis that gets 10 seconds to start.',
        starter: 'services:\n  queue:\n    build: .\n  redis:\n    image: redis:8\n',
        solution:
          'services:\n  queue:\n    build: .\n    depends_on:\n      redis:\n        condition: service_healthy\n  redis:\n    image: redis:8\n    healthcheck:\n      test: ["CMD", "redis-cli", "ping"]\n      interval: 5s\n      start_period: 10s',
        checks: [
          { label: 'A healthcheck on redis that runs redis-cli ping', re: inBlock('redis', 'healthcheck:\\s*\\n[ \\t]+(?:.*\\n[ \\t]+)*?test:[^\\n]*redis-cli[^\\n]*ping'), flags: 'm' },
          { label: 'start_period: 10s', re: 'start_period:\\s*["\']?10s\\b' },
          { label: 'queue depends_on redis with condition: service_healthy', re: inBlock('queue', 'depends_on:\\s*\\n[ \\t]+redis:\\s*\\n[ \\t]+condition:\\s*service_healthy'), flags: 'm' },
        ],
        hint: 'The healthcheck goes on the service being waited for; depends_on goes on the one that waits.',
        explain: 'Failures during start_period don’t count against retries, so a slow start isn’t marked unhealthy too early.',
      },
      {
        kind: 'write',
        prompt: 'Start and wait, run migrations once, open a shell in api, then follow its logs.',
        starter: '',
        solution:
          'docker compose up -d --wait\ndocker compose run --rm api npm run migrate\ndocker compose exec api sh\ndocker compose logs -f --tail 20 api',
        checks: [
          { label: 'docker compose up -d --wait', re: 'docker\\s+compose\\s+up\\s+(?=[^\\n]*(-d|--detach)\\b)[^\\n]*--wait\\b' },
          { label: 'A one-off run --rm api npm run migrate', re: 'docker\\s+compose\\s+run\\s+--rm\\s+api\\s+npm\\s+run\\s+migrate\\b' },
          { label: 'A shell in the running api with exec', re: 'docker\\s+compose\\s+exec\\s+api\\s+(sh|bash|/bin/sh|/bin/bash)\\b' },
          { label: 'Follow the last lines of api’s logs', re: 'docker\\s+compose\\s+logs\\s+(?=[^\\n]*(-f|--follow)\\b)(?=[^\\n]*(--tail|-n)[\\s=]+\\d+)[^\\n]*\\bapi\\s*$', flags: 'm' },
        ],
        hint: 'run starts a new container, exec joins the one that’s up. --wait returns once services are healthy.',
        explain: 'run --rm leaves no stopped container behind, exec reuses api, and --tail keeps logs -f from replaying everything.',
      },
    ],
    // L5 Sharing config
    [
      {
        kind: 'write',
        prompt: 'Pull in ./db/compose.yaml and ./cache/compose.yaml, then define the api service.',
        starter: '',
        solution: 'include:\n  - ./db/compose.yaml\n  - ./cache/compose.yaml\nservices:\n  api:\n    build: .\n    depends_on: [db, cache]',
        checks: [
          { label: 'A top-level include:', re: '^include:', flags: 'm' },
          { label: 'Include ./db/compose.yaml', re: '^[ \\t]+-[ \\t]*["\']?(path:\\s*)?(\\./)?db/compose\\.yaml', flags: 'm' },
          { label: 'Include ./cache/compose.yaml', re: '^[ \\t]+-[ \\t]*["\']?(path:\\s*)?(\\./)?cache/compose\\.yaml', flags: 'm' },
          { label: 'An api service under services:', re: '^services:\\s*\\n[\\s\\S]*^[ \\t]+api:', flags: 'm' },
        ],
        hint: 'include: is a list of file paths, at the top level next to services:.',
        explain: 'Each included file keeps its own relative paths, so the db and cache teams can own their parts of the stack.',
      },
      {
        kind: 'write',
        prompt: 'Remove the repetition with extends, and give mailer an optional ./local.env.',
        starter:
          '# common.yaml defines service node-base: image, working_dir and volumes\nservices:\n  mailer:\n    image: node:22-alpine\n    working_dir: /app\n    volumes: ["./:/app"]\n    command: node mailer.js\n  resizer:\n    image: node:22-alpine\n    working_dir: /app\n    volumes: ["./:/app"]\n    command: node resizer.js\n',
        solution:
          '# common.yaml defines service node-base: image, working_dir and volumes\nservices:\n  mailer:\n    extends:\n      file: common.yaml\n      service: node-base\n    command: node mailer.js\n    env_file:\n      - path: ./local.env\n        required: false\n  resizer:\n    extends: { file: common.yaml, service: node-base }\n    command: node resizer.js',
        checks: [
          { label: 'Both services extend node-base from common.yaml', re: '(extends:(?=[^\\n]*\\{|\\s*\\n)[\\s\\S]*?(file:\\s*["\']?(\\./)?common\\.yaml[\\s\\S]*?service:\\s*node-base|service:\\s*node-base[\\s\\S]*?file:\\s*["\']?(\\./)?common\\.yaml)[\\s\\S]*){2}' },
          { label: 'Drop the copied image, working_dir and volumes', re: '^(?![\\s\\S]*(image:\\s*node|working_dir:|volumes:))' },
          { label: 'Keep each service’s own command', re: 'mailer\\.js[\\s\\S]*resizer\\.js|resizer\\.js[\\s\\S]*mailer\\.js' },
          { label: 'mailer: env_file ./local.env with required: false', re: inBlock('mailer', 'env_file:[\\s\\S]*?path:\\s*["\']?(\\./)?local\\.env["\']?[\\s\\S]*?required:\\s*false'), flags: 'm' },
        ],
        hint: 'extends takes file and service. A long-form env_file entry has path and required.',
        explain: 'extends copies node-base’s settings and lets each service add its own command. A missing optional env file is skipped, not an error.',
      },
    ],
  ],
  // Windows PowerShell versions of shared items (the phone keeps the bash ones).
  overrides: {
    'boss.3': {
      kind: 'fill',
      prompt: 'Print the container’s $HOME, not yours.',
      code: 'command: ["sh", "-c", "echo ___HOME"]',
      blanks: [{ answer: ['$$'] }],
      hint: 'Escape the dollar so Compose leaves it alone.',
      explain: 'Compose fills in $HOME from your machine (on Windows HOME is usually unset, so you’d get a blank and a warning). $$ becomes a plain $, so the container’s shell expands it to /root.',
      output: '/root',
    },
  },
};

export default unit;
