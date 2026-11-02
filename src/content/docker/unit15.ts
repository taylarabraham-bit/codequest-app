import type { Unit } from '../../engine/types';

const UP_SHOP =
  '[+] up 4/4\n ✔ Network shop_default    Created       0.1s\n ✔ Container shop-db-1     Healthy       6.2s\n ✔ Container shop-api-1    Started       6.4s\n ✔ Container shop-web-1    Started       6.5s';

const UP_TOOLS =
  '[+] up 3/3\n ✔ Container shop-db-1      Running       0.0s\n ✔ Container shop-api-1     Running       0.0s\n ✔ Container shop-adminer-1 Started       0.4s';

const WATCH_ON =
  '[+] up 2/2\n ✔ Container shop-db-1     Running       0.0s\n ✔ Container shop-web-1    Started       0.5s\nWatch enabled';

const CONFIG_API = `name: shop
services:
  api:
    command:
      - dotnet
      - watch
      - run
    environment:
      DB_HOST: db
      LOG_LEVEL: debug
    image: acme/api:2.0`;

const MIGRATE_OUT =
  '[+] run 1/1\n ✔ Container shop-db-1  Running       0.0s\n> shop-api@2.0.0 migrate\n> node migrate.js\nApplied 3 migrations';

const LOGS_API =
  'api-1  | info: Microsoft.Hosting.Lifetime[14]\napi-1  |       Now listening on: http://[::]:8080\napi-1  | info: Shop.Api.OrdersController[0]\napi-1  |       GET /orders 200 12ms';

const unit: Unit = {
  title: 'Compose for development',
  blurb: 'Make Compose your dev loop: override files, profiles, live sync, one-off tasks and shared config.',
  lessons: [
    {
      title: 'Override files',
      concept: {
        body: 'docker compose up reads compose.yaml and, if it exists, compose.override.yaml, merged on top. A single value like image or command is replaced, while environment entries merge by name. -f picks the files yourself, later ones winning, and docker compose config prints the merged result.',
        code: '# compose.yaml: what every environment shares\n# compose.override.yaml: your dev extras, loaded automatically\ndocker compose up -d\ndocker compose -f compose.yaml -f compose.prod.yaml up -d\ndocker compose config',
      },
      exercises: [
        {
          kind: 'fill',
          prompt: 'Name the file Compose merges in automatically.',
          code: '# compose.yaml\nservices:\n  api:\n    image: acme/api:2.0\n# ___\nservices:\n  api:\n    command: ["dotnet", "watch", "run"]',
          blanks: [
            {
              answer: ['compose.override.yaml'],
              options: ['compose.override.yaml', 'compose.dev.yaml', 'compose.local.yaml'],
            },
          ],
          hint: 'It overrides the main file.',
          explain: 'Only compose.override.yaml (or the older docker-compose.override.yml) is picked up without a flag. Other names need -f.',
        },
        {
          kind: 'fill',
          prompt: 'Both files set command. Which one runs?',
          code: '# compose.yaml\nservices:\n  api:\n    command: ["dotnet", "Api.dll"]\n# compose.override.yaml\nservices:\n  api:\n    command: ["dotnet", "watch", "run"]\n# api runs ___',
          blanks: [
            { answer: ['dotnet watch run'], options: ['dotnet watch run', 'dotnet Api.dll', 'both commands'] },
          ],
          hint: 'A service has only one command.',
          explain: 'command holds one value, so the override replaces it whole. Lists like command are never mixed together.',
        },
        {
          kind: 'fill',
          prompt: 'Predict api’s environment after the merge.',
          code: '# compose.yaml\n    environment:\n      LOG_LEVEL: info\n      DB_HOST: db\n# compose.override.yaml\n    environment:\n      LOG_LEVEL: debug\n# api gets ___',
          blanks: [
            {
              answer: ['LOG_LEVEL=debug and DB_HOST=db'],
              options: ['LOG_LEVEL=debug and DB_HOST=db', 'only LOG_LEVEL=debug', 'LOG_LEVEL=info and DB_HOST=db'],
            },
          ],
          hint: 'Variables are matched by name.',
          explain: 'environment merges key by key: the override wins for LOG_LEVEL and DB_HOST carries over untouched.',
          output: CONFIG_API,
        },
        {
          kind: 'build',
          prompt: 'Start with the base and prod files, in the background.',
          answer: ['docker', 'compose', '-f', 'compose.yaml', '-f', 'compose.prod.yaml', 'up', '-d'],
          distractors: ['--add', 'compose.override.yaml'],
          hint: 'One -f per file, base first, before the subcommand.',
          explain: 'Each -f is merged on top of the ones before it, so compose.prod.yaml wins any clash with compose.yaml.',
          output: UP_SHOP,
        },
        {
          kind: 'fill',
          prompt: 'You pass -f yourself. Is compose.override.yaml read?',
          code: 'docker compose -f compose.yaml -f compose.prod.yaml up -d\n# compose.override.yaml is read: ___',
          blanks: [{ answer: ['no'], options: ['no', 'yes'] }],
          hint: 'The automatic file is only a default.',
          explain: 'Any -f replaces the default file list, so your dev overrides stay out of the prod run. Add -f compose.override.yaml if you want it.',
        },
        {
          kind: 'build',
          prompt: 'Print the configuration Compose will really use.',
          answer: ['docker', 'compose', 'config'],
          distractors: ['merge', 'inspect'],
          hint: 'A subcommand named after the configuration.',
          explain: 'config shows the files merged and the variables filled in, which settles any question about which value wins.',
          output: CONFIG_API,
        },
        {
          kind: 'fill',
          prompt: 'Clear the ports the base file publishes.',
          code: '# compose.override.yaml\nservices:\n  db:\n    ports: ___ []',
          blanks: [{ answer: ['!reset'], options: ['!reset', '!override', '!delete'] }],
          hint: 'You want the value set back to nothing.',
          explain: 'Ports from both files are normally added together. !reset drops the inherited value; !override would replace it with a new list.',
        },
      ],
    },
    {
      title: 'Profiles',
      concept: {
        body: 'profiles: [tools] keeps a service out of a plain up. --profile tools, or COMPOSE_PROFILES=tools, switches it on, and services with no profiles always start. Naming a profiled service on the command line starts it anyway.',
        code: 'services:\n  api: { build: . }\n  adminer:\n    image: adminer\n    profiles: [tools]\n# docker compose --profile tools up -d',
      },
      exercises: [
        {
          kind: 'fill',
          prompt: 'Put mailpit in the debug profile.',
          code: 'services:\n  mailpit:\n    image: axllent/mailpit\n    ___: [debug]',
          blanks: [{ answer: ['profiles'], options: ['profiles', 'profile', 'tags'] }],
          hint: 'A service can be in several, so the key is plural.',
          explain: 'profiles takes a list, so mailpit could be in [debug, mail]. It starts when any of them is on.',
        },
        {
          kind: 'fill',
          prompt: 'Plain docker compose up -d. What starts?',
          code: 'services:\n  api:\n    build: .\n  adminer:\n    image: adminer\n    profiles: [tools]\n# starts: ___',
          blanks: [{ answer: ['api only'], options: ['api only', 'api and adminer', 'nothing'] }],
          hint: 'Which service has no profiles key?',
          explain: 'Services without profiles always run. adminer waits until its tools profile is switched on.',
        },
        {
          kind: 'build',
          prompt: 'Start the app plus the tools profile.',
          answer: ['docker', 'compose', '--profile', 'tools', 'up', '-d'],
          distractors: ['--profiles', '-p'],
          hint: 'A global flag, so it goes before up.',
          explain: '-p is the project name, not the profile. --profile tools adds adminer to the usual services.',
          output: UP_TOOLS,
        },
        {
          kind: 'fill',
          prompt: 'Switch on two profiles from .env.',
          code: '# .env\n___=tools,debug',
          blanks: [{ answer: ['COMPOSE_PROFILES'], options: ['COMPOSE_PROFILES', 'PROFILES', 'COMPOSE_PROFILE'] }],
          hint: 'COMPOSE_, then the plural.',
          explain: 'Compose reads COMPOSE_PROFILES from .env or your shell, so each teammate can pick the extras they want without typing flags.',
        },
        {
          kind: 'build',
          prompt: 'Run the seed service once, though it’s in a profile.',
          answer: ['docker', 'compose', 'run', '--rm', 'seed'],
          distractors: ['exec', 'start'],
          hint: 'A one-off container, removed when it exits.',
          explain: 'Naming seed on the command line turns on its profile for that command. --rm cleans the container up afterwards.',
          output: '[+] run 1/1\n ✔ Container shop-db-1  Running       0.0s\nSeeded 120 products',
        },
        {
          kind: 'fill',
          prompt: 'Which services does --profile debug start?',
          code: 'services:\n  api: { build: . }\n  db: { image: postgres:18 }\n  mailpit: { image: axllent/mailpit, profiles: [debug] }\n  adminer: { image: adminer, profiles: [tools] }\n# docker compose --profile debug up -d starts ___',
          blanks: [
            { answer: ['api, db and mailpit'], options: ['api, db and mailpit', 'mailpit only', 'all four'] },
          ],
          hint: 'A profile adds services; it doesn’t remove the others.',
          explain: 'Unprofiled services always run, debug adds mailpit, and adminer stays off because tools isn’t on.',
        },
        {
          kind: 'build',
          prompt: 'Start the app with both tools and debug on.',
          answer: ['docker', 'compose', '--profile', 'tools', '--profile', 'debug', 'up', '-d'],
          alt: [['docker', 'compose', '--profile', 'debug', '--profile', 'tools', 'up', '-d']],
          distractors: ['tools,debug', '-p'],
          hint: 'Repeat the flag once per profile.',
          explain: '--profile can repeat. COMPOSE_PROFILES=tools,debug does the same with a comma list.',
        },
      ],
    },
    {
      title: 'Watch & hot reload',
      concept: {
        body: 'A bind mount like ./src:/app/src shows edits at once, if the app reloads itself. docker compose watch goes further: under develop.watch, sync copies changed files into the container, rebuild builds a new image and replaces it, and sync+restart copies then restarts.',
        code: 'develop:\n  watch:\n    - action: sync\n      path: ./src\n      target: /app/src\n    - { action: rebuild, path: package.json }',
      },
      exercises: [
        {
          kind: 'build',
          prompt: 'Start the app and watch for file changes.',
          answer: ['docker', 'compose', 'watch'],
          alt: [['docker', 'compose', 'up', '--watch']],
          distractors: ['up', '--watch', '--reload'],
          hint: 'A subcommand named for what it does.',
          explain: 'watch starts the services, then follows the paths under develop.watch. up --watch turns the same watching on as part of a normal up.',
          output: WATCH_ON,
        },
        {
          kind: 'order',
          prompt: 'Sync ./web into nginx: action, then path, then target.',
          lines: [
            '    develop:',
            '      watch:',
            '        - action: sync',
            '          path: ./web',
            '          target: /usr/share/nginx/html',
          ],
          hint: 'develop holds watch, and watch holds a list of rules.',
          explain: 'path is on your machine, relative to the compose file, and target is inside the container. Saving a file copies it straight in.',
          output: WATCH_ON,
        },
        {
          kind: 'fill',
          prompt: 'New packages need a fresh image. Type the action.',
          code: '        - action: ___\n          path: package.json',
          blanks: [{ answer: ['rebuild'] }],
          hint: 'Copying one file won’t run npm ci again.',
          explain: 'rebuild runs the image build and swaps in a new container, the same as up --build for that one service.',
        },
        {
          kind: 'fill',
          prompt: 'Config is read only at startup. Pick the action.',
          code: '        - action: ___\n          path: ./config\n          target: /app/config',
          blanks: [{ answer: ['sync+restart'], options: ['sync+restart', 'sync', 'rebuild'] }],
          hint: 'Copy the files, then make the app read them again.',
          explain: 'sync+restart copies the change and restarts the container, which is quicker than a rebuild when the image itself hasn’t changed.',
        },
        {
          kind: 'fill',
          prompt: 'Type the key that skips node_modules/.',
          code: '        - action: sync\n          path: .\n          target: /app\n          ___:\n            - node_modules/',
          blanks: [{ answer: ['ignore'] }],
          hint: 'What .dockerignore does, as a key.',
          explain: 'ignore paths are relative to path. Without it, syncing your host’s node_modules would clobber the container’s Linux build of it.',
        },
        {
          kind: 'fix',
          prompt: 'Compose rejects this rule. Fix the key.',
          code: '        - action: sync\n          path: ./src\n          [[dest]]: /app/src',
          fix: 'target',
          options: ['target', 'to', 'mount'],
          hint: 'The same word as the container side of a long-form volume.',
          explain: 'sync needs target, the folder inside the container. rebuild rules don’t, since they rebuild the whole image.',
        },
        {
          kind: 'order',
          prompt: 'Hot-reload with dotnet watch: image, working_dir, volumes, command.',
          lines: [
            '  api:',
            '    image: mcr.microsoft.com/dotnet/sdk:10.0',
            '    working_dir: /src',
            '    volumes:',
            '      - ./:/src',
            '    command: ["dotnet", "watch", "run"]',
          ],
          hint: 'The mount line belongs under volumes.',
          explain: 'The bind mount makes your folder the container’s /src, and dotnet watch recompiles each time you save.',
          output: 'api-1  | dotnet watch 🔥 Hot reload enabled.\napi-1  | dotnet watch 🚀 Started',
        },
      ],
    },
    {
      title: 'Ready, run, logs',
      concept: {
        body: 'condition: service_healthy waits on a healthcheck, and start_period gives a slow service grace time first. docker compose run --rm api npm run migrate runs a one-off task in a new container and deletes it after. exec runs inside the container that’s already up.',
        code: 'depends_on:\n  db:\n    condition: service_healthy\n    restart: true\n# docker compose run --rm api npm run migrate\n# docker compose logs -f --tail 20 api',
      },
      exercises: [
        {
          kind: 'build',
          prompt: 'Run the migrations once, then delete the container.',
          answer: ['docker', 'compose', 'run', '--rm', 'api', 'npm', 'run', 'migrate'],
          distractors: ['exec', '-d'],
          hint: 'run, the cleanup flag, the service, then the command.',
          explain: 'run starts a new api container with your command instead of its usual one, and starts db first because api depends on it.',
          output: MIGRATE_OUT,
        },
        {
          kind: 'order',
          prompt: 'Check Postgres: test, then interval, then start_period.',
          lines: [
            '  db:',
            '    image: postgres:18',
            '    healthcheck:',
            '      test: ["CMD", "pg_isready", "-U", "postgres"]',
            '      interval: 5s',
            '      start_period: 30s',
          ],
          hint: 'The check settings all nest under healthcheck.',
          explain: 'Failures during start_period don’t count toward retries, so a database that needs 20 seconds to initialise isn’t marked unhealthy.',
          output: UP_SHOP,
        },
        {
          kind: 'fill',
          prompt: 'api must wait until migrate exits with 0.',
          code: '  api:\n    depends_on:\n      migrate:\n        condition: ___',
          blanks: [
            {
              answer: ['service_completed_successfully'],
              options: ['service_completed_successfully', 'service_healthy', 'service_stopped'],
            },
          ],
          hint: 'migrate is a job that finishes, not a server.',
          explain: 'service_completed_successfully waits for the container to exit with code 0. If migrate fails, api never starts.',
        },
        {
          kind: 'build',
          prompt: 'Follow api’s logs, starting with the last 20 lines.',
          answer: ['docker', 'compose', 'logs', '-f', '--tail', '20', 'api'],
          alt: [['docker', 'compose', 'logs', '--tail', '20', '-f', 'api']],
          distractors: ['--lines', 'exec'],
          hint: 'Follow, plus a flag for how much history.',
          explain: 'Without --tail you’d scroll through everything since the container started before the new lines arrive.',
          output: LOGS_API,
        },
        {
          kind: 'fill',
          prompt: 'api is already up. Type the subcommand for a shell in it.',
          code: 'docker compose ___ api sh',
          blanks: [{ answer: ['exec'] }],
          hint: 'Run inside the running container, not a new one.',
          explain: 'compose exec gives you a terminal by default, no -it needed. run would start a second api container instead.',
        },
        {
          kind: 'fix',
          prompt: 'run starts web but localhost:8080 is dead. Fix the flag.',
          code: 'docker compose run --rm [[--publish-all]] web',
          fix: '--service-ports',
          options: ['--service-ports', '--expose', '--ports'],
          hint: 'Use the ports the service already declares.',
          explain: 'run skips a service’s ports: so one-off tasks don’t clash with the running app. --service-ports publishes them anyway.',
        },
        {
          kind: 'fill',
          prompt: 'restart: true is set. You restart db. What about api?',
          code: '  api:\n    depends_on:\n      db:\n        condition: service_healthy\n        restart: true\n# docker compose restart db\n# api ___',
          blanks: [{ answer: ['restarts too'], options: ['restarts too', 'keeps running', 'stops'] }],
          hint: 'restart: true is about the dependency changing.',
          explain: 'With restart: true, Compose restarts api after it restarts or recreates db, so api reconnects instead of holding dead connections.',
        },
      ],
    },
    {
      title: 'Sharing config',
      concept: {
        body: 'include: pulls in another Compose file whose relative paths stay relative to that file. extends: copies one service’s settings into another and lets you add or override some. env_file entries can be marked required: false for files only some people have.',
        code: 'include:\n  - ./db/compose.yaml\nservices:\n  worker:\n    extends: { file: common.yaml, service: node-base }\n    env_file: [{ path: ./local.env, required: false }]',
      },
      exercises: [
        {
          kind: 'fill',
          prompt: 'Pull in the db stack’s own compose file.',
          code: '___:\n  - ./db/compose.yaml\nservices:\n  api:\n    build: .\n    depends_on: [db]',
          blanks: [{ answer: ['include'], options: ['include', 'import', 'extends'] }],
          hint: 'A top-level key, like #include.',
          explain: 'include loads db/compose.yaml as part of this project, so api can depend on its db service as if you had written it here.',
        },
        {
          kind: 'fill',
          prompt: 'db/compose.yaml mounts ./init.sql. Where is ./?',
          code: '# compose.yaml\ninclude:\n  - ./db/compose.yaml\n# db/compose.yaml\n    volumes:\n      - ./init.sql:/docker-entrypoint-initdb.d/init.sql\n# ./ means ___',
          blanks: [{ answer: ['db/'], options: ['db/', 'the main project folder'] }],
          hint: 'The db team wrote that file without knowing where it’d be included.',
          explain: 'Each included file keeps its own folder as its base, so it works the same whether you run it alone or include it.',
        },
        {
          kind: 'type',
          prompt: 'Reuse the node-base service from common.yaml.',
          template: '  worker:\n    extends:\n      file: common.yaml\n      ___\n    command: ["npm", "run", "worker"]',
          accept: ['service: node-base', 'service: "node-base"', "service: 'node-base'"],
          hint: 'Which service in that file to copy.',
          explain: 'worker gets node-base’s image, environment and volumes, and its own command replaces node-base’s.',
        },
        {
          kind: 'fill',
          prompt: 'worker extends node-base. What does worker log at?',
          code: '# common.yaml\n  node-base:\n    environment:\n      LOG_LEVEL: info\n# compose.yaml\n  worker:\n    extends: { file: common.yaml, service: node-base }\n    environment:\n      LOG_LEVEL: warn\n# worker uses ___',
          blanks: [{ answer: ['warn'], options: ['warn', 'info'] }],
          hint: 'The service doing the extending gets the last word.',
          explain: 'extends merges like an override file: worker’s own LOG_LEVEL replaces the copied one, and other variables are kept.',
        },
        {
          kind: 'fill',
          prompt: 'TAG is set but empty. Which form still gives dev?',
          code: '# .env\nTAG=\n# compose.yaml\n    image: acme/api:___',
          blanks: [{ answer: ['${TAG:-dev}'], options: ['${TAG:-dev}', '${TAG-dev}', '${TAG?dev}'] }],
          hint: 'The colon is what treats empty like unset.',
          explain: '${TAG-dev} only defaults when TAG is unset, so an empty TAG gives acme/api: and fails. ${TAG:-dev} covers both.',
        },
        {
          kind: 'fix',
          prompt: 'Teammates without local.env can’t start. Fix it.',
          code: '    env_file:\n      - path: ./local.env\n        required: [[true]]',
          fix: 'false',
          options: ['false', 'optional'],
          hint: 'Make the file nice to have, not a must.',
          explain: 'With required: false, Compose skips a missing file instead of failing, so personal settings stay optional.',
        },
        {
          kind: 'type',
          prompt: 'Read variables from .env.dev instead of .env.',
          template: '___ up -d',
          accept: ['docker compose --env-file .env.dev', 'docker compose --env-file=.env.dev'],
          hint: 'A global flag before up, naming the file.',
          explain: '--env-file swaps the file used for ${…} interpolation. It doesn’t pass variables into containers; env_file does that.',
          output: UP_SHOP,
        },
      ],
    },
  ],
  boss: [
    {
      kind: 'build',
      prompt: 'Watch the app with the debug profile on.',
      answer: ['docker', 'compose', '--profile', 'debug', 'watch'],
      distractors: ['--watch', '-p'],
      hint: 'The profile flag comes before the subcommand.',
      explain: '--profile works with every subcommand, so watch starts mailpit along with the usual services.',
      output: WATCH_ON,
    },
    {
      kind: 'fix',
      prompt: 'Compose rejects the action. Fix it.',
      code: '        - action: [[restart+sync]]\n          path: ./config\n          target: /app/config',
      fix: 'sync+restart',
      options: ['sync+restart', 'sync,restart', 'resync'],
      hint: 'The steps happen in a certain order.',
      explain: 'The action is written in the order it happens: sync the files, then restart the container.',
    },
    {
      kind: 'fill',
      prompt: 'Print the container’s $HOME, not yours.',
      code: 'command: ["sh", "-c", "echo ___HOME"]',
      blanks: [{ answer: ['$$'] }],
      hint: 'Escape the dollar so Compose leaves it alone.',
      explain: 'Compose fills in $HOME from your machine. $$ becomes a plain $, so the container’s shell expands it to /root.',
      output: '/root',
    },
    {
      kind: 'order',
      prompt: 'api waits for migrate to finish, then for a healthy db.',
      lines: [
        '  api:',
        '    depends_on:',
        '      migrate:',
        '        condition: service_completed_successfully',
        '      db:',
        '        condition: service_healthy',
      ],
      hint: 'Each dependency gets its own condition under it.',
      explain: 'Both conditions must hold before api starts: migrate exited 0 and db’s healthcheck passes.',
    },
    {
      kind: 'type',
      prompt: 'Drop the ports api inherits from compose.yaml.',
      template: '# compose.override.yaml\nservices:\n  api:\n    ___',
      accept: ['ports: !reset []'],
      hint: 'The key, then the YAML tag that clears it.',
      explain: 'Ports from both files are added together, so only !reset can take the base file’s away.',
    },
    {
      kind: 'fill',
      prompt: 'Both set LOG_LEVEL. Which value does api get?',
      code: '# compose.yaml        LOG_LEVEL: info\n# compose.override.yaml  LOG_LEVEL: debug\n# compose.ci.yaml     LOG_LEVEL: warn\ndocker compose -f compose.yaml -f compose.ci.yaml config\n# LOG_LEVEL: ___',
      blanks: [{ answer: ['warn'], options: ['warn', 'debug', 'info'] }],
      hint: 'Which files are actually read with -f?',
      explain: 'With -f, the override file is skipped, and compose.ci.yaml is last, so warn wins.',
    },
    {
      kind: 'build',
      prompt: 'Run api’s tests in a throwaway container, without its dependencies.',
      answer: ['docker', 'compose', 'run', '--rm', '--no-deps', 'api', 'dotnet', 'test'],
      alt: [['docker', 'compose', 'run', '--no-deps', '--rm', 'api', 'dotnet', 'test']],
      distractors: ['exec', '-d'],
      hint: 'Two flags before the service: cleanup and skip-deps.',
      explain: '--no-deps skips starting db and migrate, which unit tests don’t need, and --rm deletes the container afterwards.',
      output: 'Passed!  - Failed:     0, Passed:    42, Skipped:     0, Total:    42',
    },
    {
      kind: 'fill',
      prompt: 'seed is in the tools profile. Does this run it?',
      code: 'docker compose run --rm seed\n# seed runs: ___',
      blanks: [{ answer: ['yes'], options: ['yes', 'no, tools is off'] }],
      hint: 'You named the service yourself.',
      explain: 'Targeting a service by name switches on its profiles for that command, so one-off tools don’t need --profile.',
      output: 'Seeded 120 products',
    },
    {
      kind: 'fix',
      prompt: 'api connects before Postgres is ready. Fix the condition.',
      code: '  api:\n    depends_on:\n      db:\n        condition: [[service_started]]\n  db:\n    image: postgres:18\n    healthcheck:\n      test: ["CMD", "pg_isready", "-U", "postgres"]',
      fix: 'service_healthy',
      options: ['service_healthy', 'service_completed_successfully', 'service_ready'],
      hint: 'db has a healthcheck. Use it.',
      explain: 'service_started only waits for the container to exist. service_healthy waits until pg_isready succeeds.',
      output: UP_SHOP,
    },
    {
      kind: 'type',
      prompt: 'Follow the logs of api and worker together.',
      accept: [
        'docker compose logs -f api worker',
        'docker compose logs -f worker api',
        'docker compose logs --follow api worker',
        'docker compose logs --follow worker api',
      ],
      hint: 'logs, the follow flag, then both service names.',
      explain: 'Lines from both are interleaved and prefixed api-1 | or worker-1 |, which helps when a request crosses both.',
    },
  ],
};

export default unit;
