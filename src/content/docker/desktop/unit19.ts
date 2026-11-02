import type { DesktopUnit } from '../../../engine/types';

// Desktop edition: write-the-code challenges for Docker unit 19 (Logging & monitoring).
// lessons[i] runs after lesson i + 1. See docs/CONTENT_GUIDE.md.

/** Regex source: inside the YAML block `name`, some line starts with `line`. Any key order. Use flags 'm'. */
const inBlock = (name: string, line: string) =>
  `^([ \\t]*)${name}:[ \\t]*\\n(?:\\1[ \\t]+.*\\n|[ \\t]*\\n)*?\\1[ \\t]+${line}`;

/** Regex source for a Go template field, spaces allowed inside the braces. */
const field = (f: string) => `\\{\\{\\s*${f.replace(/\./g, '\\.')}\\s*\\}\\}`;

const unit: DesktopUnit = {
  lessons: [
    // L1 Logs by time
    [
      {
        kind: 'write',
        prompt: 'Show api’s logs from 09:00 to 09:15 on 30 Oct 2026 with timestamps, then its last 50 lines.',
        starter: '',
        solution: 'docker logs -t --since 2026-10-30T09:00:00 --until 2026-10-30T09:15:00 api\ndocker logs -n 50 api',
        checks: [
          { label: '--since 2026-10-30T09:00:00', re: 'docker\\s+(container\\s+)?logs\\s[^\\n]*--since[\\s=]+["\']?2026-10-30T09:00(:00)?' },
          { label: '--until 2026-10-30T09:15:00', re: 'logs\\s[^\\n]*--until[\\s=]+["\']?2026-10-30T09:15(:00)?' },
          { label: 'Timestamps with -t on that command', re: 'logs(?=[^\\n]*--since)[^\\n]*(\\s-t\\b|--timestamps\\b)' },
          { label: 'The last 50 lines with -n 50 (or --tail 50)', re: 'docker\\s+(container\\s+)?logs\\s[^\\n]*(-n|--tail)[\\s=]+50\\b[^\\n]*\\bapi\\b|docker\\s+(container\\s+)?logs\\s+api\\s[^\\n]*(-n|--tail)[\\s=]+50\\b' },
        ],
        hint: 'Timestamps are written YYYY-MM-DDTHH:MM:SS. All flags go before the container name.',
        explain: 'Cutting a window with --since and --until beats scrolling. -t adds the time Docker received each line.',
        output:
          '2026-10-30T09:02:11.418273906Z info: Request GET /orders 200 in 14ms\n2026-10-30T09:07:45.902114387Z warn: Slow query on orders (812ms)\n2026-10-30T09:13:20.155720431Z fail: Payment gateway timeout\n…',
      },
      {
        kind: 'write',
        prompt: 'Find ERROR lines in worker’s last 30 minutes, then follow only new lines.',
        starter: '',
        solution: 'docker logs --since 30m worker 2>&1 | Select-String "ERROR"\ndocker logs -f -n 0 -t worker',
        checks: [
          { label: 'Logs from the last 30 minutes: --since 30m', re: 'docker\\s+(container\\s+)?logs\\s[^\\n]*--since[\\s=]+["\']?30m\\b' },
          { label: 'Include stderr with 2>&1', re: 'logs\\s[^\\n]*2>&1' },
          { label: 'Filter with Select-String (or findstr) for ERROR', re: '\\|\\s*(Select-String|sls|findstr|grep)\\s+(-Pattern\\s+)?["\']?ERROR' },
          { label: 'Follow with -f, starting from -n 0', re: 'logs(?=[^\\n]*(\\s-f\\b|--follow\\b))(?=[^\\n]*(-n|--tail)[\\s=]+0\\b)' },
        ],
        hint: 'Errors often go to stderr, which a pipe skips unless you redirect it. -n 0 skips the history.',
        explain: 'docker logs replays stdout and stderr separately, so 2>&1 merges them before the filter. -f -n 0 shows only what comes next.',
        output:
          '2026-10-30 10:41:07 ERROR job 8812 failed: connection refused (db:5432)\n2026-10-30 10:52:33 ERROR job 8840 failed: connection refused (db:5432)',
      },
    ],
    // L2 Logging drivers
    [
      {
        kind: 'write',
        prompt: 'Check the default log driver, run acme/api:2.0 with local, then confirm its driver.',
        starter: '',
        solution:
          "docker info --format '{{.LoggingDriver}}'\ndocker run -d --name api --log-driver local acme/api:2.0\ndocker inspect -f '{{.HostConfig.LogConfig.Type}}' api",
        checks: [
          { label: "docker info --format '{{.LoggingDriver}}'", re: `docker\\s+(system\\s+)?info\\s+(-f|--format)[\\s=]+["']${field('.LoggingDriver')}["']` },
          { label: 'Run with --log-driver local', re: 'run\\s[^\\n]*--log-driver[\\s=]+local\\b[^\\n]*acme/api:2\\.0' },
          { label: 'Print {{.HostConfig.LogConfig.Type}}', re: field('.HostConfig.LogConfig.Type') },
        ],
        hint: 'The daemon’s default is in docker info. The container’s own choice is under HostConfig.LogConfig.',
        explain: 'json-file is the default, but each container keeps the driver it was created with. local stores compressed, rotated files.',
        output: 'json-file\n0b7d3e9a1c5f8b2d4e6a0c9f1b3d5e7a2c4f6b8d0e1a3c5f7b9d2e4a6c8f0b1d\nlocal',
      },
      {
        kind: 'write',
        prompt: 'In Compose, store api’s logs with local and keep no logs for the noisy poller.',
        starter: 'services:\n  api:\n    image: acme/api:2.0\n  poller:\n    image: acme/poller:1.1\n',
        solution:
          'services:\n  api:\n    image: acme/api:2.0\n    logging:\n      driver: local\n  poller:\n    image: acme/poller:1.1\n    logging:\n      driver: none',
        checks: [
          { label: 'api: logging: driver: local', re: inBlock('api', 'logging:\\s*(\\{\\s*|\\n[ \\t]+)driver:\\s*["\']?local\\b'), flags: 'm' },
          { label: 'poller: logging: driver: none', re: inBlock('poller', 'logging:\\s*(\\{\\s*|\\n[ \\t]+)driver:\\s*["\']?none\\b'), flags: 'm' },
        ],
        hint: 'logging: holds driver: (and options:), inside each service.',
        explain: 'logging: driver is --log-driver in Compose. With none, docker logs poller has nothing to show, so save it for chatter you never read.',
      },
    ],
    // L3 Rotation & daemon.json
    [
      {
        kind: 'write',
        prompt: 'Write daemon.json so new containers use json-file, rotated at 10 MB, keeping 3 files.',
        starter: '',
        solution: '{\n  "log-driver": "json-file",\n  "log-opts": {\n    "max-size": "10m",\n    "max-file": "3"\n  }\n}',
        checks: [
          { label: '"log-driver": "json-file"', re: '"log-driver"\\s*:\\s*"json-file"' },
          { label: 'A "log-opts" object', re: '"log-opts"\\s*:\\s*\\{' },
          { label: '"max-size": "10m", as a string', re: '"log-opts"\\s*:\\s*\\{[^}]*"max-size"\\s*:\\s*"10m"' },
          { label: '"max-file": "3", as a string', re: '"log-opts"\\s*:\\s*\\{[^}]*"max-file"\\s*:\\s*"3"' },
        ],
        hint: 'Every log-opts value is a JSON string, even the number of files.',
        explain: 'Docker rejects numbers in log-opts and won’t start. The defaults only apply to containers created after you restart Docker.',
      },
      {
        kind: 'write',
        prompt: 'Cap logs per service: api keeps 5 files of 20 MB, worker 2 files of 5 MB.',
        starter: 'services:\n  api:\n    image: acme/api:2.0\n  worker:\n    image: acme/worker:1.4\n',
        solution:
          'services:\n  api:\n    image: acme/api:2.0\n    logging:\n      driver: json-file\n      options:\n        max-size: "20m"\n        max-file: "5"\n  worker:\n    image: acme/worker:1.4\n    logging:\n      driver: json-file\n      options:\n        max-size: "5m"\n        max-file: "2"',
        checks: [
          { label: 'api: max-size 20m', re: inBlock('api', 'logging:[\\s\\S]*?options:[\\s\\S]*?max-size:\\s*["\']?20m\\b'), flags: 'm' },
          { label: 'api: max-file 5', re: inBlock('api', 'logging:[\\s\\S]*?options:[\\s\\S]*?max-file:\\s*["\']?5\\b'), flags: 'm' },
          { label: 'worker: max-size 5m and max-file 2', re: inBlock('worker', 'logging:[\\s\\S]*?options:(?=[\\s\\S]*?max-size:\\s*["\']?5m\\b)[\\s\\S]*?max-file:\\s*["\']?2\\b'), flags: 'm' },
          { label: 'Quote the values so they stay strings', re: '^(?![\\s\\S]*max-(size|file):[ \\t]*\\d+[ \\t]*(\\n|$))' },
        ],
        hint: 'logging: holds driver: and options:. Quote "5" and "2" so YAML doesn’t turn them into numbers.',
        explain: 'Per-service options beat the daemon defaults. Compose passes them straight to the driver, which wants strings.',
      },
    ],
    // L4 stats, top & events
    [
      {
        kind: 'write',
        prompt: 'Snapshot name, CPU and memory as a table, then list api’s processes.',
        starter: '',
        solution: 'docker stats --no-stream --format "table {{.Name}}\\t{{.CPUPerc}}\\t{{.MemUsage}}"\ndocker top api',
        checks: [
          { label: 'docker stats --no-stream', re: 'docker\\s+(container\\s+)?stats\\s[^\\n]*--no-stream\\b' },
          { label: 'A --format that starts with table', re: 'stats\\s[^\\n]*--format[\\s=]+["\']table\\s' },
          { label: 'Columns {{.Name}}, {{.CPUPerc}} and {{.MemUsage}}', re: `--format[^\\n]*(?=[^\\n]*${field('.Name')})(?=[^\\n]*${field('.CPUPerc')})(?=[^\\n]*${field('.MemUsage')})` },
          { label: 'docker top api', re: 'docker\\s+(container\\s+)?top\\s+api\\b' },
        ],
        hint: 'Separate the columns with \\t. table adds a header row.',
        explain: 'A custom table shows just what you need. docker top runs ps against the container’s processes from the host side.',
        output:
          'NAME      CPU %     MEM USAGE / LIMIT\napi       3.12%     142.6MiB / 512MiB\ndb        0.84%     61.2MiB / 7.66GiB\nUID    PID     PPID    C    STIME   TTY   TIME       CMD\n1654   24518   24497   1    09:12   ?     00:00:41   dotnet Api.dll',
      },
      {
        kind: 'write',
        prompt: 'List deaths and OOM kills from the last hour as name and exit code, then exit.',
        starter: '',
        solution:
          'docker events --since 1h --until 0s --filter event=die --filter event=oom --format "{{.Actor.Attributes.name}} {{.Actor.Attributes.exitCode}}"',
        checks: [
          { label: 'docker events with --since 1h', re: 'docker\\s+(system\\s+)?events\\s[^\\n]*--since[\\s=]+["\']?1h\\b' },
          { label: '--until so it exits instead of waiting', re: 'events\\s[^\\n]*--until[\\s=]+\\S+' },
          { label: 'Two filters: event=die and event=oom', re: 'events\\s(?=[^\\n]*--filter[\\s=]+["\']?event=die\\b)(?=[^\\n]*--filter[\\s=]+["\']?event=oom\\b)' },
          { label: 'Format {{.Actor.Attributes.name}} and {{.Actor.Attributes.exitCode}}', re: `--format[^\\n]*(?=[^\\n]*${field('.Actor.Attributes.name')})(?=[^\\n]*${field('.Actor.Attributes.exitCode')})` },
        ],
        hint: 'Repeating a filter key means either. The event’s details are under .Actor.Attributes.',
        explain: 'An oom event has no exit code, so it prints <no value>; the die right after it says 137. Together they confirm an out-of-memory kill.',
        output: 'importer <no value>\nimporter 137\nmailer 1',
      },
    ],
    // L5 Health & metrics
    [
      {
        kind: 'write',
        prompt: 'List unhealthy containers, then print api’s health details as JSON.',
        starter: '',
        solution: "docker ps --filter health=unhealthy\ndocker inspect -f '{{json .State.Health}}' api",
        checks: [
          { label: 'docker ps --filter health=unhealthy', re: 'docker\\s+(ps|container\\s+ls)\\s[^\\n]*--filter[\\s=]+["\']?health=unhealthy\\b' },
          { label: "Print '{{json .State.Health}}'", re: '\\{\\{\\s*json\\s+\\.State\\.Health\\s*\\}\\}' },
          { label: 'Inspect api', re: 'inspect\\s[^\\n]*\\sapi\\s*$', flags: 'm' },
        ],
        hint: 'Health is part of the container’s state. json prints the check log too.',
        explain: 'State.Health holds the status, the failing streak and the last few check results with their output.',
        output:
          'CONTAINER ID   IMAGE          COMMAND             CREATED       STATUS                     PORTS                    NAMES\n3f9c2a7e1b44   acme/api:2.0   "dotnet Api.dll"    2 hours ago   Up 2 hours (unhealthy)     0.0.0.0:8080->8080/tcp   api\n{"Status":"unhealthy","FailingStreak":4,"Log":[{"Start":"2026-10-30T10:58:01.11Z","End":"2026-10-30T10:58:04.12Z","ExitCode":1,"Output":"curl: (28) Operation timed out"}]}',
      },
      {
        kind: 'write',
        prompt: 'Write prometheus.yml: scrape cAdvisor and the Docker engine every 15 seconds.',
        starter: '# daemon.json has "metrics-addr": "0.0.0.0:9323"\n',
        solution:
          '# daemon.json has "metrics-addr": "0.0.0.0:9323"\nglobal:\n  scrape_interval: 15s\nscrape_configs:\n  - job_name: cadvisor\n    static_configs:\n      - targets: ["cadvisor:8080"]\n  - job_name: docker\n    static_configs:\n      - targets: ["host.docker.internal:9323"]',
        checks: [
          { label: 'global: scrape_interval: 15s', re: '^global:\\s*\\n[ \\t]+scrape_interval:\\s*["\']?15s\\b', flags: 'm' },
          { label: 'A scrape_configs: list', re: '^scrape_configs:\\s*\\n[ \\t]*-', flags: 'm' },
          { label: 'A cadvisor job with target cadvisor:8080', re: 'job_name:\\s*["\']?cadvisor["\']?\\s*\\n[\\s\\S]*?targets:[^\\n]*cadvisor:8080' },
          { label: 'A docker job on port 9323', re: 'job_name:\\s*["\']?[\\w-]+["\']?\\s*\\n[\\s\\S]*?targets:[^\\n]*:9323\\b' },
        ],
        hint: 'Each job has a job_name and static_configs with a targets list of host:port.',
        explain: 'Prometheus pulls /metrics from each target. cAdvisor reports per-container use; the engine reports its own builds and container counts.',
      },
    ],
  ],
  // Windows PowerShell versions of shared items (the phone keeps the bash ones).
  concepts: {
    3: {
      body: 'json-file never rotates on its own, so logs can fill a disk. max-size caps each file and max-file sets how many are kept. On Docker Desktop, set defaults for new containers in daemon.json under Settings → Docker Engine (values are strings) and apply, which restarts Docker, or set logging: per service in Compose.',
      code: '{\n  "log-driver": "json-file",\n  "log-opts": { "max-size": "10m", "max-file": "3" }\n}',
    },
  },
  overrides: {
    'L1.7': {
      kind: 'fill',
      prompt: 'Select-String misses the errors. Merge stderr into the pipe.',
      code: 'docker logs api ___ | Select-String fail',
      blanks: [{ answer: ['2>&1'], options: ['2>&1', '>$null', '-e'] }],
      hint: 'docker logs replays stderr on your stderr.',
      explain: 'Lines the app wrote to stderr come out of docker logs on stderr too, and a PowerShell pipe only carries stdout. Select-String is PowerShell’s grep.',
      output: '2026-10-26T09:14:02.011734560Z fail: Orders[0] Payment gateway timed out',
    },
    'L3.7': {
      kind: 'fill',
      prompt: 'You edited daemon.json and restarted. What about running api?',
      code: '# daemon.json now sets max-size 10m\ndocker desktop restart\n# api, created last week, ___',
      blanks: [
        {
          answer: ['keeps its old log settings'],
          options: ['keeps its old log settings', 'switches to max-size 10m', 'loses its logs'],
        },
      ],
      hint: 'Log settings are fixed when a container is created.',
      explain: 'Recreate it (docker compose up -d --force-recreate, or rm and run) to pick up the new defaults.',
    },
    'L5.5': {
      kind: 'fill',
      prompt: 'Type the path Prometheus scrapes by default.',
      code: 'curl.exe -s http://localhost:8080/___ | Select-String container_memory_usage_bytes',
      blanks: [{ answer: ['metrics'] }],
      hint: 'What it exports.',
      explain: 'Each line is a metric, labels and a value. cAdvisor labels them with the container name, so you can graph api alone.',
      output: 'container_memory_usage_bytes{id="/docker/3f9c2a7e1b44",name="api"} 1.91264768e+08',
    },
    'boss.4': {
      kind: 'order',
      prompt: 'Make local the default with rotation, then apply it.',
      lines: [
        'notepad $env:USERPROFILE\\.docker\\daemon.json',
        '# "log-driver": "local", "log-opts": { "max-size": "10m" }',
        'docker desktop restart',
        'docker compose up -d --force-recreate',
      ],
      hint: 'Edit, restart the daemon, recreate the containers.',
      explain: 'The daemon reads daemon.json at start (Settings → Docker Engine edits the same file), and containers pick up log settings only when they’re created.',
    },
    'boss.9': {
      kind: 'fill',
      prompt: 'Let Prometheus scrape the Docker daemon itself.',
      code: '# daemon.json (Docker Desktop: Settings → Docker Engine)\n{\n  "___": "127.0.0.1:9323"\n}',
      blanks: [{ answer: ['metrics-addr'], options: ['metrics-addr', 'log-opts', 'hosts'] }],
      hint: 'Where metrics are served.',
      explain: 'Keep it on 127.0.0.1, or a private address: the endpoint has no authentication.',
    },
  },
};

export default unit;
