import type { Unit } from '../../engine/types';

// Made-up but consistent container ids, times and numbers, reused so outputs agree.
const LOGS_T = `2026-10-26T09:14:01.204118733Z info: Orders[0] Order 4211 placed
2026-10-26T09:14:01.893502112Z warn: Orders[0] Stock low for SKU-88
2026-10-26T09:14:02.011734560Z fail: Orders[0] Payment gateway timed out`;

const STATS_MEM = `NAME      MEM USAGE / LIMIT
api       182.4MiB / 512MiB
db        96.1MiB / 7.66GiB
web       9.8MiB / 7.66GiB`;

const STATS_CPU = `NAME      CPU %     MEM %
api       12.41%    35.63%
db        1.07%     1.23%
web       0.02%     0.12%`;

const TOP_API = `UID     PID     PPID    C    STIME   TTY   TIME       CMD
1654    41872   41850   0    09:12   ?     00:00:04   dotnet Api.dll`;

const EVENTS_DIE =
  '2026-10-26T09:31:47.552019843Z container die 3f9c2a7e1b44 (execDuration=1153, exitCode=137, image=acme/api:2.0, name=api)';

const PS_HEALTH = `NAMES   IMAGE           STATUS
api     acme/api:2.0    Up 3 minutes (unhealthy)
db      postgres:18     Up 3 minutes (healthy)
web     acme/web:2.0    Up 8 seconds (health: starting)`;

const unit: Unit = {
  title: 'Logging & monitoring',
  blurb: 'Slice logs by time, pick a logging driver, rotate log files, and watch stats, events and health.',
  lessons: [
    {
      title: 'Logs by time',
      concept: {
        body: 'docker logs shows what a container wrote to stdout and stderr. --since and --until take a duration like 30m or a timestamp, so you can cut out one window. -n (--tail) limits lines and -t prints each line’s timestamp.',
        code: 'docker logs -t --since 2026-10-26T09:00:00 --until 2026-10-26T09:15:00 api\ndocker logs -n 50 --until 1h api',
      },
      exercises: [
        {
          kind: 'fill',
          prompt: 'Show only api’s logs from more than an hour ago.',
          code: 'docker logs --___ 1h api',
          blanks: [{ answer: ['until'], options: ['until', 'since', 'before'] }],
          hint: 'Everything up until a point in time.',
          explain: '--until 1h stops at one hour ago. --since 1h would do the opposite and show just the last hour.',
        },
        {
          kind: 'build',
          prompt: 'Show api’s logs between 09:00 and 09:15 today.',
          answer: ['docker', 'logs', '--since', '2026-10-26T09:00:00', '--until', '2026-10-26T09:15:00', 'api'],
          alt: [['docker', 'logs', '--until', '2026-10-26T09:15:00', '--since', '2026-10-26T09:00:00', 'api']],
          distractors: ['--from', '--tail'],
          hint: 'A start flag and an end flag, each with a timestamp.',
          explain: 'Both flags take RFC 3339 timestamps or relative times like 15m. A timestamp with no zone is read as your local time.',
        },
        {
          kind: 'fill',
          prompt: 'Pick the short form of --tail.',
          code: 'docker logs ___ 50 api',
          blanks: [{ answer: ['-n'], options: ['-n', '-t', '-l'] }],
          hint: 'Think number of lines.',
          explain: '-n 50 and --tail 50 are the same. -t is timestamps, which is easy to mix up.',
        },
        {
          kind: 'build',
          prompt: 'Show api’s last 3 lines, with timestamps.',
          answer: ['docker', 'logs', '-t', '-n', '3', 'api'],
          alt: [
            ['docker', 'logs', '-n', '3', '-t', 'api'],
            ['docker', 'logs', '-t', '--tail', '3', 'api'],
          ],
          distractors: ['--time', '-f'],
          hint: 'One flag for timestamps, one for the count.',
          explain: 'The timestamps are Docker’s, in UTC with nanoseconds, added when each line arrived. The app’s own log format is untouched.',
          output: LOGS_T,
        },
        {
          kind: 'fill',
          prompt: 'The app logs only to /var/log/app.log. What does docker logs show?',
          code: '# app writes to /var/log/app.log only\ndocker logs api\n# shows ___',
          blanks: [
            {
              answer: ['nothing from the app'],
              options: ['nothing from the app', 'the file’s lines', 'an error'],
            },
          ],
          hint: 'Docker only collects two streams.',
          explain: 'Docker captures stdout and stderr. Log to the console in containers, and let the logging driver decide where it goes.',
        },
        {
          kind: 'fill',
          prompt: 'Send nginx’s access log to Docker’s log stream.',
          code: 'RUN ln -sf /dev/___ /var/log/nginx/access.log',
          blanks: [{ answer: ['stdout'], options: ['stdout', 'null', 'tty'] }],
          hint: 'The stream docker logs collects.',
          explain: 'The official nginx image does exactly this, with error.log linked to /dev/stderr. An app that insists on a file still lands in docker logs.',
        },
        {
          kind: 'fill',
          prompt: 'grep misses the errors. Merge stderr into the pipe.',
          code: 'docker logs api ___ | grep fail',
          blanks: [{ answer: ['2>&1'], options: ['2>&1', '>/dev/null', '-e'] }],
          hint: 'docker logs replays stderr on your stderr.',
          explain: 'Lines the app wrote to stderr come out of docker logs on stderr too, and a pipe only carries stdout.',
          output: '2026-10-26T09:14:02.011734560Z fail: Orders[0] Payment gateway timed out',
        },
      ],
    },
    {
      title: 'Logging drivers',
      concept: {
        body: 'A logging driver decides where container output goes. json-file is the default; local stores compressed, rotated files; journald and syslog hand logs to the host’s system log; none keeps nothing. --log-driver picks one per container.',
        code: 'docker info --format \'{{.LoggingDriver}}\'\ndocker run -d --log-driver local acme/api:2.0',
      },
      exercises: [
        {
          kind: 'fill',
          prompt: 'Print the daemon’s default logging driver.',
          code: 'docker info --format \'{{.___}}\'',
          blanks: [{ answer: ['LoggingDriver'], options: ['LoggingDriver', 'LogDriver', 'Logging'] }],
          hint: 'Two words run together, the second one Driver.',
          explain: 'json-file is the out-of-the-box default. It writes one JSON object per line under /var/lib/docker/containers/.',
          output: 'json-file',
        },
        {
          kind: 'build',
          prompt: 'Run acme/api:2.0 detached with the local driver.',
          answer: ['docker', 'run', '-d', '--log-driver', 'local', 'acme/api:2.0'],
          alt: [['docker', 'run', '--log-driver', 'local', '-d', 'acme/api:2.0']],
          distractors: ['--logging', 'json'],
          hint: 'The flag names the driver, then its name.',
          explain: 'local uses a compact format and rotates by default (20 MB × 5 files), so it suits most single hosts better than json-file.',
        },
        {
          kind: 'fill',
          prompt: 'Send api’s logs to systemd’s journal.',
          code: 'docker run -d --log-driver ___ --name api acme/api:2.0\njournalctl CONTAINER_NAME=api',
          blanks: [{ answer: ['journald'], options: ['journald', 'systemd', 'syslog'] }],
          hint: 'The journal’s daemon name.',
          explain: 'journald tags each entry with fields like CONTAINER_NAME and CONTAINER_ID, so journalctl can filter by container.',
        },
        {
          kind: 'build',
          prompt: 'Ship logs to the syslog server at 10.0.0.5 over UDP.',
          answer: ['--log-driver', 'syslog', '--log-opt', 'syslog-address=udp://10.0.0.5:514'],
          distractors: ['--syslog', 'address=10.0.0.5'],
          hint: 'Driver first, then an option with a full address.',
          explain: 'syslog-address takes udp://, tcp:// or tcp+tls://. 514 is syslog’s standard port.',
        },
        {
          kind: 'fill',
          prompt: 'Check which driver api is using.',
          code: 'docker inspect -f \'{{.HostConfig.LogConfig.___}}\' api',
          blanks: [{ answer: ['Type'], options: ['Type', 'Driver', 'Name'] }],
          hint: 'LogConfig has a Type and a Config.',
          explain: 'LogConfig.Config holds the options, like max-size. Each container keeps the driver it was created with.',
          output: 'local',
        },
        {
          kind: 'fill',
          prompt: 'Tag each syslog line with the container’s name.',
          code: '--log-driver syslog --log-opt tag="{{.___}}"',
          blanks: [{ answer: ['Name'], options: ['Name', 'Image', 'ID'] }],
          hint: 'Which field says which container it is?',
          explain: 'tag is a Go template. {{.ID}} gives the short container ID instead, and {{.ImageName}} the image.',
        },
        {
          kind: 'fill',
          prompt: 'A batch job’s output is pure noise. Keep none of it.',
          code: 'docker run --rm --log-driver ___ acme/report:1.3',
          blanks: [{ answer: ['none'], options: ['none', 'null', 'off'] }],
          hint: 'The driver named after what it keeps.',
          explain: 'With none, nothing is stored, so docker logs has nothing to show you. Use it only when you’re sure you won’t need to debug.',
        },
      ],
    },
    {
      title: 'Rotation & daemon.json',
      concept: {
        body: 'json-file never rotates on its own, so logs can fill a disk. max-size caps each file and max-file sets how many are kept. Set defaults for new containers in /etc/docker/daemon.json (values are strings) and restart Docker, or set logging: per service in Compose.',
        code: '{\n  "log-driver": "json-file",\n  "log-opts": { "max-size": "10m", "max-file": "3" }\n}',
      },
      exercises: [
        {
          kind: 'order',
          prompt: 'Write daemon.json: driver, then max-size, then max-file.',
          lines: [
            '{',
            '  "log-driver": "local",',
            '  "log-opts": {',
            '    "max-size": "10m",',
            '    "max-file": "3"',
            '  }',
            '}',
          ],
          hint: 'The options nest inside log-opts.',
          explain: 'Each container now gets at most 3 files of 10 MB. Restart Docker to load the file; running containers keep their settings.',
        },
        {
          kind: 'fill',
          prompt: 'Type the missing word to cap each log file at 20 MB.',
          code: 'docker run -d --log-opt max-___=20m acme/api:2.0',
          blanks: [{ answer: ['size'] }],
          hint: 'max- what?',
          explain: 'Sizes take k, m or g. Once a file reaches the cap it’s rotated, and the oldest beyond max-file is deleted.',
        },
        {
          kind: 'build',
          prompt: 'Keep 5 files of 10 MB for this one container.',
          answer: ['--log-opt', 'max-size=10m', '--log-opt', 'max-file=5'],
          alt: [['--log-opt', 'max-file=5', '--log-opt', 'max-size=10m']],
          distractors: ['--log-max', 'max-files=5'],
          hint: 'One --log-opt per option.',
          explain: 'Per-container --log-opt beats daemon.json. max-file only matters once max-size is set.',
        },
        {
          kind: 'order',
          prompt: 'Rotate api’s logs in Compose: driver, then options.',
          lines: [
            'services:',
            '  api:',
            '    image: acme/api:2.0',
            '    logging:',
            '      driver: json-file',
            '      options:',
            '        max-size: "10m"',
          ],
          hint: 'driver and options are siblings under logging.',
          explain: 'Compose passes these as --log-driver and --log-opt. Quote the values so YAML keeps them as strings.',
        },
        {
          kind: 'fill',
          prompt: 'Gzip json-file’s rotated files. Type the value.',
          code: '"log-opts": {\n  "max-size": "10m",\n  "max-file": "3",\n  "compress": "___"\n}',
          blanks: [{ answer: ['true'] }],
          hint: 'A yes, written as a string.',
          explain: 'compress gzips every rotated file except the current one. The local driver compresses on its own.',
        },
        {
          kind: 'fix',
          prompt: 'Docker won’t start after this edit. Fix the value.',
          code: '{\n  "log-driver": "json-file",\n  "log-opts": {\n    "max-size": "10m",\n    "max-file": [[3]]\n  }\n}',
          fix: '"3"',
          options: ['"3"', '3.0', 'three'],
          hint: 'Every value in log-opts is a string.',
          explain: 'The daemon rejects non-string log-opts and refuses to start. journalctl -u docker shows the error.',
        },
        {
          kind: 'fill',
          prompt: 'You edited daemon.json and restarted. What about running api?',
          code: '# daemon.json now sets max-size 10m\nsudo systemctl restart docker\n# api, created last week, ___',
          blanks: [
            {
              answer: ['keeps its old log settings'],
              options: ['keeps its old log settings', 'switches to max-size 10m', 'loses its logs'],
            },
          ],
          hint: 'Log settings are fixed when a container is created.',
          explain: 'Recreate it (docker compose up -d --force-recreate, or rm and run) to pick up the new defaults.',
        },
      ],
    },
    {
      title: 'stats, top & events',
      concept: {
        body: 'docker stats --no-stream --format picks columns like {{.Name}}, {{.CPUPerc}} and {{.MemUsage}}; start the template with table for headers. docker top lists a container’s processes. docker events (or docker system events) streams what the daemon does, and --filter narrows it.',
        code: 'docker stats --no-stream --format "table {{.Name}}\\t{{.MemUsage}}"\ndocker top api\ndocker events --filter event=die',
      },
      exercises: [
        {
          kind: 'build',
          prompt: 'One snapshot of each container’s name and memory.',
          answer: ['docker', 'stats', '--no-stream', '--format', '"table {{.Name}}\\t{{.MemUsage}}"'],
          alt: [['docker', 'stats', '--format', '"table {{.Name}}\\t{{.MemUsage}}"', '--no-stream']],
          distractors: ['"{{.Memory}}"', '--once'],
          hint: 'Snapshot flag, then a table template.',
          explain: 'table adds the header row and lines up columns. Without --no-stream it would keep redrawing every second.',
          output: STATS_MEM,
        },
        {
          kind: 'fill',
          prompt: 'Type the field for CPU percentage.',
          code: 'docker stats --no-stream --format "table {{.Name}}\\t{{.CPU___}}\\t{{.MemPerc}}"',
          blanks: [{ answer: ['Perc'] }],
          hint: 'Same ending as MemPerc.',
          explain: 'CPU % can go past 100% on a multi-core host: 200% means two whole cores.',
          output: STATS_CPU,
        },
        {
          kind: 'build',
          prompt: 'List the processes running inside api.',
          answer: ['docker', 'top', 'api'],
          alt: [['docker', 'container', 'top', 'api']],
          distractors: ['ps', 'exec'],
          hint: 'Like the Linux command that lists busy processes.',
          explain: 'top works from the host, so it needs no ps in the image. PIDs are host PIDs, and UID 1654 is the .NET app user.',
          output: TOP_API,
        },
        {
          kind: 'order',
          prompt: 'Order the events for docker run -d, then docker stop.',
          lines: [
            'container create',
            'network connect',
            'container start',
            'container kill (signal=15)',
            'network disconnect',
            'container die',
            'container stop',
          ],
          hint: 'stop sends a signal first; stop itself is logged last.',
          explain: 'docker stop sends SIGTERM (the kill event). When the process exits, Docker detaches the network and logs die, then records the stop.',
        },
        {
          kind: 'fill',
          prompt: 'Type the filter key to watch only api.',
          code: 'docker events --filter ___=api',
          blanks: [{ answer: ['container'] }],
          hint: 'What kind of thing is api?',
          explain: 'Filters with different keys combine with AND; repeating a key, like two event= filters, means either.',
        },
        {
          kind: 'build',
          prompt: 'Show container deaths from the last hour, then exit.',
          answer: ['docker', 'events', '--filter', 'event=die', '--since', '1h', '--until', '0s'],
          distractors: ['--no-stream', 'event=stop'],
          hint: 'A start and an end, so it doesn’t wait for more.',
          explain: 'With --until, events prints the past window and exits. exitCode=137 here points at a kill or OOM.',
          output: EVENTS_DIE,
        },
        {
          kind: 'fix',
          prompt: 'This template errors. Fix the memory field.',
          code: 'docker stats --no-stream --format "{{.Name}}: {{.[[Memory]]}}"',
          fix: 'MemUsage',
          options: ['MemUsage', 'Mem', 'RAM'],
          hint: 'The field shows usage over limit.',
          explain: 'stats fields are .Name, .ID, .CPUPerc, .MemUsage, .MemPerc, .NetIO, .BlockIO and .PIDs.',
          output: 'api: 182.4MiB / 512MiB\ndb: 96.1MiB / 7.66GiB\nweb: 9.8MiB / 7.66GiB',
        },
      ],
    },
    {
      title: 'Health & metrics',
      concept: {
        body: 'A healthcheck’s result shows in docker ps as (healthy), (unhealthy) or (health: starting), and --filter health= finds them. For graphs, cAdvisor exports every container’s CPU, memory and network as Prometheus metrics at :8080/metrics. Docker itself can too, with metrics-addr in daemon.json.',
        code: 'docker ps --filter health=unhealthy\n# prometheus.yml\nscrape_configs:\n  - job_name: cadvisor\n    static_configs:\n      - targets: ["cadvisor:8080"]',
      },
      exercises: [
        {
          kind: 'fill',
          prompt: 'web started 8 seconds ago. Read its STATUS.',
          code: `${PS_HEALTH}\n# web’s healthcheck has ___`,
          blanks: [
            {
              answer: ['not passed yet'],
              options: ['not passed yet', 'failed', 'no test'],
            },
          ],
          hint: 'starting is not a verdict.',
          explain: 'A container stays in starting until a check passes, or until enough fail after the start period to call it unhealthy.',
        },
        {
          kind: 'type',
          prompt: 'List only the unhealthy containers.',
          accept: ['docker ps --filter health=unhealthy', 'docker ps -f health=unhealthy', 'docker container ls --filter health=unhealthy'],
          hint: 'ps with a health filter.',
          explain: 'health also takes healthy, starting or none. A cron job running this is a cheap alarm.',
          output: 'NAMES   IMAGE          STATUS\napi     acme/api:2.0   Up 3 minutes (unhealthy)',
        },
        {
          kind: 'build',
          prompt: 'Print api’s last health check results as JSON.',
          answer: ['docker', 'inspect', '--format', "'{{json .State.Health}}'", 'api'],
          distractors: ["'{{json .Health}}'", 'logs'],
          hint: 'Health lives under State.',
          explain: 'You get Status, FailingStreak and Log, the last five checks with each exit code and output: the place to see why it fails.',
          output: '{"Status":"unhealthy","FailingStreak":4,"Log":[{"Start":"2026-10-26T09:31:40.118294511Z","End":"2026-10-26T09:31:40.203517826Z","ExitCode":1,"Output":"wget: server returned error: HTTP/1.1 503 Service Unavailable\\n"}]}',
        },
        {
          kind: 'order',
          prompt: 'Have Prometheus scrape cAdvisor.',
          lines: ['scrape_configs:', '  - job_name: cadvisor', '    static_configs:', '      - targets: ["cadvisor:8080"]'],
          hint: 'A job, its static config, then its targets.',
          explain: 'Prometheus pulls /metrics from each target every scrape interval. On a shared network, cadvisor resolves by service name.',
        },
        {
          kind: 'fill',
          prompt: 'Type the path Prometheus scrapes by default.',
          code: 'curl -s http://localhost:8080/___ | grep container_memory_usage_bytes',
          blanks: [{ answer: ['metrics'] }],
          hint: 'What it exports.',
          explain: 'Each line is a metric, labels and a value. cAdvisor labels them with the container name, so you can graph api alone.',
          output: 'container_memory_usage_bytes{id="/docker/3f9c2a7e1b44",name="api"} 1.91264768e+08',
        },
        {
          kind: 'fix',
          prompt: 'Docker won’t start. Fix the metrics key.',
          code: '{\n  "[[metrics-address]]": "127.0.0.1:9323"\n}',
          fix: 'metrics-addr',
          options: ['metrics-addr', 'metrics', 'prometheus'],
          hint: 'The key is abbreviated.',
          explain: 'metrics-addr makes the daemon serve its own Prometheus metrics at /metrics: builds, containers and engine counts.',
        },
        {
          kind: 'type',
          prompt: 'Show each container’s name and CPU % once.',
          accept: [
            'docker stats --no-stream --format "{{.Name}} {{.CPUPerc}}"',
            "docker stats --no-stream --format '{{.Name}} {{.CPUPerc}}'",
            'docker stats --no-stream --format "table {{.Name}}\\t{{.CPUPerc}}"',
            "docker stats --no-stream --format 'table {{.Name}}\\t{{.CPUPerc}}'",
            'docker stats --format "{{.Name}} {{.CPUPerc}}" --no-stream',
          ],
          hint: 'stats, a snapshot flag and a two-field template.',
          explain: 'A quick check needs no Prometheus. Pipe it to sort -k2 -rn to find the busiest container.',
          output: 'api 12.41%\ndb 1.07%\nweb 0.02%',
        },
      ],
    },
  ],
  boss: [
    {
      kind: 'build',
      prompt: 'Timestamps, from 09:00 to 09:15, of api’s logs.',
      answer: ['docker', 'logs', '-t', '--since', '2026-10-26T09:00:00', '--until', '2026-10-26T09:15:00', 'api'],
      alt: [['docker', 'logs', '-t', '--until', '2026-10-26T09:15:00', '--since', '2026-10-26T09:00:00', 'api']],
      distractors: ['--tail', '--from'],
      hint: 'Timestamps flag, start, end, container.',
      explain: 'Cutting a window around an incident beats scrolling, and -t lets you line it up with other services’ logs.',
      output: LOGS_T,
    },
    {
      kind: 'fix',
      prompt: 'Compose rejects this. Fix the key.',
      code: 'services:\n  api:\n    image: acme/api:2.0\n    logging:\n      driver: local\n      [[log-opts]]:\n        max-size: "10m"',
      fix: 'options',
      options: ['options', 'opts', 'log_opts'],
      hint: 'daemon.json and Compose name it differently.',
      explain: 'daemon.json says log-opts; Compose’s logging block says options. Both end up as --log-opt for the container.',
    },
    {
      kind: 'fill',
      prompt: 'Logs filled the disk. Which default was to blame?',
      code: '# /var/lib/docker/containers/3f9c…/3f9c…-json.log: 41G\n# json-file’s default max-size is ___',
      blanks: [{ answer: ['unlimited'], options: ['unlimited', '10m', '100m'] }],
      hint: 'json-file doesn’t rotate unless told to.',
      explain: 'Set max-size and max-file in daemon.json, or switch the default to local, which rotates out of the box.',
    },
    {
      kind: 'order',
      prompt: 'Make local the default with rotation, then apply it.',
      lines: [
        'sudo nano /etc/docker/daemon.json',
        '# "log-driver": "local", "log-opts": { "max-size": "10m" }',
        'sudo systemctl restart docker',
        'docker compose up -d --force-recreate',
      ],
      hint: 'Edit, restart the daemon, recreate the containers.',
      explain: 'The daemon reads daemon.json at start, and containers pick up log settings only when they’re created.',
    },
    {
      kind: 'type',
      prompt: 'Follow api’s logs, starting from the last 20 lines.',
      accept: ['docker logs -f -n 20 api', 'docker logs -n 20 -f api', 'docker logs -f --tail 20 api', 'docker logs --tail 20 -f api'],
      hint: 'Follow plus a line count.',
      explain: 'Without -n, -f first replays the whole log, which on a busy service can be millions of lines.',
    },
    {
      kind: 'fill',
      prompt: 'Which driver keeps docker logs working and rotates by default?',
      code: 'docker run -d --log-driver ___ acme/api:2.0',
      blanks: [{ answer: ['local'], options: ['local', 'json-file', 'none'] }],
      hint: 'Its name says the logs stay on this host.',
      explain: 'local keeps 5 files of 20 MB, compressed. json-file is the default only for backward compatibility.',
    },
    {
      kind: 'build',
      prompt: 'Watch for containers killed by running out of memory.',
      answer: ['docker', 'events', '--filter', 'type=container', '--filter', 'event=oom'],
      alt: [['docker', 'events', '--filter', 'event=oom', '--filter', 'type=container']],
      distractors: ['event=die', '--no-stream'],
      hint: 'Two filters: the type, then the event.',
      explain: 'An oom event fires when the kernel kills a process for going over its limit, just before the die event with exitCode=137.',
    },
    {
      kind: 'fix',
      prompt: 'This prints nothing about health. Fix the filter.',
      code: 'docker ps --filter [[status]]=unhealthy',
      fix: 'health',
      options: ['health', 'state', 'check'],
      hint: 'status filters running, exited and so on.',
      explain: 'status takes created, running, paused, exited and the like. health takes healthy, unhealthy, starting or none.',
      output: 'NAMES   IMAGE          STATUS\napi     acme/api:2.0   Up 3 minutes (unhealthy)',
    },
    {
      kind: 'fill',
      prompt: 'Let Prometheus scrape the Docker daemon itself.',
      code: '# /etc/docker/daemon.json\n{\n  "___": "127.0.0.1:9323"\n}',
      blanks: [{ answer: ['metrics-addr'], options: ['metrics-addr', 'log-opts', 'hosts'] }],
      hint: 'Where metrics are served.',
      explain: 'Keep it on 127.0.0.1, or a private address: the endpoint has no authentication.',
    },
    {
      kind: 'type',
      prompt: 'List the processes inside the db container.',
      accept: ['docker top db', 'docker container top db', 'docker compose top db'],
      hint: 'Same word as the Linux tool.',
      explain: 'Postgres runs one process per connection plus background workers, so docker top db shows several postgres lines.',
    },
  ],
};

export default unit;
